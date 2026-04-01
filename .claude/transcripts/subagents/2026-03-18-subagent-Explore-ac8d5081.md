# 2026-03-18 — Subagent Transcript: Explore

**Date:** 2026-03-18 17:54:21
**Agent:** Explore
**Agent ID:** ac8d508179aa31c80
**Parent Session:** f804a05c-cfcf-4a1a-bc3e-b0c85c825cb1

---

## User

I need to understand how custom callouts/commands work in this BrainMap markdown editor. Specifically:

1. How is `/source` implemented as a callout type? Find all files related to source callout rendering, parsing, and slash menu integration.
2. How do callouts appear in the slash menu (invokable via `/`)?
3. How do callouts appear in the "MD header tab"?
4. What is the "inline type" for source - how does inline vs block callout work?

Search thoroughly for:
- "callout" in TypeScript/TSX files
- "source" callout implementation
- Slash menu / command menu implementation
- Any callout registry or configuration
- Block vs inline callout types
- MD header/toolbar rendering of callouts

Be very thorough - check components/Editor/, any plugins/, extensions/, or similar directories.

---

## Assistant

I'll conduct a thorough search to understand how custom callouts/commands work in the BrainMap markdown editor. Let me start by exploring the directory structure and then searching for relevant code.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"*.tsx\" -o -name \"*.ts\" | head -30"}`

---

## Assistant

Let me search for files related to callouts, slash menu, and source callouts across the codebase:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"callout","type":"tsx","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"slash.*menu|slashMenu|/source","type":"tsx","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/src/**/*[Cc]allout*","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/src/**/*[Ss]lash*","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app"}`

---

## Assistant

Excellent! I found the key files. Let me now search for more related components and extensions:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/src/**/*[Ee]ditor*","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor -type f \\( -name \"*.ts\" -o -name \"*.tsx\" \\) | sort"}`

---

## Assistant

Perfect! Now let me read the key files to understand the implementation:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutTypes.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmSlashCommands.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutPreprocess.ts"}`

---

## Assistant

Now let me check the remaining key files for decorations, formatting, and preview rendering:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkInlineSource.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts"}`

---

## Assistant

Now let me check the MarkdownPreview to see how callouts are rendered:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkCalloutMerge.ts"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"inline-source|callout.*header|MD.*header","type":"tsx","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

Let me continue reading MarkdownPreview and check the EditorToolbar:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx","limit":250,"offset":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorToolbar.tsx","limit":150}`

---

## Assistant

Now let me check for CSS styling and look for more details on the inline source rendering:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"*.css\" | head -20"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"inline-source|callout.*class","type":"css","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"inline-source\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.css\" --include=\"*.tsx\" --include=\"*.ts\" -l"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","limit":200}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"inline-source\\|callout\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -50"}`

---

## Assistant

Perfect! Now let me get the specific CSS sections:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","limit":100,"offset":1336}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","limit":100,"offset":2280}`

---

## Assistant

Perfect! Now let me check the test files to understand the expected behavior:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkInlineSource.test.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutPreprocess.test.ts","limit":80}`

---

## Assistant

Excellent! Now let me check the slash commands test to understand how they work:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmSlashCommands.test.ts","limit":100}`

---

## Assistant

Perfect! Now I have all the information I need. Let me create a comprehensive report.

## Summary: BrainMap Callout and Slash Command Implementation

I've thoroughly explored how custom callouts/commands work in the BrainMap markdown editor. Here's the complete architecture:

---

### 1. **Callout Type Definition & Registry**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutTypes.ts`

- **Four callout types** defined with metadata:
  - `ai-answer` (Bot icon, blue #4a9eff)
  - `source` (BookOpen icon, orange #f39c12)
  - `question` (HelpCircle icon, purple #9b59b6)
  - `key-insight` (Lightbulb icon, green #27ae60)

- Each type has: `color`, `label`, `Icon` (Lucide icon component)
- Regex pattern: `CALLOUT_RE = /^\[!(\w[\w-]*)\][ \t]*(.*)$/m` (matches `[!type] title`)
- Ordered list `CALLOUT_TYPE_ENTRIES` used for UI pickers

---

### 2. **Slash Command Menu Implementation**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmSlashCommands.ts`

**How the slash menu works:**
- Triggered by `/` at line start or after whitespace (regex: `SLASH_TRIGGER = /(?:^|\s)\/[\w-]*$/`)
- Provides autocomplete via CodeMirror's `CompletionContext`
- 12 static commands + 4 callout commands = 16 total

**Commands sections:**
- **Headings**: h1, h2, h3
- **Lists**: bullet, numbered, task
- **Blocks**: quote, code, hr, table, link
- **BrainMap**: `source` (inline source citation)
- **Callouts**: ai-answer, source-callout, question, key-insight

**Key implementation:**
- `SLASH_COMMANDS: SlashCommandDef[]` array with `keyword`, `label`, `detail`, `section`, `icon`, `apply` function
- `slashCommandSource()` - CompletionSource that triggers on `/`
- `filterSlashCommands(query)` - filters by keyword or label
- `createSlashAutocompletion()` - extension with custom icon rendering and keyword badges

**Callout commands are auto-generated:**
```typescript
...CALLOUT_TYPE_ENTRIES.map(([type, def]) => ({
  keyword: type === "source" ? "source-callout" : type,
  label: `${def.label} Callout`,
  apply: (v: EditorView, from: number, to: number) =>
    deleteAndRun(v, from, to, (v) => insertCallout(v, type)),
}))
```

**Custom rendering in slash menu:**
- Color-coded icons for callouts using inline SVG data URIs
- `/keyword` badges
- Icons render with callout's color (not generic gray)
- Callout icon color backgrounds with transparency

---

### 3. **Inline `source` Citation (Distinct from Source Callout)**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkInlineSource.ts`

**Inline type syntax:** `[!source content here]` (in regular paragraph text, not a block)

**How it works:**
- Remark plugin that walks block-level parents and transforms phrasing content
- Regex: `INLINE_SOURCE_RE = /\[!source\s+([^\]]+)\]/g`
- Transforms into HTML nodes: `<span class="inline-source"><span class="inline-source-tag">source</span>CONTENT</span>`
- Skips code blocks and inline code (safe)
- Escapes HTML in citation content

**Slash command:** `/source` inserts template `[!source ""]` with cursor positioned inside quotes

**Styling (App.css):**
```css
.inline-source {
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  border-bottom: 1.5px solid var(--accent);
  font-style: italic;
}
.inline-source-tag {
  color: var(--accent);
  font-size: 0.8em;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.7;
  margin-right: 4px;
}
```

---

### 4. **Block Callout Syntax - Brace vs. Blockquote**

**Two syntaxes supported:**

1. **Brace syntax (editor-friendly):**
   ```
   [!ai-answer] Title {
   Body content
   }
   ```

2. **Blockquote syntax (Markdown standard):**
   ```
   > [!ai-answer] Title
   > Body content
   ```

---

### 5. **Callout Preprocessing & Parsing Pipeline**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutPreprocess.ts`

**`preprocessCallouts(md: string)`** converts brace syntax → blockquote syntax before markdown parsing:
- Tracks fenced code blocks (``` or ~~~)
- Regex: `CALLOUT_BRACE_START = /^\[!(\w[\w-]*)\]([^\n{]*)\{\s*$/`
- Converts `[!type] title {` → `> [!type] title` and prefixes body lines with `>`
- Escapes empty lines in body to `>`

**`encodeLinkSpaces(md: string)`** encodes spaces in markdown links:
- Converts `[text](./foo bar.md)` → `[text](./foo%20bar.md)`

---

### 6. **Remark Plugin: Callout Merging**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkCalloutMerge.ts`

**Problem:** React-markdown splits consecutive blockquotes on blank lines
**Solution:** Merges consecutive blockquotes if first starts with `[!type]` pattern

- Walks AST and accumulates blockquotes after a callout header
- Matches Obsidian behavior
- To end a callout, insert any non-blockquote content between them

---

### 7. **CodeMirror Editor Decorations**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts`

**Three features:**

A) **Line decorations:** Tinted background + colored left border on callout lines
B) **Inline header widget:** Shows rendered `[!TYPE] title` when cursor not on that line
C) **Fold markers:** Collapse callout bodies (Cmd+Option+[ to fold)

**Key components:**
- `scanCallouts(doc: Text): CalloutRange[]` - finds all brace callouts
- `CalloutHeaderWidget` - renders icon + label + title
- `computeLineClasses()` - determines CSS classes for header/body/closing lines
- StateField tracks callout ranges and decorations
- Fold service for collapsing

**CSS styling:**
```css
.cm-callout-line {
  border-left: 3px solid var(--callout-color);
  border-right: 1px solid color-mix(in srgb, var(--callout-color) 15%, transparent);
  background: color-mix(in srgb, var(--callout-color) 5%, transparent);
}
.cm-callout-header { border-radius: 0 6px 0 0; }
.cm-callout-last { border-radius: 0 0 6px 0; }
```

---

### 8. **Preview Rendering (React)**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx`

**Flow:**
1. `preprocessCallouts(content)` - converts brace → blockquote syntax
2. `remarkCalloutMerge` - merges consecutive blockquotes
3. `remarkInlineSource` - transforms inline citations
4. Custom `blockquote` component in React Markdown:
   - Calls `extractCalloutFromChildren()` to detect `[!type]` syntax
   - Renders as styled `<div class="callout">` with icon, label, title, body
   - Falls back to regular `<blockquote>` if not a callout

**CSS styling:**
```css
.md-preview .callout {
  border-left: 3px solid var(--callout-color);
  border-radius: 0 6px 6px 0;
  background: color-mix(in srgb, var(--callout-color) 5%, transparent);
}
.md-preview .callout-header {
  display: flex;
  align-items: center;
  gap: 6px;
  background: color-mix(in srgb, currentColor 8%, transparent);
}
.md-preview .callout-type-label {
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-weight: 600;
}
```

---

### 9. **Toolbar Callout Picker**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorToolbar.tsx`

**Popover UI in toolbar:**
- Hamburger button (☰) opens dropdown
- Lists all 4 callout types with icon + label
- Click inserts callout block at cursor via `insertCallout(editorView, type)`

---

### 10. **Formatting Helpers**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts`

**`insertCallout(view: EditorView, type: string): boolean`**
- Inserts brace syntax: `[!type] {\n...\n}`
- If text selected, wraps it as body
- If mid-line, captures trailing text as body
- Places cursor in body for editing

---

### 11. **File Locations - Summary**

| Task | File |
|------|------|
| Callout registry & types | `calloutTypes.ts` |
| Slash commands & menu | `cmSlashCommands.ts` |
| Inline source remark plugin | `remarkInlineSource.ts` |
| Brace → blockquote conversion | `calloutPreprocess.ts` |
| Blockquote merging | `remarkCalloutMerge.ts` |
| Editor decorations & widgets | `cmCalloutDecorations.ts` |
| Preview rendering | `MarkdownPreview.tsx` |
| Toolbar callout picker | `EditorToolbar.tsx` |
| Formatting insertion | `cmFormatting.ts` |
| Styling | `App.css` (lines ~1113, 1336-1350, 2280-2358) |

---

### 12. **Key Distinctions**

| Aspect | Inline Source | Block Callout |
|--------|---------------|---------------|
| **Syntax** | `[!source citation]` in paragraph | `[!type] { body }` or `> [!type]\n> body` |
| **Slash command** | `/source` | `/ai-answer`, `/source-callout`, etc. |
| **Types** | Only `source` | ai-answer, source, question, key-insight |
| **Rendering** | Inline `<span>` with tag badge | Block `<div>` with header, icon, label, body |
| **Remark plugin** | `remarkInlineSource` | `remarkCalloutMerge` |
| **Parser** | Regex in remark AST walker | Blockquote detection after preprocessing |

---

