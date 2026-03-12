import { describe, it, expect } from "vitest";
import { fuzzyMatch, highlightFuzzyMatch } from "./fuzzyMatch";

describe("fuzzyMatch", () => {
  it("returns consecutive indices for exact substring", () => {
    expect(fuzzyMatch("causal", "Causal Inference")).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("returns sparse indices for non-adjacent chars", () => {
    const result = fuzzyMatch("ci", "Causal Inference");
    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);
    // 'c' at 0, 'i' at 7
    expect(result![0]).toBe(0);
    expect(result![1]).toBe(7);
  });

  it("is case insensitive", () => {
    expect(fuzzyMatch("CI", "causal inference")).not.toBeNull();
    expect(fuzzyMatch("ci", "CAUSAL INFERENCE")).not.toBeNull();
  });

  it("returns null when no match", () => {
    expect(fuzzyMatch("xyz", "hello")).toBeNull();
  });

  it("returns empty array for empty query (matches everything)", () => {
    expect(fuzzyMatch("", "anything")).toEqual([]);
  });

  it("returns null when query is longer than text", () => {
    expect(fuzzyMatch("longer query", "short")).toBeNull();
  });

  it("treats special regex characters as literals", () => {
    expect(fuzzyMatch(".", "a.b")).not.toBeNull();
    expect(fuzzyMatch("[", "a[b")).not.toBeNull();
    // '.' should match the literal dot, not any character
    const result = fuzzyMatch(".", "abc");
    expect(result).toBeNull();
  });
});

describe("highlightFuzzyMatch", () => {
  it("produces mark and span segments for matched indices", () => {
    const nodes = highlightFuzzyMatch("Causal", [0, 1]);
    // Should be: <mark>Ca</mark><span>usal</span>
    expect(nodes).toHaveLength(2);
    expect((nodes[0] as any).type).toBe("mark");
    expect((nodes[0] as any).props.children).toBe("Ca");
    expect((nodes[1] as any).type).toBe("span");
    expect((nodes[1] as any).props.children).toBe("usal");
  });

  it("returns single span for empty indices", () => {
    const nodes = highlightFuzzyMatch("Hello", []);
    expect(nodes).toHaveLength(1);
    expect((nodes[0] as any).type).toBe("span");
    expect((nodes[0] as any).props.children).toBe("Hello");
  });

  it("handles non-consecutive indices", () => {
    const nodes = highlightFuzzyMatch("abcde", [0, 3]);
    // <mark>a</mark><span>bc</span><mark>d</mark><span>e</span>
    expect(nodes).toHaveLength(4);
    expect((nodes[0] as any).props.children).toBe("a");
    expect((nodes[1] as any).props.children).toBe("bc");
    expect((nodes[2] as any).props.children).toBe("d");
    expect((nodes[3] as any).props.children).toBe("e");
  });
});
