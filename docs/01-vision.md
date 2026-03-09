# BrainMap — Product Vision

## What is BrainMap?

BrainMap is a personal knowledge graph tool that turns structured `.md` files into an interactive, queryable, visual knowledge base. It combines the file-based simplicity of markdown notes with the power of a graph database, accessible through a desktop app, CLI, and MCP server for AI agent integration.

## Problem

Existing tools like Obsidian provide graph views but fall short in three critical areas:

1. **No typed relationships** — Obsidian shows that connections exist, but not *what kind*. A "causes" link looks identical to a "contradicts" link.
2. **No AI agent integration** — No native way for AI agents to query, traverse, or co-manage the knowledge graph programmatically.
3. **Poor queryability** — Cannot ask graph-level questions like "what connects X to Y?" or filter views by relationship type.

BrainMap solves all three while keeping notes as plain `.md` files — portable, version-controllable, and human-readable.

## Goals

- **Graph-first knowledge management**: Notes are nodes. Relationships are typed, directional edges with labels visible on the graph.
- **AI-native**: Full MCP server + CLI so AI agents can read, query, traverse, and (with permission) modify the knowledge base.
- **File-based**: All data lives in `.md` files with YAML frontmatter. No proprietary database. Git-friendly.
- **Desktop-first UX**: A flexible panel-based desktop app with interactive graph visualization, markdown editor, and search.
- **Extensible**: Plugin-ready architecture. Start simple, grow into semantic search, multiple layout algorithms, rich editors, and multi-user collaboration.

## Non-Goals (v1)

- Real-time collaboration / multi-user
- Semantic/embedding-based search (architecture ready, not implemented)
- Mobile app
- Cloud sync
- WYSIWYG rich editor (basic markdown editor in v1)
- Migration tooling for Obsidian vaults

## Key Principles

1. **Files are the source of truth** — The `.md` files on disk are the canonical data. The app indexes them; it never holds state that isn't in the files.
2. **Hybrid structure** — Directory hierarchy provides parent/child relationships automatically. Frontmatter provides all other typed relationships. Both coexist.
3. **Backlinks as a first-class concern** — Edges are directional and stored only in the source note's frontmatter, so "what links to this note?" requires an index. The backlink index is maintained as a core system feature, not an afterthought. Every interface (CLI, MCP, desktop) can query backlinks efficiently.
4. **CLI-first core** — Every operation the desktop app can do, the CLI can do. AI agents and humans share the same interface.
5. **Start simple, extend later** — Edge metadata starts as type + direction. Search starts as keyword. Editor starts as basic. Architecture supports growth without rewrites.
6. **Federated workspaces** — Multiple independent knowledge graphs that can optionally cross-reference each other.

## Core Operations Catalog

This is the contract that all interfaces (CLI, MCP server, desktop app) implement. Every operation listed here is available through every interface.

### Note Operations

| Operation | Description |
|-----------|-------------|
| `create-note` | Create a new note with frontmatter and optional content |
| `read-note` | Read a note's frontmatter, content, or both |
| `update-note` | Modify a note's frontmatter fields or content |
| `delete-note` | Remove a note and clean up inbound references |
| `move-note` | Rename or relocate a note; update all inbound links atomically |

### Link Operations

| Operation | Description |
|-----------|-------------|
| `create-link` | Add a typed edge from one note to another |
| `delete-link` | Remove a specific edge between two notes |
| `list-links` | List all outbound and inbound links for a note |

### Search Operations

| Operation | Description |
|-----------|-------------|
| `search` | Full-text and frontmatter field search across the workspace |

### Graph Traversal Operations

| Operation | Description |
|-----------|-------------|
| `traverse-neighbors` | All nodes directly connected to a given note |
| `find-path` | Shortest path between two notes |
| `extract-subgraph` | All nodes and edges within N hops of a given note |

### Workspace Operations

| Operation | Description |
|-----------|-------------|
| `init-workspace` | Initialize a new workspace (create `.brainmap/` directory and config) |
| `validate` | Check workspace integrity: broken links, invalid frontmatter, orphaned notes |
| `stats` | Workspace statistics: note count, edge count, type distribution |
| `export` | Export the graph or a subgraph to a specified format |
| `reindex` | Full rebuild of the search and backlink index |
| `config` | Read or update workspace configuration |

### Federation Operations

| Operation | Description |
|-----------|-------------|
| `federation-add` | Register an external workspace for cross-referencing |
| `federation-remove` | Unregister a federated workspace |
| `federation-list` | List all federated workspaces and their status |
| `federation-sync` | Refresh the index of federated workspace references |

## Users

- **Primary**: The author — reading, writing, organizing, and querying personal knowledge.
- **Secondary**: AI agents — consulting the knowledge base, suggesting connections, answering questions from the graph.

## Success Criteria

- A user can create a workspace, add notes with typed relationships, and see them in an interactive force-directed graph within 5 minutes.
- An AI agent (via MCP) can answer "how does concept A relate to concept B?" by traversing the graph.
- The CLI can perform every CRUD, search, and graph operation without the desktop app running.
