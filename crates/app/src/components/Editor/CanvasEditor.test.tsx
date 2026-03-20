import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTabStore } from "../../stores/tabStore";

vi.mock("@xyflow/react", () => ({
  ReactFlow: () => null,
  Controls: () => null,
  Background: () => null,
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => children,
  useNodesState: () => [[], vi.fn(), vi.fn()],
  useEdgesState: () => [[], vi.fn(), vi.fn()],
  useReactFlow: () => ({ toObject: vi.fn(), setViewport: vi.fn() }),
  addEdge: vi.fn(),
  MarkerType: { ArrowClosed: "arrowclosed" },
  Handle: () => null,
  Position: { Top: "top", Right: "right", Bottom: "bottom", Left: "left" },
}));

vi.mock("../../api/bridge", () => ({
  getAPI: () =>
    Promise.resolve({
      readPlainFile: vi.fn(),
      writePlainFile: vi.fn(),
    }),
}));

vi.mock("../../utils/logger", () => ({
  log: { error: vi.fn(), info: vi.fn(), debug: vi.fn(), warn: vi.fn() },
}));

describe("Canvas tab integration", () => {
  beforeEach(() => {
    useTabStore.getState().reset();
  });

  it("tab kind 'canvas' is accepted by openTab", () => {
    useTabStore.getState().openTab("test.canvas", "canvas", "test.canvas", null);
    const tab = useTabStore.getState().getTab("test.canvas");
    expect(tab).toBeDefined();
    expect(tab!.kind).toBe("canvas");
  });

  it("updateTabState sets isDirty for canvas tabs", () => {
    useTabStore.getState().openTab("d.canvas", "canvas", "d.canvas", null);
    useTabStore.getState().updateTabState("d.canvas", { isDirty: true });
    const tab = useTabStore.getState().getTab("d.canvas");
    expect(tab!.isDirty).toBe(true);
  });

  it("closeTab removes canvas tab", () => {
    useTabStore.getState().openTab("c.canvas", "canvas", "c.canvas", null);
    expect(useTabStore.getState().tabs).toHaveLength(1);
    useTabStore.getState().closeTab("c.canvas");
    expect(useTabStore.getState().tabs).toHaveLength(0);
  });

  it("navigateToActiveTab handles canvas tabs via clearForCustomTab", async () => {
    const { useEditorStore } = await import("../../stores/editorStore");
    const clearSpy = vi.spyOn(useEditorStore.getState(), "clearForCustomTab");

    useTabStore.getState().openTab("test.canvas", "canvas", "test.canvas", null);
    useTabStore.getState().openTab("other.md", "note", "Other", "concept");
    useTabStore.getState().activateTab("other.md");

    const { closeTabAndNavigateNext } = await import("../../stores/tabActions");
    closeTabAndNavigateNext("other.md");

    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});
