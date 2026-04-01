# 2026-03-14 — Subagent Transcript: Explore

**Date:** 2026-03-14 11:20:28
**Agent:** Explore
**Agent ID:** a1602a9e6dda131b3
**Parent Session:** 37023488-d6c2-4fab-aa59-15ee7593e124

---

## User

Explore the BrainMap desktop app in `crates/app/src/` to find:

1. All components related to the left panel - FileTreePanel, GraphView, any panel switching UI
2. Any existing search components or search-related UI (SearchPanel, search bar, etc.)
3. The CSS/styling for the layout - how panels are styled, any sidebar styling
4. How Cmd+B currently works for toggling
5. The toolbar components at the top of the file tree (the icons for new note, new folder, etc.)
6. How the Graph/Files tab toggle is currently rendered (the actual JSX)

Read the actual component files to understand their structure.

---

## Assistant

I'll explore the BrainMap desktop app to understand the left panel layout, search components, and related UI patterns.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"*.tsx\" -o -name \"*.ts\" | head -30"}`

---

## Assistant

Let me continue finding component files and read the key ones:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components -type f -name \"*.tsx\" | sort"}`

---

## Assistant

Excellent! I can see there's already a `SearchPanel.tsx`. Let me read the key component files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Search/SearchPanel.tsx"}`

---

## Assistant

Now let me read the uiStore to understand the Cmd+B toggle and panel state management:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/StatusBar/StatusBar.tsx"}`

---

## Assistant

Now let me check the CSS/styling and find where Cmd+B is registered:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*.css\" -o -name \"*.scss\" | head -20"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"Cmd\\+B|cmd.*b|toggleTree","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","type":"ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

Perfect! Let me read the App.css to understand the current styling layout:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","limit":300}`

---

## Assistant

Let me continue reading the CSS for the file tree panel and left panel tabs:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":300,"limit":400}`

---

## Assistant

Let me continue reading the CSS to find file tree and left panel styles:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":700,"limit":400}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1100,"limit":500}`

---

## Assistant

Excellent! I have a comprehensive understanding of the architecture. Let me compile my findings:

## Summary of Desktop App Components and Architecture

Based on my exploration of the BrainMap desktop app codebase, here are the key findings:

### 1. **Left Panel Structure (AppLayout.tsx)**
- **Left panel contains two tabs**: "Graph" and "Files" that toggle via Cmd+B
- **Tab implementation** (lines 86-114): Uses semantic `<div role="tablist">` with `left-panel-tabs` class
- **Display switching**: Uses CSS `display: flex/none` to show/hide panels without unmounting (preserves Cytoscape state)
- **Active tab indicator**: `left-panel-tab.active` class with accent color underline (line 1131-1134 in CSS)
- **Panel refs**: `graphPanelRef` for collapsible graph panel management via `usePanelRef()` from `react-resizable-panels`

### 2. **Search Component (SearchPanel.tsx)**
- **Location**: Bottom-right panel in the right column (secondary panel below editor)
- **Expandable**: Controlled by `searchExpanded` state in UIStore
- **Features**:
  - Search input with 300ms debounce (line 61)
  - Type filter dropdown (lines 102-107)
  - Result list with title, type badge, and snippet (lines 121-133)
  - Click to open note in editor
- **Search icon**: Uses Unicode `⌕` (magnifying glass) in file tree filter bar as well
- **Not in left panel** — it's in the right column's lower panel, separate from Files/Graph tabs

### 3. **File Tree Toolbar (FileTreePanel.tsx)**
- **Location**: Top of Files tab in left panel
- **Buttons** (lines 635-650):
  - `+` button: Opens CreateNoteDialog (Cmd+N)
  - `⊞` button: Opens CreateFolderDialog
- **Styling**: `file-tree-toolbar` class (line 1144-1151 in CSS) — flex row with 3px padding
- **Below toolbar**: Search bar with filter input (lines 652-660)

### 4. **File Tree Search Bar**
- **Different from SearchPanel**: Local fuzzy filter within FileTreePanel
- **Unicode icon**: `⌕` (line 653)
- **Input**: `file-tree-search-input` class
- **Filtered rendering**: Uses `fuzzyFilterTree()` function to filter displayed notes in real-time
- **Fuzzy match highlighting**: Highlights matched characters with `<mark>` tags via `highlightFuzzyMatch()`

### 5. **Cmd+B Keyboard Shortcut (App.tsx)**
- **Implementation** (lines 150-157):
  ```typescript
  if (isMod && e.key === "b") {
    const target = e.target as HTMLElement | null;
    if (!target?.closest(".cm-editor")) {
      e.preventDefault();
      useUIStore.getState().toggleTree();
    }
  }
  ```
- **Smart behavior**: Allows CodeMirror's Cmd+B for bold when editor has focus
- **Action**: Toggles `treeOpen` boolean in UIStore
- **Visual effect**: Switches between Graph and Files tabs in left panel

### 6. **Graph/Files Tab Toggle Logic (AppLayout.tsx)**
- **Graph tab click** (lines 93-100):
  - If already on Graph tab and `graphFocusPath` exists: clears focus to show full graph
  - If on Files tab: switches to Graph
- **Files tab click** (lines 110): Simply toggles to Files if not already there
- **Tab styling**: 
  - Border-bottom accent color on active tab (CSS line 1133)
  - Smooth color transition (CSS line 1126: `transition: color 0.12s`)

### 7. **Panel Layout Structure**
- **Outer layout**: Horizontal (Graph/Files panel left, Right panel right)
- **Right panel layout**: Vertical (Editor panel top, Search panel bottom)
- **Collapsible**: Both graph panel and search panel can collapse via `usePanelRef()` hooks
- **Resizable**: `react-resizable-panels` with separators (`.resize-handle-h` and `.resize-handle-v` classes)

### 8. **CSS Classes and Styling**
Key classes found in App.css:
- `.left-panel-tabs` (line 1105): Tab bar styling
- `.left-panel-tab` (line 1113): Individual tab styling
- `.left-panel-tab.active` (line 1131): Active state with accent underline
- `.file-tree-panel` (line 1137): Main container
- `.file-tree-toolbar` (line 1144): New note/folder buttons
- `.file-tree-search` (line 1176): Search bar with icon
- `.tree-item` (line 1209): Individual file/folder item
- `.context-menu` (line 1325): Right-click context menu positioning
- `.search-panel` (line 939): Search results panel styling

### 9. **Key State Management (UIStore)**
- `treeOpen`: Boolean for Graph/Files tab visibility (line 93)
- `searchExpanded`: Boolean for Search panel collapse/expand (line 102)
- `graphFocusPath`: String for focus mode path (line 97)
- `toggleTree()`: Action to switch tabs (line 261)
- `toggleSearchExpanded()`: Action to collapse/expand search (line 290)

### 10. **Virtual Folder Nodes**
- Folders are first-class graph nodes (created via `buildTree()` function)
- Virtual tree nodes skip `note_type: "folder"` entries when rendering (line 69)
- Folders shown with `FolderTreeIcon` component (open/closed states)
- Chevron icon with 90° rotation animation on expand

This comprehensive architecture supports the existing UI pattern and would be the foundation for any search-related enhancements or restructuring.

---

