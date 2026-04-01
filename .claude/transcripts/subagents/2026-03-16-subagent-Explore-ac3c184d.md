# 2026-03-16 — Subagent Transcript: Explore

**Date:** 2026-03-16 15:26:12
**Agent:** Explore
**Agent ID:** ac3c184d3957f2c9c
**Parent Session:** cf79b56d-b1f5-4194-84f5-dd1631448857

---

## User

Explore how the BrainMap app loads a segment/workspace and how file watching works. I need to understand:

1. How a workspace is initially loaded (the Tauri command flow from frontend to backend)
2. How file watching works and how changes are propagated to the frontend
3. The stores involved (segmentStore, graphStore, noteStore, fileTreeStore, etc.) and how they get populated
4. The `open_workspace` and `switch_workspace` commands
5. How `segmentStateCache.ts` works for state swapping

Focus on these key files:
- crates/app/src-tauri/src/commands.rs
- crates/app/src-tauri/src/handlers.rs
- crates/app/src-tauri/src/lib.rs
- crates/app/src/api/tauri.ts
- crates/app/src/stores/ (all stores)
- crates/app/src/segmentStateCache.ts or similar

Be thorough - I need to understand the full data flow.

---

## Assistant

I'll conduct a thorough exploration of the workspace loading and file watching architecture in BrainMap. Let me start by examining the key files systematically.

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

- **Glob**: `{"pattern":"crates/app/src/stores/**/*.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/api/*.ts"}`

---

## Assistant

Let me continue reading the key store files and the API bridge:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStateCache.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStore.ts"}`

---

## Assistant

Now let me read the other stores and the watcher module:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/src/watcher.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/state.rs"}`

---

## Assistant

Now let me look at one more critical piece - how the event system hooks up on the frontend:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"onEvent|brainmap://workspace-event","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","type":"ts","head_limit":20}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","limit":150}`

---

## Assistant

Perfect! I now have a comprehensive view of the workspace loading and file watching architecture. Let me compile a detailed report for the user.

## Complete Workspace Loading & File Watching Architecture

I've conducted a thorough exploration of BrainMap's workspace loading and file watching system. Here's the full data flow:

---

### 1. WORKSPACE OPENING FLOW

**Frontend Initiator:**
- `App.tsx` (useEffect around line 108-114) calls `loadTopology()` after workspace open
- `SegmentPicker` calls `useWorkspaceStore.openWorkspace(path)`

**Frontend → Backend (Tauri Invoke):**
```
TauriBridge.openWorkspace(path) → invoke("open_workspace", { path })
```

**Backend Processing (`crates/app/src-tauri/src/commands.rs:25-71`):**
1. `open_workspace` command receives path
2. Path canonicalization via `canonicalize_root()`
3. Checks if workspace already open (idempotent)
4. If not open, calls `handlers::handle_open_workspace()`
5. Creates `WorkspaceSlot` with `Workspace` + `expected_writes: HashSet`
6. Inserts into `AppState.slots: HashMap<String, Arc<Mutex<WorkspaceSlot>>>`
7. Starts file watcher via `watcher::start_watcher()` for that root
8. Sets workspace as active via `state.set_active_root()`

**Workspace Initialization (`handlers.rs:12-24`):**
- Calls `Workspace::open_or_init()` from core library
- Loads config, notes from `.brainmap/`, rebuilds in-memory graph
- Returns `WorkspaceInfoDto` (name, root, node_count, edge_count)

**Frontend Response:**
- `workspaceStore.openWorkspace()` sets:
  - `info` → workspace metadata
  - `stats` → graph statistics via `getStats()`
- Triggers `loadTopology()` which:
  - Calls `getGraphTopology()` → full node/edge set
  - Calls `listWorkspaceFiles()` → all workspace files
  - Populates `graphStore.nodes: Map<string, NodeDto>`
  - Populates `graphStore.edges: EdgeDto[]`

---

### 2. FILE WATCHING ARCHITECTURE

**Watcher Startup (`watcher.rs:130-180`):**
- Created per workspace via `notify-debouncer-mini` crate
- Watches workspace root recursively with 1-second debounce
- Returns `Debouncer` handle (kept alive in `AppState.watchers`)
- Spawns tokio task to process events

**Event Processing (`watcher.rs:137-177`):**

Event types:
- **Markdown files (.md)** → `process_md_change()` → topology updates
- **Other files** → `process_plain_change()` → files-changed events
- Skips hidden files/folders (`.brainmap/`, `.git/`, etc.)

**Self-Write Detection (`watcher.rs:198-201`):**
- Before processing, checks `expected_writes: HashSet<PathBuf>`
- Commands register expected writes before disk ops:
  ```rust
  state.register_expected_write(&root, abs_path);
  ```
- Watcher consumes the entry and skips that event
- Prevents re-processing user's own changes

---

### 3. MARKDOWN FILE CHANGE HANDLING

**File State Detection (`watcher.rs:208-223`):**
1. Check if path exists on disk
2. Check if path is already in `workspace.notes`
3. Call appropriate core operation:
   - Exists + known → `workspace.reload_file()` (parse + re-index)
   - Exists + unknown → `workspace.add_file()` (new note)
   - Doesn't exist → `workspace.remove_file()` (deleted note)

**GraphDiff Result:**
- Core returns `GraphDiff`:
  - `added_nodes: Vec<NodeData>`
  - `removed_nodes: Vec<RelativePath>`
  - `added_edges: Vec<Edge>`
  - `removed_edges: Vec<Edge>`

**Event Emission (`watcher.rs:233-240`):**
```rust
emit_topology_event(
  app,
  root_key,  // canonicalized workspace root
  added_nodes.iter().map(node_to_payload).collect(),
  removed_nodes,
  added_edges,
  removed_edges,
)
```

Emits to frontend via Tauri: `app.emit("brainmap://workspace-event", payload)`

---

### 4. FRONTEND EVENT HANDLING

**Event Listener Setup (`App.tsx:49-103`):**
```typescript
useEffect(() => {
  api.onEvent((event) => {
    // 1. Skip if segment switch in progress
    if (useWorkspaceStore.getState().switchInProgress) return;

    // 2. Route by workspace_root
    const eventRoot = event.workspace_root;
    const activeRoot = useWorkspaceStore.getState().info?.root;

    if (eventRoot !== activeRoot) {
      // Background segment event
      applyEventToSnapshot(segment.id, event);  // See #5 below
    } else {
      // Active segment event
      graphStore.applyEvent(event);  // See below
    }

    // 3. Conflict detection for edited notes
    if (activeNote?.path === eventPath) {
      markExternalChange();  // Warn user of external edit
    }
  });
});
```

**Graph Update via `applyTopologyDiff()` (`graphStore.ts:99-107`):**
```typescript
applyEvent: (event: WorkspaceEvent) => {
  const result = applyTopologyDiff(
    { nodes: new Map(nodes), edges, workspaceFiles },
    event,
  );
  set({ nodes: result.nodes, edges: result.edges, workspaceFiles: result.workspaceFiles });
}
```

The `applyTopologyDiff()` function (in `graphDiff.ts`) applies mutations to the graph:
- Adds/removes nodes from the Map
- Adds/removes edges from the array
- Updates file tree

---

### 5. MULTI-SEGMENT STATE MANAGEMENT

**State Caching (`segmentStateCache.ts`):**

When switching segments, stores are captured into a `SegmentSnapshot`:

```typescript
export interface SegmentSnapshot {
  // workspaceStore
  info: WorkspaceInfo;
  stats: StatsDto | null;

  // graphStore
  nodes: Map<string, NodeDto>;
  edges: EdgeDto[];
  workspaceFiles: string[];
  selectedNodePath: string | null;
  expandedNodes: Set<string>;

  // editorStore, tabStore, undoStore, navigationStore, uiStore
  // ... all workspace-scoped state
}
```

**Snapshot Lifecycle:**

1. **Capture** (`captureSnapshot()`) → reads all active stores
2. **Cache** (`cacheCurrentState(segmentId)`) → stores in module-level `Map<string, SegmentSnapshot>`
3. **Restore** (`restoreSnapshot()`) → writes snapshot back to all stores
4. **Background Updates** (`applyEventToSnapshot()`) → applies file watcher events to cached snapshots

**Background Segment Updates (`App.tsx:62-70`):**
```typescript
if (eventRoot !== activeRoot) {
  // This event is for a background segment (not active)
  const segment = segStore.getSegmentByPath(eventRoot);
  if (segment) {
    applyEventToSnapshot(segment.id, event);
  }
  return;
}
```

This ensures cached segments stay in sync with filesystem even while inactive.

---

### 6. SEGMENT SWITCHING FLOW

**`switchSegment()` (`workspaceStore.ts:81-191`):**

1. **Concurrency guard** — prevent simultaneous switches
2. **Save dirty state** — flush unsaved edits
3. **Cache outgoing segment** — snapshot active stores
4. **Backend switch/open:**
   - If previously open: `api.switchWorkspace()`
   - If first open: `api.openWorkspace()`
5. **Clear/restore frontend stores:**
   - First open: Clear all, then `loadTopology()`
   - Cached: `restoreCachedState()`
6. **Update segment metadata** — `touchSegment()`, `setActiveSegmentId()`
7. **Rollback on failure** — restore previous segment + backend state

**Backend Switch (`commands.rs:95-108`):**
```rust
// Workspace already open — just activate it
state.set_active_root(Some(canonical.clone()));
return workspace_info_from_slot(slot);
```

No re-initialization needed; slot already exists with live workspace state.

---

### 7. STORE ARCHITECTURE

**workspaceStore** (`workspaceStore.ts`):
- `info: WorkspaceInfo | null` — current workspace metadata
- `stats: StatsDto | null` — node/edge counts
- `switchInProgress: boolean` — guard against concurrent switches
- Methods: `openWorkspace()`, `switchSegment()`, `closeSegment()`, `refreshStats()`

**graphStore** (`graphStore.ts`):
- `nodes: Map<string, NodeDto>` — keyed by path
- `edges: EdgeDto[]` — all edges
- `workspaceFiles: string[]` — all files in workspace
- Methods: `loadTopology()`, `applyEvent()`, `expandNode()`, `selectNode()`

**editorStore** (`editorStore.ts`):
- `activeNote: NoteDetail | null` — currently open note
- `editedBody: string | null` — in-editor text (vs. persisted)
- `editedFrontmatter: Partial<EditableFrontmatter> | null` — metadata edits
- `isDirty: boolean` — has unsaved changes
- Methods: `openNote()`, `saveNote()`, `updateContent()`, `resolveConflict()`

**segmentStore** (`segmentStore.ts`):
- `segments: Segment[]` — persisted to `localStorage:brainmap:segments`
- `activeSegmentId: string | null` — currently active segment
- `openSegmentIds: string[]` — which segments have workspaces open in backend
- Segment = `{ id, name, path, lastOpenedAt, createdAt }`

**uiStore** (`uiStore.ts`):
- `hiddenEdgeTypes: Set<string>` — toggle edge visibility
- `graphFocusPath: string | null` — focus mode node
- `treeExpandedFolders: Set<string>` — file tree expansion state
- `activeLeftTab: "Graph" | "Files"` — which side panel is shown
- `uiZoom: number` — global zoom level (0.5 to 2.0)

---

### 8. KEY INVARIANTS & SYNCHRONIZATION

**Per-Slot Locking:**
```
AppState.slots: Arc<RwLock<HashMap<String, Arc<Mutex<WorkspaceSlot>>>>>
```
- Outer `RwLock` held briefly for HashMap lookups
- Inner `Mutex` per workspace — operations on different segments never contend
- Allows 10+ workspaces open simultaneously without contention

**Expected Writes Pattern:**
- Frontend command registers path before writing: `register_expected_write(root, path)`
- Watcher checks `consume_expected_write()` before processing
- Skips re-processing self-triggered changes
- Scope: per-slot (different workspaces don't interfere)

**Event Routing by `workspace_root`:**
- Every event includes `workspace_root` (canonicalized)
- App.tsx routes to active store or background snapshot
- Prevents cross-contamination during multi-segment operations

**Conflict Detection:**
- External change to active note → `editorStore.markExternalChange()`
- Marks with `conflictState: "external-change"`
- User prompted to keep/discard
- Background tabs track conflict state separately

---

### 9. FILE OPERATIONS THAT TRIGGER EVENTS

**From Tauri Commands** (emit after writing to disk):
- `create_node()` → node-created (via folder node updates too)
- `update_node()` → node-updated
- `delete_node()` → node-deleted + folder pruning
- `create_link()` → edge-created
- `delete_link()` → edge-deleted
- `write_raw_note()` → topology-changed (full diff)
- `create_plain_file()`, `delete_plain_file()` → files-changed

**From File Watcher** (async background):
- .md file modified/added/deleted → topology-changed
- Other file changes → files-changed

---

### 10. KEY FILES REFERENCE

| File | Purpose |
|------|---------|
| `/crates/app/src-tauri/src/commands.rs` | Tauri command entry points, expected-write registration |
| `/crates/app/src-tauri/src/handlers.rs` | Business logic wrappers (open, CRUD, etc.) |
| `/crates/app/src-tauri/src/state.rs` | AppState with multi-slot management, locking |
| `/crates/app/src-tauri/src/watcher.rs` | File watching, event processing, emission |
| `/crates/app/src/api/tauri.ts` | TauriBridge: Tauri invoke + event listener |
| `/crates/app/src/api/types.ts` | WorkspaceEvent, BrainMapAPI interface |
| `/crates/app/src/stores/workspaceStore.ts` | Workspace metadata, segment switching |
| `/crates/app/src/stores/graphStore.ts` | Graph state, topology loading, event application |
| `/crates/app/src/stores/segmentStateCache.ts` | State snapshot/restore for multi-segment |
| `/crates/app/src/stores/segmentStore.ts` | Segment metadata (persisted to localStorage) |
| `/crates/app/src/stores/editorStore.ts` | Note/file content, dirty state, conflict detection |
| `/crates/app/src/App.tsx` | Event listener hub, routing by workspace_root |

---

This architecture enables:
- **Live editing**: File changes → instant graph updates
- **Multi-segment isolation**: 10+ workspaces open, no contention
- **Background sync**: Cached segments updated even while inactive
- **Conflict awareness**: External edits detected before save
- **Safe self-write filtering**: Expected writes don't re-process

---

