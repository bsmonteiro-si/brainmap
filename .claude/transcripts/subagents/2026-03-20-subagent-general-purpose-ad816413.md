# 2026-03-20 — Subagent Transcript: general-purpose

**Date:** 2026-03-20 14:50:03
**Agent:** general-purpose
**Agent ID:** ad8164136b6e9a929
**Parent Session:** 67e6a125-b7ea-4d89-9ba3-636e0cd46bc5

---

## User

You are reviewing code changes for BrainMap. Review the following changed files for defects.

## Review Criteria (from .claude/agents/code-reviewer.md)

You are reviewing Rust and TypeScript code for BrainMap, a knowledge graph tool. Your job is to find real defects, not style nits.

### What to Review
1. **Correctness** - Logic bugs, missed conditions, error handling, filesystem safety, state consistency
2. **Rust Quality** - Ownership, borrowing, unnecessary clones, unwrap safety
3. **Function Design** - Single responsibility, naming, structure
4. **Test Coverage** - Are new public functions tested? Error paths?
5. **Serialization and API Surface** - JSON structure, field names
6. **Performance** - O(n^2) loops, unnecessary clones

### Output Format
Write findings as:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

## Changed Files

### 1. `crates/app/src-tauri/src/handlers.rs` — New `handle_move_plain_file`

```rust
/// Move a plain (non-BrainMap) file on disk.
/// Rejects moves of files tracked in the BrainMap graph (use `move_note` instead).
pub fn handle_move_plain_file(ws: &Workspace, old_path: &str, new_path: &str) -> Result<String, String> {
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

### 2. `crates/app/src-tauri/src/commands.rs` — New `move_plain_file` command

```rust
#[tauri::command]
pub fn move_plain_file(
    app: tauri::AppHandle,
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
    })?;

    emit_files_changed_event(&app, &root, vec![new_path.clone()], vec![old_path.clone()]);

    Ok(new_path)
}
```

### 3. `crates/app/src-tauri/src/lib.rs` — Registered command

Added `commands::move_plain_file` to invoke_handler list.

### 4. Frontend API changes

**types.ts**: Added `movePlainFile(oldPath: string, newPath: string): Promise<string>;`

**tauri.ts**:
```typescript
async movePlainFile(oldPath: string, newPath: string): Promise<string> {
    return invoke("move_plain_file", { oldPath, newPath });
}
```

**mock/index.ts**:
```typescript
async movePlainFile(_oldPath: string, newPath: string): Promise<string> {
    await mockDelay("default");
    return newPath;
}
```

### 5. `FileTreePanel.tsx` — Updated `executeMoveOrRename`

```typescript
} else {
    const isNote = useGraphStore.getState().nodes.has(oldPath);

    // Save dirty file before moving
    if (isNote) {
        if (editorState.activeNote?.path === oldPath && editorState.isDirty) {
            await editorState.saveNote();
        }
    } else {
        if (editorState.activePlainFile?.path === oldPath && editorState.isDirty) {
            await editorState.saveNote();
        }
    }

    if (isNote) {
        await api.moveNote(oldPath, newPath);
    } else {
        await api.movePlainFile(oldPath, newPath);
    }
    await useGraphStore.getState().loadTopology();

    // Update tab
    useTabStore.getState().renamePath(oldPath, newPath);

    // Update editor if active file was moved
    if (isNote) {
        if (useEditorStore.getState().activeNote?.path === oldPath) {
            useEditorStore.getState().openNote(newPath);
            useGraphStore.getState().selectNode(newPath);
        }
    } else if (useEditorStore.getState().activePlainFile?.path === oldPath) {
        useEditorStore.getState().openPlainFile(newPath);
    }

    // Update UI state
    const ui = useUIStore.getState();
    if (ui.graphFocusPath === oldPath) {
        ui.setGraphFocus(newPath, "note");
    }
    if (ui.homeNotePath === oldPath) {
        ui.setHomeNote(newPath);
    }

    useUndoStore.getState().pushAction({ kind: "move-note", oldPath, newPath, isPlainFile: !isNote });
}
```

### 6. `MoveToDialog.tsx` — Updated `handleSubmit`

```typescript
} else {
    const isNote = useGraphStore.getState().nodes.has(target.path);
    if (isNote) {
        const result = await api.moveNote(target.path, newPath);
        useTabStore.getState().renamePath(target.path, result.new_path);
        const activeNote = useEditorStore.getState().activeNote;
        if (activeNote?.path === target.path) {
            useEditorStore.getState().openNote(result.new_path);
        }
    } else {
        await api.movePlainFile(target.path, newPath);
        useTabStore.getState().renamePath(target.path, newPath);
        const activePlainFile = useEditorStore.getState().activePlainFile;
        if (activePlainFile?.path === target.path) {
            useEditorStore.getState().openPlainFile(newPath);
        }
    }
}
```

### 7. `undoStore.ts` — Updated type and undo/redo handlers

Type change:
```typescript
| { kind: "move-note"; oldPath: string; newPath: string; isPlainFile?: boolean }
```

Undo handler:
```typescript
case "move-note": {
    try {
        if (action.isPlainFile) {
            await api.movePlainFile(action.newPath, action.oldPath);
        } else {
            await api.moveNote(action.newPath, action.oldPath);
        }
    } catch (err) { ... }
```

Redo handler (same pattern):
```typescript
case "move-note": {
    try {
        if (action.isPlainFile) {
            await api.movePlainFile(action.oldPath, action.newPath);
        } else {
            await api.moveNote(action.oldPath, action.newPath);
        }
    } catch (err) { ... }
```

## Write your findings to `.claude/reviews/code/fix-excalidraw-rename-review-1.md`

---

## Assistant



Let me read the relevant source files to understand the full context before writing the review.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","limit":50,"offset":1}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"validate_relative_path","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","output_mode":"content","-A":15,"head_limit":30}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"register_expected_write","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src","output_mode":"content","-A":5,"head_limit":30}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub fn validate_relative_path","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","output_mode":"content","-A":20}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"fn handle_move_note","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","output_mode":"content","-A":25}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"fn move_note","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","output_mode":"content","-A":30}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"validate_relative_path","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src","output_mode":"content","-B":2,"-A":15,"glob":"**/handlers.rs"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"handle_move_plain_file","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","output_mode":"content","-A":25}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"fn move_plain_file","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","output_mode":"content","-A":30}`

---

## Assistant

Now let me check the `MoveToDialog.tsx` and `undoStore.ts` for full context on the undo handling.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"case \"move-note\"","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts","output_mode":"content","-A":20}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"renamePath|loadTopology","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts","output_mode":"content","-A":3}`

---

## Assistant

Now let me check `postMoveCleanup` and the `MoveToDialog` for the plain file handling.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"postMoveCleanup","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts","output_mode":"content","-A":20,"head_limit":30}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"MoveToDialog|handleSubmit","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/MoveToDialog.tsx","output_mode":"content","-A":5,"head_limit":20}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"postMoveCleanup","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts","output_mode":"content","offset":88,"-A":15}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts","offset":86,"limit":20}`

---

## Assistant

I see the key issue now. The `postMoveCleanup` function (used by undo/redo) only handles `activeNote` but not `activePlainFile`. Let me also check the MoveToDialog for the undo push.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/MoveToDialog*"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"movePlainFile|pushAction|isPlainFile","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/MoveToDialog.tsx","output_mode":"content","-A":3}`

---

## Assistant

Now let me check if `MoveToDialog` pushes to undo stack.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pushAction","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/MoveToDialog.tsx","output_mode":"content","-A":3}`

---

## Assistant

Now let me check the `new_path` validation — does `handle_move_plain_file` also check if `new_path` is a managed note?

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"new_path.*notes.contains|notes.contains.*new_path","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","output_mode":"content"}`

---

## Assistant

Now I have enough context. Let me write the review.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ 2>/dev/null || echo \"directory does not exist\"","description":"Check if reviews directory exists"}`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/fix-excalidraw-rename-review-1.md","content":"# Code Review: Plain File Move (Excalidraw Rename Fix)\n\n## Findings\n\n##`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/fix-excalidraw-rename-review-1.md`.

Summary of findings:

1. **Bug**: `postMoveCleanup` in `undoStore.ts` only handles `activeNote` but not `activePlainFile`, so undo/redo of a plain file move leaves the editor pointing at a stale path.

2. **Should-fix**: `MoveToDialog.tsx` does not push to the undo stack after moving a plain file, making the action non-undoable from that dialog.

3. **Should-fix**: `handle_move_plain_file` in `handlers.rs` validates `old_path` against managed notes but not `new_path`, allowing a plain file to be moved onto a managed note's path.

4. **Suggestion**: `std::fs::rename` can fail across mount points -- acceptable for now.

5. **Should-fix**: No test coverage for the new `handle_move_plain_file` handler.

6. **Should-fix**: `MoveToDialog` does not save dirty plain files before moving, unlike `FileTreePanel` which does.

---

