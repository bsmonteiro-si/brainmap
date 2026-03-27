import { describe, it, expect } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("converts spaces to hyphens", () => {
    expect(slugify("My Cool Idea")).toBe("My-Cool-Idea");
  });

  it("removes special characters", () => {
    expect(slugify("What's the deal?")).toBe("Whats-the-deal");
  });

  it("collapses multiple hyphens", () => {
    expect(slugify("foo  --  bar")).toBe("foo-bar");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("  -hello- ")).toBe("hello");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("handles string with only special chars", () => {
    expect(slugify("!@#$%")).toBe("");
  });

  it("preserves underscores", () => {
    expect(slugify("my_note_title")).toBe("my_note_title");
  });

  it("preserves digits", () => {
    expect(slugify("Chapter 3 Notes")).toBe("Chapter-3-Notes");
  });
});
