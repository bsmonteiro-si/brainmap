import { describe, it, expect } from "vitest";
import { Text } from "@codemirror/state";
import { scanFencedBlocks } from "./cmMarkdownDecorations";
import { MermaidWidget, svgCache } from "./cmMermaidDecorations";

function doc(s: string): Text {
  return Text.of(s.split("\n"));
}

describe("scanFencedBlocks lang extraction", () => {
  it("extracts language identifier from opening fence", () => {
    const d = doc("```mermaid\ngraph TD\n```");
    const blocks = scanFencedBlocks(d);
    expect(blocks).toEqual([{ startLine: 1, endLine: 3, lang: "mermaid" }]);
  });

  it("extracts typescript language", () => {
    const d = doc("```typescript\nconst x = 1;\n```");
    const blocks = scanFencedBlocks(d);
    expect(blocks[0].lang).toBe("typescript");
  });

  it("returns undefined lang for bare fence", () => {
    const d = doc("```\ncode\n```");
    const blocks = scanFencedBlocks(d);
    expect(blocks[0].lang).toBeUndefined();
  });

  it("returns undefined lang for tilde fence without lang", () => {
    const d = doc("~~~\ncode\n~~~");
    const blocks = scanFencedBlocks(d);
    expect(blocks[0].lang).toBeUndefined();
  });

  it("extracts lang from tilde fence", () => {
    const d = doc("~~~mermaid\ngraph LR\n~~~");
    const blocks = scanFencedBlocks(d);
    expect(blocks[0].lang).toBe("mermaid");
  });

  it("trims whitespace from language identifier", () => {
    const d = doc("```  mermaid  \ngraph TD\n```");
    const blocks = scanFencedBlocks(d);
    expect(blocks[0].lang).toBe("mermaid");
  });

  it("extracts lang for unclosed fence", () => {
    const d = doc("```mermaid\ngraph TD");
    const blocks = scanFencedBlocks(d);
    expect(blocks[0].lang).toBe("mermaid");
  });

  it("handles multiple blocks with different langs", () => {
    const d = doc("```mermaid\ngraph TD\n```\n```typescript\nconst x = 1;\n```");
    const blocks = scanFencedBlocks(d);
    expect(blocks[0].lang).toBe("mermaid");
    expect(blocks[1].lang).toBe("typescript");
  });
});

describe("MermaidWidget", () => {
  it("eq returns true for same source", () => {
    const a = new MermaidWidget("graph TD", { svg: "<svg/>" }, null);
    const b = new MermaidWidget("graph TD", { svg: "<svg/>" }, null);
    expect(a.eq(b)).toBe(true);
  });

  it("eq returns false for different source", () => {
    const a = new MermaidWidget("graph TD", { svg: "<svg/>" }, null);
    const b = new MermaidWidget("graph LR", { svg: "<svg/>" }, null);
    expect(a.eq(b)).toBe(false);
  });

  it("eq returns false when cache state differs (loading vs rendered)", () => {
    const a = new MermaidWidget("graph TD", undefined, null);
    const b = new MermaidWidget("graph TD", { svg: "<svg/>" }, null);
    expect(a.eq(b)).toBe(false);
  });

  it("eq returns false when cache state differs (svg vs error)", () => {
    const a = new MermaidWidget("graph TD", { svg: "<svg/>" }, null);
    const b = new MermaidWidget("graph TD", { error: "Parse error" }, null);
    expect(a.eq(b)).toBe(false);
  });

  it("eq returns true when both have same error", () => {
    const a = new MermaidWidget("bad", { error: "Parse error" }, null);
    const b = new MermaidWidget("bad", { error: "Parse error" }, null);
    expect(a.eq(b)).toBe(true);
  });

  it("eq returns false when callout color differs", () => {
    const a = new MermaidWidget("graph TD", { svg: "<svg/>" }, "#4a9eff");
    const b = new MermaidWidget("graph TD", { svg: "<svg/>" }, null);
    expect(a.eq(b)).toBe(false);
  });

  it("eq returns true when callout color matches", () => {
    const a = new MermaidWidget("graph TD", { svg: "<svg/>" }, "#17a2b8");
    const b = new MermaidWidget("graph TD", { svg: "<svg/>" }, "#17a2b8");
    expect(a.eq(b)).toBe(true);
  });

  it("applies callout border styles in toDOM when calloutColor set", () => {
    const w = new MermaidWidget("graph TD", undefined, "#17a2b8");
    const dom = w.toDOM();
    expect(dom.style.borderLeft).toContain("3px solid");
    expect(dom.style.paddingLeft).toBe("14px");
  });

  it("has estimatedHeight of 200", () => {
    const w = new MermaidWidget("graph TD", undefined, null);
    expect(w.estimatedHeight).toBe(200);
  });

  it("renders loading state when no cache", () => {
    const w = new MermaidWidget("graph TD", undefined, null);
    const dom = w.toDOM();
    expect(dom.querySelector(".cm-mermaid-loading")).not.toBeNull();
  });

  it("renders error state", () => {
    const w = new MermaidWidget("invalid", { error: "Parse error" }, null);
    const dom = w.toDOM();
    const errorEl = dom.querySelector(".cm-mermaid-error");
    expect(errorEl).not.toBeNull();
    expect(errorEl!.textContent).toContain("Parse error");
  });

  it("renders SVG when cached", () => {
    const w = new MermaidWidget("graph TD", { svg: '<svg class="test-svg"></svg>' }, null);
    const dom = w.toDOM();
    expect(dom.querySelector("svg.test-svg")).not.toBeNull();
  });

  it("escapes HTML in error messages", () => {
    const w = new MermaidWidget("bad", { error: '<script>alert("xss")</script>' }, null);
    const dom = w.toDOM();
    const errorEl = dom.querySelector(".cm-mermaid-error");
    expect(errorEl!.innerHTML).not.toContain("<script>");
    expect(errorEl!.innerHTML).toContain("&lt;script&gt;");
  });
});

describe("svgCache", () => {
  it("is a Map", () => {
    expect(svgCache).toBeInstanceOf(Map);
  });
});
