# Manual MCP Tool Dispatch
**Date:** 2026-03-15 | **Status:** accepted

## Context
The MCP server (`crates/mcp`) needs to route incoming tool calls to handler functions. The `rmcp` crate provides derive macros (`#[tool]`) that auto-generate dispatch logic, but we needed to decide whether to use them or write explicit routing.

## Decision
Use a manual `match name { ... }` dispatch table in `server.rs` (`dispatch_tool` method). Each tool maps to a function call like `"node_get" => tools::node::node_get(...)`. Unknown tools fall through to a `_` arm that returns an error with the tool name logged.

## Alternatives Considered
- **rmcp derive macros (`#[tool]` attribute):** Would reduce boilerplate but hides the routing behind proc macro expansion. AI agents reading the code cannot see which tools exist without expanding macros. Adding or removing a tool requires understanding the macro's conventions rather than editing a simple match arm. Debugging dispatch issues means debugging generated code.
- **HashMap-based dynamic dispatch:** A `HashMap<String, Box<dyn Fn>>` would allow runtime registration but adds complexity (trait objects, lifetime management) for no real benefit when the tool set is known at compile time.

## Consequences
- The full list of 24 tools is visible in one place (~25 lines of match arms), making it trivial for any reader (human or AI) to audit the complete tool surface.
- Adding a new tool requires exactly two steps: write the handler function, add one match arm. No macro annotations, no registration calls.
- The `batch` tool reuses `dispatch_tool` internally, which would be harder to implement cleanly with macro-generated dispatch.
- Trade-off: slightly more boilerplate than derive macros (one line per tool), but this is negligible for a 24-tool server.
