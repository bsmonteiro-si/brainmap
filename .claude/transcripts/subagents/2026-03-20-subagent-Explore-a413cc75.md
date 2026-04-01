# 2026-03-20 — Subagent Transcript: Explore

**Date:** 2026-03-20 14:56:57
**Agent:** Explore
**Agent ID:** a413cc750d3538451
**Parent Session:** b1d9eca6-8bb3-4c0b-8673-2c48c1a7ec0b

---

## User

Research how @xyflow/react (React Flow v12) works for integration into a Tauri v2 + React 18 + TypeScript app. I need practical details:

1. Search the web for the @xyflow/react npm package — what's the current version, peer deps, bundle size?
2. What are the core APIs? (ReactFlow component, useNodesState, useEdgesState, useReactFlow, addEdge)
3. How do custom node types work? What props do they receive? Can they render arbitrary React components inside?
4. How do custom edge types work? Can edges have labels?
5. What built-in features are included? (MiniMap, Controls, Background, Panel)
6. How does drag-and-drop from external elements work? (e.g., dragging a note from a file tree onto the canvas)
7. How does serialization work? Can you get/set the full state (nodes + edges + viewport) for persistence?
8. Does it support dark/light theme?
9. What CSS does it ship? Any known conflicts with global styles?
10. Does it work in Tauri WebKit webviews?

Focus on what we need to build a canvas editor that loads/saves JSON Canvas files.

---

## Assistant

I'll research React Flow v12 for your Tauri integration. Let me gather information from the official sources and documentation.

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"@xyflow/react npm package version peer dependencies"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"React Flow v12 core APIs ReactFlow component useNodesState useEdgesState"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"React Flow custom node types props render React components"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"React Flow custom edge types labels styling"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"React Flow drag and drop external elements canvas"}`

---

## Assistant

Now let me search for more details on serialization, themes, CSS, and Tauri compatibility.

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"React Flow serialization persist state nodes edges viewport JSON"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"React Flow dark theme light theme dark mode support"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"React Flow CSS styles global styles conflicts"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"React Flow MiniMap Controls Background Panel components"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"Tauri WebKit webview React Flow compatibility"}`

---

## Assistant

Perfect! I now have comprehensive information. Let me compile this into a detailed research report.

## React Flow v12 (@xyflow/react) — Integration Research Report

I've researched React Flow v12 extensively. Here's what you need to know for your Tauri v2 + React 18 + TypeScript app:

---

### 1. Package Info & Dependencies

**Current Version:** 12.10.1 (latest)

**Peer Dependencies:**
- React ≥17
- React-dom ≥17

Your Tauri setup (React 18) meets these requirements. The package renamed from `reactflow` to `@xyflow/react` — make sure to update import statements and style paths if migrating from v11.

**Style Import:** `@xyflow/react/dist/style.css` (mandatory for core functionality)

---

### 2. Core APIs

React Flow v12 provides these essential hooks and components:

| API | Purpose |
|-----|---------|
| `ReactFlow` component | Main container — wraps your canvas |
| `useNodesState()` hook | Returns `[nodes, setNodes, onNodesChange]` for node state management |
| `useEdgesState()` hook | Returns `[edges, setEdges, onEdgesChange]` for edge state management |
| `useReactFlow()` hook | Access instance methods: `setNodes()`, `setEdges()`, `toObject()`, `setViewport()`, `getViewport()` |
| `useNodes()` / `useEdges()` hooks | Read-only selectors for current state |
| `addEdge()` utility | Connects nodes: `addEdge(connection, edges)` |

**Key Pattern for Your App:**
```typescript
const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
const { toObject, setViewport } = useReactFlow();

<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
/>
```

---

### 3. Custom Node Types

Custom nodes are just React components. Key details:

**Registration:**
```typescript
const nodeTypes = {
  customType: CustomNodeComponent,
  folderType: FolderNodeComponent
};
<ReactFlow nodeTypes={nodeTypes} ... />
```

**Node Props (what your component receives):**
```typescript
interface NodeProps {
  id: string;
  data: any; // Your custom data
  selected: boolean;
  isConnectable: boolean;
  // ... other props
}
```

**What You Can Do:**
- Render arbitrary React components inside nodes
- Access `props.data` to get custom fields (title, icon, color, etc.)
- Nodes are automatically wrapped with selection/drag handling
- **Post-measure dimensions:** React Flow writes `node.measured.width/height` after measuring (useful for server-side rendering/hydration)

**For Your Use Case:** You can render notes with icons, tags, and custom content. Each node's data object holds your note's metadata.

---

### 4. Custom Edge Types

React Flow supports **4 built-in edge types:** default (bezier), straight, step, smoothstep. You can create custom edges too.

**Edge Labels:**
- Labels can be any React component
- Use `EdgeLabelRenderer` component (a portal) to render labels outside SVG
- Use `EdgeText` component for simpler labels with styling
- Path utilities return midpoint coordinates for positioning
- Set `pointer-events: all` on labels if you want mouse interactions

**Example Edge with Label:**
```typescript
const CustomEdge = ({ sourceX, sourceY, targetX, targetY, ... }) => {
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  
  return (
    <>
      <path d={...} />
      <EdgeLabelRenderer>
        <div style={{ position: 'absolute', left: midX, top: midY }}>
          Label Text
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
```

---

### 5. Built-In Features

React Flow includes 4 convenient UI components:

| Component | Purpose |
|-----------|---------|
| `MiniMap` | Bird's-eye overview; can be zoomable/pannable |
| `Controls` | Zoom in/out, fit view, lock viewport buttons |
| `Background` | Grid or dots pattern background |
| `Panel` | Position content above viewport (used internally by MiniMap/Controls) |

All positioned via `Panel` component with position props (e.g., `position="top-right"`).

---

### 6. Drag & Drop from External Elements

**Not built-in.** React Flow handles internal drag-to-pan, but dragging items from your file tree onto the canvas requires:

**Best Options:**
1. **HTML Drag & Drop API** — Native, all browsers, but poor touch support
2. **Pointer Events** — Slightly more complex, but touch-compatible
3. **Neodrag library** — Third-party, better cross-platform (mouse + touch)

**Pattern:**
- Listen for `dragstart` on file tree items
- Set drag data (note ID, type, etc.)
- Add `drop` + `dragover` listeners to React Flow container
- Get drop position via `screenToFlowPosition()` from `useReactFlow()`
- Call `setNodes(addNode(...))` to create node at that position

---

### 7. Serialization & Persistence

**Built-in serialization** via `ReactFlowJsonObject` type:

```typescript
const flowState = reactFlowInstance.toObject();
// Returns: { nodes: [...], edges: [...], viewport: { x, y, zoom } }

// Save to JSON Canvas format:
const json = JSON.stringify(flowState);

// Restore:
const parsed = JSON.parse(json);
reactFlowInstance.setNodes(parsed.nodes);
reactFlowInstance.setEdges(parsed.edges);
reactFlowInstance.setViewport(parsed.viewport);
```

**For Your App:**
- `toObject()` gives you everything needed for JSON Canvas format
- `setViewport()` restores pan/zoom state
- State structure is simple enough for direct JSON serialization
- No special setup needed for persistence

---

### 8. Dark/Light Theme Support

React Flow 12 has **built-in theme support:**

```typescript
<ReactFlow colorMode="dark" ... />  // or "light" or "system"
```

**How It Works:**
- Sets `.dark` or `.light` class on root `.react-flow` element
- All default styles use CSS variables
- You can customize colors via CSS vars

**For Your App:**
- Already aligned with your existing Settings modal dark/light toggle
- Can wire `colorMode` to your theme store

---

### 9. CSS & Style Conflicts

**Critical Points:**

1. **Base styles are mandatory** — Import `@xyflow/react/dist/style.css` first
2. **Import order matters** — If using Tailwind, import it *after* React Flow styles
3. **Be careful overriding internal classes** — Many classes are required for functionality
4. **CSS variables are customizable** — Better approach than overriding class names

**For Your App:**
- Load React Flow styles early in your main CSS import chain
- Use CSS vars for theme customization rather than class overrides
- The CodeMirror lesson applies: don't manipulate internal spacing

---

### 10. Tauri WebKit Compatibility

**Good News:** React Flow should work in Tauri v2 webviews.

**Why:**
- Tauri uses native webviews: WebKit on macOS, WebKitGTK on Linux, WKWebView on iOS
- All support React 18 and modern JavaScript
- React Flow is a React component — just standard DOM/Canvas
- Tauri ships examples with React + Vite (your setup matches)

**No Known Issues** with React Flow specifically. The broader React + Tauri setup you have (Vite, v2) is the stable modern stack.

**One Caveat:** Make sure your `src-tauri/tauri.conf.json` doesn't restrict APIs React Flow might use (unlikely for a canvas editor).

---

### Summary: What You Get

React Flow v12 is a **feature-rich, well-documented library** perfect for a canvas editor:

✓ Custom nodes/edges with full React component power  
✓ Serialization to JSON (JSON Canvas compatible)  
✓ Built-in controls (zoom, pan, fit, minimap)  
✓ Dark/light theme (integrates with your Settings)  
✓ Drag-and-drop (via Pointer Events or HTML DnD)  
✓ TypeScript support  
✓ Tauri v2 compatible  

**Next Steps for Integration:**
1. Install: `npm install @xyflow/react @xyflow/system`
2. Create a `CanvasEditor` component wrapping `ReactFlow`
3. Wire to your Tauri backend for persistence (load/save JSON Canvas)
4. Implement custom node types for your note types
5. Add drag-from-file-tree via Pointer Events

---

### Sources

- [React Flow official site](https://reactflow.dev)
- [@xyflow/react npm package](https://www.npmjs.com/package/@xyflow/react)
- [useNodesState hook](https://reactflow.dev/api-reference/hooks/use-nodes-state)
- [useEdgesState hook](https://reactflow.dev/api-reference/hooks/use-edges-state)
- [useReactFlow hook](https://reactflow.dev/api-reference/hooks/use-react-flow)
- [Custom Nodes guide](https://reactflow.dev/learn/customization/custom-nodes)
- [NodeProps type reference](https://reactflow.dev/api-reference/types/node-props)
- [Edge Labels guide](https://reactflow.dev/learn/customization/edge-labels)
- [Custom Edges documentation](https://reactflow.dev/examples/edges/custom-edges)
- [Drag and Drop example](https://reactflow.dev/examples/interaction/drag-and-drop)
- [Save and Restore guide](https://reactflow.dev/examples/interaction/save-and-restore)
- [ReactFlowJsonObject type](https://reactflow.dev/api-reference/types/react-flow-json-object)
- [Dark Mode guide](https://reactflow.dev/examples/styling/dark-mode)
- [Theming documentation](https://reactflow.dev/learn/customization/theming)
- [Built-In Components guide](https://reactflow.dev/learn/concepts/built-in-components)
- [MiniMap component](https://reactflow.dev/api-reference/components/minimap)
- [Controls component](https://reactflow.dev/api-reference/components/controls)
- [Panel component](https://reactflow.dev/api-reference/components/panel)
- [Theming guide](https://reactflow.dev/learn/customization/theming)
- [Tauri Webview Versions reference](https://v2.tauri.app/reference/webview-versions/)
- [Tauri WebView API documentation](https://v2.tauri.app/reference/javascript/api/namespacewebview/)

---

