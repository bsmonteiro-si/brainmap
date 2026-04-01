# Fix: Folder Undo/Redo Not Updating Files View

## Context

Undo/redo for folder operations shows the toast message but the Files view doesn't update. Notes work fine. The root cause is that `undoStore` never syncs `emptyFolders` in uiStore — the file tree renders folders from two sources: `nodes` (graphStore) and `emptyFolders` (uiStore). Folder operations only touch the API but not `emptyFolders`.

## Fix

**File:** `crates/app/src/stores/undoStore.ts`

4 places need `emptyFolders` sync:

1. **Undo create-folder** (~line 177): After `api.deleteFolder()`, call `useUIStore.getState().removeEmptyFolder(action.folderPath)` to remove it from the tree.

2. **Redo create-folder** (~line 259): After `api.createFolder()`, call `useUIStore.getState().addEmptyFolder(action.folderPath)` so the folder appears in the tree.

3. **Undo delete-folder** (~line 204): After restoring all notes, if `action.snapshots.length === 0` (folder was empty when deleted), call `useUIStore.getState().addEmptyFolder(action.folderPath)`.

4. **Redo delete-folder** (~line 288): After deleting, remove the folder and child folders from `emptyFolders` (same pattern as FileTreePanel.tsx lines 429-440).

## Existing utilities to reuse

- `useUIStore.getState().addEmptyFolder(path)` — adds a folder to the `emptyFolders` Set
- `useUIStore.getState().removeEmptyFolder(path)` — removes a folder from `emptyFolders`
- FileTreePanel cleanup pattern (lines 429-440) for removing folder + children from `emptyFolders`

## Verification

- `cd crates/app && npx vitest run` — all tests pass
- Manual: create folder → Cmd+Z → folder disappears → Cmd+Y → folder reappears
- Manual: delete folder (with and without notes) → Cmd+Z → folder + notes restored → Cmd+Y → folder deleted again
