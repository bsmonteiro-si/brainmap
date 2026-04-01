# 2026-03-10 — Subagent Transcript: Explore

**Date:** 2026-03-10 11:55:00
**Agent:** Explore
**Agent ID:** a6292463105dbf1c0
**Parent Session:** e775a4b6-ec6a-4752-8126-0b07a473af0a

---

## User

Explore the BrainMap desktop app frontend codebase at /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/. I need to understand:

1. The file tree / Files view component - how files/folders are listed, what click/right-click handlers exist, how nodes are selected
2. The Graph view component - how graph nodes are filtered/displayed, what props control what's shown
3. The tab switching mechanism between Graph/Files tabs (Cmd+B or tab toggle)
4. The Zustand store (AppState) - what state exists, especially around selectedNode, navigation between views
5. How the graph currently filters or focuses nodes (any existing "focus" or "filter" functionality)
6. The GraphView component and how it receives its data (does it filter edges/nodes by some criteria?)

Please look at:
- src/components/ directory structure
- src/store/ or any Zustand store files
- Any context or state management files

Return file paths and key code snippets relevant to navigation between views, node selection, and graph filtering.

---

## Assistant

I'll explore the BrainMap desktop app frontend codebase to understand these key aspects. Let me start by examining the directory structure and then dive into the specific components.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -type f -name \"*.tsx\" -o -name \"*.ts\" -o -name \"*.json\" | head -50"}`

---

## Assistant

Let me focus on the source files, not node_modules:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.{tsx,ts}"}`

---

## Assistant

Perfect! Now let me examine the key files. Let me start with the main App and store files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores"}`

---

## Assistant

Let me read the individual store files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

Now let me look at the Layout and GraphView components:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

Now let me check the GraphToolbar and other relevant components:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphToolbar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

Let me check the GraphLegend and get a view of the graphStyles:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphLegend.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts"}`

---

## Assistant

Let me check the InspectorPanel to understand how it displays node details:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Inspector/InspectorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx"}`

---

## Assistant

Perfect! Let me also check the API types to understand the data structures:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

Excellent! Now let me check for any filtering or focus mechanisms that might already exist by looking at the SearchPanel:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Search/SearchPanel.tsx"}`

---

## Assistant

Perfect! Now I have a comprehensive understanding of the codebase. Let me compile my findings into a clear report:

## BrainMap Desktop App Frontend - Comprehensive Analysis

I've completed a thorough exploration of the BrainMap desktop app frontend codebase. Here are my findings:

### 1. **File Tree / Files View Component**

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`

**Key Features:**
- Builds a hierarchical tree from flat nodes using `buildTree()` function
- Supports folder expansion/collapse with arrow icons (▾/▸)
- Folder nesting indicates directory hierarchy from node paths
- File filtering via search input that filters by title lowercase match
- Click handlers on files (`onClick`) call:
  - `useGraphStore.getState().selectNode(node.fullPath)` → sets `selectedNodePath`
  - `useEditorStore.getState().openNote(node.fullPath)` → loads note content
- Folders use `onClick` → `toggleFolder(node.fullPath)` to track expanded folders in `treeExpandedFolders` Set
- No right-click context menu implemented yet
- Active node highlighted with CSS class `active` when `selectedNodePath === node.fullPath`

**Props & State:**
- Reads from `useGraphStore`: `nodes` (Map of NodeDto)
- Reads from `useUIStore`: `treeExpandedFolders` (Set of fullPaths)
- Uses local state for filter query

### 2. **Graph View Component**

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx`

**Key Features:**
- Cytoscape.js instance with fcose + dagre layout plugins
- Filters and displays nodes/edges based on:
  - `hiddenEdgeTypes` Set (edges with these relationship types are excluded)
  - `nodes` Map and `edges` array from graphStore
- Node filtering happens in the sync effect (lines 200-219):
  - Validates edges exist in both source & target nodes
  - Excludes edges where `hiddenEdgeTypes.has(e.data.label)` is true
  - Clears and re-renders entire graph on data changes

**Click Handlers:**
- Single tap on node: `selectNode(nodePath)` + `openNote(nodePath)` → loads in editor
- Double-tap on node: `expandNode(nodePath)` → lazy-loads neighbors (depth=1)
- Tap on canvas (background): `selectNode(null)` → deselects

**Selection & Highlighting:**
- Selected node gets `selected` class (white border, larger shadow)
- Connected edges get `highlighted` class (bright, thicker)
- Neighbors get `highlighted` class
- Edge labels only visible when:
  - `showEdgeLabels` is true, OR
  - Zoom >= 0.8 (auto-show at close zoom), OR
  - Connected to selected node

**Tooltip on Hover:**
- Displays node title and note type at cursor position
- Only on node hover

**Layout System:**
- Two layouts available: `force` (fcose with aggressive repulsion) and `hierarchical` (dagre LR)
- Layout re-runs when `graphLayout` changes or data updates

### 3. **Tab Switching Mechanism (Graph/Files)**

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx`

**Tab Structure:**
- Left panel has two tabs: "Graph" and "Files"
- Tab buttons implement ARIA roles (`role="tab"`, `role="tabpanel"`)
- Actual switching uses CSS `display: flex/none` on tabpanel divs (lines 104, 112)
- Both panels stay mounted in DOM to preserve Cytoscape state

**Keyboard Shortcut (Cmd+B):**
- In `App.tsx` (line 69-72): Cmd+B calls `useUIStore.getState().toggleTree()`
- This toggles `treeOpen` boolean in UIStore

**Behavior:**
- When `treeOpen = false`: Graph panel visible, File panel hidden
- When `treeOpen = true`: File panel visible, Graph panel hidden
- Tab click handlers (lines 85, 95): Only toggle if switching to different tab (no-op if clicking active tab)
- When tab reveals Graph panel: checks if container was zero-sized on first reveal → calls `cy.resize()` + conditional `cy.fit()` (lines 101-103)

### 4. **Zustand Store Structure (AppState)**

**Three main stores:**

**A) `workspaceStore.ts`**
- `info: WorkspaceInfo | null` — workspace metadata
- `stats: StatsDto | null` — node/edge counts by type
- `noteTypes: string[]` — 10 types (concept, book-note, etc.)
- `edgeTypes: string[]` — 15 relationship types
- `openWorkspace(path)` → initializes workspace and loads stats
- `refreshStats()` → updates stats from backend

**B) `graphStore.ts`** — Main graph state
- `nodes: Map<string, NodeDto>` — all nodes keyed by path
- `edges: EdgeDto[]` — all edges
- `selectedNodePath: string | null` → **tracks which node is selected for display**
- `expandedNodes: Set<string>` — tracks which nodes have had neighbors loaded
- `isLoading: boolean`
- `loadTopology()` → fetches full graph
- `selectNode(path | null)` → sets `selectedNodePath` (used by graph, file tree, editor)
- `expandNode(path)` → lazy-loads neighbors via `getNeighbors(path, 1)` API
- `applyEvent(event)` → handles real-time node/edge creation/deletion/updates
- `createNote(path, title, type)` → optimistic create + sets selectedNodePath

**C) `uiStore.ts`** — UI toggles & preferences
- `treeOpen: boolean` — Graph/Files tab toggle
- `treeExpandedFolders: Set<string>` — file tree folder expansion state
- `hiddenEdgeTypes: Set<string>` → **edges whose rel type is hidden are filtered from graph**
- `showEdgeLabels: boolean` — toggles edge relationship labels
- `showLegend: boolean` — toggles color legend overlay
- `graphLayout: "force" | "hierarchical"` — layout algorithm
- `focusMode: boolean` — collapses graph panel, expands editor
- `panelSizes: PanelSizes` — persisted panel widths/heights
- `toggleTree()`, `toggleFolder()`, `toggleEdgeType()` — state mutations
- `savePanelSizes()` → persists to localStorage

**D) `editorStore.ts`** — Current note editing state
- `activeNote: NoteDetail | null` — currently open note with full content
- `isDirty: boolean` — unsaved changes
- `editedBody: string | null` — local edits before save
- `openNote(path)` → loads note from API
- `updateContent(body)` → sets isDirty=true
- `saveNote()` → writes back to API

**Data Flow for Node Selection:**
1. User clicks node in Graph OR file in FileTree OR search result
2. Both call `selectNode(path)` in graphStore
3. GraphView listens to `selectedNodePath` changes → highlights node and connected edges
4. Both call `openNote(path)` in editorStore → loads note content
5. EditorPanel renders active note, RelatedNotesFooter shows linked notes, InspectorPanel shows edges

### 5. **Graph Filtering & Focus Mechanisms**

**Current Filtering:**
1. **Edge Type Filter** (`hiddenEdgeTypes` Set):
   - UI: GraphToolbar has "Edges" button with popover checkboxes for each relationship type
   - Implementation: In GraphView sync effect, edges are filtered: `!hiddenEdgeTypes.has(e.data.label)`
   - Result: Excluded edge types don't render in Cytoscape

2. **Node Type Filter** (Incomplete):
   - GraphToolbar has a select dropdown "All Types" (lines 83-95)
   - Console.logs the selection but doesn't implement filtering yet
   - Would need to add `filteredNodeTypes` Set to UIStore and filter nodes in sync effect

3. **Focus Mode** (Collapse left panel):
   - `focusMode: boolean` in UIStore
   - Button in EditorPanel header toggles it (line 33)
   - When true: left panel collapses via AppLayout effect (line 30-35)
   - When false: left panel expands
   - Escape key also toggles focus mode

**Existing Graph Filtering in GraphView:**
- Lines 210-216: Validates edges, filters by `hiddenEdgeTypes`, removes disconnected edges
- Selection highlighting: `highlighted` class on neighbors and connected edges (lines 245-249)
- Label auto-show: At zoom >= 0.8, or when edge connects to selected node

### 6. **GraphView Component Data Flow**

**Input Props:** None (all via Zustand stores)

**Data from Stores:**
- `nodes, edges, selectedNodePath, isLoading` from graphStore
- `showEdgeLabels, graphLayout, treeOpen, hiddenEdgeTypes` from UIStore

**Cytoscape Sync (lines 186-230):**
1. Convert `nodes` Map → cyNodes array with id, label, color by note_type, size by in-degree (6px base + 2px per incoming edge)
2. Convert `edges` array → cyEdges with source, target, label (rel), kind
3. Filter edges: remove those with hidden types or invalid endpoints
4. Clear Cytoscape and add all elements
5. Run layout
6. Apply edge label visibility based on `showEdgeLabels` + zoom + selection

**Color Coding:**
- Uses `getNodeColor(note_type)` from graphStyles.ts
- 10-color palette in `NOTE_TYPE_COLORS` (concept=blue, book-note=purple, question=orange, etc.)
- GraphLegend displays all colors

**Node Sizing:**
- Base 6px diameter
- Scales by in-degree: `Math.max(6, 6 + n.indegree(false) * 2)` per edge
- Selected nodes override to 14px

### File Path Summary

Key source files:

```
/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/

Stores:
- stores/workspaceStore.ts        (workspace info, stats, node/edge types)
- stores/graphStore.ts             (nodes, edges, selectedNodePath, expandedNodes)
- stores/uiStore.ts               (tree toggle, edge filters, focus mode, layouts)
- stores/editorStore.ts           (active note content, dirty state)

Components:
- components/Layout/AppLayout.tsx            (3-panel layout, tab switching logic)
- components/Layout/FileTreePanel.tsx        (file tree with folders, search filter)
- components/GraphView/GraphView.tsx         (Cytoscape instance, click handlers)
- components/GraphView/GraphToolbar.tsx      (edge filter popover, layout selector)
- components/GraphView/GraphLegend.tsx       (color legend overlay)
- components/GraphView/graphStyles.ts        (Cytoscape stylesheet, color palette)
- components/Editor/EditorPanel.tsx          (note editor, focus mode toggle)
- components/Editor/RelatedNotesFooter.tsx   (incoming/outgoing links)
- components/Inspector/InspectorPanel.tsx    (node metadata, edge lists)
- components/Search/SearchPanel.tsx          (FTS search with type filter)

API:
- api/types.ts                      (TypeScript interfaces matching Rust DTOs)
- api/bridge.ts                     (API abstraction layer)
```

---

