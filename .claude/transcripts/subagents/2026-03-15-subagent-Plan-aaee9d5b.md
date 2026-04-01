# 2026-03-15 — Subagent Transcript: Plan

**Date:** 2026-03-15 19:44:31
**Agent:** Plan
**Agent ID:** aaee9d5bcb81f9f87
**Parent Session:** 72e886c4-7b7a-48a8-9676-c351eccd87cb

---

## User

Plan a fix for visual table misalignment in BrainMap's CodeMirror editor.

## Problem

When the cursor is inside a markdown table, the editor shows raw markdown with line decorations. The pipes are visually misaligned even though the `formatTable()` function correctly pads cells with spaces.

Root cause: `.cm-table-header` CSS has `font-weight: 600` which makes header characters wider than data row characters in monospace fonts, breaking the space-based column alignment.

The `formatTable()` function in `tableFormatter.ts` uses `String.prototype.padEnd()` / `String.prototype.padStart()` to pad cells to the max column width. This works perfectly when ALL rows use the same monospace font at the same weight. But the header row gets `font-weight: 600` via CSS, making its characters visually wider.

## Files involved

1. `crates/app/src/App.css` (lines 1105-1122) — table line CSS styles:
   - `.cm-table-line` — monospace font-family, 0.92em font-size
   - `.cm-table-header` — background + **font-weight: 600** (the culprit)
   - `.cm-table-delimiter` — muted color + opacity
   - `.cm-table-row` / `.cm-table-row-even` — alternating backgrounds

2. `crates/app/src/components/Editor/cmMarkdownDecorations.ts` (line 257) — defines `tableHeaderDeco` line decoration

3. `crates/app/src/components/Editor/tableFormatter.ts` — the formatter (works correctly, no changes needed)

## Proposed fix

1. Remove `font-weight: 600` from `.cm-table-header` CSS — this is the primary fix
2. Instead, differentiate the header visually using a stronger background color and possibly a bottom border (it already has a background)
3. Optionally, add `font-variant-numeric: tabular-nums` to `.cm-table-line` for consistent number widths

The format functions themselves are correct and don't need changes. The HTML widget rendering (when cursor is outside) uses proper `<table>` markup which doesn't have this problem.

## Constraints
- Must still visually distinguish header from data rows (background color is sufficient)
- All table lines must use the same font-weight for space-based alignment to work
- Should keep the monospace font family and font-size unchanged

Please provide a detailed implementation plan.

---

## Assistant



I'll explore the relevant files to understand the current state and design a precise fix.

Let me examine the CSS and decoration code.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1095,"limit":40}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cm-table","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"tableHeaderDeco","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts","output_mode":"content","-C":3}`

---

## Assistant

Let me also check the rendered table widget's header styling for reference on how header differentiation is done there.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1130,"limit":20}`

---

## Assistant

Now let me check existing tests related to table formatting/decorations to understand test expectations.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cm-table-header","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","-n":true}`

---

## Assistant

Good -- the class is only referenced in two places: the CSS definition and the decoration constant. No tests reference the class name or font-weight directly.

Here is the implementation plan.

---

## Implementation Plan: Fix Table Header Misalignment

### Problem

When editing a markdown table in CodeMirror (cursor inside the table), the raw markdown is shown with line decorations. The header row gets `.cm-table-header` which applies `font-weight: 600`. Since `padEnd()`/`padStart()` alignment assumes uniform character width, the bolder (and thus wider) header characters break visual column alignment even in a monospace font.

The rendered `<table>` widget (cursor outside) is unaffected because HTML table cells have independent widths.

### Root Cause

Line 1111 in `App.css`: `font-weight: 600` on `.cm-table-header`.

### Fix (single file change)

**File: `crates/app/src/App.css`, lines 1109-1112**

Replace the `.cm-table-header` rule:

```css
/* BEFORE */
.editor-body .cm-editor .cm-table-header {
  background: var(--bg-secondary);
  font-weight: 600;
}

/* AFTER */
.editor-body .cm-editor .cm-table-header {
  background: var(--bg-secondary);
  border-bottom: 2px solid var(--border-color);
}
```

Changes:
1. **Remove `font-weight: 600`** -- this is the fix. All table lines now render at the same font weight, so space-based padding aligns correctly.
2. **Add `border-bottom: 2px solid var(--border-color)`** -- provides a clear visual separator between the header and delimiter/data rows, compensating for the lost bold emphasis. Combined with the existing `background: var(--bg-secondary)`, the header row remains visually distinct.

Optionally, also add `font-variant-numeric: tabular-nums` to the `.cm-table-line` rule for consistent number widths across fonts:

```css
.editor-body .cm-editor .cm-table-line {
  font-family: ui-monospace, 'Menlo', 'Monaco', 'Consolas', monospace !important;
  font-size: 0.92em !important;
  font-variant-numeric: tabular-nums;
}
```

This is a minor enhancement -- monospace fonts typically already have uniform number widths, but `tabular-nums` guarantees it for any fallback font that might not.

### What does NOT change

- **`tableFormatter.ts`** -- the formatting logic is correct; no changes needed.
- **`cmMarkdownDecorations.ts`** -- the line decoration class names remain the same (`cm-table-line cm-table-header`).
- **Widget table styling** (`.cm-table-widget th`) -- the rendered HTML table keeps `font-weight: 600` because HTML table layout handles variable-width characters correctly. This is intentional and should remain.

### Testing

1. **Manual verification**: Open a note with a formatted markdown table, place the cursor inside it, and confirm columns align between header and data rows.
2. **Existing tests**: The 592 Vitest tests should continue to pass since no logic or class names change -- only CSS properties are modified.
3. **Visual regression check**: Verify the header row is still visually distinguishable (background color + bottom border should be sufficient).

### Risk Assessment

**Extremely low risk.** This is a CSS-only change affecting two properties in one selector. No logic, no TypeScript, no Rust changes. The fix is mechanically simple: remove the property causing the misalignment and add a non-intrusive visual replacement.

---

### Critical Files for Implementation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` - The only file to modify: remove `font-weight: 600` from `.cm-table-header` (line 1111), add `border-bottom`, optionally add `font-variant-numeric: tabular-nums` to `.cm-table-line`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts` - Context: defines the `tableHeaderDeco` line decoration that applies the CSS class (no changes needed, but confirms the class name)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/tableFormatter.ts` - Context: the formatter that pads cells with spaces (no changes needed, confirms the alignment approach)

---

