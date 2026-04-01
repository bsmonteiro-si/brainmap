# 2026-03-27 — Subagent Transcript: Plan

**Date:** 2026-03-27 20:11:52
**Agent:** Plan
**Agent ID:** ae2c848e3d8d33fa1
**Parent Session:** 51b5ae26-5523-47aa-aa29-7a42f626f8b5

---

## User

Design an implementation plan for fixing drag-and-drop in a Tauri v2 + React app on macOS.

## The Problem

There are 3 requirements:
1. Internal file tree drag (reorder/move within the app) — currently works
2. Drag files FROM Finder INTO the app — currently broken (WKWebView navigates away)
3. Drag files FROM the app TO Finder — currently broken

The root cause: Tauri's `dragDropEnabled` config creates a mutually exclusive choice:
- `dragDropEnabled: true`: Tauri intercepts ALL drag events at native level. External file drops work via `onDragDropEvent()`. BUT internal HTML5 dragover/drop events never reach DOM elements — completely breaks internal drag.
- `dragDropEnabled: false` (current): HTML5 drag works for internal operations. BUT external file drops are handled by WKWebView before JavaScript runs — navigates to the file, replacing the app UI.

## The Approach

Set `dragDropEnabled: true` and **rewrite internal drag to use mousedown/mousemove/mouseup instead of HTML5 drag events**.

Rationale:
- This is the ONLY approach that satisfies all 3 requirements simultaneously
- Mouse events (mousedown/mousemove/mouseup) are NOT affected by `dragDropEnabled`
- With `dragDropEnabled: true`, `onDragDropEvent()` provides external file drops with paths, positions, and multi-file support
- `startDrag()` from `@crabnebula/tauri-plugin-drag` handles outbound drag to Finder
- The drag computation utilities in `fileTreeDnd.ts` remain unchanged
- 9 previous attempts failed because they tried to work around the constraint instead of eliminating it

## Current Internal Drag System (to be rewritten)

Location: `crates/app/src/components/Layout/FileTreePanel.tsx`

Current handlers using HTML5 Drag API:
- `handleDragStart(e: DragEvent, node)` — sets dataTransfer with custom MIME types
- `handleItemDragOver(e: DragEvent, node, element)` — computes drop zone (before/after/into), shows visual indicator
- `handleItemDrop(e: DragEvent, node)` — executes move/reorder
- `handleDragEnd()` — cleanup state
- `handleFolderDragEnter(node)` — starts 600ms auto-expand timer
- `handleFolderDragLeave(node)` — cancels auto-expand timer
- `handleRootDragOver/Enter/Leave/Drop` — handles drops to workspace root

Each tree item has `draggable={true}` and onDragStart/onDragOver/onDrop handlers.

Current state variables:
- `draggedPath` / `draggedIsFolder` — the item being dragged
- `dropTargetPath` / `dropPosition` — where the drop would land
- `isDraggedOver` / `isRootDragOver` — visual highlighting

Utility functions in `crates/app/src/utils/fileTreeDnd.ts` (KEEP UNCHANGED):
- `computeNewPath(sourcePath, targetPath, position, isFolder)`
- `isValidDrop(draggedPath, targetPath, draggedIsFolder)`
- `getParentFolder(path)` / `isSameFolder(a, b)`
- `computeReorderedList(...)` / `computeDropZone(e, element)`
- `initCustomOrderFromTree(tree)`

## External Drop System (to be added)

With `dragDropEnabled: true`, use the Tauri API:
```typescript
import { getCurrentWebview } from "@tauri-apps/api/webview";

// DragDropEvent type:
type DragDropEvent = 
  | { type: 'enter'; paths: string[]; position: PhysicalPosition }
  | { type: 'over'; position: PhysicalPosition }
  | { type: 'drop'; paths: string[]; position: PhysicalPosition }
  | { type: 'leave' }
```

The `onDragDropEvent` method listens to all four events combined.

## Outbound Drag System (partially implemented)

Already installed: `@crabnebula/tauri-plugin-drag` v2.1.0 (Rust + npm)
```typescript
import { startDrag } from "@crabnebula/tauri-plugin-drag";
startDrag({ item: [absolutePath], icon: "path/to/icon" })
```

Currently uses Alt+mousedown approach. With the new mouse-based internal drag, we need a way to distinguish "internal drag" from "outbound drag to Finder". Options:
- Alt+drag = outbound to Finder, regular drag = internal move
- Drag past the window boundary = outbound (detect via cursor position)
- Always start as internal, convert to native if cursor leaves window

## Files to Modify

1. `crates/app/src-tauri/tauri.conf.json` — change `dragDropEnabled` to `true`
2. `crates/app/src/components/Layout/FileTreePanel.tsx` — rewrite drag handlers from HTML5 to mouse events
3. `crates/app/src/hooks/useExternalDragDrop.ts` — implement `onDragDropEvent` listener for inbound drops
4. `crates/app/src/App.tsx` — may need to update import
5. `crates/app/src/components/Layout/AppLayout.tsx` — may need drop overlay for visual feedback

## Key Design Decisions Needed

1. **How to distinguish internal vs outbound drag**: Alt+drag modifier? Or detect cursor leaving window?
2. **Visual feedback during mouse-based drag**: Use a floating ghost element? Or just highlight drop zones?
3. **Drop zone calculation**: Use `elementFromPoint` to find target node? Or track mouse position over rendered tree items?

Please provide a detailed step-by-step implementation plan covering:
- The mouse-based internal drag system design
- The external drop handler design
- The outbound drag design
- How these three systems coexist without conflicts
- CSS changes needed for visual feedback
- Test strategy
- Risk areas and mitigation

---

## Assistant



I'll start by thoroughly exploring the codebase to understand the current implementation before designing the plan.

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/tauri.conf.json"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":100}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/useExternalDragDrop*","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/AppLayout*","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":100,"limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/hooks/useExternalDragDrop.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

Now let me read the drag-related parts of FileTreePanel.tsx more carefully.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":250,"limit":200}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"handleDrag|draggedPath|dropTarget|isDraggedOver|isRootDragOver|handleItemDrag|handleFolderDrag|handleRootDrag|onDragStart|onDragOver|onDrop|onDragEnd|onDragEnter|onDragLeave|draggable","pa`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":920,"limit":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":1120,"limit":250}`

---

## Assistant

Now let me look at the rendering part and CSS.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":1470,"limit":120}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"drag-over|dragging|reorder-indicator|drop-highlight","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"drag-over|dragging|reorder-indicator|drop-highlight|\\.tree-item.*drag|ghost","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":3}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"reorder-line|reorder-indicator","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":5}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"reorder","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":5}`

---

## Assistant

Now let me check the JSX rendering of tree items to understand the full component structure.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":660,"limit":120}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":830,"limit":90}`

---

## Assistant

Now let me look at the rendering of the main tree container and how the root drop zone is structured.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":1720,"limit":120}`

---

## Assistant

Now let me check the Tauri Rust-side plugin config and the API bridge for import.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"importFiles|import_files","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"tauri-plugin-drag|drag-as-window","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"tauri-plugin-drag|drag.as\" ","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/Cargo.toml","output_mode":"content","-C":2}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"drag","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs","output_mode":"content","-C":2}`

---

## Assistant

Now let me check App.tsx to understand how the external drag drop module is currently loaded.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"ExternalDragDrop|useExternalDragDrop|dragDrop|onDragDropEvent","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"getCurrentWebview|onDragDropEvent","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"ExternalDragDrop|useExternalDragDrop","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","output_mode":"content","-C":3}`

---

## Assistant

Good. Now I have a thorough understanding of the entire current system. Let me also check the Tauri webview API availability.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"@tauri-apps/api/webview|@tauri-apps/api/window","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cat /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json | grep -E \"tauri|crabnebula\" | head -20","description":"Check Tauri and crabnebula package versions"}`

---

## Assistant

Good, `@tauri-apps/api` v2 is available, which provides `getCurrentWebview().onDragDropEvent()`. Let me also check the API bridge to understand how importFiles works for the inbound drop reuse.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"importFiles","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts","output_mode":"content","-C":5}`

---

## Assistant

I now have a complete picture. Let me design the implementation plan.

---

## Implementation Plan: Fixing Drag-and-Drop in Tauri v2 + React on macOS

### Executive Summary

The plan replaces all HTML5 Drag API usage in the file tree with a mouse-event-based system, enabling `dragDropEnabled: true` in Tauri config. This eliminates the mutual exclusion between internal drag operations and external file drops. The three drag systems (internal reorder/move, inbound from Finder, outbound to Finder) become independent, non-conflicting mechanisms.

---

### Architecture Overview

Three independent subsystems, each using a different event mechanism:

| System | Trigger | Event Mechanism | Handler Location |
|---|---|---|---|
| Internal drag (reorder/move) | mousedown + mousemove on tree item | DOM mouse events + `elementFromPoint` | `FileTreePanel.tsx` |
| Inbound drop (Finder to app) | File dragged from Finder into window | `onDragDropEvent()` from Tauri webview API | `useExternalDragDrop.ts` |
| Outbound drag (app to Finder) | Alt+mousedown on tree item | `startDrag()` from `@crabnebula/tauri-plugin-drag` | `FileTreePanel.tsx` (already implemented) |

With `dragDropEnabled: true`, Tauri intercepts all native drag events at the WKWebView level. HTML5 drag events (`dragstart`, `dragover`, `drop`) will no longer fire for any DOM elements. Mouse events (`mousedown`, `mousemove`, `mouseup`) are unaffected by this setting.

---

### Step 1: Tauri Config Change

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/tauri.conf.json`

Change line 20 from `"dragDropEnabled": false` to `"dragDropEnabled": true`.

This single change breaks internal drag (HTML5 events stop reaching the DOM) but enables inbound drops via the Tauri API.

---

### Step 2: Rewrite Internal Drag from HTML5 to Mouse Events

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`

This is the largest change. The core logic and utility functions in `fileTreeDnd.ts` remain untouched; only the event plumbing changes.

#### 2a: New State Model

Replace the existing drag state variables with a unified ref-based drag state object to avoid excessive re-renders during mousemove (which fires every few pixels):

```typescript
interface InternalDragState {
  active: boolean;
  sourcePath: string;
  sourceIsFolder: boolean;
  startX: number;
  startY: number;
  hasMoved: boolean;  // true after 4px dead zone exceeded
}
```

Keep the existing render-triggering state but only update it on meaningful changes:
- `draggedPath` / `draggedIsFolder` -- set once drag starts (after dead zone)
- `dragOverPath` -- set when hovering a valid folder target
- `reorderIndicator` -- set when hovering a sibling for reorder
- `rootDragOver` -- set when hovering empty root area

Add new state for the floating ghost element:
- `ghostPosition: { x: number; y: number } | null`
- `ghostLabel: string | null`

#### 2b: Mouse Event Handlers (replacing HTML5 drag handlers)

**`handleMouseDown(e: React.MouseEvent, node: TreeNode)`** -- replaces `handleDragStart`:
- If `e.button !== 0`, return (right-click or middle-click)
- If `e.altKey`, delegate to existing `handleTreeItemMouseDown` for outbound Finder drag (already implemented)
- Store `startX`, `startY`, `sourcePath`, `sourceIsFolder` in the drag state ref
- Attach `window.addEventListener("mousemove", handleMouseMove)` and `window.addEventListener("mouseup", handleMouseUp)`
- Do NOT call `e.preventDefault()` here -- the click handler for opening files uses mousedown/click, and we need to differentiate. The dead zone (4px movement) distinguishes click from drag

**`handleMouseMove(e: MouseEvent)`** (window-level, not React):
- If `!hasMoved`: check if movement exceeds 4px dead zone. If not, return. If yes, set `hasMoved = true`, set `draggedPath`/`draggedIsFolder` state, set `ghostLabel`.
- Update `ghostPosition` to `{ x: e.clientX, y: e.clientY }`
- Use `document.elementFromPoint(e.clientX, e.clientY)` to find the tree item under the cursor
- Look up the `data-tree-path` attribute on the element (or its closest ancestor with that attribute) to determine which tree node is being hovered
- If the hovered element is a tree item:
  - Get its bounding rect
  - Call `computeDropZone(rect, e.clientY, hoveredNode.isFolder)` (same utility as before)
  - Apply the same sibling/non-sibling logic currently in `handleItemDragOver`
  - Update `dragOverPath`, `reorderIndicator` as appropriate
- If the hovered element is the `.file-tree-content` container (empty area), set `rootDragOver`
- If hovering a collapsed folder, start the 600ms auto-expand timer (same logic as current `handleFolderDragEnter`)

**`handleMouseUp(e: MouseEvent)`** (window-level):
- Remove window listeners
- If `!hasMoved`, clean up and return (this was a click, not a drag)
- Use `document.elementFromPoint(e.clientX, e.clientY)` to find the drop target
- Execute the same drop logic currently in `handleItemDrop` and `handleRootDrop`:
  - If `reorderIndicator` is set and target matches, execute reorder
  - If target is a folder and valid drop, execute `executeMoveItem`
  - If target is root area, execute `executeMoveItem` to root
- Call cleanup (reset all drag state, clear ghost, clear indicators)

#### 2c: Mapping from Old Handlers to New

| Old HTML5 Handler | New Mouse Handler | Notes |
|---|---|---|
| `handleDragStart` | `handleMouseDown` + dead zone in `handleMouseMove` | Dead zone replaces the browser's built-in drag threshold |
| `handleItemDragOver` | Logic inside `handleMouseMove` using `elementFromPoint` | Same `computeDropZone` calls |
| `handleFolderDragEnter` | Logic inside `handleMouseMove` when target changes to folder | Same auto-expand timer |
| `handleFolderDragLeave` | Logic inside `handleMouseMove` when target changes away from folder | Cancel timer when target changes |
| `handleItemDrop` | `handleMouseUp` | Same reorder + move logic |
| `handleRootDragOver` | Logic inside `handleMouseMove` when target is `.file-tree-content` | Same validation |
| `handleRootDrop` | `handleMouseUp` when target is root | Same `executeMoveItem("", ...)` |
| `handleDragEnd` | Cleanup in `handleMouseUp` | Same state reset |

#### 2d: DOM Changes in JSX

For both `FileTreeNode` (folder variant) and file variant:

**Remove:** `draggable={...}`, `onDragStart`, `onDragEnd`, `onDragOver`, `onDrop`, `onDragEnter`, `onDragLeave`

**Change:** `onMouseDown` handler -- currently calls `handleTreeItemMouseDown` (for Alt+drag outbound). Change to call new `handleMouseDown` which checks `e.altKey` internally and delegates to outbound drag if Alt is held, otherwise starts internal drag tracking.

The `data-tree-path` attribute already exists on every tree item (line 745, 874). This is critical -- `elementFromPoint` + `closest("[data-tree-path]")` will be the primary hit-testing mechanism.

**Add:** A `data-tree-is-folder` attribute to folder items so the mousemove handler can determine node type without a lookup.

For the root container (`.file-tree-content`): remove `onDragOver`, `onDragEnter`, `onDragLeave`, `onDrop`.

#### 2e: Ghost Element

Add a portal-rendered floating element showing the dragged item name, positioned at `ghostPosition`:

```typescript
{draggedPath && ghostPosition && createPortal(
  <div className="drag-ghost" style={{
    position: "fixed",
    left: ghostPosition.x + 12,
    top: ghostPosition.y - 8,
    pointerEvents: "none",
    zIndex: 9999,
  }}>
    {ghostLabel}
  </div>,
  document.body
)}
```

`createPortal` is already imported (line 2 of the file).

#### 2f: CSS for Ghost Element

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

Add:
```css
.drag-ghost {
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0.9;
}
```

Existing CSS classes for `.tree-item.dragging`, `.tree-item.drag-over`, `.tree-item.reorder-above`, `.tree-item.reorder-below`, and `.file-tree-content.drag-over-root` remain unchanged -- they are applied via the same state variables.

#### 2g: `elementFromPoint` Hit Testing Detail

The key implementation detail for the mousemove handler:

```typescript
const el = document.elementFromPoint(e.clientX, e.clientY);
if (!el) return clearHoverState();

// Find the tree item
const treeItem = el.closest("[data-tree-path]") as HTMLElement | null;
if (!treeItem) {
  // Check if we're over the root container
  const rootContainer = el.closest(".file-tree-content");
  if (rootContainer) { setRootDragOver(true); return; }
  clearHoverState();
  return;
}

const hoveredPath = treeItem.dataset.treePath!;
const hoveredIsFolder = treeItem.dataset.treeIsFolder === "1";
const rect = treeItem.getBoundingClientRect();
```

Important: set `pointer-events: none` on the ghost element so `elementFromPoint` sees through it to the tree items below.

#### 2h: Prop Interface Changes for `FileTreeNode`

Remove from props:
- `onDragStart`
- `onDragEnd`
- `onFolderDragEnter`
- `onFolderDragLeave`
- `onItemDragOver`
- `onItemDrop`

Change `onMouseDown` type from `(e: React.MouseEvent, node: TreeNode) => void` to the same signature (it already is), but the handler now serves both internal drag initiation and outbound drag.

The `FileTreeNode` component becomes simpler -- it only needs `onMouseDown` and `onContextMenu` for interaction. All drag hover/drop logic lives in the window-level mousemove/mouseup handlers.

---

### Step 3: Inbound Drop Handler (Finder to App)

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/hooks/useExternalDragDrop.ts`

Complete rewrite. The current file has two parts:
1. Global `dragover`/`drop` event listeners that block WKWebView navigation (lines 8-14) -- **remove these entirely** (no longer needed with `dragDropEnabled: true`, Tauri handles suppression)
2. `importFilesViaDialog()` function -- **keep this unchanged**, it's used by the context menu

Add a new hook `useExternalDragDrop()` that registers the Tauri `onDragDropEvent` listener:

```typescript
import { useEffect, useState } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { getAPI } from "../api/bridge";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { useUndoStore } from "../stores/undoStore";
import { log } from "../utils/logger";

export function useExternalDragDrop() {
  const [externalDragOver, setExternalDragOver] = useState(false);
  const [externalDragPaths, setExternalDragPaths] = useState<string[]>([]);

  useEffect(() => {
    let unlisten: (() => void) | null = null;

    getCurrentWebview().onDragDropEvent((event) => {
      switch (event.payload.type) {
        case "enter":
          setExternalDragOver(true);
          setExternalDragPaths(event.payload.paths);
          break;
        case "over":
          // Could use event.payload.position for positional drop targeting
          break;
        case "drop": {
          setExternalDragOver(false);
          const paths = event.payload.paths;
          handleExternalDrop(paths);
          break;
        }
        case "leave":
          setExternalDragOver(false);
          setExternalDragPaths([]);
          break;
      }
    }).then((fn) => { unlisten = fn; });

    return () => { unlisten?.(); };
  }, []);

  return { externalDragOver, externalDragPaths };
}

async function handleExternalDrop(paths: string[]) {
  const info = useWorkspaceStore.getState().info;
  if (!info) return;

  try {
    const api = await getAPI();
    const result = await api.importFiles(paths, "");
    // Show toast (same pattern as importFilesViaDialog)
    const imported = result.imported.length;
    const failed = result.failed.length;
    if (imported > 0) {
      showToast(`Imported ${imported} file${imported === 1 ? "" : "s"}`);
    } else if (failed > 0) {
      showToast(`Import failed: ${result.failed[0].error}`);
    }
  } catch (err) {
    showToast(`Import failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}
```

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx`

Change line 21 from the side-effect import to using the hook inside the App component:
```typescript
// Remove: import "./hooks/useExternalDragDrop";
// Add in App component body: const { externalDragOver } = useExternalDragDrop();
```

Optionally render a full-window overlay when `externalDragOver` is true, providing visual feedback that files can be dropped.

#### Advanced: Positional Drop Targeting

The `onDragDropEvent` provides `position: PhysicalPosition` on `over` and `drop` events. This gives pixel coordinates that could be used to determine which folder in the tree the user is hovering over. However, this requires converting physical coordinates to logical coordinates (accounting for device pixel ratio) and then using `elementFromPoint`. This is a v2 enhancement -- for the initial implementation, all external drops go to the workspace root.

---

### Step 4: Outbound Drag (App to Finder)

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`

The outbound drag system via `handleTreeItemMouseDown` (lines 995-1027) and `startDrag()` is already fully implemented and working. It uses Alt+mousedown, which is a separate code path from the regular mousedown.

**Change needed:** Integrate it into the new `handleMouseDown` handler. The new handler checks `e.altKey` first:
- If Alt held: delegate to existing outbound drag logic (unchanged)
- If Alt not held: start internal mouse-based drag tracking

No other changes needed for outbound drag. It already works because `startDrag()` operates at the native level via the Tauri plugin, completely independent of both HTML5 drag events and Tauri's `dragDropEnabled` setting.

---

### Step 5: Ensuring No Conflicts Between Systems

The three systems are isolated by design:

1. **Internal drag** uses `mousedown`/`mousemove`/`mouseup` -- these are standard pointer events unaffected by `dragDropEnabled`
2. **Inbound drop** uses `onDragDropEvent()` from the Tauri webview API -- fires only for native OS drags entering the window
3. **Outbound drag** uses `startDrag()` from the native plugin -- initiates a platform-level drag session

The only potential conflict is between internal drag and outbound drag, both triggered by mousedown. The Alt key modifier resolves this cleanly.

One edge case: if the user starts an internal drag and moves the cursor outside the window, `mouseup` may not fire (the window loses mouse capture). Mitigation: add a `blur` event listener on `window` during drag to cancel the drag session.

---

### Step 6: Remove Global HTML5 Drag Suppression

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/hooks/useExternalDragDrop.ts`

Remove lines 8-14 (the `blockExternalFileDrop` function and its `addEventListener` calls). With `dragDropEnabled: true`, Tauri intercepts native drag events before WKWebView can navigate away, making this global guard unnecessary.

---

### Risk Areas and Mitigation

**Risk 1: `elementFromPoint` performance during rapid mousemove**
- `mousemove` fires at 60fps during drag. `elementFromPoint` is fast (sub-millisecond), but calling `closest("[data-tree-path]")` on every frame adds up.
- Mitigation: Throttle the hit-testing to every 16ms (one frame) using `requestAnimationFrame`. Update ghost position on every mousemove, but do hit-testing/state-updates only on rAF ticks.

**Risk 2: Click vs drag discrimination**
- With mouse-based drag, a regular click (mousedown + mouseup with no/minimal movement) must still work for opening files and toggling folders.
- Mitigation: The 4px dead zone ensures that clicks without movement are never interpreted as drags. The `handleMouseUp` checks `hasMoved` before executing any drop logic.

**Risk 3: Text selection during drag**
- Mousemove with button held can trigger text selection in the tree.
- Mitigation: Call `e.preventDefault()` in the mousemove handler once the dead zone is exceeded. Also add `user-select: none` to the tree container during active drag via a CSS class.

**Risk 4: Window blur during drag**
- If user Alt+Tabs or moves cursor off-window, mouseup may not fire.
- Mitigation: `window.addEventListener("blur", cancelDrag)` during active drag.

**Risk 5: `onDragDropEvent` coordinate system**
- Tauri's `PhysicalPosition` uses physical pixels, not CSS pixels. On Retina displays, divide by `window.devicePixelRatio` before using with `elementFromPoint`.
- For v1, external drops go to root, so this is not immediately critical.

**Risk 6: Scroll container interaction**
- The file tree scrolls (`.file-tree-content` has `overflow: auto`). During drag, if the user moves to the top/bottom edge, auto-scroll should occur.
- Mitigation: In the mousemove handler, check if cursor is within 40px of the top/bottom of `.file-tree-content`. If so, call `scrollBy()` to auto-scroll.

---

### Test Strategy

**Manual tests (critical path):**
1. Internal reorder: Drag a file above/below a sibling -- verify reorder indicator appears, drop reorders correctly
2. Internal move to folder: Drag a file onto a folder -- verify folder highlights, drop moves file
3. Internal move to root: Drag a nested file to empty space below tree items -- verify root highlights, drop moves to root
4. Folder auto-expand: Hold drag over collapsed folder for 600ms -- verify it expands
5. Invalid drop prevention: Drag folder into itself or descendant -- verify no drop indicator
6. Click still works: Single click on file opens it, single click on folder toggles it
7. Context menu still works: Right-click still opens context menu
8. Inbound from Finder: Drag file(s) from Finder into app window -- verify import toast appears, files appear in tree
9. Outbound to Finder: Alt+drag file from tree to Finder -- verify file appears in Finder
10. Rename during drag: Start rename, try to drag -- verify drag is suppressed during rename
11. Filter active: With search filter active, verify drag reorder is disabled

**Automated test updates:**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/hooks/useExternalDragDrop.test.ts` -- rewrite to test the new `useExternalDragDrop` hook and `handleExternalDrop` function instead of the global `blockExternalFileDrop` guard
- The utility functions in `fileTreeDnd.ts` have no test changes needed (they are pure functions unchanged)

---

### Implementation Sequence

1. **Change `tauri.conf.json`** -- flip `dragDropEnabled` to `true` (1 line)
2. **Rewrite `useExternalDragDrop.ts`** -- remove global guards, add `useExternalDragDrop()` hook with `onDragDropEvent`
3. **Update `App.tsx`** -- replace side-effect import with hook usage
4. **Rewrite drag handlers in `FileTreePanel.tsx`** -- this is the bulk of the work:
   a. Add mouse-drag state refs and render state
   b. Write `handleMouseDown`, `handleMouseMove`, `handleMouseUp` handlers
   c. Remove all HTML5 drag props from FileTreeNode (folder and file variants)
   d. Add `data-tree-is-folder` attribute to folder items
   e. Add ghost element rendering via portal
   f. Remove old handlers: `handleDragStart`, `handleDragEnd`, `handleFolderDragEnter`, `handleFolderDragLeave`, `handleItemDragOver`, `handleItemDrop`, `handleRootDragOver`, `handleRootDragEnter`, `handleRootDragLeave`, `handleRootDrop`
   g. Update `FileTreeNode` prop interface (remove drag-related props)
5. **Add CSS for ghost element** in `App.css`
6. **Test all three drag systems**

Steps 2-3 can be done in parallel with step 4. Step 1 must come first. Step 5 is trivial and can be done alongside step 4.

---

### Critical Files for Implementation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/hooks/useExternalDragDrop.ts`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/tauri.conf.json`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx`

---

