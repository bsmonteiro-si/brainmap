use std::collections::HashMap;
use std::path::{Path, PathBuf};

use walkdir::WalkDir;

use crate::config::{load_config, save_config, WorkspaceConfig};
use crate::error::{BrainMapError, Result};
use crate::graph::{compute_implicit_edges, Graph};
use crate::index::Index;
use crate::model::{Edge, EdgeKind, NodeData, Note, RelativePath};
use crate::parser;

const BRAINMAP_DIR: &str = ".brainmap";

pub struct Workspace {
    pub root: PathBuf,
    pub config: WorkspaceConfig,
    pub graph: Graph,
    pub index: Index,
    pub notes: HashMap<RelativePath, Note>,
}

#[derive(Debug)]
pub struct ValidationIssue {
    pub severity: Severity,
    pub message: String,
    pub path: Option<String>,
}

#[derive(Debug, PartialEq, Eq)]
pub enum Severity {
    Error,
    Warning,
}

#[derive(Debug)]
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
        let brainmap_dir = root.join(BRAINMAP_DIR);
        let mut config = load_config(&brainmap_dir)?;

        let md_files = scan_md_files(&root);
        let mut notes = HashMap::new();
        let mut parse_errors = Vec::new();

        for file_path in &md_files {
            match parser::parse_file(&root, file_path) {
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
            root,
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
}
