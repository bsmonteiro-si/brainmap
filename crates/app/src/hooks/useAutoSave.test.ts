import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAutoSave } from "./useAutoSave";
import { useEditorStore } from "../stores/editorStore";

// Mock the API bridge
const mockApi = {
  readNote: vi.fn(),
  updateNote: vi.fn(),
};

vi.mock("../api/bridge", () => ({
  getAPI: () => Promise.resolve(mockApi),
}));

vi.mock("../stores/graphStore", () => ({
  useGraphStore: {
    getState: () => ({
      applyEvent: vi.fn(),
    }),
  },
}));

let mockAutoSave = true;
vi.mock("../stores/uiStore", () => ({
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
  vi.useFakeTimers();
  vi.clearAllMocks();
  mockAutoSave = true;
  useEditorStore.setState({
    activeNote: sampleNote,
    isLoading: false,
    isDirty: false,
    conflictState: "none",
    editedBody: null,
    editedFrontmatter: null,
    savingInProgress: false,
  });
  mockApi.updateNote.mockResolvedValue(undefined);
  mockApi.readNote.mockResolvedValue(sampleNote);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useAutoSave", () => {
  it("schedules save after 1500ms when content changes", async () => {
    renderHook(() => useAutoSave());

    // Simulate content change
    useEditorStore.setState({ isDirty: true, editedBody: "changed" });

    // Not yet saved
    expect(mockApi.updateNote).not.toHaveBeenCalled();

    // Advance past debounce
    vi.advanceTimersByTime(1500);
    await vi.runAllTimersAsync();

    expect(mockApi.updateNote).toHaveBeenCalledTimes(1);
  });

  it("resets timer on subsequent edits (debounce)", async () => {
    renderHook(() => useAutoSave());

    useEditorStore.setState({ isDirty: true, editedBody: "v1" });
    vi.advanceTimersByTime(1000);

    // Another edit resets the timer
    useEditorStore.setState({ isDirty: true, editedBody: "v2" });
    vi.advanceTimersByTime(1000);

    // Only 1000ms since last edit — should not have saved yet
    expect(mockApi.updateNote).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    await vi.runAllTimersAsync();

    expect(mockApi.updateNote).toHaveBeenCalledTimes(1);
  });

  it("does not schedule save when autoSave is off", () => {
    mockAutoSave = false;
    renderHook(() => useAutoSave());

    useEditorStore.setState({ isDirty: true, editedBody: "changed" });
    vi.advanceTimersByTime(2000);

    expect(mockApi.updateNote).not.toHaveBeenCalled();
  });

  it("saves immediately on window blur", async () => {
    renderHook(() => useAutoSave());

    useEditorStore.setState({ isDirty: true, editedBody: "changed" });
    window.dispatchEvent(new Event("blur"));
    await vi.runAllTimersAsync();

    expect(mockApi.updateNote).toHaveBeenCalledTimes(1);
  });

  it("does not save on blur when autoSave is off", () => {
    mockAutoSave = false;
    renderHook(() => useAutoSave());

    useEditorStore.setState({ isDirty: true, editedBody: "changed" });
    window.dispatchEvent(new Event("blur"));

    expect(mockApi.updateNote).not.toHaveBeenCalled();
  });

  it("does not save when savingInProgress", () => {
    renderHook(() => useAutoSave());

    useEditorStore.setState({ isDirty: true, editedBody: "changed", savingInProgress: true });
    vi.advanceTimersByTime(1500);

    expect(mockApi.updateNote).not.toHaveBeenCalled();
  });

  it("does not save when title is empty", () => {
    renderHook(() => useAutoSave());

    useEditorStore.setState({
      isDirty: true,
      editedFrontmatter: { title: "" },
    });
    vi.advanceTimersByTime(1500);

    expect(mockApi.updateNote).not.toHaveBeenCalled();
  });

  it("clears debounce timer when activeNote path changes", () => {
    renderHook(() => useAutoSave());

    useEditorStore.setState({ isDirty: true, editedBody: "changed" });
    vi.advanceTimersByTime(1000);

    // Switch note — timer should be cleared
    useEditorStore.setState({
      activeNote: { ...sampleNote, path: "Other.md" },
      isDirty: false,
      editedBody: null,
    });

    vi.advanceTimersByTime(1500);

    expect(mockApi.updateNote).not.toHaveBeenCalled();
  });

  it("clears timer on cleanup (unmount)", () => {
    const { unmount } = renderHook(() => useAutoSave());

    useEditorStore.setState({ isDirty: true, editedBody: "changed" });
    vi.advanceTimersByTime(1000);

    unmount();

    vi.advanceTimersByTime(1500);
    expect(mockApi.updateNote).not.toHaveBeenCalled();
  });

  it("triggers auto-save for frontmatter-only edits", async () => {
    renderHook(() => useAutoSave());

    useEditorStore.setState({ isDirty: true, editedFrontmatter: { tags: ["new"] } });
    vi.advanceTimersByTime(1500);
    await vi.runAllTimersAsync();

    expect(mockApi.updateNote).toHaveBeenCalledTimes(1);
  });
});
