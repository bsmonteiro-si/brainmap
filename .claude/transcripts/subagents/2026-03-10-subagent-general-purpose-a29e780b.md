# 2026-03-10 — Subagent Transcript: general-purpose

**Date:** 2026-03-10 13:59:41
**Agent:** general-purpose
**Agent ID:** a29e780b64979b966
**Parent Session:** e775a4b6-ec6a-4752-8126-0b07a473af0a

---

## User

You are reviewing TypeScript/React code for BrainMap, a knowledge graph desktop app (Tauri + React + Zustand). The project uses TypeScript strict mode.

Your job is to find real defects, not style nits.

## Review Criteria

### 1. Correctness
- Are there logic bugs? Missed conditions?
- Does state management handle all cases correctly?
- Are React effects correctly cleaning up?
- Are there any stale closure issues?

### 2. TypeScript Quality
- Are types used correctly? Any unsafe `as` casts?
- Are `const` arrays used where appropriate?
- Are prop types correctly defined?

### 3. Function Design
- Is each function doing one thing?
- Are names descriptive?

### 4. Component Design
- Are effects correctly set up (deps arrays)?
- Any potential memory leaks?
- Edge cases handled?

### 5. Accessibility
- Are interactive elements accessible?

## Output Format

Write findings as a list. For each finding:
- **File**: path and line reference
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

If a file has no issues, say so briefly. Do NOT report style preferences.

---

## Files Changed

### 1. `crates/app/src/stores/uiStore.ts` (full new content)

```typescript
import { create } from "zustand";

type Theme = "light" | "dark" | "system";
type GraphMode = "navigate" | "edit";
type GraphLayout = "force" | "hierarchical";

export const UI_FONT_PRESETS = [
  { label: "System Default", value: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  { label: "Inter",          value: "'Inter', system-ui, sans-serif" },
  { label: "Georgia",        value: "Georgia, 'Times New Roman', serif" },
  { label: "Custom",         value: "custom" },
] as const;

export const EDITOR_FONT_PRESETS = [
  { label: "System Mono",    value: "ui-monospace, 'Menlo', 'Monaco', 'Consolas', monospace" },
  { label: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
  { label: "Fira Code",      value: "'Fira Code', monospace" },
  { label: "Cascadia Code",  value: "'Cascadia Code', monospace" },
  { label: "Custom",         value: "custom" },
] as const;

const DEFAULT_UI_FONT = UI_FONT_PRESETS[0].value;
const DEFAULT_EDITOR_FONT = EDITOR_FONT_PRESETS[0].value;
const DEFAULT_UI_SIZE = 13;
const DEFAULT_EDITOR_SIZE = 14;

interface PanelSizes {
  graph?: number;
  right?: number;
  editor?: number;
  inspector?: number;
  search?: number;
}

interface PersistedPrefs {
  theme?: Theme;
  uiFontFamily?: string;
  uiFontSize?: number;
  editorFontFamily?: string;
  editorFontSize?: number;
}

interface UIState {
  theme: Theme;
  effectiveTheme: "light" | "dark";
  graphMode: GraphMode;
  commandPaletteOpen: boolean;
  createNoteDialogOpen: boolean;
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
  uiFontFamily: string;
  uiFontSize: number;
  editorFontFamily: string;
  editorFontSize: number;

  setTheme: (theme: Theme) => void;
  toggleGraphMode: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openCreateNoteDialog: () => void;
  closeCreateNoteDialog: () => void;
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
  setGraphFocus: (path: string, kind: "note" | "folder") => void;
  clearGraphFocus: () => void;
  setUIFontFamily: (v: string) => void;
  setUIFontSize: (v: number) => void;
  setEditorFontFamily: (v: string) => void;
  setEditorFontSize: (v: number) => void;
  resetFontPrefs: () => void;
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
  settingsOpen: false,
  showEdgeLabels: false,
  showLegend: false,
  graphLayout: "force",
  focusMode: false,
  treeOpen: false,
  treeExpandedFolders: new Set<string>(),
  hiddenEdgeTypes: new Set<string>(),
  panelSizes: storedSizes,
  graphFocusPath: null,
  graphFocusKind: null,
  uiFontFamily: storedPrefs.uiFontFamily ?? DEFAULT_UI_FONT,
  uiFontSize: storedPrefs.uiFontSize ?? DEFAULT_UI_SIZE,
  editorFontFamily: storedPrefs.editorFontFamily ?? DEFAULT_EDITOR_FONT,
  editorFontSize: storedPrefs.editorFontSize ?? DEFAULT_EDITOR_SIZE,

  setTheme: (theme: Theme) => {
    set({ theme, effectiveTheme: resolveTheme(theme) });
    const s = get();
    savePrefs({ theme, uiFontFamily: s.uiFontFamily, uiFontSize: s.uiFontSize, editorFontFamily: s.editorFontFamily, editorFontSize: s.editorFontSize });
  },

  toggleGraphMode: () => {
    set((state) => ({
      graphMode: state.graphMode === "navigate" ? "edit" : "navigate",
    }));
  },

  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  openCreateNoteDialog: () => set({ createNoteDialogOpen: true }),
  closeCreateNoteDialog: () => set({ createNoteDialogOpen: false }),
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

  setGraphFocus: (path, kind) => set({ graphFocusPath: path, graphFocusKind: kind, treeOpen: false }),
  clearGraphFocus: () => set({ graphFocusPath: null, graphFocusKind: null }),

  setUIFontFamily: (v: string) => {
    set({ uiFontFamily: v });
    const s = get();
    savePrefs({ theme: s.theme, uiFontFamily: v, uiFontSize: s.uiFontSize, editorFontFamily: s.editorFontFamily, editorFontSize: s.editorFontSize });
  },

  setUIFontSize: (v: number) => {
    set({ uiFontSize: v });
    const s = get();
    savePrefs({ theme: s.theme, uiFontFamily: s.uiFontFamily, uiFontSize: v, editorFontFamily: s.editorFontFamily, editorFontSize: s.editorFontSize });
  },

  setEditorFontFamily: (v: string) => {
    set({ editorFontFamily: v });
    const s = get();
    savePrefs({ theme: s.theme, uiFontFamily: s.uiFontFamily, uiFontSize: s.uiFontSize, editorFontFamily: v, editorFontSize: s.editorFontSize });
  },

  setEditorFontSize: (v: number) => {
    set({ editorFontSize: v });
    const s = get();
    savePrefs({ theme: s.theme, uiFontFamily: s.uiFontFamily, uiFontSize: s.uiFontSize, editorFontFamily: s.editorFontFamily, editorFontSize: v });
  },

  resetFontPrefs: () => {
    set({ uiFontFamily: DEFAULT_UI_FONT, uiFontSize: DEFAULT_UI_SIZE, editorFontFamily: DEFAULT_EDITOR_FONT, editorFontSize: DEFAULT_EDITOR_SIZE });
    const s = get();
    savePrefs({ theme: s.theme, uiFontFamily: DEFAULT_UI_FONT, uiFontSize: DEFAULT_UI_SIZE, editorFontFamily: DEFAULT_EDITOR_FONT, editorFontSize: DEFAULT_EDITOR_SIZE });
  },
}));
```

### 2. `crates/app/src/components/Settings/SettingsModal.tsx` (new file)

```tsx
import { useEffect } from "react";
import { useUIStore, UI_FONT_PRESETS, EDITOR_FONT_PRESETS } from "../../stores/uiStore";

export function SettingsModal() {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const closeSettings = useUIStore((s) => s.closeSettings);
  const uiFontFamily = useUIStore((s) => s.uiFontFamily);
  const uiFontSize = useUIStore((s) => s.uiFontSize);
  const editorFontFamily = useUIStore((s) => s.editorFontFamily);
  const editorFontSize = useUIStore((s) => s.editorFontSize);
  const setUIFontFamily = useUIStore((s) => s.setUIFontFamily);
  const setUIFontSize = useUIStore((s) => s.setUIFontSize);
  const setEditorFontFamily = useUIStore((s) => s.setEditorFontFamily);
  const setEditorFontSize = useUIStore((s) => s.setEditorFontSize);
  const resetFontPrefs = useUIStore((s) => s.resetFontPrefs);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSettings();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeSettings]);

  // Determine if the current value matches a named preset or is custom
  const uiFontPresetValue =
    UI_FONT_PRESETS.find((p) => p.value !== "custom" && p.value === uiFontFamily)?.value ?? "custom";
  const editorFontPresetValue =
    EDITOR_FONT_PRESETS.find((p) => p.value !== "custom" && p.value === editorFontFamily)?.value ?? "custom";

  const isUICustom = uiFontPresetValue === "custom";
  const isEditorCustom = editorFontPresetValue === "custom";

  return (
    <div className="settings-overlay" onClick={closeSettings}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <span>Settings</span>
          <button onClick={closeSettings} title="Close">×</button>
        </div>

        <div className="settings-body">
          {/* ── Appearance ── */}
          <div className="settings-section">
            <div className="settings-section-title">Appearance</div>
            <div className="settings-row">
              <span className="settings-label">Theme</span>
              <div className="settings-control">
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Editor Font ── */}
          <div className="settings-section">
            <div className="settings-section-title">Editor Font</div>
            <div className="settings-row">
              <span className="settings-label">Family</span>
              <div className="settings-control">
                <select
                  value={editorFontPresetValue}
                  onChange={(e) => {
                    if (e.target.value === "custom") {
                      setEditorFontFamily("");
                    } else {
                      setEditorFontFamily(e.target.value);
                    }
                  }}
                >
                  {EDITOR_FONT_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                {isEditorCustom && (
                  <input
                    type="text"
                    placeholder="e.g. 'Operator Mono', monospace"
                    value={editorFontFamily}
                    onChange={(e) => setEditorFontFamily(e.target.value)}
                  />
                )}
              </div>
            </div>
            <div className="settings-row">
              <span className="settings-label">Size</span>
              <div className="settings-control">
                <div className="settings-size-row">
                  <input
                    type="range"
                    min={10}
                    max={28}
                    step={1}
                    value={editorFontSize}
                    onChange={(e) => setEditorFontSize(Number(e.target.value))}
                  />
                  <span className="settings-size-value">{editorFontSize}px</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Interface Font ── */}
          <div className="settings-section">
            <div className="settings-section-title">Interface Font</div>
            <div className="settings-row">
              <span className="settings-label">Family</span>
              <div className="settings-control">
                <select
                  value={uiFontPresetValue}
                  onChange={(e) => {
                    if (e.target.value === "custom") {
                      setUIFontFamily("");
                    } else {
                      setUIFontFamily(e.target.value);
                    }
                  }}
                >
                  {UI_FONT_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                {isUICustom && (
                  <input
                    type="text"
                    placeholder="e.g. 'Helvetica Neue', sans-serif"
                    value={uiFontFamily}
                    onChange={(e) => setUIFontFamily(e.target.value)}
                  />
                )}
              </div>
            </div>
            <div className="settings-row">
              <span className="settings-label">Size</span>
              <div className="settings-control">
                <div className="settings-size-row">
                  <input
                    type="range"
                    min={10}
                    max={20}
                    step={1}
                    value={uiFontSize}
                    onChange={(e) => setUIFontSize(Number(e.target.value))}
                  />
                  <span className="settings-size-value">{uiFontSize}px</span>
                </div>
              </div>
            </div>
          </div>

          <button className="settings-reset" onClick={resetFontPrefs}>
            Reset fonts to defaults
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 3. `crates/app/src/App.tsx` (modified — showing new additions only)

New subscriptions added:
```typescript
const settingsOpen = useUIStore((s) => s.settingsOpen);
const uiFontFamily = useUIStore((s) => s.uiFontFamily);
const uiFontSize = useUIStore((s) => s.uiFontSize);
const editorFontFamily = useUIStore((s) => s.editorFontFamily);
const editorFontSize = useUIStore((s) => s.editorFontSize);
```

New effect added:
```typescript
useEffect(() => {
  const root = document.documentElement;
  root.style.setProperty("--ui-font-family", uiFontFamily);
  root.style.setProperty("--ui-font-size", `${uiFontSize}px`);
  root.style.setProperty("--editor-font-family", editorFontFamily);
  root.style.setProperty("--editor-font-size", `${editorFontSize}px`);
}, [uiFontFamily, uiFontSize, editorFontFamily, editorFontSize]);
```

New shortcut added in handleKeyDown:
```typescript
if (isMod && e.key === ",") {
  e.preventDefault();
  useUIStore.getState().openSettings();
}
```

Modal mounted conditionally:
```tsx
{settingsOpen && <SettingsModal />}
```

### 4. `crates/app/src/components/StatusBar/StatusBar.tsx` (modified)

Gear button added as last item with `marginLeft: "auto"` to right-align:
```tsx
<button
  className="status-bar-btn"
  style={{ marginLeft: "auto" }}
  onClick={() => useUIStore.getState().openSettings()}
  title="Settings (⌘,)"
>
  ⚙
</button>
```

---

Please write your review findings to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/settings-modal-review-1.md`.

Focus especially on:
1. Whether `resetFontPrefs` reads stale state (the `set()` + `get()` pattern in Zustand)
2. Whether the preset matching logic in SettingsModal handles all edge cases
3. Whether the CSS `.cm-editor .cm-content` override is the correct targeting for CodeMirror 6
4. Any event handling issues in SettingsModal (Escape + overlay click)

---

## Assistant

I'll review the code carefully and write findings to the specified file.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ 2>/dev/null || mkdir -p /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/","description":"Ensure review`

---

## Assistant

Now let me look at some existing files to understand the full context before writing the review.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.{ts,tsx,css}","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/StatusBar/StatusBar.tsx"}`

---

## Assistant

Now I have a thorough understanding of all the files. Let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/settings-modal-review-1.md","content":"# Code Review: Settings Modal — Pass 1\n\nReviewed files:\n- `crates/app/src/store`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/settings-modal-review-1.md`.

Here is a summary of the findings:

**bug (minor)**
1. `uiStore.ts` — `resetFontPrefs` calls `set()` then immediately `get()` to build the `savePrefs` payload. In Zustand `set` is synchronous so it does not produce incorrect output today, but the pattern is fragile. The fix is to read `theme` from `get()` *before* `set()` so the code does not depend on Zustand's synchronous-set guarantee.

**should-fix**
2. `uiStore.ts` — `setGraphFocus` hardcodes `treeOpen: false`, which collapses the tree panel unconditionally whenever any "Focus in Graph" action fires. This is a silent behaviour regression; the store should not own that side-effect.

3. `SettingsModal.tsx` + `App.tsx` — Two separate `keydown` listeners handle `Escape`: one in the modal (closes settings), one in `App.tsx` (handles focus mode and command palette). Both fire simultaneously on a single keypress. The fix is to handle `settingsOpen` in the single unified `handleKeyDown` in `App.tsx` and remove the local `useEffect` from `SettingsModal`.

5. `App.css` — The editor font CSS targets `.editor-body .cm-editor`. In CodeMirror 6, text is rendered in `.cm-content`, which has its own explicit `font-family` set by CodeMirror's internal style module, potentially with higher specificity. The safe fix is to also target `.cm-editor .cm-content`, or preferably apply the font via an `EditorView.theme()` extension inside `MarkdownEditor.tsx`.

7. `SettingsModal.tsx` — The close button (`×`) has a `title` attribute but no `aria-label`, so screen readers announce it as "×". Fix: add `aria-label="Close settings"`.

**suggestion (non-blocking)**
4. The `p.value !== "custom"` guard in preset matching is correct but lacks a comment explaining why.
6. The `overflow-y: auto` modal can be accidentally dismissed if the user scrolls and releases outside the modal bounds — unlikely with current modal size.
8. The `handleKeyDown` empty-deps + `getState()` pattern is correct and consistent — no issue.

---

