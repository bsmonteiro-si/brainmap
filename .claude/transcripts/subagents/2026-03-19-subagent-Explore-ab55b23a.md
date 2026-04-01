# 2026-03-19 — Subagent Transcript: Explore

**Date:** 2026-03-19 20:35:07
**Agent:** Explore
**Agent ID:** ab55b23ae6e08b898
**Parent Session:** b1d9eca6-8bb3-4c0b-8673-2c48c1a7ec0b

---

## User

I need to understand how this BrainMap app handles file types and editor widgets, specifically:

1. How mermaid diagrams are currently integrated (look in crates/app/src/ for mermaid-related files)
2. How the editor (CodeMirror 6) loads and renders files - look at the Editor component structure
3. How file types are handled - what determines if a file is a "note" vs a "plain file"
4. How the file tree and tab system work - can they open different file types with different editors?
5. Look at docs/extension-guides/ for any guides about adding preview widgets or new file types
6. Check the Tauri commands for file operations (read, write, create)

Be thorough - I need to understand the full pipeline from file discovery to rendering.

---

## Assistant

I'll conduct a comprehensive exploration of how BrainMap handles file types and editor widgets. Let me start by mapping out the key components.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"*mermaid*\" | head -20"}`

---

## Assistant

Let me continue searching for relevant files without creating anything:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.{tsx,ts}"}`

---

## Assistant

Now let me search for mermaid and editor-related files more specifically:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"mermaid","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","type":"ts"}`

---

## Assistant

Excellent! Now let me explore the key files systematically:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMermaidDecorations.ts"}`

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

Great! Now let me continue exploring the file tree, tab system, and how different file types are handled:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":150}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"PlainFileDetail|NoteDetail","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api","output_mode":"files_with_matches"}`

---

## Assistant

Now let me check the types and API definitions:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/generated/PlainFileDto.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/PdfViewer.tsx","limit":80}`

---

## Assistant

Let me check how tabs work and the main editor component that determines which editor to render:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts","limit":150}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"PdfViewer|MarkdownEditor|PlainFileEditor","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components","output_mode":"files_with_matches"}`

---

## Assistant

Perfect! Now let me look at the EditorPanel which must be the dispatcher:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"readNote|readPlainFile|read_raw_note","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api","output_mode":"files_with_matches"}`

---

## Assistant

Excellent! Now let me check the Tauri API bridge and the backend commands:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts","limit":150}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/src/**/*.rs"}`

---

## Assistant

Now let me look at the commands and handlers in the backend:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","limit":200}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"read_plain_file\\|readPlainFile\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs | head -20"}`

---

## Assistant

Let me check the extension guide for preview widgets and other relevant docs:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides -type f -name \"*.md\" | head -15"}`

---

## Assistant

Perfect! Let me read the preview widget guide:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides/add-cm-preview-widget.md"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"\\.pdf\\|\\.json\\|\\.csv\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.ts\" --include=\"*.tsx\" | head -20"}`

---

## Assistant

Perfect! Now let me check the file tree icons to see how files are identified by extension:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/fileTreeIcons.tsx"}`

---

## Assistant

Now let me look at how PDF files are opened in the file tree:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":400,"limit":150}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"\\.pdf\\|resolvePdf\\|openNote\\|openPlainFile\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx | head -20"}`

---

## Assistant

Excellent! Now let me examine the PDF opening code more closely:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":720,"limit":30}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"resolvePdfPath\\|openNote.*pdf\\|pdf.*tab\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

Perfect! Now let me check how the CLI and core handle file types:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"plain.*file\\|PlainFile\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src --include=\"*.rs\" | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","offset":395,"limit":50}`

---

## Assistant

Excellent! Now I have a comprehensive understanding. Let me create a detailed report:

## Comprehensive BrainMap File Type & Editor Widget Pipeline

I've thoroughly analyzed how BrainMap handles different file types and editor widgets. Here's the complete pipeline from file discovery to rendering:

### 1. **File Type Detection & Discovery**

#### File Tree (Frontend):
- **Location**: `crates/app/src/components/Layout/FileTreePanel.tsx`
- Files are discovered through two sources:
  - **Graph nodes**: Files with YAML frontmatter (`.md` files parsed as "notes")
  - **Workspace files**: All files in the workspace (via `listWorkspaceFiles()` Tauri command)
- The file tree builds a unified tree merging both sources, skipping virtual folder nodes
- **Note type detection**: Uses `node.note_type` from graph (11 types: concept, book-note, question, reference, index, argument, evidence, experiment, person, project, folder)

#### File Icons (Frontend):
- **Location**: `crates/app/src/components/Layout/fileTreeIcons.tsx`
- Maps file extensions to icons and colors:
  - `.pdf` → FileText icon (red)
  - `.json` → Braces icon
  - `.csv` → Table icon
  - `.md`, `.txt` → FileText icon
  - Code files, images, audio, video, archives, etc. have specific icons
- Falls back to generic File icon for unknown extensions
- Note types use their own icon set (Lightbulb for concept, BookOpen for book-note, etc.)

---

### 2. **Tab System Architecture**

#### Tab Store:
- **Location**: `crates/app/src/stores/tabStore.ts`
- **4 tab kinds** (`TabState.kind`):
  1. `"note"` → Markdown note with frontmatter (parsed by brainmap-core)
  2. `"plain-file"` → Raw text/binary file (no frontmatter parsing)
  3. `"pdf"` → PDF file (requires `.pdf` extension check)
  4. `"untitled"` → Ephemeral unsaved tab (in-memory only)
- Per-tab state includes: `editedBody`, `editedFrontmatter`, `isDirty`, `viewMode`, `scrollTop`, `cursorPos`
- One tab per file path; tab state is swapped in/out of `editorStore` when switching tabs

#### PDF Detection (Critical):
- **Location**: `crates/app/src/components/Layout/FileTreePanel.tsx:727`
- When clicking a file: check if path ends with `.pdf` (case-insensitive)
- If PDF: create tab with `kind: "pdf"` and call `clearForPdfTab()` to reset editor state
- Otherwise: determine if it's a BrainMap note (`isBrainMapNote` = `!!node.note_type`) and route accordingly

---

### 3. **Editor Dispatch Logic (Router Pattern)**

#### EditorPanel Component:
- **Location**: `crates/app/src/components/Editor/EditorPanel.tsx`
- **Decision tree** (in order):
  1. **PDF Tab** (lines 70-76): If `activeTab.kind === "pdf"` → render `<PdfViewer>`
  2. **Plain File** (lines 87-193): If `activePlainFile && !activeNote`
     - Binary file: show "Binary file — cannot be displayed"
     - Text file: render with MarkdownEditor in 3 modes (edit/preview/raw)
  3. **Untitled Tab** (lines 197-275): If `isUntitled && !activeNote && !activePlainFile`
     - Same 3 modes as plain file
  4. **BrainMap Note** (lines 298-411): If `activeNote`
     - Shows frontmatter form (expanded by default)
     - Renders MarkdownEditor + MarkdownPreview + raw view
     - Shows related notes footer, document outline, type badges

---

### 4. **Editor Component Architecture**

#### MarkdownEditor (CodeMirror 6):
- **Location**: `crates/app/src/components/Editor/MarkdownEditor.tsx`
- **Configurable via props**:
  - `raw?: boolean` → disables markdown decorations/widgets/keybindings
  - `readOnly?: boolean` → read-only mode
- **Extensions** (only if `!raw`):
  - `markdown({ extensions: GFM })` - GitHub-flavored markdown
  - **Decoration extensions**:
    - `calloutDecorations()` - renders blockquotes with borders/colors
    - `listSpacing()` - visual spacing for lists
    - `markdownDecorations()` - fenced code blocks, HR, links
    - `checkboxDecorations()` - checkbox styling
    - `bulletDecorations()` - custom bullet points
    - `orderedListDecorations()` - numbered list styling
    - `arrowDecorations()` - arrow ligature substitution
    - **`mermaidDecorations(isDark)`** - SVG rendering of mermaid diagrams
  - `headingFoldService()` - collapsible headings
  - `search()`, `closeBrackets()`, `history()`, `linkNavigation()`

#### PdfViewer:
- **Location**: `crates/app/src/components/Editor/PdfViewer.tsx`
- Uses `pdfjs-dist` library to render PDF pages
- Features: zoom, page navigation, text selection, highlighting with undo
- Highlight data stored via Tauri command `savePdfHighlights()`

---

### 5. **Mermaid Integration (Deep Dive)**

#### How Mermaid Diagrams Work:
- **File**: `crates/app/src/components/Editor/cmMermaidDecorations.ts` (309 lines)
- **Rendering**: When cursor is OUTSIDE a mermaid code block, shows SVG; when INSIDE, shows raw markdown
- **Architecture**:
  1. **Lazy Loading** (lines 34-48): `import("mermaid")` on first render, cached singleton
  2. **SVG Cache** (lines 54-85): Key by source text, auto-invalidates on content changes, evicts >50 entries
  3. **Async Render** (lines 60-85): Queue sources in `pendingSources` array, render via `updateListener`
  4. **WidgetType** (lines 99-158):
     - `eq()` must compare BOTH source AND cached state (critical!)
     - `toDOM()` renders HTML with SVG from cache, or loading state, or error
     - `estimatedHeight: 200` tells CodeMirror to reserve space
  5. **StateField** (lines 232-256):
     - `buildMermaidDecos()` detects mermaid blocks via `scanFencedBlocks()`
     - Skips rendering if cursor is inside block (cursor-aware)
     - Detects if block is inside a callout and applies border styling
  6. **UpdateListener** (lines 262-270):
     - Called after state updates, consumes `pendingSources` array
     - Triggers async mermaid rendering and caches SVG
  7. **Settings Plugin** (lines 288-298):
     - Watches `mermaidMaxHeight` store setting
     - Updates all rendered SVG elements' `maxHeight` live

#### Mermaid Integration Points:
- **MarkdownEditor** (line 157): calls `mermaidDecorations(isDark)` if `!raw`
- **MarkdownPreview** (TBD): handles code blocks with `language-mermaid` class
- **Theme Handling**: `clearMermaidCache()` called on theme change (line 142)
- **Package.json**: mermaid library included as dependency, dynamically imported

---

### 6. **File Operations (Write Pipeline)**

#### BrainMap Notes (editorStore):
- `updateNote()` - save with frontmatter (calls Tauri `update_node` command)
- `writeRawNote()` - write full YAML + body (calls Tauri `write_raw_note`)

#### Plain Files:
- `writePlainFile()` - write raw text (calls Tauri `write_plain_file`)
- No frontmatter parsing

#### PDF Files:
- Read-only in UI
- `loadPdfHighlights()` - retrieve saved highlights
- `savePdfHighlights()` - persist highlight data

#### Tauri Handlers:
- **Location**: `crates/app/src-tauri/src/handlers.rs`
- `handle_read_plain_file()` - reads file, detects binary vs UTF-8 (lines 400-416)
- `handle_resolve_pdf_path()` - validates PDF exists, checks size (<50MB), returns metadata (lines 420-444)
- `handle_read_note()` - parses YAML frontmatter, returns `NoteDetailDto`
- `handle_create_note()` / `handle_update_node()` - write node data, emit topology events

---

### 7. **Extension Guide Reference**

#### How to Add Preview Widgets:
- **File**: `docs/extension-guides/add-cm-preview-widget.md` (270 lines)
- **17-step checklist** covering:
  1. Identify rendering library
  2. Ensure `scanFencedBlocks()` detects language
  3. Create `cm<Name>Decorations.ts`
  4. Implement lazy loading + initialization
  5. Implement render cache (by source text)
  6. Implement async render function with try/catch on view.dispatch()
  7. Implement WidgetType with proper `eq()` logic
  8. Implement StateField with cursor-aware rendering
  9. Trigger async renders via EditorView.updateListener
  10. Optional: ViewPlugin for live settings
  11. Export extension factory + cache clear function
  12. Register in MarkdownEditor.tsx
  13. Optional: Slash command (cmSlashCommands.ts)
  14. Optional: Render in MarkdownPreview
  15. Add CSS styles
  16. Optional: Configurable setting in uiStore
  17. Write tests

#### Critical Pitfalls:
- **Transaction has no view**: StateField.update can't access `view`; use updateListener instead
- **Widget.eq() must compare cache**: If only comparing source, CM6 reuses DOM and loading state never updates
- **view.dispatch() after await**: View may be destroyed; wrap in try/catch
- **Settings in useEffect deps**: Avoid re-creating editor; read from store in widget or use ViewPlugin
- **CodeMirror line spacing**: Never add `margin`/`padding` to `.cm-line` — breaks mouse hit-testing. Use block widget decorations instead

---

### 8. **File Type Handling Summary**

| File Type | Detection | Tab Kind | Editor | Save Path |
|-----------|-----------|----------|--------|-----------|
| `.md` with YAML | `graph.get_node()` | `"note"` | MarkdownEditor (3 modes) + frontmatter form | Core workspace API |
| `.md` without YAML | File extension | `"plain-file"` | MarkdownEditor | `writePlainFile()` |
| Other text files | File extension | `"plain-file"` | MarkdownEditor | `writePlainFile()` |
| `.pdf` | Ends with `.pdf` | `"pdf"` | PdfViewer | N/A (read-only) |
| Binary files | UTF-8 decode fails | `"plain-file"` | "Binary file — cannot be displayed" | N/A |
| Unsaved content | Manually created | `"untitled"` | MarkdownEditor | Manual save as note |

---

### 9. **Key Architecture Decisions**

1. **Frontend routing determines editor type**, not backend (frontend checks `.pdf` extension, checks `node.note_type`)
2. **Tab system decouples state** from actual file type (per-tab caching via tabStore)
3. **CodeMirror 6 extensions** are the primary widget system (mermaid, tables, callouts, etc.)
4. **Cursor-aware rendering** prevents editing conflicts (show raw source when cursor inside block)
5. **Async rendering with cache** prevents redundant computations and supports theme switching
6. **ViewPlugin pattern** for live settings updates without recreating editor

---

This pipeline elegantly separates concerns: file discovery (file system + graph), type detection (extension + metadata), routing (tab system), and rendering (context-specific editors). The mermaid widget exemplifies best practices for adding new preview widgets with cursor awareness, caching, and async rendering.

---

