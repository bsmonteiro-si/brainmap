# 2026-03-14 — Subagent Transcript: Plan

**Date:** 2026-03-14 12:07:16
**Agent:** Plan
**Agent ID:** a09ef51890a8536d0
**Parent Session:** b0628a66-649e-4349-8f3f-68ebe391e247

---

## User

Design a detailed implementation plan for adding multi-segment support to BrainMap's desktop app. Currently only one segment (workspace) can be open at a time. The goal is to allow multiple segments open simultaneously.

## Current Architecture

### Rust Backend (Tauri)
- `AppState` holds a single `Arc<Mutex<Option<Workspace>>>`, plus one file watcher and one `expected_writes` set
- `with_workspace` / `with_workspace_mut` helpers assume one workspace
- All 20+ Tauri commands use `State<'_, AppState>` and call `with_workspace`
- File watcher: one `notify_debouncer_mini::Debouncer` in AppState, started on `open_workspace`, watches one root
- Events emitted as `brainmap://workspace-event` with no workspace identifier

### Frontend (React + Zustand)
**Workspace-scoped stores (cleared on closeWorkspace):**
- `editorStore` — activeNote, editedBody, editedFrontmatter, isDirty, viewMode, etc.
- `graphStore` — nodes Map, edges array, workspaceFiles, selectedNodePath, expandedNodes
- `tabStore` — tabs[] array, activeTabId
- `undoStore` — undoStack[], redoStack[]
- `navigationStore` — history[], cursor
- `uiStore` (workspace parts) — hiddenEdgeTypes, graphFocusPath, treeExpandedFolders, activeLeftTab, leftPanelCollapsed, emptyFolders

**Global stores (persist across workspace switches):**
- `segmentStore` — segments[], activeSegmentId
- `uiStore` (global parts) — theme, fonts, zoom, panelSizes

### Workspace Core
- `Workspace` struct: root, config, graph, index, notes HashMap
- No global state or singletons — multiple instances CAN coexist
- SQLite per workspace at `.brainmap/index.db` (WAL mode)
- Incremental ops: reload_file, add_file, remove_file → GraphDiff

## Requirements
1. Multiple segments can be open simultaneously
2. UI shows tabs or a switcher to navigate between open segments
3. Each segment has its own isolated state (graph, tabs, undo, navigation, file tree)
4. Settings modal stays global (theme, fonts, zoom affect all segments)
5. File watchers run for all open segments
6. Clean separation — no state leakage between segments

## Research: How Others Do It
- **IntelliJ**: window-per-project, global IDE settings + project-level settings
- **Obsidian**: window-per-vault, fully isolated (no global settings — considered a mistake by users)
- **VS Code**: multi-root single window with settings hierarchy (Default < User < Workspace < Folder)

The user wants a **single-window approach** (like VS Code multi-root, not IntelliJ's multi-window) where you can switch between segments within one window. Settings are global.

## Design Considerations
1. **Backend**: AppState needs to manage multiple Workspace instances (HashMap<SegmentId, WorkspaceSlot> where WorkspaceSlot = Workspace + Watcher + ExpectedWrites)
2. **Commands**: All Tauri commands need a `segment_id` parameter (or workspace path) to identify which workspace to operate on
3. **Frontend stores**: Need to be either (a) keyed by segment ID or (b) swapped on segment switch with state cached
4. **Events**: Workspace events need a segment identifier so the frontend routes them correctly
5. **Memory**: Consider lazy-loading — only keep active segment's workspace fully loaded?

Please provide a detailed implementation plan with phases, specific files to modify, and key architectural decisions. Consider both approaches for frontend state management:
- Option A: Single set of stores, swap state in/out on segment switch (simpler, like Obsidian's vault switcher but without closing)
- Option B: Multiple store instances keyed by segment ID (more complex, but enables background updates)

The plan should be pragmatic and minimize blast radius while achieving the goal.

---

## Assistant



I'll start by thoroughly exploring the current codebase to understand the exact state management patterns, command signatures, and event flow before designing the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/state.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs"}`

---

## Assistant

Now let me look at the frontend stores and the segment/bridge layer.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*Store*.ts","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*store*.ts","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/bridge*.ts","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts"}`

---

## Assistant

Now let me check the remaining stores and the event listener setup, plus the main App component and API types.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/navigationStore.ts"}`

---

## Assistant

Now let me check the event listener setup and the main App component to understand the routing.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"brainmap://workspace-event","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/App.tsx","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

Now let me check the API types to understand the full interface.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/SegmentPicker.tsx"}`

---

## Assistant

Let me check the AppLayout and StatusBar to understand the current segment display.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Layout/AppLayout.tsx","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Layout/StatusBar.tsx","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"closeWorkspace","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

Let me check the hooks/useAutoSave and the tabActions file to understand cross-store coordination.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/hooks/useAutoSave.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabActions.ts"}`

---

## Assistant

Now I have a thorough understanding of the codebase. Let me also quickly check how the StatusBar displays the close button and segment name.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"closeWorkspace|segment.*name|activeSegment","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/StatusBar/StatusBar.tsx"}`

---

## Assistant

Now I have a comprehensive understanding of the entire architecture. Let me design the plan.

---

## Multi-Segment Implementation Plan

Here is the detailed implementation plan for supporting multiple simultaneously-open segments in BrainMap's desktop app.

### Architectural Decision: Option A (State Swap) vs Option B (Keyed Instances)

After analyzing the codebase, I recommend **Option A: Single set of stores with state swap on segment switch, plus background file watchers for all open segments**.

**Rationale:**

1. **Store cross-references are pervasive.** The stores call each other directly (`useEditorStore` calls `useTabStore`, `useGraphStore`; `useUndoStore` calls `useEditorStore`, `useGraphStore`, `useUIStore`; `useNavigationStore` calls `useEditorStore`, `useGraphStore`). Option B would require every one of these cross-references to be parameterized by segment ID, which is a massive refactor with high regression risk.

2. **Only one segment is visible at a time.** The UI is single-window, single-pane. You never see two segments' graphs or editors side by side. There is no benefit to keeping multiple store instances hot simultaneously.

3. **The Workspace core already supports multiple instances.** The Rust `Workspace` struct has no global state. Multiple instances can coexist, each with their own graph and SQLite index.

4. **File watchers need to run in background.** This is the one place where Option B's "background updates" argument has merit. But we can solve this by keeping multiple workspace instances open on the backend and routing file watcher events by workspace root, while still using Option A on the frontend.

### Design Overview

**Backend:** `AppState` changes from holding a single `Option<Workspace>` to holding a `HashMap<String, WorkspaceSlot>` keyed by workspace root path, plus an `active_workspace` path. Each slot has its own Workspace, file watcher, and expected_writes set. All Tauri commands gain a `segment_id` parameter (the workspace root path). Events carry a `workspace_root` field so the frontend can route them.

**Frontend:** A new `segmentStateCache` module manages serializing the current stores' workspace-scoped state into a snapshot when switching segments, and restoring a snapshot when switching back. The `workspaceStore` gains `switchSegment(segmentId)` which saves current state, tells the backend which workspace is now active, and restores the target segment's cached state. All stores remain singleton Zustand stores.

### Phase 1: Backend Multi-Workspace Support

**Step 1.1: New `WorkspaceSlot` struct and multi-workspace `AppState`**

File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/state.rs`

```
struct WorkspaceSlot {
    workspace: Workspace,
    expected_writes: HashSet<PathBuf>,
    watcher: Option<Debouncer<RecommendedWatcher>>,
}

pub struct AppState {
    slots: Arc<Mutex<HashMap<String, WorkspaceSlot>>>,  // key = normalized root path
    active_root: Arc<Mutex<Option<String>>>,
}
```

New helper methods:
- `with_slot<F, T>(&self, root: &str, f: F) -> Result<T, String>` -- read access to a specific slot
- `with_slot_mut<F, T>(&self, root: &str, f: F) -> Result<T, String>` -- write access
- `with_active<F, T>(&self, f: F) -> Result<T, String>` -- shorthand for active workspace (used by commands that don't receive explicit root)
- `register_expected_write(&self, root: &str, path: PathBuf)`
- `consume_expected_write(&self, root: &str, path: &Path) -> bool`

**Step 1.2: Update `open_workspace` command**

File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs`

The `open_workspace` command should:
- Check if a slot for this root already exists. If so, just set `active_root` to it and return the cached info.
- If not, create a new `WorkspaceSlot`, start a watcher for it, insert into the map, set `active_root`.
- The old workspace stays open (no longer dropped when opening a new one).

**Step 1.3: Add `close_workspace` command**

New Tauri command that removes a slot from the map, drops its watcher, and clears `active_root` if it was active.

**Step 1.4: Add `switch_workspace` command**

New Tauri command that just changes `active_root`. No workspace creation or destruction. Returns the `WorkspaceInfoDto` for the target.

**Step 1.5: Update all existing commands to accept `segment_root: Option<String>`**

For backward compatibility, if `segment_root` is `None`, use `active_root`. This means all 20+ commands need a small change:
- Replace `state.with_workspace(...)` with `state.with_slot(&root, ...)`
- The `root` is derived from the optional param or `active_root`

A helper function to extract the root reduces the per-command boilerplate:

```rust
fn resolve_root(state: &AppState, segment_root: Option<String>) -> Result<String, String> {
    segment_root.or_else(|| state.active_root.lock().ok()?.clone())
        .ok_or_else(|| "No workspace open".to_string())
}
```

**Step 1.6: Update file watcher to include workspace root in events**

File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs`

- `start_watcher` takes the workspace root as owned `String` and captures it in the closure.
- `TopologyChangedPayload` gains a `workspace_root: String` field.
- `process_change` resolves which slot the changed path belongs to (by checking which slot's root is a prefix of the changed path) and operates on that specific slot.
- The event payload includes `workspace_root` so the frontend knows which segment the event is for.

### Phase 2: Frontend State Snapshot/Restore

**Step 2.1: Define `SegmentSnapshot` type and cache**

New file: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStateCache.ts`

```typescript
interface SegmentSnapshot {
  // from workspaceStore
  info: WorkspaceInfo;
  stats: StatsDto | null;
  // from graphStore
  nodes: Map<string, NodeDto>;
  edges: EdgeDto[];
  workspaceFiles: string[];
  selectedNodePath: string | null;
  expandedNodes: Set<string>;
  // from editorStore (active editor state)
  activeNote: NoteDetail | null;
  activePlainFile: PlainFileDetail | null;
  isUntitledTab: boolean;
  editedBody: string | null;
  editedFrontmatter: Partial<EditableFrontmatter> | null;
  isDirty: boolean;
  viewMode: "edit" | "preview" | "raw";
  // from tabStore
  tabs: TabState[];
  activeTabId: string | null;
  untitledCounter: number;
  // from undoStore
  undoStack: UndoableAction[];
  redoStack: UndoableAction[];
  // from navigationStore
  history: string[];
  cursor: number;
  // from uiStore (workspace-scoped parts)
  hiddenEdgeTypes: Set<string>;
  graphFocusPath: string | null;
  graphFocusKind: "note" | "folder" | null;
  treeExpandedFolders: Set<string>;
  emptyFolders: Set<string>;
  activeLeftTab: LeftTab;
  leftPanelCollapsed: boolean;
}
```

Functions:
- `captureSnapshot(): SegmentSnapshot` -- reads all stores and assembles snapshot
- `restoreSnapshot(snapshot: SegmentSnapshot): void` -- writes snapshot into all stores
- `const cache = new Map<string, SegmentSnapshot>()` -- keyed by segment ID
- `cacheCurrentState(segmentId: string): void`
- `restoreCachedState(segmentId: string): boolean` -- returns false if no cached state

**Step 2.2: Update `workspaceStore` with `switchSegment`**

File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts`

New action `switchSegment(segmentId: string, path: string)`:
1. If current segment is open, auto-save any dirty editors, then `cacheCurrentState(currentSegmentId)`.
2. If target segment has a cached snapshot, call `restoreCachedState(segmentId)` and call the backend `switch_workspace` command.
3. If no cached snapshot (first open), call backend `open_workspace`, load topology, set stores fresh.
4. Update `segmentStore.setActiveSegmentId(segmentId)`.

New action `closeSegment(segmentId: string)`:
1. If closing the active segment, save and clear all stores (like current `closeWorkspace`).
2. Remove from cache.
3. Call backend `close_workspace`.
4. If other segments are open, switch to the most recently used one.
5. If no segments remain, show SegmentPicker.

**Step 2.3: Add restore methods to each store**

Each workspace-scoped store needs a `restore(state)` method that bulk-sets state without triggering side effects:

- `editorStore.restore(snapshot)` -- sets all editor fields atomically
- `graphStore.restore(snapshot)` -- sets nodes, edges, etc.
- `tabStore.restore(snapshot)` -- sets tabs, activeTabId, counter
- `undoStore.restore(snapshot)` -- sets stacks
- `navigationStore.restore(snapshot)` -- sets history, cursor
- `uiStore.restoreWorkspaceState(snapshot)` -- sets workspace-scoped UI fields

### Phase 3: Frontend Event Routing

**Step 3.1: Update `WorkspaceEvent` type**

File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts`

Add `workspace_root: string` to all event variants (or as a wrapper field).

**Step 3.2: Update event listener in `App.tsx`**

The `onEvent` handler in `App.tsx` currently applies all events to the active stores. With multi-segment:
- If the event's `workspace_root` matches the active segment's root, apply it normally (current behavior).
- If it does not match (background segment), find the cached snapshot for that segment and apply the topology diff to the cached snapshot's nodes/edges in-place. This ensures when the user switches back, the graph is up to date.

### Phase 4: UI - Segment Switcher

**Step 4.1: Segment tabs or switcher in the UI**

Two options for the UI presentation:

**Option A (Simpler): Segment switcher dropdown in StatusBar**
- Replace the plain segment name text in `StatusBar.tsx` with a clickable dropdown.
- Dropdown shows all open segments with colored indicators, click to switch.
- A "+" button to open a new segment.
- A "x" button on each item to close a segment.

**Option B (Richer): Segment tab bar**
- A thin horizontal bar above the `AppLayout` (below the title bar) showing open segments as tabs.
- Active segment is highlighted.
- Close button on each tab.
- "+" button at the end.

I recommend Option A (dropdown in StatusBar) for phase 1 because it has minimal layout impact and reuses existing UI patterns.

**Step 4.2: Update `SegmentPicker` to support "add" mode**

When a workspace is already open and the user clicks "+", instead of replacing the entire view with `SegmentPicker`, show a dialog/modal version that lets them browse for a folder, and opens it as an additional segment without closing the current one.

**Step 4.3: Update `closeWorkspace` / close button in IconSidebar**

The existing close button (in `IconSidebar.tsx`) should close the active segment, not the entire app. If other segments are open, switch to the next one.

### Phase 5: API Bridge Updates

**Step 5.1: Update `TauriBridge` to pass segment root**

File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts`

- Add an optional `segmentRoot` field to `TauriBridge` (or accept it per-call).
- For simplicity, since we always operate on the active segment (the backend tracks `active_root`), most commands do not need to pass it explicitly. The backend defaults to `active_root`.
- Only `openWorkspace`, `closeWorkspace`, `switchWorkspace` need explicit root params.

**Step 5.2: Update `BrainMapAPI` interface**

File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts`

Add:
- `switchWorkspace(root: string): Promise<WorkspaceInfo>`
- `closeWorkspace(root: string): Promise<void>`

### Phase 6: Memory Management

**Step 6.1: Lazy unloading for inactive segments**

When many segments are open, memory could grow. Add an optional eviction strategy:
- After N minutes of inactivity, an inactive segment's `Workspace` can be dropped from the backend while keeping the frontend snapshot cached.
- Re-opening would call `open_workspace` again on the backend.
- For phase 1, do not implement this -- just document the trade-off. Multiple Workspace instances are relatively lightweight (in-memory graph + SQLite).

### Implementation Sequence

1. **Phase 1** (Backend): State, commands, watcher. This is the foundation. ~300 lines of Rust changes.
2. **Phase 2** (Frontend state): SegmentStateCache, store restore methods, workspaceStore changes. ~400 lines of TypeScript.
3. **Phase 3** (Event routing): ~50 lines of TypeScript.
4. **Phase 4** (UI): Segment switcher. ~200 lines of TypeScript/CSS.
5. **Phase 5** (API bridge): ~50 lines of TypeScript.
6. Tests throughout.

### Edge Cases and Risks

1. **Dirty state on segment switch:** Must auto-save before snapshotting. The auto-save is already debounced at 1.5s. On segment switch, force an immediate save.

2. **Untitled tabs:** These are in-memory only. The snapshot captures them. On segment switch, they persist in the cached snapshot and reappear when switching back.

3. **File watcher race conditions:** A watcher event for a background segment modifying its cached snapshot while the frontend is in the middle of a switch could cause data corruption. Solution: use a simple mutex (JavaScript is single-threaded, so just a boolean flag `isSwitching` that defers background event processing until the switch completes).

4. **Keyboard shortcuts:** These all operate on the active stores, which is correct since only one segment is active.

5. **`getAPI()` singleton:** The API bridge is a singleton, which is fine. All commands go through the same bridge. The backend routes them by `active_root`.

6. **Cross-segment linking:** Out of scope for this plan. Each segment is fully isolated. Future work could allow edges between segments.

7. **`beforeunload` warning:** Must check all cached segments for dirty untitled tabs, not just the active one.

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/state.rs` - Core backend state that changes from single to multi-workspace HashMap
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs` - All 20+ Tauri commands need segment routing (resolve_root helper)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs` - File watcher must tag events with workspace_root and process changes per-slot
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts` - Gains switchSegment/closeSegment actions and orchestrates state swap
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStore.ts` - Needs openSegmentIds tracking and multi-open awareness

---

