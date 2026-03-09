use std::path::PathBuf;

use brainmap_core::workspace::{Severity, Workspace};

fn seed_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .join("seed")
}

#[test]
fn test_seed_workspace_opens() {
    let path = seed_path();
    let ws = Workspace::open(&path).expect("seed workspace should open without fatal errors");

    assert!(
        ws.notes.len() >= 30,
        "expected at least 30 notes, got {}",
        ws.notes.len()
    );
}

#[test]
fn test_seed_all_note_types_present() {
    let ws = Workspace::open(&seed_path()).unwrap();
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
    let ws = Workspace::open(&seed_path()).unwrap();
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
fn test_seed_validation_catches_orphan() {
    let ws = Workspace::open(&seed_path()).unwrap();
    let issues = ws.validate();

    let orphans: Vec<_> = issues
        .iter()
        .filter(|i| i.message.contains("orphan") && i.message.contains("Granger"))
        .collect();

    assert!(
        !orphans.is_empty(),
        "expected Granger Causality to be detected as orphan"
    );
}

#[test]
fn test_seed_validation_federation_warning() {
    let ws = Workspace::open(&seed_path()).unwrap();
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
    let ws = Workspace::open(&seed_path()).unwrap();
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
fn test_seed_graph_has_edges() {
    let ws = Workspace::open(&seed_path()).unwrap();
    let stats = ws.stats();

    assert!(
        stats.edge_count > 20,
        "expected more than 20 edges, got {}",
        stats.edge_count
    );
}
