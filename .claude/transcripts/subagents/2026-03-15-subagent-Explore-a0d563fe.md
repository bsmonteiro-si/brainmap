# 2026-03-15 — Subagent Transcript: Explore

**Date:** 2026-03-15 12:00:38
**Agent:** Explore
**Agent ID:** a0d563fe9487629e3
**Parent Session:** 259b1f85-bfcc-4fcf-bee8-9f79a9a2aa3f

---

## User

Explore the BrainMap frontend codebase to understand the UI patterns for file/folder operations. I need to understand:

1. The FileTreePanel context menu — how does it work? What items does it have? Look at `crates/app/src/components/FileTreePanel.tsx` or similar
2. How delete and create operations are triggered from the UI (dialogs, stores, etc.)
3. The existing drag-and-drop move UI in `utils/fileTreeDnd.ts`
4. Tab store — how does `renamePath` and `renamePathPrefix` work? (These seem relevant for rename)
5. The undo store — how are move operations tracked for undo?
6. The editor store — how does it handle path changes?
7. Any existing rename-related code or inline editing patterns

Look at these key files:
- `crates/app/src/components/FileTreePanel.tsx`
- `crates/app/src/stores/tabStore.ts`
- `crates/app/src/stores/undoStore.ts`
- `crates/app/src/stores/editorStore.ts`
- `crates/app/src/api/tauri.ts` (the API bridge)
- `crates/app/src/api/types.ts`

Be very thorough in reading the context menu code and the tab rename functions.

---

## Assistant

I'll explore the BrainMap frontend codebase to understand the UI patterns for file/folder operations. Let me start by reading the key files you mentioned.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

Now let me read the other files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/FileTreePanel.tsx"}`

---

## Assistant

Let me search for the FileTreePanel component:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*FileTree*\" -type f"}`

---

## Assistant

Now let me read the FileTreePanel component and related files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":400}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*fileTreeDnd*\" -o -name \"*fileTreeContextMenu*\" -o -name \"*fileTree*\" | grep -v test | grep -v node_modules"}`

---

## Assistant

Let me continue reading FileTreePanel and then read the fileTreeDnd utility:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":400,"limit":400}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/fileTreeDnd.ts"}`

---

## Assistant

Now let me read the rest of FileTreePanel and check for inline editing patterns:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":799,"limit":200}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*Dialog*\" -o -name \"*Modal*\" | grep -i \"create\\|rename\\|edit\" | head -10"}`

---

## Assistant

Let me read the create dialogs to understand the pattern:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CreateNoteDialog.tsx","limit":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/CreateFolderDialog.tsx","limit":200}`

---

## Assistant

Perfect! Now let me check the uiStore to see how these dialogs are wired:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"createNoteInitialPath\\|createFolderInitialPath\\|openCreateNoteDialog\\|openCreateFolderDialog\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts | h`

---

## Assistant

Now let me check the Rust backend to understand the rename/move operations:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri -name \"*.rs\" | grep -E \"command|handler\" | head -5"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"move_note\\|move_folder\\|rename\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs | head -20"}`

---

## Assistant

Perfect! Now I have enough information. Let me compile a comprehensive exploration report:

## Comprehensive Exploration Report: BrainMap Frontend File/Folder Operations

I've thoroughly explored the BrainMap frontend codebase to understand the UI patterns for file/folder operations. Here's what I found:

### 1. Context Menu System (`FileTreePanel.tsx`)

The context menu is a critical UI pattern. Located at lines 176-335:

**Menu Structure:**
- **Right-click empty area (root context)**: "New Note at Root", "New Folder at Root"
- **Right-click folder**: 
  - "New Note Here"
  - "New Subfolder Here"
  - "Focus in Graph"
  - "Delete Folder" (danger styled)
- **Right-click BrainMap note**:
  - "New Note Here" or "New Note in Folder" (context-aware)
  - "Focus in Graph"
  - "Set as Home Note" / "Unset Home Note" (toggles)
  - "Delete" (danger styled)
- **Right-click plain file**:
  - "New Note Here" / "New Note in Folder"

The menu positions itself using viewport-aware clamping (lines 196-207) and closes on outside click or Escape.

### 2. File/Folder Operations Triggering

**Creation** (`lines 914-931`):
- Toolbar buttons: `+` (New Note) and `⊞` (New Folder)
- Context menu items: "New Note Here", "New Subfolder Here"
- All route through `useUIStore.openCreateNoteDialog(prefix)` and `useUIStore.openCreateFolderDialog(prefix)`

**Deletion** (`lines 794-912`):
- Context menu "Delete" / "Delete Folder"
- Shows `ConfirmDeleteDialog` which handles:
  - Tab cleanup before API call
  - Snapshotting notes for undo
  - Partial folder deletion recovery
  - Graph updates via `applyEvent`
  - Empty folder tracking cleanup

**Move** (`lines 627-735`):
- Drag-and-drop only (no explicit rename UI)
- `executeMoveItem` handles both notes and folders
- For folders: auto-saves active note, checks for other dirty tabs, uses `renamePathPrefix` for all tabs in folder
- For notes: auto-saves if dirty, uses `renamePath` for single tab
- Updates editor, graph focus, and home note atomically
- Pushes undo action: `{ kind: "move-note", oldPath, newPath }` or `{ kind: "move-folder", oldFolder, newFolder }`

### 3. Tab Management Integration

**TabStore functions** (`tabStore.ts`):

```typescript
renamePath(oldPath: string, newPath: string, newTitle?: string)
  // Updates single tab ID, path, title
  // activeTabId swapped if it was the active tab

renamePathPrefix(oldPrefix: string, newPrefix: string)
  // Updates all tabs whose path starts with prefix
  // For folder moves: handles bulk rename of all notes inside
  // Auto-generates new titles from path
```

These are called by:
- `FileTreePanel.executeMoveItem` after successful move
- `undoStore` for undo/redo move operations

### 4. Existing Drag-and-Drop Move UI

**`fileTreeDnd.ts`** (pure utilities):
- `computeNewPath(draggedPath, targetFolder, isFolder)`: Returns new relative path
- `isValidDrop(draggedPath, draggedIsFolder, targetFolder)`: Validates drop legality
  - Prevents moving to same location
  - Prevents moving folder into itself or descendants

**DnD handlers** (`FileTreePanel.tsx` lines 565-735):
- `handleDragStart`: Sets data transfer with path and isFolder flag
- `handleFolderDragEnter`: Auto-expands collapsed folders after 600ms hover
- `handleFolderDrop`: Executes move via `executeMoveItem`
- **Root drop support**: `handleRootDragEnter/Over/Leave/Drop` for moving items to workspace root

### 5. Undo/Redo Integration

**`undoStore.ts`** tracks:

```typescript
UndoableAction =
  | { kind: "move-note"; oldPath: string; newPath: string }
  | { kind: "move-folder"; oldFolder: string; newFolder: string }
```

**Undo for move** (`lines 269-315`):
- Calls `api.moveNote(newPath, oldPath)` (reverses direction)
- Updates tabs: `renamePath(newPath, oldPath)` 
- Runs `postMoveCleanup(newPath, oldPath, isFolder)` to update editor/graph/home note
- Shows toast: `"Undo: moved "name""`

**postMoveCleanup** (`lines 72-101`):
- For folder moves: updates active note path if inside moved folder, clears graph focus if targeted
- For note moves: reopens editor at new path, updates graph selection, updates home note if moved
- Updates home note atomically (no separate step)

### 6. Dialog System (No Inline Rename)

**Pattern for Create**:
- `CreateNoteDialog.tsx`: Modal with path + title + type fields; `Cmd+Enter` or button submits
- `CreateFolderDialog.tsx`: Modal with folder path field; `Enter` submits
- Both use `useUIStore` for state: `createNoteInitialPath`, `createFolderInitialPath`
- Both support `initialPath` to pre-populate context (e.g., "New Note in Folder")

**Key observation**: No inline rename UI exists. The app uses dialogs for creation and move-via-DnD for renaming.

### 7. Editor Store Path Handling

When paths change (via `openNote` in `editorStore.ts` line 112):
- Snapshots current tab state first
- Auto-saves if dirty
- Checks for existing tab and restores it
- Calls `refreshActiveNote` to re-fetch if metadata changed
- Tab IDs and paths must stay in sync

### 8. API Bridge (`tauri.ts`)

**File operations** exported:
- `moveNote(oldPath, newPath)`: Returns `{ new_path: string; rewritten_paths: string[] }`
- `moveFolder(oldFolder, newFolder)`: Returns `{ new_folder: string; moved_notes: [string, string][]; rewritten_paths: string[] }`

These are direct Tauri invokes to Rust backend handlers.

### 9. Key UI/UX Patterns

1. **Folder prefix-aware naming** (line 237-242): `folderPrefixFor(node)` returns trailing slash or empty string
2. **Root-level vs nested context**: Context menu items change based on `isRootLevelFile` flag
3. **Danger styling**: Delete items use CSS class `context-menu-item--danger`
4. **Breadcrumb context**: Every operation knows parent folder path for UI feedback
5. **Auto-expand on hover**: Collapsed folders expand after 600ms when dragging over them
6. **Dirty tab checking**: Before moving folders, checks for unsaved work; refuses move if found
7. **One tab per file rule**: Tab ID = file path; `openTab` checks if tab exists before creating

### 10. CSS Classes for Visual Feedback

From the code:
- `tree-item tree-folder` / `tree-item tree-file`: Base classes
- `dragging`: Applied while dragging
- `drag-over`: Applied to potential drop target
- `tree-file--plain`: For non-BrainMap files
- `tree-file-actions`: The "⋯" menu button
- `context-menu` / `context-menu-item` / `context-menu-item--danger`: Menu styling
- `tree-children-anim` / `tree-children-anim--open`: Expand/collapse animation

### Files Read

- `/crates/app/src/components/Layout/FileTreePanel.tsx` (988 lines)
- `/crates/app/src/stores/tabStore.ts` (189 lines)
- `/crates/app/src/stores/undoStore.ts` (471 lines)
- `/crates/app/src/stores/editorStore.ts` (727 lines)
- `/crates/app/src/api/tauri.ts` (160 lines)
- `/crates/app/src/api/types.ts` (150 lines)
- `/crates/app/src/utils/fileTreeDnd.ts` (53 lines)
- `/crates/app/src/components/Editor/CreateNoteDialog.tsx` (partial: 200+ lines)
- `/crates/app/src/components/Layout/CreateFolderDialog.tsx` (191 lines)

All UI patterns are well-established, tested, and documented within the code. The rename feature would follow the existing drag-and-drop visual feedback patterns and atomic update strategy used for move operations.

---

