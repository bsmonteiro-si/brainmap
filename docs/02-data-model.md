? 01 to 04 are# BrainMap — Data Model

## Overview

BrainMap's data model has three layers:
1. **Files** — `.md` files with YAML frontmatter, organized in directories
2. **Graph** — Nodes (notes) and edges (relationships) derived from files
3. **Index** — On-disk index for fast search, backlink lookups, and graph traversal

## Canonical Path Format

All paths within BrainMap are **workspace-relative**. The system normalizes `./` and `../` prefixes on write so that stored paths always start from the workspace root without leading punctuation.

- Frontmatter `target` values: `Concepts/Causal Inference.md`
- In-content markdown links: `[Causal Inference](Concepts/Causal Inference.md)`
- Cross-workspace links: `WorkspaceName::Concepts/Graph Theory.md`

The system resolves and normalizes paths when a note is created or updated. Users may type `./` or `../` for convenience; the system rewrites them to workspace-relative form before saving.

## Note Format

Every note is a standard markdown file with YAML frontmatter:

```markdown
---
id: "a1b2c3d4-5678-90ab-cdef-1234567890ab"
title: "Counterfactual Reasoning"
type: concept
tags: [causality, reasoning, philosophy]
status: draft
created: 2026-03-09
modified: 2026-03-09
source: "The Book of Why, Ch.1"
summary: >-
  The ability to reason about what would have happened
  under different circumstances. Core to causal inference.
links:
  - target: "Concepts/Causal Inference.md"
    rel: extends
  - target: "People/Judea Pearl.md"
    rel: authored-by
domain: causal-ml
maturity: foundational
aliases: [counterfactuals, CF reasoning]
---

# Counterfactual Reasoning

The actual note content goes here in standard markdown...
```

### YAML Parsing Guidance

YAML has well-known pitfalls that affect user-generated frontmatter. BrainMap uses strict YAML parsing and adopts these conventions:

- **Always quote string values** — unquoted `no`, `yes`, `on`, `off` are parsed as booleans; unquoted `1.0` is parsed as a float. Use `"no"`, `"yes"`, etc.
- **Always quote titles containing colons** — `title: Foo: Bar` is invalid YAML. Use `title: "Foo: Bar"`.
- **Use ISO date format** — `2026-03-09`, not `March 9, 2026`.
- **Strict mode** — the parser rejects duplicate keys and warns on implicit type coercion.

### Link Format

In-content links use standard markdown syntax for portability:

```markdown
This concept was introduced by [Judea Pearl](People/Judea Pearl.md) and
builds on [structural causal models](Concepts/Structural Causal Models.md).
```

In-content markdown links are indexed as untyped `mentioned-in` edges. They appear in the graph with a visually distinct style (e.g., dashed line, muted color) to differentiate them from typed frontmatter edges. This ensures inline references are discoverable without conflating them with intentional, typed relationships.

Frontmatter `links` are for **typed, directional relationships** that carry semantic meaning beyond "this note mentions that note."

Cross-workspace links use the `WorkspaceName::path` syntax in both frontmatter and content:

```markdown
See also [Graph Theory](Personal Notes::Concepts/Graph Theory.md)
```

## Frontmatter Schema

### Base Fields (all notes)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | auto-generated | Stable identifier, auto-generated on creation. Enables rename-safe linking. |
| `title` | string | yes | Display name of the note |
| `type` | string | yes | Note type (see Note Types below) |
| `tags` | string[] | no | Flat list of tags for filtering |
| `status` | enum | no | `draft`, `review`, `final`, `archived` |
| `created` | date | yes | Creation date (YYYY-MM-DD) |
| `modified` | date | yes | Last modification date |
| `source` | string | no | Origin reference (book, paper, URL) |
| `summary` | string | no | 1-3 sentence description for graph tooltips and search results |
| `links` | Link[] | no | Typed relationships to other notes |

### The `id` Field

Every note receives a UUID `id` on creation. This field is auto-generated and should not be manually edited. Its purposes:

- **Rename-safe linking** — when a note is moved or renamed, inbound links that reference the `id` remain valid.
- **Link targets** — the `target` field in a link object can be either a workspace-relative path or a UUID. Path-based linking is the default for human readability; `id`-based linking is used by automated tools (e.g., `move-note`) to maintain integrity.
- **Optional for link targets** — users are never required to look up or type UUIDs. The system resolves paths to IDs internally when needed.

### Link Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `target` | string | yes | Workspace-relative path or UUID of target note |
| `rel` | string | yes | Relationship type (see Edge Types) |

Future extensions (not v1): `strength` (float), `description` (string), `created` (date), `bidirectional` (bool).

### Type-Specific Fields

Any field not in the base schema is treated as a type-specific extension. The system tracks which fields appear per type but does not enforce a rigid schema. Examples:

- **concept**: `domain`, `maturity`, `aliases`
- **book-note**: `chapter`, `page-range`, `book-title`
- **person**: `affiliation`, `field`, `era`
- **question**: `answered`, `answer-in`
- **experiment**: `method`, `dataset`, `result`

## Note Types

Recommended types are pre-populated in `config.yaml` on workspace initialization. Unknown types are not rejected. When a note uses a type not in the registered list, the system produces a **warning on first use** (to catch typos) and auto-registers the new type in `config.yaml`. Subsequent uses of that type produce no warning.

| Type | Purpose |
|------|---------|
| `concept` | A distinct idea, theory, or framework |
| `book-note` | Notes on a section/chapter of a book |
| `question` | An open question or inquiry |
| `reference` | A paper, book, article, or external source |
| `index` | A hub/waypoint that organizes other notes |
| `argument` | A claim with supporting/opposing evidence |
| `evidence` | Data, observation, or finding supporting a claim |
| `experiment` | A specific study, test, or trial |
| `person` | A notable figure and their contributions |
| `project` | A project or initiative that connects multiple notes |

## Edge Types (Relationship Types)

### Hierarchical
| Type | Description | Example |
|------|-------------|---------|
| `contains` | Parent/child structural containment | Chapter -> Section |
| `part-of` | Inverse of contains | Section -> Chapter |

### Causal / Logical
| Type | Description | Example |
|------|-------------|---------|
| `causes` | Causal relationship | Smoking -> Lung Cancer |
| `supports` | Evidence/argument supporting a claim | RCT Result -> Hypothesis |
| `contradicts` | Opposing or conflicting relationship | Frequentist View -> Bayesian View |
| `extends` | Builds upon or refines | SCM -> Do-Calculus |
| `depends-on` | Prerequisite or dependency | Do-Calculus -> Probability Theory |
| `exemplifies` | Is an example/instance of | Simpson's Paradox -> Confounding |

### Temporal / Sequential
| Type | Description | Example |
|------|-------------|---------|
| `precedes` | Comes before in a sequence | Galton -> Pearson |
| `leads-to` | Evolved into or gave rise to | Regression -> Path Analysis |
| `evolved-from` | Developed from a prior concept | Bayesian Networks -> Causal Diagrams |

### Associative
| Type | Description | Example |
|------|-------------|---------|
| `related-to` | General association (weakest type) | — |
| `authored-by` | Created or written by a person | Book of Why -> Judea Pearl |
| `sourced-from` | Originates from this reference | Concept Note -> Book Reference |

### Inline (system-generated)
| Type | Description | Example |
|------|-------------|---------|
| `mentioned-in` | Generated from in-content markdown links | — |

Custom edge types are allowed — the system registers them on first use (with a warning), just like note types.

### Edge Directionality

All edges are **unidirectional** in v1. An edge is stored only in the source note's frontmatter and points to the target.

For inherently symmetric relationships like `contradicts`, the graph engine traverses edges in **both directions** during queries. The UI renders a bidirectional arrow for `contradicts` edges, but storage remains one-way. If both notes independently declare `contradicts` toward each other, both edges are stored, but the system treats them as a single bidirectional relationship in the UI.

### Edge Origin

Every edge has an `origin` property (not stored in frontmatter — computed at index time):

| Origin | Description |
|--------|-------------|
| `explicit` | Declared in frontmatter `links` or derived from in-content markdown links |
| `implicit` | Derived from directory structure |

This distinction allows the UI to show/hide structural edges and prevents implicit edges from polluting query results by default.

### Implicit vs. Explicit Edge Precedence

When both an implicit and explicit edge of the same type exist between the same two notes, **explicit always wins**. The implicit edge is suppressed — only the explicit edge is stored in the index. This prevents duplication and ensures user intent takes priority over directory structure.

### Implicit Edge Rules

The system generates implicit edges from the directory hierarchy with these constraints:

1. Only `contains` edges are generated (downward, from parent node to child node).
2. `part-of` is **not stored** — it is inferred on query by reversing `contains` edges. This halves the implicit edge count.
3. Non-node directories (directories without a matching index `.md`) do not produce edges. Their children **bubble up** to the nearest ancestor that is a node. For example, if `Concepts/` has no `Concepts.md`, then `Concepts/Counterfactuals.md` becomes a child of the nearest ancestor node (e.g., `Causal ML`).

## Directory-to-Graph Mapping (Hybrid Model)

### Automatic Edges from Directory Structure

```
workspace-root/
├── Causal ML/
│   ├── Causal ML.md          (index node)
│   ├── Concepts/
│   │   ├── Counterfactuals.md
│   │   └── Do-Calculus.md
│   └── Books/
│       └── The Book of Why/
│           ├── The Book of Why.md  (index node)
│           ├── Ch1 - Introduction.md
│           └── Ch2 - Genesis.md
```

The system generates implicit `contains` edges (downward only):
- `Causal ML` -> contains -> `Counterfactuals` (bubbled up from non-node `Concepts/`)
- `Causal ML` -> contains -> `Do-Calculus` (bubbled up from non-node `Concepts/`)
- `Causal ML` -> contains -> `The Book of Why`
- `The Book of Why` -> contains -> `Ch1 - Introduction`
- `The Book of Why` -> contains -> `Ch2 - Genesis`

`part-of` edges (e.g., `Counterfactuals` -> part-of -> `Causal ML`) are inferred on query, not stored.

### Rules

1. A directory that contains a `.md` file with the same name as the directory is treated as that directory's **index node**.
2. All other `.md` files in the directory become children of the index node.
3. Subdirectories follow the same pattern recursively.
4. If no matching index `.md` exists, the directory is a **non-node directory** — its children bubble up to the nearest ancestor node.

## Workspace Definition

A **workspace** is a directory containing a `.brainmap/` subdirectory. Workspaces cannot be nested: a `.brainmap/` directory inside an existing workspace is an error. Notes can live at any level of the directory tree, including the workspace root.

## Workspace Configuration

Each workspace root contains a `.brainmap/` directory:

```
workspace-root/
├── .brainmap/
│   ├── config.yaml       # workspace settings
│   ├── index.db          # search + backlink index (SQLite or similar)
│   └── cache/            # graph cache, thumbnails, etc.
├── notes/
│   └── ...
```

### config.yaml

```yaml
name: "Masters Thesis"
version: 1
note_types:
  - concept
  - book-note
  - question
  - reference
  - index
  # custom types auto-registered here on first use (with warning)
edge_types:
  - contains
  - causes
  - supports
  - contradicts
  - extends
  - sourced-from
  # custom types auto-registered here on first use (with warning)
federation:
  - name: "Personal"
    path: "~/brain-map/personal"
```

### Schema Versioning

The `version` field in `config.yaml` tracks the workspace schema version. Rules:

- **Forward-compatible** — unknown fields in frontmatter and config are preserved and ignored. A v1 tool reading a file with v2 fields will not break.
- **Breaking changes** — any change that alters the meaning of existing fields or removes required fields bumps the version number and requires a migration script shipped with the release.
- **Migration** — the CLI provides a `migrate` command that transforms workspace files from version N to version N+1. Migration is explicit and never automatic.

## Index Layer

The index (`index.db`) provides fast search, backlink lookups, and graph traversal without re-parsing files on every query.

### What is Indexed

- **Full-text content** of every note (markdown body, stripped of syntax)
- **All frontmatter fields** — searchable by field name and value (e.g., `type:concept`, `tags:causality`)
- **Outbound edges** from frontmatter `links`
- **Inline edges** from in-content markdown links (as `mentioned-in` edges)
- **Implicit edges** from directory structure (as `contains` edges)
- **Backlink index** — a dedicated reverse index mapping each note to all notes that link to it (both frontmatter and inline). This is a first-class index, not a derived query.

### Sync Model

- **Incremental on file change** — when a file is created, modified, or deleted, only that file's index entries are updated. The system uses file modification timestamps to detect changes.
- **Full rebuild on `reindex`** — the `reindex` operation drops and rebuilds the entire index from the file system. Use this after bulk file operations outside BrainMap (e.g., git pull, manual file edits).
- **Startup check** — on startup, the system compares file modification timestamps against the index and incrementally updates stale entries.
- **Cache invalidation** — the `cache/` directory holds derived artifacts (graph layout, thumbnails). Cache entries are invalidated when their source index entries change.

## Federated Workspaces

Multiple workspaces can reference each other:

```yaml
# In workspace A's config.yaml
federation:
  - name: "Personal Notes"
    path: "/Users/bsmonteiro/brain-map/personal"
```

Cross-workspace links use the `WorkspaceName::path` syntax everywhere (frontmatter and content):

```yaml
links:
  - target: "Personal Notes::Concepts/Graph Theory.md"
    rel: related-to
```

```markdown
See also [Graph Theory](Personal Notes::Concepts/Graph Theory.md)
```

Federated nodes appear with a distinct visual marker in the graph view.
