import { create } from "zustand";
import type { NoteDetail, PlainFileDetail } from "../api/types";
import { getAPI } from "../api/bridge";
import { useGraphStore } from "./graphStore";
import { useNavigationStore } from "./navigationStore";
import { useTabStore } from "./tabStore";
import { log } from "../utils/logger";

export type EditableFrontmatter = Pick<NoteDetail, 'title' | 'note_type' | 'tags' | 'status' | 'source' | 'summary' | 'extra'>;

type FmSnapshot = Partial<EditableFrontmatter> | null;
const MAX_FM_UNDO = 50;
const FM_GROUP_MS = 300;

interface EditorState {
  activeNote: NoteDetail | null;
  activePlainFile: PlainFileDetail | null;
  isLoading: boolean;
  isDirty: boolean;
  conflictState: "none" | "external-change";
  editedBody: string | null;
  editedFrontmatter: Partial<EditableFrontmatter> | null;
  savingInProgress: boolean;
  fmUndoStack: FmSnapshot[];
  fmRedoStack: FmSnapshot[];
  _lastFmField: string | null;
  _lastFmTime: number;
  viewMode: "edit" | "preview";
  scrollTop: number;
  cursorPos: number;

  openNote: (path: string) => Promise<void>;
  openPlainFile: (path: string) => Promise<void>;
  refreshActiveNote: () => Promise<void>;
  updateContent: (body: string) => void;
  updateFrontmatter: (changes: Partial<EditableFrontmatter>) => void;
  undoFrontmatter: () => void;
  redoFrontmatter: () => void;
  saveNote: () => Promise<void>;
  markExternalChange: () => void;
  resolveConflict: (action: "keep-mine" | "accept-theirs") => Promise<void>;
  setViewMode: (mode: "edit" | "preview") => void;
  setScrollCursor: (scrollTop: number, cursorPos: number) => void;
  clear: () => void;
}

/** Snapshot current editor state into the active tab in tabStore. */
function snapshotToActiveTab() {
  const tabStore = useTabStore.getState();
  const { activeTabId } = tabStore;
  if (!activeTabId) return;

  const editor = useEditorStore.getState();
  tabStore.updateTabState(activeTabId, {
    editedBody: editor.editedBody,
    editedFrontmatter: editor.editedFrontmatter,
    isDirty: editor.isDirty,
    conflictState: editor.conflictState,
    fmUndoStack: editor.fmUndoStack,
    fmRedoStack: editor.fmRedoStack,
    viewMode: editor.viewMode,
    scrollTop: editor.scrollTop,
    cursorPos: editor.cursorPos,
  });
}

const CLEAN_EDITOR_STATE = {
  isDirty: false,
  conflictState: "none" as const,
  editedBody: null,
  editedFrontmatter: null,
  activePlainFile: null,
  activeNote: null,
  fmUndoStack: [] as FmSnapshot[],
  fmRedoStack: [] as FmSnapshot[],
  _lastFmField: null,
  _lastFmTime: 0,
  viewMode: "edit" as const,
  scrollTop: 0,
  cursorPos: 0,
};

export const useEditorStore = create<EditorState>((set, get) => ({
  activeNote: null,
  activePlainFile: null,
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
  scrollTop: 0,
  cursorPos: 0,

  openNote: async (path: string) => {
    const { activeNote, isLoading } = get();
    const tabStore = useTabStore.getState();

    // Already viewing this note in this tab — no-op
    if (activeNote?.path === path && tabStore.activeTabId === path) return;

    // Guard against concurrent tab switches
    if (isLoading) return;

    // 1. Snapshot current tab state before anything changes
    snapshotToActiveTab();

    // 2. Auto-save if dirty
    const { isDirty, savingInProgress, editedFrontmatter } = get();
    if (isDirty) {
      const titleInvalid = editedFrontmatter?.title !== undefined &&
        editedFrontmatter.title.trim() === "";
      if (!savingInProgress && !titleInvalid) {
        await get().saveNote();
      }
    }

    // 3. Check if tab already exists (restore from it)
    const existingTab = tabStore.getTab(path);
    if (existingTab) {
      // Activate existing tab and restore its state
      tabStore.activateTab(path);
      set({ isLoading: true });
      try {
        const api = await getAPI();
        const note = await api.readNote(path);
        set({
          activeNote: note,
          activePlainFile: null,
          isLoading: false,
          editedBody: existingTab.editedBody,
          editedFrontmatter: existingTab.editedFrontmatter,
          isDirty: existingTab.isDirty,
          conflictState: existingTab.conflictState,
          fmUndoStack: existingTab.fmUndoStack,
          fmRedoStack: existingTab.fmRedoStack,
          _lastFmField: null,
          _lastFmTime: 0,
          viewMode: existingTab.viewMode,
          scrollTop: existingTab.scrollTop,
          cursorPos: existingTab.cursorPos,
        });
        useNavigationStore.getState().push(path);
      } catch (e) {
        log.error("stores::editor", "failed to open note", { path, error: String(e) });
        set({ isLoading: false });
      }
      return;
    }

    // 4. New tab — fetch note and create tab
    set({ ...CLEAN_EDITOR_STATE, isLoading: true, savingInProgress: false });
    try {
      const api = await getAPI();
      const note = await api.readNote(path);
      tabStore.openTab(path, "note", note.title, note.note_type);
      set({ activeNote: note, isLoading: false });
      useNavigationStore.getState().push(path);
    } catch (e) {
      log.error("stores::editor", "failed to open note", { path, error: String(e) });
      set({ isLoading: false });
    }
  },

  openPlainFile: async (path: string) => {
    const { activePlainFile, isLoading } = get();
    const tabStore = useTabStore.getState();

    if (activePlainFile?.path === path && tabStore.activeTabId === path) return;

    // Guard against concurrent tab switches
    if (isLoading) return;

    // 1. Snapshot current tab state
    snapshotToActiveTab();

    // 2. Auto-save if dirty
    const { isDirty, savingInProgress } = get();
    if (isDirty && !savingInProgress) {
      await get().saveNote();
    }

    // 3. Check for existing tab
    const existingTab = tabStore.getTab(path);
    if (existingTab) {
      tabStore.activateTab(path);
      set({ isLoading: true });
      try {
        const api = await getAPI();
        const file = await api.readPlainFile(path);
        set({
          activePlainFile: file,
          activeNote: null,
          isLoading: false,
          editedBody: existingTab.editedBody,
          editedFrontmatter: null,
          isDirty: existingTab.isDirty,
          conflictState: existingTab.conflictState,
          fmUndoStack: [],
          fmRedoStack: [],
          _lastFmField: null,
          _lastFmTime: 0,
          viewMode: existingTab.viewMode,
          scrollTop: existingTab.scrollTop,
          cursorPos: existingTab.cursorPos,
        });
        useNavigationStore.getState().push(path);
      } catch (e) {
        log.error("stores::editor", "failed to open plain file", { path, error: String(e) });
        set({ isLoading: false });
      }
      return;
    }

    // 4. New tab
    set({ ...CLEAN_EDITOR_STATE, isLoading: true, savingInProgress: false });
    try {
      const api = await getAPI();
      const file = await api.readPlainFile(path);
      const fileName = path.split("/").pop() ?? path;
      tabStore.openTab(path, "plain-file", fileName, null);
      set({ activePlainFile: file, isLoading: false });
      useNavigationStore.getState().push(path);
    } catch (e) {
      log.error("stores::editor", "failed to open plain file", { path, error: String(e) });
      set({ isLoading: false });
    }
  },

  refreshActiveNote: async () => {
    const { activeNote, activePlainFile } = get();
    if (activeNote) {
      try {
        const api = await getAPI();
        const note = await api.readNote(activeNote.path);
        set({ activeNote: note });
      } catch (e) {
        log.error("stores::editor", "failed to refresh note", { error: String(e) });
      }
    } else if (activePlainFile) {
      try {
        const api = await getAPI();
        const file = await api.readPlainFile(activePlainFile.path);
        set({ activePlainFile: file });
      } catch (e) {
        log.error("stores::editor", "failed to refresh plain file", { error: String(e) });
      }
    }
  },

  updateContent: (body: string) => {
    set({ editedBody: body, isDirty: true });
    const tabId = useTabStore.getState().activeTabId;
    if (tabId) useTabStore.getState().updateTabState(tabId, { isDirty: true, editedBody: body });
  },

  updateFrontmatter: (changes: Partial<EditableFrontmatter>) => {
    const { editedFrontmatter, fmUndoStack, _lastFmField, _lastFmTime } = get();
    const current = editedFrontmatter ?? {};
    const keys = Object.keys(changes);
    const fieldKey = keys.length === 1 ? keys[0] : keys.sort().join(",");
    const now = Date.now();

    const shouldGroup = fieldKey === _lastFmField && (now - _lastFmTime) < FM_GROUP_MS;

    let newStack = fmUndoStack;
    if (!shouldGroup) {
      newStack = [...fmUndoStack, editedFrontmatter];
      if (newStack.length > MAX_FM_UNDO) newStack = newStack.slice(newStack.length - MAX_FM_UNDO);
    }

    const newFm = { ...current, ...changes };
    set({
      editedFrontmatter: newFm,
      isDirty: true,
      fmUndoStack: newStack,
      fmRedoStack: [],
      _lastFmField: fieldKey,
      _lastFmTime: now,
    });
    const tabId = useTabStore.getState().activeTabId;
    if (tabId) useTabStore.getState().updateTabState(tabId, { isDirty: true, editedFrontmatter: newFm });
  },

  undoFrontmatter: () => {
    const { fmUndoStack, editedFrontmatter, fmRedoStack, editedBody } = get();
    if (fmUndoStack.length === 0) return;
    const prev = fmUndoStack[fmUndoStack.length - 1];
    const newUndoStack = fmUndoStack.slice(0, -1);
    const newRedoStack = [...fmRedoStack, editedFrontmatter];
    const isDirty = prev !== null || editedBody !== null;
    set({
      editedFrontmatter: prev,
      fmUndoStack: newUndoStack,
      fmRedoStack: newRedoStack,
      isDirty,
      _lastFmField: null,
      _lastFmTime: 0,
    });
    const tabId = useTabStore.getState().activeTabId;
    if (tabId) useTabStore.getState().updateTabState(tabId, {
      isDirty, editedFrontmatter: prev, fmUndoStack: newUndoStack, fmRedoStack: newRedoStack,
    });
  },

  redoFrontmatter: () => {
    const { fmRedoStack, editedFrontmatter, fmUndoStack, editedBody } = get();
    if (fmRedoStack.length === 0) return;
    const next = fmRedoStack[fmRedoStack.length - 1];
    const newRedoStack = fmRedoStack.slice(0, -1);
    const newUndoStack = [...fmUndoStack, editedFrontmatter];
    const isDirty = next !== null || editedBody !== null;
    set({
      editedFrontmatter: next,
      fmUndoStack: newUndoStack,
      fmRedoStack: newRedoStack,
      isDirty,
      _lastFmField: null,
      _lastFmTime: 0,
    });
    const tabId = useTabStore.getState().activeTabId;
    if (tabId) useTabStore.getState().updateTabState(tabId, {
      isDirty, editedFrontmatter: next, fmUndoStack: newUndoStack, fmRedoStack: newRedoStack,
    });
  },

  saveNote: async () => {
    const { activeNote, activePlainFile, editedBody, editedFrontmatter, isDirty } = get();
    if (!isDirty) return;

    // Plain file save path
    if (activePlainFile) {
      if (activePlainFile.binary || editedBody === null) return;
      const savingBody = editedBody;
      try {
        set({ savingInProgress: true });
        const api = await getAPI();
        await api.writePlainFile(activePlainFile.path, savingBody);

        const current = get();
        const newBody = current.editedBody === savingBody ? null : current.editedBody;
        const newIsDirty = newBody !== null;
        set({
          activePlainFile: { ...activePlainFile, body: savingBody },
          isDirty: newIsDirty,
          editedBody: newBody,
          conflictState: "none",
          savingInProgress: false,
        });
        const tabId = useTabStore.getState().activeTabId;
        if (tabId) useTabStore.getState().updateTabState(tabId, { isDirty: newIsDirty });
      } catch (e) {
        log.error("stores::editor", "failed to save plain file", { path: activePlainFile.path, error: String(e) });
        set({ savingInProgress: false });
      }
      return;
    }

    // BrainMap note save path
    if (!activeNote) return;
    if (editedBody === null && editedFrontmatter === null) return;

    if (editedFrontmatter?.title !== undefined && editedFrontmatter.title.trim() === "") return;

    const savingBody = editedBody;
    const savingFrontmatter = editedFrontmatter;

    try {
      set({ savingInProgress: true });
      const api = await getAPI();

      const params: Record<string, unknown> = { path: activeNote.path };
      if (savingBody !== null) params.body = savingBody;
      if (savingFrontmatter) {
        if (savingFrontmatter.title !== undefined) params.title = savingFrontmatter.title;
        if (savingFrontmatter.note_type !== undefined) params.note_type = savingFrontmatter.note_type;
        if (savingFrontmatter.tags !== undefined) params.tags = savingFrontmatter.tags;
        if (savingFrontmatter.status !== undefined) params.status = savingFrontmatter.status;
        if (savingFrontmatter.source !== undefined) params.source = savingFrontmatter.source;
        if (savingFrontmatter.summary !== undefined) params.summary = savingFrontmatter.summary;
        if (savingFrontmatter.extra !== undefined) params.extra = savingFrontmatter.extra;
      }

      await api.updateNote(params as Parameters<typeof api.updateNote>[0]);

      const refreshed = await api.readNote(activeNote.path);

      if (savingFrontmatter?.title !== undefined || savingFrontmatter?.note_type !== undefined) {
        useGraphStore.getState().applyEvent({
          type: "node-updated",
          path: activeNote.path,
          node: { path: refreshed.path, title: refreshed.title, note_type: refreshed.note_type },
        });
      }

      const current = get();
      const newBody = current.editedBody === savingBody ? null : current.editedBody;
      const newFm = current.editedFrontmatter === savingFrontmatter ? null : current.editedFrontmatter;
      const newIsDirty = newBody !== null || newFm !== null;

      set({
        activeNote: refreshed,
        isDirty: newIsDirty,
        editedBody: newBody,
        editedFrontmatter: newFm,
        conflictState: "none",
        savingInProgress: false,
      });

      const tabId = useTabStore.getState().activeTabId;
      if (tabId) {
        useTabStore.getState().updateTabState(tabId, {
          isDirty: newIsDirty,
          title: refreshed.title,
          noteType: refreshed.note_type,
        });
      }
    } catch (e) {
      log.error("stores::editor", "failed to save note", { path: activeNote.path, error: String(e) });
      set({ savingInProgress: false });
    }
  },

  markExternalChange: async () => {
    const { isDirty, activeNote, activePlainFile, savingInProgress } = get();
    if (savingInProgress) return;

    if (isDirty) {
      set({ conflictState: "external-change" });
    } else if (activeNote) {
      try {
        const api = await getAPI();
        const note = await api.readNote(activeNote.path);
        set({ activeNote: note, conflictState: "none" });
      } catch (e) {
        log.error("stores::editor", "failed to reload note", { error: String(e) });
      }
    } else if (activePlainFile) {
      try {
        const api = await getAPI();
        const file = await api.readPlainFile(activePlainFile.path);
        set({ activePlainFile: file, conflictState: "none" });
      } catch (e) {
        log.error("stores::editor", "failed to reload plain file", { error: String(e) });
      }
    }
  },

  resolveConflict: async (action: "keep-mine" | "accept-theirs") => {
    if (action === "accept-theirs") {
      const { activeNote, activePlainFile } = get();
      set({ isDirty: false, editedBody: null, editedFrontmatter: null, conflictState: "none", fmUndoStack: [], fmRedoStack: [], _lastFmField: null, _lastFmTime: 0 });
      try {
        const api = await getAPI();
        if (activeNote) {
          const note = await api.readNote(activeNote.path);
          set({ activeNote: note });
        } else if (activePlainFile) {
          const file = await api.readPlainFile(activePlainFile.path);
          set({ activePlainFile: file });
        }
      } catch (e) {
        log.error("stores::editor", "failed to accept external changes", { error: String(e) });
        // Re-mark as dirty since we couldn't load the external version
        set({ isDirty: true, conflictState: "external-change" });
      }
    } else {
      set({ conflictState: "none" });
    }
  },

  setViewMode: (mode: "edit" | "preview") => {
    set({ viewMode: mode });
    const tabId = useTabStore.getState().activeTabId;
    if (tabId) useTabStore.getState().updateTabState(tabId, { viewMode: mode });
  },

  setScrollCursor: (scrollTop: number, cursorPos: number) => {
    set({ scrollTop, cursorPos });
    const tabId = useTabStore.getState().activeTabId;
    if (tabId) useTabStore.getState().updateTabState(tabId, { scrollTop, cursorPos });
  },

  clear: () => {
    set({
      activeNote: null,
      activePlainFile: null,
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
      scrollTop: 0,
      cursorPos: 0,
    });
  },
}));
