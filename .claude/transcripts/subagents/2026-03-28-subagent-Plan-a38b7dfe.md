# 2026-03-28 — Subagent Transcript: Plan

**Date:** 2026-03-28 14:38:02
**Agent:** Plan
**Agent ID:** a38b7dfe193c325f3
**Parent Session:** 9de9b7d0-7466-48dd-888e-5b2173256e19

---

## User

Plan a fix for the Canvas editor's broken Undo/Redo in BrainMap.

## Problem

The canvas undo/redo keyboard shortcuts (Cmd+Z / Cmd+Shift+Z) work correctly at the handler level — the keydown listener in CanvasEditor.tsx (lines 530-548) properly intercepts and calls `canvasUndo()`/`canvasRedo()`. The undo/redo stack logic (lines 477-527) is also correct.

**The root cause is that `CanvasNodeToolbar` (canvasNodes.tsx lines 144-395) never calls `pushSnapshot()` before mutating state.** All its handlers only call `scheduleSave()` — no snapshot is pushed to the undo stack before the mutation, so there's nothing to undo.

### Affected handlers in `CanvasNodeToolbar`:
1. `handleDelete` (line 163) — deletes node + connected edges
2. `handleColor` (line 169) — sets border color
3. `handleClearColor` (line 178) — clears border color
4. `handleBgColor` (line 189) — sets background color
5. `handleClearBgColor` (line 198) — clears background color
6. Shape selection (line 271) — changes shape
7. `setNodeData` (line 158) — used by font size, font family, text align, vertical align, title position

### What works correctly (for comparison):
- Drag/resize: `handleNodesChange` in CanvasEditor.tsx pushes snapshot on gesture start
- Edge add/remove: `handleEdgesChange` pushes snapshot
- Edge toolbar operations: `CanvasEdgeInner` (line 1033) does `const pushSnapshot = useCanvasSnapshot()` and calls it before mutations
- `CanvasTextNodeInner` (line 708) does the same for convert-to-note

### The fix pattern:
The `useCanvasSnapshot` hook is already available and imported in canvasNodes.tsx (line 16). The toolbar just needs to:
1. Call `useCanvasSnapshot()` to get `pushSnapshot`
2. Call `pushSnapshot()` before each mutation

### Key constraint:
- `CanvasNodeToolbar` is a React component that is rendered inside the `CanvasSnapshotContext.Provider` (CanvasEditor.tsx line 1377), so `useCanvasSnapshot()` will return the correct function.

### Files:
- `crates/app/src/components/Editor/canvasNodes.tsx` — the only file that needs changes
- `crates/app/src/components/Editor/CanvasEditor.tsx` — reference only, no changes needed

Please produce a detailed implementation plan.

---

## Assistant



I'll explore the codebase to verify the problem description and understand the existing patterns before producing a plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","limit":30,"offset":1}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","limit":60,"offset":140}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","limit":60,"offset":198}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"useCanvasSnapshot","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pushSnapshot","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_mode":"content","-n":true}`

---

## Assistant

Now let me verify the reference patterns at lines 708 and 1033 to see exactly how they use `pushSnapshot`.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","limit":20,"offset":705}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","limit":20,"offset":1030}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","limit":30,"offset":258}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","limit":5,"offset":287}`

---

## Assistant

Now let me look at how `CanvasEdgeInner` uses `pushSnapshot` before mutations, to confirm the pattern.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pushSnapshot\\(\\)|scheduleSave\\(\\)","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","output_mode":"content","-n":true,"head_limit":`

---

## Assistant

I have a clear picture. Let me also quickly verify the `useCanvasSnapshot` hook definition to understand what it returns.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":25,"offset":475}`

---

## Assistant

Now let me check the context provider.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"CanvasSnapshotContext","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_mode":"content","-n":true}`

---

## Assistant

Everything checks out. Here is the complete implementation plan.

---

## Implementation Plan: Fix Canvas Undo/Redo for Node Toolbar Operations

### Root Cause

`CanvasNodeToolbar` (lines 144-395 of `canvasNodes.tsx`) mutates node/edge state through seven handlers but never calls `pushSnapshot()` before the mutation. Since the undo stack requires a snapshot of the **pre-mutation** state, there is nothing to undo when the user presses Cmd+Z.

### Existing Pattern to Follow

Two other components in the same file already do this correctly:

- **`CanvasTextNodeInner`** (line 708): `const pushSnapshot = useCanvasSnapshot();` then calls `pushSnapshot()` before `setNodes(...)`.
- **`CanvasEdgeInner`** (line 1033): Same pattern, calls `pushSnapshot()` before every edge mutation.

The `useCanvasSnapshot` hook is already imported at line 16 and the context provider wraps the entire ReactFlow tree (line 1377 of `CanvasEditor.tsx`).

### Changes Required

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx`

**Step 1 -- Add the hook call inside `CanvasNodeToolbar`**

At line 150, after `const scheduleSave = useCanvasSave();`, add:

```ts
const pushSnapshot = useCanvasSnapshot();
```

**Step 2 -- Add `pushSnapshot()` before each mutation**

For every handler that calls `setNodes`/`setEdges` followed by `scheduleSave()`, insert `pushSnapshot();` as the **first line** of the handler (before the `setNodes`/`setEdges` call). This captures the pre-mutation state. Specifically:

| Handler | Location | What to add |
|---|---|---|
| `setNodeData` | line 158 | Add `pushSnapshot();` as first statement, before `setNodes(...)` on line 159 |
| `handleDelete` | line 163 | Add `pushSnapshot();` as first statement, before `setNodes(...)` on line 164 |
| `handleColor` | line 169 | Add `pushSnapshot();` as first statement, before `setNodes(...)` on line 170 |
| `handleClearColor` | line 178 | Add `pushSnapshot();` as first statement, before `setNodes(...)` on line 179 |
| `handleBgColor` | line 189 | Add `pushSnapshot();` as first statement, before `setNodes(...)` on line 190 |
| `handleClearBgColor` | line 198 | Add `pushSnapshot();` as first statement, before `setNodes(...)` on line 199 |
| Shape selection (inline) | line 271 | Add `pushSnapshot();` as first statement in the `onClick` callback, before `setNodes(...)` on line 273 |

That is 7 insertion points, each a single line: `pushSnapshot();`.

### What NOT to change

- No changes needed in `CanvasEditor.tsx` -- the undo/redo stack logic and keyboard handlers are correct.
- No changes needed to the `useCanvasSnapshot` hook or context.
- The `scheduleSave()` calls remain in place (they handle persistence to disk, which is orthogonal to the undo stack).

### Verification

After the fix:
1. Select a canvas node, change its border color via the toolbar. Press Cmd+Z. The color should revert.
2. Delete a node via the toolbar. Press Cmd+Z. The node (and its edges) should reappear.
3. Change shape, background color, font size, font family, text alignment. Each should be individually undoable.
4. Cmd+Shift+Z (redo) should re-apply the reverted change.
5. Drag/resize undo should still work as before (no regression).

### Risk Assessment

**Very low risk.** Each change is a single-line insertion (`pushSnapshot();`) before an existing mutation call. The hook is already available in scope via imports, and the pattern is proven by two other components in the same file. No new dependencies, no architectural changes.

### Critical Files for Implementation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx` -- the only file that needs editing (7 single-line insertions)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx` -- reference only: contains the `useCanvasSnapshot` hook definition (line 56), `pushSnapshot` implementation (line 479), and context provider (line 1377)

---

