use std::path::Path;

use brainmap_core::config::save_config;
use brainmap_core::workspace::Workspace;
use brainmap_core::Result;
use clap::Subcommand;
use serde::Serialize;

use crate::output;
use crate::OutputFormat;

#[derive(Subcommand)]
pub enum FederationCommands {
    #[command(about = "Add a federated workspace")]
    Add {
        name: String,
        path: String,
    },
    #[command(about = "List federated workspaces")]
    List,
    #[command(about = "Remove a federated workspace")]
    Remove {
        name: String,
    },
}

#[derive(Serialize)]
struct FederationAdded {
    name: String,
    path: String,
}

#[derive(Serialize)]
struct FederationList {
    workspaces: Vec<FederationEntry>,
    total: usize,
}

#[derive(Serialize)]
struct FederationEntry {
    name: String,
    path: String,
}

#[derive(Serialize)]
struct FederationRemoved {
    name: String,
    removed: bool,
}

pub fn execute(cmd: FederationCommands, workspace_path: &Path, format: &OutputFormat) -> Result<()> {
    let ws = Workspace::open(workspace_path)?;
    let brainmap_dir = ws.root.join(".brainmap");

    match cmd {
        FederationCommands::Add { name, path } => {
            let mut config = ws.config.clone();
            config.add_federation(&name, &path);
            save_config(&config, &brainmap_dir)?;

            match format {
                OutputFormat::Json => {
                    output::print_json(&FederationAdded {
                        name,
                        path,
                    });
                }
                OutputFormat::Yaml => {
                    output::print_yaml(&FederationAdded {
                        name,
                        path,
                    });
                }
                OutputFormat::Text => {
                    output::print_text(&format!("Added federation: {} -> {}", name, path));
                }
            }
        }
        FederationCommands::List => {
            let entries: Vec<FederationEntry> = ws
                .config
                .federation
                .iter()
                .map(|f| FederationEntry {
                    name: f.name.clone(),
                    path: f.path.clone(),
                })
                .collect();
            let total = entries.len();

            match format {
                OutputFormat::Json => {
                    output::print_json(&FederationList {
                        workspaces: entries,
                        total,
                    });
                }
                OutputFormat::Yaml => {
                    output::print_yaml(&FederationList {
                        workspaces: entries,
                        total,
                    });
                }
                OutputFormat::Text => {
                    if entries.is_empty() {
                        output::print_text("No federated workspaces.");
                    } else {
                        println!("{} federated workspace(s):", total);
                        for e in &entries {
                            println!("  {} -> {}", e.name, e.path);
                        }
                    }
                }
            }
        }
        FederationCommands::Remove { name } => {
            let mut config = ws.config.clone();
            let removed = config.remove_federation(&name);
            if removed {
                save_config(&config, &brainmap_dir)?;
            }

            match format {
                OutputFormat::Json => {
                    output::print_json(&FederationRemoved {
                        name: name.clone(),
                        removed,
                    });
                }
                OutputFormat::Yaml => {
                    output::print_yaml(&FederationRemoved {
                        name: name.clone(),
                        removed,
                    });
                }
                OutputFormat::Text => {
                    if removed {
                        output::print_text(&format!("Removed federation: {}", name));
                    } else {
                        output::print_text(&format!("Federation '{}' not found", name));
                    }
                }
            }
        }
    }

    Ok(())
}
