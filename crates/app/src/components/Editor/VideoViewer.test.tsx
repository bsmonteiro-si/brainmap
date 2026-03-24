import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useTabStore } from "../../stores/tabStore";
import { formatSize, VideoViewer } from "./VideoViewer";

// Mock API bridge
const mockResolveVideoPath = vi.fn();
vi.mock("../../api/bridge", () => ({
  getAPI: () =>
    Promise.resolve({
      resolveVideoPath: mockResolveVideoPath,
    }),
}));

// Mock logger
vi.mock("../../utils/logger", () => ({
  log: { error: vi.fn(), info: vi.fn(), debug: vi.fn(), warn: vi.fn() },
}));

describe("VideoViewer tab integration", () => {
  beforeEach(() => {
    useTabStore.getState().reset();
    mockResolveVideoPath.mockReset();
  });

  it("tab kind 'video' is accepted by openTab", () => {
    useTabStore.getState().openTab("clip.mp4", "video", "clip.mp4", null);
    const tab = useTabStore.getState().getTab("clip.mp4");
    expect(tab).toBeDefined();
    expect(tab!.kind).toBe("video");
  });

  it("createFreshTab supports video kind", () => {
    useTabStore.getState().openTab("demo.webm", "video", "demo.webm", null);
    const tab = useTabStore.getState().getTab("demo.webm");
    expect(tab!.editedBody).toBeNull();
    expect(tab!.isDirty).toBe(false);
    expect(tab!.viewMode).toBe("edit");
  });

  it("closeTab removes video tab", () => {
    useTabStore.getState().openTab("movie.mov", "video", "movie.mov", null);
    expect(useTabStore.getState().tabs).toHaveLength(1);
    useTabStore.getState().closeTab("movie.mov");
    expect(useTabStore.getState().tabs).toHaveLength(0);
  });

  it("does not reopen an already-open video tab", () => {
    useTabStore.getState().openTab("clip.mp4", "video", "clip.mp4", null);
    useTabStore.getState().openTab("clip.mp4", "video", "clip.mp4", null);
    expect(useTabStore.getState().tabs).toHaveLength(1);
  });
});

describe("VideoViewer tab routing", () => {
  beforeEach(() => {
    useTabStore.getState().reset();
  });

  it("navigateToActiveTab handles video tabs via clearForCustomTab", async () => {
    const { useEditorStore } = await import("../../stores/editorStore");
    const clearSpy = vi.spyOn(useEditorStore.getState(), "clearForCustomTab");

    useTabStore.getState().openTab("clip.mp4", "video", "clip.mp4", null);
    // Simulate tab navigation
    const { closeTabAndNavigateNext } = await import("../../stores/tabActions");
    // Open a second tab so closing the first navigates to it
    useTabStore.getState().openTab("other.mp4", "video", "other.mp4", null);
    useTabStore.getState().activateTab("clip.mp4");
    closeTabAndNavigateNext("clip.mp4");

    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});

describe("VideoViewer render", () => {
  beforeEach(() => {
    mockResolveVideoPath.mockReset();
  });

  it("shows loading state initially", () => {
    mockResolveVideoPath.mockReturnValue(new Promise(() => {})); // never resolves
    render(<VideoViewer path="clip.mp4" />);
    expect(screen.getByText("Loading video...")).toBeDefined();
  });

  it("shows error state on API failure", async () => {
    mockResolveVideoPath.mockRejectedValue(new Error("File not found: clip.mp4"));
    render(<VideoViewer path="clip.mp4" />);
    await waitFor(() => {
      expect(screen.getByText("File not found: clip.mp4")).toBeDefined();
    });
  });

  it("renders video element on success", async () => {
    mockResolveVideoPath.mockResolvedValue({
      path: "clip.mp4",
      absolute_path: "/mock/clip.mp4",
      size_bytes: 1024,
    });
    const { container } = render(<VideoViewer path="clip.mp4" />);
    await waitFor(() => {
      const video = container.querySelector("video");
      expect(video).not.toBeNull();
      expect(video!.getAttribute("controls")).not.toBeNull();
    });
  });

  it("displays filename and size in toolbar", async () => {
    mockResolveVideoPath.mockResolvedValue({
      path: "clip.mp4",
      absolute_path: "/mock/clip.mp4",
      size_bytes: 5 * 1024 * 1024,
    });
    const { container } = render(<VideoViewer path="clip.mp4" />);
    await waitFor(() => {
      expect(screen.getByText("clip.mp4")).toBeDefined();
      const dim = container.querySelector(".video-viewer-dim");
      expect(dim).not.toBeNull();
      expect(dim!.textContent).toContain("5.0 MB");
    });
  });

  it("renders speed selector with all options", async () => {
    mockResolveVideoPath.mockResolvedValue({
      path: "clip.mp4",
      absolute_path: "/mock/clip.mp4",
      size_bytes: 0,
    });
    const { container } = render(<VideoViewer path="clip.mp4" />);
    await waitFor(() => {
      const select = container.querySelector("select");
      expect(select).not.toBeNull();
      const options = select!.querySelectorAll("option");
      expect(options).toHaveLength(7); // 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2
    });
  });
});

describe("VideoViewer formatSize", () => {
  it("formats bytes", () => {
    expect(formatSize(500)).toBe("500 B");
  });

  it("formats kilobytes", () => {
    expect(formatSize(2048)).toBe("2.0 KB");
  });

  it("formats megabytes", () => {
    expect(formatSize(5 * 1024 * 1024)).toBe("5.0 MB");
  });

  it("formats gigabytes", () => {
    expect(formatSize(1.5 * 1024 * 1024 * 1024)).toBe("1.50 GB");
  });
});
