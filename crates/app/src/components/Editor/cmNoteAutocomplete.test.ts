import { describe, it, expect } from "vitest";
import { filterNotes } from "./cmNoteAutocomplete";

const MOCK_NODES = [
  { path: "Concepts/AI.md", title: "Artificial Intelligence", note_type: "concept" },
  { path: "Concepts/ML.md", title: "Machine Learning", note_type: "concept" },
  { path: "People/Turing.md", title: "Alan Turing", note_type: "person" },
  { path: "Projects/BrainMap.md", title: "BrainMap Project", note_type: "project" },
  { path: "folder-node", title: "A Folder", note_type: "folder" },
];

const CURRENT = "Concepts/AI.md";

describe("filterNotes", () => {
  it("returns all non-folder notes except current", () => {
    const results = filterNotes(MOCK_NODES, "", CURRENT);
    expect(results).toHaveLength(3); // excludes AI.md (self) and folder
  });

  it("filters by title (case-insensitive)", () => {
    const results = filterNotes(MOCK_NODES, "turing", CURRENT);
    expect(results).toHaveLength(1);
    expect(results[0].label).toBe("Alan Turing");
  });

  it("filters by path", () => {
    const results = filterNotes(MOCK_NODES, "concepts/", CURRENT);
    expect(results).toHaveLength(1); // ML.md (AI.md is self, excluded)
  });

  it("excludes folder nodes", () => {
    const results = filterNotes(MOCK_NODES, "folder", CURRENT);
    expect(results).toHaveLength(0);
  });

  it("generates relative paths for same directory", () => {
    const results = filterNotes(MOCK_NODES, "ML", CURRENT);
    expect(results[0].apply).toBe("./ML.md");
  });

  it("generates relative paths for different directory", () => {
    const results = filterNotes(MOCK_NODES, "turing", CURRENT);
    expect(results[0].apply).toBe("../People/Turing.md");
  });

  it("limits results to 20", () => {
    const many = Array.from({ length: 30 }, (_, i) => ({
      path: `Notes/Note${i}.md`,
      title: `Note ${i}`,
      note_type: "note",
    }));
    const results = filterNotes(many, "", CURRENT);
    expect(results).toHaveLength(20);
  });
});
