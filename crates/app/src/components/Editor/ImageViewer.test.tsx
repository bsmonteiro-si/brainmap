import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTabStore } from "../../stores/tabStore";
import { formatSize } from "./ImageViewer";

// Mock API bridge
const mockResolveImagePath = vi.fn();
vi.mock("../../api/bridge", () => ({
  getAPI: () =>
    Promise.resolve({
      resolveImagePath: mockResolveImagePath,
    }),
}));

// Mock logger
vi.mock("../../utils/logger", () => ({
  log: { error: vi.fn(), info: vi.fn(), debug: vi.fn(), warn: vi.fn() },
}));

describe("ImageViewer tab integration", () => {
  beforeEach(() => {
    useTabStore.getState().reset();
    mockResolveImagePath.mockReset();
  });

  it("tab kind 'image' is accepted by openTab", () => {
    useTabStore.getState().openTab("photo.png", "image", "photo.png", null);
    const tab = useTabStore.getState().getTab("photo.png");
    expect(tab).toBeDefined();
    expect(tab!.kind).toBe("image");
  });

  it("createFreshTab supports image kind", () => {
    useTabStore.getState().openTab("pic.jpg", "image", "pic.jpg", null);
    const tab = useTabStore.getState().getTab("pic.jpg");
    expect(tab!.editedBody).toBeNull();
    expect(tab!.isDirty).toBe(false);
    expect(tab!.viewMode).toBe("edit");
  });

  it("closeTab removes image tab", () => {
    useTabStore.getState().openTab("icon.svg", "image", "icon.svg", null);
    expect(useTabStore.getState().tabs).toHaveLength(1);
    useTabStore.getState().closeTab("icon.svg");
    expect(useTabStore.getState().tabs).toHaveLength(0);
  });

  it("does not reopen an already-open image tab", () => {
    useTabStore.getState().openTab("photo.png", "image", "photo.png", null);
    useTabStore.getState().openTab("photo.png", "image", "photo.png", null);
    expect(useTabStore.getState().tabs).toHaveLength(1);
  });
});

describe("ImageViewer tab routing", () => {
  beforeEach(() => {
    useTabStore.getState().reset();
  });

  it("navigateToActiveTab handles image tabs via clearForCustomTab", async () => {
    const { useEditorStore } = await import("../../stores/editorStore");
    const clearSpy = vi.spyOn(useEditorStore.getState(), "clearForCustomTab");

    useTabStore.getState().openTab("test.png", "image", "test.png", null);

    const { closeTabAndNavigateNext } = await import("../../stores/tabActions");
    useTabStore.getState().openTab("other.md", "note", "Other", "concept");
    useTabStore.getState().activateTab("other.md");

    // Close the note tab — should navigate to image tab
    closeTabAndNavigateNext("other.md");

    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});

describe("formatSize", () => {
  it("formats bytes", () => {
    expect(formatSize(0)).toBe("0 B");
    expect(formatSize(512)).toBe("512 B");
    expect(formatSize(1023)).toBe("1023 B");
  });

  it("formats kilobytes", () => {
    expect(formatSize(1024)).toBe("1.0 KB");
    expect(formatSize(1536)).toBe("1.5 KB");
    expect(formatSize(1024 * 1023)).toBe("1023.0 KB");
  });

  it("formats megabytes", () => {
    expect(formatSize(1024 * 1024)).toBe("1.0 MB");
    expect(formatSize(5.5 * 1024 * 1024)).toBe("5.5 MB");
    expect(formatSize(100 * 1024 * 1024)).toBe("100.0 MB");
  });
});
