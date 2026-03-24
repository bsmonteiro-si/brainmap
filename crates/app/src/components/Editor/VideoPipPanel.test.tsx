import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useUIStore } from "../../stores/uiStore";

// Mock VideoViewer since it has async side effects
vi.mock("./VideoViewer", () => ({
  VideoViewer: ({ path }: { path: string }) => (
    <div data-testid="mock-video-viewer">{path}</div>
  ),
}));

// Mock logger
vi.mock("../../utils/logger", () => ({
  log: { error: vi.fn(), info: vi.fn(), debug: vi.fn(), warn: vi.fn() },
}));

// Import after mocks
import { VideoPipPanel } from "./VideoPipPanel";

describe("VideoPipPanel", () => {
  beforeEach(() => {
    useUIStore.setState({ videoPipPath: null });
  });

  it("renders nothing when videoPipPath is null", () => {
    const { container } = render(<VideoPipPanel />);
    expect(container.innerHTML).toBe("");
    expect(document.querySelector(".video-pip-panel")).toBeNull();
  });

  it("renders portal to body when videoPipPath is set", () => {
    useUIStore.setState({ videoPipPath: "demo.mp4" });
    render(<VideoPipPanel />);
    const panel = document.querySelector(".video-pip-panel");
    expect(panel).not.toBeNull();
    // Portal renders to body, not the container
    expect(panel!.parentElement).toBe(document.body);
  });

  it("displays filename in title bar", () => {
    useUIStore.setState({ videoPipPath: "videos/my-clip.mp4" });
    render(<VideoPipPanel />);
    expect(document.querySelector(".video-pip-title")!.textContent).toBe("my-clip.mp4");
  });

  it("renders VideoViewer with correct path", () => {
    useUIStore.setState({ videoPipPath: "demo.mp4" });
    render(<VideoPipPanel />);
    expect(screen.getByTestId("mock-video-viewer").textContent).toBe("demo.mp4");
  });

  it("close button calls closeVideoPip", () => {
    useUIStore.setState({ videoPipPath: "demo.mp4" });
    render(<VideoPipPanel />);
    const closeBtn = document.querySelector(".video-pip-close") as HTMLElement;
    expect(closeBtn).not.toBeNull();
    fireEvent.click(closeBtn);
    expect(useUIStore.getState().videoPipPath).toBeNull();
  });

  it("disappears after closeVideoPip", () => {
    useUIStore.setState({ videoPipPath: "demo.mp4" });
    const { rerender } = render(<VideoPipPanel />);
    expect(document.querySelector(".video-pip-panel")).not.toBeNull();

    useUIStore.setState({ videoPipPath: null });
    rerender(<VideoPipPanel />);
    expect(document.querySelector(".video-pip-panel")).toBeNull();
  });

  it("has resize handle", () => {
    useUIStore.setState({ videoPipPath: "demo.mp4" });
    render(<VideoPipPanel />);
    expect(document.querySelector(".video-pip-resize-handle")).not.toBeNull();
  });
});

describe("uiStore videoPip actions", () => {
  beforeEach(() => {
    useUIStore.setState({ videoPipPath: null });
  });

  it("openVideoPip sets videoPipPath", () => {
    useUIStore.getState().openVideoPip("clip.mp4");
    expect(useUIStore.getState().videoPipPath).toBe("clip.mp4");
  });

  it("closeVideoPip clears videoPipPath", () => {
    useUIStore.getState().openVideoPip("clip.mp4");
    useUIStore.getState().closeVideoPip();
    expect(useUIStore.getState().videoPipPath).toBeNull();
  });

  it("openVideoPip replaces existing path", () => {
    useUIStore.getState().openVideoPip("first.mp4");
    useUIStore.getState().openVideoPip("second.webm");
    expect(useUIStore.getState().videoPipPath).toBe("second.webm");
  });
});
