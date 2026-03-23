use std::collections::HashSet;
use tauri::State;
use tracing::{info, warn, error, debug};

use brainmap_core::model::{Direction, RelativePath};

use crate::dto::*;
use crate::handlers;
use crate::state::{AppState, WorkspaceSlot, canonicalize_root};
use crate::watcher::{self, node_to_payload, edge_to_payload, emit_topology_event, emit_files_changed_event};

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
pub async fn refresh_workspace(state: State<'_, AppState>) -> Result<WorkspaceInfoDto, String> {
    let root = state.resolve_root(None)?;
    info!(root = %root, "refresh_workspace called");
    state.with_slot_mut(&root, |slot| {
        let path = slot.workspace.root.clone();
        let fresh = brainmap_core::workspace::Workspace::open_or_init(&path)
            .map_err(|e| e.to_string())?;
        slot.workspace = fresh;
        // Clear expected_writes so the file watcher doesn't suppress events
        // for paths that were pending before refresh.
        slot.expected_writes.clear();
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
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    params: CreateNoteParams,
) -> Result<String, String> {
    let root = state.resolve_root(None)?;
    let abs_path = state.with_slot(&root, |slot| Ok(slot.workspace.root.join(&params.path)))?;
    state.register_expected_write(&root, abs_path);

    // Collect folder nodes before, create note, and read back state — all in one lock
    let (created_path, added_nodes, added_edges) = state.with_slot_mut(&root, |slot| {
        let folder_nodes_before: HashSet<String> = slot.workspace.graph.all_nodes()
            .filter(|(_, nd)| nd.is_folder())
            .map(|(rp, _)| rp.as_str().to_string())
            .collect();

        let created_path = handlers::handle_create_note(&mut slot.workspace, params)?;

        let rp = RelativePath::new(&created_path);
        let mut nodes = Vec::new();
        let mut edges = Vec::new();

        if let Some(nd) = slot.workspace.graph.get_node(&rp) {
            nodes.push(node_to_payload(nd));
        }
        for e in slot.workspace.graph.edges_for(&rp, &Direction::Both) {
            edges.push(edge_to_payload(e));
        }

        // New folder nodes created by ensure_folder_nodes
        for (fp, fnd) in slot.workspace.graph.all_nodes() {
            if fnd.is_folder() && !folder_nodes_before.contains(fp.as_str()) {
                nodes.push(node_to_payload(fnd));
                for e in slot.workspace.graph.edges_for(fp, &Direction::Both) {
                    edges.push(edge_to_payload(e));
                }
            }
        }

        Ok((created_path, nodes, edges))
    })?;

    emit_topology_event(&app, &root, added_nodes, vec![], added_edges, vec![]);

    Ok(created_path)
}

#[tauri::command]
pub fn update_node(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    params: UpdateNoteParams,
) -> Result<(), String> {
    let root = state.resolve_root(None)?;
    let path = params.path.clone();
    let abs_path = state.with_slot(&root, |slot| Ok(slot.workspace.root.join(&params.path)))?;
    state.register_expected_write(&root, abs_path);

    // Perform update and read back the node in one lock
    let updated_node = state.with_slot_mut(&root, |slot| {
        handlers::handle_update_note(&mut slot.workspace, params)?;
        let rp = RelativePath::new(&path);
        Ok(slot.workspace.graph.get_node(&rp).map(node_to_payload))
    })?;

    if let Some(node) = updated_node {
        emit_topology_event(&app, &root, vec![node], vec![], vec![], vec![]);
    }

    Ok(())
}

#[tauri::command]
pub fn delete_node(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    path: String,
    force: Option<bool>,
) -> Result<(), String> {
    let root = state.resolve_root(None)?;
    let abs_path = state.with_slot(&root, |slot| Ok(slot.workspace.root.join(&path)))?;
    state.register_expected_write(&root, abs_path);

    // Collect edges + perform deletion in a single lock
    let (edges_before, removed_folder_nodes) = state.with_slot_mut(&root, |slot| {
        let rp = RelativePath::new(&path);

        // Collect all edges touching this node before deletion
        let mut edges: Vec<_> = slot.workspace.graph.edges_for(&rp, &Direction::Both)
            .into_iter().cloned().collect();

        // Collect ancestor folder node paths and their edges (they may get pruned)
        let mut folder_ancestors: Vec<String> = Vec::new();
        if let Some(parent_rp) = rp.parent() {
            let mut current = Some(parent_rp);
            while let Some(dir_rp) = current {
                if slot.workspace.graph.get_node(&dir_rp).map_or(false, |n| n.is_folder()) {
                    folder_ancestors.push(dir_rp.as_str().to_string());
                    // Collect folder edges before deletion might prune them
                    for e in slot.workspace.graph.edges_for(&dir_rp, &Direction::Both) {
                        edges.push(e.clone());
                    }
                }
                current = dir_rp.parent();
            }
        }

        // Perform deletion
        handlers::handle_delete_note(&mut slot.workspace, &path, force.unwrap_or(false))?;

        // Check which folder nodes were pruned
        let removed_folders: Vec<String> = folder_ancestors.into_iter()
            .filter(|fp| slot.workspace.graph.get_node(&RelativePath::new(fp)).is_none())
            .collect();

        Ok((edges, removed_folders))
    })?;

    let mut removed_nodes = vec![path];
    // Also collect edges for removed folder nodes
    let all_removed_edges: Vec<_> = edges_before.iter().map(edge_to_payload).collect();
    for folder_path in &removed_folder_nodes {
        removed_nodes.push(folder_path.clone());
    }

    emit_topology_event(&app, &root, vec![], removed_nodes, vec![], all_removed_edges);

    Ok(())
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

    // move_note is complex — frontend uses loadTopology() for now
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

    // move_folder is complex — frontend uses loadTopology() for now
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
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    params: LinkParams,
) -> Result<(), String> {
    let root = state.resolve_root(None)?;
    let source = params.source.clone();
    let target = params.target.clone();
    let rel = params.rel.clone();
    let abs_path = state.with_slot(&root, |slot| Ok(slot.workspace.root.join(&params.source)))?;
    state.register_expected_write(&root, abs_path);
    state.with_slot_mut(&root, |slot| handlers::handle_create_link(&mut slot.workspace, params))?;

    // Emit the new edge
    emit_topology_event(
        &app,
        &root,
        vec![],
        vec![],
        vec![watcher::EdgeDtoPayload {
            source,
            target,
            rel,
            kind: "Explicit".to_string(),
        }],
        vec![],
    );

    Ok(())
}

#[tauri::command]
pub fn delete_link(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    source: String,
    target: String,
    rel: String,
) -> Result<(), String> {
    let root = state.resolve_root(None)?;
    let abs_path = state.with_slot(&root, |slot| Ok(slot.workspace.root.join(&source)))?;
    state.register_expected_write(&root, abs_path);

    // Capture edge details before deletion
    let edge_payload = watcher::EdgeDtoPayload {
        source: source.clone(),
        target: target.clone(),
        rel: rel.clone(),
        kind: "Explicit".to_string(),
    };

    state.with_slot_mut(&root, |slot| handlers::handle_delete_link(&mut slot.workspace, &source, &target, &rel))?;

    emit_topology_event(&app, &root, vec![], vec![], vec![], vec![edge_payload]);

    Ok(())
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
    app: tauri::AppHandle,
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

    // Collect all workspace files under the folder before deletion (for files-changed event)
    let all_files_in_folder: Vec<String> = state.with_slot(&root, |slot| {
        let mut files = Vec::new();
        let folder_abs = slot.workspace.root.join(&path);
        if folder_abs.is_dir() {
            handlers::collect_folder_files(&slot.workspace.root, &folder_abs, &mut files);
        }
        Ok(files)
    })?;

    // Collect edges and folder nodes before deletion, then perform deletion in one lock
    let (result, edges_before, removed_folder_nodes) = state.with_slot_mut(&root, |slot| {
        // Register expected writes
        let note_abs_paths: Vec<std::path::PathBuf> = slot.workspace.notes.keys()
            .filter(|p| p.as_str().starts_with(&prefix))
            .map(|p| slot.workspace.root.join(p.as_str()))
            .collect();

        // Collect all edges for notes in this folder
        let mut all_edges = Vec::new();
        let mut note_paths_in_folder = Vec::new();
        for rp in slot.workspace.notes.keys() {
            if rp.as_str().starts_with(&prefix) {
                note_paths_in_folder.push(rp.as_str().to_string());
                for e in slot.workspace.graph.edges_for(rp, &Direction::Both) {
                    all_edges.push(edge_to_payload(e));
                }
            }
        }

        // Collect folder node paths under this prefix
        let folder_nodes_before: Vec<String> = slot.workspace.graph.all_nodes()
            .filter(|(_, nd)| nd.is_folder())
            .filter(|(fp, _)| fp.as_str().starts_with(&prefix) || fp.as_str() == path.trim_end_matches('/'))
            .map(|(fp, _)| fp.as_str().to_string())
            .collect();

        // Also collect edges for folder nodes
        for fp_str in &folder_nodes_before {
            let fp = RelativePath::new(fp_str);
            for e in slot.workspace.graph.edges_for(&fp, &Direction::Both) {
                all_edges.push(edge_to_payload(e));
            }
        }

        // Perform deletion
        let result = handlers::handle_delete_folder(&mut slot.workspace, &path, force.unwrap_or(false))?;

        // Check which folder nodes were removed
        let removed_folders: Vec<String> = folder_nodes_before.into_iter()
            .filter(|fp| slot.workspace.graph.get_node(&RelativePath::new(fp)).is_none())
            .collect();

        // Register expected writes (must be done here while we have the lock)
        for abs in note_abs_paths {
            slot.expected_writes.insert(abs);
        }

        Ok((result, all_edges, removed_folders))
    })?;

    // Also register the folder itself
    state.register_expected_write(&root, abs_path);

    // Emit topology event with all removed nodes and edges
    let mut removed_nodes: Vec<String> = result.deleted_paths.clone();
    removed_nodes.extend(removed_folder_nodes);

    emit_topology_event(&app, &root, vec![], removed_nodes, vec![], edges_before);

    // Emit files-changed for untracked files that were in the folder
    let deleted_note_set: std::collections::HashSet<&str> =
        result.deleted_paths.iter().map(|s| s.as_str()).collect();
    let removed_plain_files: Vec<String> = all_files_in_folder.into_iter()
        .filter(|f| !deleted_note_set.contains(f.as_str()))
        .collect();
    if !removed_plain_files.is_empty() {
        emit_files_changed_event(&app, &root, vec![], removed_plain_files);
    }

    Ok(result)
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
pub fn create_plain_file(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    path: String,
    body: Option<String>,
) -> Result<String, String> {
    let root = state.resolve_root(None)?;
    let abs_path = state.with_slot(&root, |slot| {
        handlers::validate_relative_path(&slot.workspace.root, &path)
    })?;
    state.register_expected_write(&root, abs_path);
    let result = state.with_slot(&root, |slot| handlers::handle_create_plain_file(&slot.workspace, &path, body.as_deref()))?;

    emit_files_changed_event(&app, &root, vec![path.clone()], vec![]);

    Ok(result)
}

#[tauri::command]
pub fn read_plain_file(state: State<'_, AppState>, path: String) -> Result<PlainFileDto, String> {
    state.with_active(|ws| handlers::handle_read_plain_file(ws, &path))
}

#[tauri::command]
pub fn delete_plain_file(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    path: String,
) -> Result<(), String> {
    let root = state.resolve_root(None)?;
    // Plain file ops bypass Workspace state and only touch disk,
    // matching create_plain_file/write_plain_file convention.
    let abs_path = state.with_slot(&root, |slot| {
        handlers::validate_relative_path(&slot.workspace.root, &path)
    })?;
    state.register_expected_write(&root, abs_path);
    state.with_slot(&root, |slot| handlers::handle_delete_plain_file(&slot.workspace, &path))?;

    emit_files_changed_event(&app, &root, vec![], vec![path.clone()]);

    Ok(())
}

#[tauri::command]
pub fn move_plain_file(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    old_path: String,
    new_path: String,
) -> Result<String, String> {
    let root = state.resolve_root(None)?;
    let old_abs = state.with_slot(&root, |slot| {
        handlers::validate_relative_path(&slot.workspace.root, &old_path)
    })?;
    let new_abs = state.with_slot(&root, |slot| {
        handlers::validate_relative_path(&slot.workspace.root, &new_path)
    })?;
    state.register_expected_write(&root, old_abs);
    state.register_expected_write(&root, new_abs);
    state.with_slot(&root, |slot| {
        handlers::handle_move_plain_file(&slot.workspace, &old_path, &new_path)
    })?;

    emit_files_changed_event(&app, &root, vec![new_path.clone()], vec![old_path.clone()]);

    Ok(new_path)
}

#[tauri::command]
pub fn resolve_image_path(
    state: State<'_, AppState>,
    path: String,
) -> Result<ImageMetaDto, String> {
    state.with_active(|ws| handlers::handle_resolve_image_path(ws, &path))
}

#[tauri::command]
pub fn resolve_pdf_path(state: State<'_, AppState>, path: String) -> Result<PdfMetaDto, String> {
    state.with_active(|ws| handlers::handle_resolve_pdf_path(ws, &path))
}

#[tauri::command]
pub fn load_pdf_highlights(state: State<'_, AppState>, pdf_path: String) -> Result<Vec<PdfHighlightDto>, String> {
    state.with_active(|ws| handlers::handle_load_pdf_highlights(ws, &pdf_path))
}

#[tauri::command]
pub fn save_pdf_highlights(state: State<'_, AppState>, pdf_path: String, highlights: Vec<PdfHighlightDto>) -> Result<(), String> {
    state.with_active(|ws| handlers::handle_save_pdf_highlights(ws, &pdf_path, highlights))
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
pub fn write_raw_note(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    path: String,
    content: String,
) -> Result<(), String> {
    let root = state.resolve_root(None)?;
    let abs_path = state.with_slot(&root, |slot| {
        handlers::validate_relative_path(&slot.workspace.root, &path)
    })?;
    state.register_expected_write(&root, abs_path);

    let diff = state.with_slot_mut(&root, |slot| {
        handlers::handle_write_raw_note(&mut slot.workspace, &path, &content)
    })?;

    emit_topology_event(
        &app,
        &root,
        diff.added_nodes.iter().map(node_to_payload).collect(),
        diff.removed_nodes.iter().map(|p| p.as_str().to_string()).collect(),
        diff.added_edges.iter().map(edge_to_payload).collect(),
        diff.removed_edges.iter().map(edge_to_payload).collect(),
    );

    Ok(())
}

#[tauri::command]
pub fn convert_to_note(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    path: String,
    note_type: Option<String>,
) -> Result<String, String> {
    let root = state.resolve_root(None)?;
    let abs_path = state.with_slot(&root, |slot| {
        handlers::validate_relative_path(&slot.workspace.root, &path)
    })?;
    state.register_expected_write(&root, abs_path);

    let (created_path, diff) = state.with_slot_mut(&root, |slot| {
        handlers::handle_convert_to_note(&mut slot.workspace, &path, note_type)
    })?;

    emit_topology_event(
        &app,
        &root,
        diff.added_nodes.iter().map(node_to_payload).collect(),
        diff.removed_nodes.iter().map(|p| p.as_str().to_string()).collect(),
        diff.added_edges.iter().map(edge_to_payload).collect(),
        diff.removed_edges.iter().map(edge_to_payload).collect(),
    );

    Ok(created_path)
}

#[tauri::command]
pub fn list_workspace_files(state: State<'_, AppState>) -> Result<Vec<String>, String> {
    state.with_active(|ws| Ok(handlers::handle_list_workspace_files(ws)))
}

#[tauri::command]
pub fn reveal_in_file_manager(path: String) -> Result<(), String> {
    let p = std::path::Path::new(&path);
    if !p.exists() {
        return Err(format!("Path not found: {}", path));
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg("-R")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to reveal in Finder: {}", e))?;
    }
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(format!("/select,{}", path))
            .spawn()
            .map_err(|e| format!("Failed to reveal in Explorer: {}", e))?;
    }
    #[cfg(target_os = "linux")]
    {
        let parent = p.parent().unwrap_or(p);
        std::process::Command::new("xdg-open")
            .arg(parent)
            .spawn()
            .map_err(|e| format!("Failed to open file manager: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
pub fn open_in_default_app(path: String) -> Result<(), String> {
    let p = std::path::Path::new(&path);
    if !p.exists() {
        return Err(format!("Path not found: {}", path));
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(["/c", "start", "", &path])
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
pub fn duplicate_note(state: State<'_, AppState>, path: String) -> Result<NoteDetailDto, String> {
    state.with_active_mut(|ws| {
        // Read original note content
        let abs = ws.root.join(&path);
        let content = std::fs::read_to_string(&abs)
            .map_err(|e| format!("Failed to read note: {}", e))?;

        // Generate copy path: "Note.md" → "Note (copy).md"
        let stem = path.trim_end_matches(".md");
        let mut copy_path = format!("{} (copy).md", stem);
        let mut counter = 2;
        while ws.root.join(&copy_path).exists() {
            copy_path = format!("{} (copy {}).md", stem, counter);
            counter += 1;
        }

        // Write the copy
        let copy_abs = ws.root.join(&copy_path);
        if let Some(parent) = copy_abs.parent() {
            std::fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create directory: {}", e))?;
        }
        std::fs::write(&copy_abs, &content)
            .map_err(|e| format!("Failed to write copy: {}", e))?;

        // Reload the workspace to pick up the new file
        ws.add_file(&copy_path).map_err(|e| e.to_string())?;

        // Return the new note detail
        let note = ws.notes.get(&RelativePath::new(&copy_path))
            .ok_or_else(|| format!("Failed to find copied note: {}", copy_path))?;
        Ok(NoteDetailDto::from(note))
    })
}

#[tauri::command]
pub fn write_log(level: String, target: String, msg: String, fields: Option<String>) {
    let fields_str = fields.as_deref().unwrap_or("");
    match level.as_str() {
        "ERROR" => error!(target: "frontend", origin = %target, fields = %fields_str, "{}", msg),
        "WARN" => warn!(target: "frontend", origin = %target, fields = %fields_str, "{}", msg),
        "DEBUG" => debug!(target: "frontend", origin = %target, fields = %fields_str, "{}", msg),
        _ => info!(target: "frontend", origin = %target, fields = %fields_str, "{}", msg),
    }
}

// -- Dock menu (macOS) -------------------------------------------------------

#[cfg(target_os = "macos")]
pub use crate::dock_menu::DockSegmentInfo;

#[cfg(not(target_os = "macos"))]
#[derive(serde::Deserialize)]
pub struct DockSegmentInfo {
    pub name: String,
    pub path: String,
}

#[tauri::command]
pub fn update_dock_menu(segments: Vec<DockSegmentInfo>) {
    #[cfg(target_os = "macos")]
    crate::dock_menu::update(segments);
}
