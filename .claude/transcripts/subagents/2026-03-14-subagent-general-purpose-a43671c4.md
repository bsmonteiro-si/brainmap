# 2026-03-14 — Subagent Transcript: general-purpose

**Date:** 2026-03-14 16:06:11
**Agent:** general-purpose
**Agent ID:** a43671c4bf0c3b9d7
**Parent Session:** 78937639-c1e4-41c2-9b87-357e7c33b4bf

---

## User

You are reviewing implemented code for BrainMap. Read the review criteria from `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/agents/code-reviewer.md`.

The following files were changed or created for the "Home Note System + 3 New Graph Layouts" feature:

**Modified files:**
1. `crates/app/src/stores/uiStore.ts` — Added `GraphLayout` export, `homeNotePath` field + actions
2. `crates/app/src/components/GraphView/GraphView.tsx` — Expanded `runLayout` with 3 new layout branches, home-node class, rootId passing, "Set as Home Note" context menu
3. `crates/app/src/components/GraphView/GraphToolbar.tsx` — 5-option dropdown, Home button
4. `crates/app/src/components/GraphView/graphStyles.ts` — `node.home-node` style selector
5. `crates/app/src/stores/segmentStateCache.ts` — Added `homeNotePath` to snapshot
6. `crates/app/src/components/Layout/FileTreePanel.tsx` — "Set as Home Note" context menu
7. `crates/app/src/App.tsx` — Added `useHomeAutoFocus` hook

**New files:**
8. `crates/app/src/utils/homeNoteDetect.ts` — Pure `autoDetectHomeNote` function
9. `crates/app/src/hooks/useHomeAutoFocus.ts` — Reactive hook for auto-focus on workspace open
10. `crates/app/src/utils/homeNoteDetect.test.ts` — Tests for autoDetectHomeNote

Read ALL of these files and review them against the criteria in the code-reviewer agent definition. Write your findings to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/home-note-layouts-review-1.md`.

---

## Assistant



I'll start by reading the code reviewer criteria and all the changed files in parallel.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/agents/code-reviewer.md"}`

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphToolbar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStateCache.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/homeNoteDetect.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/hooks/useHomeAutoFocus.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/homeNoteDetect.test.ts"}`

---

## Assistant

Now I have all the files. Let me check one thing in the FileTreePanel context menu — I noticed a potential bug with `close()` vs `onClose()`.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"close\\(\\)","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content"}`

---

## Assistant

Confirmed — `close()` on line 314 is calling `window.close()` instead of `onClose()`. Now let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/home-note-layouts-review-1.md","content":"# Code Review: Home Note System + 3 New Graph Layouts\n\n**Reviewer**: code-rev`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"mkdir -p /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code","description":"Create reviews directory"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cat > /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/home-note-layouts-review-1.md << 'ENDOFFILE'\n# Code Review: Home Note System + 3 New Graph Layouts\n\n**Reviewer**: `

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/home-note-layouts-review-1.md`.

**Summary of findings:**

1. **Bug** -- `FileTreePanel.tsx` line 314: The "Set as Home Note" context menu handler calls `close()` which resolves to `window.close()` instead of the `onClose` prop. The context menu won't dismiss and may attempt to close the browser window.

2. **Should-fix** -- `useHomeAutoFocus.ts`: The hook forces radial layout and graph focus on every workspace open, overriding the user's preferred layout. This is disruptive for users who prefer a different view.

3. **Should-fix** -- `uiStore.ts`: `setHomeNote`/`clearHomeNote` do not call `savePrefs()`, so the user's home note choice is lost on page reload. Every other preference action persists to localStorage.

4. **Suggestion** -- `GraphView.tsx`: Home note clearing on node deletion is a side effect inside the data-sync effect; could be a separate effect for clarity.

5. **Suggestion** -- `GraphView.tsx`: `getRadialRootId` reads store state directly (non-reactive), and the context menu label reads `useUIStore.getState()` during render.

6. **Suggestion** -- No tests for `useHomeAutoFocus` hook (the pure `autoDetectHomeNote` has good coverage with 6 tests).

---

