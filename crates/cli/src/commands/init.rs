use std::path::PathBuf;

use brainmap_core::workspace::Workspace;
use brainmap_core::Result;
use serde::Serialize;

use crate::output;
use crate::OutputFormat;

#[derive(Serialize)]
struct InitResult {
    path: String,
}

pub fn execute(path: Option<PathBuf>, format: &OutputFormat, quiet: bool) -> Result<()> {
    let target = path.unwrap_or_else(|| std::env::current_dir().unwrap());
    Workspace::init(&target)?;

    if !quiet {
        let result = InitResult {
            path: target.display().to_string(),
        };
        match format {
            OutputFormat::Json => output::print_json(&result),
                OutputFormat::Yaml => output::print_yaml(&result),
            OutputFormat::Text => {
                output::print_text(&format!(
                    "Initialized BrainMap workspace at {}",
                    target.display()
                ));
            }
        }
    }

    Ok(())
}
