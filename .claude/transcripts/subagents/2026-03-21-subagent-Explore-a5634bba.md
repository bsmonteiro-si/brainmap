# 2026-03-21 — Subagent Transcript: Explore

**Date:** 2026-03-21 10:54:32
**Agent:** Explore
**Agent ID:** a5634bba0220490d6
**Parent Session:** 9bc4063d-65f7-4c1c-a478-655d8407576b

---

## User

I need to understand the note creation flow and frontmatter format in this BrainMap app.

Explore:
1. How new notes are created - look for "create_note", "new note", "CreateNoteDialog" patterns in crates/app/src/
2. The Tauri command for creating notes - look in crates/app/src-tauri/src/commands.rs and handlers.rs
3. The core workspace method for writing notes - look in crates/core/src/workspace.rs for methods like write_note, create_note, add_note
4. The Note struct and frontmatter fields - look in crates/core/src/ for the Note type definition
5. How frontmatter is serialized - look for YAML frontmatter generation patterns
6. The data model doc at docs/02-data-model.md for required/optional fields
7. Look at seed/*.md files for examples of what a properly formatted note looks like

Focus on understanding what minimum frontmatter is needed to turn a plain .md file into a valid note.

---

## Assistant

I'll systematically explore the note creation flow and frontmatter format in the BrainMap app.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -type f -name \"*.md\" | grep -E \"(seed|example)\" | head -20"}`

---

## Assistant

Let me start by examining the seed example and data model documentation, then explore the code flow.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/seed/example.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/02-data-model.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/seed/People/Judea"}`

---

## Assistant

Let me read an actual seed note to see a complete example:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/seed/People/Judea Pearl.md"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"CreateNoteDialog|create_note|write_note","type":"tsx","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

Let me search more broadly for the note creation flow:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/*CreateNote*.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*Dialog*.tsx"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"create_note|CreateNote","glob":"**/*.tsx","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

Now let me read the CreateNoteDialog and explore the Tauri command layer:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CreateNoteDialog.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/src/commands.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

Now let me read the Tauri command handlers and the core workspace method:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","limit":200}`

---

## Assistant

Now let me check the core workspace create_note method:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"fn create_note|pub fn create_note","type":"rs","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/core/src/workspace.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","limit":300}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","limit":600,"offset":300}`

---

## Assistant

Now let me check the Note struct and parser/serialization:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub struct Note|pub struct Frontmatter","type":"rs","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/core/src/model.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs","limit":200}`

---

## Assistant

Now let me check the parser and serialization logic:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/core/src/parser.rs"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"serialize_note\\|pub fn serialize\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/parser.rs | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/parser.rs","limit":100}`

---

## Assistant

Perfect. Now let me check the TypedLink structure more carefully, especially the "type" field renaming:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs","limit":160,"offset":115}`

---

## Assistant

Excellent! I found the critical detail. Now let me look at one more seed file to see the actual link format as it's persisted:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"head -35 /Users/bsmonteiro/Desktop/Personal/brainmap/seed/Concepts/Causal\\ Inference.md"}`

---

## Assistant

Perfect! Now I have all the information I need. Let me compile a comprehensive report. Let me generate a summary document:

## Comprehensive Exploration Report: BrainMap Note Creation and Frontmatter Format

Based on my thorough exploration of the codebase, here's the complete picture of how notes are created and what frontmatter format is required:

### 1. **Frontend Note Creation Flow** (CreateNoteDialog.tsx)

The React dialog component collects:
- **Path**: Workspace-relative path (`.md` added automatically for notes)
- **Title**: Human-readable title (auto-derived from path if not manually edited)
- **Note Type**: Selected from registered types in workspace config
- **Tags**: Comma-separated, parsed into array
- **Body**: Optional initial content
- **File Kind**: Toggle between "note" (graph-managed) and "file" (plain text)

### 2. **Tauri Command Layer** (commands.rs → handlers.rs)

The frontend calls `api.createNote()` which invokes the Tauri command `create_node`. Parameters get mapped through:
- **CreateNoteParams** DTO with: path, title, note_type, tags, status, source, summary, extra, body
- Handlers call `Workspace::create_note()` in the Rust core

### 3. **Core Workspace Note Creation** (workspace.rs, line 319)

The `create_note()` method:
- Validates path isn't already in notes map
- Auto-generates a UUID `id` via `NoteId::new()`
- Creates Frontmatter struct with:
  - `id`: UUID4 (auto-generated)
  - `title`: Required
  - `note_type` (renamed from `type` in YAML): Required
  - `tags`: Vec<String>, defaults to empty
  - `status`: Optional enum (Draft, Review, Final, Archived)
  - `created`: Today's date (NaiveDate)
  - `modified`: Today's date
  - `source`: Optional string
  - `summary`: Optional string
  - `links`: Vec<TypedLink>, starts empty
  - `extra`: HashMap for type-specific fields
- Serializes via `parser::serialize_note()`
- Writes to file and indexes

### 4. **Frontmatter Serialization** (parser.rs, line 30-32)

The format is:
```
---
<YAML serialized from Frontmatter struct>
---
<markdown body>
```

Key serialization rules from model.rs:
- `note_type` field → serialized as `type:` in YAML (via `#[serde(rename = "type")]`)
- `links[].rel` field → serialized as `type:` in YAML (via `#[serde(rename = "type")]`)
- Empty tags skipped (skip_serializing_if)
- Empty status skipped (skip_serializing_if)
- Empty source/summary skipped (skip_serializing_if)
- `extra` fields flattened directly into frontmatter

### 5. **Minimum Valid Frontmatter** (from validation in workspace.rs)

Required fields that must be non-empty:
- `id`: UUID (auto-generated)
- `title`: Non-empty string
- `type`: Note type string
- `created`: ISO date (YYYY-MM-DD)
- `modified`: ISO date

Optional but commonly used:
- `tags`: Array of strings
- `status`: One of {draft, review, final, archived}
- `source`: String
- `summary`: String
- `links`: Array of objects with `target` and `type`

### 6. **Link Format** (from Judea Pearl.md example)

In frontmatter, links are:
```yaml
links:
  - target: "../Concepts/Causal Inference.md"
    type: authored-by
  - target: "./Do-Calculus.md"
    type: contains
    annotation: optional string
```

Key points:
- `target`: Workspace-relative path (resolved relative to the note's location)
- `type`: The relationship kind (stored as TypedLink.rel with serde rename)
- `annotation`: Optional third field

### 7. **Data Model Context** (from 02-data-model.md)

**Frontmatter Schema:**
- Base fields: id, title, type, tags, status, created, modified, source, summary, links
- 11 note types (concept, book-note, question, reference, index, argument, evidence, experiment, person, project, folder)
- 15 edge types (contains, part-of, causes, supports, contradicts, extends, depends-on, exemplifies, precedes, leads-to, evolved-from, related-to, authored-by, sourced-from, mentioned-in)
- Type-specific fields allowed as top-level extras (e.g., domain, maturity, aliases for concepts; affiliation, field, era for persons)

### 8. **Example: Complete Minimal Note**

```markdown
---
id: a0000001-0000-0000-0000-000000000001
title: "My Note"
type: concept
created: 2026-03-21
modified: 2026-03-21
---

Note body starts here.
```

### 9. **Example: Richer Note**

```markdown
---
id: a0000001-0000-0000-0000-000000000002
title: "Advanced Topic"
type: concept
tags: [ai, machine-learning, causal]
status: draft
created: 2026-03-21
modified: 2026-03-21
source: "Pearl's Book, Chapter 3"
summary: >-
  A comprehensive overview of causal reasoning
  in artificial intelligence.
links:
  - target: "Concepts/Causal Inference.md"
    type: extends
  - target: "../People/Judea Pearl.md"
    type: authored-by
domain: causal-ml
maturity: foundational
---

Detailed explanation follows...
```

### 10. **YAML Parsing Rules** (from 02-data-model.md)

- Always quote string values (unquoted `yes`, `no`, `on`, `off` parse as booleans)
- Always quote titles containing colons
- Use ISO date format (YYYY-MM-DD)
- Strict mode: duplicate keys rejected, implicit type coercion warned

### 11. **Key Implementation Details**

- **Path normalization**: `./` stripped, `../` resolved (RelativePath::normalize_path)
- **Link target resolution**: Resolved relative to note's directory (resolve_relative method)
- **Folder nodes**: Auto-created from directory structure with note_type="folder"
- **Graph updates**: Automatic via topology events after note creation
- **ID immutability**: UUIDs enable rename-safe linking (though paths are canonical in v1)

---

### Summary: Minimum Frontmatter to Create a Valid Note

From the code, **only these 5 fields are truly required**:

```yaml
id: <UUID>
title: "<non-empty string>"
type: <note-type>
created: YYYY-MM-DD
modified: YYYY-MM-DD
```

Everything else is optional and will be skipped from serialization if empty/null. The system auto-generates `id`, `created`, and `modified` when you call `create_note()`, so from the API perspective, you only need to provide:

```
path, title, note_type
```

Tags, status, source, and summary are user-provided enhancements that are persisted if included, but never required.

---

