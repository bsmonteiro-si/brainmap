# 2026-03-13 — Subagent Transcript: Explore

**Date:** 2026-03-13 16:28:05
**Agent:** Explore
**Agent ID:** a1fab169d2e560b4a
**Parent Session:** 59d90c43-faad-42f0-aa81-c079b9550b2c

---

## User

I need to understand the UI layout structure of this Tauri + React desktop app to plan multi-tab editing. Explore:

1. The main layout component — how is the app structured (panels, columns)?
2. The EditorPanel or equivalent — what renders the note content?
3. The file tree — how does clicking a note trigger opening it?
4. Any tab-like UI that already exists
5. The CSS/styling approach used (CSS modules? styled components? plain CSS?)

Look at:
- `crates/app/src/components/` — list all components and read the main layout ones
- `crates/app/src/App.tsx` or equivalent entry point
- Any panel/column components
- The file tree component and how it handles clicks

Return file listings and key component structures.

---

## Assistant

I'll explore the Tauri + React desktop app structure to understand the UI layout, focusing on panels, file tree, editor, and any existing tab patterns.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"*.tsx\" -o -name \"*.ts\" | head -30"}`

---

## Assistant

Now let me explore the component structure more thoroughly:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components -type f -name \"*.tsx\" | sort"}`

---

## Assistant

Now let me read the key layout and component files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

Now let me read the FileTreePanel to understand how note clicking works:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","limit":100}`

---

## Assistant

Now let me look at the CSS structure:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*.css\" | sort"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","limit":200}`

---

## Assistant

Let me check the uiStore for the state structure:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","limit":150}`

---

## Assistant

Now let me look at the main entry point and any existing tab patterns:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/main.tsx"}`

---

## Assistant

Let me also examine how the graph store manages selection:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts","limit":100}`

---

## Assistant

Perfect. Now let me create a comprehensive summary document:

## Summary: UI Layout Structure for Multi-Tab Editing

Based on my exploration of the BrainMap Tauri + React desktop app, here's the complete UI layout architecture:

### 1. **Main Layout Structure** (`AppLayout.tsx`)

The app uses a **3-panel horizontal/vertical split layout** with `react-resizable-panels`:

```
┌─────────────────────────────────────────────────────────────┐
│                         Status Bar                          │
├─────────────────────────────────────────────────────────────┤
│                 AppLayout (Main Content Area)                │
│  ┌──────────────────────┬──────────────────────────────────┐ │
│  │   LEFT PANEL         │   RIGHT PANEL (vertical split)   │ │
│  │  (60% default)       │   (40% default)                  │ │
│  │                      │  ┌──────────────────────────────┐│ │
│  │  Graph/Files Tabs    │  │   EDITOR PANEL (60% default) ││ │
│  │  ┌────────────────┐  │  │   - Title + metadata header  ││ │
│  │  │ Graph │ Files  │  │  │   - Edit/Preview toggle      ││ │
│  │  └────────────────┘  │  │   - Frontmatter form         ││ │
│  │  ┌──────────────┐    │  │   - CodeMirror editor        ││ │
│  │  │ GraphView    │    │  │   - Related notes footer      ││ │
│  │  │   OR         │    │  │                              ││ │
│  │  │ FileTreePanel│    │  ├──────────────────────────────┤│ │
│  │  │ (file tree)  │    │  │  SEARCH PANEL (40% default)  ││ │
│  │  │              │    │  │  (collapsible)               ││ │
│  │  └──────────────┘    │  └──────────────────────────────┘│ │
│  └──────────────────────┴──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Key elements:**
- **Outer horizontal split**: `Graph/Files panel (left)` ↔ `Right panel (editor + search)`
- **Inner vertical split**: `Editor panel` ↔ `Search panel`
- Both panels use `react-resizable-panels` with draggable dividers
- Panel sizes persisted to `UIStore.panelSizes` (graph/right/editor/search percentages)

---

### 2. **Left Panel: Graph/Files Toggle**

Located in `AppLayout.tsx` (lines 86-130):

```tsx
<div role="tablist" className="left-panel-tabs">
  <button role="tab" id="left-graph-tab" ... >Graph</button>
  <button role="tab" id="left-files-tab" ... >Files</button>
</div>

<div role="tabpanel" id="left-graph-panel" style={{ display: treeOpen ? "none" : "flex" }}>
  <GraphView />
</div>
<div role="tabpanel" id="left-files-panel" style={{ display: treeOpen ? "flex" : "none" }}>
  <FileTreePanel />
</div>
```

**Current state:**
- Both panels are **always mounted** (CSS `display` toggle only)
- Cytoscape state preserved via `hasBeenFittedRef` on reveal
- Toggled by `Cmd+B` or clicking the tab button
- `treeOpen` boolean in `UIStore` tracks which is visible

---

### 3. **File Tree Click Flow**

**FileTreePanel** (`FileTreePanel.tsx`, lines 425-433):

```tsx
const handleClick = () => {
  if (isBrainMapNote) {
    useGraphStore.getState().selectNode(node.fullPath);
    useEditorStore.getState().openNote(node.fullPath);
  } else {
    useGraphStore.getState().selectNode(null);
    useEditorStore.getState().openPlainFile(node.fullPath);
  }
};
```

**Flow:**
1. Click note in file tree
2. `graphStore.selectNode(path)` → updates `selectedNodePath` (highlights in graph if visible)
3. `editorStore.openNote(path)` → 
   - Auto-saves current note if dirty + autoSave enabled (line 47-58)
   - Fetches note via API
   - Sets `activeNote` in `EditorState`
   - Pushes to navigation history
4. `EditorPanel` re-renders with new note

---

### 4. **EditorPanel Component** (`EditorPanel.tsx`)

Renders the editor for the currently active note:

```tsx
interface EditorState {
  activeNote: NoteDetail | null;
  activePlainFile: PlainFileDetail | null;
  isDirty: boolean;
  editedBody: string | null;
  editedFrontmatter: Partial<EditableFrontmatter> | null;
  // ... 14 methods
}
```

**EditorPanel structure:**
- **Hero section** (title + metadata):
  - Displays: Title, type pill (colored), tags, status, source
  - Edit/Preview toggle buttons
  - Focus mode button
  - Dirty indicator (unsaved dot)
  
- **Frontmatter form** (collapsible):
  - Title, Type (select), Status (select), Tags (pills), Source, Summary, Extra fields
  
- **Editor body** (dual-layer):
  - Layer 1: CodeMirror (edit mode) — mounted and swapped via CSS opacity
  - Layer 2: MarkdownPreview (preview mode) — mounted and swapped via CSS opacity
  
- **EditorToolbar** (format buttons):
  - Bold, Italic, Strikethrough, Code, Headings, Lists, Blockquote, Link, HR
  
- **RelatedNotesFooter**:
  - Grouped outgoing/incoming edges with direction indicators

**Key state:**
- `activeNote: NoteDetail | null` — currently open note
- `activePlainFile: PlainFileDetail | null` — non-BrainMap files
- `isDirty: boolean` — unsaved changes
- `editedBody: string | null` — buffered content
- `editedFrontmatter: Partial<EditableFrontmatter> | null` — buffered metadata

---

### 5. **Current Tab-Like Features**

1. **Graph/Files toggle** (left panel):
   - CSS display-based tab system
   - Keyboard: `Cmd+B`
   - Both panels mounted, only one visible

2. **Edit/Preview toggle** (editor):
   - CSS opacity-based tab (lines 103-114 in EditorPanel)
   - Both CodeMirror and preview mounted
   - Preserves editor state (cursor, scroll) during toggle

3. **Status selection** in metadata:
   - Dropdown select in FrontmatterForm

4. **No current multi-note tab system** in the editor itself

---

### 6. **CSS/Styling Approach**

**File:** `App.css` (250+ lines of plain CSS)

**Approach:** Plain CSS with CSS variables for theming:
- Theme vars: `--bg-primary`, `--text-primary`, `--accent`, etc.
- Font vars: `--ui-font-family`, `--editor-font-size`, set at runtime by `UIStore`
- Responsive panels via `react-resizable-panels` library (not custom CSS)

**No CSS Modules or styled-components** — all inline styles or App.css classes.

---

### 7. **Store Architecture**

**Key stores for multi-tab editing:**

| Store | Role | Relevant State |
|-------|------|-----------------|
| `editorStore` | Active note management | `activeNote`, `isDirty`, `editedBody` |
| `uiStore` | UI visibility + preferences | `treeOpen`, `panelSizes`, `autoSave` |
| `graphStore` | Graph topology + selection | `selectedNodePath`, `nodes`, `edges` |
| `navigationStore` | Back/forward history | Navigation stack |

**No "tab store"** currently — only single active note at a time.

---

### 8. **Component Tree**

```
App (root, sets theme + fonts + zoom)
├── AppLayout
│   ├── Panel (left: Graph/Files)
│   │   ├── GraphView (Cytoscape)
│   │   └── FileTreePanel
│   │       └── FileTreeNode (recursive)
│   ├── Panel (right)
│   │   ├── Panel (editor)
│   │   │   └── EditorPanel
│   │   │       ├── MarkdownEditor (CodeMirror)
│   │   │       ├── MarkdownPreview
│   │   │       ├── FrontmatterForm
│   │   │       └── RelatedNotesFooter
│   │   └── Panel (search)
│   │       └── SearchPanel
│   └── StatusBar
├── CommandPalette (overlay)
├── CreateNoteDialog (overlay)
├── CreateFolderDialog (overlay)
├── SettingsModal (overlay)
└── UndoToast (notification)
```

---

### 9. **Key Observations for Multi-Tab Design**

**Current patterns to leverage:**
1. **Dual-mounted UI pattern**: Both Graph/Files stay mounted, toggled via CSS → same approach for editor tabs
2. **Store-driven state**: All UI state in Zustand stores (no React context)
3. **Auto-save mechanism**: Already handles note switching (line 42-54 in editorStore)
4. **Navigation history**: `navigationStore` tracks visited notes (supports back/forward)
5. **Dirty state tracking**: `isDirty` flag prevents data loss

**Challenges:**
- **Single `activeNote` model**: Currently only one note can be open at a time
- **No tab management store**: Would need new store for tab state (order, active tab, open tabs list)
- **File tree selection**: `selectedNodePath` in graphStore hardcoded to last-clicked
- **Panel layout**: Right panel fixed to editor below search; tabs would need to be within editor panel only

---

### 10. **File Paths (Absolute)**

| File | Purpose |
|------|---------|
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx` | Root component, keyboard shortcuts, theme setup |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx` | 3-panel layout with Graph/Files tabs |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx` | Note editor + metadata |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx` | File tree with click handlers |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` | All styling (250+ lines) |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts` | Editor state (activeNote, isDirty, etc.) |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts` | UI state (treeOpen, panelSizes, etc.) |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts` | Graph state (selectedNodePath, nodes) |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/navigationStore.ts` | Navigation history |

---

This layout uses a proven "both-mounted, CSS-toggled" pattern for tab-like UI, which is ideal for preserving editor state across switches. The store architecture is well-suited for managing multiple open notes, and the existing auto-save/dirty-state mechanisms already handle note switching robustly.

---

