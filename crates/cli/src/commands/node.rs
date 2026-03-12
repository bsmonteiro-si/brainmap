use std::collections::HashMap;
use std::path::Path;

use brainmap_core::model::{Note, Status};
use brainmap_core::workspace::Workspace;
use brainmap_core::Result;
use clap::Subcommand;
use serde::Serialize;

use crate::output;
use crate::OutputFormat;

#[derive(Subcommand)]
pub enum NodeCommands {
    #[command(about = "Create a new note")]
    Create {
        path: String,
        #[arg(long)]
        title: Option<String>,
        #[arg(long, default_value = "concept")]
        r#type: String,
        #[arg(long, value_delimiter = ',')]
        tags: Option<Vec<String>>,
        #[arg(long)]
        status: Option<String>,
        #[arg(long)]
        source: Option<String>,
        #[arg(long)]
        summary: Option<String>,
        #[arg(long)]
        content: Option<String>,
        #[arg(long = "field", value_parser = parse_key_value)]
        fields: Vec<(String, String)>,
    },
    #[command(about = "Read a note")]
    Read { path: String },
    #[command(about = "Update a note's fields")]
    Update {
        path: String,
        #[arg(long)]
        title: Option<String>,
        #[arg(long)]
        r#type: Option<String>,
        #[arg(long, value_delimiter = ',')]
        tags: Option<Vec<String>>,
        #[arg(long)]
        status: Option<String>,
        #[arg(long)]
        source: Option<String>,
        #[arg(long)]
        summary: Option<String>,
        #[arg(long)]
        content: Option<String>,
        #[arg(long = "field", value_parser = parse_key_value)]
        fields: Vec<(String, String)>,
    },
    #[command(about = "Delete a note")]
    Delete {
        path: String,
        #[arg(long, help = "Delete even if other notes link to this one")]
        force: bool,
        #[arg(long, help = "Show what would be deleted without deleting")]
        dry_run: bool,
    },
    #[command(about = "Move/rename a note")]
    Move {
        old_path: String,
        new_path: String,
        #[arg(long, help = "Show what would change without moving")]
        dry_run: bool,
    },
    #[command(about = "List all notes")]
    List {
        #[arg(long)]
        r#type: Option<String>,
        #[arg(long)]
        tag: Option<String>,
        #[arg(long)]
        status: Option<String>,
        #[arg(long, default_value = "50")]
        limit: usize,
        #[arg(long, default_value = "0")]
        offset: usize,
    },
}

pub(crate) fn parse_key_value(s: &str) -> std::result::Result<(String, String), String> {
    let pos = s
        .find('=')
        .ok_or_else(|| format!("invalid KEY=VALUE: no '=' found in '{s}'"))?;
    Ok((s[..pos].to_string(), s[pos + 1..].to_string()))
}


fn extra_from_fields(fields: Vec<(String, String)>) -> HashMap<String, serde_yaml::Value> {
    fields
        .into_iter()
        .map(|(k, v)| (k, serde_yaml::Value::String(v)))
        .collect()
}

#[derive(Serialize)]
struct NodeCreated {
    path: String,
}

#[derive(Serialize)]
struct NodeList {
    nodes: Vec<NodeSummary>,
    total: usize,
    limit: usize,
    offset: usize,
}

#[derive(Serialize)]
struct NodeSummary {
    path: String,
    title: String,
    r#type: String,
    tags: Vec<String>,
    status: Option<String>,
}

#[derive(Serialize)]
struct MoveResult {
    old_path: String,
    new_path: String,
    rewritten_files: Vec<String>,
}

#[derive(Serialize)]
struct MovePreview {
    old_path: String,
    new_path: String,
    affected_files: Vec<String>,
}

#[derive(Serialize)]
struct NodeDeleted {
    path: String,
}

#[derive(Serialize)]
struct DryRunResult {
    path: String,
    backlinks: Vec<BacklinkInfo>,
}

#[derive(Serialize)]
struct BacklinkInfo {
    source: String,
    rel: String,
}

fn note_to_summary(note: &Note) -> NodeSummary {
    NodeSummary {
        path: note.path.as_str().to_string(),
        title: note.frontmatter.title.clone(),
        r#type: note.frontmatter.note_type.clone(),
        tags: note.frontmatter.tags.clone(),
        status: note
            .frontmatter
            .status
            .as_ref()
            .map(|s| format!("{:?}", s).to_lowercase()),
    }
}

pub fn execute(cmd: NodeCommands, workspace_path: &Path, format: &OutputFormat) -> Result<()> {
    match cmd {
        NodeCommands::Create {
            path,
            title,
            r#type,
            tags,
            status,
            source,
            summary,
            content,
            fields,
        } => {
            let mut ws = Workspace::open(workspace_path)?;
            let title = title.unwrap_or_else(|| {
                Path::new(&path)
                    .file_stem()
                    .map(|s| s.to_string_lossy().to_string())
                    .unwrap_or_else(|| path.clone())
            });
            let created = ws.create_note(
                &path,
                &title,
                &r#type,
                tags.unwrap_or_default(),
                status.and_then(|s| s.parse::<Status>().ok()),
                source,
                summary,
                extra_from_fields(fields),
                content.unwrap_or_default(),
            )?;

            match format {
                OutputFormat::Json => {
                    output::print_json(&NodeCreated {
                        path: created.as_str().to_string(),
                    });
                }
                OutputFormat::Yaml => {
                    output::print_yaml(&NodeCreated {
                        path: created.as_str().to_string(),
                    });
                }
                OutputFormat::Text => {
                    output::print_text(&format!("Created {}", created));
                }
            }
        }
        NodeCommands::Read { path } => {
            let ws = Workspace::open(workspace_path)?;
            let note = ws.read_note(&path)?;

            match format {
                OutputFormat::Json => output::print_json(note),
                OutputFormat::Yaml => output::print_yaml(note),
                OutputFormat::Text => {
                    println!("path: {}", note.path);
                    println!("title: {}", note.frontmatter.title);
                    println!("type: {}", note.frontmatter.note_type);
                    if !note.frontmatter.tags.is_empty() {
                        println!("tags: {}", note.frontmatter.tags.join(", "));
                    }
                    if let Some(ref s) = note.frontmatter.status {
                        println!("status: {:?}", s);
                    }
                    println!("created: {}", note.frontmatter.created);
                    println!("modified: {}", note.frontmatter.modified);
                    if let Some(ref s) = note.frontmatter.source {
                        println!("source: {}", s);
                    }
                    if let Some(ref s) = note.frontmatter.summary {
                        println!("summary: {}", s);
                    }
                    if !note.frontmatter.links.is_empty() {
                        println!("links:");
                        for link in &note.frontmatter.links {
                            println!("  - {} ({})", link.target, link.rel);
                        }
                    }
                    if !note.body.is_empty() {
                        println!("---");
                        print!("{}", note.body);
                    }
                }
            }
        }
        NodeCommands::Update {
            path,
            title,
            r#type,
            tags,
            status,
            source,
            summary,
            content,
            fields,
        } => {
            let mut ws = Workspace::open(workspace_path)?;
            let extra = if fields.is_empty() {
                None
            } else {
                Some(extra_from_fields(fields))
            };

            ws.update_note(
                &path,
                title,
                r#type,
                tags,
                status.map(|s| s.parse::<Status>().ok()),
                source.map(Some),
                summary.map(Some),
                extra,
                content,
            )?;

            match format {
                OutputFormat::Json => {
                    output::print_json(&serde_json::json!({ "path": path, "updated": true }));
                }
                OutputFormat::Yaml => {
                    output::print_yaml(&serde_json::json!({ "path": path, "updated": true }));
                }
                OutputFormat::Text => {
                    output::print_text(&format!("Updated {}", path));
                }
            }
        }
        NodeCommands::Move {
            old_path,
            new_path,
            dry_run,
        } => {
            if dry_run {
                let ws = Workspace::open(workspace_path)?;
                let rp = brainmap_core::model::RelativePath::new(&old_path);
                if !ws.notes.contains_key(&rp) {
                    return Err(brainmap_core::BrainMapError::FileNotFound(old_path));
                }
                // Find notes that reference this one
                let backlinks = ws.index.backlinks(&rp)?;
                let result = MovePreview {
                    old_path: old_path.clone(),
                    new_path: new_path.clone(),
                    affected_files: backlinks.iter().map(|(s, _)| s.clone()).collect(),
                };
                match format {
                    OutputFormat::Json => output::print_json(&result),
                OutputFormat::Yaml => output::print_yaml(&result),
                    OutputFormat::Text => {
                        println!("Would move {} -> {}", old_path, new_path);
                        if result.affected_files.is_empty() {
                            println!("No other files reference this note.");
                        } else {
                            println!("{} file(s) would be updated:", result.affected_files.len());
                            for f in &result.affected_files {
                                println!("  {}", f);
                            }
                        }
                    }
                }
                return Ok(());
            }

            let mut ws = Workspace::open(workspace_path)?;
            let rewritten = ws.move_note(&old_path, &new_path)?;

            match format {
                OutputFormat::Json => {
                    output::print_json(&MoveResult {
                        old_path: old_path.clone(),
                        new_path: new_path.clone(),
                        rewritten_files: rewritten,
                    });
                }
                OutputFormat::Yaml => {
                    output::print_yaml(&MoveResult {
                        old_path: old_path.clone(),
                        new_path: new_path.clone(),
                        rewritten_files: rewritten,
                    });
                }
                OutputFormat::Text => {
                    output::print_text(&format!("Moved {} -> {}", old_path, new_path));
                }
            }
        }
        NodeCommands::Delete {
            path,
            force,
            dry_run,
        } => {
            let mut ws = Workspace::open(workspace_path)?;

            if dry_run {
                let rp = brainmap_core::model::RelativePath::new(&path);
                let backlinks = ws.index.backlinks(&rp)?;
                let result = DryRunResult {
                    path: path.clone(),
                    backlinks: backlinks
                        .iter()
                        .map(|(s, r)| BacklinkInfo {
                            source: s.clone(),
                            rel: r.clone(),
                        })
                        .collect(),
                };
                match format {
                    OutputFormat::Json => output::print_json(&result),
                OutputFormat::Yaml => output::print_yaml(&result),
                    OutputFormat::Text => {
                        if result.backlinks.is_empty() {
                            output::print_text(&format!("{} can be safely deleted", path));
                        } else {
                            println!("{} has {} incoming link(s):", path, result.backlinks.len());
                            for bl in &result.backlinks {
                                println!("  {} ({})", bl.source, bl.rel);
                            }
                        }
                    }
                }
                return Ok(());
            }

            ws.delete_note(&path, force)?;

            match format {
                OutputFormat::Json => {
                    output::print_json(&NodeDeleted { path: path.clone() });
                }
                OutputFormat::Yaml => {
                    output::print_yaml(&NodeDeleted { path: path.clone() });
                }
                OutputFormat::Text => {
                    output::print_text(&format!("Deleted {}", path));
                }
            }
        }
        NodeCommands::List {
            r#type,
            tag,
            status,
            limit,
            offset,
        } => {
            let ws = Workspace::open(workspace_path)?;
            let all = ws.list_nodes(
                r#type.as_deref(),
                tag.as_deref(),
                status.as_deref(),
            );

            let total = all.len();
            let page: Vec<NodeSummary> = all
                .into_iter()
                .skip(offset)
                .take(limit)
                .map(note_to_summary)
                .collect();

            match format {
                OutputFormat::Json => {
                    output::print_json(&NodeList {
                        nodes: page,
                        total,
                        limit,
                        offset,
                    });
                }
                OutputFormat::Yaml => {
                    output::print_yaml(&NodeList {
                        nodes: page,
                        total,
                        limit,
                        offset,
                    });
                }
                OutputFormat::Text => {
                    println!("{} note(s) (showing {}-{} of {})", total, offset + 1, offset + page.len(), total);
                    for n in &page {
                        println!("  {} [{}] {}", n.path, n.r#type, n.title);
                    }
                }
            }
        }
    }

    Ok(())
}
