# Rust Backend Architecture

Comprehensive map of the BrainMap Rust backend. Covers crate structure, data model, APIs, state management, IPC, search, and file watching.

---

## 1. Crate Structure

```
Cargo.toml (workspace: resolver v2, edition 2021)
  members: crates/core, crates/cli, crates/mcp
  excluded: crates/app/src-tauri (standalone Cargo.toml)

crates/core/       -- Library: parser, graph, index, workspace, config, export, error
crates/cli/        -- Binary: 21 CLI commands via clap
crates/mcp/        -- Binary: MCP server (24 tools + 3 resources) via rmcp over stdio
crates/app/src-tauri/ -- Tauri v2 app backend: commands, handlers, state, watcher, DTOs
crates/tauri-plugin/  -- tauri-plugin-mcp (socket-based MCP for E2E testing)
```

### crates/core (brainmap-core)

Key files:
- `model.rs` -- Core types: NoteId, RelativePath, Note, Frontmatter, Edge, NodeData, GraphDiff
- `graph.rs` -- Graph struct: in-memory adjacency lists + compute_folder_hierarchy()
- `workspace.rs` -- Workspace struct: the central write API (all mutations go through here)
- `index.rs` -- Index struct: SQLite FTS5 search index
- `parser.rs` -- parse_note(), serialize_note(), parse_file(), inline link extraction
- `config.rs` -- WorkspaceConfig: note types, edge types, federation
- `error.rs` -- BrainMapError enum with error_code() method
- `export.rs` -- Graph export to JSON/DOT formats
- `logging.rs` -- init_logging() with tracing + file appender (feature-gated)

Public re-exports from lib.rs: `BrainMapError`, `Result`

### crates/cli

- `main.rs` -- Clap arg parser, 21 commands + short aliases (ls, new, s)
- `commands/` -- One module per command group: node, link, search, graph, validate, stats, status, path, subgraph, export, reindex, federation, config, init, serve
- `output.rs` -- JSON (primary) and text output formatting

### crates/mcp

- `server.rs` -- BrainMapMcp struct implementing ServerHandler, manual dispatch_tool() router
- `tools/` -- Tool implementations: node (6), link (3), search (1), graph (3), workspace (6), federation (3), batch (1) = 24 total

### crates/app/src-tauri

- `lib.rs` -- run(): Tauri builder with plugins, menu, command registration
- `state.rs` -- AppState: multi-segment per-slot locking
- `commands.rs` -- 38 #[tauri::command] functions (thin wrappers calling handlers)
- `handlers.rs` -- Business logic bridging DTOs to Workspace methods
- `dto.rs` -- Request/response DTOs with ts-rs for TypeScript codegen
- `watcher.rs` -- File watcher: notify-debouncer-mini, event classification, topology/files-changed emission
- `dock_menu.rs` -- macOS dock menu for segment switching

---

## 2. Core Data Model (crates/core/src/model.rs)

### Identity and Paths

| Type | Description |
|------|-------------|
| NoteId(Uuid) | UUID v4, auto-generated |
| RelativePath(String) | Normalized workspace-relative path (forward slashes, no ./, resolved ..) |

RelativePath methods: new(), as_str(), parent(), join(), resolve_relative().

### Note and Frontmatter

```rust
struct Note {
    path: RelativePath,
    frontmatter: Frontmatter,
    body: String,
    inline_links: Vec<InlineLink>,
}

struct Frontmatter {
    id: NoteId,
    title: String,
    note_type: String,           // "concept", "book-note", "question", etc. (11 default types)
    tags: Vec<String>,
    status: Option<Status>,       // Draft | Review | Final | Archived
    created: NaiveDate,
    modified: NaiveDate,
    source: Option<String>,
    summary: Option<String>,
    links: Vec<TypedLink>,        // Explicit typed edges in frontmatter
    extra: HashMap<String, serde_yaml::Value>,  // Catch-all for custom fields
}
```

### Edges

```rust
struct Edge {
    source: RelativePath,
    target: RelativePath,
    rel: String,                  // 15 default types: contains, part-of, causes, supports, etc.
    kind: EdgeKind,               // Explicit (frontmatter), Implicit (folder hierarchy), Inline (body links)
}

struct TypedLink {
    target: String,               // Relative to note's directory
    rel: String,
    annotation: Option<String>,
}

struct InlineLink {
    target: String,               // Resolved absolute workspace path
    label: Option<String>,
    position: usize,
}
```

### Graph Nodes

```rust
struct NodeData {
    title: String,
    note_type: String,            // "folder" for virtual folder nodes
    tags: Vec<String>,
    path: RelativePath,
    modified: Option<NaiveDate>,
    summary: Option<String>,
}
```

NodeData::is_folder() checks note_type == "folder".

### GraphDiff (incremental updates)

```rust
struct GraphDiff {
    added_nodes: Vec<NodeData>,
    removed_nodes: Vec<RelativePath>,
    added_edges: Vec<Edge>,
    removed_edges: Vec<Edge>,
}
```

Returned by reload_file(), add_file(), remove_file(), convert_to_note().

---

## 3. Graph (crates/core/src/graph.rs)

```rust
struct Graph {
    nodes: HashMap<RelativePath, NodeData>,
    outgoing: HashMap<RelativePath, Vec<Edge>>,
    incoming: HashMap<RelativePath, Vec<Edge>>,
}
```

Key methods:
- add_node() / remove_node() -- Manage node + adjacency entries
- add_edge() / remove_edge() -- Symmetric outgoing/incoming updates
- get_node() / all_nodes() / node_count()
- neighbors(path, depth, direction, rel_filter) -> Subgraph -- BFS traversal (max depth 10)
- shortest_path(source, target, max_depth) -> Option<Vec<Edge>> -- BFS
- subgraph(center, depth, rel_filter) -> Subgraph -- Wrapper around neighbors(Both)
- orphan_nodes() -> Vec<RelativePath> -- Nodes with no edges
- stats() -> GraphStats -- Counts by type/kind
- edges_for(path, direction) / edges_for_all() -- Edge queries
- assert_invariants() -- Debug-only structural validation (7 invariants)

Folder hierarchy: compute_folder_hierarchy(notes) -> (Vec<NodeData>, Vec<Edge>) builds virtual folder NodeData nodes with note_type: "folder" and implicit "contains" edges from directory structure. Root directory is excluded.

---

## 4. Workspace API (crates/core/src/workspace.rs)

The Workspace struct is the central write API. All mutations go through it.

```rust
struct Workspace {
    pub root: PathBuf,
    pub config: WorkspaceConfig,
    pub graph: Graph,
    pub index: Index,
    pub notes: HashMap<RelativePath, Note>,
}
```

### Lifecycle

| Method | Signature | Description |
|--------|-----------|-------------|
| init | (path: &Path) -> Result<()> | Creates .brainmap/ dir, config, index |
| open | (path: &Path) -> Result<Self> | Walks up to find workspace root, loads |
| open_or_init | (path: &Path) -> Result<Self> | Opens at exact path, auto-init if needed |

load_from_root() (private): scans all .md files, parses each, builds graph (nodes + edges from frontmatter links + inline links + folder hierarchy), rebuilds FTS5 index.

### CRUD Operations

| Method | Description |
|--------|-------------|
| create_note(path, title, type, tags, status, source, summary, extra, body) | Creates note file, adds to graph/index, ensures folder nodes |
| read_note(path) -> &Note | Read-only lookup |
| update_note(path, title?, type?, tags?, status?, source?, summary?, extra?, body?) | Partial update, writes file, updates graph/index, sets modified date |
| delete_note(path, force) | Checks backlinks (unless force), removes file/graph/index, prunes folders |
| convert_to_note(path, note_type?) | Prepends frontmatter to plain .md, returns GraphDiff |

### Link Operations

| Method | Description |
|--------|-------------|
| create_link(source, target, rel, annotation?) | Adds TypedLink to frontmatter, writes file, adds edge |
| delete_link(source, target, rel) | Removes from frontmatter + graph + index |
| list_links(path, direction, rel_filter?) -> Vec<&Edge> | Query edges for a node |
| list_nodes(type?, tag?, status?) -> Vec<&Note> | Filtered note listing |

### Move Operations

| Method | Description |
|--------|-------------|
| move_note(old, new) -> Vec<String> | Moves file, rewrites backlinks in referencing notes, updates graph/index, returns rewritten paths |
| move_folder(old, new) -> MoveFolderResult | Moves directory, rewrites all internal/external links, batch graph update |

### Incremental Operations (used by file watcher)

| Method | Description |
|--------|-------------|
| reload_file(path) -> GraphDiff | Re-parses changed file, diffs edges, updates graph/index |
| add_file(path) -> GraphDiff | Parses new file, adds to graph/index, ensures folders |
| remove_file(path) -> GraphDiff | Removes from graph/index, prunes empty folders |

### Other

| Method | Description |
|--------|-------------|
| validate() -> Vec<ValidationIssue> | Broken links, orphans, missing titles |
| stats() -> WorkspaceStats | Node/edge counts by type |
| reindex() | Full FTS5 rebuild |
| find_path(source, target, max_depth?) | Shortest path via BFS |
| get_subgraph(center, depth, rel_filter?) | Neighborhood extraction |
| list_all_graph_nodes() -> Vec<&NodeData> | All nodes including folders |

### Private Helpers

- ensure_folder_nodes(note_path) -> (Vec<NodeData>, Vec<Edge>) -- Creates missing ancestor folder nodes with "contains" edges
- prune_empty_folder_nodes(dir) -> (Vec<RelativePath>, Vec<Edge>) -- Removes leaf folder nodes with no children, walks up
- compute_relative_target(source, target) -> String -- Computes relative path between two workspace paths
- file_mtime(path) -> i64 -- Unix timestamp for index staleness checks

---

## 5. Tauri Command Layer (crates/app/src-tauri/)

### State Management (state.rs)

```rust
struct AppState {
    slots: Arc<RwLock<HashMap<String, Arc<Mutex<WorkspaceSlot>>>>>,  // Keyed by canonicalized root
    active_root: Arc<Mutex<Option<String>>>,                         // Currently active segment
    watchers: Arc<Mutex<HashMap<String, Debouncer<RecommendedWatcher>>>>,
}

struct WorkspaceSlot {
    workspace: Workspace,
    expected_writes: HashSet<PathBuf>,  // Self-writes to skip in watcher
}
```

Locking pattern: Outer RwLock held briefly for HashMap lookup (read) or insert/remove (write). Inner Mutex per slot means different segments never contend.

Key access methods:
- get_slot(root) -> Arc<Mutex<WorkspaceSlot>> -- Clone Arc, release RwLock immediately
- with_slot(root, f) / with_slot_mut(root, f) -- Callback with read/write access
- with_active(f) / with_active_mut(f) -- Convenience: resolve active root, then with_slot
- resolve_root(explicit?) -- Returns explicit root or falls back to active_root
- insert_slot() / remove_slot() / has_slot() / overlaps_existing() / list_roots()
- register_expected_write(root, path) / consume_expected_write(root, path) -- Watcher coordination
- set_watcher() / remove_watcher() -- Lifecycle management
- canonicalize_root(path) -- fs::canonicalize() with fallback

### Tauri Commands (commands.rs)

All 38 commands registered in lib.rs via tauri::generate_handler![]:

Workspace lifecycle:
- open_workspace(path) -> WorkspaceInfoDto -- Opens/activates slot, starts watcher
- close_workspace(root) -- Stops watcher, removes slot
- switch_workspace(root) -> WorkspaceInfoDto -- Activates existing slot
- refresh_workspace() -> WorkspaceInfoDto -- Re-opens workspace from disk

Graph/topology:
- get_graph_topology() -> GraphTopologyDto -- All nodes + all edges
- get_neighbors(params) -> SubgraphDto
- get_stats() -> StatsDto

Note CRUD:
- get_node_content(path) -> NoteDetailDto
- create_node(params: CreateNoteParams) -> String (path)
- update_node(params: UpdateNoteParams)
- delete_node(path, force?)
- duplicate_note(path) -> NoteDetailDto
- get_node_summary(path) -> NodeSummaryDto
- list_nodes(params) -> Vec<NodeSummaryDto>

Note movement:
- move_note(old_path, new_path) -> MoveNoteResultDto
- move_folder(old_folder, new_folder) -> MoveFolderResultDto

Links:
- create_link(params: LinkParams)
- delete_link(source, target, rel)
- list_links(params) -> Vec<EdgeDto>

Search:
- search_notes(params: SearchParams) -> Vec<SearchResultDto>

Plain files (non-note):
- create_plain_file(path, body?) -> String
- read_plain_file(path) -> PlainFileDto
- write_plain_file(path, body)
- delete_plain_file(path)
- move_plain_file(old, new) -> String

Raw note writing:
- write_raw_note(path, content) -- Writes raw content, re-parses, returns GraphDiff
- convert_to_note(path, note_type?) -> String

Folders:
- create_folder(path) -- Creates directory with path-traversal guard
- delete_folder(path, force?) -> DeleteFolderResultDto

File resolution (for asset protocol):
- resolve_image_path(path) -> ImageMetaDto
- resolve_video_path(path) -> VideoMetaDto
- resolve_pdf_path(path) -> PdfMetaDto
- load_pdf_highlights(pdf_path) -> Vec<PdfHighlightDto>
- save_pdf_highlights(pdf_path, highlights)

Utility:
- list_workspace_files() -> Vec<String> -- All files in workspace
- import_files(source_paths, target_dir) -> ImportResultDto
- reveal_in_file_manager(path) -- OS-specific file reveal
- open_in_default_app(path) -- OS-specific file open
- write_log(level, target, msg, fields?) -- Frontend log forwarding to tracing
- update_dock_menu(segments) -- macOS dock menu update

### Command Pattern

Most mutating commands follow this pattern:
1. resolve_root(None) to get active workspace root
2. register_expected_write() so the file watcher skips self-triggered events
3. with_slot_mut() to perform the operation in one lock
4. emit_topology_event() or emit_files_changed_event() to notify frontend

### Handlers (handlers.rs)

Thin bridge layer converting DTOs to Workspace method calls. Key behaviors:
- handle_delete_note() uses trash::delete() before core delete (moves to OS trash)
- handle_delete_folder() checks external backlinks when force=false, deletes deeper paths first
- validate_relative_path() guards against path traversal attacks
- json_map_to_yaml() converts extra fields at IPC boundary

---

## 6. DTO / Serialization Layer (dto.rs)

All DTOs use ts-rs (#[ts(export)]) to auto-generate TypeScript interfaces to src/api/generated/.

### Request DTOs (Deserialize)

| DTO | Key Fields |
|-----|------------|
| CreateNoteParams | path, title, note_type, tags, status?, source?, summary?, extra (JSON), body |
| UpdateNoteParams | path, title?, note_type?, tags?, status?, source?, summary?, extra? (JSON), body? |
| SearchParams | query, note_type?, tag?, status? |
| NeighborsParams | path, depth, direction?, rel_filter? |
| LinkParams | source, target, rel, annotation? |
| ListLinksParams | path, direction, rel_filter? |
| ListNodesParams | note_type?, tag?, status? |

### Response DTOs (Serialize)

| DTO | Key Fields |
|-----|------------|
| WorkspaceInfoDto | name, root, node_count, edge_count |
| GraphTopologyDto | nodes: Vec<NodeDto>, edges: Vec<EdgeDto> |
| NodeDto | path, title, note_type, tags?, modified?, summary? |
| EdgeDto | source, target, rel, kind (string: "Explicit"/"Implicit"/"Inline") |
| NoteDetailDto | path, title, note_type, tags, status?, created, modified, source?, summary?, links, extra (JSON), body |
| TypedLinkDto | target (resolved absolute path), rel, annotation? |
| NodeSummaryDto | path, title, note_type, tags, status?, summary? |
| SearchResultDto | path, title, note_type, snippet, rank |
| SubgraphDto | nodes: Vec<NodeDto>, edges: Vec<EdgeDto> |
| StatsDto | node_count, edge_count, nodes_by_type, edges_by_rel, edges_by_kind, orphan_count |
| PlainFileDto | path, body, binary |
| PdfMetaDto | path, absolute_path, size_bytes (also aliased as ImageMetaDto, VideoMetaDto) |
| MoveNoteResultDto | new_path, rewritten_paths |
| MoveFolderResultDto | new_folder, moved_notes: Vec<(old, new)>, rewritten_paths |
| DeleteFolderResultDto | deleted_paths |
| ImportResultDto | imported: Vec<String>, failed: Vec<ImportFailureDto> |

### YAML to JSON Conversion

The extra field in Frontmatter uses serde_yaml::Value internally but crosses the IPC boundary as serde_json::Value. Conversion functions:
- yaml_map_to_json() / yaml_to_json() -- Core -> Frontend
- json_map_to_yaml() / json_to_yaml() -- Frontend -> Core

---

## 7. File Watcher (watcher.rs)

### Architecture

```
notify-debouncer-mini (1s debounce)
  -> classify: WatchedFile::Markdown | WatchedFile::Plain
  -> mpsc channel
  -> tokio::spawn async task
    -> process_md_change() or process_plain_change()
```

### Event Classification

- .md files -> WatchedFile::Markdown -> topology updates
- Other files (exists or !exists) -> WatchedFile::Plain -> files-changed events
- Hidden files/dirs (path contains /. or \.) -> skipped
- Directories -> skipped

### Self-Write Suppression

Commands call register_expected_write(root, abs_path) before writing. The watcher calls consume_expected_write(root, path) -- if it returns true, the event is skipped.

### Markdown Processing (process_md_change)

1. Strip workspace root prefix to get RelativePath
2. Check consume_expected_write() -- skip if self-triggered
3. Determine action:
   - File exists + known note -> workspace.reload_file() -> emit topology diff + node-updated event
   - File exists + unknown -> workspace.add_file() -> emit topology diff
   - File doesn't exist -> workspace.remove_file() -> emit topology diff

### Frontend Events

All events emitted on channel "brainmap://workspace-event":

1. topology-changed:
```json
{
  "type": "topology-changed",
  "workspace_root": "<canonical_root>",
  "added_nodes": [{ "path", "title", "note_type", "tags", "summary", "modified" }],
  "removed_nodes": ["<path>"],
  "added_edges": [{ "source", "target", "rel", "kind" }],
  "removed_edges": [{ "source", "target", "rel", "kind" }]
}
```

2. node-updated:
```json
{
  "type": "node-updated",
  "workspace_root": "<canonical_root>",
  "path": "<relative_path>",
  "node": { "path", "title", "note_type", "tags", "summary", "modified" }
}
```

3. files-changed:
```json
{
  "type": "files-changed",
  "workspace_root": "<canonical_root>",
  "added_files": ["<path>"],
  "removed_files": ["<path>"]
}
```

All three share the same event channel; the frontend discriminates via the "type" field.

---

## 8. SQLite / FTS5 Search (crates/core/src/index.rs)

```rust
struct Index { conn: Connection }  // rusqlite
```

Configuration: WAL mode, 5-second busy timeout.

### Schema

```sql
CREATE VIRTUAL TABLE notes_fts USING fts5(
    path, title, type, tags, content, summary
);

CREATE TABLE notes_meta (
    path TEXT PRIMARY KEY,
    id TEXT, type TEXT, status TEXT,
    created TEXT, modified TEXT, file_mtime INTEGER
);

CREATE TABLE edges (
    source TEXT, target TEXT, rel TEXT, implicit INTEGER,
    PRIMARY KEY (source, target, rel)
);
```

### Key Methods

| Method | Description |
|--------|-------------|
| open(db_path) / open_in_memory() | Open/create index |
| add_note(note, mtime) | Insert into FTS5 + meta |
| remove_note(path) | Delete from FTS5 + meta + edges |
| update_note(note, mtime) | Remove + re-add |
| add_edges(edges) | Batch insert (transaction) |
| remove_edge(source, target, rel) | Delete single edge |
| search(query, filters) -> Vec<SearchResult> | FTS5 MATCH with type/status filters, limit 50, ranked |
| backlinks(path) -> Vec<(source, rel)> | Incoming edges from edge table |
| is_stale(path, mtime) -> bool | Compare stored vs current mtime |
| rebuild(notes, edges) | Full wipe + re-insert (transactional) |

Content is stripped of markdown syntax before indexing (strip_markdown()).

---

## 9. MCP Server (crates/mcp/)

```rust
struct BrainMapMcp {
    workspace: Arc<Mutex<Workspace>>,
}
```

Implements rmcp::ServerHandler. Uses manual dispatch in dispatch_tool() (match on tool name string).

### Response Envelope

```json
{ "success": true, "data": ... }
{ "success": false, "error": { "code": "<ERROR_CODE>", "message": "..." } }
```

### Tools (24 total)

| Category | Tools |
|----------|-------|
| Node | node_get, node_list, node_create, node_update, node_delete, node_move |
| Link | link_create, link_delete, link_list |
| Search | search |
| Graph | neighbors, find_path, subgraph |
| Workspace | status, validate, stats, reindex, export, config_get, config_set |
| Federation | federation_list, federation_add, federation_remove |
| Batch | batch (sequential execution with stop-on-failure) |

### Resources (3)

| URI | Description |
|-----|-------------|
| brainmap://nodes/<path> | Individual note content |
| brainmap://graph | Full graph topology |
| brainmap://config | Workspace configuration |

---

## 10. Error Handling

```rust
enum BrainMapError {
    FileNotFound(String),
    DuplicatePath(String),
    InvalidYaml(String),
    BrokenLinkTarget { from, to },
    DuplicateLink { from, to, rel },
    LinkNotFound { from, to, rel },
    InvalidArgument(String),
    HasBacklinks { path, backlinks },
    InvalidWorkspace(String),
    WorkspaceExists(String),
    IndexCorrupt(String),
    ConfigError(String),
    Io(std::io::Error),
    Yaml(serde_yaml::Error),
    Sqlite(rusqlite::Error),
}
```

Each variant has an error_code() -> &str (e.g., "FILE_NOT_FOUND", "DUPLICATE_PATH").

At the Tauri boundary, errors are converted to String via .map_err(|e| e.to_string()). The MCP layer wraps them in the envelope format with code + message.

---

## 11. Configuration (crates/core/src/config.rs)

```rust
struct WorkspaceConfig {
    name: String,
    version: u32,                            // Always 1
    note_types: Vec<String>,                 // 10 defaults + auto-registered
    edge_types: Vec<String>,                 // 15 defaults + auto-registered
    federation: Vec<FederatedWorkspace>,      // Named remote workspace links
}
```

Stored at .brainmap/config.yaml. Auto-registration: when a note is parsed with an unknown type/edge, it is appended to the config and a warning is logged.

Default note types (10): concept, book-note, question, reference, index, argument, evidence, experiment, person, project

Default edge types (15): contains, part-of, causes, supports, contradicts, extends, depends-on, exemplifies, precedes, leads-to, evolved-from, related-to, authored-by, sourced-from, mentioned-in

---

## 12. Parser (crates/core/src/parser.rs)

- parse_note(content, path) -> Result<Note> -- Splits --- frontmatter, deserializes YAML, extracts inline links
- serialize_note(note) -> Result<String> -- ---\n{yaml}---\n{body}
- parse_file(root, file_path) -> Result<Note> -- Reads file, computes RelativePath, delegates to parse_note
- Inline links: regex \[([^\]]*)\]\(([^)]+\.md)\) -- Only .md targets, resolved relative to note's directory

---

## 13. Key Architectural Patterns

### Write-Through Consistency
Every mutation in Workspace updates three stores atomically:
1. In-memory notes HashMap -- The canonical note data
2. In-memory Graph -- Adjacency lists for traversal
3. SQLite Index -- FTS5 for search + edge table for backlinks
4. Filesystem -- The .md file itself

After every mutation, graph.assert_invariants() validates 7 structural invariants (debug builds only).

### Folder Node Lifecycle
Virtual folder nodes are managed incrementally:
- ensure_folder_nodes() walks up from a note's parent, creating missing folder NodeData + contains edges
- prune_empty_folder_nodes() walks up from a deleted note's parent, removing folders with no contains children

### Multi-Segment Architecture
- Each open workspace is an independent WorkspaceSlot behind its own Mutex
- The outer RwLock<HashMap> is held only for slot lookup/insert/remove
- expected_writes per slot prevents watcher feedback loops
- Each workspace gets its own file watcher (debouncer)
- Path canonicalization ensures consistent slot keys

### IPC Boundary
- Backend uses serde_yaml::Value for extra fields; frontend uses serde_json::Value
- DTOs convert between the two at the boundary via yaml_to_json / json_to_yaml
- ts-rs generates TypeScript interfaces from Rust DTOs
- All Tauri commands return Result<T, String> (errors are stringified)
- File watcher events and command-triggered events share the same brainmap://workspace-event channel

---

## 14. Cross-Reference: Backend ↔ Frontend Boundary

Findings from cross-referencing the backend implementation with the frontend researcher's analysis.

### Command Name Mapping
Notable mismatch: frontend `readNote(path)` → backend `get_node_content`. All other names follow a consistent pattern (frontend camelCase → backend snake_case).

### Command Coverage
- **38 commands registered** in backend `lib.rs`
- **37 mapped** through `BrainMapAPI` interface in frontend
- `write_log` is called directly from the frontend logger utility, not through the API bridge

### Event Decomposition
The backend emits only **3 event types** on `brainmap://workspace-event`:
1. `topology-changed` — carries added/removed nodes and edges
2. `node-updated` — single node metadata change
3. `files-changed` — non-markdown file additions/removals

The frontend's `WorkspaceEvent` discriminated union lists finer types (`node-created`, `node-deleted`, `edge-created`, `edge-deleted`). This means the frontend **decomposes** the `topology-changed` payload into granular event types based on the presence of added_nodes vs removed_nodes vs added_edges vs removed_edges.

### DTO Generation Pipeline
- Rust DTOs in `crates/app/src-tauri/src/dto.rs` derive `ts_rs::TS`
- **28 TypeScript types** generated into `crates/app/src/api/generated/`
- Regenerated by running `cargo test export_ts_bindings` in `crates/app/src-tauri/`
- Key shared types: `NodeDto`, `EdgeDto`, `NoteDetailDto`, `PlainFileDto`, `GraphTopologyDto`, `WorkspaceInfoDto`, `StatsDto`, `SearchResultDto`, `SubgraphDto`, `NodeSummaryDto`

### API Bridge Pattern
Frontend uses a `BrainMapAPI` interface with two implementations:
- `TauriBridge` — real `window.__TAURI_INTERNALS__.invoke()` calls
- `MockBridge` — in-memory for browser dev mode (no Tauri)
- Selection via `getAPI()` checking for `__TAURI_INTERNALS__`

### Multi-Segment Protocol
Frontend-backend handshake for segment management:
1. `open_workspace(path)` → opens slot + sets active + starts watcher → returns `WorkspaceInfoDto`
2. `switch_workspace(root)` → changes `active_root` (slot already open) → returns `WorkspaceInfoDto`
3. `close_workspace(root)` → stops watcher + removes slot + clears active if matching

### Additional Frontend Events
Beyond `brainmap://workspace-event`, the frontend also listens for:
- `brainmap://dock-open-segment` — macOS dock recent segment clicked
- `brainmap://dock-open-folder` — macOS dock "Open Folder" clicked

These originate from `dock_menu.rs` on the backend.
