# Improving Claude Code Feedback Loops for BrainMap

Based on analysis of Claude Code Insights report (Mar 10-23, 2026) and discussion on how to reduce friction in BrainMap development.

## The Problem

BrainMap is a visual desktop app (Tauri + React Flow) developed exploratory-style — features are discovered through use, not spec'd upfront. This creates a feedback loop bottleneck:

1. **I often don't know what I want** until I see it built, so upfront specs don't help.
2. **Many bugs are visual/interactive** and can't be caught by unit tests (e.g., "arrows don't highlight inside canvas groups").
3. **Claude can't see the app** — it's a desktop app, the web view is unused, and Claude in Chrome is too unreliable/slow to be practical.

The Insights report confirms: 22 canvas editor sessions, 34 "wrong approach" events, 42 "buggy code" events, and most sessions landing at "mostly achieved" instead of "fully achieved."

## Action Items

### 1. Create an `/explore-feature` skill

**Effort: Low | Impact: Medium**

Encodes the exploratory workflow so Claude doesn't over-invest in the first pass.

Create `.claude/skills/explore-feature/SKILL.md`:

```markdown
## Explore Feature Workflow

This is an exploratory session. The user doesn't have a fixed spec.

### Phase 1 — Quick Prototype
- Build the minimal version fast
- Skip tests, skip polish, skip edge cases
- Tell the user: "Here's a rough version — try it and tell me what feels wrong"
- STOP and wait for feedback

### Phase 2 — Refine (repeat as needed)
- User will share screenshots or describe what's off
- Make targeted fixes only — don't redesign
- After each change, ask: "Want to keep iterating or is this good enough to polish?"

### Phase 3 — Harden (only when user says "polish it")
- Add error handling for edge cases
- Run the post-edit checklist
- Write tests for the finalized behavior
- Commit
```

### 2. Create a post-edit canvas regression checker (hook)

**Effort: Low | Impact: Medium-High**

Automatically flags common canvas regressions after CSS/TSX edits. Runs as a Claude Code hook on every file edit — no manual steps needed.

Add to `.claude/settings.json`:

```jsonc
{
  "hooks": {
    "afterEdit": {
      "command": "node scripts/canvas-post-edit-check.js $FILE",
      "description": "Checks for common canvas regressions after edits"
    }
  }
}
```

Create `scripts/canvas-post-edit-check.js` that checks for:

- **Hardcoded colors** (hex values in color/background/border) — breaks dark mode
- **z-index without context** — causes stacking bugs
- **`!important`** — CSS specificity smell, usually means the real issue isn't fixed
- **`pointer-events: none`** — breaks edge/node selection

These are the exact mechanical mistakes the Insights report flagged across multiple sessions.

### 3. Create a `MANUAL_TESTS.md` for interactive behaviors

**Effort: Low | Impact: Medium**

A checklist of interactive behaviors that matter. Claude reads it after making changes and flags which ones might be affected. Doesn't verify anything automatically, but forces Claude to think about interaction consequences before declaring "done."

Candidate entries:

- [ ] Hover over edges inside/outside groups — highlight works
- [ ] Select multiple nodes — selection toolbar appears
- [ ] Dark mode toggle — no hardcoded colors visible
- [ ] Collapse/expand groups — edges reconnect correctly
- [ ] Undo/redo after resize — state restores properly
- [ ] Drag node between groups — no stale styles
- [ ] Minimap reflects current viewport
- [ ] Snap-to-grid works during drag

Add a CLAUDE.md instruction: "After editing canvas CSS or React Flow components, review `MANUAL_TESTS.md` and flag which items might be affected by your changes."

### 4. Get the web view working (stretch goal)

**Effort: High | Impact: High**

If the Tauri web view could render the canvas reliably, it opens the door to:

- Automated screenshot capture after CSS changes (before/after diffs)
- Claude seeing what it built without relying on me
- Possibly headless rendering for CI-level visual regression

This is the highest-impact item but also the most investment. Worth revisiting after items 1-3 are in place and the simpler improvements have been validated.

## What won't help

- **Claude in Chrome** — confirmed unreliable and slow, not worth investing in.
- **More upfront specs** — counterproductive for exploratory development.
- **Parallel sub-agents for features** — visual features interact in CSS/layout; parallel execution would create merge conflicts.
- **Forcing detailed descriptions of interactive bugs** — some things just need to be seen; the goal is making feedback faster to give, not eliminating the human tester.

## Key insight

For interactive visual bugs on a desktop app without browser automation, **I remain the tester**. The goal is:
- Make Claude's first attempt better (post-edit checks, manual test awareness)
- Make throwaway work cheaper (explore-feature skill)
- Make my feedback faster to give (screenshots when possible, precise interaction sequences when not)
