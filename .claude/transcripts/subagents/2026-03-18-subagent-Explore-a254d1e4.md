# 2026-03-18 — Subagent Transcript: Explore

**Date:** 2026-03-18 17:16:29
**Agent:** Explore
**Agent ID:** a254d1e4662c38bb2
**Parent Session:** 26b25b6a-d4c2-4af3-aa3e-99baee782263

---

## User

Explore the BrainMap data model to understand:

1. The Note/Node struct in crates/core/src/model.rs - all fields, especially any ordering/position fields
2. The frontmatter fields defined in docs/02-data-model.md
3. How notes are parsed from markdown files (frontmatter parsing)
4. The workspace.rs file - how notes are listed/retrieved, any sorting logic
5. The graph.rs file - how nodes are ordered in the graph

I need to understand if there's any existing mechanism for custom sort order, or if files are always sorted alphabetically/by some fixed criteria.

---

## Assistant

I'll explore the BrainMap data model to understand the Note/Node structure and any existing sort mechanisms.

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

- **Glob**: `{"pattern":"crates/core/src/*.rs"}`

---

## Assistant

Let me now read the workspace.rs and graph.rs files to understand how notes are listed and sorted:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","limit":300}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs","limit":300}`

---

## Assistant

Let me continue reading workspace.rs to see all the listing/retrieval methods:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":300,"limit":400}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub fn.*list|pub fn.*get.*notes|pub fn.*all_notes|sort","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src","output_mode":"content"}`

---

## Assistant

Let me check that list_all_graph_nodes method and look for any sorting logic:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":1300,"limit":100}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"sort|Sort|ORDER|order","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","output_mode":"content","head_limit":40}`

---

## Assistant

Now let me check the CLI commands to see if there's any sorting applied there:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/cli/src/commands/*.rs"}`

---

## Assistant

Let me check the node.rs command to see if there's listing/sorting:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"sort|list|Sort|LIST","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/node.rs","output_mode":"content"}`

---

## Assistant

Let me read the full node.rs file to understand the list command:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/node.rs"}`

---

## Assistant

Perfect! Now let me look at the Tauri app to see if there's any sorting in the FileTreePanel:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":200}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"sort|Sort|order","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content"}`

---

## Assistant

Excellent! Let me check the UIStore to see how fileSortOrder is stored:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"fileSortOrder|setSortOrder","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","output_mode":"content","context":5}`

---

## Assistant

Perfect! Now let me check what FileSortOrder type contains:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"type FileSortOrder|FileSortOrder =","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","output_mode":"content","context":3}`

---

## Assistant

Perfect! Now let me check the parser to understand how notes are parsed from markdown:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/parser.rs","limit":150}`

---

## Assistant

Perfect! Now I have all the information I need. Let me compile my findings:

## Summary: BrainMap Data Model & Sort Order Analysis

Based on my thorough exploration of the BrainMap codebase, here are my findings:

### 1. **Note/Node Struct** (`crates/core/src/model.rs`)

**Frontmatter Fields:**
- `id` (NoteId/UUID) - auto-generated, immutable
- `title` (String) - required
- `type` (note_type, String) - required
- `tags` (Vec<String>) - optional
- `status` (Option<Status>) - optional, enum: Draft|Review|Final|Archived
- `created` (NaiveDate) - required
- `modified` (NaiveDate) - required
- `source` (Option<String>) - optional
- `summary` (Option<String>) - optional
- `links` (Vec<TypedLink>) - explicit relationships
- `extra` (HashMap<String, serde_yaml::Value>) - custom type-specific fields

**Note Struct** contains:
- `path` (RelativePath)
- `frontmatter` (Frontmatter)
- `body` (String)
- `inline_links` (Vec<InlineLink>)

**NodeData** (graph representation) contains:
- `title`, `note_type`, `tags`, `path`, `modified`

**Key Finding:** There is **NO ordering/position field** in the data model. All notes are stored in a HashMap by path.

### 2. **Frontmatter Fields** (`docs/02-data-model.md`)

The data model spec lists **11 base/core fields** and **15 edge types**. No position or ordering field is mentioned. Type-specific fields are allowed but not pre-defined in the spec.

### 3. **Note Parsing** (`crates/core/src/parser.rs`)

Notes are parsed from markdown files via:
- `split_frontmatter()` extracts YAML block and body
- `serde_yaml::from_str()` deserializes the YAML into Frontmatter struct
- Fields are NOT order-dependent (HashMap deserialization)
- Inline links extracted via regex from markdown body
- No ordering/sequencing logic applied

### 4. **Workspace Listing Methods** (`crates/core/src/workspace.rs`)

**Key methods:**
- `list_nodes(type_filter, tag_filter, status_filter)` - returns `Vec<&Note>` **in HashMap iteration order** (unordered)
- `list_all_graph_nodes()` - returns `Vec<&NodeData>` (also unordered)
- `read_note(path)` - single note lookup
- `neighbors()`, `subgraph()` - graph traversal (unordered results)

**Critical Finding:** `list_nodes()` does NOT sort results - it returns raw HashMap values.

### 5. **Graph Ordering** (`crates/core/src/graph.rs`)

- Graph uses `HashMap<RelativePath, NodeData>` for nodes
- Edges stored in `HashMap<RelativePath, Vec<Edge>>`
- **No ordering mechanism** - all graph queries return unordered collections
- `all_nodes()` returns iterator over HashMap (unordered)

### 6. **CLI Listing** (`crates/cli/src/commands/node.rs`)

The `node list` command:
- Calls `ws.list_nodes()` (unordered HashMap results)
- Applies `skip(offset).take(limit)` pagination to unsorted results
- **No sorting applied at CLI level**
- Output in JSON/YAML reflects HashMap iteration order

### 7. **Desktop App File Tree Sorting** (`crates/app/src/components/Layout/FileTreePanel.tsx`)

**This is where custom sorting DOES exist:**

`buildTree()` function has a `sortChildren()` helper that supports:
- `"name-asc"` (default) - alphabetical ascending
- `"name-desc"` - alphabetical descending  
- `"modified-asc"` - modification date ascending
- `"modified-desc"` - modification date descending

**Storage:** `fileSortOrder` persisted in UIStore → localStorage as `brainmap:uiPrefs`

**Type Definition** (`crates/app/src/stores/uiStore.ts`):
```typescript
export type FileSortOrder = "name-asc" | "name-desc" | "modified-desc" | "modified-asc";
```

**Important:** Sorting happens **only in the React frontend's file tree UI**, not in the backend.

### Summary Table

| Component | Has Sort? | How? | Location |
|-----------|-----------|------|----------|
| Data Model | No | — | `model.rs` |
| Parser | No | — | `parser.rs` |
| Workspace API | No | HashMap order only | `workspace.rs` |
| Graph | No | HashMap order only | `graph.rs` |
| CLI `node list` | No | Pagination only | `commands/node.rs` |
| Desktop App FileTree | **Yes** | 4 sort modes (name/modified ± direction) | `FileTreePanel.tsx`, `uiStore.ts` |

### Key Insights

1. **No backend sort field** - If you want custom sort order, you'd need to add a new frontmatter field (e.g., `order: number`)
2. **Frontend-only sorting** - The desktop app has in-memory sorting in the tree view, but it doesn't persist or affect backend APIs
3. **No CLI sort support** - The CLI always returns results in HashMap iteration order (undefined)
4. **Modified date available** - The `modified` field exists and can be used for sorting (both frontend and potentially backend)

---

