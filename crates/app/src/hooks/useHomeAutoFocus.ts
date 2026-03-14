import { useEffect } from "react";
import { useGraphStore } from "../stores/graphStore";
import { useUIStore, loadHomeNoteForWorkspace } from "../stores/uiStore";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { autoDetectHomeNote } from "../utils/homeNoteDetect";

// Module-level flag — survives React StrictMode double-mount.
// Tracks the last workspace root we auto-focused on.
let lastAutoFocusedRoot: string | null = null;

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
  useEffect(() => {
    const root = useWorkspaceStore.getState().info?.root ?? null;
    const nodes = useGraphStore.getState().nodes;

    // Reset when workspace is closed so reopening triggers auto-focus again
    if (!root) {
      lastAutoFocusedRoot = null;
      return;
    }

    // Guard: only run once per workspace root
    if (nodes.size === 0 || root === lastAutoFocusedRoot) return;
    lastAutoFocusedRoot = root;

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
      // Defer state updates out of React's render cycle to prevent infinite loop
      queueMicrotask(() => {
        useUIStore.getState().setGraphFocus(detected, "note");
        useUIStore.getState().setGraphLayout("radial");
      });
    }
  }); // No deps — runs after every render, but module-level flag ensures body runs once per workspace
}
