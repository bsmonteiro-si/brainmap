# 2026-03-22 — Subagent Transcript: Explore

**Date:** 2026-03-22 13:55:08
**Agent:** Explore
**Agent ID:** ab7e8eb6de7a9a230
**Parent Session:** 1fb358f1-ddeb-4bea-b367-067bc2d3487e

---

## User

Search the codebase at `/Users/bsmonteiro/Desktop/Personal/brainmap` for:

1. Any React Flow documentation or examples in node_modules that show viewport persistence patterns. Check `node_modules/@xyflow/react/README.md` or similar docs.
2. Search for `useOnViewportChange` in node_modules to see if this hook exists in the installed version
3. Search for `onNodesInitialized` or `onNodeChange` or similar lifecycle callbacks in React Flow types
4. Check the installed React Flow version in package.json
5. Search for how other parts of the app handle viewport/position persistence (e.g., the Cytoscape graph view's viewport save/restore pattern)
6. Look for any `fitView` or `setViewport` usage patterns in node_modules/@xyflow

Focus on finding the correct React Flow v12 pattern for restoring viewport after async node loading.

---

## Assistant

I'll search the codebase for React Flow documentation, lifecycle hooks, and viewport persistence patterns.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -name \"package.json\" -type f | head -5"}`

---

## Assistant

Let me read the package.json to check the React Flow version:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json"}`

---

## Assistant

Good, React Flow is v12.10.1. Now let me search for viewport persistence patterns and check the node_modules and source code:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/ | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/README.md"}`

---

## Assistant

Now let me search for lifecycle hooks and viewport methods in the types:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist -name \"*.d.ts\" | head -10"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"useOnViewportChange|onNodesInitialized|fitView|setViewport","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/types","output_mode":"content`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/types/general.d.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/types/component-props.d.ts","limit":600}`

---

## Assistant

Now let me check for hook definitions:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/hooks/"}`

---

## Assistant

Great! I can see `useOnViewportChange.d.ts` and `useNodesInitialized.d.ts`. Let me read those:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/hooks/useOnViewportChange.d.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/hooks/useNodesInitialized.d.ts"}`

---

## Assistant

Now let me check the CanvasEditor to see current viewport persistence patterns:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":200,"limit":300}`

---

## Assistant

Now let me check how the Cytoscape graph view handles viewport persistence:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/GraphView.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx","limit":150}`

---

## Assistant

Let me search for viewport restoration patterns in GraphView more thoroughly:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"getViewport\\|setViewport\\|zoom\\|pan\\|extent\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx | head -40"}`

---

## Assistant

Let me look more broadly at the existing CanvasEditor code for the onInit pattern:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"onInit\\|useReactFlow\\|useNodesInitialized\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx"}`

---

## Assistant

Now let me look at React Flow hooks index to see what hooks are exported:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/hooks"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cat /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/index.d.ts | grep -E \"export.*from.*hooks\" | head -50"}`

---

## Assistant

Perfect! Now let me check what viewport-related methods are available on ReactFlowInstance:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/types/instance.d.ts","limit":250}`

---

## Assistant

Perfect! Now let me check the @xyflow/system exports for Viewport type:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"Viewport\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/system/dist/index.d.ts | head -20"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/system -name \"*.d.ts\" | head -5"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/system/dist/esm/types/panzoom.d.ts"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"export type Viewport\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/system/dist/esm/types/general.d.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/system/dist/esm/types/general.d.ts","offset":157,"limit":50}`

---

## Assistant

Perfect! Now let me check the useViewportHelper hook:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/dist/esm/hooks/useViewportHelper.d.ts"}`

---

## Assistant

Perfect! Now I have all the information needed. Let me create a comprehensive search report.

## React Flow v12 Viewport Persistence Research Report

Based on my thorough search of your codebase and the installed React Flow v12.10.1 library, here is what I found:

### 1. **Installed React Flow Version**
- Version: **@xyflow/react@12.10.1** (from package.json)
- Located at: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@xyflow/react/`

### 2. **Available Hooks for Viewport & Node Lifecycle Management**

All of these are available in React Flow v12:

| Hook | Purpose | File |
|------|---------|------|
| `useOnViewportChange` | Listen to viewport changes (`onStart`, `onChange`, `onEnd`) | `/crates/app/node_modules/@xyflow/react/dist/esm/hooks/useOnViewportChange.d.ts` |
| `useNodesInitialized` | Returns `boolean` indicating if nodes have been measured with width/height | `/crates/app/node_modules/@xyflow/react/dist/esm/hooks/useNodesInitialized.d.ts` |
| `useReactFlow` | Get instance with viewport methods | Available |
| `useViewportHelper` | Internal hook for viewport helper functions | Available (internal) |

### 3. **ReactFlowInstance Viewport Methods**

The `useReactFlow()` hook returns a `ReactFlowInstance` with these viewport-related methods:

```typescript
// From: crates/app/node_modules/@xyflow/react/dist/esm/types/instance.d.ts
type ReactFlowInstance = {
  fitView: FitView<NodeType>;  // Returns Promise<boolean>
  setViewport: SetViewport;     // From ViewportHelperFunctions
  getViewport: GetViewport;     // From ViewportHelperFunctions
  zoomIn: ZoomInOut;
  zoomOut: ZoomInOut;
  zoomTo: ZoomTo;
  getZoom: GetZoom;
  setCenter: SetCenter;
  fitBounds: FitBounds;
  screenToFlowPosition: (clientPos) => XYPosition;
  flowToScreenPosition: (flowPos) => XYPosition;
  viewportInitialized: boolean;
}
```

### 4. **Viewport Type Definition**

```typescript
// From: @xyflow/system/dist/esm/types/general.d.ts
type Viewport = {
  x: number;      // pan x
  y: number;      // pan y
  zoom: number;   // zoom level
};
```

### 5. **ReactFlow Props for Initial Viewport**

From `component-props.d.ts`:
- `defaultViewport?: Viewport` - Initial viewport position (ignored if `fitView=true`)
- `viewport?: Viewport` - Controlled viewport
- `onViewportChange?: (viewport: Viewport) => void` - Callback for controlled viewport
- `fitView?: boolean` - Auto-fit all nodes on initial mount
- `fitViewOptions?: FitViewOptions` - Customize initial fitView behavior
- `onInit?: OnInit<NodeType, EdgeType>` - Callback fired when viewport is initialized

### 6. **Current Pattern in CanvasEditor**

Your CanvasEditor already has a working viewport persistence pattern:

**File:** `/crates/app/src/components/Editor/CanvasEditor.tsx`

Key implementation:
- Lines 98-118: `VIEWPORT_STORAGE_KEY`, `loadSavedViewports()`, `persistViewport()` - localStorage-based caching
- Lines 199: `pendingViewportRef` - stores viewport pending restoration
- Lines 242-244: Queue viewport restore when file loads
- Lines 413-429: `handleInit()` callback that uses double RAF + `setViewport()` or `fitView()`
- Lines 489-493: Save viewport on unmount using `getViewport()`
- Line 955: `onInit={handleInit}` passed to ReactFlow

**Key pattern:**
```typescript
// On init (lines 413-429):
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

### 7. **Lifecycle Flow for Async Node Loading**

React Flow v12 provides this initialization sequence:

1. **`onInit` callback fires** - viewport is initialized but nodes may not be measured yet
2. **`useNodesInitialized()` hook** - returns `true` once all nodes have width/height
3. **`useOnViewportChange()` hook** - listen for viewport changes at any stage

**Recommended pattern for async loading:**

```typescript
import { useNodesInitialized, useOnViewportChange, useReactFlow } from '@xyflow/react';

function AsyncCanvasEditor() {
  const { fitView, setViewport } = useReactFlow();
  const nodesInitialized = useNodesInitialized();
  const [nodes, setNodes] = useState([]);

  // Load nodes async
  useEffect(() => {
    loadNodesAsync().then(setNodes);
  }, []);

  // After nodes + measurements, restore viewport
  useEffect(() => {
    if (!nodesInitialized) return;
    
    const savedVp = loadSavedViewport();
    if (savedVp) {
      setViewport(savedVp);
    } else {
      fitView({ padding: 0.2 });
    }
  }, [nodesInitialized]);

  // Persist viewport changes
  useOnViewportChange({
    onEnd: (viewport) => persistViewport(viewport),
  });
}
```

### 8. **Key Files & Exports**

- **@xyflow/react exports:** `/crates/app/node_modules/@xyflow/react/dist/esm/index.d.ts` - all public hooks
- **React Flow docs link:** https://reactflow.dev/api-reference/hooks (the README points here)
- **Component props:** `/crates/app/node_modules/@xyflow/react/dist/esm/types/component-props.d.ts` (600+ lines of detailed prop documentation)

### Summary

React Flow v12 has **full support** for viewport persistence through:
- ✅ `onInit` callback for initial viewport setup
- ✅ `useNodesInitialized()` to detect when layout is complete
- ✅ `setViewport()` and `getViewport()` methods for persistence
- ✅ `useOnViewportChange()` for listening to viewport changes
- ✅ `fitView()` for auto-fitting nodes

Your CanvasEditor's current double-RAF pattern is the correct approach for handling async node measurement. The `useNodesInitialized()` hook provides a cleaner alternative if you want to refactor.

---

