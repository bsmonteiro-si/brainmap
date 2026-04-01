# Video PiP Panel - Code Review

**Date**: 2026-03-24
**Files reviewed**:
- `src/components/Editor/VideoPipPanel.tsx`
- `src/components/Editor/VideoPipPanel.test.tsx`
- `src/stores/uiStore.ts` (videoPip slice)
- `src/components/Layout/FileTreePanel.tsx` (context menu entry)
- `src/components/Layout/AppLayout.tsx` (layout integration)

---

## Findings

### 1. Stale closure in drag handler captures pos at creation time

- **File**: `VideoPipPanel.tsx`, line 40
- **Severity**: bug
- **Finding**: `handleDragStart` closes over `pos.x` and `pos.y` (listed in its dependency array). The `startPosX`/`startPosY` are set from `pos` at mousedown time, so the drag itself works correctly for a single drag operation. However, because `handleDragStart` is recreated every time `pos` changes, the `mousemove`/`mouseup` listeners registered by the *previous* closure are orphaned if React re-renders and attaches the new `handleDragStart` mid-drag. In practice this is unlikely (re-render during a drag would require an external state change), but the pattern is fragile. The same issue applies to `handleResizeStart` (line 64) closing over `size.w`/`size.h`.
- **Fix**: Use a ref to track current pos/size, remove `pos.x`/`pos.y` and `size.w`/`size.h` from the dependency arrays so the callbacks are stable. Read from the ref inside `handleDragStart`/`handleResizeStart`. Alternatively, read directly from the state setter's callback form (which is already done for `setPos`/`setSize` in the move handlers -- but the `startPos` values are still captured from the stale closure).

### 2. No cleanup of document event listeners on unmount during active drag/resize

- **File**: `VideoPipPanel.tsx`, lines 56-57, 80-81
- **Severity**: should-fix
- **Finding**: If the component unmounts while a drag or resize is in progress (e.g., user closes the PiP via keyboard shortcut or store change while mouse is held down), the `mousemove` and `mouseup` listeners attached to `document` are never removed. They will fire on a now-unmounted component, calling `setPos`/`setSize` on unmounted state and leaking listeners until `mouseup` fires.
- **Fix**: Store the cleanup functions in a ref and call them in a `useEffect` cleanup. For example:
  ```ts
  const cleanupRef = useRef<(() => void) | null>(null);
  useEffect(() => () => cleanupRef.current?.(), []);
  ```
  Then in `handleDragStart`/`handleResizeStart`, assign `cleanupRef.current = handleUp`.

### 3. Position clamping allows panel to render mostly off-screen

- **File**: `VideoPipPanel.tsx`, lines 47-48
- **Severity**: suggestion
- **Finding**: The drag clamping uses `window.innerWidth - 100` for X and `window.innerHeight - 40` for Y. This means the panel can be dragged so that only 100px of width and 40px of height remain visible, making most of the video inaccessible. Conversely, there is no clamping that accounts for the panel's own size on the left/top edges (only `Math.max(0, ...)`).
- **Fix**: Consider clamping with the panel's actual size so at least a meaningful portion stays visible, e.g., `Math.min(window.innerWidth - size.w, ...)` or at least a larger minimum visible area.

### 4. Window resize can leave panel off-screen with no recovery

- **File**: `VideoPipPanel.tsx`
- **Severity**: should-fix
- **Finding**: The initial position is computed from `window.innerWidth`/`window.innerHeight`, and position resets only when `path` changes. If the user resizes the browser window (or the app window) after opening the PiP, the panel can end up completely off-screen with no way to recover it except closing and reopening.
- **Fix**: Add a `resize` event listener on `window` that clamps the position to the new viewport bounds, or at minimum ensure the panel stays reachable.

### 5. No Escape key handler to close the PiP panel

- **File**: `VideoPipPanel.tsx`
- **Severity**: suggestion
- **Finding**: The PiP panel is a floating overlay but has no keyboard shortcut to dismiss it. The `VideoViewer` inside handles Escape for its own fullscreen mode, but the PiP panel itself has no Escape binding. Users must click the small X button.
- **Fix**: Add a `keydown` listener for Escape on the panel (or globally) that calls `closeVideoPip()`.

### 6. Test coverage gaps: drag, resize, and window resize behaviors are untested

- **File**: `VideoPipPanel.test.tsx`
- **Severity**: should-fix
- **Finding**: Tests cover render/close/portal basics well, but there are no tests for:
  - Drag behavior (mousedown on titlebar, then mousemove, then mouseup)
  - Resize behavior (mousedown on resize handle, then mousemove, then mouseup)
  - Position clamping within viewport bounds
  - Position reset when `path` changes
  - Cleanup of document listeners on unmount during active drag
- **Fix**: Add tests that simulate the drag/resize sequences with `fireEvent.mouseDown`, `fireEvent.mouseMove`, `fireEvent.mouseUp` on `document`, and assert position/size changes. Add a test that changes `path` and verifies position resets.

### 7. VideoViewer fullscreen toggle inside PiP creates confusing UX

- **File**: `VideoPipPanel.tsx` (renders `VideoViewer`), `VideoViewer.tsx` line 131-133
- **Severity**: suggestion
- **Finding**: `VideoViewer` has its own fullscreen toggle (`isFullscreen` state, `f` key binding) which applies a CSS class `video-viewer--fullscreen`. Inside the PiP panel's constrained dimensions, this fullscreen mode likely doesn't do what the user expects -- it would try to fill the PiP container rather than the actual screen. The `F` key and fullscreen button may confuse users in PiP context.
- **Fix**: Consider passing a prop to `VideoViewer` to disable the fullscreen feature when embedded in the PiP panel, or make the fullscreen toggle expand the PiP panel to fill the screen.

### 8. createPortal target is document.body which may conflict with global zoom

- **File**: `VideoPipPanel.tsx`, line 107
- **Severity**: suggestion
- **Finding**: Per the project memory, global zoom is applied via `document.documentElement.style.zoom`. Since the portal renders to `document.body`, the PiP panel will be affected by this zoom, which may cause the position calculations (based on `window.innerWidth`/`innerHeight` and `clientX`/`clientY`) to be incorrect at non-1.0 zoom levels. Mouse coordinates from events are in CSS pixels but `window.innerWidth` may or may not account for zoom depending on the browser.
- **Fix**: Test the PiP panel at various zoom levels. If coordinates drift, divide event coordinates and window dimensions by the current zoom factor.

### 9. Store actions are minimal and correct

- **File**: `uiStore.ts`, lines 1015-1016
- **Severity**: (no issue)
- **Finding**: `openVideoPip` and `closeVideoPip` are simple setters. Clean and correct. The state shape (`videoPipPath: string | null`) is appropriate.

### 10. Context menu integration is correct

- **File**: `FileTreePanel.tsx`, lines 540-549
- **Severity**: (no issue)
- **Finding**: The "Open in Own Panel" menu item correctly checks for video extensions and calls `openVideoPip` with the full path. The menu closes after. No issues found.

---

## Summary

The implementation is clean and well-structured overall. The main concerns are:
- **Bug**: Stale closure pattern in drag/resize handlers (finding 1)
- **Should-fix**: No cleanup of document listeners on unmount during active drag (finding 2)
- **Should-fix**: No recovery when window resize pushes panel off-screen (finding 4)
- **Should-fix**: Missing test coverage for drag/resize/position-reset behaviors (finding 6)
