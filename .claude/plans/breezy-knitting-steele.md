# Rename Files & Folders — Implementation Plan

## Context

Add VS Code / Obsidian-style inline rename to the file tree for both notes and folders. The existing `move_note` and `move_folder` backend APIs already handle same-directory renames (physical rename, backlink rewriting, graph reconstruction), so **no Rust backend changes are needed**. This is a frontend-only feature.

## Approach

Inline editing in the file tree: when rename is triggered, the tree item label becomes an editable `<input>`, pre-selected. Enter/blur confirms, Escape cancels. The rename operation delegates to the existing `moveNote`/`moveFolder` API, reusing the same tab/editor/graph/undo sync logic as drag-and-drop move.

## Steps

### 1. Create pure utility functions

**New file: `crates/app/src/utils/fileTreeRename.ts`**

- `computeRenamePath(oldPath, newName, isFolder)` — returns new relative path (same parent dir + new name). Three cases:
  - **Folders**: no extension appended
  - **BrainMap notes** (`.md` files): appends `.md`, strips it if the user already typed it (prevents `foo.md.md`)
  - **Plain files**: preserves original extension from `oldPath` (e.g., `.txt`, `.json`)
- `validateRenameName(name, oldPath, isFolder, existingPaths)` — returns error string or null. Checks: empty, path separators (`/`, `\`), leading dot, duplicate path. No-op (same name) returns null.

### 2. Add `InlineRenameInput` component

**In `FileTreePanel.tsx`**, add a small component:

- Renders an `<input>` with `className="tree-item-rename-input"`
- Auto-focuses and selects all text on mount via `useEffect`
- Initial value: `node.name` (already without `.md` for notes, plain name for folders)
- Enter → `onConfirm(value)`, Escape → `onCancel()`, blur → `onConfirm(value)`
- **Double-fire guard**: use a `resolvedRef` (useRef boolean). On Enter, set `resolvedRef.current = true` then call `onConfirm`. On Escape, set `resolvedRef.current = true` then call `onCancel`. Blur handler checks `resolvedRef.current` — if true, no-op. This prevents the classic Enter+blur double-fire and Escape+blur cancel-then-confirm bugs.
- `stopPropagation` on click/keydown to prevent tree item handlers

### 3. Add `renamingPath` state & thread through components

**In `FileTreePanel` component:**

- Add `const [renamingPath, setRenamingPath] = useState<string | null>(null)`
- Thread `renamingPath`, `onRenameConfirm`, `onRenameCancel` as props to `FileTreeNode`

**In `FileTreeNode`:**

- Add `renamingPath`, `onRenameConfirm`, `onRenameCancel` to prop interface (following same pattern as `onContextMenu`, `onActionsClick`)
- When `renamingPath === node.fullPath`, render `<InlineRenameInput>` instead of `<span className="tree-item-label">`
- Suppress `draggable`, `onClick`, `onContextMenu` on the tree item div during rename

### 4. Add "Rename" to context menus

Add `onRename` callback prop to `ContextMenu` component interface (following the `onDelete` pattern).

Add a "Rename" item in all three node-type branches:

- **Folders** (line ~291): between "Focus in Graph" and the separator before "Delete Folder"
- **BrainMap notes** (line ~319): between "Set/Unset Home Note" and the separator before "Delete"
- **Plain files** (line ~326): add "Rename" item

Handler: `onClose(); onRename(state.node);`

### 5. Extract shared move orchestration & add `executeRenameItem`

Rather than duplicating the ~50 lines of tab/editor/graph/undo sync logic from `executeMoveItem`, **extract a shared helper** `executeMoveOrRename(oldPath, newPath, isFolder)` that both `executeMoveItem` and `executeRenameItem` call. This helper handles:

- Dirty tab save + dirty tab check (for folders)
- API call (`moveNote`/`moveFolder`)
- Graph topology reload
- Tab rename (`renamePath`/`renamePathPrefix`)
- Editor, graph focus, home note sync
- Undo push

`executeRenameItem` then becomes thin:

1. Validate name via `validateRenameName()` — show toast on error; if save fails, abort rename
2. Compute new path via `computeRenamePath()`
3. If no change (same name), cancel silently
4. Call `executeMoveOrRename(oldPath, newPath, isFolder)`
5. **Update `treeExpandedFolders`** for folder renames — iterate the Set and replace any path that equals `oldPath` or starts with `oldPath + "/"` with the new prefix (handles descendant subfolders)
6. **Update `emptyFolders`** — same prefix-based replacement
7. Clear `renamingPath`

### 6. Add F2 keyboard shortcut

Add `onKeyDown` handler on the file tree panel root div:

- F2 (when not already renaming) → get `selectedNodePath` from graphStore or `activePlainFile?.path` from editorStore
- **Guard**: if no path is available, F2 is a no-op
- Otherwise `setRenamingPath(path)`
- Not a global listener — only fires when file tree panel has focus

### 7. Add CSS for inline rename input

**In `App.css`**, add `.tree-item-rename-input` styles:

- `flex: 1; min-width: 0` to fill the tree item row
- Inherit font from tree items
- Accent border + box-shadow for visibility
- Match tree item padding so no layout shift

### 8. Add tests

**New file: `crates/app/src/utils/fileTreeRename.test.ts`** (~15 tests):

Pure utility tests:
- `computeRenamePath`: note in subfolder, note at root, folder in subfolder, folder at root, plain file (preserves extension), user types `.md` suffix on note (no double `.md`)
- `validateRenameName`: empty, slash, backslash, leading dot, duplicate, valid, no-op (same name)

Component tests (in same file or separate):
- `InlineRenameInput`: Enter calls `onConfirm` exactly once (no double-fire on blur)
- `InlineRenameInput`: Escape does not trigger `onConfirm` (blur after Escape is no-op)

### 9. Update CLAUDE.md

Add rename feature to Current Status section.

## Files

| File | Action |
|------|--------|
| `crates/app/src/utils/fileTreeRename.ts` | **Create** — pure utilities |
| `crates/app/src/utils/fileTreeRename.test.ts` | **Create** — unit tests (~15) |
| `crates/app/src/components/Layout/FileTreePanel.tsx` | **Modify** — context menu items, `InlineRenameInput` component, `renamingPath` state, `executeRenameItem` fn, extract shared `executeMoveOrRename`, F2 handler, prop threading |
| `crates/app/src/App.css` | **Modify** — `.tree-item-rename-input` styles |
| `CLAUDE.md` | **Modify** — status update |

## Key Details

- `node.name` is already without `.md` for notes (stripped at `buildTree` line 71)
- `node.fullPath` includes `.md` for notes (e.g., `Concepts/causation.md`)
- `node.fullPath` for folders has no trailing slash (e.g., `Concepts`)
- Undo uses existing `move-note`/`move-folder` action kinds — no new undo logic needed
- File watcher events after rename are no-ops because `loadTopology()` is called synchronously
- Plain files (non-`.md`) keep their original extension; `computeRenamePath` extracts it from `oldPath`

## Verification

1. **Manual testing**: Right-click file → Rename → type new name → Enter. Verify:
   - File renamed on disk, tree updated
   - Tab title/ID updated if file was open
   - Backlinks in other notes rewritten
   - Graph node updated
   - Undo (Cmd+Z) reverses the rename
2. **Folder rename**: Same flow. Verify expanded state preserved (including child subfolders), all child tabs updated.
3. **F2 shortcut**: Select a file in tree, press F2, verify inline input appears. Press F2 with nothing selected — no-op.
4. **Escape**: Start rename, press Escape, verify no changes (no rename executed).
5. **Validation**: Try empty name, name with `/`, duplicate name — verify toast errors.
6. **Plain file rename**: Rename a `.txt` or `.json` file — verify extension preserved.
7. **Run tests**: `cd crates/app && npx vitest run src/utils/fileTreeRename.test.ts`
