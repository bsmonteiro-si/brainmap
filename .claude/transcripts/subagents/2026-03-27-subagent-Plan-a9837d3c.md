# 2026-03-27 — Subagent Transcript: Plan

**Date:** 2026-03-27 17:10:28
**Agent:** Plan
**Agent ID:** a9837d3c6c6bc8b0b
**Parent Session:** 5b6ef61f-dcea-4a86-a693-8980f6d15fd7

---

## User

Plan the implementation of two features for a Canvas editor built with @xyflow/react v12.10.1:

## Feature 1: Edge Reconnection by Dragging Arrow Tips
Users should be able to click on the tip of an edge arrow and drag it to redirect the edge to another node (or let it float temporarily).

React Flow v12 has built-in support for this via the `reconnectEdge` API:
- Set `onReconnect` callback on `<ReactFlow>` (replaces old `onEdgeUpdate`)
- Set `onReconnectStart` and `onReconnectEnd` callbacks 
- When `onReconnectEnd` fires without a successful reconnection, we can either delete the edge or keep it

The key ReactFlow props needed:
- `onReconnectStart` — optional, for tracking state
- `onReconnect` — called when edge is successfully reconnected to a new target
- `onReconnectEnd` — called when reconnection ends (whether successful or not)

## Feature 2: Edge Toolbar — Invert Direction / Bidirectional
Add two buttons to the existing edge toolbar:
1. **Invert direction** — swap source/target (and handles), swap markerStart/markerEnd
2. **Toggle bidirectional** — add arrow to both ends (markerStart + markerEnd), or remove one if already bidirectional

## Current Architecture

**CanvasEditor.tsx** (`crates/app/src/components/Editor/CanvasEditor.tsx`):
- Uses `<ReactFlow>` with `onConnect`, `onEdgesChange`, `connectionMode="loose"`
- `handleEdgesChange` wraps `onEdgesChange` — pushes snapshot for add/remove, always schedules save
- `onConnect` creates new edges with `markerEnd: "brainmap-arrow"` and `data: { isNew: true }`
- Current imports from @xyflow/react: ReactFlow, Controls, Background, MiniMap, Panel, addEdge, useNodesState, useEdgesState, useReactFlow, ReactFlowProvider, SelectionMode, useNodesInitialized
- Type imports: OnConnect, ColorMode, Viewport, BackgroundVariant
- SVG marker defs defined inline: default "brainmap-arrow" + per-color "brainmap-arrow-{color}"
- `defaultEdgeOptions={{ markerEnd: "brainmap-arrow" }}`
- `edges` and `setEdges` from `useEdgesState([])`
- `pushSnapshot()` for undo support, `scheduleSave()` for debounced auto-save

**canvasNodes.tsx** (`crates/app/src/components/Editor/canvasNodes.tsx`):
- `CanvasEdgeInner` component (lines 877-1163) — custom edge with full toolbar
- Receives EdgeProps: id, sourceX/Y, targetX/Y, sourcePosition, targetPosition, selected, label, markerEnd, markerStart, style, data
- Toolbar buttons (when selected): Edit Label, Delete, Color Picker, Edge Type (bezier/straight/step), Label Format
- `handleColor` updates both `style.stroke` and marker IDs
- `handleClearColor` resets to default markers
- Icon imports from lucide-react already include many icons

**canvasTranslation.ts** (`crates/app/src/components/Editor/canvasTranslation.ts`):
- `JsonCanvasEdge` interface: id, fromNode, toNode, fromSide?, toSide?, fromEnd?, toEnd?, color?, label?, edgeType?, labelFontSize?, labelFontFamily?
- `canvasToFlow`: maps fromEnd/toEnd "arrow"|"none" to markerStart/markerEnd marker IDs; default toEnd is "arrow"
- `flowToCanvas`: detects markers to set fromEnd/toEnd; strips `-target` suffix from targetHandle
- Handle IDs: source = "top"/"right"/"bottom"/"left", target = "top-target"/"right-target" etc.

**Node handles** (canvasNodes.tsx lines 117-130):
- All nodes have 8 handles: 4 source (top/right/bottom/left) + 4 target (top-target/right-target/bottom-target/left-target)

## Requirements
1. Edge reconnection must support undo (pushSnapshot before the change)
2. Edge reconnection must trigger auto-save (scheduleSave)
3. If reconnection fails (dropped on empty canvas), keep the edge as-is (don't delete)
4. Invert: swap source↔target, sourceHandle↔targetHandle, markerStart↔markerEnd
5. Bidirectional: both markerStart and markerEnd should be set; toggling off should remove markerStart
6. Both toolbar buttons need appropriate icons from lucide-react
7. Marker IDs must stay in sync with edge color when swapping

Please provide a detailed implementation plan covering all files that need changes, specific code modifications, and edge cases.

---

## Assistant



I'll explore the codebase to understand the current architecture before designing the implementation plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","offset":877,"limit":300}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.ts"}`

---

## Assistant

Now let me read the relevant parts of CanvasEditor.tsx.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":80}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"onConnect|handleEdgesChange|onEdgesChange|pushSnapshot|scheduleSave|defaultEdgeOptions|markerEnd|onReconnect","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"import.*from.*lucide","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":585,"limit":50}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":1355,"limit":60}`

---

## Assistant

Now let me check the marker definition -- notably the `orient="auto-start-reverse"` attribute which is important for bidirectional arrows.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","offset":1,"limit":15}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"ArrowLeftRight|ArrowRightLeft|Repeat|RefreshCw|Shuffle|SwitchCamera|ArrowUpDown|MoveHorizontal|MoveRight","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Edit`

---

## Assistant

Good. Now I have a thorough understanding of the codebase. Let me also quickly check how the handles are set up on nodes and confirm the handle naming convention.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","offset":117,"limit":20}`

---

## Assistant

I now have everything I need. Here is the detailed implementation plan.

---

## Implementation Plan

### Overview

Two features: (1) edge reconnection by dragging arrow tips, and (2) two new toolbar buttons on the edge toolbar for inverting direction and toggling bidirectional mode. Three files need changes: `CanvasEditor.tsx`, `canvasNodes.tsx`, and `canvasTranslation.ts` (the last only needs verification, not changes).

---

### Feature 1: Edge Reconnection via `onReconnect` API

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx`**

**Step 1 -- Add imports**

Add `OnReconnect` (or inline the type) to the type imports from `@xyflow/react`. In React Flow v12, the callbacks are:
- `onReconnectStart?: (event: MouseEvent, edge: Edge, handleType: 'source' | 'target') => void`
- `onReconnect?: (oldEdge: Edge, newConnection: Connection) => void`
- `onReconnectEnd?: (event: MouseEvent, edge: Edge, handleType: 'source' | 'target') => void`

Add to the existing type import line (line 17):
```ts
import type { OnConnect, OnReconnect, ColorMode, Viewport, BackgroundVariant } from "@xyflow/react";
```

Also import `reconnectEdge` from `@xyflow/react` (the utility function that applies the reconnection to the edges array). Add it to the named imports on line 9:
```ts
addEdge, reconnectEdge,
```

**Step 2 -- Define the three callbacks** (after the `onConnect` callback, around line 619)

```ts
const onReconnectStart = useCallback(() => {
  pushSnapshot();
}, [pushSnapshot]);

const onReconnect: OnReconnect = useCallback(
  (oldEdge, newConnection) => {
    // Carry over all custom properties from the old edge (markers, style, data, label)
    setEdges((eds) =>
      reconnectEdge(oldEdge, newConnection, eds),
    );
    requestAnimationFrame(() => scheduleSave());
  },
  [setEdges, scheduleSave],
);

const onReconnectEnd = useCallback(
  (_event: MouseEvent | TouchEvent, _edge: Edge, _handleType: string) => {
    // Requirement: if reconnection fails (dropped on empty canvas), keep edge as-is.
    // The snapshot was already pushed in onReconnectStart. If onReconnect was NOT
    // called (failed reconnection), the edges haven't changed, so the snapshot
    // just records the prior state redundantly -- harmless.
  },
  [],
);
```

Key design decisions:
- `pushSnapshot()` is called in `onReconnectStart` (not in `onReconnect`) so that if the user reconnects and then undoes, it restores the original edge state.
- If the reconnection fails (dropped on empty canvas), no edge mutation happens. The edge remains as-is, satisfying requirement 3.
- `reconnectEdge` is the official React Flow utility that handles swapping source/target and handles correctly.

**Important edge case**: `reconnectEdge` returns a new edges array where the old edge is replaced with the reconnected version. However, it may not carry over custom properties like `markerEnd`, `markerStart`, `style`, `data`, and `label`. We need to verify this. If `reconnectEdge` strips custom fields, we should instead manually map the edges:

```ts
const onReconnect: OnReconnect = useCallback(
  (oldEdge, newConnection) => {
    setEdges((eds) => {
      // reconnectEdge should preserve all fields on the old edge while
      // updating source/target/sourceHandle/targetHandle from newConnection.
      return reconnectEdge(oldEdge, newConnection, eds);
    });
    requestAnimationFrame(() => scheduleSave());
  },
  [setEdges, scheduleSave],
);
```

If testing reveals that `reconnectEdge` drops custom data, the fallback is a manual map:
```ts
setEdges((eds) =>
  eds.map((e) => {
    if (e.id !== oldEdge.id) return e;
    return {
      ...e,
      source: newConnection.source,
      target: newConnection.target,
      sourceHandle: newConnection.sourceHandle,
      targetHandle: newConnection.targetHandle,
    };
  }),
);
```

**Step 3 -- Wire the callbacks onto `<ReactFlow>`** (around line 1368)

Add these three props after `onConnect={onConnect}`:
```tsx
onReconnectStart={onReconnectStart}
onReconnect={onReconnect}
onReconnectEnd={onReconnectEnd}
```

That is all that is needed for Feature 1. React Flow v12 handles showing the drag handle on arrow tips automatically when `onReconnect` is provided.

---

### Feature 2: Edge Toolbar -- Invert Direction & Toggle Bidirectional

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx`**

**Step 1 -- Add icon imports** (line 8)

Add two icons to the lucide-react import:
- `ArrowRightLeft` -- for "Invert direction" (already referenced in file at line 54 but not imported directly; it is available via `* as LucideIcons` namespace, but for toolbar buttons, direct import is better)
- `ArrowLeftRight` -- for "Toggle bidirectional" (two-headed arrow)

Actually, looking at lucide-react icons more carefully:
- **Invert direction**: `ArrowRightLeft` (two arrows pointing in opposite directions, implying swap)
- **Toggle bidirectional**: `MoveHorizontal` or `ArrowLeftRight` (double-headed arrow)

Add to the import on line 8:
```ts
ArrowRightLeft, MoveHorizontal,
```

**Step 2 -- Add `handleInvert` function** (inside `CanvasEdgeInner`, after `handleClearColor` around line 1007)

```ts
const handleInvert = (e: React.MouseEvent) => {
  e.stopPropagation();
  pushSnapshot();
  setEdges((eds) =>
    eds.map((ed) => {
      if (ed.id !== id) return ed;
      return {
        ...ed,
        source: ed.target,
        target: ed.source,
        sourceHandle: ed.targetHandle
          ? ed.targetHandle.replace(/-target$/, "")
          : ed.sourceHandle,
        targetHandle: ed.sourceHandle
          ? `${ed.sourceHandle}-target`
          : ed.targetHandle,
        markerStart: ed.markerEnd,
        markerEnd: ed.markerStart,
      };
    }),
  );
  scheduleSave();
};
```

Handle ID transformation logic:
- `sourceHandle` is a bare side name like `"right"`. When it becomes a target handle, it needs the `-target` suffix: `"right-target"`.
- `targetHandle` has the `-target` suffix like `"right-target"`. When it becomes a source handle, strip the suffix: `"right"`.
- Marker IDs (e.g., `"brainmap-arrow"` or `"brainmap-arrow-#ff0000"`) are simply swapped between `markerStart` and `markerEnd`. This preserves color because the marker ID encodes the color. Requirement 7 is automatically satisfied.

**Edge case**: If `sourceHandle` or `targetHandle` is `undefined` (no explicit handle), we should keep the swapped values as `undefined` too:

```ts
sourceHandle: ed.targetHandle
  ? ed.targetHandle.replace(/-target$/, "")
  : undefined,
targetHandle: ed.sourceHandle
  ? `${ed.sourceHandle}-target`
  : undefined,
```

**Step 3 -- Add `handleToggleBidirectional` function** (right after `handleInvert`)

```ts
const handleToggleBidirectional = (e: React.MouseEvent) => {
  e.stopPropagation();
  pushSnapshot();
  setEdges((eds) =>
    eds.map((ed) => {
      if (ed.id !== id) return ed;
      const isBidirectional = !!ed.markerStart && !!ed.markerEnd;
      if (isBidirectional) {
        // Toggle OFF: remove markerStart, keep markerEnd (single direction)
        return { ...ed, markerStart: undefined };
      } else {
        // Toggle ON: add arrow to the end that's missing
        // Determine the correct marker ID (must match the edge's color)
        const stroke = (ed.style as Record<string, unknown> | undefined)?.stroke;
        const markerId = typeof stroke === "string"
          ? `brainmap-arrow-${stroke}`
          : "brainmap-arrow";
        return {
          ...ed,
          markerStart: ed.markerStart || markerId,
          markerEnd: ed.markerEnd || markerId,
        };
      }
    }),
  );
  scheduleSave();
};
```

Key design point: When toggling ON bidirectional, we need the marker ID to match the edge's current color. We derive it from `ed.style.stroke` exactly as `handleColor` does (line 978). This satisfies requirement 7.

When toggling OFF, we remove `markerStart` (requirement 5). The edge reverts to a single-direction arrow pointing from source to target.

**Step 4 -- Add toolbar buttons to the JSX** (inside the toolbar div, around line 1113, after the edge type picker and before the label format section)

Insert after the edge-type-picker `div` (line 1113) and before the label format `div` (line 1114):

```tsx
<button
  className="canvas-node-toolbar-btn"
  title="Invert direction"
  onClick={handleInvert}
>
  <ArrowRightLeft size={14} />
</button>
<button
  className={`canvas-node-toolbar-btn${(!!markerStart && !!markerEnd) ? " canvas-node-toolbar-btn--active" : ""}`}
  title="Toggle bidirectional"
  onClick={handleToggleBidirectional}
>
  <MoveHorizontal size={14} />
</button>
```

The bidirectional button uses the `--active` modifier class when both markers are present, giving visual feedback that the edge is currently bidirectional. This matches the pattern used by the edge type buttons (lines 1093, 1100, 1107).

---

### File: `canvasTranslation.ts` -- No Changes Needed

The serialization/deserialization already handles `fromEnd`/`toEnd` and `markerStart`/`markerEnd` correctly:
- `flowToCanvas` (lines 304-311): detects `markerStart` and `markerEnd` and maps them to `fromEnd: "arrow"` and `toEnd: "arrow"`.
- `canvasToFlow` (lines 184-191): maps `fromEnd`/`toEnd` back to `markerStart`/`markerEnd`.

When an edge is inverted or made bidirectional, the React Flow edge properties (`source`, `target`, `sourceHandle`, `targetHandle`, `markerStart`, `markerEnd`) are all that change. The translation layer already round-trips all of these correctly. No modifications needed.

---

### Edge Cases and Considerations

1. **Undo correctness for reconnection**: `pushSnapshot()` in `onReconnectStart` captures state before drag begins. If reconnection succeeds, undo restores the original connection. If it fails, edges are unchanged, so the snapshot is a no-op on undo (slightly wasteful but harmless).

2. **Undo for invert/bidirectional**: Both handlers call `pushSnapshot()` before `setEdges`, matching the existing pattern (see `handleLabelFont` at line 1010).

3. **Handle suffix convention**: Source handles are bare (`"top"`, `"right"`, etc.) and target handles have `-target` suffix (`"top-target"`, `"right-target"`, etc.). The invert handler must transform between these conventions when swapping. This is validated by the `FourHandles` component (lines 117-130) and `flowToCanvas` (line 302).

4. **Edges without explicit handles**: If `sourceHandle` and `targetHandle` are both `undefined`, inversion still works -- it just swaps `source` and `target` node IDs, and both handle fields remain `undefined`. React Flow will auto-pick the closest handles.

5. **Color marker sync**: Both `handleInvert` and `handleToggleBidirectional` preserve color-specific marker IDs. Invert simply swaps existing markers. Bidirectional derives the marker ID from `style.stroke`, matching `handleColor`'s logic.

6. **SVG marker `orient="auto-start-reverse"`**: The markers at lines 1397-1410 already use `orient="auto-start-reverse"`, which means when used as `markerStart`, the arrow automatically renders pointing in the reverse direction. This is exactly what we need for bidirectional edges -- no SVG changes required.

7. **`reconnectEdge` utility**: This is the official React Flow v12 utility. If for any reason it is not exported from `@xyflow/react` v12.10.1, the fallback is a manual edge map as described in Feature 1 Step 2. Check the import at development time.

---

### Summary of Changes by File

| File | Changes |
|------|---------|
| `CanvasEditor.tsx` | Add `reconnectEdge` and `OnReconnect` imports; add 3 callbacks (`onReconnectStart`, `onReconnect`, `onReconnectEnd`); wire them as props on `<ReactFlow>` |
| `canvasNodes.tsx` | Add `ArrowRightLeft`, `MoveHorizontal` icon imports; add `handleInvert` and `handleToggleBidirectional` functions; add 2 toolbar buttons |
| `canvasTranslation.ts` | No changes (already handles all marker/handle serialization) |

### Critical Files for Implementation
- /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx
- /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx
- /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.ts

---

