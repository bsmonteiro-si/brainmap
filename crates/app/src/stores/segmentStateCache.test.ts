import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  captureSnapshot,
  restoreSnapshot,
  cacheCurrentState,
  restoreCachedState,
  removeCachedState,
  hasCachedState,
  hasDirtyUntitledTabs,
  applyEventToSnapshot,
  clearAllCachedState,
  getCachedSegmentIds,
} from "./segmentStateCache";
import { useWorkspaceStore } from "./workspaceStore";
import { useEditorStore } from "./editorStore";
import { useGraphStore } from "./graphStore";
import { useTabStore } from "./tabStore";
import { useUndoStore } from "./undoStore";
import { useNavigationStore } from "./navigationStore";
import { useUIStore } from "./uiStore";
import type { WorkspaceInfo, NodeDto, WorkspaceEvent } from "../api/types";

// Mock API bridge
vi.mock("../api/bridge", () => ({
  getAPI: () => Promise.resolve({}),
}));

const MOCK_INFO: WorkspaceInfo = {
  name: "Test",
  root: "/test/workspace",
  node_count: 5,
  edge_count: 3,
};

function setupWorkspaceState() {
  useWorkspaceStore.setState({ info: MOCK_INFO, stats: null, isLoading: false, error: null });
  useGraphStore.setState({
    nodes: new Map([["A.md", { path: "A.md", title: "A", note_type: "concept" }]]),
    edges: [{ source: "A.md", target: "B.md", rel: "related-to", kind: "Explicit" }],
    workspaceFiles: ["A.md", "B.md"],
    selectedNodePath: "A.md",
    expandedNodes: new Set(["A.md"]),
    isLoading: false,
  });
  useEditorStore.setState({
    activeNote: null,
    activePlainFile: null,
    editedBody: "some text",
    editedFrontmatter: { title: "Modified" },
    isDirty: true,
    viewMode: "edit",
    rawContent: null,
    _rawDirty: false,
    conflictState: "none",
    isUntitledTab: false,
    fmUndoStack: [null],
    fmRedoStack: [],
    scrollTop: 42,
    cursorPos: 10,
    savingInProgress: false,
    isLoading: false,
    _lastFmField: null,
    _lastFmTime: 0,
  });
  useTabStore.setState({
    tabs: [{ id: "A.md", path: "A.md", kind: "note", title: "A", noteType: "concept", editedBody: null, editedFrontmatter: null, isDirty: false, conflictState: "none", fmUndoStack: [], fmRedoStack: [], viewMode: "edit", scrollTop: 0, cursorPos: 0 }],
    activeTabId: "A.md",
    _untitledCounter: 0,
  });
  useUndoStore.setState({ undoStack: [], redoStack: [], isProcessing: false, toastMessage: null, toastKey: 0 });
  useNavigationStore.setState({ history: ["A.md"], cursor: 0, _navigating: false });
  useUIStore.setState({
    hiddenEdgeTypes: new Set(["contains"]),
    graphFocusPath: null,
    graphFocusKind: null,
    treeExpandedFolders: new Set(["Concepts"]),
    emptyFolders: new Set(),
    activeLeftTab: "files",
    leftPanelCollapsed: false,
  });
}

beforeEach(() => {
  clearAllCachedState();
  // Reset stores to clean state
  useWorkspaceStore.setState({ info: null, stats: null, isLoading: false, error: null, switchInProgress: false });
  useEditorStore.getState().clear();
  useGraphStore.getState().reset();
  useTabStore.getState().reset();
  useUndoStore.getState().clear();
  useNavigationStore.getState().reset();
  useUIStore.getState().resetWorkspaceState();
});

describe("captureSnapshot", () => {
  it("throws if no workspace is open", () => {
    expect(() => captureSnapshot()).toThrow("Cannot capture snapshot");
  });

  it("captures all workspace-scoped state", () => {
    setupWorkspaceState();
    const snapshot = captureSnapshot();

    expect(snapshot.info).toEqual(MOCK_INFO);
    expect(snapshot.nodes.size).toBe(1);
    expect(snapshot.edges).toHaveLength(1);
    expect(snapshot.editedBody).toBe("some text");
    expect(snapshot.isDirty).toBe(true);
    expect(snapshot.tabs).toHaveLength(1);
    expect(snapshot.history).toEqual(["A.md"]);
    expect(snapshot.hiddenEdgeTypes.has("contains")).toBe(true);
    expect(snapshot.treeExpandedFolders.has("Concepts")).toBe(true);
  });

  it("deep clones Maps and Sets to prevent aliasing", () => {
    setupWorkspaceState();
    const snapshot = captureSnapshot();

    // Mutate store — snapshot should be unaffected
    useGraphStore.getState().reset();
    expect(snapshot.nodes.size).toBe(1);
    expect(snapshot.expandedNodes.size).toBe(1);
  });
});

describe("restoreSnapshot", () => {
  it("writes snapshot into all stores", () => {
    setupWorkspaceState();
    const snapshot = captureSnapshot();

    // Clear everything
    useWorkspaceStore.setState({ info: null, stats: null });
    useEditorStore.getState().clear();
    useGraphStore.getState().reset();
    useTabStore.getState().reset();
    useNavigationStore.getState().reset();
    useUIStore.getState().resetWorkspaceState();

    // Restore
    restoreSnapshot(snapshot);

    expect(useWorkspaceStore.getState().info).toEqual(MOCK_INFO);
    expect(useGraphStore.getState().nodes.size).toBe(1);
    expect(useEditorStore.getState().editedBody).toBe("some text");
    expect(useEditorStore.getState().isDirty).toBe(true);
    expect(useTabStore.getState().tabs).toHaveLength(1);
    expect(useNavigationStore.getState().history).toEqual(["A.md"]);
    expect(useUIStore.getState().hiddenEdgeTypes.has("contains")).toBe(true);
  });

  it("forces transient flags to safe values", () => {
    setupWorkspaceState();
    // Set transient flags to true
    useEditorStore.setState({ savingInProgress: true, isLoading: true });
    useNavigationStore.setState({ _navigating: true });
    useUndoStore.setState({ isProcessing: true });

    const snapshot = captureSnapshot();
    restoreSnapshot(snapshot);

    expect(useEditorStore.getState().savingInProgress).toBe(false);
    expect(useEditorStore.getState().isLoading).toBe(false);
    expect(useNavigationStore.getState()._navigating).toBe(false);
    expect(useUndoStore.getState().isProcessing).toBe(false);
  });
});

describe("cache API", () => {
  it("cacheCurrentState + hasCachedState + restoreCachedState round-trips", () => {
    setupWorkspaceState();
    cacheCurrentState("seg-1");
    expect(hasCachedState("seg-1")).toBe(true);

    // Clear stores
    useWorkspaceStore.setState({ info: null });
    useGraphStore.getState().reset();

    // Restore
    const ok = restoreCachedState("seg-1");
    expect(ok).toBe(true);
    expect(useWorkspaceStore.getState().info).toEqual(MOCK_INFO);
    expect(useGraphStore.getState().nodes.size).toBe(1);
  });

  it("restoreCachedState returns false for unknown segment", () => {
    expect(restoreCachedState("unknown")).toBe(false);
  });

  it("removeCachedState deletes the cache entry", () => {
    setupWorkspaceState();
    cacheCurrentState("seg-1");
    removeCachedState("seg-1");
    expect(hasCachedState("seg-1")).toBe(false);
  });

  it("clearAllCachedState removes all entries", () => {
    setupWorkspaceState();
    cacheCurrentState("seg-1");
    cacheCurrentState("seg-2");
    clearAllCachedState();
    expect(hasCachedState("seg-1")).toBe(false);
    expect(hasCachedState("seg-2")).toBe(false);
  });

  it("getCachedSegmentIds returns all cached IDs", () => {
    setupWorkspaceState();
    cacheCurrentState("seg-a");
    cacheCurrentState("seg-b");
    const ids = getCachedSegmentIds();
    expect(ids).toContain("seg-a");
    expect(ids).toContain("seg-b");
    expect(ids).toHaveLength(2);
  });

  it("getCachedSegmentIds returns empty array when no cache", () => {
    expect(getCachedSegmentIds()).toEqual([]);
  });
});

describe("hasDirtyUntitledTabs", () => {
  it("returns false when no untitled tabs exist", () => {
    expect(hasDirtyUntitledTabs()).toBe(false);
  });

  it("returns true when active stores have dirty untitled tab", () => {
    useTabStore.setState({
      tabs: [{
        id: "__untitled__/1", path: "__untitled__/1", kind: "untitled",
        title: "Untitled-1", noteType: null, editedBody: "content",
        editedFrontmatter: null, isDirty: true, conflictState: "none",
        fmUndoStack: [], fmRedoStack: [], viewMode: "edit", scrollTop: 0, cursorPos: 0,
      }],
      activeTabId: "__untitled__/1",
    });
    expect(hasDirtyUntitledTabs()).toBe(true);
  });

  it("returns true when cached snapshot has dirty untitled tab", () => {
    // Active stores have no untitled tabs
    useTabStore.setState({ tabs: [], activeTabId: null });

    // But a cached snapshot does
    setupWorkspaceState();
    useTabStore.setState({
      tabs: [{
        id: "__untitled__/1", path: "__untitled__/1", kind: "untitled",
        title: "Untitled-1", noteType: null, editedBody: "cached content",
        editedFrontmatter: null, isDirty: true, conflictState: "none",
        fmUndoStack: [], fmRedoStack: [], viewMode: "edit", scrollTop: 0, cursorPos: 0,
      }],
    });
    cacheCurrentState("seg-cached");

    // Reset active tabs
    useTabStore.setState({ tabs: [], activeTabId: null });

    expect(hasDirtyUntitledTabs()).toBe(true);
  });

  it("returns false for untitled tab with empty body", () => {
    useTabStore.setState({
      tabs: [{
        id: "__untitled__/1", path: "__untitled__/1", kind: "untitled",
        title: "Untitled-1", noteType: null, editedBody: "",
        editedFrontmatter: null, isDirty: false, conflictState: "none",
        fmUndoStack: [], fmRedoStack: [], viewMode: "edit", scrollTop: 0, cursorPos: 0,
      }],
    });
    expect(hasDirtyUntitledTabs()).toBe(false);
  });
});

describe("applyEventToSnapshot", () => {
  it("updates cached snapshot graph data on node-created event", () => {
    setupWorkspaceState();
    cacheCurrentState("seg-bg");

    const event: WorkspaceEvent = {
      type: "node-created",
      path: "New.md",
      node: { path: "New.md", title: "New", note_type: "concept" },
    };
    applyEventToSnapshot("seg-bg", event);

    // Restore and verify the node was added
    restoreCachedState("seg-bg");
    expect(useGraphStore.getState().nodes.has("New.md")).toBe(true);
  });

  it("no-ops for unknown segment ID", () => {
    // Should not throw
    applyEventToSnapshot("nonexistent", {
      type: "node-created",
      path: "X.md",
      node: { path: "X.md", title: "X", note_type: "concept" },
    });
  });

  it("handles topology-changed event on cached snapshot", () => {
    setupWorkspaceState();
    cacheCurrentState("seg-bg");

    const event: WorkspaceEvent = {
      type: "topology-changed",
      added_nodes: [{ path: "C.md", title: "C", note_type: "question" }],
      removed_nodes: ["A.md"],
      added_edges: [],
      removed_edges: [{ source: "A.md", target: "B.md", rel: "related-to", kind: "Explicit" }],
    };
    applyEventToSnapshot("seg-bg", event);

    restoreCachedState("seg-bg");
    expect(useGraphStore.getState().nodes.has("A.md")).toBe(false);
    expect(useGraphStore.getState().nodes.has("C.md")).toBe(true);
  });
});
