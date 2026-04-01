# 2026-03-10 — Subagent Transcript: general-purpose

**Date:** 2026-03-10 11:22:14
**Agent:** general-purpose
**Agent ID:** ad1fe68c5ea5be303
**Parent Session:** 122b6c40-2be7-4135-a320-7761b83206bc

---

## User

Please review the following code changes for a Graph/Files tab toggle feature in a Tauri + React app. Write your findings to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/graph-files-tab-toggle-review-1.md`.

## Changed Files

### `crates/app/src/components/Layout/AppLayout.tsx`
```tsx
import { useCallback, useEffect } from "react";
import { Panel, Group, Separator, usePanelRef } from "react-resizable-panels";
import type { Layout } from "react-resizable-panels";
import { useUIStore } from "../../stores/uiStore";
import { GraphView } from "../GraphView/GraphView";
import { EditorPanel } from "../Editor/EditorPanel";
import { SearchPanel } from "../Search/SearchPanel";
import { StatusBar } from "../StatusBar/StatusBar";
import { FileTreePanel } from "./FileTreePanel";
import { InspectorPanel } from "../Inspector/InspectorPanel";

const PANEL_IDS = {
  graph: "graph",
  right: "right",
  editor: "editor",
  inspector: "inspector",
  search: "search",
} as const;

export function AppLayout() {
  const graphPanelRef = usePanelRef();
  const focusMode = useUIStore((s) => s.focusMode);
  const treeOpen = useUIStore((s) => s.treeOpen);
  const toggleTree = useUIStore((s) => s.toggleTree);
  const savePanelSizes = useUIStore((s) => s.savePanelSizes);
  const panelSizes = useUIStore((s) => s.panelSizes);

  // Sync focusMode → panel collapse/expand
  useEffect(() => {
    if (focusMode) {
      graphPanelRef.current?.collapse();
    } else {
      graphPanelRef.current?.expand();
    }
  }, [focusMode, graphPanelRef]);

  const handleOuterLayout = useCallback(
    (layout: Layout) => {
      savePanelSizes({ graph: layout[PANEL_IDS.graph], right: layout[PANEL_IDS.right] });
    },
    [savePanelSizes]
  );

  const handleRightLayout = useCallback(
    (layout: Layout) => {
      savePanelSizes({
        editor: layout[PANEL_IDS.editor],
        inspector: layout[PANEL_IDS.inspector],
        search: layout[PANEL_IDS.search],
      });
    },
    [savePanelSizes]
  );

  return (
    <>
      <Group
        orientation="horizontal"
        className="app-layout"
        onLayoutChanged={handleOuterLayout}
      >
        <Panel
          panelRef={graphPanelRef}
          defaultSize={`${panelSizes.graph ?? 60}%`}
          minSize="10%"
          collapsible
          id={PANEL_IDS.graph}
        >
          <div className="panel" style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div className="left-panel-tabs">
              <button
                className={`left-panel-tab ${!treeOpen ? "active" : ""}`}
                onClick={() => treeOpen && toggleTree()}
              >
                Graph
              </button>
              <button
                className={`left-panel-tab ${treeOpen ? "active" : ""}`}
                onClick={() => !treeOpen && toggleTree()}
              >
                Files
              </button>
            </div>
            <div className="panel-content" style={{ flex: 1, overflow: "hidden" }}>
              {treeOpen ? <FileTreePanel /> : <GraphView />}
            </div>
          </div>
        </Panel>
        <Separator className="resize-handle-h" />
        <Panel defaultSize={`${panelSizes.right ?? 40}%`} minSize="10%" id={PANEL_IDS.right}>
          <Group
            orientation="vertical"
            onLayoutChanged={handleRightLayout}
          >
            <Panel defaultSize={`${panelSizes.editor ?? 60}%`} minSize="15%" id={PANEL_IDS.editor}>
              <div className="panel" style={{ height: "100%" }}>
                <div className="panel-content">
                  <EditorPanel />
                </div>
              </div>
            </Panel>
            <Separator className="resize-handle-v" />
            <Panel defaultSize={`${panelSizes.inspector ?? 20}%`} minSize="8%" collapsible id={PANEL_IDS.inspector}>
              <div className="panel" style={{ height: "100%" }}>
                <div className="panel-header">Inspector</div>
                <div className="panel-content">
                  <InspectorPanel />
                </div>
              </div>
            </Panel>
            <Separator className="resize-handle-v" />
            <Panel defaultSize={`${panelSizes.search ?? 20}%`} minSize="8%" id={PANEL_IDS.search}>
              <div className="panel" style={{ height: "100%" }}>
                <div className="panel-header">Search</div>
                <div className="panel-content">
                  <SearchPanel />
                </div>
              </div>
            </Panel>
          </Group>
        </Panel>
      </Group>
      <StatusBar />
    </>
  );
}
```

### CSS changes in `crates/app/src/App.css`

Added before `.file-tree-panel`:
```css
/* ── Left Panel Tabs ──────────────────────────────────────────── */
.left-panel-tabs {
  display: flex;
  flex-shrink: 0;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}
.left-panel-tab {
  flex: 1;
  padding: 7px 0;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  border-bottom: 2px solid transparent;
  transition: color 0.15s;
}
.left-panel-tab:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}
.left-panel-tab.active {
  color: var(--text-primary);
  border-bottom: 2px solid var(--accent);
}
```

`.file-tree-panel` — removed `border-right: 1px solid var(--border-color);`

## Review Criteria

Please review according to the following criteria (from the project's code-reviewer agent):

1. **Correctness** — Does the code do what it's supposed to? Are there logic bugs?
2. **React quality** — Proper hook usage, no unnecessary re-renders, correct conditional rendering
3. **CSS quality** — No specificity issues, correct use of CSS variables, consistent with existing patterns
4. **Accessibility** — Tab buttons should be keyboard-navigable; are there any a11y issues?
5. **Edge cases** — What happens if the panel is collapsed (focus mode)? Does the tab bar still render?
6. **Test coverage** — Are there existing tests that need updating?

For each finding, rate it as: `blocker`, `should-fix`, `suggestion`, or `info`.

Write findings to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/graph-files-tab-toggle-review-1.md`.

---

## Assistant

I'll review the code changes for the Graph/Files tab toggle feature and write my findings to the specified file.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ 2>/dev/null || mkdir -p /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/","description":"Ensure review`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/**/*.{tsx,ts}"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

Now I have enough context to write a thorough review. Let me also check the existing AppLayout for keyboard shortcuts handling:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

Now I have everything I need to write the review. Let me compose it:

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/graph-files-tab-toggle-review-1.md","content":"# Code Review: Graph/Files Tab Toggle Feature\n\n**Reviewed files:**\n- `c`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/graph-files-tab-toggle-review-1.md`.

Here is the summary of findings:

**Should-fix (3 findings):**

1. **Accessibility — missing ARIA tab semantics.** The two buttons have no `role="tablist"`, `role="tab"`, or `aria-selected`. Screen readers cannot identify this as a tab group. The `tabpanel` regions also need `role="tabpanel"` with `aria-labelledby`. Using the `hidden` attribute on the inactive panel (rather than conditional rendering) is also more correct for the ARIA tab pattern.

2. **GraphView torn down on every tab switch.** The conditional `{treeOpen ? <FileTreePanel /> : <GraphView />}` unmounts and remounts `GraphView` each time the user switches tabs. Because `GraphView` initialises a Cytoscape instance on mount, every switch destroys the graph (`cy.destroy()`), discards zoom/pan state, and forces a full layout re-run. The fix is to keep both panels mounted and toggle visibility with `display: none` / `display: flex` via CSS so Cytoscape's DOM node persists.

3. **`Cmd+B` shortcut does not expand a collapsed panel before toggling.** The shortcut calls `toggleTree()` but does not call `graphPanelRef.current?.expand()` if the left panel is collapsed. When collapsed, pressing `Cmd+B` changes `treeOpen` state with no visible effect, making the shortcut appear broken.

**Suggestions (2 findings):** verbose onClick guards (minor style nit); active tab background not explicitly specified in CSS.

**Info (3 findings):** CSS border removal is correct and conflict-free; tab bar in collapsed panel is safe; no React component tests exist (pre-existing gap).

---

