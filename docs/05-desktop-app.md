# BrainMap — Desktop App Specification

## Overview

The BrainMap desktop app is the primary visual interface. It provides an interactive graph visualization, a markdown editor/viewer, search, and a command palette — all in a flexible, panel-based layout.

## Layout

VS Code-style flexible panels powered by **FlexLayout** (`flexlayout-react`), which supports tabbed panels, drag-to-rearrange, split directions, and layout serialization/restoration. Users can drag, resize, split, and rearrange panels freely.

```
+-------------------------------------------+
| Menu Bar                                  |
+-------------------------------------------+
| [Graph] [Editor] [Search] [+]   (tabs)   |
+-------------+--------------+--------------+
|             |              |              |
|  Panel 1    |  Panel 2     |  Panel 3     |
|  (any view) |  (any view)  |  (any view)  |
|             |              |              |
|             |              |              |
+-------------+--------------+--------------+
| Command Palette / Status Bar              |
+-------------------------------------------+
```

### Default Layout

On first launch, the default layout is:

- **Left panel (60%)**: Graph View
- **Right panel (40%)**: Editor/Viewer (shows selected node's content)
- **Bottom bar**: Command palette + status (workspace name, node count, index status)

### Panel Types

| Panel | Description |
|-------|-------------|
| **Graph View** | Interactive force-directed graph visualization |
| **Editor** | Markdown editor with syntax highlighting and preview |
| **Search** | Full-text and filtered search with results list |
| **Node Inspector** | Frontmatter viewer/editor for the selected node |
| **Neighbors** | List view of a node's connections with edge types |
| **Path Finder** | Find and visualize paths between two nodes |

Users can open multiple instances of any panel type.

## Graph View

### Rendering

- **Library**: **Cytoscape.js** with Canvas renderer. Cytoscape.js provides built-in force-directed layouts, gesture handling (click, drag, hover, zoom, pan), stylesheet-based styling, compound nodes for clustering, and neighborhood queries. Canvas rendering is mandatory from day one to handle 500+ nodes without stutter.
- **Layout algorithm**: Force-directed (v1). Architecture supports adding hierarchical, radial, and other layouts later.
- **Nodes**: Circles/shapes representing notes. Label = note title.
- **Edges**: Lines/arrows between nodes. Directional arrows. Label = relationship type.

### Visual Configuration

All visual properties are configurable in workspace settings:

#### Node Appearance
| Property | Options | Default |
|----------|---------|---------|
| Color mapping | By type, by domain/tag, by status, custom | By type |
| Size mapping | Fixed, by connection count, by content length | Fixed |
| Shape | Circle, rectangle, diamond (per type) | Circle |
| Label | Title, filename, custom field | Title |
| Opacity | Fixed, by status (draft=faded) | Fixed |

#### Edge Appearance
| Property | Options | Default |
|----------|---------|---------|
| Color | By relationship type, single color | By type |
| Thickness | Fixed, by strength (future) | Fixed |
| Style | Solid, dashed, dotted (per type) | Solid |
| Label | Show relationship type on hover | On hover |
| Arrow | Directional arrow on target end | Yes |

#### Graph Controls
| Property | Options | Default |
|----------|---------|---------|
| Physics | Enabled/disabled (freeze layout) | Enabled |
| Clustering | Auto-detect clusters, manual groups | Off |
| Filters | Show/hide by type, tag, status, edge type | Show all |
| Depth limit | Only show nodes within N hops of selection | No limit |

### Interaction Modes

The graph toolbar includes a **Navigate/Edit mode toggle**:

- **Navigate mode** (default): Drag on a node repositions it (pins it in place). Drag on background pans the view.
- **Edit mode**: Drag between two nodes creates a link (prompts for relationship type via dropdown). Click on background creates a new node (opens the node creation dialog). Drag on a single node still repositions it.

### Interactions

| Action | Behavior |
|--------|----------|
| **Click node** | Select node. Show content in Editor panel. Highlight edges. |
| **Double-click node** | Expand: reveal connected nodes not yet visible (progressive disclosure). |
| **Right-click node** | Context menu: Open in editor, show neighbors, find paths, copy link, delete. |
| **Hover node** | Tooltip: title, type, summary, connection count. |
| **Hover edge** | Tooltip: relationship type, source -> target. |
| **Click edge** | Select edge. Highlight source and target nodes. |
| **Right-click edge** | Context menu: Delete edge, View source note, View target note. |
| **Drag node** | Navigate mode: reposition node (pins it in place). Edit mode: same behavior. |
| **Drag between nodes** | Edit mode only: create link (prompts for relationship type). |
| **Click background** | Edit mode only: create new node (opens node creation dialog). |
| **Scroll** | Zoom in/out. |
| **Click + drag background** | Navigate mode: pan the view. |
| **Ctrl+Click** | Multi-select nodes. |
| **Selection box** | Drag on background to select multiple nodes. |

### Multi-Select Bulk Actions

When multiple nodes are selected, the following bulk actions are available via toolbar or right-click context menu:

- **Bulk tag**: Apply one or more tags to all selected nodes.
- **Bulk delete**: Delete all selected nodes. Shows confirmation dialog with the count of nodes and total affected links.
- **Export subgraph**: Export the selected nodes and their interconnecting edges as a subgraph (see Export section).

### Filters Bar

A toolbar above the graph with quick filters:

```
[Type: ▼ All] [Tags: ▼ All] [Status: ▼ All] [Edge: ▼ All] [Depth: ▼ ∞] [🔍 Focus node...]
```

Filtering hides non-matching nodes/edges from the view without deleting them.

### Focus Mode

Selecting a node and pressing `F` or choosing "Focus" enters focus mode:
- Only the selected node and its neighbors (up to configurable depth) are shown.
- A breadcrumb trail shows how you navigated there.
- Press `Esc` to return to full graph.

## Editor Panel

### v1: Basic Markdown Editor

- Syntax-highlighted markdown editing (CodeMirror-based)
- **Live preview**: Toggle mode in v1 (source OR rendered, not side-by-side). Split view deferred to v2.
- **Link autocomplete**: Typing `[` triggers a fuzzy-search dropdown of note titles. Inserts standard markdown link syntax `[text](path)`. Context-aware to distinguish internal link completion from regular markdown bracket usage.
- Frontmatter is rendered as a form at the top (editable fields)
- Save: writes to the `.md` file on disk. File watcher picks up external changes.

### Future: Rich Editor

- Toolbar for formatting (bold, italic, headers, lists, links)
- Drag-and-drop link creation from graph to editor
- Block-level references
- Inline LaTeX rendering

## Search Panel

### Search Input

```
+-------------------------------------------+
| 🔍 [search query...              ] [Go]  |
| [Type: ▼] [Tags: ▼] [Status: ▼]         |
+-------------------------------------------+
| Results:                                  |
|  📄 Counterfactual Reasoning              |
|     concept · causality, reasoning        |
|     "...the ability to reason about..."   |
|                                           |
|  📄 Ch1 - Introduction                   |
|     book-note · book-of-why               |
|     "...counterfactual questions are..."  |
+-------------------------------------------+
```

- Full-text keyword search (v1)
- Filter by type, tags, status
- Click a result to open it in the Editor and highlight it in the Graph
- Results show: title, type, tags, content snippet with highlighted match

## Node Inspector Panel

A structured view of a node's metadata:

```
+-------------------------------------------+
| Node Inspector                            |
+-------------------------------------------+
| Title: Counterfactual Reasoning    [edit] |
| Type:  concept                            |
| Tags:  causality, reasoning        [edit] |
| Status: draft → [review] [final]         |
| Created: 2026-03-09                       |
| Modified: 2026-03-09                      |
| Source: The Book of Why, Ch.1      [edit] |
+-------------------------------------------+
| Outgoing Links:                           |
|   → extends: Causal Inference             |
|   → authored-by: Judea Pearl              |
| Incoming Links:                           |
|   ← contains: Ch1 - Introduction         |
| [+ Add Link]                              |
+-------------------------------------------+
| Custom Fields:                            |
|   domain: causal-ml                       |
|   maturity: foundational                  |
+-------------------------------------------+
```

Inline editing for all fields. Changes write directly to the `.md` frontmatter.

### Inspector/Editor Sync

The Inspector is **read-only** while the Editor has unsaved changes for the same node. This prevents conflicting writes to the same frontmatter. When the Editor has no unsaved changes, both the Inspector and Editor can edit the node; they stay in sync through file writes and the file watcher.

## Command Palette

`Ctrl+P` (or `Cmd+P` on macOS) opens a command palette:

```
> [type to search commands or notes...]
  📄 Counterfactual Reasoning          (open note)
  📄 Causal Inference                  (open note)
  ⚡ Create New Note                   (command)
  ⚡ Find Path Between Nodes           (command)
  ⚡ Validate Workspace                (command)
  ⚡ Export Graph                       (command)
  ⚡ Reindex                           (command)
```

Searches both notes (by title) and commands (by name). Fuzzy matching.

### Node Creation Flow

`Cmd+N` (or the "Create New Note" command) opens a creation dialog with the following fields:

- **Type** (dropdown): Select from registered note types in workspace config.
- **Title** (text input): The note title, which determines the filename.
- **Directory** (tree picker): Choose the target directory within the workspace.
- **Template** (optional dropdown): Select from available templates for the chosen type, if any are configured.

### Export

The "Export Graph" command (accessible from the command palette) exports the current graph or selected subgraph. The user picks the export format in a dialog:

- **JSON**: Full graph data including nodes, edges, metadata, and positions.
- **DOT** (Graphviz): For external visualization tools.

## Status Bar

Bottom bar showing:

```
[Masters Thesis] | 47 nodes · 123 edges | Index: ✓ up to date | Git: main (clean)
```

- Workspace name
- Node/edge counts
- Index status
- Git branch and status (if git-aware)

## File Watching

- The app watches the workspace directory for file changes using OS-native file watchers.
- Changes are **debounced** (configurable, default 2 seconds) to batch rapid edits.
- When files change externally:
  1. Re-parse affected files' frontmatter
  2. Update the in-memory graph
  3. Refresh the graph visualization smoothly (animate node/edge additions/removals)
  4. Update search index incrementally
- If performance degrades, file watching can be disabled via settings or `--no-watch` CLI flag.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+P` | Command palette |
| `Cmd+F` | Search panel focus |
| `Cmd+N` | Create new note |
| `Cmd+S` | Save current editor |
| `F` | Focus mode (graph) |
| `Esc` | Exit focus mode / close palette |
| `Cmd+1/2/3` | Switch to panel 1/2/3 |
| `Cmd+\` | Toggle sidebar |
| `Cmd+Shift+E` | Open editor for selected node |
| `Cmd+Shift+G` | Focus graph view |

All shortcuts configurable in settings.

## State Management

Frontend state is managed with **Zustand**. Zustand's lightweight API, async action support, and middleware (persistence, devtools) make it a good fit for a Tauri app with async IPC. Stores include `graphStore.ts`, `uiStore.ts`, and `workspaceStore.ts`, with Zustand subscriptions wired to Tauri event listeners for backend-pushed updates.

## Empty/Zero States

| Scenario | Behavior |
|----------|----------|
| **First launch (no workspace)** | Show a workspace picker dialog: open existing directory or create new workspace. |
| **Empty graph (workspace with no notes)** | Display onboarding prompt in the graph area: "Create your first note" with a button that opens the node creation dialog. |
| **No node selected** | Editor panel shows a placeholder: "Select a node in the graph or search results to view its content." |
| **Search with no results** | Display "No results found" message in the search results area. |

## Loading States

| Scenario | Behavior |
|----------|----------|
| **Application startup** | Show a splash screen with a progress bar while the workspace initializes (parsing files, building graph, rebuilding index). |
| **Panel data loading** | Show skeleton placeholders in panels while data is fetched from the Rust backend. |
| **Index rebuild** | Show an index rebuild indicator in the status bar (e.g., "Index: rebuilding...") with a spinner. |

## Error States

| Scenario | Behavior |
|----------|----------|
| **Malformed frontmatter** | Node appears in the graph with a warning badge. Clicking it shows validation details in the Inspector. |
| **Broken links** | Links to non-existent targets render as dashed red edges in the graph. |
| **File permission errors** | Show a toast notification with the error details (e.g., "Cannot save: permission denied on file.md"). |
| **Workspace directory missing** | Show a recovery dialog: "Workspace directory not found. [Relocate] [Close Workspace]". |

## Undo/Redo

- **Editor changes**: Standard `Ctrl+Z` / `Ctrl+Shift+Z` undo/redo within the CodeMirror editor.
- **Destructive graph operations**: Delete node and delete edge are not undoable via `Ctrl+Z`. Instead, these operations show a confirmation dialog before executing. The dialog displays the node title (or edge description) and the count of affected links.

## External Edit Conflict Resolution

When the file watcher detects that a file has changed externally:

- **If the Editor has no unsaved changes for that file**: Auto-reload the file content silently.
- **If the Editor has unsaved changes for that file**: Show a banner at the top of the Editor: "File changed externally. [Show Diff] [Keep Mine] [Accept Theirs]". This follows the VS Code conflict resolution pattern.

This is a guaranteed real-world scenario given the MCP server can write to files while the desktop app is open.

## Window Management

- **v1**: Single window only. Multi-window and panel detachment deferred to a future version.
- **Panel layout persistence**: The current panel layout is saved to `.brainmap/ui-state.json` on close and restored on reopen.

## Graph Viewport Persistence

The graph's zoom level and pan position are saved per session in `.brainmap/ui-state.json`. When the user reopens the app, the graph restores to the last viewport position. Switching between focus mode and full graph preserves independent viewport states.

## Theming

- Light and dark themes.
- System theme auto-detection.
- Graph colors are independent of UI theme (configured per-workspace).

## Accessibility

- **Keyboard graph navigation**: The Neighbors panel serves as the accessible entry point for keyboard-only users to navigate the graph. Selecting a neighbor in the list is equivalent to clicking a node in the graph.
- **Focus trapping**: The command palette traps focus when open; `Esc` dismisses it and returns focus to the previous element.
- **ARIA roles**: All panels have appropriate ARIA roles (`region`, `navigation`, `search`, etc.) and labels.
- **Color contrast**: Configurable graph colors must meet WCAG AA contrast requirements. The default color schemes are designed to satisfy this. Custom color configurations show a contrast warning if they fall below the threshold.

## Federation UI

Federation (cross-workspace references) UI is explicitly **deferred to Phase 4**. The core architecture supports federation, but the desktop app will not expose federation features until Phase 4. This includes federated node rendering in the graph, cross-workspace link navigation, and federated search results.
