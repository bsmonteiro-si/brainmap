import { describe, it, expect } from "vitest";
import { CANVAS_SHAPES, getShapeDefinition } from "./canvasShapes";

describe("CANVAS_SHAPES", () => {
  it("has unique ids", () => {
    const ids = CANVAS_SHAPES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique non-empty cssClasses", () => {
    const classes = CANVAS_SHAPES.map((s) => s.cssClass).filter(Boolean);
    expect(new Set(classes).size).toBe(classes.length);
  });

  it("first entry is rectangle with empty cssClass", () => {
    expect(CANVAS_SHAPES[0].id).toBe("rectangle");
    expect(CANVAS_SHAPES[0].cssClass).toBe("");
  });
});

describe("getShapeDefinition", () => {
  it("returns correct definition for known shapes", () => {
    expect(getShapeDefinition("circle").id).toBe("circle");
    expect(getShapeDefinition("sticky").id).toBe("sticky");
    expect(getShapeDefinition("diamond").id).toBe("diamond");
  });

  it("returns rectangle for undefined", () => {
    expect(getShapeDefinition(undefined).id).toBe("rectangle");
  });

  it("returns rectangle for unknown shape", () => {
    expect(getShapeDefinition("hexagon-star").id).toBe("rectangle");
  });
});
