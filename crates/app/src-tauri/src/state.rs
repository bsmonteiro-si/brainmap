use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex, RwLock};

use brainmap_core::workspace::Workspace;

/// Per-workspace state: the workspace itself and its expected-writes set.
pub struct WorkspaceSlot {
    pub workspace: Workspace,
    /// Paths that the app itself has written — the file watcher checks this
    /// set and skips events for matching paths to avoid re-processing
    /// self-triggered changes.
    pub expected_writes: HashSet<PathBuf>,
}

/// Application state shared across Tauri commands and the file watcher.
///
/// Supports multiple simultaneously-open workspaces (segments). Each workspace
/// gets its own `WorkspaceSlot` behind an independent `Mutex`, so operations on
/// different segments never contend. The outer `RwLock` is held briefly for
/// HashMap lookups (read) or insert/remove (write).
pub struct AppState {
    /// Keyed by canonicalized root path.
    slots: Arc<RwLock<HashMap<String, Arc<Mutex<WorkspaceSlot>>>>>,
    /// The currently active workspace root (canonicalized).
    active_root: Arc<Mutex<Option<String>>>,
    /// Per-workspace file watchers. Dropping a debouncer stops its watcher.
    watchers:
        Arc<Mutex<HashMap<String, notify_debouncer_mini::Debouncer<notify::RecommendedWatcher>>>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            slots: Arc::new(RwLock::new(HashMap::new())),
            active_root: Arc::new(Mutex::new(None)),
            watchers: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    // ── Slot access ─────────────────────────────────────────────────────

    /// Get a cloned Arc to a specific slot. The outer RwLock read guard is
    /// released immediately, so callers can lock the inner Mutex independently.
    pub fn get_slot(&self, root: &str) -> Result<Arc<Mutex<WorkspaceSlot>>, String> {
        let map = self.slots.read().unwrap_or_else(|p| p.into_inner());
        map.get(root)
            .cloned()
            .ok_or_else(|| format!("No workspace open at {root}"))
    }

    /// Read access to a specific slot's workspace.
    pub fn with_slot<F, T>(&self, root: &str, f: F) -> Result<T, String>
    where
        F: FnOnce(&WorkspaceSlot) -> Result<T, String>,
    {
        let slot_arc = self.get_slot(root)?;
        let guard = slot_arc.lock().unwrap_or_else(|p| p.into_inner());
        f(&guard)
    }

    /// Mutable access to a specific slot's workspace.
    pub fn with_slot_mut<F, T>(&self, root: &str, f: F) -> Result<T, String>
    where
        F: FnOnce(&mut WorkspaceSlot) -> Result<T, String>,
    {
        let slot_arc = self.get_slot(root)?;
        let mut guard = slot_arc.lock().unwrap_or_else(|p| p.into_inner());
        f(&mut guard)
    }

    // ── Active root ─────────────────────────────────────────────────────

    /// Resolve which workspace root to operate on. If `explicit` is provided,
    /// use it; otherwise fall back to the active root.
    pub fn resolve_root(&self, explicit: Option<&str>) -> Result<String, String> {
        if let Some(r) = explicit {
            return Ok(r.to_string());
        }
        let guard = self.active_root.lock().unwrap_or_else(|p| p.into_inner());
        guard.clone().ok_or_else(|| "No workspace open".to_string())
    }

    pub fn set_active_root(&self, root: Option<String>) {
        let mut guard = self.active_root.lock().unwrap_or_else(|p| p.into_inner());
        *guard = root;
    }

    pub fn get_active_root(&self) -> Option<String> {
        let guard = self.active_root.lock().unwrap_or_else(|p| p.into_inner());
        guard.clone()
    }

    // ── Slot lifecycle ──────────────────────────────────────────────────

    /// Insert a new workspace slot. Returns false if a slot for this root
    /// already exists.
    pub fn insert_slot(&self, root: String, slot: WorkspaceSlot) -> bool {
        let mut map = self.slots.write().unwrap_or_else(|p| p.into_inner());
        if map.contains_key(&root) {
            return false;
        }
        map.insert(root, Arc::new(Mutex::new(slot)));
        true
    }

    /// Remove a workspace slot. Returns true if the slot existed.
    pub fn remove_slot(&self, root: &str) -> bool {
        let mut map = self.slots.write().unwrap_or_else(|p| p.into_inner());
        map.remove(root).is_some()
    }

    /// Check if a slot exists for the given root.
    pub fn has_slot(&self, root: &str) -> bool {
        let map = self.slots.read().unwrap_or_else(|p| p.into_inner());
        map.contains_key(root)
    }

    /// Check if a new root would overlap with any existing slot (one is a
    /// subdirectory of the other).
    pub fn overlaps_existing(&self, canonical_root: &str) -> Option<String> {
        let map = self.slots.read().unwrap_or_else(|p| p.into_inner());
        let new_path = Path::new(canonical_root);
        for existing in map.keys() {
            let existing_path = Path::new(existing);
            if new_path.starts_with(existing_path) || existing_path.starts_with(new_path) {
                if existing != canonical_root {
                    return Some(existing.clone());
                }
            }
        }
        None
    }

    /// List all open workspace roots.
    pub fn list_roots(&self) -> Vec<String> {
        let map = self.slots.read().unwrap_or_else(|p| p.into_inner());
        map.keys().cloned().collect()
    }

    // ── Expected writes (per-slot) ──────────────────────────────────────

    /// Register a path as an expected self-write for a specific workspace.
    pub fn register_expected_write(&self, root: &str, path: PathBuf) {
        if let Ok(slot_arc) = self.get_slot(root) {
            let mut guard = slot_arc.lock().unwrap_or_else(|p| p.into_inner());
            guard.expected_writes.insert(path);
        }
    }

    /// Check if a path is an expected self-write and remove it from the set.
    /// Returns true if the path was expected (and should be skipped by the watcher).
    pub fn consume_expected_write(&self, root: &str, path: &Path) -> bool {
        if let Ok(slot_arc) = self.get_slot(root) {
            let mut guard = slot_arc.lock().unwrap_or_else(|p| p.into_inner());
            return guard.expected_writes.remove(path);
        }
        false
    }

    // ── Watchers ────────────────────────────────────────────────────────

    /// Store a watcher for a workspace root.
    pub fn set_watcher(
        &self,
        root: String,
        watcher: notify_debouncer_mini::Debouncer<notify::RecommendedWatcher>,
    ) {
        let mut map = self.watchers.lock().unwrap_or_else(|p| p.into_inner());
        map.insert(root, watcher);
    }

    /// Remove and drop a watcher for a workspace root.
    pub fn remove_watcher(&self, root: &str) {
        let mut map = self.watchers.lock().unwrap_or_else(|p| p.into_inner());
        map.remove(root);
    }

    // ── Backward-compat helpers (operate on active root) ────────────────

    /// Convenience: read access to the active workspace.
    pub fn with_active<F, T>(&self, f: F) -> Result<T, String>
    where
        F: FnOnce(&Workspace) -> Result<T, String>,
    {
        let root = self.resolve_root(None)?;
        self.with_slot(&root, |slot| f(&slot.workspace))
    }

    /// Convenience: mutable access to the active workspace.
    pub fn with_active_mut<F, T>(&self, f: F) -> Result<T, String>
    where
        F: FnOnce(&mut Workspace) -> Result<T, String>,
    {
        let root = self.resolve_root(None)?;
        self.with_slot_mut(&root, |slot| f(&mut slot.workspace))
    }
}

/// Canonicalize a workspace path. Falls back to the original path if
/// canonicalization fails (e.g., path doesn't exist yet).
pub fn canonicalize_root(path: &str) -> String {
    std::fs::canonicalize(path)
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_else(|_| {
            // Strip trailing slash for consistency
            path.trim_end_matches('/').to_string()
        })
}
