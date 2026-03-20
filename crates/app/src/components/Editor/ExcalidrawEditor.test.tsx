import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useTabStore } from "../../stores/tabStore";

// Mock Excalidraw module
vi.mock("@excalidraw/excalidraw", () => ({
  Excalidraw: (props: Record<string, unknown>) => {
    // Store props so tests can trigger onChange
    (globalThis as Record<string, unknown>).__excalidrawProps = props;
    return null;
  },
}));

// Mock API bridge
const mockReadPlainFile = vi.fn();
const mockWritePlainFile = vi.fn();
vi.mock("../../api/bridge", () => ({
  getAPI: () =>
    Promise.resolve({
      readPlainFile: mockReadPlainFile,
      writePlainFile: mockWritePlainFile,
    }),
}));

// Mock logger
vi.mock("../../utils/logger", () => ({
  log: { error: vi.fn(), info: vi.fn(), debug: vi.fn(), warn: vi.fn() },
}));

// Valid excalidraw JSON
const VALID_DRAWING = JSON.stringify({
  type: "excalidraw",
  version: 2,
  source: "brainmap",
  elements: [{ id: "rect1", type: "rectangle" }],
  appState: { viewBackgroundColor: "#fff" },
  files: {},
});

const EMPTY_DRAWING = JSON.stringify({
  type: "excalidraw",
  version: 2,
  source: "brainmap",
  elements: [],
  appState: {},
  files: {},
});

describe("ExcalidrawEditor", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useTabStore.getState().reset();
    mockReadPlainFile.mockReset();
    mockWritePlainFile.mockReset();
    (globalThis as Record<string, unknown>).__excalidrawProps = undefined;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("tab kind 'excalidraw' is accepted by openTab", () => {
    useTabStore.getState().openTab("test.excalidraw", "excalidraw", "test.excalidraw", null);
    const tab = useTabStore.getState().getTab("test.excalidraw");
    expect(tab).toBeDefined();
    expect(tab!.kind).toBe("excalidraw");
  });

  it("createFreshTab supports excalidraw kind", () => {
    useTabStore.getState().openTab("a.excalidraw", "excalidraw", "a.excalidraw", null);
    const tab = useTabStore.getState().getTab("a.excalidraw");
    expect(tab!.editedBody).toBeNull();
    expect(tab!.isDirty).toBe(false);
    expect(tab!.viewMode).toBe("edit");
  });

  it("updateTabState sets isDirty for excalidraw tabs", () => {
    useTabStore.getState().openTab("d.excalidraw", "excalidraw", "d.excalidraw", null);
    useTabStore.getState().updateTabState("d.excalidraw", { isDirty: true });
    const tab = useTabStore.getState().getTab("d.excalidraw");
    expect(tab!.isDirty).toBe(true);
  });

  it("closeTab removes excalidraw tab", () => {
    useTabStore.getState().openTab("c.excalidraw", "excalidraw", "c.excalidraw", null);
    expect(useTabStore.getState().tabs).toHaveLength(1);
    useTabStore.getState().closeTab("c.excalidraw");
    expect(useTabStore.getState().tabs).toHaveLength(0);
  });
});

describe("ExcalidrawEditor tab routing", () => {
  beforeEach(() => {
    useTabStore.getState().reset();
  });

  it("navigateToActiveTab handles excalidraw tabs via clearForCustomTab", async () => {
    // This tests that tabActions.ts handles excalidraw tabs by calling clearForCustomTab
    // instead of falling through to openPlainFile
    const { useEditorStore } = await import("../../stores/editorStore");
    const clearSpy = vi.spyOn(useEditorStore.getState(), "clearForCustomTab");

    useTabStore.getState().openTab("test.excalidraw", "excalidraw", "test.excalidraw", null);

    const { closeTabAndNavigateNext } = await import("../../stores/tabActions");
    // Open a second tab so closing the first navigates to the excalidraw one
    useTabStore.getState().openTab("other.md", "note", "Other", "concept");
    useTabStore.getState().activateTab("other.md");

    // Close the note tab — should navigate to excalidraw tab
    closeTabAndNavigateNext("other.md");

    // clearForCustomTab should have been called (since next tab is excalidraw)
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});
