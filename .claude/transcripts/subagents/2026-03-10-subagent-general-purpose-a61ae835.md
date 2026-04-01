# 2026-03-10 — Subagent Transcript: general-purpose

**Date:** 2026-03-10 11:33:45
**Agent:** general-purpose
**Agent ID:** a61ae835c7042ffb5
**Parent Session:** 122b6c40-2be7-4135-a320-7761b83206bc

---

## User

Review this implementation plan for BrainMap's Obsidian-style graph visual overhaul. Write findings to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/graph-visual-overhaul-review-1.md`.

## Plan to Review

```markdown
# Implementation Plan: Obsidian-Style Graph Visual Overhaul

## Context

The current graph looks functional but dated: 24px nodes with always-visible labels, 1.5px solid edges with triangle arrows, and no glow or depth. The user wants a visual overhaul inspired by Obsidian's graph — small glowing nodes, labels that appear only when zoomed in, thin transparent edges, and a physics layout that spreads the graph more organically.

This is a pure **visual/aesthetic change** — no data model, store, or backend changes needed.

## Critical Files

| File | Change |
|---|---|
| `crates/app/src/components/GraphView/graphStyles.ts` | Full visual overhaul — node size, glow, edge style, label auto-hide |
| `crates/app/src/components/GraphView/GraphView.tsx` | Node sizing formula, fcose params |
| `crates/app/src/App.css` | `.graph-container` background |

## Step 1: graphStyles.ts — Full visual overhaul

### 1a. Dark graph background via the core selector
- `active-bg-color: "#13131a"` on the `core` selector
- `.graph-container` CSS gets `background: #13131a`

### 1b. Nodes — smaller (8px), shadow glow, min-zoomed-font-size: 14 for auto-hide
- width/height: 8
- shadow-blur: 10, shadow-color: data(color), shadow-opacity: 0.7
- min-zoomed-font-size: 14 (hides labels at zoom < ~1.3)

### 1c. Selected node — 14px, white ring, strong glow

### 1d. Highlighted neighbors — 10px, stronger glow

### 1e. Edges — 0.8px, opacity 0.35, no arrows (target-arrow-shape: none)

### 1f. Edge highlighted — 1.5px, opacity 0.85, white color

### 1g. Keep edge dash/dot variants

## Step 2: GraphView.tsx — Node sizing + fcose params

### 2a. Node sizing: Math.max(6, 6 + n.indegree(false) * 2) — was Math.max(20, 20 + n.indegree(false) * 4)

### 2b. fcose params: idealEdgeLength 180 (was 120), nodeRepulsion 18000 (was 8000), gravity 0.08 (was 0.25), animate: true, animationDuration: 600

### 2c. nodeDimensionsIncludeLabels: false (was true)

## Step 3: App.css — background: #13131a on .graph-container
```

## Review Criteria (from plan-reviewer.md)

You are reviewing an implementation plan for BrainMap, a Rust knowledge graph tool. Your job is to find real problems before code gets written.

### 1. Architectural Alignment
- Does the plan respect the existing module boundaries?
- Does it avoid leaking implementation details across module boundaries?

### 2. Scope and Complexity
- Is the plan doing more than what was asked? Flag any scope creep.
- Are there simpler alternatives to what's proposed?

### 3. Edge Cases and Risks
- What failure modes are unhandled?
- Are there ordering dependencies between steps that aren't called out?
- Specific for this plan: Does `animate: true` in fcose conflict with the existing `runLayout` being called on graph data changes (could cause layout animation to fire repeatedly)?
- Does the `min-zoomed-font-size` label-hiding interact correctly with the existing zoom-handler that also controls edge label visibility?
- Does removing arrows break the visual semantics of directed relationships (causes, leads-to, etc.)?
- Does changing the fcose gravity from 0.25 to 0.08 risk producing a disconnected-looking layout where isolated nodes float very far from the main cluster?

### 4. Test Strategy
- This is UI-only. No Rust tests affected. Verify build passes.

### 5. Data Model Impact
- None expected. Confirm.

## Output

Write findings to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/graph-visual-overhaul-review-1.md` using format: category, severity (blocker/should-fix/suggestion), finding, recommendation.

---

## Assistant

I'll review the implementation plan by first examining the relevant files to understand the current state of the code.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Now I have a thorough understanding of the existing code. Let me write the review findings.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"mkdir -p /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans","description":"Ensure reviews/plans directory exists"}`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/graph-visual-overhaul-review-1.md","content":"# Plan Review: Obsidian-Style Graph Visual Overhaul\n\nReviewed against co`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/graph-visual-overhaul-review-1.md`.

Here is a summary of the findings:

**4 should-fix findings** (must be addressed before implementation):

1. **animate: true fires on data-sync, not just layout switches** — `runLayout` is called inside the `[nodes, edges]` effect that fires on every data change. Enabling `animate: true` globally means every note open or expand triggers a full animated layout re-run, resetting user pan/zoom. Fix: scope animation to the layout-switch effect only.

2. **min-zoomed-font-size threshold misaligns with existing zoom handler** — The auto-hide threshold implied by `min-zoomed-font-size: 14` on 10px text is ~zoom 1.3, but the existing zoom handler auto-shows edge labels at zoom 0.8. This creates a band where edges display labels but nodes do not, which looks disjointed. The two systems need aligned thresholds.

3. **Removing all arrows loses directional semantics** — 8 relationship types in `DIRECTIONAL_RELS` (`causes`, `leads-to`, `precedes`, etc.) are explicitly directional. The plan removes all arrows, making these indistinguishable from symmetric relationships. Recommend ghost/subtle arrowheads rather than `target-arrow-shape: none`.

4. **Gravity 0.08 risks isolated nodes drifting off-canvas** — With very low gravity, weakly-connected nodes (especially `index` types in the seed dataset) will float far from the main cluster. Recommend 0.12–0.18 or add `gravityRange` clamping.

**5 suggestions** (notable but non-blocking): the `active-bg-color` on the `core` selector has no effect on canvas background (only Step 3's CSS does); hardcoded `#13131a` breaks light mode (should use a CSS variable); `nodeDimensionsIncludeLabels: false` increases label collision risk at high zoom; removing arrows from the base edge selector while `edge.highlighted` still sets `target-arrow-color` will cause inconsistency; and no manual smoke-test checklist is included.

---

