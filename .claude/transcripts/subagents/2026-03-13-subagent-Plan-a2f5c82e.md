# 2026-03-13 — Subagent Transcript: Plan

**Date:** 2026-03-13 11:38:39
**Agent:** Plan
**Agent ID:** a2f5c82e01260c200
**Parent Session:** e2adebf4-0599-4c1c-95a6-fa3b9af7f854

---

## User

I need a detailed implementation plan for adding virtual folder nodes to the BrainMap knowledge graph. This is Approach B from the research — folders become real graph nodes, notes are their children.

## Decision
- Folders become `NodeData` entries with `note_type: "folder"` 
- Auto-generated from directory structure during graph construction (no backing file needed initially)
- Title derived from folder name
- `contains` edges go folder → child notes AND folder → child subfolders
- Notes can link to folder paths as targets
- Later: optional `_folder.md` metadata files can override auto-generated metadata

## Current Architecture (from exploration)

### model.rs
- `NodeData { title, note_type, tags, path }` — the graph node struct
- `Edge { source, target, rel, kind: EdgeKind }` — EdgeKind is Explicit/Implicit/Inline
- `RelativePath` — workspace-relative normalized path string
- `TypedLink { target, rel, annotation }` — stored in frontmatter

### graph.rs (lines 10-14, 289-351)
- `Graph { nodes: HashMap<RelativePath, NodeData>, outgoing/incoming: HashMap<RelativePath, Vec<Edge>> }`
- `compute_implicit_edges()` currently finds nearest ancestor NOTE (not folder) and creates `contains` edges between notes
- `find_nearest_ancestor_node()` walks up directories looking for `<dir>.md` or `<dir>/<dir>.md` pattern

### workspace.rs
- `load_from_root()` (lines 100-237): parses all .md files, builds nodes, explicit/inline edges, then calls compute_implicit_edges
- `create_link()` (lines 470-532): validates target exists in graph, creates edge
- `delete_link()` (lines 586-622): removes edge
- Incremental ops: `reload_file()`, `add_file()`, `remove_file()` return GraphDiff

### dto.rs
- `NodeDto { path, title, note_type }` — sent to frontend
- `EdgeDto { source, target, rel, kind }` — sent to frontend

### Frontend
- `graphStore.ts`: `nodes: Map<string, NodeDto>`, `edges: EdgeDto[]`
- `GraphView/graphStyles.ts`: node shapes/colors by type
- `LinksEditor.tsx`: autocomplete from all nodes, 12 selectable edge types
- `FileTreePanel.tsx`: builds tree from note paths, `emptyFolders` Set
- `graphFocusFilter.ts`: focus subgraph filtering

### CLI (crates/cli/src/commands/)
- `node_show.rs`, `neighbors.rs`, `link.rs`, `node_list.rs` etc.

### MCP (crates/mcp/src/tools/)
- `node_show.rs`, `neighbors.rs`, `link_create.rs`, etc.

### Tests
- 116 Rust tests (28 core unit, 7 seed, 5 incremental, 1 perf, 33 CLI, 28 MCP tools, 9 MCP resources)
- 241 Vitest frontend tests

## Requirements
1. Every directory containing at least one note (or subdirectory with notes) becomes a folder node
2. Folder nodes have `note_type: "folder"`, title = directory basename (humanized)
3. `contains` edges: folder → direct child notes, folder → direct child subfolders  
4. Root workspace directory should NOT be a folder node (it's the implicit root)
5. Notes can create explicit links targeting folder paths
6. Incremental ops must handle folder node creation/removal as notes are added/deleted
7. Frontend graph renders folder nodes with distinct visual (folder shape/icon)
8. CLI/MCP commands work with folder nodes

## Plan the implementation in phases/steps, considering:
- What changes in each file
- Order of implementation (core first, then CLI/MCP, then frontend)
- Test strategy
- Edge cases (empty folders, nested folders, renaming, deletion)
- How this interacts with the existing implicit edge system (replace or coexist?)
- GraphDiff implications

---

## Assistant



I'll explore the codebase systematically to understand the current architecture before designing the implementation plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs"}`

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

Now let me check the frontend files and the Tauri DTO layer.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts"}`

---

## Assistant

Now let me check the frontend file tree, the handlers, and how the CLI commands work with nodes.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Files/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Files/fileTreeIcons.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

Let me check the remaining critical files - the frontend file tree components, CLI node commands, and the index module.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Files/**/*.{tsx,ts}"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/cli/src/commands/node_*.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/GraphView/**/*.{tsx,ts}"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/*File*.*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/cli/src/commands/*.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/*ree*.*"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/fileTreeIcons.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/node.rs"}`

---

## Assistant

Now let me check a few more key pieces: the index module (for search), the `create_link` validation, the `list_links` behavior, the `GraphView.tsx` (how nodes are rendered), and the `graphFocusFilter.ts`.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/index.rs","limit":60}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphFocusFilter.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

Let me check the MCP node_show and link tools to understand how they validate node existence.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"notes\\.contains_key","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"graph\\.get_node","path":"/Users/bsmonteiro/Desktop/Personal/brainmap","output_mode":"content"}`

---

## Assistant

Now let me check the seed dataset to understand the directory structure that will produce folder nodes.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/seed/","description":"List seed dataset top-level structure"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/seed -type d | head -20","description":"List seed dataset directory structure"}`

---

## Assistant

Now let me check how `GraphView.tsx` constructs Cytoscape node data to understand the rendering pipeline.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx","limit":80}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cy\\.add|data\\(.*color|data\\(.*shape|data\\(.*size","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx","output_mode":"content","-C":3}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx","offset":280,"limit":50}`

---

## Assistant

Now let me check the `LinksEditor` to understand how it autocompletes and validates link targets.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"notes\\.contains_key|graph\\.nodes","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"is_folder_node|note_type.*folder","path":"/Users/bsmonteiro/Desktop/Personal/brainmap","output_mode":"content"}`

---

## Assistant

I now have a comprehensive understanding of the codebase. Let me also quickly check the `GraphLegend` to understand how it displays type-to-color/shape mappings.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphLegend.tsx"}`

---

## Assistant

I now have a thorough understanding of the entire codebase. Here is the detailed implementation plan.

---

## Implementation Plan: Virtual Folder Nodes in the BrainMap Knowledge Graph

### Overview

Folders that contain at least one note (or subfolder with notes) become first-class graph nodes with `note_type: "folder"`. They get `contains` edges pointing to their direct children (notes and subfolders). This **replaces** the current implicit edge system that searches for ancestor notes like `Dir/Dir.md`.

### Key Design Decisions

1. **Path convention**: Folder nodes use directory paths without `.md` extension (e.g., `Concepts`, `The Book of Why/Ch1 - The Ladder of Causation`). This is unambiguous since all real notes end in `.md`.
2. **Title**: Humanized from the directory basename (e.g., `Ch1 - The Ladder of Causation`).
3. **Workspace root is NOT a folder node** -- it is the implicit container of everything.
4. **Folder nodes live only in the graph, not in `Workspace.notes`**. They have no `Note` struct, no frontmatter, no body. They are pure `NodeData` entries in `Graph.nodes`. This avoids polluting the `notes: HashMap<RelativePath, Note>` which is used for file I/O, serialization, and search indexing.
5. **The `compute_implicit_edges` function is replaced** by a new `compute_folder_hierarchy` function that generates both folder `NodeData` entries and `contains` edges.
6. **`create_link` validation must be loosened** to allow linking to folder paths (currently it checks `self.notes.contains_key(&target)`, which would fail for folder nodes). The check should be changed to `self.graph.get_node(&target).is_some()`.

---

### Phase 1: Core Library (`crates/core`)

#### Step 1.1: Add `NodeData.is_virtual()` helper and folder path utilities in `model.rs`

- Add `impl NodeData { pub fn is_folder(&self) -> bool { self.note_type == "folder" } }`
- Add a helper function `pub fn humanize_folder_name(dir_name: &str) -> String` that title-cases directory basenames.
- No changes to `RelativePath` -- folder paths are just strings without `.md` suffix, which `RelativePath` already handles.

#### Step 1.2: Replace `compute_implicit_edges` with `compute_folder_hierarchy` in `graph.rs`

Current `compute_implicit_edges` (lines 289-351) searches for nearest ancestor **notes** using filename heuristics (`Dir.md`, `Dir/Dir.md`). This gets replaced entirely.

New function signature:
```rust
pub fn compute_folder_hierarchy(
    notes: &HashMap<RelativePath, NodeData>,
    root_excluded: bool,  // always true; root dir is not a node
) -> (Vec<NodeData>, Vec<Edge>)
```

Algorithm:
1. Collect all unique directory paths from all note paths (using `RelativePath::parent()` recursively up to but excluding root).
2. For each directory path, create a `NodeData { title: humanize(basename), note_type: "folder", tags: vec![], path }`.
3. For each note, create a `contains` edge from its **direct parent directory** to the note.
4. For each non-root directory, create a `contains` edge from its **parent directory** to it (nested folders).
5. All edges have `kind: EdgeKind::Implicit`.

Return `(folder_nodes, contains_edges)`.

The old `find_nearest_ancestor_node` function is removed entirely.

#### Step 1.3: Update `workspace.rs` `load_from_root`

In `load_from_root` (line 194), replace:
```rust
let implicit = compute_implicit_edges(&node_data, &all_edges);
```
with:
```rust
let (folder_nodes, hierarchy_edges) = compute_folder_hierarchy(&node_data, true);
for fd in &folder_nodes {
    graph.add_node(fd.path.clone(), fd.clone());
}
all_edges.extend(hierarchy_edges);
```

Also store folder paths in a new field `pub folder_paths: HashSet<RelativePath>` on `Workspace` for quick lookup.

#### Step 1.4: Update link validation in `workspace.rs`

In `create_link` (line 483), change:
```rust
if !self.notes.contains_key(&target) {
```
to:
```rust
if !self.notes.contains_key(&target) && self.graph.get_node(&target).is_none() {
```

This allows notes to create explicit links targeting folder paths.

Similarly in `validate` (line 256), update the broken link check to also accept graph-level folder nodes as valid targets.

Also in `list_links` (line 541), `find_path` (lines 966-969), and `get_subgraph` (line 983), change `self.notes.contains_key` checks to also accept nodes that exist in the graph (folder nodes).

#### Step 1.5: Update incremental operations

**`add_file`**: After adding the note, check if the note's parent directory already has a folder node. If not, create folder nodes for all ancestor directories and `contains` edges. Return them in `GraphDiff.added_nodes` and `GraphDiff.added_edges`.

**`remove_file`**: After removing the note, check if any folder node now has zero children (no notes and no subfolder nodes with children). If so, prune those empty folder nodes. Return them in `GraphDiff.removed_nodes` and `GraphDiff.removed_edges`.

**`reload_file`**: No folder-related changes needed (the note's directory hasn't changed).

**`move_note`**: The note's old parent folder may become empty (prune it). The note's new parent folder may need to be created. Update `contains` edges accordingly.

Add a private helper method:
```rust
fn ensure_folder_nodes(&mut self, note_path: &RelativePath) -> (Vec<NodeData>, Vec<Edge>)
fn prune_empty_folder_nodes(&mut self, dir_path: &RelativePath) -> (Vec<RelativePath>, Vec<Edge>)
```

#### Step 1.6: Prevent folder nodes from being treated as notes

- `read_note`, `update_note`, `delete_note`: These already gate on `self.notes.contains_key`, which excludes folder nodes. No change needed.
- `list_nodes`: Iterates `self.notes.values()`, which excludes folder nodes. No change needed.
- `create_note`: If someone tries to create a note at a path that matches an existing folder node path (unlikely since folders don't end in `.md`), this won't conflict because folder paths don't have `.md`.

#### Step 1.7: Update `Graph::stats()` and `Graph::orphan_nodes()`

Folder nodes should be counted in `nodes_by_type` under `"folder"`. Orphan detection works naturally since folder nodes always have edges.

---

### Phase 2: CLI (`crates/cli`)

#### Step 2.1: `node list` with `--type folder` support

The `list_nodes` method iterates `self.notes`, so it won't return folder nodes. Add a new method `list_graph_nodes` or modify `list_nodes` to optionally include graph-only nodes (folder nodes). For the CLI `node list --type folder`, we need to query the graph directly.

Alternatively, add a `Workspace::list_all_graph_nodes()` method that wraps `self.graph.all_nodes()`.

#### Step 2.2: `node read` for folder paths

When `read_note` fails for a folder path, the CLI should fall back to showing the folder's graph data (title, type, children via `contains` edges).

#### Step 2.3: `link create` targeting folders

Works automatically after Step 1.4. No CLI changes needed.

#### Step 2.4: `neighbors` and `subgraph` for folder paths

After Step 1.4, these should work since folder nodes exist in the graph. The `neighbors` command in `crates/cli/src/commands/graph.rs` calls `ws.graph.neighbors()` directly, which will find folder nodes.

---

### Phase 3: MCP Server (`crates/mcp`)

#### Step 3.1: MCP tools that need updating

- `node_show`: Should handle folder paths by returning a synthesized response.
- `neighbors`: Works automatically (queries graph directly).
- `link_create`: Works automatically after Step 1.4.
- `node_list`: Same consideration as CLI Step 2.1.
- `graph_stats`: Works automatically.

---

### Phase 4: Desktop App Frontend

#### Step 4.1: Add folder type to visual mappings in `graphStyles.ts`

Add to `NOTE_TYPE_COLORS`:
```typescript
folder: "#8e8e93",  // neutral gray-ish, distinct from content types
```

Add to `NOTE_TYPE_SHAPES`:
```typescript
folder: "roundrectangle",  // or "barrel" — visually folder-like
```

#### Step 4.2: Update `GraphLegend.tsx`

The legend iterates `NOTE_TYPE_COLORS`, so adding `"folder"` to the map automatically includes it. No code change beyond Step 4.1.

#### Step 4.3: Update `graphFocusFilter.ts` for folder focus

Currently, folder focus uses `path.startsWith(prefix)` on note paths. With folder nodes, the folder node itself should also be included in the focus subgraph. Change the folder focus logic to:
- Include the folder node itself (its path matches exactly, not just as a prefix).
- Include all notes whose path starts with `focusPath + "/"`.
- Include subfolder nodes whose path starts with `focusPath + "/"`.

#### Step 4.4: Update `FileTreePanel.tsx` and tree building

The `buildTree` function builds tree structure from note paths. With folder nodes now in the graph's `nodes` map, there are two concerns:

1. **Don't render folder nodes as leaf files**: The `buildTree` function must skip nodes with `note_type === "folder"` from the note-rendering path. Folder structure is already built from path segments.
2. **OR** (better): The `handle_get_topology` handler already returns all graph nodes including folder nodes. The `FileTreePanel` should simply filter them out when building the tree, since the tree already constructs folders from path segments. Add: `if (nodeData.note_type === "folder") continue;` in the loop at line 66.

#### Step 4.5: Update `GraphView.tsx` node click behavior

When a user clicks a folder node in the graph, it should NOT try to open it in the editor (there is no note to edit). Instead:
- If the node is a folder (`note_type === "folder"`), trigger a graph focus on that folder.
- The existing click handler selects a node and opens it in the editor. Add a guard.

#### Step 4.6: Update `fileTreeIcons.tsx`

No change needed -- the `FolderTreeIcon` component already exists for the tree view. Folder nodes in the graph use `getNodeColor("folder")` which is handled by the styles update.

#### Step 4.7: Update hover tooltip for folder nodes

The `get_node_summary` handler calls `ws.read_note(path)` which will fail for folder nodes. Add a fallback path: if `read_note` fails and the path matches a graph node, return a `NodeSummaryDto` synthesized from the graph's `NodeData`.

#### Step 4.8: Update `LinksEditor.tsx` autocomplete

The datalist autocomplete should include folder nodes so users can create links to folders. Currently it uses `nodes` from graphStore which will include folder nodes after this change. Just ensure the display renders folder entries distinctly (e.g., with a folder icon or "(folder)" suffix).

---

### Phase 5: Tests

#### Step 5.1: Core unit tests in `graph.rs`

- Test `compute_folder_hierarchy` with flat structure (all notes in root -- should produce no folder nodes).
- Test with single-level nesting (notes in `Concepts/`).
- Test with multi-level nesting (notes in `Book/Ch1/`).
- Test that root directory does NOT produce a folder node.
- Test that `contains` edges are created correctly (folder->note, folder->subfolder).

#### Step 5.2: Core integration tests

- Test that seed dataset produces correct folder nodes (count directories in seed, verify matching folder nodes).
- Test `add_file` creates folder nodes when a note is added to a new directory.
- Test `remove_file` prunes folder nodes when the last note is removed from a directory.
- Test `create_link` to a folder path succeeds.
- Test `validate` does not report folder-targeted links as broken.

#### Step 5.3: CLI integration tests

- Test `node list --type folder` returns folder nodes.
- Test `link create --source note.md --target Concepts --rel contains` succeeds.

#### Step 5.4: Frontend Vitest tests

- Update `graphFocusFilter.test.ts` to include folder nodes in test data.
- Add test that `buildTree` skips folder-type nodes from the note iteration.
- Test that clicking a folder node in graph does not attempt to open editor.

---

### Edge Cases and Considerations

1. **Empty folders**: The `emptyFolders` Set in UIStore tracks folders created via the UI but with no notes. With folder nodes, these should NOT become graph nodes until they contain a note (the requirement says "every directory containing at least one note").

2. **Path collision**: A note at `Concepts.md` and a folder at `Concepts/` would produce `RelativePath("Concepts.md")` and `RelativePath("Concepts")` -- no collision since the `.md` suffix distinguishes them.

3. **Search index**: Folder nodes should NOT be indexed in FTS5 (they have no body, title is just the dirname). The search index operates on `Note` structs from `self.notes`, which excludes folder nodes. No change needed.

4. **Existing `compute_implicit_edges` users**: The seed dataset integration tests (7 tests) likely verify implicit edge counts. These will need updating since the edge topology changes (folder nodes become intermediaries).

5. **`_folder.md` future enhancement**: The plan mentions optional metadata files. This is explicitly deferred ("Later") and not part of this implementation. If a `_folder.md` file exists, it would be parsed as a regular note (likely with `note_type: "index"`) and coexist alongside the auto-generated folder node. A future step would merge them.

6. **Performance**: For the seed dataset (34 notes, ~18 directories), this adds ~17 folder nodes and ~51 contains edges. Negligible impact. For large workspaces with 1000+ notes, the folder node count is bounded by directory count which is typically 10-50x fewer than notes.

---

### Implementation Order

1. **Step 1.1-1.2**: model.rs + graph.rs (folder hierarchy computation) -- foundational
2. **Step 1.3**: workspace.rs load_from_root integration
3. **Step 1.4**: workspace.rs link validation loosening
4. **Step 1.5**: workspace.rs incremental ops
5. **Step 5.1-5.2**: Core tests (validate steps 1-4)
6. **Step 1.6-1.7**: Guard rails and stats
7. **Step 2.1-2.4**: CLI updates
8. **Step 5.3**: CLI tests
9. **Step 3.1**: MCP updates
10. **Step 4.1-4.8**: Frontend updates
11. **Step 5.4**: Frontend tests
12. **Documentation**: Update CLAUDE.md (note types count becomes 11, edge generation description, folder node concept).

---

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs` - Replace `compute_implicit_edges` with `compute_folder_hierarchy`; this is the core algorithmic change
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs` - Integrate folder nodes into `load_from_root`, loosen link validation, update incremental ops (`add_file`/`remove_file`/`move_note`)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts` - Add folder type color/shape; cascades to legend, graph rendering, and file tree icons
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx` - Filter folder nodes from note iteration in `buildTree` to avoid duplicate rendering
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs` - Add fallback for `handle_get_node_summary` when path is a folder node (no `Note` struct exists)

---

