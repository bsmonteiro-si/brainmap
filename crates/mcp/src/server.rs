use std::sync::{Arc, Mutex};

use brainmap_core::workspace::Workspace;
use tracing::{info, warn};
use rmcp::model::{
    CallToolResult, Content, Implementation, ListResourcesResult, ListToolsResult,
    PaginatedRequestParam, RawResource, ReadResourceRequestParam, ReadResourceResult,
    ResourceContents, ResourcesCapability, ServerCapabilities, ServerInfo,
};
use rmcp::service::RequestContext;
use rmcp::Error as McpError;
use rmcp::ServerHandler;

use crate::tools;

const NODES_URI_PREFIX: &str = "brainmap://nodes/";
const GRAPH_URI: &str = "brainmap://graph";
const CONFIG_URI: &str = "brainmap://config";

#[derive(Clone)]
pub struct BrainMapMcp {
    workspace: Arc<Mutex<Workspace>>,
}

impl BrainMapMcp {
    pub fn new(workspace_path: &std::path::Path) -> brainmap_core::Result<Self> {
        let workspace = Workspace::open(workspace_path)?;
        Ok(Self {
            workspace: Arc::new(Mutex::new(workspace)),
        })
    }

    pub fn from_workspace(workspace: Workspace) -> Self {
        Self {
            workspace: Arc::new(Mutex::new(workspace)),
        }
    }

    pub fn lock_workspace(
        workspace: &Arc<Mutex<Workspace>>,
    ) -> Result<std::sync::MutexGuard<'_, Workspace>, CallToolResult> {
        Ok(workspace.lock().unwrap_or_else(|poisoned| poisoned.into_inner()))
    }

    fn lock_workspace_mcp(
        workspace: &Arc<Mutex<Workspace>>,
    ) -> Result<std::sync::MutexGuard<'_, Workspace>, McpError> {
        Ok(workspace.lock().unwrap_or_else(|poisoned| poisoned.into_inner()))
    }

    pub fn ok_json<T: serde::Serialize>(data: &T) -> CallToolResult {
        let json = serde_json::json!({
            "success": true,
            "data": data,
        });
        let text = serde_json::to_string_pretty(&json)
            .unwrap_or_else(|e| format!("{{\"success\":false,\"error\":{{\"code\":\"SERIALIZATION_ERROR\",\"message\":\"{}\"}}}}", e));
        CallToolResult::success(vec![Content::text(text)])
    }

    pub fn err_result(err: &brainmap_core::BrainMapError) -> CallToolResult {
        let json = serde_json::json!({
            "success": false,
            "error": {
                "code": err.error_code(),
                "message": err.to_string(),
            }
        });
        let text = serde_json::to_string_pretty(&json)
            .unwrap_or_else(|e| format!("{{\"success\":false,\"error\":{{\"code\":\"SERIALIZATION_ERROR\",\"message\":\"{}\"}}}}", e));
        CallToolResult {
            content: vec![Content::text(text)],
            is_error: Some(true),
        }
    }

    pub fn dispatch_tool(
        &self,
        name: &str,
        arguments: &Option<serde_json::Map<String, serde_json::Value>>,
    ) -> CallToolResult {
        info!(tool = name, "MCP tool called");
        match name {
            "node_get" => tools::node::node_get(&self.workspace, arguments),
            "node_list" => tools::node::node_list(&self.workspace, arguments),
            "node_create" => tools::node::node_create(&self.workspace, arguments),
            "node_update" => tools::node::node_update(&self.workspace, arguments),
            "node_delete" => tools::node::node_delete(&self.workspace, arguments),
            "node_move" => tools::node::node_move(&self.workspace, arguments),
            "link_create" => tools::link::link_create(&self.workspace, arguments),
            "link_delete" => tools::link::link_delete(&self.workspace, arguments),
            "link_list" => tools::link::link_list(&self.workspace, arguments),
            "search" => tools::search::search(&self.workspace, arguments),
            "neighbors" => tools::graph::neighbors(&self.workspace, arguments),
            "find_path" => tools::graph::find_path(&self.workspace, arguments),
            "subgraph" => tools::graph::subgraph_tool(&self.workspace, arguments),
            "status" => tools::workspace::status(&self.workspace, arguments),
            "validate" => tools::workspace::validate(&self.workspace, arguments),
            "stats" => tools::workspace::stats(&self.workspace, arguments),
            "reindex" => tools::workspace::reindex(&self.workspace, arguments),
            "export" => tools::workspace::export(&self.workspace, arguments),
            "config_get" => tools::workspace::config_get(&self.workspace, arguments),
            "config_set" => tools::workspace::config_set(&self.workspace, arguments),
            "federation_list" => tools::federation::federation_list(&self.workspace, arguments),
            "federation_add" => tools::federation::federation_add(&self.workspace, arguments),
            "federation_remove" => tools::federation::federation_remove(&self.workspace, arguments),
            "batch" => self.batch_execute(arguments),
            _ => {
                warn!(tool = name, "unknown MCP tool requested");
                CallToolResult {
                    content: vec![Content::text(format!("Unknown tool: {}", name))],
                    is_error: Some(true),
                }
            }
        }
    }

    fn batch_execute(
        &self,
        arguments: &Option<serde_json::Map<String, serde_json::Value>>,
    ) -> CallToolResult {
        let operations = match arguments
            .as_ref()
            .and_then(|a| a.get("operations"))
            .and_then(|v| v.as_array())
        {
            Some(ops) => ops.clone(),
            None => {
                return BrainMapMcp::err_result(
                    &brainmap_core::BrainMapError::InvalidArgument("operations argument required".into()),
                );
            }
        };

        let total = operations.len();
        let mut results: Vec<serde_json::Value> = Vec::with_capacity(total);
        let mut succeeded = 0usize;
        let mut failed = 0usize;
        let mut skipped = 0usize;
        let mut failed_index: Option<usize> = None;

        for (i, op) in operations.iter().enumerate() {
            if failed_index.is_some() {
                skipped += 1;
                results.push(serde_json::json!({ "index": i, "skipped": true }));
                continue;
            }

            let tool_name = match op.get("tool").and_then(|v| v.as_str()) {
                Some(t) => t,
                None => {
                    failed += 1;
                    failed_index = Some(i);
                    results.push(serde_json::json!({
                        "index": i,
                        "success": false,
                        "error": { "code": "INVALID_ARGUMENT", "message": "missing 'tool' field in operation" }
                    }));
                    continue;
                }
            };

            if tool_name == "batch" {
                failed += 1;
                failed_index = Some(i);
                results.push(serde_json::json!({
                    "index": i,
                    "success": false,
                    "error": { "code": "INVALID_ARGUMENT", "message": "nested batch operations are not allowed" }
                }));
                continue;
            }

            let input_map = op.get("input").and_then(|v| v.as_object()).cloned();
            let result = self.dispatch_tool(tool_name, &input_map);
            let is_error = result.is_error.unwrap_or(false);

            let content_text = result.content.first().and_then(|c| {
                if let rmcp::model::RawContent::Text(t) = &c.raw {
                    serde_json::from_str::<serde_json::Value>(&t.text).ok()
                } else {
                    None
                }
            }).unwrap_or(serde_json::Value::Null);

            if is_error {
                failed += 1;
                failed_index = Some(i);
                results.push(serde_json::json!({
                    "index": i,
                    "success": false,
                    "error": content_text.get("error").cloned().unwrap_or(content_text),
                }));
            } else {
                succeeded += 1;
                results.push(serde_json::json!({
                    "index": i,
                    "success": true,
                    "data": content_text.get("data").cloned().unwrap_or(content_text),
                }));
            }
        }

        let overall_success = failed == 0;
        let mut response = serde_json::json!({
            "total": total,
            "succeeded": succeeded,
            "failed": failed,
            "results": results,
        });
        if skipped > 0 {
            response["skipped"] = serde_json::Value::from(skipped);
        }

        if overall_success {
            BrainMapMcp::ok_json(&response)
        } else {
            let error_msg = format!(
                "{} of {} operation(s) failed. Execution stopped at index {}.",
                failed,
                total,
                failed_index.unwrap_or(0)
            );
            let full = serde_json::json!({
                "success": false,
                "data": response,
                "error": {
                    "code": "BATCH_PARTIAL_FAILURE",
                    "message": error_msg,
                }
            });
            let text = serde_json::to_string_pretty(&full).unwrap_or_default();
            CallToolResult {
                content: vec![Content::text(text)],
                is_error: Some(true),
            }
        }
    }

    pub fn read_node_resource(&self, path: &str) -> Result<ReadResourceResult, McpError> {
        let ws = Self::lock_workspace_mcp(&self.workspace)?;
        let note = ws.read_note(path).map_err(|e| {
            McpError::resource_not_found(format!("note not found: {}", e), None)
        })?;
        let json = serde_json::to_string_pretty(&note).map_err(|e| {
            McpError::internal_error(format!("serialization error: {}", e), None)
        })?;
        let uri = format!("{}{}", NODES_URI_PREFIX, path);
        Ok(ReadResourceResult {
            contents: vec![ResourceContents::TextResourceContents {
                uri,
                mime_type: Some("application/json".to_string()),
                text: json,
            }],
        })
    }

    pub fn read_graph_resource(&self) -> Result<ReadResourceResult, McpError> {
        let ws = Self::lock_workspace_mcp(&self.workspace)?;
        let json = brainmap_core::export::export_json(&ws, None).map_err(|e| {
            McpError::internal_error(format!("export error: {}", e), None)
        })?;
        Ok(ReadResourceResult {
            contents: vec![ResourceContents::TextResourceContents {
                uri: GRAPH_URI.to_string(),
                mime_type: Some("application/json".to_string()),
                text: json,
            }],
        })
    }

    pub fn read_config_resource(&self) -> Result<ReadResourceResult, McpError> {
        let ws = Self::lock_workspace_mcp(&self.workspace)?;
        let json = serde_json::to_string_pretty(&ws.config).map_err(|e| {
            McpError::internal_error(format!("serialization error: {}", e), None)
        })?;
        Ok(ReadResourceResult {
            contents: vec![ResourceContents::TextResourceContents {
                uri: CONFIG_URI.to_string(),
                mime_type: Some("application/json".to_string()),
                text: json,
            }],
        })
    }

    pub fn list_resources_sync(&self) -> Result<ListResourcesResult, McpError> {
        use rmcp::model::AnnotateAble;

        let graph_resource = RawResource {
            uri: GRAPH_URI.to_string(),
            name: "Full Graph".to_string(),
            description: Some("Complete knowledge graph as JSON (all nodes and edges)".to_string()),
            mime_type: Some("application/json".to_string()),
            size: None,
        }
        .no_annotation();

        let config_resource = RawResource {
            uri: CONFIG_URI.to_string(),
            name: "Workspace Configuration".to_string(),
            description: Some(
                "Workspace configuration including note types, edge types, and federation settings"
                    .to_string(),
            ),
            mime_type: Some("application/json".to_string()),
            size: None,
        }
        .no_annotation();

        let ws = self.workspace.lock().unwrap_or_else(|poisoned| poisoned.into_inner());
        let mut node_resources: Vec<rmcp::model::Resource> = ws
            .notes
            .iter()
            .map(|(path, note)| {
                RawResource {
                    uri: format!("{}{}", NODES_URI_PREFIX, path.as_str()),
                    name: note.frontmatter.title.clone(),
                    description: note.frontmatter.summary.clone(),
                    mime_type: Some("application/json".to_string()),
                    size: None,
                }
                .no_annotation()
            })
            .collect();
        node_resources.sort_by(|a, b| a.uri.cmp(&b.uri));

        let mut resources = vec![graph_resource, config_resource];
        resources.extend(node_resources);

        Ok(ListResourcesResult {
            resources,
            ..Default::default()
        })
    }

    pub fn read_resource_sync(&self, uri: &str) -> Result<ReadResourceResult, McpError> {
        if uri == GRAPH_URI {
            self.read_graph_resource()
        } else if uri == CONFIG_URI {
            self.read_config_resource()
        } else if let Some(path) = uri.strip_prefix(NODES_URI_PREFIX) {
            self.read_node_resource(path)
        } else {
            Err(McpError::resource_not_found(
                format!("unknown resource URI: {}", uri),
                None,
            ))
        }
    }
}

impl ServerHandler for BrainMapMcp {
    fn get_info(&self) -> ServerInfo {
        ServerInfo {
            protocol_version: Default::default(),
            capabilities: ServerCapabilities {
                tools: Some(rmcp::model::ToolsCapability {
                    list_changed: Some(false),
                }),
                resources: Some(ResourcesCapability {
                    subscribe: Some(false),
                    list_changed: Some(false),
                }),
                ..Default::default()
            },
            server_info: Implementation {
                name: "brainmap".to_string(),
                version: "0.1.0".to_string(),
            },
            instructions: Some("BrainMap knowledge graph MCP server. Query and modify a personal knowledge graph of interconnected notes.".to_string()),
        }
    }

    fn list_resources(
        &self,
        _request: PaginatedRequestParam,
        _context: RequestContext<rmcp::service::RoleServer>,
    ) -> impl std::future::Future<Output = Result<ListResourcesResult, McpError>> + Send + '_ {
        std::future::ready(self.list_resources_sync())
    }

    fn read_resource(
        &self,
        request: ReadResourceRequestParam,
        _context: RequestContext<rmcp::service::RoleServer>,
    ) -> impl std::future::Future<Output = Result<ReadResourceResult, McpError>> + Send + '_ {
        std::future::ready(self.read_resource_sync(&request.uri))
    }

    fn list_tools(
        &self,
        _request: PaginatedRequestParam,
        _context: RequestContext<rmcp::service::RoleServer>,
    ) -> impl std::future::Future<Output = Result<ListToolsResult, McpError>> + Send + '_ {
        std::future::ready(Ok(ListToolsResult {
            tools: tools::all_tools(),
            ..Default::default()
        }))
    }

    fn call_tool(
        &self,
        request: rmcp::model::CallToolRequestParam,
        _context: RequestContext<rmcp::service::RoleServer>,
    ) -> impl std::future::Future<Output = Result<CallToolResult, McpError>> + Send + '_ {
        let name = request.name.to_string();
        let arguments = request.arguments;

        async move {
            let result = self.dispatch_tool(&name, &arguments);
            Ok(result)
        }
    }
}
