# 2026-03-11 — Subagent Transcript: Explore

**Date:** 2026-03-11 19:47:02
**Agent:** Explore
**Agent ID:** a2b37c33c63234750
**Parent Session:** ab521ffa-ea04-401c-b5d0-261820dca943

---

## User

Investigate why opening any folder in BrainMap always loads the seed dataset (34 notes from "The Book of Why") instead of the actual folder contents.

The user opens `/Users/bsmonteiro/Desktop/LaTex` but sees the seed dataset. The status bar shows "LaTex | 34 nodes · 116 edges" which is the seed dataset count.

Trace the full flow from frontend to backend:

1. Read `crates/app/src-tauri/src/commands.rs` — find the `open_workspace` command and see what path it actually uses
2. Read `crates/app/src-tauri/src/handlers.rs` if it exists — check if the workspace path is being overridden
3. Read `crates/app/src-tauri/src/lib.rs` — check if a default/seed path is hardcoded at startup
4. Read `crates/app/src-tauri/src/main.rs` — check for any hardcoded seed path
5. Check if `Workspace::open()` in `crates/core/src/workspace.rs` has any fallback behavior
6. Look for any `seed` path references in the Tauri crate

The key question: is the path argument from the frontend being ignored or overridden somewhere?

---

## Assistant

I'll trace this flow systematically. Let me start by reading the key files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/src/*.rs"}`

---

## Assistant

Now let me read these files in order:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/main.rs"}`

---

## Assistant

Now let me check lib.rs:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs"}`

---

## Assistant

Now let me check the state.rs to see AppState initialization:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/state.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","limit":100}`

---

## Assistant

Let me continue reading workspace.rs and look for any seed/hardcoded paths:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":100,"limit":200}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"seed|SEED|hardcoded|default.*path","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri"}`

---

## Assistant

Let me search more specifically in the frontend source code:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.ts*"}`

---

## Assistant

Let me check the SegmentPicker and workspaceStore where the open happens:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/SegmentPicker.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts"}`

---

## Assistant

Now let me check the API bridge to see if it's hardcoding a path:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts"}`

---

## Assistant

Now let me check the MockBridge to see if that's where the seed path is hardcoded:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts"}`

---

## Assistant

Interesting! The MockBridge hardcodes seed data. But let me check the environment setup - maybe the app is running in mock mode instead of Tauri mode. Let me check the main app initialization:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/main.tsx"}`

---

## Assistant

Now let me check if there's an environment variable or build config that might be forcing mock mode:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find crates/app -name \"*.json\" -o -name \"*.toml\" -o -name \".env*\" | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -maxdepth 2 -type f \\( -name \"*.json\" -o -name \"*.toml\" -o -name \".env*\" \\) | sort"}`

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

Let me check the Vite and TypeScript build configuration:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -maxdepth 2 -name \"vite.config.*\" -o -name \".env*\" 2>/dev/null | head -5"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/vite.config.ts"}`

---

## Assistant

Now let me trace through the code flow more carefully. Let me check what `find_workspace_root` does in workspace.rs:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"find_workspace_root\\|scan_md_files\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":994,"limit":100}`

---

## Assistant

Good! So the core Workspace::open() correctly scans for `.brainmap` directory and parses all `.md` files. Now let me check if there's any issue with the Tauri dev flow. Let me look more closely at the mock state initialization:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/state.ts","limit":50}`

---

## Assistant

I see — the app can run in two modes: Tauri mode (native) or Mock mode (web dev). The issue is that when running via Vite dev server (`npm run dev` on port 1420), the app may be using MockBridge instead of TauriBridge. Let me verify the isTauri() check and see how the app detects the environment:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"__TAURI__\\|TAURI_DEV_HOST\\|VITE\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/tauri.conf.json"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/tauri.conf.json"}`

---

## Assistant

Perfect! Now I understand the issue. Let me verify it by checking if the app is being run in dev mode through Tauri or through Vite directly. Let me look at the bridge.ts again - the `isTauri()` function checks for `__TAURI__` in the window object:

The core issue is clear now. When the app runs under:
- **Tauri dev mode** (`tauri dev`): `__TAURI__` is available, uses TauriBridge, calls Rust handlers
- **Vite dev mode** (`npm run dev`): `__TAURI__` is NOT available, falls back to MockBridge which always returns seed dataset

Let me confirm that MockBridge ignores the path parameter and verify there are no other fallback mechanisms:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"openWorkspace\\|seed\\|path\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts | head -20"}`

---

## Assistant

Perfect! Line 19 confirms it: `async openWorkspace(_path: string)` — the path parameter is prefixed with an underscore, meaning it's intentionally unused. The function always returns the hardcoded seed data regardless of the path passed in.

Let me now create a comprehensive summary by checking one more thing — whether there are any environment variables or checks that might determine which bridge gets loaded:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -rn \"MockBridge\\|TauriBridge\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.ts\" --include=\"*.tsx\" | grep -v node_modules"}`

---

## Assistant

Perfect. Now I have the complete picture. Let me create a comprehensive analysis document with my findings:

## Summary of Investigation

I've traced the full flow and found **the root cause**: when the app is run in **Vite dev mode** (`npm run dev` on port 1420) instead of **Tauri dev mode** (`tauri dev`), it uses the MockBridge, which always returns the seed dataset (34 notes from "The Book of Why") regardless of the path provided to `openWorkspace()`.

### Flow Analysis

**1. Frontend API Bridge Selection** (`crates/app/src/api/bridge.ts`)
- The `getAPI()` function checks if `__TAURI__` is available in the window object
- If `__TAURI__` exists (Tauri dev mode) → Uses `TauriBridge`
- If `__TAURI__` is NOT available (Vite dev mode) → Falls back to `MockBridge`

**2. TauriBridge** (`crates/app/src/api/tauri.ts`, line 18-20)
```typescript
async openWorkspace(path: string): Promise<WorkspaceInfo> {
  return invoke<WorkspaceInfo>("open_workspace", { path });
}
```
- Correctly passes the path argument to the Tauri command
- Invokes the Rust `open_workspace` handler

**3. MockBridge** (`crates/app/src/api/mock/index.ts`, line 19-26)
```typescript
async openWorkspace(_path: string): Promise<WorkspaceInfo> {
  await mockDelay("openWorkspace");
  return {
    name: "The Book of Why",
    root: "/mock/seed",
    node_count: mockState.notes.size,  // Always 34
    edge_count: mockState.edges.length, // Always 116
  };
}
```
- **The path parameter is intentionally unused** (prefixed with `_`)
- Always returns hardcoded seed dataset stats
- Loads all mock data from `crates/app/src/api/mock/data/graph.json` and `notes.json`

**4. Backend Rust Handler** (`crates/app/src-tauri/src/handlers.rs`, line 9-19)
- When Tauri mode is used, correctly calls `Workspace::open(path)`
- Workspace correctly:
  - Finds `.brainmap` directory via `find_workspace_root(path)` (workspace.rs:994-1013)
  - Scans all `.md` files via `scan_md_files(&root)` (workspace.rs:1015-1028)
  - Parses and indexes the workspace

**5. Tauri Config** (`crates/app/src-tauri/tauri.conf.json`)
- Configured to point frontend dev server to `http://localhost:1420`
- Running `tauri dev` launches both the Tauri backend AND the Vite frontend simultaneously
- **BUT if only `npm run dev` is run**, Vite launches on its own without Tauri context, so `__TAURI__` is unavailable

### The Issue

The user is likely running **`npm run dev`** (Vite only) instead of **`tauri dev`** (Tauri + Vite together). This causes the frontend to fall back to MockBridge, which ignores the folder path and always returns the seed dataset.

### Evidence

- Status bar shows "LaTex | 34 nodes · 116 edges" — exact seed dataset stats (not dynamic)
- MockBridge line 23 hardcodes `root: "/mock/seed"`
- MockBridge's `openWorkspace()` method signature has unused `_path` parameter
- No environment variable or feature flag can override MockBridge behavior once selected

### Files Involved

1. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts` — Bridge selection logic
2. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts` — Tauri bridge (correct path passing)
3. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts` — Mock bridge (ignores path, line 19)
4. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs` — Rust handler (correct implementation)
5. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs` — Core workspace logic (correct scanning)

---

