# 2026-03-10 — Subagent Transcript: Explore

**Date:** 2026-03-10 11:30:10
**Agent:** Explore
**Agent ID:** add5573602e37c6df
**Parent Session:** 122b6c40-2be7-4135-a320-7761b83206bc

---

## User

Explore the BrainMap desktop app's graph visualization to understand current node/edge styling, layout, and toolbar options. Focus on:

1. Read `crates/app/src/components/GraphView/graphStyles.ts` — full content
2. Read `crates/app/src/components/GraphView/GraphToolbar.tsx` — full content
3. Read `crates/app/src/components/GraphView/GraphLegend.tsx` — full content
4. Read `crates/app/src/stores/uiStore.ts` — what state is exposed for graph display (showEdgeLabels, showLegend, graphLayout, etc.)
5. Check `crates/app/src/App.css` for `.graph-container` rules

Report: exact current values for node sizes, edge widths, colors, what toolbar controls exist, what Cytoscape layout properties are currently used.

---

## Assistant

I'll explore the BrainMap desktop app's graph visualization system. Let me start by reading the key files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphToolbar.tsx"}`

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

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Now let me check how the graph layout is actually configured and look for the Cytoscape configuration:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/GraphView/*.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

Perfect! I have all the information needed. Let me compile the comprehensive report.

## Report: BrainMap Desktop App Graph Visualization

### 1. **Node Styling** (`graphStyles.ts`)

**Base node dimensions:**
- **Width/Height:** 24px (with 2px increase on selection to 30px)
- **Dynamic sizing:** Applied in `GraphView.tsx` line 215: `Math.max(20, 20 + n.indegree(false) * 4)` — each incoming edge adds 4px to base 20px, with minimum of 20px

**Colors (10 note types):**
- concept: `#4a9eff` (light blue)
- book-note: `#9b59b6` (purple)
- question: `#e67e22` (orange)
- reference: `#1abc9c` (teal)
- index: `#34495e` (dark gray)
- argument: `#e74c3c` (red)
- evidence: `#27ae60` (green)
- experiment: `#f39c12` (golden)
- person: `#2980b9` (dark blue)
- project: `#8e44ad` (dark purple)
- *fallback:* `#95a5a6` (light gray for unknown types)

**Node text styling:**
- Font size: 10px
- Text color: `#666` (dark gray)
- Vertical alignment: bottom
- Horizontal alignment: center
- Text max-width: 80px with ellipsis wrap
- Text margin below node: 4px

**Selected state:**
- Border width: 3px
- Border color: `#ff6b6b` (red)
- Size expansion: 24px → 30px

**Highlighted state (neighbors of selected node):**
- Border width: 2px
- Border color: `#ff6b6b` (red)

---

### 2. **Edge Styling** (`graphStyles.ts`)

**Base edge properties:**
- **Width:** 1.5px
- **Line color:** `#ccc` (light gray)
- **Arrow shape:** triangle (targeted)
- **Arrow color:** `#ccc` (light gray)
- **Curve style:** bezier
- **Text font-size:** 8px
- **Text color:** `#999` (medium gray)
- **Text rotation:** autorotate
- **Text margin:** -8px on Y-axis

**Edge variants:**

| State | Property | Value |
|-------|----------|-------|
| **Highlighted** | Line color | `#ff6b6b` (red) |
| | Arrow color | `#ff6b6b` (red) |
| | Width | 2.5px (↑ from 1.5px) |
| **Implicit edges** | Line style | dashed [4, 4] |
| **Inline edges** | Line style | dotted |

**Label visibility:** Controlled by `.labeled` class—when active or when selectedNodePath is set, `label: "data(label)"` displays edge relationship name.

---

### 3. **Toolbar Controls** (`GraphToolbar.tsx`, lines 14–51)

The toolbar has 4 interactive controls:

1. **"Labels" button**
   - Toggles `showEdgeLabels` state
   - Active class applied when `true`
   - Title: "Toggle edge labels"

2. **"Legend" button**
   - Toggles `showLegend` state
   - Active class applied when `true`
   - Title: "Toggle color legend"

3. **Layout dropdown (2 options)**
   - Options: "Force Layout" (value: `force`) | "Hierarchical (LR)" (value: `hierarchical`)
   - Triggers `setGraphLayout(e.target.value)`

4. **Type filter dropdown (placeholder)**
   - Options: "All Types" + dynamic list from `noteTypes` array
   - Currently logs selection but **no filtering logic implemented** (line 40: `console.log("Filter by type:", e.target.value)`)
   - Expected for future use

---

### 4. **Graph Legend** (`GraphLegend.tsx`, styled in `App.css` lines 677–706)

**Legend display:**
- Positioned absolutely: top 44px, right 8px, z-index 10
- Background: `var(--bg-primary)` (white in light mode, `#1e1e1e` in dark)
- Border: 1px solid `var(--border-color)`
- Border-radius: 6px
- Padding: 8px 10px
- Box-shadow: `0 2px 8px rgba(0, 0, 0, 0.15)`

**Individual items:**
- Display: flex, column, gap 4px
- Font-size: 11px
- Swatch: 10px × 10px circle (matches each NOTE_TYPE_COLORS entry)
- Label: uses `var(--text-secondary)` color

---

### 5. **Cytoscape Layout Configuration** (`GraphView.tsx`, lines 39–66)

**Force Layout (fcose plugin):**
```
name: "fcose"
animate: false
quality: "proof"
idealEdgeLength: 120
nodeRepulsion: 8000
gravity: 0.25
fit: true
padding: 40
nodeDimensionsIncludeLabels: true
```

**Hierarchical Layout (dagre plugin, Left-to-Right):**
```
name: "dagre"
rankDir: "LR"
nodeSep: 60         (horizontal spacing between nodes)
rankSep: 120        (vertical spacing between ranks)
animate: false
fit: true
padding: 40
```
- Filters elements to include only nodes and edges with relationship labels in `DIRECTIONAL_RELS` set (lines 17–26): precedes, leads-to, causes, extends, depends-on, evolved-from, part-of, contains

---

### 6. **UI State Management** (`uiStore.ts`)

**Graph-related state:**
- `showEdgeLabels: boolean` (default: `false`)
- `showLegend: boolean` (default: `false`)
- `graphLayout: "force" | "hierarchical"` (default: `"force"`)
- `focusMode: boolean` (default: `false`) — separate feature, not graph-specific

---

### 7. **CSS Graph Container** (`App.css`, lines 97–101)

```css
.graph-container {
  width: 100%;
  flex: 1;
  min-height: 0;
}
```

Simple flex container; Cytoscape renders directly into it.

---

### 8. **Additional Smart Features**

1. **Auto-show labels on zoom** (lines 152–159): When zoom ≥ 0.8, labels display automatically even if toggle is off.

2. **Node sizing by in-degree** (lines 214–217): Each incoming edge adds 4px (capped at 20px min, no stated max).

3. **Tooltip on hover** (lines 161–172): Shows node title and note type with rendered position offset (+12px X, -8px Y).

4. **Selected node highlighting** (lines 225–247): Selects node, highlights connected edges (2.5px red), highlights neighbors with `highlighted` class.

5. **Tree toggle resize handling** (lines 93–102): Triggers `cy.resize()` and conditional `fit()` when file tree becomes visible.

---

### Summary Table

| Aspect | Current Value |
|--------|---------------|
| **Node base size** | 24×24 px |
| **Node size by in-degree** | 20 + (indegree × 4) px, min 20, max varies |
| **Node text size** | 10px |
| **Edge width** | 1.5px (standard), 2.5px (highlighted) |
| **Edge arrow** | Triangle, `#ccc` (standard), `#ff6b6b` (highlighted) |
| **Selected node border** | 3px `#ff6b6b` (red) |
| **Force layout ideal edge length** | 120px |
| **Force layout node repulsion** | 8000 |
| **Dagre node spacing** | 60px (horizontal), 120px (vertical) |
| **Toolbar buttons** | Labels (toggle), Legend (toggle), Force/Hierarchical (select), Type filter (select, non-functional) |
| **Legend position** | Absolute: top 44px, right 8px |
| **Color palette** | 10 type-specific + 1 fallback (16 total swatches) |
| **Cytoscape zoom range** | 0.1x – 5x, wheel sensitivity 0.3 |

---

