# 2026-03-09 — Subagent Transcript: general-purpose

**Date:** 2026-03-09 17:39:09
**Agent:** general-purpose
**Agent ID:** ab5159277f07590e2
**Parent Session:** 3447398a-4083-473c-b489-02979ab6173d

---

## User

You are a code reviewer for BrainMap, a Rust knowledge graph tool. Review the following changed files for correctness, Rust quality, function design, test coverage, serialization, and performance.

## Review Criteria (from .claude/agents/code-reviewer.md)

### 1. Correctness
- Are there logic bugs? Off-by-one errors? Missed conditions?
- Does error handling cover all failure modes? Are errors propagated, not swallowed?
- Are file system operations safe? (missing parent dirs, path traversal, partial writes)
- Is graph/index state consistent after mutations? (if graph updates but index fails, is state corrupt?)

### 2. Rust Quality
- Ownership and borrowing: unnecessary clones? Lifetime issues masked by `.clone()`?
- Are `unwrap()` / `expect()` used only where the invariant is truly guaranteed?
- Is `String` used where `&str` would suffice?
- Are public APIs using appropriate types? (`&Path` vs `PathBuf`, `&str` vs `String`)

### 3. Function Design
- Is each function doing one thing? Flag functions longer than ~30 lines that could be split.
- Are names descriptive? Does the function name tell you what it does without reading the body?
- Are there if-else chains that should be match expressions or extracted into strategies?

### 4. Test Coverage
- Is every new public function tested?
- Are error paths tested (not just happy paths)?
- Do tests verify behavior (end state) rather than interaction (mock calls)?
- Are test names descriptive of the scenario being tested?
- Is there duplication across tests that should be extracted into helpers?

### 5. Serialization and API Surface
- Do JSON output structures have all fields needed by AI consumers?
- Are `skip_serializing_if` attributes used for optional fields?
- Are field names consistent (snake_case in JSON)?
- Do error responses include enough context for programmatic handling?

### 6. Performance
- Are there O(n^2) loops or repeated full-graph scans that could be O(n)?
- Are large collections cloned unnecessarily?
- Are database queries batched where possible (especially index updates)?

## Output Format

Write your review as a list of findings. For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is, with a code snippet if helpful
- **Fix**: what to do instead, with corrected code if applicable

If a file has no issues, skip it. If the code is solid, say so briefly.

Do NOT report:
- Missing comments or docstrings (the project avoids unnecessary comments by convention)
- Style preferences that don't affect correctness or maintainability
- TODOs or future improvements unless they mask a current bug

## Files to Review

Please read and review these core library files:
1. /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs (new methods: delete_link, move_note, reindex, find_path, get_subgraph)
2. /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/export.rs (new file)
3. /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/config.rs (new methods: add_federation, remove_federation)
4. /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs (new method: edges_for_all)
5. /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/index.rs (new method: remove_edge)

Write your findings to /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/phase2-3-core-review-1.md

---

## Assistant



I'll read all the files to review.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/index.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/error.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/core/src/export.rs","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/core/src/config.rs","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/export.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/config.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs"}`

---

## Assistant

Now I have all the files. Let me write the review.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ 2>/dev/null || echo \"directory does not exist\"","description":"Check if reviews directory exists"}`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/phase2-3-core-review-1.md","content":"# Code Review: Phase 2-3 Core Library Changes\n\n**Reviewer:** code-reviewer agent\`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/phase2-3-core-review-1.md`.

Here is a summary of the findings:

**Bugs (2):**
1. **move_note loses outgoing edges** (workspace.rs:634-666) -- `remove_node` deletes all edges, then the code tries to query them. The edges are already gone, so outgoing edges from the moved note are silently lost.
2. **move_note does not update index edges** (workspace.rs:634-686) -- After `remove_note` deletes edge rows from SQLite, they are never re-added, so `backlinks()` returns stale data after a move.

**Should-fix (5):**
3. **Index edges for referencing notes not updated** during move_note.
4. **export functions use `unwrap()`** on `serde_json::to_string_pretty` instead of returning `Result`.
5. **DOT export doesn't escape node paths** containing `"` or `\`.
6. **GraphML namespace URL is wrong** -- `graphstruct.org` should be `graphdrawing.org`.
7. **`LinkNotFound` error missing `rel` field** -- makes it ambiguous when multiple edge types exist between the same pair.
8. **`index.rebuild` is not transactional** -- interruption after DELETE leaves a partially populated index.

**Suggestions (2):**
9. `EdgeKind` serialized as PascalCase via `Debug` formatting, inconsistent with snake_case convention.
10. `neighbors()` can produce duplicate edges when direction is `Both`.

---

