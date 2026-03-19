# BrainMap Changelog

Feature history moved from CLAUDE.md. Organized by phase and feature area.

## Editor — Attention Callout

- **Block callout**: `[!attention] Title { ... }` renders with amber-orange (#ff6b35) border, TriangleAlert icon, cursor-aware header widget, and fold support.
- **Inline citation**: `[!attention some text]` with 4 toggleable display styles (underline, pill, icon, quotes) — same as source/example/math.
- **Settings**: "Attention citations" style selector in Settings modal.
- **Preview**: Styled inline rendering in MarkdownPreview via remarkInlineSource plugin.

## Final Polish — Settings & File Management

Five remaining features:

- **Move to... modal**: Right-click file/folder → "Move to..." opens a dialog with folder search/autocomplete. Select a destination folder to move the item.
- **Open in Default App**: Right-click → "Open in Default App" opens the file in its system default application via Tauri shell plugin.
- **Spell checking**: Native browser spell check enabled via `spellcheck="true"` on CodeMirror content. Toggle in Settings.
- **Line wrap toggle**: `EditorView.lineWrapping` now conditional on Settings toggle (default: on).
- **Indent size**: Configurable indent size (2/4/8 spaces) via `indentUnit` facet. Select in Settings.

## Files Panel — Phase A

Eight file management features to close the Obsidian gap:

- **Show in Finder**: Right-click file/folder → "Show in Finder" reveals in macOS Finder (or platform equivalent).
- **Copy file path**: "Copy Relative Path" and "Copy Absolute Path" context menu items for files and folders.
- **Collapse all**: Toolbar button clears all expanded folders.
- **Auto-reveal active file**: When opening a note from graph/search/links, the file tree auto-expands parents and scrolls to the file. Togglable in settings.
- **Sort order**: Dropdown in tree toolbar — Name A→Z, Name Z→A, Modified ↓, Modified ↑. Requires `modified` field added to `NodeDto` (full Rust chain: `NodeData` → `NodeDto`).
- **Move to trash**: File deletion now moves to system trash (macOS Trash, Windows Recycle Bin) instead of permanent deletion. Uses `trash` crate in the Tauri app layer.
- **Duplicate**: Right-click note → "Duplicate" creates a copy with " (copy)" suffix and opens it.
- **Modified timestamp in graph**: `NodeData` and `NodeDto` now include `modified: Option<NaiveDate>` / `modified: string | null`, enabling timestamp-based features.

Backend: `trash` crate added, `reveal_in_file_manager` + `duplicate_note` Tauri commands. Frontend: sort dropdown, collapse button, auto-reveal, 7 new context menu items.

## Editor Phase C2 — Polish

Three editor polish features:

- **Heading folding**: Content under headings can be collapsed/expanded via fold gutter arrows. Folds from heading to the next heading at same-or-higher level. Skips headings inside fenced code blocks.
- **Unified context menu**: Right-click shows a single context-aware menu: Cut/Copy/Paste, formatting options when text is selected, Copy File Reference, and Format Table when cursor is in a table. Replaces two separate context menus.
- **Table insertion**: Toolbar button inserts a 3×3 markdown table at cursor.

## Editor Phase C — Slash Command Menu

Notion-style slash command menu for the CodeMirror editor:

- **Slash commands**: Type `/` at line start or after whitespace to open a command palette. Commands are grouped into sections: Headings, Lists, Blocks, BrainMap, and Callouts.
- **16 commands**: Heading 1–3, Bullet/Numbered/Task list, Blockquote, Code block, Divider, Table, Link, Inline Source citation, and all 4 callout types (AI Answer, Source, Question, Key Insight).
- **Fuzzy filtering**: Type after `/` to filter by keyword or label (e.g., `/so` shows "Inline Source" and "Source Callout").
- **No false triggers**: The `/` only activates at line start or after whitespace — URLs like `https://` and paths like `and/or` are ignored.
- **Visual polish**: Lucide SVG icons per command (13 unique), `/keyword` badges, callout-colored icon backgrounds, subtle accent-tinted selection highlight, grouped section headers. Uses CM6's `addToOptions` and `optionClass` APIs.
- Reuses existing formatting helpers (`setHeading`, `toggleLinePrefix`, `insertCallout`, etc.) and callout type definitions from `calloutTypes.ts`.

New file: `cmSlashCommands.ts` (command definitions, SVG icon registry, completion source, autocompletion factory). 20 unit tests.

## Editor Phase A — Foundational Editing

Four foundational CodeMirror 6 features added to close the gap with standard text editors:

- **Find & Replace**: Cmd+F opens find panel, Cmd+H opens find-and-replace. Styled to match all 8 app themes.
- **List auto-continuation**: Pressing Enter after `- item` or `1. item` auto-continues with the next marker. Double-Enter on an empty marker removes it. Blockquote continuation (`> `) also works. Provided by `markdown()` which includes `markdownKeymap` at `Prec.high`.
- **Bracket auto-close**: Typing `(`, `[`, `{`, or `` ` `` auto-inserts the closing pair. Quotes (`"`, `'`) intentionally excluded to avoid interfering with prose.
- **Tab indent/outdent with marker cycling**: Tab on ordered list lines indents and cycles the marker style (IntelliJ-style): `1.` → `a.` → `i.` → `1.` based on nesting depth. Shift+Tab reverses. On non-list lines, Tab/Shift+Tab indent/outdent normally.

New deps: `@codemirror/search`, `@codemirror/autocomplete`.

## Editor Phase B — Markdown-Specific Features

Four markdown-specific features to close the gap with Obsidian/Typora:

- **Smart paste**: Pasting a URL while text is selected wraps as `[selected text](url)`. Falls through to normal paste otherwise.
- **Note autocomplete**: Typing `[[` triggers an autocomplete popup with note titles and paths from the graph store. Select to insert `[[path]]`.
- **Word count**: Live word count displayed in the status bar, derived from `editedBody` via `useMemo`.
- **Document outline**: Dropdown button (`≡`) in the editor toolbar showing all headings with indentation. Click to scroll to heading. Skips headings inside fenced code blocks.

## Phase 1c — Desktop App

UX improvements shipped: fcose/dagre graph layouts, edge label toggle, resizable panels (react-resizable-panels v4), file tree (Cmd+B), focus mode (button / Escape), related notes footer, debug cleanup. Additional opportunities implemented: node sizing by in-degree, color legend overlay (Legend toggle in graph toolbar), hover tooltips on graph nodes.

### Graph/Files Tab Toggle
Obsidian-style left panel; Cmd+B switches between tabs, both panels kept mounted with CSS display toggle to preserve Cytoscape state.

### Graph Visual Overhaul
Small glowing nodes (6px base, scales by in-degree), labels hidden until ~127% zoom, thin semi-transparent edges (line-opacity 0.35), vee arrowheads, dark canvas background (#13131a). Aggressive fcose params (repulsion 75000, edge length 280, elasticity 0.30, gravity 0.04, gravityRange 5.0, numIter 2500) for better spread; edge type filter popover in graph toolbar (Edges button with active badge showing visible/total count).

### Focus in Graph
Right-click a note or folder in Files view -> "Focus in Graph" switches to Graph tab and shows only that note + direct neighbors (or all notes in a folder); focal note is visually enlarged; "Focus x" button in toolbar clears focus; clicking the active Graph tab also clears focus. Pure client-side filtering via `graphFocusFilter.ts` (no extra API calls).

116 Rust tests + 170 Vitest unit tests.

## Phase 2+3 Gaps

YAML output, 6 additional MCP tools (node_move, config_set, federation_list/add/remove, batch), 3 MCP resources, short CLI aliases (ls/new/s).

## Desktop App Features

### Settings Modal
Gear icon in StatusBar + Cmd+, opens Obsidian-style Settings modal with independent font controls for Editor (family + size, monospace presets) and Interface (family + size, sans-serif presets), plus Theme selection (light/dark/system). Preferences persisted to `brainmap:uiPrefs` localStorage. Theme now also persisted (previously reset to "system" on reload).

### Segments
Named persisted workspaces (Obsidian-style vaults); SegmentPicker home screen replaces WorkspacePicker; `segmentStore` with localStorage persistence (`brainmap:segments`); `closeWorkspace` action returns to home screen; segment name shown in StatusBar (fallback to folder basename); close button in StatusBar.

### IDE-style File/Folder Creation
Toolbar with `+` (New Note) and (New Folder) buttons; right-click context menu with "New Note Here"/"New Subfolder Here" on folders and "New Note in Folder" on notes; `create_folder` Tauri command (path-traversal-safe); `CreateNoteDialog` with Note/File mode toggle -- Note mode auto-appends `.md` and shows Title/Type/Tags fields, File mode creates plain files with any extension (rejects `.md`); `create_plain_file` Tauri command (creates parent dirs, existence check, path-traversal-safe); `CreateFolderDialog` center modal for folder creation (pre-populates path from context, replaces inline input); empty folder tracking via `emptyFolders` Set in UIStore so newly created folders without notes remain visible in the file tree (cleared on workspace reset, updated on folder deletion).

### Global Zoom
Cmd+`+`/`=` zoom in, Cmd+`-` zoom out, Cmd+`0` reset -- applies CSS `zoom` to the entire app; persisted to `brainmap:uiPrefs.uiZoom`; range 0.5-2.0 in 0.1 steps.

### Native Folder Browse Dialogs
SegmentPicker uses `@tauri-apps/plugin-dialog` for native OS folder picker; "Browse..." button in create form, "Open Folder..." buttons on home view (empty state + segment grid); `pickFolder` utility in `api/pickFolder.ts`.

### Editable Frontmatter
"Edit Metadata" collapsible section (collapsed by default) with all fields editable -- Title, Type, Status, Tags, Source, Summary, Created/Modified (read-only), Extra fields. Cmd+S saves both body and frontmatter; graph store synced on title/type changes; title validation blocks empty saves.

### Editor Visual Upgrade
Hero header with large title + colored type pill + tag chips + status dot + source attribution; both edit/preview views mounted simultaneously with CSS opacity transition (preserves CodeMirror cursor/scroll/undo); related notes as card grid with type-colored left bars; heading accent bars (h2/h3 left border); softer heading colors (accent-tinted via color-mix); blockquote background tint; editor body inset shadow; branded empty state. Unified type-color palette between file tree dots and graph nodes.

### Cmd+Click Link Navigation
Cmd+Click on inline markdown links `[label](path.md)` in the CodeMirror editor navigates to the linked note; plain click on links in preview mode navigates; visual cursor feedback (pointer on Cmd+hover); path resolution handles relative paths and URL-encoded characters; `cmLinkNavigation.ts` CodeMirror extension + `resolveNotePath.ts` utility.

### Graph Visual Upgrade (12 Enhancements)
Neighborhood highlight on hover (dim non-neighbors to 12% opacity), edge color gradients (source->target node colors via imperative styling), animated node entrance (staggered fade-in on first load), glassmorphism toolbar/legend/tooltip/popover (backdrop-filter blur), rich hover tooltip (lazy-loaded tags/summary via `get_node_summary` Tauri command with cache), label background pills, hover pulse animation, smooth layout transitions (500ms animated), Lucide SVG icon nodes (type-colored icons matching file tree, replacing abstract shapes; `graphIcons.ts` builds SVG data URIs from Lucide icon paths; transparent node background with `background-image`), cluster hulls (convex hull algorithm with cached model-coordinate geometry, drawn on canvas overlay), edge directionality particles (rAF canvas animation with golden-ratio phase offsets, auto-disable at 200+ edges), minimap (second read-only Cytoscape instance with viewport rectangle). New files: `graphHulls.ts`, `graphParticles.ts`, `graphStyles.test.ts`, `graphHulls.test.ts`, `graphIcons.ts`, `graphIcons.test.ts`.

### Link Editor UI
LinksEditor component in Edit Metadata section shows existing outgoing links with rel label + target title + remove button; add row with datalist autocomplete (all workspace notes), edge type selector (12 user-selectable types, excludes auto-generated contains/part-of/mentioned-in), duplicate detection; uses createLink/deleteLink APIs directly; `refreshActiveNote` editorStore action preserves dirty state during link operations; graph store synced via `applyEvent`.

### Editor Formatting Toolbar
Toolbar row above editor body (edit mode only) with Bold, Italic, Strikethrough, Inline Code, H1/H2/H3, Bulleted List, Numbered List, Blockquote, Link, Horizontal Rule buttons; keyboard shortcuts Cmd+B (bold), Cmd+I (italic), Cmd+Shift+X (strikethrough), Cmd+E (inline code), Cmd+K (link), Cmd+Shift+1/2/3 (headings) via CodeMirror keymap; Cmd+B is context-aware (bold in editor, sidebar toggle elsewhere); `cmFormatting.ts` pure formatting functions + `EditorToolbar.tsx` component; `toggleOrderedList` with auto-incrementing numbers.

### Related Notes Direction Grouping
RelatedNotesFooter splits edges into "Outgoing" and "Incoming" sections with group labels, per-group "show more" expansion, and directional arrow indicators. Related note hover tooltip: glassmorphism tooltip on card hover showing full title, type pill, direction + rel, status, summary, and tags; enriched data lazy-loaded via `getNodeSummary` with per-path cache.

### Create & Link in LinksEditor
When typing a non-existent note title in the Links editor, a "Create & Link" button replaces the "+" button; clicking opens CreateNoteDialog pre-filled with the title; after creation, the link is automatically added and the user stays on the current note; UIStore coordination via `createNoteMode`/`createAndLinkSource` fields (no callbacks in state).

### File/Folder Deletion
Right-click "Delete"/"Delete Folder" in Files panel with confirmation dialog; backlink warning with source list (force-delete option); unsaved changes warning; `delete_folder` Tauri command with path-traversal validation, intra-folder backlink exclusion, partial failure handling, and non-recursive directory cleanup; `ConfirmDeleteDialog` component; danger-styled context menu items; editor/graph focus auto-cleared on deletion.

### File Operation Undo/Redo
Cmd+Z / Cmd+Y (or Cmd+Shift+Z) undo/redo create-note, create-folder, delete-note, delete-folder when focus is outside CodeMirror editor; `undoStore` Zustand store with bounded command stack (20 items), full note snapshots for delete undo, two-pass folder restore (notes first, then links), `isProcessing` concurrency guard, toast notifications via `UndoToast` component; smart refusal (won't undo create if note has been modified); undo stack cleared on workspace close.

### File Tree Modernization (6 Features)
Lucide React icons for note types (10 distinct icons colored by type via `getNodeColor`) and folders (open/closed states) replacing CSS dots/chevrons; indent guides (vertical lines at each nesting level via `indent-guide` spans); note count badges on folders showing descendant count; hover actions "..." button (appears on hover, opens context menu at button position); smooth expand/collapse animation (CSS `grid-template-rows` 0fr->1fr, 150ms, with lazy mount optimization); fuzzy filter with character highlighting (`fuzzyMatch.ts` utility, greedy left-to-right scan, `<mark>` segments for matched characters). New files: `fileTreeIcons.tsx`, `fuzzyMatch.ts`.

### Auto-save
Debounced 1.5s auto-save on edit, save on note switch and window blur; `autoSave` boolean in PersistedPrefs (default: true); toggle in Settings modal Appearance section; `useAutoSave` hook with Zustand subscriptions in `hooks/useAutoSave.ts`; `openNote` awaits `saveNote()` before switching when auto-save enabled.

### Virtual Folder Nodes
Folders are first-class graph nodes (`note_type: "folder"`) auto-generated from directory structure during workspace load; `compute_folder_hierarchy` in `graph.rs` replaces old `compute_implicit_edges`; `contains` edges connect folders to direct children (notes and subfolders); notes can create explicit links targeting folder paths; `ensure_folder_nodes`/`prune_empty_folder_nodes` maintain folder nodes during incremental ops (`create_note`, `delete_note`, `add_file`, `remove_file`, `move_note`); folder nodes rendered in graph with folder icon and gray color; clicking a folder node in graph triggers focus instead of opening editor; folder nodes visible in LinksEditor autocomplete with "(folder)" suffix; `get_node_summary` handler returns synthesized summary for folder nodes.

### Custom Callout Blocks
Obsidian-compatible `> [!type]` syntax with 4 built-in types (ai-answer, source, question, key-insight); styled preview cards with Lucide icons and per-type colors; `insertCallout` formatting function; callout picker dropdown in EditorToolbar; unknown callout types render with fallback neutral styling; `calloutTypes.ts` single source of truth for type definitions; `--callout-color` CSS custom property for type-agnostic styling.

### Multi-tab Editor
Tab bar above editor showing all open files; clicking a note always opens in a new tab (never replaces); `tabStore` Zustand store manages tab array with per-tab state (editedBody, editedFrontmatter, isDirty, conflictState, fmUndoStack, fmRedoStack, viewMode, scrollTop, cursorPos); tab switch snapshots current state before switching and restores target tab state; only one CodeMirror instance mounted at a time; tab ID = file path (one tab per file); new tabs inserted after active tab; close tab activates next (or previous if last); Cmd+W closes active tab; middle-click closes tab; dirty dot indicator on tabs; auto-save always on (removed toggle); background tab external changes handled (clean tabs silently update, dirty tabs show conflict banner on switch); tab bar with horizontal scroll overflow; `TabBar.tsx` component uses `NoteTypeIcon` from `fileTreeIcons.tsx`; `viewMode` moved from EditorPanel local state to editorStore (persisted per-tab); scroll/cursor position restored on tab switch via `requestAnimationFrame`; `tabStore.reset()` called on workspace close; deleted notes/folders auto-close their tabs.

### Untitled Tabs (VS Code-style "New File")
"+" button on tab bar and Cmd+N create new untitled tabs with synthetic IDs (`__untitled__/N`); content lives only in memory until user saves via Cmd+S which opens CreateNoteDialog as "Save As"; closing an untitled tab with content shows 3-button "Save / Don't Save / Cancel" dialog (`UnsavedChangesDialog` component with promise-based resolver in `unsavedChangesPrompt.ts`); auto-save skips untitled tabs; `beforeunload` warns about unsaved untitled tabs on window close; `isUntitledTab(id)` helper exported from tabStore; `_untitledCounter` in tabStore tracks numbering; `isUntitledTab` boolean in editorStore drives EditorPanel rendering (simplified view: title + CodeMirror, no metadata/related notes); CreateNoteDialog `save-as` mode pre-fills body and closes untitled tab on success; `tabActions.ts` routes to `activateUntitledTab` for untitled next-tab navigation. New files: `unsavedChangesPrompt.ts`, `UnsavedChangesDialog.tsx`.

### Obsidian-style Layout Redesign
Three-column layout with fixed-width icon sidebar (40px, Files/Graph/Search icons with Lucide React), switchable content panel (30% default), and editor panel (70% default); `IconSidebar.tsx` component with active indicator (left border accent); `activeLeftTab` state replaces `treeOpen` boolean (default: `"files"` so app starts in Files view); `leftPanelCollapsed` state replaces search panel collapse; search moved from bottom-right vertical split to left content panel as third sidebar option; all three views (GraphView, FileTreePanel, SearchPanel) kept mounted with CSS display toggle; Cmd+B toggles content panel visibility; `toggleFocusMode` syncs `leftPanelCollapsed`; `setGraphFocus` atomically switches to graph tab.

### Per-tab Panel Sizes
Each sidebar tab (files/graph/search) has independent content/editor proportions persisted to localStorage; defaults files=20/80, graph=80/20, search=20/80; `PanelSizes` nests `TabPanelSizes` under tab keys; `getTabSizes()` helper with fallback to defaults; `savePanelSizes(tab, sizes)` API; imperative `resize()` via panel refs on tab switch; `loadStoredSizes()` migrates old flat format.

### Multi-segment Support
Multiple workspaces open simultaneously with fast switching; backend `AppState` uses per-slot locking (`RwLock<HashMap<String, Arc<Mutex<WorkspaceSlot>>>>`) so operations on different segments never contend; path canonicalization prevents duplicate slots; `open_workspace`/`close_workspace`/`switch_workspace` Tauri commands; per-slot file watchers with `workspace_root` field in events; frontend state-swap pattern (single set of Zustand stores, snapshot/restore on switch) via `segmentStateCache.ts`; `SegmentSnapshot` captures all workspace-scoped state (graph, editor, tabs, undo, navigation, UI); transient flags (`savingInProgress`, `isLoading`, `_navigating`) never captured, always restored as `false`; `applyTopologyDiff` pure function shared by live and cached event paths; `switchSegment` in workspaceStore handles save/cache/switch/restore with rollback on failure and `switchInProgress` concurrency guard; `closeSegment` saves dirty state before cleanup; segment switcher dropdown in StatusBar (open segments list, switch/close/add); IconSidebar close button uses `closeSegment`; `beforeunload` checks dirty untitled tabs across all cached segments; background segment events update cached snapshots via `applyEventToSnapshot`. New files: `segmentStateCache.ts`, `graphDiff.ts`.

### Home Note System + Graph Layout Expansion
`index`-type notes auto-detected as graph home/entrypoint on workspace open; auto-focuses graph with radial layout centered on home note; user can designate any note as home via right-click "Set as Home Note" in file tree or graph context menus; home note rendered with gold glow/ring (`node.home-node` class); Home button in graph toolbar returns to radial + focus on home note; 5 graph layouts in dropdown (Force, Hierarchical, Radial, Concentric, Grouped by Type); Radial uses Cytoscape built-in `breadthfirst` with `circle: true` centered on home/most-connected node; Concentric arranges nodes in rings by degree; Grouped by Type pre-positions nodes in type clusters then runs fcose with `randomize: false` for stable grouping; home note persisted per-workspace in `brainmap:uiPrefs.homeNotes`; `useHomeAutoFocus` hook in App.tsx for reactive auto-focus; `autoDetectHomeNote` pure utility in `utils/homeNoteDetect.ts`; `loadHomeNoteForWorkspace` exported from uiStore; `homeNotePath` in `SegmentSnapshot` for multi-segment support; `applyEventToSnapshot` clears home note if deleted node matches; `GraphLayout` type exported from uiStore. New files: `hooks/useHomeAutoFocus.ts`, `utils/homeNoteDetect.ts`, `utils/homeNoteDetect.test.ts`.

### Drag-and-drop File/Folder Moving
HTML5 native DnD in FileTreePanel for moving notes and folders between directories; `move_note` Tauri command (wires existing `Workspace::move_note` which rewrites backlinks + outgoing links); `move_folder` Tauri command with new `Workspace::move_folder` method (atomic directory rename, bulk backlink rewriting, graph reconstruction with pre-collected edge strategy); path traversal validation on both commands; `renamePath`/`renamePathPrefix` tabStore actions for tab ID updates; `move-note`/`move-folder` undoable actions with tab/editor/UI cleanup via `postMoveCleanup` helper; visual feedback (drag opacity, dashed outline on drop targets, root drop zone highlight); auto-expand collapsed folders on 600ms hover; refuses folder move if non-active dirty tabs exist; `computeNewPath`/`isValidDrop` pure utilities in `utils/fileTreeDnd.ts`; bugfix: `move_note` now rewrites the moved note's own outgoing relative link targets. New files: `utils/fileTreeDnd.ts`, `utils/fileTreeDnd.test.ts`.

### Graph Node Size Controls
Settings -> Graph Nodes section with Overall (proportional scaling of icon + label + padding), Label size (6-24px, default 11), and Label padding (0-12px, default 3) sliders plus Reset button; `buildGraphStylesheet(opts)` function in `graphStyles.ts` parameterizes Cytoscape stylesheet (label font-size, bg-padding, state selector sizes scaled by `baseNodeSize/18`); reactive `useEffect` in GraphView re-applies stylesheet + updates node `data(size)` without full graph rebuild; `nodeLabelSize`/`nodeIconSize`/`nodeLabelBgPadding` in uiStore persisted to localStorage.

### Edit-mode Markdown Prettification
GFM parser extensions enabled (`markdown({ extensions: GFM })` from `@lezer/markdown`); 9 decoration types via `cmMarkdownDecorations.ts` StateField + `cmCheckboxDecorations.ts` StateField: horizontal rules (cursor-aware border-bottom + dimmed text), checkboxes (interactive `<input type="checkbox">` replace widget with click-to-toggle, cursor-aware), blockquotes (accent left border + tinted background), fenced code blocks (background + rounded border container), inline code (background pill via syntax tree walk), strikethrough (HighlightStyle line-through + muted color), image URL dimming (cursor-aware), link markup dimming (cursor-aware brackets + URL), tables (cursor-aware rendered HTML `<table>` widget via block-level `Decoration.replace` when cursor outside table, raw markdown with line decos when cursor inside; `parseMarkdownTable` parser extracts cells/alignments/rows with escaped pipe support and delimiter validation; `TableWidget` renders `<thead>`/`<tbody>` with alignment, zebra striping, inline markdown in cells via `renderInlineMarkdown` with HTML escaping). `scanFencedBlocks` shared utility for fence-tracking state machine; `classifyLines` pure function with cached results on cursor-only moves; checkbox toggle is a normal document edit (dirty + auto-save + CM-undoable). New files: `cmMarkdownDecorations.ts`, `cmCheckboxDecorations.ts`, `cmMarkdownDecorations.test.ts`, `cmCheckboxDecorations.test.ts`.

### Inline File/Folder Rename
Right-click "Rename" in file tree context menu (folders, BrainMap notes, plain files) or F2 keyboard shortcut triggers inline `<input>` editing in the tree item; `InlineRenameInput` component with `resolvedRef` guard preventing Enter+blur / Escape+blur double-fire; `computeRenamePath` handles three file types (folders=no ext, `.md` notes=ensure `.md` + strip double, plain files=preserve original ext + strip double); `validateRenameName` checks empty/separators/dot-prefix/duplicates; `executeMoveOrRename` shared helper extracted from DnD move (API call, graph reload, tab/editor/graph/home note sync, undo push); folder rename updates `treeExpandedFolders`, `hasBeenExpanded`, and `emptyFolders` with prefix-based replacement for descendants; undo via existing `move-note`/`move-folder` action kinds; `existingPaths` duplicate detection includes graph nodes, empty folders, and workspace files. New files: `utils/fileTreeRename.ts`, `utils/fileTreeRename.test.ts`.

### Live File Tree Updates
All mutating Tauri commands (`create_node`, `update_node`, `delete_node`, `create_link`, `delete_link`, `delete_folder`, `write_raw_note`, `create_plain_file`) now emit `"brainmap://workspace-event"` topology-changed events directly after mutations, using a shared `emit_topology_event` helper in `watcher.rs`; the file watcher debounce reduced from 2s to 1s; watcher extended to also track non-`.md` file changes via new `"files-changed"` event type; frontend `applyTopologyDiff` in `graphDiff.ts` handles both event types with edge deduplication as safety net; removed all manual/optimistic graph updates from `CreateNoteDialog`, `LinksEditor`, `FileTreePanel`, `editorStore`, and `undoStore` -- the single event pathway is: backend emit -> `App.tsx` listener -> `graphStore.applyEvent()` -> `applyTopologyDiff()` -> Zustand re-render; `graphStore.createNote()` method removed; `handle_write_raw_note` returns `GraphDiff` for event emission; `NodeDto` TypeScript type extended with optional `tags` field; `move_note`/`move_folder` still use `loadTopology()` reload (event-based update deferred to follow-up); `create_folder` uses `emptyFolders` UIStore mechanism (pure filesystem op, no graph impact).

### Table Auto-formatting
`formatMarkdownTables(text)` in `tableFormatter.ts` aligns all markdown tables on save (pads columns to max width, preserves alignment colons, handles escaped pipes, skips fenced code blocks); `formatTable(lines)` formats a single table; `isTableFormatted(lines)` checks if already formatted; auto-format runs in `editorStore.saveNote()` before API call; "Format Table" hover button on unformatted table widgets (appears on hover, click formats in-place via `EditorView.domEventHandlers` with `posAtDOM` + line scanning, undoable); `parseCells`/`parseAlignment`/`DELIM_CELL_RE` exported from `tableFormatter.ts` as canonical location (used by both formatter and `cmMarkdownDecorations.ts`). New files: `tableFormatter.ts`, `tableFormatter.test.ts`.

---

130 Rust tests + 592 Vitest unit tests.
