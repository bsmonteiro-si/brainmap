# 2026-03-23 — Subagent Transcript: Explore

**Date:** 2026-03-23 10:50:10
**Agent:** Explore
**Agent ID:** a0a4ea692aee5a85a
**Parent Session:** 7c0c6948-9c95-40ff-bbe3-f5d83be3722b

---

## User

I need to understand the current canvas implementation in this BrainMap project to plan adding new typed card kinds (Summary, Question, Transition). 

Please explore thoroughly:

1. Read `docs/canvas-architecture.md` fully
2. Read `docs/extension-guides/add-canvas-node-type.md` fully
3. Read `crates/app/src-tauri/src/` files related to canvas (canvasNodes.tsx, CanvasEditor.tsx, canvasTranslation.ts, canvasShapes.ts, any canvas CSS)
4. Read the JSON Canvas data model - check how nodes are typed and what custom fields exist
5. Check the canvas toolbar and context menu code
6. Check the canvas store (likely in a zustand store)
7. Look at how existing node types (text, file, link, group) are rendered

Return all the details about:
- The node type system and how types are distinguished
- How nodes are rendered (components, styles)
- The toolbar and context menu for adding nodes
- The translation layer between JSON Canvas format and React Flow
- Any existing extension points for new node types
- The canvas CSS file(s)
- How node colors work currently

---

## Assistant

I'll conduct a thorough exploration of the canvas implementation. Let me start by reading the key documentation and source files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/canvas-architecture.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides/add-canvas-node-type.md"}`

---

## Assistant

Now let me explore the canvas source files:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/src/components/Editor/canvas*.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/src/components/Editor/canvas*.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/src/styles/canvas.css"}`

---

## Assistant

Let me find the correct path structure:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -name \"canvasNodes.tsx\" -o -name \"CanvasEditor.tsx\" -o -name \"canvasTranslation.ts\" | head -20"}`

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

Now let me read the canvasNodes.tsx in chunks:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","limit":400,"offset":1}`

---

## Assistant

Let me continue reading the canvasNodes.tsx file:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","limit":200,"offset":400}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","limit":200,"offset":600}`

---

## Assistant

Let me read the CanvasEditor.tsx to understand the toolbar and context menu:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"wc -l /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":400,"offset":1}`

---

## Assistant

Let me search for the context menu and toolbar code:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"handlePaneContextMenu\\|Add Text Card\\|Add Note Reference\\|Add Group\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx | head -20"`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":200,"offset":938}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":150,"offset":1470}`

---

## Assistant

Now let me find and read the App.css file for canvas styling:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -name \"App.css\" -o -name \"*canvas*.css\" | head -10"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"wc -l /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"\\.canvas-.*-node\\|\\.canvas-text-node\\|\\.canvas-file-node\\|\\.canvas-link-node\\|\\.canvas-group-node\\|\\.canvas-shape--\" /Users/bsmonteiro/Desktop/Personal/brainmap/crate`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","limit":300,"offset":5315}`

---

## Assistant

Now let me check the uiStore to see how canvas settings are managed:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"canvas\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts | head -50"}`

---

## Assistant

Perfect! Now let me get a comprehensive overview by reading the bottom toolbar and additional context menu code:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":200,"offset":1200}`

---

## Assistant

Perfect! Now I have enough information. Let me compile a comprehensive overview report for the user.

## Canvas Implementation Overview

Based on my thorough exploration of the BrainMap canvas codebase, here's a complete analysis to help you plan the new typed card kinds:

### 1. **Node Type System**

The canvas uses a **dual-layer type system**:

**JSON Canvas Level** (`canvasTranslation.ts`):
- Type strings: `"text"`, `"file"`, `"link"`, `"group"`
- Each type extends `JsonCanvasNodeBase` interface with type-specific fields
- Types are bidirectionally mapped:
  - `CANVAS_TO_RF_TYPE`: `"text" → "canvasText"`, `"file" → "canvasFile"`, `"link" → "canvasLink"`, `"group" → "canvasGroup"`
  - `RF_TO_CANVAS_TYPE`: Reverse mapping for serialization
  - Translation occurs in `canvasToFlow()` (load) and `flowToCanvas()` (save)

**React Flow Level** (`CanvasEditor.tsx`):
- React Flow node type names: `canvasText`, `canvasFile`, `canvasLink`, `canvasGroup`
- Module-level `NODE_TYPES` object maps React Flow names to component classes
- All node types registered in a single place (line 88-93)

### 2. **Node Rendering Architecture**

Located in `canvasNodes.tsx` (~825 lines). All node types follow this pattern:

```typescript
function CanvasXxxNodeInner({ id, data, selected }: NodeProps) {
  // 1. Extract data from node.data with type casting
  const d = data as { field?: string; color?: string; bgColor?: string };
  
  // 2. Render with shared components
  return (
    <div className="canvas-xxx-node" style={...}>
      <Resizer id={id} selected={selected} autoHeight />
      <CanvasNodeToolbar id={id} selected={selected} />
      {/* Custom content */}
      <FourHandles />
    </div>
  );
}

export const CanvasXxxNode = memo(CanvasXxxNodeInner);
```

**Shared Components** all nodes use:
- `FourHandles` (8 handles total: 4 source [top/right/bottom/left] + 4 target with `-target` suffix)
- `Resizer` (visible on hover, adjustable with `autoHeight` flag)
- `CanvasNodeToolbar` (delete, border color, background color; text nodes add shape/font/alignment controls)

**Key Component Details**:
- `ColorPickerDropdown` offers 6 preset colors + custom color picker
- Text formatting toolbar (FONT_SIZES, FONT_FAMILIES, TEXT_ALIGNMENTS, VERTICAL_ALIGNMENTS)
- All interactive elements use `nodrag` class to prevent node dragging

### 3. **Toolbar and Context Menu**

**Bottom Toolbar** (`CanvasEditor.tsx` line 1315-1400):
1. Pan/Select mode toggle (H/V keys)
2. Add text card (StickyNote icon) + shape dropdown
3. Add note reference (FileText icon) — tabbed picker
4. Add link (Link2 icon) — URL input
5. Add group (Layers icon)
6. Create new note (FilePlus icon)
7. File browser toggle (PanelRightOpen icon)
8. Zoom indicator

**Right-Click Context Menu** (`CanvasEditor.tsx` line 1472-1585):
- **Pane menu** (empty area): Add Text Card, Add Shaped Card (submenu), Add Note Reference (tabbed picker), Add Link, Add Group, Create New Note
- **Element menu** (node/edge): Duplicate, Group Selection (2+ nodes), Ungroup (groups only), Delete
- **Shape submenu**: All 6 shapes from `CANVAS_SHAPES` with default dimensions
- **Note picker**: Tabs for Notes/Files, search filter, max 30 results

**How new card types are added**:
- Context menu: `addNodeAtMenu(type, data, width, height)` (line 957)
- Toolbar: `addNodeAtCenter(type, data, width, height)` (line 1053)
- Both functions push undo snapshot, create unique ID, set node with proper styling

### 4. **Translation Layer** (`canvasTranslation.ts`)

**canvasToFlow** (~137 lines):
- Maps JSON Canvas nodes to React Flow format
- **Node size logic**: Groups and fixed shapes use `style: { width, height }`. Others use `style: { width }` + `style.minHeight` for auto-expand
- **Parent handling**: Converts absolute→relative positions, sorts parents before children
- **Edge markers**: Default `toEnd = "arrow"` per spec; creates `MarkerType.ArrowClosed`

**flowToCanvas** (~108 lines):
- Maps React Flow back to JSON Canvas
- **Position**: Converts parent-relative→absolute
- **Width resolution**: `n.width > style.width > measured.width > 250` fallback
- **Height**: `max(measured.height, n.height ?? style.height ?? style.minHeight ?? 100)`
- **Default stripping**: Only emits optional fields when non-default (e.g., `fontSize !== 13`)
- **Handle conversion**: Strips `-target` suffix from targetHandle

### 5. **Extension Points for New Node Types**

The codebase is designed to be extended. Follow the **add-canvas-node-type.md** guide which requires:

1. **Extend JSON Canvas types** in `canvasTranslation.ts`:
   - Add interface: `interface JsonCanvasYourNode extends JsonCanvasNodeBase { type: "your"; yourField: string; }`
   - Add to union: `type JsonCanvasNode = ... | JsonCanvasYourNode`
   - Add mappings: `CANVAS_TO_RF_TYPE: { your: "canvasYour" }` and reverse
   - Add cases in both `canvasToFlow()` and `flowToCanvas()` switches

2. **Create node component** in `canvasNodes.tsx`:
   - Function: `CanvasYourNodeInner` with `NodeProps` parameter
   - Include: `Resizer`, `CanvasNodeToolbar`, `FourHandles`
   - Export with `memo()`

3. **Register in CanvasEditor.tsx**:
   - Import component
   - Add to module-level `NODE_TYPES`: `canvasYour: CanvasYourNode`

4. **Add CSS** in `App.css`:
   - `.canvas-your-node { ... }` with `position: relative`

5. **Add UI** in `CanvasEditor.tsx`:
   - Context menu item in `handlePaneContextMenu`
   - Optional: toolbar button or shape picker entry

### 6. **Canvas CSS Architecture** (`App.css` lines 5315+)

**Node Base Styles**:
- `.canvas-file-node`: solid border, 3px left accent, background, padding
- `.canvas-text-node`: dashed border, flexbox with center alignment
- `.canvas-link-node`: solid border, flex row with favicon/info/button
- `.canvas-group-node`: z-index: -1, editable label, background color

**Shape Variants** (via `data-shape` attribute):
- `rectangle` (default): border-radius 6px
- `rounded`: border-radius from CSS var `--rounded-radius` (default 24px)
- `circle`: border-radius 50%, fixed aspect ratio
- `sticky`: complex shadow+fold+curl+stripe+tape+pin decorations
- `callout`: rounded border with tail triangle pseudo-elements
- `diamond`: clip-path polygon, fixed aspect ratio

**CSS Variables** (set by `shapeVars` in CanvasEditor.tsx):
- Sticky: `--sticky-color`, `--sticky-rotation`, `--sticky-shadow`, `--sticky-fold`, `--sticky-curl`, `--sticky-stripe`, `--sticky-pin`, `--sticky-tape`, `--sticky-lines`
- General: `--rounded-radius`, `--callout-tail`, `--group-font-family`, `--group-font-size`, `--edge-width`, `--canvas-selection-color`, `--canvas-selection-width`, `--canvas-node-shadow`

### 7. **Node Colors**

**Border/Text Color**:
- Nodes have `color` and `bgColor` data fields (optional)
- File nodes: border defaults to note type color via `getNodeColor(noteType)` from `graphStyles.ts`
- Text/Link nodes: border defaults to undefined (uses `--border-color`)
- All nodes: border color applied directly to element: `style={{ borderColor: d.color }}`

**Color Picker**:
- 6 preset colors: red, orange, yellow, green, cyan, purple
- Custom color input via HTML `<input type="color">`
- Clear button to remove color

### 8. **Storage and State Management**

**Zustand uiStore** (~25 canvas settings):
- `canvasTheme`, `canvasDotOpacity`, `canvasBackgroundVariant`, `canvasShowMinimap`, `canvasSnapToGrid`
- Card defaults: `canvasDefaultCardWidth` (300), `canvasDefaultCardHeight` (150)
- Font/shape settings: `canvasGroupFontFamily`, `canvasRoundedRadius`, `canvasStickyRotation`, etc.
- Persisted to `localStorage` key `"brainmap:uiPrefs"`

**Editor State** (all in `CanvasEditorInner`):
- Undo/Redo stacks (max 30 entries)
- Viewport persistence (per-path in `localStorage` key `"brainmap:canvasViewports"`)
- Dirty tracking via `dirtyRef` + `tabStore.isDirty`
- Debounced auto-save (1500ms)

### 9. **Data Model for New Types**

For **Summary**, **Question**, **Transition** cards, you'd extend `JsonCanvasTextNode` OR create new types. Key decisions:

**Option A: Extend text nodes with a "subtype" field**
```typescript
interface JsonCanvasTextNode extends JsonCanvasNodeBase {
  type: "text";
  text: string;
  subtype?: "default" | "summary" | "question" | "transition"; // NEW
  // ... existing fields
}
```
Pros: Reuses existing shape/font system. Cons: Less type-safe.

**Option B: Create separate node types**
```typescript
interface JsonCanvasSummaryNode extends JsonCanvasNodeBase {
  type: "summary";
  text: string;
  // ... summary-specific fields
}
```
Pros: Full type safety, distinct UI. Cons: More code duplication.

### 10. **Integration Points**

| System | File(s) | How Canvas integrates |
|--------|---------|----------------------|
| Tab system | `tabStore.ts`, `TabBar.tsx` | Tab kind `"canvas"`, renderer in `EditorPanel.tsx` |
| App shortcuts | `App.tsx` | Cmd+S custom event, Cmd+W closes tab |
| File tree | `FileTreePanel.tsx` | `.canvas` detection, "New Canvas" menu |
| Settings | `SettingsModal.tsx` | All `canvas*` settings exposed in UI |

---

## Summary

The canvas is well-architected for extensions. Adding new typed card kinds would require:

1. **Type definitions** in `canvasTranslation.ts` (new interface + union type + bidirectional mapping)
2. **React component** in `canvasNodes.tsx` (render function + memo export)
3. **Registration** in `CanvasEditor.tsx` (`NODE_TYPES` + context menu entry)
4. **CSS** in `App.css` (base styles, optional variants)
5. **Optional**: UI store settings for card-specific defaults

The system uses **color, border, background, shapes, fonts, and text alignment** as first-class customization options. New card types can inherit all of these or define their own specific fields. The translation layer automatically handles JSON Canvas serialization if you follow the established pattern.

---

