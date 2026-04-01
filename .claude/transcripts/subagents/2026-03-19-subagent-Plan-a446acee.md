# 2026-03-19 — Subagent Transcript: Plan

**Date:** 2026-03-19 11:34:15
**Agent:** Plan
**Agent ID:** a446acee9416b7c94
**Parent Session:** 4cac2b49-c4c3-48f7-9534-fbba999734a6

---

## User

Design an implementation plan for enhancing ordered and unordered list styling in a CodeMirror 6 + React markdown editor (Tauri desktop app).

## Current State

**Edit mode (CodeMirror 6):**
- `cmBulletDecorations.ts`: Replaces `-`, `*`, `+` markers with a small `•` character via `Decoration.replace()` widget. Cursor-aware (shows raw marker when editing that line). CSS: `.cm-bullet-widget { font-size: 0.8em; color: var(--text-muted); }` — very subtle on dark themes.
- `cmListSpacing.ts`: Adds `cm-list-line` / `cm-list-first` line decoration classes. CSS: `.cm-list-line { line-height: 2.2; }`
- `cmListNesting.ts`: Tab/Shift+Tab for ordered list nesting with marker cycling (numeric→alpha→roman).
- No special styling for ordered list numbers.

**Preview mode (react-markdown):**
- Standard `<ul>`, `<ol>`, `<li>` rendered by react-markdown. CSS: `padding-left: 1.6em; li { margin-bottom: 0.5em; }`. No marker styling.

**IMPORTANT constraint:** Never use margin/padding on `.cm-line` elements — it breaks CodeMirror mouse hit-testing. Use line-height or block widget decorations instead.

## Requirements

1. **Accent-colored markers** — Both edit and preview. Bullets and ordered numbers should use `var(--accent)` instead of `--text-muted`.

2. **Depth-aware bullet shapes** — Edit mode. Different bullet characters per nesting level. User-configurable via Settings with presets:
   - "classic": `●` / `○` / `▪` (filled circle → open circle → filled square)
   - "dash": `—` / `–` / `·` (em dash → en dash → middle dot)
   - "arrow": `▸` / `▹` / `▪` (filled triangle → open triangle → filled square)
   - "minimal": `•` / `•` / `•` (current behavior, same bullet at all depths)

3. **Ordered number styling** — Edit mode. Replace raw `1.` / `a.` / `i.` markers with a styled widget (accent-colored number, slightly bolder). Similar approach to bullet widget.

4. **Preview list styling** — `li::marker { color: var(--accent); font-weight: 600; }` and optionally a subtle left border on `ul`/`ol`.

5. **Settings integration** — Add a "List bullet style" dropdown in the Editor section of SettingsModal, following the existing pattern of SourceStyle/ExampleStyle.

## Existing Patterns to Follow

**Settings pattern (citation styles):**
- Type: `export type SourceStyle = "underline" | "pill" | "icon" | "quotes";`
- Options array: `export const SOURCE_STYLE_OPTIONS: { value: SourceStyle; label: string }[]`
- PersistedPrefs: `sourceStyle?: SourceStyle;`
- UIState: field + setter
- SettingsModal: `<select>` with options
- App.tsx: `document.documentElement.setAttribute("data-source-style", sourceStyle);`
- CSS: `[data-source-style="pill"] .cm-source-citation { ... }`

**CodeMirror widget pattern (bullet decorations):**
- `WidgetType` subclass with `toDOM()` returning styled `<span>`
- `StateField` that rebuilds decorations on doc/selection changes
- Cursor-aware: skip decoration on cursor line
- `Decoration.replace({ widget })` to swap raw marker with styled widget

**Theme variables (Dark theme):**
- `--accent: #4a9eff` (good contrast on `--bg-primary: #1e1e1e`)
- `--text-muted: #666666` (current bullet color — too subtle)
- `--text-secondary: #aaaaaa`

## Design Considerations

1. The bullet style setting needs to reach the CodeMirror extension. Two approaches:
   a. Data attribute on `<html>` (like citation styles) + CSS-only approach — but bullets are rendered via JS widgets, not CSS.
   b. Pass the setting to `bulletDecorations(style)` as a parameter and include it in the MarkdownEditor dependency array so the editor recreates when it changes.
   
   Approach (b) is better since the widget's `toDOM()` needs to know which character to render.

2. For ordered list number styling, extend the existing bullet decoration or create a new extension. Since ordered lists already have `cmListNesting.ts` handling Tab/Shift+Tab, the number styling should be a separate concern (new file `cmOrderedListDecorations.ts` or extend `cmBulletDecorations.ts`).

3. For depth detection, count leading whitespace and divide by indent size (default 2 or 4 spaces). The indent size is already a setting (`editorIndentSize`).

4. All 8 themes use the same CSS variable names, so `var(--accent)` will work across all themes with proper contrast.

Please provide a detailed, step-by-step implementation plan covering all files that need changes.

---

## Assistant



I'll explore the codebase to understand the existing patterns and then design a detailed implementation plan.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*bullet*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*listSpacing*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*listNesting*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/SettingsModal*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/uiStore*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*Bullet*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*List*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/cm*.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmBulletDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmListSpacing.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmListNesting.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx"}`

---

## Assistant

Now let me look at how the MarkdownEditor component wires up extensions and how citation styles flow through.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/MarkdownEditor*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/App.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/App.css"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

Now let me check the App.tsx for how data attributes are set, and the CSS for existing bullet/list styles.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"data-source-style|data-example-style|setAttribute.*data-","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cm-bullet|cm-list|\\.cm-ordered|list-style|li::marker|marker","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":3}`

---

## Assistant

Now let me check the preview mode styling for lists and how the App.tsx wires the data attributes.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"sourceStyle|exampleStyle|mathStyle|attentionStyle","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","output_mode":"content","-C":3}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"preview.*ul|preview.*ol|preview.*li|\\.preview-body|\\.note-preview","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":3}`

---

## Assistant

Now let me check one more thing -- the existing tests for bullet decorations to understand testing patterns.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/cmBulletDecorations.test*"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cm-ordered|ordered.*list|\\.cm-number","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content"}`

---

## Assistant

Let me also check how the `cmCheckboxDecorations.ts` works as another widget pattern example, and look at the segment state cache to understand how settings flow through segment switching.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCheckboxDecorations.ts","limit":40}`

---

## Assistant

I have enough information now to design the complete implementation plan. Let me synthesize everything.

---

## Implementation Plan: Enhanced List Styling for CodeMirror 6 + Preview Mode

### Overview

This plan covers five areas: (1) accent-colored list markers in edit and preview modes, (2) depth-aware bullet shapes with configurable presets, (3) styled ordered list number widgets, (4) preview mode list marker styling, and (5) Settings integration for the bullet style preference.

### Architecture Decision: How to Pass the Bullet Style to CodeMirror

The bullet style setting determines which Unicode character to render inside `BulletWidget.toDOM()`. Since widgets are JavaScript objects (not CSS-controlled), a CSS data-attribute approach is insufficient. The setting must be passed as a parameter to `bulletDecorations(style)`, and the `MarkdownEditor` component must include this setting in its dependency array so the editor recreates when the preset changes. This follows the same pattern as `editorIndentSize`, `lineWrapping`, `spellCheck`, etc., which are all in the dependency array at line 222 of `MarkdownEditor.tsx`.

---

### Step 1: Add BulletStyle type and options to uiStore

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`**

Add the following near the existing `SourceStyle` type (around line 10):

```typescript
export type BulletStyle = "classic" | "dash" | "arrow" | "minimal";
export const BULLET_STYLE_OPTIONS: { value: BulletStyle; label: string }[] = [
  { value: "classic", label: "Classic (● ○ ▪)" },
  { value: "dash", label: "Dash (— – ·)" },
  { value: "arrow", label: "Arrow (▸ ▹ ▪)" },
  { value: "minimal", label: "Minimal (• • •)" },
];
```

Add the bullet presets map (used by the CM extension):

```typescript
export const BULLET_PRESETS: Record<BulletStyle, [string, string, string]> = {
  classic: ["●", "○", "▪"],
  dash:    ["—", "–", "·"],
  arrow:   ["▸", "▹", "▪"],
  minimal: ["•", "•", "•"],
};
```

Add to `PersistedPrefs` interface (around line 175):
```typescript
bulletStyle?: BulletStyle;
```

Add to `UIState` interface (around line 254):
```typescript
bulletStyle: BulletStyle;
```

Add setter to `UIState`:
```typescript
setBulletStyle: (v: BulletStyle) => void;
```

Initialize in the store creation (around line 487):
```typescript
bulletStyle: storedPrefs.bulletStyle ?? "classic",
```

Add setter implementation (following the `setAttentionStyle` pattern around line 737):
```typescript
setBulletStyle: (v: BulletStyle) => {
  set({ bulletStyle: v });
  savePrefs({ bulletStyle: v });
},
```

---

### Step 2: Rewrite cmBulletDecorations.ts for depth-aware, accent-colored bullets

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmBulletDecorations.ts`**

Key changes:

1. **Accept `bulletStyle` parameter** so the extension factory becomes `bulletDecorations(style: BulletStyle)`.

2. **Compute nesting depth** from leading whitespace. The depth calculation uses `Math.floor(indent.length / indentSize)` where `indentSize` is detected from the document (default 2 or 4). Since `editorIndentSize` is already available as a CM `indentUnit` facet, but it is simpler to pass it as a second parameter: `bulletDecorations(style: BulletStyle, indentSize: number)`.

3. **BulletWidget becomes depth-aware**. Instead of a singleton, create widgets per depth. The `BulletWidget` class stores the character to display and uses `var(--accent)` color instead of `var(--text-muted)`. The `eq()` method compares the stored character.

4. **ScanBullets returns depth info**. The existing `BulletMatch` interface gains a `depth: number` field.

Revised structure:

```typescript
import { BULLET_PRESETS, type BulletStyle } from "../../stores/uiStore";

const BULLET_RE = /^(\s*)([-*+]) /;

class BulletWidget extends WidgetType {
  constructor(private char: string) { super(); }
  eq(other: BulletWidget): boolean { return this.char === other.char; }
  toDOM(): HTMLElement {
    const span = document.createElement("span");
    span.textContent = this.char;
    span.className = "cm-bullet-widget";
    span.setAttribute("aria-hidden", "true");
    return span;
  }
  ignoreEvent(): boolean { return false; }
}

// Cache widgets per character to avoid re-creating DOM nodes
const widgetCache = new Map<string, BulletWidget>();
function getWidget(char: string): BulletWidget {
  let w = widgetCache.get(char);
  if (!w) { w = new BulletWidget(char); widgetCache.set(char, w); }
  return w;
}

interface BulletMatch {
  lineNumber: number;
  markerFrom: number;
  markerTo: number;
  depth: number;
}

function scanBullets(doc: Text, indentSize: number): BulletMatch[] {
  // Same loop but computes depth from indent length
}

function buildDecorations(doc: Text, cursorLine: number, preset: [string, string, string], indentSize: number): DecorationSet {
  // For each bullet match, pick preset[depth % 3]
  // Use getWidget(char) to create the replacement decoration
}

export function bulletDecorations(style: BulletStyle, indentSize: number): Extension {
  const preset = BULLET_PRESETS[style];
  // StateField that uses preset and indentSize in buildDecorations
}
```

---

### Step 3: Create cmOrderedListDecorations.ts for styled ordered numbers

**New file: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmOrderedListDecorations.ts`**

This follows the same pattern as `cmBulletDecorations.ts` but for ordered list markers (`1.`, `a.`, `i.`).

Key design:

1. **Regex**: `const ORDERED_RE = /^(\s*)(\d+|[a-z]+)\.\s/;` (already defined in `cmListNesting.ts` -- can import or duplicate).

2. **OrderedMarkerWidget**: Renders the marker text (e.g., "1.", "a.", "i.") in a span with class `cm-ordered-marker-widget`. Uses accent color and slightly bolder weight (`font-weight: 600`).

3. **Cursor-aware**: Skip decoration on the cursor line (same pattern as bullets).

4. **No depth-awareness needed** for the character itself (the nesting already cycles markers via `cmListNesting.ts`). The widget just renders the existing marker text with accent styling.

5. **Export**: `export function orderedListDecorations(): Extension`

Structure:

```typescript
const ORDERED_RE = /^(\s*)(\d+|[a-z]+)\. /;

class OrderedMarkerWidget extends WidgetType {
  constructor(private text: string) { super(); }
  eq(other: OrderedMarkerWidget): boolean { return this.text === other.text; }
  toDOM(): HTMLElement {
    const span = document.createElement("span");
    span.textContent = this.text;
    span.className = "cm-ordered-marker-widget";
    span.setAttribute("aria-hidden", "true");
    return span;
  }
}

// StateField scanning for ordered markers, cursor-aware
// Decoration.replace swaps "1." with styled "1." widget

export function orderedListDecorations(): Extension { ... }
```

---

### Step 4: Wire new extensions into MarkdownEditor.tsx

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx`**

1. Import the new types and extension:
```typescript
import { orderedListDecorations } from "./cmOrderedListDecorations";
```

2. Add `bulletStyle` to the component's store subscriptions (around line 116):
```typescript
const bulletStyle = useUIStore((s) => s.bulletStyle);
```

3. Change the `bulletDecorations()` call (line 146) to pass the style and indent size:
```typescript
bulletDecorations(bulletStyle, editorIndentSize),
```

4. Add `orderedListDecorations()` to the extensions array (after `bulletDecorations`):
```typescript
orderedListDecorations(),
```

5. Add `bulletStyle` to the dependency array (line 222):
```typescript
}, [notePath, effectiveTheme, uiZoom, editorFontFamily, editorFontSize, readOnly, raw, wsRoot, showLineNumbers, lineWrapping, spellCheck, editorIndentSize, bulletStyle]);
```

---

### Step 5: Update CSS for accent-colored markers (edit mode)

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`**

Replace the existing bullet widget style (around line 1765):

```css
/* Unordered list bullet widget — accent-colored */
.editor-body .cm-editor .cm-bullet-widget {
  font-size: 0.9em;
  color: var(--accent);
  font-weight: 600;
}

/* Ordered list marker widget — accent-colored, slightly bolder */
.editor-body .cm-editor .cm-ordered-marker-widget {
  color: var(--accent);
  font-weight: 600;
  font-size: 0.95em;
}
```

---

### Step 6: Update CSS for accent-colored markers (preview mode)

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`**

Add after the existing `.md-preview li` rule (around line 2831):

```css
/* Accent-colored list markers in preview mode */
.md-preview ul,
.md-preview ol {
  /* existing: margin, padding-left */
}
.md-preview li::marker {
  color: var(--accent);
  font-weight: 600;
}

/* Subtle left border on nested lists */
.md-preview ul ul,
.md-preview ol ol,
.md-preview ul ol,
.md-preview ol ul {
  border-left: 2px solid color-mix(in srgb, var(--accent) 25%, transparent);
  padding-left: 1.4em;
  margin-left: 0.2em;
}
```

---

### Step 7: Add bullet style dropdown to SettingsModal

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx`**

1. Import the new type and options:
```typescript
import { ..., BULLET_STYLE_OPTIONS } from "../../stores/uiStore";
import type { ..., BulletStyle } from "../../stores/uiStore";
```

2. Add store subscriptions inside the component (around line 71):
```typescript
const bulletStyle = useUIStore((s) => s.bulletStyle);
const setBulletStyle = useUIStore((s) => s.setBulletStyle);
```

3. Add a new row in the Editor Font section (after the "Attention citations" row, around line 293):
```tsx
<div className="settings-row">
  <span className="settings-label">List bullet style</span>
  <div className="settings-control">
    <select
      value={bulletStyle}
      onChange={(e) => setBulletStyle(e.target.value as BulletStyle)}
    >
      {BULLET_STYLE_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
</div>
```

---

### Step 8: Tests

**New file: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmBulletDecorations.test.ts`**

Test the exported `scanBullets` function (export it for testing, following the `scanCheckboxes` pattern from `cmCheckboxDecorations.ts`):

- Flat list: depth 0 for all items
- Nested list (2-space indent): depths 0, 1, 2
- Nested list (4-space indent): correct depths
- Mixed bullets (`-`, `*`, `+`): all detected
- Non-list lines skipped

**New file: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmOrderedListDecorations.test.ts`**

Test the exported `scanOrderedMarkers` function:

- Detects `1. item`, `a. item`, `i. item`
- Returns correct marker text
- Handles nesting depths
- Skips non-ordered lines

**Update: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.test.ts`**

Add tests for `setBulletStyle`:
- Default value is "classic"
- Setting persists to localStorage
- Getter returns updated value

---

### Step 9: Documentation updates

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/docs/CHANGELOG.md`**

Add entry for the new feature.

---

### Summary of Changes by File

| File | Change |
|------|--------|
| `stores/uiStore.ts` | Add `BulletStyle` type, `BULLET_STYLE_OPTIONS`, `BULLET_PRESETS`, state field, setter, persistence |
| `Editor/cmBulletDecorations.ts` | Rewrite: accept `(style, indentSize)` params, depth-aware widget with accent color, export `scanBullets` |
| `Editor/cmOrderedListDecorations.ts` | **New**: Styled ordered marker widget extension |
| `Editor/MarkdownEditor.tsx` | Wire `bulletStyle` + `orderedListDecorations`, add to deps array |
| `Settings/SettingsModal.tsx` | Add "List bullet style" dropdown |
| `App.css` | Update `.cm-bullet-widget` to accent color; add `.cm-ordered-marker-widget`; add `.md-preview li::marker` accent styling |
| `Editor/cmBulletDecorations.test.ts` | **New**: Unit tests for scan + depth |
| `Editor/cmOrderedListDecorations.test.ts` | **New**: Unit tests for ordered marker scan |
| `stores/uiStore.test.ts` | Add tests for bulletStyle |
| `docs/CHANGELOG.md` | Changelog entry |

### Edge Cases and Risks

1. **Indent size mismatch**: If `editorIndentSize` is 4 but a document uses 2-space indents, depth calculation will be wrong. Mitigation: use `Math.floor` so partial indents get clamped down. This matches existing behavior in `cmListNesting.ts` (line 121: `Math.floor(currentIndent.length / INDENT.length)`).

2. **Widget caching**: The `BulletWidget` instances are cached per character. When the user changes the bullet preset, the CM editor recreates (it is in the dependency array), so stale widgets are not a concern.

3. **Performance**: Scanning all lines on every doc/selection change is the existing pattern. For large documents this could be slow, but `cmBulletDecorations.ts` already does this and it has not been a problem. The ordered list extension adds a second scan, but the regex is fast.

4. **CM `.cm-line` constraint**: The plan does not add any margin or padding to `.cm-line` elements. All visual changes are via `Decoration.replace` (inline widget swap) and `::marker` pseudo-element styling.

5. **Segment switching**: The `bulletStyle` is in `PersistedPrefs` which is global (not per-segment), consistent with how all other editor preferences work. The segment state cache (`segmentStateCache.ts`) does not need changes since it snapshots store state and the UI store is global.

---

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmBulletDecorations.ts` - Core rewrite: add depth-awareness, accent color, configurable preset parameter
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts` - Add BulletStyle type, BULLET_PRESETS constant, state field, setter, and persistence
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx` - Wire bulletStyle and orderedListDecorations into the CM extension array and dependency list
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` - CSS for accent-colored markers in both edit mode widgets and preview mode li::marker
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx` - Add bullet style dropdown following existing citation style pattern

---

