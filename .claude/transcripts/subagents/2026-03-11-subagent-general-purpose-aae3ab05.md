# 2026-03-11 — Subagent Transcript: general-purpose

**Date:** 2026-03-11 19:30:06
**Agent:** general-purpose
**Agent ID:** aae3ab05a2b035089
**Parent Session:** cac98a5e-bb31-4585-8135-4876e33d5c71

---

## User

You are reviewing code changes for BrainMap's editable frontmatter feature. The changes are in TypeScript/React (not Rust). Review the following changed files:

1. `crates/app/src/stores/editorStore.ts` — Extended with `editedFrontmatter`, `updateFrontmatter`, `savingInProgress`, updated `saveNote` 
2. `crates/app/src/components/Editor/FrontmatterForm.tsx` — Rewritten from read-only to editable
3. `crates/app/src/components/Editor/TagInput.tsx` — New tag pills component
4. `crates/app/src/components/Editor/ExtraFieldsEditor.tsx` — New extra fields key-value editor
5. `crates/app/src/components/Editor/EditorPanel.tsx` — Updated header with effective title + dirty dot
6. `crates/app/src/api/mock/index.ts` — Changed `Object.assign(note.extra, params.extra)` to `note.extra = params.extra`
7. `crates/app/src/App.css` — New styles for tags, extra fields, textarea, dirty dot
8. `crates/app/src/stores/editorStore.test.ts` — 11 new tests
9. `crates/app/src/components/Editor/TagInput.test.tsx` — 7 new tests
10. `crates/app/src/components/Editor/ExtraFieldsEditor.test.tsx` — 5 new tests

Read ALL of these files and review them against these criteria (adapted from the project's code review agent):

### 1. Correctness
- Logic bugs? Missed conditions? Are error states handled?
- Is the state management correct? (Zustand patterns, dirty state, save flow)
- Are there race conditions in the async save flow?

### 2. Code Quality
- Component decomposition — are components doing one thing?
- Are there unnecessary re-renders from Zustand selectors?
- Are there edge cases in the TagInput (duplicate handling, empty input)?

### 3. Test Coverage
- Is every new behavior tested?
- Are error/edge cases covered?
- Do tests verify behavior, not just interaction?

### 4. API Surface
- Does the `updateNote` call send the correct shape?
- Is the MockBridge consistent with the real Tauri bridge?
- Is the `extra` field replacement/merge semantics correct?

Write your review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/editable-frontmatter-review-1.md`.

For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

---

## Assistant



I'll read all the changed files first.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TagInput.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ExtraFieldsEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.test.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TagInput.test.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ExtraFieldsEditor.test.tsx"}`

---

## Assistant

Now let me check the `NoteDetail` type to understand the API contract.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"interface NoteDetail|type NoteDetail","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api","output_mode":"content","-A":15}`

---

## Assistant

Now I have all the information needed. Let me write the review.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"mkdir -p /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code","description":"Create reviews directory"}`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/editable-frontmatter-review-1.md","content":"# Code Review: Editable Frontmatter Feature\n\n**Reviewer**: code-reviewer a`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/editable-frontmatter-review-1.md`.

**Summary of findings (2 bugs, 4 should-fix, 5 suggestions):**

**Bugs:**
1. **Race condition in `saveNote`** (editorStore.ts:64-113): If the user edits while a save is in flight, the post-save reset unconditionally clears `editedFrontmatter`/`editedBody`, silently discarding those concurrent edits.
2. **CSS variable typo** (App.css:413): `.editor-dirty-dot` references `--accent-color` but the theme only defines `--accent`. Always falls back to hardcoded `#58a6ff`.

**Should-fix:**
1. **Whitespace-only title passes validation** (editorStore.ts:70) -- only empty string `""` is blocked, not `"   "`.
2. **ExtraFieldsEditor loses type information** (ExtraFieldsEditor.tsx:19-21) -- editing a numeric or object value silently converts it to a string.
3. **Extra fields section hidden when `extra` is empty** (FrontmatterForm.tsx:115-123) -- users cannot add the first extra field on notes that have none.
4. **No test for save failure path** (editorStore.test.ts) -- the catch branch preserving dirty state is untested.

**Suggestions:** False-dirty on no-op edits, TagInput `onBlur` untested, Zustand selector batching, `key={tag}` note, `status: null` semantics (all confirmed acceptable as-is).

---

