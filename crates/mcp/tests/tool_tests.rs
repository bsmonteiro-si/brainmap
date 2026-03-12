use brainmap_mcp::BrainMapMcp;
use rmcp::model::RawContent;
use std::path::Path;
use tempfile::TempDir;

fn setup_workspace() -> TempDir {
    let dir = TempDir::new().unwrap();
    let seed_dir = Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .join("seed");

    copy_dir_recursive(&seed_dir, dir.path());
    dir
}

fn copy_dir_recursive(src: &Path, dst: &Path) {
    std::fs::create_dir_all(dst).unwrap();
    for entry in std::fs::read_dir(src).unwrap() {
        let entry = entry.unwrap();
        let dest_path = dst.join(entry.file_name());
        if entry.file_type().unwrap().is_dir() {
            copy_dir_recursive(&entry.path(), &dest_path);
        } else {
            std::fs::copy(entry.path(), &dest_path).unwrap();
        }
    }
}

fn make_mcp(dir: &TempDir) -> BrainMapMcp {
    BrainMapMcp::new(dir.path()).unwrap()
}

fn parse_result(result: &rmcp::model::CallToolResult) -> serde_json::Value {
    let content = result.content.first().unwrap();
    match &content.raw {
        RawContent::Text(t) => serde_json::from_str(&t.text).unwrap(),
        _ => panic!("expected text content"),
    }
}

fn call(mcp: &BrainMapMcp, tool: &str, args: serde_json::Value) -> serde_json::Value {
    let arguments = match args {
        serde_json::Value::Object(m) => Some(m),
        _ => None,
    };
    let result = mcp.dispatch_tool(tool, &arguments);
    parse_result(&result)
}

// -- Node tools --

#[test]
fn test_node_get() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = call(&mcp, "node_get", serde_json::json!({"path": "Concepts/Causal Inference.md"}));
    assert_eq!(result["success"], true);
    assert_eq!(result["data"]["frontmatter"]["title"], "Causal Inference");
}

#[test]
fn test_node_get_missing() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = call(&mcp, "node_get", serde_json::json!({"path": "missing.md"}));
    assert_eq!(result["success"], false);
    assert_eq!(result["error"]["code"], "FILE_NOT_FOUND");
}

#[test]
fn test_node_list() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = call(&mcp, "node_list", serde_json::json!({}));
    assert_eq!(result["success"], true);
    assert!(result["data"]["total"].as_u64().unwrap() >= 30);
}

#[test]
fn test_node_create_and_delete() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let create = call(&mcp, "node_create", serde_json::json!({
        "path": "Concepts/TestMcp.md",
        "title": "MCP Test",
        "type": "concept"
    }));
    assert_eq!(create["success"], true);

    let get = call(&mcp, "node_get", serde_json::json!({"path": "Concepts/TestMcp.md"}));
    assert_eq!(get["data"]["frontmatter"]["title"], "MCP Test");

    let delete = call(&mcp, "node_delete", serde_json::json!({"path": "Concepts/TestMcp.md", "force": true}));
    assert_eq!(delete["success"], true);
}

// -- Link tools --

#[test]
fn test_link_create_and_list() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    // Create a test node first
    call(&mcp, "node_create", serde_json::json!({
        "path": "Concepts/LinkTarget.md",
        "title": "Link Target",
        "type": "concept"
    }));

    let create = call(&mcp, "link_create", serde_json::json!({
        "source": "Concepts/LinkTarget.md",
        "target": "Concepts/Causal Inference.md",
        "rel": "related-to"
    }));
    assert_eq!(create["success"], true);

    let list = call(&mcp, "link_list", serde_json::json!({
        "path": "Concepts/LinkTarget.md",
        "direction": "out"
    }));
    assert_eq!(list["success"], true);
    assert!(list["data"]["total"].as_u64().unwrap() > 0);
}

// -- Search --

#[test]
fn test_search() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = call(&mcp, "search", serde_json::json!({"query": "causality"}));
    assert_eq!(result["success"], true);
    assert!(result["data"]["total"].as_u64().unwrap() > 0);
}

// -- Graph tools --

#[test]
fn test_find_path() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = call(&mcp, "find_path", serde_json::json!({
        "source": "Concepts/Causal Inference.md",
        "target": "People/Judea Pearl.md"
    }));
    assert_eq!(result["success"], true);
    assert_eq!(result["data"]["found"], true);
    assert!(result["data"]["hops"].as_u64().unwrap() >= 1);
}

#[test]
fn test_neighbors() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = call(&mcp, "neighbors", serde_json::json!({
        "path": "Concepts/Causal Inference.md",
        "depth": 1
    }));
    assert_eq!(result["success"], true);
    assert!(result["data"]["nodes"].as_array().unwrap().len() > 1);
}

#[test]
fn test_subgraph() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = call(&mcp, "subgraph", serde_json::json!({
        "path": "Concepts/Causal Inference.md",
        "depth": 1
    }));
    assert_eq!(result["success"], true);
    assert!(result["data"]["nodes"].as_array().unwrap().len() > 1);
}

// -- Workspace tools --

#[test]
fn test_status() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = call(&mcp, "status", serde_json::json!({}));
    assert_eq!(result["success"], true);
    assert!(result["data"]["node_count"].as_u64().unwrap() >= 30);
}

#[test]
fn test_validate() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = call(&mcp, "validate", serde_json::json!({}));
    assert_eq!(result["success"], true);
    assert!(result["data"]["issues"].as_array().unwrap().len() > 0);
}

#[test]
fn test_stats() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = call(&mcp, "stats", serde_json::json!({}));
    assert_eq!(result["success"], true);
    assert!(result["data"]["node_count"].as_u64().unwrap() >= 30);
}

#[test]
fn test_export_json() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = call(&mcp, "export", serde_json::json!({"format": "json"}));
    assert_eq!(result["success"], true);
    assert!(result["data"]["content"].as_str().unwrap().contains("nodes"));
}

#[test]
fn test_export_dot() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = call(&mcp, "export", serde_json::json!({"format": "dot"}));
    assert_eq!(result["success"], true);
    assert!(result["data"]["content"].as_str().unwrap().contains("digraph"));
}

#[test]
fn test_config_get() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = call(&mcp, "config_get", serde_json::json!({}));
    assert_eq!(result["success"], true);
    assert!(result["data"]["note_types"].as_array().unwrap().len() >= 10);
}

#[test]
fn test_unknown_tool() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = mcp.dispatch_tool("nonexistent", &None);
    assert_eq!(result.is_error, Some(true));
}

// -- node_move --

#[test]
fn test_node_move() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = call(&mcp, "node_move", serde_json::json!({
        "old_path": "Concepts/Causal Inference.md",
        "new_path": "Concepts/Causal Inference Moved.md"
    }));
    assert_eq!(result["success"], true);
    assert_eq!(result["data"]["old_path"], "Concepts/Causal Inference.md");
    assert_eq!(result["data"]["new_path"], "Concepts/Causal Inference Moved.md");
    assert!(result["data"]["references_rewritten"].as_u64().is_some());

    // Original should be gone
    let get_old = call(&mcp, "node_get", serde_json::json!({"path": "Concepts/Causal Inference.md"}));
    assert_eq!(get_old["success"], false);

    // New should exist
    let get_new = call(&mcp, "node_get", serde_json::json!({"path": "Concepts/Causal Inference Moved.md"}));
    assert_eq!(get_new["success"], true);
}

// -- config_set --

#[test]
fn test_config_set() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = call(&mcp, "config_set", serde_json::json!({
        "key": "name",
        "value": "My New Workspace"
    }));
    assert_eq!(result["success"], true);
    assert_eq!(result["data"]["key"], "name");
    assert_eq!(result["data"]["new_value"], "My New Workspace");

    // Verify the change is reflected
    let cfg = call(&mcp, "config_get", serde_json::json!({"key": "name"}));
    assert_eq!(cfg["data"]["name"], "My New Workspace");
}

#[test]
fn test_config_set_invalid_key() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = call(&mcp, "config_set", serde_json::json!({
        "key": "note_types",
        "value": "whatever"
    }));
    assert_eq!(result["success"], false);
}

// -- federation tools --

#[test]
fn test_federation_list_empty() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = call(&mcp, "federation_list", serde_json::json!({}));
    assert_eq!(result["success"], true);
    assert_eq!(result["data"]["total"].as_u64().unwrap(), 0);
}

#[test]
fn test_federation_add_and_remove() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let add = call(&mcp, "federation_add", serde_json::json!({
        "name": "MyOtherWS",
        "path": "/tmp/other"
    }));
    assert_eq!(add["success"], true);
    assert_eq!(add["data"]["added"], true);

    let list = call(&mcp, "federation_list", serde_json::json!({}));
    assert_eq!(list["data"]["total"].as_u64().unwrap(), 1);
    assert_eq!(list["data"]["workspaces"][0]["name"], "MyOtherWS");

    let remove = call(&mcp, "federation_remove", serde_json::json!({"name": "MyOtherWS"}));
    assert_eq!(remove["success"], true);
    assert_eq!(remove["data"]["removed"], true);

    let list2 = call(&mcp, "federation_list", serde_json::json!({}));
    assert_eq!(list2["data"]["total"].as_u64().unwrap(), 0);
}

// -- batch --

#[test]
fn test_batch_all_succeed() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = call(&mcp, "batch", serde_json::json!({
        "operations": [
            {"tool": "node_create", "input": {"path": "BatchA.md", "title": "Batch A", "type": "concept"}},
            {"tool": "node_create", "input": {"path": "BatchB.md", "title": "Batch B", "type": "concept"}},
            {"tool": "link_create", "input": {"source": "BatchA.md", "target": "BatchB.md", "rel": "related-to"}}
        ]
    }));
    assert_eq!(result["success"], true);
    assert_eq!(result["data"]["total"].as_u64().unwrap(), 3);
    assert_eq!(result["data"]["succeeded"].as_u64().unwrap(), 3);
    assert_eq!(result["data"]["failed"].as_u64().unwrap(), 0);
}

#[test]
fn test_batch_stops_on_failure() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = call(&mcp, "batch", serde_json::json!({
        "operations": [
            {"tool": "node_create", "input": {"path": "BatchC.md", "title": "Batch C", "type": "concept"}},
            {"tool": "node_get", "input": {"path": "nonexistent.md"}},
            {"tool": "node_create", "input": {"path": "BatchD.md", "title": "Batch D", "type": "concept"}}
        ]
    }));
    assert_eq!(result["success"], false);
    let data = &result["data"];
    assert_eq!(data["succeeded"].as_u64().unwrap(), 1);
    assert_eq!(data["failed"].as_u64().unwrap(), 1);
    assert_eq!(data["skipped"].as_u64().unwrap(), 1);
}

#[test]
fn test_link_list_both_direction_returns_incoming_and_outgoing_keys() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    // Judea Pearl has outgoing authored-by links; Causal Inference.md has backlinks to it
    let result = call(&mcp, "link_list", serde_json::json!({
        "path": "People/Judea Pearl.md",
        "direction": "both"
    }));
    assert_eq!(result["success"], true);
    assert!(result["data"]["incoming"].is_array(), "expected 'incoming' array for direction=both");
    assert!(result["data"]["outgoing"].is_array(), "expected 'outgoing' array for direction=both");
    assert!(result["data"]["links"].is_null() || result["data"]["links"] == serde_json::Value::Null,
        "unexpected 'links' key present for direction=both");
    let total = result["data"]["total"].as_u64().unwrap();
    let incoming_len = result["data"]["incoming"].as_array().unwrap().len() as u64;
    let outgoing_len = result["data"]["outgoing"].as_array().unwrap().len() as u64;
    assert_eq!(total, incoming_len + outgoing_len);
}

#[test]
fn test_link_list_default_direction_returns_incoming_and_outgoing_keys() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    // Omitting direction should also produce the "both" shape
    let result = call(&mcp, "link_list", serde_json::json!({
        "path": "People/Judea Pearl.md"
    }));
    assert_eq!(result["success"], true);
    assert!(result["data"]["incoming"].is_array(), "expected 'incoming' array for default direction");
    assert!(result["data"]["outgoing"].is_array(), "expected 'outgoing' array for default direction");
}

#[test]
fn test_node_update_clear_fields_nulls_source_and_summary() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    // Create a note with source and summary set
    call(&mcp, "node_create", serde_json::json!({
        "path": "Concepts/ClearTest.md",
        "title": "Clear Test",
        "type": "concept",
        "source": "https://example.com",
        "summary": "A summary"
    }));

    // Verify they are set
    let before = call(&mcp, "node_get", serde_json::json!({"path": "Concepts/ClearTest.md"}));
    assert_eq!(before["data"]["frontmatter"]["source"], "https://example.com");
    assert_eq!(before["data"]["frontmatter"]["summary"], "A summary");

    // Clear both fields
    let update = call(&mcp, "node_update", serde_json::json!({
        "path": "Concepts/ClearTest.md",
        "clear_fields": ["source", "summary"]
    }));
    assert_eq!(update["success"], true);

    // Verify they are cleared
    let after = call(&mcp, "node_get", serde_json::json!({"path": "Concepts/ClearTest.md"}));
    assert!(
        after["data"]["frontmatter"]["source"].is_null(),
        "source should be null after clear"
    );
    assert!(
        after["data"]["frontmatter"]["summary"].is_null(),
        "summary should be null after clear"
    );
}

#[test]
fn test_node_update_clear_fields_takes_priority_over_explicit_status() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    call(&mcp, "node_create", serde_json::json!({
        "path": "Concepts/StatusTest.md",
        "title": "Status Test",
        "type": "concept",
        "status": "draft"
    }));

    // clear_fields should win over an explicit status value
    let update = call(&mcp, "node_update", serde_json::json!({
        "path": "Concepts/StatusTest.md",
        "clear_fields": ["status"],
        "status": "final"
    }));
    assert_eq!(update["success"], true);

    let after = call(&mcp, "node_get", serde_json::json!({"path": "Concepts/StatusTest.md"}));
    assert!(
        after["data"]["frontmatter"]["status"].is_null(),
        "status should be null when clear_fields includes 'status'"
    );
}

#[test]
fn test_reindex_returns_nodes_indexed_and_duration_ms() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = call(&mcp, "reindex", serde_json::json!({}));
    assert_eq!(result["success"], true);
    assert!(result["data"]["nodes_indexed"].as_u64().is_some(), "expected nodes_indexed field");
    assert!(result["data"]["nodes_indexed"].as_u64().unwrap() >= 30);
    assert!(result["data"]["duration_ms"].as_u64().is_some(), "expected duration_ms field");
    assert!(result["data"]["reindexed"].is_null() || result["data"]["reindexed"] == serde_json::Value::Null,
        "old 'reindexed' key should not be present");
}
