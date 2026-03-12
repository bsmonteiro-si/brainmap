use serde::Serialize;

use crate::error::{BrainMapError, Result};
use crate::graph::Subgraph;
use crate::model::{Edge, EdgeKind, NodeData};
use crate::workspace::Workspace;

#[derive(Serialize)]
struct GraphJson {
    nodes: Vec<NodeJsonEntry>,
    edges: Vec<EdgeJsonEntry>,
}

#[derive(Serialize)]
struct NodeJsonEntry {
    path: String,
    title: String,
    note_type: String,
}

#[derive(Serialize)]
struct EdgeJsonEntry {
    source: String,
    target: String,
    rel: String,
    kind: String,
}

fn edge_kind_str(kind: &EdgeKind) -> &'static str {
    match kind {
        EdgeKind::Explicit => "explicit",
        EdgeKind::Implicit => "implicit",
        EdgeKind::Inline => "inline",
    }
}

fn nodes_to_json(nodes: &[NodeData]) -> Vec<NodeJsonEntry> {
    nodes
        .iter()
        .map(|n| NodeJsonEntry {
            path: n.path.as_str().to_string(),
            title: n.title.clone(),
            note_type: n.note_type.clone(),
        })
        .collect()
}

fn edges_to_json(edges: &[Edge]) -> Vec<EdgeJsonEntry> {
    edges
        .iter()
        .map(|e| EdgeJsonEntry {
            source: e.source.as_str().to_string(),
            target: e.target.as_str().to_string(),
            rel: e.rel.clone(),
            kind: edge_kind_str(&e.kind).to_string(),
        })
        .collect()
}

pub fn export_json(workspace: &Workspace, subgraph: Option<&Subgraph>) -> Result<String> {
    match subgraph {
        Some(sg) => {
            let graph = GraphJson {
                nodes: nodes_to_json(&sg.nodes),
                edges: edges_to_json(&sg.edges),
            };
            serde_json::to_string_pretty(&graph)
                .map_err(|e| BrainMapError::ConfigError(e.to_string()))
        }
        None => {
            let nodes: Vec<NodeData> = workspace
                .graph
                .all_nodes()
                .map(|(_, d)| d.clone())
                .collect();
            let edges: Vec<Edge> = workspace
                .graph
                .edges_for_all()
                .into_iter()
                .cloned()
                .collect();
            let graph = GraphJson {
                nodes: nodes_to_json(&nodes),
                edges: edges_to_json(&edges),
            };
            serde_json::to_string_pretty(&graph)
                .map_err(|e| BrainMapError::ConfigError(e.to_string()))
        }
    }
}

fn dot_escape(s: &str) -> String {
    s.replace('\\', "\\\\").replace('"', "\\\"")
}

pub fn export_dot(workspace: &Workspace, subgraph: Option<&Subgraph>) -> String {
    let mut out = String::from("digraph brainmap {\n  rankdir=LR;\n  node [shape=box];\n\n");

    let (nodes, edges): (Vec<&NodeData>, Vec<&Edge>) = match subgraph {
        Some(sg) => (sg.nodes.iter().collect(), sg.edges.iter().collect()),
        None => {
            let nodes: Vec<&NodeData> = workspace.graph.all_nodes().map(|(_, d)| d).collect();
            let edges: Vec<&Edge> = workspace.graph.edges_for_all();
            (nodes, edges)
        }
    };

    for node in &nodes {
        out.push_str(&format!(
            "  \"{}\" [label=\"{}\"];\n",
            dot_escape(node.path.as_str()),
            dot_escape(&node.title)
        ));
    }

    out.push('\n');

    for edge in &edges {
        out.push_str(&format!(
            "  \"{}\" -> \"{}\" [label=\"{}\"];\n",
            dot_escape(edge.source.as_str()),
            dot_escape(edge.target.as_str()),
            dot_escape(&edge.rel)
        ));
    }

    out.push_str("}\n");
    out
}

pub fn export_graphml(workspace: &Workspace, subgraph: Option<&Subgraph>) -> String {
    let mut out = String::new();
    out.push_str("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
    out.push_str("<graphml xmlns=\"http://graphml.graphdrawing.org/xmlns\">\n");
    out.push_str("  <key id=\"title\" for=\"node\" attr.name=\"title\" attr.type=\"string\"/>\n");
    out.push_str(
        "  <key id=\"note_type\" for=\"node\" attr.name=\"note_type\" attr.type=\"string\"/>\n",
    );
    out.push_str("  <key id=\"rel\" for=\"edge\" attr.name=\"rel\" attr.type=\"string\"/>\n");
    out.push_str("  <graph id=\"G\" edgedefault=\"directed\">\n");

    let (nodes, edges): (Vec<&NodeData>, Vec<&Edge>) = match subgraph {
        Some(sg) => (sg.nodes.iter().collect(), sg.edges.iter().collect()),
        None => {
            let nodes: Vec<&NodeData> = workspace.graph.all_nodes().map(|(_, d)| d).collect();
            let edges: Vec<&Edge> = workspace.graph.edges_for_all();
            (nodes, edges)
        }
    };

    for node in &nodes {
        let escaped_title = xml_escape(&node.title);
        out.push_str(&format!("    <node id=\"{}\">\n", xml_escape(node.path.as_str())));
        out.push_str(&format!(
            "      <data key=\"title\">{}</data>\n",
            escaped_title
        ));
        out.push_str(&format!(
            "      <data key=\"note_type\">{}</data>\n",
            xml_escape(&node.note_type)
        ));
        out.push_str("    </node>\n");
    }

    for (i, edge) in edges.iter().enumerate() {
        out.push_str(&format!(
            "    <edge id=\"e{}\" source=\"{}\" target=\"{}\">\n",
            i,
            xml_escape(edge.source.as_str()),
            xml_escape(edge.target.as_str())
        ));
        out.push_str(&format!(
            "      <data key=\"rel\">{}</data>\n",
            xml_escape(&edge.rel)
        ));
        out.push_str("    </edge>\n");
    }

    out.push_str("  </graph>\n");
    out.push_str("</graphml>\n");
    out
}

fn xml_escape(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&apos;")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_xml_escape() {
        assert_eq!(xml_escape("a & b"), "a &amp; b");
        assert_eq!(xml_escape("<tag>"), "&lt;tag&gt;");
    }

    #[test]
    fn test_dot_escape() {
        assert_eq!(dot_escape("a\"b"), "a\\\"b");
        assert_eq!(dot_escape("a\\b"), "a\\\\b");
    }
}
