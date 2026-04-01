# 2026-03-14 — Subagent Transcript: Explore

**Date:** 2026-03-14 15:58:53
**Agent:** Explore
**Agent ID:** aa9f3595b563dbef2
**Parent Session:** 1eaf9c8b-9552-4a4e-a53c-e9b30f5c09cc

---

## User

Explore the Settings modal and UI preferences system in the BrainMap desktop app. I need to understand:

1. The SettingsModal component — its structure, what settings it already has, how sections are organized
2. The `uiPrefs` / `PersistedPrefs` type — what fields exist, how they're persisted to localStorage
3. How existing font settings work (Editor font family/size, Interface font family/size) — the full flow from state → CSS application
4. The `uiStore` — how prefs are loaded, saved, and applied (look for `loadPersistedPrefs`, `savePersistedPrefs`, or similar)

Search in `crates/app/src/` — look at stores/uiStore.ts, components/Settings/SettingsModal.tsx, and any related files. Be thorough.

---

## Assistant

I'll explore the Settings modal and UI preferences system in the BrainMap desktop app. Let me start by searching for the relevant files.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*Settings*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*uiStore*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*Prefs*"}`

---

## Assistant

Good. Now let me read the key files to understand the Settings modal and UI preferences system.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.test.ts"}`

---

## Assistant

Now let me look for how the font preferences are applied to the DOM and any CSS-related files:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*.tsx\" -o -name \"*.ts\" | xargs grep -l \"uiFontFamily\\|editorFontFamily\\|--ui-font\\|--editor-font\" | head -20`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*App.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.css"}`

---

## Assistant

Let me read the App.tsx and the CSS file to understand how font prefs are applied:

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

Let me read the CSS file in sections, focusing on font settings:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"font\\|--ui-font\\|--editor-font\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -40"}`

---

## Assistant

Now let me check the MarkdownEditor component to see how editor font is applied there:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"editorFontFamily\\|editorFontSize\\|--editor-font\\|CodeMirror\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx | head -50"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx","offset":1,"limit":100}`

---

## Assistant

Let me continue reading the MarkdownEditor to see how font styles are applied:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx","offset":100,"limit":150}`

---

## Assistant

Now let me check where CSS variables are actually used for the editor component itself:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"\\.cm-\\|--editor-font-size\\|--editor-font-family\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -50"}`

---

## Assistant

Perfect. Now let me also check what's in the API bridge to understand the full picture, and look at any related preferences files:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f \\( -name \"*.ts\" -o -name \"*.tsx\" \\) | xargs grep -l \"loadStoredPrefs\\|savePrefs\\|PersistedPrefs\" | head -1`

---

## Assistant

Let me verify if there's any component or hook that applies the font to the root element:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -rn \"setProperty.*--ui-font\\|setProperty.*--editor-font\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

Perfect. Now let me get a clearer view of the structure by looking at the relevant sections of App.css more carefully:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1,"limit":100}`

---

## Assistant

Excellent! Now let me compile a comprehensive report. Let me also quickly check what happens when font presets are selected:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 20 \"FontFamilySelect\\|FONT_PRESETS\\|getDefaultTabSizes\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts | head -80"}`

---

## Assistant

Perfect. Now I have all the information I need. Let me compile a comprehensive exploration report.

## Settings Modal and UI Preferences System — Comprehensive Exploration

I've thoroughly explored the Settings modal, UI preferences, and font system in the BrainMap desktop app. Here's the complete breakdown:

### 1. SettingsModal Component Structure

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx`

The modal has 5 sections organized vertically:

1. **Appearance** (theme settings)
   - Main theme: Light, Dark, Dracula, Solarized Light, Solarized Dark, Nord, Tokyo Night, One Dark, or System (inherits OS preference)
   - Files Panel: Inherit (from main) or override with any theme
   - Editor Panel: Inherit (from main) or override with any theme

2. **Panel Layout** (per-tab split proportions)
   - Separate sliders for Files, Graph, and Search tabs
   - Each slider controls content/editor split (10%-90%, in 5% steps)
   - Displays percentage breakdown: "25% / 75%" etc.
   - "Reset layout to defaults" button clears custom settings

3. **Editor Font** section
   - Family: FontFamilySelect dropdown with preset groups (sans-serif, serif, monospace) + custom text input
   - Size: Range slider 10-28px (1px steps)
   - Line numbers: Checkbox "Show by default"

4. **Interface Font** section
   - Family: FontFamilySelect with same presets
   - Size: Range slider 10-20px (1px steps)

5. **Universal reset button**
   - "Reset fonts to defaults" affects both font families, sizes, line numbers, and component themes

---

### 2. The `PersistedPrefs` Type & Persistence Layer

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts` (lines 102-113)

```typescript
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
}
```

**Persistence Flow:**
- **Load:** `loadStoredPrefs()` (line 267) reads from `localStorage.getItem("brainmap:uiPrefs")`, falls back to empty object
- **Save:** `savePrefs(prefs: PersistedPrefs)` (line 275) **merges** with existing stored prefs via `{ ...existing, ...prefs }` to preserve keys not explicitly being updated
- **Storage Key:** `"brainmap:uiPrefs"` — one single JSON blob

Also tracked separately:
- **Panel sizes:** `localStorage.getItem("brainmap:panelSizes")` — stores per-tab split sizes (migrates old flat keys to per-tab format)
- **Segments:** `localStorage.getItem("brainmap:segments")` — workspace list

---

### 3. Font Settings: Defaults, Presets, and Application

**Defaults (uiStore.ts, lines 56-59):**
- UI Font: System Default (first preset, sans-serif stack)
- UI Font Size: 13px
- Editor Font: System Mono (monospace stack)
- Editor Font Size: 14px

**Font Presets (uiStore.ts, lines 31-51):**
- 14 built-in presets organized in 4 categories:
  - **Sans-serif (5):** System Default, Inter, Helvetica Neue, SF Pro, Roboto
  - **Serif (3):** Georgia, Lora, Merriweather
  - **Monospace (6):** System Mono, JetBrains Mono, Fira Code, Cascadia Code, Source Code Pro, IBM Plex Mono
  - **Custom:** Allows any arbitrary CSS font-family string

**FontFamilySelect Component Logic (SettingsModal.tsx, lines 4-44):**
- Dropdown groups presets by category using HTML `<optgroup>`
- When user selects a preset, it stores the full CSS font-family value (e.g., `"'Inter', system-ui, sans-serif"`)
- If value doesn't match any preset, shows "Custom" selected
- When Custom is selected, reveals a text input for arbitrary font string
- Users can enter anything: e.g., `'Operator Mono', monospace` with optional fallback chain

---

### 4. Complete Font Flow: State → CSS Application

#### A. State Management (Zustand in uiStore.ts)

**Initial Load (lines 284-325):**
```typescript
uiFontFamily: storedPrefs.uiFontFamily ?? DEFAULT_UI_FONT,
uiFontSize: storedPrefs.uiFontSize ?? DEFAULT_UI_SIZE,
editorFontFamily: storedPrefs.editorFontFamily ?? DEFAULT_EDITOR_FONT,
editorFontSize: storedPrefs.editorFontSize ?? DEFAULT_EDITOR_SIZE,
```

Zustand store holds 4 font values in memory as reactive state.

**Setters (uiStore.ts, lines 432-454):**
Each setter:
1. Updates Zustand state immediately via `set()`
2. Calls `savePrefs()` to persist to localStorage
3. Full state is re-saved each time (all theme, font, zoom, defaultTabSizes keys)

```typescript
setUIFontFamily: (v: string) => {
  set({ uiFontFamily: v });
  const s = get();
  savePrefs({ theme: s.theme, uiFontFamily: v, uiFontSize: s.uiFontSize, ... });
}
```

#### B. CSS Variable Application (App.tsx, lines 268-274)

In the root App component, a `useEffect` watches all four font values and applies them as CSS custom properties on `<html>` element:

```typescript
useEffect(() => {
  const root = document.documentElement;
  root.style.setProperty("--ui-font-family", uiFontFamily);
  root.style.setProperty("--ui-font-size", `${uiFontSize}px`);
  root.style.setProperty("--editor-font-family", editorFontFamily);
  root.style.setProperty("--editor-font-size", `${editorFontSize}px`);
}, [uiFontFamily, uiFontSize, editorFontFamily, editorFontSize]);
```

Default values are set in CSS (App.css, lines 17-20) as fallbacks:
```css
--ui-font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--ui-font-size: 13px;
--editor-font-family: ui-monospace, 'Menlo', 'Monaco', 'Consolas', monospace;
--editor-font-size: 14px;
```

#### C. Usage in Components

**UI Font (most of the app):**
- Applied globally on `<body>` (App.css, line 208):
```css
body {
  font-family: var(--ui-font-family);
  font-size: var(--ui-font-size);
}
```
- Derived sizes also available: `--ui-font-lg` (base + 1px), `--ui-font-sm` (base - 1px), `--ui-font-xs` (base - 2px)
- Recomputed in a separate `:root` rule (lines 33-36) so derived vars re-evaluate if base size changes

**Editor Font (CodeMirror):**
- Applied with `!important` to override CodeMirror defaults (App.css, lines 1084-1087):
```css
.editor-body .cm-editor .cm-content,
.editor-body .cm-editor .cm-line {
  font-family: var(--editor-font-family) !important;
  font-size: var(--editor-font-size) !important;
}
```
- CodeMirror 6 sets its own inline font styles, so `!important` is necessary
- MarkdownEditor component also reads these values (lines 72-73) but font is applied purely via CSS, not inline styles

---

### 5. The `uiStore` — Complete State & Methods

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`

**What's in the store (UIState interface, lines 131-218):**
- All font values and theme settings
- Dialog open/close flags (settings, create note, create folder, command palette, etc.)
- Graph visualization toggles (minimap, cluster hulls, edge particles, edge labels, legend)
- Layout state (active left tab, panel collapsed, tree expanded folders, hidden edge types, panel sizes)
- Focus mode state (graphFocusPath, graphFocusKind)
- Many action methods (all the setters and toggles)

**Font-related actions:**
- `setUIFontFamily(v)` — updates UI font, saves prefs
- `setUIFontSize(v)` — updates UI size, saves prefs
- `setEditorFontFamily(v)` — updates editor font, saves prefs
- `setEditorFontSize(v)` — updates editor size, saves prefs
- `resetFontPrefs()` — resets fonts + line numbers + component themes to defaults, saves prefs
- `setDefaultTabSize(tab, content)` — sets per-tab layout default and updates current panel sizes
- `resetLayoutPrefs()` — clears `defaultTabSizes` from prefs, clears `panelSizes` from localStorage

**Load/Save Pattern:**
- `loadStoredPrefs()` and `loadStoredSizes()` called **at module load time** (outside the create function)
- Zustand store initialized with loaded values
- Every setter calls `savePrefs()` which merges with existing stored data to preserve unmodified keys

---

### 6. Key Design Decisions

1. **Merge-on-save:** `savePrefs()` merges incoming prefs with existing stored data, so only changed keys are explicitly saved while others persist. Prevents data loss if one setter forgets to include all keys.

2. **CSS variables for real-time updates:** Changes to font values immediately propagate to CSS vars on `documentElement`, which all elements inherit. No component re-renders needed beyond the App-level `useEffect`.

3. **Per-tab panel sizes:** Each left sidebar tab (Files, Graph, Search) can have different content/editor proportions. Stored in `panelSizes` object under tab keys. Built-in defaults in `BUILTIN_TAB_SIZES` constant.

4. **Custom font support:** Via FontFamilySelect — when "Custom" is selected, users can type any CSS font-family string. Useful for fonts not in the preset list.

5. **Line numbers and component themes:** Grouped in `resetFontPrefs()` action (not in a separate section), implying they're considered "font preferences" along with the families/sizes.

6. **localStorage optimization:** Two separate keys (`"brainmap:uiPrefs"` and `"brainmap:panelSizes"`) keep concerns separated, though panel sizes are also stored under `defaultTabSizes` in the prefs object for use as defaults when switching tabs.

---

### 7. Relevant File Paths

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx` — Modal UI, 222 lines
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts` — Zustand store, 533 lines
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.test.ts` — Tests (396 lines)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx` — Font CSS var application (lines 268-274), 310 lines total
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` — CSS defaults and font var usage, 25K+ lines
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx` — CodeMirror integration, reads font values from store (lines 72-73)

---

This system is well-architected: localStorage persists all preferences, Zustand manages reactive state, CSS variables enable instant updates across the entire app, and the modal provides an Obsidian-like UI for discovery and adjustment.

---

