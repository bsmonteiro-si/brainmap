import { describe, it, expect } from "vitest";
import { computeNewPath, isValidDrop } from "./fileTreeDnd";

describe("computeNewPath", () => {
  it("moves a note to a folder", () => {
    expect(computeNewPath("A/Note.md", "B", false)).toBe("B/Note.md");
  });

  it("moves a note to root", () => {
    expect(computeNewPath("A/Note.md", "", false)).toBe("Note.md");
  });

  it("moves a root-level note to a folder", () => {
    expect(computeNewPath("Note.md", "B", false)).toBe("B/Note.md");
  });

  it("moves a folder to another folder", () => {
    expect(computeNewPath("A/Sub", "B", true)).toBe("B/Sub");
  });

  it("moves a folder to root", () => {
    expect(computeNewPath("A/Sub", "", true)).toBe("Sub");
  });

  it("moves a deeply nested note to root", () => {
    expect(computeNewPath("A/B/C/Note.md", "", false)).toBe("Note.md");
  });

  it("moves a note to a deeply nested folder", () => {
    expect(computeNewPath("Note.md", "A/B/C", false)).toBe("A/B/C/Note.md");
  });
});

describe("isValidDrop", () => {
  it("returns false for same location (note already in target folder)", () => {
    expect(isValidDrop("A/Note.md", false, "A")).toBe(false);
  });

  it("returns false for root note dropped on root", () => {
    expect(isValidDrop("Note.md", false, "")).toBe(false);
  });

  it("returns true for moving note to different folder", () => {
    expect(isValidDrop("A/Note.md", false, "B")).toBe(true);
  });

  it("returns true for moving note to root", () => {
    expect(isValidDrop("A/Note.md", false, "")).toBe(true);
  });

  it("returns false for dropping folder into itself", () => {
    expect(isValidDrop("A", true, "A")).toBe(false);
  });

  it("returns false for dropping folder into its descendant", () => {
    expect(isValidDrop("A", true, "A/B")).toBe(false);
    expect(isValidDrop("A", true, "A/B/C")).toBe(false);
  });

  it("returns true for moving folder to sibling folder", () => {
    expect(isValidDrop("A", true, "B")).toBe(true);
  });

  it("returns true for moving folder to root", () => {
    expect(isValidDrop("Parent/A", true, "")).toBe(true);
  });

  it("handles prefix collision correctly (A vs A-extra)", () => {
    // "A" should not be treated as parent of "A-extra"
    expect(isValidDrop("A", true, "A-extra")).toBe(true);
  });

  it("returns false for folder already at root dropped on root", () => {
    expect(isValidDrop("FolderName", true, "")).toBe(false);
  });
});
