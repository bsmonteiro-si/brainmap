# 2026-03-11 — Subagent Transcript: Explore

**Date:** 2026-03-11 19:14:20
**Agent:** Explore
**Agent ID:** a16e8fe33f73e6a92
**Parent Session:** cac98a5e-bb31-4585-8135-4876e33d5c71

---

## User

Explore the data model to understand all frontmatter fields. I need:
1. The `Node` struct in `crates/core/src/model.rs` - all fields
2. The `Frontmatter` or equivalent struct
3. What fields are standard vs type-specific (the `extra` field)
4. The 10 note types and 15 edge types
5. How links are structured in the model
6. Look at `docs/02-data-model.md` for the spec

Also check what the DTO layer looks like in `crates/app/src-tauri/src/dto.rs`.

---

## Assistant

I'll explore the data model comprehensively. Let me start by reading the key files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/02-data-model.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs"}`

---

## Assistant

Perfect! I have all the information you need. Let me compile a comprehensive summary of the data model.

## Data Model Summary

### 1. **Node Structure** (`crates/core/src/model.rs`)

The `Note` struct contains:
- **`path`** (`RelativePath`) — workspace-relative path to the file
- **`frontmatter`** (`Frontmatter`) — all metadata
- **`body`** (`String`) — the markdown content after frontmatter
- **`inline_links`** (`Vec<InlineLink>`) — markdown links found in the body

### 2. **Frontmatter Structure** (the core metadata)

```rust
pub struct Frontmatter {
    pub id: NoteId,                              // UUID, auto-generated
    pub title: String,                           // Display name
    pub note_type: String,                       // e.g., "concept", "book-note", etc.
    pub tags: Vec<String>,                       // Flat list, optional
    pub status: Option<Status>,                  // draft|review|final|archived
    pub created: NaiveDate,                      // YYYY-MM-DD format
    pub modified: NaiveDate,                     // YYYY-MM-DD format
    pub source: Option<String>,                  // Origin reference (book, URL, etc.)
    pub summary: Option<String>,                 // 1-3 sentence description
    pub links: Vec<TypedLink>,                   // Typed relationships
    pub extra: HashMap<String, serde_yaml::Value>, // Type-specific fields
}
```

**Standard vs. Type-Specific Fields:**
- **Standard (all notes)**: `id`, `title`, `type`, `tags`, `status`, `created`, `modified`, `source`, `summary`, `links`
- **Type-specific (in `extra`)**: Any field not in the standard set. Examples:
  - `concept`: `domain`, `maturity`, `aliases`
  - `book-note`: `chapter`, `page-range`, `book-title`
  - `person`: `affiliation`, `field`, `era`
  - `question`: `answered`, `answer-in`
  - `experiment`: `method`, `dataset`, `result`

### 3. **Link Structures**

**TypedLink** (frontmatter links):
```rust
pub struct TypedLink {
    pub target: String,              // Workspace-relative path or UUID
    pub rel: String,                 // Relationship type (e.g., "extends", "authored-by")
    pub annotation: Option<String>,  // Optional note on the relationship
}
```

**InlineLink** (markdown body links):
```rust
pub struct InlineLink {
    pub target: String,              // Workspace-relative path
    pub label: Option<String>,       // Link text
    pub position: usize,             // Position in body
}
```

### 4. **10 Note Types**

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
| `project` | A project or initiative connecting multiple notes |

Custom types are auto-registered in `config.yaml` on first use (with a warning).

### 5. **15 Edge Types**

**Hierarchical:**
- `contains` — Parent/child structural containment (Chapter → Section)
- `part-of` — Inverse of contains (inferred on query, not stored)

**Causal/Logical:**
- `causes` — Causal relationship (Smoking → Lung Cancer)
- `supports` — Evidence/argument supporting a claim (RCT Result → Hypothesis)
- `contradicts` — Opposing or conflicting relationship (traversed both ways in UI)
- `extends` — Builds upon or refines (SCM → Do-Calculus)
- `depends-on` — Prerequisite or dependency (Do-Calculus → Probability Theory)
- `exemplifies` — Is an example/instance of (Simpson's Paradox → Confounding)

**Temporal/Sequential:**
- `precedes` — Comes before in a sequence (Galton → Pearson)
- `leads-to` — Evolved into or gave rise to (Regression → Path Analysis)
- `evolved-from` — Developed from a prior concept (Bayesian Networks → Causal Diagrams)

**Associative:**
- `related-to` — General association (weakest type)
- `authored-by` — Created or written by a person (Book → Author)
- `sourced-from` — Originates from this reference (Concept Note → Book Reference)

**Inline (system-generated):**
- `mentioned-in` — Generated from in-content markdown links

Custom edge types are auto-registered on first use (with warning).

### 6. **Edge Model in Code**

```rust
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct Edge {
    pub source: RelativePath,        // Source note path
    pub target: RelativePath,        // Target note path
    pub rel: String,                 // Relationship type
    pub kind: EdgeKind,              // Explicit | Implicit | Inline
}

pub enum EdgeKind {
    Explicit,  // From frontmatter links or explicit markdown
    Implicit,  // From directory structure (contains only)
    Inline,    // From in-content markdown links (mentioned-in)
}
```

**Edge Directionality**: All edges are unidirectional (stored only once, from source to target). For symmetric edges like `contradicts`, the graph engine traverses both directions during queries.

### 7. **DTO Layer** (`crates/app/src-tauri/src/dto.rs`)

Request DTOs:
- **`CreateNoteParams`**: `path`, `title`, `note_type`, `tags`, `status`, `source`, `summary`, `extra` (HashMap), `body`
- **`UpdateNoteParams`**: All fields optional (except path)
- **`LinkParams`**: `source`, `target`, `rel`, `annotation`
- **`SearchParams`**: `query`, `note_type`, `tag`, `status`
- **`NeighborsParams`**: `path`, `depth`, `direction`, `rel_filter`

Response DTOs:
- **`NoteDetailDto`**: Full note with frontmatter, body, resolved links
- **`NodeDto`**: Lightweight node (path, title, note_type)
- **`EdgeDto`**: Edge with source, target, rel, kind
- **`GraphTopologyDto`**: Nodes + Edges for full graph
- **`SearchResultDto`**: Path, title, note_type, snippet, rank
- **`StatsDto`**: Aggregate statistics (nodes_by_type, edges_by_rel, edges_by_kind, orphan_count)

**Key Conversion**: YAML ↔ JSON via `yaml_map_to_json` / `json_to_yaml` helpers for the IPC boundary (Tauri).

### 8. **Additional Model Types**

**Status Enum** (4 variants, serde lowercase):
- `draft`, `review`, `final`, `archived`

**NodeData** (for graph operations):
```rust
pub struct NodeData {
    pub title: String,
    pub note_type: String,
    pub tags: Vec<String>,
    pub path: RelativePath,
}
```

**GraphDiff** (returned by incremental operations like `reload_file`):
```rust
pub struct GraphDiff {
    pub added_nodes: Vec<NodeData>,
    pub removed_nodes: Vec<RelativePath>,
    pub added_edges: Vec<Edge>,
    pub removed_edges: Vec<Edge>,
}
```

**RelativePath**: Wrapper around `String` with path normalization (resolves `..`, strips `./` prefix, handles cross-platform paths).

---

### Key Design Insights

1. **The `extra` field** is the mechanism for type-specific extensibility — it's a `HashMap` that accepts any YAML values, allowing arbitrary fields per note type.
2. **Implicit edges** are only `contains` (downward from parent dirs). `part-of` is inferred on query.
3. **Link targets** can be either **paths** (for human readability) or **UUIDs** (for rename-safety). The system resolves paths to UUIDs internally.
4. **Inline links** from markdown body are automatically indexed as `mentioned-in` edges with `EdgeKind::Inline`.
5. **The DTO layer** converts between YAML (internal) and JSON (for Tauri IPC and CLI output), preserving all field types.

---

