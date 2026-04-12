# E2E Tests

Deterministic end-to-end tests that run against a real BrainMap Tauri app instance. No mocks, no AI — just a Node.js test runner talking to the app via the tauri-plugin-mcp Unix socket.

## Architecture

```
vitest (Node.js) ──Unix socket──> tauri-plugin-mcp (in Tauri app) ──> real WebView + real Rust backend
```

The test runner sends JSON commands (`execute_js`, `take_screenshot`, `wait_for`) over the socket and asserts results. The app window is fully visible during test runs.

### File layout

```
tests/e2e/
  client.ts          # Socket client — JSON-over-newline protocol
  connect.ts         # Shared client connector for test files
  setup.ts           # globalSetup: launches app, opens workspace, tears down
  helpers.ts         # Reusable DOM interaction patterns
  file-tree.spec.ts  # File tree expand/collapse tests
  vitest.config.ts   # 60s test timeout, 120s hook timeout
  screenshots/       # .gitignored — screenshots saved during tests
  logs/              # .gitignored — cargo tauri dev stdout/stderr
  logs/app/          # .gitignored — app logs (BRAINMAP_LOG_DIR), separate from dev instance
```

### Isolation

Tests run on a separate port and socket from the dev instance:

| Resource | Dev instance | E2E instance |
|----------|-------------|--------------|
| Vite port | 1420 | 1520 |
| HMR port | 1421 | 1521 |
| MCP socket | `/tmp/brainmap-mcp.sock` | `/tmp/brainmap-mcp-test-<pid>.sock` |
| Workspace | User's workspace | Fresh copy of `seed/` in temp dir |

## Running

```bash
cd tests/e2e
npm install --cache /tmp/npm-cache   # first time only
npx vitest run                       # run all tests
npx vitest run file-tree             # run a specific file
npx vitest                           # watch mode
```

Warm runs take ~15s (app boot + tests). First run compiles Rust (~2-3 min).

## Adding a new test

See `docs/extension-guides/add-e2e-test.md` for the step-by-step recipe.

## Logs

Both e2e tests and the isolated app instance use `BRAINMAP_LOG_DIR` to write app logs separately from the dev instance. This prevents log interleaving when both are running simultaneously.

| Log | Location | Contains |
|-----|----------|----------|
| App logs (isolated) | `tests/e2e/logs/app/brainmap.log.YYYY-MM-DD` | Backend tracing + frontend `log.*()` output |
| Cargo/Vite output | `tests/e2e/logs/isolated-app.log` | Rust compilation, Vite startup, plugin init |
| App logs (dev) | `~/.brainmap/logs/brainmap.log.YYYY-MM-DD` | Your normal dev instance logs |

After running tests or interacting with the isolated instance, check app logs:

```bash
grep "your-target" tests/e2e/logs/app/brainmap.log.$(date +%Y-%m-%d) | tail -20
```

## Socket protocol

The tauri-plugin-mcp socket uses newline-delimited JSON:

```
Request:  {"command":"execute_js","payload":{"code":"...","window_label":"main"},"id":"unique-id"}\n
Response: {"success":true,"data":{"result":"...","type":"string"},"error":null,"id":"unique-id"}\n
```

Available commands: `execute_js`, `take_screenshot`, `wait_for`, `get_page_state`, `get_app_info`, `get_dom`, `get_page_map`, `click`, `type_text`.

## Gotchas

### tauri-mcp bridge server disappears after reboot

The MCP bridge at `/tmp/tauri-plugin-mcp/mcp-server-ts/build/index.js` lives in `/tmp/` and gets purged by macOS on reboot or disk pressure. If `/mcp` reconnect fails or `tauri-mcp-isolated` tools are unavailable, rebuild it:

```bash
cd /tmp && git clone https://github.com/P3GLEG/tauri-plugin-mcp.git tauri-plugin-mcp
cd /tmp/tauri-plugin-mcp/mcp-server-ts && npm install --cache /tmp/npm-cache && npx tsc
```

Then `/mcp` to reconnect. Check `CLAUDE.md` § tauri-mcp Bridge Recovery for full details.

### Tauri v2 IPC is `__TAURI_INTERNALS__`, not `__TAURI__`

Tauri v2 does NOT expose `window.__TAURI__`. The IPC bridge is at `window.__TAURI_INTERNALS__`:

```js
// Wrong (Tauri v1):
window.__TAURI__.core.invoke('open_workspace', { root: path })

// Correct (Tauri v2):
window.__TAURI_INTERNALS__.invoke('open_workspace', { root: path })
```

For the full app API (stores, actions), import from the Vite module graph instead:

```js
const { openFolderAsSegment } = await import('/src/stores/segmentActions.ts');
await openFolderAsSegment(path);
```

### Config overrides use `--config` CLI flag, not env var

Tauri v2 does NOT support `TAURI_CONFIG` env var. Use the CLI flag:

```bash
npx tauri dev --config '{"build":{"devUrl":"http://localhost:1520","beforeDevCommand":"vite --port 1520"}}'
```

### `execute_js` results need type coercion

The plugin wraps all results as `{result: "stringified-value", type: "boolean"|"number"|"string"|...}`. The `E2EClient.executeJs()` method handles this automatically — booleans, numbers, and objects are coerced back to their native types.

If writing raw socket calls, remember that `false` comes back as `{result: "false", type: "boolean"}`, not as the boolean `false`.

### Collapsed folders hide children via CSS, not DOM removal

The file tree uses `grid-template-rows: 0fr` + `overflow: hidden` for collapse animation. Children of collapsed folders are **in the DOM** but have zero height. Naive `querySelector` will find them.

Use the `getVisibleTreeItems()` helper, which walks ancestors to check for the `.tree-children-anim--open` class. Do NOT rely on `offsetHeight` — it can report positive values for items inside `overflow: hidden` containers.

### The `npm run dev` script hardcodes `--port 1420`

The `package.json` dev script is `vite --port 1420`, which overrides `vite.config.ts`. The test setup handles this by overriding `beforeDevCommand` via `--config`. If you change the dev script, update `setup.ts` accordingly.

### WebView readiness

After the socket file appears, the WebView may not have loaded the frontend JS yet. The setup polls `document.readyState` and `window.__TAURI_INTERNALS__` until both are ready. If you connect manually, wait for the WebView before executing JS.

### Path escaping in helpers

When writing helpers that interpolate file paths into `executeJs` strings, always use `CSS.escape()` for attribute selectors and escape JS special characters (quotes, backslashes). See the `escapeJs()` function and existing helpers for the pattern.
