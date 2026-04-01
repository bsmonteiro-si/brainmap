# 2026-03-28 — Subagent Transcript: general-purpose

**Date:** 2026-03-28 15:32:14
**Agent:** general-purpose
**Agent ID:** a06eda667504d7a37
**Parent Session:** 9b3ab126-4240-4bd6-9a5a-d03c3e8a95d8

---

## User

Review the following code changes for the BrainMap E2E test infrastructure. Focus on correctness, error handling, and robustness. Write your review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/e2e-infrastructure-review-1.md`.

## Changed files to review:
1. `crates/app/src-tauri/src/lib.rs` — socket path parameterization via env var
2. `crates/app/vite.config.ts` — port parameterization via env var  
3. `tests/e2e/client.ts` — socket client for test runner
4. `tests/e2e/setup.ts` — globalSetup/globalTeardown lifecycle
5. `tests/e2e/helpers.ts` — DOM interaction helpers
6. `tests/e2e/connect.ts` — shared client connector for test files
7. `tests/e2e/file-tree.spec.ts` — first E2E test
8. `tests/e2e/vitest.config.ts` — vitest config
9. `tests/e2e/package.json` — dependencies
10. `tests/e2e/tsconfig.json` — TypeScript config

Read all these files and review them. The code reviewer criteria:

### 1. Correctness
- Are there logic bugs? Missed conditions?
- Does error handling cover all failure modes? Are errors propagated, not swallowed?
- Are file system operations safe?

### 2. Function Design
- Is each function doing one thing?
- Are names descriptive?

### 3. Test Coverage
- Do tests verify behavior (end state) rather than interaction?
- Are test names descriptive?

### 4. Performance / Robustness
- Are there race conditions?
- Is process cleanup reliable?
- Could timeouts cause flaky tests?

### Output Format
For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

Do NOT report: missing comments, style preferences, TODOs.

---

## Assistant



I'll read all the files first, then write the review.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/vite.config.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/tests/e2e/client.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/tests/e2e/setup.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/tests/e2e/helpers.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/tests/e2e/connect.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/tests/e2e/file-tree.spec.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/tests/e2e/vitest.config.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/tests/e2e/package.json"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/tests/e2e/tsconfig.json"}`

---

## Assistant

Now let me check the `cleanStaleFiles` function more carefully and look at how `isFolderExpanded` queries the DOM to understand a potential bug.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"tree-children-anim","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","head_limit":20}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"data-tree-path","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","head_limit":20}`

---

## Assistant

Let me check the DOM structure around folders more carefully.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":725,"limit":55}`

---

## Assistant

Good. Now I have a clear picture of the DOM structure. The `isFolderExpanded` helper queries `parent.querySelector('.tree-children-anim')` where parent is `folder.parentElement`. Looking at the DOM: the folder button (`[data-tree-path][data-tree-is-folder="1"]`) is inside a `<div>`, and its sibling is the `.tree-children-anim`. So `folder.parentElement` is the wrapper `<div>`, and `.querySelector('.tree-children-anim')` on it will find the sibling. This is correct.

Now let me also check for the XSS / injection concern in helpers.ts where `folderPath` is interpolated into template strings.

Now I have enough information to write the review.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ 2>/dev/null || echo \"dir does not exist\"","description":"Check if reviews/code directory exists"}`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/e2e-infrastructure-review-1.md","content":"# E2E Infrastructure Code Review\n\n**Reviewer**: code-reviewer agent\n**Date*`

---

## Assistant

The review has been written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/e2e-infrastructure-review-1.md`.

**Summary of findings** (1 bug, 5 should-fix, 4 suggestion):

**Bug:**
- **helpers.ts** -- JS injection via unsanitized path interpolation in `clickFolder`, `isFolderExpanded`, `clickFile`. Paths with double-quotes or backslashes will break the generated JS or cause unintended behavior.

**Should-fix:**
- **client.ts** -- `handleData` silently drops JSON parse errors on complete lines instead of reporting them, causing misleading timeout errors.
- **client.ts** -- FIFO fallback in response matching can misroute unsolicited server messages to unrelated pending requests.
- **client.ts** -- Timeout timers in `send()` are never cleared on success, accumulating stale callbacks.
- **file-tree.spec.ts** -- "collapse folder" test depends on "expand folder" test having run first, making it non-isolated.
- **setup.ts** -- `cleanStaleFiles` deletes all `brainmap-mcp-test-*.sock` files regardless of whether the owning process is still alive, breaking concurrent runs.

**Suggestions:**
- Socket error handler in `connect()` doesn't propagate post-connection errors to pending requests.
- SIGKILL fallback in `killTauriProcess` won't fire during `process.exit()` since Node doesn't run timers after exit.
- `getVisibleTreeItems` double-parses JSON unnecessarily.
- No `afterAll` cleanup of the shared socket connection.

---

