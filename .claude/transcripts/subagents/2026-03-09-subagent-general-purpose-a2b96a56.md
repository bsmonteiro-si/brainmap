# 2026-03-09 — Subagent Transcript: general-purpose

**Date:** 2026-03-09 18:14:36
**Agent:** general-purpose
**Agent ID:** a2b96a56de25aa2ad
**Parent Session:** 3447398a-4083-473c-b489-02979ab6173d

---

## User

You are implementing 6 missing MCP tools for BrainMap. The MCP server is in `crates/mcp/`.

## Existing Architecture

- `crates/mcp/src/server.rs` — `BrainMapMcp` struct with `dispatch_tool()` method, `ServerHandler` impl
- `crates/mcp/src/tools/mod.rs` — `all_tools()` returns Vec<Tool>, helper functions `arg_str`, `arg_usize`, `arg_bool`, `arg_str_vec`, `make_tool`
- `crates/mcp/src/tools/node.rs` — node_get, node_list, node_create, node_update, node_delete
- `crates/mcp/src/tools/link.rs` — link_create, link_delete, link_list
- `crates/mcp/src/tools/search.rs` — search
- `crates/mcp/src/tools/graph.rs` — neighbors, find_path, subgraph_tool
- `crates/mcp/src/tools/workspace.rs` — status, validate, stats, reindex, export, config_get

Every handler function follows this pattern:
```rust
pub fn tool_name(workspace: &Arc<Mutex<Workspace>>, arguments: &JsonArgs) -> CallToolResult {
    let arg = match arg_str(arguments, "key") {
        Some(v) => v,
        None => return BrainMapMcp::err_result(&brainmap_core::BrainMapError::InvalidArgument("key argument required".into())),
    };
    let ws = match BrainMapMcp::lock_workspace(workspace) {
        Ok(guard) => guard,
        Err(err_result) => return err_result,
    };
    match ws.some_operation(...) {
        Ok(result) => BrainMapMcp::ok_json(&serde_json::json!({...})),
        Err(e) => BrainMapMcp::err_result(&e),
    }
}
```

## Tools to Implement

### 1. `node_move` (in `tools/node.rs`)
Move/rename a node and rewrite all references.
- Args: `old_path` (required), `new_path` (required)
- Calls `ws.move_note(old_path, new_path)` which returns `Result<Vec<String>>` (affected files)
- Response: `{"old_path": ..., "new_path": ..., "references_rewritten": count, "affected_files": [...]}`

### 2. `config_set` (in `tools/workspace.rs`)
Set a workspace config value.
- Args: `key` (required), `value` (required)
- Only `name` is settable. For other keys return error.
- Must save config to disk via `brainmap_core::config::save_config(&config, &brainmap_dir)`
- The workspace's `root` field gives you the path. `brainmap_dir = ws.root.join(".brainmap")`
- Response: `{"key": ..., "old_value": ..., "new_value": ...}`

### 3. `federation_list` (in new file `tools/federation.rs`)
List federated workspaces.
- No required args
- Response: `{"workspaces": [{name, path}], "total": count}`

### 4. `federation_add` (in `tools/federation.rs`)
Add a federated workspace.
- Args: `name` (required), `path` (required)
- Calls `ws.config.add_federation(&name, &path)` then saves config
- Response: `{"name": ..., "path": ..., "added": true}`

### 5. `federation_remove` (in `tools/federation.rs`)
Remove a federated workspace.
- Args: `name` (required)
- Calls `ws.config.remove_federation(&name)` returns bool
- Must save config if removed
- Response: `{"name": ..., "removed": true/false}`

### 6. `batch` (in server.rs as a method on BrainMapMcp)
Execute multiple operations sequentially.
- Args: `operations` (required) — array of `{"tool": "tool_name", "input": {...}}`
- Execute each operation via `self.dispatch_tool(tool, &input_as_map)`.
- On failure (is_error == Some(true)), skip remaining operations.
- Response matches the spec:
  - Success: `{"total": N, "succeeded": N, "failed": 0, "results": [...]}`
  - Partial failure: `{"total": N, "succeeded": X, "failed": 1, "skipped": Y, "results": [...]}`

For batch, implement it as `batch_execute` method on `BrainMapMcp` in server.rs, and in dispatch_tool add:
```rust
"batch" => self.batch_execute(arguments),
```

Note: dispatch_tool currently takes `&self` so this works. The batch_execute method parses the operations array and loops calling self.dispatch_tool for each.

## Changes needed

1. **`crates/mcp/src/tools/node.rs`** — Add `node_move` function
2. **`crates/mcp/src/tools/workspace.rs`** — Add `config_set` function (needs `use brainmap_core::config::save_config;`)
3. **`crates/mcp/src/tools/federation.rs`** — New file with `federation_list`, `federation_add`, `federation_remove`
4. **`crates/mcp/src/tools/mod.rs`** — Add `pub mod federation;`, add 6 tool schemas to `all_tools()`
5. **`crates/mcp/src/server.rs`** — Add dispatch entries for node_move, config_set, federation_list, federation_add, federation_remove. Add batch_execute method + batch dispatch.
6. **`crates/mcp/tests/tool_tests.rs`** — Add tests for all 6 new tools

## Tool Schemas to add in `all_tools()`:

```rust
make_tool("node_move", "Move/rename a node and rewrite all references", serde_json::json!({
    "old_path": {"type": "string", "description": "Current path"},
    "new_path": {"type": "string", "description": "New path"}
}), vec!["old_path", "new_path"]),

make_tool("config_set", "Set a workspace configuration value", serde_json::json!({
    "key": {"type": "string", "description": "Config key to set"},
    "value": {"type": "string", "description": "New value"}
}), vec!["key", "value"]),

make_tool("federation_list", "List federated workspaces", serde_json::json!({}), vec![]),

make_tool("federation_add", "Add a federated workspace", serde_json::json!({
    "name": {"type": "string", "description": "Federation name"},
    "path": {"type": "string", "description": "Path to the federated workspace"}
}), vec!["name", "path"]),

make_tool("federation_remove", "Remove a federated workspace", serde_json::json!({
    "name": {"type": "string", "description": "Name of federation to remove"}
}), vec!["name"]),

make_tool("batch", "Execute multiple operations sequentially", serde_json::json!({
    "operations": {"type": "array", "items": {"type": "object", "properties": {
        "tool": {"type": "string"}, "input": {"type": "object"}
    }}, "description": "Operations to execute"}
}), vec!["operations"]),
```

## Important
- Read each file before editing
- Follow the existing patterns exactly (lock_workspace, ok_json, err_result, InvalidArgument)
- Run `cargo test -p brainmap-mcp` and `cargo build` after changes
- The workspace config methods already exist: `config.add_federation()`, `config.remove_federation()`, `save_config()`
- For batch, tool names in the operations array use the internal names (node_get, not brainmap_node_get)

---

## Assistant



I'll start by reading the existing files to understand the patterns, then implement all 6 tools.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/.claude/worktrees/agent-a2b96a56/crates/mcp/src/server.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/.claude/worktrees/agent-a2b96a56/crates/mcp/src/tools/mod.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/.claude/worktrees/agent-a2b96a56/crates/mcp/src/tools/node.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/.claude/worktrees/agent-a2b96a56/crates/mcp/src/tools/workspace.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/.claude/worktrees/agent-a2b96a56/crates/mcp/src/tools/link.rs"}`

---

## Assistant

Let me find where the MCP crate actually lives.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/crates/mcp/src/**/*.rs"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/.claude/worktrees/agent-a2b96a56/","description":"List worktree contents"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/.claude/worktrees/agent-a2b96a56/crates/","description":"List crates directory"}`

---

## Assistant

The MCP crate doesn't exist yet. Let me check the parent worktree for it.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/","description":"Check parent worktree for MCP crate"}`

---

## Assistant

The MCP crate exists in the parent worktree. Let me read the files from there.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/mcp/src/server.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/mcp/src/tools/mod.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/mcp/src/tools/node.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/mcp/src/tools/workspace.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/mcp/src/tools/link.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/mcp/src/tools/search.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/mcp/src/tools/graph.rs"}`

---

## Assistant

Now let me check the existing test file and the config module to understand `save_config`, `add_federation`, etc.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/crates/mcp/tests/**/*.rs","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub fn (move_note|save_config|add_federation|remove_federation)","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/core","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/mcp/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/mcp/tests/tool_tests.rs"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"(add_federation|remove_federation|federation)","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/core/src/config.rs","output_mode":"content","-C":`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub fn move_note","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/core/src/workspace.rs","output_mode":"content","-C":5}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub root:","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/core/src/workspace.rs","output_mode":"content","-C":3}`

---

## Assistant

Let me check the config struct for federation methods and `move_note`.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/core/src/config.rs"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub fn move_note|fn move_note","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/core/src","output_mode":"content","-C":5}`

---

## Assistant

I see that `move_note`, `add_federation`, and `remove_federation` don't exist yet in the core. I need to check the workspace more carefully and potentially add them. Let me check what methods are available on the workspace.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/core/src/workspace.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/core/src/error.rs"}`

---

## Assistant

Now let me check the remaining workspace methods (the ones used by the CLI like `create_note`, `delete_note`, `move_note`, etc.):

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub fn (create_note|update_note|delete_note|reindex|read_note|list_nodes|create_link|delete_link|list_links|find_path|get_subgraph|move_note)","path":"/Users/bsmonteiro/Desktop/Personal/br`

---

## Assistant

These methods must be in a different file. Let me check for the workspace methods that the CLI uses:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"fn (create_note|read_note|update_note|delete_note|reindex|list_nodes|create_link|delete_link|list_links|find_path|get_subgraph|move_note)","path":"/Users/bsmonteiro/Desktop/Personal/brainm`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"ws\\.(create_note|read_note|update_note|delete_note|reindex|list_nodes|create_link|delete_link|list_links|find_path|get_subgraph|move_note)","path":"/Users/bsmonteiro/Desktop/Personal/brai`

---

## Assistant

These workspace methods must be defined somewhere I haven't found. Let me check if there's another workspace file:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/core/src/**/*.rs","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c"}`

---

## Assistant

The workspace.rs in our worktree may have the methods. Let me check the one in the parent worktree more carefully - the git working tree may have unstaged changes:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c && git diff HEAD -- crates/core/src/workspace.rs | head -200","description":"Check unstaged changes in works`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c && git log --oneline -5","description":"Check recent commits"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c && git status --short | head -30","description":"Check git status in parent worktree"}`

---

## Assistant

So the MCP crate is untracked in the parent worktree. Let me check the lib.rs for the core and see what's exported, particularly `InvalidArgument`:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/core/src/lib.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/mcp/src/lib.rs"}`

---

## Assistant

I notice that `InvalidArgument` is used in the MCP tools but doesn't exist in the error enum. Let me check:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"InvalidArgument","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/core/src/error.rs","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c && cat crates/core/src/error.rs","description":"Check core error.rs for full content including uncommitted"}`

---

## Assistant

The MCP crate uses `InvalidArgument` and methods like `create_note`, `move_note`, `error_code()` etc. that don't exist yet in the committed core. These must have been added as part of a parallel effort. Let me check what exists in the MCP crate's working state by building it:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c && export PATH=\"$HOME/.cargo/bin:$PATH\" && cargo check -p brainmap-mcp 2>&1 | head -40","description":"Che`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c && export PATH=\"$HOME/.cargo/bin:$PATH\" && cargo check -p brainmap-mcp 2>&1","description":"Check if MCP c`

---

## Assistant

The workspace Cargo.toml doesn't include the mcp crate. Let me check:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/Cargo.toml"}`

---

## Assistant

I need to add the mcp crate to the workspace. But first, let me check if the core crate in the parent worktree already has the required methods (like `move_note`, `error_code`, `InvalidArgument`, etc.), or if I need to add them too. Let me check the workspace.rs carefully for the write methods:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c && wc -l crates/core/src/workspace.rs","description":"Check workspace.rs line count"}`

---

## Assistant

I already read it above - it only has `init`, `open`, `validate`, and `stats`. The write methods (`create_note`, `read_note`, `delete_note`, `update_note`, `reindex`, `list_nodes`, `create_link`, `delete_link`, `list_links`, `find_path`, `get_subgraph`, `move_note`) must have been added by another agent working in the parent worktree. Let me check the other worktrees:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"wc -l /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/.claude/worktrees/agent-a5a30b3c/crates/core/src/workspace.rs","description":"Check other worktree worksp`

---

## Assistant

Same size. The MCP crate references methods that haven't been added to core yet. I need to add them. Let me first understand what the MCP tools expect and then add the missing core functionality plus the 6 new tools. Let me look at what the export module expects:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub mod export","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/core/src","output_mode":"content"}`

---

## Assistant

OK, so there's a LOT of missing core functionality. The MCP crate is being developed ahead of the core. I need to:
1. Add missing variants to `BrainMapError` (`InvalidArgument`)
2. Add `error_code()` method
3. Add workspace methods (`read_note`, `list_nodes`, `create_note`, `update_note`, `delete_note`, `reindex`, `create_link`, `delete_link`, `list_links`, `find_path`, `get_subgraph`, `move_note`)
4. Add `export` module
5. Add `WorkspaceStats` `Serialize` derive
6. Add the 6 new MCP tools
7. Add `Cargo.toml` workspace member

This is a substantial amount of work. Let me start systematically. First, let me understand the full scope by checking the model and graph modules:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/core/src/model.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/core/src/graph.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/core/src/index.rs"}`

---

## Assistant

Now I have the full picture. The core library is missing a lot of methods that the MCP crate depends on. I need to:

1. Add `InvalidArgument` variant + `error_code()` method to `BrainMapError`
2. Add `Serialize` derives for types used in JSON responses (`Subgraph`, `Edge`, `NodeData`, `WorkspaceStats`, `SearchResult`, `Note`, `GraphStats`)
3. Add workspace methods: `read_note`, `list_nodes`, `create_note`, `update_note`, `delete_note`, `reindex`, `create_link`, `delete_link`, `list_links`, `find_path`, `get_subgraph`, `move_note`
4. Add `add_federation`/`remove_federation` to `WorkspaceConfig`
5. Add `export` module
6. Make `edges_for` public on `Graph`
7. Add mcp crate to workspace Cargo.toml
8. Add the 6 new MCP tools
9. Add tests

Let me also check the parser module to understand how to write notes back:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/core/src/parser.rs"}`

---

## Assistant

Now I have a complete picture. Let me check the Cargo.toml for core:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/core/Cargo.toml"}`

---

## Assistant

Now I have everything. Let me implement all changes systematically. I'll work in the parent worktree since that's where the MCP crate exists.

Let me start with the core changes:

---

## Assistant

### Tool Calls

- **Edit**: `{"replace_all":false,"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/core/src/error.rs","old_string":"use thiserror::Error;\n\npub type Result<T> = std`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a793c24c/crates/core/src/error.rs","content":"use thiserror::Error;\n\npub type Result<T> = std::result::Result<T, Bra`

---

## Assistant

I need both Edit and Write permissions to make these changes. The task requires modifying multiple existing files and creating new ones across the codebase. Here's what I need to do:

**Core library changes needed** (`crates/core/src/`):
1. **`error.rs`** -- Add `InvalidArgument` variant and `error_code()` method to `BrainMapError`
2. **`model.rs`** -- Add `Serialize` derives to `Edge`, `NodeData`, `Subgraph`, `SearchResult`, `Note` (needed for JSON serialization in MCP responses)
3. **`graph.rs`** -- Make `edges_for` public, add `Serialize` to `Subgraph` and `GraphStats`
4. **`workspace.rs`** -- Add workspace methods: `read_note`, `list_nodes`, `create_note`, `update_note`, `delete_note`, `reindex`, `create_link`, `delete_link`, `list_links`, `find_path`, `get_subgraph`, `move_note`. Add `Serialize` to `WorkspaceStats`
5. **`config.rs`** -- Add `add_federation` and `remove_federation` methods to `WorkspaceConfig`
6. **`lib.rs`** -- Add `pub mod export;`
7. **New file: `export.rs`** -- Export functions (`export_json`, `export_dot`, `export_graphml`)

**MCP crate changes** (`crates/mcp/`):
8. **`tools/node.rs`** -- Add `node_move` function
9. **`tools/workspace.rs`** -- Add `config_set` function
10. **New file: `tools/federation.rs`** -- `federation_list`, `federation_add`, `federation_remove`
11. **`tools/mod.rs`** -- Add `pub mod federation;` and 6 tool schemas
12. **`server.rs`** -- Add dispatch entries + `batch_execute` method
13. **`tests/tool_tests.rs`** -- Add tests for all 6 new tools

**Workspace config**:
14. **`Cargo.toml`** (root) -- Add `crates/mcp` to workspace members

I need Edit and Write permissions to proceed. Could you grant those so I can implement the changes?

---

