# 2026-03-09 — Subagent Transcript: Explore

**Date:** 2026-03-09 17:37:53
**Agent:** Explore
**Agent ID:** a7a55a483614ae08c
**Parent Session:** ba732d96-401a-4b82-b69a-43c622866e5c

---

## User

Explore the BrainMap CLI crate to understand patterns that the desktop app should follow:
1. Read `crates/cli/src/main.rs`
2. Read all files in `crates/cli/src/commands/`
3. Read `crates/cli/src/output.rs`
4. Read `crates/cli/Cargo.toml`
5. Check `crates/cli/tests/` for test patterns

I want to understand how the CLI wraps core operations so the Tauri layer can follow similar patterns.

---

## Assistant

I'll explore the CLI crate to understand the patterns you want to follow in the desktop app. Let me start by reading the key files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/main.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/cli/src/commands/*.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/cli/tests/**/*.rs"}`

---

## Assistant

Now let me read the output.rs file and the command files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/output.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/mod.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/node.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/link.rs"}`

---

## Assistant

Now let me read a few more command files and the integration tests:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/search.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/graph.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/tests/cli_integration.rs"}`

---

## Assistant

Perfect! Now let me read a couple more command files to complete the picture:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/init.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/stats.rs"}`

---

## Assistant

Excellent! I have everything I need. Let me compile a comprehensive report on the CLI patterns for the desktop app to follow.

## BrainMap CLI Architecture Analysis

I've thoroughly explored the CLI crate to understand the patterns you should follow in the Tauri desktop app. Here's the complete breakdown:

### 1. **Command Structure and Dispatch Pattern**

**File**: `crates/cli/src/main.rs`

- **Hierarchical command organization**: Top-level `Commands` enum dispatches to subcommand groups (Node, Link, Federation) or direct commands (Search, Validate, Stats, etc.)
- **Shared global args**: `--workspace`, `--format`, `--quiet` passed to all commands
- **OutputFormat enum**: Two variants (Text, Json) - API-first design with JSON as primary, text as fallback
- **Error handling**: Main function returns `ExitCode` and delegates JSON/text error formatting to output module

**Key dispatching pattern**:
```
match cli.command {
    Commands::Init { path } => commands::init::execute(path, &cli.format, cli.quiet),
    Commands::Node(cmd) => commands::node::execute(cmd, &workspace_path, &cli.format),
    // ... each command gets workspace_path and format
}
```

### 2. **Output/Response Envelope Pattern**

**File**: `crates/cli/src/output.rs`

This is the most important pattern to replicate in your Tauri layer:

- **Unified Response<T> struct**: All JSON responses follow this envelope:
  ```json
  {
    "success": bool,
    "data": T (optional),
    "error": ErrorPayload (optional)
  }
  ```

- **ErrorPayload structure**: Contains:
  - `code`: String from `BrainMapError::error_code()` (e.g., "FILE_NOT_FOUND", "DUPLICATE_PATH")
  - `message`: Human readable error from `Display` impl
  - `data`: Optional serde_json::Value for complex error context (e.g., backlinks array on HAS_BACKLINKS)

- **Serialization helpers**:
  - `print_json(data: &T)` wraps data in success Response and pretty-prints
  - `print_json_error(err: &BrainMapError)` extracts error code/message and optional context data
  - Text output is simple: `println!` for success, `eprintln!` for errors

**For Tauri**: Return Response<T> from all command handlers, serialize to JSON. No Tauri-specific error handling needed—pass BrainMapError through unchanged.

### 3. **Command Handler Pattern**

**Files**: `crates/cli/src/commands/*.rs` (node.rs, link.rs, search.rs, graph.rs, etc.)

Each command handler follows this structure:

1. **Parse arguments into structured types** (enums for subcommands like NodeCommands)
2. **Create domain-specific response types** (e.g., NodeCreated, NodeList, LinkInfo) with `#[derive(Serialize)]`
3. **Execute business logic**:
   - `Workspace::open(workspace_path)` for read operations
   - `Workspace::open(workspace_path)` + mutate for writes
   - Use workspace methods: `create_note()`, `read_note()`, `update_note()`, `delete_note()`, `create_link()`, etc.
4. **Match on OutputFormat**:
   - Json: `output::print_json(&response_struct)`
   - Text: human-readable `println!` statements
5. **Return Result<()>** - errors bubble up to main for formatting

**Key characteristics**:
- No error recovery in commands—let errors propagate to output layer
- Workspace is opened fresh for each command (no persistent state)
- All domain data serialized explicitly in response types (not raw Note/Edge)
- Text output is secondary—JSON structure is primary

### 4. **Workspace Integration Pattern**

Commands access the core library exclusively through `Workspace` methods:
- **Reads**: `open()` without mutation, use public fields like `ws.notes`, `ws.index`, `ws.graph`
- **Writes**: open with `let mut ws`, call methods: `create_note()`, `update_note()`, `delete_note()`, `move_note()`, `create_link()`, `delete_link()`
- **Queries**: `list_nodes()`, `list_links()`, `index.search()`, `graph.neighbors()`
- **Context data**: Access internal fields for dry-run/preview operations (e.g., `ws.notes.contains_key(&rp)`, `ws.index.backlinks()`)

### 5. **Test Pattern**

**File**: `crates/cli/tests/cli_integration.rs`

CLI integration tests:
- Use `assert_cmd::Command::cargo_bin("brainmap")` to invoke binary
- Copy seed dataset to temp directory for each test
- Execute via command line with `--workspace` and `--format json` flags
- Parse JSON response and assert on `result["success"]`, `result["data"]`, `result["error"]["code"]`
- Tests cover: CRUD operations, dry-runs, error cases, filters, round-trips
- Pattern: `run_json(workspace_path, &["node", "read", "path"])` returns parsed serde_json::Value

**For Tauri testing**: You can follow similar patterns—invoke Tauri commands, assert on response envelope structure.

### 6. **Key Design Decisions to Mirror**

| Aspect | Pattern | Rationale |
|--------|---------|-----------|
| **Error handling** | Domain errors only—no catch/retry | Single writer model, workspace consistency |
| **State management** | Workspace opened fresh per request | Stateless handlers, easier testing & concurrency |
| **Response format** | Unified envelope with optional fields | Consistent client-side parsing, error detail flexibility |
| **Text vs. JSON** | JSON primary, text is pretty-print | AI-first design, CLI can parse own output |
| **Dry-run support** | Optional flag, returns preview without mutation | Preview before destructive ops (move, delete) |
| **Argument parsing** | Explicit response types, not raw domain types | Clean serialization boundary, versioning flexibility |

### 7. **Concrete Example: Node CRUD**

Here's how node.rs demonstrates the full pattern:

**Create**:
1. Parse args into path, title, type, tags, etc.
2. Call `ws.create_note(path, title, type, tags, status, ...)`
3. Create `NodeCreated { path }` response struct
4. Match format → `output::print_json(&NodeCreated { ... })`

**Read**:
1. Parse path arg
2. Call `ws.read_note(&path)` → returns `Note`
3. Return full Note in JSON (already Serialize), or format for text output

**Update**:
1. Parse path and optional field args
2. Call `ws.update_note(path, title, r#type, tags, ...)`
3. Return `{ "path": path, "updated": true }` response

**Delete with dry-run**:
1. If `--dry-run`: open read-only, call `ws.index.backlinks(&path)`, return preview without file ops
2. Otherwise: call `ws.delete_note(&path, force)`, return `NodeDeleted { path }`

**List with filtering**:
1. Parse optional type/tag/status/limit/offset
2. Call `ws.list_nodes(type, tag, status)` → Vec<Note>
3. Create `NodeList { nodes, total, limit, offset }` with summaries
4. Return paginated results

### 8. **Command Categories (For Reference)**

- **Node operations**: Create, Read, Update, Delete, Move, List
- **Link operations**: Create, Delete, List
- **Query/Visualization**: Search, Neighbors, Path, Subgraph
- **Workspace**: Init, Validate, Stats, Status, Reindex, Config
- **Integration**: Federation (add/list/remove), Serve (MCP)
- **Export**: Export (multiple formats: json, dot, graphml)

All follow the same Workspace → Response pattern.

---

## Recommendations for Tauri Implementation

1. **Create a `tauri_commands` module** mirroring `crates/cli/src/commands/`—each Tauri command invokes the corresponding CLI handler logic
2. **Reuse response types** from CLI or create Tauri-specific wrappers that serialize to the same envelope
3. **Workspace passing**: Either pass workspace path from frontend state, or keep a workspace singleton in Tauri state
4. **Error mapping**: Convert BrainMapError to JSON envelope automatically in a Tauri error handler
5. **Format negotiation**: Always use JSON (no text output needed in GUI), but keep the response structure identical
6. **Testing**: Write integration tests that invoke Tauri commands just like CLI tests invoke the binary

The beauty of this design: **the CLI and Tauri layers are thin wrappers around the same core library**. Both can share command logic; they differ only in I/O (stdout vs. Tauri IPC).

---

