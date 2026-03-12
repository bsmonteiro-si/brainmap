use std::collections::HashMap;
use std::fmt;
use std::path::{Component, Path, PathBuf};

use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct NoteId(pub Uuid);

impl NoteId {
    pub fn new() -> Self {
        Self(Uuid::new_v4())
    }
}

impl Default for NoteId {
    fn default() -> Self {
        Self::new()
    }
}

impl fmt::Display for NoteId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct RelativePath(String);

impl RelativePath {
    pub fn new(path: &str) -> Self {
        Self(normalize_path(path))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }

    pub fn parent(&self) -> Option<RelativePath> {
        Path::new(&self.0)
            .parent()
            .filter(|p| !p.as_os_str().is_empty())
            .map(|p| RelativePath(p.to_string_lossy().to_string()))
    }

    pub fn join(&self, other: &str) -> RelativePath {
        let combined = Path::new(&self.0).join(other);
        RelativePath::new(&combined.to_string_lossy())
    }

    pub fn resolve_relative(&self, target: &str) -> RelativePath {
        let base_dir = Path::new(&self.0)
            .parent()
            .unwrap_or(Path::new(""));
        let resolved = base_dir.join(target);
        RelativePath::new(&resolved.to_string_lossy())
    }
}

impl fmt::Display for RelativePath {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

fn normalize_path(path: &str) -> String {
    let path = path.replace('\\', "/");
    let path = path.trim_start_matches("./");

    let p = Path::new(path);
    let mut components = Vec::new();

    for component in p.components() {
        match component {
            Component::ParentDir => {
                components.pop();
            }
            Component::Normal(c) => {
                components.push(c.to_string_lossy().to_string());
            }
            Component::CurDir => {}
            _ => {}
        }
    }

    components.join("/")
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Status {
    Draft,
    Review,
    Final,
    Archived,
}

impl std::str::FromStr for Status {
    type Err = String;

    fn from_str(s: &str) -> std::result::Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "draft" => Ok(Status::Draft),
            "review" => Ok(Status::Review),
            "final" => Ok(Status::Final),
            "archived" => Ok(Status::Archived),
            other => Err(format!("invalid status: '{}'", other)),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TypedLink {
    pub target: String,
    #[serde(rename = "type")]
    pub rel: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub annotation: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct InlineLink {
    pub target: String,
    pub label: Option<String>,
    pub position: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Frontmatter {
    pub id: NoteId,
    pub title: String,
    #[serde(rename = "type")]
    pub note_type: String,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub tags: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<Status>,
    pub created: NaiveDate,
    pub modified: NaiveDate,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub summary: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub links: Vec<TypedLink>,
    #[serde(flatten)]
    pub extra: HashMap<String, serde_yaml::Value>,
}

#[derive(Debug, Clone, Serialize)]
pub struct Note {
    pub path: RelativePath,
    pub frontmatter: Frontmatter,
    pub body: String,
    pub inline_links: Vec<InlineLink>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum EdgeKind {
    Explicit,
    Implicit,
    Inline,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct Edge {
    pub source: RelativePath,
    pub target: RelativePath,
    pub rel: String,
    pub kind: EdgeKind,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum Direction {
    Outgoing,
    Incoming,
    Both,
}

#[derive(Debug, Clone, Serialize)]
pub struct NodeData {
    pub title: String,
    pub note_type: String,
    pub tags: Vec<String>,
    pub path: RelativePath,
}

#[derive(Debug, Clone, Default, Serialize)]
pub struct GraphDiff {
    pub added_nodes: Vec<NodeData>,
    pub removed_nodes: Vec<RelativePath>,
    pub added_edges: Vec<Edge>,
    pub removed_edges: Vec<Edge>,
}

impl From<PathBuf> for RelativePath {
    fn from(p: PathBuf) -> Self {
        RelativePath::new(&p.to_string_lossy())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_normalize_strips_leading_dot_slash() {
        assert_eq!(RelativePath::new("./foo/bar.md").as_str(), "foo/bar.md");
    }

    #[test]
    fn test_normalize_resolves_parent_dir() {
        assert_eq!(
            RelativePath::new("foo/bar/../baz.md").as_str(),
            "foo/baz.md"
        );
    }

    #[test]
    fn test_resolve_relative() {
        let note_path = RelativePath::new("Chapter 1/note.md");
        let resolved = note_path.resolve_relative("../Concepts/SCM.md");
        assert_eq!(resolved.as_str(), "Concepts/SCM.md");
    }

    #[test]
    fn test_parent() {
        let p = RelativePath::new("a/b/c.md");
        assert_eq!(p.parent().unwrap().as_str(), "a/b");
    }
}
