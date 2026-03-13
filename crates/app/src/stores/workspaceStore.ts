import { create } from "zustand";
import type { StatsDto, WorkspaceInfo } from "../api/types";
import { getAPI } from "../api/bridge";
import { useUIStore } from "./uiStore";
import { useGraphStore } from "./graphStore";
import { useEditorStore } from "./editorStore";
import { useSegmentStore } from "./segmentStore";
import { useUndoStore } from "./undoStore";
import { useNavigationStore } from "./navigationStore";
import { useTabStore } from "./tabStore";
import { log } from "../utils/logger";

interface WorkspaceState {
  info: WorkspaceInfo | null;
  stats: StatsDto | null;
  isLoading: boolean;
  error: string | null;
  noteTypes: string[];
  edgeTypes: string[];
  openWorkspace: (path: string) => Promise<void>;
  closeWorkspace: () => void;
  refreshStats: () => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  info: null,
  stats: null,
  isLoading: false,
  error: null,
  noteTypes: [
    "concept", "book-note", "question", "reference", "index",
    "argument", "evidence", "experiment", "person", "project",
  ],
  edgeTypes: [
    "contains", "part-of", "causes", "supports", "contradicts",
    "extends", "depends-on", "exemplifies", "precedes", "leads-to",
    "evolved-from", "related-to", "authored-by", "sourced-from", "mentioned-in",
  ],

  openWorkspace: async (path: string) => {
    set({ isLoading: true, error: null });
    try {
      const api = await getAPI();
      log.info("stores::workspace", "opening workspace", { path });
      const info = await api.openWorkspace(path);
      log.info("stores::workspace", "workspace opened", { name: info.name, root: info.root, node_count: info.node_count, edge_count: info.edge_count });
      const stats = await api.getStats();
      log.info("stores::workspace", "stats loaded", { node_count: stats.node_count, edge_count: stats.edge_count });
      useUIStore.getState().clearHiddenEdgeTypes();
      set({ info, stats, isLoading: false });
    } catch (e) {
      log.error("stores::workspace", "failed to open workspace", { path, error: String(e) });
      set({ error: String(e), isLoading: false });
    }
  },

  closeWorkspace: () => {
    if (!get().info) return;
    useEditorStore.getState().clear();
    useGraphStore.getState().reset();
    useUIStore.getState().resetWorkspaceState();
    useSegmentStore.getState().setActiveSegmentId(null);
    useUndoStore.getState().clear();
    useNavigationStore.getState().reset();
    useTabStore.getState().reset();
    set({ info: null, stats: null, error: null });
  },

  refreshStats: async () => {
    try {
      const api = await getAPI();
      const stats = await api.getStats();
      set({ stats });
    } catch (e) {
      log.error("stores::workspace", "failed to refresh stats", { error: String(e) });
    }
  },
}));
