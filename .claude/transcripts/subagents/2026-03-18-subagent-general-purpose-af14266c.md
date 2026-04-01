# 2026-03-18 — Subagent Transcript: general-purpose

**Date:** 2026-03-18 14:59:51
**Agent:** general-purpose
**Agent ID:** af14266cfa5ba430c
**Parent Session:** c161688e-735c-4623-a175-2eddaf2f5aae

---

## User

You are reviewing TypeScript code for BrainMap's CodeMirror editor. Review the following changed files for real defects.

## Review Criteria (from code-reviewer.md)

You are reviewing code for BrainMap, a knowledge graph tool. Your job is to find real defects, not style nits.

### What to Review

1. **Correctness**: Logic bugs? Off-by-one errors? Missed conditions? Error handling?
2. **Function Design**: Is each function doing one thing? Are names descriptive?
3. **Test Coverage**: Is every new public function tested? Are error paths tested? Do tests verify behavior?
4. **Performance**: Are there O(n^2) loops or unnecessary work?

### Output Format

Write your review as a list of findings. For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

If the code is solid, say so briefly.

Do NOT report: Missing comments, style preferences, TODOs.

## Changed Files

### NEW: crates/app/src/components/Editor/cmSlashCommands.ts

```ts
import type { CompletionContext, CompletionResult, Completion } from "@codemirror/autocomplete";
import { EditorSelection } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import { CALLOUT_TYPE_ENTRIES } from "./calloutTypes";
import {
  setHeading,
  toggleLinePrefix,
  toggleOrderedList,
  insertLink,
  insertCallout,
} from "./cmFormatting";

export interface SlashCommandDef {
  keyword: string;
  label: string;
  detail: string;
  section: string;
  apply: (view: EditorView, from: number, to: number) => void;
}

function deleteAndRun(
  view: EditorView,
  from: number,
  to: number,
  fn: (v: EditorView) => boolean,
) {
  view.dispatch({ changes: { from, to, insert: "" } });
  fn(view);
}

function replaceWith(
  view: EditorView,
  from: number,
  to: number,
  text: string,
  cursorOffset: number,
) {
  view.dispatch({
    changes: { from, to, insert: text },
    selection: EditorSelection.cursor(from + cursorOffset),
  });
}

export const SLASH_COMMANDS: SlashCommandDef[] = [
  {
    keyword: "h1",
    label: "Heading 1",
    detail: "Large heading",
    section: "Headings",
    apply: (v, from, to) => deleteAndRun(v, from, to, (v) => setHeading(v, 1)),
  },
  {
    keyword: "h2",
    label: "Heading 2",
    detail: "Medium heading",
    section: "Headings",
    apply: (v, from, to) => deleteAndRun(v, from, to, (v) => setHeading(v, 2)),
  },
  {
    keyword: "h3",
    label: "Heading 3",
    detail: "Small heading",
    section: "Headings",
    apply: (v, from, to) => deleteAndRun(v, from, to, (v) => setHeading(v, 3)),
  },
  {
    keyword: "bullet",
    label: "Bullet List",
    detail: "Unordered list item",
    section: "Lists",
    apply: (v, from, to) =>
      deleteAndRun(v, from, to, (v) => toggleLinePrefix(v, "- ")),
  },
  {
    keyword: "numbered",
    label: "Numbered List",
    detail: "Ordered list item",
    section: "Lists",
    apply: (v, from, to) => deleteAndRun(v, from, to, toggleOrderedList),
  },
  {
    keyword: "task",
    label: "Task List",
    detail: "Checkbox item",
    section: "Lists",
    apply: (v, from, to) =>
      deleteAndRun(v, from, to, (v) => toggleLinePrefix(v, "- [ ] ")),
  },
  {
    keyword: "quote",
    label: "Blockquote",
    detail: "Quoted text",
    section: "Blocks",
    apply: (v, from, to) =>
      deleteAndRun(v, from, to, (v) => toggleLinePrefix(v, "> ")),
  },
  {
    keyword: "code",
    label: "Code Block",
    detail: "Fenced code block",
    section: "Blocks",
    apply: (v, from, to) => replaceWith(v, from, to, "```\n\n```", 4),
  },
  {
    keyword: "hr",
    label: "Divider",
    detail: "Horizontal rule",
    section: "Blocks",
    apply: (v, from, to) => replaceWith(v, from, to, "---\n", 4),
  },
  {
    keyword: "table",
    label: "Table",
    detail: "2×2 markdown table",
    section: "Blocks",
    apply: (v, from, to) => {
      const t =
        "| Column 1 | Column 2 |\n| -------- | -------- |\n|          |          |";
      replaceWith(v, from, to, t, t.indexOf("|          |") + 2);
    },
  },
  {
    keyword: "link",
    label: "Link",
    detail: "Markdown link",
    section: "Blocks",
    apply: (v, from, to) => deleteAndRun(v, from, to, insertLink),
  },
  {
    keyword: "source",
    label: "Inline Source",
    detail: "Citation reference",
    section: "BrainMap",
    apply: (v, from, to) =>
      replaceWith(v, from, to, '[!source ""]', '[!source "'.length),
  },
  ...CALLOUT_TYPE_ENTRIES.map(([type, def]) => ({
    keyword: type === "source" ? "source-callout" : type,
    label: `${def.label} Callout`,
    detail: `${def.label} callout block`,
    section: "Callouts",
    apply: (v: EditorView, from: number, to: number) =>
      deleteAndRun(v, from, to, (v) => insertCallout(v, type)),
  })),
];

export function filterSlashCommands(query: string): SlashCommandDef[] {
  if (!query) return SLASH_COMMANDS;
  const q = query.toLowerCase();
  return SLASH_COMMANDS.filter(
    (cmd) =>
      cmd.keyword.includes(q) || cmd.label.toLowerCase().includes(q),
  );
}

const SLASH_TRIGGER = /(?:^|\s)\/[\w-]*$/;

export function slashCommandSource(
  context: CompletionContext,
): CompletionResult | null {
  const match = context.matchBefore(SLASH_TRIGGER);
  if (!match) return null;

  const slashIndex = match.text.lastIndexOf("/");
  const from = match.from + slashIndex;
  const query = match.text.slice(slashIndex + 1);

  const filtered = filterSlashCommands(query);
  if (filtered.length === 0) return null;

  const options: Completion[] = filtered.map((cmd) => ({
    label: cmd.label,
    detail: cmd.detail,
    section: cmd.section,
    apply: (view: EditorView, _completion: Completion, _from: number, to: number) => {
      cmd.apply(view, from, to);
    },
  }));

  return { from, options, filter: false };
}
```

### MODIFIED: crates/app/src/components/Editor/MarkdownEditor.tsx (2-line diff)

Added import:
```ts
import { slashCommandSource } from "./cmSlashCommands";
```

Changed line 131 from:
```ts
autocompletion({ override: [noteCompletionSource], activateOnTyping: true }),
```
to:
```ts
autocompletion({ override: [noteCompletionSource, slashCommandSource], activateOnTyping: true }),
```

### NEW: crates/app/src/components/Editor/cmSlashCommands.test.ts

```ts
import { describe, it, expect } from "vitest";
import { SLASH_COMMANDS, filterSlashCommands } from "./cmSlashCommands";

describe("SLASH_COMMANDS registry", () => {
  it("has the expected number of commands", () => {
    expect(SLASH_COMMANDS.length).toBe(16);
  });

  it("every command has required fields", () => {
    for (const cmd of SLASH_COMMANDS) {
      expect(cmd.keyword).toBeTruthy();
      expect(cmd.label).toBeTruthy();
      expect(cmd.detail).toBeTruthy();
      expect(cmd.section).toBeTruthy();
      expect(typeof cmd.apply).toBe("function");
    }
  });

  it("has unique keywords", () => {
    const keywords = SLASH_COMMANDS.map((c) => c.keyword);
    expect(new Set(keywords).size).toBe(keywords.length);
  });

  it("includes all callout types", () => {
    const keywords = SLASH_COMMANDS.map((c) => c.keyword);
    expect(keywords).toContain("ai-answer");
    expect(keywords).toContain("source-callout");
    expect(keywords).toContain("question");
    expect(keywords).toContain("key-insight");
  });

  it("includes standard markdown commands", () => {
    const keywords = SLASH_COMMANDS.map((c) => c.keyword);
    expect(keywords).toContain("h1");
    expect(keywords).toContain("h2");
    expect(keywords).toContain("h3");
    expect(keywords).toContain("bullet");
    expect(keywords).toContain("numbered");
    expect(keywords).toContain("task");
    expect(keywords).toContain("quote");
    expect(keywords).toContain("code");
    expect(keywords).toContain("hr");
    expect(keywords).toContain("table");
    expect(keywords).toContain("link");
  });

  it("includes inline source command", () => {
    const keywords = SLASH_COMMANDS.map((c) => c.keyword);
    expect(keywords).toContain("source");
  });

  it("has valid sections", () => {
    const validSections = new Set(["Headings", "Lists", "Blocks", "BrainMap", "Callouts"]);
    for (const cmd of SLASH_COMMANDS) {
      expect(validSections.has(cmd.section)).toBe(true);
    }
  });
});

describe("filterSlashCommands", () => {
  it("returns all commands for empty query", () => {
    expect(filterSlashCommands("")).toEqual(SLASH_COMMANDS);
  });

  it("filters by keyword", () => {
    const result = filterSlashCommands("h1");
    expect(result.length).toBe(1);
    expect(result[0].keyword).toBe("h1");
  });

  it("filters by partial keyword", () => {
    const result = filterSlashCommands("h");
    const keywords = result.map((c) => c.keyword);
    expect(keywords).toContain("h1");
    expect(keywords).toContain("h2");
    expect(keywords).toContain("h3");
    expect(keywords).toContain("hr");
  });

  it("filters by label (case-insensitive)", () => {
    const result = filterSlashCommands("heading");
    expect(result.length).toBe(3);
    for (const cmd of result) {
      expect(cmd.section).toBe("Headings");
    }
  });

  it("matches ai-answer", () => {
    const result = filterSlashCommands("ai");
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.some((c) => c.keyword === "ai-answer")).toBe(true);
  });

  it("returns empty for no match", () => {
    expect(filterSlashCommands("xyz")).toEqual([]);
  });

  it("is case-insensitive", () => {
    const lower = filterSlashCommands("bullet");
    const upper = filterSlashCommands("BULLET");
    expect(lower).toEqual(upper);
  });

  it("matches 'source' to both inline and callout", () => {
    const result = filterSlashCommands("source");
    const keywords = result.map((c) => c.keyword);
    expect(keywords).toContain("source");
    expect(keywords).toContain("source-callout");
  });
});

describe("slash trigger regex", () => {
  const SLASH_TRIGGER = /(?:^|\s)\/[\w-]*$/;

  it("matches / at line start", () => {
    expect(SLASH_TRIGGER.test("/")).toBe(true);
    expect(SLASH_TRIGGER.test("/h1")).toBe(true);
  });

  it("matches / after whitespace", () => {
    expect(SLASH_TRIGGER.test("text /")).toBe(true);
    expect(SLASH_TRIGGER.test("text /code")).toBe(true);
  });

  it("does not match / inside URL", () => {
    expect(SLASH_TRIGGER.test("https://example")).toBe(false);
  });

  it("does not match / mid-word", () => {
    expect(SLASH_TRIGGER.test("and/or")).toBe(false);
  });

  it("matches / with hyphenated keywords", () => {
    expect(SLASH_TRIGGER.test("/ai-answer")).toBe(true);
    expect(SLASH_TRIGGER.test("/key-insight")).toBe(true);
  });
});
```

### MODIFIED: crates/app/src/App.css (added section header styling)

```css
.editor-body .cm-editor .cm-completionSection {
  padding: 4px 10px 2px;
  font-size: 0.75em;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  border-top: 1px solid var(--border-color);
}
```

## Key Context

- The existing `noteCompletionSource` triggers on `](` pattern — no overlap with `/`
- `insertCallout`, `setHeading`, `toggleLinePrefix`, etc. are existing helpers in cmFormatting.ts
- `CALLOUT_TYPE_ENTRIES` provides the 4 callout types dynamically
- CodeMirror's `autocompletion` with `override` array calls each source independently

Write your findings to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/slash-commands-review-1.md`

---

## Assistant



Let me review the code carefully, starting by checking some referenced files for context.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts","limit":50}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutTypes.ts"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"export function (setHeading|toggleLinePrefix|toggleOrderedList|insertLink|insertCallout)","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.`

---

## Assistant

Now let me check the `deleteAndRun` pattern more carefully. The key concern is that after the first dispatch (deleting the slash command text), the positions used by the formatting functions may be stale.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts","offset":175,"limit":40}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts","offset":57,"limit":55}`

---

## Assistant

Now I have enough context. Let me analyze the key issues:

1. **`deleteAndRun` two-dispatch pattern**: The first `dispatch` deletes the slash text, then `fn(view)` reads `view.state` which is now updated (CodeMirror views are mutable, state updates synchronously after dispatch). The formatting functions operate on the cursor's current line, which after deletion is the now-empty line. This should work correctly since CM updates state synchronously.

2. **`apply` callback signature**: CodeMirror's `Completion.apply` callback signature is `(view, completion, from, to)`. The code uses `(_completion, _from, to)` — but wait, the actual signature in the code is `(view, _completion, _from, to)`. Let me look more carefully.

The `apply` in the `Completion` object: `apply: (view: EditorView, _completion: Completion, _from: number, to: number)`. But CodeMirror's `Completion.apply` signature is actually `(view: EditorView, completion: Completion, from: number, to: number)`. So the third parameter is `from`, not `_from`. The code ignores it and uses the captured `from` from the outer closure. This is actually fine — the `from` from the outer scope is the slash position, which is what we want.

Wait, actually there's a subtle issue. The `from` captured in the closure is from the `CompletionResult`, and the `to` used is from the `apply` callback parameter. The `from` is the position of the `/` character. The `to` from CM's callback is the end of the matched text at apply-time. These should be consistent — `from` is the start of the completion range and `to` is the end. But `from` is captured at source-call time while `to` comes from apply-call time. If the document changed between those two moments... though in practice this shouldn't happen since the completion menu is open and the user just selected an item.

3. **Test count hardcoded to 16**: 12 static commands + 4 callout types = 16. But the `source` callout is remapped to `source-callout`, so all 4 callouts are included. This is correct currently but fragile.

4. **`filter: false` in the CompletionResult**: This is correct since custom filtering is already done.

Let me check if there's a real bug with the `deleteAndRun` approach more carefully. After `view.dispatch({ changes: { from, to, insert: "" } })`, the cursor is left at `from`. Then functions like `setHeading` read `state.doc.lineAt(range.from)` using the current selection. The cursor after the delete dispatch will be at position `from`, which is correct — it's on the line where the `/` was. This works.

One actual concern: `deleteAndRun` does NOT set the selection explicitly. After `dispatch({ changes: { from, to, insert: "" } })`, CM maps the existing selection through the change. If the completion was triggered, CM's selection during `apply` might be at the end of the completion text (`to`). After the delete, the selection gets mapped, which should place the cursor at `from`. This seems fine.

Let me check one more thing about the `replaceWith` usage for code block.

For the code block: `replaceWith(v, from, to, "```\n\n```", 4)`. Cursor at `from + 4` = right after the first ` ``` ` and newline. That puts cursor on the blank line inside the fenced block. Correct.

For divider: `replaceWith(v, from, to, "---\n", 4)`. Cursor at `from + 4` = after `---\n`, which is the start of the next line. Correct.

For source: `replaceWith(v, from, to, '[!source ""]', '[!source "'.length)`. Cursor between the quotes. Correct.

Now for table: `t.indexOf("|          |") + 2`. The table text is `"| Column 1 | Column 2 |\n| -------- | -------- |\n|          |          |"`. `t.indexOf("|          |")` finds the first `|          |` which is at the start of line 3. So cursor goes to position 2 after that `|`, which would be inside the first empty cell. Correct.

The code looks solid overall. Let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/slash-commands-review-1.md","content":"# Code Review: Slash Commands (cmSlashCommands.ts)\n\n**Reviewer**: code-reviewer `

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/slash-commands-review-1.md`.

**Summary of findings:**

1. **should-fix**: The test hardcodes `SLASH_COMMANDS.length` to `16`. This is fragile -- it should derive the expected count from `STATIC_COMMAND_COUNT + CALLOUT_TYPE_ENTRIES.length` so it stays correct when callout types change.

2. **suggestion**: `deleteAndRun` fires two sequential dispatches (one to delete the slash text, one from the formatting helper), resulting in two undo steps. Not a bug, but a UX rough edge.

3. **suggestion**: `slashCommandSource` (the CM completion source glue function) has no direct test, though its parts (regex, filter) are well covered.

The code is otherwise solid -- correct cursor offsets in `replaceWith`, proper regex to avoid false triggers in URLs, clean separation of command definitions from CM wiring, and correct use of the `Completion.apply` callback signature.

---

