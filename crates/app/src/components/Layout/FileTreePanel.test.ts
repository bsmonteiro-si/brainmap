import { describe, it, expect } from "vitest";
import { buildTree } from "./FileTreePanel";
import type { NodeDto } from "../../api/types";

function makeNode(title: string, note_type = "concept"): NodeDto {
  return { path: "", title, note_type };
}

describe("buildTree with emptyFolders", () => {
  it("includes an empty folder at root level", () => {
    const nodes = new Map<string, NodeDto>();
    const emptyFolders = new Set(["NewFolder"]);
    const tree = buildTree(nodes, emptyFolders);
    expect(tree).toHaveLength(1);
    expect(tree[0].isFolder).toBe(true);
    expect(tree[0].fullPath).toBe("NewFolder");
    expect(tree[0].children).toHaveLength(0);
  });

  it("includes a nested empty folder with intermediate ancestors", () => {
    const nodes = new Map<string, NodeDto>();
    const emptyFolders = new Set(["a/b/c"]);
    const tree = buildTree(nodes, emptyFolders);
    expect(tree).toHaveLength(1);
    expect(tree[0].fullPath).toBe("a");
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].fullPath).toBe("a/b");
    expect(tree[0].children[0].children).toHaveLength(1);
    expect(tree[0].children[0].children[0].fullPath).toBe("a/b/c");
  });

  it("does not duplicate a folder that already exists from notes", () => {
    const nodes = new Map<string, NodeDto>([
      ["Concepts/causality.md", makeNode("Causality")],
    ]);
    const emptyFolders = new Set(["Concepts"]);
    const tree = buildTree(nodes, emptyFolders);
    // Should have one "Concepts" folder, not two
    const folders = tree.filter((n) => n.isFolder && n.fullPath === "Concepts");
    expect(folders).toHaveLength(1);
    expect(folders[0].children).toHaveLength(1); // the note
  });

  it("works with no emptyFolders (undefined)", () => {
    const nodes = new Map<string, NodeDto>([
      ["note.md", makeNode("Note")],
    ]);
    const tree = buildTree(nodes);
    expect(tree).toHaveLength(1);
    expect(tree[0].isFolder).toBe(false);
  });

  it("merges empty subfolder into existing folder from notes", () => {
    const nodes = new Map<string, NodeDto>([
      ["Concepts/causality.md", makeNode("Causality")],
    ]);
    const emptyFolders = new Set(["Concepts/NewSub"]);
    const tree = buildTree(nodes, emptyFolders);
    const conceptsFolder = tree.find((n) => n.fullPath === "Concepts");
    expect(conceptsFolder).toBeDefined();
    // Should have the note + the new subfolder
    expect(conceptsFolder!.children).toHaveLength(2);
    const subFolder = conceptsFolder!.children.find((n) => n.fullPath === "Concepts/NewSub");
    expect(subFolder).toBeDefined();
    expect(subFolder!.isFolder).toBe(true);
  });
});
