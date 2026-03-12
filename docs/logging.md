# BrainMap Logging Specification

## Overview

BrainMap uses structured logging via Rust's `tracing` ecosystem (backend) and a custom NDJSON logger (frontend). All layers emit machine-readable logs for AI agent diagnostics.

## Log Schema (NDJSON)

Each log line is a JSON object:

```json
{"ts":"2026-03-12T10:30:00.123Z","level":"INFO","target":"brainmap_core::workspace","msg":"workspace opened","fields":{"root":"/path","node_count":34,"edge_count":52}}
```

| Field | Description |
|-------|-------------|
| `ts` | ISO 8601 timestamp |
| `level` | `ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE` |
| `target` | Module path (Rust) or component path (TS) |
| `msg` | Human-readable message |
| `fields` | Optional structured key-value data |

## Configuration

### Environment Variable

Set `BRAINMAP_LOG` using `tracing` `EnvFilter` syntax:

```bash
# Set global level
BRAINMAP_LOG=debug cargo run -p brainmap -- stats

# Target specific modules
BRAINMAP_LOG=brainmap_core::workspace=trace,brainmap_core::index=debug

# Default (no env var set)
# CLI: warn, MCP: info, Tauri: info
```

### Defaults by Interface

| Interface | Default Level | Stderr Format | File Logging |
|-----------|--------------|---------------|-------------|
| CLI | `warn` | Human-readable (compact) | No |
| MCP (serve) | `info` | JSON | Yes (`<workspace>/.brainmap/logs/`) |
| Tauri | `info` | Human-readable (compact) | No |

## Log Destinations

### File Logs

- **Location**: `<workspace>/.brainmap/logs/brainmap.log`
- **Rotation**: Daily (via `tracing-appender`)
- **Cleanup**: Call `cleanup_old_logs(dir, 3)` to remove files older than 3 days
- **Format**: JSON (NDJSON)

### Stderr

- **CLI**: Compact human-readable format
- **MCP**: JSON format (agents parse stderr for diagnostics)
- **Tauri**: Compact human-readable format

### stdout

Never used for logs — reserved for MCP protocol messages and CLI output.

### Frontend

Uses `console` methods with `[brainmap] {JSON}` prefix:

```typescript
import { log } from "../utils/logger";

log.info("stores::workspace", "workspace opened", { root: "/path" });
// Output: [brainmap] {"ts":"...","level":"INFO","target":"stores::workspace","msg":"workspace opened","fields":{"root":"/path"}}
```

## Log Levels

| Level | What to Log |
|-------|-------------|
| **error** | Corrupted index, SQLite failures, file I/O errors, unrecoverable state |
| **warn** | Broken links during parse, invalid YAML (note skipped), watcher errors, unregistered types |
| **info** | Workspace open/close, note/link CRUD, search queries, MCP tool calls, config changes |
| **debug** | Parse results, graph diffs, index queries, watcher events, file reload/add/remove |
| **trace** | Edge computation, FTS5 queries, graph traversal (hot paths) |

## Agent Usage

### Reading MCP Logs

When running the MCP server via `brainmap serve`, stderr contains JSON logs:

```bash
brainmap --workspace /path serve 2>/tmp/mcp-stderr.log
```

Agents can parse `/tmp/mcp-stderr.log` or `<workspace>/.brainmap/logs/brainmap.log` for diagnostics.

### Increasing Verbosity

```bash
BRAINMAP_LOG=debug brainmap --workspace /path serve
```

### Filtering by Module

```bash
BRAINMAP_LOG=brainmap_core::workspace=trace,brainmap_mcp=debug brainmap --workspace /path serve
```

## Implementation

### Rust (Backend)

- `tracing` crate for instrumentation macros (`info!`, `warn!`, `debug!`, etc.)
- `tracing-subscriber` with `json` + `env-filter` features for output formatting
- `tracing-appender` for daily-rotated file logging
- Shared init via `brainmap_core::logging::init_logging(LogConfig)`
- Feature-gated behind `logging` feature on `brainmap-core`

### TypeScript (Frontend)

- `crates/app/src/utils/logger.ts` — `log.error()`, `log.warn()`, `log.info()`, `log.debug()`
- Structured JSON output via `console` methods
- 7 Vitest unit tests in `logger.test.ts`
