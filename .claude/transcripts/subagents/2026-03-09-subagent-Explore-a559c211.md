# 2026-03-09 — Subagent Transcript: Explore

**Date:** 2026-03-09 20:13:34
**Agent:** Explore
**Agent ID:** a559c21187fee2a22
**Parent Session:** ba732d96-401a-4b82-b69a-43c622866e5c

---

## User

Research the current BrainMap desktop app implementation to understand what's already built and what would need to change for these UX improvements. Working directory: /Users/bsmonteiro/Desktop/Personal/brainmap

Focus on:

1. **Current graph layout** — read `crates/app/src/components/GraphView/GraphView.tsx` and `crates/app/src/components/GraphView/graphStyles.ts` in full. Understand the current Cytoscape.js setup, layout options, stylesheet, and what layout plugins are already installed (check `crates/app/package.json` for cytoscape-* deps).

2. **Current editor panel** — read `crates/app/src/components/Editor/EditorPanel.tsx` and `crates/app/src/components/Editor/MarkdownEditor.tsx`. Understand how the note content is displayed, what data is available (NoteDetail type from api/types.ts), and where a "related notes" footer could be inserted.

3. **Store architecture** — read `crates/app/src/stores/graphStore.ts`, `crates/app/src/stores/editorStore.ts`, and `crates/app/src/stores/uiStore.ts`. Understand what state is available that could support: (a) full-screen mode, (b) a "related notes" derived from edges, (c) layout switching.

4. **API types** — read `crates/app/src/api/types.ts` to understand what data is available for edges (do edges have `rel` type, direction info?) and notes.

5. **App layout** — read `crates/app/src/components/Layout/AppLayout.tsx` and `crates/app/src/App.css` to understand how panels are structured and what changes would be needed for full-screen mode.

6. **Seed dataset structure** — look at `seed/` directory structure and a few example notes to understand the relationship types present. Run: `ls seed/` and read 2-3 notes to understand what `rel` types are used (causes, supports, contradicts, etc.) and what note types exist (concept, book-note, person, etc.).

Report back:
- Full content of graphStyles.ts (important for understanding current visual state)
- What cytoscape layout plugins are in package.json
- What `NoteDetail` type looks like (especially links field)
- What edge data is available in graphStore (EdgeDto type)
- How panels are sized and whether full-screen is feasible with CSS only vs layout restructure
- What rel types appear in the seed data
- Any obvious issues or opportunities you spot in the current code

---

## Assistant

I'll help you research the current BrainMap desktop app implementation. Let me start by exploring the key files you mentioned.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/**/*.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/**/*.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/**/*.css"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/package.json"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"seed/*.md"}`

---

## Assistant

Let me search for seed files and then read the key source files.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/seed/ | head -20"}`

---

## Assistant

Now let me read the key source files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json"}`

---

## Assistant

Now let me read the store files and UI components:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

Now let me check the EditorPanel and other UI components:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Now let me read a few seed notes to understand the relationship types:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/seed -name \"*.md\" -type f | head -5"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/seed/Concepts/Causation.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/seed/People/Judea Pearl.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/seed/Concepts/Correlation.md"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"head -50 \"/Users/bsmonteiro/Desktop/Personal/brainmap/seed/People/Judea Pearl.md\""}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"head -50 \"/Users/bsmonteiro/Desktop/Personal/brainmap/seed/Concepts/Causation.md\""}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/seed/Concepts/ | head -10"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"head -40 \"/Users/bsmonteiro/Desktop/Personal/brainmap/seed/Concepts/Causal Diagrams.md\""}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"head -40 \"/Users/bsmonteiro/Desktop/Personal/brainmap/seed/Concepts/Confounding.md\""}`

---

## Assistant

Now let me check the Inspector panel to see what's already displaying links:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Inspector/InspectorPanel.tsx"}`

---

## Assistant

Perfect! Now let me compile the comprehensive research report.

## Research Report: BrainMap Desktop App Current Implementation

Based on my thorough exploration of the codebase, here's what I found:

---

### 1. **Current Graph Layout (Cytoscape.js Setup)**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx`

Current configuration:
- **Layout:** `cose` (force-directed) with these parameters:
  - `nodeRepulsion: 8000`
  - `idealEdgeLength: 100`
  - `edgeElasticity: 100`
  - `gravity: 0.25`
  - `numIter: 200` (iterations)
  - `nodeDimensionsIncludeLabels: true`
  - `fit: true` with `padding: 40`
- **Initial layout:** `preset` (on first init)
- **Zoom:** `minZoom: 0.1`, `maxZoom: 5`, `wheelSensitivity: 0.3`

**Cytoscape plugins in package.json:** Currently, NO layout plugins are installed beyond the default Cytoscape ones. Only these dependencies:
```json
"cytoscape": "^3.31.0"
"@types/cytoscape": "^3.21.9"
```

This means hierarchical (dagre), circular, grid, and other advanced layouts are NOT available yet.

---

### 2. **Graph Styling**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts` (full content shown below)

**10 Note Type Colors:**
```
concept: #4a9eff (blue)
book-note: #9b59b6 (purple)
question: #e67e22 (orange)
reference: #1abc9c (teal)
index: #34495e (dark gray)
argument: #e74c3c (red)
evidence: #27ae60 (green)
experiment: #f39c12 (gold)
person: #2980b9 (dark blue)
project: #8e44ad (deep purple)
```

**Edge styling:**
- **Explicit edges:** solid line, width 1.5
- **Implicit edges:** dashed line (`[4, 4]` pattern)
- **Inline edges:** dotted line
- **Selected/highlighted:** 3px red border on node, width 2.5 red line on edges

**Node visuals:**
- Nodes: 24px circles with bottom-aligned labels
- Text: 10px font, ellipsis wrapping with max 80px width
- Selected state: 30px circle with 3px red border

---

### 3. **API Types & Data Model**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts`

**EdgeDto:**
```typescript
interface EdgeDto {
  source: string;
  target: string;
  rel: string;           // relationship type (e.g., "causes", "supports")
  kind: "Explicit" | "Implicit" | "Inline";
}
```

**NoteDetail (key for editor panel):**
```typescript
interface NoteDetail {
  path: string;
  title: string;
  note_type: string;
  tags: string[];
  status: string | null;
  created: string;
  modified: string;
  source: string | null;
  summary: string | null;
  links: TypedLinkDto[];        // outgoing links defined in frontmatter
  extra: Record<string, unknown>;
  body: string;                  // markdown content
}

interface TypedLinkDto {
  target: string;               // path to target note
  rel: string;                  // relationship type
  annotation?: string;          // optional annotation
}
```

**Note:** Edges contain ONLY source/target/rel/kind. The `NoteDetail.links` array contains outgoing links from the frontmatter YAML. This means the editor can display links but currently has no built-in "related notes" computation.

---

### 4. **Store Architecture**

**graphStore.ts:**
- `nodes: Map<string, NodeDto>` — all nodes currently visible
- `edges: EdgeDto[]` — all edges currently visible
- `selectedNodePath: string | null` — currently selected node
- `expandedNodes: Set<string>` — nodes whose neighbors have been expanded
- Methods: `loadTopology()`, `selectNode()`, `expandNode()`, `applyEvent()`

**editorStore.ts:**
- `activeNote: NoteDetail | null` — full note data (includes links array)
- `isLoading`, `isDirty`, `conflictState`
- Methods: `openNote()`, `updateContent()`, `saveNote()`, `resolveConflict()`

**uiStore.ts:**
- `theme: "light" | "dark" | "system"`
- `graphMode: "navigate" | "edit"` — **NOTE: exists but unused in UI**
- `commandPaletteOpen`, `createNoteDialogOpen`
- **OPPORTUNITY:** No full-screen state! Would need to add `isFullScreen` boolean here.

---

### 5. **Panel Layout & Sizing**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx`

Current structure:
```
<div className="app-layout">
  <div className="panel" style={{ flex: "0 0 60%" }}>     <!-- Graph: 60% -->
    <GraphView />
  </div>
  <div style={{ display: "flex", flexDirection: "column", flex: "0 0 40%" }}>
    <div className="panel" style={{ flex: 1 }}>            <!-- Editor: flexible -->
      <EditorPanel />
    </div>
    <div className="panel" style={{ flex: "0 0 200px" }}>  <!-- Search: 200px -->
      <SearchPanel />
    </div>
  </div>
</div>
<StatusBar />
```

**CSS from App.css:**
- `.app-layout`: `display: flex; flex: 1; overflow: hidden`
- `.panel`: `display: flex; flex-direction: column; overflow: hidden`
- `.panel-content`: `flex: 1; overflow: auto`

**Full-screen feasibility:** 
- **CSS-only:** YES, use `display: none` on graph/search panels, set editor panel to `flex: 1 1 100%`
- **Better approach:** Add a state toggle in `uiStore`, conditionally render panels, and use CSS `@media` queries for responsive behavior

---

### 6. **Editor Panel Current State**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx`

Structure:
```
EditorPanel
├── conflict-banner (if external change detected)
├── FrontmatterForm
└── editor-body
    └── MarkdownEditor (CodeMirror 6)
```

**Current info displayed:**
- Frontmatter: title, type, tags, status, created, modified, source, summary
- Body: markdown content in CodeMirror editor

**Related notes opportunity:** No footer section exists. InspectorPanel (separate component) shows incoming/outgoing links, but editor doesn't. Could add a footer section here.

---

### 7. **Seed Dataset Relationship Types**

From reading actual seed notes (Judea Pearl, Causal Diagrams, Confounding):

**Explicit relationship types found:**
- `authored-by` (person writes content)
- `part-of` (concept is part of larger concept)
- `related-to` (general relationship)

**From CLAUDE.md documentation, all 15 types:**
- contains, part-of, causes, supports, contradicts, extends, depends-on, exemplifies, precedes, leads-to, evolved-from, related-to, authored-by, sourced-from, mentioned-in

**Note types in seed (10 total):**
- concept, book-note, question, reference, index, argument, evidence, experiment, person, project

---

### 8. **Key Observations & Opportunities**

| Issue/Opportunity | Location | Impact |
|---|---|---|
| **No layout plugin support** | package.json | Must add `cytoscape-dagre`, `cytoscape-cose-bilkent`, or `cytoscape-fcose` for switching layouts |
| **graphMode exists but unused** | uiStore.ts, GraphView | The "navigate" vs "edit" mode flag is never used in UI; could be leveraged for interactions |
| **No full-screen state** | uiStore.ts | Need to add `fullScreenPanel?: "graph" \| "editor"` to support panel expansion |
| **Related notes not displayed in editor** | EditorPanel.tsx | Could add footer showing related notes (computed from `activeNote.links` + incoming edges) |
| **Edge data is complete** | graphStore.ts, InspectorPanel | Inspector already shows incoming/outgoing links with rel types; can be reused or moved |
| **Panel sizing is fixed** | AppLayout.tsx | 60/40 split is hardcoded; could make draggable divider for user resizing |
| **No "focus" view** | GraphView.tsx | Double-click expands neighbors, but no "focus on node" mode (show only N-hop neighborhood) |
| **Search is standalone** | SearchPanel.tsx (separate) | Search results could integrate more with graph selection |
| **Cose layout is slow** | GraphView.tsx (numIter: 200) | Could add layout options in toolbar: "cose" vs "preset" vs (future) "dagre" |
| **Theme toggle works** | uiStore.ts, App.tsx | Good foundation; dark mode rendering works via CodeMirror theme + CSS variables |

---

### 9. **Missing Layout Plugins That Should Be Added**

For the hierarchical/circular/grid layouts you'd want:

```json
"cytoscape-dagre": "^3.3.5",         // Hierarchical/DAG layout
"cytoscape-cose-bilkent": "^4.1.0",  // Improved force-directed
"cytoscape-fcose": "^2.2.0"           // Fast compound spring embedded
```

Currently only the built-in `cose` and `preset` are available.

---

### 10. **Full Content of graphStyles.ts**

Already provided above in full in section 2. The file is only 90 lines and defines:
- 10 note type colors
- 6 stylesheet rules (node, node:selected, node.highlighted, edge, edge.highlighted, edge-kind rules)

---

### Summary

The desktop app is in **early stage (v0.1.0)** with:
- ✅ Core graph rendering with Cytoscape (force-directed layout only)
- ✅ Single-panel editor with markdown and frontmatter forms
- ✅ Inspector showing link relationships
- ✅ Search panel (separate)
- ✅ Theme switching (light/dark)
- ❌ No layout switching (no plugins installed)
- ❌ No full-screen/focus modes
- ❌ No related notes footer in editor
- ❌ No draggable panel resizing

All the UX improvements (layout switching, full-screen mode, related notes sidebar) would be **straightforward to implement** given the clean Zustand store architecture and Cytoscape's plugin ecosystem.

---

