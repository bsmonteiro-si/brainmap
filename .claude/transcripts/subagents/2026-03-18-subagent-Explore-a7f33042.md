# 2026-03-18 — Subagent Transcript: Explore

**Date:** 2026-03-18 15:02:16
**Agent:** Explore
**Agent ID:** a7f3304227c737d76
**Parent Session:** c161688e-735c-4623-a175-2eddaf2f5aae

---

## User

I need to understand how to customize CodeMirror 6's autocomplete popup rendering. Explore:

1. In `node_modules/@codemirror/autocomplete` - look at the types/API for:
   - `autocompletion()` config options (especially `addToOptions`, `icons`, `optionClass`)
   - `Completion` type - what fields support custom rendering (`type`, `info`, custom `render`)
   - `CompletionSection` type - does it support custom rendering?
   - Any way to inject custom DOM into completion items

2. In the existing app CSS at `crates/app/src/App.css` - look at the current autocomplete styles (around lines 1357-1400) and what CSS classes CM6 uses (`.cm-tooltip-autocomplete`, `.cm-completionIcon`, `.cm-completionMatchedText`, etc.)

3. In `crates/app/src/components/Editor/cmSlashCommands.ts` - the current implementation

4. Check if there are any existing icon/SVG utilities in the editor code (like the callout icon SVGs in `cmCalloutDecorations.ts`)

Be thorough - I need to know exactly what CM6 APIs are available for custom completion rendering.

---

## Assistant

I'll conduct a thorough exploration of CodeMirror 6's autocomplete customization APIs and the existing app implementation. Let me start by checking multiple areas in parallel.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@codemirror/autocomplete/dist/index.d.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","limit":150,"offset":1300}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmSlashCommands.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/*.ts*"}`

---

## Assistant

Now let me examine the icon utilities and callout decorations to see how SVG/DOM rendering is currently done:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutTypes.ts"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@codemirror/autocomplete -name \"*.d.ts\" | head -5"}`

---

## Assistant

Now let me check the CM6 source to see what CSS classes are available for icon styling:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@codemirror/autocomplete/dist"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@codemirror/autocomplete/dist/ | head -20"}`

---

## Assistant

Let me look at the compiled JS to understand the CSS classes CM6 generates:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -o \"cm-completion[A-Za-z-]*\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@codemirror/autocomplete/dist/index.js | sort -u"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 10 \"cm-completionIcon\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@codemirror/autocomplete/dist/index.js | head -30"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -o \"cm-[a-zA-Z-]*\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@codemirror/autocomplete/dist/index.js | sort -u | grep -E \"cm-(completion|tooltip)\""}`

---

## Assistant

Excellent. Now let me look at the implementation of the render function more closely:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -B 5 -A 20 \"addToOptions.*render\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@codemirror/autocomplete/dist/index.js | head -50"}`

---

## Assistant

Let me look at how the autocomplete library builds the completion items in the source:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -B 3 -A 15 \"function completionElements\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@codemirror/autocomplete/dist/index.js | head -60"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -B 2 -A 20 'label.*\"cm-completionMatchedText\"' /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@codemirror/autocomplete/dist/index.js | head -40"}`

---

## Assistant

Let me extract the implementation more carefully:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"sed -n '1,200p' /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@codemirror/autocomplete/dist/index.js | tail -100"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"content.push\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@codemirror/autocomplete/dist/index.js | head -10"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"sed -n '440,490p' /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@codemirror/autocomplete/dist/index.js"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"sed -n '450,520p' /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@codemirror/autocomplete/dist/index.js"}`

---

## Assistant

Perfect! Now let me check if there are any existing custom completions in the app to see patterns:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"addToOptions\\|CompletionConfig\\|autocompletion(\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ --include=\"*.ts*\" | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx","limit":100}`

---

## Assistant

Let me check what completion sources currently exist:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmNoteAutocomplete.ts"}`

---

## Assistant

Excellent. Now let me check the comprehensive CSS theme setup:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"cm-completionIcon\\|cm-tooltip-autocomplete\\|cm-completionLabel\\|cm-completionDetail\\|cm-completionMatchedText\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App`

---

## Assistant

Perfect! Now let me create a comprehensive report with all the findings:

## CodeMirror 6 Autocomplete Customization - Complete API Overview

Based on my thorough exploration of the CM6 autocomplete module, the app's current implementation, and the compiled library code, here's exactly what's available for custom completion rendering:

### 1. **Completion Type Configuration**

From the TypeScript types at `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@codemirror/autocomplete/dist/index.d.ts`:

**`Completion` interface fields:**
- **`type?: string`** — The completion type(s) space-separated. CM6 automatically renders icons by appending each type to `cm-completionIcon-`. The library includes built-in CSS for: `class`, `constant`, `enum`, `function`, `interface`, `keyword`, `method`, `namespace`, `property`, `text`, `type`, `variable`. Multiple types can be separated by spaces (e.g., `type="function property"`).
- **`label: string`** — The main text matched against the query
- **`displayLabel?: string`** — Optional override for visible label (without highlighting). Must be used with a custom `getMatch` function in `CompletionResult`.
- **`detail?: string`** — Additional short info shown with different styling (right side, grayed out)
- **`info?: string | ((completion: Completion) => CompletionInfo | Promise<CompletionInfo>)` — Rich info panel shown on selection. Can return:
  - A plain string
  - A DOM `Node`
  - `null` for no info
  - `{ dom: Node; destroy?(): void }` for cleanup

### 2. **CompletionSection Configuration**

From `CompletionSection` interface:
- **`name: string`** — Section header text (if no custom `header` render function)
- **`header?: (section: CompletionSection) => HTMLElement`** — Custom render function for section header. Must return an element with `display: list-item` CSS
- **`rank?: number | "dynamic"`** — Controls section ordering. Lower rank appears first. `"dynamic"` orders by best match score in that section.

### 3. **AutoCompletion Config Options**

From the `CompletionConfig` interface in the type definitions:

**Core customization options:**

```typescript
interface CompletionConfig {
  // Rendering customization:
  icons?: boolean;  // Default: true. Set to false to disable default icons
  optionClass?: (completion: Completion) => string;  // Add CSS classes to completion items
  
  addToOptions?: {
    render: (completion: Completion, state: EditorState, view: EditorView) => Node | null;
    position: number;  // Lower numbers = appear earlier. Default icon=20, label=50, detail=80
  }[];
  
  tooltipClass?: (state: EditorState) => string;  // Add classes to the tooltip wrapper
  
  positionInfo?: (
    view: EditorView,
    list: Rect,        // Completion list bounds
    option: Rect,      // Selected option bounds
    info: Rect,        // Info element bounds
    space: Rect        // Available tooltip space
  ) => { style?: string; class?: string };
  
  // Other config:
  activateOnTyping?: boolean;  // Default: true
  activateOnCompletion?: (completion: Completion) => boolean;
  activateOnTypingDelay?: number;  // Default: 100ms
  selectOnOpen?: boolean;  // Default: true
  closeOnBlur?: boolean;  // Default: true
  maxRenderedOptions?: number;  // Limit DOM elements
  aboveCursor?: boolean;  // Show above instead of below
  filterStrict?: boolean;  // Prefix match only, no fuzzy
  compareCompletions?: (a: Completion, b: Completion) => number;
  interactionDelay?: number;  // Default: 75ms before accepting
  updateSyncTime?: number;  // Default: 100ms for async sources
}
```

### 4. **CSS Classes Generated by CM6**

From the compiled library code, CM6 generates these classes:

**Main wrapper:**
- `.cm-tooltip-autocomplete` — The popup container
- `.cm-tooltip-autocomplete-disabled` — When completion is disabled

**Per-item structure:**
- `.cm-completionIcon` — Icon container (if `icons: true`)
  - `.cm-completionIcon-{type}` — Type-specific icon (e.g., `.cm-completionIcon-function`)
  - Built-in types: `class`, `constant`, `enum`, `function`, `interface`, `keyword`, `method`, `namespace`, `property`, `text`, `type`, `variable`
- `.cm-completionLabel` — Main label text
- `.cm-completionMatchedText` — Individual matched character spans within label
- `.cm-completionDetail` — Detail text (gray, right side)

**Section headers:**
- `.cm-completionSection` — Section header row

**Info panel:**
- `.cm-completionInfo` — Info popup
- `.cm-completionInfo-left/right/left-narrow/right-narrow` — Position variants

**List state:**
- `.cm-completionListIncompleteTop/Bottom` — When more results exist above/below

### 5. **Current App CSS** (from App.css lines 1357–1408)

```css
.editor-body .cm-editor .cm-tooltip-autocomplete {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-family: var(--ui-font-family);
  font-size: var(--ui-font-sm);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 240px;
  overflow-y: auto;
}
/* List styling */
.editor-body .cm-editor .cm-tooltip-autocomplete ul { ... }
.editor-body .cm-editor .cm-tooltip-autocomplete li { ... }

/* Individual components */
.editor-body .cm-editor .cm-completionLabel { flex: 1; }
.editor-body .cm-editor .cm-completionDetail { opacity: 0.6; font-size: var(--ui-font-xs); }
.editor-body .cm-editor .cm-completionSection { /* styled */ }
```

**Note:** The app does NOT yet define custom styles for `.cm-completionIcon` or `.cm-completionIcon-*` classes, so it uses CM6's defaults.

### 6. **Icon Rendering Pattern in Existing Code**

The app already has SVG icon rendering patterns in `cmCalloutDecorations.ts` (lines 27–99):

```typescript
// SVG element helper type
type SvgElement = [string, Record<string, string>];

// Icon definitions as arrays
const CALLOUT_ICON_PATHS: Record<string, SvgElement[]> = {
  "ai-answer": [["path", { d: "M12 8V4H8" }], ...],
  source: [...],
  // etc.
};

// Render function converts SVG array to data URI
function buildSvgDataUri(paths: SvgElement[], strokeColor: string): string {
  const svg = `<svg xmlns="..." stroke="${strokeColor}" ...>${children}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Cached for performance
const iconCache = new Map<string, string>();
```

This same pattern could be applied to completion icons.

### 7. **Current Slash Command Implementation** (cmSlashCommands.ts)

The app currently uses:
- Simple `Completion` objects with `label`, `detail`, `section`, and custom `apply` function
- No custom icon rendering (relies on `type` field)
- Sections for grouping: "Headings", "Lists", "Blocks", "BrainMap", "Callouts"

### 8. **How to Add Custom Icon Rendering to Completions**

**Option A: Use `addToOptions` with `position: 15` (before default icon at 20)**
```typescript
autocompletion({
  addToOptions: [{
    render: (completion, state, view) => {
      // Return DOM node or null
      const icon = document.createElement("span");
      icon.className = "custom-completion-icon";
      // Can set background-image, innerHTML, etc.
      return icon;
    },
    position: 15  // Appears before default icon
  }]
})
```

**Option B: Disable default icons and provide custom ones at position 20**
```typescript
autocompletion({
  icons: false,
  addToOptions: [{
    render: (completion, state, view) => {
      // Custom icon with any DOM structure
      const icon = document.createElement("div");
      icon.innerHTML = `<svg>...</svg>`;
      icon.className = "cm-completionIcon";
      return icon;
    },
    position: 20
  }]
})
```

**Option C: Style based on `completion.type`**
Use `optionClass` to add classes, then style with CSS:
```typescript
autocompletion({
  optionClass: (completion) => {
    if (completion.type === "slash-command") return "slash-command-item";
    return "";
  }
})
```

Then in CSS:
```css
.slash-command-item .cm-completionIcon {
  /* custom icon styles */
}
.slash-command-item.cm-completionIcon-h1::before {
  content: "H1";
}
```

### 9. **Key Insights**

1. **Icon positioning**: Use `addToOptions[].position` to control where custom DOM appears relative to label (50) and detail (80).

2. **Match highlighting**: CM6 automatically highlights matched characters in the label using `.cm-completionMatchedText` spans. This only works if `displayLabel` is NOT used or if you provide a custom `getMatch` function in `CompletionResult`.

3. **Section headers**: Can be fully customized via `CompletionSection.header()` — useful for emoji/icons next to group names.

4. **Info panels**: Very flexible — can be async, DOM, string, or complex with cleanup. Positioned by `positionInfo` config.

5. **Performance**: Use `maxRenderedOptions` to limit DOM nodes. CM6 virtualizes the list.

6. **CSS approach preferred**: The most maintainable approach is usually to use the `type` field + custom CSS with `::before`/`::after` content for simple cases.

7. **SVG data URIs work**: Can use `background-image: url(data:image/svg+xml,...)` in CSS for icons, as demonstrated in the callout code.

### Files Relevant to Implementation

- Type definitions: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@codemirror/autocomplete/dist/index.d.ts`
- Current CSS: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` (lines 1357–1408)
- Slash commands (example): `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmSlashCommands.ts`
- Note completion (example): `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmNoteAutocomplete.ts`
- Callout SVG patterns (reusable): `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts` (lines 27–99)
- Main editor setup: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx` (line 100+)

---

