import { describe, it, expect } from "vitest";
import { canvasToFlow, flowToCanvas } from "./canvasTranslation";
import type { JsonCanvas } from "./canvasTranslation";

describe("canvasToFlow", () => {
  it("converts empty canvas", () => {
    const { nodes, edges } = canvasToFlow({ nodes: [], edges: [] });
    expect(nodes).toEqual([]);
    expect(edges).toEqual([]);
  });

  it("handles missing nodes/edges arrays", () => {
    const { nodes, edges } = canvasToFlow({});
    expect(nodes).toEqual([]);
    expect(edges).toEqual([]);
  });

  it("converts text node", () => {
    const canvas: JsonCanvas = {
      nodes: [{ id: "t1", type: "text", text: "Hello", x: 10, y: 20, width: 200, height: 100 }],
    };
    const { nodes } = canvasToFlow(canvas);
    expect(nodes).toHaveLength(1);
    expect(nodes[0].id).toBe("t1");
    expect(nodes[0].type).toBe("canvasText");
    expect(nodes[0].position).toEqual({ x: 10, y: 20 });
    expect(nodes[0].data).toEqual({ text: "Hello" });
    expect(nodes[0].style).toEqual({ width: 200, height: 100 });
  });

  it("converts file node", () => {
    const canvas: JsonCanvas = {
      nodes: [{ id: "f1", type: "file", file: "notes/test.md", x: 0, y: 0, width: 250, height: 80 }],
    };
    const { nodes } = canvasToFlow(canvas);
    expect(nodes[0].type).toBe("canvasFile");
    expect(nodes[0].data).toEqual({ file: "notes/test.md" });
  });

  it("converts file node with subpath", () => {
    const canvas: JsonCanvas = {
      nodes: [{ id: "f2", type: "file", file: "notes/test.md", subpath: "#heading", x: 0, y: 0, width: 250, height: 80 }],
    };
    const { nodes } = canvasToFlow(canvas);
    expect(nodes[0].data).toEqual({ file: "notes/test.md", subpath: "#heading" });
  });

  it("converts link node", () => {
    const canvas: JsonCanvas = {
      nodes: [{ id: "l1", type: "link", url: "https://example.com", x: 0, y: 0, width: 200, height: 60 }],
    };
    const { nodes } = canvasToFlow(canvas);
    expect(nodes[0].type).toBe("canvasLink");
    expect(nodes[0].data).toEqual({ url: "https://example.com" });
  });

  it("converts group node with lower zIndex", () => {
    const canvas: JsonCanvas = {
      nodes: [{ id: "g1", type: "group", label: "My Group", x: 0, y: 0, width: 400, height: 300 }],
    };
    const { nodes } = canvasToFlow(canvas);
    expect(nodes[0].type).toBe("canvasGroup");
    expect(nodes[0].data).toEqual({ label: "My Group" });
    expect(nodes[0].zIndex).toBe(-1);
  });

  it("preserves color", () => {
    const canvas: JsonCanvas = {
      nodes: [{ id: "c1", type: "text", text: "hi", x: 0, y: 0, width: 100, height: 50, color: "#ff0000" }],
    };
    const { nodes } = canvasToFlow(canvas);
    expect(nodes[0].data).toEqual({ text: "hi", color: "#ff0000" });
  });

  it("converts edge with sides and label", () => {
    const canvas: JsonCanvas = {
      edges: [{
        id: "e1",
        fromNode: "a",
        toNode: "b",
        fromSide: "bottom",
        toSide: "top",
        label: "supports",
      }],
    };
    const { edges } = canvasToFlow(canvas);
    expect(edges).toHaveLength(1);
    expect(edges[0].source).toBe("a");
    expect(edges[0].target).toBe("b");
    expect(edges[0].sourceHandle).toBe("bottom");
    expect(edges[0].targetHandle).toBe("top-target");
    expect(edges[0].label).toBe("supports");
    expect(edges[0].markerEnd).toEqual({ type: "arrowclosed" });
  });

  it("converts edge with no arrow on target", () => {
    const canvas: JsonCanvas = {
      edges: [{ id: "e2", fromNode: "a", toNode: "b", toEnd: "none" }],
    };
    const { edges } = canvasToFlow(canvas);
    expect(edges[0].markerEnd).toBeUndefined();
  });

  it("converts edge with arrow on source", () => {
    const canvas: JsonCanvas = {
      edges: [{ id: "e3", fromNode: "a", toNode: "b", fromEnd: "arrow", toEnd: "none" }],
    };
    const { edges } = canvasToFlow(canvas);
    expect(edges[0].markerStart).toEqual({ type: "arrowclosed" });
    expect(edges[0].markerEnd).toBeUndefined();
  });

  it("converts edge color to stroke style", () => {
    const canvas: JsonCanvas = {
      edges: [{ id: "e4", fromNode: "a", toNode: "b", color: "#e74c3c" }],
    };
    const { edges } = canvasToFlow(canvas);
    expect(edges[0].style).toEqual({ stroke: "#e74c3c" });
  });
});

describe("flowToCanvas", () => {
  it("converts empty flow", () => {
    const canvas = flowToCanvas([], []);
    expect(canvas.nodes).toEqual([]);
    expect(canvas.edges).toEqual([]);
  });

  it("converts text node back", () => {
    const canvas = flowToCanvas(
      [{ id: "t1", type: "canvasText", position: { x: 10, y: 20 }, data: { text: "Hello" }, style: { width: 200, height: 100 } }],
      [],
    );
    expect(canvas.nodes).toHaveLength(1);
    const n = canvas.nodes![0];
    expect(n.type).toBe("text");
    expect(n.x).toBe(10);
    expect(n.y).toBe(20);
    expect(n.width).toBe(200);
    expect(n.height).toBe(100);
    expect((n as { text: string }).text).toBe("Hello");
  });

  it("converts edge back with markers", () => {
    const canvas = flowToCanvas(
      [],
      [{
        id: "e1",
        source: "a",
        target: "b",
        sourceHandle: "bottom",
        targetHandle: "top-target",
        label: "supports",
        markerEnd: { type: "arrowclosed" as const },
      }],
    );
    expect(canvas.edges).toHaveLength(1);
    const e = canvas.edges![0];
    expect(e.fromNode).toBe("a");
    expect(e.toNode).toBe("b");
    expect(e.fromSide).toBe("bottom");
    expect(e.toSide).toBe("top");
    expect(e.toEnd).toBe("arrow");
    expect(e.label).toBe("supports");
  });
});

describe("round-trip", () => {
  it("preserves data through canvasToFlow → flowToCanvas", () => {
    const original: JsonCanvas = {
      nodes: [
        { id: "t1", type: "text", text: "Note", x: 10, y: 20, width: 200, height: 100, color: "#ff0000" },
        { id: "f1", type: "file", file: "test.md", x: 300, y: 0, width: 250, height: 80 },
        { id: "l1", type: "link", url: "https://example.com", x: 0, y: 200, width: 200, height: 60 },
        { id: "g1", type: "group", label: "Group", x: 0, y: 0, width: 500, height: 400 },
      ],
      edges: [
        { id: "e1", fromNode: "t1", toNode: "f1", fromSide: "right", toSide: "left", label: "refs" },
      ],
    };

    const { nodes, edges } = canvasToFlow(original);
    const result = flowToCanvas(nodes, edges);

    expect(result.nodes).toHaveLength(4);
    expect(result.edges).toHaveLength(1);

    // Check text node preserved
    const textNode = result.nodes!.find((n) => n.id === "t1")!;
    expect(textNode.type).toBe("text");
    expect(textNode.x).toBe(10);
    expect((textNode as { text: string }).text).toBe("Note");
    expect(textNode.color).toBe("#ff0000");

    // Check file node preserved
    const fileNode = result.nodes!.find((n) => n.id === "f1")!;
    expect(fileNode.type).toBe("file");
    expect((fileNode as { file: string }).file).toBe("test.md");

    // Check edge preserved
    const edge = result.edges![0];
    expect(edge.fromNode).toBe("t1");
    expect(edge.toNode).toBe("f1");
    expect(edge.fromSide).toBe("right");
    expect(edge.toSide).toBe("left");
    expect(edge.label).toBe("refs");
  });
});
