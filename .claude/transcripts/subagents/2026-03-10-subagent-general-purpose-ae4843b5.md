# 2026-03-10 — Subagent Transcript: general-purpose

**Date:** 2026-03-10 11:25:08
**Agent:** general-purpose
**Agent ID:** ae4843b5eb0cee354
**Parent Session:** 122b6c40-2be7-4135-a320-7761b83206bc

---

## User

Please do a second-pass code review of the Graph/Files tab toggle feature. The first review identified 3 should-fix issues (ARIA semantics, GraphView remount on tab switch, Cmd+B not expanding collapsed panel). All three have been fixed. Write your findings to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/graph-files-tab-toggle-review-1-pass-2.md`.

## Updated `AppLayout.tsx`

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

  // Expand left panel when tab is toggled (Cmd+B or tab click) so the
  // shortcut is not a no-op when the panel happens to be collapsed
  useEffect(() => {
    if (!focusMode) {
      graphPanelRef.current?.expand();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeOpen]);

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
            <div role="tablist" aria-label="Left panel view" className="left-panel-tabs">
              <button
                role="tab"
                aria-selected={!treeOpen}
                aria-controls="left-graph-panel"
                id="left-graph-tab"
                className={`left-panel-tab ${!treeOpen ? "active" : ""}`}
                onClick={() => treeOpen && toggleTree()}
              >
                Graph
              </button>
              <button
                role="tab"
                aria-selected={treeOpen}
                aria-controls="left-files-panel"
                id="left-files-tab"
                className={`left-panel-tab ${treeOpen ? "active" : ""}`}
                onClick={() => !treeOpen && toggleTree()}
              >
                Files
              </button>
            </div>
            <div
              role="tabpanel"
              id="left-graph-panel"
              aria-labelledby="left-graph-tab"
              style={{ flex: 1, overflow: "hidden", display: treeOpen ? "none" : "flex", flexDirection: "column" }}
            >
              <GraphView />
            </div>
            <div
              role="tabpanel"
              id="left-files-panel"
              aria-labelledby="left-files-tab"
              style={{ flex: 1, overflow: "hidden", display: treeOpen ? "flex" : "none", flexDirection: "column" }}
            >
              <FileTreePanel />
            </div>
          </div>
        </Panel>
        <Separator className="resize-handle-h" />
        <Panel defaultSize={`${panelSizes.right ?? 40}%`} minSize="10%" id={PANEL_IDS.right}>
          <Group orientation="vertical" onLayoutChanged={handleRightLayout}>
            <Panel defaultSize={`${panelSizes.editor ?? 60}%`} minSize="15%" id={PANEL_IDS.editor}>
              <div className="panel" style={{ height: "100%" }}>
                <div className="panel-content"><EditorPanel /></div>
              </div>
            </Panel>
            <Separator className="resize-handle-v" />
            <Panel defaultSize={`${panelSizes.inspector ?? 20}%`} minSize="8%" collapsible id={PANEL_IDS.inspector}>
              <div className="panel" style={{ height: "100%" }}>
                <div className="panel-header">Inspector</div>
                <div className="panel-content"><InspectorPanel /></div>
              </div>
            </Panel>
            <Separator className="resize-handle-v" />
            <Panel defaultSize={`${panelSizes.search ?? 20}%`} minSize="8%" id={PANEL_IDS.search}>
              <div className="panel" style={{ height: "100%" }}>
                <div className="panel-header">Search</div>
                <div className="panel-content"><SearchPanel /></div>
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

## Review Criteria

For each finding, rate severity: `bug`, `should-fix`, `suggestion`, or `info`.

Check specifically:
1. Are the first-pass should-fix issues correctly resolved?
2. Did the fixes introduce any new bugs (e.g., the treeOpen useEffect — does reading `focusMode` inside the callback without including it in deps cause a stale closure issue)?
3. Is the dual-tabpanel layout (both rendered, CSS display toggle) correct for the GraphView's Cytoscape size calculations?
4. Any remaining accessibility, correctness, or React quality issues?

Write results to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/graph-files-tab-toggle-review-1-pass-2.md`.

---

## Assistant

I'll review the updated `AppLayout.tsx` code carefully against the criteria provided.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/","description":"List existing review files"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/graph-files-tab-toggle-review-1.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

Now I have everything I need to write a thorough second-pass review. Let me analyze the updated code carefully before writing the review.

Key observations from the updated `AppLayout.tsx`:

1. **ARIA fix (Finding #1):** `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `id` attributes are all present. The tabpanels have `role="tabpanel"` and `aria-labelledby`. Using CSS `display` toggle rather than the `hidden` attribute (which the first review suggested but noted as one option).

2. **GraphView remount fix (Finding #2):** Both panels are now always mounted; CSS `display: none / flex` toggles visibility. Cytoscape DOM persists.

3. **Cmd+B fix (Finding #3):** A second `useEffect` watches `treeOpen` and calls `graphPanelRef.current?.expand()` when `!focusMode`. But there's a potential stale closure issue — `focusMode` is read inside the effect but is not in the deps array (suppressed with an eslint-disable comment).

4. **`display: none` and Cytoscape size calculations:** When `GraphView` is hidden via `display: none`, Cytoscape's container has zero dimensions. If data loads while the graph panel is hidden (e.g., user starts on Files tab), the layout runs against a zero-size container.

5. **`handleOuterLayout` uses `layout[PANEL_IDS.graph]` where `PANEL_IDS.graph = "graph"` (a string key):** `Layout` from react-resizable-panels is likely a `number[]`, so indexing by string `"graph"` would return `undefined`. This is a pre-existing bug, not introduced by this change, but worth confirming.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/react-resizable-panels/**/*.d.ts","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"type Layout","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/react-resizable-panels/dist/react-resizable-panels.d.ts","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/react-resizable-panels/dist/react-resizable-panels.d.ts","offset":148,"limit":20}`

---

## Assistant

Good — `Layout` is `{ [id: string]: number }`, so indexing with `PANEL_IDS.graph` (the string `"graph"`) is correct. That's not a bug.

Now I have enough information to write the comprehensive second-pass review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/graph-files-tab-toggle-review-1-pass-2.md","content":"# Code Review: Graph/Files Tab Toggle — Pass 2\n\n**Reviewed file:*`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/graph-files-tab-toggle-review-1-pass-2.md`.

**Summary of findings:**

All three pass-1 should-fix issues are resolved, but the fixes introduced two new should-fix issues:

**Finding A — should-fix: Cytoscape zero-size when graph panel initially hidden**
When `treeOpen` is `true` at app startup, `GraphView` renders with `display: none`. Cytoscape initialises against a zero-size container. When the user switches to the Graph tab, the canvas retains its zero dimensions — nodes appear clumped or invisible until the user interacts. Fix: in `GraphView`, subscribe to `treeOpen` from `useUIStore` and call `cyRef.current?.resize()` (plus optionally `cy.fit()`) when the graph tab becomes active (`!treeOpen`).

**Finding B — should-fix: Stale closure on `focusMode` in the `treeOpen` effect**
The new `useEffect` reads `focusMode` from the outer component scope but only lists `[treeOpen]` in its deps (the eslint-disable comment suppresses the warning). If `focusMode` becomes `true` without `treeOpen` changing, the captured value is stale and the guard `if (!focusMode)` can erroneously expand the panel while focus mode is active. Fix: either add `focusMode` to the deps array (idiomatic, harmless side-effect of re-running on focus-mode changes), or read it via `useUIStore.getState().focusMode` inside the effect to bypass the closure entirely.

One additional suggestion (non-blocking): the ARIA tab pattern recommends moving keyboard focus to the revealed tabpanel after a tab activation. The implementation correctly sets ARIA attributes but does not call `.focus()` on the panel — this only affects keyboard-only users.

---

