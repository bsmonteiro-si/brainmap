use std::collections::HashMap;
use std::path::{Path, PathBuf};

use serde::Serialize;
use walkdir::WalkDir;

use chrono::Local;

use crate::config::{load_config, save_config, WorkspaceConfig};
use crate::error::{BrainMapError, Result};
use crate::graph::{compute_implicit_edges, Graph, Subgraph};
use crate::index::Index;
use crate::model::{
    Direction, Edge, EdgeKind, Frontmatter, GraphDiff, NodeData, Note, NoteId, RelativePath,
    Status, TypedLink,
};
use crate::parser;

const BRAINMAP_DIR: &str = ".brainmap";

pub struct Workspace {
    pub root: PathBuf,
    pub config: WorkspaceConfig,
    pub graph: Graph,
    pub index: Index,
    pub notes: HashMap<RelativePath, Note>,
}

#[derive(Debug, Serialize)]
pub struct ValidationIssue {
    pub severity: Severity,
    pub message: String,
    pub path: Option<String>,
}

#[derive(Debug, PartialEq, Eq, Serialize)]
pub enum Severity {
    Error,
    Warning,
}

#[derive(Debug, Serialize)]
pub struct WorkspaceStats {
    pub node_count: usize,
    pub edge_count: usize,
    pub nodes_by_type: HashMap<String, usize>,
    pub edges_by_rel: HashMap<String, usize>,
    pub edges_by_kind: HashMap<String, usize>,
    pub orphan_count: usize,
}

impl Workspace {
    pub fn init(path: &Path) -> Result<()> {
        let brainmap_dir = path.join(BRAINMAP_DIR);
        if brainmap_dir.exists() {
            return Err(BrainMapError::WorkspaceExists(
                path.display().to_string(),
            ));
        }

        std::fs::create_dir_all(&brainmap_dir)?;

        let name = path
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_else(|| "workspace".to_string());

        let config = WorkspaceConfig::new(&name);
        save_config(&config, &brainmap_dir)?;

        let index_path = brainmap_dir.join("index.db");
        Index::open(&index_path)?;

        Ok(())
    }

    pub fn open(path: &Path) -> Result<Self> {
        let root = find_workspace_root(path)?;
        Self::load_from_root(&root)
    }

    /// Open a workspace rooted exactly at `path`, initializing if needed.
    /// Unlike `open()`, this does NOT walk up the directory tree.
    pub fn open_or_init(path: &Path) -> Result<Self> {
        if path.is_file() {
            return Err(BrainMapError::InvalidArgument(format!(
                "expected a directory, got a file: {}",
                path.display()
            )));
        }
        let brainmap_dir = path.join(BRAINMAP_DIR);
        if !brainmap_dir.is_dir() {
            Self::init(path)?;
        }
        Self::load_from_root(path)
    }

    fn load_from_root(root: &Path) -> Result<Self> {
        let brainmap_dir = root.join(BRAINMAP_DIR);
        let mut config = load_config(&brainmap_dir)?;

        let md_files = scan_md_files(root);
        let mut notes = HashMap::new();
        let mut parse_errors = Vec::new();

        for file_path in &md_files {
            match parser::parse_file(root, file_path) {
                Ok(note) => {
                    if config.register_note_type(&note.frontmatter.note_type) {
                        eprintln!(
                            "warning: unregistered note type '{}' in {}",
                            note.frontmatter.note_type,
                            note.path
                        );
                    }
                    notes.insert(note.path.clone(), note);
                }
                Err(e) => {
                    parse_errors.push(format!("{}: {}", file_path.display(), e));
                }
            }
        }

        if !parse_errors.is_empty() {
            eprintln!("Parse errors ({}):", parse_errors.len());
            for err in &parse_errors {
                eprintln!("  {}", err);
            }
        }

        let mut graph = Graph::new();
        for (path, note) in &notes {
            graph.add_node(
                path.clone(),
                NodeData {
                    title: note.frontmatter.title.clone(),
                    note_type: note.frontmatter.note_type.clone(),

                    tags: note.frontmatter.tags.clone(),
                    path: path.clone(),
                },
            );
        }

        let mut all_edges = Vec::new();

        for note in notes.values() {
            for link in &note.frontmatter.links {
                let target = note.path.resolve_relative(&link.target);
                let edge = Edge {
                    source: note.path.clone(),
                    target,
                    rel: link.rel.clone(),
                    kind: EdgeKind::Explicit,
                };
                if config.register_edge_type(&link.rel) {
                    eprintln!(
                        "warning: unregistered edge type '{}' in {}",
                        link.rel, note.path
                    );
                }
                all_edges.push(edge);
            }

            for inline in &note.inline_links {
                all_edges.push(Edge {
                    source: note.path.clone(),
                    target: RelativePath::new(&inline.target),
                    rel: "mentioned-in".to_string(),
                    kind: EdgeKind::Inline,
                });
            }
        }

        let node_data: HashMap<RelativePath, NodeData> = notes
            .iter()
            .map(|(p, n)| {
                (
                    p.clone(),
                    NodeData {
                        title: n.frontmatter.title.clone(),
                        note_type: n.frontmatter.note_type.clone(),

                        tags: n.frontmatter.tags.clone(),
                        path: p.clone(),
                    },
                )
            })
            .collect();

        let implicit = compute_implicit_edges(&node_data, &all_edges);
        all_edges.extend(implicit);

        for edge in &all_edges {
            graph.add_edge(edge.clone());
        }

        let index_path = brainmap_dir.join("index.db");
        let index = Index::open(&index_path)?;

        let note_refs: Vec<(&Note, i64)> = notes
            .values()
            .map(|n| {
                let file_path = root.join(n.path.as_str());
                let mtime = std::fs::metadata(&file_path)
                    .map(|m| {
                        m.modified()
                            .unwrap_or(std::time::SystemTime::UNIX_EPOCH)
                            .duration_since(std::time::SystemTime::UNIX_EPOCH)
                            .unwrap_or_default()
                            .as_secs() as i64
                    })
                    .unwrap_or(0);
                (n, mtime)
            })
            .collect();

        index.rebuild(&note_refs, &all_edges)?;

        Ok(Self {
            root: root.to_path_buf(),
            config,
            graph,
            index,
            notes,
        })
    }

    pub fn validate(&self) -> Vec<ValidationIssue> {
        let mut issues = Vec::new();

        for note in self.notes.values() {
            for link in &note.frontmatter.links {
                let target = note.path.resolve_relative(&link.target);
                if target.as_str().contains("::") {
                    issues.push(ValidationIssue {
                        severity: Severity::Warning,
                        message: format!(
                            "federation link not resolvable: {} -> {}",
                            note.path, link.target
                        ),
                        path: Some(note.path.as_str().to_string()),
                    });
                    continue;
                }
                if !self.notes.contains_key(&target) {
                    issues.push(ValidationIssue {
                        severity: Severity::Error,
                        message: format!(
                            "broken link: {} -> {} (type: {})",
                            note.path, link.target, link.rel
                        ),
                        path: Some(note.path.as_str().to_string()),
                    });
                }
            }
        }

        let orphans = self.graph.orphan_nodes();
        for orphan in &orphans {
            issues.push(ValidationIssue {
                severity: Severity::Warning,
                message: format!("orphan node: {}", orphan),
                path: Some(orphan.as_str().to_string()),
            });
        }

        for note in self.notes.values() {
            if note.frontmatter.title.is_empty() {
                issues.push(ValidationIssue {
                    severity: Severity::Error,
                    message: format!("missing required field 'title' in {}", note.path),
                    path: Some(note.path.as_str().to_string()),
                });
            }
        }

        issues
    }

    pub fn stats(&self) -> WorkspaceStats {
        let gs = self.graph.stats();
        WorkspaceStats {
            node_count: gs.node_count,
            edge_count: gs.edge_count,
            nodes_by_type: gs.nodes_by_type,
            edges_by_rel: gs.edges_by_type,
            edges_by_kind: gs.edges_by_kind,
            orphan_count: gs.orphan_count,
        }
    }

    pub fn create_note(
        &mut self,
        rel_path: &str,
        title: &str,
        note_type: &str,
        tags: Vec<String>,
        status: Option<Status>,
        source: Option<String>,
        summary: Option<String>,
        extra: HashMap<String, serde_yaml::Value>,
        body: String,
    ) -> Result<RelativePath> {
        let path = RelativePath::new(rel_path);
        if self.notes.contains_key(&path) {
            return Err(BrainMapError::DuplicatePath(rel_path.to_string()));
        }

        let today = Local::now().date_naive();
        let frontmatter = Frontmatter {
            id: NoteId::new(),
            title: title.to_string(),
            note_type: note_type.to_string(),
            tags,
            status,
            created: today,
            modified: today,
            source,
            summary,
            links: vec![],
            extra,
        };

        let note = Note {
            path: path.clone(),
            frontmatter,
            body,
            inline_links: vec![],
        };

        let content = parser::serialize_note(&note)?;
        let file_path = self.root.join(rel_path);
        if let Some(parent) = file_path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        std::fs::write(&file_path, &content)?;

        let mtime = file_mtime(&file_path);
        self.index.add_note(&note, mtime)?;

        self.graph.add_node(
            path.clone(),
            NodeData {
                title: note.frontmatter.title.clone(),
                note_type: note.frontmatter.note_type.clone(),

                tags: note.frontmatter.tags.clone(),
                path: path.clone(),
            },
        );

        self.notes.insert(path.clone(), note);
        Ok(path)
    }

    pub fn read_note(&self, rel_path: &str) -> Result<&Note> {
        let path = RelativePath::new(rel_path);
        self.notes
            .get(&path)
            .ok_or_else(|| BrainMapError::FileNotFound(rel_path.to_string()))
    }

    pub fn update_note(
        &mut self,
        rel_path: &str,
        title: Option<String>,
        note_type: Option<String>,
        tags: Option<Vec<String>>,
        status: Option<Option<Status>>,
        source: Option<Option<String>>,
        summary: Option<Option<String>>,
        extra: Option<HashMap<String, serde_yaml::Value>>,
        body: Option<String>,
    ) -> Result<()> {
        let path = RelativePath::new(rel_path);
        let note = self
            .notes
            .get_mut(&path)
            .ok_or_else(|| BrainMapError::FileNotFound(rel_path.to_string()))?;

        if let Some(t) = title {
            note.frontmatter.title = t;
        }
        if let Some(t) = note_type {
            note.frontmatter.note_type = t;
        }
        if let Some(t) = tags {
            note.frontmatter.tags = t;
        }
        if let Some(s) = status {
            note.frontmatter.status = s;
        }
        if let Some(s) = source {
            note.frontmatter.source = s;
        }
        if let Some(s) = summary {
            note.frontmatter.summary = s;
        }
        if let Some(e) = extra {
            note.frontmatter.extra.extend(e);
        }
        if let Some(b) = body {
            note.body = b;
        }

        note.frontmatter.modified = Local::now().date_naive();

        let content = parser::serialize_note(note)?;
        let file_path = self.root.join(rel_path);
        std::fs::write(&file_path, &content)?;

        let mtime = file_mtime(&file_path);
        self.index.update_note(note, mtime)?;

        let note_ref = self.notes.get(&path).unwrap();
        self.graph.add_node(
            path.clone(),
            NodeData {
                title: note_ref.frontmatter.title.clone(),
                note_type: note_ref.frontmatter.note_type.clone(),

                tags: note_ref.frontmatter.tags.clone(),
                path: path.clone(),
            },
        );

        Ok(())
    }

    pub fn delete_note(&mut self, rel_path: &str, force: bool) -> Result<()> {
        let path = RelativePath::new(rel_path);
        if !self.notes.contains_key(&path) {
            return Err(BrainMapError::FileNotFound(rel_path.to_string()));
        }

        let backlinks = self.index.backlinks(&path)?;
        if !backlinks.is_empty() && !force {
            return Err(BrainMapError::HasBacklinks {
                path: rel_path.to_string(),
                backlinks,
            });
        }

        let file_path = self.root.join(rel_path);
        if file_path.exists() {
            std::fs::remove_file(&file_path)?;
        }

        self.notes.remove(&path);
        self.graph.remove_node(&path);
        self.index.remove_note(&path)?;

        Ok(())
    }

    pub fn create_link(
        &mut self,
        source_path: &str,
        target_path: &str,
        rel: &str,
        annotation: Option<String>,
    ) -> Result<()> {
        let source = RelativePath::new(source_path);
        let target = RelativePath::new(target_path);

        if !self.notes.contains_key(&source) {
            return Err(BrainMapError::FileNotFound(source_path.to_string()));
        }
        if !self.notes.contains_key(&target) {
            return Err(BrainMapError::BrokenLinkTarget {
                from: source_path.to_string(),
                to: target_path.to_string(),
            });
        }

        let note = self.notes.get(&source).unwrap();
        let relative_target = compute_relative_target(&source, &target);
        let already_exists = note
            .frontmatter
            .links
            .iter()
            .any(|l| note.path.resolve_relative(&l.target) == target && l.rel == rel);

        if already_exists {
            return Err(BrainMapError::DuplicateLink {
                from: source_path.to_string(),
                to: target_path.to_string(),
                rel: rel.to_string(),
            });
        }

        let note = self.notes.get_mut(&source).unwrap();
        note.frontmatter.links.push(TypedLink {
            target: relative_target,
            rel: rel.to_string(),
            annotation,
        });
        note.frontmatter.modified = Local::now().date_naive();

        let content = parser::serialize_note(note)?;
        let file_path = self.root.join(source_path);
        std::fs::write(&file_path, &content)?;

        let mtime = file_mtime(&file_path);
        self.index.update_note(note, mtime)?;

        let edge = Edge {
            source: source.clone(),
            target: target.clone(),
            rel: rel.to_string(),
            kind: EdgeKind::Explicit,
        };
        self.graph.add_edge(edge.clone());
        self.index.add_edges(&[edge])?;

        Ok(())
    }

    pub fn list_links(
        &self,
        rel_path: &str,
        direction: &Direction,
        rel_filter: Option<&str>,
    ) -> Result<Vec<&Edge>> {
        let path = RelativePath::new(rel_path);
        if !self.notes.contains_key(&path) {
            return Err(BrainMapError::FileNotFound(rel_path.to_string()));
        }

        let edges = self.graph.edges_for(&path, direction);
        match rel_filter {
            Some(filter) => Ok(edges.into_iter().filter(|e| e.rel == filter).collect()),
            None => Ok(edges),
        }
    }

    pub fn list_nodes(
        &self,
        type_filter: Option<&str>,
        tag_filter: Option<&str>,
        status_filter: Option<&str>,
    ) -> Vec<&Note> {
        self.notes
            .values()
            .filter(|note| {
                if let Some(t) = type_filter {
                    if note.frontmatter.note_type != t {
                        return false;
                    }
                }
                if let Some(tag) = tag_filter {
                    if !note.frontmatter.tags.iter().any(|t| t == tag) {
                        return false;
                    }
                }
                if let Some(s) = status_filter {
                    let status_str = note
                        .frontmatter
                        .status
                        .as_ref()
                        .map(|st| format!("{:?}", st).to_lowercase());
                    if status_str.as_deref() != Some(s) {
                        return false;
                    }
                }
                true
            })
            .collect()
    }

    pub fn delete_link(&mut self, source_path: &str, target_path: &str, rel: &str) -> Result<()> {
        let source = RelativePath::new(source_path);
        let target = RelativePath::new(target_path);

        let note = self
            .notes
            .get(&source)
            .ok_or_else(|| BrainMapError::FileNotFound(source_path.to_string()))?;

        let link_idx = note
            .frontmatter
            .links
            .iter()
            .position(|l| note.path.resolve_relative(&l.target) == target && l.rel == rel)
            .ok_or_else(|| BrainMapError::LinkNotFound {
                from: source_path.to_string(),
                to: target_path.to_string(),
                rel: rel.to_string(),
            })?;

        let note = self.notes.get_mut(&source).unwrap();
        note.frontmatter.links.remove(link_idx);
        note.frontmatter.modified = Local::now().date_naive();

        let content = parser::serialize_note(note)?;
        let file_path = self.root.join(source_path);
        std::fs::write(&file_path, &content)?;

        let mtime = file_mtime(&file_path);
        self.index.update_note(note, mtime)?;

        self.graph.remove_edge(&source, &target, rel);
        self.index.remove_edge(&source, &target, rel)?;

        Ok(())
    }

    /// Re-parse a file that changed on disk, update graph + index, return diff.
    pub fn reload_file(&mut self, rel_path: &str) -> Result<GraphDiff> {
        let path = RelativePath::new(rel_path);
        let file_path = self.root.join(rel_path);

        if !file_path.exists() {
            return Err(BrainMapError::FileNotFound(rel_path.to_string()));
        }

        let new_note = parser::parse_file(&self.root, &file_path)?;

        // Collect old edges for this node
        let old_outgoing: Vec<Edge> = self
            .graph
            .edges_for(&path, &Direction::Outgoing)
            .into_iter()
            .filter(|e| e.kind != EdgeKind::Implicit)
            .cloned()
            .collect();

        // Remove old edges from graph
        for edge in &old_outgoing {
            self.graph.remove_edge(&edge.source, &edge.target, &edge.rel);
            let _ = self.index.remove_edge(&edge.source, &edge.target, &edge.rel);
        }

        // Build new edges from the parsed note
        let mut new_edges = Vec::new();
        for link in &new_note.frontmatter.links {
            let target = new_note.path.resolve_relative(&link.target);
            new_edges.push(Edge {
                source: path.clone(),
                target,
                rel: link.rel.clone(),
                kind: EdgeKind::Explicit,
            });
        }
        for inline in &new_note.inline_links {
            new_edges.push(Edge {
                source: path.clone(),
                target: RelativePath::new(&inline.target),
                rel: "mentioned-in".to_string(),
                kind: EdgeKind::Inline,
            });
        }

        // Update node data in graph
        self.graph.add_node(
            path.clone(),
            NodeData {
                title: new_note.frontmatter.title.clone(),
                note_type: new_note.frontmatter.note_type.clone(),

                tags: new_note.frontmatter.tags.clone(),
                path: path.clone(),
            },
        );

        // Add new edges
        for edge in &new_edges {
            self.graph.add_edge(edge.clone());
        }
        self.index.add_edges(&new_edges)?;

        // Update index
        let mtime = file_mtime(&file_path);
        self.index.update_note(&new_note, mtime)?;

        // Update in-memory note
        self.notes.insert(path, new_note);

        Ok(GraphDiff {
            added_nodes: vec![], // node already existed, just updated
            removed_nodes: vec![],
            added_edges: new_edges,
            removed_edges: old_outgoing,
        })
    }

    /// Add a new file that appeared on disk to the graph + index.
    pub fn add_file(&mut self, rel_path: &str) -> Result<GraphDiff> {
        let path = RelativePath::new(rel_path);
        let file_path = self.root.join(rel_path);

        if self.notes.contains_key(&path) {
            // Already tracked — delegate to reload
            return self.reload_file(rel_path);
        }

        if !file_path.exists() {
            return Err(BrainMapError::FileNotFound(rel_path.to_string()));
        }

        let note = parser::parse_file(&self.root, &file_path)?;

        let node_data = NodeData {
            title: note.frontmatter.title.clone(),
            note_type: note.frontmatter.note_type.clone(),

            tags: note.frontmatter.tags.clone(),
            path: path.clone(),
        };
        self.graph.add_node(path.clone(), node_data.clone());

        let mut new_edges = Vec::new();
        for link in &note.frontmatter.links {
            let target = note.path.resolve_relative(&link.target);
            new_edges.push(Edge {
                source: path.clone(),
                target,
                rel: link.rel.clone(),
                kind: EdgeKind::Explicit,
            });
        }
        for inline in &note.inline_links {
            new_edges.push(Edge {
                source: path.clone(),
                target: RelativePath::new(&inline.target),
                rel: "mentioned-in".to_string(),
                kind: EdgeKind::Inline,
            });
        }

        for edge in &new_edges {
            self.graph.add_edge(edge.clone());
        }
        self.index.add_edges(&new_edges)?;

        let mtime = file_mtime(&file_path);
        self.index.add_note(&note, mtime)?;
        self.notes.insert(path, note);

        Ok(GraphDiff {
            added_nodes: vec![node_data],
            removed_nodes: vec![],
            added_edges: new_edges,
            removed_edges: vec![],
        })
    }

    /// Remove a file that was deleted from disk from the graph + index.
    pub fn remove_file(&mut self, rel_path: &str) -> Result<GraphDiff> {
        let path = RelativePath::new(rel_path);

        if !self.notes.contains_key(&path) {
            return Ok(GraphDiff::default());
        }

        // Collect all edges involving this node
        let removed_edges: Vec<Edge> = self
            .graph
            .edges_for(&path, &Direction::Both)
            .into_iter()
            .cloned()
            .collect();

        self.notes.remove(&path);
        self.graph.remove_node(&path);
        self.index.remove_note(&path)?;

        Ok(GraphDiff {
            added_nodes: vec![],
            removed_nodes: vec![path],
            added_edges: vec![],
            removed_edges,
        })
    }

    pub fn move_note(&mut self, old_path: &str, new_path: &str) -> Result<Vec<String>> {
        let old_rp = RelativePath::new(old_path);
        let new_rp = RelativePath::new(new_path);

        if !self.notes.contains_key(&old_rp) {
            return Err(BrainMapError::FileNotFound(old_path.to_string()));
        }
        if self.notes.contains_key(&new_rp) {
            return Err(BrainMapError::DuplicatePath(new_path.to_string()));
        }

        let old_file = self.root.join(old_path);
        let new_file = self.root.join(new_path);
        if let Some(parent) = new_file.parent() {
            std::fs::create_dir_all(parent)?;
        }
        std::fs::rename(&old_file, &new_file)?;

        let mut rewritten = Vec::new();
        let referencing: Vec<RelativePath> = self
            .notes
            .keys()
            .filter(|p| {
                if **p == old_rp {
                    return false;
                }
                let note = &self.notes[*p];
                note.frontmatter
                    .links
                    .iter()
                    .any(|l| note.path.resolve_relative(&l.target) == old_rp)
            })
            .cloned()
            .collect();

        for ref_path in &referencing {
            let note = self.notes.get_mut(ref_path).unwrap();
            for link in &mut note.frontmatter.links {
                if note.path.resolve_relative(&link.target) == old_rp {
                    link.target = compute_relative_target(ref_path, &new_rp);
                }
            }
            note.frontmatter.modified = Local::now().date_naive();
            let content = parser::serialize_note(note)?;
            let file_path = self.root.join(note.path.as_str());
            std::fs::write(&file_path, &content)?;
            rewritten.push(ref_path.as_str().to_string());
        }

        // Collect edges BEFORE removing the old node (remove_node deletes them)
        let old_outgoing: Vec<Edge> = self
            .graph
            .edges_for(&old_rp, &Direction::Outgoing)
            .into_iter()
            .cloned()
            .collect();
        let old_incoming: Vec<Edge> = self
            .graph
            .edges_for(&old_rp, &Direction::Incoming)
            .into_iter()
            .cloned()
            .collect();

        let mut note = self.notes.remove(&old_rp).unwrap();
        note.path = new_rp.clone();
        note.frontmatter.modified = Local::now().date_naive();
        let content = parser::serialize_note(&note)?;
        std::fs::write(&new_file, &content)?;

        self.graph.remove_node(&old_rp);
        self.index.remove_note(&old_rp)?;

        let mtime = file_mtime(&new_file);
        self.graph.add_node(
            new_rp.clone(),
            NodeData {
                title: note.frontmatter.title.clone(),
                note_type: note.frontmatter.note_type.clone(),

                tags: note.frontmatter.tags.clone(),
                path: new_rp.clone(),
            },
        );
        self.index.add_note(&note, mtime)?;
        self.notes.insert(new_rp.clone(), note);

        // Re-add outgoing edges with updated source
        let mut new_edges = Vec::new();
        for edge in old_outgoing {
            let new_edge = Edge {
                source: new_rp.clone(),
                target: edge.target,
                rel: edge.rel,
                kind: edge.kind,
            };
            self.graph.add_edge(new_edge.clone());
            new_edges.push(new_edge);
        }

        // Re-add incoming edges with updated target
        for edge in old_incoming {
            if referencing.contains(&edge.source) {
                continue; // handled below
            }
            let new_edge = Edge {
                source: edge.source,
                target: new_rp.clone(),
                rel: edge.rel,
                kind: edge.kind,
            };
            self.graph.add_edge(new_edge.clone());
            new_edges.push(new_edge);
        }

        // Rebuild edges from referencing notes
        for ref_path in &referencing {
            let note = &self.notes[ref_path];
            for link in &note.frontmatter.links {
                let target = note.path.resolve_relative(&link.target);
                if target == new_rp {
                    let new_edge = Edge {
                        source: ref_path.clone(),
                        target: new_rp.clone(),
                        rel: link.rel.clone(),
                        kind: EdgeKind::Explicit,
                    };
                    self.graph.add_edge(new_edge.clone());
                    new_edges.push(new_edge);
                }
            }
        }

        // Sync rewired edges to index
        self.index.add_edges(&new_edges)?;

        Ok(rewritten)
    }

    pub fn reindex(&mut self) -> Result<()> {
        let note_refs: Vec<(&Note, i64)> = self
            .notes
            .values()
            .map(|n| {
                let file_path = self.root.join(n.path.as_str());
                let mtime = file_mtime(&file_path);
                (n, mtime)
            })
            .collect();

        let all_edges: Vec<Edge> = self
            .graph
            .edges_for_all()
            .into_iter()
            .cloned()
            .collect();

        self.index.rebuild(&note_refs, &all_edges)?;
        Ok(())
    }

    pub fn find_path(
        &self,
        source: &str,
        target: &str,
        max_depth: Option<usize>,
    ) -> Result<Option<Vec<Edge>>> {
        let src = RelativePath::new(source);
        let tgt = RelativePath::new(target);

        if !self.notes.contains_key(&src) {
            return Err(BrainMapError::FileNotFound(source.to_string()));
        }
        if !self.notes.contains_key(&tgt) {
            return Err(BrainMapError::FileNotFound(target.to_string()));
        }

        Ok(self.graph.shortest_path(&src, &tgt, max_depth))
    }

    pub fn get_subgraph(
        &self,
        center: &str,
        depth: usize,
        rel_filter: Option<&str>,
    ) -> Result<Subgraph> {
        let center_rp = RelativePath::new(center);
        if !self.notes.contains_key(&center_rp) {
            return Err(BrainMapError::FileNotFound(center.to_string()));
        }

        let filter: Option<Vec<String>> = rel_filter.map(|r| vec![r.to_string()]);
        Ok(self
            .graph
            .subgraph(&center_rp, depth, filter.as_ref().map(|v| v.as_slice())))
    }
}

fn file_mtime(path: &Path) -> i64 {
    std::fs::metadata(path)
        .and_then(|m| m.modified())
        .map(|t| {
            t.duration_since(std::time::SystemTime::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs() as i64
        })
        .unwrap_or(0)
}

fn compute_relative_target(source: &RelativePath, target: &RelativePath) -> String {
    let source_dir = source
        .parent()
        .map(|p| p.as_str().to_string())
        .unwrap_or_default();
    let target_str = target.as_str();

    if source_dir.is_empty() {
        return target_str.to_string();
    }

    let source_parts: Vec<&str> = source_dir.split('/').collect();
    let target_parts: Vec<&str> = target_str.split('/').collect();

    let common = source_parts
        .iter()
        .zip(target_parts.iter())
        .take_while(|(a, b)| a == b)
        .count();

    let ups = source_parts.len() - common;
    let mut result = String::new();
    for _ in 0..ups {
        result.push_str("../");
    }
    result.push_str(&target_parts[common..].join("/"));
    result
}

fn find_workspace_root(start: &Path) -> Result<PathBuf> {
    let mut current = start.to_path_buf();
    if current.is_file() {
        current = current
            .parent()
            .map(|p| p.to_path_buf())
            .unwrap_or(current);
    }

    loop {
        if current.join(BRAINMAP_DIR).is_dir() {
            return Ok(current);
        }
        if !current.pop() {
            return Err(BrainMapError::InvalidWorkspace(
                "no .brainmap directory found".to_string(),
            ));
        }
    }
}

fn scan_md_files(root: &Path) -> Vec<PathBuf> {
    WalkDir::new(root)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| {
            let path = e.path();
            path.extension().map_or(false, |ext| ext == "md")
                && !path
                    .components()
                    .any(|c| c.as_os_str() == BRAINMAP_DIR)
        })
        .map(|e| e.into_path())
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_init_creates_workspace() {
        let dir = TempDir::new().unwrap();
        Workspace::init(dir.path()).unwrap();

        assert!(dir.path().join(".brainmap").is_dir());
        assert!(dir.path().join(".brainmap/config.yaml").is_file());
        assert!(dir.path().join(".brainmap/index.db").is_file());
    }

    #[test]
    fn test_init_fails_if_exists() {
        let dir = TempDir::new().unwrap();
        Workspace::init(dir.path()).unwrap();
        let result = Workspace::init(dir.path());
        assert!(result.is_err());
    }

    #[test]
    fn test_open_and_validate() {
        let dir = TempDir::new().unwrap();
        Workspace::init(dir.path()).unwrap();

        let note_content = r#"---
id: "550e8400-e29b-41d4-a716-446655440000"
title: "Test Note"
type: concept
created: 2025-01-15
modified: 2025-01-15
links:
  - target: missing.md
    type: related-to
---
Some content here.
"#;
        std::fs::write(dir.path().join("test.md"), note_content).unwrap();

        let ws = Workspace::open(dir.path()).unwrap();
        assert_eq!(ws.notes.len(), 1);

        let issues = ws.validate();
        let errors: Vec<_> = issues.iter().filter(|i| i.severity == Severity::Error).collect();
        assert!(!errors.is_empty());
    }

    #[test]
    fn test_open_or_init_creates_and_opens() {
        let dir = TempDir::new().unwrap();
        let ws = Workspace::open_or_init(dir.path()).unwrap();
        assert!(dir.path().join(".brainmap").is_dir());
        assert_eq!(ws.notes.len(), 0);
        assert_eq!(ws.root, dir.path());
    }

    #[test]
    fn test_open_or_init_opens_existing() {
        let dir = TempDir::new().unwrap();
        Workspace::init(dir.path()).unwrap();

        let note_content = r#"---
id: "550e8400-e29b-41d4-a716-446655440001"
title: "Existing Note"
type: concept
created: 2025-01-15
modified: 2025-01-15
---
Body.
"#;
        std::fs::write(dir.path().join("note.md"), note_content).unwrap();

        let ws = Workspace::open_or_init(dir.path()).unwrap();
        assert_eq!(ws.notes.len(), 1);
    }

    #[test]
    fn test_open_or_init_rejects_file_path() {
        let dir = TempDir::new().unwrap();
        let file = dir.path().join("somefile.txt");
        std::fs::write(&file, "hello").unwrap();

        let result = Workspace::open_or_init(&file);
        assert!(result.is_err());
    }

    #[test]
    fn test_open_or_init_does_not_walk_up() {
        let parent = TempDir::new().unwrap();
        Workspace::init(parent.path()).unwrap();

        let child = parent.path().join("subdir");
        std::fs::create_dir_all(&child).unwrap();

        let ws = Workspace::open_or_init(&child).unwrap();
        // Should open from child, not walk up to parent
        assert_eq!(ws.root, child);
        assert!(child.join(".brainmap").is_dir());
    }
}
