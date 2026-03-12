use std::path::Path;

use brainmap_core::index::SearchFilters;
use brainmap_core::workspace::Workspace;
use brainmap_core::Result;
use serde::Serialize;

use crate::output;
use crate::OutputFormat;

#[derive(Serialize)]
struct SearchOutput {
    query: String,
    results: Vec<brainmap_core::index::SearchResult>,
    total: usize,
}

pub fn execute(
    query: &str,
    type_filter: Option<&str>,
    tag_filter: Option<&str>,
    status_filter: Option<&str>,
    workspace_path: &Path,
    format: &OutputFormat,
) -> Result<()> {
    let ws = Workspace::open(workspace_path)?;

    let filters = SearchFilters {
        note_type: type_filter.map(String::from),
        tag: tag_filter.map(String::from),
        status: status_filter.map(String::from),
    };

    let results = ws.index.search(query, &filters)?;
    let total = results.len();

    match format {
        OutputFormat::Json => {
            output::print_json(&SearchOutput {
                query: query.to_string(),
                results,
                total,
            });
        }
        OutputFormat::Yaml => {
            output::print_yaml(&SearchOutput {
                query: query.to_string(),
                results,
                total,
            });
        }
        OutputFormat::Text => {
            println!("{} result(s) for \"{}\":", total, query);
            for r in &results {
                println!("  {} [{}] {}", r.path, r.note_type, r.title);
            }
        }
    }

    Ok(())
}
