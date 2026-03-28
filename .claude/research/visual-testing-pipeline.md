# Visual Testing Pipeline for BrainMap

## Status: Proof of Concept Complete, Pipeline Design In Progress

**Date**: 2026-03-27
**Goal**: Fully automated feedback loop where Claude Code implements features, visually tests them in the running Tauri app, and merges — all without human intervention on the GUI.

---

## What We Proved Works

### tauri-plugin-mcp Integration

We successfully integrated [tauri-plugin-mcp](https://github.com/P3GLEG/tauri-plugin-mcp) into BrainMap. This gives Claude Code direct access to the running Tauri app via MCP tools.

**Setup (already done):**
- Rust plugin in `Cargo.toml`: `tauri-plugin-mcp = { git = "https://github.com/P3GLEG/tauri-plugin-mcp" }`
- Plugin registered in `lib.rs` (debug builds only), IPC socket at `/tmp/brainmap-mcp.sock`
- Guest JS bindings installed: `npm install tauri-plugin-mcp`
- `setupPluginListeners()` called in `main.tsx` (dev only via `import.meta.env.DEV`)
- MCP server config in `.mcp.json` pointing to locally-built server at `/tmp/tauri-plugin-mcp/mcp-server-ts/build/index.js`
- **Note**: The npm-published `tauri-plugin-mcp-server` package is broken (missing shebang, raw ESM). We cloned and built from source instead.

**What works from the CLI:**

| Capability | Tool/Method | Reliability |
|-----------|-------------|-------------|
| Screenshot the app | `take_screenshot(inline=true)` | Solid |
| Find elements by text | `query_page(mode='find_element', selector_type='text')` | Solid |
| Click elements | `execute_js` with DOM `.click()` | Solid |
| Expand file tree folders | `execute_js` clicking `.tree-item` | Solid |
| Open files | `execute_js` clicking `.tree-item` by label | Solid |
| Navigate sidebar | `execute_js` clicking `.icon-sidebar-btn` by title | Solid |
| Canvas pan | `execute_js` modifying `renderer.__zoom.x/y` + viewport CSS | Solid |
| Canvas zoom | `execute_js` modifying `renderer.__zoom.k` + viewport CSS | Solid |
| Canvas fit view | `execute_js` clicking `.react-flow__controls-fitview` | Solid |
| List canvas nodes | `execute_js` querying `.react-flow__node` elements | Solid |
| Read editor content | `execute_js` reading `.cm-content` textContent | Solid |
| Execute arbitrary JS | `execute_js` | Solid |

**What does NOT work:**

| Attempt | Why It Fails |
|---------|-------------|
| Native `click` tool coordinates | Retina 2x scaling — coordinates land at wrong positions |
| Native `mouse_action(drag)` on React Flow | React Flow uses `setPointerCapture`, ignores synthetic events |
| Dispatching `WheelEvent` for zoom | React Flow's d3-zoom doesn't process synthetic wheel events |
| Dispatching `PointerEvent` sequences | `setPointerCapture` only works with real OS-level input |
| `query_page(mode='map')` on complex views | Times out on large DOMs (canvas with many nodes) |

**Key insight**: `execute_js` is the universal escape hatch. The native click/drag/scroll tools have platform-specific issues. All reliable interactions go through direct DOM manipulation via JS.

### Screenshot Capture Is Headless-Compatible

The plugin uses `xcap::Window::capture_image()` which calls macOS Core Graphics `CGWindowListCreateImage`. This captures the **window's backing store buffer**, meaning:
- The app does NOT need to be in the foreground
- It can be behind other windows or on another desktop/space
- It just needs to be a running process with a live window (not `window.hide()`)

This is critical for the pipeline — the test instance can run in the background.

---

## The Target Pipeline

```
1. User asks for a feature/fix
2. Agent implements in a git worktree (isolation: "worktree")
3. Agent runs unit tests (cargo test, vitest)
4. Agent builds and launches an isolated BrainMap instance from the worktree
5. Agent visually tests the changes using tauri-mcp tools
6. Agent verifies everything, shuts down the test instance
7. Agent merges the worktree branch back into main
```

### Navigation Skill

A skill file was created at `.claude/skills/tauri-mcp-navigate/SKILL.md` with 18 precise, copy-paste-ready patterns for navigating the app. Agents should read this skill before attempting any visual testing.

---

## What Needs To Be Built

### 1. Parameterized Socket Path (Required)

Currently the socket path is hardcoded to `/tmp/brainmap-mcp.sock` in `lib.rs`. For isolated instances, each must use a unique socket.

**Solution**: Read from an environment variable with a fallback:
```rust
let socket_path = std::env::var("BRAINMAP_MCP_SOCKET")
    .unwrap_or_else(|_| "/tmp/brainmap-mcp.sock".to_string());
```

### 2. Parameterized Vite Dev Port (Required)

The Vite dev server runs on `:1420`. Two instances can't share a port.

**Solution**: Set `VITE_PORT` or `--port` flag when launching the worktree instance on a different port (e.g., `:1421`).

### 3. Direct Socket Client Script (Required for Isolated Agents)

MCP server connections are **static per session** — configured at startup via `.mcp.json`. A worktree agent can't dynamically connect to a new MCP server mid-conversation.

**Solution**: Build a small Node.js script (~50 lines) that talks directly to the Tauri MCP socket (same protocol). The agent uses it via Bash:
```bash
node scripts/mcp-client.js --socket /tmp/brainmap-mcp-test.sock screenshot --output /tmp/test.jpg
node scripts/mcp-client.js --socket /tmp/brainmap-mcp-test.sock exec-js "document.querySelector('.tree-item-label').textContent"
```

The agent reads screenshot files from disk using the `Read` tool (which can display images).

### 4. App Launcher Script (Nice to Have)

A script that handles the full lifecycle:
```bash
scripts/launch-test-instance.sh --port 1421 --socket /tmp/brainmap-mcp-test.sock --workspace /path/to/worktree/crates/app
```

Should:
- Build the Tauri app from the worktree
- Launch it with the specified socket/port
- Wait for the socket to become available
- Return the PID for later cleanup

### 5. Alternative: Sequential Approach (Simpler, No Script Needed)

If the user's main app is not running, the worktree agent can:
1. Build and launch on the **default** socket `/tmp/brainmap-mcp.sock`
2. Use the existing `tauri-mcp` MCP tools directly (they're already connected)
3. Test, then shut down

This avoids building any custom tooling but requires the main app to be stopped.

---

## Architecture Decisions

### Why Not Playwright?

- Standard Playwright/WebDriver doesn't work with Tauri on macOS because Tauri uses WKWebView, and there's no native WKWebView driver
- The CDP (Chrome DevTools Protocol) approach only works on Windows (Edge WebView2)
- A [community workaround](https://github.com/danielraffel/tauri-webdriver) exists but is experimental

### Why Not Claude Desktop Computer Use?

- Computer Use is Claude Desktop-only (not available in Claude Code CLI)
- It requires the app to be visually on-screen
- Not automatable from a worktree agent

### Why Not Claude in Chrome?

- Works for web UIs but not for Tauri apps (no `window.__TAURI__` IPC bridge)
- The user reported it as "unreliable and slow"

### Why tauri-plugin-mcp?

- Purpose-built for exactly this use case (Claude Code + Tauri)
- Gives DOM access, screenshot capture, input simulation — all via IPC socket
- Works headlessly (window doesn't need to be visible)
- Already integrated and proven working

---

## Related Files

| File | Purpose |
|------|---------|
| `.mcp.json` | MCP server config (points to locally-built server) |
| `crates/app/src-tauri/Cargo.toml` | Rust dependency on tauri-plugin-mcp |
| `crates/app/src-tauri/src/lib.rs` | Plugin registration (debug-only, socket at `/tmp/brainmap-mcp.sock`) |
| `crates/app/src/main.tsx` | Guest JS bindings init (`setupPluginListeners()`) |
| `/tmp/tauri-plugin-mcp/` | Cloned plugin repo (built MCP server from source) |
| `.claude/skills/tauri-mcp-navigate/SKILL.md` | Navigation patterns skill for agents |

---

## Open Questions

1. **Build time**: Tauri builds take minutes. Should we cache the binary and only rebuild when Rust code changes? For frontend-only changes, just restart the Vite dev server.
2. **Test assertions**: The current patterns verify visually via screenshots. Should we add programmatic assertions (e.g., "the file tree should have N items after expanding")?
3. **Failure recovery**: If the test instance crashes or hangs, how does the agent detect and recover?
4. **Multiple monitors**: The screenshot capture works across monitors. Should we force the test instance to a specific monitor/size for consistent screenshots?
5. **React Flow state sync**: Direct d3-zoom manipulation updates the visual transform but doesn't sync back to React Flow's internal state. Is this a problem for testing interactions that depend on viewport position?
