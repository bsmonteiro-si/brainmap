import { describe, it, expect } from "vitest";
import { extractHeadings } from "./DocumentOutline";

describe("extractHeadings", () => {
  it("extracts headings with correct levels", () => {
    const text = "# Title\n\nSome text\n\n## Section\n\n### Subsection";
    const headings = extractHeadings(text);
    expect(headings).toHaveLength(3);
    expect(headings[0]).toMatchObject({ level: 1, text: "Title" });
    expect(headings[1]).toMatchObject({ level: 2, text: "Section" });
    expect(headings[2]).toMatchObject({ level: 3, text: "Subsection" });
  });

  it("tracks character positions", () => {
    const text = "# A\n## B";
    const headings = extractHeadings(text);
    expect(headings[0].from).toBe(0);
    expect(headings[1].from).toBe(4); // "# A\n" = 4 chars
  });

  it("skips headings inside fenced code blocks", () => {
    const text = "# Real\n```\n# Not a heading\n```\n## Also Real";
    const headings = extractHeadings(text);
    expect(headings).toHaveLength(2);
    expect(headings[0].text).toBe("Real");
    expect(headings[1].text).toBe("Also Real");
  });

  it("returns empty array for no headings", () => {
    expect(extractHeadings("Just some text\nwith no headings")).toHaveLength(0);
  });

  it("handles all heading levels", () => {
    const text = "# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6";
    const headings = extractHeadings(text);
    expect(headings).toHaveLength(6);
    expect(headings.map((h) => h.level)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("trims heading text", () => {
    const text = "# Title with trailing spaces   ";
    const headings = extractHeadings(text);
    expect(headings[0].text).toBe("Title with trailing spaces");
  });

  it("ignores lines without space after hash", () => {
    const text = "#NotAHeading\n# Real Heading";
    const headings = extractHeadings(text);
    expect(headings).toHaveLength(1);
    expect(headings[0].text).toBe("Real Heading");
  });
});
