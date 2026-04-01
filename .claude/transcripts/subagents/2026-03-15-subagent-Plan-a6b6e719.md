# 2026-03-15 — Subagent Transcript: Plan

**Date:** 2026-03-15 11:19:58
**Agent:** Plan
**Agent ID:** a6b6e7194ab324acc
**Parent Session:** 230f4ca0-0ea7-432e-afcb-860694c58ee8

---

## User

Design an implementation plan for modifying the BrainMap desktop app's file creation flow to support both notes (markdown with frontmatter) and regular files.

## Current State
- CreateNoteDialog (`crates/app/src/components/Editor/CreateNoteDialog.tsx`) creates notes only — requires `.md` extension, has Title/Type/Tags/Body fields, calls `api.createNote()` which goes through `create_node` Tauri command → `handle_create_note` handler → `Workspace::create_note`.
- Context menu in FileTreePanel has "New Note Here" / "New Note at Root" / "New Note in Folder" items.
- Toolbar has `+` button for "New Note".
- Plain files are already supported for read/write via `read_plain_file`/`write_plain_file` Tauri commands, but there's no `create_plain_file` command.
- `write_plain_file` does `std::fs::write` but doesn't create parent directories and checks that the file isn't a BrainMap-managed note.

## Requirements
1. Change context menu labels from "New Note Here" → "New File Here" (and similar variants)
2. CreateNoteDialog becomes CreateFileDialog with a mode toggle: "Note" vs "File"
3. When "Note" mode:
   - Path auto-appends `.md` — user should NOT need to type `.md`
   - Title, Type, Tags, Body fields shown (as today)
   - Calls existing `createNote` API
4. When "File" mode:
   - User types filename WITH extension (e.g., `config.json`, `script.py`)
   - No Title/Type/Tags fields — just Path and optional Body
   - Creates a plain file on disk
   - Opens in editor as a plain file
5. The "+" toolbar button label should change too

## Backend Context
- `handle_write_plain_file` in `handlers.rs` (line 390-400): validates path, checks not a BrainMap note, does `std::fs::write`
- `handle_create_note` in `handlers.rs` (line 51-79): parses params, calls `ws.create_note()`
- Commands registered in `lib.rs`, defined in `commands.rs`
- Path validation via `validate_relative_path` helper
- `AppState` uses `with_slot`/`with_slot_mut` and `register_expected_write` for file watcher

## Frontend Context  
- `openCreateNoteDialog(pathOrOpts)` in uiStore sets dialog state
- Dialog has 3 modes: default, create-and-link, save-as
- `openPlainFile(path)` in editorStore loads a plain file
- `tabStore.openTab(path, "note"|"plain", title, noteType)` opens tabs
- `useUndoStore` tracks create operations for undo

## Key design decisions needed:
1. Should we add a `create_plain_file` Tauri command or reuse `write_plain_file`?
2. How to handle the mode toggle UI in the dialog (radio buttons, segmented control, tabs)?
3. Should the `.md` auto-append for notes happen in the dialog (before submission) or remain as validation?
4. How to handle the "save-as" and "create-and-link" modes — do they always create notes?

Please provide a detailed step-by-step implementation plan with file paths.

---

## Assistant



I'll explore the relevant files to understand the current implementation before designing the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CreateNoteDialog.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/FileTree/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/FileTree/*.tsx"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"openCreateNoteDialog|createNoteInitialPath|createNoteMode|createNoteSaveAs|closeCreateNoteDialog","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","out`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"New Note|New File|context.*menu|New Subfolder","glob":"crates/app/src/**/*.tsx","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"openPlainFile|openTab.*plain","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"CreateNoteDialogOpts|CreateNoteMode","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","output_mode":"content","-C":3}`

---

## Assistant

Now let me look at the FileTreePanel context menu and the toolbar buttons, plus the bridge API.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"New Note|New Subfolder|context.*menu|openCreateNoteDialog","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content","`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"createNote|writePlainFile|createPlainFile","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api","output_mode":"content","-C":2}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"undoStore.*pushAction|kind:.*create","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts","output_mode":"content","-C":3}`

---

## Assistant

Now let me check the `lib.rs` command registration and look at how the untitled tab save-as flow works.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"invoke_handler|\\.invoke_handler","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs","output_mode":"content","-C":20}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"save-as|saveAs|save_as","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","-C":2}`

---

## Assistant

Let me check one more thing -- the remaining lib.rs command registrations and how the file tree handles non-note files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":470,"limit":30}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":320,"limit":20}`

---

## Assistant

Now I have a thorough understanding of the codebase. Here is the implementation plan.

---

## Implementation Plan: Support Both Notes and Plain Files in Create Flow

### Design Decisions

**1. Should we add a `create_plain_file` Tauri command or reuse `write_plain_file`?**

Add a new `create_plain_file` Tauri command. Reasons:
- `write_plain_file` (line 392-400 in `handlers.rs`) explicitly rejects writes to BrainMap-managed notes but does NOT create parent directories (`std::fs::write` fails if parent dir is missing). A creation command should `create_dir_all` for parent dirs, matching what `Workspace::create_note` does.
- `write_plain_file` has no existence check -- it would silently overwrite an existing file. A create command should fail if the file already exists.
- Keeping create vs. write semantics separate is consistent with the existing `create_node` / `update_node` split for notes.

**2. How to handle the mode toggle UI?**

A segmented control (two buttons, "Note" / "File", styled like a pill toggle) at the top of the dialog. This is compact, immediately obvious, and consistent with modern IDE patterns. Radio buttons would work but feel heavier for a binary choice. Tabs would be confusing since the app already uses tabs for editor content.

**3. Should `.md` auto-append happen in the dialog or remain as validation?**

Change from validation to auto-append. Currently the path field requires the user to type `.md` and shows an error if they don't. Instead, in Note mode: the path field should NOT show `.md`, the placeholder should say `Concepts/My-Note` (no extension), and `.md` is appended automatically before submission. This is a UX improvement that reduces friction.

**4. How to handle save-as and create-and-link modes?**

- **save-as**: Should support BOTH note and file creation. An untitled tab might contain plain text that the user wants to save as a `.json` or `.py` file rather than a note. The mode toggle should be available.
- **create-and-link**: Should always create a note, since links are a BrainMap concept that only applies to notes. The mode toggle should be hidden/forced to "Note" in this mode.

### Step-by-Step Implementation

#### Step 1: Backend -- Add `create_plain_file` handler and command

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs`**

Add `handle_create_plain_file(ws: &Workspace, path: &str, body: &str) -> Result<String, String>`:
- Call `validate_relative_path` to get the absolute path.
- Check `ws.notes.contains_key` -- reject if it's a managed note (same as `write_plain_file`).
- Check `abs.exists()` -- return error if file already exists ("File already exists: {path}").
- Call `std::fs::create_dir_all` on the parent directory.
- Call `std::fs::write(&abs, body)`.
- Return the relative path as `Ok(path.to_string())`.

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs`**

Add a `create_plain_file` command:
```rust
#[tauri::command]
pub fn create_plain_file(state: State<'_, AppState>, path: String, body: String) -> Result<String, String> {
    let root = state.resolve_root(None)?;
    let abs_path = state.with_slot(&root, |slot| {
        handlers::validate_relative_path(&slot.workspace.root, &path)
    })?;
    state.register_expected_write(&root, abs_path);
    state.with_slot(&root, |slot| handlers::handle_create_plain_file(&slot.workspace, &path, &body))
}
```

Note: uses `with_slot` (not `with_slot_mut`) because creating a plain file does not modify the `Workspace` struct -- plain files are not tracked in the graph.

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs`**

Add `commands::create_plain_file` to the `invoke_handler` array (line 51, before `commands::write_log`).

#### Step 2: Frontend API -- Add `createPlainFile` to bridge

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts`**

Add to `BrainMapAPI` interface (after `writePlainFile`):
```typescript
createPlainFile(path: string, body: string): Promise<string>;
```

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts`**

Add implementation:
```typescript
async createPlainFile(path: string, body: string): Promise<string> {
    return invoke<string>("create_plain_file", { path, body });
}
```

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts`**

Add mock implementation (return path, no-op).

#### Step 3: UIStore -- Add `createFileKind` to dialog state

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`**

- Add type: `type CreateFileKind = "note" | "file";`
- Add state field: `createFileKind: CreateFileKind` (default: `"note"`)
- Add it to `CreateNoteDialogOpts` as optional `fileKind?: CreateFileKind`
- Update `openCreateNoteDialog` to set `createFileKind` from opts (default `"note"`)
- Update `closeCreateNoteDialog` to reset `createFileKind` to `"note"`

Consideration: When a context menu path ends with `.md` or has no extension, default to "note". When the initial path has a non-`.md` extension, default to "file". This is a minor convenience -- the user can always toggle.

#### Step 4: Rename CreateNoteDialog to CreateFileDialog

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CreateNoteDialog.tsx`**

Rename the component export to `CreateFileDialog`. Update the file name to `CreateFileDialog.tsx` (or keep the file name and just rename the export -- keeping the file name is simpler to avoid changing imports everywhere, but renaming is cleaner). I recommend renaming the file.

Key changes to the component:

a. **Add mode toggle state**: Read `createFileKind` from uiStore. Add local `fileKind` state initialized from the store value (so the user can toggle within the dialog).

b. **Segmented control UI**: Add a two-button segmented control after the heading, before the Path field:
```
[Note] [File]
```
Styled as pill buttons: active button gets `var(--accent)` background, inactive gets `var(--bg-secondary)`. Hidden when `isCreateAndLink` is true (forced to note mode).

c. **Path field behavior**:
- Note mode: placeholder = `Concepts/My-Note` (no `.md`), auto-append `.md` on submit. Remove the `.md` validation error. The `titleFromPath` derivation still works (already strips `.md`).
- File mode: placeholder = `scripts/config.json`, no auto-append, no `.md` requirement.

d. **Conditional fields**:
- Note mode: show Title, Type, Tags, Body (as today).
- File mode: hide Title, Type, Tags. Show only Path and Body (body label = "Content (optional)").

e. **Validation changes**:
- Note mode: `isValid = pathWithoutDots.length > 0 && title.trim().length > 0` (path must be non-empty, title must be non-empty). The `.md` check is removed since we auto-append.
- File mode: `isValid = path.length > 0 && path.includes(".")` (path must have an extension). No title required.

f. **Submit changes**:
- Note mode: same as today, but auto-append `.md` to path before calling `api.createNote()`.
- File mode: call `api.createPlainFile(path, body)`, then open via `editorStore.openPlainFile(createdPath)`. No graph update needed (plain files are not in the graph). Push undo action with new kind `"create-file"`.
- Save-as + File mode: call `api.createPlainFile`, close untitled tab, open plain file.

g. **Heading text**: "Create Note" / "Create File" / "Save As" / "Create & Link" based on mode and dialog type.

#### Step 5: Update FileTreePanel context menu labels

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`**

Change context menu labels:
- Line 274: `"New Note at Root"` -> `"New File at Root"`
- Line 283: `"New Note Here"` -> `"New File Here"`
- Line 300: `"New Note at Root"` / `"New Note in Folder"` -> `"New File at Root"` / `"New File in Folder"`
- Line 328: same change for non-BrainMap files section

Change toolbar button (line 920):
- Title: `"New Note (Cmd+N)"` -> `"New File (Cmd+N)"`

The context menu `handleNewNoteHere` function (line 244-248) remains the same -- it opens the dialog with a path prefix. The dialog itself now has the note/file toggle.

#### Step 6: Update undoStore for plain file creation

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts`**

Add a new `UndoableAction` variant:
```typescript
| { kind: "create-file"; path: string }
```

Add undo logic: delete the file via... Actually, there is no `delete_plain_file` command. For simplicity, the initial implementation should NOT support undo for plain file creation. The `pushAction` call is simply omitted for file mode. This can be added later if needed.

Actually, looking at this more carefully -- the undo for `create-note` works by calling `api.deleteNote(path, true)`. There is no equivalent delete for plain files. Adding a `delete_plain_file` command is scope creep. So: skip undo for plain file creation in this iteration.

#### Step 7: Update App.tsx Cmd+N handler

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx`**

The Cmd+N shortcut currently creates an untitled tab. This behavior is fine and does not need to change. When the user does Cmd+S on an untitled tab, the save-as flow opens CreateFileDialog which now has the note/file toggle.

#### Step 8: Update tests

**Existing test file**: Look for CreateNoteDialog tests.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*CreateNote*test*"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"CreateNoteDialog","glob":"crates/app/src/**/*.test.*","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CreateNoteDialog.test.tsx"}`

---

## Assistant

I now have complete context. Here is the full implementation plan.

---

## Implementation Plan: Support Both Notes and Plain Files in Create Flow

### Design Decisions (Resolved)

1. **New `create_plain_file` Tauri command** rather than reusing `write_plain_file`. The new command will create parent directories, reject overwrites of existing files, and maintain the create/write semantic split that already exists for notes (`create_node` vs `update_node`).

2. **Segmented control** (two pill buttons: "Note" | "File") for the mode toggle. Compact, immediately obvious, consistent with modern IDE patterns. Hidden in `create-and-link` mode since links only apply to notes.

3. **Auto-append `.md`** in Note mode. The user never types `.md` -- the path field placeholder shows `Concepts/My-Note` and `.md` is appended on submission. This removes the current friction of the `.md` validation error.

4. **save-as supports both modes** (user might want to save an untitled tab as a `.json` file). **create-and-link is always Note mode** (links are a BrainMap concept).

5. **No undo for plain file creation** in this iteration -- there is no `delete_plain_file` command, and adding one is scope creep.

### Step-by-Step Implementation

#### Step 1: Backend -- `create_plain_file` handler and command

**`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs`**: Add `handle_create_plain_file(ws: &Workspace, path: &str, body: &str) -> Result<String, String>`:
- `validate_relative_path(&ws.root, path)` for path-traversal safety
- Reject if `ws.notes.contains_key(&rp)` (is a BrainMap note)
- Reject if `abs.exists()` ("File already exists")
- `std::fs::create_dir_all(abs.parent().unwrap())` to ensure parent dirs
- `std::fs::write(&abs, body)`
- Return `Ok(path.to_string())`

**`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs`**: Add `create_plain_file` command wrapping the handler, using `with_slot` (not `_mut` since plain files don't modify `Workspace`), calling `register_expected_write`.

**`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs`**: Register `commands::create_plain_file` in the `invoke_handler` array.

#### Step 2: Frontend API -- `createPlainFile`

**`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts`**: Add `createPlainFile(path: string, body: string): Promise<string>` to the `BrainMapAPI` interface.

**`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts`**: Implement via `invoke<string>("create_plain_file", { path, body })`.

**`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts`**: Add mock returning `path`.

#### Step 3: UIStore -- Add `createFileKind` state

**`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`**:
- Add `type CreateFileKind = "note" | "file"` (after the existing `CreateNoteMode` type at line 132)
- Add `createFileKind: CreateFileKind` to the state interface (default `"note"`)
- Add `fileKind?: CreateFileKind` to `CreateNoteDialogOpts`
- Update `openCreateNoteDialog` to set `createFileKind` from opts or default `"note"`
- Update `closeCreateNoteDialog` to reset `createFileKind` to `"note"`

Naming: Keep the existing function names (`openCreateNoteDialog`, `closeCreateNoteDialog`) to minimize the diff. Renaming every reference would be a large, noisy change for little benefit. The dialog component itself gets renamed but the store API stays stable.

#### Step 4: Rename and modify the dialog component

**Rename** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CreateNoteDialog.tsx` to `CreateFileDialog.tsx`. Export `CreateFileDialog`. Update the single import site (likely `App.tsx` or a layout component that renders it).

Key changes inside the component:

**a) Mode toggle state**: Read `createFileKind` from uiStore. Add local `fileKind` / `setFileKind` state initialized from it. When `isCreateAndLink`, force to `"note"`.

**b) Segmented control**: Render after the heading, before Path:
```tsx
{!isCreateAndLink && (
  <div style={segmentedStyle}>
    <button style={fileKind === "note" ? activeSegBtn : segBtn} onClick={() => setFileKind("note")}>Note</button>
    <button style={fileKind === "file" ? activeSegBtn : segBtn} onClick={() => setFileKind("file")}>File</button>
  </div>
)}
```

**c) Path field**:
- Note mode: placeholder = `"Concepts/My-Note"`, no `.md` validation
- File mode: placeholder = `"scripts/config.json"`, must include a `.` (has extension)

**d) Conditional field rendering**:
- `fileKind === "note"`: show Title, Type, Tags, Body (same as today)
- `fileKind === "file"`: show only Path and Body (label: "Content (optional)")

**e) Validation**:
- Note mode: `isValid = path.trim().length > 0 && title.trim().length > 0` (no `.md` check)
- File mode: `isValid = path.trim().length > 0 && path.includes(".")`

**f) Submit logic**:
- Note mode: prepend logic -- if path doesn't end with `.md`, append it. Then call `api.createNote(...)` as today. Push `create-note` undo action.
- File mode: call `api.createPlainFile(path, body)`. Then call `editorStore.openPlainFile(createdPath)`. No graph update, no undo push.
- Save-as + File mode: call `api.createPlainFile`, close untitled tab, open plain file.
- Save-as + Note mode: same as today but with `.md` auto-append.

**g) Heading text**: `isCreateAndLink ? "Create & Link" : isSaveAs ? "Save As" : fileKind === "note" ? "Create Note" : "Create File"`

#### Step 5: Update FileTreePanel labels

**`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`**:

Context menu label changes (6 occurrences):
- `"New Note at Root"` -> `"New File at Root"` (lines 274, ~300, ~328)
- `"New Note Here"` -> `"New File Here"` (line 283)
- `"New Subfolder Here"` stays the same (it creates folders, not files)
- `"New Note in Folder"` -> `"New File in Folder"` (line 300, 328)

Toolbar button (line 920):
- title: `"New Note (Cmd+N)"` -> `"New File (Cmd+N)"` -- though actually this opens an untitled tab via Cmd+N, so the tooltip should match. Looking again at the code, the `+` button at line 921 calls `openCreateNoteDialog()` which opens the dialog. So the label change to "New File" is appropriate since the dialog now supports both types.

#### Step 6: Update imports for renamed component

Search for all imports of `CreateNoteDialog` and update to `CreateFileDialog` from the new file path.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"import.*CreateNoteDialog","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content"}`

---

## Assistant

Good -- only two import sites: `App.tsx` and the test file.

#### Step 7: Update tests

**Rename** `CreateNoteDialog.test.tsx` to `CreateFileDialog.test.tsx`. Update existing tests to use the new component name and adapt to the `.md` auto-append behavior (the test that types `"Concepts/New-Target.md"` as the path should now type `"Concepts/New-Target"` since `.md` is auto-appended in note mode). Update the placeholder text assertions from `"Concepts/My-Note.md"` to `"Concepts/My-Note"`.

**Add new tests**:
- "shows segmented control in default mode" -- verify Note/File buttons render
- "hides segmented control in create-and-link mode"
- "in File mode, hides Title/Type/Tags fields"
- "in File mode, calls createPlainFile instead of createNote"
- "in File mode, opens plain file after creation"
- "auto-appends .md in Note mode"
- "File mode validation requires extension in path"

**UIStore tests** (`uiStore.test.ts`): Add test for `createFileKind` state initialization and reset.

#### Step 8: Update documentation

**`CLAUDE.md`**: Update the "Current Status" section to mention that CreateNoteDialog has been replaced by CreateFileDialog supporting both note and plain file creation. Update the file creation description in the IDE-style file/folder creation paragraph.

### Sequencing and Dependencies

1. Step 1 (backend) is independent -- can be built and tested first with `cargo test`
2. Step 2 (API) depends on Step 1
3. Step 3 (uiStore) is independent of Steps 1-2
4. Steps 4-6 (dialog + labels + imports) depend on Steps 2-3
5. Step 7 (tests) depends on Steps 4-6
6. Step 8 (docs) comes last

Steps 1 and 3 can be done in parallel. Steps 4, 5, and 6 can be done together.

### Potential Challenges

- **Path auto-append edge case**: User types `notes/readme.md` in Note mode -- should we double-append to `notes/readme.md.md`? No. Check if path already ends with `.md` before appending. The logic: `const finalPath = fileKind === "note" && !path.endsWith(".md") ? path + ".md" : path`.
- **File watcher**: When a plain file is created, the file watcher will fire an event. Since plain files are not in `ws.notes`, the watcher should handle this gracefully. Check the watcher logic -- it likely already ignores non-`.md` files or files not in the graph. If not, the `register_expected_write` call in the command should prevent duplicate processing.
- **Empty folder tracking**: When creating a plain file in an empty folder, the `emptyFolders` Set cleanup should still happen (the folder is no longer empty). This logic exists in the dialog submit handler and works on the directory prefix regardless of file type.
- **Test placeholder changes**: The existing test at line 130 uses `screen.getByPlaceholderText("Concepts/My-Note.md")`. This will need to change to `"Concepts/My-Note"` after the `.md` auto-append change. All 4 test cases that reference this placeholder need updating.

### Critical Files for Implementation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CreateNoteDialog.tsx` - Core dialog component to rename and extend with note/file mode toggle
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs` - Add `handle_create_plain_file` handler (lines 390-400 area, near existing `handle_write_plain_file`)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs` - Add `create_plain_file` Tauri command wiring
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts` - Add `createFileKind` state field and type
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx` - Update context menu labels from "New Note" to "New File"

---

