# 2026-03-16 — Subagent Transcript: general-purpose

**Date:** 2026-03-16 17:14:35
**Agent:** general-purpose
**Agent ID:** a6160f7762deae4b2
**Parent Session:** ace20328-a0ad-4593-a8e0-9c5670a209e5

---

## User

You are reviewing an implementation plan for BrainMap, a Rust knowledge graph tool. Your job is to find real problems before code gets written.

## Project Context

- Rust workspace: `crates/core` (library), `crates/cli` (CLI), `crates/tauri-plugin` (desktop)
- Core library owns all data operations; interfaces are thin wrappers
- Files (.md with YAML frontmatter) are source of truth
- In-memory graph + SQLite FTS5 index
- Specs live in `docs/` (vision, data model, CLI spec, MCP spec, desktop, architecture, roadmap)

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

---

## PLAN TO REVIEW

# Plan: Polish Edit-Mode Callout Blocks to Match Preview

## Context

Edit-mode callout blocks (QUESTION, SOURCE, etc.) look noticeably less polished than Preview mode. Preview renders callouts as contained "cards" with subtle borders, rounded corners, and proper spacing. Edit mode applies flat line-by-line inline styles with only a left border, no right/top/bottom borders, less padding, and no visual separation from surrounding text. The goal is to bring edit-mode callouts closer to the preview look while preserving CodeMirror editing behavior.

## Key Gaps

| Aspect | Preview | Edit | Fix |
|--------|---------|------|-----|
| Right/top/bottom borders | 1px at 15% opacity | None | Add via CSS classes |
| Right-side border-radius | 0 6px 6px 0 | None | First/last line radius |
| Body padding-left | 16px | 8px | Increase to 14px |
| Body background | 5% color | 6% color | Lower to 5% |
| Header background | ~8% currentColor | 8% color | Lower to 8% |
| Vertical spacing | margin 0.75em 0 1em | None | Padding on first/last lines |

## Implementation

### Step 1: Replace inline styles with CSS classes in `cmCalloutDecorations.ts`

**File:** `crates/app/src/components/Editor/cmCalloutDecorations.ts` — `buildDecorations()` function (lines 280-358)

- Remove `headerBg` and `bodyBg` inline style constants (lines 289-290)
- Create helper:
  ```ts
  const lineDeco = (classes: string, color: string) =>
    Decoration.line({ attributes: { class: classes, style: `--callout-color: ${color};` } });
  ```
- Assign CSS classes per line role:
  - **Header line:** `cm-callout-line cm-callout-header` (+ `cm-callout-last` if no body)
  - **Body lines:** `cm-callout-line cm-callout-body` (+ `cm-callout-last` on final visible line)
  - **Closing brace (visible):** `cm-callout-line cm-callout-body cm-callout-last`
- Edge case: when cursor is on closing brace, it becomes `cm-callout-last`; the body line before it does NOT get `cm-callout-last`

### Step 2: Add callout line styles to `baseTheme` in `cmCalloutDecorations.ts`

Extend the existing `baseTheme` object (line 423) with:

```ts
".cm-callout-line": {
  borderLeft: "3px solid var(--callout-color)",
  borderRight: "1px solid color-mix(in srgb, var(--callout-color) 15%, transparent)",
  paddingLeft: "14px",
  background: "color-mix(in srgb, var(--callout-color) 5%, transparent)",
},
".cm-callout-header": {
  background: "color-mix(in srgb, var(--callout-color) 8%, transparent)",
  borderTop: "1px solid color-mix(in srgb, var(--callout-color) 15%, transparent)",
  borderTopRightRadius: "6px",
  paddingTop: "6px",
},
".cm-callout-last": {
  borderBottom: "1px solid color-mix(in srgb, var(--callout-color) 15%, transparent)",
  borderBottomRightRadius: "6px",
  paddingBottom: "8px",
},
".cm-callout-header.cm-callout-last": {
  borderRadius: "0 6px 6px 0",
},
```

### Step 3: Add CSS overrides in `App.css` if needed

If `baseTheme` padding/margins don't render correctly on CodeMirror `.cm-line` elements, add fallback rules in `App.css` (after line ~1091):

```css
.editor-body .cm-editor .cm-callout-header { padding-top: 6px; }
.editor-body .cm-editor .cm-callout-last { padding-bottom: 8px; }
```

### Step 4: Edge cases

- **Empty callouts** (no body): header gets both `cm-callout-header` and `cm-callout-last`
- **Unclosed callouts**: last body line gets `cm-callout-last`
- **Cursor on closing brace**: brace line is `cm-callout-last`, previous body line is plain `cm-callout-body`

## Files to Modify

- `crates/app/src/components/Editor/cmCalloutDecorations.ts` — core changes
- `crates/app/src/App.css` — fallback spacing if needed

## Reference Files (read-only)

- `crates/app/src/App.css:1903-1943` — Preview callout CSS to match
- `crates/app/src/components/Editor/MarkdownPreview.tsx` — Preview callout rendering

## Verification

1. Run `npm run dev` from `crates/app/`
2. Open a note with callout blocks (QUESTION, SOURCE)
3. Verify in Edit mode:
   - Card-like appearance with right/top/bottom borders
   - Rounded corners on right side
   - Vertical spacing above/below callout blocks
   - Cursor on header shows raw syntax with full styling
   - Cursor on closing `}` shows it with styling
   - Empty and unclosed callouts render correctly
4. Compare side-by-side with Preview mode — should look similar
5. Run `npx vitest run` to ensure no test regressions

---

Write your review to: `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/callout-styling-review-1.md`

---

## Assistant



I'll review the plan by first reading the relevant source files to understand the current implementation.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1890,"limit":60}`

---

## Assistant

Now I have the full picture of both the current implementation and the preview CSS. Let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/callout-styling-review-1.md","content":"# Plan Review: Polish Edit-Mode Callout Blocks to Match Preview\n\n**Reviewer:**`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/callout-styling-review-1.md`.

**Summary of findings:**

- **3 should-fix items:**
  1. The `cm-callout-last` class assignment logic around the hidden vs. visible closing brace is ambiguous -- needs explicit branching rules for when the cursor is/isn't on the closing brace.
  2. Header-only callouts need different `cm-callout-last` behavior depending on whether the closing brace is hidden or cursor-revealed (the plan conflates these cases).
  3. Vertical spacing (margin between callout and surrounding text) is listed as a gap to fix but the proposed CSS only adds internal padding, not external separation. The plan should either accept this limitation or propose a widget-based spacer.
  4. No automated tests for the new class assignment logic in `buildDecorations`.

- **2 suggestions:** Defensive border-radius values; `color-mix` support is fine (already established).

- **No blockers.** The core approach (inline styles to CSS classes with `--callout-color` custom property) is sound and well-scoped.

---

