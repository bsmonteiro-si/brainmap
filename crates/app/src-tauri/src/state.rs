use std::collections::HashSet;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex, MutexGuard};

use brainmap_core::workspace::Workspace;

/// Application state shared across Tauri commands and the file watcher.
///
/// Uses `Option<Workspace>` — managed at app startup, populated when a workspace
/// is opened via the `open_workspace` command.
pub struct AppState {
    pub workspace: Arc<Mutex<Option<Workspace>>>,
    /// Paths that the app itself has written — the file watcher checks this
    /// set and skips events for matching paths to avoid re-processing
    /// self-triggered changes.
    pub expected_writes: Arc<Mutex<HashSet<PathBuf>>>,
    /// Live file watcher handle. Dropping it stops the watcher.
    /// Replaced (old dropped) when a new workspace is opened.
    pub watcher: Arc<Mutex<Option<notify_debouncer_mini::Debouncer<notify::RecommendedWatcher>>>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            workspace: Arc::new(Mutex::new(None)),
            expected_writes: Arc::new(Mutex::new(HashSet::new())),
            watcher: Arc::new(Mutex::new(None)),
        }
    }

    /// Acquire the workspace lock with poisoning recovery.
    /// Returns an error if no workspace is open.
    pub fn lock_workspace(&self) -> Result<MutexGuard<'_, Option<Workspace>>, String> {
        self.workspace
            .lock()
            .or_else(|poisoned| -> Result<MutexGuard<'_, Option<Workspace>>, String> {
                Ok(poisoned.into_inner())
            })
    }

    /// Acquire the workspace, returning an error if none is open.
    /// Callers should use this for commands that require an open workspace.
    pub fn with_workspace<F, T>(&self, f: F) -> Result<T, String>
    where
        F: FnOnce(&Workspace) -> Result<T, String>,
    {
        let guard = self.lock_workspace()?;
        let ws = guard.as_ref().ok_or("No workspace open")?;
        f(ws)
    }

    /// Acquire mutable workspace, returning an error if none is open.
    pub fn with_workspace_mut<F, T>(&self, f: F) -> Result<T, String>
    where
        F: FnOnce(&mut Workspace) -> Result<T, String>,
    {
        let mut guard = self.lock_workspace()?;
        let ws = guard.as_mut().ok_or("No workspace open")?;
        f(ws)
    }

    /// Register a path as an expected self-write so the watcher can skip it.
    pub fn register_expected_write(&self, path: PathBuf) {
        if let Ok(mut set) = self.expected_writes.lock() {
            set.insert(path);
        }
    }

    /// Check if a path is an expected self-write and remove it from the set.
    /// Returns true if the path was expected (and should be skipped by the watcher).
    pub fn consume_expected_write(&self, path: &Path) -> bool {
        if let Ok(mut set) = self.expected_writes.lock() {
            set.remove(path)
        } else {
            false
        }
    }
}
