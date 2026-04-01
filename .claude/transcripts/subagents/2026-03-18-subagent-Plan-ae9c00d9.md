# 2026-03-18 — Subagent Transcript: Plan

**Date:** 2026-03-18 14:50:55
**Agent:** Plan
**Agent ID:** ae9c00d935126ab1f
**Parent Session:** c161688e-735c-4623-a175-2eddaf2f5aae

---

## User

Design an implementation plan for a Notion-style slash command menu in a CodeMirror 6 editor.

## Context

This is a BrainMap app with a CodeMirror 6 markdown editor. The editor already has:

1. **Autocomplete system** using `@codemirror/autocomplete` with `autocompletion({ override: [noteCompletionSource], activateOnTyping: true })` in `MarkdownEditor.tsx` (line 131)
2. **Note autocomplete** in `cmNoteAutocomplete.ts` - triggers on `](` pattern for markdown links
3. **Custom callout types** in `calloutTypes.ts`:
   - `ai-answer` (blue, Bot icon)
   - `source` (orange, BookOpen icon) 
   - `question` (purple, HelpCircle icon)
   - `key-insight` (green, Lightbulb icon)
4. **Inline source citation** syntax: `[!source "content"]`
5. **Formatting helpers** in `cmFormatting.ts`: `insertCallout(view, type)`, `toggleLinePrefix()`, `setHeading()`, `toggleWrap()`, `insertLink()`, `toggleOrderedList()`, `insertAtCursor()`
6. **CALLOUT_TYPE_ENTRIES** exported from `calloutTypes.ts` for iteration

## Requirements

- Typing `/` should trigger a dropdown showing all available slash commands
- Selecting a command replaces the `/command` text with the appropriate syntax
- Commands should include:
  - All 4 callout types (using `insertCallout` from cmFormatting.ts)
  - Inline source citation `[!source ""]`
  - Standard markdown blocks: headings (h1-h3), bullet list, numbered list, checkbox/task, blockquote, code block, horizontal rule, table template
- The menu should show command name, description, and ideally a visual indicator
- Should work alongside the existing note autocomplete (they have different trigger patterns)

## Technical Constraints

- Must use CodeMirror 6's `@codemirror/autocomplete` API (already imported)
- The `autocompletion` config in MarkdownEditor.tsx currently uses `override: [noteCompletionSource]` - need to add the slash command source to this array
- The `activateOnTyping: true` is already set
- Slash should only trigger at start of line or after whitespace (to avoid false triggers inside paths/URLs)
- Existing `insertCallout()` and other formatting helpers should be reused

## Key Files
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmNoteAutocomplete.ts`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutTypes.ts`

Design a detailed implementation plan. Consider:
1. How to structure the slash command completion source
2. How the `apply` function should work (replace `/command` with the syntax)
3. How to integrate with existing autocompletion config
4. How to ensure slash commands and note autocomplete don't interfere
5. Testing strategy

---

## Assistant



I'll explore the existing codebase to understand the current patterns before designing the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmNoteAutocomplete.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutTypes.ts"}`

---

## Assistant

Now let me look at the existing test files for patterns.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmNoteAutocomplete.test.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmSmartPaste.test.ts","limit":50}`

---

## Assistant

Let me also check the autocomplete API usage to understand the `Completion` type better, and look at how existing CSS is structured.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"Completion|CompletionResult|CompletionContext","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/cm*.ts","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

Now let me check the App.css for any autocomplete styling that might already exist.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cm-tooltip|autocomplete|cm-completionLabel","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","-C":2}`

---

## Assistant

I have all the information needed. Here is the implementation plan.

---

## Implementation Plan: Slash Command Menu for CodeMirror 6

### Overview

Create a new `cmSlashCommands.ts` module that provides a `CompletionSource` triggered by `/` at the start of a line (or after whitespace). The completion source returns a list of slash commands that, when selected, replace the `/command` text and invoke the appropriate formatting helper. This integrates into the existing `autocompletion({ override: [...] })` array alongside the note autocomplete source.

### Architecture Decision: Pure `@codemirror/autocomplete` vs Custom Widget

Use the built-in `@codemirror/autocomplete` API. The existing autocomplete infrastructure (styling in `App.css` lines 1357-1392, `activateOnTyping: true`, the `override` array pattern) already handles rendering, keyboard navigation, and positioning. A custom tooltip widget would duplicate all of this. The `Completion` type supports `label`, `detail`, `info`, `type` (icon class), and a custom `apply` function -- which is sufficient for the requirements.

### Step 1: Create `cmSlashCommands.ts`

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmSlashCommands.ts`

This module exports:
1. `SLASH_COMMANDS` -- the command definition array (exported for testing)
2. `slashCommandSource` -- the `CompletionSource` function

#### 1a. Command Definition Type

```ts
interface SlashCommandDef {
  keyword: string;      // e.g. "h1", "bullet", "ai-answer"
  label: string;        // Display name: "Heading 1", "Bullet List"
  detail: string;       // Description: "Insert a level-1 heading"
  section: string;      // Group: "Headings", "Lists", "Callouts", "Blocks"
  apply: (view: EditorView, from: number, to: number) => void;
}
```

The `apply` function receives the `from`/`to` range of the `/command` text so it can replace it before invoking the formatting helper.

#### 1b. Command List

The `SLASH_COMMANDS` array (roughly 18 commands):

**Headings** (section: "Headings"):
- `/h1` -- "Heading 1" -- calls `setHeading(view, 1)` after replacing the slash text
- `/h2` -- "Heading 2" -- calls `setHeading(view, 2)`
- `/h3` -- "Heading 3" -- calls `setHeading(view, 3)`

**Lists** (section: "Lists"):
- `/bullet` -- "Bullet List" -- calls `toggleLinePrefix(view, "- ")`
- `/numbered` -- "Numbered List" -- calls `toggleOrderedList(view)`
- `/task` -- "Task / Checkbox" -- calls `toggleLinePrefix(view, "- [ ] ")`

**Blocks** (section: "Blocks"):
- `/quote` -- "Blockquote" -- calls `toggleLinePrefix(view, "> ")`
- `/code` -- "Code Block" -- inserts triple-backtick fenced block with cursor inside
- `/hr` -- "Horizontal Rule" -- inserts `---\n`
- `/table` -- "Table" -- inserts a 2x2 markdown table template
- `/link` -- "Link" -- calls `insertLink(view)`
- `/source` -- "Inline Source" -- inserts `[!source ""]` with cursor between quotes

**Callouts** (section: "Callouts") -- dynamically generated from `CALLOUT_TYPE_ENTRIES`:
- `/ai-answer` -- "AI Answer" -- calls `insertCallout(view, "ai-answer")`
- `/source-callout` -- "Source Callout" -- calls `insertCallout(view, "source")` (note: distinct from `/source` inline citation)
- `/question` -- "Question" -- calls `insertCallout(view, "question")`
- `/key-insight` -- "Key Insight" -- calls `insertCallout(view, "key-insight")`

#### 1c. Apply Function Pattern

Each command's `apply` is a closure that:
1. Dispatches a transaction to delete the `/keyword` text (from `from` to `to`)
2. Then calls the appropriate formatting helper on the resulting view state

Key detail: some formatting helpers like `setHeading` operate on the current line. Since the `/` was at the start of the line, after deleting `/h1` the line will be empty and `setHeading` will prepend `# ` correctly. For multi-line inserts (code block, table), use `insertAtCursor` after the deletion.

The `apply` function on the `Completion` object supports `(view, completion, from, to)` signature. We use this to replace the slash text and perform the action in one dispatch:

```ts
apply: (view: EditorView, _completion: Completion, from: number, to: number) => {
  // Delete the /command text first
  view.dispatch({ changes: { from, to, insert: "" } });
  // Then apply the formatting
  setHeading(view, 1);
}
```

For commands that insert text (code block, table, hr, inline source), combine the deletion and insertion into a single dispatch for atomicity:

```ts
// Example: code block
apply: (view, _c, from, to) => {
  const insert = "```\n\n```";
  view.dispatch({
    changes: { from, to, insert },
    selection: { anchor: from + 4 },  // cursor on empty line
  });
}
```

#### 1d. The Completion Source Function

```ts
export function slashCommandSource(context: CompletionContext): CompletionResult | null {
  // Match / at start of line or after whitespace, followed by optional keyword chars
  const match = context.matchBefore(/(?:^|\s)\/[\w-]*$/);
  if (!match) return null;

  // Find where the / starts (skip any leading whitespace captured)
  const slashIndex = match.text.lastIndexOf("/");
  const from = match.from + slashIndex;
  const query = match.text.slice(slashIndex + 1).toLowerCase();

  // Build completions
  const options = SLASH_COMMANDS
    .filter(cmd => cmd.keyword.includes(query) || cmd.label.toLowerCase().includes(query))
    .map(cmd => ({
      label: cmd.label,
      detail: cmd.detail,
      type: "keyword" as const,     // CM uses this for the icon class
      section: cmd.section,
      apply: (view: EditorView, _c: any, _from: number, _to: number) => {
        cmd.apply(view, from, _to);
      },
    }));

  if (options.length === 0) return null;

  return { from, options, filter: false };
}
```

**Trigger logic:** The regex `(?:^|\s)\/[\w-]*$` ensures `/` only triggers at line start or after whitespace. This avoids false triggers inside URLs like `https://example.com` or file paths. The `matchBefore` approach is identical to how `noteCompletionSource` works.

**Important:** Set `filter: false` since we do our own filtering (matching against both keyword and label). This also lets us control the sort order.

### Step 2: Integrate into MarkdownEditor.tsx

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx`

Changes:
1. Add import: `import { slashCommandSource } from "./cmSlashCommands";`
2. Update line 131 from:
   ```ts
   autocompletion({ override: [noteCompletionSource], activateOnTyping: true }),
   ```
   to:
   ```ts
   autocompletion({ override: [noteCompletionSource, slashCommandSource], activateOnTyping: true }),
   ```

That is the only change to this file. The two sources have non-overlapping trigger patterns (`](`  vs `/ `), so they will never conflict. CodeMirror calls each source and merges results -- since at most one will return non-null for any given context, there is no interference.

### Step 3: Autocomplete Styling (Optional Enhancement)

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

The existing autocomplete CSS (lines 1357-1392) already styles the popup with the app's theme colors. The `detail` text appears automatically via CM's rendering. Two optional additions:

1. Style `section` headers (CM renders `section` groupings as `.cm-completionSection`):
```css
.editor-body .cm-editor .cm-completionSection {
  padding: 4px 10px 2px;
  font-size: 0.75em;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.05em;
}
```

2. Style the detail text to be muted:
```css
.editor-body .cm-editor .cm-completionDetail {
  color: var(--text-muted);
  font-size: 0.85em;
  margin-left: 8px;
}
```

### Step 4: Testing

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmSlashCommands.test.ts`

Following the established pattern from `cmNoteAutocomplete.test.ts` and `cmSmartPaste.test.ts`, export pure functions for unit testing. The `SLASH_COMMANDS` array and a `filterSlashCommands(query)` helper should be exported.

Test cases:

1. **Command registry completeness:**
   - `SLASH_COMMANDS` contains expected count (roughly 18)
   - Each command has non-empty `keyword`, `label`, `detail`, `section`
   - All 4 callout types are represented
   - All sections are valid strings

2. **Filtering logic (via `filterSlashCommands` or direct source testing):**
   - Empty query after `/` returns all commands
   - `/h` filters to heading commands (h1, h2, h3) plus anything else containing "h"
   - `/ai` filters to AI Answer callout
   - `/xyz` (no match) returns empty array
   - Case-insensitive matching works

3. **Trigger position validation:**
   - `/` at line start triggers (test via regex match)
   - `/` after whitespace triggers
   - `/` inside a URL does not trigger (e.g., `https://`)
   - `/` inside a word does not trigger (e.g., `and/or`)

4. **Apply function correctness (unit-testable portion):**
   - Verify each command's `apply` function signature matches the expected shape
   - For text-insertion commands (code, table, hr, source), test that they produce expected text via a mock EditorView or by testing the generated string

5. **No interference with note autocomplete:**
   - `slashCommandSource` returns null when context matches `](` pattern
   - `noteCompletionSource` returns null when context matches `/` pattern

### Step 5: Documentation

Update `docs/CHANGELOG.md` with the new feature entry.

### File-by-file Summary

| File | Action | Description |
|------|--------|-------------|
| `cmSlashCommands.ts` | **Create** | New module: command definitions + completion source |
| `cmSlashCommands.test.ts` | **Create** | Unit tests for commands and filtering |
| `MarkdownEditor.tsx` | **Modify** (2 lines) | Import + add source to override array |
| `App.css` | **Modify** (~12 lines) | Section header + detail styling |
| `docs/CHANGELOG.md` | **Modify** | Add changelog entry |

### Edge Cases and Risks

1. **`/source` ambiguity:** The inline source citation (`[!source ""]`) and the source callout (`[!source] { ... }`) share the word "source". Solution: use `/source` for the inline citation (more common) and `/source-callout` for the callout block. The label/detail text makes the distinction clear.

2. **setHeading after deletion:** `setHeading` uses `state.doc.lineAt(range.from)` to find the line. After deleting `/h1` from the start of a line, the cursor is at an empty line start, so `setHeading` will correctly prepend `# `. This works because the deletion dispatch updates the state before the helper reads it.

3. **Two-dispatch pattern:** For commands using existing helpers (setHeading, toggleLinePrefix, insertCallout), the apply function must first dispatch a deletion, then call the helper which dispatches its own transaction. This two-dispatch approach is safe because CM batches synchronous dispatches. However, for cleaner UX, we could also manually construct the output text and do a single dispatch. The two-dispatch approach is simpler and reuses existing code -- prefer it unless jank is observed.

4. **Table template:** The inserted markdown table should be a minimal useful template:
   ```
   | Column 1 | Column 2 |
   | -------- | -------- |
   |          |          |
   ```
   Cursor placed at the first cell of the data row.

5. **Activation threshold:** CodeMirror's `activateOnTyping` is already true. The slash alone (single character) triggers the menu. This is intentional -- Notion behaves the same way. If users find it too aggressive, a future option could require at least `/` + one character, but that deviates from the Notion convention.

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmSlashCommands.ts` - New file: all slash command definitions and completion source logic
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx` - Integration point: add slashCommandSource to autocompletion override array (line 131)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts` - Dependency: reuse setHeading, toggleLinePrefix, insertCallout, toggleOrderedList, insertLink, insertAtCursor
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutTypes.ts` - Dependency: iterate CALLOUT_TYPE_ENTRIES to dynamically generate callout slash commands
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmNoteAutocomplete.ts` - Reference: follow the same CompletionSource pattern and testing approach

---

