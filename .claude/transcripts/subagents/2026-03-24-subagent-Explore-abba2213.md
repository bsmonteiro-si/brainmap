# 2026-03-24 — Subagent Transcript: Explore

**Date:** 2026-03-24 18:09:19
**Agent:** Explore
**Agent ID:** abba221321eb33029
**Parent Session:** 21f5a143-5ae8-4a2f-a03b-15906b1a25b8

---

## User

I need to understand the app layout system to implement a "fullscreen canvas" toggle. The user wants to expand the canvas editor to fill the entire window, hiding the left sidebar, icon sidebar, tab bar, and right editor panel — with a simple toggle button.

Explore:

1. **AppLayout component**: Read `crates/app/src/components/Layout/AppLayout.tsx` completely. Understand the panel structure — what panels exist, how they're arranged, what controls their visibility.

2. **Icon sidebar**: Read `crates/app/src/components/Layout/IconSidebar.tsx` — how is it rendered? Can it be hidden?

3. **Panel resize system**: The app uses `react-resizable-panels`. How are panel sizes controlled? Is there a way to collapse panels to 0?

4. **Existing focus mode**: Search for `focusMode` in the codebase — the CLAUDE.md mentions it exists. How does it work? Does it hide panels? Can it be reused or extended?

5. **UIStore**: Read `crates/app/src/stores/uiStore.ts` — look for panel visibility state, focusMode, leftPanelCollapsed, and any existing fullscreen/zen mode patterns.

6. **Canvas tab detection**: How does the app know the current tab is a canvas? Look at `tabStore` or the tab kind system. The fullscreen toggle should only appear when a canvas is active.

7. **Tab bar**: Read the TabBar component — where is it rendered? Can it be hidden independently?

Be thorough — read full files, not just snippets.

---

## Assistant

I'll systematically explore the app layout system to understand how to implement a fullscreen canvas toggle. Let me start by reading the key files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/IconSidebar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

Let me read the uiStore in sections:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"focusMode|fullscreen|zen","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

Let me search for the focus mode implementation:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"focusMode|graphFocusMode","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","offset":100,"limit":150}`

---

## Assistant

Let me continue reading the uiStore to understand the focusMode better:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","offset":300,"limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","offset":680,"limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","offset":1000,"limit":100}`

---

## Assistant

Now let me look at the CanvasPanel and CanvasEditor to see where a fullscreen toggle should go:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Canvas/CanvasPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Canvas/CanvasEditor.tsx","limit":100}`

---

## Assistant

Let me find the CanvasEditor file:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/CanvasEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":100}`

---

## Assistant

Let me check how the App layout is structured and look for the CSS to understand styling:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","limit":150}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"app-layout|icon-sidebar|tab-bar","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","context":3}`

---

## Assistant

Let me look at how existing toggle buttons are implemented, particularly the focusMode in the Graph:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"toggleFocusMode","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"focusMode.*{","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components","output_mode":"files_with_matches"}`

---

## Assistant

Let me check the EditorPanel to see where focusMode is used:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"focusMode","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx","output_mode":"content","context":5}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx","limit":150}`

---

## Assistant

Let me check the CSS for focusMode styling and how panels respond:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"focusMode|focus-btn|editor-focus","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","context":3}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/CanvasEditor.tsx"}`

---

## Assistant

Let me check how focusMode actually changes the layout in App.tsx:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"focusMode","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","output_mode":"content","context":10}`

---

## Assistant

Now let me look at the CanvasEditor in full to understand its structure:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":100,"limit":300}`

---

## Assistant

Let me check the tabStore to understand tab kinds better and check the rest of the CanvasEditor render:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":800,"limit":200}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"kind.*canvas|canvas.*kind","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts","output_mode":"content","context":3}`

---

## Assistant

Perfect. Now let me check the CSS for canvas-container and StatusBar:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"canvas-container|\\.canvas-panel","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","context":5}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/StatusBar.tsx","limit":100}`

---

## Assistant

Let me find StatusBar:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/StatusBar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/StatusBar.tsx","limit":120}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/StatusBar/StatusBar.tsx","limit":150}`

---

## Assistant

Perfect! Now I have a comprehensive understanding of the layout system. Let me create a detailed exploration report.

## Comprehensive Exploration Report: Fullscreen Canvas Implementation

Based on my thorough investigation of the codebase, here's everything you need to know to implement a fullscreen canvas toggle:

### 1. **App Layout Structure**

The layout hierarchy (in `AppLayout.tsx`) is:
- **StatusBar** (top, fixed)
- **app-layout-root** (flex container)
  - **IconSidebar** (left, 40px wide, always visible)
  - **app-layout** (Group, horizontal panels with resizable-panels)
    - **Panel (content)** – Left panel with tabs (files, graph, search, canvas)
    - **Separator** – Resize handle
    - **Panel (editor)** – Right panel with TabBar + EditorPanel
      - **TabBar** – Tab list
      - **EditorPanel** – Content area (renders CanvasEditor when tab.kind === "canvas")

### 2. **Existing Focus Mode Pattern**

The app already has a `focusMode` that demonstrates panel hiding:

**UIStore state** (`uiStore.ts` line 311, 691, 1009-1012):
```typescript
focusMode: boolean;  // default: false

toggleFocusMode: () => set((s) => {
  const next = !s.focusMode;
  return { focusMode: next, leftPanelCollapsed: next };
}),
```

**Usage in EditorPanel** (3 locations with focus button):
- `focusMode` is read from UIStore
- `toggleFocusMode` is called on button click
- Escape key exits focusMode (App.tsx line 275)

**CSS**: `.editor-focus-btn` (2632-2646 in App.css) — simple button styling

### 3. **How to Detect Canvas is Active**

From `EditorPanel.tsx` (line 90-96) and `TabBar.tsx` (line 123):
```typescript
const activeTab = tabs.find((t) => t.id === activeTabId);
if (activeTab?.kind === "canvas") { ... }
```

Tab kinds are defined in `tabStore.ts` line 16: `"note" | "plain-file" | "untitled" | "pdf" | "excalidraw" | "canvas" | "image" | "video"`

### 4. **Panel Visibility Control**

**React-Resizable-Panels API** (used in AppLayout.tsx):
- `Panel.collapse()` – collapses panel to minimum size
- `Panel.expand()` – expands panel
- `panelRef.current?.collapse()` and `.expand()` are called via imperative refs (lines 39-42)

**Panel references in AppLayout**:
```typescript
const contentPanelRef = usePanelRef();      // Left panel
const editorPanelRef = usePanelRef();       // Right panel
```

**Current collapse logic** (lines 37-43):
- When `leftPanelCollapsed` changes, contentPanelRef is collapsed/expanded
- Same pattern can be extended

### 5. **What Needs Hiding for Fullscreen Canvas**

To fully hide all UI except the canvas:
1. ✅ **Left panel** (content) – collapse via `contentPanelRef.current?.collapse()`
2. ✅ **Right panel separator** – hide with CSS (display: none)
3. ✅ **Right panel** (editor with TabBar) – collapse via `editorPanelRef.current?.collapse()` OR hide entirely
4. ❌ **Icon sidebar** – Always rendered; needs CSS display: none or separate state
5. ❌ **StatusBar** – Always rendered at top; needs CSS display: none or separate state
6. ❌ **TabBar** – Rendered inside right panel; TabBar.tsx line 109 already returns null if tabs.length === 0, but can't programmatically hide

### 6. **UI Store Architecture**

`uiStore.ts` is a Zustand store with:
- **State**: Properties like `focusMode`, `leftPanelCollapsed`, `activeLeftTab`, `activeCanvasPath`
- **Actions**: Methods like `toggleFocusMode()`, `toggleLeftPanel()`, `setActiveLeftTab()`
- **Persistence**: Serialized to localStorage as `brainmap:uiPrefs`

To add fullscreen canvas, you'd add:
```typescript
canvasFullscreen: boolean;              // New state
toggleCanvasFullscreen: () => void;     // New action
```

### 7. **Canvas-Specific Considerations**

**CanvasEditor.tsx** (lines 181-1100+):
- Renders inside `ReactFlow` from `@xyflow/react`
- Has internal state: nodes, edges, zoom, pan, interaction modes
- Debounced save to file (1500ms default)
- File browser sidebar (can be shown/hidden via settings)

**CanvasPanel.tsx** (left tab version):
- Header with file picker + create button
- Body wraps `CanvasEditorInner` in `ReactFlowProvider`
- Different from EditorPanel canvas render

**Keyboard shortcuts in CanvasEditor**:
- Cmd+C/V for copy/paste
- Undo/Redo via custom stacks
- No existing fullscreen shortcut

### 8. **CSS Implications**

Current structure in App.css:
- `.app-layout-root` (2289-2294): flex layout containing sidebar + panels
- `.icon-sidebar` (2297-2332): 40px wide, fixed
- `.app-layout` (244-246): flex: 1, the resizable panels container
- `.tab-bar` (394-404): flex overflow-x auto
- `.canvas-container` (4776-4788): 100% width/height

**Fullscreen mode CSS needs**:
- Hide `.icon-sidebar` – `display: none`
- Hide `.status-bar` – `display: none`
- Hide `.tab-bar` – `display: none`
- Possibly use a modifier class: `.canvas-fullscreen` or check state with data attribute

### 9. **Implementation Strategy Overview**

**Option A: Add canvasFullscreen state** (cleanest, canvas-specific)
1. Add `canvasFullscreen: boolean` to UIStore
2. Add toggle action (Cmd+K or button in CanvasEditor toolbar)
3. In AppLayout, read `canvasFullscreen`, collapse both panels if true
4. In CSS, add `.icon-sidebar`, `.status-bar`, `.tab-bar` rules for fullscreen
5. Add Escape handler to exit fullscreen (like focusMode)

**Option B: Extend focusMode** (reuses existing pattern)
1. Modify `toggleFocusMode` to check if canvas is active
2. If canvas active, hide all panels + sidebar + statusbar
3. Less separate state, but mixes concerns

**Option C: Canvas-specific toolbar button**
1. Add fullscreen button in CanvasEditor toolbar
2. Use local state or UIStore property
3. Only appears when canvas is active

### 10. **Key Files to Modify**

1. **`crates/app/src/stores/uiStore.ts`**
   - Add `canvasFullscreen: boolean` state
   - Add `toggleCanvasFullscreen()` action
   - Optionally persist to localStorage

2. **`crates/app/src/components/Layout/AppLayout.tsx`**
   - Read `canvasFullscreen` from UIStore
   - Collapse both panels when true
   - Or hide panels with CSS

3. **`crates/app/src/App.css`**
   - Add fullscreen mode styles:
     ```css
     .app-layout-root.fullscreen .icon-sidebar { display: none; }
     .status-bar.fullscreen { display: none; }
     .tab-bar.fullscreen { display: none; }
     ```

4. **`crates/app/src/components/Editor/CanvasEditor.tsx`** (optional)
   - Add fullscreen toggle button in Controls or floating toolbar
   - Call `useUIStore.getState().toggleCanvasFullscreen()`

5. **`crates/app/src/App.tsx`**
   - Add Escape handler to exit fullscreen (line 269-280)

### 11. **Data Flow Diagram**

```
CanvasEditor click "fullscreen" button
  ↓
useUIStore.getState().toggleCanvasFullscreen()
  ↓
UIStore state update: canvasFullscreen = true
  ↓
AppLayout reads canvasFullscreen
  ↓
contentPanelRef.collapse() + editorPanelRef.collapse()
  ↓
CSS classes applied to hide sidebar/statusbar/tabbar
  ↓
Canvas fills entire viewport
```

### 12. **React-Resizable-Panels Caveats**

- Collapsing panels to 0 size doesn't fully hide them (they're still in DOM with visibility)
- Better to use CSS `display: none` for UI chrome (sidebar, statusbar, tabbar)
- Panels can be resized by dragging separator — collapse prevents that
- Viewport size recalculation may be needed (`cy.resize()` pattern exists for Cytoscape, similar for React Flow)

### 13. **Testing Points**

- ✅ Toggle fullscreen in/out
- ✅ Canvas fills viewport (no margins, no padding from hidden panels)
- ✅ Escape key exits fullscreen
- ✅ Tab shortcuts (Cmd+B for sidebar, etc.) disabled during fullscreen
- ✅ File saved after toggling fullscreen
- ✅ Zoom/pan state preserved
- ✅ Works for both EditorPanel canvas and CanvasPanel canvas

This exploration gives you the complete architectural picture needed to implement the feature cleanly!

---

