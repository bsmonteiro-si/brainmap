import { MarkerType } from "@xyflow/react";
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
}

interface JsonCanvasTextNode extends JsonCanvasNodeBase {
  type: "text";
  text: string;
  shape?: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: string;
}

interface JsonCanvasFileNode extends JsonCanvasNodeBase {
  type: "file";
  file: string;
  subpath?: string;
}

interface JsonCanvasLinkNode extends JsonCanvasNodeBase {
  type: "link";
  url: string;
}

interface JsonCanvasGroupNode extends JsonCanvasNodeBase {
  type: "group";
  label?: string;
  background?: string;
  backgroundStyle?: "cover" | "ratio" | "repeat";
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

    switch (cn.type) {
      case "text":
        data.text = cn.text;
        if (cn.shape) data.shape = cn.shape;
        if (cn.fontSize) data.fontSize = cn.fontSize;
        if (cn.fontFamily) data.fontFamily = cn.fontFamily;
        if (cn.textAlign) data.textAlign = cn.textAlign;
        break;
      case "file":
        data.file = cn.file;
        if (cn.subpath) data.subpath = cn.subpath;
        break;
      case "link":
        data.url = cn.url;
        break;
      case "group":
        if (cn.label) data.label = cn.label;
        if (cn.background) data.background = cn.background;
        if (cn.backgroundStyle) data.backgroundStyle = cn.backgroundStyle;
        break;
    }

    return {
      id: cn.id,
      type: rfType,
      position: { x: cn.x, y: cn.y },
      data,
      style: { width: cn.width, height: cn.height },
      // Groups should render behind other nodes
      ...(cn.type === "group" ? { zIndex: -1 } : {}),
    };
  });

  const edges: Edge[] = (canvas.edges ?? []).map((ce) => {
    const edge: Edge = {
      id: ce.id,
      source: ce.fromNode,
      target: ce.toNode,
    };

    if (ce.fromSide) edge.sourceHandle = ce.fromSide;
    if (ce.toSide) edge.targetHandle = `${ce.toSide}-target`;

    // Default: arrow on target end
    const toEnd = ce.toEnd ?? "arrow";
    if (toEnd === "arrow") {
      edge.markerEnd = { type: MarkerType.ArrowClosed };
    }
    if (ce.fromEnd === "arrow") {
      edge.markerStart = { type: MarkerType.ArrowClosed };
    }

    if (ce.label) edge.label = ce.label;
    if (ce.color) edge.style = { stroke: ce.color };

    return edge;
  });

  return { nodes, edges };
}

// ── React Flow → JSON Canvas ──────────────────────────────────────────────────

export function flowToCanvas(nodes: Node[], edges: Edge[]): JsonCanvas {
  const canvasNodes: JsonCanvasNode[] = nodes.map((n) => {
    const canvasType = (RF_TO_CANVAS_TYPE[n.type ?? ""] ?? "text") as JsonCanvasNode["type"];
    const data = n.data as Record<string, unknown>;
    const style = (n.style ?? {}) as Record<string, unknown>;
    const measured = (n.measured ?? {}) as Record<string, number>;

    const base: JsonCanvasNodeBase = {
      id: n.id,
      type: canvasType,
      x: Math.round(n.position.x),
      y: Math.round(n.position.y),
      width: Math.round(
        (typeof style.width === "number" ? style.width : null) ??
        measured.width ??
        250,
      ),
      height: Math.round(
        (typeof style.height === "number" ? style.height : null) ??
        measured.height ??
        100,
      ),
    };

    if (data.color) base.color = String(data.color);
    if (data.bgColor) base.bgColor = String(data.bgColor);

    switch (canvasType) {
      case "text": {
        const node: JsonCanvasTextNode = { ...base, type: "text" as const, text: String(data.text ?? "") };
        if (data.shape && data.shape !== "rectangle") node.shape = String(data.shape);
        if (data.fontSize && data.fontSize !== 13) node.fontSize = Number(data.fontSize);
        if (data.fontFamily) node.fontFamily = String(data.fontFamily);
        if (data.textAlign && data.textAlign !== "center") node.textAlign = String(data.textAlign);
        return node;
      }
      case "file": {
        const node: JsonCanvasFileNode = { ...base, type: "file" as const, file: String(data.file ?? "") };
        if (data.subpath) node.subpath = String(data.subpath);
        return node;
      }
      case "link":
        return { ...base, type: "link" as const, url: String(data.url ?? "") };
      case "group": {
        const node: JsonCanvasGroupNode = { ...base, type: "group" as const };
        if (data.label) node.label = String(data.label);
        if (data.background) node.background = String(data.background);
        if (data.backgroundStyle) node.backgroundStyle = String(data.backgroundStyle) as "cover" | "ratio" | "repeat";
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

    return ce;
  });

  return { nodes: canvasNodes, edges: canvasEdges };
}
