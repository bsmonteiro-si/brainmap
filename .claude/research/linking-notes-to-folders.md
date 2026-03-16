# Research: Linking Notes to Folders

## Current State

### Folders are NOT graph nodes
Only `.md` files become `NodeData` entries in the graph. Folders are virtual — the `FileTreePanel` reconstructs them by splitting note paths on `/`. The `emptyFolders` Set in UIStore tracks folders with no notes so they appear in the tree, but they have no graph representation.

### Implicit containment edges
`compute_implicit_edges()` in `graph.rs:289-351` creates `contains` edges between **note nodes** based on directory hierarchy. It finds the nearest ancestor note (e.g., `Topic/Topic.md` is the index node for `Topic/*.md`). There are no edges to/from folder entities.

### Link targets are note paths
`TypedLink.target` (`model.rs:116-122`) is a workspace-relative string pointing to a `.md` file. `createLink` in `workspace.rs:470-532` validates that the target note exists in the graph before creating the edge. The `LinksEditor` UI autocomplete only shows notes, not folders.

### Node identity
Nodes are identified by `RelativePath` (normalized workspace-relative path to a `.md` file). The graph is `HashMap<RelativePath, NodeData>` with dual edge maps (`outgoing`/`incoming`).

---

## The Problem

Users may want to express "this note relates to that entire folder/topic" rather than to a specific note within it. Currently impossible — links can only target individual `.md` files.

---

## Approaches

### Approach A: Folder-as-Index-Note Convention (Minimal Change)

**Idea**: When a user links to a folder path, resolve it to the folder's index note (e.g., `Topic/` → `Topic/Topic.md`). No new node types needed.

**Changes required**:
- **Core** (`workspace.rs`): In `create_link`, if target path is a directory (no `.md` extension), try resolving to `<dir>/<basename>.md` or `<dir>/index.md`. Fail if no index note exists.
- **Frontend** (`LinksEditor.tsx`): Add folders to autocomplete alongside notes. Display folder entries differently (folder icon). On selection, store the resolved index note path.
- **Parser** (`parser.rs`): No change — stored links still point to `.md` files after resolution.
- **Graph**: No structural change — edge targets remain note paths.

**Pros**: Minimal architectural change. Leverages existing index-note convention. No new node types.
**Cons**: Requires every folder to have an index note. Doesn't work for truly "empty" folders. The link semantics are slightly misleading (user thinks they're linking to a folder but it's really to a note).

### Approach B: Virtual Folder Nodes in the Graph (Medium Change)

**Idea**: Add folder nodes to the graph as a new concept. They'd be `NodeData` entries with a special `note_type` (e.g., `"folder"`) and a path like `Topic/` (trailing slash or no `.md`).

**Changes required**:
- **Model** (`model.rs`): Allow `NodeData` without a backing `.md` file. Add a `is_virtual: bool` or `node_kind: NodeKind { Note, Folder }` field.
- **Graph** (`graph.rs`): During `load_from_root()`, create virtual nodes for every directory containing notes. Adjust `compute_implicit_edges()` to use folder nodes as parents instead of index notes.
- **Workspace** (`workspace.rs`): `create_link` accepts folder paths as targets. Validate folder exists on disk. Store edge with folder path as target.
- **Parser**: No change to file parsing. Folder nodes are created by the graph builder, not the parser.
- **Incremental ops**: `add_file`/`remove_file` must create/remove folder nodes when the first/last note in a directory appears/disappears.
- **Search index** (`index.rs`): Decide whether folder nodes are indexed (probably not for FTS, but maybe for backlink tracking).
- **DTO layer** (`dto.rs`): `NodeDto` already has `note_type` — folder nodes would have `note_type: "folder"`. Frontend graph rendering needs to handle them (different shape/icon, no click-to-edit).
- **Frontend**: `graphStore`, `GraphView`, `LinksEditor` all need folder-awareness. `LinksEditor` autocomplete shows both notes and folders. Graph renders folder nodes distinctly. Click on folder node opens folder in FileTree rather than editor.
- **CLI/MCP**: `node show`, `neighbors`, `link` commands need to handle folder targets. `node list` may need a filter.

**Pros**: Clean semantic model — folders are real entities you can link to. Works for empty folders. Graph visualizes the full hierarchy.
**Cons**: Significant change across all layers. Virtual nodes complicate the "files are the source of truth" principle. Folder nodes have no backing file — where do their metadata/links live? Graph size increases (every directory = a node).

### Approach C: Folder Metadata Files (Hybrid)

**Idea**: Folders get an optional `.brainmap-folder.yaml` (or `_folder.md`) metadata file. If present, the folder becomes a linkable entity with its own title, tags, and links. If absent, the folder is inert (as today).

**Changes required**:
- **Model**: New `FolderMeta` struct (title, tags, links). Parsed from `.brainmap-folder.yaml` or `_folder.md` with frontmatter.
- **Graph**: Folder meta files create `NodeData` entries with `note_type: "folder"`. Path identity could be the directory path.
- **Workspace**: Scan for folder meta files during `load_from_root()`. `create_link` accepts folder paths if they have meta files.
- **Parser**: New parser for folder meta format (or reuse note parser if using `_folder.md`).
- **Incremental ops**: File watcher must watch for `.brainmap-folder.yaml` changes.
- **Frontend**: Similar to Approach B for rendering. "Create folder" could optionally create a meta file.
- **CLI/MCP**: Similar to Approach B.

**Pros**: Files remain the source of truth. Opt-in — only folders with meta files participate. Clean metadata story.
**Cons**: New file format/convention. Users must create meta files for folders they want to link to. Adds complexity.

### Approach D: Tag/Path-Based Soft Links (Different Direction)

**Idea**: Instead of linking to a folder entity, link to a **path prefix query**. E.g., a link target of `folder:Topic/` means "all notes under Topic/". This is more of a dynamic reference than a graph edge.

**Changes required**:
- **Model**: Extend `TypedLink.target` to support `folder:` prefix or a new field.
- **Frontend**: LinksEditor shows folder references. RelatedNotesFooter expands them to show matching notes.
- **Graph**: Folder links are NOT edges — they're stored but resolved dynamically at query time.

**Pros**: No new node types. Flexible. Works with empty folders.
**Cons**: Not real graph edges — can't traverse them in graph algorithms. Breaks the uniform edge model. Complex resolution logic.

---

## Impact Analysis by Approach

| Area | A (Index Convention) | B (Virtual Nodes) | C (Meta Files) | D (Soft Links) |
|------|---------------------|-------------------|-----------------|----------------|
| `model.rs` | None | Medium | Medium | Small |
| `graph.rs` | None | Large | Medium | None |
| `workspace.rs` | Small | Large | Large | Small |
| `parser.rs` | None | None | Small | None |
| `index.rs` | None | Medium | Medium | None |
| `dto.rs` | None | Small | Small | Small |
| `commands.rs` / `handlers.rs` | Small | Medium | Medium | Small |
| Frontend stores | Small | Medium | Medium | Medium |
| Frontend components | Small | Medium | Medium | Medium |
| CLI commands | None | Medium | Medium | Small |
| MCP tools | None | Medium | Medium | Small |
| Test changes | Small | Large | Large | Medium |
| **Total effort** | **Small** | **Very Large** | **Large** | **Medium** |

---

## Key Questions to Decide

1. **What's the use case?** "This note is about that whole topic area" vs. "This note depends on everything in that folder" — different needs suggest different approaches.
2. **Should folders be traversable in graph algorithms?** If yes, they need to be real nodes (B or C). If display-only, A or D suffices.
3. **Must it work for folders without an index note?** If yes, rules out Approach A.
4. **Is "files are source of truth" sacred?** If yes, rules out B (virtual nodes with no backing file), favors A or C.
5. **Do folders need their own metadata (title, tags, summary)?** If yes, Approach C is the natural fit.

---

## Decision (2026-03-13)

**Approach B: Virtual Folder Nodes** — chosen after discussion.

Folders become real `NodeData` entries in the graph with `note_type: "folder"`. Notes inside them are children connected via `contains` edges. The full directory tree is represented in the graph.

Key decisions:
- **No backing file required initially** — folder nodes are auto-generated from directory structure during graph construction. Title = humanized folder basename.
- **Later enhancement**: Optional `_folder.md` metadata files can override auto-generated title/tags/summary.
- **Folder path convention**: Folder nodes use directory paths without `.md` (e.g., `Concepts`, `The Book of Why/Ch1`). Unambiguous since all note nodes end in `.md`.
- **Replaces current implicit edge system** — `compute_implicit_edges` (which creates note-to-note `contains` edges via ancestor heuristics) is replaced by `compute_folder_hierarchy` (which creates folder nodes + folder-to-child edges).
- **Folder nodes live only in `Graph.nodes`, not in `Workspace.notes`** — avoids polluting the notes HashMap used for file I/O, serialization, and search indexing.
- **"Files are source of truth" bends slightly** — folder nodes have no backing file, but they're deterministically derived from directory structure, so they're reproducible.

Original recommendation (Approach A → C graduation path) was overridden by user preference for folders as first-class graph entities.
