# 2026-03-20 — Subagent Transcript: Explore

**Date:** 2026-03-20 12:13:07
**Agent:** Explore
**Agent ID:** a0f854ef61ff1d08e
**Parent Session:** cac0aae8-c235-4b83-9e42-e4dc7c9c5540

---

## User

I need to understand how fenced code blocks are currently handled in the BrainMap editor. Read these files thoroughly:

1. `crates/app/src/components/Editor/cmMarkdownDecorations.ts` - especially the `scanFencedBlocks()` function and how it detects the language specifier after the opening fence
2. `crates/app/src/components/Editor/MarkdownPreview.tsx` - how code blocks are rendered, especially the `code` component handler
3. `crates/app/src/components/Editor/MarkdownEditor.tsx` - the full CodeMirror setup, especially how `markdown()` language is configured

For each file, tell me:
- The exact current implementation
- What hooks/extension points exist for adding syntax highlighting
- Whether the language specifier (e.g. "javascript" after ```) is already being parsed/available

---

## Assistant

I'll read these three files thoroughly to understand the current fenced code block handling.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

Now I have all three files. Let me provide you with a comprehensive analysis:

## Summary

### 1. **cmMarkdownDecorations.ts** - Fenced Code Block Detection

**Current Implementation:**
- The `scanFencedBlocks()` function (lines 40-84) successfully detects fenced code blocks AND extracts the language specifier
- **Language parsing is already implemented** at line 58: `const afterFence = text.slice(fenceMatch[0].length).trim();` extracts everything after the opening fence
- Returns a `FencedBlock` interface (lines 25-32) that includes an optional `lang?: string` field
- The language is stored and passed through to the `blocks` array (line 68)

**Example:** For a line like ` ```javascript`, it would extract `"javascript"` into the `lang` field.

**Decorations applied:**
- Lines 374-385 apply `.cm-fenced-code` class to all lines in the block
- Start line gets `.cm-fenced-code-start`, end line gets `.cm-fenced-code-end`, body lines get `.cm-fenced-code`
- **Hook point:** The `FencedBlock` object with `lang` is available in `cls.fencedBlocks` but is **not currently used for decoration purposes** — it's only extracted but not passed to the decoration logic

### 2. **MarkdownPreview.tsx** - Preview Rendering

**Current Implementation:**
- The `code` component handler (lines 274-291) receives the `className` prop from `react-markdown`
- It checks for `language-mermaid` specifically (line 279): `const match = className?.match(/language-(\w+)/);`
- **The language specifier IS already parsed** — react-markdown automatically adds `language-{lang}` to the className
- Only mermaid blocks are specially handled; all other code blocks fall through to standard `<code>` rendering

**Hook point:** The `code` component could be extended to add syntax highlighting for other language specifiers like `language-javascript`, `language-typescript`, etc.

### 3. **MarkdownEditor.tsx** - CodeMirror Configuration

**Current Implementation:**
- Line 144: Uses `markdown({ extensions: GFM })` from `@codemirror/lang-markdown`
- The GFM (GitHub Flavored Markdown) extension already handles fenced code block syntax
- **No custom syntax highlighting for code block content** is configured beyond the markdown container highlighting
- Uses `@lezer/markdown` GFM parser which understands the fence structure but doesn't apply language-specific highlighting

**Extension points:**
- Line 149 adds `markdownDecorations()` which could be enhanced to accept language info
- The markdown extension supports nested language injections but is not currently configured for that

## Key Findings

| Aspect | Status | Details |
|--------|--------|---------|
| Language specifier parsing | ✅ Done | `scanFencedBlocks()` extracts `lang` from opening fence |
| Language available in preview | ✅ Done | react-markdown passes `language-{lang}` className to code element |
| Language available in editor | ⚠️ Partially | `lang` is extracted in `FencedBlock` but not passed to decorations |
| Syntax highlighting in editor | ❌ Missing | No language-specific highlighting for code block content |
| Syntax highlighting in preview | ⚠️ Partial | Only mermaid has special handling; other languages get no highlighting |

## Architectural Leverage Points

1. **For editor syntax highlighting:** You can enhance `markdownDecorations()` to accept `cls.fencedBlocks` (which has `lang` info) and inject language-specific syntax highlighting using CodeMirror's language composition APIs
2. **For preview syntax highlighting:** The `code` component in `MarkdownPreview.tsx` already has access to the language via `className` and can be extended to use libraries like Highlight.js or Prism
3. **The language is already parsed at all three levels** — it's just not being utilized for visual highlighting

---

