# React Frontend Architecture — BrainMap

> Research document mapping the complete React/TypeScript frontend at `crates/app/src/`.

---

## 1. Component Hierarchy

### Entry Point

```
main.tsx
  └─ <React.StrictMode>
       └─ <App />
```

`main.tsx` also conditionally loads `tauri-plugin-mcp` listeners in dev mode for GUI automation/testing.

### App Component (`App.tsx`)

The top-level `App` component acts as:
- **Router**: If no workspace is open (`info === null`), renders `<SegmentPicker />`; otherwise renders `<AppLayout />`.
- **Event hub**: Subscribes to `brainmap://workspace-event` via the API bridge and routes events to active or background segments.
- **Keyboard shortcut handler**: Global `keydown` listener for all app-level shortcuts.
- **Effect orchestrator**: Applies theme, fonts, zoom, bold/italic tints, inline citation styles via CSS variables on `document.documentElement`.
- **Modal host**: Conditionally renders overlay dialogs (CommandPalette, CreateNoteDialog, ConvertToNoteDialog, CreateFolderDialog, SettingsModal, UnsavedChangesDialog, MoveToDialog, UndoToast).

### AppLayout (`components/Layout/AppLayout.tsx`)

Uses `react-resizable-panels` (v4) for a two-panel horizontal split:

```
<StatusBar />                    (if headerLayout === "elevated")
<div.app-layout-root>
  <IconSidebar />                (left icon rail)
  <Group orientation="horizontal">
    <Panel "content">            (left panel — collapsible)
      <GraphView />              (display: none/flex based on activeLeftTab)
      <FileTreePanel />
      <SearchPanel />
      <CanvasPanel />
      [SegmentSwitcher if headerLayout === "sidebar"]
    </Panel>
    <Separator />
    <Panel "editor">             (right panel)
      <TabBar /> or <SegmentSwitcher compact> + <TabBar />
      <EditorPanel />
    </Panel>
  </Group>
</div>
<VideoPipPanel />
[External drop overlay when dragging files from Finder]
```

Key design decisions:
- **All four left tabs are mounted simultaneously** with CSS `display` toggle — this preserves Cytoscape zoom/pan state across tab switches.
- **Per-tab panel sizes**: Each left tab (files/graph/search/canvas) stores its own content/editor split ratio, imperatively resized on tab switch.
- **Canvas fullscreen mode**: When `canvasFullscreen` is set, renders only `<CanvasEditor>` with no chrome.
- **Header layout variants**: "elevated" (separate bar), "merged" (segment switcher + tabs in one row), "sidebar" (header in left panel).

---

## 2. Zustand Stores

All stores use `zustand` with the `create` function (no middleware). Cross-store communication is done by calling `useXStore.getState()` from within actions.

### 2.1 workspaceStore (`stores/workspaceStore.ts`)

**State:**
- `info: WorkspaceInfo | null` — current workspace metadata (name, root, node/edge counts)
- `stats: StatsDto | null` — aggregate statistics
- `isLoading`, `error`, `switchInProgress` — transient flags
- `noteTypes: string[]` — 10 predefined note types
- `edgeTypes: string[]` — 15 predefined edge/relationship types

**Key actions:**
- `openWorkspace(path)` — calls `api.openWorkspace()`, loads stats, clears UI state
- `closeWorkspace()` — resets all stores (editor, graph, UI, undo, navigation, tabs, segment cache)
- `switchSegment(segmentId)` — orchestrates full segment switch with concurrency guard, dirty save, cache/restore, backend switch, rollback on failure
- `closeSegment(segmentId)` — saves dirty state, removes from open list, switches to next segment or full reset
- `refreshSegment()` — re-reads workspace from backend, reloads topology, marks external changes

**Patterns:**
- `switchInProgress` flag prevents concurrent segment switches and suppresses event processing during transitions
- Rollback on backend failure: restores previous segment's frontend state AND backend active workspace

### 2.2 graphStore (`stores/graphStore.ts`)

**State:**
- `nodes: Map<string, NodeDto>` — all nodes keyed by path
- `edges: EdgeDto[]` — all edges
- `workspaceFiles: string[]` — all workspace file paths (including non-graph files)
- `selectedNodePath`, `expandedNodes`, `isLoading`

**Key actions:**
- `loadTopology()` — fetches full graph + file list from backend in parallel
- `selectNode(path)` — sets selected node
- `expandNode(path)` — lazy-loads 1-hop neighbors and merges into graph (deduplicated)
- `applyEvent(event)` — delegates to `applyTopologyDiff` pure function
- `reset()` — clears all state

### 2.3 editorStore (`stores/editorStore.ts`)

**State:**
- `activeNote: NoteDetail | null` — currently displayed BrainMap note
- `activePlainFile: PlainFileDetail | null` — currently displayed plain file
- `isUntitledTab: boolean` — whether current tab is unsaved/untitled
- `editedBody`, `editedFrontmatter` — pending unsaved changes
- `isDirty`, `conflictState`, `savingInProgress` — edit tracking
- `fmUndoStack/fmRedoStack` — frontmatter-specific undo/redo with grouping (300ms window)
- `viewMode: "edit" | "preview" | "raw"` — tri-state view mode
- `rawContent`, `_rawDirty` — raw file content for "raw" view mode
- `scrollTop`, `cursorPos` — per-tab scroll/cursor position

**Key actions:**
- `openNote(path)` — snapshots current tab, auto-saves dirty state, restores or fetches note, falls back to `openPlainFile` on parse failure
- `openPlainFile(path)` — same pattern for non-markdown files
- `openUntitledTab()` / `activateUntitledTab(id)` — ephemeral scratch tabs
- `updateContent(body)` / `updateFrontmatter(changes)` — mark dirty + sync to tab store
- `saveNote()` — three save paths: raw mode, plain file, BrainMap note; auto-formats markdown tables; compares pre-save values to detect concurrent edits
- `markExternalChange()` — conflict detection (shows banner if dirty, auto-reloads if clean)
- `resolveConflict("keep-mine" | "accept-theirs")` — user resolution
- `setViewMode(mode)` — auto-saves before mode switch, fetches raw content when entering raw mode
- `clearForCustomTab()` — clears editor state when switching to PDF/Excalidraw/Canvas/Video tab

**Patterns:**
- **Snapshot-before-switch**: `snapshotToActiveTab()` captures all editor state into `tabStore` before navigating away
- **Stale async guard**: Post-fetch checks like `if (get().activeNote?.path === path)` before applying state
- **Title validation**: Refuses to save if edited title is empty string

### 2.4 tabStore (`stores/tabStore.ts`)

**State:**
- `tabs: TabState[]` — ordered list of open tabs
- `activeTabId: string | null` — currently active tab
- `_untitledCounter: number` — incrementing ID for untitled tabs

**Tab kinds:** `"note" | "plain-file" | "untitled" | "pdf" | "excalidraw" | "canvas" | "image" | "video"`

**Each TabState stores:**
- `id` (= file path or `__untitled__/N`), `path`, `kind`, `title`, `noteType`
- Per-tab editor state: `editedBody`, `editedFrontmatter`, `isDirty`, `conflictState`, `fmUndoStack/fmRedoStack`, `viewMode`, `scrollTop`, `cursorPos`

**Key actions:**
- `openTab(path, kind, title, noteType)` — inserts after active tab, deduplicates by path
- `createUntitledTab()` — creates `__untitled__/N` tab
- `closeTab(id)` / `closeOtherTabs` / `closeTabsToRight` / `closeAllTabs`
- `renamePath(oldPath, newPath)` — updates tab ID/path after move
- `renamePathPrefix(oldPrefix, newPrefix)` — bulk update after folder move
- `reorderTab(fromId, toId)` — drag-and-drop tab reordering

### 2.5 uiStore (`stores/uiStore.ts`)

The largest store — manages all UI preferences and transient UI state. Persisted to `brainmap:uiPrefs` in localStorage.

**Categories of state:**
- **Theme**: `theme` (with system detection), `effectiveTheme`, per-component themes (files, editor, excalidraw, canvas)
- **Fonts**: Independent font-family + font-size for UI, editor, headers, tooltips, canvas
- **Layout**: `headerLayout` (elevated/merged/sidebar), `leftPanelCollapsed`, `activeLeftTab`, `panelSizes`
- **Graph**: `graphLayout` (force/hierarchical/radial/concentric/grouped), `graphFocusPath/Kind`, `hiddenEdgeTypes`, `showEdgeLabels`, `showLegend`, `showMinimap`, `showClusterHulls`, `showEdgeParticles`
- **Editor**: `focusMode`, `showLineNumbers`, `lineWrapping`, `spellCheck`, `editorIndentSize`, `viewMode`, `sourceStyle`, `exampleStyle`, `mathStyle`, `attentionStyle`, `bulletStyle`, `boldWeight/Tint`, `italicTint`, `arrowLigatures/EnabledTypes/Color`, `codeTheme`, `mermaidMaxHeight`, `relatedNotesExpanded`
- **Canvas**: 30+ canvas-specific settings (dot opacity, arrow size, edge width, card styles, sticky note options, group styles, snap-to-grid, minimap, etc.)
- **File tree**: `treeExpandedFolders`, `fileSortOrder`, `autoRevealFile`, `emptyFolders`, `customFileOrder`
- **Dialogs**: Open/close state for command palette, create note, create folder, settings, unsaved changes, convert-to-note, move dialog
- **Zoom**: `uiZoom` (0.5–2.0), applied at `document.documentElement.style.zoom`
- **Other**: `canvasFullscreen`, `videoPipPath`, `homeNotePath`, `tabReloadKeys` (ephemeral reload counters)

### 2.6 segmentStore (`stores/segmentStore.ts`)

**State:**
- `segments: Segment[]` — all known segments (persisted to `brainmap:segments` localStorage)
- `activeSegmentId: string | null`
- `openSegmentIds: string[]` — currently open (loaded in backend) segments

**Segment = {id, name, path, lastOpenedAt, createdAt}** — like Obsidian vaults.

**Key actions:**
- `addSegment(name, path)` — idempotent by path, returns `{segment, created}`
- `removeSegment(id)` — deletes from list + persists
- `touchSegment(id)` — updates `lastOpenedAt`
- `addOpenSegment/removeOpenSegment` — track which segments are loaded
- `getSegmentByPath(path)` — lookup by normalized path

**Side effects:** `syncDockMenu(segments)` calls Tauri `update_dock_menu` command to update macOS dock right-click menu.

### 2.7 navigationStore (`stores/navigationStore.ts`)

Simple browser-like history (max 100 entries):
- `history: string[]`, `cursor: number`, `_navigating: boolean`
- `push(path)` — deduplicates consecutive, truncates forward entries
- `goBack()` / `goForward()` — navigate with rollback on failure
- `_navigating` flag prevents `push()` from recording during programmatic navigation

### 2.8 undoStore (`stores/undoStore.ts`)

File-operation undo/redo (max 20 entries):

**Undoable actions:**
- `create-note`, `create-folder`, `delete-note`, `delete-folder`, `move-note`, `move-folder`

**Features:**
- Snapshots note content before deletion for full restore
- Restores outgoing links when undoing delete
- Refuses to undo create-note if note has been modified since creation
- Toast notifications for undo/redo feedback
- `isProcessing` guard prevents concurrent undo/redo

### 2.9 segmentStateCache (`stores/segmentStateCache.ts`)

In-memory cache for multi-segment state management:

**SegmentSnapshot** captures all workspace-scoped state from all 7 stores:
- workspaceStore: info, stats
- graphStore: nodes, edges, workspaceFiles, selectedNodePath, expandedNodes
- editorStore: all editing state (note, body, frontmatter, dirty flags, undo stacks, view mode, scroll/cursor)
- tabStore: tabs, activeTabId, untitledCounter
- undoStore: undo/redo stacks
- navigationStore: history, cursor
- uiStore (workspace-scoped): hiddenEdgeTypes, graphFocus, treeExpandedFolders, emptyFolders, activeLeftTab, leftPanelCollapsed, homeNotePath, customFileOrder

**API:**
- `cacheCurrentState(segmentId)` — snapshot all stores
- `restoreCachedState(segmentId)` — restore snapshot into all stores
- `applyEventToSnapshot(segmentId, event)` — apply file watcher events to background segment's cached graph data
- `hasDirtyUntitledTabs()` — checks active + all cached segments (for `beforeunload`)
- Deep cloning (Map, Set, structuredClone for tabs) prevents aliasing bugs
- Transient flags (`savingInProgress`, `isLoading`, `_navigating`) always restored as `false`

### 2.10 graphDiff (`stores/graphDiff.ts`)

Pure function `applyTopologyDiff(state, event)` handles all 6 event types:
- `node-created/updated/deleted`, `edge-created/deleted`, `topology-changed`, `files-changed`
- Used by both `graphStore.applyEvent` (live) and `segmentStateCache.applyEventToSnapshot` (background)
- Edge deduplication safety net for double-emit from command + watcher

---

## 3. API Bridge

### Interface (`api/types.ts`)

`BrainMapAPI` interface defines 29 methods covering:
- **Workspace**: `openWorkspace`, `switchWorkspace`, `closeWorkspace`, `refreshWorkspace`
- **Graph**: `getGraphTopology`, `getNodeSummary`, `getNeighbors`, `getStats`
- **Notes**: `readNote`, `createNote`, `updateNote`, `deleteNote`, `duplicateNote`, `writeRawNote`, `convertToNote`
- **Files**: `listWorkspaceFiles`, `createPlainFile`, `readPlainFile`, `writePlainFile`, `deletePlainFile`
- **Links**: `createLink`, `deleteLink`, `listLinks`
- **Search**: `search` (with filters: note_type, tag, status)
- **Folders**: `createFolder`, `deleteFolder`
- **Move**: `moveNote`, `movePlainFile`, `moveFolder`
- **Media**: `resolveImagePath`, `resolveVideoPath`, `resolvePdfPath`, `loadPdfHighlights`, `savePdfHighlights`
- **OS integration**: `revealInFileManager`, `openInDefaultApp`
- **Import**: `importFiles`
- **Events**: `onEvent(callback)` → returns unsubscribe function

### Bridge Selection (`api/bridge.ts`)

```typescript
function isTauri(): boolean {
  return "__TAURI_INTERNALS__" in window || "__TAURI__" in window;
}

// Cached singleton — lazy init, cached after first call
export async function getAPI(): Promise<BrainMapAPI> { ... }
```

- **Tauri detected** → `TauriBridge` (real Tauri `invoke` calls)
- **No Tauri** → `MockBridge` (in-memory from seed JSON, for browser dev)

### TauriBridge (`api/tauri.ts`)

Each method maps to a Tauri `invoke("command_name", { params })` call:

| API Method | Tauri Command | Notes |
|---|---|---|
| `openWorkspace(path)` | `open_workspace` | |
| `switchWorkspace(root)` | `switch_workspace` | |
| `closeWorkspace(root)` | `close_workspace` | |
| `refreshWorkspace()` | `refresh_workspace` | |
| `getGraphTopology()` | `get_graph_topology` | |
| `getNodeSummary(path)` | `get_node_summary` | |
| `readNote(path)` | `get_node_content` | Name mismatch: readNote → get_node_content |
| `listNodes(filters)` | `list_nodes` | Wraps in `{ params }` |
| `createNote(params)` | `create_node` | Wraps in `{ params }` |
| `updateNote(params)` | `update_node` | Wraps in `{ params }` |
| `deleteNote(path, force)` | `delete_node` | |
| `createLink(...)` | `create_link` | Wraps in `{ params }` |
| `deleteLink(...)` | `delete_link` | |
| `listLinks(...)` | `list_links` | Wraps in `{ params }` |
| `search(query, filters)` | `search_notes` | Wraps in `{ params }` |
| `getNeighbors(...)` | `get_neighbors` | Wraps in `{ params }` |
| `getStats()` | `get_stats` | |
| `createFolder(path)` | `create_folder` | |
| `deleteFolder(path, force)` | `delete_folder` | |
| `listWorkspaceFiles()` | `list_workspace_files` | |
| `createPlainFile(path, body)` | `create_plain_file` | |
| `deletePlainFile(path)` | `delete_plain_file` | |
| `readPlainFile(path)` | `read_plain_file` | |
| `resolveImagePath(path)` | `resolve_image_path` | |
| `resolveVideoPath(path)` | `resolve_video_path` | |
| `resolvePdfPath(path)` | `resolve_pdf_path` | |
| `loadPdfHighlights(pdfPath)` | `load_pdf_highlights` | |
| `savePdfHighlights(...)` | `save_pdf_highlights` | |
| `writePlainFile(path, body)` | `write_plain_file` | |
| `writeRawNote(path, content)` | `write_raw_note` | |
| `convertToNote(path, noteType)` | `convert_to_note` | |
| `moveNote(old, new)` | `move_note` | |
| `movePlainFile(old, new)` | `move_plain_file` | |
| `moveFolder(old, new)` | `move_folder` | |
| `revealInFileManager(path)` | `reveal_in_file_manager` | |
| `openInDefaultApp(path)` | `open_in_default_app` | |
| `duplicateNote(path)` | `duplicate_note` | |
| `importFiles(src, target)` | `import_files` | |

**Event subscription:** `listen<WorkspaceEvent>("brainmap://workspace-event", cb)` via `@tauri-apps/api/event`.

### Generated DTOs (`api/generated/`)

28 TypeScript types auto-generated from Rust via `ts-rs`:
- `NodeDto`, `EdgeDto`, `TypedLinkDto`, `NoteDetailDto`, `PlainFileDto`, `PdfMetaDto`
- `GraphTopologyDto`, `SubgraphDto`, `WorkspaceInfoDto`, `StatsDto`
- `SearchResultDto`, `SearchParams`, `NodeSummaryDto`
- Parameter types: `CreateNoteParams`, `UpdateNoteParams`, `LinkParams`, `ListLinksParams`, `ListNodesParams`, `NeighborsParams`
- Result types: `MoveNoteResultDto`, `MoveFolderResultDto`, `DeleteFolderResultDto`, `ImportResultDto`, `ImportFailureDto`, `ExternalBacklinkDto`

Regenerate with: `cargo test export_ts_bindings` in `crates/app/src-tauri/`.

### Hand-written Types

- `WorkspaceEvent` — discriminated union with 7 event types (node-created/updated/deleted, edge-created/deleted, topology-changed, files-changed), each with optional `workspace_root` for multi-segment routing
- `SearchFilters` — optional note_type, tag, status
- `BrainMapAPI` — the full interface (not auto-generated)
- `PdfHighlight`, `HighlightRect` — PDF annotation types

---

## 4. Editor Components

### Tab Kind → Editor Component Mapping

| Tab Kind | Component | Description |
|---|---|---|
| `"note"` | `MarkdownEditor` + `FrontmatterForm` + `RelatedNotesFooter` | Full BrainMap note editor |
| `"plain-file"` | `MarkdownEditor` (no frontmatter) | Plain text/markdown files |
| `"untitled"` | `MarkdownEditor` (simplified, no metadata) | Scratch pad |
| `"pdf"` | `PdfViewer` | PDF viewer with highlights |
| `"excalidraw"` | `ExcalidrawEditor` | Excalidraw whiteboard |
| `"canvas"` | `CanvasEditor` | React Flow canvas |
| `"image"` | `ImageViewer` | Image display |
| `"video"` | `VideoViewer` | HTML5 video player |

### EditorPanel (`components/Editor/EditorPanel.tsx`)

Router component that dispatches to the correct editor based on `activeTab.kind`:
1. Checks tab kind → renders specialized viewer (PDF, Excalidraw, Canvas, Image, Video)
2. Falls through to check `activePlainFile` → plain file editor
3. Falls through to check `isUntitled` → untitled tab editor
4. Falls through to `activeNote` → full BrainMap note editor
5. Empty state → "Select a note to start exploring"

All text-based views support tri-state view mode (Edit/Preview/Raw).

### MarkdownEditor

CodeMirror 6 editor with extensions:
- `cmMarkdownDecorations` — inline formatting decorations
- `cmCheckboxDecorations` — interactive checkboxes
- `cmBulletDecorations` — customizable bullet styles
- `cmArrowDecorations` — arrow ligatures (→, ←, etc.)
- `cmLinkNavigation` — clickable wiki-links and URLs
- `cmContextMenu` — right-click context menu
- `cmSmartPaste` — intelligent paste handling
- `cmCopyReference` — copy note reference
- Callout types (`calloutTypes.ts`) with preprocessing (`calloutPreprocess.ts`)
- Inline source rendering (`remarkInlineSource.ts`)

### FrontmatterForm

Editable metadata section with:
- Title input, Type select, Status select
- `TagInput` — pill-based tag editor
- Source, Summary (textarea)
- `ExtraFieldsEditor` — key-value pairs for custom frontmatter fields
- Undo/redo via `fmUndoStack/fmRedoStack` with 300ms grouping

### Supporting Components

- `EditorToolbar` — formatting buttons (bold, italic, etc.)
- `DocumentOutline` — heading-based table of contents from CodeMirror state
- `MarkdownPreview` — rendered markdown preview
- `RelatedNotesFooter` — shows incoming/outgoing links
- `TabBar` — tab strip with drag-and-drop reordering
- `tableFormatter` — auto-formats markdown tables on save

---

## 5. Graph Visualization

### GraphView (`components/GraphView/GraphView.tsx`)

Cytoscape.js integration with:

**Layout engines:**
- `cytoscape-fcose` — force-directed (default)
- `cytoscape-dagre` — hierarchical/tree layout (LR direction, filters to directional rels only)
- Radial — concentric from most-connected or home node
- Concentric — by degree
- Grouped — by note_type

**Features:**
- Node styling by `note_type` (color + shape via `graphStyles.ts`)
- Node icons via SVG data URIs (`graphIcons.ts`)
- Node sizing by in-degree
- Directed edges for specific relationship types (precedes, causes, extends, etc.)
- Edge label visibility (toggle, always show on connected edges of selected node)
- Color legend overlay (`GraphLegend.tsx`)
- Graph focus/filtering (`graphFocusFilter.ts` — pure function with 9 unit tests)
- Cluster hulls (`graphHulls.ts` — convex hulls around same-type node groups)
- Edge particles animation (`graphParticles.ts`)
- Minimap toggle
- Graph toolbar (`GraphToolbar.tsx`) — layout selector, toggles, focus controls

**Focus mode:** Right-click note/folder in Files → `graphFocusPath/graphFocusKind` → filters graph to subgraph. Clear via "Focus x" toolbar button or re-clicking Graph tab.

**Interactions:**
- Click node → open note in editor + select in graph
- Right-click → context menu
- Navigation via node clicks pushes to `navigationStore`

---

## 6. Panel System

### Layout Structure

```
┌─────────────────────────────────────────────┐
│ StatusBar (if elevated)                      │
├───┬─────────────┬───┬───────────────────────┤
│   │ Left Panel  │ ↔ │ Editor Panel          │
│ I │ (collapsible)│   │                       │
│ c │             │   │ TabBar                │
│ o │ Graph /     │   │ EditorPanel           │
│ n │ Files /     │   │ (dispatches by kind)  │
│   │ Search /    │   │                       │
│ S │ Canvas      │   │                       │
│ i │             │   │                       │
│ d │             │   │                       │
│ e │             │   │                       │
│ b │             │   │                       │
│ a │             │   │                       │
│ r │             │   │                       │
├───┴─────────────┴───┴───────────────────────┤
│ [VideoPipPanel floating]                     │
└─────────────────────────────────────────────┘
```

### IconSidebar (`components/Layout/IconSidebar.tsx`)

Vertical icon rail on the far left with buttons for:
- Files, Graph, Search, Canvas left-panel tabs
- Toggle left panel collapse (Cmd+B)

### Left Panel Tabs (`LeftTab` type)

| Tab | Component | Default Size |
|---|---|---|
| `"files"` | `FileTreePanel` | content: 20%, editor: 80% |
| `"graph"` | `GraphView` | content: 80%, editor: 20% |
| `"search"` | `SearchPanel` | content: 20%, editor: 80% |
| `"canvas"` | `CanvasPanel` | content: 60%, editor: 40% |

Panel sizes are stored per-tab and imperatively applied on tab switch.

### Resizable Panels

Uses `react-resizable-panels` v4:
- `<Group orientation="horizontal">` wraps content + editor panels
- `<Separator className="resize-handle-h">` between them
- Content panel is collapsible (maps to `leftPanelCollapsed` in uiStore)
- `onLayoutChanged` persists sizes per active left tab

---

## 7. Segment / Workspace Switching

### Segment Lifecycle

1. **SegmentPicker** (home screen) → user selects folder → `openWorkspace(path)` → `addSegment/touchSegment/addOpenSegment/setActiveSegmentId` → `loadTopology()`
2. **Segment switch** (via StatusBar dropdown):
   - `switchInProgress = true` (concurrency guard + event suppression)
   - Force save dirty editor state (with 2s timeout for in-flight saves)
   - `cacheCurrentState(currentSegmentId)` — snapshot all 7 stores
   - Backend: `api.switchWorkspace()` or `api.openWorkspace()` (first time)
   - Frontend: `restoreCachedState(targetId)` or clear + fresh load
   - Update `activeSegmentId`, `touchSegment`
   - On failure: rollback (restore previous cache + switch backend back)
3. **Close segment**: Save dirty state → remove from open list → switch to next (or full reset) → clean up cache + backend

### State Caching

The `segmentStateCache` module implements full state serialization:
- **Capture**: reads all 7 stores, deep-clones Maps/Sets/arrays
- **Restore**: writes all 7 stores atomically, forces transient flags to safe values
- **Background events**: `applyEventToSnapshot()` applies file watcher events to cached graph data (not live stores)
- **In-memory only**: lost on page reload (intentional — workspace re-opens from disk)

### Event Routing

In `App.tsx`, workspace events are routed by `workspace_root`:
- Events for active segment → `graphStore.applyEvent()` + editor conflict detection
- Events for background segments → `applyEventToSnapshot(segmentId, event)`
- Events during `switchInProgress` → dropped (prevents cross-segment corruption)

---

## 8. State Patterns

### Stale Async Guard

All async callbacks check the current path/note still matches before applying state:
```typescript
if (get().activeNote?.path === path) { set(...) }
```
Used in: `openNote`, `markExternalChange`, `resolveConflict`, `setViewMode` (raw content fetch).

### Dirty Tracking

- `isDirty` flag in editorStore + mirrored in `TabState`
- `savingInProgress` prevents concurrent saves
- `conflictState: "none" | "external-change"` — conflict banner when external change detected during dirty edit
- Auto-save: 1500ms debounce in `useAutoSave` hook, also saves on window blur and tab switch

### Snapshot-Before-Switch

Before any tab navigation, `snapshotToActiveTab()` captures:
- `editedBody`, `editedFrontmatter`, `isDirty`, `conflictState`
- `fmUndoStack/fmRedoStack`, `viewMode`, `scrollTop`, `cursorPos`

This is restored when switching back to the tab.

### Frontmatter Undo/Redo

Separate from CodeMirror undo:
- `fmUndoStack/fmRedoStack` in editorStore (max 50 entries)
- 300ms grouping window: rapid edits to the same field are grouped into one undo entry
- Routed by `Cmd+Z` target: `.frontmatter-form` → FM undo, `.cm-editor` → CM undo, else → file-op undo

### Save Paths

`saveNote()` has three distinct paths:
1. **Raw mode**: `writeRawNote()` + re-read note (full file content save)
2. **Plain file**: `writePlainFile()` (body only)
3. **BrainMap note**: `updateNote()` with selective params + table formatting + re-read

All paths compare post-save state to detect concurrent edits during save.

---

## 9. File Tree

### FileTreePanel (`components/Layout/FileTreePanel.tsx`)

Hierarchical file explorer built from `graphStore.workspaceFiles` + `graphStore.nodes`:

**Features:**
- `buildTree()` / `fuzzyFilterTree()` — tree construction + search filtering
- Expandable folders with `treeExpandedFolders` state in uiStore
- Sort orders: custom, name-asc/desc, modified-asc/desc
- Custom drag-and-drop reordering within folders (persisted per-segment)
- Auto-reveal: scrolls to currently active file
- Empty folders tracked via `emptyFolders` Set in uiStore

**Context Menu Actions:**
- New Note Here / New Subfolder Here / New Note in Folder
- Rename, Delete, Move To, Duplicate
- Reveal in Finder, Open in Default App
- Focus in Graph (right-click → graph focus)
- Convert to Note (plain file → structured note)

**Creation flows:**
- `CreateNoteDialog` — full note creation with path, title, type, tags
- `CreateFolderDialog` — folder creation with path-traversal guard
- Toolbar `+` (new note) and folder icon (new subfolder) buttons

**File icons:** `fileTreeIcons.tsx` — icon mapping by file extension and note type.

**Drag-and-drop:**
- Internal: reorder files within folder (custom sort)
- Cross-folder: move files/folders between directories
- External: `useExternalDragDrop` hook handles Finder drag-in via Tauri native drag events → `importFiles()` API

---

## 10. Canvas Architecture

### CanvasEditor (`components/Editor/CanvasEditor.tsx`)

React Flow (`@xyflow/react`) integration for `.canvas` files (JSON Canvas spec):

**Core files:**
- `CanvasEditor.tsx` — main component, state management, toolbar, save logic
- `canvasNodes.tsx` — 4 custom node types + custom edge component
- `canvasTranslation.ts` — bidirectional JSON Canvas ↔ React Flow conversion
- `canvasShapes.ts` — shape definitions for canvas cards

**Node types:**
- `CanvasFileNode` — references a workspace file, click opens in editor
- `CanvasTextNode` — inline text with markdown editing
- `CanvasLinkNode` — external URL reference
- `CanvasGroupNode` — visual grouping container

**Features:**
- Edge labels with inline editing
- Node resize with full-border drag zones
- Floating toolbar on selected nodes/edges (delete, color picker, shape)
- Bottom toolbar for adding new cards
- File browser panel (slide-out, tree view, drag files onto canvas)
- Right-click context menu
- Undo/redo via snapshot stack
- Debounced auto-save
- Canvas fullscreen mode
- Canvas-in-panel mode (left panel canvas, file node clicks open in editor)

**Context providers:**
- `CanvasPanelModeContext` — panel vs. tab behavior
- `CanvasSaveContext` — `scheduleSave` callback for child components
- `CanvasSnapshotContext` — `pushSnapshot` for undo
- `CanvasPathContext` — canvas file path for relative operations

**Error handling:** `CanvasErrorBoundary` catches rendering errors with error message display.

### CanvasPanel (`components/Canvas/CanvasPanel.tsx`)

Left-panel canvas mode — wraps `CanvasEditor` with `CanvasPanelModeContext = true`, so file node clicks navigate the editor panel instead of the canvas.

### Data Flow

```
.canvas file (JSON Canvas spec)
  ↓ read via api.readPlainFile()
  ↓ parse JSON
canvasToFlow(jsonCanvas) → {nodes, edges, viewport}  (canvasTranslation.ts)
  ↓
React Flow state (useNodesState, useEdgesState)
  ↓ on change
flowToCanvas(nodes, edges, viewport) → JsonCanvas  (canvasTranslation.ts)
  ↓
api.writePlainFile() → debounced save
```

---

## 11. Hooks

### useAutoSave (`hooks/useAutoSave.ts`)
- 1500ms debounce after edit
- Saves on window blur
- Clears timer on tab switch
- Skips untitled tabs and empty-title saves
- Subscribes to editorStore changes

### useHomeAutoFocus (`hooks/useHomeAutoFocus.ts`)
- On workspace load, focuses graph on home/index note

### useExternalDragDrop (`hooks/useExternalDragDrop.ts`)
- Handles Finder file drag events via Tauri native drag API
- Tracks `externalDragOver`, `dragFileCount`, `externalDropTarget`
- Imports files via `api.importFiles()`

---

## 12. Utilities

- `logger.ts` — `log.error/warn/info/debug(target, msg, fields?)` → Tauri `write_log` command (persisted to `~/.brainmap/logs/`)
- `slugify.ts` — path-safe slug generation
- `fuzzyMatch.ts` — fuzzy string matching for search/autocomplete
- `extractTitleBody.ts` — parse title + body from markdown content
- `resolveNotePath.ts` — resolve relative note paths
- `fileExtensions.ts` — file extension → tab kind mapping
- `fileTreeDnd.ts` — drag-and-drop utilities
- `fileTreeRename.ts` — rename validation
- `homeNoteDetect.ts` — detect home/index notes
- `pdfCoords.ts` — PDF coordinate utilities

---

## 13. Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd+P` | Open command palette |
| `Cmd+N` | New untitled tab |
| `Cmd+W` | Close tab (with save/prompt logic) |
| `Cmd+S` | Save (note, canvas, excalidraw, or save-as for untitled) |
| `Cmd+B` | Toggle left panel (unless in CM editor → bold) |
| `Cmd+,` | Open settings |
| `Cmd++/=` | Zoom in |
| `Cmd+-` | Zoom out |
| `Cmd+0` | Reset zoom |
| `Cmd+Shift+R` | Refresh segment |
| `Cmd+Z` | Undo (routed: frontmatter → FM undo, CM → CM undo, else → file-op undo) |
| `Cmd+Y/Shift+Z` | Redo (same routing) |
| `Cmd+[` | Navigate back |
| `Cmd+]` | Navigate forward |
| `Escape` | Close topmost dialog/mode |

---

## 14. Event System

### Workspace Events (Backend → Frontend)

Events arrive via Tauri event `brainmap://workspace-event` with `WorkspaceEvent` payload:

| Event Type | Payload | Frontend Handling |
|---|---|---|
| `node-created` | `{path, node, workspace_root?}` | Graph: add node + file |
| `node-updated` | `{path, node, workspace_root?}` | Graph: update node; Editor: conflict detection |
| `node-deleted` | `{path, workspace_root?}` | Graph: remove node + edges + file |
| `edge-created` | `{edge, workspace_root?}` | Graph: add edge |
| `edge-deleted` | `{edge, workspace_root?}` | Graph: remove edge |
| `topology-changed` | `{added/removed nodes/edges, workspace_root?}` | Graph: batch update with dedup |
| `files-changed` | `{added/removed files, workspace_root?}` | Files list update; canvas/excalidraw reload bump |

### Custom DOM Events (Frontend-internal)

| Event | Purpose |
|---|---|
| `excalidraw:save` | Trigger Excalidraw save from Cmd+S |
| `canvas:save` | Trigger Canvas save from Cmd+S |

### Tauri Events (System)

| Event | Purpose |
|---|---|
| `brainmap://dock-open-segment` | macOS dock menu segment selection |
| `brainmap://dock-open-folder` | macOS dock menu "Open Folder" |

---

## 15. Frontend ↔ Backend Boundary Cross-Reference

This section cross-references the frontend API bridge with findings from the Rust backend research.

### Command Coverage

The frontend's `TauriBridge` calls **36 of 38** registered Tauri commands. The two commands called directly (not through the `BrainMapAPI` interface):
- `write_log` — called by the frontend logger (`utils/logger.ts`) to forward frontend logs to the backend tracing system
- `update_dock_menu` — called from `segmentStore.ts` to sync the macOS dock right-click menu with known segments

### Backend Architecture (Summary)

- **Commands layer**: `commands.rs` (thin `#[tauri::command]` wrappers) → `handlers.rs` (business logic)
- **State**: `State<AppState>` with per-slot locking: `RwLock<HashMap<String, Arc<Mutex<WorkspaceSlot>>>>` keyed by canonicalized root path
- **Error handling**: All commands return `Result<T, String>` — `BrainMapError` converted via `.to_string()`
- **Root resolution**: Commands call `state.resolve_root(None)` for active root, or accept explicit root parameter

### DTO Cross-Reference

Backend DTOs (from `crates/app/src-tauri/src/dto.rs`) confirmed to match frontend generated types:

| Backend DTO | Frontend Type | Notes |
|---|---|---|
| `NodeDto { path, title, note_type, tags?, modified?, summary? }` | `NodeDto` | Optional fields match |
| `EdgeDto { source, target, rel, kind }` | `EdgeDto` | `kind` is string: "Explicit"/"Implicit"/"Inline" |
| `NoteDetailDto { path, title, note_type, tags, status?, ..., links, extra, body }` | `NoteDetailDto` | `extra` uses YAML↔JSON conversion |
| `GraphTopologyDto { nodes, edges }` | `GraphTopologyDto` | Direct mapping |
| `PlainFileDto { path, body, binary }` | `PlainFileDto` | `binary` flag for non-text files |
| `PdfMetaDto { path, absolute_path, size_bytes }` | `PdfMetaDto` | Used for PDF, image, and video path resolution |

YAML↔JSON conversion (`yaml_to_json()` / `json_to_yaml()`) handles the `extra` frontmatter field across the IPC boundary.

### Event Cross-Reference

Backend emits events on `"brainmap://workspace-event"` with these confirmed payload structures:

| Event | Backend Payload | Frontend Type |
|---|---|---|
| `topology-changed` | `{ type, workspace_root, added_nodes: [NodeDtoPayload], removed_nodes: [string], added_edges: [EdgeDtoPayload], removed_edges: [EdgeDtoPayload] }` | Matches `WorkspaceEvent` union |
| `node-updated` | `{ type, workspace_root, path, node: NodeDtoPayload }` | Matches |
| `files-changed` | `{ type, workspace_root, added_files: [string], removed_files: [string] }` | Matches |

**Event decomposition**: The backend only emits 3 event types: `topology-changed`, `node-updated`, and `files-changed`. The frontend's finer-grained types in the `WorkspaceEvent` union (`node-created`, `node-deleted`, `edge-created`, `edge-deleted`) are decomposed from `topology-changed` based on which arrays are populated (`added_nodes`, `removed_nodes`, `added_edges`, `removed_edges`). The frontend `graphDiff.ts` handles all variants uniformly.

**Dual emission**: Events are emitted both by the file watcher AND by command handlers (e.g., `create_node`, `update_node`, `delete_node`, `create_link`, `delete_link`). The frontend's `graphDiff.ts` includes edge deduplication as a safety net for this double-emit pattern.

**Expected writes set**: The backend tracks self-triggered file changes to prevent the watcher from re-processing them, reducing but not eliminating duplicate events.

### Multi-Segment Protocol

Frontend protocol confirmed to match backend:
1. `open_workspace(path)` → opens workspace slot, sets as active root
2. `switch_workspace(root)` → changes active root to already-opened slot
3. `close_workspace(root)` → closes workspace slot, removes from HashMap

Frontend side: `segmentStateCache` handles snapshot/restore of all 7 Zustand stores. Backend side: per-slot `Arc<Mutex<WorkspaceSlot>>` with canonicalized paths.

### Name Mismatches

One confirmed naming asymmetry across the boundary:
- Frontend `readNote(path)` → Backend command `get_node_content` (not `read_note`)

This is intentional — the backend uses "node" terminology while the frontend abstracts this to "note" in the API interface.
