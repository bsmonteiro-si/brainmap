# 2026-03-13 — Subagent Transcript: Explore

**Date:** 2026-03-13 16:20:19
**Agent:** Explore
**Agent ID:** a29d82cdb1794bf76
**Parent Session:** 966e73ee-9a78-4015-a411-135de7bdb843

---

## User

I need to understand how undo/redo works in the BrainMap desktop app and how the frontmatter form editing works. Explore these areas thoroughly:

1. **Undo/redo system**: Find `undoStore` and understand how it works — what commands it tracks, how Cmd+Z/Cmd+Y are handled, and how the "isProcessing" guard works. Look at how the editor (CodeMirror) handles its own undo/redo.

2. **Frontmatter form**: Find `FrontmatterForm.tsx` and related components (TagInput, ExtraFieldsEditor, etc.) to understand how metadata editing works — how state is managed, how changes are tracked, and how saves happen.

3. **Key bindings**: Find where Cmd+Z/Cmd+Y keyboard shortcuts are registered globally and in the editor. Understand what happens when focus is outside CodeMirror.

4. **Editor store**: Find `editorStore` to understand `pendingFrontmatter`, `isDirty`, save flow, and how frontmatter changes are tracked.

Search for files: undoStore, FrontmatterForm, editorStore, useAutoSave, and any keyboard shortcut handling. Read the key files fully.

---

## Assistant

I'll explore the undo/redo system, frontmatter form editing, and key bindings in the BrainMap desktop app. Let me start with a comprehensive search.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/undoStore*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/FrontmatterForm*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/editorStore*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/useAutoSave*"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"Cmd\\+Z|Cmd\\+Y|cmd\\+z|cmd\\+y|undo|redo","type":"ts","head_limit":50}`

---

## Assistant

Now let me read the key files to understand the undo/redo system and frontmatter editing:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/hooks/useAutoSave.ts"}`

---

## Assistant

Now let me search for keyboard shortcut handling:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"Cmd\\+Z|Cmd\\+Y|useEffect.*keydown|KeyboardEvent","type":"tsx","head_limit":30}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/UndoToast.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/App.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/MarkdownEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx","limit":150}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/ExtraFieldsEditor* **/TagInput* **/LinksEditor*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/ExtraFieldsEditor.tsx **/TagInput.tsx **/LinksEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.test.ts","limit":100}`

---

## Assistant

Now let me find the form-related components:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*TagInput*\" -o -name \"*ExtraFields*\" -o -name \"*LinksEditor*\""}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TagInput.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ExtraFieldsEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/LinksEditor.tsx"}`

---

## Assistant

Perfect! Now I have a comprehensive understanding. Let me create a summary report of my findings.

## Comprehensive Exploration: Undo/Redo System and Frontmatter Editing

Based on my thorough exploration of the BrainMap desktop app codebase, here's a detailed breakdown of how these systems work:

---

### 1. **Undo/Redo System** (`undoStore.ts`)

**Architecture:**
- Located at: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts`
- Zustand-based state management with a bounded command stack (max 20 items)
- Tracks four types of undoable actions:
  - `create-note` — creation with optional snapshot
  - `create-folder` — folder creation  
  - `delete-note` — deletion with full note snapshot
  - `delete-folder` — folder deletion with all contained note snapshots

**Key Commands:**
- `pushAction(action)` — Adds to undo stack, clears redo stack (standard behavior)
- `undo()` / `redo()` — Async operations with `isProcessing` concurrency guard
- Stack management: oldest action removed when exceeding `MAX_UNDO_STACK` (20 items)

**Smart Undo Behavior:**
- **Create-note undo** refusal: Won't undo if the note has been modified since creation (checks `body.trim().length > 0`). Re-pushes to undo stack with toast "Cannot undo: note has been modified"
- **Create-folder undo** refusal: Won't delete if folder isn't empty; re-pushes with toast "Cannot undo: folder is not empty"
- **Delete-note redo** snapshots: Takes a fresh snapshot before re-deleting (to capture any modifications)
- **Delete-folder restore** is two-pass: recreates all notes first, then restores links separately
- **Empty folder tracking**: `useUIStore` maintains a `Set<string>` of empty folders for proper tree display during undo/redo

**Side Effects on Undo/Redo:**
- Editor auto-clears via `clearEditorIfActive(path)` if the undone/redone note is open
- Graph focus clears via `clearFocusIfTargeted(path, isFolder)` if affected by the operation
- Graph store synced via `applyEvent()` for all topological changes
- Toast notifications show status ("Undo: created X", "Redo: deleted X")

**Concurrency Guard:**
- `isProcessing` flag prevents overlapping undo/redo operations
- Returns early if already processing: `if (isProcessing || undoStack.length === 0) return`

---

### 2. **Keyboard Shortcut Handling** (`App.tsx`)

**Global Shortcuts (lines 66–150):**
Located in `App.tsx`, registered via `window.addEventListener("keydown", handleKeyDown)` at app startup.

**Undo/Redo Shortcuts (lines 106–121):**
```typescript
// Cmd+Z: Undo file operations (skip when CodeMirror has focus)
if (isMod && e.key === "z" && !e.shiftKey) {
  const target = e.target as HTMLElement | null;
  if (!target?.closest(".cm-editor")) {
    e.preventDefault();
    useUndoStore.getState().undo();
  }
}

// Cmd+Y or Cmd+Shift+Z: Redo file operations (skip when CodeMirror has focus)
if (isMod && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
  const target = e.target as HTMLElement | null;
  if (!target?.closest(".cm-editor")) {
    e.preventDefault();
    useUndoStore.getState().redo();
  }
}
```

**Key Insight:** The shortcuts check `!target?.closest(".cm-editor")` to skip undo/redo when CodeMirror editor has focus — letting CodeMirror's native undo (Cmd+Z) handle editor undo/redo.

**CodeMirror's Native Undo/Redo:**
- CodeMirror has its own `history()` extension and `historyKeymap`
- Keymap includes `{ key: "Mod-y", run: redo, preventDefault: true }` and `...historyKeymap` (lines 82–83 in `MarkdownEditor.tsx`)
- This allows Cmd+Y in the editor to call CodeMirror's `redo` command

**Other Global Shortcuts in App.tsx:**
- Cmd+P: Open command palette
- Cmd+N: Open create note dialog
- Cmd+S: Save note
- Cmd+B: Toggle file tree (but skips if in CodeMirror, letting Cmd+B bold text)
- Cmd+,: Open settings modal
- Cmd+`+`/`=`: Zoom in
- Cmd+`-`: Zoom out
- Cmd+`0`: Reset zoom
- Cmd+ArrowLeft/Right: Navigate history
- Escape: Close modals or clear focus mode

---

### 3. **Editor Store** (`editorStore.ts`)

**State:**
- `activeNote: NoteDetail | null` — Currently open note
- `editedBody: string | null` — Buffered changes to body (only non-null if dirty)
- `editedFrontmatter: Partial<EditableFrontmatter> | null` — Buffered frontmatter changes (merge pattern)
- `isDirty: boolean` — Whether there are unsaved changes
- `savingInProgress: boolean` — Concurrency guard for save operations
- `conflictState: "none" | "external-change"` — Conflict detection for external file modifications

**Core Methods:**

1. **`updateContent(body: string)`** — Sets `editedBody` and marks `isDirty = true`

2. **`updateFrontmatter(changes: Partial<EditableFrontmatter>)`** (lines 124–127):
   ```typescript
   updateFrontmatter: (changes) => {
     const current = get().editedFrontmatter ?? {};
     set({ editedFrontmatter: { ...current, ...changes }, isDirty: true });
   }
   ```
   Shallow merge pattern — only changed fields are included in `editedFrontmatter`

3. **`saveNote()`** (lines 129–216) — Atomic save with conflict detection:
   - Validates title (rejects empty/whitespace-only)
   - **Snapshots before save:** `savingBody = editedBody; savingFrontmatter = editedFrontmatter`
   - **Builds params dict:** Only includes fields that were actually edited (non-null in `savingFrontmatter`)
   - Calls `api.updateNote(params)`
   - **Re-reads note** to capture server-set `modified` timestamp
   - **Graph sync:** If title or type changed, emits `node-updated` event
   - **Clears only what was saved:** Preserves any concurrent edits (lines 200–202):
     ```typescript
     const newBody = current.editedBody === savingBody ? null : current.editedBody;
     const newFm = current.editedFrontmatter === savingFrontmatter ? null : current.editedFrontmatter;
     ```

4. **`openNote(path)`** (lines 42–70) — Smart note switching:
   - If currently dirty and `autoSave === true`, saves before switching (unless title invalid or already saving)
   - Sets `isDirty = false, editedBody = null, editedFrontmatter = null` on open
   - Pushes to navigation history

5. **`refreshActiveNote()`** (lines 99–118) — Re-reads note from disk (used after link operations)

6. **`markExternalChange()`** (lines 218–242) — Detects when another process modifies the file:
   - If dirty: sets `conflictState = "external-change"`
   - If not dirty: reloads the note from disk
   - Suppresses conflicts during our own save (checks `savingInProgress`)

---

### 4. **Frontmatter Form** (`FrontmatterForm.tsx`)

**Structure:**
- Located at: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx`
- Collapsible "Edit Metadata" section (collapsed by default)
- All fields editable; reads from `editedFrontmatter` (buffered state) with fallback to `activeNote` (source of truth)

**Fields:**
1. **Title** (text input) — Validates non-empty before save
2. **Type** (select) — 10 built-in types + fallback for custom types
3. **Status** (select) — draft/review/final/archived or empty (null)
4. **Tags** (custom `TagInput` component)
5. **Source** (text input)
6. **Summary** (textarea, 3 rows)
7. **Links** (custom `LinksEditor` component) — Shows existing links, add new links with datalist autocomplete
8. **Extra Fields** (collapsible `ExtraFieldsEditor` component) — Key-value pairs, JSON parsing for non-string values

**State Management:**
```typescript
const fm = useEditorStore((s) => s.editedFrontmatter);
const updateFrontmatter = useEditorStore((s) => s.updateFrontmatter);

// Display logic: prefer edited value, fallback to active note
const title = fm?.title ?? note.title;
const noteType = fm?.note_type ?? note.note_type;
// ... etc
```

**On Change:**
Every field change calls `updateFrontmatter(changes)`, which:
1. Shallow-merges into `editedFrontmatter`
2. Marks editor as `isDirty = true`
3. Auto-save debounce (1.5s) kicks in if enabled

---

### 5. **Form Sub-Components**

**`TagInput.tsx`:**
- Pills UI with remove (×) buttons
- Enter/comma key adds tag
- Backspace on empty input removes last tag
- Blur handler auto-adds pending input
- State: local `input` string

**`ExtraFieldsEditor.tsx`:**
- Key-value rows with remove buttons
- New field row at bottom with key + value inputs + add button
- JSON parsing: tries `JSON.parse(value)` for non-string originals; falls back to string
- Enter key in either field adds the field
- Disabled state: add button disabled if key empty or already exists
- State: local `newKey, newValue` strings; onChange reconstructs `extra` object

**`LinksEditor.tsx`:**
- Shows existing outgoing links with rel + target title + remove button
- Add row: datalist target autocomplete (sorted by title, excludes self, includes folder nodes with "(folder)" suffix)
- Edge type selector (12 user-selectable types: causes, supports, contradicts, extends, depends-on, exemplifies, precedes, leads-to, evolved-from, related-to, authored-by, sourced-from)
- Duplicate detection: prevents adding same link twice
- "Create & Link" button: If target doesn't exist in workspace, shows this button instead of "+" — opens `CreateNoteDialog` in "create-and-link" mode, auto-adds link after creation
- Graph sync: calls `applyEvent()` for edge-created/edge-deleted
- Async operations with busy flag and error state
- Enter key in target input adds link (if valid)
- Cmd+Click on target opens the linked note or focuses folder

---

### 6. **Auto-Save Hook** (`useAutoSave.ts`)

**Behavior:**
- Debounce delay: 1.5 seconds
- Triggers on: `isDirty = true` → 1.5s delay → `saveNote()`
- Resets debounce on every new edit
- Window blur: saves immediately (clears debounce, calls `trySave()`)
- Skips if: auto-save disabled, already saving, title invalid, no active note

**Integration:**
- Zustand subscription to `editorStore` for dirty state changes
- Reads `autoSave` flag from `uiStore` on each edit
- Used in `App.tsx` via `useAutoSave()` hook (no dependencies, runs once at app startup)

---

### 7. **Dirty Flag & Save Flow**

**When isDirty Becomes True:**
1. User edits body via CodeMirror → `onChange` → `updateContent()` → `isDirty = true`
2. User edits frontmatter field → field onChange → `updateFrontmatter()` → `isDirty = true`
3. User adds/removes tag, extra field, or link → component onChange → `updateFrontmatter()` → `isDirty = true`

**When isDirty Becomes False:**
1. User saves explicitly (Cmd+S) → `saveNote()` completes → clears `editedBody` and `editedFrontmatter` (if unchanged)
2. Auto-save debounce fires → `saveNote()` completes
3. Window blur with auto-save enabled → `trySave()` → `saveNote()`
4. User switches notes and auto-save saves → `openNote()` awaits `saveNote()`
5. Workspace closes (all stores cleared)

**Concurrent Edit Detection:**
After save completes, checks if `editedBody` or `editedFrontmatter` changed during the save. If they did:
- Keep those fields and leave `isDirty = true`
- They'll be included in the next save
- This allows rapid successive edits without losing data

---

### 8. **Graph Sync on Frontmatter Changes**

When saving, if title or type changed (lines 191–197 in `editorStore.ts`):
```typescript
if (savingFrontmatter?.title !== undefined || savingFrontmatter?.note_type !== undefined) {
  useGraphStore.getState().applyEvent({
    type: "node-updated",
    path: activeNote.path,
    node: { path: refreshed.path, title: refreshed.title, note_type: refreshed.note_type },
  });
}
```
Updates the graph node in real-time.

---

### Summary Table

| System | Location | Key Pattern | Concurrency Guard |
|--------|----------|-------------|-------------------|
| **Undo/Redo** | `undoStore.ts` | Zustand store, bounded stack (20), side-effect cleanup | `isProcessing` flag |
| **Keyboard Shortcuts** | `App.tsx` lines 66–150 | Global `window.keydown`, checks if CodeMirror focused, preventDefault | None (synchronous) |
| **Editor State** | `editorStore.ts` | Merge-based frontmatter tracking, snapshot before save | `savingInProgress` flag |
| **Frontmatter Form** | `FrontmatterForm.tsx` | Controlled inputs, fallback display pattern | None (state lives in editorStore) |
| **Auto-Save** | `useAutoSave.ts` | 1.5s debounce, window blur trigger | Checks `isDirty`, `savingInProgress`, `activeNote` existence |
| **Tag/Extra/Links** | Sub-components | Local state for inputs, onChange merges into editorStore | `busy` flag per component |

---

**File Paths (Absolute):**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/hooks/useAutoSave.ts`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TagInput.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ExtraFieldsEditor.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/LinksEditor.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/UndoToast.tsx`

---

