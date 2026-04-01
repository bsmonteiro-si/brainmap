# 2026-03-22 — Subagent Transcript: Plan

**Date:** 2026-03-22 13:58:01
**Agent:** Plan
**Agent ID:** a99cea9f413fb12bc
**Parent Session:** 1fb358f1-ddeb-4bea-b367-067bc2d3487e

---

## User

Design an implementation plan to fix canvas viewport not restoring on close/reopen in a React Flow v12 canvas editor.

## The Bug

The root cause is a **timing race condition**:

1. `CanvasEditor` has `key={path}` on the error boundary, so the entire tree (including `ReactFlowProvider`) remounts from scratch when opening a canvas
2. React Flow fires `onInit` when its internal viewport is initialized — but this happens **before** the async file load completes
3. The `handleInit` callback checks `pendingViewportRef.current`, but at that point it's still `null` (the load effect hasn't finished yet)
4. `handleInit` returns early (`if (!vp) return`)
5. Later, the load effect completes and sets `pendingViewportRef.current = savedVp ?? "fitView"` — but `onInit` never fires again
6. Result: viewport is never restored

## The Fix

Replace the `onInit` + double-RAF approach with React Flow v12's `useNodesInitialized()` hook. This hook returns `true` only after all nodes have been measured with width/height — which is exactly the right moment to restore viewport.

**Key file:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx`

### Approach

1. Import `useNodesInitialized` from `@xyflow/react`
2. Add `const nodesInitialized = useNodesInitialized()` in `CanvasEditorInner`
3. Add a `useEffect` that triggers when `nodesInitialized` becomes `true`:
   - Read `pendingViewportRef.current`
   - If it's a `Viewport`, call `reactFlowInstance.setViewport(vp)`
   - If it's `"fitView"`, call `reactFlowInstance.fitView({ padding: 0.2 })`
   - Clear the ref afterward
4. Remove the `handleInit` callback and the `onInit` prop from `<ReactFlow>`
5. Keep the unmount save logic unchanged
6. Keep the `persistViewport`/`loadSavedViewports` module-level code unchanged

### Why this works

- `useNodesInitialized()` only returns `true` after nodes have width/height — so it naturally waits for the async load + React render + React Flow measurement
- It's reactive: even if the component mounts before nodes are loaded, the effect will fire when nodes finally get measured
- No need for RAFs or timing hacks

### Edge cases to consider

- What if the canvas has zero nodes? `useNodesInitialized` with no nodes — need to check behavior. If it returns `true` immediately with empty nodes, we need the `pendingViewportRef` to be set before that happens, OR we handle the "no nodes" case separately (probably just skip viewport restore).
- What if nodes are loaded but pendingViewportRef is still null? The effect should be a no-op.
- Multiple effect triggers: `useNodesInitialized` might toggle. We should use a `hasRestoredRef` to ensure we only restore once per mount.

### Verification

- Open a canvas, zoom/pan to a specific position
- Close the tab
- Reopen the same canvas
- Verify the viewport is restored to the exact previous position
- Also test: opening a canvas for the first time (should fitView)
- Also test: opening a canvas with zero nodes

---

## Assistant



I'll explore the current implementation to understand the exact code structure and design a precise fix.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":120}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"useNodesInitialized\\|onInit\\|handleInit\\|pendingViewportRef\\|persistViewport\\|loadSavedViewports\\|fitView\\|setViewport\\|reactFlowInstance\\|useReactFlow\" crates/app/src/`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":120,"limit":90}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":405,"limit":50}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":480,"limit":25}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":940,"limit":30}`

---

## Assistant

Now let me read the load effect to understand the full timing.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":209,"limit":60}`

---

## Assistant

Now let me check what `useNodesInitialized` exports from `@xyflow/react` to confirm availability.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"useNodesInitialized\" /Users/bsmonteiro/Desktop/Personal/brainmap/node_modules/@xyflow/react/dist/ 2>/dev/null | head -5","description":"Check if useNodesInitialized is exported `

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":1000,"limit":60}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/ 2>/dev/null | head -10","description":"Check xyflow dist structure"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"useNodesInitialized\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/ 2>/dev/null | head -5","description":"Check if useNodesInitializ`

---

## Assistant

Good -- `useNodesInitialized` is available and exported. Let me check its exact signature/behavior.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 30 \"function useNodesInitialized\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/index.js | head -35","description":"Read useNodesInit`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -B 5 \"selector\\$4\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/index.js | head -20","description":"Find selector$4 to understand empt`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 15 \"const selector\\$4\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/index.js | head -20","description":"Read selector$4 implementat`

---

## Assistant

This is critical. The default `useNodesInitialized()` (without `includeHiddenNodes`) uses `s.nodesInitialized` directly -- I need to check what that state flag does with zero nodes.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"nodesInitialized\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/index.js | head -15","description":"Find how nodesInitialized is set`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"sed -n '3130,3165p' /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/index.js","description":"Read adoptUserNodes and nodesInitialized logic"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 20 \"function adoptUserNodes\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/index.js | head -25","description":"Check adoptUserNodes r`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"adoptUserNodes\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/index.js | head -5","description":"Find adoptUserNodes definition"}`

---

## Assistant

It's imported from `@xyflow/system`. Let me check the behavior for empty nodes.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 30 \"function adoptUserNodes\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/system/dist/esm/index.js 2>/dev/null | head -35","description":"Read adop`

---

## Assistant

Key finding: `let nodesInitialized = nodes.length > 0;` -- so for empty nodes, `nodesInitialized` starts as `false` and will remain `false`. This means `useNodesInitialized()` will return `false` for an empty canvas and never become `true`.

Let me also check the outer wrapper component to understand the full mount lifecycle.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"CanvasEditor\\b\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx | head -10","description":"Find CanvasEditor wrapper component"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":1296,"limit":30}`

---

## Assistant

Now I have all the information needed. Let me also check the `nodesInitialized` behavior more carefully -- specifically whether it stays `false` when the node eventually gets measured dimensions.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"sed -n '3255,3285p' /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/index.js","description":"Read the updateNodes action that recalculates nodesI`

---

## Assistant

Now I understand the full picture. Let me check the rest of `adoptUserNodes` to confirm the `nodesInitialized` return logic.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 60 \"function adoptUserNodes\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/system/dist/esm/index.js 2>/dev/null | tail -20","description":"Read end `

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 55 \"function adoptUserNodes\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/system/dist/esm/index.js 2>/dev/null | grep \"nodesInitialized\"","descri`

---

## Assistant

So `nodesInitialized` starts `true` if `nodes.length > 0`, then gets set to `false` if any node lacks measured dimensions. It returns `true` once all nodes have dimensions. For empty arrays, it returns `false` and never changes.

Now I have the complete picture. Here is the implementation plan:

---

## Implementation Plan: Fix Canvas Viewport Restore on Close/Reopen

### Problem Summary

The viewport restore in `CanvasEditor.tsx` has a timing race: `onInit` fires before the async file load completes, so `pendingViewportRef` is still `null` when `handleInit` runs. The viewport is never restored.

### Solution

Replace the `onInit`-based approach with a `useEffect` driven by `useNodesInitialized()` from React Flow v12, plus a separate fallback for empty canvases.

### File to Modify

**`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx`**

### Step-by-step Changes

**Step 1: Update the import (line 3-14)**

Add `useNodesInitialized` to the import from `@xyflow/react`:

```typescript
import {
  ReactFlow,
  Controls,
  Background,
  Panel,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  SelectionMode,
  useNodesInitialized,  // ADD THIS
} from "@xyflow/react";
```

**Step 2: Add `useNodesInitialized` hook and a guard ref (inside `CanvasEditorInner`, after line 199)**

Add these after the existing `pendingViewportRef` declaration:

```typescript
const nodesInitialized = useNodesInitialized();
const hasRestoredViewportRef = useRef(false);
```

**Step 3: Add the viewport-restore effect (replace lines 412-429)**

Remove the entire `handleInit` callback and replace it with a `useEffect`:

```typescript
// Restore viewport once nodes are measured (or loading finishes for empty canvas)
useEffect(() => {
  if (hasRestoredViewportRef.current) return;

  const vp = pendingViewportRef.current;
  if (!vp) return; // load hasn't completed yet

  // For non-empty canvases, wait until nodes are measured
  if (nodes.length > 0 && !nodesInitialized) return;

  hasRestoredViewportRef.current = true;
  pendingViewportRef.current = null;

  // Single RAF to let React Flow finish its render pass
  requestAnimationFrame(() => {
    try {
      if (vp === "fitView") {
        reactFlowInstance.fitView({ padding: 0.2 });
      } else {
        reactFlowInstance.setViewport(vp);
      }
    } catch { /* unmounted */ }
  });
}, [nodesInitialized, nodes.length, reactFlowInstance]);
```

This effect works because:
- It checks `pendingViewportRef.current` -- which is only set after the async load completes (line 244), so it naturally waits for data
- For canvases with nodes: it waits for `nodesInitialized` to become `true`, meaning all nodes have been measured by React Flow
- For empty canvases (`nodes.length === 0`): it proceeds immediately once the load sets the ref, since there are no nodes to measure
- `hasRestoredViewportRef` prevents double-restore if dependencies change later
- A single RAF is kept as a safety margin for React Flow's internal rendering

**Step 4: Remove `onInit={handleInit}` from `<ReactFlow>` (line 955)**

Delete the `onInit={handleInit}` prop from the `<ReactFlow>` component.

**Step 5: Keep everything else unchanged**

- The unmount save logic (lines 488-493) stays as-is
- The `persistViewport`/`loadSavedViewports` module-level code stays as-is
- The `pendingViewportRef` declaration stays (it's still the communication mechanism between the load effect and the restore effect)

### Edge Cases

1. **Empty canvas (zero nodes)**: `useNodesInitialized()` returns `false` and never becomes `true`. The effect handles this by checking `nodes.length > 0` -- if no nodes, it skips the `nodesInitialized` gate and restores immediately.

2. **First-time open (no saved viewport)**: The load effect sets `pendingViewportRef.current = "fitView"` (line 244 fallback). The restore effect calls `reactFlowInstance.fitView({ padding: 0.2 })`.

3. **Multiple effect triggers**: The `hasRestoredViewportRef` guard ensures the viewport is restored exactly once per mount. The ref resets naturally when the component remounts (due to `key={path}` on the error boundary).

4. **Load failure**: If the load fails, `pendingViewportRef` is never set, so the restore effect is a no-op (the `if (!vp) return` guard).

5. **Component unmount during load**: The `cancelled` flag in the load effect prevents setting state/refs after unmount. The restore effect's `try/catch` handles the case where `reactFlowInstance` methods fail on an unmounted component.

### Verification Plan

1. Open a canvas with multiple nodes, zoom/pan to a specific position, close the tab, reopen -- viewport should be restored exactly
2. Open a canvas for the first time (no saved viewport) -- should fitView
3. Open an empty canvas (no nodes) -- should not error, should show default viewport
4. Rapidly switch between canvas tabs -- viewports should restore correctly for each
5. Open canvas, add nodes, close, reopen -- should restore viewport (not fitView, since viewport was saved on unmount)

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx` - The only file that needs changes; contains the `CanvasEditorInner` component with the broken viewport restore logic
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/index.js` - Reference for `useNodesInitialized` behavior (read-only, confirms the hook is available and how `nodesInitialized` is computed)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/system/dist/esm/index.js` - Reference for `adoptUserNodes` which shows `nodesInitialized = nodes.length > 0` (critical for understanding the empty canvas edge case)

---

