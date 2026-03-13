import { EditorView } from "@codemirror/view";
import { EditorSelection, type SelectionRange } from "@codemirror/state";
import type { KeyBinding } from "@codemirror/view";

/**
 * Wrap or unwrap the selection with a symmetric marker (**, *, ~~, `).
 * - Non-empty selection already wrapped → unwrap
 * - Non-empty selection → wrap
 * - Empty selection (cursor) → insert marker pair and place cursor between
 */
export function toggleWrap(view: EditorView, marker: string): boolean {
  const { state } = view;
  const changes: { from: number; to: number; insert: string }[] = [];
  const selections: SelectionRange[] = [];
  const mLen = marker.length;

  for (const range of state.selection.ranges) {
    if (range.empty) {
      // Insert marker pair, cursor between
      changes.push({ from: range.from, to: range.from, insert: marker + marker });
      selections.push(EditorSelection.cursor(range.from + mLen));
    } else {
      const before = state.sliceDoc(range.from - mLen, range.from);
      const after = state.sliceDoc(range.to, range.to + mLen);

      if (before === marker && after === marker) {
        // Unwrap: remove markers outside selection
        changes.push({ from: range.from - mLen, to: range.from, insert: "" });
        changes.push({ from: range.to, to: range.to + mLen, insert: "" });
        selections.push(
          EditorSelection.range(range.from - mLen, range.to - mLen)
        );
      } else {
        // Wrap
        changes.push({ from: range.from, to: range.from, insert: marker });
        changes.push({ from: range.to, to: range.to, insert: marker });
        selections.push(
          EditorSelection.range(range.from + mLen, range.to + mLen)
        );
      }
    }
  }

  view.dispatch({
    changes,
    selection: EditorSelection.create(selections),
  });
  view.focus();
  return true;
}

/**
 * Toggle a line prefix (e.g., "# ", "- ", "> ") on every line in the selection.
 * If all selected lines already have the prefix, remove it; otherwise add it.
 * Adjusts selection to account for shifted offsets.
 */
export function toggleLinePrefix(view: EditorView, prefix: string): boolean {
  const { state } = view;
  const changes: { from: number; to: number; insert: string }[] = [];
  const selections: SelectionRange[] = [];

  for (const range of state.selection.ranges) {
    const fromLine = state.doc.lineAt(range.from);
    const toLine = state.doc.lineAt(range.to);
    const lines: { from: number; text: string }[] = [];

    for (let i = fromLine.number; i <= toLine.number; i++) {
      const line = state.doc.line(i);
      lines.push({ from: line.from, text: line.text });
    }

    const allHavePrefix = lines.every((l) => l.text.startsWith(prefix));
    let shift = 0;

    for (const line of lines) {
      if (allHavePrefix) {
        changes.push({ from: line.from, to: line.from + prefix.length, insert: "" });
        shift -= prefix.length;
      } else if (!line.text.startsWith(prefix)) {
        changes.push({ from: line.from, to: line.from, insert: prefix });
        shift += prefix.length;
      }
    }

    if (range.empty) {
      const cursorLine = state.doc.lineAt(range.from);
      const offsetInLine = range.from - cursorLine.from;
      const cursorShift = allHavePrefix ? -prefix.length :
        cursorLine.text.startsWith(prefix) ? 0 : prefix.length;
      selections.push(EditorSelection.cursor(
        cursorLine.from + Math.max(0, offsetInLine + cursorShift)
      ));
    } else {
      const offsetInFirstLine = range.from - fromLine.from;
      const firstLineShift = allHavePrefix ? -prefix.length :
        fromLine.text.startsWith(prefix) ? 0 : prefix.length;
      const newFrom = fromLine.from + Math.max(0, offsetInFirstLine + firstLineShift);
      selections.push(EditorSelection.range(newFrom, Math.max(newFrom, range.to + shift)));
    }
  }

  if (changes.length > 0) {
    view.dispatch({ changes, selection: EditorSelection.create(selections) });
  }
  view.focus();
  return true;
}

/**
 * Toggle an ordered list. Recognizes any `\d+. ` prefix for removal.
 * When adding, auto-increments numbering.
 */
export function toggleOrderedList(view: EditorView): boolean {
  const { state } = view;
  const changes: { from: number; to: number; insert: string }[] = [];
  const selections: SelectionRange[] = [];
  const olRegex = /^\d+\.\s/;

  for (const range of state.selection.ranges) {
    const fromLine = state.doc.lineAt(range.from);
    const toLine = state.doc.lineAt(range.to);
    const lines: { from: number; text: string; number: number }[] = [];

    for (let i = fromLine.number; i <= toLine.number; i++) {
      const line = state.doc.line(i);
      lines.push({ from: line.from, text: line.text, number: i });
    }

    const allHaveOl = lines.every((l) => olRegex.test(l.text));
    let shift = 0;

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      const match = line.text.match(olRegex);

      if (allHaveOl && match) {
        changes.push({ from: line.from, to: line.from + match[0].length, insert: "" });
        shift -= match[0].length;
      } else if (!match) {
        const prefix = `${idx + 1}. `;
        changes.push({ from: line.from, to: line.from, insert: prefix });
        shift += prefix.length;
      }
    }

    if (range.empty) {
      const cursorLine = state.doc.lineAt(range.from);
      const offsetInLine = range.from - cursorLine.from;
      const cursorMatch = cursorLine.text.match(olRegex);
      const cursorShift = allHaveOl && cursorMatch ? -cursorMatch[0].length :
        cursorMatch ? 0 : 3;
      selections.push(EditorSelection.cursor(
        cursorLine.from + Math.max(0, offsetInLine + cursorShift)
      ));
    } else {
      const offsetInFirstLine = range.from - fromLine.from;
      const firstMatch = fromLine.text.match(olRegex);
      const firstShift = allHaveOl && firstMatch ? -firstMatch[0].length :
        firstMatch ? 0 : 3;
      const newFrom = fromLine.from + Math.max(0, offsetInFirstLine + firstShift);
      selections.push(EditorSelection.range(newFrom, Math.max(newFrom, range.to + shift)));
    }
  }

  if (changes.length > 0) {
    view.dispatch({ changes, selection: EditorSelection.create(selections) });
  }
  view.focus();
  return true;
}

/**
 * Set heading level on the current line. Replaces any existing heading prefix.
 */
export function setHeading(view: EditorView, level: number): boolean {
  const { state } = view;
  const changes: { from: number; to: number; insert: string }[] = [];
  const prefix = "#".repeat(level) + " ";

  for (const range of state.selection.ranges) {
    const line = state.doc.lineAt(range.from);
    const match = line.text.match(/^#{1,6}\s*/);

    if (match) {
      if (match[0] === prefix) {
        // Same level: remove heading
        changes.push({ from: line.from, to: line.from + match[0].length, insert: "" });
      } else {
        // Different level: replace
        changes.push({ from: line.from, to: line.from + match[0].length, insert: prefix });
      }
    } else {
      changes.push({ from: line.from, to: line.from, insert: prefix });
    }
  }

  if (changes.length > 0) {
    view.dispatch({ changes });
  }
  view.focus();
  return true;
}

/**
 * Insert a markdown link template. If text is selected, use it as link text.
 */
export function insertLink(view: EditorView): boolean {
  const { state } = view;
  const changes: { from: number; to: number; insert: string }[] = [];
  const selections: SelectionRange[] = [];

  for (const range of state.selection.ranges) {
    if (range.empty) {
      const insert = "[](url)";
      changes.push({ from: range.from, to: range.from, insert });
      // Place cursor inside [] for typing link text
      selections.push(EditorSelection.cursor(range.from + 1));
    } else {
      const text = state.sliceDoc(range.from, range.to);
      const insert = `[${text}](url)`;
      changes.push({ from: range.from, to: range.to, insert });
      // Select "url" for easy replacement
      const urlStart = range.from + text.length + 3;
      selections.push(EditorSelection.range(urlStart, urlStart + 3));
    }
  }

  view.dispatch({
    changes,
    selection: EditorSelection.create(selections),
  });
  view.focus();
  return true;
}

/**
 * Insert a callout block. If text is selected, wraps each line as callout body.
 * If cursor is mid-line, captures the rest of the line as callout body.
 */
export function insertCallout(view: EditorView, type: string): boolean {
  const { state } = view;
  const changes: { from: number; to: number; insert: string }[] = [];
  const selections: SelectionRange[] = [];

  for (const range of state.selection.ranges) {
    const line = state.doc.lineAt(range.from);
    const midLine = range.from !== line.from && line.text.length > 0;
    const nl = midLine ? "\n" : "";
    const header = `> [!${type}]`;

    if (range.empty) {
      // When mid-line, capture the rest of the line as callout body
      const trailing = midLine ? state.sliceDoc(range.from, line.to).trimStart() : "";
      const to = midLine ? line.to : range.from;
      const body = trailing ? `> ${trailing}` : "> ";
      const insert = `${nl}${header}\n${body}`;
      changes.push({ from: range.from, to, insert });
      selections.push(EditorSelection.cursor(range.from + insert.length));
    } else {
      const selectedText = state.sliceDoc(range.from, range.to);
      const body = selectedText
        .split("\n")
        .map((l) => `> ${l}`)
        .join("\n");
      const insert = `${nl}${header}\n${body}`;
      changes.push({ from: range.from, to: range.to, insert });
      selections.push(EditorSelection.cursor(range.from + insert.length));
    }
  }

  view.dispatch({ changes, selection: EditorSelection.create(selections) });
  view.focus();
  return true;
}

/**
 * Insert text at cursor position.
 */
export function insertAtCursor(view: EditorView, text: string): boolean {
  view.dispatch({
    changes: { from: view.state.selection.main.from, to: view.state.selection.main.to, insert: text },
  });
  view.focus();
  return true;
}

/**
 * CodeMirror keybindings for markdown formatting.
 */
export const formattingKeymap: KeyBinding[] = [
  { key: "Mod-b", run: (v) => toggleWrap(v, "**"), preventDefault: true },
  { key: "Mod-i", run: (v) => toggleWrap(v, "*"), preventDefault: true },
  { key: "Mod-Shift-x", run: (v) => toggleWrap(v, "~~"), preventDefault: true },
  { key: "Mod-e", run: (v) => toggleWrap(v, "`"), preventDefault: true },
  { key: "Mod-k", run: (v) => insertLink(v), preventDefault: true },
  { key: "Mod-Shift-1", run: (v) => setHeading(v, 1), preventDefault: true },
  { key: "Mod-Shift-2", run: (v) => setHeading(v, 2), preventDefault: true },
  { key: "Mod-Shift-3", run: (v) => setHeading(v, 3), preventDefault: true },
];
