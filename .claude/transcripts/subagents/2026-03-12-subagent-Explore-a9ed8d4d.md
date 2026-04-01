# 2026-03-12 — Subagent Transcript: Explore

**Date:** 2026-03-12 16:56:07
**Agent:** Explore
**Agent ID:** a9ed8d4d0add916e0
**Parent Session:** 8ded0b7f-2da2-4917-b434-5a88f5c33eec

---

## User

Explore how the editor opens and displays notes in this BrainMap app. I need to understand:

1. **Editor store** (`crates/app/src/stores/editorStore.ts`): How `openNote` works, what state it sets, how it reads note content
2. **Editor component** (`crates/app/src/components/Editor/`): How notes are rendered, especially the metadata section and the main body editor. Look at EditorView.tsx or similar.
3. **API layer**: How `getNote` / `readNote` works in `crates/app/src/api/tauri.ts` and `crates/app/src/api/types.ts` - what data structure is returned
4. **Rust handlers**: How `handle_read_note` works in `crates/app/src-tauri/src/handlers.rs` - what happens when a file doesn't have valid YAML frontmatter
5. **FileTreePanel.tsx**: The current click handler for plain files (non-BrainMap) - line ~417 area where `isBrainMapNote` gates the click

Be thorough - read the full editor store file and the main editor component files.

---

## Assistant

I'll thoroughly explore how the editor opens and displays notes in the BrainMap app. Let me start by reading the key files you've identified.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/*.tsx"}`

---

## Assistant

Now let me read the main Editor components:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":450}`

---

## Assistant

Now let me read the Rust handlers:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","limit":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs","limit":100}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src -name \"*.rs\" -type f"}`

---

## Assistant

Let me read more of the handlers and check the commands and dto files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","offset":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","limit":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs","limit":150}`

---

## Assistant

Let me continue reading the DTO file and check the core's read_note method:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs","offset":150,"limit":150}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"fn read_note","type":"rust","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core"}`

---

## Assistant

Now let me read the workspace's read_note implementation:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"pub fn read_note\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs | head -5"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":365,"limit":50}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"pub fn parse_note\\|pub fn load_note\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs | head -10"}`

---

## Assistant

Let me check the Note struct and parser:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"impl Note\\|fn parse\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs | head -20"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src -name \"*.rs\" -type f | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/parser.rs","limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs","limit":150}`

---

## Assistant

Perfect! Now let me get the rest of the Note struct definition:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs","offset":150,"limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx","limit":80}`

---

## Assistant

Excellent! I have gathered comprehensive information. Now let me provide a thorough summary of how the editor opens and displays notes in the BrainMap app.

## Editor Flow Analysis: How BrainMap Opens and Displays Notes

Based on a thorough exploration of the codebase, here's the complete flow:

---

### 1. **Editor Store (`editorStore.ts`) - State Management**

The editor store is the central orchestrator:

**Key State Fields:**
- `activeNote: NoteDetail | null` — Full note content with body and metadata
- `editedBody: string | null` — Transient changes to the body (before save)
- `editedFrontmatter: Partial<EditableFrontmatter> | null` — Transient metadata changes
- `isDirty: boolean` — Whether there are unsaved changes
- `savingInProgress: boolean` — Prevents concurrent saves
- `conflictState: "none" | "external-change"` — External edit detection

**`openNote(path: string)` Function (Lines 38-65):**
1. Early return if already viewing the same note
2. If there are unsaved edits (`isDirty`):
   - Check `autoSave` setting from UIStore
   - If enabled and no validation errors, call `saveNote()` before switching
   - Otherwise, log a warning and discard changes
3. Set loading state and clear transient edits
4. Call `api.readNote(path)` to fetch the full note from Tauri
5. Store result in `activeNote`, set `isLoading: false`
6. On error, log to stderr but don't throw (graceful degradation)

**`saveNote()` Function (Lines 88-147):**
- Only saves if `isDirty` is true
- Validates: title cannot be empty/whitespace
- Calls `api.updateNote(params)` with only the changed fields
- Re-reads the note for authoritative server state (especially `modified` timestamp)
- Syncs the graph store if title/type changed via `applyEvent` with type `"node-updated"`
- Preserves concurrent edits: if user edited something while saving, those edits are preserved
- Clears transient state only for fields that were saved

---

### 2. **API Layer (`tauri.ts` and `types.ts`) - Data Transfer**

**`TauriBridge.readNote(path: string)` (Line 30-32):**
```typescript
async readNote(path: string): Promise<NoteDetail> {
  return invoke<NoteDetail>("get_node_content", { path });
}
```

**`NoteDetail` Interface (Lines 35-48 in types.ts):**
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

Complete note with all metadata, links, and body content.

---

### 3. **Rust Handler (`handlers.rs`) - Backend Processing**

**`handle_read_note(ws: &Workspace, path: &str)` (Lines 45-48):**
```rust
pub fn handle_read_note(ws: &Workspace, path: &str) -> Result<NoteDetailDto, String> {
    let note = ws.read_note(path).map_err(|e: BrainMapError| e.to_string())?;
    Ok(NoteDetailDto::from(note))
}
```

**`Workspace::read_note()` (workspace.rs Lines 368-373):**
```rust
pub fn read_note(&self, rel_path: &str) -> Result<&Note> {
    let path = RelativePath::new(rel_path);
    self.notes
        .get(&path)
        .ok_or_else(|| BrainMapError::FileNotFound(rel_path.to_string()))
}
```

Returns a reference to the in-memory `Note` struct from the workspace's notes map. No file re-reading on each access—notes are parsed once at workspace load.

**DTO Conversion (`NoteDetailDto::from`, dto.rs Lines 156-189):**
- Converts the `Note` struct to a JSON-serializable DTO
- Transforms YAML values to JSON for IPC boundary
- Resolves relative links (line 177): `note.path.resolve_relative(&l.target)` converts relative paths to absolute
- Serializes status enum to string

---

### 4. **Note Parser (`parser.rs`) - YAML Frontmatter Handling**

**`parse_note(content: &str, path: &RelativePath)` (Lines 9-28):**

1. **Split frontmatter** (Lines 54-79):
   - Requires content to start with `---`
   - Finds closing `---` delimiter
   - If missing, returns `BrainMapError::InvalidYaml("no closing --- found")`

2. **Parse YAML** (Lines 11-14):
   - Uses `serde_yaml::from_str(&raw_yaml)`
   - On error, logs warning and returns `InvalidYaml` error with detailed message
   - **No fallback for plain markdown files**

3. **Extract inline links** (Line 20):
   - Regex matches `[label](path.md)` patterns in the body
   - Resolves relative paths
   - Stores as `InlineLink` structs with position metadata

**Frontmatter Structure (`model.rs` Lines 131-151):**
- Required: `id`, `title`, `type` (renamed from `note_type`)
- Optional: `tags`, `status`, `created`, `modified`, `source`, `summary`, `links`
- Extra fields flatten into the struct via `#[serde(flatten)]`

---

### 5. **Editor Component (`EditorPanel.tsx`) - UI Rendering**

**Display Layers:**
1. **Hero Section** (Lines 55-103):
   - Large title with dirty indicator dot
   - Type pill (colored by `getNodeColor()`)
   - Tag chips, status dot, source attribution
   - Edit/Preview mode toggle
   - Focus mode button

2. **Metadata Section** (FrontmatterForm):
   - Collapsible "Edit Metadata" section (expanded by default)
   - Fields: Title (text), Type (select), Status (select), Tags (input), Source (text), Summary (textarea)
   - Read-only: Created, Modified timestamps
   - Links editor section
   - Extra fields editor

3. **Body Editor** (Lines 114-125):
   - Two mounted CodeMirror instances for Edit/Preview modes
   - Only one visible at a time (CSS opacity toggle)
   - Preserves scroll/cursor position and undo state during mode switches
   - Edit mode shows formatting toolbar
   - Preview mode renders markdown with link navigation

4. **Related Notes Footer** (Line 126):
   - Displays outgoing and incoming edges
   - Grouped by direction with "show more" expansion

---

### 6. **FileTreePanel.tsx - Note Selection**

**Click Handler (Lines 422-426):**
```typescript
const handleClick = () => {
  if (!isBrainMapNote) return;  // Line 423: Early exit for non-BrainMap files
  useGraphStore.getState().selectNode(node.fullPath);
  useEditorStore.getState().openNote(node.fullPath);
};
```

**Node Classification (Line 417):**
```typescript
const isBrainMapNote = !!node.note_type;
```

A file is "BrainMap" if it has a `note_type` field. Files without valid YAML frontmatter (non-BrainMap files) appear in the tree but:
- Cannot be clicked to open in the editor
- Show plain file styling (`tree-file--plain` class)
- Context menu shows only "New Note Here" (no edit/delete)
- Part of `workspaceFiles` list from `listWorkspaceFiles` Rust handler (Lines 321-328)

---

### 7. **What Happens with Invalid YAML Files**

When `readNote` is called on a plain markdown file without valid YAML frontmatter:
1. `handle_read_note` calls `ws.read_note(path)`
2. Workspace's `notes` map doesn't contain it (it was never parsed during workspace init)
3. Returns `FileNotFound` error to TypeScript
4. Editor catches error in try/catch (Line 61-63) and logs to stderr
5. UI displays empty editor state with "Select a note to start exploring"
6. **No error banner or notification to user**—silent failure

---

### Key Data Flow Summary

```
FileTreePanel click (isBrainMapNote)
    ↓
openNote(path) in editorStore
    ↓
readNote(path) via TauriBridge.invoke()
    ↓
Tauri "get_node_content" command
    ↓
Rust handler: ws.read_note() → workspace.notes Map
    ↓
NoteDetailDto conversion (YAML → JSON)
    ↓
activeNote state update in editorStore
    ↓
EditorPanel renders:
  - Hero with title/type/tags
  - FrontmatterForm with all metadata
  - CodeMirror with body content
  - RelatedNotesFooter with links
```

---

### Critical Details

1. **No file re-reading on edit**: Notes are loaded into memory at workspace startup. `readNote` returns cached reference.
2. **Frontmatter is mandatory**: Files without `---...---` YAML delimiters are not indexed and cannot be opened in the editor.
3. **Title validation**: Empty/whitespace-only titles block saves (client + server validation).
4. **Concurrent edit handling**: If user edits while saving, the unsaved edits are preserved and marked dirty again.
5. **Graph sync**: Title/type changes automatically update the graph store via `applyEvent`.
6. **Relative link resolution**: Links in frontmatter and inline markdown are resolved relative to the note's directory before display.

---

