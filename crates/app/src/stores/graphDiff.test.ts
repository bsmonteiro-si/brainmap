import { describe, it, expect } from "vitest";
import type { NodeDto, EdgeDto, WorkspaceEvent } from "../api/types";
import { applyTopologyDiff } from "./graphDiff";

function makeNodes(...items: [string, string, string][]): Map<string, NodeDto> {
  const m = new Map<string, NodeDto>();
  for (const [path, title, note_type] of items) {
    m.set(path, { path, title, note_type });
  }
  return m;
}

function makeEdge(source: string, target: string, rel: string): EdgeDto {
  return { source, target, rel, kind: "Explicit" };
}

function makeState(
  nodes: Map<string, NodeDto> = new Map(),
  edges: EdgeDto[] = [],
  workspaceFiles: string[] = [],
) {
  return { nodes, edges, workspaceFiles };
}

describe("applyTopologyDiff", () => {
  describe("node-created", () => {
    it("adds a new node and workspace file", () => {
      const state = makeState();
      const event: WorkspaceEvent = {
        type: "node-created",
        path: "Concepts/A.md",
        node: { path: "Concepts/A.md", title: "A", note_type: "concept" },
      };
      const result = applyTopologyDiff(state, event);
      expect(result.nodes.has("Concepts/A.md")).toBe(true);
      expect(result.workspaceFiles).toContain("Concepts/A.md");
    });

    it("does not duplicate workspace file if already present", () => {
      const state = makeState(new Map(), [], ["Concepts/A.md"]);
      const event: WorkspaceEvent = {
        type: "node-created",
        path: "Concepts/A.md",
        node: { path: "Concepts/A.md", title: "A", note_type: "concept" },
      };
      const result = applyTopologyDiff(state, event);
      expect(result.workspaceFiles.filter((f) => f === "Concepts/A.md")).toHaveLength(1);
    });
  });

  describe("node-updated", () => {
    it("replaces the existing node data", () => {
      const state = makeState(makeNodes(["A.md", "Old", "concept"]));
      const event: WorkspaceEvent = {
        type: "node-updated",
        path: "A.md",
        node: { path: "A.md", title: "New", note_type: "book-note" },
      };
      const result = applyTopologyDiff(state, event);
      expect(result.nodes.get("A.md")?.title).toBe("New");
      expect(result.nodes.get("A.md")?.note_type).toBe("book-note");
    });
  });

  describe("node-deleted", () => {
    it("removes the node, its edges, and its workspace file entry", () => {
      const nodes = makeNodes(["A.md", "A", "concept"], ["B.md", "B", "concept"]);
      const edges = [makeEdge("A.md", "B.md", "related-to"), makeEdge("B.md", "A.md", "supports")];
      const state = makeState(nodes, edges, ["A.md", "B.md"]);

      const event: WorkspaceEvent = { type: "node-deleted", path: "A.md" };
      const result = applyTopologyDiff(state, event);

      expect(result.nodes.has("A.md")).toBe(false);
      expect(result.nodes.has("B.md")).toBe(true);
      expect(result.edges).toHaveLength(0); // both edges touched A.md
      expect(result.workspaceFiles).toEqual(["B.md"]);
    });
  });

  describe("edge-created", () => {
    it("appends the new edge", () => {
      const state = makeState(makeNodes(["A.md", "A", "concept"]));
      const edge = makeEdge("A.md", "B.md", "causes");
      const event: WorkspaceEvent = { type: "edge-created", edge };
      const result = applyTopologyDiff(state, event);
      expect(result.edges).toHaveLength(1);
      expect(result.edges[0]).toEqual(edge);
    });
  });

  describe("edge-deleted", () => {
    it("removes matching edge by source+target+rel", () => {
      const edges = [
        makeEdge("A.md", "B.md", "causes"),
        makeEdge("A.md", "C.md", "supports"),
      ];
      const state = makeState(new Map(), edges);
      const event: WorkspaceEvent = {
        type: "edge-deleted",
        edge: makeEdge("A.md", "B.md", "causes"),
      };
      const result = applyTopologyDiff(state, event);
      expect(result.edges).toHaveLength(1);
      expect(result.edges[0].target).toBe("C.md");
    });
  });

  describe("topology-changed", () => {
    it("handles combined add/remove of nodes and edges", () => {
      const nodes = makeNodes(
        ["A.md", "A", "concept"],
        ["B.md", "B", "concept"],
      );
      const edges = [makeEdge("A.md", "B.md", "related-to")];
      const state = makeState(nodes, edges, ["A.md", "B.md"]);

      const event: WorkspaceEvent = {
        type: "topology-changed",
        added_nodes: [{ path: "C.md", title: "C", note_type: "question" }],
        removed_nodes: ["B.md"],
        added_edges: [makeEdge("A.md", "C.md", "leads-to")],
        removed_edges: [makeEdge("A.md", "B.md", "related-to")],
      };
      const result = applyTopologyDiff(state, event);

      expect(result.nodes.has("A.md")).toBe(true);
      expect(result.nodes.has("B.md")).toBe(false);
      expect(result.nodes.has("C.md")).toBe(true);
      expect(result.edges).toHaveLength(1);
      expect(result.edges[0].target).toBe("C.md");
      expect(result.workspaceFiles).toContain("A.md");
      expect(result.workspaceFiles).toContain("C.md");
      expect(result.workspaceFiles).not.toContain("B.md");
    });

    it("does not add folder nodes to workspaceFiles", () => {
      const state = makeState();
      const event: WorkspaceEvent = {
        type: "topology-changed",
        added_nodes: [{ path: "Concepts", title: "Concepts", note_type: "folder" }],
        removed_nodes: [],
        added_edges: [],
        removed_edges: [],
      };
      const result = applyTopologyDiff(state, event);
      expect(result.nodes.has("Concepts")).toBe(true);
      expect(result.workspaceFiles).not.toContain("Concepts");
    });
  });

  describe("unknown event type", () => {
    it("returns state unchanged", () => {
      const state = makeState(makeNodes(["A.md", "A", "concept"]));
      const result = applyTopologyDiff(state, { type: "unknown" } as unknown as WorkspaceEvent);
      expect(result.nodes.size).toBe(1);
    });
  });
});
