import { describe, it, expect } from "vitest";
import { Text } from "@codemirror/state";
import { scanCheckboxes } from "./cmCheckboxDecorations";

function doc(s: string): Text {
  return Text.of(s.split("\n"));
}

describe("scanCheckboxes", () => {
  it("detects unchecked checkbox with dash", () => {
    const d = doc("- [ ] todo");
    const matches = scanCheckboxes(d);
    expect(matches).toHaveLength(1);
    expect(matches[0].checked).toBe(false);
    expect(matches[0].lineNumber).toBe(1);
  });

  it("detects checked checkbox with dash", () => {
    const d = doc("- [x] done");
    const matches = scanCheckboxes(d);
    expect(matches).toHaveLength(1);
    expect(matches[0].checked).toBe(true);
  });

  it("detects uppercase X", () => {
    const d = doc("- [X] done");
    const matches = scanCheckboxes(d);
    expect(matches).toHaveLength(1);
    expect(matches[0].checked).toBe(true);
  });

  it("detects checkbox with asterisk marker", () => {
    const d = doc("* [ ] task");
    const matches = scanCheckboxes(d);
    expect(matches).toHaveLength(1);
  });

  it("detects checkbox with plus marker", () => {
    const d = doc("+ [ ] task");
    const matches = scanCheckboxes(d);
    expect(matches).toHaveLength(1);
  });

  it("detects checkbox with numbered list", () => {
    const d = doc("1. [ ] first");
    const matches = scanCheckboxes(d);
    expect(matches).toHaveLength(1);
  });

  it("detects checkbox with numbered list using paren", () => {
    const d = doc("1) [ ] first");
    const matches = scanCheckboxes(d);
    expect(matches).toHaveLength(1);
  });

  it("detects indented checkbox", () => {
    const d = doc("  - [ ] nested");
    const matches = scanCheckboxes(d);
    expect(matches).toHaveLength(1);
  });

  it("computes correct bracket offsets", () => {
    const d = doc("- [ ] todo");
    const matches = scanCheckboxes(d);
    expect(matches[0].markerFrom).toBe(0);  // "-" starts at 0
    expect(matches[0].bracketFrom).toBe(2); // "- " is 2 chars
    expect(matches[0].bracketTo).toBe(5);   // "[ ]" is 3 chars
  });

  it("computes correct offsets for indented checkbox", () => {
    const d = doc("  - [ ] nested");
    const matches = scanCheckboxes(d);
    expect(matches[0].markerFrom).toBe(2);  // indent is 2, marker starts at 2
    expect(matches[0].bracketFrom).toBe(4); // "  - " is 4 chars
    expect(matches[0].bracketTo).toBe(7);
  });

  it("computes correct markerFrom for numbered list", () => {
    const d = doc("1. [ ] first");
    const matches = scanCheckboxes(d);
    expect(matches[0].markerFrom).toBe(0);
    expect(matches[0].bracketFrom).toBe(3); // "1. " is 3 chars
    expect(matches[0].bracketTo).toBe(6);
  });

  it("finds multiple checkboxes", () => {
    const d = doc("- [ ] a\n- [x] b\n- [ ] c");
    const matches = scanCheckboxes(d);
    expect(matches).toHaveLength(3);
    expect(matches[0].checked).toBe(false);
    expect(matches[1].checked).toBe(true);
    expect(matches[2].checked).toBe(false);
  });

  it("detects bare [] (no space inside) as unchecked", () => {
    const d = doc("- [] todo");
    const matches = scanCheckboxes(d);
    expect(matches).toHaveLength(1);
    expect(matches[0].checked).toBe(false);
    expect(matches[0].bracketFrom).toBe(2);
    expect(matches[0].bracketTo).toBe(4); // `[]` is 2 chars
  });

  it("does not match without list marker", () => {
    const d = doc("[ ] not a task");
    const matches = scanCheckboxes(d);
    expect(matches).toHaveLength(0);
  });

  it("does not match checkbox without space before bracket", () => {
    const d = doc("-[ ] missing space");
    const matches = scanCheckboxes(d);
    expect(matches).toHaveLength(0);
  });
});
