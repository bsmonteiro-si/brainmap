# 2026-03-22 — Subagent Transcript: Explore

**Date:** 2026-03-22 13:54:41
**Agent:** Explore
**Agent ID:** aea52748619feff72
**Parent Session:** 1fb358f1-ddeb-4bea-b367-067bc2d3487e

---

## User

Thoroughly explore the canvas editor viewport save/restore logic in `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx`.

I need to understand:
1. The full `savedViewports` map initialization and persistence (module-level code)
2. The `persistViewport` function
3. The load effect that fetches canvas data and sets pendingViewportRef
4. The `onInit` handler for ReactFlow that applies the viewport
5. The unmount cleanup that saves viewport
6. How `reactFlowInstance` is obtained (useReactFlow hook? useState?)
7. Any `useOnViewportChange` usage
8. The `<ReactFlow>` component props (especially viewport-related: defaultViewport, fitView, onInit, minZoom, maxZoom)
9. The full component structure (CanvasEditor → CanvasErrorBoundary → ReactFlowProvider → CanvasEditorInner)

Read the full file if needed. Focus on viewport-related code paths and timing issues.

---

## Assistant

I'll explore the canvas editor viewport save/restore logic thoroughly.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx"}`

---

## Assistant

Let me search for specific sections of the file to understand the viewport logic.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"savedViewports","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"persistViewport","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pendingViewportRef|useReactFlow|onInit","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor"}`

---

## Assistant

The file is too large. Let me read it in sections:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":100,"limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":200,"limit":100}`

---

## Assistant

Let me continue reading the file to find the onInit handler and unmount cleanup:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":300,"limit":150}`

---

## Assistant

Let me continue reading to find the unmount viewport persistence and the ReactFlow component props:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":450,"limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":600,"limit":150}`

---

## Assistant

Now let me find the ReactFlow component props and the outer component wrapper:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":1000,"limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":1150,"limit":150}`

---

## Assistant

Let me read the ReactFlow component and outer wrapper:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":900,"limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":1290,"limit":50}`

---

## Assistant

Perfect! Now let me search for any `useOnViewportChange` usage to ensure I capture the full picture:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"useOnViewportChange|setViewport|getViewport|fitView","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_mode":"content"}`

---

## Assistant

Excellent. Now I have a comprehensive understanding of the canvas editor viewport logic. Let me compile my findings:

## Summary: Canvas Editor Viewport Save/Restore Logic

### 1. **Module-Level Viewport Cache (Lines 98-118)**

```typescript
const VIEWPORT_STORAGE_KEY = "brainmap:canvasViewports";

function loadSavedViewports(): Map<string, Viewport> {
  try {
    const raw = localStorage.getItem(VIEWPORT_STORAGE_KEY);
    if (!raw) return new Map();
    return new Map(Object.entries(JSON.parse(raw)));
  } catch { return new Map(); }
}

function persistViewport(path: string, vp: Viewport) {
  savedViewports.set(path, vp);
  try {
    const obj: Record<string, Viewport> = {};
    savedViewports.forEach((v, k) => { obj[k] = v; });
    localStorage.setItem(VIEWPORT_STORAGE_KEY, JSON.stringify(obj));
  } catch { /* quota exceeded */ }
}

const savedViewports = loadSavedViewports();
```

The viewport cache is **module-level** and **persistent** via `localStorage`. On first load, `loadSavedViewports()` deserializes all saved viewports from the `"brainmap:canvasViewports"` localStorage key into a `Map<string, Viewport>`. This map persists across the lifetime of the app session. `persistViewport()` updates both the in-memory map and localStorage with the full serialized object (all paths at once).

### 2. **pendingViewportRef Initialization (Line 199)**

```typescript
const pendingViewportRef = useRef<Viewport | "fitView" | null>(null);
```

This ref holds either a `Viewport` object, the string `"fitView"` (as a signal to fit to content), or `null`. It's created fresh on every component mount.

### 3. **Load Effect: Fetch Canvas + Queue Viewport Restore (Lines 210-257)**

```typescript
useEffect(() => {
  mountedRef.current = true;
  let cancelled = false;

  getAPI()
    .then((api) => api.readPlainFile(path))
    .then((file) => {
      if (cancelled) return;
      if (file.binary) { /* error */ return; }
      try {
        const parsed: JsonCanvas = JSON.parse(file.body);
        const { nodes: rfNodes, edges: rfEdges } = canvasToFlow(parsed);
        // ... process edges ...
        setNodes(rfNodes);
        setEdges(strEdges);
        lastSavedRef.current = JSON.stringify(flowToCanvas(rfNodes, rfEdges));
        
        // Queue viewport restore — applied when React Flow fires onInit
        const savedVp = savedViewports.get(path);
        pendingViewportRef.current = savedVp ?? "fitView";
      } catch {
        setError("Could not parse canvas file...");
      }
      setLoading(false);
    })
    .catch((e) => { /* error */ });

  return () => { cancelled = true; };
}, [path, setNodes, setEdges]);
```

When the file is loaded and parsed, the code:
1. Converts the canvas JSON to React Flow nodes/edges
2. **Queues the viewport** by setting `pendingViewportRef.current` to either the saved viewport from the map OR `"fitView"` if not saved
3. Cleanup returns `cancelled = true` to prevent race conditions

### 4. **handleInit: Apply Pending Viewport (Lines 413-429)**

```typescript
const handleInit = useCallback(() => {
  const vp = pendingViewportRef.current;
  if (!vp) return;
  pendingViewportRef.current = null;
  
  // Double RAF: first for React Flow layout, second for node measurement
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      try {
        if (vp === "fitView") {
          reactFlowInstance.fitView({ padding: 0.2 });
        } else {
          reactFlowInstance.setViewport(vp);
        }
      } catch { /* unmounted */ }
    });
  });
}, [reactFlowInstance]);
```

The `onInit` handler:
1. Reads the pending viewport
2. Clears the ref to prevent re-application
3. Uses **double `requestAnimationFrame`** to let React Flow finish layout and node measurement before applying viewport
4. If `vp === "fitView"`, calls `fitView(padding: 0.2)`, otherwise calls `setViewport(vp)` with the saved coordinates

This is wired into the `<ReactFlow>` component: `onInit={handleInit}`.

### 5. **Unmount Cleanup: Save Viewport (Lines 489-493)**

```typescript
useEffect(() => {
  return () => {
    try { persistViewport(path, reactFlowInstance.getViewport()); } catch { /* unmounted */ }
  };
}, [path, reactFlowInstance]);
```

On unmount, this effect calls `persistViewport()` to save the current viewport state from `reactFlowInstance.getViewport()` to both the in-memory map and localStorage. The dependencies on `[path, reactFlowInstance]` ensure the cleanup runs when the path changes or the instance is updated.

### 6. **reactFlowInstance Source (Line 126)**

```typescript
const reactFlowInstance = useReactFlow();
```

The `useReactFlow()` hook from `@xyflow/react` is called at the top of `CanvasEditorInner`. This hook requires the component to be inside a `ReactFlowProvider` (which it is — see outer structure below).

### 7. **No useOnViewportChange Usage**

There is **no `useOnViewportChange` hook** in this file. Viewport tracking is entirely via `getViewport()` calls in event handlers (context menu, node toolbar positioning) and at unmount.

### 8. **ReactFlow Component Props (Lines 945-969)**

```typescript
<ReactFlow
  nodes={nodes}
  edges={edges}
  minZoom={0.1}
  onNodesChange={handleNodesChange}
  onEdgesChange={handleEdgesChange}
  onConnect={onConnect}
  onPaneClick={() => { setToolbarPicker(false); setToolbarShapePicker(false); }}
  onPaneContextMenu={handlePaneContextMenu}
  onNodeContextMenu={handleNodeContextMenu}
  onInit={handleInit}  // ← KEY: applies pending viewport
  onEdgeContextMenu={handleEdgeContextMenu}
  onSelectionContextMenu={handleSelectionContextMenu}
  onSelectionStart={() => setSelecting(true)}
  onSelectionEnd={() => setSelecting(false)}
  nodeTypes={nodeTypes}
  edgeTypes={edgeTypes}
  colorMode={colorMode}
  panOnDrag={interactionMode === "pan"}
  selectionOnDrag={interactionMode === "select"}
  selectionMode={SelectionMode.Partial}
  deleteKeyCode={["Backspace", "Delete"]}
  elevateNodesOnSelect={false}
  defaultEdgeOptions={{ markerEnd: "brainmap-arrow" }}
>
```

**Notable:** There is **no `defaultViewport` prop**. The viewport is applied dynamically via the `onInit` callback, not set at render time. The `minZoom={0.1}` ensures users can zoom in and out, but there's no explicit `maxZoom`.

### 9. **Component Structure (Lines 1296-1304)**

```typescript
export function CanvasEditor({ path }: { path: string }) {
  return (
    <CanvasErrorBoundary path={path} key={path}>
      <ReactFlowProvider>
        <CanvasEditorInner path={path} />
      </ReactFlowProvider>
    </CanvasErrorBoundary>
  );
}
```

Three-layer composition:
- **CanvasEditor**: Public export, thin wrapper (no key change = no remount on path change)
- **CanvasErrorBoundary**: Error boundary that catches React Flow crashes; has `key={path}` so remounts when path changes
- **ReactFlowProvider**: Provides the React Flow context for `useReactFlow()` hook
- **CanvasEditorInner**: The actual implementation with all the state and handlers

### **Key Timing Issues & Design Observations**

1. **Double RAF in handleInit** ensures nodes are measured before viewport is applied — this prevents applying a viewport to unmeasured (zero-size) nodes.

2. **Viewport saved on unmount**, not on every change — this is efficient but means rapid tab switches could lose recent zoom/pan adjustments if they occur before the unmount effect fires.

3. **Module-level savedViewports map** persists across all canvas instances in the app session, but is cleared on page refresh. For multi-segment support, viewports are keyed by the full `path` string, which should be segment-specific.

4. **No explicit defaultViewport** means React Flow renders with some default center view, then `handleInit` repositions it. This could cause a brief visual jump if `handleInit` is delayed.

5. **Unmount cleanup catches exceptions silently** — this is safe for an unmounted instance, but masks errors during save.

6. **pendingViewportRef is per-component** (created fresh on mount), while `savedViewports` is module-level, allowing viewports to be shared and restored across different mount/unmount cycles of the same path.

---

