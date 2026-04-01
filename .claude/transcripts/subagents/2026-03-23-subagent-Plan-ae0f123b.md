# 2026-03-23 — Subagent Transcript: Plan

**Date:** 2026-03-23 10:53:44
**Agent:** Plan
**Agent ID:** ae0f123b8067a55ba
**Parent Session:** ba32d326-fdd5-4aff-835b-e5f32483c3c1

---

## User

Plan fixes for canvas edge/arrow issues in a React Flow (@xyflow/react) canvas implementation. The user reports:
1. Arrows are inaccurate
2. Arrows don't respect direction
3. Edges are hard to click/target

## Current Implementation Analysis

### Files
- `crates/app/src/components/Editor/canvasNodes.tsx` - CanvasEdge component (line 668-877), FourHandles (90-103)
- `crates/app/src/components/Editor/CanvasEditor.tsx` - ReactFlow config, SVG markers (1237-1256), onConnect (538-550)
- `crates/app/src/components/Editor/canvasTranslation.ts` - canvasToFlow (161-188), flowToCanvas (271-303)
- `crates/app/src/App.css` - Edge CSS (4781-4806)
- `crates/app/src/stores/uiStore.ts` - canvasEdgeWidth (default 1), canvasArrowSize (default 25)

### Root Causes Identified

**Issue 1: Arrow marker inconsistency (direction problems)**
- `canvasToFlow()` converts edges from JSON Canvas using `MarkerType.ArrowClosed` (React Flow's built-in marker):
  ```ts
  edge.markerEnd = { type: MarkerType.ArrowClosed };
  ```
- But `defaultEdgeOptions` and `onConnect` use `"brainmap-arrow"` (custom SVG marker ID):
  ```ts
  defaultEdgeOptions={{ markerEnd: "brainmap-arrow" }}
  { ...connection, markerEnd: "brainmap-arrow", data: { isNew: true } }
  ```
- This means edges loaded from file use RF's built-in tiny triangles (which may not match the custom arrow styling), while new edges use the custom SVG markers.
- The custom SVG markers use `orient="auto-start-reverse"` which should be correct, but `MarkerType.ArrowClosed` uses RF's own rendering which may differ.

**FIX**: Make `canvasToFlow` use `"brainmap-arrow"` string IDs consistently instead of `MarkerType.ArrowClosed`.

**Issue 2: Inaccurate arrow positioning**
- The SVG marker has `refX="10" refY="5"` with `viewBox="0 0 10 10"`. The polygon is `points="0,0 10,5 0,10"` (triangle pointing right). With `refX=10`, the tip of the arrow is placed exactly at the path endpoint.
- BUT: React Flow calculates path endpoints at handle centers, not at node borders. The arrow tip renders at the handle position (center of the node edge), which is correct geometrically but the arrow can overlap with the node border/background.
- For large `canvasArrowSize` (default 25px!), the arrow extends far outside the node, making it look "inaccurate."
- `refX=10` means the arrow tip is at the path end. A more reasonable `refX` would account for the stroke to avoid overlap with the node.

**FIX**: Reduce default arrow size and adjust refX slightly so arrows don't visually overshoot.

**Issue 3: Edges hard to click/target**
- Edge stroke-width defaults to 1px (`canvasEdgeWidth` default: 1).
- No `interactionWidth` is set on the BaseEdge component.
- React Flow's `BaseEdge` creates an invisible interaction path, but its default width might be too narrow.

**FIX**: Add `interactionWidth` prop to the BaseEdge (or use `style.strokeWidth` + a transparent wider path), and consider bumping default edge width to 2px.

**Issue 4: No connectionMode="loose"**
- React Flow defaults to `connectionMode="strict"`, which means edges can only connect source handles to target handles of the matching type. Since we have separate source/target handles at each position, this should work, but `"loose"` would give more flexibility.

### Handle system
FourHandles creates 8 handles per node (4 source + 4 target), each at cardinal positions. IDs:
- Source: `top`, `right`, `bottom`, `left`
- Target: `top-target`, `right-target`, `bottom-target`, `left-target`

The canvas JSON spec uses `fromSide`/`toSide` (e.g., "bottom", "top") which map to these handle IDs. This seems correct.

## Plan Request
Design a focused fix plan addressing these three issues. Keep changes minimal - this is a bug fix, not a rewrite. Consider:
1. Consistent marker usage (always use custom SVG markers, not MarkerType.ArrowClosed)
2. Better arrow sizing defaults and refX adjustment
3. Edge interaction width for easier clicking
4. Any CSS changes needed

The codebase uses React 18, TypeScript, @xyflow/react, Zustand stores, and Vitest for testing.

---

## Assistant



I'll explore the relevant files to understand the current implementation details before designing the fix plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","offset":668,"limit":210}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","offset":85,"limit":25}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":1230,"limit":40}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.ts","offset":161,"limit":40}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":530,"limit":30}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":4781,"limit":30}`

---

## Assistant

Now let me check the `flowToCanvas` edge conversion to see how markers are round-tripped, and the `canvasEdgeWidth`/`canvasArrowSize` store defaults.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.ts","offset":271,"limit":40}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"canvasEdgeWidth|canvasArrowSize","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","output_mode":"content","-C":2}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"interactionWidth|interaction-width","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content"}`

---

## Assistant

Let me also check where `--edge-width` CSS variable is set, and how `canvasEdgeWidth` is applied.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"--edge-width","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","-C":2}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"canvasEdgeWidth|canvasArrowSize","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_mode":"content","-C":2}`

---

## Assistant

Now let me check existing tests for these components.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*canvas*test*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*canvasTranslation*"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.test.ts","limit":50}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"edge.*marker|markerEnd|markerStart|arrow","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.test.ts","output_mode":"content","-C":3}`

---

## Assistant

Now I have a complete picture. Let me also quickly check if there's a `connectionMode` prop on the ReactFlow component.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"connectionMode","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_mode":"content"}`

---

## Assistant

I now have all the information needed. Here is the implementation plan.

---

## Fix Plan: Canvas Edge/Arrow Issues

### Problem Summary

Three user-reported issues with canvas edges:

1. **Arrows are inaccurate** -- Arrow heads are oversized (default `canvasArrowSize=25`) and `refX=10` causes visual overshoot at node borders.
2. **Arrows don't respect direction** -- `canvasToFlow()` produces `{ type: MarkerType.ArrowClosed }` (React Flow's built-in markers), but `defaultEdgeOptions` and `onConnect` use `"brainmap-arrow"` (custom SVG marker ID). The two marker systems render differently and RF's built-in markers may not use the custom SVG definitions at all.
3. **Edges are hard to click** -- `canvasEdgeWidth` defaults to 1px and no `interactionWidth` is set on `BaseEdge`, making the clickable target extremely narrow.

### Fix 1: Consistent marker usage in `canvasTranslation.ts`

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.ts` (lines 161-185)

Change `canvasToFlow()` to use string marker IDs instead of `MarkerType.ArrowClosed`:

- Line 174: Replace `edge.markerEnd = { type: MarkerType.ArrowClosed }` with `edge.markerEnd = "brainmap-arrow"`
- Line 177: Replace `edge.markerStart = { type: MarkerType.ArrowClosed }` with `edge.markerStart = "brainmap-arrow"`

When the edge has a color (`ce.color`), use the colored marker variant: `edge.markerEnd = \`brainmap-arrow-${ce.color}\`` (and same for `markerStart`). This matches the pattern already used in the `handleColor`/`handleClearColor` functions in `CanvasEdgeInner` (lines 798-828 of canvasNodes.tsx).

The `MarkerType` import can then be removed from canvasTranslation.ts if unused elsewhere.

**Test update:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.test.ts`

Update the three assertions that currently check for `{ type: "arrowclosed" }`:
- Line 110: `expect(edges[0].markerEnd).toBe("brainmap-arrow")`
- Line 126: `expect(edges[0].markerStart).toBe("brainmap-arrow")`
- Line 171 (round-trip test): Change input `markerEnd: { type: "arrowclosed" }` to `markerEnd: "brainmap-arrow"` and update assertion accordingly.

Add a new test case for colored edges to verify `canvasToFlow` produces `"brainmap-arrow-#ff0000"` when `ce.color` is `"#ff0000"`.

### Fix 2: Arrow sizing and refX adjustment

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`

- Change default `canvasArrowSize` from `25` to `12` (line 621). A 25px arrow head on a 1px edge is disproportionate. 12px is closer to what Obsidian Canvas uses.

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx` (lines 1240-1253)

- Change `refX="10"` to `refX="8"` on both the default and colored marker definitions. This pulls the arrow tip 2 units (20% of viewBox) back from the path endpoint, so it does not overshoot into the node. The path endpoint is at the handle center which sits on the node border, so a small pullback prevents the arrow from overlapping the node interior.

The `viewBox`, polygon points, and `refY` remain unchanged. The `orient="auto-start-reverse"` is correct for bidirectional use.

### Fix 3: Edge interaction width

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx` (line 840)

Add the `interactionWidth` prop to `BaseEdge`:

```tsx
<BaseEdge path={edgePath} markerEnd={markerEnd} markerStart={markerStart} style={style} interactionWidth={20} />
```

This tells React Flow to render an invisible wider path (20px) behind the visible edge for hit detection. This is the standard RF approach -- no extra CSS needed.

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`

- Change default `canvasEdgeWidth` from `1` to `2` (line 622). This is a sensible visual default that also improves clickability. Users who have already set a custom value will keep it (it reads from stored prefs first).

### Fix 4 (minor): Add connectionMode="loose"

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx`

Add `connectionMode="loose"` to the `<ReactFlow>` component props (around line 1220). This allows edges to connect between any handle types, which improves usability when dragging connections. Without it, a source handle can only connect to a target handle, and since handles are stacked at the same position (source and target at each cardinal direction), the strict mode can cause missed connections.

### Changes NOT needed

- No CSS changes needed beyond what the `interactionWidth` prop handles internally.
- No changes to `FourHandles` -- the 8-handle system is correct.
- No changes to `flowToCanvas()` -- it already handles both string and object marker formats (lines 282-288), so the round-trip will work with the new string format.

### Sequencing

1. Fix `canvasTranslation.ts` markers (Fix 1) -- this is the root cause of direction issues
2. Update tests in `canvasTranslation.test.ts`
3. Adjust defaults and `refX` (Fixes 2)
4. Add `interactionWidth` to `BaseEdge` (Fix 3)
5. Add `connectionMode="loose"` (Fix 4)
6. Run `npx vitest run` to verify tests pass
7. Manual verification with a canvas file that has edges

### Risk Assessment

- **Low risk**: All changes are localized. The marker format change (string vs object) is already handled by `flowToCanvas()` for round-tripping.
- **Backward compatibility**: Existing `.canvas` files re-parse through `canvasToFlow()` on load, so they will immediately get the correct markers.
- **User preference migration**: Users who already stored `canvasArrowSize=25` or `canvasEdgeWidth=1` in localStorage will keep those values. Only new users or users who never changed the setting get the new defaults. Consider whether this is acceptable or if a one-time migration is needed (likely acceptable as-is since few users would have explicitly chosen these values).

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.ts` - Core fix: replace `MarkerType.ArrowClosed` with `"brainmap-arrow"` string markers
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx` - Add `interactionWidth={20}` to BaseEdge component (line 840)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx` - Adjust marker `refX`, add `connectionMode="loose"`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts` - Change defaults: `canvasArrowSize` 25->12, `canvasEdgeWidth` 1->2
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.test.ts` - Update marker assertions to match new string format

---

