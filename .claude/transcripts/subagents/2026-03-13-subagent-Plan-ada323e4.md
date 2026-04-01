# 2026-03-13 — Subagent Transcript: Plan

**Date:** 2026-03-13 15:35:55
**Agent:** Plan
**Agent ID:** ada323e4bb7614c6e
**Parent Session:** c02fcf0e-8ccb-4809-9cea-1b2a5005ee83

---

## User

Plan a CodeMirror 6 extension that visually decorates callout blocks in the editor (edit mode). The callout brace syntax is:

```
[!type] Optional Title {
body content here

more content
}
```

Where `type` is one of: ai-answer, source, question, key-insight (or unknown types with fallback).

## Requirements — implement ALL FOUR features:

### A) Tinted background + colored left border
- Detect callout blocks (from `[!type]...{` opening line to closing `}` line)
- Apply line decorations: subtle background tint + 3px left border using the type's color
- The opening `[!type]` header line gets slightly different styling (bolder/darker tint)
- Must skip callout syntax inside fenced code blocks (``` or ~~~)

### B) Gutter icons
- Render the callout type's Lucide icon in the CodeMirror gutter next to the opening `[!type]` line
- Icons and colors come from `calloutTypes.ts` which exports `CALLOUT_TYPES` record with `{ color, label, Icon }` per type, and `CALLOUT_FALLBACK` for unknown types

### C) Inline widget for the header line
- Replace the raw `[!type] Title {` line with a styled inline widget showing icon + formatted type label + title (similar to preview header)
- Body lines remain editable plain text
- When cursor is on the header line, reveal the raw syntax for editing (switch between widget and raw text based on cursor position)
- The closing `}` should also be visually de-emphasized or replaced with a subtle end marker

### D) Fold markers
- Add fold capability so users can collapse callout bodies
- Click fold gutter marker or keyboard shortcut to toggle
- When folded, show a summary like "AI Answer — Title ▸ (3 lines)"

## Existing code context:

**calloutTypes.ts** — single source of truth:
```typescript
import { Bot, BookOpen, HelpCircle, Lightbulb, type LucideIcon } from "lucide-react";
export interface CalloutTypeDef { color: string; label: string; Icon: LucideIcon; }
export const CALLOUT_TYPES: Record<string, CalloutTypeDef> = {
  "ai-answer": { color: "#4a9eff", label: "AI Answer", Icon: Bot },
  source: { color: "#f39c12", label: "Source", Icon: BookOpen },
  question: { color: "#9b59b6", label: "Question", Icon: HelpCircle },
  "key-insight": { color: "#27ae60", label: "Key Insight", Icon: Lightbulb },
};
export const CALLOUT_FALLBACK = { color: "#8e8e93", label: "" };
export const CALLOUT_RE = /^\[!(\w[\w-]*)\][ \t]*(.*)$/m;
```

**MarkdownEditor.tsx** — where extensions are registered:
```typescript
const extensions = [
  markdown(),
  history(),
  keymap.of([...formattingKeymap, ...historyKeymap, ...defaultKeymap]),
  EditorView.updateListener.of(...),
  EditorView.lineWrapping,
  syntaxHighlighting(buildMarkdownHighlight(isDark)),
  linkNavigation(notePath),
];
```

**cmLinkNavigation.ts** — existing extension pattern (uses EditorView.domEventHandlers + EditorView.baseTheme, returns Extension array)

**calloutPreprocess.ts** has regex: `const CALLOUT_BRACE_START = /^\[!(\w[\w-]*)\]([^\n{]*)\{\s*$/;`

**graphIcons.ts** already has SVG data URI generation for Lucide icons — pattern to reuse for gutter icons.

## Design constraints:
- New file: `cmCalloutDecorations.ts` (follows `cm*.ts` naming convention)
- Export a function `calloutDecorations(): Extension` that returns all four features
- Must handle: document edits (re-scan on changes), fenced code blocks (skip), unclosed callouts (graceful), empty callouts
- Reuse CALLOUT_TYPES colors/labels from calloutTypes.ts
- For gutter icons, can't use React components directly in CM — need to render DOM elements or SVG
- For the inline widget (feature C), use CodeMirror's `WidgetType` + `Decoration.replace` for the header line, switching to raw text when cursor is on that line
- Performance: use ViewPlugin with decorations computed from visible ranges where possible

Provide a detailed implementation plan with file structure, key CodeMirror APIs to use, and how the four features interact.

---

## Assistant



I'll explore the existing codebase to understand the patterns and conventions before designing the plan.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*cm*.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/callout*.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/graphIcons.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/MarkdownEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmLinkNavigation.ts"}`

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphIcons.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

Now let me check the cmFormatting.ts for patterns and look at how the existing code handles CodeMirror extensions.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/EditorToolbar.tsx"}`

---

## Assistant

Let me check the fileTreeIcons for the SVG rendering pattern used with Lucide icons, and also check what CM packages are available.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Files/fileTreeIcons.tsx","limit":30}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && cat package.json | python3 -c \"import sys,json; deps={**json.load(sys.stdin).get('dependencies',{}),**json.load(open('package.`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Files/fileTreeIcons.*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/fileTreeIcons*"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/fileTreeIcons.tsx","limit":40}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutPreprocess.test.ts"}`

---

## Assistant

Now let me check what @codemirror/fold or similar APIs are available, and look at how the `@codemirror/language` fold API works.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && ls node_modules/@codemirror/language/dist/*.d.ts 2>/dev/null | head -5","description":"Check CM language package types"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && cat node_modules/@codemirror/view/dist/index.d.ts | python3 -c \"import sys; text=sys.stdin.read(); [print(l) for l in text.spl`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && python3 -c \"\nimport re\nwith open('node_modules/@codemirror/language/dist/index.d.ts') as f:\n    text = f.read()\nfor line i`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && python3 -c \"\nwith open('node_modules/@codemirror/language/dist/index.d.ts') as f:\n    text = f.read()\nfor line in text.spli`

---

## Assistant

Now let me check the key CM view APIs for decorations and widgets.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && python3 -c \"\nwith open('node_modules/@codemirror/view/dist/index.d.ts') as f:\n    text = f.read()\nfor line in text.split('\`

---

## Assistant

I now have a thorough understanding of the codebase. Let me also quickly check how Lucide icon SVG paths are used in calloutTypes to understand how to get SVG data for the gutter icons.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && python3 -c \"\nwith open('node_modules/@codemirror/view/dist/index.d.ts') as f:\n    text = f.read()\n# Find ViewPlugin definit`

---

## Assistant

I have all the information I need. Here is the detailed implementation plan.

---

## Implementation Plan: CodeMirror 6 Callout Block Decorations

### Overview

A single new file `cmCalloutDecorations.ts` will export `calloutDecorations(): Extension` that bundles four coordinated features: tinted background lines, gutter icons, inline header widgets, and fold markers. All features share a common document-scanning pass that identifies callout block ranges while skipping fenced code blocks.

---

### Architecture: Shared Scanning Layer

The four features all need to know where callout blocks are in the document. Rather than scanning four times, a single `ViewPlugin` will scan the visible document ranges and produce a data structure consumed by all four features.

**Data structure produced by the scanner:**

```typescript
interface CalloutRange {
  type: string;           // e.g. "ai-answer"
  title: string;          // optional title text
  headerFrom: number;     // absolute pos of header line start
  headerTo: number;       // absolute pos of header line end
  bodyFrom: number;       // absolute pos of first body line start
  bodyTo: number;         // absolute pos of closing "}" line end
  closingLineFrom: number; // start of the "}" line
  closingLineTo: number;   // end of the "}" line
  bodyLineCount: number;   // number of lines in body (for fold summary)
}
```

**Scanning algorithm** (reuses logic from `calloutPreprocess.ts`):

1. Iterate lines in the document (or visible ranges for performance).
2. Track fenced code block state using `FENCE_OPEN` regex (same pattern as `calloutPreprocess.ts`).
3. When not in a fence, match `CALLOUT_BRACE_START` regex against each line.
4. When matched, record the header line range and scan forward for the closing `}` on its own line.
5. Handle edge cases: unclosed callouts (treat as extending to document end), empty callouts (body range is zero-length), nested fences inside callouts (the fence tracking already handles this since callout bodies are plain text).

For performance, since callouts are typically sparse and documents modest in size, a full-document scan is acceptable. The ViewPlugin's `update` method will re-scan when `docChanged` is true or the viewport changes.

---

### Feature A: Tinted Background + Colored Left Border

**CodeMirror APIs:** `Decoration.line()`, `ViewPlugin` with `provide: plugin => EditorView.decorations.of(...)`.

**Implementation:**

- For each `CalloutRange`, create line decorations for every line from `headerFrom` to `closingLineTo`.
- The header line gets class `cm-callout-header cm-callout-{type}`.
- Body lines get class `cm-callout-body cm-callout-{type}`.
- The closing `}` line gets class `cm-callout-close cm-callout-{type}`.
- CSS styles defined via `EditorView.baseTheme({})`:
  - `.cm-callout-header`: slightly darker/bolder background tint, 3px left border using the type's color.
  - `.cm-callout-body`: subtle background tint, 3px left border (same color, lighter).
  - `.cm-callout-close`: same subtle tint, border continues.
- Since there are only 4 known types plus fallback, generate CSS classes dynamically per type using CSS custom properties. Each line decoration will set `style: --callout-color: {color}` and the base theme uses `var(--callout-color)` for `border-left-color` and `background: color-mix(in srgb, var(--callout-color) 8%, transparent)`.

**Alternative approach (simpler):** Use `Decoration.line({ attributes: { style: "..." } })` to inline the style with the specific color. This avoids needing to enumerate all type classes. The `style` attribute can set `border-left: 3px solid {color}; background: {tint}` directly. The header line gets a slightly more opaque background (12% vs 6%).

The inline-style approach is better here because it handles unknown callout types automatically via `CALLOUT_FALLBACK.color`.

---

### Feature B: Gutter Icons

**CodeMirror APIs:** `gutter()` with a custom `GutterMarker`, the `markers` function reads from the shared scan data.

**Implementation:**

- Create a `CalloutGutterMarker extends GutterMarker` that renders a DOM element containing an SVG icon.
- For the SVG, adopt the pattern from `graphIcons.ts`: build SVG strings from Lucide icon path data and render as an `<img>` with a `data:image/svg+xml` URI. This avoids React dependency in CM DOM.
- Need to add a `CALLOUT_ICON_PATHS` record in `cmCalloutDecorations.ts` mapping callout types to their Lucide SVG path data (extracted from the same Lucide source used in `graphIcons.ts`). The four icons needed are: Bot (ai-answer), BookOpen (source), HelpCircle (question), Lightbulb (key-insight).
- The `gutter()` config's `markers` function returns a `RangeSet<GutterMarker>` built from the scan results, with one marker at each `headerFrom` position.
- The gutter gets class `cm-callout-gutter` with appropriate width (20px).
- The `GutterMarker.toDOM()` creates a 16x16 `<img>` element with the SVG data URI. The icon color matches the callout type color.
- `GutterMarker.eq()` compares type string for equality to avoid unnecessary re-renders.

**Icon path data extraction:** Copy the relevant paths from `graphIcons.ts`'s `NOTE_TYPE_ICON_PATHS` (which already has `question` = HelpCircle). For the callout-specific ones not already there (Bot), extract the SVG path data from the Lucide package. Create a helper `buildCalloutIconSvg(type: string): string` that returns a cached data URI.

Actually, a cleaner approach: create a small `CALLOUT_ICON_SVG_PATHS` map in `cmCalloutDecorations.ts` with just the 4 icon path sets, plus a fallback. Reuse the `renderSvgElement` / `buildSvgDataUri` helper pattern from `graphIcons.ts` (either import if exported, or duplicate the small helper).

Since `graphIcons.ts` does not export `buildSvgDataUri` or `renderSvgElement`, the cleanest path is to either:
1. Extract those two small functions into a shared `utils/svgHelpers.ts`, or
2. Duplicate them (they are ~10 lines total) in `cmCalloutDecorations.ts`.

Option 2 is simpler and avoids touching existing files. The functions are trivial.

---

### Feature C: Inline Header Widget

**CodeMirror APIs:** `WidgetType`, `Decoration.replace()`, cursor-aware toggling via `ViewPlugin.update`.

**Implementation:**

- Create `CalloutHeaderWidget extends WidgetType` that renders a styled `<span>` containing: icon (16px img), formatted type label (bold, colored), title text, and a subtle opening indicator.
- The widget replaces the entire header line content (from line start to line end) using `Decoration.replace({ widget: new CalloutHeaderWidget(...) })`.
- **Cursor-aware toggling:** When the cursor (primary selection head) is on the header line, do NOT apply the replace decoration for that line — instead show the raw `[!type] Title {` syntax so the user can edit it. This is checked during decoration building: compare each `CalloutRange.headerFrom/headerTo` against `state.selection.main.head`. If the cursor's line overlaps the header line, skip the replace decoration for that callout's header.
- The closing `}` line gets a `Decoration.replace` with a smaller widget showing a subtle horizontal line or thin colored bar (a `CalloutCloseWidget`). Same cursor-aware logic: if cursor is on the closing line, show the raw `}`.
- `CalloutHeaderWidget.toDOM()` builds:
  ```html
  <span class="cm-callout-widget-header" style="--callout-color: {color}">
    <img src="{svgDataUri}" width="14" height="14" />
    <span class="cm-callout-widget-label">{label}</span>
    <span class="cm-callout-widget-title">{title}</span>
  </span>
  ```
- `CalloutCloseWidget.toDOM()` builds a small `<span class="cm-callout-widget-close">` with a thin colored line.
- Both widgets implement `eq()` comparing type + title strings.

**Styling (via `EditorView.baseTheme`):**
- `.cm-callout-widget-header`: inline-flex, align-items center, gap 6px, padding 2px 8px, border-radius 4px, background using the callout color at low opacity.
- `.cm-callout-widget-label`: font-weight 600, color from callout type, text-transform uppercase, font-size 0.85em.
- `.cm-callout-widget-title`: normal weight, color inherited.
- `.cm-callout-widget-close`: display block, height 2px, background using callout color at 30% opacity, border-radius 1px, margin 2px 0.

---

### Feature D: Fold Markers

**CodeMirror APIs:** `foldService`, `foldGutter()`, `foldKeymap`, `codeFolding()`.

**Implementation:**

- Register a `foldService` facet that, given a line position, checks if that line is a callout header line (matches `CALLOUT_BRACE_START`). If so, returns `{ from: headerTo, to: closingLineTo }` — the foldable range is from end of header line to end of closing `}` line.
- The fold service needs to do its own quick scan forward from the header line to find the matching `}`, accounting for fenced code blocks. This is a lightweight per-line check (only triggered when CM queries foldability for a specific line).
- Include `codeFolding({ placeholderDOM(view, onclick) { ... } })` to customize the fold placeholder. The placeholder should show: `"{label} -- {title} ... ({N} lines)"` as a styled inline element. To get the type/title/line-count, read the folded range's start line from the document.
- Include `foldGutter()` for the clickable fold markers in the gutter.
- Include `foldKeymap` in the keymap for keyboard fold/unfold.

**Fold placeholder customization:**
- `codeFolding` accepts `placeholderDOM` or `placeholderText`. Use `placeholderDOM` to return a styled `<span>`:
  ```html
  <span class="cm-callout-fold-placeholder">
    AI Answer — Title ... (3 lines)
  </span>
  ```
- To determine the callout type from the fold range: look at the line just before `from` (which is the header line end), parse it with `CALLOUT_BRACE_START`.

**Challenge:** The `placeholderDOM` callback receives `(view, onclick)` but not the fold range position. To work around this, we can use `codeFolding`'s `placeholderText` instead (returns a string), but that does not support styled DOM. 

Alternative: use `foldEffect` to store fold metadata in a `StateField`, and the `placeholderDOM` can look up the metadata. But this is overly complex.

Simpler approach: Use `Decoration.replace` from the fold system's built-in behavior. The `codeFolding` extension already handles fold/unfold. For the placeholder, `placeholderText` can return `"AI Answer — Title ... (3 lines)"` as plain text. This is acceptable and avoids complexity.

Actually, looking more carefully at the CM API: `codeFolding({ placeholderDOM(view, onclick) })` does get called when rendering a fold widget, and we can inspect the view's fold state to find which range is being rendered. But the callback does not receive the range. The standard workaround is to use a custom `WidgetType` via the fold state's decoration set. However, the simplest approach:

Use the default `codeFolding()` + `foldGutter()` + `foldKeymap`. The fold placeholder will show the default "..." marker. This is standard behavior and already good UX. If a custom placeholder is strongly desired, it can be added as a follow-up enhancement.

For the MVP, the fold service is the critical piece. The placeholder can use `placeholderText: "..."` (default) which is clean and standard.

---

### File Structure

**New file:** `crates/app/src/components/Editor/cmCalloutDecorations.ts`

**New test file:** `crates/app/src/components/Editor/cmCalloutDecorations.test.ts`

**Modified file:** `crates/app/src/components/Editor/MarkdownEditor.tsx` (add `calloutDecorations()` to extensions array)

### Integration into MarkdownEditor.tsx

Add to the `extensions` array in `MarkdownEditor.tsx`:

```typescript
import { calloutDecorations } from "./cmCalloutDecorations";
// ...
const extensions = [
  // ... existing extensions ...
  calloutDecorations(),
];
```

Also need to add fold keymap bindings:

```typescript
import { foldKeymap } from "@codemirror/language";
// add to keymap.of([...foldKeymap, ...])
```

---

### Internal Structure of `cmCalloutDecorations.ts`

```
// Imports
// SVG path data for callout icons (Bot, BookOpen, HelpCircle, Lightbulb)
// SVG builder helpers (duplicated from graphIcons.ts pattern)
// CALLOUT_BRACE_START regex (imported from calloutPreprocess.ts or re-declared)
// FENCE_OPEN regex

// --- Scanning ---
// interface CalloutRange { ... }
// function scanCallouts(doc: Text): CalloutRange[]
//   - Iterates all lines, tracks fence state, finds callout blocks

// --- Feature A: Line Decorations ---
// function buildLineDecorations(ranges: CalloutRange[]): DecorationSet
//   - For each range, create Decoration.line() for header/body/close lines

// --- Feature B: Gutter ---
// class CalloutGutterMarker extends GutterMarker
//   - toDOM(): <img> with SVG data URI
//   - eq(): compare type
// function buildGutterMarkers(ranges: CalloutRange[]): RangeSet<GutterMarker>

// --- Feature C: Header Widget ---
// class CalloutHeaderWidget extends WidgetType
//   - toDOM(): styled span with icon + label + title
//   - eq(): compare type + title
// class CalloutCloseWidget extends WidgetType
//   - toDOM(): subtle end marker
// function buildWidgetDecorations(ranges: CalloutRange[], cursorLine: number): DecorationSet
//   - Skip replace decoration if cursor is on header or close line

// --- Feature D: Fold ---
// foldService callback: detect callout headers, return foldable range

// --- Main ViewPlugin ---
// Combines scanning + decoration building
// ViewPlugin.fromClass with provide for decorations
// Rebuilds on docChanged or viewport/selection change

// --- Export ---
// export function calloutDecorations(): Extension
//   - Returns array of: ViewPlugin, gutter(), foldService, codeFolding(),
//     foldGutter(), baseTheme
```

---

### Key CodeMirror APIs Used

| API | Purpose |
|-----|---------|
| `ViewPlugin.fromClass` | Main plugin that scans document and builds decorations |
| `Decoration.line()` | Feature A: tinted background + left border per line |
| `Decoration.replace()` | Feature C: replace header/close lines with widgets |
| `WidgetType` | Feature C: header and close widget rendering |
| `GutterMarker` + `gutter()` | Feature B: icon in gutter next to header line |
| `foldService` | Feature D: define foldable ranges for callout blocks |
| `codeFolding()` + `foldGutter()` | Feature D: fold UI and gutter markers |
| `foldKeymap` | Feature D: keyboard shortcuts for fold/unfold |
| `EditorView.baseTheme()` | All features: CSS styling |
| `RangeSetBuilder` | Building sorted decoration and gutter marker sets |

---

### Edge Cases

1. **Unclosed callout** (no matching `}`): Treat the callout as extending to the end of the document. Apply line decorations but do not offer fold (no clear fold endpoint). The header widget still renders.

2. **Empty callout** (`[!type] {\n}`): Two-line callout. Fold is a no-op (nothing to fold). Line decorations apply to both lines.

3. **Callout inside fenced code block**: Scanner tracks fence state and skips matches inside fences. Uses same `FENCE_OPEN` regex as `calloutPreprocess.ts`.

4. **Multiple callouts**: Scanner produces an array; all features iterate it.

5. **Cursor on header line** (Feature C): Check `state.selection.main.head` line number against each header line. When matched, skip the `Decoration.replace` for that header so raw syntax is shown. Same for the closing `}` line.

6. **Nested structures**: Callout bodies may contain markdown (bold, links, etc.). Since we only apply line-level decorations and a replace on the header line, body content is unaffected and editable normally.

7. **Performance**: `scanCallouts` runs on every relevant update. For typical note sizes (< 1000 lines), this is negligible. If performance becomes an issue, can cache scan results and invalidate only on `docChanged`.

---

### Test Plan (cmCalloutDecorations.test.ts)

Unit tests for the scanning function (pure, no DOM needed):

1. `scanCallouts` finds a single callout with type, title, and correct ranges
2. `scanCallouts` handles multiple callouts
3. `scanCallouts` skips callouts inside fenced code blocks
4. `scanCallouts` handles unclosed callouts gracefully
5. `scanCallouts` handles empty callouts (no body lines)
6. `scanCallouts` handles callout with no title
7. `scanCallouts` handles unknown callout types

Unit tests for SVG generation:
8. `buildCalloutIconSvg` returns valid data URI for known types
9. `buildCalloutIconSvg` returns fallback icon for unknown types

The widget and decoration tests would require a CM EditorView instance (integration-level); these can be verified manually or with a lightweight CM test harness.

---

### Dependencies and Sequencing

1. **No new npm packages needed.** All required APIs are in `@codemirror/view`, `@codemirror/state`, and `@codemirror/language` (already installed).

2. **Implementation order:**
   - Step 1: Implement `scanCallouts()` function + tests
   - Step 2: Implement Feature A (line decorations) + base theme
   - Step 3: Implement Feature B (gutter icons) with SVG helpers
   - Step 4: Implement Feature D (fold service + codeFolding + foldGutter)
   - Step 5: Implement Feature C (header/close widgets with cursor awareness)
   - Step 6: Wire into `MarkdownEditor.tsx`
   - Step 7: Test all features together, handle edge cases

3. **Feature C depends on A** being correct (the cursor-aware toggle needs the same scan data). Feature D is independent. Feature B is independent. All depend on the scanner.

---

### Potential Challenges

1. **SVG icon paths for Bot icon**: The `graphIcons.ts` file has icon paths for note types but not for `Bot` (Lucide). Need to manually extract the SVG path data from Lucide's Bot icon. This is a one-time extraction from the Lucide package source.

2. **Fold placeholder customization**: The `codeFolding` API's `placeholderDOM` does not receive the fold range, making it hard to show callout-specific text. Workaround: use a `StateField` that maps fold ranges to callout metadata, or accept the default "..." placeholder for now.

3. **Decoration ordering**: When both line decorations (Feature A) and replace decorations (Feature C) apply to the same line (the header), CM handles this correctly because `Decoration.line` is a line-level decoration and `Decoration.replace` is a range decoration -- they operate on different decoration levels and do not conflict.

4. **Re-rendering on cursor move**: Feature C needs to toggle between widget and raw text when the cursor enters/leaves the header line. This requires the ViewPlugin to rebuild decorations on selection changes, not just document changes. Use `update.selectionSet || update.docChanged || update.viewportChanged` as the rebuild trigger.

---

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts` - New file: all four features implemented here
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx` - Integration point: add calloutDecorations() to extensions array
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutTypes.ts` - Source of truth for callout type colors, labels, and the CALLOUT_RE regex
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphIcons.ts` - Pattern to follow for SVG data URI generation from Lucide icon paths
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutPreprocess.ts` - Reference for fence-aware callout scanning logic (CALLOUT_BRACE_START, FENCE_OPEN regexes)

---

