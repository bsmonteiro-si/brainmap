# 2026-03-09 — Subagent Transcript: Explore

**Date:** 2026-03-09 17:37:40
**Agent:** Explore
**Agent ID:** a763e084be9c4563b
**Parent Session:** ba732d96-401a-4b82-b69a-43c622866e5c

---

## User

Explore the BrainMap core crate to understand the full public API surface:
1. Read `crates/core/src/lib.rs` — what's exported
2. Read `crates/core/src/workspace.rs` — all public methods
3. Read `crates/core/src/model.rs` — all data types
4. Read `crates/core/src/graph.rs` — graph operations
5. Read `crates/core/src/index.rs` — search index
6. Read `crates/core/src/config.rs` — configuration
7. Read `crates/core/src/export.rs` — export functionality
8. Read `crates/core/src/error.rs` — error types

I need the complete picture of what the desktop app will consume from core.

---

## Assistant

I'll explore the BrainMap core crate to map out the complete public API surface. Let me read all the key files in parallel.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/lib.rs"}`

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

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/index.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/config.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/export.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/error.rs"}`

---

## Assistant

Perfect! I have the complete picture of the BrainMap core crate's public API. Here's the comprehensive analysis:

## BrainMap Core Crate — Complete Public API Surface

### Exported Modules and Types (lib.rs)

The crate exports six public modules and two key error types:
- `config`, `error`, `export`, `graph`, `index`, `model`, `parser`, `workspace`
- `BrainMapError` and `Result<T>` type alias

---

## 1. **Workspace.rs** — Main Orchestration Layer

**Structs:**
- `Workspace` — entry point, holds root, config, graph, index, notes
- `ValidationIssue` — diagnostic with severity and path
- `Severity` enum — `Error`, `Warning`
- `WorkspaceStats` — aggregated metrics (node/edge counts, breakdowns by type/kind/rel)

**Workspace Lifecycle:**
- `Workspace::init(path)` — create new workspace
- `Workspace::open(path)` — load from disk, scan .md files, build graph + index
- `validate()` — report broken links, orphan nodes, missing titles

**Statistics & Inspection:**
- `stats()` → `WorkspaceStats` (comprehensive graph metrics)
- `list_nodes(type_filter, tag_filter, status_filter)` → `Vec<&Note>`
- `list_links(path, direction, rel_filter)` → `Vec<&Edge>`

**CRUD — Notes:**
- `create_note(rel_path, title, note_type, tags, status, source, summary, extra, body)` → `RelativePath`
- `read_note(rel_path)` → `&Note`
- `update_note(rel_path, title?, note_type?, tags?, status?, source?, summary?, extra?, body?)` → `Result<()>`
- `delete_note(rel_path, force)` → `Result<()>` (requires force if has backlinks)
- `move_note(old_path, new_path)` → `Result<Vec<String>>` (rewritten referencing notes)

**CRUD — Links:**
- `create_link(source, target, rel, annotation)` → `Result<()>`
- `delete_link(source, target, rel)` → `Result<()>`

**Graph Queries:**
- `find_path(source, target, max_depth?)` → `Result<Option<Vec<Edge>>>`
- `get_subgraph(center, depth, rel_filter?)` → `Result<Subgraph>`

**Maintenance:**
- `reindex()` → `Result<()>`

---

## 2. **Model.rs** — Data Types

**Identifiers & Paths:**
- `NoteId(Uuid)` — unique note identifier
- `RelativePath(String)` — normalized relative file paths, with methods:
  - `new(path)`, `as_str()`, `parent()`, `join(other)`, `resolve_relative(target)`

**Note Metadata:**
- `Status` enum — `Draft`, `Review`, `Final`, `Archived`
- `TypedLink` — `target: String`, `rel: String`, `annotation: Option<String>`
- `InlineLink` — `target`, `label`, `position`
- `Frontmatter` — `id`, `title`, `note_type`, `tags`, `status`, `created`, `modified`, `source`, `summary`, `links`, `extra` (HashMap)
- `Note` — `path`, `frontmatter`, `body`, `inline_links`

**Graph Structure:**
- `EdgeKind` enum — `Explicit`, `Implicit`, `Inline`
- `Edge` — `source`, `target`, `rel`, `kind`
- `Direction` enum — `Outgoing`, `Incoming`, `Both`
- `NodeData` — `title`, `note_type`, `path`

---

## 3. **Graph.rs** — Graph Engine

**Main Types:**
- `Graph` — adjacency lists (outgoing/incoming edges by node)
- `Subgraph` — `nodes: Vec<NodeData>`, `edges: Vec<Edge>`
- `GraphStats` — `node_count`, `edge_count`, `nodes_by_type`, `edges_by_type`, `edges_by_kind`, `orphan_count`

**Graph Operations:**
- `new()` — create empty graph
- `add_node(path, data)` / `remove_node(path)`
- `add_edge(edge)` / `remove_edge(source, target, rel)`
- `get_node(path)` → `Option<&NodeData>`
- `all_nodes()` → iterator
- `node_count()` → usize
- `orphan_nodes()` → `Vec<RelativePath>`
- `stats()` → `GraphStats`
- `edges_for(path, direction)` → `Vec<&Edge>`
- `edges_for_all()` → `Vec<&Edge>`

**Path Finding & Neighborhoods:**
- `shortest_path(source, target, max_depth?)` → `Option<Vec<Edge>>`
- `neighbors(path, depth, direction, rel_filter?)` → `Subgraph`
- `subgraph(center, depth, rel_filter?)` → `Subgraph` (via neighbors with Both direction)

**Global Utility:**
- `compute_implicit_edges(notes_map, explicit_edges)` → `Vec<Edge>` (infers "contains" from directory hierarchy)

---

## 4. **Index.rs** — SQLite FTS5 Search Index

**Main Type:**
- `Index` — thin wrapper around rusqlite Connection
- `SearchResult` — `path`, `title`, `note_type`, `snippet`, `rank`
- `SearchFilters` — optional `note_type`, `tag`, `status` for query refinement

**Index Lifecycle:**
- `open(db_path)` → `Result<Index>`
- `open_in_memory()` → `Result<Index>` (for testing)
- `rebuild(notes_with_mtime, edges)` → `Result<()>` (full reindex)

**Note Indexing:**
- `add_note(note, file_mtime)` → `Result<()>`
- `update_note(note, file_mtime)` → `Result<()>` (remove + add)
- `remove_note(path)` → `Result<()>`
- `is_stale(path, current_mtime)` → `Result<bool>`

**Search & Backlinks:**
- `search(query, filters)` → `Result<Vec<SearchResult>>` (FTS5 MATCH, up to 50 results)
- `backlinks(path)` → `Result<Vec<(String, String)>>` (source, rel pairs)

**Edge Storage:**
- `add_edges(edges)` → `Result<()>`
- `remove_edge(source, target, rel)` → `Result<()>`

---

## 5. **Config.rs** — Workspace Configuration

**Types:**
- `WorkspaceConfig` — `name`, `version: u32`, `note_types: Vec<String>`, `edge_types: Vec<String>`, `federation: Vec<FederatedWorkspace>`
- `FederatedWorkspace` — `name`, `path`

**Config Methods:**
- `new(name)` → `WorkspaceConfig` (with default 10 note types + 15 edge types)
- `register_note_type(note_type)` → `bool` (true if new)
- `register_edge_type(edge_type)` → `bool` (true if new)
- `add_federation(name, path)` / `remove_federation(name)` → `bool`

**Persistence:**
- `load_config(brainmap_dir)` → `Result<WorkspaceConfig>`
- `save_config(config, brainmap_dir)` → `Result<()>`

---

## 6. **Export.rs** — Graph Serialization

**Functions (all take Workspace and optional Subgraph):**
- `export_json(workspace, subgraph?)` → `String` (nodes + edges as JSON)
- `export_dot(workspace, subgraph?)` → `String` (Graphviz format)
- `export_graphml(workspace, subgraph?)` → `String` (GraphML XML format)
- `export_subgraph_json(subgraph)` → `String` (convenience for subgraph-only export)

---

## 7. **Error.rs** — Error Types

**Error Variants:**
- `FileNotFound(String)`
- `DuplicatePath(String)`
- `InvalidYaml(String)`
- `BrokenLinkTarget { from, to }`
- `DuplicateLink { from, to, rel }`
- `LinkNotFound { from, to }`
- `HasBacklinks { path, backlinks: Vec<(String, String)> }`
- `InvalidWorkspace(String)`
- `WorkspaceExists(String)`
- `IndexCorrupt(String)`
- `ConfigError(String)`
- Plus transparent wrappers: `Io`, `Yaml`, `Sqlite`

**Method:**
- `error_code()` → `&str` (machine-readable code for each variant)

---

## Summary: Desktop App Consumption Points

The **desktop app** (Tauri + React) will primarily consume:

1. **Workspace lifecycle:** `open()`, `init()`
2. **Full CRUD:** note create/read/update/delete, link create/delete
3. **Graph visualization:** `get_subgraph()`, `find_path()`, export functions
4. **Search:** `index.search()`
5. **Metadata:** `validate()`, `stats()`, `list_nodes()`, `list_links()`
6. **Configuration:** read/write via `WorkspaceConfig`

All operations go through the `Workspace` struct as the orchestration layer. The core is **read+write** capable with **single-writer** mutation model (held in memory).

---

