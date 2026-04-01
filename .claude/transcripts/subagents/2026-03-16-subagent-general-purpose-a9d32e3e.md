# 2026-03-16 — Subagent Transcript: general-purpose

**Date:** 2026-03-16 11:01:28
**Agent:** general-purpose
**Agent ID:** a9d32e3ea59347008
**Parent Session:** 53784d29-6a22-4fb7-9e56-3dbe83bcb988

---

## User

Do research only (no code changes). I need a comprehensive survey of how the best open-source tools handle PDF text selection in web/desktop apps. Focus on:

1. **pdf.js (Mozilla)** - The reference implementation. How does its text layer work? How does it handle:
   - Text selection (character-level precision)
   - The relationship between the canvas render layer and the transparent text layer
   - Zoom/scale transformations for text layer alignment
   - Copy/paste reliability

2. **react-pdf** - How does it wrap pdf.js? Does it expose the text layer properly? What are known limitations?

3. **PDF.js text layer architecture** - Research the TextLayer API:
   - How text items are positioned (transform matrices, viewport scaling)
   - The CSS that makes the text layer overlay work (absolute positioning, opacity, font-size matching)
   - How `enhanceTextSelection` or equivalent features work
   - The role of `--scale-factor` CSS variable

4. **Other notable open-source PDF viewers**:
   - Sioyek (C++, focused on research papers)
   - Zathura
   - pdf-viewer-reactjs or similar React wrappers
   - Any Electron/Tauri apps with excellent PDF handling

5. **Common pitfalls** that cause broken text selection:
   - Canvas vs text layer misalignment at different zoom levels
   - Missing or incorrect font metrics
   - Incorrect viewport/transform calculations
   - CSS issues (z-index, pointer-events, opacity)

6. **Best practices / gold standard patterns**:
   - What does a correct text layer setup look like?
   - How should zoom changes propagate to the text layer?
   - How to handle high-DPI displays
   - Character-level vs word-level selection

Use WebSearch and WebFetch to find authoritative sources: pdf.js source code docs, blog posts about PDF text selection, GitHub issues about text layer problems, and documentation.

Return a detailed report organized by tool/technique with concrete implementation details we can learn from.

---

## Assistant



I'll conduct a comprehensive survey of PDF text selection handling across open-source tools. Let me search for authoritative sources in parallel.

---

## Assistant

### Tool Calls

- **ToolSearch**: `{"query":"select:WebSearch,WebFetch","max_results":2}`

---

## Assistant



I'll research this thoroughly. Let me run multiple searches in parallel to gather information from different angles.

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"pdf.js text layer architecture how it works text selection"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"pdf.js TextLayer API --scale-factor CSS variable text selection 2025 2026"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"react-pdf text layer text selection known issues limitations"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"pdf.js enhanceTextSelection text layer overlay canvas alignment"}`

---

## Assistant

Good, let me get more specific details from key sources and search for additional topics.

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://github.com/mozilla/pdf.js/issues/4843","prompt":"Extract all technical details about how pdf.js text selection works, the enhanceTextSelection feature, padding approach, text flow orde`

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://usefulangle.com/post/90/javascript-pdfjs-enable-text-layer","prompt":"Extract the complete technical details about how to enable text selection in pdf.js: the CSS required, the JavaScr`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"sioyek pdf viewer text selection architecture how it works"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"pdf.js text layer CSS opacity font-size transform absolute positioning implementation details"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"electron tauri desktop app PDF text selection best practices 2025"}`

---

## Assistant

Let me dig deeper into the technical implementation details.

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://blog.react-pdf.dev/understanding-pdfjs-layers-and-how-to-use-them-in-reactjs","prompt":"Extract all technical details about: 1) How pdf.js layers work in React, 2) The text layer imple`

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://github.com/mozilla/pdf.js/issues/13382","prompt":"Extract all technical details about the text layer misalignment issue when changing scale/resizing canvas. What causes it? What is the`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"pdf.js source code text_layer.js TextLayer class render method viewport scale transform 2024"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"pdf.js high DPI retina display canvas devicePixelRatio text layer alignment"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"react-pdf wojtekmaj text layer implementation source code how it renders TextLayer component"}`

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://github.com/wojtekmaj/react-pdf/blob/main/packages/react-pdf/src/Page/TextLayer.tsx","prompt":"Extract the full implementation details of the TextLayer component: how it creates/renders`

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://github.com/mozilla/pdf.js/issues/10509","prompt":"Extract technical details about how pdf.js handles high DPI / retina displays: the outputScale pattern, devicePixelRatio usage, canvas`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"pdf.js text_layer.css source code --scale-factor endOfContent textLayer stylesheet"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"zathura mupdf poppler pdf text selection implementation C library"}`

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://bugzilla.mozilla.org/show_bug.cgi?id=1815391","prompt":"Extract technical details about the broken text selection and highlighting bug in pdf.js. What caused the breakage? What was the`

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://bugzilla.mozilla.org/show_bug.cgi?id=1922063","prompt":"Extract all technical details about why text layer and canvas don't always match in the PDF viewer on Windows. What causes the m`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"pdf.js text_layer.css github raw source code \"scale-factor\" \"endOfContent\" span positioning"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"pdf viewer text selection character level precision glyph bounding box approach"}`

---

## Assistant

Let me get a few more specific technical sources.

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://github.com/mozilla/pdf.js/blob/master/src/display/text_layer.js","prompt":"Extract all key implementation details: how TextLayer class works, how text items are positioned (transform m`

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://github.com/mozilla/pdf.js/blob/master/web/text_layer_builder.css","prompt":"Extract the complete CSS for the text layer: how .textLayer is styled, how spans are positioned, the --scale`

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://github.com/wojtekmaj/react-pdf/issues/1828","prompt":"Extract the technical details about the overlapping text layer areas bug in react-pdf 9.0.0: what causes it, what the symptoms are`

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://github.com/wojtekmaj/react-pdf/issues/1848","prompt":"Extract the technical details of this issue: what causes the text layer problems in react-pdf, what the workaround or fix is, spec`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"\"pdf.js\" \"total-scale-factor\" OR \"min-font-size\" text layer CSS custom properties how they work"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"sioyek pdf viewer source code text selection mupdf fz_stext_page character bounding box"}`

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://github.com/mozilla/pdf.js/issues/12243","prompt":"Extract technical details about how pdf.js handles Chrome's minimum font size constraint, the min-font-size CSS workaround, how the sc`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"hypothesis pdf annotation client text layer anchoring pdf.js integration text selection"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"pdfium chromium pdf viewer text selection implementation architecture"}`

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://deepwiki.com/chromium/pdfium/5.1-text-extraction-and-search","prompt":"Extract all technical details about PDFium's text extraction and selection system: how CharInfo works, how charac`

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://github.com/pwmt/zathura-pdf-poppler/blob/master/zathura-pdf-poppler/select.c","prompt":"Extract the key implementation details of zathura's text selection using poppler: how it gets se`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"pdf.js text layer complete setup example modern API 2024 2025 TextLayer render viewport scale container"}`

---

## Assistant

Let me also look at the current PdfViewer implementation in the project to understand context.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/PdfViewer.tsx"}`

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://www.nutrient.io/blog/complete-guide-to-pdfjs/","prompt":"Extract the section about text layer setup, how it works with canvas, the modern TextLayer API usage, viewport handling, scale `

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://medium.com/@mxgel/enable-text-selection-on-pdf-js-32fcfe845f4b","prompt":"Extract the complete technical details about enabling text selection in pdf.js: the full code example, CSS set`

---

## Assistant

Now let me check the CSS in the project and look at the pdf.js examples page for the canonical approach.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pdf-text-layer|textLayer|text-layer","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","glob":"*.css","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://mozilla.github.io/pdf.js/examples/","prompt":"Extract any code examples showing how to set up the text layer for text selection. Look for: TextLayer usage, CSS class setup, --scale-fac`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":3100,"limit":60}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"pdf.js github examples text layer selection \"textLayer\" example code modern API pdfjs-dist"}`

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://github.com/mozilla/pdf.js/issues/18206","prompt":"Extract the complete migration guide from renderTextLayer to new TextLayer API: the new constructor parameters, how to set the --scale`

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://github.com/mozilla/pdf.js/issues/11214","prompt":"Extract any complete code examples of setting up a text layer with pdf.js, especially modern examples. Look for: how to create the con`

---

## Assistant

Now I have comprehensive data. Let me write the research report.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/.claude/plans/wild-napping-lampson-agent-a9d32e3ea59347008.md","content":"# PDF Text Selection in Web/Desktop Apps: Comprehensive Survey\n\n## 1. pdf.js (Mozilla) -- Th`

---

## Assistant

The full research report has been written to `/Users/bsmonteiro/.claude/plans/wild-napping-lampson-agent-a9d32e3ea59347008.md`. Here is a summary of the key findings:

---

## Key Findings

### pdf.js Text Layer Architecture
- Uses a **dual-layer model**: canvas for visual rendering, transparent `<span>` overlay for selection
- Each text item is positioned via transform matrices from the PDF, with coordinates computed from `Math.atan2` rotation, font ascent scaling, and percentage-based positioning
- Spans get `color: transparent`, `position: absolute`, `white-space: pre` -- invisible but selectable
- The `--scale-factor` / `--total-scale-factor` CSS variable is **critical** -- it drives the font size calculation: `font-size: calc(var(--text-scale-factor) * var(--font-height))`
- A `--min-font-size` / `--min-font-size-inv` system works around browser minimum font size enforcement

### react-pdf Wraps pdf.js Thinly
- Most bugs are from: (1) not importing required CSS, (2) race conditions when parallel pages share `canvas.measureText()` context, (3) not setting `--scale-factor`
- The `scaleX` race condition (#1848) causes overlapping spans -- fix is sequential text layer rendering with a mutex

### Native Viewers (PDFium, MuPDF, Poppler)
- PDFium uses `CharInfo` with tight/loose bounding boxes per character -- true character-level precision
- Zathura delegates to Poppler's `POPPLER_SELECTION_GLYPH` mode for character-level selection
- Sioyek uses MuPDF's structured text page with configurable selection granularity (glyph/word/line)

### BrainMap-Specific Issues Identified

The most likely cause of any text selection problems in the current `PdfViewer.tsx`:

1. **Missing `--scale-factor` CSS variable** -- `renderPage()` never calls `textDiv.style.setProperty('--scale-factor', viewport.scale.toString())`. Without this, pdf.js's CSS font-size calculations break.

2. **Missing min-font-size CSS system** -- The custom `.pdf-text-layer` CSS replicates some of pdf.js's styles but omits the `--min-font-size`, `--text-scale-factor`, and `--min-font-size-inv` custom properties that handle browser minimum font size enforcement.

3. **Class name mismatch** -- The div uses `pdf-text-layer` but pdf.js internal CSS targets `.textLayer`. Any pdf.js-generated styles won't match.

4. **No parallel rendering protection** -- Multiple pages can render text layers simultaneously, risking the `canvas.measureText()` race condition.

---

