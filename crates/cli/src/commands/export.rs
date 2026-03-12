use std::path::Path;

use brainmap_core::export;
use brainmap_core::workspace::Workspace;
use brainmap_core::Result;

use crate::output;
use crate::OutputFormat;

pub fn execute(
    export_format: &str,
    subgraph_center: Option<&str>,
    subgraph_depth: usize,
    workspace_path: &Path,
    format: &OutputFormat,
) -> Result<()> {
    let ws = Workspace::open(workspace_path)?;

    let subgraph = match subgraph_center {
        Some(center) => Some(ws.get_subgraph(center, subgraph_depth, None)?),
        None => None,
    };

    let exported = match export_format {
        "json" => export::export_json(&ws, subgraph.as_ref())?,
        "dot" => export::export_dot(&ws, subgraph.as_ref()),
        "graphml" => export::export_graphml(&ws, subgraph.as_ref()),
        other => {
            return Err(brainmap_core::BrainMapError::ConfigError(format!(
                "unknown export format: {}",
                other
            )));
        }
    };

    match format {
        OutputFormat::Json => {
            // For JSON export, parse the content so it nests properly instead of double-escaping
            let content_value: serde_json::Value = if export_format == "json" {
                serde_json::from_str(&exported).unwrap_or(serde_json::Value::String(exported.clone()))
            } else {
                serde_json::Value::String(exported.clone())
            };
            output::print_json(&serde_json::json!({
                "format": export_format,
                "content": content_value,
            }));
        }
        OutputFormat::Yaml => {
            // For JSON export, parse the content so it nests properly instead of double-escaping
            let content_value: serde_json::Value = if export_format == "json" {
                serde_json::from_str(&exported).unwrap_or(serde_json::Value::String(exported.clone()))
            } else {
                serde_json::Value::String(exported.clone())
            };
            output::print_yaml(&serde_json::json!({
                "format": export_format,
                "content": content_value,
            }));
        }
        OutputFormat::Text => {
            print!("{}", exported);
        }
    }

    Ok(())
}
