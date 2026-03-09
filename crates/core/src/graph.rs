use std::collections::{HashMap, HashSet, VecDeque};

use crate::model::{Direction, Edge, EdgeKind, NodeData, RelativePath};

const MAX_DEPTH: usize = 10;

pub struct Graph {
    nodes: HashMap<RelativePath, NodeData>,
    outgoing: HashMap<RelativePath, Vec<Edge>>,
    incoming: HashMap<RelativePath, Vec<Edge>>,
}

#[derive(Debug, Clone)]
pub struct Subgraph {
    pub nodes: Vec<NodeData>,
    pub edges: Vec<Edge>,
}

#[derive(Debug, Clone)]
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
        let max = depth.min(MAX_DEPTH);
        let mut visited_nodes = HashSet::new();
        let mut collected_edges = Vec::new();
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

                collected_edges.push(edge.clone());

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

    fn edges_for(&self, path: &RelativePath, direction: &Direction) -> Vec<&Edge> {
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

pub fn compute_implicit_edges(
    notes: &HashMap<RelativePath, NodeData>,
    explicit_edges: &[Edge],
) -> Vec<Edge> {
    let note_paths: HashSet<&RelativePath> = notes.keys().collect();
    let mut implicit = Vec::new();
    let explicit_contains: HashSet<(&str, &str)> = explicit_edges
        .iter()
        .filter(|e| e.rel == "contains")
        .map(|e| (e.source.as_str(), e.target.as_str()))
        .collect();

    for child_path in notes.keys() {
        let ancestor = find_nearest_ancestor_node(child_path, &note_paths);

        if let Some(parent_path) = ancestor {
            if parent_path == child_path {
                continue;
            }
            if !explicit_contains.contains(&(parent_path.as_str(), child_path.as_str())) {
                implicit.push(Edge {
                    source: parent_path.clone(),
                    target: child_path.clone(),
                    rel: "contains".to_string(),
                    kind: EdgeKind::Implicit,
                });
            }
        }
    }

    implicit
}

fn find_nearest_ancestor_node<'a>(
    path: &RelativePath,
    note_paths: &HashSet<&'a RelativePath>,
) -> Option<&'a RelativePath> {
    let mut current = path.parent();
    while let Some(dir) = current {
        let candidate_file = format!("{}.md", dir.as_str());
        let candidate = RelativePath::new(&candidate_file);
        if candidate != *path {
            if let Some(found) = note_paths.iter().find(|p| ***p == candidate) {
                return Some(*found);
            }
        }

        let dir_name = dir
            .as_str()
            .rsplit('/')
            .next()
            .unwrap_or(dir.as_str());
        let index_file = RelativePath::new(&format!("{}/{}.md", dir.as_str(), dir_name));
        if index_file != *path {
            if let Some(found) = note_paths.iter().find(|p| ***p == index_file) {
                return Some(*found);
            }
        }

        current = dir.parent();
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_node(path: &str, note_type: &str) -> (RelativePath, NodeData) {
        let p = RelativePath::new(path);
        let data = NodeData {
            title: path.to_string(),
            note_type: note_type.to_string(),
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
    fn test_implicit_edges() {
        let mut notes = HashMap::new();
        let (book_path, book_data) =
            make_node("The Book of Why/The Book of Why.md", "index");
        let (ch1_path, ch1_data) =
            make_node("The Book of Why/Chapter 1/Chapter 1.md", "book-note");
        notes.insert(book_path, book_data);
        notes.insert(ch1_path, ch1_data);

        let implicit = compute_implicit_edges(&notes, &[]);
        assert_eq!(implicit.len(), 1);
        assert_eq!(implicit[0].source.as_str(), "The Book of Why/The Book of Why.md");
        assert_eq!(implicit[0].target.as_str(), "The Book of Why/Chapter 1/Chapter 1.md");
        assert_eq!(implicit[0].rel, "contains");
    }
}
