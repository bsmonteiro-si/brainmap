# Plan: Home Note System + 3 New Graph Layouts

## Context

The graph view dumps all 52 nodes at once on workspace open, creating an unreadable hairball. The `index` note type exists as a semantic "hub/waypoint" but has no special graph behavior. Focus mode already supports showing a node + 1-hop neighbors. This feature combines these: auto-focus on the index note at open with a new radial layout, plus two more layout options (concentric, grouped by type), a Home toolbar button, and visual distinction for the home node.

No backend/Rust changes required — entirely frontend.

## Files to Modify

| File | Change |
|------|--------|
| `crates/app/src/stores/uiStore.ts` | Expand `GraphLayout` type, add `homeNotePath` field + actions |
| `crates/app/src/components/GraphView/GraphView.tsx` | Expand `runLayout` (3 new branches), home-node class, rootId passing, cleanup guard |
| `crates/app/src/components/GraphView/GraphToolbar.tsx` | 5-option dropdown, Home button |
| `crates/app/src/components/GraphView/graphStyles.ts` | `node.home-node` style selector |
| `crates/app/src/hooks/useHomeAutoFocus.ts` | **New** — reactive hook for auto-focus on workspace open |
| `crates/app/src/utils/homeNoteDetect.ts` | **New** — pure `autoDetectHomeNote` function |
| `crates/app/src/components/Layout/FileTreePanel.tsx` | "Set as Home Note" context menu item |
| `crates/app/src/stores/segmentStateCache.ts` | Add `homeNotePath` to snapshot (already in uiStore section) |
| `crates/app/src/components/GraphView/GraphView.tsx` | "Set as Home Note" in graph context menu |

## Step 1: Expand GraphLayout type + add homeNotePath to uiStore

**File**: `crates/app/src/stores/uiStore.ts`

```typescript
export type GraphLayout = "force" | "hierarchical" | "radial" | "concentric" | "grouped";
```

Add to UIStore state:
```typescript
homeNotePath: string | null;  // relative path to the workspace home/index note
```

Add actions:
```typescript
setHomeNote: (path: string) => void;
clearHomeNote: () => void;
```

Default: `homeNotePath: null`

Persist `homeNotePath` per-workspace within the existing `brainmap:uiPrefs` localStorage structure (no new localStorage key).

Add `homeNotePath` to the workspace-scoped fields captured/restored in `SegmentSnapshot` (it's already in the uiStore section of `segmentStateCache.ts`).

## Step 2: Pure autoDetectHomeNote utility

**New file**: `crates/app/src/utils/homeNoteDetect.ts`

```typescript
/** Scan nodes for an index-type note. Returns its path or null. */
export function autoDetectHomeNote(nodes: Map<string, NodeDto>): string | null {
  const indexNotes: string[] = [];
  for (const [path, node] of nodes) {
    if (node.note_type === "index") indexNotes.push(path);
  }
  if (indexNotes.length === 0) return null;
  if (indexNotes.length === 1) return indexNotes[0];
  // Multiple index notes: pick first alphabetically (deterministic, simple)
  return indexNotes.sort()[0];
}
```

No in-degree tiebreaking (avoids needing edges passed in; multiple index notes is rare).

## Step 3: Reactive auto-focus hook

**New file**: `crates/app/src/hooks/useHomeAutoFocus.ts`

A `useEffect` hook used in `GraphView` (or `App`) that:
1. Watches for workspace load completion (`workspaceStore.info` becoming non-null + `graphStore.nodes.size > 0`)
2. Calls `autoDetectHomeNote(nodes)` if `uiStore.homeNotePath` is null
3. If a home note is found/set, calls `setGraphFocus(homeNotePath, "note")` + `setGraphLayout("radial")`
4. Only runs once per workspace open (tracked via a ref or previous-workspace-root comparison)

This keeps UI orchestration in the view layer, not in `workspaceStore.openWorkspace`.

## Step 4: Expand runLayout (3 new layout branches)

**File**: `crates/app/src/components/GraphView/GraphView.tsx`

Change signature:
```typescript
function runLayout(cy: Core, layout: GraphLayout, animate = false, rootNodeId?: string | null)
```

**Defensive fallback** at the end: if layout doesn't match any branch, fall back to force layout.

### Radial (`breadthfirst` — built-in, no deps)
```typescript
} else if (layout === "radial") {
  const root = rootNodeId ?? getMostConnectedNodeId(cy);
  cy.layout({
    name: "breadthfirst",
    circle: true,
    roots: root ? [root] : undefined,
    spacingFactor: 1.5,
    animate, animationDuration: 500, animationEasing: "ease-in-out-sine",
    fit: true, padding: 60,
  } as cytoscape.LayoutOptions).run();
}
```

Note: `breadthfirst` handles disconnected components by placing unreachable nodes in additional rows/rings. Not perfect but acceptable.

### Concentric (`concentric` — built-in)
```typescript
} else if (layout === "concentric") {
  cy.layout({
    name: "concentric",
    concentric: (node: cytoscape.NodeSingular) => node.degree(false),
    levelWidth: () => 2,
    minNodeSpacing: 60,
    animate, animationDuration: 500, animationEasing: "ease-in-out-sine",
    fit: true, padding: 60,
  } as cytoscape.LayoutOptions).run();
}
```

### Grouped by Type (fcose with biased initial positions — NO compound nodes)

**Rationale**: Compound parent nodes are fragile (async `layoutstop` races, `removeData("parent")` doesn't work in Cytoscape, phantom nodes visible to hover/hulls/minimap). Instead, use fcose with pre-positioned nodes biased toward their type's cluster center.

```typescript
} else if (layout === "grouped") {
  // Partition nodes by type, assign group centers on a circle
  const typeGroups = new Map<string, string[]>();
  cy.nodes().forEach(n => {
    const t = n.data("noteType") as string;
    if (!typeGroups.has(t)) typeGroups.set(t, []);
    typeGroups.get(t)!.push(n.id());
  });

  const groupCount = typeGroups.size;
  const radius = Math.max(200, cy.nodes().length * 8);
  let i = 0;
  const nodePositions: Record<string, { x: number; y: number }> = {};

  for (const [, ids] of typeGroups) {
    const angle = (2 * Math.PI * i) / groupCount;
    const cx = radius * Math.cos(angle);
    const cy_ = radius * Math.sin(angle);
    ids.forEach((id, j) => {
      // Slight jitter within the group cluster
      const jitterAngle = (2 * Math.PI * j) / ids.length;
      const jitterR = Math.min(80, ids.length * 10);
      nodePositions[id] = {
        x: cx + jitterR * Math.cos(jitterAngle),
        y: cy_ + jitterR * Math.sin(jitterAngle),
      };
    });
    i++;
  }

  // Pre-position nodes, then run fcose with moderate gravity to keep clusters
  cy.nodes().forEach(n => {
    const pos = nodePositions[n.id()];
    if (pos) n.position(pos);
  });

  cy.layout({
    name: "fcose",
    animate, animationDuration: 500, animationEasing: "ease-in-out-sine",
    quality: "proof",
    idealEdgeLength: 150,
    nodeRepulsion: 30000,
    edgeElasticity: 0.20,
    gravity: 0.25,         // stronger gravity keeps groups tighter
    gravityRange: 3.0,
    numIter: 1500,
    fit: true, padding: 60,
    nodeDimensionsIncludeLabels: false,
    randomize: false,       // use pre-positioned node positions
  } as cytoscape.LayoutOptions).run();
}
```

**Advantages over compound approach**: No graph mutation, no async cleanup, no phantom nodes, works with existing hover/hull/minimap effects unchanged, scales well (fcose is fast).

### Helper function:
```typescript
function getMostConnectedNodeId(cy: Core): string | undefined {
  let maxDeg = 0, maxId: string | undefined;
  cy.nodes().forEach(n => {
    const d = n.degree(false);
    if (d > maxDeg) { maxDeg = d; maxId = n.id(); }
  });
  return maxId;
}
```

### Helper for radial root resolution (used in both layout call sites):
```typescript
function getRadialRootId(cy: Core): string | undefined {
  return useUIStore.getState().homeNotePath ?? getMostConnectedNodeId(cy);
}
```

## Step 5: Pass rootNodeId in both layout call sites

**Layout-change effect** (line ~182):
```typescript
useEffect(() => {
  graphLayoutRef.current = graphLayout;
  const cy = cyRef.current;
  if (cy && cy.nodes().length > 0) {
    const rootId = graphLayout === "radial" ? getRadialRootId(cy) : undefined;
    runLayout(cy, graphLayout, true, rootId);
  }
}, [graphLayout]);
```

**Initial data-sync layout** (line ~411):
```typescript
const layout = graphLayoutRef.current;
const rootId = layout === "radial" ? getRadialRootId(cy) : undefined;
runLayout(cy, layout, false, rootId);
```

## Step 6: Update GraphToolbar

**File**: `crates/app/src/components/GraphView/GraphToolbar.tsx`

1. Import `GraphLayout` type from uiStore. Expand `<select>`:
```html
<select value={graphLayout} onChange={(e) => setGraphLayout(e.target.value as GraphLayout)}>
  <option value="force">Force Layout</option>
  <option value="hierarchical">Hierarchical (LR)</option>
  <option value="radial">Radial</option>
  <option value="concentric">Concentric</option>
  <option value="grouped">Grouped by Type</option>
</select>
```

2. Add Home button (Lucide `Home` icon, already available):
```tsx
{homeNotePath && (
  <button
    onClick={() => {
      setGraphFocus(homeNotePath, "note");
      setGraphLayout("radial");
    }}
    title="Go to home note (radial view)"
  >
    <Home size={14} /> Home
  </button>
)}
```

Only visible when `homeNotePath` is set.

## Step 7: Home node visual distinction

**File**: `crates/app/src/components/GraphView/graphStyles.ts`

Add to stylesheet array:
```typescript
{
  selector: "node.home-node",
  style: {
    width: 26,
    height: 26,
    "border-width": 2,
    "border-color": "#ffd700",
    "border-opacity": 0.7,
    "shadow-blur": 18,
    "shadow-opacity": 0.9,
    "shadow-color": "#ffd700",
  },
},
```

**File**: `crates/app/src/components/GraphView/GraphView.tsx`

In the "Sync graph data to Cytoscape" effect, after marking the focal node:
```typescript
const homePath = useUIStore.getState().homeNotePath;
if (homePath) {
  cy.getElementById(homePath).addClass("home-node");
}
```

## Step 8: "Set as Home Note" context menus

**File**: `crates/app/src/components/Layout/FileTreePanel.tsx`

Add to note context menu (before "Focus in Graph"):
- "Set as Home Note" → `useUIStore.getState().setHomeNote(node.path)`
- If already home: "Unset Home Note" → `useUIStore.getState().clearHomeNote()`

**File**: `crates/app/src/components/GraphView/GraphView.tsx`

Add to graph node `ctxMenu`:
- "Set as Home Note" / "Unset Home Note" (same logic)

## Step 9: Handle home note deletion

In the "Sync graph data to Cytoscape" effect or via `graphStore.applyEvent`:
```typescript
// If home note was deleted, clear it
const homePath = useUIStore.getState().homeNotePath;
if (homePath && !nodes.has(homePath)) {
  useUIStore.getState().clearHomeNote();
}
```

For background segments: add a guard in the Home button's `onClick` that verifies the home note exists in the graph before focusing. Also extend `applyEventToSnapshot` to clear `homeNotePath` if the deleted node matches.

## Step 10: Segment state cache

**File**: `crates/app/src/stores/segmentStateCache.ts`

`homeNotePath` is already a uiStore field, so it needs to be added to the uiStore section of `SegmentSnapshot`:
```typescript
// uiStore (workspace-scoped)
homeNotePath: string | null;
```

Capture: `homeNotePath: ui.homeNotePath`
Restore: set in uiStore alongside other workspace-scoped fields.

## Step 11: Tests

**New file**: `crates/app/src/utils/homeNoteDetect.test.ts`
- Zero index notes → returns null
- One index note → returns its path
- Multiple index notes → returns first alphabetically
- All folder nodes → returns null
- Returned path matches a known NodeDto.path

**New/update**: `crates/app/src/stores/uiStore.test.ts`
- `setHomeNote` / `clearHomeNote` round-trip
- Invalid/corrupted localStorage → graceful fallback to null

**New/update**: `GraphToolbar.test.ts`
- Dropdown renders 5 layout options
- Home button visible when homeNotePath set, hidden when null

**Update**: `segmentStateCache.test.ts`
- homeNotePath captured and restored in snapshots

**Note on layout tests**: The three new layouts use Cytoscape built-in algorithms with no custom graph mutation (grouped uses standard fcose with pre-positioned nodes). Integration testing via manual verification (Step 12) is sufficient — no risky custom cleanup logic to unit test.

## Step 12: Documentation

- Update `CLAUDE.md` current status: home note system, 5 graph layouts, auto-focus on index
- Update test counts

## Verification

1. `cd crates/app && npx vitest run` → all tests pass
2. `cargo test` → all Rust tests pass (no backend changes, but confirm no regression)
3. Open seed dataset → should auto-focus on "The Book of Why" with radial layout (clean view)
4. Switch to each layout from dropdown → Force, Hierarchical, Radial, Concentric, Grouped — all animate smoothly
5. Click Home button → returns to radial + focus on "The Book of Why"
6. Right-click any note in file tree → "Set as Home Note" → gold glow appears, Home button works
7. Right-click home note → "Unset Home Note" → gold glow disappears, Home button hidden
8. Close workspace, reopen → home note remembered
9. Delete the home note file → gold glow clears, Home button disappears
10. Open workspace with no index notes → full force-directed graph (current behavior, no auto-focus)
