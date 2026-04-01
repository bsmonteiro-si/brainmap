# 2026-03-16 — Subagent Transcript: Plan

**Date:** 2026-03-16 15:28:23
**Agent:** Plan
**Agent ID:** aaf1ed4339777cc44
**Parent Session:** cf79b56d-b1f5-4194-84f5-dd1631448857

---

## User

Design an implementation plan for a "Refresh Segment" feature in BrainMap.

## Goal
Add a Refresh function that re-reads all files from disk and rebuilds the entire workspace state (graph, file tree, etc.) for the active segment. This helps when file creation/update/deletion takes time to reflect via the file watcher.

## Current Architecture

### Backend (Rust/Tauri)
- `crates/app/src-tauri/src/commands.rs`: Tauri commands. Uses `AppState` with per-slot locking (`RwLock<HashMap<String, Arc<Mutex<WorkspaceSlot>>>>`)
- `WorkspaceSlot` = `{ workspace: Workspace, expected_writes: HashSet<PathBuf> }`
- `Workspace::open_or_init(path)` in `crates/core/src/workspace.rs` builds a fresh Workspace from disk (scans all .md files, builds graph, FTS5 index)
- Helper functions: `state.with_slot_mut(&root, |slot| { ... })`, `state.resolve_root(None)?` gets active root
- `workspace_info_from_slot(slot)` builds WorkspaceInfoDto

### Frontend (React/TypeScript)
- `BrainMapAPI` interface at `crates/app/src/api/types.ts` — all API methods
- `TauriBridge` at `crates/app/src/api/tauri.ts` — invokes Tauri commands
- `MockBridge` at `crates/app/src/api/mock/index.ts` — in-memory mock
- `graphStore.loadTopology()` — fetches graph topology + workspace files from backend and replaces store state
- `workspaceStore` at `crates/app/src/stores/workspaceStore.ts` — has `openWorkspace()`, `switchSegment()`, `refreshStats()` actions
- Keyboard shortcuts registered in `App.tsx` via `useEffect` with `isMod = e.metaKey || e.ctrlKey`
- `StatusBar` at `crates/app/src/components/StatusBar/StatusBar.tsx` — shows segment name, active note path, dirty indicator

## Proposed Approach

### Backend
Add a `refresh_workspace` Tauri command that:
1. Gets active root via `state.resolve_root(None)?`
2. Locks the slot via `state.with_slot_mut`
3. Calls `Workspace::open_or_init()` with the same root path to rebuild from disk
4. Replaces `slot.workspace` with the fresh instance
5. Clears `slot.expected_writes`
6. Returns `WorkspaceInfoDto`

This is simpler and more reliable than trying to diff — it's a full rebuild, which is exactly what "refresh" means.

### Frontend
1. Add `refreshWorkspace()` to `BrainMapAPI` interface
2. Add `refreshWorkspace()` to `TauriBridge` (invokes `refresh_workspace`)
3. Add `refreshWorkspace()` to `MockBridge` (no-op, return current info)
4. Add `refreshSegment()` action to `workspaceStore` that:
   - Calls `api.refreshWorkspace()`
   - Calls `graphStore.loadTopology()` to reload everything
   - Calls `refreshStats()` to update stats
5. Add RefreshCw button in StatusBar next to segment name
6. Add Cmd+Shift+R keyboard shortcut in App.tsx

Please design the detailed implementation plan including exact file changes needed.

---

## Assistant



I'll explore the codebase to understand the current patterns and design a detailed implementation plan.

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs"}`

---

## Assistant

Now let me look at the frontend files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

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

Now let me check the workspaceStore and StatusBar.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/StatusBar/StatusBar.tsx"}`

---

## Assistant

Let me check the App.tsx for the keyboard shortcut pattern and the graphStore for loadTopology.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts","limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/state.rs"}`

---

## Assistant

I now have a thorough understanding of the codebase. Here is the detailed implementation plan.

---

## Refresh Segment Implementation Plan

### Overview

Add a "Refresh Segment" feature that fully re-reads all files from disk and rebuilds the workspace state (graph, FTS5 index, file tree) for the active segment. Triggered via a toolbar button (RefreshCw icon) in the StatusBar or via Cmd+Shift+R.

### Step 1: Backend -- Add `refresh_workspace` Tauri command

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs`**

Add a new command function `refresh_workspace`:

```rust
#[tauri::command]
pub fn refresh_workspace(state: State<'_, AppState>) -> Result<WorkspaceInfoDto, String> {
    let root = state.resolve_root(None)?;
    info!(root = %root, "refresh_workspace called");

    state.with_slot_mut(&root, |slot| {
        let path = slot.workspace.root.clone();
        let fresh = brainmap_core::workspace::Workspace::open_or_init(&path)
            .map_err(|e| e.to_string())?;
        slot.workspace = fresh;
        slot.expected_writes.clear();
        Ok(workspace_info_from_slot(slot))
    })
}
```

Key points:
- Uses `resolve_root(None)` to get the active workspace root (same pattern as `get_stats`, `get_graph_topology`, etc.)
- Uses `with_slot_mut` for mutable access to replace the workspace (same pattern as `update_node`, `delete_node`, etc.)
- Calls `Workspace::open_or_init` with the same root path -- this re-scans all `.md` files, rebuilds the graph, and rebuilds the FTS5 index from scratch
- Clears `expected_writes` since the fresh workspace has no pending writes
- Returns `WorkspaceInfoDto` so the frontend gets updated node/edge counts

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs`**

Register the new command in `generate_handler![]` -- add `commands::refresh_workspace` to the list (line 56 area, alongside existing commands).

### Step 2: Frontend API layer

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts`**

Add to the `BrainMapAPI` interface (after `closeWorkspace`):

```typescript
refreshWorkspace(): Promise<WorkspaceInfo>;
```

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts`**

Add to `TauriBridge` class:

```typescript
async refreshWorkspace(): Promise<WorkspaceInfo> {
    return invoke<WorkspaceInfo>("refresh_workspace");
}
```

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts`**

Add to `MockBridge` class (returns current mock state, same as `openWorkspace`):

```typescript
async refreshWorkspace(): Promise<WorkspaceInfo> {
    return {
        name: "The Book of Why",
        root: "/mock/seed",
        node_count: mockState.notes.size,
        edge_count: mockState.edges.length,
    };
}
```

### Step 3: Frontend store -- `refreshSegment` action

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts`**

Add `refreshSegment` to the `WorkspaceState` interface and implementation:

Interface addition:
```typescript
refreshSegment: () => Promise<void>;
```

Implementation (add after `refreshStats`):
```typescript
refreshSegment: async () => {
    const { info } = get();
    if (!info) return;
    set({ isLoading: true, error: null });
    try {
        const api = await getAPI();
        log.info("stores::workspace", "refreshing segment");
        const newInfo = await api.refreshWorkspace();
        const stats = await api.getStats();
        set({ info: newInfo, stats, isLoading: false });
        await useGraphStore.getState().loadTopology();
        log.info("stores::workspace", "segment refreshed", {
            node_count: newInfo.node_count,
            edge_count: newInfo.edge_count,
        });
    } catch (e) {
        log.error("stores::workspace", "failed to refresh segment", { error: String(e) });
        set({ error: String(e), isLoading: false });
    }
},
```

This action:
1. Calls `api.refreshWorkspace()` to rebuild the backend workspace from disk
2. Calls `api.getStats()` to get fresh stats
3. Updates workspace info and stats in the store
4. Calls `graphStore.loadTopology()` to reload the full graph topology and workspace files into the frontend

Note: We do NOT clear the editor state or tabs. The user may have unsaved changes. The graph/file-tree will update, and the next time they switch to a tab, the content will be re-read from the (now-refreshed) backend. If the currently-open note was deleted on disk, the user will see an error on next save, which is acceptable behavior.

### Step 4: StatusBar -- Add refresh button

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/StatusBar/StatusBar.tsx`**

Changes:
1. Import `RefreshCw` from `lucide-react` (add to existing import)
2. Import `refreshSegment` from workspace store
3. Add a refresh button next to the segment switcher button, before the active note display

```tsx
const refreshSegment = useWorkspaceStore((s) => s.refreshSegment);
const isLoading = useWorkspaceStore((s) => s.isLoading);
```

Add a button element after the segment switcher `<div>` and before the `activeNote` conditional:

```tsx
<button
    className="status-bar-refresh"
    onClick={refreshSegment}
    disabled={isLoading || switchInProgress}
    title="Refresh segment (Cmd+Shift+R)"
    aria-label="Refresh segment"
>
    <RefreshCw size={12} className={isLoading ? "spin" : ""} />
</button>
```

Add CSS for the spin animation and button styling in `App.css` (or wherever StatusBar styles live):

```css
.status-bar-refresh {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 2px 4px;
    display: flex;
    align-items: center;
}
.status-bar-refresh:hover {
    color: var(--text-primary);
}
.status-bar-refresh:disabled {
    opacity: 0.5;
    cursor: default;
}
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
.status-bar-refresh .spin {
    animation: spin 1s linear infinite;
}
```

### Step 5: Keyboard shortcut -- Cmd+Shift+R

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx`**

Add to the `handleKeyDown` callback, alongside the other `isMod` shortcuts (e.g., after the Cmd+0 zoom reset block around line 200):

```typescript
if (isMod && e.shiftKey && e.key === "r") {
    e.preventDefault();
    useWorkspaceStore.getState().refreshSegment();
}
```

Important: This must be checked before any general `isMod && e.key === "r"` handler if one exists (there isn't one currently). The `e.shiftKey` check distinguishes it from browser reload (Cmd+R).

### Step 6: Tests

**Vitest unit tests** -- Add to existing test files or create a new test file:

1. Test `refreshSegment` action in workspaceStore:
   - Mock the API to return updated info/stats
   - Verify store state updates (info, stats, isLoading transitions)
   - Verify `loadTopology` is called on graphStore

2. Test `refreshWorkspace` in MockBridge:
   - Verify it returns valid WorkspaceInfo

3. Test the keyboard shortcut registration (optional, lower priority since the shortcut pattern is well-established).

### Edge Cases and Considerations

1. **Dirty editor state**: The refresh intentionally does NOT clear editor tabs or unsaved changes. The user's in-flight edits are preserved. This matches Obsidian's behavior where "vault reload" updates the file tree but does not discard editor state.

2. **Concurrent operations**: The `with_slot_mut` lock ensures that no other command can access the workspace while the refresh is replacing it. The `isLoading` guard on the button prevents double-clicks.

3. **File watcher interaction**: After refresh, the file watcher continues running (it was not stopped/restarted). The `expected_writes` set is cleared, which is correct since the fresh workspace has no pending writes. The watcher will continue to emit events for subsequent file changes.

4. **Segment cache**: If the user refreshes and then switches segments, `cacheCurrentState` will capture the refreshed state. No special handling needed.

5. **Error recovery**: If `open_or_init` fails (e.g., disk permissions), the old workspace remains in the slot (Rust's ownership means the replacement only happens on success). The frontend shows the error via `set({ error: ... })`.

### File Change Summary

| File | Change |
|------|--------|
| `crates/app/src-tauri/src/commands.rs` | Add `refresh_workspace` command (~15 lines) |
| `crates/app/src-tauri/src/lib.rs` | Register `commands::refresh_workspace` in handler list (1 line) |
| `crates/app/src/api/types.ts` | Add `refreshWorkspace()` to `BrainMapAPI` interface (1 line) |
| `crates/app/src/api/tauri.ts` | Add `refreshWorkspace()` to `TauriBridge` (3 lines) |
| `crates/app/src/api/mock/index.ts` | Add `refreshWorkspace()` to `MockBridge` (~8 lines) |
| `crates/app/src/stores/workspaceStore.ts` | Add `refreshSegment` action (~20 lines) |
| `crates/app/src/components/StatusBar/StatusBar.tsx` | Add RefreshCw button + imports (~10 lines) |
| `crates/app/src/App.tsx` | Add Cmd+Shift+R shortcut (~4 lines) |
| CSS (App.css or StatusBar styles) | Add `.status-bar-refresh` and spin animation (~15 lines) |

### Critical Files for Implementation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs` - Add the `refresh_workspace` Tauri command (core backend logic)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts` - Add `refreshSegment` action orchestrating the full refresh flow
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts` - Add `refreshWorkspace` to the `BrainMapAPI` interface (API contract)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/StatusBar/StatusBar.tsx` - Add the RefreshCw button UI
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx` - Add Cmd+Shift+R keyboard shortcut

---

