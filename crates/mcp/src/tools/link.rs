use std::sync::{Arc, Mutex};

use brainmap_core::model::Direction;
use brainmap_core::workspace::Workspace;
use rmcp::model::CallToolResult;

use super::{arg_str, JsonArgs};
use crate::server::BrainMapMcp;

pub fn link_create(workspace: &Arc<Mutex<Workspace>>, arguments: &JsonArgs) -> CallToolResult {
    let source = match arg_str(arguments, "source") {
        Some(s) => s,
        None => return BrainMapMcp::err_result(&brainmap_core::BrainMapError::InvalidArgument("source argument required".into())),
    };
    let target = match arg_str(arguments, "target") {
        Some(t) => t,
        None => return BrainMapMcp::err_result(&brainmap_core::BrainMapError::InvalidArgument("target argument required".into())),
    };
    let rel = match arg_str(arguments, "rel") {
        Some(r) => r,
        None => return BrainMapMcp::err_result(&brainmap_core::BrainMapError::InvalidArgument("rel argument required".into())),
    };
    let annotation = arg_str(arguments, "annotation");

    let mut ws = match BrainMapMcp::lock_workspace(workspace) {
        Ok(guard) => guard,
        Err(err_result) => return err_result,
    };
    match ws.create_link(&source, &target, &rel, annotation) {
        Ok(()) => BrainMapMcp::ok_json(&serde_json::json!({
            "source": source,
            "target": target,
            "rel": rel,
        })),
        Err(e) => BrainMapMcp::err_result(&e),
    }
}

pub fn link_delete(workspace: &Arc<Mutex<Workspace>>, arguments: &JsonArgs) -> CallToolResult {
    let source = match arg_str(arguments, "source") {
        Some(s) => s,
        None => return BrainMapMcp::err_result(&brainmap_core::BrainMapError::InvalidArgument("source argument required".into())),
    };
    let target = match arg_str(arguments, "target") {
        Some(t) => t,
        None => return BrainMapMcp::err_result(&brainmap_core::BrainMapError::InvalidArgument("target argument required".into())),
    };
    let rel = match arg_str(arguments, "rel") {
        Some(r) => r,
        None => return BrainMapMcp::err_result(&brainmap_core::BrainMapError::InvalidArgument("rel argument required".into())),
    };

    let mut ws = match BrainMapMcp::lock_workspace(workspace) {
        Ok(guard) => guard,
        Err(err_result) => return err_result,
    };
    match ws.delete_link(&source, &target, &rel) {
        Ok(()) => BrainMapMcp::ok_json(&serde_json::json!({
            "source": source,
            "target": target,
            "rel": rel,
            "deleted": true,
        })),
        Err(e) => BrainMapMcp::err_result(&e),
    }
}

fn edge_to_json(e: &brainmap_core::model::Edge) -> serde_json::Value {
    serde_json::json!({
        "source": e.source.as_str(),
        "target": e.target.as_str(),
        "rel": e.rel,
        "kind": format!("{:?}", e.kind).to_lowercase(),
    })
}

pub fn link_list(workspace: &Arc<Mutex<Workspace>>, arguments: &JsonArgs) -> CallToolResult {
    let path = match arg_str(arguments, "path") {
        Some(p) => p,
        None => return BrainMapMcp::err_result(&brainmap_core::BrainMapError::InvalidArgument("path argument required".into())),
    };
    let direction_str = arg_str(arguments, "direction");
    let rel_filter = arg_str(arguments, "rel");

    let ws = match BrainMapMcp::lock_workspace(workspace) {
        Ok(guard) => guard,
        Err(err_result) => return err_result,
    };

    match direction_str.as_deref() {
        Some("in") => {
            match ws.list_links(&path, &Direction::Incoming, rel_filter.as_deref()) {
                Ok(edges) => {
                    let links: Vec<serde_json::Value> = edges.into_iter().map(edge_to_json).collect();
                    let total = links.len();
                    BrainMapMcp::ok_json(&serde_json::json!({
                        "path": path,
                        "links": links,
                        "total": total,
                    }))
                }
                Err(e) => BrainMapMcp::err_result(&e),
            }
        }
        Some("out") => {
            match ws.list_links(&path, &Direction::Outgoing, rel_filter.as_deref()) {
                Ok(edges) => {
                    let links: Vec<serde_json::Value> = edges.into_iter().map(edge_to_json).collect();
                    let total = links.len();
                    BrainMapMcp::ok_json(&serde_json::json!({
                        "path": path,
                        "links": links,
                        "total": total,
                    }))
                }
                Err(e) => BrainMapMcp::err_result(&e),
            }
        }
        _ => {
            let incoming = match ws.list_links(&path, &Direction::Incoming, rel_filter.as_deref()) {
                Ok(edges) => edges,
                Err(e) => return BrainMapMcp::err_result(&e),
            };
            let outgoing = match ws.list_links(&path, &Direction::Outgoing, rel_filter.as_deref()) {
                Ok(edges) => edges,
                Err(e) => return BrainMapMcp::err_result(&e),
            };
            let incoming_json: Vec<serde_json::Value> = incoming.into_iter().map(edge_to_json).collect();
            let outgoing_json: Vec<serde_json::Value> = outgoing.into_iter().map(edge_to_json).collect();
            let total = incoming_json.len() + outgoing_json.len();
            BrainMapMcp::ok_json(&serde_json::json!({
                "path": path,
                "incoming": incoming_json,
                "outgoing": outgoing_json,
                "total": total,
            }))
        }
    }
}
