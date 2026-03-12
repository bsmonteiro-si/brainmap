use std::path::{Path, PathBuf};

use tracing_appender::non_blocking::WorkerGuard;
use tracing_subscriber::fmt;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::EnvFilter;

/// Configuration for logging initialization.
pub struct LogConfig<'a> {
    /// Directory for log files. If `None`, file logging is disabled.
    pub log_dir: Option<PathBuf>,
    /// Whether to emit logs to stderr.
    pub stderr_enabled: bool,
    /// If `true`, stderr output is JSON; otherwise human-readable.
    pub stderr_json: bool,
    /// Default filter level (used when `BRAINMAP_LOG` env var is not set).
    pub default_level: &'a str,
}

fn make_env_filter(default_level: &str) -> EnvFilter {
    EnvFilter::try_from_env("BRAINMAP_LOG")
        .unwrap_or_else(|_| EnvFilter::new(default_level))
}

/// Initialize the global tracing subscriber.
///
/// Returns an optional `WorkerGuard` — the caller **must** keep this alive
/// for the duration of the process, otherwise buffered file logs may be lost.
pub fn init_logging(config: &LogConfig) -> Option<WorkerGuard> {
    let mut guard: Option<WorkerGuard> = None;

    match (&config.log_dir, config.stderr_enabled, config.stderr_json) {
        // File + JSON stderr (MCP serve mode)
        (Some(dir), true, true) => {
            if let Err(e) = std::fs::create_dir_all(dir) {
                eprintln!("warning: could not create log directory {}: {}", dir.display(), e);
            }
            let file_appender = tracing_appender::rolling::daily(dir, "brainmap.log");
            let (non_blocking, g) = tracing_appender::non_blocking(file_appender);
            guard = Some(g);
            tracing_subscriber::registry()
                .with(make_env_filter(config.default_level))
                .with(
                    fmt::layer()
                        .json()
                        .with_writer(non_blocking)
                        .with_target(true),
                )
                .with(
                    fmt::layer()
                        .json()
                        .with_writer(std::io::stderr)
                        .with_target(true),
                )
                .init();
        }
        // File + human stderr
        (Some(dir), true, false) => {
            if let Err(e) = std::fs::create_dir_all(dir) {
                eprintln!("warning: could not create log directory {}: {}", dir.display(), e);
            }
            let file_appender = tracing_appender::rolling::daily(dir, "brainmap.log");
            let (non_blocking, g) = tracing_appender::non_blocking(file_appender);
            guard = Some(g);
            tracing_subscriber::registry()
                .with(make_env_filter(config.default_level))
                .with(
                    fmt::layer()
                        .json()
                        .with_writer(non_blocking)
                        .with_target(true),
                )
                .with(
                    fmt::layer()
                        .with_writer(std::io::stderr)
                        .with_target(true)
                        .compact(),
                )
                .init();
        }
        // Stderr only, JSON
        (None, true, true) => {
            tracing_subscriber::registry()
                .with(make_env_filter(config.default_level))
                .with(
                    fmt::layer()
                        .json()
                        .with_writer(std::io::stderr)
                        .with_target(true),
                )
                .init();
        }
        // Stderr only, human-readable (CLI default)
        (None, true, false) => {
            tracing_subscriber::registry()
                .with(make_env_filter(config.default_level))
                .with(
                    fmt::layer()
                        .with_writer(std::io::stderr)
                        .with_target(true)
                        .compact(),
                )
                .init();
        }
        // File only (no stderr)
        (Some(dir), false, _) => {
            if let Err(e) = std::fs::create_dir_all(dir) {
                eprintln!("warning: could not create log directory {}: {}", dir.display(), e);
            }
            let file_appender = tracing_appender::rolling::daily(dir, "brainmap.log");
            let (non_blocking, g) = tracing_appender::non_blocking(file_appender);
            guard = Some(g);
            tracing_subscriber::registry()
                .with(make_env_filter(config.default_level))
                .with(
                    fmt::layer()
                        .json()
                        .with_writer(non_blocking)
                        .with_target(true),
                )
                .init();
        }
        // No output — no-op subscriber
        (None, false, _) => {
            tracing_subscriber::registry()
                .with(make_env_filter(config.default_level))
                .init();
        }
    }

    guard
}

/// Delete `.log` files in `log_dir` that are older than `max_age_days`.
pub fn cleanup_old_logs(log_dir: &Path, max_age_days: u64) {
    let cutoff = std::time::SystemTime::now()
        - std::time::Duration::from_secs(max_age_days * 86400);

    let entries = match std::fs::read_dir(log_dir) {
        Ok(e) => e,
        Err(_) => return,
    };

    for entry in entries.flatten() {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) != Some("log") {
            continue;
        }
        if let Ok(meta) = path.metadata() {
            if let Ok(modified) = meta.modified() {
                if modified < cutoff {
                    let _ = std::fs::remove_file(&path);
                }
            }
        }
    }
}
