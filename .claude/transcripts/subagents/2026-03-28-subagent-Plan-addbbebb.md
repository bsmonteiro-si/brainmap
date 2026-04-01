# 2026-03-28 — Subagent Transcript: Plan

**Date:** 2026-03-28 14:52:56
**Agent:** Plan
**Agent ID:** addbbebbe96cae5c9
**Parent Session:** 9b3ab126-4240-4bd6-9a5a-d03c3e8a95d8

---

## User

Design the initial E2E test infrastructure for BrainMap using the existing tauri-plugin-mcp socket.

## Context

BrainMap is a Tauri v2 + React desktop app. It already has tauri-plugin-mcp integrated:
- A Unix socket at `/tmp/brainmap-mcp.sock` (hardcoded in `crates/app/src-tauri/src/lib.rs`, debug-only)
- An MCP server TS at `/tmp/tauri-plugin-mcp/mcp-server-ts/` that bridges the socket to MCP protocol over stdio
- The socket protocol is simple JSON-over-newline: send `{"command": "...", "payload": {...}, "id": "..."}` + newline, receive `{"success": true, "data": ..., "id": "..."}` + newline
- Commands include: `execute_js`, `take_screenshot`, `query_page`, `click`, `type_text`, `wait_for`, `navigate`, `manage_window`
- The `TauriSocketClient` class in `/tmp/tauri-plugin-mcp/mcp-server-ts/src/tools/client.ts` already handles connection, auth tokens, reconnection, buffering

## User Requirements
1. Spin up an isolated app instance and perform a simple test (expand a folder)
2. User must be able to SEE the app window during tests (toggleable visibility, ON by default initially)

## What Needs to Happen

### 1. Socket path parameterization
In `crates/app/src-tauri/src/lib.rs`, change the hardcoded `/tmp/brainmap-mcp.sock` to read from `BRAINMAP_MCP_SOCKET` env var with fallback to the current default.

### 2. Vite port parameterization  
In `crates/app/vite.config.ts`, read port from `VITE_PORT` env var with fallback to 1420.

### 3. Test directory structure
```
tests/e2e/
  client.ts          # Thin wrapper around TauriSocketClient for test use
  setup.ts           # Launch app, wait for socket, tear down
  helpers.ts         # Reusable interaction patterns (from playbooks)
  file-tree.spec.ts  # First test: expand a folder
  tsconfig.json      # TypeScript config for e2e tests
```

### 4. Test client (`client.ts`)
A Node.js client that:
- Copies the `TauriSocketClient` pattern from the existing MCP server
- Connects to the Tauri socket directly (no MCP protocol layer needed)
- Provides typed methods: `executeJs(code)`, `takeScreenshot()`, `queryPage(mode)`, `click(x,y)`, `waitFor(selector)`
- Socket path configurable via env var or constructor param

### 5. Test launcher (`setup.ts`)
- Copies `seed/` to a temp directory as the test workspace
- Launches `cargo tauri dev` with custom env vars:
  - `BRAINMAP_MCP_SOCKET=/tmp/brainmap-mcp-test.sock`
  - `VITE_PORT=1421` (or similar non-conflicting port)
- Waits for the socket file to appear (poll every 500ms, timeout 60s)
- Connects the client
- Opens the test workspace in the app
- After tests: kills the process, cleans up temp dir and socket

### 6. Visibility control
The app window is visible by default (normal `cargo tauri dev` behavior). The user sees everything. For CI, we can add `BRAINMAP_E2E_HEADLESS=1` later to minimize the window, but initially it's always visible.

### 7. First test: expand a folder
```ts
test("expand folder shows children", async () => {
  // List visible items before
  const before = await client.executeJs(`...list tree items...`);
  
  // Click folder to expand
  await client.executeJs(`...click folder...`);
  
  // Wait for children to render
  await new Promise(r => setTimeout(r, 300));
  
  // List visible items after
  const after = await client.executeJs(`...list tree items...`);
  
  // Assert children are now visible
  expect(after.length).toBeGreaterThan(before.length);
  
  // Take screenshot for visual verification
  await client.takeScreenshot("folder-expanded.png");
});
```

### Key Design Decisions
- Use vitest as the test runner (already configured, familiar)
- Talk directly to the Tauri socket (skip the MCP server TS layer — simpler, fewer moving parts)
- The test workspace uses a copy of `seed/` for known data
- Each test run gets a fresh app instance (reliable, stateless)
- Screenshots saved to `tests/e2e/screenshots/` for review

### What to handle for the socket client
Looking at the existing `TauriSocketClient` in `/tmp/tauri-plugin-mcp/mcp-server-ts/src/tools/client.ts`:
- Protocol: JSON + newline over Unix socket
- Request format: `{"command": "execute_js", "payload": {"code": "..."}, "id": "unique-id", "authToken": "..."}`
- Response format: `{"success": true, "data": {...}, "id": "..."}`
- Auth token read from `${socketPath}.token` file or `TAURI_MCP_AUTH_TOKEN` env var
- 30s timeout per request
- Reconnection on close (up to 3 attempts)

We can either import the existing `TauriSocketClient` class or create a lightweight copy. Since it's in an external location (`/tmp/`), creating our own copy is more reliable.

Please provide a detailed implementation plan with file paths, code structure, and step ordering.

---

## Assistant



I'll explore the codebase to understand the current architecture and then provide a detailed implementation plan.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/","description":"List top-level directory"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/vite.config.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/tmp/tauri-plugin-mcp/mcp-server-ts/src/tools/client.ts"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/seed/","description":"List seed directory contents"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/","description":"List app crate contents"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/vitest*","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/vitest.config.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/tsconfig.json"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/tauri.conf.json"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/tsconfig.node.json"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"file-tree|FileTree|file_tree|sidebar|Sidebar","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches","head_limit":15}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.test.ts"}`

---

## Assistant

Now let me look at the FileTreePanel component to understand the DOM structure for the test.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":80}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"data-testid|data-path|tree-item|tree-node|folder-row|file-row","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"conten`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":720,"limit":50}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"open_workspace|openWorkspace","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/Cargo.toml","description":"Check if src-tauri Cargo.toml exists"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"openWorkspace|open_workspace","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts","output_mode":"content","context":3}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"openWorkspace|open_workspace","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts","output_mode":"content","context":3}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/Cargo.toml"}`

---

## Assistant

Now let me check the existing e2e-testing notes and the Cargo.toml for the tauri dev command setup.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/e2e-testing-next-steps.md"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"expandedFolders|expanded|isExpanded|setExpanded|toggleFolder","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"toggleFolder|treeExpandedFolders","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","output_mode":"content","context":3}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/tests/ 2>/dev/null || echo \"no tests dir\"","description":"Check if tests directory exists"}`

---

## Assistant

Now let me check the Cargo.toml for the app binary to understand the `cargo tauri dev` command path.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/scripts/","description":"List scripts directory"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"socket_path|BRAINMAP_MCP|mcp.*sock","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src","output_mode":"content","context":3}`

---

## Assistant

I now have a thorough understanding of the codebase. Let me look at one more thing -- the `data-tree-path` attribute on the DOM elements which will be key for the test selectors.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"data-tree-path","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content","context":1}`

---

## Assistant

I have all the information needed. Here is the detailed implementation plan.

---

## Implementation Plan: E2E Test Infrastructure for BrainMap

### Overview

This plan builds a deterministic E2E test infrastructure that talks to a real running BrainMap Tauri app via the existing `tauri-plugin-mcp` Unix socket. No mocks, no AI -- just a vitest test runner sending JSON commands over a socket and asserting results.

### Step 1: Parameterize the socket path in Rust

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs`

**Change**: On line 88, replace the hardcoded `"/tmp/brainmap-mcp.sock"` with an env-var lookup at runtime.

```rust
// Before:
.socket_path("/tmp/brainmap-mcp.sock".into()),

// After:
.socket_path(
    std::env::var("BRAINMAP_MCP_SOCKET")
        .unwrap_or_else(|_| "/tmp/brainmap-mcp.sock".to_string())
        .into(),
),
```

This is a one-line change. The fallback preserves current dev behavior. When e2e tests launch the app, they pass `BRAINMAP_MCP_SOCKET=/tmp/brainmap-mcp-test-<pid>.sock` to isolate the test instance.

### Step 2: Parameterize the Vite dev server port

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/vite.config.ts`

**Change**: On line 10, read from `VITE_PORT` env var with fallback to 1420.

```ts
// Before:
port: 1420,

// After:
port: parseInt(process.env.VITE_PORT || "1420", 10),
```

Also update the HMR port on line 18 to derive from the same base (e.g., `VITE_PORT + 1` or `VITE_HMR_PORT`):

```ts
port: parseInt(process.env.VITE_HMR_PORT || "1421", 10),
```

Additionally, the Tauri config at `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/tauri.conf.json` line 8 hardcodes `"devUrl": "http://localhost:1420"`. The `cargo tauri dev` command allows overriding via `TAURI_DEV_URL` env var, so the test launcher should set that too rather than editing the JSON.

### Step 3: Create the test directory structure

Create `tests/e2e/` at the repository root (not inside `crates/app/`), so it lives alongside the existing workspace-level `Cargo.toml`. This keeps e2e tests separate from unit tests.

```
tests/e2e/
  tsconfig.json
  vitest.config.ts
  client.ts
  setup.ts
  helpers.ts
  file-tree.spec.ts
  screenshots/          (gitignored, created at runtime)
```

### Step 4: E2E-specific TypeScript and Vitest config

**File**: `tests/e2e/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": ".",
    "types": ["vitest/globals", "node"]
  },
  "include": ["./**/*.ts"]
}
```

**File**: `tests/e2e/vitest.config.ts`

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 60_000,        // generous: app boot + interactions
    hookTimeout: 120_000,       // setup launches cargo tauri dev
    setupFiles: ["./setup.ts"],
    include: ["**/*.spec.ts"],
  },
});
```

Key decisions:
- Uses the same `vitest` already in `crates/app/package.json` devDependencies. We will add a workspace-root `package.json` (or run vitest from `crates/app/node_modules/.bin/vitest`) with a script like `"test:e2e": "vitest run --config tests/e2e/vitest.config.ts"`.
- Separate config avoids polluting the unit test setup (jsdom environment, React test-setup.ts).
- `hookTimeout: 120_000` gives `cargo tauri dev` time to compile and start.

### Step 5: Socket client (`client.ts`)

**File**: `tests/e2e/client.ts`

This is a simplified copy of the `TauriSocketClient` pattern from `/tmp/tauri-plugin-mcp/mcp-server-ts/src/tools/client.ts`. We copy rather than import because that file lives in `/tmp/` (ephemeral). Our copy is ~80 lines and strips out TCP support, singleton patterns, and reconnection (tests don't need it).

Core structure:

```ts
import * as net from "node:net";
import * as fs from "node:fs";

export class E2EClient {
  private socket: net.Socket | null = null;
  private buffer = "";
  private pending = new Map<string, { resolve: Function; reject: Function }>();
  private authToken?: string;

  constructor(private socketPath: string) {}

  async connect(): Promise<void> {
    // Read auth token from `${socketPath}.token`
    // Create net.createConnection({ path: socketPath })
    // Wire up data handler (JSON-over-newline, same as TauriSocketClient.handleData)
    // Return promise that resolves on 'connect' event
  }

  private send(command: string, payload: Record<string, any>): Promise<any> {
    // Generate unique ID (timestamp + random)
    // JSON.stringify({ command, payload, id, authToken }) + "\n"
    // Register in pending map with 30s timeout
    // Write to socket
  }

  // Typed convenience methods:
  executeJs(code: string): Promise<any> {
    return this.send("execute_js", { code });
  }

  takeScreenshot(savePath?: string): Promise<string> {
    return this.send("take_screenshot", { save_path: savePath });
  }

  queryPage(mode: "map" | "state" | "app_info" = "map"): Promise<any> {
    return this.send("query_page", { mode });
  }

  click(x: number, y: number): Promise<void> {
    return this.send("click", { x, y });
  }

  waitFor(selector: string, timeoutMs = 5000): Promise<void> {
    return this.send("wait_for", { selector, timeout: timeoutMs });
  }

  disconnect(): void {
    this.socket?.destroy();
    this.socket = null;
  }
}
```

The protocol exactly matches what the Tauri plugin expects:
- Request: `{"command": "execute_js", "payload": {"code": "..."}, "id": "...", "authToken": "..."}\n`
- Response: `{"success": true, "data": ..., "id": "..."}\n`
- Auth token is read from `${socketPath}.token` file (written by tauri-plugin-mcp on startup)

### Step 6: Test launcher and lifecycle (`setup.ts`)

**File**: `tests/e2e/setup.ts`

This is the vitest `setupFile`. It uses vitest's `beforeAll`/`afterAll` hooks. Key responsibilities:

1. **Copy seed to temp dir**: Use `fs.cpSync` to copy `/Users/bsmonteiro/Desktop/Personal/brainmap/seed/` into a `os.tmpdir()`-based temp directory. This becomes the test workspace.

2. **Choose isolated ports/paths**:
   - `BRAINMAP_MCP_SOCKET` = `/tmp/brainmap-mcp-test-${process.pid}.sock`
   - `VITE_PORT` = `1520` (well away from default 1420)
   - `VITE_HMR_PORT` = `1521`

3. **Launch `cargo tauri dev`**:
   ```ts
   import { spawn } from "node:child_process";

   const tauriProcess = spawn("cargo", ["tauri", "dev"], {
     cwd: path.join(repoRoot, "crates/app"),
     env: {
       ...process.env,
       BRAINMAP_MCP_SOCKET: socketPath,
       VITE_PORT: "1520",
       VITE_HMR_PORT: "1521",
       // No BRAINMAP_E2E_HEADLESS -- window is visible by default
     },
     stdio: ["ignore", "pipe", "pipe"],
   });
   ```
   Pipe stdout/stderr to a log file in `tests/e2e/logs/` for debugging.

4. **Wait for socket**:
   Poll `fs.existsSync(socketPath)` every 500ms, timeout after 120s (first run compiles Rust). This is simpler and more reliable than watching stdout for a ready message.

5. **Connect client**:
   ```ts
   const client = new E2EClient(socketPath);
   await client.connect();
   ```

6. **Open test workspace**:
   ```ts
   await client.executeJs(`
     window.__TAURI__.core.invoke("open_workspace", { path: "${tempWorkspacePath}" });
   `);
   ```
   Wait for the workspace to load by polling `query_page` or using `waitFor` on a known DOM element.

7. **Export client globally** for test files:
   ```ts
   declare global { var e2eClient: E2EClient; }
   globalThis.e2eClient = client;
   ```

8. **Teardown** (`afterAll`):
   - `client.disconnect()`
   - Kill the tauri process tree (`tauriProcess.kill("SIGTERM")`)
   - Clean up temp workspace directory
   - Clean up socket file

### Step 7: Test helpers (`helpers.ts`)

**File**: `tests/e2e/helpers.ts`

Reusable patterns extracted from the DOM structure discovered above. The FileTreePanel uses `data-tree-path` attributes on every tree item and `data-tree-is-folder="1"` on folders. The expand/collapse state is controlled by `tree-children-anim--open` CSS class.

```ts
export async function getVisibleTreeItems(client: E2EClient): Promise<string[]> {
  return client.executeJs(`
    Array.from(document.querySelectorAll('[data-tree-path]'))
      .filter(el => el.offsetParent !== null)
      .map(el => el.getAttribute('data-tree-path'))
  `);
}

export async function clickFolder(client: E2EClient, folderPath: string): Promise<void> {
  await client.executeJs(`
    document.querySelector('[data-tree-path="${folderPath}"][data-tree-is-folder="1"]')?.click();
  `);
}

export async function isFolderExpanded(client: E2EClient, folderPath: string): Promise<boolean> {
  return client.executeJs(`
    const folder = document.querySelector('[data-tree-path="${folderPath}"][data-tree-is-folder="1"]');
    const animContainer = folder?.parentElement?.querySelector('.tree-children-anim');
    animContainer?.classList.contains('tree-children-anim--open') ?? false;
  `);
}

export async function waitForTreeLoaded(client: E2EClient): Promise<void> {
  // Wait for at least one tree item to be rendered
  await client.waitFor('[data-tree-path]', 10_000);
}
```

### Step 8: First test (`file-tree.spec.ts`)

**File**: `tests/e2e/file-tree.spec.ts`

The `seed/` directory contains folders like `Concepts`, `Evidence`, `Experiments`, `People`, `Projects`, `Questions`. The test will expand one of these.

```ts
import { getVisibleTreeItems, clickFolder, waitForTreeLoaded } from "./helpers";

describe("File Tree", () => {
  let client: E2EClient;

  beforeAll(async () => {
    client = globalThis.e2eClient;
    await waitForTreeLoaded(client);
  });

  it("expand folder shows children", async () => {
    // Get initial visible items (folders are collapsed by default)
    const before = await getVisibleTreeItems(client);
    
    // "Concepts" folder exists in seed/ and has child notes
    expect(before).toContain("Concepts");
    
    // Count items with "Concepts/" prefix (should be 0, folder is collapsed)
    const childrenBefore = before.filter(p => p.startsWith("Concepts/"));
    expect(childrenBefore.length).toBe(0);
    
    // Click the folder to expand it
    await clickFolder(client, "Concepts");
    
    // Wait for the CSS animation / React re-render
    await new Promise(r => setTimeout(r, 400));
    
    // Get visible items after expand
    const after = await getVisibleTreeItems(client);
    const childrenAfter = after.filter(p => p.startsWith("Concepts/"));
    
    // Should now have children visible
    expect(childrenAfter.length).toBeGreaterThan(0);
    
    // Take a screenshot for visual review
    await client.takeScreenshot(
      path.resolve(__dirname, "screenshots/folder-expanded.png")
    );
  });
});
```

### Step 9: NPM script for running e2e tests

Add to `crates/app/package.json` scripts:

```json
"test:e2e": "vitest run --config ../../tests/e2e/vitest.config.ts"
```

Or add a root-level `package.json` with:

```json
{
  "scripts": {
    "test:e2e": "npx vitest run --config tests/e2e/vitest.config.ts"
  }
}
```

The simpler approach is to use the `vitest` already installed in `crates/app/node_modules` and reference the e2e config directly.

### Step 10: .gitignore additions

Add to the repo `.gitignore`:
```
tests/e2e/screenshots/
tests/e2e/logs/
```

### Implementation Sequence

| Order | What | Why |
|-------|------|-----|
| 1 | Parameterize socket path in `lib.rs` | Enables test isolation, one-line change |
| 2 | Parameterize Vite port in `vite.config.ts` | Prevents port conflict with dev instance |
| 3 | Create `tests/e2e/tsconfig.json` and `vitest.config.ts` | Foundation for all test files |
| 4 | Create `tests/e2e/client.ts` | Core infrastructure, can be tested standalone |
| 5 | Create `tests/e2e/setup.ts` | Launch/teardown lifecycle |
| 6 | Create `tests/e2e/helpers.ts` | Reusable DOM interaction patterns |
| 7 | Create `tests/e2e/file-tree.spec.ts` | First real test, validates everything works |
| 8 | Add npm script and .gitignore entries | Developer ergonomics |

### Potential Challenges

1. **First-run compilation time**: `cargo tauri dev` compiles Rust on first run. The 120s `hookTimeout` should handle this, but on a cold cache it could be tight. Consider pre-building with `cargo build` before running tests, or documenting that the first run is slow.

2. **Auth token timing**: The `.token` file is written by tauri-plugin-mcp at socket startup. The setup must wait for both the socket file AND the token file to exist before connecting.

3. **Port collision**: If the user has a dev instance running on 1420, the test instance on 1520 is safe. But if they run tests twice simultaneously, they'll collide. Using `process.pid` in the socket path handles socket isolation; port isolation could use a random available port via `net.createServer().listen(0)`.

4. **Process cleanup**: `cargo tauri dev` spawns child processes (vite, the Tauri binary). Killing the parent may not kill children. Use `tauriProcess.kill("SIGTERM")` and also clean up with `process.on("exit", ...)` as a safety net. On macOS, `kill -SIGTERM -${pgid}` can kill the process group.

5. **Visible tree items**: The `offsetParent !== null` check in `getVisibleTreeItems` determines visibility. Items inside collapsed folders have `display: none` via the CSS animation class, so `offsetParent` will be null. This needs verification; if the animation uses `max-height: 0` + `overflow: hidden` instead, we may need to check the parent's class directly.

### Critical Files for Implementation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs` -- socket path parameterization (line 88)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/vite.config.ts` -- Vite port parameterization (line 10)
- `/tmp/tauri-plugin-mcp/mcp-server-ts/src/tools/client.ts` -- reference implementation for the socket client protocol
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx` -- DOM structure with `data-tree-path` / `data-tree-is-folder` attributes (lines 735-736, 853) that the test helpers target
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts` -- `treeExpandedFolders` / `toggleFolder` state management (lines 336, 500, 1098-1104) for understanding expand/collapse behavior

---

