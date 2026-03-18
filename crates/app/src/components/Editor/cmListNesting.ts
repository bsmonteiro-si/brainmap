import { EditorView } from "@codemirror/view";
import { EditorSelection, type SelectionRange } from "@codemirror/state";
import type { KeyBinding } from "@codemirror/view";

/**
 * IntelliJ-style ordered list nesting:
 *   Tab on `1. item` → indents and changes to `  a. item`
 *   Tab again → indents and changes to `    i. item`
 *   Tab again → indents and changes to `      1. item` (cycle restarts)
 *   Shift+Tab reverses (outdents and changes marker back)
 *
 * Marker kind is determined by nesting depth: numeric (depth 0) → alpha (1) → roman (2) → ...
 */

// Match: digits, or lowercase letters (single = alpha, multi = roman)
const ORDERED_RE = /^(\s*)(\d+|[a-z]+)\.\s/;
const INDENT = "    ";

type MarkerKind = "numeric" | "alpha" | "roman";

const DEPTH_CYCLE: MarkerKind[] = ["numeric", "alpha", "roman"];

export function toRoman(n: number): string {
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ["m", "cm", "d", "cd", "c", "xc", "l", "xl", "x", "ix", "v", "iv", "i"];
  let result = "";
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) {
      result += syms[i];
      n -= vals[i];
    }
  }
  return result;
}

export function fromRoman(s: string): number {
  const map: Record<string, number> = { i: 1, v: 5, x: 10, l: 50, c: 100, d: 500, m: 1000 };
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const curr = map[s[i]] ?? 0;
    const next = map[s[i + 1]] ?? 0;
    total += curr < next ? -curr : curr;
  }
  return total;
}

export function markerForKind(kind: MarkerKind, index: number): string {
  switch (kind) {
    case "numeric":
      return `${index}`;
    case "alpha":
      return String.fromCharCode(96 + Math.max(1, Math.min(index, 26)));
    case "roman":
      return toRoman(Math.max(1, index));
  }
}

/**
 * Parse the numeric index from a marker, using the expected kind to resolve ambiguity.
 * E.g., "i" at depth 2 (roman) → 1, "i" at depth 1 (alpha) → 9.
 */
export function parseIndex(marker: string, expectedKind: MarkerKind): number {
  if (/^\d+$/.test(marker)) return parseInt(marker, 10);
  if (expectedKind === "roman") return fromRoman(marker);
  // alpha: single letter
  return marker.charCodeAt(0) - 96;
}

export function kindForDepth(depth: number): MarkerKind {
  return DEPTH_CYCLE[depth % DEPTH_CYCLE.length];
}

/**
 * Scan upward from `lineNumber` to find the last ordered list item at `targetDepth`.
 * Returns its parsed index, or 0 if none found (so the new marker becomes 1).
 */
export function findPreviousSiblingIndex(
  doc: { line(n: number): { text: string }; lines: number },
  lineNumber: number,
  targetDepth: number,
): number {
  const targetIndent = INDENT.repeat(targetDepth);
  const targetKind = kindForDepth(targetDepth);

  for (let i = lineNumber - 1; i >= 1; i--) {
    const text = doc.line(i).text;
    const m = text.match(ORDERED_RE);
    if (!m) continue;

    const depth = Math.floor(m[1].length / INDENT.length);
    if (depth === targetDepth) {
      return parseIndex(m[2], targetKind);
    }
    // If we hit a shallower depth, stop — no more siblings above
    if (depth < targetDepth) break;
  }
  return 0;
}

function tabOnOrderedList(view: EditorView, direction: 1 | -1): boolean {
  const { state } = view;
  const changes: { from: number; to: number; insert: string }[] = [];
  const selections: SelectionRange[] = [];
  let handled = false;

  for (const range of state.selection.ranges) {
    const line = state.doc.lineAt(range.from);
    // Only act on single-line cursors/selections
    if (state.doc.lineAt(range.to).number !== line.number) {
      selections.push(range);
      continue;
    }

    const match = line.text.match(ORDERED_RE);
    if (!match) {
      selections.push(range);
      continue;
    }

    const currentIndent = match[1];
    const currentDepth = Math.floor(currentIndent.length / INDENT.length);

    // Don't outdent past depth 0
    if (direction === -1 && currentDepth === 0) {
      selections.push(range);
      continue;
    }

    handled = true;

    const newDepth = currentDepth + direction;
    const newKind = kindForDepth(newDepth);

    let newIndex: number;
    if (direction === 1) {
      // Indenting: always start fresh at 1
      newIndex = 1;
    } else {
      // Outdenting: continue numbering from previous sibling at target depth
      const prevIndex = findPreviousSiblingIndex(state.doc, line.number, newDepth);
      newIndex = prevIndex + 1;
    }

    const newMarker = markerForKind(newKind, newIndex);
    const newIndent = INDENT.repeat(newDepth);
    const oldPrefix = match[0];
    const newPrefix = `${newIndent}${newMarker}. `;

    changes.push({ from: line.from, to: line.from + oldPrefix.length, insert: newPrefix });

    const shift = newPrefix.length - oldPrefix.length;
    if (range.empty) {
      selections.push(EditorSelection.cursor(Math.max(line.from + newPrefix.length, range.from + shift)));
    } else {
      selections.push(EditorSelection.range(
        Math.max(line.from + newPrefix.length, range.from + shift),
        Math.max(line.from + newPrefix.length, range.to + shift),
      ));
    }
  }

  if (!handled) return false;

  view.dispatch({
    changes,
    selection: EditorSelection.create(selections),
  });
  return true;
}

export const listNestingKeymap: KeyBinding[] = [
  { key: "Tab", run: (view) => tabOnOrderedList(view, 1) },
  { key: "Shift-Tab", run: (view) => tabOnOrderedList(view, -1) },
];
