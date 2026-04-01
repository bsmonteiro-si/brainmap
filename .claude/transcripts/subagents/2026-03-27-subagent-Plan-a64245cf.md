# 2026-03-27 — Subagent Transcript: Plan

**Date:** 2026-03-27 17:07:20
**Agent:** Plan
**Agent ID:** a64245cf3b2cbb282
**Parent Session:** 7f36fd4b-08fe-496c-a342-10b9f6e43cda

---

## User

Design an implementation plan for "Convert Text Card to Note" in the Canvas editor of the BrainMap app.

## Context

BrainMap is a Tauri v2 + React 18 app. Canvas uses @xyflow/react with JSON Canvas format. Notes are .md files with YAML frontmatter managed by a Rust backend via Tauri commands.

## Requirements (from user answers)

1. **Trigger**: Button in the floating toolbar that appears when a text card is selected
2. **Content extraction**: Auto-extract title from first line of card text, rest becomes body. Minimal confirmation dialog (confirm title, pick type, choose path).
3. **After creation**: Replace the text card with a file node at the same position/size, preserving all connected edges (labels, colors, etc.)
4. **Card kind mapping**: Map card kinds to note types (summary→concept, question→question, transition→concept as default). Default to "concept" if no mapping.
5. **File path**: Show path input pre-filled with canvas folder, user can change it
6. **File naming**: Auto-slugify title to kebab-case filename, but user doesn't edit the name (it's derived)
7. **Edges**: All edges transferred to the replacement file node

## Key files to consider

- `crates/app/src/components/Editor/canvasNodes.tsx` — Node components including toolbar
- `crates/app/src/components/Editor/CanvasEditor.tsx` — Main canvas editor, has addNodeAtMenu, context menu, toolbar logic
- `crates/app/src/components/Editor/canvasTranslation.ts` — JSON Canvas ↔ React Flow conversion
- `crates/app/src/components/Editor/CreateNoteDialog.tsx` — Existing note creation dialog
- `crates/app/src/api/tauri.ts` — API bridge with createNote method
- `crates/app/src/stores/uiStore.ts` — UI state management

## Existing patterns

- The floating toolbar on nodes is in `canvasNodes.tsx` (NodeToolbar from @xyflow/react)
- CreateNoteDialog already handles note creation with path, title, type, tags, body fields
- There's already a `createNoteForCanvas` flow that opens CreateNoteDialog with a callback to add a file node
- The `api.createNote()` call returns the created note path
- Canvas auto-saves via debounced `saveCanvas()` in CanvasEditor

## Design questions to address

1. Should we reuse CreateNoteDialog or create a simpler dedicated dialog? Consider that we want: title confirmation, type picker (pre-filled from card kind mapping), and path input. The full CreateNoteDialog has more fields than needed.
2. How to handle the node replacement atomically — remove text node + add file node + transfer edges in one React Flow state update to avoid visual glitches?
3. How to slugify the title for the filename?
4. What happens if the first line is empty or the card has no text?
5. Edge preservation: React Flow edges reference node IDs. When we replace the text node with a file node, we need to either reuse the same node ID or update all edge references.

Please provide a detailed step-by-step implementation plan.

---

## Assistant



I'll explore the codebase to understand the existing patterns and architecture before designing the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx"}`

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CreateNoteDialog.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts"}`

---

## Assistant

Now let me look at the toolbar in canvasNodes.tsx and the existing `createNoteForCanvas` flow.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"createNoteForCanvas|createNoteOnCreatedCallback|NodeToolbar","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"openCreateNoteDialog|createNoteDialog","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":1180,"limit":50}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","offset":141,"limit":260}`

---

## Assistant

Now let me look at the CanvasTextNode component to understand the text card structure, and the uiStore for `openCreateNoteDialog` signature.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","offset":580,"limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","offset":1015,"limit":30}`

---

## Assistant

Let me check the uiStore for the `CreateNoteDialogOpts` type and see if there's a `canvasPath` or similar state to understand how the canvas folder is determined.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"CreateNoteDialogOpts","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","output_mode":"content","-C":5}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"canvasPath|canvasFile|\\.canvas","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_mode":"content","head_limit":20}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"canvasPath|filePath|props\\.(path|file)","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_mode":"content","head_limit":15}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"interface.*CanvasEditor|function CanvasEditor|export.*CanvasEditor","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_mode":"co`

---

## Assistant

Good. The canvas editor receives `path` (the `.canvas` file path). Now let me check how the `pushSnapshot` undo system works since we'll need atomic node replacement.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pushSnapshot|useCanvasSnapshot","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_mode":"content","head_limit":15}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"useCanvasSave|useCanvasSnapshot|useCanvasPanelMode","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_mode":"content","-B":1,"-`

---

## Assistant

Now I have a thorough understanding of the codebase. Let me look at one more thing -- where the `CanvasTextNode` component is defined to see its full props, and confirm the text card toolbar gets `cardKind`.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","offset":540,"limit":30}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"function CanvasTextNode|CanvasTextNode = memo","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","offset":572,"limit":10}`

---

## Assistant

I now have a complete understanding of the architecture. Here is my detailed implementation plan.

---

## Implementation Plan: Convert Text Card to Note

### Overview

This feature adds a button to the floating toolbar of text cards on the canvas. When clicked, it extracts the card's text content, creates a new `.md` note via the Rust backend, and replaces the text card with a file node pointing to the newly created note -- all while preserving edges and position.

### Design Decisions

**1. Reuse CreateNoteDialog vs. dedicated dialog?**
Create a new, simpler `ConvertToNoteDialog` component rather than reusing `CreateNoteDialog`. Rationale: the existing dialog has mode toggles (Note/File), tags input, body textarea, and browse functionality that add complexity. The conversion flow needs a streamlined dialog with only three fields (title confirmation, type picker, path input). The body is already known (extracted from card text), the tags are not needed at creation time, and we never want File/Canvas/Excalidraw modes. Building a simpler component is cleaner than adding yet another mode branch to the already-complex `CreateNoteDialog`.

**2. Node replacement strategy: reuse the same node ID.**
This is the key insight. React Flow edges reference nodes by `source` and `target` IDs. If we replace the text node with a file node **using the same `id`**, all edges automatically remain valid with zero edge-update logic. The replacement becomes a single `setNodes` call that maps the old text node to a new file node, preserving `id`, `position`, and `style`. No edge manipulation needed at all.

**3. Slugify strategy.**
Use a simple inline utility: lowercase, replace non-alphanumeric chars with hyphens, collapse consecutive hyphens, trim leading/trailing hyphens. No external library needed.

**4. Empty text / empty first line handling.**
If the card text is empty or whitespace-only, disable the convert button (or show it grayed out with a tooltip "Card has no text"). If the first line is empty, use the first non-empty line as the title. If all lines are empty, this case is blocked by the disabled button.

### Step-by-Step Implementation

#### Step 1: Add UI state for the conversion dialog

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`**

Add new state fields to the store interface and initial state:

```typescript
// New state fields
convertToNoteDialogOpen: boolean;          // false
convertToNoteNodeId: string | null;        // null
convertToNoteTitle: string | null;         // null  
convertToNoteBody: string | null;          // null
convertToNoteCardKind: string | null;      // null
convertToNoteCanvasFolder: string | null;  // null
convertToNoteCallback: ((createdPath: string) => void) | null; // null

// New actions
openConvertToNoteDialog: (opts: {
  nodeId: string;
  title: string;
  body: string;
  cardKind?: string;
  canvasFolder: string;
  onCreated: (createdPath: string) => void;
}) => void;
closeConvertToNoteDialog: () => void;
```

The `openConvertToNoteDialog` action sets all fields at once. The `closeConvertToNoteDialog` resets them all to null/false.

#### Step 2: Create the slugify utility

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/slugify.ts`** (new file)

```typescript
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "untitled";
}
```

#### Step 3: Create the text extraction utility

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/extractTitleBody.ts`** (new file)

```typescript
export function extractTitleAndBody(text: string): { title: string; body: string } {
  const lines = text.split("\n");
  // Find first non-empty line for title
  let titleIdx = lines.findIndex(l => l.trim().length > 0);
  if (titleIdx === -1) return { title: "Untitled", body: "" };
  const title = lines[titleIdx].trim();
  // Everything after the title line becomes body
  const body = lines.slice(titleIdx + 1).join("\n").trim();
  return { title, body };
}
```

#### Step 4: Create the card-kind-to-note-type mapping

This can live as a constant in the new dialog or in a small utility. The mapping:

```typescript
const CARD_KIND_TO_NOTE_TYPE: Record<string, string> = {
  summary: "concept",
  question: "question",
  transition: "concept",
};

function noteTypeFromCardKind(cardKind?: string): string {
  if (!cardKind) return "concept";
  return CARD_KIND_TO_NOTE_TYPE[cardKind] ?? "concept";
}
```

#### Step 5: Create the ConvertToNoteDialog component

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ConvertToNoteDialog.tsx`** (new file)

This dialog is structurally similar to `CreateNoteDialog` but simpler. It renders:

1. **Title field** -- pre-filled with extracted title, editable
2. **Type dropdown** -- pre-filled from card kind mapping, uses `workspaceStore.noteTypes` for options (same as `CreateNoteDialog`)
3. **Path field** -- pre-filled with `{canvasFolder}/{slugified-title}.md`, user can edit the folder portion. The filename auto-derives from the title (not directly editable). Include a "Browse" button reusing the same `pickFolder` pattern from `CreateNoteDialog`.
4. **Body preview** -- read-only display of the extracted body (collapsed by default, expandable), so the user knows what content will go into the note

On submit:
- Call `api.createNote({ path, title, note_type, body })` 
- On success, invoke the `convertToNoteCallback` from uiStore with the created path
- Close the dialog
- Handle errors inline (same pattern as `CreateNoteDialog`)

The dialog auto-updates the path's filename portion whenever the title changes (re-slugifying), similar to how `CreateNoteDialog` auto-populates title from path but in the reverse direction.

Style the dialog using the same inline CSS pattern as `CreateNoteDialog` (the codebase uses inline styles for dialogs, not CSS modules).

#### Step 6: Add the "Convert to Note" button to the text node toolbar

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx`**

Modify `CanvasNodeToolbar` to accept an optional `onConvertToNote` callback prop. This callback is only passed when the toolbar is rendered from `CanvasTextNodeInner` (not from file/link/group nodes).

In `CanvasTextNodeInner` (line ~658), pass the callback:

```typescript
<CanvasNodeToolbar 
  id={id} 
  selected={selected} 
  shape={d.shape ?? "rectangle"}
  // ... existing props ...
  onConvertToNote={text.trim() ? () => handleConvertToNote() : undefined}
/>
```

The button uses the `FileText` icon (already imported from lucide-react on line 8) and appears in the toolbar only when `onConvertToNote` is defined.

The `handleConvertToNote` function in `CanvasTextNodeInner`:
- Extracts title and body from `text` using the utility
- Gets the canvas folder from the canvas `path` prop (available via a new context or by deriving from the canvas file path)
- Opens the convert dialog via `useUIStore.getState().openConvertToNoteDialog(...)` with a callback that will handle the node replacement

#### Step 7: Wire up the node replacement in CanvasEditor

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx`**

The conversion callback (passed to the dialog via uiStore) needs access to `setNodes` and `scheduleSave` from the canvas editor. The cleanest approach: define a `convertTextToFileNode` function inside `CanvasEditorInner` that:

1. Captures `pushSnapshot()` for undo support
2. Calls `setNodes` to replace the text node with a file node **in a single update**:

```typescript
const convertTextToFileNode = useCallback((nodeId: string, filePath: string) => {
  pushSnapshot();
  setNodes((nds) => nds.map((n) => {
    if (n.id !== nodeId) return n;
    // Replace: keep id, position, style (width/height), parentId
    // Change type and data
    return {
      ...n,
      type: "canvasFile",
      data: { file: filePath },
      // Preserve color/bgColor if set
      ...(n.data.color ? {} : {}), // color is in data, and canvasFile also supports it
    };
  }));
  scheduleSave();
}, [setNodes, scheduleSave, pushSnapshot]);
```

This function is what the dialog's `onCreated` callback calls. It needs to be passed down to the text node component. The best delivery mechanism: a new React context (like `CanvasSaveContext` and `CanvasSnapshotContext`), or more simply, store the conversion callback in uiStore when opening the dialog (which is already the plan from Step 1).

Specifically, when the toolbar button is clicked in `CanvasTextNodeInner`, it calls:

```typescript
useUIStore.getState().openConvertToNoteDialog({
  nodeId: id,
  title: extractedTitle,
  body: extractedBody,
  cardKind: d.cardKind,
  canvasFolder: canvasFolder,
  onCreated: (createdPath) => {
    // This closure has access to setNodes/scheduleSave via the component scope
    // But wait -- CanvasTextNodeInner doesn't have pushSnapshot
  },
});
```

Problem: `CanvasTextNodeInner` does not have access to `pushSnapshot`. But it does have access to `useCanvasSnapshot()` (imported from CanvasEditor and used as a context). So the solution is:

```typescript
const pushSnapshot = useCanvasSnapshot();
const scheduleSave = useCanvasSave();
const { setNodes } = useReactFlow();
```

All three are already available in the `CanvasNodeToolbar` or can be used in `CanvasTextNodeInner`. So the `onCreated` callback can be defined right there in the text node component, closing over `setNodes`, `pushSnapshot`, and `scheduleSave`:

```typescript
const handleConvertToNote = () => {
  const { title, body } = extractTitleAndBody(text);
  const canvasFolder = canvasPath.includes("/") 
    ? canvasPath.slice(0, canvasPath.lastIndexOf("/")) 
    : "";
  
  useUIStore.setState({
    convertToNoteDialogOpen: true,
    convertToNoteNodeId: id,
    convertToNoteTitle: title,
    convertToNoteBody: body,
    convertToNoteCardKind: d.cardKind ?? null,
    convertToNoteCanvasFolder: canvasFolder,
    convertToNoteCallback: (createdPath: string) => {
      pushSnapshot();
      setNodes((nds) => nds.map((n) => {
        if (n.id !== id) return n;
        const oldData = n.data as Record<string, unknown>;
        return {
          ...n,
          type: "canvasFile",
          data: {
            file: createdPath,
            ...(oldData.color ? { color: oldData.color } : {}),
            ...(oldData.bgColor ? { bgColor: oldData.bgColor } : {}),
          },
        };
      }));
      scheduleSave();
    },
  });
};
```

The remaining question is how `CanvasTextNodeInner` gets the canvas file path. It needs this to derive the canvas folder. The canvas path is available in `CanvasEditorInner` as a prop. The cleanest way is to create a new context:

```typescript
export const CanvasPathContext = createContext<string>("");
export function useCanvasPath() { return useContext(CanvasPathContext); }
```

Provided in `CanvasEditorInner`:

```typescript
<CanvasPathContext.Provider value={path}>
  ...
</CanvasPathContext.Provider>
```

Used in `CanvasTextNodeInner`:

```typescript
const canvasPath = useCanvasPath();
```

#### Step 8: Render the ConvertToNoteDialog

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx`** (or wherever `CreateNoteDialog` is rendered)

Add the `ConvertToNoteDialog` alongside the existing `CreateNoteDialog`, gated on `convertToNoteDialogOpen`:

```typescript
{convertToNoteDialogOpen && <ConvertToNoteDialog />}
```

Let me verify where `CreateNoteDialog` is rendered.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"CreateNoteDialog","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"<CreateNoteDialog|createNoteDialogOpen","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","output_mode":"content"}`

---

## Assistant

Good. The `ConvertToNoteDialog` will be rendered in `App.tsx` alongside `CreateNoteDialog`.

### Summary of Changes by File

| File | Change |
|------|--------|
| `crates/app/src/stores/uiStore.ts` | Add 7 new state fields + 2 actions for the convert dialog |
| `crates/app/src/utils/slugify.ts` | **New file.** Simple kebab-case slugify function |
| `crates/app/src/utils/extractTitleBody.ts` | **New file.** Extract title (first non-empty line) and body (rest) from text |
| `crates/app/src/components/Editor/ConvertToNoteDialog.tsx` | **New file.** Minimal confirmation dialog with title, type, and path fields |
| `crates/app/src/components/Editor/canvasNodes.tsx` | Add "Convert to Note" button to `CanvasNodeToolbar` (only for text nodes). Add `handleConvertToNote` in `CanvasTextNodeInner` that extracts content and opens dialog with replacement callback. Import `useCanvasPath` context. |
| `crates/app/src/components/Editor/CanvasEditor.tsx` | Add `CanvasPathContext` and provide it in the JSX tree. Export `useCanvasPath`. |
| `crates/app/src/App.tsx` | Import and conditionally render `ConvertToNoteDialog` |

### Edge Cases and Error Handling

- **Empty card text**: The convert button is hidden or disabled when `text.trim()` is empty
- **Note creation failure**: The dialog shows an inline error (same pattern as `CreateNoteDialog`), the text node is NOT replaced
- **Duplicate filename**: The Rust backend's `create_node` command already returns an error for existing paths; the dialog surfaces this
- **Undo**: `pushSnapshot()` is called before `setNodes`, so Ctrl+Z reverts the node replacement (but does NOT delete the created note file -- that is correct behavior, as undo in the canvas should only affect canvas state)
- **Card with only a title (no body)**: Works fine, creates a note with empty body
- **Canvas auto-save**: `scheduleSave()` is called after node replacement, ensuring the `.canvas` file is updated

### Sequencing

1. First: create utility files (`slugify.ts`, `extractTitleBody.ts`) -- no dependencies
2. Second: add uiStore state fields -- no dependencies on other changes  
3. Third: create `ConvertToNoteDialog.tsx` -- depends on uiStore fields and utilities
4. Fourth: modify `CanvasEditor.tsx` to add `CanvasPathContext` -- small, independent
5. Fifth: modify `canvasNodes.tsx` to add toolbar button and handler -- depends on context and utilities
6. Sixth: wire up `App.tsx` -- depends on dialog component

### Critical Files for Implementation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ConvertToNoteDialog.tsx` (new)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx`

---

