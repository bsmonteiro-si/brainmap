# 2026-03-14 — Subagent Transcript: general-purpose

**Date:** 2026-03-14 11:39:49
**Agent:** general-purpose
**Agent ID:** a8038c020e0aa365e
**Parent Session:** f996be33-f69c-4bd8-a579-fbbb56a180c2

---

## User

You are reviewing TypeScript/React code for BrainMap's desktop app. This is a second review pass after fixes were applied. Review the following changed files for the "Raw view mode" feature.

## Changed Files
1. `crates/app/src/stores/editorStore.ts` — Added `rawContent` field, widened `viewMode` type, `setViewMode` fetches raw content, tab restore handles raw mode (with clamp for plain files/untitled tabs), `resolveConflict` refreshes raw content, `markExternalChange` refreshes raw content.
2. `crates/app/src/stores/tabStore.ts` — Widened `viewMode` type in `TabState`.
3. `crates/app/src/components/Editor/EditorPanel.tsx` — Added Raw button (notes only), third view layer with loading placeholder, conditionally hidden metadata/form/footer, NOOP constant for onChange.
4. `crates/app/src/components/Editor/MarkdownEditor.tsx` — Added `readOnly` prop, conditionally excludes editing extensions.
5. `crates/app/src/stores/editorStore.test.ts` — 6 new tests for raw view mode (fetch, error fallback, switching away, clean state, clear, race guard).

Focus on finding bugs and should-fix issues. Write your review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/raw-view-mode-review-1-pass-2.md`.

## Review Criteria
- Correctness: logic bugs, race conditions, missed conditions
- Error handling: all failure modes covered
- Test coverage: are error paths and edge cases tested?

Read each of the 5 changed files fully, then write your review.

---

## Assistant



Let me read all 5 changed files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.test.ts"}`

---

## Assistant

Now let me check one thing — the `snapshotToActiveTab` function doesn't snapshot `rawContent`. Let me verify whether that's intentional by checking if `TabState` includes `rawContent`.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"rawContent","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts","output_mode":"content"}`

---

## Assistant

Good — `rawContent` is intentionally not stored in `TabState` (it's re-fetched on tab restore). Now let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/raw-view-mode-review-1-pass-2.md","content":"# Code Review: Raw View Mode — Pass 2\n\n**Reviewer**: code-reviewer agent\n`

---

## Assistant

The review is complete. Here is the summary:

**Review written to**: `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/raw-view-mode-review-1-pass-2.md`

**Verdict: Pass — no bugs or should-fix issues found.**

Key observations:

1. **Race guards are consistently applied** across all four raw-content fetch sites (`setViewMode`, `openNote` tab restore, `markExternalChange`, `resolveConflict`). Each checks that `viewMode` is still `"raw"` and the active note path hasn't changed before applying the fetched content.

2. **ViewMode clamping** correctly prevents `"raw"` from leaking into plain files (line 233) and untitled tabs (line 318) — both clamp to `"edit"`.

3. **`rawContent` is intentionally excluded from `TabState`** and `snapshotToActiveTab()`, since it's transient and re-fetched on tab restore via the `readPlainFile` call at lines 161-171.

4. **`MarkdownEditor` readOnly prop** correctly excludes history, keymaps, and the update listener, while keeping markdown syntax highlighting and read-only facets.

5. **Test coverage** is solid for the core paths (6 tests). I noted 4 secondary paths that lack direct tests (markExternalChange raw refresh, resolveConflict raw refresh, tab restore raw fetch, tab restore error fallback) but these all follow the same fetch+guard pattern already tested, so the risk is low. Flagged as suggestions only.

---

