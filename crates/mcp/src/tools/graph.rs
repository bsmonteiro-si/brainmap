use std::sync::{Arc, Mutex};

use brainmap_core::model::Direction;
use brainmap_core::workspace::Workspace;
use rmcp::model::CallToolResult;

use super::{arg_str, arg_usize, JsonArgs};
use crate::server::BrainMapMcp;

pub fn neighbors(workspace: &Arc<Mutex<Workspace>>, arguments: &JsonArgs) -> CallToolResult {
    let path = match arg_str(arguments, "path") {
        Some(p) => p,
        None => return BrainMapMcp::err_result(&brainmap_core::BrainMapError::InvalidArgument("path argument required".into())),
    };
    let depth = arg_usize(arguments, "depth").unwrap_or(1);
    let direction = match arg_str(arguments, "direction").as_deref() {
        Some("in") => Direction::Incoming,
        Some("out") => Direction::Outgoing,
        _ => Direction::Both,
    };
    let rel = arg_str(arguments, "rel");

    let ws = match BrainMapMcp::lock_workspace(workspace) {
        Ok(guard) => guard,
        Err(err_result) => return err_result,
    };
    let rp = brainmap_core::model::RelativePath::new(&path);
    let rel_filter: Option<Vec<String>> = rel.map(|r| vec![r]);
    let subgraph = ws.graph.neighbors(&rp, depth, &direction, rel_filter.as_ref().map(|v| v.as_slice()));

    BrainMapMcp::ok_json(&subgraph)
}

pub fn find_path(workspace: &Arc<Mutex<Workspace>>, arguments: &JsonArgs) -> CallToolResult {
    let source = match arg_str(arguments, "source") {
        Some(s) => s,
        None => return BrainMapMcp::err_result(&brainmap_core::BrainMapError::InvalidArgument("source argument required".into())),
    };
    let target = match arg_str(arguments, "target") {
        Some(t) => t,
        None => return BrainMapMcp::err_result(&brainmap_core::BrainMapError::InvalidArgument("target argument required".into())),
    };
    let max_depth = arg_usize(arguments, "max_depth");

    let ws = match BrainMapMcp::lock_workspace(workspace) {
        Ok(guard) => guard,
        Err(err_result) => return err_result,
    };
    match ws.find_path(&source, &target, max_depth) {
        Ok(Some(edges)) => {
            let hops: Vec<serde_json::Value> = edges
                .iter()
                .map(|e| {
                    serde_json::json!({
                        "source": e.source.as_str(),
                        "target": e.target.as_str(),
                        "rel": e.rel,
                    })
                })
                .collect();
            BrainMapMcp::ok_json(&serde_json::json!({
                "source": source,
                "target": target,
                "found": true,
                "hops": hops.len(),
                "path": hops,
            }))
        }
        Ok(None) => {
            BrainMapMcp::ok_json(&serde_json::json!({
                "source": source,
                "target": target,
                "found": false,
                "hops": 0,
                "path": [],
            }))
        }
        Err(e) => BrainMapMcp::err_result(&e),
    }
}

pub fn subgraph_tool(workspace: &Arc<Mutex<Workspace>>, arguments: &JsonArgs) -> CallToolResult {
    let path = match arg_str(arguments, "path") {
        Some(p) => p,
        None => return BrainMapMcp::err_result(&brainmap_core::BrainMapError::InvalidArgument("path argument required".into())),
    };
    let depth = arg_usize(arguments, "depth").unwrap_or(2);
    let rel = arg_str(arguments, "rel");

    let ws = match BrainMapMcp::lock_workspace(workspace) {
        Ok(guard) => guard,
        Err(err_result) => return err_result,
    };
    match ws.get_subgraph(&path, depth, rel.as_deref()) {
        Ok(sg) => BrainMapMcp::ok_json(&sg),
        Err(e) => BrainMapMcp::err_result(&e),
    }
}
