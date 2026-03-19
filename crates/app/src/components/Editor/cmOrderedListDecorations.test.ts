import { describe, it, expect } from "vitest";
import { Text } from "@codemirror/state";
import { scanOrderedMarkers, buildOrderedDecorations } from "./cmOrderedListDecorations";

function doc(lines: string[]): Text {
  return Text.of(lines);
}

describe("scanOrderedMarkers", () => {
  it("detects numeric markers", () => {
    const d = doc(["1. first", "2. second", "10. tenth"]);
    const matches = scanOrderedMarkers(d);
    expect(matches).toHaveLength(3);
    expect(matches.map((m) => m.markerText)).toEqual(["1.", "2.", "10."]);
  });

  it("detects single-char alpha markers", () => {
    const d = doc(["a. alpha", "b. bravo", "z. zulu"]);
    const matches = scanOrderedMarkers(d);
    expect(matches).toHaveLength(3);
    expect(matches.map((m) => m.markerText)).toEqual(["a.", "b.", "z."]);
  });

  it("detects short roman numeral markers", () => {
    const d = doc(["i. first", "ii. second", "iii. third", "iv. fourth"]);
    const matches = scanOrderedMarkers(d);
    expect(matches).toHaveLength(4);
    expect(matches.map((m) => m.markerText)).toEqual(["i.", "ii.", "iii.", "iv."]);
  });

  it("rejects multi-char alpha (avoids false positives)", () => {
    const d = doc(["eg. example", "etc. more text", "the. thing"]);
    const matches = scanOrderedMarkers(d);
    expect(matches).toHaveLength(0);
  });

  it("rejects roman-letter words that are not valid numerals", () => {
    const d = doc(["dim. not a marker", "mix. not either", "vim. nope", "mid. also not", "lid. no"]);
    const matches = scanOrderedMarkers(d);
    expect(matches).toHaveLength(0);
  });

  it("accepts valid roman numerals up to xxxix", () => {
    const d = doc(["ix. nine", "xiv. fourteen", "xxv. twentyfive", "xxxix. thirtynine"]);
    const matches = scanOrderedMarkers(d);
    expect(matches.map((m) => m.markerText)).toEqual(["ix.", "xiv.", "xxv.", "xxxix."]);
  });

  it("handles nested ordered lists", () => {
    const d = doc(["1. top", "    a. nested", "        i. deep"]);
    const matches = scanOrderedMarkers(d);
    expect(matches).toHaveLength(3);
    expect(matches.map((m) => m.markerText)).toEqual(["1.", "a.", "i."]);
  });

  it("skips non-ordered lines", () => {
    const d = doc(["# heading", "- unordered", "1. ordered", "paragraph"]);
    const matches = scanOrderedMarkers(d);
    expect(matches).toHaveLength(1);
    expect(matches[0].markerText).toBe("1.");
  });

  it("returns correct offsets for indented markers", () => {
    const d = doc(["    1. nested"]);
    const matches = scanOrderedMarkers(d);
    expect(matches).toHaveLength(1);
    expect(matches[0].markerFrom).toBe(4);
    expect(matches[0].markerTo).toBe(6); // "1." is 2 chars
  });

  it("requires space after dot", () => {
    const d = doc(["1.no space", "1. has space"]);
    const matches = scanOrderedMarkers(d);
    expect(matches).toHaveLength(1);
    expect(matches[0].lineNumber).toBe(2);
  });

  it("returns empty for empty document", () => {
    const d = doc([""]);
    expect(scanOrderedMarkers(d)).toHaveLength(0);
  });

  it("does not match bare dot-space at line start", () => {
    const d = doc([". not a marker"]);
    expect(scanOrderedMarkers(d)).toHaveLength(0);
  });
});

describe("buildOrderedDecorations", () => {
  it("produces decorations for all ordered list lines", () => {
    const d = doc(["1. line one", "2. line two", "3. line three"]);
    const decoSet = buildOrderedDecorations(d);
    const decos: { from: number; to: number }[] = [];
    const iter = decoSet.iter();
    while (iter.value) {
      decos.push({ from: iter.from, to: iter.to });
      iter.next();
    }
    expect(decos).toHaveLength(3);
    expect(decos[0].from).toBe(0);
    expect(decos[0].to).toBe(2);
  });
});
