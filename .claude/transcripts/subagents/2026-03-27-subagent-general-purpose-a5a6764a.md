# 2026-03-27 — Subagent Transcript: general-purpose

**Date:** 2026-03-27 17:17:27
**Agent:** general-purpose
**Agent ID:** a5a6764a35595ba22
**Parent Session:** 5b6ef61f-dcea-4a86-a693-8980f6d15fd7

---

## User

You are a code reviewer. Review the following TypeScript/React changes for the BrainMap canvas editor. These changes add two features:

1. Edge reconnection by dragging arrow tips (using React Flow's onReconnect API)
2. Edge toolbar buttons to invert direction and toggle bidirectional

Review criteria (adapted from the project's code-reviewer.md for TypeScript/React code):

### 1. Correctness
- Logic bugs, missed conditions, off-by-one errors
- State mutations: are they correct? Do they preserve all needed properties?
- Event handling: stopPropagation, proper React patterns

### 2. Function Design
- Is each function doing one thing?
- Are names descriptive?

### 3. Edge Cases
- What happens with undefined handles?
- What happens with edges that have no markers?
- Color sync between markers and style.stroke

### 4. Performance
- Unnecessary re-renders?
- Proper memoization/useCallback dependencies?

## Changed Files

### File 1: CanvasEditor.tsx - Imports changed
Added `reconnectEdge` to named imports from @xyflow/react.
Added `Edge, Connection` to type imports from @xyflow/react.

### File 1: CanvasEditor.tsx - New callbacks (after onConnect)
```typescript
const onReconnectStart = useCallback(() => {
  pushSnapshot();
}, [pushSnapshot]);

const handleReconnect = useCallback(
  (oldEdge: Edge, newConnection: Connection) => {
    setEdges((eds) => reconnectEdge(oldEdge, newConnection, eds, { shouldReplaceId: false }));
    requestAnimationFrame(() => scheduleSave());
  },
  [setEdges, scheduleSave],
);

const onReconnectEnd = useCallback(() => {
  // If reconnection failed (dropped on empty canvas), edge stays as-is
}, []);
```

### File 1: CanvasEditor.tsx - ReactFlow props added
```tsx
onReconnectStart={onReconnectStart}
onReconnect={handleReconnect}
onReconnectEnd={onReconnectEnd}
```

### File 2: canvasNodes.tsx - Icon imports added
Added `ArrowRightLeft, MoveHorizontal` to lucide-react imports.

### File 2: canvasNodes.tsx - New handlers (inside CanvasEdgeInner, after handleLabelFont)
```typescript
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
          : undefined,
        targetHandle: ed.sourceHandle
          ? `${ed.sourceHandle}-target`
          : undefined,
        markerStart: ed.markerEnd,
        markerEnd: ed.markerStart,
      };
    }),
  );
  scheduleSave();
};

const handleToggleBidirectional = (e: React.MouseEvent) => {
  e.stopPropagation();
  pushSnapshot();
  setEdges((eds) =>
    eds.map((ed) => {
      if (ed.id !== id) return ed;
      const isBidirectional = !!ed.markerStart && !!ed.markerEnd;
      if (isBidirectional) {
        return { ...ed, markerStart: undefined };
      }
      const stroke = (ed.style as Record<string, unknown> | undefined)?.stroke;
      const markerId = typeof stroke === "string"
        ? `brainmap-arrow-${stroke}`
        : "brainmap-arrow";
      return {
        ...ed,
        markerStart: ed.markerStart || markerId,
        markerEnd: ed.markerEnd || markerId,
      };
    }),
  );
  scheduleSave();
};
```

### File 2: canvasNodes.tsx - New toolbar buttons (after edge-type-picker, before label-format)
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

### Context: Handle ID Convention
- Source handles: "top", "right", "bottom", "left"
- Target handles: "top-target", "right-target", "bottom-target", "left-target"
- When inverting, old targetHandle loses "-target" suffix to become sourceHandle, and old sourceHandle gains "-target" suffix to become targetHandle.

### Context: Marker ID Convention
- Default: "brainmap-arrow"
- Colored: "brainmap-arrow-{color}" where color is the hex string from style.stroke
- SVG markers use orient="auto-start-reverse" so markerStart arrows render correctly

### Context: Existing patterns
- `handleColor` in same component uses same `style.stroke` → marker ID derivation
- `handleClearColor` resets markers to "brainmap-arrow"
- `pushSnapshot()` is called before mutations for undo support
- `scheduleSave()` triggers debounced auto-save

## Output Format
Write your review as a list of findings. For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

If the code is solid, say so briefly.

---

## Assistant



## Code Review: Edge Reconnection & Direction Toggle

### Finding 1

- **File**: `canvasNodes.tsx` — `handleInvert`, sourceHandle/targetHandle swap
- **Severity**: bug
- **Finding**: The handle ID transformation is wrong when the original handle is `undefined` or doesn't follow the expected pattern. Specifically:
  - `ed.targetHandle?.replace(/-target$/, "")` — This works correctly to strip the suffix.
  - `ed.sourceHandle ? \`${ed.sourceHandle}-target\` : undefined` — This works correctly to add the suffix.
  - **However**, if `ed.targetHandle` is defined but does NOT end with `-target` (e.g., a malformed or manually set handle), `replace(/-target$/, "")` returns the string unchanged, which means the new sourceHandle will be set to a target-style ID that doesn't actually exist as a source handle on the node. This would cause the edge to detach visually.
- **Fix**: Add a guard or normalize more defensively. For example:
  ```typescript
  sourceHandle: ed.targetHandle
    ? ed.targetHandle.endsWith("-target")
      ? ed.targetHandle.slice(0, -"-target".length)
      : ed.targetHandle
    : undefined,
  ```
  This is the same behavior as `replace`, so actually the current code is fine for this specific sub-case — the edge would just point to a handle that doesn't exist, which is already a broken-data scenario. This is minor enough to downgrade.

**Revised severity**: suggestion — Consider logging a warning if the handle doesn't match the expected pattern, but the current code is acceptable for well-formed data.

### Finding 2

- **File**: `canvasNodes.tsx` — `handleToggleBidirectional`, marker ID construction
- **Severity**: bug
- **Finding**: The `markerId` derivation strips the `#` from hex colors inconsistently. Looking at the convention: marker IDs are `brainmap-arrow-{color}` where color is "the hex string from style.stroke". But `style.stroke` typically includes the `#` prefix (e.g., `#ff0000`). If the existing `handleColor` function in the same component builds marker IDs as `brainmap-arrow-#ff0000`, then this code is consistent. But if `handleColor` strips the `#` (which is common since `#` is invalid in SVG marker ID references), then this code produces the wrong ID.
- **Fix**: Verify what `handleColor` does with the `#` prefix and match it exactly. If it strips it: `` `brainmap-arrow-${stroke.toString().replace(/^#/, "")}` ``. If it keeps it, the current code is fine.

### Finding 3

- **File**: `canvasNodes.tsx` — `handleToggleBidirectional`
- **Severity**: should-fix
- **Finding**: When toggling bidirectional OFF (removing `markerStart`), the code unconditionally removes `markerStart`. This means if the edge was originally a reverse-only edge (has `markerStart` but no `markerEnd`), calling toggle would remove `markerStart` and leave the edge with no arrows at all. The `isBidirectional` check (`!!ed.markerStart && !!ed.markerEnd`) prevents this specific scenario from triggering the removal branch, so this is actually safe. **No issue here** — I retract this finding on closer read.

### Finding 4

- **File**: `CanvasEditor.tsx` — `onReconnectEnd`
- **Severity**: suggestion
- **Finding**: `onReconnectEnd` is an empty callback with a comment. It has an empty dependency array, so it creates a stable reference, which is good. But it's unnecessary — React Flow does not require `onReconnectEnd` to be provided. Passing `undefined` (or omitting the prop) would be cleaner.
- **Fix**: Remove `onReconnectEnd` and the corresponding prop unless you plan to add failed-reconnect cleanup (e.g., removing the edge on failed reconnect, which is a common UX pattern).

### Finding 5

- **File**: `CanvasEditor.tsx` — `handleReconnect`
- **Severity**: should-fix
- **Finding**: `pushSnapshot()` is called in `onReconnectStart`, which is correct for undo. However, if the user starts a reconnect drag and then drops it back on the same handle (no actual change), a snapshot was still pushed. This means pressing Undo would appear to do nothing (restoring identical state), which is a minor UX glitch.
- **Fix**: Either (a) move `pushSnapshot()` into `handleReconnect` (so it only fires on successful reconnection), or (b) accept this as a known minor issue. Option (a) is recommended since it matches how `handleInvert` and `handleToggleBidirectional` work — they push the snapshot immediately before the mutation, not before the user-intent gesture.

### Finding 6

- **File**: `CanvasEditor.tsx` — `handleReconnect`
- **Severity**: suggestion
- **Finding**: `requestAnimationFrame(() => scheduleSave())` wraps the save in an rAF. The other mutation handlers (`handleInvert`, `handleToggleBidirectional`) call `scheduleSave()` synchronously. This inconsistency is minor since `scheduleSave` is already debounced, but it raises the question of why rAF is needed here specifically. If `reconnectEdge` updates state synchronously via `setEdges`, the save can also be called synchronously for consistency.
- **Fix**: Either add a comment explaining why rAF is needed (e.g., waiting for React Flow's internal state to settle after reconnect), or remove it for consistency.

### Finding 7

- **File**: `canvasNodes.tsx` — `handleInvert`, marker swap
- **Severity**: should-fix
- **Finding**: When inverting, `markerStart` and `markerEnd` are swapped directly: `markerStart: ed.markerEnd, markerEnd: ed.markerStart`. This is correct for the simple case where markers are strings. However, React Flow markers can also be `EdgeMarkerType` objects (e.g., `{ type: MarkerType.ArrowClosed, color: '#ff0000' }`). The swap works for objects too since it's a reference swap, so this is actually fine. **No issue** — just confirming the swap handles both string and object marker types correctly.

### Finding 8

- **File**: `canvasNodes.tsx` — `handleToggleBidirectional`, type assertion
- **Severity**: suggestion
- **Finding**: `(ed.style as Record<string, unknown> | undefined)?.stroke` — This cast is pragmatic but loses type safety. If React Flow's `CSSProperties` type changes or `stroke` is removed, this won't catch it at compile time.
- **Fix**: Use `ed.style?.stroke` directly if your TS config allows indexing `CSSProperties`, or use a typed helper. Low priority since the existing `handleColor` presumably does the same thing.

---

### Summary

The code is generally solid and follows the established patterns well. The two actionable items are:

1. **should-fix**: Move `pushSnapshot()` from `onReconnectStart` into `handleReconnect` to avoid pushing undo snapshots for no-op reconnections (Finding 5).
2. **should-fix (conditional)**: Verify the marker ID matches `handleColor`'s convention regarding the `#` prefix in hex colors (Finding 2). If they already match, no change needed.

Everything else — event propagation, state immutability, memoization dependencies, the handle-suffix transformation logic — looks correct.

---

