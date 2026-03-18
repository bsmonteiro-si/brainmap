import { describe, it, expect } from "vitest";
import { getContextMenuItems } from "./cmContextMenu";

// Minimal mock EditorView
function mockView(hasSelection: boolean) {
  return {
    state: {
      selection: {
        main: hasSelection ? { from: 0, to: 5 } : { from: 3, to: 3 },
      },
      doc: {
        lineAt: (_pos: number) => ({ number: 1 }),
      },
    },
  } as any;
}

describe("getContextMenuItems", () => {
  it("always includes Cut/Copy/Paste", () => {
    const items = getContextMenuItems(mockView(false), null, null, null, 1);
    const labels = items.filter((i) => !i.separator).map((i) => i.label);
    expect(labels).toContain("Cut");
    expect(labels).toContain("Copy");
    expect(labels).toContain("Paste");
  });

  it("adds formatting items when text is selected", () => {
    const items = getContextMenuItems(mockView(true), null, null, null, 1);
    const labels = items.filter((i) => !i.separator).map((i) => i.label);
    expect(labels).toContain("Bold");
    expect(labels).toContain("Italic");
    expect(labels).toContain("Code");
    expect(labels).toContain("Strikethrough");
  });

  it("does not add formatting items when no selection", () => {
    const items = getContextMenuItems(mockView(false), null, null, null, 1);
    const labels = items.filter((i) => !i.separator).map((i) => i.label);
    expect(labels).not.toContain("Bold");
  });

  it("adds Copy File Reference when text selected and path available", () => {
    const items = getContextMenuItems(mockView(true), "/path/to/file.md", null, null, 1);
    const labels = items.filter((i) => !i.separator).map((i) => i.label);
    expect(labels).toContain("Copy File Reference");
  });

  it("does not add Copy File Reference when no path", () => {
    const items = getContextMenuItems(mockView(true), null, null, null, 1);
    const labels = items.filter((i) => !i.separator).map((i) => i.label);
    expect(labels).not.toContain("Copy File Reference");
  });

  it("adds Format Table when cursor is in a table", () => {
    const findTable = () => ({ start: 1, end: 3 });
    const formatTable = () => {};
    const items = getContextMenuItems(mockView(false), null, findTable, formatTable, 2);
    const labels = items.filter((i) => !i.separator).map((i) => i.label);
    expect(labels).toContain("Format Table");
  });

  it("does not add Format Table when not in a table", () => {
    const findTable = () => null;
    const formatTable = () => {};
    const items = getContextMenuItems(mockView(false), null, findTable, formatTable, 2);
    const labels = items.filter((i) => !i.separator).map((i) => i.label);
    expect(labels).not.toContain("Format Table");
  });
});
