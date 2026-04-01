# 2026-03-16 — Subagent Transcript: Plan

**Date:** 2026-03-16 17:12:20
**Agent:** Plan
**Agent ID:** a3dcf7e7d3bea3929
**Parent Session:** ace20328-a0ad-4593-a8e0-9c5670a209e5

---

## User

I need to make the CodeMirror Edit mode callout blocks look more like the polished Preview mode callouts in a BrainMap note editor app. Here's the analysis of current differences:

## Current State

### Preview Mode (MarkdownPreview.tsx renders callouts as React divs):
- `.callout` container: left border 3px colored, right/top/bottom borders 1px at 15% opacity, border-radius 0 6px 6px 0, background 5% color, margin 0.75em 0 1em
- `.callout-header`: padding 6px 12px, font-weight 600, 0.85em, background 8% currentColor
- `.callout-body`: padding 8px 12px 10px 16px, text-secondary color
- `.callout-body p + p`: margin-top 0.5em (inter-paragraph spacing)

### Edit Mode (cmCalloutDecorations.ts applies line-by-line Decoration.line()):
- Header line: inline style `background: color-mix(in srgb, ${color} 12%, transparent); border-left: 3px solid ${color}; padding-left: 8px;`
- Body lines: inline style `background: color-mix(in srgb, ${color} 6%, transparent); border-left: 3px solid ${color}; padding-left: 8px;`
- No right/top/bottom borders
- No rounded corners
- No margin spacing around callout block
- No differentiation between first/last body lines

### Key Gaps:
1. No subtle right/top/bottom borders in edit mode → callouts don't feel like contained "cards"
2. Body left padding is 8px (preview uses 16px)
3. No rounded corners on right side (preview has 0 6px 6px 0)
4. No vertical margin spacing around callout blocks
5. Empty lines inside callouts take full height — in preview, blank-line paragraph spacing is more controlled

## Approach

Since CodeMirror uses line-by-line decorations, we need to identify the role of each line in the callout (first/last/middle) and apply appropriate CSS classes instead of inline styles. This gives us proper CSS control over borders and border-radius.

### Files to Modify:

1. **`crates/app/src/components/Editor/cmCalloutDecorations.ts`** (buildDecorations function, ~lines 280-355):
   - Replace inline styles with CSS class-based decorations
   - Differentiate line roles: header (first), body, last-body-line, closing-brace
   - Apply CSS classes like `cm-callout-header`, `cm-callout-body`, `cm-callout-body-last`, `cm-callout-first`, etc.
   - Set `--callout-color` as a CSS variable on each line

2. **`crates/app/src/App.css`** (add new CSS rules after the existing editor section):
   - Base callout line styling with left border, right border, background
   - Header line: top border + top-right border-radius + header-specific background
   - Last body line (before closing brace): bottom border + bottom-right border-radius
   - Body padding-left increased to match preview (~14-16px)
   - Vertical margin: margin-top on header line, margin-bottom on last body line
   - Empty lines within callouts: slightly reduced line-height for smoother spacing

### Design Details:

**CSS Classes for line roles:**
- `.cm-callout-line` — on ALL callout lines (left border, right border, background, padding-left)
- `.cm-callout-line-header` — first line (top border, top-right radius, header bg)
- `.cm-callout-line-body` — body content lines
- `.cm-callout-line-last` — last visible body line before closing brace (bottom border, bottom-right radius, margin-bottom)

**CSS values to match preview:**
- Left border: 3px solid var(--callout-color) (same)
- Right border: 1px solid color-mix(in srgb, var(--callout-color) 15%, transparent) — matches preview
- Top border on header: 1px solid color-mix(in srgb, var(--callout-color) 15%, transparent)
- Bottom border on last: 1px solid color-mix(in srgb, var(--callout-color) 15%, transparent)
- Body background: 5% (down from 6% to match preview)
- Header background: 8% (down from 12%)
- Body padding-left: 14px (compromise between 8 and 16, since CodeMirror has its own content padding)
- Border-radius: 0 6px 6px 0 split across first/last lines
- Margin: 0.5em margin-top on header, 0.75em margin-bottom on last line

**Implementation in buildDecorations:**
For each CalloutRange, instead of setting inline styles, set CSS classes:
```typescript
const lineClass = (role: string) => Decoration.line({
  attributes: {
    class: `cm-callout-line cm-callout-line-${role}`,
    style: `--callout-color: ${color};`
  }
});
```

Please design a detailed step-by-step implementation plan.

---

## Assistant



I'll explore the relevant files to understand the current implementation before designing the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx"}`

---

## Assistant

Now let me read the relevant CSS sections.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"callout","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":3}`

---

## Assistant

Now let me check if there are any existing tests for callout decorations.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/cmCallout*.test.*"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.test.ts"}`

---

## Assistant

Now I have a thorough understanding of the codebase. Let me look at one more thing -- the baseTheme in the decorations file to understand the CodeMirror theme pattern being used.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cm-callout","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":2}`

---

## Assistant

Good -- no existing `cm-callout` styles in App.css. All current edit-mode callout styling is via inline styles in the TS file and via `baseTheme` in the same file. Here is my detailed implementation plan.

---

## Implementation Plan: Polished Edit-Mode Callout Blocks

### Goal

Make CodeMirror edit-mode callout blocks visually match the preview-mode callout "card" appearance by replacing inline styles with CSS-class-based line decorations that support borders, border-radius, margins, and proper padding.

### Step 1: Modify `buildDecorations` in `cmCalloutDecorations.ts`

**What changes:** Replace inline `style` attributes on `Decoration.line()` calls with CSS class-based decorations using a `--callout-color` CSS custom property.

**Current code (lines 287-354):** Each callout line gets an inline style string like `background: color-mix(...); border-left: 3px solid ...; padding-left: 8px;`.

**New approach:** For each `CalloutRange`, determine every line's role and assign CSS classes accordingly.

Line roles:
- **Header line** (first line of callout): classes `cm-callout-line cm-callout-header`
- **Body lines** (between header and closing brace): classes `cm-callout-line cm-callout-body`
- **Last body line** (final body line before closing brace): classes `cm-callout-line cm-callout-body cm-callout-last`
- **Solo header** (header with no body, only closing brace): classes `cm-callout-line cm-callout-header cm-callout-last`
- **Closing brace line** (when cursor is on it and it is visible): classes `cm-callout-line cm-callout-body cm-callout-last`

Each line also gets `style: "--callout-color: ${color}"` as an inline attribute to pass the computed color as a CSS variable.

**Specific code changes in `buildDecorations`:**

1. Remove the two `const` lines for `headerBg` and `bodyBg` (lines 289-290).

2. Create a helper function at the top of `buildDecorations`:
```typescript
const lineDeco = (classes: string, color: string) =>
  Decoration.line({
    attributes: {
      class: classes,
      style: `--callout-color: ${color};`,
    },
  });
```

3. For the **header line** (lines 298-322):
   - Determine if this is also the last visible line (i.e., `bodyLineCount === 0` and the callout is closed with the closing brace hidden). If so, add `cm-callout-last` to the header classes.
   - Both cursor-on-header and cursor-off-header paths use the same class-based decoration (the widget replacement for the header content is independent of the line decoration).
   - Replace `Decoration.line({ attributes: { style: headerBg } })` with `lineDeco("cm-callout-line cm-callout-header" + (isLast ? " cm-callout-last" : ""), color)`.

4. For **body lines** (lines 325-332):
   - Determine the last body line number: `closingLineNum - 1` (for closed callouts) or `closingLineNum` (for unclosed).
   - For each body line, check if `ln === lastBodyLineNum`. If so, add `cm-callout-last`.
   - Replace `Decoration.line({ attributes: { style: bodyBg } })` with `lineDeco("cm-callout-line cm-callout-body" + (isLast ? " cm-callout-last" : ""), color)`.

5. For the **closing brace line** when cursor is on it (line 348):
   - Replace inline style with `lineDeco("cm-callout-line cm-callout-body cm-callout-last", color)`.

### Step 2: Update `baseTheme` in `cmCalloutDecorations.ts`

Move callout line styling into the `baseTheme` object (lines 423-448). This keeps all CodeMirror-specific styles co-located with the extension, which is the established pattern in this file.

Add these rules to `baseTheme`:

```typescript
// Base: all callout lines
".cm-callout-line": {
  borderLeft: "3px solid var(--callout-color)",
  borderRight: "1px solid color-mix(in srgb, var(--callout-color) 15%, transparent)",
  paddingLeft: "14px",
  background: "color-mix(in srgb, var(--callout-color) 5%, transparent)",
},

// Header line
".cm-callout-header": {
  background: "color-mix(in srgb, var(--callout-color) 8%, transparent)",
  borderTop: "1px solid color-mix(in srgb, var(--callout-color) 15%, transparent)",
  borderTopRightRadius: "6px",
  marginTop: "0.5em",
},

// Last visible line of callout
".cm-callout-last": {
  borderBottom: "1px solid color-mix(in srgb, var(--callout-color) 15%, transparent)",
  borderBottomRightRadius: "6px",
  marginBottom: "0.75em",
},

// When header is also the last line (empty callout)
".cm-callout-header.cm-callout-last": {
  borderRadius: "0 6px 6px 0", // intentional: override individual corner rules to avoid CSS specificity
},
```

**Note on `baseTheme` specificity:** CodeMirror's `baseTheme` prepends `.cm-editor` to all selectors automatically, so these will scope correctly.

### Step 3: Optionally add CSS to `App.css`

If `baseTheme` proves insufficient for any styling (e.g., if `marginTop`/`marginBottom` do not work well on CodeMirror line elements because CM controls line layout tightly), we would fall back to adding rules in `App.css` targeting `.cm-editor .cm-callout-line` etc.

**Likely needed in App.css:** CodeMirror line decorations apply classes to the `.cm-line` element. The `margin` properties on `.cm-line` may not behave as expected because CodeMirror uses a flat layout. Instead of `margin`, we may need to use `padding-top` / `padding-bottom` on the header/last lines to simulate vertical spacing:

```css
/* Edit-mode callout spacing (if baseTheme margin doesn't work) */
.cm-editor .cm-callout-header {
  padding-top: 6px;
}
.cm-editor .cm-callout-last {
  padding-bottom: 8px;
}
```

This is a fallback -- try `baseTheme` first.

### Step 4: Handle edge cases

1. **Unclosed callouts:** When `r.closed === false`, the last body line is the last line of the document (or the last body line before EOF). It should still get `cm-callout-last` so it has a bottom border and rounded corner.

2. **Empty callouts (no body lines):** When `bodyLineCount === 0` and the closing brace is hidden (cursor not on it), the header line is both first and last. It gets both `cm-callout-header` and `cm-callout-last`, giving it full rounded corners on the right side plus both top and bottom borders.

3. **Closing brace visible (cursor on it):** The closing brace line becomes the last line. It gets `cm-callout-last`. The previous body line (if any) should NOT get `cm-callout-last` in this case. This means the "last body line" logic needs to account for whether the closing brace is visible.

   Implementation: When the cursor is on the closing line, the closing line itself is the `cm-callout-last`. So in the body-lines loop, the last body line (line before closing) should NOT get `cm-callout-last`. When the cursor is NOT on the closing line, the closing brace is hidden (replaced with zero-height widget), so the last body line IS the visual last line and should get `cm-callout-last`.

   Refined logic:
   ```typescript
   const closingBraceVisible = r.closed && cursorLine === closingLineNum;
   const lastVisibleBodyLine = closingBraceVisible
     ? -1  // closing brace itself will be the last
     : (closingLineNum - 1);  // last body line before hidden brace
   
   // For header: is it the last visible line?
   const headerIsLast = !closingBraceVisible && r.bodyLineCount === 0;
   ```

4. **Header also last when unclosed with zero body lines:** This is unlikely but handle it -- if `!r.closed && bodyLineCount === 0`, the header is the only callout line.

### Step 5: Update existing tests and add new ones

The existing `cmCalloutDecorations.test.ts` tests only cover `scanCallouts`, which is not changing. No existing tests break.

However, we should add tests for the new class assignment logic if we extract it into a testable function. Consider extracting a pure function:

```typescript
export function computeLineRole(
  lineNum: number,
  headerLineNum: number,
  closingLineNum: number,
  bodyLineCount: number,
  closed: boolean,
  cursorLine: number,
): string  // returns CSS class string
```

This function can be unit-tested independently. Add tests in `cmCalloutDecorations.test.ts`:

- Header line gets `cm-callout-line cm-callout-header`
- Body line gets `cm-callout-line cm-callout-body`
- Last body line (brace hidden) gets `cm-callout-line cm-callout-body cm-callout-last`
- Empty callout header gets `cm-callout-line cm-callout-header cm-callout-last`
- Closing brace visible gets `cm-callout-line cm-callout-body cm-callout-last`
- When brace is visible, previous body line does NOT get `cm-callout-last`

### Step 6: Visual verification

After implementation, verify in the running app (`npm run dev` from `crates/app/`):
- Callouts in edit mode show card-like appearance with right/top/bottom borders
- Rounded corners on right side visible
- Vertical spacing between callout and surrounding text
- Cursor on header line still shows raw syntax with styling
- Cursor on closing brace still shows `}` with styling
- Empty callouts render as a single styled line
- Nested code blocks within callouts still render correctly

---

### Summary of files to modify

| File | Changes |
|------|---------|
| `cmCalloutDecorations.ts` | Replace inline styles with CSS classes in `buildDecorations`; add line-role rules to `baseTheme`; optionally extract `computeLineRole` helper |
| `App.css` | Add fallback spacing rules if `baseTheme` margin/padding is insufficient on CM lines |
| `cmCalloutDecorations.test.ts` | Add unit tests for `computeLineRole` if extracted |

### Critical Files for Implementation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts` - Core file: replace inline styles with CSS classes in `buildDecorations`, extend `baseTheme` with card-like styling rules
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` - Fallback CSS if CodeMirror `baseTheme` cannot handle margin/padding on line elements
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.test.ts` - Add tests for line-role classification logic
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx` - Reference: preview callout rendering and CSS class names to match visually

---

