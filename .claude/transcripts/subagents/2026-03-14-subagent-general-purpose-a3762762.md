# 2026-03-14 — Subagent Transcript: general-purpose

**Date:** 2026-03-14 11:54:02
**Agent:** general-purpose
**Agent ID:** a37627620ed57d45f
**Parent Session:** f996be33-f69c-4bd8-a579-fbbb56a180c2

---

## User

You are reviewing code for BrainMap's desktop app. Review the changed files for the "Editable Raw view mode" feature. Focus on finding bugs and should-fix issues.

## Changed Files
1. `crates/app/src-tauri/src/handlers.rs` — New `handle_write_raw_note` function
2. `crates/app/src-tauri/src/commands.rs` — New `write_raw_note` Tauri command
3. `crates/app/src-tauri/src/lib.rs` — Registered new command
4. `crates/app/src/api/types.ts` — Added `writeRawNote` to API interface
5. `crates/app/src/api/tauri.ts` — Implemented `writeRawNote`
6. `crates/app/src/api/mock/index.ts` — Mock `writeRawNote`
7. `crates/app/src/stores/editorStore.ts` — Added `_rawDirty`, `updateRawContent`, raw save path in `saveNote`, auto-save-before-mode-switch in `setViewMode`
8. `crates/app/src/components/Editor/EditorPanel.tsx` — Removed `readOnly`, wired `onChange` to `updateRawContent`
9. `crates/app/src/stores/editorStore.test.ts` — 3 new tests for editable raw mode

## Review Criteria
- Correctness: logic bugs, race conditions, missed conditions
- Rust: ownership, error handling, safety
- Test coverage: error paths and edge cases

Read each file fully, then write your review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/editable-raw-view-mode-review-1.md`.

Here are the review criteria from the code-reviewer agent definition:

### 1. Correctness
- Are there logic bugs? Off-by-one errors? Missed conditions?
- Does error handling cover all failure modes? Are errors propagated, not swallowed?
- Are file system operations safe? (missing parent dirs, path traversal, partial writes)
- Is graph/index state consistent after mutations?

### 2. Rust Quality
- Ownership and borrowing: unnecessary clones? Lifetime issues masked by `.clone()`?
- Are `unwrap()` / `expect()` used only where the invariant is truly guaranteed?
- Is `String` used where `&str` would suffice?
- Are public APIs using appropriate types?

### 3. Function Design
- Is each function doing one thing?
- Are names descriptive?

### 4. Test Coverage
- Is every new public function tested?
- Are error paths tested?
- Do tests verify behavior (end state) rather than interaction (mock calls)?

### 5. Performance
- Are there O(n^2) loops or repeated full-graph scans?
- Are large collections cloned unnecessarily?

---

## Assistant



I'll read all the changed files to review them thoroughly.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.test.ts"}`

---

## Assistant

Now let me check how `reload_file` works in the core to understand the full save path.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub fn reload_file","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core","output_mode":"content","-A":15}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"fn snapshotToActiveTab","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","-A":5}`

---

## Assistant

Now let me check the `handle_write_raw_note` function more carefully — specifically, whether it validates that the path is actually a managed note.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"_rawDirty","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","-C":2}`

---

## Assistant

Now I have a thorough understanding of all the changes. Let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/editable-raw-view-mode-review-1.md","content":"# Code Review: Editable Raw View Mode\n\n**Reviewer**: code-reviewer agent`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/editable-raw-view-mode-review-1.md`.

**Summary of findings:**

3 **should-fix** issues found:

1. **`handle_write_raw_note` has no guard against non-BrainMap files** (handlers.rs:373). Unlike `handle_write_plain_file` which rejects managed notes, the inverse check is missing -- a non-note file could be written and then parsed by `reload_file`, inadvertently adding it to the graph. Add a `ws.notes.contains_key()` check.

2. **`setViewMode` auto-save uses `.then()` with no `.catch()`** (editorStore.ts:660-674). If `saveNote()` rejects during a mode switch, the `.then(doSwitch)` never fires, leaving the user stuck in the old mode with no error feedback.

3. **`snapshotToActiveTab` does not snapshot `rawContent` or `_rawDirty`** (editorStore.ts:54-71). Switching tabs while in raw mode with unsaved raw edits silently discards those edits because neither field is persisted to the tab store.

3 **suggestion** items: mock `writeRawNote` is a no-op, no test for the auto-save-before-mode-switch flow, and the raw mode editor lacks scroll/cursor restore props.

---

