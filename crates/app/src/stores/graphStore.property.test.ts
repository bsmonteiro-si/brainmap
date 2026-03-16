import { describe, it, expect, beforeEach, vi } from "vitest";
import fc from "fast-check";

// Mock the API bridge before importing graphStore
vi.mock("../api/bridge", () => ({
  getAPI: () => Promise.resolve({}),
}));

// Mock logger to avoid side effects
vi.mock("../utils/logger", () => ({
  log: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} },
}));

import { useGraphStore } from "./graphStore";
import type { NodeDto, EdgeDto, WorkspaceEvent } from "../api/types";

// ── Arbitraries ──────────────────────────────────────────────────

const arbPath = fc.stringMatching(/^[a-z]{1,8}\.md$/);

const arbRel = fc.constantFrom("related-to", "causes", "supports");

const arbNoteType = fc.constantFrom("concept", "question", "reference", "book-note");

const arbNode: fc.Arbitrary<NodeDto> = fc.record({
  path: arbPath,
  title: fc.string({ minLength: 1, maxLength: 12 }),
  note_type: arbNoteType,
  tags: fc.constant(null),
});

const arbEdge: fc.Arbitrary<EdgeDto> = fc.record({
  source: arbPath,
  target: arbPath,
  rel: arbRel,
  kind: fc.constant("Explicit" as string),
});

// ── Helpers ──────────────────────────────────────────────────────

function edgeKey(e: EdgeDto): string {
  return `${e.source}|${e.target}|${e.rel}`;
}

function hasDuplicateEdges(edges: EdgeDto[]): boolean {
  const keys = new Set<string>();
  for (const e of edges) {
    const k = edgeKey(e);
    if (keys.has(k)) return true;
    keys.add(k);
  }
  return false;
}

// ── Tests ────────────────────────────────────────────────────────

describe("graphStore property-based tests", () => {
  beforeEach(() => {
    useGraphStore.getState().reset();
  });

  describe("applyEvent never produces duplicate edges", () => {
    it("topology-changed with arbitrary edges deduplicates", () => {
      fc.assert(
        fc.property(fc.array(arbEdge, { minLength: 1, maxLength: 30 }), (edges) => {
          useGraphStore.getState().reset();

          const event: WorkspaceEvent = {
            type: "topology-changed",
            added_nodes: [],
            removed_nodes: [],
            added_edges: edges,
            removed_edges: [],
          };

          useGraphStore.getState().applyEvent(event);
          const state = useGraphStore.getState();

          expect(hasDuplicateEdges(state.edges)).toBe(false);
        }),
        { numRuns: 100 },
      );
    });

    it("multiple topology-changed events never accumulate duplicates", () => {
      fc.assert(
        fc.property(
          fc.array(fc.array(arbEdge, { minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 5 }),
          (edgeBatches) => {
            useGraphStore.getState().reset();

            for (const edges of edgeBatches) {
              const event: WorkspaceEvent = {
                type: "topology-changed",
                added_nodes: [],
                removed_nodes: [],
                added_edges: edges,
                removed_edges: [],
              };
              useGraphStore.getState().applyEvent(event);
            }

            const state = useGraphStore.getState();
            expect(hasDuplicateEdges(state.edges)).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("edge-created followed by topology-changed with same edge deduplicates", () => {
      fc.assert(
        fc.property(arbEdge, (edge) => {
          useGraphStore.getState().reset();

          // First add via edge-created
          useGraphStore.getState().applyEvent({ type: "edge-created", edge });

          // Then add same via topology-changed
          useGraphStore.getState().applyEvent({
            type: "topology-changed",
            added_nodes: [],
            removed_nodes: [],
            added_edges: [edge],
            removed_edges: [],
          });

          const state = useGraphStore.getState();
          expect(hasDuplicateEdges(state.edges)).toBe(false);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe("node count consistency", () => {
    it("node-created events produce correct node count", () => {
      fc.assert(
        fc.property(fc.array(arbNode, { minLength: 0, maxLength: 20 }), (nodes) => {
          useGraphStore.getState().reset();

          for (const node of nodes) {
            const event: WorkspaceEvent = {
              type: "node-created",
              path: node.path,
              node,
            };
            useGraphStore.getState().applyEvent(event);
          }

          const state = useGraphStore.getState();
          // Unique paths = unique nodes
          const uniquePaths = new Set(nodes.map((n) => n.path));
          expect(state.nodes.size).toBe(uniquePaths.size);
        }),
        { numRuns: 100 },
      );
    });

    it("node-created then node-deleted produces correct count", () => {
      fc.assert(
        fc.property(
          fc.array(arbNode, { minLength: 1, maxLength: 15 }),
          fc.array(arbPath, { minLength: 0, maxLength: 10 }),
          (nodes, deletePaths) => {
            useGraphStore.getState().reset();

            // Create all nodes
            for (const node of nodes) {
              useGraphStore.getState().applyEvent({
                type: "node-created",
                path: node.path,
                node,
              });
            }

            const uniquePaths = new Set(nodes.map((n) => n.path));

            // Delete some
            for (const path of deletePaths) {
              useGraphStore.getState().applyEvent({
                type: "node-deleted",
                path,
              });
              uniquePaths.delete(path);
            }

            const state = useGraphStore.getState();
            expect(state.nodes.size).toBe(uniquePaths.size);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("topology-changed with added and removed nodes", () => {
      fc.assert(
        fc.property(
          fc.array(arbNode, { minLength: 0, maxLength: 10 }),
          fc.array(arbNode, { minLength: 0, maxLength: 10 }),
          (initialNodes, addedNodes) => {
            useGraphStore.getState().reset();

            // Seed initial nodes
            for (const node of initialNodes) {
              useGraphStore.getState().applyEvent({
                type: "node-created",
                path: node.path,
                node,
              });
            }

            const before = useGraphStore.getState().nodes;
            const existingPaths = new Set(before.keys());

            // Pick some existing paths to remove
            const toRemove = [...existingPaths].slice(0, Math.floor(existingPaths.size / 2));
            const toRemoveSet = new Set(toRemove);

            useGraphStore.getState().applyEvent({
              type: "topology-changed",
              added_nodes: addedNodes,
              removed_nodes: toRemove,
              added_edges: [],
              removed_edges: [],
            });

            const state = useGraphStore.getState();

            // Expected: start with existing, remove toRemove, add addedNodes (by path)
            const expected = new Set(existingPaths);
            for (const p of toRemoveSet) expected.delete(p);
            for (const n of addedNodes) expected.add(n.path);

            expect(state.nodes.size).toBe(expected.size);
            for (const p of expected) {
              expect(state.nodes.has(p)).toBe(true);
            }
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe("reset returns to empty state", () => {
    it("reset after arbitrary events clears everything", () => {
      fc.assert(
        fc.property(
          fc.array(arbNode, { minLength: 1, maxLength: 15 }),
          fc.array(arbEdge, { minLength: 0, maxLength: 10 }),
          (nodes, edges) => {
            useGraphStore.getState().reset();

            // Apply node-created events
            for (const node of nodes) {
              useGraphStore.getState().applyEvent({
                type: "node-created",
                path: node.path,
                node,
              });
            }

            // Apply edge-created events
            for (const edge of edges) {
              useGraphStore.getState().applyEvent({
                type: "edge-created",
                edge,
              });
            }

            // Verify something is in the store
            const before = useGraphStore.getState();
            expect(before.nodes.size).toBeGreaterThan(0);

            // Reset
            useGraphStore.getState().reset();

            const after = useGraphStore.getState();
            expect(after.nodes.size).toBe(0);
            expect(after.edges).toHaveLength(0);
            expect(after.workspaceFiles).toHaveLength(0);
            expect(after.selectedNodePath).toBeNull();
            expect(after.expandedNodes.size).toBe(0);
            expect(after.isLoading).toBe(false);
          },
        ),
        { numRuns: 50 },
      );
    });

    it("reset after topology-changed events clears everything", () => {
      fc.assert(
        fc.property(
          fc.array(arbNode, { minLength: 1, maxLength: 10 }),
          fc.array(arbEdge, { minLength: 1, maxLength: 10 }),
          (nodes, edges) => {
            useGraphStore.getState().reset();

            useGraphStore.getState().applyEvent({
              type: "topology-changed",
              added_nodes: nodes,
              removed_nodes: [],
              added_edges: edges,
              removed_edges: [],
            });

            useGraphStore.getState().reset();

            const after = useGraphStore.getState();
            expect(after.nodes.size).toBe(0);
            expect(after.edges).toHaveLength(0);
            expect(after.workspaceFiles).toHaveLength(0);
          },
        ),
        { numRuns: 50 },
      );
    });
  });

  describe("edge deletion consistency", () => {
    it("deleting an edge that was added removes it", () => {
      fc.assert(
        fc.property(
          fc.array(arbEdge, { minLength: 1, maxLength: 15 }),
          (edges) => {
            useGraphStore.getState().reset();

            // Add all edges via topology-changed (deduplicates)
            useGraphStore.getState().applyEvent({
              type: "topology-changed",
              added_nodes: [],
              removed_nodes: [],
              added_edges: edges,
              removed_edges: [],
            });

            const beforeCount = useGraphStore.getState().edges.length;

            // Pick the first edge to delete
            const toDelete = useGraphStore.getState().edges[0];
            useGraphStore.getState().applyEvent({
              type: "edge-deleted",
              edge: toDelete,
            });

            const after = useGraphStore.getState();
            expect(after.edges.length).toBe(beforeCount - 1);
            const found = after.edges.find(
              (e) => e.source === toDelete.source && e.target === toDelete.target && e.rel === toDelete.rel,
            );
            expect(found).toBeUndefined();
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe("node-deleted removes associated edges", () => {
    it("deleting a node removes all edges referencing it", () => {
      fc.assert(
        fc.property(
          fc.array(arbNode, { minLength: 2, maxLength: 10 }),
          fc.array(arbEdge, { minLength: 1, maxLength: 15 }),
          (nodes, edges) => {
            useGraphStore.getState().reset();

            // Add nodes
            for (const node of nodes) {
              useGraphStore.getState().applyEvent({
                type: "node-created",
                path: node.path,
                node,
              });
            }

            // Add edges via topology-changed (deduplicates)
            useGraphStore.getState().applyEvent({
              type: "topology-changed",
              added_nodes: [],
              removed_nodes: [],
              added_edges: edges,
              removed_edges: [],
            });

            // Pick a node to delete
            const pathToDelete = nodes[0].path;
            useGraphStore.getState().applyEvent({
              type: "node-deleted",
              path: pathToDelete,
            });

            const after = useGraphStore.getState();
            // No edges should reference the deleted node
            for (const e of after.edges) {
              expect(e.source).not.toBe(pathToDelete);
              expect(e.target).not.toBe(pathToDelete);
            }
            // Node should be gone
            expect(after.nodes.has(pathToDelete)).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
