import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "./uiStore";

beforeEach(() => {
  // Reset the relevant slice of store state between tests
  useUIStore.setState({ createNoteDialogOpen: false, createNoteInitialPath: null });
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
