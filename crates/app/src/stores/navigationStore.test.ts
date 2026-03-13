import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock editorStore and graphStore before importing navigationStore
const mockOpenNote = vi.fn().mockResolvedValue(undefined);
const mockSelectNode = vi.fn();

vi.mock("./editorStore", () => ({
  useEditorStore: {
    getState: () => ({ openNote: mockOpenNote }),
  },
}));

vi.mock("./graphStore", () => ({
  useGraphStore: {
    getState: () => ({ selectNode: mockSelectNode }),
  },
}));

import { useNavigationStore } from "./navigationStore";

describe("navigationStore", () => {
  beforeEach(() => {
    useNavigationStore.getState().reset();
    mockOpenNote.mockClear();
    mockSelectNode.mockClear();
  });

  it("starts empty", () => {
    const { history, cursor } = useNavigationStore.getState();
    expect(history).toEqual([]);
    expect(cursor).toBe(-1);
  });

  it("push adds to history", () => {
    const store = useNavigationStore.getState();
    store.push("a.md");
    store.push("b.md");
    const { history, cursor } = useNavigationStore.getState();
    expect(history).toEqual(["a.md", "b.md"]);
    expect(cursor).toBe(1);
  });

  it("dedupes consecutive same-path pushes", () => {
    const store = useNavigationStore.getState();
    store.push("a.md");
    store.push("a.md");
    store.push("a.md");
    expect(useNavigationStore.getState().history).toEqual(["a.md"]);
    expect(useNavigationStore.getState().cursor).toBe(0);
  });

  it("canGoBack and canGoForward", () => {
    const store = useNavigationStore.getState();
    expect(store.canGoBack()).toBe(false);
    expect(store.canGoForward()).toBe(false);

    store.push("a.md");
    expect(useNavigationStore.getState().canGoBack()).toBe(false);
    expect(useNavigationStore.getState().canGoForward()).toBe(false);

    store.push("b.md");
    expect(useNavigationStore.getState().canGoBack()).toBe(true);
    expect(useNavigationStore.getState().canGoForward()).toBe(false);
  });

  it("goBack navigates and syncs graph", async () => {
    const store = useNavigationStore.getState();
    store.push("a.md");
    store.push("b.md");

    await useNavigationStore.getState().goBack();

    expect(useNavigationStore.getState().cursor).toBe(0);
    expect(mockOpenNote).toHaveBeenCalledWith("a.md");
    expect(mockSelectNode).toHaveBeenCalledWith("a.md");
  });

  it("goForward navigates and syncs graph", async () => {
    const store = useNavigationStore.getState();
    store.push("a.md");
    store.push("b.md");

    await useNavigationStore.getState().goBack();
    await useNavigationStore.getState().goForward();

    expect(useNavigationStore.getState().cursor).toBe(1);
    expect(mockOpenNote).toHaveBeenLastCalledWith("b.md");
    expect(mockSelectNode).toHaveBeenLastCalledWith("b.md");
  });

  it("goBack at start is a no-op", async () => {
    const store = useNavigationStore.getState();
    store.push("a.md");

    await useNavigationStore.getState().goBack();
    expect(mockOpenNote).not.toHaveBeenCalled();
    expect(useNavigationStore.getState().cursor).toBe(0);
  });

  it("goForward at end is a no-op", async () => {
    const store = useNavigationStore.getState();
    store.push("a.md");

    await useNavigationStore.getState().goForward();
    expect(mockOpenNote).not.toHaveBeenCalled();
    expect(useNavigationStore.getState().cursor).toBe(0);
  });

  it("push after goBack truncates forward history", async () => {
    const store = useNavigationStore.getState();
    store.push("a.md");
    store.push("b.md");
    store.push("c.md");

    await useNavigationStore.getState().goBack(); // cursor at b
    // Now push a new path — c should be gone
    useNavigationStore.getState().push("d.md");

    const { history, cursor } = useNavigationStore.getState();
    expect(history).toEqual(["a.md", "b.md", "d.md"]);
    expect(cursor).toBe(2);
    expect(useNavigationStore.getState().canGoForward()).toBe(false);
  });

  it("navigation does not push to history (no re-entry)", async () => {
    const store = useNavigationStore.getState();
    store.push("a.md");
    store.push("b.md");
    store.push("c.md");

    await useNavigationStore.getState().goBack();

    // History should still be [a, b, c], cursor at 1
    const { history } = useNavigationStore.getState();
    expect(history).toEqual(["a.md", "b.md", "c.md"]);
  });

  it("reset clears all state", () => {
    const store = useNavigationStore.getState();
    store.push("a.md");
    store.push("b.md");

    useNavigationStore.getState().reset();

    const { history, cursor } = useNavigationStore.getState();
    expect(history).toEqual([]);
    expect(cursor).toBe(-1);
  });

  it("reverts cursor when openNote fails during goBack", async () => {
    const store = useNavigationStore.getState();
    store.push("a.md");
    store.push("b.md");

    mockOpenNote.mockRejectedValueOnce(new Error("file not found"));
    await useNavigationStore.getState().goBack();

    // Cursor should revert to original position
    expect(useNavigationStore.getState().cursor).toBe(1);
    expect(useNavigationStore.getState()._navigating).toBe(false);
  });

  it("reverts cursor when openNote fails during goForward", async () => {
    const store = useNavigationStore.getState();
    store.push("a.md");
    store.push("b.md");

    await useNavigationStore.getState().goBack();
    mockOpenNote.mockClear();
    mockOpenNote.mockRejectedValueOnce(new Error("file not found"));
    await useNavigationStore.getState().goForward();

    // Cursor should revert to 0 (where goBack left it)
    expect(useNavigationStore.getState().cursor).toBe(0);
    expect(useNavigationStore.getState()._navigating).toBe(false);
  });

  it("enforces max stack size by dropping oldest entries", () => {
    const store = useNavigationStore.getState();
    for (let i = 0; i < 110; i++) {
      store.push(`note-${i}.md`);
    }

    const { history, cursor } = useNavigationStore.getState();
    expect(history.length).toBe(100);
    expect(history[0]).toBe("note-10.md");
    expect(history[99]).toBe("note-109.md");
    expect(cursor).toBe(99);
  });
});
