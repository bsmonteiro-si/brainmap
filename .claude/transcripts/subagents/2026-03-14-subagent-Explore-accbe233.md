# 2026-03-14 — Subagent Transcript: Explore

**Date:** 2026-03-14 12:38:40
**Agent:** Explore
**Agent ID:** accbe233e09a04368
**Parent Session:** 7efd5401-1fe4-4b9e-9cc0-e72fbea84b8d

---

## User

Explore the BrainMap desktop app codebase at /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/

I need to understand:

1. **CodeMirror editor setup**: Find where CodeMirror is initialized/configured. Look for extensions, the main editor component, and how the editor instance is created. I need to know if `lineNumbers()` extension is already used or not.

2. **Settings modal**: Find the SettingsModal component and understand how settings/preferences are structured. Look at the `uiStore` or preferences store to see how settings like `autoSave`, font settings, theme etc. are persisted. I need to know the exact structure of `PersistedPrefs` or similar.

3. **Editor toolbar**: Find the EditorToolbar component to understand how toggle buttons work in the editor area.

4. **Any existing toggle patterns**: Look for patterns where a UI element can be toggled via both a button and a setting (like the auto-save toggle pattern).

Be thorough - search for files like EditorPanel, EditorToolbar, SettingsModal, uiStore, and any CodeMirror configuration files.

---

## Assistant

I'll explore the BrainMap desktop app codebase to understand the CodeMirror setup, settings modal, editor toolbar, and toggle patterns. Let me start with a systematic search.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -type f -name \"*.ts\" -o -name \"*.tsx\" | head -30"}`

---

## Assistant

Let me focus on the source files in the src directory:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/**/*.{ts,tsx}"}`

---

## Assistant

Perfect! Now let me search for and read the key files. Let me start with the stores and main editor components:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorToolbar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

Now let me search for the MarkdownEditor component and CodeMirror configuration:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

Now let me check if there's any existing auto-save pattern and look for the hooks:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/hooks/useAutoSave.ts"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"lineNumbers|showLineNumbers","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","type":"ts"}`

---

## Assistant

Perfect! Let me search for line number related code more broadly:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"line\" crates/app/src/components/Editor/*.tsx | grep -i \"number\\|gutter\" | head -20"}`

---

## Assistant

Good. Now let me check the cmFormatting and other CodeMirror-related files to understand the patterns better:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts","limit":80}`

---

## Assistant

Perfect! Now let me look at the StatusBar and App.tsx to see how settings and toggles are integrated:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/StatusBar/StatusBar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","limit":80}`

---

## Assistant

Excellent! Now let me check the package.json to confirm CodeMirror dependencies:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json"}`

---

## Assistant

Perfect! Now let me look at one more file to understand the structure better - the FrontmatterForm to see how settings are integrated:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx","limit":100}`

---

## Assistant

Perfect! Now I have comprehensive understanding of the codebase. Let me create a detailed analysis document.

## Comprehensive Analysis: BrainMap Desktop App Codebase

Based on my thorough exploration of the BrainMap desktop app codebase, here's what I found:

### 1. CodeMirror Editor Setup

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx`

**Current Configuration**:
- CodeMirror v6 is used with these key extensions:
  - `markdown()` - Markdown language support
  - `EditorView.lineWrapping` - Line wrapping enabled
  - `syntaxHighlighting()` with custom theme
  - `linkNavigation()` - Custom extension for Cmd+Click navigation
  - `calloutDecorations()` - Custom callout styling
  - `copyReferenceMenu()` - Context menu for copy reference
  - `history()` - Undo/redo
  - `keymap` with custom formatting keybindings

**Key Finding**: **Line numbers are NOT currently enabled**. The `lineNumbers()` extension from `@codemirror/view` is not imported or added to the extensions array. This is your starting point.

**Editor Creation** (lines 82-122):
- Editor is created fresh when note path, theme, zoom, or font settings change
- Extensions array is built conditionally based on `readOnly` mode
- Uses `EditorView.updateListener` to sync content changes back to React state
- Theme selection: `oneDark` for dark mode, system default for light

---

### 2. Settings Modal Structure

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx`

**PersistedPrefs Interface** (in `uiStore.ts` lines 78-86):
```typescript
interface PersistedPrefs {
  theme?: Theme;
  uiFontFamily?: string;
  uiFontSize?: number;
  editorFontFamily?: string;
  editorFontSize?: number;
  uiZoom?: number;
  defaultTabSizes?: Partial<Record<LeftTab, TabPanelSizes>>;
}
```

**Persistence Mechanism**:
- Prefs stored in `localStorage` under key `"brainmap:uiPrefs"`
- Loaded on app startup via `loadStoredPrefs()` (line 227-233)
- Saved via `savePrefs()` function (line 235-239) that merges with existing prefs
- All preference setters (`setUIFontFamily`, `setEditorFontFamily`, etc.) call `savePrefs()` internally

**Settings Currently Exposed**:
1. **Appearance Section**: Theme (light/dark/system)
2. **Panel Layout Section**: Sliders for files/graph/search panel proportions (10-90%)
3. **Editor Font Section**: Family (select with presets) + Size (range 10-28px)
4. **Interface Font Section**: Family (select with presets) + Size (range 10-20px)
5. **Reset Buttons**: Reset fonts to defaults, Reset layout to defaults

---

### 3. Editor Toolbar

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorToolbar.tsx`

**Structure**:
- Receives `editorView: EditorView | null` as prop
- Has a fixed set of formatting buttons: Bold, Italic, Strikethrough, Code, Headings (H1-H3), Lists, Blockquote, Link, Horizontal Rule
- Callout picker dropdown (☰ button) that opens a popover with 4 callout types
- Uses `onMouseDown` with `preventDefault()` to prevent losing focus
- All buttons are disabled when `editorView` is null

**Integration Points**:
- Passed from `EditorPanel` which maintains `editorViewRef`
- Toolbar appears only in "edit" mode (line 311 in EditorPanel)
- Uses helper functions from `cmFormatting.ts` like `toggleWrap()`, `setHeading()`, etc.

---

### 4. Toggle Patterns - Existing Examples

I found several toggle patterns that exemplify how settings are handled:

**Pattern 1: Simple State Toggle via Button** (from `uiStore.ts`):
```typescript
toggleEdgeLabels: () => set((s) => ({ showEdgeLabels: !s.showEdgeLabels })),
toggleLegend: () => set((s) => ({ showLegend: !s.showLegend })),
```
- These toggle graph visualization features via buttons in GraphToolbar
- State is ephemeral (not persisted)

**Pattern 2: Persistent Settings Toggle** (auto-save approach):
- **Current Status**: Auto-save is ALWAYS on (no toggle exists currently)
- The `useAutoSave()` hook in `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/hooks/useAutoSave.ts` is always active
- It debounces saves at 1.5 seconds and auto-saves on window blur
- **How to add a toggle**: Would need to:
  1. Add `autoSave?: boolean` to `PersistedPrefs` interface
  2. Add `autoSaveEnabled: boolean` to `UIState`
  3. Add action `setAutoSaveEnabled: (v: boolean) => void` that saves to prefs
  4. Conditionally call `useAutoSave()` in `App.tsx` based on the toggle
  5. Add a checkbox in SettingsModal under Appearance section

**Pattern 3: View Mode Toggle** (from `EditorPanel` lines 250-264):
```typescript
<div className="editor-view-toggle">
  <button className={`editor-view-btn${viewMode === "edit" ? " editor-view-btn--active" : ""}`}
    onClick={() => setViewMode("edit")}>Edit</button>
  <button className={`editor-view-btn${viewMode === "preview" ? " editor-view-btn--active" : ""}`}
    onClick={() => setViewMode("preview")}>Preview</button>
  <button className={`editor-view-btn${viewMode === "raw" ? " editor-view-btn--active" : ""}`}
    onClick={() => setViewMode("raw")}>Raw</button>
</div>
```
- Three mutually exclusive view modes
- Per-tab state persisted (via `tabStore`)
- State reflected in UI via conditional className

---

### 5. Key Files Summary

| File | Purpose | Key Content |
|------|---------|-------------|
| `uiStore.ts` | Central state management | All UI preferences, toggles, persisted settings |
| `SettingsModal.tsx` | Settings UI | Current settings UI with sections |
| `EditorPanel.tsx` | Main editor layout | Assembles toolbar, editor, metadata |
| `MarkdownEditor.tsx` | CodeMirror wrapper | Extension setup, theme handling, font application |
| `EditorToolbar.tsx` | Formatting toolbar | Formatting button definitions |
| `useAutoSave.ts` | Auto-save logic | Debounced save, blur listener |
| `cmFormatting.ts` | CM formatting helpers | Wrap, prefix, heading, list functions |
| `cmCalloutDecorations.ts` | CM extension | Callout styling and folding |
| `App.tsx` | Root component | Initializes stores, applies zoom, activates hooks |

---

### 6. Font/Styling Application Pattern

From `App.tsx` and `MarkdownEditor.tsx`:

**Global Zoom** (affects entire app):
```typescript
// In App.tsx
useEffect(() => {
  document.documentElement.style.zoom = String(uiZoom);
}, [uiZoom]);
```

**Editor-specific Fonts**:
```typescript
// In MarkdownEditor.tsx - fonts are applied via CSS variables or direct style
// When editor recreates (dependency: editorFontFamily, editorFontSize)
// The style is applied via CodeMirror's theming system
```

**UI Fonts** (applied globally):
```typescript
// In App.tsx or via CSS root variables
// Sets --ui-font-family and --ui-font-size on documentElement
```

---

### 7. Integration Points for Line Numbers

To add a line numbers toggle:

1. **CodeMirror side**: Import `lineNumbers` from `@codemirror/view`
2. **State**: Add to `PersistedPrefs` and `UIState`
3. **Editor**: Conditionally add extension based on toggle
4. **Settings**: Add checkbox in SettingsModal
5. **Apply**: Extension gets recreated when toggle changes (add to dependencies)

The infrastructure is already in place; you'd follow the existing patterns for persistent settings.

---

I'm ready to help you implement line numbers or any other feature. What would you like to do next?

---

