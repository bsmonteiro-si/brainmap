# 2026-03-10 — Subagent Transcript: general-purpose

**Date:** 2026-03-10 15:30:01
**Agent:** general-purpose
**Agent ID:** aa3570fa91eaf1eb3
**Parent Session:** 48765b50-a831-4b83-92b3-bf1a2ec18988

---

## User

You are reviewing React/TypeScript/CSS code for BrainMap, a knowledge graph tool's desktop app. Review the following changed files for correctness, quality, and potential issues.

## Review Criteria (adapted from code-reviewer.md for frontend code)

### 1. Correctness
- Are there logic bugs? Missed conditions?
- Does the UI behave correctly in all states (expanded, collapsed, no data)?
- Are event handlers properly wired?

### 2. React Quality
- Are hooks used correctly (rules of hooks, dependency arrays)?
- Are there unnecessary re-renders?
- Is state management appropriate?

### 3. CSS
- Are styles correct and consistent with existing patterns?
- Any specificity issues or missing styles?

### 4. Accessibility
- Are interactive elements properly labeled?

## Output Format
Write your review as a list of findings. For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

If a file has no issues, skip it. If the code is solid, say so briefly.

## Changed Files

### 1. crates/app/src/components/Editor/FrontmatterForm.tsx (full file):
```tsx
import { useState } from "react";
import type { NoteDetail } from "../../api/types";

interface Props {
  note: NoteDetail;
}

export function FrontmatterForm({ note }: Props) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="frontmatter-form">
      <button
        className="section-toggle"
        onClick={() => setExpanded((e) => !e)}
      >
        <span>{expanded ? "▾" : "▸"}</span>
        Metadata
      </button>
      {expanded && (
        <div className="frontmatter-fields">
          <label>
            <span>Title</span>
            <input type="text" value={note.title} readOnly />
          </label>
          <label>
            <span>Type</span>
            <input type="text" value={note.note_type} readOnly />
          </label>
          <label>
            <span>Tags</span>
            <input type="text" value={note.tags.join(", ")} readOnly />
          </label>
          <label>
            <span>Status</span>
            <input type="text" value={note.status ?? "—"} readOnly />
          </label>
          {note.source && (
            <label>
              <span>Source</span>
              <input type="text" value={note.source} readOnly />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
```

### 2. crates/app/src/components/Search/SearchPanel.tsx (toggle additions):
Added `const [expanded, setExpanded] = useState(true);` and wrapped the search-input-bar + search-results in:
```tsx
<button className="section-toggle" onClick={() => setExpanded((e) => !e)}>
  <span>{expanded ? "▾" : "▸"}</span>
  Search
</button>
{expanded && (
  <>
    <div className="search-input-bar">...</div>
    <div className="search-results">...</div>
  </>
)}
```

### 3. crates/app/src/components/Layout/AppLayout.tsx:
Removed `<div className="panel-header">Search</div>` from the search panel section since the toggle header in SearchPanel replaces it.

### 4. crates/app/src/App.css (new styles):
```css
/* ── Section Toggle (shared collapsible header) ──────────────── */
.section-toggle {
  width: 100%;
  text-align: left;
  padding: 6px 12px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: var(--ui-font-sm);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}
.section-toggle:hover {
  background: var(--bg-tertiary);
}

.frontmatter-form {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.frontmatter-fields {
  padding: 4px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
```

The existing `.frontmatter-form label`, `.frontmatter-form label span`, and `.frontmatter-form input/select` selectors remain unchanged and still match since labels are nested inside `.frontmatter-form`.

Write your review to: /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/collapsible-panels-review-1.md

---

## Assistant



Let me review the changed files and existing code for context.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/FrontmatterForm.tsx","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Search/SearchPanel.tsx","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Layout/AppLayout.tsx","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/App.css","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Search/SearchPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

Now let me check the relevant CSS to see the existing frontmatter styles.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.frontmatter-form","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":2}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.search-panel","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":2}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":195,"limit":60}`

---

## Assistant

Now I have enough context. Let me check if there's an `aria-expanded` pattern used elsewhere.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"aria-expanded","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content"}`

---

## Assistant

Now let me check how FrontmatterForm is consumed to see if the `note` prop could be null/undefined.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"FrontmatterForm","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","-C":2}`

---

## Assistant

Let me check the EditorPanel to see if `activeNote` could be null when FrontmatterForm is rendered.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

Good -- `activeNote` is null-guarded on line 27 before FrontmatterForm is rendered. Now I have everything I need to write the review.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ 2>/dev/null || echo \"directory does not exist\"","description":"Check if reviews directory exists"}`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/collapsible-panels-review-1.md","content":"# Collapsible Panels - Code Review #1\n\n**Reviewer**: code-reviewer agent\n**`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/collapsible-panels-review-1.md`.

**Summary of findings:**

1. **should-fix**: Both `.section-toggle` buttons in `FrontmatterForm.tsx` and `SearchPanel.tsx` are missing `aria-expanded` and `aria-controls` attributes. Screen readers cannot communicate the collapsed/expanded state to users. Add `aria-expanded={expanded}` and `aria-controls` pointing to an `id` on each collapsible content container.

2. **suggestion** (3 items): Expanded state reset awareness if a `key` is ever added to FrontmatterForm; fragment usage in SearchPanel (confirmed correct); Unicode arrow glyphs (low risk on Tauri/macOS).

**No bugs found.** The code is clean, follows existing patterns, and the null-guard in `EditorPanel` correctly protects `FrontmatterForm` from receiving a null note. The search panel's race-condition handling remains intact through the collapsible wrapper.

---

