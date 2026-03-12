use std::path::Path;

use brainmap_core::model::Direction;
use brainmap_core::workspace::Workspace;
use brainmap_core::Result;

use crate::output;
use crate::{DirectionArg, OutputFormat};

pub fn execute(
    path: &str,
    depth: usize,
    direction: &DirectionArg,
    relationship: Option<&str>,
    workspace_path: &Path,
    format: &OutputFormat,
) -> Result<()> {
    let ws = Workspace::open(workspace_path)?;
    let rp = brainmap_core::model::RelativePath::new(path);
    let dir: Direction = direction.into();

    let rel_filter: Option<Vec<String>> = relationship.map(|r| vec![r.to_string()]);
    let subgraph = ws.graph.neighbors(
        &rp,
        depth,
        &dir,
        rel_filter.as_ref().map(|v| v.as_slice()),
    );

    match format {
        OutputFormat::Json => output::print_json(&subgraph),
                OutputFormat::Yaml => output::print_yaml(&subgraph),
        OutputFormat::Text => {
            println!(
                "{} node(s), {} edge(s) within {} hop(s) of {}:",
                subgraph.nodes.len(),
                subgraph.edges.len(),
                depth,
                path
            );
            println!("Nodes:");
            for n in &subgraph.nodes {
                println!("  {} [{}] {}", n.path, n.note_type, n.title);
            }
            if !subgraph.edges.is_empty() {
                println!("Edges:");
                for e in &subgraph.edges {
                    println!("  {} -> {} ({})", e.source, e.target, e.rel);
                }
            }
        }
    }

    Ok(())
}
