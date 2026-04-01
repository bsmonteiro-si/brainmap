# 2026-03-13 — Subagent Transcript: Explore

**Date:** 2026-03-13 11:27:10
**Agent:** Explore
**Agent ID:** ac495f0823ff113d9
**Parent Session:** e2adebf4-0599-4c1c-95a6-fa3b9af7f854

---

## User

Research the BrainMap project's node/note model to understand what constitutes a "node" in the graph. I need to understand:

1. The full Note struct and NoteType enum (all 10 types)
2. How nodes are identified (path-based IDs? UUIDs?)
3. The Node struct in the graph — what fields does it have?
4. How the graph is built from parsed notes (graph construction in graph.rs)
5. Whether there's any concept of a "folder node" or "virtual node" that isn't a .md file
6. How the data model spec (docs/data-model.md) defines notes and relationships
7. How the frontend GraphView/graphStore represents nodes
8. The DTO layer — how nodes are serialized for the frontend

Focus on: crates/core/src/types.rs, crates/core/src/graph.rs, docs/data-model.md, crates/app/src-tauri/src/dto.rs, crates/app/src/stores/graphStore.ts.

Output detailed findings with file paths and line numbers.

---

## Assistant

I'll systematically explore the BrainMap project's node/note model. Let me start by examining the key files you've identified.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/types.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/data-model.md"}`

---

## Assistant

Let me find the correct paths for the model types and data model documentation:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/types.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/model.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/data-model.md"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/dto.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/graphStore.ts"}`

---

## Assistant

Now let me read the core model and related files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

Now let me search for the data model documentation and look for the note types enum:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/docs/**"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/docs -type f -name \"*.md\" | head -20"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"concept|book-note|question|reference|index|argument|evidence|experiment|person|project","path":"/Users/bsmonteiro/Desktop/Personal/brainmap","type":"md","head_limit":20}`

---

## Assistant

Let me read the data model documentation and check the workspace structure:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/02-data-model.md"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/workspace.rs"}`

---

## Assistant

Now let me check the workspace.rs file and look for frontend node types:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","limit":150}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/api/types.ts"}`

---

## Assistant

Let me continue reading workspace.rs and get the frontend API types:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","limit":300,"offset":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

Now let me check for any frontend-specific node representations and look at more of workspace.rs:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"note_type\\|NodeType\\|Enum\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs | head -30"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -rn \"concept\\|book-note\\|question\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/config.rs | head -20"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/config.rs"}`

---

## Assistant

Perfect! Let me read the config.rs file to see the full list of note types and edges:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/config.rs"}`

---

## Assistant

Excellent! Now let me check if there's any folder-specific node handling and look at the parser:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -rn \"folder\\|directory\\|virtual\\|implicit\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs | head -20"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/parser.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView.tsx","limit":100}`

---

## Assistant

Let me search for the GraphView in the correct location:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/*GraphView*"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/parser.rs","limit":150}`

---

## Assistant

Perfect! Now let me get a quick overview of the GraphView and check how nodes are rendered:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx","limit":100}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"NodeDto\\|NodeData\\|folder\\|virtual\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx | head -20"}`

---

## Assistant

Perfect! Now I have comprehensive information. Let me compile the detailed findings about the BrainMap node/note model.

## Detailed Findings: BrainMap Node/Note Model

Based on thorough exploration of the codebase, here is a comprehensive overview of how nodes and notes are modeled in BrainMap:

---

### 1. The Full Note Struct and NoteType Enum

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs`

**Note Struct** (lines 154-159):
```rust
pub struct Note {
    pub path: RelativePath,
    pub frontmatter: Frontmatter,
    pub body: String,
    pub inline_links: Vec<InlineLink>,
}
```

**Frontmatter Struct** (lines 132-151):
```rust
pub struct Frontmatter {
    pub id: NoteId,
    pub title: String,
    pub note_type: String,
    pub tags: Vec<String>,
    pub status: Option<Status>,
    pub created: NaiveDate,
    pub modified: NaiveDate,
    pub source: Option<String>,
    pub summary: Option<String>,
    pub links: Vec<TypedLink>,
    pub extra: HashMap<String, serde_yaml::Value>,
}
```

**Status Enum** (lines 92-99): `Draft`, `Review`, `Final`, `Archived`

**NoteId** (lines 9-28): A UUID wrapper that auto-generates on creation

**The 10 Note Types** are NOT defined as a Rust enum but as a string field in `note_type`. Default types are configured in `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/config.rs` (lines 84-100):

1. `concept` — A distinct idea, theory, or framework
2. `book-note` — Notes on a section/chapter of a book
3. `question` — An open question or inquiry
4. `reference` — A paper, book, article, or external source
5. `index` — A hub/waypoint that organizes other notes
6. `argument` — A claim with supporting/opposing evidence
7. `evidence` — Data, observation, or finding supporting a claim
8. `experiment` — A specific study, test, or trial
9. `person` — A notable figure and their contributions
10. `project` — A project or initiative that connects multiple notes

Custom types are auto-registered on first use (with a warning).

---

### 2. Node Identification

**Path-based IDs** are the primary identifier:
- **Type**: `RelativePath` (lines 30-61, model.rs) — a normalized workspace-relative string
- **Examples**: `Concepts/Causal Inference.md`, `The Book of Why/Chapter 1.md`
- **Normalization**: Strips leading `./`, resolves `../`, and uses forward slashes

**UUID-based IDs** are secondary (for rename-safe linking):
- Each note receives an auto-generated UUID `id` in its frontmatter
- Used by tools like `move-note` to maintain integrity when files are renamed
- Optional for link targets; users typically link by path

---

### 3. The Node Struct in the Graph

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs` (lines 183-189)

**NodeData Struct**:
```rust
pub struct NodeData {
    pub title: String,
    pub note_type: String,
    pub tags: Vec<String>,
    pub path: RelativePath,
}
```

This is the lightweight node representation stored in the graph. It contains only essential metadata for graph queries and visualization.

---

### 4. Graph Construction from Parsed Notes

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs` (lines 100-237)

**Graph Initialization Process**:
1. All `.md` files are parsed (lines 104-124)
2. For each parsed note, a `NodeData` is added to the graph (lines 134-145):
   ```rust
   graph.add_node(
       path.clone(),
       NodeData {
           title: note.frontmatter.title.clone(),
           note_type: note.frontmatter.note_type.clone(),
           tags: note.frontmatter.tags.clone(),
           path: path.clone(),
       },
   );
   ```
3. Explicit edges are extracted from frontmatter `links` (lines 149-166)
4. Inline links are extracted from markdown content (lines 168-175) and stored as `mentioned-in` edges
5. **Implicit edges** are computed from directory structure via `compute_implicit_edges()` (line 194)

**Graph Structure** (`graph.rs`, lines 10-14):
```rust
pub struct Graph {
    nodes: HashMap<RelativePath, NodeData>,
    outgoing: HashMap<RelativePath, Vec<Edge>>,
    incoming: HashMap<RelativePath, Vec<Edge>>,
}
```

---

### 5. Folder Nodes and Virtual Nodes

**No folder or virtual nodes exist in the graph itself.** Only `.md` files become nodes.

**However, implicit structural containment works via directory hierarchy**:
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs` (lines 289-351)
- Algorithm: `compute_implicit_edges()` + `find_nearest_ancestor_node()`
- **Rule 1**: A directory with a matching `.md` file (e.g., `Causal ML/Causal ML.md`) has an **index node**
- **Rule 2**: All sibling `.md` files become children of the index node (via `contains` edge)
- **Rule 3**: If no matching `.md` exists, children **bubble up** to the nearest ancestor node
- **Result**: `contains` edges only; `part-of` is inferred on query (reversed)

**Example** from docs/02-data-model.md:
```
Causal ML/
├── Causal ML.md (index node)
├── Concepts/
│   ├── Counterfactuals.md
│   └── Do-Calculus.md
```
Generates: `Causal ML contains Counterfactuals` (bubble-up from non-node `Concepts/`)

---

### 6. The 15 Edge Types

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/config.rs` (lines 102-123)

**EdgeKind Enum** (model.rs, lines 161-166):
```rust
pub enum EdgeKind {
    Explicit,   // from frontmatter links or inline markdown
    Implicit,   // from directory structure
    Inline,     // from in-content markdown links
}
```

**The 15 Edge Types**:
1. `contains` — Parent/child structural containment
2. `part-of` — Inverse of contains (inferred on query)
3. `causes` — Causal relationship
4. `supports` — Evidence/argument supporting a claim
5. `contradicts` — Opposing or conflicting relationship
6. `extends` — Builds upon or refines
7. `depends-on` — Prerequisite or dependency
8. `exemplifies` — Is an example/instance of
9. `precedes` — Comes before in a sequence
10. `leads-to` — Evolved into or gave rise to
11. `evolved-from` — Developed from a prior concept
12. `related-to` — General association (weakest type)
13. `authored-by` — Created or written by a person
14. `sourced-from` — Originates from this reference
15. `mentioned-in` — Generated from in-content markdown links (system-generated)

Custom edge types are auto-registered on first use.

---

### 7. Data Model Spec

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/docs/02-data-model.md`

Key points:
- **Notes are markdown files with YAML frontmatter**
- **Links are workspace-relative paths** (e.g., `Concepts/Causal Inference.md`)
- **Federated workspaces** use `WorkspaceName::path` syntax
- **Implicit edges** are generated from directory structure; explicit edges from frontmatter
- **Backlinks** are resolved via SQLite FTS5 index (search index), not stored directionally
- **Direction** — edges are unidirectional in storage; traversed bidirectionally for symmetric rels like `contradicts`

---

### 8. Frontend Node Representation

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts`

**NodeDto** (lines 11-15):
```typescript
export interface NodeDto {
  path: string;
  title: string;
  note_type: string;
}
```

**GraphTopology** (lines 24-27):
```typescript
export interface GraphTopology {
  nodes: NodeDto[];
  edges: EdgeDto[];
}
```

**Stored in GraphStore** (`graphStore.ts`, lines 6-12):
```typescript
interface GraphState {
  nodes: Map<string, NodeDto>;  // keyed by path
  edges: EdgeDto[];
  workspaceFiles: string[];
  selectedNodePath: string | null;
  expandedNodes: Set<string>;
  isLoading: boolean;
}
```

The frontend uses:
- **Map keyed by path** for O(1) lookups
- **Minimum data** (path, title, note_type) for graph rendering
- **No folder nodes** — only note nodes are rendered in the graph

---

### 9. DTO Layer (Serialization for Frontend)

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs`

**Key DTOs**:

**NodeDto** (lines 94-108):
```rust
pub struct NodeDto {
    pub path: String,
    pub title: String,
    pub note_type: String,
}

impl From<&NodeData> for NodeDto {
    fn from(nd: &NodeData) -> Self {
        Self {
            path: nd.path.as_str().to_string(),
            title: nd.title.clone(),
            note_type: nd.note_type.clone(),
        }
    }
}
```

**NoteDetailDto** (lines 134-189): Full note with body, frontmatter, and resolved links

**NodeSummaryDto** (lines 192-216): Lightweight summary for hover tooltips

**Implicit/Explicit Edge Distinction** (lines 124-129):
```rust
kind: match e.kind {
    EdgeKind::Explicit => "Explicit".to_string(),
    EdgeKind::Implicit => "Implicit".to_string(),
    EdgeKind::Inline => "Inline".to_string(),
}
```

**YAML ↔ JSON Conversion** (lines 281-352): Helpers to cross the IPC boundary between Rust (YAML) and TypeScript (JSON)

---

### 10. Summary of Node Identity and Graph Construction

| Aspect | Details |
|--------|---------|
| **Node Identity** | RelativePath (workspace-relative `.md` file path) + optional UUID in frontmatter |
| **Node Data** | NodeData { title, note_type, tags, path } |
| **Folder Representation** | No virtual/folder nodes; implicit edges via directory hierarchy |
| **Note Type** | String (not enum); 10 defaults + auto-register custom types |
| **Edge Origins** | Explicit (frontmatter), Implicit (directory), Inline (markdown links) |
| **Edge Types** | 15 types (contains, causes, supports, etc.) + custom auto-register |
| **Graph Storage** | HashMap<RelativePath, NodeData> + dual edge lists (outgoing/incoming) |
| **Frontend Sync** | NodeDto over IPC; graphStore uses Map<path, NodeDto> |

All nodes correspond to exactly one `.md` file on disk. There are no synthetic, virtual, or folder nodes in the graph model.

---

