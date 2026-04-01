# 2026-03-10 — Subagent Transcript: general-purpose

**Date:** 2026-03-10 11:38:33
**Agent:** general-purpose
**Agent ID:** a790269b4710946f1
**Parent Session:** 40f16652-2f81-4fab-a16c-648ac36abfe8

---

## User

You are reviewing a frontend visual overhaul for the BrainMap project. The changes are TypeScript/CSS, not Rust. Apply the review criteria below adapted for TypeScript/CSS context (ignore Rust-specific items). Write your findings to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/graph-visual-overhaul-review-1.md`.

## Review Criteria (from code-reviewer.md — adapted for TS/CSS)

### 1. Correctness
- Are there logic bugs? Missed conditions?
- Do the Cytoscape stylesheet properties exist and work as intended?
- Is the `opacity` property on edges correct (it affects the entire element including arrows; `line-opacity` would only affect lines)? Is this intentional?
- Does the `edge.highlighted` selector override `opacity: 0.35` correctly (it sets `opacity: 0.85` which should cascade)?
- Does `min-zoomed-font-size: 9` on nodes correctly hide labels at default zoom (zoom ~1.0)? Check: at zoom 1.0, rendered font size = 11 × 1.0 = 11, which is > 9, so labels would NOT be hidden at default zoom. Is this a bug?
- Does the node sizing formula `Math.max(6, 6 + n.indegree(false) * 2)` match the base stylesheet width of 8? At 0 in-degree, programmatic size = 6 but stylesheet default = 8. This means the `.forEach` always overrides with a potentially smaller value. Is this a bug?

### 2. Visual Consistency
- Does `node:selected` inherit `shadow-color: data(color)` from the base `node` selector? (It should since Cytoscape merges selectors by specificity)
- Does `node.highlighted` also correctly inherit `shadow-color: data(color)`?

### 3. Edge Label Opacity
- `text-opacity: 0.75` is set on edges. When edge `opacity` is 0.35, does `text-opacity` compound (0.75 × 0.35 = ~0.26) or is it independent? This could make labels nearly invisible even when shown.

### 4. fcose `nodeDimensionsIncludeLabels: false`
- Labels are auto-hidden at default zoom. Setting `nodeDimensionsIncludeLabels: false` is consistent with this. No issue.

## Changed Files

### `crates/app/src/components/GraphView/graphStyles.ts` (full file):
```ts
// Color palette for the 10 note types
export const NOTE_TYPE_COLORS: Record<string, string> = {
  concept: "#4a9eff",
  "book-note": "#9b59b6",
  question: "#e67e22",
  reference: "#1abc9c",
  index: "#34495e",
  argument: "#e74c3c",
  evidence: "#27ae60",
  experiment: "#f39c12",
  person: "#2980b9",
  project: "#8e44ad",
};

export function getNodeColor(noteType: string): string {
  return NOTE_TYPE_COLORS[noteType] ?? "#95a5a6";
}

export const graphStylesheet: any[] = [
  {
    selector: "node",
    style: {
      width: 8,
      height: 8,
      "background-color": "data(color)",
      "border-width": 0,
      label: "data(label)",
      "font-size": "11px",
      color: "#cccccc",
      "text-valign": "bottom",
      "text-halign": "center",
      "text-margin-y": 5,
      "text-max-width": "100px",
      "text-wrap": "ellipsis",
      "min-zoomed-font-size": 9,
      "shadow-blur": 10,
      "shadow-color": "data(color)",
      "shadow-opacity": 0.7,
      "shadow-offset-x": 0,
      "shadow-offset-y": 0,
    },
  },
  {
    selector: "node:selected",
    style: {
      width: 14,
      height: 14,
      "border-width": 2,
      "border-color": "#ffffff",
      "border-opacity": 0.9,
      "shadow-blur": 18,
      "shadow-opacity": 1.0,
    },
  },
  {
    selector: "node.highlighted",
    style: {
      width: 10,
      height: 10,
      "shadow-blur": 12,
      "shadow-opacity": 0.85,
    },
  },
  {
    selector: "edge",
    style: {
      width: 0.8,
      "line-color": "#aaaaaa",
      opacity: 0.35,
      "target-arrow-shape": "vee",
      "target-arrow-color": "#aaaaaa",
      "arrow-scale": 0.6,
      "curve-style": "bezier",
      "font-size": "8px",
      color: "#aaaaaa",
      "text-rotation": "autorotate",
      "text-margin-y": -8,
      "text-opacity": 0.75,
    },
  },
  {
    selector: "edge.labeled",
    style: {
      label: "data(label)",
    },
  },
  {
    selector: "edge.highlighted",
    style: {
      "line-color": "#ffffff",
      opacity: 0.85,
      width: 1.5,
    },
  },
  {
    selector: "edge[kind = 'Implicit']",
    style: {
      "line-style": "dashed",
      "line-dash-pattern": [4, 4],
    },
  },
  {
    selector: "edge[kind = 'Inline']",
    style: {
      "line-style": "dotted",
    },
  },
];
```

### `crates/app/src/components/GraphView/GraphView.tsx` — changed lines:
- Node sizing (line 215): `const size = Math.max(6, 6 + n.indegree(false) * 2);`
- fcose params (lines 54-64): `idealEdgeLength: 180, nodeRepulsion: 18000, gravity: 0.15, padding: 60, nodeDimensionsIncludeLabels: false`

### `crates/app/src/App.css` — changed lines:
- `.graph-container` now has `background: #13131a;`

## Output

Write your review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/graph-visual-overhaul-review-1.md`.

For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

Focus on real defects. Be specific about whether `min-zoomed-font-size: 9` actually hides labels at zoom 1.0 (it won't — 11px × 1.0 = 11 > 9), and whether the node sizing formula mismatch with the stylesheet default is a problem.

---

## Assistant

I'll analyze the changed files and write a thorough review.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ 2>/dev/null || mkdir -p /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/","description":"Check or crea`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

Now I have a thorough understanding of all the changed code. Let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/graph-visual-overhaul-review-1.md","content":"# Code Review: Graph Visual Overhaul (Pass 1)\n\n**Reviewed files:**\n- `cr`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/graph-visual-overhaul-review-1.md`.

Here is a summary of findings:

**Bug (1):**
- `GraphView.tsx` line 215 — The node sizing formula `Math.max(6, 6 + indegree * 2)` produces a minimum of 6, which is *smaller* than the stylesheet default of 8. Every node with zero in-degree gets programmatically shrunk below the stylesheet value. The formula base should be raised to 8 (or the stylesheet default lowered to 6) to make them consistent.

**Should-fix (2):**
- `graphStyles.ts` — `min-zoomed-font-size: 9` does not hide node labels at default zoom. At zoom 1.0, rendered font size = 11 × 1.0 = 11px, which exceeds the threshold of 9. Labels will only disappear if the user zooms below ~0.82×. If the intent is label-hiding at default zoom for decluttering, the threshold needs to be above 11 (e.g., 14).
- `graphStyles.ts` — `opacity: 0.35` on the base `edge` selector compounds with `text-opacity: 0.75`, yielding an effective label opacity of ~26%. Edge labels will be essentially invisible when shown. Replacing `opacity` with `line-opacity` would affect only the line and arrow, leaving the label at the intended 75% opacity.

**Suggestions (2):**
- `shadow-color: data(color)` inheritance onto `node.highlighted` and `node:selected` is confirmed correct via Cytoscape selector merging — no action needed.
- A comment explaining the `opacity` vs `line-opacity` tradeoff would prevent future confusion.

---

