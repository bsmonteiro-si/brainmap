# 2026-03-09 — Subagent Transcript: general-purpose

**Date:** 2026-03-09 20:49:14
**Agent:** general-purpose
**Agent ID:** a91ec9bffb2585996
**Parent Session:** 029c53be-32f6-4b33-aded-6ee2be0b034b

---

## User

You are reviewing TypeScript/React code for BrainMap. This is a second-pass review after fixes were applied.

The first review found these bugs that have been fixed:
1. `uiStore.ts`: localStorage parse now wrapped in try/catch
2. `GraphView.tsx`: Early returns removed - container div always rendered; labeled class accumulation fixed
3. `RelatedNotesFooter.tsx`: key={i} replaced with key={item.dir:item.path:item.rel}

Please review the following files for any remaining **bug** or **should-fix** issues. Focus specifically on:
- React hooks correctness (stale closures, missing deps)
- Zustand state mutation correctness
- Memory leaks or missing cleanup
- Logic bugs in the new features (file tree, related notes footer, fcose/dagre layout, panel persistence)

Files to review:
1. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`
2. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx`
3. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx`
4. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`
5. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx`

Write findings to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ux-improvements-review-1-pass-2.md`.

For each finding:
- **File**: path and line range
- **Severity**: [bug, should-fix, suggestion]
- **Finding**: description
- **Fix**: correction

Only report bugs and should-fix items. Skip suggestions.

---

## Assistant

I'll review the files carefully for bugs and should-fix issues.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx"}`

---

## Assistant

Now let me check the graphStore to understand how `selectNode` and `expandNode` work, and check the editorStore for `openNote`, to verify stale closure risks and hook correctness.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/*.ts"}`

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

Now I have all the context I need. Let me analyze each file carefully for bugs and should-fix issues.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ 2>/dev/null || echo \"Directory does not exist\"","description":"Check reviews/code directory"}`

---

## Assistant

Now I have a complete picture. Let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ux-improvements-review-1-pass-2.md","content":"# UX Improvements Code Review — Pass 2\n\nSecond-pass review after the fol`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ux-improvements-review-1-pass-2.md`.

Here is a summary of all findings:

**Bugs (2):**

1. **GraphView.tsx lines 101–209** — `selectedNodePathRef` stale in Cytoscape zoom handler. The ref is updated in a `useEffect` with no dep array (fires after every render), but the Cytoscape `zoom` event fires outside React's render cycle. Between a `selectedNodePath` state update and the effect running, the zoom handler reads the old path from the ref and applies "labeled" classes to the wrong edges. Fix: move the ref assignment into the `selectedNodePath` effect itself (line 191 block) and remove the standalone ref-sync effect.

2. **FileTreePanel.tsx lines 66–76** — `sortChildren` calls `Array.sort()` which mutates the `children` arrays in-place before returning spread copies. The mutation propagates into the originals held in `folderMap`, making the function's behavior implicitly reliant on call order. Fix: copy the array before sorting (`[...items].sort(...)`).

**Should-fix (5):**

3. **GraphView.tsx lines 76–83** — The `useEffect` that re-assigns `selectNodeRef`/`expandNodeRef` on every render is a no-op because Zustand actions are stable references. The misleading pattern should be removed.

4. **AppLayout.tsx lines 57–79** — Toggling `treeOpen` switches between two completely different JSX subtrees, causing React to unmount and remount `GraphView`, destroying the Cytoscape instance and losing zoom/pan state every time the file tree is opened or closed.

5. **FileTreePanel.tsx lines 129–153** — The `filter` local state is not cleared when `nodes` changes, so a filter string typed in one workspace persists when the workspace is switched.

6. **RelatedNotesFooter.tsx lines 9–10** — `showAll` is not reset when `activeNote` changes. After a user expands to "show all" on one note and navigates away, the next note immediately shows its full list without the initial collapsed view.

7. **AppLayout.tsx lines 27–33** — `handleOuterLayout` and `handleRightLayout` are plain arrow functions recreated on every render and should be wrapped in `useCallback`.

---

