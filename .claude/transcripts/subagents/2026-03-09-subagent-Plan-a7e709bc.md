# 2026-03-09 — Subagent Transcript: Plan

**Date:** 2026-03-09 17:42:07
**Agent:** Plan
**Agent ID:** a7e709bce8c4e3ac4
**Parent Session:** ba732d96-401a-4b82-b69a-43c622866e5c

---

## User

You are planning the Phase 1c implementation of BrainMap — a desktop app using Tauri v2 + React + TypeScript.

## Context

BrainMap is a personal knowledge graph tool. The Rust core library is complete with: parser, graph engine, SQLite FTS5 index, workspace manager, config, export. The CLI (Phase 1b/2) and MCP server (Phase 3) are complete. Now we need the desktop app.

The project root is at `/Users/bsmonteiro/Desktop/Personal/brainmap/`. Existing crates: `crates/core`, `crates/cli`, `crates/mcp`, `crates/tauri-plugin` (stub).

## Key Architecture Decisions (from docs)

**Stack**: Tauri v2, React, TypeScript, Cytoscape.js (Canvas), CodeMirror 6, FlexLayout (flexlayout-react), Zustand

**Tauri IPC Strategy**:
- Frontend holds local cache of graph topology (no file content)
- Backend pushes incremental diffs via `tauri::Event`
- File content fetched on-demand when node selected
- Use `specta` or `ts-rs` for auto-generated TypeScript types from Rust structs

**Pre-computed Layout**:
- Use `fdg` Rust crate to run force-directed layout in Rust
- Send pre-computed (x, y) positions to frontend
- Cytoscape.js handles only incremental adjustments (in Web Worker if needed)

**Startup Optimization**:
- Cache graph topology in `.brainmap/graph-cache.json`
- Render from cache immediately, parse in background, push diffs

**Single-writer model**: All mutations go through Rust backend, optimistic UI only for positions.

## Dev Server Strategy for Browser Testing

IMPORTANT: The user wants to be able to test the UI through Chrome (via Claude-in-Chrome MCP tools) during development. This means:
1. Vite dev server on localhost must work standalone in Chrome
2. Tauri API calls (`invoke()`) must be mocked when running in browser
3. A mock layer that returns test data (from the seed dataset) when `window.__TAURI__` is not available
4. This is critical for the development workflow — plan it as a first-class concern

## Phase 1c Exit Criteria (from roadmap)
- User can open a workspace and see the graph
- Clicking a node shows its content; double-clicking reveals neighbors
- Search returns results filtered by type/tag
- Graph colors by type, edges show labels
- File changes externally → graph updates automatically

## Desktop App Spec Features for v1
- FlexLayout panel system (Graph View, Editor, Search, Node Inspector, Neighbors, Path Finder)
- Cytoscape.js Canvas graph with force-directed layout
- Navigate/Edit mode toggle on graph
- CodeMirror 6 markdown editor with link autocomplete + frontmatter form
- Search panel with type/tag/status filters
- Node Inspector panel
- Command palette (Cmd+P)
- Status bar
- File watcher with debounce
- Light/dark theming with system detection
- Keyboard shortcuts
- Empty/loading/error states
- Window management (single window, layout persistence)

## Existing Code
- `crates/tauri-plugin/` exists as a stub with Cargo.toml and src/lib.rs
- `crates/core/src/workspace.rs` is the main API surface (open, init, CRUD, search, graph queries, validate, stats, reindex)
- All core types have Serialize derive

## What to Plan

Design a step-by-step implementation plan that:
1. Scaffolds the Tauri v2 + React app properly within the existing workspace
2. Sets up the Vite dev server with Tauri API mocking for Chrome-based testing
3. Implements the Tauri Rust commands bridging core library to frontend
4. Implements React components incrementally (most foundational first)
5. Considers the right order of implementation to have something testable at each step
6. Addresses type generation (Rust → TypeScript)
7. Plans for the file watcher integration
8. Identifies risks and mitigations

Think about what can be parallelized and what depends on what. Think about the minimal viable path to meet exit criteria vs full spec. Think about the dev server mock layer architecture.

Provide a detailed, actionable plan with clear steps, file paths, and dependencies.

---

## Assistant



I'll explore the existing codebase thoroughly to understand the current state before designing the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/Cargo.toml"}`

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/lib.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/tauri-plugin/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/tauri-plugin/src/lib.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/error.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/export.rs"}`

---

## Assistant

Now let me look at the docs directory and the MCP crate for patterns to follow.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"docs/**/*.md","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/","description":"List MCP crate contents"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/index.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/05-desktop-app.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/06-architecture.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/07-roadmap.md"}`

---

## Assistant

Now let me look at the MCP crate structure for patterns and the seed dataset.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -R /Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/","description":"List MCP crate structure"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/seed/ | head -20","description":"List seed dataset files"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/server.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/config.rs"}`

---

## Assistant

Now let me check the core crate's Cargo.toml for dependencies and see what the CLI commands look like for patterns.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/main.rs"}`

---

## Assistant

Now I have a thorough understanding of the codebase. Let me present the full implementation plan.

---

# Phase 1c Implementation Plan: BrainMap Desktop App (Tauri v2 + React)

## Current State Summary

The Rust workspace at `/Users/bsmonteiro/Desktop/Personal/brainmap/` has:
- **`crates/core`** -- Complete: parser, graph engine (adjacency list with `Graph`, `Subgraph`, `NodeData`, `Edge`), SQLite FTS5 index, workspace manager, config, export. All types derive `Serialize`.
- **`crates/cli`** -- Complete: full CLI with all commands.
- **`crates/mcp`** -- Complete: MCP server wrapping core via `Arc<Mutex<Workspace>>`.
- **`crates/tauri-plugin`** -- Stub: just re-exports `brainmap_core`.
- **`seed/`** -- 34-note dataset in 8 directories.

The `Workspace` struct is the primary API surface. It holds `root`, `config`, `graph`, `index`, and `notes` (a `HashMap<RelativePath, Note>`). All mutations go through its methods.

## Key Design Decisions

### 1. Crate structure: Replace `tauri-plugin` with `app` (a Tauri v2 app crate)

The existing `tauri-plugin` stub is almost empty. Rather than building a plugin that another Tauri app consumes, create the Tauri app directly as `crates/app/`. The Tauri Rust backend (`src-tauri/`) lives inside this crate and depends on `brainmap-core`. The React frontend lives under `crates/app/` as well.

### 2. `ts-rs` over `specta` for type generation

`ts-rs` is simpler and does not require Tauri integration. Add `#[derive(TS)]` to the core types that cross the IPC boundary. Generate `.d.ts` files that the React app imports. This is less invasive than `specta` which requires wrapping every Tauri command.

### 3. Mock layer architecture for browser testing

The mock layer intercepts all `@tauri-apps/api/core` `invoke()` calls. When `window.__TAURI__` is absent (i.e., running in plain Chrome via Vite dev server), the mock layer returns pre-built responses derived from the seed dataset. This is implemented as:

- A `src/lib/tauri-bridge.ts` module that wraps every backend call.
- A `src/lib/mock-backend.ts` module with a static snapshot of the seed dataset (exported as JSON from the CLI).
- The bridge checks `window.__TAURI__` at import time and routes to real invoke or mock.

### 4. Pre-computed layout in Rust using `fdg`

The `fdg` crate runs force-directed layout computation on the Rust side. Positions are sent alongside graph topology. This avoids the JS force simulation warmup stutter.

---

## Step-by-Step Implementation Plan

### Step 0: Pre-work -- Generate Seed Data Snapshot and Type Definitions

**Goal**: Produce the artifacts other steps depend on.

**Tasks**:
1. Add `ts-rs` dependency to `crates/core/Cargo.toml` and derive `TS` on the types that cross IPC: `NodeData`, `Edge`, `EdgeKind`, `Subgraph`, `SearchResult`, `SearchFilters`, `WorkspaceStats`, `ValidationIssue`, `Severity`, `Note`, `Frontmatter`, `TypedLink`, `Status`, `Direction`, `RelativePath`, `NoteId`, `WorkspaceConfig`.
2. Create a build script or test that exports TypeScript definitions to `crates/app/src/generated/types.ts`.
3. Run `cargo run -p brainmap-cli -- --workspace seed/ export --export_format json > crates/app/src/lib/seed-data.json` to produce the mock dataset.
4. Also export individual notes (a small script that calls `node read` for each note and assembles a JSON map of path to note content).

**Output files**:
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/Cargo.toml` -- modified (add `ts-rs`)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/generated/types.ts` -- generated
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/lib/seed-data.json` -- generated

**Dependencies**: None.

---

### Step 1: Scaffold Tauri v2 + React App

**Goal**: A working Tauri v2 app with React, Vite, and TypeScript that renders "Hello World" both in the Tauri window and in Chrome.

**Tasks**:
1. Remove `crates/tauri-plugin` from the workspace members in the root `Cargo.toml`.
2. Create the Tauri v2 app structure under `crates/app/`:
   ```
   crates/app/
   ├── src-tauri/
   │   ├── Cargo.toml          # depends on brainmap-core, tauri, serde, serde_json, notify, fdg
   │   ├── tauri.conf.json     # Tauri v2 config
   │   ├── capabilities/       # Tauri v2 permissions
   │   └── src/
   │       ├── main.rs          # Tauri entry point
   │       ├── commands.rs      # Tauri IPC commands
   │       ├── state.rs         # AppState holding Arc<Mutex<Workspace>>
   │       └── watcher.rs       # File watcher (later step)
   ├── src/                    # React frontend
   │   ├── main.tsx
   │   ├── App.tsx
   │   ├── lib/
   │   │   ├── tauri-bridge.ts  # Abstraction over invoke()
   │   │   ├── mock-backend.ts  # Mock responses for browser dev
   │   │   └── seed-data.json   # Seed dataset snapshot
   │   ├── generated/
   │   │   └── types.ts         # Auto-generated from Rust
   │   ├── stores/              # Zustand stores
   │   ├── components/          # React components
   │   └── hooks/               # Custom hooks
   ├── index.html
   ├── package.json
   ├── tsconfig.json
   ├── vite.config.ts
   └── tailwind.config.ts      # optional, CSS framework choice
   ```
3. Add `crates/app/src-tauri` to the workspace members in root `Cargo.toml` (e.g., as `crates/app/src-tauri`).
4. Initialize npm project with dependencies:
   - `react`, `react-dom`, `@tauri-apps/api` (v2), `@tauri-apps/plugin-shell`
   - `cytoscape`, `@codemirror/state`, `@codemirror/view`, `@codemirror/lang-markdown`
   - `flexlayout-react`, `zustand`
   - Dev: `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`, `@types/cytoscape`
5. Configure `vite.config.ts` with the React plugin and Tauri dev server integration.
6. Configure `tauri.conf.json` for Tauri v2 with a dev server URL of `http://localhost:1420`.

**Verification**: `npm run dev` starts the Vite server on `:1420` and shows content in Chrome. `cargo tauri dev` opens the Tauri window rendering the same content.

**Dependencies**: Step 0 (for types.ts and seed-data.json, but can start in parallel with placeholder types).

---

### Step 2: Tauri API Mock Layer (Browser-First Development)

**Goal**: All frontend code can run in Chrome without Tauri. The mock layer provides realistic test data.

**Tasks**:
1. Create `src/lib/tauri-bridge.ts`:
   ```typescript
   // Detects environment and routes to real Tauri invoke or mock
   const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;
   
   export async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
     if (isTauri) {
       const { invoke: tauriInvoke } = await import('@tauri-apps/api/core');
       return tauriInvoke<T>(cmd, args);
     }
     const { mockInvoke } = await import('./mock-backend');
     return mockInvoke<T>(cmd, args);
   }
   
   export function listen(event: string, handler: (payload: any) => void): () => void {
     if (isTauri) {
       // Use @tauri-apps/api/event
       ...
     }
     // Mock: no-op or simulate events
     return () => {};
   }
   ```
2. Create `src/lib/mock-backend.ts`:
   - Import `seed-data.json` (the graph topology export).
   - Implement `mockInvoke()` that handles each command name:
     - `open_workspace` -- returns a mock workspace status.
     - `get_graph_topology` -- returns nodes + edges + pre-computed positions from seed data.
     - `get_node_content` -- returns the body/frontmatter for a given path from the seed snapshot.
     - `search_notes` -- does a basic string match on titles/bodies in the seed data.
     - `get_neighbors` -- filters edges from the seed data.
     - `get_stats` -- returns counts.
   - Does not need to support mutations in v1 mock (can log to console).
3. All React components import from `tauri-bridge.ts`, never directly from `@tauri-apps/api`.

**Verification**: Open `http://localhost:1420` in Chrome (no Tauri window). Console shows mock data being returned. Test with Claude-in-Chrome MCP tools.

**Dependencies**: Step 1 (scaffold), Step 0 (seed-data.json).

---

### Step 3: Tauri Rust Commands (Backend Bridge)

**Goal**: Implement the Tauri command handlers that bridge `brainmap-core::Workspace` to the frontend.

**Tasks**:
1. Create `src-tauri/src/state.rs`:
   ```rust
   pub struct AppState {
       pub workspace: Arc<Mutex<Option<Workspace>>>,
   }
   ```
   Use `Option<Workspace>` to handle the "no workspace open" state.

2. Create `src-tauri/src/commands.rs` with these Tauri commands (follow the pattern from MCP server -- `Arc<Mutex<Workspace>>`):

   **Workspace commands**:
   - `open_workspace(path: String) -> Result<WorkspaceInfo, String>` -- opens workspace, returns stats + config.
   - `get_workspace_status() -> Result<WorkspaceInfo, String>`

   **Graph topology command** (the big one for initial render):
   - `get_graph_topology() -> Result<GraphTopology, String>` -- returns all nodes with `(x, y)` positions from `fdg`, all edges, and node metadata. This is the single payload that populates the frontend cache.

   **Node commands**:
   - `get_node_content(path: String) -> Result<NoteDetail, String>` -- fetches full note (frontmatter + body) on demand.
   - `create_node(...)`, `update_node(...)`, `delete_node(...)` -- wrap `Workspace` methods.
   - `list_nodes(type_filter, tag_filter, status_filter) -> Result<Vec<NodeSummary>, String>`

   **Edge commands**:
   - `create_link(source, target, rel, annotation)`, `delete_link(...)`, `list_links(...)`

   **Search**:
   - `search_notes(query, type_filter, tag_filter, status_filter) -> Result<Vec<SearchResult>, String>`

   **Graph traversal**:
   - `get_neighbors(path, depth, direction, rel_filter) -> Result<Subgraph, String>`
   - `find_path(source, target, max_depth) -> Result<Option<Vec<Edge>>, String>`

   **Config**:
   - `get_config() -> Result<WorkspaceConfig, String>`
   - `get_note_types() -> Result<Vec<String>, String>`
   - `get_edge_types() -> Result<Vec<String>, String>`

3. Create response types in `src-tauri/src/commands.rs` (or a separate `types.rs`):
   - `GraphTopology { nodes: Vec<NodeWithPosition>, edges: Vec<EdgeDto> }`
   - `NodeWithPosition { path, title, note_type, x: f64, y: f64 }`
   - `NoteDetail { path, frontmatter: Frontmatter, body: String }`
   - These types derive `Serialize` and `ts_rs::TS` for TypeScript generation.

4. Integrate `fdg` for layout computation:
   - Add `fdg` dependency to `src-tauri/Cargo.toml`.
   - In `get_graph_topology`, after opening workspace, run force-directed layout:
     ```rust
     fn compute_layout(graph: &Graph) -> HashMap<String, (f64, f64)> {
         // Build fdg simulation from graph nodes/edges
         // Run N iterations
         // Return positions map
     }
     ```

5. Register all commands in `main.rs`:
   ```rust
   fn main() {
       tauri::Builder::default()
           .manage(AppState { workspace: Arc::new(Mutex::new(None)) })
           .invoke_handler(tauri::generate_handler![
               open_workspace, get_graph_topology, get_node_content, ...
           ])
           .run(tauri::generate_context!())
           .expect("error running tauri application");
   }
   ```

**Verification**: `cargo tauri dev`, then call commands from the browser console or from React components.

**Dependencies**: Step 1 (scaffold). Can be developed in parallel with Step 2.

---

### Step 4: Zustand Stores

**Goal**: Centralized state management for the frontend.

**Tasks**:
1. Create `src/stores/workspaceStore.ts`:
   - State: `workspacePath`, `isOpen`, `config`, `stats`, `isLoading`, `error`.
   - Actions: `openWorkspace(path)`, `refresh()`.
   - Calls `invoke('open_workspace', ...)` and `invoke('get_workspace_status')`.

2. Create `src/stores/graphStore.ts`:
   - State: `nodes: Map<string, NodeWithPosition>`, `edges: EdgeDto[]`, `selectedNodePath: string | null`, `expandedNodes: Set<string>`, `isLoading`.
   - Actions: `loadTopology()`, `selectNode(path)`, `expandNode(path)`, `updatePositions(...)`.
   - On `loadTopology`, calls `invoke('get_graph_topology')` and populates the local cache.
   - Subscriptions: listen for Tauri events (`graph:node-added`, `graph:node-removed`, `graph:edge-added`, etc.) to apply incremental diffs.

3. Create `src/stores/uiStore.ts`:
   - State: `theme` (light/dark/system), `graphMode` ('navigate' | 'edit'), `commandPaletteOpen`, `activePanels`, `layoutModel` (FlexLayout model).
   - Actions: `toggleTheme()`, `toggleGraphMode()`, `openCommandPalette()`, etc.

4. Create `src/stores/editorStore.ts`:
   - State: `openTabs: Map<string, TabState>`, `activeTabPath: string | null`.
   - `TabState`: `{ path, content, frontmatter, isDirty, isLoading }`.
   - Actions: `openNote(path)`, `updateContent(path, content)`, `saveNote(path)`.

**Dependencies**: Step 2 (tauri-bridge for invoke calls).

---

### Step 5: FlexLayout Shell + App Skeleton

**Goal**: The app renders a panel-based layout with placeholders for each panel type.

**Tasks**:
1. Create `src/components/Layout/AppLayout.tsx`:
   - Uses `flexlayout-react` `Layout` component.
   - Defines the default model: left panel (Graph), right panel (Editor), bottom bar (Status).
   - Factory function maps tab types to React components.
2. Create `src/components/StatusBar/StatusBar.tsx`:
   - Reads from `workspaceStore` to display workspace name, node count, edge count.
3. Create `src/App.tsx`:
   - On mount: calls `workspaceStore.openWorkspace()` with a default/remembered path.
   - Renders `AppLayout` + `StatusBar`.
   - Handles the "no workspace" state: shows a workspace picker.
4. Create `src/components/Layout/WorkspacePicker.tsx`:
   - Button to select a directory (uses Tauri dialog API or a text input in mock mode).

**Verification**: App shows a paneled layout with placeholder text in each panel. Status bar shows workspace info. Works in both Tauri and Chrome.

**Dependencies**: Steps 2, 4.

---

### Step 6: Graph View (Core Exit Criteria)

**Goal**: The interactive graph visualization -- the most critical UI component for exit criteria.

**Tasks**:
1. Create `src/components/GraphView/GraphView.tsx`:
   - Mounts a Cytoscape.js instance on a `div` ref.
   - On mount (or when `graphStore.nodes` changes), converts nodes/edges to Cytoscape elements format.
   - Uses pre-computed `(x, y)` positions from `graphStore` via `cy.elements().positions(...)` (preset layout).
   - Node coloring by `note_type` using a `stylesheet` array -- map each type to a distinct color.
   - Edge styling: directional arrows, labels showing relationship type.

2. Create `src/components/GraphView/graphStyles.ts`:
   - Cytoscape stylesheet definition.
   - Color palette for the 10 note types.
   - Edge styles (arrow shapes, label font, etc.).

3. Implement interactions:
   - **Click node**: `selectNode(path)` in `graphStore`. Highlight selected node and its edges.
   - **Double-click node**: Call `invoke('get_neighbors', { path, depth: 1 })`. Add returned nodes/edges to the graph view (progressive disclosure). Track expanded nodes in `graphStore.expandedNodes`.
   - **Hover node**: Show tooltip with title, type, summary (Cytoscape `tippy` extension or custom overlay).
   - **Pan/zoom**: Cytoscape handles this natively.
   - **Drag node**: Reposition (pin position). Optimistic -- update local position only.

4. Create `src/components/GraphView/GraphToolbar.tsx`:
   - Navigate/Edit mode toggle.
   - Zoom controls (+/-/fit).
   - Basic filter dropdowns (type filter -- show/hide by note type).

**Verification**: Open the app, see the seed dataset rendered as a graph. Nodes are colored by type. Click a node and its edges highlight. Double-click expands neighbors.

**Dependencies**: Steps 4, 5.

---

### Step 7: Editor Panel (View + Edit Node Content)

**Goal**: Clicking a node in the graph shows its content in the Editor panel.

**Tasks**:
1. Create `src/components/Editor/EditorPanel.tsx`:
   - Subscribes to `graphStore.selectedNodePath`.
   - When a node is selected, calls `invoke('get_node_content', { path })` to fetch full note.
   - Stores content in `editorStore`.

2. Create `src/components/Editor/MarkdownEditor.tsx`:
   - Uses CodeMirror 6 with `@codemirror/lang-markdown`.
   - Displays the note body with syntax highlighting.
   - On change, marks the tab as dirty in `editorStore`.
   - Save (Cmd+S) calls `invoke('update_node', ...)`.

3. Create `src/components/Editor/FrontmatterForm.tsx`:
   - Renders frontmatter fields as a form above the editor.
   - Title (text input), type (dropdown from config note types), tags (tag input), status (dropdown), source, summary.
   - Changes update the in-memory frontmatter; saved together with the body.

4. Create `src/components/Editor/EditorTabs.tsx`:
   - Tab bar for multiple open notes.
   - Dirty indicator (dot on unsaved tabs).
   - Close tab button with save prompt if dirty.

**Verification**: Click a node in the graph. Editor panel shows the note's frontmatter form and markdown body. Edit content, press Cmd+S, content is persisted.

**Dependencies**: Step 6 (graph view provides selection).

---

### Step 8: Search Panel

**Goal**: Full-text search with type/tag/status filters.

**Tasks**:
1. Create `src/components/Search/SearchPanel.tsx`:
   - Text input for query.
   - Filter dropdowns: type, tag, status (populated from config).
   - Results list below.
2. Create `src/components/Search/SearchResultItem.tsx`:
   - Shows title, type badge, tags, content snippet.
   - Click opens the note in Editor and highlights it in Graph (calls `graphStore.selectNode`).
3. Implement debounced search: on input change, debounce 300ms, then call `invoke('search_notes', { query, filters })`.

**Verification**: Type a query, see results. Click a result, node highlights in graph and content shows in editor.

**Dependencies**: Steps 5, 4.

---

### Step 9: Node Inspector Panel

**Goal**: Structured metadata view for the selected node.

**Tasks**:
1. Create `src/components/Inspector/InspectorPanel.tsx`:
   - Reads selected node from `graphStore`.
   - Fetches full note content (or reuses from `editorStore` cache).
   - Displays: title, type, tags, status, created, modified, source, summary.
   - Shows outgoing and incoming links with relationship type and target title.
   - "Add Link" button opens a dialog to create a new link.

**Dependencies**: Steps 6, 7.

---

### Step 10: Command Palette

**Goal**: Cmd+P opens a searchable command palette.

**Tasks**:
1. Create `src/components/CommandPalette/CommandPalette.tsx`:
   - Modal overlay with text input.
   - Two result types: notes (from search) and commands (static list).
   - Fuzzy matching on both.
   - Enter on a note opens it. Enter on a command executes it.
2. Register commands: Create Note, Validate Workspace, Export Graph, Reindex, Find Path.
3. Wire Cmd+P keyboard shortcut via `useEffect` in `App.tsx`.

**Dependencies**: Step 5.

---

### Step 11: File Watcher Integration

**Goal**: External file changes update the graph automatically.

**Tasks**:
1. Create `src-tauri/src/watcher.rs`:
   - Uses `notify` crate with debounce (2 second default).
   - Watches the workspace root directory recursively.
   - On change, re-parses affected files via `Workspace` methods.
   - Emits Tauri events: `graph:topology-changed` with a diff payload.
   - Implements self-change detection via the expected-writes `HashSet` pattern described in the architecture doc.

2. Start the watcher when a workspace is opened in `main.rs`.
3. Frontend: listen for `graph:topology-changed` events in `graphStore` and apply diffs (add/remove/update nodes and edges).
4. Handle editor conflict: if a file is changed externally while the editor has unsaved changes, show a conflict banner.

**Verification**: Open the app with the seed dataset. Edit a `.md` file in an external editor. The graph updates within 2-3 seconds.

**Dependencies**: Step 3 (Tauri commands), Step 6 (graph view to update).

---

### Step 12: Theming + Polish

**Goal**: Light/dark theme support and UX polish.

**Tasks**:
1. Implement CSS custom properties for light/dark themes.
2. System theme detection via `matchMedia('(prefers-color-scheme: dark)')`.
3. Store theme preference in `uiStore`.
4. Empty/loading/error states for all panels (as specified in the desktop app spec).
5. Keyboard shortcuts: Cmd+N (create note), Cmd+F (focus search), Cmd+S (save), Esc (dismiss palette/focus mode).
6. Layout persistence: save FlexLayout model to `.brainmap/ui-state.json` on window close, restore on open.

**Dependencies**: All previous steps.

---

## Dependency Graph and Parallelization

```
Step 0 (types + seed data)  ──┬──> Step 2 (mock layer) ──┬──> Step 4 (stores)
                              │                           │
Step 1 (scaffold)     ────────┤                           ├──> Step 5 (layout shell)
                              │                           │
                              └──> Step 3 (Rust cmds)  ───┘
                                                          │
                              Step 6 (graph) <────────────┘
                              Step 7 (editor) <── Step 6
                              Step 8 (search) <── Step 5
                              Step 9 (inspector) <── Step 6, 7
                              Step 10 (cmd palette) <── Step 5
                              Step 11 (file watcher) <── Step 3, 6
                              Step 12 (polish) <── all
```

**Parallelizable groups**:
- Steps 0, 1 can run in parallel.
- Steps 2 and 3 can run in parallel (mock and real backend).
- Steps 6, 8, 10 can start in parallel once Steps 4/5 are done.
- Step 7 needs Step 6; Step 9 needs Steps 6+7.

## Minimal Path to Exit Criteria

The exit criteria are:
1. Open workspace, see graph -- Steps 0-6
2. Click node shows content, double-click reveals neighbors -- Steps 6, 7
3. Search with filters -- Step 8
4. Graph colors by type, edges show labels -- Step 6
5. External file changes update graph -- Step 11

**Minimal viable path**: Steps 0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 11. Steps 9, 10, 12 are polish beyond exit criteria.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Tauri v2 React template instability** | Scaffold may break with Tauri v2 changes | Pin Tauri CLI and library versions. Use `npm create tauri-app` for initial scaffold, then adapt. |
| **`fdg` crate API mismatch** | Layout computation may not produce good results | Fallback: send no positions, let Cytoscape.js run its own `cose` layout. The `fdg` optimization is nice-to-have, not blocking. |
| **Cytoscape.js performance with 34 nodes** | Unlikely, but layout stutter is possible | 34 nodes is trivially small. Performance risk only applies at 300+ nodes (Phase 4 concern). |
| **`ts-rs` version incompatibility** | Type generation may fail with complex types like `HashMap<String, serde_yaml::Value>` | Flatten `extra` field to `serde_json::Value` in the DTO layer rather than exposing `serde_yaml::Value` to TypeScript. Create separate DTO types for the IPC boundary. |
| **FlexLayout bundle size** | FlexLayout is a large library | Acceptable for desktop app. Could defer to simple CSS grid layout if it causes issues, then add FlexLayout later. |
| **File watcher self-change detection** | The hash-based approach may have race conditions | Use a combination of hash + timestamp + write-lock flag. Test thoroughly with rapid edits. |
| **Mock layer drift from real API** | Mock returns may diverge from actual Tauri commands | Use the same TypeScript types for both real and mock paths. Run integration tests against both. |

## Package Dependencies Summary

**Rust** (`crates/app/src-tauri/Cargo.toml`):
- `brainmap-core` (path dependency)
- `tauri` v2 with features: `["devtools"]`
- `tauri-plugin-shell` (for open-in-editor)
- `tauri-plugin-dialog` (for workspace picker)
- `serde`, `serde_json`
- `notify` (file watcher)
- `fdg` (force-directed layout)
- `ts-rs` (type generation)
- `tokio` (async runtime for watcher)

**npm** (`crates/app/package.json`):
- `react`, `react-dom` 18+
- `@tauri-apps/api` v2, `@tauri-apps/plugin-shell`, `@tauri-apps/plugin-dialog`
- `cytoscape`, `@types/cytoscape`
- `@codemirror/state`, `@codemirror/view`, `@codemirror/lang-markdown`, `@codemirror/theme-one-dark`
- `flexlayout-react`
- `zustand`
- `vite`, `@vitejs/plugin-react`, `typescript`

---

### Critical Files for Implementation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs` - Primary API surface that all Tauri commands will wrap; defines every operation the desktop app needs
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs` - All data types (NodeData, Edge, Note, Frontmatter, etc.) that need ts-rs derives for TypeScript generation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/server.rs` - Reference pattern for wrapping Workspace in Arc<Mutex<>> and dispatching commands; the Tauri commands layer will follow this exact pattern
- `/Users/bsmonteiro/Desktop/Personal/brainmap/docs/05-desktop-app.md` - Full specification for panel types, interactions, keyboard shortcuts, and state management that drives component design
- `/Users/bsmonteiro/Desktop/Personal/brainmap/docs/06-architecture.md` - Architecture decisions (IPC strategy, pre-computed layout, startup optimization, mutation model) that constrain implementation choices

---

