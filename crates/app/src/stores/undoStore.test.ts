import { describe, it, expect, beforeEach, vi } from "vitest";
import { useUndoStore, type UndoableAction } from "./undoStore";

// Mock the API bridge
const mockApi = {
  readNote: vi.fn(),
  createNote: vi.fn(),
  deleteNote: vi.fn(),
  createFolder: vi.fn(),
  deleteFolder: vi.fn(),
  createLink: vi.fn(),
};

vi.mock("../api/bridge", () => ({
  getAPI: () => Promise.resolve(mockApi),
}));

// Mock graphStore
const mockGraphStore = {
  selectNode: vi.fn(),
};
vi.mock("./graphStore", () => ({
  useGraphStore: {
    getState: () => mockGraphStore,
  },
}));

// Mock editorStore
const mockEditorStore = {
  activeNote: null as { path: string } | null,
  clear: vi.fn(),
};
vi.mock("./editorStore", () => ({
  useEditorStore: {
    getState: () => mockEditorStore,
  },
}));

// Mock uiStore
const mockUIStore = {
  graphFocusPath: null as string | null,
  clearGraphFocus: vi.fn(),
  addEmptyFolder: vi.fn(),
  removeEmptyFolder: vi.fn(),
  emptyFolders: new Set<string>(),
};
vi.mock("./uiStore", () => ({
  useUIStore: {
    getState: () => mockUIStore,
    setState: vi.fn((partial: Record<string, unknown>) => Object.assign(mockUIStore, partial)),
  },
}));

const sampleNote = {
  path: "Concepts/Test.md",
  title: "Test Note",
  note_type: "concept",
  tags: ["test"],
  status: "draft",
  created: "2026-01-01",
  modified: "2026-01-01",
  source: null,
  summary: null,
  links: [{ target: "Concepts/Other.md", rel: "related-to" }],
  extra: {},
  body: "# Test\nSome body",
};

function resetStore() {
  useUndoStore.setState({
    undoStack: [],
    redoStack: [],
    isProcessing: false,
    toastMessage: null,
    toastKey: 0,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  resetStore();
  mockEditorStore.activeNote = null;
  mockUIStore.emptyFolders = new Set<string>();
  mockUIStore.graphFocusPath = null;
});

describe("pushAction", () => {
  it("adds to undo stack and clears redo stack", () => {
    const action: UndoableAction = { kind: "create-note", path: "test.md" };
    useUndoStore.getState().pushAction(action);

    const state = useUndoStore.getState();
    expect(state.undoStack).toHaveLength(1);
    expect(state.undoStack[0]).toEqual(action);
    expect(state.redoStack).toHaveLength(0);
  });

  it("clears redo stack when new action is pushed", () => {
    useUndoStore.setState({
      redoStack: [{ kind: "create-note", path: "old.md" }],
    });
    useUndoStore.getState().pushAction({ kind: "create-note", path: "new.md" });

    expect(useUndoStore.getState().redoStack).toHaveLength(0);
  });

  it("respects MAX_UNDO_STACK (20)", () => {
    for (let i = 0; i < 25; i++) {
      useUndoStore.getState().pushAction({ kind: "create-note", path: `note-${i}.md` });
    }
    expect(useUndoStore.getState().undoStack).toHaveLength(20);
    // Most recent should be first
    expect(useUndoStore.getState().undoStack[0].kind).toBe("create-note");
    expect((useUndoStore.getState().undoStack[0] as { path: string }).path).toBe("note-24.md");
  });
});

describe("canUndo / canRedo", () => {
  it("returns false when stacks are empty", () => {
    expect(useUndoStore.getState().canUndo()).toBe(false);
    expect(useUndoStore.getState().canRedo()).toBe(false);
  });

  it("returns true when stacks have items", () => {
    useUndoStore.getState().pushAction({ kind: "create-note", path: "test.md" });
    expect(useUndoStore.getState().canUndo()).toBe(true);
    expect(useUndoStore.getState().canRedo()).toBe(false);
  });
});

describe("clear", () => {
  it("empties both stacks", () => {
    useUndoStore.getState().pushAction({ kind: "create-note", path: "test.md" });
    useUndoStore.setState({ redoStack: [{ kind: "create-folder", folderPath: "dir" }] });

    useUndoStore.getState().clear();
    const state = useUndoStore.getState();
    expect(state.undoStack).toHaveLength(0);
    expect(state.redoStack).toHaveLength(0);
  });
});

describe("undo create-note", () => {
  it("deletes unmodified note and pushes to redo", async () => {
    const emptyNote = { ...sampleNote, body: "" };
    mockApi.readNote.mockResolvedValue(emptyNote);

    useUndoStore.getState().pushAction({ kind: "create-note", path: "Concepts/Test.md" });
    await useUndoStore.getState().undo();

    expect(mockApi.readNote).toHaveBeenCalledWith("Concepts/Test.md");
    expect(mockApi.deleteNote).toHaveBeenCalledWith("Concepts/Test.md", true);

    const state = useUndoStore.getState();
    expect(state.undoStack).toHaveLength(0);
    expect(state.redoStack).toHaveLength(1);
    expect(state.redoStack[0].kind).toBe("create-note");
    expect(state.toastMessage).toContain("Undo");
  });

  it("refuses to undo if note was modified", async () => {
    mockApi.readNote.mockResolvedValue(sampleNote); // has body content

    useUndoStore.getState().pushAction({ kind: "create-note", path: "Concepts/Test.md" });
    await useUndoStore.getState().undo();

    expect(mockApi.deleteNote).not.toHaveBeenCalled();
    expect(useUndoStore.getState().toastMessage).toContain("modified");
    // Action is re-pushed to undo stack so user can retry later
    expect(useUndoStore.getState().undoStack).toHaveLength(1);
    expect(useUndoStore.getState().redoStack).toHaveLength(0);
  });

  it("clears editor if the note being undone is active", async () => {
    const emptyNote = { ...sampleNote, body: "" };
    mockApi.readNote.mockResolvedValue(emptyNote);
    mockEditorStore.activeNote = { path: "Concepts/Test.md" };

    useUndoStore.getState().pushAction({ kind: "create-note", path: "Concepts/Test.md" });
    await useUndoStore.getState().undo();

    expect(mockEditorStore.clear).toHaveBeenCalled();
  });
});

describe("undo delete-note", () => {
  it("restores note from snapshot and restores links", async () => {
    mockApi.createNote.mockResolvedValue("Concepts/Test.md");

    useUndoStore.getState().pushAction({ kind: "delete-note", path: "Concepts/Test.md", snapshot: sampleNote });
    await useUndoStore.getState().undo();

    expect(mockApi.createNote).toHaveBeenCalledWith(expect.objectContaining({
      path: "Concepts/Test.md",
      title: "Test Note",
      note_type: "concept",
      tags: ["test"],
      body: "# Test\nSome body",
    }));
    expect(mockApi.createLink).toHaveBeenCalledWith("Concepts/Test.md", "Concepts/Other.md", "related-to", undefined);

    const state = useUndoStore.getState();
    expect(state.undoStack).toHaveLength(0);
    expect(state.redoStack).toHaveLength(1);
    expect(state.redoStack[0].kind).toBe("delete-note");
  });
});

describe("undo create-folder", () => {
  it("deletes the folder", async () => {
    mockApi.deleteFolder.mockResolvedValue({ deleted_paths: [] });

    useUndoStore.getState().pushAction({ kind: "create-folder", folderPath: "NewFolder" });
    await useUndoStore.getState().undo();

    expect(mockApi.deleteFolder).toHaveBeenCalledWith("NewFolder", false);
    expect(useUndoStore.getState().redoStack).toHaveLength(1);
  });

  it("shows toast when folder is not empty", async () => {
    mockApi.deleteFolder.mockRejectedValue(new Error("folder not empty"));

    useUndoStore.getState().pushAction({ kind: "create-folder", folderPath: "NewFolder" });
    await useUndoStore.getState().undo();

    expect(useUndoStore.getState().toastMessage).toContain("not empty");
    expect(useUndoStore.getState().redoStack).toHaveLength(0);
  });
});

describe("undo delete-folder", () => {
  it("restores folder and all notes in two passes (notes first, links second)", async () => {
    const note1 = { ...sampleNote, path: "Dir/A.md", title: "A", links: [{ target: "Dir/B.md", rel: "causes" }] };
    const note2 = { ...sampleNote, path: "Dir/B.md", title: "B", links: [] };
    mockApi.createNote.mockImplementation((p: { path: string }) => Promise.resolve(p.path));

    useUndoStore.getState().pushAction({ kind: "delete-folder", folderPath: "Dir", snapshots: [note1, note2] });
    await useUndoStore.getState().undo();

    expect(mockApi.createFolder).toHaveBeenCalledWith("Dir");
    // Both notes created before any links
    expect(mockApi.createNote).toHaveBeenCalledTimes(2);
    expect(mockApi.createLink).toHaveBeenCalledWith("Dir/A.md", "Dir/B.md", "causes", undefined);

    expect(useUndoStore.getState().redoStack).toHaveLength(1);
  });
});

describe("redo", () => {
  it("redo after undo create-note re-creates the note", async () => {
    const emptyNote = { ...sampleNote, body: "", links: [] };
    mockApi.readNote.mockResolvedValue(emptyNote);
    mockApi.createNote.mockResolvedValue("Concepts/Test.md");

    // Push and undo
    useUndoStore.getState().pushAction({ kind: "create-note", path: "Concepts/Test.md" });
    await useUndoStore.getState().undo();

    vi.clearAllMocks();
    mockApi.createNote.mockResolvedValue("Concepts/Test.md");

    // Redo
    await useUndoStore.getState().redo();

    expect(mockApi.createNote).toHaveBeenCalled();
    expect(useUndoStore.getState().undoStack).toHaveLength(1);
    expect(useUndoStore.getState().redoStack).toHaveLength(0);
  });

  it("new action after undo clears redo stack", async () => {
    const emptyNote = { ...sampleNote, body: "", links: [] };
    mockApi.readNote.mockResolvedValue(emptyNote);

    useUndoStore.getState().pushAction({ kind: "create-note", path: "a.md" });
    await useUndoStore.getState().undo();
    expect(useUndoStore.getState().redoStack).toHaveLength(1);

    // New action clears redo
    useUndoStore.getState().pushAction({ kind: "create-note", path: "b.md" });
    expect(useUndoStore.getState().redoStack).toHaveLength(0);
  });
});

describe("concurrent undo prevention", () => {
  it("blocks undo when isProcessing is true", async () => {
    useUndoStore.getState().pushAction({ kind: "create-note", path: "test.md" });
    useUndoStore.setState({ isProcessing: true });

    await useUndoStore.getState().undo();

    // Should not have called any API
    expect(mockApi.readNote).not.toHaveBeenCalled();
    // Stack unchanged
    expect(useUndoStore.getState().undoStack).toHaveLength(1);
  });
});

describe("redo delete-note", () => {
  it("snapshots then deletes the note", async () => {
    // Set up: action on redo stack (as if undo of delete-note just happened)
    useUndoStore.setState({
      redoStack: [{ kind: "delete-note", path: "Concepts/Test.md", snapshot: sampleNote }],
    });
    const freshSnapshot = { ...sampleNote, body: "updated body" };
    mockApi.readNote.mockResolvedValue(freshSnapshot);

    await useUndoStore.getState().redo();

    expect(mockApi.readNote).toHaveBeenCalledWith("Concepts/Test.md");
    expect(mockApi.deleteNote).toHaveBeenCalledWith("Concepts/Test.md", true);

    const state = useUndoStore.getState();
    expect(state.redoStack).toHaveLength(0);
    expect(state.undoStack).toHaveLength(1);
    // Undo stack has fresh snapshot
    const undoAction = state.undoStack[0] as { kind: "delete-note"; snapshot: typeof sampleNote };
    expect(undoAction.snapshot.body).toBe("updated body");
  });

  it("shows toast when note no longer exists", async () => {
    useUndoStore.setState({
      redoStack: [{ kind: "delete-note", path: "gone.md", snapshot: sampleNote }],
    });
    mockApi.readNote.mockRejectedValue(new Error("not found"));

    await useUndoStore.getState().redo();

    expect(mockApi.deleteNote).not.toHaveBeenCalled();
    expect(useUndoStore.getState().toastMessage).toContain("no longer exists");
  });
});

describe("redo delete-folder", () => {
  it("snapshots all notes then deletes the folder", async () => {
    const note1 = { ...sampleNote, path: "Dir/A.md", title: "A", links: [] };
    const note2 = { ...sampleNote, path: "Dir/B.md", title: "B", links: [] };
    useUndoStore.setState({
      redoStack: [{ kind: "delete-folder", folderPath: "Dir", snapshots: [note1, note2] }],
    });
    mockApi.readNote.mockImplementation((p: string) => Promise.resolve(p === "Dir/A.md" ? note1 : note2));
    mockApi.deleteFolder.mockResolvedValue({ deleted_paths: ["Dir/A.md", "Dir/B.md"] });

    await useUndoStore.getState().redo();

    expect(mockApi.deleteFolder).toHaveBeenCalledWith("Dir", true);

    const state = useUndoStore.getState();
    expect(state.redoStack).toHaveLength(0);
    expect(state.undoStack).toHaveLength(1);
  });
});

describe("redo create-note without snapshot", () => {
  it("shows error when snapshot is missing", async () => {
    useUndoStore.setState({
      redoStack: [{ kind: "create-note", path: "test.md" }],
    });

    await useUndoStore.getState().redo();

    expect(mockApi.createNote).not.toHaveBeenCalled();
    expect(useUndoStore.getState().toastMessage).toContain("no snapshot");
  });
});

describe("partial link restoration", () => {
  it("creates note even when some links fail", async () => {
    const noteWithLinks = {
      ...sampleNote,
      links: [
        { target: "Concepts/Good.md", rel: "related-to" },
        { target: "Concepts/Bad.md", rel: "causes" },
      ],
    };
    mockApi.createNote.mockResolvedValue("Concepts/Test.md");
    mockApi.createLink
      .mockResolvedValueOnce(undefined) // first link succeeds
      .mockRejectedValueOnce(new Error("target not found")); // second fails

    useUndoStore.getState().pushAction({ kind: "delete-note", path: "Concepts/Test.md", snapshot: noteWithLinks });
    await useUndoStore.getState().undo();

    // Note was created
    expect(mockApi.createNote).toHaveBeenCalled();
    // First link created, second silently skipped
    expect(mockApi.createLink).toHaveBeenCalledTimes(2);
    // Action pushed to redo despite partial link failure
    expect(useUndoStore.getState().redoStack).toHaveLength(1);
  });
});

describe("error handling", () => {
  it("shows error toast and discards action on failure", async () => {
    mockApi.readNote.mockRejectedValue(new Error("disk error"));

    useUndoStore.getState().pushAction({ kind: "delete-note", path: "test.md", snapshot: sampleNote });
    // delete-note undo tries to createNote which we'll make fail
    mockApi.createNote.mockRejectedValue(new Error("disk full"));

    await useUndoStore.getState().undo();

    expect(useUndoStore.getState().toastMessage).toContain("failed");
    expect(useUndoStore.getState().isProcessing).toBe(false);
    // Action discarded — not in either stack
    expect(useUndoStore.getState().undoStack).toHaveLength(0);
    expect(useUndoStore.getState().redoStack).toHaveLength(0);
  });
});
