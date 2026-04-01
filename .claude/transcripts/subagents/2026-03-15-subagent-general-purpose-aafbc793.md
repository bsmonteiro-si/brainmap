# 2026-03-15 — Subagent Transcript: general-purpose

**Date:** 2026-03-15 10:28:46
**Agent:** general-purpose
**Agent ID:** aafbc793e8dad6345
**Parent Session:** d67b2fdb-4b84-4388-9269-8b5152201f3a

---

## User

You are reviewing an implementation plan for BrainMap. Read the plan at `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/drag-drop-file-move.md` and the review criteria below, then write your review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/drag-drop-file-move-review-2.md`.

Focus on: edge cases/risks and test strategy.

Also read these files for context:
- `crates/core/src/workspace.rs` (lines 827-976 for move_note, and also check if there's any existing move_folder or folder-related methods like ensure_folder_nodes, prune_empty_folder_nodes)
- `crates/app/src/components/Layout/FileTreePanel.tsx` (for the file tree rendering patterns)
- `crates/app/src/stores/tabStore.ts` (for tab management)

## Review Criteria (from plan-reviewer agent):

You are reviewing an implementation plan for BrainMap, a Rust knowledge graph tool. Your job is to find real problems before code gets written.

## Project Context

- Rust workspace: `crates/core` (library), `crates/cli` (CLI), `crates/tauri-plugin` (desktop)
- Core library owns all data operations; interfaces are thin wrappers
- Files (.md with YAML frontmatter) are source of truth
- In-memory graph + SQLite FTS5 index
- Specs live in `docs/` (vision, data model, CLI spec, MCP spec, desktop, architecture, roadmap)

## What to Review

### 3. Edge Cases and Risks
- What failure modes are unhandled? (disk full, concurrent access, invalid UTF-8, path traversal)
- Are there ordering dependencies between steps that aren't called out?
- What happens if the implementation is interrupted halfway?

### 4. Test Strategy
- Does the plan include tests for each new behavior?
- Are edge cases and error paths tested, not just happy paths?
- Do tests verify end state (classic approach), not just mock interactions?

## Output Format

Write your review as a list of findings. For each finding:
- **Category**: one of [architecture, scope, edge-case, testing, data-model, performance, clarity]
- **Severity**: one of [blocker, should-fix, suggestion]
- **Finding**: what the problem is
- **Recommendation**: what to do instead

If you find no issues in a category, skip it. If the plan is solid, say so briefly and explain why.

Do NOT pad your review with praise or filler. Only real findings.

---

## Assistant



Let me read the plan and the relevant source files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/drag-drop-file-move.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":827,"limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts"}`

---

## Assistant

Now let me check for existing folder-related methods in workspace.rs to understand the full picture.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"fn ensure_folder_nodes|fn prune_empty_folder_nodes|fn move_folder","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"fs::rename","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","output_mode":"content","-n":true}`

---

## Assistant

Let me check the `move_note` behavior around `fs::rename` for cross-device moves and the internal link rewriting for notes *within* the moved note's own links.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":1044,"limit":100}`

---

## Assistant

Now let me check how the existing `move_note` handles the moved note's own outgoing links (relative paths that need rewriting when the note changes directories).

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":885,"limit":15}`

---

## Assistant

I notice the existing `move_note` does NOT rewrite the moved note's own outgoing relative link targets. Let me verify by checking `compute_relative_target`.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"fn compute_relative_target","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","output_mode":"content","-A":15}`

---

## Assistant

Now I have enough context. Let me also quickly check if the moved note's own outgoing links are rewritten.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":827,"limit":70}`

---

## Assistant

I see that `move_note` does NOT rewrite the moved note's own outgoing link targets when the note changes directories. The note's `link.target` values are relative paths, so moving a note to a different directory would break its own outgoing links. This is a pre-existing bug in `move_note` but it's relevant context for the plan review.

Now let me check the undoStore for current action types.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"kind.*:.*\\\"","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts","output_mode":"content"}`

---

## Assistant

Now I have enough context. Let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/drag-drop-file-move-review-2.md","content":"# Plan Review: Drag-and-Drop File/Folder Moving — Edge Cases & Test Strategy`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/drag-drop-file-move-review-2.md`.

**Summary of findings (10 total):**

- **1 blocker:** The existing `move_note` does not rewrite the moved note's own outgoing relative link targets. Moving a note to a different directory silently breaks all its outgoing links. The proposed `move_folder` has the same gap for notes inside the folder that link outside it. This must be fixed before or during implementation.

- **4 should-fix:**
  - `move_folder` partial failure (rename succeeds, backlink rewrite fails) leaves inconsistent state — needs a recovery strategy
  - Undo for move operations stores no content snapshots, making it fragile if notes change between move and undo
  - Race condition between debounced auto-save and move execution
  - Test strategy missing several edge cases: dirty tabs, active note moves, nested subfolder moves, prefix-collision in `renamePathPrefix`, undo after target path changes

- **4 suggestions:**
  - `fs::rename` cross-filesystem limitation
  - DnD during fuzzy filter edge cases
  - `segmentStateCache` not addressed for path renames
  - No integration-level Vitest test for the full `executeMoveNote`/`executeMoveFolder` flow (only manual testing planned)

---

