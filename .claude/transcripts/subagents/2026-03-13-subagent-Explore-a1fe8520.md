# 2026-03-13 — Subagent Transcript: Explore

**Date:** 2026-03-13 16:34:54
**Agent:** Explore
**Agent ID:** a1fe8520a794ec95b
**Parent Session:** 0f8be718-cfd9-44cc-bff6-e001ee4a68da

---

## User

Find all files related to rendering callout blocks (the `> [!type]` syntax) in the desktop app. I need to understand how the callout icon is rendered - there seems to be a duplicate icon. Look in `crates/app/src/` for callout-related components, CSS, and CodeMirror decorations. Search for "callout" in all relevant files. Show me the full content of the key files that handle callout rendering/styling.

---

## Assistant

I'll search for callout-related files and components in the desktop app codebase.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*callout*"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"callout","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

Now let me read the key callout-related files:

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutPreprocess.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkCalloutMerge.ts"}`

---

## Assistant

Now let me check the CSS and preview rendering:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","limit":200}`

---

## Assistant

Let me search for more CSS related to callout rendering:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"callout\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -50"}`

---

## Assistant

Now let me read the full callout CSS section:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1364,"limit":100}`

---

## Assistant

Let me also check the EditorToolbar to see how callouts are inserted:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorToolbar.tsx"}`

---

## Assistant

Now let me check the cmFormatting module to see how callouts are inserted:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 20 \"insertCallout\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts"}`

---

## Assistant

Perfect! Now I have a comprehensive view of all the callout-related code. Let me create a summary report for the user.

## Summary: Callout Rendering in BrainMap Desktop App

I've found all files related to callout rendering. Here's the complete breakdown:

### Key Files:

**1. `/crates/app/src/components/Editor/calloutTypes.ts`** (35 lines)
- Single source of truth for callout type definitions
- Exports `CALLOUT_TYPES` record with 4 built-in types: `ai-answer`, `source`, `question`, `key-insight`
- Each type has: `color`, `label`, and Lucide React `Icon` component
- Exports `CALLOUT_RE` regex for parsing `[!type]` syntax
- Exports fallback styling for unknown callout types

**2. `/crates/app/src/components/Editor/cmCalloutDecorations.ts`** (509 lines)
- CodeMirror 6 extension handling callout visual rendering in the editor
- **Four rendering features:**
  - Feature A: Tinted background + colored left border on callout lines
  - Feature B: Gutter icon on the callout header line (this is the icon you might be seeing twice)
  - Feature C: Inline header widget showing the type label + optional title
  - Feature D: Fold markers for collapsing callout bodies
- Builds SVG icons from hardcoded paths (mirrors graphIcons.ts pattern)
- `CalloutHeaderWidget` class (lines 216-263): Creates the widget that replaces the raw `[!type] {...}` syntax with rendered icon + label + title
- `CalloutGutterMarker` class (lines 268-290): Creates the gutter icon on the left margin
- `scanCallouts()` function: Identifies callout blocks in the document
- `buildDecorations()` function: Creates line decorations with background tinting and widget replacements

**3. `/crates/app/src/components/Editor/calloutPreprocess.ts`** (102 lines)
- Preprocessor converts brace-delimited syntax `[!type] {...}` into blockquote syntax `> [!type]` before markdown parsing
- Respects fenced code blocks (doesn't process callouts inside them)
- Used by preview renderer before passing to react-markdown

**4. `/crates/app/src/components/Editor/remarkCalloutMerge.ts`** (73 lines)
- Remark plugin merges consecutive blockquotes starting with callout syntax
- Allows blank lines inside callouts without breaking into separate blockquotes

**5. `/crates/app/src/components/Editor/MarkdownPreview.tsx`** (169 lines)
- Handles rendering in preview mode
- `extractCalloutFromChildren()` function (lines 30-86): Detects callout syntax in blockquote React children
- `blockquote` component override (lines 122-156): **This is where preview callouts render**
  - Renders icon via Lucide React component: `{IconComponent && <IconComponent size={16} />}`
  - Renders type label (uppercase, color-coded)
  - Renders custom title if present
  - Each icon appears only once in the preview header

**6. `/crates/app/src/App.css`** (lines 1364-1443)
- Callout styling: border-left + tinted background
- `.callout-header`: flexbox row displaying icon + label + title
- `.callout-type-label`: uppercase, letter-spaced
- `.callout-title`: right side, with em-dash separator
- `.callout-picker-item`: dropdown menu items in toolbar

**7. `/crates/app/src/components/Editor/EditorToolbar.tsx`** (126 lines)
- Callout picker dropdown in the formatting toolbar (☰ button)
- Maps over `CALLOUT_TYPE_ENTRIES` to render picker items
- Each item shows icon + label
- Calls `insertCallout()` on selection

### Duplicate Icon Issue Analysis:

The icon appears in **two places** during editing:

1. **Gutter marker** (cmCalloutDecorations.ts, lines 280-289, Feature B):
   - 16×16 SVG icon in the left gutter margin
   - Created by `CalloutGutterMarker.toDOM()`

2. **Inline widget** (cmCalloutDecorations.ts, lines 237-242, Feature C):
   - 14×14 SVG icon in the widget replacement
   - Created by `CalloutHeaderWidget.toDOM()`
   - Appears inline where the raw `[!type] {...}` text is replaced

Both icons use the same `getCalloutIconUri()` function but are rendered independently. The gutter icon serves as a visual indicator at the line margin (like Visual Studio Code), while the inline widget icon is part of the formatted callout header display.

### Icon Data:

Both CodeMirror decorations and preview use the **same icon definitions** from `calloutTypes.ts`:
- `calloutTypes.ts` has the Lucide React icon definitions
- `cmCalloutDecorations.ts` rebuilds these as SVG data URIs for CodeMirror display
- Preview uses the Lucide components directly

**Files to focus on for duplicate icon fix:**
- `/crates/app/src/components/Editor/cmCalloutDecorations.ts` — gutter and widget rendering logic
- Potentially CSS affecting gutter display (`App.css` callout-related rules)

---

