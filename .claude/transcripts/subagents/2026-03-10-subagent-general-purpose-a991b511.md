# 2026-03-10 — Subagent Transcript: general-purpose

**Date:** 2026-03-10 11:09:19
**Agent:** general-purpose
**Agent ID:** a991b5116b6dc098c
**Parent Session:** fcf2d61a-7ebc-44b6-8afd-41ff4f046647

---

## User

You are a code reviewer for BrainMap, a knowledge graph tool. Review the following changed TypeScript/React files for a frontend-only feature implementation. Write your findings to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/additional-opportunities-review-1.md`.

## Review Criteria (from code-reviewer.md)

Note: The project is primarily Rust but these are TypeScript/React files. Apply the spirit of the review criteria to TypeScript:

### 1. Correctness
- Are there logic bugs? Missed conditions?
- Are React hooks used correctly (deps arrays, closures over stale state)?
- Is state consistent (e.g. tooltip cleared on unmount)?

### 2. Component/Hook Design
- Are hooks called at the top level (not conditionally)?
- Are side effects properly cleaned up?
- Is state lifted to the right level?

### 3. Function Design
- Is each component doing one thing?
- Are names descriptive?

### 4. Performance
- Are there unnecessary re-renders?
- Are event listeners properly cleaned up?

## Output Format

Write findings as a list. For each:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

If no issues, say so. Do NOT report style preferences, missing comments, or cosmetic issues.

---

## Changed Files

### 1. `crates/app/src/stores/uiStore.ts`
Added `inspector?: number` to `PanelSizes`, added `showLegend: boolean` + `toggleLegend` action to `UIState`.

### 2. `crates/app/src/components/Layout/AppLayout.tsx`
Added `InspectorPanel` as 3rd panel in right column between Editor and Search. Added `inspector` to `PANEL_IDS` and `handleRightLayout`. Default sizes shifted from 70/30 to 60/20/20.

### 3. `crates/app/src/components/GraphView/GraphView.tsx`
Full file contents:

```tsx
import { useRef, useEffect, useState } from "react";
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
import { GraphLegend } from "./GraphLegend";

cytoscape.use(fcose);
cytoscape.use(dagre);

const DIRECTIONAL_RELS = new Set([...]);

function applyEdgeLabelVisibility(cy: Core, show: boolean, selectedPath: string | null) { ... }
function runLayout(cy: Core, layout: "force" | "hierarchical") { ... }

export function GraphView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const { nodes, edges, selectedNodePath, isLoading } = useGraphStore();
  const showEdgeLabels = useUIStore((s) => s.showEdgeLabels);
  const showLegend = useUIStore((s) => s.showLegend);
  const graphLayout = useUIStore((s) => s.graphLayout);
  const showEdgeLabelsRef = useRef(showEdgeLabels);
  const graphLayoutRef = useRef(graphLayout);
  const selectedNodePathRef = useRef(selectedNodePath);
  const selectNodeRef = useRef(useGraphStore.getState().selectNode);
  const expandNodeRef = useRef(useGraphStore.getState().expandNode);

  const [tooltip, setTooltip] = useState<{
    x: number; y: number; label: string; noteType: string;
  } | null>(null);

  // Initialize Cytoscape (mount-once effect)
  useEffect(() => {
    if (!containerRef.current) return;
    const cy = cytoscape({ ... });
    cyRef.current = cy;

    cy.on("tap", "node", ...);
    cy.on("dbltap", "node", ...);
    cy.on("tap", ...);
    cy.on("zoom", ...);

    cy.on("mouseover", "node", (evt) => {
      const node = evt.target;
      const pos = node.renderedPosition();
      setTooltip({
        x: pos.x + 12,
        y: pos.y - 8,
        label: node.data("label") as string,
        noteType: node.data("noteType") as string,
      });
    });

    cy.on("mouseout", "node", () => setTooltip(null));

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, []);

  // Sync graph data to Cytoscape
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    // ... build cyNodes, validEdges ...
    cy.elements().remove();
    cy.add([...cyNodes, ...validEdges]);

    // Apply in-degree-based node sizes before layout
    cy.nodes().forEach((n) => {
      const size = Math.max(20, 20 + n.indegree(false) * 4);
      n.style({ width: size, height: size });
    });

    if (cyNodes.length > 0) {
      runLayout(cy, graphLayoutRef.current);
      applyEdgeLabelVisibility(cy, showEdgeLabelsRef.current, selectedNodePathRef.current);
    }
  }, [nodes, edges]);

  // JSX
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      <GraphToolbar />
      {showOverlay && <div ...>{overlayText}</div>}
      <div ref={containerRef} className="graph-container" />
      {showLegend && <GraphLegend />}
      {tooltip && (
        <div className="graph-node-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          <span className="tooltip-title">{tooltip.label}</span>
          <span className="tooltip-type">{tooltip.noteType}</span>
        </div>
      )}
    </div>
  );
}
```

### 4. `crates/app/src/components/GraphView/GraphToolbar.tsx`
Added `showLegend`/`toggleLegend` from uiStore. Added a "Legend" button alongside the "Labels" button.

### 5. `crates/app/src/components/GraphView/GraphLegend.tsx` (new file)
```tsx
import { NOTE_TYPE_COLORS } from "./graphStyles";

export function GraphLegend() {
  return (
    <div className="graph-legend">
      {Object.entries(NOTE_TYPE_COLORS).map(([type, color]) => (
        <div key={type} className="legend-item">
          <span className="legend-swatch" style={{ background: color }} />
          <span className="legend-label">{type}</span>
        </div>
      ))}
    </div>
  );
}
```

### 6. `crates/app/src/App.css`
Added `.graph-legend`, `.legend-item`, `.legend-swatch`, `.legend-label`, `.graph-node-tooltip`, `.tooltip-title`, `.tooltip-type` styles. All positioned absolutely within the graph container.

---

Please write your review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/additional-opportunities-review-1.md`.

---

## Assistant

I'll review the changed TypeScript/React files and write findings to the specified path.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ 2>/dev/null || echo \"Directory does not exist\"","description":"Check if reviews/code directory exists"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/**/*.{ts,tsx,css}"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphToolbar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphLegend.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Inspector/InspectorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1,"limit":50}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"graph-legend|graph-node-tooltip|inspector-panel|legend-item|legend-swatch","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":640,"limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts"}`

---

## Assistant

Now I have a thorough understanding of all the changed files. Let me write the review.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"mkdir -p /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code","description":"Ensure reviews/code directory exists"}`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/additional-opportunities-review-1.md","content":"# Code Review: Additional Opportunities (Legend, Tooltip, InspectorPanel`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/additional-opportunities-review-1.md`.

Here is a summary of findings:

**Bug (1)**

- `GraphView.tsx` lines 146–157: Tooltip state is never cleared on Cytoscape teardown. If the component unmounts while a node is hovered, `mouseout` will not fire after `cy.destroy()`, leaving a stale tooltip visible on remount. Fix: add `setTooltip(null)` to the cleanup function.

**Should-fix (3)**

- `AppLayout.tsx` lines 37–52: Both `handleOuterLayout` and `handleRightLayout` index the `Layout` array (which is `number[]`) using `PANEL_IDS` string values like `"graph"`, `"editor"`, etc. This always yields `undefined`, so `savePanelSizes` writes nothing useful and panel sizes are never persisted. Fix: use positional indices (`layout[0]`, `layout[1]`, `layout[2]`).
- `InspectorPanel.tsx` lines 69–101: Outgoing and incoming link items are keyed by array index (`key={i}`). Use a stable composite key like `source|target|rel` to avoid mis-reconciliation when the edges array changes.
- `GraphToolbar.tsx` lines 38–48: The type-filter `<select>` is uncontrolled, its `onChange` only calls `console.log`, and the selection has no effect on the graph. Either wire it to state or remove it; at minimum remove the `console.log`.

**Suggestion (2)**

- `GraphLegend.tsx`: Renders all 10 note types unconditionally; could filter to only types present in the workspace.
- `InspectorPanel.tsx` line 11: Guards on both `selectedNodePath` and `activeNote` together, hiding the transitional state where a node is selected but its note hasn't loaded yet.

---

