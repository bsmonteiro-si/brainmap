import { create } from "zustand";
import type { EditableFrontmatter } from "./editorStore";

type FmSnapshot = Partial<EditableFrontmatter> | null;

export interface TabState {
  id: string; // file path — one tab per file
  path: string;
  kind: "note" | "plain-file";
  title: string;
  noteType: string | null; // null for plain files
  // Per-tab editor state (swapped in/out of editorStore)
  editedBody: string | null;
  editedFrontmatter: FmSnapshot;
  isDirty: boolean;
  conflictState: "none" | "external-change";
  fmUndoStack: FmSnapshot[];
  fmRedoStack: FmSnapshot[];
  viewMode: "edit" | "preview";
  scrollTop: number;
  cursorPos: number;
}

interface TabStoreState {
  tabs: TabState[];
  activeTabId: string | null;

  openTab: (path: string, kind: "note" | "plain-file", title: string, noteType: string | null) => void;
  closeTab: (id: string) => void;
  closeActiveTab: () => void;
  closeOtherTabs: (id: string) => void;
  closeAllTabs: () => void;
  activateTab: (id: string) => void;
  updateTabState: (id: string, partial: Partial<TabState>) => void;
  getTab: (id: string) => TabState | undefined;
  reset: () => void;
}

function createFreshTab(path: string, kind: "note" | "plain-file", title: string, noteType: string | null): TabState {
  return {
    id: path,
    path,
    kind,
    title,
    noteType,
    editedBody: null,
    editedFrontmatter: null,
    isDirty: false,
    conflictState: "none",
    fmUndoStack: [],
    fmRedoStack: [],
    viewMode: "edit",
    scrollTop: 0,
    cursorPos: 0,
  };
}

export const useTabStore = create<TabStoreState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  openTab: (path, kind, title, noteType) => {
    const { tabs, activeTabId } = get();
    const existing = tabs.find((t) => t.id === path);
    if (existing) {
      // Tab already open — just activate it
      set({ activeTabId: path });
      return;
    }
    // Insert new tab after the currently active tab
    const activeIndex = tabs.findIndex((t) => t.id === activeTabId);
    const insertAt = activeIndex >= 0 ? activeIndex + 1 : tabs.length;
    const newTab = createFreshTab(path, kind, title, noteType);
    const next = [...tabs];
    next.splice(insertAt, 0, newTab);
    set({ tabs: next, activeTabId: path });
  },

  closeTab: (id) => {
    const { tabs, activeTabId } = get();
    const idx = tabs.findIndex((t) => t.id === id);
    if (idx < 0) return;
    const next = tabs.filter((t) => t.id !== id);
    if (next.length === 0) {
      set({ tabs: [], activeTabId: null });
      return;
    }
    if (activeTabId === id) {
      // Activate next tab, or previous if it was the last
      const newIdx = idx < next.length ? idx : next.length - 1;
      set({ tabs: next, activeTabId: next[newIdx].id });
    } else {
      set({ tabs: next });
    }
  },

  closeActiveTab: () => {
    const { activeTabId, closeTab } = get();
    if (activeTabId) closeTab(activeTabId);
  },

  // NOTE: Callers must save dirty tabs before calling these methods.
  // Currently not wired to any UI — save-before-close will be added when exposed.
  closeOtherTabs: (id) => {
    const { tabs } = get();
    const keep = tabs.find((t) => t.id === id);
    if (!keep) return;
    set({ tabs: [keep], activeTabId: id });
  },

  closeAllTabs: () => {
    set({ tabs: [], activeTabId: null });
  },

  activateTab: (id) => {
    const { tabs } = get();
    if (tabs.some((t) => t.id === id)) {
      set({ activeTabId: id });
    }
  },

  updateTabState: (id, partial) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, ...partial } : t)),
    }));
  },

  getTab: (id) => {
    return get().tabs.find((t) => t.id === id);
  },

  reset: () => {
    set({ tabs: [], activeTabId: null });
  },
}));
