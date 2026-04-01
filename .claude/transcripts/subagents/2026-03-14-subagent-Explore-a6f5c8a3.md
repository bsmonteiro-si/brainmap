# 2026-03-14 — Subagent Transcript: Explore

**Date:** 2026-03-14 13:41:39
**Agent:** Explore
**Agent ID:** a6f5c8a3580646250
**Parent Session:** e5a29361-7527-49e2-974b-b2cd0b7fbe9c

---

## User

In the BrainMap desktop app at `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/`, I need to understand how plain (non-note) files are opened. The app already supports opening plain files and binary files in tabs.

Find and read:

1. `editorStore.ts` — find the `openPlainFile` action and `activePlainFile` state. How does it work? What API does it call?
2. The Tauri backend command that reads plain files — look in `commands.rs` and `handlers.rs` for a `read_file` or `get_file_content` command (something that reads raw file content, not parsed notes)
3. The file tree click handler — in `FileTreePanel.tsx` or similar, how does clicking a file decide whether to call `openNote` vs `openPlainFile`? What determines if a file is a "note" vs a "plain file"?
4. The `graphStore` — how does `selectNode(path)` work and what happens when the path doesn't exist in the graph?

The issue: files without YAML frontmatter (like CLAUDE.md) appear in the file tree but fail with "file not found" when clicked, because they're not in the workspace's `notes` HashMap. I need to understand the existing plain file path so we can fall back to it.

---

## Assistant

I'll help you understand how plain files are opened in the BrainMap desktop app. Let me search for the relevant files and read them systematically.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.tsx"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -name \"*.ts\" -o -name \"*.tsx\" | head -30"}`

---

## Assistant

Now let me read the key files to understand how plain files are opened.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

Now let me read the API types and the Tauri backend commands.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri -name \"*.rs\" | grep -E \"(commands|handlers)\" | head -5"}`

---

## Assistant

Now let me read the Tauri backend commands and handlers.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","limit":150}`

---

## Assistant

Let me continue reading the handlers and search for the read_plain_file command.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","offset":150,"limit":100}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"read_plain_file\\|readPlainFile\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"read_plain_file\\|writePlainFile\\|write_plain_file\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

Perfect. Now let me read the actual implementations of these functions:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","offset":300,"limit":50}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","offset":340,"limit":60}`

---

## Assistant

Excellent! Now let me read the bridge API to see how it invokes these commands:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts","limit":200}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"readPlainFile\\|readNote\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts | head -20"}`

---

## Assistant

Now let me read the tauri.ts API implementation:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts","offset":115,"limit":30}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts","offset":35,"limit":30}`

---

## Assistant

Perfect! Now I have all the information I need. Let me create a comprehensive summary document.

## Summary

I've thoroughly analyzed the BrainMap desktop app's plain file handling system. Here's what I found:

### 1. **`editorStore.ts` — `openPlainFile` action and `activePlainFile` state**

**Lines 198-264**: The `openPlainFile` action mirrors the structure of `openNote` but for non-BrainMap files:
- **State field**: `activePlainFile: PlainFileDetail | null` (line 17)
- **Action**: `openPlainFile(path)` (lines 198-264)
- **Flow**:
  1. Checks if file is already open in a tab (snapshot + restore logic)
  2. Calls `api.readPlainFile(path)` to fetch the file content
  3. Opens a new tab with `kind: "plain-file"` (line 257)
  4. Sets `activePlainFile` and clears `activeNote` (line 258)
- **Save path**: `saveNote()` method (lines 479-503) handles plain file saves by calling `api.writePlainFile()`
- **Plain files have no frontmatter** — no `editedFrontmatter` field, metadata editing disabled

### 2. **Tauri backend commands**

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs` (lines 301-313)

Command dispatch:
```rust
#[tauri::command]
pub fn read_plain_file(state: State<'_, AppState>, path: String) -> Result<PlainFileDto, String> {
    state.with_active(|ws| handlers::handle_read_plain_file(ws, &path))
}

#[tauri::command]
pub fn write_plain_file(state: State<'_, AppState>, path: String, body: String) -> Result<(), String> {
    // validation + registration
    state.with_slot(&root, |slot| handlers::handle_write_plain_file(&slot.workspace, &path, &body))
}
```

**Handlers**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs` (lines 341-369)
- **`handle_read_plain_file`**: Validates path, reads raw bytes, returns UTF-8 string or marks as binary
- **`handle_write_plain_file`**: Validates that path is NOT in `ws.notes` (rejects writes to BrainMap notes), then writes file directly

### 3. **File tree click handler**

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx` (lines 426-434)

Decision logic in `FileTreeNode`:
```typescript
const isBrainMapNote = !!node.note_type;  // Line 421

const handleClick = () => {
  if (isBrainMapNote) {
    useGraphStore.getState().selectNode(node.fullPath);
    useEditorStore.getState().openNote(node.fullPath);
  } else {
    useGraphStore.getState().selectNode(null);  // Clear graph selection
    useEditorStore.getState().openPlainFile(node.fullPath);
  }
};
```

**Determination**: A file is a "plain file" if `note_type` is undefined/falsy (line 421). The file tree builds nodes from:
1. BrainMap notes in the graph (have `note_type`)
2. Plain workspace files (no `note_type`) added via `buildTree()` function (lines 110-145)

### 4. **`graphStore.selectNode(path)` behavior**

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts` (lines 52-54)

```typescript
selectNode: (path: string | null) => {
  set({ selectedNodePath: path });
},
```

**Current behavior**: Simply sets `selectedNodePath` in store state. **No validation that the path exists in the graph**. This is the problem:
- When clicking a plain file, `selectNode(null)` is called (line 431 of FileTreePanel)
- When clicking a note, `selectNode(path)` is called — but if the path isn't in the graph, it still sets it without error
- The graph rendering may then try to render a node that doesn't exist in `nodes` Map

### **Root Cause Analysis**

Files like `CLAUDE.md` (no YAML frontmatter) appear in the file tree because:
1. `buildTree()` merges `workspaceFiles` from the backend (lines 110-145 of FileTreePanel.tsx)
2. Plain files have `note_type: undefined`, so they display without a note icon
3. When clicked, `openPlainFile()` is called correctly
4. **But if the graph tries to render the node, it fails** because the node doesn't exist in the `nodes` Map

The fix should:
- Ensure `openPlainFile()` gracefully handles files not in the graph
- When `selectNode(null)` is called for plain files, the graph should NOT try to show them
- Handle the tab opening even if the file wasn't in workspace at load time

Let me compile all the relevant file paths for your reference:

**Key files (frontend)**:
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts` (openPlainFile at line 198)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx` (click handler at line 426)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts` (selectNode at line 52)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts` (API interface definitions)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts` (command invocation)

**Key files (backend)**:
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs` (lines 301-313)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs` (lines 341-369)

---

