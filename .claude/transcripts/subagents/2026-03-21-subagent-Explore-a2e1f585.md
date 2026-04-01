# 2026-03-21 — Subagent Transcript: Explore

**Date:** 2026-03-21 11:02:36
**Agent:** Explore
**Agent ID:** a2e1f585b193c2850
**Parent Session:** b1d9eca6-8bb3-4c0b-8673-2c48c1a7ec0b

---

## User

Explore the BrainMap app's panel layout architecture thoroughly. I need to understand:

1. **AppLayout.tsx** (`crates/app/src/components/Layout/AppLayout.tsx`) — How the main layout works, what panels exist, how they're arranged with react-resizable-panels
2. **Left panel tabs** — How Graph/Files/Search tabs work in the left panel. Look at:
   - `crates/app/src/stores/uiStore.ts` — search for `activeLeftTab`, `LeftTab`, `leftPanelCollapsed`
   - How tab switching works (the sidebar icons on the far left)
3. **GraphView component** — How it's rendered in the left panel:
   - `crates/app/src/components/GraphView/GraphView.tsx` — how it mounts/unmounts
   - Does it stay mounted when switching tabs or does it remount?
4. **Panel sizing** — How `panelSizes`, `defaultTabSizes`, `BUILTIN_TAB_SIZES` work for per-tab panel proportions
5. **The sidebar icons** — What component renders the left icon bar (Graph, Files, Search icons)?
6. **How clicking a graph node opens a note** — the flow from graph click → editor panel

I need to understand this well enough to plan adding a "Canvas" tab to the left panel that shows a canvas view alongside the editor (like Graph does), with configurable panel sizes.

---

## Assistant

I'll conduct a thorough exploration of the BrainMap panel layout architecture. Let me start by examining the key files you've identified.

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

Let me read the uiStore.ts file in segments since it's large, and continue examining other key files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Layout/IconSidebar.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/stores/editorStore.ts"}`

---

## Assistant

Let me read the IconSidebar and continue with uiStore:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/IconSidebar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","offset":100,"limit":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

Now let me read more of uiStore to see the panel sizing logic and actions:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","offset":300,"limit":300}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","limit":150}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

Let me read the savePanelSizes action and finish examining the key component:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","offset":700,"limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":100}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Search/SearchPanel.tsx"}`

---

## Assistant

Let me check the SearchPanel and understand how the graph node opening flow works through the stores:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Search/SearchPanel.tsx","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts","limit":150}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find crates/app/src -type f -name \"*.tsx\" | xargs grep -l \"activeLeftTab\" | head -10"}`

---

## Assistant

Perfect! Now let me gather a few more key details about how the graph click flow works and where the openNote path is handled:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","offset":113,"limit":100}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"defaultSize\" crates/app/src/components/Layout/AppLayout.tsx | head -5"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"getTabSizes\\|BUILTIN_TAB_SIZES\" crates/app/src --include=\"*.ts\" --include=\"*.tsx\" | head -20"}`

---

## Assistant

Excellent! Now I have a comprehensive understanding. Let me create a detailed report of the panel layout architecture:

## BrainMap Panel Layout Architecture - Comprehensive Exploration

I've thoroughly explored the BrainMap app's panel layout system. Here's what I found:

### 1. **Main Layout Structure** (`AppLayout.tsx`)

The app uses **two-panel horizontal layout** with `react-resizable-panels`:

- **Content Panel** (left): displays one of three tabs (Files/Graph/Search)
- **Separator**: draggable resize handle
- **Editor Panel** (right): displays the editor for the selected note

```
┌─────────────────────────────────┐
│  Icon Sidebar │ Content Panel │  Editor Panel  │
│  (Files)      │ (Graph View)  │ (Note Editor)  │
│  (Graph)      │ Or Files      │                │
│  (Search)     │ Or Search     │                │
└─────────────────────────────────┘
```

**Key files:**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx` - Main layout with `react-resizable-panels`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/IconSidebar.tsx` - Left icon bar for tab switching

### 2. **Left Panel Tabs System** (`uiStore.ts`)

The left panel contains **three tabs**:
- `"files"` - FileTreePanel
- `"graph"` - GraphView (Cytoscape.js)
- `"search"` - SearchPanel

**Type definitions:**
```typescript
export type LeftTab = "files" | "graph" | "search";

interface TabPanelSizes {
  content?: number;  // content panel size (%)
  editor?: number;   // editor panel size (%)
}

interface PanelSizes {
  files?: TabPanelSizes;
  graph?: TabPanelSizes;
  search?: TabPanelSizes;
}

export const BUILTIN_TAB_SIZES: Record<LeftTab, Required<TabPanelSizes>> = {
  files: { content: 20, editor: 80 },  // Files view: small left, large right
  graph: { content: 80, editor: 20 },  // Graph view: large left, small right
  search: { content: 20, editor: 80 }, // Search view: small left, large right
};
```

**Per-tab size persistence:**
- Each tab remembers its own panel proportions
- Stored in localStorage as `"brainmap:panelSizes"` (JSON per-tab format)
- `savePanelSizes(tab: LeftTab, sizes: TabPanelSizes)` action in uiStore persists sizes to localStorage

### 3. **Tab Switching Mechanism**

**Icon Sidebar** (`IconSidebar.tsx`, lines 7-49):
- Renders 3 icon buttons (Files, Graph, Search) from `SIDEBAR_ITEMS`
- Click behavior:
  - If clicking active tab AND panel is not collapsed → toggles collapse
  - Otherwise → activates tab and expands panel
- `setActiveLeftTab(tab)` action also ensures `leftPanelCollapsed: false`

**State in uiStore:**
```typescript
activeLeftTab: LeftTab;          // current tab
leftPanelCollapsed: boolean;     // collapse/expand state
panelSizes: PanelSizes;          // per-tab sizes
```

### 4. **GraphView Rendering & Tab Switching**

**Graph Component** (`GraphView.tsx`, lines 170-916):

- Uses `Cytoscape.js` with `fcose`, `dagre` layouts
- **Mounted state**: Stays mounted even when not visible (CSS `display: none`)
  - Reason: Preserves Cytoscape zoom/pan state across tab switches
  - Controlled by `activeLeftTab === "graph" ? "flex" : "none"`

**Critical resize logic** (lines 260-280):
```typescript
useEffect(() => {
  if (activeLeftTab === "graph") {
    cy.resize();  // Immediate resize
    if (!hasBeenFittedRef.current && cy.nodes().length > 0) {
      cy.fit(undefined, 40);  // Fit on first reveal only
      hasBeenFittedRef.current = true;
    }
    // Delayed resize after panel animation (100ms)
    const timer = setTimeout(() => {
      cy.resize();
      if (cy.nodes().length > 0) {
        cy.fit(undefined, 40);
      }
    }, 100);
    return () => clearTimeout(timer);
  }
}, [activeLeftTab]);
```

**Why this pattern:**
- First `cy.resize()` picks up the container dimensions immediately
- Second `cy.resize()` after 100ms gives the panel resize animation time to settle
- `hasBeenFittedRef` prevents `cy.fit()` on every tab switch (only on first reveal)

### 5. **Panel Size Management**

**In AppLayout.tsx:**

```typescript
const tabSizes = getTabSizes(panelSizes, activeLeftTab);

// Initial sizes from stored state
<Panel defaultSize={`${tabSizes.content}%`} ...>
<Panel defaultSize={`${tabSizes.editor}%`} ...>

// On resize: save to store and localStorage
const handleLayout = (layout: Layout) => {
  savePanelSizes(tab, { content: layout[PANEL_IDS.content], editor: layout[PANEL_IDS.editor] });
};
```

**Key pattern:**
- Uses `defaultSize` on first mount
- Imperatively resizes panels via `usePanelRef.current?.resize()` when `activeLeftTab` changes
- This ensures each tab restores its last-known sizes

### 6. **Graph Node Click → Editor Flow**

**Graph click handler** (`GraphView.tsx`, lines 315-325):
```typescript
cy.on("tap", "node", (evt) => {
  const nodePath = evt.target.id();
  const nodeData = useGraphStore.getState().nodes.get(nodePath);
  if (nodeData?.note_type === "folder") {
    // Folder click → focus graph on folder
    useUIStore.getState().setGraphFocus(nodePath, "folder");
  } else {
    // Note click → select in graph + open in editor
    selectNodeRef.current(nodePath);
    useEditorStore.getState().openNote(nodePath);
  }
});
```

**Then in editorStore.ts:**
- `openNote(path)` → reads note from API → creates tab in TabStore → sets `activeNote` in editorStore
- EditorPanel observes `activeNote` and renders the note content

**Similar flow from SearchPanel** (`SearchPanel.tsx`, lines 73-76):
```typescript
const handleResultClick = (result: SearchResult) => {
  selectNode(result.path);
  useEditorStore.getState().openNote(result.path);
};
```

### 7. **Component Mount/Unmount Pattern**

**In AppLayout.tsx (lines 82-97):**
All three panels stay mounted, visibility controlled by `display` CSS:

```typescript
<div style={{ display: activeLeftTab === "graph" ? "flex" : "none" }}>
  <GraphView />
</div>
<div style={{ display: activeLeftTab === "files" ? "flex" : "none" }}>
  <FileTreePanel />
</div>
<div style={{ display: activeLeftTab === "search" ? "flex" : "none" }}>
  <SearchPanel />
</div>
```

**Benefits:**
- Components don't unmount/remount on tab switch
- GraphView preserves Cytoscape state (zoom, pan)
- FileTreePanel preserves scroll position
- Only CSS visibility changes

### 8. **PANEL_IDS Constant**

**In AppLayout.tsx (lines 14-17):**
```typescript
const PANEL_IDS = {
  content: "content",   // Left panel ID for react-resizable-panels
  editor: "editor",     // Right panel ID
} as const;
```

Used to identify which panel changed in `onLayoutChanged` callback.

### 9. **Key Design Insights for Canvas Tab Addition**

1. **Tab type is hard-coded** to LeftTab union type (files|graph|search)
   - Adding Canvas would require expanding this type
   
2. **Panel sizes are keyed by tab name**
   - Canvas would get its own entry in `BUILTIN_TAB_SIZES`, e.g., `canvas: { content: 50, editor: 50 }`
   
3. **Mount-but-hide pattern preserves state**
   - Canvas component should stay mounted when invisible
   - Use `display: none` (or `display: flex`) based on `activeLeftTab === "canvas"`
   
4. **Resize timing is critical**
   - Cytoscape needs `cy.resize()` + delayed resize after panel animation
   - Canvas might need similar pattern if it uses canvas/WebGL rendering
   
5. **Icon sidebar is just a list**
   - Adding Canvas icon is straightforward: add to `SIDEBAR_ITEMS` array in IconSidebar
   
6. **No special panel for Canvas needed**
   - Canvas can be rendered in the content panel like Graph/Files/Search
   - Or it could be a separate right-column panel (would require layout restructuring)

### File Locations Summary

```
Layout components:
  /crates/app/src/components/Layout/AppLayout.tsx
  /crates/app/src/components/Layout/IconSidebar.tsx

Content panels:
  /crates/app/src/components/Layout/FileTreePanel.tsx
  /crates/app/src/components/GraphView/GraphView.tsx
  /crates/app/src/components/Search/SearchPanel.tsx

Stores:
  /crates/app/src/stores/uiStore.ts (panel sizes, activeLeftTab, etc.)
  /crates/app/src/stores/editorStore.ts (openNote, activeNote)
  /crates/app/src/stores/graphStore.ts (selectNode)
  /crates/app/src/stores/tabStore.ts (tab management)
```

This architecture is clean and extensible for adding a Canvas tab alongside the existing left-panel tabs!

---

