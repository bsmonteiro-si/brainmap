import { create } from "zustand";
import type { NoteDetail } from "../api/types";
import { getAPI } from "../api/bridge";
import { useGraphStore } from "./graphStore";
import { useEditorStore } from "./editorStore";
import { useUIStore } from "./uiStore";

const MAX_UNDO_STACK = 20;

export type UndoableAction =
  | { kind: "create-note"; path: string; snapshot?: NoteDetail }
  | { kind: "create-folder"; folderPath: string }
  | { kind: "delete-note"; path: string; snapshot: NoteDetail }
  | { kind: "delete-folder"; folderPath: string; snapshots: NoteDetail[] };

interface UndoState {
  undoStack: UndoableAction[];
  redoStack: UndoableAction[];
  isProcessing: boolean;
  toastMessage: string | null;
  toastKey: number;

  pushAction: (action: UndoableAction) => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
}

function actionLabel(action: UndoableAction): string {
  switch (action.kind) {
    case "create-note": {
      const title = action.snapshot?.title ?? action.path.split("/").pop()?.replace(/\.md$/, "") ?? action.path;
      return `created "${title}"`;
    }
    case "create-folder":
      return `created folder "${action.folderPath}"`;
    case "delete-note": {
      return `deleted "${action.snapshot.title}"`;
    }
    case "delete-folder":
      return `deleted folder "${action.folderPath}"`;
  }
}

function showToast(set: (partial: Partial<UndoState>) => void, message: string) {
  set((prev: UndoState) => ({ toastMessage: message, toastKey: prev.toastKey + 1 }));
}

/** Clear editor if the given path is currently open. */
function clearEditorIfActive(path: string) {
  const editor = useEditorStore.getState();
  if (editor.activeNote?.path === path) {
    editor.clear();
    useGraphStore.getState().selectNode(null);
  }
}

/** Clear graph focus if it targets the given path or a child of it. */
function clearFocusIfTargeted(path: string, isFolder: boolean) {
  const { graphFocusPath } = useUIStore.getState();
  if (!graphFocusPath) return;
  const inScope = isFolder
    ? graphFocusPath === path || graphFocusPath.startsWith(path + "/")
    : graphFocusPath === path;
  if (inScope) {
    useUIStore.getState().clearGraphFocus();
  }
}

/** Re-create a single note from a snapshot, returning the created path. */
async function restoreNote(snapshot: NoteDetail): Promise<string> {
  const api = await getAPI();
  const createdPath = await api.createNote({
    path: snapshot.path,
    title: snapshot.title,
    note_type: snapshot.note_type,
    tags: snapshot.tags,
    status: snapshot.status ?? undefined,
    source: snapshot.source ?? undefined,
    summary: snapshot.summary ?? undefined,
    extra: Object.keys(snapshot.extra).length > 0 ? snapshot.extra : undefined,
    body: snapshot.body || undefined,
  });
  useGraphStore.getState().createNote(createdPath, snapshot.title, snapshot.note_type);
  return createdPath;
}

/** Restore outgoing links from a snapshot. */
async function restoreLinks(snapshot: NoteDetail) {
  const api = await getAPI();
  for (const link of snapshot.links) {
    try {
      await api.createLink(snapshot.path, link.target, link.rel, link.annotation);
      useGraphStore.getState().applyEvent({
        type: "edge-created",
        edge: { source: snapshot.path, target: link.target, rel: link.rel, kind: "Explicit" },
      });
    } catch {
      // Target may not exist or link may already exist — skip silently
    }
  }
}

/** Delete a note with full side-effect cleanup. */
async function deleteNoteWithCleanup(path: string) {
  const api = await getAPI();
  clearEditorIfActive(path);
  clearFocusIfTargeted(path, false);
  await api.deleteNote(path, true);
  useGraphStore.getState().applyEvent({ type: "node-deleted", path });
}

export const useUndoStore = create<UndoState>((set, get) => ({
  undoStack: [],
  redoStack: [],
  isProcessing: false,
  toastMessage: null,
  toastKey: 0,

  pushAction: (action: UndoableAction) => {
    set((state) => ({
      undoStack: [action, ...state.undoStack].slice(0, MAX_UNDO_STACK),
      redoStack: [],
    }));
  },

  canUndo: () => get().undoStack.length > 0,
  canRedo: () => get().redoStack.length > 0,

  clear: () => {
    set({ undoStack: [], redoStack: [], isProcessing: false, toastMessage: null });
  },

  undo: async () => {
    const { undoStack, isProcessing } = get();
    if (isProcessing || undoStack.length === 0) return;

    set({ isProcessing: true });
    const [action, ...rest] = undoStack;
    set({ undoStack: rest });

    try {
      const api = await getAPI();

      switch (action.kind) {
        case "create-note": {
          // Check if note was modified since creation
          let snapshot: NoteDetail;
          try {
            snapshot = await api.readNote(action.path);
          } catch {
            // Note no longer exists — nothing to undo
            showToast(set, "Cannot undo: note no longer exists");
            set({ isProcessing: false });
            return;
          }

          // If the note has non-trivial content, refuse to undo and re-push
          if (snapshot.body.trim().length > 0) {
            showToast(set, "Cannot undo: note has been modified");
            set((state) => ({ undoStack: [action, ...state.undoStack], isProcessing: false }));
            return;
          }

          await deleteNoteWithCleanup(action.path);
          const enriched = { ...action, snapshot };
          set((state) => ({
            redoStack: [enriched, ...state.redoStack],
            isProcessing: false,
          }));
          showToast(set, `Undo: ${actionLabel(action)}`);
          break;
        }

        case "create-folder": {
          try {
            await api.deleteFolder(action.folderPath, false);
          } catch {
            showToast(set, "Cannot undo: folder is not empty");
            set((state) => ({ undoStack: [action, ...state.undoStack], isProcessing: false }));
            return;
          }
          useUIStore.getState().removeEmptyFolder(action.folderPath);
          set((state) => ({
            redoStack: [action, ...state.redoStack],
            isProcessing: false,
          }));
          showToast(set, `Undo: ${actionLabel(action)}`);
          break;
        }

        case "delete-note": {
          await restoreNote(action.snapshot);
          await restoreLinks(action.snapshot);
          set((state) => ({
            redoStack: [action, ...state.redoStack],
            isProcessing: false,
          }));
          showToast(set, `Undo: ${actionLabel(action)}`);
          break;
        }

        case "delete-folder": {
          // Two-pass restore: first create folder + all notes, then restore links
          await api.createFolder(action.folderPath);
          for (const snap of action.snapshots) {
            await restoreNote(snap);
          }
          for (const snap of action.snapshots) {
            await restoreLinks(snap);
          }
          // If folder was empty (no notes to restore), track it so it appears in the tree
          if (action.snapshots.length === 0) {
            useUIStore.getState().addEmptyFolder(action.folderPath);
          }
          set((state) => ({
            redoStack: [action, ...state.redoStack],
            isProcessing: false,
          }));
          showToast(set, `Undo: ${actionLabel(action)}`);
          break;
        }
      }
    } catch (e) {
      console.error("Undo failed:", e);
      showToast(set, `Undo failed: ${e instanceof Error ? e.message : String(e)}`);
      set({ isProcessing: false });
      // Action is already removed from undoStack and NOT pushed to redoStack — discarded
    }
  },

  redo: async () => {
    const { redoStack, isProcessing } = get();
    if (isProcessing || redoStack.length === 0) return;

    set({ isProcessing: true });
    const [action, ...rest] = redoStack;
    set({ redoStack: rest });

    try {
      const api = await getAPI();

      switch (action.kind) {
        case "create-note": {
          // Re-create from snapshot (populated during undo)
          if (!action.snapshot) {
            showToast(set, "Cannot redo: no snapshot available");
            set({ isProcessing: false });
            return;
          }
          await restoreNote(action.snapshot);
          await restoreLinks(action.snapshot);
          // Push without snapshot to undo stack (fresh undo will re-snapshot)
          set((state) => ({
            undoStack: [{ kind: "create-note", path: action.path }, ...state.undoStack].slice(0, MAX_UNDO_STACK),
            isProcessing: false,
          }));
          showToast(set, `Redo: ${actionLabel(action)}`);
          break;
        }

        case "create-folder": {
          await api.createFolder(action.folderPath);
          useUIStore.getState().addEmptyFolder(action.folderPath);
          set((state) => ({
            undoStack: [action, ...state.undoStack].slice(0, MAX_UNDO_STACK),
            isProcessing: false,
          }));
          showToast(set, `Redo: ${actionLabel(action)}`);
          break;
        }

        case "delete-note": {
          // Snapshot current state before deleting
          let snapshot: NoteDetail;
          try {
            snapshot = await api.readNote(action.snapshot.path);
          } catch {
            showToast(set, "Cannot redo: note no longer exists");
            set({ isProcessing: false });
            return;
          }
          await deleteNoteWithCleanup(snapshot.path);
          set((state) => ({
            undoStack: [{ kind: "delete-note", path: snapshot.path, snapshot }, ...state.undoStack].slice(0, MAX_UNDO_STACK),
            isProcessing: false,
          }));
          showToast(set, `Redo: ${actionLabel(action)}`);
          break;
        }

        case "delete-folder": {
          // Snapshot all notes before deleting
          const paths = action.snapshots.map((s) => s.path);
          const snapshots = (
            await Promise.allSettled(paths.map((p) => api.readNote(p)))
          )
            .filter((r): r is PromiseFulfilledResult<NoteDetail> => r.status === "fulfilled")
            .map((r) => r.value);

          // Clear editor/focus for notes in scope
          for (const snap of snapshots) {
            clearEditorIfActive(snap.path);
          }
          clearFocusIfTargeted(action.folderPath, true);

          const result = await api.deleteFolder(action.folderPath, true);
          for (const path of result.deleted_paths) {
            useGraphStore.getState().applyEvent({ type: "node-deleted", path });
          }
          // Remove folder and child folders from emptyFolders tracking
          const { emptyFolders } = useUIStore.getState();
          const prefix = action.folderPath + "/";
          const nextFolders = new Set<string>();
          for (const f of emptyFolders) {
            if (f !== action.folderPath && !f.startsWith(prefix)) {
              nextFolders.add(f);
            }
          }
          if (nextFolders.size !== emptyFolders.size) {
            useUIStore.setState({ emptyFolders: nextFolders });
          }

          set((state) => ({
            undoStack: [{ kind: "delete-folder", folderPath: action.folderPath, snapshots }, ...state.undoStack].slice(0, MAX_UNDO_STACK),
            isProcessing: false,
          }));
          showToast(set, `Redo: ${actionLabel(action)}`);
          break;
        }
      }
    } catch (e) {
      console.error("Redo failed:", e);
      showToast(set, `Redo failed: ${e instanceof Error ? e.message : String(e)}`);
      set({ isProcessing: false });
    }
  },
}));
