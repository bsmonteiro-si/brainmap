import { create } from "zustand";
import type { StatsDto, WorkspaceInfo } from "../api/types";
import { getAPI } from "../api/bridge";
import { useUIStore, registerWorkspaceStoreForUIStore } from "./uiStore";
import { useGraphStore } from "./graphStore";
import { useEditorStore } from "./editorStore";
import { useSegmentStore } from "./segmentStore";
import { useUndoStore } from "./undoStore";
import { useNavigationStore } from "./navigationStore";
import { useTabStore } from "./tabStore";
import {
  cacheCurrentState,
  restoreCachedState,
  removeCachedState,
  hasCachedState,
  clearAllCachedState,
} from "./segmentStateCache";
import { log } from "../utils/logger";

interface WorkspaceState {
  info: WorkspaceInfo | null;
  stats: StatsDto | null;
  isLoading: boolean;
  error: string | null;
  switchInProgress: boolean;
  noteTypes: string[];
  edgeTypes: string[];
  openWorkspace: (path: string) => Promise<void>;
  closeWorkspace: () => void;
  switchSegment: (segmentId: string, opts?: { skipOutgoingCache?: boolean }) => Promise<void>;
  closeSegment: (segmentId: string) => Promise<void>;
  refreshStats: () => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  info: null,
  stats: null,
  isLoading: false,
  error: null,
  switchInProgress: false,
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
    clearAllCachedState();
    set({ info: null, stats: null, error: null });
  },

  switchSegment: async (segmentId: string, opts?: { skipOutgoingCache?: boolean }) => {
    const { switchInProgress } = get();
    const segStore = useSegmentStore.getState();

    // No-op if already active
    if (segStore.activeSegmentId === segmentId) return;

    // Concurrency guard
    if (switchInProgress) return;
    set({ switchInProgress: true });

    const currentSegmentId = segStore.activeSegmentId;
    const currentSegment = currentSegmentId
      ? segStore.segments.find((s) => s.id === currentSegmentId)
      : null;
    const targetSegment = segStore.segments.find((s) => s.id === segmentId);
    if (!targetSegment) {
      log.error("stores::workspace", "switchSegment: segment not found", { segmentId });
      set({ switchInProgress: false });
      return;
    }

    try {
      // 1. Force save any dirty editor state
      const editor = useEditorStore.getState();
      if (editor.isDirty && !editor.savingInProgress) {
        await editor.saveNote();
      }

      // 2. Wait for any in-flight save to complete (with timeout)
      const waitStart = Date.now();
      while (useEditorStore.getState().savingInProgress && Date.now() - waitStart < 2000) {
        await new Promise((r) => setTimeout(r, 50));
      }

      // 3. Cache current segment state (skip if caller says so, e.g. closeSegment)
      if (currentSegmentId && !opts?.skipOutgoingCache) {
        cacheCurrentState(currentSegmentId);
      }

      // 4. Switch backend active workspace / open if needed
      const api = await getAPI();

      if (hasCachedState(segmentId)) {
        // Segment was previously open — just switch the backend
        try {
          await api.switchWorkspace(targetSegment.path);
        } catch (e) {
          log.error("stores::workspace", "switchSegment: backend switch failed, rolling back", { error: String(e) });
          // Rollback: restore previous segment's frontend state AND backend
          if (currentSegmentId) {
            restoreCachedState(currentSegmentId);
            if (currentSegment) {
              try { await api.switchWorkspace(currentSegment.path); } catch { /* best effort */ }
            }
          }
          set({ switchInProgress: false });
          return;
        }
        // Restore cached frontend state
        restoreCachedState(segmentId);
        set({ error: null });
      } else {
        // First open — tell backend to open the workspace
        // openWorkspace returns info and sets this as the active root on the backend
        let info: WorkspaceInfo;
        try {
          info = await api.openWorkspace(targetSegment.path);
        } catch (e) {
          log.error("stores::workspace", "switchSegment: backend open failed, rolling back", { error: String(e) });
          if (currentSegmentId) {
            restoreCachedState(currentSegmentId);
            if (currentSegment) {
              try { await api.switchWorkspace(currentSegment.path); } catch { /* best effort */ }
            }
          }
          set({ switchInProgress: false, error: String(e) });
          return;
        }
        // Clear stores for fresh state
        useEditorStore.getState().clear();
        useGraphStore.getState().reset();
        useUIStore.getState().resetWorkspaceState();
        useUndoStore.getState().clear();
        useNavigationStore.getState().reset();
        useTabStore.getState().reset();

        const stats = await api.getStats();
        set({ info, stats, isLoading: false, error: null });

        // Load topology for the new segment
        await useGraphStore.getState().loadTopology();

        // Mark as open
        segStore.addOpenSegment(segmentId);
      }

      // 5. Update segment store
      segStore.setActiveSegmentId(segmentId);
      segStore.touchSegment(segmentId);

    } catch (e) {
      log.error("stores::workspace", "switchSegment: unexpected error", { error: String(e) });
      // Attempt rollback
      if (currentSegmentId) {
        restoreCachedState(currentSegmentId);
      }
    } finally {
      set({ switchInProgress: false });
    }
  },

  closeSegment: async (segmentId: string) => {
    const segStore = useSegmentStore.getState();
    const targetSegment = segStore.segments.find((s) => s.id === segmentId);
    if (!targetSegment) return;

    const isActive = segStore.activeSegmentId === segmentId;

    if (isActive) {
      // Save dirty state before closing
      const editor = useEditorStore.getState();
      if (editor.isDirty && !editor.savingInProgress) {
        await editor.saveNote();
      }
      const waitStart = Date.now();
      while (useEditorStore.getState().savingInProgress && Date.now() - waitStart < 2000) {
        await new Promise((r) => setTimeout(r, 50));
      }
    }

    // Remove from open segment list (so switchSegment won't try to switch back here)
    segStore.removeOpenSegment(segmentId);

    if (isActive) {
      // Switch to next segment before closing backend/cache
      const openIds = useSegmentStore.getState().openSegmentIds;
      if (openIds.length > 0) {
        // skipOutgoingCache: true — we don't need to cache the closing segment
        await get().switchSegment(openIds[openIds.length - 1], { skipOutgoingCache: true });
      } else {
        // No segments remain — full reset
        get().closeWorkspace();
      }
    }

    // Now safe to clean up cache and backend
    removeCachedState(segmentId);
    try {
      const api = await getAPI();
      await api.closeWorkspace(targetSegment.path);
    } catch (e) {
      log.warn("stores::workspace", "closeSegment: backend close failed (continuing)", { error: String(e) });
    }
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

// Register lazy workspace root getter for uiStore home note persistence
registerWorkspaceStoreForUIStore(() => useWorkspaceStore.getState().info?.root ?? null);
