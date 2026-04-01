# 2026-03-24 — Subagent Transcript: Explore

**Date:** 2026-03-24 17:14:54
**Agent:** Explore
**Agent ID:** aeb7544da10af9b9b
**Parent Session:** 3bef3af3-acbd-4250-8a6c-b5f3b75eea91

---

## User

I need to understand how file-type editors work in this Tauri+React app. Find:

1. How PDF files are handled - find the PDF editor/viewer component
2. How image files are handled - find the image viewer component  
3. The tab kind system - how different file types get routed to different editors
4. The `clearForCustomTab()` pattern
5. How file extensions are mapped to tab kinds

Look in `crates/app/src/` for React components. Be thorough - I need file paths and key patterns.

---

## Assistant

I'll help you understand the file-type editor system in this Tauri+React app. Let me search for the relevant components and patterns.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.ts"}`

---

## Assistant

Now let me search for tab kind definitions and how file extensions map to editors:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"type.*TabKind|TabKind.*=|\"pdf\"|\"excalidraw\"|\"canvas\"|\"plain-file\"","path":"crates/app/src","type":"ts"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"clearForCustomTab","path":"crates/app/src","type":"ts"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"getTabKind|fileExtension|\\.pdf|\\.excalidraw|\\.canvas|\\.png|\\.jpg|\\.jpeg|\\.webp|\\.svg","path":"crates/app/src","type":"ts"}`

---

## Assistant

Let me read the key files to understand the tab kind system and routing:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabActions.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

Now let me search for how file types are mapped and the clearForCustomTab function:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","limit":150}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"clearForCustomTab","path":"crates/app/src/stores","type":"ts","output_mode":"content","context":10}`

---

## Assistant

Let me continue reading the clearForCustomTab implementation:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","offset":699,"limit":30}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/PdfViewer.tsx"}`

---

## Assistant

Now let me find the ImageViewer and check how file extensions map to tab kinds:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ImageViewer.tsx"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"getTabKind|\\.pdf|\\.excalidraw|\\.canvas|image\\|jpg|png|webp|gif","path":"crates/app/src","type":"tsx","context":5}`

---

## Assistant

Let me search for where file extensions are mapped to tab kinds:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"getTabKind|detectTabKind|extension|\\.pdf\\b|\\.excalidraw\\b|\\.canvas\\b","path":"crates/app/src","type":"tsx","output_mode":"content","context":3}`

---

## Assistant

Let me search in FileTreePanel where files are opened:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":200}`

---

## Assistant

Let me search for where files are actually opened (looking for file double-click or click handler):

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"openNote|openPlainFile|openTab|onClick.*path","path":"crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content","context":10}`

---

## Assistant

Perfect! Now let me check the ExcalidrawEditor and CanvasEditor to complete the picture:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ExcalidrawEditor.tsx","limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":80}`

---

## Assistant

Now let me check the TabBar to see how tabs are rendered:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx","limit":100}`

---

## Assistant

Let me continue reading the TabBar to see how tabs are rendered with icons:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx","offset":100,"limit":150}`

---

## Assistant

Perfect! Now I have all the information I need. Let me compile the comprehensive report for the user:

## File-Type Editor System in BrainMap

Based on my thorough exploration of the codebase, here's how the Tauri+React app handles different file types with custom editors:

### 1. **Tab Kind System** (`tabStore.ts`)

The core type definition at **/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts** (line 16):

```typescript
kind: "note" | "plain-file" | "untitled" | "pdf" | "excalidraw" | "canvas" | "image";
```

Each tab has a `kind` that determines how it's rendered and managed. The `TabState` interface (lines 13-29) stores all tab metadata including editor state.

### 2. **File Extension to Tab Kind Mapping**

The mapping happens in **FileTreePanel.tsx** (lines 788-821), specifically in the `handleClick` function. Here's the pattern:

**IMAGE_EXTS** (line 789) — constant kept in sync with Rust backend:
```typescript
const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".ico", ".bmp"];
```

**Extension detection logic** (lines 791-821):
- **Images**: Check `IMAGE_EXTS` array → open as `"image"` kind
- **PDFs**: `.pdf` → open as `"pdf"` kind
- **Excalidraw**: `.excalidraw` → open as `"excalidraw"` kind
- **Canvas**: `.canvas` → special handling (opens in panel via `openCanvasInPanel`)
- **Notes**: Markdown files (`isBrainMapNote`) → open as `"note"` kind
- **Plain files**: Everything else → open as `"plain-file"` kind

### 3. **The `clearForCustomTab()` Pattern**

Located in **/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts** (lines 699-724):

```typescript
clearForCustomTab: async () => {
  // 1. Snapshot current tab state
  snapshotToActiveTab();
  
  // 2. Auto-save if dirty (skip for untitled tabs)
  // 3. Clear editor state — custom viewer manages its own state
  set({
    activeNote: null,
    activePlainFile: null,
    isUntitledTab: false,
    isLoading: false,
    editedBody: null,
    editedFrontmatter: null,
    isDirty: false,
    conflictState: "none",
    rawContent: null,
    _rawDirty: false,
  });
}
```

**Key insight**: This method clears `editorStore` state because PDF, Excalidraw, Canvas, and Image viewers manage their own internal state independently. It's called when switching to custom tab kinds (lines 16, 126 in tabActions.ts, line 802 in FileTreePanel.tsx).

### 4. **Tab Routing and Rendering**

**In EditorPanel.tsx** (lines 73-103) — conditional rendering based on `activeTab?.kind`:

```typescript
if (activeTab?.kind === "pdf") {
  return <PdfViewer path={activeTab.path} />;
}
if (activeTab?.kind === "excalidraw") {
  return <ExcalidrawEditor path={activeTab.path} />;
}
if (activeTab?.kind === "canvas") {
  return <CanvasEditor path={activeTab.path} />;
}
if (activeTab?.kind === "image") {
  return <ImageViewer path={activeTab.path} />;
}
// ... else markdown editor for notes/plain-files
```

### 5. **Custom Editor Components**

| Kind | Component | Path | Key Features |
|------|-----------|------|--------------|
| **pdf** | `PdfViewer` | `/components/Editor/PdfViewer.tsx` | Lazy-loaded pdf.js, highlighting, zoom, text selection, copy-to-note |
| **image** | `ImageViewer` | `/components/Editor/ImageViewer.tsx` | Zoom, pan, dimensions display, size info |
| **excalidraw** | `ExcalidrawEditor` | `/components/Editor/ExcalidrawEditor.tsx` | Lazy-loaded @excalidraw/excalidraw, error boundary, auto-save on unmount |
| **canvas** | `CanvasEditor` | `/components/Editor/CanvasEditor.tsx` | @xyflow/react-based canvas with JSON Canvas spec support |

### 6. **Tab Activation Flow**

When a custom tab is clicked (TabBar.tsx, lines 116-134):

```typescript
if (tab.kind === "pdf" || tab.kind === "excalidraw" || tab.kind === "canvas" || tab.kind === "image") {
  useGraphStore.getState().selectNode(null);
  useTabStore.getState().activateTab(path);
  useEditorStore.getState().clearForCustomTab();  // <-- Key step
}
```

The same pattern appears in `tabActions.ts` `navigateToActiveTab()` (lines 16-18).

### 7. **Tab Bar Display**

In **TabBar.tsx** (lines 235-249), tabs render with:
- File icon via `NoteTypeIcon` (uses filename extension)
- Title with extension stripped for custom types (line 248)
- Extension badges (line 249): `.canvas` badge shows for canvas tabs
- CSS classes: `tab-item--pdf`, `tab-item--excalidraw`, `tab-item--canvas` for styling

### 8. **Document Summary**

The extension guide at `docs/extension-guides/add-file-type-editor.md` documents the pattern established by:
1. PDF → Excalidraw → Canvas sequence
2. Pattern: new tab kind + dedicated component + `clearForCustomTab()` + error boundary
3. Tab kinds available: `"note"`, `"plain-file"`, `"untitled"`, `"pdf"`, `"excalidraw"`, `"canvas"`, `"image"`

### File Paths Summary

**Core routing logic**:
- `/crates/app/src/stores/tabStore.ts` — TabState definition
- `/crates/app/src/stores/editorStore.ts` — clearForCustomTab() implementation
- `/crates/app/src/stores/tabActions.ts` — Tab navigation logic
- `/crates/app/src/components/Layout/FileTreePanel.tsx` — Extension-to-kind mapping (lines 788-821)
- `/crates/app/src/components/Editor/EditorPanel.tsx` — Conditional tab rendering (lines 73-103)
- `/crates/app/src/components/Editor/TabBar.tsx` — Tab display and activation

**Editor components**:
- `/crates/app/src/components/Editor/PdfViewer.tsx` — PDF viewer
- `/crates/app/src/components/Editor/ImageViewer.tsx` — Image viewer
- `/crates/app/src/components/Editor/ExcalidrawEditor.tsx` — Drawing editor
- `/crates/app/src/components/Editor/CanvasEditor.tsx` — Canvas editor

---

