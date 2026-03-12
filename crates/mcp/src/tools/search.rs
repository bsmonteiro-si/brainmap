use std::sync::{Arc, Mutex};

use brainmap_core::index::SearchFilters;
use brainmap_core::workspace::Workspace;
use rmcp::model::CallToolResult;

use super::{arg_str, JsonArgs};
use crate::server::BrainMapMcp;

pub fn search(workspace: &Arc<Mutex<Workspace>>, arguments: &JsonArgs) -> CallToolResult {
    let query = match arg_str(arguments, "query") {
        Some(q) => q,
        None => return BrainMapMcp::err_result(&brainmap_core::BrainMapError::InvalidArgument("query argument required".into())),
    };
    let type_filter = arg_str(arguments, "type");
    let tag_filter = arg_str(arguments, "tag");
    let status_filter = arg_str(arguments, "status");

    let ws = match BrainMapMcp::lock_workspace(workspace) {
        Ok(guard) => guard,
        Err(err_result) => return err_result,
    };
    let filters = SearchFilters {
        note_type: type_filter,
        tag: tag_filter,
        status: status_filter,
    };

    match ws.index.search(&query, &filters) {
        Ok(results) => {
            let total = results.len();
            BrainMapMcp::ok_json(&serde_json::json!({
                "query": query,
                "results": results,
                "total": total,
            }))
        }
        Err(e) => BrainMapMcp::err_result(&e),
    }
}
