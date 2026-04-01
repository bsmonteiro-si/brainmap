# 2026-03-11 — Subagent Transcript: Plan

**Date:** 2026-03-11 20:07:21
**Agent:** Plan
**Agent ID:** acdbfc5999a2ac996
**Parent Session:** ad145178-00e1-406f-b483-a103e20c14d1

---

## User

I need to plan 12 visual upgrades for a Cytoscape.js graph in a Tauri/React desktop app. Here's the full context:

## Current Stack
- Cytoscape.js v3.31.0 with cytoscape-fcose and cytoscape-dagre
- React 18, TypeScript, Zustand state management
- Graph styled via `graphStylesheet` array (Cytoscape style objects)
- GraphView.tsx manages Cytoscape instance with useRef
- GraphToolbar.tsx has Labels, Legend, Layout, Edges buttons
- uiStore has graph-related state (showEdgeLabels, showLegend, graphLayout, etc.)

## Current Styling
- Nodes: 6px base, in-degree scaling (+2px per), colored by note type (10 types), glow shadow
- Edges: 0.8px width, #aaaaaa, 0.35 opacity, vee arrowheads, bezier curves
- Labels: hidden until zoom >= 127%
- Selected: white border, enhanced glow, neighbor highlighting
- Background: #13131a (dark)
- Toolbar: flat bg-secondary, basic buttons

## 12 Upgrades to Plan

1. **Neighborhood highlight on hover** — Hover node → dim everything else to ~15% opacity, brighten direct neighbors + connected edges
2. **Edge color gradients** — Edges gradient from source node color to target node color (instead of flat gray)
3. **Animated node entrance** — Nodes fade+scale in when graph loads/re-layouts (staggered ~300ms)
4. **Glassmorphism toolbar** — backdrop-filter: blur(12px) + semi-transparent bg
5. **Richer hover tooltip** — Mini-card with type pill, tag chips, summary preview, connection count
6. **Label background pills** — Semi-transparent dark background behind node labels
7. **Hover pulse animation** — Soft radial glow expansion on hover
8. **Smooth layout animation** — Animate node positions over ~500ms when switching layouts
9. **Different node shapes by type** — Circles for concepts, diamonds for questions, hexagons for people, etc.
10. **Cluster hulls** — Semi-transparent colored regions behind tightly connected node groups
11. **Edge directionality particles** — Tiny dots flowing along edges from source to target
12. **Minimap** — Overview rectangle in corner showing full graph with viewport indicator

## Cytoscape Capabilities (important for feasibility)
- Cytoscape supports these node shapes natively: ellipse, triangle, rectangle, roundrectangle, barrel, diamond, pentagon, hexagon, heptagon, octagon, star, tag, rhomboid, vee, concavehexagon
- Cytoscape supports `line-gradient-stop-colors` and `line-gradient-stop-positions` for edge gradients
- Cytoscape `animate` option in layouts handles smooth transitions natively
- Cytoscape has `compound` nodes for grouping but no native convex hull rendering — need canvas overlay or cytoscape-canvas extension
- Cytoscape has no native minimap — need cytoscape-navigator extension or custom canvas
- Cytoscape has no native particle animations on edges — need canvas overlay with requestAnimationFrame
- `text-background-color`, `text-background-opacity`, `text-background-padding`, `text-background-shape` handle label pills natively

## Key Constraints
- Must work in both light and dark themes (CSS variables)
- Performance matters — 34 nodes now but could grow to hundreds
- Must preserve existing interactions (tap, double-tap, zoom labels, focus mode)
- Maintain clean code separation (styles in graphStyles.ts, logic in GraphView.tsx, UI state in uiStore)

Please provide:
1. An implementation order (group by dependency and complexity)
2. For each upgrade: which files change, key implementation details, Cytoscape API specifics
3. Flag any that need external packages
4. Flag any performance concerns
5. Suggest which can be combined into single implementation steps

---

## Assistant



I'll explore the codebase to understand the current graph implementation before designing the plan.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*graph*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*Graph*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/uiStore*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*toolbar*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*Toolbar*"}`

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

Now let me check the CSS file and the GraphLegend component, plus the package.json for current dependencies.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.css"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphLegend.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json"}`

---

## Assistant

Let me also check the CSS for existing graph-related styles and the API types for NodeDto.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"graph-|\\.tooltip|\\.legend","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"interface NodeDto|interface EdgeDto","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","-A":10}`

---

## Assistant

Let me read the relevant CSS sections for the graph components.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":128,"limit":50}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1209,"limit":110}`

---

## Assistant

Now let me check the API bridge to understand what data is available for the richer tooltip.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"getNeighbors|getNodeDetail|readNote|tags|summary","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api","output_mode":"content","-n":true}`

---

## Assistant

I now have a thorough understanding of the codebase. Here is the complete implementation plan.

---

## Implementation Plan: 12 Cytoscape Graph Visual Upgrades

### Implementation Order (4 Tiers by Dependency and Complexity)

---

### TIER 1 -- Pure Style Changes (No new state, no new packages, no canvas overlays)

These are stylesheet-only or near-stylesheet-only changes that touch `graphStyles.ts` and possibly `GraphView.tsx` minimally.

---

**Upgrade 6: Label Background Pills**

Files changed: `graphStyles.ts`

This is the simplest upgrade. Add four Cytoscape style properties to the existing `node` selector:

- `text-background-color`: use a dark value like `#1a1a2e` (dark theme) -- for light theme support, consider `rgba(0,0,0,0.6)` which works on both.
- `text-background-opacity`: `0.75`
- `text-background-padding`: `"3px"`
- `text-background-shape`: `"roundrectangle"`

These are native Cytoscape properties on the `node` selector. No JS logic needed. Labels already have `min-zoomed-font-size: 14` so the pills only appear when labels appear.

---

**Upgrade 9: Different Node Shapes by Type**

Files changed: `graphStyles.ts`, `GraphView.tsx` (data mapping)

Strategy: Add a `shape` data field to each Cytoscape node element, then reference it in the stylesheet.

Shape mapping (all natively supported by Cytoscape):
- concept: `"ellipse"` (circle, the default)
- book-note: `"roundrectangle"`
- question: `"diamond"`
- reference: `"rectangle"`
- index: `"star"`
- argument: `"triangle"`
- evidence: `"pentagon"`
- experiment: `"hexagon"`
- person: `"octagon"`
- project: `"tag"`

In `GraphView.tsx`, in the `cyNodes` mapping (line ~204-212), add `shape: getNodeShape(n.note_type)` to the data object. Export a `getNodeShape()` function from `graphStyles.ts` alongside `getNodeColor()`.

In the `node` selector in `graphStylesheet`, add: `shape: "data(shape)"`.

---

**Upgrade 2: Edge Color Gradients**

Files changed: `graphStyles.ts`, `GraphView.tsx` (data mapping)

Cytoscape supports `line-gradient-stop-colors` and `line-gradient-stop-positions` natively on edges.

In `GraphView.tsx`, when building `cyEdges` (line ~214-222), look up source and target node colors and store them as edge data: `sourceColor: getNodeColor(sourceNode.note_type)`, `targetColor: getNodeColor(targetNode.note_type)`. This requires looking up the node from the `filteredNodes` map by `e.source` and `e.target`.

In `graphStylesheet`, replace the flat `line-color: "#aaaaaa"` on the `edge` selector with:
```
"line-fill": "linear-gradient",
"line-gradient-stop-colors": (ele) => [ele.data("sourceColor"), ele.data("targetColor")],
"line-gradient-stop-positions": [0, 100],
```

Important: Cytoscape style mappers using functions require the `style` approach or data-bound strings. Since Cytoscape does not support function mappers in the stylesheet array, the gradient colors must be set as data properties and referenced via `"data(sourceColor)"` -- but `line-gradient-stop-colors` expects an array, which cannot use `data()` syntax directly. The solution is to apply these styles programmatically after `cy.add()` using `cy.edges().style({...})` or use the `data()` mapper approach with individual stop color properties. Actually, `line-gradient-stop-colors` accepts a space-separated string in the stylesheet, so store `data(gradientColors)` as `"#4a9eff #e74c3c"` (space-separated hex pair) in the edge data.

Also update the `target-arrow-color` to `"data(targetColor)"` so the arrowhead matches the gradient endpoint.

Update the `edge.highlighted` selector to override gradient with solid white.

---

### TIER 2 -- JS Logic in GraphView (Event handlers, animation, state)

---

**Upgrade 1: Neighborhood Highlight on Hover**

Files changed: `GraphView.tsx`, `graphStyles.ts`

This reuses the existing `highlighted` class pattern but adds a dimming class. Add a new `node.dimmed` and `edge.dimmed` selector to `graphStylesheet`:
```
{ selector: "node.dimmed", style: { opacity: 0.15, "shadow-opacity": 0.05 } }
{ selector: "edge.dimmed", style: { "line-opacity": 0.08 } }
```

In `GraphView.tsx`, in the Cytoscape init effect (line ~139), modify the existing `mouseover` handler:
1. On `mouseover` of a node: get the hovered node's neighborhood (`node.neighborhood()` + the node itself). Add class `"dimmed"` to all elements, then remove `"dimmed"` and add `"highlighted"` to the neighborhood.
2. On `mouseout`: remove both `"dimmed"` and `"highlighted"` from all elements.

This must not conflict with the existing selection highlighting (lines 252-273). The selection effect runs on `selectedNodePath` change and uses `highlighted` class. The hover effect should use a separate class pair -- use `"hover-highlight"` and `"hover-dim"` instead to avoid collision, with corresponding stylesheet entries.

Performance note: `neighborhood()` is O(degree) which is fine even at hundreds of nodes. The `addClass`/`removeClass` batch operations on `eles` are efficient.

---

**Upgrade 7: Hover Pulse Animation**

Files changed: `GraphView.tsx`, `App.css`

On `mouseover`, animate the hovered node's `shadow-blur` from its current value to a larger value (e.g., 20) and back. Use Cytoscape's `node.animate()` API:
```
node.animate({ style: { "shadow-blur": 20, "shadow-opacity": 1.0 } }, { duration: 400, easing: "ease-in-out-sine" });
```
On `mouseout`, animate back:
```
node.stop().animate({ style: { "shadow-blur": 10, "shadow-opacity": 0.7 } }, { duration: 300 });
```

This integrates into the same `mouseover`/`mouseout` handlers as Upgrade 1. Combine these two upgrades into a single implementation step.

---

**Upgrade 5: Richer Hover Tooltip**

Files changed: `GraphView.tsx`, `graphStyles.ts` (for color lookup), `App.css`, `graphStore.ts` or data enrichment

The current tooltip shows only `label` and `noteType`. The richer version needs: type pill (colored), tag chips, summary preview, connection count.

Problem: `NodeDto` only has `{ path, title, note_type }`. Tags and summary are not in the graph topology data. Two options:

**Option A (recommended)**: Enrich `NodeDto` to include `tags: string[]` and `summary: string | null`. This requires changes in `crates/app/src-tauri/src/dto.rs` (the Rust DTO) and `crates/app/src/api/types.ts`. The topology endpoint already loads full notes from the graph, so adding these fields is low-cost.

**Option B (lazy loading)**: On hover, call `readNote(path)` via the API. This adds latency to tooltip display and complexity for caching. Not recommended.

With Option A, store the extra data in the Cytoscape node's data bag: `tags: n.tags`, `summary: n.summary`, and compute `connectionCount: 0` (set after `cy.add` via `n.degree(false)`).

Update the tooltip state type to include `tags: string[]`, `summary: string | null`, `connectionCount: number`, `color: string`. Update the tooltip JSX to render a mini-card with:
- Type pill (colored span with `background: color, border-radius: 9999px`)
- Tag chips (small spans)
- Summary truncated to ~80 chars
- Connection count badge

Update `App.css` `.graph-node-tooltip` to support the richer layout (wider max-width: 280px, flex-column gap, chip styles).

---

**Upgrade 8: Smooth Layout Animation**

Files changed: `GraphView.tsx` (the `runLayout` function)

This is straightforward. Both fcose and dagre accept an `animate` option. Change `animate: false` to `animate: true` in both layout configs, and add `animationDuration: 500` and `animationEasing: "ease-in-out-sine"`.

For fcose (line 55-68): add `animate: true, animationDuration: 500`.
For dagre (line 43-51): add `animate: true, animationDuration: 500`.

Note: fcose with `quality: "proof"` and `animate: true` may compute the full layout first, then animate to final positions. This is the desired behavior -- it avoids showing the iterative computation.

One subtlety: the initial load should NOT animate (nodes appearing from position 0,0 to final looks jarring). Add a parameter `skipAnimation: boolean` to `runLayout()` and pass `true` on the first call (inside the data sync effect) and `false` on subsequent layout-switch calls. Alternatively, only enable animation when `cy.nodes().length > 0` and positions already exist (check `cy.nodes().first().position().x !== 0`).

---

**Upgrade 3: Animated Node Entrance**

Files changed: `GraphView.tsx`

After `cy.add()` and layout completes, set all nodes to `opacity: 0` initially, then animate each node to `opacity: 1` with a stagger. Use Cytoscape's `node.animate()`:

```typescript
cy.nodes().style({ opacity: 0 });
runLayout(cy, layout); // with animate: false for entrance
cy.nodes().forEach((node, i) => {
  node.delay(i * 10) // stagger: 10ms per node (300ms total for 30 nodes)
    .animate({ style: { opacity: 1 } }, { duration: 300, easing: "ease-out" });
});
```

Performance concern: With 200+ nodes, a per-node stagger of 10ms means 2+ seconds. Cap the stagger: `Math.min(10, 300 / cy.nodes().length)` to keep total entrance under 300ms regardless of count.

This should only run on initial load or full graph data change, not on selection changes. Add a ref `hasEnteredRef` to prevent re-running on every data sync.

Combine Upgrades 3 and 8 into a single implementation step since both modify `runLayout` and the data sync effect.

---

### TIER 3 -- New UI Components or Significant State

---

**Upgrade 4: Glassmorphism Toolbar**

Files changed: `App.css`

Replace the `.graph-toolbar` styles:
```css
.graph-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(19, 19, 26, 0.6);  /* dark theme */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}
```

For light theme support, use CSS variables or the `[data-theme="light"]` selector:
```css
[data-theme="light"] .graph-toolbar {
  background: rgba(255, 255, 255, 0.6);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
```

Also update `.graph-toolbar button` to have semi-transparent backgrounds. Update `.graph-legend` and `.edge-filter-popover` with matching glassmorphism for visual consistency.

Tauri uses WebView which supports `backdrop-filter` in all modern WebKit/Chromium engines.

---

**Upgrade 12: Minimap**

Files changed: `GraphView.tsx`, `App.css`, `package.json`

**External package needed**: `cytoscape-navigator` (npm package `cytoscape-navigator`). Alternative: build a custom minimap using a second off-screen Cytoscape instance or a canvas overlay.

Recommended approach: Use `cytoscape-navigator` which provides a minimap with viewport rectangle. Install: `npm install cytoscape-navigator`.

Usage:
```typescript
import navigator from "cytoscape-navigator";
cytoscape.use(navigator);
// After cy init:
cy.navigator({ container: minimapContainerRef.current });
```

Add a `<div ref={minimapContainerRef} className="graph-minimap" />` inside the GraphView return, positioned absolute in the bottom-right corner.

CSS:
```css
.graph-minimap {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 150px;
  height: 100px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  overflow: hidden;
  z-index: 10;
  background: rgba(19,19,26,0.8);
}
```

Add a toggle button in `GraphToolbar` ("Minimap" button) and corresponding `showMinimap` boolean in `uiStore`.

Performance note: The navigator plugin renders a simplified view and is lightweight. Fine for hundreds of nodes.

**Fallback if cytoscape-navigator has compatibility issues**: Build a custom minimap by rendering a second hidden Cytoscape instance with `userZoomingEnabled: false, userPanningEnabled: false` and syncing viewport on pan/zoom events. More work but no external dependency.

---

### TIER 4 -- Canvas Overlays (Most Complex, Custom Rendering)

---

**Upgrade 10: Cluster Hulls**

Files changed: `GraphView.tsx`, new file `graphHulls.ts`, `App.css`, `package.json` (possibly)

**No native Cytoscape support**. Requires a canvas overlay drawn behind the graph.

Approach: Use `cytoscape-canvas` extension (or the simpler approach of layering a raw `<canvas>` behind the Cytoscape container and syncing coordinates).

Algorithm:
1. Group nodes by `note_type` (or by a clustering algorithm like connected components within type).
2. For each group with 2+ spatially proximate nodes, compute a convex hull of their positions.
3. Draw the hull as a semi-transparent filled polygon with rounded corners on the background canvas.
4. Re-draw on every pan/zoom/layout event.

Implementation with `cytoscape-canvas`:
```typescript
import cytoscapeCanvas from "cytoscape-canvas";
cytoscape.use(cytoscapeCanvas);
const layer = cy.cyCanvas({ zIndex: -1 }); // behind nodes
cy.on("render", () => {
  const ctx = layer.getCanvas().getContext("2d");
  layer.resetTransform(ctx);
  layer.clear(ctx);
  // draw hulls using cy model coordinates
  for (const [type, nodes] of groupedNodes) {
    const points = nodes.map(n => n.position());
    const hull = computeConvexHull(points);
    drawRoundedHull(ctx, hull, NOTE_TYPE_COLORS[type], 0.08);
  }
});
```

Need a convex hull algorithm (Graham scan, ~30 lines of code) in a new `graphHulls.ts` utility.

Performance concern: The `render` event fires frequently (every frame during pan/zoom). The hull computation is O(n log n) per group, which is fine for hundreds of nodes. Drawing is just canvas path operations. Should add a debounce or only recompute hulls on layout change (cache hull polygons, only redraw on render).

Add a "Hulls" toggle button in `GraphToolbar` and `showClusterHulls` in `uiStore`.

---

**Upgrade 11: Edge Directionality Particles**

Files changed: `GraphView.tsx`, new file `graphParticles.ts`

**No native Cytoscape support**. Requires `requestAnimationFrame` canvas overlay.

Approach: Use the same `cytoscape-canvas` layer (or a separate one at `zIndex: 1`, above edges but below nodes). On each animation frame:

1. For each visible edge, compute a point along the edge curve at position `t` (0 to 1, advancing each frame).
2. Draw a small circle (2-3px) at that point, colored with the edge gradient or white.
3. Use `edge.sourceEndpoint()` and `edge.targetEndpoint()` for bezier control points, or approximate with `edge.source().position()` and `edge.target().position()` for straight-line interpolation.

```typescript
let animFrame: number;
function animateParticles(cy: Core, ctx: CanvasRenderingContext2D, layer: any) {
  const t = (Date.now() % 2000) / 2000; // 2-second cycle
  layer.resetTransform(ctx);
  layer.clear(ctx);
  cy.edges(":visible").forEach(edge => {
    const sp = edge.source().position();
    const tp = edge.target().position();
    const x = sp.x + (tp.x - sp.x) * t;
    const y = sp.y + (tp.y - sp.y) * t;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fill();
  });
  animFrame = requestAnimationFrame(() => animateParticles(cy, ctx, layer));
}
```

Performance concern: This is the most performance-sensitive upgrade. Drawing a circle per edge per frame at 60fps with 100+ edges means 6000+ draw calls/second. Mitigations:
- Only animate visible edges (already done via `:visible`).
- Use a single `beginPath` / `fill` batch rather than per-edge.
- Add a toggle to disable particles entirely (`showEdgeParticles` in `uiStore`).
- Consider reducing to 30fps via `setTimeout` wrapper or only animating when idle.
- At 200+ edges, recommend auto-disabling with a warning.

Add a "Particles" toggle in `GraphToolbar`.

---

### Combined Implementation Steps

Here is the recommended grouping into implementation batches:

**Batch 1 (Pure stylesheet, no deps)**: Upgrades 6 (label pills) + 9 (node shapes)
- Only `graphStyles.ts` and minor `GraphView.tsx` data mapping
- Zero risk, zero performance impact

**Batch 2 (Edge styling)**: Upgrade 2 (edge gradients)
- `graphStyles.ts` + `GraphView.tsx` edge data enrichment
- Standalone, depends on having node colors available at edge build time

**Batch 3 (Hover interactions)**: Upgrades 1 (neighborhood highlight) + 7 (hover pulse)
- Both modify the same `mouseover`/`mouseout` handlers
- Both add stylesheet selectors
- Natural to implement together

**Batch 4 (Animation)**: Upgrades 3 (node entrance) + 8 (smooth layout)
- Both modify `runLayout` and the data sync effect
- Must be coordinated to avoid entrance animation conflicting with layout animation

**Batch 5 (Tooltip enrichment)**: Upgrade 5 (richer tooltip)
- Requires `NodeDto` expansion (Rust DTO change + TypeScript type change)
- Self-contained after the DTO is updated

**Batch 6 (CSS polish)**: Upgrade 4 (glassmorphism toolbar)
- Pure CSS, no JS
- Can be done anytime but benefits from being after other toolbar buttons are added

**Batch 7 (Minimap)**: Upgrade 12
- External package (`cytoscape-navigator`)
- New toggle in uiStore
- Independent of other upgrades

**Batch 8 (Canvas overlays)**: Upgrades 10 (cluster hulls) + 11 (edge particles)
- Both need `cytoscape-canvas` or equivalent canvas layer
- Share infrastructure (canvas setup, render loop)
- Most complex, highest performance risk

---

### External Packages Required

| Upgrade | Package | Purpose |
|---------|---------|---------|
| 12 (Minimap) | `cytoscape-navigator` | Minimap with viewport indicator |
| 10 (Hulls) + 11 (Particles) | `cytoscape-canvas` | Background/foreground canvas layers |

No other external packages are needed. Upgrades 1-9 use only native Cytoscape APIs.

---

### Performance Concerns Summary

| Upgrade | Risk Level | Concern | Mitigation |
|---------|-----------|---------|------------|
| 1 (Hover highlight) | Low | `addClass`/`removeClass` on all elements | Batch operations are O(n), fine at hundreds |
| 2 (Edge gradients) | Low | Per-edge data lookup during build | One-time at data sync, not per-frame |
| 3 (Node entrance) | Low-Medium | Per-node stagger animation | Cap stagger to keep total under 300ms |
| 7 (Hover pulse) | Low | Single node animation | Trivial |
| 8 (Smooth layout) | Low | Built-in Cytoscape animation | Layout engines handle this efficiently |
| 10 (Cluster hulls) | Medium | Convex hull recomputation on render | Cache hulls, only recompute on layout change |
| 11 (Edge particles) | High | Per-edge per-frame canvas draws | Batch draws, add toggle, auto-disable at 200+ edges |
| 12 (Minimap) | Low | Simplified duplicate render | Navigator plugin is optimized for this |

---

### Critical Files for Implementation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts` - Core file for all stylesheet changes (upgrades 1, 2, 6, 7, 9)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx` - Main Cytoscape orchestration: event handlers, data mapping, layout, animation (upgrades 1, 2, 3, 5, 7, 8, 10, 11, 12)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` - Graph tooltip, toolbar, legend styles (upgrades 4, 5, 12)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts` - New toggle state for minimap, hulls, particles (upgrades 10, 11, 12)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts` - NodeDto enrichment for richer tooltips (upgrade 5)

---

