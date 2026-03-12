import { create } from "zustand";
import type { NoteDetail } from "../api/types";
import { getAPI } from "../api/bridge";
import { useGraphStore } from "./graphStore";
import { useUIStore } from "./uiStore";
import { log } from "../utils/logger";

export type EditableFrontmatter = Pick<NoteDetail, 'title' | 'note_type' | 'tags' | 'status' | 'source' | 'summary' | 'extra'>;

interface EditorState {
  activeNote: NoteDetail | null;
  isLoading: boolean;
  isDirty: boolean;
  conflictState: "none" | "external-change";
  editedBody: string | null;
  editedFrontmatter: Partial<EditableFrontmatter> | null;
  savingInProgress: boolean;

  openNote: (path: string) => Promise<void>;
  refreshActiveNote: () => Promise<void>;
  updateContent: (body: string) => void;
  updateFrontmatter: (changes: Partial<EditableFrontmatter>) => void;
  saveNote: () => Promise<void>;
  markExternalChange: () => void;
  resolveConflict: (action: "keep-mine" | "accept-theirs") => Promise<void>;
  clear: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  activeNote: null,
  isLoading: false,
  isDirty: false,
  conflictState: "none",
  editedBody: null,
  editedFrontmatter: null,
  savingInProgress: false,

  openNote: async (path: string) => {
    const { activeNote, isDirty } = get();
    if (activeNote?.path === path) return;

    if (isDirty) {
      const autoSave = useUIStore.getState().autoSave;
      if (autoSave) {
        const { savingInProgress, editedFrontmatter } = get();
        const titleInvalid = editedFrontmatter?.title !== undefined &&
          editedFrontmatter.title.trim() === "";
        if (!savingInProgress && !titleInvalid) {
          await get().saveNote();
        }
      } else {
        log.warn("stores::editor", "discarding unsaved changes", { path: activeNote?.path });
      }
    }

    set({ isLoading: true, isDirty: false, conflictState: "none", editedBody: null, editedFrontmatter: null });
    try {
      const api = await getAPI();
      const note = await api.readNote(path);
      set({ activeNote: note, isLoading: false });
    } catch (e) {
      log.error("stores::editor", "failed to open note", { path, error: String(e) });
      set({ isLoading: false });
    }
  },

  refreshActiveNote: async () => {
    const { activeNote } = get();
    if (!activeNote) return;
    try {
      const api = await getAPI();
      const note = await api.readNote(activeNote.path);
      set({ activeNote: note });
    } catch (e) {
      log.error("stores::editor", "failed to refresh note", { error: String(e) });
    }
  },

  updateContent: (body: string) => {
    set({ editedBody: body, isDirty: true });
  },

  updateFrontmatter: (changes: Partial<EditableFrontmatter>) => {
    const current = get().editedFrontmatter ?? {};
    set({ editedFrontmatter: { ...current, ...changes }, isDirty: true });
  },

  saveNote: async () => {
    const { activeNote, editedBody, editedFrontmatter, isDirty } = get();
    if (!activeNote || !isDirty) return;
    if (editedBody === null && editedFrontmatter === null) return;

    // Validate: don't save empty/whitespace-only title
    if (editedFrontmatter?.title !== undefined && editedFrontmatter.title.trim() === "") return;

    // Snapshot what we're saving so we can detect concurrent edits
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

      // Re-read note for authoritative state (especially server-set modified timestamp)
      const refreshed = await api.readNote(activeNote.path);

      // Sync graph store if title/type changed
      if (savingFrontmatter?.title !== undefined || savingFrontmatter?.note_type !== undefined) {
        useGraphStore.getState().applyEvent({
          type: "node-updated",
          path: activeNote.path,
          node: { path: refreshed.path, title: refreshed.title, note_type: refreshed.note_type },
        });
      }

      // Only clear the fields we saved — preserve any concurrent edits
      const current = get();
      const newBody = current.editedBody === savingBody ? null : current.editedBody;
      const newFm = current.editedFrontmatter === savingFrontmatter ? null : current.editedFrontmatter;

      set({
        activeNote: refreshed,
        isDirty: newBody !== null || newFm !== null,
        editedBody: newBody,
        editedFrontmatter: newFm,
        conflictState: "none",
        savingInProgress: false,
      });
    } catch (e) {
      log.error("stores::editor", "failed to save note", { path: activeNote.path, error: String(e) });
      set({ savingInProgress: false });
    }
  },

  markExternalChange: async () => {
    const { isDirty, activeNote, savingInProgress } = get();
    // Suppress external change detection during our own save
    if (savingInProgress) return;

    if (isDirty) {
      set({ conflictState: "external-change" });
    } else if (activeNote) {
      // Auto-reload: bypass openNote's early-return check
      try {
        const api = await getAPI();
        const note = await api.readNote(activeNote.path);
        set({ activeNote: note, conflictState: "none" });
      } catch (e) {
        log.error("stores::editor", "failed to reload note", { error: String(e) });
      }
    }
  },

  resolveConflict: async (action: "keep-mine" | "accept-theirs") => {
    if (action === "accept-theirs") {
      const { activeNote } = get();
      if (activeNote) {
        set({ isDirty: false, editedBody: null, editedFrontmatter: null, conflictState: "none" });
        const api = await getAPI();
        const note = await api.readNote(activeNote.path);
        set({ activeNote: note });
      }
    } else {
      // keep-mine: dismiss the banner, keep editing
      set({ conflictState: "none" });
    }
  },

  clear: () => {
    set({
      activeNote: null,
      isLoading: false,
      isDirty: false,
      conflictState: "none",
      editedBody: null,
      editedFrontmatter: null,
      savingInProgress: false,
    });
  },
}));
