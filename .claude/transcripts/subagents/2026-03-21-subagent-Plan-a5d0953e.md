# 2026-03-21 — Subagent Transcript: Plan

**Date:** 2026-03-21 14:56:53
**Agent:** Plan
**Agent ID:** a5d0953ed363dc519
**Parent Session:** 11c1a48b-899d-4389-93d3-e5594d5d1828

---

## User

Design an implementation plan for making canvas nodes auto-expand their height when text content overflows, instead of clipping.

## Current state:
- `canvasTranslation.ts` `canvasToFlow()` sets `style: { width: cn.width, height: cn.height }` for all nodes (line 122)
- `flowToCanvas()` reads: `style.width ?? measured.width ?? 250` and `style.height ?? measured.height ?? 100`
- CSS `.canvas-text-node`, `.canvas-file-node`, `.canvas-link-node` all have `width: 100%; height: 100%; box-sizing: border-box`
- React Flow's `measured` property auto-populates from DOM dimensions when `style.height` is not set
- NodeResizer sets `style.width` and `style.height` when user manually resizes
- Circle and diamond shapes use `overflow: hidden` and clip-path, so auto-height doesn't apply well to them
- Group nodes are containers with fixed dimensions; auto-height doesn't apply

## Requirements:
- Text nodes should auto-expand height to fit content (no text clipping)
- File nodes should auto-expand similarly
- Link nodes are simple enough that they rarely overflow, but should be consistent
- Circle and diamond shapes should keep fixed aspect ratio (no auto-height)
- Group nodes keep fixed dimensions
- Manual resize should still work (user can make nodes bigger)
- The stored height in the canvas JSON should reflect the actual rendered height
- On reload, nodes should maintain at least their saved height (so intentionally tall nodes don't shrink)

## Proposed approach:
1. In `canvasToFlow()`: For text (non-circle/diamond), file, and link nodes, use `style: { width: cn.width, minHeight: cn.height }` instead of `height`
2. In CSS: Change `height: 100%` to `min-height: 100%` for `.canvas-text-node`, `.canvas-file-node`, `.canvas-link-node`
3. In `flowToCanvas()`: Read height as `measured.height ?? style.minHeight ?? style.height ?? 100`
4. Handle NodeResizer: After resize, convert `style.height` to `style.minHeight` so auto-expansion still works

Consider edge cases:
- NodeResizer behavior with minHeight vs height
- Shapes that need fixed dimensions (circle, diamond)
- The save/load cycle preserving correct heights
- Text editing: when user edits text, node should expand/shrink

Return a detailed implementation plan with specific code changes.

---

## Assistant



I'll explore the codebase to understand the current implementation before designing the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx"}`

---

## Assistant

Now let me look at the CSS and the CanvasEditor to understand NodeResizer behavior and the `onNodesChange` handler.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"canvas-text-node|canvas-file-node|canvas-link-node","glob":"*.css","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":80,"limit":120}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.canvas-text-node|\\.canvas-file-node|\\.canvas-link-node","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-n":true,"-A":5}`

---

## Assistant

Let me read the full CSS rules for these node types and check the resize/drag handling in CanvasEditor.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":5090,"limit":20}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":5029,"limit":12}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":5295,"limit":15}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":200,"limit":100}`

---

## Assistant

Now let me check the undo/redo handling and how `onNodeResize` is used, plus the `onNodesChange` wrapper.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":300,"limit":150}`

---

## Assistant

Now let me check how the `NodeResizer` interacts with style properties -- specifically what changes it applies to `style.width`/`style.height`.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"onResize|onResizeStart|onResizeEnd|NodeResizer","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"overflow","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-n":true,"-B":1,"-A":1,"glob":"*.css"}`

---

## Assistant

Let me check the circle/diamond overflow hidden CSS, and look at how the React Flow `NodeResizer` sets dimensions (it writes to `style.width`/`style.height` by default).

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":5141,"limit":25}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":5283,"limit":15}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasShapes.ts"}`

---

## Assistant

Now I have a thorough understanding of the codebase. Let me also check one key detail -- how React Flow's `NodeResizer` component sets dimensions, since the proposed plan hinges on understanding what properties it writes.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"dimensions|style\\.height|style\\.width","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_mode":"content","-n":true}`

---

## Assistant

I now have a complete picture. Here is the detailed implementation plan.

---

## Implementation Plan: Canvas Node Auto-Height Expansion

### Problem

Canvas text, file, and link nodes have `style: { width, height }` set as fixed values. When text content exceeds the node dimensions, it clips rather than expanding. React Flow's `NodeResizer` writes to `style.width` and `style.height` during resize, and React Flow measures the DOM via `node.measured` only when `style.height` is **not** set. The fix requires switching from fixed `height` to `minHeight` for content-driven nodes, while keeping fixed dimensions for circle, diamond, and group nodes.

### Key Insight About React Flow's Behavior

React Flow's `NodeResizer` component applies resized dimensions by updating `style.width` and `style.height` on the node. When `style.height` is present, React Flow uses that value; when absent, it measures the DOM element and populates `node.measured.height`. The strategy is:

1. **On load**: Set `minHeight` instead of `height` so React Flow measures the actual DOM height.
2. **After resize**: The NodeResizer will write `style.height`, which constrains the node. We need to convert that back to `minHeight` after resize ends.
3. **On save**: Read `measured.height` (which reflects actual DOM size) and save that as the canonical height.

### Step-by-Step Changes

#### Step 1: `canvasTranslation.ts` -- `canvasToFlow()` (line 117-126)

**What**: For text (non-circle, non-diamond), file, and link nodes, set `minHeight` instead of `height` in the style object. Circle and diamond text nodes and group nodes keep fixed `height`.

**Change at line 122**: Replace the single style assignment with conditional logic:

```typescript
// Determine if this node type should auto-expand height
const isAutoHeight =
  cn.type !== "group" &&
  !(cn.type === "text" && (cn.shape === "circle" || cn.shape === "diamond"));

return {
  id: cn.id,
  type: rfType,
  position: { x: cn.x, y: cn.y },
  data,
  style: isAutoHeight
    ? { width: cn.width, minHeight: cn.height }
    : { width: cn.width, height: cn.height },
  ...(cn.type === "group" ? { zIndex: -1 } : {}),
};
```

This ensures:
- Rectangle, rounded, sticky, callout text nodes use `minHeight` (auto-expand)
- Circle and diamond text nodes use `height` (fixed aspect)
- File and link nodes use `minHeight` (auto-expand)
- Group nodes use `height` (fixed container)

#### Step 2: `canvasTranslation.ts` -- `flowToCanvas()` (lines 170-179)

**What**: Update the height reading to check `minHeight` as well, and prefer `measured.height` when available (since that reflects actual DOM size after auto-expansion).

```typescript
width: Math.round(
  (typeof style.width === "number" ? style.width : null) ??
  measured.width ??
  250,
),
height: Math.round(
  Math.max(
    measured.height ?? 0,
    (typeof style.minHeight === "number" ? style.minHeight : null) ??
    (typeof style.height === "number" ? style.height : null) ??
    100,
  ),
),
```

The `Math.max` ensures that:
- If content expanded the node beyond `minHeight`, we save the actual measured height.
- If the user manually resized the node taller, that value persists.
- On reload, the saved height becomes the new `minHeight`, so intentionally tall nodes don't shrink.

#### Step 3: CSS changes in `App.css`

**What**: Change `height: 100%` to `min-height: 100%` for the three auto-expanding node classes, so the inner content div can push the node taller than the React Flow wrapper's `minHeight`.

**Line 5096** (`.canvas-text-node`):
```css
.canvas-text-node {
  /* ... existing properties ... */
  width: 100%;
  min-height: 100%;  /* was: height: 100% */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}
```

**Line 5036** (`.canvas-file-node`):
```css
.canvas-file-node {
  /* ... existing properties ... */
  width: 100%;
  min-height: 100%;  /* was: height: 100% */
  box-sizing: border-box;
}
```

**Line 5301** (`.canvas-link-node`):
```css
.canvas-link-node {
  /* ... existing properties ... */
  width: 100%;
  min-height: 100%;  /* was: height: 100% */
  box-sizing: border-box;
}
```

**Keep `height: 100%` for circle and diamond** by adding override rules:
```css
.canvas-text-node[data-shape="circle"],
.canvas-text-node[data-shape="diamond"] {
  height: 100%;
  min-height: unset;
}
```

This is needed because these shapes already have `overflow: hidden` / `clip-path` and should not expand.

#### Step 4: `canvasNodes.tsx` -- Handle NodeResizer converting `height` back to `minHeight`

**What**: React Flow's `NodeResizer` writes `style.height` during and after resize. For auto-height nodes, we need to convert that to `minHeight` once resize ends, so auto-expansion continues to work.

**Approach**: Add an `onResizeEnd` callback to the `Resizer` component for auto-height node types. This callback will:
1. Read the node's current `style.height`
2. Set `style.minHeight` to that value
3. Delete `style.height`

**In `canvasNodes.tsx`**, modify the `Resizer` component (line 314-324):

```typescript
function Resizer({ selected, minWidth = 120, minHeight = 40, autoHeight = false }: {
  selected: boolean; minWidth?: number; minHeight?: number; autoHeight?: boolean;
}) {
  const { setNodes } = useReactFlow();

  const handleResizeEnd = useCallback((_event: unknown, params: { id: string }) => {
    if (!autoHeight) return;
    setNodes((nds) => nds.map((n) => {
      if (n.id !== params.id) return n;
      const style = (n.style ?? {}) as Record<string, unknown>;
      if (typeof style.height !== "number") return n;
      const { height, ...rest } = style;
      return { ...n, style: { ...rest, minHeight: height } };
    }));
  }, [autoHeight, setNodes]);

  return (
    <NodeResizer
      isVisible={selected}
      minWidth={minWidth}
      minHeight={minHeight}
      lineClassName="canvas-resize-line"
      handleClassName="canvas-resize-handle"
      onResizeEnd={autoHeight ? handleResizeEnd : undefined}
    />
  );
}
```

**Note on `onResizeEnd` signature**: React Flow's `NodeResizer` `onResizeEnd` callback receives `(event, params)` where `params` includes the node `id`. However, we need to verify the exact API. If `params` does not include `id`, we can pass `id` as a prop to `Resizer` instead. Let me check.

Actually, looking at the React Flow docs more carefully, `NodeResizer`'s `onResizeEnd` does not pass the node ID -- it's inherently scoped to the node it's rendered in. We should pass the `id` prop through to `Resizer`:

```typescript
function Resizer({ id, selected, minWidth = 120, minHeight = 40, autoHeight = false }: {
  id: string; selected: boolean; minWidth?: number; minHeight?: number; autoHeight?: boolean;
}) {
  const { setNodes } = useReactFlow();

  const handleResizeEnd = useCallback(() => {
    if (!autoHeight) return;
    setNodes((nds) => nds.map((n) => {
      if (n.id !== id) return n;
      const style = (n.style ?? {}) as Record<string, unknown>;
      if (typeof style.height !== "number") return n;
      const { height, ...rest } = style;
      return { ...n, style: { ...rest, minHeight: height } };
    }));
  }, [id, autoHeight, setNodes]);

  return (
    <NodeResizer
      isVisible={selected}
      minWidth={minWidth}
      minHeight={minHeight}
      lineClassName="canvas-resize-line"
      handleClassName="canvas-resize-handle"
      onResizeEnd={autoHeight ? handleResizeEnd : undefined}
    />
  );
}
```

Then update all call sites to pass `id` and `autoHeight`:

- **`CanvasTextNodeInner`** (line 462): `<Resizer id={id} selected={selected} autoHeight={!isFixedShape} />` where `isFixedShape = shape === "circle" || shape === "diamond"`.
- **`CanvasFileNodeInner`** (line 361): `<Resizer id={id} selected={selected} minWidth={150} minHeight={50} autoHeight />`.
- **`CanvasLinkNodeInner`** (line 504): `<Resizer id={id} selected={selected} autoHeight />`.
- **`CanvasGroupNodeInner`** (line 563): `<Resizer id={id} selected={selected} minWidth={200} minHeight={150} />` (no `autoHeight`).

#### Step 5: `canvasNodes.tsx` -- Text node body CSS for auto-expansion

**What**: The `.canvas-text-node-body` uses `flex: 1` which causes it to fill available space but not push the container. When there is no fixed `height`, this works fine. But with vertical centering (`align-items: center`), the body might not expand the parent.

Change `.canvas-text-node-body` CSS:
```css
.canvas-text-node-body {
  flex: 1;
  display: flex;
  flex-direction: column;   /* add this for text wrapping */
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: var(--text-primary);
  word-break: break-word;
  width: 100%;              /* ensure text wraps within node width */
}
```

The `word-break: break-word` ensures long words wrap rather than overflow horizontally.

#### Step 6: Text editing expansion

**What**: The existing text editing textarea already auto-sizes (lines 421-427 in `canvasNodes.tsx`):
```typescript
useEffect(() => {
  if (editing && textareaRef.current) {
    const ta = textareaRef.current;
    ta.style.height = "0";
    ta.style.height = ta.scrollHeight + "px";
  }
}, [editing, editValue]);
```

This works because the textarea grows within the flex container, and with `min-height` instead of `height`, the node wrapper will expand with it. No change needed here.

After `commitEdit` updates `data.text`, the non-editing body will render the new text, and since the CSS is `min-height` based, the node will auto-size to fit.

### Edge Cases

1. **Shape changes**: When a user changes a text node from rectangle to circle/diamond, the node should switch from `minHeight` to fixed `height`. The shape change handler in `CanvasNodeToolbar.setNodeData` updates `data.shape`. We need to also update `style` when shape changes to/from fixed shapes. Add logic in the shape change handler:

   In `CanvasNodeToolbar`, after `setNodeData({ shape: s.id })`, also update the node's style:
   ```typescript
   const isFixed = s.id === "circle" || s.id === "diamond";
   setNodes((nds) => nds.map((n) => {
     if (n.id !== id) return n;
     const style = (n.style ?? {}) as Record<string, unknown>;
     if (isFixed && style.minHeight !== undefined) {
       const { minHeight, ...rest } = style;
       return { ...n, data: { ...n.data, shape: s.id }, style: { ...rest, height: minHeight } };
     }
     if (!isFixed && style.height !== undefined) {
       const { height, ...rest } = style;
       return { ...n, data: { ...n.data, shape: s.id }, style: { ...rest, minHeight: height } };
     }
     return { ...n, data: { ...n.data, shape: s.id } };
   }));
   ```
   This replaces the current two-step `setNodeData` + separate `setNodes` with a single atomic update.

2. **Undo/redo**: The undo stack serializes full node state including `style`. Since we changed `style.height` to `style.minHeight`, undone snapshots from before the change might have `style.height`. The `flowToCanvas()` already handles both `style.minHeight` and `style.height`, so this is safe for saving. For display, old snapshots with `style.height` will render with fixed height (the pre-change behavior), which is acceptable during undo.

3. **New nodes from toolbar/context menu**: Nodes created via the bottom toolbar or context menu need to use `minHeight` too. Check wherever new nodes are created in `CanvasEditor.tsx`.

Let me verify this.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"style:\\s*\\{.*width.*height\"","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"style:.*width.*height","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":575,"limit":130}`

---

## Assistant

Good. Now I can see all the places where new nodes are created. Let me also check how the shape-based text nodes and context menu items call `addNodeAtMenu`/`addNodeAtCenter`.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"addNodeAt(Menu|Center)\"","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"addNodeAt(Menu|Center)\\(\"","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_mode":"content","-n":true}`

---

## Assistant

Now I have the full picture. Here is the complete implementation plan.

---

## Implementation Plan: Canvas Node Auto-Height Expansion

### Overview

Four files need changes. The core idea: replace fixed `style.height` with `style.minHeight` for content-driven node types (text rectangles, rounded, sticky, callout, file, link), while keeping fixed `height` for circle, diamond, and group nodes. React Flow will then measure the actual DOM height via `node.measured`, allowing nodes to expand when content overflows.

### File 1: `crates/app/src/components/Editor/canvasTranslation.ts`

**A) `canvasToFlow()` -- lines 117-126**

Replace the single style assignment with conditional logic. A helper function determines whether a node should auto-expand:

```typescript
// Before line 117, add helper:
const isFixedHeight =
  cn.type === "group" ||
  (cn.type === "text" && (cn.shape === "circle" || cn.shape === "diamond"));

// Replace line 122:
style: isFixedHeight
  ? { width: cn.width, height: cn.height }
  : { width: cn.width, minHeight: cn.height },
```

This applies to every node in the `canvasToFlow` mapping. File and link nodes always get `minHeight`. Text nodes get `minHeight` except for circle and diamond shapes.

**B) `flowToCanvas()` -- lines 170-179**

Update the height computation to read `minHeight` and prefer `measured.height`:

```typescript
height: Math.round(
  Math.max(
    measured.height ?? 0,
    (typeof style.minHeight === "number" ? style.minHeight : null) ??
    (typeof style.height === "number" ? style.height : null) ??
    100,
  ),
),
```

`Math.max` ensures saved height reflects the larger of: actual rendered height (from `measured`) or the explicit min/fixed height. This means auto-expanded nodes save their true rendered height, and on reload that becomes the new `minHeight` floor.

### File 2: `crates/app/src/App.css`

**A) Lines 5096, 5036, 5301** -- Change `height: 100%` to `min-height: 100%` for the three content node classes:

- `.canvas-text-node` (line 5096): `height: 100%` becomes `min-height: 100%`
- `.canvas-file-node` (line 5036): `height: 100%` becomes `min-height: 100%`
- `.canvas-link-node` (line 5301): `height: 100%` becomes `min-height: 100%`

**B) Add override rules after the diamond rule (after line 5293)** to force fixed height on circle and diamond:

```css
.canvas-text-node[data-shape="circle"],
.canvas-text-node[data-shape="diamond"] {
  height: 100%;
  min-height: unset;
}
```

**C) `.canvas-text-node-body` (line 5103)** -- Add `word-break: break-word` and `width: 100%` to ensure text wraps within the node width rather than overflowing horizontally:

```css
.canvas-text-node-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: var(--text-primary);
  word-break: break-word;
  width: 100%;
}
```

### File 3: `crates/app/src/components/Editor/canvasNodes.tsx`

**A) `Resizer` component (lines 314-324)** -- Add `id` and `autoHeight` props. When `autoHeight` is true, add an `onResizeEnd` handler that converts `style.height` (written by NodeResizer during resize) back to `style.minHeight`:

```typescript
function Resizer({ id, selected, minWidth = 120, minHeight = 40, autoHeight = false }: {
  id: string; selected: boolean; minWidth?: number; minHeight?: number; autoHeight?: boolean;
}) {
  const { setNodes } = useReactFlow();

  const handleResizeEnd = useCallback(() => {
    setNodes((nds) => nds.map((n) => {
      if (n.id !== id) return n;
      const style = (n.style ?? {}) as Record<string, unknown>;
      if (typeof style.height !== "number") return n;
      const { height, ...rest } = style;
      return { ...n, style: { ...rest, minHeight: height } };
    }));
  }, [id, setNodes]);

  return (
    <NodeResizer
      isVisible={selected}
      minWidth={minWidth}
      minHeight={minHeight}
      lineClassName="canvas-resize-line"
      handleClassName="canvas-resize-handle"
      onResizeEnd={autoHeight ? handleResizeEnd : undefined}
    />
  );
}
```

**B) Update all `Resizer` call sites** to pass `id` and `autoHeight`:

- **`CanvasTextNodeInner`** (line 462): Compute `isFixedShape`:
  ```typescript
  const isFixedShape = (d.shape || "rectangle") === "circle" || (d.shape || "rectangle") === "diamond";
  ```
  Then: `<Resizer id={id} selected={selected} autoHeight={!isFixedShape} />`

- **`CanvasFileNodeInner`** (line 361): `<Resizer id={id} selected={selected} minWidth={150} minHeight={50} autoHeight />`

- **`CanvasLinkNodeInner`** (line 504): `<Resizer id={id} selected={selected} autoHeight />`

- **`CanvasGroupNodeInner`** (line 563): `<Resizer id={id} selected={selected} minWidth={200} minHeight={150} />` (no `autoHeight`, groups stay fixed)

**C) Shape change in `CanvasNodeToolbar`** (line 221-222) -- When changing shape to/from circle/diamond, swap `style.height` and `style.minHeight`. Replace the current `setNodeData({ shape: s.id })` with:

```typescript
onClick={() => {
  const isFixed = s.id === "circle" || s.id === "diamond";
  setNodes((nds) => nds.map((n) => {
    if (n.id !== id) return n;
    const style = (n.style ?? {}) as Record<string, unknown>;
    const newData = { ...n.data, shape: s.id };
    if (isFixed && typeof style.minHeight === "number") {
      const { minHeight: mh, ...rest } = style;
      return { ...n, data: newData, style: { ...rest, height: mh } };
    }
    if (!isFixed && typeof style.height === "number") {
      const { height: h, ...rest } = style;
      return { ...n, data: newData, style: { ...rest, minHeight: h } };
    }
    return { ...n, data: newData };
  }));
  setShowShapes(false);
}}
```

### File 4: `crates/app/src/components/Editor/CanvasEditor.tsx`

**A) `addNodeAtMenu` and `addNodeAtCenter` (lines 614 and 652)** -- Change these functions to use `minHeight` instead of `height` for non-group, non-circle/diamond nodes:

Update the `style` object in both functions. Since these are generic, the cleanest approach is to add a helper and modify the style after creation. However, both functions currently receive `(type, data, width, height)`. The simplest change: replace the style line in both:

```typescript
// In addNodeAtMenu (line 625) and addNodeAtCenter (line 668):
style: type === "canvasGroup" ||
       (type === "canvasText" && (data.shape === "circle" || data.shape === "diamond"))
  ? { width, height }
  : { width, minHeight: height },
```

**B) `createNoteForCanvas` (line 694)** -- Change:
```typescript
style: { width: 250, minHeight: 100 }
```

**C) Group creation (line 585)** -- This creates a group node, so it stays as `{ width: ..., height: ... }`. No change needed.

### Edge Cases Summary

| Scenario | Behavior |
|---|---|
| Text node with long content | Node expands vertically; saved height reflects actual rendered height |
| Circle/diamond shape | Fixed `height`, `overflow: hidden` / `clip-path` -- no expansion |
| Group node | Fixed `height` -- no expansion |
| Manual resize then more text | `onResizeEnd` converts `height` back to `minHeight`; node can still expand beyond resized height |
| Shape change rect -> circle | `minHeight` swapped to `height` |
| Shape change circle -> rect | `height` swapped to `minHeight` |
| Undo to pre-change snapshot | Old snapshots with `style.height` render fixed (acceptable); saves still work via `flowToCanvas` fallback |
| Text edit makes content shorter | Node height stays at `minHeight` floor (saved height); does not shrink below original |
| Reload after auto-expansion | Saved height becomes new `minHeight` floor -- intentionally tall nodes don't shrink |

### One Open Question: Should nodes shrink when text is deleted?

The current plan says `minHeight` is set to the saved height, meaning a node that auto-expanded will **not** shrink below its saved height on reload. But during the same editing session, if a user deletes text, the DOM will shrink and `measured.height` will decrease, but `minHeight` keeps the floor. This is the desired behavior per requirements ("nodes should maintain at least their saved height"). During a live session, the node **will** shrink visually because the CSS `min-height` only sets the floor -- the content simply becomes smaller within the min-height container. The next save captures the `measured.height` (which could be smaller than `minHeight` if content was deleted, but `Math.max` in `flowToCanvas` ensures we save at least `minHeight`).

If you want nodes to shrink dynamically during editing (not just on save), you would need to omit the `Math.max` and let `measured.height` be the canonical value. This is a design choice -- the current plan preserves the "don't shrink below saved height" requirement.

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.ts` - Core translation layer: switch from `height` to `minHeight` in `canvasToFlow`; update `flowToCanvas` height reading
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` - CSS changes: `min-height: 100%` for content nodes; circle/diamond override
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx` - Resizer `onResizeEnd` handler; shape change style swap; `autoHeight` prop
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx` - Node creation functions: use `minHeight` in `addNodeAtMenu`, `addNodeAtCenter`, `createNoteForCanvas`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasShapes.ts` - Reference only: shape IDs and defaults (no changes needed)

---

