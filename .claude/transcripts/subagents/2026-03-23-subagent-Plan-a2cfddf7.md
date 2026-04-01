# 2026-03-23 — Subagent Transcript: Plan

**Date:** 2026-03-23 10:52:54
**Agent:** Plan
**Agent ID:** a2cfddf7fe6a90e63
**Parent Session:** 7c0c6948-9c95-40ff-bbe3-f5d83be3722b

---

## User

Plan the implementation of three new typed canvas card kinds for the BrainMap project: **Summary**, **Question**, and **Transition**. These are text cards with semantic intent — visually differentiated but fundamentally text nodes.

## Current Architecture

The canvas uses JSON Canvas spec with React Flow (`@xyflow/react`). Key files:

- `crates/app/src-tauri/src/canvasTranslation.ts` — bidirectional JSON Canvas ↔ React Flow translation. Has `CANVAS_TO_RF_TYPE` and `RF_TO_CANVAS_TYPE` maps, `canvasToFlow()` and `flowToCanvas()` functions. Node types: text, file, link, group.
- `crates/app/src-tauri/src/canvasNodes.tsx` (~825 lines) — React components for each node type. Each has Inner function + memo export. Shared: `FourHandles`, `Resizer`, `CanvasNodeToolbar`.
- `crates/app/src-tauri/src/CanvasEditor.tsx` — Main editor. Module-level `NODE_TYPES` object. Bottom toolbar, right-click context menu. `addNodeAtMenu()` and `addNodeAtCenter()` for creating nodes.
- `crates/app/src-tauri/src/App.css` — Canvas CSS (line 5315+). Shape variants via `data-shape` attribute.
- `docs/canvas-architecture.md` — Architecture docs.
- `docs/extension-guides/add-canvas-node-type.md` — Extension guide for adding node types.

### Current text node structure:
```typescript
interface JsonCanvasTextNode extends JsonCanvasNodeBase {
  type: "text";
  text: string;
  shape?: CanvasShape;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: "left" | "center" | "right";
  verticalAlign?: "top" | "center" | "bottom";
}
```

### Key design decision: Subtype vs Separate types

**Option A — Subtype field on text nodes:**
Add `cardKind?: "summary" | "question" | "transition"` to `JsonCanvasTextNode`. Reuse existing text node component with visual variants. Pros: less code, reuses all text formatting. Cons: one component handles multiple visual states.

**Option B — Separate React Flow types, same JSON Canvas type:**
Keep JSON Canvas type as `"text"` with a `cardKind` field, but map to separate React Flow components (`canvasSummary`, `canvasQuestion`, `canvasTransition`). Pros: clean component separation, type-safe. Cons: more components but each is simple.

### Visual treatment ideas:
- **Summary**: Condensed/digest feel — maybe a header badge "Summary", distinct border color (blue-ish)
- **Question**: Inquiry feel — "?" icon or badge, distinct color (amber/yellow)  
- **Transition**: Connection/flow feel — arrow-ish badge, distinct color (green)

### UI entry points:
- Bottom toolbar: The "Add text card" button could have a dropdown (like shapes do) offering Text, Summary, Question, Transition
- Context menu: Add entries under a "Add Card" submenu
- Existing text cards: Right-click "Change card kind" option to convert between types

### What I need you to plan:
1. Which approach (A vs B) and why
2. Exact type changes in canvasTranslation.ts
3. Component design in canvasNodes.tsx (reuse vs new components)
4. CSS approach (how to visually differentiate)
5. Toolbar and context menu changes in CanvasEditor.tsx
6. Whether existing text cards should be convertible
7. Auto-save / serialization — how cardKind persists in .canvas files
8. What settings (if any) to add to uiStore
9. Doc updates needed
10. Test strategy

---

## Assistant



I'll explore the codebase to understand the current canvas implementation before designing the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides/add-canvas-node-type.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/canvas-architecture.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/canvasTranslation.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/canvasTranslation.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/canvasTranslation*"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","limit":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","offset":200,"limit":200}`

---

## Assistant

Now let me read the CanvasTextNode component and the CanvasEditor toolbar/context menu sections.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","offset":400,"limit":200}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"addNodeAtMenu|addNodeAtCenter|Add text card|Add Text|context-menu-item.*Add","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"NODE_TYPES|canvasText|canvasFile|canvasLink|canvasGroup","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_mode":"content","-n"`

---

## Assistant

Let me look at the `addNodeAtMenu` and `addNodeAtCenter` function signatures, and the context menu and toolbar sections more closely.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":955,"limit":90}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":1320,"limit":120}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":1470,"limit":130}`

---

## Assistant

Now let me check the existing test file and the element context menu for the "Change" conversion concept.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.test.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":1586,"limit":50}`

---

## Assistant

Now let me check the CSS for existing canvas node styles to understand the visual pattern.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.canvas-text-node\\b|\\.canvas-file-node\\b|\\.canvas-link-node\\b|\\.canvas-file-node-badge","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"c`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasShapes.ts"}`

---

## Assistant

Now let me look at the CSS for the text node and badge patterns more closely.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":5315,"limit":100}`

---

## Assistant

I now have a thorough understanding of the codebase. Let me present the implementation plan.

---

## Implementation Plan: Summary, Question, and Transition Canvas Card Kinds

### 1. Design Decision: Option A (Subtype field) -- Recommended

**Option A** is the right choice. Here is why:

- These three card kinds are fundamentally text nodes with semantic decoration. They share 100% of the editing behavior (double-click to edit, textarea, text formatting, shapes, font size, font family, text alignment, vertical alignment).
- Creating three separate React Flow components (Option B) would mean triplicating all the editing logic from `CanvasTextNodeInner` (lines 451-543 of canvasNodes.tsx) -- or extracting it into a shared hook, which is refactoring for its own sake.
- The shapes system (`data-shape` attribute) already demonstrates the pattern of visual variants within a single `canvasText` component. Card kind is an analogous concept -- a semantic variant rather than a geometric one.
- JSON Canvas interop is simpler: the file format stays `type: "text"` with an optional `cardKind` field. No new type mapping needed. Any tool that reads `.canvas` files sees standard text nodes.

The only downside (one component handles multiple visual states) is already the case with 6 shapes. Adding one more `data-card-kind` attribute is negligible complexity.

### 2. Type Changes in `canvasTranslation.ts`

**Interface change** -- add `cardKind` to `JsonCanvasTextNode`:

```typescript
interface JsonCanvasTextNode extends JsonCanvasNodeBase {
  type: "text";
  text: string;
  shape?: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: string;
  textVAlign?: string;
  cardKind?: "summary" | "question" | "transition";  // NEW
}
```

**`canvasToFlow()`** -- in the `case "text":` block (line 98-105), add after the existing fields:
```typescript
if (cn.cardKind) data.cardKind = cn.cardKind;
```

**`flowToCanvas()`** -- in the `case "text":` block (line 240-248), add after the existing optional fields:
```typescript
if (data.cardKind) node.cardKind = String(data.cardKind) as "summary" | "question" | "transition";
```

No changes to `CANVAS_TO_RF_TYPE` or `RF_TO_CANVAS_TYPE`. No new React Flow type registration needed. The existing `canvasText` type handles all card kinds.

### 3. Component Design in `canvasNodes.tsx`

Modify `CanvasTextNodeInner` (one component, visual variants):

**a) Data destructuring** -- add `cardKind` to the cast at line 452:
```typescript
const d = data as { text?: string; color?: string; bgColor?: string; shape?: string; fontSize?: number; fontFamily?: string; textAlign?: string; textVAlign?: string; cardKind?: string };
```

**b) Badge rendering** -- add a badge above the text body (same pattern as `canvas-file-node-badge`), rendered when `d.cardKind` is set. Place it inside the `canvas-text-node` div, before the editing/display section:
```tsx
{d.cardKind && (
  <span className={`canvas-card-kind-badge canvas-card-kind-badge--${d.cardKind}`}>
    {CARD_KIND_LABELS[d.cardKind]}
  </span>
)}
```

**c) `data-card-kind` attribute** -- add to the outer div for CSS targeting:
```tsx
<div
  className="canvas-text-node"
  data-shape={d.shape || "rectangle"}
  data-card-kind={d.cardKind || undefined}
  ...
```

**d) Card kind constants** -- define near the top of `canvasNodes.tsx`:
```typescript
const CARD_KIND_LABELS: Record<string, string> = {
  summary: "Summary",
  question: "Question",
  transition: "Transition",
};
const CARD_KIND_META: { id: string; label: string; icon: string; badgeColor: string; borderColor: string }[] = [
  { id: "summary",    label: "Summary",    icon: "ClipboardList", badgeColor: "#3b82f6", borderColor: "#3b82f6" },
  { id: "question",   label: "Question",   icon: "HelpCircle",   badgeColor: "#f59e0b", borderColor: "#f59e0b" },
  { id: "transition", label: "Transition", icon: "ArrowRightLeft",badgeColor: "#10b981", borderColor: "#10b981" },
];
```

**e) Toolbar integration** -- pass `cardKind` to `CanvasNodeToolbar` (no new toolbar buttons needed for card kind -- the conversion happens via context menu, described below). The toolbar already handles shape, text formatting, colors -- no change needed there.

### 4. CSS Approach in `App.css`

**Badge styles** (following the `canvas-file-node-badge` pattern at line 5342):
```css
.canvas-card-kind-badge {
  position: absolute;
  top: -10px;
  left: 10px;
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 3px;
  color: #fff;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
  z-index: 1;
}
.canvas-card-kind-badge--summary    { background: #3b82f6; }
.canvas-card-kind-badge--question   { background: #f59e0b; }
.canvas-card-kind-badge--transition { background: #10b981; }
```

**Border accent** (via `data-card-kind` attribute, same approach as `data-shape`):
```css
.canvas-text-node[data-card-kind="summary"]    { border-color: #3b82f6; border-style: solid; }
.canvas-text-node[data-card-kind="question"]   { border-color: #f59e0b; border-style: solid; }
.canvas-text-node[data-card-kind="transition"] { border-color: #10b981; border-style: solid; }
```

Note the `border-style: solid` override -- plain text nodes use `dashed` (line 5379). Semantic cards should feel more intentional with a solid border.

Light theme variants should also be added (check if there is a `.canvas-light` parent selector pattern for colors).

### 5. Toolbar and Context Menu Changes in `CanvasEditor.tsx`

**Bottom toolbar** -- modify the "Add text card" split button area (lines 1331-1346):

The main button stays as "Add text card". The caret dropdown (currently only shows shapes) gets extended to also show card kinds. Two approaches:

- **Preferred**: Change the shape picker dropdown (lines 1410-1429) to have two sections: "Shapes" and "Card Kinds". Add a divider and three card kind buttons below the shapes. Clicking a card kind calls `addNodeAtCenter("canvasText", { text: "", cardKind: "summary" })`.

**Pane context menu** (lines 1478-1526) -- add three items after "Add Text Card":
```
Add Text Card          (existing)
Add Summary Card       (NEW)
Add Question Card      (NEW)
Add Transition Card    (NEW)
Add Shaped Card...     (existing)
```

Each calls `addNodeAtMenu("canvasText", { text: "", cardKind: "summary" })` etc. The default text for semantic cards should be empty string `""` rather than "New text card" -- the badge already communicates intent, and the user will type their own content.

**Element context menu** (lines 1586-1617) -- add a "Change Card Kind" submenu for `canvasText` nodes:

After "Duplicate" and before "Delete", when the right-clicked node is a text node, show:
```
Duplicate
Change Card Kind >
  Text (plain)
  Summary
  Question
  Transition
Delete
```

This uses `setNodes` to patch `data.cardKind` (or remove it for "Text (plain)").

### 6. Convertibility

Yes, existing text cards should be fully convertible. The element context menu "Change Card Kind" submenu handles this. Implementation:

```typescript
const changeCardKind = (kind: string | undefined) => {
  pushSnapshot();
  setNodes((nds) => nds.map((n) => {
    if (!n.selected) return n;
    const data = { ...n.data };
    if (kind) {
      data.cardKind = kind;
    } else {
      delete data.cardKind;
    }
    return { ...n, data };
  }));
  closeElemCtxMenu();
  requestAnimationFrame(() => scheduleSave());
};
```

This modifies all selected nodes, which is consistent with other bulk operations. Setting `cardKind` to `undefined` (or deleting it) converts back to a plain text card.

### 7. Auto-Save / Serialization

No changes to auto-save mechanics. The `cardKind` field flows through the existing pipeline:

1. User changes card kind -> `setNodes` updates React Flow state
2. `scheduleSave()` fires (already triggered by `requestAnimationFrame` after node mutation)
3. `flowToCanvas()` serializes `cardKind` (new code in step 2 above)
4. `JSON.stringify` writes to `.canvas` file

The `cardKind` field is only emitted when non-undefined (matching the default-stripping pattern at line 242-246). This means:
- Plain text cards have no `cardKind` in the JSON (backward compatible)
- Opening a `.canvas` file with `cardKind` in an older version of BrainMap silently ignores the field (forward compatible, since `JsonCanvasTextNode` used a `switch` that only reads known fields)

### 8. UI Store Settings

No new uiStore settings needed. The card kinds have fixed colors/styles. If customization is desired later (e.g., `canvasSummaryColor`, `canvasQuestionColor`, `canvasTransitionColor`), that can be a follow-up. For now, the hardcoded colors in CSS and the constants in `canvasNodes.tsx` are sufficient.

### 9. Documentation Updates

**`docs/canvas-architecture.md`**:
- Update "Node Type Architecture" table -- add a note that text nodes support `cardKind` subtypes (summary, question, transition)
- Update "Context Menus" section -- mention card kind items in both pane and element context menus
- Update "Bottom Toolbar" section -- mention card kind options in the shape dropdown

**`docs/extension-guides/add-canvas-node-type.md`**:
- Add a note that for text node subtypes (semantic variants that share all text editing behavior), the preferred pattern is the `cardKind` field rather than a separate React Flow type. Reference this implementation as the example.

**`docs/CHANGELOG.md`**:
- Add entry for the new card kinds

**`CLAUDE.md`**:
- No changes needed (existing canvas conventions cover this)

### 10. Test Strategy

**`canvasTranslation.test.ts`** -- add these tests:

1. `canvasToFlow` preserves `cardKind` on text nodes
2. `canvasToFlow` handles text nodes without `cardKind` (backward compat)
3. `flowToCanvas` emits `cardKind` when set
4. `flowToCanvas` omits `cardKind` when undefined
5. Round-trip preserves `cardKind` through `canvasToFlow` -> `flowToCanvas`
6. Round-trip produces clean output for plain text node (no `cardKind` key)

**`CanvasEditor.test.tsx`** (if it exists, or create) -- add:

7. Rendering a text node with `cardKind="summary"` shows the badge
8. Rendering a text node with `cardKind="question"` shows the badge
9. Rendering a text node without `cardKind` shows no badge

**No Rust tests needed** -- this is a frontend-only change. The `.canvas` file format is JSON and the Rust core does not parse canvas files.

### Implementation Sequence

1. **canvasTranslation.ts** -- add `cardKind` to interface, `canvasToFlow`, `flowToCanvas`
2. **canvasTranslation.test.ts** -- add round-trip and serialization tests
3. **canvasNodes.tsx** -- add constants, badge rendering, `data-card-kind` attribute
4. **App.css** -- add badge and border CSS
5. **CanvasEditor.tsx** -- add context menu items, toolbar dropdown items, `changeCardKind` function
6. **Documentation** -- update canvas-architecture.md, add-canvas-node-type.md, CHANGELOG.md

Steps 1-2 can be done together. Steps 3-4 can be done together. Step 5 depends on step 3 (needs the constants). Step 6 can be done last.

### Potential Challenges

- **Badge positioning with shapes**: The absolute-positioned badge (`top: -10px`) may look odd on circle or diamond shapes. Test with each shape + card kind combination. May need `data-shape`-specific badge positioning CSS.
- **Badge + sticky note decorations**: Sticky notes have `::before`/`::after` pseudo-elements for fold effects (line 5449+). Verify the badge z-index stacks correctly.
- **Minimap colors**: The minimap color function (line 1308) currently only distinguishes by React Flow type. Since card kinds share `canvasText`, they will all have the same minimap color. This is acceptable for v1 but could be enhanced by checking `node.data.cardKind` in the minimap color callback.

---

### Critical Files for Implementation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.ts` - Add `cardKind` to JsonCanvasTextNode interface and both translation functions
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx` - Add badge rendering, card kind constants, and `data-card-kind` attribute to CanvasTextNode
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx` - Add card kind items to toolbar dropdown, pane context menu, and element context menu
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` - Add badge styles and border color overrides for each card kind
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.test.ts` - Add round-trip and serialization tests for cardKind

---

