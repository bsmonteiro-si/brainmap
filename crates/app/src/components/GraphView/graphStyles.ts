// Canonical color palette for the 11 note types (including virtual folder nodes).
// Used by graph nodes, file tree icons (fileTreeIcons.tsx), and hull overlays.
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
  folder: "#8e8e93",
};

export function getNodeColor(noteType: string): string {
  return NOTE_TYPE_COLORS[noteType] ?? "#95a5a6";
}

// Shape mapping — uniform ellipse for all types (icons provide visual distinction).
const NOTE_TYPE_SHAPES: Record<string, string> = {
  concept: "ellipse",
  "book-note": "ellipse",
  question: "ellipse",
  reference: "ellipse",
  index: "ellipse",
  argument: "ellipse",
  evidence: "ellipse",
  experiment: "ellipse",
  person: "ellipse",
  project: "ellipse",
  folder: "ellipse",
};

export function getNodeShape(noteType: string): string {
  return NOTE_TYPE_SHAPES[noteType] ?? "ellipse";
}

export interface GraphStyleOpts {
  labelSize: number;    // default 11
  bgPadding: number;    // default 3
  baseNodeSize: number; // default 18
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildGraphStylesheet(opts: GraphStyleOpts): any[] {
  const { labelSize, bgPadding, baseNodeSize } = opts;
  const scale = baseNodeSize / 18;
  return [
    {
      selector: "node",
      style: {
        width: "data(size)",
        height: "data(size)",
        shape: "data(shape)",
        "background-color": "transparent",
        "background-image": "data(iconSvg)",
        "background-fit": "contain",
        "background-width": "100%",
        "background-height": "100%",
        "background-clip": "none",
        "border-width": 0,
        label: "data(label)",
        "font-size": `${labelSize}px`,
        color: "#cccccc",
        "text-valign": "bottom",
        "text-halign": "center",
        "text-margin-y": 5,
        "text-max-width": "100px",
        "text-wrap": "ellipsis",
        // Hidden at default zoom; appear when zoomed past threshold
        "min-zoomed-font-size": Math.round(labelSize * 1.27),
        // Label background pill
        "text-background-color": "rgba(0,0,0,0.65)",
        "text-background-opacity": 0.75,
        "text-background-padding": `${bgPadding}px`,
        "text-background-shape": "roundrectangle",
        // Glow effect using shadow
        "shadow-blur": 10,
        "shadow-color": "data(color)",
        "shadow-opacity": 0.7,
        "shadow-offset-x": 0,
        "shadow-offset-y": 0,
        opacity: 1,
      },
    },
    {
      selector: "node:selected",
      style: {
        width: Math.round(28 * scale),
        height: Math.round(28 * scale),
        "shadow-blur": 20,
        "shadow-opacity": 1.0,
      },
    },
    {
      selector: "node.highlighted",
      style: {
        width: Math.round(22 * scale),
        height: Math.round(22 * scale),
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
      // Focal node when "Focus in Graph" is active.
      selector: "node.graph-focus-node",
      style: {
        width: Math.round(32 * scale),
        height: Math.round(32 * scale),
        "shadow-blur": 26,
        "shadow-opacity": 1.0,
      },
    },
    {
      // Home/index node — gold glow ring to signal the graph entrypoint
      selector: "node.home-node",
      style: {
        width: Math.round(26 * scale),
        height: Math.round(26 * scale),
        "border-width": 2,
        "border-color": "#ffd700",
        "border-opacity": 0.7,
        "shadow-blur": 18,
        "shadow-opacity": 0.9,
        "shadow-color": "#ffd700",
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
}

// Default stylesheet for initial Cytoscape creation
export const graphStylesheet = buildGraphStylesheet({
  labelSize: 11,
  bgPadding: 3,
  baseNodeSize: 18,
});
