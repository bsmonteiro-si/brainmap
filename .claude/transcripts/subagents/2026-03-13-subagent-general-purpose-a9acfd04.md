# 2026-03-13 — Subagent Transcript: general-purpose

**Date:** 2026-03-13 19:16:49
**Agent:** general-purpose
**Agent ID:** a9acfd048689ed794
**Parent Session:** 59d90c43-faad-42f0-aa81-c079b9550b2c

---

## User

You are reviewing TypeScript/React code for BrainMap's new "untitled tab" feature. Review the following changed files for correctness, state management bugs, edge cases, and test coverage gaps.

## Review Criteria (adapted from .claude/agents/code-reviewer.md)

### 1. Correctness
- Are there logic bugs? Missed conditions? Race conditions?
- Does error handling cover all failure modes?
- Is state consistent after mutations? (if editor updates but tab store doesn't, is state corrupt?)
- Are there paths where `isUntitledTab` is true but shouldn't be, or vice versa?

### 2. Function Design
- Is each function doing one thing?
- Are names descriptive?

### 3. Test Coverage
- Is every new public function tested?
- Are error paths tested?
- Do tests verify behavior?

### 4. State Management
- Are Zustand store updates atomic where needed?
- Are there stale-state issues (reading state before/after async operations)?
- Are there circular dependency risks?
- Does `snapshotToActiveTab()` work correctly for untitled tabs?

### 5. Edge Cases
- What happens if you create multiple untitled tabs rapidly?
- What happens if Save-As dialog is closed without saving?
- What happens if you switch from untitled to untitled?
- What happens on workspace close with untitled tabs?
- Does auto-save correctly skip untitled tabs?

## Output Format

Write your review to `.claude/reviews/code/untitled-tabs-review-1.md`. For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

## Files to Review

Read each of these files in full and review them:

1. `crates/app/src/stores/tabStore.ts` — New `createUntitledTab`, `isUntitledTab` helper, extended kind union
2. `crates/app/src/stores/editorStore.ts` — New `isUntitledTab` state, `openUntitledTab`, `activateUntitledTab`, modified auto-save skip in `openNote`/`openPlainFile`
3. `crates/app/src/stores/tabActions.ts` — Modified `closeTabAndNavigateNext` for untitled tabs
4. `crates/app/src/stores/uiStore.ts` — New unsaved changes dialog state + save-as fields
5. `crates/app/src/stores/unsavedChangesPrompt.ts` — Promise-based prompt utility (NEW)
6. `crates/app/src/components/Layout/UnsavedChangesDialog.tsx` — 3-button dialog (NEW)
7. `crates/app/src/components/Editor/TabBar.tsx` — "+" button, untitled activate/close routing
8. `crates/app/src/components/Editor/EditorPanel.tsx` — Untitled tab rendering path
9. `crates/app/src/components/Editor/CreateNoteDialog.tsx` — Save-as mode
10. `crates/app/src/App.tsx` — Updated Cmd+N/S/W, beforeunload, UnsavedChangesDialog
11. `crates/app/src/hooks/useAutoSave.ts` — Skip untitled tabs

---

## Assistant



I'll read all the files to review them thoroughly.

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/unsavedChangesPrompt.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/UnsavedChangesDialog.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CreateNoteDialog.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/hooks/useAutoSave.ts"}`

---

## Assistant

Now let me check existing tests for these files to assess coverage gaps.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.test.{ts,tsx}"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.test.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.test.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/hooks/useAutoSave.test.ts"}`

---

## Assistant

Now I have a complete picture. Let me write the review.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ 2>/dev/null || echo \"directory does not exist\"","description":"Check if reviews/code directory exists"}`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/untitled-tabs-review-1.md","content":"# Untitled Tabs Code Review\n\n**Reviewer**: Claude Opus 4.6\n**Date**: 2026-03-13\`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/untitled-tabs-review-1.md`.

Here is a summary of the findings:

**2 bugs:**
1. **Race condition in `openUntitledTab`** (editorStore.ts:249-256): Fire-and-forget `saveNote()` can complete after the clean state is set, overwriting the untitled tab's state with stale values from the old note's save handler. Same issue in `activateUntitledTab`.
2. **Missing `isUntitledTab: false` in existing-tab restore** (editorStore.ts:138): When `openNote` or `openPlainFile` restores an already-open tab, the `isUntitledTab` flag is not cleared. This causes EditorPanel to render the untitled view instead of the note view when switching from an untitled tab to an existing note tab.

**7 should-fix items (code):**
- `unsavedChangesPrompt.ts`: Double-call overwrites the resolver, leaking the first promise forever. Resolve the old one with `"cancel"` first.
- `UnsavedChangesDialog.tsx`: `getTab()` called outside Zustand subscription (not reactive).
- `TabBar.tsx` `handleClose`: Body re-read from editor state after async prompt could reference wrong tab's content.
- `App.tsx` Cmd+W handler: `editor.editedBody` snapshot captured before dialog could be stale.
- Save-As cancel behavior should be documented (tab stays open intentionally).
- `useAutoSave.ts`: Switching between two untitled tabs doesn't clear the debounce timer (both have `null` path).

**6 test coverage gaps (all should-fix):**
- `createUntitledTab` and `isUntitledTab` helper: no tests at all.
- `openUntitledTab` / `activateUntitledTab`: no tests.
- `unsavedChangesPrompt.ts`: no tests.
- `closeTabAndNavigateNext` with untitled tabs: no tests.
- Auto-save skip for untitled tabs: not exercised by existing tests.

---

