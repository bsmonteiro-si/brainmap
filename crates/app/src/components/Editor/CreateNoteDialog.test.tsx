import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateNoteDialog } from "./CreateNoteDialog";

// Mock API
const mockCreateNote = vi.fn();
const mockCreateLink = vi.fn();

vi.mock("../../api/bridge", () => ({
  getAPI: () =>
    Promise.resolve({
      createNote: mockCreateNote,
      createLink: mockCreateLink,
    }),
}));

// Mock stores
const mockCreateNoteInGraph = vi.fn();
const mockApplyEvent = vi.fn();
const mockOpenNote = vi.fn();
const mockRefreshActiveNote = vi.fn();

vi.mock("../../stores/graphStore", () => ({
  useGraphStore: {
    getState: () => ({
      createNote: mockCreateNoteInGraph,
      applyEvent: mockApplyEvent,
    }),
  },
}));

vi.mock("../../stores/editorStore", () => ({
  useEditorStore: {
    getState: () => ({
      openNote: mockOpenNote,
      refreshActiveNote: mockRefreshActiveNote,
    }),
  },
}));

vi.mock("../../stores/workspaceStore", () => ({
  useWorkspaceStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      noteTypes: ["concept", "book-note", "question"],
    }),
}));

// UIStore mock with configurable state
let uiStoreState = {
  createNoteInitialPath: null as string | null,
  createNoteInitialTitle: null as string | null,
  createNoteMode: "default" as "default" | "create-and-link",
  createAndLinkSource: null as { notePath: string; rel: string } | null,
};
const mockClose = vi.fn();

vi.mock("../../stores/uiStore", () => ({
  useUIStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      closeCreateNoteDialog: mockClose,
      ...uiStoreState,
    }),
}));

describe("CreateNoteDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateNote.mockResolvedValue("Concepts/New-Note.md");
    mockCreateLink.mockResolvedValue(undefined);
    mockOpenNote.mockResolvedValue(undefined);
    mockRefreshActiveNote.mockResolvedValue(undefined);
    uiStoreState = {
      createNoteInitialPath: null,
      createNoteInitialTitle: null,
      createNoteMode: "default",
      createAndLinkSource: null,
    };
  });

  it("shows 'Create Note' heading in default mode", () => {
    render(<CreateNoteDialog />);
    expect(screen.getByText("Create Note")).toBeDefined();
  });

  it("shows 'Create & Link' heading in create-and-link mode", () => {
    uiStoreState.createNoteMode = "create-and-link";
    uiStoreState.createAndLinkSource = { notePath: "Notes/Source.md", rel: "causes" };
    render(<CreateNoteDialog />);
    expect(screen.getByRole("heading", { name: "Create & Link" })).toBeDefined();
  });

  it("pre-fills title from initialTitle", () => {
    uiStoreState.createNoteInitialTitle = "My New Concept";
    render(<CreateNoteDialog />);
    const titleInput = screen.getByDisplayValue("My New Concept");
    expect(titleInput).toBeDefined();
  });

  it("calls createLink after createNote in create-and-link mode", async () => {
    uiStoreState.createNoteMode = "create-and-link";
    uiStoreState.createAndLinkSource = { notePath: "Notes/Source.md", rel: "supports" };
    uiStoreState.createNoteInitialTitle = "New Target";

    render(<CreateNoteDialog />);

    // Fill in required path field
    const pathInput = screen.getByPlaceholderText("Concepts/My-Note.md");
    fireEvent.change(pathInput, { target: { value: "Concepts/New-Target.md" } });

    // Submit
    const submitBtn = screen.getByRole("button", { name: "Create & Link" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateNote).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "Concepts/New-Target.md",
          title: "New Target",
        }),
      );
    });

    await waitFor(() => {
      expect(mockCreateLink).toHaveBeenCalledWith(
        "Notes/Source.md",
        "Concepts/New-Note.md",
        "supports",
      );
    });

    await waitFor(() => {
      expect(mockRefreshActiveNote).toHaveBeenCalled();
      expect(mockOpenNote).not.toHaveBeenCalled();
      expect(mockClose).toHaveBeenCalled();
    });
  });

  it("does NOT call createLink in default mode", async () => {
    render(<CreateNoteDialog />);

    const pathInput = screen.getByPlaceholderText("Concepts/My-Note.md");
    fireEvent.change(pathInput, { target: { value: "Concepts/Test.md" } });

    const titleInput = screen.getByPlaceholderText("My Note");
    fireEvent.change(titleInput, { target: { value: "Test Note" } });

    const submitBtn = screen.getByText("Create");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateNote).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockOpenNote).toHaveBeenCalled();
      expect(mockCreateLink).not.toHaveBeenCalled();
      expect(mockClose).toHaveBeenCalled();
    });
  });

  it("closes dialog when createLink fails (note still created)", async () => {
    uiStoreState.createNoteMode = "create-and-link";
    uiStoreState.createAndLinkSource = { notePath: "Notes/Source.md", rel: "causes" };
    uiStoreState.createNoteInitialTitle = "Target";
    mockCreateLink.mockRejectedValueOnce(new Error("link failed"));

    render(<CreateNoteDialog />);

    const pathInput = screen.getByPlaceholderText("Concepts/My-Note.md");
    fireEvent.change(pathInput, { target: { value: "Concepts/Target.md" } });

    const submitBtn = screen.getByRole("button", { name: "Create & Link" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateNote).toHaveBeenCalled();
      expect(mockCreateLink).toHaveBeenCalled();
    });

    // Dialog should close even though link failed
    await waitFor(() => {
      expect(mockClose).toHaveBeenCalled();
    });
  });
});
