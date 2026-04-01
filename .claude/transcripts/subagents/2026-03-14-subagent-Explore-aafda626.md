# 2026-03-14 — Subagent Transcript: Explore

**Date:** 2026-03-14 11:20:51
**Agent:** Explore
**Agent ID:** aafda62686eca4c24
**Parent Session:** 37023488-d6c2-4fab-aa59-15ee7593e124

---

## User

Explore the BrainMap desktop app UI layout structure. I need to understand:

1. The main layout component and how panels are arranged (look in `crates/app/src/`)
2. How the left panel currently switches between Files and Graph views (the tab toggle mechanism)
3. The current panel size defaults and how react-resizable-panels is configured
4. The UIStore (specifically `activeLeftTab`, default tab, and any related state)
5. The search functionality - where is search UI currently? Is there a search panel/component?
6. The StatusBar component and how it's structured
7. Any constants for panel IDs or layout configuration

Be very thorough - read the actual component files, not just find them. I need to understand the full layout structure to plan a redesign.

---

## Assistant

I'll thoroughly explore the BrainMap desktop app UI layout structure. Let me start by examining the main layout and related components.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"*.tsx\" -o -name \"*.ts\" | grep -E \"(App|Layout|Panel|Store)\" | head -20"}`

---

## Assistant

Let me find and read the main layout files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/crates/app/src/components/Layout/*.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/crates/app/src/components/UI/*.tsx"}`

---

## Assistant

Now let me read the main AppLayout component:

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

Now let me examine the Search and Status Bar components:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components -type f -name \"*.tsx\" | grep -i \"search\\|status\" | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/StatusBar/StatusBar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Search/SearchPanel.tsx"}`

---

## Assistant

Now let me look at the EditorPanel and FileTreePanel to understand the full context:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx","limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":100}`

---

## Assistant

Now let me check the CSS to understand layout styling and look at the GraphView component:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*.css\" | head -10"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Let me get the full CSS and search for layout-related styles:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"app-layout\\|left-panel\\|panel\\|status-bar\\|search-panel\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -40"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"sed -n '64,135p' /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Now let me check the left panel CSS:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"sed -n '1105,1150p' /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Now let me look at search panel styles:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"sed -n '939,1020p' /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Now let me check the GraphView component to understand the graph rendering:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components -type f -name \"GraphView*\" -o -name \"graphView*\""}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx","limit":100}`

---

## Assistant

Perfect! Now I have enough information. Let me compile a comprehensive report of the layout structure. Let me also check what the `section-toggle` style looks like in the CSS:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"section-toggle\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"sed -n '426,450p' /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Perfect! Now I have a complete picture. Let me provide a comprehensive report to the user.

## BrainMap Desktop App UI Layout Structure - Complete Analysis

I've thoroughly explored the BrainMap desktop app layout. Here's the detailed breakdown:

### 1. **Main Layout Component: `AppLayout.tsx`**

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx`

The layout uses `react-resizable-panels` with two main hierarchical groups:

**Outer Group (Horizontal):**
- **Left Panel (Graph)** - Default 60%
  - Contains switchable tabs: Graph view and Files view
  - Collapsible for focus mode
- **Right Panel** - Default 40%
  - Vertically divided into two panels

**Right Panel (Vertical Inner Group):**
- **Editor Panel** - Default 60%
- **Search Panel** - Default 40%, collapsible (collapsed size: 28px)

**Panel IDs constant:**
```javascript
const PANEL_IDS = {
  graph: "graph",
  right: "right",
  editor: "editor",
  search: "search",
} as const;
```

### 2. **Left Panel Tab Toggle Mechanism**

**Location**: `AppLayout.tsx` lines 86-130

The left panel has two tabs:
- **Graph Tab** - Displays `<GraphView />` component
- **Files Tab** - Displays `<FileTreePanel />` component

**Implementation:**
- Uses semantic HTML: `role="tablist"`, `role="tab"`, `role="tabpanel"`
- CSS display toggle: `display: treeOpen ? "flex" : "none"` and vice versa
- Both panels are mounted simultaneously (CSS opacity transition) to preserve Cytoscape zoom/pan state
- **Toggle Logic** in `toggleTree()` via UIStore
- **Keyboard shortcut**: Cmd+B triggers `toggleTree()`
- **Graph tab secondary behavior**: Clicking Graph tab while on Graph tab clears focus mode

### 3. **Panel Size Defaults & react-resizable-panels Configuration**

**Defaults:**
- Left (graph): 60%
- Right: 40%
- Editor (within right): 60%
- Search (within right): 40%, collapsible with `collapsedSize="28px"`

**Configuration in AppLayout.tsx:**
```javascript
<Panel defaultSize={`${panelSizes.graph ?? 60}%`} minSize="10%" collapsible>
<Panel defaultSize={`${panelSizes.right ?? 40}%`} minSize="10%">
<Panel defaultSize={`${panelSizes.editor ?? 60}%`} minSize="15%">
<Panel defaultSize={`${panelSizes.search ?? 40}%`} minSize="8%" collapsible collapsedSize="28px">
```

**Layout change handlers:**
- `handleOuterLayout()` - saves `{ graph, right }` sizes
- `handleRightLayout()` - saves `{ editor, search }` sizes
- Sizes persisted to localStorage: `brainmap:panelSizes`

### 4. **UIStore State for Left Panel & Tab Management**

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`

**Key State Variables:**
```typescript
treeOpen: boolean;              // Files tab vs Graph tab toggle
graphFocusPath: string | null;  // For focus mode subgraph view
graphFocusKind: "note" | "folder" | null;
focusMode: boolean;             // Collapses left panel entirely
treeExpandedFolders: Set<string>; // Folder expansion state
panelSizes: PanelSizes;         // Persisted panel dimensions
hiddenEdgeTypes: Set<string>;   // Graph edge visibility filter
searchExpanded: boolean;        // Search panel expanded state
```

**Default State:**
- `treeOpen: false` → Graph tab active by default
- `focusMode: false` → Left panel expanded
- `searchExpanded: false` → Search panel collapsed initially

**Key Methods:**
- `toggleTree()` - switches between Graph/Files tabs
- `setGraphFocus(path, kind)` - switches to Graph tab, sets focus, closes Files
- `clearGraphFocus()` - clears focus subgraph
- `toggleFocusMode()` - collapses/expands left panel entirely
- `toggleSearchExpanded()` - toggles search panel
- `savePanelSizes(sizes)` - persists to localStorage

### 5. **Search Functionality**

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Search/SearchPanel.tsx`

**UI Structure:**
- Collapsible section with toggle button (▾/▸)
- Search input field with 300ms debounce
- Type filter dropdown (populated from `noteTypes`)
- Results list with title, type badge, and snippet

**Features:**
- Debounced search (300ms) via Tauri API
- Type filtering by note type
- Click result → opens note in editor and selects in graph
- Live search counter to avoid stale results

**Panel Configuration:**
- Bottom-right panel, vertically resizable
- Collapsed by default to 28px header (just the toggle button)
- Fully expandable to show search results

### 6. **StatusBar Component**

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/StatusBar/StatusBar.tsx`

**Content (left to right):**
1. Segment name (or workspace name fallback)
2. Separator: `|`
3. Graph stats: `{node_count} nodes · {edge_count} edges`
4. Active note path (if a note is open)
5. Dirty indicator: `(unsaved)` if file has unsaved changes
6. Settings button (⚙) - right-aligned, opens Settings modal (Cmd+,)
7. Close segment button (✕) - closes workspace and returns to SegmentPicker

**CSS class**: `.status-bar` - 4px padding, 12px gaps, positioned at app bottom

### 7. **Layout Configuration Constants**

**Main Constants:**
```typescript
// In AppLayout.tsx
const PANEL_IDS = {
  graph: "graph",      // Left panel
  right: "right",      // Right panel group
  editor: "editor",    // Top-right (note editor)
  search: "search",    // Bottom-right (search results)
};

// In uiStore.ts
const DEFAULT_UI_FONT = FONT_PRESETS[0].value;
const DEFAULT_EDITOR_FONT = FONT_PRESETS.find(p => p.label === "System Mono")!.value;
const DEFAULT_UI_SIZE = 13;
const DEFAULT_EDITOR_SIZE = 14;
const DEFAULT_ZOOM = 1.0;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;
```

**Persistance:**
- Panel sizes: `localStorage.brainmap:panelSizes`
- UI preferences: `localStorage.brainmap:uiPrefs` (font, size, zoom, theme)
- Segment data: `localStorage.brainmap:segments`

### 8. **Layout Flow & Component Hierarchy**

```
App.tsx (renders AppLayout when workspace open)
├── AppLayout.tsx
│   ├── Group (horizontal, outer)
│   │   ├── Panel "graph" (60%, collapsible)
│   │   │   ├── left-panel-tabs (Graph/Files buttons)
│   │   │   ├── GraphView (display: treeOpen ? none : flex)
│   │   │   └── FileTreePanel (display: treeOpen ? flex : none)
│   │   └── Panel "right" (40%)
│   │       ├── Group (vertical, inner)
│   │       │   ├── Panel "editor" (60%)
│   │       │   │   └── EditorPanel
│   │       │   │       ├── TabBar
│   │       │   │       ├── EditorToolbar
│   │       │   │       ├── MarkdownEditor (CodeMirror)
│   │       │   │       ├── MarkdownPreview
│   │       │   │       ├── FrontmatterForm
│   │       │   │       └── RelatedNotesFooter
│   │       │   └── Panel "search" (40%, collapsible)
│   │       │       └── SearchPanel
│   └── StatusBar
├── CommandPalette (modal)
├── CreateNoteDialog (modal)
├── CreateFolderDialog (modal)
├── SettingsModal (modal)
└── UndoToast (transient notification)
```

### 9. **CSS Layout Structure**

**Key CSS classes:**
- `.app-layout` - root flex container, height 100%
- `.panel` - flex column, overflow hidden, bordered
- `.left-panel-tabs` - flex, gap 2px, bottom border
- `.left-panel-tab` - padding 5px 10px, accent underline when active
- `.panel-content` - flex 1, min-height 0, overflow auto
- `.search-panel` - flex column, height 100%
- `.status-bar` - flex, align center, gap 16px, bottom border
- `.search-input-bar` - flex column, gap 6px, border bottom
- `.search-results` - flex 1, overflow auto

### 10. **Key Integration Points**

**File Tree Expansion:**
- `treeExpandedFolders: Set<string>` in UIStore manages which folders are open
- `toggleFolder(fullPath)` method to expand/collapse

**Focus Mode:**
- `focusMode: boolean` - collapses entire left panel
- Graph panel ref: `graphPanelRef.current?.collapse()` / `.expand()`
- Uses `usePanelRef()` hook from react-resizable-panels

**Search Panel:**
- `searchExpanded: boolean` - tracks open/collapsed state
- Search panel ref: `searchPanelRef.current?.collapse()` / `.expand()`
- Initially `false` (collapsed to 28px)

**Graph Interactions:**
- Left panel Graph/Files toggle preserves Cytoscape state via CSS display toggle
- `hasBeenFittedRef` prevents refitting on repeated reveals
- `cy.resize()` + `fit()` only called on first reveal

This comprehensive layout uses a modern, responsive panel system with persistent state management, collapsible sections, and tab-based navigation for the left panel. The architecture cleanly separates concerns through Zustand stores and leverages react-resizable-panels for drag-to-resize functionality.

---

