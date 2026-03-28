use std::path::{Path, PathBuf};

use brainmap_core::workspace::Workspace;

fn seed_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .join("seed")
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

fn temp_workspace() -> (tempfile::TempDir, Workspace) {
    let tmp = tempfile::tempdir().unwrap();
    copy_dir_recursive(&seed_path(), tmp.path());
    let ws = Workspace::open(tmp.path()).unwrap();
    (tmp, ws)
}

#[test]
fn test_reload_file_updates_title() {
    let (tmp, mut ws) = temp_workspace();

    let rel_path = "Concepts/Structural Causal Models.md";
    let file_path = tmp.path().join(rel_path);
    let content = std::fs::read_to_string(&file_path).unwrap();
    let new_content = content.replace(
        "title: \"Structural Causal Models\"",
        "title: \"Updated SCM Title\"",
    );
    assert_ne!(content, new_content, "title replacement should have changed content");
    std::fs::write(&file_path, new_content).unwrap();

    let diff = ws.reload_file(rel_path).unwrap();

    let note = ws.read_note(rel_path).unwrap();
    assert_eq!(note.frontmatter.title, "Updated SCM Title");

    assert!(diff.added_nodes.is_empty());
    assert!(diff.removed_nodes.is_empty());
}

#[test]
fn test_add_file_new_note() {
    let (tmp, mut ws) = temp_workspace();
    let initial_count = ws.notes.len();

    let rel_path = "new-test-note.md";
    let content = r#"---
id: 00000000-0000-0000-0000-000000000099
title: Test Note
type: concept
created: 2025-01-01
modified: 2025-01-01
---
This is a test note.
"#;
    std::fs::write(tmp.path().join(rel_path), content).unwrap();

    let diff = ws.add_file(rel_path).unwrap();

    assert_eq!(ws.notes.len(), initial_count + 1);
    assert_eq!(diff.added_nodes.len(), 1);
    assert_eq!(diff.added_nodes[0].title, "Test Note");
    assert!(diff.removed_nodes.is_empty());

    let note = ws.read_note(rel_path).unwrap();
    assert_eq!(note.frontmatter.title, "Test Note");
}

#[test]
fn test_add_file_already_tracked_delegates_to_reload() {
    let (_tmp, mut ws) = temp_workspace();

    let rel_path = "Concepts/Structural Causal Models.md";
    let diff = ws.add_file(rel_path).unwrap();

    // Should not add a new node since it already existed
    assert!(diff.added_nodes.is_empty());

    let note = ws.read_note(rel_path).unwrap();
    assert!(!note.frontmatter.title.is_empty());
}

#[test]
fn test_remove_file_deletes_from_graph() {
    let (_tmp, mut ws) = temp_workspace();
    let initial_count = ws.notes.len();

    let rel_path = "Concepts/Structural Causal Models.md";
    assert!(ws.read_note(rel_path).is_ok());

    let diff = ws.remove_file(rel_path).unwrap();

    assert_eq!(ws.notes.len(), initial_count - 1);
    assert!(ws.read_note(rel_path).is_err());
    assert_eq!(diff.removed_nodes.len(), 1);
    assert!(diff.added_nodes.is_empty());
    assert!(!diff.removed_edges.is_empty());
}

#[test]
fn test_remove_file_nonexistent_is_noop() {
    let (_tmp, mut ws) = temp_workspace();
    let initial_count = ws.notes.len();

    let diff = ws.remove_file("nonexistent.md").unwrap();

    assert_eq!(ws.notes.len(), initial_count);
    assert!(diff.removed_nodes.is_empty());
    assert!(diff.added_nodes.is_empty());
}

// ── move_note tests ──────────────────────────────────────────────

#[test]
fn test_move_note_rewrites_own_outgoing_links() {
    let (_tmp, mut ws) = temp_workspace();

    // Find a note that has outgoing links
    let source_path = "The Book of Why/The Book of Why.md";
    let note = ws.read_note(source_path).unwrap();
    assert!(!note.frontmatter.links.is_empty(), "test note should have outgoing links");

    // Collect the resolved targets BEFORE the move
    let old_resolved: Vec<String> = note
        .frontmatter
        .links
        .iter()
        .map(|l| {
            let note_rp = brainmap_core::model::RelativePath::new(source_path);
            note_rp.resolve_relative(&l.target).as_str().to_string()
        })
        .collect();

    // Move the note to a different directory
    let new_path = "Concepts/The Book of Why.md";
    ws.move_note(source_path, new_path).unwrap();

    // Verify the note's outgoing links still resolve to the same targets
    let moved_note = ws.read_note(new_path).unwrap();
    let new_resolved: Vec<String> = moved_note
        .frontmatter
        .links
        .iter()
        .map(|l| {
            let note_rp = brainmap_core::model::RelativePath::new(new_path);
            note_rp.resolve_relative(&l.target).as_str().to_string()
        })
        .collect();

    assert_eq!(old_resolved, new_resolved, "outgoing links should resolve to the same targets after move");
}

// ── move_folder tests ────────────────────────────────────────────

#[test]
fn test_move_folder_basic() {
    let (_tmp, mut ws) = temp_workspace();

    // Count notes in the "Concepts" folder
    let concepts_count = ws.notes.keys()
        .filter(|p| p.as_str().starts_with("Concepts/"))
        .count();
    assert!(concepts_count > 0, "Concepts folder should have notes");

    let total_notes = ws.notes.len();

    // Move the folder
    let result = ws.move_folder("Concepts", "Topics/Concepts").unwrap();
    assert_eq!(result.moved_notes.len(), concepts_count);
    assert_eq!(ws.notes.len(), total_notes);

    // Old paths should no longer exist
    for (old_path, _) in &result.moved_notes {
        assert!(ws.read_note(old_path).is_err(), "old path {old_path} should not exist");
    }

    // New paths should exist
    for (_, new_path) in &result.moved_notes {
        assert!(ws.read_note(new_path).is_ok(), "new path {new_path} should exist");
    }

    // All new paths should start with "Topics/Concepts/"
    for (_, new_path) in &result.moved_notes {
        assert!(new_path.starts_with("Topics/Concepts/"), "new path {new_path} should be under Topics/Concepts/");
    }
}

#[test]
fn test_move_folder_rejects_duplicate() {
    let (_tmp, mut ws) = temp_workspace();

    // "Concepts" exists; trying to move "Questions" to "Concepts" should fail
    let err = ws.move_folder("Questions", "Concepts").unwrap_err();
    assert!(
        format!("{err}").contains("Concepts") || format!("{err}").contains("already exists"),
        "should fail with duplicate path error, got: {err}"
    );
}

#[test]
fn test_move_folder_rewrites_external_backlinks() {
    let (_tmp, mut ws) = temp_workspace();

    // Move Concepts folder
    let result = ws.move_folder("Concepts", "Moved/Concepts").unwrap();

    // If any external notes had links to notes in Concepts/, those should be rewritten
    // We can verify by checking that all edges targeting the new paths exist
    for (_, new_path) in &result.moved_notes {
        let rp = brainmap_core::model::RelativePath::new(new_path);
        let incoming = ws.graph.edges_for(&rp, &brainmap_core::model::Direction::Incoming);
        for edge in incoming {
            // Verify no edge still points at the old path
            assert!(
                !edge.target.as_str().starts_with("Concepts/"),
                "edge target should use new path, got: {}",
                edge.target.as_str()
            );
        }
    }
}

#[test]
fn test_move_folder_updates_folder_nodes() {
    let (_tmp, mut ws) = temp_workspace();

    // Before move: "Concepts" folder node should exist
    let concepts_rp = brainmap_core::model::RelativePath::new("Concepts");
    assert!(ws.graph.get_node(&concepts_rp).is_some(), "Concepts folder node should exist before move");

    ws.move_folder("Concepts", "Topics/Concepts").unwrap();

    // After move: "Concepts" folder node should be pruned
    assert!(ws.graph.get_node(&concepts_rp).is_none(), "Concepts folder node should be pruned after move");

    // New folder nodes should exist
    let topics_rp = brainmap_core::model::RelativePath::new("Topics");
    assert!(ws.graph.get_node(&topics_rp).is_some(), "Topics folder node should exist after move");
    let topics_concepts_rp = brainmap_core::model::RelativePath::new("Topics/Concepts");
    assert!(ws.graph.get_node(&topics_concepts_rp).is_some(), "Topics/Concepts folder node should exist after move");
}

#[test]
fn test_move_folder_nonexistent() {
    let (_tmp, mut ws) = temp_workspace();

    let err = ws.move_folder("NonexistentFolder", "Somewhere").unwrap_err();
    assert!(format!("{err}").contains("NonexistentFolder") || format!("{err}").contains("not found"));
}

// ── move_note title update tests ────────────────────────────────

#[test]
fn test_move_note_same_dir_updates_title() {
    let (_tmp, mut ws) = temp_workspace();

    let old_path = "Concepts/Confounding.md";
    let original_title = ws.read_note(old_path).unwrap().frontmatter.title.clone();
    assert_eq!(original_title, "Confounding");

    // Rename within the same directory
    let new_path = "Concepts/Confounding Variable.md";
    ws.move_note(old_path, new_path).unwrap();

    // Frontmatter title should match the new filename stem
    let note = ws.read_note(new_path).unwrap();
    assert_eq!(note.frontmatter.title, "Confounding Variable");

    // Graph node title should also be updated
    let rp = brainmap_core::model::RelativePath::new(new_path);
    let node_data = ws.graph.get_node(&rp).unwrap();
    assert_eq!(node_data.title, "Confounding Variable");
}

#[test]
fn test_move_note_different_dir_preserves_title() {
    let (_tmp, mut ws) = temp_workspace();

    let old_path = "Concepts/Confounding.md";
    let original_title = ws.read_note(old_path).unwrap().frontmatter.title.clone();

    // Move to a different directory
    let new_path = "The Book of Why/Confounding.md";
    ws.move_note(old_path, new_path).unwrap();

    // Title should be preserved (not changed to filename stem)
    let note = ws.read_note(new_path).unwrap();
    assert_eq!(note.frontmatter.title, original_title);
}

#[test]
fn test_move_note_same_dir_preserves_custom_title() {
    let (tmp, mut ws) = temp_workspace();

    let old_path = "Concepts/Confounding.md";
    // Set a custom title that differs from the filename stem
    let file_path = tmp.path().join(old_path);
    let content = std::fs::read_to_string(&file_path).unwrap();
    let updated = content.replace("title: \"Confounding\"", "title: \"Confounding Variables Explained\"");
    std::fs::write(&file_path, &updated).unwrap();
    ws.reload_file(old_path).unwrap();

    let note = ws.read_note(old_path).unwrap();
    assert_eq!(note.frontmatter.title, "Confounding Variables Explained");

    // Rename within the same directory
    let new_path = "Concepts/Confounders.md";
    ws.move_note(old_path, new_path).unwrap();

    // Custom title should be preserved (not overwritten with filename stem)
    let note = ws.read_note(new_path).unwrap();
    assert_eq!(note.frontmatter.title, "Confounding Variables Explained");
}
