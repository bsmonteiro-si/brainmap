import { describe, it, expect } from "vitest";
import {
  computeNewPath,
  isValidDrop,
  getParentFolder,
  isSameFolder,
  computeReorderedList,
  initCustomOrderFromTree,
  computeDropZone,
} from "./fileTreeDnd";

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

describe("getParentFolder", () => {
  it("returns empty string for root-level items", () => {
    expect(getParentFolder("Note.md")).toBe("");
    expect(getParentFolder("Folder")).toBe("");
  });

  it("returns parent path for nested items", () => {
    expect(getParentFolder("A/Note.md")).toBe("A");
    expect(getParentFolder("A/B/Note.md")).toBe("A/B");
  });
});

describe("isSameFolder", () => {
  it("returns true for siblings", () => {
    expect(isSameFolder("A/Note1.md", "A/Note2.md")).toBe(true);
    expect(isSameFolder("Note1.md", "Note2.md")).toBe(true);
  });

  it("returns false for different parents", () => {
    expect(isSameFolder("A/Note.md", "B/Note.md")).toBe(false);
    expect(isSameFolder("Note.md", "A/Note.md")).toBe(false);
  });
});

describe("computeReorderedList", () => {
  const order = ["A/a.md", "A/b.md", "A/c.md", "A/d.md"];

  it("moves first to last (after d)", () => {
    expect(computeReorderedList(order, "A/a.md", "A/d.md", "after")).toEqual([
      "A/b.md", "A/c.md", "A/d.md", "A/a.md",
    ]);
  });

  it("moves last to first (before a)", () => {
    expect(computeReorderedList(order, "A/d.md", "A/a.md", "before")).toEqual([
      "A/d.md", "A/a.md", "A/b.md", "A/c.md",
    ]);
  });

  it("moves to middle (before c)", () => {
    expect(computeReorderedList(order, "A/a.md", "A/c.md", "before")).toEqual([
      "A/b.md", "A/a.md", "A/c.md", "A/d.md",
    ]);
  });

  it("moves to middle (after b)", () => {
    expect(computeReorderedList(order, "A/d.md", "A/b.md", "after")).toEqual([
      "A/a.md", "A/b.md", "A/d.md", "A/c.md",
    ]);
  });

  it("returns original order if target not found", () => {
    expect(computeReorderedList(order, "A/a.md", "A/missing.md", "before")).toEqual(order);
  });

  it("handles two-item list", () => {
    expect(computeReorderedList(["x", "y"], "y", "x", "before")).toEqual(["y", "x"]);
    expect(computeReorderedList(["x", "y"], "x", "y", "after")).toEqual(["y", "x"]);
  });
});

describe("initCustomOrderFromTree", () => {
  it("snapshots fullPaths from children", () => {
    const children = [
      { fullPath: "A/Note1.md" },
      { fullPath: "A/Sub" },
      { fullPath: "A/Note2.md" },
    ];
    expect(initCustomOrderFromTree(children)).toEqual([
      "A/Note1.md", "A/Sub", "A/Note2.md",
    ]);
  });

  it("returns empty array for empty children", () => {
    expect(initCustomOrderFromTree([])).toEqual([]);
  });
});

describe("computeDropZone", () => {
  const rect = { top: 100, height: 40 };

  describe("file rows (50/50 split)", () => {
    it("returns 'before' in top half", () => {
      expect(computeDropZone(rect, 100, false)).toBe("before");
      expect(computeDropZone(rect, 119, false)).toBe("before");
    });

    it("returns 'after' in bottom half", () => {
      expect(computeDropZone(rect, 120, false)).toBe("after");
      expect(computeDropZone(rect, 139, false)).toBe("after");
    });
  });

  describe("folder rows (25/50/25 split)", () => {
    it("returns 'before' in top 25%", () => {
      expect(computeDropZone(rect, 100, true)).toBe("before");
      expect(computeDropZone(rect, 109, true)).toBe("before");
    });

    it("returns 'into' in middle 50%", () => {
      expect(computeDropZone(rect, 110, true)).toBe("into");
      expect(computeDropZone(rect, 129, true)).toBe("into");
    });

    it("returns 'after' in bottom 25%", () => {
      expect(computeDropZone(rect, 131, true)).toBe("after");
      expect(computeDropZone(rect, 139, true)).toBe("after");
    });
  });
});
