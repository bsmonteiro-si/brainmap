# 2026-03-20 — Subagent Transcript: Plan

**Date:** 2026-03-20 12:43:47
**Agent:** Plan
**Agent ID:** ad9acec630e29cff3
**Parent Session:** 67e6a125-b7ea-4d89-9ba3-636e0cd46bc5

---

## User

Design an implementation plan for fixing excalidraw (and other plain file) rename/move in a Tauri v2 + React app.

## Problem
When renaming `.excalidraw` files in the file tree, the operation fails with "Move failed: file not found: Untitled.excalidraw". This happens because:

1. The frontend's `executeMoveOrRename` (FileTreePanel.tsx:1076) calls `api.moveNote()` for ALL non-folder files
2. The backend `workspace.move_note()` (workspace.rs:849) checks `self.notes.contains_key(&old_rp)` — excalidraw files are NOT in `self.notes` (they're plain files, not markdown notes)
3. Same issue in `MoveToDialog.tsx:137`

## Architecture Context
- `workspace.notes` only contains parsed `.md` files with YAML frontmatter
- Excalidraw files are created via `api.writePlainFile()` and read via `api.readPlainFile()` — they're JSON files on disk
- The `TreeNode` interface has `note_type?: string` — for plain files this is `undefined`
- The file tree already has `computeRenamePath` which correctly handles plain file extensions
- Existing API: `readPlainFile`, `writePlainFile` exist but there's no `movePlainFile`
- Tauri commands are in `crates/app/src-tauri/src/commands.rs`, handlers in `handlers.rs`
- API types in `crates/app/src/api/types.ts`, Tauri bridge in `crates/app/src/api/tauri.ts`, mock in `crates/app/src/api/mock/index.ts`

## Requirements
- Rename and move (drag-drop, MoveToDialog) must work for excalidraw files and any other plain files
- Plain file moves are simple filesystem operations (no graph updates, no backlink rewriting needed)
- Tabs should update correctly after rename
- The active excalidraw editor should continue working after rename

## Existing Patterns
- `move_note` command: validates paths, does `fs::rename`, updates graph/index/backlinks
- `move_folder` command: validates paths, does `fs::rename`, triggers topology reload
- `write_plain_file` / `read_plain_file`: simple fs operations with path validation

Design the simplest solution. Consider:
1. Adding a `move_plain_file` Tauri command (simple fs::rename with path validation)
2. Frontend routing: check if file is a note (.md in workspace.notes) vs plain file, call appropriate API
3. Both `executeMoveOrRename` and `MoveToDialog` need the fix
4. How to detect if a file is a note or plain file on the frontend side

---

## Assistant



I'll explore the relevant code to understand the current implementation before designing the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/FileTree/FileTreePanel.tsx","offset":1060,"limit":60}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/MoveToDialog.tsx","offset":120,"limit":50}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/FileTree/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/MoveToDialog.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/FileTree*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/MoveTo*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/*ileTree*"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"executeMoveOrRename","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/MoveToDialog.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":1015,"limit":80}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"move_note|move_plain|move_folder","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"move_note|move_plain|move_folder","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","output_mode":"content","-n":true}`

---

## Assistant

Now let me look at the existing `write_plain_file` / `read_plain_file` commands for the pattern to follow, and the `move_note` handler for reference.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"write_plain_file|read_plain_file|create_plain_file|delete_plain_file","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","output_mode":"content","-n"`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","offset":272,"limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","offset":248,"limit":40}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"handle_write_plain_file|handle_read_plain_file|handle_create_plain_file|handle_delete_plain_file","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs",`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","offset":450,"limit":60}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"validate_relative_path","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","output_mode":"content","-n":true}`

---

## Assistant

Now let me check how `movePlainFile` would be added to the API bridge and how the frontend detects plain files vs notes.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"moveNote|movePlainFile|moveFolder","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"note_type","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content","-n":true,"head_limit":20}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"TreeNode","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content","-n":true,"head_limit":10}`

---

## Assistant

Now let me check the mock bridge and how the Tauri commands are registered.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"moveNote|movePlainFile|moveFolder","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"move_note|move_folder","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts","offset":150,"limit":20}`

---

## Assistant

Now let me look at how `activePlainFile` works in the editor store and check the remaining part of `executeMoveOrRename`.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":1094,"limit":80}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"activePlainFile","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","output_mode":"content","-n":true,"head_limit":15}`

---

## Assistant

Let me check how `MoveToDialog` knows whether the target is a plain file and what data it has.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"moveDialogTarget|openMoveDialog","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":19,"limit":20}`

---

## Assistant

Now I have a clear picture. Let me check the `computeRenamePath` function mentioned in the requirements.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"computeRenamePath","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content","-n":true,"-C":5}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":1236,"limit":20}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":400,"limit":15}`

---

## Assistant

Now let me check the `openPlainFile` method in editorStore to understand the tab/editor update flow for plain files.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"openPlainFile","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","output_mode":"content","-n":true,"-C":3}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":750,"limit":15}`

---

## Assistant

I now have a complete understanding of the codebase. Let me also quickly check how `moveDialogTarget` is populated to see if we can add `isPlainFile` to it.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"openMoveDialog","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content","-n":true,"-C":3}`

---

## Assistant

I have all the information needed. Here is the implementation plan.

---

## Implementation Plan: Fix Excalidraw/Plain File Rename and Move

### Problem Summary

`executeMoveOrRename` in `FileTreePanel.tsx` (line 1076) and `handleSubmit` in `MoveToDialog.tsx` (line 137) call `api.moveNote()` for all non-folder files. But `workspace.move_note()` in the backend requires the file to exist in `self.notes` (the parsed markdown note map). Plain files like `.excalidraw` are not in that map, so the call fails with "file not found".

### Solution Design

The simplest fix has three layers:

**Layer 1: Backend -- New `move_plain_file` Tauri command**

Add a handler + command that does `fs::rename` with path validation, following the exact pattern of `handle_delete_plain_file` (lines 478-490 of `handlers.rs`). No graph updates, no backlink rewriting -- just a validated filesystem move.

**Layer 2: Frontend API -- New `movePlainFile` method**

Add `movePlainFile(oldPath, newPath)` to `BrainMapAPI`, `TauriBridge`, and `MockBridge`.

**Layer 3: Frontend routing -- Detect note vs plain file, call correct API**

Both `executeMoveOrRename` and `MoveToDialog.handleSubmit` need to branch: if the file is a BrainMap note, call `moveNote`; otherwise call `movePlainFile`.

### Detection Strategy

The simplest approach: check if the file has a `note_type` in the graph store nodes map. This is already the pattern used throughout `FileTreePanel.tsx` (see line 406: `const isBrainMapNote = !!state.node.note_type;` and line 758: `const isBrainMapNote = !!node.note_type;`).

For `executeMoveOrRename`: accept a new parameter `isNote: boolean` (or check `graphStore.nodes.has(oldPath)` inline).

For `MoveToDialog`: extend `moveDialogTarget` from `{ path: string; isFolder: boolean }` to `{ path: string; isFolder: boolean; isNote: boolean }`.

Using `graphStore.nodes.has(oldPath)` inline is actually the simplest and most robust -- it avoids threading a new parameter through all callers.

### Step-by-Step Changes

#### Step 1: Backend handler (`handlers.rs`)

Add after `handle_delete_plain_file` (~line 490):

```rust
pub fn handle_move_plain_file(
    ws: &Workspace,
    old_path: &str,
    new_path: &str,
) -> Result<String, String> {
    let rp = brainmap_core::model::RelativePath::new(old_path);
    if ws.notes.contains_key(&rp) {
        return Err("Cannot move a BrainMap-managed note via plain file API".to_string());
    }
    let old_abs = validate_relative_path(&ws.root, old_path)?;
    let new_abs = validate_relative_path(&ws.root, new_path)?;
    if !old_abs.exists() {
        return Err(format!("File not found: {}", old_path));
    }
    if new_abs.exists() {
        return Err(format!("Target already exists: {}", new_path));
    }
    if let Some(parent) = new_abs.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directories: {}", e))?;
    }
    std::fs::rename(&old_abs, &new_abs)
        .map_err(|e| format!("Failed to move file: {}", e))?;
    Ok(new_path.to_string())
}
```

Key points:
- Rejects moves of BrainMap-managed notes (same guard as `write_plain_file`/`delete_plain_file`)
- Validates both paths stay within workspace root
- Creates parent directories if needed (same as `create_plain_file`)
- Returns new path string

#### Step 2: Backend command (`commands.rs`)

Add a `move_plain_file` command following the `delete_plain_file` pattern (with slot locking and expected writes):

```rust
#[tauri::command]
pub fn move_plain_file(
    state: State<'_, AppState>,
    old_path: String,
    new_path: String,
) -> Result<String, String> {
    let root = state.resolve_root(None)?;
    let old_abs = state.with_slot(&root, |slot| {
        handlers::validate_relative_path(&slot.workspace.root, &old_path)
    })?;
    let new_abs = state.with_slot(&root, |slot| {
        handlers::validate_relative_path(&slot.workspace.root, &new_path)
    })?;
    state.register_expected_write(&root, old_abs);
    state.register_expected_write(&root, new_abs);
    state.with_slot(&root, |slot| {
        handlers::handle_move_plain_file(&slot.workspace, &old_path, &new_path)
    })
}
```

Note: uses `with_slot` (not `with_slot_mut`) since it only reads workspace state and does filesystem operations -- same as `delete_plain_file`.

#### Step 3: Register command (`lib.rs`)

Add `commands::move_plain_file` to the `invoke_handler` list (near line 42-43 where `move_note` and `move_folder` are registered).

#### Step 4: API interface (`types.ts`)

Add to `BrainMapAPI` interface (after `moveNote`):

```typescript
movePlainFile(oldPath: string, newPath: string): Promise<string>;
```

#### Step 5: Tauri bridge (`tauri.ts`)

Add implementation:

```typescript
async movePlainFile(oldPath: string, newPath: string): Promise<string> {
    return invoke("move_plain_file", { oldPath, newPath });
}
```

#### Step 6: Mock bridge (`mock/index.ts`)

Add a stub implementation that renames the path in the internal data structures.

#### Step 7: Fix `executeMoveOrRename` in `FileTreePanel.tsx` (line 1070-1076)

In the `else` branch (non-folder), replace the unconditional `api.moveNote()` call with a check:

```typescript
const nodes = useGraphStore.getState().nodes;
const isNote = nodes.has(oldPath);

if (isNote) {
    await api.moveNote(oldPath, newPath);
} else {
    await api.movePlainFile(oldPath, newPath);
}
```

The rest of the branch (tab update, editor update, graph focus update, undo push) stays the same. The `loadTopology()` call on line 1077 will pick up the filesystem change via the file watcher for plain files too.

One additional consideration: for plain files, save dirty state before move. Line 1072 already saves if `activeNote?.path === oldPath`, but for plain files we need to also check `activePlainFile`:

```typescript
if (editorState.activePlainFile?.path === oldPath && editorState.isDirty) {
    await editorState.saveNote();
}
```

And after the move, re-open as plain file:

```typescript
if (useEditorStore.getState().activePlainFile?.path === oldPath) {
    useEditorStore.getState().openPlainFile(newPath);
}
```

#### Step 8: Fix `MoveToDialog.tsx` (line 136-137)

Same pattern -- replace the unconditional `api.moveNote()` with a note/plain-file check:

```typescript
const nodes = useGraphStore.getState().nodes;
const isNote = nodes.has(target.path);

if (isNote) {
    const result = await api.moveNote(target.path, newPath);
    useTabStore.getState().renamePath(target.path, result.new_path);
    // ... existing editor update
} else {
    await api.movePlainFile(target.path, newPath);
    useTabStore.getState().renamePath(target.path, newPath);
    const activePlainFile = useEditorStore.getState().activePlainFile;
    if (activePlainFile?.path === target.path) {
        useEditorStore.getState().openPlainFile(newPath);
    }
}
```

#### Step 9: Tests

- **Rust unit test** in `handlers.rs` or a test module: verify `handle_move_plain_file` moves a file, rejects managed notes, rejects paths outside workspace, handles missing source and existing target.
- **Vitest unit test**: verify the frontend routing logic -- mock `graphStore.nodes` to contain or not contain the path, confirm the correct API method is called.

### Edge Cases

1. **Renaming a plain file that is currently open in the excalidraw editor**: The `openPlainFile(newPath)` call after rename will reload it. The excalidraw editor component will re-mount with new data.

2. **Dirty excalidraw file**: The `saveNote()` call in editorStore handles both `activeNote` and `activePlainFile` (line 479 of `editorStore.ts`), so dirty saves work.

3. **File watcher race**: `register_expected_write` on both old and new paths prevents the file watcher from triggering spurious topology reloads.

4. **Undo**: The existing `pushAction({ kind: "move-note", oldPath, newPath })` can be reused for plain files. The undo handler would need the same note/plain-file routing, but that is a separate concern.

### Files Changed

| File | Change |
|------|--------|
| `crates/app/src-tauri/src/handlers.rs` | Add `handle_move_plain_file` |
| `crates/app/src-tauri/src/commands.rs` | Add `move_plain_file` command |
| `crates/app/src-tauri/src/lib.rs` | Register `move_plain_file` in invoke handler |
| `crates/app/src/api/types.ts` | Add `movePlainFile` to `BrainMapAPI` |
| `crates/app/src/api/tauri.ts` | Add `movePlainFile` implementation |
| `crates/app/src/api/mock/index.ts` | Add `movePlainFile` stub |
| `crates/app/src/components/Layout/FileTreePanel.tsx` | Route note vs plain file in `executeMoveOrRename` |
| `crates/app/src/components/Layout/MoveToDialog.tsx` | Route note vs plain file in `handleSubmit` |

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs` - Add `handle_move_plain_file` handler following `handle_delete_plain_file` pattern
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx` - Fix `executeMoveOrRename` at line 1070-1076 to route note vs plain file
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/MoveToDialog.tsx` - Fix `handleSubmit` at line 136-137 to route note vs plain file
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs` - Add `move_plain_file` Tauri command with path validation and expected writes
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts` - Add `movePlainFile` to `BrainMapAPI` interface

---

