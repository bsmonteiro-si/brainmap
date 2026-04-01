# 2026-03-11 — Subagent Transcript: general-purpose

**Date:** 2026-03-11 19:20:59
**Agent:** general-purpose
**Agent ID:** a17d162e1cbaed6d6
**Parent Session:** cac98a5e-bb31-4585-8135-4876e33d5c71

---

## User

You are reviewing an implementation plan for BrainMap. Read the plan at `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/editable-frontmatter.md` and review it against the criteria below. Also read the current codebase files referenced in the plan to verify the plan's assumptions are correct.

Key files to check:
- `crates/app/src/stores/editorStore.ts`
- `crates/app/src/components/Editor/FrontmatterForm.tsx`
- `crates/app/src/components/Editor/EditorPanel.tsx`
- `crates/app/src/App.tsx`
- `crates/app/src/api/types.ts`
- `crates/app/src/stores/graphStore.ts`
- `crates/app/src/api/tauri.ts` (check MockBridge too for updateNote)
- `crates/app/src/api/mock.ts` or similar

## Review Criteria

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

Write your review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/editable-frontmatter-review-1.md`.

For each finding:
- **Category**: one of [architecture, scope, edge-case, testing, data-model, performance, clarity]
- **Severity**: one of [blocker, should-fix, suggestion]
- **Finding**: what the problem is
- **Recommendation**: what to do instead

If you find no issues in a category, skip it. If the plan is solid, say so briefly and explain why. Do NOT pad your review with praise or filler. Only real findings.

---

## Assistant



I'll start by reading the plan and the referenced codebase files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/editable-frontmatter.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

Now let me read the remaining files referenced in the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

Now let me check the API implementations (TauriBridge and MockBridge) to verify `updateNote` behavior.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/api/*.ts","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts"}`

---

## Assistant

Now I have all the context I need. Let me check one more thing — the existing `saveNote` guard condition which is relevant to a finding I noticed.

The current `saveNote` has this guard:
```ts
if (!activeNote || !isDirty || editedBody === null) return;
```

This will short-circuit if `editedBody` is null, even when only frontmatter changed. This is a critical issue the plan needs to address explicitly. The plan mentions modifying `saveNote` but doesn't call out that this guard needs to change.

Let me also check whether `updateNote` returns anything useful (like the updated note) from the backend.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"fn update_node|async fn update_node|pub fn update_node","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri","output_mode":"content","-C":3}`

---

## Assistant

Good — `updateNote` returns `void`, not the updated note. Now let me check the existing editor store tests.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/stores/editorStore.test.ts","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

No existing editorStore tests. Now I have everything I need to write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/editable-frontmatter-review-1.md","content":"# Editable Frontmatter Plan — Review 1\n\n## Overall Assessment\n\nThe plan`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/editable-frontmatter-review-1.md`.

**Summary of findings:**

1. **Blocker**: The current `saveNote` guard (`editedBody === null`) will silently skip frontmatter-only saves. The plan must explicitly change this guard.

2. **Should-fix (4 items)**:
   - `updateNote` returns void, so `modified` timestamp will be stale after optimistic merge. Plan should re-read the note after save.
   - MockBridge uses `Object.assign` for `extra`, which won't remove deleted keys. Plan needs to clarify replace-vs-merge semantics.
   - Cmd+S triggers a backend file write, which emits a workspace event back to the frontend. This can cause a spurious "external change" conflict banner or an unnecessary re-read. A `savingInProgress` flag would prevent this.
   - Validation says "prevent save of empty title" but doesn't specify the enforcement mechanism in `saveNote()`.
   - No tests planned for `ExtraFieldsEditor` despite it having non-trivial add/remove/edit logic.

3. **Suggestions (2 items)**:
   - Graph sync only covers title/type (NodeDto shape) — tags/status changes aren't reflected. Fine for now.
   - `EditableFrontmatter` type could use `Pick<NoteDetail, ...>` to prevent field name drift.

---

