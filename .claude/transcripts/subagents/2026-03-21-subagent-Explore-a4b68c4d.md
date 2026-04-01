# 2026-03-21 — Subagent Transcript: Explore

**Date:** 2026-03-21 10:54:45
**Agent:** Explore
**Agent ID:** a4b68c4d4d517bafd
**Parent Session:** 9bc4063d-65f7-4c1c-a478-655d8407576b

---

## User

I need to understand how the Files panel context menu works in this Tauri/React app, and how plain .md files differ from notes.

Explore thoroughly:
1. The Files panel context menu - find where right-click menu items are defined (likely in a FileTree or Files component). Look for "context menu", "onContextMenu", "ContextMenu" patterns.
2. How notes vs plain files are distinguished - what makes an .md file a "note" vs a "plain file"? Look at how files are opened, the tab kind system ("note" vs "plain-file"), and any detection logic.
3. The frontmatter format for notes - what YAML frontmatter fields are required/expected.
4. Any existing Tauri commands for creating or converting notes.
5. The workspace write_note or similar methods in the Rust backend.

Search in:
- crates/app/src/ for React components (especially Files panel, context menu)
- crates/app/src-tauri/ for Tauri commands
- crates/core/src/ for workspace methods related to note creation/writing
- docs/02-data-model.md for the data model

---

## Assistant

I'll conduct a thorough exploration of the Files panel context menu, the note vs plain file distinction, and the related backend systems. Let me start with some targeted searches.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -type f -name \"*.md\" | head -20"}`

---

## Assistant

Let me search for the Files panel and context menu components:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/{File,Tree,Context,Menu}*.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*ContextMenu*.{ts,tsx}"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/*.tsx"}`

---

## Assistant

Now let me read the FileTreePanel to see the context menu implementation:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/02-data-model.md"}`

---

## Assistant

Now let me read the FileTreePanel component in sections:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":200}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"onContextMenu|context.*menu|ContextMenu","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content"}`

---

## Assistant

Good! Now let me read the ContextMenu component and understand how notes are opened:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":450,"offset":200}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"plain-file|note.*tab|openNote|activeNote|activePlainFile","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content","c`

---

## Assistant

Now let me check how notes and plain files are distinguished in the editorStore:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores -name \"*.ts\" -o -name \"*.tsx\" | head -20"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"activeNote|activePlainFile|openNote|openPlainFile","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","output_mode":"content","context":5,"head_limit`

---

## Assistant

Let me get more of the editorStore to see the openPlainFile implementation:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","limit":300,"offset":180}`

---

## Assistant

Now let me search for API types and Tauri commands related to notes:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api -name \"*.ts\" | head -10"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"NoteDetail|PlainFileDetail","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/generated/NoteDetailDto.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/generated/PlainFileDto.ts"}`

---

## Assistant

Now let me check the Tauri commands for note writing:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src -name \"*.rs\" | head -20"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"create_note|write.*note|readNote|read_note","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","output_mode":"content","context":5,"head_limit":80}`

---

## Assistant

Now let me check the Rust core workspace methods:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src -name \"*.rs\" | head -20"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub fn create_note|pub fn read_note|pub fn write_note","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","output_mode":"content","context":8,"head_limit":15`

---

## Assistant

Let me look at the Note model structure:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub struct Note|pub struct Frontmatter|title:|note_type:","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs","output_mode":"content","context":8,"head_limit":120`

---

## Assistant

Now let me look at an example note file to see the actual frontmatter format:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/seed/People/Judea Pearl.md"}`

---

## Assistant

Perfect! Now let me search for how the parser determines if a file is a note or plain file:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"parse.*note|try_parse|frontmatter|FRONTMATTER_DELIMITER","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/parser.rs","output_mode":"content","context":5,"head_limit":100`

---

## Assistant

Excellent! Now let me check how files are loaded in the workspace to understand the distinction:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"add_file|load.*file|workspace.*init|new.*workspace","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","output_mode":"content","context":5,"head_limit":120}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","limit":150,"offset":734}`

---

## Assistant

Perfect! Now let me check the tab store to understand the tab kind system:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"kind.*note|kind.*plain-file|tab.*kind|openTab","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts","output_mode":"content","context":3,"head_limit":100}`

---

## Assistant

Perfect! Now let me check the CreateNoteDialog to see how notes are created:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CreateNoteDialog.tsx","limit":150}`

---

## Assistant

Excellent! Now I have enough information to provide a comprehensive answer. Let me compile my findings:

## Comprehensive Exploration Report: Files Panel Context Menu & Notes vs Plain Files

Based on my thorough exploration of the codebase, here's what I found:

### 1. Files Panel Context Menu Implementation

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`

The context menu has three distinct implementations based on the right-clicked node:

#### Empty Area (Root Context)
When right-clicking on empty space (not on a file/folder):
- New Note at Root
- New Drawing at Root
- New Canvas at Root
- New Folder at Root

#### Folder Context (lines 448-486)
When right-clicking a folder:
- New Note Here / New Note in Folder (for subfolders)
- New Drawing Here
- New Canvas Here
- New Subfolder Here
- Separator
- Focus in Graph
- Rename
- Move to...
- Separator
- Show in Finder
- Copy Relative Path
- Copy Absolute Path
- Separator
- Delete Folder (danger)

#### BrainMap Note Context (lines 487-536)
When right-clicking a `.md` file with `note_type` frontmatter field set (`isBrainMapNote = !!state.node.note_type`):
- New Note Here
- Separator
- Focus in Graph
- Set as Home Note / Unset Home Note
- Rename
- Duplicate
- Move to...
- Separator
- Show in Finder
- **Open in Default App**
- Copy Relative Path
- Copy Absolute Path
- Separator
- Delete

#### Plain File Context (lines 537-566)
When right-clicking a non-BrainMap file (e.g., `.excalidraw`, `.canvas`, `.pdf`, or `.md` without frontmatter):
- New Note Here
- Rename
- Separator
- Move to...
- Separator
- Show in Finder
- Open in Default App
- Copy Relative Path
- Copy Absolute Path
- Separator
- Delete

**Key Distinction Logic** (line 429):
```typescript
const isBrainMapNote = state.node !== null && !state.node.isFolder && !!state.node.note_type;
```

---

### 2. Notes vs Plain Files Distinction

**The Core Difference: YAML Frontmatter**

A `.md` file is classified as a **BrainMap note** if and only if it parses successfully as YAML frontmatter. Plain files are everything else (including `.md` files without valid frontmatter).

#### Note (BrainMap-managed):
- **Structure:** YAML frontmatter + markdown body
- **Frontmatter delimiter:** `---` at start and end (required)
- **Tab kind:** `"note"`
- **API Type:** `NoteDetailDto` (from `/crates/app/src/api/generated/NoteDetailDto.ts`)
- **Fields:**
  ```typescript
  {
    path: string,
    title: string,
    note_type: string,      // Required—e.g., "concept", "person", "book-note"
    tags: Array<string>,
    status: string | null,
    created: string,        // ISO date YYYY-MM-DD
    modified: string,       // ISO date YYYY-MM-DD
    source: string | null,
    summary: string | null,
    links: Array<TypedLinkDto>,  // Typed relationships
    extra: Record<string, unknown>,  // Custom fields
    body: string
  }
  ```

#### Plain File:
- **Structure:** Raw file content (no required frontmatter)
- **Tab kind:** `"plain-file"` (or `"pdf"`, `"excalidraw"`, `"canvas"` for specific formats)
- **API Type:** `PlainFileDto` (from `/crates/app/src/api/generated/PlainFileDto.ts`)
- **Fields:**
  ```typescript
  {
    path: string,
    body: string,
    binary: boolean
  }
  ```

**Opening Logic** (editorStore.ts, lines 113-198):
```typescript
openNote: async (path: string) => {
  // Tries to parse as a Note via api.readNote()
  // If parsing fails (no valid frontmatter), falls back to:
  await get().openPlainFile(path);
}

openPlainFile: async (path: string) => {
  // Reads raw file content via api.readPlainFile()
  // Used for .md files without frontmatter, .excalidraw, .canvas, .pdf, etc.
}
```

**Selection Logic** (FileTreePanel.tsx, lines 811-816):
```typescript
if (isBrainMapNote) {
  useGraphStore.getState().selectNode(node.fullPath);
  useEditorStore.getState().openNote(node.fullPath);  // Parse as note
} else {
  useGraphStore.getState().selectNode(null);
  useEditorStore.getState().openPlainFile(node.fullPath);  // Read as plain file
}
```

---

### 3. Frontmatter Format for Notes

**Required YAML Frontmatter Fields:**

From the data model (`docs/02-data-model.md`) and Rust model (`crates/core/src/model.rs`), every note must have:

| Field | Type | Required | Example |
|-------|------|----------|---------|
| `id` | UUID string | Auto-generated | `"a0000001-0000-0000-0000-000000000020"` |
| `title` | string | Yes | `"Judea Pearl"` |
| `type` | string | Yes | `"person"`, `"concept"`, `"book-note"` |
| `tags` | string array | No | `[causality, ai, researcher]` |
| `status` | enum | No | `draft`, `review`, `final`, `archived` |
| `created` | date | Yes | `2026-01-15` (ISO format) |
| `modified` | date | Yes | `2026-03-09` (ISO format) |
| `source` | string | No | `"The Book of Why"` |
| `summary` | string | No | 1-3 sentence description |
| `links` | array of objects | No | Typed relationships (see below) |
| Custom fields | varies | No | `affiliation`, `field`, `era` (type-specific) |

**Link Object Format:**
```yaml
links:
  - target: "Concepts/Causal Inference.md"  # or UUID
    type: "authored-by"                      # or rel:
    annotation: "see also"                   # optional
```

**YAML Parsing Rules** (from data model):
- Always quote string values (unquoted `no`, `yes`, `on`, `off` become booleans)
- Always quote titles containing colons: `title: "Foo: Bar"`
- Use ISO date format: `2026-03-09`
- Duplicate keys are rejected; implicit type coercion is warned on

**Example Note** (`seed/People/Judea Pearl.md`):
```markdown
---
id: "a0000001-0000-0000-0000-000000000020"
title: "Judea Pearl"
type: person
tags: [causality, ai, turing-award, researcher]
status: review
created: 2026-01-15
modified: 2026-03-09
source: "The Book of Why"
summary: >-
  Computer scientist and philosopher, Turing Award winner (2011),
  who formalized causal inference...
links:
  - target: "../Concepts/Causal Inference.md"
    type: authored-by
affiliation: "UCLA, Computer Science Department"
field: "Artificial Intelligence, Causal Inference"
era: "1980s-present"
---

# Judea Pearl
[markdown body...]
```

---

### 4. Existing Tauri Commands for Note Creation/Writing

**Location:** `/crates/app/src-tauri/src/handlers.rs` and `/crates/app/src-tauri/src/commands.rs`

**Creating Notes:**
```rust
pub fn handle_create_note(
  ws: &mut Workspace,
  params: CreateNoteParams,  // path, title, note_type, tags, status, source, summary, extra, body
) -> Result<String, String>
```

API call (from `api/types.ts`):
```typescript
createNote(params: {
  path: string;
  title: string;
  note_type: string;
  tags?: string[];
  status?: string;
  source?: string;
  summary?: string;
  extra?: Record<string, unknown>;
  body?: string;
}): Promise<string>;  // Returns created path
```

**Writing Note Content:**
- `writeRawNote(path, content)` — Write full note (frontmatter + body) as raw text, then re-parse
- `updateNote(params)` — Update note fields (title, type, tags, status, etc.)

**Plain File Writing:**
```typescript
writePlainFile(path: string, body: string): Promise<void>;
createPlainFile(path: string, body?: string): Promise<string>;
```

---

### 5. Workspace Write Methods (Rust Backend)

**Location:** `/crates/core/src/workspace.rs`

**Core Methods:**

```rust
pub fn create_note(
  &mut self,
  rel_path: &str,
  title: &str,
  note_type: &str,
  tags: Vec<String>,
  status: Option<Status>,
  source: Option<String>,
  summary: Option<String>,
  extra: HashMap<String, serde_yaml::Value>,
  body: Option<String>,
) -> Result<RelativePath>
```

**Workflow:**
1. Generates UUID `id` via `Uuid::new_v4()`
2. Creates `Frontmatter` struct with all fields
3. Serializes to YAML: `serde_yaml::to_string(&note.frontmatter)`
4. Writes file: `format!("---\n{}---\n{}", yaml, body)`
5. Parses back and adds to `Graph` + `Index`
6. Returns created path

**Parsing (Parser):**
```rust
pub fn parse_note(content: &str, path: &RelativePath) -> Result<Note> {
  let (raw_yaml, body) = split_frontmatter(content)?;
  let mut frontmatter: Frontmatter = serde_yaml::from_str(&raw_yaml)?;
  if frontmatter.id.0.is_nil() {
    frontmatter.id = NoteId::new();
  }
  Ok(Note { path, frontmatter, body, inline_links })
}

fn split_frontmatter(content: &str) -> Result<(String, String)> {
  if !trimmed.starts_with("---") {
    return Err(BrainMapError::InvalidYaml("file does not start with ---"));
  }
  // Find closing "---" delimiter
  // Return (yaml_part, body_part)
}
```

---

### Key Files Involved:

**Frontend (React/TypeScript):**
- Context menu: `/crates/app/src/components/Layout/FileTreePanel.tsx` (lines 220-571)
- Note opening: `/crates/app/src/stores/editorStore.ts` (lines 113-268)
- Note creation dialog: `/crates/app/src/components/Editor/CreateNoteDialog.tsx`
- Tab management: `/crates/app/src/stores/tabStore.ts`

**Backend (Rust):**
- Handlers: `/crates/app/src-tauri/src/handlers.rs`
- Core workspace: `/crates/core/src/workspace.rs`
- Parser: `/crates/core/src/parser.rs`
- Data model: `/crates/core/src/model.rs`

**API Types:**
- `/crates/app/src/api/types.ts` — Interface definitions
- `/crates/app/src/api/generated/NoteDetailDto.ts`
- `/crates/app/src/api/generated/PlainFileDto.ts`

**Data Model Docs:**
- `/docs/02-data-model.md` — Comprehensive specification

---

