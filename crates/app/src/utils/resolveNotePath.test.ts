import { describe, it, expect } from "vitest";
import { resolveNotePath, isLocalNoteLink, ensureMdExtension, relativePath } from "./resolveNotePath";

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

describe("isLocalNoteLink", () => {
  it("returns true for relative .md link", () => {
    expect(isLocalNoteLink("./foo.md")).toBe(true);
  });

  it("returns true for bare .md filename", () => {
    expect(isLocalNoteLink("foo.md")).toBe(true);
  });

  it("returns true for extension-less relative path", () => {
    expect(isLocalNoteLink("./Level 2 - Intervention")).toBe(true);
  });

  it("returns true for extension-less bare name", () => {
    expect(isLocalNoteLink("Some Note")).toBe(true);
  });

  it("returns true for extension-less path with subdirectory", () => {
    expect(isLocalNoteLink("./Sub/Note Name")).toBe(true);
  });

  it("returns false for fragment-only link", () => {
    expect(isLocalNoteLink("#section-heading")).toBe(false);
  });

  it("returns false for https URL", () => {
    expect(isLocalNoteLink("https://example.com")).toBe(false);
  });

  it("returns false for non-.md file", () => {
    expect(isLocalNoteLink("./foo.txt")).toBe(false);
  });

  it("returns false for image file", () => {
    expect(isLocalNoteLink("./diagram.png")).toBe(false);
  });

  it("returns false for mailto link", () => {
    expect(isLocalNoteLink("mailto:x@y.com")).toBe(false);
  });

  it("returns false for http URL ending in .md", () => {
    expect(isLocalNoteLink("https://example.com/file.md")).toBe(false);
  });
});

describe("ensureMdExtension", () => {
  it("appends .md to extension-less path", () => {
    expect(ensureMdExtension("Level 2 - Intervention")).toBe("Level 2 - Intervention.md");
  });

  it("leaves .md path unchanged", () => {
    expect(ensureMdExtension("People/Judea Pearl.md")).toBe("People/Judea Pearl.md");
  });
});

describe("relativePath", () => {
  it("same directory → ./filename", () => {
    expect(relativePath("Concepts/AI.md", "Concepts/ML.md")).toBe("./ML.md");
  });

  it("different directory → ../target", () => {
    expect(relativePath("Concepts/AI.md", "People/Turing.md")).toBe("../People/Turing.md");
  });

  it("root to subdirectory → ./Sub/file", () => {
    expect(relativePath("Root.md", "Sub/Note.md")).toBe("./Sub/Note.md");
  });

  it("deep to shallow → ../../file", () => {
    expect(relativePath("A/B/C.md", "D.md")).toBe("../../D.md");
  });

  it("same file → ./file", () => {
    expect(relativePath("A/B.md", "A/B.md")).toBe("./B.md");
  });

  it("round-trips with resolveNotePath", () => {
    const from = "Concepts/AI.md";
    const to = "People/Turing.md";
    const rel = relativePath(from, to);
    expect(resolveNotePath(from, rel)).toBe(to);
  });
});
