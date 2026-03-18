use brainmap_core::error::BrainMapError;
use brainmap_core::index::SearchFilters;
use brainmap_core::model::Direction;
use brainmap_core::workspace::Workspace;
use tracing::info;

use crate::dto::*;

/// Open a workspace and return its info.
/// Uses `open_or_init` which loads from the exact path (no ancestor walk-up)
/// and auto-initializes if `.brainmap` doesn't exist.
pub fn handle_open_workspace(path: &str) -> Result<(Workspace, WorkspaceInfoDto), String> {
    info!(path = path, "opening workspace");
    let p = std::path::Path::new(path);
    let ws = Workspace::open_or_init(p).map_err(|e: BrainMapError| e.to_string())?;
    let stats = ws.stats();
    let info = WorkspaceInfoDto {
        name: ws.config.name.clone(),
        root: ws.root.display().to_string(),
        node_count: stats.node_count,
        edge_count: stats.edge_count,
    };
    Ok((ws, info))
}

/// Get the full graph topology (all nodes + all edges).
pub fn handle_get_topology(ws: &Workspace) -> GraphTopologyDto {
    let nodes: Vec<NodeDto> = ws
        .graph
        .all_nodes()
        .map(|(_, nd)| NodeDto::from(nd))
        .collect();

    let edges: Vec<EdgeDto> = ws
        .graph
        .edges_for_all()
        .into_iter()
        .map(|e| EdgeDto::from(e))
        .collect();

    GraphTopologyDto { nodes, edges }
}

/// Get full note content for the editor.
pub fn handle_read_note(ws: &Workspace, path: &str) -> Result<NoteDetailDto, String> {
    let note = ws.read_note(path).map_err(|e: BrainMapError| e.to_string())?;
    Ok(NoteDetailDto::from(note))
}

/// Create a new note.
pub fn handle_create_note(
    ws: &mut Workspace,
    params: CreateNoteParams,
) -> Result<String, String> {
    let status = params
        .status
        .as_deref()
        .map(|s| s.parse())
        .transpose()
        .map_err(|e: String| e)?;

    let extra = json_map_to_yaml(&params.extra);

    let rp = ws
        .create_note(
            &params.path,
            &params.title,
            &params.note_type,
            params.tags,
            status,
            params.source,
            params.summary,
            extra,
            params.body,
        )
        .map_err(|e: BrainMapError| e.to_string())?;

    Ok(rp.as_str().to_string())
}

/// Update an existing note.
pub fn handle_update_note(
    ws: &mut Workspace,
    params: UpdateNoteParams,
) -> Result<(), String> {
    let status = params
        .status
        .as_deref()
        .map(|s| s.parse().map(Some))
        .transpose()
        .map_err(|e: String| e)?;

    let extra = params.extra.as_ref().map(json_map_to_yaml);

    ws.update_note(
        &params.path,
        params.title,
        params.note_type,
        params.tags,
        status,
        params.source.map(Some),
        params.summary.map(Some),
        extra,
        params.body,
    )
    .map_err(|e: BrainMapError| e.to_string())
}

/// Delete a note.
pub fn handle_delete_note(ws: &mut Workspace, path: &str, force: bool) -> Result<(), String> {
    // Move file to system trash before core delete (which skips if file is gone)
    let abs = ws.root.join(path);
    if abs.exists() {
        trash::delete(&abs).map_err(|e| format!("Failed to move to trash: {}", e))?;
    }
    ws.delete_note(path, force).map_err(|e: BrainMapError| e.to_string())
}

/// Delete a folder and all notes inside it.
///
/// When `force=false`, checks for external backlinks (from notes outside the folder)
/// and returns them as a structured error string if any exist.
/// When `force=true`, deletes all notes regardless of backlinks.
///
/// Notes are deleted in reverse-sorted order (deeper paths first) to avoid issues
/// with parent directories being cleaned up before children.
/// Uses non-recursive `remove_dir` to avoid silently deleting non-note files.
pub fn handle_delete_folder(
    ws: &mut Workspace,
    folder_path: &str,
    force: bool,
) -> Result<DeleteFolderResultDto, String> {
    let prefix = if folder_path.ends_with('/') {
        folder_path.to_string()
    } else {
        format!("{}/", folder_path)
    };

    // Collect all note paths under this folder
    let mut note_paths: Vec<String> = ws
        .notes
        .keys()
        .filter(|p| p.as_str().starts_with(&prefix))
        .map(|p| p.as_str().to_string())
        .collect();

    // Check for external backlinks when force=false
    if !force {
        let folder_note_set: std::collections::HashSet<&str> =
            note_paths.iter().map(|s| s.as_str()).collect();

        let mut external_backlinks: Vec<ExternalBacklinkDto> = Vec::new();
        for note_path in &note_paths {
            let rp = brainmap_core::model::RelativePath::new(note_path);
            if let Ok(backlinks) = ws.index.backlinks(&rp) {
                for (source, rel) in backlinks {
                    // Only report backlinks from notes OUTSIDE the folder
                    if !folder_note_set.contains(source.as_str()) {
                        external_backlinks.push(ExternalBacklinkDto {
                            source_path: source,
                            target_path: note_path.clone(),
                            rel,
                        });
                    }
                }
            }
        }

        if !external_backlinks.is_empty() {
            let bl_json = serde_json::to_string(&external_backlinks)
                .unwrap_or_else(|_| "[]".to_string());
            return Err(format!("EXTERNAL_BACKLINKS:{}", bl_json));
        }
    }

    // Delete notes in reverse-sorted order (deeper paths first)
    note_paths.sort();
    note_paths.reverse();

    let mut deleted_paths: Vec<String> = Vec::new();
    for note_path in &note_paths {
        match ws.delete_note(note_path, true) {
            Ok(()) => deleted_paths.push(note_path.clone()),
            Err(e) => {
                // Partial failure: return what we managed to delete + the error
                let partial_json = serde_json::to_string(&deleted_paths)
                    .unwrap_or_else(|_| "[]".to_string());
                return Err(format!(
                    "PARTIAL_DELETE:{}:{}",
                    partial_json,
                    e
                ));
            }
        }
    }

    // Delete remaining non-note files in the folder (images, PDFs, plain text, etc.)
    let dir_path = ws.root.join(folder_path);
    if dir_path.is_dir() {
        delete_remaining_files_recursive(&dir_path);
        // Walk bottom-up to remove empty subdirectories
        let _ = remove_empty_dirs_recursive(&dir_path);
    }

    Ok(DeleteFolderResultDto { deleted_paths })
}

/// Recursively remove empty directories bottom-up.
/// Ignores errors (non-empty dirs with non-note files will simply remain).
fn remove_empty_dirs_recursive(dir: &std::path::Path) -> std::io::Result<()> {
    if dir.is_dir() {
        for entry in std::fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();
            if path.is_dir() {
                let _ = remove_empty_dirs_recursive(&path);
            }
        }
        // Try to remove this directory — will fail if non-empty, which is fine
        let _ = std::fs::remove_dir(dir);
    }
    Ok(())
}

/// Recursively delete all regular files in a directory.
/// Skips symlinks (both files and directories) to avoid deleting content outside the workspace,
/// matching the behavior of `collect_files_recursive`.
fn delete_remaining_files_recursive(dir: &std::path::Path) {
    let entries = match std::fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return,
    };
    for entry in entries.flatten() {
        let path = entry.path();
        // Skip symlinks to avoid cycles and escaping workspace root
        if path.is_symlink() {
            continue;
        }
        if path.is_dir() {
            delete_remaining_files_recursive(&path);
        } else {
            let _ = trash::delete(&path);
        }
    }
}

/// Move a note to a new path.
pub fn handle_move_note(
    ws: &mut Workspace,
    old_path: &str,
    new_path: &str,
) -> Result<MoveNoteResultDto, String> {
    let rewritten = ws
        .move_note(old_path, new_path)
        .map_err(|e| e.to_string())?;
    Ok(MoveNoteResultDto {
        new_path: new_path.to_string(),
        rewritten_paths: rewritten,
    })
}

/// Move a folder and all its contents to a new location.
pub fn handle_move_folder(
    ws: &mut Workspace,
    old_folder: &str,
    new_folder: &str,
) -> Result<MoveFolderResultDto, String> {
    let result = ws
        .move_folder(old_folder, new_folder)
        .map_err(|e| e.to_string())?;
    Ok(MoveFolderResultDto {
        new_folder: result.new_folder,
        moved_notes: result.moved_notes,
        rewritten_paths: result.rewritten_paths,
    })
}

/// List nodes with optional filters.
pub fn handle_list_nodes(ws: &Workspace, params: ListNodesParams) -> Vec<NodeSummaryDto> {
    ws.list_nodes(
        params.note_type.as_deref(),
        params.tag.as_deref(),
        params.status.as_deref(),
    )
    .into_iter()
    .map(|note| NodeSummaryDto::from(note))
    .collect()
}

/// Full-text search.
pub fn handle_search(ws: &Workspace, params: SearchParams) -> Result<Vec<SearchResultDto>, String> {
    info!(query = %params.query, "searching workspace");
    let filters = SearchFilters {
        note_type: params.note_type,
        tag: params.tag,
        status: params.status,
    };

    let results = ws.index.search(&params.query, &filters).map_err(|e: BrainMapError| e.to_string())?;
    Ok(results
        .into_iter()
        .map(|r| SearchResultDto {
            path: r.path,
            title: r.title,
            note_type: r.note_type,
            snippet: r.snippet,
            rank: r.rank,
        })
        .collect())
}

/// Get neighborhood subgraph.
pub fn handle_get_neighbors(
    ws: &Workspace,
    params: NeighborsParams,
) -> Result<SubgraphDto, String> {
    let direction = match params.direction.as_deref() {
        Some("Incoming") => Direction::Incoming,
        Some("Outgoing") => Direction::Outgoing,
        _ => Direction::Both,
    };

    let rel_filter: Option<Vec<String>> = params.rel_filter.map(|r| vec![r]);
    let subgraph = ws.graph.neighbors(
        &brainmap_core::model::RelativePath::new(&params.path),
        params.depth,
        &direction,
        rel_filter.as_ref().map(|v| v.as_slice()),
    );

    Ok(SubgraphDto {
        nodes: subgraph.nodes.iter().map(|n| NodeDto::from(n)).collect(),
        edges: subgraph.edges.iter().map(|e| EdgeDto::from(e)).collect(),
    })
}

/// Create a link between two notes.
pub fn handle_create_link(ws: &mut Workspace, params: LinkParams) -> Result<(), String> {
    ws.create_link(&params.source, &params.target, &params.rel, params.annotation)
        .map_err(|e: BrainMapError| e.to_string())
}

/// Delete a link.
pub fn handle_delete_link(
    ws: &mut Workspace,
    source: &str,
    target: &str,
    rel: &str,
) -> Result<(), String> {
    ws.delete_link(source, target, rel)
        .map_err(|e: BrainMapError| e.to_string())
}

/// List links for a node.
pub fn handle_list_links(ws: &Workspace, params: ListLinksParams) -> Result<Vec<EdgeDto>, String> {
    let direction = match params.direction.as_str() {
        "Incoming" => Direction::Incoming,
        "Outgoing" => Direction::Outgoing,
        _ => Direction::Both,
    };

    let edges = ws
        .list_links(&params.path, &direction, params.rel_filter.as_deref())
        .map_err(|e: BrainMapError| e.to_string())?;

    Ok(edges.into_iter().map(|e| EdgeDto::from(e)).collect())
}

/// Get a lightweight summary for a single node (used for tooltips).
/// Falls back to graph-level NodeData for folder nodes (which have no backing Note).
pub fn handle_get_node_summary(ws: &Workspace, path: &str) -> Result<NodeSummaryDto, String> {
    match ws.read_note(path) {
        Ok(note) => Ok(NodeSummaryDto::from(note)),
        Err(_) => {
            // Check if it's a folder node in the graph.
            let rp = brainmap_core::model::RelativePath::new(path);
            if let Some(nd) = ws.graph.get_node(&rp) {
                if nd.is_folder() {
                    return Ok(NodeSummaryDto {
                        path: nd.path.as_str().to_string(),
                        title: nd.title.clone(),
                        note_type: "folder".to_string(),
                        tags: nd.tags.clone(),
                        status: None,
                        summary: None,
                    });
                }
            }
            Err(format!("node not found: {}", path))
        }
    }
}

/// Get workspace stats.
pub fn handle_get_stats(ws: &Workspace) -> StatsDto {
    StatsDto::from(ws.stats())
}

/// Read a plain (non-BrainMap) file's raw content.
pub fn handle_read_plain_file(ws: &Workspace, path: &str) -> Result<PlainFileDto, String> {
    let abs = validate_relative_path(&ws.root, path)?;
    let bytes = std::fs::read(&abs)
        .map_err(|e| format!("Failed to read file: {}", e))?;
    match String::from_utf8(bytes) {
        Ok(body) => Ok(PlainFileDto {
            path: path.to_string(),
            body,
            binary: false,
        }),
        Err(_) => Ok(PlainFileDto {
            path: path.to_string(),
            body: String::new(),
            binary: true,
        }),
    }
}

/// Resolve a PDF file path and return metadata for asset protocol loading.
/// Does NOT read file content — the frontend loads via Tauri's asset:// URL.
pub fn handle_resolve_pdf_path(ws: &Workspace, path: &str) -> Result<PdfMetaDto, String> {
    let abs = validate_relative_path(&ws.root, path)?;
    if !abs.exists() {
        return Err(format!("File not found: {}", path));
    }
    let ext = abs.extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase());
    if ext.as_deref() != Some("pdf") {
        return Err(format!("Not a PDF file: {}", path));
    }
    let meta = std::fs::metadata(&abs)
        .map_err(|e| format!("Failed to read file metadata: {}", e))?;
    let size = meta.len();
    const MAX_PDF_SIZE: u64 = 50 * 1024 * 1024; // 50 MB
    if size > MAX_PDF_SIZE {
        return Err(format!(
            "PDF file too large ({:.1} MB). Maximum supported size is 50 MB.",
            size as f64 / (1024.0 * 1024.0)
        ));
    }
    Ok(PdfMetaDto {
        path: path.to_string(),
        absolute_path: abs.to_string_lossy().to_string(),
        size_bytes: size,
    })
}

/// Create a new plain (non-BrainMap) file on disk.
/// Creates parent directories if needed. Rejects if the file already exists.
pub fn handle_create_plain_file(ws: &Workspace, path: &str, body: Option<&str>) -> Result<String, String> {
    let abs = validate_relative_path(&ws.root, path)?;
    if abs.exists() {
        return Err(format!("File already exists: {}", path));
    }
    if let Some(parent) = abs.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directories: {}", e))?;
    }
    std::fs::write(&abs, body.unwrap_or(""))
        .map_err(|e| format!("Failed to create file: {}", e))?;
    Ok(path.to_string())
}

/// Write a plain (non-BrainMap) file's raw content.
/// Rejects writes to files tracked in the BrainMap graph (use `update_note` instead).
pub fn handle_write_plain_file(ws: &Workspace, path: &str, body: &str) -> Result<(), String> {
    let rp = brainmap_core::model::RelativePath::new(path);
    if ws.notes.contains_key(&rp) {
        return Err("Cannot write to a BrainMap-managed note via plain file API".to_string());
    }
    let abs = validate_relative_path(&ws.root, path)?;
    std::fs::write(&abs, body)
        .map_err(|e| format!("Failed to write file: {}", e))
}

/// Delete a plain (non-BrainMap) file from disk.
/// Rejects deletion of files tracked in the BrainMap graph (use `delete_note` instead).
pub fn handle_delete_plain_file(ws: &Workspace, path: &str) -> Result<(), String> {
    let rp = brainmap_core::model::RelativePath::new(path);
    if ws.notes.contains_key(&rp) {
        return Err("Cannot delete a BrainMap-managed note via plain file API".to_string());
    }
    let abs = validate_relative_path(&ws.root, path)?;
    if !abs.exists() {
        return Err(format!("File not found: {}", path));
    }
    trash::delete(&abs)
        .map_err(|e| format!("Failed to move to trash: {}", e))?;
    Ok(())
}

/// Write raw content (frontmatter + body) for a BrainMap-managed note.
/// Writes to disk then re-parses via `reload_file` to update graph/index.
/// Returns the `GraphDiff` from reload_file for event emission.
pub fn handle_write_raw_note(ws: &mut Workspace, path: &str, content: &str) -> Result<brainmap_core::model::GraphDiff, String> {
    let rp = brainmap_core::model::RelativePath::new(path);
    if !ws.notes.contains_key(&rp) {
        return Err("Path is not a BrainMap-managed note".to_string());
    }
    let abs = validate_relative_path(&ws.root, path)?;
    std::fs::write(&abs, content)
        .map_err(|e| format!("Failed to write file: {}", e))?;
    let diff = ws.reload_file(path)
        .map_err(|e| format!("File saved but parse failed: {}", e))?;
    Ok(diff)
}

/// Validate that a relative path stays within the workspace root.
pub(crate) fn validate_relative_path(root: &std::path::Path, path: &str) -> Result<std::path::PathBuf, String> {
    let p = std::path::Path::new(path);
    if p.is_absolute() {
        return Err("Path must be relative".to_string());
    }
    let normalized = root.join(p).components().fold(
        std::path::PathBuf::new(),
        |mut acc, c| {
            match c {
                std::path::Component::ParentDir => { acc.pop(); acc }
                _ => { acc.push(c); acc }
            }
        },
    );
    if !normalized.starts_with(root) {
        return Err("Path escapes workspace root".to_string());
    }
    Ok(normalized)
}

/// Load PDF highlights from a sidecar JSON file next to the PDF.
/// Returns empty vec if the sidecar file doesn't exist (not an error).
pub fn handle_load_pdf_highlights(ws: &Workspace, pdf_path: &str) -> Result<Vec<PdfHighlightDto>, String> {
    let sidecar = format!("{}.highlights.json", pdf_path);
    let abs = validate_relative_path(&ws.root, &sidecar)?;
    if !abs.exists() {
        return Ok(Vec::new());
    }
    let content = std::fs::read_to_string(&abs)
        .map_err(|e| format!("Failed to read highlights file: {}", e))?;
    let highlights: Vec<PdfHighlightDto> = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse highlights JSON: {}", e))?;
    Ok(highlights)
}

/// Save PDF highlights to a sidecar JSON file next to the PDF.
/// If the highlights vec is empty, deletes the sidecar file.
pub fn handle_save_pdf_highlights(ws: &Workspace, pdf_path: &str, highlights: Vec<PdfHighlightDto>) -> Result<(), String> {
    let sidecar = format!("{}.highlights.json", pdf_path);
    let abs = validate_relative_path(&ws.root, &sidecar)?;
    if highlights.is_empty() {
        // Clean up empty file
        if abs.exists() {
            std::fs::remove_file(&abs)
                .map_err(|e| format!("Failed to delete highlights file: {}", e))?;
        }
        return Ok(());
    }
    let json = serde_json::to_string_pretty(&highlights)
        .map_err(|e| format!("Failed to serialize highlights: {}", e))?;
    if let Some(parent) = abs.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directories: {}", e))?;
    }
    std::fs::write(&abs, json)
        .map_err(|e| format!("Failed to write highlights file: {}", e))?;
    Ok(())
}

/// List all files in the workspace directory (recursive, no filtering).
/// Returns relative paths from the workspace root.
pub fn handle_list_workspace_files(ws: &Workspace) -> Vec<String> {
    let mut files = Vec::new();
    collect_files_recursive(&ws.root, &ws.root, &mut files);
    files.sort();
    files
}

/// Collect all files under a specific directory, returning paths relative to base.
/// Used by `delete_folder` to identify untracked files for the files-changed event.
pub(crate) fn collect_folder_files(
    base: &std::path::Path,
    dir: &std::path::Path,
    out: &mut Vec<String>,
) {
    collect_files_recursive(base, dir, out);
}

fn collect_files_recursive(
    base: &std::path::Path,
    dir: &std::path::Path,
    out: &mut Vec<String>,
) {
    let entries = match std::fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return,
    };
    for entry in entries.flatten() {
        let path = entry.path();

        // Skip symlinks to avoid cycles and escaping workspace root
        if path.is_symlink() {
            continue;
        }

        if path.is_dir() {
            collect_files_recursive(base, &path, out);
        } else if let Ok(rel) = path.strip_prefix(base) {
            out.push(rel.to_string_lossy().into_owned());
        }
    }
}
