# 2026-03-15 — Subagent Transcript: Plan

**Date:** 2026-03-15 11:57:31
**Agent:** Plan
**Agent ID:** a0eaa49abbdaaf30b
**Parent Session:** 5b0e6283-4f0a-4591-bea0-adbf6ce9d7ae

---

## User

I'm working on the BrainMap desktop app's CodeMirror 6 markdown editor. The editor already has several "prettify" decorations that make raw markdown look nicer while editing:

**Currently prettified in edit mode:**
1. **Headings** — syntax highlighting with larger font sizes and accent colors (h1=1.5em, h2=1.3em, h3=1.15em, h4=1.05em)
2. **Bold/Italic** — syntax highlighting (bold=700 weight, italic style)
3. **Callout blocks** `[!type] title { ... }` — full widget replacement with colored icons, background tinting, fold support, cursor-aware raw reveal
4. **Lists** — `cmListSpacing.ts` adds 0.12em margin-bottom between list items via line decoration
5. **Links** — Cmd+Click navigation with pointer cursor on hover

**NOT prettified (raw markdown shown, no visual enhancement):**
1. **Horizontal rules (`---`)** — just raw dashes on a line, no visual separator
2. **Checkboxes (`- [ ]` / `- [x]`)** — raw bracket syntax, no actual checkbox rendering
3. **Blockquotes (`>`)** — no left border or background tint in edit mode (only callout blockquotes get decorated)
4. **Fenced code blocks (```)** — no background/border distinction in edit mode
5. **Inline code (`` `code` ``)** — no background pill in edit mode (only syntax highlighted by oneDark in dark mode, nothing in light mode)
6. **Images (`![alt](url)`)** — raw syntax only
7. **Strikethrough (`~~text~~`)** — no line-through styling in edit mode highlight rules
8. **Links markup** — the `[` `]` `(` `)` delimiters and URL are fully visible, could be dimmed

The existing prettification pattern uses:
- `cmCalloutDecorations.ts` — ViewPlugin with Decoration.replace (widgets), Decoration.line (backgrounds), cursor-aware behavior
- `cmListSpacing.ts` — ViewPlugin with Decoration.line (CSS class)
- `MarkdownEditor.tsx` — HighlightStyle.define with lezer tags
- `App.css` — CSS classes for decorations

The preview mode (`.md-preview`) already has nice styling for all these elements:
- `blockquote`: 3px accent left border, 6% accent background, border-radius
- `code`: monospace, bg-tertiary background, 1px border, 3px radius, padding
- `pre`: bg-secondary, 1px border, 6px radius, 14px padding
- `del`: line-through, text-muted color
- `hr`: border-top 1px solid border-color, 1.5em margin
- `checkbox`: accent-color on accent

Design an implementation plan for adding edit-mode prettification to these elements. For each element, specify the approach (HighlightStyle tag, ViewPlugin decoration, or CSS class) and what the visual treatment should be.

Key constraints:
- All decorations must be cursor-aware where appropriate (show raw syntax when cursor is on the line)
- Must respect theme system (CSS variables, light/dark)
- Should be implemented as a single new extension file (`cmMarkdownDecorations.ts`) for the simpler decorations, with individual files for complex ones
- Keep it simple — enhance readability without hiding syntax unnecessarily
- Checkbox should use a replace decoration widget (actual checkbox element) when cursor is NOT on the line

Prioritize by user impact: horizontal rules, checkboxes, blockquotes, code blocks, inline code, strikethrough, then images/links.

---

## Assistant



I'll explore the existing codebase to understand the patterns, then design the implementation plan.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/editor/cm*.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/editor/*.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/editor/*.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/cm*.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/MarkdownEditor*"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmListSpacing.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

Now let me look at the CSS for preview mode styles and the existing highlight tags.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.md-preview\\s+(blockquote|code|pre|del|hr|img|input\\[type)|\\.cm-list-line","glob":"*.css","output_mode":"content","-A":4}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"tags\\.","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx","output_mode":"content"}`

---

## Assistant

Now let me look at the available lezer tags to understand what the markdown parser exposes, and check if there are any checkbox-related patterns.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"tags\\.(strikethrough|monospace|processingInstruction|separator|url|link|image|quote|blockComment)","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"blockquote|\\.md-preview","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-B":1,"-A":6,"head_limit":30}`

---

## Assistant

Let me check what lezer markdown tags are available and see the CSS variable system.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"--accent|--bg-secondary|--bg-tertiary|--border-color|--text-muted|--text-secondary","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","hea`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"checkbox|task.?list|\\.cm-","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-A":3}`

---

## Assistant

Now let me check the lezer markdown tag names to know what's available for HighlightStyle.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@lezer/markdown/dist/ 2>/dev/null","description":"Check lezer markdown dist files"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"tags\\.|Tag\\.","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@lezer/markdown/dist/index.d.ts","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"Strikethrough|TaskList|monospace|processingInstruction|contentSeparator|quote","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@lezer/markdown/dist/index.js","o`

---

## Assistant

Good. Now let me check if GFM extensions (Strikethrough, TaskList, Table) are being enabled in the markdown() configuration.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"markdown\\(|GFM|TaskList|Strikethrough","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content"}`

---

## Assistant

Important finding: `markdown()` is called with no arguments, which means it does NOT include GFM extensions (Strikethrough, TaskList, Table). These need to be explicitly enabled. Let me verify what the `markdown()` function accepts.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"export.*function markdown|extensions.*GFM","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@codemirror/lang-markdown/dist","output_mode":"content","-A":5}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"function markdown|extensions\"","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@codemirror/lang-markdown/dist/index.d.ts","output_mode":"content","-A":10}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@codemirror/lang-markdown/dist/index.d.ts","offset":66,"limit":30}`

---

## Assistant

Now let me check the lezer markdown tree structure to understand what nodes are available for syntax tree walking.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"FencedCode|CodeBlock|HorizontalRule|Blockquote|Task|InlineCode|Image","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@lezer/markdown/dist/index.js","output_mod`

---

## Assistant

Now let me check the existing test files for patterns.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.test.ts","limit":40}`

---

## Assistant

Now let me look at the full App.css around the cm-editor area to understand existing editor styles.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1035,"limit":60}`

---

## Assistant

Now let me check how the EditorToolbar references strikethrough to understand if GFM is needed.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts","limit":30}`

---

## Assistant

I have a thorough understanding of the codebase now. Let me compile the implementation plan.

---

## Implementation Plan: Edit-Mode Markdown Prettification

### Prerequisites

**Enable GFM extensions in the markdown parser.** Currently `markdown()` is called with no arguments in `MarkdownEditor.tsx` (line 89). This must change to:

```ts
import { GFM } from "@lezer/markdown";
// ...
markdown({ extensions: GFM })
```

This enables the lezer parser to recognize `Strikethrough`, `TaskList`, `Table`, and `Autolink` nodes in the syntax tree. Without this, strikethrough `~~text~~` and checkbox `- [x]` have no AST nodes for HighlightStyle or tree-walking decorations to target.

### Architecture Overview

The plan creates **two new files** plus modifications to **three existing files**:

1. **`cmMarkdownDecorations.ts`** (new) -- A single StateField-based extension handling horizontal rules, blockquotes, fenced code blocks, inline code, and strikethrough. Uses the same StateField + `buildDecorations` pattern as `cmCalloutDecorations.ts` for cursor-awareness.

2. **`cmCheckboxDecorations.ts`** (new) -- A separate file for checkbox widget replacement, which is the most complex decoration (replace widget + click handler + mutation dispatch). Follows the `cmCalloutDecorations.ts` pattern closely.

3. **`MarkdownEditor.tsx`** (modify) -- Add GFM to `markdown()`, import and register the two new extensions.

4. **`App.css`** (modify) -- Add CSS classes for the new decorations.

5. **`buildMarkdownHighlight`** in `MarkdownEditor.tsx` (modify) -- Add HighlightStyle entries for `tags.strikethrough` and `tags.monospace` (simple style-only decorations that do not need cursor-awareness).

### Element-by-Element Design

#### 1. Horizontal Rules (`---`) -- Line decoration, cursor-aware

**Approach:** Line decoration via StateField in `cmMarkdownDecorations.ts`.

**Detection:** Regex scan: `/^(\*{3,}|-{3,}|_{3,})\s*$/` on each line in visible ranges. Must skip lines inside fenced code blocks (track fence state like `cmCalloutDecorations.ts` does).

**Visual treatment:**
- When cursor is NOT on the line: `Decoration.line({ class: "cm-hr-line" })` that adds a CSS class
- When cursor IS on the line: no decoration (show raw `---`)
- CSS class `.cm-hr-line`: `border-bottom: 1px solid var(--border-color); padding-bottom: 0.5em; margin-bottom: 0.5em; color: var(--text-muted); opacity: 0.5;`

**Why not a replace widget:** Showing the raw dashes with a visual bottom border is simpler, preserves editability, and matches the "enhance readability without hiding syntax" constraint. The dashes become a subtle visual separator.

#### 2. Checkboxes (`- [ ]` / `- [x]`) -- Replace widget, cursor-aware

**Approach:** Replace decoration via StateField in dedicated `cmCheckboxDecorations.ts`.

**Detection:** Regex `/^(\s*(?:[-*+]|\d+[.)]) )\[([ xX])\]/` on each line. Capture groups: (1) list prefix, (2) check state.

**Visual treatment:**
- When cursor is NOT on the line: `Decoration.replace` on the `[ ]`/`[x]` portion only (from the `[` to the `]` inclusive), replacing with a `CheckboxWidget` that renders an `<input type="checkbox">` element.
- When cursor IS on the line: no replacement, show raw `[ ]`/`[x]` syntax.
- The widget has `checked` state based on capture group 2.
- Widget click handler: dispatches a transaction that replaces `[ ]` with `[x]` or vice versa in the document text. Uses `view.dispatch({ changes: { from, to, insert } })`.
- Widget `ignoreEvent` returns `false` for click events so CodeMirror does not swallow the click.

**CSS:** `.cm-checkbox-widget { accent-color: var(--accent); vertical-align: middle; margin-right: 2px; cursor: pointer; }`

**Why a separate file:** The checkbox is the only element with interactive click behavior and document mutation from a widget. This complexity warrants isolation, consistent with how callouts got their own file.

#### 3. Blockquotes (`>`) -- Line decoration, NOT cursor-aware

**Approach:** Line decoration via StateField in `cmMarkdownDecorations.ts`.

**Detection:** Regex `/^(\s*>)+/` on each line. Must exclude lines that are part of callout blocks (the callout scanner already handles `[!type]` blocks). Strategy: run `scanCallouts` to get callout line ranges, then skip any line inside a callout range when applying blockquote decorations.

**Visual treatment:**
- `Decoration.line({ class: "cm-blockquote-line" })` on every blockquote line.
- CSS: `.cm-blockquote-line { border-left: 3px solid var(--accent); padding-left: 12px; background: color-mix(in srgb, var(--accent) 6%, transparent); border-radius: 0 4px 4px 0; }`
- NOT cursor-aware: The `>` marker is minimal syntax that should always be visible. Hiding it would confuse editing. The visual enhancement is additive (border + tint), not replacing.

**Callout exclusion:** The decoration builder imports `scanCallouts` from `cmCalloutDecorations.ts` and builds a Set of line numbers that fall within callout ranges. Blockquote decorations skip those lines.

#### 4. Fenced Code Blocks (```) -- Line decoration, NOT cursor-aware

**Approach:** Line decoration via StateField in `cmMarkdownDecorations.ts`.

**Detection:** Track fenced code regions using the same fence-tracking logic already in `cmCalloutDecorations.ts` (extract to a shared utility or duplicate the simple state machine). Regex: `/^(`{3,}|~{3,})/` for opening, closing match by same character.

**Visual treatment:**
- Opening fence line: `Decoration.line({ class: "cm-fenced-code cm-fenced-code-start" })`
- Body lines: `Decoration.line({ class: "cm-fenced-code" })`
- Closing fence line: `Decoration.line({ class: "cm-fenced-code cm-fenced-code-end" })`
- CSS:
  ```
  .cm-fenced-code { background: var(--bg-secondary); }
  .cm-fenced-code-start { border-radius: 6px 6px 0 0; border-top: 1px solid var(--border-color); border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color); }
  .cm-fenced-code-end { border-radius: 0 0 6px 6px; border-bottom: 1px solid var(--border-color); border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color); }
  .cm-fenced-code:not(.cm-fenced-code-start):not(.cm-fenced-code-end) { border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color); }
  ```
- NOT cursor-aware: code blocks are multi-line structures where showing boundaries at all times aids readability. The fence markers (```) remain visible.

#### 5. Inline Code (`` `code` ``) -- HighlightStyle tag

**Approach:** Add `tags.monospace` entry to `buildMarkdownHighlight()` in `MarkdownEditor.tsx`.

The lezer markdown parser already maps `"InlineCode CodeText"` to `tags.monospace` (confirmed in the parser source). So adding a HighlightStyle entry is sufficient.

**Visual treatment:**
```ts
{ tag: tags.monospace, fontFamily: "ui-monospace, 'Menlo', 'Monaco', 'Consolas', monospace", fontSize: "0.88em" }
```

For the background pill effect, HighlightStyle alone cannot add `background` or `border-radius`. Two options:

**Option A (recommended):** Use a mark decoration in `cmMarkdownDecorations.ts` that finds `InlineCode` nodes in the syntax tree via `syntaxTree(state).iterate()` and applies `Decoration.mark({ class: "cm-inline-code" })` to them. CSS: `.cm-inline-code { background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 3px; padding: 1px 4px; }`. This gives the full pill effect matching preview mode.

**Option B (simpler fallback):** Just use the HighlightStyle entry for font change. The oneDark theme already styles monospace with a slight background in dark mode, so this gives partial improvement with zero decoration code.

**Recommendation:** Go with Option A. The background pill is the most impactful part of inline code styling and worth the small amount of tree-walking code.

**Cursor-awareness:** Not needed. The backtick delimiters remain visible, and the background pill around the entire inline code span (including delimiters) is helpful context.

#### 6. Strikethrough (`~~text~~`) -- HighlightStyle tag

**Approach:** Add `tags.strikethrough` entry to `buildMarkdownHighlight()` in `MarkdownEditor.tsx`.

**Prerequisite:** GFM must be enabled (see Prerequisites above). The lezer Strikethrough extension maps `"Strikethrough/..."` to `tags.strikethrough`.

**Visual treatment:**
```ts
{ tag: tags.strikethrough, textDecoration: "line-through", color: isDark ? "#888" : "#999" }
```

This is purely a HighlightStyle addition -- no ViewPlugin or StateField needed. The `~~` delimiters remain visible (they are tagged as `processingInstruction`), and the text between gets the visual treatment.

#### 7. Images (`![alt](url)`) -- Deferred / Low Priority

**Approach:** This is the lowest priority and most complex item. Two viable approaches:

**Option A (minimal, recommended for first pass):** Dim the URL portion. Use a mark decoration in `cmMarkdownDecorations.ts` that finds `Image` nodes in the syntax tree. Apply `Decoration.mark({ class: "cm-image-url" })` to the `(url)` portion. CSS: `.cm-image-url { opacity: 0.5; font-size: 0.85em; }`. Cursor-aware: show full opacity when cursor is on the line.

**Option B (full preview, future):** Replace decoration with an `<img>` widget below the image syntax line. This is significantly more complex (needs URL resolution, error handling, size constraints, loading states) and should be a separate follow-up.

**Recommendation:** Start with Option A only. Image preview widgets are a feature unto themselves.

#### 8. Link Markup Dimming -- Mark decoration, cursor-aware

**Approach:** Mark decoration in `cmMarkdownDecorations.ts`.

**Detection:** Walk the syntax tree for `Link` nodes. Within each Link node, find the `LinkMark` children (`[`, `]`, `(`, `)`) and the `URL` child.

**Visual treatment:**
- When cursor is NOT on the line: Apply `Decoration.mark({ class: "cm-link-dim" })` to the `[`, `]`, `(url)` portions. CSS: `.cm-link-dim { opacity: 0.4; }`.
- When cursor IS on the line: no dimming, show full syntax.
- The link text between `[` and `]` remains fully visible at all times.

### Implementation Sequence

**Step 1: Enable GFM** -- Modify `MarkdownEditor.tsx` line 89 to `markdown({ extensions: GFM })` and add the import from `@lezer/markdown`. This unblocks strikethrough and checkbox features.

**Step 2: HighlightStyle additions** -- Add `tags.strikethrough` and `tags.monospace` to `buildMarkdownHighlight()`. Minimal code, immediate visual improvement for two elements.

**Step 3: Create `cmMarkdownDecorations.ts`** -- Implement the StateField with a single `buildDecorations` function that handles:
  - Horizontal rules (cursor-aware line deco)
  - Blockquotes (line deco, callout-exclusion)
  - Fenced code blocks (line deco)
  - Inline code background pills (mark deco via tree walk)
  - Link markup dimming (mark deco via tree walk, cursor-aware)
  - Image URL dimming (mark deco via tree walk, cursor-aware)

The StateField rebuilds on `docChanged` or `cursorLine !== prevCursorLine`, exactly like `calloutField` in `cmCalloutDecorations.ts`.

**Step 4: Create `cmCheckboxDecorations.ts`** -- Implement the checkbox StateField with `CheckboxWidget` class and click-to-toggle behavior.

**Step 5: Add CSS classes** -- Add all `.cm-*` classes to `App.css` in the editor section (around line 1067).

**Step 6: Register extensions** -- In `MarkdownEditor.tsx`, import `markdownDecorations` from `cmMarkdownDecorations.ts` and `checkboxDecorations` from `cmCheckboxDecorations.ts`, add them to the extensions array.

**Step 7: Tests** -- Create `cmMarkdownDecorations.test.ts` and `cmCheckboxDecorations.test.ts`. Test the scanner/detection functions as pure units (like `scanCallouts` tests). For the checkbox, test the regex detection and the toggle logic. For the markdown decorations, test the line classification logic (which lines are HR, blockquote, fenced code, etc.) as an exported pure function.

### Technical Details

**StateField vs ViewPlugin:** The callout decorations use StateField, while list spacing uses ViewPlugin. StateField is the right choice here because:
- Cursor-awareness requires recomputing on selection changes (StateField's `update` method handles this naturally)
- StateField decorations participate in the initial render pass (important for code block backgrounds that affect perceived layout)
- Multiple decoration types in one StateField is cleaner than multiple ViewPlugins

**Tree walking for inline decorations:** For inline code, links, and images, the implementation will use `syntaxTree(state)` from `@codemirror/language` and call `.iterate({ enter })` to find specific node types. This is more reliable than regex for inline elements because the lezer parser correctly handles nesting and edge cases (e.g., backticks inside links).

**Performance:** The tree walk is limited to visible ranges (`view.visibleRanges`) where possible. For cursor-aware decorations, the cursor line number is cheaply compared. The StateField only recomputes when `docChanged || cursorLineChanged`, same as callouts.

**Callout exclusion for blockquotes:** Import `scanCallouts` (already exported) and build a `Set<number>` of line numbers within callout ranges. This is O(n) where n = number of callout body lines, which is negligible.

### File Structure Summary

```
crates/app/src/components/Editor/
  cmMarkdownDecorations.ts      (NEW - ~200 lines)
  cmMarkdownDecorations.test.ts (NEW - ~150 lines)
  cmCheckboxDecorations.ts      (NEW - ~120 lines)
  cmCheckboxDecorations.test.ts (NEW - ~80 lines)
  MarkdownEditor.tsx            (MODIFY - GFM import, new extensions, HighlightStyle entries)
  cmCalloutDecorations.ts       (READ - pattern reference, scanCallouts import)
  cmListSpacing.ts              (READ - pattern reference)

crates/app/src/App.css          (MODIFY - add ~40 lines of CSS classes)
```

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts` - Primary pattern to follow for StateField + cursor-aware decorations + WidgetType
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx` - Entry point: GFM enablement, HighlightStyle additions, extension registration
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` - CSS class definitions for all new decorations (lines ~1067+)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmListSpacing.ts` - Simpler ViewPlugin pattern reference for non-cursor-aware line decorations
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@lezer/markdown/dist/index.js` - Reference for syntax tree node types (FencedCode, Blockquote, InlineCode, Image, Link, HorizontalRule, TaskList)

---

