# E2E Testing for BrainMap — Next Steps

**Date**: 2026-03-28
**Status**: Discussion captured, not yet implemented

## Problem

Unit tests miss visual regressions, component interactions, and nuanced UI behaviors. The MCP-based AI testing approach works but is slow and error-prone when the agent doesn't follow discipline. We need **deterministic, traditional E2E tests** that run without AI.

## Options Evaluated

### 1. Playwright against dev server with MockBridge
- **Rejected** — mocking every `invoke()` call means maintaining a parallel fake backend that drifts from reality. Every new Tauri command requires updating the mock. Nightmare to maintain.

### 2. WebdriverIO + macOS tauri-webdriver workaround
- [github.com/danielraffel/tauri-webdriver](https://github.com/danielraffel/tauri-webdriver)
- Implements W3C WebDriver as a Tauri plugin
- Test framework sends HTTP requests, plugin translates to real WebView interactions
- No mocks — real Rust backend running
- **Viable but experimental** — community project, not officially supported

### 3. tauri-plugin-mcp as the test driver (Recommended)
- **Already integrated** — the IPC socket and guest JS bindings are in place
- A Node.js test runner talks to the socket directly (not through Claude)
- Sends screenshot/click/query/execute_js commands and asserts results
- Same protocol the AI agent uses, but driven by a deterministic test script
- No mocks — real Tauri backend, real WebView

## Recommended Approach: MCP Socket Test Runner

### Architecture

```
tests/e2e/
  client.ts              # Thin Node.js client for the MCP socket protocol (~50 lines)
  fixtures/
    test-workspace/      # Clean workspace with known files
      edges-test/
        test.canvas      # Pre-built canvas with known edges, nodes
      test-note.md       # Known note content
  canvas-edge.spec.ts    # Edge invert, bidirectional toggle tests
  file-tree.spec.ts      # Expand folder, open file tests
  setup.ts               # Launch tauri dev, wait for socket, copy fixtures
```

### Example Test

```ts
import { TauriMcpClient } from "./client";

const client = new TauriMcpClient("/tmp/brainmap-mcp-test.sock");

test("invert edge swaps direction", async () => {
  // Setup: open test workspace with known canvas
  await client.executeJs(`openCanvasFile("test-fixtures/edges.canvas")`);

  // Get before state
  const before = await client.executeJs(`getEdgeDirection("edge-1")`);
  expect(before.source).toBe("node-A");

  // Act: click invert via toolbar
  await client.executeJs(`clickEdgeToolbarButton("edge-1", "Invert direction")`);

  // Assert
  const after = await client.executeJs(`getEdgeDirection("edge-1")`);
  expect(after.source).toBe("node-B");

  // Visual verification
  const screenshot = await client.screenshot();
  expect(screenshot).toMatchSnapshot();
});
```

### What Needs to Be Built

1. **MCP socket client** (`client.ts`) — ~50 lines of Node.js that connects to the IPC socket and sends/receives JSON commands. Same protocol the MCP server uses.

2. **Test fixture workspace** — a directory with known `.canvas` and `.md` files, copied fresh before each test run.

3. **Test launcher** (`setup.ts`) — builds and launches the Tauri app on a separate port/socket, waits for the socket to be ready, copies fixtures, runs tests, shuts down.

4. **Parameterized socket path** — the socket path in `lib.rs` needs to read from an env var so the test instance uses a different socket than the dev instance.

5. **Parameterized Vite port** — same reason, different port for the test instance.

6. **Helper functions** — reusable JS snippets for common interactions (open file, click toolbar button, get edge state). Can be extracted from the playbook patterns.

### Advantages Over Other Approaches

- **No mocks** — tests run against the real Tauri backend
- **Infrastructure already exists** — tauri-plugin-mcp is integrated, socket protocol works
- **Reuses playbook knowledge** — the JS patterns documented in `.claude/playbooks/tauri-mcp/` become the test helpers
- **Screenshot snapshots** — visual regression testing built in
- **Deterministic** — no AI involved, same assertions every time
- **CI-compatible** — just needs a display server (Xvfb on Linux, native on macOS)

### Open Questions

1. **Test isolation** — should each test get a fresh app launch, or can tests share an instance with fixture resets between tests? Fresh launch is slower but more reliable.
2. **Snapshot format** — pixel-perfect or perceptual diff? Tools like `pixelmatch` or `playwright`'s built-in comparator.
3. **CI setup** — Tauri needs a display. macOS runners have native display; Linux needs Xvfb.
4. **Test data management** — should fixtures live in `tests/e2e/fixtures/` or reuse the existing `seed/` directory?
