# 2026-03-10 — Subagent Transcript: Explore

**Date:** 2026-03-10 14:58:57
**Agent:** Explore
**Agent ID:** a5217085242239eee
**Parent Session:** eb29557e-e313-4d7b-ac0e-62d3be484876

---

## User

Explore the Inspector panel in the BrainMap desktop app located at `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/`. 

Find:
1. The Inspector panel component file(s) — what does it render? What data does it show?
2. Where it is mounted in the layout — which parent component includes it, what panel slot does it occupy?
3. How it receives its data — does it use a Zustand store, props, or API calls?
4. Any CSS classes specific to it (`.inspector-panel`, etc.) in `src/App.css`
5. Any Tauri command / API bridge calls it makes
6. Any store state (UIStore, etc.) that drives it (e.g. `selectedNode`, `activeNote`)
7. Whether there are any other components that depend on it or import it

Please read the actual file contents — don't just list file names. I need to understand exactly what the Inspector renders and how it's wired up, so report code snippets.

---

## Assistant

I'll explore the Inspector panel in the BrainMap desktop app systematically, starting with finding the relevant files and then reading their contents.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*nspector*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.css"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"*.tsx\" -o -name \"*.ts\" | head -30"}`

---

## Assistant

Good! I found the Inspector panel file. Now let me read it and trace its dependencies.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Inspector/InspectorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"InspectorPanel|inspector-panel","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.inspector","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content"}`

---

## Assistant

Now let me read the CSS for the Inspector panel and check where it's mounted in AppLayout:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":348,"limit":50}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

Perfect! Now let me check the Zustand stores that the Inspector panel uses:

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

Excellent! Now let me verify if InspectorPanel makes any API calls and check the type definitions:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"InspectorPanel\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.tsx\" --include=\"*.ts\" | grep -v node_modules"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts","offset":1,"limit":100}`

---

## Assistant

Perfect! Now let me check if there are any other references or dependencies in other components:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"inspector\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.tsx\" --include=\"*.ts\" -i | grep -v node_modules"}`

---

## Assistant

Great! Let me check the UIStore to see how the inspector panel size is managed:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

Perfect! Now I have all the information needed. Let me create a comprehensive report.

## Inspector Panel Exploration Report

Based on my thorough exploration of the BrainMap desktop app, here's what I found:

---

### 1. **Inspector Panel Component File**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Inspector/InspectorPanel.tsx`

**What it renders:**
The `InspectorPanel` component displays detailed metadata about the currently selected note in a structured field-based layout:

- **Static metadata fields** (always shown when a note is selected):
  - Title
  - Type (note_type)
  - Tags (comma-joined or "—" if empty)
  - Status (or "—" if null)
  - Created date
  - Modified date
  
- **Conditional metadata fields** (shown only if present in the note):
  - Source (if `activeNote.source` exists)
  - Summary (if `activeNote.summary` exists)

- **Outgoing Links section** (if there are any):
  - Filtered from the edges store where `source === selectedNodePath`
  - Clickable link items showing relationship type and target note title
  - Format: `{rel}: {target.title}`

- **Incoming Links section** (if there are any):
  - Filtered from the edges store where `target === selectedNodePath`
  - Clickable link items showing relationship type and source note title
  - Format: `{rel}: {source.title}`

- **Empty state:** When no node is selected or no note is active, shows "Select a node to view its details."

---

### 2. **Where it's Mounted in the Layout**

**Parent component:** `AppLayout.tsx` (lines 127–156)

**Panel slot structure:**
```
AppLayout (horizontal Group)
├── Left Panel (Graph or Files, ~60%)
└── Right Panel (vertical Group, ~40%)
    ├── EditorPanel (~60%)
    ├── InspectorPanel (lines 139–146, ~20%, collapsible)
    └── SearchPanel (~20%)
```

**Key details:**
- The Inspector occupies the **middle vertical panel** in the right column
- Default size: `20%` (configurable via `panelSizes.inspector`)
- Minimum size: `8%` (set via `minSize` prop)
- **Collapsible:** Users can hide it
- Panel ID (PANEL_IDS constant): `"inspector"`
- Wrapped in a `<Panel>` with a header displaying "Inspector" text

---

### 3. **How it Receives Data**

The component uses **two Zustand stores** to access all its data:

**From `useGraphStore`:**
- `selectedNodePath` (line 5): the path of the currently selected node (string or null)
- `edges` (line 6): array of EdgeDto objects (all edges in the graph)
- `nodes` (line 7): Map<string, NodeDto> with basic node info (for looking up target/source titles)
- `selectNode` action (line 9): function to change the selected node on link click

**From `useEditorStore`:**
- `activeNote` (line 8): NoteDetail object containing all the frontmatter + body
- `openNote` action (line 24): function to load a note when a link is clicked

**Data transformation:**
- Outgoing edges: filtered with `edges.filter((e) => e.source === selectedNodePath)`
- Incoming edges: filtered with `edges.filter((e) => e.target === selectedNodePath)`
- Node title lookups: `nodes.get(e.target)?.title` or fallback to path

**No direct API calls:** InspectorPanel makes zero API calls itself; it relies entirely on data already loaded in the stores.

---

### 4. **CSS Classes in App.css**

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` (lines 348–389)

The Inspector panel uses these CSS classes and styles:

```css
.inspector-panel {
  padding: 12px;
  font-size: var(--ui-font-size);
}

.inspector-panel .field {
  margin-bottom: 10px;
}

.inspector-panel .field-label {
  font-size: var(--ui-font-xs);
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.inspector-panel .field-value {
  color: var(--text-primary);
}

.inspector-panel .links-section {
  margin-top: 16px;
}

.inspector-panel .link-item {
  padding: 4px 0;
  font-size: var(--ui-font-sm);
  cursor: pointer;
  color: var(--accent);
}

.inspector-panel .link-item:hover {
  text-decoration: underline;
}

.inspector-panel .link-rel {
  color: var(--text-muted);
  font-size: var(--ui-font-xs);
  margin-right: 4px;
}
```

**CSS variables used:**
- `--text-muted` (empty state text)
- `--ui-font-size` (field values)
- `--ui-font-xs` (labels and link types)
- `--ui-font-sm` (link items)
- `--text-secondary` (field labels)
- `--text-primary` (field values)
- `--accent` (clickable links)

---

### 5. **Tauri Command / API Bridge Calls**

**Direct calls:** **None.** The Inspector panel does NOT make any direct API calls.

**Indirect calls** (via the stores):
- When a user clicks a link, `handleLinkClick` (lines 22–25) triggers:
  - `selectNode(path)` → updates graph store state only
  - `useEditorStore.getState().openNote(path)` → calls `api.readNote(path)` asynchronously in the store (defined in `editorStore.ts` line 38)

---

### 6. **Store State that Drives It**

**GraphStore (`graphStore.ts`):**
- `selectedNodePath` (string | null): Which node the user has selected
- `nodes` (Map<string, NodeDto>): Lookup table for node metadata (path → {path, title, note_type})
- `edges` (EdgeDto[]): All graph edges with {source, target, rel, kind}
- `selectNode(path)` action: Updates selectedNodePath

**EditorStore (`editorStore.ts`):**
- `activeNote` (NoteDetail | null): The fully loaded note being viewed, containing:
  - `title`, `note_type`, `tags`, `status`, `created`, `modified`, `source`, `summary`
  - `links` array (TypedLinkDto[]) — *not currently used by Inspector*
  - `body`, `path`, and other fields
- `openNote(path)` action: Fetches the note via `api.readNote(path)`

**UIStore (`uiStore.ts`):**
- `panelSizes.inspector` (number): Percentage width of the inspector panel (persisted to localStorage)
- Inspector does NOT directly depend on UIStore, but AppLayout uses it to manage panel sizing

---

### 7. **Other Components that Depend on / Import InspectorPanel**

**Only one:** `AppLayout.tsx` (line 10 import, line 143 JSX mount)

**No other components:**
- No other files import InspectorPanel
- No other components depend on its state or output
- It's a leaf component in the component tree

---

### Summary

The Inspector panel is a **read-only details viewer** that:
- Displays frontmatter metadata and link information for the currently selected note
- Sources all data from `graphStore` (selected node, edges, node lookup) and `editorStore` (active note details)
- Allows users to navigate between notes by clicking outgoing/incoming links
- Persists its panel size via UIStore → localStorage
- Contains no API calls, no business logic, and no child components
- Uses semantic CSS for styling with responsive theme variables

---

