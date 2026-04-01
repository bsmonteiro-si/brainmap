# 2026-03-16 — Subagent Transcript: general-purpose

**Date:** 2026-03-16 16:47:40
**Agent:** general-purpose
**Agent ID:** aa56b3517270d4980
**Parent Session:** f677a8ff-6516-4865-b3c8-dfc9f49743e0

---

## User

You are reviewing an implementation plan for BrainMap. Here is the full plan reviewer agent definition you must follow:

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

# Inline Citation Decoration

## Context

BrainMap has a `source` frontmatter field for note-level origin references, but no way to mark inline citations within paragraph text. The user wants a lightweight syntax with visual identity — an inline version of "Source" that can sit mid-paragraph.

## Syntax

`[@...]` — e.g., `[@The Book of Why, Ch.1]` or `[@Pearl 2009, p.42]`

This is Pandoc-style, concise, and won't collide with existing markdown syntax (links use `[text](url)`, callouts use `[!type]`).

## Scope

Frontend-only. No Rust/core parser changes, no graph edges. Just:
1. A CodeMirror decoration extension (editor mode)
2. A react-markdown plugin (preview mode)
3. CSS styling

## Implementation

### 1. CodeMirror Extension — `cmCitationDecorations.ts`

**File**: `crates/app/src/components/Editor/cmCitationDecorations.ts`

**Pattern**: Same as `cmMarkdownDecorations.ts` — `StateField` + `Decoration.mark()`.

Since `[@...]` is not a standard markdown node in the syntax tree, use **regex matching** on the visible document text (same approach as `cmLinkNavigation.ts` which regex-scans for links):

```
/\[@([^\]]+)\]/g
```

- Define `Decoration.mark({ class: "cm-citation" })` for the full `[@...]` range
- Optionally dim the brackets: `cm-citation-bracket` on `[@` and `]`
- Build decorations via `StateField` that recomputes on `docChanged`
- Export a `citationDecorations()` function returning the extension

### 2. Preview Renderer

**File**: `crates/app/src/components/Editor/MarkdownPreview.tsx`

Add a text preprocessing step (before react-markdown) or a custom remark plugin that converts `[@...]` into a styled `<cite>` element.

### 3. CSS Styling

**File**: `crates/app/src/App.css`

Accent-colored text + subtle background/border pill — visually distinct from inline code and links.

### 4. Wire Up

**File**: `crates/app/src/components/Editor/MarkdownEditor.tsx`

Add `citationDecorations()` to the extensions array.

## Files to Create/Modify

| File | Action |
|------|--------|
| `crates/app/src/components/Editor/cmCitationDecorations.ts` | Create — CM extension |
| `crates/app/src/components/Editor/MarkdownPreview.tsx` | Modify — citation rendering |
| `crates/app/src/components/Editor/MarkdownEditor.tsx` | Modify — add extension |
| `crates/app/src/App.css` | Modify — add CSS classes |

## Verification

1. `cd crates/app && npm run build` — no TS errors
2. Open the Tauri app, verify citation renders as accent-colored pill
3. Verify no interference with regular links or callouts
4. Add Vitest unit tests for regex extraction
5. `./scripts/check.sh`

---

**IMPORTANT**: Write your review findings to the file `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/inline-citation-review-1.md`. This is a research-only task — do NOT edit any source code files.

---

## Assistant



I'll review this plan by first understanding the existing codebase patterns referenced in the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/cm*.ts","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/MarkdownEditor.tsx","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmLinkNavigation.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

Now I have enough context to write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/inline-citation-review-1.md","content":"# Plan Review: Inline Citation Decoration\n\n## Findings\n\n### 1\n- **Category*`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/inline-citation-review-1.md`.

**Summary of findings:**

- **2 should-fix items:**
  1. The regex will incorrectly match `[@...]` inside fenced code blocks and inline code spans. The plan needs to either integrate into the existing `buildDecorations` in `cmMarkdownDecorations.ts` (which already handles these exclusions) or import and reuse `scanFencedBlocks` plus syntax-tree checks.
  2. No test cases are specified. The plan should enumerate scenarios including code blocks, inline code, link labels, nested brackets, and edge cases like empty/whitespace-only citations.

- **3 suggestions:**
  1. Consider adding citation decoration to the existing `markdownDecoField` rather than a separate `StateField`, avoiding a redundant full-document scan and decoration ordering issues.
  2. The preview renderer should use a remark plugin (not text preprocessing) to avoid transforming citations inside code blocks in the markdown source.
  3. The regex should consider rejecting whitespace-only citations like `[@ ]`.

No blockers. The plan is well-scoped as frontend-only with no core changes. The main risk is false-positive matches inside code contexts, which is straightforward to fix by leveraging the existing infrastructure.

---

