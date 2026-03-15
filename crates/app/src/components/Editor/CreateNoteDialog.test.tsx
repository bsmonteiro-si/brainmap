import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateNoteDialog } from "./CreateNoteDialog";

// Mock API
const mockCreateNote = vi.fn();
const mockCreateLink = vi.fn();
const mockCreatePlainFile = vi.fn();

vi.mock("../../api/bridge", () => ({
  getAPI: () =>
    Promise.resolve({
      createNote: mockCreateNote,
      createLink: mockCreateLink,
      createPlainFile: mockCreatePlainFile,
    }),
}));

// Mock stores
const mockCreateNoteInGraph = vi.fn();
const mockApplyEvent = vi.fn();
const mockOpenNote = vi.fn();
const mockOpenPlainFile = vi.fn();
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
      openPlainFile: mockOpenPlainFile,
      refreshActiveNote: mockRefreshActiveNote,
    }),
  },
}));

vi.mock("../../stores/tabStore", () => ({
  useTabStore: {
    getState: () => ({
      closeTab: vi.fn(),
    }),
  },
}));

vi.mock("../../stores/tabActions", () => ({
  closeTabAndNavigateNext: vi.fn(),
}));

vi.mock("../../stores/workspaceStore", () => ({
  useWorkspaceStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      noteTypes: ["concept", "book-note", "question"],
    }),
}));

// UIStore mock with configurable state — uiStoreState is shared between tests
// and lives outside the vi.mock factory so tests can mutate it before render.
const uiStoreState: Record<string, unknown> = {};
const mockClose = vi.fn();

vi.mock("../../stores/uiStore", () => {
  const storeFunc = (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      closeCreateNoteDialog: mockClose,
      emptyFolders: new Set<string>(),
      removeEmptyFolder: vi.fn(),
      ...uiStoreState,
    });
  storeFunc.getState = () => ({
    closeCreateNoteDialog: mockClose,
    emptyFolders: new Set<string>(),
    removeEmptyFolder: vi.fn(),
    ...uiStoreState,
  });
  storeFunc.setState = vi.fn((partial: Record<string, unknown>) => {
    Object.assign(uiStoreState, partial);
  });
  return { useUIStore: storeFunc };
});

function resetUiState() {
  // Clear all keys then assign defaults
  for (const key of Object.keys(uiStoreState)) delete uiStoreState[key];
  Object.assign(uiStoreState, {
    createNoteInitialPath: null,
    createNoteInitialTitle: null,
    createNoteMode: "default",
    createFileKind: "note",
    createAndLinkSource: null,
    createNoteSaveAsBody: null,
    createNoteSaveAsTabId: null,
  });
}

describe("CreateNoteDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateNote.mockResolvedValue("Concepts/New-Note.md");
    mockCreateLink.mockResolvedValue(undefined);
    mockCreatePlainFile.mockResolvedValue("config.json");
    mockOpenNote.mockResolvedValue(undefined);
    mockOpenPlainFile.mockResolvedValue(undefined);
    mockRefreshActiveNote.mockResolvedValue(undefined);
    resetUiState();
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

    // Fill in required path field — .md is auto-appended in note mode
    const pathInput = screen.getByPlaceholderText("Concepts/My-Note");
    fireEvent.change(pathInput, { target: { value: "Concepts/New-Target" } });

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

    const pathInput = screen.getByPlaceholderText("Concepts/My-Note");
    fireEvent.change(pathInput, { target: { value: "Concepts/Test" } });

    const titleInput = screen.getByPlaceholderText("My Note");
    fireEvent.change(titleInput, { target: { value: "Test Note" } });

    const submitBtn = screen.getByText("Create");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateNote).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "Concepts/Test.md",
        }),
      );
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

    const pathInput = screen.getByPlaceholderText("Concepts/My-Note");
    fireEvent.change(pathInput, { target: { value: "Concepts/Target" } });

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

  // ── New tests for Note/File mode toggle ──

  it("shows mode toggle in default mode", () => {
    render(<CreateNoteDialog />);
    expect(screen.getByText("Note")).toBeDefined();
    expect(screen.getByText("File")).toBeDefined();
  });

  it("hides mode toggle in create-and-link mode", () => {
    uiStoreState.createNoteMode = "create-and-link";
    uiStoreState.createAndLinkSource = { notePath: "Notes/Source.md", rel: "causes" };
    render(<CreateNoteDialog />);
    expect(screen.queryByText("Note")).toBeNull();
    expect(screen.queryByText("File")).toBeNull();
  });

  it("shows Title/Type/Tags fields in Note mode, hides in File mode", () => {
    uiStoreState.createFileKind = "note";
    const { rerender } = render(<CreateNoteDialog />);
    expect(screen.getByLabelText("Title *")).toBeDefined();
    expect(screen.getByLabelText("Type *")).toBeDefined();
    expect(screen.getByLabelText("Tags (comma-separated)")).toBeDefined();

    // Switch to File mode
    uiStoreState.createFileKind = "file";
    rerender(<CreateNoteDialog />);
    expect(screen.queryByLabelText("Title *")).toBeNull();
    expect(screen.queryByLabelText("Type *")).toBeNull();
    expect(screen.queryByLabelText("Tags (comma-separated)")).toBeNull();
  });

  it("shows 'Create File' heading in File mode", () => {
    uiStoreState.createFileKind = "file";
    render(<CreateNoteDialog />);
    expect(screen.getByText("Create File")).toBeDefined();
  });

  it("auto-appends .md in Note mode", async () => {
    render(<CreateNoteDialog />);

    const pathInput = screen.getByPlaceholderText("Concepts/My-Note");
    fireEvent.change(pathInput, { target: { value: "Concepts/Auto-Append" } });

    const titleInput = screen.getByPlaceholderText("My Note");
    fireEvent.change(titleInput, { target: { value: "Auto Append" } });

    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => {
      expect(mockCreateNote).toHaveBeenCalledWith(
        expect.objectContaining({ path: "Concepts/Auto-Append.md" }),
      );
    });
  });

  it("does not double-append .md if user types it", async () => {
    render(<CreateNoteDialog />);

    const pathInput = screen.getByPlaceholderText("Concepts/My-Note");
    fireEvent.change(pathInput, { target: { value: "Concepts/Test.md" } });

    const titleInput = screen.getByPlaceholderText("My Note");
    fireEvent.change(titleInput, { target: { value: "Test" } });

    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => {
      expect(mockCreateNote).toHaveBeenCalledWith(
        expect.objectContaining({ path: "Concepts/Test.md" }),
      );
    });
  });

  it("rejects .md extension in File mode", () => {
    uiStoreState.createFileKind = "file";
    render(<CreateNoteDialog />);

    const pathInput = screen.getByPlaceholderText("config.json");
    fireEvent.change(pathInput, { target: { value: "notes.md" } });

    expect(screen.getByText("Use Note mode for .md files")).toBeDefined();
  });

  it("rejects path without extension in File mode", () => {
    uiStoreState.createFileKind = "file";
    render(<CreateNoteDialog />);

    const pathInput = screen.getByPlaceholderText("config.json");
    fireEvent.change(pathInput, { target: { value: "noextension" } });

    expect(screen.getByText("Path must include a file extension")).toBeDefined();
  });

  it("calls createPlainFile in File mode and opens plain file", async () => {
    uiStoreState.createFileKind = "file";
    mockCreatePlainFile.mockResolvedValue("scripts/test.py");
    render(<CreateNoteDialog />);

    const pathInput = screen.getByPlaceholderText("config.json");
    fireEvent.change(pathInput, { target: { value: "scripts/test.py" } });

    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => {
      expect(mockCreatePlainFile).toHaveBeenCalledWith("scripts/test.py", undefined);
    });

    await waitFor(() => {
      expect(mockOpenPlainFile).toHaveBeenCalledWith("scripts/test.py");
      expect(mockCreateNote).not.toHaveBeenCalled();
      expect(mockClose).toHaveBeenCalled();
    });
  });

  it("forwards body content to createPlainFile", async () => {
    uiStoreState.createFileKind = "file";
    mockCreatePlainFile.mockResolvedValue("data/config.json");
    render(<CreateNoteDialog />);

    const pathInput = screen.getByPlaceholderText("config.json");
    fireEvent.change(pathInput, { target: { value: "data/config.json" } });

    const bodyInput = screen.getByPlaceholderText("File content...");
    fireEvent.change(bodyInput, { target: { value: '{"key": "value"}' } });

    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => {
      expect(mockCreatePlainFile).toHaveBeenCalledWith("data/config.json", '{"key": "value"}');
    });
  });

  it("shows error when createPlainFile fails", async () => {
    uiStoreState.createFileKind = "file";
    mockCreatePlainFile.mockRejectedValueOnce(new Error("File already exists: test.json"));
    render(<CreateNoteDialog />);

    const pathInput = screen.getByPlaceholderText("config.json");
    fireEvent.change(pathInput, { target: { value: "test.json" } });

    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => {
      expect(screen.getByText("File already exists: test.json")).toBeDefined();
    });

    // Submit button should be re-enabled
    const createBtn = screen.getByText("Create") as HTMLButtonElement;
    expect(createBtn.disabled).toBe(false);
  });

  it("rejects dot-only extension in File mode", () => {
    uiStoreState.createFileKind = "file";
    render(<CreateNoteDialog />);

    const pathInput = screen.getByPlaceholderText("config.json");
    fireEvent.change(pathInput, { target: { value: "file." } });

    expect(screen.getByText("Path must include a file extension")).toBeDefined();
  });

  it("rejects dot in folder name without file extension", () => {
    uiStoreState.createFileKind = "file";
    render(<CreateNoteDialog />);

    const pathInput = screen.getByPlaceholderText("config.json");
    fireEvent.change(pathInput, { target: { value: "folder.name/myfile" } });

    expect(screen.getByText("Path must include a file extension")).toBeDefined();
  });
});
