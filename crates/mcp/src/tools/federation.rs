use std::sync::{Arc, Mutex};

use brainmap_core::config::save_config;
use brainmap_core::workspace::Workspace;
use rmcp::model::CallToolResult;

use super::{arg_str, JsonArgs};
use crate::server::BrainMapMcp;

pub fn federation_list(workspace: &Arc<Mutex<Workspace>>, _arguments: &JsonArgs) -> CallToolResult {
    let ws = match BrainMapMcp::lock_workspace(workspace) {
        Ok(guard) => guard,
        Err(err_result) => return err_result,
    };
    let workspaces: Vec<serde_json::Value> = ws
        .config
        .federation
        .iter()
        .map(|f| serde_json::json!({ "name": f.name, "path": f.path }))
        .collect();
    let total = workspaces.len();
    BrainMapMcp::ok_json(&serde_json::json!({
        "workspaces": workspaces,
        "total": total,
    }))
}

pub fn federation_add(workspace: &Arc<Mutex<Workspace>>, arguments: &JsonArgs) -> CallToolResult {
    let name = match arg_str(arguments, "name") {
        Some(n) => n,
        None => return BrainMapMcp::err_result(&brainmap_core::BrainMapError::InvalidArgument("name argument required".into())),
    };
    let path = match arg_str(arguments, "path") {
        Some(p) => p,
        None => return BrainMapMcp::err_result(&brainmap_core::BrainMapError::InvalidArgument("path argument required".into())),
    };

    let mut ws = match BrainMapMcp::lock_workspace(workspace) {
        Ok(guard) => guard,
        Err(err_result) => return err_result,
    };
    ws.config.add_federation(&name, &path);
    let brainmap_dir = ws.root.join(".brainmap");
    if let Err(e) = save_config(&ws.config, &brainmap_dir) {
        return BrainMapMcp::err_result(&e);
    }

    BrainMapMcp::ok_json(&serde_json::json!({
        "name": name,
        "path": path,
        "added": true,
    }))
}

pub fn federation_remove(workspace: &Arc<Mutex<Workspace>>, arguments: &JsonArgs) -> CallToolResult {
    let name = match arg_str(arguments, "name") {
        Some(n) => n,
        None => return BrainMapMcp::err_result(&brainmap_core::BrainMapError::InvalidArgument("name argument required".into())),
    };

    let mut ws = match BrainMapMcp::lock_workspace(workspace) {
        Ok(guard) => guard,
        Err(err_result) => return err_result,
    };
    let removed = ws.config.remove_federation(&name);
    if removed {
        let brainmap_dir = ws.root.join(".brainmap");
        if let Err(e) = save_config(&ws.config, &brainmap_dir) {
            return BrainMapMcp::err_result(&e);
        }
    }

    BrainMapMcp::ok_json(&serde_json::json!({
        "name": name,
        "removed": removed,
    }))
}
