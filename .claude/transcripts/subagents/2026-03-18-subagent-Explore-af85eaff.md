# 2026-03-18 — Subagent Transcript: Explore

**Date:** 2026-03-18 18:13:29
**Agent:** Explore
**Agent ID:** af85eaffae872f722
**Parent Session:** f804a05c-cfcf-4a1a-bc3e-b0c85c825cb1

---

## User

I need to understand how inline source citations (`[!source "..."]`) get styled in CodeMirror edit mode with the "SOURCE" badge widget. This is NOT about the markdown preview — it's about the CodeMirror editor decorations that make `[!source ...]` look pretty while editing.

Search for:
1. Any CodeMirror decoration/widget that handles `[!source` in edit mode — look for ViewPlugin, StateField, Decoration, WidgetType related to inline source
2. The "citation style" setting in the Settings modal — how does it relate to inline source display?
3. Any CSS classes like `cm-inline-source` or similar

Check these files thoroughly:
- All files in `crates/app/src/components/Editor/` matching patterns like `*source*`, `*citation*`, `*inline*`
- `crates/app/src/components/Settings/SettingsModal.tsx`
- `crates/app/src/stores/uiStore.ts` for citation-related settings
- `crates/app/src/App.css` for `cm-inline-source` or `cm-source` styles

Be very thorough — this is about CodeMirror 6 decorations in the editor, not remark/preview.

---

## Assistant

I'll conduct a thorough search for how inline source citations are styled in CodeMirror edit mode, including decoration/widget implementations and citation settings.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/**/*.{ts,tsx}"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*source*.{ts,tsx}"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*citation*.{ts,tsx}"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\[!source","type":"ts"}`

---

## Assistant

Good start. I found `remarkInlineSource.ts` which is likely for preview. Let me now search more specifically for CodeMirror decorations and citation settings:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"citation|Citation","type":"ts","head_limit":50}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cm-inline-source|cm-source|SourceWidget|InlineSource","type":"ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

Perfect! Now let me look at the CodeMirror markdown decorations file and the CSS:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkInlineSource.ts"}`

---

## Assistant

Perfect! Now let me search for CSS classes related to inline source in App.css:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"cm-source\\|inline-source\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1000,"limit":500}`

---

## Assistant

Excellent! Now let me search for where the `data-source-style` attribute is set on the HTML element:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"data-source-style\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.tsx\" --include=\"*.ts\""}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","limit":150}`

---

## Assistant

Perfect! Let me get the rest of App.tsx to see where the data-source-style attribute is set:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 5 -B 5 \"data-source-style\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

Perfect! Now I have all the information needed. Let me compile a comprehensive report of how inline source citations are styled in CodeMirror edit mode:

## Summary: Inline Source Citation Styling in CodeMirror Edit Mode

I've completed a thorough analysis of how `[!source ...]` citations are styled in the CodeMirror editor. Here's the complete system:

### 1. **CodeMirror Decoration System** (`cmMarkdownDecorations.ts`)

The editor uses a **mark-based decoration approach** (lines 246–252, 399–429):

```typescript
const sourceTagMark = Decoration.mark({ class: "cm-source-tag" });
const sourceContentMark = Decoration.mark({ class: "cm-source-content" });
const sourceBracketMark = Decoration.mark({ class: "cm-source-bracket" });
```

**How it works:**
- Uses regex `/\[!source\s+([^\]]+)\]/g` to find inline sources
- Splits each match into three parts with separate mark decorations:
  1. `[!source ` → `cm-source-tag` class
  2. Content → `cm-source-content` class  
  3. `]` → `cm-source-bracket` class
- **Cursor-aware**: Skips decoration when cursor is inside the citation (line 414)
- **Context-aware**: Skips if inside fenced code blocks, inline code blocks, or regular links (lines 403–419)

### 2. **Settings Configuration** (`uiStore.ts`)

The setting is defined in the UIStore (line 10):

```typescript
export type SourceStyle = "underline" | "pill" | "icon" | "quotes";
export const SOURCE_STYLE_OPTIONS: { value: SourceStyle; label: string }[] = [
  { value: "underline", label: "Underline + label" },
  { value: "pill", label: "Pill badge" },
  { value: "icon", label: "Book icon" },
  { value: "quotes", label: "Quotation marks" },
];
```

- Persisted to `brainmap:uiPrefs` localStorage (line 142)
- Defaults to `"pill"` (line 448)

### 3. **Settings Modal UI** (`SettingsModal.tsx`)

Lines 235–245 show the user-facing control:

```jsx
<div className="settings-row">
  <span className="settings-label">Source citations</span>
  <div className="settings-control">
    <select value={sourceStyle} onChange={(e) => setSourceStyle(e.target.value as SourceStyle)}>
      {SOURCE_STYLE_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
</div>
```

### 4. **Dynamic Attribute Binding** (`App.tsx`)

The setting is applied to the DOM via a useEffect hook:

```typescript
useEffect(() => {
  document.documentElement.setAttribute("data-source-style", sourceStyle);
}, [sourceStyle]);
```

This sets `<html data-source-style="pill">` (or other values).

### 5. **CSS Styling** (`App.css`, lines 1228–1334)

Four complete style sets, all **scoped by `[data-source-style]` on `<html>`**:

#### **Style 1: "underline"** (lines 1234–1254)
- `cm-source-tag` → hides text, shows "source" label via `::after` (0.7rem uppercase, accent color, 60% opacity)
- `cm-source-content` → subtle underline with 30% accent opacity
- `cm-source-bracket` → hidden

#### **Style 2: "pill"** (lines 1257–1279)
- `cm-source-tag::after` → "source" in rounded badge with accent background (15% opacity) + padding
- Font: 0.65rem, bold, uppercase
- `cm-source-content` → plain text, secondary color
- `cm-source-bracket` → hidden

#### **Style 3: "icon"** (lines 1282–1298)
- `cm-source-tag::after` → book emoji `📖` (0.85rem)
- `cm-source-content` → italic, secondary color
- `cm-source-bracket` → hidden

#### **Style 4: "quotes"** (lines 1301–1333)
- `cm-source-tag::after` → left double-quote `"` (1.1rem, accent, 70% opacity)
- `cm-source-bracket::before` → right double-quote `"` (1.1rem, accent, 70% opacity)
- `cm-source-bracket::after` → "src" superscript label (0.6rem, accent, 50% opacity)
- `cm-source-content` → italic, secondary color

### 6. **Preview Mode Styling** (lines 1336–1350)

The `remarkInlineSource.ts` plugin transforms citations for preview render:

```html
<span class="inline-source">
  <span class="inline-source-tag">source</span>
  {content}
</span>
```

CSS applies accent underline + italic styling (independent of edit-mode style setting).

---

### Key Design Points

1. **No widget replacement**: Uses marks only, preserving CodeMirror's hit-testing for editing/selecting
2. **CSS-driven styling**: All visual differences handled via CSS classes + `[data-source-style]` scope selector
3. **Cursor-aware**: Decorations removed when cursor touches the citation for easy editing
4. **Skip rules**: Won't decorate inside code blocks or regular links
5. **Unified persistence**: Setting stored in UIStore localStorage, applied at app root level

### File Locations

- **Edit-mode decorations**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts`
- **Settings definition**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`
- **Settings UI**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx`
- **CSS styles**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` (lines 1228–1350)
- **App-level binding**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx`
- **Preview plugin**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkInlineSource.ts`

---

