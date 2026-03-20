# Excalidraw Integration Research

## Overview

Research into adding Excalidraw support to BrainMap as dedicated drawing files (`.excalidraw`), similar to Obsidian's Excalidraw plugin.

---

## 1. Excalidraw Embedding Options

### @excalidraw/excalidraw NPM Package

- **React component** with declarative props + imperative API via callback ref
- Peer deps: React, ReactDOM (already in BrainMap)
- CSS import required: `@excalidraw/excalidraw/index.css`
- Container must have non-zero width/height

```typescript
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

<Excalidraw
  excalidrawAPI={(api) => { /* imperative methods */ }}
  onChange={(elements, appState, files) => { /* auto-save */ }}
  initialData={{ elements, appState, files }}
  theme={isDark ? "dark" : "light"}
/>
```

**Key props**: `initialData`, `onChange`, `theme`, `UIOptions`, `langCode`, `excalidrawAPI`

### File Format

`.excalidraw` files are JSON:

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "brainmap",
  "elements": [...],
  "appState": { "gridSize": null, "viewBackgroundColor": "#ffffff" },
  "files": { "fileId": { "mimeType": "...", "dataURL": "..." } }
}
```

Serialization helpers: `serializeAsJSON(context)`, `parseJSON()`

### Bundle Size

- ~2.3 MB uncompressed (significant)
- **Must use dynamic import** (`import("@excalidraw/excalidraw")`) — same pattern as mermaid
- No tree-shaking support currently (UMD build)

### Tauri v2 Compatibility

- Fully compatible — standard React component, no native deps
- Works in both Chromium (Windows) and WebKit (macOS/Linux) webviews

---

## 2. Obsidian's Approach

Obsidian's Excalidraw plugin uses a hybrid `.excalidraw.md` format:
- Markdown file with YAML frontmatter
- Excalidraw JSON compressed/embedded in the body
- Enables full Obsidian knowledge graph integration (links, backlinks, search)
- Also supports raw `.excalidraw` JSON files in "compatibility mode"

### Key takeaway
Obsidian chose `.excalidraw.md` to keep drawings as first-class knowledge nodes. BrainMap could follow a similar approach but simpler: use raw `.excalidraw` JSON files as the primary format, with optional frontmatter metadata stored separately or inlined.

---

## 3. BrainMap Architecture Fit

### Current File Type Pipeline

| File Type | Detection | Tab Kind | Editor | Graph Node? |
|-----------|-----------|----------|--------|-------------|
| `.md` with YAML | `graph.get_node()` | `"note"` | MarkdownEditor + Frontmatter | Yes |
| `.md` without YAML | extension | `"plain-file"` | MarkdownEditor | No |
| Other text | extension | `"plain-file"` | MarkdownEditor | No |
| `.pdf` | `.pdf` extension | `"pdf"` | PdfViewer | No |
| Binary | UTF-8 decode fails | `"plain-file"` | "Cannot display" | No |

### Adding `.excalidraw`

Would follow the **PDF pattern** — a new tab kind with a dedicated viewer:

| `.excalidraw` | `.excalidraw` extension | `"excalidraw"` | ExcalidrawEditor | Optional |

### What Already Works (No Changes Needed)

1. **File discovery**: `list_workspace_files()` returns ALL files — `.excalidraw` included
2. **File tree**: `FileTreePanel.tsx` renders workspace files regardless of extension
3. **File watcher**: Non-`.md` files emit `files-changed` events (file appears/disappears)
4. **Multi-segment**: `segmentStateCache` already caches `workspaceFiles: string[]`
5. **File icons**: `fileTreeIcons.tsx` has fallback for unknown extensions (can add specific icon)

### Changes Required

#### Minimal (read + edit, no graph integration)

**Frontend only:**
1. `tabStore.ts` — add `"excalidraw"` to `TabState.kind` union
2. `editorStore.ts` — add `activeExcalidrawFile` state slice (like `activePlainFile`)
3. `EditorPanel.tsx` — add conditional branch: `if (kind === "excalidraw") return <ExcalidrawEditor>`
4. New `ExcalidrawEditor.tsx` component — embeds `<Excalidraw>` with lazy loading
5. `FileTreePanel.tsx` — detect `.excalidraw` extension on click → create tab with `kind: "excalidraw"`
6. `fileTreeIcons.tsx` — add Excalidraw-specific icon
7. File read: reuse `readPlainFile()` (returns JSON body as string)
8. File write: reuse `writePlainFile()` or add dedicated command

**Backend: Zero changes** — `.excalidraw` flows as plain file.

#### Full (graph integration)

Additional changes:
1. `workspace.rs` / `graph.rs` — parse `.excalidraw` files as graph nodes with `note_type: "drawing"`
2. `watcher.rs` — discriminate `.excalidraw` extension (new `WatchedFile::Excalidraw` variant)
3. Extract title from filename or Excalidraw JSON
4. Optionally extract text elements for FTS5 search
5. Add `"drawing"` to the 11 note types → 12 types
6. Graph visualization: new shape/color for drawing nodes

---

## 4. Key Design Decisions

### A. File Format: Raw `.excalidraw` vs `.excalidraw.md`

| | Raw `.excalidraw` | `.excalidraw.md` (Obsidian-style) |
|---|---|---|
| Simplicity | Simple — standard JSON | Complex — YAML + embedded JSON |
| Interop | Opens in excalidraw.com | BrainMap-only |
| Graph integration | Requires custom parser | Works with existing YAML parser |
| Implementation effort | Low | Medium |
| File size | Smaller | Larger (frontmatter overhead) |

**Recommendation**: Start with raw `.excalidraw` (simpler, interoperable). Add graph integration later if needed.

### B. Auto-save vs Manual Save

Excalidraw's `onChange` fires on every stroke. Options:
1. **Debounced auto-save** (500ms–2s after last change) — best UX, like excalidraw.com
2. **Manual Cmd+S** — consistent with current note editing
3. **Both** — auto-save + manual save indicator

**Recommendation**: Debounced auto-save (Excalidraw is inherently visual/fluid, manual save breaks flow).

### C. Creating New Drawings

Options:
1. File tree context menu: "New Drawing Here" (like "New Note Here")
2. Slash command in editor: `/excalidraw` → creates inline reference
3. Command palette

**Recommendation**: Context menu "New Drawing" → creates `untitled.excalidraw` with empty Excalidraw JSON.

### D. Dark Mode

Excalidraw supports `theme="dark"` prop. BrainMap already tracks theme in uiStore — pass through.

---

## 5. Implementation Estimate

### Phase 1: Basic Editor (frontend-only)
- New tab kind + editor dispatch
- `ExcalidrawEditor.tsx` with lazy-loaded `@excalidraw/excalidraw`
- Read/write via `readPlainFile`/`writePlainFile`
- File tree click detection
- Dark mode support
- Debounced auto-save
- "New Drawing" in context menu

### Phase 2: Graph Integration (optional, later)
- Parse `.excalidraw` as graph nodes
- FTS5 indexing of text elements
- `note_type: "drawing"` with custom visualization
- Watcher discrimination

### Phase 3: Rich Features (optional, later)
- Embed drawings in markdown notes (preview widget)
- Export to PNG/SVG from within BrainMap
- Link to notes from drawing text elements

---

## 6. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Bundle size (~2.3MB) | Slower initial load | Dynamic import (lazy load on first `.excalidraw` open) |
| Excalidraw version churn | Breaking API changes | Pin exact version, test on upgrade |
| Large drawings with embedded images | Memory pressure | Lazy file loading, warn on large files |
| Excalidraw CSS conflicts | UI glitches | Scoped CSS container, test thoroughly |
| Touch/trackpad gestures in Tauri | Zoom/pan issues | Test on macOS WebKit specifically |

---

## 7. Prior Art & References

- [@excalidraw/excalidraw npm](https://www.npmjs.com/package/@excalidraw/excalidraw)
- [Excalidraw developer docs](https://docs.excalidraw.com/docs/@excalidraw/excalidraw/integration)
- [Excalidraw JSON schema](https://docs.excalidraw.com/docs/codebase/json-schema)
- [obsidian-excalidraw-plugin](https://github.com/zsviczian/obsidian-excalidraw-plugin)
- BrainMap PdfViewer pattern: `crates/app/src/components/Editor/PdfViewer.tsx`
- BrainMap mermaid lazy-load pattern: `crates/app/src/components/Editor/cmMermaidDecorations.ts`
