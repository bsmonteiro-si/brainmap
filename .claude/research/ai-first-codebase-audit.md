# AI-First Codebase Audit: BrainMap

*Date: 2025-03-15*

## What's Done Right (Ranked)

### Tier 1: Exceptional — Few Repos Do This

**1. CLAUDE.md as Executable Specification**
Your CLAUDE.md is not documentation — it's an AI instruction set. It contains build commands, architecture decisions, naming conventions, feature status with exact test counts, and mandatory workflow rules. This is the single highest-leverage AI-first pattern: an AI drops into this repo and knows everything in one read. Most repos have a README that says "run npm start" and nothing else.

**2. Mandatory Review Agent System**
The two-agent feedback loop (plan-reviewer + code-reviewer) with severity levels, structured output formats, and "repeat until clean" semantics is genuinely novel. This is self-correcting AI development — the AI doesn't just write code, it reviews its own work through specialized lenses. The accumulating review files in `.claude/reviews/` create an audit trail. Very few projects have anything like this.

**3. Seed Dataset as Golden Reference**
34 real notes from "The Book of Why" used across all three interfaces (CLI, MCP, desktop). This is brilliant because:
- It's not synthetic test data — it has real-world messiness
- It covers all 10 note types and 15 edge types
- It includes negative cases (broken links, orphans)
- `LazyLock` initialization means tests are fast
- The copy-to-temp pattern keeps it pristine

**4. Single Core Library, Three Thin Interfaces**
`brainmap-core` is the single source of truth. CLI, MCP, and Tauri are all thin wrappers. An AI modifying business logic touches one place. An AI adding a new interface only needs to wire up calls. This is the cleanest version of this pattern I've seen — no logic leaks into the interfaces.

**5. Bridge Pattern for Frontend Testability**
`BrainMapAPI` interface → `TauriBridge` (real) or `MockBridge` (in-memory seed JSON). Frontend code never imports `@tauri-apps/api` directly. This means:
- 592 Vitest tests run without Tauri
- AI can test UI logic without a desktop environment
- Dev mode works with `npm run dev` alone

### Tier 2: Very Good — Best Practices Done Well

**6. Structured Error Handling**
`BrainMapError` enum with `error_code()` returning machine-readable strings. Every public API returns `Result<T>`. Response envelope pattern (`{success, data, error}`) across CLI and MCP. An AI can programmatically handle every error case.

**7. Structured Logging**
Namespace-first pattern (`"stores::graph"`, `brainmap_core::workspace`), NDJSON format, `BRAINMAP_LOG` env var with tracing filter syntax. Frontend logs forwarded to Rust backend. An AI debugging an issue can filter logs by subsystem instantly.

**8. TypeScript Types Matching Rust DTOs**
Hand-written `api/types.ts` with explicit sync comment pointing to `dto.rs`. Discriminated unions for events (`WorkspaceEvent`). The AI knows exactly what crosses the IPC boundary.

**9. Explicit MCP Tool Dispatch**
Manual `match name { "node_get" => ... }` instead of macro-based routing. An AI can see every tool in one place, understand the routing, and add new tools by pattern-matching existing ones.

**10. Test Organization**
Inline unit tests close to code, integration tests in `tests/`, frontend tests co-located with components. Consistent naming (`test_<action>_<scenario>`). Test setup file for browser API polyfills. ~730 total tests.

**11. Session Transcripts**
Auto-saving Claude Code transcripts to `.claude/transcripts/` via hooks. This creates institutional memory of development decisions — an AI in a future session could read past transcripts to understand why something was built a certain way.

### Tier 3: Solid — Good Foundation

**12. Zustand Store Pattern Consistency**
Every store follows: interface with state + actions → `create<State>((set, get) => ({...}))`. Loading states, error handling, reset methods. An AI learns the pattern once and replicates it.

**13. One-Function-Per-Command CLI Pattern**
Each CLI command is a single `execute()` function. Predictable signature, predictable flow (open workspace → call core → format output). Easy to add new commands.

**14. Newtype Pattern in Rust**
`RelativePath(String)`, `NoteId(Uuid)` — prevents mixing types. `resolve_relative()` on `RelativePath` makes path operations safe. An AI can't accidentally pass a raw string where a normalized path is expected.

**15. Comment Section Dividers**
`// ── Request DTOs ───` style dividers in `dto.rs` and similar files. These act as landmarks for AI navigation.

---

## What Could Be Upgraded (Ranked by Impact)

### High Impact

**1. Trunk-Based Safety Net**
Since this is a solo project committed directly to main, the risk isn't "PR review" — it's "AI broke something and you pushed before noticing." The safety net should match the workflow:
- **Pre-push git hook** that runs `cargo test` + `npm test` — blocks push if tests fail. Zero friction, catches regressions at the last moment before they leave your machine.
- **Post-commit hook** (optional, lighter) that runs `cargo check` + type-check only — fast feedback without full test suite.
- **`make verify` or `./check.sh` one-liner** that runs the full suite (cargo test + npm test + cargo check on app crate). Documented in CLAUDE.md so the AI always knows how to validate its work before committing.
- **Upgrade path**: Add a `scripts/check.sh` + git hooks via `.githooks/` directory with `git config core.hooksPath .githooks`

**2. Auto-Generate TypeScript Types from Rust**
The `types.ts` ↔ `dto.rs` sync is manual with a comment saying "kept in sync manually." When an AI adds a field to `NodeDto` in Rust, it must remember to update TypeScript.
- **Upgrade path**: Use `ts-rs` (lightweight, derive macro → `.ts` file) or `specta` (more features, integrates with Tauri). Add `#[derive(TS)]` to DTOs, `cargo test` regenerates `types.ts`. Add a check to `scripts/check.sh` that verifies generated types are up-to-date.

**3. Missing Architecture Decision Records (ADRs)**
CLAUDE.md captures *what* was built but not *why* alternatives were rejected. When an AI encounters "why not use X?" it has no record. For example:
- Why manual MCP dispatch instead of rmcp macros?
- Why Zustand over Redux/Jotai?
- Why hand-written types over codegen?
- **Upgrade path**: Add `docs/decisions/` with lightweight ADR format: `## Context → ## Decision → ## Consequences`

**4. No Property-Based or Fuzzy Testing**
All tests are example-based. The graph operations (add/remove node, move, rename) have complex invariants (backlink consistency, folder hierarchy, edge deduplication) that are perfect for property-based testing.
- **Upgrade path**: Add `proptest` for Rust (e.g., "for any sequence of add/remove/move operations, the graph remains consistent"), `fast-check` for TypeScript store operations

**5. AI-Accessible Desktop App Testing**
592 Vitest unit tests mock the API bridge, but nothing tests the real Tauri command → core library → response path. More importantly, the AI has no way to *see* or *interact with* the running app. The Chrome MCP layer was a good idea but didn't mature.
Three complementary approaches:
- **Tauri integration tests** (`tauri::test`): Test the Rust command → core → response path without a browser. Catches DTO serialization bugs, argument parsing errors, path traversal guards. The AI can run these like any other `cargo test`.
- **Playwright E2E tests**: Launch the real app, exercise key flows (open workspace, create note, edit, save, graph interaction). The AI can run and debug these. Slower but catches real integration issues.
- **Screenshot/DOM snapshot commands**: Add a Tauri command that dumps the current DOM or takes a screenshot to a file. The AI can invoke this via the MCP server or CLI to "see" the app state during debugging — a lightweight alternative to full Chrome MCP.
- **Upgrade path**: Start with Tauri integration tests (highest value/effort ratio), then Playwright for critical paths

### Medium Impact

**6. CLAUDE.md is Too Long**
At 31KB, CLAUDE.md contains the entire project history in the "Current Status" section. This works but has diminishing returns — an AI spends tokens parsing feature descriptions for completed work it won't modify.
- **Upgrade path**: Split into `CLAUDE.md` (conventions, build, architecture — things an AI needs for *any* task) + `docs/CHANGELOG.md` (completed feature descriptions) + keep review agent rules prominent at the top

**7. Canonical "How to Add X" Extension Guides**
An AI adding a new note type, edge type, CLI command, MCP tool, or Tauri command must reverse-engineer the pattern from existing code. This is the most cost-effective AI-first investment after CLAUDE.md — a 10-line checklist per extension point eliminates an entire class of AI mistakes (forgotten wiring, missing test, unsync'd DTO).

Extension points to document:
- **New note type**: model enum → parser → graph → seed example → CLI/MCP list → frontend icon/color → tests
- **New edge type**: model enum → parser → graph traversal → CLI/MCP filter → frontend graph style → tests
- **New CLI command**: `commands/` module → `cli.rs` arg parser → output formatting → integration test
- **New MCP tool**: `tools/` module → `server.rs` dispatch → tool listing → MCP test
- **New Tauri command**: `handlers.rs` fn → `commands.rs` wrapper → `main.rs` registration → DTO if needed → `bridge.ts` method → TypeScript type → frontend call
- **New Zustand store**: store file → reset in workspace close → snapshot in `SegmentSnapshot` → tests

Each guide should be a checklist with file paths, not prose. Format: `- [ ] Add variant to `NoteType` enum in `crates/core/src/model.rs:L42``
- **Upgrade path**: Add `docs/extension-guides/` with one `.md` per extension point

**8. Missing Error Recovery Patterns**
The error types are well-defined, but there's no documented pattern for "what should an AI do when it encounters error X?"
- **Upgrade path**: Add an error handling guide to CLAUDE.md: "FILE_NOT_FOUND → check path normalization first", "HAS_BACKLINKS → list backlinks and ask user before force-delete"

**9. No Workspace Invariant Assertions**
The graph has complex invariants (every `contains` edge source is a folder node, every folder node has a valid directory, no duplicate edges). These are maintained by convention, not enforced.
- **Upgrade path**: Add `Workspace::assert_invariants()` method that validates all structural properties. Run it in debug builds after every mutation. This catches AI-introduced bugs immediately.

### Lower Impact (But Worth Noting)

**10. Review Files Accumulate Without Cleanup**
`.claude/reviews/` grows forever. Old reviews for completed features add noise.
- **Upgrade path**: Add a convention to move reviews to `.claude/reviews/archive/` after merging, or auto-prune reviews older than N sessions

**11. No Visual Regression Testing**
The graph has complex visual behaviors (hulls, particles, animations, glassmorphism). These can't be caught by unit tests.
- **Upgrade path**: Chromatic or Percy for visual snapshot testing of key UI states

**12. Duplicate Information Between CLAUDE.md and docs/**
Some information exists in both places (data model, architecture). When an AI updates one, it may not update the other.
- **Upgrade path**: CLAUDE.md should reference docs/ sections rather than duplicating them: "See `docs/02-data-model.md` for the full schema"

---

## On RAG / Codebase Indexing

**Not recommended at this scale.** The codebase has ~730 tests, 4 crates, and a well-structured CLAUDE.md. Claude Code's built-in tools (Grep, Glob, Read) + CLAUDE.md give the AI what it needs — evidenced by the 90% first-try success rate.

RAG would add:
- Maintenance burden (re-index on every change, manage embeddings, chunking artifacts)
- Latency (embedding lookup before every query)
- False confidence (retrieved chunks may be stale or miss context)

RAG becomes worthwhile when: the codebase grows 10x, multiple AI agents work in parallel, or CLAUDE.md can no longer fit the essential context. At current scale, the **extension guides** (#7) would give 80% of RAG's discoverability benefit with zero infrastructure.

If you want to experiment: the MCP server already exposes the full graph + search index. An AI agent could query the MCP server to find related code — that's effectively a domain-specific RAG without the embedding overhead.
