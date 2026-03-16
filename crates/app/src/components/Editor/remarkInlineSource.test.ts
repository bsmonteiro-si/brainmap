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
