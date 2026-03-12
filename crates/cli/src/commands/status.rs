use std::path::Path;

use brainmap_core::workspace::{Severity, Workspace};
use brainmap_core::Result;
use serde::Serialize;

use crate::output;
use crate::OutputFormat;

#[derive(Serialize)]
struct StatusOutput {
    workspace: String,
    node_count: usize,
    edge_count: usize,
    orphan_count: usize,
    error_count: usize,
    warning_count: usize,
}

pub fn execute(workspace_path: &Path, format: &OutputFormat) -> Result<()> {
    let ws = Workspace::open(workspace_path)?;
    let stats = ws.stats();
    let issues = ws.validate();

    let error_count = issues.iter().filter(|i| i.severity == Severity::Error).count();
    let warning_count = issues.iter().filter(|i| i.severity == Severity::Warning).count();

    let status = StatusOutput {
        workspace: ws.config.name.clone(),
        node_count: stats.node_count,
        edge_count: stats.edge_count,
        orphan_count: stats.orphan_count,
        error_count,
        warning_count,
    };

    match format {
        OutputFormat::Json => output::print_json(&status),
                OutputFormat::Yaml => output::print_yaml(&status),
        OutputFormat::Text => {
            println!("Workspace: {}", status.workspace);
            println!("Nodes: {}  Edges: {}  Orphans: {}", status.node_count, status.edge_count, status.orphan_count);
            if error_count > 0 || warning_count > 0 {
                println!("Issues: {} error(s), {} warning(s)", error_count, warning_count);
            } else {
                println!("No issues.");
            }
        }
    }

    Ok(())
}
