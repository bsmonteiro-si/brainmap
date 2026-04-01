# 2026-03-14 — Subagent Transcript: general-purpose

**Date:** 2026-03-14 11:30:07
**Agent:** general-purpose
**Agent ID:** a63da4181bc183567
**Parent Session:** f996be33-f69c-4bd8-a579-fbbb56a180c2

---

## User

You are reviewing an implementation plan for BrainMap. Read the plan at `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/plans/indexed-foraging-floyd.md` and the review criteria below, then write your review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/raw-view-mode-review-1.md`.

## Review Criteria

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

IMPORTANT: Read the plan file first, then explore the codebase as needed to validate the plan's claims, then write your review file.

---

## Assistant



I'll start by reading the plan and key codebase files to understand the context.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/plans/indexed-foraging-floyd.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

Let me check the relevant frontend files to validate the plan's claims.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts","limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx","limit":50}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx","offset":230,"limit":120}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx","limit":60}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","offset":100,"limit":80}`

---

## Assistant

Now let me check `setViewMode` and `markExternalChange` in editorStore, and also the `readPlainFile` API.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"setViewMode","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","output_mode":"content","-C":3}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"markExternalChange","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","output_mode":"content","-C":10}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"readPlainFile","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","-C":2}`

---

## Assistant

Now let me check what `readPlainFile` actually returns for a BrainMap note file (is it blocked for notes?).

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","offset":340,"limit":30}`

---

## Assistant

Good -- `handle_read_plain_file` does NOT block on BrainMap notes (only `write` does), so using it for raw reads is valid. Let me also quickly check the `markExternalChange` method more fully and the `snapshotToActiveTab` for `rawContent` implications.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","offset":500,"limit":60}`

---

## Assistant

I have enough information. Now let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/raw-view-mode-review-1.md","content":"# Review: Add \"Raw\" View Mode to Editor\n\n**Plan file**: `.claude/plans/indexed`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/raw-view-mode-review-1.md`.

**Key findings (6 total):**

1. **should-fix** (edge-case): Fire-and-forget async in `setViewMode` will cause a blank flash — `viewMode` switches to `"raw"` instantly while `rawContent` is still `null`. Recommend making it async-await or adding a loading state.

2. **should-fix** (edge-case): `rawContent` not persisted in tab state but `viewMode: "raw"` is — same blank-flash issue on tab restore. The tab-restore path in `openNote` needs atomic handling.

3. **suggestion** (edge-case): `markExternalChange` raw refresh should be clarified as *in addition to* existing `activeNote` reload, not a replacement.

4. **suggestion** (scope): Using `notePath={activeNote.path + "::raw"}` pollutes a semantically file-path prop. Better to use a `key` prop for instance separation.

5. **should-fix** (testing): No test for the tab-switch round-trip with raw mode (switch away and back, verify `rawContent` re-fetched).

6. **suggestion** (architecture): Excluding `linkNavigation` from read-only mode removes Cmd+Click navigation, which could still be useful in raw view.

---

