import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore, getTabSizes } from "./uiStore";

beforeEach(() => {
  // Reset the relevant slice of store state between tests
  useUIStore.setState({
    createNoteDialogOpen: false,
    createNoteInitialPath: null,
    createNoteInitialTitle: null,
    createNoteMode: "default",
    createAndLinkSource: null,
  });
});


describe("openCreateNoteDialog / closeCreateNoteDialog", () => {
  it("opens dialog with null initial path when called without arguments", () => {
    useUIStore.getState().openCreateNoteDialog();
    const { createNoteDialogOpen, createNoteInitialPath } = useUIStore.getState();
    expect(createNoteDialogOpen).toBe(true);
    expect(createNoteInitialPath).toBeNull();
  });

  it("opens dialog and stores the provided initial path", () => {
    useUIStore.getState().openCreateNoteDialog("Concepts/");
    const { createNoteDialogOpen, createNoteInitialPath } = useUIStore.getState();
    expect(createNoteDialogOpen).toBe(true);
    expect(createNoteInitialPath).toBe("Concepts/");
  });

  it("closeCreateNoteDialog resets both flags", () => {
    useUIStore.getState().openCreateNoteDialog("Concepts/");
    useUIStore.getState().closeCreateNoteDialog();
    const { createNoteDialogOpen, createNoteInitialPath } = useUIStore.getState();
    expect(createNoteDialogOpen).toBe(false);
    expect(createNoteInitialPath).toBeNull();
  });

  it("accepts options object with initialTitle, mode, and linkSource", () => {
    useUIStore.getState().openCreateNoteDialog({
      initialTitle: "New Concept",
      mode: "create-and-link",
      linkSource: { notePath: "Notes/Test.md", rel: "causes" },
    });
    const s = useUIStore.getState();
    expect(s.createNoteDialogOpen).toBe(true);
    expect(s.createNoteInitialPath).toBeNull();
    expect(s.createNoteInitialTitle).toBe("New Concept");
    expect(s.createNoteMode).toBe("create-and-link");
    expect(s.createAndLinkSource).toEqual({ notePath: "Notes/Test.md", rel: "causes" });
  });

  it("closeCreateNoteDialog clears all create-and-link fields", () => {
    useUIStore.getState().openCreateNoteDialog({
      initialTitle: "Test",
      mode: "create-and-link",
      linkSource: { notePath: "Notes/X.md", rel: "supports" },
    });
    useUIStore.getState().closeCreateNoteDialog();
    const s = useUIStore.getState();
    expect(s.createNoteDialogOpen).toBe(false);
    expect(s.createNoteInitialTitle).toBeNull();
    expect(s.createNoteMode).toBe("default");
    expect(s.createAndLinkSource).toBeNull();
  });
});

describe("openCreateFolderDialog / closeCreateFolderDialog", () => {
  beforeEach(() => {
    useUIStore.setState({ createFolderDialogOpen: false, createFolderInitialPath: null });
  });

  it("opens dialog with null initial path when called without arguments", () => {
    useUIStore.getState().openCreateFolderDialog();
    const { createFolderDialogOpen, createFolderInitialPath } = useUIStore.getState();
    expect(createFolderDialogOpen).toBe(true);
    expect(createFolderInitialPath).toBeNull();
  });

  it("opens dialog and stores the provided initial path", () => {
    useUIStore.getState().openCreateFolderDialog("Concepts/");
    const { createFolderDialogOpen, createFolderInitialPath } = useUIStore.getState();
    expect(createFolderDialogOpen).toBe(true);
    expect(createFolderInitialPath).toBe("Concepts/");
  });

  it("closeCreateFolderDialog resets both flags", () => {
    useUIStore.getState().openCreateFolderDialog("Concepts/");
    useUIStore.getState().closeCreateFolderDialog();
    const { createFolderDialogOpen, createFolderInitialPath } = useUIStore.getState();
    expect(createFolderDialogOpen).toBe(false);
    expect(createFolderInitialPath).toBeNull();
  });
});

describe("zoom actions", () => {
  beforeEach(() => {
    localStorage.clear();
    useUIStore.setState({ uiZoom: 1.0 });
  });

  it("zoomIn increments by 0.1", () => {
    useUIStore.getState().zoomIn();
    expect(useUIStore.getState().uiZoom).toBe(1.1);
  });

  it("zoomOut decrements by 0.1", () => {
    useUIStore.getState().zoomOut();
    expect(useUIStore.getState().uiZoom).toBe(0.9);
  });

  it("resetZoom returns to 1.0", () => {
    useUIStore.setState({ uiZoom: 1.4 });
    useUIStore.getState().resetZoom();
    expect(useUIStore.getState().uiZoom).toBe(1.0);
  });

  it("zoomIn clamps at 2.0", () => {
    useUIStore.setState({ uiZoom: 2.0 });
    useUIStore.getState().zoomIn();
    expect(useUIStore.getState().uiZoom).toBe(2.0);
  });

  it("zoomOut clamps at 0.5", () => {
    useUIStore.setState({ uiZoom: 0.5 });
    useUIStore.getState().zoomOut();
    expect(useUIStore.getState().uiZoom).toBe(0.5);
  });

  it("zoomIn persists uiZoom to localStorage", () => {
    useUIStore.getState().zoomIn();
    const stored = JSON.parse(localStorage.getItem("brainmap:uiPrefs") ?? "{}");
    expect(stored.uiZoom).toBe(1.1);
  });
});

describe("emptyFolders actions", () => {
  beforeEach(() => {
    useUIStore.setState({
      emptyFolders: new Set<string>(),
      treeExpandedFolders: new Set<string>(),
    });
  });

  it("addEmptyFolder adds path to the set", () => {
    useUIStore.getState().addEmptyFolder("NewFolder");
    expect(useUIStore.getState().emptyFolders.has("NewFolder")).toBe(true);
  });

  it("addEmptyFolder auto-expands ancestor folders", () => {
    useUIStore.getState().addEmptyFolder("a/b/c");
    const expanded = useUIStore.getState().treeExpandedFolders;
    expect(expanded.has("a")).toBe(true);
    expect(expanded.has("a/b")).toBe(true);
    // The folder itself is not expanded (it has no children yet)
    expect(expanded.has("a/b/c")).toBe(false);
  });

  it("addEmptyFolder for root-level folder does not expand anything", () => {
    useUIStore.getState().addEmptyFolder("TopLevel");
    const expanded = useUIStore.getState().treeExpandedFolders;
    expect(expanded.size).toBe(0);
  });

  it("removeEmptyFolder removes path from the set", () => {
    useUIStore.setState({ emptyFolders: new Set(["a", "b"]) });
    useUIStore.getState().removeEmptyFolder("a");
    const folders = useUIStore.getState().emptyFolders;
    expect(folders.has("a")).toBe(false);
    expect(folders.has("b")).toBe(true);
  });

  it("resetWorkspaceState clears emptyFolders", () => {
    useUIStore.setState({ emptyFolders: new Set(["x", "y"]) });
    useUIStore.getState().resetWorkspaceState();
    expect(useUIStore.getState().emptyFolders.size).toBe(0);
  });
});

describe("activeLeftTab / leftPanelCollapsed", () => {
  beforeEach(() => {
    useUIStore.setState({
      activeLeftTab: "files",
      leftPanelCollapsed: false,
      focusMode: false,
      graphFocusPath: null,
      graphFocusKind: null,
    });
  });

  it("defaults to files tab, not collapsed", () => {
    const s = useUIStore.getState();
    expect(s.activeLeftTab).toBe("files");
    expect(s.leftPanelCollapsed).toBe(false);
  });

  it("setActiveLeftTab switches tab", () => {
    useUIStore.getState().setActiveLeftTab("graph");
    expect(useUIStore.getState().activeLeftTab).toBe("graph");
  });

  it("setActiveLeftTab expands panel if collapsed", () => {
    useUIStore.setState({ leftPanelCollapsed: true });
    useUIStore.getState().setActiveLeftTab("search");
    expect(useUIStore.getState().leftPanelCollapsed).toBe(false);
    expect(useUIStore.getState().activeLeftTab).toBe("search");
  });

  it("toggleLeftPanel toggles collapsed state", () => {
    useUIStore.getState().toggleLeftPanel();
    expect(useUIStore.getState().leftPanelCollapsed).toBe(true);
    useUIStore.getState().toggleLeftPanel();
    expect(useUIStore.getState().leftPanelCollapsed).toBe(false);
  });

  it("toggleFocusMode collapses panel on enter and expands on exit", () => {
    useUIStore.getState().toggleFocusMode();
    expect(useUIStore.getState().focusMode).toBe(true);
    expect(useUIStore.getState().leftPanelCollapsed).toBe(true);
    useUIStore.getState().toggleFocusMode();
    expect(useUIStore.getState().focusMode).toBe(false);
    expect(useUIStore.getState().leftPanelCollapsed).toBe(false);
  });

  it("setGraphFocus switches to graph tab and expands panel", () => {
    useUIStore.setState({ activeLeftTab: "files", leftPanelCollapsed: true });
    useUIStore.getState().setGraphFocus("Notes/Test.md", "note");
    const s = useUIStore.getState();
    expect(s.activeLeftTab).toBe("graph");
    expect(s.leftPanelCollapsed).toBe(false);
    expect(s.graphFocusPath).toBe("Notes/Test.md");
  });

  it("resetWorkspaceState resets to files tab, not collapsed", () => {
    useUIStore.setState({ activeLeftTab: "graph", leftPanelCollapsed: true });
    useUIStore.getState().resetWorkspaceState();
    const s = useUIStore.getState();
    expect(s.activeLeftTab).toBe("files");
    expect(s.leftPanelCollapsed).toBe(false);
  });
});

describe("per-tab panel sizes", () => {
  beforeEach(() => {
    localStorage.clear();
    useUIStore.setState({ panelSizes: {} });
  });

  it("savePanelSizes stores sizes under the tab key", () => {
    useUIStore.getState().savePanelSizes("files", { content: 25, editor: 75 });
    const sizes = useUIStore.getState().panelSizes;
    expect(sizes.files).toEqual({ content: 25, editor: 75 });
  });

  it("savePanelSizes for different tabs are independent", () => {
    useUIStore.getState().savePanelSizes("files", { content: 25, editor: 75 });
    useUIStore.getState().savePanelSizes("graph", { content: 70, editor: 30 });
    const sizes = useUIStore.getState().panelSizes;
    expect(sizes.files).toEqual({ content: 25, editor: 75 });
    expect(sizes.graph).toEqual({ content: 70, editor: 30 });
  });

  it("savePanelSizes persists to localStorage", () => {
    useUIStore.getState().savePanelSizes("graph", { content: 60, editor: 40 });
    const stored = JSON.parse(localStorage.getItem("brainmap:panelSizes") ?? "{}");
    expect(stored.graph).toEqual({ content: 60, editor: 40 });
  });
});

describe("getTabSizes", () => {
  it("returns defaults when no stored sizes", () => {
    expect(getTabSizes({}, "files")).toEqual({ content: 20, editor: 80 });
    expect(getTabSizes({}, "graph")).toEqual({ content: 80, editor: 20 });
    expect(getTabSizes({}, "search")).toEqual({ content: 20, editor: 80 });
  });

  it("returns stored sizes when available", () => {
    const sizes = { files: { content: 30, editor: 70 } };
    expect(getTabSizes(sizes, "files")).toEqual({ content: 30, editor: 70 });
  });
});

describe("setDefaultTabSize / resetLayoutPrefs", () => {
  beforeEach(() => {
    localStorage.clear();
    useUIStore.setState({ panelSizes: {} });
  });

  it("setDefaultTabSize persists to uiPrefs and updates panelSizes", () => {
    useUIStore.getState().setDefaultTabSize("graph", 60);
    const prefs = JSON.parse(localStorage.getItem("brainmap:uiPrefs") ?? "{}");
    expect(prefs.defaultTabSizes.graph).toEqual({ content: 60, editor: 40 });
    expect(useUIStore.getState().panelSizes.graph).toEqual({ content: 60, editor: 40 });
  });

  it("setDefaultTabSize for different tabs are independent", () => {
    useUIStore.getState().setDefaultTabSize("files", 30);
    useUIStore.getState().setDefaultTabSize("graph", 70);
    const prefs = JSON.parse(localStorage.getItem("brainmap:uiPrefs") ?? "{}");
    expect(prefs.defaultTabSizes.files).toEqual({ content: 30, editor: 70 });
    expect(prefs.defaultTabSizes.graph).toEqual({ content: 70, editor: 30 });
  });

  it("resetLayoutPrefs clears defaultTabSizes from prefs", () => {
    useUIStore.getState().setDefaultTabSize("graph", 60);
    useUIStore.getState().resetLayoutPrefs();
    const prefs = JSON.parse(localStorage.getItem("brainmap:uiPrefs") ?? "{}");
    expect(prefs.defaultTabSizes).toBeUndefined();
    expect(useUIStore.getState().panelSizes).toEqual({});
  });
});

// autoSave was removed — auto-save is always on

describe("graph visual toggles", () => {
  beforeEach(() => {
    useUIStore.setState({
      showMinimap: false,
      showClusterHulls: false,
      showEdgeParticles: false,
    });
  });

  it("showMinimap defaults to false", () => {
    expect(useUIStore.getState().showMinimap).toBe(false);
  });

  it("toggleMinimap flips the value", () => {
    useUIStore.getState().toggleMinimap();
    expect(useUIStore.getState().showMinimap).toBe(true);
    useUIStore.getState().toggleMinimap();
    expect(useUIStore.getState().showMinimap).toBe(false);
  });

  it("showClusterHulls defaults to false", () => {
    expect(useUIStore.getState().showClusterHulls).toBe(false);
  });

  it("toggleClusterHulls flips the value", () => {
    useUIStore.getState().toggleClusterHulls();
    expect(useUIStore.getState().showClusterHulls).toBe(true);
    useUIStore.getState().toggleClusterHulls();
    expect(useUIStore.getState().showClusterHulls).toBe(false);
  });

  it("showEdgeParticles defaults to false", () => {
    expect(useUIStore.getState().showEdgeParticles).toBe(false);
  });

  it("toggleEdgeParticles flips the value", () => {
    useUIStore.getState().toggleEdgeParticles();
    expect(useUIStore.getState().showEdgeParticles).toBe(true);
    useUIStore.getState().toggleEdgeParticles();
    expect(useUIStore.getState().showEdgeParticles).toBe(false);
  });
});
