import type { Core } from "cytoscape";
import { NOTE_TYPE_COLORS } from "./graphStyles";

interface Point {
  x: number;
  y: number;
}

function cross(O: Point, A: Point, B: Point): number {
  return (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);
}

export function convexHull(points: Point[]): Point[] {
  if (points.length < 3) return [...points];
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  const lower: Point[] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }
  const upper: Point[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return [...lower, ...upper];
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

/** Cached hull data in model coordinates (recomputed only on layout/data change) */
export interface CachedHull {
  /** Convex hull points in model (graph) coordinates, padded outward */
  points: Point[];
  color: string;
  r: number;
  g: number;
  b: number;
}

/** Compute hull geometry from current node positions (model coordinates). */
export function computeHulls(cy: Core): CachedHull[] {
  const groups = new Map<string, Point[]>();
  cy.nodes().forEach((node) => {
    const type = node.data("noteType") as string;
    const pos = node.position(); // model coordinates
    if (!groups.has(type)) groups.set(type, []);
    groups.get(type)!.push({ x: pos.x, y: pos.y });
  });

  const hulls: CachedHull[] = [];
  const padding = 30; // in model units

  for (const [type, points] of groups) {
    if (points.length < 3) continue;
    const hull = convexHull(points);
    if (hull.length < 3) continue;

    const color = NOTE_TYPE_COLORS[type] ?? "#95a5a6";
    const { r, g, b } = hexToRgb(color);

    // Expand hull outward by padding
    const cx = hull.reduce((s, p) => s + p.x, 0) / hull.length;
    const cy2 = hull.reduce((s, p) => s + p.y, 0) / hull.length;
    const expanded = hull.map((p) => {
      const dx = p.x - cx;
      const dy = p.y - cy2;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      return { x: p.x + (dx / d) * padding, y: p.y + (dy / d) * padding };
    });

    hulls.push({ points: expanded, color, r, g, b });
  }

  return hulls;
}

/** Draw pre-computed hulls onto canvas, transforming from model to screen coords. */
export function drawCachedHulls(
  cy: Core,
  canvas: HTMLCanvasElement,
  hulls: CachedHull[],
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const rect = canvas.parentElement?.getBoundingClientRect();
  if (rect) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const zoom = cy.zoom();
  const pan = cy.pan();

  for (const hull of hulls) {
    if (hull.points.length < 3) continue;

    ctx.beginPath();
    const first = hull.points[0];
    ctx.moveTo(first.x * zoom + pan.x, first.y * zoom + pan.y);
    for (let i = 1; i < hull.points.length; i++) {
      const p = hull.points[i];
      ctx.lineTo(p.x * zoom + pan.x, p.y * zoom + pan.y);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(${hull.r}, ${hull.g}, ${hull.b}, 0.07)`;
    ctx.fill();
    ctx.strokeStyle = `rgba(${hull.r}, ${hull.g}, ${hull.b}, 0.15)`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

/** Legacy API — computes and draws in one call (used for simplicity). */
export function drawHulls(cy: Core, canvas: HTMLCanvasElement) {
  const hulls = computeHulls(cy);
  drawCachedHulls(cy, canvas, hulls);
}
