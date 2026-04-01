# 2026-03-18 — Subagent Transcript: general-purpose

**Date:** 2026-03-18 19:30:15
**Agent:** general-purpose
**Agent ID:** affc03dfc2dc162c0
**Parent Session:** 5e2d1daa-ae5d-4ab0-928b-7769d5294d64

---

## User

You are reviewing TypeScript/React code for BrainMap, a knowledge graph tool with a CodeMirror 6 editor. Your job is to find real defects, not style nits.

## Review Criteria (adapted from code-reviewer.md for TypeScript/React)

### 1. Correctness
- Are there logic bugs? Off-by-one errors? Missed conditions?
- Does error handling cover all failure modes? Are errors propagated, not swallowed?
- Are async operations handled correctly? Race conditions?
- Is state consistent after mutations?

### 2. Function Design
- Is each function doing one thing? Flag functions longer than ~30 lines that could be split.
- Are names descriptive?

### 3. Test Coverage
- Is every new public function tested?
- Are error paths tested (not just happy paths)?
- Do tests verify behavior rather than interaction?

### 4. Performance
- Are there O(n^2) loops or repeated scans?
- Are there memory leaks (event listeners, caches)?

### 5. Security
- XSS via dangerouslySetInnerHTML?
- Is HTML properly escaped?

## Files to Review

Read and review each of these changed files:

1. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMermaidDecorations.ts` (NEW - core mermaid extension)
2. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts` (lines 24-77 changed - FencedBlock lang field)
3. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmSlashCommands.ts` (added /mermaid command + icon)
4. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx` (registered mermaid extension)
5. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx` (MermaidPreviewBlock component)
6. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMermaidDecorations.test.ts` (NEW - tests)
7. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.test.ts` (updated tests)
8. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmSlashCommands.test.ts` (updated tests)

## Output Format

Write your review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/mermaid-decorations-review-1.md`

For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

If a file has no issues, skip it. If the code is solid, say so briefly.

---

## Assistant



I'll read all the files to review in parallel.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMermaidDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmSlashCommands.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMermaidDecorations.test.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.test.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmSlashCommands.test.ts"}`

---

## Assistant

Now let me check a couple more things to verify my findings.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"STATIC_COMMAND_COUNT","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmSlashCommands.test.ts","output_mode":"content"}`

---

## Assistant

Let me count the static commands in the SLASH_COMMANDS array to verify the count.

The static commands are: h1, h2, h3 (3), bullet, numbered, task (3), quote, code, mermaid, hr, table, link (6), source, example (2), math (1) = 15. The comment says "blocks(6)" which includes mermaid now. That checks out.

Now let me look at potential issues more carefully.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"tr\\.view","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMermaidDecorations.ts","output_mode":"content"}`

---

## Assistant

Now let me check if `tr.view` is actually available in the `update` method of a `StateField` - this is a known CM6 API question. Let me also check if `view.dispatch` inside an async callback after the view might be destroyed.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"clearMermaidCache","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor","output_mode":"content"}`

---

## Assistant

Now I have a solid understanding of the code. Let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/mermaid-decorations-review-1.md","content":"# Code Review: Mermaid Decorations\n\n## Summary\n\nThe mermaid decoration fe`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/mermaid-decorations-review-1.md`.

**Key findings (3 severities):**

- **bug** (Finding 3): `MermaidWidget.eq()` only compares `source`, ignoring `cached`. When an async render completes and the effect triggers a rebuild, CM6 sees `eq() === true` and skips re-rendering the DOM -- so the "Rendering diagram..." loading state is never replaced with the actual SVG.

- **bug** (Finding 2): `renderMermaid()` calls `view.dispatch()` after an async `await`, but the view may have been destroyed (user switched notes, theme change). Needs a try/catch or destroyed guard.

- **should-fix** (Finding 4): `MermaidPreviewBlock` hardcodes `theme: "dark"` instead of respecting the user's actual theme setting.

- **should-fix** (Finding 5): Mermaid `initialize()` is called on every preview render rather than using the singleton lazy-init pattern from the editor side.

- **suggestion**: `buildMermaidDecos` cursor-aware behavior is exported but untested.

Finding 3 is the most impactful -- it means mermaid diagrams will appear stuck on the loading state in the editor until the user manually clicks into and out of the block.

---

