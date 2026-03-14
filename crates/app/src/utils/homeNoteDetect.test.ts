import { describe, it, expect } from "vitest";
import { autoDetectHomeNote } from "./homeNoteDetect";
import type { NodeDto } from "../api/types";

function makeNode(path: string, note_type: string): NodeDto {
  return { path, title: path, note_type, tags: [] };
}

describe("autoDetectHomeNote", () => {
  it("returns null when no nodes exist", () => {
    expect(autoDetectHomeNote(new Map())).toBeNull();
  });

  it("returns null when no index-type notes exist", () => {
    const nodes = new Map<string, NodeDto>([
      ["a.md", makeNode("a.md", "concept")],
      ["b.md", makeNode("b.md", "book-note")],
    ]);
    expect(autoDetectHomeNote(nodes)).toBeNull();
  });

  it("returns the single index note", () => {
    const nodes = new Map<string, NodeDto>([
      ["a.md", makeNode("a.md", "concept")],
      ["index.md", makeNode("index.md", "index")],
      ["b.md", makeNode("b.md", "book-note")],
    ]);
    expect(autoDetectHomeNote(nodes)).toBe("index.md");
  });

  it("returns first alphabetically when multiple index notes exist", () => {
    const nodes = new Map<string, NodeDto>([
      ["z-index.md", makeNode("z-index.md", "index")],
      ["a-index.md", makeNode("a-index.md", "index")],
      ["m-index.md", makeNode("m-index.md", "index")],
    ]);
    expect(autoDetectHomeNote(nodes)).toBe("a-index.md");
  });

  it("returns null when all nodes are folder type", () => {
    const nodes = new Map<string, NodeDto>([
      ["folder1", makeNode("folder1", "folder")],
      ["folder2", makeNode("folder2", "folder")],
    ]);
    expect(autoDetectHomeNote(nodes)).toBeNull();
  });

  it("returns the path from the node map (matches NodeDto.path)", () => {
    const path = "The Book of Why/The Book of Why.md";
    const nodes = new Map<string, NodeDto>([
      [path, makeNode(path, "index")],
    ]);
    expect(autoDetectHomeNote(nodes)).toBe(path);
  });
});
