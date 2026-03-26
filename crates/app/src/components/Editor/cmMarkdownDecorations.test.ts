import { describe, it, expect } from "vitest";
import { Text } from "@codemirror/state";
import { scanFencedBlocks, classifyLines, parseMarkdownTable, renderInlineMarkdown, TableWidget } from "./cmMarkdownDecorations";

function doc(s: string): Text {
  return Text.of(s.split("\n"));
}

describe("scanFencedBlocks", () => {
  it("finds a basic fenced code block with backticks", () => {
    const d = doc("before\n```\ncode\n```\nafter");
    const blocks = scanFencedBlocks(d);
    expect(blocks).toEqual([{ startLine: 2, endLine: 4, lang: undefined }]);
  });

  it("finds a fenced code block with tildes", () => {
    const d = doc("~~~\ncode\n~~~");
    const blocks = scanFencedBlocks(d);
    expect(blocks).toEqual([{ startLine: 1, endLine: 3, lang: undefined }]);
  });

  it("finds a fenced code block with language annotation", () => {
    const d = doc("```typescript\nconst x = 1;\n```");
    const blocks = scanFencedBlocks(d);
    expect(blocks).toEqual([{ startLine: 1, endLine: 3, lang: "typescript" }]);
  });

  it("handles nested fences with different lengths", () => {
    const d = doc("````\n```\ninner\n```\n````");
    const blocks = scanFencedBlocks(d);
    expect(blocks).toEqual([{ startLine: 1, endLine: 5, lang: undefined }]);
  });

  it("handles unclosed fence extending to doc end", () => {
    const d = doc("```\ncode\nmore code");
    const blocks = scanFencedBlocks(d);
    expect(blocks).toEqual([{ startLine: 1, endLine: 3, lang: undefined }]);
  });

  it("finds multiple fenced blocks", () => {
    const d = doc("```\na\n```\ntext\n~~~\nb\n~~~");
    const blocks = scanFencedBlocks(d);
    expect(blocks).toEqual([
      { startLine: 1, endLine: 3, lang: undefined },
      { startLine: 5, endLine: 7, lang: undefined },
    ]);
  });

  it("does not close backtick fence with tildes", () => {
    const d = doc("```\ncode\n~~~\nstill code\n```");
    const blocks = scanFencedBlocks(d);
    expect(blocks).toEqual([{ startLine: 1, endLine: 5, lang: undefined }]);
  });

  it("requires closing fence to be at least same length", () => {
    const d = doc("````\ncode\n```\nstill code\n````");
    const blocks = scanFencedBlocks(d);
    expect(blocks).toEqual([{ startLine: 1, endLine: 5, lang: undefined }]);
  });

  it("detects indented fences (up to 3 spaces)", () => {
    const d = doc("   ```mermaid\ngraph TD\n   ```");
    const blocks = scanFencedBlocks(d);
    expect(blocks).toEqual([{ startLine: 1, endLine: 3, lang: "mermaid" }]);
  });

  it("does not detect fence with 4+ spaces indent (code block)", () => {
    const d = doc("    ```\ncode\n    ```");
    const blocks = scanFencedBlocks(d);
    expect(blocks).toEqual([]);
  });
});

describe("classifyLines", () => {
  describe("horizontal rules", () => {
    it("detects --- as HR", () => {
      const d = doc("text\n---\nmore");
      const cls = classifyLines(d);
      expect(cls.hr).toEqual([2]);
    });

    it("detects *** as HR", () => {
      const d = doc("***");
      const cls = classifyLines(d);
      expect(cls.hr).toEqual([1]);
    });

    it("detects ___ as HR", () => {
      const d = doc("___");
      const cls = classifyLines(d);
      expect(cls.hr).toEqual([1]);
    });

    it("detects HR with trailing whitespace", () => {
      const d = doc("---   ");
      const cls = classifyLines(d);
      expect(cls.hr).toEqual([1]);
    });

    it("detects consecutive HRs", () => {
      const d = doc("---\n---");
      const cls = classifyLines(d);
      expect(cls.hr).toEqual([1, 2]);
    });

    it("does NOT detect HR inside fenced code block", () => {
      const d = doc("```\n---\n```");
      const cls = classifyLines(d);
      expect(cls.hr).toEqual([]);
    });

    it("does NOT detect --- with leading text", () => {
      const d = doc("text---");
      const cls = classifyLines(d);
      expect(cls.hr).toEqual([]);
    });
  });

  describe("blockquotes", () => {
    it("detects basic blockquote", () => {
      const d = doc("> hello");
      const cls = classifyLines(d);
      expect(cls.blockquote).toEqual([1]);
    });

    it("detects nested blockquote", () => {
      const d = doc("> > nested");
      const cls = classifyLines(d);
      expect(cls.blockquote).toEqual([1]);
    });

    it("detects empty blockquote line", () => {
      const d = doc(">");
      const cls = classifyLines(d);
      expect(cls.blockquote).toEqual([1]);
    });

    it("detects blockquote with checkbox", () => {
      const d = doc("> - [ ] task");
      const cls = classifyLines(d);
      expect(cls.blockquote).toEqual([1]);
    });

    it("detects multi-line blockquote", () => {
      const d = doc("> line 1\n> line 2\n> line 3");
      const cls = classifyLines(d);
      expect(cls.blockquote).toEqual([1, 2, 3]);
    });

    it("does NOT detect blockquote inside fenced code", () => {
      const d = doc("```\n> not a quote\n```");
      const cls = classifyLines(d);
      expect(cls.blockquote).toEqual([]);
    });
  });

  describe("fenced code blocks", () => {
    it("passes through to scanFencedBlocks", () => {
      const d = doc("```\ncode\n```");
      const cls = classifyLines(d);
      expect(cls.fencedBlocks).toEqual([{ startLine: 1, endLine: 3, lang: undefined }]);
    });
  });

  describe("table non-interference", () => {
    it("does not classify table delimiter row as HR", () => {
      // Table delimiter rows contain `---` but should NOT be classified as HR
      // because they are inside a table (handled by tree walk, not regex).
      // However, classifyLines only uses regex and doesn't know about tables,
      // so the `|---|---|` pattern won't match HR regex (has leading `|`).
      const d = doc("| a | b |\n|---|---|\n| 1 | 2 |");
      const cls = classifyLines(d);
      expect(cls.hr).toEqual([]);
    });

    it("does not classify pipe-only lines as blockquotes", () => {
      const d = doc("| col1 | col2 |\n|------|------|\n| val  | val  |");
      const cls = classifyLines(d);
      expect(cls.blockquote).toEqual([]);
    });
  });
});

describe("parseMarkdownTable", () => {
  it("parses a basic table", () => {
    const result = parseMarkdownTable([
      "| Name | Age |",
      "|------|-----|",
      "| Alice | 30 |",
      "| Bob | 25 |",
    ]);
    expect(result).not.toBeNull();
    expect(result!.headerCells).toEqual(["Name", "Age"]);
    expect(result!.alignments).toEqual(["left", "left"]);
    expect(result!.rows).toEqual([["Alice", "30"], ["Bob", "25"]]);
  });

  it("parses alignment from delimiter row", () => {
    const result = parseMarkdownTable([
      "| Left | Center | Right |",
      "|:-----|:------:|------:|",
      "| a | b | c |",
    ]);
    expect(result).not.toBeNull();
    expect(result!.alignments).toEqual(["left", "center", "right"]);
  });

  it("pads rows with fewer cells", () => {
    const result = parseMarkdownTable([
      "| A | B | C |",
      "|---|---|---|",
      "| 1 |",
    ]);
    expect(result).not.toBeNull();
    expect(result!.rows[0]).toEqual(["1", "", ""]);
  });

  it("trims rows with extra cells", () => {
    const result = parseMarkdownTable([
      "| A | B |",
      "|---|---|",
      "| 1 | 2 | 3 | 4 |",
    ]);
    expect(result).not.toBeNull();
    expect(result!.rows[0]).toEqual(["1", "2"]);
  });

  it("handles table with no data rows", () => {
    const result = parseMarkdownTable([
      "| Header |",
      "|--------|",
    ]);
    expect(result).not.toBeNull();
    expect(result!.headerCells).toEqual(["Header"]);
    expect(result!.rows).toEqual([]);
  });

  it("returns null for insufficient lines", () => {
    expect(parseMarkdownTable(["| A |"])).toBeNull();
    expect(parseMarkdownTable([])).toBeNull();
  });

  it("returns null for empty header", () => {
    expect(parseMarkdownTable(["", "|---|"])).toBeNull();
  });

  it("handles cells with inline formatting", () => {
    const result = parseMarkdownTable([
      "| Name | Score |",
      "|------|-------|",
      "| **Bold** | `100` |",
    ]);
    expect(result).not.toBeNull();
    expect(result!.rows[0]).toEqual(["**Bold**", "`100`"]);
  });

  it("preserves source text for eq comparison", () => {
    const lines = ["| A | B |", "|---|---|", "| 1 | 2 |"];
    const result = parseMarkdownTable(lines);
    expect(result!.sourceText).toBe(lines.join("\n"));
  });

  it("pads alignments when delimiter has fewer columns", () => {
    const result = parseMarkdownTable([
      "| A | B | C |",
      "|---|",
      "| 1 | 2 | 3 |",
    ]);
    expect(result).not.toBeNull();
    expect(result!.alignments).toEqual(["left", "left", "left"]);
  });

  it("handles single-column table", () => {
    const result = parseMarkdownTable([
      "| Item |",
      "|------|",
      "| Apple |",
      "| Banana |",
    ]);
    expect(result).not.toBeNull();
    expect(result!.headerCells).toEqual(["Item"]);
    expect(result!.rows).toEqual([["Apple"], ["Banana"]]);
  });

  it("handles escaped pipes in cells", () => {
    const result = parseMarkdownTable([
      "| Expression | Result |",
      "|------------|--------|",
      "| a \\| b | true |",
    ]);
    expect(result).not.toBeNull();
    expect(result!.rows[0]).toEqual(["a \\| b", "true"]);
  });

  it("rejects invalid delimiter row", () => {
    const result = parseMarkdownTable([
      "| A | B |",
      "| not a delimiter |",
      "| 1 | 2 |",
    ]);
    expect(result).toBeNull();
  });
});

describe("renderInlineMarkdown", () => {
  it("renders bold", () => {
    expect(renderInlineMarkdown("**hello**")).toBe("<strong>hello</strong>");
  });

  it("renders italic", () => {
    expect(renderInlineMarkdown("*hello*")).toBe("<em>hello</em>");
  });

  it("renders inline code", () => {
    expect(renderInlineMarkdown("`code`")).toBe("<code>code</code>");
  });

  it("escapes HTML entities", () => {
    expect(renderInlineMarkdown("<script>alert(1)</script>")).toBe(
      "&lt;script&gt;alert(1)&lt;/script&gt;"
    );
  });

  it("escapes HTML before applying inline markdown", () => {
    expect(renderInlineMarkdown('**<img src=x onerror="alert(1)">**')).toBe(
      "<strong>&lt;img src=x onerror=&quot;alert(1)&quot;&gt;</strong>"
    );
  });

  it("handles plain text without formatting", () => {
    expect(renderInlineMarkdown("hello world")).toBe("hello world");
  });
});

describe("scanFencedBlocks lang extraction for badge", () => {
  it("extracts multi-word info string (first word as lang)", () => {
    const d = doc("```javascript title=example\nconsole.log();\n```");
    const blocks = scanFencedBlocks(d);
    // Full info string is preserved; badge widget will display it
    expect(blocks[0].lang).toBe("javascript title=example");
  });

  it("returns undefined lang for bare fence", () => {
    const d = doc("```\nplain code\n```");
    expect(scanFencedBlocks(d)[0].lang).toBeUndefined();
  });

  it("extracts lang from tilde fence", () => {
    const d = doc("~~~python\nprint('hi')\n~~~");
    expect(scanFencedBlocks(d)[0].lang).toBe("python");
  });

  it("trims whitespace from lang", () => {
    const d = doc("```  rust  \nfn main() {}\n```");
    expect(scanFencedBlocks(d)[0].lang).toBe("rust");
  });
});

describe("TableWidget callout styling", () => {
  const sampleData = {
    headerCells: ["A", "B"],
    alignments: ["left" as const, "left" as const],
    rows: [["1", "2"]],
    sourceText: "| A | B |\n|---|---|\n| 1 | 2 |",
    isFormatted: true,
  };

  it("applies no callout styles when calloutColor is null", () => {
    const w = new TableWidget(sampleData, null);
    const dom = w.toDOM();
    expect(dom.style.borderLeft).toBe("");
    expect(dom.style.paddingLeft).toBe("");
    expect(dom.style.marginLeft).toBe("");
    expect(dom.style.background).toBe("");
  });

  it("applies callout border/background when calloutColor is set", () => {
    const w = new TableWidget(sampleData, "#17a2b8");
    const dom = w.toDOM();
    // JSDOM normalizes hex to rgb; check for "3px solid" and the normalized color
    expect(dom.style.borderLeft).toContain("3px solid");
    expect(dom.style.borderLeft).toContain("rgb(23, 162, 184)");
    expect(dom.style.paddingLeft).toBe("14px");
    expect(dom.style.marginLeft).toBe("6px");
    expect(dom.style.borderRight).not.toBe("");
    expect(dom.style.background).not.toBe("");
  });

  it("eq returns true when sourceText and calloutColor both match", () => {
    const a = new TableWidget(sampleData, "#17a2b8");
    const b = new TableWidget(sampleData, "#17a2b8");
    expect(a.eq(b)).toBe(true);
  });

  it("eq returns true when both calloutColors are null", () => {
    const a = new TableWidget(sampleData, null);
    const b = new TableWidget(sampleData, null);
    expect(a.eq(b)).toBe(true);
  });

  it("eq returns false when calloutColor differs (null vs color)", () => {
    const a = new TableWidget(sampleData, null);
    const b = new TableWidget(sampleData, "#17a2b8");
    expect(a.eq(b)).toBe(false);
  });

  it("eq returns false when calloutColor differs (color vs different color)", () => {
    const a = new TableWidget(sampleData, "#17a2b8");
    const b = new TableWidget(sampleData, "#e74c3c");
    expect(a.eq(b)).toBe(false);
  });
});
