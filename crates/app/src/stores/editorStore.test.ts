import { describe, it, expect, beforeEach, vi } from "vitest";
import { useEditorStore } from "./editorStore";

// Mock the API bridge
const mockApi = {
  readNote: vi.fn(),
  updateNote: vi.fn(),
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

// Mock uiStore for auto-save preference
let mockAutoSave = true;
vi.mock("./uiStore", () => ({
  useUIStore: {
    getState: () => ({ autoSave: mockAutoSave }),
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
  mockAutoSave = true;
  useEditorStore.setState({
    activeNote: null,
    isLoading: false,
    isDirty: false,
    conflictState: "none",
    editedBody: null,
    editedFrontmatter: null,
    savingInProgress: false,
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
    mockAutoSave = false;
    mockApi.readNote.mockResolvedValue({ ...sampleNote, path: "Other.md" });

    useEditorStore.setState({
      activeNote: sampleNote,
      editedFrontmatter: { title: "unsaved" },
      isDirty: true,
    });

    await useEditorStore.getState().openNote("Other.md");

    expect(useEditorStore.getState().editedFrontmatter).toBeNull();
  });

  it("auto-saves before switching when autoSave is enabled", async () => {
    mockAutoSave = true;
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

  it("discards changes when autoSave is disabled", async () => {
    mockAutoSave = false;
    mockApi.readNote.mockResolvedValue({ ...sampleNote, path: "Other.md" });

    useEditorStore.setState({
      activeNote: sampleNote,
      isDirty: true,
      editedBody: "changed body",
    });

    await useEditorStore.getState().openNote("Other.md");

    expect(mockApi.updateNote).not.toHaveBeenCalled();
    expect(useEditorStore.getState().activeNote?.path).toBe("Other.md");
  });

  it("skips auto-save on switch when title is empty", async () => {
    mockAutoSave = true;
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
    mockAutoSave = true;
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
