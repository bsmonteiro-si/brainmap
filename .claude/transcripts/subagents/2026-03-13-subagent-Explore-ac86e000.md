# 2026-03-13 — Subagent Transcript: Explore

**Date:** 2026-03-13 19:01:38
**Agent:** Explore
**Agent ID:** ac86e000f5442861e
**Parent Session:** 59d90c43-faad-42f0-aa81-c079b9550b2c

---

## User

Explore these specific areas for implementing an "untitled tab" feature (like VS Code Cmd+N):

1. In `crates/app/src/stores/editorStore.ts`:
   - How does `saveNote()` work? What guards does it have? What API does it call?
   - How does `clear()` work?
   - What is `CLEAN_EDITOR_STATE`?
   - How does the `openNote` flow load content into the editor?
   - How is `editedBody` set and used?
   - How does `activeNote` vs `activePlainFile` work?

2. In `crates/app/src/components/Editor/EditorPanel.tsx`:
   - How is the empty state rendered (no tabs)?
   - How does the editor decide what to show (note vs plain file vs empty)?

3. In `crates/app/src/hooks/useAutoSave.ts`:
   - Full auto-save logic - what triggers it, what guards prevent it?

4. In `crates/app/src/components/Editor/CreateNoteDialog.tsx`:
   - Full component - how does it create notes? What fields does it require?
   - How is it opened/closed (UIStore integration)?

5. In `crates/app/src/stores/uiStore.ts`:
   - How is `createNoteDialogOpen` managed? What other state relates to note creation?

6. Look for any existing confirmation dialog patterns (e.g., ConfirmDeleteDialog) to understand how to build a "save before close" dialog.

7. In `crates/app/src/api/bridge.ts` and `crates/app/src/api/types.ts`:
   - The `createNote` API signature and what it returns.

Thoroughness: very thorough. I need to understand all the details for designing untitled tabs.

---

## Assistant

I'll conduct a thorough exploration of these areas to understand the untitled tab feature requirements. Let me start by examining the key files in parallel.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/hooks/useAutoSave.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CreateNoteDialog.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

Now let me examine the remaining key files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts","limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts"}`

---

## Assistant

Now let me look for existing confirmation dialog patterns and search for any related code:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/*Dialog*.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/*Confirm*.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/ConfirmDeleteDialog.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/CreateFolderDialog.tsx"}`

---

## Assistant

Now let me check TabBar and look at how keyboard shortcuts are implemented for `Cmd+N`:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/hooks/useKeyboard*.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/hooks/useShortcut*.ts"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*KeyboardShortcuts*\" -o -name \"*shortcuts*\" 2>/dev/null | head -20"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"Cmd+N\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.ts\" --include=\"*.tsx\" 2>/dev/null | head -5"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"metaKey.*78\\|metaKey.*n\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.ts\" --include=\"*.tsx\" 2>/dev/null | head -10"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"useEffect\\|useKeyboard\\|addEventListener\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx 2>/dev/null | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","offset":150,"limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabActions.ts"}`

---

## Assistant

Perfect! Now I have a comprehensive understanding. Let me create a detailed exploration report:

## Comprehensive Exploration Report: Untitled Tab Feature

### 1. **editorStore.ts Analysis**

**Key Functions:**

1. **`saveNote()`** (lines 332-427):
   - Guards: `isDirty` check, `savingInProgress` check, empty title validation, no activeNote/activePlainFile check
   - For notes: calls `api.updateNote()`, then re-fetches with `api.readNote()`
   - For plain files: calls `api.writePlainFile()`
   - Clears `editedBody` and `editedFrontmatter` after successful save
   - Updates tab state with new `isDirty` status and title/noteType
   - Syncs graph store on title/type changes
   - **Critical**: Cannot save if `editedFrontmatter?.title` is empty (line 368)

2. **`clear()`** (lines 489-507):
   - Resets all editor state to CLEAN_EDITOR_STATE
   - Sets `activeNote`, `activePlainFile` to null
   - Clears all dirty/undo/conflict state
   - Used when no tabs are active

3. **`CLEAN_EDITOR_STATE`** (lines 67-81):
   - Template for blank editor with no active note/file
   - All editing fields set to null
   - Used in `openNote()` and `openPlainFile()` for fresh tabs

4. **`openNote(path)`** (lines 100-168):
   - Auto-saves current note if dirty (before switching)
   - Restores from existing tab if found, or fetches fresh from API
   - Sets `activeNote` and restores tab state
   - **Critical**: Guards against concurrent tab switches with `isLoading`

5. **`editedBody` and `editedFrontmatter`**:
   - Both start as `null` when note is clean
   - Set by `updateContent()` and `updateFrontmatter()` respectively
   - Only used if non-null; otherwise display reads from `activeNote`/`activePlainFile` directly (fallback pattern in EditorPanel)

6. **`activeNote` vs `activePlainFile`**:
   - Mutually exclusive (one is always null)
   - `activeNote`: full NoteDetail with metadata
   - `activePlainFile`: PlainFileDetail with binary flag

---

### 2. **EditorPanel.tsx Analysis**

**Empty State Rendering** (lines 151-161):
```tsx
if (!activeNote && tabs.length === 0) {
  return (
    <div className="editor-panel-container">
      <div className="editor-empty-state">
        <div className="editor-empty-icon">{"\u{1F9E0}"}</div>
        <div className="editor-empty-brand">BrainMap</div>
        <div className="editor-empty-hint">Select a note to start exploring</div>
      </div>
    </div>
  );
}
```

**Editor Decision Logic** (lines 14-42, 65-170):
- Checks `isLoading` → shows placeholder
- Checks `activePlainFile && !activeNote` → shows plain file view (including binary handling)
- Checks `!activeNote && tabs.length === 0` → shows empty state
- Checks `!activeNote` → shows loading placeholder
- Otherwise → shows note view with full hero/metadata/editor

**Display Logic for Content**:
- Uses `editedBody ?? activeNote.body` to fall back to saved version
- Uses `editedFm?.title ?? activeNote.title` for frontmatter fields

---

### 3. **useAutoSave.ts Analysis**

**Auto-save Guards** (lines 6-16):
```typescript
function trySave() {
  const { isDirty, savingInProgress, activeNote, activePlainFile, editedFrontmatter } =
    useEditorStore.getState();
  if (!isDirty || savingInProgress || (!activeNote && !activePlainFile)) return;
  if (
    editedFrontmatter?.title !== undefined &&
    editedFrontmatter.title.trim() === ""
  )
    return;
  useEditorStore.getState().saveNote();
}
```

**Triggers**:
1. Debounced 1500ms after content edit (`state.isDirty` becomes true)
2. Immediately on window blur (user leaves app)
3. On note switch (via `openNote()` pre-save)

**What Prevents Auto-save**:
- `savingInProgress` flag
- No active note/file
- Empty title in frontmatter
- Not dirty

---

### 4. **CreateNoteDialog.tsx Analysis**

**Component Signature** (lines 17-143):
- Takes `initialPath`, `initialTitle`, `createNoteMode` ("default" | "create-and-link"), `linkSource` from UIStore
- Validates path (must end `.md`) and title (non-empty)
- Auto-populates title from path unless manually edited

**Key Submission Flow** (lines 76-141):
```typescript
const createdPath = await api.createNote({
  path,
  title: title.trim(),
  note_type: noteType,
  tags: parsedTags,
  body: body || undefined,
});

// Optimistic graph update
useGraphStore.getState().createNote(createdPath, title.trim(), noteType);

// If create-and-link, add link then refresh
// Otherwise, open new note in editor
await useEditorStore.getState().openNote(createdPath);
close();
```

**Required Fields**:
- Path (must end `.md`)
- Title (non-empty)
- Type (defaults to first available type)

**Optional Fields**:
- Tags, body, status, source, summary, extra

---

### 5. **uiStore.ts Analysis**

**CreateNote Dialog State** (lines 56-68, 76-79, 222-235):
```typescript
type CreateNoteMode = "default" | "create-and-link";

interface CreateAndLinkSource {
  notePath: string;
  rel: string;
}

interface UIState {
  createNoteDialogOpen: boolean;
  createNoteInitialPath: string | null;
  createNoteInitialTitle: string | null;
  createNoteMode: CreateNoteMode;
  createAndLinkSource: CreateAndLinkSource | null;
}

openCreateNoteDialog: (pathOrOpts?: string | CreateNoteDialogOpts) => {
  // Accepts string path or full opts object
  // Sets mode, linkSource, title all at once
}

closeCreateNoteDialog: () => {
  // Clears all dialog state
}
```

---

### 6. **Confirmation Dialog Patterns**

**ConfirmDeleteDialog.tsx** (lines 25-282):
- **Props**: `target` (name, path, isFolder), `onConfirm(force: bool)`, `onCancel()`
- **Pattern**: Modal with overlay, load async data, disable on action, show warnings
- **Key Features**:
  - Checks external backlinks via API
  - Detects unsaved changes in active note
  - Shows custom messages per context (folder vs note)
  - Danger button styling

**CreateFolderDialog.tsx** (lines 6-190):
- **Pattern**: Simple modal with single input field
- **Key Features**:
  - Focus input on mount
  - Escape/click-overlay to close
  - Submit on Enter or Cmd+Enter
  - Error handling with user feedback

---

### 7. **Bridge & API Analysis**

**createNote Signature** (in types.ts, lines 109-119):
```typescript
createNote(params: {
  path: string;
  title: string;
  note_type: string;
  tags?: string[];
  status?: string;
  source?: string;
  summary?: string;
  extra?: Record<string, unknown>;
  body?: string;
}): Promise<string>;  // Returns created path
```

**Returns**: Promise of the created path (same as input path on success)

---

### 8. **TabStore.ts Analysis**

**TabState Interface** (lines 6-22):
```typescript
export interface TabState {
  id: string;            // file path (unique)
  path: string;          // same as id
  kind: "note" | "plain-file";
  title: string;         // display name in tab
  noteType: string | null;
  // Per-tab editor state
  editedBody: string | null;
  editedFrontmatter: FmSnapshot;
  isDirty: boolean;
  conflictState: "none" | "external-change";
  fmUndoStack: FmSnapshot[];
  fmRedoStack: FmSnapshot[];
  viewMode: "edit" | "preview";
  scrollTop: number;
  cursorPos: number;
}
```

**openTab()** (lines 62-77):
- Returns early if tab already exists (just activates)
- Creates fresh tab with `createFreshTab()`
- Inserts after currently active tab
- Sets as active

**Key Constraint**: `id` is the file path — one tab per file. Cannot have two tabs for same note.

---

### 9. **Keyboard Shortcuts in App.tsx**

**Cmd+N Handler** (lines 105-108):
```typescript
if (isMod && e.key === "n") {
  e.preventDefault();
  useUIStore.getState().openCreateNoteDialog();
}
```

**Other Relevant Shortcuts**:
- `Cmd+W`: Close tab (saves if dirty first, lines 87-100)
- `Cmd+S`: Manual save (line 109-112)
- `Cmd+Z/Y`: Undo/redo (routes to frontmatter or file-op undo, lines 138-158)

---

## Design Implications for Untitled Tabs

Based on this exploration, here are the key design constraints and opportunities:

1. **Tab ID = File Path Constraint**: Cannot create truly "untitled" tabs with the current tab system, since tab IDs must be file paths. Will need to either:
   - Use a virtual/temporary path (e.g., `:untitled-1`, `:untitled-2`) 
   - Or rethink tab tracking to support non-path identifiers

2. **Save-Before-Close Flow**: Similar to `ConfirmDeleteDialog`, will need a confirmation dialog for dirty untitled tabs. Pattern exists in codebase.

3. **Auto-save Blocking**: Untitled tabs should skip auto-save (no file path to save to). The `trySave()` guard already requires `activeNote || activePlainFile`, so untitled tabs would naturally skip auto-save.

4. **Empty Content Handling**: Both `editedBody` and `editedFrontmatter` start as `null`. Empty untitled tab starts with null body and null frontmatter — editor renders blank (since fallback to `activeNote.body` returns undefined).

5. **Tab Switching**: The `openNote()` pre-save logic must be adapted to handle tabs with no backing file. Will need special case.

6. **Graph Representation**: Untitled tabs have no node in the graph. Tab can exist independently of graph.

7. **Cmd+N Already Wired**: Opens `CreateNoteDialog()`, which requires path input. For untitled tabs, would need different logic or extended dialog.

---

**Files Summary:**

| File | Role | Key Details |
|------|------|------------|
| `editorStore.ts` | Editor state mgmt | `saveNote()` guards, `clear()`, `openNote()` tab restore |
| `EditorPanel.tsx` | Editor UI | Empty state render, fallback display logic |
| `useAutoSave.ts` | Auto-save logic | Guards against no active note |
| `CreateNoteDialog.tsx` | Note creation | Path/title validation, API call pattern |
| `uiStore.ts` | UI state | Dialog open/close, initial state management |
| `ConfirmDeleteDialog.tsx` | Confirmation UX | Modal pattern with async data, warnings, danger button |
| `CreateFolderDialog.tsx` | Folder creation | Simple modal pattern, input focus, validation |
| `bridge.ts`, `types.ts` | API layer | `createNote` signature, returns path |
| `tabStore.ts` | Tab management | TabState structure, id = path constraint |
| `TabBar.tsx` | Tab bar UI | Close handling, dirty indicator |
| `tabActions.ts` | Tab utilities | `closeTabAndNavigateNext()` logic |
| `App.tsx` | App root | Global keyboard shortcuts, Cmd+N handler |

All absolute paths provided above. This exploration covers all the core systems needed to design untitled tabs.

---

