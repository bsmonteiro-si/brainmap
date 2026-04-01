# 2026-03-18 — Subagent Transcript: Explore

**Date:** 2026-03-18 19:19:25
**Agent:** Explore
**Agent ID:** a7cd348880d4c0e7d
**Parent Session:** 5e2d1daa-ae5d-4ab0-928b-7769d5294d64

---

## User

I need to understand the CodeMirror 6 editor setup in this project, specifically:

1. How code blocks are currently handled/decorated in the editor (look for any fenced code block handling, syntax highlighting for code blocks, or decorations)
2. Any existing "preview when cursor away" patterns — for example, do they already have inline previews for images, links, or other markdown elements that show a rendered version when the cursor moves away?
3. The callout/decoration system — I see references to `cmCalloutDecorations.ts` and `calloutTypes.ts`. How do these work? They might be a pattern to follow.
4. What CodeMirror extensions are currently loaded (look for the main editor setup/config)
5. Any existing use of `Decoration.replace` or `Decoration.widget` patterns that hide source and show rendered content

Search in `crates/app/src/components/Editor/` and related directories. Be thorough — look at all decoration files, the editor component, and any widget implementations.

---

## Assistant

I'll systematically search the Editor component and related files to understand the CodeMirror setup, decoration patterns, and preview mechanisms.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/**/*.ts*"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor -type f -name \"*.ts\" -o -name \"*.tsx\" | head -30"}`

---

## Assistant

Now let me read the key files to understand the CodeMirror setup:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutTypes.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts"}`

---

## Assistant

Now let me check for more extension files and look for checkbox decorations, and see if there are any fenced code block handling patterns:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCheckboxDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmBulletDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmListSpacing.ts"}`

---

## Assistant

Now let me look at a few more key extension files to understand the full picture:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmHeadingFold.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmSlashCommands.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor -name \"*.css\" -o -name \"*.scss\" | head -10"}`

---

## Assistant

Now let me search for any CSS related to these decorations:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*.css\" | head -20"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"cm-fenced-code\\|cm-inline-code\\|cm-callout\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.css\" --include=\"*.scss\" | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","limit":200}`

---

## Assistant

Let me continue reading the CSS to see the decoration styles:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"cm-fenced-code\\|cm-inline-code\\|cm-callout\\|cm-source\\|cm-example\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Perfect! Now let me read the actual CSS for these decorations:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1114,"limit":150}`

---

## Assistant

Perfect! Now I have a comprehensive understanding. Let me create a detailed summary document based on all the research:

## Summary: CodeMirror 6 Editor Setup & Decoration Patterns

Based on my thorough exploration of the codebase, here's what I found:

### 1. **CodeMirror 6 Extensions Loaded**

In `MarkdownEditor.tsx` (lines 128-180), the editor loads these extensions:

**Always loaded:**
- `markdown()` with GFM grammar (Lezer-based syntax tree)
- `syntaxHighlighting()` with custom `buildMarkdownHighlight()` (heading sizes, emphasis, code styling)
- `history()` + undo/redo keymaps
- `search()` + `closeBrackets()` + custom keymaps
- `indentUnit`, `lineWrapping`, `lineNumbers()` (all configurable)

**Markdown-specific (unless `raw` mode):**
- `linkNavigation()` — handles Cmd/Ctrl+click on links
- `calloutDecorations()` — callout block styling + folding
- `listSpacing()` — adds CSS classes to list lines
- `markdownDecorations()` — handles HR, blockquotes, fenced code, inline code, tables, images, links, inline citations
- `checkboxDecorations()` — interactive task list checkboxes
- `bulletDecorations()` — replaces `-`/`*`/`+` with bullet character
- `headingFoldService()` — fold headings by level
- `editorContextMenu()` — right-click actions
- `createSlashAutocompletion()` — `/` command palette
- `smartPaste()` — intelligent paste handling

**Custom theme:** `darkEditorTheme` with CSS variables

### 2. **Code Block Handling**

**fenced code blocks are NOT decorated with replace widgets or special preview modes** — they are:

- **Line-decorated** (not hidden) in `cmMarkdownDecorations.ts`:
  - Opening line gets `cm-fenced-code cm-fenced-code-start` class
  - Body lines get `cm-fenced-code` class
  - Closing line gets `cm-fenced-code cm-fenced-code-end` class
  - CSS in App.css (lines 1129-1145) applies background color, borders, rounded corners

- **No syntax highlighting** for the code inside (the GFM parser handles structure but no language-specific highlighting)
- **Can be folded** via the heading fold service (the scanner in `scanFencedBlocks()` in `cmMarkdownDecorations.ts` tracks them)
- **Used for skip ranges** in inline citation scanning (code blocks are excluded from citation decoration)

### 3. **"Preview When Cursor Away" Patterns — EXTENSIVELY USED**

This is a CORE pattern in the editor. Multiple examples:

#### **Pattern A: Callout Header Replacement** (`cmCalloutDecorations.ts`)
- When cursor is NOT on the header line: replace `[!type title] {` with a rendered widget showing icon + label + title
- When cursor IS on header line: show raw syntax
- Uses `Decoration.replace()` with `CalloutHeaderWidget`
- Closing `}` hidden via `ZeroHeightWidget` when cursor away, shown when cursor on line

#### **Pattern B: Checkbox Replacement** (`cmCheckboxDecorations.ts`)
- When cursor NOT on checkbox line: replace `[ ]`/`[x]` with interactive `<input type="checkbox">`
- When cursor on same line: show raw bracket syntax
- Uses `Decoration.replace()` with `CheckboxWidget`
- Click toggles checkbox (normal edit, marks dirty, undoable)

#### **Pattern C: Bullet Replacement** (`cmBulletDecorations.ts`)
- When cursor NOT on bullet line: replace `-`/`*`/`+` with `•` widget
- When cursor on same line: show raw marker
- Uses `Decoration.replace()` with `BulletWidget`

#### **Pattern D: Table Rendering** (`cmMarkdownDecorations.ts`)
- When cursor NOT inside table: replace entire table markdown with rendered HTML `<table>` widget
- When cursor inside table: show raw markdown with line decorations
- Uses `Decoration.replace()` with `TableWidget` (computed height via `estimatedHeight` getter)
- Has "Format Table" button on unformatted tables

#### **Pattern E: Image URL Dimming** (`cmMarkdownDecorations.ts`)
- When cursor NOT on image line: dim the URL portion `](url)` with `cm-image-url` class
- When cursor on same line: show full opacity
- Uses `Decoration.mark()` — preserves source, just dims visually

#### **Pattern F: Link Markup Dimming** (`cmMarkdownDecorations.ts`)
- When cursor NOT on link line: dim brackets `[` and `](url)` portion with `cm-link-dim` class
- When cursor on same line: show full opacity
- Uses `Decoration.mark()` — marks the URL/bracket parts

#### **Pattern G: Inline Citations (Source/Example)** (`cmMarkdownDecorations.ts`)
- When cursor NOT on citation line: applies different styles via `Decoration.mark()` to tag/content/bracket portions
- CSS shows/hides labels, applies backgrounds, etc. via `data-source-style` and `data-example-style` attributes
- Styles include: underline, pill, icon, quotes
- Skips decorating citations inside inline code or links
- Uses per-citation cursor-position checks

### 4. **Decoration System Architecture**

All decorations use **StateField** + **Decoration** pattern:

```typescript
const field = StateField.define<{ cursorLine, cursorPos, decos }>({
  create(state) {
    // Initial scan + decoration build
    const cursorLine = state.doc.lineAt(state.selection.main.head).number;
    const decos = buildDecorations(state.doc, cursorLine);
    return { cursorLine, decos };
  },
  update(value, tr) {
    // Re-scan if doc changed, rebuild if cursor moved
    const cursorLine = tr.state.doc.lineAt(tr.state.selection.main.head).number;
    const docChanged = tr.docChanged;
    const lineChanged = cursorLine !== value.cursorLine;
    if (!docChanged && !lineChanged) return value;
    // ...rebuild decos
  },
  provide: (f) => EditorView.decorations.from(f, (v) => v.decos),
});
```

Key patterns:
- **Cursor-aware state**: Track `cursorLine` or `cursorPos` in StateField
- **Document scanning**: Regex or tree walk to find elements before building decorations
- **Efficiency**: Only rebuild on `docChanged` or cursor movement
- **Height accuracy**: StateField participates in initial render so CodeMirror's height map is correct

### 5. **WidgetType Implementation Pattern**

```typescript
class MyWidget extends WidgetType {
  constructor(data: ...) { super(); }
  eq(other): boolean { /* compare for skipping re-renders */ }
  toDOM(): HTMLElement { /* create DOM, use CSS custom props if needed */ }
  get estimatedHeight(): number { /* return height for CM's layout */ }
  ignoreEvent(event): boolean { /* return false to allow interaction */ }
}
```

Key points:
- `eq()` — if widget data hasn't changed, CM skips DOM recreation
- `estimatedHeight` — MUST be accurate for CM's height map; block widgets especially important
- `ignoreEvent()` — return `false` to allow click/mousedown events to pass to handlers
- DOM event handlers attached separately via `EditorView.domEventHandlers()`

### 6. **CSS Custom Properties Used**

Extensions pass colors/styles via:
- Inline `style="--callout-color: #..."` on decoration
- CSS `var(--callout-color)` in theme
- Dynamic CSS data attributes like `[data-source-style="pill"]`

Example (`cmCalloutDecorations.ts` line 363):
```typescript
Decoration.line({
  attributes: { class: classes, style: `--callout-color: ${color};` }
})
```

### 7. **No Preview for Plain Code Blocks**

Code blocks are treated as **visual elements**, not **hidden + previewed**:
- They have styling (background, borders) but source is visible
- No rendering of markdown inside code blocks
- This is intentional — you can still edit the code while seeing it

**If you wanted a "preview mode" for code blocks**, the pattern would be:
1. Use `Decoration.replace()` with a widget that renders highlighted code
2. Make it cursor-aware (hide when cursor inside, show when away)
3. Add `estimatedHeight` to match the original code block height

### 8. **Table Widget is Closest to "Full Preview"**

Tables (`cmMarkdownDecorations.ts`) come closest to the preview pattern:
- When cursor outside table → rendered HTML `<table>` widget replaces markdown
- When cursor inside table → raw markdown shown with line decorations
- Has "Format Table" button in the widget

This is the best model to follow for implementing code block syntax highlighting preview.

---

### Files to Reference

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx` — main setup
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts` — widget + cursor-aware example
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCheckboxDecorations.ts` — interactive widget example
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts` — comprehensive: fenced code scanning, table widget, inline citations
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` lines 1114-1450 — decoration CSS

---

