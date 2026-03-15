# How to Add an Edge Type

## Checklist

### Backend (Rust)

- [ ] Register in default config — `crates/core/src/config.rs` (line ~102, `default_edge_types()` function). Add the new edge type string to the `vec![]`.
- [ ] Update config test assertion — `crates/core/src/config.rs` (line ~137, `test_default_config`). Bump the `edge_types.len()` count.
- [ ] The core uses string-based edge types (not an enum) — `crates/core/src/model.rs` (line ~172, `Edge.rel` is `String`). No model changes needed.
- [ ] `WorkspaceConfig::register_edge_type()` at `crates/core/src/config.rs` (line ~42) supports runtime registration if the type is user-defined.

### CLI

- [ ] No changes needed — the CLI `link create --rel` accepts any string. The new type works automatically once in config.

### MCP Server

- [ ] Optionally update tool description — `crates/mcp/src/tools/mod.rs` (line ~117). The `link_create` tool description mentions example rel types; add yours.

### Desktop App — Links Editor

- [ ] Add to selectable edge types — `crates/app/src/components/Editor/LinksEditor.tsx` (line ~10, `LINK_TYPES` array). Add the new type string. Note: `contains`, `part-of`, and `mentioned-in` are excluded from this list because they are auto-generated.

### Desktop App — Graph

- [ ] Edge labels are rendered from the `rel` field automatically — no graph style changes needed.
- [ ] The edge type filter popover in the graph toolbar auto-discovers types from the loaded edges — no changes needed there either.

### Tests

- [ ] Add test links — Create or update a seed note in `seed/` with a link using the new edge type in its YAML frontmatter `links:` field.
- [ ] CLI integration test — Add a test case in `crates/cli/tests/` that creates a link with the new rel type and verifies it appears in `link list`.
- [ ] MCP tool test — Add a test in `crates/mcp/tests/` using `link_create` with the new rel type.

## Example

Follow the pattern of the `causes` edge type:
- Config: `crates/core/src/config.rs` line ~106 (`"causes"` in `default_edge_types`)
- Links Editor: `crates/app/src/components/Editor/LinksEditor.tsx` line ~11 (`"causes"` in `LINK_TYPES`)
- Seed usage: `seed/Concepts/Causal Inference.md` uses `causes` in its frontmatter links
