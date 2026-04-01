# 2026-03-11 — Subagent Transcript: Explore

**Date:** 2026-03-11 20:01:59
**Agent:** Explore
**Agent ID:** ac3bc9f7332df3d5b
**Parent Session:** ad145178-00e1-406f-b483-a103e20c14d1

---

## User

Explore the graph view implementation in the BrainMap desktop app at /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/. I need to understand:

1. The full graph styling - find graphStyles.ts and read it completely
2. The GraphView component - how Cytoscape is configured, what stylesheet is applied
3. The graph toolbar component
4. Any CSS related to the graph view in App.css (search for graph-related classes)

Read ALL relevant files completely. I need to understand every visual aspect of the current graph.

---

## Assistant

I'll explore the graph view implementation in the BrainMap desktop app. Let me start by understanding the structure and then reading the key files.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -type f -name \"*.ts\" -o -name \"*.tsx\" -o -name \"*.css\" | grep -E \"(graph|cyto|style)\" | head -20"}`

---

## Assistant

Let me search more specifically for the source files:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/crates/app/src/**/*.{ts,tsx,css}","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/crates/app/src-tauri/**/*.{ts,tsx,css}","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

Perfect! I found the key files. Let me read them in order:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphToolbar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Excellent! Now let me read the GraphLegend component to complete the picture:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphLegend.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

Perfect! Now I have a complete picture of the graph visualization implementation. Let me compile a comprehensive summary of my findings:

## Complete Graph View Implementation Analysis

I've now read all the core graph visualization files for the BrainMap desktop app. Here's what you need to understand about the current graph styling and architecture:

### 1. **Graph Styles (`graphStyles.ts`)**

**Color Palette (NOTE_TYPE_COLORS):**
- `concept`: #4a9eff (bright blue)
- `book-note`: #f39c12 (orange)
- `question`: #9b59b6 (purple)
- `reference`: #7f8c8d (gray)
- `index`: #1abc9c (teal)
- `argument`: #e74c3c (red)
- `evidence`: #27ae60 (green)
- `experiment`: #e67e22 (dark orange)
- `person`: #e91e63 (pink)
- `project`: #00bcd4 (cyan)

**Node Styling (Cytoscape stylesheet):**
- **Base nodes**: 6px diameter, data-driven color, glowing shadow (blur: 10, opacity: 0.7)
- **Labels**: 11px font, light gray (#cccccc), hidden until zoom ≥127% (`min-zoomed-font-size: 14`)
- **Size scaling**: Starts at 6px base, increases by 2px per in-degree (indegree * 2)
- **Selected state**: 14px, white border (2px, opacity 0.9), enhanced glow (blur: 18, opacity: 1.0)
- **Highlighted state**: 10px, enhanced glow (blur: 12, opacity: 0.85)
- **Focus node state** (`.graph-focus-node`): 18px, white border (2.5px, opacity 1.0), brightest glow (blur: 24, opacity: 1.0)

**Edge Styling:**
- **Width**: 0.8px (thin, semi-transparent)
- **Color**: #aaaaaa with 0.35 opacity
- **Arrow**: vee shape, scale 0.6
- **Curve**: bezier
- **Labels**: 8px font, 0.75 opacity, auto-rotated
- **Special edge kinds**:
  - `Implicit`: dashed (4px dash, 4px gap)
  - `Inline`: dotted
- **Highlighted edges**: white color, 1.5px width, 0.85 opacity

---

### 2. **GraphView Component Architecture**

**Cytoscape Configuration:**
- Container: `.graph-container` div
- Min/max zoom: 0.1 to 5
- Wheel sensitivity: 0.3
- Layout preset: "preset" initially, then runs layout algorithm

**Data Flow:**
1. Graph data from `graphStore` (nodes and edges)
2. Filter by focus mode using `filterGraphByFocus()` (from `graphFocusFilter.ts`)
3. Transform to Cytoscape format with dynamic sizing (indegree-based)
4. Apply stylesheet and run layout

**Two Layout Algorithms:**
1. **Force Layout (fcose)**:
   - idealEdgeLength: 280
   - nodeRepulsion: 75000 (strong repulsion)
   - edgeElasticity: 0.30
   - gravity: 0.04
   - gravityRange: 5.0
   - numIter: 2500 (aggressive iterations for quality proof)
   - padding: 60px
   - nodeDimensionsIncludeLabels: false

2. **Hierarchical Layout (dagre)**:
   - Direction: left-to-right (LR)
   - nodeSep: 60px
   - rankSep: 120px
   - padding: 40px
   - Only applies to nodes + directional relationships (precedes, leads-to, causes, extends, depends-on, evolved-from, part-of, contains)

**Interactive Features:**
- **Single tap node**: Select and open in editor
- **Double-tap node**: Expand/collapse
- **Tap background**: Deselect
- **Zoom event**: Auto-show labels when zoom ≥0.8 (unless they're already shown via toggle)
- **Mouseover node**: Show tooltip with title and type
- **Mouseout node**: Hide tooltip

**Edge Label Visibility:**
- Controlled via `showEdgeLabels` toggle in toolbar
- Selected node's connected edges are always labeled
- Auto-show at zoom ≥0.8 regardless of toggle
- Applied via `.labeled` class, filtered by `hiddenEdgeTypes` Set

---

### 3. **GraphToolbar Component**

**Controls (in order):**
1. **Labels button**: Toggle edge label visibility
2. **Legend button**: Toggle color legend overlay
3. **Layout select**: Choose "Force Layout" or "Hierarchical (LR)"
4. **Edges button with popover**: 
   - Shows visible/total count when filtered: `Edges (N/M)`
   - Dropdown with checkboxes for each edge type
   - All edge types extracted from graph data and sorted
5. **Focus × button** (conditional): 
   - Appears only when `graphFocusPath` is active
   - Orange background (#e67e22)
   - Clears focus mode when clicked

**Styling (App.css lines 135–173):**
- Background: `var(--bg-secondary)`
- Buttons: 12px font, 4px padding, 1px border, 4px border-radius
- Active buttons: accent background + white text
- Selects: match button styling

---

### 4. **CSS Graph-Related Classes (App.css)**

**Container & Layout:**
- `.graph-container` (lines 128–133): 100% width, flex: 1, dark background (#13131a)
- `.graph-toolbar` (lines 135–173): flex row, 6px padding, 8px gap

**Legend (lines 1208–1237):**
- `.graph-legend`: Positioned absolute (top: 44px, right: 8px), card-style with shadow
- `.legend-item`: flex row with swatch (10px circle) + label
- `.legend-swatch`: data-driven color background
- `.legend-label`: text-secondary color

**Edge Filter Popover (lines 1239–1274):**
- `.edge-filter-popover`: Positioned absolute (top: 100% + 4px, left: 0), card with shadow
- `.edge-filter-item`: flex row, checkbox + label
- Checkbox accent color: `var(--accent)`

**Node Tooltip (lines 1276–1302):**
- `.graph-node-tooltip`: Positioned absolute (z-index: 20), pointer-events: none
- `.tooltip-title`: 600 weight, ellipsis overflow
- `.tooltip-type`: 10px font, muted color

**Focus mode styling:**
- Applied via `.graph-focus-node` class in stylesheet
- Also sets `treeOpen: false` atomically to close Files tab

---

### 5. **UIStore State Management**

**Graph-Related State:**
- `showEdgeLabels`: boolean (default false)
- `showLegend`: boolean (default false)
- `graphLayout`: "force" | "hierarchical" (default "force")
- `hiddenEdgeTypes`: Set<string> (persisted edge filter)
- `graphFocusPath`: string | null (note path for focus mode)
- `graphFocusKind`: "note" | "folder" | null
- `treeOpen`: boolean (left panel Files tab visibility)

**Persistence:**
- Panel sizes → `brainmap:panelSizes` localStorage
- Theme, fonts, zoom → `brainmap:uiPrefs` localStorage
- Workspace state resets on segment/workspace close

---

### 6. **Visual Design System**

**Dark Canvas Theme:**
- Graph background: #13131a (nearly black)
- Toolbar: secondary background
- Overlays (legend, tooltip, popover): primary background with borders
- All text on graph: light gray/accent colors for contrast

**Dark Mode Palette (from App.css lines 32–46):**
- Primary bg: #1e1e1e
- Secondary bg: #252525
- Tertiary bg: #333333
- Text primary: #e0e0e0
- Text muted: #666666
- Accent: #4a9eff (remains bright for interactive elements)

**Light Mode Palette (lines 3–22):**
- Primary bg: #ffffff
- Secondary bg: #f5f5f5
- Text primary: #1a1a1a
- Accent: #4a9eff

---

## Key Takeaways

1. **Node sizing by in-degree** is a fundamental visual feature—larger nodes represent more cited/referenced concepts
2. **Labels only appear at zoom ≥127%** to reduce visual clutter at normal zoom levels
3. **The glowing shadow effect** uses data-driven color matching the node color for visual cohesion
4. **Focal nodes in focus mode are visually enlarged and heavily highlighted** (18px + bright glow)
5. **Edge filtering is fully client-side** with a popover UI and persisted state
6. **The layout algorithms are aggressive** (75K repulsion, 2500 iterations for fcose) to ensure well-spread, non-overlapping nodes
7. **All graph interactivity hooks into Zustand stores** for state sync between toolbar, graph canvas, and editor
8. **The entire graph visual design uses consistent color-coding** across file tree dots, nodes, legend, and type pills

The implementation is highly polished with thought-out interactions, responsive visual feedback, and persistent user preferences.

---

