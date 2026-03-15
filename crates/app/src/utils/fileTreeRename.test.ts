import { describe, it, expect } from "vitest";
import { computeRenamePath, validateRenameName } from "./fileTreeRename";

describe("computeRenamePath", () => {
  it("renames a note in a subfolder", () => {
    expect(computeRenamePath("Concepts/causation.md", "correlation", false)).toBe(
      "Concepts/correlation.md",
    );
  });

  it("renames a note at root", () => {
    expect(computeRenamePath("intro.md", "overview", false)).toBe("overview.md");
  });

  it("strips .md if user typed it (prevents double .md)", () => {
    expect(computeRenamePath("Concepts/causation.md", "correlation.md", false)).toBe(
      "Concepts/correlation.md",
    );
  });

  it("renames a folder in a subfolder", () => {
    expect(computeRenamePath("Parent/OldFolder", "NewFolder", true)).toBe(
      "Parent/NewFolder",
    );
  });

  it("renames a folder at root", () => {
    expect(computeRenamePath("Concepts", "Ideas", true)).toBe("Ideas");
  });

  it("preserves extension for plain files", () => {
    expect(computeRenamePath("data/config.json", "settings", false)).toBe(
      "data/settings.json",
    );
  });

  it("preserves extension for .txt files", () => {
    expect(computeRenamePath("notes.txt", "readme", false)).toBe("readme.txt");
  });

  it("handles plain files with no extension", () => {
    expect(computeRenamePath("Makefile", "Buildfile", false)).toBe("Buildfile");
  });

  it("handles deeply nested paths", () => {
    expect(computeRenamePath("A/B/C/deep.md", "shallow", false)).toBe(
      "A/B/C/shallow.md",
    );
  });

  it("does not double-append extension when user types it for plain files", () => {
    expect(computeRenamePath("data/config.json", "settings.json", false)).toBe(
      "data/settings.json",
    );
  });

  it("does not double-append .txt extension", () => {
    expect(computeRenamePath("readme.txt", "notes.txt", false)).toBe("notes.txt");
  });
});

describe("validateRenameName", () => {
  const existing = new Set(["Concepts/causation.md", "Concepts/correlation.md", "Ideas"]);

  it("returns error for empty name", () => {
    expect(validateRenameName("", "Concepts/causation.md", false, existing)).toBe(
      "Name cannot be empty",
    );
  });

  it("returns error for whitespace-only name", () => {
    expect(validateRenameName("   ", "Concepts/causation.md", false, existing)).toBe(
      "Name cannot be empty",
    );
  });

  it("returns error for name with forward slash", () => {
    expect(validateRenameName("a/b", "Concepts/causation.md", false, existing)).toBe(
      "Name cannot contain path separators",
    );
  });

  it("returns error for name with backslash", () => {
    expect(validateRenameName("a\\b", "Concepts/causation.md", false, existing)).toBe(
      "Name cannot contain path separators",
    );
  });

  it("returns error for name starting with dot", () => {
    expect(validateRenameName(".hidden", "Concepts/causation.md", false, existing)).toBe(
      "Name cannot start with a dot",
    );
  });

  it("returns error for duplicate path", () => {
    expect(
      validateRenameName("correlation", "Concepts/causation.md", false, existing),
    ).toBe("A file with this name already exists");
  });

  it("returns error for duplicate folder", () => {
    expect(validateRenameName("Ideas", "Concepts", true, existing)).toBe(
      "A file with this name already exists",
    );
  });

  it("returns null for valid name", () => {
    expect(
      validateRenameName("newname", "Concepts/causation.md", false, existing),
    ).toBeNull();
  });

  it("returns null for same name (no-op)", () => {
    expect(
      validateRenameName("causation", "Concepts/causation.md", false, existing),
    ).toBeNull();
  });

  it("returns null for same folder name (no-op)", () => {
    expect(validateRenameName("Concepts", "Concepts", true, existing)).toBeNull();
  });

  it("trims whitespace before validation", () => {
    expect(
      validateRenameName("  newname  ", "Concepts/causation.md", false, existing),
    ).toBeNull();
  });

  it("returns error for duplicate when user types .md extension", () => {
    expect(
      validateRenameName("correlation.md", "Concepts/causation.md", false, existing),
    ).toBe("A file with this name already exists");
  });
});
