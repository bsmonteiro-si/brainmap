# 2026-03-16 — Subagent Transcript: Explore

**Date:** 2026-03-16 10:55:25
**Agent:** Explore
**Agent ID:** acf4b648334c80799
**Parent Session:** 53784d29-6a22-4fb7-9e56-3dbe83bcb988

---

## User

Explore the PDF viewer implementation in this codebase thoroughly. I need to understand:

1. The PdfViewer component at crates/app/src/components/Editor/PdfViewer.tsx - read it fully
2. Any PDF-related utilities (pdfCoords.ts, pdfCoords.test.ts)
3. How PDFs are rendered - what library is used (pdf.js? react-pdf?)
4. How text selection is currently implemented - is there a text layer? Custom selection logic?
5. How zoom/scale is handled and whether coordinates are properly transformed
6. Any CSS related to the PDF viewer

Read all relevant files completely and report on the full architecture of PDF rendering and text selection.

---

## Assistant

I'll explore the PDF viewer implementation thoroughly. Let me start by reading the main component and utilities.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/PdfViewer.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/pdfCoords.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/pdfCoords.test.ts"}`

---

## Assistant

Now let me check the CSS files related to the PDF viewer and look at the types definition:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/App.css"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

Now let me read the CSS file to see the styling:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","limit":300}`

---

## Assistant

Let me search for PDF-specific CSS rules:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"pdf\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Now let me read the PDF CSS section:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":3000,"limit":230}`

---

## Assistant

Perfect! Now let me check the package.json to confirm dependencies and search for any other PDF-related files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*pdf*\" -type f | head -20"}`

---

## Assistant

Excellent! Now let me check the Tauri backend for PDF handling:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"pdf\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src --include=\"*.rs\" -i | head -30"}`

---

## Assistant

Let me read the Tauri handlers and DTOs in detail:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 20 \"handle_resolve_pdf_path\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 15 \"handle_load_pdf_highlights\\|handle_save_pdf_highlights\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

Now let me check the DTO definitions:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 15 \"pub struct PdfMetaDto\\|pub struct PdfHighlightDto\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs"}`

---

## Assistant

Perfect! Now let me check the API bridge to understand how the frontend calls these:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 10 \"resolvePdfPath\\|loadPdfHighlights\\|savePdfHighlights\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts"}`

---

## Assistant

Excellent! Now let me create a comprehensive summary report. Based on all the code I've read, I have a complete understanding of the PDF implementation. Here's my report:

## PDF Viewer Implementation Architecture Report

### 1. **PDF Library & Configuration**

**Library Used:** `pdfjs-dist` v4.10.38 (pdf.js)
- **Entry Point:** `PdfViewer.tsx` imports `pdfjs-dist`
- **Worker Configuration:** Worker is loaded from `pdfjs-dist/build/pdf.worker.mjs?url` using Vite's `?url` import for proper asset URL handling
- **Worker Setup:** `pdfjsLib.GlobalWorkerOptions.workerSrc` is set globally on component load

### 2. **Core Components & Structure**

#### **PdfViewer Component** (`crates/app/src/components/Editor/PdfViewer.tsx`)
- **Props:** Takes `path` (relative path to PDF file)
- **Size:** 727 lines of React component code

**Key State Variables:**
- `scrollContainerRef` / `pageRefsMap` / `canvasRefsMap` / `textLayerRefsMap`: Maps storing DOM references per page
- `pdfDocRef`: Reference to the loaded PDF document
- `naturalWidthRef`: Cached natural PDF width at scale 1.0
- `fitScale` / `userZoom`: Combined into final `scale` variable (fitScale × userZoom)
- `numPages`: Total page count
- `currentPage`: Currently visible page (set via IntersectionObserver)
- `highlights`: Array of highlight objects with coordinates
- `activeColor`: Selected highlight color from color palette

### 3. **PDF Rendering Pipeline**

**Loading Phase:**
1. `loadPdf()` effect fetches the PDF path via `api.resolvePdfPath(path)`
2. Converts file path using Tauri's `convertFileSrc()` for asset protocol
3. Calls `pdfjsLib.getDocument({ url })` to load the PDF asynchronously
4. Gets first page to determine natural width: `firstPage.getViewport({ scale: 1.0 })`
5. Creates placeholder `PageInfo` array for all pages
6. Loads existing highlights via `api.loadPdfHighlights(path)`

**Setup Phase:**
1. Calculates `fitScale = availableWidth / naturalWidth` to fit container width
2. Sets placeholder container dimensions for each page
3. Triggers initial render of visible pages

**Rendering Phase (per page):**
1. Gets page object: `doc.getPage(pageNum)`
2. Calculates viewport with current scale: `page.getViewport({ scale: renderScale })`
3. **Canvas rendering (Raster):**
   - Scales canvas by device pixel ratio (DPR) for crisp display
   - Canvas width/height set to `viewport.width/height × dpr`
   - Sets transform: `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`
   - Calls `page.render({ canvasContext: ctx, viewport })`
4. **Text layer (Vector, for selection):**
   - Gets text content: `page.getTextContent()`
   - Creates `new TextLayer({ textContentSource, container, viewport })`
   - Renders text layer to create selectable text overlays
   - Text is positioned absolutely with `transform-origin: 0 0%`

**Visibility Management:**
- IntersectionObserver tracks which page is most visible
- ResizeObserver detects container size changes, recalculates `fitScale`
- Virtual rendering: only renders pages within `RENDER_BUFFER = 2` of current page
- Rendered pages are tracked in `renderedPages` set
- When zoom changes, clears rendered pages to trigger re-render

### 4. **Text Selection & Coordinate Transformation**

**Selection Detection:**
- Listens to `mouseup` and `keyup` events on the scroll container
- `checkSelection()` checks if `window.getSelection()` has non-empty text within the PDF container
- Sets `hasSelection` state (used to enable highlight/copy buttons)

**Coordinate Transformation (`pdfCoords.ts`):**

**Function: `selectionToHighlightRects(selection, pageContainer, scale)`**
- Takes browser Selection and current render scale
- Extracts DOM rects from selection via `range.getClientRects()`
- Converts from **client coordinates** to **PDF viewport coordinates**:
  ```
  x = (clientRect.left - containerRect.left) / scale
  y = (clientRect.top - containerRect.top) / scale
  w = clientRect.width / scale
  h = clientRect.height / scale
  ```
- Skips tiny rects (< 1px) to filter artifacts
- Returns array of `HighlightRect` objects with normalized coordinates at scale=1.0

**Function: `getSelectionPageNum(selection)`**
- Walks up from selection anchor node to find nearest `[data-page]` ancestor
- Extracts page number from `data-page` attribute
- Returns page number or null

**Key Insight:** Coordinates are stored **relative to the PDF's natural (scale=1.0) viewport**, NOT at rendered scale. This allows highlights to remain correct when zooming or resizing.

### 5. **Highlight Storage & Rendering**

**Persistence (Tauri Backend):**
- Highlights stored in sidecar JSON file: `{pdf_path}.highlights.json`
- Backend handlers: `handle_load_pdf_highlights()` / `handle_save_pdf_highlights()`
- Cleanup: If highlights array is empty, sidecar file is deleted

**Highlight Data Structure:**
```typescript
interface PdfHighlight {
  id: string;           // UUID
  page: number;         // 1-indexed page number
  rects: HighlightRect[];  // Array of coordinate rectangles
  text: string;         // Original selected text
  color: string;        // Hex color (e.g., "#FBBF24")
  created_at: string;   // ISO timestamp
}

interface HighlightRect {
  x: number;  // Normalized X (at scale=1.0)
  y: number;  // Normalized Y (at scale=1.0)
  w: number;  // Width (at scale=1.0)
  h: number;  // Height (at scale=1.0)
}
```

**Rendering Highlights:**
- Overlay div with class `pdf-highlight-layer` positioned absolutely over canvas
- For each highlight rectangle:
  - Creates `div.pdf-highlight-rect` with:
    - `left: r.x * scale`
    - `top: r.y * scale`
    - `width: r.w * scale`
    - `height: r.h * scale`
    - `backgroundColor: h.color` (opacity 0.3, increases to 0.5 on hover)
- Delete button appears on first rect of hovered highlight

### 6. **Zoom & Scale Handling**

**Zoom Controls:**
- User zoom: 0.25x to 4.0x in 0.25 increments
- Fit scale: automatically calculated as `availableWidth / naturalWidth`
- Final render scale: `fitScale × userZoom`

**Zoom Operations:**
- On zoom change, `renderedPages` is cleared to force re-render
- All pages' sizes are recalculated
- Highlights automatically scale because:
  - Stored coordinates are at scale=1.0
  - Rendered with `position: absolute` and scaled by multiplying by current `scale`

**DPR (Device Pixel Ratio) Handling:**
- Canvas width/height are multiplied by `devicePixelRatio` for crisp rendering
- Canvas CSS size is set separately without DPR
- Transform is applied to context: `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`
- This ensures proper hit-testing for text selection

### 7. **CSS Architecture** (`App.css` lines 3002-3210)

**Container Layout:**
- `.pdf-viewer-body`: Flexbox column, centered, scrollable, gap between pages
- `.pdf-page-container`: Relative positioning for layered content, shadow effect

**Canvas Layer:**
- `.pdf-canvas`: Display block, no special styling (gets sized dynamically)

**Text Layer (Invisible, for selection):**
- `.pdf-text-layer`: Positioned absolutely over canvas, `z-index: 2`, `opacity: 1`
- Text spans inside are `color: transparent`, `position: absolute`, `white-space: pre`
- Allows selection while keeping text invisible
- `::selection` background uses theme accent color at 40% opacity

**Highlight Layer (Overlay):**
- `.pdf-highlight-layer`: Absolute, covers entire page, `pointer-events: none`, `z-index: 1`
- `.pdf-highlight-rect`: Absolute within layer, `opacity: 0.3`, `pointer-events: auto`, rounded corners
- `.pdf-highlight-rect--hovered`: Increased to `opacity: 0.5` with transition
- `.pdf-highlight-delete`: Circular button, positioned top-right, `z-index: 2`

**Toolbar:**
- `.pdf-toolbar`: Flex row, wrappable, flex-gap 4px
- Buttons, separators, page input, zoom label, color swatches
- Active color swatch has `border-color: var(--text-primary)`

### 8. **Highlight Color Palette**

**Colors (hardcoded in component):**
1. Yellow: `#FBBF24`
2. Green: `#34D399`
3. Blue: `#60A5FA`
4. Pink: `#F472B6`
5. Red: `#F87171`

**Selection:**
- Color swatches in toolbar (18px circles)
- Active swatch marked with border
- Hover scales up 1.15x

### 9. **API Interface** (`api/types.ts`)

**Frontend API Methods:**
```typescript
resolvePdfPath(path: string): Promise<PdfFileMeta>
loadPdfHighlights(pdfPath: string): Promise<PdfHighlight[]>
savePdfHighlights(pdfPath: string, highlights: PdfHighlight[]): Promise<void>
```

**Tauri Bridge (`api/tauri.ts`):**
- Calls `invoke<T>(command_name, params)` for each API method
- Commands: `resolve_pdf_path`, `load_pdf_highlights`, `save_pdf_highlights`

### 10. **Backend Validation & Security**

**PDF Resolution (`handle_resolve_pdf_path`):**
- Validates file extension is `.pdf` (case-insensitive)
- Checks file exists
- Enforces max size: 50 MB
- Returns `PdfMetaDto` with `path`, `absolute_path`, `size_bytes`

**Highlight Persistence:**
- Validates sidecar path via `validate_relative_path()` (prevents path traversal)
- Creates parent directories if needed
- Uses pretty-printed JSON for human readability

### 11. **Test Coverage** (`pdfCoords.test.ts`)

**29 lines of Vitest tests:**
- `selectionToHighlightRects` converts client rects correctly with scale division
- Skips tiny rects (artifacts)
- `getSelectionPageNum` extracts page from `data-page` attribute
- Handles null cases

### 12. **Key Architecture Decisions**

1. **Layered Rendering:** Canvas (raster) + text layer (vector) allows selection without visual text
2. **Scale-Invariant Coordinates:** Highlights stored at scale=1.0, dynamically scaled on render
3. **Virtual Rendering:** Only renders visible pages + buffer to manage memory
4. **Sidecar Persistence:** Highlights stored next to PDFs, not in main workspace
5. **DPR Handling:** Explicit device pixel ratio management ensures crisp rendering and correct hit-testing
6. **Absolute Positioning:** Text layer and highlights positioned absolutely for precise alignment

---

**Summary:** The PDF viewer uses pdf.js for rendering with a two-layer approach (canvas + invisible text overlay). Text selection works via the native browser Selection API operating on the text layer. Highlights are stored as normalized coordinates relative to the natural PDF viewport, scaled dynamically during render. The implementation is performant (virtual rendering), responsive (ResizeObserver for fit-to-width), and properly handles device pixel ratios for crisp display.

---

