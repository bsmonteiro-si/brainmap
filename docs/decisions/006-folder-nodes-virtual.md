# Virtual Folder Nodes
**Date:** 2026-03-15 | **Status:** accepted

## Context
The knowledge graph needs to represent directory structure so that users can query relationships like "which notes are in the Concepts folder?" and visualize the hierarchy. The question was whether folders should have backing `.md` files (like notes) or exist only as in-memory graph nodes.

## Decision
Folders are virtual graph nodes with `note_type: "folder"`, auto-generated from the directory structure during workspace load via `compute_folder_hierarchy()` in `graph.rs`. They exist in `Graph.nodes` but not in `Workspace.notes`. Implicit `contains` edges connect each folder to its direct children (notes and subfolders). Notes can create explicit typed links targeting folder paths. Incremental operations maintain folder nodes via `ensure_folder_nodes`/`prune_empty_folder_nodes`.

## Alternatives Considered
- **Folder `.md` files (like Obsidian's folder notes):** Each directory would have an `index.md` or `_folder.md` file with frontmatter. Rejected because it creates file proliferation (every `mkdir` needs a companion file), confuses users who expect folders to just be folders, and requires special handling to prevent these meta-files from appearing as regular notes. Moving or renaming a folder would require updating both the directory and its meta-file.
- **No folder representation in the graph:** Folders would be a UI-only concept, invisible to graph queries. Rejected because it prevents useful queries like "show me everything in the Causality folder and its connections" and makes the graph an incomplete representation of the workspace structure.
- **Folder nodes stored in `Workspace.notes`:** Would unify the storage model but violates the principle that `notes` maps to files on disk. Would require special-casing folder nodes everywhere that iterates `notes` (serialization, search indexing, validation).

## Consequences
- The graph is a complete representation of workspace structure — both content (notes) and organization (folders) are queryable.
- `contains` edges enable hierarchical traversal: "show all descendants of folder X" is a standard graph BFS.
- Users can link notes to folders (e.g., a project note linking to a "Resources" folder), enabling cross-cutting organizational relationships.
- The desktop app renders folder nodes in the graph with a distinct icon and supports "Focus in Graph" on folders to show all contained notes.
- Trade-off: folder nodes require maintenance during mutations. Every `create_note`, `delete_note`, `add_file`, `remove_file`, and `move_note` operation must call `ensure_folder_nodes` or `prune_empty_folder_nodes` to keep the graph consistent. This is handled in `workspace.rs` but adds complexity to every write path.
