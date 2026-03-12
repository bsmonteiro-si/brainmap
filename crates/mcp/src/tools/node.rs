use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use brainmap_core::model::Status;
use brainmap_core::workspace::Workspace;
use rmcp::model::CallToolResult;

use super::{arg_bool, arg_str, arg_str_vec, arg_usize, JsonArgs};
use crate::server::BrainMapMcp;


pub fn node_get(workspace: &Arc<Mutex<Workspace>>, arguments: &JsonArgs) -> CallToolResult {
    let path = match arg_str(arguments, "path") {
        Some(p) => p,
        None => return BrainMapMcp::err_result(&brainmap_core::BrainMapError::InvalidArgument("path argument required".into())),
    };

    let ws = match BrainMapMcp::lock_workspace(workspace) {
        Ok(guard) => guard,
        Err(err_result) => return err_result,
    };
    match ws.read_note(&path) {
        Ok(note) => BrainMapMcp::ok_json(note),
        Err(e) => BrainMapMcp::err_result(&e),
    }
}

pub fn node_list(workspace: &Arc<Mutex<Workspace>>, arguments: &JsonArgs) -> CallToolResult {
    let type_filter = arg_str(arguments, "type");
    let tag_filter = arg_str(arguments, "tag");
    let status_filter = arg_str(arguments, "status");
    let limit = arg_usize(arguments, "limit").unwrap_or(50);
    let offset = arg_usize(arguments, "offset").unwrap_or(0);

    let ws = match BrainMapMcp::lock_workspace(workspace) {
        Ok(guard) => guard,
        Err(err_result) => return err_result,
    };
    let all = ws.list_nodes(
        type_filter.as_deref(),
        tag_filter.as_deref(),
        status_filter.as_deref(),
    );

    let total = all.len();
    let page: Vec<serde_json::Value> = all
        .into_iter()
        .skip(offset)
        .take(limit)
        .map(|n| {
            serde_json::json!({
                "path": n.path.as_str(),
                "title": n.frontmatter.title,
                "type": n.frontmatter.note_type,
                "tags": n.frontmatter.tags,
            })
        })
        .collect();

    BrainMapMcp::ok_json(&serde_json::json!({
        "nodes": page,
        "total": total,
        "limit": limit,
        "offset": offset,
    }))
}

pub fn node_create(workspace: &Arc<Mutex<Workspace>>, arguments: &JsonArgs) -> CallToolResult {
    let path = match arg_str(arguments, "path") {
        Some(p) => p,
        None => return BrainMapMcp::err_result(&brainmap_core::BrainMapError::InvalidArgument("path argument required".into())),
    };
    let title = match arg_str(arguments, "title") {
        Some(t) => t,
        None => return BrainMapMcp::err_result(&brainmap_core::BrainMapError::InvalidArgument("title argument required".into())),
    };
    let note_type = arg_str(arguments, "type").unwrap_or_else(|| "concept".to_string());
    let tags = arg_str_vec(arguments, "tags").unwrap_or_default();
    let status = arg_str(arguments, "status").and_then(|s| s.parse::<Status>().ok());
    let source = arg_str(arguments, "source");
    let summary = arg_str(arguments, "summary");
    let content = arg_str(arguments, "content").unwrap_or_default();

    let mut ws = match BrainMapMcp::lock_workspace(workspace) {
        Ok(guard) => guard,
        Err(err_result) => return err_result,
    };
    match ws.create_note(&path, &title, &note_type, tags, status, source, summary, HashMap::new(), content) {
        Ok(created) => BrainMapMcp::ok_json(&serde_json::json!({ "path": created.as_str() })),
        Err(e) => BrainMapMcp::err_result(&e),
    }
}

pub fn node_update(workspace: &Arc<Mutex<Workspace>>, arguments: &JsonArgs) -> CallToolResult {
    let path = match arg_str(arguments, "path") {
        Some(p) => p,
        None => return BrainMapMcp::err_result(&brainmap_core::BrainMapError::InvalidArgument("path argument required".into())),
    };
    let clear_fields = arg_str_vec(arguments, "clear_fields").unwrap_or_default();
    let should_clear = |field: &str| clear_fields.iter().any(|f| f == field);
    let title = arg_str(arguments, "title");
    let note_type = arg_str(arguments, "type");
    let tags = arg_str_vec(arguments, "tags");
    let status = if should_clear("status") {
        Some(None)
    } else {
        match arg_str(arguments, "status") {
            Some(s) => {
                let parsed = s.parse::<Status>().ok();
                if parsed.is_none() {
                    return BrainMapMcp::err_result(&brainmap_core::BrainMapError::InvalidArgument(
                        format!("invalid status: '{}' (expected draft, review, final, or archived)", s),
                    ));
                }
                Some(parsed)
            }
            None => None,
        }
    };
    let source = if should_clear("source") {
        Some(None)
    } else {
        arg_str(arguments, "source").map(Some)
    };
    let summary = if should_clear("summary") {
        Some(None)
    } else {
        arg_str(arguments, "summary").map(Some)
    };
    let content = arg_str(arguments, "content");

    let mut ws = match BrainMapMcp::lock_workspace(workspace) {
        Ok(guard) => guard,
        Err(err_result) => return err_result,
    };
    match ws.update_note(&path, title, note_type, tags, status, source, summary, None, content) {
        Ok(()) => BrainMapMcp::ok_json(&serde_json::json!({ "path": path, "updated": true })),
        Err(e) => BrainMapMcp::err_result(&e),
    }
}

pub fn node_move(workspace: &Arc<Mutex<Workspace>>, arguments: &JsonArgs) -> CallToolResult {
    let old_path = match arg_str(arguments, "old_path") {
        Some(p) => p,
        None => return BrainMapMcp::err_result(&brainmap_core::BrainMapError::InvalidArgument("old_path argument required".into())),
    };
    let new_path = match arg_str(arguments, "new_path") {
        Some(p) => p,
        None => return BrainMapMcp::err_result(&brainmap_core::BrainMapError::InvalidArgument("new_path argument required".into())),
    };

    let mut ws = match BrainMapMcp::lock_workspace(workspace) {
        Ok(guard) => guard,
        Err(err_result) => return err_result,
    };
    match ws.move_note(&old_path, &new_path) {
        Ok(affected) => BrainMapMcp::ok_json(&serde_json::json!({
            "old_path": old_path,
            "new_path": new_path,
            "references_rewritten": affected.len(),
            "affected_files": affected,
        })),
        Err(e) => BrainMapMcp::err_result(&e),
    }
}

pub fn node_delete(workspace: &Arc<Mutex<Workspace>>, arguments: &JsonArgs) -> CallToolResult {
    let path = match arg_str(arguments, "path") {
        Some(p) => p,
        None => return BrainMapMcp::err_result(&brainmap_core::BrainMapError::InvalidArgument("path argument required".into())),
    };
    let force = arg_bool(arguments, "force").unwrap_or(false);

    let mut ws = match BrainMapMcp::lock_workspace(workspace) {
        Ok(guard) => guard,
        Err(err_result) => return err_result,
    };
    match ws.delete_note(&path, force) {
        Ok(()) => BrainMapMcp::ok_json(&serde_json::json!({ "path": path, "deleted": true })),
        Err(e) => BrainMapMcp::err_result(&e),
    }
}
