# 2026-03-19 — Subagent Transcript: general-purpose

**Date:** 2026-03-19 11:02:03
**Agent:** general-purpose
**Agent ID:** a0d50b957d17434ac
**Parent Session:** 69132e9c-233d-4f02-853b-992996f9b01d

---

## User

You are reviewing an implementation plan for BrainMap. Here is the plan reviewer agent definition you must follow:

---
# Plan Reviewer Agent

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

Here is the plan to review:

# Plan: Add `attention` block callout and `inline-attention` inline citation

## Context

The user wants a new callout type — `attention` — following the same pattern as `source`/`inline-source`. This means both a block callout (`[!attention] Title { ... }`) and an inline citation (`[!attention some text]`), sharing the same settings, style options, and rendering pipeline.

## Icon & Color

- **Icon**: `TriangleAlert` from lucide-react (⚠ triangle with exclamation mark)
- **Color**: `#dc3545` (red)

## Files to Modify

### 1. `crates/app/src/components/Editor/calloutTypes.ts`
- Import `TriangleAlert` from `lucide-react`
- Add `attention` entry to `CALLOUT_TYPES`

### 2. `crates/app/src/components/Editor/cmCalloutDecorations.ts` (line ~33)
- Add SVG icon paths for `attention` in `CALLOUT_ICON_PATHS`

### 3. `crates/app/src/components/Editor/remarkInlineSource.ts`
- Add `"attention"` to `INLINE_TYPES` array

### 4. `crates/app/src/components/Editor/cmMarkdownDecorations.ts`
- Update `INLINE_CITATION_RE` regex to include `attention`
- Add mark decorations for attention
- Update mark selection logic — extend ternary chain or switch to lookup map

### 5. `crates/app/src/stores/uiStore.ts`
- Add `AttentionStyle` type and `ATTENTION_STYLE_OPTIONS`
- Add to `PersistedPrefs` interface
- Add store state + action

### 6. `crates/app/src/App.tsx`
- Add `useEffect` for `data-attention-style` attribute

### 7. `crates/app/src/components/Settings/SettingsModal.tsx`
- Add "Attention citations" setting row

### 8. `crates/app/src/App.css`
- Add 4 editor inline style blocks scoped by `[data-attention-style]`
- Add preview inline styles `.inline-attention` and `.inline-attention-tag`

### 9. Tests
- Add tests to `remarkInlineSource.test.ts`
- Add CM decoration tests if applicable

## Verification
1. `cargo test`
2. `npx vitest run`
3. Manual testing of block + inline callouts
4. Settings style switching
5. `./scripts/check.sh`

Please read the relevant source files to validate this plan against the actual codebase. Write your review to `.claude/reviews/plans/attention-callout-review-1.md`.

---

## Assistant



I'll review the plan by examining the relevant source files to validate the proposed changes against the actual codebase.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutTypes.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkInlineSource.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

Now let me check the remaining files mentioned in the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx","limit":50}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"data-source-style|data-example-style|data-math-style","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"data-source-style|data-example-style|data-math-style","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","output_mode":"content","-C":3}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"sourceStyle|exampleStyle|mathStyle","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx","output_mode":"content","-C":2}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"inline-source|inline-example|inline-math","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":1,"head_limit":40}`

---

## Assistant

Let me also check the existing test files and the link skip logic more carefully.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\[!source.*\\[!example.*\\[!math","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"startsWith.*\\[!","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cm-source-style|cm-example-style|cm-math-style|cm-source-tag|cm-source-content|cm-source-bracket","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":`

---

## Assistant

Now I have a thorough understanding of the codebase. Let me check the test files briefly.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/remarkInlineSource.test.ts"}`

---

## Assistant

Now let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/attention-callout-review-1.md","content":"# Plan Review: Add `attention` block callout and `inline-attention` inline cit`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/attention-callout-review-1.md`.

**Findings summary:**

1. **should-fix (edge-case)**: The plan is missing a required update to the Link skip-range guard at line 392 of `cmMarkdownDecorations.ts`. The condition `!linkText.startsWith("[!source") && !linkText.startsWith("[!example") && !linkText.startsWith("[!math")` must also include `&& !linkText.startsWith("[!attention")`, otherwise inline attention citations inside Link syntax-tree nodes will be incorrectly skipped.

2. **suggestion (scope)**: The proposed color `#dc3545` is very close to the existing math callout color `#e74c3c` -- both are red. Worth a conscious decision on whether to differentiate.

3. **suggestion (clarity)**: The ternary chain for mark selection (lines 436-438) is already 3 levels deep. With a 4th type, a lookup map would be cleaner and more maintainable.

4. **suggestion (testing)**: The plan's test coverage for CM decorations should be more specific rather than "if applicable."

---

