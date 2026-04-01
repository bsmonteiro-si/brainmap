# 2026-03-09 — Subagent Transcript: general-purpose

**Date:** 2026-03-09 20:29:07
**Agent:** general-purpose
**Agent ID:** afe12331495fd0a6e
**Parent Session:** ba732d96-401a-4b82-b69a-43c622866e5c

---

## User

You are reviewing an implementation plan for BrainMap, a Rust knowledge graph tool. Your job is to find real problems before code gets written.

## Project Context

- Rust workspace: `crates/core` (library), `crates/cli` (CLI), `crates/app` (Tauri v2 + React desktop app), `crates/mcp` (MCP server)
- Core library owns all data operations; interfaces are thin wrappers
- Files (.md with YAML frontmatter) are source of truth
- In-memory graph + SQLite FTS5 index
- Frontend: React 18 + TypeScript + Zustand stores + Cytoscape.js
- Specs live in `docs/` (vision, data model, CLI spec, MCP spec, desktop, architecture, roadmap)

## Review Criteria

### 1. Architectural Alignment
- Does the plan respect the existing module boundaries? (parser, graph, index, workspace, config)
- Does it route mutations through `Workspace` as the orchestration layer?
- Does it avoid leaking implementation details across module boundaries?
- Is it consistent with the specs in `docs/`?

### 2. Scope and Complexity
- Is the plan doing more than what was asked? Flag any scope creep.
- Are there simpler alternatives to what's proposed?
- Are abstractions justified or premature? Three similar lines is better than an unnecessary abstraction.
- Does it avoid backwards-compatibility hacks or dead code?

### 3. Edge Cases and Risks
- What failure modes are unhandled? (disk full, concurrent access, invalid UTF-8, path traversal)
- Are there ordering dependencies between steps that aren't called out?
- What happens if the implementation is interrupted halfway?

### 4. Test Strategy
- Does the plan include tests for each new behavior?
- Are edge cases and error paths tested, not just happy paths?
- Do tests verify end state (classic approach), not just mock interactions?

### 5. Data Model Impact
- Do changes to types break serialization compatibility with existing workspaces?
- Are new fields backward-compatible (optional, with defaults)?
- Does the plan account for the seed dataset still passing?

## Output Format

Write your review as a list of findings. For each finding:
- **Category**: one of [architecture, scope, edge-case, testing, data-model, performance, clarity]
- **Severity**: one of [blocker, should-fix, suggestion]
- **Finding**: what the problem is
- **Recommendation**: what to do instead

If you find no issues in a category, skip it. If the plan is solid, say so briefly and explain why.

Do NOT pad your review with praise or filler. Only real findings.

## Plan to Review

The plan is `docs/10-ux-improvements.md`. Full content:

---

# UX Improvements — BrainMap Desktop App

Research findings and implementation plans for UX improvements to the desktop app.
The app is working with 34 nodes / 196 edges from the seed dataset. This document
covers 6 user-requested improvements plus additional opportunities discovered during
codebase exploration.

---

## Current State

### Layout
- `AppLayout.tsx`: 3 panels in 2-column flex layout — left graph (`flex: "0 0 60%"`), right column splits between editor (`flex: 1`) and search (`flex: "0 0 200px"` — fixed 200px)
- No layout library installed — pure CSS flexbox, hardcoded sizing, no drag-to-resize
- `package.json` has: cytoscape ^3.31.0, zustand ^5.0.3, CodeMirror, Tauri v2. No dagre, fcose, or any layout plugin.

### Stores
- `uiStore.ts` fields: `theme`, `effectiveTheme`, `graphMode`, `commandPaletteOpen`, `createNoteDialogOpen`
- `graphStore.ts` fields: `nodes: Map<string, NodeDto>`, `edges: EdgeDto[]`, `selectedNodePath`, `expandedNodes`, `isLoading`
- No `focusMode`, no panel visibility state, no file tree state

### Components
- No file/directory tree component exists yet
- `InspectorPanel.tsx` is fully implemented but NOT wired into `AppLayout` — orphaned
- `graphMode` ("navigate"/"edit") exists in `uiStore` but is unused everywhere in the UI

### Graph density
- 34 nodes / 196 edges = 5.76 edges/node average — extremely dense for a force-directed layout
- Built-in cose layout: `numIter: 200`, `nodeRepulsion: 8000` — too weak for this density
- All 196 edge labels render simultaneously → wall of text

---

## Improvement 1: Fix Graph Overlap

### Root cause
- `numIter: 200` is far too low; cose needs 1000+ iterations for dense graphs
- `nodeRepulsion: 8000` too weak — nodes cluster together
- All edge labels always visible → visual noise independent of node spacing

### Recommended approach: cytoscape-fcose

Install `cytoscape-fcose` (~30KB, community-maintained). Uses VERSE force simulation — dramatically better separation than built-in cose for dense graphs.

```ts
// GraphView.tsx — replace cose layout with fcose
import fcose from "cytoscape-fcose";
cytoscape.use(fcose);

cy.layout({
  name: "fcose",
  animate: false,
  quality: "proof",        // slower but best separation
  idealEdgeLength: 120,
  nodeRepulsion: 8000,
  gravity: 0.25,
  fit: true,
  padding: 40,
  nodeDimensionsIncludeLabels: true,
}).run();
```

Alternative (no new dep): tune built-in cose to `numIter: 1500`, `nodeRepulsion: 150000`, `idealEdgeLength: 120`, `gravity: 0.1`. Less predictable but zero install cost.

### Edge label strategy

Showing all 196 labels simultaneously is unusable. Three complementary strategies:

1. **Zoom-based hiding**: hide labels at zoom < 0.8, always show on hover/selected
   ```ts
   cy.on("zoom", () => {
     const show = cy.zoom() >= 0.8;
     cy.edges().style({ label: show ? "data(label)" : "" });
   });
   ```
2. **Selection context**: always show labels on edges connected to the selected node
3. **Toolbar toggle**: "Show edge labels" button in `GraphToolbar.tsx` → `cy.edges().toggleClass("labeled")`

### Files
- `crates/app/src/components/GraphView/GraphView.tsx` — layout options + zoom listener
- `crates/app/src/components/GraphView/graphStyles.ts` — `.labeled` class, default label visibility
- `crates/app/src/components/GraphView/GraphToolbar.tsx` — label toggle button
- `crates/app/package.json` — add `cytoscape-fcose`

---

## Improvement 2: Full-Screen Note View

### Goal
Expand the editor to fill the full window (or hide the graph column) to focus on writing, with a button or shortcut to restore the split view.

### Recommended approach: CSS flex collapse (keeps Cytoscape mounted)

Hiding the graph with `display: none` would destroy and remount the Cytoscape instance, losing node positions. Instead, collapse the graph column's flex width to 0 with a CSS transition — Cytoscape stays alive but invisible.

```tsx
// AppLayout.tsx
const focusMode = useUiStore(s => s.focusMode);

<div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
  <div style={{
    flex: focusMode ? "0 0 0" : "0 0 60%",
    overflow: "hidden",
    transition: "flex 0.2s ease",
  }}>
    <GraphView />
  </div>
  <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
    <EditorPanel />
    <SearchPanel />
  </div>
</div>
```

### Trigger and restore
- **Trigger**: "Expand" button (⤢ icon) in `EditorPanel.tsx` header → `uiStore.toggleFocusMode()`
- **Restore**: same button (⤡ icon when active), or Escape key (extend the existing Escape handler in `App.tsx`)

### Store changes
```ts
// uiStore.ts additions
focusMode: false,
toggleFocusMode: () => set(s => ({ focusMode: !s.focusMode })),
```

### Files
- `crates/app/src/stores/uiStore.ts` — add `focusMode`, `toggleFocusMode`
- `crates/app/src/components/Layout/AppLayout.tsx` — conditional flex width + transition
- `crates/app/src/components/Editor/EditorPanel.tsx` — expand/collapse button in header
- `crates/app/src/App.tsx` — extend Escape handler to also close focus mode

---

## Improvement 3: Related Notes Footer in Editor

### Goal
Show incoming and outgoing links for the active note directly below the editor — graph context without switching to the graph view.

### Data (no new API call needed)
- **Outgoing links**: `editorStore.activeNote.links` — already loaded with the note
- **Incoming links**: filter `graphStore.edges` where `edge.target === activeNote.path` — already in memory

### Component: `RelatedNotesFooter.tsx`

```
─── Related Notes (5) ────────────────────────────────
→  causes          Correlation and Causation
→  supports        RCT validity
←  depends-on      Instrumental Variables
←  sourced-from    The Book of Why
```

- Arrow direction: `→` outgoing, `←` incoming
- Rel type shown as a dim badge
- Click any item → `graphStore.selectNode(path)` (highlights in graph + opens in editor)
- Max 10 items; "Show N more" if >10
- Collapsed by default; expand toggle persisted in `uiStore`

### Implementation

```tsx
// RelatedNotesFooter.tsx
const activeNote = useEditorStore(s => s.activeNote);
const edges = useGraphStore(s => s.edges);

const related = useMemo(() => {
  if (!activeNote) return [];
  const outgoing = (activeNote.links ?? []).map(l => ({ dir: "out", rel: l.rel, path: l.target, title: l.target }));
  const incoming = edges
    .filter(e => e.target === activeNote.path)
    .map(e => ({ dir: "in", rel: e.rel, path: e.source, title: e.source }));
  return [...outgoing, ...incoming].slice(0, 10);
}, [activeNote, edges]);
```

Titles can be resolved from `graphStore.nodes.get(path)?.title` for display.

### Files
- `crates/app/src/components/Editor/RelatedNotesFooter.tsx` — new component
- `crates/app/src/components/Editor/EditorPanel.tsx` — mount footer between editor body and bottom
- `crates/app/src/stores/uiStore.ts` — optional `relatedNotesOpen: boolean` for persistence
- `crates/app/src/App.css` — footer styles

---

## Improvement 4: Left-to-Right Hierarchical Layout

### Goal
Offer a ranked layout that flows left-to-right — foundational concepts (causes, precedes) on the left, derived or specific concepts on the right.

### Approach: cytoscape-dagre

```bash
npm install cytoscape-dagre dagre
```

```ts
import dagre from "cytoscape-dagre";
cytoscape.use(dagre);

cy.layout({
  name: "dagre",
  rankDir: "LR",
  nodeSep: 60,
  rankSep: 120,
  edgeSep: 20,
  animate: false,
  fit: true,
  padding: 40,
}).run();
```

### Edge filtering for ranking
Only directional edge types contribute to dagre's rank assignment. The 8 directional types from the seed dataset:

`precedes`, `leads-to`, `causes`, `extends`, `depends-on`, `evolved-from`, `part-of`, `contains`

Non-directional edges (`related-to`, `mentioned-in`, `authored-by`, `sourced-from`, `contradicts`, `supports`, `exemplifies`) are still rendered but excluded from the dagre input for ranking — dagre ignores edges not in its element set.

### Toolbar integration

Add a layout selector to `GraphToolbar.tsx`:

```tsx
<select value={graphLayout} onChange={e => setGraphLayout(e.target.value)}>
  <option value="force">Force</option>
  <option value="hierarchical">Hierarchical (LR)</option>
</select>
```

Switching triggers `cy.layout(...).run()` — no re-fetch, just repositions elements already in the graph.

### Files
- `crates/app/package.json` — add `cytoscape-dagre`, `dagre`
- `crates/app/src/components/GraphView/GraphView.tsx` — layout switching logic
- `crates/app/src/components/GraphView/GraphToolbar.tsx` — layout dropdown
- `crates/app/src/stores/uiStore.ts` — add `graphLayout: "force" | "hierarchical"`

---

## Improvement 5: Resizable Panels

### Goal
Allow dragging the dividers between graph, editor, and search panels to redistribute screen space.

### Recommended library: react-resizable-panels

- `npm install react-resizable-panels` — 15KB, zero dependencies, actively maintained
- Provides `<PanelGroup>`, `<Panel>`, `<PanelResizeHandle>` — drop-in for the current flex layout
- Handles mouse/touch capture, min/max constraints, and keyboard accessibility

### Layout structure

```tsx
// AppLayout.tsx
<PanelGroup direction="horizontal" onLayout={savePanelSizes}>
  <Panel defaultSize={panelSizes.graph ?? 60} minSize={15} id="graph">
    <FileTreePanel />   {/* if treeOpen */}
    <GraphView />
  </Panel>
  <PanelResizeHandle className="resize-handle-h" />
  <Panel defaultSize={panelSizes.right ?? 40} minSize={15} id="right">
    <PanelGroup direction="vertical">
      <Panel defaultSize={panelSizes.editor ?? 70} minSize={20} id="editor">
        <EditorPanel />
      </Panel>
      <PanelResizeHandle className="resize-handle-v" />
      <Panel defaultSize={panelSizes.search ?? 30} minSize={10} id="search">
        <SearchPanel />
      </Panel>
    </PanelGroup>
  </Panel>
</PanelGroup>
```

### Persistence
```ts
// uiStore.ts
panelSizes: JSON.parse(localStorage.getItem("brainmap:panelSizes") ?? "{}"),
savePanelSizes: (sizes) => {
  localStorage.setItem("brainmap:panelSizes", JSON.stringify(sizes));
  set({ panelSizes: sizes });
},
```

### Resize handle styles
(CSS snippet in plan)

### Files
- `crates/app/package.json` — add `react-resizable-panels`
- `crates/app/src/components/Layout/AppLayout.tsx` — replace flex divs with PanelGroup
- `crates/app/src/stores/uiStore.ts` — add `panelSizes`, `savePanelSizes`
- `crates/app/src/App.css` — resize handle styles

---

## Improvement 6: Directory / File Tree View

### Goal
Add a collapsible file tree sidebar showing the workspace folder structure, enabling navigation by path rather than graph position.

### Data source (no new API call)
`graphStore.nodes` keys are relative paths like `"concepts/causal-inference.md"`. Tree is built client-side by splitting on `/`.

### Tree derivation
(TypeScript algorithm in plan — builds nested TreeNode structure)

### Component: `FileTreePanel.tsx`
- Folder click: toggle expand/collapse
- File click: `graphStore.selectNode(path)` → opens in editor + highlights in graph
- Filter input at top
- All folders expanded by default

### Placement
Inside graph column (far left), collapsible. With react-resizable-panels, the graph column nests FileTreePanel + GraphView with its own PanelResizeHandle.

Toggle via `uiStore.treeOpen`. Cmd+B shortcut.

### Files
- `crates/app/src/components/Layout/FileTreePanel.tsx` — new
- `crates/app/src/components/Layout/AppLayout.tsx` — add tree panel inside graph column
- `crates/app/src/stores/uiStore.ts` — add `treeOpen`, `toggleTree`, `treeExpandedFolders`
- `crates/app/src/App.css` — tree styles
- `crates/app/src/App.tsx` — Cmd+B shortcut

---

## Additional Opportunities
- A. Wire InspectorPanel (already built, orphaned)
- B. Node sizing by in-degree
- C. Color legend overlay
- D. Hover tooltips on nodes
- E. Remove debug overlay

## Priority Matrix
P0: Fix overlap, remove debug
P1: Resizable panels, file tree, full-screen, related notes footer
P2: Hierarchical layout, wire InspectorPanel
P3: Node sizing, color legend, hover tooltips

---

Please write your review findings to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/ux-improvements-review-1.md`.

Focus specifically on:
1. Is there an interaction conflict between `react-resizable-panels` and the `focusMode` flex-collapse approach (Improvement 2)?
2. Does the dagre edge-filtering strategy (Improvement 4) actually work as described — does dagre truly "ignore" edges not passed to it?
3. Are there any missing edge cases in the file tree (Improvement 6) — e.g., notes at root level, paths with no slash?
4. Is the `localStorage` persistence strategy (Improvement 5) appropriate for a Tauri app, or should it use Tauri's store plugin?
5. Any other architectural, scope, edge-case, testing, or data-model issues.

---

## Assistant

I'll review the plan thoroughly, examining the codebase to ground my findings in reality.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/","description":"List app source structure"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/","description":"List components"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/","description":"List stores"}`

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

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphToolbar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Inspector/InspectorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Inspector/","description":"List Inspector component files"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/ 2>/dev/null || echo \"directory does not exist\"","description":"Check if reviews/plans directory exists"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/10-ux-improvements.md"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/seed/ | head -20","description":"Check seed dataset structure"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/seed/Concepts/ | head -5 && ls /Users/bsmonteiro/Desktop/Personal/brainmap/seed/ ","description":"Check seed directory structure for root-lev`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/seed -maxdepth 1 -name \"*.md\" | head -10","description":"Check for root-level notes in seed dataset"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/seed -name \"*.md\" | head -5 && find /Users/bsmonteiro/Desktop/Personal/brainmap/seed -name \"*.md\" -maxdepth 2 | wc -l","description":"C`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/","description":"List Layout component files"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cat src-tauri/Cargo.toml 2>/dev/null || cat src-tauri/tauri.conf.json 2>/dev/null | head -30","description":"Check Tauri config for available plugins"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/","description":"List Tauri source files"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cat /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/tauri.conf.json","description":"Read Tauri config for CSP and store plugin config"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1,"limit":60}`

---

## Assistant

Now I have enough context to write a thorough review. Let me check one more thing about the Escape handler and the `focusMode`/`react-resizable-panels` interaction.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"Escape\\|escape\\|closeCommandPalette\\|commandPalette\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","description":"Check if Escape handler exists in App.`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -rn \"Escape\\|escape\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/ --include=\"*.tsx\" --include=\"*.ts\"","description":"Check for Escape key handling in `

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/CommandPalette/CommandPalette.tsx","offset":75,"limit":20}`

---

## Assistant

Now I have all the information I need. Let me write the review.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"mkdir -p /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans","description":"Ensure reviews/plans directory exists"}`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/ux-improvements-review-1.md","content":"# Plan Review: UX Improvements (docs/10-ux-improvements.md)\n\nReviewer: plan-re`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/ux-improvements-review-1.md`.

Here is a summary of the findings:

---

**Blocker 1 — focusMode vs. react-resizable-panels conflict (architecture)**

The CSS flex-collapse approach in Improvement 2 (`flex: "0 0 0"`) directly conflicts with Improvement 5 (`react-resizable-panels`). After AppLayout is rewritten to use `<PanelGroup>`, the raw `<div>` the flex override targets no longer exists. The library's internal size model also has no knowledge of the CSS override, so toggling focus mode off will produce inconsistent state. Fix: use `react-resizable-panels`' imperative panel API (`panelRef.current.collapse()` / `.expand()`) instead of the CSS approach. The `focusMode` boolean in uiStore is fine; only the AppLayout wiring changes.

**Blocker 2 — dagre edge filtering is factually wrong (edge-case)**

The plan states dagre "ignores edges not in its element set," implying you can pass all 196 edges and dagre will silently skip the undirected ones. This is not how the library works. `cytoscape-dagre` runs on whatever elements are currently in the Cytoscape instance. Undirected cyclic edges (`related-to`, `contradicts`, etc.) passed to dagre will corrupt the rank assignment. Fix: call `.layout()` on a filtered element collection containing only nodes plus the 8 directional edge types — `cy.elements().filter(...)` — so dagre only ranks using those edges.

**Should-fix 1 — treeExpandedFolders uses segment names not full paths (edge-case)**

If two folders at different depths share the same name (e.g., `books/references` and `papers/references`), expand/collapse state bleeds between them because `uiStore.treeExpandedFolders` is a `Set<string>` keyed by segment name. Fix: store full folder paths in the set. The `buildTree` function should accumulate the full path on each folder `TreeNode` so the component can use it as the key.

**Should-fix 2 — localStorage is an acceptable but undocumented limitation for Tauri (architecture)**

`localStorage` works in Tauri v2 but can be cleared by OS cache management or app updates. The plan should explicitly note the limitation. For panel size preferences this is acceptable; introducing `tauri-plugin-store` for this alone is not worth the added Rust dependency.

**Should-fix 3 — Related Notes Footer memo shows raw paths, not titles (edge-case)**

The `useMemo` snippet uses `l.target` as `title`, which is a file path, not a display title. The plan mentions title resolution as a footnote rather than incorporating it into the code, making it a copy-paste trap. Incorporate `graphStore.nodes.get(path)?.title` into the snippet and add `graphStore.nodes` as a memo dependency.

**Suggestion 1 — RelatedNotesFooter duplicates InspectorPanel (scope)**

`InspectorPanel.tsx` is already fully implemented and shows the same data (incoming + outgoing links with navigation). Consider wiring it first (trivial, no new code) before building a second component.

**Suggestion 2 — zoom listener and toolbar toggle fight over edge label visibility (edge-case)**

The inline `.style()` call in the zoom listener takes precedence over class-based styles, so the toolbar "Show labels" toggle and the zoom threshold will override each other. Consolidate label visibility into a single source-of-truth boolean and apply one style update when it changes.

---

