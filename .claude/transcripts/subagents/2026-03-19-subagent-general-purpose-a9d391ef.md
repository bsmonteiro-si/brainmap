# 2026-03-19 — Subagent Transcript: general-purpose

**Date:** 2026-03-19 11:53:29
**Agent:** general-purpose
**Agent ID:** a9d391efacc96cc90
**Parent Session:** 2071fa22-c95f-42b9-ad13-3ed94950f981

---

## User

You are reviewing an implementation plan for BrainMap. Here are the review criteria:

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

# Plan: Drag-and-drop file path insertion in CodeMirror editor

## Context

The user drags files from Finder/terminal into other apps and expects absolute file paths to be inserted (terminal behavior). The BrainMap editor doesn't support this yet. Tauri v2 provides a drag-drop API that gives absolute file paths and drop coordinates, which we can use with CodeMirror's `posAtCoords` to insert at the correct position.

## Changes

### 1. Enable Tauri drag-drop (`tauri.conf.json`)

Change `"dragDropEnabled": false` to `"dragDropEnabled": true` (line 20).

This makes Tauri intercept OS-level file drops and emit `tauri://drag-drop` events with `{ paths: string[], position: { x, y } }`. Internal DOM drag-and-drop (file tree, tab bar) is unaffected.

### 2. Add drop handler in `MarkdownEditor.tsx`

**Add import**: `listen` from `@tauri-apps/api/event`

**Add `readOnlyRef`** (alongside existing `onChangeRef`, `contentRef`, `uiZoomRef`):
```ts
const readOnlyRef = useRef(readOnly);
// in "Keep refs up-to-date" block:
readOnlyRef.current = readOnly;
```

**Add `useEffect`** for the Tauri drag-drop listener (after content-sync effect):
```ts
useEffect(() => {
  let unlisten: (() => void) | null = null;

  listen<{ paths: string[]; position: { x: number; y: number } }>(
    "tauri://drag-drop",
    (event) => {
      const view = viewRef.current;
      if (!view || readOnlyRef.current) return;

      const { paths, position } = event.payload;
      if (!paths.length) return;

      const pos = view.posAtCoords({ x: position.x, y: position.y });
      if (pos === null) return; // drop was outside this editor

      const text = paths.join("\n");
      view.dispatch({
        changes: { from: pos, insert: text },
        selection: { anchor: pos + text.length },
      });
      view.focus();
    }
  ).then((fn) => { unlisten = fn; });

  return () => { unlisten?.(); };
}, []);
```

**Add DOM drop prevention** as a CM extension in the editor creation effect:
```ts
EditorView.domEventHandlers({
  drop(event) {
    if (event.dataTransfer?.files.length) {
      event.preventDefault();
      return true;
    }
    return false;
  },
})
```

## Key design decisions

- **Empty deps `[]`**: uses refs (`viewRef`, `readOnlyRef`, `uiZoomRef`) so no re-subscription needed
- **`posAtCoords` as guard**: returns null if coordinates are outside the editor area, so drops on graph/file-tree are ignored
- **No zoom adjustment**: the existing `patchCMScaleDetection` makes CM's `posAtCoords` account for CSS zoom. If testing reveals issues, divide position by `uiZoomRef.current`
- **`view.focus()`** after insertion so user can continue typing
- **Multiple files**: joined by `\n`, one path per line (matches terminal behavior)

## Files to modify

1. `crates/app/src-tauri/tauri.conf.json` - enable `dragDropEnabled`
2. `crates/app/src/components/Editor/MarkdownEditor.tsx` - add readOnlyRef + useEffect + DOM drop prevention

## Verification

1. Drag single file from Finder into editor - absolute path inserted at drop position
2. Drag multiple files - one path per line
3. Drag file while editor is read-only - nothing inserted
4. Drag file onto non-editor area (graph, file tree) - nothing happens
5. Test at zoom != 1.0 - path inserted at correct position
6. Verify tab bar drag reorder still works
7. Verify file tree drag-and-drop still works

---

Please write your review to the file: `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/file-drop-paths-review-1.md`

Also read any relevant files in the codebase to verify assumptions made in the plan. Key files:
- `crates/app/src-tauri/tauri.conf.json`
- `crates/app/src/components/Editor/MarkdownEditor.tsx`
- `crates/app/src/components/Editor/cmSmartPaste.ts` (similar pattern)
- `crates/app/src/components/Layout/FileTreePanel.tsx` (existing DnD)
- `crates/app/src/components/Editor/TabBar.tsx` (existing DnD)

---

## Assistant



Let me read the relevant files to verify the plan's assumptions.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/tauri.conf.json"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmSmartPaste.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx"}`

---

## Assistant

Now let me check how the FileTreePanel handles drag-drop to understand potential conflicts with enabling `dragDropEnabled`.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"dragDropEnabled|drag-drop|tauri://drag","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"onDragStart|onDragOver|onDrop|dragover|draggable","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content","head_limi`

---

## Assistant

Now let me check the Tauri v2 drag-drop event behavior more carefully -- specifically whether enabling `dragDropEnabled` might interfere with internal DOM drag events.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"dataTransfer|setData|getData","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"dataTransfer|setData|getData","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx","output_mode":"content"}`

---

## Assistant

Now I have all the information I need. Let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/file-drop-paths-review-1.md","content":"# Plan Review: Drag-and-drop file path insertion in CodeMirror editor\n\n## Find`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/file-drop-paths-review-1.md`.

**Summary of findings:**

1. **Blocker**: Enabling `dragDropEnabled: true` may break the existing file tree and tab bar drag-and-drop, which both rely on internal HTML5 DnD. This needs verification before committing to the approach -- an alternative using `dataTransfer.files` in a CM `drop` handler (without Tauri's `dragDropEnabled`) may be safer.

2. **Should-fix (5 items)**:
   - Race condition in the `listen()` Promise cleanup -- if component unmounts before the Promise resolves, the listener leaks.
   - DOM drop prevention must also handle `dragover`, not just `drop`, or the browser may still navigate to dropped files.
   - Multiple editor instances will all receive the global Tauri event -- need a bounds check before `posAtCoords` to prevent duplicate insertions.
   - No tests in the plan despite the project's strong testing culture (429 Vitest tests).
   - The DOM drop handler extension placement is ambiguous -- it should go unconditionally at the top of the extensions array (before `readOnly`/`raw` checks).

3. **Suggestion**: Verify that internal file tree drags don't trigger the Tauri `drag-drop` event.

---

