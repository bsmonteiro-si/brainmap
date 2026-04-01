# 2026-03-10 — Subagent Transcript: Explore

**Date:** 2026-03-10 11:17:13
**Agent:** Explore
**Agent ID:** abb2d4b673202e11a
**Parent Session:** fcf2d61a-7ebc-44b6-8afd-41ff4f046647

---

## User

Explore the BrainMap desktop app at `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/`. Focus on:

1. The existing `FileTreePanel` component — read it fully (`crates/app/src/components/Layout/FileTreePanel.tsx`)
2. The `AppLayout.tsx` — read it fully to understand the current panel structure
3. The `uiStore.ts` — read it for relevant state (treeOpen, etc.)
4. The `graphStore.ts` — read it to understand what node/edge data is available
5. Any existing tab/toggle UI patterns in the app

Report:
- Full content of FileTreePanel.tsx
- Full content of AppLayout.tsx  
- Relevant parts of uiStore.ts (treeOpen, treeExpandedFolders, etc.)
- What data structures are in graphStore (nodes map shape, etc.)
- How the current file tree is triggered (Cmd+B, treeOpen state)
- Any existing CSS for the file tree / panel-header / tabs

Also check `crates/app/src/App.css` for any tab-related or view-toggle styles.

---

## Assistant

I'll explore the BrainMap desktop app structure systematically, starting with the key files you've listed.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Now let me check for keyboard shortcut handling and any other relevant UI patterns:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"Cmd\\+B|toggleTree|treeOpen","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","type":"tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/**/*.tsx"}`

---

## Assistant

Perfect! Now let me check the EditorPanel to see how the tabs might be structured there:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

Excellent. I have thoroughly explored the codebase. Let me now compile a comprehensive report for you.

---

## BrainMap Desktop App Exploration Report

### 1. **FileTreePanel.tsx** (Full Content)

**File Path:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`

The FileTreePanel renders a hierarchical file tree with:
- **Tree building** (`buildTree`): Converts the `nodes` Map from graphStore into a tree structure, sorting folders before files
- **Tree filtering** (`filterTree`): Filters tree nodes by title (case-insensitive) while maintaining folder hierarchy
- **FileTreeNode component**: Renders individual folders and files with click handlers
  - Folders show expand/collapse arrows (▾/▸) and are controlled by `treeExpandedFolders` Set in uiStore
  - Files show a 📄 icon and clicking them selects the node and opens it in the editor
  - Padding increases by 16px per nesting level
- **Filter input** at the top clears automatically when the workspace changes
- **CSS classes**: `file-tree-panel`, `file-tree-filter`, `file-tree-content`, `tree-item`, `tree-file`, `tree-folder`, `active`

---

### 2. **AppLayout.tsx** (Full Content)

**File Path:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx`

The AppLayout uses `react-resizable-panels` to manage a three-part layout:

**Structure:**
- **Outer Group (horizontal)**: Graph panel | Separator | Right panel
  - **Graph Panel** (default 60%):
    - If `treeOpen` is true: shows FileTreePanel in fixed 220px width + GraphView
    - Else: shows only GraphView with panel header "Graph"
    - Panel is collapsible (used by focusMode)
  - **Right Panel** (default 40%, vertical Group):
    - **Editor Panel** (default 60%): EditorPanel component
    - **Inspector Panel** (default 20%): InspectorPanel with header "Inspector"
    - **Search Panel** (default 20%): SearchPanel with header "Search"

**State Management:**
- Uses `usePanelRef()` for graph panel collapse/expand via focusMode
- Saves panel sizes to uiStore on layout change via `savePanelSizes`
- `PANEL_IDS` constants keep panel IDs in sync
- Panel sizes persisted in `panelSizes` state object

**No explicit tabs** — panels are stacked vertically on the right with fixed resizable boundaries. Each has a `.panel-header` label at the top.

---

### 3. **uiStore.ts** (Relevant State)

**File Path:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`

**Relevant State:**
```typescript
interface UIState {
  treeOpen: boolean;                      // Controls FileTreePanel visibility
  treeExpandedFolders: Set<string>;       // Tracks which folders are expanded
  focusMode: boolean;                     // Hides graph panel when true
  panelSizes: PanelSizes;                 // Stores graph, right, editor, inspector, search sizes

  toggleTree: () => void;                 // Toggle treeOpen
  toggleFolder: (fullPath: string) => void;  // Add/remove from treeExpandedFolders
  savePanelSizes: (sizes: Partial<PanelSizes>) => void;  // Merge & persist sizes
}
```

**Storage:** Panel sizes persisted to localStorage at key `brainmap:panelSizes` (JSON).

---

### 4. **graphStore.ts** (Data Structures)

**File Path:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts`

**Nodes Map Shape:**
```typescript
nodes: Map<string, NodeDto>
// Key: file path (e.g., "concepts/knowledge.md")
// Value: NodeDto = { path, title, note_type, ... }
```

**Edges Array:**
```typescript
edges: EdgeDto[]
// Each edge: { source: string, target: string, rel: string, ... }
```

**Other state:**
- `selectedNodePath`: Current node selection
- `expandedNodes`: Tracks lazy-loaded neighborhood expansions
- `isLoading`: Loading state for async operations

---

### 5. **How File Tree is Triggered (Cmd+B)**

**File Path:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx`

**Lines 69–72:**
```typescript
if (isMod && e.key === "b") {
  e.preventDefault();
  useUIStore.getState().toggleTree();
}
```

- **Cmd+B (or Ctrl+B)** triggers `toggleTree()`, which flips `treeOpen` boolean
- No persistent storage for `treeOpen` in current implementation (resets on reload)

---

### 6. **CSS for File Tree & Panel Headers**

**File Path:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` (Lines 489–577)

**File Tree CSS:**
```css
.file-tree-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border-right: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.file-tree-filter {
  padding: 6px 8px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.file-tree-filter input {
  width: 100%;
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  box-sizing: border-box;
}

.file-tree-content {
  flex: 1;
  overflow: auto;
}

.tree-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
}

.tree-item:hover {
  background: var(--bg-tertiary);
}

.tree-item.active {
  background: var(--accent);  // #4a9eff in light, same in dark
  color: white;
}

.tree-folder {
  font-weight: 500;
  color: var(--text-secondary);
}

.tree-icon {
  font-size: 10px;
  flex-shrink: 0;
  width: 14px;
}
```

**Panel Headers (used by Inspector/Search panels):**
```css
.panel-header {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
```

**Editor Header (custom, different from panel-header):**
```css
.editor-header-bar {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  gap: 8px;
}

.editor-title {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.editor-focus-btn {
  padding: 2px 6px;
  font-size: 14px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  flex-shrink: 0;
}

.editor-focus-btn:hover {
  background: var(--bg-tertiary);
}
```

---

### 7. **Existing UI Patterns (Tabs / Toggles)**

**Current layout does NOT use tabs.** Instead:
- **Panels are stacked vertically** on the right side with fixed proportions
- **Focus mode** hides the graph panel entirely (collapse button in editor header)
- **File tree toggle** (Cmd+B) shows/hides tree as a sidebar in the graph panel
- **Each right panel** (Editor, Inspector, Search) is always visible but resizable
- **Collapsible panels** exist for Inspector and Graph but only via `react-resizable-panels` collapse

**No tab bar, no tab switching, no tab close buttons** currently implemented.

---

### 8. **Keyboard Shortcuts (from App.tsx)**

- **Cmd+P**: Open command palette
- **Cmd+N**: Open create note dialog
- **Cmd+S**: Save note
- **Cmd+B**: Toggle file tree
- **Escape**: Exit focus mode or close command palette

---

### 9. **Summary of Current Architecture**

| Component | Purpose | State Source | Persistence |
|-----------|---------|--------------|-------------|
| FileTreePanel | Hierarchical file browser with filter | graphStore (nodes), uiStore (treeExpandedFolders, treeOpen) | localStorage panelSizes only |
| AppLayout | Panel layout manager | uiStore (focusMode, treeOpen, panelSizes) | localStorage |
| EditorPanel | Single-note editor | editorStore (activeNote) | None (discards unsaved) |
| Inspector/Search | Fixed right panels | — | panelSizes only |

**No multi-tab support.** Only one note can be open at a time in the editor. Switching notes discards unsaved changes (see line 33 in editorStore.ts: "Discard unsaved changes when switching notes in v1").

---

### 10. **Key CSS Classes Summary**

| Class | Purpose |
|-------|---------|
| `.file-tree-panel` | Container for file tree |
| `.file-tree-filter` | Search filter box |
| `.tree-item` | Individual file/folder item |
| `.tree-file` / `.tree-folder` | Item type variant |
| `.tree-icon` | Icon/arrow element |
| `.active` | Highlight selected item |
| `.panel-header` | Standard section header |
| `.editor-header-bar` | Custom editor title bar |
| `.panel-content` | Scrollable content area |
| `.resize-handle-h` / `.resize-handle-v` | Drag handles |

---

This exploration gives you a clear picture of the current structure, which appears ready for enhancements like a multi-tab editor or additional view modes. The existing panel system uses `react-resizable-panels`, which is flexible enough to accommodate new layouts.

---

