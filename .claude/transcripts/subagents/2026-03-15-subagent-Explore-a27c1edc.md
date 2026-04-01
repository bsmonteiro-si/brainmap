# 2026-03-15 — Subagent Transcript: Explore

**Date:** 2026-03-15 19:06:47
**Agent:** Explore
**Agent ID:** a27c1edc767dc87b7
**Parent Session:** f488f53d-046e-4418-a25e-51aa975625a4

---

## User

Explore this codebase for specification and testing patterns:

1. Read docs/ - list all files and read 2-3 key spec files (especially any architecture or data model docs)
2. Check test organization: look at crates/core/tests/ directory, read one integration test file
3. Check frontend test patterns: find and read one .test.ts or .test.tsx file
4. Look at the seed/ dataset - what's in it, how is it used for testing
5. Check for any CI/CD configuration, Makefile, or build scripts
6. Look at package.json and Cargo.toml for tooling setup

Focus on: how specs drive implementation, test coverage strategy, reproducibility, seed data approach.

---

## Assistant

I'll explore this codebase systematically to understand the specification and testing patterns. Let me start with a comprehensive search.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/docs -type f -name \"*.md\" | head -20"}`

---

## Assistant

Now let me read the key documentation files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/06-architecture.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/02-data-model.md"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/tests/ | head -30"}`

---

## Assistant

Now let me read integration test examples and check test structure:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/tests/seed_dataset.rs"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"*.test.ts*\" | head -5"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/seed/ | head -20"}`

---

## Assistant

Let me read a frontend test file and check the build/CI setup:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.test.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/Cargo.toml"}`

---

## Assistant

Now let me check for CI/CD configuration and build scripts:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -type f \\( -name \".github\" -o -name \"*.yml\" -o -name \"*.yaml\" -o -name \"Makefile\" -o -name \"justfile\" \\) | grep -E \"(github|Ma`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap | grep -E \"^\\.\""}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/Cargo.toml","limit":80}`

---

## Assistant

Let me check the seed dataset structure and read one more key test:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/seed -type f -name \"*.md\" | wc -l"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/tests/incremental.rs","limit":120}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"head -50 /Users/bsmonteiro/Desktop/Personal/brainmap/seed/example.md"}`

---

## Assistant

Let me check one more frontend test pattern and gather final details:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"head -80 /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CreateNoteDialog.test.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/vitest.config.ts"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cat /Users/bsmonteiro/Desktop/Personal/brainmap/seed/.brainmap/config.yaml | head -50"}`

---

## Assistant

Perfect! Now let me check for any additional architectural insights:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/docs -name \"*.md\" -type f | xargs grep -l \"test\\|Test\\|spec\" | head -5"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/08-seed-dataset.md","limit":100}`

---

## Assistant

Excellent! Now I have comprehensive data. Let me compile my findings into a clear report.

## Summary: BrainMap Specification and Testing Patterns

I've completed a thorough exploration of the BrainMap codebase. Here are the key findings organized by your request:

---

### 1. DOCUMENTATION STRUCTURE

**Documentation files** (`/docs/`):
- `01-vision.md` — Product vision and goals
- `02-data-model.md` — Core data structures, frontmatter schema, 10+ note types, 15 edge types, implicit edge rules, path normalization
- `03-cli-spec.md` — CLI interface (21 commands + 3 aliases: `ls`, `new`, `s`)
- `04-mcp-spec.md` — MCP server spec (24 tools + 3 resources over stdio)
- `05-desktop-app.md` — Tauri v2 + React UI (graph rendering, editor, search, settings)
- `06-architecture.md` — System design: core library → 3 interfaces (CLI, desktop, MCP)
- `07-roadmap.md` — Phases and milestones
- `08-seed-dataset.md` — ~33-35 note reference dataset from "The Book of Why"
- `09-spec-gaps.md` — Known gaps and planned features
- `10-ux-improvements.md` — Phase 1c enhancements
- `logging.md` — Structured logging via `tracing` (Rust) and custom NDJSON (TypeScript)

**Key architectural docs**: The architecture and data model specs are the driver — implementation follows them closely and tests validate against them.

---

### 2. TEST ORGANIZATION

**Rust Tests** (124 total):
- **Location**: `/crates/core/tests/` (integration) + inline unit tests in source
- **Categories**:
  - **Seed dataset tests** (8): `seed_dataset.rs` validates workspace opens, all note types present, validation catches broken links, folder hierarchy works, federation warnings appear
  - **Incremental tests** (5): `incremental.rs` tests `reload_file`, `add_file`, `remove_file` operations with temp copies of seed dataset
  - **Performance tests** (1): `performance.rs` benchmarks
  - **Core unit tests** (40+): Scattered across source modules
  - **CLI integration tests** (33): `crates/cli/tests/`
  - **MCP tests** (28 tool + 9 resource = 37): `crates/mcp/tests/` or inline

**Frontend Tests** (592 total vitest unit tests):
- **Location**: `*.test.ts` and `*.test.tsx` files co-located with components/stores
- **Example files**:
  - `/crates/app/src/stores/editorStore.test.ts` — 54 tests, Zustand store mutations
  - `/crates/app/src/components/Editor/CreateNoteDialog.test.tsx` — 23+ tests, component rendering + API mocks
  - `/crates/app/src/stores/undoStore.test.ts`, `graphStore.test.ts`, etc.

**Test Configuration**:
- **Frontend**: `vitest.config.ts` uses jsdom environment + `setupFiles: ["./src/test-setup.ts"]` (polyfills `window.matchMedia`)
- **Rust**: No special runner — standard `cargo test` with `tempfile` for filesystem isolation

---

### 3. SEED DATASET STRATEGY

**Path**: `/seed/` (35 markdown files)

**Purpose** (from spec):
1. Implementation reference — real data to build/test against
2. Schema validation — proves frontmatter spec, edge types, hybrid directory structure work
3. UI development — diverse node types, edge types, realistic graph topology
4. CLI/MCP testing — actual queries to run (paths, neighborhoods, search)
5. Negative testing — intentional broken links, orphan checks, federation stubs

**Structure**:
- ~33-35 notes from "The Book of Why" by Judea Pearl
- 10 note types (all defined types used at least once): concept, book-note, question, reference, index, argument, evidence, experiment, person, project
- Organized in directories: `The Book of Why/`, `Concepts/`, `People/`, `Arguments/`, `Evidence/`, `Experiments/`, `Projects/`, `Questions/`
- Includes negative cases: deliberate broken link (`Concepts/Deleted Note.md`), federation stubs, isolated nodes for testing

**Test Usage**:
- Seed workspace loaded once at test start via `LazyLock<Mutex<Workspace>>`
- Incremental tests copy seed to temp directory (via `copy_dir_recursive`) to avoid mutations
- Reusable across phases (core → CLI → MCP → desktop app all validate against same seed)

---

### 4. SPECIFICATION DRIVING IMPLEMENTATION

**Pattern**: Specs are normative; tests validate conformance.

**Examples**:

1. **Data Model Spec → Tests**
   - Spec defines: 10 note types, 15 edge types, implicit `contains` edges from directory structure
   - Seed dataset instantiates all types
   - Tests verify: `test_seed_all_note_types_present()`, `test_seed_folder_nodes_exist()` (validates folder node auto-generation)

2. **Architecture Spec → CLI/MCP Contract**
   - Spec defines response envelope: `{"success": bool, "data": ..., "error": {...}}`
   - CLI commands return JSON (AI-first) or text (secondary)
   - Tests validate structure

3. **Frontend UI Spec → Vitest Unit Tests**
   - Spec defines: tabs, editor with metadata, graph layouts, settings modal
   - Tests mock API bridge (`vi.mock("../api/bridge")`) and validate store mutations, rendering, event handlers
   - `setupFiles: ["./src/test-setup.ts"]` polyfills browser APIs needed by UI code

---

### 5. CI/CD & BUILD INFRASTRUCTURE

**No GitHub Actions found** — this is a local development project.

**Build Setup**:
- **Cargo.toml** (workspace root): edition 2021, resolver v2, members: `crates/{core,cli,mcp}`, excludes `crates/app/src-tauri`
- **App crate**: Standalone Cargo.toml in `crates/app/src-tauri/`, separate from workspace (per CLAUDE.md: "Phase 1c: not yet complete")
- **package.json scripts**:
  - `npm test` → `vitest run` (frontend unit tests)
  - `npm run dev` → `vite --port 1420` (dev server)
  - `cargo test` → runs all 124 Rust tests + 592 frontend tests

**Build Notes** (from MEMORY.md):
- Cargo not in default PATH, needs `export PATH="$HOME/.cargo/bin:$PATH"`
- `npm` needs `--cache /tmp/npm-cache` flag (EACCES on default cache)
- Run `cargo check` from `crates/app/src-tauri/` to check app crate independently

---

### 6. REPRODUCIBILITY & TESTING PATTERNS

**Reproducibility Strategy**:
- **Seed dataset as golden reference** — all integration tests start from known state
- **Temp directories for mutations** — incremental tests copy seed, mutate in temp, verify diff without polluting original
- **Mocking for unit tests** — frontend tests mock API bridge, stores; Rust tests use `tempfile` for isolation
- **Deterministic results** — graph layout uses `randomize: false` in Cytoscape (same topology → same layout)

**Key Patterns**:

| Layer | Pattern | Example |
|-------|---------|---------|
| **Integration** | Seed dataset + temp copy + mutations | `incremental.rs`: copy seed, modify file, call `reload_file()`, assert diff |
| **Unit (Rust)** | Inline tests with fixtures | Core library tests use small hand-crafted graphs |
| **Unit (Frontend)** | Mock API + mock stores + render | `editorStore.test.ts`: mock `readNote`, assert Zustand state changes |
| **E2E (conceptual)** | Desktop app against real workspace | Not automated; manual testing or CI would add this |

---

### 7. DOCUMENTATION MAINTENANCE

**From CLAUDE.md** (mandatory practices):
- Every implementation plan MUST include a step to review and update docs
- Docs updated after changes: `CLAUDE.md` for project structure/status, `README.md` for user-facing changes, `docs/*.md` for spec divergences
- Docs accumulated in `/docs/` and `.claude/reviews/` during development
- Review agents check implementation against specs before finalizing

---

### 8. TEST COVERAGE SUMMARY

| Component | Count | Strategy |
|-----------|-------|----------|
| **Core library** | 40 unit + 8 seed + 5 incremental + 1 perf | Seed dataset validates all types/edges; incremental tests file ops; unit tests parser/graph/index |
| **CLI** | 33 integration | Commands invoke handlers against temp seed copies |
| **MCP** | 28 tool + 9 resource = 37 | Manual tool dispatch with mock state |
| **Desktop (Rust)** | Inline in `src-tauri/src/` | Thin Tauri command wrappers tested via handlers in isolation |
| **Desktop (React)** | 592 vitest | Store mutations (Zustand), component rendering (React Testing Library), API mocks |
| **Total** | ~730 tests | Fast local feedback; seed reusable across all layers |

---

### KEY INSIGHTS

1. **Specs drive implementation**: Data model, architecture, and CLI specs are written before code. Tests validate conformance.

2. **Seed dataset is a core asset**: 33-35 notes serve as golden reference for all three interfaces (CLI, MCP, desktop). Used in 8 dedicated seed tests + every integration test.

3. **Temp-and-copy pattern**: Incremental tests preserve seed by copying to temp, mutating there, verifying diff. Keeps seed pristine for reproducibility.

4. **Mock-heavy frontend testing**: React components and stores use comprehensive mocks of API bridge and sister stores. Enables fast unit tests without Tauri.

5. **Single core library**: All interfaces consume the same Rust core (`brainmap_core`). Testing core thoroughly with seed dataset gives high confidence across CLI, MCP, and desktop app.

6. **Documentation is living**: `CLAUDE.md`, spec docs, and review files accumulate during development. After Phase 1c completion, CLAUDE.md tracks all architecture decisions, status, and conventions.

---

