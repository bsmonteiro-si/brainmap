import { describe, it, expect } from "vitest";
import type { Edge } from "@xyflow/react";

// ── Extracted edge transformation logic (mirrors canvasNodes.tsx handlers) ──
// These are pure functions extracted from the inline setEdges callbacks
// so we can unit-test the transformation logic independently.

/**
 * Mirrors the handleInvert setEdges mapper in canvasNodes.tsx.
 * Inverts an edge's direction: swaps source/target, handles, and markers.
 */
function invertEdge(ed: Edge, targetId: string): Edge {
  if (ed.id !== targetId) return ed;
  const {
    markerStart: _,
    markerEnd: __,
    sourceHandle: _sh,
    targetHandle: _th,
    id: _id,
    ...base
  } = ed;
  return {
    ...base,
    // New id forces React Flow to re-render the edge with swapped endpoints
    id: `edge-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    source: ed.target,
    target: ed.source,
    sourceHandle: ed.targetHandle
      ? ed.targetHandle.replace(/-target$/, "")
      : undefined,
    targetHandle: ed.sourceHandle
      ? `${ed.sourceHandle}-target`
      : undefined,
    // Markers stay on the same end — swapping source/target already reverses
    // the visual direction; swapping markers would point the arrow backwards
    markerEnd: ed.markerEnd || undefined,
    markerStart: ed.markerStart || undefined,
  };
}

/**
 * Mirrors the handleToggleBidirectional setEdges mapper in canvasNodes.tsx.
 * Toggles an edge between unidirectional and bidirectional.
 */
function toggleBidirectional(
  ed: Edge,
  targetId: string,
  defaultMarkerId = "brainmap-arrow",
): Edge {
  if (ed.id !== targetId) return ed;
  const isBidirectional = !!ed.markerStart && !!ed.markerEnd;
  if (isBidirectional) {
    const { markerStart: _, ...rest } = ed;
    return rest;
  }
  const stroke = (ed.style as Record<string, unknown> | undefined)?.stroke;
  const markerId =
    typeof stroke === "string" ? `brainmap-arrow-${stroke}` : defaultMarkerId;
  return {
    ...ed,
    markerStart: ed.markerStart || markerId,
    markerEnd: ed.markerEnd || markerId,
  };
}

// ── Tests ──

describe("invertEdge", () => {
  const baseEdge: Edge = {
    id: "edge-1",
    source: "node-A",
    target: "node-B",
    sourceHandle: "right",
    targetHandle: "left-target",
    markerEnd: "brainmap-arrow",
  };

  it("swaps source and target", () => {
    const result = invertEdge(baseEdge, "edge-1");
    expect(result.source).toBe("node-B");
    expect(result.target).toBe("node-A");
  });

  it("swaps sourceHandle and targetHandle with correct suffixes", () => {
    const result = invertEdge(baseEdge, "edge-1");
    expect(result.sourceHandle).toBe("left");
    expect(result.targetHandle).toBe("right-target");
  });

  it("preserves markerEnd for unidirectional edge (arrow stays on target end)", () => {
    const result = invertEdge(baseEdge, "edge-1");
    expect(result.markerEnd).toBe("brainmap-arrow");
    expect(result.markerStart).toBeUndefined();
  });

  it("preserves both markers for bidirectional edge", () => {
    const biEdge: Edge = {
      ...baseEdge,
      markerStart: "brainmap-arrow-red",
      markerEnd: "brainmap-arrow-blue",
    };
    const result = invertEdge(biEdge, "edge-1");
    expect(result.markerEnd).toBe("brainmap-arrow-blue");
    expect(result.markerStart).toBe("brainmap-arrow-red");
  });

  it("generates a new edge id (forces React Flow re-render)", () => {
    const result = invertEdge(baseEdge, "edge-1");
    expect(result.id).not.toBe("edge-1");
    expect(result.id).toMatch(/^edge-\d+-[a-z0-9]+$/);
  });

  it("preserves label, style, and data", () => {
    const richEdge: Edge = {
      ...baseEdge,
      label: "depends on",
      style: { stroke: "#ff0000" },
      data: { edgeType: "bezier" },
    };
    const result = invertEdge(richEdge, "edge-1");
    expect(result.label).toBe("depends on");
    expect(result.style).toEqual({ stroke: "#ff0000" });
    expect(result.data).toEqual({ edgeType: "bezier" });
  });

  it("sets handles to undefined when originals are absent", () => {
    const noHandles: Edge = {
      id: "edge-2",
      source: "A",
      target: "B",
      markerEnd: "brainmap-arrow",
    };
    const result = invertEdge(noHandles, "edge-2");
    expect(result.sourceHandle).toBeUndefined();
    expect(result.targetHandle).toBeUndefined();
  });

  it("does not modify non-matching edges", () => {
    const other: Edge = { id: "edge-other", source: "X", target: "Y" };
    const result = invertEdge(other, "edge-1");
    expect(result).toBe(other); // same reference
  });

  it("explicitly sets marker keys (not absent) even when undefined", () => {
    const noMarkers: Edge = { id: "edge-3", source: "A", target: "B" };
    const result = invertEdge(noMarkers, "edge-3");
    expect("markerStart" in result).toBe(true);
    expect(result.markerStart).toBeUndefined();
    expect("markerEnd" in result).toBe(true);
    expect(result.markerEnd).toBeUndefined();
  });

  it("double invert restores original source/target and markers", () => {
    const first = invertEdge(baseEdge, "edge-1");
    const result = invertEdge(first, first.id);
    expect(result.source).toBe(baseEdge.source);
    expect(result.target).toBe(baseEdge.target);
    expect(result.markerEnd).toBe(baseEdge.markerEnd);
    expect(result.markerStart).toBeUndefined();
  });
});

describe("toggleBidirectional", () => {
  const uniEdge: Edge = {
    id: "edge-1",
    source: "A",
    target: "B",
    markerEnd: "brainmap-arrow",
  };

  it("adds markerStart to make unidirectional edge bidirectional", () => {
    const result = toggleBidirectional(uniEdge, "edge-1");
    expect(result.markerStart).toBe("brainmap-arrow");
    expect(result.markerEnd).toBe("brainmap-arrow");
  });

  it("removes markerStart from bidirectional edge to make unidirectional", () => {
    const biEdge: Edge = {
      ...uniEdge,
      markerStart: "brainmap-arrow",
    };
    const result = toggleBidirectional(biEdge, "edge-1");
    expect(result.markerEnd).toBe("brainmap-arrow");
    expect("markerStart" in result).toBe(false);
  });

  it("uses colored marker when edge has stroke style", () => {
    const colorEdge: Edge = {
      id: "edge-1",
      source: "A",
      target: "B",
      markerEnd: "brainmap-arrow-red",
      style: { stroke: "red" },
    };
    const result = toggleBidirectional(colorEdge, "edge-1");
    expect(result.markerStart).toBe("brainmap-arrow-red");
  });

  it("does not modify non-matching edges", () => {
    const other: Edge = { id: "other", source: "X", target: "Y" };
    const result = toggleBidirectional(other, "edge-1");
    expect(result).toBe(other);
  });

  it("preserves source, target, and other properties", () => {
    const result = toggleBidirectional(uniEdge, "edge-1");
    expect(result.source).toBe("A");
    expect(result.target).toBe("B");
    expect(result.id).toBe("edge-1");
  });

  it("toggle twice restores original state", () => {
    const biResult = toggleBidirectional(uniEdge, "edge-1");
    const uniResult = toggleBidirectional(biResult, "edge-1");
    expect(uniResult.markerEnd).toBe("brainmap-arrow");
    expect("markerStart" in uniResult).toBe(false);
  });
});
