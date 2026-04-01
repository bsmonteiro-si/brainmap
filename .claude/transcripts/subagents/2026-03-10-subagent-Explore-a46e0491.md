# 2026-03-10 — Subagent Transcript: Explore

**Date:** 2026-03-10 13:45:34
**Agent:** Explore
**Agent ID:** a46e04914878aa8af
**Parent Session:** 72b750a5-bf77-4d9c-9323-707b5b14b58d

---

## User

Explore the BrainMap desktop app at /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/. I need to understand:

1. How workspaces are currently opened/managed (look at workspaceStore.ts, App.tsx, any "open workspace" UI)
2. What the current first/home screen looks like (is there a landing page, or does it open directly to the graph?)
3. How the Tauri backend manages workspace state (AppState, commands.rs, handlers.rs in src-tauri/)
4. Whether there's any persistence of recently opened paths (localStorage, Tauri store, config files)
5. The current router/navigation structure (is there react-router or just conditional rendering?)

Be thorough — read the key files and report exact file paths, function names, and code patterns.

---

## Assistant

I'll explore the BrainMap desktop app structure systematically to understand workspace management, the home screen, backend state handling, persistence, and navigation.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -type f -name \"*.ts\" -o -name \"*.tsx\" -o -name \"*.rs\" | head -30"}`

---

## Assistant

Let me search in the source directories instead:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.{ts,tsx,rs}","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src 2>/dev/null | head -20"}`

---

## Assistant

Now let me read the key files to understand the architecture:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/main.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/WorkspacePicker.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/src/**/*.rs","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/main.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/state.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src-tauri 2>/dev/null | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src-tauri"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -laR /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri 2>/dev/null | grep -E \"^/|^-\" | head -40"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri -name \"tauri.conf.json\" -o -name \"Cargo.toml\" 2>/dev/null | head -5"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/tauri.conf.json"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs","limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts","limit":60}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts","limit":80}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"localStorage\\|sessionStorage\\|persist\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.ts\" --include=\"*.tsx\" 2>/dev/null | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -name \"vite.config.*\" -o -name \"tsconfig.json\" 2>/dev/null"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/vite.config.ts"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -E \"Router|route|navigate|useNavigate\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/**/*.{ts,tsx} 2>/dev/null | head -15"}`

---

## Assistant

Perfect. Now let me get a final overview by checking if there are any other relevant files for workspace management:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":60}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"recent\\|history\\|path\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs 2>/dev/null | head -20"}`

---

## Assistant

Excellent. Now let me compile a comprehensive report on the findings.

## Desktop App Architecture Exploration Report

Based on my thorough exploration of the BrainMap desktop app, here's what I found:

---

### 1. **Workspace Opening & Management**

**Frontend Flow (React):**
- **File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts`
  - `openWorkspace(path: string)` async function handles opening a workspace
  - Stores: `info` (WorkspaceInfo), `stats` (StatsDto), `isLoading`, `error`
  - Calls API bridge method: `api.openWorkspace(path)`
  - On success, loads stats and clears hidden edge types

**Landing Screen (Home/First Screen):**
- **File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/WorkspacePicker.tsx`
  - This is the **only home/landing page** in the app
  - Renders when `useWorkspaceStore.info === null`
  - Simple form: text input for path + "Open" button, Enter key support
  - Shows loading state + error messages
  - No UI for recent workspaces or file picker yet

**App Root Navigation Logic:**
- **File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx`
  - Line 95: Conditional render: `if (!info) return <WorkspacePicker />`
  - Otherwise renders `<AppLayout />`
  - **No react-router** — purely conditional rendering based on workspace state
  - On workspace open, loads topology and subscribes to live workspace events

---

### 2. **Backend Workspace State (Tauri)**

**State Management:**
- **File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/state.rs`
  - `AppState` struct manages workspace lifecycle:
    ```rust
    pub struct AppState {
        pub workspace: Arc<Mutex<Option<Workspace>>>,
        pub expected_writes: Arc<Mutex<HashSet<PathBuf>>>,
        pub watcher: Arc<Mutex<Option<notify_debouncer_mini::Debouncer<...>>>>,
    }
    ```
  - Helper methods: `with_workspace()` and `with_workspace_mut()` for acquiring locks with error handling
  - Started empty at app init, populated on `open_workspace` command

**Command Handler:**
- **File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs` (lines 8-35)
  - `#[tauri::command] open_workspace(app, state, path)`
  - Calls handler: `handle_open_workspace(&path)` which returns `(Workspace, WorkspaceInfoDto)`
  - Stops old file watcher, replaces workspace in state, starts new watcher
  - Returns `WorkspaceInfoDto` with: `name`, `root`, `node_count`, `edge_count`

**Open Workspace Implementation:**
- **File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs` (lines 8-19)
  - `handle_open_workspace(path: &str)` calls `Workspace::open(Path)`
  - Returns workspace + info DTO (no persistence yet)

---

### 3. **API Bridge Pattern**

**TypeScript Interface:**
- **File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts`
  - `BrainMapAPI` interface defines all operations
  - `openWorkspace(path: string): Promise<WorkspaceInfo>` is the entry point

**Bridge Selection:**
- **File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts`
  - `getAPI()` dynamically loads either:
    - `TauriBridge` (production) — uses `invoke()` from `@tauri-apps/api/core`
    - `MockBridge` (dev/testing) — returns mock seed data

**TauriBridge Implementation:**
- **File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts` (lines 17-20)
  - Maps each API method to Tauri command via `invoke<T>(commandName, params)`
  - Example: `openWorkspace(path) → invoke("open_workspace", { path })`

---

### 4. **Persistence of Recently Opened Paths**

**Current State: NONE**
- No localStorage/Tauri store for recent workspaces
- No config file tracking opened paths
- Each app restart requires manually entering the path

**Limited Persistence:**
- **File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts` (lines 60-66)
  - Only stores **panel sizes** in `localStorage`:
    - Key: `"brainmap:panelSizes"`
    - Saved via: `localStorage.setItem("brainmap:panelSizes", JSON.stringify(...))`
  - Loaded on store creation via `loadStoredSizes()`
  - No workspace path persistence

---

### 5. **Router & Navigation Structure**

**No React Router:**
- No `react-router-dom` dependency
- Navigation is **purely conditional rendering** based on `workspaceStore.info`

**Navigation Logic:**
- **App.tsx**: `info === null` → `<WorkspacePicker />` | otherwise → `<AppLayout />`
- **AppLayout.tsx** (lines 12-18): Uses `react-resizable-panels` with fixed PANEL_IDS:
  ```typescript
  const PANEL_IDS = {
    graph: "graph",
    right: "right",
    editor: "editor",
    inspector: "inspector",
    search: "search",
  } as const;
  ```
- Left panel tabs (lines 78-106): Graph/Files toggle via `useUIStore.toggleTree()`
- Focus mode (lines 134-135): `setGraphFocus(path, kind)` for subgraph navigation
- No hash-based routing or URL-driven navigation

**UI Store Navigation State:**
- **File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`
  - `treeOpen` — Graph/Files panel visibility
  - `focusMode` — full-screen graph focus
  - `graphFocusPath` / `graphFocusKind` — current focus target (note or folder)
  - All keyboard shortcuts (Cmd+P, Cmd+N, Cmd+B, Cmd+S, Escape) handled in `App.tsx`

---

### 6. **Layout & Panel Architecture**

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx`

```
┌─────────────────────────────────────────┐
│ Left Panel (60% default)  │ Right Panel │
├──────────────────────────┤  (40% def)  │
│ Graph / Files tabs       │             │
├──────────────────────────┤ ┌─────────┐ │
│ Graph View OR            │ │ Editor  │ │
│ File Tree                │ │ (60%)   │ │
│ (display: flex/none)     │ ├─────────┤ │
│                          │ │Inspector│ │
│                          │ │ (20%)   │ │
│                          │ ├─────────┤ │
│                          │ │ Search  │ │
│                          │ │ (20%)   │ │
│                          │ └─────────┘ │
└─────────────────────────────────────────┘
```

- Panel sizes persisted to localStorage
- File tree built from node paths (lines 15-60 of FileTreePanel.tsx)

---

### 7. **File Watcher for Live Updates**

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs`
- Watches workspace root recursively for `.md` file changes
- Debounces by 2 seconds
- Only tracks self-writes via `AppState.expected_writes` to avoid re-processing
- Emits `brainmap://workspace-event` to frontend on change (lines 97-99 of tauri.ts)

---

### 8. **Key Files Summary**

| File | Purpose |
|------|---------|
| `/src/App.tsx` | Root: conditional WorkspacePicker or AppLayout based on workspace.info |
| `/src/components/Layout/WorkspacePicker.tsx` | Home/landing screen: text input + path validation |
| `/src/stores/workspaceStore.ts` | Zustand store: workspace state + openWorkspace action |
| `/src/stores/uiStore.ts` | Zustand store: UI state (panels, focus, theme, hidden edges) |
| `/src/stores/graphStore.ts` | Zustand store: graph topology + node selection |
| `/src/api/bridge.ts` | Dynamic API bridge selection (Tauri vs Mock) |
| `/src/api/tauri.ts` | TauriBridge: invokes Tauri commands |
| `/src-tauri/src/state.rs` | AppState: Arc<Mutex<Option<Workspace>>> + watcher |
| `/src-tauri/src/commands.rs` | Tauri command handlers (13 total) |
| `/src-tauri/src/handlers.rs` | Business logic for commands (workspace open, CRUD, search, etc.) |
| `/src-tauri/src/watcher.rs` | File watcher: emits events to frontend on .md changes |
| `/src-tauri/src/lib.rs` | Tauri app builder: initializes AppState, registers commands |
| `/src-tauri/tauri.conf.json` | Tauri config: dev/build setup, window size (1200x800) |
| `/vite.config.ts` | Vite config: dev server on port 1420 |

---

### 9. **Architecture Patterns**

**Single-Page State Machine:**
- App starts in "no workspace" state (WorkspacePicker)
- User enters path → `openWorkspace()` → transitions to "workspace open" state (AppLayout)
- No direct way to switch workspaces or return to picker without restart

**Zustand for State Management:**
- Decentralized stores: `workspaceStore`, `graphStore`, `uiStore`, `editorStore`
- No middleware/persistence plugin (except manual localStorage in uiStore)

**API Abstraction:**
- `BrainMapAPI` interface allows swapping Tauri ↔ Mock easily
- MockBridge used for dev/testing with seed dataset

**Type Safety:**
- TypeScript DTOs manually kept in sync with Rust DTOs in `dto.rs`
- No code generation (hand-written reliability noted in types.ts)

---

### 10. **Current Gaps/Opportunities**

1. **No recent workspace history** — requires manual path entry each time
2. **No file picker UI** — only text input (could use Tauri dialog plugin)
3. **No workspace switcher** — can't switch without restart
4. **No URL-based routing** — deep linking not possible
5. **No workspace config** — workspace metadata not persisted to disk

All absolute paths are documented above for your reference.

---

