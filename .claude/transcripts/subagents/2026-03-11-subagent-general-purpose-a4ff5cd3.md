# 2026-03-11 — Subagent Transcript: general-purpose

**Date:** 2026-03-11 20:29:40
**Agent:** general-purpose
**Agent ID:** a4ff5cd3db5300f64
**Parent Session:** ad145178-00e1-406f-b483-a103e20c14d1

---

## User

You are reviewing TypeScript/React code for BrainMap's graph visual upgrade (Batches 7-8: Minimap, Cluster Hulls, Edge Particles). Review the following changed files for correctness, design, and test coverage.

## Review Criteria (adapted from project's code-reviewer agent):

### 1. Correctness
- Logic bugs, missed conditions, off-by-one errors
- Resource cleanup (requestAnimationFrame, Cytoscape instances, canvas contexts)
- Event listener leaks (are all cy.on() handlers cleaned up with cy.off()?)
- Memory leaks (refs not cleaned up on unmount)

### 2. React Quality
- Are useEffect dependencies correct? Missing or extra deps?
- Are refs used appropriately?
- Any state updates on unmounted components?

### 3. Function Design
- Single responsibility, naming clarity
- Are there overly long functions that should be split?

### 4. Test Coverage
- Are new functions tested?
- Are edge cases covered?

### 5. Performance
- Canvas redraws: are they efficient?
- Are there unnecessary re-renders or re-computations?

## Files to review:

### 1. GraphView.tsx — New useEffects for minimap, hulls, particles, and new JSX elements

Read file: /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx

Focus on:
- Lines 372-490 (new useEffects)
- Lines 510-535 (new JSX elements)
- Minimap sync logic
- Hull/particle canvas lifecycle

### 2. graphHulls.ts — Convex hull algorithm + drawing

Read file: /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphHulls.ts

### 3. graphParticles.ts — Particle animation

Read file: /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphParticles.ts

### 4. graphHulls.test.ts — Convex hull tests

Read file: /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphHulls.test.ts

### 5. uiStore.test.ts — New toggle tests

Read file: /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.test.ts

### 6. App.css — New minimap and canvas overlay styles

Search for "graph-minimap" and "graph-canvas-overlay" in /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css

## Output Format

Write your review to: /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/graph-visual-batch7-8-review-1.md

For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

---

## Assistant



I'll read all the files in parallel first.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphHulls.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphParticles.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphHulls.test.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.test.ts"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"graph-minimap|graph-canvas-overlay","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":5}`

---

## Assistant

Now let me check the uiStore for the toggle actions and the graphStyles for NOTE_TYPE_COLORS.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"toggleMinimap|toggleClusterHulls|toggleEdgeParticles|showMinimap|showClusterHulls|showEdgeParticles","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"export.*NOTE_TYPE_COLORS","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts","output_mode":"content","-C":1}`

---

## Assistant

Now I have all the information needed. Let me write the review.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"mkdir -p /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code","description":"Create reviews directory"}`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/graph-visual-batch7-8-review-1.md","content":"# Code Review: Graph Visual Batch 7-8 (Minimap, Cluster Hulls, Edge Particl`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/graph-visual-batch7-8-review-1.md`.

**Summary of findings (2 bugs, 3 should-fix, 7 suggestions):**

**Bugs:**
- **#5 & #6**: Minimap sync useEffect (line 491) is missing `hiddenEdgeTypes` and `focalPath` in its dependency array. When the user toggles edge type visibility or activates/clears focus mode, the minimap won't update until some other dependency changes.

**Should-fix:**
- **#2**: `graphParticles.ts` resizes the canvas (triggering bitmap reallocation + `getBoundingClientRect` layout reflow) on every animation frame (60fps). Should cache dimensions and only resize when they change.
- **#4**: `drawHulls` is bound to `cy.on("render")`, which fires on every pan/zoom frame. The hull *geometry* (convex hull computation over all nodes) is recomputed each time, but it only actually changes on `layoutstop`. Should cache hull polygons in model coordinates and only recompute on layout/data changes.
- **#7**: `graphParticles.ts` line 7 uses `canvas.getContext("2d")!` with a non-null assertion. Should add a null guard and return a no-op cleanup.

**Notable suggestions:**
- All particles share the same phase (line 31), creating a uniform "march" rather than flowing particles. Adding per-edge phase offsets would look better.
- Toggle states (minimap/hulls/particles) are not persisted to localStorage, unlike other UI preferences.
- No unit tests for `drawHulls` or `startParticleAnimation` (only `convexHull` is tested).

---

