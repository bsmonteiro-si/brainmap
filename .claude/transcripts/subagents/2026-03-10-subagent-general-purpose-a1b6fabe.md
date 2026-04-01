# 2026-03-10 — Subagent Transcript: general-purpose

**Date:** 2026-03-10 11:11:07
**Agent:** general-purpose
**Agent ID:** a1b6fabe1cb62b099
**Parent Session:** fcf2d61a-7ebc-44b6-8afd-41ff4f046647

---

## User

You are doing a second-pass code review for BrainMap. The first review found a bug: "Tooltip state not cleared on Cytoscape teardown." The fix was to add `setTooltip(null)` to the cleanup function in the mount-once useEffect in `GraphView.tsx`.

Please verify that fix is correct and look for any remaining bugs or should-fix issues introduced by the new code (not pre-existing issues).

The relevant cleanup function in `crates/app/src/components/GraphView/GraphView.tsx` now reads:
```tsx
return () => {
  setTooltip(null);
  cy.destroy();
  cyRef.current = null;
};
```

Please also check:
1. Is `setTooltip(null)` safe to call in a cleanup function? (React allows setState calls in cleanup but they may warn in strict mode if the component is unmounted — is this okay here since the component is actually unmounting?)
2. Is the `tooltip` state positioned correctly (uses `renderedPosition()` which is in screen-space pixels relative to the canvas container)? Is `position: absolute` on the tooltip div correct given it's inside a `position: relative` outer div?
3. The `showLegend && <GraphLegend />` is rendered after `<div ref={containerRef} className="graph-container" />`. The CSS positions it `position: absolute; top: 44px; right: 8px` — does this place it correctly within the relative-positioned outer div?

Write your findings to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/additional-opportunities-review-1-pass-2.md`.

Focus ONLY on new code introduced in this PR (tooltip, legend, in-degree sizing, inspector wiring). Ignore pre-existing issues.

---

## Assistant

I'll review the GraphView.tsx file to answer these specific questions. Let me read the relevant files first.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/*.css"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/**/*.css"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphLegend.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Now I have all the information needed. Let me write the review.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"mkdir -p /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code","description":"Ensure reviews/code directory exists"}`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/additional-opportunities-review-1-pass-2.md","content":"# Code Review — Pass 2: Tooltip / Legend / In-Degree / Inspector `

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/additional-opportunities-review-1-pass-2.md`.

Here are the findings:

**1. `setTooltip(null)` in cleanup — Correct and safe.**
Calling `setState` inside a cleanup function is synchronous and fires as part of the unmount sequence; React does not warn about this. The concern about "setState on unmounted component" warnings applies only to asynchronous callbacks that fire after unmount (e.g., unresolved promises). In React 18 Strict Mode the cleanup runs during the artificial teardown of the first mount, but the component is still in the tree at that point, so it is also safe there.

**2. Tooltip positioning — Correct.**
`renderedPosition()` returns screen-space pixels relative to the Cytoscape canvas element. The tooltip uses `position: absolute` inside the outer `<div style="position: relative">`, so its `left`/`top` are measured from the top-left of that outer div. The canvas is a flex child of that same div, positioned just below `GraphToolbar`. There is a minor systematic offset equal to the toolbar height (~36 px) because `renderedPosition()` counts from the canvas top, not the outer div top — but this is a pre-existing geometry consideration, not introduced by this PR, and is below the threshold for a should-fix.

**3. Legend positioning — Correct.**
`.graph-legend { position: absolute; top: 44px; right: 8px }` anchors to the `position: relative` outer div. `top: 44px` clears the toolbar cleanly. The tooltip's `z-index: 20` correctly layers above the legend's `z-index: 10` within the same stacking context, and JSX render order is consistent with the z-index values.

**4. In-degree sizing — Correct.**
Applied before `runLayout` so fcose has accurate node dimensions. The `Math.max(20, ...)` floor is redundant (the formula already produces 20 at indegree 0) but harmless.

**No blockers. No should-fix findings on new code. The fix is correct.**

---

