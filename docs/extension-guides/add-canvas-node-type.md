# How to Add a Canvas Node Type

Adds a new visual card type to the canvas editor. Canvas currently has 4 node types: file, text, link, group. Follow this checklist to add a 5th (or beyond).

> **Semantic variants vs new types**: If your new "type" is essentially a text card with different visual treatment (e.g., Summary, Question, Transition), use the **card kind subtype pattern** instead of a full new node type. Add an entry to `CARD_KIND_META` in `canvasNodes.tsx`, extend the `CanvasCardKind` union in `canvasTranslation.ts`, and add CSS. See `docs/canvas-architecture.md` § Card Kinds for details. Only create a full new node type when the rendering or data model is fundamentally different from text cards.

## Reference implementations

- `CanvasLinkNode` in `canvasNodes.tsx` — simplest node (good starting template)
- `CanvasTextNode` in `canvasNodes.tsx` — most complex (editing, shapes, text formatting)
- `CanvasFileNode` in `canvasNodes.tsx` — reads from graphStore, handles multiple file types

## Architecture overview

```
JSON Canvas (.canvas file)
  -> canvasToFlow() maps type string to React Flow node type name
  -> React Flow renders the registered component
  -> flowToCanvas() maps back to JSON Canvas type string
  -> Saved to file
```

## Checklist

### 1. Extend JSON Canvas types (`canvasTranslation.ts`)

- [ ] Create interface extending `JsonCanvasNodeBase`:
  ```typescript
  interface JsonCanvasYourNode extends JsonCanvasNodeBase {
    type: "your";
    yourField: string;
    // ... type-specific fields
  }
  ```
- [ ] Add to `JsonCanvasNode` union type
- [ ] Add mapping to `CANVAS_TO_RF_TYPE`: `your: "canvasYour"`
- [ ] Add mapping to `RF_TO_CANVAS_TYPE`: `canvasYour: "your"`
- [ ] Add `case "your":` in `canvasToFlow()` switch — populate `data` from JSON fields
- [ ] Add `case "your":` in `flowToCanvas()` switch — extract `data` back to JSON fields. Only emit optional fields when non-default.

### 2. Create the node component (`canvasNodes.tsx`)

- [ ] Create `CanvasYourNodeInner` function component with `NodeProps` parameter
- [ ] Destructure `{ id, data, selected }` from props
- [ ] Cast `data` to the expected shape: `const d = data as { yourField?: string; color?: string; bgColor?: string }`
- [ ] Include shared components in the render:
  ```tsx
  <div className="canvas-your-node" style={{ ...(d.color ? { borderColor: d.color } : {}), ...(d.bgColor ? { backgroundColor: d.bgColor } : {}) }}>
    <Resizer id={id} selected={selected} autoHeight />
    <CanvasNodeToolbar id={id} selected={selected} />
    {/* Your node content */}
    <FourHandles />
  </div>
  ```
- [ ] Add `nodrag` class to any interactive elements (inputs, textareas, buttons) so they don't trigger node dragging
- [ ] Export with `memo()`: `export const CanvasYourNode = memo(CanvasYourNodeInner);`

### 3. Register the node type (`CanvasEditor.tsx`)

- [ ] Import: `import { ..., CanvasYourNode } from "./canvasNodes";`
- [ ] Add to `NODE_TYPES` constant (module-level, NOT inside a component):
  ```typescript
  const NODE_TYPES = {
    // ...existing types
    canvasYour: CanvasYourNode,
  };
  ```

### 4. Add CSS (`App.css`)

- [ ] Add `.canvas-your-node` styles following the pattern of existing node classes
- [ ] Match the border-left accent color pattern if applicable
- [ ] Ensure the node has `position: relative` (required for handles and resizer)

### 5. Add creation UI (optional but recommended)

- [ ] **Context menu**: Add item in `handlePaneContextMenu` section of `CanvasEditor.tsx`
  ```tsx
  <div className="context-menu-item" onClick={() => addNodeAtMenu("canvasYour", { yourField: "default" })}>
    Add Your Card
  </div>
  ```
- [ ] **Bottom toolbar**: Add button if it's a primary creation action

### 6. Update tests

- [ ] `canvasTranslation.test.ts`: Add round-trip test (JSON Canvas -> React Flow -> JSON Canvas)
- [ ] `CanvasEditor.test.tsx`: Ensure the new node type renders without crashing

### 7. Update documentation

- [ ] `docs/canvas-architecture.md`: Update Node Type Architecture table, Component Hierarchy, and Common Tasks
- [ ] `docs/CHANGELOG.md`: Note the new node type

## Common pitfalls

- **Node types object must be module-level**: If `NODE_TYPES` is recreated on each render, React Flow will unmount/remount all nodes, losing internal state.
- **Handle IDs must match translation**: Source handles use bare IDs (`top`, `right`, `bottom`, `left`). Target handles use `{side}-target` suffix. This convention is in `canvasToFlow`/`flowToCanvas`.
- **Fixed-size shapes**: If your node should not auto-expand (like circle/diamond), use `style: { width, height }` instead of `style: { width, minHeight }`. Set this in both `canvasToFlow()` and `addNodeAtMenu()`/`addNodeAtCenter()`.
- **Parent-relative positions**: Nodes inside groups have positions relative to the group. The translation layer handles this, but if your node type can be a parent (like groups), you need to handle coordinate conversion.
