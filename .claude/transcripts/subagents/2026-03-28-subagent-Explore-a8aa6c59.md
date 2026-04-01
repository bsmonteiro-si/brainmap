# 2026-03-28 — Subagent Transcript: Explore

**Date:** 2026-03-28 14:48:41
**Agent:** Explore
**Agent ID:** a8aa6c599d53522fb
**Parent Session:** 9b3ab126-4240-4bd6-9a5a-d03c3e8a95d8

---

## User

Explore the BrainMap project's tauri-plugin-mcp integration. I need to understand:

1. How the MCP socket is currently configured in `crates/app/src-tauri/` — find the socket path, how it's initialized, and whether it's already parameterizable via env var.
2. The current Vite dev server configuration — port, how to run it.
3. How the Tauri app is launched (dev mode commands, cargo tauri dev, etc.)
4. Any existing test infrastructure in `tests/e2e/` or similar directories.
5. The tauri-plugin-mcp dependencies — look at Cargo.toml in src-tauri and package.json in crates/app.
6. How the MCP socket protocol works — what commands are available (look at the plugin source or any docs in `.claude/playbooks/tauri-mcp/`).

Be thorough — check package.json scripts, Cargo.toml, lib.rs, main.rs, tauri.conf.json, and any playbook files.

---

## Assistant

I'll systematically explore the BrainMap project's tauri-plugin-mcp integration. Let me start by gathering information about the structure and key configuration files.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -type f -name \"Cargo.toml\" | head -20"}`

---

## Assistant

Now let me explore the key files mentioned. I'll examine the tauri app structure and configuration:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/tauri-plugin/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri -type f -name \"*.rs\" | head -20"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src -type f -name \"*.rs\" 2>/dev/null"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/main.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/state.rs"}`

---

## Assistant

Now let me check for tauri.conf.json and look at the playbook/docs:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -name \"tauri.conf.json\" -o -name \"tauri.conf.js\" 2>/dev/null"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/tauri.conf.json"}`

---

## Assistant

Now let me check for playbooks and docs:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/playbooks -type f 2>/dev/null | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/playbooks/tauri-mcp/00-principles.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/playbooks/tauri-mcp/01-basics.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/playbooks/tauri-mcp/README.md"}`

---

## Assistant

Now let me check for test infrastructure and look at the tauri-plugin source:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -type d -name \"tests\" -o -type d -name \"e2e\" 2>/dev/null | grep -v \"\\.claude\" | grep -v \"target\""}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/tauri-plugin/"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/tauri-plugin -type f"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/tauri-plugin/src/lib.rs"}`

---

## Assistant

The tauri-plugin is just a re-export. Let me check what the actual external tauri-plugin-mcp provides by looking at the git source referenced:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"tauri-plugin-mcp\\|tauri_plugin_mcp\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/ 2>/dev/null"}`

---

## Assistant

Now let me check the frontend JavaScript side that uses the tauri-plugin-mcp:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f \\( -name \"*.ts\" -o -name \"*.tsx\" \\) | head -20"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"tauri-plugin-mcp\\|from.*mcp\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.ts\" --include=\"*.tsx\" 2>/dev/null | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/main.tsx"}`

---

## Assistant

Now let me check the root Cargo.toml and look at the mcp crate:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src -type f"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/lib.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/server.rs"}`

---

## Assistant

Now let me check what commands are available in the tools:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/tools/mod.rs"}`

---

## Assistant

Now let me check for any tests:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates -name \"*.test.ts\" -o -name \"*.test.tsx\" -o -name \"*.spec.ts\" | head -10"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates -path \"*/node_modules\" -prune -o -name \"*.test.ts\" -o -name \"*.test.tsx\" -o -name \"*.spec.ts\" -type f | grep -v node_modules`

---

## Assistant

Now let me look at the root package.json to understand the full dev setup:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/package.json"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap | head -20"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -maxdepth 1 -name \"*.md\" -type f"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/CLAUDE.md"}`

---

## Assistant

Perfect! Now let me check the vite config to understand the dev server setup:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -maxdepth 2 -name \"vite.config.*\" -o -name \"tsconfig.json\" | head -5"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/vite.config.ts"}`

---

## Assistant

Now let me check if there's any environment configuration documentation and look for env vars:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"MCP\\|mcp\\|socket\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs"}`

---

## Assistant

Excellent! Now let me check the research documentation for visual testing:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/research -type f 2>/dev/null"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/research/visual-testing-pipeline.md","limit":150}`

---

## Assistant

Perfect! Now I have comprehensive information. Let me create a structured summary document:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cat /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs | grep -A 15 \"tauri_plugin_mcp\""}`

---

## Assistant

Perfect! Now I have all the information I need. Let me create a comprehensive exploration report:

## Comprehensive Exploration: BrainMap's tauri-plugin-mcp Integration

Based on my thorough investigation of the BrainMap project, here's the complete picture of the tauri-plugin-mcp integration:

---

### 1. MCP Socket Configuration in `crates/app/src-tauri/`

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs` (lines 27-41)

**Current Configuration**:
```rust
.plugin({
    #[cfg(debug_assertions)]
    {
        tauri_plugin_mcp::init_with_config(
            tauri_plugin_mcp::PluginConfig::new("BrainMap".to_string())
                .start_socket_server(true)
                .socket_path("/tmp/brainmap-mcp.sock".into()),
        )
    }
    #[cfg(not(debug_assertions))]
    {
        // No-op in release builds — MCP plugin is dev-only
        tauri::plugin::Builder::new("mcp-noop").build()
    }
})
```

**Key Details**:
- Socket path: **hardcoded** to `/tmp/brainmap-mcp.sock`
- Socket server enabled: `start_socket_server(true)` (active in debug builds only)
- **NOT currently parameterizable** via environment variable — this is a known gap documented in `.claude/research/visual-testing-pipeline.md`
- Initialization happens at app startup in the Tauri builder chain
- Release builds have a no-op plugin to avoid MCP overhead

**Dependency**: `tauri-plugin-mcp` is sourced from Git: `tauri-plugin-mcp = { git = "https://github.com/P3GLEG/tauri-plugin-mcp" }`

---

### 2. Vite Dev Server Configuration

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/vite.config.ts`

**Configuration**:
```typescript
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
});
```

**Key Details**:
- **Port**: 1420 (strict — no fallback to other ports)
- Supports `TAURI_DEV_HOST` environment variable for remote development
- HMR (Hot Module Replacement) configured on port 1421 when host is specified
- File watcher explicitly ignores `src-tauri/` (Rust backend)

**Package Scripts** (from `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json`):
- `npm run dev`: Runs `vite --port 1420`
- `npm run build`: `tsc && vite build`
- `npm run test`: `vitest run`
- `npm run test:watch`: `vitest`
- `npm run tauri`: Delegates to Tauri CLI

---

### 3. Tauri App Launch (Dev Mode)

**Primary Entry**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/tauri.conf.json`

**Build Configuration**:
```json
"build": {
  "frontendDist": "../dist",
  "devUrl": "http://localhost:1420",
  "beforeDevCommand": "npm run dev",
  "beforeBuildCommand": "npm run build"
}
```

**Launch Steps**:
1. From `crates/app/` directory, run: **`npm run tauri dev`** (or `cargo tauri dev`)
2. This command:
   - Executes `beforeDevCommand` → `npm run dev` (starts Vite on port 1420)
   - Waits for Vite to be ready
   - Launches Tauri binary from `src-tauri/`
   - Connects to dev URL at `http://localhost:1420`

**Backend Entry Point**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/main.rs`
```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
fn main() {
    brainmap_app_lib::run();
}
```

**Actual App Initialization**: `src-tauri/src/lib.rs` → `pub fn run()` (lines 12-92)
- Initializes logging from `~/.brainmap/logs`
- Sets up Tauri plugins (dialog, shell, drag, **mcp**)
- Registers Tauri commands (invoke handlers)
- Launches the main event loop

---

### 4. Test Infrastructure

**Frontend Tests**:
- Location: `crates/app/src/**/*.test.ts` and `crates/app/src/**/*.test.tsx`
- Framework: **Vitest** (configured in `package.json`)
- ~59 test files found across components, stores, utils, and hooks
- Run with: `npm run test` (single run) or `npm run test:watch` (watch mode)

**Backend Tests** (Rust):
- Core tests: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/tests/`
- MCP tests: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/tests/`
- CLI tests: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/tests/`
- Run with: `cargo test` or `-p brainmap-core`, `-p brainmap-mcp`, `-p brainmap-cli`

**Visual Testing Infrastructure** (In Progress):
- Documented in `.claude/research/visual-testing-pipeline.md`
- Uses `tauri-plugin-mcp` for headless GUI testing
- Playbook guides in `.claude/playbooks/tauri-mcp/` (01-basics.md, 02-file-tree.md, etc.)
- Frontend logger integration: `crates/app/src/utils/logger.ts` for debug output

**Verification Script**: `./scripts/check.sh` (mentioned in CLAUDE.md)

---

### 5. tauri-plugin-mcp Dependencies

**Cargo.toml** (`crates/app/src-tauri/Cargo.toml`):
```toml
tauri-plugin-mcp = { git = "https://github.com/P3GLEG/tauri-plugin-mcp" }
```

**package.json** (`crates/app/package.json`):
```json
"tauri-plugin-mcp": "^0.1.0"
```

**Other Key Dependencies**:
- **Tauri v2** with features: `protocol-asset`, `devtools`
- **Plugin ecosystem**: dialog, shell, drag (all v2)
- **Frontend**: React 18, CodeMirror 6, Zustand (state), Excalidraw, Mermaid, Cytoscape
- **Rust backend**: serde, tokio, notify (file watcher), tracing (logging)

**Workspace Root Cargo** (`Cargo.toml`):
- Includes: `crates/core`, `crates/cli`, `crates/mcp`
- **Excludes** `crates/app/src-tauri` (Phase 1c, not yet in workspace)

---

### 6. MCP Socket Protocol & Commands

The **BrainMap MCP server** is located in `crates/mcp/` and uses `rmcp` (Rust implementation).

**Available Tools** (24 total + batch):

**Node Tools**:
- `node_get` - Get a note by path
- `node_list` - List notes with filters (type, tag, status, limit, offset)
- `node_create` - Create new note (path, title, type, tags, status, source, summary, content)
- `node_update` - Update note fields
- `node_delete` - Delete note
- `node_move` - Move/rename and rewrite references

**Link Tools**:
- `link_create` - Create typed link (source, target, rel, annotation)
- `link_delete` - Delete link
- `link_list` - List links for note (direction, rel filter)

**Search**:
- `search` - Full-text search (query, type, tag, status filters)

**Graph Tools**:
- `neighbors` - Get graph neighborhood (path, depth, direction, rel)
- `find_path` - Shortest path between two notes
- `subgraph` - Extract subgraph around center note

**Workspace Tools**:
- `status` - Show workspace summary
- `validate` - Validate integrity
- `stats` - Show statistics
- `reindex` - Rebuild search index
- `export` - Export graph (json, dot, graphml formats)
- `config_get` / `config_set` - Workspace configuration
- `federation_list` / `federation_add` / `federation_remove` - Federated workspaces

**Meta**:
- `batch` - Execute multiple operations sequentially (stops on failure)

**Resources** (URIs):
- `brainmap://graph` - Full knowledge graph JSON
- `brainmap://config` - Workspace configuration
- `brainmap://nodes/{path}` - Individual note JSON

**Server Capabilities**:
- Tools: List & call
- Resources: List & read (no subscribe)
- Name: "brainmap", Version: "0.1.0"

**Response Envelope**:
```json
{
  "success": true/false,
  "data": { ... },
  "error": {
    "code": "ERROR_CODE",
    "message": "description"
  }
}
```

---

### 7. Frontend MCP Setup

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/main.tsx` (lines 5-10)

```typescript
// Dev-only: MCP plugin listeners for GUI automation/testing
if (import.meta.env.DEV) {
  import("tauri-plugin-mcp").then(({ setupPluginListeners }) => {
    setupPluginListeners();
  });
}
```

**Key Details**:
- **Dev-only** (gated by `import.meta.env.DEV`)
- Lazily imports the MCP plugin JS bindings
- Calls `setupPluginListeners()` to register IPC handlers
- No manual configuration needed — the socket path is already established by the Rust backend

---

### 8. Known Gaps & Future Work

Per `.claude/research/visual-testing-pipeline.md`:

**Required for Isolated Testing**:
1. **Parameterized Socket Path**: Read from `BRAINMAP_MCP_SOCKET` env var (currently hardcoded)
2. **Parameterized Vite Port**: Support different ports for isolated instances (via `VITE_PORT` or CLI flag)
3. **Direct Socket Client Script**: Node.js script to talk directly to Tauri MCP socket for worktree agents (~50 lines)
4. **App Launcher Script**: Automate full lifecycle (build, launch, wait for socket, return PID)

**Alternative Approach** (simpler):
- Sequential testing: Main app shutdown → worktree build/test on default socket → shutdown
- No custom tooling needed

---

### 9. Key Configuration Files Reference

| File | Purpose |
|------|---------|
| `crates/app/src-tauri/src/lib.rs` | MCP plugin init, Tauri setup, command handlers |
| `crates/app/src-tauri/tauri.conf.json` | Tauri build config (devUrl, frontend dist) |
| `crates/app/vite.config.ts` | Vite dev server (port 1420, HMR) |
| `crates/app/package.json` | Frontend scripts (dev, build, test, tauri) |
| `crates/app/src/main.tsx` | Frontend MCP listener setup (dev-only) |
| `crates/mcp/src/server.rs` | MCP server handler, tool dispatch, resources |
| `.claude/playbooks/tauri-mcp/` | Visual testing guides (18 precise patterns) |
| `.claude/research/visual-testing-pipeline.md` | Architecture decisions, proof of concept |

---

### 10. Architecture Insights

**MCP Integration Flow**:
1. Tauri startup (`src-tauri/src/lib.rs`) → initializes MCP plugin with socket at `/tmp/brainmap-mcp.sock`
2. MCP server listens on Unix socket, connects to workspace
3. Frontend (`main.tsx`) lazily loads MCP JS bindings and registers listeners
4. Claude Code connects via `tauri-mcp` MCP tools (universal escape hatch is `execute_js`)

**Why This Works**:
- Unix socket is fast, local-only, no network overhead
- MCP server is **synchronous** (not async) — all operations lock the workspace
- Screenshot capture is headless-compatible (uses macOS backing store, not window visibility)
- All reliable interactions go through `execute_js` (native click/drag has platform-scaling issues)

**Development Workflow**:
- `npm run tauri dev` from `crates/app/`
- Vite dev server on 1420 + Tauri binary launches
- Hot reload via HMR
- Frontend logs + backend logs unified in `~/.brainmap/logs/brainmap.log.*`

This is the complete technical picture of the BrainMap tauri-plugin-mcp integration. All critical configuration points, dependencies, and extension mechanisms are now documented.

---

