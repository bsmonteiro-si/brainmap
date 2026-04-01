# 2026-03-16 — Subagent Transcript: general-purpose

**Date:** 2026-03-16 10:37:26
**Agent:** general-purpose
**Agent ID:** abf4e84d643acdf40
**Parent Session:** f488f53d-046e-4418-a25e-51aa975625a4

---

## User

## Task: 3B — Property-Based Testing (Rust — proptest)

You are implementing one task from the AI-first upgrades plan. Your job is to WRITE CODE.

### Goal
Add property-based tests using `proptest` that verify graph invariants hold under arbitrary operation sequences.

### Steps

1. **Read `crates/core/Cargo.toml`** and add `proptest = "1"` to `[dev-dependencies]`

2. **Read these files** to understand the API:
   - `crates/core/src/graph.rs` — `Graph` struct, `add_node`, `remove_node`, `add_edge`, `remove_edge`, `assert_invariants` method
   - `crates/core/src/model.rs` — `Edge`, `NodeData`, `RelativePath`, `EdgeKind`, `NoteId`
   - Look for the `make_node` test helper in the `#[cfg(test)]` block of `graph.rs`

3. **Create `crates/core/tests/property_tests.rs`** with:

```rust
use proptest::prelude::*;
use brainmap_core::graph::Graph;
use brainmap_core::model::{RelativePath, NodeData, Edge, EdgeKind, NoteId};
```

**Strategies:**
- `arb_path()` — generate valid relative paths like `"dir/file.md"` using regex `[a-z]{1,4}/[a-z]{1,8}\\.md`
- `arb_rel()` — choose from known edge types: related-to, causes, supports, contradicts, extends

**Tests (use `proptest!` macro):**
- **add_remove_nodes_preserves_invariants** — add N random nodes, remove half, call `assert_invariants()`
- **edges_symmetric_after_random_adds** — add nodes + random edges between them, call `assert_invariants()`
- **remove_edges_preserves_symmetry** — add edges then remove some, verify invariants
- **interleaved_ops_no_panic** — random sequence of add_node/remove_node/add_edge/remove_edge

**Key details:**
- `assert_invariants()` is gated by `#[cfg(debug_assertions)]` — tests run in debug by default so it's active
- You need to construct `NodeData` — check what fields it requires (title, note_type, etc.)
- `Edge` has fields: `source: RelativePath`, `target: RelativePath`, `rel: String`, `kind: EdgeKind`, `annotation: Option<String>`
- `Graph::new()` creates an empty graph
- Check if `Graph` methods are `pub` by reading the source

4. **Run `cargo test -p brainmap-core`** to verify all tests pass (both existing and new)

### Important
- Do NOT modify any existing source files except `Cargo.toml`
- Do NOT modify CLAUDE.md

---

## Assistant



I'll start by reading the necessary source files to understand the API.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf4e84d/crates/core/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf4e84d/crates/core/src/graph.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf4e84d/crates/core/src/model.rs"}`

---

## Assistant

Now I have all the information needed. I see that `Edge` does not have an `annotation` field (the task description was slightly wrong). Let me also check the `lib.rs` to confirm the public exports.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub mod graph","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf4e84d/crates/core/src/lib.rs","output_mode":"content"}`

---

## Assistant

Good, `graph` and `model` are public modules. Now let me add `proptest` to dev-dependencies and create the test file.

---

## Assistant

### Tool Calls

- **Edit**: `{"replace_all":false,"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf4e84d/crates/core/Cargo.toml","old_string":"[dev-dependencies]\ntempfile = \"3\"","new_string":`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf4e84d/crates/core/tests/property_tests.rs","content":"use proptest::prelude::*;\n\nuse brainmap_core::graph::Graph;`

---

## Assistant

Now let me run the tests.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"export PATH=\"$HOME/.cargo/bin:$PATH\" && cargo test -p brainmap-core 2>&1","description":"Run all brainmap-core tests including new property tests","timeout":300000}`

---

## Assistant

The incremental tests fail due to a pre-existing issue (missing `.brainmap` directory — unrelated to my changes). Let me run just the property tests and the unit tests to confirm my new tests pass.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"export PATH=\"$HOME/.cargo/bin:$PATH\" && cargo test -p brainmap-core --test property_tests 2>&1","description":"Run property tests only","timeout":300000}`

---

## Assistant

All 4 property tests pass. Let me also confirm the existing unit tests still pass.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"export PATH=\"$HOME/.cargo/bin:$PATH\" && cargo test -p brainmap-core --lib 2>&1","description":"Run unit tests to confirm no regressions","timeout":120000}`

---

## Assistant

All tests pass. Here is a summary of what was done:

**Changes made:**

1. **`/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf4e84d/crates/core/Cargo.toml`** -- Added `proptest = "1"` to `[dev-dependencies]`.

2. **`/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf4e84d/crates/core/tests/property_tests.rs`** -- Created with 4 property-based tests:

   - **`add_remove_nodes_preserves_invariants`** -- Adds up to 30 random nodes, removes half, verifies `assert_invariants()`.
   - **`edges_symmetric_after_random_adds`** -- Adds nodes and random edges between them, checking outgoing/incoming symmetry invariants.
   - **`remove_edges_preserves_symmetry`** -- Adds edges then removes a subset, verifying invariants still hold.
   - **`interleaved_ops_no_panic`** -- Runs 5-50 random operations (add_node, remove_node, add_edge, remove_edge) in arbitrary order, verifying no panics and invariants hold at the end.

   **Strategies defined:**
   - `arb_path()` -- generates paths matching `[a-z]{1,4}/[a-z]{1,8}.md`
   - `arb_rel()` -- selects from 5 edge types (related-to, causes, supports, contradicts, extends)
   - `arb_note_type()` -- selects from 5 note types (excludes "folder" to avoid triggering the "contains" invariant which requires folder-typed source nodes)

   Key design choices: duplicate edge detection before `add_edge` (the graph's no-duplicate-edges invariant would panic otherwise), and the interleaved test tracks known nodes/edges to ensure operations target valid entities.

The 11 pre-existing incremental test failures are unrelated (they fail due to a missing `.brainmap` directory in the worktree's seed copy -- a pre-existing issue in this worktree).

---

