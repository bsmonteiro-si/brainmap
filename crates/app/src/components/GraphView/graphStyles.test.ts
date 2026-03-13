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
  it("returns ellipse for all note types (icons provide distinction)", () => {
    for (const type of Object.keys(NOTE_TYPE_COLORS)) {
      expect(getNodeShape(type)).toBe("ellipse");
    }
  });

  it("returns fallback ellipse for unknown type", () => {
    expect(getNodeShape("unknown")).toBe("ellipse");
    expect(getNodeShape("")).toBe("ellipse");
  });
});
