# Editor Feature Opportunities

> Date: 2026-03-24
> Scope: Cross-editor capabilities, editor enhancements, new editor types, AI-native features

## Cross-Editor Capabilities

### 1. Universal Search & Navigation

**Current**: FTS5 search in left panel (workspace-wide). No per-editor find.

**Opportunities:**
- **In-editor find/replace** (Cmd+F/Cmd+H) — scoped to current document across all editor types
- **Breadcrumb navigation** — clickable path in editor header (e.g., `Concepts / Causality / Causal Inference`)
- **Quick switcher** — Cmd+Shift+P shows all open tabs + recently closed + fuzzy search
- **Jump to definition** — Cmd+Click links in canvas/excalidraw to navigate to referenced notes

### 2. Bookmarking & Collections

**Current**: Notes can be `home` (graph centers on home). No broader bookmarks.

**Opportunities:**
- **Bookmark toolbar** — star icon in editor header + file tree context menu
- **Collections** — ad-hoc groupings without directory hierarchy; appears as second file tree tab
- **Recent files** — menu showing recently opened files
- **Pin tabs** — lock tabs to prevent accidental closure

### 3. Split Editor Pane

**Current**: Single active editor; one tab visible at a time.

**Opportunities:**
- **Split pane** — Cmd+Shift+\ to split vertically; two tabs side-by-side
- **Compare mode** — diff view between two note versions
- **Linked views** — split pane auto-scrolls related views together

### 4. Backlinks Panel

**Current**: Related notes footer in markdown editor. Limited bidirectional feedback.

**Opportunities:**
- **Context panel** — right sidebar showing incoming edges (backlinks) grouped by relation type
- **Neighborhood explorer** — interactive sidebar; hover/click edges highlights path in graph
- **Citation context** — when note A cites B, show excerpt from B inline in A's editor

### 5. Cross-Canvas Navigation

- **Embed canvas in note** — inline `.canvas` viewer in markdown preview
- **Canvas-to-canvas links** — nodes referencing other canvases; double-click opens in new tab
- **Canvas as presentation** — slideshow mode cycling through groups/nodes
- **Dynamic canvas generation** — MCP tool to auto-generate canvas from search query or graph focus

---

## Markdown Editor Enhancements

### Already Completed
- Find & Replace, list auto-continuation, bracket auto-close, smart paste
- Note autocomplete on `[[`, word count, document outline, heading folding
- Slash commands (16), unified context menu, table insertion
- Custom callouts, inline citations, interactive checkboxes
- Cursor-aware markdown prettification, table auto-formatting

### Remaining Gaps
- **Spell checking** — browser-native but not styled/configurable
- **Code block language autocomplete**
- **Indent size configuration** (2/4/8 spaces)

### New Opportunities

| Feature | Description | Effort |
|---|---|---|
| Markdown linting | Underline common mistakes; problems panel | Medium |
| Template variables | `{{title}}`, `{{date}}` auto-expand on creation | Low |
| Live math preview | Render LaTeX `$...$` inline in edit mode | Medium |
| Table editing UI | Right-click → insert row/column; table builder | Medium |
| Dataview-like queries | Inline `::query::` blocks showing filtered graph data | High |
| Persistent outline sidebar | Complement dropdown with always-visible outline panel | Medium |
| Footnotes & references | Full footnote support with numbered anchors | Medium |
| Breadcrumb trail | Show current section heading as you scroll | Low |

---

## Canvas Editor Enhancements

### Node Type Expansion

| Node Type | Description | Effort |
|---|---|---|
| Table/data nodes | Structured data tables on canvas | Medium |
| Timeline nodes | Temporal sequences with visual layout | Medium |
| Code snippet nodes | Code blocks with syntax highlighting | Low |
| Image/media nodes | Display images, embedded videos | Medium |
| Excalidraw embed nodes | Inline `.excalidraw` drawing | Medium-High |
| Markdown nodes | Full markdown rendering (not just text) | Medium |

### Layouts & Automation

- **Automatic layouts** — flow, hierarchy, circular, radial, grid (beyond force-directed)
- **Layout templates** — pre-configured arrangements ("Story Map", "Concept Map", "Decision Tree")
- **AI-powered layout** — MCP tool: semantic clustering + fcose layout
- **Smart layout** — double-click empty area → auto-arrange selected nodes

### Presentation & Exploration

- **Presentation mode** — fullscreen cycling through nodes/groups
- **Focus zoom** — double-click node → smooth zoom to node + immediate neighbors
- **Exploration mode** — hover node → show related notes not on canvas; click to add
- **Graph overlay** — semi-transparent graph view behind canvas nodes

### Export & Integration

- **Export as image/SVG** — canvas snapshot
- **Export as Mermaid** — lossy but useful for conversion
- **Export as interactive HTML** — standalone, no backend needed
- **Embed canvas in note** — inline preview in markdown

---

## New Editor Types

### High Value

| Editor | Use Case | Key Dependency | Effort |
|---|---|---|---|
| **Data/Spreadsheet** | Structured data, CSV/TSV files | TanStack Table or react-data-grid | Medium-High |
| **Audio Waveform** | Annotate audio, mark timestamps | wavesurfer.js | Medium |
| **Markdown Slides** | Presentations from markdown | reveal.js | Medium-High |

### Medium Value

| Editor | Use Case | Key Dependency | Effort |
|---|---|---|---|
| **Timeline/Gantt** | Project management, event sequences | react-calendar-timeline | High |
| **Mind Map** | Brainstorming, visual outlines | D3 or custom | High |
| **Interactive Graph** | ` ```graph` code blocks in markdown | Existing Cytoscape | Medium |

### Lower Priority

| Editor | Use Case | Key Dependency | Effort |
|---|---|---|---|
| **3D Model Viewer** | .glb/.gltf/.obj visualization | Three.js | Medium |

---

## Knowledge Graph Integration

### Graph-Aware Editor Sidebar

- **Backlinks panel** — right sidebar showing incoming edges by relation type
- **Hover graph preview** — hover `[[link]]` → tooltip with target metadata + local subgraph
- **Auto-link suggestions** — AI-powered semantic similarity suggestions as user types
- **Orphan notes detector** — MCP tool identifying unlinked notes

### Graph-Driven Editing

- **Graph-based reorganization** — auto-create folder hierarchy from graph clusters
- **Bulk updates from graph** — select nodes → bulk edit type, tags, collections
- **Graph merge/split** — consolidate duplicate notes; split complex notes

### AI-Powered Graph Analysis

- **Community detection** — identify clusters; suggest grouping in canvases
- **Gap analysis** — identify missing links between frequently co-referenced notes
- **Citation flow** — visualize how ideas propagate through the graph
- **Relationship inference** — suggest edge types from note content

---

## AI-Native Features

### 1. AI Completions & Suggestions

Editor sidebar with AI suggestion panel. "Expand on this paragraph", "Summarize", "Outline" — all as proposals in sidebar, never auto-inserted. Leverages MCP tools.

**Effort**: Medium

### 2. Smart Linking via Semantic Search

Background embedding indexing. When creating `[[` links, show ranked suggestions by semantic similarity. Hover links show distance metric.

**Effort**: Medium-High

### 3. Note Generation from Seeds

Button "Generate note from prompt" → AI generates title, type, tags, body as draft. Optionally auto-suggests links to existing notes.

**Effort**: Medium

### 4. Semantic Search & Filtering

Embedding-based search (find notes by meaning, not just keywords). Filter by relationship type. Temporal search with date ranges.

**Effort**: Medium

### 5. AI-Powered Canvas Generation

Auto-generate canvas from search query. Semantic clustering + fcose layout. Insert nodes at calculated positions.

**Effort**: Medium-High

---

## Implementation Priority Matrix

| Feature | Effort | Impact | Priority |
|---|---|---|---|
| Backlinks panel | Medium | High | **P0** |
| Bookmarks / pin tabs | Low-Medium | Medium | **P1** |
| Auto-reveal active file in tree | Low | Medium | **P1** |
| Spell check toggle | Low | Medium | **P1** |
| Canvas export as image/SVG | Medium | High | **P1** |
| Split editor pane | High | High | **P2** |
| Data/spreadsheet editor | Medium-High | Medium | **P2** |
| AI completions sidebar | Medium | Very High | **P2** |
| Smart linking via embeddings | Medium-High | Very High | **P2** |
| Markdown linting | Medium | Medium | **P2** |
| Canvas auto-layouts | High | High | **P2** |
| Semantic search | Medium-High | High | **P2** |
| Audio editor | Medium | Low | **P3** |
| Presentation mode | Medium-High | Medium | **P3** |
| AI graph analysis | High | Medium-High | **P3** |
| Timeline/Gantt editor | High | Medium | **P3** |
| Mind map editor | High | Medium | **P3** |
| 3D model viewer | Medium | Low | **P4** |

---

## Strategic Themes

### Theme 1: Obsidian Parity
Complete remaining markdown gaps (spell check, code autocomplete, linting) and file tree features. Makes BrainMap a credible standalone markdown editor.

### Theme 2: Canvas as First-Class Citizen
Expand canvas with auto-layout, presentation mode, more node types, export. Make canvas an equal alternative to graph for exploring/organizing knowledge.

### Theme 3: AI-First Knowledge Work
Leverage LLMs and semantic embeddings for smart linking, AI completions, semantic search, AI-powered graph/canvas generation. Key differentiator from Obsidian.

### Theme 4: Data-Driven Insights
Structured data editor, timeline visualization, AI graph analysis. Turn notes into actionable intelligence.

### Theme 5: Multimodal Knowledge Capture
Audio editor, image annotation, 3D viewer. Support diverse capture formats beyond markdown.
