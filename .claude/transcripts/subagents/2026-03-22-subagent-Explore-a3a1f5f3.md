# 2026-03-22 — Subagent Transcript: Explore

**Date:** 2026-03-22 14:44:43
**Agent:** Explore
**Agent ID:** a3a1f5f31e5e47519
**Parent Session:** 5a4e73f3-9763-4aad-a8d8-60f48fd48e7c

---

## User

Research what features are standard in modern canvas/whiteboard applications by exploring what React Flow (@xyflow/react) supports that BrainMap's canvas doesn't use yet.

1. **Check React Flow's exports** — read `node_modules/@xyflow/react/dist/esm/index.mjs` or the package's type definitions to see what components and hooks are available. Look for:
   - MiniMap component
   - Snap to grid
   - Connection line customization
   - Node toolbar positions
   - Panel component positions
   - useOnSelectionChange, useOnViewportChange hooks
   - Background variants (dots, lines, cross)
   - Auto-layout utilities
   - Key bindings configuration

2. **Check what Excalidraw features BrainMap's Excalidraw editor uses** — read `ExcalidrawEditor.tsx` briefly to see if there are patterns we could apply to canvas.

3. **Check the file tree drag-and-drop infrastructure** — read `fileTreeDnd.ts` and `FileTreePanel.tsx` to understand if DnD from file tree to canvas is already partially implemented.

4. **Check if there's a MiniMap** in our canvas — search for "MiniMap" or "minimap" across the canvas files.

Focus on identifying concrete, implementable features that would bring our canvas closer to tools like Obsidian Canvas, tldraw, Miro, or Figma.

---

## Assistant

I'll research React Flow's capabilities and compare them against BrainMap's current canvas implementation to identify missing modern features.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/node_modules/@xyflow/react -name \"*.d.ts\" -o -name \"index.mjs\" | head -20"}`

---

## Assistant

Let me check if the project has dependencies installed:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react 2>/dev/null | head -20 || echo \"node_modules check\""}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/package.json"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/index.d.ts","limit":200}`

---

## Assistant

Now let me check what additional components are exported:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/additional-components/index.d.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/additional-components/Background/index.d.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/additional-components/Background/types.d.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/additional-components/MiniMap/index.d.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/additional-components/MiniMap/types.d.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/additional-components/Controls/types.d.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/additional-components/NodeToolbar/types.d.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/additional-components/EdgeToolbar/types.d.ts"}`

---

## Assistant

Now let me check the current Canvas implementation:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":300,"offset":100}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"MiniMap\\|minimap\\|SnapGrid\\|snap\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx | head -20"}`

---

## Assistant

Now let me check Excalidraw integration:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ExcalidrawEditor.tsx","limit":80}`

---

## Assistant

Now let me check the file tree drag-and-drop:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*fileTreeDnd*\" -o -name \"*FileTreePanel*\""}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/fileTreeDnd.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":120}`

---

## Assistant

Let me check what hooks are available in React Flow and search for what features are NOT used in Canvas:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/hooks/ | head -20"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/hooks/"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/hooks/useOnViewportChange.d.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/hooks/useOnSelectionChange.d.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/additional-components/NodeResizer/types.d.ts"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"useOnSelectionChange\\|useOnViewportChange\\|MiniMap\\|SnapGrid\\|useMoveSelectedNodes\\|useVisibleNodeIds\\|useVisibleEdgeIds\\|Background\\|ConnectionMode\" /Users/bsmonteiro/D`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":200,"offset":500}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":200,"offset":900}`

---

## Assistant

Now let me check for the Excalidraw features to understand the pattern:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"excalidraw\\|Excalidraw\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ExcalidrawEditor.tsx | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ExcalidrawEditor.tsx","limit":150,"offset":150}`

---

## Assistant

Now let me check the docs for the file type editor pattern:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides/add-file-type-editor.md"}`

---

## Assistant

Perfect! I now have all the information needed. Let me compile a comprehensive research report.

## Research Report: React Flow Modern Features & Canvas Gaps

Based on my research of React Flow v12.10.1 and BrainMap's Canvas implementation, here's what modern features are available but NOT yet used:

### **1. React Flow Built-in Components Available (But Not Used)**

#### **MiniMap Component**
- **What it does**: Small viewport overview in corner showing zoom level, panned area, and navigable mask
- **Props**:
  - `position`: `PanelPosition.TopLeft | TopRight | BottomLeft | BottomRight` (default: BottomRight)
  - `pannable`: Enable dragging viewport in minimap
  - `zoomable`: Enable scroll-zooming in minimap
  - `nodeColor` / `nodeStrokeColor`: Customizable node appearance
  - `maskColor` (default: "rgba(240, 240, 240, 0.6)")
  - `onClick` / `onNodeClick` callbacks
- **Status in BrainMap**: **MISSING** — Canvas has no viewport overview
- **Comparable to**: Obsidian Canvas, Figma, tldraw, Miro all have minimaps

#### **Background Variants**
- **Current use**: Canvas uses `<Background variant="dots">`
- **Available variants**: `"dots"`, `"lines"`, `"cross"`
- **Advanced options**:
  - `gap`: Customizable spacing (tuple for x/y independence)
  - `size`: Pattern size
  - `offset`: Pattern offset
  - `lineWidth`: Stroke thickness
  - `bgColor`: Background color
  - `patternClassName` / `className`: Styling hooks
- **Status in BrainMap**: **PARTIALLY USED** — Only dots variant; other visual patterns not explored

#### **Controls Component Customization**
- **Current use**: Canvas has `<Controls />` (default setup)
- **Available props**:
  - `showZoom`, `showFitView`, `showInteractive` (all default true)
  - `orientation`: `"horizontal" | "vertical"` (default: vertical)
  - Position customizable via props
  - Callback hooks: `onZoomIn`, `onZoomOut`, `onFitView`, `onInteractiveChange`
  - Custom children support for adding extra controls
- **Status in BrainMap**: **BASIC** — Using defaults, no custom orientation or callbacks

#### **EdgeToolbar**
- **What it does**: Floating toolbar attached to edges (not nodes)
- **Props**: `edgeId` + standard HTML div attributes
- **Status in BrainMap**: **MISSING** — Canvas has node toolbars but NO edge toolbars
- **Use case**: Edge color picker, delete edge, edge weight/type controls

#### **NodeToolbar Position Control**
- **Current use**: Canvas uses basic node toolbars
- **Advanced options NOT used**:
  - `position`: Can be `Top | TopLeft | TopRight | Bottom | BottomLeft | BottomRight` (default: Top)
  - `align`: `"start" | "center" | "end"` (default: center)
  - `offset`: Custom spacing from node
  - `isVisible`: Show even when not selected
  - `nodeId`: Array of node IDs (group toolbar for multiple nodes)
- **Status in BrainMap**: **BASIC** — Toolbars positioned manually with inline styles

### **2. React Flow Hooks NOT Currently Used**

#### **useOnViewportChange**
```typescript
useOnViewportChange({
  onStart: (viewport) => {},
  onChange: (viewport) => {},
  onEnd: (viewport) => {}
});
```
- **Status in BrainMap**: **MISSING** — Currently uses `getViewport()` on demand, not lifecycle listeners
- **Use case**: Track zoom/pan changes for analytics, adaptive UI, syncing other views

#### **useOnSelectionChange**
```typescript
useOnSelectionChange({
  onChange: ({ nodes, edges }) => { /* sync toolbar state */ }
});
```
- **Status in BrainMap**: **MISSING** — Currently manually tracks selection via node.selected flags
- **Use case**: React to selection changes without polling, sync UI state cleanly

#### **useVisibleNodeIds / useVisibleEdgeIds**
- **Status in BrainMap**: **MISSING** — No visibility tracking
- **Use case**: Optimize rendering, analytics (what users see), lazy-load external data

#### **useMoveSelectedNodes**
- **Status in BrainMap**: **MISSING**
- **Use case**: Programmatically move selected nodes (arrow keys, alignment, distribution)

#### **useConnection**
- **Status in BrainMap**: **MISSING** — No active connection tracking
- **Use case**: Show connection preview, highlight valid drop targets

### **3. Snap-to-Grid & Connection Features NOT Implemented**

#### **SnapGrid**
- React Flow supports snapping via `snapGrid` prop on `<ReactFlow>`
- Accepts `[x, y]` grid size
- **Status in BrainMap**: **NOT IMPLEMENTED** — Free positioning only
- **Comparable tools**: Figma, tldraw, Obsidian Canvas

#### **Connection Modes & Customization**
- `ConnectionMode.Loose | Strict` (default: Loose)
- Custom connection validation callbacks
- `ConnectionLineType.Bezier | Straight | Step | SmoothStep | SimpleBezier`
- **Status in BrainMap**: **BASIC** — Default settings, all nodes/edges connectable

#### **Auto-Layout Utilities**
- React Flow provides utility functions for layout (getNodesBounds, etc.)
- **Status in BrainMap**: **BASIC** — Canvas uses manual layout, no grid-based snapping

### **4. Excalidraw Comparison (for pattern guidance)**

Excalidraw Editor uses:
- **Lazy loading pattern**: Dynamic import with singleton caching (already in BrainMap)
- **Auto-save with debounce**: 1500ms default (already in BrainMap Canvas)
- **Dirty tracking**: Via tabStore (already in Canvas)
- **Theme integration**: light/dark support via UIStore (partially in Canvas)
- **Error boundaries**: Class component wrapper (already in Canvas)

Canvas could adopt similar patterns for:
- Minimap toggling via UIStore
- Edge toolbar customization
- Selection hooks for cleaner sync

### **5. File Tree Drag-and-Drop Infrastructure**

The `fileTreeDnd.ts` utility provides:
- `computeNewPath()` — Calculate drop destination
- `isValidDrop()` — Validate drops
- `computeDropZone()` — Detect before/into/after zones
- Already handles folder hierarchy

**Gap**: **NO DND FROM FILE TREE TO CANVAS** — File dragging only works within FileTreePanel itself. Could be extended to:
1. Drag files from FileTreePanel onto canvas → creates file node
2. Drag canvas nodes to FileTreePanel → move to folder

### **6. Summary of Implementable Features (Priority Order)**

| Feature | Complexity | Impact | Type |
|---------|-----------|--------|------|
| **MiniMap** | Low | High | Discovery/Navigation |
| **useOnSelectionChange hook** | Low | Medium | Code quality |
| **Edge toolbars** | Medium | Medium | Node editing |
| **Snap-to-grid** | Medium | High | UX polish |
| **useVisibleNodeIds** | Medium | Medium | Performance |
| **File tree → canvas DnD** | Medium | High | Workflow |
| **Advanced background patterns** | Low | Low | Polish |
| **Connection preview** | Medium | Medium | UX/Clarity |
| **useMoveSelectedNodes** | Medium | Medium | Alignment tools |
| **useOnViewportChange** | Low | Low | Analytics/Sync |

### **Key Findings**

1. **Biggest gaps**: MiniMap, snap-to-grid, and file-tree drag-and-drop
2. **Quick wins**: useOnSelectionChange hook refactor, EdgeToolbar implementation
3. **Pattern alignment**: Canvas already follows ExcalidrawEditor patterns well (error boundaries, lazy loading, debounced save)
4. **React Flow version**: v12.10.1 is recent and feature-complete; BrainMap uses mature APIs
5. **Standards alignment**: Canvas is missing features that are standard in Obsidian Canvas, Figma, tldraw, Miro

These findings suggest the canvas is functionally complete for basic diagramming but lacks polish and discoverability features (minimap, snapping) that professional tools provide.

---

