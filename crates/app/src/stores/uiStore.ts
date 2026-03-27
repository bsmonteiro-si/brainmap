import { create } from "zustand";

export type ThemeName = "light" | "dark" | "dracula" | "solarized-light" | "solarized-dark" | "nord" | "tokyo-night" | "one-dark";
type Theme = ThemeName | "system";
export type ComponentTheme = "inherit" | ThemeName;
type GraphMode = "navigate" | "edit";
export type GraphLayout = "force" | "hierarchical" | "radial" | "concentric" | "grouped";

export type FileSortOrder = "custom" | "name-asc" | "name-desc" | "modified-desc" | "modified-asc";
export type SourceStyle = "underline" | "pill" | "icon" | "quotes";
export const SOURCE_STYLE_OPTIONS: { value: SourceStyle; label: string }[] = [
  { value: "underline", label: "Underline + label" },
  { value: "pill", label: "Pill badge" },
  { value: "icon", label: "Book icon" },
  { value: "quotes", label: "Quotation marks" },
];

export type ExampleStyle = "underline" | "pill" | "icon" | "quotes";
export const EXAMPLE_STYLE_OPTIONS: { value: ExampleStyle; label: string }[] = [
  { value: "underline", label: "Underline + label" },
  { value: "pill", label: "Pill badge" },
  { value: "icon", label: "Flask icon" },
  { value: "quotes", label: "Quotation marks" },
];

export type MathStyle = "underline" | "pill" | "icon" | "quotes";
export const MATH_STYLE_OPTIONS: { value: MathStyle; label: string }[] = [
  { value: "underline", label: "Underline + label" },
  { value: "pill", label: "Pill badge" },
  { value: "icon", label: "Sigma icon" },
  { value: "quotes", label: "Quotation marks" },
];

export type AttentionStyle = "underline" | "pill" | "icon" | "quotes";
export const ATTENTION_STYLE_OPTIONS: { value: AttentionStyle; label: string }[] = [
  { value: "underline", label: "Underline + label" },
  { value: "pill", label: "Pill badge" },
  { value: "icon", label: "Alert icon" },
  { value: "quotes", label: "Quotation marks" },
];

export type BulletStyle = "classic" | "dash" | "arrow" | "minimal";
export const BULLET_STYLE_OPTIONS: { value: BulletStyle; label: string }[] = [
  { value: "classic", label: "Classic (● ○ ▪)" },
  { value: "dash",    label: "Dash (— – ·)" },
  { value: "arrow",   label: "Arrow (▸ ▹ ▪)" },
  { value: "minimal", label: "Minimal (• • •)" },
];
export const BULLET_PRESETS: Record<BulletStyle, [string, string, string]> = {
  classic: ["●", "○", "▪"],
  dash:    ["—", "–", "·"],
  arrow:   ["▸", "▹", "▪"],
  minimal: ["•", "•", "•"],
};

export type ArrowColorStyle = "accent" | "muted" | "inherit";
export const ARROW_COLOR_OPTIONS: { value: ArrowColorStyle; label: string }[] = [
  { value: "accent",  label: "Accent" },
  { value: "muted",   label: "Muted" },
  { value: "inherit",  label: "Inherit (body text)" },
];

export type HeaderLayout = "elevated" | "merged" | "sidebar";
export const HEADER_LAYOUT_OPTIONS: { value: HeaderLayout; label: string }[] = [
  { value: "elevated", label: "Elevated Bar" },
  { value: "merged",   label: "Merged with Tabs" },
  { value: "sidebar",  label: "Sidebar Header" },
];

export type ArrowType = "->" | "<-" | "<->" | "=>" | "<=>";
export const ARROW_TYPE_LABELS: Record<ArrowType, string> = {
  "->":  "→  (right arrow)",
  "<-":  "←  (left arrow)",
  "<->": "↔  (bidirectional)",
  "=>":  "⇒  (double right)",
  "<=>": "⇔  (double bidirectional)",
};
export const ALL_ARROW_TYPES: ArrowType[] = ["->", "<-", "<->", "=>", "<=>"];

export const BOLD_WEIGHT_OPTIONS: { value: number; label: string }[] = [
  { value: 500, label: "Medium (500)" },
  { value: 600, label: "Semibold (600)" },
  { value: 700, label: "Bold (700)" },
  { value: 800, label: "Extra-bold (800)" },
  { value: 900, label: "Black (900)" },
];

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
export const DEFAULT_EDGE_LABEL_SIZE = 8;
export const DEFAULT_MERMAID_MAX_HEIGHT = 400;

export type LeftTab = "files" | "graph" | "search" | "canvas";

interface TabPanelSizes {
  content?: number;
  editor?: number;
}

interface PanelSizes {
  files?: TabPanelSizes;
  graph?: TabPanelSizes;
  search?: TabPanelSizes;
  canvas?: TabPanelSizes;
}

export const BUILTIN_TAB_SIZES: Record<LeftTab, Required<TabPanelSizes>> = {
  files: { content: 20, editor: 80 },
  graph: { content: 80, editor: 20 },
  search: { content: 20, editor: 80 },
  canvas: { content: 60, editor: 40 },
};

export function getDefaultTabSizes(prefs: PersistedPrefs): Record<LeftTab, Required<TabPanelSizes>> {
  const custom = prefs.defaultTabSizes;
  if (!custom) return BUILTIN_TAB_SIZES;
  return {
    files: { content: custom.files?.content ?? BUILTIN_TAB_SIZES.files.content, editor: custom.files?.editor ?? BUILTIN_TAB_SIZES.files.editor },
    graph: { content: custom.graph?.content ?? BUILTIN_TAB_SIZES.graph.content, editor: custom.graph?.editor ?? BUILTIN_TAB_SIZES.graph.editor },
    search: { content: custom.search?.content ?? BUILTIN_TAB_SIZES.search.content, editor: custom.search?.editor ?? BUILTIN_TAB_SIZES.search.editor },
    canvas: { content: custom.canvas?.content ?? BUILTIN_TAB_SIZES.canvas.content, editor: custom.canvas?.editor ?? BUILTIN_TAB_SIZES.canvas.editor },
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
  headerLayout?: HeaderLayout;
  headerFontFamily?: string;
  headerFontSize?: number;
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
  excalidrawTheme?: "light" | "dark";
  canvasTheme?: "light" | "dark";
  canvasShowDots?: boolean;
  canvasDotOpacity?: number;
  canvasArrowSize?: number;
  canvasEdgeWidth?: number;
  canvasCardBgOpacity?: number;
  canvasCardBorderStyle?: string;
  canvasDefaultCardWidth?: number;
  canvasDefaultCardHeight?: number;
  canvasCalloutTailSize?: number;
  canvasStickyRotation?: number;
  canvasStickyColor?: string;
  canvasStickyShadow?: number;
  canvasStickyFoldSize?: number;
  canvasStickyPin?: boolean;
  canvasStickyTape?: boolean;
  canvasStickyLines?: number;
  canvasStickyCurl?: number;
  canvasStickyStripe?: number;
  canvasRoundedRadius?: number;
  canvasGroupFontFamily?: string;
  canvasGroupFontSize?: number;
  canvasGroupBorderOpacity?: number;
  canvasGroupBorderStyle?: string;
  canvasGroupFillOpacity?: number;
  canvasSelectionColor?: string;
  canvasSelectionWidth?: number;
  canvasPanelFontFamily?: string;
  canvasPanelFontSize?: number;
  canvasShowMinimap?: boolean;
  canvasSnapToGrid?: boolean;
  canvasSnapGridSize?: number;
  canvasBackgroundVariant?: string;
  canvasNodeShadow?: number;
  canvasFileBrowserWidth?: number;
  canvasDefaultEdgeType?: string;
  codeTheme?: string;
  homeNotes?: Record<string, string>; // workspaceRoot → notePath
  tooltipFontSize?: number;
  tooltipPillSize?: number;
  tooltipConnectionsSize?: number;
  tooltipSummarySize?: number;
  tooltipTagSize?: number;
  nodeLabelSize?: number;
  nodeIconSize?: number;
  nodeLabelBgPadding?: number;
  edgeLabelSize?: number;
  relatedNotesExpanded?: boolean;
  sourceStyle?: SourceStyle;
  exampleStyle?: ExampleStyle;
  mathStyle?: MathStyle;
  attentionStyle?: AttentionStyle;
  fileSortOrder?: FileSortOrder;
  autoRevealFile?: boolean;
  lineWrapping?: boolean;
  spellCheck?: boolean;
  editorIndentSize?: number;
  mermaidMaxHeight?: number;
  bulletStyle?: BulletStyle;
  boldWeight?: number;
  boldTint?: number;
  italicTint?: number;
  arrowLigatures?: boolean;
  arrowEnabledTypes?: ArrowType[];
  arrowColor?: ArrowColorStyle;
  settingsSize?: { width: number; height: number };
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
  headerLayout: HeaderLayout;
  headerFontFamily: string;
  headerFontSize: number;
  theme: Theme;
  effectiveTheme: ThemeName;
  filesTheme: ComponentTheme;
  editorTheme: ComponentTheme;
  effectiveFilesTheme: ThemeName;
  effectiveEditorTheme: ThemeName;
  graphMode: GraphMode;
  commandPaletteOpen: boolean;
  createNoteDialogOpen: boolean;
  createNoteOnCreatedCallback: ((path: string) => void) | null;
  createNoteInitialPath: string | null;
  createNoteInitialTitle: string | null;
  createNoteMode: CreateNoteMode;
  createFileKind: "note" | "file" | "canvas" | "excalidraw";
  createAndLinkSource: CreateAndLinkSource | null;
  createNoteSaveAsBody: string | null;
  createNoteSaveAsTabId: string | null;
  convertToNoteOpen: boolean;
  convertToNoteTitle: string;
  convertToNoteBody: string;
  convertToNoteType: string;
  convertToNotePath: string;
  convertToNoteCallback: ((createdPath: string) => void) | null;
  unsavedChangesDialogOpen: boolean;
  unsavedChangesTabId: string | null;
  createFolderDialogOpen: boolean;
  createFolderInitialPath: string | null;
  settingsOpen: boolean;
  settingsSize: { width: number; height: number };
  settingsPosition: { x: number; y: number } | null;
  showEdgeLabels: boolean;
  showLegend: boolean;
  graphLayout: GraphLayout;
  focusMode: boolean;
  canvasFullscreen: string | null;
  activeLeftTab: LeftTab;
  activeCanvasPath: string | null;
  videoPipPath: string | null;
  leftPanelCollapsed: boolean;
  treeExpandedFolders: Set<string>;
  fileSortOrder: FileSortOrder;
  autoRevealFile: boolean;
  lineWrapping: boolean;
  spellCheck: boolean;
  editorIndentSize: number;
  mermaidMaxHeight: number;
  moveDialogTarget: { path: string; isFolder: boolean } | null;
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
  edgeLabelSize: number;
  relatedNotesExpanded: boolean;
  sourceStyle: SourceStyle;
  exampleStyle: ExampleStyle;
  mathStyle: MathStyle;
  attentionStyle: AttentionStyle;
  bulletStyle: BulletStyle;
  boldWeight: number;
  boldTint: number;
  italicTint: number;
  arrowLigatures: boolean;
  arrowEnabledTypes: ArrowType[];
  arrowColor: ArrowColorStyle;
  emptyFolders: Set<string>;
  excalidrawTheme: "light" | "dark";
  canvasTheme: "light" | "dark";
  canvasShowDots: boolean;
  canvasDotOpacity: number;
  canvasArrowSize: number;
  canvasEdgeWidth: number;
  canvasCardBgOpacity: number;
  canvasCardBorderStyle: string;
  canvasDefaultCardWidth: number;
  canvasDefaultCardHeight: number;
  canvasCalloutTailSize: number;
  canvasStickyRotation: number;
  canvasStickyColor: string;
  canvasStickyShadow: number;
  canvasStickyFoldSize: number;
  canvasStickyPin: boolean;
  canvasStickyTape: boolean;
  canvasStickyLines: number;
  canvasStickyCurl: number;
  canvasStickyStripe: number;
  canvasRoundedRadius: number;
  canvasGroupFontFamily: string;
  canvasGroupFontSize: number;
  canvasGroupBorderOpacity: number;
  canvasGroupBorderStyle: string;
  canvasGroupFillOpacity: number;
  canvasSelectionColor: string;
  canvasSelectionWidth: number;
  canvasPanelFontFamily: string;
  canvasPanelFontSize: number;
  canvasShowMinimap: boolean;
  canvasSnapToGrid: boolean;
  canvasSnapGridSize: number;
  canvasBackgroundVariant: string;
  canvasNodeShadow: number;
  canvasFileBrowserWidth: number;
  canvasDefaultEdgeType: string;
  codeTheme: string;
  homeNotePath: string | null;
  customFileOrder: Record<string, string[]>;
  /** Ephemeral reload counters for canvas/excalidraw tabs (not persisted). */
  tabReloadKeys: Map<string, number>;

  bumpTabReloadKey: (path: string) => void;
  setCustomFileOrder: (folderPath: string, orderedPaths: string[]) => void;
  saveCustomFileOrder: (segmentPath: string) => void;
  loadCustomFileOrder: (segmentPath: string) => void;
  clearCustomFileOrder: () => void;
  setHomeNote: (path: string) => void;
  clearHomeNote: () => void;
  toggleLineNumbers: () => void;
  setEditorLineNumbersDefault: (v: boolean) => void;
  setHeaderLayout: (layout: HeaderLayout) => void;
  setHeaderFontFamily: (v: string) => void;
  setHeaderFontSize: (v: number) => void;
  setTheme: (theme: Theme) => void;
  setFilesTheme: (theme: ComponentTheme) => void;
  setEditorTheme: (theme: ComponentTheme) => void;
  setExcalidrawTheme: (theme: "light" | "dark") => void;
  setCanvasTheme: (theme: "light" | "dark") => void;
  setCanvasShowDots: (show: boolean) => void;
  setCanvasDotOpacity: (opacity: number) => void;
  setCanvasArrowSize: (size: number) => void;
  setCanvasEdgeWidth: (v: number) => void;
  setCanvasCardBgOpacity: (opacity: number) => void;
  setCanvasCardBorderStyle: (v: string) => void;
  setCanvasDefaultCardWidth: (v: number) => void;
  setCanvasDefaultCardHeight: (v: number) => void;
  setCanvasCalloutTailSize: (v: number) => void;
  setCanvasStickyRotation: (v: number) => void;
  setCanvasStickyColor: (v: string) => void;
  setCanvasStickyShadow: (v: number) => void;
  setCanvasStickyFoldSize: (v: number) => void;
  setCanvasStickyPin: (v: boolean) => void;
  setCanvasStickyTape: (v: boolean) => void;
  setCanvasStickyLines: (v: number) => void;
  setCanvasStickyCurl: (v: number) => void;
  setCanvasStickyStripe: (v: number) => void;
  setCanvasRoundedRadius: (v: number) => void;
  setCanvasGroupFontFamily: (v: string) => void;
  setCanvasGroupFontSize: (v: number) => void;
  setCanvasGroupBorderOpacity: (v: number) => void;
  setCanvasGroupBorderStyle: (v: string) => void;
  setCanvasGroupFillOpacity: (v: number) => void;
  setCanvasSelectionColor: (v: string) => void;
  setCanvasSelectionWidth: (v: number) => void;
  setCanvasPanelFontFamily: (v: string) => void;
  setCanvasPanelFontSize: (v: number) => void;
  setCanvasShowMinimap: (v: boolean) => void;
  setCanvasSnapToGrid: (v: boolean) => void;
  setCanvasSnapGridSize: (v: number) => void;
  setCanvasBackgroundVariant: (v: string) => void;
  setCanvasNodeShadow: (v: number) => void;
  setCanvasFileBrowserWidth: (v: number) => void;
  setCanvasDefaultEdgeType: (v: string) => void;
  setCodeTheme: (theme: string) => void;
  toggleGraphMode: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openCreateNoteDialog: (pathOrOpts?: string | CreateNoteDialogOpts) => void;
  closeCreateNoteDialog: () => void;
  openConvertToNote: (opts: { title: string; body: string; noteType: string; folderPath: string; callback: (createdPath: string) => void }) => void;
  closeConvertToNote: () => void;
  openUnsavedChangesDialog: (tabId: string) => void;
  closeUnsavedChangesDialog: () => void;
  openCreateFolderDialog: (initialPath?: string) => void;
  closeCreateFolderDialog: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  setSettingsSize: (size: { width: number; height: number }) => void;
  setSettingsPosition: (pos: { x: number; y: number } | null) => void;
  toggleEdgeLabels: () => void;
  toggleLegend: () => void;
  setGraphLayout: (layout: GraphLayout) => void;
  toggleFocusMode: () => void;
  toggleCanvasFullscreen: (path?: string) => void;
  setActiveLeftTab: (tab: LeftTab) => void;
  openCanvasInPanel: (path: string) => void;
  openVideoPip: (path: string) => void;
  closeVideoPip: () => void;
  toggleLeftPanel: () => void;
  toggleFolder: (fullPath: string) => void;
  collapseAllFolders: () => void;
  setFileSortOrder: (order: FileSortOrder) => void;
  setAutoRevealFile: (v: boolean) => void;
  setLineWrapping: (v: boolean) => void;
  setSpellCheck: (v: boolean) => void;
  setEditorIndentSize: (v: number) => void;
  setMermaidMaxHeight: (v: number) => void;
  openMoveDialog: (target: { path: string; isFolder: boolean }) => void;
  closeMoveDialog: () => void;
  expandPathToFile: (filePath: string) => void;
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
  setEdgeLabelSize: (v: number) => void;
  resetNodePrefs: () => void;
  resetFontPrefs: () => void;
  setSourceStyle: (v: SourceStyle) => void;
  setExampleStyle: (v: ExampleStyle) => void;
  setMathStyle: (v: MathStyle) => void;
  setAttentionStyle: (v: AttentionStyle) => void;
  setBulletStyle: (v: BulletStyle) => void;
  setBoldWeight: (v: number) => void;
  setBoldTint: (v: number) => void;
  setItalicTint: (v: number) => void;
  setArrowLigatures: (v: boolean) => void;
  toggleArrowType: (t: ArrowType) => void;
  setArrowColor: (v: ArrowColorStyle) => void;
  setDefaultTabSize: (tab: LeftTab, content: number) => void;
  resetLayoutPrefs: () => void;
  resetWorkspaceState: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  toggleRelatedNotes: () => void;
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
      result = { files: raw.files, graph: raw.graph, search: raw.search, canvas: raw.canvas };
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
      const tabs: LeftTab[] = ["files", "graph", "search", "canvas"];
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
  headerLayout: (storedPrefs.headerLayout as HeaderLayout) ?? "elevated",
  headerFontFamily: storedPrefs.headerFontFamily ?? DEFAULT_UI_FONT,
  headerFontSize: storedPrefs.headerFontSize ?? 13,
  theme: storedPrefs.theme ?? "system",
  effectiveTheme: resolveTheme(storedPrefs.theme ?? "system"),
  filesTheme: storedPrefs.filesTheme ?? "inherit",
  editorTheme: storedPrefs.editorTheme ?? "inherit",
  effectiveFilesTheme: resolveComponentTheme(storedPrefs.filesTheme ?? "inherit", resolveTheme(storedPrefs.theme ?? "system")),
  effectiveEditorTheme: resolveComponentTheme(storedPrefs.editorTheme ?? "inherit", resolveTheme(storedPrefs.theme ?? "system")),
  excalidrawTheme: storedPrefs.excalidrawTheme ?? "dark",
  canvasTheme: storedPrefs.canvasTheme ?? "dark",
  canvasShowDots: storedPrefs.canvasShowDots ?? true,
  canvasDotOpacity: storedPrefs.canvasDotOpacity ?? 50,
  canvasArrowSize: storedPrefs.canvasArrowSize ?? 12,
  canvasEdgeWidth: storedPrefs.canvasEdgeWidth ?? 2,
  canvasCardBgOpacity: storedPrefs.canvasCardBgOpacity ?? 15,
  canvasCardBorderStyle: storedPrefs.canvasCardBorderStyle ?? "dashed",
  canvasDefaultCardWidth: storedPrefs.canvasDefaultCardWidth ?? 300,
  canvasDefaultCardHeight: storedPrefs.canvasDefaultCardHeight ?? 150,
  canvasCalloutTailSize: storedPrefs.canvasCalloutTailSize ?? 18,
  canvasStickyRotation: storedPrefs.canvasStickyRotation ?? 1.5,
  canvasStickyColor: storedPrefs.canvasStickyColor ?? "#fef3c7",
  canvasStickyShadow: storedPrefs.canvasStickyShadow ?? 6,
  canvasStickyFoldSize: storedPrefs.canvasStickyFoldSize ?? 20,
  canvasStickyPin: storedPrefs.canvasStickyPin ?? false,
  canvasStickyTape: storedPrefs.canvasStickyTape ?? false,
  canvasStickyLines: typeof storedPrefs.canvasStickyLines === "number" ? storedPrefs.canvasStickyLines : storedPrefs.canvasStickyLines === true ? 10 : 0,
  canvasStickyCurl: typeof storedPrefs.canvasStickyCurl === "number" ? storedPrefs.canvasStickyCurl : storedPrefs.canvasStickyCurl === false ? 0 : 8,
  canvasStickyStripe: typeof storedPrefs.canvasStickyStripe === "number" ? storedPrefs.canvasStickyStripe : storedPrefs.canvasStickyStripe === false ? 0 : 6,
  canvasRoundedRadius: storedPrefs.canvasRoundedRadius ?? 24,
  canvasGroupFontFamily: storedPrefs.canvasGroupFontFamily ?? "sans-serif",
  canvasGroupFontSize: storedPrefs.canvasGroupFontSize ?? 13,
  canvasGroupBorderOpacity: storedPrefs.canvasGroupBorderOpacity ?? 50,
  canvasGroupBorderStyle: storedPrefs.canvasGroupBorderStyle ?? "dashed",
  canvasGroupFillOpacity: storedPrefs.canvasGroupFillOpacity ?? 15,
  canvasSelectionColor: storedPrefs.canvasSelectionColor ?? "#4a9eff",
  canvasSelectionWidth: storedPrefs.canvasSelectionWidth ?? 4,
  canvasPanelFontFamily: storedPrefs.canvasPanelFontFamily ?? DEFAULT_UI_FONT,
  canvasPanelFontSize: storedPrefs.canvasPanelFontSize ?? 12,
  canvasShowMinimap: storedPrefs.canvasShowMinimap ?? true,
  canvasSnapToGrid: storedPrefs.canvasSnapToGrid ?? false,
  canvasSnapGridSize: storedPrefs.canvasSnapGridSize ?? 20,
  canvasBackgroundVariant: storedPrefs.canvasBackgroundVariant ?? "dots",
  canvasNodeShadow: storedPrefs.canvasNodeShadow ?? 8,
  canvasFileBrowserWidth: storedPrefs.canvasFileBrowserWidth ?? 260,
  canvasDefaultEdgeType: storedPrefs.canvasDefaultEdgeType ?? "bezier",
  codeTheme: storedPrefs.codeTheme ?? "GitHub Dark",
  graphMode: "navigate",
  commandPaletteOpen: false,
  createNoteDialogOpen: false,
  createNoteOnCreatedCallback: null,
  createNoteInitialPath: null,
  createNoteInitialTitle: null,
  createNoteMode: "default",
  createFileKind: "note",
  createAndLinkSource: null,
  createNoteSaveAsBody: null,
  createNoteSaveAsTabId: null,
  convertToNoteOpen: false,
  convertToNoteTitle: "",
  convertToNoteBody: "",
  convertToNoteType: "concept",
  convertToNotePath: "",
  convertToNoteCallback: null,
  unsavedChangesDialogOpen: false,
  unsavedChangesTabId: null,
  createFolderDialogOpen: false,
  createFolderInitialPath: null,
  settingsOpen: false,
  settingsSize: storedPrefs.settingsSize ?? { width: 640, height: Math.round(window.innerHeight * 0.5) },
  settingsPosition: null,
  showEdgeLabels: false,
  showLegend: false,
  graphLayout: "force",
  focusMode: false,
  canvasFullscreen: null,
  activeLeftTab: "files",
  activeCanvasPath: null,
  videoPipPath: null,
  leftPanelCollapsed: false,
  treeExpandedFolders: new Set<string>(),
  fileSortOrder: storedPrefs.fileSortOrder ?? "name-asc" as FileSortOrder,
  autoRevealFile: storedPrefs.autoRevealFile ?? true,
  lineWrapping: storedPrefs.lineWrapping ?? true,
  spellCheck: storedPrefs.spellCheck ?? true,
  editorIndentSize: storedPrefs.editorIndentSize ?? 4,
  mermaidMaxHeight: storedPrefs.mermaidMaxHeight ?? DEFAULT_MERMAID_MAX_HEIGHT,
  moveDialogTarget: null,
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
  sourceStyle: storedPrefs.sourceStyle ?? "pill",
  exampleStyle: storedPrefs.exampleStyle ?? "pill",
  mathStyle: storedPrefs.mathStyle ?? "pill",
  attentionStyle: storedPrefs.attentionStyle ?? "pill",
  bulletStyle: storedPrefs.bulletStyle ?? "classic",
  boldWeight: storedPrefs.boldWeight ?? 700,
  boldTint: storedPrefs.boldTint ?? 35,
  italicTint: storedPrefs.italicTint ?? 35,
  arrowLigatures: storedPrefs.arrowLigatures ?? true,
  arrowEnabledTypes: storedPrefs.arrowEnabledTypes ?? [...ALL_ARROW_TYPES],
  arrowColor: storedPrefs.arrowColor ?? "accent",
  tooltipFontSize: storedPrefs.tooltipFontSize ?? DEFAULT_TOOLTIP_SIZE,
  tooltipPillSize: storedPrefs.tooltipPillSize ?? DEFAULT_TOOLTIP_PILL_SIZE,
  tooltipConnectionsSize: storedPrefs.tooltipConnectionsSize ?? DEFAULT_TOOLTIP_CONNECTIONS_SIZE,
  tooltipSummarySize: storedPrefs.tooltipSummarySize ?? DEFAULT_TOOLTIP_SUMMARY_SIZE,
  tooltipTagSize: storedPrefs.tooltipTagSize ?? DEFAULT_TOOLTIP_TAG_SIZE,
  nodeLabelSize: storedPrefs.nodeLabelSize ?? DEFAULT_NODE_LABEL_SIZE,
  nodeIconSize: storedPrefs.nodeIconSize ?? DEFAULT_NODE_ICON_SIZE,
  nodeLabelBgPadding: storedPrefs.nodeLabelBgPadding ?? DEFAULT_NODE_LABEL_BG_PADDING,
  edgeLabelSize: storedPrefs.edgeLabelSize ?? DEFAULT_EDGE_LABEL_SIZE,
  relatedNotesExpanded: storedPrefs.relatedNotesExpanded ?? false,
  emptyFolders: new Set<string>(),
  homeNotePath: null,
  customFileOrder: {},
  tabReloadKeys: new Map<string, number>(),

  bumpTabReloadKey: (path: string) => {
    set((s) => {
      const next = new Map(s.tabReloadKeys);
      next.set(path, (next.get(path) ?? 0) + 1);
      return { tabReloadKeys: next };
    });
  },

  setCustomFileOrder: (folderPath: string, orderedPaths: string[]) => {
    set((s) => ({
      customFileOrder: { ...s.customFileOrder, [folderPath]: orderedPaths },
    }));
  },

  saveCustomFileOrder: (segmentPath: string) => {
    try {
      const { customFileOrder } = get();
      if (Object.keys(customFileOrder).length === 0) {
        localStorage.removeItem(`brainmap:fileOrder:${segmentPath}`);
      } else {
        localStorage.setItem(`brainmap:fileOrder:${segmentPath}`, JSON.stringify(customFileOrder));
      }
    } catch { /* ignore persistence errors */ }
  },

  loadCustomFileOrder: (segmentPath: string) => {
    try {
      const raw = localStorage.getItem(`brainmap:fileOrder:${segmentPath}`);
      if (raw) {
        set({ customFileOrder: JSON.parse(raw) });
      } else {
        set({ customFileOrder: {} });
      }
    } catch {
      set({ customFileOrder: {} });
    }
  },

  clearCustomFileOrder: () => set({ customFileOrder: {} }),

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
  setHeaderLayout: (headerLayout: HeaderLayout) => {
    set({ headerLayout });
    savePrefs({ headerLayout });
  },
  setHeaderFontFamily: (headerFontFamily: string) => {
    set({ headerFontFamily });
    savePrefs({ headerFontFamily });
  },
  setHeaderFontSize: (headerFontSize: number) => {
    set({ headerFontSize });
    savePrefs({ headerFontSize });
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
  setExcalidrawTheme: (excalidrawTheme: "light" | "dark") => {
    set({ excalidrawTheme });
    savePrefs({ excalidrawTheme });
  },
  setCanvasTheme: (canvasTheme: "light" | "dark") => {
    set({ canvasTheme });
    savePrefs({ canvasTheme });
  },
  setCodeTheme: (codeTheme: string) => {
    set({ codeTheme });
    savePrefs({ codeTheme });
  },
  setCanvasShowDots: (canvasShowDots: boolean) => {
    set({ canvasShowDots });
    savePrefs({ canvasShowDots });
  },
  setCanvasDotOpacity: (canvasDotOpacity: number) => {
    set({ canvasDotOpacity });
    savePrefs({ canvasDotOpacity });
  },
  setCanvasArrowSize: (canvasArrowSize: number) => {
    set({ canvasArrowSize });
    savePrefs({ canvasArrowSize });
  },
  setCanvasEdgeWidth: (canvasEdgeWidth: number) => {
    set({ canvasEdgeWidth });
    savePrefs({ canvasEdgeWidth });
  },
  setCanvasCardBgOpacity: (canvasCardBgOpacity: number) => {
    set({ canvasCardBgOpacity });
    savePrefs({ canvasCardBgOpacity });
  },
  setCanvasCardBorderStyle: (canvasCardBorderStyle: string) => {
    set({ canvasCardBorderStyle });
    savePrefs({ canvasCardBorderStyle });
  },
  setCanvasDefaultCardWidth: (canvasDefaultCardWidth: number) => {
    set({ canvasDefaultCardWidth });
    savePrefs({ canvasDefaultCardWidth });
  },
  setCanvasDefaultCardHeight: (canvasDefaultCardHeight: number) => {
    set({ canvasDefaultCardHeight });
    savePrefs({ canvasDefaultCardHeight });
  },
  setCanvasCalloutTailSize: (canvasCalloutTailSize: number) => {
    set({ canvasCalloutTailSize });
    savePrefs({ canvasCalloutTailSize });
  },
  setCanvasStickyRotation: (canvasStickyRotation: number) => {
    set({ canvasStickyRotation });
    savePrefs({ canvasStickyRotation });
  },
  setCanvasStickyColor: (canvasStickyColor: string) => {
    set({ canvasStickyColor });
    savePrefs({ canvasStickyColor });
  },
  setCanvasStickyShadow: (canvasStickyShadow: number) => {
    set({ canvasStickyShadow });
    savePrefs({ canvasStickyShadow });
  },
  setCanvasStickyFoldSize: (canvasStickyFoldSize: number) => {
    set({ canvasStickyFoldSize });
    savePrefs({ canvasStickyFoldSize });
  },
  setCanvasStickyPin: (canvasStickyPin: boolean) => {
    set({ canvasStickyPin });
    savePrefs({ canvasStickyPin });
  },
  setCanvasStickyTape: (canvasStickyTape: boolean) => {
    set({ canvasStickyTape });
    savePrefs({ canvasStickyTape });
  },
  setCanvasStickyLines: (canvasStickyLines: number) => {
    set({ canvasStickyLines });
    savePrefs({ canvasStickyLines });
  },
  setCanvasStickyCurl: (canvasStickyCurl: number) => {
    set({ canvasStickyCurl });
    savePrefs({ canvasStickyCurl });
  },
  setCanvasStickyStripe: (canvasStickyStripe: number) => {
    set({ canvasStickyStripe });
    savePrefs({ canvasStickyStripe });
  },
  setCanvasRoundedRadius: (canvasRoundedRadius: number) => {
    set({ canvasRoundedRadius });
    savePrefs({ canvasRoundedRadius });
  },
  setCanvasGroupFontFamily: (canvasGroupFontFamily: string) => {
    set({ canvasGroupFontFamily });
    savePrefs({ canvasGroupFontFamily });
  },
  setCanvasGroupFontSize: (canvasGroupFontSize: number) => {
    set({ canvasGroupFontSize });
    savePrefs({ canvasGroupFontSize });
  },
  setCanvasGroupBorderOpacity: (canvasGroupBorderOpacity: number) => {
    set({ canvasGroupBorderOpacity });
    savePrefs({ canvasGroupBorderOpacity });
  },
  setCanvasGroupBorderStyle: (canvasGroupBorderStyle: string) => {
    set({ canvasGroupBorderStyle });
    savePrefs({ canvasGroupBorderStyle });
  },
  setCanvasGroupFillOpacity: (canvasGroupFillOpacity: number) => {
    set({ canvasGroupFillOpacity });
    savePrefs({ canvasGroupFillOpacity });
  },
  setCanvasSelectionColor: (canvasSelectionColor: string) => {
    set({ canvasSelectionColor });
    savePrefs({ canvasSelectionColor });
  },
  setCanvasSelectionWidth: (canvasSelectionWidth: number) => {
    set({ canvasSelectionWidth });
    savePrefs({ canvasSelectionWidth });
  },
  setCanvasPanelFontFamily: (canvasPanelFontFamily: string) => {
    set({ canvasPanelFontFamily });
    savePrefs({ canvasPanelFontFamily });
  },
  setCanvasPanelFontSize: (canvasPanelFontSize: number) => {
    set({ canvasPanelFontSize });
    savePrefs({ canvasPanelFontSize });
  },
  setCanvasShowMinimap: (canvasShowMinimap: boolean) => {
    set({ canvasShowMinimap });
    savePrefs({ canvasShowMinimap });
  },
  setCanvasSnapToGrid: (canvasSnapToGrid: boolean) => {
    set({ canvasSnapToGrid });
    savePrefs({ canvasSnapToGrid });
  },
  setCanvasSnapGridSize: (canvasSnapGridSize: number) => {
    set({ canvasSnapGridSize });
    savePrefs({ canvasSnapGridSize });
  },
  setCanvasBackgroundVariant: (canvasBackgroundVariant: string) => {
    set({ canvasBackgroundVariant });
    savePrefs({ canvasBackgroundVariant });
  },
  setCanvasNodeShadow: (canvasNodeShadow: number) => {
    set({ canvasNodeShadow });
    savePrefs({ canvasNodeShadow });
  },
  setCanvasFileBrowserWidth: (canvasFileBrowserWidth: number) => {
    set({ canvasFileBrowserWidth });
    savePrefs({ canvasFileBrowserWidth });
  },
  setCanvasDefaultEdgeType: (canvasDefaultEdgeType: string) => {
    set({ canvasDefaultEdgeType });
    savePrefs({ canvasDefaultEdgeType });
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
      set({ createNoteDialogOpen: true, createNoteInitialPath: pathOrOpts ?? null, createNoteInitialTitle: null, createNoteMode: "default", createFileKind: "note", createAndLinkSource: null, createNoteSaveAsBody: null, createNoteSaveAsTabId: null });
    } else {
      set({
        createNoteDialogOpen: true,
        createNoteInitialPath: pathOrOpts.initialPath ?? null,
        createNoteInitialTitle: pathOrOpts.initialTitle ?? null,
        createNoteMode: pathOrOpts.mode ?? "default",
        createFileKind: "note",
        createAndLinkSource: pathOrOpts.linkSource ?? null,
        createNoteSaveAsBody: pathOrOpts.saveAsBody ?? null,
        createNoteSaveAsTabId: pathOrOpts.saveAsTabId ?? null,
      });
    }
  },
  closeCreateNoteDialog: () => set({ createNoteDialogOpen: false, createNoteOnCreatedCallback: null, createNoteInitialPath: null, createNoteInitialTitle: null, createNoteMode: "default", createFileKind: "note", createAndLinkSource: null, createNoteSaveAsBody: null, createNoteSaveAsTabId: null }),
  openConvertToNote: ({ title, body, noteType, folderPath, callback }) => set({
    convertToNoteOpen: true,
    convertToNoteTitle: title,
    convertToNoteBody: body,
    convertToNoteType: noteType,
    convertToNotePath: folderPath,
    convertToNoteCallback: callback,
  }),
  closeConvertToNote: () => set({
    convertToNoteOpen: false,
    convertToNoteTitle: "",
    convertToNoteBody: "",
    convertToNoteType: "concept",
    convertToNotePath: "",
    convertToNoteCallback: null,
  }),
  openUnsavedChangesDialog: (tabId: string) => set({ unsavedChangesDialogOpen: true, unsavedChangesTabId: tabId }),
  closeUnsavedChangesDialog: () => set({ unsavedChangesDialogOpen: false, unsavedChangesTabId: null }),
  openCreateFolderDialog: (initialPath?: string) => set({ createFolderDialogOpen: true, createFolderInitialPath: initialPath ?? null }),
  closeCreateFolderDialog: () => set({ createFolderDialogOpen: false, createFolderInitialPath: null }),
  openSettings: () => set({ settingsOpen: true, settingsPosition: null }),
  closeSettings: () => set({ settingsOpen: false }),
  setSettingsSize: (size) => {
    set({ settingsSize: size });
    savePrefs({ settingsSize: size });
  },
  setSettingsPosition: (pos) => {
    set({ settingsPosition: pos });
  },

  toggleEdgeLabels: () => set((s) => ({ showEdgeLabels: !s.showEdgeLabels })),
  toggleLegend: () => set((s) => ({ showLegend: !s.showLegend })),
  setGraphLayout: (layout: GraphLayout) => set({ graphLayout: layout }),
  toggleFocusMode: () => set((s) => {
    const next = !s.focusMode;
    return { focusMode: next, leftPanelCollapsed: next };
  }),
  toggleCanvasFullscreen: (path?: string) => set((s) => ({
    canvasFullscreen: s.canvasFullscreen ? null : (path ?? null),
  })),
  setActiveLeftTab: (tab: LeftTab) => set({ activeLeftTab: tab, leftPanelCollapsed: false }),
  openCanvasInPanel: (path: string) => set({ activeCanvasPath: path, activeLeftTab: "canvas", leftPanelCollapsed: false }),
  openVideoPip: (path: string) => set({ videoPipPath: path }),
  closeVideoPip: () => set({ videoPipPath: null }),
  toggleLeftPanel: () => set((s) => ({ leftPanelCollapsed: !s.leftPanelCollapsed })),

  toggleFolder: (fullPath: string) =>
    set((s) => {
      const next = new Set(s.treeExpandedFolders);
      if (next.has(fullPath)) next.delete(fullPath);
      else next.add(fullPath);
      return { treeExpandedFolders: next };
    }),

  collapseAllFolders: () => set({ treeExpandedFolders: new Set<string>() }),

  setFileSortOrder: (order: FileSortOrder) => {
    set({ fileSortOrder: order });
    savePrefs({ fileSortOrder: order });
  },

  setAutoRevealFile: (v: boolean) => {
    set({ autoRevealFile: v });
    savePrefs({ autoRevealFile: v });
  },

  setLineWrapping: (v: boolean) => {
    set({ lineWrapping: v });
    savePrefs({ lineWrapping: v });
  },

  setSpellCheck: (v: boolean) => {
    set({ spellCheck: v });
    savePrefs({ spellCheck: v });
  },

  setEditorIndentSize: (v: number) => {
    set({ editorIndentSize: v });
    savePrefs({ editorIndentSize: v });
  },

  setMermaidMaxHeight: (v: number) => {
    set({ mermaidMaxHeight: v });
    savePrefs({ mermaidMaxHeight: v });
  },

  openMoveDialog: (target) => set({ moveDialogTarget: target }),
  closeMoveDialog: () => set({ moveDialogTarget: null }),

  expandPathToFile: (filePath: string) =>
    set((s) => {
      const segments = filePath.split("/").slice(0, -1); // parent dirs
      const next = new Set(s.treeExpandedFolders);
      let path = "";
      for (const seg of segments) {
        path = path ? `${path}/${seg}` : seg;
        next.add(path);
      }
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

  setSourceStyle: (v: SourceStyle) => {
    set({ sourceStyle: v });
    savePrefs({ sourceStyle: v });
  },

  setExampleStyle: (v: ExampleStyle) => {
    set({ exampleStyle: v });
    savePrefs({ exampleStyle: v });
  },

  setMathStyle: (v: MathStyle) => {
    set({ mathStyle: v });
    savePrefs({ mathStyle: v });
  },

  setAttentionStyle: (v: AttentionStyle) => {
    set({ attentionStyle: v });
    savePrefs({ attentionStyle: v });
  },

  setBulletStyle: (v: BulletStyle) => {
    set({ bulletStyle: v });
    savePrefs({ bulletStyle: v });
  },

  setBoldWeight: (v: number) => {
    set({ boldWeight: v });
    savePrefs({ boldWeight: v });
  },

  setBoldTint: (v: number) => {
    set({ boldTint: v });
    savePrefs({ boldTint: v });
  },

  setItalicTint: (v: number) => {
    set({ italicTint: v });
    savePrefs({ italicTint: v });
  },

  setArrowLigatures: (v: boolean) => {
    set({ arrowLigatures: v });
    savePrefs({ arrowLigatures: v });
  },

  toggleArrowType: (t: ArrowType) => {
    const current = get().arrowEnabledTypes;
    const next = current.includes(t)
      ? current.filter((x) => x !== t)
      : [...current, t];
    set({ arrowEnabledTypes: next });
    savePrefs({ arrowEnabledTypes: next });
  },

  setArrowColor: (v: ArrowColorStyle) => {
    set({ arrowColor: v });
    savePrefs({ arrowColor: v });
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
    const edgeLabel = Math.max(4, Math.round(DEFAULT_EDGE_LABEL_SIZE * scale));
    set({ nodeIconSize: v, nodeLabelSize: label, nodeLabelBgPadding: bgPad, edgeLabelSize: edgeLabel });
    savePrefs({ nodeIconSize: v, nodeLabelSize: label, nodeLabelBgPadding: bgPad, edgeLabelSize: edgeLabel });
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
  setEdgeLabelSize: (v: number) => {
    set({ edgeLabelSize: v });
    savePrefs({ edgeLabelSize: v });
  },
  resetNodePrefs: () => {
    set({ nodeLabelSize: DEFAULT_NODE_LABEL_SIZE, nodeIconSize: DEFAULT_NODE_ICON_SIZE, nodeLabelBgPadding: DEFAULT_NODE_LABEL_BG_PADDING, edgeLabelSize: DEFAULT_EDGE_LABEL_SIZE });
    savePrefs({ nodeLabelSize: DEFAULT_NODE_LABEL_SIZE, nodeIconSize: DEFAULT_NODE_ICON_SIZE, nodeLabelBgPadding: DEFAULT_NODE_LABEL_BG_PADDING, edgeLabelSize: DEFAULT_EDGE_LABEL_SIZE });
  },

  resetWorkspaceState: () => set({
    hiddenEdgeTypes: new Set<string>(),
    graphFocusPath: null,
    graphFocusKind: null,
    emptyFolders: new Set<string>(),
    treeExpandedFolders: new Set<string>(),
    activeLeftTab: "files" as LeftTab,
    activeCanvasPath: null,
    leftPanelCollapsed: false,
    homeNotePath: null,
    customFileOrder: {},
    tabReloadKeys: new Map<string, number>(),
  }),

  resetFontPrefs: () => {
    const { theme, effectiveTheme, uiZoom } = get();
    set({ uiFontFamily: DEFAULT_UI_FONT, uiFontSize: DEFAULT_UI_SIZE, editorFontFamily: DEFAULT_EDITOR_FONT, editorFontSize: DEFAULT_EDITOR_SIZE, showLineNumbers: false, filesTheme: "inherit", editorTheme: "inherit", effectiveFilesTheme: effectiveTheme, effectiveEditorTheme: effectiveTheme, tooltipFontSize: DEFAULT_TOOLTIP_SIZE, tooltipPillSize: DEFAULT_TOOLTIP_PILL_SIZE, tooltipConnectionsSize: DEFAULT_TOOLTIP_CONNECTIONS_SIZE, tooltipSummarySize: DEFAULT_TOOLTIP_SUMMARY_SIZE, tooltipTagSize: DEFAULT_TOOLTIP_TAG_SIZE, nodeLabelSize: DEFAULT_NODE_LABEL_SIZE, nodeIconSize: DEFAULT_NODE_ICON_SIZE, nodeLabelBgPadding: DEFAULT_NODE_LABEL_BG_PADDING, edgeLabelSize: DEFAULT_EDGE_LABEL_SIZE });
    savePrefs({ theme, uiFontFamily: DEFAULT_UI_FONT, uiFontSize: DEFAULT_UI_SIZE, editorFontFamily: DEFAULT_EDITOR_FONT, editorFontSize: DEFAULT_EDITOR_SIZE, editorLineNumbers: false, uiZoom, filesTheme: "inherit", editorTheme: "inherit", tooltipFontSize: DEFAULT_TOOLTIP_SIZE, tooltipPillSize: DEFAULT_TOOLTIP_PILL_SIZE, tooltipConnectionsSize: DEFAULT_TOOLTIP_CONNECTIONS_SIZE, tooltipSummarySize: DEFAULT_TOOLTIP_SUMMARY_SIZE, tooltipTagSize: DEFAULT_TOOLTIP_TAG_SIZE, nodeLabelSize: DEFAULT_NODE_LABEL_SIZE, nodeIconSize: DEFAULT_NODE_ICON_SIZE, nodeLabelBgPadding: DEFAULT_NODE_LABEL_BG_PADDING, edgeLabelSize: DEFAULT_EDGE_LABEL_SIZE });
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

  toggleRelatedNotes: () => {
    const next = !get().relatedNotesExpanded;
    set({ relatedNotesExpanded: next });
    savePrefs({ relatedNotesExpanded: next });
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
