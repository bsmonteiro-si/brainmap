# 2026-03-11 — Subagent Transcript: Explore

**Date:** 2026-03-11 19:16:55
**Agent:** Explore
**Agent ID:** a294ab402b553e753
**Parent Session:** ad145178-00e1-406f-b483-a103e20c14d1

---

## User

Explore the editor/preview view in this Tauri+React desktop app. I need to understand:

1. The main editor component structure - find all components related to the note editor/preview panel (the right side panel that shows note content)
2. The metadata table component (Title, Type, Tags, Status, Source fields shown at top)
3. The markdown preview/edit component (CodeMirror setup)
4. The "Related Notes" footer section
5. Any CSS/styling files related to the editor

Look in `crates/app/src/` for React components. Be thorough - check for CSS files, styled components, inline styles, and any theming. I want to understand the full visual stack of the editor view.

---

## Assistant

I'll explore the editor/preview view in the desktop app thoroughly. Let me search for all the related components and styling.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"*.tsx\" -o -name \"*.ts\" -o -name \"*.css\" | head -50"}`

---

## Assistant

Good, I found the editor components. Let me read the key files to understand the structure.

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

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx"}`

---

## Assistant

Now let me read the RelatedNotesFooter and check the CSS files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*.css\" -type f"}`

---

## Assistant

Perfect! Let me also check the editorStore to understand the state management:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts","limit":100}`

---

## Assistant

Excellent! Now let me check if there are any other editor-related CSS or components I missed:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor -type f \\( -name \"*.tsx\" -o -name \"*.ts\" -o -name \"*.css\" \\)"}`

---

## Assistant

Perfect! Now let me create a comprehensive summary of the editor view structure based on my exploration.

## Exploration Complete: Editor/Preview View Architecture

I've thoroughly explored the editor/preview view in the desktop app. Here's the complete breakdown:

### **1. Main Editor Component Structure**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx`

The `EditorPanel` is the root container that orchestrates the entire editor view. It:
- Uses `useEditorStore` to manage active note state (`activeNote`, `isLoading`, `conflictState`)
- Manages local view mode state: "edit" or "preview" 
- Resets view mode to "edit" whenever a different note is loaded
- Shows a placeholder when no note is selected or while loading
- Displays a conflict banner when external file changes are detected with "Keep Mine" / "Accept Theirs" buttons
- Renders sub-components in this order: `FrontmatterForm` → `MarkdownEditor/MarkdownPreview` → `RelatedNotesFooter`

---

### **2. Metadata Table Component**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx`

The `FrontmatterForm` displays the metadata section with:
- **Collapsible header** ("▾" / "▸" toggle) labeled "Metadata"
- **Read-only fields** (all are display-only, not editable):
  - **Title** (from `note.title`)
  - **Type** (from `note.note_type`)
  - **Tags** (from `note.tags` array, joined with ", ")
  - **Status** (from `note.status`, displays "—" if null)
  - **Source** (from `note.source`, only shown if present)
- Uses `useState` to manage expanded/collapsed state
- Proper ARIA attributes for accessibility (`aria-expanded`, `aria-controls`)

---

### **3. Markdown Preview/Edit Component**

**Editor: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx`**

The `MarkdownEditor` is powered by **CodeMirror 6** with:
- Extensions:
  - `markdown()` — full markdown language support
  - `defaultKeymap` — standard keyboard shortcuts
  - `EditorView.updateListener` — captures edits and triggers `onChange` callback
  - `EditorView.lineWrapping` — soft wraps long lines
  - `oneDark` theme (when dark mode is active)
- **Smart content syncing**:
  - Refs track current callbacks and content to avoid recreating the editor unnecessarily
  - Editor recreates only when note path or effective theme changes
  - External content changes (after save or conflict resolution) synced via dispatch without full recreate
- **Font control**: Editor's font family and size are set via CSS variables (`--editor-font-family`, `--editor-font-size`) that are persisted in the UIStore
- Full height container with `overflow: auto`

**Preview: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx`**

Uses **react-markdown** with:
- `remarkGfm` plugin — GitHub Flavored Markdown support (tables, strikethrough, task lists, etc.)
- Rendered into `.md-preview` div with comprehensive CSS styling

---

### **4. Related Notes Footer Section**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx`

Displays bidirectional relationship references:
- **Outgoing links** from `activeNote.links` (explicit typed links defined in frontmatter)
- **Incoming backlinks** from `graphStore.edges` (edges where target === activeNote.path)
- **Collapsible structure**: 
  - Header with "▾" / "▸" toggle and count: "Related Notes (N)"
  - Shows first 10 items by default
  - "Show X more…" button expands to all
- **List items** display:
  - Direction indicator: "→" (outgoing) or "←" (incoming)
  - Relationship type badge (e.g., "contains", "supports", "mentions-in")
  - Related note title (clickable, links styled in accent color)
- **Click behavior**: Opens the related note in editor and selects in graph
- Automatically resets expansion when active note changes

---

### **5. CSS/Styling Files**

**Main stylesheet:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

**Theme system** (lines 1-44):
- Light theme (default): Primary white backgrounds, dark text
- Dark theme: Dark backgrounds (#1e1e1e primary), light text
- CSS custom properties for all colors:
  - `--bg-primary`, `--bg-secondary`, `--bg-tertiary`
  - `--text-primary`, `--text-secondary`, `--text-muted`
  - `--border-color`, `--accent`, `--accent-hover`, `--danger`, `--success`, `--warning`
  - Font variables: `--ui-font-family`, `--ui-font-size`, `--editor-font-family`, `--editor-font-size`
  - Derived font sizes: `--ui-font-lg`, `--ui-font-sm`, `--ui-font-xs`

**Editor-specific styles** (lines 172-293):
- `.editor-panel` — flex column container, full height
- `.editor-header-bar` (lines 670-700) — top bar with title, Edit/Preview buttons, focus mode toggle
- `.editor-title` — ellipsis truncation with flex: 1
- `.editor-view-toggle` (lines 703-730) — button group for Edit/Preview modes
- `.editor-view-btn` — individual toggle buttons with hover and active states
- `.editor-focus-btn` — focus mode button (⤢/⤡)
- `.conflict-banner` (lines 269-286) — yellow warning with action buttons
- `.frontmatter-form` (lines 214-249) — collapsible metadata section
  - `.frontmatter-fields` — flex column layout for fields
  - `.frontmatter-form label` — label + input pairs
  - Inputs are read-only styling
- `.editor-body` (lines 251-267) — flex: 1 container for editor/preview
  - CodeMirror 6 styling with forced font family/size via `!important`
  - `.cm-editor`, `.cm-content`, `.cm-line` targeted for font override

**Markdown preview styles** (lines 732-844):
- `.md-preview` — padding with clamp(), generous line-height (1.7)
- Heading styles with top/bottom margins
- Link styling in accent color with underline on hover
- Code blocks with styled backgrounds (`--bg-secondary`)
- Inline code with monospace font and tertiary background
- Blockquote with left accent border
- Table styling with borders, alternating row backgrounds
- List styling with proper indentation

**Related Notes Footer styles** (lines 846-914):
- `.related-notes-footer` — flex column, top border, secondary background
- `.related-notes-toggle` — full-width collapsible header
- `.related-notes-list` — max-height 180px with scroll
- `.related-note-item` — flex row, clickable
  - Direction indicator (→/←) in muted text
  - Relationship badge styled with tertiary background
  - Title in accent color with ellipsis

---

### **6. State Management (Editor Store)**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts`

Zustand store with:
- **State**:
  - `activeNote: NoteDetail | null` — currently open note
  - `isLoading: boolean` — loading indicator
  - `isDirty: boolean` — unsaved changes flag
  - `conflictState: "none" | "external-change"` — file change conflict
  - `editedBody: string | null` — edited content (only when changed)

- **Actions**:
  - `openNote(path)` — loads note from API, manages loading state
  - `updateContent(body)` — marks dirty, stores edited body
  - `saveNote()` — persists `editedBody` back to file via API
  - `markExternalChange()` — detects external file changes, triggers conflict or auto-reload
  - `resolveConflict(action)` — handles "keep-mine" or "accept-theirs"
  - `clear()` — resets all state

- **API data type** (`NoteDetail`):
  - `path`, `title`, `note_type`, `tags`, `status`, `created`, `modified`, `source`, `summary`
  - `links: TypedLinkDto[]` — explicit typed relationships (target + rel + optional annotation)
  - `extra: Record<string, unknown>` — type-specific fields
  - `body: string` — markdown content

---

### **Key Visual/Interaction Patterns**

1. **Edit/Preview toggle**: Button group in header; state managed locally in `EditorPanel`
2. **Collapsible sections**: Used for both Metadata and Related Notes (shared `.section-toggle` class)
3. **Focus mode**: Toggles between full editor and a focused subgraph view (⤢ icon)
4. **Conflict resolution**: Yellow warning banner only shown when `isDirty && external-change`
5. **Responsive typography**: All font sizes inherit from CSS custom properties, adjustable via Settings modal
6. **Dark/Light theme**: Applied via `[data-theme]` attribute on root, all colors use CSS variables
7. **Markdown rendering**: Uses `react-markdown` with `remarkGfm` for preview; CodeMirror 6 for editing

---

### **File Locations Summary**

- **Components**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/`
  - EditorPanel.tsx (main)
  - FrontmatterForm.tsx (metadata)
  - MarkdownEditor.tsx (CodeMirror 6)
  - MarkdownPreview.tsx (react-markdown)
  - RelatedNotesFooter.tsx (backlinks)
  - CreateNoteDialog.tsx (not part of active editor, but creation UI)

- **Styling**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`
  - All editor, preview, metadata, related notes CSS in single file
  - Theme colors in `:root` and `[data-theme]` selectors

- **State**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts`
  - Zustand store managing note lifecycle and content editing

- **Types**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts`
  - `NoteDetail`, `TypedLinkDto`, `EdgeDto` interfaces

---

