# AI-First Upgrades — Implementation Plan

## Context

Following the AI-first codebase audit (`.claude/research/ai-first-codebase-audit.md`), 12 upgrades were identified. This plan tracks implementation progress across two batches of 6 parallel agents.

---

## Batch 1 — COMPLETED ✅ (all 6 merged to main)

### 1A. Trunk-Based Safety Net — DONE ✅
**Commit:** `6552915` | **Merged to main**

Created `scripts/check.sh` (cargo fmt, clippy, test, Tauri check, tsc, vitest) and `.githooks/pre-push`. Both executable with correct shebangs.

**Remaining:** Run `git config core.hooksPath .githooks` to activate the hook.

---

### 1B. Auto-Generate TypeScript Types from Rust (ts-rs) — DONE ✅
**Commit:** `65654e9` | **Merged to main**

Added `ts-rs` dependency, annotated 23 DTO structs with `#[derive(TS)]`, generated TypeScript files to `crates/app/src/api/generated/` with barrel export. Hand-written `BrainMapAPI` interface and `WorkspaceEvent` union kept in `types.ts`. Updated all consumers (mocks, 4 test files) for new type signatures. All 592 Vitest tests passing.

---

### 2A. Architecture Decision Records — DONE ✅
**Commit:** `14bddcc` | **Merged to main**

Created `docs/decisions/` with template + 7 ADRs:
- 001: Manual MCP dispatch
- 002: Zustand over alternatives
- 003: Bridge pattern
- 004: Single core library
- 005: String-typed note/edge types
- 006: Virtual folder nodes
- 007: Seed dataset as test fixture

---

### 2B. Extension Guides (How to Add X) — DONE ✅
**Commit:** `b96e8dd` | **Merged to main**

Created `docs/extension-guides/` with 6 guides (all with file paths + line numbers):
- `add-note-type.md`
- `add-edge-type.md`
- `add-cli-command.md`
- `add-mcp-tool.md`
- `add-tauri-command.md`
- `add-zustand-store.md`

---

### 2C. Error Recovery Guide — DONE ✅
**Commit:** `0e53e7c` | **Merged to main**

Created `docs/error-recovery.md` covering all 15 `BrainMapError` variants with Rust signatures, causes, AI recovery actions, examples, and error propagation patterns across MCP/CLI/Tauri.

---

### 3A. Workspace Invariant Assertions — DONE ✅
**Commit:** `314d924` | **Merged to main**

Added `Graph::assert_invariants()` checking 7 invariants (node existence, edge source/target consistency, outgoing/incoming symmetry, contains-edge folder check, no duplicates). Gated with `#[cfg(debug_assertions)]`. Called after all 10 mutation methods in `workspace.rs`. Seed dataset test added.

---

## Batch 2 — NOT STARTED

### 1C. CLAUDE.md Restructuring
**Goal:** Slim CLAUDE.md to essentials; move feature history to `docs/CHANGELOG.md`.

**New CLAUDE.md structure (order matters):**
1. `# BrainMap` — one-line description
2. `## Verification` — `./scripts/check.sh` (reference 1A)
3. `## Building` — cargo/npm commands
4. `## Project Structure` — crate layout
5. `## Architecture` — core design decisions (~10 lines)
6. `## Data Model` — summary + "See `docs/02-data-model.md`"
7. `## Conventions` — keep existing
8. `## Logging` — trim, reference `docs/logging.md`
9. `## Review Agents` — keep existing (mandatory feedback loops)
10. `## Documentation Maintenance` — keep existing

**Must also add references to new batch 1 docs:**
- `## Decisions` → `docs/decisions/`
- `## Extension Guides` → `docs/extension-guides/`
- `## Error Recovery` → `docs/error-recovery.md`

---

### 1D. Review File Cleanup Convention
**Goal:** Prevent `.claude/reviews/` from growing unboundedly.

- Add cleanup rule to CLAUDE.md Review Agents section
- Create `.claude/reviews/archive/.gitkeep`

---

### 3B. Property-Based Testing (Rust — proptest)
**Goal:** Test graph invariants hold under arbitrary operation sequences.

- Add `proptest = "1"` to `crates/core/Cargo.toml` dev-dependencies
- Create `crates/core/tests/property_tests.rs`
- Test strategies: random paths, random edge types, add/remove sequences
- Uses `assert_invariants()` from 3A (now merged)

---

### 3C. Property-Based Testing (TypeScript — fast-check)
**Goal:** Test Zustand store consistency under arbitrary event sequences.

- Add `fast-check` to `crates/app/package.json` devDependencies
- Create `crates/app/src/stores/graphStore.property.test.ts`
- Test: `applyEvent` never produces duplicate edges

---

### 4A. Tauri Integration Tests
**Goal:** Test real Rust command → core library → DTO → response path.

- Add `tempfile`, `serde_json` to `crates/app/src-tauri/Cargo.toml` dev-deps
- Create `crates/app/src-tauri/tests/integration.rs`
- Test flows: open workspace roundtrip, create/read note, link CRUD, HAS_BACKLINKS error, move note, path traversal rejection

---

### 4B. Screenshot/DOM Snapshot Command
**Goal:** Give AI a way to "see" the running app without Chrome MCP.

- Add `debug_snapshot` Tauri command (`commands.rs` + `lib.rs` registration)
- Add `data-*` attributes to key frontend elements (tab bar, tree items, editor, graph)
- Snapshot captures: active tab, editor content, file tree, graph node count, errors, viewport

---

## Deferred (post-batch 2)

### 5A. CLAUDE.md ↔ docs/ Deduplication
**Depends on:** 1C (CLAUDE.md restructuring)

Replace duplicated content in CLAUDE.md with references to docs/ files.

### 6A. Visual Regression Testing
**Lowest priority.** Playwright + screenshot comparison for graph/editor states.

---

## Batch 2 Parallelism Map

```
Agent 1: 1C (CLAUDE.md split)    → CLAUDE.md, docs/CHANGELOG.md
Agent 2: 1D (review cleanup)     → .claude/reviews/archive/
Agent 3: 3B (proptest Rust)      → crates/core/ (uses 3A assert_invariants)
Agent 4: 3C (fast-check TS)      → crates/app/ stores
Agent 5: 4A (Tauri integ tests)  → crates/app/src-tauri/tests/
Agent 6: 4B (debug snapshot)     → commands.rs, lib.rs, frontend data-attrs
```

No file conflicts between agents. 1C and 1D both touch CLAUDE.md — run 1D after 1C, or have 1D only create the archive dir and add the convention text separately.
