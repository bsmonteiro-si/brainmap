# 2026-03-12 — Subagent Transcript: Explore

**Date:** 2026-03-12 10:37:01
**Agent:** Explore
**Agent ID:** afc12a5f9efbd242b
**Parent Session:** 40ea6f2b-fc41-4b75-8723-250ce1626b9c

---

## User

I need to understand the current graph node hover behavior in this Tauri+React app. Specifically:

1. How tooltips are shown on hover (the "rich hover tooltip" mentioned in CLAUDE.md)
2. How neighborhood highlighting works on hover (dim non-neighbors to 12% opacity)
3. How/when highlighting is cleared when the mouse leaves

Look at these files thoroughly:
- crates/app/src/components/GraphView/GraphView.tsx
- crates/app/src/components/GraphView/graphStyles.ts

Search for: mouseover, mouseout, hover, tooltip, highlight, opacity, dim, neighborhood, unhover in the GraphView directory.

Return the exact code sections handling these behaviors, with line numbers.

---

## Assistant

I'll help you understand the hover behavior in the GraphView. Let me search through the relevant files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/GraphView/**/*.ts*"}`

---

## Assistant

Now let me read the key files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts"}`

---

## Assistant

Now let me search for any additional hover-related code to ensure I have the complete picture:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"hover|tooltip|neighborhood|mouseover|mouseout","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView","output_mode":"content","context":3}`

---

## Assistant

Perfect! I have all the information needed. Let me provide a comprehensive analysis of the hover behavior:

## Graph Node Hover Behavior Analysis

Here's the complete hover implementation in your GraphView:

### **1. Tooltip Display (Lines 117-242 in GraphView.tsx)**

**Tooltip State Definition (117-126):**
```typescript
const [tooltip, setTooltip] = useState<{
  x: number;
  y: number;
  label: string;
  noteType: string;
  color: string;
  connections: number;
  tags?: string[];
  summary?: string | null;
} | null>(null);
```

**Tooltip Cache (Line 127):**
```typescript
const tooltipCacheRef = useRef<Map<string, NodeSummary>>(new Map());
```

**Mouseover Handler (Lines 203-243):**

On `mouseover` event, the handler:

1. **Gets the hovered node** (lines 204-205):
   ```typescript
   const node = evt.target;
   const nodePath = node.id();
   ```

2. **Applies neighborhood highlighting** (lines 207-209):
   ```typescript
   const neighborhood = node.closedNeighborhood();
   cy.elements().addClass("hover-dim");
   neighborhood.removeClass("hover-dim").addClass("hover-bright");
   ```
   
   - `closedNeighborhood()` includes the node itself + direct neighbors (incoming & outgoing)
   - All elements get `hover-dim` class
   - Neighborhood elements get `hover-dim` removed and `hover-bright` added instead

3. **Triggers pulse animation** (lines 211-214):
   ```typescript
   node.animate(
     { style: { "shadow-blur": 22, "shadow-opacity": 1.0 } },
     { duration: 400, easing: "ease-in-out-sine" },
   );
   ```

4. **Calculates tooltip position** (lines 215-223):
   ```typescript
   const pos = node.renderedPosition();
   const baseTooltip = {
     x: pos.x + 12,  // 12px right offset
     y: pos.y - 8,   // 8px up offset
     label: node.data("label") as string,
     noteType: node.data("noteType") as string,
     color: node.data("color") as string,
     connections: node.degree(false),
   };
   ```

5. **Shows tooltip immediately OR from cache** (lines 225-242):
   - If cached: shows tooltip with tags + summary immediately
   - If not cached: shows basic tooltip, then lazy-loads enriched data via `getNodeSummary()`
   - Only updates tooltip if user is still hovering that node (lines 235-238)

---

### **2. Neighborhood Highlighting via CSS Classes (graphStyles.ts)**

**Hover-Dim Styling (Lines 154-167):**
```typescript
{
  selector: "node.hover-dim",
  style: {
    opacity: 0.25,        // 75% dimming
    "shadow-opacity": 0.1, // Shadow fades too
  },
},
{
  selector: "edge.hover-dim",
  style: {
    "line-opacity": 0.12,  // Edges become nearly invisible
  },
},
```

**Hover-Bright Styling (Lines 168-181):**
```typescript
{
  selector: "node.hover-bright",
  style: {
    "shadow-blur": 14,
    "shadow-opacity": 0.95,
  },
},
{
  selector: "edge.hover-bright",
  style: {
    "line-opacity": 0.7,   // Edges brighten to 70%
    width: 1.2,            // Edges thicken slightly
  },
},
```

**Conflict Resolution (Lines 182-196):**
```typescript
{
  selector: "node.highlighted.hover-dim",  // Selected + hovered + dimmed
  style: {
    opacity: 0.5,          // Keep 50% visible (compromise)
    "shadow-opacity": 0.4,
  },
},
{
  selector: "node:selected.hover-dim",     // Selected + dimmed
  style: {
    opacity: 1.0,          // Selected nodes stay fully visible
    "shadow-opacity": 1.0,
  },
},
```

---

### **3. Clearing Hover State (Lines 245-249)**

**Mouseout Handler:**
```typescript
cy.on("mouseout", "node", () => {
  cy.nodes().stop(true).removeStyle("shadow-blur shadow-opacity");
  cy.elements().removeClass("hover-dim hover-bright");
  setTooltip(null);
});
```

This handler:
- Stops any ongoing animations on nodes
- Removes inline shadow styles (reverts to stylesheet defaults)
- Removes all `hover-dim` and `hover-bright` classes from elements
- Clears the tooltip state

---

### **4. Tooltip Rendering (Lines 600-619)**

```typescript
{tooltip && (
  <div
    className="graph-node-tooltip"
    style={{ left: tooltip.x, top: tooltip.y }}
  >
    <div className="tooltip-header">
      <span className="tooltip-type-pill" style={{ background: tooltip.color }}>
        {tooltip.noteType}
      </span>
      <span className="tooltip-connections">{tooltip.connections} links</span>
    </div>
    <span className="tooltip-title">{tooltip.label}</span>
    {tooltip.summary && <span className="tooltip-summary">{tooltip.summary}</span>}
    {tooltip.tags && tooltip.tags.length > 0 && (
      <div className="tooltip-tags">
        {tooltip.tags.slice(0, 4).map((t) => (
          <span key={t} className="tooltip-tag">{t}</span>
        ))}
      </div>
    )}
  </div>
)}
```

---

### **Summary of Key Files & Line Numbers:**

| Feature | File | Lines |
|---------|------|-------|
| Tooltip state & cache | GraphView.tsx | 117-127 |
| Mouseover handler | GraphView.tsx | 203-243 |
| Mouseout handler | GraphView.tsx | 245-249 |
| Tooltip JSX rendering | GraphView.tsx | 600-619 |
| Hover-dim styles | graphStyles.ts | 154-167 |
| Hover-bright styles | graphStyles.ts | 168-181 |
| Conflict resolution | graphStyles.ts | 182-196 |

---

