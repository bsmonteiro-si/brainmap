use std::path::Path;

use brainmap_core::workspace::{Severity, Workspace};
use brainmap_core::Result;
use serde::Serialize;

use crate::output;
use crate::OutputFormat;

#[derive(Serialize)]
struct ValidateOutput {
    issues: Vec<IssueInfo>,
    error_count: usize,
    warning_count: usize,
}

#[derive(Serialize)]
struct IssueInfo {
    severity: String,
    message: String,
    path: Option<String>,
}

pub fn execute(workspace_path: &Path, format: &OutputFormat) -> Result<()> {
    let ws = Workspace::open(workspace_path)?;
    let issues = ws.validate();

    let error_count = issues.iter().filter(|i| i.severity == Severity::Error).count();
    let warning_count = issues.iter().filter(|i| i.severity == Severity::Warning).count();

    let issue_infos: Vec<IssueInfo> = issues
        .iter()
        .map(|i| IssueInfo {
            severity: format!("{:?}", i.severity).to_lowercase(),
            message: i.message.clone(),
            path: i.path.clone(),
        })
        .collect();

    match format {
        OutputFormat::Json => {
            output::print_json(&ValidateOutput {
                issues: issue_infos,
                error_count,
                warning_count,
            });
        }
        OutputFormat::Yaml => {
            output::print_yaml(&ValidateOutput {
                issues: issue_infos,
                error_count,
                warning_count,
            });
        }
        OutputFormat::Text => {
            if issues.is_empty() {
                output::print_text("No issues found.");
            } else {
                println!("{} error(s), {} warning(s):", error_count, warning_count);
                for i in &issue_infos {
                    let prefix = if i.severity == "error" { "ERROR" } else { "WARN" };
                    println!("  [{}] {}", prefix, i.message);
                }
            }
        }
    }

    if error_count > 0 {
        return Err(brainmap_core::BrainMapError::ConfigError(
            format!("{} validation error(s) found", error_count),
        ));
    }
    Ok(())
}
