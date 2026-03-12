use std::path::Path;

use brainmap_core::workspace::Workspace;
use brainmap_core::Result;
use serde::Serialize;

use crate::output;
use crate::OutputFormat;

#[derive(Serialize)]
struct ReindexResult {
    reindexed: bool,
}

pub fn execute(workspace_path: &Path, format: &OutputFormat) -> Result<()> {
    let mut ws = Workspace::open(workspace_path)?;
    ws.reindex()?;

    match format {
        OutputFormat::Json => {
            output::print_json(&ReindexResult { reindexed: true });
        }
        OutputFormat::Yaml => {
            output::print_yaml(&ReindexResult { reindexed: true });
        }
        OutputFormat::Text => {
            output::print_text("Index rebuilt successfully.");
        }
    }

    Ok(())
}
