# Fix All Three Drag-and-Drop Modes

## Context

External drag-and-drop between the BrainMap app and macOS Finder is broken. Dragging files from Finder into the app causes WKWebView to navigate to the file (replacing the entire UI). Dragging files from the app to Finder doesn't work. Internal file tree drag (reorder/move) works but only because `dragDropEnabled: false`.

The root cause is a Tauri v2 architectural constraint: `dragDropEnabled` is mutually exclusive on macOS WKWebView. With `true`, Tauri intercepts all drag events (breaking HTML5 internal drag). With `false`, WKWebView handles external drops natively (navigating away). Nine previous attempts failed trying to work around this constraint.

**The solution**: Set `dragDropEnabled: true` and rewrite internal drag to use `mousedown`/`mousemove`/`mouseup` instead of HTML5 drag events. Mouse events are unaffected by `dragDropEnabled`. This eliminates the mutual exclusion entirely.

## Approach

Three independent subsystems, each using a different event mechanism:

| System | Trigger | Mechanism | Location |
|--------|---------|-----------|----------|
| Internal drag (reorder/move) | mousedown + mousemove | DOM mouse events + `elementFromPoint` | `FileTreePanel.tsx` |
| Inbound drop (Finder -> app) | File dragged from Finder | `onDragDropEvent()` from Tauri webview API | `useExternalDragDrop.ts` |
| Outbound drag (app -> Finder) | Alt+mousedown on tree item | `startDrag()` from `@crabnebula/tauri-plugin-drag` | `FileTreePanel.tsx` (already implemented) |

No conflicts: internal uses mouse events, inbound uses Tauri native events, outbound uses the drag plugin. The Alt key modifier distinguishes outbound from internal on mousedown.

## Implementation Steps

### Step 1: Flip `dragDropEnabled` to `true`

**File**: `crates/app/src-tauri/tauri.conf.json`

Change `"dragDropEnabled": false` to `"dragDropEnabled": true` (line 20).

This single change enables inbound drops via Tauri events but breaks HTML5 internal drag (fixed in Step 3).

### Step 2: Rewrite `useExternalDragDrop.ts` for inbound drops

**File**: `crates/app/src/hooks/useExternalDragDrop.ts`

- Remove the global `blockExternalFileDrop` guard (lines 8-14) -- no longer needed since Tauri intercepts drops natively with `dragDropEnabled: true`
- Keep `importFilesViaDialog()` unchanged (context menu still works)
- Add a new `useExternalDragDrop()` hook that:
  - Calls `getCurrentWebview().onDragDropEvent()` to listen for Tauri drag events
  - On `enter`: set `externalDragOver = true`, store file paths
  - On `over`: optionally use `position` to highlight target folder (v2 enhancement -- initially drops go to workspace root)
  - On `drop`: call `import_files` API with the paths, show toast
  - On `leave`: clear state
  - Returns `{ externalDragOver }` for overlay rendering

API confirmed from actual source (`node_modules/@tauri-apps/api/webview.js`):
```typescript
onDragDropEvent(handler: EventCallback<DragDropEvent>): Promise<UnlistenFn>
// DragDropEvent = { type: 'enter'|'over'|'drop'|'leave', paths?: string[], position?: PhysicalPosition }
```

### Step 3: Rewrite internal drag from HTML5 to mouse events

**File**: `crates/app/src/components/Layout/FileTreePanel.tsx`

This is the bulk of the work. The utility functions in `fileTreeDnd.ts` remain unchanged.

#### 3a: Replace HTML5 drag handlers with mouse-based equivalents

**Remove these handlers**:
- `handleDragStart` (line 1029)
- `handleDragEnd` (line 1043)
- `handleFolderDragEnter` (line 1058)
- `handleFolderDragLeave` (line 1080)
- `handleItemDragOver` (line 1094)
- `handleRootDragOver` (line 1483), `handleRootDragEnter` (line 1491), `handleRootDragLeave` (line 1499), `handleRootDrop` (line 1508)

**Keep unchanged**:
- `handleItemDrop` logic (reorder + folder move) -- extract to a standalone function called from mouseup
- `handleTreeItemMouseDown` for Alt+outbound drag (line 995)
- `executeMoveItem` (line 1253), `executeMoveOrRename` (line 1148)
- All tree building, filtering, renaming, context menu logic

**Add new handlers**:

`handleMouseDown(e: React.MouseEvent, node: TreeNode)`:
- If `e.altKey`: delegate to existing `handleTreeItemMouseDown` (outbound drag)
- Otherwise: record `startX/Y`, `sourcePath`, `sourceIsFolder` in a ref
- Attach window-level `mousemove` and `mouseup` listeners

`handleMouseMove(e: MouseEvent)` (window-level):
- Check 4px dead zone before activating drag (distinguishes click from drag)
- Once active: update ghost position, use `elementFromPoint` + `closest("[data-tree-path]")` to find hovered tree item
- Call `computeDropZone()` to determine before/after/into
- Apply same sibling/non-sibling logic as current `handleItemDragOver`
- Update `dragOverPath`, `reorderIndicator` state
- Auto-expand collapsed folders after 600ms hover (same timer logic)
- Throttle hit-testing to rAF for performance

`handleMouseUp(e: MouseEvent)` (window-level):
- Remove window listeners
- If dead zone never exceeded, return (was a click)
- Use `elementFromPoint` to find drop target
- Execute same reorder/move logic as current `handleItemDrop`/`handleRootDrop`
- Clean up all drag state

#### 3b: Update `FileTreeNode` component

**Remove from props**: `onDragStart`, `onDragEnd`, `onFolderDragEnter`, `onFolderDragLeave`, `onItemDragOver`, `onItemDrop`

**Keep**: `onMouseDown` (now handles both internal drag initiation and Alt+outbound delegation)

**Remove from JSX** (both folder and file variants):
- `draggable={...}` attribute
- `onDragStart`, `onDragEnd`, `onDragOver`, `onDragEnter`, `onDragLeave`, `onDrop` handlers

**Add to folder items**: `data-tree-is-folder="1"` attribute for hit-testing

#### 3c: Add ghost element

Render a portal-based floating element during drag showing the item name:
```tsx
{draggedPath && ghostPosition && createPortal(
  <div className="drag-ghost" style={{ position: "fixed", left: ghostPosition.x + 12, top: ghostPosition.y - 8, pointerEvents: "none", zIndex: 9999 }}>
    {ghostLabel}
  </div>,
  document.body
)}
```

`createPortal` is already imported (line 2). `pointer-events: none` ensures `elementFromPoint` sees through the ghost.

#### 3d: Prevent text selection and handle edge cases

- Add `user-select: none` to tree container CSS class during active drag
- Add `window.addEventListener("blur", cancelDrag)` to handle Alt+Tab during drag
- Call `e.preventDefault()` in mousemove once dead zone exceeded to prevent text selection
- **Drop outside tree = cancel**: In `handleMouseUp`, check if target element is inside the file tree container via `closest(".file-tree-content")`. If not, cancel drag (cleanup without executing move). Do NOT attempt moves when cursor is over editor/graph/canvas areas.
- **Auto-expand timer cleanup**: Store timer ID in a ref. Clear it on: (a) cursor leaving folder element (hovered path changes), (b) `handleMouseUp`, (c) `window blur`, (d) any cancel path. The existing `autoExpandTimerRef` pattern is reused.

### Step 4: Remove root container drag handlers

**File**: `crates/app/src/components/Layout/FileTreePanel.tsx`

Remove `onDragOver`, `onDragEnter`, `onDragLeave`, `onDrop` from the `.file-tree-content` container (lines 1758-1761). Root-drop detection moves into `handleMouseUp` via `elementFromPoint` checking for `.file-tree-content`.

### Step 5: Update `App.tsx`

**File**: `crates/app/src/App.tsx`

Remove the side-effect import (line 21). Call the hook in `AppLayout.tsx` (inside `AppLayout` component) so the Tauri drag-drop listener is active whenever a workspace is open:
```tsx
const { externalDragOver } = useExternalDragDrop();
```

Render a full-window drop overlay when `externalDragOver` is true (visual feedback that files can be dropped).

### Step 6: Add CSS for ghost element

**File**: `crates/app/src/App.css`

```css
.drag-ghost {
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  white-space: nowrap;
  opacity: 0.9;
}
```

Existing CSS for `.tree-item.dragging`, `.drag-over`, `.reorder-above`, `.reorder-below`, `.drag-over-root` stays unchanged.

### Step 7: Update tests

**File**: `crates/app/src/hooks/useExternalDragDrop.test.ts`

#### Inbound drop tests (mock `getCurrentWebview().onDragDropEvent()`):
- `enter` event sets `externalDragOver = true`
- `leave` event clears state
- `drop` event calls `importFiles` API with correct paths
- `drop` shows success/failure toast
- Hook cleanup calls unlisten on unmount
- Import via dialog (existing tests, mostly unchanged)

#### Internal mouse-drag tests (if testable via simulated mouse events):
- Mouse drag < 4px does NOT activate drag (click passthrough)
- Mouse drag > 4px activates drag (sets `draggedPath`, shows ghost)
- Drag file onto folder executes `executeMoveItem`
- Drag file between siblings shows reorder indicator, drop reorders
- Mouseup outside `.file-tree-content` cancels drag (no move executed)
- Window blur during active drag cancels drag
- Auto-expand timer fires after 600ms on folder hover
- Auto-expand timer cancelled when cursor leaves folder
- Ghost element has `pointer-events: none`
- `isRenaming` suppresses drag initiation

## Files Modified

| File | Change |
|------|--------|
| `crates/app/src-tauri/tauri.conf.json` | `dragDropEnabled: true` |
| `crates/app/src/hooks/useExternalDragDrop.ts` | Remove global guard, add `useExternalDragDrop()` hook |
| `crates/app/src/hooks/useExternalDragDrop.test.ts` | Update tests |
| `crates/app/src/components/Layout/FileTreePanel.tsx` | Rewrite drag handlers from HTML5 to mouse events |
| `crates/app/src/App.tsx` | Use hook instead of side-effect import |
| `crates/app/src/App.css` | Add `.drag-ghost` style |

## What Stays Unchanged

- `crates/app/src/utils/fileTreeDnd.ts` -- all utility functions reused as-is
- `crates/app/src-tauri/src/handlers.rs` -- `import_files` backend command
- `crates/app/src-tauri/src/lib.rs` -- `tauri_plugin_drag::init()` already registered
- `crates/app/src-tauri/capabilities/default.json` -- `drag:default` already present
- `@crabnebula/tauri-plugin-drag` -- already installed (npm + Cargo)

## Verification

1. **Internal reorder**: Drag a file above/below a sibling -- reorder indicator appears, drop reorders
2. **Internal move to folder**: Drag a file onto a folder -- folder highlights, drop moves file
3. **Internal move to root**: Drag nested file to empty tree area -- root highlights, drop moves to root
4. **Folder auto-expand**: Hold drag over collapsed folder 600ms -- expands
5. **Invalid drop blocked**: Drag folder into itself -- no indicator
6. **Click still works**: Single click opens file, single click on folder toggles
7. **Context menu works**: Right-click opens context menu
8. **Inbound from Finder**: Drag file(s) from Finder into app window -- import toast, files appear in tree
9. **Outbound to Finder**: Alt+drag file from tree to Finder -- file appears in Finder
10. **Rename unaffected**: Inline rename during drag is suppressed (isRenaming guards)
11. **Import dialog**: "Import Files..." context menu still works

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| `elementFromPoint` performance at 60fps mousemove | Throttle hit-testing via `requestAnimationFrame` |
| Click vs drag discrimination | 4px dead zone before activating drag |
| Text selection during drag | `e.preventDefault()` + `user-select: none` CSS during drag |
| Window blur during drag (Alt+Tab) | `window.addEventListener("blur", cancelDrag)` |
| Scroll during drag | Check cursor proximity to top/bottom edge of `.file-tree-content`, auto-scroll |

## Documentation Updates

- Update `docs/CHANGELOG.md` with the feature
- No architecture doc changes needed (drag-drop is internal to FileTreePanel)
