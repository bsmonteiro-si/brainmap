# 2026-03-15 — Subagent Transcript: general-purpose

**Date:** 2026-03-15 12:22:50
**Agent:** general-purpose
**Agent ID:** a50a69f76b3bf5853
**Parent Session:** 8d73316b-3416-4b53-98d7-9a9a8c8a65ff

---

## User

You are reviewing an implementation plan for BrainMap. Read the plan at `/Users/bsmonteiro/.claude/plans/fluttering-plotting-kazoo.md` and write your review to `/Users/bsmonteiro/.claude/reviews/plans/live-file-tree-updates-review-1.md`.

Here are the review criteria:

---
# Plan Reviewer Agent

You are reviewing an implementation plan for BrainMap, a Rust knowledge graph tool. Your job is to find real problems before code gets written.

## Project Context

- Rust workspace: `crates/core` (library), `crates/cli` (CLI), `crates/tauri-plugin` (desktop)
- Core library owns all data operations; interfaces are thin wrappers
- Files (.md with YAML frontmatter) are source of truth
- In-memory graph + SQLite FTS5 index
- Specs live in `docs/` (vision, data model, CLI spec, MCP spec, desktop, architecture, roadmap)

## What to Review

### 1. Architectural Alignment
- Does the plan respect the existing module boundaries? (parser, graph, index, workspace, config)
- Does it route mutations through `Workspace` as the orchestration layer?
- Does it avoid leaking implementation details across module boundaries?
- Is it consistent with the specs in `docs/`?

### 2. Scope and Complexity
- Is the plan doing more than what was asked? Flag any scope creep.
- Are there simpler alternatives to what's proposed?
- Are abstractions justified or premature? Three similar lines is better than an unnecessary abstraction.
- Does it avoid backwards-compatibility hacks or dead code?

### 3. Edge Cases and Risks
- What failure modes are unhandled? (disk full, concurrent access, invalid UTF-8, path traversal)
- Are there ordering dependencies between steps that aren't called out?
- What happens if the implementation is interrupted halfway?

### 4. Test Strategy
- Does the plan include tests for each new behavior?
- Are edge cases and error paths tested, not just happy paths?
- Do tests verify end state (classic approach), not just mock interactions?

### 5. Data Model Impact
- Do changes to types break serialization compatibility with existing workspaces?
- Are new fields backward-compatible (optional, with defaults)?
- Does the plan account for the seed dataset still passing?

## Output Format

Write your review as a list of findings. For each finding:
- **Category**: one of [architecture, scope, edge-case, testing, data-model, performance, clarity]
- **Severity**: one of [blocker, should-fix, suggestion]
- **Finding**: what the problem is
- **Recommendation**: what to do instead

If you find no issues in a category, skip it. If the plan is solid, say so briefly and explain why.

Do NOT pad your review with praise or filler. Only real findings.
---

Also read the existing code to validate the plan's assumptions:
- Read `crates/app/src-tauri/src/watcher.rs` to verify the helper extraction approach
- Read `crates/app/src-tauri/src/commands.rs` to verify AppHandle injection feasibility
- Read `crates/app/src/stores/graphDiff.ts` to verify the event handling approach
- Read `crates/app/src-tauri/src/handlers.rs` to check `write_raw_note` return type change feasibility
- Check that `ws.graph.edges_for` and `ws.graph.get_node` are actually available as public methods

Write the review to the file path specified above. This is a research/review task - do NOT edit any code files.

---

## Assistant



Let me start by reading the plan and all the relevant source files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/.claude/plans/fluttering-plotting-kazoo.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphDiff.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

Now let me check the public API for `edges_for` and `get_node` on the Graph type.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub fn edges_for\\b","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src","output_mode":"content","-A":2}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub fn get_node\\b","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src","output_mode":"content","-A":2}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub fn reload_file","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src","output_mode":"content","-A":3}`

---

## Assistant

Now let me check the `handle_write_raw_note` return type — the plan mentions changing it to return the diff. Let me verify `reload_file` returns `GraphDiff`.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub struct GraphDiff","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src","output_mode":"content","-A":8}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"with_slot\\b|with_slot_mut\\b","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/state.rs","output_mode":"content","-A":5}`

---

## Assistant

Now let me check what `create_note` and `delete_note` return at the core level — whether they return `GraphDiff` or not.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub fn create_note\\b","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","output_mode":"content","-A":3}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub fn delete_note\\b","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","output_mode":"content","-A":3}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub fn create_link\\b|pub fn delete_link\\b|pub fn update_note\\b","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","output_mode":"content","-A":3}`

---

## Assistant

Let me check the return types of these core methods more precisely.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"-> Result<RelativePath>|-> Result<\\(\\)>|-> Result<GraphDiff>","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","output_mode":"content","-B":2}`

---

## Assistant

This is a key finding. The core `create_note`, `update_note`, `delete_note`, `create_link`, and `delete_link` do NOT return `GraphDiff`. Only `reload_file`, `add_file`, and `remove_file` do. The plan proposes reading back state from the graph after mutation, which is a workable but different approach. Let me check one more thing about multi-segment event handling.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"applyEventToSnapshot","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"workspace-event","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","-B":3,"-A":10}`

---

## Assistant

Now let me check the `WorkspaceEvent` type to understand the current event union.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"WorkspaceEvent","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts","output_mode":"content","-A":20}`

---

## Assistant

Now I have enough information. Let me check one more thing — the locking pattern for the delete pre-collection approach proposed in the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/state.rs","limit":70}`

---

## Assistant

This confirms a critical issue with the plan's delete pattern. The plan shows calling `with_slot` (read) then `with_slot_mut` (write) as separate operations, which means the lock is released between them. Another thread could modify the graph between the edge collection and the deletion.

Now I have all the information needed. Let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/.claude/reviews/plans/live-file-tree-updates-review-1.md","content":"# Plan Review: Live File Tree Updates\n\n## Summary\n\nThe plan addresses a real problem (app-initi`

---

## Assistant

Review written to `/Users/bsmonteiro/.claude/reviews/plans/live-file-tree-updates-review-1.md`.

Key findings:

1. **Blocker**: Race condition in the delete pre-collection pattern -- `with_slot` (read edges) then `with_slot_mut` (delete) releases the lock between calls, allowing another thread to modify the graph. Both operations must happen inside a single `with_slot_mut` call.

2. **Should-fix (5 items)**:
   - `update_note` read-back misses edge changes; should use `reload_file`'s `GraphDiff` instead
   - `delete_folder` folder node cleanup details are incomplete -- pruned folder nodes mid-loop won't be captured
   - Debounce reduction to 500ms tightens the duplicate-event window; edge dedup alone is insufficient, node dedup needed too
   - `create_folder` event emission is not addressed; the `emptyFolders` UIStore mechanism must be preserved
   - No automated tests specified despite 9 manual verification scenarios
   - Multi-segment `workspace_root` routing needs explicit validation

3. **Suggestions**: `write_raw_note` handler change should be more explicit about keeping frontend API unchanged; Tauri event ordering relative to command resolution should be verified to avoid double-updates.

---

