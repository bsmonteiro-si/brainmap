import type { Node, Edge } from "@xyflow/react";

// ── JSON Canvas types ─────────────────────────────────────────────────────────

interface JsonCanvasNodeBase {
  id: string;
  type: "text" | "file" | "link" | "group";
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  bgColor?: string;
  parentId?: string;
  fontSize?: number;
  fontFamily?: string;
}

export type CanvasCardKind = "summary" | "question" | "transition";

interface JsonCanvasTextNode extends JsonCanvasNodeBase {
  type: "text";
  text: string;
  shape?: string;
  textAlign?: string;
  textVAlign?: string;
  cardKind?: CanvasCardKind;
}

interface JsonCanvasFileNode extends JsonCanvasNodeBase {
  type: "file";
  file: string;
  subpath?: string;
  titleVAlign?: string;
}

interface JsonCanvasLinkNode extends JsonCanvasNodeBase {
  type: "link";
  url: string;
  title?: string;
}

interface JsonCanvasGroupNode extends JsonCanvasNodeBase {
  type: "group";
  label?: string;
  background?: string;
  backgroundStyle?: "cover" | "ratio" | "repeat";
  collapsed?: boolean;
}

type JsonCanvasNode =
  | JsonCanvasTextNode
  | JsonCanvasFileNode
  | JsonCanvasLinkNode
  | JsonCanvasGroupNode;

interface JsonCanvasEdge {
  id: string;
  fromNode: string;
  toNode: string;
  fromSide?: "top" | "right" | "bottom" | "left";
  toSide?: "top" | "right" | "bottom" | "left";
  fromEnd?: "none" | "arrow";
  toEnd?: "none" | "arrow";
  color?: string;
  label?: string;
  edgeType?: string;
  labelFontSize?: number;
  labelFontFamily?: string;
}

export interface JsonCanvas {
  nodes?: JsonCanvasNode[];
  edges?: JsonCanvasEdge[];
}

// ── React Flow node type names ────────────────────────────────────────────────

const CANVAS_TO_RF_TYPE: Record<string, string> = {
  text: "canvasText",
  file: "canvasFile",
  link: "canvasLink",
  group: "canvasGroup",
};

const RF_TO_CANVAS_TYPE: Record<string, string> = {
  canvasText: "text",
  canvasFile: "file",
  canvasLink: "link",
  canvasGroup: "group",
};

// ── JSON Canvas → React Flow ──────────────────────────────────────────────────

export function canvasToFlow(canvas: JsonCanvas): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = (canvas.nodes ?? []).map((cn) => {
    const rfType = CANVAS_TO_RF_TYPE[cn.type] ?? "canvasText";

    const data: Record<string, unknown> = {};
    if (cn.color) data.color = cn.color;
    if (cn.bgColor) data.bgColor = cn.bgColor;
    if (cn.fontSize) data.fontSize = cn.fontSize;
    if (cn.fontFamily) data.fontFamily = cn.fontFamily;

    switch (cn.type) {
      case "text":
        data.text = cn.text;
        if (cn.shape) data.shape = cn.shape;
        if (cn.textAlign) data.textAlign = cn.textAlign;
        if (cn.textVAlign) data.textVAlign = cn.textVAlign;
        if (cn.cardKind) data.cardKind = cn.cardKind;
        break;
      case "file":
        data.file = cn.file;
        if (cn.subpath) data.subpath = cn.subpath;
        if (cn.titleVAlign) data.titleVAlign = cn.titleVAlign;
        break;
      case "link":
        data.url = cn.url;
        if (cn.title) data.title = cn.title;
        break;
      case "group":
        if (cn.label) data.label = cn.label;
        if (cn.background) data.background = cn.background;
        if (cn.backgroundStyle) data.backgroundStyle = cn.backgroundStyle;
        if (cn.collapsed) data.collapsed = true;
        break;
    }

    return {
      id: cn.id,
      type: rfType,
      position: { x: cn.x, y: cn.y },
      data,
      style: (
        cn.type === "group" ||
        (cn.type === "text" && (cn.shape === "circle" || cn.shape === "diamond"))
      )
        ? { width: cn.width, height: cn.height }
        : { width: cn.width, minHeight: cn.height },
      // Groups should render behind other nodes
      ...(cn.type === "group" ? { zIndex: -1 } : {}),
      ...(cn.parentId ? { parentId: cn.parentId } : {}),
    };
  });

  // Convert absolute JSON positions to parent-relative for parented nodes
  // and ensure parent nodes precede children in the array (React Flow requirement)
  const hasParented = nodes.some((n) => n.parentId);
  if (hasParented) {
    const nodeById = new Map(nodes.map((n) => [n.id, n]));
    for (const n of nodes) {
      if (n.parentId) {
        const parent = nodeById.get(n.parentId);
        if (parent) {
          n.position = {
            x: n.position.x - parent.position.x,
            y: n.position.y - parent.position.y,
          };
        }
      }
    }
    const parentIds = new Set(nodes.filter((n) => n.parentId).map((n) => n.parentId!));
    const parents = nodes.filter((n) => parentIds.has(n.id));
    const rest = nodes.filter((n) => !parentIds.has(n.id));
    nodes.length = 0;
    nodes.push(...parents, ...rest);
  }

  const edges: Edge[] = (canvas.edges ?? []).map((ce) => {
    const edge: Edge = {
      id: ce.id,
      source: ce.fromNode,
      target: ce.toNode,
    };

    if (ce.fromSide) edge.sourceHandle = ce.fromSide;
    if (ce.toSide) edge.targetHandle = `${ce.toSide}-target`;

    // Default: arrow on target end.
    // Marker IDs must match the custom SVG <marker> defs in CanvasEditor.tsx.
    // Colored variants (brainmap-arrow-{color}) work because ce.color also sets
    // edge.style.stroke, which drives the per-color <marker> def generation.
    const toEnd = ce.toEnd ?? "arrow";
    const markerId = ce.color ? `brainmap-arrow-${ce.color}` : "brainmap-arrow";
    if (toEnd === "arrow") {
      edge.markerEnd = markerId;
    }
    if (ce.fromEnd === "arrow") {
      edge.markerStart = markerId;
    }

    if (ce.label) edge.label = ce.label;
    if (ce.color) edge.style = { stroke: ce.color };
    if (ce.edgeType || ce.labelFontSize != null || ce.labelFontFamily != null) {
      edge.data = {
        ...(edge.data as object ?? {}),
        ...(ce.edgeType ? { edgeType: ce.edgeType } : {}),
        ...(ce.labelFontSize != null ? { labelFontSize: ce.labelFontSize } : {}),
        ...(ce.labelFontFamily != null ? { labelFontFamily: ce.labelFontFamily } : {}),
      };
    }

    return edge;
  });

  return { nodes, edges };
}

// ── React Flow → JSON Canvas ──────────────────────────────────────────────────

export function flowToCanvas(nodes: Node[], edges: Edge[]): JsonCanvas {
  // Build parent position lookup for converting relative→absolute positions
  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  const canvasNodes: JsonCanvasNode[] = nodes.map((n) => {
    const canvasType = (RF_TO_CANVAS_TYPE[n.type ?? ""] ?? "text") as JsonCanvasNode["type"];
    const data = n.data as Record<string, unknown>;
    const style = (n.style ?? {}) as Record<string, unknown>;
    const measured = (n.measured ?? {}) as Record<string, number>;

    // Convert relative positions to absolute for JSON Canvas interop
    let absX = n.position.x;
    let absY = n.position.y;
    if (n.parentId) {
      const parent = nodeById.get(n.parentId);
      if (parent) {
        absX += parent.position.x;
        absY += parent.position.y;
      }
    }

    const base: JsonCanvasNodeBase = {
      id: n.id,
      type: canvasType,
      x: Math.round(absX),
      y: Math.round(absY),
      width: Math.round(
        (typeof n.width === "number" ? n.width : null) ??
        (typeof style.width === "number" ? style.width : null) ??
        measured.width ??
        250,
      ),
      height: Math.round(
        Math.max(
          measured.height ?? 0,
          (typeof n.height === "number" ? n.height : null) ??
          (typeof style.height === "number" ? style.height : null) ??
          (typeof style.minHeight === "number" ? style.minHeight : null) ??
          100,
        ),
      ),
    };

    if (data.color) base.color = String(data.color);
    if (data.bgColor) base.bgColor = String(data.bgColor);
    if (n.parentId) base.parentId = n.parentId;
    if (data.fontSize && data.fontSize !== 13) base.fontSize = Number(data.fontSize);
    if (data.fontFamily) base.fontFamily = String(data.fontFamily);

    switch (canvasType) {
      case "text": {
        const node: JsonCanvasTextNode = { ...base, type: "text" as const, text: String(data.text ?? "") };
        if (data.shape && data.shape !== "rectangle") node.shape = String(data.shape);
        if (data.textAlign && data.textAlign !== "center") node.textAlign = String(data.textAlign);
        if (data.textVAlign && data.textVAlign !== "center") node.textVAlign = String(data.textVAlign);
        if (data.cardKind) node.cardKind = String(data.cardKind) as CanvasCardKind;
        return node;
      }
      case "file": {
        const node: JsonCanvasFileNode = { ...base, type: "file" as const, file: String(data.file ?? "") };
        if (data.subpath) node.subpath = String(data.subpath);
        if (data.titleVAlign && data.titleVAlign !== "center") node.titleVAlign = String(data.titleVAlign);
        return node;
      }
      case "link": {
        const node: JsonCanvasLinkNode = { ...base, type: "link" as const, url: String(data.url ?? "") };
        if (data.title) node.title = String(data.title);
        return node;
      }
      case "group": {
        const node: JsonCanvasGroupNode = { ...base, type: "group" as const };
        if (data.label) node.label = String(data.label);
        if (data.background) node.background = String(data.background);
        if (data.backgroundStyle) node.backgroundStyle = String(data.backgroundStyle) as "cover" | "ratio" | "repeat";
        if (data.collapsed) node.collapsed = true;
        return node;
      }
      default:
        return { ...base, type: "text" as const, text: String(data.text ?? "") };
    }
  });

  const canvasEdges: JsonCanvasEdge[] = edges.map((e) => {
    const ce: JsonCanvasEdge = {
      id: e.id,
      fromNode: e.source,
      toNode: e.target,
    };

    if (e.sourceHandle) ce.fromSide = e.sourceHandle as JsonCanvasEdge["fromSide"];
    if (e.targetHandle) ce.toSide = e.targetHandle.replace(/-target$/, "") as JsonCanvasEdge["toSide"];

    // Determine end markers
    const markerEnd = e.markerEnd as { type?: string } | string | undefined;
    const hasEndArrow = markerEnd && (typeof markerEnd === "object" ? markerEnd.type : markerEnd);
    ce.toEnd = hasEndArrow ? "arrow" : "none";

    const markerStart = e.markerStart as { type?: string } | string | undefined;
    const hasStartArrow = markerStart && (typeof markerStart === "object" ? markerStart.type : markerStart);
    if (hasStartArrow) ce.fromEnd = "arrow";

    if (e.label) ce.label = String(e.label);
    if (e.style && typeof e.style === "object" && "stroke" in e.style) {
      ce.color = String(e.style.stroke);
    }
    const edgeData = e.data as Record<string, unknown> | undefined;
    if (edgeData?.edgeType && edgeData.edgeType !== "bezier") {
      ce.edgeType = String(edgeData.edgeType);
    }
    if (edgeData?.labelFontSize != null && edgeData.labelFontSize !== 11) {
      ce.labelFontSize = Number(edgeData.labelFontSize);
    }
    if (edgeData?.labelFontFamily != null && edgeData.labelFontFamily !== "") {
      ce.labelFontFamily = String(edgeData.labelFontFamily);
    }

    return ce;
  });

  return { nodes: canvasNodes, edges: canvasEdges };
}
