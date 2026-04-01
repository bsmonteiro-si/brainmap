# 2026-03-27 — Subagent Transcript: Explore

**Date:** 2026-03-27 18:02:42
**Agent:** Explore
**Agent ID:** ae2fe63676a28ea48
**Parent Session:** c8878ce2-3662-4659-9f22-8a7a0fa6f64f

---

## User

Explore how Canvas file nodes handle opening files when clicked/double-clicked. I need to understand:

1. In `crates/app/src/components/Editor/canvasNodes.tsx` - how does the FileNode handle clicks to open files? What function is called?
2. In the tab/editor store - how does opening a file from canvas work vs opening from the Files panel? Look at `openTab`, `openNote`, or similar functions in stores.
3. How are images and videos handled differently from PDFs when opened? Look for tab kind logic, binary file detection, and any "binary data cannot be opened" error message.
4. Check `crates/app/src-tauri/src/commands.rs` and `handlers.rs` for how `read_note` or `get_note` handles binary files.

Be thorough - search for "binary", "cannot be opened", "Binary data", image extensions (.png, .jpg), video extensions, and tab kind assignment logic.

---

## Assistant

I'll conduct a thorough exploration of how Canvas file nodes handle opening files, including the complete flow from UI interaction through backend processing. Let me start by searching for the relevant files and code patterns.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/canvasNodes.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/commands.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/handlers.rs"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -type f -name \"*.ts\" -o -name \"*.tsx\" | grep -i store | head -20"}`

---

## Assistant

Now let me search for store files and examine the code structure:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f \\( -name \"*store*\" -o -name \"*tab*\" \\) -not -path \"*/node_modules/*\" | grep -v worktrees | head -20"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"binary|cannot be opened|Binary data","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","type":"ts"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"binary|cannot be opened|Binary data","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src","type":"rs"}`

---

## Assistant

Good, let me examine the key files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabActions.ts"}`

---

## Assistant

Now let me read the canvasNodes file with offset/limit:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","limit":300}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"onClick|onDoubleClick|handleClick","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","output_mode":"content","context":3}`

---

## Assistant

Great! I can see the FileNode has an `onDoubleClick={openFile}` at line 528. Now let me search for the `openFile` function definition:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"const openFile|function openFile","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","output_mode":"content","context":8}`

---

## Assistant

Let me get more of the openFile function:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","offset":492,"limit":50}`

---

## Assistant

Good! Now let me search for `getFileTypeInfo` and check how files are being handled:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"function getFileTypeInfo|const getFileTypeInfo","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","output_mode":"content","context":15}`

---

## Assistant

Now let me look at the EditorStore to see how `openNote` and `openPlainFile` differ:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores -type f -name \"*.ts\" | head -20"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"openNote|openPlainFile|clearForCustomTab","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores","output_mode":"content","context":5}`

---

## Assistant

Let me read the editorStore file to understand these functions:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"wc -l /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"openNote\\s*:|openPlainFile\\s*:|clearForCustomTab\\s*:","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","output_mode":"content","context":10}`

---

## Assistant

Now let me look at the complete `openPlainFile` function and also look for how images and videos are handled:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","offset":201,"limit":60}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"image\\|video\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/FilesPanel --include=\"*.tsx\" --include=\"*.ts\" | grep -i \"open\\|click\" | head -20"}`

---

## Assistant

Let me continue reading the openPlainFile function and search for image/video handling:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","offset":260,"limit":30}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.png|\\.jpg|\\.jpeg|\\.gif|\\.svg|\\.webp|\\.mp4|\\.mov|\\.avi|image|video","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","type":"tsx","head_limit":30}`

---

## Assistant

Now let me search for FilesPanel to see how it handles opening files:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*FilePanel*\" -o -name \"*FilesPanel*\" 2>/dev/null"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"*.tsx\" | xargs grep -l \"FilesPanel\\|FilePanel\" 2>/dev/null | head -10"}`

---

## Assistant

Let me search for how files are opened from the sidebar or file tree:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f \\( -name \"*.tsx\" -o -name \"*.ts\" \\) | xargs grep -l \"openNote\\|openPlainFile\" | grep -v node_modules | grep`

---

## Assistant

Perfect! Let me check the FileTreePanel:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"openNote\\|openPlainFile\\|double\\|Click\\|click\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx | head -40"}`

---

## Assistant

Let me search more specifically for the click handler in FileTreePanel:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -B5 -A10 \"onDoubleClick\\|doubleClick\\|double-click\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx | head -50"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -B5 -A10 \"handleNodeClick\\|handleClick\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

Excellent! I found it. Now let me see more of this handleClick function and look for how it determines note vs plain file:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -B20 \"const handleClick = ()\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx | head -50"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A30 \"const handleClick = ()\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

Perfect! Let me get the rest:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A50 \"const handleClick = ()\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx | tail -25"}`

---

## Assistant

Excellent! Now let me check the backend commands and handlers for how binary files are handled. Let me look at commands.rs:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"read_note\\|read_plain\\|binary\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs | head -30"}`

---

## Assistant

Now let me check handlers.rs:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"handle_read_note\\|handle_read_plain_file\\|binary\\|Binary\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs | head -40"}`

---

## Assistant

Perfect! Let me examine these functions in detail:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","offset":45,"limit":50}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","offset":413,"limit":40}`

---

## Assistant

Now let me look for the PlainFileDto and check if there's any error handling for binary files in the UI:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"binary\\|Binary data cannot\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.tsx\" --include=\"*.ts\" | grep -v node_modules"}`

---

## Assistant

Great! Let me check EditorPanel and CanvasEditor to see how they handle binary files:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -B5 -A10 \"activePlainFile.binary\\|file.binary\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -B5 -A10 \"file.binary\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx | head -40"}`

---

## Assistant

Let me check the Excalidraw handler and get the full error message in EditorPanel:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -B5 -A10 \"file.binary\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ExcalidrawEditor.tsx | head -40"}`

---

## Assistant

Now let me get the full message from EditorPanel:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -B3 -A20 'if (activePlainFile.binary)' /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

Perfect! Now let me look for VIDEO_EXTS definition in FileTreePanel:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -B5 -A5 \"VIDEO_EXTS\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

Perfect! Now let me check handlers.rs for the image and video path resolution:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"handle_resolve_image_path\\|handle_resolve_video_path\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","offset":430,"limit":60}`

---

## Assistant

Excellent! Now let me check how EditorPanel renders images and videos:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -B5 -A20 \"activeTab.*image\\|activeTab.*video\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx | head -80"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"Custom tab.*image\\|Custom tab.*video\\|PDF\\|Excalidraw\\|Canvas\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

Perfect! Let me get a bit more context on how the tab kinds are used:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx","offset":72,"limit":40}`

---

## Assistant

Perfect! Now let me look at the API layer to see how files are opened and check the PlainFileDto structure:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/generated/PlainFileDto.ts"}`

---

## Assistant

Perfect! Now let me search for how the canvas node handles opening files in the openFile function to see if there are any other file type checks:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","offset":460,"limit":35}`

---

## Assistant

Now let me get the complete picture by creating a summary document. First, let me check if there are any other places where image/video opening is handled:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor -name \"ImageViewer*\" -o -name \"VideoViewer*\" -o -name \"*Viewer*\" | grep -v node_modules"}`

---

## Assistant

Let me check one of the viewers to understand how they work:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ImageViewer.tsx","limit":50}`

---

## Assistant

Perfect! Now I have a comprehensive understanding. Let me create a summary of my findings:

## Comprehensive Analysis: Canvas File Node Opening Flow

Based on my thorough exploration of the codebase, here's how the application handles opening files when clicked/double-clicked from Canvas nodes and the general file opening system:

### 1. Canvas File Node Click Handler (Double-Click)

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx` (lines 492-513)

The `FileNode` component has an `onDoubleClick={openFile}` handler (line 528) that calls the `openFile()` function:

```typescript
const openFile = () => {
  const lp = filePath.toLowerCase();
  if (node) {
    // If it's a BrainMap note in the graph
    useGraphStore.getState().selectNode(filePath);
    useEditorStore.getState().openNote(filePath);
  } else if (lp.endsWith(".pdf")) {
    const fileName = filePath.split("/").pop() ?? filePath;
    useTabStore.getState().openTab(filePath, "pdf", fileName, null);
    useEditorStore.getState().clearForCustomTab();
  } else if (lp.endsWith(".canvas")) {
    const fileName = filePath.split("/").pop() ?? filePath;
    useTabStore.getState().openTab(filePath, "canvas", fileName, null);
    useEditorStore.getState().clearForCustomTab();
  } else if (lp.endsWith(".excalidraw")) {
    const fileName = filePath.split("/").pop() ?? filePath;
    useTabStore.getState().openTab(filePath, "excalidraw", fileName, null);
    useEditorStore.getState().clearForCustomTab();
  } else {
    useGraphStore.getState().selectNode(null);
    useEditorStore.getState().openPlainFile(filePath);
  }
};
```

**Key Logic:**
- If the file is a BrainMap note (has metadata in the graph), it opens as a note
- Special handling for `.pdf`, `.canvas`, and `.excalidraw` files
- Everything else goes through `openPlainFile()` (which includes images, videos, and text files)

### 2. File Opening from Files Panel (Sidebar)

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`

The `handleClick` function handles single-click opening from the file tree, with explicit detection for images and videos:

```typescript
const handleClick = () => {
  const lowerPath = node.fullPath.toLowerCase();
  
  // IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".ico", ".bmp"]
  if (IMAGE_EXTS.some((ext) => lowerPath.endsWith(ext))) {
    const fileName = node.fullPath.split("/").pop() ?? node.fullPath;
    useTabStore.getState().openTab(node.fullPath, "image", fileName, null);
    useEditorStore.getState().clearForCustomTab();
    return;
  }
  
  // VIDEO_EXTS = [".mp4", ".webm", ".mov", ".avi", ".mkv", ".ogv"]
  if (VIDEO_EXTS.some((ext) => lowerPath.endsWith(ext))) {
    const fileName = node.fullPath.split("/").pop() ?? node.fullPath;
    useTabStore.getState().openTab(node.fullPath, "video", fileName, null);
    useEditorStore.getState().clearForCustomTab();
    return;
  }
  
  // PDFs, Excalidraw, Canvas handled similarly...
  
  // BrainMap notes vs plain files
  if (isBrainMapNote) {
    useGraphStore.getState().selectNode(node.fullPath);
    useEditorStore.getState().openNote(node.fullPath);
  } else {
    useGraphStore.getState().selectNode(null);
    useEditorStore.getState().openPlainFile(node.fullPath);
  }
};
```

### 3. TabStore - Tab Kind Management

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts` (lines 13-29)

Tab kinds are defined as: `"note" | "plain-file" | "untitled" | "pdf" | "excalidraw" | "canvas" | "image" | "video"`

The `openTab()` function at line 76 accepts a file path and explicitly sets the tab kind. **Important distinction:** Canvas nodes use `openPlainFile()` for non-note files (which sets tab kind to `"plain-file"`), while the file panel explicitly detects and sets `"image"` and `"video"` tab kinds.

### 4. How Images and Videos Are Handled Differently

**Key Difference:** Extension-based detection and separate rendering paths

**File Panel (FileTreePanel.tsx):**
- Explicitly checks file extensions for images and videos
- Opens with `tabStore.openTab(..., "image"|"video", ...)`
- Calls `clearForCustomTab()` instead of `openNote()` or `openPlainFile()`

**Canvas Node (canvasNodes.tsx):**
- Does NOT explicitly detect images and videos
- Falls through to `openPlainFile()` which always sets tab kind to `"plain-file"`
- The backend reads binary file content but returns empty string with `binary: true`

**Tab Rendering (EditorPanel.tsx, lines 74-111):**
```typescript
if (activeTab?.kind === "pdf") return <PdfViewer path={activeTab.path} />;
if (activeTab?.kind === "excalidraw") return <ExcalidrawEditor path={activeTab.path} />;
if (activeTab?.kind === "canvas") return <CanvasEditor path={activeTab.path} />;
if (activeTab?.kind === "image") return <ImageViewer path={activeTab.path} />;
if (activeTab?.kind === "video") return <VideoViewer path={activeTab.path} />;
// Plain file (text editor)
if (activePlainFile && !activeNote) { ... }
```

### 5. Binary File Detection and Error Handling

**Backend (handlers.rs, lines 413-428):**

The `handle_read_plain_file()` function attempts UTF-8 decoding:

```rust
pub fn handle_read_plain_file(ws: &Workspace, path: &str) -> Result<PlainFileDto, String> {
    let bytes = std::fs::read(&abs)?;
    match String::from_utf8(bytes) {
        Ok(body) => Ok(PlainFileDto {
            path: path.to_string(),
            body,
            binary: false,
        }),
        Err(_) => Ok(PlainFileDto {
            path: path.to_string(),
            body: String::new(),  // Empty string for binary files
            binary: true,
        }),
    }
}
```

**Frontend Error Messages:**
1. **EditorPanel.tsx** (for plain-file tabs with binary content):
   - Displays: **"Binary file — cannot be displayed"**

2. **CanvasEditor.tsx** (for canvas files containing binary data):
   - Error: **"Binary file — cannot open as canvas"**

3. **ExcalidrawEditor.tsx** (for excalidraw files containing binary data):
   - Error: **"Binary file — cannot open as drawing"**

### 6. API Type Definitions

**PlainFileDto** (`/crates/app/src/api/generated/PlainFileDto.ts`):
```typescript
export type PlainFileDto = { path: string, body: string, binary: boolean };
```

### 7. Image and Video Path Resolution (Backend)

**Image Validation (handlers.rs, lines 432-462):**
- Supported extensions (kept in sync): `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`, `.ico`, `.bmp`
- Max size: 100 MB
- Returns `ImageMetaDto` with metadata (path, absolute_path, size_bytes)
- Does NOT read file content — frontend loads via Tauri's `asset://` protocol

**Video Validation (handlers.rs, lines 466-489):**
- Supported extensions (kept in sync): `.mp4`, `.webm`, `.mov`, `.avi`, `.mkv`, `.ogv`
- Max size: 2 GB
- Returns `VideoMetaDto` with metadata
- Does NOT read file content — frontend loads via Tauri's `asset://` protocol

### 8. Key File Paths Referenced

- Canvas nodes UI: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx`
- File tree panel: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`
- Tab store: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts`
- Tab actions: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabActions.ts`
- Editor store: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts`
- Editor panel: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx`
- Backend handlers: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs`
- Backend commands: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs`
- Viewers: ImageViewer, VideoViewer, PdfViewer in `/crates/app/src/components/Editor/`

---

