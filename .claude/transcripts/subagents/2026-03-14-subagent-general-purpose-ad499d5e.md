# 2026-03-14 — Subagent Transcript: general-purpose

**Date:** 2026-03-14 11:37:08
**Agent:** general-purpose
**Agent ID:** ad499d5e1e15dcfdb
**Parent Session:** f996be33-f69c-4bd8-a579-fbbb56a180c2

---

## User

You are reviewing TypeScript/React code for BrainMap's desktop app. Review the following changed files for the "Raw view mode" feature. Your job is to find real defects, not style nits.

## Changed Files
1. `crates/app/src/stores/editorStore.ts` — Added `rawContent` field, widened `viewMode` type to include `"raw"`, updated `setViewMode` to fetch raw content, updated tab restore and `markExternalChange`.
2. `crates/app/src/stores/tabStore.ts` — Widened `viewMode` type in `TabState`.
3. `crates/app/src/components/Editor/EditorPanel.tsx` — Added Raw button, third view layer, conditionally hidden metadata/form/footer in raw mode.
4. `crates/app/src/components/Editor/MarkdownEditor.tsx` — Added `readOnly` prop that conditionally excludes editing extensions.

## Review Criteria

### 1. Correctness
- Are there logic bugs? Missed conditions? Race conditions in async operations?
- Does error handling cover all failure modes? Are errors propagated, not swallowed?
- Is state consistent after mutations?

### 2. Function Design
- Is each function doing one thing?
- Are names descriptive?

### 3. Test Coverage
- Is every new public function tested?
- Are error paths tested?

### 4. Performance
- Are there unnecessary re-renders or redundant API calls?

## Output Format

Write your review as a list of findings. For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

Read each of the 4 changed files fully, then write your review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/raw-view-mode-review-1.md`.

---

## Assistant



Let me read all four changed files.

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

Now let me check if `rawContent` is snapshotted to the tab store, and look at how the `openPlainFile` restore path handles `rawContent`.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ 2>/dev/null || echo \"directory does not exist\"","description":"Check if review output directory exists"}`

---

## Assistant

Now I have a thorough understanding of the code. Let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/raw-view-mode-review-1.md","content":"# Code Review: Raw View Mode\n\n## Findings\n\n### 1. Raw content sync replaces doc`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/raw-view-mode-review-1.md`.

Summary of findings:

- **2 bugs**: (1) Tab restore for plain files/untitled tabs can restore `viewMode: "raw"` which has no UI escape hatch and no rendered raw layer. (2) Finding #1 was downgraded on further analysis.
- **3 should-fix**: (1) `rawContent` not cleared/refreshed in `resolveConflict("accept-theirs")` -- stale raw content shown after accepting external changes. (2) Inline `() => {}` on every render for the raw editor's `onChange`. (3) No test coverage for any of the new raw-mode async flows.
- **2 suggestions**: `setViewMode("raw")` silently no-ops for plain files (defensive, not user-facing). Content sync effect on read-only editor is fine but noted.

The most impactful real defect is **finding #3** (`resolveConflict` not refreshing raw content) -- this is a user-visible bug where accepting external changes in raw mode leaves stale content displayed.

---

