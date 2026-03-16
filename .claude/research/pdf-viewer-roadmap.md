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

**UX improvements (2026-03-15):**
- Continuous vertical scroll — all pages rendered in a scrollable container (replaces single-page view)
- Lazy rendering — only pages within ±2 of the viewport are rendered (performance for large PDFs)
- Fit-to-width — scale computed from `containerWidth / naturalPageWidth`, zoom is relative to fit
- Auto-refit on resize — `ResizeObserver` recalculates fitScale; `fitScale` is reactive state (not a ref) so changes trigger re-renders
- fitScale deferred to `setupPages` effect (after DOM mount) to account for scrollbar width — fixes initial left-offset bug
- `IntersectionObserver` tracks current page during scroll, updates toolbar page indicator
- Page input jumps to page via `scrollIntoView()`

**Lessons learned:**
- `pdfjs-dist` v5.x uses `Map.prototype.getOrInsertComputed` (TC39 Stage 3) — unavailable in Tauri's WebKit WebView. Must use v4.x.
- Asset protocol (`convertFileSrc`) avoids base64 IPC memory amplification (~4x for large PDFs)
- PDF rendering state should live in the component, not in global stores — prevents N-way mutual exclusion growth
- `clearForPdfTab` must auto-save before clearing editor state (same pattern as all other tab-switch paths)
- `openUntitledTab()` must be used (not `createUntitledTab()`) to properly transition editorStore to untitled mode
- Render queue pattern needed to prevent dropped renders on rapid page/zoom changes
- `fitScale` must be `useState` (not `useRef`) — ref updates don't trigger re-renders, causing stale scale on resize
- Compute `fitScale` after pages mount (in `setupPages` effect), not during `loadPdf` — the scroll container has no scrollbar during loading, giving a wider `clientWidth` than the final layout

**Known gaps (deferred to Phase 2+):**
- PDF files renamed/deleted while tab is open — tab becomes stale (no conflict detection)
- File watcher `files-changed` events for PDFs — not handled (tab auto-close deferred)

---

## Phase 2: Basic Highlighting — COMPLETE (2026-03-16)

**Goal:** Select text in PDF, apply color highlights that persist across sessions.

**Status:** Implemented and working.

**Key decisions:**
- **Highlight model:** `PdfHighlight { id, page, rects: HighlightRect[], text, color, created_at }` — rects stored in PDF viewport coordinates (scale=1)
- **Storage:** Sidecar JSON file per PDF: `<filename>.pdf.highlights.json` in same directory
- **Tauri commands:** `load_pdf_highlights(pdfPath)`, `save_pdf_highlights(pdfPath, highlights)` — empty vec deletes the sidecar file
- **UI:** 5 color swatches (Yellow, Green, Blue, Pink, Red) in toolbar, highlight button, undo button, eraser (remove selected highlight), copy-to-note
- **Selection snapshot pattern:** `checkSelection` eagerly captures text, page number, and rects into `selectionSnapshotRef` on `selectionchange` (rAF-throttled) + synchronous `mouseup` on scroll container. `createHighlight` reads from the snapshot, not from live `window.getSelection()`, to survive button click selection clearing.
- **Overlap detection:** Re-highlighting same text with same color = no-op; different color = recolor in place
- **Undo stack:** `undoStackRef` stores previous highlights arrays (capped at 50). All mutations go through `persistHighlights()` which pushes undo entries. Undo via toolbar button or Cmd+Z (when scroll container focused). Stack cleared on PDF path change.
- **Per-group opacity:** Highlight rects wrapped in a group div with `opacity: 0.5` to prevent overlapping rects within the same highlight from compounding opacity.
- **Font data:** `getDocument()` configured with `cMapUrl` (binary .bcmap) and `standardFontDataUrl` for correct text layer alignment with embedded fonts (especially bold variants).

**Files added/modified:**
- `crates/app/src-tauri/src/dto.rs` — `PdfHighlightDto`, `HighlightRectDto` structs
- `crates/app/src-tauri/src/handlers.rs` — `handle_load_pdf_highlights`, `handle_save_pdf_highlights` (sidecar JSON read/write with path validation)
- `crates/app/src-tauri/src/commands.rs` — `load_pdf_highlights`, `save_pdf_highlights` Tauri commands
- `crates/app/src-tauri/src/lib.rs` — command registration
- `crates/app/src/api/types.ts` — `HighlightRect`, `PdfHighlight` interfaces + API methods
- `crates/app/src/api/tauri.ts` — TauriBridge `loadPdfHighlights`, `savePdfHighlights`
- `crates/app/src/api/mock/index.ts` — MockBridge stubs (no-op save, empty load)
- `crates/app/src/components/Editor/PdfViewer.tsx` — highlight creation, deletion, undo, overlap detection, selection snapshot, toolbar UI
- `crates/app/src/utils/pdfCoords.ts` — **new file**, `selectionToHighlightRects` and `getSelectionPageNum` utilities
- `crates/app/src/utils/pdfCoords.test.ts` — **new file**, 6 unit tests for coord utilities
- `crates/app/src/declarations.d.ts` — cmap and standard_fonts URL type declarations
- `crates/app/src/App.css` — highlight group/rect/delete/swatch styles

**Lessons learned:**
- `onMouseDown={(e) => e.preventDefault()}` on toolbar buttons is not reliable enough to preserve selections in WebKit webviews — snapshot pattern required
- `selectionchange` via rAF throttle introduces a race with fast toolbar clicks — synchronous `mouseup` listener on scroll container needed as backup
- Per-rect `opacity` compounds on overlapping rects from the same highlight — must use per-group opacity wrapper
- React 18 `setHighlights((prev) => ...)` functional updater runs synchronously; safe to read captured `prev`/`updated` after the call
- `getDocument()` without `cMapUrl`/`standardFontDataUrl` causes text layer misalignment for bold text — pdf.js falls back to browser default font metrics

**Known gaps (deferred to Phase 3):**
- Highlight list panel (sidebar showing all highlights, click to jump)
- File watcher for `.highlights.json` changes
- PDF files renamed/deleted while tab is open — tab becomes stale

---

## Phase 3: Full Annotations & Graph Integration

**Goal:** Rich annotations with margin notes, graph integration, and bidirectional linking.

**Features:**
- **Highlight list panel:** Sidebar showing all highlights for the active PDF, click to jump to page
- **Margin notes:** Click a highlight to add a text annotation; rendered as popover or side panel
- **PDF as graph node:** PDF files become nodes in the knowledge graph (new `note_type: "pdf"`)
- **Annotation → note linking:** "Create Note from Highlight" button creates a BrainMap note with `sourced-from` edge back to the PDF (including page number + highlight ID in the link annotation)
- **Backlinks in PDF viewer:** Show which notes reference this PDF and at which highlights
- **Search integration:** Index highlight text + annotations in SQLite FTS5
- **Export:** Export all annotations as a markdown summary note

---
