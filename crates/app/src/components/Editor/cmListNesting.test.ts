import { describe, it, expect } from "vitest";
import { toRoman, fromRoman, markerForKind, parseIndex, kindForDepth, findPreviousSiblingIndex } from "./cmListNesting";

describe("toRoman", () => {
  it("converts basic numbers", () => {
    expect(toRoman(1)).toBe("i");
    expect(toRoman(2)).toBe("ii");
    expect(toRoman(3)).toBe("iii");
    expect(toRoman(4)).toBe("iv");
    expect(toRoman(5)).toBe("v");
    expect(toRoman(9)).toBe("ix");
    expect(toRoman(10)).toBe("x");
    expect(toRoman(14)).toBe("xiv");
  });
});

describe("fromRoman", () => {
  it("converts roman numerals back to numbers", () => {
    expect(fromRoman("i")).toBe(1);
    expect(fromRoman("iv")).toBe(4);
    expect(fromRoman("ix")).toBe(9);
    expect(fromRoman("xiv")).toBe(14);
  });

  it("round-trips with toRoman", () => {
    for (let i = 1; i <= 20; i++) {
      expect(fromRoman(toRoman(i))).toBe(i);
    }
  });
});

describe("markerForKind", () => {
  it("generates numeric markers", () => {
    expect(markerForKind("numeric", 1)).toBe("1");
    expect(markerForKind("numeric", 5)).toBe("5");
  });

  it("generates alpha markers", () => {
    expect(markerForKind("alpha", 1)).toBe("a");
    expect(markerForKind("alpha", 2)).toBe("b");
    expect(markerForKind("alpha", 26)).toBe("z");
  });

  it("generates roman markers", () => {
    expect(markerForKind("roman", 1)).toBe("i");
    expect(markerForKind("roman", 4)).toBe("iv");
  });
});

describe("parseIndex", () => {
  it("parses numeric markers", () => {
    expect(parseIndex("1", "numeric")).toBe(1);
    expect(parseIndex("42", "numeric")).toBe(42);
  });

  it("parses single alpha markers", () => {
    expect(parseIndex("a", "alpha")).toBe(1);
    expect(parseIndex("b", "alpha")).toBe(2);
    expect(parseIndex("z", "alpha")).toBe(26);
  });

  it("parses i as alpha when expected kind is alpha", () => {
    expect(parseIndex("i", "alpha")).toBe(9);
  });

  it("parses i as roman when expected kind is roman", () => {
    expect(parseIndex("i", "roman")).toBe(1);
  });

  it("parses v as alpha (22) vs roman (5)", () => {
    expect(parseIndex("v", "alpha")).toBe(22);
    expect(parseIndex("v", "roman")).toBe(5);
  });
});

describe("kindForDepth", () => {
  it("cycles through numeric → alpha → roman", () => {
    expect(kindForDepth(0)).toBe("numeric");
    expect(kindForDepth(1)).toBe("alpha");
    expect(kindForDepth(2)).toBe("roman");
    expect(kindForDepth(3)).toBe("numeric");
    expect(kindForDepth(4)).toBe("alpha");
  });
});

describe("marker cycle integration", () => {
  it("Tab always starts fresh at 1: 3. → a. (not c.)", () => {
    // Regardless of current index, new depth starts at 1
    const newKind = kindForDepth(1);
    expect(markerForKind(newKind, 1)).toBe("a");
  });

  it("Tab on any alpha → i. at depth 2", () => {
    const newKind = kindForDepth(2);
    expect(markerForKind(newKind, 1)).toBe("i");
  });

  it("Tab on roman (depth 2) → 1. at depth 3", () => {
    const newKind = kindForDepth(3);
    expect(markerForKind(newKind, 1)).toBe("1");
  });

  it("Shift+Tab from a. (depth 1) back to 1. at depth 0", () => {
    const newKind = kindForDepth(0);
    expect(markerForKind(newKind, 1)).toBe("1");
  });

  it("Shift+Tab from iv. (depth 2) back to a. at depth 1", () => {
    const newKind = kindForDepth(1);
    expect(markerForKind(newKind, 1)).toBe("a");
  });

  it("Shift+Tab continues numbering from previous sibling", () => {
    // Simulate: 1. / 2. / 3. / ____a. cursor ← Shift+Tab should produce 4.
    const doc = {
      lines: 4,
      line(n: number) {
        return [
          { text: "1. first" },
          { text: "2. second" },
          { text: "3. third" },
          { text: "    a. nested" },
        ][n - 1];
      },
    };
    // Line 4 is at depth 1, outdenting to depth 0
    expect(findPreviousSiblingIndex(doc, 4, 0)).toBe(3);
    // So new index = 3 + 1 = 4
  });

  it("Shift+Tab with no previous sibling starts at 1", () => {
    const doc = {
      lines: 1,
      line(n: number) {
        return [{ text: "    a. only item" }][n - 1];
      },
    };
    expect(findPreviousSiblingIndex(doc, 1, 0)).toBe(0);
    // So new index = 0 + 1 = 1
  });

  it("Shift+Tab skips deeper items to find sibling", () => {
    // 1. / ____a. / ________i. / ____b. cursor ← Shift+Tab should produce 2.
    const doc = {
      lines: 4,
      line(n: number) {
        return [
          { text: "1. first" },
          { text: "    a. nested" },
          { text: "        i. deep" },
          { text: "    b. cursor here" },
        ][n - 1];
      },
    };
    expect(findPreviousSiblingIndex(doc, 4, 0)).toBe(1);
  });

  it("multi-char roman numerals match the regex", () => {
    const re = /^(\s*)(\d+|[a-z]+)\.\s/;
    expect("    iv. item".match(re)?.[2]).toBe("iv");
    expect("    iii. item".match(re)?.[2]).toBe("iii");
    expect("    xiv. item".match(re)?.[2]).toBe("xiv");
  });
});
