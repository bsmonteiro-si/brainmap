# 2026-03-15 — Subagent Transcript: general-purpose

**Date:** 2026-03-15 10:01:14
**Agent:** general-purpose
**Agent ID:** a579d3b61e3355cbb
**Parent Session:** bc0b2030-baf9-46cb-9e50-475bf12fe6d5

---

## User

You are reviewing code changes for the BrainMap project. Read the code review criteria from `.claude/agents/code-reviewer.md`, then review the following changes and write your feedback to `.claude/reviews/code/tooltip-settings-fix-review-1.md`.

The changes fix two bugs:
1. Related notes footer tooltip used hardcoded CSS font sizes instead of CSS variables from Settings
2. Tooltip data caches in GraphView and RelatedNotesFooter were never invalidated after note edits

Changed files (read the current versions):
- `crates/app/src/App.css` — lines 1910-1947: replaced hardcoded px sizes with CSS variable references
- `crates/app/src/components/GraphView/GraphView.tsx` — around line 224: added useEffect to clear tooltipCacheRef when nodes changes
- `crates/app/src/components/Editor/RelatedNotesFooter.tsx` — around line 23: added useEffect to clear tooltipCacheRef when nodes changes

Review criteria from the agent file. Check for correctness, quality, and any issues.

---

## Assistant



Let me read the required files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/agents/code-reviewer.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1900,"limit":60}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx","offset":210,"limit":30}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx","offset":1,"limit":50}`

---

## Assistant

Now let me check what `nodes` is — whether it's a stable reference or recreated on changes.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"nodes.*Map|setNodes|nodes:","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts","output_mode":"content","head_limit":20}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"--tooltip-font-size|--tooltip-pill-size|--tooltip-summary-size|--tooltip-tag-size","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content"}`

---

## Assistant

Let me check the CSS vars are defined with defaults and check the `tooltip-rel-pill` and `tooltip-status` classes still have hardcoded values.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":15,"limit":20}`

---

## Assistant

Now let me check if `nodes` reference changes properly when graph updates occur (it's a `Map` created fresh on `applyEvent`).

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts","offset":60,"limit":40}`

---

## Assistant

Good — `nodes` is replaced with a new `Map` instance on every mutation, so `useEffect([nodes])` will fire correctly.

Now let me also verify there isn't a potential over-invalidation problem with `nodes` changing on unrelated operations (like expanding a node). But that's actually correct behavior — the cache should be cleared when the graph topology changes since summaries may have changed.

Let me check the graph tooltip CSS to make sure it already uses variables (lines 2020-2100).

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":2020,"limit":80}`

---

## Assistant

I have all the information I need. Let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/tooltip-settings-fix-review-1.md","content":"# Code Review: Tooltip Settings Fix\n\n**Reviewer**: code-reviewer agent\n**`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/tooltip-settings-fix-review-1.md`.

**Summary of findings:**

1. **should-fix**: `.tooltip-rel-pill` and `.tooltip-status` in `App.css` (lines 1929–1937) still have hardcoded `font-size: 11px` while the rest of the related-note-tooltip was migrated to CSS variables. These two classes will not respond to Settings font size changes, which contradicts the intent of the fix.

2. **suggestion**: The cache invalidation via `useEffect([nodes])` is correct (the `nodes` Map reference changes on every graph mutation) but clears the entire cache on any topology change, not just edits. This is acceptable given the cache is a minor optimization.

---

