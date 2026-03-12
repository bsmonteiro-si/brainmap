import { describe, it, expect } from "vitest";
import { convexHull } from "./graphHulls";

describe("convexHull", () => {
  it("returns all points for a triangle", () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 2, y: 3 },
    ];
    const hull = convexHull(pts);
    expect(hull).toHaveLength(3);
  });

  it("returns 4 points for a square (no interior points)", () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 4, y: 4 },
      { x: 0, y: 4 },
    ];
    const hull = convexHull(pts);
    expect(hull).toHaveLength(4);
  });

  it("excludes interior points", () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 4, y: 4 },
      { x: 0, y: 4 },
      { x: 2, y: 2 }, // interior
    ];
    const hull = convexHull(pts);
    expect(hull).toHaveLength(4);
    expect(hull).not.toContainEqual({ x: 2, y: 2 });
  });

  it("handles collinear points", () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ];
    const hull = convexHull(pts);
    // Collinear points: hull degenerates to endpoints
    expect(hull.length).toBeLessThanOrEqual(3);
    expect(hull.length).toBeGreaterThanOrEqual(2);
  });

  it("returns the point itself for a single point", () => {
    const hull = convexHull([{ x: 5, y: 5 }]);
    expect(hull).toHaveLength(1);
    expect(hull[0]).toEqual({ x: 5, y: 5 });
  });

  it("returns both points for two points", () => {
    const hull = convexHull([
      { x: 0, y: 0 },
      { x: 3, y: 3 },
    ]);
    expect(hull).toHaveLength(2);
  });

  it("returns empty array for empty input", () => {
    expect(convexHull([])).toHaveLength(0);
  });
});
