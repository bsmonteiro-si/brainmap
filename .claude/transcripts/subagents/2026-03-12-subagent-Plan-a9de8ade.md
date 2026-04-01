# 2026-03-12 — Subagent Transcript: Plan

**Date:** 2026-03-12 16:58:43
**Agent:** Plan
**Agent ID:** a9de8ade6fba89695
**Parent Session:** 8ded0b7f-2da2-4917-b434-5a88f5c33eec

---

## User

Plan an implementation for making non-BrainMap files (files without YAML frontmatter) openable and editable in the BrainMap desktop app editor.

## Current State

The app has a file tree that now shows ALL workspace files (not just BrainMap notes with YAML frontmatter). However, clicking on non-BrainMap files is currently a no-op.

### How it works now:
- `FileTreePanel.tsx` marks files as `isBrainMapNote = !!node.note_type` and blocks clicks for non-BrainMap files
- `editorStore.openNote(path)` calls `api.readNote(path)` which invokes Tauri command `get_node_content`
- The Rust handler `handle_read_note` does `ws.read_note(path)` which looks up the in-memory `notes` HashMap — plain files aren't in this map, so it returns `FileNotFound`
- The editor component (`EditorPanel.tsx`) renders a hero header (title, type pill, tags), metadata form, CodeMirror body editor, and related notes footer
- `NoteDetail` type requires: path, title, note_type, tags, status, created, modified, source, summary, links, extra, body

### Key files:
- `crates/app/src-tauri/src/commands.rs` — Tauri command definitions
- `crates/app/src-tauri/src/handlers.rs` — Backend handlers
- `crates/app/src-tauri/src/lib.rs` — Command registration
- `crates/app/src/api/types.ts` — TypeScript API types
- `crates/app/src/api/tauri.ts` — TauriBridge implementation
- `crates/app/src/api/mock/index.ts` — MockBridge implementation
- `crates/app/src/api/bridge.ts` — API bridge selector
- `crates/app/src/stores/editorStore.ts` — Editor state management (openNote, saveNote, editedBody, editedFrontmatter, isDirty, activeNote: NoteDetail | null)
- `crates/app/src/components/Editor/EditorPanel.tsx` — Main editor UI with hero, metadata, CodeMirror, related notes
- `crates/app/src/components/Layout/FileTreePanel.tsx` — File tree with click handlers

### What the user wants:
- Non-BrainMap files should be openable in the editor
- They should be editable (body content)
- "Proper edit metadata handling" — the metadata section should handle the case gracefully (likely hide it or show minimal info since these files have no YAML frontmatter)
- Save should work (write body content back to disk)

### Design constraints:
- Don't change the core parser or workspace notes map — plain files should stay out of the graph
- Minimize changes to existing NoteDetail flow — avoid breaking the well-tested BrainMap note editing
- The editor store's `saveNote` currently calls `api.updateNote(params)` which goes through the workspace write path (expects a note in the map)
- Need new Rust commands for raw file read/write that bypass the workspace/parser

### Questions to address:
1. Should we add a separate "plain file" state to the editor store, or extend NoteDetail with optional fields?
2. How should the editor UI adapt — hide metadata entirely, or show filename-derived info?
3. How should save work for plain files — new API endpoint or reuse updateNote?
4. Should graph selection work for plain files (they're not graph nodes)?
5. What about the auto-save hook — should it work for plain files too?

---

## Assistant



I'll explore the codebase to understand the current architecture before designing the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

Now let me look at the Rust backend handlers and the API bridge.

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts"}`

---

## Assistant

Now let me check the auto-save hook and the mock bridge.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"useAutoSave","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs"}`

---

## Assistant

Let me check the auto-save hook and the FrontmatterForm component, plus the graphStore to understand selection.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/hooks/useAutoSave.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts","limit":50}`

---

## Assistant

Now let me check the `state.rs` for the `with_workspace` helpers and the dto.rs for the serialization layer.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/state.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs","limit":30}`

---

## Assistant

I now have a thorough understanding of the codebase. Let me also quickly check the `selectNode` in graphStore to understand the selection flow.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"selectNode","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts","output_mode":"content","-C":3}`

---

## Assistant

I have all the information needed. Here is the complete implementation plan.

---

## Implementation Plan: Open and Edit Non-BrainMap Files

### Design Decisions

**1. Extend `NoteDetail` with optional fields vs. separate type?**

Extend `NoteDetail` by making metadata fields optional is tempting but would break the 241 existing tests and every consumer that assumes `note_type`, `title`, `tags` etc. are always present. Instead, introduce a **new lightweight type `PlainFileDetail`** with just `path` and `body`, and a **discriminated union `ActiveFile`** in the editor store. This keeps the existing `NoteDetail` path untouched.

**2. New Rust commands for raw file read/write**

Add two new Tauri commands that bypass the workspace notes map entirely:
- `read_plain_file(path: String) -> PlainFileDto` -- reads raw file content from workspace root
- `write_plain_file(path: String, body: String)` -- writes raw content back

These need path-traversal validation (same pattern as `create_folder`) to prevent escaping the workspace root.

**3. Editor UI adaptation**

The `EditorPanel` checks whether the active file is a BrainMap note or a plain file. For plain files:
- Hero header shows just the filename (no type pill, no tags, no status)
- `FrontmatterForm` is not rendered
- `RelatedNotesFooter` is not rendered
- `EditorToolbar` still shown (markdown formatting works on any text)
- Edit/Preview toggle still works

**4. Graph selection for plain files**

Plain files are not graph nodes, so `graphStore.selectNode` should NOT be called for them. The file tree highlight should use the editor store's active path instead of `selectedNodePath` for plain files.

**5. Auto-save for plain files**

Yes, auto-save should work. The `useAutoSave` hook watches `editorStore.isDirty` -- it just needs `saveNote` (or a new `savePlainFile`) to work for plain files. The cleanest approach: make `saveNote` branch on whether the active file is a BrainMap note or plain file.

### Step-by-Step Implementation

#### Step 1: New Rust backend commands

**File: `crates/app/src-tauri/src/dto.rs`**
- Add `PlainFileDto` struct: `{ path: String, body: String }` with `Serialize`

**File: `crates/app/src-tauri/src/handlers.rs`**
- Add `handle_read_plain_file(ws: &Workspace, path: &str) -> Result<PlainFileDto, String>`:
  - Validate path is relative, no `..` escaping workspace root (same pattern as `create_folder`)
  - `std::fs::read_to_string(ws.root.join(path))` and return `PlainFileDto`
- Add `handle_write_plain_file(ws: &Workspace, path: &str, body: &str) -> Result<(), String>`:
  - Same path validation
  - `std::fs::write(ws.root.join(path), body)`

**File: `crates/app/src-tauri/src/commands.rs`**
- Add `read_plain_file` command: calls `handle_read_plain_file` via `state.with_workspace`
- Add `write_plain_file` command: calls `handle_write_plain_file` via `state.with_workspace`, plus `state.register_expected_write` for the file watcher

**File: `crates/app/src-tauri/src/lib.rs`**
- Register both new commands in `generate_handler![]`

#### Step 2: Frontend API layer

**File: `crates/app/src/api/types.ts`**
- Add `PlainFileDetail` interface: `{ path: string; body: string }`
- Add to `BrainMapAPI` interface:
  - `readPlainFile(path: string): Promise<PlainFileDetail>`
  - `writePlainFile(path: string, body: string): Promise<void>`

**File: `crates/app/src/api/tauri.ts`**
- Implement `readPlainFile`: `invoke("read_plain_file", { path })`
- Implement `writePlainFile`: `invoke("write_plain_file", { path, body })`

**File: `crates/app/src/api/mock/index.ts`**
- Implement `readPlainFile`: return `{ path, body: "(mock plain file content)" }`
- Implement `writePlainFile`: no-op

#### Step 3: Editor store changes

**File: `crates/app/src/stores/editorStore.ts`**

This is the core change. Introduce a discriminated union for the active file:

```typescript
type ActiveFile =
  | { kind: "note"; detail: NoteDetail }
  | { kind: "plain"; detail: PlainFileDetail };
```

However, to minimize blast radius, a simpler approach: add a parallel `activePlainFile: PlainFileDetail | null` field alongside the existing `activeNote: NoteDetail | null`. Only one is non-null at a time.

Changes:
- Add `activePlainFile: PlainFileDetail | null` to state
- Add `openPlainFile(path: string): Promise<void>` action
- Modify `openNote` to clear `activePlainFile` when opening a BrainMap note
- Modify `saveNote` to branch: if `activePlainFile` is set, call `api.writePlainFile`; if `activeNote` is set, use existing `updateNote` path
- Modify `clear` to also clear `activePlainFile`
- Modify `updateContent` to work for both (it already just sets `editedBody`)
- Add `activeFilePath` computed getter (returns whichever is active) for convenience
- `updateFrontmatter` remains note-only (no-op / not called for plain files)
- `refreshActiveNote` should also handle plain files (re-read via `readPlainFile`)
- `markExternalChange` should handle plain files

#### Step 4: FileTreePanel click handler

**File: `crates/app/src/components/Layout/FileTreePanel.tsx`**

In `FileTreeNode`'s `handleClick`:
- Currently returns early if `!isBrainMapNote`
- Change to: if `isBrainMapNote`, call `selectNode` + `openNote` (existing behavior); else call `editorStore.openPlainFile(path)` and do NOT call `graphStore.selectNode`
- For active highlighting: also check `editorStore.activePlainFile?.path` in addition to `selectedNodePath`

The `isActive` check on line 416 currently uses `selectedNodePath === node.fullPath`. For plain files, this won't match. Add a secondary check: subscribe to `editorStore` for `activePlainFile` path and use `isActive = selectedNodePath === node.fullPath || activePlainFilePath === node.fullPath`.

#### Step 5: EditorPanel UI adaptation

**File: `crates/app/src/components/Editor/EditorPanel.tsx`**

- Subscribe to `editorStore.activePlainFile`
- When `activePlainFile` is set (and `activeNote` is null):
  - Show simplified hero: just the filename, no type pill, no tags/status row
  - Do NOT render `FrontmatterForm`
  - DO render `EditorToolbar` and `MarkdownEditor` (body editing works the same)
  - Do NOT render `RelatedNotesFooter`
  - Edit/Preview toggle still works
- The `editedBody` / `onEditorChange` logic is already generic (just strings), so the CodeMirror editor and preview work without changes

The conditional rendering can be structured as:
```
const isPlainFile = !!activePlainFile && !activeNote;
const filePath = activeNote?.path ?? activePlainFile?.path;
const fileBody = editedBody ?? (activeNote?.body ?? activePlainFile?.body ?? "");
```

#### Step 6: Auto-save compatibility

**File: `crates/app/src/hooks/useAutoSave.ts`**

The `trySave` function calls `editorStore.getState().saveNote()`. Since step 3 makes `saveNote` branch on whether the active file is a note or plain file, auto-save works automatically without changes to this hook.

The only edge case: the title validation guard (`editedFrontmatter?.title.trim() === ""`) should be skipped for plain files. Since `editedFrontmatter` will be null for plain files, this already works correctly (the condition is false).

#### Step 7: Context menu for plain files

**File: `crates/app/src/components/Layout/FileTreePanel.tsx`**

The context menu for non-BrainMap files (lines 307-312) currently only shows "New Note". Add:
- "Delete" option (plain files can be deleted with `std::fs::remove_file` -- needs a new command, or we can defer this to a follow-up)

For now, keep the context menu as-is; deletion of plain files can be a separate feature.

#### Step 8: Graph selection clearing

When a user clicks a plain file, if a BrainMap note was previously selected in the graph, we should clear the graph selection to avoid a stale highlight:
- In `openPlainFile`, call `useGraphStore.getState().selectNode(null)`

#### Step 9: Tests

- **Rust unit tests**: Test `handle_read_plain_file` and `handle_write_plain_file` with valid paths, path traversal attempts, non-existent files
- **Vitest**: Test `editorStore.openPlainFile`, `saveNote` branching for plain files, `clear` resetting both fields
- **Vitest**: Test `EditorPanel` rendering for plain file (no frontmatter form, no related notes)
- **Vitest**: Test `FileTreePanel` click handler opening plain files

#### Step 10: Documentation

- Update `CLAUDE.md` current status section to mention plain file editing
- No changes to `docs/` specs needed (plain files are outside the BrainMap data model by design)

### Potential Challenges

1. **File watcher events**: The watcher processes file changes. Plain file writes must be registered via `register_expected_write` to avoid spurious re-processing. Since plain files are not in the notes map, the watcher's current logic (which calls `ws.reload_file`) would fail for them. The watcher should silently ignore changes to non-note files, which it likely already does since `reload_file` would return an error that gets logged and ignored.

2. **Binary files**: The `read_plain_file` command should handle the case where the file is binary (not valid UTF-8). `std::fs::read_to_string` will return an error, which surfaces cleanly as a string error to the frontend. We could show a "Cannot open binary file" message in the editor.

3. **Large files**: No special handling needed initially; CodeMirror handles large files reasonably well. Could add a size check later.

4. **File encoding**: `std::fs::read_to_string` assumes UTF-8. Non-UTF-8 files will fail to open with a clear error message.

### Critical Files for Implementation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts` - Core logic: add `activePlainFile` state, `openPlainFile` action, branch `saveNote` for plain files
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs` - New `handle_read_plain_file` and `handle_write_plain_file` with path validation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx` - Conditional rendering: simplified hero for plain files, hide metadata/related notes
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx` - Unblock click handler for non-BrainMap files, add active highlight
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts` - Add `PlainFileDetail` type and new API methods to `BrainMapAPI` interface

---

