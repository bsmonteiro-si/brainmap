# 2026-03-14 — Subagent Transcript: Plan

**Date:** 2026-03-14 15:52:57
**Agent:** Plan
**Agent ID:** ab90359c5f61fc03f
**Parent Session:** 78937639-c1e4-41c2-9b87-357e7c33b4bf

---

## User

Design an implementation plan for adding an "Index/Home Entrypoint" feature and 3 new graph layouts to the BrainMap desktop app (Tauri v2 + React + Cytoscape.js).

## Current State

**Graph layouts** (in `GraphView.tsx`):
- `runLayout(cy, layout, animate)` function with two modes:
  - "force" (fcose): idealEdgeLength=280, nodeRepulsion=75000, quality="proof", numIter=2500
  - "hierarchical" (dagre): rankDir="LR", only directional edges
- Layout type stored in `uiStore.graphLayout` as `"force" | "hierarchical"`
- Layout dropdown in `GraphToolbar.tsx` with two options
- Cytoscape extensions registered: `cytoscape.use(fcose)` and `cytoscape.use(dagre)`

**Focus mode** (existing):
- `graphFocusFilter.ts` filters graph to show focal node + 1-hop neighbors
- `graphFocusPath` + `graphFocusKind` in UIStore
- "Focus ×" button in GraphToolbar to clear
- Two modes: "note" focus and "folder" focus

**Note types**: 11 types including `index` (defined as "hub/waypoint that organizes other notes"). Index notes have NO special graph behavior today. Seed dataset has one index note: `The Book of Why/The Book of Why.md`.

**Graph data**: Full topology loaded on workspace open via `graphStore.loadTopology()`. Nodes have `type`, `path`, `title`. Edges have `source`, `target`, `rel` (15 edge types).

**Node sizing**: BASE_NODE_SIZE=18, scales by in-degree (+2px per incoming edge). Focal nodes get 32px.

**Cytoscape built-in layouts available** (no new deps needed): `breadthfirst`, `concentric`, `circle`, `grid`, `cose`.

## Requirements

### 1. Home Note System
- On workspace open, auto-detect index-type notes as "home" note
- If no index note exists, show full graph as today (no auto-focus)
- User can designate any note as "home" via context menu or settings
- Home note path persisted per workspace

### 2. Auto-Focus on Open
- When workspace loads and a home note exists:
  - Auto-set graph focus to home note
  - Use radial layout centered on home
- Clean, organized starting point instead of hairball

### 3. Three New Layouts (added to existing dropdown)
Total 5 layouts in dropdown:
- **Force Layout** (existing fcose)
- **Hierarchical** (existing dagre)
- **Radial** — home/selected node at center, neighbors in concentric rings by graph distance. Use Cytoscape built-in `breadthfirst` with `circle: true`, root = home node or selected node
- **Concentric** — most-connected nodes in center, leaf nodes in outer rings. Use Cytoscape built-in `concentric` with degree-based positioning
- **Grouped by Type** — cluster nodes spatially by note type. Could use compound parent nodes + `cose` layout, or manual centroid positioning

### 4. Home Button in Toolbar
- One-click return to home-focused radial view
- Only shown when a home note is configured

### 5. Visual Distinction for Home Node
- Slightly larger base size
- Subtle glow/ring effect to signal "this is the hub"

## Key Files
- `crates/app/src/components/GraphView/GraphView.tsx` — main component, runLayout, Cytoscape init
- `crates/app/src/components/GraphView/GraphToolbar.tsx` — layout dropdown, toolbar buttons
- `crates/app/src/components/GraphView/graphStyles.ts` — node colors, styling, BASE_NODE_SIZE
- `crates/app/src/components/GraphView/graphFocusFilter.ts` — focus mode filtering
- `crates/app/src/stores/uiStore.ts` — graphLayout state, GraphLayout type
- `crates/app/src/stores/graphStore.ts` — topology state, nodes/edges
- `crates/app/src/components/FileTreePanel/FileTreePanel.tsx` — context menu (for "Set as Home")

## Constraints
- No new npm dependencies — use Cytoscape built-in layouts for radial, concentric, grouped
- Keep existing focus mode working (focus + layout are independent)
- Radial layout needs a "root" node — use home note, or fall back to most-connected node
- Grouped layout needs type clustering — consider compound node approach or centroid-based positioning
- All layouts should animate transitions (500ms, ease-in-out-sine, matching current behavior)
- Home note preference should persist per workspace/segment

Please provide a detailed implementation plan with specific code changes, file paths, and approach for each component. Consider edge cases like: switching layouts when focused, workspace with no index note, radial with no root selected, grouped layout with many types.

---

## Assistant



I'll explore the codebase thoroughly to understand the current implementation before designing the plan.

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

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphFocusFilter.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

Now let me check the remaining key files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/FileTreePanel/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts"}`

---

## Assistant

Let me check the segment store and the file tree context menu for the "Set as Home" integration point.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStore.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/FileTreePanel/*"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStateCache.ts"}`

---

## Assistant

Let me find the file tree component (it may be named differently).

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/FileTree*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/*Tree*"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":100}`

---

## Assistant

Let me see the context menu portion of FileTreePanel.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"context-menu|Set as Home|cxttap|right.click","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content","-n":true}`

---

## Assistant

Now let me check the context menu rendering section and how the graph view's context menu works.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":175,"limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

Now I have a comprehensive understanding of the codebase. Let me design the implementation plan.

---

## Implementation Plan: Home Note System + 3 New Graph Layouts

### Overview

This plan adds five capabilities: (1) a home note system that auto-detects index-type notes, (2) auto-focus on workspace open, (3) three new graph layouts (radial, concentric, grouped-by-type), (4) a home button in the graph toolbar, and (5) visual distinction for the home node.

### Architecture Decisions

**Home note persistence**: Store `homeNotePath` per-segment in localStorage under `brainmap:homeNotes` as `Record<segmentPath, notePath>`. This avoids changing the Rust backend or the `Segment` type. The key is the workspace path (already canonical in `segmentStore`), the value is the note's relative path.

**Layout approach**: All three new layouts use Cytoscape built-in layout algorithms (no new npm deps). The `GraphLayout` type expands from `"force" | "hierarchical"` to a union of five string literals. `runLayout` gains three new branches.

**Grouped-by-type**: Use Cytoscape's built-in `cose` layout with compound parent nodes. This is the cleanest approach since Cytoscape already supports parent-child containment for layout. Temporary compound nodes are added before layout and removed after positions settle. This avoids manual centroid math and works naturally with the physics simulation.

---

### Step 1: Home Note Store (`homeNoteStore.ts`)

Create a new Zustand store at `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/homeNoteStore.ts`.

**State:**
```
homeNotePath: string | null
```

**Actions:**
- `setHomeNote(path: string)` - Sets the home note for the active workspace. Persists to localStorage under `brainmap:homeNotes` keyed by workspace root path (from `workspaceStore.info.root`).
- `clearHomeNote()` - Clears the home note.
- `loadHomeNote()` - Reads localStorage for the current workspace root and sets `homeNotePath`. Called after topology loads.
- `autoDetectHomeNote(nodes: Map<string, NodeDto>)` - Scans for index-type notes. If exactly one exists, auto-sets it. If multiple exist, picks the one with highest in-degree (most linked). Only called when no explicit home note is persisted.

**Persistence format** in `localStorage["brainmap:homeNotes"]`:
```json
{ "/abs/path/to/workspace": "The Book of Why/The Book of Why.md" }
```

**Integration with segments**: The `SegmentSnapshot` in `segmentStateCache.ts` must include `homeNotePath` so segment switching preserves the home note. Add `homeNotePath: string | null` to the `SegmentSnapshot` interface, capture it from `homeNoteStore`, and restore it on segment switch.

---

### Step 2: Expand GraphLayout Type and runLayout Function

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`**

Change the `GraphLayout` type:
```typescript
type GraphLayout = "force" | "hierarchical" | "radial" | "concentric" | "grouped";
```

Export this type so `GraphToolbar` and `GraphView` can use it.

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx`**

Expand `runLayout` to accept the five layout types plus an optional `rootNodeId` parameter for radial layout:

```typescript
function runLayout(
  cy: Core,
  layout: GraphLayout,
  animate = false,
  rootNodeId?: string | null
)
```

**Radial layout** (`breadthfirst` with `circle: true`):
- `name: "breadthfirst"`, `circle: true`, `roots: rootNodeId ? [rootNodeId] : undefined`
- `spacingFactor: 1.5`, `animate`, `animationDuration: 500`, `fit: true`, `padding: 60`
- Root node: use `rootNodeId` (home note), fall back to highest-degree node, fall back to undefined (Cytoscape picks automatically)

**Concentric layout**:
- `name: "concentric"`, `concentric: (node) => node.degree()`, `levelWidth: () => 2`
- `minNodeSpacing: 60`, `animate`, `animationDuration: 500`, `fit: true`, `padding: 60`
- No root needed; degree-based positioning puts hubs in center automatically

**Grouped-by-type layout**:
- Create temporary compound parent nodes for each note type present in the graph
- Set `node.data('parent')` to the type-group compound node
- Run `cose` layout with `nodeRepulsion: 60000`, `idealEdgeLength: 200`, `gravity: 0.15`, compound-aware defaults
- After `layoutstop`, remove compound parent nodes and unset parent data
- Use `cy.batch()` to avoid multiple render passes during parent manipulation
- Animate the final positions, not the intermediate compound layout

The compound node approach for grouped layout:
1. `cy.batch(() => { ... })` to add compound parent nodes named `__group__concept`, `__group__book-note`, etc.
2. Set each real node's parent: `node.data('parent', '__group__' + node.data('noteType'))`
3. Run `cose` layout
4. On `layoutstop`: record all node positions, `cy.batch(() => { ... })` to remove parent data and compound nodes, re-apply positions, then fit

---

### Step 3: Update GraphToolbar

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphToolbar.tsx`**

1. Expand the layout `<select>` dropdown to include five options:
   - Force Layout, Hierarchical (LR), Radial, Concentric, Grouped by Type

2. Add a Home button (house icon from Lucide React, already available in the project):
   - Only rendered when `homeNotePath` is non-null
   - On click: sets `graphFocusPath` to home note with kind "note", switches to graph tab, sets layout to "radial"
   - Styled distinctively (e.g., house icon, subtle accent background)

3. Update the `onChange` handler type cast to accept the expanded `GraphLayout` union.

---

### Step 4: Home Node Visual Distinction

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts`**

Add a new CSS class selector `node.home-node`:
```typescript
{
  selector: "node.home-node",
  style: {
    width: 26,           // Slightly larger than BASE_NODE_SIZE (18)
    height: 26,
    "shadow-blur": 18,
    "shadow-opacity": 0.9,
    "shadow-color": "#ffd700",  // Gold glow ring
    "border-width": 2,
    "border-color": "#ffd700",
    "border-opacity": 0.6,
  },
}
```

This stacks with existing size-by-indegree since the class selector has higher specificity. The gold ring/glow provides instant visual recognition without conflicting with type-based coloring.

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx`**

In the "Sync graph data to Cytoscape" `useEffect`, after marking the focal node, also mark the home node:
```typescript
const homePath = useHomeNoteStore.getState().homeNotePath;
if (homePath) {
  cy.getElementById(homePath).addClass("home-node");
}
```

Subscribe to `homeNotePath` changes so the class is toggled when the user changes the home note.

---

### Step 5: Auto-Focus on Workspace Open

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts`**

After `loadTopology()` completes in `openWorkspace` (and in `switchSegment` for first-open), call:
```typescript
const homeStore = useHomeNoteStore.getState();
homeStore.loadHomeNote(); // reads from localStorage
if (!homeStore.homeNotePath) {
  homeStore.autoDetectHomeNote(useGraphStore.getState().nodes);
}
if (homeStore.homeNotePath) {
  useUIStore.getState().setGraphFocus(homeStore.homeNotePath, "note");
  useUIStore.getState().setGraphLayout("radial");
  useUIStore.getState().setActiveLeftTab("graph");
}
```

This gives an immediate organized view on workspace open. Users who don't have index notes get the existing full-graph behavior unchanged.

---

### Step 6: "Set as Home" in Context Menus

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`**

Add a "Set as Home Note" item to the context menu for brainmap notes (the `isBrainMapNote` branch). Add it before "Focus in Graph":
```html
<div className="context-menu-item" onClick={handleSetAsHome}>
  Set as Home Note
</div>
```

If the note is already the home note, show "Unset Home Note" instead.

The handler calls `useHomeNoteStore.getState().setHomeNote(state.node.fullPath)` or `.clearHomeNote()`.

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx`**

Add "Set as Home Note" to the graph node context menu (`ctxMenu` section), same logic.

---

### Step 7: Pass Root Node to Radial Layout

The `runLayout` call in the `useEffect` that re-runs layout on `graphLayout` change needs the root node ID:

```typescript
useEffect(() => {
  graphLayoutRef.current = graphLayout;
  const cy = cyRef.current;
  if (cy && cy.nodes().length > 0) {
    const rootId = graphLayout === "radial"
      ? (useHomeNoteStore.getState().homeNotePath ?? getMostConnectedNodeId(cy))
      : undefined;
    runLayout(cy, graphLayout, true, rootId);
  }
}, [graphLayout]);
```

Helper `getMostConnectedNodeId(cy: Core): string | undefined` returns the node ID with the highest degree, used as fallback root for radial layout when no home note exists.

---

### Step 8: Segment State Cache Integration

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStateCache.ts`**

Add `homeNotePath: string | null` to `SegmentSnapshot`.

In `captureSnapshot()`: read from `useHomeNoteStore.getState().homeNotePath`.

In `restoreSnapshot()`: call `useHomeNoteStore.setState({ homeNotePath: snapshot.homeNotePath })`.

---

### Step 9: Tests

**New test file: `homeNoteStore.test.ts`**
- Test `setHomeNote` / `clearHomeNote` / `loadHomeNote` persistence round-trip
- Test `autoDetectHomeNote` with zero, one, and multiple index notes
- Test auto-detect picks highest in-degree when multiple index notes exist

**Update: `GraphView.test.ts` or `graphStyles.test.ts`**
- Test that `home-node` class applies the correct style overrides
- Test that `runLayout` handles all five layout types without error

**Update: `GraphToolbar.test.ts`**
- Test the dropdown renders all five layout options
- Test home button visibility when `homeNotePath` is set/null

**Update: `segmentStateCache.test.ts`**
- Test that `homeNotePath` is captured and restored in snapshots

---

### Step 10: Documentation Updates

- **CLAUDE.md**: Update "Current Status" to mention home note system, 5 graph layouts. Add `homeNoteStore.ts` to architecture notes. Update test count.
- **README.md**: Mention home note auto-detection and new layouts in features.

---

### Edge Cases

1. **Switching layouts when focused**: Focus mode filters nodes first, then layout runs on the filtered subset. This works naturally since `runLayout` operates on `cy.nodes()` which only contains filtered elements. Radial layout in focus mode uses the focal node as root.

2. **Workspace with no index note**: `autoDetectHomeNote` returns without setting anything. No auto-focus occurs. Full graph with force layout shown (current behavior).

3. **Radial with no root selected**: `breadthfirst` layout with `roots: undefined` picks an arbitrary root. The result is still a radial tree, just not centered on a semantically meaningful node. The `getMostConnectedNodeId` fallback handles this more gracefully.

4. **Grouped layout with many types**: All 11 types could be present. The `cose` compound layout handles arbitrary numbers of groups. Groups with single nodes will cluster together naturally. Empty groups (no nodes of that type) simply don't get a compound parent.

5. **Home note deleted**: When a `node-deleted` event arrives for the home note path, the `applyEvent` handler should check and clear the home note. Add a subscription in the graph store's `applyEvent` or a `useEffect` in `GraphView` that watches `nodes` and validates `homeNotePath` still exists.

6. **Multiple index notes**: `autoDetectHomeNote` picks the one with highest in-degree. If tied, pick the first alphabetically for determinism.

7. **Grouped layout compound node cleanup**: If the user switches layout mid-animation, the compound nodes must be cleaned up. Use a ref to track whether compound nodes are present and clean them up at the start of any `runLayout` call.

---

### File Change Summary

| File | Change Type |
|------|-------------|
| `stores/homeNoteStore.ts` | **New file** |
| `stores/uiStore.ts` | Modify `GraphLayout` type (add 3 values) |
| `components/GraphView/GraphView.tsx` | Expand `runLayout` (3 new branches), home-node class, root passing |
| `components/GraphView/GraphToolbar.tsx` | 5-option dropdown, home button |
| `components/GraphView/graphStyles.ts` | `node.home-node` style selector |
| `components/Layout/FileTreePanel.tsx` | "Set as Home Note" context menu item |
| `stores/workspaceStore.ts` | Auto-focus on workspace open |
| `stores/segmentStateCache.ts` | `homeNotePath` in snapshot |
| `stores/homeNoteStore.test.ts` | **New test file** |

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx` - Core layout engine: `runLayout` needs 3 new branches, home-node class application, root node passing
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts` - `GraphLayout` type union must expand from 2 to 5 values, used throughout the graph system
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphToolbar.tsx` - Toolbar UI: layout dropdown expansion, home button, wiring to homeNoteStore
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts` - Home node visual styling (gold glow/ring CSS class)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStateCache.ts` - Snapshot type must include homeNotePath for multi-segment persistence

---

