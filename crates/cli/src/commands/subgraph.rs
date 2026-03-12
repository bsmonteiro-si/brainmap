use std::path::Path;

use brainmap_core::workspace::Workspace;
use brainmap_core::Result;

use crate::output;
use crate::OutputFormat;

pub fn execute(
    center: &str,
    depth: usize,
    rel_filter: Option<&str>,
    workspace_path: &Path,
    format: &OutputFormat,
) -> Result<()> {
    let ws = Workspace::open(workspace_path)?;
    let subgraph = ws.get_subgraph(center, depth, rel_filter)?;

    match format {
        OutputFormat::Json => output::print_json(&subgraph),
                OutputFormat::Yaml => output::print_yaml(&subgraph),
        OutputFormat::Text => {
            println!(
                "{} node(s), {} edge(s) within {} hop(s) of {}:",
                subgraph.nodes.len(),
                subgraph.edges.len(),
                depth,
                center
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
