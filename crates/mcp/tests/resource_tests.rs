use brainmap_mcp::BrainMapMcp;
use rmcp::model::ResourceContents;
use std::path::Path;
use tempfile::TempDir;

fn setup_workspace() -> TempDir {
    use brainmap_core::workspace::Workspace;
    let dir = TempDir::new().unwrap();
    let seed_dir = Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .join("seed");

    copy_dir_recursive(&seed_dir, dir.path());
    // Initialize the workspace if it does not already have .brainmap
    if !dir.path().join(".brainmap").exists() {
        Workspace::init(dir.path()).unwrap();
    }
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

// -- list_resources --

#[test]
fn test_list_resources_includes_graph_and_config() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = mcp.list_resources_sync().unwrap();

    let graph = result.resources.iter().find(|r| r.uri == "brainmap://graph");
    assert!(graph.is_some(), "graph resource not found");
    assert_eq!(graph.unwrap().name, "Full Graph");

    let config = result.resources.iter().find(|r| r.uri == "brainmap://config");
    assert!(config.is_some(), "config resource not found");
    assert_eq!(config.unwrap().name, "Workspace Configuration");
}

#[test]
fn test_list_resources_includes_all_notes() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = mcp.list_resources_sync().unwrap();

    // graph + config + all notes (seed has ~34 notes)
    assert!(
        result.resources.len() >= 32,
        "expected at least 32 resources, got {}",
        result.resources.len()
    );

    // Check a specific note resource
    let causal = result
        .resources
        .iter()
        .find(|r| r.uri.contains("Causal Inference"));
    assert!(causal.is_some(), "Causal Inference note resource not found");
    assert_eq!(causal.unwrap().name, "Causal Inference");
}

#[test]
fn test_list_resources_node_uris_are_sorted() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = mcp.list_resources_sync().unwrap();

    // Skip graph and config (first two), check remaining are sorted by URI
    let node_uris: Vec<&str> = result
        .resources
        .iter()
        .skip(2)
        .map(|r| r.uri.as_str())
        .collect();
    let mut sorted = node_uris.clone();
    sorted.sort();
    assert_eq!(node_uris, sorted, "node resources should be sorted by URI");
}

// -- read_resource: nodes --

#[test]
fn test_read_resource_node_returns_note_json() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = mcp
        .read_resource_sync("brainmap://nodes/Concepts/Causal Inference.md")
        .unwrap();

    assert_eq!(result.contents.len(), 1);
    match &result.contents[0] {
        ResourceContents::TextResourceContents { uri, mime_type, text } => {
            assert_eq!(uri, "brainmap://nodes/Concepts/Causal Inference.md");
            assert_eq!(mime_type.as_deref(), Some("application/json"));
            let parsed: serde_json::Value = serde_json::from_str(text).unwrap();
            assert_eq!(parsed["frontmatter"]["title"], "Causal Inference");
            assert!(parsed["body"].is_string());
        }
        _ => panic!("expected text resource contents"),
    }
}

#[test]
fn test_read_resource_node_not_found() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = mcp.read_resource_sync("brainmap://nodes/nonexistent.md");
    assert!(result.is_err(), "should return error for missing note");
}

// -- read_resource: graph --

#[test]
fn test_read_resource_graph_returns_full_graph() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = mcp.read_resource_sync("brainmap://graph").unwrap();

    assert_eq!(result.contents.len(), 1);
    match &result.contents[0] {
        ResourceContents::TextResourceContents { uri, mime_type, text } => {
            assert_eq!(uri, "brainmap://graph");
            assert_eq!(mime_type.as_deref(), Some("application/json"));
            let parsed: serde_json::Value = serde_json::from_str(text).unwrap();
            let nodes = parsed["nodes"].as_array().unwrap();
            let edges = parsed["edges"].as_array().unwrap();
            assert!(nodes.len() >= 30, "expected >= 30 nodes, got {}", nodes.len());
            assert!(!edges.is_empty(), "expected at least one edge");
        }
        _ => panic!("expected text resource contents"),
    }
}

// -- read_resource: config --

#[test]
fn test_read_resource_config_returns_workspace_config() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = mcp.read_resource_sync("brainmap://config").unwrap();

    assert_eq!(result.contents.len(), 1);
    match &result.contents[0] {
        ResourceContents::TextResourceContents { uri, mime_type, text } => {
            assert_eq!(uri, "brainmap://config");
            assert_eq!(mime_type.as_deref(), Some("application/json"));
            let parsed: serde_json::Value = serde_json::from_str(text).unwrap();
            let note_types = parsed["note_types"].as_array().unwrap();
            let edge_types = parsed["edge_types"].as_array().unwrap();
            assert!(note_types.len() >= 10);
            assert!(edge_types.len() >= 15);
        }
        _ => panic!("expected text resource contents"),
    }
}

// -- read_resource: unknown URI --

#[test]
fn test_read_resource_unknown_uri_returns_error() {
    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let result = mcp.read_resource_sync("brainmap://unknown");
    assert!(result.is_err());
}

// -- get_info capability --

#[test]
fn test_get_info_has_resources_capability() {
    use rmcp::ServerHandler;

    let dir = setup_workspace();
    let mcp = make_mcp(&dir);

    let info = mcp.get_info();
    assert!(
        info.capabilities.resources.is_some(),
        "resources capability should be set"
    );
}
