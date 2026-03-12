// Canonical color palette for the 10 note types.
// Must stay in sync with .dot-* classes in App.css.
export const NOTE_TYPE_COLORS: Record<string, string> = {
  concept: "#4a9eff",
  "book-note": "#f39c12",
  question: "#9b59b6",
  reference: "#7f8c8d",
  index: "#1abc9c",
  argument: "#e74c3c",
  evidence: "#27ae60",
  experiment: "#e67e22",
  person: "#e91e63",
  project: "#00bcd4",
};

export function getNodeColor(noteType: string): string {
  return NOTE_TYPE_COLORS[noteType] ?? "#95a5a6";
}

// Shape mapping for each note type — all native Cytoscape shapes.
const NOTE_TYPE_SHAPES: Record<string, string> = {
  concept: "ellipse",
  "book-note": "roundrectangle",
  question: "diamond",
  reference: "rectangle",
  index: "star",
  argument: "triangle",
  evidence: "pentagon",
  experiment: "hexagon",
  person: "octagon",
  project: "tag",
};

export function getNodeShape(noteType: string): string {
  return NOTE_TYPE_SHAPES[noteType] ?? "ellipse";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const graphStylesheet: any[] = [
  {
    selector: "node",
    style: {
      width: "data(size)",
      height: "data(size)",
      shape: "data(shape)",
      "background-color": "data(color)",
      "border-width": 0,
      label: "data(label)",
      "font-size": "11px",
      color: "#cccccc",
      "text-valign": "bottom",
      "text-halign": "center",
      "text-margin-y": 5,
      "text-max-width": "100px",
      "text-wrap": "ellipsis",
      // Hidden at default zoom; appear when zoomed past ~127% (11px × 1.27 ≈ 14)
      "min-zoomed-font-size": 14,
      // Label background pill
      "text-background-color": "rgba(0,0,0,0.65)",
      "text-background-opacity": 0.75,
      "text-background-padding": "3px",
      "text-background-shape": "roundrectangle",
      // Glow effect using shadow
      "shadow-blur": 10,
      "shadow-color": "data(color)",
      "shadow-opacity": 0.7,
      "shadow-offset-x": 0,
      "shadow-offset-y": 0,
    },
  },
  {
    selector: "node:selected",
    style: {
      width: 16,
      height: 16,
      "border-width": 2,
      "border-color": "#ffffff",
      "border-opacity": 0.9,
      "shadow-blur": 18,
      "shadow-opacity": 1.0,
    },
  },
  {
    selector: "node.highlighted",
    style: {
      width: 12,
      height: 12,
      "shadow-blur": 12,
      "shadow-opacity": 0.85,
    },
  },
  {
    // Edge gradients are applied imperatively in GraphView.tsx after cy.add()
    // because Cytoscape does not support data() mappers inside gradient arrays.
    selector: "edge",
    style: {
      width: 0.8,
      "line-color": "#aaaaaa",
      "line-opacity": 0.35,
      "target-arrow-shape": "vee",
      "target-arrow-color": "#aaaaaa",
      "arrow-scale": 0.6,
      "curve-style": "bezier",
      "font-size": "8px",
      color: "#aaaaaa",
      "text-rotation": "autorotate",
      "text-margin-y": -8,
      "text-opacity": 0.75,
    },
  },
  {
    selector: "edge.labeled",
    style: {
      label: "data(label)",
    },
  },
  {
    selector: "edge.highlighted",
    style: {
      "line-fill": "solid",
      "line-color": "#ffffff",
      "target-arrow-color": "#ffffff",
      "line-opacity": 0.85,
      width: 1.5,
    },
  },
  {
    // Focal node when "Focus in Graph" is active. Class selector has higher specificity
    // than data() selectors, so this overrides the dynamic data(size) value.
    selector: "node.graph-focus-node",
    style: {
      width: 20,
      height: 20,
      "border-width": 2.5,
      "border-color": "#ffffff",
      "border-opacity": 1.0,
      "shadow-blur": 24,
      "shadow-opacity": 1.0,
    },
  },
  {
    selector: "edge[kind = 'Implicit']",
    style: {
      "line-style": "dashed",
      "line-dash-pattern": [4, 4],
    },
  },
  {
    selector: "edge[kind = 'Inline']",
    style: {
      "line-style": "dotted",
    },
  },
  // ── Hover neighborhood highlight ──────────────────────────────
  {
    selector: "node.hover-dim",
    style: {
      opacity: 0.25,
      "shadow-opacity": 0.1,
    },
  },
  {
    selector: "edge.hover-dim",
    style: {
      "line-opacity": 0.12,
    },
  },
  {
    selector: "node.hover-bright",
    style: {
      "shadow-blur": 14,
      "shadow-opacity": 0.95,
    },
  },
  {
    selector: "edge.hover-bright",
    style: {
      "line-opacity": 0.7,
      width: 1.2,
    },
  },
  // Conflict resolution: selection highlight takes priority over hover-dim
  {
    selector: "node.highlighted.hover-dim",
    style: {
      opacity: 0.5,
      "shadow-opacity": 0.4,
    },
  },
  {
    selector: "node:selected.hover-dim",
    style: {
      opacity: 1.0,
      "shadow-opacity": 1.0,
    },
  },
];
