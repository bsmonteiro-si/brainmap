import { create } from "zustand";
import type { NoteDetail, PlainFileDetail } from "../api/types";
import { getAPI } from "../api/bridge";
import { useNavigationStore } from "./navigationStore";
import { useTabStore, isUntitledTab } from "./tabStore";
import { log } from "../utils/logger";
import { formatMarkdownTables } from "../components/Editor/tableFormatter";

export type EditableFrontmatter = Pick<NoteDetail, 'title' | 'note_type' | 'tags' | 'status' | 'source' | 'summary' | 'extra'>;

type FmSnapshot = Partial<EditableFrontmatter> | null;
const MAX_FM_UNDO = 50;
const FM_GROUP_MS = 300;

interface EditorState {
  activeNote: NoteDetail | null;
  activePlainFile: PlainFileDetail | null;
  isUntitledTab: boolean;
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
  viewMode: "edit" | "preview" | "raw";
  rawContent: string | null;
  _rawDirty: boolean;
  scrollTop: number;
  cursorPos: number;

  openNote: (path: string) => Promise<void>;
  openPlainFile: (path: string) => Promise<void>;
  openUntitledTab: () => Promise<void>;
  activateUntitledTab: (id: string) => Promise<void>;
  refreshActiveNote: () => Promise<void>;
  updateContent: (body: string) => void;
  updateRawContent: (content: string) => void;
  updateFrontmatter: (changes: Partial<EditableFrontmatter>) => void;
  undoFrontmatter: () => void;
  redoFrontmatter: () => void;
  saveNote: () => Promise<void>;
  markExternalChange: () => void;
  resolveConflict: (action: "keep-mine" | "accept-theirs") => Promise<void>;
  setViewMode: (mode: "edit" | "preview" | "raw") => void;
  setScrollCursor: (scrollTop: number, cursorPos: number) => void;
  clearForPdfTab: () => Promise<void>;
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
  isUntitledTab: false,
  fmUndoStack: [] as FmSnapshot[],
  fmRedoStack: [] as FmSnapshot[],
  _lastFmField: null,
  _lastFmTime: 0,
  viewMode: "edit" as const,
  rawContent: null,
  _rawDirty: false,
  scrollTop: 0,
  cursorPos: 0,
};

export const useEditorStore = create<EditorState>((set, get) => ({
  activeNote: null,
  activePlainFile: null,
  isUntitledTab: false,
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
  _rawDirty: false,
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

    // 2. Auto-save if dirty (skip for untitled tabs — they have no backing file)
    const currentTabId = tabStore.activeTabId;
    const { isDirty, savingInProgress, editedFrontmatter } = get();
    if (isDirty && !(currentTabId && isUntitledTab(currentTabId))) {
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
          isUntitledTab: false,
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
          rawContent: null,
          _rawDirty: existingTab.viewMode === "raw" && existingTab.isDirty,
          scrollTop: existingTab.scrollTop,
          cursorPos: existingTab.cursorPos,
        });
        useNavigationStore.getState().push(path);
        // Re-fetch raw content if tab was in raw mode
        if (existingTab.viewMode === "raw") {
          api.readPlainFile(path).then(file => {
            if (get().viewMode === "raw" && get().activeNote?.path === path) {
              set({ rawContent: file.body });
            }
          }).catch(e => {
            log.error("stores::editor", "failed to fetch raw content on tab restore", { path, error: String(e) });
            set({ viewMode: "edit", rawContent: null });
            useTabStore.getState().updateTabState(path, { viewMode: "edit" });
          });
        }
      } catch {
        set({ isLoading: false });
        // File may lack frontmatter — fall back to plain file view
        await get().openPlainFile(path);
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
    } catch {
      set({ isLoading: false });
      // File may lack frontmatter — fall back to plain file view
      await get().openPlainFile(path);
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

    // 2. Auto-save if dirty (skip for untitled tabs)
    const currentTabId = tabStore.activeTabId;
    const { isDirty, savingInProgress } = get();
    if (isDirty && !savingInProgress && !(currentTabId && isUntitledTab(currentTabId))) {
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
          isUntitledTab: false,
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
          rawContent: existingTab.viewMode === "raw" ? (existingTab.editedBody ?? file.body) : null,
          _rawDirty: false,
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

  openUntitledTab: async () => {
    const { isLoading } = get();
    if (isLoading) return;

    // 1. Snapshot current tab state
    snapshotToActiveTab();

    // 2. Auto-save if dirty (skip for untitled tabs)
    const tabStore = useTabStore.getState();
    const currentTabId = tabStore.activeTabId;
    const { isDirty, savingInProgress } = get();
    if (isDirty && !savingInProgress && !(currentTabId && isUntitledTab(currentTabId))) {
      await get().saveNote();
    }

    // 3. Create untitled tab
    const id = tabStore.createUntitledTab();

    // 4. Set editor state — no activeNote/activePlainFile, just a blank editor
    set({
      ...CLEAN_EDITOR_STATE,
      isUntitledTab: true,
      isLoading: false,
      savingInProgress: false,
      viewMode: "edit",
    });

    // Do NOT push to navigationStore — untitled tabs are ephemeral
  },

  activateUntitledTab: async (id: string) => {
    const { isLoading } = get();
    if (isLoading) return;

    const tabStore = useTabStore.getState();
    if (tabStore.activeTabId === id) return;

    const tab = tabStore.getTab(id);
    if (!tab || tab.kind !== "untitled") return;

    // 1. Snapshot current tab state
    snapshotToActiveTab();

    // 2. Auto-save if dirty (skip for untitled tabs)
    const currentTabId = tabStore.activeTabId;
    const { isDirty, savingInProgress } = get();
    if (isDirty && !savingInProgress && !(currentTabId && isUntitledTab(currentTabId))) {
      await get().saveNote();
    }

    // 3. Activate and restore
    tabStore.activateTab(id);
    set({
      ...CLEAN_EDITOR_STATE,
      isUntitledTab: true,
      editedBody: tab.editedBody,
      isDirty: tab.isDirty,
      viewMode: tab.viewMode,
      rawContent: tab.viewMode === "raw" ? (tab.editedBody ?? "") : null,
      _rawDirty: false,
      scrollTop: tab.scrollTop,
      cursorPos: tab.cursorPos,
      isLoading: false,
      savingInProgress: false,
    });
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

  updateRawContent: (content: string) => {
    set({ rawContent: content, isDirty: true, _rawDirty: true });
    const tabId = useTabStore.getState().activeTabId;
    if (tabId) useTabStore.getState().updateTabState(tabId, { isDirty: true });
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
    const { activeNote, activePlainFile, editedBody, editedFrontmatter, isDirty, _rawDirty, rawContent } = get();
    if (!isDirty) return;

    // Raw mode save path — write full file content then re-parse
    if (activeNote && _rawDirty && rawContent !== null) {
      const savingRaw = rawContent;
      try {
        set({ savingInProgress: true });
        const api = await getAPI();
        await api.writeRawNote(activeNote.path, savingRaw);
        const refreshed = await api.readNote(activeNote.path);

        // Backend emits topology event for node updates via write_raw_note

        const current = get();
        const stillDirty = current.rawContent !== savingRaw;
        set({
          activeNote: refreshed,
          isDirty: stillDirty,
          _rawDirty: stillDirty,
          editedBody: null,
          editedFrontmatter: null,
          rawContent: stillDirty ? current.rawContent : savingRaw,
          conflictState: "none",
          savingInProgress: false,
        });
        const tabId = useTabStore.getState().activeTabId;
        if (tabId) useTabStore.getState().updateTabState(tabId, {
          isDirty: stillDirty, title: refreshed.title, noteType: refreshed.note_type,
        });
      } catch (e) {
        log.error("stores::editor", "failed to save raw note", { path: activeNote.path, error: String(e) });
        set({ savingInProgress: false });
      }
      return;
    }

    // Plain file save path
    if (activePlainFile) {
      const { viewMode: vm, rawContent: rc, _rawDirty: rd } = get();
      const bodyToSave = (vm === "raw" && rd && rc !== null) ? rc : editedBody;
      if (activePlainFile.binary || bodyToSave === null) return;
      const savingBody = bodyToSave;
      try {
        set({ savingInProgress: true });
        const api = await getAPI();
        await api.writePlainFile(activePlainFile.path, savingBody);

        const current = get();
        const wasRawSave = current.viewMode === "raw" && current._rawDirty;
        const newBody = current.editedBody === savingBody ? null : current.editedBody;
        const newRawDirty = wasRawSave ? false : current._rawDirty;
        const newIsDirty = newBody !== null || newRawDirty;
        set({
          activePlainFile: { ...activePlainFile, body: savingBody },
          isDirty: newIsDirty,
          editedBody: newBody,
          rawContent: wasRawSave ? savingBody : current.rawContent,
          _rawDirty: newRawDirty,
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

    // Auto-format tables in body before save; track original for post-save comparison
    const originalBody = editedBody;
    const savingBody = editedBody !== null ? formatMarkdownTables(editedBody) : null;
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

      // Backend emits topology event for node updates via update_node

      const current = get();
      // Compare against originalBody (pre-format), not savingBody (formatted).
      // If user hasn't typed more during save, clear editedBody so the
      // refreshed activeNote.body (formatted version) is displayed.
      const newBody = current.editedBody === originalBody ? null : current.editedBody;
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
        // Also refresh raw content if in raw mode
        if (get().viewMode === "raw") {
          const file = await api.readPlainFile(activeNote.path);
          if (get().viewMode === "raw" && get().activeNote?.path === activeNote.path) {
            set({ rawContent: file.body });
          }
        }
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
      set({ isDirty: false, editedBody: null, editedFrontmatter: null, conflictState: "none", rawContent: null, _rawDirty: false, fmUndoStack: [], fmRedoStack: [], _lastFmField: null, _lastFmTime: 0 });
      try {
        const api = await getAPI();
        if (activeNote) {
          const note = await api.readNote(activeNote.path);
          set({ activeNote: note });
          // Refresh raw content if in raw mode
          if (get().viewMode === "raw") {
            const file = await api.readPlainFile(activeNote.path);
            if (get().viewMode === "raw" && get().activeNote?.path === activeNote.path) {
              set({ rawContent: file.body });
            }
          }
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

  setViewMode: (mode: "edit" | "preview" | "raw") => {
    const prev = get().viewMode;
    const { isDirty, _rawDirty, savingInProgress, editedFrontmatter, activeNote } = get();

    // Auto-save before switching modes when dirty
    const needsSave = isDirty && !savingInProgress &&
      !(editedFrontmatter?.title !== undefined && editedFrontmatter.title.trim() === "");

    if (mode === "raw") {
      // Switching TO raw: save body/fm edits first, then fetch raw
      const doSwitch = () => {
        set({ viewMode: "raw", rawContent: null, _rawDirty: false });
        const tabId = useTabStore.getState().activeTabId;
        if (tabId) useTabStore.getState().updateTabState(tabId, { viewMode: "raw" });
        const note = get().activeNote;
        const plainFile = get().activePlainFile;
        if (note) {
          getAPI().then(api => api.readPlainFile(note.path)).then(file => {
            if (get().viewMode === "raw" && get().activeNote?.path === note.path) {
              set({ rawContent: file.body });
            }
          }).catch(e => {
            log.error("stores::editor", "failed to fetch raw content", { error: String(e) });
            set({ viewMode: "edit", rawContent: null });
            const tid = useTabStore.getState().activeTabId;
            if (tid) useTabStore.getState().updateTabState(tid, { viewMode: "edit" });
          });
        } else if (plainFile) {
          // Plain file: body IS the raw content, no fetch needed
          set({ rawContent: get().editedBody ?? plainFile.body });
        } else {
          // Untitled tab: in-memory content is the raw content
          set({ rawContent: get().editedBody ?? "" });
        }
      };
      if (needsSave && !_rawDirty) {
        get().saveNote().then(doSwitch).catch(doSwitch);
      } else {
        doSwitch();
      }
    } else {
      // Switching FROM raw (or edit↔preview): save raw edits first if needed
      const doSwitch = () => {
        set({ viewMode: mode, rawContent: null, _rawDirty: false });
        const tabId = useTabStore.getState().activeTabId;
        if (tabId) useTabStore.getState().updateTabState(tabId, { viewMode: mode });
      };
      if (needsSave && _rawDirty && prev === "raw") {
        get().saveNote().then(doSwitch).catch(doSwitch);
      } else {
        doSwitch();
      }
    }
  },

  setScrollCursor: (scrollTop: number, cursorPos: number) => {
    set({ scrollTop, cursorPos });
    const tabId = useTabStore.getState().activeTabId;
    if (tabId) useTabStore.getState().updateTabState(tabId, { scrollTop, cursorPos });
  },

  clearForPdfTab: async () => {
    // 1. Snapshot current tab state
    snapshotToActiveTab();

    // 2. Auto-save if dirty (skip for untitled tabs)
    const tabStore = useTabStore.getState();
    const currentTabId = tabStore.activeTabId;
    const { isDirty, savingInProgress } = get();
    if (isDirty && !savingInProgress && !(currentTabId && isUntitledTab(currentTabId))) {
      await get().saveNote();
    }

    // 3. Clear editor state — PDF viewer manages its own state
    set({
      activeNote: null,
      activePlainFile: null,
      isUntitledTab: false,
      isLoading: false,
      editedBody: null,
      editedFrontmatter: null,
      isDirty: false,
      conflictState: "none",
      rawContent: null,
      _rawDirty: false,
    });
  },

  clear: () => {
    set({
      activeNote: null,
      activePlainFile: null,
      isUntitledTab: false,
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
      _rawDirty: false,
      scrollTop: 0,
      cursorPos: 0,
    });
  },
}));
