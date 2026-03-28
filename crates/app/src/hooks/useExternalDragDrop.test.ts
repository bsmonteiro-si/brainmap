import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

const mockApi = {
  importFiles: vi.fn().mockResolvedValue({ imported: ["test.txt"], failed: [] }),
};

vi.mock("../api/bridge", () => ({
  getAPI: () => Promise.resolve(mockApi),
}));

const mockOpen = vi.fn();
vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: (...args: unknown[]) => mockOpen(...args),
}));

vi.mock("../utils/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

// Mock getCurrentWebview().onDragDropEvent()
type DragDropHandler = (event: { payload: { type: string; paths?: string[]; position?: { x: number; y: number } } }) => void;
let capturedHandler: DragDropHandler | null = null;
const mockUnlisten = vi.fn();

vi.mock("@tauri-apps/api/webview", () => ({
  getCurrentWebview: () => ({
    onDragDropEvent: (handler: DragDropHandler) => {
      capturedHandler = handler;
      return Promise.resolve(mockUnlisten);
    },
  }),
}));

import { useWorkspaceStore } from "../stores/workspaceStore";
import { useUndoStore } from "../stores/undoStore";
import { importFilesViaDialog, useExternalDragDrop } from "./useExternalDragDrop";

describe("importFilesViaDialog", () => {
  beforeEach(() => {
    mockApi.importFiles.mockClear();
    mockApi.importFiles.mockResolvedValue({ imported: ["test.txt"], failed: [] });
    mockOpen.mockClear();
    useWorkspaceStore.setState({ info: { name: "test", root: "/tmp/ws", node_count: 0, edge_count: 0 } });
    useUndoStore.setState({ toastMessage: null, toastKey: 0 });
  });

  it("opens file dialog and imports selected files", async () => {
    mockOpen.mockResolvedValue(["/tmp/external/photo.png"]);

    await importFilesViaDialog("");

    expect(mockOpen).toHaveBeenCalledWith({ multiple: true, title: "Import files into workspace" });
    expect(mockApi.importFiles).toHaveBeenCalledWith(["/tmp/external/photo.png"], "");
  });

  it("passes targetDir to importFiles", async () => {
    mockOpen.mockResolvedValue(["/tmp/external/photo.png"]);

    await importFilesViaDialog("Notes/Images");

    expect(mockApi.importFiles).toHaveBeenCalledWith(["/tmp/external/photo.png"], "Notes/Images");
  });

  it("does nothing when dialog is cancelled", async () => {
    mockOpen.mockResolvedValue(null);

    await importFilesViaDialog("");

    expect(mockApi.importFiles).not.toHaveBeenCalled();
  });

  it("does nothing when no workspace is open", async () => {
    useWorkspaceStore.setState({ info: null });

    await importFilesViaDialog("");

    expect(mockOpen).not.toHaveBeenCalled();
    expect(mockApi.importFiles).not.toHaveBeenCalled();
  });

  it("shows toast on success", async () => {
    mockOpen.mockResolvedValue(["/tmp/a.txt"]);

    await importFilesViaDialog("");

    expect(useUndoStore.getState().toastMessage).toContain("Imported 1 file");
  });

  it("shows toast with failure info on partial failure", async () => {
    mockOpen.mockResolvedValue(["/tmp/a.txt", "/tmp/b.txt"]);
    mockApi.importFiles.mockResolvedValue({
      imported: ["a.txt"],
      failed: [{ path: "/tmp/b.txt", error: "Permission denied" }],
    });

    await importFilesViaDialog("");

    expect(useUndoStore.getState().toastMessage).toContain("1 failed");
  });

  it("handles multiple files from dialog", async () => {
    mockOpen.mockResolvedValue(["/tmp/a.txt", "/tmp/b.txt", "/tmp/c.txt"]);
    mockApi.importFiles.mockResolvedValue({ imported: ["a.txt", "b.txt", "c.txt"], failed: [] });

    await importFilesViaDialog("Docs");

    expect(mockApi.importFiles).toHaveBeenCalledWith(
      ["/tmp/a.txt", "/tmp/b.txt", "/tmp/c.txt"],
      "Docs",
    );
  });
});

describe("useExternalDragDrop", () => {
  beforeEach(() => {
    capturedHandler = null;
    mockUnlisten.mockClear();
    mockApi.importFiles.mockClear();
    mockApi.importFiles.mockResolvedValue({ imported: ["test.txt"], failed: [] });
    useWorkspaceStore.setState({ info: { name: "test", root: "/tmp/ws", node_count: 0, edge_count: 0 } });
    useUndoStore.setState({ toastMessage: null, toastKey: 0 });
  });

  it("registers onDragDropEvent listener on mount", async () => {
    renderHook(() => useExternalDragDrop());
    // Wait for the async .then() to resolve
    await vi.waitFor(() => expect(capturedHandler).not.toBeNull());
  });

  it("calls unlisten on unmount", async () => {
    const { unmount } = renderHook(() => useExternalDragDrop());
    await vi.waitFor(() => expect(capturedHandler).not.toBeNull());
    unmount();
    expect(mockUnlisten).toHaveBeenCalled();
  });

  it("sets externalDragOver to true on enter event", async () => {
    const { result } = renderHook(() => useExternalDragDrop());
    await vi.waitFor(() => expect(capturedHandler).not.toBeNull());

    act(() => {
      capturedHandler!({ payload: { type: "enter", paths: ["/tmp/file.txt"] } });
    });

    expect(result.current.externalDragOver).toBe(true);
  });

  it("exposes file count on enter event", async () => {
    const { result } = renderHook(() => useExternalDragDrop());
    await vi.waitFor(() => expect(capturedHandler).not.toBeNull());

    act(() => {
      capturedHandler!({ payload: { type: "enter", paths: ["/tmp/a.txt", "/tmp/b.txt", "/tmp/c.txt"] } });
    });

    expect(result.current.dragFileCount).toBe(3);
  });

  it("resets file count on leave", async () => {
    const { result } = renderHook(() => useExternalDragDrop());
    await vi.waitFor(() => expect(capturedHandler).not.toBeNull());

    act(() => {
      capturedHandler!({ payload: { type: "enter", paths: ["/tmp/a.txt", "/tmp/b.txt"] } });
    });
    expect(result.current.dragFileCount).toBe(2);

    act(() => {
      capturedHandler!({ payload: { type: "leave" } });
    });
    expect(result.current.dragFileCount).toBe(0);
  });

  it("sets externalDragOver to false on leave event", async () => {
    const { result } = renderHook(() => useExternalDragDrop());
    await vi.waitFor(() => expect(capturedHandler).not.toBeNull());

    act(() => {
      capturedHandler!({ payload: { type: "enter", paths: ["/tmp/file.txt"] } });
    });
    expect(result.current.externalDragOver).toBe(true);

    act(() => {
      capturedHandler!({ payload: { type: "leave" } });
    });
    expect(result.current.externalDragOver).toBe(false);
  });

  it("calls importFiles on drop event", async () => {
    renderHook(() => useExternalDragDrop());
    await vi.waitFor(() => expect(capturedHandler).not.toBeNull());

    act(() => {
      capturedHandler!({ payload: { type: "drop", paths: ["/tmp/photo.png", "/tmp/doc.pdf"], position: { x: 0, y: 0 } } });
    });

    // Wait for the async import to complete
    await vi.waitFor(() => expect(mockApi.importFiles).toHaveBeenCalled());
    expect(mockApi.importFiles).toHaveBeenCalledWith(["/tmp/photo.png", "/tmp/doc.pdf"], "");
  });

  it("shows toast after successful drop import", async () => {
    renderHook(() => useExternalDragDrop());
    await vi.waitFor(() => expect(capturedHandler).not.toBeNull());

    act(() => {
      capturedHandler!({ payload: { type: "drop", paths: ["/tmp/photo.png"], position: { x: 0, y: 0 } } });
    });

    await vi.waitFor(() => expect(useUndoStore.getState().toastMessage).toContain("Imported 1 file"));
  });

  it("clears externalDragOver on drop event", async () => {
    const { result } = renderHook(() => useExternalDragDrop());
    await vi.waitFor(() => expect(capturedHandler).not.toBeNull());

    act(() => {
      capturedHandler!({ payload: { type: "enter", paths: ["/tmp/file.txt"] } });
    });
    expect(result.current.externalDragOver).toBe(true);

    act(() => {
      capturedHandler!({ payload: { type: "drop", paths: ["/tmp/file.txt"], position: { x: 0, y: 0 } } });
    });
    expect(result.current.externalDragOver).toBe(false);
  });

  it("ignores drop when no workspace is open", async () => {
    useWorkspaceStore.setState({ info: null });
    renderHook(() => useExternalDragDrop());
    await vi.waitFor(() => expect(capturedHandler).not.toBeNull());

    act(() => {
      capturedHandler!({ payload: { type: "drop", paths: ["/tmp/file.txt"], position: { x: 0, y: 0 } } });
    });

    // Give time for the async handler to potentially run
    await new Promise((r) => setTimeout(r, 50));
    expect(mockApi.importFiles).not.toHaveBeenCalled();
  });
});
