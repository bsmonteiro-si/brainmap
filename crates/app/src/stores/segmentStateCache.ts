/**
 * Manages per-segment state snapshots for multi-segment switching.
 *
 * When switching segments, the current stores' workspace-scoped state is
 * captured into a SegmentSnapshot and cached. When switching back, the
 * cached snapshot is restored into the stores.
 *
 * Snapshots are ephemeral (in-memory only, lost on page reload).
 */

import type { WorkspaceInfo, StatsDto, NodeDto, EdgeDto, NoteDetail, PlainFileDetail, WorkspaceEvent } from "../api/types";
import type { EditableFrontmatter } from "./editorStore";
import type { TabState } from "./tabStore";
import type { UndoableAction } from "./undoStore";
import type { LeftTab } from "./uiStore";
import { useWorkspaceStore } from "./workspaceStore";
import { useEditorStore } from "./editorStore";
import { useGraphStore } from "./graphStore";
import { useTabStore } from "./tabStore";
import { useUndoStore } from "./undoStore";
import { useNavigationStore } from "./navigationStore";
import { useUIStore } from "./uiStore";
import { applyTopologyDiff } from "./graphDiff";

// ── Snapshot type ─────────────────────────────────────────────────────

type FmSnapshot = Partial<EditableFrontmatter> | null;

export interface SegmentSnapshot {
  // workspaceStore
  info: WorkspaceInfo;
  stats: StatsDto | null;

  // graphStore
  nodes: Map<string, NodeDto>;
  edges: EdgeDto[];
  workspaceFiles: string[];
  selectedNodePath: string | null;
  expandedNodes: Set<string>;

  // editorStore — all workspace-scoped fields
  activeNote: NoteDetail | null;
  activePlainFile: PlainFileDetail | null;
  editedBody: string | null;
  editedFrontmatter: Partial<EditableFrontmatter> | null;
  isDirty: boolean;
  viewMode: "edit" | "preview" | "raw";
  rawContent: string | null;
  _rawDirty: boolean;
  conflictState: "none" | "external-change";
  isUntitledTab: boolean;
  fmUndoStack: FmSnapshot[];
  fmRedoStack: FmSnapshot[];
  scrollTop: number;
  cursorPos: number;
  // NOTE: savingInProgress, isLoading are NEVER captured — always restored as false.

  // tabStore
  tabs: TabState[];
  activeTabId: string | null;
  untitledCounter: number;

  // undoStore
  undoStack: UndoableAction[];
  redoStack: UndoableAction[];

  // navigationStore
  history: string[];
  cursor: number;
  // NOTE: _navigating always restored as false.

  // uiStore (workspace-scoped)
  hiddenEdgeTypes: Set<string>;
  graphFocusPath: string | null;
  graphFocusKind: "note" | "folder" | null;
  treeExpandedFolders: Set<string>;
  emptyFolders: Set<string>;
  activeLeftTab: LeftTab;
  leftPanelCollapsed: boolean;
}

// ── Module-level cache ────────────────────────────────────────────────

const cache = new Map<string, SegmentSnapshot>();

// ── Deep clone helpers (prevent aliasing bugs) ────────────────────────

function cloneMap<K, V extends object>(m: Map<K, V>): Map<K, V> {
  return new Map([...m].map(([k, v]) => [k, { ...v }]));
}

function cloneSet<T>(s: Set<T>): Set<T> {
  return new Set(s);
}

// ── Capture / Restore ─────────────────────────────────────────────────

/** Read all workspace-scoped stores and assemble a snapshot. */
export function captureSnapshot(): SegmentSnapshot {
  const ws = useWorkspaceStore.getState();
  const editor = useEditorStore.getState();
  const graph = useGraphStore.getState();
  const tab = useTabStore.getState();
  const undo = useUndoStore.getState();
  const nav = useNavigationStore.getState();
  const ui = useUIStore.getState();

  if (!ws.info) {
    throw new Error("Cannot capture snapshot without active workspace");
  }

  return {
    // workspaceStore
    info: ws.info,
    stats: ws.stats,

    // graphStore — deep clone Map/Set
    nodes: cloneMap(graph.nodes),
    edges: graph.edges.map((e) => ({ ...e })),
    workspaceFiles: [...graph.workspaceFiles],
    selectedNodePath: graph.selectedNodePath,
    expandedNodes: cloneSet(graph.expandedNodes),

    // editorStore
    activeNote: editor.activeNote,
    activePlainFile: editor.activePlainFile,
    editedBody: editor.editedBody,
    editedFrontmatter: editor.editedFrontmatter,
    isDirty: editor.isDirty,
    viewMode: editor.viewMode,
    rawContent: editor.rawContent,
    _rawDirty: editor._rawDirty,
    conflictState: editor.conflictState,
    isUntitledTab: editor.isUntitledTab,
    fmUndoStack: [...editor.fmUndoStack],
    fmRedoStack: [...editor.fmRedoStack],
    scrollTop: editor.scrollTop,
    cursorPos: editor.cursorPos,

    // tabStore
    tabs: tab.tabs.map((t) => structuredClone(t)),
    activeTabId: tab.activeTabId,
    untitledCounter: tab._untitledCounter,

    // undoStore
    undoStack: [...undo.undoStack],
    redoStack: [...undo.redoStack],

    // navigationStore
    history: [...nav.history],
    cursor: nav.cursor,

    // uiStore (workspace-scoped)
    hiddenEdgeTypes: cloneSet(ui.hiddenEdgeTypes),
    graphFocusPath: ui.graphFocusPath,
    graphFocusKind: ui.graphFocusKind,
    treeExpandedFolders: cloneSet(ui.treeExpandedFolders),
    emptyFolders: cloneSet(ui.emptyFolders),
    activeLeftTab: ui.activeLeftTab,
    leftPanelCollapsed: ui.leftPanelCollapsed,
  };
}

/** Write a snapshot into all workspace-scoped stores atomically. */
export function restoreSnapshot(snapshot: SegmentSnapshot): void {
  // workspaceStore
  useWorkspaceStore.setState({
    info: snapshot.info,
    stats: snapshot.stats,
    isLoading: false,
    error: null,
  });

  // graphStore
  useGraphStore.setState({
    nodes: cloneMap(snapshot.nodes),
    edges: [...snapshot.edges],
    workspaceFiles: [...snapshot.workspaceFiles],
    selectedNodePath: snapshot.selectedNodePath,
    expandedNodes: cloneSet(snapshot.expandedNodes),
    isLoading: false,
  });

  // editorStore — transient flags forced to safe values
  useEditorStore.setState({
    activeNote: snapshot.activeNote,
    activePlainFile: snapshot.activePlainFile,
    editedBody: snapshot.editedBody,
    editedFrontmatter: snapshot.editedFrontmatter,
    isDirty: snapshot.isDirty,
    viewMode: snapshot.viewMode,
    rawContent: snapshot.rawContent,
    _rawDirty: snapshot._rawDirty,
    conflictState: snapshot.conflictState,
    isUntitledTab: snapshot.isUntitledTab,
    fmUndoStack: [...snapshot.fmUndoStack],
    fmRedoStack: [...snapshot.fmRedoStack],
    scrollTop: snapshot.scrollTop,
    cursorPos: snapshot.cursorPos,
    savingInProgress: false,
    isLoading: false,
    _lastFmField: null,
    _lastFmTime: 0,
  });

  // tabStore
  useTabStore.setState({
    tabs: snapshot.tabs.map((t) => structuredClone(t)),
    activeTabId: snapshot.activeTabId,
    _untitledCounter: snapshot.untitledCounter,
  });

  // undoStore — transient flags forced to safe values
  useUndoStore.setState({
    undoStack: [...snapshot.undoStack],
    redoStack: [...snapshot.redoStack],
    isProcessing: false,
    toastMessage: null,
  });

  // navigationStore — _navigating forced to false
  useNavigationStore.setState({
    history: [...snapshot.history],
    cursor: snapshot.cursor,
    _navigating: false,
  });

  // uiStore (workspace-scoped only)
  useUIStore.setState({
    hiddenEdgeTypes: cloneSet(snapshot.hiddenEdgeTypes),
    graphFocusPath: snapshot.graphFocusPath,
    graphFocusKind: snapshot.graphFocusKind,
    treeExpandedFolders: cloneSet(snapshot.treeExpandedFolders),
    emptyFolders: cloneSet(snapshot.emptyFolders),
    activeLeftTab: snapshot.activeLeftTab,
    leftPanelCollapsed: snapshot.leftPanelCollapsed,
  });
}

// ── Cache API ─────────────────────────────────────────────────────────

/** Capture the current stores' state and cache it under `segmentId`. */
export function cacheCurrentState(segmentId: string): void {
  cache.set(segmentId, captureSnapshot());
}

/** Restore a cached snapshot for `segmentId` into all stores.
 *  Returns false if no cached state exists. */
export function restoreCachedState(segmentId: string): boolean {
  const snapshot = cache.get(segmentId);
  if (!snapshot) return false;
  restoreSnapshot(snapshot);
  return true;
}

/** Remove a cached snapshot. */
export function removeCachedState(segmentId: string): void {
  cache.delete(segmentId);
}

/** Check if a cached snapshot exists. */
export function hasCachedState(segmentId: string): boolean {
  return cache.has(segmentId);
}

/** Check if any open segment (active or cached) has dirty untitled tabs.
 *  Used by the `beforeunload` handler. */
export function hasDirtyUntitledTabs(): boolean {
  // Check active stores
  const activeTabs = useTabStore.getState().tabs;
  for (const t of activeTabs) {
    if (t.kind === "untitled" && (t.editedBody ?? "").length > 0) {
      return true;
    }
  }

  // Check all cached snapshots
  for (const snapshot of cache.values()) {
    for (const t of snapshot.tabs) {
      if (t.kind === "untitled" && (t.editedBody ?? "").length > 0) {
        return true;
      }
    }
  }

  return false;
}

/** Apply a workspace event to a cached snapshot's graph data.
 *  Used for background segment file watcher events. */
export function applyEventToSnapshot(segmentId: string, event: WorkspaceEvent): void {
  const snapshot = cache.get(segmentId);
  if (!snapshot) return;

  const result = applyTopologyDiff(
    { nodes: snapshot.nodes, edges: snapshot.edges, workspaceFiles: snapshot.workspaceFiles },
    event,
  );

  snapshot.nodes = result.nodes;
  snapshot.edges = result.edges;
  snapshot.workspaceFiles = result.workspaceFiles;
}

/** Get all cached segment IDs. */
export function getCachedSegmentIds(): string[] {
  return Array.from(cache.keys());
}

/** Clear all cached state. */
export function clearAllCachedState(): void {
  cache.clear();
}
