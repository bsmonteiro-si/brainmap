import { describe, it, expect } from "vitest";
import { getNodeColor, getNodeShape, NOTE_TYPE_COLORS } from "./graphStyles";

describe("getNodeColor", () => {
  it("returns correct color for each note type", () => {
    expect(getNodeColor("concept")).toBe("#4a9eff");
    expect(getNodeColor("person")).toBe("#e91e63");
  });

  it("returns fallback gray for unknown type", () => {
    expect(getNodeColor("unknown")).toBe("#95a5a6");
    expect(getNodeColor("")).toBe("#95a5a6");
  });
});

describe("getNodeShape", () => {
  const expectedShapes: Record<string, string> = {
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

  it("returns correct shape for all 10 note types", () => {
    for (const [type, shape] of Object.entries(expectedShapes)) {
      expect(getNodeShape(type)).toBe(shape);
    }
  });

  it("covers all types in NOTE_TYPE_COLORS", () => {
    for (const type of Object.keys(NOTE_TYPE_COLORS)) {
      expect(getNodeShape(type)).not.toBe("ellipse-fallback");
      expect(expectedShapes[type]).toBeDefined();
    }
  });

  it("returns fallback ellipse for unknown type", () => {
    expect(getNodeShape("unknown")).toBe("ellipse");
    expect(getNodeShape("")).toBe("ellipse");
  });
});
