# 2026-03-23 — Subagent Transcript: general-purpose

**Date:** 2026-03-23 10:57:12
**Agent:** general-purpose
**Agent ID:** a8db1f5420c9c0f8b
**Parent Session:** ba32d326-fdd5-4aff-835b-e5f32483c3c1

---

## User

You are reviewing an implementation plan for BrainMap. Read the plan reviewer criteria below, then review the plan that follows. Write your review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/fix-canvas-edges-review-1.md`.

## Plan Reviewer Agent Criteria

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

## Plan to Review

# Fix Canvas Edge Arrows: Direction, Accuracy, and Targeting

## Context

Canvas arrows are inaccurate, don't always respect direction, and are very hard to click. Three root causes:

1. **Marker inconsistency** — `canvasToFlow()` uses `MarkerType.ArrowClosed` (React Flow built-in markers) but `defaultEdgeOptions`/`onConnect` use `"brainmap-arrow"` (custom SVG markers). Two different rendering systems producing different-looking arrows.
2. **Oversized arrows** — Default `canvasArrowSize=25` on a 1px edge is disproportionate. Arrow `refX=10` places tip exactly at path endpoint, causing visual overshoot into nodes.
3. **Tiny hit area** — Default `canvasEdgeWidth=1` with no `interactionWidth` on `BaseEdge` makes edges nearly impossible to click.

## Changes

### 1. Consistent marker IDs in `canvasTranslation.ts`

**File:** `crates/app/src/components/Editor/canvasTranslation.ts` (lines 171-178)

Replace `MarkerType.ArrowClosed` objects with `"brainmap-arrow"` string IDs:

```ts
// Before
edge.markerEnd = { type: MarkerType.ArrowClosed };
edge.markerStart = { type: MarkerType.ArrowClosed };

// After
edge.markerEnd = ce.color ? `brainmap-arrow-${ce.color}` : "brainmap-arrow";
edge.markerStart = ce.color ? `brainmap-arrow-${ce.color}` : "brainmap-arrow";
```

Remove unused `MarkerType` import if no longer needed.

### 2. Adjust arrow sizing defaults and refX

**File:** `crates/app/src/stores/uiStore.ts` (line 621)
- `canvasArrowSize`: 25 → 12

**File:** `crates/app/src/components/Editor/CanvasEditor.tsx` (lines 1240, 1250)
- `refX="10"` → `refX="8"` on both default and colored markers (pulls arrow tip slightly back to avoid overshooting into nodes)

### 3. Edge interaction width

**File:** `crates/app/src/components/Editor/canvasNodes.tsx` (line 793)
- Add `interactionWidth={20}` to `<BaseEdge>` — creates invisible 20px wide hit area

**File:** `crates/app/src/stores/uiStore.ts` (line 622)
- `canvasEdgeWidth`: 1 → 2

### 4. Add connectionMode="loose"

**File:** `crates/app/src/components/Editor/CanvasEditor.tsx` (~line 1213)
- Add `connectionMode="loose"` prop to `<ReactFlow>` — allows connecting any handle types, reducing missed connections

### 5. Update tests

**File:** `crates/app/src/components/Editor/canvasTranslation.test.ts`
- Line 110: `expect(edges[0].markerEnd).toEqual({ type: "arrowclosed" })` → `.toBe("brainmap-arrow")`
- Line 126: `expect(edges[0].markerStart).toEqual({ type: "arrowclosed" })` → `.toBe("brainmap-arrow")`
- Line 127: `expect(edges[0].markerEnd).toBeUndefined()` — unchanged
- Line 171: Change `markerEnd: { type: "arrowclosed" as const }` → `markerEnd: "brainmap-arrow"`
- Add test for colored edge markers

## Verification

1. Run `npx vitest run` from `crates/app/` — all tests pass
2. Open the sample canvas (`seed/The Smoking Controversy.canvas`) — arrows should point correctly from source to target, be proportionally sized, and be easily clickable
3. Create new edges by dragging between handles — arrows match existing edges
4. Test edge color changes — arrow markers update to match

## Docs

Update `docs/canvas-architecture.md` Edge Architecture section if marker system description changes.

---

IMPORTANT: Also check the following files to verify the plan is correct:
- `crates/app/src/components/Editor/canvasTranslation.ts` — verify the marker code
- `crates/app/src/components/Editor/canvasNodes.tsx` — verify BaseEdge usage and line numbers
- `crates/app/src/components/Editor/CanvasEditor.tsx` — verify marker SVG definitions
- `crates/app/src/components/Editor/canvasTranslation.test.ts` — verify test assertions
- `docs/canvas-architecture.md` — check if edge architecture section needs updates

---

## Assistant



I'll read the referenced files to verify the plan's accuracy before writing the review.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","offset":780,"limit":30}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":1200,"limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.test.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","offset":615,"limit":15}`

---

## Assistant

Now let me check the `BaseEdge` usage more precisely in canvasNodes.tsx and look at the `onConnect` handler.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"BaseEdge","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","output_mode":"content","-C":3}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"onConnect","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_mode":"content","-C":5}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"connectionMode","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_mode":"content"}`

---

## Assistant

Now let me check the `interactionWidth` prop availability and the docs.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"edge.*architecture\\|marker\\|arrow","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/canvas-architecture.md","-i":true,"output_mode":"content","-C":3}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","offset":820,"limit":25}`

---

## Assistant

Let me also check what the `flowToCanvas` round-trip does with the new string marker IDs (since it currently handles both object and string forms) and verify the colored edge marker plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.ts","offset":283,"limit":20}`

---

## Assistant

Good. The `flowToCanvas` already handles both object and string marker forms, so the change from `MarkerType.ArrowClosed` objects to string IDs won't break the reverse direction. Now I have enough information to write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/fix-canvas-edges-review-1.md","content":"# Plan Review: Fix Canvas Edge Arrows\n\n**Reviewer:** plan-reviewer agent\n**D`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/fix-canvas-edges-review-1.md`.

**Summary of findings:**

- **4 should-fix items:**
  1. The plan references `BaseEdge` at line 793 in `canvasNodes.tsx` but it's actually at line 840.
  2. The colored marker test is underspecified -- needs explicit assertions on marker IDs like `"brainmap-arrow-#e74c3c"`.
  3. Missing a `flowToCanvas` test with string marker IDs (the current test only uses the object form `{ type: "arrowclosed" }`).
  4. The coupling between colored marker IDs and `style.stroke` (which drives the SVG `<marker>` defs generation) should be documented with a code comment.

- **2 suggestions:**
  1. `connectionMode="loose"` is tangential to the stated bug scope (but fine as a one-liner).
  2. The `MarkerType` import removal should be stated definitively, not conditionally -- it is confirmed unused after the change.

- **No blockers.** The plan is sound and the `flowToCanvas` path already handles both object and string marker formats, so backward compatibility is maintained.

---

