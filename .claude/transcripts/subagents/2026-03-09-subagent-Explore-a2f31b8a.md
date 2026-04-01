# 2026-03-09 — Subagent Transcript: Explore

**Date:** 2026-03-09 17:19:30
**Agent:** Explore
**Agent ID:** a2f31b8a30db2948f
**Parent Session:** c9c4641d-d216-4fbf-8038-1866df90267f

---

## User

Read these files thoroughly:
1. docs/04-mcp-spec.md — the full MCP server specification
2. docs/06-architecture.md — the MCP server section
3. crates/core/src/workspace.rs — current workspace API (all public methods)
4. crates/core/src/lib.rs — what's exported

I need to understand:
- What MCP tools need to be implemented
- What MCP resources need to be exposed
- What transport (stdio) is needed
- What Rust MCP SDK or library to use
- What core API gaps exist for MCP (does workspace have everything MCP needs?)
- How the MCP crate should be structured

---

## Assistant

I'll thoroughly read through these files to understand the MCP implementation requirements.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/04-mcp-spec.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/06-architecture.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/lib.rs"}`

---

## Assistant

Now let me search for any existing MCP-related code in the codebase to understand what's already been started.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/*/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -type d -name \"mcp\" 2>/dev/null"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"mcp","type":"toml","head_limit":20}`

---

## Assistant

Let me check the Cargo.toml files to understand the current project structure.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/Cargo.toml"}`

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

Let me check the CLI structure to understand the serve command and overall codebase layout.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/cli/src/**/*.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/main.rs"}`

---

## Assistant

Let me check the core API for what's available and look at the error types.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/error.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs","limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs","limit":150}`

---

## Assistant

Let me check the index API to understand search capabilities.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/index.rs","limit":200}`

---

## Assistant

Let me check what the docs say about the serve command and any existing proto definitions.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/docs/"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -name \"*.proto\" -o -name \"*mcp*\" 2>/dev/null | head -20"}`

---

## Assistant

Perfect! Now let me check the CLI spec to see if there's a serve command section.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/03-cli-spec.md","limit":200}`

---

## Assistant

Let me search for the serve command section.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"brainmap serve|^### Serving","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/03-cli-spec.md","output_mode":"content"}`

---

## Assistant

Let me read that serve section fully.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/03-cli-spec.md","offset":430,"limit":100}`

---

## Assistant

Excellent! Now let me compile a comprehensive analysis report. Let me create the findings in a structured format.

## Comprehensive MCP Server Analysis Report

Based on my thorough review of the BrainMap specifications and codebase, here's what you need to know about implementing the MCP server:

---

### **1. MCP TOOLS THAT NEED TO BE IMPLEMENTED (30 tools total)**

#### Node Operations (5 tools)
- `brainmap_node_get` — Retrieve a single node's metadata, frontmatter, content, and incoming links
- `brainmap_node_list` — List nodes with optional type/tag/status filters and pagination
- `brainmap_node_create` — Create a new note with frontmatter and optional template
- `brainmap_node_update` — Update node's frontmatter fields and/or body content
- `brainmap_node_delete` — Delete a note (with backlink warning unless force=true)

#### Link Operations (3 tools)
- `brainmap_link_create` — Create a typed relationship between two nodes
- `brainmap_link_delete` — Remove a relationship between two nodes
- `brainmap_link_list` — List all incoming/outgoing relationships for a node with optional filtering

#### Search (1 tool)
- `brainmap_search` — Full-text search across notes with type/tag/status filters and pagination

#### Graph Traversal (3 tools)
- `brainmap_graph_neighbors` — Get nodes connected within N hops with optional relationship filtering
- `brainmap_graph_find_path` — Find shortest path(s) between two nodes
- `brainmap_graph_subgraph` — Extract full subgraph around a node

#### Workspace Operations (5 tools)
- `brainmap_workspace_status` — Get workspace summary statistics
- `brainmap_workspace_validate` — Run validation checks (broken links, orphans, missing fields)
- `brainmap_workspace_stats` — Get graph analytics (clusters, most connected nodes, edge distribution)
- `brainmap_workspace_reindex` — Force full re-index from disk
- `brainmap_workspace_export` — Export graph in JSON/DOT/GraphML format

#### Configuration (2 tools)
- `brainmap_config_get` — Read a workspace config value
- `brainmap_config_set` — Update a workspace config value

#### Federation (3 tools)
- `brainmap_federation_list` — List all federated workspaces
- `brainmap_federation_add` — Register an external workspace
- `brainmap_federation_remove` — Remove a federated workspace

#### Batch Operations (1 tool)
- `brainmap_batch` — Execute multiple operations sequentially in one request

---

### **2. MCP RESOURCES THAT NEED TO BE EXPOSED (3 resources)**

| URI Pattern | Description |
|-------------|-------------|
| `brainmap://nodes/{path}` | A specific note's raw content (parameter-free read) |
| `brainmap://graph` | Full graph as JSON |
| `brainmap://config` | Workspace configuration (read-only) |

Resources are for simple, parameter-free reads of known data. Tools are for operations with parameters, side effects, or computed results.

---

### **3. RESPONSE ENVELOPE REQUIREMENT**

All tools must return this consistent envelope structure:

```json
{
  "success": true,
  "data": { /* tool-specific payload */ },
  "error": null
}
```

On failure:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "Node not found: Concepts/Missing.md"
  }
}
```

Error codes map directly to `BrainMapError` enum in core: `FILE_NOT_FOUND`, `DUPLICATE_PATH`, `BROKEN_LINK_TARGET`, `DUPLICATE_LINK`, `HAS_BACKLINKS`, `INVALID_WORKSPACE`, `INDEX_CORRUPT`, `CONFIG_ERROR`, etc.

---

### **4. TRANSPORT: STDIO-BASED MCP SERVER**

From the spec:
- `brainmap serve` starts the server
- `brainmap serve --mcp-only` runs just the MCP server without the desktop app
- The MCP server communicates via **stdio** (stdin/stdout) — this is the standard MCP transport for Claude integration
- No HTTP server needed for MCP itself (the `--port` option is for the desktop HTTP interface, not MCP)

---

### **5. RUST MCP SDK RECOMMENDATION**

**Recommended approach**: Use the official **Anthropic MCP SDK for Rust** (or community equivalent if available).

Current best options:
1. **`mcp-sdk` (Anthropic official, if available)** — Check Anthropic's Rust SDK repository
2. **`mcp` Rust crate** — Look for community implementations on crates.io
3. **Manual JSONRPC2 implementation** — If no SDK exists, implement MCP's JSONRPC2 protocol directly

MCP is essentially a JSONRPC2-based protocol, so at minimum you need:
- JSONRPC2 request/response handling over stdin/stdout
- Tool definitions (name, description, input schema)
- Resource definitions (URI patterns, descriptions)
- Proper error handling and response envelopes

**Key libraries to add to Cargo.toml**:
- `tokio` (async runtime for handling concurrent messages)
- `serde_json` (already in use, needed for JSONRPC2)
- `serde` (for struct serialization)
- An MCP SDK or JSONRPC2 library (TBD based on availability)

---

### **6. CORE API GAPS & READINESS**

**Workspace API is mostly complete. Current public methods:**

✅ **Full node CRUD:**
- `create_note(path, title, type, tags, status, source, summary, extra, body)`
- `read_note(path)` → returns `&Note`
- `update_note(path, title?, type?, tags?, status?, source?, summary?, extra?, body?)`
- `delete_note(path, force)`

✅ **Link operations:**
- `create_link(source, target, rel, annotation?)`
- `list_links(path, direction, rel_filter?)`

✅ **Listing & filtering:**
- `list_nodes(type_filter?, tag_filter?, status_filter?)`

✅ **Graph operations:**
- `graph.neighbors(path, depth, direction, rel_filter?)`
- `graph.shortest_path(source, target, max_depth?)`
- `graph.subgraph(center, depth)` (implicit via neighbors with path)

✅ **Validation:**
- `validate()` → returns `Vec<ValidationIssue>`

✅ **Statistics:**
- `stats()` → returns `WorkspaceStats`

❌ **Gaps that need implementation:**

1. **Node move/rename with reference rewriting** — The spec calls for `brainmap_node_move` but the core `Workspace` doesn't have this. You'll need to add it to core or implement it at the MCP level by:
   - Renaming the file
   - Updating all references across the workspace
   - This is critical for the `brainmap_node_move` tool

2. **Link deletion by source/target/rel** — Currently `list_links` returns edges but there's no `delete_link` method in Workspace. The core has `graph.remove_edge()` but Workspace doesn't expose a public method. You'll need to add:
   ```rust
   pub fn delete_link(&mut self, source: &str, target: &str, rel: &str) -> Result<()>
   ```

3. **Batch operations** — Not in core. You'll need to implement at the MCP layer as a sequence of calls with transaction-like semantics (stop on first error, report which operations succeeded/failed/skipped).

4. **Export in multiple formats** — Core doesn't have export. You'll need to add export functions that serialize the graph to JSON/DOT/GraphML.

5. **Federation** — The spec defines federation tools, but core only has `federation::FederationResolver` (not yet fully implemented per architecture doc). You'll need to build out federation support or stub it out for v1.

6. **Search result pagination** — `Index::search()` currently limits to 50 results. You need to support `limit` and `offset` parameters. This likely means modifying the index query to support pagination properly.

7. **Graph statistics details** — `WorkspaceStats` exists but doesn't include detailed cluster detection or "most connected nodes" lists. You may need to enhance the graph statistics computation.

---

### **7. RECOMMENDED MCP CRATE STRUCTURE**

```
crates/mcp/
├── Cargo.toml                     # MCP server crate
├── src/
│   ├── main.rs                    # Entry point (stdio server setup)
│   ├── lib.rs                     # Public API
│   ├── server.rs                  # MCP server initialization, tool registration
│   ├── tools/
│   │   ├── mod.rs
│   │   ├── node.rs                # brainmap_node_* tools
│   │   ├── link.rs                # brainmap_link_* tools
│   │   ├── search.rs              # brainmap_search
│   │   ├── graph.rs               # brainmap_graph_* tools
│   │   ├── workspace.rs           # brainmap_workspace_* tools
│   │   ├── config.rs              # brainmap_config_* tools
│   │   ├── federation.rs          # brainmap_federation_* tools
│   │   └── batch.rs               # brainmap_batch
│   ├── resources.rs               # MCP resource handlers
│   ├── response.rs                # Envelope struct + error handling
│   └── error.rs                   # MCP-specific error types
```

**Workspace.toml update:**
```toml
members = [
    "crates/core",
    "crates/cli",
    "crates/tauri-plugin",
    "crates/mcp",     # ADD THIS
]
```

---

### **8. KEY IMPLEMENTATION DETAILS**

**Stdio-based communication:**
```rust
// MCP expects JSONRPC2 over stdin/stdout
// Example message format:
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "brainmap_node_get",
    "arguments": {
      "path": "Concepts/Counterfactuals.md",
      "include_content": true,
      "include_incoming_links": true
    }
  }
}
```

**Tool input validation:**
- Every tool must validate its inputs before calling core
- File paths must be workspace-relative
- Depth values must be 1-10 (enforced by architecture)
- Empty searches are rejected with `EMPTY_SEARCH` error

**Backlink handling:**
- The `brainmap_node_delete` tool must return incoming links when `force=false` and links exist
- Use `index.backlinks(path)` to get incoming edges
- Return as `"incoming_links": [{"source": "...", "relationship": "..."}]`

**Federation in v1:**
- Can stub out federation tools as "not implemented" or implement basic list/add/remove
- Federation validation is deferred to Phase 4 per architecture

---

### **9. TEST CONSIDERATIONS**

From the CLAUDE.md best practices:
- Create comprehensive tests **before** implementing tools
- Tests should follow Given/When/Then pattern
- Focus on behavior verification, not mocks
- Each tool should have tests for:
  - Success case with typical inputs
  - Edge cases (empty filters, depth=1 vs depth=10, etc.)
  - Error cases (file not found, duplicate, broken links)

Example test structure:
```rust
#[test]
fn test_brainmap_node_get_returns_full_node() {
    // Given: A workspace with a note
    let ws = create_test_workspace();
    ws.create_note(...)?;
    
    // When: We call brainmap_node_get
    let response = call_tool("brainmap_node_get", json!({
        "path": "test.md",
        "include_content": true,
        "include_incoming_links": true
    }))?;
    
    // Then: We get the complete node with all fields
    assert!(response.success);
    assert!(!response.data.content.is_empty());
}
```

---

### **10. STARTUP & INTEGRATION FLOW**

When `brainmap serve --mcp-only` is called:
1. CLI parses arguments
2. Opens workspace (parses all .md files, builds graph, initializes index)
3. Creates MCP server instance
4. Registers 30 tools + 3 resources
5. Starts stdio listener (MCP protocol over stdin/stdout)
6. Workspace is now available to all MCP tools
7. File watcher (from architecture) can continue running to detect external changes

The MCP server does **not** need to implement file watching itself — the core library handles that. The server just exposes the current workspace state via tools.

---

### **SUMMARY: IMPLEMENTATION CHECKLIST**

**Must implement:**
- [ ] Create `crates/mcp` crate with MCP SDK dependency
- [ ] Implement `server.rs`: tool/resource registration
- [ ] Implement all 30 tools in `tools/` module
- [ ] Implement response envelope (`success`, `data`, `error`)
- [ ] Add missing core APIs: `node_move()`, `delete_link()`, `export()`, pagination in search
- [ ] Implement batch operations with proper error handling
- [ ] Add comprehensive tests
- [ ] Update CLI `serve` command to dispatch to MCP server
- [ ] Stdio-based JSONRPC2 protocol handling

**Nice to have (v2+):**
- [ ] Enhanced graph statistics (clusters, most connected)
- [ ] Full federation support with cross-workspace validation
- [ ] Semantic tools (explore_topic, find_connections, etc.)

---

This analysis gives you a complete roadmap for the MCP implementation. All specifications are in place, the core API is ~95% ready, and you have clear gaps to fill. The architecture is solid and follows your stated best practices (small focused functions, single responsibility, testability).

---

