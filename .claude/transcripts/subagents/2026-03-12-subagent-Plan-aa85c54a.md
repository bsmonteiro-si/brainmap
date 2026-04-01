# 2026-03-12 — Subagent Transcript: Plan

**Date:** 2026-03-12 12:24:29
**Agent:** Plan
**Agent ID:** aa85c54a92c2a264d
**Parent Session:** a9845a1d-42eb-4447-b7e4-4313e7729c6c

---

## User

Design an implementation plan for adding Cmd+Z / Cmd+Y undo/redo for file operations (create note, create folder, delete note, delete folder) in the BrainMap desktop app's Files view.

## Current Architecture

**Global shortcuts** are in `crates/app/src/App.tsx` — a centralized `handleKeyDown` on `window` with `useCallback`. Pattern: `const isMod = e.metaKey || e.ctrlKey; if (isMod && e.key === "x") { ... }`. Context-aware: Cmd+B checks `!target?.closest(".cm-editor")` to skip when CodeMirror has focus.

**No app-level undo/redo exists.** Only CodeMirror has undo (Mod-z) and redo (Mod-y) via its `history()` extension.

**Stores** (Zustand):
- `editorStore.ts` — activeNote, openNote(path), clear(), saveNote(), refreshActiveNote()
- `graphStore.ts` — nodes Map, edges, createNote(path, title, type), applyEvent({type: "node-deleted", path})
- `uiStore.ts` — UI state, modals, focus, treeExpandedFolders

**File operations flow:**
1. **Create note:** CreateNoteDialog → `api.createNote(params)` → returns path → `graphStore.createNote()` → `editorStore.openNote(path)`
2. **Create folder:** inline input in FileTreePanel → `api.createFolder(path)` — just creates dir, no graph update
3. **Delete note:** ConfirmDeleteDialog → `editorStore.clear()` (if active) → `api.deleteNote(path, force)` → `graphStore.applyEvent({type: "node-deleted", path})`
4. **Delete folder:** ConfirmDeleteDialog → `editorStore.clear()` (if active) → `api.deleteFolder(path, force)` → returns deleted_paths → for each: `graphStore.applyEvent({type: "node-deleted", path})`

**API bridge** (`BrainMapAPI` interface in `crates/app/src/api/bridge.ts`):
- `createNote(params)`, `createFolder(path)`, `deleteNote(path, force)`, `deleteFolder(path, force)`
- `readNote(path)` — returns full NoteDto with frontmatter + body
- `updateNote(params)` — saves note content

**Tauri commands** (Rust side in `crates/app/src-tauri/src/commands.rs` + `handlers.rs`):
- `create_node`, `create_folder`, `delete_node`, `delete_folder`
- `register_expected_write()` called before file ops to prevent file watcher interference

## Design Constraints

1. Cmd+Z/Cmd+Y must NOT interfere with CodeMirror's built-in undo/redo when the editor has focus
2. Need to capture full note content before deletion (for undo restore)
3. Folder delete undo needs to restore all notes with their content
4. Graph store and editor store must stay in sync
5. Should be simple — don't over-engineer. A bounded stack (e.g., 20 items) is fine.
6. Only file/folder CRUD needs undo — not frontmatter edits or link operations.

## Questions to address in plan

1. Where should the undo history store live? (new Zustand store? part of uiStore?)
2. What data structure for the undo stack? (command pattern with execute/undo?)
3. How to capture note content before deletion?
4. How to handle the redo stack (cleared on new action)?
5. How to wire Cmd+Z/Cmd+Y in App.tsx (context-aware, skip when in CodeMirror)?
6. How should undo/redo interact with the editor (e.g., if undoing a create reopens the editor)?
7. Should there be visual feedback (toast notification)?

Please provide a detailed, actionable implementation plan with file paths and code structure.

---

## Assistant



I'll explore the codebase to understand the current architecture before designing the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

Now let me look at the delete and create flows in more detail.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/ConfirmDeleteDialog*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/CreateNoteDialog*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/FileTreePanel*"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/ConfirmDeleteDialog.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CreateNoteDialog.tsx"}`

---

## Assistant

Now let me see the FileTreePanel to understand where delete is triggered.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

Now let me check the Tauri handlers to understand what data is available for restore operations.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","limit":80}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/stores/*.ts"}`

---

## Assistant

Now I have a thorough understanding of the codebase. Let me check one more thing -- the `createNote` API params to understand what needs to be captured for undo.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts","limit":50}`

---

## Assistant

I now have all the information needed to design the plan. Here is the complete implementation plan.

---

## Implementation Plan: Cmd+Z / Cmd+Y Undo/Redo for File Operations

### Overview

Add an undo/redo system for file-level CRUD operations (create note, create folder, delete note, delete folder) in the desktop app. Uses the Command pattern with a dedicated Zustand store, wired into the existing global keyboard shortcut handler with CodeMirror-awareness.

### Architecture Decisions

**1. Dedicated `undoStore.ts`** (new Zustand store, not part of uiStore)

Rationale: The undo stack holds substantial data (full note content snapshots for deleted notes). Keeping it separate avoids bloating uiStore and follows the existing pattern of one concern per store (editor, graph, ui, segments, workspace).

**2. Command pattern with `UndoableAction` discriminated union**

Four action types, each carrying enough data to reverse the operation:

```typescript
type UndoableAction =
  | { kind: "create-note"; path: string }
  // Undo = delete the note at path
  | { kind: "create-folder"; folderPath: string }
  // Undo = delete the folder (only if empty, which it will be since we just created it)
  | { kind: "delete-note"; path: string; snapshot: NoteDetail }
  // Undo = re-create the note with full snapshot content
  | { kind: "delete-folder"; folderPath: string; snapshots: NoteDetail[] }
  // Undo = re-create the folder + all notes with their snapshots
```

**3. Bounded stacks (20 items)**

Two arrays: `undoStack` and `redoStack`. Pushing a new action clears the redo stack. Stack limited to 20 entries to bound memory (folder delete snapshots can be large).

**4. Snapshot capture before deletion**

Before deleting a note, call `api.readNote(path)` to capture the full `NoteDetail` (frontmatter + body + links). For folder deletes, snapshot every note in the folder. This data is stored in the undo stack entry so the note can be fully reconstructed.

**5. CodeMirror-aware shortcut routing**

In `App.tsx`, Cmd+Z and Cmd+Y check `target?.closest(".cm-editor")` -- if inside CodeMirror, let the event propagate to CM's built-in history. Otherwise, `e.preventDefault()` and dispatch to undoStore. This matches the existing pattern used for Cmd+B.

### Step-by-Step Implementation

#### Step 1: Create `undoStore.ts`

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts`

Store interface:

```typescript
interface UndoState {
  undoStack: UndoableAction[];
  redoStack: UndoableAction[];
  
  pushAction: (action: UndoableAction) => void;  // push to undo, clear redo
  undo: () => Promise<void>;                      // pop undo, execute reverse, push to redo
  redo: () => Promise<void>;                      // pop redo, execute forward, push to undo
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;                              // called on workspace close
}
```

Constants: `MAX_UNDO_STACK = 20`.

**`pushAction`**: Prepend to `undoStack`, trim to `MAX_UNDO_STACK`, set `redoStack = []`.

**`undo`** logic (by action kind):
- `create-note`: Delete the note via `api.deleteNote(path, true)`, update graph store with `node-deleted` event, clear editor if it was showing this note.
- `create-folder`: Delete via `api.deleteFolder(path)` (should be empty or only contain notes we just created). Update graph accordingly.
- `delete-note`: Re-create the note using `api.createNote(...)` with all fields from the snapshot, then re-create links from `snapshot.links` using `api.createLink(...)`. Update graph store with `node-created` event.
- `delete-folder`: Re-create the folder via `api.createFolder(...)`, then re-create each note from snapshots and their links. Update graph store for each.

After executing the reverse, push the **inverse** action to `redoStack`:
- Undoing a `create-note` pushes a `delete-note` (snapshot the note first) to redo.
- Undoing a `delete-note` pushes a `create-note` to redo.
- Same pattern for folders.

Actually, simpler approach: push the **original action** to the redo stack. Then redo just calls the forward operation for that action kind. This avoids needing inverse transformations:
- Redo `create-note`: The note was deleted by undo, so re-create it. But we no longer have a snapshot... 

Better approach: **push the original action to redo stack unchanged, and redo calls undo's inverse**. Concretely:

- `undo()`: Pop from `undoStack`, execute reverse operation, push to `redoStack`.
- `redo()`: Pop from `redoStack`, execute forward operation, push to `undoStack`.

Where "forward" for each kind:
- `create-note`: This was originally a create. To "redo" it we'd need to re-create, but we might not have the content. Actually...

**Simplest correct approach**: Store the action in both stacks as-is. Undo reverses it, redo re-applies it. For create actions, before undoing (deleting), snapshot the note and attach it to the action. Then redo can use that snapshot to re-create.

Let me refine the type to support both directions:

```typescript
type UndoableAction =
  | { kind: "create-note"; path: string; snapshot?: NoteDetail }
  | { kind: "create-folder"; folderPath: string }
  | { kind: "delete-note"; path: string; snapshot: NoteDetail }
  | { kind: "delete-folder"; folderPath: string; snapshots: NoteDetail[] }
```

**Undo behavior:**
- `create-note`: Snapshot the note first (it exists now), store snapshot on the action, then delete it. Push enriched action to redo.
- `create-folder`: Delete folder. Push to redo.
- `delete-note`: Re-create from snapshot. Push to redo.
- `delete-folder`: Re-create folder + all notes from snapshots. Push to redo.

**Redo behavior:**
- `create-note`: Re-create from the snapshot that was attached during undo. Push (without snapshot) to undo.
- `create-folder`: Re-create folder. Push to undo.
- `delete-note`: Snapshot first, then delete. Push to undo.
- `delete-folder`: Snapshot all notes, then delete. Push to undo.

This is symmetric and clean.

#### Step 2: Instrument existing operations to push to undoStore

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CreateNoteDialog.tsx`

After `api.createNote()` succeeds and graph is updated, add:

```typescript
import { useUndoStore } from "../../stores/undoStore";
// ...after createNote succeeds:
useUndoStore.getState().pushAction({ kind: "create-note", path: createdPath });
```

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`

In `handleDeleteConfirm`, before the API call, snapshot the content:

For note delete:
```typescript
const snapshot = await api.readNote(deleteTarget.fullPath);
// ...after successful delete:
useUndoStore.getState().pushAction({ kind: "delete-note", path: deleteTarget.fullPath, snapshot });
```

For folder delete:
```typescript
// Snapshot all notes in folder before deleting
const folderNotePaths = [...nodes.entries()]
  .filter(([p]) => p.startsWith(deleteTarget.fullPath + "/"))
  .map(([p]) => p);
const snapshots = await Promise.all(folderNotePaths.map(p => api.readNote(p)));
// ...after successful delete:
useUndoStore.getState().pushAction({ kind: "delete-folder", folderPath: deleteTarget.fullPath, snapshots });
```

For `commitFolderInput` (create folder):
```typescript
// After api.createFolder succeeds:
useUndoStore.getState().pushAction({ kind: "create-folder", folderPath: val });
```

#### Step 3: Wire Cmd+Z / Cmd+Y in App.tsx

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx`

Add to `handleKeyDown`:

```typescript
if (isMod && e.key === "z" && !e.shiftKey) {
  const target = e.target as HTMLElement | null;
  if (!target?.closest(".cm-editor")) {
    e.preventDefault();
    useUndoStore.getState().undo();
  }
}
if (isMod && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
  const target = e.target as HTMLElement | null;
  if (!target?.closest(".cm-editor")) {
    e.preventDefault();
    useUndoStore.getState().redo();
  }
}
```

Note: Support both Cmd+Y and Cmd+Shift+Z for redo (standard on macOS).

#### Step 4: Toast notification for undo/redo feedback

Add a minimal toast system. Since the app has no toast infrastructure, add a lightweight one.

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/UndoToast.tsx`

A small component that subscribes to a `lastMessage` field on undoStore:

```typescript
// In undoStore, add:
toastMessage: string | null;
toastKey: number;  // increment to trigger re-render/animation
```

The toast auto-dismisses after 3 seconds. Messages like "Undo: deleted Note Title", "Redo: created Note Title".

Render `<UndoToast />` in `App.tsx` alongside the other global components.

#### Step 5: Clear undo stack on workspace close

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStore.ts` (or wherever `closeWorkspace` is called)

When workspace closes, call `useUndoStore.getState().clear()` to prevent stale undo actions from a different workspace.

#### Step 6: Edge case handling

**In undo/redo operations:**

1. **Error handling**: Wrap all undo/redo API calls in try/catch. On failure, show an error toast ("Undo failed: ...") and do NOT push to the opposite stack. The failed action stays lost.

2. **Stale undo**: If undoing a `create-note` but the note was already deleted externally, catch the error silently and remove the action.

3. **Editor sync**: After undo/redo that creates a note, do NOT auto-open it in the editor (unlike fresh create). After undo/redo that deletes a note, clear editor if it was showing that note (reuse the pattern from `handleDeleteConfirm`).

4. **Graph sync**: All undo/redo operations must update graphStore via `applyEvent` or `createNote`, matching the patterns already used in CreateNoteDialog and FileTreePanel.

5. **Links restoration**: When undoing a delete-note, the snapshot's `links` array contains outgoing links. After re-creating the note, iterate and call `api.createLink(path, link.target, link.rel)` for each. Incoming links from other notes cannot be restored (they still reference the path, but the backlink index will pick them up automatically once the note exists again).

6. **File watcher**: The existing `register_expected_write()` pattern should handle undo/redo file operations without triggering spurious watcher events. The `createNote` and `deleteNote` API calls already handle this internally.

#### Step 7: Tests

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.test.ts`

Test cases:
1. `pushAction` adds to undo stack, clears redo stack
2. `pushAction` respects MAX_UNDO_STACK bound
3. `canUndo`/`canRedo` reflect stack state
4. `clear` empties both stacks
5. Undo create-note calls deleteNote API and pushes to redo
6. Undo delete-note calls createNote API with snapshot data and pushes to redo
7. Redo after undo restores original state
8. New action after undo clears redo stack
9. Undo create-folder calls deleteFolder
10. Undo delete-folder re-creates folder and all note snapshots
11. Toast message is set on undo/redo
12. Error during undo does not corrupt stacks

Mock `getAPI()` in tests using the existing test setup pattern from `editorStore.test.ts`.

#### Step 8: Documentation update

Update `CLAUDE.md` current status section to mention the undo/redo feature, update the test count, and note the new `undoStore`.

### Files to Create

1. `crates/app/src/stores/undoStore.ts` -- New Zustand store
2. `crates/app/src/stores/undoStore.test.ts` -- Unit tests
3. `crates/app/src/components/Layout/UndoToast.tsx` -- Toast notification component

### Files to Modify

1. `crates/app/src/App.tsx` -- Add Cmd+Z/Cmd+Y handlers, render UndoToast
2. `crates/app/src/components/Editor/CreateNoteDialog.tsx` -- Push create-note action
3. `crates/app/src/components/Layout/FileTreePanel.tsx` -- Push delete-note/delete-folder/create-folder actions, add pre-delete snapshots
4. `crates/app/src/stores/segmentStore.ts` -- Clear undo stack on workspace close

### Risks and Mitigations

- **Memory from folder snapshots**: A folder with many large notes could use significant memory. Mitigation: the 20-item stack bound plus typical workspace sizes make this acceptable. Could add a byte-size cap later if needed.
- **Race conditions**: User could Cmd+Z while a previous undo is still in flight. Mitigation: Add an `isProcessing` boolean to undoStore; skip undo/redo calls while true.
- **External file changes**: If a note is modified externally between create and undo, the undo (delete) still works. If a note is deleted externally before undo of delete, the re-create still works since createNote just writes a new file.

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts` - New store to create: core undo/redo logic, stack management, API calls for reverse operations
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx` - Must instrument delete operations with pre-delete snapshots and push undo actions
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx` - Wire Cmd+Z/Cmd+Y keyboard shortcuts with CodeMirror-awareness
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CreateNoteDialog.tsx` - Push create-note action after successful creation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts` - Reference for API patterns and store conventions to follow

---

