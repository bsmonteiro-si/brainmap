# 2026-03-30 — Subagent Transcript: vitest-auditor

**Date:** 2026-03-30 11:18:09
**Agent:** vitest-auditor
**Agent ID:** a6c71ee1cd320f6e0
**Parent Session:** ebc177e8-843f-444f-b692-d0ab712e99b3

---

## User

<teammate-message teammate_id="team-lead" summary="Audit Vitest test coverage">
You are the **Vitest test auditor** on team `test-coverage-audit`. Your task is #2: "Audit Vitest test coverage in crates/app/src/".

## What to do

1. Search all test files under `crates/app/src/` (files matching `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`).
2. Count every test case (`it(`, `test(`, `describe(`). Categorize them by:
   - **Directory/area** (e.g., components, stores, utils, hooks, etc.)
   - **Category** (component tests, store tests, utility tests, hook tests, integration tests, etc.)
3. List counts per directory and per category.
4. Note any areas that seem to have thin or no test coverage.
5. Mark task #2 as completed when done.
6. **Send your full findings to `rust-auditor`** so they can incorporate them into the combined summary.
7. After sending findings, check TaskList. If task #3 is unblocked and unowned, claim it and produce the combined summary by combining your findings with the rust-auditor's findings. Write the summary to the console output. The summary should compare backend vs frontend coverage, highlight strengths and gaps.

Be thorough — use Grep and Glob tools. Count precisely.
</teammate-message>

---

## Assistant



I'll audit all Vitest test files under `crates/app/src/` and categorize them.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.test.{ts,tsx}"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.spec.{ts,tsx}"}`

---

## Assistant

Found 63 test files. Now let me count the test cases in each file. I'll do this in batches by area.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\b(it|test)\\s*\\(","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor","glob":"*.test.{ts,tsx}","output_mode":"count","head_limit":0}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\b(it|test)\\s*\\(","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores","glob":"*.test.{ts,tsx}","output_mode":"count","head_limit":0}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\b(it|test)\\s*\\(","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils","glob":"*.test.{ts,tsx}","output_mode":"count","head_limit":0}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\b(it|test)\\s*\\(","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/hooks","glob":"*.test.{ts,tsx}","output_mode":"count","head_limit":0}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\b(it|test)\\s*\\(","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api","glob":"*.test.{ts,tsx}","output_mode":"count","head_limit":0}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\b(it|test)\\s*\\(","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView","glob":"*.test.{ts,tsx}","output_mode":"count","head_limit":0}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\b(it|test)\\s*\\(","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout","glob":"*.test.{ts,tsx}","output_mode":"count","head_limit":0}`

---

## Assistant

### Tool Calls

- **ToolSearch**: `{"query":"select:TaskUpdate,SendMessage","max_results":2}`

---

## Assistant



Now let me also check for source files that have NO corresponding test files, to identify coverage gaps.

---

## Assistant

### Tool Calls

- **TaskUpdate**: `{"taskId":"2","status":"in_progress","activeForm":"Auditing Vitest test coverage"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/*.{ts,tsx}"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/stores/*.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/utils/*.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/hooks/*.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/api/*.ts"}`

---

## Assistant

Now let me check for source files without tests and get the `describe(` counts.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\bdescribe\\s*\\(","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","glob":"*.test.{ts,tsx}","output_mode":"count","head_limit":0}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/*.{ts,tsx}"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Settings/*.{ts,tsx}"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Canvas/*.{ts,tsx}"}`

---

## Assistant

Now I have enough data. Let me also check for E2E tests.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"tests/e2e/**/*.test.{ts,tsx}"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"tests/e2e/**/*.{ts,tsx}"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"tests/e2e/src/**/*.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"tests/e2e/*.test.ts"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/tests/e2e/ 2>/dev/null | head -20","description":"List E2E test directory contents"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\b(it|test)\\s*\\(","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/tests/e2e/file-tree.spec.ts","output_mode":"count"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\b(it|test)\\s*\\(","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/tests/e2e","glob":"*.spec.ts","output_mode":"content"}`

---

## Assistant

Good. Now I have all the data I need. Let me compile the findings and send them.

---

## Assistant

### Tool Calls

- **TaskUpdate**: `{"taskId":"2","status":"completed"}`

---

## Assistant

### Tool Calls

- **SendMessage**: `{"to":"rust-auditor","summary":"Vitest audit complete, full findings","message":"Here are my complete Vitest test coverage findings for crates/app/src/:\n\n## Summary\n\n- **63 unit test files** + **1`

---

## Assistant

Now let me check if task #3 is available for me to claim.

---

## Assistant

### Tool Calls

- **ToolSearch**: `{"query":"select:TaskList","max_results":1}`

---

## Assistant

### Tool Calls

- **TaskList**: `{}`

---

## Assistant

Task #3 is already claimed by rust-auditor. My work is done — I've completed the Vitest audit and sent the full findings to rust-auditor so they can produce the combined summary.

---

## User

<teammate-message teammate_id="team-lead">
{"type":"task_assignment","taskId":"2","subject":"Audit Vitest test coverage in crates/app/src/","description":"Count and categorize all Vitest tests in the frontend codebase under crates/app/src/. Categorize by: component tests, store tests, utility tests, etc. List counts per directory/area. Share findings with the backend auditor.","assignedBy":"team-lead","timestamp":"2026-03-30T14:15:16.989Z"}
</teammate-message>

---

## Assistant

Task #2 is already completed. I finished the full Vitest audit and sent the findings to rust-auditor. Here's what I found:

- **63 unit test files**, **1,001 test cases**, **216 describe blocks**
- Breakdown: Editor (585), Stores (257), Utils (129), Layout (38), GraphView (32), Hooks (27), API (3), E2E (2)
- Key gaps: ~27 React component files with no tests, 2 store action files untested, E2E is nascent (2 tests)

The detailed findings have already been sent to rust-auditor for the combined summary (task #3).

---

## User

<teammate-message teammate_id="rust-auditor" color="blue" summary="Complete Rust test audit findings">
Here are the complete Rust test audit findings for the combined summary:

## Rust Test Coverage Audit — 169 total tests

### crates/core (brainmap-core) — 71 tests
**Unit tests (47)** in `#[cfg(test)]` modules:
- `src/workspace.rs`: 16 tests (init, open, validate, create/delete folder nodes, convert plain md)
- `src/graph.rs`: 10 tests (add/get node, neighbors, shortest path, orphans, cycles, folder hierarchy)
- `src/model.rs`: 6 tests (path normalization, resolve, parent, is_folder, humanize)
- `src/parser.rs`: 6 tests (parse concept, links, inline links, frontmatter, round-trip, skip non-md)
- `src/index.rs`: 4 tests (add/search, remove/search, backlinks, staleness)
- `src/config.rs`: 3 tests (default, round-trip, register type)
- `src/export.rs`: 2 tests (xml_escape, dot_escape)

**Integration tests (24)** in `tests/`:
- `tests/incremental.rs`: 14 tests (reload, add, remove file; move note/folder with backlinks, folder nodes)
- `tests/seed_dataset.rs`: 9 tests (workspace opens, note types, validation, orphans, folder nodes, search, edges)
- `tests/performance.rs`: 1 test (500-node load benchmark)

**Untested modules**: `error.rs` (type defs only), `lib.rs` (re-exports), `logging.rs`

### crates/cli — 33 tests
All integration tests in `tests/cli_integration.rs`:
- Node CRUD (read, list, create, update, delete, move): 11 tests
- Search: 2 tests
- Links (create, list, delete): 3 tests
- Graph (neighbors, path, subgraph): 5 tests
- Misc (validate, stats, status, export, reindex, config, federation): 8 tests
- Output formats (text, YAML, JSON): 4 tests

**No unit tests** in any CLI source module (commands/, output.rs, main.rs)

### crates/mcp — 37 tests
**Integration tests in `tests/`:**
- `tests/tool_tests.rs`: 28 tests (all 24 tools tested + batch, clear_fields, reindex, unknown tool)
- `tests/resource_tests.rs`: 9 tests (list resources, read node/graph/config, unknown URI, capabilities)

**No unit tests** in any MCP source module (server.rs, tools/*.rs)

### crates/app (Tauri backend) — 14 tests
**Unit tests in `#[cfg(test)]` modules:**
- `src/handlers.rs`: 13 tests (deduplicate_name: 5 tests, import_files: 8 tests)
- `src/dto.rs`: 1 test (export_ts_bindings)

**Untested modules**: commands.rs, state.rs, watcher.rs, dock_menu.rs, main.rs, lib.rs

### crates/tauri-plugin — 0 tests

---

## Coverage Gaps (thin/no coverage)

1. **crates/app state.rs** — per-slot locking (`RwLock<HashMap<String, Arc<Mutex<WorkspaceSlot>>>>`) has zero tests. This is critical concurrency code.
2. **crates/app watcher.rs** — file watcher logic untested.
3. **crates/app commands.rs** — Tauri command wrappers untested (thin wrappers, lower priority).
4. **crates/core logging.rs** — no tests.
5. **crates/tauri-plugin** — entire crate untested.
6. **CLI command modules** — no unit tests for any of the 13 command modules (covered by integration tests, but no isolated unit testing).
7. **MCP server.rs** — dispatch logic untested at unit level (covered by integration tests).

## Summary Table

| Crate | Unit | Integration | Total |
|-------|------|-------------|-------|
| core  | 47   | 24          | 71    |
| cli   | 0    | 33          | 33    |
| mcp   | 0    | 37          | 37    |
| app   | 14   | 0           | 14    |
| tauri-plugin | 0 | 0       | 0     |
| **Total** | **61** | **94** | **155** |

Note: I initially counted 169 but the precise count is **155 Rust tests total** after careful recount (47+24+33+37+14+0).
</teammate-message>

---

## Assistant



Good, I have the Rust findings from rust-auditor. Let me check if task #3 is still available for me to claim.

---

## Assistant

### Tool Calls

- **TaskList**: `{}`

---

## Assistant

Task #3 is already owned by rust-auditor. My work is complete — I've delivered the Vitest audit findings and rust-auditor has received them for the combined summary.

---

