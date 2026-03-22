> **Note:** This file was written pre-implementation (planning phase). For the actual as-built architecture, see `docs/canvas-architecture.md`.

# Canvas Integration Research

## Overview

Adding `.canvas` file support to BrainMap using React Flow (@xyflow/react) and the open JSON Canvas specification. Canvases provide spatial, curated views of notes — complementing the automatic graph view.

---

## JSON Canvas Spec (jsoncanvas.org/spec/1.0)

### Top-level structure
```json
{ "nodes": [...], "edges": [...] }
```

### Node types

All nodes share: `id`, `type`, `x`, `y`, `width`, `height`, `color?`

| Type | Extra fields | Purpose |
|------|-------------|---------|
| `text` | `text` (markdown string) | Freestanding text card |
| `file` | `file` (path), `subpath?` (#heading) | Reference to a real file |
| `link` | `url` | External URL |
| `group` | `label?`, `background?`, `backgroundStyle?` | Visual container |

### Edge properties
`id`, `fromNode`, `toNode`, `fromSide?`, `toSide?`, `fromEnd?` (none/arrow), `toEnd?` (none/arrow), `color?`, `label?`

### Color values
Hex (#RRGGBB) or presets: "1" (red), "2" (orange), "3" (yellow), "4" (green), "5" (cyan), "6" (purple)

### Groups
Flat in the array — containment is visual (positional), not hierarchical in JSON.

---

## React Flow (@xyflow/react v12)

### Key facts
- Bundle: ~50KB gzipped
- Peer deps: React >=17, React-dom >=17
- CSS: `@xyflow/react/dist/style.css` (mandatory)
- Dark mode: `<ReactFlow colorMode="dark" />`
- Works in Tauri v2 WebKit webviews

### Core APIs
- `useNodesState()` → `[nodes, setNodes, onNodesChange]`
- `useEdgesState()` → `[edges, setEdges, onEdgesChange]`
- `useReactFlow()` → `toObject()`, `setViewport()`, `screenToFlowPosition()`
- Custom node types: plain React components receiving `{ id, data, selected, ... }`
- Custom edge types with `EdgeLabelRenderer` for labels
- Built-in: `MiniMap`, `Controls`, `Background`, `Panel`

### Serialization
`toObject()` returns `{ nodes, edges, viewport: { x, y, zoom } }` — maps cleanly to JSON Canvas.

### External drag-and-drop
Not built-in. Pattern:
1. `dragstart` on file tree sets `dataTransfer` with path
2. `drop` on ReactFlow container
3. `screenToFlowPosition()` to convert drop coords
4. `setNodes()` to add new node

### JSON Canvas → React Flow translation

| JSON Canvas | React Flow |
|---|---|
| `x, y` | `position: { x, y }` |
| `width, height` | `style: { width, height }` or `measured` |
| `fromNode/toNode` | `source/target` |
| `fromSide/toSide` | Handle IDs (top/right/bottom/left) |
| `fromEnd/toEnd` | `markerStart/markerEnd` |
| `color` | `data.color` or `style` |
| Node `type` | Custom node type name |
| Array order | `zIndex` property |

---

## BrainMap integration points

### Existing DnD infrastructure
- FileTreePanel uses `dataTransfer.setData("application/brainmap-path", path)` and `"application/brainmap-is-folder"`
- Utilities in `fileTreeDnd.ts`: `computeNewPath()`, `isValidDrop()`, etc.

### Note data available for cards
- `NodeDto`: `path, title, note_type, tags, modified`
- `NodeSummaryDto`: + `status, summary`
- Access via `graphStore.nodes.get(path)` or `api.getNodeSummary(path)`

### File I/O
- `readPlainFile(path)` / `writePlainFile(path, body)` — same as Excalidraw pattern
- Debounced auto-save with module-level `pendingSaves` map

### Tab system
- Add `"canvas"` to `TabState.kind` union
- Follow `add-file-type-editor.md` guide (14 steps)
- Route in EditorPanel, TabBar, tabActions, App.tsx shortcuts

---

## Custom node types needed

### 1. FileNode (note reference)
Renders a card with the note's title, type badge, tags, and summary. Click opens the note. Shows broken-reference state if the file was deleted.

### 2. TextNode
Renders inline markdown (or plain text). Editable on double-click.

### 3. LinkNode
Renders URL with title/favicon preview.

### 4. GroupNode
Renders a labeled container with optional background color. Nodes inside it visually belong to the group.

---

## Seed dataset canvas examples

### "The Causal Hierarchy" canvas
- 3 groups (Rung 1/2/3) arranged vertically
- File nodes: Seeing vs Doing, Do-Calculus, Counterfactual Reasoning, RCTs, Bayesian Networks
- Edges showing progression between rungs
- Text card summarizing the hierarchy

### "The Smoking Controversy" canvas
- Center: Evidence/smoking-lung-cancer.md
- Left/right: People/ronald-fisher.md, People/karl-pearson.md
- Edges with "contradicts" labels
- Text card with synthesis annotation
