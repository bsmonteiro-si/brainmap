# 2026-03-18 — Subagent Transcript: Explore

**Date:** 2026-03-18 15:03:35
**Agent:** Explore
**Agent ID:** a68ba8fc67cba9291
**Parent Session:** 210e9b86-df86-4c62-9036-efbf3f129063

---

## User

Medium-depth exploration of the BrainMap editor at /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/ to understand what's needed for Editor Phase C (polish features). I need to understand the current state for these features:

1. **Heading folding**: Check if `@codemirror/language` is already imported. Look at `MarkdownEditor.tsx` to see if `foldGutter`, `foldKeymap`, or `foldService` are used. Check if callout folding exists in `cmCalloutDecorations.ts` — how does it implement folding? We want to reuse that pattern for headings.

2. **Editor context menu**: Check `cmCopyReference.ts` and `cmMarkdownDecorations.ts` for existing context menu handlers. How many separate context menus exist? What do they show? We need to consolidate into one unified right-click menu.

3. **Table creation**: Read `EditorToolbar.tsx` to understand the toolbar structure and how buttons insert content. Check if there's already a table-related button or insert function. Check `cmMarkdownDecorations.ts` for table formatting logic that we could reuse.

4. **Inline image preview**: Check how images are currently handled in `cmMarkdownDecorations.ts`. Is there already image URL dimming? What widget/decoration pattern would work for inline preview?

5. Read the current `MarkdownEditor.tsx` to see the full extension list and `EditorToolbar.tsx` for the toolbar layout.

Report exact file paths and line numbers for all integration points.

---

## Assistant

I'll explore the BrainMap editor codebase to understand the current state for these polish features. Let me start with a systematic search.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -type f -name \"*.tsx\" -o -name \"*.ts\" | grep -E \"(Editor|editor)\" | head -20"}`

---

## Assistant

Let me focus on the actual source files.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"src/components/Editor/*.tsx","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"src/extensions/**/*.ts","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f \\( -name \"*.tsx\" -o -name \"*.ts\" \\) | grep -v node_modules | head -40"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components -type f \\( -name \"*.tsx\" -o -name \"*.ts\" \\) 2>/dev/null | head -50"}`

---

## Assistant

Great! Now let me read the key files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorToolbar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts"}`

---

## Assistant

Now let me check the other relevant files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCopyReference.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts"}`

---

## Assistant

Now let me check for any existing CSS or styling files related to the editor:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f \\( -name \"*.css\" -o -name \"*.scss\" \\) 2>/dev/null | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","limit":200}`

---

## Assistant

Let me check for context menu and editor-related CSS:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"context-menu\\|editor-toolbar\\|cm-\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -60"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"context-menu\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1850,"limit":150}`

---

## Assistant

Now let me check for any other table-related or image-related code:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"tableFormatter\\|insertTable\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/*.ts 2>/dev/null"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/tableFormatter.ts","limit":100}`

---

## Assistant

Perfect! Now let me check for any heading-related code or fold-related imports:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"foldGutter\\|foldKeymap\\|foldService\\|codeFolding\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/*.ts 2>/dev/null | head -20"}`

---

## Assistant

Excellent! Let me get a quick snapshot of package.json to check dependencies:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 30 '\"dependencies\"' /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json | head -40"}`

---

## Assistant

Perfect! Now I have a comprehensive understanding of the editor. Let me compile my findings into a detailed report.

## Exploration Results: BrainMap Editor Phase C Polish Features

I've completed a thorough medium-depth exploration of the BrainMap editor codebase. Here are my findings for each of the four features:

### 1. **Heading Folding** ✓ Infrastructure Ready

**Current State:**
- `@codemirror/language` is already imported in `MarkdownEditor.tsx` (line 8) for `syntaxHighlighting` and related features
- **Callout folding is already fully implemented** (lines 16, 453-551 in `cmCalloutDecorations.ts`):
  - Uses `foldService.of()` to define fold ranges (line 453)
  - Uses `codeFolding()` extension (line 550)
  - Uses `foldKeymap` for fold/unfold shortcuts (line 551)
  - Implements cursor-aware folding with closing brace detection

**Integration Points:**
- File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts` (lines 16, 453-488, 550-551)
- MarkdownEditor extension list: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx` (lines 6, 16, 100-112)
- Already includes `history`, `historyKeymap`, `defaultKeymap` (lines 6, 119-128)

**Implementation Pattern for Headings:**
The callout pattern can be reused directly — create a `headingFoldService` that detects heading lines (`^#{1,6}\s`) and folds from the end of the heading line to the start of the next heading at the same or higher level. Uses the same `foldService.of()` pattern with fold ranges returned from a scanner function.

---

### 2. **Editor Context Menu** ⚠️ Multiple Menus, Consolidation Needed

**Current State:**
There are **two separate context menus** in the editor:

1. **Copy File Reference Menu** (lines 27-136 in `cmCopyReference.ts`)
   - Triggered on right-click with text selected
   - Shows "Copy File Reference" item
   - Uses `EditorView.domEventHandlers` + custom DOM manipulation
   - Positioned with `style.left`/`style.top`, clamped to viewport

2. **Format Table Menu** (lines 514-588 in `cmMarkdownDecorations.ts`)
   - Triggered on right-click when cursor is inside a table with no selection
   - Shows "Format Table" item
   - Uses similar pattern: `EditorView.domEventHandlers` + `showFormatTableMenu()`
   - Has a separate `ctxMenuEl` and `ctxDismiss` state

**Styling:**
- Context menu CSS at lines 1864-1899 in `App.css`:
  - Base: `.context-menu` (fixed position, 200 z-index, border-radius 6px)
  - Item: `.context-menu-item` (6-14px padding, hover with `--bg-tertiary`)
  - Separator: `.context-menu-separator`
  - Danger variant: `.context-menu-item--danger`

**Consolidation Challenges:**
- Two independent state systems (`menuEl`/`activeDismiss` vs `ctxMenuEl`/`ctxDismiss`)
- Two separate contextmenu event handlers that don't coordinate
- Current logic: if text selected → show copy menu; if no selection + in table → show format table

**Required Changes:**
1. Create unified context menu handler that can show multiple items
2. Merge menu state into a single system
3. Add logic to detect if both conditions are met (need priority order)

---

### 3. **Table Creation** ✓ Foundations Exist

**Current Table Support:**
- **Full table parsing & formatting** exists in `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/tableFormatter.ts`:
  - `parseCells()` (line 14) — parses table cell content with escaped pipe handling
  - `parseAlignment()` (line 32) — detects `:---:`, `---:`, `---` alignment
  - `formatTable()` (line 47) — auto-formats with column alignment
  - `DELIM_CELL_RE` regex (line 41) for delimiter validation

- **Table rendering as widget** in `cmMarkdownDecorations.ts` (lines 180-244):
  - `TableWidget` class renders HTML table with `<thead>`, `<tbody>`
  - Renders inline markdown inside cells (bold, italic, code) via `renderInlineMarkdown()` (line 173)
  - Shows "Format Table" button when unformatted (lines 226-232)

- **Format Table click handler** (lines 497-509) — responds to "Format Table" button click

- **Table detection** (lines 469-476) — `findTableRange()` finds table boundaries

**Table Insertion Missing:**
- No `insertTable()` function in `cmFormatting.ts`
- **Not in EditorToolbar.tsx** (no table button; only H1-H3, lists, blockquote, link, HR, callout)

**To Add:**
1. Create `insertTable()` in `cmFormatting.ts` that inserts 3×3 template:
   ```
   | Header 1 | Header 2 | Header 3 |
   | --- | --- | --- |
   | Cell | Cell | Cell |
   ```
2. Add table button to EditorToolbar (after HR button)
3. Use existing `formatTable()` on new table immediately for alignment

---

### 4. **Inline Image Preview** ⚠️ Currently Dimming Only

**Current Image Handling:**
- **Image URL dimming** in `cmMarkdownDecorations.ts` (lines 319-332):
  - Detects `Image` nodes from syntax tree (line 320)
  - Finds URL portion from `](` to closing `)` (lines 325-328)
  - Marks with `imageUrlMark` decoration for CSS opacity 0.4 (line 264)
  - **Cursor-aware**: hidden when cursor is on the same line (line 322)

- **CSS for image URL** (`App.css` line 1206):
  ```css
  .cm-image-url { opacity: 0.4; font-size: 0.85em; }
  ```

**No Inline Preview Widget:**
- Images are **not** replaced with rendered previews
- Only the URL text is dimmed; markdown syntax `![alt](url)` remains visible
- Unlike tables, which replace with `TableWidget`, there's no `ImageWidget`

**To Implement:**
1. Create `ImagePreviewWidget` class extending `WidgetType` (like `TableWidget` and `CalloutHeaderWidget`)
2. In `buildDecorations()`, detect when cursor is **not** on image line:
   - Extract image URL
   - Fetch/load image (async challenge with CodeMirror)
   - Replace markdown syntax with rendered `<img>` tag
3. Add `estimatedHeight` getter to widget for height map accuracy
4. Style with CSS for proper alignment and sizing

**Challenge:** Fetching image URLs in a CodeMirror extension requires async handling; likely needs:
- Store image URLs in a cache after parsing
- Use lazy loading pattern or placeholder SVG
- Ensure click through to edit mode works

---

### Summary Table: Integration Points

| Feature | File Path | Key Functions/Classes | Line Numbers |
|---------|-----------|----------------------|--------------|
| **Heading Fold** (pattern) | `cmCalloutDecorations.ts` | `calloutFoldService`, `foldService.of()` | 453-488, 550-551 |
| **Copy Ref Menu** | `cmCopyReference.ts` | `copyReferenceMenu()`, `showMenu()`, `EditorView.domEventHandlers` | 27-126 |
| **Table Format Menu** | `cmMarkdownDecorations.ts` | `showFormatTableMenu()`, `tableContextMenu` | 514-588, 571-586 |
| **Table Parser** | `tableFormatter.ts` | `formatTable()`, `parseCells()` | 47-100+ |
| **Table Widget** | `cmMarkdownDecorations.ts` | `TableWidget` class | 180-244 |
| **Table Rendering** | `cmMarkdownDecorations.ts` | Table node detection & widget replacement | 334-372 |
| **Image Dimming** | `cmMarkdownDecorations.ts` | `imageUrlMark` decoration, Image node detection | 264, 319-332 |
| **Editor Extensions** | `MarkdownEditor.tsx` | Extensions array, already includes `calloutDecorations()` | 100-112, 546-554 |
| **Toolbar** | `EditorToolbar.tsx` | `BUTTONS` array, callout picker | 24-40, 86-122 |
| **Context Menu Styles** | `App.css` | `.context-menu*` classes | 1864-1899 |
| **CM Editor Styles** | `App.css` | `.cm-table-*`, `.cm-image-url`, `.cm-*` classes | 1059-1336 |

---

### Code Location Summary (Absolute Paths)

**Editor Core:**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx` — Main editor component, extension list
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorToolbar.tsx` — Toolbar buttons

**Extension Modules:**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts` — **Callout folding pattern (reuse for headings)**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts` — **Table widget, image dimming, table context menu**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCopyReference.ts` — **Copy reference context menu**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts` — Formatting commands (add `insertTable()` here)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/tableFormatter.ts` — Pure table formatting functions

**Styling:**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` — All CM editor and context menu styles

---

**Key Insights for Phase C:**

1. **Heading folding** has a ready-made pattern in callout folding; implementation straightforward
2. **Context menus need consolidation** — currently two separate implementations that could conflict
3. **Table insertion** just needs an `insertTable()` function + toolbar button; parsing/rendering already done
4. **Image preview** is the most complex — requires widget creation and async image loading strategy

---

