# 2026-03-16 — Subagent Transcript: Explore

**Date:** 2026-03-16 10:31:36
**Agent:** Explore
**Agent ID:** a4b82044e94b3d793
**Parent Session:** cdef1f9f-8f4a-455f-b39c-cdd015da051b

---

## User

I need to understand the current PdfViewer component and surrounding infrastructure to plan adding PDF text highlighting. Explore:

1. `crates/app/src/components/Editor/PdfViewer.tsx` — full read. I need to understand:
   - How pages are rendered (canvas + text layer per page)
   - How the text layer works (pdfjs TextLayer API)
   - How text selection is currently tracked
   - The ref maps structure (pageRefsMap, canvasRefsMap, textLayerRefsMap)
   - The rendering lifecycle (renderPage, setupPages, etc.)

2. `crates/app/src/App.css` — search for `.pdf-` classes to see current PDF styling

3. `crates/app/src-tauri/src/handlers.rs` — look at `handle_read_plain_file` and `handle_resolve_pdf_path` patterns for how file I/O is done, to understand how to add save/load annotation commands

4. `crates/app/src-tauri/src/commands.rs` — look at the `read_plain_file` and `write_plain_file` patterns 

5. Check how pdfjs-dist v4 TextLayer works — look at `node_modules/pdfjs-dist/types/src/display/text_layer.d.ts` for the TextLayer class API (what methods/properties are available for getting text positions)

6. Check if pdfjs has any built-in annotation or highlight support — look at `node_modules/pdfjs-dist/types/src/display/annotation_layer.d.ts` if it exists

Be thorough on the PdfViewer component — I need to understand every detail of how pages render to plan overlay positioning.

---

## Assistant

I'll systematically explore the PDF infrastructure to understand how to add text highlighting. Let me start with the key files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/PdfViewer.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.pdf-","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","glob":"**/*.css","output_mode":"content"}`

---

## Assistant

Now let me check the pdfjs-dist types and CSS styling for the text layer:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 20 \"\\.pdf-text-layer\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -40"}`

---

## Assistant

Now let me check the pdfjs types to understand the TextLayer API:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -name \"text_layer.d.ts\" -o -name \"annotation_layer.d.ts\" 2>/dev/null | head -5"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/pdfjs-dist/types/src/display/text_layer.d.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/pdfjs-dist/types/src/display/annotation_layer.d.ts"}`

---

## Assistant

Perfect! Now let me check existing tests for the PdfViewer and look for any other PDF-related infrastructure:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*[Pp]df*\" -type f 2>/dev/null"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/generated/PdfMetaDto.ts"}`

---

## Assistant

Now let me check if there are any existing tests for PdfViewer:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*test*\" -o -name \"*.test.ts*\" | grep -i pdf"}`

---

## Assistant

Let me check how notes are displayed and understand the annotation storage pattern:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"annotation\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.tsx\" --include=\"*.ts\" -l 2>/dev/null | head -5"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/generated/LinkParams.ts"}`

---

## Assistant

Perfect! Now let me check how the currently selected/highlighted text state is being tracked in the UI store:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"hasSelection\\|selection\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores --include=\"*.ts\" -A 2 | head -40"}`

---

## Assistant

Now let me check the UIStore to see if there's any PDF-specific state management:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"pdf\\|PDF\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts -i | head -20"}`

---

## Assistant

Let me look at the overall architecture of the app's state management:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/"}`

---

## Assistant

Now let me gather comprehensive information on the complete App.css PDF styling:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 100 \"^\\.pdf-toolbar\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -130"}`

---

## Assistant

Perfect! Now I have gathered all the necessary information. Let me provide a comprehensive analysis of the PDF infrastructure and how text highlighting can be added.

## PDF Infrastructure Analysis & Text Highlighting Plan

### Current PDF Infrastructure

#### 1. **PdfViewer Component** (`PdfViewer.tsx`)
The component has a complete rendering pipeline:

**Ref Maps (line 30-32):**
- `pageRefsMap`: Stores `HTMLDivElement` for each page container (absolutely positioned, holds canvas + text layer)
- `canvasRefsMap`: Stores `HTMLCanvasElement` for the rendered PDF image
- `textLayerRefsMap`: Stores `HTMLDivElement` for the text layer overlay

**Rendering Lifecycle:**
1. **`loadPdf()`** (line 54): Loads PDF document via `pdfjsLib.getDocument()`, stores in `pdfDocRef`
2. **`setupPages()`** (line 196): Calculates `fitScale` (fit-to-width), sets placeholder dimensions for all pages
3. **`renderPage()`** (line 118): Per-page renderer that:
   - Renders canvas at `scale = fitScale * userZoom` (line 129)
   - Creates `TextLayer` from `page.getTextContent()` (line 159-165)
   - TextLayer appends `span` elements to the text div with positioned text (invisible, for selection)
   - Scales with device pixel ratio for crisp rendering

**Text Layer Details:**
- TextLayer renders text as invisible `<span>` elements positioned absolutely with CSS properties like `top`, `left`, `width`, `height`
- These spans are hit-testable (support text selection via mouse/keyboard)
- Each span's bounding box comes from pdf.js's layout engine based on character metrics

**Current Selection Tracking (line 317-340):**
- `checkSelection()` uses `window.getSelection()` to detect if there's text selected within the scroll container
- Updates `hasSelection` state (drives "Copy to Note" button disable/enable)
- Selection detection triggers on `mouseup` and `keyup`

#### 2. **API & Handlers**
**Commands** (`commands.rs`):
- `read_plain_file(path)` — reads raw file bytes → UTF-8 string
- `write_plain_file(path, body)` — writes raw file bytes
- `resolve_pdf_path(path)` — validates PDF file, returns metadata (absolute_path, size_bytes)

**Handlers** (`handlers.rs`):
- `handle_read_plain_file()` — calls `std::fs::read()`, checks if binary or UTF-8
- `handle_write_plain_file()` — validates path with `validate_relative_path()`, writes bytes
- `handle_resolve_pdf_path()` — validates path, checks file exists, enforces 50MB max size

**Path Validation Pattern** (line 465-483 in handlers.rs):
```rust
pub fn validate_relative_path(root: &std::path::Path, path: &str) -> Result<std::path::PathBuf, String> {
    // Rejects absolute paths
    // Normalizes ".." components
    // Verifies result stays within workspace root
}
```

#### 3. **CSS Styling** (`App.css`)
**Text Layer** (lines 3107-3122):
```css
.pdf-text-layer {
  position: absolute;          /* Overlay on top of canvas */
  top: 0; left: 0;
  overflow: hidden;
  opacity: 0.25;               /* Nearly invisible */
  line-height: 1;
}

.pdf-text-layer span {
  position: absolute;          /* Positioned by layout engine */
  white-space: pre;
  color: transparent;          /* Invisible but selectable */
}

.pdf-text-layer ::selection {
  background: color-mix(in srgb, var(--accent) 40%, transparent);  /* Blue highlight on select */
}
```

**Page Container** (line 3097-3110):
```css
.pdf-page-container {
  position: relative;          /* Creates positioning context for absolute spans */
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
```

#### 4. **pdfjs-dist API Surface**
**TextLayer Class** (`text_layer.d.ts`):
- Constructor: takes `{ textContentSource, container, viewport }`
- Public properties:
  - `textDivs: Array<HTMLElement>` — all rendered span elements (read-only after `render()`)
  - `textContentItemsStr: Array<string>` — original text strings
- Public methods:
  - `render(): Promise` — async render to DOM
  - `update({ viewport, onBefore }): undefined` — re-layout for zoom/scroll
  - `cancel(): undefined` — abort rendering

**Key Insight**: After `textLayer.render()` completes, the `textDivs` array contains all span elements with their computed styles (`position: absolute`, `left`, `top`, `width`, `height`).

#### 5. **Annotation Layer (Not Used Yet)**
`AnnotationLayer` exists in pdfjs but is NOT used in current implementation:
- Requires complex parameter setup (linkService, downloadManager, etc.)
- Used for PDF form fields and interactive annotations
- Highlights can be custom-rendered on a separate canvas overlay instead

---

### Design for PDF Text Highlighting

Based on this infrastructure, here's the high-level approach for adding highlights:

#### **High-Level Architecture**

1. **Highlight Data Model** (Rust → TypeScript DTO):
   ```typescript
   interface PdfHighlight {
     id: string;                    // UUID
     pdfPath: string;               // relative path to PDF
     pageNum: number;               // 1-based page number
     rects: Array<{x, y, w, h}>;   // Positions in page viewport coords
     text: string;                  // Highlighted text
     color: string;                 // #rrggbb
     createdAt: number;             // timestamp
     note?: string;                 // Optional annotation
   }
   ```

2. **Storage**: JSON file next to PDF
   - Path: `{pdfPath}.highlights.json`
   - E.g., `documents/paper.pdf` → `documents/paper.pdf.highlights.json`
   - Stored as JSON array of highlights

3. **Frontend Components**:
   - **PdfViewer** enhancements:
     - Load highlights JSON on PDF load
     - Render highlight overlays as positioned `<div>` elements on top of each page (after text layer, before any UI)
     - Track selection → offer "highlight selection" UI
   - **Highlight Overlay Layer**: Canvas or positioned divs per page with highlight rects
   - **Highlight Toolbar**: "Create highlight" button (only active when text selected), color picker, delete button
   - **Highlights Sidebar**: List of all highlights for current PDF (page, text, action buttons)

4. **Tauri Commands**:
   - `save_pdf_highlights(pdf_path: String, highlights: Vec<PdfHighlight>)` → writes `.highlights.json`
   - `load_pdf_highlights(pdf_path: String)` → reads `.highlights.json`, returns array
   - `delete_pdf_highlights_file(pdf_path: String)` → deletes the file

5. **Highlight Positioning**:
   - Selection → `window.getSelection()` → `Selection.getRangeAt(0)` → `range.getClientRects()` for client coords
   - Client coords → page-relative coords (subtract page container offset)
   - Page-relative coords → viewport-normalized coords (divide by viewport width/height)
   - On render: multiply normalized coords by actual viewport dimensions to position highlights

6. **Challenges & Solutions**:
   - **Text layout complexity**: PDF text spans are laid out by pdfjs's TextLayer; selecting across multiple spans requires coordinate transformation
   - **Zoom handling**: Highlights must scale with `userZoom * fitScale`; use viewport coords or recalculate on zoom
   - **Touch/copy-paste**: Use native selection API (`getSelection()`) which works across both text and text-layer spans
   - **Persistence**: Store in `.highlights.json` next to PDF; no database needed (filesystem-backed)

---

### Implementation Roadmap (Phase Breakdown)

**Phase 1: Core Highlight Model & Storage**
- Add DTO type `PdfHighlight` 
- Add Tauri commands: `save_pdf_highlights`, `load_pdf_highlights`, `delete_pdf_highlights_file`
- Handlers in `handlers.rs` with path validation
- Unit tests for validators

**Phase 2: Frontend Highlight Rendering**
- Extend `PdfViewer` to load highlights on mount
- Add highlight overlay layer (positioned divs) on top of text layer
- Position highlights based on stored `rects` (viewport-relative coords)
- Render highlights with opacity + hover effects

**Phase 3: Highlight Creation UI**
- Detect text selection in `renderPage` post-render
- Extract selection rectangles from DOM (text layer spans)
- "Highlight Selection" button in toolbar with color picker
- On click: compute highlight rect in viewport coords, save via Tauri command, re-render overlay

**Phase 4: Highlight Management**
- Highlights sidebar showing all highlights for current PDF
- Delete button per highlight
- Click to scroll to highlight on page
- Edit note/color on highlight

**Phase 5: Advanced Features**
- Search highlights by text or note
- Export highlights as markdown
- Keyboard shortcut for quick highlight (Cmd+H)
- Highlight persistence across sessions

---

### Key Technical Decisions

1. **Coordinate System**: Store highlights in viewport-normalized coords `[0..1]` so they survive zoom/resize
2. **Overlay Method**: Positioned `<div>` elements (not canvas) for simplicity and text layer compatibility
3. **Storage**: Filesystem JSON file per PDF (no database) — aligns with BrainMap's file-centric philosophy
4. **Selection API**: Use native `window.getSelection()` to leverage pdfjs's text layer spans
5. **Tauri Commands**: Follow existing plain-file patterns (`read_plain_file`, `write_plain_file`)

---

### File Touchpoints

**New Files to Create:**
1. `crates/app/src/components/Editor/PdfHighlights.tsx` — highlight rendering component
2. `crates/app/src/components/Editor/PdfHighlightToolbar.tsx` — highlight creation/color UI
3. `crates/app/src/stores/pdfHighlightStore.ts` — Zustand store for highlight state
4. `crates/app/src/utils/pdfCoords.ts` — coordinate transformation utilities
5. `crates/app/src/utils/pdfCoords.test.ts` — tests for coord utils

**Modified Files:**
1. `crates/app/src/components/Editor/PdfViewer.tsx` — integrate highlights, selection tracking
2. `crates/app/src-tauri/src/commands.rs` — add 3 new Tauri commands
3. `crates/app/src-tauri/src/handlers.rs` — implement handlers with path validation
4. `crates/app/src/App.css` — add `.pdf-highlight`, `.pdf-highlight-overlay`, toolbar styles
5. `crates/app/src/api/dto.rs` — add `PdfHighlight` DTO with ts-rs derive

**No Changes Needed:**
- Graph topology or core library (highlights are external to the graph model)
- Note format or frontmatter (highlights stored separately)
- MCP server (highlights are desktop-app-only feature)

---

### Testing Strategy

**Unit Tests:**
- `pdfCoords.test.ts`: coordinate transformation round-trips, edge cases
- `pdfHighlightStore.test.ts`: add/remove/update highlights, persistence

**Integration Tests:**
- `PdfViewer.test.tsx`: load PDF + highlights, render overlay, click to highlight
- `PdfHighlightToolbar.test.tsx`: selection detection, color picker, save

**Manual Testing Checklist:**
- Load PDF with existing highlights → verify they appear at correct positions
- Zoom in/out → highlights scale and stay aligned
- Select text → "Highlight" button appears + is clickable
- Create highlight → appears immediately, persists after reload
- Delete highlight → removed from overlay + file
- Multi-page PDF → highlights on different pages independent
- Large PDF (50MB edge case) → no performance issues

This completes the comprehensive exploration. The infrastructure is well-designed for adding highlights without major refactoring.

---

