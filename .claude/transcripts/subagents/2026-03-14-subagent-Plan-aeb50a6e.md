# 2026-03-14 — Subagent Transcript: Plan

**Date:** 2026-03-14 14:19:50
**Agent:** Plan
**Agent ID:** aeb50a6e04fb6ab3c
**Parent Session:** 312e15c5-30bb-431e-ba48-5fb3c6c3e140

---

## User

I need to fix inaccurate mouse clicks in a CodeMirror 6 editor, especially around callout blocks. Here's the full context:

## Current Setup

**MarkdownEditor.tsx** (`crates/app/src/components/Editor/MarkdownEditor.tsx`):
- CodeMirror 6 editor with several extensions
- Has a `patchCMScaleDetection` function that patches `offsetWidth`/`offsetHeight` to handle CSS zoom
- The patch is only applied when `uiZoom !== 1` (line 132-134)
- Editor is recreated when zoom changes (uiZoom in effect dependency array)

**App.css** (line 1054-1058):
```css
.editor-body .cm-editor .cm-content {
  padding-left: clamp(12px, 3%, 36px);
  padding-right: clamp(12px, 3%, 36px);
  line-height: 2.1;
}
```
**`line-height: 2.1` is extremely high** — normal editors use 1.4-1.7. This creates massive vertical dead space between text lines.

**cmCalloutDecorations.ts** (`crates/app/src/components/Editor/cmCalloutDecorations.ts`):
- Callout blocks use the pattern `[!type] Title {` ... `}`
- When cursor is NOT on the header line: the entire line content is replaced with a `CalloutHeaderWidget` via `Decoration.replace()`
- When cursor IS on the header line: raw syntax is shown with just a background
- Body lines get `Decoration.line()` with inline styles: `background: ...; border-left: 3px solid ...; padding-left: 8px;`
- Closing `}` line: when cursor is NOT on it, content is hidden via `Decoration.replace({})` (empty replacement — no widget). This creates an invisible line that still occupies full `line-height: 2.1` height.

**App.tsx** (lines 280-288): Global zoom applied via `document.documentElement.style.zoom = String(uiZoom)`.

## Problems Identified

1. **`line-height: 2.1` creates excessive dead space** — each line box is 2.1x font size. Text only occupies ~half the line height. Clicks in the large gaps between text can land on the wrong line. This affects ALL editor content.

2. **Hidden closing `}` creates invisible dead zone** — when the `}` is replaced with nothing, the `.cm-line` div remains with full `line-height: 2.1` height. This is a large invisible clickable area that confuses users — they click what looks like the line above or below, but the cursor lands on the invisible `}` line.

3. **Callout line decorations add horizontal offset** — the inline styles add `border-left: 3px solid` + `padding-left: 8px` = 11px of extra left padding. CodeMirror should handle this correctly through DOM measurement, but combined with the excessive line-height, it could make clicks feel off.

## Proposed Fixes

### Fix 1: Reduce `line-height`
Change from `2.1` to something like `1.65` in App.css. This is the single biggest improvement for click accuracy everywhere.

### Fix 2: Collapse hidden closing brace line
When the closing `}` is replaced, also apply a line decoration class that minimizes the line's visual height. CodeMirror 6 measures actual DOM heights, so it should adapt its height map automatically. Something like:
```css
.cm-callout-closing-hidden {
  font-size: 1px;
  line-height: 0;
  height: 0;
  overflow: hidden;
}
```
Or use `max-height: 0` + `min-height: 0` to collapse the `.cm-line`.

### Fix 3: Consider using block: true on callout replace decorations
For the callout header widget, consider whether `block: true` on the `Decoration.replace` would improve coordinate accuracy. Block replacements are measured differently by CM6.

Please evaluate these fixes for:
1. Correctness with CodeMirror 6's internal height tracking
2. Whether reducing line-height could have negative UX side-effects
3. The best approach for collapsing the hidden closing brace line in CM6
4. Any other approaches I might be missing
5. Whether the zoom patch needs any changes

Provide a concrete implementation plan.

---

## Assistant



I'll explore the relevant files to understand the current implementation before evaluating the proposed fixes.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1040,"limit":40}`

---

## Assistant

Let me also check the `cmListSpacing.ts` extension since it adds margin to list lines, and look at the full CSS around the callout area.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmListSpacing.ts"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cm-callout|callout-closing|callout-hidden","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"line-height","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content"}`

---

## Assistant

Now let me check the preview mode's line-height for comparison, and look at how CodeMirror's `Decoration.replace` interacts with height tracking.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1180,"limit":20}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1600,"limit":30}`

---

## Assistant

Good. I now have a thorough understanding of the codebase. Let me also verify there are no existing CSS classes for callout closing lines.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"callout.*clos|closing.*brace|hidden.*line","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content"}`

---

## Assistant

Now I have all the information needed. Here is my analysis and implementation plan.

---

## Analysis and Implementation Plan

### Evaluation of Proposed Fixes

#### Fix 1: Reduce `line-height` from 2.1 to 1.65

**Correctness with CM6**: Fully safe. CodeMirror 6 measures DOM heights dynamically via its `HeightMap`. Changing CSS `line-height` requires no internal adjustments -- CM6 will simply measure shorter line boxes and update its coordinate mapping accordingly.

**UX side-effects**: The preview mode already uses `line-height: 1.7` (App.css line 1607). Reducing the editor to 1.65 brings them into close visual alignment, which is desirable. However, there is a design consideration: the original 2.1 value was likely chosen deliberately to give the editor an airy, Notion-like feel with generous spacing between lines. Dropping to 1.65 is a 21% reduction in line height, which will make the editor noticeably more compact. I would recommend **1.7** to match the preview mode exactly, or **1.75** if you want the editor to feel slightly more spacious than preview. Going below 1.6 would start feeling cramped for a markdown editor.

**Recommendation**: Change to `1.7` (match preview). This is the single highest-impact fix. The current 2.1 means that for a 16px font, the line box is 33.6px tall, but the text only occupies roughly 16-18px -- leaving ~16px of dead zone per line. At 1.7, the line box becomes 27.2px, reducing the dead zone to ~10px. This cuts the inaccuracy window by roughly 40%.

#### Fix 2: Collapse the hidden closing brace line

**The core problem**: At line 326-331 of `cmCalloutDecorations.ts`, when the cursor is not on the closing `}` line, the text content is replaced with an empty `Decoration.replace({})`. This removes the visible `}` character but the `.cm-line` div remains in the DOM at full `line-height` height. With `line-height: 2.1`, this is a ~34px invisible dead zone.

**Best approach for CM6**: The key constraint is that CodeMirror 6's height tracking relies on measuring actual DOM elements. You cannot simply set `height: 0` on a `.cm-line` because CM6 expects each line element to have a measurable height that it records in its `HeightMap`. If the DOM height disagrees with what CM6 measured, click-to-position mapping breaks.

The correct CM6 approach is to use `Decoration.line()` with a CSS class that makes the line **very short but not zero-height**. CM6 will measure the actual short height and use it correctly in coordinate math. The CSS should be:

```css
.cm-callout-closing-hidden .cm-line {
  /* Won't work -- line decos target .cm-line itself */
}
```

Actually, `Decoration.line()` adds attributes/classes to the `.cm-line` element directly. So:

```css
.cm-callout-closing-hidden {
  font-size: 0;
  line-height: 0;
  height: 1px;
  overflow: hidden;
  padding: 0 !important;
  border: none !important;
}
```

Setting `height: 1px` instead of `0` avoids potential edge cases where CM6's height measurement rounds to 0 and causes division issues. The 1px is effectively invisible. CM6 will measure this as 1px and map coordinates correctly.

**Implementation**: In `buildDecorations`, when adding the empty replace for the closing brace, also add a line decoration with the collapse class:

```typescript
// Current code (lines 320-332):
if (r.closed) {
  builder.add(
    r.closingLineFrom,
    r.closingLineFrom,
    Decoration.line({ attributes: { style: bodyBg } }),
  );
  if (cursorLine !== closingLineNum && r.closingLineFrom < r.closingLineTo) {
    builder.add(
      r.closingLineFrom,
      r.closingLineTo,
      Decoration.replace({}),
    );
  }
}
```

Change to: when cursor is not on the closing line, replace the line decoration's `style` attribute with the collapse class instead of the tinted background. The `Decoration.replace({})` still hides the `}` text, and the line decoration collapses the line visually:

```typescript
if (r.closed) {
  if (cursorLine !== closingLineNum) {
    // Collapse the line visually
    builder.add(
      r.closingLineFrom,
      r.closingLineFrom,
      Decoration.line({ class: "cm-callout-closing-hidden" }),
    );
    if (r.closingLineFrom < r.closingLineTo) {
      builder.add(
        r.closingLineFrom,
        r.closingLineTo,
        Decoration.replace({}),
      );
    }
  } else {
    // Cursor on closing line: show raw } with tinted bg
    builder.add(
      r.closingLineFrom,
      r.closingLineFrom,
      Decoration.line({ attributes: { style: bodyBg } }),
    );
  }
}
```

**Why not `block: true`?** Using `block: true` on `Decoration.replace` changes the replacement to a block-level widget, which would require providing a widget and would alter the document flow differently. The line decoration approach is simpler and more predictable.

#### Fix 3: `block: true` on the header replace decoration

**Evaluation**: The current inline `Decoration.replace` with the `CalloutHeaderWidget` works fine for the header because the widget actually renders visible content. The `CalloutHeaderWidget.toDOM()` returns a `<span>` with visible icon + label + title, so the line has real measurable height. `block: true` would change the widget from inline to block-level, which would cause the header line's `.cm-line` to split around a block element. This is unnecessary and could introduce layout issues (the line decoration with `headerBg` would no longer cover the widget properly). **I recommend against this change.**

#### Additional observations

**Zoom patch**: The zoom patch at lines 132-134 only applies when `uiZoom !== 1`. This is correct. The `patchCMScaleDetection` function uses `uiZoomRef` (a ref that tracks the latest zoom value), so it stays current even if zoom changes between editor recreations. The condition `if (uiZoom !== 1)` means at zoom=1 the native offsetWidth/Height are used, which is correct since no scaling adjustment is needed. **No changes needed to the zoom patch.**

**`padding-left: clamp(12px, 3%, 36px)` on `.cm-content`**: This padding shifts all content right relative to where CM6 computes positions. CM6 handles padding on `.cm-content` correctly because it reads it from the DOM. This is not a source of click inaccuracy. **No changes needed.**

**Callout body line inline `padding-left: 8px` + `border-left: 3px`**: These are applied via `Decoration.line({ attributes: { style: ... } })`. CM6 measures these via the DOM, so the extra 11px is accounted for. However, there is a subtle issue: these are inline styles, so CM6 may not detect them until after the first paint. On initial render, CM6 measures line heights before decorations from ViewPlugins are applied (the plugin runs after the first DOM render). CM6 then re-measures on decoration updates. This could cause a brief flash of misaligned coordinates on first render, but it self-corrects immediately. This is an inherent CM6 behavior with ViewPlugin decorations and is not worth working around.

### Implementation Plan

#### Step 1: Reduce `line-height` in App.css

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`, line 1057

Change `line-height: 2.1;` to `line-height: 1.7;`

This is the single most impactful fix. It reduces click dead zones by ~40% across all editor content.

#### Step 2: Add CSS class for collapsed callout closing lines

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

Add after the existing `.cm-list-line` rule (around line 1061):

```css
/* Collapse the hidden closing-brace line of callout blocks */
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

The `!important` overrides are needed because the inline `style` attribute from `bodyBg` would otherwise win specificity over class-based rules. However, since we are changing the logic to NOT apply `bodyBg` when the line is hidden (see Step 3), the `!important` is a safety net only.

#### Step 3: Modify callout decoration builder to collapse hidden closing lines

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts`

Replace the closing line block (lines 319-333) with logic that:
- When cursor is NOT on the closing line: apply `Decoration.line({ class: "cm-callout-closing-hidden" })` instead of the `bodyBg` style, plus keep the existing `Decoration.replace({})` to hide the `}` text.
- When cursor IS on the closing line: apply the `bodyBg` line decoration as before (no replace, show raw `}`).

The specific change replaces lines 319-333:

```typescript
// Closing line
if (r.closed) {
  if (cursorLine !== closingLineNum) {
    // Hide: collapse the line and replace the } text
    builder.add(
      r.closingLineFrom,
      r.closingLineFrom,
      Decoration.line({ class: "cm-callout-closing-hidden" }),
    );
    if (r.closingLineFrom < r.closingLineTo) {
      builder.add(
        r.closingLineFrom,
        r.closingLineTo,
        Decoration.replace({}),
      );
    }
  } else {
    // Cursor here: show raw } with tinted background
    builder.add(
      r.closingLineFrom,
      r.closingLineFrom,
      Decoration.line({ attributes: { style: bodyBg } }),
    );
  }
}
```

#### Step 4: Verify existing tests still pass

Run `npx vitest run` from the app directory to confirm no regressions. The callout decoration tests (if any) and other editor tests should still pass since the decoration structure is the same -- only the CSS class and conditional logic around the closing line changed.

Also run: `cargo test -p brainmap-core` and `cargo test -p brainmap` to verify no Rust-side regressions (these should be unaffected).

#### Step 5: Manual testing checklist

1. Open a note with callout blocks. Verify the closing `}` line is virtually invisible (1px tall).
2. Click on text directly above/below a callout block. Verify cursor lands on the correct line.
3. Click on callout body text. Verify cursor lands accurately.
4. Place cursor on the closing `}` line (arrow keys). Verify the line expands to show `}` with tinted background.
5. Move cursor away from the closing `}` line. Verify it collapses back to 1px.
6. Test at various zoom levels (0.8, 1.0, 1.2, 1.5). Verify click accuracy.
7. Test that the general editor text feels well-spaced at `line-height: 1.7` -- not too cramped, not too airy.
8. Test folding callout blocks still works (Ctrl+Shift+[ or fold gutter).

#### What NOT to change

- **Zoom patch**: No changes. It correctly handles CSS zoom scaling.
- **Header replace decoration**: Do not add `block: true`. The inline replace with widget works correctly.
- **Callout body line decorations**: No changes to the inline `style` with `border-left` + `padding-left`. CM6 handles these via DOM measurement.
- **`padding-left: clamp(...)` on `.cm-content`**: No changes. CM6 reads this correctly from the DOM.

### Risk Assessment

- **Low risk**: The `line-height` change is purely CSS and CM6 adapts automatically.
- **Low risk**: The closing line collapse uses standard CM6 decoration APIs. The 1px height ensures CM6's height map stays valid.
- **One edge case**: If a user rapidly clicks exactly on the 1px closing line, the cursor will land on that line and the `}` will appear. This is correct behavior but could feel surprising. This is inherent to the reveal-on-cursor design and exists today too (just with a much larger click target).

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` - Change line-height from 2.1 to 1.7 and add the `.cm-callout-closing-hidden` CSS class
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts` - Modify `buildDecorations` to apply collapse class on hidden closing brace lines
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx` - Reference only; no changes needed, but important to verify the zoom patch remains compatible
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmListSpacing.ts` - Reference; the `.cm-list-line` margin-bottom pattern is analogous to the new closing-line class approach

---

