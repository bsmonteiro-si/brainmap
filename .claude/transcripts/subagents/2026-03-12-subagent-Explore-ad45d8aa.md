# 2026-03-12 — Subagent Transcript: Explore

**Date:** 2026-03-12 11:13:02
**Agent:** Explore
**Agent ID:** ad45d8aad93e99cd5
**Parent Session:** 3c1e025f-00b4-4b7e-abea-e4e723ea4e8c

---

## User

Explore how the "Related Notes" section works in the BrainMap desktop app. I need to understand:

1. The React component that renders the related notes cards (look in crates/app/src/ for components related to "related notes" or "RelatedNotes")
2. How the data is fetched - what Tauri command or API call provides the related notes data
3. The data structure returned - does it include direction info (incoming vs outgoing)?
4. The Rust backend handler that provides neighbors/related notes data (look in crates/app/src-tauri/src/ for handlers)
5. How the core library's graph provides edge direction info (look at edges_for or neighbors methods in crates/core/)

Be thorough - read the full component file, the handler, and the core graph methods.

---

## Assistant

I'll explore the Related Notes section systematically. Let me start by finding the relevant files.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/src/**/RelatedNotes*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/src/**/related*"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -type f -name \"*.ts\" -o -name \"*.tsx\" | grep -i related"}`

---

## Assistant

Now let me read the React component and search for related API calls:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"get_node_summary\\|neighbors\\|related\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src --include=\"*.rs\" | head -20"}`

---

## Assistant

Now let me look at the Tauri commands and handlers:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

Now let me look at the core library's graph methods to understand the edge direction:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"fn neighbors\\|fn edges_for\\|impl Graph\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs | head -40"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs","limit":150}`

---

## Assistant

Let me continue reading the edges_for method:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs","offset":249,"limit":50}`

---

## Assistant

Now let me check the DTO structures to understand the data format:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 20 \"pub struct EdgeDto\\|pub struct SubgraphDto\\|pub struct NeighborsParams\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs | head -60"}`

---

## Assistant

Now let me look at the model.rs to understand the Edge and Direction types:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 10 \"pub struct Edge\\|pub enum Direction\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs | head -40"}`

---

## Assistant

Now let me check how the related notes footer is styled and if there's any API bridge code:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*api*\" -o -name \"*bridge*\" | head -10"}`

---

## Assistant

Let me check the graph store to understand how edges are loaded:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"pub edges\\|edges:\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts | head -20"}`

---

## Assistant

Let me read the graph store more completely:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts","limit":100}`

---

## Assistant

Now let me check the editor store to see how activeNote.links are populated:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"links\\|activeNote\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts | head -30"}`

---

## Assistant

Let me check the NoteDetail type:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 15 \"export interface NoteDetail\\|export type NoteDetail\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

Now let me check what TypedLinkDto is:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 8 \"export interface TypedLinkDto\\|export type TypedLinkDto\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

Perfect! Now let me create a comprehensive summary. Let me also check the Rust side to see how NoteDetail (or the DTO equivalent) gets its links populated:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 20 \"pub struct NoteDetailDto\\|impl From.*NoteDetail\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs | head -80"}`

---

## Assistant

Now let me look at how the related notes styling is done:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -name \"*.css\" -o -name \"*.scss\" | xargs grep -l \"related-note\" 2>/dev/null"}`

---

## Assistant

Let me check the CSS:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 30 \"\\.related-note\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -60"}`

---

## Assistant

Perfect! Now let me verify my understanding by looking at the complete NoteDetail to see the edge information from the backend:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs","limit":100}`

---

## Assistant

Now I have all the information I need. Let me create a comprehensive summary of my findings:

## Summary: How Related Notes Section Works in BrainMap Desktop App

I've thoroughly explored the Related Notes system across the React frontend, Tauri backend, and Rust core library. Here's the complete architecture:

### 1. **React Component: RelatedNotesFooter.tsx**

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx`

**Key Features:**
- Renders a collapsible section at the bottom of the editor showing related notes
- Displays up to 10 related notes by default with a "Show more" button
- Shows relationship direction: incoming ("in") vs outgoing ("out")

**Data Collection Logic:**
The component derives related notes from TWO sources within a `useMemo` hook:

```typescript
const related = useMemo(() => {
  if (!activeNote) return [];
  
  // Outgoing links: from the active note's frontmatter
  const outgoing = (activeNote.links ?? []).map((l) => ({
    dir: "out" as const,
    rel: l.rel,
    path: l.target,
    title: nodes.get(l.target)?.title ?? l.target,
    noteType: nodes.get(l.target)?.note_type ?? "reference",
  }));
  
  // Incoming links: edges where current note is the target
  const incoming = edges
    .filter((e) => e.target === activeNote.path)
    .map((e) => ({
      dir: "in" as const,
      rel: e.rel,
      path: e.source,
      title: nodes.get(e.source)?.title ?? e.source,
      noteType: nodes.get(e.source)?.note_type ?? "reference",
    }));
  
  return [...outgoing, ...incoming];
}, [activeNote, edges, nodes]);
```

**Data Structure of Related Notes:**
Each related note card has:
- `dir`: "out" (outgoing link from active note) or "in" (incoming link to active note)
- `rel`: relationship type (e.g., "supports", "contradicts", "contains")
- `path`: file path of the related note
- `title`: display title of the related note
- `noteType`: type-specific styling (determines color of the left bar)

### 2. **Data Sources**

**activeNote** comes from:
- Zustand `editorStore` (see `useEditorStore((s) => s.activeNote)`)
- Contains full `NoteDetail` with `links: TypedLinkDto[]` array
- Each link has `target`, `rel`, and optional `annotation`

**edges** comes from:
- Zustand `graphStore` (see `useGraphStore((s) => s.edges)`)
- Contains ALL edges in the workspace loaded via `get_graph_topology`
- Each edge is an `EdgeDto` with `source`, `target`, `rel`, and `kind`

**nodes** comes from:
- Zustand `graphStore` as a `Map<string, NodeDto>`
- Used for lookup to get node titles and types

### 3. **Tauri Commands & Handlers**

**Primary Commands:**
- `get_graph_topology` → `handle_get_topology()` → returns all nodes + all edges
- `get_node_content` → `handle_read_note()` → returns full `NoteDetail` with links array

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs` and `handlers.rs`

**How links are included in NoteDetail:**
The `handle_read_note` handler converts a `Note` from the core to `NoteDetailDto`, which includes the frontmatter's `links` field:

```rust
impl From<&Note> for NoteDetailDto {
    fn from(note: &Note) -> Self {
        // ...
        links: note
            .frontmatter
            .links
            .iter()
            .map(|l| TypedLinkDto {
                target: l.target.as_str().to_string(),
                rel: l.rel.clone(),
                annotation: l.annotation.clone(),
            })
            .collect(),
        // ...
    }
}
```

### 4. **Data Flow & Direction Info**

**Outgoing links:** Stored explicitly in the note's YAML frontmatter `links:` array. These are the "out" direction edges.

**Incoming links:** Not stored in the note itself. Instead, the component:
1. Gets the full edge list from `get_graph_topology`
2. Filters edges where `e.target === activeNote.path`
3. These filtered edges represent incoming relationships ("in" direction)

**Direction Inference:**
- If a link appears in the active note's frontmatter → it's outgoing
- If a link appears in the global edges list with active note as target → it's incoming
- The direction information is NOT explicitly stored in the edge DTO; it's inferred from the query context

### 5. **Core Library Graph Methods**

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs`

**Key Methods:**

`edges_for(&path, direction)` — Returns edges filtered by direction:
```rust
pub fn edges_for(&self, path: &RelativePath, direction: &Direction) -> Vec<&Edge> {
    match direction {
        Direction::Outgoing => {
            // Return edges from self.outgoing[path]
        }
        Direction::Incoming => {
            // Return edges from self.incoming[path]
        }
        Direction::Both => {
            // Return both outgoing and incoming
        }
    }
}
```

**Data Structures:**

```rust
pub struct Edge {
    pub source: RelativePath,
    pub target: RelativePath,
    pub rel: String,
    pub kind: EdgeKind,
}

pub enum Direction {
    Outgoing,
    Incoming,
    Both,
}
```

The graph maintains TWO separate indices for efficiency:
- `outgoing: HashMap<RelativePath, Vec<Edge>>` — edges where the path is the source
- `incoming: HashMap<RelativePath, Vec<Edge>>` — edges where the path is the target

### 6. **Component Styling**

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

Key CSS classes:
- `.related-notes-footer` — container with gray background
- `.related-notes-list` — grid layout (4 columns, auto-fill, 200px min-width)
- `.related-note-card` — individual note card with hover effect
- `.related-note-type-bar` — 3px colored bar (color from `getNodeColor(noteType)`)
- `.related-note-rel` — small pill-shaped label showing relationship type

### Data Flow Summary

```
User opens note
    ↓
editorStore.openNote() calls api.readNote(path)
    ↓
Tauri handler returns NoteDetailDto with links[]
    ↓
RelatedNotesFooter reads activeNote.links (outgoing)
RelatedNotesFooter reads graphStore.edges, filters for incoming
    ↓
Combined array with dir + rel + path + title + noteType
    ↓
Render as expandable card grid with max 10 visible
```

All file paths are absolute:
- Component: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx`
- Graph store: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts`
- Editor store: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts`
- Handlers: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs`
- Graph core: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs`
- CSS: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

---

