# 2026-03-20 — Subagent Transcript: general-purpose

**Date:** 2026-03-20 10:57:36
**Agent:** general-purpose
**Agent ID:** a62200cb02067d062
**Parent Session:** b1d9eca6-8bb3-4c0b-8673-2c48c1a7ec0b

---

## User

You are reviewing code changes for BrainMap. Read the following changed files and review them using the criteria below. Write your review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/excalidraw-phase1-review-1.md`.

**Changed files to review:**
1. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ExcalidrawEditor.tsx` (NEW - entire file)
2. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts` (kind union widened)
3. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts` (clearForPdfTab → clearForCustomTab rename)
4. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabActions.ts` (added pdf/excalidraw case)
5. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx` (added excalidraw route)
6. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx` (excalidraw in handleActivate/handleClose)
7. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx` (click routing + context menu + new drawing handler)
8. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/fileTreeIcons.tsx` (Pencil icon + excalidraw entry)
9. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx` (Cmd+S and Cmd+W handlers)
10. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` (excalidraw-container styles)

Read all of these files and review them carefully. Focus especially on the new ExcalidrawEditor.tsx component.

## Review Criteria

You are reviewing TypeScript/React code for BrainMap's desktop app. Your job is to find real defects, not style nits.

### 1. Correctness
- Are there logic bugs? Off-by-one errors? Missed conditions?
- Does error handling cover all failure modes? Are errors propagated, not swallowed?
- Is state management correct? (Zustand stores, refs, cleanup effects)
- Are there race conditions? (async operations, unmount during save, stale closures)

### 2. React Quality
- Are hooks used correctly? (deps arrays, cleanup, ref vs state)
- Are there memory leaks? (event listeners, timers not cleaned up)
- Is the component lifecycle correct? (mount, update, unmount)

### 3. Function Design
- Is each function doing one thing?
- Are names descriptive?

### 4. Test Coverage
- Is every new public function tested?
- Are error paths tested?

### 5. Performance
- Are there expensive operations in render path?
- Are callbacks memoized appropriately?

## Output Format

Write your review as a list of findings. For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

If a file has no issues, skip it. If the code is solid, say so briefly.

Do NOT report: missing comments/docstrings, style preferences, TODOs.

---

## Assistant



I'll read all the changed files first.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ExcalidrawEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabActions.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/fileTreeIcons.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Let me read the relevant parts of FileTreePanel and App.css.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"excalidraw","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content","-C":5}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"excalidraw","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":5}`

---

## Assistant

Now let me check a few specific things that could be issues.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pendingSaves","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ExcalidrawEditor.tsx","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"clearForCustomTab|clearForPdfTab","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","-n":true}`

---

## Assistant

Now let me check for a potential issue with the dirty dot in TabBar for excalidraw tabs.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx","offset":246,"limit":5}`

---

## Assistant

Now I have enough information to write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/excalidraw-phase1-review-1.md","content":"# Code Review: Excalidraw Phase 1\n\n**Reviewer**: code-reviewer agent\n**Date*`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/excalidraw-phase1-review-1.md`.

**Summary of findings:**

1. **bug** - `pendingSaves` map entry never cleaned on save failure, leading to stale data persisting and potentially overwriting newer content.
2. **bug** - Active excalidraw tab's dirty dot never shows because TabBar reads `editorStore.isDirty` (always false for custom tabs) instead of `tab.isDirty` from the tab store.
3. **should-fix** - `excalidraw:save` is a global event with no path discrimination; Cmd+W dispatches it AND unmount also saves, causing potential double-save.
4. **should-fix** - Unmount cleanup captures stale `doSave` reference due to suppressed exhaustive-deps lint rule.
5. **should-fix** - `handleNewDrawingHere` calls `openTab` before `clearForCustomTab`, causing the snapshot/auto-save logic in `clearForCustomTab` to operate on the wrong tab ID.
6. **should-fix** - No test coverage for ExcalidrawEditor despite non-trivial save/dirty/event logic.

Files with no issues: tabStore.ts, editorStore.ts, tabActions.ts, EditorPanel.tsx, fileTreeIcons.tsx, App.css.

---

