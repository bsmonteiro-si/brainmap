import { describe, it, expect, beforeEach, vi } from "vitest";
import { useEditorStore } from "./editorStore";

// Mock the API bridge
const mockApi = {
  readNote: vi.fn(),
  updateNote: vi.fn(),
  readPlainFile: vi.fn(),
};

vi.mock("../api/bridge", () => ({
  getAPI: () => Promise.resolve(mockApi),
}));

// Mock graphStore to avoid side effects
vi.mock("./graphStore", () => ({
  useGraphStore: {
    getState: () => ({
      applyEvent: vi.fn(),
    }),
  },
}));

// Mock tabStore for tab management
vi.mock("./tabStore", () => ({
  useTabStore: {
    getState: () => ({
      activeTabId: null,
      getTab: () => undefined,
      openTab: vi.fn(),
      activateTab: vi.fn(),
      updateTabState: vi.fn(),
      tabs: [],
    }),
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
  links: [],
  extra: {},
  body: "# Test\nSome body",
};

beforeEach(() => {
  vi.clearAllMocks();
  useEditorStore.setState({
    activeNote: null,
    isLoading: false,
    isDirty: false,
    conflictState: "none",
    editedBody: null,
    editedFrontmatter: null,
    savingInProgress: false,
    fmUndoStack: [],
    fmRedoStack: [],
    _lastFmField: null,
    _lastFmTime: 0,
    viewMode: "edit",
    rawContent: null,
    scrollTop: 0,
    cursorPos: 0,
  });
});

describe("updateFrontmatter", () => {
  it("sets isDirty and stores changes", () => {
    useEditorStore.setState({ activeNote: sampleNote });
    useEditorStore.getState().updateFrontmatter({ title: "New Title" });
    const s = useEditorStore.getState();
    expect(s.isDirty).toBe(true);
    expect(s.editedFrontmatter).toEqual({ title: "New Title" });
  });

  it("merges with existing editedFrontmatter", () => {
    useEditorStore.setState({ activeNote: sampleNote });
    useEditorStore.getState().updateFrontmatter({ title: "New Title" });
    useEditorStore.getState().updateFrontmatter({ tags: ["a", "b"] });
    const s = useEditorStore.getState();
    expect(s.editedFrontmatter).toEqual({ title: "New Title", tags: ["a", "b"] });
  });
});

describe("saveNote", () => {
  it("sends both body and frontmatter in one API call", async () => {
    const refreshed = { ...sampleNote, title: "New", modified: "2026-03-11" };
    mockApi.updateNote.mockResolvedValue(undefined);
    mockApi.readNote.mockResolvedValue(refreshed);

    useEditorStore.setState({
      activeNote: sampleNote,
      isDirty: true,
      editedBody: "new body",
      editedFrontmatter: { title: "New" },
    });

    await useEditorStore.getState().saveNote();

    expect(mockApi.updateNote).toHaveBeenCalledWith({
      path: "Concepts/Test.md",
      body: "new body",
      title: "New",
    });
  });

  it("sends only frontmatter when body is unchanged", async () => {
    const refreshed = { ...sampleNote, note_type: "reference", modified: "2026-03-11" };
    mockApi.updateNote.mockResolvedValue(undefined);
    mockApi.readNote.mockResolvedValue(refreshed);

    useEditorStore.setState({
      activeNote: sampleNote,
      isDirty: true,
      editedBody: null,
      editedFrontmatter: { note_type: "reference" },
    });

    await useEditorStore.getState().saveNote();

    expect(mockApi.updateNote).toHaveBeenCalledWith({
      path: "Concepts/Test.md",
      note_type: "reference",
    });
    expect(mockApi.updateNote.mock.calls[0][0]).not.toHaveProperty("body");
  });

  it("sends only body when frontmatter is unchanged", async () => {
    mockApi.updateNote.mockResolvedValue(undefined);
    mockApi.readNote.mockResolvedValue({ ...sampleNote, body: "updated body" });

    useEditorStore.setState({
      activeNote: sampleNote,
      isDirty: true,
      editedBody: "updated body",
      editedFrontmatter: null,
    });

    await useEditorStore.getState().saveNote();

    expect(mockApi.updateNote).toHaveBeenCalledWith({
      path: "Concepts/Test.md",
      body: "updated body",
    });
  });

  it("re-reads note after save for authoritative state", async () => {
    const refreshed = { ...sampleNote, title: "X", modified: "2026-03-11" };
    mockApi.updateNote.mockResolvedValue(undefined);
    mockApi.readNote.mockResolvedValue(refreshed);

    useEditorStore.setState({
      activeNote: sampleNote,
      isDirty: true,
      editedFrontmatter: { title: "X" },
    });

    await useEditorStore.getState().saveNote();

    expect(mockApi.readNote).toHaveBeenCalledWith("Concepts/Test.md");
    expect(useEditorStore.getState().activeNote?.modified).toBe("2026-03-11");
  });

  it("skips save when edited title is empty string", async () => {
    useEditorStore.setState({
      activeNote: sampleNote,
      isDirty: true,
      editedFrontmatter: { title: "" },
    });

    await useEditorStore.getState().saveNote();

    expect(mockApi.updateNote).not.toHaveBeenCalled();
  });

  it("skips save when edited title is whitespace-only", async () => {
    useEditorStore.setState({
      activeNote: sampleNote,
      isDirty: true,
      editedFrontmatter: { title: "   " },
    });

    await useEditorStore.getState().saveNote();

    expect(mockApi.updateNote).not.toHaveBeenCalled();
  });

  it("preserves dirty state on save failure", async () => {
    mockApi.updateNote.mockRejectedValue(new Error("network error"));

    useEditorStore.setState({
      activeNote: sampleNote,
      isDirty: true,
      editedFrontmatter: { title: "Unsaved" },
    });

    await useEditorStore.getState().saveNote();

    expect(useEditorStore.getState().isDirty).toBe(true);
    expect(useEditorStore.getState().savingInProgress).toBe(false);
    expect(useEditorStore.getState().editedFrontmatter).toEqual({ title: "Unsaved" });
  });

  it("resets editedFrontmatter after successful save", async () => {
    mockApi.updateNote.mockResolvedValue(undefined);
    mockApi.readNote.mockResolvedValue(sampleNote);

    useEditorStore.setState({
      activeNote: sampleNote,
      isDirty: true,
      editedBody: "x",
      editedFrontmatter: { tags: ["new"] },
    });

    await useEditorStore.getState().saveNote();

    expect(useEditorStore.getState().editedFrontmatter).toBeNull();
    expect(useEditorStore.getState().editedBody).toBeNull();
    expect(useEditorStore.getState().isDirty).toBe(false);
  });
});

describe("openNote", () => {
  it("resets editedFrontmatter when switching notes", async () => {
    mockApi.updateNote.mockResolvedValue(undefined);
    mockApi.readNote.mockResolvedValueOnce({ ...sampleNote, modified: "2026-03-12" });
    mockApi.readNote.mockResolvedValueOnce({ ...sampleNote, path: "Other.md" });

    useEditorStore.setState({
      activeNote: sampleNote,
      editedFrontmatter: { title: "unsaved" },
      isDirty: true,
    });

    await useEditorStore.getState().openNote("Other.md");

    expect(useEditorStore.getState().editedFrontmatter).toBeNull();
  });

  it("auto-saves before switching when autoSave is enabled", async () => {

    mockApi.updateNote.mockResolvedValue(undefined);
    mockApi.readNote.mockResolvedValueOnce({ ...sampleNote, modified: "2026-03-12" });
    mockApi.readNote.mockResolvedValueOnce({ ...sampleNote, path: "Other.md", title: "Other" });

    useEditorStore.setState({
      activeNote: sampleNote,
      isDirty: true,
      editedBody: "changed body",
    });

    await useEditorStore.getState().openNote("Other.md");

    expect(mockApi.updateNote).toHaveBeenCalledWith(
      expect.objectContaining({ path: "Concepts/Test.md", body: "changed body" })
    );
    expect(useEditorStore.getState().activeNote?.path).toBe("Other.md");
  });

  it("always auto-saves dirty note before switching", async () => {
    mockApi.updateNote.mockResolvedValue(undefined);
    mockApi.readNote.mockResolvedValueOnce({ ...sampleNote, modified: "2026-03-12" });
    mockApi.readNote.mockResolvedValueOnce({ ...sampleNote, path: "Other.md", title: "Other" });

    useEditorStore.setState({
      activeNote: sampleNote,
      isDirty: true,
      editedBody: "changed body",
    });

    await useEditorStore.getState().openNote("Other.md");

    expect(mockApi.updateNote).toHaveBeenCalledWith(
      expect.objectContaining({ path: "Concepts/Test.md", body: "changed body" })
    );
    expect(useEditorStore.getState().activeNote?.path).toBe("Other.md");
  });

  it("skips auto-save on switch when title is empty", async () => {

    mockApi.readNote.mockResolvedValue({ ...sampleNote, path: "Other.md" });

    useEditorStore.setState({
      activeNote: sampleNote,
      isDirty: true,
      editedFrontmatter: { title: "" },
    });

    await useEditorStore.getState().openNote("Other.md");

    expect(mockApi.updateNote).not.toHaveBeenCalled();
    expect(useEditorStore.getState().activeNote?.path).toBe("Other.md");
  });

  it("auto-save failure during switch still allows navigation", async () => {

    mockApi.updateNote.mockRejectedValue(new Error("disk full"));
    mockApi.readNote.mockResolvedValue({ ...sampleNote, path: "Other.md" });

    useEditorStore.setState({
      activeNote: sampleNote,
      isDirty: true,
      editedBody: "changed",
    });

    await useEditorStore.getState().openNote("Other.md");

    expect(useEditorStore.getState().activeNote?.path).toBe("Other.md");
  });
});

describe("resolveConflict", () => {
  it("accept-theirs resets editedFrontmatter", async () => {
    mockApi.readNote.mockResolvedValue(sampleNote);

    useEditorStore.setState({
      activeNote: sampleNote,
      editedFrontmatter: { title: "unsaved" },
      isDirty: true,
      conflictState: "external-change",
    });

    await useEditorStore.getState().resolveConflict("accept-theirs");

    expect(useEditorStore.getState().editedFrontmatter).toBeNull();
  });
});

describe("savingInProgress flag", () => {
  it("suppresses markExternalChange during save", async () => {
    useEditorStore.setState({
      activeNote: sampleNote,
      savingInProgress: true,
      isDirty: true,
    });

    await useEditorStore.getState().markExternalChange();

    expect(useEditorStore.getState().conflictState).toBe("none");
    expect(mockApi.readNote).not.toHaveBeenCalled();
  });
});

describe("frontmatter undo/redo", () => {
  it("undoFrontmatter restores previous editedFrontmatter", () => {
    useEditorStore.setState({ activeNote: sampleNote });
    useEditorStore.getState().updateFrontmatter({ note_type: "reference" });
    // Ensure different field so no grouping
    useEditorStore.getState().updateFrontmatter({ status: "final" });

    useEditorStore.getState().undoFrontmatter();
    expect(useEditorStore.getState().editedFrontmatter).toEqual({ note_type: "reference" });
  });

  it("redoFrontmatter re-applies after undo", () => {
    useEditorStore.setState({ activeNote: sampleNote });
    useEditorStore.getState().updateFrontmatter({ note_type: "reference" });
    useEditorStore.getState().updateFrontmatter({ status: "final" });

    useEditorStore.getState().undoFrontmatter();
    useEditorStore.getState().redoFrontmatter();
    expect(useEditorStore.getState().editedFrontmatter).toEqual({ note_type: "reference", status: "final" });
  });

  it("consecutive same-field edits within 300ms group into one undo entry", () => {
    useEditorStore.setState({ activeNote: sampleNote });
    // Simulate rapid same-field edits (Date.now() returns same value within test)
    useEditorStore.getState().updateFrontmatter({ title: "A" });
    useEditorStore.getState().updateFrontmatter({ title: "AB" });
    useEditorStore.getState().updateFrontmatter({ title: "ABC" });

    // Single undo should revert all three to null (original state)
    useEditorStore.getState().undoFrontmatter();
    expect(useEditorStore.getState().editedFrontmatter).toBeNull();
  });

  it("different-field edits do not group", () => {
    useEditorStore.setState({ activeNote: sampleNote });
    useEditorStore.getState().updateFrontmatter({ title: "New" });
    useEditorStore.getState().updateFrontmatter({ note_type: "reference" });

    // Two separate undo operations needed
    useEditorStore.getState().undoFrontmatter();
    expect(useEditorStore.getState().editedFrontmatter).toEqual({ title: "New" });
    useEditorStore.getState().undoFrontmatter();
    expect(useEditorStore.getState().editedFrontmatter).toBeNull();
  });

  it("undo when stack is empty is no-op", () => {
    useEditorStore.setState({ activeNote: sampleNote, editedFrontmatter: { title: "X" }, isDirty: true });
    useEditorStore.getState().undoFrontmatter();
    // Nothing changed
    expect(useEditorStore.getState().editedFrontmatter).toEqual({ title: "X" });
    expect(useEditorStore.getState().isDirty).toBe(true);
  });

  it("redo when stack is empty is no-op", () => {
    useEditorStore.setState({ activeNote: sampleNote, editedFrontmatter: { title: "X" }, isDirty: true });
    useEditorStore.getState().redoFrontmatter();
    expect(useEditorStore.getState().editedFrontmatter).toEqual({ title: "X" });
  });

  it("new edit clears redo stack", () => {
    useEditorStore.setState({ activeNote: sampleNote });
    useEditorStore.getState().updateFrontmatter({ title: "A" });
    useEditorStore.getState().updateFrontmatter({ note_type: "reference" });
    useEditorStore.getState().undoFrontmatter();
    expect(useEditorStore.getState().fmRedoStack.length).toBe(1);

    // New edit should clear redo
    useEditorStore.getState().updateFrontmatter({ status: "final" });
    expect(useEditorStore.getState().fmRedoStack).toEqual([]);
  });

  it("stacks clear on openNote for new tab", async () => {
    mockApi.readNote.mockResolvedValue({ ...sampleNote, path: "Other.md" });

    useEditorStore.setState({
      activeNote: sampleNote,
      isDirty: false,
      fmUndoStack: [null, { title: "prev" }],
      fmRedoStack: [{ title: "next" }],
    });

    await useEditorStore.getState().openNote("Other.md");
    // New tab starts with clean stacks
    expect(useEditorStore.getState().fmUndoStack).toEqual([]);
    expect(useEditorStore.getState().fmRedoStack).toEqual([]);
  });

  it("stacks clear on clear()", () => {
    useEditorStore.setState({
      activeNote: sampleNote,
      fmUndoStack: [null],
      fmRedoStack: [{ title: "x" }],
    });

    useEditorStore.getState().clear();
    expect(useEditorStore.getState().fmUndoStack).toEqual([]);
    expect(useEditorStore.getState().fmRedoStack).toEqual([]);
  });

  it("undo sets isDirty false when reverting to null with no body edits", () => {
    useEditorStore.setState({ activeNote: sampleNote });
    useEditorStore.getState().updateFrontmatter({ title: "New" });
    useEditorStore.getState().undoFrontmatter();
    expect(useEditorStore.getState().isDirty).toBe(false);
  });

  it("undo keeps isDirty true when body is still edited", () => {
    useEditorStore.setState({ activeNote: sampleNote, editedBody: "changed", isDirty: true });
    useEditorStore.getState().updateFrontmatter({ title: "New" });
    useEditorStore.getState().undoFrontmatter();
    expect(useEditorStore.getState().isDirty).toBe(true);
    expect(useEditorStore.getState().editedFrontmatter).toBeNull();
  });
});

describe("raw view mode", () => {
  const rawFileContent = "---\ntitle: Test Note\ntype: concept\n---\n# Test\nSome body";

  it("setViewMode('raw') fetches raw content and populates rawContent", async () => {
    mockApi.readPlainFile.mockResolvedValue({ path: sampleNote.path, body: rawFileContent, binary: false });
    useEditorStore.setState({ activeNote: sampleNote });

    useEditorStore.getState().setViewMode("raw");
    expect(useEditorStore.getState().viewMode).toBe("raw");
    expect(useEditorStore.getState().rawContent).toBeNull(); // loading state

    // Wait for async fetch
    await vi.waitFor(() => {
      expect(useEditorStore.getState().rawContent).toBe(rawFileContent);
    });
  });

  it("setViewMode('raw') falls back to edit on fetch error", async () => {
    mockApi.readPlainFile.mockRejectedValue(new Error("not found"));
    useEditorStore.setState({ activeNote: sampleNote });

    useEditorStore.getState().setViewMode("raw");

    await vi.waitFor(() => {
      expect(useEditorStore.getState().viewMode).toBe("edit");
    });
    expect(useEditorStore.getState().rawContent).toBeNull();
  });

  it("switching away from raw mode clears rawContent", async () => {
    mockApi.readPlainFile.mockResolvedValue({ path: sampleNote.path, body: rawFileContent, binary: false });
    useEditorStore.setState({ activeNote: sampleNote });

    useEditorStore.getState().setViewMode("raw");
    await vi.waitFor(() => {
      expect(useEditorStore.getState().rawContent).toBe(rawFileContent);
    });

    useEditorStore.getState().setViewMode("edit");
    expect(useEditorStore.getState().viewMode).toBe("edit");
    expect(useEditorStore.getState().rawContent).toBeNull();
  });

  it("rawContent is null in clean state", () => {
    expect(useEditorStore.getState().rawContent).toBeNull();
  });

  it("clear() resets rawContent", async () => {
    mockApi.readPlainFile.mockResolvedValue({ path: sampleNote.path, body: rawFileContent, binary: false });
    useEditorStore.setState({ activeNote: sampleNote });
    useEditorStore.getState().setViewMode("raw");
    await vi.waitFor(() => {
      expect(useEditorStore.getState().rawContent).toBe(rawFileContent);
    });

    useEditorStore.getState().clear();
    expect(useEditorStore.getState().rawContent).toBeNull();
    expect(useEditorStore.getState().viewMode).toBe("edit");
  });

  it("race guard: discards stale raw fetch when note changed", async () => {
    let resolveFirst: (v: unknown) => void;
    const firstPromise = new Promise((r) => { resolveFirst = r; });
    mockApi.readPlainFile.mockReturnValueOnce(firstPromise);

    useEditorStore.setState({ activeNote: sampleNote });
    useEditorStore.getState().setViewMode("raw");

    // Switch to a different note before the fetch completes
    const otherNote = { ...sampleNote, path: "Other.md", title: "Other" };
    useEditorStore.setState({ activeNote: otherNote, viewMode: "edit", rawContent: null });

    // Now resolve the stale fetch
    resolveFirst!({ path: sampleNote.path, body: rawFileContent, binary: false });
    await new Promise((r) => setTimeout(r, 10));

    // rawContent should still be null (stale result discarded)
    expect(useEditorStore.getState().rawContent).toBeNull();
  });
});
