# 2026-03-20 — Subagent Transcript: Explore

**Date:** 2026-03-20 14:57:33
**Agent:** Explore
**Agent ID:** af632a069a8c18a37
**Parent Session:** b1d9eca6-8bb3-4c0b-8673-2c48c1a7ec0b

---

## User

Explore the BrainMap codebase to understand patterns relevant to canvas implementation:

1. How does the existing file tree drag-and-drop work? Look at:
   - `crates/app/src/components/Layout/FileTreePanel.tsx` — drag start events, data transfer
   - `crates/app/src/utils/fileTreeDnd.ts` — any DnD utilities
   
2. How does the GraphView work with Cytoscape? Look at:
   - `crates/app/src/components/GraphView/GraphView.tsx` — how it initializes, responds to data changes
   - `crates/app/src/stores/graphStore.ts` — node/edge data model (NodeDto, EdgeDto)
   
3. How does the note card/summary data work? Look at:
   - `crates/app/src/api/types.ts` — NodeDto fields (title, note_type, tags, summary, etc.)
   - Any existing card/preview components that render note metadata

4. How does the ExcalidrawEditor handle file I/O? (readPlainFile/writePlainFile pattern we'll reuse)
   - `crates/app/src/components/Editor/ExcalidrawEditor.tsx`

5. Check the PdfViewer for the readonly tab pattern
   - `crates/app/src/components/Editor/PdfViewer.tsx`

I need to understand what data is available for rendering note cards on a canvas, and what DnD infrastructure exists.

---

## Assistant

I'll explore the BrainMap codebase to understand the patterns relevant to canvas implementation. Let me start with multiple targeted searches.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/utils/*dnd* crates/app/src/utils/*drag*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/GraphView/*.tsx"}`

---

## Assistant

Let me continue reading the FileTreePanel and searching for more relevant files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx","limit":200}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/stores/*.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/*.tsx"}`

---

## Assistant

Now let me read the key stores and utilities:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts","limit":150}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"fileTreeDnd\\|computeNewPath\\|isValidDrop\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ExcalidrawEditor.tsx","limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/PdfViewer.tsx","limit":100}`

---

## Assistant

Now let me search for the fileTreeDnd utility and understand the DnD pattern:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils -type f -name \"*.ts\" -o -name \"*.tsx\" | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/fileTreeDnd.ts","limit":200}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"onDragStart\\|onDragOver\\|onDrop\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx | head -20"}`

---

## Assistant

Now let me look at the FileTreePanel DnD implementation more closely and check for NodeDto fields:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":900,"limit":200}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"dataTransfer\\|setData\\|getData\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 20 \"function handleDragStart\\|const handleDragStart\\|const onDragStart\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx | head -5`

---

## Assistant

Now let me check the generated types to see what NodeDto contains:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/generated.ts","limit":300}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api -name \"*.ts\" -type f"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"type NodeDto\\|interface NodeDto\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/ 2>/dev/null | head -3"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/generated/NodeDto.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/generated/NodeSummaryDto.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/generated/NoteDetailDto.ts"}`

---

## Assistant

Let me check if there's an existing Canvas component or Editor type for canvas:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f \\( -name \"*Canvas*\" -o -name \"*canvas*\" \\) 2>/dev/null"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"canvas\\|Canvas\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ 2>/dev/null | grep -v \"node_modules\" | head -10"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ | grep -i editor"}`

---

## Assistant

Now let me check the EditorPanel to understand how different editor types are selected:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx","limit":250}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"ExcalidrawEditor\\|PdfViewer\\|MarkdownEditor\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx | head -20"}`

---

## Assistant

Perfect! Now let me check the tabStore to see what tab kinds exist:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts","limit":150}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"kind:\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts | head -20"}`

---

## Assistant

Excellent! Now let me check how files are opened and what the editorStore does for opening different file types:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"openNote\\|openPlainFile\\|\\.excalidraw\\|\\.pdf\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts | head -30"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","limit":200}`

---

## Assistant

Now let me check how file types are determined (PDF, Excalidraw, etc.):

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"\\.excalidraw\\|\\.pdf\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts | head -20"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -rn \"excalidraw\\|pdf\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","offset":200,"limit":150}`

---

## Assistant

Let me check the TabBar to see how file types are detected when opening files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx","limit":200}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"\\.pdf\\|\\.excalidraw\\|endsWith\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx | head -20"}`

---

## Assistant

Let me search for where PDF and Excalidraw file types are determined:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -rn \"\\.excalidraw\\|\\.pdf\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.ts\" --include=\"*.tsx\" | grep -v node_modules | grep -v \".test\" | head -20"`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -rn \"kind === \\\"pdf\\\"\\|kind === \\\"excalidraw\\\"\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.ts\" --include=\"*.tsx\" | head -20"}`

---

## Assistant

Perfect! Now I have enough understanding. Let me read that FileTreePanel section to see the exact logic:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":760,"limit":80}`

---

## Assistant

Excellent! I now have comprehensive understanding of the codebase. Let me compile my findings:

## Canvas Implementation Exploration - Findings Report

I've thoroughly explored the BrainMap codebase to understand the patterns relevant to canvas implementation. Here are my findings:

### 1. **File Tree Drag-and-Drop (DnD) Pattern**
Located in `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx` and `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/fileTreeDnd.ts`

**DnD Data Transfer:**
- Uses `dataTransfer.setData()` with custom MIME types:
  - `"application/brainmap-path"` — the file/folder path
  - `"application/brainmap-is-folder"` — boolean flag ("1" or "0")
- Event handlers: `handleDragStart` (line 909), `handleItemDragOver` (line 968), `handleItemDrop`
- Pure utility functions in `fileTreeDnd.ts`:
  - `computeNewPath()` — calculates destination path
  - `isValidDrop()` — validates move legality
  - `computeDropZone()` — detects drop position (before/after/into for folders)
  - `getParentFolder()`, `isSameFolder()` — path utilities

**Key Pattern:** State-driven drag tracking with refs (`draggedPath`, `draggedIsFolder`), visual feedback via CSS classes (`.dragging`, `.reorder-above`, `.reorder-below`), and unified drop handling with auto-expand on hover for folders.

### 2. **GraphView & Node/Edge Data Model**
Located in `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx`

**Data Types:**
- **NodeDto** (minimal): `{ path, title, note_type, tags, modified }`
- **NodeSummaryDto** (richer): `{ path, title, note_type, tags, status, summary }`
- **NoteDetailDto** (full): adds `created, source, links, extra, body`
- **EdgeDto**: `{ source, target, rel, annotation }`

**GraphStore** (`graphStore.ts`):
- Maintains `nodes: Map<string, NodeDto>` and `edges: EdgeDto[]`
- `loadTopology()` fetches the full graph
- `selectNode(path)` for graph selection
- `expandNode(path)` for lazy-loading neighbors (1-hop)
- `applyEvent()` handles real-time updates from backend

**Cytoscape Integration:**
- Uses cytoscape.js with fcose (force-directed) and dagre (hierarchical) layouts
- Nodes have styling based on note type (shapes, colors) and degree (size)
- Edge labels show relationship types; can be toggled on/off
- Multiple layout algorithms available (force, hierarchical, radial, concentric, grouped)

### 3. **File Type Detection & Editor Routing**
Located in `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx` (lines 764-775)

**Extension-Based Routing:**
```typescript
if (path.endsWith(".pdf")) → open as "pdf" tab (PdfViewer)
if (path.endsWith(".excalidraw")) → open as "excalidraw" tab (ExcalidrawEditor)
else if (isBrainMapNote) → open as "note" tab (MarkdownEditor + frontmatter)
else → open as "plain-file" tab (MarkdownEditor text-only)
```

**Tab Kinds** (`tabStore.ts` line 16):
- `"note"` — BrainMap markdown with frontmatter
- `"plain-file"` — plain text/markdown without frontmatter
- `"untitled"` — unsaved draft
- `"pdf"` — PDF viewer (read-only)
- `"excalidraw"` — Excalidraw drawing editor

### 4. **Editor Panel Dispatch Logic**
Located in `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx`

**Conditional Rendering:**
```typescript
if (activeTab?.kind === "pdf") → PdfViewer
if (activeTab?.kind === "excalidraw") → ExcalidrawEditor
if (activePlainFile) → MarkdownEditor + optional FrontmatterForm
if (activeNote) → MarkdownEditor + FrontmatterForm + RelatedNotesFooter
```

**Note Card/Preview Data Available:**
- From `NodeSummaryDto`: title, type, tags, status, summary
- From `NoteDetailDto`: + created, modified, source, links, extra fields
- Folder nodes are virtual graph nodes with `note_type: "folder"` (no actual `.md` file)

### 5. **File I/O Pattern (readPlainFile/writePlainFile)**
Located in `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts` and used by ExcalidrawEditor

**API Methods:**
- `readPlainFile(path)` → `PlainFileDto { path, body, binary, modified }`
- `writePlainFile(path, body)` → saves to file
- `createPlainFile(path, body?)` → creates new file
- Works for `.excalidraw` JSON files and other binary/text formats

**ExcalidrawEditor Pattern** (`ExcalidrawEditor.tsx`):
- Loads file via `api.readPlainFile()`, parses JSON
- Debounced save (1500ms) via `writePlainFile()` on changes
- Module-level state (`pendingSaves`) for save-on-unmount cleanup
- Error boundary for graceful failure with "Open as Text" fallback

### 6. **Read-Only Tab Pattern (PdfViewer)**
Located in `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/PdfViewer.tsx`

**Self-Contained Component:**
- Takes only `path` prop
- Loads file via `api.resolvePdfPath()` to get absolute path
- Manages all state internally (pages, zoom, highlights, undo)
- No editorStore involvement — sidebar marked "Editor" but component is read-only
- Canvas-based rendering with IntersectionObserver for lazy page rendering

**Key Pattern:** No integration with editorStore for read-only files. State managed entirely in component. Sidebar says "Editor" but content is viewer-only.

### 7. **Available Note Metadata for Rendering**
From `api/types.ts` and graph data:

**Per-Note Available:**
- `title, note_type, tags, status, summary` (from NodeSummaryDto)
- `created, modified, source` (from NoteDetailDto)
- `path` (file location)
- `links` (incoming/outgoing edges, relationship types)
- `extra` (arbitrary key-value fields)

**Per-Folder (Virtual Nodes):**
- `path` (folder path)
- `title` (derived from path)
- `note_type: "folder"`
- `tags, status, summary` (null or defaults)
- `noteCount` (computed in FileTreePanel.tsx for display)

### 8. **Store Architecture for Multi-Segment Support**
Located in `crates/app/src/stores/` (segmentStateCache.ts, segmentStore.ts)

**Relevant Pattern:**
- Per-workspace locking via `RwLock<HashMap<String, Arc<Mutex<WorkspaceSlot>>>>`
- `segmentStateCache` saves/restores full UI state on segment switch
- Zustand stores are the single source of truth per active segment
- `applyTopologyDiff` pure function for incremental graph updates

**Canvas Canvas Implication:** If canvas should persist per-segment, leverage same snapshot/restore pattern as file tree state.

---

### Summary: Canvas Implementation Patterns to Adopt

1. **Drag-and-drop:** Use `dataTransfer.setData("application/brainmap-*", ...)` convention; reuse path computation utilities from `fileTreeDnd.ts`
2. **Note cards on canvas:** Render with `NodeSummaryDto` or `NoteDetailDto` fields (title, type, tags, summary, status); can drag from graph or file tree via standardized MIME type
3. **File type routing:** Detect `.canvas` extension → open as "canvas" tab kind; dispatch from EditorPanel like PDF/Excalidraw
4. **File I/O:** Use `readPlainFile()` / `writePlainFile()` for JSON persistence (like Excalidraw)
5. **Read-only vs. editable:** Separate component state from editorStore for specialized editors; clearForCustomTab() clears editor for read-only tabs
6. **Graph integration:** Access full node/edge data from graphStore via path lookup; subscribe to workspace events for real-time updates
7. **Multi-segment:** Snapshot canvas state (positions, selected cards, zoom) to segmentStateCache on switch; restore on activate

---

