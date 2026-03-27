import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Track the handler registered via onDragDropEvent
let dragDropHandler: ((event: { payload: unknown }) => void) | null = null;
const mockUnlisten = vi.fn();

vi.mock("@tauri-apps/api/webview", () => ({
  getCurrentWebview: () => ({
    onDragDropEvent: vi.fn(
      (handler: (event: { payload: unknown }) => void) => {
        dragDropHandler = handler;
        return Promise.resolve(mockUnlisten);
      },
    ),
  }),
}));

const mockApi = {
  importFiles: vi
    .fn()
    .mockResolvedValue({ imported: ["test.txt"], failed: [] }),
};

vi.mock("../api/bridge", () => ({
  getAPI: () => Promise.resolve(mockApi),
}));

vi.mock("../utils/logger", () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import { useWorkspaceStore } from "../stores/workspaceStore";
import { useUndoStore } from "../stores/undoStore";
import { useExternalDragDrop } from "./useExternalDragDrop";

// Polyfill elementFromPoint for jsdom (returns null by default)
if (typeof document.elementFromPoint !== "function") {
  document.elementFromPoint = () => null;
}

describe("useExternalDragDrop", () => {
  beforeEach(() => {
    dragDropHandler = null;
    mockUnlisten.mockClear();
    mockApi.importFiles.mockClear();
    mockApi.importFiles.mockResolvedValue({
      imported: ["test.txt"],
      failed: [],
    });
    useWorkspaceStore.setState({
      info: { name: "test", root: "/tmp/ws", node_count: 0, edge_count: 0 },
    });
    useUndoStore.setState({ toastMessage: null, toastKey: 0 });
  });

  it("sets isDraggingExternal on drag-enter with paths", () => {
    const { result } = renderHook(() => useExternalDragDrop());
    expect(result.current.isDraggingExternal).toBe(false);

    act(() => {
      dragDropHandler?.({
        payload: {
          type: "enter",
          paths: ["/tmp/file.txt"],
          position: { x: 0, y: 0 },
        },
      });
    });

    expect(result.current.isDraggingExternal).toBe(true);
  });

  it("clears isDraggingExternal on drag-leave", () => {
    const { result } = renderHook(() => useExternalDragDrop());

    act(() => {
      dragDropHandler?.({
        payload: {
          type: "enter",
          paths: ["/tmp/file.txt"],
          position: { x: 0, y: 0 },
        },
      });
    });
    expect(result.current.isDraggingExternal).toBe(true);

    act(() => {
      dragDropHandler?.({ payload: { type: "leave" } });
    });
    expect(result.current.isDraggingExternal).toBe(false);
  });

  it("calls importFiles on drop with root target when no folder found", async () => {
    const { result } = renderHook(() => useExternalDragDrop());

    await act(async () => {
      await dragDropHandler?.({
        payload: {
          type: "drop",
          paths: ["/tmp/photo.png"],
          position: { x: 100, y: 100 },
        },
      });
    });

    expect(result.current.isDraggingExternal).toBe(false);
    expect(mockApi.importFiles).toHaveBeenCalledWith(["/tmp/photo.png"], "");
  });

  it("resolves target folder from DOM on drop", async () => {
    // Set up a mock folder element in the DOM
    const folderEl = document.createElement("div");
    folderEl.classList.add("tree-item", "tree-folder");
    folderEl.setAttribute("data-tree-path", "Notes/Concepts");
    document.body.appendChild(folderEl);

    // Mock elementFromPoint to return our folder element
    const origElementFromPoint = document.elementFromPoint;
    document.elementFromPoint = () => folderEl;

    renderHook(() => useExternalDragDrop());

    await act(async () => {
      await dragDropHandler?.({
        payload: {
          type: "drop",
          paths: ["/tmp/photo.png"],
          position: { x: 50, y: 50 },
        },
      });
    });

    expect(mockApi.importFiles).toHaveBeenCalledWith(
      ["/tmp/photo.png"],
      "Notes/Concepts",
    );

    // Cleanup
    document.elementFromPoint = origElementFromPoint;
    document.body.removeChild(folderEl);
  });

  it("resolves parent folder when dropping over a file", async () => {
    const fileEl = document.createElement("div");
    fileEl.classList.add("tree-item", "tree-file");
    fileEl.setAttribute("data-tree-path", "Notes/Concepts/test.md");
    document.body.appendChild(fileEl);

    const origElementFromPoint = document.elementFromPoint;
    document.elementFromPoint = () => fileEl;

    renderHook(() => useExternalDragDrop());

    await act(async () => {
      await dragDropHandler?.({
        payload: {
          type: "drop",
          paths: ["/tmp/photo.png"],
          position: { x: 50, y: 50 },
        },
      });
    });

    expect(mockApi.importFiles).toHaveBeenCalledWith(
      ["/tmp/photo.png"],
      "Notes/Concepts",
    );

    document.elementFromPoint = origElementFromPoint;
    document.body.removeChild(fileEl);
  });

  it("shows toast on successful import", async () => {
    renderHook(() => useExternalDragDrop());

    await act(async () => {
      await dragDropHandler?.({
        payload: {
          type: "drop",
          paths: ["/tmp/a.txt"],
          position: { x: 0, y: 0 },
        },
      });
    });

    expect(useUndoStore.getState().toastMessage).toContain("Imported 1 file");
  });

  it("shows toast with failure count on partial failure", async () => {
    mockApi.importFiles.mockResolvedValue({
      imported: ["a.txt"],
      failed: [{ path: "/tmp/b.txt", error: "Permission denied" }],
    });
    renderHook(() => useExternalDragDrop());

    await act(async () => {
      await dragDropHandler?.({
        payload: {
          type: "drop",
          paths: ["/tmp/a.txt", "/tmp/b.txt"],
          position: { x: 0, y: 0 },
        },
      });
    });

    expect(useUndoStore.getState().toastMessage).toContain("1 failed");
  });

  it("does nothing when no workspace is open", async () => {
    useWorkspaceStore.setState({ info: null });
    renderHook(() => useExternalDragDrop());

    await act(async () => {
      await dragDropHandler?.({
        payload: {
          type: "drop",
          paths: ["/tmp/a.txt"],
          position: { x: 0, y: 0 },
        },
      });
    });

    expect(mockApi.importFiles).not.toHaveBeenCalled();
  });

  it("ignores enter events without paths", () => {
    const { result } = renderHook(() => useExternalDragDrop());

    act(() => {
      dragDropHandler?.({
        payload: { type: "enter", paths: [], position: { x: 0, y: 0 } },
      });
    });

    expect(result.current.isDraggingExternal).toBe(false);
  });

  it("highlights folder on over events", () => {
    // Set up a mock folder element
    const folderEl = document.createElement("div");
    folderEl.classList.add("tree-item", "tree-folder");
    folderEl.setAttribute("data-tree-path", "MyFolder");
    document.body.appendChild(folderEl);

    const origElementFromPoint = document.elementFromPoint;
    document.elementFromPoint = () => folderEl;

    renderHook(() => useExternalDragDrop());

    act(() => {
      dragDropHandler?.({
        payload: { type: "over", position: { x: 50, y: 50 } },
      });
    });

    expect(folderEl.classList.contains("external-drop-target")).toBe(true);

    // Leave removes highlight
    act(() => {
      dragDropHandler?.({ payload: { type: "leave" } });
    });

    expect(folderEl.classList.contains("external-drop-target")).toBe(false);

    document.elementFromPoint = origElementFromPoint;
    document.body.removeChild(folderEl);
  });
});
