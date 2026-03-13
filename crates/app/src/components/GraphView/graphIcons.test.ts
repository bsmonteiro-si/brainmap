import { describe, it, expect } from "vitest";
import { getNodeIconSvg, getNodeIconSvgWhite } from "./graphIcons";
import { NOTE_TYPE_COLORS, getNodeColor } from "./graphStyles";

describe("getNodeIconSvg", () => {
  it("returns a valid data URI for all 11 note types", () => {
    for (const [type, color] of Object.entries(NOTE_TYPE_COLORS)) {
      const uri = getNodeIconSvg(type, color);
      expect(uri).toMatch(/^data:image\/svg\+xml,/);
      expect(uri.length).toBeGreaterThan(50);
    }
  });

  it("returns unique SVGs for each type", () => {
    const uris = new Set(
      Object.entries(NOTE_TYPE_COLORS).map(([t, c]) => getNodeIconSvg(t, c))
    );
    expect(uris.size).toBe(Object.keys(NOTE_TYPE_COLORS).length);
  });

  it("returns fallback File icon for unknown types", () => {
    const uri = getNodeIconSvg("unknown", "#aaa");
    expect(uri).toMatch(/^data:image\/svg\+xml,/);
    expect(getNodeIconSvg("unknown", "#aaa")).toBe(
      getNodeIconSvg("nonexistent", "#aaa")
    );
  });

  it("SVGs contain the provided stroke color", () => {
    const color = getNodeColor("concept");
    const uri = getNodeIconSvg("concept", color);
    const decoded = decodeURIComponent(uri.replace("data:image/svg+xml,", ""));
    expect(decoded).toContain(`stroke="${color}"`);
  });

  it("SVGs are valid SVG markup", () => {
    const uri = getNodeIconSvg("person", "#e91e63");
    const decoded = decodeURIComponent(uri.replace("data:image/svg+xml,", ""));
    expect(decoded).toContain("<svg");
    expect(decoded).toContain("</svg>");
    expect(decoded).toContain("xmlns=");
    expect(decoded).toContain("<circle");
  });

  it("caches by noteType and color", () => {
    const uri1 = getNodeIconSvg("concept", "#ff0000");
    const uri2 = getNodeIconSvg("concept", "#00ff00");
    expect(uri1).not.toBe(uri2);
    expect(getNodeIconSvg("concept", "#ff0000")).toBe(uri1);
  });
});

describe("getNodeIconSvgWhite", () => {
  it("returns white-stroke SVG for all note types", () => {
    for (const type of Object.keys(NOTE_TYPE_COLORS)) {
      const uri = getNodeIconSvgWhite(type);
      const decoded = decodeURIComponent(uri.replace("data:image/svg+xml,", ""));
      expect(decoded).toContain('stroke="white"');
    }
  });

  it("differs from colored variant of the same type", () => {
    const colored = getNodeIconSvg("concept", getNodeColor("concept"));
    const white = getNodeIconSvgWhite("concept");
    expect(colored).not.toBe(white);
  });
});
