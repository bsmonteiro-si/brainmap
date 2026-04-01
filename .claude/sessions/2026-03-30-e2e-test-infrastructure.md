# 2026-03-30 — E2E Test Infrastructure & Isolated App Launcher

## Context From Previous Session

The `2026-03-27-tauri-mcp-visual-testing-pipeline.md` session proved out tauri-plugin-mcp for visual testing. The `e2e-testing-next-steps.md` document captured the architecture decision to use the MCP socket as the test driver. This session implemented it end-to-end.

## What Was Done

### 1. Built deterministic E2E test infrastructure

- **Goal**: Run real tests against a real Tauri app — no mocks, no AI in the loop
- **Architecture**: `vitest (Node.js) → Unix socket → tauri-plugin-mcp → real WebView + real Rust backend`
- **Socket client** (`tests/e2e/client.ts`): JSON-over-newline protocol, type coercion for plugin's `{result: "false", type: "boolean"}` format, ID-based response matching, timeout guards with cleanup
- **globalSetup** (`tests/e2e/setup.ts`): copies `seed/` to temp dir, spawns `npx tauri dev` on port 1520 with isolated socket, waits for WebView readiness (`__TAURI_INTERNALS__`), opens workspace via `openFolderAsSegment()`, waits for `[data-tree-path]` DOM elements
- **Helpers** (`tests/e2e/helpers.ts`): `getVisibleTreeItems` (ancestor class walk for CSS grid-template-rows visibility), `clickFolder`, `isFolderExpanded`, `clickFile`, all with `CSS.escape()` + JS escaping for safe path interpolation
- **First tests** (`tests/e2e/file-tree.spec.ts`): expand folder shows children, collapse folder hides children — both passing

### 2. Parameterized socket path and Vite port for isolation

- `lib.rs`: `BRAINMAP_MCP_SOCKET` env var with fallback to `/tmp/brainmap-mcp.sock`
- `vite.config.ts`: `VITE_PORT` and `VITE_HMR_PORT` env vars with fallbacks to 1420/1421
- Tauri config override via `--config` CLI flag (not `TAURI_CONFIG` env var — Tauri v2 doesn't support it)
- `beforeDevCommand` override needed because `npm run dev` hardcodes `--port 1420`

### 3. Built isolated app launcher for AI-guided testing

- **Script** (`scripts/e2e-app.sh`): `start`/`stop`/`status` commands
- Copies `seed/` to temp workspace, launches on port 1520 with socket at `/tmp/brainmap-mcp-isolated.sock`
- Added `tauri-mcp-isolated` entry to `.mcp.json` pointing to the isolated socket
- Demo: launched isolated app, opened workspace, expanded folder, opened note — all while dev instance untouched
- User can watch the isolated window in real time while agent interacts

### 4. Separated log directories for isolated instances

- `lib.rs`: reads `BRAINMAP_LOG_DIR` env var, falls back to `~/.brainmap/logs/`
- `e2e-app.sh` sets `BRAINMAP_LOG_DIR=tests/e2e/logs/app/`
- `setup.ts` sets same env var for automated test runs
- Prevents log interleaving when dev + isolated instances run simultaneously

### 5. Comprehensive documentation

- `tests/e2e/README.md`: architecture, isolation table, log paths, 7 gotchas (Tauri v2 IPC, config overrides, type coercion, CSS visibility, port hardcoding, WebView readiness, path escaping)
- `docs/extension-guides/add-e2e-test.md`: 8-step checklist for adding new tests
- `CLAUDE.md`: e2e instructions in Building and Testing, isolated instance instructions, log checking mandate in Debugging Workflow
- `tauri-mcp-navigate` skill: isolated instance section, log checking section with paths table, rule #5 "check logs after interactions"

## Key Decisions and Patterns

- **Direct socket, not MCP layer**: Tests talk directly to the tauri-plugin-mcp Unix socket (JSON-over-newline), skipping the MCP server TS intermediary. Simpler, fewer moving parts.
- **Tauri v2 IPC is `__TAURI_INTERNALS__`**: `window.__TAURI__` does not exist in v2. All tests and scripts use `window.__TAURI_INTERNALS__.invoke()`.
- **Workspace opening via store import**: `import('/src/stores/segmentActions.ts').then(m => m.openFolderAsSegment(path))` — imports from the Vite module graph, replicating what the SegmentPicker UI does.
- **Visibility = ancestor class walk**: Collapsed folders use `grid-template-rows: 0fr` + `overflow: hidden`. Children are in DOM but hidden. `offsetHeight` is unreliable. Must walk ancestors checking for `.tree-children-anim--open` class.
- **Type coercion required**: Plugin returns all results as `{result: "stringified", type: "boolean"|"number"|...}`. The client must coerce `"false"` → `false`, `"42"` → `42`, etc.
- **`--config` CLI flag, not env var**: Tauri v2 does not support `TAURI_CONFIG` env var for config overrides.
- **Separate log dirs for isolation**: `BRAINMAP_LOG_DIR` env var prevents dev/test log interleaving.

## Discoveries During Implementation

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| `cargo tauri` not found | Not installed globally, only as npm devDep | Use `npx tauri dev` |
| Port 1420 conflict | `npm run dev` hardcodes `--port 1420`, overriding vite.config.ts | Override `beforeDevCommand` via `--config` |
| `execute_js` hangs on first call | WebView JS context not loaded yet | Poll `document.readyState` with retry loop |
| `window.__TAURI__` undefined | Tauri v2 uses `__TAURI_INTERNALS__` | Updated all references |
| `executeJs` returns wrong types | Plugin wraps as `{result: "false", type: "boolean"}` | Added type coercion in client |
| `globalThis` not shared | vitest globalSetup runs in separate process | Write socket path to file, test files create own client |
| `offsetHeight > 0` unreliable | CSS `overflow: hidden` doesn't zero out child heights | Walk ancestors for `.tree-children-anim--open` |
| Token file never appears | Plugin has no auth configured, doesn't create `.token` | Made token file wait optional |

## Files Changed

| File | Change |
|------|--------|
| `crates/app/src-tauri/src/lib.rs` | `BRAINMAP_MCP_SOCKET` + `BRAINMAP_LOG_DIR` env vars |
| `crates/app/vite.config.ts` | `VITE_PORT` + `VITE_HMR_PORT` env vars |
| `.gitignore` | Added `tests/e2e/screenshots/`, `logs/`, `.e2e-socket-path` |
| `.mcp.json` | Added `tauri-mcp-isolated` server entry |
| `CLAUDE.md` | E2E testing, isolated instance, log checking instructions |
| `tests/e2e/package.json` | New — vitest + @types/node deps |
| `tests/e2e/tsconfig.json` | New — ES2022, node types |
| `tests/e2e/vitest.config.ts` | New — 60s/120s timeouts, globalSetup, forceExit |
| `tests/e2e/client.ts` | New — socket client with type coercion |
| `tests/e2e/connect.ts` | New — shared client connector via socket path file |
| `tests/e2e/setup.ts` | New — globalSetup/teardown lifecycle |
| `tests/e2e/helpers.ts` | New — DOM interaction helpers |
| `tests/e2e/file-tree.spec.ts` | New — expand/collapse folder tests |
| `tests/e2e/README.md` | New — architecture, logs, gotchas |
| `docs/extension-guides/add-e2e-test.md` | New — 8-step recipe |
| `scripts/e2e-app.sh` | New — isolated app start/stop/status |
| `.claude/skills/tauri-mcp-navigate/SKILL.md` | Isolated instance + log checking sections |

## Current Test Status

- **Rust tests**: 124 passing (unchanged)
- **Vitest unit tests**: 969 passing (unchanged)
- **E2E tests**: 2 passing (new — file tree expand/collapse)

## How to Ask Agents for Each Use Case

- **"Run the e2e tests"** → runs vitest suite, deterministic
- **"Launch an isolated instance and [do X]"** → `e2e-app.sh start`, MCP interaction, visible window
- **"Take a screenshot of my app"** → inspects dev instance via `tauri-mcp`
