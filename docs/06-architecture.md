# BrainMap — Technical Architecture

## Overview

BrainMap is a desktop application with a shared core library. The core handles all data operations (parsing, indexing, graph, search), and is consumed by three interfaces: the desktop app, the CLI, and the MCP server.

```
┌─────────────────────────────────────────────────┐
│                   Interfaces                     │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Desktop  │  │   CLI    │  │  MCP Server   │  │
│  │   App    │  │          │  │               │  │
│  └────┬─────┘  └────┬─────┘  └──────┬────────┘  │
│       │              │               │           │
│  ┌────▼──────────────▼───────────────▼────────┐  │
│  │              Core Library                   │  │
│  │  ┌──────────┐ ┌────────┐ ┌──────────────┐  │  │
│  │  │  Parser  │ │ Graph  │ │   Indexer    │  │  │
│  │  │ (MD+FM)  │ │ Engine │ │  (Search)    │  │  │
│  │  └──────────┘ └────────┘ └──────────────┘  │  │
│  │  ┌──────────┐ ┌────────┐ ┌──────────────┐  │  │
│  │  │   File   │ │ Config │ │  Workspace   │  │  │
│  │  │ Watcher  │ │Manager │ │  Manager     │  │  │
│  │  └──────────┘ └────────┘ └──────────────┘  │  │
│  └────────────────────────────────────────────┘  │
│                       │                          │
│              ┌────────▼────────┐                 │
│              │   File System   │                 │
│              │  (.md + .brainmap/)               │
│              └─────────────────┘                 │
└─────────────────────────────────────────────────┘
```

## Technology Stack

### Recommended: Tauri (Rust + Web Frontend)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Core library** | Rust | Performance, safety, cross-platform. Shared between CLI, desktop, and MCP server. |
| **Desktop shell** | Tauri v2 | Lightweight (uses system WebView), Rust backend, cross-platform. Much smaller than Electron. |
| **Frontend** | TypeScript + React | Mature ecosystem, abundant graph visualization libraries. |
| **Graph rendering** | Cytoscape.js (Canvas renderer) | Built-in force-directed layouts, gesture handling, stylesheet-based styling, compound nodes. Canvas rendering mandatory for 500+ node performance. |
| **Markdown editor** | CodeMirror 6 | Extensible, performant, good markdown support. |
| **Markdown rendering** | unified/remark ecosystem | Standard markdown processing pipeline. |
| **Panel layout** | FlexLayout (`flexlayout-react`) | Docking layout manager for React. Tabbed panels, drag-to-rearrange, split directions, layout serialization. |
| **State management** | Zustand | Lightweight, async-friendly, middleware for persistence and devtools. |
| **Search index** | SQLite (via rusqlite) | Embedded, zero-config, FTS5 for full-text search. Ready for future extensions. |
| **File watching** | notify (Rust crate) | Cross-platform native file watching. |
| **CLI** | clap (Rust crate) | Standard Rust CLI framework. |
| **MCP server** | Rust MCP SDK | Native MCP implementation for the Rust core. |

### Why Tauri over Electron

- **Binary size**: ~5-10MB vs ~150MB+ for Electron
- **Memory**: Uses system WebView, not bundled Chromium
- **Performance**: Rust backend is significantly faster for graph operations, file parsing, and indexing
- **Cross-platform**: macOS, Windows, Linux
- **Security**: Rust's memory safety; Tauri's permission model for system access

### Alternative: Electron

If the team is more comfortable with TypeScript end-to-end, Electron is viable. The core library would be TypeScript/Node.js instead of Rust. Trade-off: heavier runtime, but faster development if Rust is not familiar.

## Core Library Modules

### 1. Parser (`core::parser`)

Responsible for reading `.md` files and extracting structured data.

**Responsibilities:**
- Parse YAML frontmatter from markdown files
- Extract inline markdown links `[text](path)` from content
- Validate frontmatter against the base schema
- Serialize frontmatter changes back to files (preserving content)

**Key types:**
```
Note {
  path: RelativePath
  frontmatter: Frontmatter
  content: String
  inline_links: Vec<InlineLink>
}

Frontmatter {
  title: String
  type: String
  tags: Vec<String>
  status: Option<Status>
  created: Date
  modified: Date
  source: Option<String>
  summary: Option<String>
  links: Vec<TypedLink>
  extra: HashMap<String, Value>  // type-specific fields
}

TypedLink {
  target: RelativePath
  rel: String
}
```

### 2. Graph Engine (`core::graph`)

In-memory graph representation with traversal and query capabilities.

**Responsibilities:**
- Build graph from parsed notes (explicit links + directory-derived edges)
- Add/remove nodes and edges
- Neighborhood queries (N-hop traversal)
- Shortest path finding (BFS/Dijkstra)
- Subgraph extraction
- Cluster detection (connected components, community detection)
- Graph statistics

**Data structure:**
- Adjacency list representation
- Bidirectional index (outgoing + incoming edges per node)
- Node lookup by path (HashMap)
- Designed for <500 nodes now, but adjacency list scales to thousands

### 3. Indexer (`core::index`)

Search index using SQLite FTS5.

**Responsibilities:**
- Full-text index of note content and frontmatter fields
- Filtered search (by type, tags, status)
- Incremental index updates (only re-index changed files)
- Index persistence in `.brainmap/index.db`

**Schema:**
```sql
CREATE VIRTUAL TABLE notes_fts USING fts5(
  path,
  title,
  type,
  tags,
  content,
  summary
);

CREATE TABLE notes_meta (
  path TEXT PRIMARY KEY,
  type TEXT,
  status TEXT,
  created TEXT,
  modified TEXT,
  file_mtime INTEGER  -- for incremental indexing
);

CREATE TABLE edges (
  source TEXT,
  target TEXT,
  rel TEXT,
  implicit BOOLEAN,  -- true for directory-derived
  PRIMARY KEY (source, target, rel)
);
```

**Future extension point:** Add an `embeddings` table for semantic search without restructuring.

### 4. File Watcher (`core::watcher`)

Watches the workspace directory for changes.

**Responsibilities:**
- Detect file create/modify/delete/rename events
- Debounce rapid changes (configurable interval, default 2s)
- Trigger incremental re-parse and re-index for affected files
- Emit events for the UI to react to (new node, updated node, removed node, edge change)

**Self-Change Detection:**

The `notify` crate does not distinguish between self-triggered and external writes. To avoid re-processing changes the app itself made, the watcher maintains an "expected writes" `HashSet` containing file hashes for recently written files. When a watcher event fires, the watcher computes the file hash and checks it against the expected set. If it matches, the event is suppressed and the entry is removed from the set.

**Platform Notes:**
- **macOS**: Uses FSEvents, which is efficient and does not require per-directory watches.
- **Linux**: Uses inotify, which requires a watch per directory. Deeply nested workspaces can hit the default inotify watch limit (8192 on many distros). The app should log a warning and recommend `sysctl fs.inotify.max_user_watches=65536` adjustment. Polling mode is available as a fallback when inotify limits are reached.

### 5. Config Manager (`core::config`)

Manages workspace configuration.

**Responsibilities:**
- Read/write `.brainmap/config.yaml`
- Manage registered note types and edge types
- Store UI preferences (graph colors, layout settings)
- Federation configuration

### 6. Workspace Manager (`core::workspace`)

High-level orchestration of a workspace.

**Responsibilities:**
- Initialize new workspaces (`brainmap init`)
- Load workspace: parse all files -> build graph -> build index
- Validation (broken links, orphans, schema checks)

The Workspace Manager no longer directly coordinates file watcher events or handles federation resolution. These are extracted into dedicated modules below.

### 7. Federation Resolver (`core::federation`)

Handles cross-workspace reference resolution as a standalone module.

**Responsibilities:**
- Resolve federated workspace paths from configuration
- Validate cross-workspace links
- Provide read-only access to external workspace graphs

Federation UI is deferred to Phase 4, but the resolver exists in the core to support the architecture.

### 8. Event Bus (`core::events`)

An explicit event bus using `tokio::sync::broadcast` for watcher event coordination.

**Responsibilities:**
- The file watcher publishes events (file created, modified, deleted, renamed) to the bus.
- Subscribers consume events independently: the graph engine, the indexer, and the UI layer each subscribe and process events in their own way.
- Decouples modules and makes the data flow testable.

## Interface Layers

### CLI (`cli/`)

Thin layer over the core library. Each CLI command maps to a core function.

```
cli/
├── main.rs           # Entry point, argument parsing (clap)
├── commands/
│   ├── init.rs
│   ├── node.rs       # create, read, update, delete, list
│   ├── link.rs       # link, unlink, links
│   ├── search.rs
│   ├── graph.rs      # neighbors, path, subgraph
│   ├── validate.rs
│   ├── stats.rs
│   ├── export.rs
│   └── serve.rs
└── output.rs         # Format output as text/json/yaml
```

### MCP Server (`mcp/`)

Wraps core library functions as MCP tools.

```
mcp/
├── server.rs         # MCP server setup, tool registration
├── tools/
│   ├── node.rs       # brainmap_node_get, _list, _create, _update, _delete
│   ├── edge.rs       # brainmap_link_create, _delete, _list
│   ├── search.rs     # brainmap_search
│   ├── graph.rs      # brainmap_neighbors, _path_find, _subgraph
│   └── workspace.rs  # brainmap_status, _validate, _stats
└── resources.rs      # MCP resource handlers
```

### Desktop App (`app/`)

Tauri app with React frontend.

```
app/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs       # Tauri entry point
│   │   └── commands.rs   # Tauri commands (bridge core → frontend)
│   └── tauri.conf.json
├── src/                   # React frontend
│   ├── App.tsx
│   ├── components/
│   │   ├── GraphView/     # Force-directed graph (Cytoscape.js)
│   │   ├── Editor/        # CodeMirror markdown editor
│   │   ├── Search/        # Search panel
│   │   ├── Inspector/     # Node metadata panel
│   │   ├── CommandPalette/
│   │   ├── StatusBar/
│   │   └── Layout/        # Panel management (drag, resize, split)
│   ├── hooks/
│   │   ├── useGraph.ts    # Graph data and operations
│   │   ├── useSearch.ts
│   │   └── useWorkspace.ts
│   └── stores/
│       ├── graphStore.ts  # Graph state (nodes, edges, selection)
│       ├── uiStore.ts     # Panel layout, theme, preferences
│       └── workspaceStore.ts
├── package.json
└── vite.config.ts
```

## Data Flow

### Startup

```
1. CLI/App reads .brainmap/config.yaml
2. Workspace Manager scans all .md files
3. Parser extracts frontmatter + inline links from each file
4. Graph Engine builds in-memory graph (explicit + directory-derived edges)
5. Indexer checks index freshness, incrementally updates stale entries
6. File Watcher starts monitoring the directory
7. UI renders graph from in-memory state
```

### File Change (external edit)

```
1. File Watcher detects change, debounces
2. Parser re-parses affected file(s)
3. Graph Engine diffs and updates (add/remove nodes/edges)
4. Indexer updates affected entries
5. UI receives change event, animates graph update
```

### User Creates a Link (via UI)

```
1. User switches graph to Edit mode via toolbar toggle
2. User drags from node A to node B, selects relationship type from dropdown
3. Frontend calls Tauri command: create_link(A, B, "extends")
4. Core: updates A's frontmatter (adds link entry)
5. Core: writes updated frontmatter to A.md file
6. File Watcher suppresses self-triggered change (matched in expected-writes set)
7. Graph Engine adds edge
8. UI animates new edge appearing
```

## Git Integration

- The app detects if the workspace is inside a git repo.
- Status bar shows current branch and clean/dirty status.
- Node Inspector can show git log for the current file.
- No git operations are performed automatically — the user manages commits externally or via CLI.

## Performance Considerations

### Current Scale (<500 nodes)
- Entire graph fits in memory comfortably
- Full re-index takes <1 second
- **Canvas rendering** (via Cytoscape.js Canvas renderer) is mandatory from day one. SVG rendering bogs down past ~300 nodes and is not an option.
- If any JS-side layout adjustments are needed beyond the pre-computed positions from Rust, run the force simulation in a **Web Worker** to avoid blocking the main thread.

### Future Scale (5000+ nodes)
- **Lazy loading**: Only render visible nodes in the graph viewport
- **Virtual scrolling**: For large search result lists
- **Background indexing**: Index updates in a separate thread
- **Graph partitioning**: Load subgraphs on demand instead of full graph
- **SQLite for graph storage**: If in-memory graph becomes too large, back it with SQLite

The architecture supports all of these without structural changes — the core library abstractions (Graph Engine, Indexer) hide the storage backend from consumers.

## Tauri IPC Strategy

The Tauri IPC bridge can become a bottleneck if every graph interaction requires a round-trip. To prevent this:

- **Frontend graph topology cache**: The frontend holds a local copy of the graph topology (nodes, edges, and metadata). This cache does NOT include file content.
- **Incremental diffs via `tauri::Event`**: The Rust backend pushes incremental graph diffs to the frontend via Tauri's event system whenever the graph changes (file watcher updates, user mutations). The frontend applies these diffs to its local cache.
- **On-demand content fetching**: File content is fetched from Rust only when a node is selected and opened in the Editor. This keeps the IPC payload small for graph operations.

This model means the graph can render, filter, and respond to interactions entirely from the local cache without IPC round-trips.

## Graph Engine Mutation Model

The graph engine follows a **single-writer model**:

- All mutations (node CRUD, edge CRUD) go through the core library. The frontend never directly modifies the graph topology cache except for position changes.
- File watcher events are queued and processed sequentially to avoid race conditions between external edits and UI-initiated mutations.
- **Optimistic UI for positions**: Drag-to-reposition is applied immediately on the frontend for responsiveness. Position data is non-authoritative and local to the UI.
- **Backend-authoritative for data mutations**: Node/edge creation, deletion, and metadata changes are sent to Rust, applied there, and the resulting diff is pushed back to the frontend. If a write fails, the frontend reverts the optimistic change.

## Startup Optimization

To minimize perceived startup time for large workspaces:

1. **Cache graph topology** in `.brainmap/graph-cache.json` (nodes, edges, positions).
2. On startup: render the graph immediately from the cached topology.
3. Parse all `.md` files in the background.
4. Diff the parsed results against the cache.
5. Push incremental updates to the UI for any changes detected.

This makes startup feel instant even for workspaces with hundreds of files. The cached index is also loaded first so search works immediately while the background diff runs.

## Pre-Computed Layout

To avoid the 300-tick force simulation warm-up stutter on the JavaScript side:

- Use the **`fdg`** Rust crate to run force-directed layout computation in Rust during workspace loading.
- Send pre-computed `(x, y)` positions to the frontend alongside the graph topology.
- The frontend renders nodes at their pre-computed positions immediately. Cytoscape.js handles only incremental layout adjustments (e.g., when a new node is added).
- If JS-side incremental layout adjustments are needed, run the force simulation in a **Web Worker** to keep the main thread responsive.

## Tauri Command Contract

The Tauri command surface area is the API contract between frontend and backend. To prevent the bridge from becoming an untyped mess of `serde_json::Value`:

- Use **`specta`** or **`ts-rs`** to auto-generate TypeScript types from Rust structs.
- All Tauri commands accept and return strongly typed structs, not raw JSON.

**Command surface area categories:**

| Category | Examples |
|----------|----------|
| **Workspace ops** | `open_workspace`, `create_workspace`, `get_workspace_status` |
| **Node CRUD** | `create_node`, `get_node`, `update_node`, `delete_node`, `list_nodes` |
| **Edge CRUD** | `create_edge`, `delete_edge`, `list_edges` |
| **Search** | `search_notes`, `search_by_filter` |
| **Graph traversal** | `get_neighbors`, `find_path`, `extract_subgraph` |
| **Config** | `get_config`, `update_config`, `get_note_types` |
| **Validation** | `validate_workspace`, `validate_node` |

## Dirty State Model

Track unsaved changes per editor tab to prevent data loss:

- Each editor tab maintains a **dirty flag** that is set when the user modifies content and cleared on save.
- A **dot indicator** on the tab header signals unsaved changes.
- **Prompt on close**: If the user closes a dirty tab or quits the app, show a confirmation dialog: "You have unsaved changes. [Save] [Discard] [Cancel]".
- **Block external reload if dirty**: When the file watcher detects an external change to a file with unsaved editor changes, the editor does NOT auto-reload. Instead, it shows the conflict banner: "File changed externally. [Show Diff] [Keep Mine] [Accept Theirs]" (see desktop app spec for details).
