use std::path::Path;

use brainmap_core::model::Direction;
use brainmap_core::workspace::Workspace;
use brainmap_core::Result;
use clap::Subcommand;
use serde::Serialize;

use crate::output;
use crate::{DirectionArg, OutputFormat};

#[derive(Subcommand)]
pub enum LinkCommands {
    #[command(about = "Create a typed link between two notes")]
    Create {
        source: String,
        target: String,
        #[arg(long, alias = "rel")]
        relationship: String,
        #[arg(long)]
        annotation: Option<String>,
    },
    #[command(about = "Delete a typed link between two notes")]
    Delete {
        source: String,
        target: String,
        #[arg(long, alias = "rel")]
        relationship: String,
    },
    #[command(about = "List links for a note")]
    List {
        path: String,
        #[arg(long, default_value = "both")]
        direction: DirectionArg,
        #[arg(long, alias = "rel")]
        relationship: Option<String>,
    },
}

#[derive(Serialize)]
struct LinkCreated {
    source: String,
    target: String,
    relationship: String,
}

#[derive(Serialize)]
struct LinkDeleted {
    source: String,
    target: String,
    relationship: String,
}

#[derive(Serialize)]
struct LinkListResult {
    path: String,
    links: Vec<LinkInfo>,
    total: usize,
}

#[derive(Serialize)]
struct LinkInfo {
    source: String,
    target: String,
    rel: String,
    kind: String,
}

pub fn execute(cmd: LinkCommands, workspace_path: &Path, format: &OutputFormat) -> Result<()> {
    match cmd {
        LinkCommands::Create {
            source,
            target,
            relationship,
            annotation,
        } => {
            let mut ws = Workspace::open(workspace_path)?;
            ws.create_link(&source, &target, &relationship, annotation)?;

            match format {
                OutputFormat::Json => {
                    output::print_json(&LinkCreated {
                        source,
                        target,
                        relationship,
                    });
                }
                OutputFormat::Yaml => {
                    output::print_yaml(&LinkCreated {
                        source,
                        target,
                        relationship,
                    });
                }
                OutputFormat::Text => {
                    output::print_text(&format!("Created link: {} -> {} ({})", source, target, relationship));
                }
            }
        }
        LinkCommands::Delete {
            source,
            target,
            relationship,
        } => {
            let mut ws = Workspace::open(workspace_path)?;
            ws.delete_link(&source, &target, &relationship)?;

            match format {
                OutputFormat::Json => {
                    output::print_json(&LinkDeleted {
                        source,
                        target,
                        relationship,
                    });
                }
                OutputFormat::Yaml => {
                    output::print_yaml(&LinkDeleted {
                        source,
                        target,
                        relationship,
                    });
                }
                OutputFormat::Text => {
                    output::print_text(&format!(
                        "Deleted link: {} -> {} ({})",
                        source, target, relationship
                    ));
                }
            }
        }
        LinkCommands::List {
            path,
            direction,
            relationship,
        } => {
            let ws = Workspace::open(workspace_path)?;
            let dir: Direction = (&direction).into();
            let links = ws.list_links(&path, &dir, relationship.as_deref())?;

            let link_infos: Vec<LinkInfo> = links
                .iter()
                .map(|e| LinkInfo {
                    source: e.source.as_str().to_string(),
                    target: e.target.as_str().to_string(),
                    rel: e.rel.clone(),
                    kind: format!("{:?}", e.kind),
                })
                .collect();

            let total = link_infos.len();
            match format {
                OutputFormat::Json => {
                    output::print_json(&LinkListResult {
                        path,
                        links: link_infos,
                        total,
                    });
                }
                OutputFormat::Yaml => {
                    output::print_yaml(&LinkListResult {
                        path,
                        links: link_infos,
                        total,
                    });
                }
                OutputFormat::Text => {
                    println!("{} link(s):", total);
                    for l in &link_infos {
                        println!("  {} -> {} ({})", l.source, l.target, l.rel);
                    }
                }
            }
        }
    }

    Ok(())
}
