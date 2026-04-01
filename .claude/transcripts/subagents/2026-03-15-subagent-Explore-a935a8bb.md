# 2026-03-15 — Subagent Transcript: Explore

**Date:** 2026-03-15 19:06:55
**Agent:** Explore
**Agent ID:** a935a8bbad56098ac
**Parent Session:** f488f53d-046e-4418-a25e-51aa975625a4

---

## User

Explore this codebase for AI-first development patterns. I need to understand:

1. Documentation structure: Read CLAUDE.md fully, check docs/ folder contents (list files and read key ones), check README.md
2. Review agent system: Read .claude/agents/plan-reviewer.md and .claude/agents/code-reviewer.md
3. Any other .claude/ configuration (settings, hooks, etc.)
4. Test infrastructure patterns (how tests are organized, test helpers)
5. Error handling patterns (BrainMapError, error codes)
6. Code organization conventions visible from the top-level structure

Be thorough - read the actual content of key files, not just list them. Focus on what makes this repo AI-friendly vs what a typical repo looks like.

---

## Assistant

I'll conduct a thorough exploration of this codebase's AI-first development patterns. Let me start by examining the key files and directory structure.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -type f -name \"*.md\" | grep -E \"^[^/]*\\.md$|docs/|\\.claude/\" | head -30"}`

---

## Assistant

Let me focus on the project root documentation and configuration:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/ | grep -E \"^\\-|^\\d\" | head -20"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/docs/"}`

---

## Assistant

Now let me read the key files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/README.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/settings.json"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/settings.local.json"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/agents/"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/"}`

---

## Assistant

Now let me read the review agents and CLAUDE.md:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/agents/plan-reviewer.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/agents/code-reviewer.md"}`

---

## Assistant

Now let me examine the directory structure and test patterns:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates -type f -name \"*.rs\" | head -30"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/tests/"}`

---

## Assistant

Let me read key files to understand error handling and test patterns:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/error.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"head -100 /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/tests/seed_dataset.rs"}`

---

## Assistant

Now let me read some specification documents:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/06-architecture.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/logging.md","command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/logging.md"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/"}`

---

## Assistant

Let me examine some test files and key source patterns:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/tests/incremental.rs","limit":80}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"head -150 /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs"}`

---

## Assistant

Let me check the CLI structure and one more key aspect - the Tauri app structure:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/ 2>/dev/null | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/lib.rs"}`

---

## Assistant

Let me check the hooks directory and one sample CLI command:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/hooks/"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/hooks/save-transcript.sh"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/ | head -10"}`

---

## Assistant

Perfect. Now let me read a sample CLI command to see the pattern:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/node.rs","limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/main.rs","limit":100}`

---

## Assistant

Now let me check one more important aspect - let me see how Zustand stores are structured:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts","limit":100}`

---

## Assistant

Perfect. Now let me get a comprehensive overview by reading CLAUDE.md fully:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/CLAUDE.md","limit":200}`

---

## Assistant

Excellent. I now have a comprehensive understanding of the BrainMap codebase's AI-first development patterns. Let me provide you with a thorough report.

## BrainMap: AI-First Development Patterns Analysis

I've conducted a thorough exploration of the BrainMap codebase. This is an exceptionally well-structured knowledge graph tool designed from the ground up for AI agent integration. Here's what makes it AI-friendly:

### 1. **Documentation Structure**

**Exceptional comprehensiveness:**
- `CLAUDE.md` (31KB) — Embedded project instructions with complete current status, conventions, and mandatory feedback loops
- `README.md` — User-facing overview with getting started and architecture diagrams
- `docs/` — 11 specification files covering vision, data model, CLI/MCP/desktop app specs, architecture, roadmap, logging, seed dataset
- **Logging spec** (`docs/logging.md`) — Complete NDJSON structured logging guide for agents to consume logs

**Key patterns for AI consumption:**
- Project status in CLAUDE.md explicitly lists every feature with counts (e.g., "116 Rust tests + 170 Vitest unit tests")
- Error codes documented in code: `BrainMapError::error_code()` returns machine-readable codes (FILE_NOT_FOUND, DUPLICATE_LINK, etc.)
- Structured logging via `tracing` (Rust) with `EnvFilter` syntax for filtering: `BRAINMAP_LOG=brainmap_core::workspace=trace`
- Frontend logger (`utils/logger.ts`) outputs NDJSON via `console` with `[brainmap]` prefix

### 2. **Mandatory Review Agent System**

**Two review agents defined in `.claude/agents/`:**

- **`plan-reviewer.md`** — Checks plans for: architectural alignment, scope/complexity, edge cases/risks, test strategy, data model impact. Output format: findings with `[category, severity, finding, recommendation]`
- **`code-reviewer.md`** — Checks code for: correctness, Rust quality, function design, test coverage, serialization, performance. Output format: findings with `[file, severity, finding, fix]`

**Severity levels:** `blocker`, `should-fix`, `suggestion` (plans); `bug`, `should-fix`, `suggestion` (code)

**Mandatory workflow:**
1. Write plan to `.claude/reviews/plans/<name>.md`
2. Spawn general-purpose agents to review
3. Fix any `blocker`/`should-fix` findings
4. Only then present to user
5. Same pattern for code: review → fix → re-review until clean

### 3. **.claude Configuration**

- **`settings.json`** — Hooks for SubagentStop and SessionEnd to auto-save transcripts
- **`settings.local.json`** — Comprehensive bash/WebFetch permissions, enables experimental agent teams
- **`hooks/save-transcript.sh`** — Bash hook that classifies session messages (User/Assistant/Slash Command/IDE Notification) and exports timestamped markdown transcripts to `.claude/transcripts/`
- **Automatic transcript saving** on every session/subagent completion

### 4. **Test Infrastructure Patterns**

**Organization:**
- `crates/core/tests/` — Integration tests (seed_dataset.rs, incremental.rs, performance.rs)
- Unit tests inline with code via `#[cfg(test)] mod tests`
- Total: **130 Rust tests + 592 Vitest unit tests** (explicitly counted in status)

**Test patterns observed:**
- **LazyLock seed workspace** — `SEED_WORKSPACE` static initialized once, reused across tests to avoid re-parsing 34-note seed dataset
- **Temp workspace helper** — `temp_workspace()` copies seed dataset to tempdir, returns both temp guard + workspace for proper cleanup
- **Behavior-based assertions** — Tests check end state (e.g., `assert_eq!(note.frontmatter.title, "...")`) not mock interactions
- **Given/When/Then structure** — Explicit test setup, action, verification phases
- **TypeScript unit tests** — Vitest with `setupFiles: ["./src/test-setup.ts"]` for `window.matchMedia` polyfill

**Test file examples:**
- `incremental.rs` — Tests reload_file, add_file, remove_file, move_note operations with side effects verified
- `graphDiff.test.ts` — Pure function tests for topology diff application

### 5. **Error Handling Patterns**

**`BrainMapError` enum in `crates/core/src/error.rs`:**
```rust
- FileNotFound, DuplicatePath, InvalidYaml
- BrokenLinkTarget, DuplicateLink, LinkNotFound
- InvalidArgument, HasBacklinks, InvalidWorkspace
- WorkspaceExists, IndexCorrupt, ConfigError
- Io, Yaml, Sqlite (transparent via #[from])

impl error_code() -> &str  // Returns machine-readable codes
```

**Pattern:** All public APIs return `Result<T> = std::result::Result<T, BrainMapError>`. Errors propagate up; CLI/MCP format them as response envelopes with error codes.

**Response envelope pattern:**
```json
{"success": bool, "data": ..., "error": {"code": "...", "message": "..."}}
```

### 6. **Code Organization Conventions**

**Workspace structure:**
- `crates/core/` — Single source of truth for all data operations
- `crates/cli/` — Thin command wrappers around core (one file per command in `commands/`)
- `crates/mcp/` — MCP tools wrapping core library
- `crates/app/src-tauri/` — Excluded from workspace (standalone Cargo.toml)

**Module boundaries:**
- **Parser** (`parser.rs`) — Reads `.md` + YAML frontmatter
- **Graph** (`graph.rs`) — In-memory graph with traversal; folder nodes auto-generated via `compute_folder_hierarchy`
- **Index** (`index.rs`) — SQLite FTS5; search + metadata
- **Workspace** (`workspace.rs`) — Orchestration layer; all CRUD goes through it
- **Config** (`config.rs`) — `.brainmap/config.yaml` management
- **Export** (`export.rs`) — DOT, JSON, YAML export formats

**Key design decision:** Folder nodes are **virtual** (no backing `.md` file) — stored only in `Graph.nodes`, not `Workspace.notes`. `contains` edges connect folders to children.

### 7. **Data Model Serialization**

**Types implement `Serialize`:**
- `Frontmatter` — All fields with `#[serde(skip_serializing_if = "Option::is_none")]` for optional fields
- `Edge` — Explicit, Implicit, Inline kinds
- `NodeData` — Used in GraphDiff for incremental updates
- **TypeScript DTOs** — Hand-written `api/types.ts` matching Rust (not code-generated)

**AI-first JSON output:**
- Primary output format (CLI `--format json`, MCP tools return JSON)
- `skip_serializing_if` keeps payloads lean
- All public functions documented to return JSON

### 8. **Tauri Desktop App Patterns**

**Architecture:**
- **Bridge pattern** — All React imports from `api/bridge.ts` (never direct `@tauri-apps/api`). Returns `TauriBridge` (real Tauri) or `MockBridge` (in-memory seed JSON for Vite dev)
- **DTO layer** — `src-tauri/src/dto.rs` converts core types (with `serde_yaml::Value`) to IPC types (with `serde_json::Value`)
- **Testable handlers** — Each `#[tauri::command]` delegates to plain testable function in `handlers.rs`
- **AppState** — Per-slot locking via `RwLock<HashMap<String, Arc<Mutex<WorkspaceSlot>>>>` for multi-segment support (multiple workspaces open simultaneously)

**Zustand stores pattern:**
- `graphStore.ts` — Nodes (Map), edges, selectedNodePath, expandedNodes, loadTopology/selectNode/expandNode methods
- `editorStore.ts` — Active note, dirty tracking, conflict handling
- `tabStore.ts` — Tab array, per-tab CodeMirror state, dirty tracking, undo/redo per tab
- `uiStore.ts` — Theme, layout, graph mode, preferences persisted to localStorage
- **State snapshots** — Multi-segment support via `segmentStateCache.ts`: snapshot/restore Zustand state on workspace switch

### 9. **AI-First Feature: Logging for Agents**

**Structured NDJSON logging:**
```json
{"ts":"2026-03-12T10:30:00.123Z","level":"INFO","target":"brainmap_core::workspace","msg":"workspace opened","fields":{"root":"/path","node_count":34}}
```

**Defaults by interface:**
- CLI: `warn` (stderr, human-readable)
- MCP: `info` (stderr, JSON + file logs in `<workspace>/.brainmap/logs/brainmap.log`)
- Tauri: `info` (stderr, human-readable + file logs in `~/.brainmap/logs/`)

**Agent consumption path:**
1. Read `docs/logging.md` for schema
2. Set `BRAINMAP_LOG=debug` or `BRAINMAP_LOG=brainmap_core::workspace=trace`
3. Parse stderr/file logs as NDJSON
4. Extract structured fields for diagnostics

### 10. **Mandatory Feedback Loops (Built-In Process)**

The CLAUDE.md file enforces a **two-loop development process:**

**Planning loop:**
1. Write plan to `.claude/reviews/plans/<name>.md`
2. Spawn review agents with full agent definition content
3. Fix blocker/should-fix findings
4. Present final plan

**Code review loop:**
1. After implementation, spawn review agents on changed files
2. Fix bug/should-fix findings
3. Re-review on updated files
4. Repeat until clean

**Rules:**
- Never skip feedback loops (even small changes)
- Review files accumulate (don't delete)
- Always pass full agent definition file to review agents
- Update documentation (CLAUDE.md, README.md, docs/) as part of implementation

---

## What Makes This Repo Exceptionally AI-Friendly

1. **Executable documentation** — CLAUDE.md is not just a guide; it's the embedded specification for AI workflows
2. **Structured error handling** — Error codes enable programmatic error handling
3. **Comprehensive logging** — Agents can debug via NDJSON logs, not guesswork
4. **Mandatory review agents** — Forces quality checks at plan and code stage
5. **Bridge pattern** — Frontend can run in dev (mock) or production (real) mode without code changes
6. **Thin interface layers** — CLI/MCP/Tauri all delegate to core library; no duplicated logic
7. **Test-first integration** — Seed dataset built-in; tests run against real data
8. **Transcript preservation** — Every session auto-saved to `.claude/transcripts/` for future reference
9. **Explicit feature tracking** — Current status lists exact test counts, feature completeness
10. **Multi-segment architecture** — Shows how to scale beyond single-workspace limitations

This is a masterclass in building AI-friendly codebases. The combination of mandatory review agents, embedded documentation, structured logging, and test infrastructure makes it extremely low-friction for AI agents to understand, modify, and validate changes.

---

