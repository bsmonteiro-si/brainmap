# 2026-03-24 — Subagent Transcript: Explore

**Date:** 2026-03-24 17:15:02
**Agent:** Explore
**Agent ID:** ad2255e4ddbc299ed
**Parent Session:** 21f5a143-5ae8-4a2f-a03b-15906b1a25b8

---

## User

Deep exploration of the Canvas state ownership and synchronization patterns in this React + React Flow (@xyflow/react) codebase.

I need to understand:

1. **Controlled vs Uncontrolled pattern**: Does the Canvas pass `nodes`/`edges` as props to ReactFlow (controlled), or use the internal store API (uncontrolled)? Look for `<ReactFlow nodes={...} edges={...}` vs `useReactFlow()` / `useStoreApi()` usage patterns.

2. **State locations**: Map every place where canvas node/edge data lives at runtime:
   - React component state (useState, useRef)
   - Zustand stores (any canvas-related store)
   - React Flow's internal store
   - The .canvas file on disk
   - Any intermediate translation layers

3. **Sync callbacks**: Find all `onNodesChange`, `onEdgesChange`, `onNodeDrag*`, `onNodeResize*` handlers. Trace what they do — do they update our state? Do they debounce? Do they apply constraints that differ from React Flow's internal state?

4. **Save/load flow**: How does data flow from disk → React Flow on load, and from React Flow → disk on save? Is there a translation layer (like `canvasTranslation.ts`)? Does the save read from our state or from React Flow's internal store?

5. **Re-render triggers**: Are there cases where our state gets pushed back into React Flow's props, potentially overwriting user changes that haven't been synced yet?

Key files to examine:
- `crates/app/src-tauri/src/` — any canvas-related Tauri commands
- `crates/app/src/` — look for CanvasEditor, canvasNodes, canvasTranslation, canvasStore, any canvas-related files
- Look for React Flow imports: `@xyflow/react`

Be very thorough. Read full file contents, not just snippets. This is about understanding the complete data flow.

---

## Assistant

I'll conduct a thorough exploration of the Canvas state ownership and synchronization patterns in this codebase. Let me start by mapping out the relevant files.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -type f -name \"*canvas*\" | head -50"}`

---

## Assistant

Now let me find the core canvas-related source files:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*canvas*"}`

---

## Assistant

Now let me find the main CanvasEditor component:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"*Canvas*\" | grep -v node_modules"}`

---

## Assistant

Perfect. Let me also check for canvas-related stores and any Tauri commands:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f \\( -name \"*store*\" -o -name \"*Store*\" \\) | grep -v node_modules | head -20"}`

---

## Assistant

Now let me check the Tauri commands related to canvas:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src -type f -name \"*.rs\" | head -20"}`

---

## Assistant

Let me now read all the core canvas files to understand the complete picture:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx"}`

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

Now let me read CanvasEditor in chunks:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":300,"offset":1}`

---

## Assistant

Let me continue reading CanvasEditor:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":300,"offset":300}`

---

## Assistant

Let me continue reading and also check canvasNodes:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":300,"offset":600}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","limit":300,"offset":1}`

---

## Assistant

Let me continue reading canvasNodes to see the full node/edge implementations:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","limit":400,"offset":300}`

---

## Assistant

Let me continue and also check the CanvasPanel component:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Canvas/CanvasPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"onNodesChange\\|onEdgesChange\\|setNodes\\|setEdges\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx | head -40"}`

---

## Assistant

Now let me search for the remaining parts of CanvasEditor and check Tauri-related canvas commands:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":300,"offset":900}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":300,"offset":1200}`

---

## Assistant

Now let me check the Tauri commands for any canvas-related handlers:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"canvas\\|plain.*file\\|writePlainFile\\|readPlainFile\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs | head -30"}`

---

## Assistant

Let me check the handlers:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"handle_read_plain_file\\|handle_write_plain_file\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs | head -10"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","limit":100,"offset":1}`

---

## Assistant

Let me read the plain file handler:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","limit":100,"offset":412}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","limit":100,"offset":511}`

---

## Assistant

Now let me check the canvas architecture doc that was mentioned:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/canvas-architecture.md"}`

---

## Assistant

Perfect! I now have a comprehensive understanding of the canvas architecture. Let me compile a detailed exploration report.

## Canvas State Ownership and Synchronization - Deep Exploration Report

Based on my thorough analysis of the codebase, here's the complete picture of how Canvas manages state:

### 1. **Controlled vs Uncontrolled Pattern**

**The Canvas uses a CONTROLLED pattern** with React Flow:

- **`useNodesState()` and `useEdgesState()`** at line 173-174 of `CanvasEditor.tsx`:
  ```typescript
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  ```

- **Nodes and edges are passed as props** to ReactFlow (lines 1285-1287):
  ```typescript
  <ReactFlow
    nodes={nodes}
    edges={edges}
    ...
    onNodesChange={handleNodesChange}
    onEdgesChange={handleEdgesChange}
  ```

- All changes flow through the handlers (`handleNodesChange`, `handleEdgesChange`) before being applied to the component state via `setNodes`/`setEdges`.

### 2. **Complete State Location Map**

Canvas data lives in **4 distinct locations** at runtime:

#### A. **React Component State (CanvasEditorInner)**
- `nodes` - React Flow nodes array (from `useNodesState()`)
- `edges` - React Flow edges array (from `useEdgesState()`)
- Various UI state: `loading`, `error`, `interactionMode`, `selecting`, `zoomLevel`, `showShortcuts`, context menus, toolbars

#### B. **Refs (Non-Re-render State)**
These are critical for save/undo mechanics:
- `nodesRef.current` / `edgesRef.current` - Always mirror the latest nodes/edges (lines 250-253)
- `lastSavedRef.current` - JSON string of the last saved state (for change detection)
- `dirtyRef.current` - Internal dirty flag
- `saveTimerRef.current` - Debounce timer handle
- `undoStackRef.current` / `redoStackRef.current` - Undo/redo stacks (JSON snapshots)
- `clipboardRef.current` - Copy/paste clipboard (JSON)

#### C. **Module-Level State**
- `pendingSaves` - Map<path, {nodes, edges}> (line 146) - tracks pending writes across all canvas instances
- `savedViewports` - Map<path, Viewport> (line 168) - persisted to localStorage key `brainmap:canvasViewports`

#### D. **React Flow's Internal Store**
- React Flow maintains its own internal store accessible via `useStore()` for selectors like `selectSelectedCount`
- This is SEPARATE from our component state; changes propagate through our handlers

#### E. **Zustand Stores (uiStore)**
- ~25 canvas-related settings read during render (lines 183-210)
- These are UI preferences, not data (e.g., `canvasTheme`, `canvasArrowSize`, `canvasSnapGridSize`)

#### F. **Disk (.canvas file)**
- JSON Canvas format (JSON Canvas spec 1.0)
- Contains nodes, edges with absolute positions

### 3. **Sync Callbacks - The Critical Handlers**

#### **`handleNodesChange` (lines 490-518)**
```typescript
const handleNodesChange: typeof onNodesChange = useCallback(
  (changes) => {
    // Snapshot on gesture start (not every intermediate change)
    let shouldSnapshot = false;
    for (const c of changes) {
      if (c.type === "remove" || c.type === "add") {
        shouldSnapshot = true;
      } else if (c.type === "position" && c.dragging === true && !isDraggingRef.current) {
        isDraggingRef.current = true;
        shouldSnapshot = true;
      } else if (c.type === "position" && c.dragging === false) {
        isDraggingRef.current = false;
      } else if (c.type === "dimensions" && !isResizingRef.current) {
        isResizingRef.current = true;
        shouldSnapshot = true;
      }
    }
    if (!changes.some(c => c.type === "dimensions")) {
      isResizingRef.current = false;
    }
    if (shouldSnapshot) pushSnapshot();
    onNodesChange(changes);  // Apply to React Flow state
    requestAnimationFrame(() => scheduleSave());
  },
);
```

**Flow**:
1. Detects gesture start/end based on `dragging` / `resizing` flags
2. Pushes undo snapshot ONLY on gesture start (coalesces intermediate moves)
3. Calls `onNodesChange(changes)` - the React Flow hook that updates our state
4. Schedules a debounced save

#### **`handleEdgesChange` (lines 520-530)**
Similar pattern - snapshot on add/remove, then apply, then schedule save.

#### **`onConnect` (lines 532-544)**
When a new edge is created:
```typescript
const onConnect: OnConnect = useCallback(
  (connection) => {
    pushSnapshot();
    setEdges((eds) =>
      addEdge(
        { ...connection, markerEnd: "brainmap-arrow", data: { isNew: true } },
        eds,
      ),
    );
    requestAnimationFrame(() => scheduleSave());
  },
);
```

**Critical detail**: `data: { isNew: true }` marks new edges so they can auto-prompt for labels.

#### **Other Change Handlers**
All other state modifications (delete, duplicate, group, color changes, etc.) follow the same pattern:
1. `pushSnapshot()` - push to undo stack
2. `setNodes()` / `setEdges()` - update component state
3. `requestAnimationFrame(() => scheduleSave())` - debounce save

### 4. **Save/Load Flow**

```
.canvas file (disk)
  ↓ readPlainFile(path)
  ↓ JSON.parse()
  ↓ canvasToFlow(parsed)
  → setNodes() + setEdges()
  → User edits via React Flow
  → flowToCanvas(nodes, edges)
  → JSON.stringify(canvas, null, 2)
  → writePlainFile(path) [debounced 1500ms]
  ↓ .canvas file updated
```

#### **Load (useEffect at line 274-312)**
1. On mount, calls `readPlainFile(path)` via Tauri
2. Parses JSON: `JSON.parse(file.body)`
3. **Translation**: `canvasToFlow(parsed)` converts:
   - JSON Canvas types (text/file/link/group) → React Flow types (canvasText/canvasFile/canvasLink/canvasGroup)
   - Absolute positions → parent-relative for nested nodes
   - Edge sourceHandle/targetHandle mapping
4. `setNodes(rfNodes)` + `setEdges(rfEdges)` - populate component state
5. Store "last saved" reference: `lastSavedRef.current = JSON.stringify(flowToCanvas(rfNodes, rfEdges))`

#### **Save (doSave at lines 315-338)**
```typescript
const doSave = useCallback(async () => {
  if (savingRef.current) return; // Guard concurrent saves
  savingRef.current = true;
  try {
    const canvas = flowToCanvas(nodesRef.current, edgesRef.current);  // Convert to JSON Canvas
    const json = JSON.stringify(canvas, null, 2);
    const api = await getAPI();
    await api.writePlainFile(path, json);  // Write to disk
    lastSavedRef.current = JSON.stringify(canvas);  // Update baseline
    dirtyRef.current = false;
    pendingSaves.delete(path);
    // Update tab dirty indicator
    if (mountedRef.current) {
      const tabId = useTabStore.getState().activeTabId;
      if (tabId === path) {
        useTabStore.getState().updateTabState(tabId, { isDirty: false });
      }
    }
  } catch (e) {
    log.error("canvas", "failed to save canvas", { path, error: String(e) });
  } finally {
    savingRef.current = false;
  }
}, [path]);
```

#### **Debounce Logic (lines 344-368)**
```typescript
const scheduleSave = useCallback(() => {
  try {
    const canvas = flowToCanvas(nodesRef.current, edgesRef.current);
    const currentJson = JSON.stringify(canvas);
    if (currentJson === lastSavedRef.current) return;  // No-op if unchanged
  } catch {
    // Non-serializable — treat as changed
  }

  pendingSaves.set(path, { nodes: nodesRef.current, edges: edgesRef.current });
  
  if (!dirtyRef.current) {
    dirtyRef.current = true;
    const tabId = useTabStore.getState().activeTabId;
    if (tabId === path) {
      useTabStore.getState().updateTabState(tabId, { isDirty: true });
    }
  }

  if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
  saveTimerRef.current = setTimeout(() => {
    saveTimerRef.current = null;
    doSaveRef.current();
  }, SAVE_DEBOUNCE_MS);  // 1500ms
}, [path]);
```

**Key safeguards**:
- Change detection via JSON comparison
- Debounce prevents excessive saves
- Module-level `pendingSaves` tracks unsaved canvases
- On unmount (lines 386-397), checks `pendingSaves.has(path)` and forces save if needed

### 5. **Translation Layer (canvasTranslation.ts)**

This is the **crucial synchronization layer** between JSON Canvas spec and React Flow internal representation.

#### **canvasToFlow (JSON Canvas → React Flow)**
- Type mapping: `text` → `canvasText`, `file` → `canvasFile`, etc.
- **Position handling**: JSON Canvas stores absolute positions; React Flow groups use parent-relative. Function converts:
  ```typescript
  if (n.parentId) {
    const parent = nodeById.get(n.parentId);
    if (parent) {
      n.position = {
        x: n.position.x - parent.position.x,
        y: n.position.y - parent.position.y,
      };
    }
  }
  ```
- **Array reordering**: Ensures parents precede children (React Flow requirement)
- **Handle mapping**: `fromSide` → `sourceHandle`, `toSide` → `targetHandle-target`
- **Size handling**: 
  - Groups and fixed shapes (circle, diamond): `{ width, height }` (fixed dimensions)
  - Other shapes: `{ width }` only, height auto-grows via `minHeight`

#### **flowToCanvas (React Flow → JSON Canvas)**
- Reverses all transformations
- Converts parent-relative positions back to absolute
- **Width resolution**: `n.width > style.width > measured.width > 250`
- **Height resolution**: `max(measured.height, n.height ?? style.height ?? style.minHeight ?? 100)`
- **Default omission**: Only includes optional fields if non-default (e.g., `shape != "rectangle"`)
- **Edge markers**: Detects arrows and reconstructs `fromEnd`/`toEnd` from marker IDs

### 6. **Re-render Triggers & State Overwrite Prevention**

**Key design principle**: React Flow's internal state is the source of truth once data is loaded.

#### **No re-render loop risk because**:
1. We never re-pass `nodes`/`edges` props based on an external store update
2. The component only has two data sources:
   - Initial load: `readPlainFile` → `setNodes/setEdges` (one-time)
   - User interaction: React Flow handlers → `setNodes/setEdges` (all state flows through this)
3. We read from `nodesRef` / `edgesRef` in closures for save/undo, not re-rendering

#### **ViewportRef Guard (lines 257-261, 468-487)**
Prevents viewport overwrites during transient mounts:
```typescript
const pendingViewportRef = useRef<Viewport | "fitView" | null>(null);
const hasRestoredViewportRef = useRef(false);

useEffect(() => {
  if (hasRestoredViewportRef.current) return; // Already restored
  const vp = pendingViewportRef.current;
  if (!vp) return; // Async load not done yet
  
  if (nodes.length > 0 && !nodesInitialized) return; // Wait for measurement
  
  hasRestoredViewportRef.current = true;
  requestAnimationFrame(() => {
    if (vp === "fitView") {
      reactFlowInstance.fitView({ padding: 0.2 });
    } else {
      reactFlowInstance.setViewport(vp);
    }
  });
}, [nodesInitialized, nodes.length, reactFlowInstance]);
```

On unmount (lines 547-554), only persists viewport if we actually restored it:
```typescript
useEffect(() => {
  return () => {
    if (!hasRestoredViewportRef.current) return;
    try { persistViewport(path, reactFlowInstance.getViewport()); } catch { }
  };
}, [path, reactFlowInstance]);
```

### 7. **Undo/Redo Implementation**

**Not a state machine** — uses **snapshot stacks**:

```typescript
const undoStackRef = useRef<{ nodes: string; edges: string }[]>([]);
const redoStackRef = useRef<{ nodes: string; edges: string }[]>([]);
const isUndoingRef = useRef(false);
```

#### **Snapshot triggers (lines 491-518)**
Only on gesture start, not every intermediate:
- Drag start: `c.type === "position" && c.dragging === true`
- Resize start: `c.type === "dimensions" && !isResizingRef.current`
- Add/remove: `c.type === "remove" || c.type === "add"`

#### **Undo flow (lines 414-428)**
```typescript
const canvasUndo = useCallback(() => {
  if (undoStackRef.current.length === 0) return;
  redoStackRef.current.push({
    nodes: JSON.stringify(nodesRef.current),
    edges: JSON.stringify(edgesRef.current),
  });
  const snap = undoStackRef.current.pop()!;
  isUndoingRef.current = true;
  setNodes(JSON.parse(snap.nodes));
  setEdges(JSON.parse(snap.edges));
  requestAnimationFrame(() => {
    isUndoingRef.current = false;
    scheduleSave();
  });
}, [setNodes, setEdges, scheduleSave]);
```

**Critical detail**: `isUndoingRef` prevents `handleNodesChange` from pushing another snapshot during replay.

### 8. **Node-Level State (Inside canvasNodes.tsx)**

Individual node components maintain minimal local state:

#### **CanvasTextNode (lines 541-657)**
```typescript
const [editing, setEditing] = useState(false);
const [editValue, setEditValue] = useState(text);
```

On blur/Escape, commits via:
```typescript
const commitEdit = () => {
  setNodes((nds) =>
    nds.map((n) => n.id === id ? { ...n, data: { ...n.data, text: editValue } } : n),
  );
  setEditing(false);
};
```

This uses `useReactFlow`'s `setNodes` directly (not the parent's callback).

#### **CanvasGroupNode**
Similar pattern for label editing.

#### **CanvasNodeToolbar (lines 140-371)**
Uses `useReactFlow().setNodes` for color/shape changes:
```typescript
const setNodeData = (patch: Record<string, unknown>) => {
  setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, ...patch } } : n));
};
```

**Important**: These nested components use React Flow's store API directly, not parent callbacks. They implicitly call the parent's `handleNodesChange` when state updates, which triggers save/snapshot logic.

### Summary: State Ownership Architecture

**Single source of truth**: React Flow's internal store (via `useNodesState` / `useEdgesState`)

**Data flow**:
1. **Load**: Disk → JSON Parse → Translation → setNodes/setEdges
2. **Edit**: React Flow handlers → setNodes/setEdges + undo snapshot + debounced save
3. **Save**: flowToCanvas translation → JSON stringify → writePlainFile
4. **Undo**: Pop snapshot → JSON parse → setNodes/setEdges + disable snapshot push

**Safeguards**:
- Refs (`nodesRef`/`edgesRef`) always mirrored from component state
- No re-render loop (component only updates from React Flow handlers)
- Debounce prevents excessive saves
- Change detection via JSON comparison
- Gesture coalescing (snapshot only on start, not intermediate moves)
- Viewport restore guard prevents transient overwrites
- Concurrent save guard (`savingRef`)

This is a well-architected, controlled pattern with multiple layers of protection against state corruption and unnecessary saves.

---

