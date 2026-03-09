# BrainMap — CLI Specification

## Overview

The `brainmap` CLI is the primary programmatic interface. Every operation available in the desktop app is available here. AI agents interact through this CLI or the MCP server (see [04-mcp-spec.md](./04-mcp-spec.md)).

## Global Options

```
brainmap [--workspace <path>] [--format <json|text>] [--quiet] <command>
```

| Option | Default | Description |
|--------|---------|-------------|
| `--workspace`, `-w` | Current directory or configured default | Path to workspace root |
| `--format`, `-f` | `text` | Output format. `json` for machine consumption, `text` for humans |
| `--quiet`, `-q` | false | Suppress non-essential output |

## Short Aliases

Frequently used commands have short-form aliases for convenience:

| Alias | Expands to |
|-------|------------|
| `brainmap ls` | `brainmap node list` |
| `brainmap new` | `brainmap node create` |
| `brainmap s` | `brainmap search` |

## Commands

### Workspace Management

#### `brainmap init <directory>`

Initialize a new workspace.

```bash
$ brainmap init ~/brain-map/masters-thesis
Initialized BrainMap workspace at ~/brain-map/masters-thesis
Created .brainmap/config.yaml
```

#### `brainmap status`

Show workspace status: node count, edge count, index health.

```bash
$ brainmap status
Workspace: Masters Thesis (~/brain-map/masters-thesis)
Nodes: 47
Edges: 123 (68 explicit, 55 directory-derived)
Types: concept (21), book-note (14), question (6), reference (4), index (2)
Index: up to date (last indexed: 2026-03-09 14:23)
```

#### `brainmap config [key] [value]`

Get or set workspace configuration.

```bash
$ brainmap config name
Masters Thesis

$ brainmap config name "Causal ML Research"
Updated name → "Causal ML Research"
```

#### `brainmap federation add <name> <path>`

Add a federated workspace.

```bash
$ brainmap federation add "Personal" ~/brain-map/personal
Added federated workspace "Personal" → ~/brain-map/personal
```

#### `brainmap federation list`

List all federated workspaces.

```bash
$ brainmap federation list
Personal  ~/brain-map/personal      (reachable, 32 nodes)
Work      ~/brain-map/work-notes    (reachable, 104 nodes)
(2 federated workspaces)
```

#### `brainmap federation remove <name>`

Remove a federated workspace. Does not delete the workspace itself, only removes the federation link.

```bash
$ brainmap federation remove "Work"
Removed federated workspace "Work"
```

---

### Node Operations (CRUD)

#### `brainmap node create <path> [options]`

Create a new note with frontmatter.

```bash
$ brainmap node create "Concepts/Counterfactuals.md" \
    --title "Counterfactual Reasoning" \
    --type concept \
    --tags causality,reasoning \
    --source "The Book of Why, Ch.1"

Created: Concepts/Counterfactuals.md
```

Options:
| Option | Description |
|--------|-------------|
| `--title` | Note title (defaults to filename) |
| `--type` | Note type |
| `--tags` | Comma-separated tags |
| `--status` | draft / review / final |
| `--source` | Source reference |
| `--summary` | Short summary |
| `--field key=value` | Custom type-specific field (repeatable) |
| `--content <text>` | Initial body content |
| `--template <name>` | Use a note template |
| `--open`, `-o` | Open the created file in `$EDITOR` after creation |

#### `brainmap node read <path>`

Read a note's full content and metadata.

```bash
$ brainmap node read "Concepts/Counterfactuals.md"
Title: Counterfactual Reasoning
Type: concept
Tags: causality, reasoning
Status: draft
Created: 2026-03-09
Links:
  → extends: Concepts/Causal Inference.md
  → authored-by: People/Judea Pearl.md

---
# Counterfactual Reasoning
The ability to reason about what would have happened...
```

With `--format json`:
```json
{
  "path": "Concepts/Counterfactuals.md",
  "frontmatter": {
    "title": "Counterfactual Reasoning",
    "type": "concept",
    "tags": ["causality", "reasoning"],
    "links": [
      {"target": "Concepts/Causal Inference.md", "relationship": "extends"}
    ]
  },
  "content": "# Counterfactual Reasoning\n...",
  "incoming_links": [
    {"source": "Books/Book of Why/Ch1.md", "relationship": "contains"}
  ]
}
```

#### `brainmap node update <path> [options]`

Update a note's frontmatter fields and/or body content.

```bash
$ brainmap node update "Concepts/Counterfactuals.md" \
    --status review \
    --tags causality,reasoning,pearl \
    --field maturity=intermediate

Updated: Concepts/Counterfactuals.md
  status: draft → review
  tags: +pearl
  maturity: (new) intermediate
```

Options:
| Option | Description |
|--------|-------------|
| `--title` | Update title |
| `--type` | Update type |
| `--tags` | Replace tags (comma-separated) |
| `--status` | Update status |
| `--source` | Update source |
| `--summary` | Update summary |
| `--field key=value` | Set custom field (repeatable) |
| `--content <text>` | Replace body content with the provided text |
| `--content-file <path>` | Replace body content with contents of the given file |

#### `brainmap node delete <path> [--force] [--dry-run]`

Delete a note. Warns about incoming links unless `--force`. Use `--dry-run` to preview what would happen without executing.

```bash
$ brainmap node delete "Concepts/Old Concept.md" --dry-run
Dry run — no changes will be made.
Would delete: Concepts/Old Concept.md
3 notes link to this node:
  - Books/Book of Why/Ch2.md (extends)
  - Concepts/Causal Inference.md (related-to)
  - Questions/Open Questions.md (depends-on)

$ brainmap node delete "Concepts/Old Concept.md"
Warning: 3 notes link to this node:
  - Books/Book of Why/Ch2.md (extends)
  - Concepts/Causal Inference.md (related-to)
  - Questions/Open Questions.md (depends-on)
Delete anyway? [y/N]
```

#### `brainmap node move <old-path> <new-path> [--dry-run]`

Atomically rename/move a note file and rewrite all references to it across the entire workspace (including federated workspaces). Use `--dry-run` to preview affected files without executing.

```bash
$ brainmap node move "Concepts/Counterfactuals.md" "Concepts/Causality/Counterfactuals.md" --dry-run
Dry run — no changes will be made.
Would move: Concepts/Counterfactuals.md → Concepts/Causality/Counterfactuals.md
Would rewrite references in 4 files:
  - Books/Book of Why/Ch1.md
  - Concepts/Causal Inference.md
  - Concepts/Potential Outcomes.md
  - Questions/Open Questions.md

$ brainmap node move "Concepts/Counterfactuals.md" "Concepts/Causality/Counterfactuals.md"
Moved: Concepts/Counterfactuals.md → Concepts/Causality/Counterfactuals.md
Rewrote references in 4 files.
```

#### `brainmap node list [--type <type>] [--tag <tag>] [--status <status>] [--limit <n>] [--offset <n>]`

List nodes with optional filters and pagination.

```bash
$ brainmap node list --type concept --tag causality --limit 10
Concepts/Counterfactuals.md        Counterfactual Reasoning
Concepts/Causal Inference.md       Causal Inference
Concepts/Do-Calculus.md            Do-Calculus
Concepts/SCM.md                    Structural Causal Models
(4 nodes)

$ brainmap node list --type book-note --limit 5 --offset 10
Books/Book of Why/Ch11.md          Chapter 11 - Mediation
Books/Book of Why/Ch12.md          Chapter 12 - Big Data
...
(showing 5 of 14 nodes, offset 10)
```

---

### Relationship Operations

#### `brainmap link create <source> <target> --relationship <type>`

Create a typed relationship between two notes.

`--relationship` can be shortened to `--rel`.

```bash
$ brainmap link create "Concepts/Do-Calculus.md" "Concepts/SCM.md" --relationship extends
Linked: Do-Calculus —extends→ Structural Causal Models
```

#### `brainmap link delete <source> <target> [--relationship <type>] [--dry-run]`

Remove a relationship. If `--relationship` is omitted and multiple edges exist, prompts for selection. Use `--dry-run` to preview without executing.

`--relationship` can be shortened to `--rel`.

```bash
$ brainmap link delete "Concepts/Do-Calculus.md" "Concepts/SCM.md" --relationship extends
Unlinked: Do-Calculus —extends→ Structural Causal Models
```

#### `brainmap link list <path> [--direction in|out|both] [--relationship <type>]`

List all relationships for a node.

`--relationship` can be shortened to `--rel`.

```bash
$ brainmap link list "Concepts/Counterfactuals.md" --direction both
Outgoing:
  —extends→ Concepts/Causal Inference.md
  —authored-by→ People/Judea Pearl.md
Incoming:
  ←contains— Books/Book of Why/Ch1.md
  ←related-to— Concepts/Potential Outcomes.md
(4 edges)
```

---

### Search

#### `brainmap search <query> [options]`

Full-text search across note content and metadata.

```bash
$ brainmap search "randomized controlled trial"
Books/Book of Why/Ch4.md           (3 matches) "...randomized controlled trial..."
Concepts/RCT.md                    (1 match)  "...randomized controlled trial is..."
Questions/Observational Studies.md (1 match)  "...alternative to randomized..."
(3 results)
```

Options:
| Option | Description |
|--------|-------------|
| `--tag <tag>` | Filter results by tag |
| `--type <type>` | Filter by note type |
| `--status <status>` | Filter by status |
| `--limit <n>` | Max results (default: 20) |
| `--content-only` | Search only body content, not frontmatter |
| `--meta-only` | Search only frontmatter fields |

---

### Graph Queries

#### `brainmap neighbors <path> [--depth <n>] [--relationship <type>] [--direction in|out|both]`

Show nodes connected to a given node, up to N hops.

`--relationship` can be shortened to `--rel`.

```bash
$ brainmap neighbors "Concepts/Counterfactuals.md" --depth 2
Depth 1:
  —extends→ Causal Inference
  —authored-by→ Judea Pearl
  ←contains— Ch1 - Introduction
Depth 2:
  Causal Inference —extends→ Probability Theory
  Causal Inference —depends-on→ Statistics
  Judea Pearl —authored-by← Bayesian Networks
  Ch1 - Introduction ←contains— The Book of Why
(7 nodes, 7 edges)
```

#### `brainmap path <source> <target> [--max-depth <n>]`

Find shortest path(s) between two nodes.

```bash
$ brainmap path "Concepts/Counterfactuals.md" "Concepts/Bayesian Networks.md"
Path (length 2):
  Counterfactuals —authored-by→ Judea Pearl —authored-by← Bayesian Networks

Alternative path (length 3):
  Counterfactuals —extends→ Causal Inference —depends-on→ Probability —extends← Bayesian Networks
```

#### `brainmap subgraph <path> --depth <n> [--relationship <type>] [--format json|dot]`

Extract a subgraph around a node.

`--relationship` can be shortened to `--rel`.

```bash
$ brainmap subgraph "Concepts/Causality.md" --depth 2 --format dot
digraph {
  "Causality" -> "Counterfactuals" [label="contains"]
  "Causality" -> "Interventions" [label="contains"]
  "Counterfactuals" -> "Causal Inference" [label="extends"]
  ...
}
```

---

### Validation & Maintenance

#### `brainmap validate`

Check workspace health.

```bash
$ brainmap validate
Broken links:
  Concepts/Old.md → "Concepts/Removed.md" (file not found)
Orphan nodes (no incoming or outgoing links):
  Concepts/Isolated Thought.md
Missing frontmatter:
  Notes/Quick Note.md (no title, no type)
Missing required fields:
  Concepts/WIP.md (no created date)
4 issues found
```

#### `brainmap stats`

Show graph analytics.

```bash
$ brainmap stats
Nodes: 47
Edges: 123
  By type: contains (55), extends (23), causes (12), supports (10), ...
  Explicit: 68, Directory-derived: 55
Most connected: "Causal Inference" (14 edges)
Clusters: 4 detected
  Cluster 1: Causality core (18 nodes)
  Cluster 2: Statistics foundations (12 nodes)
  Cluster 3: Book of Why notes (9 nodes)
  Cluster 4: People (8 nodes)
Orphan nodes: 1
```

---

### Export & Server

#### `brainmap export [--format json|dot|graphml] [--subgraph <path> --depth <n>]`

Export the full graph or a subgraph.

```bash
$ brainmap export --format json > graph.json
Exported 47 nodes, 123 edges to stdout

$ brainmap export --subgraph "Concepts/Causality.md" --depth 3 --format dot > causality.dot
Exported subgraph: 15 nodes, 28 edges
```

#### `brainmap serve [--port <n>]`

Start the desktop app and/or MCP server.

```bash
$ brainmap serve
BrainMap server running on http://localhost:3838
MCP server available on stdio
Desktop app launching...
```

Options:
| Option | Description |
|--------|-------------|
| `--port <n>` | HTTP port (default: 3838) |
| `--mcp-only` | Start MCP server without desktop app |
| `--no-watch` | Disable file system watching |

---

### Index Management

#### `brainmap reindex`

Force a full re-index of all notes.

```bash
$ brainmap reindex
Indexing... 47 notes processed in 0.3s
Index updated: .brainmap/index.db
```

---

## Error Behavior

All commands return exit code `0` on success and a non-zero code on failure. When `--format json` is used, errors are returned as structured JSON: `{ "error": { "code": "<CODE>", "message": "<message>" } }`.

| Error Code | Trigger | Behavior |
|------------|---------|----------|
| `FILE_NOT_FOUND` | `node read`, `node update`, `node delete`, `node move` with a path that does not exist | Exit 1. Message: `Node not found: <path>` |
| `DUPLICATE_PATH` | `node create` with a path that already exists | Exit 1. Message: `Node already exists: <path>`. No overwrite. |
| `INVALID_YAML` | Any command that reads a file with malformed YAML frontmatter | Exit 1. Message: `Invalid YAML frontmatter in <path>: <parse error>`. The file is skipped; other files continue processing where applicable. |
| `BROKEN_LINK_TARGET` | `link create` with a source or target that does not exist | Exit 1. Message: `Link target not found: <path>`. No dangling links created. |
| `DUPLICATE_LINK` | `link create` with a source, target, and relationship that already exists | Exit 1. Message: `Link already exists: <source> —<relationship>→ <target>` |
| `LINK_NOT_FOUND` | `link delete` for a link that does not exist | Exit 1. Message: `Link not found: <source> —<relationship>→ <target>` |
| `EMPTY_SEARCH` | `search` with an empty or whitespace-only query | Exit 1. Message: `Search query must not be empty` |
| `INVALID_DEPTH` | `neighbors`, `path`, `subgraph` with depth <= 0 or depth > max (default 10) | Exit 1. Message: `Depth must be between 1 and <max>` |
| `WORKSPACE_EXISTS` | `init` on a directory that is already a BrainMap workspace | Exit 1. Message: `Directory is already a BrainMap workspace: <path>` |
| `INVALID_WORKSPACE` | `federation add` pointing to a path that does not exist or is not a valid workspace | Exit 1. Message: `Not a valid BrainMap workspace: <path>` |
| `INDEX_CORRUPT` | Any command when `.brainmap/index.db` is corrupted or missing | Automatic reindex is attempted. If reindex fails, exit 1. Message: `Index is corrupt or missing. Attempted reindex failed: <reason>` |
| `MOVE_TARGET_EXISTS` | `node move` when the target path already exists | Exit 1. Message: `Target path already exists: <new-path>` |

## Concurrency

BrainMap v1 uses a **last-write-wins** strategy. There is no file-level locking.

When `brainmap serve` is running, the server watches the file system for external changes (edits from a text editor, OS file manager, `git pull`, etc.) and automatically triggers an incremental reindex when files change. CLI commands invoked while the server is running operate directly on the files and the server picks up changes via the file watcher.

If two processes write to the same file simultaneously, the last write is preserved. Users are expected to avoid concurrent writes to the same node; this is an acceptable trade-off for v1 simplicity. Future versions may introduce optimistic locking or conflict detection.

## Cycle Handling

Graph traversal commands (`neighbors`, `path`, `subgraph`) track visited nodes to avoid infinite loops when cycles exist in the graph. Traversal will never revisit a node it has already expanded.

A maximum depth cap is enforced (default: 10). Depth values above the cap are rejected with an `INVALID_DEPTH` error. This protects against runaway traversal in densely connected graphs.

Cycles in relationship types like `extends` or `contains` are not prevented at write time in v1 — they are reported as warnings by `brainmap validate`.
