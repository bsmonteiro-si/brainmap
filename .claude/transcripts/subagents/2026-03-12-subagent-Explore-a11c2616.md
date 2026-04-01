# 2026-03-12 — Subagent Transcript: Explore

**Date:** 2026-03-12 10:39:26
**Agent:** Explore
**Agent ID:** a11c26161842be087
**Parent Session:** 56bb6357-3423-41a2-b2e2-da48db9200fc

---

## User

Explore the editor components in the BrainMap desktop app at /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/. I need to understand:

1. The main editor component structure - find all editor-related files
2. How CodeMirror is configured (extensions, setup)
3. The current toolbar/header layout above the editor
4. How the editor view ref is managed (EditorView instance)
5. The styling approach (CSS modules? styled-components? plain CSS?)

Be thorough - look at src/components/ for editor components, any CodeMirror configuration files, and the store that manages editor state.

---

## Assistant

I'll explore the editor components in the BrainMap desktop app systematically. Let me start by understanding the directory structure and locating all editor-related files.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -type f -name \"*.tsx\" -o -name \"*.ts\" -o -name \"*.css\" | head -50"}`

---

## Assistant

Let me focus on the source files in the src/ directory:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.tsx"}`

---

## Assistant

Good! Now let me find TypeScript config files and utilities:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.ts"}`

---

## Assistant

Now let me look at CSS files:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.css"}`

---

## Assistant

Let me check for module.css files:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*.module.css\" -o -name \"*.scss\" -o -name \"*.module.scss\""}`

---

## Assistant

Now let me read the key editor files systematically. I'll start with the main editor component:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

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

Now let me read the FrontmatterForm and the CodeMirror link navigation extension:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmLinkNavigation.ts"}`

---

## Assistant

Now let me look at the CSS styling and other related editor components:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx"}`

---

## Assistant

Let me read the full CSS file:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1,"limit":300}`

---

## Assistant

Let me continue reading the CSS file for editor-specific styles:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":300,"limit":200}`

---

## Assistant

Let me continue and get the editor body styles:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":500,"limit":200}`

---

## Assistant

Let me check for more editor view styles and preview styles:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":700,"limit":200}`

---

## Assistant

Now let me look at the markdown preview and related notes footer styles:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":900,"limit":150}`

---

## Assistant

Let me search for markdown preview and related notes styles:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"md-preview\\|related-notes\\|editor-view-toggle\\|editor-focus-btn\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Let me read those sections:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1090,"limit":250}`

---

## Assistant

Now let me look at the RelatedNotesFooter component:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx"}`

---

## Assistant

Now let me check for the UIStore to see how typography settings are managed:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

Now let me look at the LinksEditor component:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/LinksEditor.tsx"}`

---

## Assistant

Perfect! Now let me create a comprehensive summary document by examining the main App component to tie it all together:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

Perfect! Now let me check the package.json to see CodeMirror dependencies:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 50 '\"dependencies\"' /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/package.json | grep -E \"codemirror|@codemirror\""}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -name \"package.json\" -type f"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/*.json"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json"}`

---

## Assistant

Excellent! Now let me check if there's a vite config:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/*.config.* 2>/dev/null || echo \"no vite/vitest config files found\""}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/vite.config.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/vitest.config.ts"}`

---

## Assistant

Perfect! Now I have all the information I need. Let me create a comprehensive summary of the editor components exploration:

## BrainMap Editor Components - Complete Exploration Report

### 1. Main Editor Component Structure

The editor system is composed of several interconnected components:

**Core Editor Files:**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx` - Main container orchestrating edit/preview modes
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx` - CodeMirror 6 wrapper
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx` - React-Markdown preview renderer
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx` - YAML frontmatter editor
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx` - Linked notes navigation

**Supporting Components:**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TagInput.tsx` - Multi-tag input component
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ExtraFieldsEditor.tsx` - Custom field editor
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/LinksEditor.tsx` - Typed link relationship manager
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CreateNoteDialog.tsx` - New note creation modal

### 2. CodeMirror 6 Configuration

**Dependencies** (from package.json):
```
@codemirror/commands: ^6.10.2
@codemirror/lang-markdown: ^6.3.1
@codemirror/language: ^6.10.6
@codemirror/state: ^6.5.2
@codemirror/theme-one-dark: ^6.1.2
@codemirror/view: ^6.36.5
```

**MarkdownEditor Setup** (/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx):

- Uses `useRef` to manage `EditorView` instance (viewRef)
- Extensions configured:
  - `markdown()` - markdown language support
  - `keymap.of(defaultKeymap)` - standard editor keybindings
  - `EditorView.updateListener.of()` - change detection triggering parent callback
  - `EditorView.lineWrapping` - soft line wrapping
  - `syntaxHighlighting()` - custom markdown highlight style
  - `linkNavigation()` - custom Cmd+Click navigation extension
  - `oneDark` theme in dark mode
  
- Custom highlight style (`buildMarkdownHighlight`):
  - Headings (h1-h4): accent color (#4a9eff / #5aaeFF), bold/larger font
  - Emphasis, strong: italic/bold styling
  
- **CSS Zoom Workaround**: The component patches `offsetWidth/offsetHeight` on the CodeMirror DOM to detect CSS zoom correctly in WKWebView environments. This compensates for the `document.documentElement.style.zoom` applied globally by the app.

### 3. Toolbar/Header Layout

**EditorPanel Hero Section** (`.editor-hero` in App.css):
```
Hero Top (right-aligned):
├─ Edit/Preview Toggle (.editor-view-toggle)
│  ├─ Edit button
│  └─ Preview button
└─ Focus Mode Button (.editor-focus-btn) - ⤢/⤣ icons

Hero Title Section:
├─ Title (.editor-hero-title) - large h1
├─ Type Pill (.meta-type-pill) - colored badge by note type
└─ Metadata Row (.meta-row):
   ├─ Tag chips (.meta-tag-chip)
   ├─ Status indicator (.meta-status)
   └─ Source attribution (.meta-source)
```

**Frontmatter Section** (`.frontmatter-form`):
- Collapsible toggle: "Edit Metadata"
- When expanded, shows:
  - Title input (with validation highlight)
  - Type selector (10 note types)
  - Status selector (draft/review/final/archived)
  - Tags input (TagInput component with pill UI)
  - Source text input
  - Summary textarea (3 rows)
  - Created/Modified timestamps (read-only)
  - Links section (LinksEditor component)
  - Extra Fields section (ExtraFieldsEditor component)

### 4. EditorView Ref Management

**Reference Tracking** (MarkdownEditor.tsx):
- `containerRef` - DOM mount point for CodeMirror
- `viewRef` - holds the `EditorView` instance
- `onChangeRef` - callback ref to avoid stale closures
- `contentRef` - current content for updates
- `uiZoomRef` - current zoom level for scale detection patch

**Lifecycle:**
- Editor recreates on: note change, theme change, zoom change (dependency array includes notePath, effectiveTheme, uiZoom, editorFontFamily, editorFontSize)
- Syncing external changes: Separate useEffect watches for content changes from outside (e.g., after save or conflict resolution) without recreating the editor
- Cleanup: `view.destroy()` on unmount

**Keyboard Event Handling:**
- Default CodeMirror keybindings via `@codemirror/commands`
- Custom extension (`cmLinkNavigation`) intercepts Cmd+Click on markdown links `[label](url)` to navigate within workspace
- Global app keyboard shortcuts (Cmd+S save, Cmd+P palette, etc.) handled in App.tsx

### 5. Styling Approach

**CSS Architecture**: Plain CSS with CSS variables (no CSS modules or styled-components)

**Theme System** (App.css root variables):
- Light theme: light grays, dark text, blue accent (#4a9eff)
- Dark theme: dark grays, light text, accent colors adapted
- Dynamically applied via `[data-theme="light"|"dark"]` attribute on documentElement
- Effective theme resolved at app level and synced to DOM

**Typography Variables:**
- `--ui-font-family` / `--ui-font-size` - interface typography
- `--editor-font-family` / `--editor-font-size` - CodeMirror and preview typography
- Applied via `document.documentElement.style.setProperty()` in App.tsx
- Default: System UI fonts (sans) at 13px, System Mono at 14px

**Color System:**
- `--bg-primary`, `--bg-secondary`, `--bg-tertiary` - background layers
- `--text-primary`, `--text-secondary`, `--text-muted` - text hierarchy
- `--border-color` - consistent borders
- `--accent` - interactive elements (#4a9eff)

**CodeMirror Styling** (.editor-body in App.css):
- Full height flex container
- `.cm-editor` fills 100% height
- Font family/size applied via `!important` to override CodeMirror internals:
  ```css
  .editor-body .cm-editor .cm-content,
  .editor-body .cm-editor .cm-line {
    font-family: var(--editor-font-family) !important;
    font-size: var(--editor-font-size) !important;
  }
  ```

**View Layer Transition** (`.editor-view-layer`):
- Both edit and preview mounted simultaneously (opacity toggle)
- Preserves CodeMirror state across switches
- Transition: 0.2s ease opacity
- Active layer has `pointer-events: auto`, inactive has `pointer-events: none`

**Markdown Preview Styling** (`.md-preview`):
- Monospace font (editor font family)
- Headings: h2/h3 have left accent border
- Links: accent color, cursor pointer
- Blockquotes: left border + light accent background
- Code blocks: dark background with padding
- Tables: bordered with alternating row backgrounds

**Frontmatter Field Styling**:
- Two-column layout: label (60px min) + input (flex)
- Inputs inherit theme colors
- Read-only inputs: 60% opacity
- Validation error: red border on title if empty
- Tags: pill-style with remove button

**Related Notes Footer** (`.related-notes-footer`):
- Sticky footer with toggle
- Grid layout: 3-column auto-fill at 200px min
- Cards with type-colored left bar
- Hover: accent border highlight

### 6. State Management

**EditorStore** (`useEditorStore` - Zustand):
```typescript
activeNote: NoteDetail | null;
isLoading: boolean;
isDirty: boolean;
conflictState: "none" | "external-change";
editedBody: string | null;      // null = use activeNote.body
editedFrontmatter: Partial<EditableFrontmatter> | null;
savingInProgress: boolean;
```

Key methods:
- `openNote(path)` - fetch and set active note
- `updateContent(body)` - mark isDirty
- `updateFrontmatter(changes)` - merge frontmatter changes
- `saveNote()` - atomic save (body + frontmatter)
- `markExternalChange()` / `resolveConflict()` - handle file conflicts

**UIStore** (`useUIStore` - Zustand):
- Font/theme/zoom state with localStorage persistence (`brainmap:uiPrefs`)
- Manages editor-related UI state: `effectiveTheme`, `editorFontFamily`, `editorFontSize`, `uiZoom`
- View mode toggle, focus mode, panel sizes

### 7. Key Features

**Cmd+Click Link Navigation** (`cmLinkNavigation.ts`):
- Custom CodeMirror extension
- Detects markdown link syntax `[label](url)` at cursor
- Cmd+hover shows pointer cursor
- Cmd+click resolves relative paths and opens note in editor + graph

**Edit/Preview Toggle:**
- Smooth opacity transition
- Both views mounted for state preservation
- Default to edit mode on note switch

**Conflict Resolution:**
- External change detection via event stream
- Shows banner with "Keep Mine" / "Accept Theirs" buttons
- Auto-reload when no local changes

**Dirty Indicator:**
- Small blue dot in title when unsaved changes
- Cmd+S to save atomically
- Prevents navigation if unsaved (discards changes in v1)

**Font Presets** (UIStore):
- 13 presets: system defaults, Inter, Helvetica, SF Pro, Roboto, Georgia, Lora, Merriweather, JetBrains Mono, Fira Code, Cascadia Code, Source Code Pro, IBM Plex Mono
- Independent font controls for Editor vs UI
- Size range: 10-18px (default 13/14)

**Zoom System** (UIStore):
- Cmd+`+`, Cmd+`-`, Cmd+`0` to adjust
- Range: 0.5x - 2.0x in 0.1 steps
- Applied via `document.documentElement.style.zoom`
- Persisted to localStorage

### File Paths Summary

**Editor Components:**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/LinksEditor.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TagInput.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ExtraFieldsEditor.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CreateNoteDialog.tsx`

**CodeMirror Extensions:**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmLinkNavigation.ts`

**Stores:**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`

**Styling:**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` (54KB, comprehensive, single-file)

**Config:**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/vite.config.ts`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/vitest.config.ts`

---

