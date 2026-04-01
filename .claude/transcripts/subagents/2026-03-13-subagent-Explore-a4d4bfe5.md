# 2026-03-13 — Subagent Transcript: Explore

**Date:** 2026-03-13 14:45:07
**Agent:** Explore
**Agent ID:** a4d4bfe5104b8fdfa
**Parent Session:** c02fcf0e-8ccb-4809-9cea-1b2a5005ee83

---

## User

Explore the BrainMap desktop app's editor infrastructure. I need to understand:

1. The EditorToolbar component — where it is, what buttons it has, how it inserts formatting
2. The `cmFormatting.ts` file — how formatting operations work (bold, italic, etc.)
3. The CodeMirror editor setup — how extensions are registered, what `cmLinkNavigation.ts` does as a pattern for custom extensions
4. The preview/markdown rendering — how markdown is rendered in preview mode, what components are used
5. The EditorView component and how it switches between edit/preview modes

Be very thorough — read full file contents for: EditorToolbar.tsx, cmFormatting.ts, cmLinkNavigation.ts, and the main editor view component. Also find how the preview renders markdown (look for markdown-to-html or react-markdown usage).

---

## Assistant

I'll explore the BrainMap desktop app's editor infrastructure thoroughly. Let me start by understanding the project structure and locating the relevant files.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -type f -name \"*.tsx\" -o -name \"*.ts\" | grep -E \"(Editor|editor|format|markdown)\" | head -20"}`

---

## Assistant

Let me search more specifically in the source directory:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f \\( -name \"*.tsx\" -o -name \"*.ts\" \\) | grep -E \"(Editor|editor|format|markdown)\" | sort"}`

---

## Assistant

Perfect. Now let me read the key files to understand the editor infrastructure:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorToolbar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmLinkNavigation.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx"}`

---

## Assistant

Now let me read the main editor view component and the editor panel:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx"}`

---

## Assistant

Now let me check the test files to understand the patterns better and look for any additional context:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.test.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmLinkNavigation.test.ts"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"*.tsx\" -o -name \"*.ts\" | xargs grep -l \"resolveNotePath\\|isLocalMdLink\" | head -10"}`

---

## Assistant

Now let me read the resolveNotePath utility:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/resolveNotePath.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/resolveNotePath.test.ts"}`

---

## Assistant

Perfect! Now let me check the MarkdownEditor component's CSS and look at the editor store to understand the full data flow:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f \\( -name \"*.css\" -o -name \"*.scss\" \\) | xargs grep -l \"editor-toolbar\\|editor-panel\\|editor-view\" | head -`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","limit":200}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 50 \"editor-toolbar\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -60"}`

---

## Assistant

Let me get more of the CSS and check for MarkdownPreview CSS:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 80 \"\\.editor-view-layer\\|\\.md-preview\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -100"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 150 \"\\.md-preview\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -160"}`

---

## Assistant

Perfect! Now let me check the MarkdownEditor.tsx file more closely for extension setup and also look at related components:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"CodeMirror\\|@codemirror\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/*.tsx | grep -v node_modules | head -20"}`

---

## Assistant

Now let me look at the MarkdownPreview.test.tsx to understand how it's tested:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.test.tsx"}`

---

## Assistant

Excellent! Now let me get the complete EditorPanel component to understand the full picture and look at the package.json to see the exact dependencies:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 5 -B 5 \"react-markdown\\|remark\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 2 -B 2 \"@codemirror\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json"}`

---

## Assistant

Perfect! Now let me also check the editorStore to see the complete file:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","offset":200,"limit":100}`

---

## Assistant

Perfect! Now I have a comprehensive understanding of the editor infrastructure. Let me create a detailed exploration report:

## BrainMap Desktop App Editor Infrastructure – Complete Exploration

I've thoroughly explored the BrainMap editor infrastructure across all key components. Here's what I found:

### 1. **EditorToolbar Component** (`EditorToolbar.tsx`)
**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorToolbar.tsx`

**Buttons (14 total):**
- **Text formatting:** Bold (`Cmd+B`), Italic (`Cmd+I`), Strikethrough (`Cmd+Shift+X`), Inline Code (`Cmd+E`)
- **Headings:** H1/H2/H3 (`Cmd+Shift+1/2/3`)
- **Lists:** Bulleted List (`-`), Numbered List (auto-incrementing)
- **Block elements:** Blockquote (`>`), Link (`Cmd+K`), Horizontal Rule
- **Visual separators** between button groups

**Implementation pattern:**
- Accepts `editorView: EditorView | null` from parent
- Each button calls a formatting function via `onMouseDown` (prevents focus loss from editor)
- Buttons disabled when no editor is active
- Uses `.editor-toolbar-btn` CSS classes with special styling for Bold (700 weight) and Italic (italic style)

### 2. **cmFormatting.ts** (`cmFormatting.ts`)
**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts`

**Key Functions (all return `boolean` and focus editor after dispatch):**

| Function | Purpose | Logic |
|----------|---------|-------|
| `toggleWrap(view, marker)` | Wrap/unwrap text with symmetric markers (`**`, `*`, `~~`, `` ` ``) | If selection wrapped → unwrap; if selected → wrap; if empty → insert pair and place cursor between |
| `toggleLinePrefix(view, prefix)` | Add/remove prefix to multiple lines (`-`, `>`, `#`) | If all lines have prefix → remove; else add to those without; adjusts cursor shifts |
| `toggleOrderedList(view)` | Toggle numbered lists with auto-increment | Recognizes `\d+\. ` regex; adds/removes; auto-numbers from 1 when adding |
| `setHeading(view, level)` | Set heading level (H1-H3) or toggle off | Replaces existing heading prefix; same level removes heading |
| `insertLink(view)` | Insert markdown link template `[](url)` | If selected text → wrap as `[text](url)` and select "url"; else cursor inside `[]` |
| `insertAtCursor(view, text)` | Insert text at cursor/selection | Replaces selection or inserts at cursor |
| `formattingKeymap` | KeyBinding array | Exports all keyboard shortcuts (Mod = Cmd on Mac, Ctrl on Windows) |

**Key patterns:**
- All functions dispatch to CodeMirror's `view.dispatch()` with calculated offset changes
- Selection tracking: `EditorSelection.range()` or `EditorSelection.cursor()` to preserve/adjust selection
- Line-aware: uses `state.doc.lineAt(pos)` to find line boundaries
- Tested extensively (27 test cases in `cmFormatting.test.ts`)

### 3. **CodeMirror Setup** (`MarkdownEditor.tsx`)
**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx`

**Extension Stack (in order of registration):**
```typescript
[
  markdown(),                           // Markdown syntax highlighting
  history(),                            // Undo/redo stack
  keymap.of([
    ...formattingKeymap,                // Formatting shortcuts (Cmd+B, etc)
    { key: "Mod-y", run: redo, ... },  // Redo fallback
    ...historyKeymap,                   // History bindings
    ...defaultKeymap,                   // Default CM bindings (Ctrl+A, etc)
  ]),
  EditorView.updateListener.of(...),   // onChange listener
  EditorView.lineWrapping,              // Word wrap
  syntaxHighlighting(buildMarkdownHighlight(isDark)), // Color syntax
  linkNavigation(notePath),             // Cmd+Click navigation
  oneDark (if dark theme)               // Dark theme
]
```

**CSS Zoom Patch:**
- `patchCMScaleDetection()` intercepts `offsetWidth`/`offsetHeight` to account for document-level CSS zoom
- Fixes CodeMirror's internal `getScale()` detection in Tauri WKWebView environments
- Ensures mouse coordinates scale correctly with zoom

**Font/Theme Reactivity:**
- `editorFontFamily`, `editorFontSize`, `effectiveTheme`, `uiZoom` from UIStore trigger recreation
- Applied via CSS variables: `--editor-font-family`, `--editor-font-size`
- CodeMirror `.cm-content` and `.cm-line` have `!important` overrides for font consistency

### 4. **cmLinkNavigation.ts** – Custom Extension Pattern
**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmLinkNavigation.ts`

**Architecture:**
```typescript
export function linkNavigation(notePath: string): Extension {
  // Internal state tracked across events
  let cmdHeld = false;
  let lastLinkAtMouse = false;

  // Helper: extract link URL from line at offset
  function extractLinkAtPos(lineText, offsetInLine): string | null
    // Regex: /\[([^\]]*)\]\(([^)]*)\)/g
    // Returns m[2] if cursor falls within match range

  // Helper: check what link (if any) is at current coordinates
  function checkLinkAtCoords(view, x, y): string | null
    // Uses view.posAtCoords() → get line → extractLinkAtPos()

  // Helper: visual feedback
  function updateHoverClass(view, isOverLink)
    // Adds/removes .cm-cmd-link-hover class to view.dom

  // DOM event handlers (returned from EditorView.domEventHandlers)
  const handlers = {
    click(event, view) {
      // If Cmd/Ctrl held && link detected && is .md file
      //   → selectNode() + openNote()
    },
    mousemove(event, view) {
      // Track cmdHeld state, detect link, update hover class
    },
    keydown/keyup(event, view) {
      // Track Cmd/Ctrl key state
    },
    mouseleave(event, view) {
      // Clear hover class on leaving editor
    },
  }

  // Theme: adds &.cm-cmd-link-hover .cm-content { cursor: pointer; }
  return [handlers, theme];
}
```

**Usage:** Imported and included in MarkdownEditor's extension array. Enables Cmd+Click navigation in editor mode, with visual pointer cursor feedback.

### 5. **MarkdownPreview Component** (`MarkdownPreview.tsx`)
**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx`

**Stack:**
- **Library:** `react-markdown` v10.1.0 + `remark-gfm` (GitHub-flavored markdown: tables, strikethrough, task lists)
- **Rendering:** markdown string → ReactMarkdown with custom components

**Custom Components:**
- **Link handler (`<a>` override):**
  - Local `.md` links → click triggers `selectNode()` + `openNote()` (same as editor navigation)
  - External links → `target="_blank"` + `rel="noopener noreferrer"`
  - Uses `resolveNotePath()` for relative paths and `isLocalMdLink()` for detection

**CSS Styling** (from `App.css`):
- Headings: accent-tinted color-mix, soft borders on H2/H3 (left 3px border)
- Code: monospace, background pill, inline styling
- Pre/code blocks: dark background, horizontal scroll
- Blockquotes: accent left border, soft accent background, rounded right
- Tables: GitHub-style with borders, alternating row colors
- Lists: standard nesting, task list checkbox support
- Line height: 1.7 for readability

### 6. **EditorPanel Component** (`EditorPanel.tsx`)
**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx`

**Layout Structure:**
```
EditorPanel
├── editor-hero (header with title, type pill, tags, status)
├── [FrontmatterForm] (expandable metadata editor)
├── [conflict-banner] (if external change detected)
├── EditorToolbar (if in edit mode)
└── editor-body (two absolute layers)
    ├── editor-view-layer (edit) [MarkdownEditor]
    └── editor-view-layer (preview) [MarkdownPreview]
    └── RelatedNotesFooter
```

**View Mode Toggle:**
- Radio-style buttons: "Edit" / "Preview" (both mounted, CSS opacity transition)
- `viewMode` state in EditorPanel (local)
- `editorView` state (EditorView ref from MarkdownEditor's `onViewReady`)

**Data Flow:**
- `activeNote` from editorStore → display title/type/tags/status
- `editedBody` → onChange triggers `updateContent()` in editorStore
- `isDirty` → shown as small dot on title
- Both `.md` notes and plain `.txt` files supported

**Conflict Handling:**
- External file change triggers `conflictState: "external-change"`
- User can "Keep Mine" or "Accept Theirs"
- Handled via `resolveConflict()` in editorStore

### 7. **EditorStore** (`editorStore.ts`)
**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts`

**State Shape:**
```typescript
{
  activeNote: NoteDetail | null,
  activePlainFile: PlainFileDetail | null,
  isLoading: boolean,
  isDirty: boolean,
  conflictState: "none" | "external-change",
  editedBody: string | null,              // null = not modified; value = unsaved edits
  editedFrontmatter: Partial<EditableFrontmatter> | null,
  savingInProgress: boolean,
}
```

**Key Actions:**
- `openNote(path)` → awaits save if auto-save enabled, then loads note
- `updateContent(body)` → sets `editedBody` + `isDirty: true`
- `updateFrontmatter(changes)` → merges into `editedFrontmatter` + `isDirty: true`
- `saveNote()` → validates (no empty titles), uploads via API, re-reads note, syncs graph if title/type changed
- `markExternalChange()` → detects concurrent file changes, shows banner
- `resolveConflict()` → keeps local edits or reloads from disk

### 8. **Link Resolution Utilities** (`resolveNotePath.ts`)
**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/resolveNotePath.ts`

**Functions:**
- `resolveNotePath(currentNotePath, linkTarget)` → relative → workspace-absolute
  - Example: `People/Judea Pearl.md` + `./Francis Galton.md` → `People/Francis Galton.md`
  - Handles `../` traversal, URL-decodes `%20`, normalizes empty/`.` segments
  - **Used by:** cmLinkNavigation, MarkdownPreview
  
- `isLocalMdLink(href)` → boolean
  - Excludes URIs with schemes (http:, https:, mailto:, etc.)
  - Requires `.md` extension
  - Used to distinguish local wiki links from external URLs

### Summary Table

| Component | Purpose | Key Tech |
|-----------|---------|----------|
| **EditorToolbar** | Formatting buttons | React, CodeMirror dispatch |
| **cmFormatting** | Formatting functions | EditorSelection, state.doc.lineAt() |
| **cmLinkNavigation** | Cmd+Click nav extension | EditorView.domEventHandlers(), resolveNotePath |
| **MarkdownEditor** | CodeMirror 6 wrapper | markdown(), history(), syntaxHighlighting |
| **MarkdownPreview** | Markdown renderer | react-markdown, remark-gfm, custom link component |
| **EditorPanel** | Layout orchestrator | View mode toggle, hero header, two-layer editor |
| **EditorStore** | State management | Zustand, auto-save, conflict detection |
| **resolveNotePath** | Path resolution | Relative path normalization, URL decode |

All components are thoroughly tested (27 cmFormatting tests, 7 cmLinkNavigation tests, 7 MarkdownPreview tests).

---

