# 2026-03-09 — Subagent Transcript: Explore

**Date:** 2026-03-09 17:19:23
**Agent:** Explore
**Agent ID:** a3a4a120f58fe539d
**Parent Session:** c9c4641d-d216-4fbf-8038-1866df90267f

---

## User

Read these files thoroughly:
1. docs/05-desktop-app.md — the full desktop app specification
2. docs/06-architecture.md — the desktop app and Tauri sections
3. crates/tauri-plugin/src/lib.rs — current tauri plugin stub
4. crates/tauri-plugin/Cargo.toml — current dependencies
5. Cargo.toml — workspace root

I need to understand:
- What the desktop app needs (panels, graph view, editor, search)
- What Tauri v2 setup is required
- What the frontend stack should be (React, TypeScript, Cytoscape.js, CodeMirror)
- What Tauri commands need to be implemented (the IPC surface)
- What the tauri-plugin currently has
- What new workspace members/directories need to be created
- What the build pipeline looks like (Vite + Tauri)

---

## Assistant

I'll read through these files thoroughly to understand the desktop app requirements and architecture.

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/tauri-plugin/src/lib.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/tauri-plugin/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/Cargo.toml"}`

---

## Assistant

Now let me check the current directory structure and existing crate configuration:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -type f -name \"*.toml\" -o -type d -name \"app\" -o -type d -name \"src-tauri\" | head -20"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/"}`

---

## Assistant

Let me check the tauri-plugin structure and look at the cli structure to understand the pattern:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/tauri-plugin/"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/Cargo.toml"}`

---

## Assistant

Now let me check if there are any references to Tauri in the documentation or existing code:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/docs -type f -name \"*.md\" | sort"}`

---

## Assistant

Let me check the core crate structure to understand the modules:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"tokio\\|async\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/Cargo.toml /Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/Cargo.toml 2>/dev/null || echo \"No asyn`

---

## Assistant

Perfect! Now I have a comprehensive understanding of the architecture and requirements. Let me create a detailed analysis document.

## Analysis: Desktop App with Tauri v2

Based on my thorough review of the specifications and architecture, here's a comprehensive breakdown of what's needed:

### 1. **Desktop App Requirements** (from `/docs/05-desktop-app.md`)

**UI Components:**
- **Graph View**: Force-directed graph using Cytoscape.js (Canvas renderer mandatory for 500+ nodes)
- **Editor Panel**: Markdown editor with syntax highlighting (CodeMirror 6)
- **Search Panel**: Full-text search with filtering (type, tags, status)
- **Node Inspector**: Metadata viewer/editor (frontmatter fields)
- **Neighbors Panel**: List of connected nodes with edge types
- **Path Finder**: Visualize paths between two nodes
- **Command Palette**: Ctrl+P with fuzzy search for notes and commands

**Layout System:**
- FlexLayout (`flexlayout-react`) for tabbed, draggable, splittable panels
- Default: 60% left (Graph) + 40% right (Editor)
- Persistent layout state in `.brainmap/ui-state.json`

**Features:**
- Two-mode graph: Navigate (drag-to-reposition) and Edit (drag-to-link)
- Filters bar for type, tags, status, edges, depth
- Focus mode (show only N-hop neighbors)
- Bulk operations (tag, delete, export subgraph)
- File watcher integration with conflict resolution
- Status bar showing workspace name, node/edge counts, index status

### 2. **Tauri v2 Setup Required** (from `/docs/06-architecture.md`)

**Core Stack:**
- Tauri v2 (lightweight, uses system WebView, Rust backend)
- React + TypeScript frontend
- Cytoscape.js for graph rendering
- CodeMirror 6 for editor
- Zustand for state management
- Vite as bundler

**Build Pipeline:**
```
Frontend (React/Vite) → Tauri Bridge → Rust Backend (core library)
```

**Key Dependencies:**
- `tauri` v2 (Tauri framework)
- `ts-rs` or `specta` (auto-generate TypeScript types from Rust)
- `cytoscape` (graph visualization)
- `@uiw/react-codemirror` (CodeMirror 6 for React)
- `flexlayout-react` (panel layout)
- `zustand` (state management)
- `@unified/remark` ecosystem (markdown rendering)

### 3. **Current State of Workspace**

**Existing Crates:**
- `crates/core` - Core library with modules: parser, graph, index, config, workspace
- `crates/cli` - CLI interface using clap
- `crates/tauri-plugin` - **Stub only** (currently just re-exports core)

**Missing:**
- Desktop app crate (`app/` or similar)
- Frontend source code structure
- Tauri configuration files
- Vite configuration
- IPC command definitions

### 4. **Tauri IPC Command Surface** (Required Commands)

Based on architecture section, these commands are needed:

**Workspace Operations:**
- `open_workspace(path)` → WorkspaceStatus
- `create_workspace(path, config)` → WorkspaceStatus
- `get_workspace_status()` → WorkspaceStatus

**Node CRUD:**
- `create_node(title, type, directory, template?)` → Node
- `get_node(path)` → Node (with content)
- `update_node(path, frontmatter_updates)` → Node
- `delete_node(path, confirm)` → void
- `list_nodes()` → Vec<Node>

**Edge CRUD:**
- `create_edge(source, target, relationship_type)` → Edge
- `delete_edge(source, target, relationship_type)` → void
- `list_edges()` → Vec<Edge>

**Search:**
- `search_notes(query, filters?)` → Vec<SearchResult>
- `search_by_filter(type, tags, status)` → Vec<Node>

**Graph Traversal:**
- `get_neighbors(node_path, depth?)` → Vec<(Node, relationship_type)>
- `find_path(source, target)` → Vec<Node>
- `extract_subgraph(node_paths)` → Graph

**Config:**
- `get_config()` → WorkspaceConfig
- `update_config(updates)` → WorkspaceConfig
- `get_note_types()` → Vec<NoteType>`

**Validation:**
- `validate_workspace()` → ValidationReport
- `validate_node(path)` → ValidationResult

**Additional for Desktop:**
- `save_ui_state(layout_json)` → void
- `get_ui_state()` → UIState

### 5. **Frontend Directory Structure** (to be created)

```
app/
├── src-tauri/                          # Rust backend
│   ├── src/
│   │   ├── main.rs                     # Tauri entry point
│   │   ├── commands/
│   │   │   ├── workspace.rs
│   │   │   ├── node.rs
│   │   │   ├── edge.rs
│   │   │   ├── search.rs
│   │   │   ├── graph.rs
│   │   │   └── config.rs
│   │   └── events.rs                   # Event emission setup
│   └── tauri.conf.json
├── src/                                # React frontend
│   ├── App.tsx
│   ├── components/
│   │   ├── GraphView/
│   │   │   ├── GraphView.tsx
│   │   │   ├── useGraphInteraction.ts
│   │   │   └── graphStyles.ts
│   │   ├── Editor/
│   │   │   ├── Editor.tsx
│   │   │   ├── useAutoComplete.ts
│   │   │   └── EditorPreview.tsx
│   │   ├── Search/
│   │   │   ├── SearchPanel.tsx
│   │   │   └── SearchFilters.tsx
│   │   ├── Inspector/
│   │   │   └── NodeInspector.tsx
│   │   ├── CommandPalette/
│   │   │   └── CommandPalette.tsx
│   │   ├── StatusBar/
│   │   │   └── StatusBar.tsx
│   │   └── Layout/
│   │       └── FlexLayoutWrapper.tsx
│   ├── hooks/
│   │   ├── useGraph.ts
│   │   ├── useSearch.ts
│   │   ├── useWorkspace.ts
│   │   └── useFileWatcher.ts
│   ├── stores/
│   │   ├── graphStore.ts               # Zustand store
│   │   ├── uiStore.ts
│   │   └── workspaceStore.ts
│   ├── types/
│   │   └── index.ts                    # Generated by ts-rs from Rust
│   └── index.css
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### 6. **Build Pipeline**

```
Vite (dev: HMR, prod: bundle)
  ↓
TypeScript compilation + React JSX
  ↓
Tauri bundler (integrates frontend + Rust binary)
  ↓
Native app (.app on macOS, .exe on Windows, binary on Linux)
```

Development: `npm run tauri dev` (HMR enabled)
Production: `npm run tauri build` (creates distributable)

### 7. **Tauri Plugin Role**

The `crates/tauri-plugin` is currently a stub. It could:
- **Option A**: Remain as a re-export (plugin is just Tauri commands)
- **Option B**: Become a full Tauri plugin if commands are wrapped as plugin API
- **Recommendation**: Start with Option A (keep commands in the main app), plugin pattern is overkill for v1

### 8. **Key Implementation Notes**

**Type Safety:**
- Use `ts-rs` to auto-generate TypeScript types from Rust `#[derive(Serialize, Deserialize)]` structs
- All Tauri commands should accept/return typed structs, never raw JSON

**Performance:**
- Frontend maintains **local topology cache** (nodes + edges, not content)
- Content fetched on-demand when node is selected
- Rust pushes incremental diffs via `tauri::Event` (not RPC calls)
- Pre-compute graph layout in Rust (using `fdg` crate) before sending to frontend
- Use Web Worker for incremental layout calculations if needed

**State Synchronization:**
- Zustand stores subscribed to Tauri events
- File watcher events published by Rust, consumed by frontend
- Dirty flag per editor tab to prevent data loss

**File Watching:**
- Implemented in Rust core (`core::watcher` using `notify` crate)
- Self-change detection via expected writes hash set
- Events pushed to frontend via Tauri event bus

---

## Summary Table

| Aspect | Details |
|--------|---------|
| **Framework** | Tauri v2 (Rust + React) |
| **Frontend** | React 18 + TypeScript + Vite |
| **Graph** | Cytoscape.js (Canvas renderer) |
| **Editor** | CodeMirror 6 |
| **Layout** | FlexLayout React |
| **State** | Zustand |
| **Type Bridge** | ts-rs (auto-generated) |
| **IPC Commands** | ~25 commands across workspace, node, edge, search, graph, config |
| **New Crate** | `app/` with `src-tauri/` (Rust) + `src/` (React) |
| **Build Tool** | Vite + Tauri bundler |
| **Performance** | Local topology cache + on-demand content fetching |

All specifications and requirements are documented in `/docs/05-desktop-app.md` and `/docs/06-architecture.md`. The core library (`crates/core`) is production-ready and provides all backend functionality needed.

---

