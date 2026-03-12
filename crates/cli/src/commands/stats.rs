use std::path::Path;

use brainmap_core::workspace::Workspace;
use brainmap_core::Result;

use crate::output;
use crate::OutputFormat;

pub fn execute(workspace_path: &Path, format: &OutputFormat) -> Result<()> {
    let ws = Workspace::open(workspace_path)?;
    let stats = ws.stats();

    match format {
        OutputFormat::Json => output::print_json(&stats),
                OutputFormat::Yaml => output::print_yaml(&stats),
        OutputFormat::Text => {
            println!("Nodes: {}", stats.node_count);
            println!("Edges: {}", stats.edge_count);
            println!("Orphans: {}", stats.orphan_count);
            if !stats.nodes_by_type.is_empty() {
                println!("By type:");
                let mut types: Vec<_> = stats.nodes_by_type.iter().collect();
                types.sort_by(|a, b| b.1.cmp(a.1));
                for (t, c) in types {
                    println!("  {}: {}", t, c);
                }
            }
            if !stats.edges_by_rel.is_empty() {
                println!("By relationship:");
                let mut rels: Vec<_> = stats.edges_by_rel.iter().collect();
                rels.sort_by(|a, b| b.1.cmp(a.1));
                for (r, c) in rels {
                    println!("  {}: {}", r, c);
                }
            }
        }
    }

    Ok(())
}
