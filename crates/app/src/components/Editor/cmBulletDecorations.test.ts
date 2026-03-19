import { describe, it, expect } from "vitest";
import { Text } from "@codemirror/state";
import { scanBullets, buildBulletDecorations } from "./cmBulletDecorations";
import { BULLET_PRESETS, type BulletStyle } from "../../stores/uiStore";

function doc(lines: string[]): Text {
  return Text.of(lines);
}

describe("scanBullets", () => {
  it("detects flat list items with - marker", () => {
    const d = doc(["- item one", "- item two", "- item three"]);
    const matches = scanBullets(d);
    expect(matches).toHaveLength(3);
    expect(matches.map((m) => m.depth)).toEqual([0, 0, 0]);
  });

  it("detects all marker types (-, *, +)", () => {
    const d = doc(["- dash", "* star", "+ plus"]);
    const matches = scanBullets(d);
    expect(matches).toHaveLength(3);
  });

  it("computes depth from 4-space indent", () => {
    const d = doc(["- depth 0", "    - depth 1", "        - depth 2"]);
    const matches = scanBullets(d);
    expect(matches).toHaveLength(3);
    expect(matches[0].depth).toBe(0);
    expect(matches[1].depth).toBe(1);
    expect(matches[2].depth).toBe(2);
  });

  it("clamps partial indent (2 spaces = depth 0)", () => {
    const d = doc(["- depth 0", "  - still depth 0"]);
    const matches = scanBullets(d);
    expect(matches).toHaveLength(2);
    expect(matches[0].depth).toBe(0);
    expect(matches[1].depth).toBe(0);
  });

  it("skips non-list lines", () => {
    const d = doc(["# heading", "some paragraph", "- list item", "another paragraph"]);
    const matches = scanBullets(d);
    expect(matches).toHaveLength(1);
    expect(matches[0].lineNumber).toBe(3);
  });

  it("returns correct markerFrom/markerTo offsets", () => {
    const d = doc(["    - nested"]);
    const matches = scanBullets(d);
    expect(matches).toHaveLength(1);
    // line starts at offset 0, indent is 4 chars, marker is at offset 4
    expect(matches[0].markerFrom).toBe(4);
    expect(matches[0].markerTo).toBe(5);
  });

  it("returns empty for empty document", () => {
    const d = doc([""]);
    expect(scanBullets(d)).toHaveLength(0);
  });

  it("requires space after marker", () => {
    const d = doc(["-no space", "- has space"]);
    const matches = scanBullets(d);
    expect(matches).toHaveLength(1);
    expect(matches[0].lineNumber).toBe(2);
  });
});

describe("buildBulletDecorations", () => {
  it("produces decorations for all list lines", () => {
    const d = doc(["- line 1", "- line 2", "- line 3"]);
    const decoSet = buildBulletDecorations(d, BULLET_PRESETS.classic);
    const decos: { from: number; to: number }[] = [];
    const iter = decoSet.iter();
    while (iter.value) {
      decos.push({ from: iter.from, to: iter.to });
      iter.next();
    }
    expect(decos).toHaveLength(3);
  });

  it("uses correct preset characters per depth", () => {
    const presets: BulletStyle[] = ["classic", "dash", "arrow", "minimal"];
    for (const style of presets) {
      const preset = BULLET_PRESETS[style];
      const d = doc(["- d0", "    - d1", "        - d2"]);
      const decoSet = buildBulletDecorations(d, preset);
      const widgets: string[] = [];
      const iter = decoSet.iter();
      while (iter.value) {
        const widget = (iter.value.spec as { widget?: { char: string } }).widget;
        if (widget) widgets.push(widget.char);
        iter.next();
      }
      expect(widgets).toEqual([preset[0], preset[1], preset[2]]);
    }
  });

  it("cycles depth characters for depth > 2", () => {
    const d = doc([
      "- d0",
      "    - d1",
      "        - d2",
      "            - d3 (cycles to d0 char)",
    ]);
    const preset = BULLET_PRESETS.classic;
    const decoSet = buildBulletDecorations(d, preset);
    const widgets: string[] = [];
    const iter = decoSet.iter();
    while (iter.value) {
      const widget = (iter.value.spec as { widget?: { char: string } }).widget;
      if (widget) widgets.push(widget.char);
      iter.next();
    }
    expect(widgets).toEqual([preset[0], preset[1], preset[2], preset[0]]);
  });
});
