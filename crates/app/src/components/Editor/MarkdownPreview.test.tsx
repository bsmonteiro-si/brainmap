import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MarkdownPreview } from "./MarkdownPreview";

// Mock the stores
vi.mock("../../stores/graphStore", () => ({
  useGraphStore: {
    getState: () => ({ selectNode: vi.fn() }),
  },
}));

vi.mock("../../stores/editorStore", () => ({
  useEditorStore: {
    getState: () => ({ openNote: vi.fn() }),
  },
}));

import { useGraphStore } from "../../stores/graphStore";
import { useEditorStore } from "../../stores/editorStore";

describe("MarkdownPreview", () => {
  let selectNode: ReturnType<typeof vi.fn>;
  let openNote: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    selectNode = vi.fn();
    openNote = vi.fn();
    (useGraphStore.getState as ReturnType<typeof vi.fn>) = vi.fn(() => ({
      selectNode,
    }));
    (useEditorStore.getState as ReturnType<typeof vi.fn>) = vi.fn(() => ({
      openNote,
    }));
  });

  it("renders .md links as clickable and navigates on click", () => {
    render(
      <MarkdownPreview
        content="See [Confounding](./Confounding.md) for more"
        notePath="Concepts/Causation.md"
      />,
    );

    const link = screen.getByText("Confounding");
    fireEvent.click(link);

    expect(selectNode).toHaveBeenCalledWith("Concepts/Confounding.md");
    expect(openNote).toHaveBeenCalledWith("Concepts/Confounding.md");
  });

  it("prevents default on .md link click", () => {
    render(
      <MarkdownPreview
        content="See [Confounding](./Confounding.md)"
        notePath="Concepts/Causation.md"
      />,
    );

    const link = screen.getByText("Confounding");
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    const prevented = !link.dispatchEvent(event);
    expect(prevented).toBe(true);
  });

  it("renders external links with target=_blank", () => {
    render(
      <MarkdownPreview
        content="Visit [Example](https://example.com)"
        notePath="Notes/Test.md"
      />,
    );

    const link = screen.getByText("Example");
    expect(link.closest("a")?.getAttribute("target")).toBe("_blank");
    expect(link.closest("a")?.getAttribute("rel")).toContain("noopener");
  });

  it("shows title hint on .md links", () => {
    render(
      <MarkdownPreview
        content="See [Confounding](./Confounding.md)"
        notePath="Concepts/Causation.md"
      />,
    );

    const link = screen.getByText("Confounding").closest("a");
    expect(link?.getAttribute("title")).toBe("Click to open note");
  });
});
