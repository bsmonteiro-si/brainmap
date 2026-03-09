use std::path::PathBuf;
use std::process;

use clap::{Parser, Subcommand};

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
enum OutputFormat {
    Text,
    Json,
}

#[derive(Subcommand)]
enum Commands {
    #[command(about = "Initialize a new BrainMap workspace")]
    Init {
        #[arg(help = "Directory to initialize (defaults to current directory)")]
        path: Option<PathBuf>,
    },
}

fn main() {
    let cli = Cli::parse();

    let result = match cli.command {
        Commands::Init { path } => {
            let target = path.unwrap_or_else(|| std::env::current_dir().unwrap());
            match brainmap_core::workspace::Workspace::init(&target) {
                Ok(()) => {
                    if !cli.quiet {
                        match cli.format {
                            OutputFormat::Text => {
                                println!("Initialized BrainMap workspace at {}", target.display());
                            }
                            OutputFormat::Json => {
                                println!(
                                    r#"{{"success": true, "path": "{}"}}"#,
                                    target.display()
                                );
                            }
                        }
                    }
                    Ok(())
                }
                Err(e) => Err(e),
            }
        }
    };

    if let Err(e) = result {
        eprintln!("error: {}", e);
        process::exit(1);
    }
}
