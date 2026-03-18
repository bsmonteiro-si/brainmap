import { describe, it, expect } from "vitest";
import { buildTree, fuzzyFilterTree } from "./FileTreePanel";
import type { NodeDto } from "../../api/types";

function makeNode(title: string, note_type = "concept"): NodeDto {
  return { path: "", title, note_type, tags: null, modified: null };
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

describe("buildTree with workspaceFiles (untracked files)", () => {
  it("includes untracked files that are not in the nodes map", () => {
    const nodes = new Map<string, NodeDto>([
      ["Concepts/a.md", makeNode("A")],
    ]);
    const workspaceFiles = ["Concepts/a.md", "Concepts/image.png"];
    const tree = buildTree(nodes, undefined, workspaceFiles);
    const folder = tree.find((n) => n.fullPath === "Concepts");
    expect(folder).toBeDefined();
    expect(folder!.children).toHaveLength(2);
    const untracked = folder!.children.find((c) => c.fullPath === "Concepts/image.png");
    expect(untracked).toBeDefined();
    expect(untracked!.note_type).toBeUndefined();
    expect(untracked!.isFolder).toBe(false);
  });

  it("untracked files at root level are included", () => {
    const nodes = new Map<string, NodeDto>();
    const workspaceFiles = ["readme.txt"];
    const tree = buildTree(nodes, undefined, workspaceFiles);
    expect(tree).toHaveLength(1);
    expect(tree[0].fullPath).toBe("readme.txt");
    expect(tree[0].note_type).toBeUndefined();
  });

  it("does not duplicate files already in nodes map", () => {
    const nodes = new Map<string, NodeDto>([
      ["note.md", makeNode("Note")],
    ]);
    const workspaceFiles = ["note.md"];
    const tree = buildTree(nodes, undefined, workspaceFiles);
    expect(tree).toHaveLength(1);
    expect(tree[0].title).toBe("Note");
  });

  it("folder disappears when its only untracked file is removed, unless tracked as empty", () => {
    const nodes = new Map<string, NodeDto>();
    // Folder exists only because of an untracked file
    const workspaceFiles = ["Photos/cat.png"];
    const treeBefore = buildTree(nodes, undefined, workspaceFiles);
    expect(treeBefore).toHaveLength(1);
    expect(treeBefore[0].fullPath).toBe("Photos");
    expect(treeBefore[0].children).toHaveLength(1);

    // After deletion: no workspace files, folder vanishes
    const treeAfter = buildTree(nodes, undefined, []);
    expect(treeAfter).toHaveLength(0);

    // With emptyFolders tracking, folder is preserved
    const treePreserved = buildTree(nodes, new Set(["Photos"]), []);
    expect(treePreserved).toHaveLength(1);
    expect(treePreserved[0].fullPath).toBe("Photos");
    expect(treePreserved[0].isFolder).toBe(true);
    expect(treePreserved[0].children).toHaveLength(0);
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

describe("buildTree with custom sort order", () => {
  it("sorts children by custom order", () => {
    const nodes = new Map<string, NodeDto>([
      ["Alpha.md", makeNode("Alpha")],
      ["Beta.md", makeNode("Beta")],
      ["Gamma.md", makeNode("Gamma")],
    ]);
    const customOrder = { "": ["Gamma.md", "Alpha.md", "Beta.md"] };
    const tree = buildTree(nodes, undefined, undefined, "custom", customOrder);
    expect(tree.map((n) => n.fullPath)).toEqual(["Gamma.md", "Alpha.md", "Beta.md"]);
  });

  it("appends new files (not in custom order) alphabetically at end", () => {
    const nodes = new Map<string, NodeDto>([
      ["Alpha.md", makeNode("Alpha")],
      ["Beta.md", makeNode("Beta")],
      ["New.md", makeNode("New")],
    ]);
    const customOrder = { "": ["Beta.md", "Alpha.md"] };
    const tree = buildTree(nodes, undefined, undefined, "custom", customOrder);
    expect(tree.map((n) => n.fullPath)).toEqual(["Beta.md", "Alpha.md", "New.md"]);
  });

  it("ignores stale paths in custom order (deleted files)", () => {
    const nodes = new Map<string, NodeDto>([
      ["Alpha.md", makeNode("Alpha")],
    ]);
    const customOrder = { "": ["Deleted.md", "Alpha.md", "AlsoDeleted.md"] };
    const tree = buildTree(nodes, undefined, undefined, "custom", customOrder);
    expect(tree.map((n) => n.fullPath)).toEqual(["Alpha.md"]);
  });

  it("folders-first rule still applies within custom sort", () => {
    const nodes = new Map<string, NodeDto>([
      ["Dir/Note.md", makeNode("Note")],
      ["Alpha.md", makeNode("Alpha")],
    ]);
    // Custom order puts Alpha before Dir, but folders-first should win
    const customOrder = { "": ["Alpha.md", "Dir"] };
    const tree = buildTree(nodes, undefined, undefined, "custom", customOrder);
    expect(tree[0].isFolder).toBe(true);
    expect(tree[0].fullPath).toBe("Dir");
    expect(tree[1].fullPath).toBe("Alpha.md");
  });

  it("falls back to name-asc when custom order is empty for a folder", () => {
    const nodes = new Map<string, NodeDto>([
      ["Beta.md", makeNode("Beta")],
      ["Alpha.md", makeNode("Alpha")],
    ]);
    const customOrder = {}; // no order for root
    const tree = buildTree(nodes, undefined, undefined, "custom", customOrder);
    expect(tree.map((n) => n.fullPath)).toEqual(["Alpha.md", "Beta.md"]);
  });

  it("applies custom order recursively to nested folders", () => {
    const nodes = new Map<string, NodeDto>([
      ["Dir/Z.md", makeNode("Z")],
      ["Dir/A.md", makeNode("A")],
      ["Dir/M.md", makeNode("M")],
    ]);
    const customOrder = { "Dir": ["Dir/M.md", "Dir/Z.md", "Dir/A.md"] };
    const tree = buildTree(nodes, undefined, undefined, "custom", customOrder);
    const dirChildren = tree[0].children;
    expect(dirChildren.map((n) => n.fullPath)).toEqual(["Dir/M.md", "Dir/Z.md", "Dir/A.md"]);
  });
});
