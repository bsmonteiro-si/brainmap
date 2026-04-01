# 2026-03-18 — Subagent Transcript: Explore

**Date:** 2026-03-18 17:26:31
**Agent:** Explore
**Agent ID:** abf74f6a8bebc1af9
**Parent Session:** 7f58a85e-1d83-467e-96ac-2b2f1d110175

---

## User

Explore the BrainMap Tauri desktop app to understand:

1. How segments are stored and managed — look at segmentStore, SegmentPicker, and any related files in `crates/app/src/`
2. The Tauri configuration — look at `crates/app/src-tauri/tauri.conf.json` and `crates/app/src-tauri/Cargo.toml` for enabled features
3. The Tauri main.rs or lib.rs setup — how the app initializes, any existing system tray or menu setup
4. Any existing dock menu or system tray configuration

Focus on:
- The segment data model (Segment type, how segments are persisted in localStorage)
- Tauri v2 APIs available for dock/tray menus
- The current app initialization flow in the Rust side
- How `open_workspace` / `switch_workspace` commands work

Be thorough — check both the TypeScript frontend and Rust backend sides.

---

## Assistant

I'll explore the BrainMap Tauri app to understand segments, configuration, and initialization. Let me start by examining the key files systematically.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri"}`

---

## Assistant

Let me read the key files for segments and Tauri configuration:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/SegmentPicker.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/tauri.conf.json"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/Cargo.toml"}`

---

## Assistant

Now let me look at the Rust side initialization and command structure:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/src/**/*.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/main.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/state.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs"}`

---

## Assistant

Now let me check the AppLayout to see how segments connect to the overall UI flow:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","limit":80}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri -name \"*.rs\" | head -20"}`

---

## Assistant

Let me look at the handlers to understand the workspace open/initialization flow:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","limit":80}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"pub fn handle_open_workspace\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

Let me check for StatusBar and any existing menu/tray setup:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/StatusBar/StatusBar.tsx","limit":100}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"tray\\|menu\\|dock\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/ 2>/dev/null || echo \"No tray/menu setup found\""}`

---

## Assistant

Perfect. Now let me check the workspace store to understand the complete flow:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts","limit":200}`

---

## Assistant

Excellent. Now let me check the watcher to see how file watching is set up:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs","limit":120}`

---

## Assistant

Let me continue reading the watcher and check for any existing system tray/dock features in Tauri config:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs","offset":120,"limit":100}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/*.json 2>/dev/null || echo \"No JSON files in src-tauri root\""}`

---

## Assistant

Perfect! Now I have comprehensive information. Let me create a detailed exploration report:

## Comprehensive Exploration Report: BrainMap Tauri Desktop App

I've thoroughly analyzed the BrainMap desktop app codebase. Here are the key findings:

---

### 1. **Segment Storage and Management**

**Data Model** (`crates/app/src/stores/segmentStore.ts`):
- **Segment interface**: `{ id, name, path, lastOpenedAt, createdAt }`
  - `id`: UUID generated on creation
  - `path`: Absolute folder path, no trailing slash (normalized via `normalizePath()`)
  - `lastOpenedAt`, `createdAt`: ISO-8601 timestamps

**Persistence**:
- Stored in `localStorage` under key `"brainmap:segments"` as JSON array
- Loaded on app startup via `loadStoredSegments()` and persisted on every add/remove via `persistSegments()`

**SegmentStore API** (Zustand):
- `addSegment(name, path)` → idempotent by path; returns `{segment, created}`
- `removeSegment(id)` → removes and clears activeSegmentId if active
- `touchSegment(id)` → updates `lastOpenedAt` to now (called after successful open)
- `getSegmentByPath(path)` → lookup by normalized path
- `addOpenSegment(id)` / `removeOpenSegment(id)` → track which segments are currently open
- `getOpenSegments()` → returns full Segment objects for open segments

**SegmentPicker** (`crates/app/src/components/Layout/SegmentPicker.tsx`):
- Home screen UI when no workspace is open
- Shows recently-opened segments sorted by `lastOpenedAt`
- Allows "Open Folder as Segment" (via `pickFolder()` dialog) and "Create Folder as Segment"
- Calls `openWorkspace(segment.path)` → `touchSegment()` → `addOpenSegment()` → `setActiveSegmentId()`

---

### 2. **Tauri Configuration**

**`crates/app/src-tauri/tauri.conf.json`**:
```json
{
  "productName": "BrainMap",
  "version": "0.1.0",
  "identifier": "com.brainmap.app",
  "build": {
    "frontendDist": "../dist",
    "devUrl": "http://localhost:1420"
  },
  "app": {
    "windows": [
      {
        "title": "BrainMap",
        "width": 1200,
        "height": 800,
        "resizable": true
      }
    ]
  },
  "plugins": {},
  "bundle": { /* icon files */ }
}
```
- **No system tray, dock menu, or menu bar setup currently configured**
- Single window configuration (Tauri v2)
- Asset protocol enabled for local file serving

**`crates/app/src-tauri/Cargo.toml`**:
```toml
[dependencies]
tauri = { version = "2", features = ["protocol-asset", "devtools"] }
tauri-plugin-dialog = "2"
tauri-plugin-shell = "2"
notify = "7"
notify-debouncer-mini = "0.5"
tokio = { version = "1", features = ["sync", "rt"] }
```
- No tray or window menu plugins enabled yet
- File watcher uses `notify` + `notify-debouncer-mini`

---

### 3. **Rust-Side App Initialization** (`crates/app/src-tauri/src/`)

**`lib.rs` → `run()` function**:
```rust
pub fn run() {
    // 1. Initialize logging (tracing) with $HOME/.brainmap/logs
    let _log_guard = init_logging(...);
    
    // 2. Build Tauri app
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .manage(AppState::new())           // Shared state across commands
        .invoke_handler(tauri::generate_handler![...])  // 29 commands
        .run(tauri::generate_context!())
        .expect("error while running BrainMap");
}
```

**AppState** (`state.rs`):
- **Per-workspace slots**: `Arc<RwLock<HashMap<String, Arc<Mutex<WorkspaceSlot>>>>>`
  - Each segment gets its own `WorkspaceSlot` with independent `Mutex`
  - No contention when switching between segments
  - Keyed by **canonicalized root path** (via `canonicalize_root()`)

- **Active root tracking**: `Arc<Mutex<Option<String>>>`
  - Single active workspace at a time (on the Rust side)

- **File watchers**: `Arc<Mutex<HashMap<String, Debouncer<...>>>>`
  - Per-workspace file watcher that emits events to frontend
  - Started in `open_workspace` command; stopped in `close_workspace` command

- **Expected writes tracking**: `HashSet<PathBuf>` per slot
  - Used to suppress file watcher events for writes initiated by the app itself
  - Prevents re-processing of app-triggered changes

**Commands** (`commands.rs`):
- `open_workspace(path)` → loads workspace, inserts slot, starts watcher, sets active root
- `close_workspace(root)` → removes watcher, removes slot, clears active root if needed
- `switch_workspace(root)` → activates different workspace (must already be open)
- ~26 other commands (create/update/delete notes, search, links, etc.)

**Handlers** (`handlers.rs`):
- `handle_open_workspace(path)` → calls `Workspace::open_or_init(path)`
  - Auto-initializes `.brainmap` folder if missing
  - Returns `WorkspaceInfoDto` with name, root, node/edge counts

---

### 4. **Frontend App Initialization Flow** (`crates/app/src/`)

**`main.tsx` → `App.tsx`**:
1. If `info` is null → show `<SegmentPicker />`
2. If `info` exists → show `<AppLayout />`

**`App.tsx` flow**:
1. `useWorkspaceStore` (Zustand) manages active workspace
2. `useSegmentStore` manages known segments and open segment list
3. On app load, `SegmentPicker` prompts user to open a folder
4. User selects folder → `addSegment()` → `openWorkspace(path)` (Tauri command)
5. Backend returns workspace info → frontend loads graph topology via `get_graph_topology` command
6. Event listener via `getAPI().onEvent()` receives `brainmap://workspace-event` from Rust

**StatusBar** (`components/StatusBar/StatusBar.tsx`):
- Shows current segment name and stats
- Dropdown to switch/close open segments
- "Add Segment" button to open another folder
- Used to switch between `openSegmentIds` via `switchSegment(segmentId)`

---

### 5. **Multi-Segment Support Architecture**

**Frontend** (`stores/`):
- `useSegmentStore` → tracks all known segments + activeSegmentId + openSegmentIds
- `useWorkspaceStore` → single active workspace info/stats; handles `switchSegment()` workflow
- `segmentStateCache.ts` → caches entire app state per segment (graph, editor, UI) when switching away
- `switchSegment()` logic:
  1. Force-save dirty editor state
  2. Cache current segment's full state
  3. Call backend `api.switchWorkspace(path)` or `api.openWorkspace(path)`
  4. Restore cached state for target segment OR load fresh
  5. Update segment metadata (lastOpenedAt, openSegmentIds)

**Backend** (`state.rs`):
- `AppState` holds per-root `WorkspaceSlot` + central `active_root`
- Per-slot locking: `RwLock<HashMap>` for slot lookup → get `Arc<Mutex<WorkspaceSlot>>` → each slot is independently locked
- **No cross-slot contention** — operations on different segments never block

**Event Routing** (`App.tsx`):
```typescript
app.onEvent((event) => {
  const eventRoot = event.workspace_root;
  const activeRoot = info?.root;
  
  if (eventRoot && activeRoot && eventRoot !== activeRoot) {
    // Background segment event — apply to cached snapshot
    applyEventToSnapshot(segment.id, event);
  } else {
    // Active segment event — apply normally
    applyEvent(event);
  }
});
```

---

### 6. **File Watcher Integration** (`watcher.rs`)

- **Per-workspace file watcher** started on `open_workspace`, stopped on `close_workspace`
- Watches workspace root recursively with 1-second debounce
- For each `.md` file change:
  - Checks if it's an "expected write" (app-initiated) → skip
  - If file exists and is known → `reload_file()`
  - If file exists and is new → `add_file()`
  - If file deleted → `remove_file()`
- Emits `TopologyChangedPayload` to frontend via `app.emit("brainmap://workspace-event", ...)`
- Non-`.md` file changes emit `FilesChangedPayload` instead (for asset tracking)

---

### 7. **Current State: No System Tray or Dock Menu**

**Findings**:
- No tray/dock menu configuration in `tauri.conf.json`
- No `tauri-plugin-tray` or `tauri-plugin-single-instance` in `Cargo.toml`
- No menu setup in `lib.rs::run()`
- No Cmd+Tab/Cmd+H keyboard handling for dock integration
- App shows single window; backgrounding closes window (standard behavior)

**Tauri v2 APIs Available**:
- `tauri::window::TrayIconBuilder` + `TrayIconEvent` for system tray
- `tauri::menu::Menu` / `tauri::menu::PredefinedMenuItem` for menu bar (macOS) or context menus
- `tauri::app::AppHandle::set_activation_policy()` for dock/system integration (macOS)
- `tauri::GlobalShortcutManager` for global keyboard shortcuts

---

### 8. **Key File Paths (Absolute)**

| Path | Purpose |
|------|---------|
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStore.ts` | Segment data model + Zustand store |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/SegmentPicker.tsx` | Segment picker UI |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/StatusBar/StatusBar.tsx` | Segment switcher in status bar |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/tauri.conf.json` | Tauri v2 configuration |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/Cargo.toml` | Rust dependencies |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs` | App entry point + builder |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/state.rs` | Per-slot multi-workspace state |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs` | 29 Tauri commands including open/close/switch |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs` | Workspace initialization logic |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs` | Per-workspace file watcher + event emission |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts` | Frontend workspace/segment lifecycle |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStateCache.ts` | State snapshot/restore for segment switching |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx` | Root component; event routing by workspace_root |

---

### Summary

BrainMap has a **solid multi-segment architecture**:
- Segments are first-class (stored in localStorage, UI-driven in StatusBar)
- Backend uses per-slot locking for safe concurrent access
- Frontend caches full state per segment to enable fast switching
- File watchers are per-workspace and emit routed events
- App initialization is currently segment-picker-first (SegmentPicker is home screen)

**No system tray/dock integration yet** — all entry points are through the main window.

---

