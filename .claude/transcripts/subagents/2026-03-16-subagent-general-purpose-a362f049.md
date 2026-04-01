# 2026-03-16 — Subagent Transcript: general-purpose

**Date:** 2026-03-16 15:15:15
**Agent:** general-purpose
**Agent ID:** a362f049e5c4ea913
**Parent Session:** a2488be2-2d1d-4e93-a8e6-4f75d19305c4

---

## User

You are reviewing TypeScript code changes for BrainMap, a knowledge graph tool. Review the following changed files for defects.

## Review Criteria (from .claude/agents/code-reviewer.md)

Focus on: correctness, function design, test coverage, performance. Find real defects, not style nits.

For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

## Changed Files

### 1. crates/app/src/utils/resolveNotePath.ts

The function `isLocalMdLink` was renamed to `isLocalNoteLink` and broadened to also accept extension-less relative paths (wiki-style links). A new `ensureMdExtension` helper was added.

Read these files to review:
- /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/resolveNotePath.ts
- /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/resolveNotePath.test.ts

### 2. crates/app/src/components/Editor/MarkdownPreview.tsx

Import updated from `isLocalMdLink` → `isLocalNoteLink` + `ensureMdExtension`. Click handler now wraps resolved path with `ensureMdExtension`.

Read: /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx

### 3. crates/app/src/components/Editor/cmLinkNavigation.ts

Same import and handler changes as MarkdownPreview.

Read: /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmLinkNavigation.ts

Write your review to /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/extensionless-links-review-1.md

---

## Assistant



Let me read all the changed files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/resolveNotePath.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/resolveNotePath.test.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmLinkNavigation.ts"}`

---

## Assistant

Now let me read the code-reviewer agent definition.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/agents/code-reviewer.md"}`

---

## Assistant

Now I have all the information needed. Let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/extensionless-links-review-1.md","content":"# Code Review: Extension-less Links Support\n\n**Reviewer**: code-reviewer ag`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/extensionless-links-review-1.md`.

**Key findings:**

1. **should-fix**: `isLocalNoteLink` returns `true` for fragment-only links like `#section-heading`, causing the click handler to try opening a nonexistent note `#section-heading.md`. Fix: add `if (href.startsWith("#")) return false;` at the top of the function (line 47 area in `resolveNotePath.ts`).

2. **should-fix**: Missing test coverage for fragment-only links in `resolveNotePath.test.ts`.

3. **suggestion** (non-blocking): Query-string-only relative URLs without a scheme (e.g., `search?q=foo`) would also be misidentified as local note links. Unlikely in practice.

4. **suggestion** (non-blocking): `ensureMdExtension` has no trimming/sanitization, but current callers don't produce problematic input.

The rest of the change is solid -- consistent pattern applied in both `MarkdownPreview.tsx` and `cmLinkNavigation.ts`, good test coverage for the new extension-less path logic.

---

