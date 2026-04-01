# 2026-03-27 — Subagent Transcript: general-purpose

**Date:** 2026-03-27 20:15:19
**Agent:** general-purpose
**Agent ID:** a6ae987937b664b9c
**Parent Session:** 51b5ae26-5523-47aa-aa29-7a42f626f8b5

---

## User

You are reviewing an implementation plan for BrainMap. Read the plan reviewer agent definition and the plan, then write your review.

PLAN REVIEWER CRITERIA (from `.claude/agents/plan-reviewer.md`):

You are reviewing an implementation plan for BrainMap, a Rust knowledge graph tool. Your job is to find real problems before code gets written.

## Project Context
- Rust workspace: `crates/core` (library), `crates/cli` (CLI), `crates/tauri-plugin` (desktop)
- Core library owns all data operations; interfaces are thin wrappers
- Files (.md with YAML frontmatter) are source of truth
- In-memory graph + SQLite FTS5 index
- Specs live in `docs/`

## What to Review

### 1. Architectural Alignment
- Does the plan respect the existing module boundaries?
- Does it route mutations through `Workspace` as the orchestration layer?
- Does it avoid leaking implementation details across module boundaries?

### 2. Scope and Complexity
- Is the plan doing more than what was asked? Flag any scope creep.
- Are there simpler alternatives to what's proposed?
- Are abstractions justified or premature?
- Does it avoid backwards-compatibility hacks or dead code?

### 3. Edge Cases and Risks
- What failure modes are unhandled?
- Are there ordering dependencies between steps that aren't called out?
- What happens if the implementation is interrupted halfway?

### 4. Test Strategy
- Does the plan include tests for each new behavior?
- Are edge cases and error paths tested, not just happy paths?

### 5. Data Model Impact
- Do changes to types break serialization compatibility?

## Output Format
Write your review as a list of findings. For each finding:
- **Category**: one of [architecture, scope, edge-case, testing, data-model, performance, clarity]
- **Severity**: one of [blocker, should-fix, suggestion]
- **Finding**: what the problem is
- **Recommendation**: what to do instead

If you find no issues in a category, skip it. If the plan is solid, say so briefly and explain why.
Do NOT pad your review with praise or filler. Only real findings.

---

THE PLAN TO REVIEW:

# Fix All Three Drag-and-Drop Modes

## Context

External drag-and-drop between the BrainMap app and macOS Finder is broken. Dragging files from Finder into the app causes WKWebView to navigate to the file (replacing the entire UI). Dragging files from the app to Finder doesn't work. Internal file tree drag (reorder/move) works but only because `dragDropEnabled: false`.

The root cause is a Tauri v2 architectural constraint: `dragDropEnabled` is mutually exclusive on macOS WKWebView. With `true`, Tauri intercepts all drag events (breaking HTML5 internal drag). With `false`, WKWebView handles external drops natively (navigating away). Nine previous attempts failed trying to work around this constraint.

**The solution**: Set `dragDropEnabled: true` and rewrite internal drag to use `mousedown`/`mousemove`/`mouseup` instead of HTML5 drag events. Mouse events are unaffected by `dragDropEnabled`. This eliminates the mutual exclusion entirely.

## Approach

Three independent subsystems, each using a different event mechanism:

| System | Trigger | Mechanism | Location |
|--------|---------|-----------|----------|
| Internal drag (reorder/move) | mousedown + mousemove | DOM mouse events + `elementFromPoint` | `FileTreePanel.tsx` |
| Inbound drop (Finder -> app) | File dragged from Finder | `onDragDropEvent()` from Tauri webview API | `useExternalDragDrop.ts` |
| Outbound drag (app -> Finder) | Alt+mousedown on tree item | `startDrag()` from `@crabnebula/tauri-plugin-drag` | `FileTreePanel.tsx` (already implemented) |

## Implementation Steps

### Step 1: Flip `dragDropEnabled` to `true`
Change in `tauri.conf.json`.

### Step 2: Rewrite `useExternalDragDrop.ts` for inbound drops
- Remove global `blockExternalFileDrop` guard
- Keep `importFilesViaDialog()` unchanged
- Add `useExternalDragDrop()` hook using `getCurrentWebview().onDragDropEvent()`
- On enter/over/drop/leave handle state and call import_files API

### Step 3: Rewrite internal drag from HTML5 to mouse events in `FileTreePanel.tsx`
- Remove all HTML5 drag handlers (handleDragStart, handleDragEnd, handleFolderDragEnter/Leave, handleItemDragOver, handleRootDrag*)
- Keep executeMoveItem, executeMoveOrRename, handleTreeItemMouseDown (Alt+outbound)
- Add handleMouseDown (records start position, attaches window listeners)
- Add handleMouseMove (4px dead zone, elementFromPoint hit-testing, computeDropZone, reorder indicators, auto-expand timers)
- Add handleMouseUp (find drop target via elementFromPoint, execute reorder/move, cleanup)
- Update FileTreeNode: remove HTML5 drag props, remove draggable attribute, add data-tree-is-folder
- Add ghost element via createPortal
- Prevent text selection, handle window blur

### Step 4: Remove root container drag handlers

### Step 5: Update App.tsx to use hook instead of side-effect import

### Step 6: Add CSS for ghost element

### Step 7: Update tests

## Files Modified
- `tauri.conf.json`, `useExternalDragDrop.ts`, `useExternalDragDrop.test.ts`, `FileTreePanel.tsx`, `App.tsx`, `App.css`

## Risk Mitigation
- elementFromPoint performance: throttle via rAF
- Click vs drag: 4px dead zone
- Text selection: preventDefault + user-select none
- Window blur: blur event listener
- Scroll during drag: auto-scroll at edges

---

IMPORTANT CONTEXT: This is a frontend-only change (React + Tauri config). No Rust backend changes. The `import_files` backend command already exists and works. The `fileTreeDnd.ts` utility functions are pure and stay unchanged.

Also important: 9 previous attempts failed. The investigation document at `.claude/research/drag-drop-investigation.md` details each failure. The key lesson is that `dragDropEnabled` on macOS WKWebView is truly mutually exclusive — there is no workaround that preserves both HTML5 drag and native external drops. The proposed approach (mouse events for internal drag) is the only viable path.

Write your review to `.claude/reviews/plans/drag-drop-fix-review-1.md`.

---

## Assistant



Let me read the referenced investigation document and the current source files to ground my review.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/research/drag-drop-investigation.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/hooks/useExternalDragDrop.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/tauri.conf.json"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":100}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"handleDragStart|handleDragEnd|handleFolderDrag|handleItemDragOver|handleRootDrag|onDragStart|onDragOver|onDrop|draggable","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/hooks/useExternalDragDrop.test.ts","limit":50}`

---

## Assistant

Now I have enough context to write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/drag-drop-fix-review-1.md","content":"# Plan Review: Fix All Three Drag-and-Drop Modes\n\n**Reviewer**: plan-reviewer ag`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/drag-drop-fix-review-1.md`.

**Summary of findings:**

- **No blockers.** The plan correctly identifies the root constraint and proposes the only viable architecture (three independent event mechanisms).
- **3 should-fix findings:**
  1. Missing specification for what happens when the cursor leaves the file tree during a mouse-based drag (must cancel, not attempt a move on a non-tree element).
  2. Auto-expand folder timers need explicit cleanup on all cancel paths (cursor leaves, mouseup, blur).
  3. Test plan is too vague -- the complete rewrite of internal drag needs enumerated test cases covering dead zone, move, cancel, reorder, ghost element, inbound drop, and cleanup.
- **4 suggestions:** auto-scroll detail needed, accessibility follow-up, explicit unlisten cleanup for the Tauri hook, and clarify which component renders the hook.

---

