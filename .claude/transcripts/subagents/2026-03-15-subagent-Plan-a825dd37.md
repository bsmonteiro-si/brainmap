# 2026-03-15 — Subagent Transcript: Plan

**Date:** 2026-03-15 12:18:24
**Agent:** Plan
**Agent ID:** a825dd37ae5ae3e32
**Parent Session:** 8d73316b-3416-4b53-98d7-9a9a8c8a65ff

---

## User

## Task
Design a plan to make the Files view (file tree) in a Tauri + React desktop app update in real-time when files are created, edited, deleted, or moved — both from external sources AND from within the app itself.

## Current Architecture

### Backend (Rust/Tauri)
- File watcher in `crates/app/src-tauri/src/watcher.rs` uses `notify_debouncer_mini` with **2-second debounce**
- Watcher ONLY processes `.md` files (line 62: `event.path.extension() == Some("md")`)
- When a change is detected, it calls `process_change()` which invokes `workspace.reload_file()`, `add_file()`, or `remove_file()` to compute a `GraphDiff`
- The diff is emitted as a `"brainmap://workspace-event"` Tauri event with type `"topology-changed"`

### Expected Writes Mechanism
- Before app-initiated writes (create_node, update_node, delete_node, etc.), `register_expected_write()` is called with the absolute path
- When the watcher detects a change, `consume_expected_write()` checks if the path was expected — if yes, the event is **silently dropped**
- This means: **app-initiated mutations never emit topology events through the watcher**

### Frontend (React/Zustand)
- `graphStore` holds `nodes: Map<string, NodeDto>`, `edges: EdgeDto[]`, `workspaceFiles: string[]`
- `FileTreePanel` derives its tree from `nodes`, `emptyFolders`, and `workspaceFiles` via `useMemo(() => buildTree(...))`
- `App.tsx` subscribes to `"brainmap://workspace-event"` and calls `graphStore.applyEvent()` which uses `applyTopologyDiff()` in `graphDiff.ts`

### How App-Initiated Mutations Currently Update the UI
- **create_node**: Frontend does optimistic `graphStore.createNote(path, title, type)` — adds only the node, NO edges (missing `contains` edge from parent folder), does NOT update `workspaceFiles`
- **update_node**: No frontend event emitted. Watcher event suppressed. Only the editor's local state reflects the change.
- **delete_node**: Frontend manually calls `applyEvent({type: "node-deleted", path})` — but this is scattered in component code, not centralized
- **create_link/delete_link**: No topology event emitted to update graph edges
- **move_note/move_folder**: Does a full `loadTopology()` reload (works but heavy)
- **create_folder**: Only updates `emptyFolders` Set in uiStore — no graph event

## Identified Problems

1. **App-initiated mutations suppress watcher events but don't emit their own topology events.** The backend computes a `GraphDiff` for every mutation (create/update/delete/move) but only the watcher path emits it to the frontend. The Tauri command handlers discard the diff.

2. **Watcher only processes `.md` files.** Folder creation/deletion and non-markdown file changes are invisible to the watcher. `workspaceFiles` (which includes non-md files) is only populated at initial load.

3. **Inconsistent frontend update patterns.** Some operations do optimistic updates (incomplete), some manually emit synthetic events, some do full topology reloads. There's no single consistent pattern.

4. **2-second debounce delay for external changes.** This makes the app feel sluggish for external edits.

## Key Files
- `crates/app/src-tauri/src/watcher.rs` — file watcher (179 lines)
- `crates/app/src-tauri/src/commands.rs` — Tauri command handlers (427 lines)
- `crates/app/src-tauri/src/handlers.rs` — handler implementations
- `crates/app/src-tauri/src/state.rs` — AppState with expected_writes
- `crates/app/src/stores/graphStore.ts` — graph state store (118 lines)
- `crates/app/src/stores/graphDiff.ts` — topology diff application (95 lines)
- `crates/app/src/App.tsx` — event subscription (lines 48-103)
- `crates/app/src/components/Layout/FileTreePanel.tsx` — file tree component

## Design Constraints
- Must handle both internal (app-initiated) and external (other editors, CLI, MCP) changes
- Must support multi-segment (multiple workspaces open simultaneously)
- Must not break the existing `expected_writes` mechanism for preventing duplicates
- Backend workspace methods already return `GraphDiff` from mutations — we should use this
- Keep the architecture simple; prefer extending existing patterns over new mechanisms

## Request
Design an implementation plan that addresses all identified problems. Consider:
1. Having Tauri commands emit topology events after mutations (using the GraphDiff they already compute)
2. Extending the watcher to handle non-md files and folders
3. Reducing the debounce interval for snappier external change detection
4. Cleaning up inconsistent frontend update patterns
5. Testing strategy

---

## Assistant



I'll explore the codebase to understand the current implementation in detail before designing the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs"}`

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

Now let me look at the frontend side.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphDiff.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

Now let me check how the core workspace methods return GraphDiff, and how the frontend currently handles app-initiated mutations.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"GraphDiff","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"fn create_note|fn delete_note|fn update_note|fn create_link|fn delete_link|fn move_note|fn move_folder","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","o`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

Let me check the GraphDiff struct in the core model and how workspace methods return it vs not.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub struct GraphDiff","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs","output_mode":"content","-A":15}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":317,"limit":200}`

---

## Assistant

I can see the key issue: `create_note`, `update_note`, `delete_note`, `create_link`, `delete_link` do NOT return `GraphDiff` -- they return `Result<RelativePath>`, `Result<()>`, etc. Only `reload_file`, `add_file`, `remove_file` return `GraphDiff`. Let me verify.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"-> Result<GraphDiff>","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"fn reload_file|fn add_file|fn remove_file","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","output_mode":"content"}`

---

## Assistant

Now let me check how `write_raw_note` works (used by the editor's save) and how the frontend currently handles create_note, delete_note, create_link, delete_link calls.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"createNote|deleteNote|createLink|deleteLink|applyEvent","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"applyEvent|createNote|loadTopology","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","offset":440,"limit":120}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/LinksEditor.tsx","offset":75,"limit":50}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CreateNoteDialog.tsx","offset":110,"limit":50}`

---

## Assistant

Now let me look at the delete handling in FileTreePanel more closely and check the DTO structures.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":1040,"limit":70}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":750,"limit":60}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs","limit":50}`

---

## Assistant

Now I have a thorough understanding. Let me check one more thing -- the `write_raw_note` handler to confirm it discards the GraphDiff.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":647,"limit":100}`

---

## Assistant

I now have a complete understanding of the architecture. Let me present the implementation plan.

---

## Implementation Plan: Real-Time File Tree Updates

### Problem Summary

The file tree (and graph) reactivity has a fundamental architectural gap: app-initiated mutations suppress the file watcher via `expected_writes`, but nothing replaces the suppressed event. The backend computes state changes correctly but discards the information at the Tauri command boundary. Additionally, the watcher ignores non-md files and folders, and uses a 2-second debounce.

### Approach: Backend Emits Events After Mutations

The cleanest fix is to make the mutating Tauri commands emit `"brainmap://workspace-event"` events themselves, using the same `TopologyChangedPayload` format the watcher already uses. This way the frontend receives topology diffs through a single channel regardless of whether the change was internal or external.

---

### Step 1: Extract `emit_topology_event` helper in `watcher.rs`

Currently `TopologyChangedPayload`, `NodeDtoPayload`, `EdgeDtoPayload`, and `edge_to_payload` are private to `watcher.rs`. They need to be made `pub(crate)` so that `commands.rs` can build and emit the same payloads.

Alternatively (and better), extract a standalone function:

```rust
pub(crate) fn emit_topology_diff(
    app: &tauri::AppHandle,
    workspace_root: &str,
    diff: &GraphDiff,
) -> Result<(), String>
```

This function builds the `TopologyChangedPayload` from the `GraphDiff` and calls `app.emit(...)`. Both the watcher's `process_change` and the Tauri commands will call this.

**Files**: `/crates/app/src-tauri/src/watcher.rs`

---

### Step 2: Make `create_note`, `update_note`, `delete_note` return topology information

The core workspace methods do not return `GraphDiff` for CRUD operations (only `reload_file`/`add_file`/`remove_file` do). Rather than modifying the core library (which would be a cross-cutting change affecting CLI and MCP), the Tauri handler layer should construct minimal topology payloads from the information it already has.

For each command:

**`create_node`**: After `handle_create_note` succeeds, read back the node from `slot.workspace.graph` to get the full `NodeData` (including tags), then build a payload with the added node plus its `contains` edges. The handler approach:

```rust
// After create succeeds, read back the created node + its edges
let node_data = slot.workspace.graph.get_node(&rp).cloned();
let edges = slot.workspace.graph.edges_for(&rp, &Direction::Both);
```

Then emit a `topology-changed` event with `added_nodes: [node]`, `added_edges: [contains edges + any others]`.

**`update_node`**: After `handle_update_note` succeeds, read back the updated node. Emit a synthetic `topology-changed` with the updated node in `added_nodes` (adding an already-existing node path is an upsert in the frontend's `applyTopologyDiff`). If title/type/tags changed, the node data in the graph is already updated by `update_note`, so we just need to re-read it and emit.

For edge changes from `update_note` (which does not change links -- that goes through `create_link`/`delete_link`), we can skip edge diffing.

**`delete_node`**: After `handle_delete_note` succeeds, emit `topology-changed` with `removed_nodes: [path]` and `removed_edges` for all edges that referenced this node. The handler should collect the edges BEFORE calling delete (since delete removes them from the graph).

**`create_link`**: After `handle_create_link` succeeds, emit `topology-changed` with `added_edges: [{source, target, rel, kind: "Explicit"}]`.

**`delete_link`**: After `handle_delete_link` succeeds, emit `topology-changed` with `removed_edges: [{source, target, rel, kind: "Explicit"}]`.

**`delete_folder`**: After `handle_delete_folder` succeeds, emit `topology-changed` with all deleted paths in `removed_nodes` and their edges in `removed_edges`. Edges should be collected before deletion.

**`move_note` / `move_folder`**: These already do `loadTopology()` on the frontend. With the new pattern, they should emit a `topology-changed` event instead. However, moves are complex (old node removed, new node added, edges rewritten). The simplest correct approach for moves: emit a diff with `removed_nodes: [old paths]` + `added_nodes: [new nodes]` + `removed_edges: [old edges]` + `added_edges: [new edges]`. Since the workspace state is already updated after `move_note`/`move_folder`, we can read the new state from the graph to construct the "added" side.

**`write_raw_note`**: This calls `workspace.reload_file()` which already returns `GraphDiff`. The handler currently discards it. Instead, pass the diff to `emit_topology_diff`. Also include the updated node in `added_nodes` (since `reload_file`'s diff has empty `added_nodes` for existing nodes but we need to propagate title/type changes).

**Files**: `/crates/app/src-tauri/src/commands.rs`, `/crates/app/src-tauri/src/handlers.rs`

**Key design decision**: The Tauri commands need access to `AppHandle` to emit events. Currently they only receive `State<'_, AppState>`. Two options:
- (a) Add `app: tauri::AppHandle` parameter to every mutating command
- (b) Store the `AppHandle` inside `AppState`

Option (a) is cleaner since Tauri automatically injects `AppHandle` parameters. The commands already use `State<'_,AppState>` which is auto-injected; adding `app: tauri::AppHandle` is the same pattern.

---

### Step 3: Remove frontend optimistic/manual update code

Once the backend emits events for all mutations, the scattered frontend code becomes redundant and should be removed:

1. **`graphStore.createNote()`** -- Remove this method entirely. The `topology-changed` event from the backend will add the node AND its `contains` edge.

2. **Manual `applyEvent` calls in components** -- Remove from:
   - `CreateNoteDialog.tsx` (line 125: `createNote(...)`, line 145: `applyEvent(edge-created)`)
   - `LinksEditor.tsx` (lines 86, 111: `applyEvent(edge-created/edge-deleted)`)
   - `FileTreePanel.tsx` (lines 1061, 1083, 1097: `applyEvent(node-deleted)`)
   - `editorStore.ts` (lines 453, 547: `applyEvent(node-updated)`)

3. **`loadTopology()` calls after move** -- Remove from `FileTreePanel.tsx` (lines 765, 794) since the backend event will handle it.

4. **Keep** the `applyEvent` action in `graphStore` and the event listener in `App.tsx` -- these are the single correct pathway.

**Files**: `CreateNoteDialog.tsx`, `LinksEditor.tsx`, `FileTreePanel.tsx`, `editorStore.ts`, `graphStore.ts`

---

### Step 4: Extend watcher to handle non-md files and folders

The current watcher filter (line 62) only passes `.md` files. To support the full file tree:

**4a. Track non-md file changes**: Extend the watcher callback to also forward events for non-md files. However, non-md files don't go through `Workspace` methods (no `add_file`/`remove_file`). Instead, emit a new lightweight event type for `workspaceFiles` updates.

Add a new event type `"files-changed"` to the Tauri event channel:
```rust
struct FilesChangedPayload {
    event_type: &'static str, // "files-changed"
    workspace_root: String,
    added_files: Vec<String>,
    removed_files: Vec<String>,
}
```

On the frontend, add this to `WorkspaceEvent`:
```typescript
| { type: "files-changed"; added_files: string[]; removed_files: string[]; workspace_root?: string }
```

And handle in `applyTopologyDiff`:
```typescript
case "files-changed": {
  let newFiles = workspaceFiles.filter(f => !new Set(event.removed_files).has(f));
  for (const f of event.added_files) {
    if (!newFiles.includes(f)) newFiles.push(f);
  }
  return { nodes, edges, workspaceFiles: newFiles };
}
```

**4b. Track folder creation/deletion**: Folder events from the watcher need to trigger `ensure_folder_nodes` / `prune_empty_folder_nodes` on the workspace. But since folders are virtual graph nodes created from directory structure, the simplest approach is: when the watcher sees a directory create/delete event, check if it affects the graph folder nodes and emit accordingly.

However, `notify_debouncer_mini` may not reliably report directory events on all platforms. A pragmatic approach: when the watcher detects ANY `.md` file change, the `add_file`/`remove_file` methods already call `ensure_folder_nodes`/`prune_empty_folder_nodes`, so folder nodes are updated as a side effect. The only gap is empty folder creation (no `.md` files), which is already tracked via `emptyFolders` Set in `uiStore`. For external empty folder creation, this is an acceptable limitation.

**Files**: `watcher.rs`, `api/types.ts`, `graphDiff.ts`

---

### Step 5: Reduce watcher debounce interval

Change from 2 seconds to 500ms. This is the `Duration::from_secs(2)` on line 58 of `watcher.rs`. The `notify_debouncer_mini` coalesces rapid events, so 500ms should still prevent event storms while feeling responsive.

Consider making it configurable via an environment variable for testing, but 500ms is a good default.

**Files**: `watcher.rs` (single constant change)

---

### Step 6: Handle `workspaceFiles` updates for app-initiated mutations

`workspaceFiles` is only loaded at initial topology fetch and never updated during app-initiated mutations. With the backend now emitting `topology-changed` events, the frontend's `applyTopologyDiff` already updates `workspaceFiles` in the `"topology-changed"` case (lines 80-87 of `graphDiff.ts`). This should work correctly once the backend emits these events.

For plain file operations (`create_plain_file`, `write_plain_file`), the backend should emit `files-changed` events to keep `workspaceFiles` in sync.

**Files**: `commands.rs` (for plain file commands), `graphDiff.ts`

---

### Step 7: Edge collection before deletion

For `delete_node` and `delete_folder`, the Tauri commands need to collect the edges BEFORE calling the handler (which removes them from the graph). This requires restructuring the command functions slightly:

```rust
// In delete_node command:
let edges_before = state.with_slot(&root, |slot| {
    let rp = RelativePath::new(&path);
    Ok(slot.workspace.graph.edges_for(&rp, &Direction::Both)
        .into_iter().cloned().collect::<Vec<_>>())
})?;
// Then call handle_delete_note
// Then emit topology-changed with removed_nodes + removed_edges
```

**Files**: `commands.rs`

---

### Step 8: Update `NodeDtoPayload` to include tags

The current `NodeDtoPayload` in `watcher.rs` includes `tags`, but the frontend's `NodeDto` type does not have `tags`. Since `NodeDto` is `{ path, title, note_type }`, and `NodeDtoPayload` has `tags`, there's a mismatch. Either:
- Add `tags` to the frontend `NodeDto` type (small breaking change but useful), OR
- Keep the payload as-is and let tags fall through (they're silently ignored by TypeScript)

The `NodeDto` on the frontend already doesn't have `tags` and works fine for graph rendering. The tags are in `NodeSummary` which is loaded on demand. So this can stay as-is for now.

---

### Step 9: Testing Strategy

**Backend (Rust) tests**:
1. Unit test `emit_topology_diff` helper builds correct payloads from `GraphDiff`
2. Integration test that each mutating command emits the correct event (mock or capture `AppHandle` emissions)

**Frontend (Vitest) tests**:
1. Add `"files-changed"` case to existing `graphDiff.test.ts`
2. Test that removing manual `applyEvent` calls from components doesn't break (existing component tests may need updating to verify they no longer call `applyEvent`)
3. Test `applyTopologyDiff` with `topology-changed` events that include `contains` edges (verifying file tree correctness)

**Manual/integration tests**:
1. Create a note in the app -- file tree and graph update immediately
2. Delete a note -- disappears from file tree and graph
3. Edit a note's title -- graph node label updates
4. Create/delete a link -- graph edge appears/disappears
5. Move a note/folder -- tree and graph update without full reload
6. Edit a file externally (e.g., in VS Code) -- changes appear within ~500ms
7. Create a file externally -- appears in file tree
8. Delete a file externally -- disappears from file tree
9. Multi-segment: verify events route to correct segment

---

### Implementation Order

1. **Step 1** (extract `emit_topology_diff` helper) -- foundational, no behavioral change
2. **Step 5** (reduce debounce to 500ms) -- simple, independent
3. **Step 2** (make commands emit events) -- the core fix, largest change
4. **Step 7** (edge collection before deletion) -- needed by Step 2
5. **Step 3** (remove frontend manual updates) -- cleanup after Step 2 works
6. **Step 4** (extend watcher for non-md files) -- independent enhancement
7. **Step 6** (workspaceFiles sync) -- depends on Steps 2 and 4
8. **Step 9** (tests) -- throughout, but especially after Steps 2 and 3

---

### Risks and Mitigations

1. **Double events**: If `expected_writes` fails to suppress a watcher event AND the command also emits, we get duplicate updates. Mitigation: the `topology-changed` handler in `applyTopologyDiff` is idempotent for nodes (Map upsert) and mostly idempotent for edges (duplicates could accumulate). Add edge dedup in `applyTopologyDiff` to be safe.

2. **Event ordering**: The backend event emitted by the command happens synchronously before the command returns to the frontend. The frontend may process the event before the `await` on the command resolves. This is fine since the event handler and the calling code both update the same Zustand store atomically.

3. **Move complexity**: Moves touch many files and edges. Rather than computing a perfect diff, consider keeping `loadTopology()` for move operations initially and optimizing later.

4. **Platform differences**: `notify` behavior varies across macOS/Linux/Windows. The debounce reduction to 500ms should be tested on the target platform.

---

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs` - Extract event emission helper, make payload types pub(crate), reduce debounce
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs` - Add AppHandle param to mutating commands, emit topology events after mutations
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphDiff.ts` - Add "files-changed" event type, ensure idempotent edge handling
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CreateNoteDialog.tsx` - Remove manual createNote/applyEvent calls (pattern to follow for cleanup in LinksEditor, FileTreePanel, editorStore)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts` - Add "files-changed" to WorkspaceEvent union type

---

