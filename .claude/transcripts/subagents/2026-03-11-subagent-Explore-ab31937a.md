# 2026-03-11 — Subagent Transcript: Explore

**Date:** 2026-03-11 19:15:02
**Agent:** Explore
**Agent ID:** ab31937aa9f7fb43a
**Parent Session:** cac98a5e-bb31-4585-8135-4876e33d5c71

---

## User

Explore the Tauri backend to understand what commands exist for updating notes. I need to know:
1. What Tauri commands are available in `crates/app/src-tauri/src/commands.rs` and `handlers.rs`
2. What update/mutation APIs exist in the core workspace (`crates/core/src/workspace.rs`)
3. The data structures used for node updates (look for update_node, NodeUpdate, etc.)
4. How the frontmatter is serialized/deserialized

Also check `crates/app/src/api/` for the BrainMapAPI interface and bridge implementations.

---

## Assistant

I'll explore the Tauri backend to understand the note update mechanisms and data structures. Let me start by examining the relevant files.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -type f -name \"*.rs\" | head -20"}`

---

## Assistant

Now let me read the main files:

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

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/state.rs"}`

---

## Assistant

Now let me check the DTO file to see the UpdateNoteParams structure:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src -name \"*.rs\" -type f | grep -v target"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs"}`

---

## Assistant

Now let me check the core workspace.rs file to see the update_note method:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"pub fn update_note\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":344,"limit":100}`

---

## Assistant

Now let me check the model.rs to understand the frontmatter structure:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"pub struct Frontmatter\\|pub struct Note\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs","offset":132,"limit":50}`

---

## Assistant

Now let me check for TypedLink and Status:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"pub struct TypedLink\\|pub enum Status\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs","offset":94,"limit":30}`

---

## Assistant

Now let me check the API interface in the React app:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*.ts\" -o -name \"*.tsx\" | head -20"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -path \"*api*\" -type f"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts"}`

---

## Assistant

Now let me check the parser to understand serialization:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"pub fn serialize_note\\|pub fn parse_note\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/lib.rs"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -rn \"pub fn serialize_note\\|pub fn parse_note\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/ --include=\"*.rs\""}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/parser.rs"}`

---

## Assistant

Perfect. Now let me check the editor store to see how updates are invoked:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

Excellent. Now let me create a comprehensive report. Let me check one more file to see the complete flow:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/main.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs"}`

---

## Assistant

Perfect. Now I have all the information needed. Let me write a comprehensive report:

## Tauri Backend - Note Update Architecture

I've completed a thorough exploration of the BrainMap Tauri backend. Here's what exists for updating notes:

### 1. Tauri Commands (IPC Layer)

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs`

The `update_node` command (lines 58-65):
```rust
#[tauri::command]
pub fn update_node(
    state: State<'_, AppState>,
    params: UpdateNoteParams,
) -> Result<(), String> {
    let abs_path = state.with_workspace(|ws| Ok(ws.root.join(&params.path)))?;
    state.register_expected_write(abs_path);
    state.with_workspace_mut(|ws| handlers::handle_update_note(ws, params))
}
```

This command:
- Takes `UpdateNoteParams` as input
- Registers the file write as "expected" (tells the file watcher to ignore it)
- Delegates to `handle_update_note` handler
- Returns `Result<(), String>`

Other related commands:
- `create_node` — Creates a new note
- `delete_node` — Deletes a note (path + optional force flag)
- `list_nodes` — Lists notes with optional filters
- `create_link` / `delete_link` — Manage explicit relationships
- `get_node_content` — Reads full note for editing

### 2. Data Transfer Object (DTO) - UpdateNoteParams

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs` (lines 26-37)

```typescript
#[derive(Debug, Deserialize)]
pub struct UpdateNoteParams {
    pub path: String,                                              // Relative path (e.g., "Concepts/Causality.md")
    pub title: Option<String>,                                     // Optional: new title
    pub note_type: Option<String>,                                // Optional: new note type
    pub tags: Option<Vec<String>>,                                // Optional: replace all tags
    pub status: Option<String>,                                   // Optional: draft, review, final, archived
    pub source: Option<String>,                                   // Optional: source URL/citation
    pub summary: Option<String>,                                  // Optional: summary text
    pub extra: Option<HashMap<String, serde_json::Value>>,       // Optional: type-specific fields
    pub body: Option<String>,                                     // Optional: markdown body
}
```

All fields are optional — you only provide what you want to change.

### 3. Handler Layer

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs` (lines 76-102)

```rust
pub fn handle_update_note(
    ws: &mut Workspace,
    params: UpdateNoteParams,
) -> Result<(), String> {
    let status = params
        .status
        .as_deref()
        .map(|s| s.parse().map(Some))                     // Parse string to Status enum
        .transpose()
        .map_err(|e: String| e)?;

    let extra = params.extra.as_ref().map(json_map_to_yaml);  // Convert JSON to YAML

    ws.update_note(
        &params.path,
        params.title,
        params.note_type,
        params.tags,
        status,
        params.source.map(Some),                          // Wrap in Option<Option<T>>
        params.summary.map(Some),
        extra,
        params.body,
    )
    .map_err(|e: BrainMapError| e.to_string())
}
```

The handler:
- Parses status string ("draft", "review", "final", "archived") into an enum
- Converts JSON extra fields to YAML format
- Wraps source/summary in Option<Option<T>> (DTO uses flat Option, core needs Option<Option>)
- Delegates to `Workspace::update_note`

### 4. Core Workspace API

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs` (lines 344-409)

```rust
pub fn update_note(
    &mut self,
    rel_path: &str,
    title: Option<String>,
    note_type: Option<String>,
    tags: Option<Vec<String>>,
    status: Option<Option<Status>>,           // Option<Option<T>> allows clear vs unchanged
    source: Option<Option<String>>,
    summary: Option<Option<String>>,
    extra: Option<HashMap<String, serde_yaml::Value>>,
    body: Option<String>,
) -> Result<()>
```

The method:
1. Looks up the note in memory
2. Conditionally updates each field (only if Some)
3. Updates the `modified` timestamp
4. Calls `parser::serialize_note()` to convert to YAML+markdown
5. Writes the file via `std::fs::write()`
6. Updates the search index
7. Updates the graph node

Key detail: `extra.extend(e)` merges new fields into existing ones (doesn't replace).

### 5. Data Structures - Frontmatter

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs` (lines 132-151)

```rust
pub struct Frontmatter {
    pub id: NoteId,                                          // UUID, auto-generated if nil
    pub title: String,
    #[serde(rename = "type")]
    pub note_type: String,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub tags: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<Status>,                              // enum: Draft, Review, Final, Archived
    pub created: NaiveDate,
    pub modified: NaiveDate,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub summary: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub links: Vec<TypedLink>,                               // Explicit edges
    #[serde(flatten)]
    pub extra: HashMap<String, serde_yaml::Value>,           // Type-specific fields
}

pub struct Note {
    pub path: RelativePath,
    pub frontmatter: Frontmatter,
    pub body: String,
    pub inline_links: Vec<InlineLink>,                       // Auto-detected markdown links
}
```

**Status enum** (lines 94-113):
```rust
pub enum Status {
    Draft,
    Review,
    Final,
    Archived,
}
// Parses from lowercase strings via FromStr trait
```

**TypedLink** (lines 116-122):
```rust
pub struct TypedLink {
    pub target: String,                    // Relative path or reference
    #[serde(rename = "type")]
    pub rel: String,                       // Edge type: related-to, supports, etc.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub annotation: Option<String>,        // Optional inline comment
}
```

### 6. Serialization / Deserialization

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/parser.rs` (lines 8-31)

```rust
pub fn serialize_note(note: &Note) -> Result<String> {
    let yaml = serde_yaml::to_string(&note.frontmatter)?;
    Ok(format!("---\n{}---\n{}", yaml, note.body))
}

pub fn parse_note(content: &str, path: &RelativePath) -> Result<Note> {
    let (raw_yaml, body) = split_frontmatter(content)?;
    let mut frontmatter: Frontmatter = serde_yaml::from_str(&raw_yaml)
        .map_err(|e| BrainMapError::InvalidYaml(...))?;
    // ... auto-generate id if nil, extract inline links
    Ok(Note { path, frontmatter, body, inline_links })
}
```

File format: `---\n[YAML]\n---\n[Markdown body]`

### 7. TypeScript API Layer

**Frontend interface:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts` (lines 113-123)

```typescript
updateNote(params: {
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
```

**Tauri bridge:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts` (lines 48-60)

```typescript
async updateNote(params: {...}): Promise<void> {
  return invoke<void>("update_node", { params });
}
```

### 8. Editor Integration

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts`

The `saveNote()` action (lines 51-67):
```typescript
saveNote: async () => {
  const { activeNote, editedBody, isDirty } = get();
  if (!activeNote || !isDirty || editedBody === null) return;
  
  try {
    const api = await getAPI();
    await api.updateNote({ path: activeNote.path, body: editedBody });
    set({
      activeNote: { ...activeNote, body: editedBody },
      isDirty: false,
      editedBody: null,
    });
  } catch (e) { /* ... */ }
}
```

Currently updates **body only** (body is the only changed field sent). The editor has separate logic for other fields (not yet implemented in the UI).

### 9. JSON ↔ YAML Conversion

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs` (lines 256-329)

The IPC boundary crosses from JSON (TypeScript) to YAML (Rust):
- `json_map_to_yaml()` — Converts `HashMap<String, serde_json::Value>` to `HashMap<String, serde_yaml::Value>`
- `yaml_map_to_json()` — Converts in reverse direction
- Handles recursive conversion of nested structures (arrays, objects, primitives)

### Summary of Update Flow

1. **Frontend** (TypeScript) calls `api.updateNote({ path, body, ... })`
2. **Tauri Bridge** invokes Rust command `update_node` with JSON params
3. **Command handler** converts JSON to internal types (parse status, convert extra to YAML)
4. **Workspace API** updates the in-memory Note struct and writes to disk
5. **Parser** serializes with `serialize_note()` → `---\nYAML\n---\nbody`
6. **Search index** updates
7. **Graph** updates (for title/type/tags changes)

### File Paths (Absolute)

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/state.rs`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/parser.rs`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts`

---

