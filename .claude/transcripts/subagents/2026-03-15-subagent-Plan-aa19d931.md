# 2026-03-15 — Subagent Transcript: Plan

**Date:** 2026-03-15 12:03:28
**Agent:** Plan
**Agent ID:** aa19d931a0c241f18
**Parent Session:** 259b1f85-bfcc-4fcf-bee8-9f79a9a2aa3f

---

## User

Design an implementation plan for adding a rename feature (files and folders) to the BrainMap desktop app.

## Key Finding: No Backend Changes Needed

The existing `move_note(old_path, new_path)` and `move_folder(old_folder, new_folder)` in `workspace.rs` already handle same-directory renames perfectly. They:
- Physically rename on disk
- Rewrite all backlinks in other notes
- Update the moved note's own outgoing links
- Rebuild graph nodes/edges
- Handle folder nodes (ensure/prune)

The Tauri commands (`move_note`, `move_folder`) already exist with path validation.

The frontend already has:
- `api.moveNote(oldPath, newPath)` and `api.moveFolder(oldFolder, newFolder)` in TauriBridge
- `tabStore.renamePath()` and `tabStore.renamePathPrefix()` for tab ID updates
- `postMoveCleanup()` in undoStore for editor/graph/home note sync
- Undo support for move-note and move-folder actions
- `executeMoveItem()` in FileTreePanel that orchestrates the full move flow

## UI Design: Inline Rename

The most natural UX (matching VS Code/Obsidian) is inline editing in the file tree:

### Triggering
1. **Context menu**: Add "Rename" item to both file and folder context menus in FileTreePanel
2. **Keyboard shortcut**: F2 when a file/folder is selected (or Enter key, matching Finder)
3. **Slow double-click**: Optional — double-click with delay (not a fast double-click which opens)

### Inline Edit Behavior
- When rename is triggered, the tree item's label becomes an editable input field
- The filename (without extension for notes, full name for folders) is pre-selected
- Enter confirms, Escape cancels
- Clicking outside confirms (blur handler)
- Validation: no empty names, no `/` or path separators, check for duplicates

### Execution
- Compute new path: same parent directory + new name (+ `.md` extension for notes)
- Reuse the same orchestration as drag-and-drop move:
  - Call `api.moveNote()` or `api.moveFolder()`
  - Reload graph topology
  - Update tabs via `renamePath()` / `renamePathPrefix()`
  - Sync editor/graph/home note
  - Push undo action (reuses existing move-note/move-folder undo kinds)

### State Management
- Add `renamingPath: string | null` to UIStore (or local state in FileTreePanel)
- When set, the tree item at that path renders an input instead of a label

## Files to Modify

1. **`crates/app/src/components/Layout/FileTreePanel.tsx`** (~988 lines):
   - Add "Rename" context menu items for files and folders
   - Add inline rename input rendering (conditional on `renamingPath` state)
   - Add `executeRenameItem()` function (similar to `executeMoveItem()`)
   - Add keyboard handler for F2
   - Add blur/enter/escape handlers on rename input

2. **`crates/app/src/components/Layout/FileTreePanel.css`**:
   - Styles for inline rename input (match tree item sizing/font)

3. **Tests**: Add Vitest tests for:
   - Rename path computation (pure utility)
   - Context menu rendering with rename option
   - Validation logic (empty name, duplicates, invalid chars)

## Constraints
- Must handle the case where the renamed note is currently open in a tab
- Must handle renaming a folder that contains the currently active note
- Must update graph focus if the focused node is renamed
- Must update home note reference if home note is renamed
- Extension `.md` should be preserved for notes (user edits just the stem)
- Folders have no extension

Please provide a detailed step-by-step implementation plan.

---

## Assistant



I'll explore the relevant files to understand the current implementation before detailing the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/fileTreeDnd.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

Now let me look at a few more key files to understand the existing patterns.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts","limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts","limit":60}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.css","limit":50}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.css"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts","offset":60,"limit":80}`

---

## Assistant

Let me check the `renamePath` method in tabStore and the graph context menu for rename patterns.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"renamePath","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts","output_mode":"content","-A":15}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"postMoveCleanup","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts","output_mode":"content","-A":30}`

---

## Assistant

Now let me check the CSS file for existing tree item styles.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"tree-item|tree-file|tree-folder","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":3,"head_limit":80}`

---

## Assistant

I now have a thorough understanding of the codebase. Here is the detailed implementation plan.

---

## Implementation Plan: Inline Rename for Files and Folders

### Overview

Add VS Code / Obsidian-style inline rename to the file tree. No backend changes are needed -- the existing `move_note` and `move_folder` APIs already handle same-directory renames (physical rename, backlink rewriting, graph reconstruction). The work is purely frontend.

### Step 1: Add `renamingPath` state to `FileTreePanel`

Add local component state to `FileTreePanel`:

```ts
const [renamingPath, setRenamingPath] = useState<string | null>(null);
```

This is local state (not in uiStore) because it is entirely transient UI -- it never needs to survive across component unmounts or be accessed by other components. This matches how `contextMenu`, `deleteTarget`, `draggedPath` etc. are already managed locally.

### Step 2: Add "Rename" to context menus

In the `ContextMenu` component, add a "Rename" menu item for both files and folders. Insert it before the separator that precedes the Delete item, in all three branches (folder, brainmap note, and plain file):

- **Folder branch** (line ~288): Add `Rename` item between "Focus in Graph" and the separator before "Delete Folder"
- **BrainMap note branch** (line ~319): Add `Rename` item between "Set as Home Note" and the separator before "Delete"
- **Plain file branch** (line ~326): Add `Rename` item (currently this branch has no delete, so just add it)

The handler:
```ts
const handleRename = () => {
  if (!state.node) return;
  onClose();
  onRename(state.node);
};
```

This requires adding an `onRename` callback prop to `ContextMenu`, which the parent `FileTreePanel` sets to `(node) => setRenamingPath(node.fullPath)`.

### Step 3: Create a pure `computeRenamePath` utility

Add to `crates/app/src/utils/fileTreeDnd.ts` (or a new `fileTreeRename.ts` if preferred, but the DnD file already has path computation utilities):

```ts
export function computeRenamePath(
  oldPath: string,
  newName: string,
  isFolder: boolean,
): string {
  const parts = oldPath.split("/");
  parts[parts.length - 1] = isFolder ? newName : newName + ".md";
  return parts.join("/");
}

export function validateRenameName(
  name: string,
  oldPath: string,
  isFolder: boolean,
  existingPaths: Set<string>,
): string | null {
  // Returns error message or null if valid
  const trimmed = name.trim();
  if (!trimmed) return "Name cannot be empty";
  if (trimmed.includes("/") || trimmed.includes("\\")) return "Name cannot contain path separators";
  if (trimmed.startsWith(".")) return "Name cannot start with a dot";
  
  const newPath = computeRenamePath(oldPath, trimmed, isFolder);
  if (newPath === oldPath) return null; // No change — will be treated as cancel
  if (existingPaths.has(newPath)) return "A file with this name already exists";
  
  return null;
}
```

### Step 4: Create `InlineRenameInput` component

Create a small inline component (can live inside `FileTreePanel.tsx` or as a separate file). This replaces the label span when `renamingPath` matches:

```tsx
function InlineRenameInput({
  node,
  onConfirm,
  onCancel,
}: {
  node: TreeNode;
  onConfirm: (newName: string) => void;
  onCancel: () => void;
}) {
  // For notes: strip .md extension; for folders: use full name
  const initialName = node.isFolder
    ? node.name
    : node.name; // node.name is already without .md (see buildTree line 71)
  const [value, setValue] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus and select all text on mount
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation(); // Prevent tree item keyboard handlers
    if (e.key === "Enter") {
      e.preventDefault();
      onConfirm(value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <input
      ref={inputRef}
      className="tree-item-rename-input"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => onConfirm(value)} // Blur confirms (matches VS Code behavior)
      onClick={(e) => e.stopPropagation()} // Don't trigger tree item click
    />
  );
}
```

### Step 5: Modify `FileTreeNode` to render inline input

Pass `renamingPath` and `onRename`/`onRenameConfirm`/`onRenameCancel` props down to `FileTreeNode`. When `renamingPath === node.fullPath`, replace the `<span className="tree-item-label">` with `<InlineRenameInput>`.

For **folders** (line ~428):
```tsx
{renamingPath === node.fullPath
  ? <InlineRenameInput node={node} onConfirm={onRenameConfirm} onCancel={onRenameCancel} />
  : <span className="tree-item-label">{node.name}</span>
}
```

For **files** (line ~507):
```tsx
{renamingPath === node.fullPath
  ? <InlineRenameInput node={node} onConfirm={onRenameConfirm} onCancel={onRenameCancel} />
  : <span className="tree-item-label">{label}</span>
}
```

Also: when `renamingPath === node.fullPath`, suppress `draggable`, `onClick`, and `onContextMenu` on the tree item div to prevent conflicts during rename.

### Step 6: Add `executeRenameItem` function

Add to `FileTreePanel` component, modeled directly on the existing `executeMoveItem`:

```ts
const executeRenameItem = useCallback(async (oldPath: string, newName: string, isFolder: boolean) => {
  const trimmed = newName.trim();
  
  // Build set of existing paths for duplicate checking
  const existingPaths = new Set<string>();
  for (const [p] of nodes) existingPaths.add(p);
  for (const f of emptyFolders) existingPaths.add(f);
  
  const error = validateRenameName(trimmed, oldPath, isFolder, existingPaths);
  if (error) {
    if (computeRenamePath(oldPath, trimmed, isFolder) !== oldPath) {
      // Show error toast (only if it's not a no-op)
      useUndoStore.setState((prev) => ({
        toastMessage: `Rename failed: ${error}`,
        toastKey: prev.toastKey + 1,
      }));
    }
    setRenamingPath(null);
    return;
  }
  
  const newPath = computeRenamePath(oldPath, trimmed, isFolder);
  if (newPath === oldPath) {
    // No change — just cancel
    setRenamingPath(null);
    return;
  }
  
  // Delegate to the same move infrastructure
  // For notes: oldPath="dir/old.md", newPath="dir/new.md"
  // For folders: extract parent and compute old/new folder names
  const api = await getAPI();
  const editorState = useEditorStore.getState();
  
  try {
    if (isFolder) {
      // Save active note if inside folder and dirty
      const prefix = oldPath + "/";
      if (editorState.activeNote?.path.startsWith(prefix) && editorState.isDirty) {
        await editorState.saveNote();
      }
      // Check for dirty non-active tabs
      const otherDirtyTabs = useTabStore.getState().tabs.filter(
        (t) => t.path.startsWith(prefix) && t.isDirty && t.path !== editorState.activeNote?.path
      );
      if (otherDirtyTabs.length > 0) {
        useUndoStore.setState((prev) => ({
          toastMessage: `Cannot rename: ${otherDirtyTabs.length} unsaved file(s) in folder. Save them first.`,
          toastKey: prev.toastKey + 1,
        }));
        setRenamingPath(null);
        return;
      }
      
      await api.moveFolder(oldPath, newPath);
      await useGraphStore.getState().loadTopology();
      useTabStore.getState().renamePathPrefix(oldPath, newPath);
      
      // Update editor/graph/home note
      const activeNote = useEditorStore.getState().activeNote;
      if (activeNote && activeNote.path.startsWith(prefix)) {
        const newActivePath = newPath + "/" + activeNote.path.slice(prefix.length);
        useEditorStore.getState().openNote(newActivePath);
      }
      const ui = useUIStore.getState();
      if (ui.graphFocusPath?.startsWith(prefix) || ui.graphFocusPath === oldPath) {
        ui.clearGraphFocus();
      }
      if (ui.homeNotePath?.startsWith(prefix)) {
        ui.setHomeNote(newPath + "/" + ui.homeNotePath.slice(prefix.length));
      }
      // Update expanded folders set
      const expandedFolders = ui.treeExpandedFolders;
      if (expandedFolders.has(oldPath)) {
        const next = new Set(expandedFolders);
        next.delete(oldPath);
        next.add(newPath);
        // Also update any sub-folder expansions
        for (const f of expandedFolders) {
          if (f.startsWith(prefix)) {
            next.delete(f);
            next.add(newPath + "/" + f.slice(prefix.length));
          }
        }
        useUIStore.setState({ treeExpandedFolders: next });
      }
      // Update empty folders set
      const ef = ui.emptyFolders;
      const nextEf = new Set<string>();
      let changed = false;
      for (const f of ef) {
        if (f === oldPath) {
          nextEf.add(newPath);
          changed = true;
        } else if (f.startsWith(prefix)) {
          nextEf.add(newPath + "/" + f.slice(prefix.length));
          changed = true;
        } else {
          nextEf.add(f);
        }
      }
      if (changed) useUIStore.setState({ emptyFolders: nextEf });
      
      useUndoStore.getState().pushAction({ kind: "move-folder", oldFolder: oldPath, newFolder: newPath });
    } else {
      // Save dirty note before renaming
      if (editorState.activeNote?.path === oldPath && editorState.isDirty) {
        await editorState.saveNote();
      }
      
      await api.moveNote(oldPath, newPath);
      await useGraphStore.getState().loadTopology();
      useTabStore.getState().renamePath(oldPath, newPath);
      
      if (useEditorStore.getState().activeNote?.path === oldPath) {
        useEditorStore.getState().openNote(newPath);
        useGraphStore.getState().selectNode(newPath);
      }
      const ui = useUIStore.getState();
      if (ui.graphFocusPath === oldPath) ui.setGraphFocus(newPath, "note");
      if (ui.homeNotePath === oldPath) ui.setHomeNote(newPath);
      
      useUndoStore.getState().pushAction({ kind: "move-note", oldPath, newPath });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log.error("components::FileTreePanel", "rename failed", { message: msg });
    useUndoStore.setState((prev) => ({
      toastMessage: `Rename failed: ${msg}`,
      toastKey: prev.toastKey + 1,
    }));
  }
  
  setRenamingPath(null);
}, [nodes, emptyFolders]);
```

Note: This is very similar to `executeMoveItem` but includes two additional things that `executeMoveItem` misses for renames: (1) updating `treeExpandedFolders` so the renamed folder stays expanded, and (2) updating `emptyFolders`. Consider extracting a shared helper, but given the minor differences, keeping them separate is acceptable for now.

### Step 7: Add F2 keyboard shortcut

Add a `useEffect` in `FileTreePanel` that listens for F2 on the file tree container:

```ts
// In FileTreePanel, add a ref for the container and a keydown handler
const panelRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "F2" && !renamingPath) {
      // Rename the currently selected item
      const selectedPath = useGraphStore.getState().selectedNodePath
        ?? useEditorStore.getState().activePlainFile?.path;
      if (selectedPath) {
        e.preventDefault();
        setRenamingPath(selectedPath);
      }
    }
  };
  const el = panelRef.current;
  el?.addEventListener("keydown", handleKeyDown);
  return () => el?.removeEventListener("keydown", handleKeyDown);
}, [renamingPath]);
```

Attach `panelRef` to the root `<div className="file-tree-panel">`.

F2 triggers rename on whichever item is currently selected in the graph store (i.e., the highlighted file tree item). This is simple and predictable.

### Step 8: Add CSS for inline rename input

Add to `App.css`:

```css
.tree-item-rename-input {
  flex: 1;
  min-width: 0;
  font: inherit;
  font-size: inherit;
  padding: 0 2px;
  margin: 0;
  border: 1px solid var(--accent);
  border-radius: 2px;
  background: var(--bg-primary);
  color: var(--text-primary);
  outline: none;
  box-shadow: 0 0 0 1px var(--accent);
}
```

This should match the tree item label sizing so the input doesn't cause layout shift.

### Step 9: Add tests

Create `crates/app/src/utils/fileTreeRename.test.ts` (or add to `fileTreeDnd.test.ts`):

1. `computeRenamePath` -- note rename computes correct path (preserves parent, appends .md)
2. `computeRenamePath` -- folder rename computes correct path (no extension)
3. `computeRenamePath` -- root-level note
4. `computeRenamePath` -- root-level folder
5. `validateRenameName` -- empty name returns error
6. `validateRenameName` -- name with slash returns error
7. `validateRenameName` -- name with backslash returns error
8. `validateRenameName` -- name starting with dot returns error
9. `validateRenameName` -- duplicate path returns error
10. `validateRenameName` -- valid name returns null
11. `validateRenameName` -- same name (no-op) returns null

### Step 10: Update CLAUDE.md

Update the Current Status section to document the rename feature: inline rename in file tree via context menu and F2, reusing move_note/move_folder backend, with undo support via existing move actions.

### Edge Cases and Considerations

1. **Renamed note is currently open in a tab**: Handled by `renamePath()` on tabStore, which updates tab ID and path. Then `openNote(newPath)` re-reads from disk.

2. **Renamed folder contains the active note**: Handled by `renamePathPrefix()` on tabStore, then `openNote()` with the new path.

3. **Graph focus on renamed item**: Handled by the same logic as `executeMoveItem` -- `setGraphFocus(newPath, ...)` or `clearGraphFocus()`.

4. **Home note is renamed**: Handled by `ui.setHomeNote(newPath)`.

5. **Extension handling**: `buildTree` strips `.md` from note paths at line 71, so `node.name` is already without extension. The `computeRenamePath` function adds `.md` back for notes.

6. **Folder expansion state after rename**: Must update `treeExpandedFolders` set (replacing old path with new path), or the renamed folder will appear collapsed. This is something `executeMoveItem` does NOT handle, so the rename function adds this.

7. **Concurrent edits**: The `saveNote()` call before rename ensures dirty state is flushed. Dirty non-active tabs in a folder block the rename (same guard as folder move).

8. **Undo**: Reuses existing `move-note` and `move-folder` undo action kinds, so undo/redo works automatically.

9. **Empty folder tracking**: If an empty folder is renamed, the `emptyFolders` set in uiStore must be updated.

10. **File watcher events**: After rename, the backend file watcher will fire remove+add events. Since `loadTopology()` is called synchronously after the API call, the watcher events should be no-ops (graph already updated).

### Files to Create

- `crates/app/src/utils/fileTreeRename.ts` -- pure utility functions (`computeRenamePath`, `validateRenameName`)
- `crates/app/src/utils/fileTreeRename.test.ts` -- ~11 unit tests

### Files to Modify

- `crates/app/src/components/Layout/FileTreePanel.tsx` -- context menu "Rename" items, `InlineRenameInput` component, `executeRenameItem` function, F2 handler, prop threading
- `crates/app/src/App.css` -- `.tree-item-rename-input` styles

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx` - Main file to modify: context menu, inline input, rename orchestration, F2 handler
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/fileTreeDnd.ts` - Pattern reference for pure path utilities (`computeNewPath`, `isValidDrop`)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts` - Already has `renamePath`/`renamePathPrefix` methods to call
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts` - Already has `move-note`/`move-folder` undo kinds and `postMoveCleanup` helper
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` - Add inline rename input styles

---

