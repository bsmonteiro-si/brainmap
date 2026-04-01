# 2026-03-11 — Subagent Transcript: Explore

**Date:** 2026-03-11 19:14:58
**Agent:** Explore
**Agent ID:** a551f6325bc1b41a8
**Parent Session:** cac98a5e-bb31-4585-8135-4876e33d5c71

---

## User

Explore the desktop app's metadata display components. I need to understand:
1. How the metadata/inspector panel currently renders frontmatter fields (Title, Type, Tags, Status, Source, etc.)
2. What component files are involved
3. How the panel gets its data
4. The current InspectorPanel or MetadataPanel component structure

Look in `crates/app/src/` for React components. Be thorough - check for any existing edit functionality or form components.

---

## Assistant

I'll explore the desktop app's metadata display components to understand the current inspector/metadata panel implementation.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"*.tsx\" -o -name \"*.ts\" | head -30"}`

---

## Assistant

Let me search for inspector or metadata-related components more specifically:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f \\( -name \"*Inspector*\" -o -name \"*Metadata*\" -o -name \"*Panel*\" \\) | grep -E \"\\.(tsx|ts)$\""}`

---

## Assistant

Let me get a full list of components to understand the structure:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components -type f -name \"*.tsx\" | sort"}`

---

## Assistant

Now let me check the AppLayout to understand the right column structure:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

Now let me check the EditorPanel to see how metadata is currently displayed:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

Perfect! Now let me check the FrontmatterForm to see the current metadata display:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx"}`

---

## Assistant

Now let me check the NoteDetail type to understand the data structure:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"types.ts\" -o -name \"types.tsx\" | head -5"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

Now let me check the SearchPanel to see if it has any metadata display:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Search/SearchPanel.tsx"}`

---

## Assistant

Let me check the editorStore to understand how note data flows:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

Let me check the CSS to understand the styling of the frontmatter form:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f \\( -name \"*.css\" -o -name \"*.scss\" \\) | sort"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","limit":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":200,"limit":200}`

---

## Assistant

Let me check the DTO/types and how frontmatter maps to the data model:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates -name \"dto.rs\" -o -name \"model.rs\" | head -5"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs"}`

---

## Assistant

Now let me check the core model to understand the frontmatter structure:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs","limit":150}`

---

## Assistant

Perfect! Now let me look at the RelatedNotesFooter to see if there's any metadata display there:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx"}`

---

## Assistant

Let me check if there are any other components I might have missed, especially in the Commands or API handlers:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src -type f -name \"*.rs\" | sort"}`

---

## Assistant

Let me check the commands to see how updateNote is handled:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs"}`

---

## Assistant

Now let me check the handlers to see how updateNote processes the parameters:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"handle_update_note\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs | head -5"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","offset":75,"limit":50}`

---

## Assistant

Perfect! Now let me get a comprehensive overview by looking at the workspace API to understand what data is available:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"pub fn update_note\\|pub fn read_note\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs | head -10"}`

---

## Assistant

Now let me create a comprehensive summary. Let me look at one more thing - the App.css for the complete picture of the FrontmatterForm styling:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 50 \"\\.frontmatter\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Perfect! Now I have a complete picture. Let me provide a comprehensive exploration report.

## Desktop App Metadata Display Components - Comprehensive Exploration

I've thoroughly explored the desktop app's metadata display architecture. Here's what I found:

### 1. Current Metadata Panel Component

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx`

The current implementation is a **read-only** collapsible metadata section that displays:
- **Title** (read-only)
- **Type** (read-only)
- **Tags** (comma-separated read-only)
- **Status** (read-only, displays "—" if null)
- **Source** (read-only, conditionally displayed only if present)

The component uses simple HTML `<input>` elements with `readOnly` attribute and conditional rendering for optional fields.

### 2. Data Flow Architecture

**Component Hierarchy**:
```
EditorPanel
  ├── FrontmatterForm (metadata display)
  ├── MarkdownEditor / MarkdownPreview (body content)
  └── RelatedNotesFooter (edges/links)
```

**Data Source**: 
- `activeNote` from `useEditorStore` (Zustand store)
- Type: `NoteDetail` interface

**NoteDetail Structure** (from `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts`):
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
  links: TypedLinkDto[];
  extra: Record<string, unknown>;
  body: string;
}
```

### 3. Backend DTO Layer

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs`

**NoteDetailDto** maps Rust `Note` frontmatter to TypeScript `NoteDetail`:
- All standard frontmatter fields (title, type, tags, status, created, modified, source, summary)
- **TypedLink** array for explicit typed links
- **extra** field: `HashMap<String, serde_json::Value>` for type-specific custom fields
- **body**: markdown content

The DTO includes YAML↔JSON conversion helpers (`yaml_map_to_json`, `json_to_yaml`) to bridge the IPC boundary.

### 4. Available Frontmatter Fields

**From Core Data Model** (`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs`):

```rust
pub struct Frontmatter {
  pub id: NoteId,
  pub title: String,
  pub note_type: String,
  pub tags: Vec<String>,
  pub status: Option<Status>,  // Enum: Draft, Review, Final, Archived
  pub created: NaiveDate,
  pub modified: NaiveDate,
  pub source: Option<String>,
  pub summary: Option<String>,
  pub links: Vec<TypedLink>,  // Explicit typed relationships
  pub extra: HashMap<String, serde_yaml::Value>,  // Custom type-specific fields
}
```

**Currently NOT displayed in metadata panel**:
- `id` (UUID)
- `created` date (available in NoteDetail)
- `modified` date (available in NoteDetail)
- `summary` (available in NoteDetail)
- `extra` (custom fields, available in NoteDetail)

### 5. Data Flow Path

1. **UI Selection**: Click node in graph or search result
2. **Store Action**: `useEditorStore.openNote(path)` 
3. **API Call**: `api.readNote(path)` → Tauri command `get_node_content`
4. **Backend Handler**: `handler_read_note(ws, path)` → `ws.read_note(path)` → returns `Note`
5. **DTO Conversion**: `NoteDetailDto::from(&Note)` (implements From trait)
6. **IPC Transport**: Serialized JSON over Tauri bridge
7. **Store Update**: `activeNote = note` in editorStore
8. **Component Render**: FrontmatterForm reads from `activeNote`

### 6. Update Mechanism

**Command**: `update_node` (Tauri command)

**UpdateNoteParams**:
```typescript
interface UpdateNoteParams {
  path: string;
  title?: string;
  note_type?: string;
  tags?: string[];
  status?: string;
  source?: string;
  summary?: string;
  extra?: Record<string, unknown>;
  body?: string;
}
```

**Backend Path**: `commands.rs:update_node` → `handlers.rs:handle_update_note` → `ws.update_note(...)` → file write

**Current Status**: The FrontmatterForm inputs are all `readOnly` — no edit functionality exists yet. The `updateNote` API call is already wired in editorStore (for body content via `saveNote()`) but not for metadata fields.

### 7. Related Components

**EditorPanel** (`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx`):
- Orchestrates the three sub-components (FrontmatterForm, MarkdownEditor/Preview, RelatedNotesFooter)
- Manages view mode toggle (Edit/Preview)
- Handles external file change conflicts
- Displays editor title and focus mode button

**RelatedNotesFooter** (`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx`):
- Shows outgoing links (from `activeNote.links`) and incoming edges
- Clickable to navigate to related notes
- Expandable/collapsible with "Show more" pagination

**AppLayout** (`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx`):
- Right column structure: Editor panel (60% default) + Search panel (40% default)
- No third inspector/metadata-only panel currently exists
- PANEL_IDS constants: graph, right, editor, search

### 8. Styling

**CSS Classes** (from `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`):
- `.frontmatter-form`: secondary background, flex column, bottom border
- `.frontmatter-fields`: 4px top, 12px horizontal padding, 8px gap between fields
- `.frontmatter-form label`: flex row, 8px gap, secondary text color
- `.frontmatter-form label span`: min-width 60px, bold
- `.frontmatter-form input/select`: flex 1, 4px padding, primary background, primary text

The inputs use CSS variables for theming (dark/light mode support) and inherit font settings from UIStore.

### Summary

The metadata display is currently a **simple read-only collapsible form** embedded at the top of the EditorPanel. It shows 5 fields (Title, Type, Tags, Status, Source) but the data model supports 9+ frontmatter fields. The infrastructure for editing exists (updateNote API, UpdateNoteParams structure) but is not wired to the UI inputs. There's no separate inspector/metadata panel — it's integrated directly into the editor.

---

