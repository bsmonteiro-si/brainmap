// ── Canvas Shape Registry ────────────────────────────────────────────────────
// Adding a new shape: (1) add entry here, (2) add CSS class in App.css.

export type CanvasShapeId =
  | "rectangle"
  | "rounded"
  | "circle"
  | "sticky"
  | "callout"
  | "diamond";

export interface CanvasShapeDefinition {
  id: CanvasShapeId;
  label: string;
  /** lucide-react icon name */
  icon: string;
  /** CSS modifier class applied to .canvas-text-node (empty = default) */
  cssClass: string;
  defaultWidth: number;
  defaultHeight: number;
}

export const CANVAS_SHAPES: CanvasShapeDefinition[] = [
  { id: "rectangle", label: "Rectangle",   icon: "Square",              cssClass: "",                       defaultWidth: 250, defaultHeight: 100 },
  { id: "rounded",   label: "Rounded",     icon: "RectangleHorizontal", cssClass: "canvas-shape--rounded",  defaultWidth: 250, defaultHeight: 100 },
  { id: "circle",    label: "Circle",      icon: "Circle",              cssClass: "canvas-shape--circle",   defaultWidth: 160, defaultHeight: 160 },
  { id: "sticky",    label: "Sticky Note", icon: "StickyNote",          cssClass: "canvas-shape--sticky",   defaultWidth: 200, defaultHeight: 200 },
  { id: "callout",   label: "Callout",     icon: "MessageSquare",       cssClass: "canvas-shape--callout",  defaultWidth: 260, defaultHeight: 120 },
  { id: "diamond",   label: "Diamond",     icon: "Diamond",             cssClass: "canvas-shape--diamond",  defaultWidth: 160, defaultHeight: 160 },
];

export const DEFAULT_SHAPE: CanvasShapeId = "rectangle";

export function getShapeDefinition(id: string | undefined): CanvasShapeDefinition {
  return CANVAS_SHAPES.find((s) => s.id === id) ?? CANVAS_SHAPES[0];
}
