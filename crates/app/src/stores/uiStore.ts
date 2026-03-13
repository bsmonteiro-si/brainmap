import { create } from "zustand";

type Theme = "light" | "dark" | "system";
type GraphMode = "navigate" | "edit";
type GraphLayout = "force" | "hierarchical";

export const FONT_PRESETS = [
  // Sans-serif
  { label: "System Default", value: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  { label: "Inter",          value: "'Inter', system-ui, sans-serif" },
  { label: "Helvetica Neue", value: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  { label: "SF Pro",         value: "'SF Pro Display', 'SF Pro', system-ui, sans-serif" },
  { label: "Roboto",         value: "'Roboto', system-ui, sans-serif" },
  // Serif
  { label: "Georgia",        value: "Georgia, 'Times New Roman', serif" },
  { label: "Lora",           value: "'Lora', Georgia, serif" },
  { label: "Merriweather",   value: "'Merriweather', Georgia, serif" },
  // Monospace
  { label: "System Mono",    value: "ui-monospace, 'Menlo', 'Monaco', 'Consolas', monospace" },
  { label: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
  { label: "Fira Code",      value: "'Fira Code', monospace" },
  { label: "Cascadia Code",  value: "'Cascadia Code', monospace" },
  { label: "Source Code Pro", value: "'Source Code Pro', monospace" },
  { label: "IBM Plex Mono",  value: "'IBM Plex Mono', monospace" },
  // Custom
  { label: "Custom",         value: "custom" },
] as const;

export const UI_FONT_PRESETS = FONT_PRESETS;
export const EDITOR_FONT_PRESETS = FONT_PRESETS;

const DEFAULT_UI_FONT = FONT_PRESETS[0].value; // System Default (sans-serif)
const DEFAULT_EDITOR_FONT = FONT_PRESETS.find((p) => p.label === "System Mono")!.value;
const DEFAULT_UI_SIZE = 13;
const DEFAULT_EDITOR_SIZE = 14;
const DEFAULT_ZOOM = 1.0;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;

interface PanelSizes {
  graph?: number;
  right?: number;
  editor?: number;
  search?: number;
}

interface PersistedPrefs {
  theme?: Theme;
  uiFontFamily?: string;
  uiFontSize?: number;
  editorFontFamily?: string;
  editorFontSize?: number;
  uiZoom?: number;
}

type CreateNoteMode = "default" | "create-and-link";

interface CreateAndLinkSource {
  notePath: string;
  rel: string;
}

interface CreateNoteDialogOpts {
  initialPath?: string;
  initialTitle?: string;
  mode?: CreateNoteMode;
  linkSource?: CreateAndLinkSource;
}

interface UIState {
  theme: Theme;
  effectiveTheme: "light" | "dark";
  graphMode: GraphMode;
  commandPaletteOpen: boolean;
  createNoteDialogOpen: boolean;
  createNoteInitialPath: string | null;
  createNoteInitialTitle: string | null;
  createNoteMode: CreateNoteMode;
  createAndLinkSource: CreateAndLinkSource | null;
  createFolderDialogOpen: boolean;
  createFolderInitialPath: string | null;
  settingsOpen: boolean;
  showEdgeLabels: boolean;
  showLegend: boolean;
  graphLayout: GraphLayout;
  focusMode: boolean;
  treeOpen: boolean;
  treeExpandedFolders: Set<string>;
  hiddenEdgeTypes: Set<string>;
  panelSizes: PanelSizes;
  graphFocusPath: string | null;
  graphFocusKind: "note" | "folder" | null;
  showMinimap: boolean;
  showClusterHulls: boolean;
  showEdgeParticles: boolean;
  searchExpanded: boolean;
  uiFontFamily: string;
  uiFontSize: number;
  editorFontFamily: string;
  editorFontSize: number;
  uiZoom: number;
  emptyFolders: Set<string>;

  setTheme: (theme: Theme) => void;
  toggleGraphMode: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openCreateNoteDialog: (pathOrOpts?: string | CreateNoteDialogOpts) => void;
  closeCreateNoteDialog: () => void;
  openCreateFolderDialog: (initialPath?: string) => void;
  closeCreateFolderDialog: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  toggleEdgeLabels: () => void;
  toggleLegend: () => void;
  setGraphLayout: (layout: GraphLayout) => void;
  toggleFocusMode: () => void;
  toggleTree: () => void;
  toggleFolder: (fullPath: string) => void;
  toggleEdgeType: (rel: string) => void;
  clearHiddenEdgeTypes: () => void;
  savePanelSizes: (sizes: Partial<PanelSizes>) => void;
  toggleMinimap: () => void;
  toggleClusterHulls: () => void;
  toggleEdgeParticles: () => void;
  toggleSearchExpanded: () => void;
  setGraphFocus: (path: string, kind: "note" | "folder") => void;
  clearGraphFocus: () => void;
  setUIFontFamily: (v: string) => void;
  setUIFontSize: (v: number) => void;
  setEditorFontFamily: (v: string) => void;
  setEditorFontSize: (v: number) => void;
  resetFontPrefs: () => void;
  resetWorkspaceState: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  addEmptyFolder: (path: string) => void;
  removeEmptyFolder: (path: string) => void;
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(theme: Theme): "light" | "dark" {
  return theme === "system" ? getSystemTheme() : theme;
}

function loadStoredSizes(): PanelSizes {
  try {
    return JSON.parse(localStorage.getItem("brainmap:panelSizes") ?? "{}");
  } catch {
    return {};
  }
}

function loadStoredPrefs(): PersistedPrefs {
  try {
    return JSON.parse(localStorage.getItem("brainmap:uiPrefs") ?? "{}");
  } catch {
    return {};
  }
}

function savePrefs(prefs: PersistedPrefs) {
  localStorage.setItem("brainmap:uiPrefs", JSON.stringify(prefs));
}

const storedSizes = loadStoredSizes();
const storedPrefs = loadStoredPrefs();

export const useUIStore = create<UIState>((set, get) => ({
  theme: storedPrefs.theme ?? "system",
  effectiveTheme: resolveTheme(storedPrefs.theme ?? "system"),
  graphMode: "navigate",
  commandPaletteOpen: false,
  createNoteDialogOpen: false,
  createNoteInitialPath: null,
  createNoteInitialTitle: null,
  createNoteMode: "default",
  createAndLinkSource: null,
  createFolderDialogOpen: false,
  createFolderInitialPath: null,
  settingsOpen: false,
  showEdgeLabels: false,
  showLegend: false,
  graphLayout: "force",
  focusMode: false,
  treeOpen: false,
  treeExpandedFolders: new Set<string>(),
  hiddenEdgeTypes: new Set<string>(),
  panelSizes: storedSizes,
  showMinimap: false,
  showClusterHulls: false,
  showEdgeParticles: false,
  searchExpanded: false,
  graphFocusPath: null,
  graphFocusKind: null,
  uiFontFamily: storedPrefs.uiFontFamily ?? DEFAULT_UI_FONT,
  uiFontSize: storedPrefs.uiFontSize ?? DEFAULT_UI_SIZE,
  editorFontFamily: storedPrefs.editorFontFamily ?? DEFAULT_EDITOR_FONT,
  editorFontSize: storedPrefs.editorFontSize ?? DEFAULT_EDITOR_SIZE,
  uiZoom: storedPrefs.uiZoom ?? DEFAULT_ZOOM,
  emptyFolders: new Set<string>(),

  setTheme: (theme: Theme) => {
    set({ theme, effectiveTheme: resolveTheme(theme) });
    const s = get();
    savePrefs({ theme, uiFontFamily: s.uiFontFamily, uiFontSize: s.uiFontSize, editorFontFamily: s.editorFontFamily, editorFontSize: s.editorFontSize, uiZoom: s.uiZoom });
  },

  toggleGraphMode: () => {
    set((state) => ({
      graphMode: state.graphMode === "navigate" ? "edit" : "navigate",
    }));
  },

  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  openCreateNoteDialog: (pathOrOpts?: string | CreateNoteDialogOpts) => {
    if (typeof pathOrOpts === "string" || pathOrOpts === undefined) {
      set({ createNoteDialogOpen: true, createNoteInitialPath: pathOrOpts ?? null, createNoteInitialTitle: null, createNoteMode: "default", createAndLinkSource: null });
    } else {
      set({
        createNoteDialogOpen: true,
        createNoteInitialPath: pathOrOpts.initialPath ?? null,
        createNoteInitialTitle: pathOrOpts.initialTitle ?? null,
        createNoteMode: pathOrOpts.mode ?? "default",
        createAndLinkSource: pathOrOpts.linkSource ?? null,
      });
    }
  },
  closeCreateNoteDialog: () => set({ createNoteDialogOpen: false, createNoteInitialPath: null, createNoteInitialTitle: null, createNoteMode: "default", createAndLinkSource: null }),
  openCreateFolderDialog: (initialPath?: string) => set({ createFolderDialogOpen: true, createFolderInitialPath: initialPath ?? null }),
  closeCreateFolderDialog: () => set({ createFolderDialogOpen: false, createFolderInitialPath: null }),
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),

  toggleEdgeLabels: () => set((s) => ({ showEdgeLabels: !s.showEdgeLabels })),
  toggleLegend: () => set((s) => ({ showLegend: !s.showLegend })),
  setGraphLayout: (layout: GraphLayout) => set({ graphLayout: layout }),
  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
  toggleTree: () => set((s) => ({ treeOpen: !s.treeOpen })),

  toggleFolder: (fullPath: string) =>
    set((s) => {
      const next = new Set(s.treeExpandedFolders);
      if (next.has(fullPath)) next.delete(fullPath);
      else next.add(fullPath);
      return { treeExpandedFolders: next };
    }),

  toggleEdgeType: (rel: string) =>
    set((s) => {
      const next = new Set(s.hiddenEdgeTypes);
      if (next.has(rel)) next.delete(rel);
      else next.add(rel);
      return { hiddenEdgeTypes: next };
    }),

  clearHiddenEdgeTypes: () => set({ hiddenEdgeTypes: new Set<string>() }),

  savePanelSizes: (sizes: Partial<PanelSizes>) => {
    const next = { ...get().panelSizes, ...sizes };
    localStorage.setItem("brainmap:panelSizes", JSON.stringify(next));
    set({ panelSizes: next });
  },

  toggleMinimap: () => set((s) => ({ showMinimap: !s.showMinimap })),
  toggleClusterHulls: () => set((s) => ({ showClusterHulls: !s.showClusterHulls })),
  toggleEdgeParticles: () => set((s) => ({ showEdgeParticles: !s.showEdgeParticles })),
  toggleSearchExpanded: () => set((s) => ({ searchExpanded: !s.searchExpanded })),

  // treeOpen: false is set atomically so there's no intermediate render where
  // focus is active but the Files tab is still visible.
  setGraphFocus: (path, kind) => set({ graphFocusPath: path, graphFocusKind: kind, treeOpen: false }),
  clearGraphFocus: () => set({ graphFocusPath: null, graphFocusKind: null }),

  setUIFontFamily: (v: string) => {
    set({ uiFontFamily: v });
    const s = get();
    savePrefs({ theme: s.theme, uiFontFamily: v, uiFontSize: s.uiFontSize, editorFontFamily: s.editorFontFamily, editorFontSize: s.editorFontSize, uiZoom: s.uiZoom });
  },

  setUIFontSize: (v: number) => {
    set({ uiFontSize: v });
    const s = get();
    savePrefs({ theme: s.theme, uiFontFamily: s.uiFontFamily, uiFontSize: v, editorFontFamily: s.editorFontFamily, editorFontSize: s.editorFontSize, uiZoom: s.uiZoom });
  },

  setEditorFontFamily: (v: string) => {
    set({ editorFontFamily: v });
    const s = get();
    savePrefs({ theme: s.theme, uiFontFamily: s.uiFontFamily, uiFontSize: s.uiFontSize, editorFontFamily: v, editorFontSize: s.editorFontSize, uiZoom: s.uiZoom });
  },

  setEditorFontSize: (v: number) => {
    set({ editorFontSize: v });
    const s = get();
    savePrefs({ theme: s.theme, uiFontFamily: s.uiFontFamily, uiFontSize: s.uiFontSize, editorFontFamily: s.editorFontFamily, editorFontSize: v, uiZoom: s.uiZoom });
  },

  resetWorkspaceState: () => set({
    hiddenEdgeTypes: new Set<string>(),
    graphFocusPath: null,
    graphFocusKind: null,
    emptyFolders: new Set<string>(),
  }),

  resetFontPrefs: () => {
    const { theme, uiZoom } = get();
    set({ uiFontFamily: DEFAULT_UI_FONT, uiFontSize: DEFAULT_UI_SIZE, editorFontFamily: DEFAULT_EDITOR_FONT, editorFontSize: DEFAULT_EDITOR_SIZE });
    savePrefs({ theme, uiFontFamily: DEFAULT_UI_FONT, uiFontSize: DEFAULT_UI_SIZE, editorFontFamily: DEFAULT_EDITOR_FONT, editorFontSize: DEFAULT_EDITOR_SIZE, uiZoom });
  },

  zoomIn: () => {
    const next = Math.min(MAX_ZOOM, Math.round((get().uiZoom + 0.1) * 10) / 10);
    set({ uiZoom: next });
    const s = get();
    savePrefs({ theme: s.theme, uiFontFamily: s.uiFontFamily, uiFontSize: s.uiFontSize, editorFontFamily: s.editorFontFamily, editorFontSize: s.editorFontSize, uiZoom: next });
  },

  zoomOut: () => {
    const next = Math.max(MIN_ZOOM, Math.round((get().uiZoom - 0.1) * 10) / 10);
    set({ uiZoom: next });
    const s = get();
    savePrefs({ theme: s.theme, uiFontFamily: s.uiFontFamily, uiFontSize: s.uiFontSize, editorFontFamily: s.editorFontFamily, editorFontSize: s.editorFontSize, uiZoom: next });
  },

  resetZoom: () => {
    set({ uiZoom: DEFAULT_ZOOM });
    const s = get();
    savePrefs({ theme: s.theme, uiFontFamily: s.uiFontFamily, uiFontSize: s.uiFontSize, editorFontFamily: s.editorFontFamily, editorFontSize: s.editorFontSize, uiZoom: DEFAULT_ZOOM });
  },

  addEmptyFolder: (path: string) => {
    const s = get();
    const nextFolders = new Set(s.emptyFolders);
    nextFolders.add(path);
    // Auto-expand all ancestor folders so the new folder is visible
    const nextExpanded = new Set(s.treeExpandedFolders);
    const parts = path.split("/");
    for (let i = 0; i < parts.length - 1; i++) {
      nextExpanded.add(parts.slice(0, i + 1).join("/"));
    }
    set({ emptyFolders: nextFolders, treeExpandedFolders: nextExpanded });
  },

  removeEmptyFolder: (path: string) =>
    set((s) => {
      const next = new Set(s.emptyFolders);
      next.delete(path);
      return { emptyFolders: next };
    }),
}));
