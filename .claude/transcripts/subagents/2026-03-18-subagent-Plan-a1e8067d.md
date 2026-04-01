# 2026-03-18 — Subagent Transcript: Plan

**Date:** 2026-03-18 17:57:07
**Agent:** Plan
**Agent ID:** a1e8067d20abcb2f4
**Parent Session:** f804a05c-cfcf-4a1a-bc3e-b0c85c825cb1

---

## User

I need to plan adding a new "example" callout type to BrainMap's markdown editor. It needs:

1. **Block callout** (`[!example] { ... }`) - like ai-answer, source, question, key-insight
2. **Inline type** (`[!example content here]`) - like the existing inline source (`[!source content]`)
3. **Slash menu** entry for both block (`/example`) and inline (`/example` inline)
4. **Toolbar picker** inclusion

## Current Architecture

### Callout Type Registry (`calloutTypes.ts`)
- `CALLOUT_TYPES` record with color, label, Icon (Lucide)
- `CALLOUT_TYPE_ENTRIES` for iteration
- Current types: ai-answer (blue, Bot), source (orange, BookOpen), question (purple, HelpCircle), key-insight (green, Lightbulb)

### Inline Source Implementation
The inline source system is a **separate remark plugin** (`remarkInlineSource.ts`) that:
- Matches `[!source content]` in paragraph text via regex `/\[!source\s+([^\]]+)\]/g`
- Transforms to HTML: `<span class="inline-source"><span class="inline-source-tag">source</span>CONTENT</span>`
- Only walks phrasing content parents, skips code blocks
- CSS in App.css: border-bottom accent, italic, tag badge

### Slash Commands (`cmSlashCommands.ts`)
- `SLASH_COMMANDS` array with keyword, label, detail, section, icon, apply
- `/source` is in "BrainMap" section, inserts `[!source ""]`
- Block callouts auto-generated from `CALLOUT_TYPE_ENTRIES` in "Callouts" section
- `ICON_PATHS` has SVG paths for icons
- `CALLOUT_ICON_MAP` maps type → icon name
- Test expects `STATIC_COMMAND_COUNT = 12`

### Editor Decorations (`cmCalloutDecorations.ts`)
- `CALLOUT_ICON_PATHS` record maps type → SVG paths
- Used for rendering header widgets in editor

### Toolbar (`EditorToolbar.tsx`)
- Callout picker popover iterates `CALLOUT_TYPE_ENTRIES`
- Auto-includes any type in the registry

### Preview (`MarkdownPreview.tsx`)
- Uses `remarkInlineSource` plugin
- Callout blocks rendered via blockquote detection

### Tests
- `remarkInlineSource.test.ts` - 11 tests for inline source
- `cmSlashCommands.test.ts` - expects STATIC_COMMAND_COUNT = 12, checks sections include "BrainMap"

## Design Questions

1. For inline example, should I extend `remarkInlineSource.ts` to be generic (handle both `[!source ...]` and `[!example ...]`), or create a separate `remarkInlineExample.ts`?
2. What icon and color for example? I'm thinking a `Code` or `FlaskConical` or `FileCode` icon in a teal/cyan color like `#17a2b8`.
3. The inline display - source shows as italic with accent border-bottom and a "source" tag. Example could show with a distinct style - maybe a code-like background with an "example" tag.

Please provide a detailed implementation plan covering all files that need changes.

---

## Assistant



I'll explore the codebase to understand the existing patterns before designing the plan.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*callout*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*InlineSource*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*remarkInline*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*SlashCommand*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*slashCommand*"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutTypes.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkInlineSource.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmSlashCommands.ts"}`

---

## Assistant

Now let me look at the remaining files I need to understand.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts","limit":50}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkInlineSource.test.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmSlashCommands.test.ts"}`

---

## Assistant

Now let me check the remaining files -- the toolbar, CSS, preview, and callout decorations.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/EditorToolbar*"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts","offset":50,"limit":40}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"inline-source","glob":"*.css","output_mode":"content","-C":2}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorToolbar.tsx"}`

---

## Assistant

Let me check the full inline-source CSS and the MarkdownPreview to see how remarkInlineSource is used.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"inline-source","glob":"*.css","output_mode":"content","-C":8}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"remarkInlineSource","output_mode":"content","-C":2}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"remarkInlineSource","glob":"**/MarkdownPreview*","output_mode":"content","-C":3}`

---

## Assistant

I now have a complete picture. Here is the implementation plan.

---

## Implementation Plan: Add "example" Callout Type

### Design Decisions

**Question 1 -- Generalize remarkInlineSource or create a separate plugin?**

Generalize it. The plugin is small and the pattern is identical. Rename to `remarkInlineCallouts.ts` (or keep the filename and make it handle a configurable set of inline types). The simplest approach: change the hardcoded `source` regex to a dynamic one that matches any registered inline callout type. This avoids code duplication and makes it trivial to add future inline types. The regex becomes `/\[!(source|example)\s+([^\]]+)\]/g` built from a list of inline-capable types.

**Question 2 -- Icon and color.**

`FlaskConical` from lucide-react, teal/cyan `#17a2b8`. This is visually distinct from the existing palette (blue=ai-answer, orange=source, purple=question, green=key-insight). FlaskConical communicates "example/experiment" well and its SVG paths are straightforward.

**Question 3 -- Inline example styling.**

Use the same structural pattern as inline-source (tag badge + content) but with a distinct visual: monospace font, subtle code-like background tint using the example color, and an "example" tag badge in teal. CSS classes: `.inline-example` and `.inline-example-tag`, mirroring the source pattern.

---

### Step-by-step Changes

#### Step 1: Register the "example" callout type

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutTypes.ts`

- Add `import { FlaskConical } from "lucide-react"` to the import line (alongside existing icons).
- Add entry to `CALLOUT_TYPES`:
  ```
  example: { color: "#17a2b8", label: "Example", Icon: FlaskConical },
  ```

This single change automatically propagates to:
- The toolbar callout picker (iterates `CALLOUT_TYPE_ENTRIES`).
- The slash menu "Callouts" section (auto-generated from `CALLOUT_TYPE_ENTRIES`).

#### Step 2: Add SVG icon paths for the example type

Two places need the FlaskConical SVG path data:

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts`

- Add to `CALLOUT_ICON_PATHS`:
  ```
  example: [
    ["path", { d: "M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" }],
    ["path", { d: "M8.5 2h7" }],
    ["path", { d: "M7 16.5h10" }],
  ],
  ```

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmSlashCommands.ts`

- Add to `ICON_PATHS` the same `"flask-conical"` entry (same SVG paths as above).
- Add to `CALLOUT_ICON_MAP`: `example: "flask-conical"`.

#### Step 3: Generalize remarkInlineSource to handle multiple inline types

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkInlineSource.ts`

Current regex: `const INLINE_SOURCE_RE = /\[!source\s+([^\]]+)\]/g;`

Change to:

```ts
const INLINE_TYPES = ["source", "example"];
const INLINE_RE = new RegExp(
  `\\[!(${INLINE_TYPES.join("|")})\\s+([^\\]]+)\\]`,
  "g",
);
```

Update `transformPhrasing` to use group 1 as the type and group 2 as the content. The HTML output becomes:

```ts
const type = m[1];     // "source" or "example"
const content = m[2];
newChildren.push({
  type: "html",
  value: `<span class="inline-${type}"><span class="inline-${type}-tag">${type}</span>${escapeHtml(content)}</span>`,
});
```

The function name `remarkInlineSource` can stay (it is the entry point and renaming would touch many files). Alternatively rename to `remarkInlineCallouts` and update the two import sites -- but for minimal diff, keep the name.

#### Step 4: Add inline example slash command

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmSlashCommands.ts`

Add in the "BrainMap" section (next to the existing inline source command):

```ts
{
  keyword: "example",
  label: "Inline Example",
  detail: "Example reference",
  section: "BrainMap",
  icon: "flask-conical",
  apply: (v, from, to) =>
    replaceWith(v, from, to, '[!example ""]', '[!example "'.length),
},
```

Note: The block callout `/example` will be auto-generated from `CALLOUT_TYPE_ENTRIES` (it already works via the spread pattern on line 281). It will have keyword `example` -- wait, that conflicts with the inline one above. Use the same disambiguation pattern as source: the auto-generated block callout for "example" needs keyword `example-callout` if there is also a BrainMap inline entry with keyword `example`.

Look at how source is handled: the block callout auto-generation on line 282 already does `keyword: type === "source" ? "source-callout" : type`. Extend this to also handle "example":

```ts
keyword: (type === "source" || type === "example") ? `${type}-callout` : type,
```

Or generalize: check if the type has an inline command too, and suffix `-callout`. A set of inline types would be cleaner:

```ts
const INLINE_COMMAND_TYPES = new Set(["source", "example"]);
// ... in the map:
keyword: INLINE_COMMAND_TYPES.has(type) ? `${type}-callout` : type,
```

#### Step 5: Add CSS for inline example

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

After the `.inline-source` / `.inline-source-tag` rules (around line 1350), add:

```css
/* Preview inline example */
.inline-example {
  background: color-mix(in srgb, #17a2b8 10%, transparent);
  border-bottom: 1.5px solid #17a2b8;
  font-family: var(--font-mono, monospace);
  font-size: 0.95em;
  color: var(--text-secondary);
}
.inline-example-tag {
  color: #17a2b8;
  font-size: 0.8em;
  font-weight: 600;
  font-style: normal;
  margin-right: 4px;
  text-transform: uppercase;
  opacity: 0.7;
}
```

#### Step 6: Update tests

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkInlineSource.test.ts`

Add tests for the new inline example type:
- Basic inline example: `"Text [!example fibonacci sequence] more."` produces HTML with `inline-example`.
- Multiple mixed: `"Text [!source A] and [!example B] end."` produces both.
- Does NOT match `[!example ]` (empty).
- Does NOT match inside code blocks.
- Works inside headings, emphasis, list items.

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmSlashCommands.test.ts`

- Update `STATIC_COMMAND_COUNT` from `12` to `13` (added the inline example command in BrainMap section).
- Add assertion: `expect(keywords).toContain("example")` (inline).
- Add assertion: `expect(keywords).toContain("example-callout")` (block, auto-generated).
- Update the `filterSlashCommands("source")` test to also verify example works: add a test `filterSlashCommands("example")` matching both inline and callout.
- Update the valid sections test if needed (no change needed, "BrainMap" already in the set).

#### Step 7: Verify FlaskConical SVG paths

Before implementing, verify the exact SVG paths for the FlaskConical icon from lucide-react. The paths above are from the standard Lucide icon set but should be double-checked against the version in node_modules.

**Command**: Check `node_modules/lucide-react` or the lucide icon source for `flask-conical`.

---

### Summary of All Files Changed

| File | Change |
|------|--------|
| `calloutTypes.ts` | Add `example` entry with FlaskConical, `#17a2b8` |
| `cmCalloutDecorations.ts` | Add `example` SVG paths to `CALLOUT_ICON_PATHS` |
| `cmSlashCommands.ts` | Add `flask-conical` to `ICON_PATHS`, `example` to `CALLOUT_ICON_MAP`, add inline example command in BrainMap section, fix keyword disambiguation for auto-generated block callout |
| `remarkInlineSource.ts` | Generalize regex to match both `[!source ...]` and `[!example ...]`, use type in CSS class names |
| `App.css` | Add `.inline-example` and `.inline-example-tag` styles |
| `remarkInlineSource.test.ts` | Add 5+ tests for inline example |
| `cmSlashCommands.test.ts` | Bump `STATIC_COMMAND_COUNT` to 13, add example assertions |

No changes needed to:
- `EditorToolbar.tsx` -- already iterates `CALLOUT_TYPE_ENTRIES`, picks up example automatically.
- `MarkdownPreview.tsx` -- already uses `remarkInlineSource` plugin, picks up the generalized regex automatically.
- `calloutPreprocess.ts` -- the `CALLOUT_RE` in `calloutTypes.ts` already matches `[!example]` via `\w[\w-]*`.

### Potential Risks

1. **Keyword collision**: The inline command `example` and auto-generated block callout `example` would collide. The plan addresses this by extending the `source-callout` disambiguation pattern.

2. **Regex performance**: Adding one alternation to the inline regex has negligible cost. If many more inline types are added in the future, consider a different approach, but for 2 types a simple alternation is fine.

3. **FlaskConical SVG paths**: The SVG path data must match exactly what lucide-react uses. Verify from the installed package before hardcoding.

---

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutTypes.ts` - Central registry; adding the example entry here propagates to toolbar and block callout slash commands automatically.
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkInlineSource.ts` - Must be generalized from source-only to multi-type inline callout support.
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmSlashCommands.ts` - Needs inline example command, icon paths, icon map entry, and keyword disambiguation fix.
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts` - Needs FlaskConical SVG paths for editor header widget rendering.
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` - Needs `.inline-example` and `.inline-example-tag` style rules for preview rendering.

---

