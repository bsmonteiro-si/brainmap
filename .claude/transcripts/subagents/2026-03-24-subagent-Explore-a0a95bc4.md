# 2026-03-24 — Subagent Transcript: Explore

**Date:** 2026-03-24 17:32:16
**Agent:** Explore
**Agent ID:** a0a95bc4887456989
**Parent Session:** 354780ee-2ed0-4f1e-a951-577c7c631feb

---

## User

You are researching feature opportunities for the BrainMap desktop app's editor system. BrainMap is a structured markdown → interactive visual knowledge graph tool (like Obsidian but AI-first). It has multiple editor types: markdown notes (CodeMirror), canvas (React Flow), Excalidraw drawings, video viewer, PDF viewer, and plain files.

Read these files to understand current capabilities:
1. /Users/bsmonteiro/Desktop/Personal/brainmap/docs/CHANGELOG.md
2. /Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides/add-file-type-editor.md
3. /Users/bsmonteiro/Desktop/Personal/brainmap/docs/canvas-architecture.md
4. /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx
5. /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx
6. /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx
7. Glob for all files under /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/
8. /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts
9. /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabActions.ts
10. /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts
11. Read the data model doc: /Users/bsmonteiro/Desktop/Personal/brainmap/docs/02-data-model.md
12. Read the App.tsx and App.css for overall layout understanding

Also read the existing research docs:
- Glob for /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/research/*.md

Research and propose feature opportunities in these categories:

**Cross-Editor Features:**
- What shared capabilities should work across all editor types? (e.g., search, bookmarks, split view)
- What interactions between different file types are missing? (e.g., embedding canvas in notes, linking from canvas nodes to other canvases)

**Markdown Editor Enhancements:**
- What do tools like Obsidian, Notion, Logseq offer that BrainMap doesn't?
- Slash commands, backlinks panel, outline view, live preview of links, transclusion?
- Table editing, callout blocks, code block execution?

**Canvas Editor Enhancements:**
- What's missing vs Obsidian Canvas? (groups behavior, minimap, zoom to fit, node types)
- What could be added beyond Obsidian? (AI-generated layouts, semantic grouping, timeline view?)
- What about canvas templates or canvas-to-markdown export?

**New Editor Types:**
- What other file types would be valuable? (e.g., CSV/data tables, Mermaid diagrams, Markdown slides/presentations, audio files, image annotation)
- What would an AI-native editor look like? (e.g., AI chat embedded in editor, semantic search within document, auto-linking suggestions)

**Integration Opportunities:**
- How could editors integrate better with the knowledge graph?
- Could the graph view be embedded in editors?
- How could MCP tools enhance the editor experience?

Write your findings as a detailed markdown report. Do NOT write the file - just return the full markdown content to me. Structure it as:
## Feature Opportunities Report
### Cross-Editor Capabilities
### Markdown Editor Enhancements
### Canvas Editor Enhancements
### New Editor Types
### Knowledge Graph Integration
### AI-Native Features
### Implementation Priority Matrix (effort vs impact)

---

## Assistant

I'll systematically research the BrainMap editor architecture and capabilities to identify feature opportunities. Let me start by gathering the key files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/CHANGELOG.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides/add-file-type-editor.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/canvas-architecture.md"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/*.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/research/*.md"}`

---

## Assistant

Let me continue reading the key research files and then the core implementation files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts","limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx","limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/02-data-model.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/research/editor-gap-analysis.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/research/canvas-integration.md"}`

---

## Assistant

Now let me read a few more key implementation files to understand the current state better.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/research/files-panel-gap-analysis.md"}`

---

## Assistant

Perfect. Now I have comprehensive coverage of the BrainMap editor system. Let me compile the research findings into a detailed feature opportunities report.

## Feature Opportunities Report

### Executive Summary

BrainMap has a mature, well-architected editor system with 7 distinct editor types (markdown, plain files, PDF, Excalidraw, Canvas, images, video) and 969 Vitest tests validating the system. The platform has completed major foundational work but has clear opportunities for cross-editor capabilities, markdown enhancements, canvas expansion, new editor types, and AI-native features.

---

## Cross-Editor Capabilities

### 1. Universal Search & Navigation

**Current State:** Search exists as a dedicated left-panel tab (FTS5-backed) for workspace-wide searching, but individual editors are siloed.

**Opportunities:**
- **In-editor find/search within current file** (Cmd+F/Cmd+H) — Find & Replace panel for the active editor, scoped to current document only
- **Breadcrumb navigation** — Show file path with clickable ancestors in editor header (e.g., `Concepts / Causality / Causal Inference`)
- **Quick switcher overlay** — Cmd+Shift+P shows all open tabs + recently closed + fuzzy searchable by path/title
- **Jump to definition** — Cmd+Click links in canvas/excalidraw nodes to navigate to referenced notes; backlinks sidebar showing which files reference the current note

**Effort:** Medium (Find & Replace is straightforward CM6 extension; breadcrumb and switcher are UI-only)

### 2. Unified Bookmarking & Collections

**Current State:** Notes can be marked as `home` (in graph, radial layout centers on home). No broader bookmarking system.

**Opportunities:**
- **Bookmarks toolbar** — Star icon in editor hero header + file tree context menu to bookmark/unbookmark notes. Persisted to localStorage or config file
- **Collections/Projects** — Create ad-hoc collections of files (notes, canvases, drawings) without directory-based hierarchy; collections appear as a second file tree tab or sidebar
- **Recent files** — Tooltip/menu showing recently opened files for quick re-access
- **Pin important tabs** — Tab bar context menu to lock a tab (prevent accidental closure, show pin icon on tab)

**Effort:** Low-Medium (mostly state management + UI)

### 3. Split Editors & Linked Views

**Current State:** Single active editor; multiple tabs but only one visible at a time. No split pane or side-by-side editing.

**Opportunities:**
- **Split editor pane** — Cmd+Shift+\ to split editor vertically; shows two tabs side-by-side; draggable divider to resize
- **Linked editors** — Holding Cmd while opening a note in split pane automatically scrolls related views (e.g., graph highlights the node, files tree scrolls to it)
- **Compare mode** — Right-click on a tab → "Compare with..." opens diff view between two note versions or linked notes
- **Preview pane sync** — When in split mode, left pane is edit, right pane is synchronized preview

**Effort:** High (complex layout changes, requires panel state refactor)

### 4. Editor-to-Graph Integration

**Current State:** Separate systems: graph can focus on a note, notes can link to graph nodes via `[[path]]` autocomplete. Limited bidirectional feedback.

**Opportunities:**
- **Graph minimap in editor sidebar** — Small, collapsible version of graph focusing on immediate neighborhood of the active note + related notes as cards
- **Hover graph preview** — Hover over a `[[link]]` in editor to show a tooltip with the target node's metadata + a tiny local subgraph
- **Inline tags view** — Clicking a tag in the editor footer shows a live list of all notes with that tag; selecting one navigates to it
- **Auto-link suggestions** — AI-powered: as user types, suggest nearby notes to link to based on semantic similarity (MCP tool + background analysis)
- **Backlinks panel** — Right sidebar showing all notes linking to the current note, grouped by relation type or note type

**Effort:** Medium (most relies on existing graph store; backlinks is DB query)

### 5. Cross-Canvas Navigation

**Current State:** Canvas is self-contained. File nodes in canvases reference notes, but limited integration with other canvases or embedded canvas-in-note.

**Opportunities:**
- **Embed canvas in note** — Inline canvas viewer showing a `.canvas` file's nodes/edges within markdown preview; double-click to open full canvas editor
- **Canvas-to-canvas links** — Canvas nodes can reference other canvases (similar to file nodes); double-click opens the referenced canvas in a new tab
- **Canvas as presentation** — Slideshow mode cycling through canvas nodes or groups in sequence; useful for presenting ideas or reviewing workflow
- **Dynamic canvas generation** — MCP tool or button to auto-generate a canvas from a search query or graph focus (layout notes on canvas automatically using fcose)

**Effort:** Medium-High (embedding is UI-heavy; auto-generation requires backend layout algorithm)

### 6. Shared Annotations & Overlays

**Current State:** Editors don't share annotation or metadata. Highlights in PDF are isolated to that PDF.

**Opportunities:**
- **Highlights/annotations layer** — All file types support inline highlights with color + note. Persisted separately (not in file content) to avoid conflicts with version control
- **Comments** — Threaded comments on specific locations (line in markdown, region in canvas, page in PDF); shows commenter + timestamp
- **Collaborative cursors** (future) — Placeholder for multi-user cursors if federation/sync is added later

**Effort:** High (requires new data model + UI for annotations)

---

## Markdown Editor Enhancements

### 1. Essential Text Editor Features (Tier 1)

**Status:** All identified in `editor-gap-analysis.md` and partially completed in CHANGELOG.

**Completed:**
- ✅ Find & Replace
- ✅ List auto-continuation
- ✅ Bracket auto-close
- ✅ Tab indent/outdent with marker cycling
- ✅ Smart paste (URL → link wrapping)
- ✅ Note autocomplete on `[[`
- ✅ Word count display
- ✅ Document outline dropdown
- ✅ Heading folding
- ✅ Slash commands (16 commands: headings, lists, blocks, callouts)
- ✅ Unified context menu
- ✅ Table insertion toolbar button

**Remaining gaps:**
- Spell checking (native browser spell check enabled but not styled)
- Indent size configuration (2/4/8 spaces) — partially done
- Line wrap toggle — partially done
- Code block language autocomplete

**Effort:** Low (most are CM6 extensions or minor settings)

### 2. Markdown-Specific Enhancements

**Currently Implemented:**
- ✅ Custom callout blocks (AI Answer, Source, Question, Key Insight, Attention)
- ✅ Inline citations (`[!source ...]`, `[!example ...]`, `[!math ...]`)
- ✅ Interactive checkboxes (click to toggle `- [ ] → - [x]`)
- ✅ Table rendering with alignment + zebra striping
- ✅ Table auto-formatting on save
- ✅ Cursor-aware markdown prettification (bold, italic, links, images, code, strikethrough, blockquotes, horizontal rules)
- ✅ Edit-mode markdown rendering (decorations for formatting visibility)

**New Opportunities:**
- **Markdown linting** — Underline common markdown mistakes (missing closing brackets, unmatched quotes, trailing spaces). Show issues in a problems panel (like VS Code)
- **Template variables** — Support `{{title}}`, `{{date}}`, `{{tags}}` in note templates; auto-expand on creation
- **Live math preview** — Render LaTeX `$...$` inline in edit mode (not just preview)
- **Mermaid diagram preview** — Render mermaid code blocks in preview + edit mode; interactive (e.g., expand/collapse groups)
- **Table templates** — Right-click in table → "Insert row above/below", "Insert column left/right"; table builder UI for complex tables
- **Dataview-like queries** — Inline `::query::` blocks showing filtered/aggregated data from the graph (e.g., all notes with tag X, all backlinks)
- **Outline with nested preview** — Outline panel shows heading hierarchy; hover to see preview of content under that heading
- **Footnotes & references** — Full footnote support with numbered/named anchors; click footnote → scroll to definition and back

**Effort:** Medium-High (most require new grammar extensions or data queries)

### 3. Content Organization & Navigation

**Current:**
- Document outline dropdown
- View modes (Edit/Preview/Raw)
- Heading folding

**Opportunities:**
- **Persistent outline sidebar** — Replace or complement the dropdown with a persistent right-side outline panel (like VS Code); collapse/expand as you work
- **Breadcrumb trail** — Show which section/heading you're currently editing in a breadcrumb bar
- **Sticky header** — Keep the current section's heading visible as you scroll down
- **Jump to section** — Cmd+Shift+O opens a filterable list of all headings (like VS Code outline)
- **Goto page** — Go to specific note by title/path via quick switcher
- **Mini editor with zoomed view** — Sidebar showing zoomed-in text around cursor for detailed editing (useful for long lines)

**Effort:** Medium (mostly UI + event listeners)

### 4. Collaboration & Export

**Current:** No real-time collaboration; single-user editing.

**Opportunities:**
- **Export formats** — Buttons to export note/canvas/drawing to: HTML, PDF, Markdown, Docx
- **Copy as formatted text** — Cmd+C while text selected → copy as markdown + HTML dual format (pastes as formatted text in Word, etc.)
- **Publish view** — Read-only HTML view of a note (can be shared as a link or embedded)
- **Markdown diff** — Visual diff view when comparing two note versions

**Effort:** Medium-High (export requires external libraries; publish view is frontend-only but requires auth if shared)

---

## Canvas Editor Enhancements

### 1. Node Type Expansion

**Current:** 4 node types (file, text, link, group) + 6 shapes (rectangle, rounded, circle, sticky, callout, diamond) + 3 card kinds (summary, question, transition).

**Opportunities:**
- **Table/data nodes** — Add structured data tables directly on canvas; editable cells with type checking (text, number, date)
- **Timeline nodes** — Nodes representing temporal sequences; visual timeline layout option
- **Person/character nodes** — Special node type for people with avatar, bio, connections
- **Code snippet nodes** — Nodes displaying code blocks with syntax highlighting; editable with language selector
- **Image/media nodes** — Nodes displaying images, embedded videos, or audio players
- **Excalidraw embed nodes** — Canvas nodes that embed a `.excalidraw` drawing inline (with edit button to open full editor)
- **Markdown nodes** — Like text nodes but render full markdown (headings, lists, bold, italic, links, images)

**Effort:** Medium (requires node type architecture changes, translation layer updates, styling)

### 2. Canvas Layouts & Automation

**Current:** Manual positioning; users can choose background patterns and grid snap.

**Opportunities:**
- **Automatic layouts** — Beyond force-directed; add: flow layout (top-down or left-right), hierarchy tree, circular, radial, grid
- **Smart layout** — Double-click empty area → auto-arrange selected nodes using chosen layout; remembers user preference
- **Layout templates** — Pre-configured canvas arrangements (e.g., "Story Map", "Concept Map", "Timeline", "Decision Tree")
- **AI-powered layout** — MCP tool: given a set of notes, auto-generate canvas with semantic clustering + fcose layout
- **Responsive positioning** — When resizing canvas window, preserve relative positions of nodes (scale layout rather than reflow)

**Effort:** High (layout algorithms; would benefit from D3 or similar; AI-powered requires backend integration)

### 3. Canvas as Presentation & Exploration

**Current:** Canvas is static/manual; useful for curation but not for presenting ideas.

**Opportunities:**
- **Presentation mode** — Fullscreen mode cycling through canvas nodes or groups; arrow keys/space to advance; shows speaker notes from card text
- **Focus zoom** — Double-click node → smoothly zoom to that node; shows only its immediate neighbors at normal scale
- **Playback sequence** — Define a sequence of nodes/groups to "play" through (like a slide deck); assign durations and transitions
- **Exploration mode** — AI-powered suggestions: hover over a node → show related notes not yet on canvas; click to add them
- **Graph overlay** — Toggle a lightweight graph view behind canvas nodes showing their connections (semi-transparent); helps contextualize

**Effort:** Medium-High (presentation mode is mostly UI; exploration needs semantic search; graph overlay needs rendering optimization)

### 4. Canvas Interactivity & Editing

**Current:** Double-click to edit text nodes; toolbar for shapes/colors; context menus.

**Opportunities:**
- **Inline node editing** — Single click on text node → inline edit (not modal); blur to commit
- **Smart connections** — When linking two nodes, suggest the best connection point (handle) based on layout
- **Curved text** — Text that follows the curve of an edge (useful for describing relationships)
- **Node templates** — Right-click → "Create node from template..." → pick a template for quick node creation (e.g., "Decision Point", "Reference", "Insight")
- **Batch operations** — Select multiple nodes → set color/style/size in bulk
- **Undo history panel** — Right sidebar showing undo stack with previews; click to restore to that state
- **Collaborative editing** (future) — Multi-cursor support if federation/sync is added

**Effort:** Medium (mostly UI + data binding)

### 5. Canvas Export & Integration

**Current:** Canvas is `.json` file; can be opened as text but not easily shared or embedded.

**Opportunities:**
- **Export as image/SVG** — Canvas → PNG/SVG snapshot; useful for embedding in documents or sharing
- **Export as Mermaid** — Canvas → mermaid diagram syntax (lossy but useful for conversion)
- **Export as HTML interactive** — Canvas → standalone HTML file with interactive drag/pan (no backend needed)
- **Canvas PDF** — Canvas → PDF with vector graphics + clickable links (if files reference URLs)
- **Embed canvas in note** — As discussed in cross-editor section; show canvas preview inline in markdown
- **Canvas-to-graph conversion** — Button to convert canvas layout into graph positions (persisted per-workspace)

**Effort:** Medium-High (export requires libraries; embedding is UI-heavy)

---

## New Editor Types

### 1. Data/Spreadsheet Editor

**Use case:** Manage structured data, create tables, link to notes.

**Design:**
- `.csv`/`.tsv` files open in a spreadsheet editor (like Excel/Sheets)
- Click a cell value → shows preview of related note if it's a note reference
- Add column for "Related Notes" that auto-links to notes matching cell value (semantic matching)
- Export to CSV, sort/filter UI
- Optional: `.json` files with array-of-objects render as tables

**Components needed:**
- `DataTableEditor.tsx` component (likely using a library like TanStack Table or react-data-grid)
- Tab kind `"table"` or `"spreadsheet"`
- Context menu "New Table" with CSV initialization

**Effort:** Medium-High (good table library needed; semantic linking adds complexity)

### 2. Timeline/Gantt Editor

**Use case:** Visual project management, historical timelines, event sequences.

**Design:**
- `.timeline` files (custom format or YAML-based)
- Render events on a horizontal timeline; draggable to change dates
- Connect events with arrows showing dependencies
- Events link to notes (e.g., project milestone → project note)
- Color-code by status/type; grouping by category
- Export as Gantt chart image

**Components needed:**
- `TimelineEditor.tsx` (using a library like `react-calendar-timeline` or similar)
- Tab kind `"timeline"`

**Effort:** High (Gantt is complex; layout algorithms; date handling)

### 3. Mind Map Editor

**Use case:** Brainstorming, hierarchical knowledge organization, visual outlines.

**Design:**
- `.mindmap` files (or OPML format)
- Root node in center; children fan out radially
- Nodes can contain full notes or link to existing notes
- Double-click to edit node text
- Drag to reparent nodes
- Export as image/PDF/outline

**Components needed:**
- `MindMapEditor.tsx` (using library like `react-mindmap` or custom D3-based)
- Tab kind `"mindmap"`

**Effort:** High (layout algorithm; complex interactions)

### 4. Interactive Graph Viewer (Embedded)

**Use case:** Custom graph visualizations within notes or canvases.

**Design:**
- `\`\`\`graph` code blocks in markdown render as interactive subgraphs
- Can be annotated with notes/comments
- Click nodes to navigate to linked notes
- Optional: define graph as YAML/JSON within the code block

**Components needed:**
- CodeMirror preview widget for ` ```graph` blocks
- Reuse existing Cytoscape graph component

**Effort:** Medium (mostly glue between existing systems)

### 5. Audio Waveform Editor

**Use case:** Annotate audio recordings, mark timestamps, transcription.

**Design:**
- `.mp3`, `.wav`, `.m4a` files open in waveform editor
- Play/pause/seek + speed control (like video viewer)
- Click waveform → add marker at timestamp
- Markers link to notes or text annotations
- Display transcript if available (read from sidecar `.transcript.txt` or frontmatter)
- Export markers as CSV (timestamp, text)

**Components needed:**
- `AudioEditor.tsx` (using library like `wavesurfer.js`)
- Tab kind `"audio"`

**Effort:** Medium (wavesurfer is good; transcript integration adds complexity)

### 6. 3D Model Viewer

**Use case:** Visualize 3D data (molecular structures, CAD models, point clouds).

**Design:**
- `.glb`, `.gltf`, `.obj` files open in 3D viewer
- Rotate/zoom controls; wireframe toggle
- Export as image

**Components needed:**
- `ModelViewer3D.tsx` (using Three.js or Babylon.js)
- Tab kind `"model3d"`

**Effort:** Medium (libraries are mature; straightforward viewer)

### 7. Markdown Slides/Presentation Editor

**Use case:** Create slide presentations from markdown.

**Design:**
- `#` headers become slides
- Subsections become notes
- Edit and view in presentation mode side-by-side
- Presenter notes in YAML frontmatter or hidden markdown blocks
- Export as PDF slides or HTML reveal.js deck

**Components needed:**
- `SlideEditor.tsx` + presentation mode
- Tab kind `"slides"` (`.md` files with frontmatter `format: slides`)

**Effort:** Medium-High (requires reveal.js integration or custom slide rendering)

---

## Knowledge Graph Integration

### 1. Graph-Aware Editor Sidebar

**Current:** Related notes footer in markdown editor; graph lives in left panel.

**Opportunities:**
- **Context panel** — Right sidebar showing the active note's place in graph: incoming edges (backlinks) on top, outgoing edges below, both grouped by relation type with edge labels visible
- **Neighborhood explorer** — Same sidebar but interactive: hover/click edges to highlight the path in the graph view automatically
- **Citation context** — When note A cites note B, show excerpt from B inline in A's editor (with link to the full note)
- **Graph TOC** — Sidebar showing hierarchical structure based on `contains` edges (useful for index notes)

**Effort:** Low-Medium (mostly UI; queries via existing graph store)

### 2. AI-Powered Link Suggestions

**Current:** Note autocomplete on `[[`; no recommendations.

**Opportunities:**
- **Smart linking** — As user types in editor, background MCP tool analyzes content + suggests notes to link to based on semantic similarity; appears in a sidebar suggestion list
- **Auto-link backfilling** — Button "Find related notes" → runs semantic search on current note, suggests notes to add as explicit links
- **Link strength indicator** — When hovering over a `[[link]]`, show a confidence score of how related the target is (via embedding similarity)
- **Orphan notes detector** — MCP tool identifying notes with no incoming or outgoing links; suggests connections

**Effort:** High (requires semantic embeddings; MCP tools; background processing)

### 3. Graph-Driven Editing

**Current:** Graph is read-only for purposes of editing; only affects via title/type/tags changes.

**Opportunities:**
- **Graph-based reorganization** — Right-click on note in graph → "Reorganize into folder structure" → auto-creates folder hierarchy based on graph clusters
- **Bulk updates from graph** — Select multiple notes in graph → bulk edit: change type, add tag, add to collection
- **Implicit structure enforcement** — If a note is a child of a folder (via `contains` edge), auto-populate `parent` field in frontmatter
- **Graph merge/split** — Merge two similar nodes (consolidate duplicate notes); split a complex node into multiple notes with shared edges

**Effort:** High (complex mutations; data migration risks)

### 4. AI-Powered Graph Analysis

**Current:** Graph is static; no automated insights.

**Opportunities:**
- **Community detection** — MCP tool identifying clusters of related notes; suggests grouping them in canvases or creating index notes
- **Gap analysis** — Identifies missing links (e.g., "You reference Concept A and Concept B often but never connected them")
- **Citation flow** — Visualize how ideas propagate through the graph (e.g., Concept A → B → C → D); highlights central ideas
- **Relationship inference** — Suggest edge types based on note content (e.g., if A mentions "built on" B, suggest `extends` edge)

**Effort:** High (requires semantic analysis; graph algorithms)

---

## AI-Native Features

### 1. AI Completions & Suggestions

**Design:**
- Editor has a sidebar with AI suggestion panel
- Button to "Expand on this paragraph" → AI generates continuation (user can accept/reject/edit)
- "Summarize" → generates executive summary of the current note
- "Outline" → generates outline from existing content
- All generations are proposals in the sidebar, never auto-inserted; user controls integration

**Architecture:**
- Leverage MCP tools for LLM access
- Prompt engineering to stay in-domain (respect note type, tone, existing style)
- Regenerate button to get alternatives
- Rate suggestions (thumbs up/down) to improve future prompts

**Effort:** Medium (MCP integration + UI for sidebar; LLM prompts need iteration)

### 2. Smart Linking via Semantic Search

**Design:**
- Background indexing of note embeddings (done incrementally as notes are saved)
- MCP tool `embedNote(path)` → vector embedding
- When creating a new link via `[[`, show ranked suggestions (top N similar notes)
- Hover `[[link]]` → show distance metric (how related 0-1 scale)

**Effort:** Medium-High (embedding model needed; vector DB; background indexing)

### 3. Note Generation from Seeds

**Design:**
- Button "Generate note from prompt" → opens dialog
- User enters prompt/question (e.g., "Explain causal inference")
- AI generates note content (title, type, tags, body)
- Note is created as draft; user can edit/enhance before publishing
- Optionally: AI suggests links to existing notes and creates them automatically

**Effort:** Medium (mostly LLM prompting + note creation flow)

### 4. Semantic Search & Filtering

**Current:** FTS5-based search in left panel.

**Opportunities:**
- **Semantic search** — Search query → embedding → find notes by similarity, not just keyword match (useful for "what notes discuss causality even if they don't use that word")
- **Filter by relationship type** — Left panel search: filter results to show only notes that "supports" or "contradicts" the current note
- **Temporal search** — Show notes created/modified in date range; visualize on timeline

**Effort:** Medium (embedding infrastructure + UI for filters)

### 5. AI-Powered Canvas Generation

**Design:**
- Button on canvas: "Auto-arrange from search" or "AI-generate canvas"
- Opens dialog with search/filter options
- Selects matching notes; calls MCP tool to generate semantic layout
- MCP tool clusters notes by similarity; runs fcose on groups
- Inserts nodes at calculated positions
- User can adjust from there

**Effort:** Medium-High (layout algorithms; semantic clustering)

### 6. Collaborative Writing Assistance

**Design:**
- Editor sidebar has AI panel
- "Ask Claude..." text input + submit button
- Queries about the note (e.g., "What's the main argument?", "Who should read this?") → AI responds based on context
- "Continue writing" → generates next paragraph based on tone/topic
- "Improve clarity" → rewrites selected text for clarity

**Effort:** Medium (LLM + context window management; prompt engineering)

### 7. Graph Anomaly Detection

**Design:**
- MCP tool runs background checks:
  - Disconnected notes (no edges)
  - Duplicate content detection (notes with high similarity)
  - Circular dependencies (cycle detection)
  - Unused tags or types
- Displays findings as "Issues" panel in left sidebar
- Suggestions for fixes (merge, link, organize)

**Effort:** Medium (graph algorithms; heuristics)

---

## Implementation Priority Matrix

| Feature | Category | Effort | Impact | Dependencies | Priority |
|---------|----------|--------|--------|--------------|----------|
| **Find & Replace** | Markdown | Low | Critical (Tier 1) | CM6 | 🔴 P0 |
| **Document Outline** | Markdown | Low | High | CM6 | 🔴 P0 |
| **Word Count** | Markdown | Low | Medium | UI | 🔴 P0 |
| **Spell Check** | Markdown | Low | Medium | Browser native | 🟡 P1 |
| **Backlinks Panel** | Cross-Editor | Medium | High | Graph store | 🟡 P1 |
| **Show in Finder** | Cross-Editor | Low | High (UX) | Tauri shell | 🟡 P1 |
| **Copy File Path** | Cross-Editor | Low | High (UX) | Clipboard API | 🟡 P1 |
| **Bookmarks System** | Cross-Editor | Low-Medium | Medium | State + UI | 🟡 P1 |
| **Smart Linking via Embeddings** | AI-Native | High | Very High | MCP + embedding model | 🟡 P1 |
| **Auto-reveal Active File** | Cross-Editor | Low | Medium (UX) | File tree + scroll | 🟡 P1 |
| **Split Editor Pane** | Cross-Editor | High | High | Layout refactor | 🟠 P2 |
| **Table Editor** | New Editor | Medium-High | Medium | Data library | 🟠 P2 |
| **Canvas Minimap in Sidebar** | Cross-Editor | Medium | High | Canvas + graph | 🟠 P2 |
| **AI Completions** | AI-Native | Medium | Very High | MCP + LLM | 🟠 P2 |
| **Markdown Linting** | Markdown | Medium | Medium | CM6 + rules | 🟠 P2 |
| **Timeline Editor** | New Editor | High | Medium | Gantt library | 🟠 P2 |
| **AI-Powered Canvas Layout** | Canvas | High | High | MCP + fcose | 🟠 P2 |
| **Semantic Search** | AI-Native | Medium-High | High | Embedding model | 🟠 P2 |
| **Mind Map Editor** | New Editor | High | Medium | MindMap library | 🟠 P2 |
| **Audio Editor** | New Editor | Medium | Low | wavesurfer.js | 🔵 P3 |
| **Presentation Mode** | Canvas | Medium-High | Medium | UI + reveal.js | 🔵 P3 |
| **AI-Powered Graph Analysis** | AI-Native | High | Medium-High | MCP + algorithms | 🔵 P3 |
| **Collaborative Cursors** | Cross-Editor | High | Medium | Networking | 🔵 P4 |
| **3D Model Viewer** | New Editor | Medium | Low | Three.js | 🔵 P4 |

---

## Quick-Win Recommendations (Next Sprint)

**High-impact, low-effort features to ship in 1-2 sprints:**

1. **Show in Finder + Copy Path** — UX polish for file tree; both exist as research; implement together
2. **Spell Check toggle** — Already browser-native; just needs Settings checkbox
3. **Auto-reveal active file** — File tree auto-scroll; medium effort but high UX impact
4. **Backlinks panel** — Right sidebar showing incoming edges; query existing graph store; improves graph discoverability
5. **Bookmarks/Collections** — lightweight state + UI; no backend changes needed

---

## Strategic Themes for Roadmap

### Theme 1: Obsidian Parity (Markdown + Files)
Complete the remaining markdown editor gaps (spell check, code autocomplete, linting) and file tree features (sort, move-to-trash, duplicate, auto-reveal). This makes BrainMap a credible markdown editor as a standalone feature.

### Theme 2: Canvas as First-Class Citizen
Expand canvas with auto-layout, presentation mode, more node types, and better integration with notes. Make canvas an equal alternative to the graph for exploring/organizing knowledge.

### Theme 3: AI-First Knowledge Work
Leverage LLMs and semantic embeddings to enable: smart linking suggestions, AI completions, semantic search, and AI-powered graph/canvas generation. Position BrainMap as an "AI-native knowledge graph" distinct from Obsidian.

### Theme 4: Data-Driven Insights
Add structured data editor (tables), timeline visualization, and AI-powered graph analysis. Enable users to turn their notes into actionable intelligence.

### Theme 5: Multimodal Knowledge Capture
Audio editor, image annotation, 3D model viewer. Support knowledge workers who capture ideas in diverse formats beyond markdown.

---

## Conclusion

BrainMap has a solid, extensible editor architecture (evidenced by 7 editor types, clean plugin pattern, extensive test coverage). The low-hanging fruit (find/replace, file management, bookmarks) can be shipped quickly and will make a big impact on user experience. The strategic differentiators (AI-powered semantic linking, smart suggestions, AI-native layouts) require more investment but position BrainMap uniquely in the knowledge management space. The architecture is ready for all of these — no major refactors needed.

---

