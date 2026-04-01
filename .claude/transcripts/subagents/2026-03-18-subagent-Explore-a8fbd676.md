# 2026-03-18 — Subagent Transcript: Explore

**Date:** 2026-03-18 14:46:59
**Agent:** Explore
**Agent ID:** a8fbd67644b9d50f5
**Parent Session:** d050b111-b84c-4abe-8ed1-3aece43a5fd5

---

## User

Explore how inline sources (`[!source ...]`) are implemented in this codebase. I need to understand:

1. The syntax/regex for inline sources
2. How they're rendered in Preview mode (the styled version)
3. How they're currently displayed in Edit mode (CodeMirror)
4. Any existing CodeMirror extensions/decorations related to sources

Look in `crates/app/src/` for components related to the editor, markdown rendering, source citations, and CodeMirror extensions. Be thorough - check for files like sourcePlugin, sourceDecoration, callout, citation, etc.

---

## Assistant

I'll explore the codebase to understand how inline sources are implemented. Let me start with a comprehensive search.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"*.ts\" -o -name \"*.tsx\" | head -20"}`

---

## Assistant

Let me search for source-related files:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*source*"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"source.*syntax|\\[!source","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","type":"ts,tsx","output_mode":"files_with_matches"}`

---

## Assistant

Let me search more broadly:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\[!source","path":"/Users/bsmonteiro/Desktop/Personal/brainmap","type":"ts,tsx,md","output_mode":"files_with_matches"}`

---

## Assistant

Let me check the git log for recent commits about sources:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"git log --oneline -20 | grep -i source"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"git show e909548 --stat"}`

---

## Assistant

Perfect! Now let me examine the specific files mentioned:

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

I notice inline sources are not yet in `cmMarkdownDecorations.ts`. Let me check if there's a separate file or if it's in `cmCalloutDecorations.ts`:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts"}`

---

## Assistant

Now let me check the CSS to see how inline sources are styled:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"inline-source\\|cm-source\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1200,"limit":100}`

---

## Assistant

Now let me check the MarkdownPreview.tsx to see how the remark plugin is integrated:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx"}`

---

## Assistant

Let me check for the test file to understand the syntax better:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkInlineSource.test.ts"}`

---

## Assistant

Now let me check if there's a CodeMirror decoration for inline sources. Let me search more carefully:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor -name \"*.ts\" -o -name \"*.tsx\" | xargs grep -l \"source\" | head -10"}`

---

## Assistant

Let me check the git diff to see exactly what was changed:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"git show e909548 --no-stat | head -200"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"git show e909548 | grep -A 50 \"cm.*decoration\\|inline.*source\" | head -100"}`

---

## Assistant

Let me check the cmMarkdownDecorations changes more specifically:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"git show e909548:crates/app/src/components/Editor/cmMarkdownDecorations.ts | grep -A 100 \"source\\|INLINE\" | head -150"}`

---

## Assistant

Let me search the actual diff for the source widget:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"git show e909548 -- crates/app/src/components/Editor/cmMarkdownDecorations.ts | grep -B 5 -A 30 \"class.*Source\\|SourceWidget\\|InlineSource\""}`

---

## Assistant

Perfect! Now let me get the complete inline source decoration code from the commit:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"git show e909548:crates/app/src/components/Editor/cmMarkdownDecorations.ts | grep -B 5 -A 50 \"INLINE_SOURCE\""}`

---

## Assistant

Let me check the full diff differently:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"git show e909548 -- crates/app/src/components/Editor/cmMarkdownDecorations.ts | tail -100"}`

---

## Assistant

Excellent! Now let me create a comprehensive summary of my findings:

## Summary: Inline Sources Implementation

I've thoroughly explored how inline sources (`[!source ...]`) are implemented in BrainMap. Here's what I found:

### 1. **Syntax & Regex**

**Pattern:** `/\[!source\s+([^\]]+)\]/g`

- Matches `[!source <content>]` where content is any non-bracket characters
- Requires a space after `!source`
- Content must be non-empty and non-whitespace-only
- Examples that work: `[!source Book, Ch.1]`, `[!source ref here]`
- Examples that DON'T match: `[!source ]`, `[!sourcetext]`, `[!source (unclosed)`

### 2. **Preview Mode Rendering** (remarkInlineSource.ts)

**Plugin Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkInlineSource.ts`

**How it works:**
- Walks the MDAST tree, transforming text nodes containing `[!source ...]`
- Skips code blocks and inline code (safety checks)
- Splits matching text into three parts: before, citation HTML node, after
- Generates an HTML node with structure: `<span class="inline-source"><span class="inline-source-tag">source</span>{content}</span>`
- Escapes HTML entities in content (`&`, `<`, `>`, `"`)
- Only processes phrasing-content parents: paragraph, heading, emphasis, strong, delete, link, tableCell
- Integrated into MarkdownPreview.tsx with `rehypeRaw` plugin to render inline HTML

### 3. **Edit Mode Display** (cmMarkdownDecorations.ts)

**Widget Class:** `InlineSourceWidget` (replaces `[!source` prefix)

**Decoration Structure:**
```
[!source content]
│        │       │
│        │       └─ Decoration.replace({}) — hides closing ]
│        └─────────── sourceContentMark — styled background/italic
└──────────────────── Decoration.replace({ widget }) — shows "source" badge
```

**Three marks applied:**
1. `matchFrom` to `tagEnd`: Replace with `InlineSourceWidget` (shows "SOURCE" badge)
2. `tagEnd` to `matchTo - 1`: Apply `sourceContentMark` class
3. `matchTo - 1` to `matchTo`: Replace with empty widget (hides closing `]`)

**Safety mechanisms:**
- Skips citations inside fenced code blocks (checks `fencedLines` set)
- Skips overlaps with inline code and link nodes (tracks `sourceSkipRanges`)
- Link nodes prefixed with `[!source` are NOT added to skip ranges (allows citation links)

### 4. **CSS Styling**

**Editor mode** (`.cm-editor` classes):
- `.cm-source-tag`: Accent color, 0.85em size, ~45% opacity
- `.cm-source-content`: Light accent background, 1.5px bottom border, italic, secondary text color
- `.cm-source-widget-tag`: Accent color, 0.75em uppercase, 80% opacity, 3px right margin
- `.cm-source-bracket`: 30% opacity (for hidden brackets)

**Preview mode** (`.inline-source` classes):
- `.inline-source`: 8% accent background, 1.5px bottom border, italic, secondary text
- `.inline-source-tag`: Accent color, 0.8em uppercase, 600 weight, 70% opacity, 4px right margin

### 5. **Key Files & Locations**

| File | Purpose |
|------|---------|
| `/crates/app/src/components/Editor/remarkInlineSource.ts` | Remark plugin for preview rendering (102 lines) |
| `/crates/app/src/components/Editor/remarkInlineSource.test.ts` | 13 tests covering edge cases |
| `/crates/app/src/components/Editor/cmMarkdownDecorations.ts` | CodeMirror decoration widget & marks (~24 line change) |
| `/crates/app/src/components/Editor/MarkdownPreview.tsx` | Integrates remark plugin + rehypeRaw |
| `/crates/app/src/App.css` | 40 lines of styling for both modes (lines 1209–1249) |

### 6. **Integration Points**

- **Preview:** MarkdownPreview.tsx uses `remarkPlugins=[remarkGfm, remarkCalloutMerge, remarkInlineSource]` + `rehypePlugins={[rehypeRaw]}`
- **Edit:** cmMarkdownDecorations extension added to CodeMirror, decorations built in `buildDecorations()` function
- **Package:** Added `rehype-raw@^7.0.0` dependency for rendering inline HTML nodes

---

