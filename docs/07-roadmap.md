# BrainMap — Delivery Roadmap

## Phase 1a: Scaffold + Core Library

**Goal**: A proven core library with a stable public API that parses notes, builds an in-memory graph, indexes content, and manages workspaces. The core library's public API is the critical artifact of this phase — every downstream consumer (CLI, desktop app, MCP server) depends on it.

### Deliverables

1. **Project scaffold**
   - Tauri v2 project setup (Rust + React + TypeScript)
   - Monorepo structure: `core/`, `cli/`, `mcp/`, `app/`
   - Build system, dev server, hot reload

2. **Core library (Rust)**
   - Markdown + YAML frontmatter parser
   - In-memory graph engine (nodes, typed edges, directory-derived edges)
   - SQLite FTS5 search index
   - Workspace manager (init, load, validate)
   - Config manager

3. **Seed dataset**
   - 30-35 notes based on "The Book of Why" expanded with full content
   - Covers all note types, edge types, and structural patterns
   - Serves as test data and reference implementation of the data model

> **Co-development dependency**: The seed dataset and the parser must be built together. The dataset defines frontmatter structures and edge type semantics that the parser must handle. Building the parser first and assembling the dataset later will produce mismatches (e.g., edge type naming, federated link syntax, type-specific fields). Iterate on both in lockstep.

### Exit criteria

- `brainmap init` works and creates a valid workspace
- All 28+ seed notes parse without errors, all edges resolve, `brainmap validate` passes
- Unit and integration tests cover all note types and all edge types
- Performance baseline: 500-node synthetic graph loads in under 2 seconds
- Data model validation gate: frontmatter schema is proven in practice against the full seed dataset

---

## Phase 1b: CLI Smoke Commands

**Goal**: A minimal CLI wrapping the core library that validates the public API under real usage and provides a testable interface before any UI work begins.

### Deliverables

1. **Minimal CLI commands**
   - `init` — create/initialize a workspace
   - `node create` / `node read` / `node list` — basic node CRUD
   - `search` — keyword search with filters
   - `link create` / `link list` — basic relationship management
   - `neighbors` — graph neighborhood traversal

2. **Output formatting**
   - `--format json` (machine-readable, valid and parseable)
   - `--format text` (human-readable, default)

### Exit criteria

- Every smoke command works end-to-end against the seed dataset
- JSON output is valid and parseable for all commands
- Error handling: bad paths, broken frontmatter, and missing files produce clear, actionable error messages
- CLI validates the core library API under real usage patterns

---

## Phase 1c: Desktop App

**Goal**: A working desktop app where you can open a workspace, see notes as a graph, click to read/edit, and create typed relationships. With the core library already proven via CLI, this phase focuses purely on UI/UX concerns.

### Deliverables

1. **Desktop app**
   - Flexible panel layout (drag, resize, split)
   - Force-directed graph view (D3.js or Cytoscape.js)
     - Nodes colored by type
     - Edge arrows with relationship type labels
     - Click to select, double-click to expand neighbors
     - Zoom, pan, drag
   - Basic markdown editor (CodeMirror 6)
     - Syntax highlighting
     - Link autocomplete
     - Frontmatter form
   - Search panel (keyword search with type/tag filters)
   - Node Inspector panel
   - Command palette (Cmd+P)
   - Status bar
   - File watcher with debounce

> **Timeboxed graph view**: Basic interactions only in this phase — click to select, double-click to expand neighbors, zoom, pan. Hover tooltips, smooth expand animations, edge label polish, and label collision handling are deferred to Phase 4.
>
> **Risk note**: Force-directed graph layouts with typed, labeled edges are notoriously finicky. Label collision, edge bundling, and performance on larger graphs can consume disproportionate time. Timebox graph view work aggressively and defer polish.

### Exit criteria

- User can open a workspace and see the graph in the desktop app
- Clicking a node shows its content; double-clicking reveals neighbors
- Search returns results filtered by type/tag
- Graph colors by type, edges show labels
- File changes externally → graph updates automatically

---

## Phase 2: Full CLI

**Goal**: Complete CLI covering all operations, making the knowledge base fully manageable from the terminal and scriptable by AI agents.

### Deliverables

1. **CLI commands (all groups)**
   - Workspace: `init`, `status`, `config`, `federation add`
   - Node CRUD: `node create/read/update/delete/list`
   - Relationships: `link`, `unlink`, `links`
   - Search: `search` with all filters
   - Graph queries: `neighbors`, `path`, `subgraph`
   - Maintenance: `validate`, `stats`, `reindex`
   - Export: `export` (JSON, DOT, GraphML)
   - Server: `serve`

2. **Output formatting**
   - `--format text` (human-readable, default)
   - `--format json` (machine-readable, for AI agents and scripts)
   - `--format yaml`

### Exit criteria

- Every operation from the CLI spec doc works end-to-end
- `brainmap search "X" --format json` produces valid, parseable JSON
- `brainmap path A B` finds shortest paths
- `brainmap validate` catches broken links and orphans
- All error cases from the Error Behavior spec produce correct behavior (bad paths, broken frontmatter, circular links, missing files)

---

## Phase 3: MCP Server

**Goal**: AI agents can natively connect to BrainMap and query/traverse/modify the knowledge graph through MCP.

### Deliverables

1. **MCP server (stdio transport)**
   - All low-level tools from the MCP spec
   - Node CRUD tools
   - Edge tools
   - Search tool
   - Graph traversal tools (neighbors, path, subgraph)
   - Workspace tools (status, validate, stats)

2. **MCP resources**
   - `brainmap://nodes/{path}` — note content
   - `brainmap://graph` — full graph JSON
   - `brainmap://config` — workspace config

3. **Integration testing**
   - Test with Claude Code as the MCP client
   - Verify all tools work correctly through the protocol

### Exit criteria

- Add BrainMap as an MCP server in Claude Code config
- Claude can answer "how does concept A relate to concept B?" using `brainmap_path_find`
- Claude can create a new note via `brainmap_node_create`
- Claude can search and filter notes
- Latency criterion: all MCP tools respond in under 500ms for a 500-node workspace

---

## Phase 4: Polish & Advanced Features

**Goal**: Refine the experience and add capabilities that were deferred.

### Deliverables (pick based on priority)

- **Graph view polish** — hover tooltips, smooth expand animations, edge label rendering, label collision avoidance
- **Multiple graph layouts** — hierarchical, radial, etc.
- **Rich editor** — toolbar, drag-and-drop links, LaTeX rendering
- **Graph filters UI** — filter bar for type, tags, status, edge type
- **Focus mode** — show only neighborhood of selected node
- **Git integration** — show git log per note, branch/status in status bar
- **Federated workspaces** — cross-workspace links and graph merging
- **Export to image** — PNG/SVG export of graph views
- **Theming** — light/dark mode, custom color schemes
- **Keyboard shortcut customization**

---

## Future (v2+)

- **Semantic search** — embedding-based search using local or API models
- **AI semantic tools** — `explore_topic`, `suggest_links`, `summarize_area`, `ask`
- **Multi-user** — concurrent editing, permissions
- **Block-level references** — link to specific paragraphs
- **Plugin system** — custom visualizations, data sources, integrations
- **Mobile companion** — read-only mobile viewer
- **Cloud sync** — optional sync across devices
