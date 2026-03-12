import { create } from "zustand";
import type { EdgeDto, NodeDto, WorkspaceEvent } from "../api/types";
import { getAPI } from "../api/bridge";

interface GraphState {
  nodes: Map<string, NodeDto>;
  edges: EdgeDto[];
  selectedNodePath: string | null;
  expandedNodes: Set<string>;
  isLoading: boolean;

  loadTopology: () => Promise<void>;
  selectNode: (path: string | null) => void;
  expandNode: (path: string) => Promise<void>;
  applyEvent: (event: WorkspaceEvent) => void;
  createNote: (path: string, title: string, note_type: string) => void;
  reset: () => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: new Map(),
  edges: [],
  selectedNodePath: null,
  expandedNodes: new Set(),
  isLoading: false,

  loadTopology: async () => {
    set({ isLoading: true });
    try {
      const api = await getAPI();
      const topology = await api.getGraphTopology();
      const nodes = new Map<string, NodeDto>();
      for (const n of topology.nodes) {
        nodes.set(n.path, n);
      }
      set({ nodes, edges: topology.edges, isLoading: false });
    } catch (e) {
      console.error("Failed to load topology:", e);
      set({ isLoading: false });
    }
  },

  selectNode: (path: string | null) => {
    set({ selectedNodePath: path });
  },

  expandNode: async (path: string) => {
    const { expandedNodes, nodes, edges } = get();
    if (expandedNodes.has(path)) return;

    try {
      const api = await getAPI();
      const subgraph = await api.getNeighbors(path, 1);

      const newNodes = new Map(nodes);
      for (const n of subgraph.nodes) {
        if (!newNodes.has(n.path)) {
          newNodes.set(n.path, n);
        }
      }

      const existingEdgeKeys = new Set(
        edges.map((e) => `${e.source}|${e.target}|${e.rel}`)
      );
      const newEdges = [...edges];
      for (const e of subgraph.edges) {
        const key = `${e.source}|${e.target}|${e.rel}`;
        if (!existingEdgeKeys.has(key)) {
          newEdges.push(e);
        }
      }

      const newExpanded = new Set(expandedNodes);
      newExpanded.add(path);

      set({ nodes: newNodes, edges: newEdges, expandedNodes: newExpanded });
    } catch (e) {
      console.error("Failed to expand node:", e);
    }
  },

  createNote: (path: string, title: string, note_type: string) => {
    const { nodes } = get();
    const node: NodeDto = { path, title, note_type };
    const newNodes = new Map(nodes);
    newNodes.set(path, node);
    set({ nodes: newNodes, selectedNodePath: path });
  },

  reset: () => set({
    nodes: new Map(),
    edges: [],
    selectedNodePath: null,
    expandedNodes: new Set(),
    isLoading: false,
  }),

  applyEvent: (event: WorkspaceEvent) => {
    const { nodes, edges } = get();

    switch (event.type) {
      case "node-created": {
        const newNodes = new Map(nodes);
        newNodes.set(event.path, event.node);
        set({ nodes: newNodes });
        break;
      }
      case "node-updated": {
        const newNodes = new Map(nodes);
        newNodes.set(event.path, event.node);
        set({ nodes: newNodes });
        break;
      }
      case "node-deleted": {
        const newNodes = new Map(nodes);
        newNodes.delete(event.path);
        const newEdges = edges.filter(
          (e) => e.source !== event.path && e.target !== event.path
        );
        set({ nodes: newNodes, edges: newEdges });
        break;
      }
      case "edge-created": {
        set({ edges: [...edges, event.edge] });
        break;
      }
      case "edge-deleted": {
        const newEdges = edges.filter(
          (e) =>
            !(
              e.source === event.edge.source &&
              e.target === event.edge.target &&
              e.rel === event.edge.rel
            )
        );
        set({ edges: newEdges });
        break;
      }
      case "topology-changed": {
        const newNodes = new Map(nodes);
        for (const path of event.removed_nodes) {
          newNodes.delete(path);
        }
        for (const n of event.added_nodes) {
          newNodes.set(n.path, n);
        }

        const removedKeys = new Set(
          event.removed_edges.map((e) => `${e.source}|${e.target}|${e.rel}`)
        );
        let newEdges = edges.filter(
          (e) => !removedKeys.has(`${e.source}|${e.target}|${e.rel}`)
        );
        newEdges = [...newEdges, ...event.added_edges];

        set({ nodes: newNodes, edges: newEdges });
        break;
      }
    }
  },
}));
