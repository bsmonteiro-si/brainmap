# 2026-03-18 — Subagent Transcript: Explore

**Date:** 2026-03-18 17:30:14
**Agent:** Explore
**Agent ID:** a3fe1bcd1c7dac85c
**Parent Session:** 894532eb-6b7b-497a-acbe-5bcfbf0b275a

---

## User

Explore how the editor modes work in this Tauri+React app. I need to understand:

1. How edit modes are defined and toggled (look for "Raw", "Edit", "Preview", "mode" in the editor components)
2. The MarkdownEditor component structure - what extensions/plugins are used for CodeMirror
3. How frontmatter is currently handled (is it hidden in edit mode?)
4. The toolbar/mode switcher component
5. Any store state related to editor mode

Key files to look at:
- crates/app/src/components/Editor/ (all files)
- Any store files related to editor state
- Look for "mode" or "editMode" or "viewMode" patterns

Be thorough - read the full MarkdownEditor.tsx and any toolbar/mode components.

---

## Assistant

I'll explore the editor modes in this Tauri+React app by searching through the relevant files.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/**/*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/stores/**/*"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -name \"*.tsx\" -o -name \"*.ts\" | grep -E \"(Editor|editor|mode|Mode)\" | head -20"}`

---

## Assistant

Now let me read the key editor files to understand how modes work:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorToolbar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

Now let me check the FrontmatterForm and MarkdownPreview components:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx","limit":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx","limit":100}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"viewMode|editMode|rawContent","type":"ts","glob":"crates/app/src/stores/**"}`

---

## Assistant

Now let me check the tabStore to see how viewMode is persisted:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts","limit":250}`

---

## Assistant

Perfect! Now I have a comprehensive understanding of how editor modes work. Let me provide a detailed summary.

## Summary: Editor Modes in BrainMap Tauri+React App

### 1. **How Edit Modes Are Defined and Toggled**

The app uses a **three-mode system** defined as a type in `editorStore.ts`:
```
viewMode: "edit" | "preview" | "raw"
```

**Mode switching mechanism** (`EditorPanel.tsx` lines 304-320 and `editorStore.ts` lines 638-691):
- Three buttons in the editor header (`editor-view-toggle`): **Edit**, **Preview**, **Raw**
- `setViewMode` action handles the switch logic with auto-save before mode changes
- Default mode for new tabs: `"edit"` (set in `CLEAN_EDITOR_STATE`, line 86)
- State is persisted per-tab in `tabStore` and restored when tabs are reactivated

**Auto-save behavior before mode switching** (lines 638-691 in editorStore.ts):
- When switching TO raw mode: saves body/frontmatter edits first, then fetches raw file content
- When switching FROM raw mode: saves raw edits first if dirty
- Edit↔Preview switches don't trigger saves (both work with the same edited body)

### 2. **MarkdownEditor Component Structure**

Location: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx`

**CodeMirror 6 Extensions used**:
- `markdown({ extensions: GFM })` — GitHub Flavored Markdown parsing
- `lineNumbers()` — optional, controlled by UIStore setting
- `EditorView.lineWrapping` — optional word wrapping
- `indentUnit.of()` — configurable indent size
- `syntaxHighlighting()` with custom theme
- **Custom decorations & plugins**:
  - `linkNavigation()` — click links to navigate notes
  - `calloutDecorations()` — renders `> [!type]` blocks with styling
  - `listSpacing()` — adds visual spacing to lists
  - `markdownDecorations()` — markdown syntax highlighting/styling
  - `checkboxDecorations()` — task list checkboxes
  - `bulletDecorations()` — enhanced bullet styling
  - `headingFoldService()` — collapsible headings
  - `editorContextMenu()` — right-click menu with table formatting
  - `createSlashAutocompletion()` — `/` slash commands
  - `smartPaste()` — intelligent paste handling
  - `search()` — Cmd+F search
  - `history()` — undo/redo with custom keymap
  - Multiple keymaps: `formattingKeymap`, `closeBracketsKeymap`, `searchKeymap`, `listNestingKeymap`, `historyKeymap`, `defaultKeymap`

**Theme system**:
- CSS variable-based dark theme (`darkEditorTheme`, lines 32-52)
- Defers to `--bg-primary`, `--accent`, `--selection-bg`, etc. from CSS
- Syntax highlighting colors for headings, emphasis, code, etc.

**Scale detection patch** (lines 74-89):
- Patches `offsetWidth`/`offsetHeight` to account for global CSS zoom on WKWebView
- Ensures CodeMirror mouse hit-testing works correctly with document zoom

**Read-only mode** (lines 144-147):
- When `readOnly` prop is true, adds `EditorState.readOnly.of(true)` and `EditorView.editable.of(false)`
- Used for PDFs and other non-editable content

### 3. **Frontmatter Handling**

**Frontmatter visibility**:
- **Hidden in "raw" mode**: Line 340 in EditorPanel shows frontmatter only when `viewMode !== "raw"`
- **Hidden in "preview" mode**: FrontmatterForm only renders for notes when `viewMode !== "raw"` (line 373)
- **Visible and editable in "edit" mode**: FrontmatterForm fully expanded at bottom

**Frontmatter component** (`FrontmatterForm.tsx`):
- Expandable/collapsible section with "Edit Metadata" header
- Editable fields: Title, Type (select), Status (select), Tags (pill input), Source, Summary (textarea)
- Read-only fields: Created, Modified (handled separately)
- Extra Fields section (collapsible)
- Links Editor for note relationships
- All changes trigger `updateFrontmatter` which marks note as dirty

**Frontmatter persistence**:
- Changes stored in `editedFrontmatter` in editorStore (line 23)
- Per-tab state snapshotted to `tabStore.TabState` (line 21)
- Saved atomically with body via `api.updateNote()`

### 4. **Toolbar/Mode Switcher Component**

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorToolbar.tsx`

**Mode switcher** (in EditorPanel.tsx, lines 304-320):
- Three buttons: `editor-view-btn`, each with `onClick={() => setViewMode(mode)}`
- Active button gets `editor-view-btn--active` class
- Visible for all note types: BrainMap notes, plain files, untitled tabs

**EditorToolbar component** (separate from mode switcher):
- **Only visible in edit mode** (line 374: `{viewMode === "edit" && <EditorToolbar />}`)
- Contains formatting buttons: Bold (B), Italic (I), Strikethrough (S), Code (<>), Headings (H1-H3), Lists, Blockquote, Link, Horizontal Rule, Table
- Callout picker dropdown with icon+label for each callout type
- All buttons disabled when no editorView available
- Uses `onMouseDown` to prevent focus loss from editor

**Mode visibility**:
```
editor-view-layer--active  // CSS display toggle for each mode
```
Three stacked layers toggled by CSS class (lines 375-400 in EditorPanel):
- Edit layer: MarkdownEditor (CodeMirror)
- Preview layer: MarkdownPreview (React Markdown component)
- Raw layer: MarkdownEditor in read-only mode with full file content

### 5. **Store State Related to Editor Mode**

**editorStore.ts** (`EditorState` interface, lines 15-52):
```
viewMode: "edit" | "preview" | "raw"           // Current mode
rawContent: string | null                      // Fetched raw file (null when not in raw mode)
_rawDirty: boolean                             // Tracks if raw edits differ from disk
editedBody: string | null                      // Body changes in edit/preview
editedFrontmatter: Partial<EditableFrontmatter> // Frontmatter field changes
isDirty: boolean                               // Overall dirty state
conflictState: "none" | "external-change"      // File conflict detection
scrollTop: number                              // Restored per-tab
cursorPos: number                              // Restored per-tab
```

**tabStore.ts** (`TabState`, lines 13-29):
```
viewMode: "edit" | "preview" | "raw"           // Persisted per-tab
editedBody: string | null
editedFrontmatter: FmSnapshot
isDirty: boolean
conflictState: "none" | "external-change"
fmUndoStack: FmSnapshot[]                      // Frontmatter undo history
fmRedoStack: FmSnapshot[]                      // Frontmatter redo history
scrollTop: number
cursorPos: number
```

**uiStore.ts** (settings):
- `showLineNumbers: boolean` — controls line number visibility in CodeMirror
- `lineWrapping: boolean` — controls text wrapping in CodeMirror
- `spellCheck: boolean` — controls spell check on editor
- `editorFontFamily: string` — custom editor font
- `editorFontSize: string` — custom editor font size
- `editorIndentSize: number` — spaces per indent level
- `uiZoom: number` — global document zoom (0.5-2.0)

**Key state transitions**:
1. Tab opens → `viewMode: "edit"` (default)
2. User clicks "Raw" → saves edits, fetches raw content, switches mode
3. Tab switch → snapshot scroll/cursor to old tab, restore from new tab
4. Note edit → marks tab dirty, queues for auto-save on tab switch
5. Tab reactivation → restores `viewMode`, scroll position, cursor position

### Files Summary

- **`MarkdownEditor.tsx`** — CodeMirror 6 wrapper with extensions, read-only support, scale detection
- **`EditorPanel.tsx`** — mode switcher UI, layer management, toolbar visibility
- **`EditorToolbar.tsx`** — formatting buttons, only visible in edit mode
- **`FrontmatterForm.tsx`** — editable metadata, only visible in edit/preview modes
- **`MarkdownPreview.tsx`** — React Markdown preview renderer
- **`editorStore.ts`** — editor state machine: mode switching, save logic, raw content fetching
- **`tabStore.ts`** — per-tab state persistence (mode, edits, cursor, scroll)
- **`uiStore.ts`** — editor settings (fonts, line numbers, spell check, zoom)

---

