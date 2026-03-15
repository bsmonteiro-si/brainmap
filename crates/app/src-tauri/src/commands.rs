use std::collections::HashSet;
use tauri::State;
use tracing::{info, warn, error, debug};

use crate::dto::*;
use crate::handlers;
use crate::state::{AppState, WorkspaceSlot, canonicalize_root};
use crate::watcher;

/// Build a WorkspaceInfoDto from a slot's workspace.
fn workspace_info_from_slot(slot: &WorkspaceSlot) -> WorkspaceInfoDto {
    let ws = &slot.workspace;
    let stats = ws.stats();
    WorkspaceInfoDto {
        name: ws.config.name.clone(),
        root: ws.root.to_string_lossy().to_string(),
        node_count: stats.node_count,
        edge_count: stats.edge_count,
    }
}

#[tauri::command]
pub async fn open_workspace(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    path: String,
) -> Result<WorkspaceInfoDto, String> {
    let canonical = canonicalize_root(&path);
    info!(path = %path, canonical = %canonical, "open_workspace called");

    // If a slot already exists for this root, just activate it.
    if state.has_slot(&canonical) {
        state.set_active_root(Some(canonical.clone()));
        return state.with_slot(&canonical, |slot| {
            Ok(workspace_info_from_slot(slot))
        });
    }

    // Check for overlapping roots.
    if let Some(existing) = state.overlaps_existing(&canonical) {
        return Err(format!(
            "Cannot open workspace: path overlaps with already-open workspace at {existing}"
        ));
    }

    let (workspace, info) = handlers::handle_open_workspace(&canonical)?;
    info!(name = %info.name, root = %info.root, nodes = info.node_count, edges = info.edge_count, "workspace opened");
    let root = workspace.root.clone();

    // Insert the new slot (atomic check-and-insert via return value).
    let slot = WorkspaceSlot {
        workspace,
        expected_writes: HashSet::new(),
    };
    if !state.insert_slot(canonical.clone(), slot) {
        // Another thread won the race — activate the existing slot.
        state.set_active_root(Some(canonical.clone()));
        return state.with_slot(&canonical, |slot| {
            Ok(workspace_info_from_slot(slot))
        });
    }
    state.set_active_root(Some(canonical.clone()));

    // Start a new watcher for this workspace.
    let debouncer = watcher::start_watcher(app, canonical.clone(), &root);
    state.set_watcher(canonical, debouncer);

    Ok(info)
}

#[tauri::command]
pub fn close_workspace(state: State<'_, AppState>, root: String) -> Result<(), String> {
    let canonical = canonicalize_root(&root);
    info!(root = %canonical, "close_workspace called");

    // Remove watcher first (stops file watching).
    state.remove_watcher(&canonical);

    // Remove the slot.
    if !state.remove_slot(&canonical) {
        return Err(format!("No workspace open at {canonical}"));
    }

    // If this was the active root, clear it.
    if state.get_active_root().as_deref() == Some(&canonical) {
        state.set_active_root(None);
    }

    Ok(())
}

#[tauri::command]
pub fn switch_workspace(state: State<'_, AppState>, root: String) -> Result<WorkspaceInfoDto, String> {
    let canonical = canonicalize_root(&root);
    info!(root = %canonical, "switch_workspace called");

    if !state.has_slot(&canonical) {
        return Err(format!("No workspace open at {canonical}"));
    }

    state.set_active_root(Some(canonical.clone()));

    state.with_slot(&canonical, |slot| {
        Ok(workspace_info_from_slot(slot))
    })
}

#[tauri::command]
pub fn get_graph_topology(state: State<'_, AppState>) -> Result<GraphTopologyDto, String> {
    state.with_active(|ws| {
        let topo = handlers::handle_get_topology(ws);
        info!(nodes = topo.nodes.len(), edges = topo.edges.len(), "get_graph_topology");
        Ok(topo)
    })
}

#[tauri::command]
pub fn get_node_content(state: State<'_, AppState>, path: String) -> Result<NoteDetailDto, String> {
    state.with_active(|ws| handlers::handle_read_note(ws, &path))
}

#[tauri::command]
pub fn create_node(
    state: State<'_, AppState>,
    params: CreateNoteParams,
) -> Result<String, String> {
    let root = state.resolve_root(None)?;
    let abs_path = state.with_slot(&root, |slot| Ok(slot.workspace.root.join(&params.path)))?;
    state.register_expected_write(&root, abs_path);
    state.with_slot_mut(&root, |slot| handlers::handle_create_note(&mut slot.workspace, params))
}

#[tauri::command]
pub fn update_node(
    state: State<'_, AppState>,
    params: UpdateNoteParams,
) -> Result<(), String> {
    let root = state.resolve_root(None)?;
    let abs_path = state.with_slot(&root, |slot| Ok(slot.workspace.root.join(&params.path)))?;
    state.register_expected_write(&root, abs_path);
    state.with_slot_mut(&root, |slot| handlers::handle_update_note(&mut slot.workspace, params))
}

#[tauri::command]
pub fn delete_node(
    state: State<'_, AppState>,
    path: String,
    force: Option<bool>,
) -> Result<(), String> {
    let root = state.resolve_root(None)?;
    let abs_path = state.with_slot(&root, |slot| Ok(slot.workspace.root.join(&path)))?;
    state.register_expected_write(&root, abs_path);
    state.with_slot_mut(&root, |slot| handlers::handle_delete_note(&mut slot.workspace, &path, force.unwrap_or(false)))
}

#[tauri::command]
pub fn move_note(
    state: State<'_, AppState>,
    old_path: String,
    new_path: String,
) -> Result<crate::dto::MoveNoteResultDto, String> {
    let root = state.resolve_root(None)?;
    // Validate both paths stay within workspace root
    let old_abs = state.with_slot(&root, |slot| {
        handlers::validate_relative_path(&slot.workspace.root, &old_path)
    })?;
    let new_abs = state.with_slot(&root, |slot| {
        handlers::validate_relative_path(&slot.workspace.root, &new_path)
    })?;
    state.register_expected_write(&root, old_abs);
    state.register_expected_write(&root, new_abs);

    let result = state.with_slot_mut(&root, |slot| {
        handlers::handle_move_note(&mut slot.workspace, &old_path, &new_path)
    })?;

    // Register expected writes for rewritten backlink files (written by move_note)
    for rp in &result.rewritten_paths {
        let abs = state.with_slot(&root, |slot| Ok(slot.workspace.root.join(rp)))?;
        state.register_expected_write(&root, abs);
    }

    Ok(result)
}

#[tauri::command]
pub fn move_folder(
    state: State<'_, AppState>,
    old_folder: String,
    new_folder: String,
) -> Result<crate::dto::MoveFolderResultDto, String> {
    let root = state.resolve_root(None)?;

    // Validate both folder paths stay within workspace root
    let old_dir_abs = state.with_slot(&root, |slot| {
        handlers::validate_relative_path(&slot.workspace.root, &old_folder)
    })?;
    let new_dir_abs = state.with_slot(&root, |slot| {
        handlers::validate_relative_path(&slot.workspace.root, &new_folder)
    })?;

    // Register expected writes for all notes under the old folder
    let old_prefix = if old_folder.ends_with('/') { old_folder.clone() } else { format!("{}/", old_folder) };
    let note_paths: Vec<std::path::PathBuf> = state.with_slot(&root, |slot| {
        Ok(slot.workspace.notes.keys()
            .filter(|p| p.as_str().starts_with(&old_prefix))
            .map(|p| slot.workspace.root.join(p.as_str()))
            .collect())
    })?;
    for abs in &note_paths {
        state.register_expected_write(&root, abs.clone());
    }
    state.register_expected_write(&root, old_dir_abs);
    state.register_expected_write(&root, new_dir_abs);

    let result = state.with_slot_mut(&root, |slot| {
        handlers::handle_move_folder(&mut slot.workspace, &old_folder, &new_folder)
    })?;

    // Register expected writes for moved notes at new paths and rewritten backlinks
    for (_, new_path) in &result.moved_notes {
        let abs = state.with_slot(&root, |slot| Ok(slot.workspace.root.join(new_path)))?;
        state.register_expected_write(&root, abs);
    }
    for rp in &result.rewritten_paths {
        let abs = state.with_slot(&root, |slot| Ok(slot.workspace.root.join(rp)))?;
        state.register_expected_write(&root, abs);
    }

    Ok(result)
}

#[tauri::command]
pub fn list_nodes(
    state: State<'_, AppState>,
    params: ListNodesParams,
) -> Result<Vec<NodeSummaryDto>, String> {
    state.with_active(|ws| Ok(handlers::handle_list_nodes(ws, params)))
}

#[tauri::command]
pub fn search_notes(
    state: State<'_, AppState>,
    params: SearchParams,
) -> Result<Vec<SearchResultDto>, String> {
    state.with_active(|ws| handlers::handle_search(ws, params))
}

#[tauri::command]
pub fn get_neighbors(
    state: State<'_, AppState>,
    params: NeighborsParams,
) -> Result<SubgraphDto, String> {
    state.with_active(|ws| handlers::handle_get_neighbors(ws, params))
}

#[tauri::command]
pub fn create_link(
    state: State<'_, AppState>,
    params: LinkParams,
) -> Result<(), String> {
    let root = state.resolve_root(None)?;
    let abs_path = state.with_slot(&root, |slot| Ok(slot.workspace.root.join(&params.source)))?;
    state.register_expected_write(&root, abs_path);
    state.with_slot_mut(&root, |slot| handlers::handle_create_link(&mut slot.workspace, params))
}

#[tauri::command]
pub fn delete_link(
    state: State<'_, AppState>,
    source: String,
    target: String,
    rel: String,
) -> Result<(), String> {
    let root = state.resolve_root(None)?;
    let abs_path = state.with_slot(&root, |slot| Ok(slot.workspace.root.join(&source)))?;
    state.register_expected_write(&root, abs_path);
    state.with_slot_mut(&root, |slot| handlers::handle_delete_link(&mut slot.workspace, &source, &target, &rel))
}

#[tauri::command]
pub fn list_links(
    state: State<'_, AppState>,
    params: ListLinksParams,
) -> Result<Vec<EdgeDto>, String> {
    state.with_active(|ws| handlers::handle_list_links(ws, params))
}

#[tauri::command]
pub fn get_node_summary(state: State<'_, AppState>, path: String) -> Result<NodeSummaryDto, String> {
    state.with_active(|ws| handlers::handle_get_node_summary(ws, &path))
}

#[tauri::command]
pub fn get_stats(state: State<'_, AppState>) -> Result<StatsDto, String> {
    state.with_active(|ws| Ok(handlers::handle_get_stats(ws)))
}

#[tauri::command]
pub fn delete_folder(
    state: State<'_, AppState>,
    path: String,
    force: Option<bool>,
) -> Result<DeleteFolderResultDto, String> {
    let root = state.resolve_root(None)?;

    // Validate the folder path (same pattern as create_folder)
    let abs_path = state.with_slot(&root, |slot| {
        let ws = &slot.workspace;
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
    let note_paths: Vec<std::path::PathBuf> = state.with_slot(&root, |slot| {
        Ok(slot.workspace.notes.keys()
            .filter(|p| p.as_str().starts_with(&prefix))
            .map(|p| slot.workspace.root.join(p.as_str()))
            .collect())
    })?;

    for note_abs_path in &note_paths {
        state.register_expected_write(&root, note_abs_path.clone());
    }
    // Also register the folder itself in case the watcher fires on directory removal
    state.register_expected_write(&root, abs_path);

    state.with_slot_mut(&root, |slot| handlers::handle_delete_folder(&mut slot.workspace, &path, force.unwrap_or(false)))
}

#[tauri::command]
pub fn create_folder(state: State<'_, AppState>, path: String) -> Result<(), String> {
    let root = state.resolve_root(None)?;

    let abs_path = state.with_slot(&root, |slot| {
        let ws = &slot.workspace;
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
    state.with_active(|ws| handlers::handle_read_plain_file(ws, &path))
}

#[tauri::command]
pub fn write_plain_file(state: State<'_, AppState>, path: String, body: String) -> Result<(), String> {
    let root = state.resolve_root(None)?;
    let abs_path = state.with_slot(&root, |slot| {
        handlers::validate_relative_path(&slot.workspace.root, &path)
    })?;
    state.register_expected_write(&root, abs_path);
    state.with_slot(&root, |slot| handlers::handle_write_plain_file(&slot.workspace, &path, &body))
}

#[tauri::command]
pub fn write_raw_note(state: State<'_, AppState>, path: String, content: String) -> Result<(), String> {
    let root = state.resolve_root(None)?;
    let abs_path = state.with_slot(&root, |slot| {
        handlers::validate_relative_path(&slot.workspace.root, &path)
    })?;
    state.register_expected_write(&root, abs_path);
    state.with_slot_mut(&root, |slot| handlers::handle_write_raw_note(&mut slot.workspace, &path, &content))
}

#[tauri::command]
pub fn list_workspace_files(state: State<'_, AppState>) -> Result<Vec<String>, String> {
    state.with_active(|ws| Ok(handlers::handle_list_workspace_files(ws)))
}

#[tauri::command]
pub fn write_log(level: String, target: String, msg: String, fields: Option<String>) {
    let fields_str = fields.as_deref().unwrap_or("");
    match level.as_str() {
        "ERROR" => error!(target = %target, fields = %fields_str, "[frontend] {}", msg),
        "WARN" => warn!(target = %target, fields = %fields_str, "[frontend] {}", msg),
        "DEBUG" => debug!(target = %target, fields = %fields_str, "[frontend] {}", msg),
        _ => info!(target = %target, fields = %fields_str, "[frontend] {}", msg),
    }
}
