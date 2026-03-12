use std::path::{Path, PathBuf};
use std::time::Duration;

use notify_debouncer_mini::{new_debouncer, notify::RecursiveMode, DebouncedEventKind};
use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager};
use tokio::sync::mpsc;
use tracing::{error, warn};

use brainmap_core::model::{EdgeKind, RelativePath};

use crate::state::AppState;

/// Payload emitted to the frontend when the graph topology changes.
#[derive(Serialize, Clone)]
struct TopologyChangedPayload {
    #[serde(rename = "type")]
    event_type: &'static str,
    added_nodes: Vec<NodeDtoPayload>,
    removed_nodes: Vec<String>,
    added_edges: Vec<EdgeDtoPayload>,
    removed_edges: Vec<EdgeDtoPayload>,
}

#[derive(Serialize, Clone)]
struct NodeDtoPayload {
    path: String,
    title: String,
    note_type: String,
    tags: Vec<String>,
}

#[derive(Serialize, Clone)]
struct EdgeDtoPayload {
    source: String,
    target: String,
    rel: String,
    kind: String,
}

/// Start watching `workspace_root` recursively. Debounces events by 2 seconds.
/// Only `.md` file events are forwarded for processing.
///
/// Returns the `Debouncer` handle — the caller must keep it alive in `AppState.watcher`.
/// Dropping the handle stops all watching.
pub fn start_watcher(
    app_handle: AppHandle,
    workspace_root: &Path,
) -> notify_debouncer_mini::Debouncer<notify::RecommendedWatcher> {
    let (tx, mut rx) = mpsc::unbounded_channel::<PathBuf>();

    let mut debouncer = new_debouncer(Duration::from_secs(2), move |result: Result<Vec<notify_debouncer_mini::DebouncedEvent>, _>| {
        if let Ok(events) = result {
            for event in events {
                if event.kind == DebouncedEventKind::Any
                    && event.path.extension().and_then(|e| e.to_str()) == Some("md")
                {
                    let _ = tx.send(event.path.clone());
                }
            }
        }
    })
    .expect("failed to create file watcher");

    debouncer
        .watcher()
        .watch(workspace_root, RecursiveMode::Recursive)
        .expect("failed to watch workspace root");

    tokio::spawn(async move {
        while let Some(path) = rx.recv().await {
            process_change(&app_handle, path).await;
        }
    });

    debouncer
}

async fn process_change(app: &AppHandle, path: PathBuf) {
    let state = app.state::<AppState>();

    let workspace_root = match state.with_workspace(|ws| Ok(ws.root.clone())) {
        Ok(root) => root,
        Err(_) => return,
    };

    let rel_path = match path.strip_prefix(&workspace_root) {
        Ok(rel) => RelativePath::new(&rel.to_string_lossy().replace('\\', "/")),
        Err(_) => return,
    };
    let rel_path_str = rel_path.as_str().to_string();

    if state.consume_expected_write(&path) {
        return;
    }

    let path_exists = path.exists();
    let path_is_known = state
        .with_workspace(|ws| Ok(ws.notes.contains_key(&rel_path)))
        .unwrap_or(false);

    let diff_result = if path_exists && path_is_known {
        state.with_workspace_mut(|ws| {
            ws.reload_file(&rel_path_str)
                .map_err(|e| e.to_string())
        })
    } else if path_exists {
        state.with_workspace_mut(|ws| {
            ws.add_file(&rel_path_str)
                .map_err(|e| e.to_string())
        })
    } else {
        state.with_workspace_mut(|ws| {
            ws.remove_file(&rel_path_str)
                .map_err(|e| e.to_string())
        })
    };

    let diff = match diff_result {
        Ok(d) => d,
        Err(e) => {
            warn!(path = %rel_path_str, error = %e, "watcher: error processing file change");
            return;
        }
    };

    let payload = TopologyChangedPayload {
        event_type: "topology-changed",
        added_nodes: diff
            .added_nodes
            .iter()
            .map(|n| NodeDtoPayload {
                path: n.path.as_str().to_string(),
                title: n.title.clone(),
                note_type: n.note_type.clone(),
                tags: n.tags.clone(),
            })
            .collect(),
        removed_nodes: diff
            .removed_nodes
            .iter()
            .map(|p| p.as_str().to_string())
            .collect(),
        added_edges: diff.added_edges.iter().map(edge_to_payload).collect(),
        removed_edges: diff.removed_edges.iter().map(edge_to_payload).collect(),
    };

    if let Err(e) = app.emit("brainmap://workspace-event", payload) {
        error!(error = %e, "watcher: failed to emit event");
    }
}

fn edge_to_payload(e: &brainmap_core::model::Edge) -> EdgeDtoPayload {
    EdgeDtoPayload {
        source: e.source.as_str().to_string(),
        target: e.target.as_str().to_string(),
        rel: e.rel.clone(),
        kind: match e.kind {
            EdgeKind::Explicit => "explicit".to_string(),
            EdgeKind::Implicit => "implicit".to_string(),
            EdgeKind::Inline => "inline".to_string(),
        },
    }
}
