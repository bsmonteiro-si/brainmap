# 2026-03-14 — Subagent Transcript: general-purpose

**Date:** 2026-03-14 14:35:07
**Agent:** general-purpose
**Agent ID:** afafa1ee5f29aa785
**Parent Session:** 312e15c5-30bb-431e-ba48-5fb3c6c3e140

---

## User

Review the following code changes for correctness, quality, and potential issues. Write your feedback to `.claude/reviews/code/callout-statefield-review-1.md`.

Read `.claude/agents/code-reviewer.md` for the full review criteria.

## Changed File

`crates/app/src/components/Editor/cmCalloutDecorations.ts` — Three changes:

1. **Imports**: Removed `ViewPlugin`/`ViewUpdate`, added `StateField`:
   ```typescript
   import { EditorView, Decoration, WidgetType, type DecorationSet } from "@codemirror/view";
   import { RangeSetBuilder, StateField, type Text, type Extension } from "@codemirror/state";
   ```

2. **ViewPlugin→StateField conversion**: Replaced the `CalloutDecorationPlugin` class and `calloutViewPlugin` with:
   ```typescript
   const calloutField = StateField.define<{ ranges: CalloutRange[]; decos: DecorationSet }>({
     create(state) {
       const ranges = scanCallouts(state.doc);
       const cursorLine = state.doc.lineAt(state.selection.main.head).number;
       return { ranges, decos: buildDecorations(ranges, state.doc, cursorLine) };
     },
     update(value, tr) {
       if (!tr.docChanged && !tr.selection) return value;
       const ranges = tr.docChanged ? scanCallouts(tr.state.doc) : value.ranges;
       const cursorLine = tr.state.doc.lineAt(tr.state.selection.main.head).number;
       return { ranges, decos: buildDecorations(ranges, tr.state.doc, cursorLine) };
     },
     provide: (f) => EditorView.decorations.from(f, (v) => v.decos),
   });
   ```

3. **Widget vertical-align**: Added `wrapper.style.verticalAlign = "middle"` to the `CalloutHeaderWidget.toDOM()` method.

4. **Export**: Changed `calloutViewPlugin` → `calloutField` in the extension array.

## Context

This fixes callout click accuracy. ViewPlugin decorations are applied after CM6's initial DOM render, potentially causing stale height maps. StateField decorations participate in the initial render pass, keeping height maps in sync. The `vertical-align: middle` prevents baseline alignment from causing unexpected line height.

Read the full file to verify correctness in context.

---

## Assistant



I'll start by reading the code reviewer agent definition and the changed file.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/agents/code-reviewer.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts"}`

---

## Assistant

Now let me check if there are tests for this file and look at how `tr.selection` behaves.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cmCalloutDecorations","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.test.ts"}`

---

## Assistant

Now I have all the context needed. Let me write the review.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"mkdir -p /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code","description":"Create reviews directory"}`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/callout-statefield-review-1.md","content":"# Code Review: cmCalloutDecorations.ts — ViewPlugin to StateField migration\n\`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/callout-statefield-review-1.md`.

**Key findings:**

1. **should-fix**: The `update` guard `if (!tr.docChanged && !tr.selection) return value` does not check whether the cursor actually moved to a different line. Same-line cursor movements (arrow keys within a line) trigger a full `buildDecorations` rebuild unnecessarily. Fix: cache `cursorLine` in the state value and compare before rebuilding.

2. **suggestion**: Full document rescan on every doc change is fine at current note sizes but could be optimized later.

3. **suggestion**: No test coverage for the `calloutField` StateField or `buildDecorations` — only `scanCallouts` is tested. Adding EditorState-level tests would catch decoration regressions.

Overall the migration is correct and well-implemented. The StateField approach properly participates in CM6's initial render pass, fixing the height-map desync.

---

