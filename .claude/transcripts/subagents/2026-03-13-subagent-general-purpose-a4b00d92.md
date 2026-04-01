# 2026-03-13 — Subagent Transcript: general-purpose

**Date:** 2026-03-13 16:31:16
**Agent:** general-purpose
**Agent ID:** a4b00d9285672f936
**Parent Session:** 966e73ee-9a78-4015-a411-135de7bdb843

---

## User

You are reviewing TypeScript code changes for BrainMap's desktop app. Your job is to find real defects, not style nits.

## What to Review
1. **Correctness** - Logic bugs? Missed conditions? Edge cases?
2. **Function Design** - Single responsibility? Descriptive names?
3. **Test Coverage** - Public functions tested? Error paths tested?
4. **Performance** - Unnecessary overhead?

## Output Format
Write review findings to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/fm-undo-review-1.md`. For each finding: File, Severity (bug/should-fix/suggestion), Finding, Fix. If code is solid, say so briefly.

## Changed Files

Read these two files fully:
1. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts`
2. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx`
3. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.test.ts`

## Summary of Changes

### editorStore.ts
- Added `FmSnapshot` type, `MAX_FM_UNDO=50`, `FM_GROUP_MS=300` constants
- Added state: `fmUndoStack`, `fmRedoStack`, `_lastFmField`, `_lastFmTime`
- Modified `updateFrontmatter`: snapshots previous state to undo stack before applying, groups consecutive same-field edits within 300ms, clears redo stack
- Added `undoFrontmatter()`: pops undo stack, pushes current to redo, restores previous state, computes isDirty based on whether frontmatter and body are still edited
- Added `redoFrontmatter()`: pops redo stack, pushes current to undo, applies next state
- Cleared stacks in: `openNote`, `openPlainFile`, `resolveConflict("accept-theirs")`, `clear()`

### App.tsx
- Removed the `isFormField`/`FORM_TAGS` helper (from a prior partial fix)
- Updated Cmd+Z handler: if target is inside `.frontmatter-form`, calls `editorStore.undoFrontmatter()`; else if not in `.cm-editor`, calls `undoStore.undo()`
- Updated Cmd+Y/Shift+Z handler: same routing pattern for redo

### editorStore.test.ts
- 11 new tests covering: undo restores state, redo re-applies, same-field grouping, different-field no-grouping, empty stack no-ops, new edit clears redo, stacks clear on openNote/clear, isDirty tracking with/without body edits

---

## Assistant



Let me read the three files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.test.ts"}`

---

## Assistant

Now let me check if the `.frontmatter-form` CSS class actually exists on the form component.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"frontmatter-form","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"saveNote","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"frontmatter-form","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx","output_mode":"content","-C":2}`

---

## Assistant

Good, the class exists. Now let me check one more thing about the Cmd+Z / Cmd+Shift+Z logic for potential double-firing.

The `e.key === "z" && !e.shiftKey` check on line 107 and `e.key === "z" && e.shiftKey` on line 118 are mutually exclusive, so no double-fire issue.

Let me also check if `saveNote` clears the fm undo/redo stacks (it shouldn't, but worth verifying the interaction).

Looking at `saveNote` (line 195-282): it does NOT clear `fmUndoStack`/`fmRedoStack`. That's correct -- saving shouldn't destroy undo history.

Now let me check a potential issue: when `undoFrontmatter` restores `prev` which is `null`, and `editedBody` is also `null`, it sets `isDirty: false`. But what if there was a non-null `editedFrontmatter` with only partial fields that matched the original note? The `isDirty` logic uses `prev !== null` as a proxy, which is correct because `null` means "no edits" in this store's convention.

One thing I want to verify: the `fmRedoStack` can grow unbounded in redo. Let me check... `redoFrontmatter` pushes to `fmUndoStack` which is bounded in `updateFrontmatter` but not in `redoFrontmatter`. However, the redo stack can only be as large as the undo stack was, so it's implicitly bounded by MAX_FM_UNDO. OK, that's fine.

Let me check one subtle issue: in `undoFrontmatter`, `editedFrontmatter` (the current state) gets pushed to `fmRedoStack`. If `editedFrontmatter` is `null` (which shouldn't happen if there's undo history, but could if state was manually set), it pushes `null` to redo. That's fine since the type allows it.

Now let me write the review.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ 2>/dev/null || echo \"directory does not exist\"","description":"Check if review output directory exists"}`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/fm-undo-review-1.md","content":"# Code Review: Frontmatter Undo/Redo\n\n**Files reviewed:**\n- `crates/app/src/stores/edi`

---

## Assistant

The review is complete. Here is the summary:

**Review written to:** `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/fm-undo-review-1.md`

**Verdict: No bugs or should-fix issues found.** The implementation is solid across all three files.

Key observations:
- **editorStore.ts**: Undo/redo logic is correct. Stack clearing on `openNote`, `openPlainFile`, `resolveConflict("accept-theirs")`, and `clear()` is thorough. Same-field grouping within 300ms works as designed. `isDirty` properly accounts for both `editedFrontmatter` and `editedBody`.
- **App.tsx**: Keyboard routing correctly distinguishes three zones: `.frontmatter-form` (frontmatter undo/redo), `.cm-editor` (let CodeMirror handle it), everything else (file-op undo/redo). The conditions are mutually exclusive with no double-fire risk.
- **editorStore.test.ts**: 11 well-targeted tests covering restore, redo, grouping, no-grouping, empty-stack no-ops, redo clearing, stack clearing on navigation/clear, and isDirty tracking with/without body edits.

Four suggestions were noted (not blocking): test coverage for undo-after-save interaction, test for MAX_FM_UNDO cap enforcement, and two minor observations about stack size that are non-issues in practice.

---

