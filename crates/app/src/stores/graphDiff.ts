/**
 * Pure function for applying topology diff events to graph state.
 *
 * Used by both graphStore.applyEvent (for live updates) and
 * segmentStateCache.applyEventToSnapshot (for background segments).
 */

import type { NodeDto, EdgeDto, WorkspaceEvent } from "../api/types";

interface GraphData {
  nodes: Map<string, NodeDto>;
  edges: EdgeDto[];
  workspaceFiles: string[];
}

/**
 * Apply a workspace event to graph data, returning the updated data.
 * Mutates and returns the same Maps/arrays for efficiency.
 */
export function applyTopologyDiff(state: GraphData, event: WorkspaceEvent): GraphData {
  const { nodes, edges, workspaceFiles } = state;

  switch (event.type) {
    case "node-created": {
      nodes.set(event.path, event.node);
      if (!workspaceFiles.includes(event.path)) {
        workspaceFiles.push(event.path);
      }
      return { nodes, edges, workspaceFiles };
    }

    case "node-updated": {
      nodes.set(event.path, event.node);
      return { nodes, edges, workspaceFiles };
    }

    case "node-deleted": {
      nodes.delete(event.path);
      const newEdges = edges.filter(
        (e) => e.source !== event.path && e.target !== event.path,
      );
      const newFiles = workspaceFiles.filter((f) => f !== event.path);
      return { nodes, edges: newEdges, workspaceFiles: newFiles };
    }

    case "edge-created": {
      edges.push(event.edge);
      return { nodes, edges, workspaceFiles };
    }

    case "edge-deleted": {
      const filtered = edges.filter(
        (e) =>
          !(
            e.source === event.edge.source &&
            e.target === event.edge.target &&
            e.rel === event.edge.rel
          ),
      );
      return { nodes, edges: filtered, workspaceFiles };
    }

    case "topology-changed": {
      for (const path of event.removed_nodes) {
        nodes.delete(path);
      }
      for (const n of event.added_nodes) {
        nodes.set(n.path, n);
      }

      const removedKeys = new Set(
        event.removed_edges.map((e) => `${e.source}|${e.target}|${e.rel}`),
      );
      let newEdges = edges.filter(
        (e) => !removedKeys.has(`${e.source}|${e.target}|${e.rel}`),
      );
      newEdges = [...newEdges, ...event.added_edges];

      // Update workspaceFiles: remove deleted non-folder nodes, add new non-folder nodes
      const removedSet = new Set(event.removed_nodes);
      let newFiles = workspaceFiles.filter((f) => !removedSet.has(f));
      for (const n of event.added_nodes) {
        if (n.note_type !== "folder" && !newFiles.includes(n.path)) {
          newFiles.push(n.path);
        }
      }

      return { nodes, edges: newEdges, workspaceFiles: newFiles };
    }

    default:
      return { nodes, edges, workspaceFiles };
  }
}
