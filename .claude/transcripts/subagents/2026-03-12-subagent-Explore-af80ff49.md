# 2026-03-12 — Subagent Transcript: Explore

**Date:** 2026-03-12 11:49:00
**Agent:** Explore
**Agent ID:** af80ff49232916caf
**Parent Session:** 279be677-6d3a-444c-a7e0-844e319db25f

---

## User

The user reports that in the BrainMap desktop app (Tauri v2 + React), whenever they:
1. Choose "Open Folder" on the opening screen (SegmentPicker) and navigate to a new location, OR
2. Open a "Recently Opened" segment

...the app ALWAYS defaults to showing the seed/ dataset files and structure, instead of the actual folder they chose.

I need you to do a very thorough investigation of:

1. **SegmentPicker component** - How it handles folder selection and segment opening
2. **segmentStore** - How segments are persisted and loaded
3. **Tauri backend** - How the workspace is initialized/switched (AppState, commands.rs, handlers.rs)
4. **API bridge** - How TauriBridge vs MockBridge are used, and whether MockBridge (which uses seed JSON) might be incorrectly active
5. **App initialization flow** - What happens on app startup, how the workspace path flows from UI → Tauri → Core
6. **Any hardcoded paths** - Look for any hardcoded references to "seed/" or default paths

Key files to explore:
- `crates/app/src-tauri/src/main.rs` or `lib.rs`
- `crates/app/src-tauri/src/commands.rs`
- `crates/app/src-tauri/src/handlers.rs`
- `crates/app/src/components/` - especially SegmentPicker, any workspace-related components
- `crates/app/src/stores/` - segmentStore, uiStore, graphStore, editorStore
- `crates/app/src/api/` - bridge implementations
- `crates/app/src/App.tsx` or main entry point

Trace the COMPLETE flow from:
1. User clicks "Open Folder" → folder picker → selected path → Tauri command → workspace init → file tree population
2. User clicks a recently opened segment → segment path → Tauri command → workspace init → file tree population

Look for:
- Is the workspace path actually being passed to the backend?
- Is there a command to switch/open a different workspace, or does it only init once at startup?
- Does the backend AppState get updated when switching workspaces?
- Is there a fallback to seed/ data anywhere?
- Is MockBridge being used instead of TauriBridge in production?
- Are the stores (graphStore, editorStore, fileTree) properly reset and reloaded when switching workspaces?

Be very thorough - read all relevant files completely.

---

## Assistant

I'll conduct a thorough investigation of this workspace switching bug. Let me start by exploring the key files in the order that matches the data flow.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src -type f -name \"*.rs\" | head -20"}`

---

## Assistant

Now let me read the critical Rust backend files:

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

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

Now let me look at the React frontend, starting with the SegmentPicker and how it opens workspaces:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f \\( -name \"*.tsx\" -o -name \"*.ts\" \\) | grep -i segment | head -10"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/SegmentPicker.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStore.ts"}`

---

## Assistant

Now let me check the workspaceStore:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"workspaceStore.ts\""}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts"}`

---

## Assistant

Now let me check the bridge API implementation to see if MockBridge is being used:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api -type f \\( -name \"*.ts\" -o -name \"*.tsx\" \\)"}`

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

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts"}`

---

## Assistant

Now let me check the graphStore to understand how the graph is loaded and if it's being reset properly:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores -type f -name \"*.ts\" | head -10"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

Now let me check App.tsx to see how the topology is loaded when a workspace opens:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"App.tsx\""}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

Now let me check the mock state to understand what seed data is hardcoded:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/state.ts","limit":100}`

---

## Assistant

Let me check if there's a FileTree component that might be loading files from a hardcoded location:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"*FileTree*\" -o -name \"*Files*\" | head -10"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

Good! The FileTree builds from the graph store nodes. Now let me look at how the workspace path flows through the Tauri initialization. Let me check if there's anything about the Tauri command registration or if there's a problem with how the workspace is being updated in the AppState:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"seed\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src --include=\"*.rs\" 2>/dev/null"}`

---

## Assistant

Good, no hardcoded seed in the Rust backend. Let me search for hardcoded "seed" in the React frontend:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"seed\\|/mock\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.ts\" --include=\"*.tsx\" 2>/dev/null | grep -v \"node_modules\" | grep -v \".test.ts\""}`

---

## Assistant

Excellent! Now let me check the watcher to see if there are any issues with file watching that might be causing old data to persist:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs"}`

---

## Assistant

Now, let me check if there's a development mode detection issue. Let me look at environment variables or build-time flags:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -name \"tauri.conf.json\" -o -name \"Cargo.toml\" | grep -E \"app/src-tauri|app$\" | head -2"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/tauri.conf.json"}`

---

## Assistant

Perfect. Now let me trace one more critical piece - how does the graphStore's `loadTopology` work? Looking back at App.tsx, I see it loads topology when `info` is available. Let me verify if the graph reset happens properly. Let me also check if there's any caching or persistence of the graph store data:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"localStorage\\|sessionStorage\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores --include=\"*.ts\" | grep -v test"}`

---

## Assistant

Good - no graph caching in localStorage. Now let me check the editorStore to see if it properly resets on workspace switch:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","limit":100}`

---

## Assistant

Let me see the clear function:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","offset":100}`

---

## Assistant

Perfect. Now let me check the uiStore for its reset:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 20 \"resetWorkspaceState\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

Perfect! Now let me check the critical question - when openWorkspace is called in the workspaceStore, does it actually trigger a reload of the topology? Let me look at workspaceStore again more carefully, and the flow in App.tsx:

The flow is:
1. SegmentPicker calls `openWorkspace(path)` from workspaceStore
2. workspaceStore's `openWorkspace` calls `api.openWorkspace(path)` which goes to Tauri
3. Tauri backend's `open_workspace` command initializes the workspace
4. App.tsx has a useEffect that watches `info` and calls `loadTopology()` when it changes

Let me verify the critical Tauri command. Let me look once more at the open_workspace flow:

Looking at the code:
- `commands.rs` line 9-35: `open_workspace` takes a path, calls `handlers::handle_open_workspace(&path)`, and stores the workspace in AppState
- `handlers.rs` line 11-22: `handle_open_workspace` calls `Workspace::open_or_init(p)` 

Let me check the Workspace implementation to understand what open_or_init does:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src -name \"*.rs\" -type f | grep -i workspace"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","limit":150}`

---

## Assistant

Excellent! The key is on line 84-96: `open_or_init` calls `load_from_root` which scans and loads all markdown files from the workspace root. This should properly load from whatever path is passed.

Now let me trace back to see if there might be an issue with how the path is being passed. Let me check if there's any debug logging or if I can find a detailed flow. Let me check once more carefully at the SegmentPicker call:

Looking at SegmentPicker.tsx lines 92-104 and 124-149:
- When opening a segment, it calls `openWorkspace(segment.path)` or `openWorkspace(segment.path)`
- The segment.path comes from the form or from the segmentStore

Let me verify the full call chain works correctly by checking the bridge one more time:

Looking at bridge.ts and tauri.ts:
- `getAPI()` returns a TauriBridge (in production with __TAURI__)
- TauriBridge.openWorkspace calls `invoke<WorkspaceInfo>("open_workspace", { path })`

This should pass the path correctly. Now, let me think about what could cause the seed data to show up...

Wait! I found it! Look at the mock/index.ts line 19:

```typescript
async openWorkspace(_path: string): Promise<WorkspaceInfo> {
    await mockDelay("openWorkspace");
    return {
      name: "The Book of Why",
      root: "/mock/seed",
      node_count: mockState.notes.size,
      edge_count: mockState.edges.length,
    };
  }
```

The MockBridge IGNORES the path parameter and always returns seed data! The issue is that MockBridge is being used instead of TauriBridge. Let me check the bridge selection logic again:

Looking at bridge.ts lines 3-21:
```typescript
function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI__" in window;
}

if (isTauri()) {
    const { TauriBridge } = await import("./tauri");
    cachedApi = new TauriBridge();
  } else {
    const { MockBridge } = await import("./mock/index");
    cachedApi = new MockBridge();
  }
```

So MockBridge is used when `__TAURI__` is not in window. This would happen if:
1. Running in development mode (dev server) without Tauri
2. Building the frontend for Tauri but Tauri isn't properly initialized

Let me check the development setup and if there's an issue with Vite/dev mode:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -name \"vite.config.ts\" -o -name \"tsconfig.json\" | head -5"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -maxdepth 2 -name \"vite.config.ts\" -o -name \"vite.config.js\""}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/vite.config.ts"}`

---

## Assistant

Now let me check if there's a way that the __TAURI__ global gets injected. Let me look at the built frontend:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"__TAURI__\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri --include=\"*.rs\" --include=\"*.html\" 2>/dev/null | head -10"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri -name \"index.html\" 2>/dev/null"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -maxdepth 2 -name \"index.html\""}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/index.html"}`

---

## Assistant

The __TAURI__ global is injected by Tauri itself at runtime into the window object. So the flow is:
1. When running in production Tauri app: `__TAURI__` will be in window → TauriBridge is used ✓
2. When running in dev mode (vite dev server): `__TAURI__` will NOT be in window → MockBridge is used

Wait... Let me reconsider. The user reports the problem happens when they:
1. Choose "Open Folder" on opening screen AND navigate to a location
2. OR open a "Recently Opened" segment

Both use `openWorkspace(path)` from the SegmentPicker. But what build/runtime are they using? Let me check if there's a compiled app vs dev mode issue.

Let me look at the tauri.conf.json again - it has `"devUrl": "http://localhost:1420"`. This is the dev server. So when running `npm run tauri dev`, the Tauri app connects to the dev server at port 1420, and in THAT context, __TAURI__ SHOULD be available because Tauri injects it.

However, there's a possibility: **if the user is running just `npm run dev` (the vite dev server) without Tauri wrapping it**, then __TAURI__ won't be available!

But more importantly, I need to check: Does the TauriBridge actually get the path to the Rust backend? Let me verify the Tauri command invocation one more time very carefully.

Actually, wait. Let me re-read the problem statement. The user says when they open a folder or recently-opened segment, it ALWAYS shows seed data. But the `MockBridge.openWorkspace` line 19 explicitly ignores the path:

```typescript
async openWorkspace(_path: string): Promise<WorkspaceInfo> {
```

The `_path` with underscore means it's intentionally unused. And it always returns seed data.

So the issue is: **MockBridge is being used instead of TauriBridge**.

This happens when `typeof window !== "undefined" && "__TAURI__" in window` is false.

Now, the question is: WHY would __TAURI__ not be available?

Let me check if there's maybe an issue with how Tauri initializes. Actually, let me look for any scripts or package.json to understand the build/run flow:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json"}`

---

## Assistant

So the scripts are:
- `npm run dev`: Runs Vite dev server (no Tauri) → MockBridge would be used
- `npm run build`: Builds React + Tauri app → TauriBridge should be used
- `npm run tauri`: Runs Tauri CLI

Actually, I should check: is there a `tauri dev` command? That should run the Tauri dev with the frontend. Let me check the Tauri config again for the dev command:

Looking at tauri.conf.json:
- `"devUrl": "http://localhost:1420"` - points to Vite dev server
- `"beforeDevCommand": "npm run dev"` - runs Vite dev server before Tauri dev

So the full flow for `npm run tauri dev` should be:
1. Start Vite dev server on :1420
2. Start Tauri dev which loads the app and points to :1420
3. Tauri injects `__TAURI__` into window
4. Bridge should use TauriBridge

BUT! There's a critical detail I missed. Let me look at the dist folder to see if there's a pre-built version:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/dist 2>/dev/null | head -20"}`

---

## Assistant

There IS a built dist! So the tauri.conf.json points to `"../dist"` which means when building for release, it uses the pre-built React. Let me check when the dist was built:

The dist was built on Mar 11 21:01. That's recent.

Now, the critical question is: **When the user opens a folder, is the path actually being sent to the Tauri backend?**

Let me trace through super carefully one more time:

SegmentPicker.tsx line 140:
```typescript
await openWorkspace(segment.path);
```

Where `openWorkspace` comes from `useWorkspaceStore` (imported on line 2).

Looking at workspaceStore.ts lines 36-46:
```typescript
openWorkspace: async (path: string) => {
    set({ isLoading: true, error: null });
    try {
      const api = await getAPI();
      const info = await api.openWorkspace(path);
      ...
    }
}
```

So it calls `api.openWorkspace(path)`.

The API is obtained from `getAPI()` in bridge.ts. If __TAURI__ is available, it returns TauriBridge, otherwise MockBridge.

If it's TauriBridge (line 18-19 in tauri.ts):
```typescript
async openWorkspace(path: string): Promise<WorkspaceInfo> {
    return invoke<WorkspaceInfo>("open_workspace", { path });
  }
```

This invokes the Tauri command "open_workspace" with the path!

So the issue must be: **__TAURI__ is not available when it should be**.

Let me think about when this could happen:
1. **Running Vite dev server directly** (`npm run dev`) without Tauri → MockBridge used ✓ This would explain it!
2. **Tauri build issue** where __TAURI__ isn't injected → Would be a Tauri initialization issue
3. **Runtime issue** where window object isn't initialized yet when bridge is loaded

Actually, wait. Let me check if there's lazy loading of the API. Looking at bridge.ts:

```typescript
let cachedApi: BrainMapAPI | null = null;

export async function getAPI(): Promise<BrainMapAPI> {
  if (cachedApi) return cachedApi;

  if (isTauri()) {
    const { TauriBridge } = await import("./tauri");
    cachedApi = new TauriBridge();
  } else {
    const { MockBridge } = await import("./mock/index");
    cachedApi = new MockBridge();
  }

  return cachedApi;
}
```

The `isTauri()` check happens WHEN THE FIRST API CALL IS MADE. So if `getAPI()` is first called before __TAURI__ is injected, it will cache MockBridge and use it for all subsequent calls!

Let me check when getAPI() is first called in App.tsx:

Looking at App.tsx:
- Line 34: `getAPI().then((api) => { unsubscribe = api.onEvent(...) })` - This is inside a useEffect that runs when info is available

So the first API call happens AFTER info is available, which happens AFTER openWorkspace succeeds.

Wait, let me trace the full flow:
1. SegmentPicker calls `openWorkspace(path)`
2. workspaceStore.openWorkspace calls `getAPI()` and then `api.openWorkspace(path)`
3. THIS IS THE FIRST TIME getAPI() IS CALLED!
4. At this point, __TAURI__ needs to be available

So the question is: **When SegmentPicker calls openWorkspace, is __TAURI__ already in window?**

In a properly running Tauri app, YES, __TAURI__ should be injected before the app code runs.

But what if the user is running `npm run dev` (vite dev server without Tauri)? Then NO, __TAURI__ won't be available, and MockBridge will be cached and used forever!

That must be the issue! The user is probably running:
```bash
npm run dev
```

instead of:
```bash
npm run tauri dev
```

OR there's a build problem where the Tauri app is using old cached seed data, OR there's a race condition where __TAURI__ isn't injected in time.

But actually, I realize I should check one more critical thing: **Is the path actually even being passed correctly from SegmentPicker?**

Looking at SegmentPicker again:
- Line 86: `setActiveSegmentId(segment.id)` - this tracks which segment is opening
- Line 140: `await openWorkspace(segment.path)` - this opens the workspace

The segment.path comes from either:
1. segmentStore (lines 82-84)
2. The pickFolder() call (line 117, 127)

These should all have valid paths. So the issue is not the path.

So the ROOT CAUSE is most likely: **MockBridge is being used instead of TauriBridge because __TAURI__ is not available**.

This happens when:
1. Running `npm run dev` directly (vite dev server, no Tauri)
2. OR Tauri isn't properly injecting __TAURI__ (initialization issue)
3. OR there's a race condition where getAPI() is called before __TAURI__ is injected

I've now completed my thorough investigation. Let me summarize all my findings.

Based on my complete investigation of the BrainMap codebase, I've identified the root cause of the workspace switching bug. Here's my detailed analysis:

## Root Cause

**The app is using `MockBridge` instead of `TauriBridge`, which always returns hardcoded seed data regardless of the selected folder path.**

## How I Found It

The critical code is in `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts`:

```typescript
function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI__" in window;
}

export async function getAPI(): Promise<BrainMapAPI> {
  if (cachedApi) return cachedApi;

  if (isTauri()) {
    const { TauriBridge } = await import("./tauri");
    cachedApi = new TauriBridge();
  } else {
    const { MockBridge } = await import("./mock/index");
    cachedApi = new MockBridge();
  }

  return cachedApi;
}
```

The MockBridge's `openWorkspace` method (in `/crates/app/src/api/mock/index.ts` line 19) **completely ignores the path parameter**:

```typescript
async openWorkspace(_path: string): Promise<WorkspaceInfo> {
    await mockDelay("openWorkspace");
    return {
      name: "The Book of Why",
      root: "/mock/seed",
      node_count: mockState.notes.size,
      edge_count: mockState.edges.length,
    };
  }
```

Notice the underscore prefix on `_path` — it's intentionally unused. MockBridge always returns hardcoded seed data.

## Why This Happens

The `getAPI()` function checks if `__TAURI__` is in the window object. This global is only injected by the Tauri runtime. It gets cached on the **first call**, so:

1. If `__TAURI__` is NOT available when `getAPI()` is first called → MockBridge is cached forever
2. If `__TAURI__` IS available → TauriBridge is cached forever

The first API call happens in `workspaceStore.ts` line 40 when the user clicks to open a workspace in SegmentPicker.

## When MockBridge Gets Used

MockBridge is used when `__TAURI__` is not in the window object, which occurs when:

1. **Running `npm run dev` directly** (Vite dev server without Tauri wrapper) - __TAURI__ won't be injected
2. **Tauri dev not properly initialized** - If `npm run tauri dev` is used but Tauri fails to inject the global
3. **Race condition** - If the first API call happens before Tauri finishes initializing

## Data Flow in Correct Case (TauriBridge)

```
User clicks "Open Folder" / "Recently Opened"
    ↓
SegmentPicker calls openWorkspace(segment.path)
    ↓
workspaceStore.openWorkspace(path) calls getAPI()
    ↓
getAPI() checks __TAURI__ → finds it → returns TauriBridge instance
    ↓
TauriBridge.openWorkspace(path) calls invoke("open_workspace", { path })
    ↓
Tauri backend handlers.rs:handle_open_workspace(path)
    ↓
Workspace::open_or_init(path) loads files from actual folder
    ↓
graphStore.loadTopology() fetches correct topology via Tauri
    ↓
FileTreePanel builds tree from graphStore.nodes (correct data)
```

## Files That Confirm This

**React Frontend:**
- `/crates/app/src/api/bridge.ts` - Selects between TauriBridge and MockBridge
- `/crates/app/src/api/tauri.ts` - Real implementation that invokes Tauri commands
- `/crates/app/src/api/mock/index.ts` - Fake implementation that ignores path parameter
- `/crates/app/src/stores/workspaceStore.ts` - First call to getAPI() happens here
- `/crates/app/src/components/Layout/SegmentPicker.tsx` - User interaction entry point

**Rust Backend:**
- `/crates/app/src-tauri/src/commands.rs` - Registers and handles "open_workspace" command
- `/crates/app/src-tauri/src/handlers.rs` - handle_open_workspace properly calls Workspace::open_or_init
- `/crates/core/src/workspace.rs` - open_or_init scans and loads all markdown from provided path

## Why The Stores Reset Properly But Still Show Old Data

When switching workspaces, the stores DO reset correctly:
- `workspaceStore.closeWorkspace()` resets info
- `useEditorStore.clear()` clears editor state  
- `useGraphStore.reset()` clears graph data
- `useUIStore.resetWorkspaceState()` clears UI focus

But **BEFORE these resets happen**, if MockBridge is used, the new `openWorkspace()` call returns the same seed data, so after the reset and reload, it loads the exact same nodes/edges/structure.

## Why The Path IS Being Passed Correctly

The SegmentPicker code correctly extracts and passes the path:
- From manually typed paths in the form (line 73-74)
- From `pickFolder()` native file dialog (line 127-131)
- From localStorage-persisted segments in segmentStore (line 82-86)

The issue is 100% that the path is being ignored by MockBridge, not that it's not being passed.

## Summary

The user is most likely running `npm run dev` (Vite dev server) instead of `npm run tauri dev` (Tauri app). This prevents `__TAURI__` from being injected into the window, causing the app to use MockBridge which hardcodes seed data and ignores folder selection entirely. Every time they try to open a folder or recently-opened segment, they get the same "Book of Why" seed dataset.

---

