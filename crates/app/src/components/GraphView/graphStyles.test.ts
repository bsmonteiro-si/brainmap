import { describe, it, expect } from "vitest";
import { getNodeColor, getNodeShape, NOTE_TYPE_COLORS, buildGraphStylesheet } from "./graphStyles";

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

describe("buildGraphStylesheet", () => {
  it("uses provided label size and bg padding in node selector", () => {
    const styles = buildGraphStylesheet({ labelSize: 14, bgPadding: 5, baseNodeSize: 18, edgeLabelSize: 8 });
    const nodeStyle = styles.find((s: { selector: string }) => s.selector === "node")?.style;
    expect(nodeStyle["font-size"]).toBe("14px");
    expect(nodeStyle["text-background-padding"]).toBe("5px");
    expect(nodeStyle["min-zoomed-font-size"]).toBe(Math.round(14 * 1.27));
  });

  it("scales special state selectors proportionally to baseNodeSize", () => {
    const styles = buildGraphStylesheet({ labelSize: 11, bgPadding: 3, baseNodeSize: 36, edgeLabelSize: 8 });
    const scale = 36 / 18; // 2x
    const selected = styles.find((s: { selector: string }) => s.selector === "node:selected")?.style;
    expect(selected.width).toBe(Math.round(28 * scale));
    expect(selected.height).toBe(Math.round(28 * scale));
    const focus = styles.find((s: { selector: string }) => s.selector === "node.graph-focus-node")?.style;
    expect(focus.width).toBe(Math.round(32 * scale));
  });

  it("uses provided edge label size in edge selector", () => {
    const styles = buildGraphStylesheet({ labelSize: 11, bgPadding: 3, baseNodeSize: 18, edgeLabelSize: 12 });
    const edgeStyle = styles.find((s: { selector: string }) => s.selector === "edge")?.style;
    expect(edgeStyle["font-size"]).toBe("12px");
  });

  it("returns default sizes when given default opts", () => {
    const styles = buildGraphStylesheet({ labelSize: 11, bgPadding: 3, baseNodeSize: 18, edgeLabelSize: 8 });
    const nodeStyle = styles.find((s: { selector: string }) => s.selector === "node")?.style;
    expect(nodeStyle["font-size"]).toBe("11px");
    expect(nodeStyle["text-background-padding"]).toBe("3px");
    const selected = styles.find((s: { selector: string }) => s.selector === "node:selected")?.style;
    expect(selected.width).toBe(28);
  });
});
