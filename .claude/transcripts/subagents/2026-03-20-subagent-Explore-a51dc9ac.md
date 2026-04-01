# 2026-03-20 — Subagent Transcript: Explore

**Date:** 2026-03-20 12:50:14
**Agent:** Explore
**Agent ID:** a51dc9ac00a40ecdb
**Parent Session:** b1d9eca6-8bb3-4c0b-8673-2c48c1a7ec0b

---

## User

Research canvas-style features for a knowledge graph note-taking app (BrainMap). I need to understand:

1. How Obsidian Canvas works — what's the .canvas file format? What can you place on a canvas? (notes, images, links, cards, groups)
2. What React Flow (reactflow.dev) offers — nodes, edges, custom node types, minimap, controls, layout algorithms
3. Are there other canvas libraries worth considering? (tldraw, xyflow, etc.)
4. What's the relationship between React Flow and xyflow?

Also search the BrainMap codebase for context:
- Check what graph visualization already exists (Cytoscape.js in GraphView)
- Look at the graph data model (nodes, edges, types) in the stores
- Check if there's any existing canvas or spatial layout work

Focus on practical integration details and what would make a canvas uniquely valuable when you already have a graph view (Cytoscape).

---

## Assistant

I'll research canvas features for knowledge graph apps and check the BrainMap codebase context. Let me start with parallel searches.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.{ts,tsx}"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/stores/**/*.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"docs/**/*.md"}`

---

## Assistant

Now let me read the GraphView and store files to understand the current visualization setup:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx","limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/07-roadmap.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/02-data-model.md","limit":150}`

---

## Assistant

Now let me search for any existing canvas research or spatial layout work:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"canvas|Canvas|spatial|layout|position|drag","path":"/Users/bsmonteiro/Desktop/Personal/brainmap","glob":"**/*.md","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/.claude -name \"*.md\" | head -20","description":"List research docs"}`

---

## Assistant

Let me check for existing canvas or excalidraw research:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/research/excalidraw-integration.md"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"react.?flow|xyflow|canvas|tldraw","glob":"**/*.{tsx,ts,md}","output_mode":"files_with_matches"}`

---

## Assistant

Now let me search for packages.json to see current dependencies, and look at the package.json:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/package.json"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cytoscape|layout|graph|fcose|dagre","glob":"**/package.json","output_mode":"content"}`

---

## Assistant

Let me find the correct package.json path:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -name \"package.json\" -type f | head -5","description":"Find package.json files"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json","limit":80}`

---

## Assistant

Great! Now let me search web for canvas libraries and Obsidian Canvas format details:

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"Obsidian Canvas .canvas file format structure JSON"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"React Flow reactflow nodes edges custom types minimap"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"xyflow vs React Flow relationship history"}`

---

## Assistant

Now let me search for tldraw and other canvas libraries:

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"tldraw infinite canvas library React features"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"canvas libraries knowledge graph diagram JavaScript 2025"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"\"canvas\" vs \"graph view\" knowledge management spatial positioning"}`

---

## Assistant

Perfect! Now let me get more specific technical details on Obsidian Canvas JSON format:

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://jsoncanvas.org/","prompt":"What are the node types and properties in JSON Canvas format? What can you place on canvas?"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"JSON Canvas specification node types file group text link properties"}`

---

## Assistant

Perfect! Now let me look at one more thing - checking if BrainMap has any existing position/spatial data in nodes:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"position|x:|y:|spatial|layout|coordinate","glob":"crates/core/src/**/*.rs","output_mode":"files_with_matches"}`

---

## Assistant

Let me check the data model and NodeDto to see if position data is already supported:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/generated/NodeDto.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs","limit":150}`

---

## Assistant

Perfect! Now I have enough information to compile the research. Let me create a comprehensive response:

## Canvas Features Research for BrainMap

Based on my research of the BrainMap codebase and canvas ecosystem, here's a comprehensive analysis:

---

### 1. Obsidian Canvas & JSON Canvas Format

**File Format (.canvas)**
Obsidian Canvas has been open-sourced as JSON Canvas—an open specification available at [jsoncanvas.org](https://jsoncanvas.org/). The `.canvas` file format is pure JSON, making it portable and language-agnostic.

**Canvas Elements (Node Types)**

You can place four primary types of elements on a JSON Canvas:

1. **Text Nodes** — Plain text or Markdown content stored directly in the canvas
2. **File Nodes** — References to other files/attachments (images, videos, PDFs) with optional subpath linking (e.g., link to a specific heading)
3. **Link Nodes** — Reference external URLs
4. **Group Nodes** — Visual containers with optional labels and background images

**Node Properties**
All nodes share common properties:
- `id` — unique identifier
- `type` — one of: `text`, `file`, `link`, `group`
- `x`, `y` — spatial coordinates on the canvas
- `width`, `height` — dimensions
- `color` (optional) — visual styling

**Edges (Connections)**
Edges connect nodes with properties like:
- `fromNode`, `toNode` — connected node IDs
- `fromSide`, `toSide` — connection points (top, right, bottom, left)
- `fromEnd`, `toEnd` — endpoint styling (e.g., `"arrow"`)

**Key Insight**: JSON Canvas is specifically designed for "spatial organization of information like a digital whiteboard" — it's fundamentally about **position and layout**, not just topology.

See: [JSON Canvas Specification](https://jsoncanvas.org/spec/1.0/) · [GitHub Repository](https://github.com/obsidianmd/jsoncanvas)

---

### 2. React Flow (@xyflow/react)

**What It Offers**

React Flow is a production-ready library for building node-based diagrams and flow visualizations in React. Key features:

**Node & Edge System**
- Declarative nodes and edges with custom types
- Pre-built edge types: bezier (default), straight, step, smoothstep
- Custom edge support for specialized routing/controls
- Custom node components with embedded forms, charts, interactive elements

**Interactive Features**
- Zoom and pan (momentum-based)
- Touch support
- Keyboard navigation
- Snap-to-grid

**Layout & Controls**
- Minimap component (with custom rendering via `nodeComponent` prop)
- Controls component (zoom buttons, fit view, lock)
- Background component with grid/dots
- Layout algorithms (must be manually integrated)

**State Management**
- React-based state management (hooks)
- Selection and multi-selection
- Node dragging and edge creation

**Package Evolution**
As of React Flow 12, the package is now published under the `@xyflow` organization as `@xyflow/react`. The organization xyflow develops both React Flow and Svelte Flow—they're not competing projects; xyflow created and maintains React Flow.

See: [React Flow Documentation](https://reactflow.dev/) · [MiniMap API](https://reactflow.dev/api-reference/components/minimap) · [Custom Nodes](https://reactflow.dev/learn/customization/custom-nodes)

---

### 3. tldraw — Infinite Canvas SDK

**Overview**
tldraw is a more feature-complete infinite canvas library designed for whiteboard-like experiences. It's heavier but more polished than React Flow for freeform canvas use cases.

**Key Capabilities**
- **Drawing & Design Tools** — pressure-sensitive drawing, geometric shapes, rich text, arrows
- **Collaboration** — real-time sync with presence, live cursors, cursor chat
- **Accessibility** — screen reader support, keyboard navigation
- **State Management** — high-performance signals library + record store
- **Customization** — custom shapes, tools, bindings, UI components
- **Additional Features** — copy/paste, undo/redo, cross-tab sync, image/video support, table mini-map

**Bundle Size & Complexity**
tldraw is significantly larger than React Flow (~2-3x), making it better suited for applications where drawing/whiteboarding is a primary use case rather than a secondary visualization.

See: [tldraw Documentation](https://tldraw.dev/) · [GitHub](https://github.com/tldraw/tldraw)

---

### 4. Other Canvas Libraries Worth Considering

**For Knowledge Graphs Specifically**

| Library | Use Case | Pros | Cons |
|---------|----------|------|------|
| **Cytoscape.js** | Force-directed graphs | BrainMap already uses it; mature; performance-tuned for large graphs | Layout algorithms fixed; harder to customize positions |
| **GoJS** | Diagrams with layouts | Enterprise-grade; flexible rendering (SVG/Canvas/WebGL) | Commercial license; steep learning curve |
| **yFiles** | Large complex graphs | Handles scale; multiple render modes | Expensive; complex API |
| **Fabric.js** | Canvas-based freeform | Low-level control; great for pixel-perfect drawing | Not graph-focused; requires manual layout |
| **Paper.js** | Vector graphics | Vector manipulation; Bézier curves | Not graph-focused; freeform only |

**Canvas vs SVG Trade-off**
For large graphs, canvas-based rendering performs better than SVG alternatives. However, SVG is better for interactive elements and accessibility. React Flow uses SVG; tldraw uses Canvas internally.

---

### 5. Canvas vs Graph View in BrainMap's Context

**Current BrainMap Setup**
- **Graph View** (Cytoscape.js): Force-directed visualization with 5 layout modes (hierarchical, radial, concentric, grouped, force)
- **No Spatial Persistence**: Node positions are computed by layout algorithms each time; not stored or persisted
- **Data Model**: `NodeDto` contains only `path`, `title`, `note_type`, `tags`, `modified` — no position data

**What a Canvas View Would Add**

| Aspect | Graph View | Canvas View |
|--------|-----------|-------------|
| **Layout** | Algorithmic (force-directed, etc.) | User-controlled (manual positioning) |
| **Persistence** | Temporary (recomputed on open) | Persistent (stored per canvas) |
| **Interaction** | Graph-centric (click, expand, zoom) | Spatial-centric (drag, annotate, group) |
| **Use Case** | "How do my notes relate?" | "How do I want to organize this thinking?" |
| **Visual Mixing** | Pure node-link diagrams | Mixed: text, images, files, links, groups |
| **Collaboration** | Single view | Multiple independent canvases |

**Unique Value of Canvas for BrainMap**
A canvas would enable:
1. **Spatial thinking** — arrange ideas the way you naturally think about them
2. **Multiple perspectives** — create different canvases for different projects/arguments
3. **Richer annotations** — place text blocks, images, and groupings alongside notes
4. **Persistent layouts** — save a specific "view" without recomputing it
5. **Visual context** — see relationships and context without switching to editor

---

### 6. Practical Integration Path for BrainMap

**Option A: Minimal (React Flow-based Canvas View)**

Add a third tab (alongside Graph + Files) using React Flow:
1. Create `.canvas` files (JSON Canvas format) as a new file type
2. Build a `CanvasView.tsx` component on React Flow
3. Sync node positions to `.canvas` files
4. Link canvas nodes to BrainMap notes by path/ID
5. **No backend changes needed** — canvas is purely UI/layout

**Estimated effort**: 2-3 weeks (new tab, component, file I/O)

**Option B: Hybrid (Obsidian-style)**

Support `.canvas` files while keeping both Graph and Canvas views:
1. `.canvas` files become first-class objects in BrainMap (like Excalidraw integration already researched)
2. Gallery view of canvas files in File tree
3. Canvas editor using React Flow or tldraw
4. Optionally index canvas text content in FTS5

**Estimated effort**: 3-4 weeks

**Option C: Canvas-First Redesign (High effort, high impact)**

Make canvas the primary view with graph as a detail view. Requires:
1. Position persistence in Frontmatter (new optional `x`, `y` fields)
2. Per-segment canvas state (which notes are visible, their positions)
3. Zustand store for canvas layout
4. Layout sync via Tauri commands

**Estimated effort**: 6-8 weeks (architectural changes)

---

### 7. Implementation Considerations for BrainMap

**Data Model Impact**

Currently, BrainMap's `Frontmatter` includes position-agnostic fields. To support canvas-style positioning, you'd need:

```rust
// Option: Per-canvas position metadata (not in frontmatter)
#[derive(Serialize, Deserialize)]
pub struct CanvasNode {
    pub path: String,
    pub x: f32,
    pub y: f32,
    pub width: Option<f32>,
    pub height: Option<f32>,
    pub color: Option<String>,
}
```

This could live in a **separate `.canvas` metadata file** (like Obsidian's approach) rather than cluttering the note frontmatter.

**Bundle Size**

- **React Flow**: Minimal (~50KB gzipped) — minimal overhead
- **tldraw**: Significant (~500KB+) — consider lazy loading
- **JSON Canvas parsing**: Trivial (simple JSON schema)

**Compatibility**

React Flow is already used by many knowledge management tools (LogSeq, Obsidian plugins). Using it would:
- Make BrainMap canvases potentially interoperable with other tools
- Align with existing ecosystem patterns
- Reduce custom code

---

### Recommendation

For BrainMap, **React Flow with JSON Canvas format** offers the best balance:

1. **React Flow** provides the core canvas/diagram UI without over-engineering (vs tldraw's whiteboard features)
2. **JSON Canvas** is open, portable, and understood by the ecosystem
3. **Minimal backend changes** — position data stays in canvas files, not in notes
4. **Additive** — coexists with existing Cytoscape graph view
5. **Establishes the possibility of canvas-based workflows** without requiring architectural overhaul

**First Step**: Create a research/prototype branch using React Flow to add a basic canvas editor for `.canvas` files, similar to the Excalidraw integration already planned.

---

### Sources

- [Announcing JSON Canvas: Obsidian](https://obsidian.md/blog/json-canvas/)
- [JSON Canvas Official Spec](https://jsoncanvas.org/)
- [JSON Canvas GitHub Repository](https://github.com/obsidianmd/jsoncanvas)
- [React Flow Documentation](https://reactflow.dev/)
- [React Flow 12 Release & xyflow Rebranding](https://xyflow.com/blog/react-flow-12-release)
- [xyflow GitHub Repository](https://github.com/xyflow/xyflow)
- [tldraw Documentation](https://tldraw.dev/)
- [Top JavaScript Graph Visualization Libraries](https://linkurious.com/blog/top-javascript-graph-libraries/)
- [Canvas vs Graph View in Knowledge Management](https://scrintal.com/comparisons/obsidian-alternatives-with-robust-graph-features)

---

