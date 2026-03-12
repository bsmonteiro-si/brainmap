import { describe, it, expect } from "vitest";
import { resolveNotePath, isLocalMdLink } from "./resolveNotePath";

describe("resolveNotePath", () => {
  it("resolves same-directory link with ./", () => {
    expect(resolveNotePath("People/Judea Pearl.md", "./Francis Galton.md")).toBe(
      "People/Francis Galton.md",
    );
  });

  it("resolves parent directory traversal", () => {
    expect(
      resolveNotePath("Questions/Q1.md", "../People/Karl Pearson.md"),
    ).toBe("People/Karl Pearson.md");
  });

  it("resolves nested subdirectory", () => {
    expect(resolveNotePath("Book/Book.md", "./Ch1/Ch1.md")).toBe(
      "Book/Ch1/Ch1.md",
    );
  });

  it("resolves link without ./ prefix as relative to note directory", () => {
    expect(resolveNotePath("A/B.md", "C.md")).toBe("A/C.md");
  });

  it("resolves from root-level note", () => {
    expect(resolveNotePath("Root.md", "./Sub/Note.md")).toBe("Sub/Note.md");
  });

  it("resolves multiple parent traversals", () => {
    expect(resolveNotePath("A/B/C.md", "../../D.md")).toBe("D.md");
  });

  it("decodes URL-encoded characters", () => {
    expect(
      resolveNotePath("People/X.md", "./Francis%20Galton.md"),
    ).toBe("People/Francis Galton.md");
  });

  it("handles paths with spaces (no encoding)", () => {
    expect(
      resolveNotePath("People/Judea Pearl.md", "./Francis Galton.md"),
    ).toBe("People/Francis Galton.md");
  });

  it("falls back to raw string on malformed percent-encoding", () => {
    expect(
      resolveNotePath("A/B.md", "./bad%ZZpath.md"),
    ).toBe("A/bad%ZZpath.md");
  });
});

describe("isLocalMdLink", () => {
  it("returns true for relative .md link", () => {
    expect(isLocalMdLink("./foo.md")).toBe(true);
  });

  it("returns true for bare .md filename", () => {
    expect(isLocalMdLink("foo.md")).toBe(true);
  });

  it("returns false for https URL", () => {
    expect(isLocalMdLink("https://example.com")).toBe(false);
  });

  it("returns false for non-.md file", () => {
    expect(isLocalMdLink("./foo.txt")).toBe(false);
  });

  it("returns false for mailto link", () => {
    expect(isLocalMdLink("mailto:x@y.com")).toBe(false);
  });

  it("returns false for http URL ending in .md", () => {
    expect(isLocalMdLink("https://example.com/file.md")).toBe(false);
  });
});
