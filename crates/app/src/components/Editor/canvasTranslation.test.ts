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
    expect(nodes[0].style).toEqual({ width: 200, minHeight: 100 });
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

  it("converts text node with shape", () => {
    const canvas: JsonCanvas = {
      nodes: [{ id: "t2", type: "text", text: "Sticky", shape: "sticky", x: 0, y: 0, width: 200, height: 200 }],
    };
    const { nodes } = canvasToFlow(canvas);
    expect(nodes[0].data).toEqual({ text: "Sticky", shape: "sticky" });
  });

  it("handles text node without shape (backward compat)", () => {
    const canvas: JsonCanvas = {
      nodes: [{ id: "t3", type: "text", text: "Old", x: 0, y: 0, width: 200, height: 100 }],
    };
    const { nodes } = canvasToFlow(canvas);
    expect(nodes[0].data).toEqual({ text: "Old" });
    expect(nodes[0].data.shape).toBeUndefined();
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
    expect(edges[0].markerEnd).toBe("brainmap-arrow");
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
    expect(edges[0].markerStart).toBe("brainmap-arrow");
    expect(edges[0].markerEnd).toBeUndefined();
  });

  it("converts edge color to stroke style", () => {
    const canvas: JsonCanvas = {
      edges: [{ id: "e4", fromNode: "a", toNode: "b", color: "#e74c3c" }],
    };
    const { edges } = canvasToFlow(canvas);
    expect(edges[0].style).toEqual({ stroke: "#e74c3c" });
  });

  it("uses colored marker ID when edge has color", () => {
    const canvas: JsonCanvas = {
      edges: [{ id: "e5", fromNode: "a", toNode: "b", color: "#e74c3c" }],
    };
    const { edges } = canvasToFlow(canvas);
    expect(edges[0].markerEnd).toBe("brainmap-arrow-#e74c3c");
    expect(edges[0].style).toEqual({ stroke: "#e74c3c" });
  });

  it("uses colored marker ID for fromEnd arrow with color", () => {
    const canvas: JsonCanvas = {
      edges: [{ id: "e6", fromNode: "a", toNode: "b", fromEnd: "arrow", toEnd: "none", color: "#3498db" }],
    };
    const { edges } = canvasToFlow(canvas);
    expect(edges[0].markerStart).toBe("brainmap-arrow-#3498db");
    expect(edges[0].markerEnd).toBeUndefined();
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
        markerEnd: "brainmap-arrow",
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

  it("converts edge back with string marker IDs", () => {
    const canvas = flowToCanvas(
      [],
      [{
        id: "e2",
        source: "a",
        target: "b",
        markerEnd: "brainmap-arrow",
      }],
    );
    const e = canvas.edges![0];
    expect(e.toEnd).toBe("arrow");
  });

  it("converts edge back with colored string marker IDs", () => {
    const canvas = flowToCanvas(
      [],
      [{
        id: "e3",
        source: "a",
        target: "b",
        markerEnd: "brainmap-arrow-#e74c3c",
        markerStart: "brainmap-arrow-#e74c3c",
        style: { stroke: "#e74c3c" },
      }],
    );
    const e = canvas.edges![0];
    expect(e.toEnd).toBe("arrow");
    expect(e.fromEnd).toBe("arrow");
    expect(e.color).toBe("#e74c3c");
  });
});

describe("flowToCanvas", () => {
  it("writes shape for non-default text node", () => {
    const canvas = flowToCanvas(
      [{ id: "t1", type: "canvasText", position: { x: 0, y: 0 }, data: { text: "Hi", shape: "callout" }, style: { width: 260, height: 120 } }],
      [],
    );
    const n = canvas.nodes![0] as { shape?: string };
    expect(n.shape).toBe("callout");
  });

  it("omits shape when rectangle", () => {
    const canvas = flowToCanvas(
      [{ id: "t2", type: "canvasText", position: { x: 0, y: 0 }, data: { text: "Hi", shape: "rectangle" }, style: { width: 250, height: 100 } }],
      [],
    );
    const n = canvas.nodes![0] as { shape?: string };
    expect(n.shape).toBeUndefined();
  });

  it("omits shape when undefined", () => {
    const canvas = flowToCanvas(
      [{ id: "t3", type: "canvasText", position: { x: 0, y: 0 }, data: { text: "Hi" }, style: { width: 250, height: 100 } }],
      [],
    );
    const n = canvas.nodes![0] as { shape?: string };
    expect(n.shape).toBeUndefined();
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

  it("preserves shape through round-trip", () => {
    const original: JsonCanvas = {
      nodes: [
        { id: "s1", type: "text", text: "Diamond", shape: "diamond", x: 0, y: 0, width: 160, height: 160 },
      ],
    };
    const { nodes } = canvasToFlow(original);
    const result = flowToCanvas(nodes, []);
    const n = result.nodes![0] as { shape?: string; text: string };
    expect(n.shape).toBe("diamond");
    expect(n.text).toBe("Diamond");
  });

  it("produces clean output for text node without shape", () => {
    const original: JsonCanvas = {
      nodes: [
        { id: "t1", type: "text", text: "Plain", x: 0, y: 0, width: 250, height: 100 },
      ],
    };
    const { nodes } = canvasToFlow(original);
    const result = flowToCanvas(nodes, []);
    const n = result.nodes![0];
    expect("shape" in n).toBe(false);
  });

  it("preserves parentId through round-trip", () => {
    const original: JsonCanvas = {
      nodes: [
        { id: "g1", type: "group", x: 0, y: 0, width: 500, height: 400 },
        { id: "t1", type: "text", text: "Child", x: 10, y: 10, width: 200, height: 100, parentId: "g1" },
      ],
    };
    const { nodes } = canvasToFlow(original);
    expect(nodes.find((n) => n.id === "t1")?.parentId).toBe("g1");
    const result = flowToCanvas(nodes, []);
    expect(result.nodes!.find((n) => n.id === "t1")?.parentId).toBe("g1");
  });
});

describe("auto-height (minHeight for auto-height nodes)", () => {
  it("canvasToFlow sets width + minHeight for text rectangle nodes", () => {
    const canvas: JsonCanvas = {
      nodes: [{ id: "t1", type: "text", text: "Hello", x: 0, y: 0, width: 200, height: 100 }],
    };
    const { nodes } = canvasToFlow(canvas);
    expect(nodes[0].style).toEqual({ width: 200, minHeight: 100 });
  });

  it("canvasToFlow sets width + minHeight for sticky nodes", () => {
    const canvas: JsonCanvas = {
      nodes: [{ id: "t1", type: "text", text: "Note", shape: "sticky", x: 0, y: 0, width: 200, height: 200 }],
    };
    const { nodes } = canvasToFlow(canvas);
    expect(nodes[0].style).toEqual({ width: 200, minHeight: 200 });
  });

  it("canvasToFlow sets fixed height for circle nodes", () => {
    const canvas: JsonCanvas = {
      nodes: [{ id: "t1", type: "text", text: "Circle", shape: "circle", x: 0, y: 0, width: 160, height: 160 }],
    };
    const { nodes } = canvasToFlow(canvas);
    expect(nodes[0].style).toEqual({ width: 160, height: 160 });
  });

  it("canvasToFlow sets fixed height for diamond nodes", () => {
    const canvas: JsonCanvas = {
      nodes: [{ id: "t1", type: "text", text: "Diamond", shape: "diamond", x: 0, y: 0, width: 160, height: 160 }],
    };
    const { nodes } = canvasToFlow(canvas);
    expect(nodes[0].style).toEqual({ width: 160, height: 160 });
  });

  it("canvasToFlow sets fixed height for group nodes", () => {
    const canvas: JsonCanvas = {
      nodes: [{ id: "g1", type: "group", x: 0, y: 0, width: 400, height: 300 }],
    };
    const { nodes } = canvasToFlow(canvas);
    expect(nodes[0].style).toEqual({ width: 400, height: 300 });
  });

  it("canvasToFlow sets width + minHeight for file nodes", () => {
    const canvas: JsonCanvas = {
      nodes: [{ id: "f1", type: "file", file: "test.md", x: 0, y: 0, width: 250, height: 80 }],
    };
    const { nodes } = canvasToFlow(canvas);
    expect(nodes[0].style).toEqual({ width: 250, minHeight: 80 });
  });

  it("canvasToFlow sets width + minHeight for link nodes", () => {
    const canvas: JsonCanvas = {
      nodes: [{ id: "l1", type: "link", url: "https://example.com", x: 0, y: 0, width: 200, height: 60 }],
    };
    const { nodes } = canvasToFlow(canvas);
    expect(nodes[0].style).toEqual({ width: 200, minHeight: 60 });
  });

  it("flowToCanvas reads minHeight when style.height is absent", () => {
    const canvas = flowToCanvas(
      [{ id: "t1", type: "canvasText", position: { x: 0, y: 0 }, data: { text: "Hi" }, style: { width: 200, minHeight: 100 } }],
      [],
    );
    expect(canvas.nodes![0].height).toBe(100);
  });

  it("flowToCanvas uses measured.height when larger than minHeight", () => {
    const canvas = flowToCanvas(
      [{
        id: "t1",
        type: "canvasText",
        position: { x: 0, y: 0 },
        data: { text: "Long text" },
        style: { width: 200, minHeight: 100 },
        measured: { width: 200, height: 250 },
      }],
      [],
    );
    expect(canvas.nodes![0].height).toBe(250);
  });

  it("flowToCanvas uses minHeight when measured.height is smaller", () => {
    const canvas = flowToCanvas(
      [{
        id: "t1",
        type: "canvasText",
        position: { x: 0, y: 0 },
        data: { text: "Short" },
        style: { width: 200, minHeight: 150 },
        measured: { width: 200, height: 80 },
      }],
      [],
    );
    expect(canvas.nodes![0].height).toBe(150);
  });

  it("round-trip preserves height for auto-expanding text node", () => {
    const original: JsonCanvas = {
      nodes: [{ id: "t1", type: "text", text: "Hello", x: 10, y: 20, width: 200, height: 100 }],
    };
    const { nodes } = canvasToFlow(original);
    const result = flowToCanvas(nodes, []);
    expect(result.nodes![0].height).toBe(100);
  });

  it("round-trip preserves height for circle node", () => {
    const original: JsonCanvas = {
      nodes: [{ id: "c1", type: "text", text: "O", shape: "circle", x: 0, y: 0, width: 160, height: 160 }],
    };
    const { nodes } = canvasToFlow(original);
    const result = flowToCanvas(nodes, []);
    expect(result.nodes![0].height).toBe(160);
  });
});

describe("cardKind", () => {
  it("canvasToFlow preserves cardKind on text nodes", () => {
    const canvas: JsonCanvas = {
      nodes: [{ id: "t1", type: "text", text: "Key point", cardKind: "summary", x: 0, y: 0, width: 250, height: 100 }],
    };
    const { nodes } = canvasToFlow(canvas);
    expect(nodes[0].data.cardKind).toBe("summary");
  });

  it("canvasToFlow handles text nodes without cardKind (backward compat)", () => {
    const canvas: JsonCanvas = {
      nodes: [{ id: "t1", type: "text", text: "Plain", x: 0, y: 0, width: 250, height: 100 }],
    };
    const { nodes } = canvasToFlow(canvas);
    expect(nodes[0].data.cardKind).toBeUndefined();
  });

  it("flowToCanvas emits cardKind when set", () => {
    const canvas = flowToCanvas(
      [{ id: "t1", type: "canvasText", position: { x: 0, y: 0 }, data: { text: "Q", cardKind: "question" }, style: { width: 250, height: 100 } }],
      [],
    );
    const n = canvas.nodes![0] as { cardKind?: string };
    expect(n.cardKind).toBe("question");
  });

  it("flowToCanvas omits cardKind when undefined", () => {
    const canvas = flowToCanvas(
      [{ id: "t1", type: "canvasText", position: { x: 0, y: 0 }, data: { text: "Plain" }, style: { width: 250, height: 100 } }],
      [],
    );
    const n = canvas.nodes![0];
    expect("cardKind" in n).toBe(false);
  });

  it("round-trip preserves cardKind", () => {
    const original: JsonCanvas = {
      nodes: [{ id: "t1", type: "text", text: "Bridge", cardKind: "transition", x: 10, y: 20, width: 300, height: 150 }],
    };
    const { nodes } = canvasToFlow(original);
    expect(nodes[0].data.cardKind).toBe("transition");
    const result = flowToCanvas(nodes, []);
    const n = result.nodes![0] as { cardKind?: string; text: string };
    expect(n.cardKind).toBe("transition");
    expect(n.text).toBe("Bridge");
  });
});

describe("flowToCanvas node.width/height priority", () => {
  it("prefers node.width/height over style dimensions", () => {
    const canvas = flowToCanvas(
      [{
        id: "r1",
        type: "canvasText",
        position: { x: 0, y: 0 },
        data: { text: "Resized" },
        width: 400,
        height: 300,
        style: { width: 200, height: 100 },
      }],
      [],
    );
    const n = canvas.nodes![0];
    expect(n.width).toBe(400);
    expect(n.height).toBe(300);
  });

  it("falls back to style when node.width/height absent", () => {
    const canvas = flowToCanvas(
      [{
        id: "r2",
        type: "canvasText",
        position: { x: 0, y: 0 },
        data: { text: "Original" },
        style: { width: 200, height: 100 },
      }],
      [],
    );
    const n = canvas.nodes![0];
    expect(n.width).toBe(200);
    expect(n.height).toBe(100);
  });
});

describe("edge labelFontSize and labelFontFamily", () => {
  const baseEdge = {
    id: "e1",
    source: "a",
    target: "b",
    markerEnd: "brainmap-arrow",
  };

  it("flowToCanvas omits labelFontSize when absent", () => {
    const canvas = flowToCanvas([], [{ ...baseEdge, data: {} }]);
    expect(canvas.edges![0]).not.toHaveProperty("labelFontSize");
  });

  it("flowToCanvas omits labelFontSize when equal to default (11)", () => {
    const canvas = flowToCanvas([], [{ ...baseEdge, data: { labelFontSize: 11 } }]);
    expect(canvas.edges![0]).not.toHaveProperty("labelFontSize");
  });

  it("flowToCanvas emits labelFontSize and labelFontFamily when non-default", () => {
    const canvas = flowToCanvas([], [{
      ...baseEdge,
      data: { labelFontSize: 16, labelFontFamily: "serif" },
    }]);
    expect(canvas.edges![0].labelFontSize).toBe(16);
    expect(canvas.edges![0].labelFontFamily).toBe("serif");
  });

  it("canvasToFlow round-trips labelFontSize and labelFontFamily through edge data", () => {
    const canvas: JsonCanvas = {
      edges: [{
        id: "e1",
        fromNode: "a",
        toNode: "b",
        labelFontSize: 20,
        labelFontFamily: "monospace",
      }],
    };
    const { edges } = canvasToFlow(canvas);
    const edgeData = edges[0].data as Record<string, unknown>;
    expect(edgeData.labelFontSize).toBe(20);
    expect(edgeData.labelFontFamily).toBe("monospace");
  });
});
