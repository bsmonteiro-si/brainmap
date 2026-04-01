# 2026-03-14 — Subagent Transcript: Explore

**Date:** 2026-03-14 15:42:33
**Agent:** Explore
**Agent ID:** af3cadbbfd22ee2d5
**Parent Session:** 1eaf9c8b-9552-4a4e-a53c-e9b30f5c09cc

---

## User

Find all code related to right-click context menus in the graph view (Cytoscape graph) and the "Focus in Graph" feature. I need to understand:

1. How the graph view handles right-click events on nodes (look for cxttap, contextmenu, or similar Cytoscape events)
2. How "Focus in Graph" works from the Files view (the existing implementation)
3. The graphFocusFilter.ts file and related UIStore state (graphFocusPath, graphFocusKind)
4. How setGraphFocus works in the UIStore

Search in crates/app/src/ directory. Be thorough - check GraphView.tsx, any context menu components, uiStore, graphFocusFilter.ts, and FileTreePanel or similar.

---

## Assistant

I'll conduct a thorough search for all code related to right-click context menus in the graph view and the "Focus in Graph" feature. Let me start with parallel searches.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.{ts,tsx}"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cxttap|contextmenu|context.*menu","path":"crates/app/src","type":"ts"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"setGraphFocus|graphFocusPath|graphFocusKind","path":"crates/app/src","type":"ts"}`

---

## Assistant

Now let me read the key files. I'll start with the UIStore, GraphView, and related files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphFocusFilter.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

Now let me check the FileTreePanel for the "Focus in Graph" context menu and look for any right-click handling:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":200}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"Focus in Graph|focusInGraph|focus.*graph","path":"crates/app/src","type":"ts","output_mode":"content"}`

---

## Assistant

Let me continue reading the FileTreePanel to see the context menu implementation:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":200,"limit":200}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"right-click|onContextMenu|handleContextMenu","path":"crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content"}`

---

## Assistant

Let me get the rest of the FileTreePanel to see the context menu handler and the complete implementation:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":450,"limit":250}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphToolbar.tsx"}`

---

## Assistant

Perfect! Now let me check if there are any tests for the "Focus in Graph" feature and look at the graphStyles to see how the focal node is styled:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphFocusFilter.test.ts"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"graph-focus-node|focal","path":"crates/app/src/components/GraphView/graphStyles.ts","output_mode":"content","context":3}`

---

## Assistant

Now let me get more context on the graph styles and search for any additional context menu or right-click handling in the graph:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts","limit":150}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cxttap|taphold|right.*click","path":"crates/app/src/components/GraphView","type":"ts"}`

---

## Assistant

Perfect! Now let me look at the uiStore tests to see if there are additional tests for the graph focus functionality:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"setGraphFocus|clearGraphFocus|graph.*focus","path":"crates/app/src/stores/uiStore.test.ts","output_mode":"content"}`

---

## Assistant

Now let me check if there are any hover actions or context menus in the graph view itself:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"hover|action|menu","path":"crates/app/src/components/GraphView/GraphView.tsx","output_mode":"content"}`

---

## Assistant

Now let me check for the "Focus ×" button implementation and verify the complete flow. Let me also look at linksEditor to see if there's any "Focus in Graph" there:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"Focus in Graph\" --include=\"*.tsx\" --include=\"*.ts\" crates/app/src/"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"setGraphFocus\\|clearGraphFocus\" --include=\"*.tsx\" --include=\"*.ts\" crates/app/src/ | head -20"}`

---

## Assistant

Let me check the LinksEditor to see the complete context:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"setGraphFocus.*folder","path":"crates/app/src/components/Editor/LinksEditor.tsx","output_mode":"content","context":5}`

---

## Assistant

Perfect! Now let me check the undoStore to see how it clears graph focus:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"clearGraphFocus","path":"crates/app/src/stores/undoStore.ts","output_mode":"content","context":5}`

---

## Assistant

Excellent! Now I have a comprehensive understanding of the code. Let me create a detailed summary report for the user.

## Summary: Right-Click Context Menus and "Focus in Graph" Feature

I've thoroughly explored all the code related to right-click context menus in the graph view and the "Focus in Graph" feature. Here are my findings:

### 1. **Right-Click Context Menus in the Graph View (Cytoscape)**

**Current Status**: The Cytoscape graph view does NOT currently implement right-click context menus. There is no `cxttap` (Cytoscape's right-click event), `contextmenu`, or `taphold` event handling in GraphView.tsx.

**Graph View Event Handlers** (from GraphView.tsx, lines 194-298):
- `cy.on("tap", "node")` — Left-click on nodes (line 194)
- `cy.on("dbltap", "node")` — Double-click on nodes (line 206)
- `cy.on("tap")` — Canvas background tap (line 211)
- `cy.on("zoom")` — Zoom level changes (line 217)
- `cy.on("mouseover", "node")` — Hover for tooltip (line 238)
- `cy.on("mouseout", "node")` — Unhover (line 286)
- Hover state cleanup (line 226)

No right-click handling exists in the graph itself.

### 2. **"Focus in Graph" Implementation** 

**Location**: FileTreePanel.tsx (right-click context menu in the Files view)

**How it works**:
1. **Context Menu Handler** (line 494): `handleContextMenu` captures right-click on tree nodes
2. **Context Menu Component** (lines 185-320): Displays "Focus in Graph" option for:
   - Folders (line 288-290)
   - BrainMap notes with a valid note_type (line 302-304)
3. **Focus Handler** (lines 228-234):
   ```typescript
   const handleFocusInGraph = () => {
     if (!state.node) { onClose(); return; }
     onClose();
     useUIStore.getState().setGraphFocus(
       state.node.fullPath,
       state.node.isFolder ? "folder" : "note"
     );
   };
   ```

### 3. **UIStore State Management** 

**State Fields** (uiStore.ts, lines 161-162):
- `graphFocusPath: string | null` — Path of the focused note/folder
- `graphFocusKind: "note" | "folder" | null` — Type of focus

**Actions** (lines 203-204, 429-430):
- `setGraphFocus(path, kind)` — Sets focus and switches to graph tab with expanded left panel (line 429)
  ```typescript
  setGraphFocus: (path, kind) => set({ 
    graphFocusPath: path, 
    graphFocusKind: kind, 
    activeLeftTab: "graph", 
    leftPanelCollapsed: false 
  }),
  ```
- `clearGraphFocus()` — Resets focus state (line 430)

### 4. **Graph Focus Filter** 

**File**: graphFocusFilter.ts

**Function**: `filterGraphByFocus(nodes, edges, focusPath, focusKind)` (lines 17-68)

**Behavior**:
- **Note focus** (lines 23-34): Shows focal note + direct neighbors (1-hop) + connecting edges
- **Folder focus** (lines 35-67): Shows all notes in the folder + their direct neighbors + all edges between visible nodes
- **Returns**: `{ filteredNodes, filteredEdges, focalPath }`

**Integration in GraphView.tsx** (lines 117-122):
```typescript
const { filteredNodes, filteredEdges, focalPath } = useMemo(() => {
  if (!graphFocusPath || !graphFocusKind) {
    return { filteredNodes: [...nodes.values()], filteredEdges: edges, focalPath: null };
  }
  return filterGraphByFocus(nodes, edges, graphFocusPath, graphFocusKind);
}, [graphFocusPath, graphFocusKind, nodes, edges]);
```

### 5. **Visual Feedback**

**Focal Node Styling** (graphStyles.ts, lines 132-141):
```typescript
{
  selector: "node.graph-focus-node",
  style: {
    width: 32,
    height: 32,
    "shadow-blur": 26,
    "shadow-opacity": 1.0,
  },
},
```

**Focal Node Class Assignment** (GraphView.tsx, lines 372-375):
```typescript
if (focalPath) {
  cy.getElementById(focalPath).addClass("graph-focus-node");
}
```

### 6. **Clearing Focus**

**UI Control** (GraphToolbar.tsx, lines 109-118):
- "Focus ×" button appears when focus is active
- Orange warning color background
- Clicking triggers `clearGraphFocus()`

**Programmatic Clearing**:
- When deleting a focused note/folder (FileTreePanel.tsx, lines 551-560; undoStore.ts, lines 63-70)
- When undoing node operations (undoStore.ts)
- When re-clicking the Graph tab (implicit in tab switching logic)

### 7. **Additional Integration Points**

**LinksEditor.tsx** (line 160): Clicking a link to a folder node in the editor also triggers `setGraphFocus("folder")`

**Folder Nodes in Graph** (GraphView.tsx, lines 197-203):
- Clicking a folder node in the graph triggers focus instead of opening the editor
- Handles both notes and folders uniformly

### 8. **Test Coverage**

**graphFocusFilter.test.ts** (9 comprehensive tests):
- Note focus scenarios (returns focal + neighbors, handles missing nodes, handles edges in both directions)
- Folder focus scenarios (includes folder notes + neighbors, handles cross-folder edges, handles empty folders)

**uiStore.test.ts** (line 225-227): Tests that `setGraphFocus` switches to graph tab and expands panel

### Files Involved

1. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts` — State management
2. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphFocusFilter.ts` — Filtering logic
3. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx` — Graph rendering
4. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx` — Right-click context menu
5. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphToolbar.tsx` — Focus control button
6. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts` — Visual styling
7. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/LinksEditor.tsx` — Editor integration
8. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts` — Undo integration

This implementation is well-designed with pure filtering logic (`graphFocusFilter.ts`), comprehensive test coverage, and consistent UI/UX patterns across the application.

---

