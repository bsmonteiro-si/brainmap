# 2026-03-11 — Subagent Transcript: Explore

**Date:** 2026-03-11 20:41:09
**Agent:** Explore
**Agent ID:** ab7dc636933f6c666
**Parent Session:** ad145178-00e1-406f-b483-a103e20c14d1

---

## User

Explore the graph view hover, tooltip, and highlight behavior in the BrainMap app. I need to understand:

1. **Tooltip rendering**: How is the tooltip shown on hover? Look at GraphView.tsx for the tooltip state, the mouseover/mouseout handlers, and the tooltip JSX. Check if there's any CSS issue that might hide it (z-index, visibility, opacity). Check App.css for `.graph-node-tooltip` styles.

2. **Hover highlight cleanup**: Look at the mouseover/mouseout handlers in GraphView.tsx. Are the `hover-dim` and `hover-bright` classes properly removed on mouseout? Is there any case where they could stick around?

3. **Dim opacity values**: Check graphStyles.ts for the `hover-dim` selector opacity values. Current values might be too aggressive (opacity: 0.12 for nodes, line-opacity: 0.06 for edges).

4. **Graph container structure**: The graph container was recently wrapped in a new parent div. Check if the tooltip positioning (absolute, left/top from rendered node position) still works correctly relative to the container hierarchy.

Files to check:
- /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx (focus on mouseover/mouseout handlers ~line 202-248 and tooltip JSX ~line 500+)
- /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts (hover-dim/hover-bright selectors)
- /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css (search for graph-node-tooltip, graph-container, graph-canvas-overlay)

Thoroughness: very thorough

---

## Assistant

I'll explore the graph view hover, tooltip, and highlight behavior by examining the specified files.

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

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Let me read the full App.css file to see the tooltip and graph container styles:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"wc -l \"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css\""}`

---

## Assistant

Let me search for the key CSS classes:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"graph-node-tooltip|graph-container|graph-canvas-overlay","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content"}`

---

## Assistant

Now let me read those specific sections:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":128,"limit":15}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1315,"limit":85}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1393,"limit":15}`

---

## Assistant

Now let me check the container structure more carefully to understand the positioning context:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx","offset":559,"limit":65}`

---

## Assistant

Perfect. Now let me check the hover handler code more carefully:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx","offset":203,"limit":47}`

---

## Assistant

Excellent. Now let me look at the graphStyles hover selectors more closely:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts","offset":154,"limit":44}`

---

## Assistant

Perfect. Now let me check if there are any tests related to hovering or tooltips:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -name \"*.test.ts\" -o -name \"*.test.tsx\" -o -name \"*.spec.ts\" -o -name \"*.spec.tsx\" | head -20"}`

---

## Assistant

Let me check the graphStyles test to see if there are any tests related to hover behavior:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.test.ts"}`

---

## Assistant

Let me search for any reference to hover behavior or tooltip in test files:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"hover\\|tooltip\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.test.ts\" --include=\"*.test.tsx\" 2>/dev/null | head -20"}`

---

## Assistant

Now let me check the main return structure to understand the positioning context better:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"position.*relative\\|position.*absolute\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -30"}`

---

## Assistant

Perfect. Now I have all the information I need. Let me create a comprehensive analysis document based on my thorough exploration:

## Comprehensive Analysis: Graph View Hover, Tooltip, and Highlight Behavior

Based on my thorough exploration of the BrainMap graph view code, here's what I found:

### 1. **Tooltip Rendering**

**Location:** `GraphView.tsx` lines 117-126 (state) and 602-621 (JSX)

**State Structure:**
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

**Rendering:** The tooltip is positioned absolutely with calculated pixel coordinates from the node's rendered position:
- `x: pos.x + 12` (12px offset right)
- `y: pos.y - 8` (8px offset up)

**CSS Styling (`App.css` lines 1315-1390):**
- `z-index: 20` (high enough to appear above all graph elements)
- `pointer-events: none` (doesn't interfere with graph interaction)
- `position: absolute` with `left` and `top` set inline
- Backdrop blur (10px) with fallback `-webkit-backdrop-filter`
- Responsive to theme via `[data-theme="dark"]` and `[data-theme="light"]` selectors

**No CSS visibility/opacity issues detected** — the tooltip uses proper z-index, no hidden `display: none` or `visibility: hidden`.

---

### 2. **Hover Highlight Cleanup**

**mouseover Handler (`GraphView.tsx` lines 203-243):**
```typescript
cy.on("mouseover", "node", (evt) => {
  const neighborhood = node.closedNeighborhood();
  cy.elements().addClass("hover-dim");
  neighborhood.removeClass("hover-dim").addClass("hover-bright");
  // ... tooltip logic
});
```

**mouseout Handler (`GraphView.tsx` lines 245-249):**
```typescript
cy.on("mouseout", "node", () => {
  cy.nodes().stop(true);
  cy.elements().removeClass("hover-dim hover-bright");
  setTooltip(null);
});
```

**Cleanup Status:** CLEAN
- ✅ `hover-dim` and `hover-bright` are properly removed on mouseout via `removeClass("hover-dim hover-bright")`
- ✅ All node animations are stopped with `cy.nodes().stop(true)`
- ✅ Tooltip is explicitly cleared with `setTooltip(null)`
- ✅ No edge cases found where classes could stick around

**Important detail:** The code uses `cy.elements().removeClass()` which removes from both nodes AND edges simultaneously, ensuring complete cleanup.

---

### 3. **Dim Opacity Values**

**Location:** `graphStyles.ts` lines 154-181

Current values are quite aggressive:

**Hover-Dim Selectors:**
| Selector | Property | Value | Severity |
|----------|----------|-------|----------|
| `node.hover-dim` | opacity | 0.12 | Very aggressive |
| `node.hover-dim` | shadow-opacity | 0.05 | Very aggressive |
| `edge.hover-dim` | line-opacity | 0.06 | Very aggressive |

**Hover-Bright Selectors:**
| Selector | Property | Value |
|----------|----------|-------|
| `node.hover-bright` | shadow-blur | 14 |
| `node.hover-bright` | shadow-opacity | 0.95 |
| `edge.hover-bright` | line-opacity | 0.7 |
| `edge.hover-bright` | width | 1.2 |

**Assessment:** The 0.12 (12%) and 0.06 (6%) opacities are VERY dim — nodes become nearly invisible and edges become barely visible. This is an intentional aggressive dim to maximize focus on the hovered neighborhood, but it might be too extreme in practice.

**Conflict Resolution:** Lines 182-196 handle cases where hover and selection overlap:
- Selected nodes keep `opacity: 1.0` even when hovering elsewhere
- Highlighted neighbors get intermediate opacity (0.5) when hovering unrelated nodes

---

### 4. **Graph Container Structure and Tooltip Positioning**

**Container Hierarchy (`GraphView.tsx` lines 559-623):**

```
<div style={{ position: "relative", flex: 1, minHeight: 0 }}>
  ├─ <GraphToolbar />
  ├─ {showOverlay} <div with position: absolute>
  ├─ <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
  │   ├─ <div ref={containerRef} className="graph-container" />
  │   ├─ <canvas className="graph-canvas-overlay" />
  │   ├─ <canvas className="graph-canvas-overlay" />
  │   └─ <div className="graph-minimap">
  └─ {tooltip && <div className="graph-node-tooltip" />}
```

**Critical Finding:** The tooltip is positioned as a sibling to the middle `<div style={{ position: "relative", ... }}>`, NOT inside it. This means:

1. **Positioning Context:** The tooltip's `left` and `top` coordinates are calculated from the **root container** (line 560, `position: "relative"`), not from the inner graph container (line 578).

2. **Coordinate System Issue:** The node's `renderedPosition()` is relative to the **Cytoscape canvas** (which is inside the inner `<div style={{ position: "relative", ... }}>` at line 578). This creates a **positioning mismatch**:
   - Tooltip uses coordinates from Cytoscape's canvas space
   - But it's positioned relative to the outer root container
   - The inner container (line 578) has `position: "relative"` but the tooltip is not inside it

3. **What Actually Works:** Despite this structure, the coordinates appear to work because:
   - The inner container (line 578) has no padding/margin
   - It fills its parent flex space
   - The coordinate offset happens to be correct by coincidence

**Potential Issue:** If the inner container ever gets padding, margin, or transforms, the tooltip will be positioned incorrectly. This is a **fragile design**.

**Canvas Overlay Positioning (`App.css` lines 1393-1399):**
```css
.graph-canvas-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}
```

These canvases are correctly positioned within their parent (the middle `<div>`), covering the entire graph area. z-index 2 places them above the Cytoscape container (which has no explicit z-index).

---

### Summary of Findings

| Aspect | Status | Notes |
|--------|--------|-------|
| **Tooltip rendering** | ✅ Correct | Uses z-index 20, proper CSS, theme-aware |
| **Hover cleanup** | ✅ Clean | Classes properly removed, no leaks detected |
| **Dim opacity values** | ⚠️ Aggressive | 0.12 and 0.06 are very dim; intentional for focus but might be too extreme |
| **Container positioning** | ⚠️ Fragile | Tooltip positioned relative to outer container, not inner graph container; works now but brittle |

---

### Files Reviewed
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx` (hover handlers ~203-249, tooltip JSX ~602-621)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts` (hover-dim/hover-bright selectors ~154-196)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` (tooltip styles ~1315-1390, canvas overlay ~1393-1399, container ~128-133)

---

