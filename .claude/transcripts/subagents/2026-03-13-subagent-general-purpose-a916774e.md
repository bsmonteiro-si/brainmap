# 2026-03-13 — Subagent Transcript: general-purpose

**Date:** 2026-03-13 11:40:50
**Agent:** general-purpose
**Agent ID:** a916774e12161ca6d
**Parent Session:** e2adebf4-0599-4c1c-95a6-fa3b9af7f854

---

## User

You are reviewing an implementation plan for BrainMap. Here is the plan reviewer agent definition you must follow:

---
# Plan Reviewer Agent

You are reviewing an implementation plan for BrainMap, a Rust knowledge graph tool. Your job is to find real problems before code gets written.

## Project Context

- Rust workspace: `crates/core` (library), `crates/cli` (CLI), `crates/tauri-plugin` (desktop)
- Core library owns all data operations; interfaces are thin wrappers
- Files (.md with YAML frontmatter) are source of truth
- In-memory graph + SQLite FTS5 index
- Specs live in `docs/` (vision, data model, CLI spec, MCP spec, desktop, architecture, roadmap)

## What to Review — FOCUS ON THESE AREAS

### Edge Cases and Risks
- What failure modes are unhandled?
- Are there ordering dependencies between steps that aren't called out?
- What happens if the implementation is interrupted halfway?
- Concurrent access, path traversal, weird directory names

### Test Strategy
- Does the plan include tests for each new behavior?
- Are edge cases and error paths tested, not just happy paths?
- Do tests verify end state, not just mock interactions?

### Data Model Impact
- Do changes to types break serialization compatibility with existing workspaces?
- Are new fields backward-compatible?
- Does the plan account for the seed dataset still passing?

### Performance
- Any concern with large workspaces?

## Output Format

Write your review as a list of findings. For each finding:
- **Category**: one of [architecture, scope, edge-case, testing, data-model, performance, clarity]
- **Severity**: one of [blocker, should-fix, suggestion]
- **Finding**: what the problem is
- **Recommendation**: what to do instead

Do NOT pad your review with praise or filler. Only real findings.
---

Here is the plan to review:

# Virtual Folder Nodes in the Knowledge Graph

Folders become first-class `NodeData` entries (`note_type: "folder"`) auto-generated from directory structure. `contains` edges connect folders to their direct children (notes and subfolders). Replaces current `compute_implicit_edges` system.

## Phase 1: Core Library

### Step 2: `graph.rs` — Replace implicit edge system
- Remove `compute_implicit_edges()` and `find_nearest_ancestor_node()`
- Add `compute_folder_hierarchy(notes: &HashMap<RelativePath, NodeData>) -> (Vec<NodeData>, Vec<Edge>)`:
  1. Collect unique directory paths from all note paths (walk parents up to root, excluding root)
  2. Create NodeData for each dir with title = humanize(basename), note_type = "folder"
  3. Create `contains` edge from direct parent dir → each note
  4. Create `contains` edge from parent dir → each child dir
  5. All edges `kind: EdgeKind::Implicit`

### Step 3: `workspace.rs` — Integrate into load_from_root
- Add `folder_paths: HashSet<RelativePath>` field to Workspace

### Step 4: Loosen link validation
- `create_link`: accept folder targets via graph.get_node()
- `validate`: don't report folder-targeted links as broken
- Source must still be a note (not a folder)

### Step 5: Update incremental ops
- `add_file`: ensure_folder_nodes for ancestors
- `remove_file`: prune_empty_folder_nodes
- `move_note`: prune old parent, ensure new parent

## Edge Cases
- Root directory: NOT a folder node
- Empty folders: no folder node until a note exists
- Path collision: `Concepts.md` vs `Concepts/` — `.md` suffix distinguishes
- Notes at root level: no parent folder node, top-level orphans unless linked
- Existing index notes (e.g., `Topic/Topic.md`): coexist with folder node `Topic`

---

Read the relevant source files to verify claims. Focus especially on:
1. `crates/core/src/workspace.rs` — incremental ops (add_file, remove_file, move_note), create_link validation
2. `crates/core/src/graph.rs` — the current implicit edge system, orphan detection
3. `crates/core/src/model.rs` — GraphDiff, NodeData serialization
4. `crates/core/tests/` — existing test patterns
5. The seed dataset structure in `seed/`

Write your review to `.claude/reviews/plans/folder-nodes-review-2.md`.

---

## Assistant



I'll start by reading the relevant source files to verify the plan's claims and identify issues.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs"}`

---

## Assistant

You've hit your limit · resets 3pm (America/Sao_Paulo)

---

