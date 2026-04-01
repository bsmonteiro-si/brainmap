# 2026-03-14 — Subagent Transcript: Explore

**Date:** 2026-03-14 11:24:11
**Agent:** Explore
**Agent ID:** a88d9e5c3b2d6010f
**Parent Session:** f996be33-f69c-4bd8-a579-fbbb56a180c2

---

## User

Explore the BrainMap desktop app's editor to understand:

1. How view modes (Edit/Preview) are currently implemented - find the toggle component, the state management (viewMode in editorStore or tabStore), and how EditorPanel conditionally renders based on viewMode.

2. How the Edit Metadata panel is shown/hidden - find the collapsible section that contains frontmatter editing fields.

3. How the raw .md file content (including frontmatter YAML) is available or could be reconstructed. Look at how notes are loaded - is the original raw markdown stored anywhere, or is it split into body + frontmatter?

4. Find the EditorPanel component, the view mode toggle buttons, and understand the full rendering flow.

Focus on files in `crates/app/src/` - particularly components related to the editor panel, view mode toggle, and metadata editing. Be thorough - read the key files fully.

---

## Assistant

I'll explore the BrainMap desktop app's editor implementation to understand view modes, metadata panel, and content structure. Let me start with a systematic search.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"*.tsx\" -o -name \"*.ts\" | grep -E \"(Editor|editor)\" | head -20"}`

---

## Assistant

Now let me read the key files to understand the editor implementation:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/*.tsx"}`

---

## Assistant

Now let me read the FrontmatterForm component and MarkdownEditor:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

Now let me check the API types to understand what data is available:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"interface NoteDetail|interface PlainFileDetail","type":"ts","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api"}`

---

## Assistant

Now let me check how the Tauri handlers work to see if raw markdown is ever reconstructed:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src -name \"*.rs\" | grep -E \"(handler|command)\" | head -10"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs","limit":100}`

---

## Assistant

Let me check the core library to see how notes are parsed and stored:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src -name \"*.rs\" | grep -E \"(note|parser)\" | head -10"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/parser.rs","limit":120}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src -name \"*.rs\" | head -15"}`

---

## Assistant

Let me check the Note model:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"struct Note|pub body|pub frontmatter","type":"rs","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs","output_mode":"content","context":5}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs","limit":200}`

---

## Assistant

Perfect! Now let me check the MarkdownPreview and TabBar components:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx","limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx","limit":100}`

---

## Assistant

Perfect! Now I have a comprehensive understanding. Let me provide a detailed exploration report:

## BrainMap Desktop App Editor: Comprehensive Exploration Report

I've thoroughly explored the BrainMap desktop app's editor implementation. Here's what I found:

### 1. **View Modes (Edit/Preview) Implementation**

**State Management:**
- View mode is stored in `useEditorStore` as `viewMode: "edit" | "preview"` (line 29, editorStore.ts)
- Persisted per-tab via `useTabStore` — each tab has its own `viewMode` state
- Setter: `setViewMode(mode)` (lines 551-555, editorStore.ts) updates both editor store AND syncs to the active tab in tabStore

**Toggle Component:**
Located in `EditorPanel.tsx` (lines 244-254 for notes, 97-107 for plain files):
```tsx
<div className="editor-view-toggle">
  <button className={`editor-view-btn${viewMode === "edit" ? " editor-view-btn--active" : ""}`}
    onClick={() => setViewMode("edit")}>Edit</button>
  <button className={`editor-view-btn${viewMode === "preview" ? " editor-view-btn--active" : ""}`}
    onClick={() => setViewMode("preview")}>Preview</button>
</div>
```

**Rendering Flow:**
- Both `MarkdownEditor` and `MarkdownPreview` are mounted **simultaneously** on the page (lines 301-313, EditorPanel.tsx)
- Conditional rendering uses CSS class toggling (not React unmounting):
  - `editor-view-layer` divs with `editor-view-layer--active` class applied based on viewMode
  - This preserves CodeMirror editor state (cursor, scroll position, undo stack) when switching between views
  - Pure CSS opacity transitions (see inline className logic)

### 2. **Edit Metadata Panel (Frontmatter)**

**Collapsible Section:**
Located in `FrontmatterForm.tsx` (lines 40-49):
```tsx
<button className="section-toggle" aria-expanded={expanded} onClick={() => setExpanded((e) => !e)}>
  <span>{expanded ? "▾" : "▸"}</span>
  Edit Metadata
</button>
{expanded && (
  <div className="frontmatter-fields" id="frontmatter-fields">
    {/* All fields here */}
  </div>
)}
```

**Editable Fields Included:**
- **Title** (text input) — line 52-59
- **Type** (select dropdown) — lines 61-74 with NOTE_TYPES array
- **Status** (select dropdown) — lines 75-85 with draft/review/final/archived options
- **Tags** (custom TagInput component) — line 88
- **Source** (text input) — lines 91-97
- **Summary** (textarea, 3 rows) — lines 99-107
- **Links** (LinksEditor component) — line 109
- **Extra Fields** (nested collapsible section with ExtraFieldsEditor) — lines 110-123

**State & Updates:**
- Uses `editedFrontmatter` from editorStore: `Partial<EditableFrontmatter> | null`
- All changes go through `updateFrontmatter()` action (editorStore, lines 336-362)
- Frontmatter undo/redo stacks with 50-item limit (MAX_FM_UNDO constant, line 12)
- Marks the note as dirty on any metadata change

**Visibility in Notes:**
- Only shown for actual `NoteDetail` objects (lines 298-315 in EditorPanel)
- **NOT** shown for plain files or untitled tabs (simplified editor views, lines 89-208)

### 3. **Raw Markdown File Content & Reconstruction**

**Data Model Architecture:**
Notes are stored **split** — never as raw markdown on the frontend:

**In Rust Core** (`crates/core/src/model.rs`):
```rust
pub struct Note {
  pub path: RelativePath,
  pub frontmatter: Frontmatter,  // YAML parsed into typed struct
  pub body: String,              // Markdown body only
  pub inline_links: Vec<InlineLink>,
}
```

**In TypeScript DTO** (`crates/app/src/api/types.ts`):
```typescript
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
  links: TypedLinkDto[];
  extra: Record<string, unknown>;
  body: string;  // Body only, not full raw markdown
}
```

**Raw Markdown Reconstruction:**
Occurs in **two places only**:

1. **Core Library** (`crates/core/src/parser.rs`, lines 30-33):
   ```rust
   pub fn serialize_note(note: &Note) -> Result<String> {
     let yaml = serde_yaml::to_string(&note.frontmatter)?;
     Ok(format!("---\n{}---\n{}", yaml, note.body))
   }
   ```
   Used when writing notes back to disk via `workspace.update_note()`

2. **Via Workspace API** — the `workspace.read_note()` method:
   - Parses the on-disk `.md` file (via `parse_file()` and `parse_note()`)
   - Splits into `raw_yaml` and `body` via `split_frontmatter()` (lines 54-79 in parser.rs)
   - Returns as separate `Note` struct fields, NOT as raw markdown
   - Desktop app never reconstructs raw markdown; it works with split data

**Frontend Availability:**
- The raw markdown `.md` file is **never sent to the frontend**
- Only `NoteDetail` (split frontmatter fields + body string) is available
- `editedBody` contains only the markdown body, not the YAML frontmatter
- To save: frontend sends body + individual frontmatter fields separately to `api.updateNote()`

**Important Design Consequence:**
- The editor's `MarkdownPreview` (line 312, EditorPanel) renders only the `body` markdown, **not** frontmatter as markdown
- Frontmatter is edited via form fields, not as raw YAML in the editor

### 4. **EditorPanel Component & Full Rendering Flow**

**Component Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx` (320 lines)

**Three Main Rendering Paths:**

1. **BrainMap Note** (activeNote exists) — lines 238-318:
   - Hero header with title, type pill, tags, status, source
   - Conflict resolution banner (if external change)
   - FrontmatterForm (Edit Metadata collapsible)
   - EditorToolbar (conditional on `viewMode === "edit"`)
   - Dual-view editor body with CSS opacity switching
   - RelatedNotesFooter

2. **Plain File** (activePlainFile exists, no activeNote) — lines 67-150:
   - Simplified hero (just filename + path)
   - NO metadata section
   - View toggle buttons present
   - Same dual-view editor body structure

3. **Untitled Tab** (isUntitledTab true) — lines 154-208:
   - Simplified hero (just title, no metadata)
   - NO metadata form
   - View toggle buttons present
   - Same dual-view editor body structure

**Key Rendering Features:**
- **TabBar** at top — shows all open tabs with dirty indicator
- **View toggle buttons** visible on all three paths
- **EditorToolbar** only shown in edit mode
- **Scroll/cursor restoration** via refs and state (lines 39-55)
- **Conflict handling** with "Keep Mine" / "Accept Theirs" buttons
- **Focus mode button** (⤢ / ⤣ Unicode icons) for distraction-free editing

### 5. **Key Implementation Details**

**Tab Persistence:**
- Each tab stores its own `viewMode` in `useTabStore` 
- When switching tabs, `editorStore.openNote()` restores the tab's saved `viewMode`
- Scroll position and cursor position also restored per-tab

**Keyboard Shortcuts Related to View:**
- Cmd+S saves both body and frontmatter atomically
- Cmd+,  opens Settings modal
- View mode switching is button-only (no keyboard shortcut defined in visible code)

**Auto-save Behavior:**
- Enabled by default in `PersistedPrefs`
- Debounced 1.5s on edit
- Triggers on tab switch and window blur
- Skips untitled tabs (no backing file)
- Persists to `brainmap:uiPrefs` localStorage

---

## File Paths Summary

**Frontend Components:**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx` — Main editor container
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx` — Metadata editing section
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx` — CodeMirror wrapper
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx` — Preview renderer
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx` — Tab management UI

**State Management:**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts` — Editor state (viewMode, content, frontmatter)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts` — Tab persistence (viewMode per tab)

**Rust Backend:**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/parser.rs` — Raw markdown serialization
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs` — Note/Frontmatter structs
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs` — Tauri command handlers
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts` — TypeScript API DTOs

---

