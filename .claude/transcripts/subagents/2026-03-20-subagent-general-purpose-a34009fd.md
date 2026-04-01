# 2026-03-20 — Subagent Transcript: general-purpose

**Date:** 2026-03-20 10:46:28
**Agent:** general-purpose
**Agent ID:** a34009fdc7d1be10e
**Parent Session:** b1d9eca6-8bb3-4c0b-8673-2c48c1a7ec0b

---

## User

You are reviewing an implementation plan for BrainMap. Read the plan at `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/excalidraw-phase1.md` and review it using the criteria below. Write your review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/excalidraw-phase1-review-1.md`.

Also read these files for context on the current codebase patterns:
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts` (tab kind union)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts` (clearForPdfTab pattern)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx` (dispatch logic)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx` (tab activation/close)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabActions.ts` (navigateToActiveTab)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx` (Cmd+S handler)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx` (click handler, context menu)

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

---

## Assistant



I'll read the plan and all the context files in parallel.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/excalidraw-phase1.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabActions.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":100}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.pdf|clearForPdfTab|kind === \"pdf\"","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content","-C":3}`

---

## Assistant

Now I have enough context. Let me also check how `navigateToActiveTab` handles the PDF case since the plan mentions adding excalidraw handling there.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabActions.ts","offset":8,"limit":20}`

---

## Assistant

I notice a bug: `navigateToActiveTab` has no PDF case either -- it falls through to `openPlainFile`. Let me check the `openTab` type signature more carefully.

Now I have all the context needed. Let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/excalidraw-phase1-review-1.md","content":"# Excalidraw Phase 1 Plan Review\n\n**Reviewer focus**: Architecture alignment`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/excalidraw-phase1-review-1.md`.

**Summary of findings:**

- **2 blockers**: (1) `openTab`'s TypeScript signature doesn't accept `"excalidraw"` -- the plan claims no other tabStore changes are needed but the function parameter type must be widened. (2) `navigateToActiveTab` in `tabActions.ts` has no PDF case (existing bug) -- the plan says to add excalidraw "alongside pdf" but there's nothing there to be alongside.

- **5 should-fix**: Cmd+S ordering must put excalidraw check before `saveNote()` fallthrough; Cmd+W handler has no excalidraw save logic; race condition between dispatching save event and unmounting on tab close (contradicts the unmount-cleanup approach in Step 7); no filename selection UX specified for "New Drawing"; no error handling for malformed `.excalidraw` JSON.

- **3 suggestions**: `clearForExcalidrawTab` duplicates `clearForPdfTab` (should be a shared generic method); test strategy is missing close-with-save edge cases; `onChange` fires on selection changes too, not just content mutations -- the no-op write skip should be a concrete implementation detail rather than a "consider".

---

