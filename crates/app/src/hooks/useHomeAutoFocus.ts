import { useEffect, useRef } from "react";
import { useGraphStore } from "../stores/graphStore";
import { useUIStore, loadHomeNoteForWorkspace } from "../stores/uiStore";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { autoDetectHomeNote } from "../utils/homeNoteDetect";

/**
 * Reactive hook that auto-focuses the graph on the home/index note
 * when a workspace finishes loading for the first time.
 *
 * - If a home note was persisted (user explicitly set one), restores it
 *   but does NOT override layout/focus (user's view preferences preserved).
 * - If no home note was persisted, auto-detects an index-type note and
 *   opens with radial layout focused on it.
 */
export function useHomeAutoFocus() {
  const info = useWorkspaceStore((s) => s.info);
  const nodes = useGraphStore((s) => s.nodes);
  const prevRootRef = useRef<string | null>(null);

  useEffect(() => {
    const root = info?.root ?? null;
    // Only run when workspace root changes (new workspace opened) and nodes are loaded
    if (!root || root === prevRootRef.current || nodes.size === 0) return;
    prevRootRef.current = root;

    const ui = useUIStore.getState();

    // If homeNotePath is already set (e.g. restored from segment cache), skip
    if (ui.homeNotePath) return;

    // Try to load persisted home note for this workspace
    const persisted = loadHomeNoteForWorkspace(root);
    if (persisted && nodes.has(persisted)) {
      ui.setHomeNote(persisted);
      // Don't force layout/focus — respect user's previous view preferences
      return;
    }

    // Auto-detect: find an index-type note and focus on it
    const detected = autoDetectHomeNote(nodes);
    if (detected && nodes.has(detected)) {
      ui.setHomeNote(detected);
      ui.setGraphFocus(detected, "note");
      ui.setGraphLayout("radial");
    }
  }, [info, nodes]);
}
