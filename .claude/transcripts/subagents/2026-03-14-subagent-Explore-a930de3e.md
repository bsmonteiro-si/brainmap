# 2026-03-14 — Subagent Transcript: Explore

**Date:** 2026-03-14 14:38:36
**Agent:** Explore
**Agent ID:** a930de3ef57063fe7
**Parent Session:** 841be1de-91b7-4999-9f1c-958403142e6a

---

## User

Explore the CodeMirror callout implementation in the BrainMap desktop app. I need to understand how callouts are rendered in the editor (NOT preview) view, specifically looking for:

1. Any CodeMirror extensions/plugins that handle callout rendering (decorations, widgets, etc.)
2. How the callout blocks are visually styled in the editor
3. Any CSS that might cause visual offset between where elements appear and where they are clickable

Focus on files in `crates/app/src-tauri/src` and `crates/app/src/` directories. Look for files related to callouts, CodeMirror extensions, and editor decorations.

Be very thorough - search for "callout", "decoration", "widget", "ViewPlugin", "StateField", and related CodeMirror terms.

---

## Assistant

I'll conduct a thorough exploration of the CodeMirror callout implementation in the BrainMap desktop app, searching for rendering logic, extensions, and styling.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -type f \\( -name \"*.ts\" -o -name \"*.tsx\" -o -name \"*.css\" -o -name \"*.rs\" \\) | head -50"}`

---

## Assistant

Let me narrow my search to the source directory without node_modules:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.{ts,tsx,css}"}`

---

## Assistant

Excellent! Now let me search for callout-related files and read them systematically:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts"}`

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkCalloutMerge.ts"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"callout|decoration|widget|ViewPlugin|StateField","type":"tsx"}`

---

## Assistant

Let me search for CodeMirror extension files and CSS related to callouts:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"callout|decoration|widget|ViewPlugin|StateField","type":"ts","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.css"}`

---

## Assistant

Now let me read the related files and CSS:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmListSpacing.ts"}`

---

## Assistant

Let me read the test file and check for CSS styling issues:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.test.ts"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cm-callout|callout-widget|callout-closing|callout-color","type":"css","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

Let me read the App.css file in sections:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1,"limit":200}`

---

## Assistant

Let me search for specific callout-related CSS:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"cm-callout\\|cm-list-line\\|cm-closing-hidden\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -50"}`

---

## Assistant

Now let me read that section of the CSS:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1055,"limit":50}`

---

## Assistant

Now let me check the EditorPanel to see the overall structure:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx","offset":1,"limit":150}`

---

## Assistant

Let me also check the cmFormatting file to see how callouts are inserted:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts"}`

---

## Assistant

Let me check the recent commits and git log to see if there were recent changes to callout handling:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"git log --oneline -20 -- \"crates/app/src/components/Editor/cmCalloutDecorations.ts\" \"crates/app/src/components/Editor/calloutPreprocess.ts\" \"crates/app/src/App.css\""}`

---

## Assistant

Let me check that recent commit to understand the StateField change:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"git show 7c8fbd3 --stat"}`

---

## Assistant

Perfect! Now let me look at the commit before that to see what the ViewPlugin implementation looked like:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"git show d161eb9:crates/app/src/components/Editor/cmCalloutDecorations.ts | head -100"}`

---

## Assistant

Perfect! Now let me create a comprehensive summary by checking the EditorToolbar file to see how the callout picker is implemented:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorToolbar.tsx","offset":1,"limit":200}`

---

## Assistant

Excellent! Now I have enough information. Let me compile a comprehensive report:

## CodeMirror Callout Implementation Exploration Report

I've conducted a thorough exploration of the BrainMap desktop app's CodeMirror callout rendering system. Here are my findings:

### 1. CodeMirror Extension Architecture

The callout system uses **StateField-based decorations** (as of commit 7c8fbd3, the most recent change):

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts`

**Key Architecture:**
- Uses `StateField.define()` to create `calloutField` that participates in CodeMirror's initial render pass
- This is critical because **StateField decorations participate in the height map calculation**, unlike ViewPlugin decorations which are applied after the initial DOM render
- The field maintains `{ ranges, cursorLine, decos }` where `decos` is the decoration set
- Provides decorations via `EditorView.decorations.from(f, (v) => v.decos)`

**Why StateField over ViewPlugin:**
According to commit 7c8fbd3, the conversion from ViewPlugin to StateField was made because:
- ViewPlugin decorations apply *after* CodeMirror's initial DOM render
- This caused **stale height maps** and **click-to-position misalignment** on callout blocks
- StateField decorations are part of the initial render, keeping height maps in sync with displayed content

### 2. Scanner Function: `scanCallouts()`

The core scanning logic identifies callout blocks:

```typescript
- Pattern: `[!TYPE] TITLE {` on header line
- Tracks line positions: headerFrom, headerTo, closingLineFrom, closingLineTo
- Respects fenced code blocks (```, ~~~) — callouts inside fences are skipped
- Returns: CalloutRange[] with type, title, position info, and closed status
- Handles unclosed callouts (extends to document end)
```

### 3. Decoration Building: `buildDecorations()`

Three types of decorations are applied:

**A) Background & Border (Line Decorations)**
```typescript
headerBg = `background: color-mix(in srgb, ${color} 12%, transparent); 
           border-left: 3px solid ${color}; 
           padding-left: 8px;`
bodyBg = `background: color-mix(in srgb, ${color} 6%, transparent); 
         border-left: 3px solid ${color}; 
         padding-left: 8px;`
```

**B) Inline Header Widget (Replace Decoration)**
- Class: `CalloutHeaderWidget extends WidgetType`
- Creates HTML with:
  - SVG icon (14x14) built from Lucide paths
  - Bold, uppercase label (e.g., "AI ANSWER")
  - Optional title text with em-dash separator
- Uses `Decoration.replace()` to replace raw syntax with the widget
- Widget is **cursor-aware**: only shows when cursor is NOT on the header line

**C) Closing Line Collapse**
- Class: `.cm-callout-closing-hidden`
- Applied via `Decoration.line({ class: "cm-callout-closing-hidden" })`
- Only applied when cursor is not on the closing `}` line

### 4. Cursor-Aware Rendering

The `buildDecorations()` function receives `cursorLine`:
```typescript
const cursorLine = tr.state.doc.lineAt(tr.state.selection.main.head).number;

// For header line:
if (cursorLine === headerLineNum) {
  // Show raw syntax only, no widget
  builder.add(r.headerFrom, r.headerFrom, 
    Decoration.line({ attributes: { style: headerBg } }));
} else {
  // Show widget
  builder.add(r.headerFrom, r.headerFrom, 
    Decoration.line({ attributes: { style: headerBg } }));
  builder.add(r.headerFrom, r.headerTo, 
    Decoration.replace({ widget: new CalloutHeaderWidget(...) }));
}

// For closing line:
if (r.closed) {
  if (cursorLine !== closingLineNum) {
    builder.add(r.closingLineFrom, r.closingLineFrom, 
      Decoration.line({ class: "cm-callout-closing-hidden" }));
  } else {
    // Show raw } when cursor on closing line
  }
}
```

### 5. CSS Styling

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

**Callout Widget Styles (via baseTheme):**
```css
.cm-callout-widget-header {
  display: inline-flex;
  alignItems: center;
  gap: 6px;
  padding: 2px 8px;
  borderRadius: 4px;
  fontSize: 0.9em;
  background: color-mix(in srgb, var(--callout-color) 12%, transparent);
  /* vertical-align: middle prevents baseline drift */
  vertical-align: middle;
}

.cm-callout-widget-label {
  fontWeight: 600;
  textTransform: uppercase;
  fontSize: 0.85em;
  letterSpacing: 0.03em;
}

.cm-callout-widget-title {
  fontWeight: 400;
  opacity: 0.85;
}

.cm-callout-widget-title::before {
  content: "—";
  margin: 0 4px;
  opacity: 0.4;
}
```

**Closing Line Collapse:**
```css
.cm-callout-closing-hidden {
  font-size: 0;
  line-height: 0;
  height: 1px;
  overflow: hidden;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
  background: none !important;
}
```

**List Line Spacing (cmListSpacing.ts):**
```css
.editor-body .cm-editor .cm-list-line {
  margin-bottom: 0.12em;
}
```

### 6. Fold Service

Callouts support code folding via `foldService`:
- Recognizes header line matching `CALLOUT_BRACE_START`
- Scans forward for closing `}`, respecting fenced code blocks
- Returns fold range: `{ from: line.to, to: closingLine.to }`
- Integrated with `codeFolding()` and `foldKeymap`

### 7. Preview & Preprocessing Pipeline

**calloutPreprocess.ts:**
- Converts brace syntax `[!type] { ... }` to blockquote syntax `> [!type] ... > ...`
- Applied before markdown parsing
- Handles fenced code blocks (skips conversion inside fences)

**remarkCalloutMerge.ts:**
- Remark plugin that merges consecutive blockquotes starting with `[!type]`
- Allows paragraph breaks (blank lines) inside callouts without splitting

### 8. Potential Visual Offset Issues

Based on the code, here are potential sources of click-to-position misalignment:

**A) Widget Replacement (Most Likely)**
- `Decoration.replace()` replaces the raw `[!type] title {` text with the widget
- The widget is inline-flex with padding/margin, which may not precisely match the original text width
- This can cause the click position to shift when calculating text offset

**B) Line Height Mismatch**
- Widget uses `vertical-align: middle` to align with text
- If the widget's height differs from the line's default height, click coordinates may be off

**C) Closing Line Collapse Edge Case**
- `.cm-callout-closing-hidden` uses `height: 1px` and `overflow: hidden`
- If cursor moves to the closing line, it's un-hidden, potentially causing layout shift

**D) CSS Zoom Interaction**
- MarkdownEditor.tsx patches `offsetWidth`/`offsetHeight` to detect CSS zoom via `getScale()`
- This compensates for app-wide zoom (Cmd+`+`) but the patch may not account for all widget rendering scenarios

**E) StateField Update Condition**
```typescript
update(value, tr) {
  const cursorLine = tr.state.doc.lineAt(tr.state.selection.main.head).number;
  const docChanged = tr.docChanged;
  const lineChanged = cursorLine !== value.cursorLine;
  if (!docChanged && !lineChanged) return value; // No rebuild
  // ... rebuild decorations
}
```
If the cursor moves but the decoration set doesn't update correctly, the widget may remain in "hidden" state while the cursor is actually on that line.

### 9. Integration Points

**In MarkdownEditor.tsx:**
```typescript
extensions: [
  markdown(),
  calloutDecorations(),  // Registered here
  listSpacing(),
  linkNavigation(),
  copyReferenceMenu(),
  ...
]
```

**In EditorToolbar.tsx:**
- Callout picker dropdown (☰ button) calls `insertCallout(view, type)`
- Triggers `Decoration.replace()` on header line when widget is rendered

### File Locations Summary

- **Extension definition:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts`
- **Type definitions:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutTypes.ts`
- **Preprocessing:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutPreprocess.ts`
- **Remark plugin:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkCalloutMerge.ts`
- **Formatting API:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts` (insertCallout function)
- **CSS styling:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` (lines 1061-1073)
- **Editor integration:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx`
- **UI toolbar:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorToolbar.tsx`

---

