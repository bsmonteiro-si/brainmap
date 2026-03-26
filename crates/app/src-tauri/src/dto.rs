use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use ts_rs::TS;

use brainmap_core::model::{Edge, EdgeKind, NodeData, Note};
use brainmap_core::workspace::WorkspaceStats;

// ── Request DTOs ───────────────────────────────────────────────────

#[derive(Debug, Deserialize, TS)]
#[ts(export, export_to = "../../src/api/generated/")]
pub struct CreateNoteParams {
    pub path: String,
    pub title: String,
    pub note_type: String,
    #[serde(default)]
    pub tags: Vec<String>,
    pub status: Option<String>,
    pub source: Option<String>,
    pub summary: Option<String>,
    #[serde(default)]
    #[ts(type = "Record<string, unknown>")]
    pub extra: HashMap<String, serde_json::Value>,
    #[serde(default)]
    pub body: String,
}

#[derive(Debug, Deserialize, TS)]
#[ts(export, export_to = "../../src/api/generated/")]
pub struct UpdateNoteParams {
    pub path: String,
    pub title: Option<String>,
    pub note_type: Option<String>,
    pub tags: Option<Vec<String>>,
    pub status: Option<String>,
    pub source: Option<String>,
    pub summary: Option<String>,
    #[ts(type = "Record<string, unknown> | null")]
    pub extra: Option<HashMap<String, serde_json::Value>>,
    pub body: Option<String>,
}

#[derive(Debug, Deserialize, TS)]
#[ts(export, export_to = "../../src/api/generated/")]
pub struct SearchParams {
    pub query: String,
    pub note_type: Option<String>,
    pub tag: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize, TS)]
#[ts(export, export_to = "../../src/api/generated/")]
pub struct NeighborsParams {
    pub path: String,
    pub depth: usize,
    pub direction: Option<String>,
    pub rel_filter: Option<String>,
}

#[derive(Debug, Deserialize, TS)]
#[ts(export, export_to = "../../src/api/generated/")]
pub struct LinkParams {
    pub source: String,
    pub target: String,
    pub rel: String,
    pub annotation: Option<String>,
}

#[derive(Debug, Deserialize, TS)]
#[ts(export, export_to = "../../src/api/generated/")]
pub struct ListLinksParams {
    pub path: String,
    pub direction: String,
    pub rel_filter: Option<String>,
}

#[derive(Debug, Deserialize, TS)]
#[ts(export, export_to = "../../src/api/generated/")]
pub struct ListNodesParams {
    pub note_type: Option<String>,
    pub tag: Option<String>,
    pub status: Option<String>,
}

// ── Response DTOs ──────────────────────────────────────────────────

#[derive(Debug, Serialize, TS)]
#[ts(export, export_to = "../../src/api/generated/")]
pub struct WorkspaceInfoDto {
    pub name: String,
    pub root: String,
    pub node_count: usize,
    pub edge_count: usize,
}

#[derive(Debug, Serialize, TS)]
#[ts(export, export_to = "../../src/api/generated/")]
pub struct GraphTopologyDto {
    pub nodes: Vec<NodeDto>,
    pub edges: Vec<EdgeDto>,
}

#[derive(Debug, Clone, Serialize, TS)]
#[ts(export, export_to = "../../src/api/generated/")]
pub struct NodeDto {
    pub path: String,
    pub title: String,
    pub note_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub modified: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub summary: Option<String>,
}

impl From<&NodeData> for NodeDto {
    fn from(nd: &NodeData) -> Self {
        Self {
            path: nd.path.as_str().to_string(),
            title: nd.title.clone(),
            note_type: nd.note_type.clone(),
            tags: if nd.tags.is_empty() { None } else { Some(nd.tags.clone()) },
            modified: nd.modified.map(|d| d.to_string()),
            summary: nd.summary.clone(),
        }
    }
}

#[derive(Debug, Clone, Serialize, TS)]
#[ts(export, export_to = "../../src/api/generated/")]
pub struct EdgeDto {
    pub source: String,
    pub target: String,
    pub rel: String,
    pub kind: String,
}

impl From<&Edge> for EdgeDto {
    fn from(e: &Edge) -> Self {
        Self {
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
}

#[derive(Debug, Serialize, TS)]
#[ts(export, export_to = "../../src/api/generated/")]
pub struct NoteDetailDto {
    pub path: String,
    pub title: String,
    pub note_type: String,
    pub tags: Vec<String>,
    pub status: Option<String>,
    pub created: String,
    pub modified: String,
    pub source: Option<String>,
    pub summary: Option<String>,
    pub links: Vec<TypedLinkDto>,
    #[ts(type = "Record<string, unknown>")]
    pub extra: HashMap<String, serde_json::Value>,
    pub body: String,
}

#[derive(Debug, Serialize, TS)]
#[ts(export, export_to = "../../src/api/generated/")]
pub struct TypedLinkDto {
    pub target: String,
    pub rel: String,
    pub annotation: Option<String>,
}

impl From<&Note> for NoteDetailDto {
    fn from(note: &Note) -> Self {
        Self {
            path: note.path.as_str().to_string(),
            title: note.frontmatter.title.clone(),
            note_type: note.frontmatter.note_type.clone(),
            tags: note.frontmatter.tags.clone(),
            status: note.frontmatter.status.as_ref().map(|s| {
                serde_json::to_value(s).ok()
                    .and_then(|v| v.as_str().map(String::from))
                    .unwrap_or_else(|| format!("{:?}", s).to_lowercase())
            }),
            created: note.frontmatter.created.to_string(),
            modified: note.frontmatter.modified.to_string(),
            source: note.frontmatter.source.clone(),
            summary: note.frontmatter.summary.clone(),
            links: note
                .frontmatter
                .links
                .iter()
                .map(|l| {
                    let resolved = note.path.resolve_relative(&l.target);
                    TypedLinkDto {
                        target: resolved.as_str().to_string(),
                        rel: l.rel.clone(),
                        annotation: l.annotation.clone(),
                    }
                })
                .collect(),
            extra: yaml_map_to_json(&note.frontmatter.extra),
            body: note.body.clone(),
        }
    }
}

#[derive(Debug, Serialize, TS)]
#[ts(export, export_to = "../../src/api/generated/")]
pub struct NodeSummaryDto {
    pub path: String,
    pub title: String,
    pub note_type: String,
    pub tags: Vec<String>,
    pub status: Option<String>,
    pub summary: Option<String>,
}

impl From<&Note> for NodeSummaryDto {
    fn from(note: &Note) -> Self {
        Self {
            path: note.path.as_str().to_string(),
            title: note.frontmatter.title.clone(),
            note_type: note.frontmatter.note_type.clone(),
            tags: note.frontmatter.tags.clone(),
            status: note.frontmatter.status.as_ref().map(|s| {
                serde_json::to_value(s).ok()
                    .and_then(|v| v.as_str().map(String::from))
                    .unwrap_or_else(|| format!("{:?}", s).to_lowercase())
            }),
            summary: note.frontmatter.summary.clone(),
        }
    }
}

#[derive(Debug, Serialize, TS)]
#[ts(export, export_to = "../../src/api/generated/")]
pub struct SearchResultDto {
    pub path: String,
    pub title: String,
    pub note_type: String,
    pub snippet: String,
    pub rank: f64,
}

#[derive(Debug, Serialize, TS)]
#[ts(export, export_to = "../../src/api/generated/")]
pub struct SubgraphDto {
    pub nodes: Vec<NodeDto>,
    pub edges: Vec<EdgeDto>,
}

#[derive(Debug, Serialize, TS)]
#[ts(export, export_to = "../../src/api/generated/")]
pub struct StatsDto {
    pub node_count: usize,
    pub edge_count: usize,
    pub nodes_by_type: HashMap<String, usize>,
    pub edges_by_rel: HashMap<String, usize>,
    pub edges_by_kind: HashMap<String, usize>,
    pub orphan_count: usize,
}

impl From<WorkspaceStats> for StatsDto {
    fn from(s: WorkspaceStats) -> Self {
        Self {
            node_count: s.node_count,
            edge_count: s.edge_count,
            nodes_by_type: s.nodes_by_type,
            edges_by_rel: s.edges_by_rel,
            edges_by_kind: s.edges_by_kind,
            orphan_count: s.orphan_count,
        }
    }
}

// ── Delete Folder DTOs ────────────────────────────────────────────

#[derive(Debug, Serialize, TS)]
#[ts(export, export_to = "../../src/api/generated/")]
pub struct DeleteFolderResultDto {
    pub deleted_paths: Vec<String>,
}

#[derive(Debug, Serialize, TS)]
#[ts(export, export_to = "../../src/api/generated/")]
pub struct ExternalBacklinkDto {
    pub source_path: String,
    pub target_path: String,
    pub rel: String,
}

// ── Move DTOs ─────────────────────────────────────────────────────

#[derive(Debug, Serialize, TS)]
#[ts(export, export_to = "../../src/api/generated/")]
pub struct MoveNoteResultDto {
    pub new_path: String,
    pub rewritten_paths: Vec<String>,
}

#[derive(Debug, Serialize, TS)]
#[ts(export, export_to = "../../src/api/generated/")]
pub struct MoveFolderResultDto {
    pub new_folder: String,
    pub moved_notes: Vec<(String, String)>,
    pub rewritten_paths: Vec<String>,
}

// ── Plain File DTOs ───────────────────────────────────────────────

#[derive(Debug, Serialize, TS)]
#[ts(export, export_to = "../../src/api/generated/")]
pub struct PlainFileDto {
    pub path: String,
    pub body: String,
    pub binary: bool,
}

// ── File Meta DTOs ──────────────────────────────────────────────
// Used by resolve_pdf_path and resolve_image_path for asset protocol loading.

#[derive(Debug, Serialize, TS)]
#[ts(export, export_to = "../../src/api/generated/")]
pub struct PdfMetaDto {
    pub path: String,
    pub absolute_path: String,
    #[ts(type = "number")]
    pub size_bytes: u64,
}

/// Type alias for clarity — image resolution returns the same shape as PDF.
pub type ImageMetaDto = PdfMetaDto;

/// Type alias for clarity — video resolution returns the same shape as PDF.
pub type VideoMetaDto = PdfMetaDto;

// ── PDF Highlight DTOs ───────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HighlightRectDto {
    pub x: f64,
    pub y: f64,
    pub w: f64,
    pub h: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PdfHighlightDto {
    pub id: String,
    pub page: u32,
    pub rects: Vec<HighlightRectDto>,
    pub text: String,
    pub color: String,
    pub created_at: String,
}

// ── Helpers ────────────────────────────────────────────────────────

/// Convert serde_yaml::Value map to serde_json::Value map for IPC boundary.
fn yaml_map_to_json(map: &HashMap<String, serde_yaml::Value>) -> HashMap<String, serde_json::Value> {
    map.iter()
        .map(|(k, v)| (k.clone(), yaml_to_json(v)))
        .collect()
}

fn yaml_to_json(v: &serde_yaml::Value) -> serde_json::Value {
    match v {
        serde_yaml::Value::Null => serde_json::Value::Null,
        serde_yaml::Value::Bool(b) => serde_json::Value::Bool(*b),
        serde_yaml::Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                serde_json::Value::Number(i.into())
            } else if let Some(f) = n.as_f64() {
                serde_json::json!(f)
            } else {
                serde_json::Value::Null
            }
        }
        serde_yaml::Value::String(s) => serde_json::Value::String(s.clone()),
        serde_yaml::Value::Sequence(seq) => {
            serde_json::Value::Array(seq.iter().map(yaml_to_json).collect())
        }
        serde_yaml::Value::Mapping(map) => {
            let obj: serde_json::Map<String, serde_json::Value> = map
                .iter()
                .filter_map(|(k, v)| {
                    k.as_str().map(|ks| (ks.to_string(), yaml_to_json(v)))
                })
                .collect();
            serde_json::Value::Object(obj)
        }
        serde_yaml::Value::Tagged(tagged) => yaml_to_json(&tagged.value),
    }
}

/// Convert serde_json::Value map to serde_yaml::Value map for core API calls.
pub fn json_map_to_yaml(
    map: &HashMap<String, serde_json::Value>,
) -> HashMap<String, serde_yaml::Value> {
    map.iter()
        .map(|(k, v)| (k.clone(), json_to_yaml(v)))
        .collect()
}

fn json_to_yaml(v: &serde_json::Value) -> serde_yaml::Value {
    match v {
        serde_json::Value::Null => serde_yaml::Value::Null,
        serde_json::Value::Bool(b) => serde_yaml::Value::Bool(*b),
        serde_json::Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                serde_yaml::Value::Number(serde_yaml::Number::from(i))
            } else if let Some(f) = n.as_f64() {
                serde_yaml::Value::Number(serde_yaml::Number::from(f))
            } else {
                serde_yaml::Value::Null
            }
        }
        serde_json::Value::String(s) => serde_yaml::Value::String(s.clone()),
        serde_json::Value::Array(arr) => {
            serde_yaml::Value::Sequence(arr.iter().map(json_to_yaml).collect())
        }
        serde_json::Value::Object(obj) => {
            let map: serde_yaml::Mapping = obj
                .iter()
                .map(|(k, v)| (serde_yaml::Value::String(k.clone()), json_to_yaml(v)))
                .collect();
            serde_yaml::Value::Mapping(map)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn export_ts_bindings() {
        // Each call writes the .ts file to ../../src/api/generated/<StructName>.ts
        // Request DTOs
        CreateNoteParams::export_all().expect("CreateNoteParams");
        UpdateNoteParams::export_all().expect("UpdateNoteParams");
        SearchParams::export_all().expect("SearchParams");
        NeighborsParams::export_all().expect("NeighborsParams");
        LinkParams::export_all().expect("LinkParams");
        ListLinksParams::export_all().expect("ListLinksParams");
        ListNodesParams::export_all().expect("ListNodesParams");

        // Response DTOs
        WorkspaceInfoDto::export_all().expect("WorkspaceInfoDto");
        GraphTopologyDto::export_all().expect("GraphTopologyDto");
        NodeDto::export_all().expect("NodeDto");
        EdgeDto::export_all().expect("EdgeDto");
        NoteDetailDto::export_all().expect("NoteDetailDto");
        TypedLinkDto::export_all().expect("TypedLinkDto");
        NodeSummaryDto::export_all().expect("NodeSummaryDto");
        SearchResultDto::export_all().expect("SearchResultDto");
        SubgraphDto::export_all().expect("SubgraphDto");
        StatsDto::export_all().expect("StatsDto");
        DeleteFolderResultDto::export_all().expect("DeleteFolderResultDto");
        ExternalBacklinkDto::export_all().expect("ExternalBacklinkDto");
        MoveNoteResultDto::export_all().expect("MoveNoteResultDto");
        MoveFolderResultDto::export_all().expect("MoveFolderResultDto");
        PlainFileDto::export_all().expect("PlainFileDto");
        PdfMetaDto::export_all().expect("PdfMetaDto");
    }
}
