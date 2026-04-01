# Editor Code Architecture Audit

> Date: 2026-03-24
> Scope: Component decomposition, state management, AI-agent DX, performance, backend quality, test coverage

## Component Size and Decomposition

### Giant Components (Blocking AI Productivity)

| Component | LOC | Problem |
|---|---|---|
| **CanvasEditor.tsx** | ~1,886 | Manages ReactFlow init, save/auto-save, error boundaries, context, keyboard shortcuts, toolbar UI, undo/redo, file tree panel, Mermaid rendering |
| **canvasNodes.tsx** | ~1,066 | All 4 node types + edges + ColorPickerDropdown + FontFamilyDropdown + CardKindDropdown in one file |
| **CreateNoteDialog.tsx** | ~533 | Three file creation modes (note/canvas/excalidraw), save-as-untitled, create-and-link, validation — all in one component |
| **EditorPanel.tsx** | ~448 | Massive if/else routing based on tab kind; 8 editor variants |

An AI agent cannot efficiently reason about 1,886 LOC in a single file. These are the primary refactoring targets.

### Well-Sized Components (Good Patterns)

- PdfViewer, ImageViewer, VideoViewer, ExcalidrawEditor — each ~200 LOC, focused, clear responsibilities

### Recommended Decomposition

**CanvasEditor.tsx → 5 modules:**
- `CanvasCore.tsx` — ReactFlow container + viewport management
- `CanvasToolbar.tsx` — Top toolbar (controls, zoom, mode buttons)
- `CanvasFloatingPanel.tsx` — Right-side file tree panel
- `CanvasSaveContext.tsx` — Save scheduling context provider
- `useCanvasAutoSave.ts` — Auto-save hook (debounce, conflict detection)

**canvasNodes.tsx → separate files:**
- `canvas-nodes/CanvasFileNode.tsx`
- `canvas-nodes/CanvasTextNode.tsx`
- `canvas-nodes/CanvasLinkNode.tsx`
- `canvas-nodes/CanvasGroupNode.tsx`
- `canvas-nodes/CanvasEdge.tsx`
- `canvas-nodes/shared.ts` — ColorPickerDropdown, FontFamilyDropdown, etc.
- `canvas-nodes/index.ts` — re-exports + NODE_TYPES constant

---

## State Management Assessment

### Dual-State Pattern is Brittle

- **editorStore** maintains `activeNote`, `activePlainFile`, `editedBody`, `editedFrontmatter`, `isDirty`, `viewMode`, scroll/cursor state
- **tabStore** maintains parallel state per tab: `editedBody`, `editedFrontmatter`, `isDirty`, `conflictState`, `viewMode`, scroll/cursor
- **Snapshot/Restore** on tab switch syncs between them
- **segmentStateCache** adds a 3rd snapshot layer for multi-segment

**Problem**: If a field is updated in one store but not the other, they desync. If the browser crashes during editing without switching tabs, the tab snapshot is stale.

### No Selector Memoization

EditorPanel pulls ~38 separate values from stores without selector memoization. Every store update causes EditorPanel to re-subscribe and re-render, even if the specific fields it uses didn't change.

**Recommendation**: Use Zustand's `useShallow` or custom selector hooks to prevent unnecessary re-renders. High-frequency updates (cursor position, scroll) thrash the entire EditorPanel tree.

### Frontmatter Undo/Redo Complexity

- `fmUndoStack`/`fmRedoStack` in both editorStore and tabStore (12 fields across both stores for undo/redo alone)
- FM undo is grouped by time (`FM_GROUP_MS = 300ms`)
- Switching tabs clears undo state for previous tab
- Tab close loses all undo history

### Missing Selector Hooks

No custom hooks like `useActiveNotePath()`, `useIsDirty()`, `useViewMode()`. Components directly access store fields, making it easy to pull more state than needed.

### Derived State Anti-Pattern

EditorPanel computes `displayTitle`, `displayType`, etc. on every render. Should be selectors or computed values in the store.

---

## AI-Agent Developer Experience

### Tab Kind Dispatch Duplicated 4+ Times

Tab kinds hardcoded as `"note" | "plain-file" | "untitled" | "pdf" | "excalidraw" | "canvas" | "image" | "video"` and dispatched via if/else chains in:

1. `TabBar.tsx` (~line 123)
2. `tabActions.ts` (~line 16)
3. `EditorPanel.tsx` (~lines 74-112)
4. Various other locations

**Any new tab kind requires editing 4+ files.**

**Recommendation — TabKindRegistry:**

```typescript
const TAB_KIND_REGISTRY = {
  note:      { editor: MarkdownPanel, icon: FileText, canBeDirty: true, isCustom: false },
  canvas:    { editor: CanvasEditor,  icon: Grid,     canBeDirty: true, isCustom: true  },
  pdf:       { editor: PdfViewer,     icon: FileText, canBeDirty: false, isCustom: true  },
  // ...
} as const;
```

Replace all if/else chains with registry lookups. Single place to add a new type.

### No Type Safety for Tab Dispatch

The tab kind routing is manual if/else without exhaustiveness checking. A new tab kind added to the union will silently fall through without a TypeScript error.

**Fix**: Use discriminated union or exhaustiveness checking:
```typescript
const _: never = tab.kind; // compiler error if unhandled
```

### Inconsistent Naming

- `clearForCustomTab()` — vague; better: `clearMarkdownEditorState()`
- `isUntitledTab()` vs `isUntitled` — sometimes function, sometimes boolean
- `closeTabAndNavigateNext()` doesn't indicate side-effectful store updates

### Unclear Data Flow in Canvas

CanvasEditor creates context (`CanvasPanelModeContext`, `CanvasSaveContext`) to pass `scheduleSave` to child nodes. Save scheduling uses a debounced ref (`SAVE_DEBOUNCE_MS = 1500`). This pattern isn't documented in code, making it hard for an AI to add a new node type that respects debouncing.

---

## Performance Concerns

### No React.memo Usage on Canvas Nodes

Only ~5 instances of `memo()` in all Editor components. Canvas node components receiving long lists (50+ nodes) are not memoized, causing re-renders on every parent update. `CanvasFileNode` (renders nested file tree inside a draggable node) re-renders when ANY canvas state changes.

### Unnecessary Store Subscriptions

EditorPanel directly accesses ~38 store fields. No fine-grained selectors; Zustand re-renders on any change to any field. User types in CodeMirror → onChange → updateContent() → editorStore update → all 38 subscriptions fire → full re-render chain.

### Auto-Save Debouncing Inconsistency

- Canvas: `SAVE_DEBOUNCE_MS = 1500` (hardcoded, only in CanvasEditor)
- Plain files: `writePlainFile()` without debouncing — every keystroke could trigger a write
- No single source of truth for debounced auto-save

### CodeMirror Integration Overhead

MarkdownEditor creates a full EditorView on mount with ~15 custom extensions + CM6 builtins. On every tab switch, a new EditorView is created and old one discarded. No EditorView pooling or reuse → slow tab switching with large files.

### Canvas Rendering

ReactFlow renders all nodes + edges even if viewport doesn't show them. MiniMap renders all nodes again. No virtualization or culling. Large canvases (100+ nodes) will struggle.

### Implicit Re-render Chain

Canvas edit → save → backend emits topology-changed → App.tsx applyEvent() → graphStore re-renders → CanvasEditor re-renders → all node components re-render. Not throttled; rapid editing can cause event system races.

---

## Backend Code Quality

### commands.rs (~896 LOC) and handlers.rs (~716 LOC)

**Issues:**
1. **Code duplication** — Similar workspace access patterns repeated across commands with slightly different error handling
2. **No module organization** — All commands in a flat list; should organize by domain (notes/, links/, folders/, plain-files/)
3. **Error handling inconsistency** — Some errors use `.map_err(|e: BrainMapError| e.to_string())?`, others use custom formatting. No error code mapping for frontend routing
4. **Missing state validation** — No guards to check if active workspace is available before command execution
5. **Buried control flow** — Multi-workspace racing logic in `open_workspace()` hidden in middle of function

---

## Test Coverage Analysis

### Coverage Gaps

| Component | LOC | Tests? |
|---|---|---|
| CanvasEditor.tsx | 1,886 | **None** |
| canvasNodes.tsx | 1,066 | **None** |
| EditorPanel.tsx | 448 | **None** |
| CreateNoteDialog.tsx | 533 | Yes, but limited |
| PdfViewer | ~200 | Minimal |
| ImageViewer | ~200 | Yes |
| VideoViewer | ~200 | Yes |

### Missing Test Categories

- **Integration tests**: Tab open → edit → switch → restore → verify state
- **Canvas interaction tests**: Node add/delete → save → reload → verify persistence
- **Conflict detection tests**: External changes in background tabs
- **Concurrent edit tests**: User edits tab A, background event updates tab A, user switches tabs
- **Unmount cleanup tests**: Do canvas/excalidraw save and clear listeners on unmount?

---

## Recommended Refactoring Priority

### Tier 1 — Blocking AI Productivity

1. **Split CanvasEditor.tsx** into 5 focused modules (~300-400 LOC each)
2. **Split canvasNodes.tsx** into one file per node type + shared utilities
3. **Create TabKindRegistry** — single constant mapping kind → metadata; replace all if/else chains
4. **Implement editor store selectors** — custom hooks with Zustand shallow comparison

### Tier 2 — Code Quality

5. **Extract CreateNoteDialog logic** into mode-specific hooks
6. **Add exhaustiveness checking** for tab kind dispatch
7. **Add integration tests** for tab lifecycle, canvas save, conflict resolution

### Tier 3 — Performance

8. **Memoize canvas node components** with React.memo + custom comparison
9. **Debounce plain file saves** consistently
10. **Consider EditorView pooling** for CodeMirror tab switching

### Tier 4 — Backend

11. **Split commands.rs** by domain into submodules
12. **Standardize error handling** with typed error codes for frontend
