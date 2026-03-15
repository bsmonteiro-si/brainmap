# How to Add an MCP Tool

## Checklist

### 1. Implement the tool handler

- [ ] Add handler function — `crates/mcp/src/tools/<module>.rs` (choose an existing module like `node.rs`, `graph.rs`, `workspace.rs`, or create a new one). The function signature must be:
  ```rust
  pub fn your_tool(workspace: &Arc<Mutex<Workspace>>, arguments: &JsonArgs) -> CallToolResult
  ```
- [ ] If creating a new module, register it — `crates/mcp/src/tools/mod.rs` (line ~1). Add `pub mod <name>;`.

### 2. Define the tool schema

- [ ] Add tool definition — `crates/mcp/src/tools/mod.rs` (line ~70, inside `all_tools()` function). Use the `make_tool()` helper:
  ```rust
  make_tool("your_tool", "Description of what it does", serde_json::json!({
      "param_name": {"type": "string", "description": "What this param is"}
  }), vec!["required_param"]),
  ```

### 3. Wire up dispatch

- [ ] Add match arm — `crates/mcp/src/server.rs` (line ~83, `dispatch_tool` match block). Add:
  ```rust
  "your_tool" => tools::<module>::your_tool(&self.workspace, arguments),
  ```

### 4. Implement the handler logic

- [ ] Extract arguments using helpers from `crates/mcp/src/tools/mod.rs`:
  - `arg_str(arguments, "key")` — returns `Option<String>` (line ~15)
  - `arg_usize(arguments, "key")` — returns `Option<usize>` (line ~23)
  - `arg_bool(arguments, "key")` — returns `Option<bool>` (line ~31)
  - `arg_str_vec(arguments, "key")` — returns `Option<Vec<String>>` (line ~38)
- [ ] Lock workspace: `let ws = BrainMapMcp::lock_workspace(workspace)?;`
- [ ] Return success: `BrainMapMcp::ok_json(&data)` — wraps in `{"success": true, "data": ...}` envelope.
- [ ] Return error: `BrainMapMcp::err_result(&err)` — wraps in `{"success": false, "error": {...}}` envelope.

### 5. Tests

- [ ] Add tool test — `crates/mcp/tests/` directory. Create a workspace, construct a `BrainMapMcp` instance via `BrainMapMcp::from_workspace(ws)`, call `dispatch_tool("your_tool", &args)`, and assert on the result content.

## Example

Follow the pattern of the `search` tool:
- Handler: `crates/mcp/src/tools/search.rs` — complete implementation with argument extraction, workspace lock, core API call, response envelope
- Schema: `crates/mcp/src/tools/mod.rs` line ~134 (`make_tool("search", ...)`)
- Dispatch: `crates/mcp/src/server.rs` line ~93 (`"search" => tools::search::search(...)`)
