# 2026-03-16 — Claude Code Session

**Date:** 2026-03-16 10:51:15
**Session:** cdef1f9f-8f4a-455f-b39c-cdd015da051b

---

## Slash Command

<command-name>/clear</command-name>
            <command-message>clear</command-message>
            <command-args></command-args>

---

## User

Is it possible to add a pdf viewer in our app, and make it able to annotate and highlight over the doc through the app? Also, integrate into our app like selecting a portion of text and taking it to a new tab in the app (just an example). How high of an effort would this be?

---

## Assistant

Let me explore the current app structure to give you an informed assessment.

---

## Assistant

### Tool Calls

- **Agent**: `{"description":"Explore app structure for PDF feasibility","subagent_type":"Explore","prompt":"I need to understand the BrainMap desktop app's current architecture to assess feasibility of adding a PD`

---

## Assistant

## PDF Viewer Feasibility Assessment

### Short answer: **Medium-high effort** — roughly 3-4 days of focused work for a solid v1, significantly more if you want full annotation/highlighting.

### What's in your favor

- **Tab system is extensible** — `TabState.kind` already supports `"note" | "plain-file" | "untitled"`, adding `"pdf"` is straightforward
- **EditorPanel already branches** by content type (notes vs plain files vs untitled vs empty state)
- **Binary detection exists** in the Rust backend (`read_plain_file` returns `binary: true` for non-UTF-8)
- **Layout is flexible** — resizable panels, CSS zoom, all proven patterns

### Breakdown by feature

| Feature | Effort | Notes |
|---|---|---|
| **Basic PDF rendering** | Low-Medium | Add `pdfjs-dist` or `react-pdf`, new Tauri command to return base64 bytes, new branch in EditorPanel |
| **Page navigation, zoom, scroll** | Low | Most PDF libs (react-pdf, pdfjs) include this out of the box |
| **Text selection → new tab** | Medium | pdfjs exposes text layer; wire selection event → create untitled tab with selected text |
| **Highlighting & annotations** | **High** | This is where it gets hard. Options: (1) build a custom canvas overlay on top of pdfjs text/render layers, (2) use a full-featured lib like `pdf-annotate.js` or Hypothesis. Either way you need a persistence layer (where to store annotations — sidecar JSON? SQLite?) |
| **Persisting annotations** | Medium-High | Need a storage model (sidecar `.brainmap-annotations.json` per PDF, or a table in the SQLite index), plus load/save logic, undo/redo |
| **Integration with knowledge graph** | Medium | PDF as a node in the graph, annotations as linked notes, backlinks from annotations to PDF regions |

### The hard part: annotations

Rendering a PDF is a solved problem (`pdfjs-dist` is battle-tested, ~500KB). The real complexity is **annotation and highlighting**:

1. **PDF text coordinates are non-trivial** — text positions come from the PDF's internal layout, not DOM flow. Mapping a highlight to persistent coordinates (page + character offsets or quad points) requires careful handling.
2. **No turnkey open-source React annotation library** exists that's production-quality. You'd likely layer: pdfjs for rendering → custom canvas/SVG overlay for highlights → your own persistence format.
3. **Undo/redo** for annotations would need its own stack (similar to your existing `undoStore` but for annotation ops).

### Realistic recommendation

- **Phase 1 (2-3 days):** PDF viewer tab with page nav, zoom, text selection → copy to new note tab. This gets you 80% of the value.
- **Phase 2 (3-5 days):** Basic highlighting (color overlay on selected text regions), persisted as sidecar JSON, visible on re-open.
- **Phase 3 (3-5 days):** Full annotations (margin notes, highlight colors, annotation panel), graph integration (PDF node + annotation backlinks).

Want me to draft a detailed implementation plan for any of these phases?

---

## User

Create a multiphased plan with this proposal and save to the plan to the .claude/plans. We will then focus on the first phase.

---

## Assistant

Let me gather the specific integration points I need for a detailed plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts","limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","limit":60}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

Now let me also check the EditorPanel and the Rust handler for reading plain files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx","limit":100}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"read_plain_file","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src","output_mode":"files_with_matches"}`

---

