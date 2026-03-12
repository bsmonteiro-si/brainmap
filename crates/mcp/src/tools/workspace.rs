use std::sync::{Arc, Mutex};

use brainmap_core::export;
use brainmap_core::workspace::{Severity, Workspace};
use rmcp::model::CallToolResult;

use brainmap_core::config::save_config;

use super::{arg_str, arg_usize, JsonArgs};
use crate::server::BrainMapMcp;

pub fn status(workspace: &Arc<Mutex<Workspace>>, _arguments: &JsonArgs) -> CallToolResult {
    let ws = match BrainMapMcp::lock_workspace(workspace) {
        Ok(guard) => guard,
        Err(err_result) => return err_result,
    };
    let stats = ws.stats();
    let issues = ws.validate();
    let error_count = issues.iter().filter(|i| i.severity == Severity::Error).count();
    let warning_count = issues.iter().filter(|i| i.severity == Severity::Warning).count();

    BrainMapMcp::ok_json(&serde_json::json!({
        "workspace": ws.config.name,
        "node_count": stats.node_count,
        "edge_count": stats.edge_count,
        "orphan_count": stats.orphan_count,
        "error_count": error_count,
        "warning_count": warning_count,
    }))
}

pub fn validate(workspace: &Arc<Mutex<Workspace>>, _arguments: &JsonArgs) -> CallToolResult {
    let ws = match BrainMapMcp::lock_workspace(workspace) {
        Ok(guard) => guard,
        Err(err_result) => return err_result,
    };
    let issues = ws.validate();
    let error_count = issues.iter().filter(|i| i.severity == Severity::Error).count();
    let warning_count = issues.iter().filter(|i| i.severity == Severity::Warning).count();

    let issue_list: Vec<serde_json::Value> = issues
        .iter()
        .map(|i| {
            serde_json::json!({
                "severity": format!("{:?}", i.severity).to_lowercase(),
                "message": i.message,
                "path": i.path,
            })
        })
        .collect();

    BrainMapMcp::ok_json(&serde_json::json!({
        "issues": issue_list,
        "error_count": error_count,
        "warning_count": warning_count,
    }))
}

pub fn stats(workspace: &Arc<Mutex<Workspace>>, _arguments: &JsonArgs) -> CallToolResult {
    let ws = match BrainMapMcp::lock_workspace(workspace) {
        Ok(guard) => guard,
        Err(err_result) => return err_result,
    };
    let s = ws.stats();
    BrainMapMcp::ok_json(&s)
}

pub fn reindex(workspace: &Arc<Mutex<Workspace>>, _arguments: &JsonArgs) -> CallToolResult {
    let mut ws = match BrainMapMcp::lock_workspace(workspace) {
        Ok(guard) => guard,
        Err(err_result) => return err_result,
    };
    let start = std::time::Instant::now();
    match ws.reindex() {
        Ok(()) => {
            let duration_ms = start.elapsed().as_millis();
            let nodes_indexed = ws.stats().node_count;
            BrainMapMcp::ok_json(&serde_json::json!({
                "nodes_indexed": nodes_indexed,
                "duration_ms": duration_ms,
            }))
        }
        Err(e) => BrainMapMcp::err_result(&e),
    }
}

pub fn export(workspace: &Arc<Mutex<Workspace>>, arguments: &JsonArgs) -> CallToolResult {
    let format = arg_str(arguments, "format").unwrap_or_else(|| "json".to_string());
    let subgraph_center = arg_str(arguments, "subgraph");
    let depth = arg_usize(arguments, "depth").unwrap_or(2);

    let ws = match BrainMapMcp::lock_workspace(workspace) {
        Ok(guard) => guard,
        Err(err_result) => return err_result,
    };
    let subgraph = match subgraph_center {
        Some(center) => match ws.get_subgraph(&center, depth, None) {
            Ok(sg) => Some(sg),
            Err(e) => return BrainMapMcp::err_result(&e),
        },
        None => None,
    };

    let content = match format.as_str() {
        "json" => match export::export_json(&ws, subgraph.as_ref()) {
            Ok(c) => c,
            Err(e) => return BrainMapMcp::err_result(&e),
        },
        "dot" => export::export_dot(&ws, subgraph.as_ref()),
        "graphml" => export::export_graphml(&ws, subgraph.as_ref()),
        other => {
            return BrainMapMcp::err_result(&brainmap_core::BrainMapError::ConfigError(
                format!("unknown export format: {}", other),
            ));
        }
    };

    BrainMapMcp::ok_json(&serde_json::json!({
        "format": format,
        "content": content,
    }))
}

pub fn config_set(workspace: &Arc<Mutex<Workspace>>, arguments: &JsonArgs) -> CallToolResult {
    let key = match arg_str(arguments, "key") {
        Some(k) => k,
        None => return BrainMapMcp::err_result(&brainmap_core::BrainMapError::InvalidArgument("key argument required".into())),
    };
    let value = match arg_str(arguments, "value") {
        Some(v) => v,
        None => return BrainMapMcp::err_result(&brainmap_core::BrainMapError::InvalidArgument("value argument required".into())),
    };

    let mut ws = match BrainMapMcp::lock_workspace(workspace) {
        Ok(guard) => guard,
        Err(err_result) => return err_result,
    };

    let old_value = match key.as_str() {
        "name" => ws.config.name.clone(),
        other => return BrainMapMcp::err_result(&brainmap_core::BrainMapError::ConfigError(
            format!("cannot set config key: '{}'", other),
        )),
    };

    ws.config.name = value.clone();
    let brainmap_dir = ws.root.join(".brainmap");
    if let Err(e) = save_config(&ws.config, &brainmap_dir) {
        ws.config.name = old_value; // rollback in-memory state
        return BrainMapMcp::err_result(&e);
    }

    BrainMapMcp::ok_json(&serde_json::json!({
        "key": key,
        "old_value": old_value,
        "new_value": value,
    }))
}

pub fn config_get(workspace: &Arc<Mutex<Workspace>>, arguments: &JsonArgs) -> CallToolResult {
    let key = arg_str(arguments, "key");
    let ws = match BrainMapMcp::lock_workspace(workspace) {
        Ok(guard) => guard,
        Err(err_result) => return err_result,
    };

    match key.as_deref() {
        None => BrainMapMcp::ok_json(&ws.config),
        Some("name") => BrainMapMcp::ok_json(&serde_json::json!({ "name": ws.config.name })),
        Some("version") => BrainMapMcp::ok_json(&serde_json::json!({ "version": ws.config.version })),
        Some("note_types") => BrainMapMcp::ok_json(&serde_json::json!({ "note_types": ws.config.note_types })),
        Some("edge_types") => BrainMapMcp::ok_json(&serde_json::json!({ "edge_types": ws.config.edge_types })),
        Some("federation") => BrainMapMcp::ok_json(&serde_json::json!({ "federation": ws.config.federation })),
        Some(other) => BrainMapMcp::err_result(&brainmap_core::BrainMapError::ConfigError(
            format!("unknown config key: {}", other),
        )),
    }
}
