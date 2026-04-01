# 2026-03-14 — Subagent Transcript: Explore

**Date:** 2026-03-14 12:02:46
**Agent:** Explore
**Agent ID:** a3d1c1221de2ec8f0
**Parent Session:** b0628a66-649e-4349-8f3f-68ebe391e247

---

## User

Explore the BrainMap desktop app's current segment/workspace architecture thoroughly. I need to understand:

1. How segments are defined and persisted (segmentStore, localStorage keys)
2. How workspace state is managed (AppState in Tauri, Zustand stores)
3. How opening/closing a workspace works (the full flow from UI to Rust backend)
4. What stores exist and which ones are workspace-scoped vs global
5. How the file watcher works
6. The SegmentPicker/home screen flow

Focus on these areas:
- `crates/app/src-tauri/src/` (Rust backend - state management, commands, handlers)
- `crates/app/src/stores/` (all Zustand stores)
- `crates/app/src/components/` (SegmentPicker, StatusBar segment display)
- `crates/app/src/api/` (bridge pattern)

Be very thorough - I need to understand every store and every piece of state that is workspace-scoped.

---

## Assistant

I'll thoroughly explore the BrainMap desktop app's segment/workspace architecture. Let me start by mapping out the key files and understanding the system comprehensively.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -type f \\( -name \"*.rs\" -o -name \"*.ts\" -o -name \"*.tsx\" \\) | head -100"}`

---

## Assistant

Let me focus on the source files, not node_modules:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f \\( -name \"*.rs\" -o -name \"*.ts\" -o -name \"*.tsx\" \\) 2>/dev/null | sort"}`

---

## Assistant

Now let me check the Rust backend structure:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src -type f -name \"*.rs\" 2>/dev/null | sort"}`

---

## Assistant

Perfect. Now let me read the key files systematically to understand the complete architecture. I'll start with the core stores and Rust backend:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/navigationStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

Now let me read the editor store, graph store, and tab store:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","limit":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts","limit":150}`

---

## Assistant

Now let me check the Rust backend state management and commands:

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

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","limit":200}`

---

## Assistant

Now let me check the SegmentPicker and related UI components:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/SegmentPicker.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/StatusBar/StatusBar.tsx"}`

---

## Assistant

Now let me check the watcher and App.tsx to understand the full flow:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

Now let me check the undoStore and understand the remaining stores:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts","limit":150}`

---

## Assistant

Perfect! Now let me check the lib.rs and main.rs in the Tauri backend to understand initialization:

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

Excellent! Now let me compile a comprehensive report of all the findings. Let me also quickly check how the bridge pattern works:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts","limit":80}`

---

## Assistant

Perfect! Now I have all the information I need. Let me create a comprehensive report:

## BrainMap Desktop App: Segment/Workspace Architecture - Complete Deep Dive

Based on my thorough exploration of the codebase, here's the complete architecture:

---

## 1. Segments: Definition & Persistence

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStore.ts`

A **Segment** represents a named, persistent workspace (similar to Obsidian vaults):

```typescript
interface Segment {
  id: string;              // UUID, immutable
  name: string;            // User-defined label
  path: string;            // Absolute folder path (no trailing slash)
  lastOpenedAt: string;    // ISO-8601, updated on every successful open
  createdAt: string;       // ISO-8601, immutable
}
```

**Persistence:**
- **localStorage key:** `brainmap:segments`
- **Storage method:** JSON array, loaded on app startup via `loadStoredSegments()`
- **Path normalization:** Trailing slashes stripped via `normalizePath()` for deduplication
- **Idempotent add:** `addSegment()` returns `{segment, created: false}` if path already exists

**SegmentStore interface:**
- `segments: Segment[]` — full list
- `activeSegmentId: string | null` — currently open segment
- `addSegment(name, path)` — add or fetch existing
- `removeSegment(id)` — removes from list and clears `activeSegmentId` if active
- `touchSegment(id)` — updates `lastOpenedAt` to now (called after successful `openWorkspace`)
- `setActiveSegmentId(id)` — sets which segment is active
- `getSegmentByPath(path)` — lookup by path

---

## 2. Workspace State Management

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts`

The `WorkspaceStore` is the **master orchestrator** for workspace lifecycle:

```typescript
interface WorkspaceState {
  info: WorkspaceInfo | null;        // workspace root, name, counts
  stats: StatsDto | null;            // node & edge counts
  isLoading: boolean;                // during openWorkspace
  error: string | null;              // last error message
  noteTypes: string[];               // hardcoded list of 10 types
  edgeTypes: string[];               // hardcoded list of 15 types
  openWorkspace(path: string): Promise<void>;
  closeWorkspace(): void;
  refreshStats(): Promise<void>;
}
```

**Key Functions:**

### `openWorkspace(path: string)`
1. **Set loading state:** `set({ isLoading: true, error: null })`
2. **Call API:** `api.openWorkspace(path)` → Tauri command `open_workspace`
3. **Load stats:** `api.getStats()` in parallel
4. **Clear UI state:** `useUIStore.getState().clearHiddenEdgeTypes()` — resets edge filters
5. **Set state:** `{ info, stats, isLoading: false }`
6. **On error:** `{ error: String(e), isLoading: false }` — no state rollback
7. **Note:** Caller (SegmentPicker) is responsible for checking `state.info` to verify success

### `closeWorkspace()`
Atomically resets **all workspace-scoped stores**:
- `useEditorStore.clear()` — clear active note
- `useGraphStore.reset()` — clear graph, nodes, edges
- `useUIStore.resetWorkspaceState()` — resets workspace UI state (see below)
- `useSegmentStore.setActiveSegmentId(null)` — clear active segment
- `useUndoStore.clear()` — clear undo/redo stacks
- `useNavigationStore.reset()` — clear navigation history
- `useTabStore.reset()` — close all tabs
- `set({ info: null, stats: null, error: null })` — clear workspace

---

## 3. Full Open/Close Workflow

### Opening a Workspace (SegmentPicker → App)

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/SegmentPicker.tsx`

1. **User clicks segment card** or **"Open Folder"** → `handleOpenSegment(segment)` or `handleOpenFolder()`
2. **Add/touch segment:**
   ```typescript
   const { segment } = addSegment(name, path);  // idempotent
   setOpeningId(segment.id);
   await openWorkspace(segment.path);           // workspaceStore.openWorkspace()
   ```
3. **Check success:**
   ```typescript
   const state = useWorkspaceStore.getState();
   if (!state.info) {
     // error occurred, show error on card
     setCardErrors((prev) => ({ ...prev, [segment.id]: state.error }));
     setOpeningId(null);
     return;
   }
   ```
4. **Commit:**
   ```typescript
   touchSegment(segment.id);           // update lastOpenedAt
   setActiveSegmentId(segment.id);     // mark as active
   ```
5. **App.tsx detects `info !== null`** → stops rendering SegmentPicker, renders AppLayout

### Rust Backend: `open_workspace` Command

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs`

```rust
#[tauri::command]
pub async fn open_workspace(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    path: String,
) -> Result<WorkspaceInfoDto, String>
```

1. **Call handler:** `handlers::handle_open_workspace(&path)` 
   - Calls `Workspace::open_or_init(p)` — opens workspace or auto-initializes `.brainmap`
   - Returns `(Workspace, WorkspaceInfoDto)`
2. **Stop old watcher:** Drop old watcher if one exists
3. **Store workspace:** `*guard = Some(workspace)` in `AppState.workspace`
4. **Start new watcher:** `watcher::start_watcher(app, &root)` → returns `Debouncer` handle
5. **Store watcher:** `*watcher = Some(debouncer)` in `AppState.watcher`
6. **Return info:** `WorkspaceInfoDto { name, root, node_count, edge_count }`

### Closing a Workspace (StatusBar close button)

**File:** Not yet implemented — would be triggered from StatusBar**

Current pseudo-flow:
```typescript
// TODO: StatusBar close button would call:
useWorkspaceStore.getState().closeWorkspace();
// This atomically resets all stores as shown above
// App.tsx detects info === null → re-renders SegmentPicker
```

---

## 4. All Zustand Stores & Workspace Scope

### **Workspace-Scoped Stores** (cleared on `closeWorkspace`)

| Store | Key State | Cleared On Close |
|-------|-----------|------------------|
| **editorStore** | `activeNote`, `editedBody`, `editedFrontmatter`, `isDirty`, `fmUndoStack`, `fmRedoStack`, `viewMode`, `rawContent`, `conflictState` | Yes - `clear()` |
| **graphStore** | `nodes` Map, `edges` array, `workspaceFiles`, `selectedNodePath`, `expandedNodes` | Yes - `reset()` |
| **tabStore** | `tabs[]` array (all open tabs), `activeTabId` | Yes - `reset()` |
| **undoStore** | `undoStack[]`, `redoStack[]` | Yes - `clear()` |
| **navigationStore** | `history[]`, `cursor` | Yes - `reset()` |
| **uiStore (workspace-only)** | `hiddenEdgeTypes`, `graphFocusPath`, `graphFocusKind`, `emptyFolders`, `activeLeftTab`, `leftPanelCollapsed`, `treeExpandedFolders` | Yes - `resetWorkspaceState()` |

### **Global Stores** (persisted across workspace switches)

| Store | Key State | Persisted | localStorage Key |
|-------|-----------|-----------|------------------|
| **segmentStore** | `segments[]`, `activeSegmentId` | Yes | `brainmap:segments` |
| **uiStore (global)** | `theme`, `uiFontFamily`, `uiFontSize`, `editorFontFamily`, `editorFontSize`, `uiZoom`, `panelSizes`, `defaultTabSizes` | Yes | `brainmap:uiPrefs`, `brainmap:panelSizes` |

### **UIStore Detail** (mixed workspace/global)

**Global (persisted):**
```typescript
theme: "light" | "dark" | "system"
uiFontFamily, uiFontSize
editorFontFamily, editorFontSize
uiZoom: number (0.5–2.0)
panelSizes: { files?: {content, editor}, graph?: {...}, search?: {...} }
defaultTabSizes: (custom per-tab defaults)
```

**Workspace-scoped (reset on close):**
```typescript
hiddenEdgeTypes: Set<string>        // edge type filter
treeExpandedFolders: Set<string>    // file tree collapsed state
graphFocusPath: string | null       // focus mode target
graphFocusKind: "note" | "folder"   // what is focused
emptyFolders: Set<string>           // folders without notes (for visibility)
activeLeftTab: "files" | "graph" | "search"  // current left panel
leftPanelCollapsed: boolean         // left panel visible
```

**Modal States (workspace-scoped):**
```typescript
commandPaletteOpen, createNoteDialogOpen, createFolderDialogOpen,
settingsOpen, unsavedChangesDialogOpen
```

---

## 5. File Watcher Architecture

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs`

### Watcher Lifecycle

1. **Start on `open_workspace`:** `start_watcher(app_handle, workspace_root)` spawns:
   - **notify_debouncer_mini** with 2-second debounce
   - **Tokio task** (async) listening on MPSC channel
   - Watches workspace root recursively, filters `.md` files only
2. **Stop on workspace change:** Dropping the old `Debouncer` handle stops the Tokio task
3. **Lifecycle tied to AppState:** `AppState.watcher: Arc<Mutex<Option<Debouncer>>>`

### Event Processing

```rust
pub fn start_watcher(app_handle: AppHandle, workspace_root: &Path) 
    -> notify_debouncer_mini::Debouncer<notify::RecommendedWatcher>
{
    // 1. Create debouncer with 2-sec window
    // 2. Watch workspace_root recursively
    // 3. Spawn Tokio task that processes events
    // 4. Return debouncer handle (keeps task alive)
}

async fn process_change(app: &AppHandle, path: PathBuf) {
    // 1. Get workspace root from AppState
    // 2. Convert to relative path
    // 3. Check if path is an expected self-write → skip if so
    // 4. Check if file exists and is known
    // 5. Compute diff (added/removed nodes/edges)
    // 6. Emit event to frontend: `topology-changed`, `node-created`, `node-deleted`, etc.
}
```

### Self-Write Deduplication

When the **app writes a file**, it pre-registers the write:
```rust
pub fn register_expected_write(&self, path: PathBuf) {
    if let Ok(mut set) = self.expected_writes.lock() {
        set.insert(path);
    }
}

pub fn consume_expected_write(&self, path: &Path) -> bool {
    if let Ok(mut set) = self.expected_writes.lock() {
        set.remove(path)
    } else {
        false
    }
}
```

**Usage in commands:**
```rust
#[tauri::command]
pub fn create_node(state: State<'_, AppState>, params: CreateNoteParams) -> Result<String, String> {
    let abs_path = state.with_workspace(|ws| Ok(ws.root.join(&params.path)))?;
    state.register_expected_write(abs_path);  // Pre-register
    state.with_workspace_mut(|ws| handlers::handle_create_note(ws, params))
}
```

The watcher checks `consume_expected_write()` on every event — if the path was registered, skip processing.

---

## 6. Rust Backend: AppState & Command Pattern

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/state.rs`

```rust
pub struct AppState {
    pub workspace: Arc<Mutex<Option<Workspace>>>,
    pub expected_writes: Arc<Mutex<HashSet<PathBuf>>>,
    pub watcher: Arc<Mutex<Option<Debouncer<notify::RecommendedWatcher>>>>,
}
```

**Key helpers:**
```rust
pub fn with_workspace<F, T>(&self, f: F) -> Result<T, String>
    where F: FnOnce(&Workspace) -> Result<T, String>
// Returns error if no workspace is open

pub fn with_workspace_mut<F, T>(&self, f: F) -> Result<T, String>
    where F: FnOnce(&mut Workspace) -> Result<T, String>
// Returns error if no workspace is open
```

**Command pattern:**
- All commands receive `State<'_, AppState>` parameter
- Commands **never access workspace directly** — always via `with_workspace()` or `with_workspace_mut()`
- If no workspace is open, command returns `"No workspace open"` error
- All write operations register expected writes before executing

---

## 7. Real-Time Event Bridge

### Rust → Frontend Events

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs` (emitter)

When file watcher detects changes, it emits Tauri events:
```rust
app.emit("workspace-event", event)
```

Where `event` is:
```rust
pub enum WorkspaceEvent {
    NodeCreated { path, node },
    NodeUpdated { path, node },
    NodeDeleted { path },
    EdgeCreated { edge },
    EdgeDeleted { edge },
    TopologyChanged { added_nodes, removed_nodes, added_edges, removed_edges },
}
```

### Frontend Event Listener

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx` (useEffect at line 41–77)

```typescript
useEffect(() => {
    if (!info) return;  // Only listen if workspace is open
    
    let unsubscribe: (() => void) | undefined;
    getAPI().then((api) => {
        unsubscribe = api.onEvent((event) => {
            applyEvent(event);  // Update graphStore
            
            // If event affects open note
            if (event.type === "node-updated" || event.type === "topology-changed") {
                const editorState = useEditorStore.getState();
                const tabStore = useTabStore.getState();
                
                if (editorState.activeNote?.path === eventPath) {
                    editorState.markExternalChange();  // Mark dirty
                } else {
                    const bgTab = tabStore.getTab(eventPath);
                    if (bgTab?.isDirty) {
                        tabStore.updateTabState(eventPath, {
                            conflictState: "external-change"
                        });
                    }
                }
            }
        });
    });
    
    return () => unsubscribe?.();
}, [info, applyEvent]);
```

---

## 8. SegmentPicker Home Screen Flow

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/SegmentPicker.tsx`

### Rendering States

1. **No segments:** Empty state with "Open Folder" and "Create Folder" CTAs
2. **Segments exist:** Grid of segment cards sorted by `lastOpenedAt` (newest first)
3. **Create mode:** Form for manually entering name + path with Browse button

### Card Component

Each segment card shows:
- **Icon:** `■` (square, hardcoded)
- **Name:** Segment name
- **Path:** Full absolute path
- **Metadata:** Relative time since last open (e.g., "2 days ago")
- **Remove button:** ✕ (removes from segmentStore)
- **Loading state:** "Opening..." text + disabled state during open
- **Error display:** Below card if open fails

### Key Interactions

**Open existing:**
```typescript
handleOpenSegment(segment)
  → setOpeningId(segment.id)
  → openWorkspace(segment.path)
  → touchSegment(segment.id)
  → setActiveSegmentId(segment.id)
  → App detects info, stops rendering SegmentPicker
```

**Open folder (native dialog):**
```typescript
handleOpenFolder()
  → pickFolder()  // Opens native OS file picker
  → addSegment(nameFromPath(path), path)
  → openWorkspace()
  → touchSegment() + setActiveSegmentId()
```

**Create folder + segment:**
```typescript
handleCreateSubmit()
  → formPath.trim() + formName.trim() validation
  → addSegment(trimmedName, trimmedPath)
  → openWorkspace()
  → touchSegment() + setActiveSegmentId()
```

---

## 9. Status Bar Integration

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/StatusBar/StatusBar.tsx`

```typescript
const segmentName = segments.find((s) => s.id === activeSegmentId)?.name 
                    ?? info.name;

// Displays: "{segmentName} | {node_count} nodes · {edge_count} edges | {path}"
```

Shows:
1. **Segment name** (fallback to workspace config name)
2. **Stats:** node and edge counts from `workspaceStore.stats`
3. **Active note:** path + "(unsaved)" indicator if dirty

---

## 10. Storage & Persistence Summary

| What | Where | Key | Format |
|------|-------|-----|--------|
| Segments list | localStorage | `brainmap:segments` | JSON array of Segment objects |
| UI Preferences | localStorage | `brainmap:uiPrefs` | JSON: {theme, fonts, zoom, defaultTabSizes} |
| Panel sizes | localStorage | `brainmap:panelSizes` | JSON: {files: {content, editor}, graph: {...}} |
| Notes & edges | Workspace `.brainmap/` | N/A | SQLite (core library) |
| Workspace config | `.brainmap/config.yaml` | N/A | YAML (name, federation, etc.) |
| File watcher state | AppState (memory) | N/A | `Arc<Mutex<Option<Debouncer>>>` |

---

## 11. Key Design Patterns

### Single-Writer Model
- **Workspace state:** Only `AppState` holds `Arc<Mutex<Option<Workspace>>>`
- **Store state:** Each Zustand store is single-source-of-truth for its domain
- **No circular updates:** Commands → Handlers → Workspace → Store updates (one direction)

### Bridge Pattern
```typescript
getAPI() → isTauri() ? TauriBridge : MockBridge
```
- TauriBridge: Invokes Tauri commands (`invoke("command", params)`)
- MockBridge: Simulates commands from in-memory seed dataset

### Per-Tab State Snapshots
- Tab store holds full editor state per tab
- On tab switch: `snapshotToActiveTab()` saves current, then restore target tab state
- Avoids re-fetching from disk unless necessary

### Workspace Event Fan-Out
- File watcher detects changes
- Rust: Computes diff, emits event
- Frontend: Applies to graphStore + handles active note conflict detection

---

## 12. Workspace-Scoped Initialization Checklist

When `openWorkspace()` completes successfully:

✅ `workspaceStore.info` is set  
✅ `workspaceStore.stats` is loaded  
✅ `segmentStore.activeSegmentId` is set  
✅ `graphStore` is ready (topology not yet loaded; loaded separately)  
✅ File watcher is listening  
✅ Event listener in App.tsx is active  
✅ All other workspace-scoped stores are reset  
✅ App.tsx renders AppLayout instead of SegmentPicker  

When `closeWorkspace()` is called:

✅ All workspace-scoped stores are cleared  
✅ File watcher is stopped  
✅ Event listener is unsubscribed  
✅ App.tsx re-renders SegmentPicker  

---

This architecture provides:
- **Isolation:** Each workspace has its own instance of Workspace, nodes, edges, watcher
- **Persistence:** Segments survive app restarts; UI prefs are global
- **Reactivity:** File changes propagate in real-time via watcher → events → store updates
- **Safety:** Expected writes prevent duplicate processing; conflict detection on external changes

---

