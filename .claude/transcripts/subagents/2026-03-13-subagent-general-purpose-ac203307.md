# 2026-03-13 — Subagent Transcript: general-purpose

**Date:** 2026-03-13 11:40:54
**Agent:** general-purpose
**Agent ID:** ac203307bf2d841f6
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

## What to Review

### 1. Architectural Alignment
- Does the plan respect the existing module boundaries? (parser, graph, index, workspace, config)
- Does it route mutations through `Workspace` as the orchestration layer?
- Does it avoid leaking implementation details across module boundaries?
- Is it consistent with the specs in `docs/`?

### 2. Scope and Complexity
- Is the plan doing more than what was asked? Flag any scope creep.
- Are there simpler alternatives to what's proposed?
- Are abstractions justified or premature?
- Does it avoid backwards-compatibility hacks or dead code?

### 3. Edge Cases and Risks
- What failure modes are unhandled?
- Are there ordering dependencies between steps that aren't called out?
- What happens if the implementation is interrupted halfway?

### 4. Test Strategy
- Does the plan include tests for each new behavior?
- Are edge cases and error paths tested, not just happy paths?

### 5. Data Model Impact
- Do changes to types break serialization compatibility?
- Are new fields backward-compatible?
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

Here is the plan to review:

# Virtual Folder Nodes in the Knowledge Graph

Folders become first-class `NodeData` entries (`note_type: "folder"`) auto-generated from directory structure. `contains` edges connect folders to their direct children (notes and subfolders). Replaces current `compute_implicit_edges` system.

## Phase 1: Core Library

### Step 1: `model.rs` — Add folder helpers
- `NodeData::is_folder(&self) -> bool` — checks `note_type == "folder"`
- `pub fn humanize_folder_name(dir_name: &str) -> String` — title-cases directory basename

### Step 2: `graph.rs` — Replace implicit edge system
- Remove `compute_implicit_edges()` and `find_nearest_ancestor_node()` (lines 289-351)
- Add `compute_folder_hierarchy(notes: &HashMap<RelativePath, NodeData>) -> (Vec<NodeData>, Vec<Edge>)`:
  1. Collect unique directory paths from all note paths (walk parents up to root, excluding root)
  2. Create `NodeData { title: humanize(basename), note_type: "folder", tags: vec![], path }` for each dir
  3. Create `contains` edge from direct parent dir → each note
  4. Create `contains` edge from parent dir → each child dir
  5. All edges `kind: EdgeKind::Implicit`

### Step 3: `workspace.rs` — Integrate folder nodes into `load_from_root` (line 194)
- Replace `compute_implicit_edges(&node_data, &all_edges)` with `compute_folder_hierarchy(&node_data)`
- Add folder nodes to graph via `graph.add_node()`
- Add `folder_paths: HashSet<RelativePath>` field to `Workspace`

### Step 4: `workspace.rs` — Loosen link validation
- `create_link` (line 483): change `!self.notes.contains_key(&target)` to also accept `self.graph.get_node(&target).is_some()` for folder targets
- `validate` (line 256): same — don't report folder-targeted links as broken
- Source of a link must still be a note (not a folder)

### Step 5: `workspace.rs` — Update incremental ops
- `add_file`: after adding note, call `ensure_folder_nodes(note_path)` — creates missing ancestor folder nodes + `contains` edges
- `remove_file`: after removing note, call `prune_empty_folder_nodes(parent_dir)` — removes folder nodes with zero children
- `reload_file`: no folder changes needed
- `move_note`: prune old parent, ensure new parent; update `contains` edges

### Step 6: Guard rails — no changes needed for orphan_nodes, stats, read/update/delete_note

## Phase 2: CLI
- `node list`: add `Workspace::list_all_graph_nodes()` so `--type folder` works
- `node show`: fallback to graph-level NodeData for folder paths
- `link create`: works automatically
- `neighbors`/`subgraph`: work automatically

## Phase 3: MCP
- `node_show`: same fallback for folder paths
- `node_list`: use `list_all_graph_nodes`

## Phase 4: Desktop App Frontend
- `graphStyles.ts`: add folder type color/shape
- `GraphView.tsx`: folder node click → graph focus instead of editor
- `graphFocusFilter.ts`: include folder node in focus subgraph
- `FileTreePanel.tsx`: skip folder-type nodes in buildTree
- `LinksEditor.tsx`: folder nodes in autocomplete
- `handlers.rs` (get_node_summary): synthesize NodeSummaryDto for folder nodes
- `GraphLegend.tsx`: automatic via styles map

## Edge Cases
- Root directory: NOT a folder node
- Empty folders: no folder node until a note exists
- Path collision: `Concepts.md` vs `Concepts/` — `.md` suffix distinguishes
- Notes at root level: no parent folder node, top-level orphans unless linked
- Existing index notes (e.g., `Topic/Topic.md`): coexist with folder node `Topic`

---

Read the relevant source files to verify the plan's claims about current code structure. Focus on:
1. `crates/core/src/graph.rs` — the implicit edge system being replaced
2. `crates/core/src/workspace.rs` — load_from_root, create_link, validate, incremental ops
3. `crates/core/src/model.rs` — NodeData, Edge, GraphDiff
4. Any CLI/MCP command files that handle node_show, node_list, link_create

Write your review to `.claude/reviews/plans/folder-nodes-review-1.md`.

---

## Assistant



I'll read the relevant source files to verify the plan's claims before writing my review.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs"}`

---

## Assistant

Now let me check the CLI and MCP command files that handle node_show, node_list, and link_create.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/cli/src/commands/*.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/mcp/src/tools/*.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/node.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/tools/node.rs"}`

---

## Assistant

Now let me check the Tauri handlers to understand the desktop app integration points.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"get_node_summary|list_all|node_show","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"graphFocusFilter|buildTree|FileTreePanel","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

You've hit your limit · resets 3pm (America/Sao_Paulo)

---

