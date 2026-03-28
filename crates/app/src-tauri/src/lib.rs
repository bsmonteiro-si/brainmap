pub mod commands;
#[cfg(target_os = "macos")]
pub mod dock_menu;
pub mod dto;
pub mod handlers;
pub mod state;
pub mod watcher;

use brainmap_core::logging::{init_logging, LogConfig};
use state::AppState;
use tauri::menu::{Menu, PredefinedMenuItem, Submenu};

pub fn run() {
    let log_dir = std::env::var("HOME")
        .map(|h| std::path::PathBuf::from(h).join(".brainmap/logs"))
        .ok();
    let _log_guard = init_logging(&LogConfig {
        log_dir,
        stderr_enabled: true,
        stderr_json: false,
        default_level: "info,frontend=debug",
    });

    tauri::Builder::default()
        .menu(|app| {
            // Custom menu: omit Undo/Redo from Edit so Cmd+Z reaches the WebView JS handlers
            Menu::with_items(
                app,
                &[
                    #[cfg(target_os = "macos")]
                    &Submenu::with_items(
                        app,
                        "BrainMap",
                        true,
                        &[
                            &PredefinedMenuItem::about(app, None, None)?,
                            &PredefinedMenuItem::separator(app)?,
                            &PredefinedMenuItem::services(app, None)?,
                            &PredefinedMenuItem::separator(app)?,
                            &PredefinedMenuItem::hide(app, None)?,
                            &PredefinedMenuItem::hide_others(app, None)?,
                            &PredefinedMenuItem::show_all(app, None)?,
                            &PredefinedMenuItem::separator(app)?,
                            &PredefinedMenuItem::quit(app, None)?,
                        ],
                    )?,
                    &Submenu::with_items(
                        app,
                        "Edit",
                        true,
                        &[
                            // No Undo/Redo — handled in frontend JS (canvas, CodeMirror, frontmatter)
                            &PredefinedMenuItem::cut(app, None)?,
                            &PredefinedMenuItem::copy(app, None)?,
                            &PredefinedMenuItem::paste(app, None)?,
                            &PredefinedMenuItem::select_all(app, None)?,
                        ],
                    )?,
                    &Submenu::with_items(
                        app,
                        "View",
                        true,
                        &[&PredefinedMenuItem::fullscreen(app, None)?],
                    )?,
                    &Submenu::with_items(
                        app,
                        "Window",
                        true,
                        &[
                            &PredefinedMenuItem::minimize(app, None)?,
                            &PredefinedMenuItem::maximize(app, None)?,
                            &PredefinedMenuItem::separator(app)?,
                            &PredefinedMenuItem::close_window(app, None)?,
                        ],
                    )?,
                ],
            )
        })
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_drag::init())
        .plugin({
            #[cfg(debug_assertions)]
            {
                tauri_plugin_mcp::init_with_config(
                    tauri_plugin_mcp::PluginConfig::new("BrainMap".to_string())
                        .start_socket_server(true)
                        .socket_path(
                            std::env::var("BRAINMAP_MCP_SOCKET")
                                .unwrap_or_else(|_| "/tmp/brainmap-mcp.sock".to_string())
                                .into(),
                        ),
                )
            }
            #[cfg(not(debug_assertions))]
            {
                // No-op in release builds — MCP plugin is dev-only
                tauri::plugin::Builder::new("mcp-noop").build()
            }
        })
        .manage(AppState::new())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            dock_menu::init(&app.handle());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::open_workspace,
            commands::close_workspace,
            commands::switch_workspace,
            commands::refresh_workspace,
            commands::get_graph_topology,
            commands::get_node_content,
            commands::create_node,
            commands::update_node,
            commands::delete_node,
            commands::move_note,
            commands::move_folder,
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
            commands::list_workspace_files,
            commands::create_plain_file,
            commands::read_plain_file,
            commands::delete_plain_file,
            commands::move_plain_file,
            commands::resolve_image_path,
            commands::resolve_video_path,
            commands::resolve_pdf_path,
            commands::load_pdf_highlights,
            commands::save_pdf_highlights,
            commands::write_plain_file,
            commands::write_raw_note,
            commands::convert_to_note,
            commands::import_files,
            commands::reveal_in_file_manager,
            commands::open_in_default_app,
            commands::duplicate_note,
            commands::write_log,
            commands::update_dock_menu,
        ])
        .run(tauri::generate_context!())
        .expect("error while running BrainMap");
}
