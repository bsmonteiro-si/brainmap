# 2026-03-18 — Subagent Transcript: Explore

**Date:** 2026-03-18 14:48:27
**Agent:** Explore
**Agent ID:** a3a9aa244d4408c49
**Parent Session:** c161688e-735c-4623-a175-2eddaf2f5aae

---

## User

I need to understand:

1. What custom markdown syntaxes/commands exist in the BrainMap editor (like [!source], callouts, etc). Search for patterns like `[!` in the codebase, especially in documentation and parser code.

2. The current CodeMirror editor setup - find the main editor files, extensions, and how they're configured.

3. Any existing autocomplete or suggestion systems in the editor.

Search thoroughly in:
- crates/app/src/components/Editor/
- crates/core/src/ (for any custom syntax parsing)
- docs/ (for syntax documentation)

Be very thorough - list all custom syntaxes found and provide file paths and line numbers.

---

## Assistant

I'll conduct a thorough search of the codebase to understand the custom markdown syntaxes, CodeMirror setup, and autocomplete systems.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/**/*.{ts,tsx}"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/core/src/**/*.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"docs/**/*.md"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\[!","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

Now let me search for more specific patterns and read the key files:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"callout|source|syntax|custom markdown","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutTypes.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkInlineSource.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

Now let me read more editor extension files and the autocomplete implementation:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmNoteAutocomplete.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutPreprocess.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkCalloutMerge.ts"}`

---

## Assistant

Let me continue reading more extension files and documentation:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmLinkNavigation.ts","limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/02-data-model.md","limit":100}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"^##\\s+|^#\\s+","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/02-data-model.md","output_mode":"content","head_limit":50}`

---

## Assistant

Let me get a few more key editor extension files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts","limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmListSpacing.ts","limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx","limit":100}`

---

## Assistant

Perfect! Now I have a comprehensive view. Let me compile the final report with all the findings:

## Summary of Custom Markdown Syntaxes & CodeMirror Editor Setup

Based on my thorough search of the codebase, here's a complete breakdown:

### 1. CUSTOM MARKDOWN SYNTAXES

#### A. Callout Syntax (Brace Format)

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutPreprocess.ts`

Syntax pattern: `[!type] Title {`

```
[!ai-answer] Title {
First paragraph.

Second paragraph.
}
```

**Callout Types** (from `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutTypes.ts`, lines 9-14):
- `ai-answer` - Blue (#4a9eff) - Bot icon
- `source` - Orange (#f39c12) - BookOpen icon
- `question` - Purple (#9b59b6) - HelpCircle icon
- `key-insight` - Green (#27ae60) - Lightbulb icon

**Implementation Details**:
- Regex: `/^\[!(\w[\w-]*)\]([^\n{]*)\{\s*$/` (line 38, calloutPreprocess.ts)
- Preprocessor converts braces `{...}` into blockquote syntax `> [!type]` before markdown parsing
- Fenced code blocks inside callouts are preserved (fence tracking on lines 44-76)
- Blockquotes are merged back together by `remarkCalloutMerge` plugin to allow paragraph breaks within callouts

#### B. Inline Source Citations

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkInlineSource.ts`

Syntax pattern: `[!source ...]`

Example: `This idea comes from [!source "The Book of Why, Chapter 3"]`

**Implementation Details** (lines 1-103):
- Regex: `/\[!source\s+([^\]]+)\]/g` (line 12)
- Remark plugin walks MDAST tree and replaces inline source citations with styled HTML spans
- Only processes phrasing-content parents (paragraph, heading, emphasis, strong, delete, link, etc.)
- Skips code blocks and inline code
- Generates: `<span class="inline-source"><span class="inline-source-tag">source</span>{content}</span>`

#### C. Standard Markdown Extensions

Via GFM (GitHub Flavored Markdown) in `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx` (line 5):
- Tables
- Strikethrough (`~~text~~`)
- Autolinks
- List continuations

---

### 2. CODEMIRROR 6 EDITOR SETUP

**Main Editor File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx` (196 lines)

**Extensions Loaded** (lines 99-139):

1. **Markdown + GFM** - `markdown({ extensions: GFM })`
2. **Line wrapping** - `EditorView.lineWrapping`
3. **Line numbers** (optional) - `lineNumbers()` (line 102)
4. **Syntax highlighting** - custom theme via `buildMarkdownHighlight()` (lines 29-41)
5. **Link navigation** - `linkNavigation(notePath)` (line 104)
6. **Callout decorations** - `calloutDecorations()` (line 105)
7. **List spacing** - `listSpacing()` (line 106)
8. **Markdown decorations** - `markdownDecorations()` (line 107)
9. **Checkbox decorations** - `checkboxDecorations()` (line 108)
10. **Bullet decorations** - `bulletDecorations()` (line 109)
11. **Copy reference menu** - `copyReferenceMenu()` (line 110, conditional)
12. **History/undo** - `history()`
13. **Formatting keybindings** - `formattingKeymap`
14. **List nesting** - `listNestingKeymap`
15. **Search** - `search()` (line 132)
16. **Autocomplete** - `autocompletion({ override: [noteCompletionSource] })`
17. **Smart paste** - `smartPaste()` (line 133)
18. **Theme** - `oneDark` (dark mode)

---

### 3. EDITOR EXTENSION FILES (Detailed Inventory)

All in `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/`:

| File | Purpose | Key Pattern |
|------|---------|------------|
| `cmCalloutDecorations.ts` | Callout visual styling, fold markers | `scanCallouts()`, brace format detection |
| `cmLinkNavigation.ts` | Cmd+Click navigation on markdown links | Regex: `/\[([^\]]*)\]\(([^)]*)\)/g` |
| `cmFormatting.ts` | Bold, italic, strikethrough, code, heading, blockquote, list shortcuts | `toggleWrap()`, `toggleLinePrefix()` |
| `cmMarkdownDecorations.ts` | HR, blockquote, code block, inline code, image/link markup dimming | `scanFencedBlocks()` |
| `cmListSpacing.ts` | Extra vertical spacing on list items | Regex: `/^\s*(?:[-*+]\|\d+[.)]) /` |
| `cmCheckboxDecorations.ts` | Visual styling for checkboxes `- [x]` | Checkbox rendering |
| `cmBulletDecorations.ts` | Bullet point widgets | Visual bullet enhancement |
| `cmListNesting.ts` | Tab/Shift+Tab indent/dedent on lists | Nesting behavior |
| `cmSmartPaste.ts` | Intelligent paste handling | Multiline paste adjustment |
| `cmNoteAutocomplete.ts` | Autocomplete for `[text](` markdown links | Triggers on `]\([^)]*$` |
| `cmCopyReference.ts` | Context menu for copying note references | Reference format |

**CSS Spacing Note** (from CLAUDE.md): Never add `margin` or `padding` to `.cm-line` elements — it breaks mouse hit-testing. Use block widget decorations with matching `estimatedHeight` instead.

---

### 4. AUTOCOMPLETE SYSTEM

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmNoteAutocomplete.ts` (52 lines)

**Trigger Pattern**: Inside markdown links after `](`
- Regex: `/\]\([^)]*$/`
- Activation: `activateOnTyping: true`

**Completion Source** (`noteCompletionSource`, lines 40-51):
- Filters graph nodes by query (title + path matching, case-insensitive)
- Max 20 results
- Skips folder nodes
- Returns format: `{ label: title, detail: path, apply: path }`
- From position: `match.from + urlStart` (position after `](`)

**State Source**: Graph nodes from `useGraphStore.getState().nodes`

---

### 5. PREPROCESSING PIPELINE

Before markdown parsing:

1. **Link space encoding** - `encodeLinkSpaces()` converts spaces to `%20` in link URLs
2. **Callout preprocessing** - `preprocessCallouts()` converts brace format to blockquote format

After markdown parsing:

1. **Callout merge** - `remarkCalloutMerge()` merges consecutive blockquotes into single callout blocks
2. **Inline source** - `remarkInlineSource()` transforms `[!source ...]` citations

**Preview File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx`
- Uses remark plugins: `[remarkCalloutMerge, remarkInlineSource]`

---

### 6. KEY DECORATIONS & STYLING

From `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts`:

**Callout CSS Classes** (lines 493-541):
- `.cm-callout-line` - Card-like styling with colored left border (3px solid)
- `.cm-callout-header` - Tinted background (8% color mix)
- `.cm-callout-last` - Rounded bottom corners
- `.cm-callout-widget-header` - Inline header with icon + label + title
- `.cm-callout-widget-label` - Type label (bold, uppercase)
- `.cm-callout-widget-title` - Optional title text

**Icon System** (lines 31-68):
- SVG paths embedded for each type (ai-answer, source, question, key-insight)
- Fallback: Info circle for unknown types
- Data URIs generated on-demand with color substitution

---

### 7. FRONTMATTER EDITING

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx`

Editable fields:
- Title, Type (select), Status (select), Tags (pill input), Source, Summary (textarea)
- Created/Modified (read-only)
- Extra fields (key-value pairs)

All fields saved atomically via `Cmd+S` with body together.

---

### Summary Table: Custom Syntaxes

| Syntax | Pattern | Type | Location |
|--------|---------|------|----------|
| Callouts (brace) | `[!type] Title { ... }` | Block | calloutPreprocess.ts |
| Callouts (blockquote) | `> [!type] Title` (internal) | Block | Converted by preprocessor |
| Inline source | `[!source ...]` | Inline | remarkInlineSource.ts |
| Markdown links | `[text](path)` | Inline | Standard markdown |
| Frontmatter | YAML | Meta | All notes |
| Checkboxes | `- [x]` | Inline | Standard GFM |
| Tables | Standard GFM | Block | Standard markdown |
| Strikethrough | `~~text~~` | Inline | Standard GFM |

All files are in production with 54+ unit tests for frontmatter editing and 29+ tests for global zoom/UI features.

---

