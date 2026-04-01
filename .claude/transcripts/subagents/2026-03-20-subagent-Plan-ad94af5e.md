# 2026-03-20 — Subagent Transcript: Plan

**Date:** 2026-03-20 10:34:43
**Agent:** Plan
**Agent ID:** ad94af5e108710407
**Parent Session:** b1d9eca6-8bb3-4c0b-8673-2c48c1a7ec0b

---

## User

Design a detailed implementation plan for adding Excalidraw support to BrainMap (Phase 1 — frontend only, no graph integration).

## Context

BrainMap is a Tauri v2 + React 18 + TypeScript app. It already has:
- A tab system with kinds: "note" | "plain-file" | "untitled" | "pdf"
- A PDF viewer as precedent for a custom editor (non-CodeMirror) tab
- File tree that shows all workspace files
- Zustand stores for editor state, tab state, UI state
- Dark mode support
- Debounced save pattern

## What We're Building

Standalone `.excalidraw` files that can be created, opened, and edited with the full Excalidraw editor. No graph integration — drawings are plain files in the workspace.

## Key Files to Examine

Read these files to understand the patterns:

1. `crates/app/src/stores/tabStore.ts` — tab kind union, tab state shape
2. `crates/app/src/stores/editorStore.ts` — activeNote/activePlainFile pattern, how state is managed per file type
3. `crates/app/src/components/Editor/EditorPanel.tsx` — dispatch logic that routes to different editors
4. `crates/app/src/components/Editor/PdfViewer.tsx` — precedent for custom non-CodeMirror editor
5. `crates/app/src/components/Layout/FileTreePanel.tsx` — how PDF detection works on click, context menu items
6. `crates/app/src/components/Layout/fileTreeIcons.tsx` — icon mapping
7. `crates/app/src/api/types.ts` — BrainMapAPI interface
8. `crates/app/src/stores/segmentStateCache.ts` — how state is cached per segment
9. `crates/app/src/components/Editor/cmMermaidDecorations.ts` — lazy loading pattern for large libraries

## Requirements

1. Click `.excalidraw` file in tree → opens in Excalidraw editor (not CodeMirror)
2. Full Excalidraw editing experience (drawing, shapes, text, etc.)
3. Dark mode follows app theme
4. Debounced auto-save (no manual Cmd+S needed, but Cmd+S should also work)
5. "New Drawing" option in file tree context menu
6. File tree shows appropriate icon for `.excalidraw` files
7. Tab shows drawing filename
8. Multiple drawings can be open in tabs simultaneously
9. Lazy-load @excalidraw/excalidraw to avoid bundle bloat

## Design the Plan

For each change, specify:
- Exact file path
- What to add/modify
- Key code patterns to follow (from the files you read)

Also cover:
- How to handle the dirty state / unsaved changes indicator
- How tab switching works (preserve Excalidraw state?)
- How segment switching works
- Testing strategy
- CSS isolation approach

---

## Assistant



I'll start by reading all the key files to understand the existing patterns thoroughly.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/PdfViewer.tsx"}`

---

## Assistant

Now let me read the remaining key files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/fileTreeIcons.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStateCache.ts"}`

---

## Assistant

Now let me look at the mermaid lazy loading pattern and understand how the file click routing works in the file tree.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMermaidDecorations.ts","limit":50}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.pdf|isPdf|pdf.*click|openPdf","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"clearForPdfTab|kind.*pdf","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":720,"limit":50}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"New Note|New Subfolder|context.*menu|handleContextMenu","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content"}`

---

## Assistant

Let me also check the debounced save pattern and look at how the context menu differentiates between file types.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"debounce|debouncedSave|auto.?save","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","head_limit":30}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"Cmd\\+S|cmd.*save|keydown.*save","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","-i":true}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":370,"limit":140}`

---

## Assistant

Now let me check the auto-save hook and the App.tsx keyboard shortcut handling for Cmd+S.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/hooks/useAutoSave.ts"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"meta.*[Ss]|cmd.*[Ss]|save.*key|key.*save","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","output_mode":"content","-i":true}`

---

## Assistant

Let me check how the Cmd+S save keyboard shortcut is handled and the App.tsx structure.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","offset":200,"limit":70}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"key === \\\"s\\\"|key.*===.*\\\"s\\\"","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","output_mode":"content","-i":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"Penknife|Pencil|excalidraw","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches","-i":true}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","offset":176,"limit":10}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/stores/tabActions.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","offset":179,"limit":20}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabActions.ts"}`

---

## Assistant

Now let me check the dark mode implementation and CSS patterns.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"theme|dark.*mode|isDark","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","output_mode":"content","head_limit":20}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.css"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"effectiveTheme|effectiveEditorTheme","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","output_mode":"content","head_limit":10}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"effectiveTheme|effectiveEditorTheme","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","head_limit":15}`

---

## Assistant

Now let me check the `navigateToActiveTab` in tabActions.ts to understand how PDF tabs are handled during close/switch, and look at the `createPlainFile` API since we'll need it.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"kind.*===.*\\\"pdf\\\"|pdf.*tab|clearForPdf","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx","offset":90,"limit":30}`

---

## Assistant

Let me also check the TabBar click handler to understand the full tab-switch routing and how different tab kinds are handled.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx","offset":110,"limit":70}`

---

## Assistant

Now I have a thorough understanding of the codebase patterns. Let me check one more thing -- how the `createPlainFile` API works for creating new drawings.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"createPlainFile","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"ThemeName|type Theme","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","output_mode":"content","head_limit":10}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","offset":80,"limit":20}`

---

## Assistant

I now have a comprehensive understanding of the codebase. Let me produce the implementation plan.

---

## Excalidraw Support Implementation Plan (Phase 1 -- Frontend Only)

### Overview

This plan adds standalone `.excalidraw` file support following the exact same pattern used for PDF files: a new tab kind `"excalidraw"`, a self-contained viewer/editor component, file tree routing, and a context menu item for creating new drawings. The Excalidraw library is lazy-loaded to avoid bundle bloat.

### Architecture Decision: Follow the PDF Pattern

The PDF viewer established a clean precedent for non-CodeMirror content:
- **Tab kind**: Add `"excalidraw"` to the `kind` union (same as `"pdf"` was added)
- **EditorPanel routing**: Early return when `activeTab?.kind === "excalidraw"`, rendering `<ExcalidrawEditor>` (same pattern as PdfViewer)
- **Editor store**: Add `clearForExcalidrawTab()` that mirrors `clearForPdfTab()` -- snapshots current state, auto-saves dirty work, then clears the editor
- **Self-contained state**: The Excalidraw component manages its own state internally (drawing elements, app state), not through editorStore. Only `isDirty` is tracked in tabStore for the unsaved-changes dot.

### Step-by-step Implementation

---

#### Step 1: Extend the tab kind union

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts`

- **Line 16**: Change the `kind` type from `"note" | "plain-file" | "untitled" | "pdf"` to `"note" | "plain-file" | "untitled" | "pdf" | "excalidraw"`
- **Line 36**: Update the `openTab` parameter type to match
- No other changes needed in tabStore -- the existing `openTab`, `closeTab`, `updateTabState`, etc. all work generically with the new kind.

---

#### Step 2: Add `clearForExcalidrawTab` to editorStore

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts`

Add a new action `clearForExcalidrawTab` that is identical to `clearForPdfTab` (lines 699-724). This:
1. Calls `snapshotToActiveTab()` to save current tab state
2. Auto-saves if dirty (skipping untitled tabs)
3. Clears editor state (activeNote, activePlainFile, editedBody, etc.)

The implementation is a direct copy of `clearForPdfTab`. Alternatively, rename `clearForPdfTab` to `clearForCustomTab` and use it for both PDF and Excalidraw. The latter is cleaner but changes existing callsites. Recommendation: rename to `clearForCustomTab` and update the 3 existing callsites (PdfViewer path in FileTreePanel, TabBar handleActivate, TabBar handleClose).

Also add it to the `EditorState` interface (around line 50).

---

#### Step 3: Add the Excalidraw icon to fileTreeIcons

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/fileTreeIcons.tsx`

Add to the `FILE_EXT_ICONS` record (around line 57):
```typescript
excalidraw: { icon: Pencil, color: "#6965db" },  // Excalidraw brand purple
```

Import `Pencil` from `lucide-react` (add to the import list at line 1). The `Pencil` icon is a reasonable visual stand-in; `PenTool` is another option.

---

#### Step 4: Route `.excalidraw` clicks in FileTreePanel

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`

In the `handleClick` function (around line 726), add an `.excalidraw` check before the existing `.pdf` check:

```typescript
if (node.fullPath.toLowerCase().endsWith(".excalidraw")) {
  const fileName = node.fullPath.split("/").pop() ?? node.fullPath;
  useTabStore.getState().openTab(node.fullPath, "excalidraw", fileName, null);
  useEditorStore.getState().clearForExcalidrawTab(); // or clearForCustomTab
  return;
}
```

This follows the exact pattern of lines 727-731 for PDF.

---

#### Step 5: Add "New Drawing" to file tree context menu

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`

Add a "New Drawing" menu item in the context menu. This should appear in:
1. **Root context menu** (where `state.node === null`, around line 379): Add "New Drawing at Root"
2. **Folder context menu** (where `state.node.isFolder`, around line 388): Add "New Drawing Here"
3. Optionally in file context menus as well, but following convention (New Note in Folder), add it alongside "New Note Here".

The handler `handleNewDrawingHere` should:
1. Determine the target folder (root or the folder's path)
2. Prompt for a name (can reuse a simple prompt or a variant of the existing inline rename pattern)
3. Call `api.createPlainFile("folder/name.excalidraw", JSON.stringify(EMPTY_EXCALIDRAW))` where `EMPTY_EXCALIDRAW` is a minimal valid Excalidraw JSON document: `{ "type": "excalidraw", "version": 2, "source": "brainmap", "elements": [], "appState": {}, "files": {} }`
4. Open the created file in a new tab

For simplicity in Phase 1, use `window.prompt("Drawing name:")` to get the name. A more polished inline UI can come later.

---

#### Step 6: Create the ExcalidrawEditor component

**File (new)**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ExcalidrawEditor.tsx`

This is the core of the feature. Follow the PdfViewer pattern for structure:

**Props**: `{ path: string }`

**State**:
- `loading: boolean` -- true until file is read and Excalidraw module is loaded
- `error: string | null`
- `isDirty: boolean` -- tracks unsaved changes
- `savingInProgress: boolean`

**Lazy loading** (follow mermaid pattern from `cmMermaidDecorations.ts` lines 29-48):
```typescript
type ExcalidrawModule = typeof import("@excalidraw/excalidraw");
let excalidrawMod: ExcalidrawModule | null = null;
let excalidrawLoading: Promise<ExcalidrawModule> | null = null;

async function ensureExcalidraw(): Promise<ExcalidrawModule> {
  if (excalidrawMod) return excalidrawMod;
  if (!excalidrawLoading) {
    excalidrawLoading = import("@excalidraw/excalidraw").then((mod) => {
      excalidrawMod = mod;
      return mod;
    });
  }
  return excalidrawLoading;
}
```

**Lifecycle**:
1. On mount: read file via `api.readPlainFile(path)`, parse JSON, load Excalidraw module
2. Render `<Excalidraw>` component from the lazy-loaded module
3. Pass `initialData` prop with the parsed elements/appState/files
4. Listen to `onChange` callback from Excalidraw to track dirty state and debounce saves

**Dark mode**: Read `effectiveEditorTheme` from uiStore and pass the `theme` prop:
```typescript
const effectiveTheme = useUIStore((s) => s.effectiveEditorTheme);
const isDark = THEME_BASE[effectiveTheme] === "dark";
// Pass theme="dark" or theme="light" to Excalidraw
```

**Debounced auto-save**:
- On every `onChange` from Excalidraw, mark dirty and reset a debounce timer (1500ms, same as `AUTO_SAVE_DELAY`)
- When timer fires, serialize state to JSON and call `api.writePlainFile(path, json)`
- Set `isDirty` on the tab via `useTabStore.getState().updateTabState(tabId, { isDirty: true })` when changes occur, and `{ isDirty: false }` after save
- On window blur, save immediately (same pattern as `useAutoSave.ts`)

**Cmd+S**: The existing Cmd+S handler in `App.tsx` (line 179) calls `useEditorStore.getState().saveNote()`. For Excalidraw tabs, editorStore has no active content. Two options:
1. **Option A** (recommended): Check if the active tab is `"excalidraw"` in the Cmd+S handler and dispatch a custom event `excalidraw:save` that the component listens to.
2. **Option B**: Add an `excalidrawSaveCallback` ref to a shared location.

Option A is cleanest:
```typescript
// In App.tsx Cmd+S handler:
if (tab?.kind === "excalidraw") {
  window.dispatchEvent(new Event("excalidraw:save"));
  return;
}
```
The ExcalidrawEditor component adds a listener for this event and triggers an immediate save.

**Component structure**:
```tsx
export function ExcalidrawEditor({ path }: { path: string }) {
  // Loading, error states
  // useRef for Excalidraw API
  // useRef for debounce timer
  // Read file, parse JSON, lazy-load module
  // Render <Excalidraw> with onChange, theme, initialData
  // Debounced save on change
  // Immediate save on Cmd+S custom event
  // Save on unmount/tab switch if dirty
}
```

---

#### Step 7: Route Excalidraw tabs in EditorPanel

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx`

Add an early return for excalidraw tabs right after the PDF check (around line 70):

```tsx
if (activeTab?.kind === "excalidraw") {
  return (
    <div className="editor-panel-container">
      <ExcalidrawEditor path={activeTab.path} />
    </div>
  );
}
```

Import `ExcalidrawEditor` from `"./ExcalidrawEditor"`.

---

#### Step 8: Handle Excalidraw in TabBar

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx`

**handleActivate** (around line 123): Add excalidraw case alongside the PDF case:
```typescript
} else if (tab.kind === "excalidraw") {
  useGraphStore.getState().selectNode(null);
  useTabStore.getState().activateTab(path);
  useEditorStore.getState().clearForExcalidrawTab();
}
```

**handleClose** (around line 165): Add excalidraw case. Unlike PDF, Excalidraw tabs can be dirty, so:
```typescript
if (tab && tab.kind === "excalidraw") {
  if (tab.isDirty) {
    // Dispatch save event and wait briefly, or just close (auto-save should have fired)
    window.dispatchEvent(new Event("excalidraw:save"));
  }
  closeTabAndNavigateNext(id);
  return;
}
```

---

#### Step 9: Handle Excalidraw in tabActions.ts

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabActions.ts`

In `navigateToActiveTab` (line 8), the current code handles `"untitled"`, `"note"`, and falls through to `openPlainFile` for other kinds. Add an explicit case for `"excalidraw"`:

```typescript
} else if (nextTab.kind === "excalidraw" || nextTab.kind === "pdf") {
  useGraphStore.getState().selectNode(null);
  useEditorStore.getState().clearForExcalidrawTab();
}
```

This ensures that after closing a tab, if the next tab is Excalidraw, the editor store is properly cleared (the EditorPanel will render based on tab kind).

---

#### Step 10: Handle Cmd+S for Excalidraw tabs

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx`

In the Cmd+S handler (line 179), add a check before the existing logic:
```typescript
if (isMod && e.key === "s") {
  e.preventDefault();
  const tabId = useTabStore.getState().activeTabId;
  const tab = tabId ? useTabStore.getState().getTab(tabId) : null;
  if (tab?.kind === "excalidraw") {
    window.dispatchEvent(new Event("excalidraw:save"));
  } else if (tabId && isUntitledTab(tabId)) {
    // existing untitled handling...
  } else {
    useEditorStore.getState().saveNote();
  }
}
```

---

#### Step 11: CSS isolation for Excalidraw

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

Add scoped styles for the Excalidraw container:
```css
.excalidraw-container {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Excalidraw sets its own font family and sizes. Prevent BrainMap's
   editor font preferences from bleeding in. */
.excalidraw-container .excalidraw {
  font-family: unset;
}
```

The Excalidraw library renders inside a div with class `.excalidraw`, which already namespaces its CSS well. The main risk is BrainMap's global styles (font overrides, scrollbar hiding) leaking in. The wrapper class `.excalidraw-container` provides a boundary.

---

#### Step 12: Update segment state cache

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStateCache.ts`

No changes needed. The segment cache captures `TabState[]` via `structuredClone`, and the `TabState.kind` will simply include `"excalidraw"` as a string value. The `editedBody` field on Excalidraw tabs can store the serialized JSON as a string for snapshot/restore, or it can be `null` (since Excalidraw state is managed in-component).

**Recommendation**: Keep `editedBody: null` for excalidraw tabs in tabStore. The Excalidraw component re-reads the file on mount (same as PdfViewer). This is simpler and avoids storing potentially large drawing JSON in memory twice.

---

#### Step 13: Install @excalidraw/excalidraw

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json`

Add `@excalidraw/excalidraw` as a dependency. This package is around 1.5MB but will be code-split via the dynamic `import()` so it only loads when a user opens an `.excalidraw` file.

---

### Dirty state and unsaved changes

- The ExcalidrawEditor component internally tracks dirty state via a ref (set to `true` on every `onChange` from Excalidraw, set to `false` after save)
- The component syncs this to tabStore via `updateTabState(tabId, { isDirty: true/false })` so the TabBar shows the dirty dot
- The `beforeunload` handler in the app already checks `isDirty` on all tabs, so Excalidraw tabs are covered
- The `hasDirtyUntitledTabs` function in segmentStateCache only checks `kind === "untitled"`, so excalidraw tabs are not affected

### Tab switching and Excalidraw state preservation

- When switching away from an Excalidraw tab, the component unmounts. Before unmount, a cleanup effect should save if dirty.
- When switching back, the component remounts and re-reads the file from disk (which should have the latest saved state). The Excalidraw library's `initialData` prop sets the drawing state.
- This is the same approach as PdfViewer -- simple, no complex state caching. Any unsaved changes are lost on unmount only if the save fails.
- To be safe, the component should save immediately on unmount (not debounced).

### Segment switching

No special handling needed. The segment cache stores tabs as `TabState[]`. When restoring a segment with an excalidraw tab, the tab is restored with `kind: "excalidraw"`. When the user clicks it, the EditorPanel routes to `<ExcalidrawEditor>` which re-reads the file.

### Testing strategy

1. **Unit tests for tab routing**: Test that `kind: "excalidraw"` tabs are handled correctly in `navigateToActiveTab`, `handleActivate`, `handleClose`.
2. **Unit tests for ExcalidrawEditor**: Mock `@excalidraw/excalidraw` and test:
   - Loading state renders correctly
   - Error state renders correctly
   - `onChange` marks dirty and updates tabStore
   - Save writes JSON to disk via `writePlainFile`
   - Cmd+S (via custom event) triggers immediate save
   - Unmount saves if dirty
3. **Integration test for file tree**: Test that clicking an `.excalidraw` file opens an excalidraw tab
4. **Icon test**: Verify `.excalidraw` extension maps to the correct icon/color

Estimated test count: 15-20 new Vitest tests.

### Potential challenges

1. **Excalidraw CSS conflicts**: Excalidraw brings substantial CSS. Test that BrainMap's global reset/normalize styles don't break Excalidraw's UI, and vice versa. The `.excalidraw-container` wrapper provides CSS scoping.

2. **Excalidraw React version compatibility**: Excalidraw may require React 18+ which BrainMap already uses. Verify peer dependency compatibility.

3. **Bundle size**: Even with lazy loading, `@excalidraw/excalidraw` is large. Verify that Vite's code splitting keeps it in a separate chunk. Check with `vite build --report` or similar.

4. **Excalidraw's `onChange` fires frequently**: The debounce timer at 1500ms should prevent excessive disk writes. Consider also diffing the serialized JSON to avoid writing identical content.

5. **Collaborative file watching**: If another tool modifies the `.excalidraw` file while it's open, the file watcher will emit an event. The ExcalidrawEditor should handle external changes (reload if not dirty, show conflict banner if dirty -- same pattern as editorStore's `markExternalChange`).

---

### Critical Files for Implementation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts` - Tab kind union type must be extended with "excalidraw"
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts` - Add clearForExcalidrawTab (or generalize clearForPdfTab)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx` - Route excalidraw tabs to the new component
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx` - File click routing + context menu for "New Drawing"
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/PdfViewer.tsx` - Reference pattern for self-contained non-CodeMirror editor tab

---

