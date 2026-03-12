import { describe, it, expect } from "vitest";
import { extractLinkAtPos } from "./cmLinkNavigation";

describe("extractLinkAtPos", () => {
  it("returns URL when cursor is on the label", () => {
    const line = "See [Galton](./Francis Galton.md) for details";
    // cursor on 'G' in 'Galton' (index 5)
    expect(extractLinkAtPos(line, 5)).toBe("./Francis Galton.md");
  });

  it("returns URL when cursor is on the URL part", () => {
    const line = "See [Galton](./Francis Galton.md) for details";
    // cursor inside the URL (index 15)
    expect(extractLinkAtPos(line, 15)).toBe("./Francis Galton.md");
  });

  it("returns null when cursor is outside any link", () => {
    const line = "See [Galton](./Francis Galton.md) for details";
    // cursor on 'f' in 'for' (index 34)
    expect(extractLinkAtPos(line, 34)).toBeNull();
  });

  it("returns null when line has no links", () => {
    expect(extractLinkAtPos("Just some plain text", 5)).toBeNull();
  });

  it("returns correct link when multiple links on same line", () => {
    const line = "[A](a.md) and [B](b.md)";
    // cursor on 'B' label (index 15)
    expect(extractLinkAtPos(line, 15)).toBe("b.md");
    // cursor on 'A' label (index 1)
    expect(extractLinkAtPos(line, 1)).toBe("a.md");
  });

  it("handles links with spaces in path", () => {
    const line = "[Pearl](./Judea Pearl.md)";
    expect(extractLinkAtPos(line, 10)).toBe("./Judea Pearl.md");
  });

  it("handles URL-encoded paths", () => {
    const line = "[Pearl](./Judea%20Pearl.md)";
    expect(extractLinkAtPos(line, 10)).toBe("./Judea%20Pearl.md");
  });

  it("returns null when cursor is just past the closing paren", () => {
    const line = "[A](a.md) text";
    // index 9 is the space after ')'
    expect(extractLinkAtPos(line, 9)).toBeNull();
  });
});
