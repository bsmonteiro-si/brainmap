# Canvas Architecture Reference

## Overview

Canvas provides spatial, curated views of notes using `.canvas` files (JSON Canvas spec 1.0, jsoncanvas.org/spec/1.0). It complements the automatic graph view by letting users manually arrange cards on an infinite canvas.

Library: `@xyflow/react` (React Flow v12).

| File | Lines | Responsibility |
|------|-------|----------------|
| `components/Editor/CanvasEditor.tsx` | ~1313 | Main editor component, state, save/undo, context menus, toolbars |
| `components/Editor/canvasNodes.tsx` | ~825 | 4 node types + custom edge + shared components (toolbar, resizer, handles) |
| `components/Editor/canvasTranslation.ts` | ~293 | JSON Canvas <-> React Flow bidirectional conversion |
| `components/Editor/canvasShapes.ts` | ~37 | Shape registry (6 shapes with metadata) |
| `components/Canvas/CanvasPanel.tsx` | ~122 | Right-side panel wrapper with canvas file picker |

All paths relative to `crates/app/src/`.

## Component Hierarchy

```
CanvasEditor (public export, per path key)
  CanvasErrorBoundary (crash -> "Open as Text" / "Retry")
    ReactFlowProvider
      CanvasEditorInner (all state lives here)
        ReactFlow
          NODE_TYPES: { canvasFile, canvasText, canvasLink, canvasGroup }
          EDGE_TYPES: { default: CanvasEdge }
          Controls, Background, MiniMap, Panel (bottom toolbar)
          Selection toolbar (inline, position: absolute)
        Context menus (pane, element, shape picker, note picker)
        Toolbar pickers (shape, note reference)
        File browser drawer (toggleable right-side panel with DnD)

CanvasPanel (right sidebar)
  CanvasPanelModeContext.Provider value={true}
    ReactFlowProvider key={activeCanvasPath}
      CanvasEditorInner
```

`CanvasPanelModeContext` (boolean): when `true`, file node clicks open notes in the editor panel instead of navigating away. Used by `CanvasPanel`; defaults to `false` for full-tab canvas.

## Data Flow

```
.canvas file
  -> readPlainFile(path)
  -> JSON.parse
  -> canvasToFlow()          [canvasTranslation.ts]
  -> setNodes() / setEdges() [React Flow state]
  -> user edits (drag, resize, add, delete, edit text...)
  -> flowToCanvas()          [canvasTranslation.ts]
  -> JSON.stringify(canvas, null, 2)
  -> writePlainFile(path)    [debounced 1500ms]
```

### External Change Reload

When a `.canvas` file is modified outside the app (external editor, git pull, etc.),
the file watcher emits a `files-changed` event. `App.tsx` bumps `uiStore.tabReloadKeys`
for the affected path. `CanvasEditorInner` subscribes to its reload key and re-reads
the file from disk. If the editor has unsaved changes (`dirtyRef`), it sets the tab's
`conflictState` to `"external-change"` instead of silently reloading.

## Translation Layer (canvasTranslation.ts)

### Type Maps

```
CANVAS_TO_RF_TYPE:  text -> canvasText,  file -> canvasFile,  link -> canvasLink,  group -> canvasGroup
RF_TO_CANVAS_TYPE:  canvasText -> text,  canvasFile -> file,  canvasLink -> link,  canvasGroup -> group
```

### canvasToFlow (JSON Canvas -> React Flow)

- **Node size**: Groups and fixed shapes (circle, diamond) use `style: { width, height }`. All others use `style: { width, minHeight }` (height auto-grows from content, `minHeight` preserves the saved height as a floor).
- **Groups**: get `zIndex: -1` (render behind other nodes).
- **Parented nodes**: JSON Canvas stores absolute positions; React Flow needs parent-relative. The function subtracts parent position for children.
- **Parent ordering**: React Flow requires parent nodes to precede children in the array. The function sorts accordingly.
- **Edge handles**: `fromSide` maps to `sourceHandle` directly. `toSide` maps to `targetHandle` with `"-target"` suffix (handles have separate source/target IDs).
- **Edge arrows**: Default `toEnd = "arrow"` per spec. Creates custom SVG marker string IDs (`"brainmap-arrow"` or `"brainmap-arrow-{color}"`). Colored marker IDs are coupled with `edge.style.stroke` which drives the `<marker>` SVG defs in CanvasEditor.

### flowToCanvas (React Flow -> JSON Canvas)

- **Position**: Converts parent-relative back to absolute.
- **Width resolution**: `n.width > style.width > measured.width > 250` (fallback chain).
- **Height**: `max(measured.height, n.height ?? style.height ?? style.minHeight ?? 100)`.
- **Default stripping**: Only emits optional fields when non-default (shape != "rectangle", fontSize != 13, textAlign != "center", textVAlign != "center", labelFontSize != 11, labelFontFamily not empty). `fontSize` and `fontFamily` are on `JsonCanvasNodeBase` (BrainMap extensions to the JSON Canvas spec) — all node types support them.
- **Edge markers**: Detects arrows from both object markers and string marker IDs (e.g., `"brainmap-arrow"`).
- **Target handle suffix**: Strips `-target` suffix from `targetHandle` when converting back to `toSide`.

## State Management

### Refs (CanvasEditorInner)

| Ref | Type | Purpose |
|-----|------|---------|
| `saveTimerRef` | `timeout` | Debounce timer handle |
| `lastSavedRef` | `string` | JSON of last saved state (for change detection) |
| `dirtyRef` | `boolean` | Internal dirty flag (avoids re-renders) |
| `mountedRef` | `boolean` | Prevents saves after unmount |
| `savingRef` | `boolean` | Guards against concurrent saves |
| `nodesRef` / `edgesRef` | `Node[]` / `Edge[]` | Current state accessible in closures |
| `doSaveRef` | `() => void` | Stable ref to latest save function |
| `pendingViewportRef` | `Viewport \| "fitView" \| null` | Queued viewport restore |
| `hasRestoredViewportRef` | `boolean` | Prevents overwriting viewport from transient mounts |
| `undoStackRef` / `redoStackRef` | `{ nodes: string; edges: string }[]` | Undo/redo snapshot stacks |
| `isUndoingRef` | `boolean` | Suppresses snapshot push during undo/redo replay |
| `isDraggingRef` / `isResizingRef` | `boolean` | Tracks gesture state for snapshot coalescing |
| `clipboardRef` | `{nodes: string; edges: string} \| null` | Internal copy/paste clipboard |
| `priorModeRef` | `"pan" \| "select" \| null` | Saved mode during Space bar temporary pan |

### Module-Level State

| Variable | Type | Purpose |
|----------|------|---------|
| `pendingSaves` | `Map<string, {nodes, edges}>` | Pending writes per path (checked on unmount) |
| `savedViewports` | `Map<string, Viewport>` | Viewport cache backed by localStorage key `brainmap:canvasViewports` |

### Contexts

| Context | Hook | Value | Purpose |
|---------|------|-------|---------|
| `CanvasSaveContext` | `useCanvasSave()` | `() => void` | Stable `scheduleSave` callback for child components |
| `CanvasSnapshotContext` | `useCanvasSnapshot()` | `() => void` | Stable `pushSnapshot` callback so toolbar mutations (color, font, edge type) are undoable |

### React Flow Hooks

- `useNodesState()` -> `[nodes, setNodes, onNodesChange]`
- `useEdgesState()` -> `[edges, setEdges, onEdgesChange]`
- `useReactFlow()` -> `screenToFlowPosition()`, `setViewport()`, `fitView()`, `getViewport()`
- `useNodesInitialized()` -> boolean, used for deferred viewport restore

### Zustand (uiStore)

Canvas uses ~25 `canvas*` settings from `uiStore`. See **UI Store Settings** section below. No `editorStore` usage — canvas is fully self-contained.

## Auto-Save Mechanics

1. **Change detection**: `scheduleSave()` compares `JSON.stringify(flowToCanvas(current))` to `lastSavedRef.current`. No-op if identical.
2. **Dirty tracking**: Sets `dirtyRef = true` + syncs `tabStore.isDirty` for the dirty dot indicator.
3. **Debounce**: Resets a 1500ms timer (`SAVE_DEBOUNCE_MS`). On expiry, calls `doSaveRef.current()`.
4. **Save function**: `doSave()` is guarded by `savingRef` to prevent concurrent writes. Converts current state via `flowToCanvas()`, stringifies with 2-space indent, writes via `writePlainFile()`.
5. **Save on unmount**: Cleanup effect checks `pendingSaves.has(path)` and calls `doSaveRef.current()`.
6. **Cmd+S**: `App.tsx` dispatches custom event `"canvas:save"` with path as detail. `CanvasEditorInner` listens, cancels pending debounce, and saves immediately.
7. **Child component saves via `CanvasSaveContext`**: Child components (node toolbars, text editing, edge editing) update React Flow's store via `useReactFlow().setNodes/setEdges`, which does NOT trigger the parent's `handleNodesChange`. To ensure these changes are persisted, `CanvasSaveContext` provides a stable `scheduleSave` callback (ref-backed to avoid re-rendering memo'd components). All child `setNodes`/`setEdges` calls are followed by `scheduleSave()`.

## Undo/Redo

- **Stacks**: `undoStackRef` / `redoStackRef`, max 30 entries (`MAX_CANVAS_UNDO`).
- **Snapshots**: `JSON.stringify` of entire `nodes` + `edges` arrays.
- **Snapshot triggers**: Drag start, resize start, add/remove node/edge. NOT every intermediate position change (gesture coalescing).
- **Dedup**: Compares top of stack with current state before pushing.
- **`isUndoingRef`**: Set during undo/redo replay to prevent snapshot push.
- **After replay**: `requestAnimationFrame(() => scheduleSave())` to persist the restored state.
- **Keyboard**: `Cmd+Z` / `Cmd+Y` / `Cmd+Shift+Z` captured in capture phase (`addEventListener(_, _, true)`). Skipped when focus is in `textarea` or `input`.

## Viewport Persistence

- **Storage**: localStorage key `brainmap:canvasViewports` (JSON object mapping path -> `{x, y, zoom}`).
- **On load**: Checks `savedViewports.get(path)`. If found, queues restore; otherwise queues `fitView`.
- **Deferred restore**: Uses `pendingViewportRef` + `nodesInitialized`. Viewport is applied via `requestAnimationFrame` once React Flow has measured all nodes (empty canvases restore immediately).
- **Guard**: `hasRestoredViewportRef` prevents overwriting from transient mount/unmount cycles.
- **On unmount**: Persists current viewport only if `hasRestoredViewportRef` is true.

## Node Type Architecture (canvasNodes.tsx)

All 4 node types share these components:

- **`FourHandles`**: 8 handles total (4 source + 4 target). Source IDs: `top`, `right`, `bottom`, `left`. Target IDs: `top-target`, `right-target`, `bottom-target`, `left-target`.
- **`Resizer`**: Wraps `NodeResizer`. For `autoHeight` nodes: converts `style.minHeight` -> `style.height` on resize start (so user can shrink), converts back on resize end (so auto-expand works).
- **`CanvasNodeToolbar`**: Shown when single node selected (`selectedCount <= 1`). Contains: Delete, Border color picker, Background color picker, Text format picker (font size, font family — all node types; text align, vertical align — text nodes only). Text nodes additionally get: Shape picker.

### Per-Type Details

| Type | Component | Key Behavior |
|------|-----------|--------------|
| **File** | `CanvasFileNode` | Reads `graphStore.nodes.get(filePath)` for title/type/tags/summary. Shows summary below title (3-line clamp). Double-click opens note (via `openNote`/`openPlainFile`/`openTab` depending on file type). Supports `.canvas` and `.excalidraw` files (opens in dedicated editors). Shows "missing reference" badge for broken links. Border color defaults to note type color. |
| **Text** | `CanvasTextNode` | Double-click enters editing mode (textarea). Escape cancels, blur commits. Shape-aware via `data-shape` attribute. Vertical alignment via flexbox `alignItems`. Sticky notes read `canvasStickyPin`/`canvasStickyTape`/`canvasStickyLines` from uiStore. Supports **card kinds** (see below). |
| **Link** | `CanvasLinkNode` | Shows favicon, optional title, hostname, and "Open in browser" button. Favicon loaded from Google favicon service. |
| **Group** | `CanvasGroupNode` | `zIndex: -1`. Double-click label to edit (input). Enter commits, Escape cancels (uses `cancelledRef` to prevent blur from committing after Escape). Background color defaults to `var(--bg-tertiary)`. Collapse/expand toggle: chevron button hides children and shrinks to label-only; persisted via `data.collapsed`. |

All node inner components are wrapped with `memo()`.

## Card Kinds (Typed Text Cards)

Text nodes support an optional `cardKind` field that adds semantic intent. This is a **subtype** of text nodes — they share all editing behavior (double-click, textarea, formatting) but get visual differentiation.

| Card Kind | Badge Color | Border Color | Purpose |
|-----------|-------------|--------------|---------|
| `summary` | `#3b82f6` (blue) | `#3b82f6` | Condensed takeaways |
| `question` | `#f59e0b` (amber) | `#f59e0b` | Open inquiries |
| `transition` | `#10b981` (green) | `#10b981` | Bridges between ideas |

**Visual treatment**: Typed cards show a colored badge label above the card (`position: absolute; top: -10px`) and use a solid border (plain text cards use dashed). The `data-card-kind` attribute on the outer div drives CSS styling.

**Data model**: `cardKind` is an optional field on `JsonCanvasTextNode` (values: `"summary"`, `"question"`, `"transition"`). It's serialized to `.canvas` files as a custom extension field — omitted when undefined for backward compatibility.

**Metadata**: `CARD_KIND_META` array in `canvasNodes.tsx` (exported for use by `CanvasEditor.tsx`) defines `id`, `label`, `icon`, and `color` for each kind.

**Adding a new card kind**: Add an entry to `CARD_KIND_META` in `canvasNodes.tsx`, add the `CanvasCardKind` union member in `canvasTranslation.ts`, and add CSS for `.canvas-card-kind-badge--{id}` and `.canvas-text-node[data-card-kind="{id}"]` in `App.css`.

## Shapes (canvasShapes.ts)

Registry: `CANVAS_SHAPES` array of `CanvasShapeDefinition` objects.

| Shape | Icon | Fixed Size | Default W x H |
|-------|------|-----------|----------------|
| rectangle | Square | No | 250 x 100 |
| rounded | RectangleHorizontal | No | 250 x 100 |
| circle | Circle | Yes | 160 x 160 |
| sticky | StickyNote | No | 200 x 200 |
| callout | MessageSquare | No | 260 x 120 |
| diamond | Diamond | Yes | 160 x 160 |

Fixed-size shapes use `style.height` instead of `style.minHeight`. Adding a new shape: (1) add to `CANVAS_SHAPES`, (2) add CSS class in `App.css`.

## Edge Architecture

Custom `CanvasEdge` component replaces the default React Flow edge.

- **Path**: Bezier (default), Straight, or Step. Determined by `data.edgeType` per-edge or `canvasDefaultEdgeType` setting as fallback. Uses `getBezierPath()`, `getStraightPath()`, or `getSmoothStepPath()`.
- **Label**: Displayed at midpoint. Double-click to edit. New edges (`data.isNew = true`) auto-prompt for label input. Label font size (`data.labelFontSize`, default 11) and font family (`data.labelFontFamily`) are applied as inline styles to both the display span and the edit input.
- **Reconnection**: Edges can be redirected by dragging their arrow tips to a new node. Uses React Flow's `onReconnect` API with `reconnectEdge` utility (`shouldReplaceId: false` to keep stable edge IDs). Failed reconnections (drop on empty canvas) leave the edge unchanged.
- **Toolbar**: Shown when selected (not during label edit). Contains: Edit label, Delete, Color picker, Edge type picker (bezier/straight/step), Invert direction (swaps source/target + handles + markers), Toggle bidirectional (adds/removes `markerStart`), Label format picker (font size + font family).
- **Direction controls**: Invert swaps `source`/`target`, transforms handle IDs (strip/add `-target` suffix), and swaps `markerStart`/`markerEnd`. Bidirectional toggle derives marker ID from `style.stroke` to stay color-consistent.
- **Color sync**: Color changes update both `style.stroke` AND marker IDs (`brainmap-arrow-{color}`) so the arrow matches the line.
- **Custom SVG markers**: Defined inline in the ReactFlow component. One default marker (`brainmap-arrow`) + one per unique edge color. Size controlled by `canvasArrowSize` setting. `refX=8` pulls arrow tip slightly back from the path endpoint to avoid overlapping nodes.
- **Interaction width**: `BaseEdge` uses `interactionWidth={20}` for a 20px invisible hit area, making edges easy to click regardless of visible stroke width.

## Context Menus

### Pane Context Menu (right-click empty area)

Items: Add Text Card, Add Summary Card, Add Question Card, Add Transition Card, Add Shaped Card... (sub-menu with all 6 shapes), Add Note Reference (tabbed picker: Notes/Files, filtered, max 30 results), Add Group, Create New Note (opens CreateNoteDialog, callback adds file node at click position).

### Element Context Menu (right-click node/edge)

Items: Duplicate (nodes only), Change Card Kind... (text nodes only — sub-menu: Text (plain), Summary, Question, Transition), Group Selection (when >= 2 selected), Ungroup (groups with children only), Delete.

### Counter-Zoom Compensation

Context menu positions are multiplied by `uiZoom` because menus use `position: fixed` inside the counter-zoomed container — the browser divides `left`/`top` by the zoom factor.

## Bottom Toolbar

Located at `Panel position="bottom-center"`:

1. **Pan mode** (Hand icon, H key) / **Select mode** (MousePointer2 icon, V key)
2. Separator
3. **Add text card** (StickyNote icon) + caret for shape/card-kind dropdown (shapes + separator + card kinds: Summary, Question, Transition)
4. **Add note reference** (FileText icon) — opens tabbed picker popup
5. **Add group** (Layers icon)
6. Separator
7. **Create new note** (FilePlus icon) — opens CreateNoteDialog
8. Separator
9. **File browser** (PanelRightOpen icon) — toggles right-side file browser drawer
10. Separator
11. **Zoom indicator** — shows current zoom %, click to reset to 100%
12. **Help** (HelpCircle icon) — toggles keyboard shortcuts overlay

## Selection Toolbar

Appears above selected nodes when `selectedCount >= 2` and not during selection drag. Position computed from bounding box of selected nodes, viewport-adjusted. Contains: Group, Duplicate, Delete buttons + count badge.

## Keyboard Shortcuts

| Key | Action | Guard |
|-----|--------|-------|
| H | Pan mode | Not in textarea/input/contenteditable |
| V | Select mode | Not in textarea/input/contenteditable |
| Space (hold) | Temporary pan mode (release restores prior mode) | Not in textarea/input/contenteditable |
| Cmd+C | Copy selected nodes + connecting edges | Not in textarea/input/contenteditable |
| Cmd+V | Paste at viewport center | Not in textarea/input/contenteditable |
| Cmd+Z | Undo | Capture phase; not in textarea/input |
| Cmd+Y / Cmd+Shift+Z | Redo | Capture phase; not in textarea/input |
| Cmd+D | Duplicate selected | Global |
| Cmd+S | Save (via custom event) | Handled by App.tsx |
| Cmd+/ or ? | Toggle keyboard shortcuts overlay | Not in textarea/input/contenteditable |
| Backspace / Delete | Delete selected | React Flow built-in `deleteKeyCode` |

## Counter-Zoom Pattern

**Problem**: Global `document.documentElement.style.zoom` (from the app's zoom feature) breaks React Flow's coordinate math — `getBoundingClientRect()` returns zoomed coords but mouse events don't.

**Solution**: Canvas container applies `zoom: 1/uiZoom` with `width: uiZoom*100%` and `height: uiZoom*100%` to neutralize the global zoom. Context menu positions multiply `clientX`/`clientY` by `uiZoom` to compensate.

## UI Store Settings

All settings are persisted to `brainmap:uiPrefs` localStorage. Each has a `setCanvas*` action that calls `savePrefs()`.

| Setting | Type | Default | Purpose |
|---------|------|---------|---------|
| `canvasTheme` | `"light" \| "dark"` | `"dark"` | React Flow color mode |
| `canvasShowDots` | `boolean` | `true` | (Legacy) Background dot grid |
| `canvasDotOpacity` | `number` | `50` | Background pattern opacity (0-100) |
| `canvasBackgroundVariant` | `string` | `"dots"` | Background pattern: `"dots"`, `"lines"`, `"cross"`, or `"none"` |
| `canvasShowMinimap` | `boolean` | `true` | Show navigable minimap in corner |
| `canvasSnapToGrid` | `boolean` | `false` | Snap nodes to grid when dragging |
| `canvasSnapGridSize` | `number` | `20` | Grid snap interval in pixels |
| `canvasNodeShadow` | `number` | `8` | Drop shadow size on file/text/link nodes (0 = off) |
| `canvasDefaultEdgeType` | `string` | `"bezier"` | Default edge path style: `"bezier"`, `"straight"`, or `"step"` |
| `canvasFileBrowserWidth` | `number` | `260` | File browser drawer width (persisted) |
| `canvasArrowSize` | `number` | `12` | SVG arrow marker size |
| `canvasEdgeWidth` | `number` | `2` | Edge stroke width (CSS var `--edge-width`) |
| `canvasCardBgOpacity` | `number` | `15` | Card background opacity |
| `canvasDefaultCardWidth` | `number` | `300` | Default new card width |
| `canvasDefaultCardHeight` | `number` | `150` | Default new card height |
| `canvasCalloutTailSize` | `number` | `18` | Callout shape tail size (CSS var `--callout-tail`) |
| `canvasStickyRotation` | `number` | `1.5` | Sticky note rotation degrees |
| `canvasStickyColor` | `string` | `"#fef3c7"` | Sticky note background color |
| `canvasStickyShadow` | `number` | `6` | Sticky note shadow size |
| `canvasStickyFoldSize` | `number` | `20` | Sticky note fold corner size |
| `canvasStickyPin` | `boolean` | `false` | Show decorative pin on sticky notes |
| `canvasStickyTape` | `boolean` | `false` | Show decorative tape on sticky notes |
| `canvasStickyLines` | `boolean` | `false` | Show ruled lines on sticky notes |
| `canvasStickyCurl` | `boolean` | `true` | Enable page curl effect on sticky notes |
| `canvasStickyStripe` | `boolean` | `true` | Enable stripe texture on sticky notes |
| `canvasRoundedRadius` | `number` | `24` | Rounded shape border radius |
| `canvasGroupFontFamily` | `string` | `"sans-serif"` | Group label font family |
| `canvasGroupFontSize` | `number` | `13` | Group label font size |
| `canvasSelectionColor` | `string` | `"#4a9eff"` | Selection highlight color |
| `canvasSelectionWidth` | `number` | `4` | Selection border width |
| `canvasPanelFontFamily` | `string` | DEFAULT_UI_FONT | Canvas panel header font |
| `canvasPanelFontSize` | `number` | `12` | Canvas panel header font size |

## Integration Points

| System | File(s) | How Canvas Integrates |
|--------|---------|----------------------|
| **Tab system** | `tabStore.ts`, `EditorPanel.tsx`, `TabBar.tsx`, `tabActions.ts` | Tab kind `"canvas"`. `EditorPanel` checks `activeTab?.kind === "canvas"` and renders `<CanvasEditor path={...} />` |
| **App shortcuts** | `App.tsx` | Cmd+S dispatches `"canvas:save"` custom event. Cmd+W closes canvas tab |
| **File tree** | `FileTreePanel.tsx` | `.canvas` extension detection, "New Canvas" context menu item, LayoutDashboard icon |
| **Graph store** | `graphStore.ts` | `CanvasFileNode` reads `nodes.get(filePath)` for title/type/tags display |
| **Settings** | `SettingsModal.tsx` | All `canvas*` settings exposed in Settings UI |
| **Create dialog** | `uiStore.ts` | `createNoteOnCreatedCallback` + `createFileKind: "canvas"` for "Create New Note" flow |
| **Canvas panel** | `CanvasPanel.tsx` | `activeCanvasPath` + `openCanvasInPanel` in uiStore. Wraps `CanvasEditorInner` with `CanvasPanelModeContext` |

## Common Tasks Quick Reference

| Task | Where to Look |
|------|---------------|
| Fix node rendering bug | `canvasNodes.tsx`, find the `*NodeInner` component |
| Fix save / auto-save issue | `CanvasEditor.tsx`, search `doSave` / `scheduleSave` |
| Fix translation / serialization bug | `canvasTranslation.ts` |
| Add a new shape | `canvasShapes.ts` (registry) + `App.css` (CSS class). See guide: `docs/extension-guides/add-canvas-node-type.md` |
| Add a new node type | See `docs/extension-guides/add-canvas-node-type.md` |
| Add a new UI setting | `uiStore.ts` (StoredPrefs type + initial state + setter), `SettingsModal.tsx`, then use in `CanvasEditor.tsx` |
| Add toolbar button | `CanvasEditor.tsx`, search `canvas-toolbar` |
| Add context menu item | `CanvasEditor.tsx`, search `ctxMenu` or `elemCtxMenu` |
| Modify node toolbar | `canvasNodes.tsx`, `CanvasNodeToolbar` component |
| Fix viewport restore | `CanvasEditor.tsx`, search `pendingViewportRef` / `hasRestoredViewportRef` |
| Fix undo/redo | `CanvasEditor.tsx`, search `undoStackRef` / `pushSnapshot` / `canvasUndo` |
| Fix counter-zoom issues | `CanvasEditor.tsx`, search `counterZoomStyle` / `uiZoom` |

## Keeping This Doc Current

This doc is referenced by CLAUDE.md as the authoritative Canvas architecture reference. Agents modifying Canvas code MUST:

1. **Before implementing**: Read this doc to understand existing patterns and invariants.
2. **After implementing**: Check each section your changes touch. If any content is now inaccurate or incomplete, update it in the same commit.
3. **What to update**:
   - Added/removed/renamed a component -> update Component Hierarchy
   - Changed save behavior -> update Auto-Save Mechanics
   - Added a ref or module-level state -> update State Management table
   - Added a keyboard shortcut -> update Keyboard Shortcuts
   - Added a UI store setting -> update UI Store Settings table
   - Added a node type -> update Node Type Architecture + Common Tasks
   - Changed translation logic -> update Translation Layer
   - Changed context menu items -> update Context Menus
4. **New extension guides**: If your change establishes a new repeatable pattern (like adding a canvas toolbar plugin), create a guide in `docs/extension-guides/`.
