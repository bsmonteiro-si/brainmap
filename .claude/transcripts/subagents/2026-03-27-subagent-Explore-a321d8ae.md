# 2026-03-27 — Subagent Transcript: Explore

**Date:** 2026-03-27 17:07:31
**Agent:** Explore
**Agent ID:** a321d8ae23a7705dd
**Parent Session:** 5b6ef61f-dcea-4a86-a693-8980f6d15fd7

---

## User

Explore the canvas edge implementation in this project. I need to understand:

1. How edges are currently rendered and managed in the Canvas editor
2. The edge toolbar implementation (floating toolbar on edges)
3. How React Flow (@xyflow/react) is configured for edges
4. The canvas data model for edges (canvasTranslation.ts)
5. The canvas architecture doc at docs/canvas-architecture.md
6. Any edge-related types, especially around markers/arrows

Focus on files like:
- crates/app/src/components/Canvas/CanvasEditor.tsx
- crates/app/src/components/Canvas/canvasNodes.tsx (or similar)
- crates/app/src/components/Canvas/canvasTranslation.ts
- crates/app/src/components/Canvas/canvasShapes.ts
- docs/canvas-architecture.md

Be very thorough - read full file contents for the key Canvas files.

---

## Assistant

I'll help you explore the canvas edge implementation. Let me start by getting an overview of the project structure and then dive into the key files.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -type f -name \"*.tsx\" -o -name \"*.ts\" | grep -i canvas | head -20"}`

---

## Assistant

Let me look for the Canvas-related files in the source directory:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f \\( -name \"*Canvas*\" -o -name \"*canvas*\" \\) 2>/dev/null"}`

---

## Assistant

Now let me check for the docs/canvas-architecture.md file:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -name \"*canvas*\" -o -name \"*architecture*\" | grep -i \"docs\\|md\""}`

---

## Assistant

Perfect! Now let me read the key files. Let me start with the main files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasShapes.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/canvas-architecture.md"}`

---

## Assistant

Excellent! Now let me read the CanvasEditor.tsx file in sections to understand the edge rendering:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":1,"limit":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":200,"limit":300}`

---

## Assistant

Let me continue reading CanvasEditor to find the edge rendering and marker definitions:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"brainmap-arrow\\|<marker\\|CanvasEdge\\|renderEdge\\|markerEnd\\|markerStart\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx | hea`

---

## Assistant

Now let me read the relevant section around the marker definitions:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":1380,"limit":100}`

---

## Assistant

Perfect! Now let me read the canvasNodes.tsx file to see the CanvasEdge component implementation:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","offset":1,"limit":150}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"wc -l /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx"}`

---

## Assistant

Let me search for the CanvasEdge component:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"^function CanvasEdge\\|^const CanvasEdge\\|^export.*CanvasEdge\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx"}`

---

## Assistant

Now let me read the CanvasEdge component:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","offset":877,"limit":290}`

---

## Assistant

Perfect! Now let me look for where edges are created to understand the initial edge creation flow:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"handleConnect\\|addEdge\\|onConnect\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx | head -20"}`

---

## Assistant

Let me read the onConnect handler:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":607,"limit":30}`

---

## Assistant

Excellent! Now let me also look at the edge creation context menu:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"ctxMenu\\|handleContextMenu\\|elemCtxMenu\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx | head -15"}`

---

## Assistant

Let me look at the context menu for edges to see if it mentions anything about edges:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"elemCtxMenu?.edgeId\\|edge.*delete\\|edge.*duplicate\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx"}`

---

## Assistant

Now let me look at the section around the element context menu UI rendering:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":1200,"limit":200}`

---

## Assistant

Let me search for the element context menu rendering:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":1550,"limit":150}`

---

## Assistant

Let me continue to find the element context menu:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"elemCtxMenu &&\\|Element context menu\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx | head -5"}`

---

## Assistant

Let me read that section:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":1777,"limit":150}`

---

## Assistant

Perfect! Now let me look at the edge context menu handler:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"handleEdgeContextMenu\\|onEdgeContextMenu\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx"}`

---

## Assistant

Let me read the handleEdgeContextMenu function:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":660,"limit":30}`

---

## Assistant

Excellent! Now I have a comprehensive understanding. Let me create a detailed summary document by reading a few more pieces to complete the picture:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"handleEdgesChange\\|onEdgesChange\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx | head -10"}`

---

## Assistant

Let me read that:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":595,"limit":20}`

---

## Assistant

Perfect! Now I have all the information I need. Let me create a comprehensive report.

## Canvas Edge Implementation - Comprehensive Analysis

Based on my thorough exploration of the codebase, here's everything you need to know about how edges are currently implemented in the BrainMap canvas editor:

---

## 1. Edge Data Model (canvasTranslation.ts)

The edge data model bridges JSON Canvas spec with React Flow:

**JSON Canvas Edge Type** (lines 57-70):
```typescript
interface JsonCanvasEdge {
  id: string;
  fromNode: string;
  toNode: string;
  fromSide?: "top" | "right" | "bottom" | "left";
  toSide?: "top" | "right" | "bottom" | "left";
  fromEnd?: "none" | "arrow";
  toEnd?: "none" | "arrow";
  color?: string;
  label?: string;
  edgeType?: string;
  labelFontSize?: number;
  labelFontFamily?: string;
}
```

**Key Fields:**
- **fromSide/toSide**: Connection point on the source/target node (4 cardinal directions)
- **fromEnd/toEnd**: Arrow configuration ("arrow" or "none")
- **edgeType**: Path style - "bezier", "straight", or "step" (stored in `data.edgeType` in React Flow)
- **label & label formatting**: Edge labels with custom font size/family support
- **color**: Edge stroke color (coupled with marker IDs)

**Default Behavior:**
- Default toEnd = "arrow" (target always gets arrow unless explicitly disabled)
- Default edgeType = "bezier" (fallback from `canvasDefaultEdgeType` setting)

---

## 2. Edge Translation (canvasTranslation.ts, lines 170-205)

### JSON Canvas → React Flow (canvasToFlow)

```typescript
const edges: Edge[] = (canvas.edges ?? []).map((ce) => {
  const edge: Edge = {
    id: ce.id,
    source: ce.fromNode,
    target: ce.toNode,
  };

  if (ce.fromSide) edge.sourceHandle = ce.fromSide;
  if (ce.toSide) edge.targetHandle = `${ce.toSide}-target`;  // "-target" suffix added

  // Marker ID strategy: color-specific or default
  const toEnd = ce.toEnd ?? "arrow";
  const markerId = ce.color ? `brainmap-arrow-${ce.color}` : "brainmap-arrow";
  if (toEnd === "arrow") {
    edge.markerEnd = markerId;
  }
  if (ce.fromEnd === "arrow") {
    edge.markerStart = markerId;
  }

  if (ce.label) edge.label = ce.label;
  if (ce.color) edge.style = { stroke: ce.color };
  if (ce.edgeType || ce.labelFontSize != null || ce.labelFontFamily != null) {
    edge.data = {
      edgeType: ce.edgeType,
      labelFontSize: ce.labelFontSize,
      labelFontFamily: ce.labelFontFamily,
    };
  }

  return edge;
});
```

**Critical Details:**
- **Handle ID transformation**: `toSide` gets `-target` suffix because React Flow separates source/target handle IDs
- **Marker ID coupling**: Color-specific marker IDs (`brainmap-arrow-{color}`) are dynamically generated in CanvasEditor.tsx and must match the color string exactly
- **Edge data structure**: `edgeType`, `labelFontSize`, `labelFontFamily` stored in `edge.data`; `isNew: true` flag added on creation

### React Flow → JSON Canvas (flowToCanvas, lines 294-329)

```typescript
const canvasEdges: JsonCanvasEdge[] = edges.map((e) => {
  const ce: JsonCanvasEdge = {
    id: e.id,
    fromNode: e.source,
    toNode: e.target,
  };

  if (e.sourceHandle) ce.fromSide = e.sourceHandle;
  if (e.targetHandle) ce.toSide = e.targetHandle.replace(/-target$/, ""); // Remove suffix

  // Detect arrows from marker IDs
  const markerEnd = e.markerEnd;
  const hasEndArrow = markerEnd && (typeof markerEnd === "object" ? markerEnd.type : markerEnd);
  ce.toEnd = hasEndArrow ? "arrow" : "none";

  const markerStart = e.markerStart;
  const hasStartArrow = markerStart && (typeof markerStart === "object" ? markerStart.type : markerStart);
  if (hasStartArrow) ce.fromEnd = "arrow";

  // Color extraction from stroke
  if (e.style && typeof e.style === "object" && "stroke" in e.style) {
    ce.color = String(e.style.stroke);
  }

  // Edge data unpacking
  const edgeData = e.data as Record<string, unknown> | undefined;
  if (edgeData?.edgeType && edgeData.edgeType !== "bezier") {
    ce.edgeType = String(edgeData.edgeType);
  }
  // Only emit non-default values to keep JSON clean
  if (edgeData?.labelFontSize != null && edgeData.labelFontSize !== 11) {
    ce.labelFontSize = Number(edgeData.labelFontSize);
  }
  if (edgeData?.labelFontFamily != null && edgeData.labelFontFamily !== "") {
    ce.labelFontFamily = String(edgeData.labelFontFamily);
  }

  return ce;
});
```

**Key Behavior:**
- **Default stripping**: Only non-default values are serialized to keep JSON compact
- **Marker detection**: Supports both string IDs and object markers
- **Handle suffix removal**: `-target` suffix is stripped when converting back to JSON

---

## 3. Edge Rendering (canvasNodes.tsx, lines 877-1163)

### CanvasEdge Component

The custom edge component replaces React Flow's default edge with full interactivity:

**Architecture:**
```typescript
function CanvasEdgeInner({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  selected, label, markerEnd, markerStart, style, data,
}: EdgeProps)
```

**Core Rendering (line 1036):**
```typescript
<BaseEdge path={edgePath} markerEnd={markerEnd} markerStart={markerStart} 
  style={style} interactionWidth={20} />
```
- `BaseEdge`: React Flow's baseline edge renderer
- `interactionWidth={20}`: 20px invisible hit area for easy selection regardless of stroke width

### Path Calculation (lines 925-929)

Three path strategies determined by `data.edgeType`:
```typescript
const edgeType = (data as Record<string, unknown> | undefined)?.edgeType as string | undefined;
const canvasDefaultEdgeType = useUIStore((s) => s.canvasDefaultEdgeType);
const effectiveType = edgeType ?? canvasDefaultEdgeType ?? "bezier";

const [edgePath, labelX, labelY] = effectiveType === "straight"
  ? getStraightPath({ sourceX, sourceY, targetX, targetY })
  : effectiveType === "step"
    ? getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition })
    : getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
```

- **bezier** (default): Curved paths with handle-aware control points
- **straight**: Direct lines
- **step**: Right-angle jog paths

### Label System (lines 1025-1065, 1038-1065)

**Display:**
- Label shown at calculated midpoint (labelX, labelY)
- Double-click enters edit mode
- Font size/family applied inline

**Editing:**
```typescript
const showInput = editing || promptLabel;  // promptLabel triggers on new edges

<input
  className="canvas-edge-label-input nodrag"
  type="text"
  value={editValue}
  onKeyDown={handleLabelKeyDown}  // Enter commits, Escape cancels
  placeholder="Label (Enter to set, Esc to skip)"
  style={labelStyle}
/>
```

- New edges (`data.isNew = true`) auto-focus the label input
- Escape cancels without committing
- Blur commits the label

### Edge Toolbar (lines 1067-1156)

Shown when edge is selected and no multiple elements are selected:

**Buttons (in order):**
1. **Edit Label** - Triggers edit mode
2. **Delete** - Removes edge
3. **Color Picker** - Select/clear edge color
4. **Edge Type Picker** - Bezier/Straight/Step toggle
5. **Label Format** - Font size (11, 13, 16, 20, 24) and font family (sans-serif, serif, monospace, sketch)

**Color Logic (lines 977-1007):**
```typescript
const handleColor = (color: string) => {
  const markerId = `brainmap-arrow-${color}`;
  setEdges((eds) =>
    eds.map((ed) => {
      if (ed.id !== id) return ed;
      return {
        ...ed,
        style: { ...ed.style, stroke: color },
        ...(ed.markerEnd ? { markerEnd: markerId } : {}),
        ...(ed.markerStart ? { markerStart: markerId } : {}),
      };
    }),
  );
  scheduleSave();
};
```

**Critical Insight**: When color changes, BOTH `style.stroke` AND marker ID are updated. The marker ID must match the format `brainmap-arrow-{color}` exactly for the arrow to render in the correct color.

---

## 4. SVG Marker Definitions (CanvasEditor.tsx, lines 1394-1413)

**Default Marker:**
```typescript
<marker id="brainmap-arrow" viewBox="0 0 10 10" refX="8" refY="5"
  markerWidth={canvasArrowSize} markerHeight={canvasArrowSize} orient="auto-start-reverse">
  <polygon points="0,0 10,5 0,10" fill="#b1b1b7" />
</marker>
```

**Dynamic Color Markers:**
```typescript
{Array.from(new Set(
  edges.flatMap((e) => {
    const s = (e.style as Record<string, unknown> | undefined)?.stroke;
    return typeof s === "string" ? [s] : [];
  }),
)).map((color) => (
  <marker key={color} id={`brainmap-arrow-${color}`} viewBox="0 0 10 10" refX="8" refY="5"
    markerWidth={canvasArrowSize} markerHeight={canvasArrowSize} orient="auto-start-reverse">
    <polygon points="0,0 10,5 0,10" fill={color} />
  </marker>
))}
```

**Key Attributes:**
- **refX="8"**: Arrow tip pulled back 8 units to avoid overlapping nodes
- **markerWidth/Height**: Controlled by `canvasArrowSize` setting (default 12)
- **orient="auto-start-reverse"**: Automatically rotates arrow to face connection direction; reverse means start arrow also rotates correctly
- **Dynamic generation**: Marker for each unique edge color is created on-the-fly by scanning all edges

---

## 5. Edge Creation Flow

### Connection Handler (CanvasEditor.tsx, lines 607-619)

```typescript
const onConnect: OnConnect = useCallback(
  (connection) => {
    pushSnapshot();  // Enable undo
    setEdges((eds) =>
      addEdge(
        { ...connection, markerEnd: "brainmap-arrow", data: { isNew: true } },
        eds,
      ),
    );
    requestAnimationFrame(() => scheduleSave());
  },
  [setEdges, scheduleSave, pushSnapshot],
);
```

**Triggered by:**
- User dragging from source handle to target handle
- Connection mode: "loose" (allows connection between any handles)

**Result:**
- Default marker: "brainmap-arrow" (gray arrow)
- `data.isNew = true` → triggers label input prompt
- Edge is immediately undoable

---

## 6. Edge Change Handling (CanvasEditor.tsx, lines 595-605)

```typescript
const handleEdgesChange: typeof onEdgesChange = useCallback(
  (changes) => {
    const meaningful = changes.some((c: { type: string }) =>
      c.type === "remove" || c.type === "add",
    );
    if (meaningful) pushSnapshot();  // Snapshot for add/remove only
    onEdgesChange(changes);
    requestAnimationFrame(() => scheduleSave());  // Always schedule save
  },
  [onEdgesChange, scheduleSave, pushSnapshot],
);
```

**Change Types:**
- Selection changes: Don't trigger snapshot (cosmetic)
- Add/Remove: Trigger snapshot (state change)
- All changes: Trigger debounced save (1500ms)

---

## 7. Edge Context Menu (CanvasEditor.tsx, lines 660-667)

```typescript
const handleEdgeContextMenu = useCallback(
  (event: ReactMouseEvent, edge: { id: string }) => {
    event.preventDefault();
    setElemCtxMenu({ x: event.clientX * uiZoom, y: event.clientY * uiZoom, edgeId: edge.id });
    setCtxMenu(null);
  },
  [uiZoom],
);
```

**Behavior:**
- Right-click on edge shows element context menu at cursor position
- Menu includes: Delete, Duplicate (nodes only), Group (when multiple selected)
- Edges can only be deleted via context menu or toolbar
- Counter-zoom compensation applied: `event.clientX * uiZoom`

---

## 8. Edge Deletion (CanvasEditor.tsx, lines 680-719)

```typescript
const deleteSelected = useCallback(() => {
  pushSnapshot();
  const selectedNodeIds = new Set(nodes.filter(n => n.selected).map(n => n.id));
  const selectedEdgeIds = new Set(edges.filter(e => e.selected).map(e => e.id));
  
  // Include right-clicked element
  if (elemCtxMenu?.nodeId) selectedNodeIds.add(elemCtxMenu.nodeId);
  if (elemCtxMenu?.edgeId) selectedEdgeIds.add(elemCtxMenu.edgeId);
  
  setNodes(nds => nds.filter(n => {
    if (selectedNodeIds.has(n.id)) {
      // Mark node for deletion
    }
  }));
  
  // Delete selected edges + edges connected to deleted nodes
  setEdges(eds => eds.filter(e => !selectedEdgeIds.has(e.id)));
  
  scheduleSave();
}, [...]);
```

**Logic:**
1. Collects all selected nodes and edges
2. Adds right-clicked element if any
3. Deletes edges connected to deleted nodes (implicit)
4. Deletes explicitly selected edges

---

## 9. React Flow Configuration (CanvasEditor.tsx, lines 1362-1392)

```typescript
<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={handleNodesChange}
  onEdgesChange={handleEdgesChange}
  onConnect={onConnect}
  connectionMode="loose"
  onEdgeContextMenu={handleEdgeContextMenu}
  nodeTypes={nodeTypes}
  edgeTypes={{ default: CanvasEdge }}
  defaultEdgeOptions={{ markerEnd: "brainmap-arrow" }}
  ...
>
```

**Edge Configuration:**
- **edgeTypes**: Custom `CanvasEdge` replaces default
- **defaultEdgeOptions**: All new edges without explicit options get gray arrow
- **connectionMode="loose"**: Any source handle can connect to any target handle

---

## 10. UI Store Settings (Architecture Doc, lines 290-323)

Edge-related settings:

| Setting | Type | Default | Purpose |
|---------|------|---------|---------|
| `canvasDefaultEdgeType` | string | "bezier" | Edge path style (bezier/straight/step) |
| `canvasEdgeWidth` | number | 2 | Stroke width in pixels (CSS var `--edge-width`) |
| `canvasArrowSize` | number | 12 | SVG marker size in pixels |

---

## 11. State Management for Edges

### In CanvasEditorInner (lines 188-189, 262-271)

```typescript
const [edges, setEdges, onEdgesChange] = useEdgesState([]);

// Refs keep edges accessible in closures
const edgesRef = useRef(edges);
edgesRef.current = edges;
```

### Contexts

- **CanvasSaveContext**: Provides `scheduleSave()` to edge component for persistence
- **CanvasSnapshotContext**: Provides `pushSnapshot()` for undo capability

---

## 12. Edge Types and Markers - Advanced Details

**Handle Configuration (canvasNodes.tsx, lines 117-130):**

All nodes have 8 handles:
```typescript
function FourHandles() {
  return (
    <>
      {/* Target handles (incoming) */}
      <Handle type="target" position={Position.Top} id="top-target" />
      <Handle type="target" position={Position.Right} id="right-target" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" />
      <Handle type="target" position={Position.Left} id="left-target" />
      
      {/* Source handles (outgoing) */}
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Left} id="left" />
    </>
  );
}
```

**Handle ID Mapping:**
- Source: `top`, `right`, `bottom`, `left` (stored as `fromSide` in JSON)
- Target: `top-target`, `right-target`, `bottom-target`, `left-target` (stored as `toSide` in JSON, suffix stripped)

---

## 13. Edge Colors (6 Preset + Custom)

From canvasNodes.tsx (lines 21-28):
```typescript
const CANVAS_COLORS = [
  { id: "1", color: "#e74c3c", label: "Red" },
  { id: "2", color: "#f39c12", label: "Orange" },
  { id: "3", color: "#f1c40f", label: "Yellow" },
  { id: "4", color: "#27ae60", label: "Green" },
  { id: "5", color: "#3498db", label: "Cyan" },
  { id: "6", color: "#9b59b6", label: "Purple" },
];
```

Plus custom color picker input.

**Color Update Strategy:**
1. User selects color from toolbar
2. Edge's `style.stroke` updated to color hex
3. Edge's `markerEnd`/`markerStart` updated to `brainmap-arrow-{color}`
4. SVG marker for that color is dynamically added (if not already present)
5. Changes persisted via `scheduleSave()`

---

## 14. Label Font Configuration

**Default:**
- Size: 11px
- Family: undefined (system default)

**Selectable Sizes** (canvasNodes.tsx, line 30):
```typescript
const FONT_SIZES = [11, 13, 16, 20, 24];
```

**Selectable Families** (canvasNodes.tsx, lines 31-36):
```typescript
const FONT_FAMILIES = [
  { id: "sans-serif", label: "Sans" },
  { id: "serif", label: "Serif" },
  { id: "monospace", label: "Mono" },
  { id: "'Chalkboard SE', cursive", label: "Sketch" },
];
```

---

## 15. Key Files Summary

| File | Lines | Responsibility |
|------|-------|-----------------|
| `CanvasEditor.tsx` | ~1313 | Edge creation, markers, toolbar, context menu, save/undo |
| `canvasNodes.tsx` | ~1163 | Edge rendering, toolbar, label editing, color/type pickers |
| `canvasTranslation.ts` | ~293 | JSON ↔ React Flow edge translation, handle mapping |
| `canvasShapes.ts` | ~37 | Shape registry (not edge-specific) |
| `App.css` | ? | Edge styling (not explored, but referenced) |

---

## 16. Important Implementation Notes

1. **Marker ID Coupling**: Color changes MUST update both `style.stroke` AND marker ID to stay in sync
2. **Target Handle Suffix**: `-target` suffix is added during JSON→RF translation and stripped during RF→JSON
3. **Auto-Label on Creation**: New edges set `data.isNew = true` to trigger label input
4. **Label Persistence**: Labels are stored as `edge.label` in React Flow and serialized to JSON
5. **Path Resolution**: `edgeType` falls back to `canvasDefaultEdgeType` setting, then defaults to "bezier"
6. **Snapshot Coalescing**: Only add/remove operations trigger snapshots; selection changes don't
7. **Default Stripping**: Only non-default field values are serialized to JSON (clean files)
8. **Handle Interactivity**: 20px interaction width makes edges easy to click/select
9. **Dynamic SVG Generation**: Marker defs created on-the-fly per unique edge color
10. **Counter-Zoom Compensation**: Context menu positions multiplied by `uiZoom` due to global zoom

This comprehensive implementation supports rich edge interactions while maintaining clean JSON Canvas spec compatibility with custom extensions for edge types, label formatting, and colors.

---

