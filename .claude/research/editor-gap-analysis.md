# BrainMap Editor Gap Analysis

**Date:** 2026-03-17
**Purpose:** Identify what's missing to make BrainMap a functional, working text editor comparable to Obsidian, Typora, and similar markdown editors.

---

## Current State Summary

The editor is built on CodeMirror 6 with a strong set of BrainMap-specific features (callouts, link navigation, source citations, interactive checkboxes, table rendering). It has multi-tab support, auto-save, conflict detection, formatting toolbar, and three view modes (Edit/Preview/Raw). However, several fundamental text editor features are absent or incomplete.

---

## Gap Analysis

### Tier 1 — Critical Missing Features (Expected in any text editor)

| # | Feature | Status | Impact |
|---|---------|--------|--------|
| 1 | **Find & Replace** | ❌ Not implemented | Cmd+F/Cmd+H don't work. Users can't search within a document. This is the #1 gap. |
| 2 | **List auto-continuation** | ❌ Not implemented | Pressing Enter at end of a `- item` or `1. item` doesn't auto-insert the next bullet/number. Must type markers manually. Obsidian/Typora do this. |
| 3 | **Smart indent on Enter** | ❌ Not implemented | No indent continuation for nested lists. No `indentOnInput` behavior. |
| 4 | **Bracket/quote auto-close** | ❌ Not implemented | Typing `(`, `[`, `{`, `"`, `` ` `` doesn't auto-insert closing pair. CM6 has `closeBrackets()` extension. |
| 5 | **Tab key indent/outdent** | ⚠️ Partial | Tab key behavior unclear — no explicit `indentWithTab` or list indent/outdent handling. Shift+Tab for outdent not wired. |

### Tier 2 — Important Missing Features (Expected in markdown editors)

| # | Feature | Status | Impact |
|---|---------|--------|--------|
| 6 | **Smart paste** | ❌ Not implemented | Pasting a URL while text is selected should auto-wrap as `[selected text](url)`. Pasting an image from clipboard should insert/save it. |
| 7 | **Link/note autocomplete** | ❌ Not implemented | Typing `[[` or `](` should show autocomplete with existing note paths. Currently no autocomplete at all. |
| 8 | **Document outline** | ❌ Not implemented | No heading outline panel. Would help navigation in long documents. |
| 9 | **Heading folding** | ❌ Not implemented | Can't fold/collapse content under headings. `foldService` is loaded but no heading fold provider registered. |
| 10 | **Word/character count** | ❌ Not implemented | No word count, character count, or reading time in status bar or editor. |
| 11 | **Editor context menu** | ❌ Not implemented | Right-click in editor shows browser default menu. No Cut/Copy/Paste/formatting options. (Only `copyReferenceMenu` exists for file refs.) |

### Tier 3 — Quality-of-Life Features (Nice to have, common in modern editors)

| # | Feature | Status | Impact |
|---|---------|--------|--------|
| 12 | **Image paste/drop into editor** | ❌ Not implemented | Can't paste images from clipboard or drag image files into the editor. No image management. |
| 13 | **Inline image preview** | ❌ Not implemented | Images only render in Preview mode. Editor shows raw `![alt](url)` syntax. |
| 14 | **Scroll sync (Edit ↔ Preview)** | ❌ Not implemented | Switching between Edit and Preview loses scroll position context. |
| 15 | **Spell checking** | ❌ Not implemented | No spell check. Browser native spell check may work partially but isn't styled/integrated. |
| 16 | **Table creation shortcut** | ❌ Not implemented | Tables must be typed manually. No "Insert Table" in toolbar or command palette. |
| 17 | **Indent configuration** | ❌ Not implemented | No tabs-vs-spaces toggle, no indent size setting. Uses CM6 defaults. |
| 18 | **Line wrap toggle** | ❌ Not implemented | Line wrapping is always on. No toggle in settings or toolbar. |
| 19 | **Code block language autocomplete** | ❌ Not implemented | No autocomplete for language tags when typing ` ```js `. |
| 20 | **Minimap** | ⚠️ Setting exists but unclear if implemented | `minimap` appears in settings UI but no CodeMirror minimap extension found. |

---

## What's Already Working Well

These features are solid and comparable to other markdown editors:

- **Multi-tab editing** with dirty indicators, scroll/cursor restoration
- **Auto-save** (1500ms debounce) + manual Cmd+S + save-on-blur
- **Conflict detection** with Keep Mine / Accept Theirs resolution
- **Formatting toolbar** with keyboard shortcuts (Bold, Italic, Strikethrough, Code, Headings, Lists, Links, Callouts)
- **Undo/redo** via CM6 history + separate frontmatter undo stack
- **Interactive checkboxes** (click to toggle)
- **Table rendering** (cursor-aware: rendered HTML when not editing, raw markdown when editing)
- **Table formatting** (right-click or button to auto-align)
- **Cursor-aware decorations** (bullets, links, images, checkboxes show raw syntax only when editing that line)
- **Link navigation** (Cmd+Click to follow links)
- **Callout blocks** with folding, icons, colored borders
- **Source citations** (`[!source ...]` inline syntax)
- **Line numbers** (toggleable)
- **Code folding** (extension loaded, works for callouts)
- **View modes** (Edit / Preview / Raw)
- **Theming** (8 themes + system detection, independent editor/files themes)
- **Font customization** (family + size for editor and UI independently)
- **Global zoom** (Cmd+/-, 0.5x–2.0x range)
- **Command palette** (Cmd+P)
- **Navigation history** (Cmd+[/])
- **File tree** with rename, delete, move (drag & drop), new file/folder creation

---

## Detailed Notes Per Gap

### 1. Find & Replace

**CM6 has this built-in:** `@codemirror/search` provides `search()`, `searchKeymap`, `openSearchPanel`, `findNext`, `findPrevious`, `replaceNext`, `replaceAll`. Adding this is straightforward — import and add to extensions array + keymap.

**Scope:** Single-document search. Cross-file search already exists in the Search tab (left panel via FTS5).

### 2. List Auto-Continuation

CM6's `markdown()` language support includes `insertNewlineContinueMarkup` in its keymap, which handles:
- Continuing `- `, `* `, `+ ` bullet lists
- Continuing `1. `, `2. ` numbered lists (auto-incrementing)
- Continuing `> ` blockquotes
- Empty list item Enter → removes the marker (ends the list)

This is available via `markdownKeymap` from `@codemirror/lang-markdown` but is **not currently included** in the editor's keymap array.

### 3. Smart Indent

Related to list continuation. `indentOnInput` from `@codemirror/language` handles auto-indentation. Tab/Shift+Tab for list indent/outdent needs `indentMore`/`indentLess` from `@codemirror/commands`.

### 4. Bracket/Quote Auto-Close

`closeBrackets()` and `closeBracketsKeymap` from `@codemirror/autocomplete` handles this. Pairs: `()`, `[]`, `{}`, `""`, `` `` ``. For markdown, may want to also auto-close `**`, `__`, `~~`.

### 5. Tab Key Behavior

`indentWithTab` from `@codemirror/commands` binds Tab/Shift+Tab. May conflict with accessibility (Tab should move focus). Alternative: use Tab only when inside a list or code block.

### 6. Smart Paste

Requires a custom `EditorView.domEventHandlers({ paste: ... })` handler that:
- Detects URL in clipboard + text selected → wraps as `[text](url)`
- Detects image in clipboard → saves to workspace, inserts `![](path)`

### 7. Link/Note Autocomplete

Requires `autocompletion()` from `@codemirror/autocomplete` with a custom completion source that:
- Triggers on `[[` or `](`
- Queries the workspace for matching note paths
- Inserts the selected path

### 8. Document Outline

A panel component that extracts headings from the document (via CM6 syntax tree or regex) and renders them as a clickable list. Could be a new tab in the right panel or a dropdown.

### 9. Heading Folding

Register a custom `foldService` that recognizes heading ranges (from `#` to the next heading of same/higher level or end of document).

### 10. Word/Character Count

Simple `EditorView.updateListener` that counts words/chars on each change and displays in status bar or editor footer.

---

## Recommended Implementation Priority

**Phase A — Foundational (make it feel like a real editor):**
1. Find & Replace (Tier 1, #1)
2. List auto-continuation + smart indent (Tier 1, #2 + #3)
3. Bracket/quote auto-close (Tier 1, #4)
4. Tab indent/outdent (Tier 1, #5)

**Phase B — Markdown-specific (close the gap with Obsidian/Typora):**
5. Smart paste (URL → link, image paste) (Tier 2, #6)
6. Link/note autocomplete on `[[` (Tier 2, #7)
7. Word count in status bar (Tier 2, #10)
8. Document outline panel (Tier 2, #8)

**Phase C — Polish:**
9. Heading folding (Tier 2, #9)
10. Editor context menu (Tier 2, #11)
11. Table creation from toolbar (Tier 3, #16)
12. Inline image preview (Tier 3, #13)
13. Image paste/drop (Tier 3, #12)

---

## Key Files to Modify

| File | Changes |
|------|---------|
| `src/components/Editor/MarkdownEditor.tsx` | Add extensions: search, closeBrackets, autocompletion, indentWithTab, markdownKeymap |
| `src/components/Editor/EditorPanel.tsx` | Outline panel toggle, word count display |
| `src/components/Editor/EditorToolbar.tsx` | "Insert Table" button, possibly "Find" button |
| `src/stores/editorStore.ts` | Word count state, outline extraction |
| `src/components/StatusBar.tsx` | Word count display |
| `src/extensions/cmSmartPaste.ts` | New: smart paste handler |
| `src/extensions/cmNoteAutocomplete.ts` | New: note path autocomplete |
| `src/extensions/cmOutline.ts` | New: heading extraction for outline |
| `src/extensions/cmHeadingFold.ts` | New: heading fold provider |

---

## References

- CM6 Search: https://codemirror.net/docs/ref/#search
- CM6 Autocomplete: https://codemirror.net/docs/ref/#autocomplete
- CM6 Close Brackets: https://codemirror.net/docs/ref/#autocomplete.closeBrackets
- CM6 Commands (indent): https://codemirror.net/docs/ref/#commands
- `@codemirror/lang-markdown` keymap: includes `insertNewlineContinueMarkup`
