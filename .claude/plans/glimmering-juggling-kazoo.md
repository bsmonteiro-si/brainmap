# Plan: Drag-and-Drop File/Folder Moving in Files Panel

## Context

The user wants to move files and folders between directories in the Files panel via drag-and-drop, like regular editors (VS Code, Obsidian). The backend `Workspace::move_note()` already exists and handles file rename, backlink rewriting, and graph reconstruction — but it's only exposed via CLI and MCP, not the desktop app. No drag-and-drop infrastructure exists in the frontend.

## Approach

Fix a bug in `move_note` (outgoing links), wire it to the Tauri layer, add `move_folder` to core, then implement HTML5 native drag-and-drop in FileTreePanel. Full topology reload after moves (simple, correct).

---

## Step 0: Fix `move_note` — Rewrite Moved Note's Own Outgoing Links

**File:** `crates/core/src/workspace.rs` (lines 890-894)

**Bug:** When a note moves from `A/Note.md` to `B/Sub/Note.md`, `move_note` updates `note.path` but does NOT rewrite the note's own `frontmatter.links[].target` values. These are relative paths (e.g., `../Concepts/X.md`) that resolve differently from the new location, silently breaking all outgoing links.

**Fix:** After `note.path = new_rp.clone()` (line 891), iterate `note.frontmatter.links` and rewrite each `link.target` using `compute_relative_target(&new_rp, &resolved_target)` where `resolved_target` is the absolute-in-workspace path that the old relative target pointed to (resolved from `old_rp`).

```rust
// Rewrite the moved note's own outgoing link targets
for link in &mut note.frontmatter.links {
    let abs_target = old_rp.resolve_relative(&link.target);
    link.target = compute_relative_target(&new_rp, &abs_target);
}
```

**Tests:** Add a test that moves a note with outgoing relative links and verifies they still resolve to the same targets from the new location. Run existing `move_note` CLI/MCP tests to confirm no regressions.

## Step 1: Backend — `move_note` Tauri Command

**Files:** `commands.rs`, `handlers.rs`, `dto.rs`, `lib.rs`

Add `MoveNoteResultDto` to `dto.rs`:
```rust
#[derive(Serialize, Deserialize)]
pub struct MoveNoteResultDto {
    pub new_path: String,
    pub rewritten_paths: Vec<String>,
}
```

Add handler in `handlers.rs`:
```rust
pub fn handle_move_note(ws: &mut Workspace, old_path: &str, new_path: &str)
    -> Result<MoveNoteResultDto, String>
```

Add Tauri command in `commands.rs` following the `delete_node` pattern — `resolve_root`, register expected writes for old + new path, call `with_slot_mut`, then register writes for the returned `rewritten_paths` after the call. Register in `lib.rs` invoke handler.

**Expected writes strategy:** Register old_path and new_path before the call. The rewritten paths aren't known until `move_note` returns, so register them after. The file watcher's debounce window (typically ~500ms) provides enough buffer since the writes already happened by the time we register. This matches the pattern where `move_note` writes files synchronously, then we register after.

## Step 2: Backend — `move_folder` Core Method + Tauri Command

**File:** `crates/core/src/workspace.rs`

Add `Workspace::move_folder(old_folder: &str, new_folder: &str) -> Result<MoveFolderResult>`:

1. Validate: old folder dir exists on disk, new folder does not exist, neither escapes root
2. Call `create_dir_all` for new folder's parent directory
3. Collect all note paths under `old_folder/` prefix from `self.notes`
4. `fs::rename(old_dir, new_dir)` — single directory rename
5. For each note: compute new relative path (replace `old_folder/` prefix with `new_folder/`). Call the same internal logic as `move_note` — update note path, rewrite own outgoing link targets, update graph node, re-add non-implicit edges, sync index. **Reuse:** Factor out a helper `move_note_internal` from `move_note` that handles the in-memory/graph/index portion (everything after the filesystem rename). Both `move_note` and `move_folder` call this helper.
6. Rewrite backlinks: find all notes *outside* the folder that reference notes *inside* it, rewrite their frontmatter links, write to disk
7. Rebuild folder hierarchy: `ensure_folder_nodes` for new paths, `prune_empty_folder_nodes` for old paths
8. Return `MoveFolderResult { new_folder, moved_notes: Vec<(String, String)>, rewritten_paths: Vec<String> }`

**Error recovery:** If `fs::rename` succeeds but a subsequent backlink rewrite fails (e.g., disk full), do a full workspace reload from disk (`self.load()` equivalent) to re-sync in-memory state with the actual filesystem. This is the simplest correct recovery and matches the app's "full topology reload" approach.

**Files:** `commands.rs`, `handlers.rs`, `dto.rs` — same pattern as `move_note` command. Pre-register expected writes for all notes under the folder prefix + the folder directory itself. Post-register rewritten paths.

**Known limitation:** `fs::rename` fails with `EXDEV` across filesystems. Surface a clear error: "Cannot move across filesystem boundaries."

## Step 3: Frontend API Layer

**File:** `crates/app/src/api/types.ts`

Add to `BrainMapAPI`:
```typescript
moveNote(oldPath: string, newPath: string): Promise<{
    new_path: string; rewritten_paths: string[];
}>;
moveFolder(oldFolder: string, newFolder: string): Promise<{
    new_folder: string; moved_notes: [string, string][]; rewritten_paths: string[];
}>;
```

**File:** `crates/app/src/api/tauri.ts` — implement via `invoke("move_note", ...)` and `invoke("move_folder", ...)`.

## Step 4: Tab Store — Path Rename

**File:** `crates/app/src/stores/tabStore.ts`

Add two actions:
- `renamePath(oldPath, newPath)` — find tab by `id === oldPath`, update its `id`, `path`, and derive new `title` from path
- `renamePathPrefix(oldPrefix, newPrefix)` — update all tabs whose `path` starts with `oldPrefix + "/"` (note: trailing slash prevents false prefix matches like `A` matching `A-extra/`)

## Step 5: Undo Store — Move Actions

**File:** `crates/app/src/stores/undoStore.ts`

Add two new `UndoableAction` kinds:
```typescript
| { kind: "move-note"; oldPath: string; newPath: string }
| { kind: "move-folder"; oldFolder: string; newFolder: string }
```

Undo = call move API with swapped paths. Redo = call with original paths. Update `actionLabel`.

**Safety guards:** Catch `DuplicatePath` errors during undo/redo and show a toast: "Cannot undo: a file already exists at the original location." This handles cases where a new note was created at the old path after the move.

## Step 6: Move Execution Logic + Utilities

**New file:** `crates/app/src/utils/fileTreeDnd.ts` — pure functions, no React dependency

- `computeNewPath(draggedPath, targetFolder, isFolder)`: compute destination path
  - Note `"A/Note.md"` → folder `"B"` → `"B/Note.md"`
  - Folder `"A"` → folder `"B"` → `"B/A"`
  - Anything → root (`""`) → strip directory prefix
- `isValidDrop(draggedPath, draggedIsFolder, targetFolder)`:
  - Same resulting path → false
  - Folder into itself or descendant (`target.startsWith(dragged + "/")`) → false

**File:** `crates/app/src/components/Layout/FileTreePanel.tsx` — move execution helpers

`executeMoveNote(oldPath, newPath)`:
1. Cancel any pending auto-save debounce for the note, then `await saveNote()` synchronously if dirty
2. Call `api.moveNote(oldPath, newPath)`
3. Reload full topology via `graphStore.loadTopology()`
4. Update tab via `tabStore.renamePath(oldPath, newPath)`
5. If active note matches old path → re-open at new path
6. Update `uiStore.graphFocusPath` and `homeNotePath` if they match old path
7. Push undo action
8. Show toast: `Moved "Title" to FolderName`

`executeMoveFolder(oldFolder, newFolder)`:
- Same pattern but uses `moveFolder` API, `renamePathPrefix` for tabs, prefix matching for UI state

**Note:** Moves only apply to the active segment (uses `with_active_mut`). Segment snapshots are captured on switch, so the live store updates are picked up correctly.

## Step 7: HTML5 Drag-and-Drop in FileTreePanel

**File:** `crates/app/src/components/Layout/FileTreePanel.tsx`

Add to `FileTreeNode` (`.tree-item` div):

**Drag source** (all items — notes and folders):
- `draggable={true}` on `.tree-item`
- `onDragStart`: `setData("application/brainmap-path", fullPath)` + `setData("application/brainmap-is-folder", isFolder ? "1" : "0")`, set `effectAllowed = "move"`, store dragged path in panel-level ref
- `onDragEnd`: clear drag state ref, clear all timers

**Drop target** (folders + root container):
- `onDragOver`: validate with `isValidDrop`, call `e.preventDefault()` if valid
- `onDragEnter`/`onDragLeave`: manage `dragOverPath` state with enter/leave counter ref (handles nested child elements)
- `onDrop`: extract path from `dataTransfer`, compute new path, call `executeMoveNote` or `executeMoveFolder`

**Root drop zone**: `.file-tree-content` container handles drops for "move to root" (targetFolder = `""`).

**Auto-expand on hover**: When dragging over a collapsed folder for >600ms, auto-expand it via `setTimeout`. Clear timers in `onDragLeave`, `onDragEnd`, and `useEffect` cleanup.

## Step 8: CSS for Drag-and-Drop Feedback

**File:** `crates/app/src/App.css`

```css
.tree-item[draggable="true"] { cursor: grab; }
.tree-item.dragging { opacity: 0.4; }
.tree-item.drag-over {
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  outline: 1px dashed var(--accent);
  border-radius: 4px;
}
.file-tree-content.drag-over-root {
  background: color-mix(in srgb, var(--accent) 8%, transparent);
}
```

## Step 9: Testing

**Rust tests** (`crates/core/tests/`):
- `move_note` outgoing link rewriting (Step 0 fix) — move note with relative links, verify they resolve to same targets
- `move_folder` — basic rename, contained notes updated, backlink rewriting for external notes
- `move_folder` — nested subfolders preserved
- `move_folder` — name conflict rejection
- `move_folder` — notes inside folder with links pointing outside get rewritten correctly
- `move_folder` — notes outside with links pointing inside get rewritten correctly

**Vitest unit tests** (`crates/app/src/utils/fileTreeDnd.test.ts`):
- `computeNewPath` — note to folder, note to root, folder to folder, folder to root, root-level note to root (no-op)
- `isValidDrop` — self-drop, descendant drop, valid drop, root drop, prefix collision (`A` vs `A-extra`)

**Vitest unit tests** (existing test files):
- `tabStore` — `renamePath`, `renamePathPrefix`, prefix-collision safety
- `undoStore` — move-note undo/redo, move-folder undo/redo, undo when target path occupied (shows error toast)

**Vitest integration tests** (`FileTreePanel.dnd.test.ts`):
- `executeMoveNote` with mocked API — verify: auto-save called if dirty, API called with correct paths, topology reloaded, tab renamed, editor updated, undo pushed
- `executeMoveFolder` — same verifications with prefix matching

**Manual testing**: drag notes/folders in the app, verify graph updates, tab renames, undo/redo.

## Step 10: Documentation

Update `CLAUDE.md` current status to mention drag-and-drop file/folder moving in Files panel + outgoing link fix.

---

## Critical Files

| File | Change |
|------|--------|
| `crates/core/src/workspace.rs` | Fix `move_note` outgoing links, add `move_folder`, factor out `move_note_internal` |
| `crates/app/src-tauri/src/commands.rs` | Add `move_note`, `move_folder` commands |
| `crates/app/src-tauri/src/handlers.rs` | Add `handle_move_note`, `handle_move_folder` |
| `crates/app/src-tauri/src/dto.rs` | Add `MoveNoteResultDto`, `MoveFolderResultDto` |
| `crates/app/src-tauri/src/lib.rs` | Register new commands |
| `crates/app/src/api/types.ts` | Add `moveNote`, `moveFolder` to interface |
| `crates/app/src/api/tauri.ts` | Implement bridge methods |
| `crates/app/src/utils/fileTreeDnd.ts` | New — `computeNewPath`, `isValidDrop` pure functions |
| `crates/app/src/stores/tabStore.ts` | Add `renamePath`, `renamePathPrefix` |
| `crates/app/src/stores/undoStore.ts` | Add move action kinds with safety guards |
| `crates/app/src/components/Layout/FileTreePanel.tsx` | Add DnD handlers + move execution |
| `crates/app/src/App.css` | Add drag/drop visual feedback styles |

## Verification

1. `cargo test -p brainmap-core` — existing + new move tests pass (outgoing link fix, move_folder)
2. `cargo test -p brainmap` — CLI move tests still pass
3. `cargo test -p brainmap-mcp` — MCP move tests still pass
4. `cargo check --manifest-path crates/app/src-tauri/Cargo.toml` — Tauri compiles
5. `cd crates/app && npx vitest run` — all Vitest tests pass
6. Manual: drag a note between folders → verify file tree, graph, tabs, undo
7. Manual: drag a folder into another folder → verify all contained notes moved, backlinks updated
8. Manual: move a note with outgoing links → verify links still work from new location
