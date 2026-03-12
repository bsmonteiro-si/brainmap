mod commands;
mod output;

use std::path::PathBuf;
use std::process::ExitCode;

use brainmap_core::model::Direction;
use clap::{Parser, Subcommand};

use commands::federation::FederationCommands;
use commands::link::LinkCommands;
use commands::node::{parse_key_value, NodeCommands};

#[derive(Parser)]
#[command(name = "brainmap", about = "Interactive knowledge graph CLI")]
struct Cli {
    #[arg(long, global = true, help = "Workspace directory")]
    workspace: Option<PathBuf>,

    #[arg(long, global = true, default_value = "text", help = "Output format")]
    format: OutputFormat,

    #[arg(long, global = true, help = "Suppress non-essential output")]
    quiet: bool,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Clone, clap::ValueEnum)]
pub enum OutputFormat {
    Text,
    Json,
    Yaml,
}

#[derive(Clone, clap::ValueEnum)]
pub enum DirectionArg {
    In,
    Out,
    Both,
}

impl From<&DirectionArg> for Direction {
    fn from(d: &DirectionArg) -> Self {
        match d {
            DirectionArg::In => Direction::Incoming,
            DirectionArg::Out => Direction::Outgoing,
            DirectionArg::Both => Direction::Both,
        }
    }
}

#[derive(Subcommand)]
enum Commands {
    #[command(about = "Initialize a new BrainMap workspace")]
    Init {
        #[arg(help = "Directory to initialize (defaults to current directory)")]
        path: Option<PathBuf>,
    },

    #[command(subcommand, about = "Note operations")]
    Node(NodeCommands),

    #[command(subcommand, about = "Link operations")]
    Link(LinkCommands),

    #[command(about = "Full-text search across the workspace", alias = "s")]
    Search {
        query: String,
        #[arg(long)]
        r#type: Option<String>,
        #[arg(long)]
        tag: Option<String>,
        #[arg(long)]
        status: Option<String>,
    },

    #[command(about = "Show graph neighborhood of a note")]
    Neighbors {
        path: String,
        #[arg(long, default_value = "1")]
        depth: usize,
        #[arg(long, alias = "rel")]
        relationship: Option<String>,
        #[arg(long, default_value = "both")]
        direction: DirectionArg,
    },

    #[command(about = "Validate workspace integrity")]
    Validate,

    #[command(about = "Show workspace statistics")]
    Stats,

    #[command(about = "Show workspace status summary")]
    Status,

    #[command(about = "Find shortest path between two notes")]
    Path {
        source: String,
        target: String,
        #[arg(long)]
        max_depth: Option<usize>,
    },

    #[command(about = "Extract a subgraph around a node")]
    Subgraph {
        path: String,
        #[arg(long, default_value = "2")]
        depth: usize,
        #[arg(long, alias = "rel")]
        relationship: Option<String>,
    },

    #[command(about = "Export graph in various formats")]
    Export {
        #[arg(long, default_value = "json", name = "export_format")]
        export_format: String,
        #[arg(long)]
        subgraph: Option<String>,
        #[arg(long, default_value = "2")]
        depth: usize,
    },

    #[command(about = "Rebuild the search index")]
    Reindex,

    #[command(about = "View or modify workspace configuration")]
    Config {
        key: Option<String>,
        value: Option<String>,
    },

    #[command(subcommand, about = "Manage federated workspaces")]
    Federation(FederationCommands),

    #[command(about = "Start MCP server over stdio")]
    Serve,

    #[command(about = "List all notes (alias for 'node list')", hide = true)]
    Ls {
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

    #[command(about = "Create a new note (alias for 'node create')", hide = true)]
    New {
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
}

fn main() -> ExitCode {
    let cli = Cli::parse();
    let workspace_path = cli
        .workspace
        .unwrap_or_else(|| {
            std::env::current_dir().unwrap_or_else(|e| {
                eprintln!("error: cannot determine current directory: {}", e);
                std::process::exit(1);
            })
        });

    let result = match cli.command {
        Commands::Init { path } => commands::init::execute(path, &cli.format, cli.quiet),
        Commands::Node(cmd) => commands::node::execute(cmd, &workspace_path, &cli.format),
        Commands::Link(cmd) => commands::link::execute(cmd, &workspace_path, &cli.format),
        Commands::Search {
            query,
            r#type,
            tag,
            status,
        } => commands::search::execute(
            &query,
            r#type.as_deref(),
            tag.as_deref(),
            status.as_deref(),
            &workspace_path,
            &cli.format,
        ),
        Commands::Neighbors {
            path,
            depth,
            relationship,
            direction,
        } => commands::graph::execute(
            &path,
            depth,
            &direction,
            relationship.as_deref(),
            &workspace_path,
            &cli.format,
        ),
        Commands::Validate => commands::validate::execute(&workspace_path, &cli.format),
        Commands::Stats => commands::stats::execute(&workspace_path, &cli.format),
        Commands::Status => commands::status::execute(&workspace_path, &cli.format),
        Commands::Path {
            source,
            target,
            max_depth,
        } => commands::path::execute(&source, &target, max_depth, &workspace_path, &cli.format),
        Commands::Subgraph {
            path,
            depth,
            relationship,
        } => commands::subgraph::execute(
            &path,
            depth,
            relationship.as_deref(),
            &workspace_path,
            &cli.format,
        ),
        Commands::Export {
            export_format,
            subgraph,
            depth,
        } => commands::export::execute(
            &export_format,
            subgraph.as_deref(),
            depth,
            &workspace_path,
            &cli.format,
        ),
        Commands::Reindex => commands::reindex::execute(&workspace_path, &cli.format),
        Commands::Config { key, value } => {
            commands::config::execute(key.as_deref(), value.as_deref(), &workspace_path, &cli.format)
        }
        Commands::Federation(cmd) => {
            commands::federation::execute(cmd, &workspace_path, &cli.format)
        }
        Commands::Serve => commands::serve::execute(&workspace_path),
        Commands::Ls {
            r#type,
            tag,
            status,
            limit,
            offset,
        } => commands::node::execute(
            NodeCommands::List {
                r#type,
                tag,
                status,
                limit,
                offset,
            },
            &workspace_path,
            &cli.format,
        ),
        Commands::New {
            path,
            title,
            r#type,
            tags,
            status,
            source,
            summary,
            content,
            fields,
        } => commands::node::execute(
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
            },
            &workspace_path,
            &cli.format,
        ),
    };

    match result {
        Ok(()) => ExitCode::SUCCESS,
        Err(e) => {
            match cli.format {
                OutputFormat::Json => output::print_json_error(&e),
                OutputFormat::Yaml => output::print_yaml_error(&e),
                OutputFormat::Text => output::print_text_error(&e),
            }
            ExitCode::FAILURE
        }
    }
}
