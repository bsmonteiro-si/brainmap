use std::path::Path;

use brainmap_core::workspace::Workspace;
use brainmap_core::Result;
use serde::Serialize;

use crate::output;
use crate::OutputFormat;

#[derive(Serialize)]
struct PathOutput {
    source: String,
    target: String,
    found: bool,
    hops: usize,
    path: Vec<PathHop>,
}

#[derive(Serialize)]
struct PathHop {
    source: String,
    target: String,
    rel: String,
}

pub fn execute(
    source: &str,
    target: &str,
    max_depth: Option<usize>,
    workspace_path: &Path,
    format: &OutputFormat,
) -> Result<()> {
    let ws = Workspace::open(workspace_path)?;
    let result = ws.find_path(source, target, max_depth)?;

    match result {
        Some(edges) => {
            let hops: Vec<PathHop> = edges
                .iter()
                .map(|e| PathHop {
                    source: e.source.as_str().to_string(),
                    target: e.target.as_str().to_string(),
                    rel: e.rel.clone(),
                })
                .collect();
            let hop_count = hops.len();

            match format {
                OutputFormat::Json => {
                    output::print_json(&PathOutput {
                        source: source.to_string(),
                        target: target.to_string(),
                        found: true,
                        hops: hop_count,
                        path: hops,
                    });
                }
                OutputFormat::Yaml => {
                    output::print_yaml(&PathOutput {
                        source: source.to_string(),
                        target: target.to_string(),
                        found: true,
                        hops: hop_count,
                        path: hops,
                    });
                }
                OutputFormat::Text => {
                    println!("Path found ({} hop(s)):", hop_count);
                    for hop in &hops {
                        println!("  {} --[{}]--> {}", hop.source, hop.rel, hop.target);
                    }
                }
            }
        }
        None => {
            match format {
                OutputFormat::Json => {
                    output::print_json(&PathOutput {
                        source: source.to_string(),
                        target: target.to_string(),
                        found: false,
                        hops: 0,
                        path: vec![],
                    });
                }
                OutputFormat::Yaml => {
                    output::print_yaml(&PathOutput {
                        source: source.to_string(),
                        target: target.to_string(),
                        found: false,
                        hops: 0,
                        path: vec![],
                    });
                }
                OutputFormat::Text => {
                    output::print_text("No path found.");
                }
            }
        }
    }

    Ok(())
}
