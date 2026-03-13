# BrainMap

Personal knowledge graph tool that transforms structured markdown files into an interactive, queryable, visual knowledge base.

## Project Structure

Rust workspace with four crates:

- `crates/core` — Core library: parser, graph engine, SQLite FTS5 index, config, workspace manager
- `crates/cli` — CLI interface (clap, 21 commands + 3 short aliases: `ls`, `new`, `s`)
- `crates/mcp` — MCP server (rmcp, 24 tools + 3 resources over stdio for AI agent integration)
- `crates/app/src-tauri` — Desktop app (Tauri v2 + React, excluded from workspace until Phase 1c complete)

Supporting directories:

- `docs/` — Complete specifications (vision, data model, CLI, MCP, desktop app, architecture, roadmap, seed dataset)
- `seed/` — 34-note seed dataset from "The Book of Why" used for testing and reference

## Architecture

Files (`.md` with YAML frontmatter) are the source of truth. The core library parses them into an in-memory graph and a SQLite FTS5 search index. Three interfaces consume the core: CLI, desktop app (Tauri + React), and MCP server.

Key design decisions:
- Folders are virtual graph nodes (`note_type: "folder"`) auto-generated from directory structure; `contains` edges connect folders to direct children (notes and subfolders)
- Frontmatter `links` field defines explicit typed relationships (can target both notes and folder nodes)
- Backlinks are resolved via the search index (edges stored only in source note)
- Single-writer mutation model for graph consistency

## Building and Testing

```bash
cargo build                  # build all crates
cargo test                   # run all tests (124 total)
cargo test -p brainmap-core  # core library tests only (40 unit + 8 seed + 5 incremental + 1 perf)
cargo test -p brainmap       # CLI integration tests (33 tests)
cargo test -p brainmap-mcp   # MCP tests (23 tool tests + 9 resource tests)
cargo run -p brainmap -- init /path/to/workspace  # run CLI
cargo run -p brainmap -- --workspace seed serve   # start MCP server
```

## Data Model

Notes have YAML frontmatter with: `title`, `type`, `tags`, `status`, `created`, `modified`, `source`, `summary`, `links`. Type-specific fields go in `extra`.

11 note types: concept, book-note, question, reference, index, argument, evidence, experiment, person, project, folder (virtual — auto-generated from directory structure, no backing `.md` file).

15 edge types: contains, part-of, causes, supports, contradicts, extends, depends-on, exemplifies, precedes, leads-to, evolved-from, related-to, authored-by, sourced-from, mentioned-in.

## Current Status

Phase 1c (Desktop App) complete — UX improvements shipped: fcose/dagre graph layouts, edge label toggle, resizable panels (react-resizable-panels v4), file tree (Cmd+B), focus mode (⤢ button / Escape), related notes footer, debug cleanup. Additional opportunities implemented: node sizing by in-degree, color legend overlay (Legend toggle in graph toolbar), hover tooltips on graph nodes. Graph/Files tab toggle in left panel (Obsidian-style; Cmd+B switches between tabs, both panels kept mounted with CSS display toggle to preserve Cytoscape state). Obsidian-style graph visual overhaul: small glowing nodes (6px base, scales by in-degree), labels hidden until ~127% zoom, thin semi-transparent edges (line-opacity 0.35), vee arrowheads, dark canvas background (#13131a). Graph layout improvements: aggressive fcose params (repulsion 75000, edge length 280, elasticity 0.30, gravity 0.04, gravityRange 5.0, numIter 2500) for better spread; edge type filter popover in graph toolbar (Edges button with active badge showing visible/total count). Focus in Graph: right-click a note or folder in Files view → "Focus in Graph" switches to Graph tab and shows only that note + direct neighbors (or all notes in a folder); focal note is visually enlarged; "Focus ×" button in toolbar clears focus; clicking the active Graph tab also clears focus. Pure client-side filtering via `graphFocusFilter.ts` (no extra API calls). 116 Rust tests + 170 Vitest unit tests. Phase 2+3 gaps filled: YAML output, 6 additional MCP tools (node_move, config_set, federation_list/add/remove, batch), 3 MCP resources, short CLI aliases (ls/new/s). Settings modal: gear icon in StatusBar (⚙) + Cmd+, opens Obsidian-style Settings modal with independent font controls for Editor (family + size, monospace presets) and Interface (family + size, sans-serif presets), plus Theme selection (light/dark/system). Preferences persisted to `brainmap:uiPrefs` localStorage. Theme now also persisted (previously reset to "system" on reload). Segments: named persisted workspaces (Obsidian-style vaults); SegmentPicker home screen replaces WorkspacePicker; `segmentStore` with localStorage persistence (`brainmap:segments`); `closeWorkspace` action returns to home screen; segment name shown in StatusBar (fallback to folder basename); ✕ close button in StatusBar. IDE-style file/folder creation in Files panel: toolbar with `+` (New Note) and `⊞` (New Folder) buttons; right-click context menu with "New Note Here"/"New Subfolder Here" on folders and "New Note in Folder" on notes; `create_folder` Tauri command (path-traversal-safe); `CreateNoteDialog` pre-populates path/title from context; `CreateFolderDialog` center modal for folder creation (pre-populates path from context, replaces inline input); empty folder tracking via `emptyFolders` Set in UIStore so newly created folders without notes remain visible in the file tree (cleared on workspace reset, updated on folder deletion). Global zoom: Cmd+`+`/`=` zoom in, Cmd+`-` zoom out, Cmd+`0` reset — applies CSS `zoom` to the entire app; persisted to `brainmap:uiPrefs.uiZoom`; range 0.5–2.0 in 0.1 steps. Native folder browse dialogs: SegmentPicker uses `@tauri-apps/plugin-dialog` for native OS folder picker; "Browse…" button in create form, "Open Folder…" buttons on home view (empty state + segment grid); `pickFolder` utility in `api/pickFolder.ts`; 3 Vitest unit tests. Editable frontmatter: "Edit Metadata" collapsible section (collapsed by default) with all fields editable — Title, Type, Status, Tags, Source, Summary, Created/Modified (read-only), Extra fields. Cmd+S saves both body and frontmatter; graph store synced on title/type changes; title validation blocks empty saves. Editor visual upgrade: hero header with large title + colored type pill + tag chips + status dot + source attribution; both edit/preview views mounted simultaneously with CSS opacity transition (preserves CodeMirror cursor/scroll/undo); related notes as card grid with type-colored left bars; heading accent bars (h2/h3 left border); softer heading colors (accent-tinted via color-mix); blockquote background tint; editor body inset shadow; branded empty state. Unified type-color palette between file tree dots and graph nodes. Cmd+Click link navigation: Cmd+Click on inline markdown links `[label](path.md)` in the CodeMirror editor navigates to the linked note; plain click on links in preview mode navigates; visual cursor feedback (pointer on Cmd+hover); path resolution handles relative paths and URL-encoded characters; `cmLinkNavigation.ts` CodeMirror extension + `resolveNotePath.ts` utility. Graph visual upgrade (12 enhancements): neighborhood highlight on hover (dim non-neighbors to 12% opacity), edge color gradients (source→target node colors via imperative styling), animated node entrance (staggered fade-in on first load), glassmorphism toolbar/legend/tooltip/popover (backdrop-filter blur), rich hover tooltip (lazy-loaded tags/summary via `get_node_summary` Tauri command with cache), label background pills, hover pulse animation, smooth layout transitions (500ms animated), node shapes by type (10 distinct Cytoscape shapes), cluster hulls (convex hull algorithm with cached model-coordinate geometry, drawn on canvas overlay), edge directionality particles (rAF canvas animation with golden-ratio phase offsets, auto-disable at 200+ edges), minimap (second read-only Cytoscape instance with viewport rectangle). New files: `graphHulls.ts`, `graphParticles.ts`, `graphStyles.test.ts`, `graphHulls.test.ts`. Link editor UI: LinksEditor component in Edit Metadata section shows existing outgoing links with rel label + target title + remove button; add row with datalist autocomplete (all workspace notes), edge type selector (12 user-selectable types, excludes auto-generated contains/part-of/mentioned-in), duplicate detection; uses createLink/deleteLink APIs directly; `refreshActiveNote` editorStore action preserves dirty state during link operations; graph store synced via `applyEvent`. Editor formatting toolbar: toolbar row above editor body (edit mode only) with Bold, Italic, Strikethrough, Inline Code, H1/H2/H3, Bulleted List, Numbered List, Blockquote, Link, Horizontal Rule buttons; keyboard shortcuts Cmd+B (bold), Cmd+I (italic), Cmd+Shift+X (strikethrough), Cmd+E (inline code), Cmd+K (link), Cmd+Shift+1/2/3 (headings) via CodeMirror keymap; Cmd+B is context-aware (bold in editor, sidebar toggle elsewhere); `cmFormatting.ts` pure formatting functions + `EditorToolbar.tsx` component; `toggleOrderedList` with auto-incrementing numbers. Related notes direction grouping: RelatedNotesFooter splits edges into "Outgoing" and "Incoming" sections with group labels, per-group "show more" expansion, and directional arrow indicators (→/←). Related note hover tooltip: glassmorphism tooltip on card hover showing full title, type pill, direction + rel, status, summary, and tags; enriched data lazy-loaded via `getNodeSummary` with per-path cache. Create & Link in LinksEditor: when typing a non-existent note title in the Links editor, a "Create & Link" button replaces the "+" button; clicking opens CreateNoteDialog pre-filled with the title; after creation, the link is automatically added and the user stays on the current note; UIStore coordination via `createNoteMode`/`createAndLinkSource` fields (no callbacks in state). File/folder deletion from context menu: right-click "Delete"/"Delete Folder" in Files panel with confirmation dialog; backlink warning with source list (force-delete option); unsaved changes warning; `delete_folder` Tauri command with path-traversal validation, intra-folder backlink exclusion, partial failure handling, and non-recursive directory cleanup; `ConfirmDeleteDialog` component; danger-styled context menu items; editor/graph focus auto-cleared on deletion. File operation undo/redo: Cmd+Z / Cmd+Y (or Cmd+Shift+Z) undo/redo create-note, create-folder, delete-note, delete-folder when focus is outside CodeMirror editor; `undoStore` Zustand store with bounded command stack (20 items), full note snapshots for delete undo, two-pass folder restore (notes first, then links), `isProcessing` concurrency guard, toast notifications via `UndoToast` component; smart refusal (won't undo create if note has been modified); undo stack cleared on workspace close. File tree modernization (6 features): Lucide React icons for note types (10 distinct icons colored by type via `getNodeColor`) and folders (open/closed states) replacing CSS dots/chevrons; indent guides (vertical lines at each nesting level via `indent-guide` spans); note count badges on folders showing descendant count; hover actions "..." button (appears on hover, opens context menu at button position); smooth expand/collapse animation (CSS `grid-template-rows` 0fr→1fr, 150ms, with lazy mount optimization); fuzzy filter with character highlighting (`fuzzyMatch.ts` utility, greedy left-to-right scan, `<mark>` segments for matched characters). New files: `fileTreeIcons.tsx`, `fuzzyMatch.ts`. Auto-save: debounced 1.5s auto-save on edit, save on note switch and window blur; `autoSave` boolean in PersistedPrefs (default: true); toggle in Settings modal Appearance section; `useAutoSave` hook with Zustand subscriptions in `hooks/useAutoSave.ts`; `openNote` awaits `saveNote()` before switching when auto-save enabled. Virtual folder nodes: folders are first-class graph nodes (`note_type: "folder"`) auto-generated from directory structure during workspace load; `compute_folder_hierarchy` in `graph.rs` replaces old `compute_implicit_edges`; `contains` edges connect folders to direct children (notes and subfolders); notes can create explicit links targeting folder paths; `ensure_folder_nodes`/`prune_empty_folder_nodes` maintain folder nodes during incremental ops (`create_note`, `delete_note`, `add_file`, `remove_file`, `move_note`); folder nodes rendered in graph with barrel shape and gray color; clicking a folder node in graph triggers focus instead of opening editor; folder nodes visible in LinksEditor autocomplete with "(folder)" suffix; `get_node_summary` handler returns synthesized summary for folder nodes. Custom callout blocks: Obsidian-compatible `> [!type]` syntax with 4 built-in types (ai-answer, source, question, key-insight); styled preview cards with Lucide icons and per-type colors; `insertCallout` formatting function; callout picker dropdown in EditorToolbar (☰ button); unknown callout types render with fallback neutral styling; `calloutTypes.ts` single source of truth for type definitions; `--callout-color` CSS custom property for type-agnostic styling. 124 Rust tests + 262 Vitest unit tests.

## Logging

Structured logging via `tracing` (Rust) and custom NDJSON logger (TypeScript). Full spec in `docs/logging.md`.

- **Env var**: `BRAINMAP_LOG` — uses `tracing` `EnvFilter` syntax (e.g., `debug`, `brainmap_core::workspace=trace`)
- **Defaults**: CLI=`warn`, MCP=`info`, Tauri=`info`
- **File logs (MCP)**: `<workspace>/.brainmap/logs/brainmap.log` (daily rotation)
- **File logs (Tauri)**: `~/.brainmap/logs/brainmap.log.<date>` (daily rotation, always enabled)
- **Stderr**: JSON for MCP, compact human-readable for CLI/Tauri
- **Frontend logger**: `import { log } from "../utils/logger"` — `log.error()`, `log.warn()`, `log.info()`, `log.debug()`. When running inside Tauri, frontend logs are forwarded to the Rust backend via the `write_log` Tauri command and written to the same log file.
- **Init**: CLI/MCP call `brainmap_core::logging::init_logging(LogConfig)` in main; Tauri inits in `lib.rs`
- **Feature flag**: `logging` on `brainmap-core` enables `tracing-subscriber` + `tracing-appender`

### Accessing logs (AI-first)

The Tauri desktop app writes all logs (backend + forwarded frontend) to `~/.brainmap/logs/`. To read the current day's log:

```bash
# Find today's log file
ls ~/.brainmap/logs/
# Read it (use the Read tool on the most recent file)
```

When debugging the desktop app, **always check these log files first** using the Read tool. They contain structured tracing output from both Rust backend operations (workspace open, graph topology, file watcher events) and frontend operations (bridge selection, store actions, errors). This is the primary debugging mechanism — do not rely on terminal output or browser devtools.

## Conventions

- Rust edition 2021, resolver v2
- Error handling via `thiserror` with `BrainMapError` enum
- All public API goes through `workspace.rs` as the orchestration layer
- Tests live in `crates/core/tests/` (integration) and inline (unit)
- Folder nodes are virtual (no backing file) — stored only in `Graph.nodes`, not in `Workspace.notes`
- MCP server uses manual tool dispatch (not rmcp macros), `Arc<Mutex<Workspace>>` for thread safety
- Response envelope pattern: `{"success": bool, "data": ..., "error": {"code": ..., "message": ...}}`

## Review Agents

Two review agents are defined in `.claude/agents/`. These are NOT optional — they are mandatory parts of the development workflow described below.

- **plan-reviewer** (`.claude/agents/plan-reviewer.md`): Reviews implementation plans for architectural alignment, scope, edge cases, test strategy, and data model impact.
- **code-reviewer** (`.claude/agents/code-reviewer.md`): Reviews implemented code for correctness, Rust quality, function design, test coverage, serialization, and performance.

## Mandatory Feedback Loops

### Planning Feedback Loop

Whenever you create an implementation plan (whether in plan mode or not), you MUST follow this process:

1. Write the plan to `.claude/reviews/plans/<descriptive-name>.md`.
2. Read `.claude/agents/plan-reviewer.md` for the review criteria.
3. Immediately spawn one or more `general-purpose` agents to review the plan. Each agent must:
   - Receive the full plan content and the review criteria from the agent definition file.
   - Focus on a distinct aspect if multiple agents are used (e.g., one on architecture, one on edge cases/testing).
   - Write its feedback to `.claude/reviews/plans/<descriptive-name>-review-<N>.md`.
4. Read all review files. For any finding with severity `blocker` or `should-fix`, update the plan in place.
5. Only after incorporating feedback (or confirming there are no blocker/should-fix findings), present the final plan to the user.

### Code Review Feedback Loop

Whenever you finish implementing code (a complete feature, a step in a plan, or a meaningful chunk of work), you MUST follow this process:

1. Read `.claude/agents/code-reviewer.md` for the review criteria.
2. Spawn one or more `general-purpose` agents to review the changed files. Each agent must:
   - Receive the list of changed files, the diff or full file contents, and the review criteria from the agent definition file.
   - If there are many changed files, split across agents by area (e.g., one for core, one for CLI).
   - Write its feedback to `.claude/reviews/code/<descriptive-name>-review-<N>.md`.
3. Read all review files. For any finding with severity `bug` or `should-fix`, fix the code.
4. After fixing, spawn the review agent(s) again on the updated files. Write new feedback to `.claude/reviews/code/<descriptive-name>-review-<N>-pass-<M>.md`.
5. Repeat until there are no more `bug` or `should-fix` findings.
6. Only then consider the implementation done.

### Rules

- Never skip the feedback loops. They run even for small changes.
- Review files accumulate in `.claude/reviews/` — do not delete them during a session.
- If a review agent raises a `suggestion`, note it but do not block on it. Use judgment.
- When spawning review agents, always pass the full content of the relevant agent definition file as part of the prompt — do not summarize it.

## Documentation Maintenance

Every implementation plan MUST include a step to review and update project documentation if the changes affect it. Specifically:

- **`CLAUDE.md`**: Update project structure, current status, conventions, build instructions, or any other section that becomes stale due to the changes.
- **`README.md`**: Update if user-facing information changes (features, setup instructions, usage examples).
- **`docs/`**: Update relevant spec files if the implementation diverges from or extends the original specification.

This is not optional — treating docs as part of the deliverable prevents drift between code and documentation.
