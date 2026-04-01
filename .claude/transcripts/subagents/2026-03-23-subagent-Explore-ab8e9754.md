# 2026-03-23 — Subagent Transcript: Explore

**Date:** 2026-03-23 10:50:55
**Agent:** Explore
**Agent ID:** ab8e9754057c4c204
**Parent Session:** ba32d326-fdd5-4aff-835b-e5f32483c3c1

---

## User

Explore the canvas edge implementation in this project. The user reports that arrows are inaccurate, don't respect direction, and are hard to target/click.

I need to understand:
1. How edges are rendered (the edge components, custom edge paths)
2. How edge direction (arrows) is determined
3. How edge hit-testing/targeting works
4. The translation layer between the canvas JSON format and React Flow

Key files to look at:
- crates/app/src-tauri/src-ui/src/components/Canvas/ - all canvas-related components
- Any edge-related files (canvasEdges, edge components, etc.)
- canvasTranslation.ts - how canvas data is translated to React Flow format
- canvasNodes.tsx - node dimensions that affect edge endpoints
- The canvas architecture doc at docs/canvas-architecture.md

Be very thorough - read the full content of edge-related files and the translation logic. I need to understand:
- How source/target handles are positioned
- How edge paths are calculated
- Whether custom edge components are used
- How fromSide/toSide from the canvas spec maps to React Flow handles
- The hit area for edges (interaction width)

---

## Assistant

I'll conduct a thorough exploration of the canvas edge implementation. Let me start by reading the architecture doc and then examining the edge-related code systematically.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/canvas-architecture.md"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/src-ui/src/components/Canvas/**/*.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/src-ui/src/**/*edge*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/src-ui/src/**/*canvas*"}`

---

## Assistant

The glob patterns didn't match. Let me search for the actual canvas component files:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src-ui/src -name \"*Canvas*\" -o -name \"*canvas*\" | head -20"}`

---

## Assistant

Let me find the correct source directory structure:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -type f -name \"*.tsx\" | grep -i canvas | head -20"}`

---

## Assistant

Good! Now let me search for edge-related files:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -type f \\( -name \"*edge*\" -o -name \"*canvas*translation*\" \\) | head -20"}`

---

## Assistant

Let me find the translation file:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*.ts\" | grep canvas"}`

---

## Assistant

Perfect! Now let me read the critical files. I'll start with the translation layer and then examine the node and edge implementation:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","limit":500}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":300}`

---

## Assistant

Now let me read the rest of canvasNodes.tsx to see the CanvasEdge implementation:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","offset":500,"limit":400}`

---

## Assistant

Now let me check the CSS to understand how edges are styled and what hit areas are defined:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*.css\" | grep -i canvas"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*.css\" | xargs grep -l \"canvas-edge\\|\\.cm-\\|canvas\" 2>/dev/null | head -5"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"canvas-edge\\|\\.react-flow__edge\\|stroke-width\\|pointer-events\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -50"}`

---

## Assistant

Let me read the edge-related CSS section:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":4770,"limit":150}`

---

## Assistant

Let me search for arrow/marker definitions in the CSS:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"marker\\|arrow\\|brainmap-arrow\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -30"}`

---

## Assistant

Let me look for where markers are defined in CanvasEditor:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"marker\\|defs\\|SVG\\|svg\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx | head -40"}`

---

## Assistant

Perfect! Let me read that section more fully:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":1230,"limit":50}`

---

## Assistant

Now let me check what the actual edge hit-testing behavior is. Let me look at React Flow's edge rendering to understand hit area:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 10 \"react-flow__edge-path\\|hitarea\\|strokeWidth\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -40"}`

---

## Assistant

Let me check the rest of CanvasEditor to see if there's any edge interception layer:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":1200,"limit":40}`

---

## Assistant

Let me also check how React Flow's edge selection is working. Let me look at the full canvasTranslation to understand arrow direction properly:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.ts","offset":160,"limit":50}`

---

## Assistant

Now let me check if there are any tests that show the expected edge behavior:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.test.ts","limit":200}`

---

## Assistant

Perfect! Now let me look at the sample canvas file to see what edge issues might look like:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -name \"*.canvas\" -type f"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/seed/The Smoking Controversy.canvas"}`

---

## Assistant

Now let me check if there's any issue-specific information or recent commits related to edges:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"git log --oneline --all -- \"*canvas*edge*\" \"*edge*\" | head -20"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"git log --oneline --all --since=\"2 weeks ago\" | head -20"}`

---

## Assistant

Let me check the recent commit about edge path variants:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"git show --stat 1f8a9fe"}`

---

## Assistant

Let me check the issue file mentioned in git status:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/history-canvas-issue.md"}`

---

## Assistant

That's a different issue. Let me look for any references or docs about the edge issues. Let me check recent git diffs for edge-related changes:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"git log -p --all -S \"markerEnd\\|markerStart\" -- \"*.tsx\" | head -200"}`

---

## Assistant

Now let me create a comprehensive analysis document. Let me read one more key section - how handles are positioned:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"Position\\.\\|FourHandles\\|source.*position\\|target.*position\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx | head -20"}`

---

## Assistant

Perfect! Now I have a complete understanding. Let me compile my findings into a comprehensive report:

## Canvas Edge Implementation Analysis

Based on my thorough exploration of the codebase, here's a complete understanding of how canvas edges are implemented and the issues that likely exist:

### 1. **Edge Rendering Pipeline**

**Files Involved:**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx` (lines 668-877): `CanvasEdge` component
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.ts` (lines 161-185): Edge translation logic
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx` (lines 1237-1256): SVG marker definitions

**Path Calculation (canvasNodes.tsx:702-706):**
- Uses three path functions from React Flow: `getBezierPath()`, `getStraightPath()`, `getSmoothStepPath()`
- Selection determined by `edgeType` data property or fallback to `canvasDefaultEdgeType` setting
- **Issue**: The path calculation receives `sourceX, sourceY, targetX, targetY` directly from React Flow's edge props, plus `sourcePosition` and `targetPosition` for bezier/step variants

**BaseEdge Rendering (canvasNodes.tsx:793):**
```tsx
<BaseEdge path={edgePath} markerEnd={markerEnd} markerStart={markerStart} style={style} />
```
This uses React Flow's default edge SVG path rendering with standard hit-testing. React Flow's BaseEdge creates an SVG path with a visible stroke-width (controlled by CSS: `--edge-width`, default 1px) plus an invisible thick hit path underneath for mouse interaction.

---

### 2. **Arrow Direction & Marker System**

**Arrow Direction Logic (canvasTranslation.ts:171-178):**

When converting JSON Canvas → React Flow:
```tsx
const toEnd = ce.toEnd ?? "arrow";  // Default: arrow on target end
if (toEnd === "arrow") {
  edge.markerEnd = { type: MarkerType.ArrowClosed };
}
if (ce.fromEnd === "arrow") {
  edge.markerStart = { type: MarkerType.ArrowClosed };
}
```

**The Problem:** 
- The **default arrow always points to the target** (the end of the edge in the direction `source → target`)
- The JSON Canvas spec fields `fromSide` and `toSide` control which **sides of the nodes** the edges attach to (e.g., "bottom" means bottom side of the source node), NOT the arrow direction
- The `fromEnd` and `toEnd` fields in JSON Canvas control arrow placement, but `toEnd` defaults to `"arrow"` with no option to disable it

**Arrow Marker Definitions (CanvasEditor.tsx:1237-1256):**
```tsx
<svg style={{ position: "absolute", width: 0, height: 0 }}>
  <defs>
    <marker id="brainmap-arrow" viewBox="0 0 10 10" refX="10" refY="5"
      markerWidth={canvasArrowSize} markerHeight={canvasArrowSize} orient="auto-start-reverse">
      <polygon points="0,0 10,5 0,10" fill="#b1b1b7" />
    </marker>
    {/* One marker per unique edge color */}
    {Array.from(new Set(edges.flatMap(...))).map((color) => (
      <marker key={color} id={`brainmap-arrow-${color}`} viewBox="0 0 10 10" refX="10" refY="5"
        markerWidth={canvasArrowSize} markerHeight={canvasArrowSize} orient="auto-start-reverse">
        <polygon points="0,0 10,5 0,10" fill={color} />
      </marker>
    ))}
  </defs>
</svg>
```

**Issues with Markers:**
1. **`refX="10" refY="5"`** — These positioning values determine where the marker is placed along the path. `refX="10"` places it at the end of the path (standard). However, the actual relationship between these values and whether the arrow points correctly depends on the path direction.
2. **`orient="auto-start-reverse"`** — This should auto-rotate the marker to match the path direction. However:
   - For `markerStart`, it rotates to point along the start-to-end direction
   - For `markerEnd`, it rotates to point along the end-to-start direction (the "reverse" part)
   - **This might be inverted or not working as expected**
3. **Color Sync (canvasNodes.tsx:751-765):** When users change edge color, the code updates `markerEnd` and `markerStart` to the colored marker ID. However, it only updates these if they already exist:
```tsx
...(ed.markerEnd ? { markerEnd: markerId } : {}),
...(ed.markerStart ? { markerStart: markerId } : {}),
```
This means if an edge doesn't have a marker defined, changing color won't add one.

---

### 3. **Handle Positioning & Edge Connection**

**Handle Setup (canvasNodes.tsx:90-102):**
All four node types use identical `FourHandles()`:
```tsx
<Handle type="source" position={Position.Top} id="top" />
<Handle type="source" position={Position.Right} id="right" />
<Handle type="source" position={Position.Bottom} id="bottom" />
<Handle type="source" position={Position.Left} id="left" />
<Handle type="target" position={Position.Top} id="top-target" />
<Handle type="target" position={Position.Right} id="right-target" />
<Handle type="target" position={Position.Bottom} id="bottom-target" />
<Handle type="target" position={Position.Left} id="left-target" />
```

**Handle ID Mapping (canvasTranslation.ts:168-169):**
```tsx
if (ce.fromSide) edge.sourceHandle = ce.fromSide;      // e.g., "bottom"
if (ce.toSide) edge.targetHandle = `${ce.toSide}-target`; // e.g., "top-target"
```

**Issues:**
1. **Incomplete Handle Coverage:** Handles are at `Position.Top`, `Position.Right`, `Position.Bottom`, `Position.Left`, which are the four cardinal points. For rectangular nodes, these are correctly positioned at the middle of each edge. However:
   - If a node is very small or oddly sized, handles may overlap
   - React Flow positions handles as a percentage offset from the node, which can cause misalignment for non-square nodes

2. **No Custom Handle Positioning:** The `FourHandles` component doesn't customize handle offsets, relying entirely on React Flow's defaults. For nodes with custom shapes (circle, diamond), this might not be optimal.

---

### 4. **Edge Hit-Testing / Click Targeting**

**CSS Styling (App.css:4781-4782):**
```css
.canvas-container .react-flow__edge .react-flow__edge-path {
  stroke-width: var(--edge-width, 1);
}
```

The visible stroke width is controlled by the `--edge-width` CSS variable (default: 1px, configurable in Settings).

**React Flow's Default Hit Testing:**
React Flow's `BaseEdge` component automatically creates two SVG paths:
1. **Visible path**: Uses `stroke-width` from the edge's style (here, CSS variable)
2. **Invisible hit path**: An invisible path with a much thicker stroke (typically 20-30px) for easy mouse targeting

**Issues:**
1. **Hit Area Not Controllable:** The hit path thickness is hardcoded in React Flow. If the `--edge-width` is very small (e.g., 0.5px), the visible line is thin but the hit area is still thick, which can feel odd when trying to click precisely.
2. **No Hover Indicator:** There's no visual feedback (color change, glow) when hovering over an edge before selecting it. The label and toolbar only appear after selection.
3. **Edge Selection via Toolbar Only:** Edges are primarily interacted with through the toolbar that appears when selected. There's no context menu on right-click until after selection.

---

### 5. **Translation Between JSON Canvas & React Flow**

**fromSide/toSide vs sourceHandle/targetHandle (canvasTranslation.ts:278-279):**
```tsx
if (e.sourceHandle) ce.fromSide = e.sourceHandle;
if (e.targetHandle) ce.toSide = e.targetHandle.replace(/-target$/, "");
```

When converting back to JSON Canvas, the `-target` suffix is stripped. This is correct.

**Arrow Conversion (canvasTranslation.ts:282-288):**
```tsx
const markerEnd = e.markerEnd as { type?: string } | string | undefined;
const hasEndArrow = markerEnd && (typeof markerEnd === "object" ? markerEnd.type : markerEnd);
ce.toEnd = hasEndArrow ? "arrow" : "none";

const markerStart = e.markerStart as { type?: string } | string | undefined;
const hasStartArrow = markerStart && (typeof markerStart === "object" ? markerStart.type : markerStart);
if (hasStartArrow) ce.fromEnd = "arrow";
```

**Issues:**
1. **Arrow Detection:** The code checks if `markerStart` or `markerEnd` are truthy and have a `type` property. However, markers can also be **string IDs** like `"brainmap-arrow-#e74c3c"`. The code handles this with `typeof markerStart === "object" ? markerStart.type : markerStart`, treating string IDs as truthy. This should work, but:
   - If a marker ID is an empty string, it would be treated as falsy
   - If there's a typo in the marker ID, the edge might lose its arrow on round-trip

2. **No Preserved Arrow Info:** Once edges are created in the canvas, the arrow direction is baked into the React Flow marker. Changing the edge direction in JSON Canvas and reloading would require manually re-editing in the UI.

---

### 6. **Known Limitations & Potential Issues**

**Arrow Accuracy Issues:**
1. **Path Endpoint Calculation:** React Flow calculates edge endpoints based on handle positions. If handles are misaligned (e.g., not at the true edge of the node visually), arrows will point to the wrong spot.
2. **Curved Paths:** Bezier curves can create paths where the arrow point doesn't visually align with the curve's tangent, making the arrow look inaccurate. This is especially visible at sharp angles.
3. **Step Path Quirk:** The `getSmoothStepPath()` function creates elbow paths. The arrow direction should respect the final segment, but there might be issues with the intermediate waypoints.

**Click Targeting Issues:**
1. **Thin Edges:** With `--edge-width` at 1px, clicking edges is difficult. The hit area (invisible thick path) might not be wide enough or might have dead zones.
2. **Overlapping Edges:** When multiple edges pass near each other, the hit areas can interfere. React Flow doesn't have occlusion-based hit testing.
3. **Label Hit Area:** Edge labels are rendered in `EdgeLabelRenderer` with their own `pointer-events: all` (see CSS line 5282), which might block edge selection in the label area.

**Direction Representation:**
- The current system uses `fromSide/toSide` for attachment points and `fromEnd/toEnd` for arrows
- There's **no explicit directionality indicator** other than arrows. If both `fromEnd` and `toEnd` are "arrow", the edge points both ways (bidirectional)
- The JSON Canvas spec doesn't have a dedicated "direction" field, relying on arrow presence

---

### 7. **Reference Points in Code**

| Component | File | Lines | Responsibility |
|-----------|------|-------|-----------------|
| `CanvasEdge` | canvasNodes.tsx | 668-877 | Edge rendering, label, toolbar |
| `FourHandles` | canvasNodes.tsx | 90-102 | Handle definitions for all nodes |
| `canvasToFlow()` | canvasTranslation.ts | 89-188 | JSON Canvas → React Flow conversion |
| `flowToCanvas()` | canvasTranslation.ts | 192-303 | React Flow → JSON Canvas conversion |
| Arrow markers | CanvasEditor.tsx | 1237-1256 | SVG marker definitions |
| Edge CSS | App.css | 4781-4805 | Edge styling and light mode |
| Edge toolbar | canvasNodes.tsx | 823-871 | Edge interaction UI |

---

### 8. **Summary of Issues**

Users report arrows are:
1. **Inaccurate** — Likely due to path endpoint calculation mismatch or bezier curve tangent misalignment
2. **Don't respect direction** — Could be caused by:
   - Marker orientation quirks with `auto-start-reverse`
   - Bidirectional arrows appearing when both `fromEnd` and `toEnd` are set
   - Arrow marker rotation not matching path direction
3. **Hard to click** — Due to:
   - Thin default stroke width (1px) combined with hit area not being aggressive enough
   - Label element blocking mouse events
   - No hover feedback before selection
   - Overlapping edge hit areas

The implementation is functionally complete but has several UX/accuracy refinement opportunities.

---

