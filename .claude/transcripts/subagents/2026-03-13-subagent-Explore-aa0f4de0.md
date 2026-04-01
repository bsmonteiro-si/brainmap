# 2026-03-13 — Subagent Transcript: Explore

**Date:** 2026-03-13 15:19:08
**Agent:** Explore
**Agent ID:** aa0f4de08d0a08ada
**Parent Session:** c02fcf0e-8ccb-4809-9cea-1b2a5005ee83

---

## User

I need to understand how markdown content flows from the editor to preview rendering in BrainMap. Specifically:

1. Read `crates/app/src/components/Editor/MarkdownPreview.tsx` — how does the `content` prop get passed to ReactMarkdown?
2. Read `crates/app/src/components/Editor/EditorPanel.tsx` — how does it pass content to MarkdownPreview?
3. Read `crates/app/src/components/Editor/remarkCalloutMerge.ts` — existing remark plugin pattern
4. Read `crates/app/src/components/Editor/cmFormatting.ts` — specifically the `insertCallout` function
5. Read `crates/app/src/components/Editor/calloutTypes.ts` — current callout type definitions

I want to understand: where is the best place to transform `[!type] { ... }` syntax into `> [!type] ...` blockquote syntax before rendering.

---

## Assistant

I'll help you understand the markdown content flow and identify the best transformation point. Let me read those files in parallel.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkCalloutMerge.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutTypes.ts"}`

---

## Assistant

Perfect! Now I have a complete picture of the markdown content flow. Let me document my findings.

## Markdown Content Flow Analysis

### Content Path (Editor → Preview)

1. **EditorPanel.tsx** (lines 199, 205)
   - Passes `editedBody ?? activeNote.body` (the raw markdown string) directly to both:
     - `<MarkdownEditor>` for editing
     - `<MarkdownPreview>` for previewing

2. **MarkdownPreview.tsx** (line 162)
   - Receives `content: string` prop
   - Passes it directly to `<ReactMarkdown>` component
   - The flow is: raw markdown string → ReactMarkdown → HTML rendering

3. **Remark Plugin Pipeline** (MarkdownPreview.tsx line 15)
   - Two plugins configured: `[remarkGfm, remarkCalloutMerge]`
   - `remarkGfm`: GitHub Flavored Markdown support (tables, strikethrough, etc.)
   - `remarkCalloutMerge`: Merges consecutive blockquotes when first starts with `[!type]`

### Current Callout Handling

The current architecture handles callouts in **three phases**:

1. **Markdown Syntax**: Users write `> [!type] title\n> body...`
   - This is standard markdown blockquote syntax

2. **AST Transform** (`remarkCalloutMerge.ts`):
   - Merges consecutive blockquotes that start with `[!type]` pattern
   - Operates on the mdast (markdown AST) before React rendering
   - This allows blank lines within callouts without splitting them

3. **React Rendering** (`MarkdownPreview.tsx` lines 121-155):
   - Custom `blockquote` component intercepts all blockquotes
   - Calls `extractCalloutFromChildren()` to detect `[!type] title` syntax
   - If matched: renders custom `<div class="callout">` component with icon + styling
   - If not matched: renders plain `<blockquote>`

### insertCallout Function

In `cmFormatting.ts` (lines 240-274):
- Creates markdown syntax: `> [!type]\n> body...`
- This is the **source syntax** users write/insert into the editor
- No transformation needed here—it's already the correct format

### Best Transformation Point

For converting `[!type] { ... }` to `> [!type] ...` syntax, you have two excellent options:

**Option A: In the Editor (cmFormatting.ts)** — **RECOMMENDED**
- Intercept when user inserts a callout via the toolbar
- Convert the new syntax to blockquote syntax immediately
- Pros: Consistent source format, works with existing pipeline, no rendering overhead
- Cons: Only helps new callouts; existing notes need migration

**Option B: Before ReactMarkdown (MarkdownPreview.tsx)**
- Add preprocessing step in the `content` prop before passing to `<ReactMarkdown>`
- Create a transformation function: `transformCalloutSyntax(content: string): string`
- Converts `[!type] { ... }` → `> [!type] ...` in raw markdown
- Pros: Works with all callouts (new + existing), transparent to editor
- Cons: Extra processing on every render (though minimal for typical note sizes)

**Option C: As a Remark Plugin**
- Create a new remark plugin `remarkCalloutTransform` (like `remarkCalloutMerge`)
- Runs during mdast transformation
- Pros: AST-level, integrates naturally with remark ecosystem
- Cons: More complex, requires understanding mdast structure

### Recommended Approach

**Combination of A + B**:

1. **Update `insertCallout`** in `cmFormatting.ts` to recognize the new syntax if it becomes the primary way users input callouts
2. **Add preprocessing** in `MarkdownPreview.tsx` before passing `content` to ReactMarkdown:
   ```typescript
   function transformCalloutSyntax(md: string): string {
     // Convert [!type] { ... } to > [!type] ...
   }
   
   return (
     <div className="md-preview">
       <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
         {transformCalloutSyntax(content)}
       </ReactMarkdown>
     </div>
   );
   ```

This ensures:
- Backward compatibility (old `> [!type]` syntax still works)
- New syntax support (transparently converts on render)
- No editor changes needed immediately
- Single point of transformation (before ReactMarkdown)

**Key files to modify**:
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx` — add transformation before line 162
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutTypes.ts` — update `CALLOUT_RE` if syntax changes
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts` — optionally update `insertCallout` to support new syntax

---

