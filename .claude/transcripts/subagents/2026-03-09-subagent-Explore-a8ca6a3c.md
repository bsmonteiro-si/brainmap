# 2026-03-09 — Subagent Transcript: Explore

**Date:** 2026-03-09 16:58:45
**Agent:** Explore
**Agent ID:** a8ca6a3cba77a1e42
**Parent Session:** c9c4641d-d216-4fbf-8038-1866df90267f

---

## User

Thoroughly explore the core library in crates/core/src/ to understand:
1. The full public API surface - every public function, struct, enum, and method
2. The workspace.rs orchestration layer - what operations it exposes
3. The graph.rs capabilities - what queries are available
4. The index.rs search capabilities
5. The parser.rs - how notes are parsed and serialized
6. The model.rs - all data types
7. The error.rs - all error variants

Read every source file completely. I need to understand what's already built and what gaps exist for implementing CLI commands (node CRUD, search, link, neighbors).

---

## Assistant

I'll conduct a thorough exploration of the core library. Let me start by mapping the directory structure and then reading each file completely.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src -type f -name \"*.rs\" | head -20"}`

---

## Assistant

Now let me read all the source files to understand the complete public API and implementation:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/lib.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/error.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/parser.rs"}`

---

## Assistant

Now let me read the remaining core files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/index.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/config.rs"}`

---

## Assistant

Perfect! I now have a comprehensive understanding of the entire core library. Let me provide you with a detailed report of the public API surface and gaps.

## Complete Core Library Analysis

### 1. **Public API Surface (from lib.rs)**

The library exports these main modules:
- `config` - Workspace configuration management
- `error` - Error types
- `graph` - Graph data structure and traversal
- `index` - Full-text search and metadata indexing
- `model` - Core data types
- `parser` - Note parsing/serialization
- `workspace` - Orchestration layer

---

### 2. **Data Models (model.rs)**

**Value Types:**
- `NoteId(Uuid)` - Unique identifier for notes
- `RelativePath(String)` - Normalized path strings with utilities (parent, join, resolve_relative)
- `Status` enum - Draft, Review, Final, Archived
- `EdgeKind` enum - Explicit, Implicit, Inline

**Note Structures:**
```
Frontmatter
├── id: NoteId
├── title: String
├── note_type: String
├── tags: Vec<String>
├── status: Option<Status>
├── created: NaiveDate
├── modified: NaiveDate
├── source: Option<String>
├── summary: Option<String>
├── links: Vec<TypedLink> (explicit links from frontmatter)
└── extra: HashMap<String, serde_yaml::Value> (extensible)

Note
├── path: RelativePath
├── frontmatter: Frontmatter
├── body: String
└── inline_links: Vec<InlineLink> (extracted from markdown)

TypedLink (frontmatter links)
├── target: String
├── rel: String (relationship type)
└── annotation: Option<String>

InlineLink (markdown links)
├── target: String
├── label: Option<String>
└── position: usize

Edge
├── source: RelativePath
├── target: RelativePath
├── rel: String
└── kind: EdgeKind

NodeData
├── title: String
├── note_type: String
└── path: RelativePath

Direction enum - Outgoing, Incoming, Both
```

---

### 3. **Parser Module (parser.rs)**

**Public Functions:**
- `parse_note(content: &str, path: &RelativePath) -> Result<Note>` - Parses YAML frontmatter + body
- `serialize_note(note: &Note) -> Result<String>` - Converts Note back to file format
- `parse_file(workspace_root: &Path, file_path: &Path) -> Result<Note>` - Reads and parses from disk

**Capabilities:**
- Splits frontmatter from body on `---` delimiters
- Auto-generates UUIDs if id is nil
- Extracts inline markdown links `[label](path.md)` with position tracking
- Ignores non-.md inline links (e.g., images)
- Preserves extra YAML fields in HashMap

---

### 4. **Graph Module (graph.rs)**

**Public Methods:**

```rust
Graph {
    pub fn new() -> Self
    pub fn add_node(path: RelativePath, data: NodeData)
    pub fn remove_node(path: &RelativePath)
    pub fn add_edge(edge: Edge)
    pub fn remove_edge(source: &RelativePath, target: &RelativePath, rel: &str)
    pub fn get_node(path: &RelativePath) -> Option<&NodeData>
    pub fn all_nodes() -> impl Iterator<Item = (&RelativePath, &NodeData)>
    pub fn node_count() -> usize
    
    // Traversal
    pub fn neighbors(
        path: &RelativePath, 
        depth: usize, 
        direction: &Direction,
        rel_filter: Option<&[String]>
    ) -> Subgraph
    
    pub fn shortest_path(
        source: &RelativePath, 
        target: &RelativePath, 
        max_depth: Option<usize>
    ) -> Option<Vec<Edge>>
    
    pub fn subgraph(
        center: &RelativePath, 
        depth: usize,
        rel_filter: Option<&[String]>
    ) -> Subgraph
    
    pub fn orphan_nodes() -> Vec<RelativePath>
    pub fn stats() -> GraphStats
}

Subgraph {
    pub nodes: Vec<NodeData>
    pub edges: Vec<Edge>
}

GraphStats {
    pub node_count: usize
    pub edge_count: usize
    pub nodes_by_type: HashMap<String, usize>
    pub edges_by_type: HashMap<String, usize>
    pub edges_by_kind: HashMap<String, usize>
    pub orphan_count: usize
}
```

**Implicit Edge Computation:**
- `compute_implicit_edges()` - Creates "contains" edges based on file hierarchy
- Finds nearest ancestor note: looks for `Parent.md` or `parent/parent.md` index files

---

### 5. **Index Module (index.rs)**

**Public Methods:**

```rust
Index {
    pub fn open(db_path: &Path) -> Result<Self>
    pub fn open_in_memory() -> Result<Self>
    
    // Note management
    pub fn add_note(note: &Note, file_mtime: i64) -> Result<()>
    pub fn remove_note(path: &RelativePath) -> Result<()>
    pub fn update_note(note: &Note, file_mtime: i64) -> Result<()>
    
    // Edge management
    pub fn add_edges(edges: &[Edge]) -> Result<()>
    
    // Search
    pub fn search(query: &str, filters: &SearchFilters) -> Result<Vec<SearchResult>>
    
    // Graph queries
    pub fn backlinks(path: &RelativePath) -> Result<Vec<(String, String)>>
    pub fn is_stale(path: &RelativePath, current_mtime: i64) -> Result<bool>
    
    // Bulk operations
    pub fn rebuild(notes: &[(&Note, i64)], edges: &[Edge]) -> Result<()>
}

SearchResult {
    pub path: String
    pub title: String
    pub note_type: String
    pub snippet: String
    pub rank: f64
}

SearchFilters {
    pub note_type: Option<String>
    pub tag: Option<String>
    pub status: Option<String>
}
```

**Database Schema:**
- `notes_fts` - Virtual FTS5 table (path, title, type, tags, content, summary)
- `notes_meta` - Metadata (path, id, type, status, created, modified, file_mtime)
- `edges` - Relationship records (source, target, rel, implicit)

---

### 6. **Workspace Module (workspace.rs)**

**Public Methods:**

```rust
Workspace {
    pub fn init(path: &Path) -> Result<()>
    pub fn open(path: &Path) -> Result<Self>
    
    pub fn validate() -> Vec<ValidationIssue>
    pub fn stats() -> WorkspaceStats
    
    pub root: PathBuf
    pub config: WorkspaceConfig
    pub graph: Graph
    pub index: Index
    pub notes: HashMap<RelativePath, Note>
}

ValidationIssue {
    pub severity: Severity (Error | Warning)
    pub message: String
    pub path: Option<String>
}

WorkspaceStats {
    pub node_count: usize
    pub edge_count: usize
    pub nodes_by_type: HashMap<String, usize>
    pub edges_by_rel: HashMap<String, usize>
    pub edges_by_kind: HashMap<String, usize>
    pub orphan_count: usize
}
```

**Validation Checks:**
- Broken explicit links (target doesn't exist)
- Federation links (containing `::`\)
- Orphan nodes (no incoming/outgoing edges)
- Missing required title field

---

### 7. **Config Module (config.rs)**

**Public Structures:**

```rust
WorkspaceConfig {
    pub name: String
    pub version: u32 (currently 1)
    pub note_types: Vec<String>
    pub edge_types: Vec<String>
    pub federation: Vec<FederatedWorkspace> (reserved for future)
    
    pub fn new(name: &str) -> Self
    pub fn register_note_type(&mut self, note_type: &str) -> bool
    pub fn register_edge_type(&mut self, edge_type: &str) -> bool
}

FederatedWorkspace {
    pub name: String
    pub path: String
}
```

**Default Types:**
- Note types (10): concept, book-note, question, reference, index, argument, evidence, experiment, person, project
- Edge types (15): contains, part-of, causes, supports, contradicts, extends, depends-on, exemplifies, precedes, leads-to, evolved-from, related-to, authored-by, sourced-from, mentioned-in

**File Management:**
- `load_config(brainmap_dir: &Path) -> Result<WorkspaceConfig>`
- `save_config(config: &WorkspaceConfig, brainmap_dir: &Path) -> Result<()>`

---

### 8. **Error Module (error.rs)**

**Error Variants:**
```rust
BrainMapError
├── FileNotFound(String)
├── DuplicatePath(String)
├── InvalidYaml(String)
├── BrokenLinkTarget { from: String, to: String }
├── DuplicateLink { from: String, to: String, rel: String }
├── LinkNotFound { from: String, to: String }
├── InvalidWorkspace(String)
├── WorkspaceExists(String)
├── IndexCorrupt(String)
├── ConfigError(String)
└── [Transparent errors: std::io::Error, serde_yaml::Error, rusqlite::Error]

pub type Result<T> = std::result::Result<T, BrainMapError>
```

---

## **GAPS FOR CLI IMPLEMENTATION**

The library is well-structured for read operations. Here are the gaps for implementing node CRUD, search, link, and neighbor CLI commands:

### **Missing Write Operations:**

1. **Note Creation** - No `create_note()` in workspace
   - Need to: parse YAML input, generate NoteId, write to disk
   - Current: Parser can only read files

2. **Note Modification** - No `update_note()` in workspace
   - Need to: read, modify, serialize, write, update graph & index
   - Current: Only `Index::update_note()` exists (low-level)

3. **Note Deletion** - No `delete_note()` in workspace
   - Need to: validate no exclusive incoming links, remove from disk, graph, index
   - Current: Only `Graph::remove_node()`, `Index::remove_note()` exist

4. **Link Management** - No high-level link operations
   - Need: `add_link()`, `remove_link()`, `update_link()`
   - Current: Graph has low-level edge operations, but no link update coordination

5. **Graph Persistence** - No graph update persistence
   - Currently graph is in-memory only
   - Need: Write graph changes back to notes (link array in frontmatter)

### **Missing Query Operations:**

1. **Path Resolution** - No `find_note_by_title()` or fuzzy matching
   - Current: Full-text search exists but needs CLI wrapping
   - Need: Resolve user input (partial paths, titles) to exact RelativePath

2. **Relationship Queries** - No dedicated relation finder
   - Need: Find all notes of specific type, by tag, by status
   - Current: Index has basic filtering, but limited

3. **Cycle Detection** - No cycle detection
   - Need for data integrity

4. **Relationship Strength** - No bidirectional/transitive relationship querying
   - Current: Can find neighbors but not "strength" of connection

### **Transaction & Consistency:**

1. **Atomic Updates** - No transaction support
   - Multi-step operations (write note, update graph, update index) not atomic
   - Need: Rollback on partial failure

2. **Workspace Rebind** - After modifications, workspace needs refresh
   - Current: `Workspace::open()` rebuilds everything from disk
   - Need: Incremental update path

---

## **Summary: What's Ready for CLI**

✅ **Fully Implemented:**
- Note parsing (parse_note, serialize_note)
- Graph traversal (neighbors, shortest_path, subgraph)
- Full-text search with filters
- Backlink queries
- Workspace initialization & validation
- Statistics & orphan detection

❌ **Needs Implementation:**
- Node CRUD (create/update/delete)
- Link CRUD
- Path resolution (title→path mapping)
- Atomic multi-step operations
- Incremental workspace updates

**Files ready to use:**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/parser.rs`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/index.rs`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/config.rs`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/error.rs`

---

