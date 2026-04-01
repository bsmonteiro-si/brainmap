# 2026-03-18 — Subagent Transcript: general-purpose

**Date:** 2026-03-18 17:24:02
**Agent:** general-purpose
**Agent ID:** a74b744f73280c417
**Parent Session:** 26b25b6a-d4c2-4af3-aa3e-99baee782263

---

## User

You are reviewing an implementation plan for BrainMap. Here is the plan reviewer agent definition you must follow:

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
# Plan: Drag-to-Reorder Files Within Same Folder

## Context

The file tree currently supports drag-and-drop to **move** files/folders between folders, but there's no way to **reorder** items within the same folder. Files are always sorted by one of 4 computed modes (name A-Z/Z-A, modified asc/desc). This plan adds drag-to-reorder within a folder, introducing a "Custom" sort mode that persists the user-defined order.

## Approach

**Frontend-only feature.** Custom order is stored per-folder as an ordered array of child names in `uiStore`, included in `SegmentSnapshot` for segment switching, and persisted to `localStorage` per segment for app restarts.

**Detection strategy:** When dragging over a sibling item (same parent folder), use the cursor's Y position relative to the row to determine "insert above" vs "insert below" vs "drop into folder" (existing behavior). File rows get drop targets for reorder; folder rows use a 3-zone split (top 25% = reorder above, bottom 25% = reorder below, middle 50% = existing drop-into).

## Steps

### 1. Extend `FileSortOrder` and add custom order state

**File: `crates/app/src/stores/uiStore.ts`**
- Add `"custom"` to `FileSortOrder` type
- Add state field: `customFileOrder: Record<string, string[]>` (folder path → ordered child names, `""` for root)
- Add actions:
  - `setCustomFileOrder(folderPath: string, orderedNames: string[])` — updates one folder entry, persists to `localStorage` key `brainmap:fileOrder:<segmentPath>`
  - `loadCustomFileOrder(segmentPath: string)` — hydrates from localStorage on segment open
  - `clearCustomFileOrder()` — clears in-memory state (called during `resetWorkspaceState`)
- Add `customFileOrder` to `PersistedPrefs`? No — use a separate localStorage key per segment path to avoid bloating prefs.

### 2. Add "Custom" option to sort dropdown

**File: `crates/app/src/components/Layout/FileTreePanel.tsx`** (line ~1289)
- Add `<option value="custom">Custom</option>` to the sort select

### 3. Update `sortChildren` in `buildTree`

**File: `crates/app/src/components/Layout/FileTreePanel.tsx`** (lines 153-174)
- Change `buildTree` signature: add optional `customOrder?: Record<string, string[]>`
- Change `sortChildren` signature: add `parentPath: string` and `customOrder` params
- When `sortOrder === "custom"` and custom order exists for `parentPath`:
  - Build index map from order array: `name → position`
  - Sort: items with a position first (by position), items without position after (alphabetically). Folders-first rule still applies within each group.
  - Recurse with `n.fullPath` as `parentPath` for children
- When `sortOrder === "custom"` but no order exists for a folder, fall back to `name-asc`

### 4. Add pure reorder utility functions

**File: `crates/app/src/utils/fileTreeDnd.ts`**
- `getParentFolder(fullPath: string): string` — returns parent folder path (`""` for root-level items)
- `isSameFolder(pathA: string, pathB: string): boolean` — checks if two paths share the same parent
- `computeReorderedList(currentOrder: string[], draggedName: string, targetName: string, position: "before" | "after"): string[]` — removes dragged name, inserts before/after target
- `initCustomOrderFromTree(children: TreeNode[]): string[]` — snapshots current visible order as `name[]`

### 5. Add reorder DnD state and handlers

**File: `crates/app/src/components/Layout/FileTreePanel.tsx`**

New state in `FileTreePanel`:
- `reorderIndicator: { parentFolder: string; targetPath: string; position: "before" | "after" } | null`

New callbacks:
- `handleReorderDragOver(e: React.DragEvent, node: TreeNode)` — determines if this is a same-folder reorder. Uses 3-zone detection for folders (top 25% = above, bottom 25% = below, middle 50% = drop-into). Uses 2-zone for files (top 50% = above, bottom 50% = below). Sets `reorderIndicator` and calls `e.preventDefault()`.
- `handleReorderDrop(e: React.DragEvent, node: TreeNode)` — reads reorder indicator, computes new order, calls `setCustomFileOrder`, auto-switches to `"custom"` sort if not already.

Wire these to `FileTreeNode` — file rows get `onDragOver`/`onDrop` for reorder; folder rows merge reorder detection with existing folder-drop detection.

### 6. Render drop indicator line

**File: `crates/app/src/components/Layout/FileTreePanel.tsx`**
- Pass `reorderIndicator` to `FileTreeNode`
- When indicator matches this node, add CSS class `reorder-above` or `reorder-below`

**File: `crates/app/src/App.css`**
- `.tree-item` already has `position: relative` (line 1889) — good
- Add reorder-above/reorder-below pseudo-element styles with 2px accent line

### 7. Include custom order in SegmentSnapshot

**File: `crates/app/src/stores/segmentStateCache.ts`**
- Add `customFileOrder: Record<string, string[]>` to `SegmentSnapshot`
- Capture it from `useUIStore` in `captureSnapshot()`
- Restore it in `restoreSnapshot()`

### 8. Wire into segment lifecycle

**File: `crates/app/src/stores/workspaceStore.ts`**
- After `openWorkspace`, call `useUIStore.getState().loadCustomFileOrder(segmentPath)` to hydrate from localStorage
- In `resetWorkspaceState` (or equivalent), call `clearCustomFileOrder()`

### 9. Update `buildTree` call site

**File: `crates/app/src/components/Layout/FileTreePanel.tsx`**
- Read `customFileOrder` from `useUIStore`
- Pass to `buildTree` in `useMemo`

### 10. Handle edge cases

- **Filter active:** Disable reorder when `filter.trim() !== ""` (filtered view doesn't represent real order)
- **Rename:** In `executeRenameItem`, update custom order map (replace old name with new name in the parent folder's order array)
- **Cross-folder move:** In `executeMoveItem`, remove item from source folder's custom order and append to target folder's custom order
- **Drag self to same position:** Detect no-op and skip

### 11. Tests

**File: `crates/app/src/utils/fileTreeDnd.test.ts`** (extend)
- `computeReorderedList`: move first→last, last→first, middle, before/after
- `getParentFolder`, `isSameFolder`
- `initCustomOrderFromTree`

**File: `crates/app/src/components/Layout/FileTreePanel.test.ts`** (extend)
- `buildTree` with `sortOrder="custom"` and custom order map
- Missing names appended alphabetically
- Extra names in custom order gracefully ignored
- Folders-first rule still applies

## Critical Files

| File | Change |
|------|--------|
| `crates/app/src/stores/uiStore.ts` | `"custom"` sort mode, `customFileOrder` state + persistence |
| `crates/app/src/components/Layout/FileTreePanel.tsx` | Reorder DnD handlers, indicator rendering, `sortChildren` update, "Custom" dropdown option |
| `crates/app/src/utils/fileTreeDnd.ts` | `getParentFolder`, `isSameFolder`, `computeReorderedList`, `initCustomOrderFromTree` |
| `crates/app/src/App.css` | Drop indicator styles |
| `crates/app/src/stores/segmentStateCache.ts` | Include `customFileOrder` in snapshot |
| `crates/app/src/stores/workspaceStore.ts` | Load custom order on segment open |
| `crates/app/src/components/Layout/FileTreePanel.test.ts` | Tests for custom sort |

## Verification

1. `cd crates/app && npx vitest run` — all existing + new tests pass
2. Manual testing in dev app (detailed checklist in plan)
---

Please review this plan and write your findings to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/drag-reorder-review-1.md`.

---

## Assistant



I'll review the plan by first examining the relevant source files to understand the current implementation.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStateCache.ts"}`

---

## Assistant

Now let me check the existing DnD utilities and the FileTreePanel for the current drag-and-drop implementation.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/fileTreeDnd.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":200,"limit":300}`

---

## Assistant

Let me see the DnD handling in the FileTreeNode component and the rest of the component.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":500,"limit":400}`

---

## Assistant

I now have enough context to write the review. Let me check one more thing -- the workspaceStore for segment lifecycle hooks.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"loadCustomFileOrder|openWorkspace|resetWorkspaceState","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts","output_mode":"content","-n":true}`

---

## Assistant

Now I have a thorough understanding of the codebase. Let me write the review.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/ 2>/dev/null || echo \"directory does not exist\"","description":"Check if reviews/plans directory exists"}`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/drag-reorder-review-1.md","content":"# Plan Review: Drag-to-Reorder Files Within Same Folder\n\n## Summary\n\nThe plan i`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/drag-reorder-review-1.md`.

**Summary of findings:**

- **3 should-fix findings:**
  1. **Name collision risk** -- Custom order uses child `name` but names can collide (e.g., `notes.md` stem vs `notes/` folder). Should use `fullPath` instead.
  2. **No pruning of stale entries** -- Deleted files leave orphan entries in the custom order arrays with no cleanup mechanism. Add pruning during `buildTree`.
  3. **Dual persistence sources** -- Both localStorage and `SegmentSnapshot` store custom order, creating two sources of truth that can diverge. Define clear precedence and avoid redundant writes.

- **1 should-fix for testing:**
  4. **Zone detection logic untested** -- The 3-zone/2-zone cursor detection is the most error-prone part but has no planned tests. Extract it as a pure function in `fileTreeDnd.ts` and test it.

- **4 suggestions:**
  5. No undo support for accidental sort-mode switch on first reorder.
  6. Ensure `initCustomOrderFromTree` accounts for non-BrainMap workspace files.
  7. Throttle `reorderIndicator` state updates to avoid excessive re-renders on `dragOver`.
  8. Step 5 needs more detail on how reorder detection merges with existing folder-drop logic.

---

