# 2026-03-11 — Subagent Transcript: general-purpose

**Date:** 2026-03-11 14:35:38
**Agent:** general-purpose
**Agent ID:** a57c01b1a1e813e0a
**Parent Session:** 8727a794-9f8b-4fa5-8b62-c536a3ec7ee1

---

## User

You are a plan reviewer for BrainMap, a desktop knowledge graph app. Review the following implementation plan and write your findings to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/zoom-keyboard-shortcuts-review-1.md`.

## Review Criteria (from plan-reviewer agent)

You are reviewing an implementation plan for BrainMap, a Rust knowledge graph tool. Your job is to find real problems before code gets written.

### Project Context
- Rust workspace: `crates/core` (library), `crates/cli` (CLI), `crates/app` (desktop Tauri+React)
- Core library owns all data operations; interfaces are thin wrappers
- Files (.md with YAML frontmatter) are source of truth
- In-memory graph + SQLite FTS5 index
- Desktop app uses Zustand stores, CSS custom properties for fonts/theme

### What to Review

1. **Architectural Alignment** - Does it respect existing module boundaries? Consistent with existing patterns?
2. **Scope and Complexity** - Doing more than asked? Simpler alternatives? Premature abstractions?
3. **Edge Cases and Risks** - Failure modes? Ordering dependencies?
4. **Test Strategy** - Tests for each new behavior? Edge cases covered?
5. **Data Model Impact** - Serialization compatibility? Backward-compatible fields?

### Output Format
For each finding:
- **Category**: [architecture, scope, edge-case, testing, data-model, performance, clarity]
- **Severity**: [blocker, should-fix, suggestion]
- **Finding**: what the problem is
- **Recommendation**: what to do

Skip categories with no issues. If the plan is solid, say so briefly.

## Plan to Review

```markdown
# Plan: Cmd+`+`/`-`/`0` Global Zoom for All Panels

## Context
The desktop app has per-panel font size controls in Settings, but no quick global zoom. Users expect browser-style Cmd+`+`/`-`/`0` to uniformly scale the entire UI without touching font settings.

## Approach
Apply CSS `zoom` on the `.app` div via inline style driven by a `uiZoom` store value. CSS `zoom` uniformly scales everything — fonts, borders, icons, layout — making it the correct primitive for "zoom all panels". Font size settings remain independent.

Zoom step: 0.1 (10%), range: 0.5–2.0, default: 1.0.

## Files to Modify
- `crates/app/src/stores/uiStore.ts` — add zoom state + actions
- `crates/app/src/App.tsx` — apply zoom CSS + keyboard handlers
- `crates/app/src/stores/uiStore.test.ts` — add tests for zoom actions

## Step-by-Step

### 1. uiStore.ts — add zoom
Add `uiZoom?: number` to PersistedPrefs, `uiZoom: number` + three actions to UIState.
Actions clamp to [0.5, 2.0], round to 1 decimal, save to `brainmap:uiPrefs`.
Also include `uiZoom` in every existing `savePrefs(...)` call to avoid clobbering.

### 2. App.tsx — apply zoom + keyboard handlers
Subscribe to `uiZoom`. Apply as `<div className="app" style={{ zoom: uiZoom }}>`.
Add Cmd+`+`/`=`, Cmd+`-`, Cmd+`0` to handleKeyDown.

### 3. uiStore.test.ts — add tests
5 tests: zoomIn increments, zoomOut decrements, resetZoom, clamp at 2.0, clamp at 0.5.

### 4. Documentation updates
Update CLAUDE.md and MEMORY.md.
```

## Additional Context
- Current `savePrefs` in uiStore.ts explicitly lists all 5 fields: `{ theme, uiFontFamily, uiFontSize, editorFontFamily, editorFontSize }`. Each setter calls this with all current values + its own updated field. If `uiZoom` is not added to every call site, it gets dropped.
- The app `.app` div is in App.tsx line 121: `<div className="app">`
- CSS `zoom` is a non-standard but widely supported property. In Tauri (Chromium-based), it works well.
- The `handleKeyDown` callback has `[]` as deps (line 94) — no closures over state, uses `useUIStore.getState()` pattern consistently.

Write your review findings to the output file, then return a brief summary of what you found.

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.test.ts"}`

---

## Assistant

Now I have a thorough understanding of the codebase. Let me write the review.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"mkdir -p /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans","description":"Create reviews/plans directory if it doesn't exist"}`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/zoom-keyboard-shortcuts-review-1.md","content":"# Plan Review: Cmd+`+`/`-`/`0` Global Zoom for All Panels\n\n**Reviewer:`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/zoom-keyboard-shortcuts-review-1.md`.

**Summary of findings — no blockers, three should-fix items:**

1. **`resetFontPrefs` call site omitted (should-fix):** The plan lists all `savePrefs` call sites to update with `uiZoom`, but misses `resetFontPrefs` (line 236–240 of `uiStore.ts`). Clicking "Reset Fonts" in Settings will silently drop the user's zoom level back to `undefined`.

2. **Missing `beforeEach` reset in tests (should-fix):** The zoom tests need `useUIStore.setState({ uiZoom: 1.0 })` in a `beforeEach`, otherwise tests that hit the clamp at 2.0 will corrupt state for subsequent tests that assume a 1.0 baseline.

3. **`Cmd++` vs `Cmd+=` key event ambiguity (should-fix):** `+` requires Shift on most keyboards, producing `e.key === "+"`, while `=` without Shift produces `e.key === "="`. The implementation must match both, otherwise `Cmd++` (the visually obvious shortcut) does nothing.

Two suggestions were also noted: a `flushPrefs()` helper to eliminate the fragile multi-site enumeration pattern, and a localStorage round-trip test to directly validate the clobber-fix the plan correctly identified.

---

