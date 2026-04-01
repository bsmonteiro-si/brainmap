# 2026-03-11 — Subagent Transcript: general-purpose

**Date:** 2026-03-11 19:57:10
**Agent:** general-purpose
**Agent ID:** a5ad0f088019b239e
**Parent Session:** cac98a5e-bb31-4585-8135-4876e33d5c71

---

## User

You are reviewing an implementation plan for BrainMap, a Rust knowledge graph tool. Your job is to find real problems before code gets written.

## Project Context

- Rust workspace: `crates/core` (library), `crates/cli` (CLI), `crates/tauri-plugin` (desktop)
- Core library owns all data operations; interfaces are thin wrappers
- Files (.md with YAML frontmatter) are source of truth
- In-memory graph + SQLite FTS5 index
- Specs live in `docs/` (vision, data model, CLI spec, MCP spec, desktop, architecture, roadmap)
- Desktop app: Tauri v2 + React 18 + Zustand + Cytoscape.js + CodeMirror 6

## What to Review

### 1. Architectural Alignment
- Does the plan respect the existing module boundaries?
- Is it consistent with the specs?

### 2. Scope and Complexity
- Is the plan doing more than what was asked? Flag any scope creep.
- Are there simpler alternatives to what's proposed?

### 3. Edge Cases and Risks
- What failure modes are unhandled?
- What happens if the implementation is interrupted halfway?

### 4. Test Strategy
- Does the plan include tests for each new behavior?
- Are edge cases and error paths tested, not just happy paths?

## Output Format

Write your review as a list of findings. For each finding:
- **Category**: one of [architecture, scope, edge-case, testing, data-model, performance, clarity]
- **Severity**: one of [blocker, should-fix, suggestion]
- **Finding**: what the problem is
- **Recommendation**: what to do instead

If you find no issues in a category, skip it. If the plan is solid, say so briefly.

Do NOT pad your review with praise or filler. Only real findings.

---

## THE PLAN TO REVIEW:

# Fix CSS Zoom + CodeMirror Coordinate Mismatch

## Context

Cmd+/- global zoom uses `document.documentElement.style.zoom` (set in `App.tsx:132`). This breaks CodeMirror's mouse coordinate calculations — clicks land at wrong positions. CSS `zoom` was chosen over `transform: scale()` on `documentElement` because Cytoscape hit-testing requires it at the root level. The current fix of recreating the editor when `uiZoom` changes (`MarkdownEditor.tsx:87`) does NOT resolve the issue.

**Root cause**: CSS `zoom` on `documentElement` causes a coordinate mismatch between `getBoundingClientRect()` and mouse event coordinates in WebKit (WKWebView used by Tauri on macOS). CodeMirror's `getScale()` function — which compares `rect.width / offsetWidth` to detect CSS transforms — cannot detect CSS `zoom` because both values scale together in WebKit, yielding ratio ≈ 1.0. So CM thinks there's no scaling, but mouse coordinates are in a different space.

**Constraint**: Cannot move zoom to `.app` via `transform: scale()` because `position: fixed` elements (context menu, command palette, settings modal) would break — CSS transforms cause `position: fixed` descendants to be relative to the transformed ancestor, not the viewport.

## Approach: Counter-zoom the CodeMirror container only

Apply `zoom: 1/Z` on the CM container to cancel the ancestor zoom, making CM operate in a 1x coordinate space. Compensate by scaling CM font sizes by Z so text appears at the correct visual size.

This is surgical — only the editor is affected. Cytoscape, modals, context menus all remain on CSS zoom as before.

## Step 1: Set `--ui-zoom` CSS variable

**File: `crates/app/src/App.tsx`** (zoom useEffect at line 129-134)

Add `root.style.setProperty("--ui-zoom", String(uiZoom));` so CSS can reference the zoom factor.

## Step 2: Counter-zoom the CM container

**File: `crates/app/src/components/Editor/MarkdownEditor.tsx`**

Wrap the CM container div in an outer clip div. The inner div gets counter-zoom + expanded dimensions:

```tsx
return (
  <div style={{ height: "100%", overflow: "hidden" }}>
    <div
      ref={containerRef}
      style={{
        width: uiZoom !== 1 ? `${100 * uiZoom}%` : "100%",
        height: uiZoom !== 1 ? `${100 * uiZoom}%` : "100%",
        zoom: uiZoom !== 1 ? 1 / uiZoom : undefined,
      }}
    />
  </div>
);
```

**Layout math** (at ancestor zoom Z):
- Container: `width: 100%*Z` in content px, `zoom: 1/Z` → layout size = `100%*Z * 1/Z = 100%`
- Effective zoom: `Z * 1/Z = 1.0` → CM coordinates work correctly

Keep `uiZoom` in the useEffect dependency array so editor recreates when zoom changes.

## Step 3: Scale CM font size to compensate counter-zoom

**File: `crates/app/src/App.css`** (lines 558-562)

```css
.editor-body .cm-editor .cm-content,
.editor-body .cm-editor .cm-line {
  font-family: var(--editor-font-family) !important;
  font-size: calc(var(--editor-font-size) * var(--ui-zoom, 1)) !important;
}
```

## Files modified

| File | Change |
|------|--------|
| `crates/app/src/App.tsx` | Add `--ui-zoom` CSS variable in zoom useEffect |
| `crates/app/src/components/Editor/MarkdownEditor.tsx` | Wrap CM container with counter-zoom div |
| `crates/app/src/App.css` | Scale CM font-size by `--ui-zoom` |

## Verification

1. At zoom 1.0x: click in editor → cursor lands at click position
2. Cmd+`+` to zoom to 1.5x: click in editor → cursor still lands at click position
3. Cmd+`-` to zoom to 0.8x: same check
4. Cmd+`0` to reset: same check
5. At zoom 1.5x: editor text should appear same size as sidebar text (proportionally)
6. Cytoscape graph: click nodes at zoomed level → still works
7. Context menu: right-click in Files → menu appears at cursor
8. Settings modal / Command Palette: still render correctly at zoom
9. All existing Vitest tests pass

---

Please review this plan. Focus especially on:
1. Whether the counter-zoom layout math is correct (CSS zoom affecting layout sizing)
2. Whether there are edge cases with the font-size calc approach
3. Whether CM gutters, line numbers, scrollbar behaviors might be affected
4. Whether existing tests could break

Write your review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/zoom-codemirror-fix-review-1.md`

---

## Assistant



I'll review the plan by first examining the relevant source files to understand the current implementation.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","offset":125,"limit":20}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":550,"limit":30}`

---

## Assistant

Now let me check if there are CM gutter/line-number styles and look at related CSS.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cm-gutter|cm-lineNumbers|cm-activeLineGutter|cm-scroller","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"editor-body|\\.cm-editor","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":528,"limit":35}`

---

## Assistant

Now I have enough context. Let me write the review.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"mkdir -p /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans","description":"Create reviews directory"}`

---

## Assistant

I'm in plan mode, so I'll write the review to the plan file which is the only file I'm allowed to edit.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/.claude/plans/federated-wandering-crayon-agent-a5ad0f088019b239e.md","content":"# Review: Fix CSS Zoom + CodeMirror Coordinate Mismatch\n\n**Reviewer**: plan-reviewer a`

---

## Assistant

Review complete. Here are the key findings:

**Should-fix (3):**

1. **CM gutters/line numbers not font-scaled** -- The CSS rule only targets `.cm-content` and `.cm-line`. If line numbers are ever enabled, they'll render at the wrong size inside the counter-zoomed container. Fix: apply the scaled font-size to `.editor-body .cm-editor` instead.

2. **Overflow/scroll interaction with clip div** -- The outer `overflow: hidden` clip div could interfere with CM's internal scroll handling if intermediate `height: 100%` resolves against the clip div rather than the inner counter-zoom div. Needs explicit verification with long documents at 1.5x and 2.0x zoom.

3. **No automated tests** -- Only manual verification steps are listed. At minimum, add a Vitest test asserting the container div gets correct `zoom` and dimension styles at different `uiZoom` values.

**Suggestions (3):**

4. **Scrollbar shrinkage** -- Native scrollbars inside the counter-zoomed container will appear at `1/Z` size. Cosmetic-only, low priority.

5. **Heading em units compound correctly** -- Confirmed no issue with the `em`-based heading sizes.

6. **Editor recreation may no longer be needed** (most impactful) -- With counter-zoom handling coordinates via CSS, keeping `uiZoom` in the useEffect dependency array forces unnecessary full editor destruction/recreation, losing cursor position, selection, undo history, and scroll position. Consider removing it for a significant UX improvement.

The review is written to `/Users/bsmonteiro/.claude/plans/federated-wandering-crayon-agent-a5ad0f088019b239e.md` (the plan-mode file). It should be copied to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/zoom-codemirror-fix-review-1.md` once plan mode is exited.

---

