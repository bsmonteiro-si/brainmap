# 2026-03-09 — Subagent Transcript: general-purpose

**Date:** 2026-03-09 20:55:42
**Agent:** general-purpose
**Agent ID:** a1cec9c8353b1f78b
**Parent Session:** 770f36ad-1b55-40de-9e70-05a65557ae00

---

## User


You are performing a code review for the BrainMap desktop app UX improvements. This is pass 3 — two fixes were just applied:

1. **GraphView.tsx**: Removed the unnecessary every-render `useEffect` that re-assigned stable Zustand action refs (`selectNodeRef`, `expandNodeRef`). These refs are now initialised once at mount and never updated, which is correct because Zustand action functions have stable references.

2. **AppLayout.tsx**: Fixed the `treeOpen` toggle that was previously remounting `GraphView` by switching between two different JSX tree structures. Now GraphView is rendered unconditionally in a single stable structure, and the FileTreePanel is conditionally rendered alongside it using a simple flex layout.

## Review Criteria

You are reviewing TypeScript/React code for BrainMap. Find real defects, not style nits.

### What to Review

1. **Correctness**: Logic bugs? Missed conditions? State management issues?
2. **React Quality**: Correct hook usage? Stale closures? Missing deps? Memory leaks? Unnecessary re-renders?
3. **Function Design**: Is each function doing one thing? Are names descriptive?
4. **Performance**: Unnecessary re-renders, unnecessary effect dependencies, O(n²) operations on large graphs?
5. **UX Correctness**: Do the UI interactions work correctly? Edge cases in the graph/tree/editor interactions?

### Output Format

Write your review as a list of findings. For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

If a file has no issues, skip it. If the code is solid, say so briefly.

Do NOT report:
- Missing comments or docstrings
- Style preferences that don't affect correctness
- TODOs or future improvements unless they mask a current bug

## Files to Review

### GraphView.tsx (full file)
```tsx
import { useRef, useEffect } from "react";
import cytoscape, { type Core } from "cytoscape";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — cytoscape-fcose ships its own types but may not resolve in all configs
import fcose from "cytoscape-fcose";
import dagre from "cytoscape-dagre";
import { useGraphStore } from "../../stores/graphStore";
import { useEditorStore } from "../../stores/editorStore";
import { useUIStore } from "../../stores/uiStore";
import { graphStylesheet, getNodeColor } from "./graphStyles";
import { GraphToolbar } from "./GraphToolbar";

cytoscape.use(fcose);
cytoscape.use(dagre);

const DIRECTIONAL_RELS = new Set([
  "precedes",
  "leads-to",
  "causes",
  "extends",
  "depends-on",
  "evolved-from",
  "part-of",
  "contains",
]);

function applyEdgeLabelVisibility(cy: Core, show: boolean, selectedPath: string | null) {
  if (show) {
    cy.edges().addClass("labeled");
  } else {
    cy.edges().removeClass("labeled");
  }
  if (selectedPath) {
    cy.getElementById(selectedPath).connectedEdges().addClass("labeled");
  }
}

function runLayout(cy: Core, layout: "force" | "hierarchical") {
  if (layout === "hierarchical") {
    cy.elements()
      .filter((el) => el.isNode() || DIRECTIONAL_RELS.has(el.data("label") as string))
      .layout({
        name: "dagre",
        rankDir: "LR",
        nodeSep: 60,
        rankSep: 120,
        animate: false,
        fit: true,
        padding: 40,
      } as cytoscape.LayoutOptions)
      .run();
  } else {
    cy.layout({
      name: "fcose",
      animate: false,
      quality: "proof",
      idealEdgeLength: 120,
      nodeRepulsion: 8000,
      gravity: 0.25,
      fit: true,
      padding: 40,
      nodeDimensionsIncludeLabels: true,
    } as cytoscape.LayoutOptions).run();
  }
}

export function GraphView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const { nodes, edges, selectedNodePath, isLoading } = useGraphStore();
  const showEdgeLabels = useUIStore((s) => s.showEdgeLabels);
  const graphLayout = useUIStore((s) => s.graphLayout);
  const showEdgeLabelsRef = useRef(showEdgeLabels);
  const graphLayoutRef = useRef(graphLayout);
  const selectedNodePathRef = useRef(selectedNodePath);
  // Zustand action functions are stable references; initialise once and never update
  const selectNodeRef = useRef(useGraphStore.getState().selectNode);
  const expandNodeRef = useRef(useGraphStore.getState().expandNode);

  // Sync showEdgeLabels → cy classes
  useEffect(() => {
    showEdgeLabelsRef.current = showEdgeLabels;
    const cy = cyRef.current;
    if (cy) applyEdgeLabelVisibility(cy, showEdgeLabels, selectedNodePathRef.current);
  }, [showEdgeLabels]);

  // Re-run layout when graphLayout changes
  useEffect(() => {
    graphLayoutRef.current = graphLayout;
    const cy = cyRef.current;
    if (cy && cy.nodes().length > 0) {
      runLayout(cy, graphLayout);
    }
  }, [graphLayout]);

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      style: graphStylesheet,
      layout: { name: "preset" },
      minZoom: 0.1,
      maxZoom: 5,
      wheelSensitivity: 0.3,
    });

    cyRef.current = cy;

    cy.on("tap", "node", (evt) => {
      const nodePath = evt.target.id();
      selectNodeRef.current(nodePath);
      useEditorStore.getState().openNote(nodePath);
    });

    cy.on("dbltap", "node", (evt) => {
      const nodePath = evt.target.id();
      expandNodeRef.current(nodePath);
    });

    cy.on("tap", (evt) => {
      if (evt.target === cy) {
        selectNodeRef.current(null);
      }
    });

    cy.on("zoom", () => {
      const autoShow = cy.zoom() >= 0.8;
      applyEdgeLabelVisibility(
        cy,
        showEdgeLabelsRef.current || autoShow,
        selectedNodePathRef.current
      );
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, []);

  // Sync graph data to Cytoscape
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const cyNodes = Array.from(nodes.values()).map((n) => ({
      data: {
        id: n.path,
        label: n.title,
        color: getNodeColor(n.note_type),
        noteType: n.note_type,
      },
    }));

    const cyEdges = edges.map((e) => ({
      data: {
        id: `${e.source}|${e.target}|${e.rel}`,
        source: e.source,
        target: e.target,
        label: e.rel,
        kind: e.kind,
      },
    }));

    const nodeIds = new Set(cyNodes.map((n) => n.data.id));
    const validEdges = cyEdges.filter(
      (e) => nodeIds.has(e.data.source) && nodeIds.has(e.data.target)
    );

    cy.elements().remove();
    cy.add([...cyNodes, ...validEdges]);

    if (cyNodes.length > 0) {
      runLayout(cy, graphLayoutRef.current);
      applyEdgeLabelVisibility(cy, showEdgeLabelsRef.current, selectedNodePathRef.current);
    }
  }, [nodes, edges]);

  // Highlight selected node
  useEffect(() => {
    // Keep ref in sync inside the effect that depends on selectedNodePath
    selectedNodePathRef.current = selectedNodePath;

    const cy = cyRef.current;
    if (!cy) return;

    cy.elements().removeClass("highlighted");
    cy.$("node:selected").unselect();

    if (selectedNodePath) {
      const node = cy.getElementById(selectedNodePath);
      if (node.length > 0) {
        node.select();
        node.connectedEdges().addClass("highlighted");
        node.neighborhood("node").addClass("highlighted");
      }
    }

    // Reapply label visibility to clear accumulated labeled classes from prior selection
    applyEdgeLabelVisibility(cy, showEdgeLabelsRef.current, selectedNodePath);
  }, [selectedNodePath]);

  const showOverlay = isLoading || nodes.size === 0;
  const overlayText = isLoading
    ? "Loading graph..."
    : "No nodes to display. Create your first note.";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      <GraphToolbar />
      {showOverlay && (
        <div
          style={{
            position: "absolute",
            inset: "36px 0 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            zIndex: 1,
            background: "var(--bg-primary)",
          }}
        >
          {overlayText}
        </div>
      )}
      <div ref={containerRef} className="graph-container" />
    </div>
  );
}
```

### AppLayout.tsx (full file)
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

export function AppLayout() {
  const graphPanelRef = usePanelRef();
  const focusMode = useUIStore((s) => s.focusMode);
  const treeOpen = useUIStore((s) => s.treeOpen);
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
      savePanelSizes({ graph: layout["graph"], right: layout["right"] });
    },
    [savePanelSizes]
  );

  const handleRightLayout = useCallback(
    (layout: Layout) => {
      savePanelSizes({ editor: layout["editor"], search: layout["search"] });
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
          id="graph"
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              height: "100%",
              overflow: "hidden",
            }}
          >
            {treeOpen && (
              <div style={{ width: "220px", flexShrink: 0, overflow: "hidden" }}>
                <FileTreePanel />
              </div>
            )}
            <div className="panel" style={{ flex: 1, height: "100%", overflow: "hidden" }}>
              <div className="panel-header">Graph</div>
              <div className="panel-content">
                <GraphView />
              </div>
            </div>
          </div>
        </Panel>
        <Separator className="resize-handle-h" />
        <Panel defaultSize={`${panelSizes.right ?? 40}%`} minSize="10%" id="right">
          <Group
            orientation="vertical"
            onLayoutChanged={handleRightLayout}
          >
            <Panel defaultSize={`${panelSizes.editor ?? 70}%`} minSize="15%" id="editor">
              <div className="panel" style={{ height: "100%" }}>
                <div className="panel-content">
                  <EditorPanel />
                </div>
              </div>
            </Panel>
            <Separator className="resize-handle-v" />
            <Panel defaultSize={`${panelSizes.search ?? 30}%`} minSize="10%" id="search">
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

Please write your review to the file `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ux-improvements-review-1-pass-3.md`.

---

## Assistant

I'll review the two files and write my findings to the specified path.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ 2>/dev/null || echo \"directory does not exist\"","description":"Check if reviews directory exists"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ux-improvements-review-1-pass-2.md"}`

---

## Assistant

Now I have the full context. Let me analyze the two files for pass 3, focusing on whether the two specific fixes were applied correctly and if any new or remaining issues exist.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ux-improvements-review-1-pass-3.md","content":"# UX Improvements Code Review — Pass 3\n\nThird-pass review after the foll`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ux-improvements-review-1-pass-3.md`.

**Summary of pass 3 findings:**

**Both applied fixes are correct.**

- The stable Zustand action ref initialisation (removing the every-render `useEffect`) is sound — Zustand action functions have stable references so this is safe.
- The unconditional `GraphView` render in the flex layout correctly prevents the Cytoscape instance from being destroyed on tree toggle.

**Remaining/new findings:**

1. **AppLayout.tsx — Panel ID strings fragile** (should-fix): `handleOuterLayout` and `handleRightLayout` index `layout["graph"]`, `layout["right"]`, etc. with string literals that are not tied to the `Panel id=` props. If any panel ID is renamed, the callback silently gets `undefined`, which gets stored and causes `NaN%` sizes on next mount. Fix: share IDs as named constants.

2. **AppLayout.tsx — Fixed 220px tree width** (should-fix): `FileTreePanel` has `width: "220px"` with `flexShrink: 0`. When the graph panel is dragged below ~220px, the tree panel can occlude or eliminate the `GraphView` flex container. The `minSize="10%"` on the outer panel does not account for this fixed width. Fix: either set a larger `minSize` on the graph panel or make the tree width proportional.

3. **GraphView.tsx — `selectedNodePathRef` stale window** (suggestion, downgraded from pass-2 bug): With the ref now updated at the top of the `[selectedNodePath]` effect, the stale window is as small as React allows. Self-correcting on next render. Not a blocker.

4. **GraphView.tsx — "No nodes" overlay flash** (suggestion): If `isLoading` is not set to `true` before the first tick, the empty-state message may briefly appear on workspace load.

---

