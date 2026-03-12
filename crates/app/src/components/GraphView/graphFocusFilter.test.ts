import { describe, it, expect } from "vitest";
import { filterGraphByFocus } from "./graphFocusFilter";
import type { NodeDto, EdgeDto } from "../../api/types";

function makeNode(path: string): NodeDto {
  return { path, title: path, note_type: "concept" };
}

function makeEdge(source: string, target: string, rel = "related-to"): EdgeDto {
  return { source, target, rel, kind: "Explicit" };
}

const nodeA = makeNode("a.md");
const nodeB = makeNode("b.md");
const nodeC = makeNode("c.md");
const nodeF1 = makeNode("Folder/x.md");
const nodeF2 = makeNode("Folder/y.md");
const nodeOut = makeNode("Other/z.md");

const edgeAB = makeEdge("a.md", "b.md");
const edgeBC = makeEdge("b.md", "c.md");
const edgeF12 = makeEdge("Folder/x.md", "Folder/y.md");
const edgeCrossFolder = makeEdge("Folder/x.md", "Other/z.md");

function makeMap(...nodes: NodeDto[]): Map<string, NodeDto> {
  return new Map(nodes.map((n) => [n.path, n]));
}

describe("filterGraphByFocus — note", () => {
  it("returns the focal node and direct neighbors", () => {
    const result = filterGraphByFocus(
      makeMap(nodeA, nodeB, nodeC),
      [edgeAB, edgeBC],
      "a.md",
      "note"
    );
    expect(result.focalPath).toBe("a.md");
    expect(result.filteredNodes.map((n) => n.path).sort()).toEqual(["a.md", "b.md"]);
    expect(result.filteredEdges).toHaveLength(1);
    expect(result.filteredEdges[0]).toBe(edgeAB);
  });

  it("includes the focal node even when it has no edges", () => {
    const result = filterGraphByFocus(
      makeMap(nodeA, nodeB),
      [], // no edges
      "a.md",
      "note"
    );
    expect(result.filteredNodes).toHaveLength(1);
    expect(result.filteredNodes[0].path).toBe("a.md");
    expect(result.filteredEdges).toHaveLength(0);
    expect(result.focalPath).toBe("a.md");
  });

  it("returns empty nodes and edges when focal path does not exist in map", () => {
    const result = filterGraphByFocus(
      makeMap(nodeA, nodeB),
      [edgeAB],
      "nonexistent.md",
      "note"
    );
    // focalPath is still set so the caller can identify what was requested
    expect(result.focalPath).toBe("nonexistent.md");
    expect(result.filteredNodes).toHaveLength(0);
    expect(result.filteredEdges).toHaveLength(0);
  });

  it("includes edges where focal node is the target", () => {
    const result = filterGraphByFocus(
      makeMap(nodeA, nodeB, nodeC),
      [edgeAB, edgeBC],
      "b.md",
      "note"
    );
    expect(result.filteredNodes.map((n) => n.path).sort()).toEqual(["a.md", "b.md", "c.md"]);
    expect(result.filteredEdges).toHaveLength(2);
  });
});

describe("filterGraphByFocus — folder", () => {
  it("returns folder notes, their neighbors, and all edges between them", () => {
    const result = filterGraphByFocus(
      makeMap(nodeF1, nodeF2, nodeOut),
      [edgeF12, edgeCrossFolder],
      "Folder",
      "folder"
    );
    expect(result.focalPath).toBeNull();
    expect(result.filteredNodes.map((n) => n.path).sort()).toEqual([
      "Folder/x.md",
      "Folder/y.md",
      "Other/z.md",
    ]);
    expect(result.filteredEdges).toHaveLength(2);
  });

  it("includes edges between two neighbors if both are visible", () => {
    const nodeOut2 = makeNode("Other/w.md");
    const edgeF2Out2 = makeEdge("Folder/y.md", "Other/w.md");
    // edgeOutOut2 connects two non-folder neighbors — intentionally included because
    // both endpoints are visible (each was pulled in by a separate folder-note edge).
    const edgeOutOut2 = makeEdge("Other/z.md", "Other/w.md");
    const result = filterGraphByFocus(
      makeMap(nodeF1, nodeF2, nodeOut, nodeOut2),
      [edgeF12, edgeCrossFolder, edgeF2Out2, edgeOutOut2],
      "Folder",
      "folder"
    );
    expect(result.filteredNodes).toHaveLength(4);
    expect(result.filteredEdges).toHaveLength(4);
  });

  it("handles a self-loop on a folder note without duplicating nodes", () => {
    const selfLoop = makeEdge("Folder/x.md", "Folder/x.md");
    const result = filterGraphByFocus(
      makeMap(nodeF1, nodeF2),
      [edgeF12, selfLoop],
      "Folder",
      "folder"
    );
    expect(result.filteredNodes).toHaveLength(2);
    expect(result.filteredEdges).toHaveLength(2);
  });

  it("returns empty arrays for an empty folder", () => {
    const result = filterGraphByFocus(
      makeMap(nodeA, nodeB),
      [edgeAB],
      "EmptyFolder",
      "folder"
    );
    expect(result.filteredNodes).toHaveLength(0);
    expect(result.filteredEdges).toHaveLength(0);
  });

  it("does not match a file whose path starts with the folder name but no slash", () => {
    // "Folder.md" should NOT be included when focusing "Folder"
    const folderMd = makeNode("Folder.md");
    const result = filterGraphByFocus(
      makeMap(nodeF1, folderMd),
      [],
      "Folder",
      "folder"
    );
    expect(result.filteredNodes.map((n) => n.path)).toEqual(["Folder/x.md"]);
  });
});
