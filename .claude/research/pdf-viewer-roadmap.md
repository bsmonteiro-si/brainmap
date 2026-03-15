# PDF Viewer — Multi-Phase Roadmap

## Overview

Add PDF viewing, highlighting, and annotation capabilities to BrainMap's desktop app, progressively building from a basic viewer to full graph-integrated annotations.

## Phase 1: PDF Viewer Tab — COMPLETE (2026-03-15)

**Goal:** Open PDF files from the file tree in a dedicated viewer tab with page navigation, zoom, and text selection → new note.

**Status:** Implemented and working.

**Key decisions:**
- Use Tauri's asset protocol (`convertFileSrc`) for zero-copy PDF loading (no base64 IPC)
- PDF state lives in the `PdfViewer` component, not in editorStore (avoids N-way mutual exclusion)
- Tab routing via `kind: "pdf"` + `path`
- `pdfjs-dist` v4.x (Mozilla PDF.js) — v5.x incompatible with Tauri's WebKit (`Map.prototype.getOrInsertComputed` unavailable)
- Vite `?url` worker import for off-thread PDF rendering

**Files added/modified:**
- `crates/app/src-tauri/src/dto.rs` — `PdfMetaDto` struct
- `crates/app/src-tauri/src/handlers.rs` — `handle_resolve_pdf_path` (path validation, .pdf check, 50MB size guard)
- `crates/app/src-tauri/src/commands.rs` — `resolve_pdf_path` Tauri command
- `crates/app/src-tauri/src/lib.rs` — command registration
- `crates/app/src-tauri/tauri.conf.json` — asset protocol scope enabled
- `crates/app/src/api/types.ts` — `PdfFileMeta` interface + `resolvePdfPath` API method
- `crates/app/src/api/tauri.ts` — TauriBridge implementation
- `crates/app/src/api/mock/index.ts` — MockBridge stub
- `crates/app/src/stores/tabStore.ts` — `kind` union extended with `"pdf"`
- `crates/app/src/stores/editorStore.ts` — `clearForPdfTab()` action (auto-saves dirty content first)
- `crates/app/src/components/Editor/PdfViewer.tsx` — **new file**, full PDF viewer component
- `crates/app/src/components/Editor/EditorPanel.tsx` — PDF rendering branch
- `crates/app/src/components/Editor/TabBar.tsx` — PDF tab activate/close handling
- `crates/app/src/components/Layout/FileTreePanel.tsx` — `.pdf` click handler
- `crates/app/src/declarations.d.ts` — worker URL type declaration
- `crates/app/src/App.css` — PDF toolbar and viewer styles

**Lessons learned:**
- `pdfjs-dist` v5.x uses `Map.prototype.getOrInsertComputed` (TC39 Stage 3) — unavailable in Tauri's WebKit WebView. Must use v4.x.
- Asset protocol (`convertFileSrc`) avoids base64 IPC memory amplification (~4x for large PDFs)
- PDF rendering state should live in the component, not in global stores — prevents N-way mutual exclusion growth
- `clearForPdfTab` must auto-save before clearing editor state (same pattern as all other tab-switch paths)
- `openUntitledTab()` must be used (not `createUntitledTab()`) to properly transition editorStore to untitled mode
- Render queue pattern needed to prevent dropped renders on rapid page/zoom changes

**Known gaps (deferred to Phase 2+):**
- PDF files renamed/deleted while tab is open — tab becomes stale (no conflict detection)
- File watcher `files-changed` events for PDFs — not handled (tab auto-close deferred)

---

## Phase 2: Basic Highlighting

**Goal:** Select text in PDF, apply color highlights that persist across sessions.

**Key design:**
- **Highlight model:** `PdfHighlight { id, page, quadPoints, color, text, createdAt }`
- **Storage:** Sidecar JSON file per PDF: `<filename>.pdf.brainmap.json` in same directory
- **Tauri commands:** `save_pdf_annotations(path, annotations)`, `load_pdf_annotations(path)`
- **UI:** Color picker toolbar (4-5 preset colors), highlights rendered as semi-transparent canvas overlays on the text layer
- **Highlight list panel:** Sidebar showing all highlights for the active PDF, click to jump to page
- **File watcher:** Detect `.brainmap.json` changes for live updates

**Challenges:**
- PDF text coordinates are non-trivial — text positions come from the PDF's internal layout
- Mapping highlight to persistent coordinates (page + character offsets or quad points) requires careful handling
- No turnkey React annotation library — need custom canvas/SVG overlay

**Estimated effort:** 3-5 days

---

## Phase 3: Full Annotations & Graph Integration

**Goal:** Rich annotations with margin notes, graph integration, and bidirectional linking.

**Features:**
- **Margin notes:** Click a highlight to add a text annotation; rendered as popover or side panel
- **PDF as graph node:** PDF files become nodes in the knowledge graph (new `note_type: "pdf"`)
- **Annotation → note linking:** "Create Note from Highlight" button creates a BrainMap note with `sourced-from` edge back to the PDF (including page number + highlight ID in the link annotation)
- **Backlinks in PDF viewer:** Show which notes reference this PDF and at which highlights
- **Search integration:** Index highlight text + annotations in SQLite FTS5
- **Annotation undo/redo:** Integrate with `undoStore` for create/delete/edit annotation operations
- **Export:** Export all annotations as a markdown summary note

**Estimated effort:** 3-5 days

---

## Total estimated effort: ~8-13 days across all phases
