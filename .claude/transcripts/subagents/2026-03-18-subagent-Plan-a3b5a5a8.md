# 2026-03-18 — Subagent Transcript: Plan

**Date:** 2026-03-18 17:20:16
**Agent:** Plan
**Agent ID:** a3b5a5a8afe696f71
**Parent Session:** 26b25b6a-d4c2-4af3-aa3e-99baee782263

---

## User

Design an implementation plan for adding drag-to-reorder files within the same folder in the BrainMap file tree panel.

## Current State

### File Tree Panel (`crates/app/src/components/Layout/FileTreePanel.tsx`, ~1353 lines)
- Uses HTML5 native drag-and-drop
- `handleDragStart` sets `application/brainmap-path` and `application/brainmap-is-folder` in dataTransfer
- `handleFolderDrop` handles drops onto folders (moves files between folders)
- `handleRootDrop` handles drops onto workspace root
- `executeMoveItem` calls `executeMoveOrRename` which does filesystem move + graph reload
- `FileTreeNode` renders each row with drag handlers attached to folder rows only (via `onFolderDragOver`, `onFolderDragEnter`, `onFolderDrop`)
- Note rows are draggable but only folders have drop targets currently

### Sorting (`FileTreePanel.tsx` lines 153-174)
- `sortChildren()` sorts tree nodes by name or modified date (4 modes)
- `FileSortOrder` type: `"name-asc" | "name-desc" | "modified-desc" | "modified-asc"`
- Sorting is purely frontend, computed on every render via `buildTree()`
- Persisted in `uiStore` → localStorage as `brainmap:uiPrefs`

### Data Model
- No `sort_order` or `position` field in Note/Frontmatter
- Tree is rebuilt from `nodes: Map<string, NodeDto>` + `emptyFolders` + `workspaceFiles`
- `TreeNode` interface: `{name, fullPath, title, isFolder, children, note_type?, modified?, noteCount?, matchIndices?}`

### DnD Utilities (`utils/fileTreeDnd.ts`)
- `computeNewPath(draggedPath, targetFolder, isFolder)` - computes new path after move
- `isValidDrop(draggedPath, draggedIsFolder, targetFolder)` - validates drop target

## Requirements
- Allow dragging a file/folder to reorder it within the same parent folder
- Show a visual drop indicator (line between items) when dragging to reorder
- Persist the custom order so it survives app restarts
- When custom order is active, the sort dropdown should reflect this (e.g., "Custom" option)
- Existing cross-folder DnD must continue to work
- The reorder should work for both files and folders within the same parent

## Design Constraints
- This is a frontend-only feature. The custom order should be persisted in localStorage (per-segment), NOT in frontmatter or backend
- Keep it simple: store an ordered array of filenames per folder path
- When sort mode is anything other than "custom", reordering via drag should auto-switch to "custom" mode
- When items are added/removed, the custom order should gracefully handle missing/new entries (new items go to the end, missing items are pruned)

## Key Design Decisions to Make
1. How to detect "reorder within same folder" vs "move to different folder" during drag
2. Where to show the drop indicator (above/below items)
3. How to store the custom order map (folder path → ordered child names)
4. How to integrate with the existing `buildTree` + `sortChildren` flow

Please provide a detailed step-by-step implementation plan with specific file changes needed.

---

## Assistant



I'll explore the codebase to understand the current implementation before designing the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":100}`

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

Now let me read the drag-and-drop related parts of FileTreePanel and the sortChildren function.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":100,"limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":200,"limit":200}`

---

## Assistant

Now let me read the drag-and-drop handlers and the FileTreeNode component.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"handleDragStart|handleDragOver|handleDragEnter|handleDragLeave|handleDrop|handleFolderDrop|handleRootDrop|executeMoveItem|onFolderDrag","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":785,"limit":120}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":520,"limit":130}`

---

## Assistant

Let me read the note file row rendering and the rest of the component for the root drop area.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":649,"limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":1030,"limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":1280,"limit":80}`

---

## Assistant

Now let me check the segment state cache to understand how per-segment state is handled, and the CSS for drag styling.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"drag-over|dragging|\\.tree-item","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-n":true,"context":2}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":726,"limit":60}`

---

## Assistant

Now let me check the segment state caching to understand per-segment persistence.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"brainmap:customOrder|brainmap:fileOrder|customOrder","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.test.ts","limit":50}`

---

## Assistant

Now let me check the segment store to understand the per-segment key pattern.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"brainmap:segments|segmentState|SegmentSnapshot","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStore.ts","limit":30}`

---

## Assistant

I have enough context now. Let me look at one more thing -- the `executeMoveItem` function to understand how it calls the move API.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":935,"limit":50}`

---

## Assistant

I now have a thorough understanding of the codebase. Here is the implementation plan.

---

## Implementation Plan: Drag-to-Reorder Files Within Same Folder

### Overview

Add the ability to drag files and folders to reorder them within the same parent folder in the FileTreePanel. This is a frontend-only feature using localStorage for persistence. A new "Custom" sort mode is introduced that activates automatically when the user reorders via drag.

### Key Design Decisions

**1. Detecting reorder vs. cross-folder move:** During `dragover`, compute whether the dragged item and the hovered item share the same parent folder. If yes, treat it as a reorder operation. If the hover target is a folder (and the dragged item is not a sibling of that folder, or the drag is over the folder's main row), treat it as the existing cross-folder move. The critical signal is the vertical position of the cursor relative to each tree row: top 25% = "insert above", bottom 25% = "insert below", middle 50% on a folder = "drop into folder" (existing behavior). For non-folder rows, any position triggers reorder since files are not drop targets for cross-folder moves today.

**2. Drop indicator positioning:** Show a thin horizontal line (2px accent-colored) between items. Use a state variable `dropIndicator: { parentFolder: string; beforeIndex: number } | null` that tells the renderer where to draw the line. The line is rendered as a CSS pseudo-element or a thin `<div>` inserted at the correct position within the children list.

**3. Custom order storage:** A new localStorage key `brainmap:fileOrder:<segmentId>` stores a JSON object: `Record<string, string[]>` mapping folder path (or `""` for root) to an ordered array of child **names** (not full paths). This is per-segment so different workspaces have independent orders.

**4. Integration with `buildTree` + `sortChildren`:** When `fileSortOrder` is `"custom"`, `sortChildren` looks up the custom order for each folder and sorts children by their position in that array. Items not in the array go to the end (alphabetical among themselves). The `buildTree` function already receives `sortOrder` -- we add a second parameter for the custom order map.

### Step-by-Step Implementation

#### Step 1: Extend `FileSortOrder` type and UI

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`**

- Add `"custom"` to the `FileSortOrder` union type: `"custom" | "name-asc" | "name-desc" | "modified-desc" | "modified-asc"`
- Add a new state field `customFileOrder: Record<string, string[]>` (folder path to ordered child names)
- Add actions:
  - `setCustomFileOrder(folderPath: string, orderedNames: string[]): void` -- updates the map for one folder and persists
  - `loadCustomFileOrder(segmentId: string): void` -- loads from localStorage on segment open
  - `clearCustomFileOrder(): void` -- for resetWorkspaceState
- Persistence: use a dedicated localStorage key `brainmap:fileOrder:<segmentId>` so it does not bloat `brainmap:uiPrefs`. The `setCustomFileOrder` action writes the full map back on each change.
- When `setFileSortOrder` is called with a non-custom value, we do NOT clear the custom order map (user might switch back).

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`** (sort dropdown)

- Add `<option value="custom">Custom</option>` to the sort `<select>` at line 1289.

#### Step 2: Update `sortChildren` in `buildTree`

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`**

- Change `buildTree` signature to accept an optional `customOrder?: Record<string, string[]>` parameter.
- In `sortChildren`, when `sortOrder === "custom"` and a custom order exists for the current folder path:
  1. Build an index map from the order array: `name -> position`
  2. Sort children: items with a position come first (sorted by position), items without a position come after (sorted alphabetically). Folders-first rule still applies within each group.
  3. Recurse into children with the same logic.
- If `sortOrder === "custom"` but no custom order exists for a folder, fall back to `name-asc`.
- The folder path for root items is `""`, for nested items it is the parent's `fullPath`.

To make this work, `sortChildren` needs to know the parent folder path. Currently it only receives `items` and `sortOrder`. Refactor it to also accept `parentPath: string`:

```typescript
function sortChildren(items: TreeNode[], sortOrder: string, parentPath: string, customOrder?: Record<string, string[]>): TreeNode[] {
```

Each recursive call passes `n.fullPath` as the `parentPath` for that node's children.

#### Step 3: Add reorder DnD state and detection logic

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`**

Add new state variables to `FileTreePanel`:
- `reorderIndicator: { parentFolder: string; beforeName: string | null } | null` -- `null` means no indicator. `beforeName` is the name of the sibling the dragged item will be inserted before; `null` means insert at end.

Add a new utility function (can go in `fileTreeDnd.ts`):

```typescript
export function getParentFolder(fullPath: string): string {
  const idx = fullPath.lastIndexOf("/");
  return idx === -1 ? "" : fullPath.substring(0, idx);
}

export function isSameFolder(pathA: string, pathB: string): boolean {
  return getParentFolder(pathA) === getParentFolder(pathB);
}
```

#### Step 4: Add drag-over hit zone detection on ALL tree rows

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`**

Currently, only folder rows have `onDragOver`/`onDragEnter`/`onDrop`. We need to add these to file (note) rows as well, but only for reorder purposes.

Add new callbacks passed to `FileTreeNode`:
- `onReorderDragOver: (e: React.DragEvent, node: TreeNode) => void`
- `onReorderDrop: (e: React.DragEvent, node: TreeNode) => void`

In `onReorderDragOver`:
1. If `draggedPath` is null or equals the hovered node's path, return.
2. Compute whether the dragged item and the hovered item are siblings (same parent folder).
3. If they are siblings:
   - Get the cursor's Y position relative to the hovered row element using `e.currentTarget.getBoundingClientRect()`.
   - Compute `ratio = (e.clientY - rect.top) / rect.height`.
   - For **file rows**: if ratio < 0.5, indicator = "before this item"; else indicator = "after this item".
   - For **folder rows**: if ratio < 0.25, indicator = "before this item" (reorder); if ratio > 0.75, indicator = "after this item" (reorder); else it is a "drop into folder" (existing behavior, show folder highlight).
   - Set `reorderIndicator` state accordingly. Call `e.preventDefault()` to allow the drop.
4. If they are NOT siblings: for folder rows, fall through to existing `handleFolderDragOver` behavior. For file rows, do nothing (not a valid drop).

In `onReorderDrop`:
1. Read the reorder indicator state.
2. If it indicates a reorder (not a folder-drop):
   - Compute the new custom order for that parent folder.
   - Call `setCustomFileOrder(parentFolder, newOrder)`.
   - If current sort mode is not "custom", auto-switch to "custom" via `setFileSortOrder("custom")`.
3. If it indicates a folder-drop, delegate to existing `handleFolderDrop`.
4. Clear drag state.

#### Step 5: Compute new order on drop

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/fileTreeDnd.ts`**

Add a pure function:

```typescript
export function computeReorderedList(
  currentOrder: string[],   // current ordered names for this folder
  draggedName: string,       // name being dragged
  targetName: string,        // name of the item at the drop position
  position: "before" | "after",
): string[] {
  // Remove draggedName from current position
  const without = currentOrder.filter(n => n !== draggedName);
  // Find target index
  const targetIdx = without.indexOf(targetName);
  if (targetIdx === -1) return currentOrder; // safety
  const insertIdx = position === "before" ? targetIdx : targetIdx + 1;
  without.splice(insertIdx, 0, draggedName);
  return without;
}
```

Also add a function to initialize a custom order from the current tree state:

```typescript
export function initCustomOrderFromTree(children: TreeNode[]): string[] {
  return children.map(c => c.name);
}
```

When a reorder drop happens and there is no existing custom order for that folder, first snapshot the current visible order (which respects the active sort), then apply the reorder to that snapshot.

#### Step 6: Render the drop indicator line

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`**

In the `FileTreeNode` component, add a thin indicator `<div>` before or after the row element when `reorderIndicator` matches:

- Pass `reorderIndicator` as a prop to `FileTreeNode`.
- Before rendering a tree item row, check if the reorder indicator says "before this item's name in this item's parent folder". If so, render a `<div className="reorder-indicator" />` before the row.
- Similarly for "after" (render after the row).

Alternatively, a simpler approach: add a CSS class to the tree item row itself. When the indicator says "before", add class `reorder-above`; when "after", add `reorder-below`. Use CSS `::before` / `::after` pseudo-elements to draw the line.

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`**

Add styles:

```css
.tree-item.reorder-above::before {
  content: "";
  position: absolute;
  top: 0;
  left: 8px;
  right: 8px;
  height: 2px;
  background: var(--accent);
  border-radius: 1px;
  pointer-events: none;
}

.tree-item.reorder-below::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 8px;
  right: 8px;
  height: 2px;
  background: var(--accent);
  border-radius: 1px;
  pointer-events: none;
}
```

This requires `.tree-item` to have `position: relative` (add if not already present).

#### Step 7: Handle custom order reconciliation

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`** (in `setCustomFileOrder`)

When files are added or removed from the workspace (detected by `buildTree` seeing names not in the custom order or custom order having names that no longer exist):

- `sortChildren` already handles this: names in the order array that don't match any child are skipped; children with names not in the order array are appended at the end alphabetically.
- No explicit reconciliation action is needed -- the sort logic is resilient by design.

#### Step 8: Wire into `FileTreePanel` and `buildTree`

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`**

- Read `customFileOrder` from `useUIStore` alongside `fileSortOrder`.
- Pass it to `buildTree`:
  ```typescript
  const tree = useMemo(
    () => buildTree(nodes, emptyFolders, workspaceFiles, fileSortOrder, customFileOrder),
    [nodes, emptyFolders, workspaceFiles, fileSortOrder, customFileOrder],
  );
  ```
- Update `FileTreeNode` props to include `reorderIndicator` and `onReorderDragOver`/`onReorderDrop`.
- On both folder and file rows, attach `onDragOver` and `onDrop` that call the unified reorder/move detection logic.

#### Step 9: Load custom order on segment open

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts`** (or wherever segment open is orchestrated)

After a segment is opened, call `useUIStore.getState().loadCustomFileOrder(segmentId)` to hydrate the custom order from localStorage.

Also in `resetWorkspaceState`, clear the in-memory `customFileOrder` (but do NOT delete it from localStorage -- it should persist for next open).

#### Step 10: Tests

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/fileTreeDnd.test.ts`** (new or extend existing)

- Test `computeReorderedList` with various scenarios: move first to last, last to first, middle to middle, before/after semantics.
- Test `getParentFolder` and `isSameFolder`.
- Test `initCustomOrderFromTree`.

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.test.ts`** (extend existing)

- Test `buildTree` with `sortOrder="custom"` and a custom order map.
- Test that missing names are appended alphabetically.
- Test that extra names in custom order (deleted files) are gracefully ignored.
- Test folders-first rule still applies within custom sort.

### Edge Cases

1. **Dragging the only item in a folder**: No reorder needed, should be a no-op (same position).
2. **Dragging across folders while custom sort is active**: Cross-folder move still works as before; the custom order for the source folder has the item removed, and the target folder gets it appended at the end.
3. **Filter active**: When the filter input has text, reordering should be disabled (the filtered view is not the real order). Detect `filter.trim() !== ""` and skip reorder logic.
4. **Renaming an item**: After rename, the custom order contains the old name. The reconciliation in `sortChildren` handles this: old name is not found among children (skipped), new name has no position (appended at end). To improve UX, `executeRenameItem` should update the custom order map by replacing the old name with the new name.
5. **Moving an item out of a folder**: `executeMoveItem` should remove the item from the source folder's custom order and optionally append to the target folder's custom order.

### Files Changed Summary

| File | Change |
|------|--------|
| `crates/app/src/stores/uiStore.ts` | Add `"custom"` to `FileSortOrder`, add `customFileOrder` state + actions, persistence |
| `crates/app/src/components/Layout/FileTreePanel.tsx` | Add reorder DnD state, hit-zone detection, indicator rendering, pass custom order to `buildTree`, update `sortChildren`, add "Custom" sort option, update `FileTreeNode` props |
| `crates/app/src/utils/fileTreeDnd.ts` | Add `getParentFolder`, `isSameFolder`, `computeReorderedList`, `initCustomOrderFromTree` |
| `crates/app/src/App.css` | Add `.reorder-above`, `.reorder-below` indicator styles, ensure `.tree-item` has `position: relative` |
| `crates/app/src/components/Layout/FileTreePanel.test.ts` | Add tests for custom sort in `buildTree` |
| `crates/app/src/utils/fileTreeDnd.test.ts` | New file or extend: tests for reorder utility functions |

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx` - Core component: DnD handlers, hit-zone detection, indicator rendering, sortChildren modification
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts` - State management: FileSortOrder type extension, customFileOrder state, persistence actions
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/fileTreeDnd.ts` - Pure utility functions: reorder computation, parent folder detection
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` - Visual feedback: drop indicator line styles
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.test.ts` - Test coverage: buildTree with custom sort, edge cases

---

