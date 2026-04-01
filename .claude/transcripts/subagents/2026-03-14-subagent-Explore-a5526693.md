# 2026-03-14 — Subagent Transcript: Explore

**Date:** 2026-03-14 13:51:02
**Agent:** Explore
**Agent ID:** a5526693c7c64ec79
**Parent Session:** 2f24865e-f08e-4c67-a0fa-64f3942ccaee

---

## User

I need to understand how the BrainMap desktop app's editor handles files with and without YAML frontmatter. Specifically:

1. Find the EditorPanel component and understand how it decides what to render (Raw view, line counter, etc.)
2. Find how "Raw" view mode works and what conditions control its visibility
3. Find the line counter feature and what conditions control its visibility
4. Understand how the app detects whether a file has frontmatter or not

Key directories: `crates/app/src/components/Editor/`, `crates/app/src/stores/editorStore.ts`

Be thorough - check for conditionals that might hide UI elements when frontmatter is missing.

---

## Assistant

I'll conduct a thorough exploration of the EditorPanel component and related code to understand how the app handles files with and without YAML frontmatter.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/**/*.{tsx,ts}"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/*Panel*.tsx"}`

---

## Assistant

Now let me read the main EditorPanel component and related files:

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

Now let me check the FrontmatterForm and UIStore to understand the frontmatter detection:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","limit":150}`

---

## Assistant

Let me continue reading the uiStore to find the showLineNumbers field:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","offset":150,"limit":200}`

---

## Assistant

Now let me look at how the app determines whether a file has frontmatter or not. Let me check the API types and the Tauri commands:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/src/*.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","limit":200}`

---

## Assistant

Now let me look at the actual Tauri commands implementation to see how readNote fails when a file has no frontmatter:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","limit":300}`

---

## Assistant

Let me continue reading the commands to find readPlainFile and writeRawNote:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","offset":300,"limit":150}`

---

## Assistant

Now let me search for the handler functions to understand how the app detects and handles files without frontmatter:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"handle_read_plain_file|handle_write_plain_file|handle_write_raw_note","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","offset":341,"limit":100}`

---

## Assistant

Perfect! Now let me look at the EditorPanel code again to understand the complete flow with the fallback to plain file:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx","offset":70,"limit":100}`

---

## Assistant

Perfect! Now let me check the rest of EditorPanel to see the full logic for activeNote rendering with Raw mode and line numbers:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx","offset":233,"limit":112}`

---

## Assistant

Excellent! Now I have a complete understanding. Let me create a comprehensive summary document. Since I'm in read-only mode, I'll provide a detailed report to the user covering all the key findings.

## Summary: EditorPanel Frontmatter Handling in BrainMap

Based on my thorough exploration of the codebase, here's how the BrainMap desktop app handles files with and without YAML frontmatter:

### 1. **Frontmatter Detection Mechanism**

The app distinguishes between files with and without frontmatter through a **fallback pattern**:

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts` (lines 112-198)

When `openNote()` is called (the primary method for opening files):
1. It attempts to call `api.readNote(path)` - this parses the YAML frontmatter
2. If the file lacks frontmatter or has invalid YAML, the `readNote()` API call **fails** (throws an error)
3. The catch block (line 193-196) then calls `openPlainFile(path)` as a fallback
4. This loads the file as a plain text file without any metadata structure

Similarly, the `activateUntitledTab()` and `openPlainFile()` methods handle files without frontmatter by loading them as `PlainFileDetail` rather than `NoteDetail`.

### 2. **EditorPanel Rendering Logic**

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx`

The component has three rendering paths:

**Path 1: Plain File View (No Frontmatter)** (lines 71-154)
- Condition: `if (activePlainFile && !activeNote)`
- Features:
  - Simple title + path display (no metadata pills, tags, status, source)
  - Only **Edit** and **Preview** buttons (NO "Raw" button)
  - No FrontmatterForm rendered
  - No EditorToolbar (except in edit mode)
  - No RelatedNotesFooter
  - No line numbers toggle button
  - Binary file detection: if `activePlainFile.binary === true`, shows "Binary file — cannot be displayed"

**Path 2: Untitled Tab View** (lines 156-211)
- Condition: `if (isUntitled && !activeNote && !activePlainFile && activeTabId)`
- Similar to plain files: simplified view with only Edit/Preview buttons
- No frontmatter editing or raw mode

**Path 3: BrainMap Note View (With Frontmatter)** (lines 233-344)
- Condition: `if (!activeNote)` [implicit; rendered when activeNote exists]
- Features:
  - Full toolbar with **Edit**, **Preview**, AND **"Raw" button** (line 255-259)
  - **Line numbers toggle button** visible (lines 261-267)
  - Type pill, tags, status, source metadata displayed (lines 276-303)
  - FrontmatterForm rendered (line 312) - collapsible metadata editor
  - EditorToolbar rendered in edit mode (line 313)
  - RelatedNotesFooter rendered (line 341)

### 3. **"Raw" View Mode Visibility**

**Location:** Lines 255-259 and 328-339

The "Raw" button is **only visible** when:
- File has valid YAML frontmatter (i.e., `activeNote` exists)
- NOT visible for plain files or untitled tabs

When in raw mode:
- Shows full file content (frontmatter + body) via `readPlainFile()` API
- Content is fetched on-demand when entering raw mode (lines 643-667 in editorStore)
- Placeholder "Loading raw content..." shown while fetching (line 337)
- Raw content is stored in `rawContent` state and synced via `updateRawContent()`
- Switching from raw mode auto-saves changes first (line 675-677 in editorStore)

### 4. **Line Numbers Toggle Visibility**

**Location:** Lines 261-267 and line 74 in MarkdownEditor.tsx

The **line numbers button** (`#`) is **only visible** when:
- File has valid YAML frontmatter (i.e., `activeNote` exists)
- NOT visible for plain files or untitled tabs

Line numbers are controlled by:
- `showLineNumbers` in UIStore (line 171 in uiStore.ts)
- Persisted to localStorage as `editorLineNumbers` (line 324)
- Toggle state managed by `toggleLineNumbers()` (lines 327-332)
- Applied to CodeMirror via `lineNumbers()` extension (line 90 in MarkdownEditor.tsx)

### 5. **Full Conditional Rendering Map**

| Feature | Plain Files | Untitled Tabs | BrainMap Notes |
|---------|------------|---------------|-----------------|
| Edit/Preview buttons | ✓ | ✓ | ✓ |
| Raw button | ✗ | ✗ | ✓ |
| Line numbers button | ✗ | ✗ | ✓ |
| Type pill | ✗ | ✗ | ✓ |
| Tags/Status/Source | ✗ | ✗ | ✓ |
| FrontmatterForm | ✗ | ✗ | ✓ |
| EditorToolbar | (edit only) | (edit only) | ✓ (edit only) |
| RelatedNotesFooter | ✗ | ✗ | ✓ |
| Focus button | ✓ | ✓ | ✓ |
| Conflict detection | ✓ | ✓ | ✓ |

### 6. **Frontmatter Detection Flow (Rust Side)**

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs`

- `handle_read_note()` (line 45-48): Calls `ws.read_note(path)` which parses YAML frontmatter
  - If parsing fails → throws `BrainMapError`
  - TypeScript catches this and falls back to `openPlainFile()`
  
- `handle_read_plain_file()` (line 341-357): Raw file read with UTF-8 validation
  - Returns `PlainFileDetail` with `binary: false` (or `binary: true` if not valid UTF-8)

- `handle_write_raw_note()` (line 373-384): Writes raw content and re-parses via `ws.reload_file()`
  - Only works if file is already in `ws.notes` (i.e., has valid frontmatter)

**Key Files:**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts`

The design ensures clean separation: files without frontmatter are treated as simple text files with minimal UI overhead, while BrainMap-managed notes get the full metadata/linking/graph feature set.

---

