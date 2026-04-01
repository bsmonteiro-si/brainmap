# 2026-03-12 — Subagent Transcript: general-purpose

**Date:** 2026-03-12 10:46:39
**Agent:** general-purpose
**Agent ID:** acc7a835cb834f79e
**Parent Session:** 56bb6357-3423-41a2-b2e2-da48db9200fc

---

## User

You are reviewing TypeScript/React code for BrainMap's new editor formatting toolbar feature. Review the following changed files for real defects. This is a frontend feature (not Rust), so adapt the review criteria accordingly for TypeScript/React code quality.

## Review Criteria (adapted from the project's code reviewer)

### 1. Correctness
- Are there logic bugs? Off-by-one errors? Missed conditions?
- Does error handling cover all failure modes?
- Are edge cases handled (empty selections, selections at document boundaries)?

### 2. Code Quality
- Are there unnecessary allocations or re-renders?
- Are types correct and precise?
- Is the component design clean?

### 3. Function Design
- Is each function doing one thing?
- Are names descriptive?

### 4. Test Coverage
- Is every new public function tested?
- Are error paths tested?
- Are test names descriptive?

### 5. Performance
- Are there unnecessary re-renders?
- Are event handlers properly memoized?

## Changed Files to Review

Read these files and review them:
1. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts` (new — formatting logic)
2. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorToolbar.tsx` (new — toolbar component)
3. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx` (modified — added keymap + onViewReady)
4. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx` (modified — wires toolbar)
5. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx` (modified — Cmd+B context-aware)
6. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.test.ts` (new — tests)

## Output Format

Write your review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/editor-toolbar-review-1.md`

For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

If the code is solid, say so briefly.

---

## Assistant



I'll read all the changed files first.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorToolbar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.test.ts"}`

---

## Assistant

Now let me check the `onViewReady` prop handling more carefully and look at how `editorView` state is managed across note switches.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ 2>/dev/null || echo \"directory does not exist\"","description":"Check if reviews directory exists"}`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/editor-toolbar-review-1.md","content":"# Code Review: Editor Formatting Toolbar\n\n**Reviewer**: code-reviewer agent\n**D`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/editor-toolbar-review-1.md`.

**Summary of findings:**

The code is well-structured overall. The toolbar correctly uses `onMouseDown` + `preventDefault` to avoid stealing editor focus, and the `App.tsx` Cmd+B context-awareness (letting CM handle it when the editor is focused) is properly done.

**3 should-fix items:**

1. **`toggleLinePrefix` does not adjust the selection** after adding/removing prefixes (cmFormatting.ts lines 56-86). The cursor stays at its original offset, which now points to different text. Users will notice cursor drift when typing immediately after toggling a list/blockquote.

2. **Numbered list always inserts `1. `** for every line (EditorToolbar.tsx line 31). Multi-line selections all get `1. ` instead of `1.`, `2.`, `3.`. And un-toggling only matches lines starting with exactly `1. `. Needs either a dedicated function or acknowledgment as a known limitation.

3. **Missing test coverage** for edge cases: mixed-prefix multi-line selection, cursor mid-line for `setHeading`, `toggleWrap` at document boundaries, and `insertAtCursor` replacing selected text.

**1 minor should-fix:**

4. **Stale `editorView` reference** during note switches -- the EditorView is destroyed synchronously but `setEditorView(null)` is async. Very narrow race but a defensive guard would be cheap.

**2 suggestions** (non-blocking): `insertAtCursor` only operates on main selection unlike other functions; className concatenation in toolbar could use a helper.

---

