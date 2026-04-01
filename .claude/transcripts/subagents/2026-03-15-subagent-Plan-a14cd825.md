# 2026-03-15 — Subagent Transcript: Plan

**Date:** 2026-03-15 10:24:52
**Agent:** Plan
**Agent ID:** a14cd825378a0dafe
**Parent Session:** d67b2fdb-4b84-4388-9269-8b5152201f3a

---

## User

Design an implementation plan for drag-and-drop file/folder moving in the BrainMap desktop app's Files panel.

## Context

BrainMap is a Tauri v2 + React knowledge graph app. The file tree (FileTreePanel.tsx) renders notes and folders with context menus, expand/collapse, fuzzy search, etc. Currently there is NO drag-and-drop and NO move functionality in the desktop app.

However, the Rust backend (`crates/core/src/workspace.rs`) already has `Workspace::move_note(old_path, new_path) -> Result<Vec<String>>` which:
- Renames the file on disk
- Rewrites all backlink references in other notes
- Reconstructs graph edges (outgoing, incoming, folder nodes)
- Returns list of affected files

The CLI and MCP already expose this. The Tauri app does not.

## Current Architecture

**File tree**: FileTreePanel.tsx renders TreeNode items recursively. TreeNode = {name, fullPath, title, isFolder, children, note_type, noteCount, matchIndices}. Folders can expand/collapse. Items have context menus.

**Stores**: graphStore (nodes Map, edges), editorStore (active note, tabs), uiStore (expanded folders, empty folders), tabStore (open tabs keyed by file path), undoStore (undo/redo stack).

**API Bridge**: BrainMapAPI interface in types.ts, TauriBridge in tauri.ts. Pattern: thin Tauri command in commands.rs → handler in handlers.rs → ws.method().

**Backend AppState**: Per-slot workspace locking via `with_active_mut`. Commands pattern: `#[tauri::command] async fn cmd_name(state, params) -> Result<Response>`.

**Tab IDs = file paths**: tabStore uses file paths as tab IDs. When a note moves, its tab ID must update.

## Requirements

1. Drag notes and folders to different folders in the file tree
2. Drop on a folder to move the item into that folder
3. Drop on root area to move to workspace root
4. Visual feedback during drag (drop target highlight, drag preview)
5. Update graph, tabs, editor state after move
6. Undo support for moves
7. Handle edge cases: moving to same location (no-op), name conflicts, moving a folder that contains the active note

## Design Questions to Address

1. Should we use native HTML5 DnD or a library? (No DnD library currently in deps)
2. For folder moves: the backend only has `move_note` for individual notes. Should we:
   a. Add a `move_folder` method to the core that does bulk move
   b. Call `move_note` for each note in the folder sequentially
   c. Do a filesystem rename + workspace reload
3. How to handle tab ID updates when a moved note has an open tab?
4. What graph events to emit after a move?
5. How to integrate with the undo system?

Provide a detailed, step-by-step implementation plan covering backend (Rust), frontend (React/TypeScript), and testing.

---

## Assistant



I'll explore the codebase to understand the existing patterns before designing the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/FileTree/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/FileTree/**/*.tsx"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"move_note","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"move_note|node_move","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/FileTree*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/*Tree*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/FileTree*"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":827,"limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":926,"limit":50}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","limit":80}`

---

## Assistant

Now let me look at more of the commands/handlers pattern, the undo store, the API types, and the graph store's `applyEvent`.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub fn handle_delete|pub fn handle_create_note|pub fn handle_create_folder","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","output_mode":"content`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"applyEvent","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","offset":80,"limit":100}`

---

## Assistant

Now let me check the existing `graphDiff.ts` to understand the `topology-changed` event handling, and look at the watcher to understand how file events flow.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphDiff.ts"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"delete_note|create_folder|move_note","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts"}`

---

## Assistant

Let me check the watcher and the commands file for the `expected_writes` pattern, and see how the existing `delete_node` command works for the full pattern.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","offset":100,"limit":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs","limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","limit":60}`

---

## Assistant

Now let me check how the CLI/MCP expose move_note to understand the pattern, and look at the existing state module.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"move_note|node_move","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"register_expected_write|resolve_root|with_slot_mut","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/state.rs","output_mode":"content","-n":true}`

---

## Assistant

Let me check the segmentStateCache to understand snapshot fields, and look at the dto.rs for existing DTO patterns.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"MoveNoteResult|move_note|MoveResult","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"homeNotePath|graphFocusPath","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStateCache.ts","output_mode":"content","-n":true}`

---

## Assistant

I now have a thorough understanding of the codebase. Let me look at one more thing -- the CSS for the file tree to understand what drag-and-drop styling hooks exist.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"tree-item|tree-folder|tree-file","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-n":true,"head_limit":30}`

---

## Assistant

I have enough information. Here is the complete implementation plan.

---

## Implementation Plan: Drag-and-Drop File/Folder Moving in FileTreePanel

### Design Decisions

**1. Native HTML5 DnD vs. library**: Use native HTML5 Drag and Drop. The project has no DnD library in deps, the tree is a simple recursive structure, and the interactions are straightforward (drag item, drop on folder or root). Adding a library like `react-dnd` or `dnd-kit` would be overkill for this feature.

**2. Folder moves**: Use option (c) -- filesystem rename + full topology reload. The backend `move_note` only handles individual notes and rewrites backlinks one at a time. For a folder containing N notes, calling `move_note` N times would be fragile (partial failures, O(N^2) backlink scans). Instead:
- Add a new `Workspace::move_folder(old_folder, new_folder)` method that does `fs::rename` on the directory, then rewrites all affected backlink references in bulk, and reconstructs the graph in a single pass.
- This is atomically correct at the filesystem level (single `rename` call) and much faster.
- Fall back to individual `move_note` calls only if the folder rename fails (cross-device move).

**3. Tab ID updates**: After a move, iterate all open tabs. Any tab whose `id`/`path` starts with the old path prefix gets its `id` and `path` rewritten to the new path. Add a `renameTab(oldId, newId, newTitle?)` method to `tabStore`.

**4. Graph events**: Emit a single `topology-changed` event containing `removed_nodes` (old paths + old folder nodes), `added_nodes` (new paths + new folder nodes), `removed_edges` (all edges referencing old paths), `added_edges` (all edges with new paths). This leverages the existing `applyTopologyDiff` infrastructure.

**5. Undo**: Add a new `UndoableAction` kind `"move-note"` and `"move-folder"` that stores `{oldPath, newPath}` (or `{oldFolder, newFolder}`). Undo calls the same move API with swapped paths. This is simple and reliable because `move_note`/`move_folder` already handle backlink rewriting.

### Step-by-Step Implementation

#### Step 1: Backend -- `move_note` Tauri command + handler

**File: `crates/app/src-tauri/src/handlers.rs`**

Add `handle_move_note`:
```rust
pub fn handle_move_note(ws: &mut Workspace, old_path: &str, new_path: &str) -> Result<MoveResultDto, String> {
    let rewritten = ws.move_note(old_path, new_path)
        .map_err(|e| e.to_string())?;
    Ok(MoveResultDto { new_path: new_path.to_string(), rewritten_paths: rewritten })
}
```

**File: `crates/app/src-tauri/src/dto.rs`**

Add `MoveResultDto`:
```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct MoveResultDto {
    pub new_path: String,
    pub rewritten_paths: Vec<String>,
}
```

**File: `crates/app/src-tauri/src/commands.rs`**

Add `move_note` command following the `delete_node` pattern with `register_expected_write` for both old and new paths plus all rewritten paths:
```rust
#[tauri::command]
pub fn move_note(state: State<'_, AppState>, old_path: String, new_path: String) -> Result<MoveResultDto, String>
```
Register expected writes for: old_path (deletion), new_path (creation), and each rewritten path (backlink updates). The workspace's `move_note` already returns the list of rewritten files.

**File: `crates/app/src-tauri/src/lib.rs`**

Register the new `move_note` command in the Tauri invoke handler list.

#### Step 2: Backend -- `move_folder` core method + Tauri command

**File: `crates/core/src/workspace.rs`**

Add `Workspace::move_folder(old_folder: &str, new_folder: &str) -> Result<MoveFolderResult>` that:
1. Validates both paths (old exists as directory, new does not exist, neither escapes root)
2. Collects all note paths under `old_folder/`
3. `fs::rename(old_dir, new_dir)` -- single atomic operation
4. For each note, computes new relative path (replace `old_folder/` prefix with `new_folder/`)
5. Updates `self.notes` HashMap keys (remove old, insert new with updated `Note.path`)
6. Rewrites backlink references in all notes outside the folder that link to notes inside it
7. Rebuilds graph: remove old nodes/edges, add new nodes/edges, rebuild folder hierarchy
8. Returns `MoveFolderResult { new_folder, moved_notes: Vec<(old_path, new_path)>, rewritten_paths }` 

**File: `crates/app/src-tauri/src/handlers.rs`** -- Add `handle_move_folder`

**File: `crates/app/src-tauri/src/commands.rs`** -- Add `move_folder` command

**File: `crates/app/src-tauri/src/dto.rs`** -- Add `MoveFolderResultDto`

#### Step 3: Frontend API layer

**File: `crates/app/src/api/types.ts`**

Add to `BrainMapAPI` interface:
```typescript
moveNote(oldPath: string, newPath: string): Promise<{ new_path: string; rewritten_paths: string[] }>;
moveFolder(oldFolder: string, newFolder: string): Promise<{ new_folder: string; moved_notes: Array<[string, string]>; rewritten_paths: string[] }>;
```

**File: `crates/app/src/api/tauri.ts`**

Implement both methods using `invoke`.

#### Step 4: Store updates -- tabStore `renamePath`

**File: `crates/app/src/stores/tabStore.ts`**

Add `renamePath(oldPath: string, newPath: string)` that updates a single tab's `id` and `path`. Add `renamePathPrefix(oldPrefix: string, newPrefix: string)` for folder moves that updates all tabs whose path starts with the old prefix.

#### Step 5: Store updates -- undoStore

**File: `crates/app/src/stores/undoStore.ts`**

Add two new `UndoableAction` kinds:
```typescript
| { kind: "move-note"; oldPath: string; newPath: string }
| { kind: "move-folder"; oldFolder: string; newFolder: string }
```

Undo for `move-note`: call `api.moveNote(action.newPath, action.oldPath)` (reverse). Then update tabs/graph/editor.
Undo for `move-folder`: call `api.moveFolder(action.newFolder, action.oldFolder)` (reverse).

Redo: call the original move again.

#### Step 6: Frontend -- Move execution logic

**File: `crates/app/src/components/Layout/FileTreePanel.tsx`** (or extracted to a new utility)

Create an `executeMoveNote(oldPath, newPath)` async function that:
1. If the moved note has a dirty open tab, auto-save it first
2. Call `api.moveNote(oldPath, newPath)`
3. Reload full topology via `graphStore.loadTopology()` (simplest correct approach -- the backend already has the correct state after `move_note`)
4. Update tab IDs via `tabStore.renamePath(oldPath, newPath)`
5. If the moved note was active in the editor, update `editorStore` (re-open at new path)
6. Update `uiStore` references: `graphFocusPath`, `homeNotePath` if they match the old path
7. Push undo action

Create `executeMoveFolder(oldFolder, newFolder)` with similar logic but using prefix matching for tabs and UI state updates.

**Design choice: full topology reload vs. surgical event**. The `move_note`/`move_folder` backend methods modify the graph, rewrite backlinks in multiple files, and restructure folder nodes. Rather than trying to reconstruct the exact diff on the frontend (error-prone), reload the full topology after the move. This is the same pattern used by `open_workspace`. For a typical workspace of <1000 notes, the topology reload takes <50ms. The alternative (emitting precise events from the backend) would require significant new plumbing for marginal perf gain.

#### Step 7: Drag-and-Drop UI in FileTreePanel

**File: `crates/app/src/components/Layout/FileTreePanel.tsx`**

Add DnD to `FileTreeNode`:

**Drag source** (on every tree item -- notes and folders):
- `draggable={true}` on the `.tree-item` div
- `onDragStart`: set `dataTransfer.setData("text/plain", node.fullPath)`, set `effectAllowed = "move"`, store `draggedNode` in component state (via a ref or panel-level state)
- `onDragEnd`: clear drag state

**Drop target** (on folder items and root container):
- `onDragOver`: check if drop is valid (not dropping onto self, not dropping folder into its own descendant), call `e.preventDefault()` to allow drop, add CSS class for visual feedback
- `onDragEnter`/`onDragLeave`: manage hover highlight state (use a counter ref to handle nested elements)
- `onDrop`: compute new path, call `executeMoveNote` or `executeMoveFolder`

**Drop on root** (the `.file-tree-content` div):
- Same DnD handlers, drops move the item to workspace root

**Path computation on drop**:
- For a note `"FolderA/MyNote.md"` dropped on folder `"FolderB"`: new path = `"FolderB/MyNote.md"`
- For a folder `"FolderA"` dropped on folder `"FolderB"`: new folder = `"FolderB/FolderA"`
- For anything dropped on root: strip the directory prefix
- Check for name conflicts before calling the API (the backend also validates, but checking on the frontend gives a better UX with an immediate error message)

**Visual feedback**:
- Dragged item gets `opacity: 0.4` via a `.dragging` CSS class
- Drop target folder gets a highlighted border/background via `.drag-over` CSS class
- Invalid drop targets (self, descendant) get no highlight (drop is not prevented, so the browser shows the "no drop" cursor)

#### Step 8: CSS for drag-and-drop feedback

**File: `crates/app/src/App.css`**

Add styles:
```css
.tree-item.dragging { opacity: 0.4; }
.tree-item.drag-over { background: var(--accent-color-10); outline: 1px solid var(--accent-color); }
.file-tree-content.drag-over-root { background: var(--accent-color-05); }
```

#### Step 9: Conflict detection dialog

**File: `crates/app/src/components/Layout/MoveConflictDialog.tsx`** (new file)

A simple dialog shown when the target path already exists. Options:
- Cancel
- The backend will return `BrainMapError::DuplicatePath` which surfaces as an error string. Show a toast with the error message. No overwrite option (too dangerous).

Actually, keep this simple: just show a toast error from the catch block. No new dialog needed for v1. The backend already rejects duplicate paths.

#### Step 10: Edge case handling

1. **Same location**: Before calling the API, check if `newPath === oldPath`. If so, no-op.
2. **Dropping folder into itself or descendant**: In `onDragOver`, check `targetFolder.startsWith(draggedFolder + "/")` or `targetFolder === draggedFolder`. If so, don't call `e.preventDefault()` (browser shows "no drop" cursor).
3. **Active note inside moved folder**: After folder move, update `editorStore.activeNote.path` if it matched the old prefix. The tab rename handles the tab ID; then re-open the note at the new path.
4. **File watcher conflicts**: Register expected writes for all affected files before calling the backend, same as `delete_folder` does. The watcher's `expected_writes` set prevents double-processing.
5. **Drag during filter**: DnD should work even when the fuzzy filter is active. The drop target folder path comes from the `TreeNode.fullPath`, which is always the full path regardless of filtering.

#### Step 11: Segment state cache updates

**File: `crates/app/src/stores/segmentStateCache.ts`**

The `applyEventToSnapshot` function already handles `topology-changed` events. Since we reload topology (not emit events), no changes needed here. If a move happens in the active segment, the stores are updated directly. Background segments are unaffected (moves only happen in the active segment).

However, if we later optimize to emit events instead of reloading, update `applyEventToSnapshot` to handle path renames in `homeNotePath` and `graphFocusPath`.

#### Step 12: Testing

**Vitest unit tests** (new file: `crates/app/src/components/Layout/FileTreePanel.dnd.test.ts`):
- `computeNewPath(draggedPath, targetFolder)` -- test path computation for notes, folders, root drops
- `isValidDrop(draggedPath, draggedIsFolder, targetPath)` -- test self-drop, ancestor-into-descendant
- `tabStore.renamePath` / `renamePathPrefix` -- test tab ID updates

**Vitest unit tests** (in existing files):
- `undoStore` -- test move-note undo/redo cycle
- `tabStore` -- test renamePath and renamePathPrefix

**Rust integration tests** (`crates/core/tests/`):
- `move_folder` -- test folder rename, backlink rewriting, graph reconstruction
- `move_folder` -- test name conflict rejection
- `move_folder` -- test cross-folder move with notes that link to each other

**Tauri command test**: Manual testing via the app (DnD is hard to test programmatically without e2e framework).

#### Step 13: Documentation

Update `CLAUDE.md` current status section to mention drag-and-drop file/folder moving in Files panel.

### Implementation Order

1. Step 1 (backend move_note command) -- independent, testable
2. Step 2 (backend move_folder) -- independent, testable  
3. Step 3 (API layer) -- depends on 1-2
4. Steps 4-5 (store updates) -- depends on 3
5. Steps 6-8 (DnD UI + CSS) -- depends on 3-5
6. Steps 9-10 (edge cases) -- part of step 6-8
7. Step 12 (tests) -- concurrent with each step
8. Step 13 (docs) -- last

### Risks and Mitigations

- **Risk**: `fs::rename` fails for cross-device moves. **Mitigation**: Fall back to copy-then-delete in `move_folder`. (Unlikely in practice since all files are within the workspace.)
- **Risk**: Partial backlink rewrite failure leaves workspace inconsistent. **Mitigation**: The existing `move_note` already handles this sequentially; `move_folder` should collect errors and report partial success, same as `handle_delete_folder`.
- **Risk**: DnD browser compatibility issues (Safari). **Mitigation**: HTML5 DnD is well-supported in WebKit/Tauri webview. Test in the Tauri window.
- **Risk**: Full topology reload causes UI flicker. **Mitigation**: The graph/tree rebuilds from the nodes Map which is updated atomically via `set()`. Cytoscape may briefly re-layout; this is acceptable.

### Critical Files for Implementation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs` - Add `move_folder` method; existing `move_note` is the reference pattern
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx` - Add HTML5 DnD handlers to `FileTreeNode` and the root container
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs` - Add `move_note` and `move_folder` Tauri commands following existing patterns
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts` - Add `renamePath`/`renamePathPrefix` for tab ID updates after moves
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts` - Add `move-note` and `move-folder` undoable action kinds

---

