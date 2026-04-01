# 2026-03-19 — Subagent Transcript: Explore

**Date:** 2026-03-19 20:16:01
**Agent:** Explore
**Agent ID:** ac9d740d89cb098c3
**Parent Session:** 7eb5a8e8-a946-4a5c-817c-4746c13995f5

---

## User

Find all code related to horizontal rules (---), thematic breaks, or HR decorations in the CodeMirror editor. Look in crates/app/src/ for any existing decoration plugins, extensions, or styling related to --- or horizontal rules. Also check for any existing "hide when not focused" or cursor-aware decoration patterns that could serve as a reference. Search thoroughly - check filenames, grep for "hr", "horizontal", "thematic", "HorizontalRule", "---", "rule" in the TypeScript/CSS files.

---

## Assistant

I'll search thoroughly for all code related to horizontal rules, thematic breaks, or HR decorations in the CodeMirror editor.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f \\( -name \"*.ts\" -o -name \"*.tsx\" -o -name \"*.css\" -o -name \"*.scss\" \\) | head -20"}`

---

## Assistant

Let me search for files related to horizontal rules, decorations, and cursor-aware patterns:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"(?i)(?:hr|horizontal|thematic|rule|---)","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","type":"ts","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*decoration*.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*ligature*.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*cm*.ts"}`

---

## Assistant

Great! I found several decoration files. Now let me search more specifically for horizontal rule patterns and cursor-aware code:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"(?i)cursor.*aware|hide.*focus|focused.*decorator|^---","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor","type":"ts","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmArrowDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts"}`

---

## Assistant

Excellent! I found the HR code. Now let me search for more cursor-aware patterns and see if there are any CSS files:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cm-hr","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCheckboxDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts","limit":150}`

---

## Assistant

Now let me check the CSS file for HR styling:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"cm-hr\\|horizontal\\|---\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -40"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","limit":500}`

---

## Assistant

Let me find and read the HR styling section:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1120,"limit":100}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*Ligature*.ts"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor -name \"cm*.ts\" | sort"}`

---

## Assistant

Let me look at the marker renderer to understand how cursor-aware decorations hide when focused:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.test.ts","limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx","limit":100}`

---

## Assistant

Let me search for CSS patterns related to hiding text when cursor is present:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 20 \"cm-checkbox-widget\\|cm-arrow-widget\\|cm-inline-math\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -80"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cursor.*hide|cursor.*fade|focused.*decoration|cm-line.*text","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","context":5}`

---

## Assistant

Let me check for other test files to understand the pattern better:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmArrowDecorations.test.ts","limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCheckboxDecorations.test.ts","limit":150}`

---

## Assistant

Perfect! Now let me compile my comprehensive findings into a clear report.

## Summary

I've completed a thorough search of the BrainMap codebase for all horizontal rule (---) and cursor-aware decoration code. Here are my findings:

### Key Files and Code Locations

**1. Main Horizontal Rule Implementation**
- File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts`
  - Line 102: HR regex pattern: `const HR_RE = /^(\*{3,}|-{3,}|_{3,})\s*$/;`
  - Lines 106-109: Line classification exports with `hr: number[]` array
  - Lines 114-131: `classifyLines()` function that identifies HR lines (detects `---`, `***`, `___`)
  - Lines 342-347: **Cursor-aware HR decoration logic** - skips decoration when `ln === cursorLine`
  - Line 321: `const hrLineDeco = Decoration.line({ class: "cm-hr-line" });`

**2. CSS Styling for Horizontal Rules**
- File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`
  - Lines 1126-1132: HR styling classes
    ```css
    .editor-body .cm-editor .cm-hr-line {
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.5em;
      margin-bottom: 0.5em;
      color: var(--text-muted);
      opacity: 0.5;
    }
    ```

**3. HR Test Coverage**
- File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.test.ts`
  - Lines 74-116: Comprehensive HR tests including:
    - Detection of `---`, `***`, `___`
    - Trailing whitespace handling
    - Multiple consecutive HRs
    - HRs inside fenced code blocks (correctly ignored)
    - HRs with leading text (correctly not detected)

### Cursor-Aware Decoration Pattern

The codebase has a well-established **cursor-aware decoration pattern** used across multiple elements:

**Pattern Overview:**
1. **Scanner function** - identifies matches in the document
2. **Build function** - creates decorations, **skipping current cursor line**
3. **StateField** - tracks cursor position, rebuilds on cursor/doc change
4. **Widget class** - renders decoration element

**Examples using this pattern:**

1. **Checkboxes** (`cmCheckboxDecorations.ts`, lines 85-97)
   - Skips checkbox widget when cursor on same line (shows raw `[ ]`/`[x]`)
   - Test: "skips decoration on cursor line" (line 110)

2. **Arrows** (`cmArrowDecorations.ts`, lines 102-113)
   - Skips arrow replacement on cursor line (shows raw `->`, `<->`, etc.)
   - Test: "skips decoration on cursor line" (line 110)

3. **Inline citations** (`cmMarkdownDecorations.ts`, lines 463-508)
   - Checks if cursor is inside citation: `if (cursorPos >= matchFrom && cursorPos <= matchTo) continue;`

4. **Images & Links** (`cmMarkdownDecorations.ts`)
   - Lines 382-395: Image URL dimming checks `if (imgLine !== cursorLine)`
   - Lines 438-459: Link markup dimming checks `if (linkLine !== cursorLine)`

5. **Callout headers** (`cmCalloutDecorations.ts`)
   - Uses `cursor-aware` pattern (mentioned in line 6 comment)

### StateField Pattern

The standard implementation (used for HR and all decorations):

```typescript
StateField.define<{ cursorLine: number; decos: DecorationSet }>({
  create(state) {
    const cursorLine = state.doc.lineAt(state.selection.main.head).number;
    return { cursorLine, decos: buildDecorations(state.doc, cursorLine) };
  },
  update(value, tr) {
    const cursorLine = tr.state.doc.lineAt(tr.state.selection.main.head).number;
    if (!tr.docChanged && cursorLine === value.cursorLine) return value;
    return { cursorLine, decos: buildDecorations(tr.state.doc, cursorLine) };
  },
  provide: (f) => EditorView.decorations.from(f, (v) => v.decos),
});
```

### Integration Point

- File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx`
  - Line 19: Imports and uses `markdownDecorations` extension
  - HR decoration is part of the core markdown decorations extension

### Supporting Files

- No separate "ligature" file exists for HRs - they're handled directly in `cmMarkdownDecorations.ts`
- No dedicated HR plugin - HRs are integrated into the main markdown decorations system
- Bullet and ordered list decorations follow similar patterns but are in separate files

This is the complete code infrastructure for horizontal rules in the editor. The cursor-aware pattern is the reusable template for any new decoration that needs to show raw syntax when the cursor is on that line.

---

