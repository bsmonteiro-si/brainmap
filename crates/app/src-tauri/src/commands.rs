use tauri::State;
use tracing::{info, warn, error};

use crate::dto::*;
use crate::handlers;
use crate::state::AppState;
use crate::watcher;

#[tauri::command]
pub async fn open_workspace(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    path: String,
) -> Result<WorkspaceInfoDto, String> {
    info!(path = %path, "open_workspace called");
    let (workspace, info) = handlers::handle_open_workspace(&path)?;
    info!(name = %info.name, root = %info.root, nodes = info.node_count, edges = info.edge_count, "workspace opened");
    let root = workspace.root.clone();

    // Stop the old watcher before replacing the workspace so its Tokio task
    // cannot process events for the new workspace.
    if let Ok(mut w) = state.watcher.lock() {
        *w = None;
    }

    {
        let mut guard = state.lock_workspace()?;
        *guard = Some(workspace);
    }

    // Start a new watcher for this workspace.
    let debouncer = watcher::start_watcher(app, &root);
    if let Ok(mut w) = state.watcher.lock() {
        *w = Some(debouncer);
    }

    Ok(info)
}

#[tauri::command]
pub fn get_graph_topology(state: State<'_, AppState>) -> Result<GraphTopologyDto, String> {
    state.with_workspace(|ws| {
        let topo = handlers::handle_get_topology(ws);
        info!(nodes = topo.nodes.len(), edges = topo.edges.len(), "get_graph_topology");
        Ok(topo)
    })
}

#[tauri::command]
pub fn get_node_content(state: State<'_, AppState>, path: String) -> Result<NoteDetailDto, String> {
    state.with_workspace(|ws| handlers::handle_read_note(ws, &path))
}

#[tauri::command]
pub fn create_node(
    state: State<'_, AppState>,
    params: CreateNoteParams,
) -> Result<String, String> {
    let abs_path = state.with_workspace(|ws| Ok(ws.root.join(&params.path)))?;
    state.register_expected_write(abs_path);
    state.with_workspace_mut(|ws| handlers::handle_create_note(ws, params))
}

#[tauri::command]
pub fn update_node(
    state: State<'_, AppState>,
    params: UpdateNoteParams,
) -> Result<(), String> {
    let abs_path = state.with_workspace(|ws| Ok(ws.root.join(&params.path)))?;
    state.register_expected_write(abs_path);
    state.with_workspace_mut(|ws| handlers::handle_update_note(ws, params))
}

#[tauri::command]
pub fn delete_node(
    state: State<'_, AppState>,
    path: String,
    force: Option<bool>,
) -> Result<(), String> {
    let abs_path = state.with_workspace(|ws| Ok(ws.root.join(&path)))?;
    state.register_expected_write(abs_path);
    state.with_workspace_mut(|ws| handlers::handle_delete_note(ws, &path, force.unwrap_or(false)))
}

#[tauri::command]
pub fn list_nodes(
    state: State<'_, AppState>,
    params: ListNodesParams,
) -> Result<Vec<NodeSummaryDto>, String> {
    state.with_workspace(|ws| Ok(handlers::handle_list_nodes(ws, params)))
}

#[tauri::command]
pub fn search_notes(
    state: State<'_, AppState>,
    params: SearchParams,
) -> Result<Vec<SearchResultDto>, String> {
    state.with_workspace(|ws| handlers::handle_search(ws, params))
}

#[tauri::command]
pub fn get_neighbors(
    state: State<'_, AppState>,
    params: NeighborsParams,
) -> Result<SubgraphDto, String> {
    state.with_workspace(|ws| handlers::handle_get_neighbors(ws, params))
}

#[tauri::command]
pub fn create_link(
    state: State<'_, AppState>,
    params: LinkParams,
) -> Result<(), String> {
    // Links modify the source note's file.
    let abs_path = state.with_workspace(|ws| Ok(ws.root.join(&params.source)))?;
    state.register_expected_write(abs_path);
    state.with_workspace_mut(|ws| handlers::handle_create_link(ws, params))
}

#[tauri::command]
pub fn delete_link(
    state: State<'_, AppState>,
    source: String,
    target: String,
    rel: String,
) -> Result<(), String> {
    let abs_path = state.with_workspace(|ws| Ok(ws.root.join(&source)))?;
    state.register_expected_write(abs_path);
    state.with_workspace_mut(|ws| handlers::handle_delete_link(ws, &source, &target, &rel))
}

#[tauri::command]
pub fn list_links(
    state: State<'_, AppState>,
    params: ListLinksParams,
) -> Result<Vec<EdgeDto>, String> {
    state.with_workspace(|ws| handlers::handle_list_links(ws, params))
}

#[tauri::command]
pub fn get_node_summary(state: State<'_, AppState>, path: String) -> Result<NodeSummaryDto, String> {
    state.with_workspace(|ws| handlers::handle_get_node_summary(ws, &path))
}

#[tauri::command]
pub fn get_stats(state: State<'_, AppState>) -> Result<StatsDto, String> {
    state.with_workspace(|ws| Ok(handlers::handle_get_stats(ws)))
}

#[tauri::command]
pub fn delete_folder(
    state: State<'_, AppState>,
    path: String,
    force: Option<bool>,
) -> Result<DeleteFolderResultDto, String> {
    // Validate the folder path (same pattern as create_folder)
    let abs_path = state.with_workspace(|ws| {
        let p = std::path::Path::new(&path);
        if p.is_absolute() {
            return Err("Folder path must be relative".to_string());
        }
        let normalized = ws.root.join(p).components().fold(
            std::path::PathBuf::new(),
            |mut acc, c| {
                match c {
                    std::path::Component::ParentDir => { acc.pop(); acc }
                    _ => { acc.push(c); acc }
                }
            },
        );
        if !normalized.starts_with(&ws.root) {
            return Err("Path escapes workspace root".to_string());
        }
        Ok(normalized)
    })?;

    // Register expected writes for ALL note files in the folder before deleting
    let prefix = if path.ends_with('/') { path.clone() } else { format!("{}/", path) };
    let note_paths: Vec<std::path::PathBuf> = state.with_workspace(|ws| {
        Ok(ws.notes.keys()
            .filter(|p| p.as_str().starts_with(&prefix))
            .map(|p| ws.root.join(p.as_str()))
            .collect())
    })?;

    for note_abs_path in &note_paths {
        state.register_expected_write(note_abs_path.clone());
    }
    // Also register the folder itself in case the watcher fires on directory removal
    state.register_expected_write(abs_path);

    state.with_workspace_mut(|ws| handlers::handle_delete_folder(ws, &path, force.unwrap_or(false)))
}

#[tauri::command]
pub fn create_folder(state: State<'_, AppState>, path: String) -> Result<(), String> {
    let abs_path = state.with_workspace(|ws| {
        let p = std::path::Path::new(&path);
        // Reject absolute paths: PathBuf::join replaces the base for absolute inputs.
        if p.is_absolute() {
            return Err("Folder path must be relative".to_string());
        }
        // Normalize ".." components without requiring the directory to exist yet,
        // then verify the result stays within the workspace root.
        let normalized = ws.root.join(p).components().fold(
            std::path::PathBuf::new(),
            |mut acc, c| {
                match c {
                    std::path::Component::ParentDir => { acc.pop(); acc }
                    _ => { acc.push(c); acc }
                }
            },
        );
        if !normalized.starts_with(&ws.root) {
            return Err("Path escapes workspace root".to_string());
        }
        Ok(normalized)
    })?;
    std::fs::create_dir_all(&abs_path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn read_plain_file(state: State<'_, AppState>, path: String) -> Result<PlainFileDto, String> {
    state.with_workspace(|ws| handlers::handle_read_plain_file(ws, &path))
}

#[tauri::command]
pub fn write_plain_file(state: State<'_, AppState>, path: String, body: String) -> Result<(), String> {
    let abs_path = state.with_workspace(|ws| {
        handlers::validate_relative_path(&ws.root, &path)
    })?;
    state.register_expected_write(abs_path);
    state.with_workspace(|ws| handlers::handle_write_plain_file(ws, &path, &body))
}

#[tauri::command]
pub fn write_raw_note(state: State<'_, AppState>, path: String, content: String) -> Result<(), String> {
    let abs_path = state.with_workspace(|ws| {
        handlers::validate_relative_path(&ws.root, &path)
    })?;
    state.register_expected_write(abs_path);
    state.with_workspace_mut(|ws| handlers::handle_write_raw_note(ws, &path, &content))
}

#[tauri::command]
pub fn list_workspace_files(state: State<'_, AppState>) -> Result<Vec<String>, String> {
    state.with_workspace(|ws| Ok(handlers::handle_list_workspace_files(ws)))
}

#[tauri::command]
pub fn write_log(level: String, target: String, msg: String, fields: Option<String>) {
    let fields_str = fields.as_deref().unwrap_or("");
    match level.as_str() {
        "ERROR" => error!(target = %target, fields = %fields_str, "[frontend] {}", msg),
        "WARN" => warn!(target = %target, fields = %fields_str, "[frontend] {}", msg),
        "DEBUG" => info!(target = %target, fields = %fields_str, "[frontend] {}", msg),
        _ => info!(target = %target, fields = %fields_str, "[frontend] {}", msg),
    }
}
