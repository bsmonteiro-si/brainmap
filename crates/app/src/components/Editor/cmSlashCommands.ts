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

/**
 * Helper: delete the /command text, then call a formatting helper that
 * operates on the current line (e.g. setHeading, toggleLinePrefix).
 */
function deleteAndRun(
  view: EditorView,
  from: number,
  to: number,
  fn: (v: EditorView) => boolean,
) {
  view.dispatch({ changes: { from, to, insert: "" } });
  fn(view);
}

/**
 * Helper: replace the /command text with inserted text and place cursor.
 */
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

/** All slash commands. Exported for testing. */
export const SLASH_COMMANDS: SlashCommandDef[] = [
  // ── Headings ──
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

  // ── Lists ──
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

  // ── Blocks ──
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

  // ── BrainMap ──
  {
    keyword: "source",
    label: "Inline Source",
    detail: "Citation reference",
    section: "BrainMap",
    apply: (v, from, to) =>
      replaceWith(v, from, to, '[!source ""]', '[!source "'.length),
  },

  // ── Callouts (generated from calloutTypes.ts) ──
  ...CALLOUT_TYPE_ENTRIES.map(([type, def]) => ({
    keyword: type === "source" ? "source-callout" : type,
    label: `${def.label} Callout`,
    detail: `${def.label} callout block`,
    section: "Callouts",
    apply: (v: EditorView, from: number, to: number) =>
      deleteAndRun(v, from, to, (v) => insertCallout(v, type)),
  })),
];

/**
 * Filter slash commands by query string. Matches against keyword and label.
 * Exported for testing.
 */
export function filterSlashCommands(query: string): SlashCommandDef[] {
  if (!query) return SLASH_COMMANDS;
  const q = query.toLowerCase();
  return SLASH_COMMANDS.filter(
    (cmd) =>
      cmd.keyword.includes(q) || cmd.label.toLowerCase().includes(q),
  );
}

/** Regex: `/` at start of line or after whitespace, followed by optional keyword chars. */
const SLASH_TRIGGER = /(?:^|\s)\/[\w-]*$/;

/**
 * CompletionSource that triggers on `/` typed at line start or after whitespace.
 * Shows all available slash commands, filtered by the text after `/`.
 */
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
