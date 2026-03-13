use std::collections::{BTreeSet, HashMap, HashSet, VecDeque};
use std::path::Path;

use serde::Serialize;
use tracing::{debug, trace};

use crate::model::{humanize_folder_name, Direction, Edge, EdgeKind, NodeData, RelativePath};

const MAX_DEPTH: usize = 10;

pub struct Graph {
    nodes: HashMap<RelativePath, NodeData>,
    outgoing: HashMap<RelativePath, Vec<Edge>>,
    incoming: HashMap<RelativePath, Vec<Edge>>,
}

#[derive(Debug, Clone, Serialize)]
pub struct Subgraph {
    pub nodes: Vec<NodeData>,
    pub edges: Vec<Edge>,
}

#[derive(Debug, Clone, Serialize)]
pub struct GraphStats {
    pub node_count: usize,
    pub edge_count: usize,
    pub nodes_by_type: HashMap<String, usize>,
    pub edges_by_type: HashMap<String, usize>,
    pub edges_by_kind: HashMap<String, usize>,
    pub orphan_count: usize,
}

impl Graph {
    pub fn new() -> Self {
        Self {
            nodes: HashMap::new(),
            outgoing: HashMap::new(),
            incoming: HashMap::new(),
        }
    }

    pub fn add_node(&mut self, path: RelativePath, data: NodeData) {
        self.nodes.insert(path.clone(), data);
        self.outgoing.entry(path.clone()).or_default();
        self.incoming.entry(path).or_default();
    }

    pub fn remove_node(&mut self, path: &RelativePath) {
        self.nodes.remove(path);
        self.outgoing.remove(path);
        self.incoming.remove(path);

        for edges in self.outgoing.values_mut() {
            edges.retain(|e| &e.target != path);
        }
        for edges in self.incoming.values_mut() {
            edges.retain(|e| &e.source != path);
        }
    }

    pub fn add_edge(&mut self, edge: Edge) {
        self.outgoing
            .entry(edge.source.clone())
            .or_default()
            .push(edge.clone());
        self.incoming
            .entry(edge.target.clone())
            .or_default()
            .push(edge);
    }

    pub fn remove_edge(&mut self, source: &RelativePath, target: &RelativePath, rel: &str) {
        if let Some(edges) = self.outgoing.get_mut(source) {
            edges.retain(|e| !(&e.target == target && e.rel == rel));
        }
        if let Some(edges) = self.incoming.get_mut(target) {
            edges.retain(|e| !(&e.source == source && e.rel == rel));
        }
    }

    pub fn get_node(&self, path: &RelativePath) -> Option<&NodeData> {
        self.nodes.get(path)
    }

    pub fn all_nodes(&self) -> impl Iterator<Item = (&RelativePath, &NodeData)> {
        self.nodes.iter()
    }

    pub fn node_count(&self) -> usize {
        self.nodes.len()
    }

    pub fn neighbors(
        &self,
        path: &RelativePath,
        depth: usize,
        direction: &Direction,
        rel_filter: Option<&[String]>,
    ) -> Subgraph {
        debug!(path = %path, depth = depth, "computing neighbors");
        let max = depth.min(MAX_DEPTH);
        let mut visited_nodes = HashSet::new();
        let mut collected_edges = Vec::new();
        let mut seen_edges: HashSet<(String, String, String)> = HashSet::new();
        let mut queue = VecDeque::new();

        visited_nodes.insert(path.clone());
        queue.push_back((path.clone(), 0));

        while let Some((current, d)) = queue.pop_front() {
            if d >= max {
                continue;
            }

            let edges = self.edges_for(&current, direction);
            for edge in edges {
                if let Some(filter) = rel_filter {
                    if !filter.iter().any(|f| f == &edge.rel) {
                        continue;
                    }
                }

                let neighbor = if &edge.source == &current {
                    &edge.target
                } else {
                    &edge.source
                };

                let key = (
                    edge.source.as_str().to_string(),
                    edge.target.as_str().to_string(),
                    edge.rel.clone(),
                );
                if seen_edges.insert(key) {
                    collected_edges.push(edge.clone());
                }

                if visited_nodes.insert(neighbor.clone()) {
                    queue.push_back((neighbor.clone(), d + 1));
                }
            }
        }

        let nodes: Vec<NodeData> = visited_nodes
            .iter()
            .filter_map(|p| self.nodes.get(p).cloned())
            .collect();

        Subgraph {
            nodes,
            edges: collected_edges,
        }
    }

    pub fn shortest_path(
        &self,
        source: &RelativePath,
        target: &RelativePath,
        max_depth: Option<usize>,
    ) -> Option<Vec<Edge>> {
        debug!(source = %source, target = %target, "finding shortest path");
        let max = max_depth.unwrap_or(MAX_DEPTH).min(MAX_DEPTH);
        let mut visited = HashSet::new();
        let mut queue: VecDeque<(RelativePath, Vec<Edge>)> = VecDeque::new();

        visited.insert(source.clone());
        queue.push_back((source.clone(), Vec::new()));

        while let Some((current, path)) = queue.pop_front() {
            if path.len() >= max {
                continue;
            }

            if let Some(edges) = self.outgoing.get(&current) {
                for edge in edges {
                    let mut new_path = path.clone();
                    new_path.push(edge.clone());

                    if &edge.target == target {
                        return Some(new_path);
                    }

                    if visited.insert(edge.target.clone()) {
                        queue.push_back((edge.target.clone(), new_path));
                    }
                }
            }
        }

        None
    }

    pub fn subgraph(
        &self,
        center: &RelativePath,
        depth: usize,
        rel_filter: Option<&[String]>,
    ) -> Subgraph {
        self.neighbors(center, depth, &Direction::Both, rel_filter)
    }

    pub fn orphan_nodes(&self) -> Vec<RelativePath> {
        self.nodes
            .keys()
            .filter(|path| {
                let out_empty = self
                    .outgoing
                    .get(*path)
                    .map_or(true, |e| e.is_empty());
                let in_empty = self
                    .incoming
                    .get(*path)
                    .map_or(true, |e| e.is_empty());
                out_empty && in_empty
            })
            .cloned()
            .collect()
    }

    pub fn stats(&self) -> GraphStats {
        let mut nodes_by_type: HashMap<String, usize> = HashMap::new();
        for node in self.nodes.values() {
            *nodes_by_type.entry(node.note_type.clone()).or_default() += 1;
        }

        let mut edges_by_type: HashMap<String, usize> = HashMap::new();
        let mut edges_by_kind: HashMap<String, usize> = HashMap::new();
        let mut edge_count = 0;

        for edges in self.outgoing.values() {
            for edge in edges {
                edge_count += 1;
                *edges_by_type.entry(edge.rel.clone()).or_default() += 1;
                let kind_str = match edge.kind {
                    EdgeKind::Explicit => "explicit",
                    EdgeKind::Implicit => "implicit",
                    EdgeKind::Inline => "inline",
                };
                *edges_by_kind.entry(kind_str.to_string()).or_default() += 1;
            }
        }

        GraphStats {
            node_count: self.nodes.len(),
            edge_count,
            nodes_by_type,
            edges_by_type,
            edges_by_kind,
            orphan_count: self.orphan_nodes().len(),
        }
    }

    pub fn edges_for_all(&self) -> Vec<&Edge> {
        self.outgoing.values().flat_map(|edges| edges.iter()).collect()
    }

    pub fn edges_for(&self, path: &RelativePath, direction: &Direction) -> Vec<&Edge> {
        trace!(path = %path, direction = ?direction, "computing edges");
        let mut result = Vec::new();
        match direction {
            Direction::Outgoing => {
                if let Some(edges) = self.outgoing.get(path) {
                    result.extend(edges.iter());
                }
            }
            Direction::Incoming => {
                if let Some(edges) = self.incoming.get(path) {
                    result.extend(edges.iter());
                }
            }
            Direction::Both => {
                if let Some(edges) = self.outgoing.get(path) {
                    result.extend(edges.iter());
                }
                if let Some(edges) = self.incoming.get(path) {
                    result.extend(edges.iter());
                }
            }
        }
        result
    }
}

impl Default for Graph {
    fn default() -> Self {
        Self::new()
    }
}

/// Build folder nodes and containment edges from the directory structure of notes.
///
/// For every directory that contains at least one note (directly or transitively),
/// a virtual folder `NodeData` is created with `note_type: "folder"`. Implicit
/// `contains` edges connect each folder to its direct children (notes and subfolders).
/// The workspace root directory is excluded — it is not a folder node.
///
/// Returns `(folder_nodes, contains_edges)`.
pub fn compute_folder_hierarchy(
    notes: &HashMap<RelativePath, NodeData>,
) -> (Vec<NodeData>, Vec<Edge>) {
    // Collect all unique directory paths from note paths (excluding root).
    let mut dir_paths: BTreeSet<String> = BTreeSet::new();
    for note_path in notes.keys() {
        let mut current = note_path.parent();
        while let Some(dir) = current {
            if !dir_paths.insert(dir.as_str().to_string()) {
                break; // already tracked this dir and its ancestors
            }
            current = dir.parent();
        }
    }

    // Create folder NodeData for each directory.
    let mut folder_nodes = Vec::with_capacity(dir_paths.len());
    for dir in &dir_paths {
        let basename = Path::new(dir)
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_else(|| dir.clone());
        folder_nodes.push(NodeData {
            title: humanize_folder_name(&basename),
            note_type: "folder".to_string(),
            tags: vec![],
            path: RelativePath::new(dir),
        });
    }

    let mut edges = Vec::new();

    // Folder → child note edges (direct parent only).
    for note_path in notes.keys() {
        if let Some(parent) = note_path.parent() {
            edges.push(Edge {
                source: parent,
                target: note_path.clone(),
                rel: "contains".to_string(),
                kind: EdgeKind::Implicit,
            });
        }
    }

    // Folder → child folder edges (direct parent only).
    for dir in &dir_paths {
        let dir_rp = RelativePath::new(dir);
        if let Some(parent) = dir_rp.parent() {
            // Parent must also be a known dir (it will be, since we walked all ancestors).
            if dir_paths.contains(parent.as_str()) {
                edges.push(Edge {
                    source: parent,
                    target: dir_rp,
                    rel: "contains".to_string(),
                    kind: EdgeKind::Implicit,
                });
            }
        }
    }

    (folder_nodes, edges)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_node(path: &str, note_type: &str) -> (RelativePath, NodeData) {
        let p = RelativePath::new(path);
        let data = NodeData {
            title: path.to_string(),
            note_type: note_type.to_string(),
            tags: vec![],
            path: p.clone(),
        };
        (p, data)
    }

    fn make_edge(source: &str, target: &str, rel: &str) -> Edge {
        Edge {
            source: RelativePath::new(source),
            target: RelativePath::new(target),
            rel: rel.to_string(),
            kind: EdgeKind::Explicit,
        }
    }

    #[test]
    fn test_add_and_get_node() {
        let mut g = Graph::new();
        let (p, d) = make_node("test.md", "concept");
        g.add_node(p.clone(), d);
        assert!(g.get_node(&p).is_some());
        assert_eq!(g.node_count(), 1);
    }

    #[test]
    fn test_neighbors_depth_1() {
        let mut g = Graph::new();
        let (a, da) = make_node("a.md", "concept");
        let (b, db) = make_node("b.md", "concept");
        let (c, dc) = make_node("c.md", "concept");
        g.add_node(a.clone(), da);
        g.add_node(b.clone(), db);
        g.add_node(c.clone(), dc);
        g.add_edge(make_edge("a.md", "b.md", "related-to"));
        g.add_edge(make_edge("b.md", "c.md", "related-to"));

        let sub = g.neighbors(&a, 1, &Direction::Outgoing, None);
        assert_eq!(sub.nodes.len(), 2); // a + b
        assert_eq!(sub.edges.len(), 1);
    }

    #[test]
    fn test_shortest_path() {
        let mut g = Graph::new();
        let (a, da) = make_node("a.md", "concept");
        let (b, db) = make_node("b.md", "concept");
        let (c, dc) = make_node("c.md", "concept");
        g.add_node(a.clone(), da);
        g.add_node(b.clone(), db);
        g.add_node(c.clone(), dc);
        g.add_edge(make_edge("a.md", "b.md", "related-to"));
        g.add_edge(make_edge("b.md", "c.md", "causes"));

        let path = g.shortest_path(&a, &c, None).unwrap();
        assert_eq!(path.len(), 2);
    }

    #[test]
    fn test_orphan_nodes() {
        let mut g = Graph::new();
        let (a, da) = make_node("a.md", "concept");
        let (b, db) = make_node("b.md", "concept");
        let (c, dc) = make_node("c.md", "concept");
        g.add_node(a.clone(), da);
        g.add_node(b.clone(), db);
        g.add_node(c.clone(), dc);
        g.add_edge(make_edge("a.md", "b.md", "related-to"));

        let orphans = g.orphan_nodes();
        assert_eq!(orphans.len(), 1);
        assert_eq!(orphans[0].as_str(), "c.md");
    }

    #[test]
    fn test_cycle_handling() {
        let mut g = Graph::new();
        let (a, da) = make_node("a.md", "concept");
        let (b, db) = make_node("b.md", "concept");
        g.add_node(a.clone(), da);
        g.add_node(b.clone(), db);
        g.add_edge(make_edge("a.md", "b.md", "related-to"));
        g.add_edge(make_edge("b.md", "a.md", "related-to"));

        let sub = g.neighbors(&a, 5, &Direction::Both, None);
        assert_eq!(sub.nodes.len(), 2);
    }

    #[test]
    fn test_folder_hierarchy_single_level() {
        let mut notes = HashMap::new();
        let (p1, d1) = make_node("Concepts/SCM.md", "concept");
        let (p2, d2) = make_node("Concepts/RCT.md", "concept");
        notes.insert(p1, d1);
        notes.insert(p2, d2);

        let (folders, edges) = compute_folder_hierarchy(&notes);
        assert_eq!(folders.len(), 1);
        assert_eq!(folders[0].path.as_str(), "Concepts");
        assert_eq!(folders[0].note_type, "folder");
        assert_eq!(folders[0].title, "Concepts");
        // 2 edges: Concepts→SCM.md, Concepts→RCT.md
        assert_eq!(edges.len(), 2);
        for e in &edges {
            assert_eq!(e.source.as_str(), "Concepts");
            assert_eq!(e.rel, "contains");
            assert_eq!(e.kind, EdgeKind::Implicit);
        }
    }

    #[test]
    fn test_folder_hierarchy_nested() {
        let mut notes = HashMap::new();
        let (book_path, book_data) =
            make_node("The Book of Why/The Book of Why.md", "index");
        let (ch1_path, ch1_data) =
            make_node("The Book of Why/Chapter 1/Chapter 1.md", "book-note");
        notes.insert(book_path, book_data);
        notes.insert(ch1_path, ch1_data);

        let (folders, edges) = compute_folder_hierarchy(&notes);
        // 2 folder nodes: "The Book of Why" and "The Book of Why/Chapter 1"
        assert_eq!(folders.len(), 2);
        let folder_paths: HashSet<&str> = folders.iter().map(|f| f.path.as_str()).collect();
        assert!(folder_paths.contains("The Book of Why"));
        assert!(folder_paths.contains("The Book of Why/Chapter 1"));

        // 3 edges: parent_folder→child_folder, parent_folder→index_note, child_folder→ch1_note
        assert_eq!(edges.len(), 3);
        let edge_set: HashSet<(&str, &str)> =
            edges.iter().map(|e| (e.source.as_str(), e.target.as_str())).collect();
        assert!(edge_set.contains(&("The Book of Why", "The Book of Why/The Book of Why.md")));
        assert!(edge_set.contains(&("The Book of Why", "The Book of Why/Chapter 1")));
        assert!(edge_set.contains(&("The Book of Why/Chapter 1", "The Book of Why/Chapter 1/Chapter 1.md")));
    }

    #[test]
    fn test_folder_hierarchy_flat_no_folders() {
        let mut notes = HashMap::new();
        let (p1, d1) = make_node("note1.md", "concept");
        let (p2, d2) = make_node("note2.md", "concept");
        notes.insert(p1, d1);
        notes.insert(p2, d2);

        let (folders, edges) = compute_folder_hierarchy(&notes);
        assert_eq!(folders.len(), 0);
        assert_eq!(edges.len(), 0);
    }

    #[test]
    fn test_folder_hierarchy_root_excluded() {
        // Notes in subdirectories should NOT get a root folder node
        let mut notes = HashMap::new();
        let (p1, d1) = make_node("A/note.md", "concept");
        let (p2, d2) = make_node("B/note.md", "concept");
        notes.insert(p1, d1);
        notes.insert(p2, d2);

        let (folders, _edges) = compute_folder_hierarchy(&notes);
        // Only folders A and B, no root
        assert_eq!(folders.len(), 2);
        let folder_paths: HashSet<&str> = folders.iter().map(|f| f.path.as_str()).collect();
        assert!(folder_paths.contains("A"));
        assert!(folder_paths.contains("B"));
        assert!(!folder_paths.iter().any(|p| p.is_empty()));
    }

    #[test]
    fn test_folder_node_is_folder() {
        let mut notes = HashMap::new();
        let (p1, d1) = make_node("Dir/note.md", "concept");
        notes.insert(p1, d1);

        let (folders, _) = compute_folder_hierarchy(&notes);
        assert!(folders[0].is_folder());
    }
}
