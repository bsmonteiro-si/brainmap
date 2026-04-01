# 2026-03-28 — Subagent Transcript: general-purpose

**Date:** 2026-03-28 14:59:34
**Agent:** general-purpose
**Agent ID:** a760da2be6b3881fc
**Parent Session:** 9b3ab126-4240-4bd6-9a5a-d03c3e8a95d8

---

## User

You are a plan reviewer for BrainMap. Review the following implementation plan and write your findings to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/e2e-test-infrastructure-review-1.md`.

## The Plan

# E2E Test Infrastructure — Initial Setup

## Context

Unit tests miss visual regressions and component interactions. The tauri-plugin-mcp socket is already integrated and proven (used by Claude for visual testing). This plan builds a **deterministic Node.js test runner** that talks to a real running BrainMap app via that socket — no mocks, no AI. The user wants to see the app window during tests (toggleable later, ON for now).

## Architecture

```
vitest (Node.js) → Unix socket → tauri-plugin-mcp (in Tauri app) → real WebView + real Rust backend
```

The test runner sends JSON commands (`execute_js`, `take_screenshot`, `query_page`) over the socket and asserts results. The app window is fully visible.

## Steps

### 1. Parameterize socket path in Rust

**File**: `crates/app/src-tauri/src/lib.rs` (line 33)

```rust
.socket_path(
    std::env::var("BRAINMAP_MCP_SOCKET")
        .unwrap_or_else(|_| "/tmp/brainmap-mcp.sock".to_string())
        .into(),
),
```

### 2. Parameterize Vite port

**File**: `crates/app/vite.config.ts` (lines 10, 18)

```ts
port: parseInt(process.env.VITE_PORT || "1420", 10),
port: parseInt(process.env.VITE_HMR_PORT || "1421", 10),
```

No change to `tauri.conf.json` — test launcher overrides `devUrl` via `TAURI_CONFIG` env var.

### 3. Test directory: `tests/e2e/` with package.json, tsconfig, vitest.config.ts, client.ts, setup.ts, helpers.ts, file-tree.spec.ts

### 4. Socket client (`client.ts`) — ~80 lines, JSON-over-newline protocol, auth token from .token file, typed methods

### 5. Test launcher (`setup.ts`) — copies seed/ to temp, spawns `cargo tauri dev` with env vars, polls for socket, connects client, opens workspace. afterAll kills process and cleans up.

### 6. Helpers — getVisibleTreeItems, clickFolder, isFolderExpanded, waitForTreeLoaded

### 7. First test — expand Concepts folder, assert children visible, take screenshot

### 8. Root package.json with test:e2e script

### 9. .gitignore for screenshots/logs/node_modules

---

## Review Criteria

For each finding:
- **Category**: one of [architecture, scope, edge-case, testing, data-model, performance, clarity]
- **Severity**: one of [blocker, should-fix, suggestion]
- **Finding**: what the problem is
- **Recommendation**: what to do instead

Key context:
- The app uses `crates/app/src-tauri/` (excluded from Rust workspace)
- DOM uses `[data-tree-path]` and `[data-tree-is-folder="1"]` attributes
- Collapsed folders use CSS `grid-template-rows: 0fr` with `overflow: hidden`
- `cargo tauri dev` runs from `crates/app/`
- The existing socket client protocol is at `/tmp/tauri-plugin-mcp/mcp-server-ts/src/tools/client.ts`
- The user wants: (1) isolated app instance, (2) simple test like expanding a folder, (3) visible app window

Do NOT pad with praise. Only real findings.

---

## Assistant



I'll review the plan by first examining the relevant codebase files to understand the current state and validate the plan's assumptions.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs","limit":50}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/vite.config.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/tauri.conf.json"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs","offset":50}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/tauri-plugin-mcp/**/*.ts","path":"/tmp"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/tmp/tauri-plugin-mcp/mcp-server-ts/src/tools/client.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"seed/**/*","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

Now let me check the existing test infrastructure and a few more details.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"tests/e2e/**/*","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/package.json"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"data-tree-path","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","head_limit":20}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"data-tree-is-folder","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","head_limit":10}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"grid-template-rows.*0fr","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","head_limit":10}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"grid-template-rows","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":3}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":725,"limit":30}`

---

## Assistant

Now let me check how `cargo tauri dev` is typically run and whether `TAURI_CONFIG` env override is supported.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"TAURI_CONFIG","path":"/Users/bsmonteiro/Desktop/Personal/brainmap","output_mode":"content","head_limit":10}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"beforeDevCommand","path":"/Users/bsmonteiro/Desktop/Personal/brainmap","output_mode":"content","head_limit":10}`

---

## Assistant

Now I have enough context. Let me check one more thing -- the `.token` file path pattern used by the plugin.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.token\"","path":"/tmp/tauri-plugin-mcp","output_mode":"content","head_limit":20,"glob":"*.rs"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /tmp/tauri-plugin-mcp/src/ 2>/dev/null","description":"List plugin Rust source files"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/tmp/tauri-plugin-mcp/src/socket_server.rs","offset":310,"limit":30}`

---

## Assistant

Now I have all the information I need. Let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/e2e-test-infrastructure-review-1.md","content":"# Plan Review: E2E Test Infrastructure — Initial Setup\n\n**Reviewer**: `

---

## Assistant

The file doesn't exist yet, so I need to use Bash to create it.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"mkdir -p /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans","description":"Create reviews directory"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cat > /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/e2e-test-infrastructure-review-1.md << 'ENDOFFILE'\n# Plan Review: E2E Test Infrastructure — Initial Setup\n\n**Revi`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/e2e-test-infrastructure-review-1.md`.

**Summary of findings:**

- **1 blocker**: The plan uses `TAURI_CONFIG` env var to override `devUrl`, but Tauri v2 does not support that mechanism. Must use `cargo tauri dev --config '{...}'` CLI flag instead. Without this, the test cannot bind a different Vite port to avoid collisions.

- **6 should-fix items**:
  1. Socket path should be unique per test run (PID-based) to avoid stomping a running app
  2. `cargo tauri dev` startup can take 30-120s on cold builds; needs explicit generous timeout in globalSetup
  3. Plan is ambiguous about whether Vite is started by `beforeDevCommand` or separately -- must pick one approach
  4. Seed copy strategy (include `.brainmap/index.db` or not) needs to be explicit
  5. Process cleanup must handle crashes/SIGINT, not just happy-path afterAll
  6. Workspace opening mechanism is unspecified -- app starts at SegmentPicker, not auto-opened

- **3 suggestions**: Collapsed folder visibility uses CSS not DOM removal (tests must check offsetHeight), CI headless mode deserves a future-proofing note, and npm cache workaround should be documented.

---

