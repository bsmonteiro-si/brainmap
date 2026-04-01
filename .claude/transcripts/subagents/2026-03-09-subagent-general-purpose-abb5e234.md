# 2026-03-09 — Subagent Transcript: general-purpose

**Date:** 2026-03-09 18:15:18
**Agent:** general-purpose
**Agent ID:** abb5e234387aa0bc8
**Parent Session:** ba732d96-401a-4b82-b69a-43c622866e5c

---

## User

You are reviewing TypeScript/React code for BrainMap's desktop app (Phase 1c). Review the following files for correctness and potential bugs. Write your review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/phase-1c-typescript-review-1.md`.

## Review Criteria

Review for:
1. **Correctness**: Logic bugs, missing error handling, state management issues, race conditions
2. **React patterns**: Proper hook usage, dependency arrays, memory leaks (missing cleanup)
3. **Type safety**: Type mismatches between API types and store types, missing null checks
4. **API bridge**: Does the mock layer faithfully match the interface? Any missing methods?
5. **Performance**: Unnecessary re-renders, missing memoization where it matters

### Output Format

Write your review as a list of findings. For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

Do NOT report: missing comments, style preferences, minor formatting

## Files to Review

Read and review these files:

**API Layer:**
1. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts`
2. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts`
3. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts`
4. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts`
5. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/state.ts`
6. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/events.ts`

**Stores:**
7. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts`
8. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts`
9. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts`
10. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`

**Components:**
11. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx`
12. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx`
13. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx`
14. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx`
15. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Search/SearchPanel.tsx`

Write findings to the review file.

---

## Assistant



I'll start by reading all the files in parallel.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/state.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/events.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Search/SearchPanel.tsx"}`

---

## Assistant

Now I have all the files. Let me check for a `delay.ts` file referenced by the mock.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/api/mock/delay.*","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/delay.ts"}`

---

## Assistant

Now I have everything I need. Let me write the review.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"mkdir -p /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code","description":"Create reviews directory"}`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/phase-1c-typescript-review-1.md","content":"# Phase 1c TypeScript/React Code Review\n\nReviewer: code-reviewer agent (pas`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/phase-1c-typescript-review-1.md`.

**Summary of findings (15 total):**

**3 bugs:**
1. **TauriBridge.onEvent** (`tauri.ts:94-104`) -- Race condition where cleanup runs before `listen()` resolves, permanently leaking the event listener.
2. **GraphView stale closures** (`GraphView.tsx:16-54`) -- Cytoscape event handlers capture `selectNode`/`expandNode` from initial render only (empty dep array).
3. **MarkdownEditor destroys on save** (`MarkdownEditor.tsx:19-53`) -- `content` in the dependency array causes the entire CodeMirror editor to be destroyed and recreated after `saveNote` updates `activeNote.body`, losing cursor position and undo history.

**7 should-fix:**
- Edge IDs use array index (fragile for incremental updates)
- `onChange` captured as stale closure in CodeMirror
- `openNote` early-return prevents auto-reload after external changes
- `App.tsx` destructures full store causing unnecessary re-renders and effect re-runs
- MockBridge ignores `relFilter` in `listLinks`
- SearchPanel debounce timer not cleared on unmount
- SearchPanel race condition with out-of-order responses
- GraphView full layout re-run with `randomize: true` destroys viewport on every update

**5 suggestions:**
- Mock ignores `direction`/`relFilter` in `getNeighbors`
- EditorPanel subscribes to entire store
- Mock `deleteNote` ignores `force` parameter
- No system theme change listener

---

