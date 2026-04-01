# 2026-03-20 — Subagent Transcript: general-purpose

**Date:** 2026-03-20 15:01:29
**Agent:** general-purpose
**Agent ID:** a69323e73be821ffe
**Parent Session:** 03338391-a7ed-4136-8e14-ffc6fba3a09a

---

## User

You are reviewing an implementation plan for BrainMap. Here is the plan reviewer agent definition - follow these review criteria exactly:

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

---
# IntelliJ-like Code Block Rendering

## Context

Code blocks in the editor show plain monochrome text instead of language-aware syntax highlighting. The user wants IntelliJ-level rendering: colored tokens by language, clean presentation. This affects both Edit (CodeMirror) and Preview (React Markdown) modes.

## Root Cause (Edit Mode — Critical Bug)

In `MarkdownEditor.tsx:147-148`:
```typescript
syntaxHighlighting(buildMarkdownHighlight(isDark)),          // → highlighterFacet
syntaxHighlighting(isDark ? oneDarkHighlightStyle : defaultHighlightStyle, { fallback: true }),  // → fallbackHighlighter
```

CM6's `getHighlighters()` returns `highlighterFacet` entries if non-empty, **never consulting fallback**. Since `buildMarkdownHighlight` is non-fallback, the code theme (`oneDarkHighlightStyle`) is never used. `buildMarkdownHighlight` only defines heading/emphasis/strong/monospace — zero code token rules. Result: no syntax colors in code blocks.

## Plan

### Step 1: Fix CM6 fallback bug
**File**: `crates/app/src/components/Editor/MarkdownEditor.tsx` (line 148)

Remove `{ fallback: true }` so both highlight styles go into `highlighterFacet` and are unioned:
```typescript
syntaxHighlighting(isDark ? oneDarkHighlightStyle : defaultHighlightStyle),
```

### Step 2: Remove `!important` on `.cm-editor` color
**File**: `crates/app/src/App.css` (line 1087)

Change `color: var(--text-primary) !important` → `color: var(--text-primary)`. The `!important` is defensive but shouldn't block child `<span>` rules. Remove it to be safe.

### Step 3: Fix hljs CSS selectors for compound classes
**File**: `crates/app/src/App.css` (lines 2788-2789)

highlight.js generates `class="hljs-title function_"` (two classes), not a class with a literal dot. Fix:
```css
/* Before: */ .hljs-title\.class_,  .hljs-title\.function_
/* After:  */ .hljs-title.class_,   .hljs-title.function_
```

### Step 4: Add syntax color CSS variables per theme
**File**: `crates/app/src/App.css` — all 8 theme blocks

Add `--syntax-keyword`, `--syntax-string`, `--syntax-comment`, `--syntax-number`, `--syntax-function`, `--syntax-type`, `--syntax-variable`, `--syntax-meta`, `--syntax-symbol` to each theme with colors that match the theme's palette (e.g., Dracula purple for keywords in Dracula theme, Nord blue-greens for Nord, etc.).

Update hljs rules (lines 2776-2801) to use these variables instead of `color-mix`:
```css
.hljs-keyword, .hljs-selector-tag, .hljs-built_in { color: var(--syntax-keyword); }
.hljs-string, .hljs-attr, .hljs-addition { color: var(--syntax-string); }
/* etc. */
```

### Step 5: Add line numbers in preview code blocks
**File**: `crates/app/src/components/Editor/MarkdownPreview.tsx` (lines 275-291)

In the `pre` component override, extract text content, count lines, and render a line-number gutter alongside the code:
```tsx
<div className="code-block-wrapper">
  <span className="code-lang-badge">{lang}</span>
  <div className="code-block-inner">
    <div className="code-line-numbers">{lineNumberElements}</div>
    <pre {...props}>{children}</pre>
  </div>
</div>
```

**File**: `crates/app/src/App.css` — add CSS for `.code-block-inner` (flex row) and `.code-line-numbers` (right-aligned, muted, monospace, border-right, matching line-height).

### Step 6: Add copy button in preview code blocks
**File**: `crates/app/src/components/Editor/MarkdownPreview.tsx`

Add a "Copy" button (appears on hover) in `.code-block-wrapper`. On click → `navigator.clipboard.writeText()`. Brief "Copied!" feedback via local state.

**File**: `crates/app/src/App.css` — style copy button (absolute position, opacity 0 → 1 on wrapper hover).

## Files to Modify

| File | Changes |
|------|---------|
| `crates/app/src/components/Editor/MarkdownEditor.tsx` | Remove `{ fallback: true }` (Step 1) |
| `crates/app/src/App.css` | Remove `!important` (Step 2), fix hljs selectors (Step 3), add syntax vars (Step 4), line number + copy button CSS (Steps 5-6) |
| `crates/app/src/components/Editor/MarkdownPreview.tsx` | Line numbers (Step 5), copy button (Step 6) |

## Verification

1. Open notes with code blocks in JSON, Rust, Python, TypeScript, SQL, bash
2. **Edit mode**: Verify syntax colors appear (keywords, strings, comments distinguishable)
3. **Preview mode**: Verify hljs highlighting + line numbers + copy button
4. Test all 8 themes (light, dark, dracula, solarized-light/dark, nord, tokyo-night, one-dark)
5. Verify Mermaid diagrams still render correctly
6. Verify inline code styling unchanged
7. Run `npx vitest run` for existing tests
---

Write your review to `.claude/reviews/plans/code-block-rendering-review-1.md`. Be thorough but concise.

---

## Assistant



I'll review the plan by first examining the relevant source files to validate the claims made in the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx","offset":140,"limit":20}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1080,"limit":20}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx","offset":265,"limit":40}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":2775,"limit":35}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"buildMarkdownHighlight","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"buildMarkdownHighlight","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"buildMarkdownHighlight","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx","offset":59,"limit":30}`

---

## Assistant

Now I have enough context. Let me also quickly check how many themes exist and the CSS file length.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\[data-theme=\"","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"wc -l /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","description":"Count lines in App.css"}`

---

## Assistant

Now I have all the context needed for a thorough review. Let me write the review file.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/code-block-rendering-review-1.md","content":"# Plan Review: IntelliJ-like Code Block Rendering\n\n## Summary\n\nThe plan`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/code-block-rendering-review-1.md`.

**Key findings (7 total):**

1. **Blocker** (Finding #4): The CSS selector fix in Step 3 changes `.hljs-title\.class_` to `.hljs-title.class_` -- these have completely different semantics (escaped dot vs compound class). The fix is likely correct for modern hljs output, but must be verified against actual DOM output before changing.

2. **Should-fix** (Finding #1): Steps 5-6 (line numbers + copy button) are scope creep -- the user asked for syntax highlighting, not these features. Remove them.

3. **Should-fix** (Finding #2): The plan's claim that CM6 "unions" two non-fallback highlighters is imprecise. CM6 uses first-match ordering, which happens to work here but needs a code comment explaining the ordering dependency.

4. **Should-fix** (Finding #3): Removing `!important` from `.cm-editor color` (Step 2) is unnecessary and risks regression. Parent `!important` does not block child span colors.

5. **Should-fix** (Finding #5): Adding 72 new CSS variable declarations (9 vars x 8 themes) is over-engineered. The existing `color-mix` approach should be tried first after fixing the selector bug.

6. **Should-fix** (Finding #6): No automated tests proposed -- at minimum a Vitest test should verify the CM6 extension configuration avoids the fallback bug.

7. **Suggestion** (Finding #7): Minor clarity improvement for the root cause analysis.

---

