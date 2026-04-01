# 2026-03-09 — Subagent Transcript: general-purpose

**Date:** 2026-03-09 20:46:19
**Agent:** general-purpose
**Agent ID:** a8a87b5dcaed9ae41
**Parent Session:** 029c53be-32f6-4b33-aded-6ee2be0b034b

---

## User

You are reviewing TypeScript/React code for BrainMap, a knowledge graph tool. The following is the code reviewer criteria (originally for Rust but adapted for TypeScript/React):

## Review Criteria

### 1. Correctness
- Are there logic bugs? Missed conditions?
- Are React hooks used correctly (no rules-of-hooks violations, stale closures)?
- Does error handling cover failure modes?
- Are Zustand state updates correct (immutable updates for objects/arrays)?

### 2. React/TypeScript Quality
- Are there unnecessary re-renders or missing dependencies in useEffect/useCallback?
- Are refs used correctly (not reading stale refs)?
- Is TypeScript typing sound (no unsound casts, all `any` typed)?
- Are there memory leaks (missing cleanup in useEffect)?

### 3. Function Design
- Is each component/function doing one thing?
- Are names descriptive?

### 4. Performance
- Are useMemo/useCallback dependencies correct?
- Are there O(n²) operations on large data?

### 5. UX Correctness
- Does the code match the intended behavior from the plan?

## Files Changed

Please review these files and write your findings to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ux-improvements-review-1.md`.

### Files to review:

1. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`
2. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx`
3. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts`
4. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphToolbar.tsx`
5. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx`
6. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`
7. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx`
8. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx`
9. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx`

Please read each file, then write your review findings to the output file. For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

Focus on real defects. Do NOT report style preferences.

---

## Assistant

I'll review each file systematically and write findings to the output file.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphToolbar.tsx"}`

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

Now I have all the information I need to write the review. Let me check if the output directory exists.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ 2>/dev/null || echo \"Directory does not exist\"","description":"Check if code reviews directory exists"}`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ux-improvements-review-1.md","content":"# Code Review: UX Improvements\n**Reviewer pass:** 1\n**Files reviewed:** uiStore`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ux-improvements-review-1.md`.

Here is a summary of findings by severity:

**Bugs (2):**

1. `uiStore.ts` lines 50–52: `JSON.parse(localStorage.getItem(...))` is called at module evaluation time with no try/catch. Malformed stored data throws and crashes the entire store module.

2. `AppLayout.tsx` lines 27–33: `layout["graph"]` / `layout["right"]` etc. index a `number[]` array with string keys. `react-resizable-panels` `Layout` type is a positional array, not a panel-id dictionary. All saved panel sizes will be `undefined`, so the persistence feature silently does nothing.

**Should-fix (10):**

3. `uiStore.ts` lines 55–56: `effectiveTheme` is set once at store creation. OS-level theme changes are never reflected when `theme === "system"` — no `prefers-color-scheme` listener.

4. `GraphView.tsx` lines 76–83: `selectNodeRef`/`expandNodeRef` pattern is unnecessary boilerplate; Zustand actions are already stable references.

5. `GraphView.tsx` lines 152–188: Full teardown/rebuild of the Cytoscape graph on every `nodes`/`edges` change — discards all computed positions and re-runs layout from scratch on each incremental update.

6. `GraphView.tsx` lines 208–244: Early-return loading/empty branches omit the `<div ref={containerRef}>`. The Cytoscape init effect has `deps: []` and will not re-run after the data loads, so the canvas never initialises if the first render hits the loading state.

7. `GraphView.tsx` lines 191–206: Highlight effect removes `"highlighted"` class from all elements but does not remove `"labeled"` from previously highlighted edges — labeled state accumulates on edges across selection changes.

8. `GraphToolbar.tsx` lines 28–40: "Filter by type" select logs to console and does nothing — broken UI affordance shipped to users.

9. `AppLayout.tsx` lines 57–79: Toggling `treeOpen` unmounts and remounts `GraphView` (conditional JSX), destroying and recreating the Cytoscape instance and re-running full layout on every toggle.

10. `RelatedNotesFooter.tsx` line 47: `key={i}` (array index) used for list items whose order can change.

11. `App.tsx` lines 23–44: Race condition in event subscription — if the component unmounts before `getAPI()` resolves, the cleanup runs while `unsubscribe` is still `undefined`, resulting in a leaked event listener.

12. `App.tsx` lines 54–83: `useCallback(fn, [])` with `getState()` calls inside will trigger react-hooks lint warnings and is a footgun for future developers.

**Suggestion (1):**

13. `graphStyles.ts` line 20: `any[]` type for `graphStylesheet` — should use the typed Cytoscape stylesheet type.

---

