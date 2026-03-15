use std::path::PathBuf;
use std::sync::{LazyLock, Mutex};

use brainmap_core::workspace::{Severity, Workspace};

fn seed_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .join("seed")
}

static SEED_WORKSPACE: LazyLock<Mutex<Workspace>> = LazyLock::new(|| {
    Mutex::new(Workspace::open(&seed_path()).expect("seed workspace should open without fatal errors"))
});

#[test]
fn test_seed_workspace_opens() {
    let ws = SEED_WORKSPACE.lock().unwrap_or_else(|e| e.into_inner());
    assert!(
        ws.notes.len() >= 30,
        "expected at least 30 notes, got {}",
        ws.notes.len()
    );
}

#[test]
fn test_seed_all_note_types_present() {
    let ws = SEED_WORKSPACE.lock().unwrap_or_else(|e| e.into_inner());
    let stats = ws.stats();

    let expected_types = vec![
        "index",
        "book-note",
        "concept",
        "person",
        "question",
        "argument",
        "evidence",
        "experiment",
        "project",
    ];

    for t in &expected_types {
        assert!(
            stats.nodes_by_type.contains_key(*t),
            "missing note type: {}",
            t
        );
    }
}

#[test]
fn test_seed_validation_catches_broken_link() {
    let ws = SEED_WORKSPACE.lock().unwrap_or_else(|e| e.into_inner());
    let issues = ws.validate();

    let broken_links: Vec<_> = issues
        .iter()
        .filter(|i| i.severity == Severity::Error && i.message.contains("broken link"))
        .collect();

    assert!(
        !broken_links.is_empty(),
        "expected at least one broken link (Concepts/Deleted Note.md)"
    );
}

#[test]
fn test_seed_no_orphan_notes_with_folder_hierarchy() {
    // With folder nodes, all notes in subdirectories are children of their parent folder.
    // No orphan notes should exist in the seed dataset (all notes are in subdirectories).
    let ws = SEED_WORKSPACE.lock().unwrap_or_else(|e| e.into_inner());
    let issues = ws.validate();

    let orphan_notes: Vec<_> = issues
        .iter()
        .filter(|i| i.message.contains("orphan") && i.message.ends_with(".md"))
        .collect();

    assert!(
        orphan_notes.is_empty(),
        "expected no orphan notes with folder hierarchy, but found: {:?}",
        orphan_notes.iter().map(|i| &i.message).collect::<Vec<_>>()
    );
}

#[test]
fn test_seed_folder_nodes_exist() {
    let ws = SEED_WORKSPACE.lock().unwrap_or_else(|e| e.into_inner());
    let stats = ws.stats();
    assert!(
        stats.nodes_by_type.contains_key("folder"),
        "expected folder nodes in the graph"
    );
    let folder_count = stats.nodes_by_type["folder"];
    assert!(
        folder_count >= 5,
        "expected at least 5 folder nodes, got {}",
        folder_count
    );
}

#[test]
fn test_seed_validation_federation_warning() {
    let ws = SEED_WORKSPACE.lock().unwrap_or_else(|e| e.into_inner());
    let issues = ws.validate();

    let federation_warnings: Vec<_> = issues
        .iter()
        .filter(|i| i.severity == Severity::Warning && i.message.contains("federation"))
        .collect();

    assert!(
        !federation_warnings.is_empty(),
        "expected federation stub warning for Personal::Notes/Some Topic.md"
    );
}

#[test]
fn test_seed_search_works() {
    let ws = SEED_WORKSPACE.lock().unwrap_or_else(|e| e.into_inner());
    let results = ws
        .index
        .search("causality", &brainmap_core::index::SearchFilters::default())
        .unwrap();

    assert!(
        !results.is_empty(),
        "search for 'causality' should return results"
    );
}

#[test]
fn test_assert_invariants_passes_on_seed() {
    let ws = SEED_WORKSPACE.lock().unwrap_or_else(|e| e.into_inner());
    ws.graph.assert_invariants();
}

#[test]
fn test_seed_graph_has_edges() {
    let ws = SEED_WORKSPACE.lock().unwrap_or_else(|e| e.into_inner());
    let stats = ws.stats();

    assert!(
        stats.edge_count > 20,
        "expected more than 20 edges, got {}",
        stats.edge_count
    );
}
