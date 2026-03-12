import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LinksEditor } from "./LinksEditor";
import type { TypedLinkDto } from "../../api/types";

// Mock API
const mockCreateLink = vi.fn();
const mockDeleteLink = vi.fn();
const mockReadNote = vi.fn();

vi.mock("../../api/bridge", () => ({
  getAPI: () =>
    Promise.resolve({
      createLink: mockCreateLink,
      deleteLink: mockDeleteLink,
      readNote: mockReadNote,
    }),
}));

// Mock stores
const mockApplyEvent = vi.fn();
const mockRefreshActiveNote = vi.fn();

vi.mock("../../stores/graphStore", () => ({
  useGraphStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) =>
      selector({
        nodes: new Map([
          ["Concepts/SCM.md", { title: "Structural Causal Model", note_type: "concept" }],
          ["People/Pearl.md", { title: "Judea Pearl", note_type: "person" }],
          ["Concepts/Confounding.md", { title: "Confounding", note_type: "concept" }],
        ]),
      }),
    { getState: () => ({ applyEvent: mockApplyEvent }) },
  ),
}));

vi.mock("../../stores/editorStore", () => ({
  useEditorStore: {
    getState: () => ({ refreshActiveNote: mockRefreshActiveNote }),
  },
}));

const mockOpenCreateNoteDialog = vi.fn();

vi.mock("../../stores/uiStore", () => ({
  useUIStore: {
    getState: () => ({ openCreateNoteDialog: mockOpenCreateNoteDialog }),
  },
}));

const LINKS: TypedLinkDto[] = [
  { target: "Concepts/SCM.md", rel: "supports" },
  { target: "People/Pearl.md", rel: "authored-by" },
];

describe("LinksEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateLink.mockResolvedValue(undefined);
    mockDeleteLink.mockResolvedValue(undefined);
    mockRefreshActiveNote.mockResolvedValue(undefined);
    mockOpenCreateNoteDialog.mockReset();
  });

  it("renders existing links with titles and rel labels", () => {
    render(<LinksEditor notePath="Notes/Test.md" links={LINKS} />);

    expect(screen.getByText("Structural Causal Model")).toBeDefined();
    expect(screen.getByText("Judea Pearl")).toBeDefined();
    // Rel labels are in .link-rel spans (also appear as <option> in select)
    const relSpans = document.querySelectorAll(".link-rel");
    const relTexts = Array.from(relSpans).map((el) => el.textContent);
    expect(relTexts).toContain("supports");
    expect(relTexts).toContain("authored-by");
  });

  it("remove button calls deleteLink with correct params", async () => {
    render(<LinksEditor notePath="Notes/Test.md" links={LINKS} />);

    const removeButtons = screen.getAllByText("×");
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(mockDeleteLink).toHaveBeenCalledWith(
        "Notes/Test.md",
        "Concepts/SCM.md",
        "supports",
      );
    });
  });

  it("updates graph store after removing a link", async () => {
    render(<LinksEditor notePath="Notes/Test.md" links={LINKS} />);

    const removeButtons = screen.getAllByText("×");
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(mockApplyEvent).toHaveBeenCalledWith({
        type: "edge-deleted",
        edge: {
          source: "Notes/Test.md",
          target: "Concepts/SCM.md",
          rel: "supports",
          kind: "Explicit",
        },
      });
      expect(mockRefreshActiveNote).toHaveBeenCalled();
    });
  });

  it("add button is disabled when target is empty", () => {
    render(<LinksEditor notePath="Notes/Test.md" links={[]} />);

    const addBtn = screen.getByText("+");
    expect((addBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it("shows Create & Link button when target doesn't match a node", () => {
    render(<LinksEditor notePath="Notes/Test.md" links={[]} />);

    const input = screen.getByPlaceholderText("Target note…");
    fireEvent.change(input, { target: { value: "Nonexistent Note" } });

    expect(screen.getByText("Create & Link")).toBeDefined();
    expect(screen.queryByText("+")).toBeNull();
  });

  it("add button calls createLink with correct params", async () => {
    render(<LinksEditor notePath="Notes/Test.md" links={[]} />);

    const input = screen.getByPlaceholderText("Target note…");
    fireEvent.change(input, { target: { value: "Confounding" } });

    const addBtn = screen.getByText("+");
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(mockCreateLink).toHaveBeenCalledWith(
        "Notes/Test.md",
        "Concepts/Confounding.md",
        "causes",
      );
    });
  });

  it("updates graph store after adding a link", async () => {
    render(<LinksEditor notePath="Notes/Test.md" links={[]} />);

    const input = screen.getByPlaceholderText("Target note…");
    fireEvent.change(input, { target: { value: "Confounding" } });
    fireEvent.click(screen.getByText("+"));

    await waitFor(() => {
      expect(mockApplyEvent).toHaveBeenCalledWith({
        type: "edge-created",
        edge: {
          source: "Notes/Test.md",
          target: "Concepts/Confounding.md",
          rel: "causes",
          kind: "Explicit",
        },
      });
      expect(mockRefreshActiveNote).toHaveBeenCalled();
    });
  });

  it("clears target input after successful add", async () => {
    render(<LinksEditor notePath="Notes/Test.md" links={[]} />);

    const input = screen.getByPlaceholderText("Target note…") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Confounding" } });
    fireEvent.click(screen.getByText("+"));

    await waitFor(() => {
      expect(input.value).toBe("");
    });
  });

  it("Enter key in target input triggers add", async () => {
    render(<LinksEditor notePath="Notes/Test.md" links={[]} />);

    const input = screen.getByPlaceholderText("Target note…");
    fireEvent.change(input, { target: { value: "Confounding" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(mockCreateLink).toHaveBeenCalledWith(
        "Notes/Test.md",
        "Concepts/Confounding.md",
        "causes",
      );
    });
  });

  it("add button is disabled for duplicate links", () => {
    render(<LinksEditor notePath="Notes/Test.md" links={LINKS} />);

    const input = screen.getByPlaceholderText("Target note…");
    fireEvent.change(input, { target: { value: "Structural Causal Model" } });

    // Change rel to match existing link
    const select = screen.getByDisplayValue("causes");
    fireEvent.change(select, { target: { value: "supports" } });

    const addBtn = screen.getByText("+");
    expect((addBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it("shows error when deleteLink fails", async () => {
    mockDeleteLink.mockRejectedValueOnce(new Error("server error"));

    render(<LinksEditor notePath="Notes/Test.md" links={LINKS} />);

    const removeButtons = screen.getAllByText("×");
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Failed to remove link")).toBeDefined();
    });
  });

  it("shows error when createLink fails", async () => {
    mockCreateLink.mockRejectedValueOnce(new Error("duplicate"));

    render(<LinksEditor notePath="Notes/Test.md" links={[]} />);

    const input = screen.getByPlaceholderText("Target note…");
    fireEvent.change(input, { target: { value: "Confounding" } });
    fireEvent.click(screen.getByText("+"));

    await waitFor(() => {
      expect(screen.getByText("Failed to add link")).toBeDefined();
    });
  });

  it("shows + button (not Create & Link) when target matches an existing node", () => {
    render(<LinksEditor notePath="Notes/Test.md" links={[]} />);

    const input = screen.getByPlaceholderText("Target note…");
    fireEvent.change(input, { target: { value: "Confounding" } });

    expect(screen.getByText("+")).toBeDefined();
    expect(screen.queryByText("Create & Link")).toBeNull();
  });

  it("shows + button when input is empty (no Create & Link)", () => {
    render(<LinksEditor notePath="Notes/Test.md" links={[]} />);

    expect(screen.getByText("+")).toBeDefined();
    expect(screen.queryByText("Create & Link")).toBeNull();
  });

  it("Create & Link button calls openCreateNoteDialog with correct params", () => {
    render(<LinksEditor notePath="Notes/Test.md" links={[]} />);

    const input = screen.getByPlaceholderText("Target note…");
    fireEvent.change(input, { target: { value: "Brand New Note" } });

    const createBtn = screen.getByText("Create & Link");
    fireEvent.click(createBtn);

    expect(mockOpenCreateNoteDialog).toHaveBeenCalledWith({
      initialTitle: "Brand New Note",
      mode: "create-and-link",
      linkSource: { notePath: "Notes/Test.md", rel: "causes" },
    });
  });

  it("Create & Link clears the target input after clicking", () => {
    render(<LinksEditor notePath="Notes/Test.md" links={[]} />);

    const input = screen.getByPlaceholderText("Target note…") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Brand New Note" } });
    fireEvent.click(screen.getByText("Create & Link"));

    expect(input.value).toBe("");
  });

  it("Create & Link uses the selected relationship type", () => {
    render(<LinksEditor notePath="Notes/Test.md" links={[]} />);

    const input = screen.getByPlaceholderText("Target note…");
    fireEvent.change(input, { target: { value: "New Note" } });

    const select = screen.getByDisplayValue("causes");
    fireEvent.change(select, { target: { value: "supports" } });

    fireEvent.click(screen.getByText("Create & Link"));

    expect(mockOpenCreateNoteDialog).toHaveBeenCalledWith({
      initialTitle: "New Note",
      mode: "create-and-link",
      linkSource: { notePath: "Notes/Test.md", rel: "supports" },
    });
  });
});
