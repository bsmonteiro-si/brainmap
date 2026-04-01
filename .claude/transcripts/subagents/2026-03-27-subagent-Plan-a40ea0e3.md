# 2026-03-27 — Subagent Transcript: Plan

**Date:** 2026-03-27 17:13:40
**Agent:** Plan
**Agent ID:** a40ea0e3571aad475
**Parent Session:** 1e5f8ef7-185a-4b2c-83cb-fe7660477f40

---

## User

Design an implementation plan for adding external file drag-and-drop support to the BrainMap Tauri v2 + React desktop app. Users should be able to drag files from Finder (or other apps) and drop them into the app to import them into the current workspace/segment.

## Current State

### Tauri Config
- `tauri.conf.json` has `"dragDropEnabled": false` on the window — must be set to `true`
- Tauri v2 provides native drag-drop events: `tauri://drag-enter`, `tauri://drag-over`, `tauri://drag-leave`, `tauri://drag-drop`
- These events provide file paths (not File objects like browser HTML5 drag)

### Backend (Rust)
- `crates/app/src-tauri/src/lib.rs` — Tauri builder, no drag-drop handling
- `crates/app/src-tauri/src/commands.rs` — has `create_plain_file(path, body?)` which creates text files, `write_plain_file(path, body)` for writing text content
- `crates/app/src-tauri/src/handlers.rs` — `handle_create_plain_file` does `std::fs::write(&abs, body.unwrap_or(""))`, `validate_relative_path` prevents path traversal
- No command for importing/copying an external file (binary-safe copy from absolute source path into workspace)
- File watcher already monitors workspace for changes

### Frontend (React)
- `FileTreePanel.tsx` — has internal drag-drop for reordering/moving files within the tree. Uses `application/brainmap-path` custom data types. Root drop handler at line 1445. Item drop handler at line 1244.
- `AppLayout.tsx` — main layout component
- `api/types.ts` — `BrainMapAPI` interface, no `importFile` method
- `api/TauriBridge.ts` — implements BrainMapAPI via Tauri invoke
- Stores: `workspaceStore.ts` has `info.root` (workspace root path), `segmentStore.ts` has active segment

### What needs to happen
1. Enable `dragDropEnabled: true` in tauri.conf.json
2. Add a new Tauri command `import_files` that copies external files (binary-safe) into the workspace at a target relative directory, handling name conflicts
3. Add frontend handling:
   - Option A: Use Tauri's native `tauri://drag-drop` event which provides absolute file paths — simpler, no need for File API
   - Option B: Use HTML5 drag events on the FileTreePanel
   
   Since Tauri's native events give us absolute paths and we need to copy files from external locations, Option A (Tauri events) is the natural choice.

4. Visual feedback: show a drop overlay when dragging external files over the app
5. Determine target folder: if dropping on a folder in the tree, import into that folder; if dropping on the general area, import to root

### Key considerations
- Binary files (images, PDFs, videos) must be copied byte-for-byte, not as text
- Name conflicts: if `photo.png` exists, generate `photo (1).png` etc.
- The existing internal drag-drop (reorder/move) must continue working — need to distinguish internal vs external drags
- After import, the file watcher should pick up the new files, OR we can explicitly emit events
- Multiple files should be supported in a single drop
- Folders dragged from Finder should be recursively copied
- Path traversal protection must be maintained

Please provide a detailed implementation plan with specific file changes needed.

---

## Assistant



I'll explore the codebase to understand the current architecture and then design a detailed implementation plan.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/","description":"List top-level directory"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/","description":"List Tauri source files"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/","description":"List frontend source files"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs"}`

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

Now let me look at the commands.rs file in parts, the frontend files, and the tauri config.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","limit":100}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/tauri.conf.json","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/tauri.conf.json"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/TauriBridge.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/TauriBridge*","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/","description":"List API directory"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts"}`

---

## Assistant

Now let me look at the FileTreePanel and the key frontend components.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/","description":"List components directory"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/FileTreePanel*","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"wc -l /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","description":"Count lines in FileTreePanel"}`

---

## Assistant

Let me read the key drag-drop sections of FileTreePanel.tsx.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":60,"offset":1}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":80,"offset":1220}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":80,"offset":1420}`

---

## Assistant

Now let me look at the stores and the watcher for understanding event emission.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs","limit":60}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts","limit":50}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":50,"offset":1680}`

---

## Assistant

Now let me check the `commands.rs` for the `create_plain_file` command and the `AppLayout.tsx`.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","limit":100,"offset":200}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/AppLayout*","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx","limit":80}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"create_plain_file|import_file","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","limit":80,"offset":590}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs","limit":80,"offset":60}`

---

## Assistant

Now let me check how the `segmentStore` determines the active path/folder context for drops.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStore.ts","limit":40}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs","limit":30}`

---

## Assistant

Now I have a thorough understanding of the codebase. Let me check one more thing - the Cargo.toml for existing dependencies.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/Cargo.toml"}`

---

## Assistant

I now have all the information I need. Let me compose the detailed implementation plan.

---

## Implementation Plan: External File Drag-and-Drop Support

### Overview

This plan adds the ability to drag files from Finder (or other external apps) into BrainMap to import them into the workspace. It requires changes across three layers: Tauri config, Rust backend (new `import_files` command), and React frontend (Tauri native drag-drop event listener + visual overlay).

---

### Phase 1: Enable Native Drag-Drop in Tauri Config

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/tauri.conf.json`

Change line 20 from `"dragDropEnabled": false` to `"dragDropEnabled": true`.

**Impact:** Once enabled, Tauri will emit `tauri://drag-enter`, `tauri://drag-over`, `tauri://drag-leave`, and `tauri://drag-drop` events to the webview. These events carry `DragDropEvent` payloads with absolute file paths. The existing HTML5 internal drag-drop in FileTreePanel uses `application/brainmap-path` custom MIME types -- these are set via `e.dataTransfer.setData()` and are completely orthogonal to Tauri's native drag events, so they will not conflict.

---

### Phase 2: Rust Backend -- New `import_files` Command

#### 2a. New handler in `handlers.rs`

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs`

Add a new function `handle_import_files`:

```rust
pub fn handle_import_files(
    ws: &Workspace,
    source_paths: &[String],      // absolute paths from Finder
    target_relative_dir: &str,    // relative dir within workspace (e.g. "" for root, "notes/images")
) -> Result<Vec<String>, String>
```

Logic:
1. Validate `target_relative_dir` using existing `validate_relative_path` (pass `target_relative_dir` or `target_relative_dir + "/dummy"` to ensure it stays within workspace root). If `target_relative_dir` is empty string, use workspace root directly.
2. Ensure `ws.root.join(target_relative_dir)` exists (create with `create_dir_all` if needed).
3. For each source path in `source_paths`:
   - Verify the source path exists on disk.
   - If it is a file: copy it into the target dir using `std::fs::copy` (binary-safe). Handle name conflicts by appending `(1)`, `(2)`, etc. before the extension.
   - If it is a directory: recursively copy the entire directory tree using a helper function. The top-level folder name is preserved; if it conflicts, apply the same `(N)` suffix scheme to the folder name.
   - Collect the resulting relative paths (relative to workspace root) of all imported files.
4. Return the vector of imported relative paths.

Name conflict resolution helper:
```rust
fn deduplicate_name(dir: &Path, name: &str) -> String {
    if !dir.join(name).exists() { return name.to_string(); }
    let stem = Path::new(name).file_stem()...;
    let ext = Path::new(name).extension()...;
    for i in 1.. {
        let candidate = if ext.is_some() { format!("{} ({}).{}", stem, i, ext) }
                         else { format!("{} ({})", stem, i) };
        if !dir.join(&candidate).exists() { return candidate; }
    }
}
```

Recursive directory copy helper:
```rust
fn copy_dir_recursive(src: &Path, dst: &Path, base: &Path, out: &mut Vec<String>) -> Result<(), String>
```
This copies all files and subdirectories from `src` into `dst`, recording each copied file's path relative to `base` into `out`. It should skip symlinks for safety (matching the pattern in `delete_remaining_files_recursive`).

#### 2b. New command in `commands.rs`

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs`

Add a new Tauri command:

```rust
#[tauri::command]
pub fn import_files(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    source_paths: Vec<String>,
    target_dir: String,       // relative dir, "" for workspace root
) -> Result<Vec<String>, String>
```

Pattern follows `create_plain_file`:
1. `state.resolve_root(None)?` to get the active workspace root.
2. Call `handlers::handle_import_files(ws, &source_paths, &target_dir)`.
3. Register expected writes for each imported file path (to suppress watcher duplicate events).
4. Call `emit_files_changed_event(&app, &root, imported_paths, vec![])` to notify the frontend.
5. Return the list of imported relative paths.

#### 2c. Register the command in `lib.rs`

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs`

Add `commands::import_files` to the `invoke_handler` list (after line 68, near other file-related commands).

#### 2d. Optional DTO (not strictly needed)

The command takes `Vec<String>` and `String` as params and returns `Vec<String>` -- all primitive types that Tauri serializes natively. No new DTO struct is needed in `dto.rs`.

---

### Phase 3: Frontend -- API Layer

#### 3a. Add `importFiles` to `BrainMapAPI` interface

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts`

Add to the `BrainMapAPI` interface:
```typescript
importFiles(sourcePaths: string[], targetDir: string): Promise<string[]>;
```

#### 3b. Implement in `TauriBridge`

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts`

Add:
```typescript
async importFiles(sourcePaths: string[], targetDir: string): Promise<string[]> {
  return invoke<string[]>("import_files", { sourcePaths, targetDir });
}
```

#### 3c. Add mock implementation

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts` (or wherever MockBridge is)

Add a stub that returns an empty array or logs a warning.

---

### Phase 4: Frontend -- Drag-Drop Event Handling

#### 4a. Create a custom hook `useExternalDragDrop`

**New file:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/hooks/useExternalDragDrop.ts`

This hook:
1. Listens to Tauri's native drag-drop events via `listen` from `@tauri-apps/api/event`.
2. Manages state: `isDraggingExternal: boolean` and `dragPaths: string[]`.
3. On `tauri://drag-enter`: set `isDraggingExternal = true`, store the file paths.
4. On `tauri://drag-leave`: set `isDraggingExternal = false`.
5. On `tauri://drag-drop`: 
   - Extract the dropped file paths from the event payload.
   - Determine the target directory (passed in or defaulting to workspace root `""`).
   - Call `api.importFiles(paths, targetDir)`.
   - Set `isDraggingExternal = false`.
6. Returns `{ isDraggingExternal, dragPaths }`.

The Tauri v2 drag-drop event payload shape is:
```typescript
type DragDropEvent = 
  | { type: "enter"; paths: string[]; position: { x: number; y: number } }
  | { type: "over"; position: { x: number; y: number } }
  | { type: "leave" }
  | { type: "drop"; paths: string[]; position: { x: number; y: number } }
```

These are emitted on the `tauri://drag-drop` event (single event name, discriminated by `type` field in Tauri v2).

**Key design decision:** The hook should be mounted at the `AppLayout` level so it captures drags over the entire window. Drop target resolution (which folder) happens based on cursor position at drop time.

#### 4b. Determine drop target folder from cursor position

Two approaches, in order of complexity:

**Simple approach (recommended for v1):** When external files are dropped, import them into the workspace root (`""`). This is the simplest and most predictable behavior. A toast notification shows "Imported N files to workspace root."

**Enhanced approach (v2 follow-up):** On `tauri://drag-over` events, use the position `{x, y}` from the payload to hit-test against the FileTreePanel's folder elements using `document.elementFromPoint(x, y)`. If the element has a `data-folder-path` attribute (needs to be added to folder nodes in FileTreePanel), use that as the target directory.

For the initial implementation, I recommend the simple approach. The enhanced folder-targeting can be added later.

#### 4c. Integrate into `AppLayout.tsx`

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx`

1. Call `useExternalDragDrop()` at the top of `AppLayout`.
2. When `isDraggingExternal` is true, render a full-window overlay:
   ```tsx
   {isDraggingExternal && (
     <div className="external-drop-overlay">
       <div className="external-drop-overlay-content">
         <span>Drop files to import into workspace</span>
       </div>
     </div>
   )}
   ```

#### 4d. CSS for the drop overlay

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` (or a new CSS file)

```css
.external-drop-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(var(--accent-rgb), 0.08);
  border: 3px dashed var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none; /* let Tauri native events pass through */
}
```

---

### Phase 5: Distinguishing Internal vs External Drags

This is critical. The existing internal drag-drop in `FileTreePanel.tsx` uses HTML5 `dragstart`/`dragover`/`drop` events with `e.dataTransfer.setData("application/brainmap-path", ...)`. Tauri's native drag-drop events (`tauri://drag-drop`) are a separate event channel -- they only fire for files dragged from outside the webview.

**No conflict exists** because:
- Internal drags use React's `onDragStart`/`onDragOver`/`onDrop` event handlers on DOM elements.
- External drags use Tauri's event system (`listen("tauri://drag-drop", ...)`).
- The two never overlap: dragging within the webview does not trigger Tauri native events; dragging from Finder does not trigger HTML5 drag events with `application/brainmap-path` data.

However, there is one subtlety: with `dragDropEnabled: true`, the browser's default drag-drop behavior for files dragged from outside will also fire HTML5 `dragover`/`drop` events on the DOM. The existing `handleRootDrop` in FileTreePanel checks for `application/brainmap-path` data and only acts if it is present -- so it will safely no-op on external drops. But to be defensive, add `e.preventDefault()` in the Tauri event handler's `drag-enter` phase, and also add a global HTML5 `dragover`/`drop` handler on `document` to prevent the browser from navigating to the dropped file:

In `useExternalDragDrop.ts`:
```typescript
useEffect(() => {
  const preventDefault = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  document.addEventListener("dragover", preventDefault);
  document.addEventListener("drop", preventDefault);
  return () => {
    document.removeEventListener("dragover", preventDefault);
    document.removeEventListener("drop", preventDefault);
  };
}, []);
```

**Important:** This must NOT interfere with internal drags. Since internal drags already call `e.preventDefault()` in their handlers, and the global handler on `document` fires after the specific element handlers (due to bubbling), this should be safe. The `stopPropagation` call should NOT be used on the document-level handler since internal drags need propagation. Actually, revising: use `e.preventDefault()` only (not `stopPropagation`) at the document level. This prevents the browser's default file-open behavior without breaking internal drag-drop propagation.

---

### Phase 6: Error Handling and Edge Cases

1. **Permission errors:** If a file cannot be read (permission denied), the Rust handler should skip it and include it in an error list returned alongside the successful imports. Consider returning `Result<ImportResult, String>` where `ImportResult` has `imported: Vec<String>` and `failed: Vec<(String, String)>` (path, reason).

2. **Large files:** No size limit is enforced at the import level (the copy is binary and streaming via `std::fs::copy`). However, consider logging a warning for files over 500MB.

3. **Hidden files / `.brainmap` directory:** The handler should reject imports that would land inside the `.brainmap` metadata directory. Add a check in `handle_import_files` that the resolved target path does not fall within `ws.root.join(".brainmap")`.

4. **Empty drop:** If `source_paths` is empty, return early with an empty vec.

---

### Summary of File Changes

| File | Change |
|------|--------|
| `tauri.conf.json` | `dragDropEnabled: true` |
| `handlers.rs` | Add `handle_import_files`, `deduplicate_name`, `copy_dir_recursive` |
| `commands.rs` | Add `import_files` command |
| `lib.rs` | Register `commands::import_files` in invoke_handler |
| `types.ts` | Add `importFiles` to `BrainMapAPI` |
| `tauri.ts` | Implement `importFiles` in TauriBridge |
| `useExternalDragDrop.ts` (new) | Hook for Tauri native drag-drop events |
| `AppLayout.tsx` | Mount hook, render drop overlay |
| `App.css` | Drop overlay styles |
| Mock bridge | Add `importFiles` stub |

### Implementation Order

1. Config change (`tauri.conf.json`) -- trivial
2. Rust backend (`handlers.rs` then `commands.rs` then `lib.rs`) -- the core logic
3. API layer (`types.ts`, `tauri.ts`) -- thin wiring
4. Frontend hook and overlay (`useExternalDragDrop.ts`, `AppLayout.tsx`, CSS)
5. Testing: drag a PNG from Finder, verify it appears in workspace; drag a folder; drag to root; check name conflict resolution

### Critical Files for Implementation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts`

---

