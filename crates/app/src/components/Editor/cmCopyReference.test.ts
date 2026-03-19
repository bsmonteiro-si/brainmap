import { describe, it, expect } from "vitest";
import { buildReference } from "./cmCopyReference";

function lineAt(lines: number[]) {
  // lines[i] = start offset of line i+1
  return (pos: number) => {
    for (let i = lines.length - 1; i >= 0; i--) {
      if (pos >= lines[i]) return { number: i + 1 };
    }
    return { number: 1 };
  };
}

describe("buildReference", () => {
  const path = "/Users/me/notes/causality.md";

  it("returns path:line for single-line selection", () => {
    // Line 1 starts at 0, line 2 at 20, line 3 at 40
    const la = lineAt([0, 20, 40]);
    expect(buildReference(path, 5, 15, la)).toBe(`"${path}#L1"`);
  });

  it("returns path:start-end for multi-line selection", () => {
    const la = lineAt([0, 20, 40, 60]);
    expect(buildReference(path, 5, 45, la)).toBe(`"${path}#L1-3"`);
  });

  it("handles selection spanning two lines", () => {
    const la = lineAt([0, 20, 40]);
    expect(buildReference(path, 10, 25, la)).toBe(`"${path}#L1-2"`);
  });

  it("handles selection on last line only", () => {
    const la = lineAt([0, 20, 40]);
    expect(buildReference(path, 42, 48, la)).toBe(`"${path}#L3"`);
  });

  it("handles selection from line 2 to line 4", () => {
    const la = lineAt([0, 10, 20, 30, 40]);
    expect(buildReference(path, 12, 35, la)).toBe(`"${path}#L2-4"`);
  });
});
