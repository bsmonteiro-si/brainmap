import { create } from "zustand";

export type ThemeName = "light" | "dark" | "dracula" | "solarized-light" | "solarized-dark" | "nord" | "tokyo-night" | "one-dark";
type Theme = ThemeName | "system";
export type ComponentTheme = "inherit" | ThemeName;
type GraphMode = "navigate" | "edit";
export type GraphLayout = "force" | "hierarchical" | "radial" | "concentric" | "grouped";

export const THEME_BASE: Record<ThemeName, "light" | "dark"> = {
  light: "light",
  dark: "dark",
  dracula: "dark",
  "solarized-light": "light",
  "solarized-dark": "dark",
  nord: "dark",
  "tokyo-night": "dark",
  "one-dark": "dark",
};

export const THEME_OPTIONS: { value: ThemeName; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "dracula", label: "Dracula" },
  { value: "solarized-light", label: "Solarized Light" },
  { value: "solarized-dark", label: "Solarized Dark" },
  { value: "nord", label: "Nord" },
  { value: "tokyo-night", label: "Tokyo Night" },
  { value: "one-dark", label: "One Dark" },
];

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
export const DEFAULT_TOOLTIP_SIZE = 18;
export const DEFAULT_TOOLTIP_PILL_SIZE = 14;
export const DEFAULT_TOOLTIP_CONNECTIONS_SIZE = 14;
export const DEFAULT_TOOLTIP_SUMMARY_SIZE = 15;
export const DEFAULT_TOOLTIP_TAG_SIZE = 14;
export const DEFAULT_NODE_LABEL_SIZE = 11;
export const DEFAULT_NODE_ICON_SIZE = 18;
export const DEFAULT_NODE_LABEL_BG_PADDING = 3;

export type LeftTab = "files" | "graph" | "search";

interface TabPanelSizes {
  content?: number;
  editor?: number;
}

interface PanelSizes {
  files?: TabPanelSizes;
  graph?: TabPanelSizes;
  search?: TabPanelSizes;
}

export const BUILTIN_TAB_SIZES: Record<LeftTab, Required<TabPanelSizes>> = {
  files: { content: 20, editor: 80 },
  graph: { content: 80, editor: 20 },
  search: { content: 20, editor: 80 },
};

export function getDefaultTabSizes(prefs: PersistedPrefs): Record<LeftTab, Required<TabPanelSizes>> {
  const custom = prefs.defaultTabSizes;
  if (!custom) return BUILTIN_TAB_SIZES;
  return {
    files: { content: custom.files?.content ?? BUILTIN_TAB_SIZES.files.content, editor: custom.files?.editor ?? BUILTIN_TAB_SIZES.files.editor },
    graph: { content: custom.graph?.content ?? BUILTIN_TAB_SIZES.graph.content, editor: custom.graph?.editor ?? BUILTIN_TAB_SIZES.graph.editor },
    search: { content: custom.search?.content ?? BUILTIN_TAB_SIZES.search.content, editor: custom.search?.editor ?? BUILTIN_TAB_SIZES.search.editor },
  };
}

export function getTabSizes(panelSizes: PanelSizes, tab: LeftTab): Required<TabPanelSizes> {
  const stored = panelSizes[tab];
  const defaults = BUILTIN_TAB_SIZES[tab];
  return {
    content: stored?.content ?? defaults.content,
    editor: stored?.editor ?? defaults.editor,
  };
}

interface PersistedPrefs {
  theme?: Theme;
  uiFontFamily?: string;
  uiFontSize?: number;
  editorFontFamily?: string;
  editorFontSize?: number;
  editorLineNumbers?: boolean;
  uiZoom?: number;
  defaultTabSizes?: Partial<Record<LeftTab, TabPanelSizes>>;
  filesTheme?: ComponentTheme;
  editorTheme?: ComponentTheme;
  homeNotes?: Record<string, string>; // workspaceRoot → notePath
  tooltipFontSize?: number;
  tooltipPillSize?: number;
  tooltipConnectionsSize?: number;
  tooltipSummarySize?: number;
  tooltipTagSize?: number;
  nodeLabelSize?: number;
  nodeIconSize?: number;
  nodeLabelBgPadding?: number;
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
  saveAsBody?: string;
  saveAsTabId?: string;
}

interface UIState {
  theme: Theme;
  effectiveTheme: ThemeName;
  filesTheme: ComponentTheme;
  editorTheme: ComponentTheme;
  effectiveFilesTheme: ThemeName;
  effectiveEditorTheme: ThemeName;
  graphMode: GraphMode;
  commandPaletteOpen: boolean;
  createNoteDialogOpen: boolean;
  createNoteInitialPath: string | null;
  createNoteInitialTitle: string | null;
  createNoteMode: CreateNoteMode;
  createAndLinkSource: CreateAndLinkSource | null;
  createNoteSaveAsBody: string | null;
  createNoteSaveAsTabId: string | null;
  unsavedChangesDialogOpen: boolean;
  unsavedChangesTabId: string | null;
  createFolderDialogOpen: boolean;
  createFolderInitialPath: string | null;
  settingsOpen: boolean;
  showEdgeLabels: boolean;
  showLegend: boolean;
  graphLayout: GraphLayout;
  focusMode: boolean;
  activeLeftTab: LeftTab;
  leftPanelCollapsed: boolean;
  treeExpandedFolders: Set<string>;
  hiddenEdgeTypes: Set<string>;
  panelSizes: PanelSizes;
  graphFocusPath: string | null;
  graphFocusKind: "note" | "folder" | null;
  showMinimap: boolean;
  showClusterHulls: boolean;
  showEdgeParticles: boolean;
  uiFontFamily: string;
  uiFontSize: number;
  editorFontFamily: string;
  editorFontSize: number;
  uiZoom: number;
  showLineNumbers: boolean;
  tooltipFontSize: number;
  tooltipPillSize: number;
  tooltipConnectionsSize: number;
  tooltipSummarySize: number;
  tooltipTagSize: number;
  nodeLabelSize: number;
  nodeIconSize: number;
  nodeLabelBgPadding: number;
  emptyFolders: Set<string>;
  homeNotePath: string | null;

  setHomeNote: (path: string) => void;
  clearHomeNote: () => void;
  toggleLineNumbers: () => void;
  setEditorLineNumbersDefault: (v: boolean) => void;
  setTheme: (theme: Theme) => void;
  setFilesTheme: (theme: ComponentTheme) => void;
  setEditorTheme: (theme: ComponentTheme) => void;
  toggleGraphMode: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openCreateNoteDialog: (pathOrOpts?: string | CreateNoteDialogOpts) => void;
  closeCreateNoteDialog: () => void;
  openUnsavedChangesDialog: (tabId: string) => void;
  closeUnsavedChangesDialog: () => void;
  openCreateFolderDialog: (initialPath?: string) => void;
  closeCreateFolderDialog: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  toggleEdgeLabels: () => void;
  toggleLegend: () => void;
  setGraphLayout: (layout: GraphLayout) => void;
  toggleFocusMode: () => void;
  setActiveLeftTab: (tab: LeftTab) => void;
  toggleLeftPanel: () => void;
  toggleFolder: (fullPath: string) => void;
  toggleEdgeType: (rel: string) => void;
  clearHiddenEdgeTypes: () => void;
  savePanelSizes: (tab: LeftTab, sizes: TabPanelSizes) => void;
  toggleMinimap: () => void;
  toggleClusterHulls: () => void;
  toggleEdgeParticles: () => void;
  setGraphFocus: (path: string, kind: "note" | "folder") => void;
  clearGraphFocus: () => void;
  setUIFontFamily: (v: string) => void;
  setUIFontSize: (v: number) => void;
  setEditorFontFamily: (v: string) => void;
  setEditorFontSize: (v: number) => void;
  setTooltipFontSize: (v: number) => void;
  setTooltipPillSize: (v: number) => void;
  setTooltipConnectionsSize: (v: number) => void;
  setTooltipSummarySize: (v: number) => void;
  setTooltipTagSize: (v: number) => void;
  resetTooltipPrefs: () => void;
  setNodeOverallSize: (v: number) => void;
  setNodeLabelSize: (v: number) => void;
  setNodeIconSize: (v: number) => void;
  setNodeLabelBgPadding: (v: number) => void;
  resetNodePrefs: () => void;
  resetFontPrefs: () => void;
  setDefaultTabSize: (tab: LeftTab, content: number) => void;
  resetLayoutPrefs: () => void;
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

function resolveTheme(theme: Theme): ThemeName {
  return theme === "system" ? getSystemTheme() : theme;
}

function resolveComponentTheme(component: ComponentTheme, global: ThemeName): ThemeName {
  return component === "inherit" ? global : component;
}

function loadStoredSizes(): PanelSizes {
  try {
    const raw = JSON.parse(localStorage.getItem("brainmap:panelSizes") ?? "{}");
    let result: PanelSizes = {};

    // Already in per-tab format (values are objects, not numbers)
    if (typeof raw.files === "object" || typeof raw.graph === "object" || typeof raw.search === "object") {
      result = { files: raw.files, graph: raw.graph, search: raw.search };
    } else {
      // Migrate old flat keys (content/editor or graph/right) → files sub-object
      const content = raw.content ?? raw.graph;
      const editor = raw.editor ?? raw.right;
      if (content != null || editor != null) {
        result = { files: { content, editor } };
      }
    }

    // For tabs with no stored sizes, apply user's custom defaults from prefs
    const customDefaults = loadStoredPrefs().defaultTabSizes;
    if (customDefaults) {
      const tabs: LeftTab[] = ["files", "graph", "search"];
      for (const tab of tabs) {
        if (!result[tab] && customDefaults[tab]) {
          result[tab] = customDefaults[tab];
        }
      }
    }

    return result;
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
  // Merge with existing to preserve keys not explicitly set (e.g. defaultTabSizes)
  const existing = loadStoredPrefs();
  localStorage.setItem("brainmap:uiPrefs", JSON.stringify({ ...existing, ...prefs }));
}

// Lazy reference to workspaceStore to avoid circular import at module init.
// Set via `registerWorkspaceStoreForUIStore` called from workspaceStore after its own init.
let _getWorkspaceRoot: (() => string | null) | null = null;

/** Called by workspaceStore to provide lazy access without circular imports. */
export function registerWorkspaceStoreForUIStore(getter: () => string | null) {
  _getWorkspaceRoot = getter;
}

function persistHomeNote(path: string | null) {
  try {
    const root = _getWorkspaceRoot?.() ?? null;
    if (!root) return;
    const prefs = loadStoredPrefs();
    const homeNotes = { ...prefs.homeNotes };
    if (path) {
      homeNotes[root] = path;
    } else {
      delete homeNotes[root];
    }
    savePrefs({ ...prefs, homeNotes });
  } catch { /* ignore persistence errors */ }
}

/** Load persisted home note for a given workspace root. */
export function loadHomeNoteForWorkspace(workspaceRoot: string): string | null {
  try {
    const prefs = loadStoredPrefs();
    return prefs.homeNotes?.[workspaceRoot] ?? null;
  } catch { return null; }
}

const storedSizes = loadStoredSizes();
const storedPrefs = loadStoredPrefs();

export const useUIStore = create<UIState>((set, get) => ({
  theme: storedPrefs.theme ?? "system",
  effectiveTheme: resolveTheme(storedPrefs.theme ?? "system"),
  filesTheme: storedPrefs.filesTheme ?? "inherit",
  editorTheme: storedPrefs.editorTheme ?? "inherit",
  effectiveFilesTheme: resolveComponentTheme(storedPrefs.filesTheme ?? "inherit", resolveTheme(storedPrefs.theme ?? "system")),
  effectiveEditorTheme: resolveComponentTheme(storedPrefs.editorTheme ?? "inherit", resolveTheme(storedPrefs.theme ?? "system")),
  graphMode: "navigate",
  commandPaletteOpen: false,
  createNoteDialogOpen: false,
  createNoteInitialPath: null,
  createNoteInitialTitle: null,
  createNoteMode: "default",
  createAndLinkSource: null,
  createNoteSaveAsBody: null,
  createNoteSaveAsTabId: null,
  unsavedChangesDialogOpen: false,
  unsavedChangesTabId: null,
  createFolderDialogOpen: false,
  createFolderInitialPath: null,
  settingsOpen: false,
  showEdgeLabels: false,
  showLegend: false,
  graphLayout: "force",
  focusMode: false,
  activeLeftTab: "files",
  leftPanelCollapsed: false,
  treeExpandedFolders: new Set<string>(),
  hiddenEdgeTypes: new Set<string>(),
  panelSizes: storedSizes,
  showMinimap: false,
  showClusterHulls: false,
  showEdgeParticles: false,
  graphFocusPath: null,
  graphFocusKind: null,
  uiFontFamily: storedPrefs.uiFontFamily ?? DEFAULT_UI_FONT,
  uiFontSize: storedPrefs.uiFontSize ?? DEFAULT_UI_SIZE,
  editorFontFamily: storedPrefs.editorFontFamily ?? DEFAULT_EDITOR_FONT,
  editorFontSize: storedPrefs.editorFontSize ?? DEFAULT_EDITOR_SIZE,
  uiZoom: storedPrefs.uiZoom ?? DEFAULT_ZOOM,
  showLineNumbers: storedPrefs.editorLineNumbers ?? false,
  tooltipFontSize: storedPrefs.tooltipFontSize ?? DEFAULT_TOOLTIP_SIZE,
  tooltipPillSize: storedPrefs.tooltipPillSize ?? DEFAULT_TOOLTIP_PILL_SIZE,
  tooltipConnectionsSize: storedPrefs.tooltipConnectionsSize ?? DEFAULT_TOOLTIP_CONNECTIONS_SIZE,
  tooltipSummarySize: storedPrefs.tooltipSummarySize ?? DEFAULT_TOOLTIP_SUMMARY_SIZE,
  tooltipTagSize: storedPrefs.tooltipTagSize ?? DEFAULT_TOOLTIP_TAG_SIZE,
  nodeLabelSize: storedPrefs.nodeLabelSize ?? DEFAULT_NODE_LABEL_SIZE,
  nodeIconSize: storedPrefs.nodeIconSize ?? DEFAULT_NODE_ICON_SIZE,
  nodeLabelBgPadding: storedPrefs.nodeLabelBgPadding ?? DEFAULT_NODE_LABEL_BG_PADDING,
  emptyFolders: new Set<string>(),
  homeNotePath: null,

  setHomeNote: (path: string) => {
    set({ homeNotePath: path });
    persistHomeNote(path);
  },
  clearHomeNote: () => {
    set({ homeNotePath: null });
    persistHomeNote(null);
  },
  toggleLineNumbers: () => {
    const next = !get().showLineNumbers;
    set({ showLineNumbers: next });
    const s = get();
    savePrefs({ theme: s.theme, uiFontFamily: s.uiFontFamily, uiFontSize: s.uiFontSize, editorFontFamily: s.editorFontFamily, editorFontSize: s.editorFontSize, editorLineNumbers: next, uiZoom: s.uiZoom });
  },
  setEditorLineNumbersDefault: (v: boolean) => {
    set({ showLineNumbers: v });
    const s = get();
    savePrefs({ theme: s.theme, uiFontFamily: s.uiFontFamily, uiFontSize: s.uiFontSize, editorFontFamily: s.editorFontFamily, editorFontSize: s.editorFontSize, editorLineNumbers: v, uiZoom: s.uiZoom });
  },
  setTheme: (theme: Theme) => {
    const effective = resolveTheme(theme);
    const s = get();
    set({
      theme,
      effectiveTheme: effective,
      effectiveFilesTheme: resolveComponentTheme(s.filesTheme, effective),
      effectiveEditorTheme: resolveComponentTheme(s.editorTheme, effective),
    });
    savePrefs({ theme, uiFontFamily: s.uiFontFamily, uiFontSize: s.uiFontSize, editorFontFamily: s.editorFontFamily, editorFontSize: s.editorFontSize, uiZoom: s.uiZoom });
  },
  setFilesTheme: (filesTheme: ComponentTheme) => {
    const s = get();
    set({ filesTheme, effectiveFilesTheme: resolveComponentTheme(filesTheme, s.effectiveTheme) });
    savePrefs({ theme: s.theme, uiFontFamily: s.uiFontFamily, uiFontSize: s.uiFontSize, editorFontFamily: s.editorFontFamily, editorFontSize: s.editorFontSize, uiZoom: s.uiZoom, filesTheme });
  },
  setEditorTheme: (editorTheme: ComponentTheme) => {
    const s = get();
    set({ editorTheme, effectiveEditorTheme: resolveComponentTheme(editorTheme, s.effectiveTheme) });
    savePrefs({ theme: s.theme, uiFontFamily: s.uiFontFamily, uiFontSize: s.uiFontSize, editorFontFamily: s.editorFontFamily, editorFontSize: s.editorFontSize, uiZoom: s.uiZoom, editorTheme });
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
      set({ createNoteDialogOpen: true, createNoteInitialPath: pathOrOpts ?? null, createNoteInitialTitle: null, createNoteMode: "default", createAndLinkSource: null, createNoteSaveAsBody: null, createNoteSaveAsTabId: null });
    } else {
      set({
        createNoteDialogOpen: true,
        createNoteInitialPath: pathOrOpts.initialPath ?? null,
        createNoteInitialTitle: pathOrOpts.initialTitle ?? null,
        createNoteMode: pathOrOpts.mode ?? "default",
        createAndLinkSource: pathOrOpts.linkSource ?? null,
        createNoteSaveAsBody: pathOrOpts.saveAsBody ?? null,
        createNoteSaveAsTabId: pathOrOpts.saveAsTabId ?? null,
      });
    }
  },
  closeCreateNoteDialog: () => set({ createNoteDialogOpen: false, createNoteInitialPath: null, createNoteInitialTitle: null, createNoteMode: "default", createAndLinkSource: null, createNoteSaveAsBody: null, createNoteSaveAsTabId: null }),
  openUnsavedChangesDialog: (tabId: string) => set({ unsavedChangesDialogOpen: true, unsavedChangesTabId: tabId }),
  closeUnsavedChangesDialog: () => set({ unsavedChangesDialogOpen: false, unsavedChangesTabId: null }),
  openCreateFolderDialog: (initialPath?: string) => set({ createFolderDialogOpen: true, createFolderInitialPath: initialPath ?? null }),
  closeCreateFolderDialog: () => set({ createFolderDialogOpen: false, createFolderInitialPath: null }),
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),

  toggleEdgeLabels: () => set((s) => ({ showEdgeLabels: !s.showEdgeLabels })),
  toggleLegend: () => set((s) => ({ showLegend: !s.showLegend })),
  setGraphLayout: (layout: GraphLayout) => set({ graphLayout: layout }),
  toggleFocusMode: () => set((s) => {
    const next = !s.focusMode;
    return { focusMode: next, leftPanelCollapsed: next };
  }),
  setActiveLeftTab: (tab: LeftTab) => set({ activeLeftTab: tab, leftPanelCollapsed: false }),
  toggleLeftPanel: () => set((s) => ({ leftPanelCollapsed: !s.leftPanelCollapsed })),

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

  savePanelSizes: (tab: LeftTab, sizes: TabPanelSizes) => {
    const next = { ...get().panelSizes, [tab]: sizes };
    localStorage.setItem("brainmap:panelSizes", JSON.stringify(next));
    set({ panelSizes: next });
  },

  toggleMinimap: () => set((s) => ({ showMinimap: !s.showMinimap })),
  toggleClusterHulls: () => set((s) => ({ showClusterHulls: !s.showClusterHulls })),
  toggleEdgeParticles: () => set((s) => ({ showEdgeParticles: !s.showEdgeParticles })),

  setGraphFocus: (path, kind) => set({ graphFocusPath: path, graphFocusKind: kind, activeLeftTab: "graph", leftPanelCollapsed: false }),
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

  setTooltipFontSize: (v: number) => {
    const scale = v / DEFAULT_TOOLTIP_SIZE;
    const pill = Math.round(DEFAULT_TOOLTIP_PILL_SIZE * scale);
    const conn = Math.round(DEFAULT_TOOLTIP_CONNECTIONS_SIZE * scale);
    const summ = Math.round(DEFAULT_TOOLTIP_SUMMARY_SIZE * scale);
    const tag = Math.round(DEFAULT_TOOLTIP_TAG_SIZE * scale);
    set({ tooltipFontSize: v, tooltipPillSize: pill, tooltipConnectionsSize: conn, tooltipSummarySize: summ, tooltipTagSize: tag });
    savePrefs({ tooltipFontSize: v, tooltipPillSize: pill, tooltipConnectionsSize: conn, tooltipSummarySize: summ, tooltipTagSize: tag });
  },
  setTooltipPillSize: (v: number) => {
    set({ tooltipPillSize: v });
    savePrefs({ tooltipPillSize: v });
  },
  setTooltipConnectionsSize: (v: number) => {
    set({ tooltipConnectionsSize: v });
    savePrefs({ tooltipConnectionsSize: v });
  },
  setTooltipSummarySize: (v: number) => {
    set({ tooltipSummarySize: v });
    savePrefs({ tooltipSummarySize: v });
  },
  setTooltipTagSize: (v: number) => {
    set({ tooltipTagSize: v });
    savePrefs({ tooltipTagSize: v });
  },
  resetTooltipPrefs: () => {
    set({ tooltipFontSize: DEFAULT_TOOLTIP_SIZE, tooltipPillSize: DEFAULT_TOOLTIP_PILL_SIZE, tooltipConnectionsSize: DEFAULT_TOOLTIP_CONNECTIONS_SIZE, tooltipSummarySize: DEFAULT_TOOLTIP_SUMMARY_SIZE, tooltipTagSize: DEFAULT_TOOLTIP_TAG_SIZE });
    savePrefs({ tooltipFontSize: DEFAULT_TOOLTIP_SIZE, tooltipPillSize: DEFAULT_TOOLTIP_PILL_SIZE, tooltipConnectionsSize: DEFAULT_TOOLTIP_CONNECTIONS_SIZE, tooltipSummarySize: DEFAULT_TOOLTIP_SUMMARY_SIZE, tooltipTagSize: DEFAULT_TOOLTIP_TAG_SIZE });
  },

  setNodeOverallSize: (v: number) => {
    const scale = v / DEFAULT_NODE_ICON_SIZE;
    const label = Math.max(6, Math.round(DEFAULT_NODE_LABEL_SIZE * scale));
    const bgPad = Math.max(0, Math.round(DEFAULT_NODE_LABEL_BG_PADDING * scale));
    set({ nodeIconSize: v, nodeLabelSize: label, nodeLabelBgPadding: bgPad });
    savePrefs({ nodeIconSize: v, nodeLabelSize: label, nodeLabelBgPadding: bgPad });
  },
  setNodeLabelSize: (v: number) => {
    set({ nodeLabelSize: v });
    savePrefs({ nodeLabelSize: v });
  },
  setNodeIconSize: (v: number) => {
    set({ nodeIconSize: v });
    savePrefs({ nodeIconSize: v });
  },
  setNodeLabelBgPadding: (v: number) => {
    set({ nodeLabelBgPadding: v });
    savePrefs({ nodeLabelBgPadding: v });
  },
  resetNodePrefs: () => {
    set({ nodeLabelSize: DEFAULT_NODE_LABEL_SIZE, nodeIconSize: DEFAULT_NODE_ICON_SIZE, nodeLabelBgPadding: DEFAULT_NODE_LABEL_BG_PADDING });
    savePrefs({ nodeLabelSize: DEFAULT_NODE_LABEL_SIZE, nodeIconSize: DEFAULT_NODE_ICON_SIZE, nodeLabelBgPadding: DEFAULT_NODE_LABEL_BG_PADDING });
  },

  resetWorkspaceState: () => set({
    hiddenEdgeTypes: new Set<string>(),
    graphFocusPath: null,
    graphFocusKind: null,
    emptyFolders: new Set<string>(),
    treeExpandedFolders: new Set<string>(),
    activeLeftTab: "files" as LeftTab,
    leftPanelCollapsed: false,
    homeNotePath: null,
  }),

  resetFontPrefs: () => {
    const { theme, effectiveTheme, uiZoom } = get();
    set({ uiFontFamily: DEFAULT_UI_FONT, uiFontSize: DEFAULT_UI_SIZE, editorFontFamily: DEFAULT_EDITOR_FONT, editorFontSize: DEFAULT_EDITOR_SIZE, showLineNumbers: false, filesTheme: "inherit", editorTheme: "inherit", effectiveFilesTheme: effectiveTheme, effectiveEditorTheme: effectiveTheme, tooltipFontSize: DEFAULT_TOOLTIP_SIZE, tooltipPillSize: DEFAULT_TOOLTIP_PILL_SIZE, tooltipConnectionsSize: DEFAULT_TOOLTIP_CONNECTIONS_SIZE, tooltipSummarySize: DEFAULT_TOOLTIP_SUMMARY_SIZE, tooltipTagSize: DEFAULT_TOOLTIP_TAG_SIZE, nodeLabelSize: DEFAULT_NODE_LABEL_SIZE, nodeIconSize: DEFAULT_NODE_ICON_SIZE, nodeLabelBgPadding: DEFAULT_NODE_LABEL_BG_PADDING });
    savePrefs({ theme, uiFontFamily: DEFAULT_UI_FONT, uiFontSize: DEFAULT_UI_SIZE, editorFontFamily: DEFAULT_EDITOR_FONT, editorFontSize: DEFAULT_EDITOR_SIZE, editorLineNumbers: false, uiZoom, filesTheme: "inherit", editorTheme: "inherit", tooltipFontSize: DEFAULT_TOOLTIP_SIZE, tooltipPillSize: DEFAULT_TOOLTIP_PILL_SIZE, tooltipConnectionsSize: DEFAULT_TOOLTIP_CONNECTIONS_SIZE, tooltipSummarySize: DEFAULT_TOOLTIP_SUMMARY_SIZE, tooltipTagSize: DEFAULT_TOOLTIP_TAG_SIZE, nodeLabelSize: DEFAULT_NODE_LABEL_SIZE, nodeIconSize: DEFAULT_NODE_ICON_SIZE, nodeLabelBgPadding: DEFAULT_NODE_LABEL_BG_PADDING });
  },

  setDefaultTabSize: (tab: LeftTab, content: number) => {
    const s = get();
    const prefs = loadStoredPrefs();
    const next = { ...prefs.defaultTabSizes, [tab]: { content, editor: 100 - content } };
    savePrefs({ theme: s.theme, uiFontFamily: s.uiFontFamily, uiFontSize: s.uiFontSize, editorFontFamily: s.editorFontFamily, editorFontSize: s.editorFontSize, uiZoom: s.uiZoom, defaultTabSizes: next });
    // Also update current panel sizes so the change is immediately visible
    const panelNext = { ...s.panelSizes, [tab]: { content, editor: 100 - content } };
    localStorage.setItem("brainmap:panelSizes", JSON.stringify(panelNext));
    set({ panelSizes: panelNext });
  },

  resetLayoutPrefs: () => {
    // Write directly to bypass savePrefs merge (which would re-introduce the key)
    const prefs = loadStoredPrefs();
    delete prefs.defaultTabSizes;
    localStorage.setItem("brainmap:uiPrefs", JSON.stringify(prefs));
    // Clear current panel sizes so builtin defaults apply
    localStorage.setItem("brainmap:panelSizes", "{}");
    set({ panelSizes: {} });
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
