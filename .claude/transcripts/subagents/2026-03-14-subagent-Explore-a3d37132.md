# 2026-03-14 — Subagent Transcript: Explore

**Date:** 2026-03-14 15:44:09
**Agent:** Explore
**Agent ID:** a3d3713244dce6f3d
**Parent Session:** 78937639-c1e4-41c2-9b87-357e7c33b4bf

---

## User

I need to understand the current graph view implementation and how "index" type notes work in BrainMap. Explore these areas:

1. The graph view component - how it renders, layout logic, initial load behavior. Look in `crates/app/src-tauri/../src/` for GraphView, graph-related components
2. The "index" note type in the data model - how it's defined, what special behavior it has (if any). Check `crates/core/src/` for note types, the data model
3. The seed dataset - look at any existing index-type notes in `seed/` to understand how they're used
4. Graph focus/filter functionality - how "Focus in Graph" works currently (`graphFocusFilter.ts` and related)
5. The fcose layout configuration and how the graph is initialized on workspace open

Be thorough - I need to understand the full picture of graph rendering and any existing "index" or hub-node concepts.

---

## Assistant

I'll conduct a thorough exploration of the graph view implementation, index note types, and related functionality. Let me start with multiple parallel searches.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -type f -name \"*.ts\" -o -name \"*.tsx\" | grep -i graph | head -20"}`

---

## Assistant

Let me continue with the exploration:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/crates/core/src/*.rs"}`

---

## Assistant

Now let me explore the Rust data model and index note type:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs","limit":150}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"seed/*.md"}`

---

## Assistant

Let me continue exploring the seed dataset and focus filter:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/seed -name \"*.md\" | wc -l"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -l \"type: index\" /Users/bsmonteiro/Desktop/Personal/brainmap/seed/*.md"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"note_type.*index\" /Users/bsmonteiro/Desktop/Personal/brainmap/seed/ 2>/dev/null | head -5"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"head -50 /Users/bsmonteiro/Desktop/Personal/brainmap/seed/*.md | grep -A 5 \"type:\""}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphFocusFilter.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs","offset":140,"limit":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/docs/"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/02-data-model.md","limit":100}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"head -100 /Users/bsmonteiro/Desktop/Personal/brainmap/seed/*.md | grep -B 5 -A 15 \"^type:\""}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/02-data-model.md","offset":100,"limit":100}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"note.*type.*index|index.*note.*type","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"index\" /Users/bsmonteiro/Desktop/Personal/brainmap/docs/08-seed-dataset.md | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/08-seed-dataset.md","offset":85,"limit":80}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/seed -name \"*Book of Why*\" -o -name \"*Waypoint*\""}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/seed/The Book of Why/The Book of Why.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts","limit":80}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphIcons.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","limit":100}`

---

## Assistant

Perfect! Now let me get a final look at the UIStore to understand the focus functionality:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"graphFocusPath\\|setGraphFocus\\|clearGraphFocus\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts | head -30"}`

---

## Assistant

Excellent. Now let me compile comprehensive findings:

## Exploration Report: Graph View Implementation and Index Note Type

I've conducted a thorough exploration of the graph view implementation, index note type, and related functionality. Here are my findings organized by area:

### 1. Graph View Component (`GraphView.tsx`)

**Rendering & Initialization:**
- Uses Cytoscape.js with fcose (force-directed) and dagre (hierarchical) layout algorithms
- Mounted in `containerRef` with preset layout initially, then runs force layout on data load
- First load applies staggered fade-in entrance animation (nodes fade in over ~8-300ms based on node count)
- Subsequent tab switches preserve pan/zoom state via `hasBeenFittedRef` flag
- Base node size is 18px, scales up by 2px per in-degree (larger nodes = more connections)

**Layout Configuration (`runLayout` function):**
- **Force layout** (fcose): idealEdgeLength=280, nodeRepulsion=75000, edgeElasticity=0.30, gravity=0.04, gravityRange=5.0, numIter=2500
- **Hierarchical layout** (dagre): rankDir=LR, nodeSep=60, rankSep=120 (filters edges to include only DIRECTIONAL_RELS)
- Both animate transitions over 500ms with ease-in-out-sine easing
- Fit-to-view with 40-60px padding on all sides

**Visual Features:**
- Icons from `graphIcons.ts` (Lucide SVG data URIs), colored by note type
- Node selection inverts icon color (white icon on type-colored background)
- Neighborhood highlighting on hover/click (dims non-neighbors to 12% opacity)
- Edge gradient colors (source→target node colors imperatively applied)
- Node labels hidden until ~127% zoom (`min-zoomed-font-size: 14` stylesheet rule)
- Tooltip on hover shows title, type pill, connection count, tags, summary (lazy-loaded via `getNodeSummary`)

**Interactive Features:**
- Click note node → selects + opens in editor
- Click folder node → triggers graph focus (shows folder + neighbors)
- Double-click any node → expands to show its neighbors (async load via `getNeighbors(path, 1)`)
- Edge label visibility toggled via zoom auto-show (≥0.8 zoom) or explicit toggle

**Advanced Visualizations:**
- **Minimap** (read-only second Cytoscape instance, 4px node scale)
- **Cluster hulls** (convex hull overlay via canvas, computed on layout stop)
- **Edge particles** (rAF canvas animation on edges, auto-disables at 200+ edges)

### 2. Index Note Type in Data Model

**Definition & Purpose:**
- Defined in `/docs/02-data-model.md` as: "A hub/waypoint that organizes other notes"
- One of 11 note types (concept, book-note, question, reference, **index**, argument, evidence, experiment, person, project, folder)
- Colored teal/cyan: `#1abc9c` in the palette
- Icon: Three horizontal lines with dots (Lucide "List" icon)
- **No special graph behavior** — treated like any other note type

**In the Seed Dataset:**
- Single example: `seed/The Book of Why/The Book of Why.md`
- Links to chapter notes via inline markdown in the body
- Frontmatter contains `type: index` plus book-specific fields: `book-title`, `publisher`, `isbn`, `year`
- Links to author via explicit frontmatter link (`authored-by` relationship)
- Contains section references in markdown: `- [Chapter Name](./path/Chapter.md)`

**No Special Rendering:**
- Graph renders index nodes identically to other note types (18px base size, scaled by in-degree)
- Folder nodes are virtual (`note_type: "folder"`) and auto-generated from directory structure — not user-created index types
- Index type is semantically a "hub note" but has no programmatic hub/central rendering behavior

### 3. Focus in Graph Functionality (`graphFocusFilter.ts`)

**Two Focus Modes:**

1. **Note Focus** (single note as focal point):
   - Shows focal note + all directly connected neighbors
   - Includes all edges between visible nodes
   - Returns `focalPath: string` for visual emphasis
   - Implementation: filter nodes where `path === focusPath || connectedEdges.includes(path)`

2. **Folder Focus** (folder as focal point):
   - Shows folder node itself + all notes in folder + their direct neighbors (1-hop)
   - Includes all edges between visible nodes
   - Returns `focalPath: null` (folder itself not individually highlighted)
   - Implementation: start with `folderPath + "/"` prefix match, expand to 1-hop neighbors

**Triggering Focus:**
- Right-click note/folder in Files panel → context menu "Focus in Graph"
- Click folder node in graph → `setGraphFocus(nodePath, "folder")`
- Re-click active Graph tab → `clearGraphFocus()`
- Escape key → would clear (if implemented in UI)

**UI Integration:**
- Focal node styled with `graph-focus-node` class (larger/distinct appearance)
- "Focus ×" button in GraphToolbar clears focus
- Stored in `UIStore.graphFocusPath` + `graphFocusKind`

### 4. Folder Nodes (Virtual Graph Nodes)

**Generation & Structure:**
- Created by `compute_folder_hierarchy(notes)` in `graph.rs`
- Auto-generated from directory structure, no backing `.md` file
- Every directory containing at least one note (directly or transitively) gets a folder node
- Workspace root is excluded (not represented as a node)

**Folder Node Properties:**
- `note_type: "folder"`
- `title: humanize_folder_name(basename)` — converts `my-folder` → `My Folder`
- `tags: []`
- `path: RelativePath` to directory

**Edges:**
- Folder → note edges: `contains` (implicit, from parent to direct children)
- Folder → subfolder edges: `contains` (implicit)
- Users can create explicit links to folder paths (folder paths appear in LinksEditor autocomplete with `(folder)` suffix)

**Graph Behavior:**
- Clicking folder node in graph triggers focus mode (not opening an editor)
- Folder nodes rendered with folder icon, gray color (`#8e8e93`)
- Barrel shape (ellipse like all nodes)

### 5. Graph Initialization on Workspace Open

**Sequence:**
1. `GraphView.tsx` mounts; `useEffect` initializes Cytoscape with `cytoscape()` config
2. `graphStore.loadTopology()` called → fetches `getGraphTopology()` from backend
3. Backend `get_graph_topology()` Tauri command:
   - Loads all notes and folder nodes
   - Computes all edges (explicit + implicit + inline)
   - Returns `Topology { nodes: Vec<NodeDto>, edges: Vec<EdgeDto> }`
4. GraphView syncs to Cytoscape: `cy.add([...cyNodes, ...cyEdges])`
5. `runLayout()` executes force layout
6. Staggered fade-in entrance animation begins
7. Graph is now interactive

**Performance Notes:**
- Nodes sized by in-degree after layout: `Math.max(BASE_NODE_SIZE, BASE_NODE_SIZE + indegree * 2)`
- Edge gradients applied imperatively post-add (Cytoscape doesn't support `data()` in gradient arrays)
- No max-depth limits on initial load (full topology always loaded)

### 6. Edge Types & Directionality

**15 Edge Types:**
- Hierarchical: `contains`, `part-of`
- Causal/Logical: `causes`, `supports`, `contradicts`, `extends`, `depends-on`, `exemplifies`
- Temporal: `precedes`, `leads-to`, `evolved-from`
- Associative: `related-to`, `authored-by`, `sourced-from`
- Inline (system): `mentioned-in`

**Directional Rels (for hierarchical layout filtering):**
```typescript
const DIRECTIONAL_RELS = new Set([
  "precedes", "leads-to", "causes", "extends", "depends-on",
  "evolved-from", "part-of", "contains"
])
```

**Edge Origin:**
- `Explicit` — from frontmatter links or inline markdown
- `Implicit` — from directory structure (folder contains edges)
- `Inline` — from in-content markdown links (generates `mentioned-in` edges)

---

## Summary

The graph view is a fully-featured, interactive Cytoscape-based visualization with:
- **Two layout algorithms** (force-directed for exploration, hierarchical for causal flows)
- **Rich visual language** (type-specific icons, colors, neighbor highlighting, tooltips)
- **Focus subgraph modes** (zoom into a note or folder + 1-hop neighbors)
- **Advanced overlays** (minimap, cluster hulls, edge particles)

**Index type** is a semantic note type for hub/waypoint notes (like "The Book of Why") but has **no special rendering or graph behavior**. It's treated identically to other note types. Folder nodes (virtual, auto-generated) are distinct and serve as structural hierarchy nodes.

**Graph initialization** is straightforward: fetch full topology → add to Cytoscape → run layout → animate entrance. No lazy-loading or progressive rendering — the full graph is always displayed.

---

