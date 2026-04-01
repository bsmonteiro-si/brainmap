# 2026-03-10 — Subagent Transcript: general-purpose

**Date:** 2026-03-10 15:18:26
**Agent:** general-purpose
**Agent ID:** a18d9ebcbd681db02
**Parent Session:** 5ee4c9d5-92e1-4662-83cb-0ee187b89703

---

## User

You are reviewing TypeScript/React code for BrainMap, a knowledge graph desktop app. Review the following changed files for correctness, React quality, and potential issues.

## Review Criteria

You are reviewing TypeScript/React code (not Rust). Apply the spirit of these criteria adapted for TypeScript/React:

### 1. Correctness
- Are there logic bugs? Missed conditions?
- Is state management correct? (stale closures, missing deps, wrong initial values)
- Are there React anti-patterns? (calling hooks conditionally, side effects in render)

### 2. React Quality
- Are hooks called in the correct order and unconditionally?
- Is state initialized correctly and with the right type?
- Are event handlers and callbacks correct?
- Are there any missing keys on lists?

### 3. Function/Component Design
- Is each component doing one thing?
- Are props typed correctly?

### 4. Type Safety
- Are TypeScript types correct and non-`any`?
- Are optional values handled safely (no unguarded access)?

### 5. CSS/Styling
- Are new CSS classes consistent with existing patterns?
- Any obvious layout or overflow issues?

## Output Format

Write your review as a list of findings. For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

If a file has no issues, skip it. If the code is solid, say so briefly.

Do NOT report: missing comments, style preferences that don't affect correctness, TODOs.

---

## Changed Files

### File 1: `crates/app/src/components/Editor/MarkdownPreview.tsx` (new file)

```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  content: string;
}

export function MarkdownPreview({ content }: Props) {
  return (
    <div className="md-preview">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
```

### File 2: `crates/app/src/components/Editor/EditorPanel.tsx` (modified)

```tsx
import { useState } from "react";
import { useEditorStore } from "../../stores/editorStore";
import { useUIStore } from "../../stores/uiStore";
import { MarkdownEditor } from "./MarkdownEditor";
import { MarkdownPreview } from "./MarkdownPreview";
import { FrontmatterForm } from "./FrontmatterForm";
import { RelatedNotesFooter } from "./RelatedNotesFooter";

export function EditorPanel() {
  const activeNote = useEditorStore((s) => s.activeNote);
  const isLoading = useEditorStore((s) => s.isLoading);
  const conflictState = useEditorStore((s) => s.conflictState);
  const resolveConflict = useEditorStore((s) => s.resolveConflict);
  const focusMode = useUIStore((s) => s.focusMode);
  const toggleFocusMode = useUIStore((s) => s.toggleFocusMode);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const editedBody = useEditorStore((s) => s.editedBody);

  if (isLoading) {
    return <div className="editor-placeholder">Loading note...</div>;
  }

  if (!activeNote) {
    return (
      <div className="editor-placeholder">
        Select a node in the graph or search results to view its content.
      </div>
    );
  }

  return (
    <div className="editor-panel">
      <div className="editor-header-bar">
        <span className="editor-title">{activeNote.title}</span>
        <div className="editor-view-toggle">
          <button
            className={`editor-view-btn${viewMode === "edit" ? " editor-view-btn--active" : ""}`}
            onClick={() => setViewMode("edit")}
            type="button"
          >Edit</button>
          <button
            className={`editor-view-btn${viewMode === "preview" ? " editor-view-btn--active" : ""}`}
            onClick={() => setViewMode("preview")}
            type="button"
          >Preview</button>
        </div>
        <button
          className="editor-focus-btn"
          onClick={toggleFocusMode}
          title={focusMode ? "Exit focus mode" : "Focus mode"}
        >
          {focusMode ? "⤡" : "⤢"}
        </button>
      </div>
      {conflictState === "external-change" && (
        <div className="conflict-banner">
          <span>File changed externally.</span>
          <button onClick={() => resolveConflict("keep-mine")}>Keep Mine</button>
          <button onClick={() => resolveConflict("accept-theirs")}>Accept Theirs</button>
        </div>
      )}
      <FrontmatterForm note={activeNote} />
      <div className="editor-body">
        {viewMode === "edit" ? (
          <MarkdownEditor
            notePath={activeNote.path}
            content={activeNote.body}
            onChange={(body) => useEditorStore.getState().updateContent(body)}
          />
        ) : (
          <MarkdownPreview content={editedBody ?? activeNote.body} />
        )}
      </div>
      <RelatedNotesFooter />
    </div>
  );
}
```

Write the review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/markdown-preview-review-1.md` and return a summary of any bug or should-fix findings.

---

## Assistant

I'll review the two files and write the findings to the specified path.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ 2>/dev/null || mkdir -p /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/","description":"Ensure review`

---

## Assistant

Now let me look at the existing editorStore to understand `editedBody`, `updateContent`, and `conflictState` types before writing the review.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/stores/editorStore*","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/*.tsx","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

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

Now let me check the existing CSS for editor-related classes to understand styling patterns:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.css","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"editor-|md-preview|editor-body|editor-view|conflict","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","context":1}`

---

## Assistant

I now have enough context. Let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/markdown-preview-review-1.md","content":"# Code Review: MarkdownPreview + EditorPanel\n\n**Files reviewed:**\n- `crates/a`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/markdown-preview-review-1.md`.

Here is the summary of bug and should-fix findings:

---

**Bug — `EditorPanel.tsx` line ~42: wrong `content` prop passed to `MarkdownEditor`**

`MarkdownEditor` receives `content={activeNote.body}` (the last-saved body) instead of `content={editedBody ?? activeNote.body}`. When a user edits in Edit mode, switches to Preview (which correctly shows the edited content), then switches back to Edit, `MarkdownEditor` remounts with the stale saved body. The sync effect inside `MarkdownEditor` (`useEffect([content])`) then overwrites the CodeMirror document with `activeNote.body`, silently discarding all unsaved edits.

Fix: change the prop to `content={editedBody ?? activeNote.body}`, matching the expression already used for `MarkdownPreview`.

---

**Should-fix — `EditorPanel.tsx`: `viewMode` not reset on note change**

`viewMode` is component-level state that is never reset when `activeNote` changes. Because `EditorPanel` stays mounted, a user left in Preview mode who opens a different note will see that note in Preview mode without any indication. Fix: add `useEffect(() => { setViewMode("edit"); }, [activeNote?.path])`.

---

`MarkdownPreview.tsx` is otherwise correct. The only remaining item is a suggestion (hoist `[remarkGfm]` to module scope to avoid unnecessary re-renders), which does not block the change.

---

