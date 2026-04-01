# 2026-03-12 — Subagent Transcript: Plan

**Date:** 2026-03-12 12:19:48
**Agent:** Plan
**Agent ID:** ab54742e1b351be9a
**Parent Session:** a7fdd44d-3b6c-4d45-a577-1a23dfcdefa7

---

## User

Design an AI-agent-friendly logging system for BrainMap, a Rust workspace with four crates (core, cli, mcp, app/src-tauri) plus a React/TypeScript frontend.

## Current State (from exploration)
- **No logging framework** — only `eprintln!` in Rust and `console.error()` in TS
- **14-variant BrainMapError** enum with `error_code()` method returning strings like "FILE_NOT_FOUND"
- **Response envelope pattern**: `{"success": bool, "data": ..., "error": {"code": ..., "message": ...}}`
- CLI has `--format text|json|yaml` and `--quiet` flags
- MCP server communicates over stdio (stdout is reserved for MCP protocol)
- Tauri app backend has sparse `eprintln!` in file watcher
- Frontend has inline `console.error()` calls, no structured logging
- No log files, no log levels, no configuration, no documentation

## Requirements
- **AI-first**: Logs must be easily parseable by AI agents (structured JSON, consistent schema)
- **Multi-interface**: Core, CLI, MCP, and Desktop app all share the same core library
- **MCP constraint**: stdout is reserved for MCP protocol; logs must go to stderr or file
- **File-based persistence**: Logs should be written to a known file location so agents can read them
- **Agent documentation**: Docs must tell new agents where logs are and how to use them
- **Minimal overhead**: This is a personal tool, not enterprise — keep it simple

## Design Constraints
- Rust side: prefer `tracing` crate (industry standard, structured, configurable sinks)
- Frontend: simple structured logger wrapping console methods
- Log file location: workspace-relative (e.g., `.brainmap/logs/`) or a known temp path
- Schema: each log line is a JSON object with at minimum `{timestamp, level, target, message, fields}`
- Levels: error, warn, info, debug, trace — configurable via env var or config
- Log rotation: keep it simple (single file, truncate at reasonable size, or daily rotation)

Please produce a detailed implementation plan covering:
1. Rust logging setup (tracing + subscribers for each interface)
2. Frontend logging utility
3. Log file location and rotation strategy
4. Configuration (env vars, config file)
5. Documentation updates (CLAUDE.md, docs/, README)
6. What specific operations should be logged at each level
7. File list with what changes are needed in each

---

## Assistant



I'll explore the codebase to understand the current state before designing the logging system.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"eprintln!","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"console\\.(error|warn|log|info)","output_mode":"files_with_matches","glob":"*.{ts,tsx}"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/main.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/output.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs"}`

---

## Assistant

Now let me look at the error enum and the MCP server structure.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/error.rs"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub mod|pub use","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/lib.rs","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/server.rs","limit":60}`

---

## Assistant

Let me look at a few more files to understand the frontend and the config structure.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/config.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/stores/*.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/api/*.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs","offset":60}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/src/*.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/server.rs","offset":60,"limit":60}`

---

## Assistant

Let me check the Tauri app main/lib setup and the serve command.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"fn execute","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands","output_mode":"content","glob":"serve.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/cli/src/commands/serve.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/serve.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts","limit":40}`

---

## Assistant

Now let me check the workspace BRAINMAP_DIR constant usage and how workspace root is resolved, to understand where logs would go.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"BRAINMAP_DIR|\\.brainmap","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/utils/*.ts"}`

---

## Assistant

I now have a thorough understanding of the codebase. Here is the complete implementation plan.

---

## Implementation Plan: AI-Agent-Friendly Logging System for BrainMap

### 1. Overview and Design Decisions

**Core choice**: Use the `tracing` + `tracing-subscriber` ecosystem on the Rust side. This is the Rust community standard, supports structured JSON output natively, and can fan out to multiple sinks (stderr, file) simultaneously via layers. On the frontend, a thin `logger.ts` utility wrapping `console` methods with the same JSON schema.

**Log file location**: `<workspace_root>/.brainmap/logs/brainmap.log`. This is the natural place because `.brainmap/` already holds `config.yaml` and `index.db`. For MCP and CLI where the workspace may not be opened yet (or for pre-open logging), fall back to stderr only. The Tauri app always has a workspace open before meaningful operations occur, so workspace-relative is fine.

**Log schema** (one JSON object per line, NDJSON):
```json
{"ts":"2026-03-12T10:30:00.123Z","level":"INFO","target":"brainmap_core::workspace","msg":"workspace opened","fields":{"root":"/path/to/ws","node_count":34,"edge_count":52},"span":{"name":"open","workspace":"/path/to/ws"}}
```

**Rotation**: Simple size-based rotation. When the log file exceeds 5 MB, rename to `brainmap.log.1` (overwriting any previous `.1`). This keeps at most ~10 MB on disk. Use `tracing-appender` for file writing but implement rotation manually (tracing-appender's built-in rotation is daily, which is overkill for a personal tool; a custom `MakeWriter` or a post-write check is simpler).

Actually, `tracing-appender` provides `RollingFileAppender` with `Rotation::NEVER` plus a max-size check is not built-in. The simplest approach: use `tracing-appender::non_blocking` with a custom writer that does size-check rotation, or just use `Rotation::DAILY` and keep 3 days. Given "keep it simple" constraint, use `Rotation::DAILY` with prefix `brainmap` and keep the last 3 log files via a cleanup on init.

**Revised rotation decision**: Use `tracing-appender::rolling::RollingFileAppender` with `Rotation::DAILY`, directory `.brainmap/logs/`, file prefix `brainmap`, suffix `.log`. On workspace open, delete log files older than 3 days. This is 5 lines of code and zero custom logic.

### 2. Rust Dependencies to Add

**Workspace-level** (in root `Cargo.toml` `[workspace.dependencies]`):
```toml
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["json", "env-filter"] }
tracing-appender = "0.2"
```

**Per-crate**:
- `brainmap-core`: `tracing` (instrument key functions)
- `brainmap` (CLI): `tracing`, `tracing-subscriber`, `tracing-appender`
- `brainmap-mcp`: `tracing`, `tracing-subscriber`, `tracing-appender`
- `brainmap-app` (Tauri): `tracing`, `tracing-subscriber`, `tracing-appender`

### 3. Step-by-Step Implementation

#### Step 1: Add `tracing` instrumentation to `brainmap-core`

The core library should **not** initialize any subscriber. It only emits tracing events. The consuming crate (CLI, MCP, Tauri) decides where logs go.

**File: `crates/core/Cargo.toml`** -- add `tracing = "0.1"` to `[dependencies]`.

**File: `crates/core/src/workspace.rs`** -- Add `#[instrument]` and `tracing::{info, warn, error, debug, trace}` calls at key points:

- `Workspace::init()` -- `info!(path = %path.display(), "initializing workspace")`
- `Workspace::open()` -- `info!(path = %path.display(), "opening workspace")` at entry; `info!(node_count, edge_count, "workspace loaded")` at end
- `Workspace::load_from_root()` -- `debug!` for each phase (parse, index, graph build)
- All mutation methods (`create_note`, `update_note`, `delete_note`, `create_link`, `delete_link`, `move_note`) -- `info!` with the operation and target path
- `reload_file`, `add_file`, `remove_file` -- `debug!` level (high frequency from file watcher)
- Error paths -- `warn!` or `error!` before returning `Err`

**File: `crates/core/src/parser.rs`** -- `debug!` on parse entry, `warn!` on YAML parse failures.

**File: `crates/core/src/index.rs`** -- `debug!` on index open/rebuild, `error!` on SQLite failures.

**File: `crates/core/src/graph.rs`** -- `trace!` for edge computation (very hot path), `debug!` for graph queries like `find_path`, `neighbors`.

#### Step 2: Create a shared logging initializer module in core

**New file: `crates/core/src/logging.rs`**

This module provides a helper function that consumer crates call to build a subscriber. It does NOT call `tracing::subscriber::set_global_default` -- that is the caller's responsibility. It returns a composed subscriber.

```rust
// crates/core/src/logging.rs
use std::path::Path;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter, Layer};
use tracing_appender::rolling::{RollingFileAppender, Rotation};

pub struct LogConfig {
    pub log_dir: Option<PathBuf>,       // e.g., .brainmap/logs/
    pub stderr_enabled: bool,            // true for CLI/Tauri, false for MCP
    pub stderr_json: bool,               // true for MCP fallback, false for CLI human-readable
    pub default_level: &'static str,     // e.g., "info"
}

pub fn init_logging(config: LogConfig) -> Option<tracing_appender::non_blocking::WorkerGuard> {
    // ... builds EnvFilter from BRAINMAP_LOG env var, falling back to config.default_level
    // ... builds layers: optional file layer (JSON), optional stderr layer
    // ... returns the WorkerGuard (caller must hold it alive)
}
```

The `EnvFilter` reads from `BRAINMAP_LOG` env var (e.g., `BRAINMAP_LOG=debug` or `BRAINMAP_LOG=brainmap_core::workspace=trace`). Falls back to the `default_level` parameter.

**Add to `crates/core/src/lib.rs`**: `pub mod logging;`

**Dependency note**: `tracing-subscriber` and `tracing-appender` would need to be dependencies of core for this approach. However, core is a library and should ideally not pull in subscriber setup. 

**Revised approach**: Put the logging init helper in a new **shared module** within core but behind a feature flag `logging-init`, or more simply, just duplicate the ~20 lines of init code in each consumer crate's main. Given there are only 3 consumers and the init logic is small, the pragmatic choice is: put a `pub fn init_logging` in core behind a `logging` feature flag that brings in `tracing-subscriber` and `tracing-appender`. This way CLI, MCP, and Tauri all call the same function, but the heavy deps are opt-in.

**Final approach**:
- `crates/core/Cargo.toml`: add `tracing = "0.1"` unconditionally. Add `tracing-subscriber` and `tracing-appender` behind `[features] logging = ["tracing-subscriber", "tracing-appender"]`.
- Consumer crates depend on `brainmap-core = { path = "../core", features = ["logging"] }`.
- `crates/core/src/logging.rs` is conditionally compiled: `#[cfg(feature = "logging")]`.

#### Step 3: CLI subscriber setup

**File: `crates/cli/src/main.rs`**

At the top of `main()`, before parsing args, call the shared init:

```rust
let _log_guard = brainmap_core::logging::init_logging(LogConfig {
    log_dir: None, // set after workspace is resolved
    stderr_enabled: true,
    stderr_json: false, // human-readable for terminal
    default_level: "warn",
});
```

The CLI logs to stderr only by default (no file -- the workspace may not exist yet, and CLI commands are short-lived). If `--verbose` / `-v` flag is added, bump to `info` or `debug`.

**Add `--verbose` flag** to the `Cli` struct (optional enhancement; env var `BRAINMAP_LOG` is sufficient for now).

For the `serve` subcommand (MCP server), the subscriber needs special handling -- see Step 4.

#### Step 4: MCP server subscriber setup

The MCP server uses stdio for the protocol. Logs MUST NOT go to stdout. Two sinks:
1. **stderr** with JSON format (so an agent wrapping the process can read structured logs from stderr)
2. **File** at `.brainmap/logs/brainmap-mcp.log` (the workspace path is known at `BrainMapMcp::new` time)

**File: `crates/cli/src/commands/serve.rs`** -- Before starting the MCP server, initialize logging:

```rust
let log_dir = workspace_path.join(".brainmap/logs");
let _guard = brainmap_core::logging::init_logging(LogConfig {
    log_dir: Some(log_dir),
    stderr_enabled: true,
    stderr_json: true,  // JSON on stderr for agent consumption
    default_level: "info",
});
```

#### Step 5: Tauri app subscriber setup

**File: `crates/app/src-tauri/src/lib.rs`**

Initialize logging at the start of `run()`. The Tauri app does not have a workspace path at startup (user picks one), so initially log to stderr only. When `open_workspace` is called, the file appender could be added -- but dynamic subscriber reconfiguration with tracing is complex.

**Simpler approach**: Log to a well-known location outside the workspace: `dirs::data_local_dir()/brainmap/logs/brainmap-app.log` (using the `dirs` crate). Or, since this is a personal tool, just use stderr + file in a fixed location. Actually, the cleanest approach for Tauri: log to stderr (Tauri captures this in the terminal when run in dev mode, and it goes to system logs in production). Add file logging to workspace `.brainmap/logs/` only after workspace is opened, using `tracing_appender::non_blocking` with a `reload` layer.

**Pragmatic decision**: Use `tracing-subscriber`'s `reload` layer. Initialize with stderr-only at startup. When workspace opens (in `handlers.rs::handle_open_workspace`), add a file layer. This is ~15 extra lines using `tracing_subscriber::reload::Handle`.

**File: `crates/app/src-tauri/Cargo.toml`** -- Add `tracing`, `tracing-subscriber`, `tracing-appender` deps. Since this crate is outside the workspace, add explicit versions rather than workspace refs.

**File: `crates/app/src-tauri/src/watcher.rs`** -- Replace `eprintln!` with `tracing::warn!` / `tracing::error!`.

**File: `crates/app/src-tauri/src/handlers.rs`** -- Add `tracing::info!` for each Tauri command handler.

#### Step 6: Frontend logging utility

**New file: `crates/app/src/utils/logger.ts`**

A simple structured logger:

```typescript
type LogLevel = "error" | "warn" | "info" | "debug";

interface LogEntry {
  ts: string;
  level: LogLevel;
  target: string;      // e.g., "editorStore", "graphStore"  
  msg: string;
  fields?: Record<string, unknown>;
}

const LOG_LEVEL_ORDER: Record<LogLevel, number> = { error: 0, warn: 1, info: 2, debug: 3 };

let currentLevel: LogLevel = "info";

export function setLogLevel(level: LogLevel) { currentLevel = level; }

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_ORDER[level] <= LOG_LEVEL_ORDER[currentLevel];
}

function emit(level: LogLevel, target: string, msg: string, fields?: Record<string, unknown>) {
  if (!shouldLog(level)) return;
  const entry: LogEntry = { ts: new Date().toISOString(), level, target, msg, ...fields && { fields } };
  const method = level === "error" ? "error" : level === "warn" ? "warn" : "log";
  console[method]("[brainmap]", JSON.stringify(entry));
}

export const log = {
  error: (target: string, msg: string, fields?: Record<string, unknown>) => emit("error", target, msg, fields),
  warn:  (target: string, msg: string, fields?: Record<string, unknown>) => emit("warn", target, msg, fields),
  info:  (target: string, msg: string, fields?: Record<string, unknown>) => emit("info", target, msg, fields),
  debug: (target: string, msg: string, fields?: Record<string, unknown>) => emit("debug", target, msg, fields),
};
```

Then replace inline `console.error()` calls across stores and components with `log.error(...)`.

**Files to update** (replace `console.error` with `log.error`):
- `crates/app/src/stores/editorStore.ts`
- `crates/app/src/stores/workspaceStore.ts`
- `crates/app/src/stores/graphStore.ts`
- `crates/app/src/components/Layout/FileTreePanel.tsx`
- `crates/app/src/components/Editor/LinksEditor.tsx`
- `crates/app/src/components/Editor/CreateNoteDialog.tsx`
- `crates/app/src/components/Search/SearchPanel.tsx`

#### Step 7: Log file cleanup

**In `crates/core/src/logging.rs`**: Add a `cleanup_old_logs(log_dir: &Path, max_age_days: u64)` function that deletes `.log` files older than `max_age_days`. Called once during init when `log_dir` is `Some`. Keep it to 3 days.

#### Step 8: Configuration

**Environment variable**: `BRAINMAP_LOG` -- accepts `tracing` `EnvFilter` syntax. Examples:
- `BRAINMAP_LOG=debug` -- all debug and above
- `BRAINMAP_LOG=brainmap_core=trace,brainmap_mcp=debug` -- per-crate levels
- `BRAINMAP_LOG=warn` -- only warnings and errors (quiet)

No config file needed. The env var is the universal mechanism. AI agents set it before spawning the process.

**Default levels by interface**:
- CLI: `warn` (minimal noise; user wants command output, not logs)
- MCP: `info` (agents benefit from seeing operations)
- Tauri: `info` (useful for debugging the app)

#### Step 9: Documentation

**File: `docs/logging.md`** -- New file documenting:
- Log schema (JSON fields, example entries)
- Log file locations (`.brainmap/logs/brainmap.log`, `.brainmap/logs/brainmap-mcp.log`)
- `BRAINMAP_LOG` env var usage with examples
- How agents should read logs (tail the file, or parse stderr for MCP)
- Log levels and what each level contains
- Rotation policy

**File: `CLAUDE.md`** -- Add a "Logging" section after "Conventions":
```
## Logging

Structured JSON logging via `tracing`. Logs written to `.brainmap/logs/` in workspace root.

- Env var `BRAINMAP_LOG` controls level (default: `warn` for CLI, `info` for MCP/app)
- MCP logs to stderr (JSON) + file (stdout reserved for protocol)
- Schema: `{ts, level, target, msg, fields, span}`
- Frontend: `import { log } from "../utils/logger"` — same schema via console methods
- See `docs/logging.md` for full documentation
```

**File: `README.md`** -- Add a brief mention in the features/usage section.

### 4. What to Log at Each Level

| Level | What |
|-------|------|
| **error** | Unrecoverable failures: corrupted index, SQLite errors, file I/O failures, panic-worthy conditions |
| **warn** | Recoverable issues: broken link targets during parse, invalid YAML in a note (skipped), file watcher errors, stale cache |
| **info** | Operations: workspace opened/closed, note CRUD, link CRUD, search queries, MCP tool calls, reindex, config changes |
| **debug** | Internal flow: file parse results, graph diff details, index query details, watcher events processed, subscriber configuration |
| **trace** | Hot paths: edge computation iterations, individual FTS5 queries, graph traversal steps |

### 5. Testing Strategy

- **Unit tests**: The `logging.rs` module should have a test that verifies `init_logging` does not panic and that a `tracing::info!` call after init does not panic.
- **Integration**: Existing CLI integration tests (`assert_cmd`) can verify that `BRAINMAP_LOG=debug` produces stderr output containing expected JSON keys. One test: run `brainmap --workspace seed stats` with `BRAINMAP_LOG=info` and assert stderr contains `"level":"INFO"`.
- **Frontend**: Test that `log.error` calls `console.error` and `log.debug` with level set to `warn` does not call anything. Simple vitest mock tests.

### 6. File-by-File Change Summary

| File | Change |
|------|--------|
| `Cargo.toml` (root) | Add workspace deps: `tracing`, `tracing-subscriber`, `tracing-appender` |
| `crates/core/Cargo.toml` | Add `tracing`. Add optional `tracing-subscriber`/`tracing-appender` behind `logging` feature |
| `crates/core/src/lib.rs` | Add `#[cfg(feature = "logging")] pub mod logging;` |
| `crates/core/src/logging.rs` | **NEW**: `LogConfig` struct, `init_logging()`, `cleanup_old_logs()` |
| `crates/core/src/workspace.rs` | Add `tracing::{info,warn,debug,error}` calls (~15 instrumentation points) |
| `crates/core/src/parser.rs` | Add `debug!`/`warn!` (~3 points) |
| `crates/core/src/index.rs` | Add `debug!`/`error!` (~4 points) |
| `crates/core/src/graph.rs` | Add `trace!`/`debug!` (~5 points) |
| `crates/cli/Cargo.toml` | Add `tracing`. Change core dep to include `features = ["logging"]` |
| `crates/cli/src/main.rs` | Call `init_logging` at top of `main()` |
| `crates/cli/src/commands/serve.rs` | Initialize file-logging subscriber before MCP server start |
| `crates/mcp/Cargo.toml` | Add `tracing` |
| `crates/mcp/src/server.rs` | Add `info!` in `dispatch_tool`, `warn!` on unknown tool |
| `crates/app/src-tauri/Cargo.toml` | Add `tracing`, `tracing-subscriber`, `tracing-appender` |
| `crates/app/src-tauri/src/lib.rs` | Call `init_logging` in `run()` |
| `crates/app/src-tauri/src/watcher.rs` | Replace `eprintln!` with `tracing::warn!`/`tracing::error!` |
| `crates/app/src-tauri/src/handlers.rs` | Add `tracing::info!` for each handler |
| `crates/app/src/utils/logger.ts` | **NEW**: Frontend structured logger |
| `crates/app/src/utils/logger.test.ts` | **NEW**: Vitest tests for logger |
| `crates/app/src/stores/editorStore.ts` | Replace `console.error` with `log.error` |
| `crates/app/src/stores/workspaceStore.ts` | Replace `console.error` with `log.error` |
| `crates/app/src/stores/graphStore.ts` | Replace `console.error` with `log.error` |
| `crates/app/src/components/Layout/FileTreePanel.tsx` | Replace `console.error` with `log.error` |
| `crates/app/src/components/Editor/LinksEditor.tsx` | Replace `console.error` with `log.error` |
| `crates/app/src/components/Editor/CreateNoteDialog.tsx` | Replace `console.error` with `log.error` |
| `crates/app/src/components/Search/SearchPanel.tsx` | Replace `console.error` with `log.error` |
| `docs/logging.md` | **NEW**: Full logging documentation for agents |
| `CLAUDE.md` | Add Logging section |
| `README.md` | Brief mention of logging |

### 7. Implementation Sequence

1. **Deps + core instrumentation** (Steps 1-2): Add tracing deps, create `logging.rs`, instrument core library. Run `cargo test -p brainmap-core` to verify no regressions.
2. **CLI integration** (Steps 3-4): Wire up CLI and MCP serve command. Run `cargo test -p brainmap` and manually verify `BRAINMAP_LOG=debug brainmap --workspace seed stats 2>/tmp/log.txt` produces JSON on stderr.
3. **MCP integration**: Instrument `server.rs`. Run `cargo test -p brainmap-mcp`.
4. **Tauri integration** (Step 5): Wire up Tauri backend. Run `cargo check` from `crates/app/src-tauri/`.
5. **Frontend logger** (Step 6): Create `logger.ts`, replace `console.error` calls, add vitest tests. Run `npm test`.
6. **Docs** (Step 9): Write `docs/logging.md`, update `CLAUDE.md` and `README.md`.
7. **Cleanup + log rotation** (Step 7): Implement and test cleanup function.

### 8. Potential Challenges

- **Tauri app is excluded from workspace**: The `crates/app/src-tauri` Cargo.toml has explicit version/edition rather than workspace refs. It references `brainmap-core` via path but cannot use workspace-level dependency declarations. The `tracing` deps must be added with explicit versions in that Cargo.toml.
- **MCP stdio conflict**: Already addressed -- JSON logs go to stderr only. The `tracing-subscriber` stderr layer with `with_writer(std::io::stderr)` handles this.
- **Global subscriber**: `tracing::subscriber::set_global_default` can only be called once. The CLI `serve` subcommand needs the MCP-specific config. Solution: in `main.rs`, check if the command is `Serve` before initializing the subscriber, and use the MCP config in that case.
- **Non-blocking writer guard**: `tracing_appender::non_blocking` returns a `WorkerGuard` that must be held for the process lifetime. The guard must be stored in a `let` binding in `main()`, not dropped.
- **Test isolation**: `tracing` global subscriber conflicts with test parallelism. The `logging.rs` init function should use `try_init` (which is a no-op if already set) rather than panicking. Alternatively, tests that need to verify logging should use `tracing_subscriber::fmt::SubscriberBuilder::with_test_writer()`.

---

### Critical Files for Implementation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs` - Primary instrumentation target: all CRUD operations, open/init, and incremental methods
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/logging.rs` - New file: shared LogConfig and init_logging function used by all three consumer crates
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/main.rs` - CLI entry point: subscriber initialization with command-aware config (normal vs serve/MCP)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs` - Tauri entry point: subscriber init and reload-layer setup for deferred file logging
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/logger.ts` - New file: frontend structured logger replacing all inline console calls

---

