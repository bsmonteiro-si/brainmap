# 2026-03-15 — Subagent Transcript: Explore

**Date:** 2026-03-15 12:13:40
**Agent:** Explore
**Agent ID:** a665e52e0cb978527
**Parent Session:** 8d73316b-3416-4b53-98d7-9a9a8c8a65ff

---

## User

Explore how the file watcher works in this Tauri app. I need to understand:

1. How file watching is set up in the Rust backend (look in crates/app/src-tauri/ for file watcher setup, notify crate usage, etc.)
2. What events the file watcher emits to the frontend
3. How the frontend handles these events (look for event listeners, Tauri event handling)
4. How the file tree state is managed - what store holds the tree data, how it gets populated initially, and how it gets updated

Be thorough - check handlers.rs, commands.rs, lib.rs, any watcher module, and the frontend stores (graphStore, editorStore, workspaceStore, uiStore, etc.). Also check how `applyEvent` or similar functions process file system events.

---

## Assistant

I'll conduct a thorough exploration of how the file watcher works in this Tauri app. Let me start by examining the backend file watcher setup and then trace how events flow to the frontend.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri -type f -name \"*.rs\" | head -20"}`

---

## Assistant

Let me focus on the actual source files instead of the build artifacts:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/"}`

---

## Assistant

Perfect! Now let me examine the key files to understand the file watcher system:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs"}`

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

Now let me examine the handlers and commands to see how workspaces are opened:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","limit":100}`

---

## Assistant

Let me continue reading the commands file:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","offset":100}`

---

## Assistant

Now let me examine the frontend stores to understand how events are handled. Let me search for the event listener and the stores:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*store*\" -o -name \"*event*\" | grep -v node_modules | head -20"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/"}`

---

## Assistant

Perfect. Now let me examine the key stores to understand event handling:

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

Now let me find where the event listener is registered and how applyEvent is called:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"brainmap://workspace-event\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.ts\" --include=\"*.tsx\" -l"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts"}`

---

## Assistant

Excellent. Now let me find where `onEvent` is actually registered and used in the app:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"\\.onEvent\\|applyEvent\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.ts\" --include=\"*.tsx\" -n | head -40"}`

---

## Assistant

Perfect! Now let me examine the App.tsx where the event listener is registered:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","limit":150}`

---

## Assistant

Now let me look at the graphDiff file to understand how events are applied:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphDiff.ts"}`

---

## Assistant

Perfect! Now let me look at the API types to understand the WorkspaceEvent structure:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 40 \"WorkspaceEvent\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts | head -60"}`

---

## Assistant

Excellent! Now let me look at the segmentStateCache to understand how background segments are handled:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStateCache.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStateCache.ts","offset":290,"limit":80}`

---

## Assistant

Now let me check the API types file to see what WorkspaceEvent looks like from the backend:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts","limit":120}`

---

## Assistant

Perfect! Now let me check how the file tree is populated initially by looking at the FileTreePanel:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":100}`

---

## Assistant

Let me continue reading the FileTreePanel to see how it uses the graphStore data:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":100,"limit":150}`

---

## Assistant

Now let me check where the FileTreePanel component renders to understand how it's invoked:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 20 \"export function FileTreePanel\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx | head -40"}`

---

## Assistant

Perfect! Now I have all the information I need. Let me create a comprehensive report of my findings.

## File Watcher Architecture Exploration

I've conducted a thorough exploration of the file watcher system in this Tauri app. Here's my comprehensive analysis:

---

### 1. **Backend File Watcher Setup (Rust)**

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs`

The file watcher uses the `notify_debouncer_mini` crate with 2-second debouncing:

- **Initialization**: `start_watcher()` function creates a recursive file watcher on the workspace root via `notify::RecommendedWatcher`
- **Debouncing**: Events are debounced for 2 seconds before processing
- **Filtering**: Only `.md` files trigger processing; all other file changes are ignored
- **Event Channel**: File paths are sent through an `mpsc::unbounded_channel` to an async task
- **Per-workspace**: Each workspace slot gets its own debouncer stored in `AppState.watchers` (a `HashMap<String, Debouncer>`)
- **Self-write Detection**: Expected writes are tracked in `AppState.slots[root].expected_writes` to prevent re-processing self-triggered changes

**Key Processing Logic** (`process_change()` function):
1. Strip the absolute path to a relative path
2. Check if the change was expected (self-triggered) via `consume_expected_write()` — if yes, skip
3. Determine the operation: `reload_file()` if file exists and was known, `add_file()` if new, `remove_file()` if deleted
4. Generate a `GraphDiff` (added/removed nodes and edges)
5. Convert the diff to a `TopologyChangedPayload` and emit via Tauri event

---

### 2. **Events Emitted to Frontend**

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs` (lines 162-164)

The backend emits a single Tauri event:

```
Event Name: "brainmap://workspace-event"

Payload (TopologyChangedPayload):
{
  "type": "topology-changed",
  "workspace_root": "<canonicalized-root-path>",
  "added_nodes": [{ path, title, note_type, tags }, ...],
  "removed_nodes": ["path1", "path2", ...],
  "added_edges": [{ source, target, rel, kind }, ...],
  "removed_edges": [{ source, target, rel, kind }, ...]
}
```

**Note**: The `workspace_root` field is critical for multi-segment support — it identifies which workspace the event belongs to.

---

### 3. **Frontend Event Handling**

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx` (lines 48-103)

**Event Registration**:
- Happens in a `useEffect` that depends on `info` (workspace info from the backend)
- Calls `api.onEvent(callback)` from the Tauri bridge to register a listener
- The callback receives `WorkspaceEvent` objects

**Bridge Implementation** (`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts`):
```typescript
onEvent(callback: (event: WorkspaceEvent) => void): () => void {
  listen<WorkspaceEvent>("brainmap://workspace-event", (e) => {
    callback(e.payload);
  }).then((fn) => {
    unlisten = fn;
  });
  return () => { unlisten?.(); }; // Unsubscribe function
}
```

**Event Processing Logic** in App.tsx:
1. **Concurrency Guard**: Skip events if `switchInProgress` is true (multi-segment switching)
2. **Workspace Routing**: Check `event.workspace_root` against `activeRoot`
   - If different: it's a background segment event → route to `applyEventToSnapshot()`
   - If same: it's an active segment event → route to `applyEvent()`
3. **Conflict Detection** (for active notes):
   - If event affects the currently open note: call `markExternalChange()` to trigger conflict UI
   - If event affects a background tab: mark tab as "external-change" state
   - Clean background tabs are left as-is (content re-fetched on activation)

---

### 4. **Frontend Store Integration**

**Primary Stores Involved**:

**GraphStore** (`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts`):
- **State**: `nodes: Map<string, NodeDto>`, `edges: EdgeDto[]`, `workspaceFiles: string[]`
- **applyEvent()**: Calls `applyTopologyDiff()` to apply topology-changed events
- **Initial Load**: `loadTopology()` fetches full topology + workspace files

**EditorStore** (`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts`):
- **Conflict Tracking**: `conflictState: "none" | "external-change"`
- **Methods**:
  - `markExternalChange()`: Marks active note as having external changes
  - Detects when events affect the current note path

**SegmentStateCache** (`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStateCache.ts`):
- **applyEventToSnapshot()**: For background segments
- Applies events to cached snapshots of inactive workspaces
- Prevents workspace state corruption during multi-segment usage

---

### 5. **Topology Event Processing**

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphDiff.ts`

The `applyTopologyDiff()` pure function handles different event types:

```typescript
"node-created"  → Add node to Map, add path to workspaceFiles
"node-updated"  → Update node in Map
"node-deleted"  → Remove node, filter edges, remove from workspaceFiles
"edge-created"  → Push edge to array
"edge-deleted"  → Filter out matching edge
"topology-changed" → Batch update: delete nodes, add nodes, remove/add edges, sync workspaceFiles
```

The function mutates the passed-in Maps/arrays in-place for efficiency, then returns them.

---

### 6. **File Tree State Management**

**Initial Population** (`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`):

**Component**:
- Reads from `graphStore`: `nodes: Map<string, NodeDto>`, `workspaceFiles: string[]`, `emptyFolders: Set<string>`
- Calls `buildTree()` to construct a hierarchical tree structure

**buildTree() Process**:
1. **From graph nodes**: Iterate all nodes (skip virtual folder nodes), build tree from paths
2. **Empty folders**: Merge empty folders that have no notes (tracked in `uiStore.emptyFolders`)
3. **Workspace files**: Include non-BrainMap files from the full workspace file list
4. **Sorting**: Folders first, then alphabetical by name
5. **Counting**: Compute descendant note counts for each folder

**Tree Updates**:
- Happen reactively via `useMemo` when `nodes`, `emptyFolders`, or `workspaceFiles` change
- These values come from `graphStore`, which updates via `applyEvent()`

**Lazy Rendering**:
- `buildTree()` is memoized and only recomputed when store values change
- Tree is rendered recursively with expand/collapse and fuzzy filtering

---

### 7. **Expected Writes Mechanism**

**Purpose**: Prevent the watcher from re-processing changes the app itself made to disk

**How It Works**:
- Before any write operation (create note, update note, delete note, move note, etc.), the Tauri command registers expected writes via `state.register_expected_write(root, abs_path)`
- When the file watcher detects a change, it calls `consume_expected_write(root, &path)` in the `process_change()` function
- If the path is in the expected set, it's consumed (removed) and the event is skipped
- If not found, the event is processed normally

**Example** (from `commands.rs`):
```rust
pub async fn create_node(...) {
    let abs_path = state.with_slot(&root, |slot| Ok(slot.workspace.root.join(&params.path)))?;
    state.register_expected_write(&root, abs_path);  // Register before write
    state.with_slot_mut(&root, |slot| handlers::handle_create_note(&mut slot.workspace, params))
}
```

This prevents duplicate events from being processed after app-initiated writes.

---

### 8. **Multi-Segment Complexity**

**Background Segment Events**:
- When a file change occurs in an inactive workspace (background segment), the event still fires
- App.tsx checks `event.workspace_root` against the active workspace root
- If it doesn't match, calls `applyEventToSnapshot()` instead of `applyEvent()`
- The cached snapshot's graph state is updated so it's consistent when switched to

**Snapshot Persistence**:
- Located in `segmentStateCache.ts`: in-memory `Map<segmentId, SegmentSnapshot>`
- Snapshots include: `nodes`, `edges`, `workspaceFiles`, plus all workspace-scoped editor/UI state
- When a segment is switched to, the cached snapshot is restored to the stores
- When a segment is switched away from, current state is captured into the cache

---

### 9. **Key File Locations Summary**

| Component | File | Lines |
|-----------|------|-------|
| File watcher (Rust) | `crates/app/src-tauri/src/watcher.rs` | 1-179 |
| AppState & slots | `crates/app/src-tauri/src/state.rs` | 1-209 |
| Workspace commands | `crates/app/src-tauri/src/commands.rs` | 1-427 |
| Event listener setup | `crates/app/src/App.tsx` | 48-103 |
| Tauri bridge | `crates/app/src/api/tauri.ts` | 143-160 |
| Graph store | `crates/app/src/stores/graphStore.ts` | 1-118 |
| Event application | `crates/app/src/stores/graphDiff.ts` | 1-95 |
| Snapshot handling | `crates/app/src/stores/segmentStateCache.ts` | 1-320+ |
| File tree building | `crates/app/src/components/Layout/FileTreePanel.tsx` | 43-161 |

---

This architecture elegantly separates concerns: the file watcher detects changes, emits topology diffs, the frontend applies them reactively to stores, and the UI components (file tree, graph) automatically update through Zustand subscriptions.

---

