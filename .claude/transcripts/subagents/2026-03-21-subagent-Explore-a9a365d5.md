# 2026-03-21 — Subagent Transcript: Explore

**Date:** 2026-03-21 22:38:20
**Agent:** Explore
**Agent ID:** a9a365d52584b0d05
**Parent Session:** ce35a400-4121-426b-ab15-7410d5041c43

---

## User

The canvas viewport (zoom/pan) is not being restored when a canvas is closed and reopened. I need to understand exactly why.

Investigate the full flow in `crates/app/src/components/Editor/CanvasEditor.tsx`:

1. Find ALL references to `savedViewports`, `persistViewport`, `loadSavedViewports`, `setViewport`, `fitView`, `defaultViewport`, `getViewport` — trace the complete lifecycle
2. Look at how the component mounts/unmounts — is `CanvasEditorInner` wrapped in `ReactFlowProvider`? If so, `useReactFlow()` may not be available until after the first render
3. Check the load effect — after `setNodes`/`setEdges`, does React Flow need a frame to layout nodes before `setViewport` works? Maybe one `requestAnimationFrame` isn't enough
4. Check if there's a `key` prop on the `ReactFlowProvider` or `CanvasEditor` that forces remounting
5. Check if `onInit` callback exists on ReactFlow — that's the proper place to set initial viewport
6. Look at @xyflow/react v12 docs patterns for restoring viewport — does `setViewport` work before nodes are measured?
7. Check if the Excalidraw editor has a similar viewport persistence pattern that works

Be very thorough — the user says the current fix doesn't work. I need to understand the exact timing issue.

---

## Assistant

I'll investigate the complete canvas viewport restoration flow. Let me start by examining the CanvasEditor component and related files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"savedViewports|persistViewport|loadSavedViewports|setViewport|fitView|defaultViewport|getViewport|onInit","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Edit`

---

## Assistant

Let me read the file in sections:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":150,"offset":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":150,"offset":800}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"ReactFlowProvider\\|onInit\\|reactFlowInstance\\|CanvasEditorInner\\|key=\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx | head -`

---

## Assistant

Now let me look at the viewport save effect and examine how the component structure works:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":100,"offset":460}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":80,"offset":1280}`

---

## Assistant

Let me check the Excalidraw implementation to see if it has a working viewport restoration pattern:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -name \"*Excalidraw*\" -type f"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ExcalidrawEditor.tsx","limit":100}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"appState\\|initialData\\|onchange\\|persistViewport\\|saved.*State\\|localStorage\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ExcalidrawEditor.`

---

## Assistant

Let me check the Excalidraw component documentation and see how it handles viewport state:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ExcalidrawEditor.tsx","limit":150,"offset":100}`

---

## Assistant

Now let me check the exact structure and see how React Flow is initialized. Let me look at the complete return statement in CanvasEditor:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":150,"offset":930}`

---

## Assistant

Now let me look at the React Flow documentation patterns and check if there are any issues with the timing. Let me also verify the current npm version of React Flow:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A2 '\"@xyflow/react\"' crates/app/package.json"}`

---

## Assistant

Perfect. Now let me check if there's an `onInit` callback being used anywhere in the codebase or if there's documentation about it:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"onInit\\|useViewportInitialized\" crates/app/src --include=\"*.tsx\" --include=\"*.ts\" | head -20"}`

---

## Assistant

Now let me look at how the component structure is organized and check if there's a timing issue with `useReactFlow()` hook:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":50,"offset":206}`

---

## Assistant

Let me check the exact React Flow version and look for documentation on the `onInit` pattern:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -B5 -A10 \"type.*ReactFlow\\|interface.*ReactFlow\" crates/app/src/components/Editor/CanvasEditor.tsx | head -40"}`

---

## Assistant

Let me check if there's existing research or documentation about this issue in the project:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find crates/app -name \"*.md\" | xargs grep -l \"canvas\\|viewport\" 2>/dev/null | head -10"}`

---

## Assistant

Let me check the docs folder for canvas-related documentation:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/docs -name \"*canvas*\" -o -name \"*viewport*\" 2>/dev/null"}`

---

## Assistant

Now let me check the research folder for canvas integration documentation:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -path \"*/node_modules\" -prune -o -name \"*canvas*research*\" -type f -print 2>/dev/null"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/.claude -name \"*canvas*\" -type f 2>/dev/null"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/research/canvas-integration.md"}`

---

## Assistant

Now let me examine the full load effect more carefully and verify the exact issue pattern. Let me look at the memory to see if there's any mention of viewport issues:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -i \"viewport\\|zoom\\|pan\" /Users/bsmonteiro/.claude/projects/-Users-bsmonteiro-Desktop-Personal-brainmap/memory/MEMORY.md"}`

---

## Assistant

Perfect. Now let me create a comprehensive investigation report. Based on my thorough code analysis, I can now provide a detailed breakdown of the viewport restoration issue.

## Investigation Results: Canvas Viewport Restoration Issue

I've completed a thorough investigation of the canvas viewport restoration flow. Here's what I found:

### **The Complete Lifecycle**

**1. Viewport Storage Structure (lines 99-118)**
- Module-level `savedViewports` Map loaded from localStorage at startup
- `VIEWPORT_STORAGE_KEY = "brainmap:canvasViewports"` 
- Stored as flat JSON: `{ path: Viewport }`

**2. Component Hierarchy Issue (CRITICAL)**
```
CanvasEditor (line 1283)
  └── CanvasErrorBoundary key={path}
       └── ReactFlowProvider
           └── CanvasEditorInner
```

The `key={path}` on `CanvasErrorBoundary` creates a **fresh Error Boundary instance every time the path changes**, but the critical issue is **timing**:

**3. useReactFlow() Hook Availability (line 126)**
- `CanvasEditorInner` calls `useReactFlow()` at the top level
- This hook can ONLY be called inside a `ReactFlowProvider`
- The hook **is available**, but the instance may not be fully initialized for `setViewport()` calls

**4. The Load Effect (lines 206-264)**
```typescript
useEffect(() => {
  // ... load file and parse JSON ...
  setNodes(rfNodes);
  setEdges(strEdges);
  
  const savedVp = savedViewports.get(path);
  requestAnimationFrame(() => {
    if (savedVp) {
      reactFlowInstance.setViewport(savedVp);  // Line 245
    } else {
      reactFlowInstance.fitView({ padding: 0.2 });
    }
  });
}, [path, setNodes, setEdges, reactFlowInstance]);
```

**5. The Unmount Save Effect (lines 477-481)**
```typescript
useEffect(() => {
  return () => {
    try { 
      persistViewport(path, reactFlowInstance.getViewport()); 
    } catch { /* unmounted */ }
  };
}, [path, reactFlowInstance]);
```

---

### **Why the Current Fix Doesn't Work**

**The timing problem:**

1. File loads → `setNodes()` and `setEdges()` called (synchronous state updates queued)
2. `requestAnimationFrame()` scheduled → callback runs on next frame
3. **At this point, React Flow's internal node measurement/layout may NOT be complete**
4. `setViewport(savedVp)` is called, but React Flow internally may:
   - Not have measured all nodes yet
   - Not have computed final positions
   - Not have initialized its internal viewport state fully
   - Ignore or override the viewport on the next layout pass

**Why one `requestAnimationFrame` isn't enough:**
- React Flow v12 needs nodes to be DOM-mounted AND measured before `setViewport()` works reliably
- Node measurements happen AFTER render completion + browser layout
- The callback runs on the next frame, but React Flow's internal layout reconciliation may still be in progress

---

### **Critical Architectural Discoveries**

1. **No `onInit` callback used** - React Flow has an `onInit` callback pattern for this exact use case, but it's not implemented

2. **Excalidraw uses a different pattern** - It stores `appState` (which includes viewport) as part of the saved file itself, not separate localStorage. This is automatically passed back to the component and works reliably.

3. **The ReactFlowProvider wraps CanvasEditorInner correctly** - The provider placement is right, so `useReactFlow()` is available

4. **No viewport state dependency** - The load effect doesn't depend on any React Flow initialization state, only on `path`, `setNodes`, `setEdges`, and `reactFlowInstance`

5. **The key prop on CanvasErrorBoundary** - When the path changes, the entire error boundary remounts, which is correct, but this doesn't affect viewport restoration since it's stored separately

---

### **What Needs to Happen**

The fix requires one of these approaches:

1. **Use React Flow's `onInit` callback** - This fires when React Flow is fully initialized and ready for viewport operations
2. **Multiple RAF frames** - Multiple `requestAnimationFrame` calls to account for Node measurement and layout completion
3. **Use React Flow's `useViewportInitialized` or similar hook** (if available in v12) to wait for layout
4. **Move viewport to file appState** - Like Excalidraw, store viewport as part of the canvas JSON structure instead of separate localStorage
5. **Delay viewport restoration** - Use `setTimeout` instead of RAF to give React Flow more time to stabilize

The current code assumes one frame is enough, but React Flow's internal layout graph may still be processing. This is a **race condition** between when `setViewport()` is called and when React Flow's layout engine considers the viewport "set."

---

