# 2026-03-18 — Subagent Transcript: Explore

**Date:** 2026-03-18 11:36:46
**Agent:** Explore
**Agent ID:** a97dfc60b9d939152
**Parent Session:** 210e9b86-df86-4c62-9036-efbf3f129063

---

## User

Very thorough exploration of the markdown editing capabilities in this Tauri+React app's CodeMirror editor. The app is at /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/

Focus on:
1. Markdown syntax highlighting - what flavors are supported? (GFM tables, task lists, strikethrough, footnotes, etc.)
2. Markdown preview/live preview capabilities
3. Any custom CodeMirror extensions or decorations for markdown (e.g., hiding markup, rendering checkboxes inline, image preview)
4. Link handling - can you click links? Internal wiki-links? Auto-linking URLs?
5. Image support - can you insert/view images?
6. Code block support - syntax highlighting within fenced code blocks?
7. Table editing support
8. List handling - auto-continuation of bullet/numbered lists on Enter? Tab to indent/outdent?
9. Heading folding or outline
10. Any custom markdown syntax (the app has `[!source ...]` syntax per git history)
11. Frontmatter handling - is YAML frontmatter hidden or shown in editor?
12. How does the editor handle the separation between frontmatter and body content?

Search for all markdown-related extensions, decorations, widgets, and plugins. Look in src/extensions/, src/editor/, src/components/Editor/ or similar paths.

---

## Assistant

I'll conduct a thorough exploration of the markdown editing capabilities in the BrainMap Tauri+React app. Let me start by understanding the structure and finding markdown-related code.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -type f -name \"*.ts\" -o -name \"*.tsx\" | grep -E \"(editor|markdown|cm|codemirror)\" | head -20"}`

---

## Assistant

Let me check the actual source structure in the app directory:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type d | grep -i editor"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/"}`

---

## Assistant

Excellent! Now let me read the key files to understand the markdown capabilities. Let me start with the main editor component and the various markdown-related utilities:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

Now let me read the decoration files and formatting extensions:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts"}`

---

## Assistant

Let me continue reading more markdown-related extensions:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts","limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCheckboxDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmLinkNavigation.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx"}`

---

## Assistant

Now let me check for custom syntax and frontmatter handling:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkInlineSource.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx"}`

---

## Assistant

Let me check the EditorPanel to see how frontmatter is separated from body:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx","limit":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx","offset":200,"limit":200}`

---

## Assistant

Now let me check for list spacing and bullet decorations:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmListSpacing.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmBulletDecorations.ts"}`

---

## Assistant

Let me check the callout types to understand the custom syntax better:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutTypes.ts"}`

---

## Assistant

Now let me check the package.json to see which markdown libraries are installed:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json"}`

---

## Assistant

Let me check for any table-related utilities and the callout preprocessing:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/tableFormatter.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutPreprocess.ts"}`

---

## Assistant

Let me check the CSS to see styling for the markdown features:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"\\.cm-\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -60"}`

---

## Assistant

Perfect! Now I have a comprehensive understanding of the markdown capabilities. Let me compile my findings into a thorough report.

## Markdown Editing Capabilities - BrainMap Tauri App

Based on my thorough exploration of the codebase, here's what I found:

### 1. **Markdown Syntax Highlighting - GFM Extended**

- **Base**: Uses `@codemirror/lang-markdown` with **GFM (GitHub Flavored Markdown)** extensions via `@lezer/markdown`
- **Supported flavors**:
  - Tables (with alignment support)
  - Task lists (checkboxes)
  - Strikethrough (`~~text~~`)
  - All standard markdown: headings, emphasis, strong, lists, links, images, code
  - Inline code with syntax highlighting (via `@lezer/highlight`)
  - Blockquotes

### 2. **Live Preview / Markdown Preview**

- **Component**: `MarkdownPreview.tsx` 
- **Engine**: `react-markdown` v10.1.0 with plugins:
  - `remark-gfm` (GitHub Flavored Markdown)
  - `remarkCalloutMerge` (custom)
  - `remarkInlineSource` (custom for `[!source ...]` syntax)
  - `rehype-raw` (allows raw HTML)
- **View modes**: Three-tab UI (Edit/Preview/Raw) in EditorPanel
- **Three-way editor**: Edit mode shows CodeMirror with decorations, Preview shows rendered HTML, Raw shows YAML+body unprocessed

### 3. **Custom CodeMirror Extensions & Decorations**

**A. Callout Blocks** (`cmCalloutDecorations.ts`):
- Custom syntax: `[!type] title {` ... `}`
- Four callout types: `ai-answer`, `source`, `question`, `key-insight` (extensible)
- Features:
  - Tinted background + colored left border
  - Inline header widget (cursor-aware: shows raw syntax when editing)
  - Fold markers for collapsing callout bodies
  - SVG icons for each type
- Converted to blockquotes (`>`) for markdown rendering

**B. Checkbox Decorations** (`cmCheckboxDecorations.ts`):
- Replaces `[ ]`/`[x]` with interactive `<input type="checkbox">` widgets
- Cursor-aware: shows raw syntax when cursor on same line
- Clicking toggles checkbox, marks document dirty, triggers auto-save
- Fully undoable via history

**C. Bullet Decorations** (`cmBulletDecorations.ts`):
- Replaces `-`, `*`, `+` with centered bullet `•`
- Cursor-aware: shows raw marker when cursor on same line
- Works with nested lists

**D. Markdown Line Decorations** (`cmMarkdownDecorations.ts`):
- Horizontal rules: cursor-aware dimming
- Blockquotes: left border + tint
- Fenced code blocks: background + border, language-aware
- Inline code: background pill styling
- Image URLs: dimmed via cursor-aware mark
- Link markup: dimmed brackets/URLs when not editing
- **Tables**: Major feature — see below

**E. List Spacing** (`cmListSpacing.ts`):
- Increases line-height (2.2) on list lines (bullets, numbered)
- Regex: `^\s*(?:[-*+]|\d+[.)]) `

**F. Source Citations** (custom `[!source ...]` syntax):
- Inline: `[!source citation text]`
- Rendered as styled `<span class="inline-source">` in preview
- Plugin: `remarkInlineSource.ts`

### 4. **Link Handling** (`cmLinkNavigation.ts`)

- **Editor**: Cmd+Click (Mac) or Ctrl+Click (Windows/Linux) on markdown links navigates
- **Preview**: Cmd/Ctrl+Click on links opens related notes
- **Local links**: Resolved via `resolveNotePath()` - supports relative paths
- **External links**: Open in new tab with `target="_blank"`
- **Visual feedback**: Pointer cursor appears when hovering over clickable links while holding modifier key
- **Wiki-style links**: Not explicitly mentioned, but local note links work via path resolution

### 5. **Image Support**

- **Display**: Works via standard markdown syntax `![alt](url)`
- **URLs are dimmed** in editor when cursor not on same line
- **External images**: Supported (http/https)
- **Local images**: Can link to files via relative paths
- **No inline preview** in editor; images render in Preview tab

### 6. **Code Block Support**

- **Fenced blocks**: ` ``` ` or `~~~` delimiters
- **Syntax highlighting**: Via Lezer markdown parser (recognizes language tags)
- **Visual styling**: Different background for opening/closing/body lines
- **Language tags**: Supported in fence opening line (e.g., ` ```javascript `)
- **Inline code**: Backtick-wrapped with pill background decoration

### 7. **Table Editing Support** (Major Feature)

**Editor Mode**:
- Tables detected when cursor outside → rendered as interactive HTML widget
- When cursor inside table → shows raw markdown with line decorations (header/delimiter/row)
- Right-click context menu → "Format Table" option
- Format button on unformatted tables
- `tableFormatter.ts`: Aligns columns, pads cells, preserves alignment (`:`, `:-`, `-:`)

**Formatting rules**:
- Cells padded to widest in column
- Single space padding inside pipes: `| cell |`
- Delimiter dashes match column width
- Escaped pipes (`\|`) handled correctly

**Markdown parsing**: 
- Cell parser via `parseCells()` 
- Alignment detection: `center` (`:---:`), `right` (`---:`), `left` (default)
- Renders as styled `<table>` with alternating row colors

### 8. **List Handling**

**Auto-continuation**: No explicit mention in code, but:
- List items detected by regex: `^\s*(?:[-*+]|\d+[.)]) `
- Ordered lists: `toggleOrderedList()` auto-increments numbering
- Unordered lists: `toggleLinePrefix()` with `-`, `*`, `+`
- Indentation: Not explicitly handled, likely via CodeMirror's default Tab behavior

**Formatting keybindings**:
- No explicit list continuation on Enter, but can use toolbar/keybindings

### 9. **Heading Folding or Outline**

- **Code folding**: Extension loaded (`foldService`, `codeFolding`, `foldKeymap` from `@codemirror/language`)
- **Callout folding**: Explicitly supported via fold markers
- **Headings**: No explicit fold markers for headings in the code
- **Outline**: No dedicated outline panel visible in code

### 10. **Custom Markdown Syntax**

**[!source ...] Citation Syntax**:
- Inline: `[!source author name, publication]`
- Rendered as styled inline span with "source" label
- Only processed in phrasing content (not in code blocks)
- Handled by `remarkInlineSource` plugin

**[!type] Callout Syntax** (Brace-delimited):
- `[!ai-answer] Title {` ... `}`
- Preprocessed to blockquote syntax before markdown parsing
- Converted: `> [!type] Title` followed by `> body lines`
- Four built-in types; extensible via `calloutTypes.ts`

### 11. **Frontmatter Handling**

**Structure**:
- YAML frontmatter separated from body
- Editor stores separately: `editedFrontmatter` vs `editedBody`
- Raw mode shows both (unseparated)
- Edit mode shows only body in CodeMirror; frontmatter in separate `FrontmatterForm`

**Editable fields**:
- Title, Type (dropdown), Status (draft/review/final/archived)
- Tags (pill input), Source, Summary (textarea)
- Created/Modified (read-only)
- Extra fields (key-value editor)
- Links (dedicated LinksEditor)

**Display**:
- Hero section shows title, type badge (colored), tags, status dot, source
- Metadata form is toggle-expandable ("Edit Metadata")
- Frontmatter NOT shown in editor pane itself

**Separation**:
- Backend parses YAML frontmatter (Rust `workspace.rs`)
- Frontend receives as `NoteDetail` with separate `frontmatter` object
- On save: reconstructs as YAML block + body (via `json_to_yaml` in DTO layer)

### 12. **Additional Features**

**Keyboard Shortcuts** (formattingKeymap):
- `Cmd-B`: Bold (`**text**`)
- `Cmd-I`: Italic (`*text*`)
- `Cmd-Shift-X`: Strikethrough (`~~text~~`)
- `Cmd-E`: Inline code (`` `text` ``)
- `Cmd-K`: Insert link (`[](url)`)
- `Cmd-Shift-1/2/3`: Headings (H1-H3)
- History: `Cmd-Z` undo, `Cmd-Shift-Z`/`Cmd-Y` redo

**Cursor-Aware Decorations** (Theme):
- Many features toggle rendering based on cursor position
- When cursor on same line: show raw syntax (checkboxes, bullets, links, images)
- When cursor elsewhere: show rendered/decorated version
- Prevents editing visual confusion

**CSS Zoom Support**:
- Patches CodeMirror scale detection for `document.documentElement.zoom`
- Corrects mouse hit-testing when document is zoomed

**Line Numbers**:
- Toggleable via button in editor toolbar
- Persisted in UI preferences

### **File Structure Summary**

Key editor components:
- `/crates/app/src/components/Editor/MarkdownEditor.tsx` - Main CodeMirror wrapper
- `/crates/app/src/components/Editor/MarkdownPreview.tsx` - React-markdown preview
- `/crates/app/src/components/Editor/EditorPanel.tsx` - Three-view container (Edit/Preview/Raw)
- `/crates/app/src/components/Editor/FrontmatterForm.tsx` - Metadata editing UI
- Decoration files: `cm*.ts` (callout, checkbox, bullet, markdown, links, formatting, list spacing)
- Remark plugins: `remark*.ts` (calloutMerge, inlineSource)
- Utilities: `tableFormatter.ts`, `calloutPreprocess.ts`, `calloutTypes.ts`

**Key insight from CLAUDE.md**: CodeMirror line spacing rule—never add `margin`/`padding` to `.cm-line`; use block widget decorations instead to preserve mouse hit-testing.

---

