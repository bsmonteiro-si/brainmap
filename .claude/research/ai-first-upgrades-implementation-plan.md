# AI-First Upgrades — Implementation Plan

## Context

Following the AI-first codebase audit (`.claude/research/ai-first-codebase-audit.md`), 12 upgrades were identified. Implemented across two batches of 6 parallel agents. All 12 tasks complete and merged.

---

## Batch 1 — COMPLETED ✅

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

## Batch 2 — COMPLETED ✅

### 1C. CLAUDE.md Restructuring — DONE ✅
**Commit:** `1b54885` | **Merged to main**

Slimmed CLAUDE.md from 31KB to 4.9KB. Moved entire "Current Status" feature history to `docs/CHANGELOG.md`. Kept conventions, review agents, and mandatory feedback loops intact. Added references to new docs (decisions, extension guides, error recovery).

---

### 1D. Review File Cleanup Convention — DONE ✅
**Commit:** `9264d74` | **Merged to main**

Created `.claude/reviews/archive/.gitkeep`. Cleanup convention added to CLAUDE.md by 1C agent: move review files to archive after committing, move files older than 7 days at session start.

---

### 3B. Property-Based Testing (Rust — proptest) — DONE ✅
**Commit:** `f278f69` | **Merged to main**

Added `proptest = "1"` to core dev-dependencies. Created `crates/core/tests/property_tests.rs` with 4 property-based tests: add/remove nodes preserves invariants, edge symmetry after random adds, remove edges preserves symmetry, interleaved ops no panic. Smart strategies: avoids folder type (contains invariant), deduplicates edges before add.

---

### 3C. Property-Based Testing (TypeScript — fast-check) — DONE ✅
**Commit:** `9264d74` | **Merged to main**

Added `fast-check` to devDependencies. Created `crates/app/src/stores/graphStore.property.test.ts` with 10 property-based tests across 5 groups: duplicate edge prevention, node count consistency, reset to empty, edge deletion, cascading node deletion. All 608 Vitest tests passing.

---

### 4A. Tauri Integration Tests — DONE ✅
**Commit:** `16e3ab4` | **Merged to main**

Added `tempfile` to src-tauri dev-dependencies. Created `crates/app/src-tauri/tests/integration.rs` with 7 tests: topology validation, create/read roundtrip, link CRUD, backlink error handling, move note path rewriting, path traversal rejection, DTO field name verification. Uses `fresh_workspace()` helper with 3 minimal notes (avoids seed invariant issues).

---

### 4B. Debug Snapshot Command — DONE ✅
**Commit:** `8bc0d63` | **Merged to main**

Pure frontend approach (no Tauri command needed). Created `crates/app/src/api/debugSnapshot.ts` with `collectDebugSnapshot()`. Added `data-*` attributes to TabBar (`data-tab-id`, `data-active`, `data-dirty`), EditorPanel (`data-view-mode`, `data-editor-dirty`), FileTreePanel (`data-tree-path`), GraphView (`data-graph-nodes`, `data-graph-layout`, `data-graph-focus`). Added `debugSnapshot()` to BrainMapAPI interface, TauriBridge, and MockBridge.

---

## Deferred

### 5A. CLAUDE.md ↔ docs/ Deduplication
Largely addressed by 1C — CLAUDE.md now references docs/ instead of duplicating. Some minor overlap may remain; can be cleaned up incrementally.

### 6A. Visual Regression Testing
**Lowest priority.** Playwright + screenshot comparison for graph/editor states. Not yet started.

---

## Summary

| # | Task | Batch | Status |
|---|------|-------|--------|
| 1A | Trunk-based safety net | 1 | ✅ Merged |
| 1B | ts-rs type generation | 1 | ✅ Merged |
| 1C | CLAUDE.md restructuring | 2 | ✅ Merged |
| 1D | Review cleanup convention | 2 | ✅ Merged |
| 2A | Architecture decision records | 1 | ✅ Merged |
| 2B | Extension guides | 1 | ✅ Merged |
| 2C | Error recovery guide | 1 | ✅ Merged |
| 3A | Workspace invariant assertions | 1 | ✅ Merged |
| 3B | Property-based testing (Rust) | 2 | ✅ Merged |
| 3C | Property-based testing (TS) | 2 | ✅ Merged |
| 4A | Tauri integration tests | 2 | ✅ Merged |
| 4B | Debug snapshot command | 2 | ✅ Merged |
| 5A | CLAUDE.md deduplication | — | Largely done via 1C |
| 6A | Visual regression testing | — | Deferred |
