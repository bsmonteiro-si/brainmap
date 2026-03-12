pub mod federation;
pub mod graph;
pub mod link;
pub mod node;
pub mod search;
pub mod workspace;

use std::borrow::Cow;
use std::sync::Arc;

use rmcp::model::Tool;

type JsonArgs = Option<serde_json::Map<String, serde_json::Value>>;

pub(crate) fn arg_str(arguments: &JsonArgs, key: &str) -> Option<String> {
    arguments
        .as_ref()
        .and_then(|args| args.get(key))
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
}

pub(crate) fn arg_usize(arguments: &JsonArgs, key: &str) -> Option<usize> {
    arguments
        .as_ref()
        .and_then(|args| args.get(key))
        .and_then(|v| v.as_u64())
        .map(|n| n as usize)
}

pub(crate) fn arg_bool(arguments: &JsonArgs, key: &str) -> Option<bool> {
    arguments
        .as_ref()
        .and_then(|args| args.get(key))
        .and_then(|v| v.as_bool())
}

pub(crate) fn arg_str_vec(arguments: &JsonArgs, key: &str) -> Option<Vec<String>> {
    arguments.as_ref().and_then(|args| args.get(key)).map(|v| {
        if let Some(arr) = v.as_array() {
            arr.iter()
                .filter_map(|item| item.as_str().map(String::from))
                .collect()
        } else if let Some(s) = v.as_str() {
            s.split(',').map(|s| s.trim().to_string()).collect()
        } else {
            vec![]
        }
    })
}

fn make_tool(name: &str, description: &str, properties: serde_json::Value, required: Vec<&str>) -> Tool {
    let required_val: Vec<serde_json::Value> = required.iter().map(|s| serde_json::Value::String(s.to_string())).collect();
    let schema = serde_json::json!({
        "type": "object",
        "properties": properties,
        "required": required_val,
    });
    let schema_map: serde_json::Map<String, serde_json::Value> = match schema {
        serde_json::Value::Object(m) => m,
        _ => unreachable!(),
    };
    Tool {
        name: Cow::Owned(name.to_string()),
        description: Cow::Owned(description.to_string()),
        input_schema: Arc::new(schema_map),
    }
}

pub fn all_tools() -> Vec<Tool> {
    vec![
        // Node tools
        make_tool("node_get", "Get a note by its relative path", serde_json::json!({
            "path": {"type": "string", "description": "Relative path to the note (e.g. 'Concepts/Causal Inference.md')"}
        }), vec!["path"]),

        make_tool("node_list", "List notes with optional filters", serde_json::json!({
            "type": {"type": "string", "description": "Filter by note type"},
            "tag": {"type": "string", "description": "Filter by tag"},
            "status": {"type": "string", "description": "Filter by status (draft, review, final, archived)"},
            "limit": {"type": "integer", "description": "Maximum results (default 50)"},
            "offset": {"type": "integer", "description": "Results offset (default 0)"}
        }), vec![]),

        make_tool("node_create", "Create a new note", serde_json::json!({
            "path": {"type": "string", "description": "Relative path for the new note"},
            "title": {"type": "string", "description": "Note title"},
            "type": {"type": "string", "description": "Note type (concept, book-note, question, etc.)"},
            "tags": {"type": "array", "items": {"type": "string"}, "description": "Tags"},
            "status": {"type": "string", "description": "Status (draft, review, final, archived)"},
            "source": {"type": "string", "description": "Source reference URL or citation"},
            "summary": {"type": "string", "description": "Brief summary"},
            "content": {"type": "string", "description": "Markdown body content"}
        }), vec!["path", "title", "type"]),

        make_tool("node_update", "Update fields of an existing note", serde_json::json!({
            "path": {"type": "string", "description": "Relative path to the note"},
            "title": {"type": "string", "description": "New title"},
            "type": {"type": "string", "description": "New note type"},
            "tags": {"type": "array", "items": {"type": "string"}, "description": "New tags"},
            "status": {"type": "string", "description": "New status"},
            "source": {"type": "string", "description": "Source reference URL or citation"},
            "summary": {"type": "string", "description": "New summary"},
            "content": {"type": "string", "description": "New markdown body"},
            "clear_fields": {"type": "array", "items": {"type": "string"}, "description": "Fields to explicitly null out (e.g. [\"source\", \"summary\", \"status\"])"}
        }), vec!["path"]),

        make_tool("node_delete", "Delete a note", serde_json::json!({
            "path": {"type": "string", "description": "Relative path to the note"},
            "force": {"type": "boolean", "description": "Force delete even if other notes link to it"}
        }), vec!["path"]),

        // Link tools
        make_tool("link_create", "Create a typed link between two notes", serde_json::json!({
            "source": {"type": "string", "description": "Source note path"},
            "target": {"type": "string", "description": "Target note path"},
            "rel": {"type": "string", "description": "Relationship type (e.g. causes, supports, related-to)"},
            "annotation": {"type": "string", "description": "Optional annotation for the link"}
        }), vec!["source", "target", "rel"]),

        make_tool("link_delete", "Delete a typed link between two notes", serde_json::json!({
            "source": {"type": "string", "description": "Source note path"},
            "target": {"type": "string", "description": "Target note path"},
            "rel": {"type": "string", "description": "Relationship type"}
        }), vec!["source", "target", "rel"]),

        make_tool("link_list", "List links for a note", serde_json::json!({
            "path": {"type": "string", "description": "Note path"},
            "direction": {"type": "string", "enum": ["in", "out", "both"], "description": "Link direction (default: both)"},
            "rel": {"type": "string", "description": "Filter by relationship type"}
        }), vec!["path"]),

        // Search
        make_tool("search", "Full-text search across the workspace", serde_json::json!({
            "query": {"type": "string", "description": "Search query"},
            "type": {"type": "string", "description": "Filter by note type"},
            "tag": {"type": "string", "description": "Filter by tag"},
            "status": {"type": "string", "description": "Filter by status"}
        }), vec!["query"]),

        // Graph tools
        make_tool("neighbors", "Get the graph neighborhood of a note", serde_json::json!({
            "path": {"type": "string", "description": "Center note path"},
            "depth": {"type": "integer", "description": "Traversal depth (default 1)"},
            "direction": {"type": "string", "enum": ["in", "out", "both"], "description": "Direction (default: both)"},
            "rel": {"type": "string", "description": "Filter by relationship type"}
        }), vec!["path"]),

        make_tool("find_path", "Find shortest path between two notes", serde_json::json!({
            "source": {"type": "string", "description": "Source note path"},
            "target": {"type": "string", "description": "Target note path"},
            "max_depth": {"type": "integer", "description": "Maximum path length (default 10)"}
        }), vec!["source", "target"]),

        make_tool("subgraph", "Extract a subgraph around a center note", serde_json::json!({
            "path": {"type": "string", "description": "Center note path"},
            "depth": {"type": "integer", "description": "Traversal depth (default 2)"},
            "rel": {"type": "string", "description": "Filter by relationship type"}
        }), vec!["path"]),

        // Workspace tools
        make_tool("status", "Show workspace status summary", serde_json::json!({}), vec![]),
        make_tool("validate", "Validate workspace integrity", serde_json::json!({}), vec![]),
        make_tool("stats", "Show workspace statistics", serde_json::json!({}), vec![]),
        make_tool("reindex", "Rebuild the search index", serde_json::json!({}), vec![]),

        make_tool("export", "Export the graph in various formats", serde_json::json!({
            "format": {"type": "string", "enum": ["json", "dot", "graphml"], "description": "Export format (default: json)"},
            "subgraph": {"type": "string", "description": "Center node for subgraph export"},
            "depth": {"type": "integer", "description": "Subgraph depth (default 2)"}
        }), vec![]),

        make_tool("config_get", "Get workspace configuration", serde_json::json!({
            "key": {"type": "string", "description": "Config key (name, version, note_types, edge_types, federation). Omit for all."}
        }), vec![]),

        make_tool("config_set", "Set a workspace configuration value", serde_json::json!({
            "key": {"type": "string", "description": "Config key to set (currently only 'name' is supported)"},
            "value": {"type": "string", "description": "New value"}
        }), vec!["key", "value"]),

        make_tool("node_move", "Move/rename a note and rewrite all references workspace-wide", serde_json::json!({
            "old_path": {"type": "string", "description": "Current relative path of the note"},
            "new_path": {"type": "string", "description": "New relative path for the note"}
        }), vec!["old_path", "new_path"]),

        // Federation tools
        make_tool("federation_list", "List all federated workspaces", serde_json::json!({}), vec![]),

        make_tool("federation_add", "Add a federated workspace", serde_json::json!({
            "name": {"type": "string", "description": "Name for the federation"},
            "path": {"type": "string", "description": "Path to the federated workspace directory"}
        }), vec!["name", "path"]),

        make_tool("federation_remove", "Remove a federated workspace", serde_json::json!({
            "name": {"type": "string", "description": "Name of the federation to remove"}
        }), vec!["name"]),

        // Batch operations
        make_tool("batch", "Execute multiple operations sequentially", serde_json::json!({
            "operations": {
                "type": "array",
                "description": "Operations to execute in order. On failure, remaining operations are skipped.",
                "items": {
                    "type": "object",
                    "properties": {
                        "tool": {"type": "string", "description": "Tool name (e.g. node_create, link_create)"},
                        "input": {"type": "object", "description": "Tool arguments"}
                    },
                    "required": ["tool", "input"]
                }
            }
        }), vec!["operations"]),
    ]
}
