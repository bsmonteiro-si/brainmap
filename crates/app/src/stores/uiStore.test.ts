import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "./uiStore";

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
