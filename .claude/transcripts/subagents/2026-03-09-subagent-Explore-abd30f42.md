# 2026-03-09 — Subagent Transcript: Explore

**Date:** 2026-03-09 17:38:16
**Agent:** Explore
**Agent ID:** abd30f42715f6487b
**Parent Session:** ba732d96-401a-4b82-b69a-43c622866e5c

---

## User

Explore the BrainMap project to understand:
1. The full project structure (all directories and key files)
2. Read all docs in `docs/` directory — especially anything about the desktop app, architecture, and roadmap
3. Read the root Cargo.toml and any existing tauri-plugin crate
4. Read CLAUDE.md for conventions

Be very thorough — read every doc file completely.

---

## Assistant

I'll thoroughly explore the BrainMap project structure and documentation. Let me start by mapping out the entire codebase and then reading all the documentation files.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -type f -name \"*.md\" -o -name \"*.toml\" -o -name \"*.rs\" | head -50"}`

---

## Assistant

Let me get a comprehensive view of the structure and read all documentation:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/docs/"}`

---

## Assistant

Now let me read all the documentation files in detail:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/CLAUDE.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/README.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/01-vision.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/02-data-model.md"}`

---

## Assistant

Now let me read the remaining documentation files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/03-cli-spec.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/04-mcp-spec.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/05-desktop-app.md"}`

---

## Assistant

Now let me read the final documentation files and explore the crate structures:

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

Now let me explore the crate structures:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/tauri-plugin/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/Cargo.toml"}`

---

## Assistant

Now let me check the src structure of the crates:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src -type f -name \"*.rs\" | sort"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src -type f -name \"*.rs\" | sort"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src -type f -name \"*.rs\" | sort"}`

---

## Assistant

Now let me explore the crate main files to understand the current state:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/lib.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/main.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/tauri-plugin/src/lib.rs"}`

---

## Assistant

Perfect. Let me check the review agents to understand the mandatory feedback loops:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/.claude -type f | sort"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/agents/plan-reviewer.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/agents/code-reviewer.md"}`

---

## Assistant

Excellent. Now let me create a comprehensive summary document. Since I cannot write files, I'll compile everything as a detailed response:

## BrainMap Project Exploration: Complete Overview

I've completed a thorough exploration of the BrainMap project. Here's a comprehensive summary of what I found:

### **Project Definition**

**BrainMap** is a personal knowledge graph tool that transforms structured markdown files (with YAML frontmatter) into an interactive, queryable, visual knowledge base. It solves three problems existing tools like Obsidian don't address:
1. No typed relationships (all links look the same)
2. No AI agent integration (no native way for AI to query the graph)
3. Poor queryability (can't ask "how does concept A relate to concept B?")

### **Architecture Overview**

**Core Technology Stack:**
- **Language**: Rust (edition 2021, resolver v2)
- **Desktop**: Tauri v2 (Rust backend + React frontend)
- **Graph Rendering**: Cytoscape.js with Canvas renderer
- **Markdown Editor**: CodeMirror 6
- **Panel Layout**: FlexLayout (flexlayout-react)
- **State Management**: Zustand
- **Search Index**: SQLite FTS5
- **File Watching**: notify crate
- **CLI**: clap
- **MCP**: rmcp (Model Context Protocol)

**Workspace Structure:**
```
crates/
  core/           Core library (parser, graph engine, index, workspace manager)
  cli/            CLI interface (clap-based commands)
  tauri-plugin/   Tauri plugin stub for desktop (future)
  mcp/            MCP server implementation
```

### **Data Model (from docs/02-data-model.md)**

**Note Format**: Markdown files with YAML frontmatter containing:
- **Base fields**: id (UUID), title, type, tags, status, created, modified, source, summary, links
- **Note Types** (10): concept, book-note, question, reference, index, argument, evidence, experiment, person, project
- **Edge Types** (15): contains, part-of, causes, supports, contradicts, extends, depends-on, exemplifies, precedes, leads-to, evolved-from, related-to, authored-by, sourced-from, mentioned-in

**Key Design Decisions**:
1. **Files are source of truth**: All data lives in `.md` files with YAML frontmatter
2. **Hybrid structure**: Directory hierarchy generates implicit "contains" edges; frontmatter defines explicit typed relationships
3. **Backlinks as first-class**: Edges stored only in source notes; index maintains reverse mapping
4. **Single-writer model**: All mutations go through `Workspace` orchestration layer
5. **Canonical paths**: Workspace-relative (e.g., `Concepts/Causal Inference.md`)
6. **UUID-based rename-safety**: Notes get auto-generated UUIDs for stable linking during moves

**Implicit vs Explicit Edges**:
- Directory structure generates implicit `contains` edges downward only
- `part-of` inferred on query by reversing `contains` (not stored)
- Non-node directories bubble children up to nearest ancestor node
- Explicit edges always override implicit ones

### **Core Library Modules** (crates/core/src/)

1. **parser.rs**: Extracts YAML frontmatter and inline links from `.md` files
2. **graph.rs**: In-memory graph with adjacency list, traversal (BFS/Dijkstra), subgraph extraction, cluster detection
3. **index.rs**: SQLite FTS5 search + backlink reverse index + incremental updates
4. **workspace.rs**: Orchestration layer for all mutations (create_note, update_note, delete_note, create_link)
5. **config.rs**: Reads/writes `.brainmap/config.yaml` (workspace settings, registered types, federation)
6. **error.rs**: `BrainMapError` enum with `thiserror` for error handling
7. **export.rs**: Graph export to JSON/DOT/GraphML formats
8. **model.rs**: Core data types (Note, Frontmatter, TypedLink, Direction, etc.)

### **CLI Commands** (crates/cli/src/)

Phase 1b complete — smoke commands working:
- **Node CRUD**: create, read, update, delete, list, move
- **Relationships**: link create/delete/list
- **Search**: full-text with filters (type, tag, status)
- **Graph**: neighbors, path, subgraph
- **Workspace**: init, status, config, validate, stats, reindex, export
- **Federation**: add, remove, list

Output formats: JSON (primary for AI), text (human-readable)

### **Desktop App Specification** (docs/05-desktop-app.md)

**Key Features**:
- **FlexLayout-based flexible panels**: Graph View, Editor, Search, Node Inspector, Neighbors, Path Finder
- **Cytoscape.js Canvas rendering**: Force-directed layout, zoom, pan, drag
- **Editor**: CodeMirror 6 with syntax highlighting, live preview, link autocomplete, frontmatter form
- **Search panel**: Keyword search + type/tag/status filters
- **Command palette**: Cmd+P for note search + command execution
- **Node Inspector**: Frontmatter viewer/editor with linked nodes display
- **Graph interactions**: Click to select, double-click to expand neighbors, right-click context menus
- **File watching**: Debounced (default 2s) with external edit conflict detection
- **Keyboard shortcuts**: Cmd+P (palette), Cmd+F (search), Cmd+N (new note), Cmd+S (save), F (focus mode), Esc (exit mode)
- **Status bar**: Workspace name, node/edge counts, index status, git branch/status
- **Theming**: Light/dark with system detection

**Future deferred to Phase 4**: Hover tooltips, smooth animations, edge label polish, multiple layouts, federation UI

### **MCP Server Specification** (docs/04-mcp-spec.md)

Low-level graph primitives via Model Context Protocol:
- **Node tools**: get, list, create, update, delete, move
- **Edge tools**: create, delete, list
- **Search tool**: full-text with filters
- **Graph tools**: neighbors, find_path, subgraph
- **Workspace tools**: status, validate, stats, reindex, export
- **Config tools**: get, set
- **Federation tools**: list, add, remove
- **Batch operations**: Multiple ops in single request

Response envelope pattern (success/data/error).

### **Testing Strategy**

**Current test coverage**: 50 tests total (Phase 1b complete):
- 26 core unit tests
- 7 seed validation tests
- 1 performance baseline
- 16 CLI integration tests (using assert_cmd against temp seed copies)

Tests use **behavior-based verification** (check end state), not mocks.

### **Current Status (Phase 1b complete)**

**Done**:
- Core library with parser, graph engine, FTS5 index, workspace manager
- CLI smoke commands (CRUD, search, graph traversal)
- Seed dataset (34 notes from "The Book of Why")
- All tests passing
- Core API proven

**In Progress**: Phase 1c (Desktop), 2 (Full CLI), 3 (MCP) can be built in parallel

### **Mandatory Development Workflows**

**Planning Feedback Loop** (when creating plans):
1. Write plan to `.claude/reviews/plans/<name>.md`
2. Read `.claude/agents/plan-reviewer.md` criteria
3. Spawn agents to review (focus on architecture, scope, edge cases, testing, data model)
4. Fix any blocker/should-fix findings
5. Present final plan to user

**Code Review Feedback Loop** (after implementing):
1. Read `.claude/agents/code-reviewer.md` criteria
2. Spawn agents to review changed files (split by area if many)
3. Write feedback to `.claude/reviews/code/<name>-review-N.md`
4. Fix any bug/should-fix findings
5. Re-spawn agents on updated files until clean
6. Then mark implementation done

**Never skip these loops** — they run even for small changes.

### **Key Conventions**

- **Error handling**: `thiserror` with `BrainMapError::error_code()` method
- **Serialization**: All public types have `Serialize` derive; JSON is AI-first
- **Public API boundary**: Everything goes through `workspace.rs`
- **Directory structure**: `crates/{core,cli,mcp}/src/` with clean module boundaries
- **Test location**: `crates/core/tests/` (integration) + inline (unit)

### **File Locations (Absolute Paths)**

```
/Users/bsmonteiro/Desktop/Personal/brainmap/
├── Cargo.toml                          (workspace root)
├── CLAUDE.md                           (project instructions - MANDATORY)
├── README.md
├── rust-toolchain.toml
├── docs/
│   ├── 01-vision.md                    (goals, principles, core operations)
│   ├── 02-data-model.md                (COMPREHENSIVE - frontmatter, types, edges)
│   ├── 03-cli-spec.md                  (all commands with examples)
│   ├── 04-mcp-spec.md                  (tools, resources, batch ops)
│   ├── 05-desktop-app.md               (panels, interactions, UX)
│   ├── 06-architecture.md              (modules, data flow, performance)
│   └── 07-roadmap.md                   (4 phases, exit criteria)
├── crates/
│   ├── core/
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── parser.rs              (markdown + YAML parsing)
│   │       ├── graph.rs               (adjacency list, traversal)
│   │       ├── index.rs               (SQLite FTS5)
│   │       ├── workspace.rs           (orchestration)
│   │       ├── config.rs              (YAML config)
│   │       ├── error.rs               (error types)
│   │       ├── export.rs              (JSON/DOT export)
│   │       └── model.rs               (core types)
│   ├── cli/
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── main.rs                (clap CLI entry)
│   │       ├── output.rs              (text/json formatting)
│   │       └── commands/              (init, node, link, search, graph, etc.)
│   ├── mcp/
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── server.rs              (MCP setup)
│   │       └── tools/                 (node, link, search, graph, workspace)
│   └── tauri-plugin/
│       ├── Cargo.toml
│       └── src/lib.rs                 (stub)
├── seed/                               (34-note test dataset from "The Book of Why")
│   ├── Concepts/
│   ├── People/
│   ├── Evidence/
│   ├── Experiments/
│   ├── Questions/
│   ├── Arguments/
│   ├── Projects/
│   └── The Book of Why/                (chapter notes)
└── .claude/
    ├── agents/
    │   ├── plan-reviewer.md            (mandatory review criteria)
    │   └── code-reviewer.md            (mandatory review criteria)
    ├── skills/
    ├── settings.json
    └── transcripts/
```

### **Quick Reference**

- **Build**: `cargo build`
- **Test**: `cargo test` (requires `$HOME/.cargo/bin` in PATH)
- **CLI**: `cargo run -p brainmap-cli -- <command>`
- **Init workspace**: `cargo run -p brainmap-cli -- init /path/to/workspace`
- **Serve MCP**: `cargo run -p brainmap-cli -- serve`

This completes the full exploration. The project is well-structured with clear module boundaries, comprehensive specifications, a proven core library, working CLI commands, and explicit mandatory review workflows for all development.

---

