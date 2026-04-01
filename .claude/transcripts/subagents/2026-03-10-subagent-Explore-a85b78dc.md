# 2026-03-10 — Subagent Transcript: Explore

**Date:** 2026-03-10 11:54:58
**Agent:** Explore
**Agent ID:** a85b78dc7713f32c7
**Parent Session:** e775a4b6-ec6a-4752-8126-0b07a473af0a

---

## User

Explore the BrainMap codebase at /Users/bsmonteiro/Desktop/Personal/brainmap/ to understand:

1. What Tauri commands exist for getting neighbors/related nodes for a specific node (look in crates/app/src-tauri/src/commands.rs and handlers.rs)
2. The core library's `neighbors` or `node_neighbors` functionality (look in crates/core/src/graph.rs and workspace.rs)
3. What the `neighbors` CLI command returns - its data structure
4. How "related notes" in the InspectorPanel footer is currently implemented (what API call it makes)
5. Whether there's already a way to get subgraph for a node (direct neighbors + their edges)

Return file paths and relevant code snippets for neighbor/related node fetching.

---

## Assistant

I'll explore the BrainMap codebase to understand the neighbor/related node functionality across all layers. Let me search systematically.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/src/*.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/core/src/*.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/cli/src/commands/*.rs"}`

---

## Assistant

Now let me read the key files to understand the neighbor/related node functionality.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs"}`

---

## Assistant

Now let me check the workspace.rs and the CLI neighbors command:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","limit":100}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"neighbors","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands","output_mode":"files_with_matches"}`

---

## Assistant

Now let me read the graph.rs CLI command and check the DTO layer:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/graph.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs","limit":150}`

---

## Assistant

Let me continue reading the DTO to find SubgraphDto:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs","offset":140}`

---

## Assistant

Now let me search for how the InspectorPanel uses the neighbors API:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -name \"*.tsx\" -o -name \"*.ts\" | head -20"}`

---

## Assistant

Let me search for the source files in the app crate:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.ts"}`

---

## Assistant

Now let me read the RelatedNotesFooter and InspectorPanel to see how they use the API:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Inspector/InspectorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

Perfect! Now let me check if there's a `graph` CLI command that wraps the neighbors functionality:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"neighbors|graph","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/main.rs","output_mode":"content"}`

---

## Assistant

Let me also check the subgraph CLI command and look for any MCP neighbor tools:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/subgraph.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/mcp/src/tools/*.rs"}`

---

## Assistant

Let me check the graph tool in MCP:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/tools/graph.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":100,"limit":150}`

---

## Assistant

Now let me look for the `get_subgraph` method in workspace.rs:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"get_subgraph|list_links","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","output_mode":"content","context":5}`

---

## Assistant

Let me read the implementation of get_subgraph and list_links:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":500,"limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":936,"limit":30}`

---

## Assistant

Perfect! Now let me check the Tauri bridge to see how API calls are made:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts"}`

---

## Assistant

Let me check the Tauri bridge implementation:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts"}`

---

## Assistant

Excellent! Now let me create a comprehensive summary document with all the findings:

## Summary: BrainMap Neighbor/Related Node Fetching Implementation

Based on my thorough exploration of the BrainMap codebase, here's a complete picture of how neighbor/related node functionality is implemented across all layers:

### 1. **Core Library (`crates/core/src/`)**

**Graph Module** (`crates/core/src/graph.rs`):
- **`Graph::neighbors()` method** (lines 91-150): Core function that traverses the graph using BFS to find neighbors within a specified depth
  - Parameters: `path`, `depth`, `direction` (Incoming/Outgoing/Both), `rel_filter` (optional relationship type filter)
  - Returns: `Subgraph` struct containing `nodes` (Vec<NodeData>) and `edges` (Vec<Edge>)
  - Handles cycles and deduplicates edges
  - Respects `MAX_DEPTH` constant (10)
  
- **`Graph::subgraph()` method** (lines 189-196): Convenience wrapper that calls `neighbors()` with `Direction::Both`

**Workspace Module** (`crates/core/src/workspace.rs`):
- **`Workspace::get_subgraph()` method** (lines 936-951): Public API method
  - Validates node exists before querying
  - Delegates to `graph.subgraph()`
  - Takes center path, depth, and optional relationship filter
  
- **`Workspace::list_links()` method** (lines 500-516): Fetches direct edges for a node
  - Parameters: `rel_path`, `direction`, `rel_filter`
  - Returns: `Vec<&Edge>` filtered by direction and optional relationship type
  - Uses `Graph::edges_for()`

### 2. **CLI Layer (`crates/cli/src/commands/`)**

Two command implementations:

**Graph Command** (`crates/cli/src/commands/graph.rs`):
- Command: `brainmap graph <path> [--depth] [--direction] [--relationship]`
- Uses `ws.graph.neighbors()` directly
- Outputs: JSON, YAML, or text format with node count, edge count, nodes list, and edges list
- Supports relationship filtering and directional traversal

**Subgraph Command** (`crates/cli/src/commands/subgraph.rs`):
- Command: `brainmap subgraph <center> [--depth] [--rel-filter]`
- Uses `ws.get_subgraph()` wrapper
- Same output formats as graph command
- Always bidirectional (calls with `Direction::Both`)

### 3. **Desktop App (Tauri) Layer (`crates/app/src-tauri/src/`)**

**Tauri Command** (`crates/app/src-tauri/src/commands.rs`, lines 95-100):
```rust
#[tauri::command]
pub fn get_neighbors(
    state: State<'_, AppState>,
    params: NeighborsParams,
) -> Result<SubgraphDto, String>
```

**Handler** (`crates/app/src-tauri/src/handlers.rs`, lines 143-165):
```rust
pub fn handle_get_neighbors(
    ws: &Workspace,
    params: NeighborsParams,
) -> Result<SubgraphDto, String>
```
- Parses direction parameter ("Incoming", "Outgoing", default Both)
- Parses optional relationship filter
- Calls `ws.graph.neighbors()` with all parameters
- Converts core `Subgraph` to `SubgraphDto` for serialization

**DTO Definitions** (`crates/app/src-tauri/src/dto.rs`):
- **`NeighborsParams`** (lines 48-53): Request structure
  - `path: String`
  - `depth: usize`
  - `direction: Option<String>` ("Incoming"/"Outgoing"/default Both)
  - `rel_filter: Option<String>` (single relationship type)
  
- **`SubgraphDto`** (lines 228-231): Response structure
  ```rust
  pub struct SubgraphDto {
      pub nodes: Vec<NodeDto>,
      pub edges: Vec<EdgeDto>,
  }
  ```

### 4. **React Frontend (`crates/app/src/`)**

**TypeScript API Types** (`crates/app/src/api/types.ts`):
- **`Subgraph` interface** (lines 73-76):
  ```typescript
  export interface Subgraph {
    nodes: NodeDto[];
    edges: EdgeDto[];
  }
  ```

- **`BrainMapAPI.getNeighbors()` method signature** (line 129):
  ```typescript
  getNeighbors(path: string, depth: number, direction?: string, relFilter?: string): Promise<Subgraph>;
  ```

**Tauri Bridge** (`crates/app/src/api/tauri.ts`, lines 84-88):
```typescript
async getNeighbors(path: string, depth: number, direction?: string, relFilter?: string): Promise<Subgraph> {
  return invoke<Subgraph>("get_neighbors", {
    params: { path, depth, direction, rel_filter: relFilter },
  });
}
```

**Related Notes Footer** (`crates/app/src/components/Editor/RelatedNotesFooter.tsx`):
- **Current Implementation**: Does NOT use `getNeighbors()` API
- Instead, uses local in-memory data from `graphStore`:
  - `edges` from global graph store
  - Derives outgoing links from `activeNote.links`
  - Derives incoming links by filtering `edges` where `target === activeNote.path`
- Displays first 10 related notes with "Show more..." button

**Inspector Panel** (`crates/app/src/components/Inspector/InspectorPanel.tsx`):
- **Current Implementation**: Also uses local in-memory data
- Filters `edges` from graph store:
  - Outgoing: `edges.filter(e => e.source === selectedNodePath)`
  - Incoming: `edges.filter(e => e.target === selectedNodePath)`
- Displays relationship type and clickable node titles
- No API call is made; all data comes from already-loaded graph topology

### 5. **MCP Server Layer (`crates/mcp/src/tools/graph.rs`)**

**Three MCP Tools**:

1. **`neighbors` tool** (lines 10-32):
   - Parameters: `path`, `depth` (default 1), `direction` ("in"/"out"/default both), `rel` (optional)
   - Returns: JSON serialized `Subgraph`
   - Calls: `ws.graph.neighbors()`

2. **`find_path` tool** (lines 34-80):
   - Finds shortest path between two nodes
   - Returns: Hops array with edge details

3. **`subgraph_tool`** (lines 82-98):
   - Parameters: `path`, `depth` (default 2), `rel` (optional)
   - Returns: JSON serialized `Subgraph`
   - Calls: `ws.get_subgraph()`

### 6. **Key Data Structures**

**Core Models** (`crates/core/src/model.rs`):
- **`Subgraph`**: Contains `nodes: Vec<NodeData>` and `edges: Vec<Edge>`
- **`NodeData`**: `title`, `note_type`, `tags`, `path` (RelativePath)
- **`Edge`**: `source`, `target`, `rel` (relationship type), `kind` (Explicit/Implicit/Inline)
- **`Direction` enum**: Incoming, Outgoing, Both

---

### File Paths Summary

**Core Library Paths:**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs` — Graph data structure and BFS neighbor traversal
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs` — Workspace orchestration and `get_subgraph()` method

**CLI Paths:**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/graph.rs` — Graph command implementation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/subgraph.rs` — Subgraph command implementation

**Tauri App Paths:**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs` — `get_neighbors` Tauri command
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs` — `handle_get_neighbors` handler
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs` — NeighborsParams and SubgraphDto

**Frontend Paths:**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts` — TypeScript Subgraph interface and BrainMapAPI contract
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts` — TauriBridge `getNeighbors()` implementation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx` — Related notes display (in-memory, no API call)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Inspector/InspectorPanel.tsx` — Inspector panel with incoming/outgoing links (in-memory, no API call)

**MCP Server Paths:**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/tools/graph.rs` — MCP neighbors, find_path, and subgraph tools

---

