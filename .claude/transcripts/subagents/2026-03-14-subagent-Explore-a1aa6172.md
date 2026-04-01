# 2026-03-14 — Subagent Transcript: Explore

**Date:** 2026-03-14 15:47:48
**Agent:** Explore
**Agent ID:** a1aa6172d0ad68f66
**Parent Session:** 78937639-c1e4-41c2-9b87-357e7c33b4bf

---

## User

Explore the graph layout implementation in the BrainMap desktop app thoroughly. I need to understand:

1. The `runLayout` function in GraphView.tsx - full implementation, all layout options, parameters
2. The GraphToolbar component - how layout switching works, what options are exposed
3. Any layout-related configuration or constants
4. The cytoscape extensions being used (fcose, dagre) and how they're registered
5. How layout interacts with focus mode, filtering, animations

Look in `crates/app/src/` for all graph-related files. I need the actual code for the layout logic, not just descriptions.

---

## Assistant

I'll conduct a thorough exploration of the graph layout implementation in the BrainMap desktop app. Let me start by mapping out the relevant files and then examining each component.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*[Gg]raph*.{tsx,ts,jsx,js}"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*[Ll]ayout*.{tsx,ts,jsx,js}"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f \\( -name \"*.tsx\" -o -name \"*.ts\" \\) | grep -iE \"(graph|layout|cytoscape)\" | head -20"}`

---

## Assistant

Now let me examine the main GraphView component and related files:

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts"}`

---

## Assistant

Now let me examine the UI store and focus filter logic:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphFocusFilter.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphHulls.ts"}`

---

## Assistant

Let me continue examining more of the UIStore and other related components:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","offset":150,"limit":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphParticles.ts"}`

---

## Assistant

Let me continue reading more of the UIStore to get the complete action definitions:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","offset":350,"limit":250}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphIcons.ts","limit":100}`

---

## Assistant

Now let me check the GraphLegend component and any CSS files related to the graph:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphLegend.tsx"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*.css\" | grep -i graph"}`

---

## Assistant

Let me search for CSS files in the main app directory:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*.css\" | head -20"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*.module.css\" | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":200,"limit":300}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"graph-toolbar\\|graph-container\\|graph-legend\\|graph-minimap\\|graph-canvas\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -30"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1940,"limit":250}`

---

## Assistant

Now let me look at the graph store and any graph test files to understand more context:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/*.test.ts 2>/dev/null | head -5"}`

---

## Assistant

Perfect. Now let me create a comprehensive summary document based on all the code I've examined. Let me compile my findings:

## Comprehensive Graph Layout Implementation Report

Based on my thorough exploration of the BrainMap desktop app codebase, here's the complete implementation of the graph layout system:

### 1. **runLayout Function** (GraphView.tsx, lines 48-82)

```typescript
function runLayout(cy: Core, layout: "force" | "hierarchical", animate = false) {
  if (layout === "hierarchical") {
    cy.elements()
      .filter((el) => el.isNode() || DIRECTIONAL_RELS.has(el.data("label") as string))
      .layout({
        name: "dagre",
        rankDir: "LR",
        nodeSep: 60,
        rankSep: 120,
        animate,
        animationDuration: 500,
        animationEasing: "ease-in-out-sine",
        fit: true,
        padding: 40,
      } as cytoscape.LayoutOptions)
      .run();
  } else {
    cy.layout({
      name: "fcose",
      animate,
      animationDuration: 500,
      animationEasing: "ease-in-out-sine",
      quality: "proof",
      idealEdgeLength: 280,
      nodeRepulsion: 75000,
      edgeElasticity: 0.30,
      gravity: 0.04,
      gravityRange: 5.0,
      numIter: 2500,
      fit: true,
      padding: 60,
      nodeDimensionsIncludeLabels: false,
    } as cytoscape.LayoutOptions).run();
  }
}
```

**Key characteristics:**
- Two layout modes: "force" (fcose) and "hierarchical" (dagre)
- **Force layout (fcose)**:
  - Quality: "proof" (highest accuracy)
  - Ideal edge length: 280px
  - Node repulsion: 75000 (very strong spread)
  - Edge elasticity: 0.30
  - Gravity: 0.04 (weak gravitational pull)
  - Gravity range: 5.0
  - Iterations: 2500 (thorough computation)
  - Fit to view with 60px padding
- **Hierarchical layout (dagre)**:
  - Direction: LR (left-to-right)
  - Node separation: 60px
  - Rank separation: 120px
  - Only applies to nodes + directional edge types (precedes, leads-to, causes, extends, depends-on, evolved-from, part-of, contains)
  - Fit to view with 40px padding

### 2. **GraphToolbar Component** (GraphToolbar.tsx)

Exposes layout switching and other graph controls:
- **Layout selector** (lines 56-62): Dropdown with "Force Layout" and "Hierarchical (LR)" options
- **Layout switching** (line 58): `setGraphLayout(e.target.value as "force" | "hierarchical")`
- **Additional buttons**:
  - Labels — toggle edge labels
  - Legend — toggle type color legend
  - Edges — filter edge types with popover (shows visible/total count)
  - Minimap — toggle minimap widget
  - Hulls — toggle cluster convex hulls
  - Particles — toggle edge particle animation
  - Focus × (when active) — exit focus mode

All toolbar buttons trigger UIStore actions.

### 3. **Layout Configuration in UIStore** (uiStore.ts)

**State definition:**
- `graphLayout: GraphLayout` (line 154) — type `"force" | "hierarchical"`
- Persisted actions:
  - `setGraphLayout: (layout: GraphLayout) => void` (line 192, implemented at 393)
  - `toggleEdgeLabels: () => void` (line 190, implemented at 391)
  - `toggleLegend: () => void` (line 191, implemented at 392)

**Initialization:**
- Default: `graphLayout: "force"` (line 307)
- Not persisted to localStorage (only `brainmap:uiPrefs` stores theme, fonts, zoom, panel sizes, line numbers, and tab size defaults)

### 4. **Layout Synchronization** (GraphView.tsx)

**On layout change (lines 178-185):**
```typescript
useEffect(() => {
  graphLayoutRef.current = graphLayout;
  const cy = cyRef.current;
  if (cy && cy.nodes().length > 0) {
    runLayout(cy, graphLayout, true);  // animate=true on change
  }
}, [graphLayout]);
```

**On graph data sync (lines 410-411):**
- Initial layout run (no animation) when graph data changes
- `runLayout(cy, graphLayoutRef.current)`

### 5. **Cytoscape Extensions** (GraphView.tsx, lines 23-24)

```typescript
cytoscape.use(fcose);
cytoscape.use(dagre);
```

- **fcose**: Force-directed layout engine
  - Aggressive spacing parameters tuned for knowledge graphs
  - Good for organic, exploratory visualization
- **dagre**: Directed acyclic graph layout
  - Left-to-right hierarchical layout
  - Better for showing causality and dependencies

### 6. **Focus Mode Interaction** (lines 117-122, graphFocusFilter.ts)

Focus mode filters the graph before layout:
```typescript
const { filteredNodes, filteredEdges, focalPath } = useMemo(() => {
  if (!graphFocusPath || !graphFocusKind) {
    return { filteredNodes: [...nodes.values()], filteredEdges: edges, focalPath: null };
  }
  return filterGraphByFocus(nodes, edges, graphFocusPath, graphFocusKind);
}, [graphFocusPath, graphFocusKind, nodes, edges]);
```

**Two focus modes** (graphFocusFilter.ts):
1. **Note focus**: Shows focal note + all directly connected neighbors + edges between them
2. **Folder focus**: Shows all notes in folder + their direct neighbors (1-hop) + all edges between visible pairs

The filtered graph is then laid out — layout respects focus boundaries.

### 7. **Layout Animations**

- **Transition animations** (line 183): `runLayout(cy, graphLayout, true)` passes `animate=true`
  - Duration: 500ms
  - Easing: "ease-in-out-sine"
- **Entrance animations** (lines 414-433): Staggered fade-in on first load
  - Stagger: `Math.min(8, 300 / Math.max(nodeCount, 1))` milliseconds between nodes
  - Fades in via `opacity: 0` → `opacity: 1`
  - Safety net clears inline opacity after all stages complete

### 8. **Graph Rendering & Styling** (graphStyles.ts)

**Node size calculation** (lines 387-389):
```typescript
cy.nodes().forEach((n) => {
  n.data("size", Math.max(BASE_NODE_SIZE, BASE_NODE_SIZE + n.indegree(false) * 2));
});
```
- Base size: 18px
- Scales by in-degree (number of incoming edges)
- Selected nodes: 28px
- Highlighted nodes: 22px
- Focal nodes (focus mode): 32px

**Stylesheet** (graphStyles.ts, lines 41-199):
- All nodes: ellipse shape with SVG icon background
- Labels hidden until ~127% zoom (min-zoomed-font-size: 14px)
- Glow effect via shadow (blur 10px, opacity 0.7)
- Edge gradients: imperatively applied after cy.add() (lines 392-403)
  - Colors gradient from source → target node colors
- Hover/selection highlighting: opacity 0.25 → 0.5 → 1.0 neighborhood effect

### 9. **Additional Layout Features**

**Minimap** (lines 481-599):
- Read-only second Cytoscape instance with "preset" layout
- Mirrored positions sync'd after layout complete
- Canvas overlay draws viewport rectangle
- Updates on `layoutstop` event

**Cluster Hulls** (lines 601-635):
- Convex hull algorithm groups nodes by type (graphHulls.ts)
- Hulls computed in model coordinates (recomputed on layoutstop)
- Drawn on canvas overlay with padding = 30px
- Color per type with 7% fill opacity, 15% stroke opacity

**Edge Particles** (lines 637-657):
- Canvas animation: particles flow along edges
- 3-second animation loop with golden-ratio phase offset per edge
- Auto-disabled when >200 edges visible (performance)
- Cleanup on unmount via callback

### 10. **Edge Filtering** (GraphToolbar.tsx, lines 73-86)

```typescript
const edgeTypes = Array.from(new Set(edges.map((e) => e.rel))).sort();
// Popover shows all edge types with checkboxes
// toggleEdgeType adds/removes from hiddenEdgeTypes Set
// In GraphView: validEdges filter excludes hidden types (line 380)
```

### 11. **Configuration Constants**

**Base node size:**
```typescript
const BASE_NODE_SIZE = 18;
```

**Directional relationships** (lines 26-35):
```typescript
const DIRECTIONAL_RELS = new Set([
  "precedes", "leads-to", "causes", "extends",
  "depends-on", "evolved-from", "part-of", "contains",
]);
```
Only these edges render in hierarchical layout; non-directional edges are excluded.

### 12. **Edge Label Visibility** (lines 37-46)

```typescript
function applyEdgeLabelVisibility(cy: Core, show: boolean, selectedPath: string | null) {
  if (show) {
    cy.edges().addClass("labeled");
  } else {
    cy.edges().removeClass("labeled");
  }
  if (selectedPath) {
    cy.getElementById(selectedPath).connectedEdges().addClass("labeled");
  }
}
```

- Manual toggle via toolbar
- Auto-show when zoom >= 0.8
- Connected edges always shown if a node is selected

### Summary of Files

| File | Purpose |
|------|---------|
| `/crates/app/src/components/GraphView/GraphView.tsx` | Main component, runLayout function, Cytoscape initialization, event handlers |
| `/crates/app/src/components/GraphView/GraphToolbar.tsx` | Layout dropdown + other toolbar buttons |
| `/crates/app/src/components/GraphView/graphStyles.ts` | Cytoscape stylesheet, node colors, styling rules |
| `/crates/app/src/components/GraphView/graphFocusFilter.ts` | Focus mode filtering logic |
| `/crates/app/src/components/GraphView/graphHulls.ts` | Convex hull computation and rendering |
| `/crates/app/src/components/GraphView/graphParticles.ts` | Edge particle animation |
| `/crates/app/src/components/GraphView/GraphLegend.tsx` | Type color legend display |
| `/crates/app/src/stores/uiStore.ts` | Layout state + all UI preferences |
| `/crates/app/src/stores/graphStore.ts` | Graph topology state |
| `/crates/app/src/App.css` | Styling for toolbar, legend, minimap, tooltips, canvas overlays |

The layout system is tightly integrated with the UI store for persistence/switching and responds dynamically to graph modifications, focus mode changes, and edge filtering. Both layout engines are tuned for knowledge graph visualization with aggressive spreading in force mode and clear hierarchical structure in dagre mode.

---

