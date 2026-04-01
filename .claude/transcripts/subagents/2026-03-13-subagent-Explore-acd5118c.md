# 2026-03-13 — Subagent Transcript: Explore

**Date:** 2026-03-13 11:27:13
**Agent:** Explore
**Agent ID:** acd5118ca6991dd34
**Parent Session:** e2adebf4-0599-4c1c-95a6-fa3b9af7f854

---

## User

Research the BrainMap project's linking system thoroughly. I need to understand:

1. How links between notes are defined in frontmatter YAML (the `links` field format)
2. How links are parsed and stored in the graph (look at parser.rs, graph.rs, types.rs)
3. How edges are created — both explicit (from frontmatter) and implicit (contains/part-of from directory hierarchy)
4. How backlinks work (resolved via search index)
5. The full Edge/EdgeType data model
6. How the LinksEditor UI component works (frontend link creation/deletion)
7. How createLink/deleteLink APIs work (Tauri commands)
8. The graph diff / incremental update system for link changes

Focus on: crates/core/src/ (parser.rs, graph.rs, types.rs, workspace.rs), crates/app/src-tauri/src/ (commands.rs, handlers.rs), and crates/app/src/components/ for link-related UI.

Output detailed findings with file paths and line numbers.

---

## Assistant

I'll conduct a thorough research of the BrainMap linking system. Let me start by exploring the relevant files in parallel.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/core/src/**/*.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/src/**/*.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/*.tsx"}`

---

## Assistant

Now let me read the core type definitions first:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/parser.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs"}`

---

## Assistant

Excellent. Now let me read the workspace file to understand how edges are managed:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","limit":300}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","limit":200}`

---

## Assistant

Let me continue reading the workspace file and handlers to understand link management:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","limit":400,"offset":300}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","limit":300,"offset":200}`

---

## Assistant

Now let me check the frontend LinksEditor component:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/LinksEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","limit":150}`

---

## Assistant

Let me check the DTO structures and incremental graph diff handling:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs","limit":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","limit":200,"offset":690}`

---

## Assistant

Perfect. Let me search for any additional information about edge types and the complete workspace linking flow:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"const.*EDGE_TYPES|static.*EDGE_TYPE|edge_type|rel_type","path":"/Users/bsmonteiro/Desktop/Personal/brainmap","type":"rs","head_limit":30}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs"}`

---

## Assistant

Let me check the config and docs files:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"docs/*.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/config.rs","limit":150}`

---

## Assistant

Now let me check the data model documentation:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/02-data-model.md","limit":250}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"compute_relative_target","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src","type":"rs"}`

---

## Assistant

Let me search for the compute_relative_target function:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","limit":100,"offset":900}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","limit":50,"offset":1000}`

---

## Assistant

Perfect. Let me check how the graph store works on the frontend:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*.ts\" -o -name \"*.tsx\" | grep -E \"(graphStore|store)\" | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts","limit":200}`

---

## Assistant

Excellent! Now let me check the API types to see the WorkspaceEvent structure:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"types.ts\" -o -name \"*.d.ts\" | head -5"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts","limit":250}`

---

## Assistant

Perfect! Now let me create a comprehensive summary document. Based on my research, I have thoroughly explored the BrainMap linking system. Let me compile all the findings:

## COMPREHENSIVE RESEARCH: BrainMap Linking System

I've thoroughly researched the BrainMap project's linking system across the entire codebase. Here are the detailed findings:

### 1. Link Definition in Frontmatter YAML

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs` (lines 116-122)

Links are defined in the `links` field of frontmatter as a list of `TypedLink` objects:

```yaml
links:
  - target: "Concepts/SCM.md"
    rel: "related-to"
    annotation: "optional description"
```

**Structure** (`TypedLink` struct):
- `target: String` — workspace-relative path or UUID to the target note
- `rel: String` — relationship type (edge type)
- `annotation: Option<String>` — optional description

### 2. Link Parsing and Storage

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/parser.rs` (lines 9-28, 133-157)

**Parsing flow**:
1. `parse_note()` calls `split_frontmatter()` to extract YAML
2. YAML deserialized into `Frontmatter` struct via `serde_yaml`
3. `Frontmatter.links` field contains the typed links list
4. Additionally, `extract_inline_links()` (lines 81-96) extracts markdown links: `[label](path.md)`

**Inline link parsing** (lines 81-96):
- Uses regex pattern: `\[([^\]]*)\]\(([^)]+\.md)\)`
- Resolves relative paths using `note_path.resolve_relative()`
- Stores as `InlineLink` with target, optional label, and position

### 3. Edge Creation: Explicit vs. Implicit

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs` (lines 147-176, 289-320)

**Explicit edges** (lines 149-175):
1. Created during `load_from_root()` from frontmatter `links` field
2. Each `TypedLink` becomes an `Edge` with `kind: EdgeKind::Explicit`
3. Target path resolved relative to source: `note.path.resolve_relative(&link.target)`

**Implicit edges** (lines 194, 289-320):
- Generated by `compute_implicit_edges()` from directory hierarchy
- Only for `contains` relationship type (parent to child)
- Rules (lines 301-320):
  - Finds nearest ancestor node in directory tree
  - Skips if explicit `contains` edge already exists
  - Applies to all notes in subdirectories

**Inline edges** (lines 168-175):
- Created from `note.inline_links` (extracted by parser)
- All have `rel: "mentioned-in"` and `kind: EdgeKind::Inline`

### 4. The Graph Data Model

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs` (lines 162-174)

**Edge struct**:
```rust
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct Edge {
    pub source: RelativePath,
    pub target: RelativePath,
    pub rel: String,
    pub kind: EdgeKind,
}

pub enum EdgeKind {
    Explicit,
    Implicit,
    Inline,
}
```

**Graph storage** (`crates/core/src/graph.rs` lines 10-14):
```rust
pub struct Graph {
    nodes: HashMap<RelativePath, NodeData>,
    outgoing: HashMap<RelativePath, Vec<Edge>>,  // source -> [edges]
    incoming: HashMap<RelativePath, Vec<Edge>>,  // target -> [edges]
}
```

Edges stored in both directions for efficient query.

### 5. Backlink Resolution

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/index.rs` (implied via handlers)
**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs` (lines 147-162)

Backlinks are resolved via the search index (`self.index.backlinks()`):
- Returns tuples of `(source_path, rel_type)` pointing to the target
- Uses SQLite FTS5 index for efficient lookup
- Called when checking if deletion is safe (line 150)

### 6. Full Edge/EdgeType Data Model

**Edge types** (config.rs lines 102-123):
Default 15 edge types registered on workspace init:
- **Hierarchical**: `contains`, `part-of`
- **Causal**: `causes`, `supports`, `contradicts`, `extends`, `depends-on`, `exemplifies`
- **Temporal**: `precedes`, `leads-to`, `evolved-from`
- **Associative**: `related-to`, `authored-by`, `sourced-from`
- **System**: `mentioned-in` (inline only)

**Unidirectional storage**: All edges stored only in source note's frontmatter

### 7. Link Management APIs

**Create link** (`workspace.rs` lines 470-532):
1. Validates both source and target notes exist
2. Checks for duplicate (same rel type to same target)
3. Computes relative target path: `compute_relative_target()` (lines 1005-1032)
4. Appends `TypedLink` to source note's `frontmatter.links`
5. Serializes and writes file
6. Adds edge to graph and index

**Delete link** (`workspace.rs` lines 586-622):
1. Finds link by matching resolved target and rel type
2. Removes from `frontmatter.links` array
3. Serializes and writes file
4. Removes edge from graph and index

**Path resolution** (`model.rs` lines 54-60):
```rust
pub fn resolve_relative(&self, target: &str) -> RelativePath {
    let base_dir = Path::new(&self.0)
        .parent()
        .unwrap_or(Path::new(""));
    let resolved = base_dir.join(target);
    RelativePath::new(&resolved.to_string_lossy())
}
```

### 8. Frontend LinksEditor Component

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/LinksEditor.tsx`

**Features**:
- Datalist autocomplete from all nodes (excluding self)
- Dropdown selector for 12 user-selectable link types (lines 10-23)
- Duplicate detection before add (lines 57-63)
- "Create & Link" button for non-existent targets (lines 66-77)
- Remove button for each existing link (lines 79-101)

**API calls**:
- `api.createLink(notePath, resolvedTarget, newRel)` (line 109)
- `api.deleteLink(notePath, target, rel)` (line 84)
- Graph sync via `graphStore.applyEvent()` (lines 85-93, 110-118)

**User-selectable types** (excludes auto-generated):
- excludes: `contains`, `part-of`, `mentioned-in`
- includes: `causes`, `supports`, `contradicts`, `extends`, `depends-on`, `exemplifies`, `precedes`, `leads-to`, `evolved-from`, `related-to`, `authored-by`, `sourced-from`

### 9. Tauri Commands (createLink / deleteLink)

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs` (lines 109-130)

```rust
#[tauri::command]
pub fn create_link(
    state: State<'_, AppState>,
    params: LinkParams,  // source, target, rel, annotation
) -> Result<(), String> {
    let abs_path = state.with_workspace(|ws| Ok(ws.root.join(&params.source)))?;
    state.register_expected_write(abs_path);  // Tell watcher to ignore this write
    state.with_workspace_mut(|ws| handlers::handle_create_link(ws, params))
}

#[tauri::command]
pub fn delete_link(
    state: State<'_, AppState>,
    source: String,
    target: String,
    rel: String,
) -> Result<(), String> {
    let abs_path = state.with_workspace(|ws| Ok(ws.root.join(&source)))?;
    state.register_expected_write(abs_path);
    state.with_workspace_mut(|ws| handlers::handle_delete_link(ws, &source, &target, &rel))
}
```

**Handlers** (handlers.rs lines 278-308):
- Delegate to `Workspace::create_link()` / `Workspace::delete_link()`
- Return Result<(), String> for error handling

### 10. Graph Diff and Incremental Updates

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs` (lines 191-197)

```rust
pub struct GraphDiff {
    pub added_nodes: Vec<NodeData>,
    pub removed_nodes: Vec<RelativePath>,
    pub added_edges: Vec<Edge>,
    pub removed_edges: Vec<Edge>,
}
```

**Incremental operations** (workspace.rs lines 624-793):

1. **`reload_file()`** (lines 625-702):
   - Parses changed file
   - Removes old explicit/inline edges (preserves implicit)
   - Builds new edges from updated links and inline links
   - Returns GraphDiff with added/removed edges

2. **`add_file()`** (lines 705-764):
   - Creates node and edges for new file
   - Returns GraphDiff with added node and edges

3. **`remove_file()`** (lines 767-793):
   - Collects all edges involving the node
   - Removes from graph and index
   - Returns GraphDiff with removed node and edges

**File watcher integration** (watcher notifies app of file changes → triggers reload_file → GraphDiff sent to frontend)

### 11. Frontend Graph State Sync

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts` (lines 107-173)

**WorkspaceEvent types** (types.ts lines 93-99):
```typescript
type WorkspaceEvent =
  | { type: "node-created"; path: string; node: NodeDto }
  | { type: "node-updated"; path: string; node: NodeDto }
  | { type: "node-deleted"; path: string }
  | { type: "edge-created"; edge: EdgeDto }
  | { type: "edge-deleted"; edge: EdgeDto }
  | { type: "topology-changed"; added_nodes; removed_nodes; added_edges; removed_edges }
```

**Event handling in graphStore**:
- `edge-created`: Appends to edges array (line 137)
- `edge-deleted`: Filters out matching edge (lines 140-150)
- `topology-changed`: Bulk update from file watcher (lines 152-170)

**Deduplication**: Edge key is `source|target|rel` (lines 70-79)

### 12. Relative Path Computation

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs` (lines 1005-1032)

```rust
fn compute_relative_target(source: &RelativePath, target: &RelativePath) -> String {
    // Finds common ancestor directory between source and target
    // Computes relative path with ../ for traversal
    // Example: source="A/B/C.md", target="A/D/E.md" → "../D/E.md"
}
```

Used when storing links to preserve workspace portability.

---

### Summary of Key Insights

1. **Dual link representation**: Frontmatter `links` (typed, explicit) + inline markdown links (implicit `mentioned-in`)
2. **Three edge kinds**: Explicit (user-defined), Implicit (from directory structure), Inline (from markdown)
3. **Path normalization**: Stored as relative paths, resolved at query time via `resolve_relative()`
4. **Single-direction storage**: Edges only stored in source; backlinks computed via index
5. **Graph consistency**: Maintained through workspace mutations with GraphDiff tracking
6. **Frontend sync**: WorkspaceEvent pattern keeps UI graph in sync with backend

All files and line numbers are documented above for reference.

---

