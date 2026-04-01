# 2026-03-12 — Subagent Transcript: Explore

**Date:** 2026-03-12 11:11:52
**Agent:** Explore
**Agent ID:** a2528ed044230bf59
**Parent Session:** a96985aa-108f-4f35-b1b3-148bc255bd56

---

## User

Explore the LinksEditor component and CreateNoteDialog component in the BrainMap desktop app. I need to understand:

1. How LinksEditor works - the "Target note..." input, datalist autocomplete, how it adds links to existing notes, what APIs it uses (createLink/deleteLink)
2. How CreateNoteDialog works - how it creates new notes, what props it takes, how it's triggered
3. The editorStore - particularly refreshActiveNote and any link-related actions
4. The API bridge - createLink, deleteLink, createNote methods

Focus on files in `crates/app/src/components/` and `crates/app/src/stores/` and `crates/app/src/api/`.

Be thorough - read the full content of LinksEditor, CreateNoteDialog, editorStore, and the API bridge interface.

---

## Assistant

I'll systematically explore the LinksEditor, CreateNoteDialog, editorStore, and API bridge components.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/*.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/stores/*.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/api/*.ts"}`

---

## Assistant

Now let me read the key files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/LinksEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CreateNoteDialog.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts"}`

---

## Assistant

Now let me read the API types and the complete bridge implementation:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts"}`

---

## Assistant

Now let me check the FrontmatterForm to understand how LinksEditor is integrated:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/LinksEditor.test.tsx"}`

---

## Assistant

Now let me check the graphStore to understand applyEvent:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

Perfect! Now let me check the EditorPanel to see how CreateNoteDialog is triggered:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"CreateNoteDialog|openCreateNoteDialog","type":"tsx"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"createNote|openNote","glob":"crates/app/src/stores/editorStore.ts","output_mode":"content"}`

---

## Assistant

Let me check the AppLayout to see the full integration:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx","limit":100}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"openCreateNoteDialog\\|CreateNoteDialog\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.tsx\" -n | head -20"}`

---

## Assistant

Excellent! Now I have all the information needed. Let me compile a comprehensive report.

## Summary Report: LinksEditor, CreateNoteDialog, editorStore, and API Bridge

I have thoroughly explored the BrainMap desktop app components and stores. Here's a complete analysis:

---

### 1. **LinksEditor Component** (`crates/app/src/components/Editor/LinksEditor.tsx`)

**Overview:**
LinksEditor manages explicit outgoing links (relationships) from a note to other notes in the knowledge graph.

**Key Props:**
- `notePath: string` — The source note's file path
- `links: TypedLinkDto[]` — Array of existing outgoing links, each with `target` (path), `rel` (relationship type), and optional `annotation`

**Data Model:**
```typescript
interface TypedLinkDto {
  target: string;      // Path to target note
  rel: string;         // Relationship type (see LINK_TYPES)
  annotation?: string; // Optional annotation
}
```

**Link Types (User-Selectable):**
The component excludes auto-generated types (contains, part-of, mentioned-in) and allows 12 explicit types:
- causes, supports, contradicts, extends, depends-on, exemplifies, precedes, leads-to, evolved-from, related-to, authored-by, sourced-from

**UI Structure:**
1. **Existing Links Display** (lines 124-144):
   - Shows rel label (e.g., "supports")
   - Shows target note title (resolved from nodes Map, or path fallback)
   - Remove button (×) for each link

2. **Add Link Row** (lines 145-181):
   - Text input with `datalist` for autocomplete of target note titles
   - Dropdown select for relationship type (defaults to first type: "causes")
   - Plus button to add the link

**Core Logic:**

1. **Datalist Autocomplete** (lines 36-45):
   - `nodeOptions` is a memoized array of all nodes except self, sorted by title
   - Built from `useGraphStore` which provides all nodes as a Map
   - Dynamically updates when nodes change

2. **Target Resolution** (lines 48-53):
   - User types a title in the input
   - `resolvedTarget` memo finds matching node by exact title match
   - Returns the node's path, or null if no match

3. **Duplicate Detection** (lines 56-61):
   - Checks if a link with the same target and rel already exists
   - Prevents adding duplicate edges

4. **Button State** (line 63):
   - Add button is enabled only if: resolvedTarget exists, is not duplicate, and not busy

**API Integration:**

**`handleAdd` (lines 89-113):**
```typescript
await api.createLink(notePath, resolvedTarget, newRel);
```
- Calls `createLink(source, target, rel)` on the API bridge
- On success:
  - Applies "edge-created" event to graphStore (updates in-memory graph)
  - Calls `refreshActiveNote()` to reload the editor with updated links
  - Clears the input field
- On error: displays "Failed to add link" message

**`handleRemove` (lines 65-87):**
```typescript
await api.deleteLink(notePath, link.target, link.rel);
```
- Calls `deleteLink(source, target, rel)` on the API bridge
- On success:
  - Applies "edge-deleted" event to graphStore
  - Calls `refreshActiveNote()`
- On error: displays "Failed to remove link" message

**State Management:**
- `newTarget`: The title typed into the autocomplete input
- `newRel`: Selected relationship type (default "causes")
- `busy`: Loading state during add/remove operations
- `error`: Error message display

**Integration Points:**
- Uses `useGraphStore` to access all nodes and apply events
- Uses `useEditorStore` to refresh the active note after changes
- Uses `getAPI()` to access the Tauri/Mock bridge

---

### 2. **CreateNoteDialog Component** (`crates/app/src/components/Editor/CreateNoteDialog.tsx`)

**Overview:**
Modal dialog for creating a new note in the knowledge graph. Supports pre-populating the path (e.g., when triggered from a folder context in the file tree).

**Props:**
None — reads from `useUIStore` for initial state and close function

**State Management:**
```typescript
const close = useUIStore((s) => s.closeCreateNoteDialog);
const initialPath = useUIStore((s) => s.createNoteInitialPath); // Set by openCreateNoteDialog
const noteTypes = useWorkspaceStore((s) => s.noteTypes);
```

**Local State:**
- `path`: File path (e.g., "Concepts/My-Note.md")
- `title`: Display title
- `titleManuallyEdited`: Track if user edited title vs. auto-populated from path
- `noteType`: Selected note type from workspace's noteTypes list
- `tags`: Comma-separated tags input
- `body`: Optional initial note body/content
- `pathDirty`: Validation state — only show errors after user has touched the path field
- `isSubmitting`: Loading state during creation
- `error`: Server error message

**Key Features:**

1. **Smart Title Auto-Population** (lines 42-47):
   - When user types a path like `Concepts/My-Note.md`, title auto-populates as "My Note"
   - Function `titleFromPath` removes extension, replaces dashes/underscores with spaces
   - Only updates title if user hasn't manually edited it (`titleManuallyEdited` flag)

2. **Inline Validation** (lines 56-61):
   - `pathError`: Path must end with ".md"
   - `titleError`: Title must not be empty
   - Errors only display after `pathDirty` is true (user has focused/touched the field)
   - Real-time feedback as user types

3. **Focused Inputs:**
   - Path field is auto-focused on mount (line 38)
   - Enter key on path field submits the form (line 102)
   - Escape key anywhere closes the dialog

4. **Form Fields:**
   - Path * (required, must end with .md)
   - Title * (required, auto-populated from path)
   - Type * (required, select from workspace noteTypes)
   - Tags (optional, comma-separated)
   - Body (optional, initial content as markdown)

**API Integration (lines 76-84):**
```typescript
const createdPath = await api.createNote({
  path,
  title: title.trim(),
  note_type: noteType,
  tags: parsedTags,  // split(","), trimmed, filtered
  body: body || undefined,
});
```

**Optimistic Updates (lines 86-91):**
```typescript
// Optimistic: add to graph store immediately
useGraphStore.getState().createNote(createdPath, title.trim(), noteType);

// Open in editor
await useEditorStore.getState().openNote(createdPath);

// Close dialog
close();
```

**Error Handling:**
- If `createNote` throws, error message is displayed and `isSubmitting` reset
- User can retry or cancel

**How It's Triggered:**
1. **Command Palette** (lines 35 in CommandPalette.tsx): Cmd+P → "Create Note"
2. **File Tree + Button** (lines 369, 346 in FileTreePanel.tsx):
   - Toolbar `+` button (no path prefix)
   - Context menu "New Note Here" (passes folder path prefix, e.g., "Folder/")
   - Context menu "New Note in Folder" (passes full file path or "Folder/")
3. **App.tsx** (line 70): Manual trigger via `useUIStore.getState().openCreateNoteDialog()`

---

### 3. **editorStore** (`crates/app/src/stores/editorStore.ts`)

**State Shape:**
```typescript
interface EditorState {
  activeNote: NoteDetail | null;
  isLoading: boolean;
  isDirty: boolean;
  conflictState: "none" | "external-change";
  editedBody: string | null;
  editedFrontmatter: Partial<EditableFrontmatter> | null;
  savingInProgress: boolean;
}
```

**Key Actions:**

**`openNote(path: string)` (lines 36-54):**
- Loads a note from the API
- Warns if discarding unsaved changes (v1 behavior)
- Sets `isLoading` to true, clears conflict state and edits
- Calls `api.readNote(path)` and sets `activeNote`

**`refreshActiveNote()` (lines 56-66):**
- **Critical for LinksEditor and CreateNoteDialog workflows**
- Re-reads the active note from disk/API without changing which note is open
- Used by LinksEditor after link operations to get updated `links` array
- Preserves current editor state (doesn't reset `isDirty`)
- Silently fails if no active note

**`updateContent(body: string)` (lines 68-70):**
- Sets `editedBody` and `isDirty = true`
- Tracks markdown body edits

**`updateFrontmatter(changes)` (lines 72-75):**
- Merges changes into `editedFrontmatter`
- Sets `isDirty = true`
- Used by FrontmatterForm, LinksEditor, etc.

**`saveNote()` (lines 77-136):**
- **Atomic save of body + frontmatter**
- Builds params from `editedBody` and `editedFrontmatter` fields (only includes changed fields)
- Calls `api.updateNote(params)`
- Re-reads note to get server-set `modified` timestamp
- **Graph sync** (lines 111-117): If title or type changed, applies "node-updated" event to graphStore
- Handles concurrent edits: if user made new changes while saving, preserves them
- Sets `savingInProgress = true` during operation

**Conflict Resolution (lines 138-170):**
- `markExternalChange()`: Called when filesystem changes detected
  - If note is clean, auto-reloads
  - If note is dirty, shows conflict banner
- `resolveConflict(action)`: Accept ("accept-theirs") or ignore ("keep-mine") external changes

---

### 4. **API Bridge** (`crates/app/src/api/bridge.ts`)

**Architecture:**
- Factory function `getAPI()` returns either `TauriBridge` (in Tauri) or `MockBridge` (in dev/test)
- Caches the API instance to avoid re-initialization

**BrainMapAPI Interface** (lines 97-134 of types.ts):

**Link-Related Methods:**
```typescript
// Create a new link (explicit edge) from source to target
async createLink(
  source: string,
  target: string,
  rel: string,
  annotation?: string
): Promise<void>;

// Delete an explicit link
async deleteLink(
  source: string,
  target: string,
  rel: string
): Promise<void>;

// List links for a note
async listLinks(
  path: string,
  direction: "Outgoing" | "Incoming" | "Both",
  relFilter?: string
): Promise<EdgeDto[]>;
```

**Note CRUD Methods:**
```typescript
// Create a new note with frontmatter
async createNote(params: {
  path: string;
  title: string;
  note_type: string;
  tags?: string[];
  status?: string;
  source?: string;
  summary?: string;
  extra?: Record<string, unknown>;
  body?: string;
}): Promise<string>;  // Returns the created path

// Update an existing note (only includes non-undefined fields)
async updateNote(params: {
  path: string;
  title?: string;
  note_type?: string;
  tags?: string[];
  status?: string;
  source?: string;
  summary?: string;
  extra?: Record<string, unknown>;
  body?: string;
}): Promise<void>;

// Read a note's full content and metadata
async readNote(path: string): Promise<NoteDetail>;
```

**TauriBridge Implementation** (crates/app/src/api/tauri.ts):

Maps to Tauri commands via `invoke()`:
```typescript
// Link operations
async createLink(source, target, rel, annotation?) {
  invoke<void>("create_link", { params: { source, target, rel, annotation } })
}

async deleteLink(source, target, rel) {
  invoke<void>("delete_link", { source, target, rel })
}

// Note operations
async createNote(params) {
  invoke<string>("create_node", { params })
}

async updateNote(params) {
  invoke<void>("update_node", { params })
}

async readNote(path) {
  invoke<NoteDetail>("get_node_content", { path })
}
```

**Other Key Methods:**
- `getGraphTopology()` → full graph (all nodes and edges)
- `getNodeSummary(path)` → summary (used for tooltips)
- `onEvent(callback)` → Listens to "brainmap://workspace-event" events from Tauri

---

### 5. **Integration Flow Diagram**

**Creating a Link (in LinksEditor):**
```
User types title in datalist input
  ↓
Input auto-resolves title → path (from graph nodes)
  ↓
User clicks "+" button
  ↓
LinksEditor.handleAdd()
  → api.createLink(source, target, rel)
  → graphStore.applyEvent({ type: "edge-created", ... })
  → editorStore.refreshActiveNote()
    → api.readNote() re-fetches note with updated links[]
    → LinksEditor re-renders with new link in the list
```

**Creating a Note (CreateNoteDialog):**
```
User opens dialog (Cmd+P or file tree context)
  ↓
Path field is pre-populated (if triggered from folder)
  ↓
Title auto-populated from path
  ↓
User submits (Cmd+Enter or button)
  ↓
CreateNoteDialog.handleSubmit()
  → api.createNote({ path, title, note_type, tags, body })
  → graphStore.createNote() [optimistic update]
  → editorStore.openNote(createdPath) [opens editor]
  → close() [closes dialog]
```

**Editing Metadata & Links:**
```
User opens note in editor
  ↓
FrontmatterForm renders with note.links
  → LinksEditor renders with notePath and existing links
  ↓
User adds/removes links
  → API calls + graph sync + refreshActiveNote()
  ↓
User edits title/type in Metadata section
  → updateFrontmatter() sets isDirty
  ↓
User presses Cmd+S
  → editorStore.saveNote()
  → api.updateNote() with only changed fields
  → graphStore.applyEvent({ type: "node-updated", ... })
  → activeNote updated with new modified timestamp
```

---

### 6. **Key Design Patterns**

1. **Dual-source links array:** LinksEditor reads from `note.links` (re-read via `refreshActiveNote()`) but doesn't manage the links array itself. The API handles link storage; the UI just triggers operations.

2. **Optimistic updates:** `createNote` optimistically updates graphStore before the dialog closes, so the node appears immediately in the graph.

3. **Graph event consistency:** All write operations (add/remove/update links, create notes) apply corresponding events to graphStore to keep in-memory graph in sync.

4. **Dirty tracking:** `editorStore` tracks unsaved changes separately for body and frontmatter, allowing concurrent saves of independent fields.

5. **Conflict detection:** External file changes are detected and can conflict with unsaved editor state.

---

### 7. **Test Coverage**

LinksEditor has 9 unit tests in `LinksEditor.test.tsx`:
- Rendering existing links
- Add/remove button state logic
- Autocomplete resolution
- Duplicate detection
- API error handling
- Graph store updates
- Enter key submission

CreateNoteDialog uses inline validation with `pathDirty` flag to prevent showing errors before user interaction.

---

All files are located at:
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/LinksEditor.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CreateNoteDialog.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts`

---

