# 2026-03-16 — Subagent Transcript: Explore

**Date:** 2026-03-16 16:42:30
**Agent:** Explore
**Agent ID:** adb9470caed4e346e
**Parent Session:** f677a8ff-6516-4865-b3c8-dfc9f49743e0

---

## User

I need to understand the inline reference/citation system for this project. Explore:

1. How the "Source" frontmatter field works - look in `crates/core/src/` for how `source` is parsed and stored
2. The CodeMirror 6 editor setup in `crates/app/src/` - find the main editor component, any custom syntax extensions, decorations, or markdown extensions already in place
3. Any existing inline link or wiki-link handling (like `[[...]]` syntax) in the editor - look for decoration plugins, view plugins, or syntax extensions
4. The current markdown parsing in the core crate

Be thorough - check for CodeMirror extensions, decorations, ViewPlugin, WidgetType, syntax highlighting customizations, and any custom markdown syntax already supported.

---

## Assistant

I'll systematically explore the inline reference/citation system, source field handling, CodeMirror setup, and markdown parsing. Let me start with broad searches and then dive into specific files.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/core/src/**/*.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.tsx"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -name \"*.rs\" -o -name \"*.tsx\" -o -name \"*.ts\" | head -50"}`

---

## Assistant

Now let me search for how the source field is parsed and handled in the core:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"source","type":"rs","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src","output_mode":"content","head_limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs"}`

---

## Assistant

Good, I can see `source` is in the `Frontmatter` struct. Now let me check the parser to see how it's extracted:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/parser.rs","limit":300}`

---

## Assistant

Good - I can see the parser extracts inline links from markdown body with regex. Now let me check the MarkdownEditor component:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

Good! I can see several custom CM extensions. Let me check each of those:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmLinkNavigation.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCopyReference.ts"}`

---

## Assistant

Excellent. Now let me check a few more files:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor -name \"cm*.ts\" -o -name \"cm*.tsx\" | head -20"}`

---

## Assistant

Now let me check the callout decorations and other CM extensions:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCheckboxDecorations.ts"}`

---

## Assistant

Let me check the LinksEditor component and look at the markdown parsing more:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/LinksEditor.tsx","limit":150}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"wiki.*link|wikilink|\\[\\[","type":"ts","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","head_limit":20}`

---

## Assistant

Good, let me look at resolveNotePath:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/resolveNotePath.ts"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"source\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.tsx\" --include=\"*.ts\" | grep -i \"frontmatter\\|metadata\" | head -20"}`

---

## Assistant

Let me check the FrontmatterForm and look at markdown parsing in more detail:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx","limit":200}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"markdown\\|mdast\\|remark\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json"}`

---

## Assistant

Now let me check MarkdownPreview to see how markdown is rendered:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx","limit":150}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"inline_links\\|InlineLink\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src"}`

---

## Assistant

Let me check the workspace to see how inline links are used:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"inline_links","type":"rs","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","output_mode":"content","context":3,"head_limit":30}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"inline.*edge\\|Inline.*edge\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src --include=\"*.rs\""}`

---

## Assistant

Let me check the graph building to see how inline links are converted to edges:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 10 -B 5 \"inline_links\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs | head -60"}`

---

## Assistant

Perfect! Now let me look at the graph code to understand the edge types better:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"EdgeKind\\|Inline\\|Explicit\\|Implicit\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/index.rs","limit":100}`

---

## Assistant

Now let me check docs to see if there's anything about the data model:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/02-data-model.md","limit":200}`

---

## Assistant

Perfect! Let me check a bit more on the markdown extensions and how callouts are preprocessed:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutPreprocess.ts","limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutTypes.ts"}`

---

## Assistant

Excellent! Now I have enough information. Let me compile a comprehensive report of my findings:

## Comprehensive Exploration Report: Inline Reference/Citation System

I've thoroughly explored the BrainMap codebase to understand how the source field works, CodeMirror setup, inline link handling, and markdown parsing. Here's what I found:

### 1. Source Field (Frontmatter)

**Location & Storage:**
- Defined in `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs` (line 144): `pub source: Option<String>` 
- Optional string field in the `Frontmatter` struct
- Parsed via YAML deserialization in `/crates/core/src/parser.rs:11` using `serde_yaml`
- Documented in `/docs/02-data-model.md` as "Origin reference (book, paper, URL)"
- Example: `source: "The Book of Why, Ch.1"`

**Frontend Handling:**
- Editable via `FrontmatterForm.tsx` (lines 35-97): plain text input field
- Stored in Zustand editor store via `EditableFrontmatter` type
- Saved with `updateFrontmatter` action that includes `source` parameter

### 2. CodeMirror 6 Editor Setup

**Main Component:** `/crates/app/src/components/Editor/MarkdownEditor.tsx`

**Extensions Already Integrated (lines 93-104):**
1. `markdown({ extensions: GFM })` — GitHub Flavored Markdown support
2. `linkNavigation(notePath)` — Cmd+Click navigation on markdown links
3. `calloutDecorations()` — Callout block rendering with widgets
4. `listSpacing()` — List visual improvements
5. `markdownDecorations()` — HR lines, blockquotes, tables, inline code, links
6. `checkboxDecorations()` — Task list checkboxes with toggle interaction
7. `copyReferenceMenu(wsRoot)` — Right-click file reference copying
8. `syntaxHighlighting()` — Custom color scheme with headings, bold, italic, strikethrough, code
9. `EditorView.lineWrapping` — Soft line wrapping
10. `lineNumbers()` — Optional line number display (controlled by UIStore)
11. `history()` + keymap — Undo/redo and formatting shortcuts

### 3. Inline Link Handling (Wiki-style References)

**Markdown Link Support (Standard):**
- Parser regex in `/crates/core/src/parser.rs:82`: `\[([^\]]*)\]\(([^)]+\.md)\)`
- Extracts markdown links like `[Causal Inference](Concepts/Causal Inference.md)`
- Resolves relative paths (e.g., `../` and `./` prefixes) via `resolve_relative()`
- Stored as `Vec<InlineLink>` struct with:
  - `target: String` (resolved path)
  - `label: Option<String>` (link text)
  - `position: usize` (character offset in document)

**Wiki-style Link Detection (Extensible):**
- `/crates/app/src/utils/resolveNotePath.ts:45-53` defines `isLocalNoteLink()`:
  - Returns `true` for `.md` files explicitly
  - Returns `true` for paths with no file extension (assumes note reference)
  - Returns `false` for URLs with schemes (http:, mailto:, etc.)
  - This allows `[[Note Title]]` or `[Note Title](Note Title)` patterns to work with proper path resolution

**CodeMirror Extension - Link Navigation:**
- File: `/crates/app/src/components/Editor/cmLinkNavigation.ts`
- Regex: `\[([^\]]*)\]\(([^)]*)\)/g` (extracts links from markdown)
- Features:
  - Cmd+Click handler to navigate to linked notes
  - Cursor changes to pointer when Cmd is held over a link
  - Uses `useGraphStore.selectNode()` and `useEditorStore.openNote()`
  - Shows visual feedback with `.cm-cmd-link-hover` class

### 4. Inline Link Integration with Graph

**Edge Creation (workspace.rs):**
- Inline links from markdown body are converted to `mentioned-in` edges
- `EdgeKind::Inline` type distinguishes them from explicit (frontmatter) and implicit (folder-based) edges
- Code: `all_edges.push(Edge { source: note.path, target, rel: "mentioned-in", kind: EdgeKind::Inline })`

### 5. Markdown Parsing & Rendering

**Parser:**
- `/crates/core/src/parser.rs`: Splits frontmatter from body, extracts inline links with regex
- No wiki-link `[[...]]` syntax support yet (only standard markdown `[label](path)`)
- YAML frontmatter fully type-safe with `serde_yaml`

**Frontend Rendering:**
- `/crates/app/src/components/Editor/MarkdownPreview.tsx`:
  - Uses `react-markdown` v10.1.0 + `remark-gfm` for GFM support
  - Custom link component intercepts local note links for Cmd+Click navigation
  - Renders external links with `target="_blank"`
  - Supports callout blocks via custom blockquote renderer

**Custom CodeMirror Extensions (Extensive):**
- **cmMarkdownDecorations.ts**: Decorates HR lines, blockquotes, fenced code, inline code, tables, links (cursor-aware dimming)
  - Uses syntax tree walking (`syntaxTree()`) to find markdown nodes
  - `Decoration.line()` for block-level styling
  - `Decoration.mark()` for inline styling
  - Table widget with HTML rendering and format button
- **cmCalloutDecorations.ts**: Renders callout blocks `[!type] Title { ... }` with:
  - Custom `CalloutHeaderWidget` showing icon + label + title
  - Line decorations with tinted backgrounds
  - Fold service for collapsing callouts
  - SVG icons via data URIs
- **cmCheckboxDecorations.ts**: Task list checkboxes `[ ]` / `[x]` as interactive widgets
- **cmCopyReference.ts**: Right-click context menu to copy file references with line numbers (`/path/to/note.md#L12-18`)
- **calloutPreprocess.ts**: Pre-processes brace-delimited callouts into blockquote syntax before markdown parsing

### 6. Edge Types & Relationships

**In the Index (Graph):**
- `Explicit` — from frontmatter `links` array (typed relationships)
- `Implicit` — from directory structure (contains/part-of)
- `Inline` — from markdown body links (mentioned-in only)

**Data Model Documentation** (`/docs/02-data-model.md`):
- 15 edge types: causes, supports, contradicts, extends, depends-on, exemplifies, precedes, leads-to, evolved-from, related-to, authored-by, sourced-from, contains, part-of, mentioned-in
- `mentioned-in` edges are system-generated from inline markdown links
- Distinguished visually from typed relationships (dashed line, muted color)

### 7. No Wiki-Link Syntax Currently

**Current Limitation:**
- The system does NOT yet support `[[Note Title]]` wiki-link syntax
- Only standard markdown `[label](path.md)` links work
- The parser would need a new regex pattern and WikiLink token type to support this
- The frontend already has infrastructure (`isLocalNoteLink()`, path resolution) to support it once parsing is added

### Summary: Extension Points

If you want to add inline reference/citation features, the system is already positioned for:

1. **Source citations in markdown body** — The `source` field exists in frontmatter; you could render inline citations like `^[@source]` via a CodeMirror extension + markdown plugin
2. **Wiki-link syntax `[[...]]`** — Add regex extraction in `parser.rs`, create `WikiLink` markdown node type in remark plugin
3. **Inline citation decorations** — Build a CM extension using `StateField` + `Decoration` to highlight citations or render popover tooltips
4. **Citation metadata** — Could extend the `InlineLink` struct to include `citation_type` (e.g., "direct quote", "paraphrase", "reference")
5. **Callout callouts** — Already supported (e.g., `[!source] Chapter 1` callout blocks)

The architecture is highly extensible via CodeMirror ViewPlugins, custom decoration builders, and stateful markdown preprocessing.

---

