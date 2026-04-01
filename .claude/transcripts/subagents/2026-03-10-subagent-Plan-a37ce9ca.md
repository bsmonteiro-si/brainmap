# 2026-03-10 — Subagent Transcript: Plan

**Date:** 2026-03-10 11:48:50
**Agent:** Plan
**Agent ID:** a37ce9ca1a737f09e
**Parent Session:** 40f16652-2f81-4fab-a16c-648ac36abfe8

---

## User

You are planning improvements to the BrainMap graph layout to make it look more like Obsidian's distributed, open graph. This is a TypeScript/React/Cytoscape.js frontend task — no Rust changes.

## Problem

The current graph looks clustered and messy (see user's screenshot showing 34 nodes crammed into a dense ball). Obsidian's graphs are open, distributed, with clusters separated by visible breathing room.

## Root Causes Identified

1. **fcose physics too weak**: `nodeRepulsion: 18000`, `gravity: 0.15`, `idealEdgeLength: 180` — not aggressive enough to spread a dense graph
2. **Edge density**: 116 edges on 34 nodes (avg 3.4/node), dominated by `related-to` (34) and `contains` (22) — these two types alone make 48% of all edges and cause most visual clutter
3. **No edge type filtering**: The toolbar has a node-type filter dropdown stub (already exists in GraphToolbar.tsx) but NO edge type filter. Hiding `contains` and `related-to` edges would reveal the semantic graph structure much more clearly.
4. **`gravityRange` at default 3.8**: Keeps outlier nodes pulled back toward center

## Current State

**GraphView.tsx fcose params:**
```typescript
cy.layout({
  name: "fcose",
  animate: false,
  quality: "proof",
  idealEdgeLength: 180,
  nodeRepulsion: 18000,
  gravity: 0.15,
  fit: true,
  padding: 60,
  nodeDimensionsIncludeLabels: false,
} as cytoscape.LayoutOptions).run();
```

**GraphToolbar.tsx** (located at `crates/app/src/components/GraphView/GraphToolbar.tsx`):
- Labels toggle button
- Legend toggle button  
- Layout dropdown (Force Layout / Hierarchical)
- Node type filter dropdown (already exists as a stub, doesn't filter yet)
- NO edge type filter currently

**UIStore** (at `crates/app/src/stores/uiStore.ts`):
- `showEdgeLabels: boolean`
- `showLegend: boolean`
- `graphLayout: "force" | "hierarchical"`
- `treeOpen: boolean`

**GraphView data-sync effect**: builds `cyNodes` and `validEdges`, then calls `cy.add([...cyNodes, ...validEdges])`. Edge filtering would go here.

**Edge relationship types in the dataset:**
- `related-to`: 34 edges (39%) — weakest semantics, most clustering
- `contains`: 22 edges (25%) — creates hub-and-spoke structure
- `authored-by`: 10 edges (11%) — person connections
- `leads-to`: 5
- `part-of`: 4
- `contradicts`: 3
- Plus 7 other types with ≤2 edges each

## What Obsidian Does

Obsidian uses d3-force with:
- Very strong charge (repulsion) force
- Weak link force (link strength ≈ 1.0 / link count per node, very weak for hub nodes)
- Very low center gravity (center force ~0.5 on 0-1 scale)
- Short link distance (30px default) but strong repulsion creates large gaps

The key insight: **strong repulsion + weak link force + low gravity** = nodes push far apart, edges are stretchy and don't pull hard, only gravity keeps the whole thing on screen. Clusters form naturally around tight subgraphs.

For fcose equivalents:
- `nodeRepulsion: 60000-80000` (strong repulsion)
- `idealEdgeLength: 250-300` (long edges, pairs spread out)
- `edgeElasticity: 0.25-0.35` (weak spring, edges stretch)
- `gravity: 0.05` (almost no center pull)
- `gravityRange: 5.0` (allows more spread before gravity kicks in)

## Requested Plan

Design a two-part implementation plan:

### Part 1: Layout Parameter Tuning (pure param change, no UI)
- Specific recommended values for fcose (explain why each value)
- Expected visual outcome

### Part 2: Edge Type Filter in Toolbar
- Add `hiddenEdgeTypes: Set<string>` state to UIStore (with `toggleEdgeType` action)
- Add an edge type multi-select or checklist UI in GraphToolbar — should be compact, not a giant modal
- In GraphView data-sync effect, filter `validEdges` to exclude hidden edge types before `cy.add()`
- Re-run layout when `hiddenEdgeTypes` changes
- Default: NO edges hidden (show all) — user opts in to filtering
- The toolbar UI should be clean — consider a compact dropdown with checkboxes, or a "filter" button that opens a popover

**Critical files to modify:**
- `crates/app/src/components/GraphView/GraphView.tsx` — fcose params + filter logic
- `crates/app/src/stores/uiStore.ts` — add `hiddenEdgeTypes` state
- `crates/app/src/components/GraphView/GraphToolbar.tsx` — add filter UI
- `crates/app/src/App.css` — any new CSS for the filter control

**Constraints:**
- No backend/Rust changes
- TypeScript must compile clean
- Existing tests must pass (no test changes needed — this is pure UI)
- Keep the toolbar compact — it's already showing 4 controls, add at most 1 more

Design the complete plan with exact code snippets where helpful. Be specific about the UIStore shape, the toolbar UI component approach, and the filtering logic in the data-sync effect.

---

## Assistant

Let me explore the current codebase thoroughly before designing the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphToolbar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/**"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphLegend.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/**"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts"}`

---

## Assistant

Now I have a thorough picture of all the relevant code. Let me design the complete plan.

---

# Graph Layout Improvements: Obsidian-Style Distributed Layout + Edge Type Filter

## Overview

Two independent improvements: (1) tuning the fcose physics parameters to match Obsidian's open, distributed aesthetic, and (2) adding an edge type filter to the toolbar with full store/UI/rendering wiring.

---

## Part 1: Layout Parameter Tuning

### Current Parameters vs. Recommended

The current `runLayout` function in `GraphView.tsx` (lines 54-64):

```typescript
cy.layout({
  name: "fcose",
  animate: false,
  quality: "proof",
  idealEdgeLength: 180,
  nodeRepulsion: 18000,
  gravity: 0.15,
  fit: true,
  padding: 60,
  nodeDimensionsIncludeLabels: false,
} as cytoscape.LayoutOptions).run();
```

### Recommended Parameters

```typescript
cy.layout({
  name: "fcose",
  animate: false,
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
```

### Rationale for Each Parameter

**`nodeRepulsion: 75000` (was 18000)**
This is the dominant change. fcose's repulsion is a pairwise electrostatic force between every pair of nodes. At 18000, 34 nodes in a dense graph (116 edges) cannot push far enough apart — the spring forces from edges win. At 75000, repulsion is ~4x stronger, forcing nodes out to the edge boundary before edges can pull them back. The visual effect: nodes form a sphere-like boundary shell with semantic clusters floating inside, instead of all collapsing to center.

**`idealEdgeLength: 280` (was 180)**
fcose uses this as the rest length of the spring for each edge. 180px is too short given the repulsion increase — the springs would pull nodes back together even with strong repulsion. 280px lets nodes sit far apart naturally. At this distance, a 34-node graph fills the viewport without crowding. The `related-to` and `contains` edges (the most numerous) stay long and visually thin, which de-emphasizes them relative to shorter, semantically tighter edges like `causes` or `contradicts`.

**`edgeElasticity: 0.30` (new, fcose default is ~0.45)**
This is the spring constant multiplier — lower means softer/weaker springs. At 0.30, edges are stretchy; they suggest a relationship without aggressively pulling nodes together. This mirrors Obsidian's weak link force (link strength = 1.0 / node degree). Hub nodes (like the book-note "The Book of Why" with many `contains` edges) stop acting as gravity wells because each edge is individually weaker.

**`gravity: 0.04` (was 0.15)**
The global gravity pulls all nodes toward the viewport center. At 0.15 it competes with repulsion and wins for isolated nodes, keeping everything compressed. At 0.04 it's just strong enough to prevent disconnected nodes from flying off-screen, but weak enough to let the repulsion create breathing room. The practical effect: clusters that are only weakly connected (or have no path between them at all) can float to opposite corners of the canvas.

**`gravityRange: 5.0` (was default 3.8)**
This is the radius (in multiples of the average node distance) beyond which the global gravity starts applying more strongly to pull outliers back. At 3.8 the boundary is tight, which causes nodes at the graph periphery to get sucked inward. At 5.0 the boundary is larger, so outlier nodes like the `person` type notes (only connected by 1-2 `authored-by` edges) can sit further out without being yanked back.

**`numIter: 2500` (was default ~1000)**
With `quality: "proof"`, fcose already runs a high-quality simulation, but more iterations let the layout fully settle with aggressive repulsion values. Without enough iterations, the layout can freeze mid-simulation in a locally-stable but globally-poor configuration. 2500 ensures convergence at the new parameter values. Cost: a brief layout delay (~200-400ms) which is acceptable since `animate: false`.

### Expected Visual Outcome

With these parameters on the 34-node seed dataset:
- The dense ball breaks apart into 3-4 visible clusters (books/concepts cluster, evidence cluster, person cluster around authored-by relationships)
- `contains` edges become long diagonal lines rather than short hub-and-spoke structures
- `related-to` edges show as long loose connections between clusters
- Isolated or weakly-connected nodes (references, single questions) float near the periphery with visible space around them
- The graph canvas is used end-to-end, not just the center 40%

---

## Part 2: Edge Type Filter in Toolbar

### Architecture Decision: UIStore vs. local state

The filter state belongs in `UIStore`, not local component state, for two reasons:
1. `GraphView.tsx` needs to read it in its data-sync effect, and `GraphToolbar.tsx` needs to write it — they are siblings with no parent-to-child prop path
2. Persisting user preferences (even across remounts) is consistent with how `showEdgeLabels`, `showLegend`, etc. are handled

### 2a. UIStore Changes

Add to `UIState` interface in `uiStore.ts`:

```typescript
hiddenEdgeTypes: Set<string>;
toggleEdgeType: (rel: string) => void;
```

Add to the store initializer in `create<UIState>(...)`:

```typescript
hiddenEdgeTypes: new Set<string>(),

toggleEdgeType: (rel: string) =>
  set((s) => {
    const next = new Set(s.hiddenEdgeTypes);
    if (next.has(rel)) {
      next.delete(rel);
    } else {
      next.add(rel);
    }
    return { hiddenEdgeTypes: next };
  }),
```

The default is an empty Set — no edges hidden. This is the right default: the user must opt in to filtering. A non-empty default would confuse users who don't notice the filter is active.

### 2b. GraphView.tsx Changes

**Step 1: Subscribe to `hiddenEdgeTypes` at the top of `GraphView`:**

```typescript
const hiddenEdgeTypes = useUIStore((s) => s.hiddenEdgeTypes);
```

**Step 2: Add a ref to track the current value without stale closure issues** (same pattern used for `showEdgeLabels` and `graphLayout`):

```typescript
const hiddenEdgeTypesRef = useRef(hiddenEdgeTypes);
```

**Step 3: Add a re-layout effect when `hiddenEdgeTypes` changes:**

```typescript
useEffect(() => {
  hiddenEdgeTypesRef.current = hiddenEdgeTypes;
  const cy = cyRef.current;
  if (!cy) return;

  // Rebuild elements with the updated filter and re-run layout
  // (reuse the nodes/edges from graphStore state)
  const { nodes, edges } = useGraphStore.getState();
  const cyNodes = Array.from(nodes.values()).map((n) => ({
    data: {
      id: n.path,
      label: n.title,
      color: getNodeColor(n.note_type),
      noteType: n.note_type,
      size: Math.max(6, 6 + 2), // placeholder; recomputed below
    },
  }));
  const cyEdges = edges
    .filter((e) => !hiddenEdgeTypes.has(e.rel))
    .map((e) => ({
      data: {
        id: `${e.source}|${e.target}|${e.rel}`,
        source: e.source,
        target: e.target,
        label: e.rel,
        kind: e.kind,
      },
    }));

  const nodeIds = new Set(cyNodes.map((n) => n.data.id));
  const validEdges = cyEdges.filter(
    (e) => nodeIds.has(e.data.source) && nodeIds.has(e.data.target)
  );

  cy.elements().remove();
  cy.add([...cyNodes, ...validEdges]);
  cy.nodes().forEach((n) => {
    n.data("size", Math.max(6, 6 + n.indegree(false) * 2));
  });

  if (cyNodes.length > 0) {
    runLayout(cy, graphLayoutRef.current);
    applyEdgeLabelVisibility(cy, showEdgeLabelsRef.current, selectedNodePathRef.current);
  }
}, [hiddenEdgeTypes]);
```

**Step 4: Apply filter in the existing data-sync effect** (the `[nodes, edges]` effect). The current valid-edge filter is:

```typescript
const validEdges = cyEdges.filter(
  (e) => nodeIds.has(e.data.source) && nodeIds.has(e.data.target)
);
```

This needs one more condition added:

```typescript
const validEdges = cyEdges.filter(
  (e) =>
    nodeIds.has(e.data.source) &&
    nodeIds.has(e.data.target) &&
    !hiddenEdgeTypesRef.current.has(e.data.label)
);
```

Note: using `hiddenEdgeTypesRef.current` here (not the reactive `hiddenEdgeTypes`) is deliberate — the data-sync effect already depends on `[nodes, edges]` and manages its own rebuild. The `hiddenEdgeTypes` effect handles filter-only changes. This avoids double-rendering when both nodes and filter change simultaneously.

### 2c. GraphToolbar.tsx Changes

#### UI Approach: Inline Checklist Popover (not a select)

A `<select multiple>` is awkward for this use case — users have to hold Ctrl/Cmd to multi-select, which is non-obvious. A `<select>` with a single value makes no semantic sense for a multi-toggle filter.

The right pattern is a **toggle button that opens a small popover checklist**. This is compact (one button in the toolbar), discoverable (button label shows active filter count), and handles any number of edge types cleanly.

The popover is pure CSS + local React state (no library needed):

```tsx
const [edgeFilterOpen, setEdgeFilterOpen] = useState(false);
const hiddenEdgeTypes = useUIStore((s) => s.hiddenEdgeTypes);
const toggleEdgeType = useUIStore((s) => s.toggleEdgeType);
const edgeTypes = useWorkspaceStore((s) => s.edgeTypes);

const activeFilterCount = hiddenEdgeTypes.size;
```

Button in the toolbar JSX:

```tsx
<div style={{ position: "relative" }}>
  <button
    className={activeFilterCount > 0 ? "active" : ""}
    onClick={() => setEdgeFilterOpen((o) => !o)}
    title="Filter edge types"
  >
    Edges{activeFilterCount > 0 ? ` (${edgeTypes.length - activeFilterCount}/${edgeTypes.length})` : ""}
  </button>
  {edgeFilterOpen && (
    <div className="edge-filter-popover">
      {edgeTypes.map((rel) => (
        <label key={rel} className="edge-filter-item">
          <input
            type="checkbox"
            checked={!hiddenEdgeTypes.has(rel)}
            onChange={() => toggleEdgeType(rel)}
          />
          {rel}
        </label>
      ))}
    </div>
  )}
</div>
```

The button label reads "Edges" at full display, "Edges (13/15)" when some are hidden, and gets the `active` class (blue background) to signal the filter is active — consistent with how Labels and Legend buttons work.

**Closing the popover**: add a `useEffect` with a document click handler:

```typescript
const popoverRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!edgeFilterOpen) return;
  const handler = (e: MouseEvent) => {
    if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
      setEdgeFilterOpen(false);
    }
  };
  document.addEventListener("mousedown", handler);
  return () => document.removeEventListener("mousedown", handler);
}, [edgeFilterOpen]);
```

Attach `ref={popoverRef}` to the outer `<div style={{ position: "relative" }}>` wrapper so both the button and popover are inside the ref boundary. Clicking either the button or any checkbox keeps the popover open.

### 2d. App.css Changes

Add after the `.graph-toolbar select` block (around line 141):

```css
/* ── Edge Filter Popover ──────────────────────────────────────── */
.edge-filter-popover {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 50;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  padding: 6px 0;
  min-width: 160px;
  max-height: 280px;
  overflow-y: auto;
}

.edge-filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  font-size: 12px;
  color: var(--text-primary);
  cursor: pointer;
  user-select: none;
}

.edge-filter-item:hover {
  background: var(--bg-secondary);
}

.edge-filter-item input[type="checkbox"] {
  cursor: pointer;
  accent-color: var(--accent);
  flex-shrink: 0;
}
```

Key CSS decisions:
- `position: absolute` + `top: calc(100% + 4px)` drops the popover directly below the button, anchored to the wrapper div's coordinate space (which has `position: relative`)
- `z-index: 50` puts it above the graph canvas (`z-index: 10` for legend, `z-index: 20` for tooltip) but below modals
- `max-height: 280px` + `overflow-y: auto` handles future edge type growth without overflowing the toolbar area
- `min-width: 160px` gives enough room for "mentioned-in" (the longest type name) without truncation

---

## Implementation Sequence

The two parts are fully independent and can be implemented in either order. Recommended sequence:

1. **Part 1** (5 minutes): Edit the `runLayout` function in `GraphView.tsx`. Single-location change, immediately testable by running the desktop app.

2. **Part 2a** (5 minutes): Edit `uiStore.ts` — add `hiddenEdgeTypes: Set<string>` and `toggleEdgeType` action. No UI effects until Part 2c is done.

3. **Part 2b** (10 minutes): Edit `GraphView.tsx` — add the `hiddenEdgeTypes` subscription, the `hiddenEdgeTypesRef`, the new `hiddenEdgeTypes` effect, and the filter condition in the existing data-sync effect.

4. **Part 2c** (10 minutes): Edit `GraphToolbar.tsx` — add local `edgeFilterOpen` state, `popoverRef`, click-outside `useEffect`, and the button + popover JSX.

5. **Part 2d** (3 minutes): Edit `App.css` — add the three new CSS blocks.

6. **Smoke test**: Open seed workspace, verify graph is distributed (Part 1). Open Edges popover, hide `related-to` and `contains`, verify graph layout re-runs with 60 fewer edges and structure clarifies. Re-show them, verify they return.

---

## Edge Cases and Potential Issues

**Set identity in Zustand**: `Set<string>` is mutable, so Zustand's shallow equality check (`===`) will always see the same reference when you `.add()` or `.delete()` in place. The `toggleEdgeType` action correctly creates a `new Set(s.hiddenEdgeTypes)` before mutating, ensuring Zustand sees a new reference and triggers subscribers. This is the same pattern used for `treeExpandedFolders` in the existing store.

**Effect ordering**: The `hiddenEdgeTypes` effect in `GraphView.tsx` calls `useGraphStore.getState()` to get the current node/edge data imperatively (not reactively). This is safe because the effect only runs when the filter changes, at which point the graph data is already stable in the store. The store's `.getState()` is the standard Zustand pattern for reading state outside of React's render cycle.

**Stale ref in data-sync effect**: The data-sync effect (`[nodes, edges]`) uses `hiddenEdgeTypesRef.current`, not the reactive value. This means if both `nodes` AND `hiddenEdgeTypes` change in the same render, the data-sync effect runs first (with the updated ref) and the `hiddenEdgeTypes` effect runs after (also with the updated ref but now redundantly rebuilds). This is acceptable — the double rebuild is O(ms) and invisible to the user. An alternative is to merge them into a single effect with `[nodes, edges, hiddenEdgeTypes]` as dependencies, but that would require making `hiddenEdgeTypes` reactive inside the effect and complicates the ref-based pattern used throughout the file. The current approach preserves consistency with the existing code style.

**TypeScript**: `Set<string>` is not JSON-serializable. Since `hiddenEdgeTypes` is not persisted to `localStorage` (unlike `panelSizes`), this is not a problem. If persistence is desired later, add a `JSON.stringify`/`JSON.parse` step similar to `loadStoredSizes()`. For now, the filter resets to "show all" on app restart, which is the correct default UX.

**Toolbar overflow**: The toolbar currently has: Labels | Legend | [Layout select] | [flex spacer] | [Node type select]. Adding the Edges button before the spacer keeps it logically grouped with the other view controls. The spacer pushes the node type filter to the right edge. If the toolbar becomes too wide on narrow panels, consider grouping Labels and Edges behind a single "View" dropdown — but this is out of scope for now.

---

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx` - fcose param changes in `runLayout` + `hiddenEdgeTypes` subscription, ref, and filter logic in both effects
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts` - Add `hiddenEdgeTypes: Set<string>` to interface and initializer, plus `toggleEdgeType` action
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphToolbar.tsx` - Edge filter button with popover checklist, click-outside handler, badge count on button label
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` - Three new CSS blocks for `.edge-filter-popover`, `.edge-filter-item`, and `input[type="checkbox"]` styling

---

