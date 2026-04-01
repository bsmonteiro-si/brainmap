# 2026-03-18 — Subagent Transcript: Explore

**Date:** 2026-03-18 12:55:02
**Agent:** Explore
**Agent ID:** af60093e4ad9d0948
**Parent Session:** 210e9b86-df86-4c62-9036-efbf3f129063

---

## User

Medium-depth exploration of integration points for Editor Phase B features in /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/. I need specifics on:

1. **StatusBar.tsx** — Read the full file. I need to understand where to add word count display. What's the current layout? What info does it show?

2. **graphStore.ts** — How are nodes stored? I need the shape of NodeDto or similar to understand what data is available for note autocomplete. Specifically: does each node have `path` and `title`?

3. **EditorPanel.tsx** — Read the toolbar section. Where would a "Document Outline" dropdown button go? How does the view mode toggle work? What's the relationship between EditorPanel and MarkdownEditor (does EditorPanel have access to the EditorView ref)?

4. **editorStore.ts** — Read the `updateContent` and `openNote` actions. I need to know where to hook in word count computation. Also check if there's already a `wordCount` field or similar.

5. **MarkdownEditor.tsx** — Re-read to understand how `onViewReady` exposes the EditorView ref to the parent. This is needed for the outline's scroll-to-heading feature.

Read each file and report the relevant sections with line numbers.

---

## Assistant

I'll conduct a medium-depth exploration of these integration points. Let me start by reading each file systematically.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/StatusBar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/MarkdownEditor.tsx"}`

---

## Assistant

Let me search for the correct file paths for the missing files.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/StatusBar.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/MarkdownEditor.tsx"}`

---

## Assistant

Now let me read these files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/StatusBar/StatusBar.tsx"}`

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

Perfect. Now let me check the NodeDto type definition and look at the editor toolbar to complete the picture.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/EditorToolbar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorToolbar.tsx"}`

---

## Assistant

Now let me get the NodeDto definition from the generated types.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/generated.ts","limit":150}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/api/generated.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/api/*.ts"}`

---

## Assistant

Let me search for NodeDto definition in the codebase.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"interface NodeDto|type NodeDto","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/generated/NodeDto.ts"}`

---

## Assistant

Perfect! Now I have all the information needed. Let me compile my findings into a comprehensive report.

## Integration Points Analysis: Editor Phase B

### 1. StatusBar.tsx
**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/StatusBar/StatusBar.tsx`

**Current Layout (lines 119-227):**
- Segment switcher dropdown on left (lines 121-206)
- Refresh button (lines 207-215)
- Separator and active note path with dirty indicator (lines 216-224)

**For Word Count Integration:**
- **Anchor point:** Lines 216-224 — after the separator, before or alongside the note path
- **Best placement:** Add word count display right after line 221 (after `activeNote.path`), before the dirty indicator
- Example location: `<span className="separator">|</span><span>{activeNote.path}</span><span className="word-count">{wordCount} words</span>{isDirty && ...}`
- The component already has `activeNote` from `useEditorStore` (line 21), so you'll need to add a derived `wordCount` value

**Key structure:**
- No complex state management — straightforward read-only display
- Simple DOM structure using `<span>` elements with CSS class names
- Dirty indicator pattern established (line 221) — can extend this pattern

---

### 2. graphStore.ts (NodeDto structure)
**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts`

**NodeDto shape (from `/crates/app/src/api/generated/NodeDto.ts`, line 3):**
```typescript
type NodeDto = {
  path: string,      // Full path — usable for autocomplete display and lookups
  title: string,     // Display name for note
  note_type: string, // Category/type
  tags: Array<string> | null // Tags (nullable)
}
```

**Storage (graphStore.ts):**
- **Lines 8, 40-43:** Nodes stored in `Map<string, NodeDto>` keyed by `path`
- **Usage in graph state:** Accessed via `nodes: new Map<string, NodeDto>()` created at load time
- Both `path` and `title` are available and stable for note autocomplete implementation

**For Note Autocomplete:**
- **Source:** Use `graphStore.nodes` — iterate the Map values
- **Display:** `{node.title}` with secondary path display
- **Selection:** Use `node.path` as the actual link target
- The path is the canonical key, making lookups efficient

---

### 3. EditorPanel.tsx
**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx`

**Toolbar Section (lines 302-334):**
```
editor-hero-top
├── editor-view-toggle (Edit/Preview/Raw buttons) — lines 303-319
├── editor-line-numbers-btn (#) — lines 320-326
└── editor-focus-btn (↗/↘) — lines 327-333
```

**Document Outline Button Placement:**
- Best location: Add between `editor-view-toggle` and `editor-line-numbers-btn` (after line 319, before line 320)
- Alternative: Add at the end of the toolbar (after focus button, before line 334)
- Pattern: Single button like line numbers, toggling outline visibility

**EditorPanel ↔ MarkdownEditor Relationship:**
- **Line 15:** `editorViewRef` is a ref to EditorView created and maintained in EditorPanel
- **Line 46-48:** `handleViewReady` callback captures the EditorView from MarkdownEditor
- **Line 372:** EditorPanel passes `editorViewRef.current` to `EditorToolbar` (same pattern available for outline)
- **EditorView access:** Parent has full control via the ref and can call view methods (e.g., `view.state.doc.toString()`, `view.dispatch()`)

**For Outline Feature:**
- EditorPanel already has the EditorView ref at line 15 (`editorViewRef`)
- Outline component can receive this ref from EditorPanel as a prop
- EditorView provides access to document AST through the state and syntax tree API
- **Scroll-to-heading:** Use `editorViewRef.current.dispatch()` to set selection and scroll into view

**View Mode Toggle Pattern (lines 304-318):**
```jsx
<div className="editor-view-toggle">
  <button onClick={() => setViewMode("edit")} ...>Edit</button>
  <button onClick={() => setViewMode("preview")} ...>Preview</button>
  <button onClick={() => setViewMode("raw")} ...>Raw</button>
</div>
```

---

### 4. editorStore.ts
**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts`

**updateContent Action (lines 358-362):**
```typescript
updateContent: (body: string) => {
  set({ editedBody: body, isDirty: true });
  const tabId = useTabStore.getState().activeTabId;
  if (tabId) useTabStore.getState().updateTabState(tabId, { isDirty: true, editedBody: body });
}
```
- **Hook point:** After `set({ editedBody: body, ... })` — add word count computation here
- Called on every keystroke in the editor
- No existing `wordCount` field in EditorState (checked lines 15-52)

**openNote Action (lines 113-199):**
- **Lines 146-164:** On successful load, activeNote is set with full NoteDetail data
- **Hook point:** After line 192 (`set({ activeNote: note, isLoading: false })`), compute initial word count
- Plain files (openPlainFile, lines 201-268): Similar pattern after loading at line 262

**State Interface (lines 15-52):**
- No existing `wordCount` or `wordCountDirty` field
- **Need to add:** Two fields to track word count
  - `wordCount: number` — current word count
  - `_wordCountDirty: boolean` — flag for debounced computation (optional, if implementing debouncing)
- Alternative lightweight approach: Compute on-demand in StatusBar via a custom hook reading `editedBody`

**For Word Count Implementation:**
- **Approach A (in store):** Add fields to EditorState, compute in `updateContent` and `openNote`
- **Approach B (in component):** Derive from `editedBody` in StatusBar using a custom hook (`useMemo`)
- Approach B is lighter weight and avoids store bloat for a UI-only derived value

---

### 5. MarkdownEditor.tsx
**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx`

**Props Interface (lines 64-72):**
```typescript
interface Props {
  notePath: string;
  content: string;
  onChange: (content: string) => void;
  onViewReady?: (view: EditorView | null) => void;  // ← Callback for EditorView
  restoreScrollTop?: number;
  restoreCursorPos?: number;
  readOnly?: boolean;
}
```

**onViewReady Exposure (lines 153, 173):**
- **Line 153:** `onViewReady?.(view)` — called immediately after EditorView creation
- **Line 173:** `onViewReady?.(null)` — called on cleanup/destruction
- This is how EditorPanel's `editorViewRef` gets populated

**EditorView Creation (lines 147-150):**
```typescript
const view = new EditorView({
  state,
  parent: containerRef.current,
});

viewRef.current = view;
onViewReady?.(view);  // ← Parent callback receives the view
```

**For Outline's Scroll-to-Heading:**
- EditorView has methods:
  - `view.state.selection` — current selection/cursor position
  - `view.dispatch({ selection: { anchor: pos } })` — move cursor to position
  - `view.scrollDOM.scrollTop = y` — scroll directly
  - `view.dispatch({ effects: EditorView.scrollIntoView(pos) })` — scroll a position into view (CM extension)
- The parent (EditorPanel) can access all these via the ref passed from MarkdownEditor

---

## Summary Table

| Feature | File | Key Lines | Hook Point | Data Available |
|---------|------|-----------|-----------|-----------------|
| **Word Count Display** | StatusBar.tsx | 216-224 | After path, before dirty indicator | Need: `wordCount` from editorStore or derived |
| **Graph Node Data** | graphStore.ts | 8, 40-43 | `nodes: Map<string, NodeDto>` | `path`, `title` for autocomplete |
| **Outline Dropdown** | EditorPanel.tsx | 302-334 | Between view-toggle and line-numbers | `editorViewRef` available as prop |
| **View Mode Toggle** | EditorPanel.tsx | 304-318 | Existing pattern for similar toolbar button | CSS class `.editor-view-btn` |
| **Word Count Logic** | editorStore.ts | 358-362, 113-199 | In `updateContent` and `openNote` | `editedBody` content available |
| **Outline Scroll** | MarkdownEditor.tsx | 153, 147-150 | EditorView exposed via `onViewReady` | Full EditorView API available to parent |

---

All integration points are well-structured and accessible. The patterns are already established in the codebase (view toggles, toolbar buttons, ref-based parent-child communication). No major architectural changes needed.

---

