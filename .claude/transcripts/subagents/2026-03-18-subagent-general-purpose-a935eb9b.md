# 2026-03-18 — Subagent Transcript: general-purpose

**Date:** 2026-03-18 18:00:03
**Agent:** general-purpose
**Agent ID:** a935eb9bbcfffe6ce
**Parent Session:** f804a05c-cfcf-4a1a-bc3e-b0c85c825cb1

---

## User

You are a plan reviewer for BrainMap. Review the following implementation plan using the criteria below.

## Review Criteria (from .claude/agents/plan-reviewer.md)

You are reviewing an implementation plan for BrainMap, a Rust knowledge graph tool. Your job is to find real problems before code gets written.

### Project Context
- Rust workspace: `crates/core` (library), `crates/cli` (CLI), `crates/tauri-plugin` (desktop)
- Core library owns all data operations; interfaces are thin wrappers
- Files (.md with YAML frontmatter) are source of truth
- In-memory graph + SQLite FTS5 index
- Specs live in `docs/` (vision, data model, CLI spec, MCP spec, desktop, architecture, roadmap)

### What to Review

1. **Architectural Alignment** - Does the plan respect module boundaries? Route mutations through Workspace? Avoid leaking details? Consistent with specs?

2. **Scope and Complexity** - Is the plan doing more than asked? Simpler alternatives? Premature abstractions? Dead code?

3. **Edge Cases and Risks** - Unhandled failure modes? Ordering dependencies? Interrupted implementation?

4. **Test Strategy** - Tests for each new behavior? Edge cases tested? End state verification?

5. **Data Model Impact** - Serialization compatibility? Backward-compatible new fields? Seed dataset impact?

### Output Format
Write your review as a list of findings. For each:
- **Category**: one of [architecture, scope, edge-case, testing, data-model, performance, clarity]
- **Severity**: one of [blocker, should-fix, suggestion]
- **Finding**: what the problem is
- **Recommendation**: what to do instead

If you find no issues in a category, skip it. If the plan is solid, say so briefly. Do NOT pad with praise or filler.

---

## Plan to Review

# Plan: Add `/example` Callout Type (Block + Inline)

## Context
The editor has 4 callout types (ai-answer, source, question, key-insight) and one inline citation type (`[!source ...]`). The user wants a new **example** callout that works as both a block callout (`[!example] { ... }`) and an inline type (`[!example content]`), following the same patterns as source.

## Design Decisions
- **Icon**: `FlaskConical` from lucide-react (already installed v0.577.0)
- **Color**: `#17a2b8` (teal/cyan — distinct from existing blue/orange/purple/green)
- **Inline display**: Monospace font with teal border-bottom and "example" tag badge
- **Generalize remarkInlineSource**: Extend the existing plugin to handle both `[!source ...]` and `[!example ...]` via regex alternation

## Steps

### 1. Register example in callout type registry
**File**: `crates/app/src/components/Editor/calloutTypes.ts`
- Import `FlaskConical` from lucide-react
- Add to `CALLOUT_TYPES`: `example: { color: "#17a2b8", label: "Example", Icon: FlaskConical }`
- Auto-propagates to toolbar picker and block callout slash commands

### 2. Add FlaskConical SVG paths for editor decorations
**File**: `crates/app/src/components/Editor/cmCalloutDecorations.ts`
Add to `CALLOUT_ICON_PATHS` with verified paths from lucide v0.577.0.

### 3. Add slash menu support (inline + icon paths)
**File**: `crates/app/src/components/Editor/cmSlashCommands.ts`
- Add `"flask-conical"` to `ICON_PATHS`
- Add to `CALLOUT_ICON_MAP`: `example: "flask-conical"`
- Add inline example command in "BrainMap" section
- Fix keyword collision: extend the `source-callout` pattern to also handle example

### 4. Generalize remarkInlineSource for multiple inline types
**File**: `crates/app/src/components/Editor/remarkInlineSource.ts`
- Replace hardcoded regex with: `new RegExp("\\[!(source|example)\\s+([^\\]]+)\\]", "g")`
- Update `transformPhrasing` to use capture group 1 as type, group 2 as content
- HTML output: `<span class="inline-${type}"><span class="inline-${type}-tag">${type}</span>${escapeHtml(content)}</span>`

### 5. Add CSS styles for inline example
**File**: `crates/app/src/App.css`

### 6. Update tests
- `remarkInlineSource.test.ts` — new inline example tests
- `cmSlashCommands.test.ts` — bump STATIC_COMMAND_COUNT, add example assertions

## No Changes Needed
- `EditorToolbar.tsx` — auto-iterates `CALLOUT_TYPE_ENTRIES`
- `MarkdownPreview.tsx` — already uses `remarkInlineSource` plugin
- `calloutPreprocess.ts` — regex already matches any `[!word]` pattern

---

Write your findings to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/add-example-callout-review-1.md`.

---

## Assistant



I'll review this plan by first examining the relevant source files to verify the plan's assumptions.

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

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts"}`

---

## Assistant

Now let me check the existing tests and the "No Changes Needed" claim about `calloutPreprocess.ts`.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/remarkInlineSource.test.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/calloutPreprocess.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/cmSlashCommands.test.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutPreprocess.ts"}`

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

Now I have enough context to write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/add-example-callout-review-1.md","content":"# Plan Review: Add `/example` Callout Type (Block + Inline)\n\n**Reviewer**:`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/add-example-callout-review-1.md`.

**Summary of findings:**

- **3 should-fix items:**
  1. **Keyword collision** -- The plan must explicitly specify how to remap `example` to `example-callout` in the CALLOUT_TYPE_ENTRIES mapping (mirroring the `source`/`source-callout` pattern), and update the `_calloutType` resolution in `createSlashAutocompletion` to handle `"example-callout"`.
  2. **Symmetric negative test** -- The generalized regex in `remarkInlineSource.ts` needs a test for `[!exampletext]` (no space) to match the existing `[!sourcetext]` negative test.
  3. **STATIC_COMMAND_COUNT** -- Should explicitly state the new value is 13 (was 12).

- **2 suggestions (non-blocking):**
  1. Consider renaming `remarkInlineSource.ts` to something like `remarkInlineCitation.ts` since it now handles multiple inline types.
  2. Consider adding a smoke test that `scanCallouts` and `getCalloutColor` work for the new `example` type.

- **1 confirmation:** The "No Changes Needed" claim about `calloutPreprocess.ts` is verified correct.

No blockers found. The plan is solid overall.

---

