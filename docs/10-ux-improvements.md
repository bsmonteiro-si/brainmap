# UX Improvements — BrainMap Desktop App

Research findings and implementation plans for UX improvements to the desktop app.
The app is working with 34 nodes / 196 edges from the seed dataset. This document
covers 6 user-requested improvements plus additional opportunities discovered during
codebase exploration.

---

## Current State

### Layout
- `AppLayout.tsx`: 3 panels in 2-column flex layout — left graph (`flex: "0 0 60%"`), right column splits between editor (`flex: 1`) and search (`flex: "0 0 200px"` — fixed 200px)
- No layout library installed — pure CSS flexbox, hardcoded sizing, no drag-to-resize
- `package.json` has: cytoscape ^3.31.0, zustand ^5.0.3, CodeMirror, Tauri v2. No dagre, fcose, or any layout plugin.

### Stores
- `uiStore.ts` fields: `theme`, `effectiveTheme`, `graphMode`, `commandPaletteOpen`, `createNoteDialogOpen`
- `graphStore.ts` fields: `nodes: Map<string, NodeDto>`, `edges: EdgeDto[]`, `selectedNodePath`, `expandedNodes`, `isLoading`
- No `focusMode`, no panel visibility state, no file tree state

### Components
- No file/directory tree component exists yet
- `InspectorPanel.tsx` is fully implemented but NOT wired into `AppLayout` — orphaned
- `graphMode` ("navigate"/"edit") exists in `uiStore` but is unused everywhere in the UI

### Graph density
- 34 nodes / 196 edges = 5.76 edges/node average — extremely dense for a force-directed layout
- Built-in cose layout: `numIter: 200`, `nodeRepulsion: 8000` — too weak for this density
- All 196 edge labels render simultaneously → wall of text

---

## Improvement 1: Fix Graph Overlap

### Root cause
- `numIter: 200` is far too low; cose needs 1000+ iterations for dense graphs
- `nodeRepulsion: 8000` too weak — nodes cluster together
- All edge labels always visible → visual noise independent of node spacing

### Recommended approach: cytoscape-fcose

Install `cytoscape-fcose` (~30KB, community-maintained). Uses VERSE force simulation — dramatically better separation than built-in cose for dense graphs.

```ts
// GraphView.tsx — replace cose layout with fcose
import fcose from "cytoscape-fcose";
cytoscape.use(fcose);

cy.layout({
  name: "fcose",
  animate: false,
  quality: "proof",        // slower but best separation
  idealEdgeLength: 120,
  nodeRepulsion: 8000,
  gravity: 0.25,
  fit: true,
  padding: 40,
  nodeDimensionsIncludeLabels: true,
}).run();
```

Alternative (no new dep): tune built-in cose to `numIter: 1500`, `nodeRepulsion: 150000`, `idealEdgeLength: 120`, `gravity: 0.1`. Less predictable but zero install cost.

### Edge label strategy

Showing all 196 labels simultaneously is unusable. Combine zoom-based hiding and a toolbar toggle through a single source of truth — do **not** mix inline `.style()` calls (from the zoom listener) with class-based styles (from the toolbar toggle), as they override each other unpredictably.

Use a single `showEdgeLabels` boolean to drive one style application:

```ts
// In the zoom listener AND whenever toolbar toggle changes:
function applyEdgeLabelVisibility(cy: Core, show: boolean) {
  cy.edges().style({ label: show ? "data(label)" : "" });
  // Selected-node edges always show labels regardless
  cy.nodes(":selected").connectedEdges().style({ label: "data(label)" });
}

cy.on("zoom", () => {
  const autoShow = cy.zoom() >= 0.8;
  applyEdgeLabelVisibility(cy, userToggle || autoShow);
});
```

Where `userToggle` is the toolbar "Show edge labels" boolean — when manually enabled by the user, labels show regardless of zoom level.

### Files
- `crates/app/src/components/GraphView/GraphView.tsx` — layout options + zoom listener
- `crates/app/src/components/GraphView/graphStyles.ts` — `.labeled` class, default label visibility
- `crates/app/src/components/GraphView/GraphToolbar.tsx` — label toggle button
- `crates/app/package.json` — add `cytoscape-fcose`

---

## Improvement 2: Full-Screen Note View

### Goal
Expand the editor to fill the full window (or hide the graph column) to focus on writing, with a button or shortcut to restore the split view.

### Recommended approach: react-resizable-panels imperative API

Since Improvement 5 replaces `AppLayout` with `react-resizable-panels`, the raw `<div>` flex override approach no longer applies. Manipulating inline flex styles on panel divs would bypass the library's internal size model, producing inconsistent state on restore.

Use the library's imperative `PanelRef` API instead — Cytoscape stays mounted, positions preserved:

```tsx
// AppLayout.tsx
import { Panel, PanelGroup, PanelResizeHandle, ImperativePanelHandle } from "react-resizable-panels";

const graphPanelRef = useRef<ImperativePanelHandle>(null);
const focusMode = useUiStore(s => s.focusMode);

// Sync focusMode → panel collapsed state
useEffect(() => {
  if (focusMode) {
    graphPanelRef.current?.collapse();
  } else {
    graphPanelRef.current?.expand();
  }
}, [focusMode]);

// In JSX:
<Panel ref={graphPanelRef} defaultSize={60} minSize={15} collapsible>
  <GraphView />
</Panel>
```

The `collapsible` prop is required for `collapse()` to work. On `expand()` the panel restores to its last non-zero size.

### Trigger and restore
- **Trigger**: "Expand" button (⤢ icon) in `EditorPanel.tsx` header → `uiStore.toggleFocusMode()`
- **Restore**: same button (⤡ icon when active), or Escape key (extend the existing Escape handler in `App.tsx`)
- `uiStore.focusMode` is still the right state location; only `AppLayout` wiring changes

### Store changes
```ts
// uiStore.ts additions
focusMode: false,
toggleFocusMode: () => set(s => ({ focusMode: !s.focusMode })),
```

### Files
- `crates/app/src/stores/uiStore.ts` — add `focusMode`, `toggleFocusMode`
- `crates/app/src/components/Layout/AppLayout.tsx` — conditional flex width + transition
- `crates/app/src/components/Editor/EditorPanel.tsx` — expand/collapse button in header
- `crates/app/src/App.tsx` — extend Escape handler to also close focus mode

---

## Improvement 3: Related Notes Footer in Editor

### Goal
Show incoming and outgoing links for the active note directly below the editor — graph context without switching to the graph view.

### Data (no new API call needed)
- **Outgoing links**: `editorStore.activeNote.links` — already loaded with the note
- **Incoming links**: filter `graphStore.edges` where `edge.target === activeNote.path` — already in memory

### Component: `RelatedNotesFooter.tsx`

```
─── Related Notes (5) ────────────────────────────────
→  causes          Correlation and Causation
→  supports        RCT validity
←  depends-on      Instrumental Variables
←  sourced-from    The Book of Why
```

- Arrow direction: `→` outgoing, `←` incoming
- Rel type shown as a dim badge
- Click any item → `graphStore.selectNode(path)` (highlights in graph + opens in editor)
- Max 10 items; "Show N more" if >10
- Collapsed by default; expand toggle persisted in `uiStore`

### Implementation

```tsx
// RelatedNotesFooter.tsx
const activeNote = useEditorStore(s => s.activeNote);
const edges = useGraphStore(s => s.edges);
const nodes = useGraphStore(s => s.nodes);   // needed for title resolution

const related = useMemo(() => {
  if (!activeNote) return [];
  const outgoing = (activeNote.links ?? []).map(l => ({
    dir: "out" as const,
    rel: l.rel,
    path: l.target,
    title: nodes.get(l.target)?.title ?? l.target,  // resolve title, fallback to path
  }));
  const incoming = edges
    .filter(e => e.target === activeNote.path)
    .map(e => ({
      dir: "in" as const,
      rel: e.rel,
      path: e.source,
      title: nodes.get(e.source)?.title ?? e.source, // resolve title, fallback to path
    }));
  return [...outgoing, ...incoming].slice(0, 10);
}, [activeNote, edges, nodes]);  // nodes is a dep — new note selection changes which titles are available
```

### Files
- `crates/app/src/components/Editor/RelatedNotesFooter.tsx` — new component
- `crates/app/src/components/Editor/EditorPanel.tsx` — mount footer between editor body and bottom
- `crates/app/src/stores/uiStore.ts` — optional `relatedNotesOpen: boolean` for persistence
- `crates/app/src/App.css` — footer styles

---

## Improvement 4: Left-to-Right Hierarchical Layout

### Goal
Offer a ranked layout that flows left-to-right — foundational concepts (causes, precedes) on the left, derived or specific concepts on the right.

### Approach: cytoscape-dagre

```bash
npm install cytoscape-dagre dagre
```

```ts
import dagre from "cytoscape-dagre";
cytoscape.use(dagre);

cy.layout({
  name: "dagre",
  rankDir: "LR",
  nodeSep: 60,
  rankSep: 120,
  edgeSep: 20,
  animate: false,
  fit: true,
  padding: 40,
}).run();
```

### Edge filtering for ranking
Only directional edge types should contribute to dagre's rank assignment. The 8 directional types from the seed dataset:

`precedes`, `leads-to`, `causes`, `extends`, `depends-on`, `evolved-from`, `part-of`, `contains`

`cytoscape-dagre` runs on whatever elements you pass it — it does NOT silently ignore undirected/cyclic edges. Passing all 196 edges (including `related-to`, `contradicts`, etc.) will corrupt rank assignments. The layout must be called on a filtered element collection:

```ts
const DIRECTIONAL_RELS = new Set(["precedes", "leads-to", "causes", "extends", "depends-on", "evolved-from", "part-of", "contains"]);

const layoutElements = cy.elements().filter(el => {
  if (el.isNode()) return true;
  return DIRECTIONAL_RELS.has(el.data("label"));
});

layoutElements.layout({
  name: "dagre",
  rankDir: "LR",
  nodeSep: 60,
  rankSep: 120,
  animate: false,
  fit: true,
  padding: 40,
}).run();
// All 196 edges remain visible in cy — only the layout input was filtered
```

### Toolbar integration

Add a layout selector to `GraphToolbar.tsx`:

```tsx
<select value={graphLayout} onChange={e => setGraphLayout(e.target.value)}>
  <option value="force">Force</option>
  <option value="hierarchical">Hierarchical (LR)</option>
</select>
```

Switching triggers `cy.layout(...).run()` — no re-fetch, just repositions elements already in the graph.

### Files
- `crates/app/package.json` — add `cytoscape-dagre`, `dagre`
- `crates/app/src/components/GraphView/GraphView.tsx` — layout switching logic
- `crates/app/src/components/GraphView/GraphToolbar.tsx` — layout dropdown
- `crates/app/src/stores/uiStore.ts` — add `graphLayout: "force" | "hierarchical"`

---

## Improvement 5: Resizable Panels

### Goal
Allow dragging the dividers between graph, editor, and search panels to redistribute screen space.

### Recommended library: react-resizable-panels

- `npm install react-resizable-panels` — 15KB, zero dependencies, actively maintained
- Provides `<PanelGroup>`, `<Panel>`, `<PanelResizeHandle>` — drop-in for the current flex layout
- Handles mouse/touch capture, min/max constraints, and keyboard accessibility

### Layout structure

```tsx
// AppLayout.tsx
<PanelGroup direction="horizontal" onLayout={savePanelSizes}>
  <Panel defaultSize={panelSizes.graph ?? 60} minSize={15} id="graph">
    <FileTreePanel />   {/* if treeOpen */}
    <GraphView />
  </Panel>
  <PanelResizeHandle className="resize-handle-h" />
  <Panel defaultSize={panelSizes.right ?? 40} minSize={15} id="right">
    <PanelGroup direction="vertical">
      <Panel defaultSize={panelSizes.editor ?? 70} minSize={20} id="editor">
        <EditorPanel />
      </Panel>
      <PanelResizeHandle className="resize-handle-v" />
      <Panel defaultSize={panelSizes.search ?? 30} minSize={10} id="search">
        <SearchPanel />
      </Panel>
    </PanelGroup>
  </Panel>
</PanelGroup>
```

### Persistence

```ts
// uiStore.ts
panelSizes: JSON.parse(localStorage.getItem("brainmap:panelSizes") ?? "{}"),
savePanelSizes: (sizes) => {
  localStorage.setItem("brainmap:panelSizes", JSON.stringify(sizes));
  set({ panelSizes: sizes });
},
```

**Note**: `localStorage` works in Tauri v2 but can be cleared by OS cache management or app reinstall. For panel size preferences — a pure convenience setting — this is acceptable. Introducing `tauri-plugin-store` for this alone would add a Rust dependency for marginal benefit; use `localStorage` here and revisit if other settings also need persistence.

### Resize handle styles

```css
/* App.css */
.resize-handle-h {
  width: 4px;
  background: var(--border-color);
  cursor: col-resize;
  flex-shrink: 0;
}
.resize-handle-h:hover, .resize-handle-h[data-resize-handle-active] {
  background: var(--accent);
}
.resize-handle-v {
  height: 4px;
  background: var(--border-color);
  cursor: row-resize;
  flex-shrink: 0;
}
.resize-handle-v:hover, .resize-handle-v[data-resize-handle-active] {
  background: var(--accent);
}
```

### Files
- `crates/app/package.json` — add `react-resizable-panels`
- `crates/app/src/components/Layout/AppLayout.tsx` — replace flex divs with PanelGroup
- `crates/app/src/stores/uiStore.ts` — add `panelSizes`, `savePanelSizes`
- `crates/app/src/App.css` — resize handle styles

---

## Improvement 6: Directory / File Tree View

### Goal
Add a collapsible file tree sidebar showing the workspace folder structure, enabling navigation by path rather than graph position.

### Data source (no new API call)
`graphStore.nodes` is already a `Map<string, NodeDto>` keyed by relative path (e.g., `"concepts/causal-inference.md"`). The tree is built client-side by splitting on `/`.

### Tree derivation

```ts
interface TreeNode {
  name: string;
  path: string | null;   // null for folders, rel path for files
  title: string;
  children: Record<string, TreeNode>;
}

function buildTree(nodes: Map<string, NodeDto>): TreeNode {
  const root: TreeNode = { name: "", path: null, title: "", children: {} };
  for (const [path, node] of nodes) {
    const parts = path.replace(/\.md$/, "").split("/");
    let cur = root;
    for (let i = 0; i < parts.length - 1; i++) {
      cur.children[parts[i]] ??= { name: parts[i], path: null, title: parts[i], children: {} };
      cur = cur.children[parts[i]];
    }
    const last = parts[parts.length - 1];
    cur.children[last] = { name: last, path, title: node.title, children: {} };
  }
  return root;
}
```

### Component: `FileTreePanel.tsx`

```
[🔍 filter...]
📁 concepts/      ▾
  📄 Causal Inference    ← active (highlighted)
  📄 Confounding
📁 books/         ▾
  📄 The Book of Why
📁 questions/     ▾
  📄 What Causes Obesity?
```

- Folder click: toggle expand/collapse (state in `uiStore.treeExpandedFolders: Set<string>` — **keyed by full folder path**, not segment name, to prevent bleed between folders that share the same name at different depths, e.g. `books/references` vs `papers/references`)
- File click: `graphStore.selectNode(path)` → opens in editor + highlights in graph
- Active note highlighted with accent background
- Filter input at top: substring match on title, hides non-matching nodes
- All folders expanded by default for small datasets
- **Root-level files** (no `/` in path) must be handled — they live directly under the virtual root node with no parent folder

### Placement

Add as an additional panel inside the graph column (far left), collapsible via `uiStore.treeOpen`.

With `react-resizable-panels` from Improvement 5, the graph column becomes:

```tsx
<Panel id="graph">
  {treeOpen && (
    <>
      <FileTreePanel />
      <PanelResizeHandle className="resize-handle-h" />
    </>
  )}
  <GraphView />
</Panel>
```

Toggle button: in the app toolbar or as a sidebar icon strip (Cmd+B to match VSCode/Zed muscle memory).

### Files
- `crates/app/src/components/Layout/FileTreePanel.tsx` — new component
- `crates/app/src/components/Layout/AppLayout.tsx` — add tree panel inside graph column
- `crates/app/src/stores/uiStore.ts` — add `treeOpen`, `toggleTree`, `treeExpandedFolders`
- `crates/app/src/App.css` — tree node styles, active highlight, indent lines
- `crates/app/src/App.tsx` — Cmd+B shortcut for tree toggle

---

## Additional Opportunities

### A. Wire InspectorPanel (already built, just orphaned)

`crates/app/src/components/Inspector/InspectorPanel.tsx` is fully implemented — shows title, type, tags, dates, outgoing and incoming links — but is not mounted in `AppLayout`. Easiest quick win: add as a collapsible drawer below the editor, or as a second tab in the right column.

### B. Node sizing by in-degree

Larger circles for highly-connected concepts make important nodes visually prominent.

```ts
// After cy.add([...cyNodes, ...validEdges]):
cy.nodes().forEach(n => {
  const size = Math.max(20, 20 + n.indegree() * 4);
  n.style({ width: size, height: size });
});
```

No new data needed — in-degree computed from already-loaded edges.

### C. Color legend overlay

A small floating legend in the graph panel showing type → color mapping from `graphStyles.ts`. Toggle button in the toolbar. CSS `position: absolute; top: 8px; right: 8px` inside the graph container.

### D. Hover tooltips on graph nodes

Show title + type + tags on mouseover without selecting:

```ts
cy.on("mouseover", "node", evt => {
  const node = evt.target;
  showTooltip({ title: node.data("label"), type: node.data("noteType") }, evt.originalEvent);
});
cy.on("mouseout", "node", hideTooltip);
```

### E. Remove debug overlay

`GraphView.tsx` has a yellow debug bar and `border: "2px solid red"` on the graph container. Remove both before any release.

---

## Priority Matrix

| # | Improvement | Effort | Impact | New Deps | Priority |
|---|-------------|--------|--------|----------|----------|
| 1 | Fix graph overlap (fcose + label hiding) | Low | High | cytoscape-fcose | **P0** |
| E | Remove debug overlay | Trivial | Medium | none | **P0** |
| 5 | Resizable panels | Medium | High | react-resizable-panels | **P1** |
| 6 | File tree view | Medium | High | (shares dep with 5) | **P1** |
| 2 | Full-screen note view | Low | Medium | none | **P1** |
| 3 | Related notes footer | Low | High | none | **P1** |
| 4 | Hierarchical LR layout | Medium | Medium | cytoscape-dagre, dagre | **P2** |
| A | Wire InspectorPanel | Trivial | Medium | none | **P2** |
| B | Node sizing by in-degree | Trivial | Low | none | **P3** |
| C | Color legend | Low | Low | none | **P3** |
| D | Hover tooltips | Low | Medium | none | **P3** |

---

## Recommended Implementation Order

1. **Debug cleanup** — remove yellow bar + red border from `GraphView.tsx`
2. **Graph overlap** — install `cytoscape-fcose`, update layout, add zoom-based label hiding + toolbar toggle
3. **Resizable panels** — install `react-resizable-panels`, rewrite `AppLayout.tsx`, add localStorage persistence
4. **File tree** — add `FileTreePanel.tsx` inside graph column (builds on #3's panel system)
5. **Full-screen mode** — `uiStore.focusMode` + CSS flex collapse in `AppLayout`, expand button in editor header
6. **Related notes footer** — `RelatedNotesFooter.tsx` + mount in `EditorPanel`
7. **Hierarchical layout** — install `cytoscape-dagre dagre`, add layout dropdown to `GraphToolbar`

### New npm packages required

```
cytoscape-fcose          # Improvement 1 — better force layout
react-resizable-panels   # Improvement 5 + 6 — drag-to-resize panels
cytoscape-dagre dagre    # Improvement 4 — hierarchical LR layout
```

### Files changed (complete list)

| File | Change |
|------|--------|
| `crates/app/package.json` | add 3 new deps |
| `crates/app/src/components/GraphView/GraphView.tsx` | fcose layout, zoom-based label hiding, debug removal |
| `crates/app/src/components/GraphView/graphStyles.ts` | `.labeled` class, default label off |
| `crates/app/src/components/GraphView/GraphToolbar.tsx` | label toggle, layout selector |
| `crates/app/src/components/Layout/AppLayout.tsx` | PanelGroup layout, focusMode flex, tree slot |
| `crates/app/src/components/Layout/FileTreePanel.tsx` | **new** — file tree component |
| `crates/app/src/components/Editor/EditorPanel.tsx` | expand button, mount RelatedNotesFooter |
| `crates/app/src/components/Editor/RelatedNotesFooter.tsx` | **new** — related notes component |
| `crates/app/src/stores/uiStore.ts` | focusMode, graphLayout, treeOpen, panelSizes |
| `crates/app/src/App.tsx` | Escape handler extension, Cmd+B shortcut |
| `crates/app/src/App.css` | resize handle styles, tree styles |
