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
