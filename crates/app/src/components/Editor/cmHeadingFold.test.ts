import { describe, it, expect } from "vitest";
import { computeHeadingFoldRange } from "./cmHeadingFold";
import { Text } from "@codemirror/state";

function makeDoc(lines: string[]): Text {
  return Text.of(lines);
}

describe("computeHeadingFoldRange", () => {
  it("folds from heading to next heading at same level", () => {
    const doc = makeDoc(["# A", "content", "# B"]);
    const result = computeHeadingFoldRange(doc, 1);
    expect(result).toEqual({ from: doc.line(1).to, to: doc.line(2).to });
  });

  it("folds from heading to next heading at higher level", () => {
    const doc = makeDoc(["## A", "content", "# B"]);
    const result = computeHeadingFoldRange(doc, 1);
    expect(result).toEqual({ from: doc.line(1).to, to: doc.line(2).to });
  });

  it("folds to end of document when no next heading", () => {
    const doc = makeDoc(["# A", "line 1", "line 2"]);
    const result = computeHeadingFoldRange(doc, 1);
    expect(result).toEqual({ from: doc.line(1).to, to: doc.line(3).to });
  });

  it("does not fold past same-level heading but includes deeper headings", () => {
    const doc = makeDoc(["# A", "## B", "content", "# C"]);
    const result = computeHeadingFoldRange(doc, 1);
    expect(result).toEqual({ from: doc.line(1).to, to: doc.line(3).to });
  });

  it("returns null for non-heading line", () => {
    const doc = makeDoc(["not a heading", "# A"]);
    expect(computeHeadingFoldRange(doc, 1)).toBeNull();
  });

  it("returns null when heading is immediately followed by same-level heading", () => {
    const doc = makeDoc(["# A", "# B"]);
    expect(computeHeadingFoldRange(doc, 1)).toBeNull();
  });

  it("skips headings inside fenced code blocks", () => {
    const doc = makeDoc(["# A", "```", "# fake", "```", "content", "# B"]);
    const result = computeHeadingFoldRange(doc, 1);
    // Should fold from # A to content (line 5), skipping the fake heading in code
    expect(result).toEqual({ from: doc.line(1).to, to: doc.line(5).to });
  });

  it("skips trailing blank lines", () => {
    const doc = makeDoc(["# A", "content", "", "", "# B"]);
    const result = computeHeadingFoldRange(doc, 1);
    expect(result).toEqual({ from: doc.line(1).to, to: doc.line(2).to });
  });

  it("handles all heading levels", () => {
    const doc = makeDoc(["### A", "content", "### B"]);
    const result = computeHeadingFoldRange(doc, 1);
    expect(result).toEqual({ from: doc.line(1).to, to: doc.line(2).to });
  });
});
