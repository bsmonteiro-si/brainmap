import { create } from "zustand";
import type { EditableFrontmatter } from "./editorStore";

type FmSnapshot = Partial<EditableFrontmatter> | null;

const UNTITLED_PREFIX = "__untitled__/";

/** Check whether a tab ID represents an unsaved untitled tab. */
export function isUntitledTab(id: string): boolean {
  return id.startsWith(UNTITLED_PREFIX);
}

export interface TabState {
  id: string; // file path — one tab per file (or synthetic ID for untitled tabs)
  path: string;
  kind: "note" | "plain-file" | "untitled" | "pdf" | "excalidraw" | "canvas" | "image" | "video";
  title: string;
  noteType: string | null; // null for plain files, untitled tabs, and PDFs
  // Per-tab editor state (swapped in/out of editorStore)
  editedBody: string | null;
  editedFrontmatter: FmSnapshot;
  isDirty: boolean;
  conflictState: "none" | "external-change";
  fmUndoStack: FmSnapshot[];
  fmRedoStack: FmSnapshot[];
  viewMode: "edit" | "preview" | "raw";
  scrollTop: number;
  cursorPos: number;
}

interface TabStoreState {
  tabs: TabState[];
  activeTabId: string | null;
  _untitledCounter: number;

  openTab: (path: string, kind: "note" | "plain-file" | "pdf" | "excalidraw" | "canvas" | "image" | "video", title: string, noteType: string | null) => void;
  createUntitledTab: () => string;
  closeTab: (id: string) => void;
  closeActiveTab: () => void;
  closeOtherTabs: (id: string) => void;
  closeTabsToRight: (id: string) => void;
  closeAllTabs: () => void;
  activateTab: (id: string) => void;
  updateTabState: (id: string, partial: Partial<TabState>) => void;
  getTab: (id: string) => TabState | undefined;
  renamePath: (oldPath: string, newPath: string, newTitle?: string) => void;
  reorderTab: (fromId: string, toId: string) => void;
  renamePathPrefix: (oldPrefix: string, newPrefix: string) => void;
  reset: () => void;
}

function createFreshTab(path: string, kind: "note" | "plain-file" | "untitled" | "pdf" | "excalidraw" | "canvas" | "image" | "video", title: string, noteType: string | null): TabState {
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
  _untitledCounter: 0,

  openTab: (path, kind, title, noteType) => {
    const { tabs, activeTabId } = get();
    const existing = tabs.find((t) => t.id === path);
    if (existing) {
      // Tab already open — activate it, updating kind if it changed
      // (e.g., a file first opened as plain-file now recognized as image)
      if (existing.kind !== kind) {
        const updated = tabs.map((t) => t.id === path ? { ...t, kind, title, noteType } : t);
        set({ tabs: updated, activeTabId: path });
      } else {
        set({ activeTabId: path });
      }
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

  createUntitledTab: () => {
    const { tabs, activeTabId, _untitledCounter } = get();
    const counter = _untitledCounter + 1;
    const id = `${UNTITLED_PREFIX}${counter}`;
    const title = `Untitled-${counter}`;
    const newTab = createFreshTab(id, "untitled", title, null);
    const activeIndex = tabs.findIndex((t) => t.id === activeTabId);
    const insertAt = activeIndex >= 0 ? activeIndex + 1 : tabs.length;
    const next = [...tabs];
    next.splice(insertAt, 0, newTab);
    set({ tabs: next, activeTabId: id, _untitledCounter: counter });
    return id;
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

  closeTabsToRight: (id) => {
    const { tabs, activeTabId } = get();
    const idx = tabs.findIndex((t) => t.id === id);
    if (idx < 0 || idx === tabs.length - 1) return;
    const next = tabs.slice(0, idx + 1);
    const activeStillPresent = next.some((t) => t.id === activeTabId);
    set({ tabs: next, activeTabId: activeStillPresent ? activeTabId : id });
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

  reorderTab: (fromId, toId) => {
    if (fromId === toId) return;
    const { tabs } = get();
    const fromIdx = tabs.findIndex((t) => t.id === fromId);
    const toIdx = tabs.findIndex((t) => t.id === toId);
    if (fromIdx < 0 || toIdx < 0) return;
    const next = [...tabs];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    set({ tabs: next });
  },

  renamePath: (oldPath, newPath, newTitle?) => {
    const { tabs, activeTabId } = get();
    const title = newTitle ?? newPath.split("/").pop()?.replace(/\.md$/, "") ?? newPath;
    set({
      tabs: tabs.map((t) =>
        t.id === oldPath ? { ...t, id: newPath, path: newPath, title } : t
      ),
      activeTabId: activeTabId === oldPath ? newPath : activeTabId,
    });
  },

  renamePathPrefix: (oldPrefix, newPrefix) => {
    const { tabs, activeTabId } = get();
    const prefix = oldPrefix.endsWith("/") ? oldPrefix : oldPrefix + "/";
    const replacement = newPrefix.endsWith("/") ? newPrefix : newPrefix + "/";
    let newActiveId = activeTabId;
    const newTabs = tabs.map((t) => {
      if (t.path.startsWith(prefix)) {
        const newPath = replacement + t.path.slice(prefix.length);
        const title = newPath.split("/").pop()?.replace(/\.md$/, "") ?? newPath;
        if (activeTabId === t.id) newActiveId = newPath;
        return { ...t, id: newPath, path: newPath, title };
      }
      return t;
    });
    set({ tabs: newTabs, activeTabId: newActiveId });
  },

  reset: () => {
    set({ tabs: [], activeTabId: null, _untitledCounter: 0 });
  },
}));
