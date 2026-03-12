use std::path::Path;

use brainmap_core::config::save_config;
use brainmap_core::workspace::Workspace;
use brainmap_core::Result;
use serde::Serialize;

use crate::output;
use crate::OutputFormat;

#[derive(Serialize)]
struct ConfigValue {
    key: String,
    value: serde_json::Value,
}

pub fn execute(
    key: Option<&str>,
    value: Option<&str>,
    workspace_path: &Path,
    format: &OutputFormat,
) -> Result<()> {
    let ws = Workspace::open(workspace_path)?;
    let brainmap_dir = ws.root.join(".brainmap");

    match (key, value) {
        (None, _) => {
            // List all config
            match format {
                OutputFormat::Json => output::print_json(&ws.config),
                OutputFormat::Yaml => output::print_yaml(&ws.config),
                OutputFormat::Text => {
                    println!("name: {}", ws.config.name);
                    println!("version: {}", ws.config.version);
                    println!("note_types: {}", ws.config.note_types.join(", "));
                    println!("edge_types: {}", ws.config.edge_types.join(", "));
                    if !ws.config.federation.is_empty() {
                        println!("federation:");
                        for f in &ws.config.federation {
                            println!("  {} -> {}", f.name, f.path);
                        }
                    }
                }
            }
        }
        (Some(k), None) => {
            // Get a specific key
            let val = match k {
                "name" => serde_json::Value::String(ws.config.name.clone()),
                "version" => serde_json::json!(ws.config.version),
                "note_types" => serde_json::json!(ws.config.note_types),
                "edge_types" => serde_json::json!(ws.config.edge_types),
                "federation" => serde_json::json!(ws.config.federation),
                other => {
                    return Err(brainmap_core::BrainMapError::ConfigError(format!(
                        "unknown config key: {}",
                        other
                    )));
                }
            };

            match format {
                OutputFormat::Json => {
                    output::print_json(&ConfigValue {
                        key: k.to_string(),
                        value: val,
                    });
                }
                OutputFormat::Yaml => {
                    output::print_yaml(&ConfigValue {
                        key: k.to_string(),
                        value: val,
                    });
                }
                OutputFormat::Text => {
                    println!("{}: {}", k, val);
                }
            }
        }
        (Some(k), Some(v)) => {
            // Set a config value
            let mut config = ws.config.clone();
            match k {
                "name" => config.name = v.to_string(),
                other => {
                    return Err(brainmap_core::BrainMapError::ConfigError(format!(
                        "cannot set config key: {}",
                        other
                    )));
                }
            }
            save_config(&config, &brainmap_dir)?;

            match format {
                OutputFormat::Json => {
                    output::print_json(&serde_json::json!({ "key": k, "value": v, "updated": true }));
                }
                OutputFormat::Yaml => {
                    output::print_yaml(&serde_json::json!({ "key": k, "value": v, "updated": true }));
                }
                OutputFormat::Text => {
                    output::print_text(&format!("Set {} = {}", k, v));
                }
            }
        }
    }

    Ok(())
}
