use std::path::{Path, PathBuf};
use std::time::Duration;

use notify_debouncer_mini::{new_debouncer, notify::RecursiveMode, DebouncedEventKind};
use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager};
use tokio::sync::mpsc;
use tracing::{debug, error, warn};

use brainmap_core::model::{Edge, EdgeKind, NodeData, RelativePath};

use crate::state::AppState;

/// Payload emitted to the frontend when the graph topology changes.
#[derive(Serialize, Clone)]
pub(crate) struct TopologyChangedPayload {
    #[serde(rename = "type")]
    event_type: &'static str,
    /// Canonicalized root path identifying which workspace this event belongs to.
    workspace_root: String,
    added_nodes: Vec<NodeDtoPayload>,
    removed_nodes: Vec<String>,
    added_edges: Vec<EdgeDtoPayload>,
    removed_edges: Vec<EdgeDtoPayload>,
}

#[derive(Serialize, Clone)]
pub(crate) struct NodeDtoPayload {
    pub path: String,
    pub title: String,
    pub note_type: String,
    pub tags: Vec<String>,
    pub summary: Option<String>,
    pub modified: Option<String>,
}

#[derive(Serialize, Clone)]
pub(crate) struct EdgeDtoPayload {
    pub source: String,
    pub target: String,
    pub rel: String,
    pub kind: String,
}

/// Emit a topology-changed event to the frontend.
/// Used by both the file watcher and Tauri command handlers.
pub(crate) fn emit_topology_event(
    app: &AppHandle,
    workspace_root: &str,
    added_nodes: Vec<NodeDtoPayload>,
    removed_nodes: Vec<String>,
    added_edges: Vec<EdgeDtoPayload>,
    removed_edges: Vec<EdgeDtoPayload>,
) {
    let payload = TopologyChangedPayload {
        event_type: "topology-changed",
        workspace_root: workspace_root.to_string(),
        added_nodes,
        removed_nodes,
        added_edges,
        removed_edges,
    };
    if let Err(e) = app.emit("brainmap://workspace-event", payload) {
        error!(error = %e, root = %workspace_root, "failed to emit topology event");
    }
}

/// Emit a node-updated event to the frontend when a single node is modified.
/// Used by the file watcher when an existing .md file changes on disk.
pub(crate) fn emit_node_updated_event(
    app: &AppHandle,
    workspace_root: &str,
    path: &str,
    node: NodeDtoPayload,
) {
    #[derive(Serialize, Clone)]
    struct NodeUpdatedPayload {
        #[serde(rename = "type")]
        event_type: &'static str,
        workspace_root: String,
        path: String,
        node: NodeDtoPayload,
    }
    let payload = NodeUpdatedPayload {
        event_type: "node-updated",
        workspace_root: workspace_root.to_string(),
        path: path.to_string(),
        node,
    };
    if let Err(e) = app.emit("brainmap://workspace-event", payload) {
        error!(error = %e, root = %workspace_root, "failed to emit node-updated event");
    }
}

/// Emit a files-changed event for non-BrainMap file additions/removals.
pub(crate) fn emit_files_changed_event(
    app: &AppHandle,
    workspace_root: &str,
    added_files: Vec<String>,
    removed_files: Vec<String>,
) {
    #[derive(Serialize, Clone)]
    struct FilesChangedPayload {
        #[serde(rename = "type")]
        event_type: &'static str,
        workspace_root: String,
        added_files: Vec<String>,
        removed_files: Vec<String>,
    }
    let payload = FilesChangedPayload {
        event_type: "files-changed",
        workspace_root: workspace_root.to_string(),
        added_files,
        removed_files,
    };
    if let Err(e) = app.emit("brainmap://workspace-event", payload) {
        error!(error = %e, root = %workspace_root, "failed to emit files-changed event");
    }
}

/// Convert a `NodeData` to a `NodeDtoPayload`.
pub(crate) fn node_to_payload(n: &NodeData) -> NodeDtoPayload {
    NodeDtoPayload {
        path: n.path.as_str().to_string(),
        title: n.title.clone(),
        note_type: n.note_type.clone(),
        tags: n.tags.clone(),
        summary: n.summary.clone(),
        modified: n.modified.map(|d| d.to_string()),
    }
}

/// Convert an `Edge` to an `EdgeDtoPayload`.
pub(crate) fn edge_to_payload(e: &Edge) -> EdgeDtoPayload {
    EdgeDtoPayload {
        source: e.source.as_str().to_string(),
        target: e.target.as_str().to_string(),
        rel: e.rel.clone(),
        kind: match e.kind {
            EdgeKind::Explicit => "Explicit".to_string(),
            EdgeKind::Implicit => "Implicit".to_string(),
            EdgeKind::Inline => "Inline".to_string(),
        },
    }
}

/// Represents whether a watched file is a BrainMap note (.md) or a plain file.
enum WatchedFile {
    Markdown(PathBuf),
    Plain(PathBuf),
}

/// Start watching `workspace_root` recursively. Debounces events by 1 second.
/// `.md` file events trigger topology updates; other file events trigger files-changed updates.
///
/// `canonical_root` is the HashMap key used to access the correct slot.
/// `workspace_root` is the actual filesystem path to watch.
///
/// Returns the `Debouncer` handle — the caller must keep it alive.
/// Dropping the handle stops all watching.
pub fn start_watcher(
    app_handle: AppHandle,
    canonical_root: String,
    workspace_root: &Path,
) -> notify_debouncer_mini::Debouncer<notify::RecommendedWatcher> {
    let (tx, mut rx) = mpsc::unbounded_channel::<WatchedFile>();

    let mut debouncer = new_debouncer(Duration::from_secs(1), move |result: Result<Vec<notify_debouncer_mini::DebouncedEvent>, _>| {
        if let Ok(events) = result {
            for event in events {
                if event.kind != DebouncedEventKind::Any {
                    continue;
                }
                // Skip hidden files/directories (e.g., .brainmap/, .git/)
                let path_str = event.path.to_string_lossy();
                if path_str.contains("/.") || path_str.contains("\\.") {
                    continue;
                }
                if event.path.extension().and_then(|e| e.to_str()) == Some("md") {
                    debug!(path = %event.path.display(), "watcher: md file event");
                    let _ = tx.send(WatchedFile::Markdown(event.path.clone()));
                } else if event.path.is_file() || !event.path.exists() {
                    // File exists → added/modified; doesn't exist → may be removed
                    debug!(path = %event.path.display(), "watcher: plain file event");
                    let _ = tx.send(WatchedFile::Plain(event.path.clone()));
                } else {
                    debug!(path = %event.path.display(), is_file = event.path.is_file(), exists = event.path.exists(), "watcher: skipped non-file event");
                }
            }
        }
    })
    .expect("failed to create file watcher");

    debouncer
        .watcher()
        .watch(workspace_root, RecursiveMode::Recursive)
        .expect("failed to watch workspace root");

    // Capture owned canonical_root for the async task.
    let root_key = canonical_root;
    tokio::spawn(async move {
        while let Some(watched) = rx.recv().await {
            match watched {
                WatchedFile::Markdown(path) => {
                    process_md_change(&app_handle, &root_key, path).await;
                }
                WatchedFile::Plain(path) => {
                    process_plain_change(&app_handle, &root_key, path).await;
                }
            }
        }
    });

    debouncer
}

/// Process a markdown (.md) file change event for a specific workspace slot.
async fn process_md_change(app: &AppHandle, root_key: &str, path: PathBuf) {
    let state = app.state::<AppState>();

    // Get the actual workspace root from the slot (for path stripping).
    let workspace_root = match state.with_slot(root_key, |slot| Ok(slot.workspace.root.clone())) {
        Ok(root) => root,
        Err(_) => return, // Slot was removed (workspace closed)
    };

    let rel_path = match path.strip_prefix(&workspace_root) {
        Ok(rel) => RelativePath::new(&rel.to_string_lossy().replace('\\', "/")),
        Err(_) => return,
    };
    let rel_path_str = rel_path.as_str().to_string();

    // Expected writes are scoped per slot.
    if state.consume_expected_write(root_key, &path) {
        return;
    }

    let path_exists = path.exists();
    let path_is_known = state
        .with_slot(root_key, |slot| {
            Ok(slot.workspace.notes.contains_key(&rel_path))
        })
        .unwrap_or(false);

    let diff_result = if path_exists && path_is_known {
        state.with_slot_mut(root_key, |slot| {
            slot.workspace
                .reload_file(&rel_path_str)
                .map_err(|e| e.to_string())
        })
    } else if path_exists {
        state.with_slot_mut(root_key, |slot| {
            slot.workspace
                .add_file(&rel_path_str)
                .map_err(|e| e.to_string())
        })
    } else {
        state.with_slot_mut(root_key, |slot| {
            slot.workspace
                .remove_file(&rel_path_str)
                .map_err(|e| e.to_string())
        })
    };

    let diff = match diff_result {
        Ok(d) => d,
        Err(e) => {
            warn!(path = %rel_path_str, root = %root_key, error = %e, "watcher: error processing md file change");
            return;
        }
    };

    emit_topology_event(
        app,
        root_key,
        diff.added_nodes.iter().map(node_to_payload).collect(),
        diff.removed_nodes
            .iter()
            .map(|p| p.as_str().to_string())
            .collect(),
        diff.added_edges.iter().map(edge_to_payload).collect(),
        diff.removed_edges.iter().map(edge_to_payload).collect(),
    );

    // For modifications (not adds/removes), reload_file returns empty added_nodes.
    // Emit a separate node-updated event so the frontend graph updates node metadata
    // (title, type, tags) and the editor gets notified via markExternalChange().
    if path_exists && path_is_known {
        let updated_node = state
            .with_slot(root_key, |slot| {
                let rp = RelativePath::new(&rel_path_str);
                Ok(slot.workspace.graph.get_node(&rp).map(node_to_payload))
            })
            .ok()
            .flatten();
        if let Some(node) = updated_node {
            emit_node_updated_event(app, root_key, &rel_path_str, node);
        }
    }
}

/// Process a non-markdown file change event (additions/removals only).
async fn process_plain_change(app: &AppHandle, root_key: &str, path: PathBuf) {
    let state = app.state::<AppState>();
    debug!(path = %path.display(), root = %root_key, "watcher: process_plain_change entered");

    let workspace_root = match state.with_slot(root_key, |slot| Ok(slot.workspace.root.clone())) {
        Ok(root) => root,
        Err(_) => return,
    };

    let rel_path = match path.strip_prefix(&workspace_root) {
        Ok(rel) => rel.to_string_lossy().replace('\\', "/"),
        Err(_) => return,
    };

    // Expected writes are scoped per slot.
    if state.consume_expected_write(root_key, &path) {
        debug!(path = %rel_path, root = %root_key, "watcher: consumed expected write, skipping");
        return;
    }

    if path.exists() {
        debug!(path = %rel_path, root = %root_key, "watcher: emitting files-changed (added)");
        emit_files_changed_event(app, root_key, vec![rel_path], vec![]);
    } else {
        debug!(path = %rel_path, root = %root_key, "watcher: emitting files-changed (removed)");
        emit_files_changed_event(app, root_key, vec![], vec![rel_path]);
    }
}
