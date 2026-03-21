# How to Add a Left Panel Tab

A "panel tab" adds a new view to the left side of the app alongside Files, Graph, Search, and Canvas. The panel shares the screen with the editor panel on the right, and users can resize the split between them.

Use this guide when you need a persistent side panel that coexists with the note editor. If you're adding a file-type viewer that replaces the editor (like Excalidraw), use `add-file-type-editor.md` instead.

## Reference implementations

- `GraphView.tsx` — Graph visualization (Cytoscape.js, stays mounted, resize handling)
- `CanvasPanel.tsx` — Canvas view (React Flow, file-aware, opens notes in editor on click)
- `FileTreePanel.tsx` — File tree (simplest, pure React)
- `SearchPanel.tsx` — Search with results list

## Architecture overview

```
┌──────────────────────────────────────────────────┐
│ Icon    │ Content Panel (left)  │ Editor (right)  │
│ Sidebar │                       │                 │
│ [Files] │  ┌─ Files ──────────┐ │  Note editor    │
│ [Graph] │  │  (display:none)  │ │  (always here)  │
│ [Search]│  ├─ Graph ──────────┤ │                 │
│ [Canvas]│  │  (display:none)  │ │                 │
│ [Yours] │  ├─ YOUR PANEL ─────┤ │                 │
│         │  │  (display:flex)  │ │                 │
│ [⚙]    │  └──────────────────┘ │                 │
└──────────────────────────────────────────────────┘
```

All panels stay mounted. Visibility is toggled via `display: none/flex` based on `activeLeftTab`. This preserves component state (scroll position, zoom, etc.) across tab switches.

## Checklist

### 1. Extend the LeftTab type

**File**: `crates/app/src/stores/uiStore.ts`

- [ ] Add your tab name to the `LeftTab` union type:
  ```typescript
  export type LeftTab = "files" | "graph" | "search" | "canvas" | "yours";
  ```
- [ ] Add default panel sizes to `BUILTIN_TAB_SIZES`:
  ```typescript
  yours: { content: 50, editor: 50 },
  ```
  Use `content: 80` for visualization-heavy panels (like Graph), `content: 20` for list-based panels (like Files).
- [ ] Add to `PanelSizes` interface:
  ```typescript
  yours?: TabPanelSizes;
  ```
- [ ] Add to `getDefaultTabSizes`:
  ```typescript
  yours: { content: custom.yours?.content ?? ..., editor: custom.yours?.editor ?? ... },
  ```
- [ ] Add to the `tabs` array in `resetLayoutPrefs` (search for `const tabs: LeftTab[]`)
- [ ] Add `"yours"` to `activeCanvasPath` pattern if your panel needs to track which file is loaded (add your own state field, e.g., `activeYoursPath: string | null`)

### 2. Add an action to open the panel (optional)

If your panel shows specific files or content:

- [ ] Add state field: `activeYoursPath: string | null`
- [ ] Add action: `openYoursInPanel: (path: string) => void`
- [ ] Implementation: `set({ activeYoursPath: path, activeLeftTab: "yours", leftPanelCollapsed: false })`
- [ ] Add to reset function

### 3. Add the sidebar icon

**File**: `crates/app/src/components/Layout/IconSidebar.tsx`

- [ ] Import your icon from `lucide-react`
- [ ] Add entry to `SIDEBAR_ITEMS`:
  ```typescript
  { tab: "yours", icon: YourIcon, label: "Your Panel" },
  ```
  The click behavior (toggle collapse / activate) is handled automatically by the existing `handleClick` function.

### 4. Create the panel component

**File (new)**: `crates/app/src/components/YourPanel/YourPanel.tsx`

Key patterns to follow:

**If your panel shows files** (like Canvas):
```typescript
export function YourPanel() {
  const activePath = useUIStore((s) => s.activeYoursPath);

  return (
    <div className="your-panel">
      <div className="your-panel-header">
        {/* File selector, create button, etc. */}
      </div>
      <div className="your-panel-body">
        {activePath ? (
          <YourContent path={activePath} />
        ) : (
          <div className="your-panel-empty">Open or create a file</div>
        )}
      </div>
    </div>
  );
}
```

**If your panel shows live data** (like Graph):
```typescript
export function YourPanel() {
  const data = useYourStore((s) => s.data);
  return <YourVisualization data={data} />;
}
```

**Important**: If your panel renders a canvas/WebGL component that needs container dimensions:
- Call resize after tab switch (like GraphView's `cy.resize()`)
- Use a delayed resize (100ms) to account for panel animation
- Track first-reveal with a ref to avoid unnecessary fit-to-view on every switch

### 5. Wire into AppLayout

**File**: `crates/app/src/components/Layout/AppLayout.tsx`

- [ ] Import your panel component
- [ ] Add a display-toggled div inside the content panel, alongside the others:
  ```tsx
  <div style={{
    flex: 1,
    overflow: "hidden",
    display: activeLeftTab === "yours" ? "flex" : "none",
    flexDirection: "column",
  }}>
    <YourPanel />
  </div>
  ```
  **Order matters for z-index** — add after the last existing panel div.

### 6. Route file clicks (if applicable)

If your panel opens when users click certain file types:

**File**: `crates/app/src/components/Layout/FileTreePanel.tsx`

- [ ] In `handleClick`, add extension detection:
  ```typescript
  if (path.endsWith(".yourext")) {
    useUIStore.getState().openYoursInPanel(path);
    return;
  }
  ```

### 7. Handle click-to-open in editor

If your panel contains clickable items that should open in the editor (right side):

- [ ] Import `useEditorStore`, `useGraphStore`, `useTabStore` as needed
- [ ] On click: call the appropriate editor action:
  ```typescript
  // For BrainMap notes:
  useGraphStore.getState().selectNode(path);
  useEditorStore.getState().openNote(path);

  // For plain files:
  useEditorStore.getState().openPlainFile(path);

  // For PDFs:
  useTabStore.getState().openTab(path, "pdf", fileName, null);
  useEditorStore.getState().clearForCustomTab();
  ```
- [ ] The panel stays visible on the left — the editor updates on the right

### 8. Add to Settings panel sizes

**File**: `crates/app/src/components/Settings/SettingsModal.tsx`

- [ ] Add your tab to the panel layout section (search for `as LeftTab[]`):
  ```typescript
  {(["files", "graph", "search", "canvas", "yours"] as LeftTab[]).map((tab) => (
  ```

### 9. Add CSS

**File**: `crates/app/src/App.css`

- [ ] Panel container:
  ```css
  .your-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
  ```
- [ ] Header bar (if applicable):
  ```css
  .your-panel-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
  }
  ```
- [ ] Body (flex: 1 to fill remaining space):
  ```css
  .your-panel-body {
    flex: 1;
    min-height: 0;
    position: relative;
  }
  ```

### 10. Write tests

- [ ] `activeLeftTab` accepts your tab name
- [ ] Panel sizes default correctly for your tab
- [ ] Open action sets both path and active tab
- [ ] File click routing activates your panel

### 11. Update documentation

- [ ] Add entry to `docs/CHANGELOG.md`
- [ ] Add to the panel table below

## Panel tabs in BrainMap

| Tab | Component | Purpose | Default split |
|-----|-----------|---------|---------------|
| `"files"` | FileTreePanel | File tree browser | 20/80 |
| `"graph"` | GraphView | Force-directed graph | 80/20 |
| `"search"` | SearchPanel | Full-text search | 20/80 |
| `"canvas"` | CanvasPanel | Spatial note arrangement | 60/40 |

## Key differences from file-type editors

| Concern | Panel tab | File-type editor |
|---------|-----------|-----------------|
| Location | Left panel | Right panel (editor area) |
| Lifecycle | Always mounted, display toggled | Mount on tab open, unmount on close |
| State | uiStore (global) | tabStore (per-tab) |
| Coexists with editor | Yes — side by side | No — replaces the editor |
| Click to open note | Opens in editor panel (right) | Navigates away |
| Panel sizing | Configurable per-tab in Settings | N/A |
| Save behavior | Panel manages its own save | tabStore dirty tracking |

## Common pitfalls

1. **Don't unmount on tab switch.** Use `display: none/flex` toggling. Unmounting loses component state (zoom, scroll, selections).

2. **Resize after reveal.** If your panel uses a library that measures container dimensions (Cytoscape, React Flow, canvas), call its resize method after the panel becomes visible. Use `setTimeout(resize, 100)` to account for panel animation.

3. **Don't use editorStore for panel state.** EditorStore is for the CodeMirror editor. Your panel should use uiStore or its own Zustand store.

4. **Panel sizes are per-tab.** Each tab gets its own content/editor split ratio. Users can configure defaults in Settings. Don't hardcode sizes.

5. **The `handleClick` in IconSidebar handles toggle behavior automatically.** If the user clicks an already-active tab, it collapses the panel. Clicking again expands it. You don't need to implement this — just adding to `SIDEBAR_ITEMS` is enough.
