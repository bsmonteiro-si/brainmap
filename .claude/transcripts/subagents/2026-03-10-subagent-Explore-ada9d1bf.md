# 2026-03-10 — Subagent Transcript: Explore

**Date:** 2026-03-10 15:55:30
**Agent:** Explore
**Agent ID:** ada9d1bfaadf85df4
**Parent Session:** 504142e5-d35d-4516-be5f-55570124fd3b

---

## User

In the BrainMap desktop app at /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app, find the editor/preview components. I need to understand:
1. How the expanded editor view works (focus mode or full-width mode)
2. The CSS/layout for the preview (markdown rendered) view
3. Any max-width or width constraints on the preview content
4. The component structure: where does the Edit/Preview toggle live, and how does the preview content get its width

Look in src/components/ for anything related to editor, preview, note, inspector. Also check for any CSS files or styled components with max-width constraints on the preview content area. Be thorough - check the actual CSS and JSX for width/max-width properties.

---

## Assistant

I'll help you understand the editor/preview components in the BrainMap desktop app. Let me start by exploring the structure.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -type f \\( -name \"*.tsx\" -o -name \"*.ts\" -o -name \"*.css\" \\) | head -30"}`

---

## Assistant

Let me focus on the source components directory:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/*.tsx","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/*.css","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

Perfect! Now let me examine the editor-related components:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx"}`

---

## Assistant

Now let me check the CSS/styling for these components:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*.css\" -o -name \"*.scss\" | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Excellent! Now let me check the FrontmatterForm and RelatedNotesFooter components to understand the full editor structure:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx"}`

---

## Assistant

Now let me check the AppLayout to understand focus mode and how the editor panel gets its width:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"focusMode|focus.*editor|editor.*width|max-width.*editor","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","type":"tsx"}`

---

## Assistant

Let me check the UIStore to understand focus mode behavior:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*Store*\" -o -name \"*store*\" | grep -v node_modules"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

Perfect! Now I have a comprehensive understanding. Let me compile the findings:

## Summary of Editor/Preview Components in BrainMap Desktop App

### 1. **Focus Mode / Expanded Editor View**

**How it works:**
- **Location:** UIStore (`useUIStore`) manages `focusMode` boolean state
- **Trigger:** The "⤢" button in the editor header bar toggles `toggleFocusMode()`
- **Behavior:** When `focusMode === true`, the left graph panel **collapses** (not hidden—just visually collapsed). This is managed in `AppLayout.tsx` lines 29-36:
  ```tsx
  useEffect(() => {
    if (focusMode) {
      graphPanelRef.current?.collapse();
    } else {
      graphPanelRef.current?.expand();
    }
  }, [focusMode, graphPanelRef]);
  ```
- **Result:** The editor panel expands to fill the available space (via `react-resizable-panels` Panel API)
- **No max-width constraint** is applied during focus mode—it's purely a layout collapse on the left panel

### 2. **Component Structure (Editor/Preview Toggle)**

**Location:** `EditorPanel.tsx` (lines 16-81)
- **Toggle lives in editor header bar** (lines 39-50):
  ```tsx
  <div className="editor-view-toggle">
    <button className={...} onClick={() => setViewMode("edit")}>Edit</button>
    <button className={...} onClick={() => setViewMode("preview")}>Preview</button>
  </div>
  ```
- **Local state:** `viewMode` is component-local state (`"edit"` or `"preview"`)
- **Renders conditionally** (lines 68-76):
  - Edit: `<MarkdownEditor />`
  - Preview: `<MarkdownPreview />`

### 3. **Preview (Markdown Rendered) View CSS**

**Location:** `App.css` lines 695-809

**Max-width constraint:**
```css
.md-preview {
  padding: 16px 20px;
  font-family: var(--editor-font-family);
  font-size: var(--editor-font-size);
  color: var(--text-primary);
  line-height: 1.7;
  max-width: 720px;  /* ← KEY: hardcoded max-width */
}
```

**Key styling:**
- **Max-width: 720px** — constrains preview content to a readable column width
- **Font:** Uses `--editor-font-family` and `--editor-font-size` (monospace by default, configurable in Settings)
- **Padding:** 16px top/bottom, 20px left/right
- **Line-height:** 1.7 (generous spacing)

**Element-specific styles included for:**
- Headings (h1-h6): font-weight 600, margin 1.4em top, 0.5em bottom
- Paragraphs: margin 0 0 1em
- Lists: padding-left 1.6em
- Code (inline): background tertiary, border, radius 3px, padding 0.1em 0.35em
- Code blocks (pre): background secondary, border, radius 6px, padding 14px 16px, overflow-x auto
- Blockquotes: left border 3px accent color, padding 4px 0 4px 16px
- Tables: full-width, border-collapse, striped rows
- Links: accent color, no underline (underline on hover)

### 4. **Panel Structure & Width Constraints**

**Layout hierarchy** (`AppLayout.tsx`):
1. Outer `Group` (horizontal) contains:
   - Left `Panel` (graph/files) — default 60% width
   - Right `Panel` (editor + search) — default 40% width

2. Right `Panel` contains inner `Group` (vertical):
   - Top `Panel` (editor) — default 60% of right panel
   - Bottom `Panel` (search) — default 40% of right panel

**Width flow for editor:**
- Editor panel width = right panel width = 40% of total (default, resizable)
- **No max-width on the editor container itself**
- Only the `.md-preview` div (preview content) has `max-width: 720px`

**Container styling:**
```css
.editor-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  /* NO width constraint */
}

.editor-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  /* NO max-width */
}
```

### 5. **Edit Mode (CodeMirror) Width**

**Location:** `MarkdownEditor.tsx` line 77
```tsx
return <div ref={containerRef} style={{ height: "100%" }} />;
```

- **CodeMirror fills 100% of `.editor-body`**
- **No width constraint** — expands to full available width
- CSS for CodeMirror (App.css lines 257-267):
  ```css
  .editor-body .cm-editor {
    height: 100%;
    /* width is 100% by default */
  }
  
  .editor-body .cm-editor .cm-content,
  .editor-body .cm-editor .cm-line {
    font-family: var(--editor-font-family) !important;
    font-size: var(--editor-font-size) !important;
  }
  ```

### 6. **Full Component Hierarchy**

```
AppLayout
├─ Group (horizontal, outer)
│  ├─ Panel (id="graph", left, 60% default)
│  │  ├─ Graph / File Tree (via tab toggle)
│  │  └─ Collapse/expand via focusMode
│  └─ Panel (id="right", right, 40% default)
│     └─ Group (vertical)
│        ├─ Panel (id="editor", top, 60% default)
│        │  └─ EditorPanel
│        │     ├─ editor-header-bar
│        │     │  ├─ title
│        │     │  ├─ editor-view-toggle (Edit/Preview buttons) ← TOGGLE LIVES HERE
│        │     │  └─ editor-focus-btn (⤢/⤡)
│        │     ├─ FrontmatterForm (collapsible metadata)
│        │     ├─ editor-body
│        │     │  ├─ MarkdownEditor (CodeMirror) when viewMode="edit"
│        │     │  └─ MarkdownPreview when viewMode="preview"
│        │     │     └─ .md-preview (max-width: 720px)
│        │     └─ RelatedNotesFooter
│        └─ Panel (id="search", bottom, 40% default)
└─ StatusBar
```

### **Key Takeaways for Your Use Case:**

1. **Preview max-width is 720px** — this is a hardcoded, responsive design choice in `.md-preview`
2. **Edit mode has no max-width** — CodeMirror fills the panel width
3. **Focus mode doesn't widen the editor** — it collapses the left panel, allowing the right panel to take more space (but the editor itself doesn't expand; it stays the default 60% of the right panel)
4. **Edit/Preview toggle is in the editor header bar** — a simple button group, component-local state
5. **All widths are fluid and resizable** — panels use `react-resizable-panels` with percentage-based defaults

---

