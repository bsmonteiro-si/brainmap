# 2026-03-10 — Subagent Transcript: Plan

**Date:** 2026-03-10 11:57:54
**Agent:** Plan
**Agent ID:** aae929c73249d9a6a
**Parent Session:** e775a4b6-ec6a-4752-8126-0b07a473af0a

---

## User

Design an implementation plan for a "Focus in Graph" feature for the BrainMap desktop app.

## Feature Description
When a user is in the Files view (FileTreePanel), they can right-click a file (note) or a folder and choose "Focus in Graph". This:
1. Switches to the Graph tab
2. Shows a filtered graph where the selected file/folder is the focal point (centered, prominent)
3. Only shows the focused node and its directly connected neighbors (for a note), OR all notes in a folder and edges between them (for a folder)

## Codebase Context

### Key Files
- `crates/app/src/stores/uiStore.ts` — UIStore with `treeOpen: boolean` (false=Graph tab, true=Files tab), `hiddenEdgeTypes`, `focusMode`, etc.
- `crates/app/src/stores/graphStore.ts` — GraphStore with `nodes: Map<string, NodeDto>`, `edges: EdgeDto[]`, `selectedNodePath: string | null`, `expandedNodes: Set<string>`
- `crates/app/src/components/Layout/FileTreePanel.tsx` — Renders file tree. Files call `selectNode(node.fullPath)` + `openNote(node.fullPath)` on click. Folders call `toggleFolder(path)` on click. No right-click context menu currently.
- `crates/app/src/components/GraphView/GraphView.tsx` — Cytoscape.js graph. Reads `nodes, edges` from graphStore. Filters edges by `hiddenEdgeTypes`. No concept of subgraph focus currently.
- `crates/app/src/components/GraphView/GraphToolbar.tsx` — Toolbar with layout selector, edge filter popover, label toggle, legend toggle. Currently no "Clear Focus" concept.
- `crates/app/src/components/Layout/AppLayout.tsx` — 3-panel layout. Tab switching via CSS display on Graph/Files panels.

### Existing Infrastructure
- `getNeighbors(path, depth)` API exists in tauri.ts and bridge.ts (returns Subgraph with nodes + edges)
- Full topology is already loaded: `graphStore.nodes` (Map) and `graphStore.edges` (EdgeDto[]) contain ALL notes and ALL edges
- Each EdgeDto has: `source: string` (path), `target: string` (path), `rel: string` (relationship type), `kind: string`
- Each NodeDto has: `fullPath: string`, `title: string`, `note_type: string`, `indegree: number`, etc.
- UIStore `treeOpen: false` → Graph tab visible; `treeOpen: true` → Files tab visible

### Data Model for Filtering
For a **note focus**: Show the focused node + all nodes with edges to/from it + only those edges.
```typescript
const connectedEdges = edges.filter(e => e.source === focusPath || e.target === focusPath)
const neighborPaths = new Set(connectedEdges.flatMap(e => [e.source, e.target]))
const filteredNodes = [...nodes.values()].filter(n => neighborPaths.has(n.fullPath))
```

For a **folder focus**: Show all notes whose path starts with folderPath prefix + edges between them.
```typescript
const folderNodes = [...nodes.values()].filter(n => n.fullPath.startsWith(focusPath + "/"))
const folderPaths = new Set(folderNodes.map(n => n.fullPath))
const folderEdges = edges.filter(e => folderPaths.has(e.source) && folderPaths.has(e.target))
```

## Requirements
1. Right-click context menu on files AND folders in FileTreePanel with "Focus in Graph" option
2. Clicking "Focus in Graph" → sets focus state in store → switches to Graph tab → graph re-renders with filtered subgraph
3. Clear focus button in GraphToolbar (visible only when focus is active) → returns to full graph
4. Visual indicator in graph showing focus mode is active (e.g., banner or highlighted focal node)
5. No new backend API calls needed — use existing loaded topology data
6. The focused node should be visually distinct (larger, glowing, or centrally positioned)

## Design Questions
- Where to store focus state: in UIStore (UI concern) or GraphStore (data concern)? Likely UIStore since it's a display mode.
- How to handle the case where the focused note is NOT in the current loaded topology (shouldn't happen as full topology is always loaded)
- Should depth be configurable (depth=1 for immediate neighbors, depth=2 for extended neighborhood)?

Please design a detailed implementation plan covering:
1. State management changes (which store, what fields)
2. FileTreePanel context menu implementation (HTML/CSS approach for a minimal right-click menu)
3. GraphView filtering logic
4. GraphToolbar changes
5. Tab switching logic
6. Testing considerations
7. Any edge cases

Keep the plan focused on simplicity — avoid over-engineering. Use existing patterns in the codebase.

---

## Assistant

Let me explore the codebase thoroughly before designing the plan.

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/**/*.css"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/*.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphLegend.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/**/*.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Inspector/InspectorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

I now have a thorough understanding of the codebase. Let me design the complete implementation plan.

---

# "Focus in Graph" Feature — Implementation Plan

## Overview

The feature adds a right-click context menu to FileTreePanel nodes and folders with a "Focus in Graph" action. Clicking it stores focus state in UIStore, switches to the Graph tab, and instructs GraphView to render only the relevant subgraph. A "Clear Focus" button in GraphToolbar dismisses the mode. All filtering happens client-side using the already-loaded `graphStore.nodes` and `graphStore.edges` — no backend calls.

---

## 1. State Management

### Decision: UIStore (not GraphStore)

Focus in graph is a display/navigation mode, not a data mutation. It belongs in UIStore alongside the existing `hiddenEdgeTypes`, `showEdgeLabels`, `focusMode` (editor focus), and `treeOpen` fields. GraphStore should remain a pure data store.

Two new fields added to UIStore:

```typescript
// In UIState interface:
graphFocusPath: string | null;   // null = no focus; a path = focused on this node or folder
graphFocusKind: "note" | "folder" | null;

// Actions:
setGraphFocus: (path: string, kind: "note" | "folder") => void;
clearGraphFocus: () => void;
```

The action `setGraphFocus` must also set `treeOpen: false` to switch to the Graph tab in the same atomic update:

```typescript
setGraphFocus: (path, kind) => set({ graphFocusPath: path, graphFocusKind: kind, treeOpen: false }),
clearGraphFocus: () => set({ graphFocusPath: null, graphFocusKind: null }),
```

Rationale for combining the tab switch in the action: AppLayout already reacts to `treeOpen` changes by showing/hiding panels. A single `set({...})` call means exactly one re-render, no intermediate state where the tab has switched but the focus isn't set yet.

Note: the existing `focusMode: boolean` in UIStore is the editor full-screen mode (collapses the left panel). The new `graphFocusPath` is a different concept — it must not collide. The naming `graphFocusPath` / `graphFocusKind` makes this unambiguous.

---

## 2. FileTreePanel Context Menu

### Approach: Local React state, portal-less absolute div

The `FileTreeNode` component is split from a simple `div` click handler into one that also handles `onContextMenu`. A local state `contextMenu: { x: number; y: number; node: TreeNode } | null` lives at the `FileTreePanel` level (not inside `FileTreeNode`) so only one menu can be open at a time.

This mirrors how the edge filter popover in `GraphToolbar.tsx` is handled: a `useRef` + `useEffect` that closes the popover on outside click.

### Changes to FileTreeNode

`FileTreeNode` receives an `onContextMenu` prop:

```typescript
interface FileTreeNodeProps {
  node: TreeNode;
  depth: number;
  onContextMenu: (e: React.MouseEvent, node: TreeNode) => void;
}
```

Both the folder `div` and the file `div` call `onContextMenu` with `e.preventDefault()` to suppress the native browser menu.

### Context menu component (inline in FileTreePanel.tsx)

```typescript
interface ContextMenuProps {
  x: number;
  y: number;
  node: TreeNode;
  onClose: () => void;
}
```

Rendered as a `position: fixed` div at `(x, y)`. Contains one item: "Focus in Graph". Clicking calls `useUIStore.getState().setGraphFocus(node.fullPath, node.isFolder ? "folder" : "note")` then `onClose()`.

The menu auto-closes on:
- Outside click (mousedown listener on `document`, same pattern as GraphToolbar popover)
- Escape key (keydown listener on `document`)
- The `onClose` callback from item selection

### Positioning edge case

If the menu would overflow the right edge of the viewport (`x + menuWidth > window.innerWidth`), flip it left. This is a simple `Math.min(x, window.innerWidth - MENU_WIDTH)` clamp. Same for bottom overflow.

### CSS classes needed (in App.css)

```css
.context-menu { position: fixed; z-index: 200; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); padding: 4px 0; min-width: 160px; }
.context-menu-item { padding: 6px 14px; font-size: 13px; cursor: pointer; color: var(--text-primary); }
.context-menu-item:hover { background: var(--bg-tertiary); }
```

---

## 3. GraphView Filtering Logic

### Where the filter runs

The filtering is a `useMemo` inside `GraphView`, computed from `graphFocusPath`, `graphFocusKind`, and the raw `nodes` + `edges` from graphStore. It produces `filteredNodes` and `filteredEdges` that replace the raw values in the Cytoscape sync effect.

```typescript
// In GraphView.tsx
const graphFocusPath = useUIStore((s) => s.graphFocusPath);
const graphFocusKind = useUIStore((s) => s.graphFocusKind);

const { filteredNodes, filteredEdges, focalPath } = useMemo(() => {
  if (!graphFocusPath) {
    return { filteredNodes: [...nodes.values()], filteredEdges: edges, focalPath: null };
  }
  if (graphFocusKind === "note") {
    const connectedEdges = edges.filter(
      (e) => e.source === graphFocusPath || e.target === graphFocusPath
    );
    const neighborPaths = new Set(connectedEdges.flatMap((e) => [e.source, e.target]));
    return {
      filteredNodes: [...nodes.values()].filter((n) => neighborPaths.has(n.path)),
      filteredEdges: connectedEdges,
      focalPath: graphFocusPath,
    };
  } else {
    // folder focus
    const prefix = graphFocusPath + "/";
    const folderNodes = [...nodes.values()].filter((n) => n.path.startsWith(prefix));
    const folderPaths = new Set(folderNodes.map((n) => n.path));
    return {
      filteredNodes: folderNodes,
      filteredEdges: edges.filter(
        (e) => folderPaths.has(e.source) && folderPaths.has(e.target)
      ),
      focalPath: null, // no single focal node for folder focus
    };
  }
}, [graphFocusPath, graphFocusKind, nodes, edges]);
```

The `filteredNodes` and `filteredEdges` values replace `nodes.values()` and `edges` in the existing Cytoscape sync effect. The existing `hiddenEdgeTypes` filter continues to apply on top of `filteredEdges`.

### Focal node visual styling

When `focalPath` is non-null (note focus), after `cy.elements().remove()` + `cy.add(...)`, the focal node gets a class `graph-focus-node`:

```typescript
if (focalPath) {
  cy.getElementById(focalPath).addClass("graph-focus-node");
}
```

In graphStyles.ts, add a new stylesheet entry:

```typescript
{
  selector: "node.graph-focus-node",
  style: {
    width: 18,
    height: 18,
    "border-width": 2.5,
    "border-color": "#ffffff",
    "border-opacity": 1.0,
    "shadow-blur": 24,
    "shadow-opacity": 1.0,
  },
},
```

This makes the focal node visibly larger and brighter than regular nodes or the existing `node:selected` style (which is size 14).

### Layout re-run on focus change

The existing Cytoscape sync effect already calls `runLayout` whenever the data changes. Since `filteredNodes`/`filteredEdges` are new references when focus changes, the effect fires automatically. No extra wiring needed.

---

## 4. GraphToolbar Changes

Add a "Clear Focus" button that is only visible when `graphFocusPath` is not null:

```typescript
const graphFocusPath = useUIStore((s) => s.graphFocusPath);
const clearGraphFocus = useUIStore((s) => s.clearGraphFocus);

// In the JSX, after the Labels button:
{graphFocusPath && (
  <button
    className="active"
    onClick={clearGraphFocus}
    title="Exit focus view"
    style={{ borderColor: "var(--warning)", background: "var(--warning)", color: "#1a1a1a" }}
  >
    Focus ×
  </button>
)}
```

Using `className="active"` plus an inline warning color (yellow-orange) makes the button prominent. The `×` suffix signals dismissability. This is intentionally brief — the button is only present when needed and its visual treatment is sufficient.

An alternative would be a banner, but the toolbar placement keeps the graph canvas unobstructed. A banner could be added later if users find the button easy to miss.

---

## 5. Tab Switching Logic

The `setGraphFocus` action in UIStore sets `treeOpen: false` atomically. AppLayout already reacts to `treeOpen` changing via its `useEffect` that calls `graphPanelRef.current?.expand()`. This means:

1. User right-clicks a file in FileTreePanel
2. Selects "Focus in Graph"
3. `setGraphFocus` runs: `{ graphFocusPath: path, graphFocusKind: "note", treeOpen: false }`
4. React re-renders: AppLayout sees `treeOpen=false`, shows the Graph tabpanel, hides the Files tabpanel
5. The existing `useEffect` in GraphView reacts to `treeOpen` becoming false: calls `cy.resize()` and `cy.fit()` if needed
6. GraphView's filter `useMemo` sees the new `graphFocusPath`, computes the subgraph
7. The Cytoscape sync effect fires (nodes/edges references changed), re-renders the graph with the subgraph

No new tab-switching code is needed.

### Focus state persistence across tab switches

If the user manually switches back to the Files tab (clicking the "Files" tab or Cmd+B) and then returns to Graph, the focus state is still in UIStore (`graphFocusPath` is not cleared by `toggleTree`). This is intentional — if a user switches away and back, they should see the same focused view. The only ways to clear focus are: pressing "Focus ×" in the toolbar, or triggering a new "Focus in Graph" action on a different item.

---

## 6. Edge Cases

**Empty focus result (isolated note with no edges):** If a note has zero connections, `neighborPaths` still contains only `graphFocusPath` itself (since the `flatMap` produces only that path when `connectedEdges` is empty... actually no: `connectedEdges` would be empty, so `neighborPaths` would be empty). Fix: after computing `neighborPaths`, always add `graphFocusPath` itself: `neighborPaths.add(graphFocusPath)`. This ensures the focal node always appears even if it has no edges.

**Empty folder focus (folder with no notes):** If `folderNodes` is empty, GraphView will show the "No nodes" overlay. This is correct behavior.

**Focus path no longer in topology (note deleted while focused):** After the path is deleted via `applyEvent("node-deleted")`, `nodes` no longer contains it. The `filteredNodes` will be empty or contain only neighbors. The "No nodes" overlay will appear. No crash, acceptable UX. If desired, `applyEvent` in graphStore could also call `clearGraphFocus()` when the deleted path matches `graphFocusPath`, but that's a nice-to-have.

**Folder path collision with file paths:** `folderPath + "/"` prefix ensures that a folder named "causation" doesn't match a note at "causation.md" (since "causation.md".startsWith("causation/") is false). This is correct.

**Context menu on filtered tree (search active):** The filter only changes what's displayed; the `node.fullPath` is always the real path. "Focus in Graph" will work correctly regardless of the filter state.

**Context menu z-index in focus mode:** The editor focus mode collapses the left panel. If the user somehow triggers a context menu before the panel collapses, the fixed-position menu at z-index 200 will still render on top.

**Right-click on the filter input in FileTreePanel:** The input element does not have `onContextMenu`, so the browser's native text input context menu fires normally. No interference.

**Depth parameter decision:** Depth is fixed at 1 (immediate neighbors only). The requirement says "directly connected neighbors" and the existing data already supports it via the in-memory edge filter. Depth-2 would require adding a BFS traversal over the in-memory edges — that's straightforward to add later but is out of scope for this feature.

---

## 7. Files Changed (Summary)

| File | Change |
|---|---|
| `crates/app/src/stores/uiStore.ts` | Add `graphFocusPath`, `graphFocusKind`, `setGraphFocus`, `clearGraphFocus` |
| `crates/app/src/components/Layout/FileTreePanel.tsx` | Add `onContextMenu` prop to `FileTreeNode`, context menu state + component in `FileTreePanel` |
| `crates/app/src/components/GraphView/GraphView.tsx` | Read `graphFocusPath`/`graphFocusKind`, compute `filteredNodes`/`filteredEdges` via `useMemo`, apply `graph-focus-node` class |
| `crates/app/src/components/GraphView/GraphToolbar.tsx` | Add conditional "Focus ×" button |
| `crates/app/src/components/GraphView/graphStyles.ts` | Add `node.graph-focus-node` stylesheet entry |
| `crates/app/src/App.css` | Add `.context-menu`, `.context-menu-item` styles |

---

## 8. Implementation Sequence

1. **UIStore** — Add state fields and actions. Lowest-risk change, no rendering involved. Validate with a quick `console.log` that `treeOpen` flips.

2. **graphStyles.ts** — Add `node.graph-focus-node` style entry. Pure data addition.

3. **GraphView.tsx** — Add `useMemo` filtering and `graph-focus-node` class application. Temporarily test by manually calling `useUIStore.setState({ graphFocusPath: "some/path.md", graphFocusKind: "note", treeOpen: false })` from browser console.

4. **GraphToolbar.tsx** — Add the "Focus ×" conditional button. Verify it appears/disappears correctly.

5. **FileTreePanel.tsx** — Add context menu. This is the most UI-heavy change. Test that clicking "Focus in Graph" triggers the full flow end-to-end.

6. **App.css** — Add context menu styles alongside the existing tree styles (after the `/* ── File Tree ──` block).

7. **Documentation** — Update `CLAUDE.md` (Current Status section) and `README.md` (if it mentions features).

---

## 9. Testing Considerations

### Manual test cases
- Right-click a file node → menu appears → click "Focus in Graph" → Graph tab activates → only focal node + neighbors shown → focal node is larger/brighter → "Focus ×" button visible in toolbar
- Right-click a folder → same flow → all notes under that folder shown, only cross-folder edges visible
- Click "Focus ×" → full graph restored, button disappears
- Focus an isolated note (no edges) → graph shows only that single node, no crash
- Focus a folder with no notes → overlay shows "No nodes to display"
- Switch to Files tab after focusing, switch back → focus state preserved
- Focus a note, then delete the note (via editor) → graph shows only neighbors or overlay

### Automated testing

The app crate has no automated tests today (all tests are in `crates/core`, `crates/cli`, `crates/mcp`). Testing the app is manual or via Playwright/Tauri-test integration, which is out of scope. No new test infrastructure is required by this plan.

---

## 10. Documentation Updates

- **CLAUDE.md** (Current Status): Add "Focus in Graph feature: right-click context menu in FileTreePanel, subgraph filtering in GraphView, focal node visual style, Clear Focus in GraphToolbar" to the Phase 1c / Additional opportunities summary line.
- **README.md**: If it lists features, add "Focus in Graph from Files view" to the features list.
- No `docs/` spec files are affected since this is a UI-only feature not specified in the original architecture docs.

---

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts` — Core state: add `graphFocusPath`, `graphFocusKind`, `setGraphFocus`, `clearGraphFocus`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx` — Most substantial UI change: context menu component, `onContextMenu` wiring on both file and folder nodes
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx` — Filter logic via `useMemo`, focal node class application; the most logic-dense change
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphToolbar.tsx` — Add conditional "Focus ×" button; pattern to follow from the existing edge filter popover button
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` — Context menu styles; follow the `.edge-filter-popover` block as a pattern

---

