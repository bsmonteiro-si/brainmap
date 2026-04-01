# 2026-03-21 — Subagent Transcript: Explore

**Date:** 2026-03-21 11:47:07
**Agent:** Explore
**Agent ID:** a9da716e75ee0e61d
**Parent Session:** 1a35fb75-1a10-4c81-9b33-590d0bd00241

---

## User

Find the tab bar/header component code in crates/app/src/. I need to understand how tabs are rendered, especially canvas tabs vs note tabs. Look for:
1. The TabBar or tab header component
2. How different tab types (note, canvas, excalidraw, etc.) display their titles and icons
3. Any CSS/styling related to tabs

Be thorough - check components directory and any related CSS files.

---

## Assistant

I'll help you find and analyze the tab bar/header component code. Let me search through the crates/app/src directory systematically.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/*Tab*.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/*tab*.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*Tab*.tsx"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"TabBar|TabHeader|tab.*component","path":"crates/app/src","type":"tsx"}`

---

## Assistant

Good! Found the TabBar component. Let me read it and explore related files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/*.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*[Tt]ab*.css"}`

---

## Assistant

Great! Now let me search for CSS files related to tabs:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*.css\" | head -20"}`

---

## Assistant

Let me read the App.css file to find tab-related styles:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"tab|Tab","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","context":3}`

---

## Assistant

Excellent! Now let me check the NoteTypeIcon component which is used for rendering tab icons:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Layout/*Icon*"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout"}`

---

## Assistant

Let me read the fileTreeIcons component:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/fileTreeIcons.tsx"}`

---

## Assistant

Perfect! Now let me check what tab kinds are defined in the tabStore to complete the picture:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*tabStore*\" -o -name \"*tab*store*\" | head -10"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts","limit":150}`

---

## Assistant

Let me also check the EditorPanel to see how tabs are integrated:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx","limit":100}`

---

## Assistant

Perfect! Let me get a bit more of the App.css to see the full tab styling:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":386,"limit":150}`

---

## Assistant

Excellent! Now let me create a comprehensive summary document. Let me grab one more piece - how the tab kind affects rendering:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"kind ===\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx"}`

---

## Assistant

Perfect! Now I have all the information needed. Let me create a comprehensive summary:

## Tab Bar/Header Component Analysis

I've thoroughly explored the tab system in your codebase. Here's what I found:

### 1. **Main Tab Component: TabBar.tsx**
**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx`

The TabBar component is the core tab header renderer. Key features:

- **Tab Types (6 kinds):** `"note"`, `"plain-file"`, `"untitled"`, `"pdf"`, `"excalidraw"`, `"canvas"`
- **State Management:** Uses Zustand's `useTabStore` to track all tabs and the active tab ID
- **Tab Rendering:** Maps over tabs array and renders individual tab-items with:
  - Icon (via `NoteTypeIcon`)
  - Title (truncated with ellipsis)
  - Dirty indicator dot (shows unsaved state)
  - Close button (×)
  - Drag-and-drop support

**Special Tab Handling (lines 120-134):**
```
- Untitled tabs: Clears graph selection, activates untitled tab in editor
- PDF/Excalidraw/Canvas: Clears graph selection, clears editor for custom tab
- Notes: Selects graph node, opens note in editor
- Plain files: Clears graph selection, opens plain file in editor
```

### 2. **Tab Display Logic**

**Icon Rendering (line 247):**
- For **untitled tabs**: No icon passed (undefined)
- For **custom tabs** (pdf/excalidraw/canvas): Uses file extension icon via `NoteTypeIcon`
- For **notes**: Uses note type icon (e.g., "concept" → Lightbulb)
- For **plain files**: Uses file extension icon

**Dirty Indicator (line 249):**
```
{(tab.id === activeTabId && tab.kind !== "excalidraw" && tab.kind !== "pdf" && tab.kind !== "canvas" ? editorIsDirty : tab.isDirty) && <span className="tab-dirty-dot" />}
```
- For active note/plain-file tabs: Uses `editorIsDirty` flag
- For custom tabs (pdf/excalidraw/canvas): Uses per-tab `isDirty` flag (usually false since they auto-save)
- For inactive tabs: Uses per-tab `isDirty`

### 3. **Icon System: fileTreeIcons.tsx**
**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/fileTreeIcons.tsx`

**NoteTypeIcon Component Logic:**
1. If `noteType` provided → uses note type icon (from `NOTE_TYPE_ICONS` mapping)
2. If `fileName` provided → extracts extension and uses file extension icon
3. Falls back to generic File icon

**File Extension Mapping (lines 59-124):**
- `.md` → FileText (gray)
- `.pdf` → FileText (red #e74c3c)
- `.excalidraw` → Pencil (purple #6965db)
- `.canvas` → LayoutDashboard (green #10b981)
- Plus 70+ other extensions (js, ts, json, yaml, images, audio, video, etc.)

**Note Type Icons:**
- `concept` → Lightbulb
- `book-note` → BookOpen
- `question` → HelpCircle
- `reference` → FileText
- `index` → List
- `argument` → MessageSquare
- `experiment` → TestTube
- `person` → User
- `project` → FolderKanban
- `folder` → Folder

### 4. **CSS Styling: App.css**
**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` (lines 386-502)

**Tab Bar Container:**
- Fixed height: 40px
- Horizontal scrolling with hidden scrollbar
- Secondary background color

**Tab Item Styling:**
- Base: 13px font, secondary text color, flex layout with 6px gap
- Padding: 6px 14px
- Max-width: 220px (enforces truncation)
- Border-right separator between tabs
- Hover: tertiary background, primary text color
- Active: primary background, bold font, **accent underline at bottom** (3px inset shadow)
- Dragging: 40% opacity
- Drop target: left accent border (2px inset)

**Tab Title:**
- Truncates with ellipsis when overflow

**Dirty Dot:**
- 6px circle, accent color, positioned absolutely

**Close Button (×):**
- 18px square, hidden by default
- Shows on hover (60% opacity) or when tab is active
- Full opacity on button hover

**New Tab Button (+):**
- 34x34px, secondary text, opacity 0.6
- Becomes primary text at full opacity on hover

### 5. **Context Menu**
**TabContextMenu Component (lines 19-97):**
- Right-click context menu with options:
  - Close This Tab
  - Close Tabs to the Right
  - Close All Tabs
- Clamped positioning to stay within viewport
- Portal-rendered to document.body

### 6. **Tab Data Structure**
**From tabStore.ts (lines 13-29):**
```typescript
interface TabState {
  id: string;              // file path or synthetic ID for untitled
  path: string;
  kind: "note" | "plain-file" | "untitled" | "pdf" | "excalidraw" | "canvas";
  title: string;
  noteType: string | null; // null for non-note types
  editedBody: string | null;
  editedFrontmatter: FmSnapshot;
  isDirty: boolean;
  conflictState: "none" | "external-change";
  fmUndoStack: FmSnapshot[];
  fmRedoStack: FmSnapshot[];
  viewMode: "edit" | "preview" | "raw";
  scrollTop: number;
  cursorPos: number;
}
```

### 7. **Tab Switching Integration**
**EditorPanel.tsx (lines 72-93):**
When tab kind changes, renders different components:
- `pdf` → `PdfViewer`
- `excalidraw` → `ExcalidrawEditor`
- `canvas` → `CanvasEditor`
- Everything else → Standard markdown editor with frontmatter

### Key Design Patterns:

1. **Custom Tab Types Pattern:** Each file type (PDF, Excalidraw, Canvas) has dedicated editor component + tab kind
2. **Icon Flexibility:** Icons determined by either note type (for structured notes) or file extension (for generic files)
3. **Dirty State Separation:** Active note/plain-file tabs use editor store's isDirty; custom tabs use per-tab isDirty
4. **Drag-and-Drop:** Full drag-and-drop support for tab reordering with visual feedback
5. **Visual Hierarchy:** Active tab has bottom accent line; hover shows close button; icons provide type recognition

---

