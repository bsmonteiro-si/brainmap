use assert_cmd::Command;
use predicates::prelude::*;
use serde_json::Value;
use std::path::Path;
use tempfile::TempDir;

fn copy_seed(dest: &Path) {
    let seed_dir = Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .join("seed");

    copy_dir_recursive(&seed_dir, dest);
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

fn brainmap() -> Command {
    #[allow(deprecated)]
    Command::cargo_bin("brainmap").unwrap()
}

fn run_json(workspace: &Path, args: &[&str]) -> Value {
    let mut cmd = brainmap();
    cmd.arg("--workspace").arg(workspace).arg("--format").arg("json");
    for arg in args {
        cmd.arg(arg);
    }
    let output = cmd.output().unwrap();
    let stdout = String::from_utf8(output.stdout).unwrap();
    let stderr = String::from_utf8(output.stderr).unwrap();
    let combined = if stdout.trim().is_empty() { &stderr } else { &stdout };
    serde_json::from_str(combined).unwrap_or_else(|_| {
        panic!("Failed to parse JSON.\nstdout: {}\nstderr: {}", stdout, stderr)
    })
}

// -- Node Read --

#[test]
fn test_node_read_returns_note() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    let result = run_json(dir.path(), &["node", "read", "Concepts/Causal Inference.md"]);
    assert_eq!(result["success"], true);
    assert_eq!(result["data"]["frontmatter"]["title"], "Causal Inference");
    assert_eq!(result["data"]["frontmatter"]["type"], "concept");
}

#[test]
fn test_node_read_missing_returns_error() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    let result = run_json(dir.path(), &["node", "read", "nonexistent.md"]);
    assert_eq!(result["success"], false);
    assert_eq!(result["error"]["code"], "FILE_NOT_FOUND");
}

// -- Node List --

#[test]
fn test_node_list_all() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    let result = run_json(dir.path(), &["node", "list"]);
    assert_eq!(result["success"], true);
    assert!(result["data"]["total"].as_u64().unwrap() >= 30);
}

#[test]
fn test_node_list_filter_by_type() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    let result = run_json(dir.path(), &["node", "list", "--type", "question"]);
    assert_eq!(result["success"], true);

    let nodes = result["data"]["nodes"].as_array().unwrap();
    assert!(!nodes.is_empty());
    for node in nodes {
        assert_eq!(node["type"], "question");
    }
}

// -- Node Create + Read Round-trip --

#[test]
fn test_node_create_and_read_round_trip() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    let create = run_json(
        dir.path(),
        &[
            "node", "create", "Concepts/TestNote.md",
            "--title", "Test Note",
            "--type", "concept",
            "--tags", "test,integration",
            "--status", "draft",
            "--content", "This is test content.",
        ],
    );
    assert_eq!(create["success"], true);
    assert_eq!(create["data"]["path"], "Concepts/TestNote.md");

    let read = run_json(dir.path(), &["node", "read", "Concepts/TestNote.md"]);
    assert_eq!(read["success"], true);
    assert_eq!(read["data"]["frontmatter"]["title"], "Test Note");
    assert_eq!(read["data"]["frontmatter"]["type"], "concept");
    assert_eq!(read["data"]["body"], "This is test content.");
    let tags = read["data"]["frontmatter"]["tags"].as_array().unwrap();
    assert!(tags.contains(&Value::String("test".to_string())));
    assert!(tags.contains(&Value::String("integration".to_string())));
}

#[test]
fn test_node_create_duplicate_returns_error() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    let result = run_json(
        dir.path(),
        &["node", "create", "Concepts/Causal Inference.md", "--title", "Dup"],
    );
    assert_eq!(result["success"], false);
    assert_eq!(result["error"]["code"], "DUPLICATE_PATH");
}

// -- Node Update --

#[test]
fn test_node_update_changes_fields() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    run_json(
        dir.path(),
        &[
            "node", "create", "Concepts/Updatable.md",
            "--title", "Original",
            "--type", "concept",
        ],
    );

    let update = run_json(
        dir.path(),
        &[
            "node", "update", "Concepts/Updatable.md",
            "--title", "Changed Title",
            "--tags", "new-tag",
        ],
    );
    assert_eq!(update["success"], true);

    let read = run_json(dir.path(), &["node", "read", "Concepts/Updatable.md"]);
    assert_eq!(read["data"]["frontmatter"]["title"], "Changed Title");
    let tags = read["data"]["frontmatter"]["tags"].as_array().unwrap();
    assert!(tags.contains(&Value::String("new-tag".to_string())));
}

// -- Node Delete --

#[test]
fn test_node_delete_force() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    run_json(
        dir.path(),
        &["node", "create", "Concepts/ToDelete.md", "--title", "Temp"],
    );

    let delete = run_json(dir.path(), &["node", "delete", "Concepts/ToDelete.md", "--force"]);
    assert_eq!(delete["success"], true);

    let read = run_json(dir.path(), &["node", "read", "Concepts/ToDelete.md"]);
    assert_eq!(read["success"], false);
    assert_eq!(read["error"]["code"], "FILE_NOT_FOUND");
}

#[test]
fn test_node_delete_with_backlinks_blocked() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    let result = run_json(
        dir.path(),
        &["node", "delete", "Concepts/Causal Inference.md"],
    );
    assert_eq!(result["success"], false);
    assert_eq!(result["error"]["code"], "HAS_BACKLINKS");
    assert!(result["error"]["data"].as_array().unwrap().len() > 0);
}

#[test]
fn test_node_delete_dry_run() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    let result = run_json(
        dir.path(),
        &["node", "delete", "Concepts/Causal Inference.md", "--dry-run"],
    );
    assert_eq!(result["success"], true);
    assert!(result["data"]["backlinks"].as_array().unwrap().len() > 0);

    let still_exists = run_json(dir.path(), &["node", "read", "Concepts/Causal Inference.md"]);
    assert_eq!(still_exists["success"], true);
}

// -- Search --

#[test]
fn test_search_returns_results() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    let result = run_json(dir.path(), &["search", "causality"]);
    assert_eq!(result["success"], true);
    assert!(result["data"]["total"].as_u64().unwrap() > 0);
}

#[test]
fn test_search_with_type_filter() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    let result = run_json(dir.path(), &["search", "causality", "--type", "concept"]);
    assert_eq!(result["success"], true);

    let results = result["data"]["results"].as_array().unwrap();
    for r in results {
        assert_eq!(r["note_type"], "concept");
    }
}

// -- Link Create + List Round-trip --

#[test]
fn test_link_create_and_list_round_trip() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    run_json(
        dir.path(),
        &["node", "create", "Concepts/LinkTest.md", "--title", "Link Test"],
    );

    let create = run_json(
        dir.path(),
        &[
            "link", "create",
            "Concepts/LinkTest.md", "Concepts/Causal Inference.md",
            "--rel", "related-to",
        ],
    );
    assert_eq!(create["success"], true);

    let list = run_json(
        dir.path(),
        &["link", "list", "Concepts/LinkTest.md", "--direction", "out"],
    );
    assert_eq!(list["success"], true);

    let links = list["data"]["links"].as_array().unwrap();
    assert!(links.iter().any(|l| {
        l["target"] == "Concepts/Causal Inference.md" && l["rel"] == "related-to"
    }));
}

// -- Neighbors --

#[test]
fn test_neighbors_returns_subgraph() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    let result = run_json(
        dir.path(),
        &["neighbors", "Concepts/Causal Inference.md", "--depth", "1"],
    );
    assert_eq!(result["success"], true);
    assert!(result["data"]["nodes"].as_array().unwrap().len() > 1);
    assert!(result["data"]["edges"].as_array().unwrap().len() > 0);
}

#[test]
fn test_neighbors_with_rel_filter() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    let result = run_json(
        dir.path(),
        &[
            "neighbors", "Concepts/Causal Inference.md",
            "--depth", "1",
            "--rel", "contains",
        ],
    );
    assert_eq!(result["success"], true);

    let edges = result["data"]["edges"].as_array().unwrap();
    for edge in edges {
        assert_eq!(edge["rel"], "contains");
    }
}

// -- Validate --

#[test]
fn test_validate_returns_issues() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    let result = run_json(dir.path(), &["validate"]);
    assert_eq!(result["success"], true);
    assert!(result["data"]["error_count"].as_u64().unwrap() >= 1);
}

// -- Stats --

#[test]
fn test_stats_returns_counts() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    let result = run_json(dir.path(), &["stats"]);
    assert_eq!(result["success"], true);
    assert!(result["data"]["node_count"].as_u64().unwrap() >= 30);
    assert!(result["data"]["edge_count"].as_u64().unwrap() > 0);
}

// -- Status --

#[test]
fn test_status_returns_summary() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    let result = run_json(dir.path(), &["status"]);
    assert_eq!(result["success"], true);
    assert!(result["data"]["node_count"].as_u64().unwrap() >= 30);
}

// -- Path --

#[test]
fn test_path_finds_route() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    let result = run_json(
        dir.path(),
        &["path", "Concepts/Causal Inference.md", "People/Judea Pearl.md"],
    );
    assert_eq!(result["success"], true);
    assert_eq!(result["data"]["found"], true);
    assert!(result["data"]["hops"].as_u64().unwrap() >= 1);
}

#[test]
fn test_path_not_found() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    let result = run_json(
        dir.path(),
        &["path", "Concepts/Granger Causality.md", "People/Judea Pearl.md"],
    );
    assert_eq!(result["success"], true);
    assert_eq!(result["data"]["found"], false);
}

// -- Subgraph --

#[test]
fn test_subgraph_returns_nodes() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    let result = run_json(
        dir.path(),
        &["subgraph", "Concepts/Causal Inference.md", "--depth", "1"],
    );
    assert_eq!(result["success"], true);
    assert!(result["data"]["nodes"].as_array().unwrap().len() > 1);
}

// -- Export --

#[test]
fn test_export_dot_format() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    brainmap()
        .arg("--workspace").arg(dir.path())
        .arg("export").arg("--export-format").arg("dot")
        .assert()
        .success()
        .stdout(predicate::str::contains("digraph"));
}

#[test]
fn test_export_graphml_format() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    brainmap()
        .arg("--workspace").arg(dir.path())
        .arg("export").arg("--export-format").arg("graphml")
        .assert()
        .success()
        .stdout(predicate::str::contains("<graphml"));
}

// -- Reindex --

#[test]
fn test_reindex_succeeds() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    let result = run_json(dir.path(), &["reindex"]);
    assert_eq!(result["success"], true);
    assert_eq!(result["data"]["reindexed"], true);
}

// -- Config --

#[test]
fn test_config_list() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    let result = run_json(dir.path(), &["config"]);
    assert_eq!(result["success"], true);
    assert!(result["data"]["note_types"].as_array().unwrap().len() >= 10);
}

// -- Federation --

#[test]
fn test_federation_add_list_remove() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    let add = run_json(dir.path(), &["federation", "add", "other", "/tmp/other"]);
    assert_eq!(add["success"], true);

    let list = run_json(dir.path(), &["federation", "list"]);
    assert_eq!(list["success"], true);
    assert!(list["data"]["total"].as_u64().unwrap() >= 1);

    let remove = run_json(dir.path(), &["federation", "remove", "other"]);
    assert_eq!(remove["success"], true);
    assert_eq!(remove["data"]["removed"], true);
}

// -- Link Delete --

#[test]
fn test_link_delete() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    // Create node + link, then delete the link
    run_json(
        dir.path(),
        &["node", "create", "Concepts/DelLinkTest.md", "--title", "Del Link Test"],
    );
    run_json(
        dir.path(),
        &["link", "create", "Concepts/DelLinkTest.md", "Concepts/Causal Inference.md", "--rel", "related-to"],
    );

    let delete = run_json(
        dir.path(),
        &["link", "delete", "Concepts/DelLinkTest.md", "Concepts/Causal Inference.md", "--rel", "related-to"],
    );
    assert_eq!(delete["success"], true);

    // Verify link is gone
    let list = run_json(
        dir.path(),
        &["link", "list", "Concepts/DelLinkTest.md", "--direction", "out"],
    );
    assert_eq!(list["data"]["total"], 0);
}

// -- Node Move --

#[test]
fn test_node_move() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    run_json(
        dir.path(),
        &["node", "create", "Concepts/Movable.md", "--title", "Movable"],
    );

    let mv = run_json(
        dir.path(),
        &["node", "move", "Concepts/Movable.md", "Archive/Movable.md"],
    );
    assert_eq!(mv["success"], true);

    let old = run_json(dir.path(), &["node", "read", "Concepts/Movable.md"]);
    assert_eq!(old["success"], false);

    let new = run_json(dir.path(), &["node", "read", "Archive/Movable.md"]);
    assert_eq!(new["success"], true);
    assert_eq!(new["data"]["frontmatter"]["title"], "Movable");
}

// -- Text output --

#[test]
fn test_text_output_works() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    brainmap()
        .arg("--workspace").arg(dir.path())
        .arg("node").arg("list").arg("--type").arg("question")
        .assert()
        .success()
        .stdout(predicate::str::contains("[question]"));
}

// -- YAML output format --

fn run_yaml(workspace: &Path, args: &[&str]) -> serde_yaml::Value {
    let mut cmd = brainmap();
    cmd.arg("--workspace").arg(workspace).arg("--format").arg("yaml");
    for arg in args {
        cmd.arg(arg);
    }
    let output = cmd.output().unwrap();
    let stdout = String::from_utf8(output.stdout).unwrap();
    let stderr = String::from_utf8(output.stderr).unwrap();
    let combined = if stdout.trim().is_empty() { &stderr } else { &stdout };
    serde_yaml::from_str(combined).unwrap_or_else(|e| {
        panic!("Failed to parse YAML: {}\nstdout: {}\nstderr: {}", e, stdout, stderr)
    })
}

#[test]
fn test_yaml_output_stats() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    let result = run_yaml(dir.path(), &["stats"]);
    assert_eq!(result["success"], serde_yaml::Value::Bool(true));
    assert!(result["data"]["node_count"].as_u64().unwrap() >= 30);
    assert!(result["data"]["edge_count"].as_u64().unwrap() > 0);
}

#[test]
fn test_yaml_output_node_read() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    let result = run_yaml(dir.path(), &["node", "read", "Concepts/Causal Inference.md"]);
    assert_eq!(result["success"], serde_yaml::Value::Bool(true));
    assert_eq!(
        result["data"]["frontmatter"]["title"],
        serde_yaml::Value::String("Causal Inference".to_string())
    );
}

#[test]
fn test_yaml_output_error() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    let result = run_yaml(dir.path(), &["node", "read", "nonexistent.md"]);
    assert_eq!(result["success"], serde_yaml::Value::Bool(false));
    assert_eq!(
        result["error"]["code"],
        serde_yaml::Value::String("FILE_NOT_FOUND".to_string())
    );
}

#[test]
fn test_yaml_output_search() {
    let dir = TempDir::new().unwrap();
    copy_seed(dir.path());

    let result = run_yaml(dir.path(), &["search", "causality"]);
    assert_eq!(result["success"], serde_yaml::Value::Bool(true));
    assert!(result["data"]["total"].as_u64().unwrap() > 0);
}
