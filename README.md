# BrainMap

A personal knowledge graph tool that turns structured markdown files into an interactive, queryable, visual knowledge base. Combines file-based simplicity with graph database power, accessible through a desktop app, CLI, and MCP server for AI agent integration.

## Why BrainMap?

Existing tools like Obsidian provide graph views but fall short in three areas:

1. **No typed relationships** — A "causes" link looks identical to a "contradicts" link
2. **No AI agent integration** — No native way for AI agents to query or traverse the knowledge graph
3. **Poor queryability** — Cannot ask graph-level questions like "what connects X to Y?"

BrainMap solves all three while keeping notes as plain `.md` files — portable, version-controllable, and human-readable.

## How It Works

Notes are markdown files with YAML frontmatter that define typed, directional relationships:

```yaml
---
title: Randomized Controlled Trial
type: concept
tags: [methodology, statistics]
status: evergreen
links:
  - target: ../Arguments/Correlation is not causation.md
    rel: supports
  - target: ../People/Ronald Fisher.md
    rel: authored-by
---

The gold standard for establishing causal claims...
```

Directory structure provides implicit parent-child relationships. The core library parses these files into an in-memory graph and a full-text search index, enabling traversal, search, and validation across the entire knowledge base.

## Features

- **Typed edges** — 15 relationship types (causes, supports, contradicts, extends, etc.)
- **10 note types** — concept, book-note, question, argument, evidence, experiment, person, project, reference, index
- **Full-text search** — SQLite FTS5 with type/tag/status filters
- **Graph traversal** — Neighbors, shortest path, subgraph extraction
- **Validation** — Detect broken links, orphaned notes, schema issues
- **Federated workspaces** — Cross-reference between independent knowledge graphs
- **Multiple output formats** — text, JSON, and YAML (--format yaml)
- **Batch operations** — Execute multiple MCP operations in one request
- **Short aliases** — `brainmap ls`, `brainmap new`, `brainmap s` for common operations

## Getting Started

### Prerequisites

- Rust toolchain (1.83+)

### Build

```bash
cargo build
```

### Initialize a Workspace

```bash
cargo run -p brainmap -- init my-knowledge-base
```

This creates a `my-knowledge-base/` directory with a `.brainmap/` config folder, ready for notes.

### Explore the Seed Dataset

A 34-note seed dataset based on *The Book of Why* by Judea Pearl is included in `seed/`:

```bash
# Run tests against the seed dataset
cargo test -p brainmap-core

# Search for notes
cargo run -p brainmap -- --workspace seed search "causality"

# Read a note
cargo run -p brainmap -- --workspace seed node read "Concepts/Causal Inference.md"

# Export graph as DOT
cargo run -p brainmap -- --workspace seed export --export-format dot

# Find path between two notes
cargo run -p brainmap -- --workspace seed path "Concepts/Causal Inference.md" "People/Judea Pearl.md"
```

### MCP Server

Start the MCP server for AI agent integration (24 tools + 3 resources over stdio):

```bash
cargo run -p brainmap -- --workspace seed serve
```

Tools cover the full CRUD lifecycle: node_get, node_list, node_create, node_update, node_delete, node_move, link_create, link_delete, link_list, search, neighbors, find_path, subgraph, status, validate, stats, reindex, export, config_get, config_set, federation_list, federation_add, federation_remove, batch.

Resources: `brainmap://nodes/{path}`, `brainmap://graph`, `brainmap://config`.

## Project Structure

```
crates/
  core/          Rust core library (parser, graph, index, workspace)
  cli/           Command-line interface (21 commands + aliases ls/new/s, --format text/json/yaml)
  mcp/           MCP server (24 tools + 3 resources for AI agent integration)
  app/src-tauri/ Desktop app (Tauri v2, in progress)
docs/            Specifications and design documents
seed/            Seed dataset for testing and reference
```

## Architecture

```
┌──────────┐  ┌──────────┐  ┌───────────────┐
│ Desktop  │  │   CLI    │  │  MCP Server   │
│   App    │  │          │  │               │
└────┬─────┘  └────┬─────┘  └──────┬────────┘
     │              │               │
┌────▼──────────────▼───────────────▼────────┐
│              Core Library                   │
│  Parser │ Graph Engine │ Search Index       │
│  Config │  Workspace   │ File Watcher       │
└────────────────────┬───────────────────────┘
                     │
            ┌────────▼────────┐
            │   File System   │
            │ (.md + .brainmap/)
            └─────────────────┘
```

Files are the source of truth. The core library indexes them into an in-memory graph and SQLite FTS5 search index. Three interfaces consume the core: CLI, desktop app (Tauri + React), and MCP server.

## Roadmap

| Phase | Status  | Description                                             |
|-------|---------|---------------------------------------------------------|
| 1a    | Done    | Core library, CLI scaffold, seed dataset                |
| 1b    | Done    | CLI smoke commands (node CRUD, search, link, neighbors) |
| 2     | Done    | Full CLI (21 commands + aliases ls/new/s, export, validation, config) |
| 3     | Done    | MCP server (18 tools over stdio for AI agents)          |
| 1c    | WIP     | Desktop app (Tauri + React, graph view, editor)         |
| 4     | Planned | Polish, advanced graph layouts, theming                 |

See `docs/07-roadmap.md` for full details.

## Documentation

Detailed specifications live in `docs/`:

- [Vision](docs/01-vision.md) — Goals, principles, core operations
- [Data Model](docs/02-data-model.md) — Frontmatter schema, note types, edge types
- [CLI Spec](docs/03-cli-spec.md) — Command specifications
- [MCP Spec](docs/04-mcp-spec.md) — MCP server protocol
- [Desktop App](docs/05-desktop-app.md) — UI/UX specifications
- [Architecture](docs/06-architecture.md) — Technical architecture
- [Roadmap](docs/07-roadmap.md) — Delivery phases
- [Seed Dataset](docs/08-seed-dataset.md) — Test data documentation

## License

MIT
