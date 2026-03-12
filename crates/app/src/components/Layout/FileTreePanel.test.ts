import { describe, it, expect } from "vitest";
import { buildTree, fuzzyFilterTree } from "./FileTreePanel";
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

describe("buildTree noteCount", () => {
  it("counts direct notes in a folder", () => {
    const nodes = new Map<string, NodeDto>([
      ["Concepts/a.md", makeNode("A")],
      ["Concepts/b.md", makeNode("B")],
      ["Concepts/c.md", makeNode("C")],
    ]);
    const tree = buildTree(nodes);
    const folder = tree.find((n) => n.fullPath === "Concepts");
    expect(folder?.noteCount).toBe(3);
  });

  it("accumulates counts from nested folders", () => {
    const nodes = new Map<string, NodeDto>([
      ["A/x.md", makeNode("X")],
      ["A/B/y.md", makeNode("Y")],
      ["A/B/z.md", makeNode("Z")],
    ]);
    const tree = buildTree(nodes);
    const folderA = tree.find((n) => n.fullPath === "A");
    expect(folderA?.noteCount).toBe(3); // 1 direct + 2 from B
    const folderB = folderA?.children.find((n) => n.fullPath === "A/B");
    expect(folderB?.noteCount).toBe(2);
  });

  it("returns 0 for empty folders", () => {
    const nodes = new Map<string, NodeDto>();
    const emptyFolders = new Set(["Empty"]);
    const tree = buildTree(nodes, emptyFolders);
    expect(tree[0].noteCount).toBe(0);
  });

  it("root-level notes have no noteCount", () => {
    const nodes = new Map<string, NodeDto>([
      ["root.md", makeNode("Root")],
    ]);
    const tree = buildTree(nodes);
    expect(tree[0].noteCount).toBeUndefined();
  });
});

describe("fuzzyFilterTree", () => {
  it("fuzzy-matches note titles and attaches indices", () => {
    const nodes = new Map<string, NodeDto>([
      ["Concepts/causal.md", makeNode("Causal Inference")],
      ["Concepts/other.md", makeNode("Other Topic")],
    ]);
    const tree = buildTree(nodes);
    const result = fuzzyFilterTree(tree, "ci");
    // Only "Causal Inference" should match
    expect(result).toHaveLength(1);
    const folder = result[0];
    expect(folder.isFolder).toBe(true);
    expect(folder.children).toHaveLength(1);
    expect(folder.children[0].title).toBe("Causal Inference");
    expect(folder.children[0].matchIndices).toBeDefined();
    expect(folder.children[0].matchIndices!.length).toBe(2);
  });

  it("returns empty array when nothing matches", () => {
    const nodes = new Map<string, NodeDto>([
      ["note.md", makeNode("Hello")],
    ]);
    const tree = buildTree(nodes);
    expect(fuzzyFilterTree(tree, "xyz")).toHaveLength(0);
  });

  it("does not attach matchIndices to folders", () => {
    const nodes = new Map<string, NodeDto>([
      ["Concepts/a.md", makeNode("Alpha")],
    ]);
    const tree = buildTree(nodes);
    const result = fuzzyFilterTree(tree, "al");
    expect(result[0].matchIndices).toBeUndefined();
  });
});
