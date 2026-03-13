import { create } from "zustand";
import { useEditorStore } from "./editorStore";
import { useGraphStore } from "./graphStore";

const MAX_HISTORY = 100;

interface NavigationState {
  history: string[];
  cursor: number;
  _navigating: boolean;

  push: (path: string) => void;
  goBack: () => Promise<void>;
  goForward: () => Promise<void>;
  canGoBack: () => boolean;
  canGoForward: () => boolean;
  reset: () => void;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  history: [],
  cursor: -1,
  _navigating: false,

  push: (path: string) => {
    const { history, cursor, _navigating } = get();
    if (_navigating) return;

    // Dedupe consecutive same-path
    if (cursor >= 0 && history[cursor] === path) return;

    // Truncate any forward entries
    const truncated = history.slice(0, cursor + 1);
    truncated.push(path);

    // Enforce max size (drop oldest)
    if (truncated.length > MAX_HISTORY) {
      truncated.shift();
    }
    set({ history: truncated, cursor: truncated.length - 1 });
  },

  goBack: async () => {
    const { cursor, history } = get();
    if (cursor <= 0) return;

    const prevCursor = cursor;
    const newCursor = cursor - 1;
    const path = history[newCursor];

    set({ _navigating: true, cursor: newCursor });
    try {
      await useEditorStore.getState().openNote(path);
      useGraphStore.getState().selectNode(path);
    } catch {
      set({ cursor: prevCursor });
    } finally {
      set({ _navigating: false });
    }
  },

  goForward: async () => {
    const { cursor, history } = get();
    if (cursor >= history.length - 1) return;

    const prevCursor = cursor;
    const newCursor = cursor + 1;
    const path = history[newCursor];

    set({ _navigating: true, cursor: newCursor });
    try {
      await useEditorStore.getState().openNote(path);
      useGraphStore.getState().selectNode(path);
    } catch {
      set({ cursor: prevCursor });
    } finally {
      set({ _navigating: false });
    }
  },

  canGoBack: () => {
    const { cursor } = get();
    return cursor > 0;
  },

  canGoForward: () => {
    const { cursor, history } = get();
    return cursor < history.length - 1;
  },

  reset: () => {
    set({ history: [], cursor: -1, _navigating: false });
  },
}));
