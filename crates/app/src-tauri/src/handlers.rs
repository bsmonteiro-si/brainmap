use brainmap_core::error::BrainMapError;
use brainmap_core::index::SearchFilters;
use brainmap_core::model::Direction;
use brainmap_core::workspace::Workspace;

use crate::dto::*;

/// Open a workspace and return its info.
/// Uses `open_or_init` which loads from the exact path (no ancestor walk-up)
/// and auto-initializes if `.brainmap` doesn't exist.
pub fn handle_open_workspace(path: &str) -> Result<(Workspace, WorkspaceInfoDto), String> {
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
    ws.delete_note(path, force).map_err(|e: BrainMapError| e.to_string())
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
pub fn handle_get_node_summary(ws: &Workspace, path: &str) -> Result<NodeSummaryDto, String> {
    let note = ws.read_note(path).map_err(|e: BrainMapError| e.to_string())?;
    Ok(NodeSummaryDto::from(note))
}

/// Get workspace stats.
pub fn handle_get_stats(ws: &Workspace) -> StatsDto {
    StatsDto::from(ws.stats())
}
