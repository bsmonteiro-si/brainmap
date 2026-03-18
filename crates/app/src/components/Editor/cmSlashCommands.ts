import {
  autocompletion,
  type CompletionContext,
  type CompletionResult,
  type Completion,
} from "@codemirror/autocomplete";
import { EditorSelection } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import { CALLOUT_TYPES, CALLOUT_TYPE_ENTRIES } from "./calloutTypes";
import {
  setHeading,
  toggleLinePrefix,
  toggleOrderedList,
  insertLink,
  insertCallout,
} from "./cmFormatting";
import { noteCompletionSource } from "./cmNoteAutocomplete";

// ---------------------------------------------------------------------------
// SVG icon helpers (same pattern as cmCalloutDecorations.ts)
// ---------------------------------------------------------------------------
type SvgElement = [string, Record<string, string>];

const ICON_PATHS: Record<string, SvgElement[]> = {
  heading: [
    ["path", { d: "M6 12h12" }],
    ["path", { d: "M6 4v16" }],
    ["path", { d: "M18 4v16" }],
  ],
  list: [
    ["line", { x1: "8", x2: "21", y1: "6", y2: "6" }],
    ["line", { x1: "8", x2: "21", y1: "12", y2: "12" }],
    ["line", { x1: "8", x2: "21", y1: "18", y2: "18" }],
    ["line", { x1: "3", x2: "3.01", y1: "6", y2: "6" }],
    ["line", { x1: "3", x2: "3.01", y1: "12", y2: "12" }],
    ["line", { x1: "3", x2: "3.01", y1: "18", y2: "18" }],
  ],
  "list-ordered": [
    ["line", { x1: "10", x2: "21", y1: "6", y2: "6" }],
    ["line", { x1: "10", x2: "21", y1: "12", y2: "12" }],
    ["line", { x1: "10", x2: "21", y1: "18", y2: "18" }],
    ["path", { d: "M4 6h1v4" }],
    ["path", { d: "M4 10h2" }],
    ["path", { d: "M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" }],
  ],
  "check-square": [
    ["polyline", { points: "9 11 12 14 22 4" }],
    ["path", { d: "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" }],
  ],
  quote: [
    ["path", { d: "M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21" }],
    ["path", { d: "M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3" }],
  ],
  code: [
    ["polyline", { points: "16 18 22 12 16 6" }],
    ["polyline", { points: "8 6 2 12 8 18" }],
  ],
  minus: [
    ["path", { d: "M5 12h14" }],
  ],
  table: [
    ["path", { d: "M12 3v18" }],
    ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }],
    ["path", { d: "M3 9h18" }],
    ["path", { d: "M3 15h18" }],
  ],
  link: [
    ["path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }],
    ["path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" }],
  ],
  // Callout icons (from cmCalloutDecorations.ts)
  bot: [
    ["path", { d: "M12 8V4H8" }],
    ["rect", { width: "16", height: "12", x: "4", y: "8", rx: "2" }],
    ["path", { d: "M2 14h2" }],
    ["path", { d: "M20 14h2" }],
    ["path", { d: "M15 13v2" }],
    ["path", { d: "M9 13v2" }],
  ],
  "book-open": [
    ["path", { d: "M12 7v14" }],
    ["path", { d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" }],
  ],
  "help-circle": [
    ["circle", { cx: "12", cy: "12", r: "10" }],
    ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" }],
    ["path", { d: "M12 17h.01" }],
  ],
  lightbulb: [
    ["path", { d: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" }],
    ["path", { d: "M9 18h6" }],
    ["path", { d: "M10 22h4" }],
  ],
  "flask-conical": [
    ["path", { d: "M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2" }],
    ["path", { d: "M6.453 15h11.094" }],
    ["path", { d: "M8.5 2h7" }],
  ],
};

function renderSvgElement(el: SvgElement): string {
  const [tag, attrs] = el;
  const attrStr = Object.entries(attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");
  return `<${tag} ${attrStr}/>`;
}

function buildSvgDataUri(paths: SvgElement[], strokeColor: string): string {
  const children = paths.map(renderSvgElement).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${children}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const iconUriCache = new Map<string, string>();

function getIconUri(icon: string, color: string): string {
  const key = `${icon}|${color}`;
  if (iconUriCache.has(key)) return iconUriCache.get(key)!;
  const paths = ICON_PATHS[icon];
  if (!paths) return "";
  const uri = buildSvgDataUri(paths, color);
  iconUriCache.set(key, uri);
  return uri;
}

// Callout type → icon name mapping
const CALLOUT_ICON_MAP: Record<string, string> = {
  "ai-answer": "bot",
  source: "book-open",
  question: "help-circle",
  "key-insight": "lightbulb",
  example: "flask-conical",
};

/** Callout types that also have an inline `/keyword` command in the BrainMap section. */
const INLINE_COMMAND_TYPES = new Set(["source", "example"]);

// ---------------------------------------------------------------------------
// Slash command definitions
// ---------------------------------------------------------------------------

export interface SlashCommandDef {
  keyword: string;
  label: string;
  detail: string;
  section: string;
  icon: string;
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

/** All slash commands. Exported for testing. */
export const SLASH_COMMANDS: SlashCommandDef[] = [
  // ── Headings ──
  {
    keyword: "h1",
    label: "Heading 1",
    detail: "Large heading",
    section: "Headings",
    icon: "heading",
    apply: (v, from, to) => deleteAndRun(v, from, to, (v) => setHeading(v, 1)),
  },
  {
    keyword: "h2",
    label: "Heading 2",
    detail: "Medium heading",
    section: "Headings",
    icon: "heading",
    apply: (v, from, to) => deleteAndRun(v, from, to, (v) => setHeading(v, 2)),
  },
  {
    keyword: "h3",
    label: "Heading 3",
    detail: "Small heading",
    section: "Headings",
    icon: "heading",
    apply: (v, from, to) => deleteAndRun(v, from, to, (v) => setHeading(v, 3)),
  },

  // ── Lists ──
  {
    keyword: "bullet",
    label: "Bullet List",
    detail: "Unordered list item",
    section: "Lists",
    icon: "list",
    apply: (v, from, to) =>
      deleteAndRun(v, from, to, (v) => toggleLinePrefix(v, "- ")),
  },
  {
    keyword: "numbered",
    label: "Numbered List",
    detail: "Ordered list item",
    section: "Lists",
    icon: "list-ordered",
    apply: (v, from, to) => deleteAndRun(v, from, to, toggleOrderedList),
  },
  {
    keyword: "task",
    label: "Task List",
    detail: "Checkbox item",
    section: "Lists",
    icon: "check-square",
    apply: (v, from, to) =>
      deleteAndRun(v, from, to, (v) => toggleLinePrefix(v, "- [ ] ")),
  },

  // ── Blocks ──
  {
    keyword: "quote",
    label: "Blockquote",
    detail: "Quoted text",
    section: "Blocks",
    icon: "quote",
    apply: (v, from, to) =>
      deleteAndRun(v, from, to, (v) => toggleLinePrefix(v, "> ")),
  },
  {
    keyword: "code",
    label: "Code Block",
    detail: "Fenced code block",
    section: "Blocks",
    icon: "code",
    apply: (v, from, to) => replaceWith(v, from, to, "```\n\n```", 4),
  },
  {
    keyword: "hr",
    label: "Divider",
    detail: "Horizontal rule",
    section: "Blocks",
    icon: "minus",
    apply: (v, from, to) => replaceWith(v, from, to, "---\n", 4),
  },
  {
    keyword: "table",
    label: "Table",
    detail: "2×2 markdown table",
    section: "Blocks",
    icon: "table",
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
    icon: "link",
    apply: (v, from, to) => deleteAndRun(v, from, to, insertLink),
  },

  // ── BrainMap ──
  {
    keyword: "source",
    label: "Inline Source",
    detail: "Citation reference",
    section: "BrainMap",
    icon: "book-open",
    apply: (v, from, to) =>
      replaceWith(v, from, to, '[!source ""]', '[!source "'.length),
  },
  {
    keyword: "example",
    label: "Inline Example",
    detail: "Example reference",
    section: "BrainMap",
    icon: "flask-conical",
    apply: (v, from, to) =>
      replaceWith(v, from, to, '[!example ""]', '[!example "'.length),
  },

  // ── Callouts (generated from calloutTypes.ts) ──
  ...CALLOUT_TYPE_ENTRIES.map(([type, def]) => ({
    keyword: INLINE_COMMAND_TYPES.has(type) ? `${type}-callout` : type,
    label: `${def.label} Callout`,
    detail: `${def.label} callout block`,
    section: "Callouts",
    icon: CALLOUT_ICON_MAP[type] ?? "help-circle",
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

const ICON_COLOR = "#8e8e93";

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
    type: "slash-command",
    section: cmd.section,
    apply: (view: EditorView, _completion: Completion, _from: number, to: number) => {
      cmd.apply(view, from, to);
    },
    // Attach extra data for addToOptions renderers
    _icon: cmd.icon,
    _keyword: cmd.keyword,
    _calloutType: cmd.section === "Callouts" ? cmd.keyword : undefined,
  } as Completion & { _icon: string; _keyword: string; _calloutType?: string }));

  return { from, options, filter: false };
}

/**
 * Creates the autocompletion extension with slash commands + note autocomplete,
 * custom icons, and /keyword badges.
 */
export function createSlashAutocompletion() {
  return autocompletion({
    override: [noteCompletionSource, slashCommandSource],
    activateOnTyping: true,
    icons: false,
    optionClass: (completion: Completion) =>
      completion.type === "slash-command" ? "slash-command-item" : "",
    addToOptions: [
      {
        // Icon element
        render: (completion: Completion) => {
          if (completion.type !== "slash-command") return null;
          const ext = completion as Completion & { _icon?: string; _calloutType?: string };
          const icon = document.createElement("span");
          icon.className = "slash-icon";

          // Use callout color for callout items, muted gray for others
          let color = ICON_COLOR;
          if (ext._calloutType) {
            const calloutKey = ext._calloutType.replace(/-callout$/, "");
            const calloutDef = CALLOUT_TYPES[calloutKey];
            if (calloutDef) color = calloutDef.color;
          }

          const uri = ext._icon ? getIconUri(ext._icon, color) : "";
          if (uri) {
            icon.style.backgroundImage = `url("${uri}")`;
          }
          if (ext._calloutType) {
            const calloutKey = ext._calloutType.replace(/-callout$/, "");
            const calloutDef = CALLOUT_TYPES[calloutKey];
            if (calloutDef) {
              icon.style.setProperty("--slash-icon-bg", `${calloutDef.color}20`);
            }
          }
          return icon;
        },
        position: 20,
      },
      {
        // /keyword badge
        render: (completion: Completion) => {
          if (completion.type !== "slash-command") return null;
          const ext = completion as Completion & { _keyword?: string };
          const badge = document.createElement("span");
          badge.className = "slash-keyword";
          badge.textContent = `/${ext._keyword ?? ""}`;
          return badge;
        },
        position: 70,
      },
    ],
  });
}
