# 2026-03-19 — Subagent Transcript: Explore

**Date:** 2026-03-19 20:35:19
**Agent:** Explore
**Agent ID:** a79fea64693621cc2
**Parent Session:** b1d9eca6-8bb3-4c0b-8673-2c48c1a7ec0b

---

## User

Explore the BrainMap app's store architecture and file handling to understand how a new file type (like .excalidraw) could be integrated:

1. Look at the Zustand stores in crates/app/src/stores/ - especially how activeNote and activePlainFile work
2. How does the workspace/segment system discover and track files? Look at the Rust side in crates/core/src/workspace.rs and crates/app/src-tauri/
3. How does the file watcher work? Would it pick up .excalidraw files?
4. How are file extensions handled? Is there filtering by extension?
5. Look at how the FileTreePanel.tsx renders the file tree - does it filter by extension?
6. Check if there's a concept of "file type" beyond markdown notes
7. Look at how tabs work - TabStore or similar - can they support different editor types?

I need to understand what changes would be needed to support a completely new file type that uses a different editor (not CodeMirror).

---

## Assistant

I'll explore the BrainMap app's store architecture and file handling to understand how a new file type could be integrated. Let me start by examining the key systems.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"*.ts\" -o -name \"*.tsx\" | grep -E \"(store|Store)\" | head -20"}`

---

## Assistant

Now let me examine the key store files to understand the architecture:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts"}`

---

## Assistant

Now let me explore the file watcher and workspace system on the Rust side:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","limit":100}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/src/handlers/file_watcher*"}`

---

## Assistant

Let me search for the file watcher code:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src -name \"*watch*\" -o -name \"*watcher*\""}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs","limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","limit":100}`

---

## Assistant

Let me continue reading the watcher and examine FileTreePanel:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs","offset":150,"limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":150}`

---

## Assistant

Now let me look at the API types and how files are discovered:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts","limit":120}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"workspaceFiles\\|workspace_files\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.ts\" --include=\"*.tsx\" | head -20"}`

---

## Assistant

Now let me check the graphStore to see how workspaceFiles is managed:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 10 -B 5 \"workspaceFiles\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts | head -80"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphDiff.ts","limit":100}`

---

## Assistant

Let me check how plainFileDetail is used and if there are multiple editor types:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"PlainFileDetail\\|PlainFileDto\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.ts\" --include=\"*.tsx\" -l | head -15"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components -name \"*Editor*\" -type f"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx","limit":150}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"activePlainFile\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components --include=\"*.tsx\" -l"}`

---

## Assistant

Let me check how list_workspace_files is implemented on the backend:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"listWorkspaceFiles\\|list_workspace_files\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates --include=\"*.rs\" -l"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 30 \"list_workspace_files\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 50 \"fn collect_files_recursive\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs | head -60"}`

---

## Assistant

Perfect! Now let me check the API types to understand PlainFileDto better:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/generated/PlainFileDto.ts"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"struct.*PlainFile\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src --include=\"*.rs\" -A 10"}`

---

## Assistant

Excellent! Now let me check the Tauri command dispatcher to see how different file types are handled:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs","limit":100}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 5 \"readPlainFile\\|read_plain_file\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs | head -30"}`

---

## Assistant

Let me check the handler implementation:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 20 \"fn handle_read_plain_file\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

Perfect! Now let me look at the PDF viewer to understand how alternative editor types are handled:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components -name \"*Pdf*\" -o -name \"*PDF*\""}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/PdfViewer.tsx","limit":80}`

---

## Assistant

Perfect! Now I have enough information. Let me create a comprehensive analysis document. Let me search for how MainWindow decides what to display:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components -name \"*Main*\" -o -name \"*main*\" | head -10"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*.tsx\" | xargs grep -l \"EditorPanel\\|FileTreePanel\" | head -5"}`

---

## Assistant

Perfect! Now let me look at AppLayout to understand the full picture:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx","limit":100}`

---

## Assistant

Excellent! I now have a comprehensive understanding. Let me create a detailed analysis document based on all the code I've reviewed.

## Summary: BrainMap File Type Integration Architecture

Based on my thorough exploration of the BrainMap codebase, here's a comprehensive analysis of how a new file type (like `.excalidraw`) could be integrated:

### **1. Store Architecture (Frontend)**

**Current Duality Pattern:**
The system uses a two-pronged approach in `editorStore.ts`:
- **`activeNote`**: `NoteDetail` - YAML frontmatter + markdown body (BrainMap-managed)
- **`activePlainFile`**: `PlainFileDetail` - plain text files without frontmatter

Both exist simultaneously in state, but only one is active at a time. The `TabStore` tracks tab metadata with `kind: "note" | "plain-file" | "untitled" | "pdf"`.

**Key Finding**: A new file type would need:
- A new state property in `editorStore` (e.g., `activeExcalidrawFile`)
- Updated `TabStore.kind` union type to include `"excalidraw"`
- Per-tab state snapshots (already supported via `segmentStateCache.ts`)

**File Type Dispatch**:
At `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx`, the component conditionally renders:
- PDF tabs → `<PdfViewer>`
- Plain files with `binary: false` → CodeMirror via `<MarkdownEditor>`
- Plain files with `binary: true` → "Binary file — cannot be displayed"
- BrainMap notes → `<MarkdownEditor>` + `<FrontmatterForm>`

A new editor would insert here as another conditional branch (e.g., `if (activeTab?.kind === "excalidraw") return <ExcalidrawEditor>`).

---

### **2. File Discovery & Watcher System**

**Backend File Discovery** (`crates/app/src-tauri/src/handlers.rs`):
```
handle_list_workspace_files()
  └─ collect_files_recursive(base, dir) — walks entire directory tree, returns all files (no filtering)
```
This is **extension-agnostic**: it returns ALL files. No hard-coded filtering by `.md`.

**File Watcher** (`crates/app/src-tauri/src/watcher.rs`):
```
WatchedFile = Markdown(PathBuf) | Plain(PathBuf)

Line 148: if event.path.extension() == Some("md")
            → WatchedFile::Markdown → process_md_change → topology diff
          else if is_file
            → WatchedFile::Plain → process_plain_change → "files-changed" event
```

**Critical Finding**: The watcher **discriminates by extension**:
- `.md` files → full graph topology processing (add/reload/remove via `workspace.rs`)
- Non-`.md` files → just emitted as `files-changed` events (no graph mutation)

**For `.excalidraw`**:
- Either: Add new discriminant `| Excalidraw(PathBuf)` to `WatchedFile` enum
- Or: Keep as `Plain` and handle specially in frontend

---

### **3. File Type Routing (API & Commands)**

**Backend Commands** (`crates/app/src-tauri/src/commands.rs`):
- `open_workspace` → loads all files via `list_workspace_files` (no filtering)
- `read_plain_file(path)` → `PlainFileDto { path, body, binary }`
- `resolve_pdf_path(path)` → special handling for PDFs (asset:// URLs)

**API Interface** (`crates/app/src/api/types.ts`):
```typescript
listWorkspaceFiles(): Promise<string[]>
readPlainFile(path: string): Promise<PlainFileDetail>  // { path, body, binary }
```

**For `.excalidraw`**:
- Could reuse `readPlainFile` (returns JSON body as string)
- Or create dedicated `readExcalidrawFile()` command
- Desktop app already has `openInDefaultApp()` — can launch Excalidraw separately

---

### **4. File Tree Integration**

**FileTreePanel.tsx** (`buildTree()` function):
- Accepts `nodes: Map<string, NodeDto>` (graph) + `workspaceFiles: string[]` (filesystem)
- **Merges both sources**:
  1. Virtual folder nodes from graph (skipped if `note_type === "folder"`)
  2. Graph notes (`.md` with frontmatter)
  3. **Workspace files not in graph** (lines 116–149) — renders plain files alongside notes

**Critical Finding**: The tree **already supports arbitrary file extensions**:
```typescript
// workspaceFiles includes ALL files (not just .md)
if (workspaceFiles) {
  for (const filePath of workspaceFiles) {
    if (nodes.has(filePath)) continue;  // Already added from graph
    // Add as generic file node with fileName as title
    roots.push({
      name: fileName,
      fullPath: filePath,
      title: fileName,
      isFolder: false,
      children: [],
      // No note_type — it's a plain file
    });
  }
}
```

**.excalidraw files would**:
1. Appear in tree automatically (via `workspaceFiles`)
2. Show with generic file icon (no `note_type` metadata)
3. Click → `onSelectFile(path)` → `editorStore.openPlainFile(path)` → renders based on tab kind

---

### **5. Event Flow for New File Types**

**Backend → Frontend**:
```
WatchedFile event
  ├─ Markdown → process_md_change → workspace.add/reload/remove_file → emit "topology-changed"
  └─ Plain → process_plain_change → emit "files-changed" { added_files, removed_files }
```

**Frontend receives**:
```typescript
type WorkspaceEvent =
  | { type: "topology-changed"; added_nodes: NodeDto[]; ... }
  | { type: "files-changed"; added_files: string[]; removed_files: string[]; ... }
```

**`graphDiff.ts` applies**:
```typescript
case "files-changed": {
  if (path.exists) {
    workspaceFiles.push(path);  // File tree picks up new file
  } else {
    workspaceFiles = workspaceFiles.filter(f => f !== path);  // Remove from tree
  }
}
```

**.excalidraw integration**:
- Watch as `Plain` file (not graph-modifying)
- Gets `files-changed` events
- `FileTreePanel` renders automatically
- Click → tab opens with content in appropriate viewer

---

### **6. Multi-Segment/Workspace Support**

**State Caching** (`segmentStateCache.ts`):
```typescript
interface SegmentSnapshot {
  nodes: Map<string, NodeDto>;
  edges: EdgeDto[];
  workspaceFiles: string[];  // ← Already caches all files
}
```

File type state would be cached alongside editor state automatically via:
- `useEditorStore.getState().clearForPdfTab()` or custom `clear*()` for new type
- Per-segment `.activeNote` / `.activePlainFile` / `.active[NewType]` all swapped out

**Folder switching** (`workspaceStore.ts`):
- `switchSegment()` already handles clearing/restoring all editor state
- No changes needed for new file types

---

### **7. What Changes Are Needed**

#### **Minimal Integration** (for read-only support):
1. ✅ No watcher changes — `.excalidraw` flows as `Plain` file
2. ✅ No backend API changes — use `readPlainFile()`
3. ✅ **Frontend only**:
   - Add `activeExcalidrawFile` to `editorStore`
   - Add `"excalidraw"` to `TabStore.kind` union
   - Add conditional in `EditorPanel.tsx` to render custom viewer
   - Create `<ExcalidrawViewer>` or embed Excalidraw editor

#### **Full Integration** (for editing + graph linking):
4. Make `.excalidraw` files appear as BrainMap "documents" (graph nodes)
5. Parse Excalidraw JSON to extract title + optionally extract links
6. Add `note_type: "drawing"` to graph (extends current 11 types)
7. Update `workspace.rs` to handle `.excalidraw` in `add_file()`/`reload_file()`
8. Change watcher to discriminate `.excalidraw` as special case

---

### **8. Tab System & Editor Type Routing**

**Current Tab Kinds**:
```typescript
kind: "note" | "plain-file" | "untitled" | "pdf"
```

**For multiple editors, pattern is**:
1. Expand `kind` union with new type
2. Update `EditorPanel.tsx` dispatcher:
   ```typescript
   const activeTab = ...; // TabState
   if (activeTab?.kind === "excalidraw") return <ExcalidrawEditor path={activeTab.path} />;
   if (activeTab?.kind === "pdf") return <PdfViewer path={activeTab.path} />;
   if (activePlainFile && !activeNote) return <MarkdownEditor ... />;
   if (activeNote) return <MarkdownEditor + FrontmatterForm />;
   ```

3. Each editor manages its own state + persistence

---

### **9. Key Design Patterns to Follow**

1. **Editor independence**: Each file type can use completely different UI (PDF has custom canvas, Excalidraw would use its own canvas)
2. **State isolation**: No shared UI state between editors — each stores in its own slice
3. **Lazy loading**: Frontend `getAPI()` handles which command is dispatched based on file type
4. **File discovery is agnostic**: Filesystem walk returns all extensions; graph decides what's a "node"
5. **Watcher separation**: `.md` → graph mutations; everything else → filesystem events only

---

### **10. Existing Extension Points**

- `crates/app/src/components/Editor/` — add new editor component here
- `editorStore.ts` — add state slice (copy `activePlainFile` pattern)
- `EditorPanel.tsx` — add conditional render branch
- `tabStore.ts` — extend `kind` union
- `watcher.rs` — optionally add new discriminant (or handle as Plain)

---

### **File Paths for Reference**

**Core State Management**:
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphDiff.ts`

**UI Rendering**:
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`

**Backend**:
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs` (file discrimination)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs` (file discovery)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs` (API dispatch)

**Example of Alternative Viewer**:
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/PdfViewer.tsx` — shows pattern for custom editor (self-contained state, no CodemMirror)

---

**Bottom Line**: BrainMap's architecture cleanly separates graph-aware "notes" from filesystem-aware "plain files." Adding a new editor type requires only frontend changes (new state + new conditional branch in `EditorPanel`) unless you want the files to be searchable/linked in the graph, which requires minor Rust changes to watcher + parser.

---

