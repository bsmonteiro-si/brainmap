# 2026-03-15 — Subagent Transcript: Explore

**Date:** 2026-03-15 19:02:40
**Agent:** Explore
**Agent ID:** ac32ecee357902dea
**Parent Session:** cdef1f9f-8f4a-455f-b39c-cdd015da051b

---

## User

I need to understand the BrainMap desktop app's current architecture to assess feasibility of adding a PDF viewer. Specifically:

1. Look at the tab system in `crates/app/src/` - how tabs work, what types of content they can show (tabStore, EditorPanel, TabBar)
2. Look at the editor panel structure - how content is rendered, the CodeMirror setup
3. Check package.json for current dependencies
4. Check the Tauri config and capabilities for any relevant permissions

Focus on: tab architecture, content rendering pipeline, and what framework/libraries are already in use. Be thorough but focused on these areas.

---

## Assistant

I'll systematically explore the desktop app's tab system, editor panel, and current architecture to understand feasibility for PDF viewing.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -type f -name \"*.ts\" -o -name \"*.tsx\" -o -name \"*.json\" | grep -E \"(tabStore|EditorPanel|TabBar|package\\.json|tauri\\.co`

---

## Assistant

Let me search more directly for the source files:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.{ts,tsx}"}`

---

## Assistant

Now let me read the key files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json"}`

---

## Assistant

Now let me check the Tauri config and the API types:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/tauri.conf.json"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts"}`

---

## Assistant

Let me also check the editor and plain file handling to understand the rendering architecture:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx","limit":100}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"binary|pdf|image|viewer","type":"tsx","path":"crates/app/src"}`

---

## Assistant

Let me check for existing file type handling:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.pdf|\\.png|\\.jpg|\\.jpeg|\\.gif|image/","type":"tsx","path":"crates/app/src"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","limit":100}`

---

## Assistant

Let me check for any existing specialized viewers and look at the store structure:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","limit":150}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components -type f -name \"*.tsx\" | xargs grep -l \"viewer\\|viewer\\|Viewer\" | head -5"}`

---

## Assistant

Let me check the CSS to understand the panel structure better:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/*.css"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","limit":200}`

---

## Assistant

Let me check the Rust side to understand how files are served:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src -type f -name \"*.rs\" | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs","limit":100}`

---

## Assistant

Perfect. Now let me check how plain files are currently served and create a comprehensive summary:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"read_plain_file\\|write_plain_file\\|binary\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs | head -30"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","limit":150}`

---

## Assistant

Now let me check the PlainFileDto to see the binary field:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 20 \"PlainFileDto\\|handle_read_plain_file\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs | head -50"}`

---

## Assistant

Perfect! Let me also check AppLayout to understand the overall structure:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx","limit":100}`

---

## Assistant

Perfect! I now have a comprehensive understanding of the architecture. Let me compile my findings:

## BrainMap Desktop App Architecture Analysis - PDF Viewer Feasibility

### Tab System Architecture

**Tab Store (`tabStore.ts`):**
- Manages an array of `TabState` objects with fields: `id`, `path`, `kind` ("note" | "plain-file" | "untitled"), `title`, `noteType`
- Per-tab editor state stored: `editedBody`, `editedFrontmatter`, `isDirty`, `viewMode` ("edit" | "preview" | "raw"), `scrollTop`, `cursorPos`
- `activeTabId` tracks the currently displayed tab
- Simple API: `openTab()`, `closeTab()`, `activateTab()`, `updateTabState()`
- Pure state management via Zustand (no side effects)

**Tab Bar (`TabBar.tsx`):**
- Renders tab items with icons (via `NoteTypeIcon` from `fileTreeIcons.tsx`), titles, dirty indicators
- Handles tab activation/close via store actions
- Plus button creates new untitled tabs
- Shows exactly one tab at a time in EditorPanel

### Content Rendering Pipeline

**Editor Panel (`EditorPanel.tsx`):**
- Central rendering hub that dispatches based on content type:
  1. **Notes** (markdown with YAML frontmatter): Full hero header + metadata + MarkdownEditor + preview layers + FrontmatterForm + RelatedNotesFooter
  2. **Plain Files**: Text-only editor OR "Binary file — cannot be displayed" stub (lines 75-90)
  3. **Untitled Tabs**: Simplified view (title + CodeMirror only, no metadata)
  4. **Empty State**: Placeholder when no tabs open

- Three view modes via CSS opacity layers (all mounted simultaneously):
  - `editor-view-layer--active` class toggles visibility
  - Edit mode: CodeMirror editor
  - Preview mode: React Markdown preview
  - Raw mode: Read-only CodeMirror with full YAML

**Key Pattern:** All three view layers are mounted at the same time; visibility is toggled via CSS class + opacity transition (preserves CodeMirror editor state across mode switches)

### Plain File Handling

**Backend (Rust):**
- `read_plain_file()` in `handlers.rs`: Reads file bytes, attempts UTF-8 decode
  - If valid UTF-8: returns `PlainFileDto { path, body, binary: false }`
  - If invalid UTF-8: returns `PlainFileDto { path, body: "", binary: true }`
- No special MIME type detection; binary is determined by UTF-8 validity only

**Frontend:**
- `EditorPanel` checks `activePlainFile.binary` flag
- If `true`: Shows centered text "Binary file — cannot be displayed" (lines 75-90)
- If `false`: Renders full editor stack (CodeMirror + preview + toolbar)

**Current API (`types.ts`):**
```typescript
export interface PlainFileDetail {
  path: string;
  body: string;
  binary: boolean;
}
```

### Dependencies & Framework Stack

**Package.json key dependencies:**
- `react` 18.3.1 + `react-dom`
- `@codemirror/*` (v6 suite for editor)
- `cytoscape` 3.31.0 + `cytoscape-fcose`, `cytoscape-dagre` (graph visualization)
- `react-resizable-panels` v4.7.2 (panel layout)
- `zustand` 5.0.3 (state management)
- `lucide-react` 0.577.0 (icons)
- `react-markdown` 10.1.0 (preview rendering)
- `remark-gfm` 4.0.1 (markdown extensions)
- **No PDF library currently installed** (pdfjs-dist, react-pdf, etc.)

### Tauri Configuration

**`tauri.conf.json`:**
- v2 framework
- Window: 1200x800, resizable, no drag-drop enabled
- Plugins enabled: `@tauri-apps/plugin-dialog`, `@tauri-apps/plugin-shell`
- CSP set to `null` (permissive)
- No specific file associations or MIME type handlers configured

### API Bridge Pattern

**`bridge.ts`:**
- Detects Tauri environment; routes to `TauriBridge` (production) or `MockBridge` (dev)
- `getAPI()` returns cached `BrainMapAPI` interface
- All commands are thin wrappers: frontend → TypeScript interface → Tauri invoke → Rust handler

**Tauri Command Handlers:**
- Defined in `commands.rs` with `#[tauri::command]` macro
- Routed via `tauri::generate_handler![]` in `lib.rs` (lines 25-52)
- Commands operate on `AppState` (per-slot workspace locking)

### Layout Architecture

**AppLayout.tsx:**
- Three-column structure using `react-resizable-panels` v4:
  1. **IconSidebar** (40px fixed, navigation)
  2. **Content Panel** (resizable, 30% default): Graph/Files/Search tabs via CSS display toggle
  3. **Editor Panel** (resizable, 70% default): TabBar + EditorPanel children
- Per-tab panel sizes persisted to localStorage (`panelSizes` in UIStore)
- Panel state synced imperatively via `usePanelRef()` when tab switches

### Key Rendering Techniques

1. **Layered Views:** All editor view modes (edit/preview/raw) mounted simultaneously, toggled via CSS class on parent `div`
2. **Single CodeMirror Instance:** Only one `EditorView` active at a time (swapped on tab switch)
3. **Ref Preservation:** `useRef<EditorView>()` in `EditorPanel` captures scroll/cursor position before unmount
4. **Zustand Snapshots:** Multi-tab state managed via per-tab snapshots in `tabStore` + per-tab snapshot in `editorStore`
5. **CSS Zoom:** Global zoom (Cmd+/Cmd-) applied via `document.documentElement.style.zoom` for correct mouse hit-testing

### Feasibility Assessment for PDF Viewer

**Strengths:**
- Flexible tab system already supports arbitrary content types (just need to extend `TabState.kind`)
- `EditorPanel` already has conditional rendering for multiple content types (notes vs. plain files vs. untitled)
- Binary file detection is already in place in backend
- API bridge is extensible (add new Tauri command, return DTO with PDF metadata)
- Layout is resizable and panel-aware; no spatial constraints
- CSS class-based visibility toggling proven pattern

**Challenges:**
- No PDF library in dependencies (need to add `pdfjs-dist` or `react-pdf`)
- Binary file handling currently shows stub message; no rendering infrastructure exists
- Tauri file serving: Currently reads files into memory as strings; PDFs need byte streaming or base64 encoding
- MIME type detection: Currently only UTF-8 check; need to detect `.pdf` extension or file magic bytes
- Tab view modes (edit/preview/raw): Don't apply to PDFs; need new conditional logic

**Architecture Integration Points:**
1. Extend `PlainFileDetail` DTO: Add optional `mimeType: string` field + extend binary handling
2. Add `readPDFFile()` Tauri command: Returns base64-encoded bytes (or streaming approach via byte chunks)
3. Extend `EditorPanel` rendering: Add PDF-specific conditional branch with dedicated PDF viewer component
4. TabBar icon: Integrate with `NoteTypeIcon` to show PDF icon (Lucide has `FileText` or custom icon)
5. View mode buttons: Skip for PDFs or show custom controls (zoom, page navigation)

**Risk Areas:**
- Memory usage: Base64-encoding large PDFs; consider chunking or ipc streaming
- Performance: Rendering large PDFs; pdfjs performance varies; consider page caching
- File watcher: Need to detect `.pdf` changes correctly (currently detects `.md` + non-`.md` files separately)

This is a well-structured, extensible architecture that can accommodate a PDF viewer with minimal disruption to existing code patterns. The tab system and conditional rendering patterns are already in place.

---

