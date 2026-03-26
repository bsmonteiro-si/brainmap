import { describe, it, expect, beforeEach, vi } from "vitest";
import { useWorkspaceStore } from "./workspaceStore";
import { useGraphStore } from "./graphStore";
import { useEditorStore } from "./editorStore";

// Mock getAPI to return controllable stubs
const mockApi = {
  refreshWorkspace: vi.fn(),
  getStats: vi.fn(),
  getGraphTopology: vi.fn(),
  listWorkspaceFiles: vi.fn(),
};

vi.mock("../api/bridge", () => ({
  getAPI: () => Promise.resolve(mockApi),
}));

describe("refreshSegment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset stores to a known state
    useWorkspaceStore.setState({
      info: { name: "Test", root: "/test", node_count: 5, edge_count: 3 },
      stats: { node_count: 5, edge_count: 3, tag_count: 1, type_counts: {} },
      isLoading: false,
      error: null,
      switchInProgress: false,
    });
    useGraphStore.getState().reset();
  });

  it("calls refreshWorkspace, getStats, and loadTopology in sequence", async () => {
    mockApi.refreshWorkspace.mockResolvedValue({
      name: "Test",
      root: "/test",
      node_count: 10,
      edge_count: 7,
    });
    mockApi.getStats.mockResolvedValue({
      node_count: 10,
      edge_count: 7,
      tag_count: 2,
      type_counts: {},
    });
    mockApi.getGraphTopology.mockResolvedValue({
      nodes: [{ path: "a.md", title: "A", note_type: "concept", tags: [], status: "seed", in_degree: 0, is_folder: false }],
      edges: [],
    });
    mockApi.listWorkspaceFiles.mockResolvedValue(["a.md"]);

    await useWorkspaceStore.getState().refreshSegment();

    expect(mockApi.refreshWorkspace).toHaveBeenCalledOnce();
    expect(mockApi.getStats).toHaveBeenCalledOnce();
    // loadTopology calls getGraphTopology + listWorkspaceFiles
    expect(mockApi.getGraphTopology).toHaveBeenCalledOnce();
    expect(mockApi.listWorkspaceFiles).toHaveBeenCalledOnce();

    const state = useWorkspaceStore.getState();
    expect(state.info?.node_count).toBe(10);
    expect(state.stats?.node_count).toBe(10);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();

    // Graph store should have the refreshed topology
    expect(useGraphStore.getState().nodes.size).toBe(1);
  });

  it("sets error on failure and clears isLoading", async () => {
    mockApi.refreshWorkspace.mockRejectedValue(new Error("disk error"));

    await useWorkspaceStore.getState().refreshSegment();

    const state = useWorkspaceStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe("Error: disk error");
    // Info should remain unchanged
    expect(state.info?.node_count).toBe(5);
  });

  it("no-ops when no workspace is open", async () => {
    useWorkspaceStore.setState({ info: null });

    await useWorkspaceStore.getState().refreshSegment();

    expect(mockApi.refreshWorkspace).not.toHaveBeenCalled();
  });

  it("no-ops when already loading", async () => {
    useWorkspaceStore.setState({ isLoading: true });

    await useWorkspaceStore.getState().refreshSegment();

    expect(mockApi.refreshWorkspace).not.toHaveBeenCalled();
  });

  it("calls markExternalChange after loadTopology to refresh editor content", async () => {
    mockApi.refreshWorkspace.mockResolvedValue({
      name: "Test", root: "/test", node_count: 10, edge_count: 7,
    });
    mockApi.getStats.mockResolvedValue({
      node_count: 10, edge_count: 7, tag_count: 2, type_counts: {},
    });
    mockApi.getGraphTopology.mockResolvedValue({ nodes: [], edges: [] });
    mockApi.listWorkspaceFiles.mockResolvedValue([]);

    const spy = vi.spyOn(useEditorStore.getState(), "markExternalChange").mockResolvedValue();

    await useWorkspaceStore.getState().refreshSegment();

    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });
});
