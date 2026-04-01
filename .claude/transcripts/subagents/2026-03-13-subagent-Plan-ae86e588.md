# 2026-03-13 — Subagent Transcript: Plan

**Date:** 2026-03-13 14:47:19
**Agent:** Plan
**Agent ID:** ae86e588568605724
**Parent Session:** c02fcf0e-8ccb-4809-9cea-1b2a5005ee83

---

## User

Design an implementation plan for adding custom callout blocks to the BrainMap desktop app. The user wants 4 initial types: `[!ai-answer]`, `[!source]`, `[!question]`, `[!key-insight]`. They should also appear as buttons in the EditorToolbar.

## Context

**Syntax:** Obsidian-style callout blockquotes:
```markdown
> [!ai-answer]
> AI-generated content here

> [!source] Pearl, J. (2000). Causality
> Citation details here

> [!question] Does X cause Y?
> Discussion here

> [!key-insight]
> Important takeaway here
```

**Existing infrastructure:**

### EditorToolbar (`crates/app/src/components/Editor/EditorToolbar.tsx`)
- 14 buttons grouped by separators
- Each calls a formatting function from cmFormatting.ts via `onMouseDown`
- Accepts `editorView: EditorView | null`
- CSS class `.editor-toolbar-btn`

### cmFormatting.ts (`crates/app/src/components/Editor/cmFormatting.ts`)
- `toggleLinePrefix(view, prefix)` — adds/removes line prefixes like `> ` for blockquotes
- `insertAtCursor(view, text)` — inserts text at cursor
- `formattingKeymap` — exports keyboard shortcuts
- All functions dispatch to `view.dispatch()` with calculated offsets

### MarkdownPreview (`crates/app/src/components/Editor/MarkdownPreview.tsx`)
- Uses `react-markdown` v10.1.0 + `remark-gfm`
- Custom `components` prop overrides for links
- Wraps in `.md-preview` div

### MarkdownEditor (`crates/app/src/components/Editor/MarkdownEditor.tsx`)
- CodeMirror 6 with extensions array
- Custom extensions: `cmLinkNavigation.ts` (pattern: export function returning Extension)
- Syntax highlighting via `syntaxHighlighting(buildMarkdownHighlight(isDark))`

### Color system (`crates/app/src/components/GraphView/graphStyles.ts`)
- `getNodeColor(type)` returns hex colors
- question already has purple (#9b59b6)

### Icon system
- Lucide React icons used throughout
- `fileTreeIcons.tsx` maps note types to Lucide icons

### CSS (`crates/app/src/App.css`)
- Existing blockquote style: accent left border, 6% tinted bg, rounded right corners
- CSS variables for theming (--accent, --bg-primary, etc.)
- Dark mode via `[data-theme="dark"]`

### Existing blockquote style in App.css (lines 1327-1335):
```css
.md-preview blockquote {
  border-left: 3px solid var(--accent);
  margin: 0 0 1em;
  padding: 8px 12px 8px 16px;
  color: var(--text-secondary);
  background: color-mix(in srgb, var(--accent) 6%, transparent);
  border-radius: 0 4px 4px 0;
}
```

## Requirements

1. **Preview rendering**: Detect `[!type]` in blockquotes and render as styled callout cards with icon, color, optional title
2. **Editor toolbar**: Add 4 new buttons (one per callout type) to EditorToolbar with appropriate icons
3. **Formatting function**: `insertCallout(view, type)` in cmFormatting.ts that inserts the callout template
4. **Editor decorations (optional but nice)**: CodeMirror extension to visually style callout blocks in edit mode
5. **CSS**: Callout-specific styles with per-type colors and icons

## Design constraints
- Syntax must be valid markdown (graceful degradation as blockquotes)
- Colors should complement existing palette
- Must work in both light and dark themes
- Keep it simple — no over-engineering

Please provide a detailed implementation plan with specific files to modify, what changes in each, and the order of implementation.

---

## Assistant



I'll explore the existing codebase to understand the current patterns and infrastructure before designing the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorToolbar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts"}`

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

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmLinkNavigation.ts"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"blockquote","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":3}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/fileTreeIcons.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Files/fileTreeIcons.tsx"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"getNodeColor","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts","output_mode":"content","-C":2}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/","description":"List Editor component files"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts","limit":25}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.test.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.test.ts"}`

---

## Assistant

Now let me check how react-markdown handles blockquotes and what the package versions are.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && cat package.json | grep -E \"react-markdown|remark|rehype\"","description":"Check react-markdown and plugin versions"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

Now let me check the existing toolbar CSS styles and the editor-toolbar-btn pattern to understand how buttons look.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"editor-toolbar","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":2}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"editor-toolbar-sep","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":3}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && cat package.json | grep -E \"lucide\"","description":"Check if lucide-react is installed"}`

---

## Assistant

I now have a thorough understanding of the codebase. Here is the implementation plan.

---

## Implementation Plan: Custom Callout Blocks

### Overview

This feature adds 4 custom callout block types (`[!ai-answer]`, `[!source]`, `[!question]`, `[!key-insight]`) to the BrainMap desktop app. The implementation touches 3 existing files and creates 2 new files, following established patterns closely.

### Callout Type Definitions

A shared configuration map for the 4 callout types, to be defined in a new file `crates/app/src/components/Editor/calloutTypes.ts`:

| Type | Color | Lucide Icon | Label |
|------|-------|-------------|-------|
| `ai-answer` | `#4a9eff` (accent blue, matches `concept`) | `Bot` | AI Answer |
| `source` | `#f39c12` (amber, matches `book-note`) | `BookOpen` | Source |
| `question` | `#9b59b6` (purple, matches `question` note type) | `HelpCircle` | Question |
| `key-insight` | `#27ae60` (green, matches `evidence`) | `Lightbulb` | Key Insight |

Each entry in the map: `{ type: string, color: string, icon: LucideIcon, label: string, toolbarIcon: string }`.

The `toolbarIcon` field stores a short emoji/character for the toolbar button label (e.g., "🤖", "📖", "❓", "💡") -- alternatively, these buttons could render the actual Lucide icon component inline. Given the existing toolbar uses text labels (B, I, S, H1, etc.), using small emoji characters is more consistent. However, since Lucide is already a dependency, rendering small SVG icons is also viable and would look more polished. I recommend rendering Lucide icons in the toolbar buttons via a `ReactNode` label instead of plain strings, which requires a small change to the `ToolbarButton` interface (changing `label: string` to `label: string | ReactNode`).

### Step 1: Create `calloutTypes.ts` (new file)

**Path:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutTypes.ts`

Export a `CALLOUT_TYPES` record mapping type string to `{ color, label, iconName }`. Keep this as plain data (no React imports) so it can be consumed by both the preview renderer and the CSS/toolbar. Example structure:

```ts
export interface CalloutTypeDef {
  color: string;
  label: string;
  iconName: string; // Lucide icon name for dynamic lookup
}

export const CALLOUT_TYPES: Record<string, CalloutTypeDef> = {
  "ai-answer": { color: "#4a9eff", label: "AI Answer", iconName: "Bot" },
  "source":    { color: "#f39c12", label: "Source",     iconName: "BookOpen" },
  "question":  { color: "#9b59b6", label: "Question",   iconName: "HelpCircle" },
  "key-insight": { color: "#27ae60", label: "Key Insight", iconName: "Lightbulb" },
};

// Regex to detect callout syntax: > [!type] optional title
export const CALLOUT_RE = /^\[!(\w[\w-]*)\]\s*(.*)?$/;
```

### Step 2: Add `insertCallout` to `cmFormatting.ts`

**Path:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts`

Add a new exported function following the same pattern as `insertAtCursor`:

```ts
export function insertCallout(view: EditorView, type: string): boolean {
  const { state } = view;
  const range = state.selection.main;
  const selectedText = range.empty ? "" : state.sliceDoc(range.from, range.to);
  
  // Build the callout block
  const header = `> [!${type}]`;
  const body = selectedText
    ? selectedText.split("\n").map(line => `> ${line}`).join("\n")
    : "> ";
  const insert = `${header}\n${body}`;
  
  // Calculate cursor position: end of the body line content area
  const cursorPos = range.from + insert.length;
  
  view.dispatch({
    changes: { from: range.from, to: range.to, insert },
    selection: EditorSelection.cursor(cursorPos),
  });
  view.focus();
  return true;
}
```

Key behaviors:
- If text is selected, wraps each line with `> ` prefix under the callout header
- If no selection, inserts a template with cursor on the content line after `> `
- Follows the existing pattern of `insertAtCursor` and `toggleLinePrefix`

### Step 3: Add callout buttons to `EditorToolbar.tsx`

**Path:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorToolbar.tsx`

Changes:
1. Import `insertCallout` from `./cmFormatting`
2. Import Lucide icons: `Bot`, `BookOpen`, `HelpCircle`, `Lightbulb` from `lucide-react`
3. Change `ToolbarButton.label` type from `string` to `string | React.ReactNode` to support icon rendering
4. Add a new separator + 4 callout buttons after the existing HR button:

```ts
"sep",
{ label: <Bot size={14} />,         title: "AI Answer Callout",   action: (v) => insertCallout(v, "ai-answer") },
{ label: <BookOpen size={14} />,     title: "Source Callout",      action: (v) => insertCallout(v, "source") },
{ label: <HelpCircle size={14} />,   title: "Question Callout",    action: (v) => insertCallout(v, "question") },
{ label: <Lightbulb size={14} />,    title: "Key Insight Callout", action: (v) => insertCallout(v, "key-insight") },
```

The button key is `btn.title` (already unique), so no key conflict. The existing `className` logic only checks `btn.label === "B"` or `"I"` for special styling, so ReactNode labels will not accidentally match those string checks.

### Step 4: Add callout rendering to `MarkdownPreview.tsx`

**Path:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx`

This is the most involved step. `react-markdown` v10 renders `> [!type]` as a `<blockquote>` containing a `<p>` whose first text starts with `[!type]`. The strategy is to add a custom `blockquote` component override in the `components` prop.

Add to the `components` useMemo:

```tsx
blockquote: ({ children, ...props }) => {
  // Check if first child paragraph starts with [!type]
  const calloutInfo = extractCalloutFromChildren(children);
  if (!calloutInfo) {
    return <blockquote {...props}>{children}</blockquote>;
  }
  
  const { type, title, restChildren } = calloutInfo;
  const typeDef = CALLOUT_TYPES[type];
  if (!typeDef) {
    // Unknown callout type - render as plain blockquote
    return <blockquote {...props}>{children}</blockquote>;
  }
  
  const IconComponent = CALLOUT_ICON_MAP[typeDef.iconName];
  
  return (
    <div className={`callout callout--${type}`} style={{ borderLeftColor: typeDef.color }}>
      <div className="callout-header" style={{ color: typeDef.color }}>
        {IconComponent && <IconComponent size={16} />}
        <span className="callout-label">{title || typeDef.label}</span>
      </div>
      <div className="callout-body">{restChildren}</div>
    </div>
  );
},
```

The `extractCalloutFromChildren` helper function will:
1. Iterate through `children` (React elements)
2. Find the first `<p>` element
3. Check if its first text child matches `CALLOUT_RE` (`/^\[!(\w[\w-]*)\]\s*(.*)?$/`)
4. If matched, extract the type and optional title, and return the remaining children (the `<p>` with the `[!type]` prefix stripped, plus all subsequent children)
5. If not matched, return `null`

This function needs care with React children traversal. `React.Children.toArray` and checking `element.type === 'p'` on the first child, then inspecting its `props.children` for the text content. The implementation should handle both plain string children and mixed node arrays inside the first `<p>`.

A `CALLOUT_ICON_MAP` record maps icon names to Lucide components:
```ts
const CALLOUT_ICON_MAP: Record<string, LucideIcon> = {
  Bot, BookOpen, HelpCircle, Lightbulb,
};
```

### Step 5: Add callout CSS to `App.css`

**Path:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

Add after the existing `.md-preview blockquote` rules (around line 1335):

```css
/* ── Callout Blocks ── */
.md-preview .callout {
  border-left: 3px solid var(--accent);
  margin: 0 0 1em;
  padding: 0;
  border-radius: 0 6px 6px 0;
  overflow: hidden;
}

.md-preview .callout-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-weight: 600;
  font-size: 0.85em;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  background: color-mix(in srgb, currentColor 8%, transparent);
}

.md-preview .callout-body {
  padding: 8px 12px 8px 16px;
  color: var(--text-secondary);
}

.md-preview .callout-body p { margin: 0; }
.md-preview .callout-body p + p { margin-top: 0.5em; }

/* Per-type background tints */
.md-preview .callout--ai-answer  { background: color-mix(in srgb, #4a9eff 5%, transparent); }
.md-preview .callout--source     { background: color-mix(in srgb, #f39c12 5%, transparent); }
.md-preview .callout--question   { background: color-mix(in srgb, #9b59b6 5%, transparent); }
.md-preview .callout--key-insight { background: color-mix(in srgb, #27ae60 5%, transparent); }
```

Dark mode works automatically because these use `color-mix` with `transparent` (same pattern as the existing blockquote style). The `currentColor` in the header background picks up the per-type color from the inline `style={{ color: typeDef.color }}`.

### Step 6: Tests

#### 6a. `cmFormatting.test.ts` additions

Add a new `describe("insertCallout")` block following the existing test patterns:

- Inserts callout template at cursor (empty selection)
- Wraps selected text in callout block
- Wraps multi-line selection (each line prefixed with `> `)
- Cursor positioned at end of inserted content

#### 6b. `MarkdownPreview.test.tsx` additions

Add tests for callout rendering:

- Renders `[!ai-answer]` blockquote as a callout card with header and body
- Renders custom title from `[!source] Pearl, J. (2000)` syntax
- Falls back to plain blockquote for unknown `[!unknown]` type
- Falls back to plain blockquote for regular blockquotes without `[!type]`
- Renders callout icon and label

#### 6c. (Optional) `calloutTypes.test.ts`

Test `CALLOUT_RE` regex matching:
- Matches `[!ai-answer]` with no title
- Matches `[!source] Pearl, J. (2000). Causality` with title
- Does not match plain text
- Does not match `[!]` (empty type)

### Step 7: Documentation updates

Update `CLAUDE.md` current status section to mention callout blocks feature. Add to the Editor description something like: "Custom callout blocks: 4 types (ai-answer, source, question, key-insight) with Obsidian-style `[!type]` syntax, styled preview cards with icons/colors, toolbar buttons."

### Implementation Order

1. **calloutTypes.ts** -- shared definitions, no dependencies
2. **cmFormatting.ts** -- add `insertCallout`, pure function, testable immediately
3. **cmFormatting.test.ts** -- tests for `insertCallout`
4. **EditorToolbar.tsx** -- wire up buttons (requires step 2)
5. **App.css** -- callout styles
6. **MarkdownPreview.tsx** -- preview rendering with `extractCalloutFromChildren` helper (requires steps 1, 5)
7. **MarkdownPreview.test.tsx** -- preview rendering tests
8. **CLAUDE.md** -- documentation update

### Potential Challenges

1. **React children traversal in MarkdownPreview**: `react-markdown` v10's AST-to-React rendering means the first `<p>` child's content structure can vary (string, array of strings + elements, etc.). The `extractCalloutFromChildren` function must handle: (a) plain string `"[!type] title\ncontent"`, (b) mixed children like `["[!type] title", <br/>, "content"]`. Thorough testing of the children parsing is important.

2. **Toolbar width**: Adding 4 more buttons to the toolbar increases its width. The toolbar already has 14 items. The callout buttons use Lucide icons (SVG) which are compact at 14px, and the buttons are grouped after a separator, so overflow should not be an issue on typical screen widths. If it becomes a problem, a dropdown/popover could house the callout buttons, but that is over-engineering for now.

3. **CodeMirror edit-mode decorations**: The requirements mark this as "optional but nice." I recommend deferring this to a follow-up since it requires a ViewPlugin with line decorations, significantly more CodeMirror plumbing, and the preview mode already renders callouts beautifully. The edit-mode raw markdown (`> [!type]`) is perfectly readable and the syntax is valid blockquote markdown.

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts` - Add `insertCallout` function for editor insertion
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx` - Add blockquote component override with callout detection and rendering
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorToolbar.tsx` - Add 4 callout buttons with Lucide icons
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` - Callout card styles (header, body, per-type colors)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.test.ts` - Test pattern to follow for insertCallout tests

---

