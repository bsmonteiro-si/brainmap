# 2026-03-16 — Subagent Transcript: general-purpose

**Date:** 2026-03-16 18:55:56
**Agent:** general-purpose
**Agent ID:** aa6de43ebb039b2b6
**Parent Session:** ba937460-6ac5-4fd4-bdf4-15b4faad1bee

---

## User

You are reviewing an implementation plan for BrainMap. Here is the plan:

---
# Plan: Add list line spacing via block widget decorations

## Context

List items in the CodeMirror editor are too tightly packed compared to Preview mode. The current approach uses `margin-bottom: 0.12em` on `.cm-list-line` in CSS, which directly violates the CLAUDE.md rule about never adding margin/padding to `.cm-line` elements (it breaks mouse hit-testing). The spacing also isn't enough.

The fix: replace the CSS margin with block widget decorations (the same pattern used by `CalloutSpacerWidget` in `cmCalloutDecorations.ts`), which CM6 includes in its height map so mouse hit-testing stays correct.

## Changes

### 1. `crates/app/src/components/Editor/cmListSpacing.ts`

Replace the simple line decoration approach with block widget spacers:

- Add a `ListSpacerWidget` class (like `CalloutSpacerWidget`): renders a `<div>` with ~4px height, `estimatedHeight` getter returns 4.
- In `buildDecorations()`, after each list line, add a `Decoration.widget({ widget: new ListSpacerWidget(), block: true, side: 1 })` below the line.
- Keep the `cm-list-line` line decoration class (used for styling the bullet widgets, etc.) — just remove the reliance on CSS margin for spacing.
- Add a spacer widget after every list line for breathing room between items (~4px).

### 2. `crates/app/src/App.css` (line 1091)

Remove the `margin-bottom: 0.12em` rule from `.cm-list-line` — it violates the CM6 spacing rule and is being replaced by the widget approach.

### 3. `line-height` consideration

The base `line-height: 1.7` in `.cm-content` applies globally. We could increase it, but the user said paragraphs already have big line breaks and shouldn't be affected. So we only target list items.

## Files to modify

- `crates/app/src/components/Editor/cmListSpacing.ts` — add block widget spacer
- `crates/app/src/App.css:1091` — remove margin-bottom rule

## Verification

1. `cd crates/app && npx vitest run` — ensure no test regressions
2. Open the app, navigate to a note with lists, verify spacing in Edit mode
3. Click on list items to verify mouse hit-testing still works correctly
4. Check paragraphs are unaffected
5. Check callout spacing still works (no interaction)
---

Here are the review criteria:

## What to Review

### 1. Architectural Alignment
- Does the plan respect the existing module boundaries? (parser, graph, index, workspace, config)
- Does it route mutations through `Workspace` as the orchestration layer?
- Does it avoid leaking implementation details across module boundaries?
- Is it consistent with the specs in `docs/`?

### 2. Scope and Complexity
- Is the plan doing more than what was asked? Flag any scope creep.
- Are there simpler alternatives to what's proposed?
- Are abstractions justified or premature? Three similar lines is better than an unnecessary abstraction.
- Does it avoid backwards-compatibility hacks or dead code?

### 3. Edge Cases and Risks
- What failure modes are unhandled? (disk full, concurrent access, invalid UTF-8, path traversal)
- Are there ordering dependencies between steps that aren't called out?
- What happens if the implementation is interrupted halfway?

### 4. Test Strategy
- Does the plan include tests for each new behavior?
- Are edge cases and error paths tested, not just happy paths?
- Do tests verify end state (classic approach), not just mock interactions?

### 5. Data Model Impact
- Do changes to types break serialization compatibility with existing workspaces?
- Are new fields backward-compatible (optional, with defaults)?
- Does the plan account for the seed dataset still passing?

## Output Format

Write your review as a list of findings. For each finding:
- **Category**: one of [architecture, scope, edge-case, testing, data-model, performance, clarity]
- **Severity**: one of [blocker, should-fix, suggestion]
- **Finding**: what the problem is
- **Recommendation**: what to do instead

If you find no issues in a category, skip it. If the plan is solid, say so briefly and explain why.

Do NOT pad your review with praise or filler. Only real findings.

Write the review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/list-spacing-widget-review-1.md`

---

## Assistant



I'll review the plan by first examining the relevant source files to understand the current implementation.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmListSpacing.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cm-list-line","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","-n":true}`

---

## Assistant

Now let me check if there are existing tests for this module and look at the CSS line more closely.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cmListSpacing|listSpacing","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1085,"limit":15}`

---

## Assistant

I notice the `.cm-hr-line` also has margin-bottom — that's the same violation but not in scope for this plan. Now I have enough context to write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/list-spacing-widget-review-1.md","content":"# Plan Review: Add list line spacing via block widget decorations\n\n**Revie`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/list-spacing-widget-review-1.md`.

**Summary of findings:**

- **2 should-fix items:**
  1. Spacers should only be inserted *between* consecutive list lines, not after every list line unconditionally. Adding one after the last list item or at list-to-paragraph boundaries creates unwanted gaps.
  2. No unit tests are proposed. The plan should include tests for `buildDecorations` output (spacer positions for consecutive items, empty docs, mixed content) and `estimatedHeight` consistency.

- **3 suggestions:**
  - `.cm-hr-line` in App.css has the same margin violation -- worth a follow-up task.
  - The `ViewPlugin` approach is fine but worth a comment noting `StateField` as a fallback if scroll glitches appear.
  - Pin the spacer height to an exact value (not "~4px") and ensure `estimatedHeight` matches.

---

