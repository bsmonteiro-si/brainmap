# 2026-03-10 — Subagent Transcript: general-purpose

**Date:** 2026-03-10 11:54:16
**Agent:** general-purpose
**Agent ID:** a18ceb92f9656c522
**Parent Session:** 72b750a5-bf77-4d9c-9323-707b5b14b58d

---

## User

You are reviewing a TypeScript/React frontend implementation for BrainMap, a knowledge graph tool. Review the changed files below using the criteria from the code-reviewer agent definition.

## Code Reviewer Agent Definition

You are reviewing Rust code for BrainMap, a knowledge graph tool. Your job is to find real defects, not style nits.

### Project Context

- Rust workspace: `crates/core` (library), `crates/cli` (CLI), `crates/tauri-plugin` (desktop)
- Core library owns all data operations; interfaces are thin wrappers
- Error handling: `thiserror` with `BrainMapError` enum, propagated via `Result<T>`
- Serialization: `serde` for all public types (JSON output is primary, AI-first)
- Tests: behavior-based (check end state), Given/When/Then structure
- No unnecessary comments — code should be self-documenting through naming and small functions

### What to Review

1. **Correctness** - Logic bugs, off-by-one errors, missed conditions
2. **Quality** - Unnecessary clones? Ownership issues? Naming?
3. **Function Design** - Single responsibility? Functions too long?
4. **Edge Cases** - What happens when edges=[] and hiddenEdgeTypes has entries? When edgeTypes has fewer entries than hiddenEdgeTypes (e.g., if filters were set in a previous workspace)?
5. **React Patterns** - Are dependencies correct? Stale closures? Memory leaks?
6. **UX** - Badge math: `edgeTypes.length - hiddenEdgeTypes.size` — can this go negative if hiddenEdgeTypes has stale entries from a previous workspace with more edge types?

### Output Format

Write your review as a list of findings. For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

If no issues, say so briefly. Do NOT report style preferences.

---

## Changed Files

### crates/app/src/components/GraphView/GraphView.tsx (full file)

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
      idealEdgeLength: 280,
      nodeRepulsion: 75000,
      edgeElasticity: 0.30,
      gravity: 0.04,
      gravityRange: 5.0,
      numIter: 2500,
      fit: true,
      padding: 60,
      nodeDimensionsIncludeLabels: false,
    } as cytoscape.LayoutOptions).run();
  }
}

export function GraphView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const { nodes, edges, selectedNodePath, isLoading } = useGraphStore();
  const showEdgeLabels = useUIStore((s) => s.showEdgeLabels);
  const showLegend = useUIStore((s) => s.showLegend);
  const graphLayout = useUIStore((s) => s.graphLayout);
  const treeOpen = useUIStore((s) => s.treeOpen);
  const hiddenEdgeTypes = useUIStore((s) => s.hiddenEdgeTypes);
  const showEdgeLabelsRef = useRef(showEdgeLabels);
  const graphLayoutRef = useRef(graphLayout);
  const selectedNodePathRef = useRef(selectedNodePath);
  const selectNodeRef = useRef(useGraphStore.getState().selectNode);
  const expandNodeRef = useRef(useGraphStore.getState().expandNode);

  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    label: string;
    noteType: string;
  } | null>(null);

  useEffect(() => {
    if (!treeOpen) {
      const cy = cyRef.current;
      if (cy) {
        const wasZero = (containerRef.current?.offsetWidth ?? 0) === 0;
        cy.resize();
        if (wasZero && cy.nodes().length > 0) cy.fit(undefined, 40);
      }
    }
  }, [treeOpen]);

  useEffect(() => {
    showEdgeLabelsRef.current = showEdgeLabels;
    const cy = cyRef.current;
    if (cy) applyEdgeLabelVisibility(cy, showEdgeLabels, selectedNodePathRef.current);
  }, [showEdgeLabels]);

  useEffect(() => {
    graphLayoutRef.current = graphLayout;
    const cy = cyRef.current;
    if (cy && cy.nodes().length > 0) {
      runLayout(cy, graphLayout);
    }
  }, [graphLayout]);

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
      setTooltip(null);
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
        size: 6,
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
      (e) =>
        nodeIds.has(e.data.source) &&
        nodeIds.has(e.data.target) &&
        !hiddenEdgeTypes.has(e.data.label)
    );

    cy.elements().remove();
    cy.add([...cyNodes, ...validEdges]);

    cy.nodes().forEach((n) => {
      n.data("size", Math.max(6, 6 + n.indegree(false) * 2));
    });

    if (cyNodes.length > 0) {
      runLayout(cy, graphLayoutRef.current);
      applyEdgeLabelVisibility(cy, showEdgeLabelsRef.current, selectedNodePathRef.current);
    }
  }, [nodes, edges, hiddenEdgeTypes]);

  // Highlight selected node
  useEffect(() => {
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
        <div style={{ position: "absolute", inset: "36px 0 0 0", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", zIndex: 1, background: "var(--bg-primary)" }}>
          {overlayText}
        </div>
      )}
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

### crates/app/src/stores/uiStore.ts (full file)

```ts
import { create } from "zustand";

type Theme = "light" | "dark" | "system";
type GraphMode = "navigate" | "edit";
type GraphLayout = "force" | "hierarchical";

interface PanelSizes {
  graph?: number;
  right?: number;
  editor?: number;
  inspector?: number;
  search?: number;
}

interface UIState {
  theme: Theme;
  effectiveTheme: "light" | "dark";
  graphMode: GraphMode;
  commandPaletteOpen: boolean;
  createNoteDialogOpen: boolean;
  showEdgeLabels: boolean;
  showLegend: boolean;
  graphLayout: GraphLayout;
  focusMode: boolean;
  treeOpen: boolean;
  treeExpandedFolders: Set<string>;
  hiddenEdgeTypes: Set<string>;
  panelSizes: PanelSizes;

  setTheme: (theme: Theme) => void;
  toggleGraphMode: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openCreateNoteDialog: () => void;
  closeCreateNoteDialog: () => void;
  toggleEdgeLabels: () => void;
  toggleLegend: () => void;
  setGraphLayout: (layout: GraphLayout) => void;
  toggleFocusMode: () => void;
  toggleTree: () => void;
  toggleFolder: (fullPath: string) => void;
  toggleEdgeType: (rel: string) => void;
  savePanelSizes: (sizes: Partial<PanelSizes>) => void;
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(theme: Theme): "light" | "dark" {
  return theme === "system" ? getSystemTheme() : theme;
}

function loadStoredSizes(): PanelSizes {
  try {
    return JSON.parse(localStorage.getItem("brainmap:panelSizes") ?? "{}");
  } catch {
    return {};
  }
}

const storedSizes = loadStoredSizes();

export const useUIStore = create<UIState>((set, get) => ({
  theme: "system",
  effectiveTheme: getSystemTheme(),
  graphMode: "navigate",
  commandPaletteOpen: false,
  createNoteDialogOpen: false,
  showEdgeLabels: false,
  showLegend: false,
  graphLayout: "force",
  focusMode: false,
  treeOpen: false,
  treeExpandedFolders: new Set<string>(),
  hiddenEdgeTypes: new Set<string>(),
  panelSizes: storedSizes,

  setTheme: (theme: Theme) => {
    set({ theme, effectiveTheme: resolveTheme(theme) });
  },

  toggleGraphMode: () => {
    set((state) => ({
      graphMode: state.graphMode === "navigate" ? "edit" : "navigate",
    }));
  },

  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  openCreateNoteDialog: () => set({ createNoteDialogOpen: true }),
  closeCreateNoteDialog: () => set({ createNoteDialogOpen: false }),

  toggleEdgeLabels: () => set((s) => ({ showEdgeLabels: !s.showEdgeLabels })),
  toggleLegend: () => set((s) => ({ showLegend: !s.showLegend })),
  setGraphLayout: (layout: GraphLayout) => set({ graphLayout: layout }),
  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
  toggleTree: () => set((s) => ({ treeOpen: !s.treeOpen })),

  toggleFolder: (fullPath: string) =>
    set((s) => {
      const next = new Set(s.treeExpandedFolders);
      if (next.has(fullPath)) next.delete(fullPath);
      else next.add(fullPath);
      return { treeExpandedFolders: next };
    }),

  toggleEdgeType: (rel: string) =>
    set((s) => {
      const next = new Set(s.hiddenEdgeTypes);
      if (next.has(rel)) next.delete(rel);
      else next.add(rel);
      return { hiddenEdgeTypes: next };
    }),

  savePanelSizes: (sizes: Partial<PanelSizes>) => {
    const next = { ...get().panelSizes, ...sizes };
    localStorage.setItem("brainmap:panelSizes", JSON.stringify(next));
    set({ panelSizes: next });
  },
}));
```

### crates/app/src/components/GraphView/GraphToolbar.tsx (full file)

```tsx
import { useRef, useState, useEffect } from "react";
import { useUIStore } from "../../stores/uiStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { useGraphStore } from "../../stores/graphStore";

export function GraphToolbar() {
  const showEdgeLabels = useUIStore((s) => s.showEdgeLabels);
  const toggleEdgeLabels = useUIStore((s) => s.toggleEdgeLabels);
  const showLegend = useUIStore((s) => s.showLegend);
  const toggleLegend = useUIStore((s) => s.toggleLegend);
  const graphLayout = useUIStore((s) => s.graphLayout);
  const setGraphLayout = useUIStore((s) => s.setGraphLayout);
  const hiddenEdgeTypes = useUIStore((s) => s.hiddenEdgeTypes);
  const toggleEdgeType = useUIStore((s) => s.toggleEdgeType);
  const noteTypes = useWorkspaceStore((s) => s.noteTypes);
  const edges = useGraphStore((s) => s.edges);

  const [edgeFilterOpen, setEdgeFilterOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const edgeTypes = Array.from(new Set(edges.map((e) => e.rel))).sort();

  useEffect(() => {
    if (!edgeFilterOpen) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setEdgeFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [edgeFilterOpen]);

  return (
    <div className="graph-toolbar">
      <button
        className={showEdgeLabels ? "active" : ""}
        onClick={toggleEdgeLabels}
        title="Toggle edge labels"
      >
        Labels
      </button>
      <button
        className={showLegend ? "active" : ""}
        onClick={toggleLegend}
        title="Toggle color legend"
      >
        Legend
      </button>
      <select
        value={graphLayout}
        onChange={(e) => setGraphLayout(e.target.value as "force" | "hierarchical")}
      >
        <option value="force">Force Layout</option>
        <option value="hierarchical">Hierarchical (LR)</option>
      </select>
      <div ref={popoverRef} style={{ position: "relative" }}>
        <button
          className={hiddenEdgeTypes.size > 0 ? "active" : ""}
          onClick={() => setEdgeFilterOpen((o) => !o)}
          title="Filter edge types"
        >
          {hiddenEdgeTypes.size > 0
            ? `Edges (${edgeTypes.length - hiddenEdgeTypes.size}/${edgeTypes.length})`
            : "Edges"}
        </button>
        {edgeFilterOpen && (
          <div className="edge-filter-popover">
            {edgeTypes.map((rel) => (
              <label key={rel} className="edge-filter-item">
                <input
                  type="checkbox"
                  checked={!hiddenEdgeTypes.has(rel)}
                  onChange={() => toggleEdgeType(rel)}
                />
                {rel}
              </label>
            ))}
          </div>
        )}
      </div>
      <span style={{ flex: 1 }} />
      <select
        defaultValue="all"
        onChange={(e) => {
          console.log("Filter by type:", e.target.value);
        }}
      >
        <option value="all">All Types</option>
        {noteTypes.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}
```

Write your review to the file `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/graph-layout-edge-filter-review-1.md`.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"mkdir -p /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code","description":"Ensure review directory exists"}`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/graph-layout-edge-filter-review-1.md","content":"# Code Review: Graph Layout & Edge Filter\n\n**Files reviewed:**\n- `cra`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/graph-layout-edge-filter-review-1.md`.

**Summary of findings:**

| # | File | Severity | Issue |
|---|------|----------|-------|
| 1 | `GraphToolbar.tsx` | **bug** | Badge math `edgeTypes.length - hiddenEdgeTypes.size` goes negative when stale hidden types from a previous workspace outnumber current edge types |
| 2 | `uiStore.ts` | **should-fix** | `hiddenEdgeTypes` is never cleared on workspace switch — silently filters edges from new workspaces |
| 3 | `GraphView.tsx` `runLayout` | **should-fix** | Dagre layout filters to directional edges only, leaving non-directional nodes at stacked/previous positions; fcose runs on all elements — asymmetric and undocumented |
| 4 | `GraphToolbar.tsx` | **should-fix** | `console.log` left in the note-type filter `onChange` — feature is unimplemented |
| 5 | `GraphView.tsx` | **suggestion** | `selectNodeRef`/`expandNodeRef` capture Zustand actions once at mount; correct for Zustand's stable refs but fragile and undocumented |
| 6 | `GraphView.tsx` | **bug** | Tooltip position uses `renderedPosition()` (canvas-relative) but is placed in the outer flex container — offset by the toolbar height |
| 7 | `GraphView.tsx` | **suggestion** | Full layout re-runs on each of `nodes`, `edges`, `hiddenEdgeTypes` independently; sequential store updates can trigger double layout with a flash |

The two bugs (items 1 and 6) and three should-fixes (items 2, 3, 4) require attention before this is considered done.

---

