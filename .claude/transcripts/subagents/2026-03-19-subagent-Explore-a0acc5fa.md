# 2026-03-19 — Subagent Transcript: Explore

**Date:** 2026-03-19 10:58:29
**Agent:** Explore
**Agent ID:** a0acc5fa63e349294
**Parent Session:** 69132e9c-233d-4f02-853b-992996f9b01d

---

## User

I need to understand how the `/source` and `/inline-source` callouts are implemented in this codebase. This is a CodeMirror 6 editor in a Tauri/React app.

Search thoroughly for:
1. How `/source` callout is defined (block version) - look for remark plugins, CodeMirror decorations, widget classes
2. How `/inline-source` is defined (inline version)
3. How they share configuration (settings, styles, etc.)
4. The rendering pipeline: from markdown syntax → remark parsing → CodeMirror decoration → visual output
5. Any settings/preferences related to source callouts
6. CSS styles for source callouts
7. Test files for source callouts

Search in `crates/app/src/` primarily. Look for files containing "source", "callout", "inline-source", "InlineSource", "SourceCallout" etc. Also check the docs/extension-guides/ directory for any relevant guide.

Be very thorough - I need to understand the full implementation pattern to replicate it for a new callout type.

---

## Assistant

I'll search thoroughly for the source callout implementation across the codebase. Let me start with multiple parallel searches.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*source*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*callout*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"docs/extension-guides/**"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -type f \\( -name \"*.ts\" -o -name \"*.tsx\" -o -name \"*.css\" \\) | xargs grep -l \"source.*callout\\|inline.*source\" 2>/dev/null | hea`

---

## Assistant

Good start. Now let me read the key files related to callouts and source inline decorations.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutTypes.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutPreprocess.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkInlineSource.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts"}`

---

## Assistant

Now let me check the CSS styles and test files for inline source:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkInlineSource.test.ts"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"inline-source\\|cm-source\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.css\" --include=\"*.scss\" 2>/dev/null | head -50"}`

---

## Assistant

Let me read the CSS file to see the styling:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 50 \"\\.inline-source\\|\\.cm-source\\|\\.cm-example\\|\\.cm-math\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -200"}`

---

## Assistant

Let me search for more CSS related to inline styles and check for settings handling:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"source-style\\|example-style\\|inline-source\\|inline-example\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.ts\" --include=\"*.tsx\" 2>/dev/null | he`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"data-source-style\\|data-example-style\\|data-math-style\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.tsx\" --include=\"*.ts\" 2>/dev/null"}`

---

## Assistant

Let me read the App.tsx and check for math styles:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -B 5 -A 5 \"data-source-style\\|data-example-style\\|data-math-style\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"sourceStyle\\|exampleStyle\\|mathStyle\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.tsx\" --include=\"*.ts\" 2>/dev/null | head -40"}`

---

## Assistant

Now let me read the uiStore to understand settings:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","limit":200}`

---

## Assistant

Let me continue reading uiStore:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","offset":200,"limit":150}`

---

## Assistant

Let me check for math-style in CSS and look for block callouts:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"math-style\\|data-math-style\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.css\" --include=\"*.tsx\" --include=\"*.ts\" 2>/dev/null"}`

---

## Assistant

Let me check for block callout rendering and look at the markdown decorator test:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMermaidDecorations.test.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*blockquote*\" -o -name \"*block-callout*\" -o -name \"*callout*\" 2>/dev/null | grep -v node_modules"}`

---

## Assistant

Now let me check the callout preprocess test to understand how block callouts work:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutPreprocess.test.ts"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"blockquote\\|><\\|>|\\|>\\[!\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -80"}`

---

## Assistant

Let me look for how blockquote callouts are rendered (must be in react-markdown or preview):

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*preview*\" -o -name \"*markdown*\" 2>/dev/null | grep -v node_modules | grep -E \"\\.(tsx?|css)$\""}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"\\\\[!source\\\\]\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.tsx\" --include=\"*.ts\" 2>/dev/null | head -20"}`

---

## Assistant

Great! Let me find and read the callout decorations file:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*CalloutDecoration*\" 2>/dev/null | grep -v node_modules"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ | grep -i callout"}`

---

## Assistant

Perfect! Now let me read the main block callout decorations file:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts"}`

---

## Assistant

Excellent! Now let me read the remarkCalloutMerge file and check the MarkdownPreview:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkCalloutMerge.ts"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"blockquote\\|Blockquote\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor --include=\"*.tsx\" --include=\"*.ts\" 2>/dev/null | head -40"}`

---

## Assistant

Now let me read the MarkdownPreview to see how block callouts are rendered:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 80 \"blockquote:\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx | head -100"}`

---

## Assistant

Let me check for the extension guide on adding callouts:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides/"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"callout\\|source\\|inline\" /Users/bsmonteiro/Desktop/Personal/brainmap/docs --include=\"*.md\" 2>/dev/null | head -30"}`

---

## Assistant

Let me check the cm-preview-widget guide:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides/add-cm-preview-widget.md"}`

---

## Assistant

Perfect! Now let me check how Math is rendered to get the full picture. Let me also look at the test file for the markdown preview:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -B 5 -A 30 \"inline-math\\|math.*KaTeX\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -120"}`

---

## Assistant

Let me search for math styling in CSS:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -i \"math\\|katex\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -50"}`

---

## Assistant

Let me now get more specific CSS sections:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 15 \"\\.cm-math-tag\\|\\.cm-example\\|\\.cm-source\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -150"}`

---

## Assistant

Perfect! Now let me search for math tag in CSS:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -B 2 -A 15 \"\\[data-math-style\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -100"}`

---

## Assistant

So math doesn't have a data attribute style - let me check how math styling works:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -B 2 -A 15 \"\\.cm-math-tag\\|\\.cm-math-content\\|\\.cm-math-bracket\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Let me look at the actual decoration marks in cmMarkdownDecorations.ts again for math:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"sed -n '254,266p' /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts"}`

---

## Assistant

Now let me check if there's CSS for math marks:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep \"cm-math\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -40"}`

---

## Assistant

Perfect! Now I have a comprehensive understanding. Let me create a thorough summary document now by compiling all my findings:

## Comprehensive Summary: Source Callout Implementation in BrainMap

I've thoroughly analyzed the codebase and identified the complete rendering pipeline for inline source citations and block callouts. Here's what I found:

### 1. **Inline Source/Example/Math Citations** (`[!source ...]`)

**Syntax & Regex:**
- Located in: `remarkInlineSource.ts`
- Pattern: `[!type content]` where type = "source", "example", or "math"
- Regex: `/\[!(source|example|math)\s+([^\]]+)\]/g` 
- Supports inline within paragraphs, headings, emphasis, links, list items
- Skips: fenced code blocks, inline code blocks

**Rendering Pipeline (Inline):**

1. **Remark Plugin** (`remarkInlineSource.ts`):
   - Walks MDAST tree, targets phrasing-content parents only
   - Transforms `[!type content]` text nodes into HTML nodes
   - Output: `<span class="inline-{type}"><span class="inline-{type}-tag">{type}</span>{content}</span>`
   - For math: Uses KaTeX to render LaTeX before wrapping

2. **CodeMirror Decorations** (`cmMarkdownDecorations.ts`):
   - Scans document for inline citations (cursor-aware)
   - Creates 3 mark decorations per citation:
     - `cm-{type}-tag`: hides `[!type` with CSS pseudo-element `::after` showing label
     - `cm-{type}-content`: styles the content text
     - `cm-{type}-bracket`: hides closing `]` with pseudo-element for styling
   - Marks are NON-replacing (preserves CodeMirror hit-testing)
   - Skips: when cursor inside citation, inside fenced blocks, inside inline code, inside links

3. **CSS Styling** (`App.css`):
   - **Source styling**: 4 toggleable styles via `[data-source-style]` attribute:
     - `underline`: label + underline
     - `pill`: rounded badge
     - `icon`: 📖 emoji + italic
     - `quotes`: quotation marks + superscript "src"
   - **Example styling**: 4 toggleable styles via `[data-example-style]` attribute:
     - `underline`: label + underline
     - `pill`: rounded badge
     - `icon`: 🧪 emoji + monospace
     - `quotes`: quotation marks + superscript "ex"
   - **Math styling**: Uses KaTeX CSS classes (`.katex-display`, `.katex`)
   - Colors: source uses `var(--accent)`, example hardcoded to `#17a2b8`

4. **Settings Management** (`uiStore.ts`):
   - `sourceStyle: SourceStyle` (default "pill")
   - `exampleStyle: ExampleStyle` (default "pill")
   - Both saved to localStorage as `brainmap:uiPrefs`
   - Applied to `<html>` via `document.documentElement.setAttribute()`
   - UI controls in `SettingsModal.tsx`

---

### 2. **Block Callouts** (brace syntax + blockquote rendering)

**Syntax:**
```markdown
[!ai-answer] Optional Title {
First paragraph.

Second paragraph.
}
```

**Preprocessing Pipeline:**
1. **`calloutPreprocess.ts`**: Converts brace syntax to blockquote before markdown parsing
   - Regex: `/^\[!(\w[\w-]*)\]([^\n{]*)\{\s*$/` detects opening
   - Converts each line to `> [!type] title` + `> body`
   - Preserves fenced blocks inside callouts
   - Handles unclosed braces gracefully

2. **Remark Plugin** (`remarkCalloutMerge.ts`):
   - Merges consecutive blockquotes if first starts with `[!type]`
   - Allows blank lines within callouts without splitting

3. **CodeMirror Decorations** (`cmCalloutDecorations.ts`):
   - **Feature A - Visual styling**: Line decorations with:
     - Left border (3px solid color)
     - Right border (1px dashed)
     - Tinted background (color-mix 5-8%)
     - Rounded corners (top/bottom)
   - **Feature B - Header widget**: Cursor-aware
     - When cursor elsewhere: shows rendered widget with icon + label + title
     - When cursor on header: shows raw syntax
   - **Feature C - Folding**: Collapses body and closing brace
   - Includes spacer widgets above/below for vertical spacing (6px)

4. **Scanner** (`scanCallouts()`):
   - Detects `[!type] Title {` to `}` ranges
   - Handles fenced blocks inside callout bodies
   - Returns: `CalloutRange` with type, title, line numbers, body count, closed status

5. **Icons & Colors** (`cmCalloutDecorations.ts`):
   - Icon paths hardcoded as SVG element arrays
   - Built as data-uri SVG with color parameter
   - Icons: Bot (ai-answer), BookOpen (source), HelpCircle (question), Lightbulb (key-insight), FlaskConical (example), BookA (definition), Sigma (math)
   - Colors defined in `calloutTypes.ts` via `CALLOUT_TYPES`

6. **Markdown Preview** (`MarkdownPreview.tsx`):
   - Blockquote component override
   - Extracts callout type from first child text node
   - Renders as styled div with header (icon + label + title) + body
   - Math callouts: renders LaTeX via KaTeX in body

---

### 3. **Type Definitions**

**`calloutTypes.ts`:**
```typescript
export const CALLOUT_TYPES: Record<string, CalloutTypeDef> = {
  "ai-answer": { color: "#4a9eff", label: "AI Answer", Icon: Bot },
  source: { color: "#f39c12", label: "Source", Icon: BookOpen },
  question: { color: "#9b59b6", label: "Question", Icon: HelpCircle },
  "key-insight": { color: "#27ae60", label: "Key Insight", Icon: Lightbulb },
  example: { color: "#17a2b8", label: "Example", Icon: FlaskConical },
  definition: { color: "#e67e22", label: "Definition", Icon: BookA },
  math: { color: "#e74c3c", label: "Math", Icon: Sigma },
};
```

Regex for block callouts: `/^\[!(\w[\w-]*)\][ \t]*(.*)$/m`

---

### 4. **CSS Structure**

**Inline marks** (source/example):
- Use `[data-source-style]` / `[data-example-style]` attributes on `<html>`
- Four style profiles with ::after pseudo-elements for labels
- Color uses `var(--accent)` for source, hardcoded `#17a2b8` for example

**Block callouts** (CodeMirror):
- `.cm-callout-line`: base styling with borders and background
- `.cm-callout-header`: top styling with background gradient
- `.cm-callout-body`: body line styling
- `.cm-callout-last`: bottom border-radius
- `.cm-callout-widget-header`: rendered header widget (flex, gap, padding, border-radius)

**Math rendering**:
- `.cm-math-preview`: container for block math widget
- Uses KaTeX's `.katex-display` classes

---

### 5. **Test Coverage**

- `remarkInlineSource.test.ts`: 23 tests for inline citations
- `calloutPreprocess.test.ts`: 15 tests for brace-to-blockquote conversion
- `cmCalloutDecorations.test.ts`: 6 tests for decoration logic
- `MarkdownPreview.test.tsx`: Tests for block callout rendering
- `cmMermaidDecorations.test.ts`: Tests for fenced block detection (shared scanner)

---

### 6. **Key Implementation Patterns**

**For inline citations:**
1. Remark plugin walks MDAST, replaces text nodes with HTML nodes
2. CodeMirror marks (non-replacing) apply styling via CSS classes
3. Cursor-aware: skips decoration when cursor inside citation
4. Settings in Zustand store, applied to `<html>` element

**For block callouts:**
1. Preprocess converts brace syntax to blockquote before parsing
2. Remark merges consecutive blockquotes
3. CodeMirror StateField scans and decorates lines
4. Widgets provide cursor-aware header rendering
5. Fold service enables collapsing

---

### 7. **Configuration Points**

- **Type definitions**: `calloutTypes.ts` (single source of truth)
- **Inline styles**: `sourceStyle` / `exampleStyle` settings (4 profiles each)
- **Block colors**: embedded in `CALLOUT_TYPES`
- **Icons**: SVG paths in `cmCalloutDecorations.ts`
- **Settings UI**: `SettingsModal.tsx`
- **CSS customization**: `App.css` (using `color-mix` and CSS variables)

---

This architecture is highly extensible. To add a new callout type, you would:
1. Add to `CALLOUT_TYPES` in `calloutTypes.ts`
2. Add SVG icon paths in `cmCalloutDecorations.ts`
3. Update regex patterns if needed
4. Tests auto-detect from type definitions

---

