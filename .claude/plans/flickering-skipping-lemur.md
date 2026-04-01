# Virtual Folder Nodes in the Knowledge Graph

Folders become first-class `NodeData` entries (`note_type: "folder"`) auto-generated from directory structure. `contains` edges connect folders to their direct children (notes and subfolders). Replaces current `compute_implicit_edges` system.

Research: `.claude/research/linking-notes-to-folders.md`

## Phase 1: Core Library (`crates/core`)

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
- Update existing `graph.rs` unit tests

### Step 3: `workspace.rs` — Integrate folder nodes into `load_from_root` (line 194)
- Replace `compute_implicit_edges(&node_data, &all_edges)` with `compute_folder_hierarchy(&node_data)`
- Add folder nodes to graph via `graph.add_node()`
- No separate `folder_paths` field — use `graph.get_node()` + `is_folder()` to check if a path is a folder node (avoids sync bugs)

### Step 4: `workspace.rs` — Loosen link validation
- `create_link` (line 483): change `!self.notes.contains_key(&target)` to also accept `self.graph.get_node(&target).is_some()` for folder targets
- `validate` (line 256): same — don't report folder-targeted links as broken
- Source of a link must still be a note (not a folder) — folders have no frontmatter to store links in

### Step 5: `workspace.rs` — Update incremental ops
- `add_file`: after adding note, call `ensure_folder_nodes(note_path)` — creates any missing ancestor folder nodes + `contains` edges; returns additions in `GraphDiff`
- `remove_file`: after removing note, call `prune_empty_folder_nodes(parent_dir)` — removes folder nodes with zero children; returns removals in `GraphDiff`
- `reload_file`: no folder changes needed (note stays in same directory)
- `move_note`: remove old folder→note `contains` edge, add new folder→note `contains` edge, prune old parent if empty, ensure new parent exists
- Helper methods: `ensure_folder_nodes(&mut self, path) -> (Vec<NodeData>, Vec<Edge>)`, `prune_empty_folder_nodes(&mut self, dir) -> (Vec<RelativePath>, Vec<Edge>)`
- Test `compute_relative_target` with folder paths (no `.md` extension) — should still produce correct relative paths

### Step 6: Guard rails
- `orphan_nodes()` in `graph.rs` (line 201): folder nodes always have edges, so they won't appear as orphans naturally — no change needed
- `stats()` in `graph.rs` (line 219): folder nodes count under `"folder"` type automatically — no change needed
- `read_note`, `update_note`, `delete_note`: gate on `self.notes` which excludes folder nodes — no change needed

## Phase 2: CLI (`crates/cli`)

- `node list`: add `Workspace::list_all_graph_nodes()` method wrapping `self.graph.all_nodes()` so `--type folder` works
- `node show`: if `read_note` fails for a folder path, fall back to showing graph-level NodeData + children via `contains` edges
- `link create`: works automatically after Step 4
- `neighbors`/`subgraph`: work automatically since folder nodes exist in graph

## Phase 3: MCP (`crates/mcp`)

- `node_show`: same fallback as CLI for folder paths
- `node_list`: use `list_all_graph_nodes` for folder type
- `link_create`, `neighbors`, `graph_stats`: work automatically

## Phase 4: Desktop App Frontend

- `graphStyles.ts`: add `folder` to `NOTE_TYPE_COLORS` (neutral gray) and `NOTE_TYPE_SHAPES` (roundrectangle)
- `GraphView.tsx`: on node click, if `note_type === "folder"` → trigger graph focus instead of opening editor
- `graphFocusFilter.ts`: include folder node itself in folder focus subgraph (exact path match)
- `FileTreePanel.tsx`: skip `note_type === "folder"` nodes in `buildTree` (tree already constructs folders from path segments)
- `LinksEditor.tsx`: folder nodes appear in autocomplete naturally (from graphStore nodes); add folder icon/label to distinguish
- `handlers.rs` (`get_node_summary`): if `read_note` fails + path exists as graph node → return synthesized `NodeSummaryDto` from NodeData
- `GraphLegend.tsx`: folder type added automatically via styles map

## Phase 5: Tests

### Core (`crates/core/tests/` + inline)
- `compute_folder_hierarchy`: flat (no folders), single-level, multi-level nesting, root excluded
- Seed dataset: verify folder node count matches directory count in `seed/`; **update existing 7 seed tests** — edge counts and implicit topology change (folder intermediaries replace note-to-note containment)
- `add_file` to new directory creates folder nodes
- `remove_file` from directory prunes empty folder nodes
- `create_link` to folder path succeeds
- `validate` does not flag folder-targeted links as broken

### CLI (`crates/cli` integration tests)
- `node list --type folder` returns folder nodes
- `link create` targeting a folder path

### Frontend (Vitest)
- `graphFocusFilter.test.ts`: folder nodes in test data
- `buildTree` skips folder-type nodes
- Click folder node in graph does not open editor

## Documentation
- Update `CLAUDE.md`: 11 note types (add folder), new implicit edge system description, folder node concept
- Update `docs/02-data-model.md`: document folder nodes as auto-generated graph entities

## Edge Cases
- **Root directory**: NOT a folder node (all notes would be children of root — no value)
- **Empty folders**: no folder node until a note exists inside; `emptyFolders` UIStore set remains for display-only
- **Path collision**: `Concepts.md` vs `Concepts/` — no collision (`.md` suffix distinguishes)
- **Notes at root level**: no parent folder node (root excluded), so no `contains` edge — they're top-level orphans unless explicitly linked
- **Existing index notes** (e.g., `Topic/Topic.md`): coexist with folder node `Topic`; folder `contains` the index note like any other child

**Verification**: `cargo test` (all 116 existing tests pass + new folder node tests)
