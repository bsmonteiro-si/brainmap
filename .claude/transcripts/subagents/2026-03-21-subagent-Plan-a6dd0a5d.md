# 2026-03-21 — Subagent Transcript: Plan

**Date:** 2026-03-21 21:46:12
**Agent:** Plan
**Agent ID:** a6dd0a5d3acfd79eb
**Parent Session:** cca9a9ac-8dbd-4f51-9584-189afa46458f

---

## User

## Task
Fix mouse position mismatch when interacting with canvas nodes (selecting, resizing, dragging) caused by the global CSS `document.documentElement.style.zoom` applied in App.tsx.

## Background
The app has a global UI zoom feature (`uiZoom` in uiStore) applied via `document.documentElement.style.zoom`. This breaks React Flow's coordinate calculations because React Flow uses `getBoundingClientRect()` internally, which returns CSS-zoom-scaled values, while mouse events report unscaled coordinates. This causes:
- Selection boxes appearing offset from nodes
- Mouse cursor not adapting correctly during interaction
- Resize handles not responding at their visual position

The MarkdownEditor already solves a similar problem for CodeMirror by patching `offsetWidth`/`offsetHeight` (see `patchCMScaleDetection` in MarkdownEditor.tsx:79-94).

## React Flow's solution
React Flow v12+ supports a `style={{ zoom: cssZoom }}` or a `containerStyle` that can compensate. But the real fix is to either:

1. **Counter-scale the React Flow container**: Apply `zoom: 1/uiZoom` to the canvas container div so it cancels out the global zoom, then scale it back up with CSS `transform: scale(uiZoom)` and `transformOrigin: top left` — but this gets complex.

2. **Use React Flow's built-in `style` prop**: Set `style={{ zoom: 1/uiZoom }}` on the container wrapping ReactFlow so that the effective zoom on the flow container is 1.

3. **Apply counter-zoom to the canvas container**: The simplest approach — set `zoom: ${1/uiZoom}` and adjust width/height to `${uiZoom * 100}%` on the `.canvas-container` div so React Flow sees an unscaled coordinate system.

Also fix the cursor CSS: `.canvas-file-node` has `cursor: default` which overrides React Flow's `cursor: grab` for draggable nodes.

## Files involved
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx` — the ReactFlow wrapper, line 837 container div
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` — cursor override on line 5034
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts` — source of `uiZoom`

## Current ReactFlow setup (CanvasEditor.tsx:836-858)
```tsx
<div className={containerClass} style={shapeVars}>
  <ReactFlow ...props>
```

## Current CSS (App.css:5025-5035)
```css
.canvas-file-node {
  ...
  cursor: default;  /* line 5034 - overrides React Flow grab cursor */
}
```

## Questions to address
1. What is the best approach to counter the CSS zoom for React Flow specifically?
2. Should we use container-level counter-zoom or React Flow props?
3. How to handle the container sizing when counter-zooming?

Please provide a detailed implementation plan.

---

## Assistant



I'll explore the relevant files to understand the current implementation before designing the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":820,"limit":60}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","limit":50}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cursor:\\s*default","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-n":true,"-C":3}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"uiZoom","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","output_mode":"content","-n":true,"-C":2}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"patchCMScaleDetection|document\\.documentElement\\.style\\.zoom","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","-n":true,"-C":3}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":5020,"limit":30}`

---

## Assistant

Now let me check how the global zoom is applied and the canvas container class.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"document\\.documentElement\\.style\\.zoom","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","-n":true,"-C":3}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"containerClass","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_mode":"content","-n":true,"-C":2}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"canvas-container","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-n":true,"-C":5}`

---

## Assistant

Let me check where the global zoom is actually applied.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"style\\.zoom|documentElement.*zoom","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","-n":true,"-C":3}`

---

## Assistant

Good -- now I have the full picture. Let me also quickly check how the CanvasEditor imports/uses uiZoom currently, and the full list of canvas node cursor styles.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"uiZoom|useUIStore","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_mode":"content","-n":true,"-C":1}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"canvas-.*node.*\\{","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-n":true,"head_limit":20}`

---

## Assistant

Now let me check for cursor styles on other canvas node types too.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.canvas-(text|link|group)-node\\s*\\{","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-n":true,"-C":15}`

---

## Assistant

I have all the information needed. Here is the implementation plan.

---

## Implementation Plan: Fix Canvas Mouse Position Mismatch Under CSS Zoom

### Problem

The app applies `document.documentElement.style.zoom = uiZoom` globally (in `App.tsx` line 387). React Flow internally uses `getBoundingClientRect()` which returns CSS-zoom-scaled coordinates, while mouse event `clientX`/`clientY` values are unscaled in some browsers. This causes selection boxes, drag, and resize handles to be offset from their visual positions when `uiZoom !== 1`.

A secondary issue: `.canvas-file-node` sets `cursor: default` (App.css line 5034), overriding React Flow's `cursor: grab` for draggable nodes.

### Chosen Approach: Container Counter-Zoom

Apply a counter-zoom on the `.canvas-container` div so that React Flow operates in an effective zoom=1 coordinate space. Then scale the container dimensions up to compensate for the visual shrink. This is the simplest approach that doesn't require patching React Flow internals.

The key insight: if `documentElement` has `zoom: Z`, and the canvas container has `zoom: 1/Z`, the effective zoom on the React Flow content is `Z * (1/Z) = 1`. React Flow's coordinate math works correctly because `getBoundingClientRect()` and mouse events are in the same coordinate space within the container.

To prevent the container from visually shrinking (since `zoom: 1/Z` with `Z > 1` makes it smaller), set `width` and `height` to `${Z * 100}%`.

### Step-by-Step Changes

#### 1. CanvasEditor.tsx -- Add counter-zoom style to container div

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx`

**What to change**: 
- Subscribe to `uiZoom` from `useUIStore` (add to the existing list of useUIStore selectors around line 107-126).
- On the container `<div>` at line 837, merge a counter-zoom inline style.

Add at ~line 107 with the other `useUIStore` selectors:
```tsx
const uiZoom = useUIStore((s) => s.uiZoom);
```

Compute the counter-zoom style (could be a `useMemo` or inline):
```tsx
const counterZoomStyle: React.CSSProperties = uiZoom !== 1
  ? { zoom: 1 / uiZoom, width: `${uiZoom * 100}%`, height: `${uiZoom * 100}%` }
  : {};
```

Update the container div at line 837 to merge both `shapeVars` and `counterZoomStyle`:
```tsx
<div className={containerClass} style={{ ...shapeVars, ...counterZoomStyle }}>
```

Do the same for the loading and error container divs at lines 809 and 817 (for visual consistency, though these are less critical).

#### 2. App.css -- Fix cursor override on canvas-file-node

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

**What to change**: Line 5034, change `cursor: default` to `cursor: grab` (or remove the `cursor` declaration entirely so React Flow's default `cursor: grab` takes effect).

```css
.canvas-file-node {
  /* ... existing styles ... */
  cursor: grab;  /* was: cursor: default — let React Flow control drag cursor */
}
```

Optionally add an active state for the "grabbing" feedback:
```css
.canvas-file-node:active {
  cursor: grabbing;
}
```

Note: `.canvas-text-node`, `.canvas-link-node`, and `.canvas-group-node` do NOT have a `cursor: default` declaration, so they already inherit React Flow's cursor correctly. Only `.canvas-file-node` needs this fix.

#### 3. Verification

- Test at zoom levels 0.5, 0.8, 1.0, 1.2, 1.5, 2.0
- For each zoom level verify:
  - Node selection highlight aligns with the visual node position
  - Dragging a node follows the mouse cursor precisely
  - Resize handles respond at their visual position (all edges/corners)
  - Selection rectangle (lasso) starts and tracks with the mouse
  - Edge connection handles are clickable at their visual position
  - Context menu appears at the correct mouse position
- Verify cursor shows `grab` on file nodes and `grabbing` while dragging

### Why This Approach

1. **Container counter-zoom** is the simplest and most reliable fix. It creates an isolated coordinate space where React Flow's internal math (which assumes no CSS zoom) works correctly.

2. **Alternative: React Flow `style` prop** -- React Flow does not have a built-in zoom compensation prop. The `style` prop on `<ReactFlow>` is just passed to the wrapper div; it doesn't adjust internal coordinate calculations.

3. **Alternative: Patching getBoundingClientRect** (like the CodeMirror fix) -- This would be fragile because React Flow has many internal elements that call `getBoundingClientRect()`, not just one root `dom` element. The container counter-zoom approach is strictly better.

4. The `width`/`height` scaling (`uiZoom * 100%`) ensures the canvas fills its parent container despite the counter-zoom shrinking it. Since the parent has `width: 100%; height: 100%`, and the counter-zoomed child has `width: Z*100%; height: Z*100%`, the visual size remains `100%` of the parent (because `Z * 100% * (1/Z) = 100%` in visual terms).

### Edge Cases

- **uiZoom = 1**: The `counterZoomStyle` is empty, so there is zero overhead. No style changes applied.
- **Rapid zoom changes**: The `uiZoom` subscription is reactive; the style updates on every zoom change. React Flow will re-render its internal viewport correctly since the container dimensions change.
- **Context menus**: Canvas context menus are positioned using `event.clientX`/`event.clientY` from React Flow's callbacks. These should be correct because the counter-zoom makes the coordinate space consistent. However, if context menu positioning appears off, the menu coordinates may need to be multiplied by `uiZoom` since the menu is rendered outside the counter-zoomed container (inside the global zoom space). This should be tested and addressed if needed.

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx` - Main change: add counter-zoom style to the container div
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` - Fix `cursor: default` on `.canvas-file-node` (line 5034)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts` - Source of `uiZoom` value (read-only reference, no changes needed)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx` - Reference for how global zoom is applied (lines 385-393, no changes needed)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx` - Reference for similar zoom fix pattern (lines 79-94, no changes needed)

---

