# 2026-03-19 — Subagent Transcript: Explore

**Date:** 2026-03-19 10:58:02
**Agent:** Explore
**Agent ID:** abf8db26de62dd267
**Parent Session:** 69132e9c-233d-4f02-853b-992996f9b01d

---

## User

I need to understand the general callout/decoration system in this CodeMirror 6 + React + Tauri app.

Search thoroughly for:
1. How callouts are generally structured - look for patterns like `/definition`, `/math`, `/mermaid`, `/example` in addition to `/source`
2. The `cmMarkdownDecorations.ts` file - this likely orchestrates all decorations
3. Any shared infrastructure for callouts (base classes, shared utilities, decoration helpers)
4. Settings/preferences system - how editor settings are stored and accessed (look for SettingsModal, editorPrefs, uiPrefs, localStorage)
5. How callout styles are defined in CSS (App.css or component CSS)
6. The remark plugin system - how custom markdown syntax is parsed
7. Any extension guide in docs/extension-guides/ about adding callouts or preview widgets

Look in `crates/app/src/` and `docs/`. Be thorough about finding all the pieces of the callout system.

---

## Assistant

I'll conduct a thorough search of the codebase to understand the callout/decoration system in this CodeMirror 6 + React + Tauri app. Let me search systematically across multiple areas.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -type f -name \"*.md\" | head -20"}`

---

## Assistant

Let me search for the key files and patterns related to callouts and decorations:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*Decoration*.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*callout*.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*Callout*.tsx"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"/definition|/math|/mermaid|/example|/source","path":"crates/app/src","type":"ts","head_limit":30}`

---

## Assistant

Great! I found the key files. Let me read them systematically:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts"}`

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts"}`

---

## Assistant

Now let me search for more files to get the complete picture:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*mermaid*.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*Settings*.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"docs/extension-guides/*"}`

---

## Assistant

Perfect! Let me read the extension guide and other critical files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides/add-cm-preview-widget.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"editorPrefs|uiPrefs|localStorage","path":"crates/app/src","type":"ts","head_limit":20}`

---

## Assistant

Let me get the uiStore to understand the settings architecture:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","limit":200}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"class.*Widget|extends WidgetType","path":"crates/app/src/components/Editor","type":"ts","head_limit":30}`

---

## Assistant

Let me read the mermaid decorations file and check the App.css for styles:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMermaidDecorations.ts","limit":250}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/App.css"}`

---

## Assistant

Let me search for CSS related to callouts in the App.css:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"callout\\|mermaid\\|math\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -50"}`

---

## Assistant

Perfect! Let me read the App.css section for callouts and styling:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1100,"limit":300}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"remarkInlineSource|remark.*plugin","path":"crates/app/src","type":"ts","head_limit":20}`

---

## Assistant

Let me read the remark plugin and MarkdownEditor to understand the integration:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkInlineSource.ts"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"calloutDecorations\\|markdownDecorations\\|mermaidDecorations\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx | head -20"}`

---

## Assistant

Perfect! Now I have enough information. Let me compile a comprehensive summary of the callout/decoration system.

## Comprehensive Summary: CodeMirror 6 Callout & Decoration System

I've thoroughly explored the callout/decoration system in this BrainMap CodeMirror 6 + React + Tauri app. Here's the complete architecture:

### 1. **Callout Types Definition**
**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutTypes.ts`

- Defines 7 callout types: `ai-answer`, `source`, `question`, `key-insight`, `example`, `definition`, `math`
- Each has: color hex, label, lucide-react Icon
- Uses regex: `CALLOUT_RE = /^\[!(\w[\w-]*)\][ \t]*(.*)$/m` to parse header
- Fallback styling for unknown types

### 2. **Callout Preprocessing Pipeline**
**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutPreprocess.ts`

Converts brace-delimited syntax to blockquote syntax before markdown parsing:
- Input: `[!type] Title { ... }`
- Output: `> [!type] Title` (blockquote format)
- Handles fenced code blocks inside callouts (skips processing inside backticks)
- Also includes `encodeLinkSpaces()` utility for link normalization

### 3. **Core Decoration System**
**Master file:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts`

Orchestrates all CodeMirror decorations:
- **`scanFencedBlocks(doc)`**: Finds fenced code blocks with `lang` field (e.g., "mermaid", "typescript")
- **`classifyLines(doc)`**: Identifies HR, blockquote, and fenced block lines
- **Inline elements via syntax tree walk**:
  - Inline code (`.cm-inline-code`)
  - Images (dimmed URLs when cursor away)
  - Tables (rendered widget when cursor away, raw markdown when inside)
  - Links (dimmed brackets/URLs)
- **Inline citations** `[!source ...]`, `[!example ...]`, `[!math ...]`:
  - Cursor-aware: hidden when cursor inside, styled when cursor away
  - Uses marks (not replace widgets) to preserve CM6 hit-testing
  - Classes: `.cm-{type}-tag`, `.cm-{type}-content`, `.cm-{type}-bracket`

**Key principle:** Never add margin/padding to `.cm-line` — breaks mouse hit-testing. Use block widget decorations with `estimatedHeight` instead.

### 4. **Callout Decorations Extension**
**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts`

Provides 3 features:
1. **Colored left border + tinted background** (line decorations)
2. **Inline header widget** (replaces raw header when cursor away):
   - Shows icon + label + optional title
   - Uses SVG data URIs for icons (pattern from `graphIcons.ts`)
3. **Fold markers** for collapsing callout bodies

**Scanner:** `scanCallouts(doc)` finds brace-delimited callouts, returns:
```typescript
CalloutRange {
  type, title, headerFrom, headerTo, closingLineFrom, closingLineTo, 
  bodyLineCount, closed: boolean
}
```

**Widget classes:**
- `CalloutHeaderWidget`: renders icon + label + title span
- `MathPreviewWidget`: renders KaTeX below math callouts (when cursor away)
- `CalloutSpacerWidget`: 6px vertical spacer above/below

**Styling via `baseTheme`:** Sets CSS custom properties `--callout-color`, borders, rounded corners, padding.

### 5. **Mermaid Diagram Integration**
**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMermaidDecorations.ts`

Lazy-loads mermaid library, caches rendered SVGs:

- **Async render**: Detects mermaid blocks via `scanFencedBlocks(doc).filter(b => b.lang === "mermaid")`
- **Cache key**: source text (auto-invalidates on edit)
- **Cursor-aware**: Shows raw source inside block, rendered SVG outside
- **Callout nesting**: Detects if mermaid block is inside a callout, applies matching border color
- **Widget**: `MermaidWidget` with error/loading states
- **Settings integration**: Reads `mermaidMaxHeight` from UIStore at render time

### 6. **Inline Citation System (Preview)**
**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkInlineSource.ts`

Remark plugin for markdown preview:
- Transforms `[!source ...]`, `[!example ...]`, `[!math ...]` into styled `<span>` nodes
- For math: renders KaTeX inline
- Walks text nodes in phrasing parents (paragraph, heading, emphasis, etc.)
- Safe for fenced code blocks (skipped)

### 7. **Settings & Preferences**
**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`

**Persisted preferences:**
```typescript
interface PersistedPrefs {
  sourceStyle?: SourceStyle;        // "underline" | "pill" | "icon" | "quotes"
  exampleStyle?: ExampleStyle;      // same options
  mermaidMaxHeight?: number;        // default 400px
  editorFontFamily?: string;
  editorFontSize?: number;
  lineWrapping?: boolean;
  spellCheck?: boolean;
  editorIndentSize?: number;
  // ... many more
}
```

Stored in localStorage as `brainmap:uiPrefs`, synced via Zustand store.

**SettingsModal.tsx:** UI controls for all settings, reads/writes via `useUIStore()` selectors.

### 8. **CSS Styling System**
**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

Key patterns:

**Inline citations (lines 1258–1449):**
- 4 independent style modes per type (source, example) via `[data-source-style]` / `[data-example-style]` on `<html>`
- Each style uses `.cm-{type}-tag::after` to show label (via CSS `content`)
- `.cm-{type}-content` and `.cm-{type}-bracket` styled accordingly

**Callout lines (lines 1113–1114):**
- `.cm-callout-line`: borders, tint, padding
- Set via `Decoration.line({ attributes: { class: classes, style: `--callout-color: ...` } })`

**Widgets:**
- `.cm-mermaid-widget`: padding, SVG sizing
- `.cm-math-preview`: KaTeX display math styling
- `.cm-table-widget`: rendered table with borders, striping

**Preview (lines 2448–2520):**
- `.md-preview .callout`: blockquote-like styling in read-only preview
- `.md-preview .callout-math-body`: KaTeX rendering in preview

### 9. **MarkdownEditor Integration**
**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx`

Registers extensions in this order:
```typescript
clearMermaidCache();  // reset on theme change
calloutDecorations()
markdownDecorations()  // HR, blockquote, fenced, inline citations, tables
mermaidDecorations(isDark)
// ... other extensions
```

Key: `clearMermaidCache()` is called before extension setup to reset mermaid module on theme change.

### 10. **Extension Guide Reference**
**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides/add-cm-preview-widget.md`

Canonical step-by-step for adding new preview widgets:
- Implement `WidgetType` with `eq()` comparing both source AND cache state
- Use `StateField` + `StateEffect` for decorations
- Collect pending renders in module-level array, consume in `EditorView.updateListener`
- Wrap `view.dispatch()` in try/catch (view may be destroyed)
- Use `Decoration.widget({ widget, block: true })` with `estimatedHeight`
- Add CSS (no margin/padding on `.cm-line`)
- Export cache-clear function for theme changes
- Register in MarkdownEditor

### 11. **Other Decoration Extensions**
Similar per-feature files exist for:
- `cmCheckboxDecorations.ts`: checkbox styling
- `cmBulletDecorations.ts`: list bullet styling

### 12. **Key Patterns Across System**

1. **Cursor-aware rendering**: Hide decorations on cursor line, show when away
2. **Cache by source text**: Automatic invalidation on edit
3. **Block widget decorations**: Preserve CM6 height accuracy with `estimatedHeight`
4. **SVG data URIs**: For icons (avoids network requests, supports dynamic colors)
5. **ViewPlugin for live settings**: Subscribe to store changes, update DOM without full editor recreation
6. **Lazy library loading**: Dynamic `import()` for large deps (mermaid ~2MB)
7. **Security**: `securityLevel: "strict"` for mermaid, HTML escaping for user content
8. **Remark plugin pipeline**: Preprocessing (callout syntax), then markdown parsing, then remark plugins (inline source)

This is a well-architected, modular system that follows CodeMirror 6 best practices and maintains clear separation between editor decorations, preview rendering, and settings management.

---

