# 2026-03-14 — Subagent Transcript: Explore

**Date:** 2026-03-14 13:55:33
**Agent:** Explore
**Agent ID:** acf52c3152421b1a6
**Parent Session:** 18b83132-df76-449f-87c1-97ae0166cb77

---

## User

In the BrainMap desktop app (crates/app/), find and examine:

1. How the "preview" view mode renders markdown content - look for markdown-to-HTML rendering, preview containers, preview-specific CSS classes
2. The EditorPanel component focusing on the preview rendering path
3. Any CSS files that style the preview content (look for ".preview", ".markdown-preview", ".rendered", "prose" or similar classes)
4. How CodeMirror themes (edit mode) vs preview mode styling differ

The issue is that Edit and Raw modes correctly use the selected theme (Dragula, Nord, etc.) but Preview mode doesn't. I need to find where the styling gap is.

---

## Assistant

I'll help you explore the BrainMap desktop app to understand how preview rendering works and identify the theme styling gap. Let me start by examining the codebase structure and the EditorPanel component.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -type f -name \"*.tsx\" -o -name \"*.ts\" -o -name \"*.css\" | head -50"}`

---

## Assistant

Let me focus on the source files, not node_modules:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.{tsx,ts,css}"}`

---

## Assistant

Perfect! Now let me examine the EditorPanel and MarkdownPreview components:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Let me search for the CSS styling and theme-related files:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.md-preview|preview-mode|markdown-preview","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*.css\" | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1,"limit":400}`

---

## Assistant

Let me continue reading the CSS to find preview-related styles:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":400,"limit":500}`

---

## Assistant

Let me search for the markdown preview CSS:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":900,"limit":500}`

---

## Assistant

Let me search for markdown preview CSS specifically:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"md-preview|markdown","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content"}`

---

## Assistant

Perfect! Now let me read the complete markdown preview CSS section:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1590,"limit":300}`

---

## Assistant

Now let me check the MarkdownEditor component to see how themes are applied there:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

Now let me check the UIStore to understand how themes are managed:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"effectiveEditorTheme|THEME_BASE|theme|dracula|nord","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","output_mode":"content","head_limit":100}`

---

## Assistant

Let me read the full uiStore to understand the complete picture:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","offset":1,"limit":200}`

---

## Assistant

Let me check how the theme is applied to the DOM:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"data-theme\\|setAttribute.*theme\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.tsx\" --include=\"*.ts\" -A 2 -B 2 | head -80"}`

---

## Assistant

Perfect! Now I have a clear picture of the issue. Let me create a comprehensive analysis report.

## Summary

I've successfully examined the BrainMap desktop app to identify the preview mode theme styling gap. Here's my detailed analysis:

### Key Findings

**1. Theme Application Architecture**

- **Root theme**: Applied via `document.documentElement.setAttribute("data-theme", effectiveTheme)` in `App.tsx` (targets `:root` and `[data-theme="..."]` CSS selectors)
- **Editor panel theme**: Applied via `data-theme` attribute on the `.panel` container (when `editorTheme !== "inherit"`)
- **Files panel theme**: Applied via `data-theme` attribute on the `.panel` container (when `filesTheme !== "inherit"`)
- **Theme resolution**: Via `effectiveEditorTheme` from UIStore (inherited from `THEME_BASE` or component-specific override)

**2. Edit/Raw Modes Work Correctly**

Both Edit and Raw modes use the `MarkdownEditor` component which:
- Reads `effectiveEditorTheme` from UIStore (lines 70 in MarkdownEditor.tsx)
- Applies theme-aware syntax highlighting: `HighlightStyle.define([...])` with theme-specific accent colors (lines 19-28)
- For dark themes: Applies CodeMirror's `oneDark` extension (lines 112-114)
- Theme colors are applied via CSS classes on `.editor-body .cm-editor` (lines 1029-1057 in App.css):
  - `--bg-primary`, `--text-primary`, `--text-secondary`, `--border-color` CSS variables
  - These variables are set in `[data-theme="..."]` blocks in App.css (lines 2-204)

**3. Preview Mode Styling Gap**

Preview mode uses the `MarkdownPreview` component which:
- Renders via React Markdown into a `.md-preview` container (MarkdownPreview.tsx, lines 162-167)
- **Does NOT read theme state** or apply theme-aware styling
- CSS styling is hardcoded in App.css (lines 1596-1790):
  - Uses CSS variables: `var(--text-primary)`, `var(--text-secondary)`, `var(--accent)`, `var(--border-color)`, etc.
  - These variables ARE scoped to `[data-theme="..."]` blocks
  - **The problem**: The `.md-preview` container resides in the editor panel (a `.panel` div) that has `data-theme` attribute

**4. The Root Cause**

The `.md-preview` container is inside:
```
<div class="panel" ... data-theme="nord"> (or dracula, etc.)
  <div class="editor-view-layer--active">
    <div class="md-preview">  <!-- <-- theme variables apply here -->
```

When `editorTheme` is "inherit" (default), the `.panel` does NOT get a `data-theme` attribute:
```tsx
// From AppLayout.tsx
{...(editorTheme !== "inherit" ? { "data-theme": effectiveEditorTheme } : {})}
```

This means CSS variable cascading may be incomplete or theme-specific CSS isn't properly scoped.

**5. Confirmed CSS Structure**

Preview styles are theme-aware via CSS variables:
- Line 1600: `color: var(--text-primary)` 
- Line 1627: `color: var(--accent)`
- Line 1641: `background: var(--bg-tertiary)`
- Line 1668: `background: color-mix(in srgb, var(--accent) 6%, transparent)`

But these variables are defined in `[data-theme="dracula"]`, `[data-theme="nord"]`, etc. blocks (lines 62-180) and inherited via `:root` cascade.

### Files to Review

1. **`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`** (lines 1595-1790)
   - Complete `.md-preview` CSS styling
   - Theme variable definitions in `[data-theme="..."]` blocks (lines 2-204)

2. **`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx`**
   - React Markdown component rendering
   - Callout block custom styling
   - No theme-aware logic

3. **`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx`** (lines 64-166)
   - Theme handling via `effectiveEditorTheme` (line 70)
   - Theme-aware syntax highlighting (lines 19-28, 86-91, 112-114)

4. **`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`** (lines 1-200+)
   - Theme state management: `theme`, `effectiveTheme`, `effectiveEditorTheme`
   - `THEME_BASE` mapping (lines 9-18)
   - Component theme resolution via `resolveComponentTheme`

5. **`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx`**
   - Root theme attribute application

6. **`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx`**
   - Panel-level `data-theme` conditional application

### Why Preview Doesn't Work

When you switch to a theme like Dracula or Nord:
1. Root gets `data-theme="dracula"` ✓
2. Editor panel gets `data-theme="dracula"` (if editorTheme !== "inherit") ✓
3. CodeMirror and `.md-preview` **should** inherit CSS variables from `[data-theme="dracula"]`
4. **BUT**: If theme is "inherit" (default), the panel lacks the attribute, breaking the CSS cascade
5. The fix: Ensure `.md-preview` always receives proper theme context or apply theme variables directly

This is a CSS cascade/scoping issue, not a React component issue.

---

