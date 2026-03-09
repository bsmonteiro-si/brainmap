use std::time::Instant;

use brainmap_core::workspace::Workspace;
use tempfile::TempDir;

#[test]
fn test_500_node_load_under_2_seconds() {
    let dir = TempDir::new().unwrap();
    Workspace::init(dir.path()).unwrap();

    for i in 0..500 {
        let note_type = match i % 5 {
            0 => "concept",
            1 => "book-note",
            2 => "person",
            3 => "question",
            _ => "reference",
        };

        let links = if i > 0 {
            format!(
                r#"links:
  - target: "note_{}.md"
    type: related-to"#,
                i - 1
            )
        } else {
            "links: []".to_string()
        };

        let content = format!(
            r#"---
id: "{}"
title: "Note {}"
type: {}
tags: [test, performance]
created: 2026-01-15
modified: 2026-01-15
{}
---

# Note {}

This is synthetic note number {} for performance testing.
Content varies to test full-text search indexing.
Topic: {} concepts and relationships.
"#,
            uuid::Uuid::new_v4(),
            i,
            note_type,
            links,
            i,
            i,
            note_type
        );

        std::fs::write(dir.path().join(format!("note_{}.md", i)), content).unwrap();
    }

    let start = Instant::now();
    let ws = Workspace::open(dir.path()).unwrap();
    let elapsed = start.elapsed();

    assert_eq!(ws.notes.len(), 500);
    assert!(
        elapsed.as_secs() < 2,
        "500-node load took {:?}, expected <2s",
        elapsed
    );

    println!("500-node workspace loaded in {:?}", elapsed);
}
