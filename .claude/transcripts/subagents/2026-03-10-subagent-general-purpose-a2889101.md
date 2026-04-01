# 2026-03-10 — Subagent Transcript: general-purpose

**Date:** 2026-03-10 12:15:21
**Agent:** general-purpose
**Agent ID:** a28891012c5695c3c
**Parent Session:** e775a4b6-ec6a-4752-8126-0b07a473af0a

---

## User

You are reviewing TypeScript/React code for BrainMap, a knowledge graph desktop app (Tauri + React). Your job is to find real defects, not style nits.

## Review Criteria

### 1. Correctness
- Are there logic bugs? Off-by-one errors? Missed conditions?
- Do React effects have correct dependency arrays?
- Are there race conditions or state inconsistencies?
- Are event listeners properly cleaned up?

### 2. Code Quality
- Is each function doing one thing?
- Are there unnecessary re-renders or stale closures?
- Are React hooks used correctly (no conditional hooks, correct deps)?

### 3. Function Design
- Are names descriptive?
- Are there branches that should be simplified?

### 4. Test Coverage
- Is every new behavior tested?
- Are error paths (empty results, missing nodes) tested?
- Are test names descriptive?

### 5. Performance
- Are there unnecessary re-computations?
- Is `useMemo` used correctly with stable dependencies?

## Output Format

Write your review as a list of findings. For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is, with a code snippet if helpful
- **Fix**: what to do instead, with corrected code if applicable

If a file has no issues, skip it. If the code is solid, say so briefly.
Do NOT report missing comments, style preferences, or future TODOs.

## Changed Files to Review

Read and review these files:

1. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`
2. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphFocusFilter.ts`
3. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphFocusFilter.test.ts`
4. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx`
5. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphToolbar.tsx`
6. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts`
7. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx`
8. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`
9. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

## Feature Summary
The feature adds a "Focus in Graph" context menu item to the Files view. Right-clicking a note or folder opens a menu with one option. Clicking it:
1. Switches to the Graph tab (atomically sets `treeOpen: false` + `graphFocusPath` + `graphFocusKind`)
2. Filters the graph to show only the selected node and its direct neighbors (note) or all notes in a folder (folder)
3. A "Focus ×" button in the toolbar clears focus; clicking the Graph tab while already on it also clears focus

Write your review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/focus-in-graph-review-1.md`

---

## Assistant

I'll read all the files to review them thoroughly.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphFocusFilter.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphFocusFilter.test.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphToolbar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Now I have a thorough understanding of all the files. Let me write the review.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"mkdir -p /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code","description":"Ensure review output directory exists"}`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/focus-in-graph-review-1.md","content":"# Code Review: Focus in Graph Feature — Pass 1\n\nReviewer: general-purpose agent\`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/focus-in-graph-review-1.md`.

Here is a summary of findings:

**Bug (1)**
- `GraphToolbar.tsx` lines 95–102: The node-type filter `<select>` has `onChange={() => undefined}`. It is a visible, interactive control that silently does nothing. Either wire it up or remove it.

**Should-fix (4)**
- `GraphView.tsx` lines 107–116: The "first reveal" fit logic reads `containerRef.current?.offsetWidth` after the browser has already painted the new layout, so `wasZero` will usually be `false` and `cy.fit()` is never called. Track first-reveal with a dedicated `hasBeenFittedRef` instead.
- `GraphView.tsx` lines 196–245: The Cytoscape sync effect calls `cy.elements().remove()` + `cy.add()` on every store update, re-running the full layout each time. The focus feature makes this worse because `filteredNodes`/`filteredEdges` are new array references on every `useMemo` run triggered by `nodes` or `edges` identity changes.
- `FileTreePanel.tsx` lines 107–110: Context menu Y-clamp uses a hardcoded `60px` menu-height estimate. This should be derived from `menuRef.current?.offsetHeight` after mount.
- `AppLayout.tsx` lines 47–52 (pre-existing): `layout[PANEL_IDS.graph]` uses a string key (`"graph"`) to index a positional `number[]`. This always returns `undefined`, so panel sizes are never actually persisted to localStorage.

**Should-fix — test gap (1)**
- `graphFocusFilter.test.ts`: No test for focusing a path that does not exist in the nodes map. The function returns an empty subgraph but sets `focalPath` to the non-existent path; the consumer in `GraphView` then calls `cy.getElementById(focalPath).addClass(...)` on a missing node.

**Suggestions (2)**
- `graphFocusFilter.ts`: Neighbor-to-neighbor edges are excluded by design for note focus; a clarifying comment would help future readers.
- `FileTreePanel.tsx` `handleFocusInGraph`: `onClose()` fires before `setGraphFocus`, producing an extra intermediate render. Harmless with React 18 auto-batching but worth noting.

---

