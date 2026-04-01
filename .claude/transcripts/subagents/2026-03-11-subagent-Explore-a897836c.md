# 2026-03-11 — Subagent Transcript: Explore

**Date:** 2026-03-11 20:07:24
**Agent:** Explore
**Agent ID:** a897836cf379c22b4
**Parent Session:** 39b8b6f7-28e1-4e15-ac42-d06a2cbd1540

---

## User

Explore the desktop app's editor implementation in crates/app/. I need to understand:

1. How the CodeMirror editor is set up — find the main editor component and its configuration (extensions, event handlers, etc.)
2. How links between notes work in the data model — what do links look like in markdown content? Are they wiki-style [[links]], standard markdown links, or frontmatter-only?
3. How note navigation works — how does the app currently open/select a note? Look at stores (editorStore, uiStore, graphStore) for actions like openNote, selectNote, setActiveNote, etc.
4. How the "related notes" or linked notes are displayed — is there already click-to-navigate for linked notes somewhere?
5. The file structure of the React frontend (src/ directory layout)

Be thorough — check component files, store files, and the API bridge. Look for any existing click handlers on links or references to link navigation.

---

## Assistant

I'll conduct a thorough exploration of the desktop app's editor implementation. Let me start by examining the directory structure and then dive into the key components.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -type f -name \"*.ts\" -o -name \"*.tsx\" -o -name \"*.json\" | head -50"}`

---

## Assistant

Let me focus on the src/ directory structure within the app crate:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/ 2>/dev/null | head -30"}`

---

## Assistant

Now let me explore the components and stores in detail:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components -type f \\( -name \"*.tsx\" -o -name \"*.ts\" \\) | sort"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores -type f \\( -name \"*.ts\" -o -name \"*.tsx\" \\) | sort"}`

---

## Assistant

Now let me read the key files. I'll start with the stores and main editor components:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

Now let me read the main editor components and the API bridge:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx"}`

---

## Assistant

Now let me check the MarkdownPreview component and the API bridge:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api -type f \\( -name \"*.ts\" -o -name \"*.tsx\" \\)"}`

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

Now let me check the Rust data model and Tauri handlers to understand how links are structured:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates -name \"dto.rs\" -o -name \"model.rs\" | head -5"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs","limit":100}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"struct Note|pub struct Note","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs","offset":100,"limit":150}`

---

## Assistant

Now let me check how the Tauri handlers manage notes and links, and also look at the MarkdownPreview to see if it handles link rendering:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri -name \"*.rs\" -type f | head -20"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src -name \"*.rs\" -type f"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs"}`

---

## Assistant

Perfect! Now let me check the handlers to see how links are created and used:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","offset":150,"limit":100}`

---

## Assistant

Now let me check one of the test datasets to see actual link formats in the markdown:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/seed/"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/seed -name \"*.md\" -type f | head -3"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/seed/Evidence/Smoking and Lung Cancer Studies.md"}`

---

## Assistant

Perfect! Now let me check the GraphView and how it integrates with navigation:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx","offset":100,"limit":150}`

---

## Assistant

Excellent! Now let me check the FrontmatterForm to understand how links are managed:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx","limit":150}`

---

## Assistant

Perfect! Now let me check the App.tsx to see the overall layout and how panels are organized:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

Now let me check the AppLayout to understand the overall panel structure:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

Perfect! Now I have a comprehensive understanding. Let me compile my findings into a detailed report.

## Comprehensive Exploration Report: Desktop App Editor Implementation

I've thoroughly explored the BrainMap desktop app's editor architecture. Here's what I found:

---

### 1. CodeMirror Editor Setup

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx`

The editor is configured with:
- **Core Extensions**: `markdown()` language support, `defaultKeymap`, `EditorView.lineWrapping`
- **Theme**: `oneDark` for dark mode; custom `buildMarkdownHighlight()` styling for light mode
- **Highlighting**: Custom accent color (#4a9eff) for headings with size-based formatting
- **Event Handling**: `EditorView.updateListener` fires on document changes to call `onChange` callback
- **Font Management**: Dynamic font family/size via CSS variables, counter-zoom technique to handle app-level zoom without breaking CodeMirror's coordinate mapping
- **Re-measurement**: Triggered on font changes and zoom changes to keep CodeMirror measurements accurate

---

### 2. Link Data Model

**Files**: 
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs` (Rust core)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs` (DTO conversions)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts` (TypeScript API)

**Link Structure**:
- **Frontmatter-only**: Links are defined in YAML frontmatter under the `links` field, NOT as markdown [[wiki-links]]
- **Format**: Each link is a `TypedLink` with `target`, `rel` (relationship type), and optional `annotation`
- **Example** (from seed dataset):
  ```yaml
  links:
    - target: "../Arguments/Causal Reasoning is Formalizable.md"
      type: supports
    - target: "../Concepts/Confounding.md"
      type: related-to
  ```
- **Path Resolution**: Relative paths in link targets are resolved relative to the note's directory (see `note.path.resolve_relative()` in handlers.rs, line 177)
- **Edge Types**: 15 relationship types exist: contains, part-of, causes, supports, contradicts, extends, depends-on, exemplifies, precedes, leads-to, evolved-from, related-to, authored-by, sourced-from, mentioned-in

**In NoteDetail DTO** (what the app receives):
```typescript
interface NoteDetail {
  links: TypedLinkDto[];  // Array of {target, rel, annotation?}
  // ... other fields
}
```

---

### 3. Note Navigation & Store Actions

**Editor Store** (`editorStore.ts`):
- **`openNote(path: string)`**: Async function that loads a note via `api.readNote(path)` and sets it as `activeNote`
- **State**: `activeNote: NoteDetail | null`, `isDirty`, `isLoading`, `editedBody`, `editedFrontmatter`
- **Save Flow**: `saveNote()` calls `api.updateNote()`, then re-reads via `api.readNote()` to get authoritative state (server-set timestamps, etc.)
- **Graph Sync**: On title/type changes, manually calls `useGraphStore.getState().applyEvent()` with "node-updated" to keep graph in sync

**Graph Store** (`graphStore.ts`):
- **`selectNode(path: string | null)`**: Sets `selectedNodePath` state (visual selection in graph)
- **`loadTopology()`**: Fetches full graph via `api.getGraphTopology()` (all nodes + edges)
- **`expandNode(path: string)`**: Lazy-loads neighbors via `api.getNeighbors()` for subgraph expansion
- **Event Application**: `applyEvent()` handles node-created, node-updated, node-deleted, edge-created, edge-deleted, topology-changed

**UI Store** (`uiStore.ts`):
- Layout state: `treeOpen`, `graphFocusPath`, `graphFocusKind` (for focus mode)
- Modal state: `commandPaletteOpen`, `createNoteDialogOpen`, `settingsOpen`
- Display state: `showEdgeLabels`, `showLegend`, `graphLayout` (force or hierarchical)
- Font/theme/zoom: `uiFontFamily`, `editorFontSize`, `effectiveTheme`, `uiZoom`

---

### 4. Click-to-Navigate for Linked Notes

**RelatedNotesFooter** (`RelatedNotesFooter.tsx`, lines 54-61):
```typescript
onClick={() => {
  useGraphStore.getState().selectNode(item.path);
  useEditorStore.getState().openNote(item.path);
}}
```

The app already has **click-to-navigate for related notes** in the footer:
- Displays both outgoing links (from `activeNote.links`) and incoming links (from graph edges)
- Shows up to 10 related notes with a "Show N more…" button
- Each note card displays: relationship type, title, colored type bar
- Clicking a card opens that note in the editor and selects it in the graph
- Shows related notes count: "Related Notes (X)"

**In GraphView** (`GraphView.tsx`, lines 153-157):
- **Single-click** on graph node: `selectNode(nodePath)` + `openNote(nodePath)` → opens in editor
- **Double-click** on graph node: `expandNode(nodePath)` → lazy-loads neighbors
- **Zoom-based edge label visibility**: Auto-shows edge labels when zoomed in >= 80%
- **Hover tooltips**: Displays node title + type on hover

---

### 5. Frontend File Structure

```
src/
├── api/
│   ├── bridge.ts              # Factory that returns TauriBridge or MockBridge
│   ├── types.ts               # TypeScript DTOs matching Rust structs
│   ├── tauri.ts               # TauriBridge implementation
│   ├── pickFolder.ts          # Native folder picker utility
│   └── mock/                  # MockBridge for local testing
├── components/
│   ├── Editor/
│   │   ├── EditorPanel.tsx    # Main editor wrapper (split view: edit/preview)
│   │   ├── MarkdownEditor.tsx # CodeMirror 6 editor
│   │   ├── MarkdownPreview.tsx# React-markdown with GFM
│   │   ├── FrontmatterForm.tsx# Metadata editing UI
│   │   ├── RelatedNotesFooter.tsx # Linked notes cards with click navigation
│   │   ├── TagInput.tsx       # Editable tag pills
│   │   ├── ExtraFieldsEditor.tsx # Key-value extra fields
│   │   └── CreateNoteDialog.tsx
│   ├── GraphView/
│   │   ├── GraphView.tsx      # Cytoscape.js graph renderer
│   │   ├── GraphToolbar.tsx   # Layout/filter buttons
│   │   ├── GraphLegend.tsx    # Type color legend
│   │   ├── graphFocusFilter.ts# Focus mode subgraph filtering
│   │   └── graphStyles.ts     # Cytoscape stylesheet + node coloring
│   ├── Layout/
│   │   ├── AppLayout.tsx      # react-resizable-panels layout (Graph | Editor+Search)
│   │   ├── FileTreePanel.tsx  # Folder tree view
│   │   └── SegmentPicker.tsx  # Home screen for segment selection
│   ├── Search/
│   │   └── SearchPanel.tsx    # FTS results
│   ├── CommandPalette/
│   │   └── CommandPalette.tsx
│   ├── StatusBar/
│   │   └── StatusBar.tsx
│   └── Settings/
│       └── SettingsModal.tsx  # Theme, fonts, zoom settings
├── stores/
│   ├── editorStore.ts         # Active note, dirty state, save logic
│   ├── graphStore.ts          # Graph topology, selected node, events
│   ├── uiStore.ts            # Layout, modal, display state (persisted to localStorage)
│   ├── workspaceStore.ts      # Current workspace info
│   └── segmentStore.ts        # Named workspace list (segments)
├── hooks/
├── App.tsx                    # Root component (event subscriptions, keyboard shortcuts)
├── App.css                    # Global + component styles
└── main.tsx
```

---

### 6. Link Rendering & User Interface

**Current Link Display**:
1. **MarkdownPreview** uses `react-markdown` with `remark-gfm` → renders standard markdown links as `[text](url)`, NOT wiki-links
2. **FrontmatterForm** does NOT show a UI for editing the `links` field — links are not directly editable in the UI (must edit YAML manually or via API)
3. **RelatedNotesFooter** is the primary UI for navigating relationships — it displays both explicit frontmatter links and incoming graph edges
4. **GraphView** shows the full graph topology as an interactive network where nodes represent notes and edges represent relationships

**Three Edge Kinds**:
- **Explicit**: Defined in frontmatter `links` field
- **Implicit**: Inferred from directory hierarchy (parent-child relationships)
- **Inline**: Parsed from markdown body content (currently not visible in UI but supported in data model)

---

### 7. Editor & Note Saving Flow

**Edit Flow**:
1. User clicks a note in graph or related notes footer → `openNote(path)` loads full `NoteDetail`
2. Edit view mounted with **two simultaneous CodeMirror instances** (edit & preview) via CSS opacity toggle for smooth switching
3. `MarkdownEditor` onChange fires → `updateContent(body)` sets `isDirty: true`
4. **Cmd+S** or manual save → `saveNote()`:
   - Validates title is not empty
   - Calls `api.updateNote()` with only changed fields
   - Re-reads note to get authoritative state
   - Syncs graph if title/type changed
   - Detects concurrent edits (partial clear of edited fields)

**Conflict Resolution**:
- If file is externally modified while open: "File changed externally" banner
- Options: "Keep Mine" (dismiss) or "Accept Theirs" (reload)

---

### 8. API Bridge Pattern

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts`

Two implementations:
- **TauriBridge**: Calls Rust backend via Tauri invoke (real app)
- **MockBridge**: In-memory state for dev/testing (loads seed dataset)

Key API methods:
- `openWorkspace(path)` → `WorkspaceInfo`
- `readNote(path)` → `NoteDetail`
- `updateNote(params)` → void (re-read separately for new data)
- `createLink(source, target, rel, annotation)` → void
- `listLinks(path, direction, relFilter)` → `EdgeDto[]`
- `getGraphTopology()` → `GraphTopology` (all nodes + edges)
- `getNeighbors(path, depth, direction, relFilter)` → `Subgraph`
- `onEvent(callback)` → unsubscribe function (live updates)

---

### Summary: Clickable Links in Action

**Current**: RelatedNotesFooter already implements click-to-navigate for linked notes. Clicking a related note:
1. Calls `selectNode(path)` → highlights in graph
2. Calls `openNote(path)` → loads & displays in editor
3. Related notes footer updates to show new note's links

**Not yet implemented**: Wiki-style [[link]] parsing in markdown body. The app currently only shows links defined in frontmatter YAML. Inline link detection code exists in the Rust core (InlineLink struct), but the React UI doesn't render clickable inline links in the editor.

---

