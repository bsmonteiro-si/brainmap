# 2026-03-19 — Subagent Transcript: Explore

**Date:** 2026-03-19 11:45:34
**Agent:** Explore
**Agent ID:** a42508b63a4e54425
**Parent Session:** 2071fa22-c95f-42b9-ad13-3ed94950f981

---

## User

Explore the BrainMap codebase to understand:

1. The CodeMirror editor setup - how it's configured, what extensions are used, where the editor component lives (likely in `crates/app/src/components/Editor/`)
2. Any existing drag-and-drop handling in the app (search for "drag", "drop", "onDrop", "dragover", "dragenter", "dataTransfer")
3. How file paths are currently used/resolved in the frontend - look for path utilities, any Tauri commands that deal with file paths
4. The MarkdownEditor component specifically - its props, how it handles input

Be thorough - check both the editor components and any global event handlers.

---

## Assistant

I'll explore the BrainMap codebase to understand the CodeMirror setup, drag-and-drop handling, file path handling, and the MarkdownEditor component. Let me start with broad searches and then dive into specific files.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/**/*.{ts,tsx}"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -type f \\( -name \"*.tsx\" -o -name \"*.ts\" \\) | grep -i \"editor\\|markdown\" | head -20"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"drag|drop|onDrop|dragover|dragenter|dataTransfer","type":"tsx,ts","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

Good start. Now let me search more specifically for drag-drop handling and read the key editor files.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"drop\\|drag\\|Drop\\|Drag\" --include=\"*.tsx\" --include=\"*.ts\" crates/app/src/ 2>/dev/null | grep -v node_modules | head -30"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

Good! I found the editor setup. Now let me check the file tree DND utilities and search for drop handling more broadly:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/fileTreeDnd.ts"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"FileTree*\" -o -name \"FilesPanel*\" | head -10"}`

---

## Assistant

Now let me check the FileTreePanel and look for drop handlers in the app:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":150}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"onDrop\\|ondrop\\|dropZone\\|dragEnter\\|dragOver\" --include=\"*.tsx\" crates/app/src/ 2>/dev/null | head -40"}`

---

## Assistant

Let me read more of the FileTreePanel to see the drop handler implementation:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":300,"limit":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx","limit":200}`

---

## Assistant

Good! Let me continue reading the TabBar drop handler and also search for path-related utilities:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx","offset":200,"limit":100}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils -name \"*.ts\" | head -20"}`

---

## Assistant

Perfect! Let me read the path utilities:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/resolveNotePath.ts"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"dataTransfer\" --include=\"*.tsx\" --include=\"*.ts\" crates/app/src/ 2>/dev/null | grep -v node_modules"}`

---

## Assistant

Excellent! Now let me read the full FileTreePanel to understand the complete drop handling implementation:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"wc -l /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":500,"limit":300}`

---

## Assistant

Let me read the drop handler implementation in FileTreePanel:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":800,"limit":300}`

---

## Assistant

Let me continue reading the drop handler:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":1100,"limit":250}`

---

## Assistant

Now let me check the cmSmartPaste extension to understand how paste events are handled:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmSmartPaste.ts"}`

---

## Assistant

Perfect! Now let me search for the API methods that handle file operations:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api -name \"*.ts\" | head -10"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts","limit":100}`

---

## Assistant

Let me get the full API interface and check the workspace root handling:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts","offset":100,"limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts","limit":150}`

---

## Assistant

Excellent! Now I have a comprehensive understanding. Let me create a summary document based on my exploration. Since I'm in read-only mode, I'll provide the findings directly.

## Summary of BrainMap Codebase Exploration

Based on my thorough exploration of the BrainMap codebase, here are the key findings:

### 1. **CodeMirror Editor Setup** (`MarkdownEditor.tsx`)
- **Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx`
- **Configuration**:
  - Uses CodeMirror 6 with GFM markdown support
  - Extensions include: syntax highlighting, line numbers, search, auto-close brackets, history, formatting, link navigation, decorations
  - Custom dark theme deferred to CSS variables for selection colors
  - Scale detection patch for proper mouse hit-testing with CSS zoom
  - Editor created as `new EditorView({ state, parent: containerRef.current })`

- **Props**:
  ```typescript
  interface Props {
    notePath: string;
    content: string;
    onChange: (content: string) => void;
    onViewReady?: (view: EditorView | null) => void;
    restoreScrollTop?: number;
    restoreCursorPos?: number;
    readOnly?: boolean;
    raw?: boolean;
  }
  ```

- **Key Extensions Used**:
  - `calloutDecorations()` - for callout blocks
  - `listSpacing()` - list formatting
  - `markdownDecorations()` - markdown visual enhancements
  - `checkboxDecorations()` - checkbox styling
  - `bulletDecorations()` - bullet list styling
  - `orderedListDecorations()` - numbered list styling
  - `headingFoldService()` - collapsible headings
  - `mermaidDecorations()` - diagram support
  - `createSlashAutocompletion()` - slash commands
  - `smartPaste()` - URL wrapping when pasting
  - `editorContextMenu()` - right-click menu with table formatting

### 2. **Drag-and-Drop Handling**

#### **File Tree DnD** (`FileTreePanel.tsx` + `fileTreeDnd.ts`)
- **Custom MIME types used**:
  - `application/brainmap-path` - relative file/folder path
  - `application/brainmap-is-folder` - "1" or "0" flag
- **Drop Handlers**:
  - `handleDragStart()` - sets dataTransfer with path and folder flag
  - `handleFolderDragEnter()` - validates drop, triggers auto-expand on 600ms hover
  - `handleItemDragOver()` - handles both reorder and folder drop-into logic with `computeDropZone()`
  - `handleItemDrop()` - unified handler for reorder vs folder drop
  - `handleRootDrop()` - drop to workspace root with counter-based drag-leave tracking
- **Utilities** (`fileTreeDnd.ts`):
  - `isValidDrop()` - validates path, prevents self-drops, prevents folder→descendant drops
  - `computeDropZone()` - 25/50/25 split for folders (before/into/after), 50/50 for files
  - `computeNewPath()` - calculates new path after drag
  - `computeReorderedList()` - reorder within same parent folder

#### **Tab Bar DnD** (`TabBar.tsx`)
- **MIME type used**: `text/plain` - stores tab ID
- **Drop Handlers**:
  - `handleDragStart()` - sets dataTransfer
  - `handleDragOver()` - reorder logic with drop target tracking
  - `handleDragLeave()` - relatedTarget check to avoid false leaves
  - `handleDrop()` - calls `useTabStore.getState().reorderTab(dragTabId, tabId)`
  - `handleDragEnd()` - clears state

**NO drag-drop into the CodeMirror editor itself** - smartPaste only handles clipboard paste events.

### 3. **File Path Handling**

#### **Path Resolution Utilities** (`resolveNotePath.ts`)
```typescript
// Relative link resolution
resolveNotePath(currentNotePath, linkTarget)
  // "People/Judea Pearl.md", "./Francis Galton.md" → "People/Francis Galton.md"

// Relative path computation
relativePath(fromPath, toPath)
  // "Concepts/AI.md", "People/Turing.md" → "../People/Turing.md"

// Local link detection
isLocalNoteLink(href) // checks for .md, no http scheme, no # fragment

// Ensure .md extension
ensureMdExtension(path)
```

#### **Workspace Root Access**
- `useWorkspaceStore.getState().info?.root` - canonicalized absolute path
- Path handling:
  - Workspace root is trimmed of trailing slash: `wsRoot.replace(/\/$/, "")`
  - Full absolute path = `${wsRoot}/${relativePath}`
  - Relative paths used internally throughout app

### 4. **MarkdownEditor Component Integration** (`EditorPanel.tsx`)

**MarkdownEditor is mounted in three contexts**:
1. **Regular notes** - full metadata, frontmatter form, related notes footer
2. **Plain files** - simpler, no frontmatter
3. **Untitled tabs** - minimal, no metadata

**Change handling**:
- `onChange` prop updates `editorStore.updateContent(body)`
- `onViewReady` captures EditorView reference for toolbar access
- Scroll/cursor position restored via props on tab switch
- External content sync without recreation

### 5. **Smart Paste Extension** (`cmSmartPaste.ts`)

- Detects when user pastes a URL while text is selected
- Wraps selection as `[selected](url)` markdown link
- Uses CodeMirror's `domEventHandlers()` to intercept paste events
- Falls through to default paste in all other cases
- Checks `event.clipboardData?.getData("text/plain")`

### 6. **API & Path Handling**

**Key BrainMapAPI methods**:
- `moveNote(oldPath, newPath)` - returns new_path + rewritten_paths (backreferences)
- `moveFolder(oldFolder, newFolder)` - returns new_folder + moved_notes + rewritten_paths
- `createFolder(path)` - creates directory structure
- `listWorkspaceFiles()` - returns all files in workspace

**Files are workspace-relative paths** (no leading slash, no absolute paths from client).

### 7. **No Existing Drop-into-Editor Support**

The codebase has **NO file drop handlers on the CodeMirror editor itself**. Current drop support is:
- File tree reordering/moving (internal)
- Tab bar reordering (internal)
- Smart paste of URLs only (clipboard, not file drop)

This is a clean slate for implementing drop-to-insert functionality.

---

All absolute file paths for reference:
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx` - Editor setup
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx` - Integration
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx` - File tree DnD (1619 lines)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/fileTreeDnd.ts` - DnD utilities
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/resolveNotePath.ts` - Path utilities
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmSmartPaste.ts` - Smart paste
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts` - API interface
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts` - Workspace root access

---

