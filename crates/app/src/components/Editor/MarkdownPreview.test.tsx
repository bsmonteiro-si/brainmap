import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MarkdownPreview, extractCalloutFromChildren } from "./MarkdownPreview";
import React from "react";

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

describe("extractCalloutFromChildren", () => {
  it("returns null for non-callout content", () => {
    const children = React.createElement("p", null, "Just a normal paragraph");
    expect(extractCalloutFromChildren(children)).toBeNull();
  });

  it("returns null when first child is not a <p>", () => {
    const children = React.createElement("div", null, "[!ai-answer] test");
    expect(extractCalloutFromChildren(children)).toBeNull();
  });

  it("extracts type and title from callout syntax", () => {
    const children = React.createElement("p", null, "[!source] Pearl, J. (2000)");
    const result = extractCalloutFromChildren(children);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("source");
    expect(result!.title).toBe("Pearl, J. (2000)");
  });

  it("extracts type with no title", () => {
    const children = React.createElement("p", null, "[!ai-answer]");
    const result = extractCalloutFromChildren(children);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("ai-answer");
    expect(result!.title).toBe("");
  });

  it("returns null for empty children", () => {
    expect(extractCalloutFromChildren(null)).toBeNull();
  });

  it("collects subsequent <p> elements as restChildren", () => {
    const children = [
      React.createElement("p", { key: "1" }, "[!source] Title"),
      React.createElement("p", { key: "2" }, "Body paragraph"),
    ];
    const result = extractCalloutFromChildren(children);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("source");
    expect(result!.title).toBe("Title");
    expect(result!.restChildren).toHaveLength(1);
  });
});

describe("Callout rendering", () => {
  it("renders [!ai-answer] as a callout card", () => {
    const { container } = render(
      <MarkdownPreview
        content={"> [!ai-answer]\n> AI generated response here"}
        notePath="test.md"
      />,
    );
    const callout = container.querySelector(".callout");
    expect(callout).toBeTruthy();
    const header = container.querySelector(".callout-header");
    expect(header?.textContent).toContain("AI Answer");
    const body = container.querySelector(".callout-body");
    expect(body?.textContent).toContain("AI generated response here");
  });

  it("renders [!source] with custom title", () => {
    const { container } = render(
      <MarkdownPreview
        content={"> [!source] Pearl, J. (2000). Causality\n> Defines structural causal models"}
        notePath="test.md"
      />,
    );
    const callout = container.querySelector(".callout");
    expect(callout).toBeTruthy();
    const header = container.querySelector(".callout-header");
    expect(header?.textContent).toContain("Pearl, J. (2000). Causality");
  });

  it("falls back to plain blockquote for regular quotes", () => {
    const { container } = render(
      <MarkdownPreview
        content={"> Just a regular blockquote"}
        notePath="test.md"
      />,
    );
    expect(container.querySelector(".callout")).toBeNull();
    expect(container.querySelector("blockquote")).toBeTruthy();
  });

  it("renders unknown callout type with fallback styling", () => {
    const { container } = render(
      <MarkdownPreview
        content={"> [!warning]\n> Be careful here"}
        notePath="test.md"
      />,
    );
    const callout = container.querySelector(".callout");
    expect(callout).toBeTruthy();
    const header = container.querySelector(".callout-header");
    expect(header?.textContent).toContain("warning");
  });

  it("renders callout with multi-line body", () => {
    const { container } = render(
      <MarkdownPreview
        content={"> [!key-insight]\n> First line\n>\n> Second paragraph"}
        notePath="test.md"
      />,
    );
    const callout = container.querySelector(".callout");
    expect(callout).toBeTruthy();
    const body = container.querySelector(".callout-body");
    expect(body?.textContent).toContain("First line");
    expect(body?.textContent).toContain("Second paragraph");
  });

  it("renders callout with no body", () => {
    const { container } = render(
      <MarkdownPreview
        content={"> [!question] Is this a good question?"}
        notePath="test.md"
      />,
    );
    const callout = container.querySelector(".callout");
    expect(callout).toBeTruthy();
    const header = container.querySelector(".callout-header");
    expect(header?.textContent).toContain("Is this a good question?");
  });
});
