import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { useTabStore } from "../../stores/tabStore";
import { formatSize, formatTime, VideoViewer } from "./VideoViewer";

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
    const { closeTabAndNavigateNext } = await import("../../stores/tabActions");
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
    mockResolveVideoPath.mockReturnValue(new Promise(() => {}));
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
      expect(options).toHaveLength(7);
    });
  });

  it("renders fullscreen toggle button", async () => {
    mockResolveVideoPath.mockResolvedValue({
      path: "clip.mp4",
      absolute_path: "/mock/clip.mp4",
      size_bytes: 0,
    });
    render(<VideoViewer path="clip.mp4" />);
    await waitFor(() => {
      expect(screen.getByTitle("Fullscreen (F)")).toBeDefined();
    });
  });
});

describe("VideoViewer keyboard controls", () => {
  beforeEach(() => {
    mockResolveVideoPath.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function renderWithVideo() {
    mockResolveVideoPath.mockResolvedValue({
      path: "clip.mp4",
      absolute_path: "/mock/clip.mp4",
      size_bytes: 0,
    });
    const result = render(<VideoViewer path="clip.mp4" />);
    // Flush the async load
    await vi.waitFor(() => {
      expect(result.container.querySelector("video")).not.toBeNull();
    });
    return result;
  }

  it("ArrowLeft seeks backward by 5 seconds", async () => {
    const { container } = await renderWithVideo();
    const video = container.querySelector("video")!;
    Object.defineProperty(video, "currentTime", { value: 30, writable: true });
    Object.defineProperty(video, "duration", { value: 120 });

    const content = container.querySelector(".video-viewer-content")!;
    fireEvent.keyDown(content, { key: "ArrowLeft" });
    expect(video.currentTime).toBe(25);
  });

  it("ArrowRight seeks forward by 5 seconds", async () => {
    const { container } = await renderWithVideo();
    const video = container.querySelector("video")!;
    Object.defineProperty(video, "currentTime", { value: 30, writable: true });
    Object.defineProperty(video, "duration", { value: 120 });

    const content = container.querySelector(".video-viewer-content")!;
    fireEvent.keyDown(content, { key: "ArrowRight" });
    expect(video.currentTime).toBe(35);
  });

  it("ArrowLeft does not go below 0", async () => {
    const { container } = await renderWithVideo();
    const video = container.querySelector("video")!;
    Object.defineProperty(video, "currentTime", { value: 2, writable: true });
    Object.defineProperty(video, "duration", { value: 120 });

    const content = container.querySelector(".video-viewer-content")!;
    fireEvent.keyDown(content, { key: "ArrowLeft" });
    expect(video.currentTime).toBe(0);
  });

  it("ArrowRight does not exceed duration", async () => {
    const { container } = await renderWithVideo();
    const video = container.querySelector("video")!;
    Object.defineProperty(video, "currentTime", { value: 118, writable: true });
    Object.defineProperty(video, "duration", { value: 120 });

    const content = container.querySelector(".video-viewer-content")!;
    fireEvent.keyDown(content, { key: "ArrowRight" });
    expect(video.currentTime).toBe(120);
  });

  it("Space plays when paused", async () => {
    const { container } = await renderWithVideo();
    const video = container.querySelector("video")!;
    const playSpy = vi.fn().mockResolvedValue(undefined);
    video.play = playSpy;
    Object.defineProperty(video, "paused", { value: true });

    const content = container.querySelector(".video-viewer-content")!;
    fireEvent.keyDown(content, { key: " " });
    expect(playSpy).toHaveBeenCalled();
  });

  it("Space pauses when playing", async () => {
    const { container } = await renderWithVideo();
    const video = container.querySelector("video")!;
    const pauseSpy = vi.fn();
    video.pause = pauseSpy;
    Object.defineProperty(video, "paused", { value: false });

    const content = container.querySelector(".video-viewer-content")!;
    fireEvent.keyDown(content, { key: " " });
    expect(pauseSpy).toHaveBeenCalled();
  });

  it("shows status bar on seek and hides after 5 seconds", async () => {
    const { container } = await renderWithVideo();
    const video = container.querySelector("video")!;
    Object.defineProperty(video, "currentTime", { value: 30, writable: true });
    Object.defineProperty(video, "duration", { value: 120 });

    const content = container.querySelector(".video-viewer-content")!;

    // No status bar initially
    expect(container.querySelector(".video-status-bar")).toBeNull();

    // Seek triggers status bar
    fireEvent.keyDown(content, { key: "ArrowRight" });
    expect(container.querySelector(".video-status-bar")).not.toBeNull();

    // Still visible before timeout
    act(() => { vi.advanceTimersByTime(4000); });
    expect(container.querySelector(".video-status-bar")).not.toBeNull();

    // Disappears after 5 seconds
    act(() => { vi.advanceTimersByTime(1500); });
    expect(container.querySelector(".video-status-bar")).toBeNull();
  });

  it("resets status bar timer on repeated interaction", async () => {
    const { container } = await renderWithVideo();
    const video = container.querySelector("video")!;
    Object.defineProperty(video, "currentTime", { value: 30, writable: true });
    Object.defineProperty(video, "duration", { value: 120 });

    const content = container.querySelector(".video-viewer-content")!;

    fireEvent.keyDown(content, { key: "ArrowRight" });
    act(() => { vi.advanceTimersByTime(3000); });
    // Another seek resets the timer
    fireEvent.keyDown(content, { key: "ArrowRight" });
    act(() => { vi.advanceTimersByTime(3000); });
    // Still visible (only 3s since last interaction)
    expect(container.querySelector(".video-status-bar")).not.toBeNull();

    act(() => { vi.advanceTimersByTime(2500); });
    expect(container.querySelector(".video-status-bar")).toBeNull();
  });

  it("F key toggles fullscreen", async () => {
    const { container } = await renderWithVideo();
    const content = container.querySelector(".video-viewer-content")!;
    const viewer = container.querySelector(".video-viewer")!;

    expect(viewer.classList.contains("video-viewer--fullscreen")).toBe(false);
    fireEvent.keyDown(content, { key: "f" });
    expect(viewer.classList.contains("video-viewer--fullscreen")).toBe(true);
    fireEvent.keyDown(content, { key: "f" });
    expect(viewer.classList.contains("video-viewer--fullscreen")).toBe(false);
  });

  it("Escape exits fullscreen", async () => {
    const { container } = await renderWithVideo();
    const content = container.querySelector(".video-viewer-content")!;
    const viewer = container.querySelector(".video-viewer")!;

    // Enter fullscreen first
    fireEvent.keyDown(content, { key: "f" });
    expect(viewer.classList.contains("video-viewer--fullscreen")).toBe(true);

    fireEvent.keyDown(content, { key: "Escape" });
    expect(viewer.classList.contains("video-viewer--fullscreen")).toBe(false);
  });

  it("Escape does nothing when not in fullscreen", async () => {
    const { container } = await renderWithVideo();
    const content = container.querySelector(".video-viewer-content")!;
    const viewer = container.querySelector(".video-viewer")!;

    fireEvent.keyDown(content, { key: "Escape" });
    expect(viewer.classList.contains("video-viewer--fullscreen")).toBe(false);
  });
});

describe("VideoViewer fullscreen button", () => {
  beforeEach(() => {
    mockResolveVideoPath.mockReset();
  });

  it("clicking fullscreen button toggles fullscreen class", async () => {
    mockResolveVideoPath.mockResolvedValue({
      path: "clip.mp4",
      absolute_path: "/mock/clip.mp4",
      size_bytes: 0,
    });
    const { container } = render(<VideoViewer path="clip.mp4" />);
    await waitFor(() => {
      expect(container.querySelector("video")).not.toBeNull();
    });

    const btn = screen.getByTitle("Fullscreen (F)");
    const viewer = container.querySelector(".video-viewer")!;

    fireEvent.click(btn);
    expect(viewer.classList.contains("video-viewer--fullscreen")).toBe(true);
    expect(screen.getByTitle("Exit fullscreen (Esc)")).toBeDefined();

    fireEvent.click(screen.getByTitle("Exit fullscreen (Esc)"));
    expect(viewer.classList.contains("video-viewer--fullscreen")).toBe(false);
  });
});

describe("VideoViewer formatTime", () => {
  it("formats seconds only", () => {
    expect(formatTime(45)).toBe("0:45");
  });

  it("formats minutes and seconds", () => {
    expect(formatTime(125)).toBe("2:05");
  });

  it("formats hours", () => {
    expect(formatTime(3661)).toBe("1:01:01");
  });

  it("handles 0", () => {
    expect(formatTime(0)).toBe("0:00");
  });

  it("handles NaN", () => {
    expect(formatTime(NaN)).toBe("0:00");
  });

  it("handles negative", () => {
    expect(formatTime(-5)).toBe("0:00");
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
