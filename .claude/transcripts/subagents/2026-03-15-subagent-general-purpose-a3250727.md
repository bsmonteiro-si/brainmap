# 2026-03-15 — Subagent Transcript: general-purpose

**Date:** 2026-03-15 10:28:11
**Agent:** general-purpose
**Agent ID:** a3250727faf435bf9
**Parent Session:** d67b2fdb-4b84-4388-9269-8b5152201f3a

---

## User

You are reviewing an implementation plan for BrainMap. Read the plan at `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/drag-drop-file-move.md` and the review criteria below, then write your review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/drag-drop-file-move-review-1.md`.

Focus on: architecture alignment, scope/complexity, and data model impact.

Also read these files for context:
- `crates/core/src/workspace.rs` (lines 827-976 for move_note)
- `crates/app/src-tauri/src/commands.rs` (for existing command patterns)
- `crates/app/src/api/types.ts` (for API interface)
- `crates/app/src/stores/undoStore.ts` (for undo patterns)

## Review Criteria (from plan-reviewer agent):

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

### 3. Data Model Impact
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

## Assistant



Let me read the plan and the context files.

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts"}`

---

## Assistant

Now let me check a few more things for context on `move_folder` feasibility and the file watcher pattern.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"register_expected_write","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"fs::rename","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","output_mode":"content"}`

---

## Assistant

Now I have enough context to write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/drag-drop-file-move-review-1.md","content":"# Plan Review: Drag-and-Drop File/Folder Moving\n\n**Reviewer focus:** Archi`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/drag-drop-file-move-review-1.md`.

**Summary of findings:**

5 **should-fix** findings:

1. **`move_folder` complexity** -- The proposed monolithic method duplicates `move_note`'s edge surgery logic. Recommend iterating over `move_note` internals instead, or at minimum specifying error recovery for partial failures.

2. **`fs::rename` cross-mount-point failure** -- Directory rename can fail with `EXDEV` across filesystems. Need validation or fallback, plus `create_dir_all` for the target parent.

3. **Expected writes registration for `move_note`** -- The Tauri command can't know which notes will have backlinks rewritten until `move_note` runs, but expected writes must be registered before calling it to avoid file watcher races.

4. **Undo safety for moves** -- Reverse-move undo assumes the original path is still available and the note hasn't changed. No protection against `DuplicatePath` conflicts or concurrent modifications.

5. **Expected writes registration for `move_folder`** -- Same watcher-race problem as #3, but amplified because folder moves rewrite backlinks in external notes.

3 **suggestion** findings:

- No data model changes (good, no compatibility concerns).
- Pure functions (`computeNewPath`, `isValidDrop`) should be in a utility file, not in the component.
- Auto-expand timer needs cleanup on drag cancel and unmount.

---

