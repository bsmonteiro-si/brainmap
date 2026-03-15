import { describe, it, expect } from "vitest";
import { formatTable, formatMarkdownTables, isTableFormatted } from "./tableFormatter";

describe("formatTable", () => {
  it("aligns uneven columns", () => {
    const result = formatTable([
      "| Name|Score|",
      "|---|---|",
      "|Alice|100|",
      "|Bob|25|",
    ]);
    expect(result).toEqual([
      "| Name  | Score |",
      "| ----- | ----- |",
      "| Alice | 100   |",
      "| Bob   | 25    |",
    ]);
  });

  it("preserves center alignment", () => {
    const result = formatTable([
      "| A | B |",
      "|:---:|---|",
      "| x | y |",
    ]);
    expect(result[1]).toBe("| :-: | --- |");
  });

  it("preserves right alignment", () => {
    const result = formatTable([
      "| A | B |",
      "|---:|---|",
      "| x | y |",
    ]);
    expect(result[1]).toBe("| --: | --- |");
  });

  it("right-aligns cell content", () => {
    const result = formatTable([
      "| Score |",
      "|------:|",
      "| 5 |",
    ]);
    expect(result[2]).toBe("|     5 |");
  });

  it("center-aligns cell content", () => {
    const result = formatTable([
      "| Header |",
      "|:------:|",
      "| x |",
    ]);
    expect(result[2]).toBe("|   x    |");
  });

  it("pads rows with fewer cells", () => {
    const result = formatTable([
      "| A | B | C |",
      "|---|---|---|",
      "| 1 |",
    ]);
    expect(result[2]).toBe("| 1   |     |     |");
  });

  it("handles empty cells", () => {
    const result = formatTable([
      "| A | B |",
      "|---|---|",
      "| | val |",
    ]);
    expect(result[2]).toBe("|     | val |");
  });

  it("handles single-column table", () => {
    const result = formatTable([
      "| Item |",
      "|------|",
      "| Apple |",
      "| Banana |",
    ]);
    expect(result).toEqual([
      "| Item   |",
      "| ------ |",
      "| Apple  |",
      "| Banana |",
    ]);
  });

  it("handles table with no data rows", () => {
    const result = formatTable([
      "| A | B |",
      "|---|---|",
    ]);
    expect(result).toEqual([
      "| A   | B   |",
      "| --- | --- |",
    ]);
  });

  it("preserves inline formatting in cells", () => {
    const result = formatTable([
      "| Name | Score |",
      "|------|-------|",
      "| **Total** | `100` |",
    ]);
    expect(result[2]).toBe("| **Total** | `100` |");
  });

  it("returns original lines for invalid table", () => {
    const lines = ["| A |", "not a delimiter"];
    expect(formatTable(lines)).toEqual(lines);
  });

  it("returns original lines for too few lines", () => {
    const lines = ["| A |"];
    expect(formatTable(lines)).toEqual(lines);
  });

  it("ensures minimum 3-char column width", () => {
    const result = formatTable([
      "| A | B |",
      "|---|---|",
      "| x | y |",
    ]);
    expect(result[0]).toBe("| A   | B   |");
    expect(result[1]).toBe("| --- | --- |");
  });

  it("handles escaped pipes in cells", () => {
    const result = formatTable([
      "| Expression | Result |",
      "|------------|--------|",
      "| a \\| b | true |",
    ]);
    // Escaped pipe should be preserved (backslash kept)
    expect(result[2]).toContain("a \\| b");
    // The escaped pipe looks like a pipe when split naively, but the backslash marks it as literal
    expect(result[2]).toMatch(/^\| a \\\| b\s+\| true\s+\|$/);
  });
});

describe("isTableFormatted", () => {
  it("returns true for already formatted table", () => {
    const lines = formatTable([
      "| Name | Score |",
      "|------|-------|",
      "| Alice | 100 |",
    ]);
    expect(isTableFormatted(lines)).toBe(true);
  });

  it("returns false for unformatted table", () => {
    const lines = [
      "| Name|Score|",
      "|---|---|",
      "|Alice|100|",
    ];
    expect(isTableFormatted(lines)).toBe(false);
  });
});

describe("formatMarkdownTables", () => {
  it("formats a table within surrounding text", () => {
    const input = "# Header\n\n| A|B|\n|---|---|\n|1|2|\n\nSome text.";
    const result = formatMarkdownTables(input);
    expect(result).toContain("| A   | B   |");
    expect(result).toContain("| 1   | 2   |");
    expect(result).toContain("# Header");
    expect(result).toContain("Some text.");
  });

  it("formats multiple tables", () => {
    const input = "| A|B|\n|---|---|\n|1|2|\n\nText\n\n| X|Y|Z|\n|---|---|---|\n|a|b|c|";
    const result = formatMarkdownTables(input);
    expect(result).toContain("| A   | B   |");
    expect(result).toContain("| X   | Y   | Z   |");
  });

  it("preserves non-table content unchanged", () => {
    const input = "# Title\n\nSome paragraph.\n\n- list item";
    expect(formatMarkdownTables(input)).toBe(input);
  });

  it("does not format pipe lines without valid delimiter", () => {
    const input = "| not a table |\n| still not |";
    expect(formatMarkdownTables(input)).toBe(input);
  });

  it("handles document with only a table", () => {
    const input = "| A|B|\n|---|---|\n|1|2|";
    const result = formatMarkdownTables(input);
    expect(result).toContain("| A   | B   |");
    expect(result).toContain("| 1   | 2   |");
  });

  it("does not format tables inside fenced code blocks", () => {
    const input = "```\n| A|B|\n|---|---|\n|1|2|\n```";
    expect(formatMarkdownTables(input)).toBe(input);
  });

  it("does not format tables inside tilde fenced code blocks", () => {
    const input = "~~~\n| A|B|\n|---|---|\n|1|2|\n~~~";
    expect(formatMarkdownTables(input)).toBe(input);
  });

  it("formats tables outside code blocks but not inside", () => {
    const input = "| A|B|\n|---|---|\n|1|2|\n\n```\n| X|Y|\n|---|---|\n|3|4|\n```";
    const result = formatMarkdownTables(input);
    expect(result).toContain("| A   | B   |");
    expect(result).toContain("| X|Y|"); // inside code block — unchanged
  });
});
