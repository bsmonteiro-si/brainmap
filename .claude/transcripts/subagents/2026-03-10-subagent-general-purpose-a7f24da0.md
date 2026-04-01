# 2026-03-10 — Subagent Transcript: general-purpose

**Date:** 2026-03-10 12:07:40
**Agent:** general-purpose
**Agent ID:** a7f24da007553b04d
**Parent Session:** e775a4b6-ec6a-4752-8126-0b07a473af0a

---

## User

You are reviewing an implementation plan for BrainMap, a Rust knowledge graph tool. Your job is to find real problems before code gets written.

## Review Criteria

You are reviewing the plan for the "Focus in Graph" feature. Here are the review criteria:

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

## Plan to Review

The plan is at `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/focus-in-graph.md`

Also read the key source files referenced in the plan to verify the approach is accurate:
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx` 
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`

Write your review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/focus-in-graph-review-1.md`

---

## Assistant

I'll review the implementation plan for the "Focus in Graph" feature. Let me start by reading all the relevant files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/focus-in-graph.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

Now let me look at the GraphToolbar to understand the existing structure before reviewing further.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/GraphToolbar.tsx","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/graphStyles.ts","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphToolbar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts"}`

---

## Assistant

Now I have all the information I need to write a thorough review. Let me compose it.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/focus-in-graph-review-1.md","content":"# Plan Review: Focus in Graph\n\nReviewed against source files: `uiStore.ts`, `Ap`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/focus-in-graph-review-1.md`.

Here is a summary of what was found:

**Blockers (1)**

- **Context menu orphan risk** (finding 5): The plan says the menu auto-closes on "outside mousedown," but clicking a menu item is an *inside* mousedown. If the menu is ever rendered as a portal outside `FileTreePanel`, it would be orphaned when the panel unmounts. The fix is to call `setContextMenu(null)` explicitly in the `onClick` handler before `setGraphFocus`, making cleanup deterministic regardless of render structure.

**Should-fix (5)**

- **`setGraphFocus` abuses `treeOpen`** (finding 1): Atomically zeroing `treeOpen` to drive a tab switch is invisible coupling. Should use a dedicated action or at minimum a comment documenting the intent.
- **AppLayout spec references a non-existent variable** (finding 2): The plan uses `activeTab` which does not exist in `AppLayout.tsx`; the real guard is `!treeOpen`. The pseudocode as written would not compile.
- **Folder focus silently drops all cross-folder edges** (finding 3): Unlike note-focus (which includes external neighbors), folder-focus filters to intra-folder edges only. This is an undocumented design decision that should be stated explicitly in the plan.
- **No automated tests** (finding 8): The filter `useMemo` logic is a pure function and trivially extractable as `filterGraphByFocus(nodes, edges, path, kind)`. The plan should include at least one Vitest unit test for it.
- **`AppLayout.tsx` missing from "Files to Modify" list** (finding 9): The file is described as needing a change but is not listed in the checklist section at the bottom of the plan.

**Suggestions (2)**

- `graphFocusKind` is inferrable from the path suffix (`.md` = note, no extension = folder) and could be dropped to reduce state synchronization surface.
- The `node.graph-focus-node` stylesheet width (18px) correctly overrides `data(size)` due to Cytoscape selector specificity — the plan should document this so implementers don't add a redundant `data` mutation.

---

