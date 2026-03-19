import { describe, it, expect } from "vitest";
import { remarkInlineSource } from "./remarkInlineSource";
import { unified } from "unified";
import remarkParse from "remark-parse";
import type { Root } from "mdast";

/** Parse markdown and run the plugin, returning the AST. */
function process(md: string): Root {
  const tree = unified().use(remarkParse).parse(md);
  remarkInlineSource()(tree);
  return tree;
}

/** Collect all HTML node values from the tree. */
function htmlNodes(tree: Root): string[] {
  const result: string[] = [];
  function walk(node: { type: string; value?: string; children?: unknown[] }) {
    if (node.type === "html" && node.value) result.push(node.value);
    if (node.children) for (const c of node.children as typeof node[]) walk(c);
  }
  walk(tree as unknown as Parameters<typeof walk>[0]);
  return result;
}

/** Check if any HTML node contains inline-source markup. */
function hasInlineSource(tree: Root): boolean {
  return htmlNodes(tree).some((v) => v.includes("inline-source"));
}

/** Check if any HTML node contains inline-example markup. */
function hasInlineExample(tree: Root): boolean {
  return htmlNodes(tree).some((v) => v.includes("inline-example"));
}

/** Check if any HTML node contains inline-math markup. */
function hasInlineMath(tree: Root): boolean {
  return htmlNodes(tree).some((v) => v.includes("inline-math"));
}

/** Check if any HTML node contains inline-attention markup. */
function hasInlineAttention(tree: Root): boolean {
  return htmlNodes(tree).some((v) => v.includes("inline-attention"));
}

describe("remarkInlineSource", () => {
  it("transforms a basic inline source citation", () => {
    const tree = process("Some text [!source Book of Why, Ch.1] more text.");
    expect(hasInlineSource(tree)).toBe(true);
    const html = htmlNodes(tree);
    expect(html[0]).toContain("inline-source-tag");
    expect(html[0]).toContain("Book of Why, Ch.1");
  });

  it("transforms multiple citations in one paragraph", () => {
    const tree = process("Text [!source A] middle [!source B] end.");
    const html = htmlNodes(tree);
    expect(html.length).toBeGreaterThanOrEqual(2);
  });

  it("does NOT transform inside fenced code blocks", () => {
    const tree = process("```\n[!source not a cite]\n```");
    expect(hasInlineSource(tree)).toBe(false);
  });

  it("does NOT transform inside inline code", () => {
    const tree = process("Text `[!source not a cite]` more.");
    expect(hasInlineSource(tree)).toBe(false);
  });

  it("does NOT match empty content [!source ]", () => {
    const tree = process("Text [!source ] end.");
    expect(hasInlineSource(tree)).toBe(false);
  });

  it("does NOT match whitespace-only [!source   ]", () => {
    const tree = process("Text [!source   ] end.");
    expect(hasInlineSource(tree)).toBe(false);
  });

  it("does NOT match without space after !source", () => {
    const tree = process("Text [!sourcetext] end.");
    expect(hasInlineSource(tree)).toBe(false);
  });

  it("does NOT match unclosed [!source no end", () => {
    const tree = process("Text [!source no closing bracket");
    expect(hasInlineSource(tree)).toBe(false);
  });

  it("escapes HTML in citation content", () => {
    // Use angle brackets that won't be parsed as HTML by remark
    const tree = process('[!source text with "quotes" & ampersand]');
    const html = htmlNodes(tree);
    expect(html[0]).toContain("&amp;");
    expect(html[0]).toContain("&quot;");
  });

  it("preserves surrounding paragraph text", () => {
    const tree = process("Before [!source citation] after.");
    const para = tree.children[0];
    expect(para.type).toBe("paragraph");
    const children = (para as { children: { type: string; value?: string }[] }).children;
    expect(children[0]).toEqual({ type: "text", value: "Before " });
    expect(children[children.length - 1]).toEqual({ type: "text", value: " after." });
  });

  it("works inside headings", () => {
    const tree = process("## Title [!source ref here]");
    expect(hasInlineSource(tree)).toBe(true);
  });

  it("works inside emphasis", () => {
    const tree = process("*italic [!source ref] text*");
    expect(hasInlineSource(tree)).toBe(true);
  });

  it("works inside list items", () => {
    const tree = process("- Item [!source ref here]");
    expect(hasInlineSource(tree)).toBe(true);
    const html = htmlNodes(tree);
    expect(html[0]).toContain("ref here");
  });
});

describe("remarkInlineSource – inline example", () => {
  it("transforms a basic inline example", () => {
    const tree = process("Text [!example fibonacci sequence] more.");
    expect(hasInlineExample(tree)).toBe(true);
    const html = htmlNodes(tree);
    expect(html[0]).toContain("inline-example-tag");
    expect(html[0]).toContain("fibonacci sequence");
  });

  it("transforms mixed source and example in one paragraph", () => {
    const tree = process("Text [!source A] and [!example B] end.");
    const html = htmlNodes(tree);
    expect(html.some((v) => v.includes("inline-source"))).toBe(true);
    expect(html.some((v) => v.includes("inline-example"))).toBe(true);
  });

  it("does NOT match empty content [!example ]", () => {
    const tree = process("Text [!example ] end.");
    expect(hasInlineExample(tree)).toBe(false);
  });

  it("does NOT match without space after !example", () => {
    const tree = process("Text [!exampletext] end.");
    expect(hasInlineExample(tree)).toBe(false);
  });

  it("does NOT transform inside fenced code blocks", () => {
    const tree = process("```\n[!example not a cite]\n```");
    expect(hasInlineExample(tree)).toBe(false);
  });

  it("does NOT transform inside inline code", () => {
    const tree = process("Text `[!example not a cite]` more.");
    expect(hasInlineExample(tree)).toBe(false);
  });

  it("works inside headings", () => {
    const tree = process("## Title [!example ref here]");
    expect(hasInlineExample(tree)).toBe(true);
  });

  it("works inside list items", () => {
    const tree = process("- Item [!example quicksort]");
    expect(hasInlineExample(tree)).toBe(true);
    const html = htmlNodes(tree);
    expect(html[0]).toContain("quicksort");
  });
});

describe("remarkInlineSource – inline math", () => {
  it("transforms a basic inline math expression", () => {
    const tree = process("Text [!math E=mc^2] more.");
    expect(hasInlineMath(tree)).toBe(true);
    const html = htmlNodes(tree);
    expect(html[0]).toContain("inline-math-tag");
    // KaTeX renders to .katex class
    expect(html[0]).toContain("katex");
  });

  it("does NOT match empty content [!math ]", () => {
    const tree = process("Text [!math ] end.");
    expect(hasInlineMath(tree)).toBe(false);
  });

  it("does NOT match without space after !math", () => {
    const tree = process("Text [!mathtext] end.");
    expect(hasInlineMath(tree)).toBe(false);
  });

  it("does NOT transform inside fenced code blocks", () => {
    const tree = process("```\n[!math x^2]\n```");
    expect(hasInlineMath(tree)).toBe(false);
  });

  it("works inside headings", () => {
    const tree = process("## Title [!math \\alpha]");
    expect(hasInlineMath(tree)).toBe(true);
  });

  it("works alongside source and example", () => {
    const tree = process("Text [!source A] and [!math x] and [!example B].");
    const html = htmlNodes(tree);
    expect(html.some((v) => v.includes("inline-source"))).toBe(true);
    expect(html.some((v) => v.includes("inline-math"))).toBe(true);
    expect(html.some((v) => v.includes("inline-example"))).toBe(true);
  });
});

describe("remarkInlineSource – inline attention", () => {
  it("transforms a basic inline attention citation", () => {
    const tree = process("Text [!attention check this] more.");
    expect(hasInlineAttention(tree)).toBe(true);
    const html = htmlNodes(tree);
    expect(html[0]).toContain("inline-attention-tag");
    expect(html[0]).toContain("check this");
  });

  it("transforms mixed attention with source and example", () => {
    const tree = process("Text [!source A] and [!attention B] and [!example C].");
    const html = htmlNodes(tree);
    expect(html.some((v) => v.includes("inline-source"))).toBe(true);
    expect(html.some((v) => v.includes("inline-attention"))).toBe(true);
    expect(html.some((v) => v.includes("inline-example"))).toBe(true);
  });

  it("does NOT match empty content [!attention ]", () => {
    const tree = process("Text [!attention ] end.");
    expect(hasInlineAttention(tree)).toBe(false);
  });

  it("does NOT match without space after !attention", () => {
    const tree = process("Text [!attentiontext] end.");
    expect(hasInlineAttention(tree)).toBe(false);
  });

  it("does NOT transform inside fenced code blocks", () => {
    const tree = process("```\n[!attention not a cite]\n```");
    expect(hasInlineAttention(tree)).toBe(false);
  });

  it("does NOT transform inside inline code", () => {
    const tree = process("Text `[!attention not a cite]` more.");
    expect(hasInlineAttention(tree)).toBe(false);
  });

  it("works inside headings", () => {
    const tree = process("## Title [!attention important note]");
    expect(hasInlineAttention(tree)).toBe(true);
  });

  it("works inside list items", () => {
    const tree = process("- Item [!attention watch out]");
    expect(hasInlineAttention(tree)).toBe(true);
    const html = htmlNodes(tree);
    expect(html[0]).toContain("watch out");
  });
});
