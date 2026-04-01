# 2026-03-11 — Subagent Transcript: Explore

**Date:** 2026-03-11 20:44:56
**Agent:** Explore
**Agent ID:** a6cd8298ca6206a67
**Parent Session:** 39b8b6f7-28e1-4e15-ac42-d06a2cbd1540

---

## User

Explore the BrainMap desktop app to understand how frontmatter editing works and what APIs exist for managing links. I need to understand:

1. **FrontmatterForm component** (`crates/app/src/components/Editor/FrontmatterForm.tsx`) — read the full file. How are fields rendered? What's the save flow? How does it connect to editorStore?

2. **Link management APIs** — Check the BrainMapAPI interface in `crates/app/src/api/types.ts` for `createLink`, `deleteLink`, `listLinks`. Also check `crates/app/src/api/tauri.ts` and `crates/app/src/api/mock/state.ts` for their implementations.

3. **Edge types** — Find the list of 15 edge types. Check `crates/core/src/model.rs` for the EdgeType/RelType enum.

4. **NoteDetail and links** — How does `NoteDetail.links` work? It's `TypedLinkDto[]` with `{target, rel, annotation?}`. Check if the save flow in editorStore handles links updates, or if links are managed separately via createLink/deleteLink.

5. **editorStore** — Check `crates/app/src/stores/editorStore.ts` to understand EditableFrontmatter type and whether it includes links.

6. **Tauri commands** — Check `crates/app/src-tauri/src/commands.rs` and `crates/app/src-tauri/src/handlers.rs` for create_link and delete_link commands.

Be thorough — I need to understand the complete flow for managing links.

---

## Assistant

I'll thoroughly explore the BrainMap desktop app to understand frontmatter and link management. Let me start by reading the key files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

Now let me check the Tauri API implementations and other key files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts"}`

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

Now let me check the mock API implementation and DTOs.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/state.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs"}`

---

## Assistant

Now let me find the Workspace methods for link management in the core library.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"fn create_link|fn delete_link|fn list_links","type":"rust","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","limit":300}`

---

## Assistant

Let me continue reading the workspace.rs file to find the link methods.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":300,"limit":300}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":600,"limit":300}`

---

## Assistant

Perfect! Now let me verify the 15 edge types by searching for them in the config file.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"edge_types|EDGE_TYPES|rel|\"contains\"|\"causes\"","type":"rust","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/config.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/config.rs"}`

---

## Assistant

Perfect! Now let me check if there's a Links panel or related notes section in the editor component.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/*Link* crates/app/src/components/**/*Relation* crates/app/src/components/**/*Related*"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components -type f -name \"*.tsx\" | head -20"}`

---

## Assistant

Good! Now let me look at the RelatedNotesFooter component, which likely displays links.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx","limit":100}`

---

## Assistant

Excellent! Now let me check if there's currently a way to edit links in the UI, by looking at the editor components more thoroughly.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"createLink\\|deleteLink\\|create_link\\|delete_link\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.tsx\" --include=\"*.ts\" 2>/dev/null | head -20"}`

---

## Assistant

Now let me check the mock API to see what implementations exist for link management.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts"}`

---

## Assistant

Perfect! Now let me check how the relative path computation works for links.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"compute_relative_target\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":980,"limit":50}`

---

## Assistant

Perfect! I have gathered all the necessary information. Let me now create a comprehensive analysis document.

## Comprehensive Analysis: BrainMap Frontmatter & Link Management

I've thoroughly explored the BrainMap codebase and can now provide you with a complete understanding of the frontmatter editing and link management systems.

---

## 1. FrontmatterForm Component

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx`

**Architecture:**
- **Collapse/Expand:** The form is initially collapsed; clicking "Edit Metadata" expands/collapses it
- **State Management:** Uses `useEditorStore` hook to access and update frontmatter
  - `editedFrontmatter` (partial state, only changed fields)
  - `updateFrontmatter()` action to commit changes

**Fields Rendered:**
1. **Title** (text input) — validated; error class shown if empty/whitespace
2. **Type** (select) — 10 fixed note types + fallback for unknowns
3. **Status** (select) — empty (unset), draft, review, final, archived
4. **Tags** (TagInput component) — pills-based; `onChange` callback
5. **Source** (text input) — optional string
6. **Summary** (textarea 3 rows) — optional string
7. **Created, Modified** (read-only inputs) — from activeNote.created/modified
8. **Extra Fields** (ExtraFieldsEditor) — key-value pairs via `ExtraFieldsEditor` component

**Key Behavior:**
- Fields are rendered from `editedFrontmatter` if available, otherwise from `activeNote` (server state)
- `updateFrontmatter()` only changes specific fields; merges with existing partial state
- **Links are NOT edited here** — FrontmatterForm deliberately excludes them

---

## 2. EditableFrontmatter Type & EditorStore

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts`

**Definition:**
```typescript
export type EditableFrontmatter = Pick<NoteDetail, 'title' | 'note_type' | 'tags' | 'status' | 'source' | 'summary' | 'extra'>;
```

**Notable Absence:** `links` are explicitly excluded from `EditableFrontmatter`. They are NOT part of the save flow via `updateNote()`.

**Save Flow (Cmd+S):**
1. User presses Cmd+S → `saveNote()` action
2. Validates title is not empty
3. Builds params from `editedBody` and `editedFrontmatter` (only populated fields)
4. Calls `api.updateNote(params)` with:
   - `path`, `title`, `note_type`, `tags`, `status`, `source`, `summary`, `extra`, `body`
5. Re-reads note from server to get authoritative state (refreshed `modified` timestamp)
6. If title/type changed, syncs graph store via `applyEvent`
7. Clears `editedBody` and `editedFrontmatter` (unless concurrent changes detected)

**Key Point:** The `updateNote` API call does NOT include links. Links are managed separately.

---

## 3. Edge Types (15 Total)

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/config.rs`, lines 102–123

The 15 edge types stored in `WorkspaceConfig.edge_types`:

1. `contains`
2. `part-of`
3. `causes`
4. `supports`
5. `contradicts`
6. `extends`
7. `depends-on`
8. `exemplifies`
9. `precedes`
10. `leads-to`
11. `evolved-from`
12. `related-to`
13. `authored-by`
14. `sourced-from`
15. `mentioned-in` (auto-generated for inline markdown links)

---

## 4. Link Management APIs

### 4a. BrainMapAPI Interface

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts`, lines 126–128

```typescript
createLink(source: string, target: string, rel: string, annotation?: string): Promise<void>;
deleteLink(source: string, target: string, rel: string): Promise<void>;
listLinks(path: string, direction: "Outgoing" | "Incoming" | "Both", relFilter?: string): Promise<EdgeDto[]>;
```

**Direction values:** `"Outgoing"` (outgoing links), `"Incoming"` (backlinks), `"Both"`

### 4b. Tauri Implementation

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts`, lines 70–80

```typescript
async createLink(source: string, target: string, rel: string, annotation?: string): Promise<void> {
  return invoke<void>("create_link", { params: { source, target, rel, annotation } });
}

async deleteLink(source: string, target: string, rel: string): Promise<void> {
  return invoke<void>("delete_link", { source, target, rel });
}

async listLinks(path: string, direction: "Outgoing" | "Incoming" | "Both", relFilter?: string): Promise<EdgeDto[]> {
  return invoke<EdgeDto[]>("list_links", { params: { path, direction, rel_filter: relFilter } });
}
```

### 4c. Mock Implementation

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts`, lines 169–203

- `createLink`: Adds EdgeDto to `mockState.edges` + adds link to source note's `links` array
- `deleteLink`: Removes EdgeDto + removes link from source note's `links` array
- `listLinks`: Filters edges by source/target/direction + optional rel_filter

---

## 5. NoteDetail Type & Link Structure

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts`, lines 29–48

```typescript
export interface TypedLinkDto {
  target: string;      // fully-resolved path
  rel: string;         // edge type (e.g., "causes")
  annotation?: string; // optional comment
}

export interface NoteDetail {
  path: string;
  title: string;
  note_type: string;
  tags: string[];
  status: string | null;
  created: string;
  modified: string;
  source: string | null;
  summary: string | null;
  links: TypedLinkDto[];      // ← outgoing links only
  extra: Record<string, unknown>;
  body: string;
}
```

**Important:** `NoteDetail.links` contains **outgoing links only** (where this note is the source). Incoming links (backlinks) are fetched via `listLinks()` with `direction: "Incoming"`.

---

## 6. Tauri Command Layer

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs`, lines 103–123

```rust
#[tauri::command]
pub fn create_link(
    state: State<'_, AppState>,
    params: LinkParams,
) -> Result<(), String> {
  let abs_path = state.with_workspace(|ws| Ok(ws.root.join(&params.source)))?;
  state.register_expected_write(abs_path);  // Notify watcher
  state.with_workspace_mut(|ws| handlers::handle_create_link(ws, params))
}

#[tauri::command]
pub fn delete_link(
    state: State<'_, AppState>,
    source: String,
    target: String,
    rel: String,
) -> Result<(), String> {
  let abs_path = state.with_workspace(|ws| Ok(ws.root.join(&source)))?;
  state.register_expected_write(abs_path);  // Notify watcher
  state.with_workspace_mut(|ws| handlers::handle_delete_link(ws, &source, &target, &rel))
}

#[tauri::command]
pub fn list_links(
    state: State<'_, AppState>,
    params: ListLinksParams,
) -> Result<Vec<EdgeDto>, String> {
  state.with_workspace(|ws| handlers::handle_list_links(ws, params))
}
```

**Key Design:** Link operations register the source note's file as "expected to write" to suppress file watcher events during our own modifications.

---

## 7. Handler Layer (Core Logic)

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs`, lines 171–200

### create_link (lines 171–174)
```rust
pub fn handle_create_link(ws: &mut Workspace, params: LinkParams) -> Result<(), String> {
    ws.create_link(&params.source, &params.target, &params.rel, params.annotation)
        .map_err(|e: BrainMapError| e.to_string())
}
```

### delete_link (lines 177–185)
```rust
pub fn handle_delete_link(
    ws: &mut Workspace,
    source: &str,
    target: &str,
    rel: &str,
) -> Result<(), String> {
    ws.delete_link(source, target, rel)
        .map_err(|e: BrainMapError| e.to_string())
}
```

### list_links (lines 188–200)
```rust
pub fn handle_list_links(ws: &Workspace, params: ListLinksParams) -> Result<Vec<EdgeDto>, String> {
    let direction = match params.direction.as_str() {
        "Incoming" => Direction::Incoming,
        "Outgoing" => Direction::Outgoing,
        _ => Direction::Both,
    };

    let edges = ws
        .list_links(&params.path, &direction, params.rel_filter.as_deref())
        .map_err(|e: BrainMapError| e.to_string())?;

    Ok(edges.into_iter().map(|e| EdgeDto::from(e)).collect())
}
```

---

## 8. Workspace Core Link Operations

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs`

### create_link (lines 457–518)
**Validation:**
- Source note must exist
- Target note must exist
- Link must not already exist (same source, target, rel)

**Operations:**
1. Compute relative target path via `compute_relative_target(source, target)`
2. Append `TypedLink { target: relative_target, rel, annotation }` to source note's `frontmatter.links`
3. Update `frontmatter.modified = Local::now().date_naive()`
4. Serialize note back to file
5. Update index with mtime
6. Create `Edge { source, target (absolute), rel, kind: EdgeKind::Explicit }`
7. Add edge to graph
8. Add edge to index

### delete_link (lines 572–607)
**Validation:**
- Source note must exist
- Link must exist (match by source, target resolved, rel)

**Operations:**
1. Find link by matching `note.path.resolve_relative(&link.target) == target && link.rel == rel`
2. Remove from source note's `frontmatter.links`
3. Update `frontmatter.modified`
4. Serialize note back to file
5. Update index with mtime
6. Remove edge from graph
7. Remove edge from index

### list_links (lines 520–536)
**Returns:** `Vec<&Edge>` filtered by:
- Direction: outgoing (source == path), incoming (target == path), or both
- Optional rel_filter: exact match on `edge.rel`

---

## 9. Relative Path Resolution

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs`, lines 985–1012

```rust
fn compute_relative_target(source: &RelativePath, target: &RelativePath) -> String {
    let source_dir = source.parent().map(|p| p.as_str().to_string()).unwrap_or_default();
    let target_str = target.as_str();

    if source_dir.is_empty() {
        return target_str.to_string();
    }

    let source_parts: Vec<&str> = source_dir.split('/').collect();
    let target_parts: Vec<&str> = target_str.split('/').collect();

    // Find common path prefix
    let common = source_parts
        .iter()
        .zip(target_parts.iter())
        .take_while(|(a, b)| a == b)
        .count();

    // Build relative path with ../ for each level up
    let ups = source_parts.len() - common;
    let mut result = String::new();
    for _ in 0..ups {
        result.push_str("../");
    }
    result.push_str(&target_parts[common..].join("/"));
    result
}
```

**Examples:**
- Source: `Chapter 1/note.md`, Target: `Concepts/SCM.md` → `../Concepts/SCM.md`
- Source: `root.md`, Target: `Chapter 1/note.md` → `Chapter 1/note.md`

---

## 10. RelatedNotesFooter Component

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx`

**Purpose:** Display related notes (outgoing + incoming links) below the editor body.

**Data Flow:**
1. Get `activeNote.links` (outgoing) → map to `{ dir: "out", rel, path (target), title, noteType }`
2. Get `edges` from graphStore filtered by `target === activeNote.path` (incoming) → map to `{ dir: "in", rel, path (source), title, noteType }`
3. Combine outgoing + incoming
4. Display as collapsible card grid, up to 10 visible, "Show N more…" button

**Interaction:** Clicking a card opens that note in the editor.

**Note:** This is currently **read-only** — no UI for editing/adding/removing links.

---

## 11. Current State: No Link Editing UI

**Finding:** There is currently **NO UI for creating or deleting links in the editor.**

- `createLink` and `deleteLink` APIs exist and are fully implemented in the backend
- Mock API (in-memory) has working implementations
- Tauri commands are wired up
- Workspace core methods are complete
- **But:** No React component exists to call these APIs
- `FrontmatterForm` explicitly excludes links
- `RelatedNotesFooter` is read-only

**This is an opportunity:** The full backend infrastructure is in place for a link editor UI.

---

## 12. Link Storage & Serialization

**In Memory (Rust):**
```rust
pub struct TypedLink {
    pub target: String,              // relative path
    #[serde(rename = "type")]
    pub rel: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub annotation: Option<String>,
}

pub struct Frontmatter {
    // ... other fields ...
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub links: Vec<TypedLink>,
}
```

**In YAML File:**
```yaml
---
id: 550e8400-e29b-41d4-a716-446655440000
title: "Example Note"
type: concept
tags: [learning, important]
links:
  - target: ../Concepts/Knowledge.md
    type: supports
    annotation: "Primary source"
  - target: ../References/Book.md
    type: sourced-from
created: 2025-03-11
modified: 2025-03-11
---
Body content here...
```

**JSON DTO (Frontend):**
```typescript
{
  target: "Concepts/Knowledge.md",  // fully resolved
  rel: "supports",
  annotation?: "Primary source"
}
```

---

## 13. Complete Data Flow: Creating a Link

1. **Frontend:** User action triggers `api.createLink(source, target, rel, annotation)`
2. **Tauri Bridge:** Invokes `invoke("create_link", { params: { source, target, rel, annotation } })`
3. **Tauri Backend:** `commands::create_link()` registers source file as "expected write", then calls handler
4. **Handler:** `handlers::handle_create_link(ws, params)` delegates to workspace
5. **Workspace:** `ws.create_link(source_path, target_path, rel, annotation)`
   - Validates both notes exist
   - Checks for duplicate
   - Computes relative target path
   - Appends `TypedLink` to source note's frontmatter.links
   - Serializes to YAML + writes file
   - Updates index
   - Creates edge in graph
6. **File Watcher:** Sees file change, but skips it due to "expected write" registration
7. **Frontend:** Event emitted: `{ type: "edge-created", edge: EdgeDto }`
8. **Graph Store:** Receives event, adds edge to in-memory `edges` array
9. **Editor:** Re-reads note (if still open), updates `activeNote.links`
10. **RelatedNotesFooter:** Re-renders to show new outgoing link

---

## Summary Table

| Component | Location | Status | Links Support |
|-----------|----------|--------|---|
| FrontmatterForm | `components/Editor/FrontmatterForm.tsx` | Complete | ✗ Explicitly excluded |
| editorStore | `stores/editorStore.ts` | Complete | ✗ Not in EditableFrontmatter |
| RelatedNotesFooter | `components/Editor/RelatedNotesFooter.tsx` | Complete | ✓ Read-only display |
| BrainMapAPI | `api/types.ts` | Complete | ✓ Full CRUD |
| TauriBridge | `api/tauri.ts` | Complete | ✓ Wired |
| MockBridge | `api/mock/index.ts` | Complete | ✓ In-memory |
| Tauri Commands | `src-tauri/commands.rs` | Complete | ✓ All 3 ops |
| Handlers | `src-tauri/handlers.rs` | Complete | ✓ All 3 ops |
| Workspace Core | `crates/core/workspace.rs` | Complete | ✓ All 3 ops |
| Link Editor UI | N/A | **Missing** | ✗ Not implemented |

The entire infrastructure is ready—only the UI to create/edit/delete links is missing from the editor.

---

