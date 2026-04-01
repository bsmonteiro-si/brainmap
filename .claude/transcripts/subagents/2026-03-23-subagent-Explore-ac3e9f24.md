# 2026-03-23 — Subagent Transcript: Explore

**Date:** 2026-03-23 16:54:19
**Agent:** Explore
**Agent ID:** ac3e9f24c0898ae32
**Parent Session:** ec7fd629-9474-402a-8f32-fc5f367f64bc

---

## User

Read the extension guide for adding a new file-type editor at docs/extension-guides/add-file-type-editor.md. Also read docs/canvas-architecture.md briefly to understand the pattern. Additionally, check if there's any existing image-related code or components in the codebase.

Search for:
- docs/extension-guides/add-file-type-editor.md (read fully)
- Any existing image viewer/renderer components
- How PDF files are handled (as another binary file type) - look for PdfEditor or similar
- The tab store or workspace store to understand tab kind definitions

Thoroughness: medium

---

## Assistant

I'll search for the extension guide, image-related components, and how file types are currently handled.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides/add-file-type-editor.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/canvas-architecture.md"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/*[Ii]mage*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/*[Pp]df*"}`

---

## Assistant

Now let me search for image-related components and how the tab store is structured:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/PdfViewer.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/stores/tabStore.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"kind.*\\|.*pdf.*\\|.*excalidraw.*\\|.*canvas","path":"crates/app/src/stores","type":"ts","output_mode":"content","head_limit":50}`

---

## Assistant

Now let me read the tabStore to understand its structure better:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":150}`

---

## Assistant

Let me search for where the file extensions are detected and handled in FileTreePanel:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":300,"offset":400}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.pdf|\\.excalidraw|\\.canvas|toLowerCase","path":"crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content","head_limit":40}`

---

## Assistant

Perfect! Now let me get the full FileItem click handler to see how the file types are routed:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":150,"offset":750}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"handleClick|pdf|excalidraw|canvas|clearForCustomTab","path":"crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content","head_limit":80}`

---

## Assistant

Perfect! Now let me check the file tree icons to see how they're registered:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/fileTreeIcons.tsx"}`

---

## Assistant

Excellent! Now I have all the information I need. Let me compile a comprehensive report of what I found.

## Findings Summary

I've completed a thorough exploration of the BrainMap codebase regarding file-type editor support. Here's what I found:

### Extension Guide Documentation

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides/add-file-type-editor.md`

This is a comprehensive 14-step guide for adding new dedicated file-type editors. It documents:
- Installation of rendering libraries
- Extension of the `TabState.kind` union type
- File tree icon registration
- File click routing in FileTreePanel
- Context menu creation
- Editor component architecture (with error boundaries, dirty tracking, auto-save)
- Tab routing in EditorPanel
- Tab activation/closing in TabBar
- Keyboard shortcut handling
- CSS styling
- Optional theming
- Test coverage requirements
- Documentation updates

### Reference Implementations

Two production-quality examples are provided:

1. **PdfViewer** (`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/PdfViewer.tsx`, ~900 lines)
   - Read-only viewer with pdfjs-dist library
   - Features: zoom, page navigation, text layer, highlighting system, undo/redo, "copy to note" functionality
   - Does NOT implement Cmd+S save (read-only)

2. **ExcalidrawEditor** (referenced, full read/write editor with auto-save per guide)

3. **CanvasEditor** (referenced, built on @xyflow/react with full state management)

### Current File-Type Support

The extension guide's reference table shows:
| Extension | Tab Kind | Editor Component | Editable |
|-----------|----------|-----------------|----------|
| `.md` (YAML) | `"note"` | MarkdownEditor + FrontmatterForm | Yes |
| `.md` (plain) | `"plain-file"` | MarkdownEditor | Yes |
| `.pdf` | `"pdf"` | PdfViewer | No (highlights only) |
| `.excalidraw` | `"excalidraw"` | ExcalidrawEditor | Yes |
| `.canvas` | `"canvas"` | CanvasEditor | Yes |

### Implementation Pattern

The pattern for file-type editors is well-established across the codebase:

**Tab Kind Union** (`crates/app/src/stores/tabStore.ts`, line 16):
```typescript
kind: "note" | "plain-file" | "untitled" | "pdf" | "excalidraw" | "canvas";
```

**File Click Handler** (`crates/app/src/components/Layout/FileTreePanel.tsx`, lines 789-812):
- Extension detection via `.toLowerCase().endsWith()`
- Call `openTab(path, kind, fileName, null)`
- Call `clearForCustomTab()` to prepare editor state
- Returns early (no fallthrough to note/plainFile handlers)

**File Tree Icons** (`crates/app/src/components/Layout/fileTreeIcons.tsx`, lines 59-124):
```typescript
const FILE_EXT_ICONS: Record<string, ExtIcon> = {
  pdf: { icon: FileText, color: "#e74c3c" },
  excalidraw: { icon: Pencil, color: "#6965db" },
  canvas: { icon: LayoutDashboard, color: "#10b981" },
  // ... many other extensions already registered
};
```

The icons system already supports many file types:
- Images: png, jpg, jpeg, gif, svg, webp, ico, bmp (all use `Image` icon from lucide-react)
- Video: mp4, webm, mov, avi (all use `Film` icon)
- Audio: mp3, wav, ogg, flac, aac (all use `Music` icon)

### Key Architectural Points

1. **File-Type Detection**: Always check extensions before markdown/plainFile handlers in `FileTreePanel.tsx` `handleClick` function (order matters for proper routing)

2. **Custom Tab Cleanup**: Must call `useEditorStore.getState().clearForCustomTab()` BEFORE `openTab()` to preserve editorStore state when switching from formatted to custom editors

3. **Dirty Tracking**: Custom editors must sync `isDirty` to `tabStore` for the dirty dot indicator since they don't use `editorStore`

4. **Error Boundaries**: Required for all third-party rendering libraries to prevent app-wide crashes

5. **TabBar Integration** (`TabBar.tsx`): Custom editors need special handling in three places:
   - `handleActivate`: Clears graph selection and calls `clearForCustomTab()`
   - `handleClose`: Simpler path (no editor state to restore)
   - Dirty indicator expression: Must exclude custom tab kinds so it reads `tab.isDirty` instead of `editorStore.isDirty`

6. **Canvas Architecture**: Extensively documented at `/Users/bsmonteiro/Desktop/Personal/brainmap/docs/canvas-architecture.md` — a separate reference for this specific editor type covering component hierarchy, data flow, state management, undo/redo, viewport persistence, and 25+ UI store settings

### Image Support Readiness

The codebase already has infrastructure for image files:
- Icons registered for: png, jpg, jpeg, gif, svg, webp, ico, bmp (line 87-94 of fileTreeIcons.tsx)
- Lucide-react `Image` icon available and color defined (#9b59b6)

An image viewer would follow the exact same pattern as PdfViewer and plug into the established extension mechanism.

### Checklist Reminder

The guide provides a 14-item checklist that covers all integration points systematically:
1. Library installation
2. Tab kind extension
3. File tree icon (already partially done for images!)
4. FileTreePanel routing
5. Context menu (optional "New Image" handler)
6. Editor component
7. EditorPanel routing
8. TabBar handling (3 locations)
9. Tab navigation in tabActions.ts
10. Keyboard shortcuts in App.tsx
11. CSS styling
12. Optional theme settings
13. Test coverage
14. Documentation updates

All of these are required but the guide makes it clear and systematic. The PDF and Canvas examples show these patterns working well in production.

---

