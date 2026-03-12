pub mod commands;
pub mod dto;
pub mod handlers;
pub mod state;
pub mod watcher;

use brainmap_core::logging::{init_logging, LogConfig};
use state::AppState;

pub fn run() {
    let _log_guard = init_logging(&LogConfig {
        log_dir: None,
        stderr_enabled: true,
        stderr_json: false,
        default_level: "info",
    });

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            commands::open_workspace,
            commands::get_graph_topology,
            commands::get_node_content,
            commands::create_node,
            commands::update_node,
            commands::delete_node,
            commands::list_nodes,
            commands::search_notes,
            commands::get_neighbors,
            commands::create_link,
            commands::delete_link,
            commands::list_links,
            commands::get_node_summary,
            commands::get_stats,
            commands::create_folder,
            commands::delete_folder,
        ])
        .run(tauri::generate_context!())
        .expect("error while running BrainMap");
}
