# Code Review: Canvas Resizer autoHeight fix

**Files reviewed**: `crates/app/src/components/Editor/canvasNodes.tsx` (lines 330-373)

## Findings

### 1. NodeResizer `minHeight` prop still constrains resize after style swap

- **File**: `canvasNodes.tsx:362-371`
- **Severity**: should-fix
- **Finding**: `handleResizeStart` converts `style.minHeight` to `style.height` so the CSS floor is removed. However, the `<NodeResizer>` component itself receives `minHeight={minHeight}` (default 40) as a prop. During the resize drag, `NodeResizer` enforces this prop as a minimum constraint on the resulting height. This is fine for the default value of 40, but callers like `CanvasFileNode` pass `minHeight={50}`. If a file node's content-driven `style.minHeight` was, say, 80px and the user wants to shrink it to 55px, the `NodeResizer` prop allows that (55 > 50). But if a node's actual rendered content is taller than the `minHeight` prop, the swap still works correctly because `NodeResizer`'s prop is the floor, not the CSS `min-height`. So this is actually fine -- the prop floor and the style floor serve different purposes. No action needed here after closer analysis.

### 2. Race between `onResizeStart` state update and drag

- **File**: `canvasNodes.tsx:340-348`
- **Severity**: suggestion
- **Finding**: `handleResizeStart` calls `setNodes` which triggers a React state update. React Flow's `NodeResizer` reads node dimensions from the store during resize. If the state update (minHeight -> height swap) hasn't flushed before the first resize drag event, the first few pixels of dragging could still be constrained by the old `min-height` CSS. In practice, React Flow batches `onResizeStart` synchronously before the first `onResize` event, so the `setNodes` updater function will be applied before the next read. This is unlikely to cause a visible issue but worth noting.

### 3. No guard if style has both `height` and `minHeight`

- **File**: `canvasNodes.tsx:340-359`
- **Severity**: suggestion
- **Finding**: `handleResizeStart` only fires if `style.minHeight` is a number, and `handleResizeEnd` only fires if `style.height` is a number. If somehow a node ends up with both `height` and `minHeight` in its style (e.g., from the shape-switching code at line 226-238 which does a similar swap), the start handler would remove `minHeight` and set `height` to the old `minHeight` value -- potentially overwriting an existing `height`. This edge case seems unlikely given the shape-switching code is careful, but a defensive check like `if (typeof style.height === "number") return n;` at the top of `handleResizeStart` would make it bulletproof.

### 4. No unit tests for the Resizer component

- **File**: `canvasNodes.tsx`
- **Severity**: should-fix
- **Finding**: There are no tests for `canvasNodes.tsx` (no `canvasNodes.test.tsx` file exists). The resize start/end logic -- converting between `minHeight` and `height` -- is pure transformation logic embedded in callbacks. At minimum, the transformation logic should be tested: given a node with `style.minHeight: 80`, after `handleResizeStart` it should have `style.height: 80` and no `minHeight`; and the reverse for `handleResizeEnd`. These could be extracted as pure functions and tested directly, or tested via a component test with a mocked `useReactFlow`.

## Summary

The core logic is correct: swapping `minHeight` to `height` on resize start and back on resize end is a sound approach to the CSS floor problem. The `useCallback` dependencies are correct, and the `autoHeight` guard prevents unnecessary work on fixed-shape nodes. The conditional `onResizeStart`/`onResizeEnd` props (line 369-370) are a nice touch to avoid attaching handlers when not needed.

Two items worth addressing:
1. **should-fix**: Add unit tests for the minHeight/height swap logic.
2. **suggestion**: Add a defensive guard in `handleResizeStart` to bail out if `style.height` already exists, preventing potential overwrites in edge cases.
