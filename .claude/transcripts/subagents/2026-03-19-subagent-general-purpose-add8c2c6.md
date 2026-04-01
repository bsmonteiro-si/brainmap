# 2026-03-19 — Subagent Transcript: general-purpose

**Date:** 2026-03-19 11:36:42
**Agent:** general-purpose
**Agent ID:** add8c2c648c857f11
**Parent Session:** 4cac2b49-c4c3-48f7-9534-fbba999734a6

---

## User

You are reviewing an implementation plan for BrainMap. Read the plan file at `/Users/bsmonteiro/.claude/plans/linear-wandering-puzzle.md` and review it according to the criteria below.

IMPORTANT: This is a frontend-only change (React + CodeMirror 6 + CSS). The Rust workspace is not involved. Evaluate accordingly.

## Review Criteria (from plan-reviewer.md):

You are reviewing an implementation plan for BrainMap, a Rust knowledge graph tool. Your job is to find real problems before code gets written.

## Project Context

- Rust workspace: `crates/core` (library), `crates/cli` (CLI), `crates/tauri-plugin` (desktop)
- Core library owns all data operations; interfaces are thin wrappers
- Files (.md with YAML frontmatter) are source of truth
- In-memory graph + SQLite FTS5 index
- Specs live in `docs/` (vision, data model, CLI spec, MCP spec, desktop, architecture, roadmap)

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

Write your review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/list-styling-review-1.md`.

For each finding:
- **Category**: one of [architecture, scope, edge-case, testing, data-model, performance, clarity]
- **Severity**: one of [blocker, should-fix, suggestion]
- **Finding**: what the problem is
- **Recommendation**: what to do instead

If you find no issues in a category, skip it. If the plan is solid, say so briefly and explain why.

Do NOT pad your review with praise or filler. Only real findings.

## Additional Context

Key files to check for existing patterns:
- `crates/app/src/stores/uiStore.ts` — SourceStyle pattern (type, options, PersistedPrefs, UIState, setter)
- `crates/app/src/components/Editor/cmBulletDecorations.ts` — current bullet widget
- `crates/app/src/components/Editor/cmListNesting.ts` — ordered list marker handling, depth detection
- `crates/app/src/components/Editor/MarkdownEditor.tsx` — how extensions are wired + dependency array
- `crates/app/src/App.css` — current list CSS
- CLAUDE.md constraint: NEVER add margin/padding to .cm-line elements

---

## Assistant



I'll read the plan file and the key context files to perform the review.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/.claude/plans/linear-wandering-puzzle.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmBulletDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmListNesting.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Let me read the relevant CSS sections and check the existing patterns more carefully.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cm-bullet|\\.md-preview.*li|list.*marker|bullet","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":3}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"bulletStyle|bulletDecorations","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"orderedList|ordered.*list|cmOrderedList","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

Now let me check how `cmListNesting.ts` detects depth (uses `INDENT = "    "` — hardcoded 4 spaces) to understand the depth detection inconsistency the plan might introduce.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"editorIndentSize|indentSize","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor","output_mode":"content"}`

---

## Assistant

Now I have everything I need. Let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/list-styling-review-1.md","content":"# Plan Review: Enhanced List Styling for Edit and Preview Modes\n\n**Reviewer**: pl`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/list-styling-review-1.md`.

**Summary of findings:**

Three **should-fix** items:

1. **Depth detection mismatch**: The plan computes bullet depth using `editorIndentSize` (configurable, default 4), but `cmListNesting.ts` hardcodes `INDENT = "    "` (always 4 spaces). When `editorIndentSize` is set to 2, bullet depth and Tab nesting depth will disagree. Either both should use the configurable value, or both should use the hardcoded 4.

2. **Ordered marker regex false positives**: The regex `/^(\s*)(\d+|[a-z]+|[ivxlcdm]+)\. /` matches normal prose starting with lowercase words (e.g., `e.g. this text`). Since decorations fire on every line (unlike `cmListNesting` which only fires on Tab), false positives will produce incorrect visual artifacts. Should restrict alpha to single chars (`[a-z]`) and short roman numerals.

3. **Missing cursor-aware tests**: The plan tests `scanBullets`/`scanOrderedMarkers` but not the `buildDecorations` function that skips the cursor line. At least one test per extension should verify decoration skipping.

Four **suggestion** items (non-blocking): extension recreation on style change is acceptable per existing patterns; preview CSS padding is safe since it's not `.cm-line`; `scanBullets` export is a minor API surface change; ordered list depth-awareness should be clarified in scope.

---

