import { foldService } from "@codemirror/language";
import type { Extension, Text } from "@codemirror/state";

const HEADING_RE = /^(#{1,6})\s/;
const FENCE_RE = /^(`{3,}|~{3,})/;

/**
 * Compute the fold range for a heading. Folds from end of heading line
 * to the line before the next heading at same-or-higher level (or end of doc).
 * Exported for testing.
 */
export function computeHeadingFoldRange(
  doc: Text,
  lineNumber: number,
): { from: number; to: number } | null {
  const line = doc.line(lineNumber);
  const m = line.text.match(HEADING_RE);
  if (!m) return null;

  const level = m[1].length;
  let inFence = false;
  let endLine = doc.lines;

  for (let i = lineNumber + 1; i <= doc.lines; i++) {
    const text = doc.line(i).text;

    if (FENCE_RE.test(text)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const hm = text.match(HEADING_RE);
    if (hm && hm[1].length <= level) {
      endLine = i - 1;
      break;
    }
  }

  // Nothing to fold if the heading is immediately followed by the next heading
  if (endLine <= lineNumber) return null;

  // Skip trailing blank lines
  while (endLine > lineNumber && doc.line(endLine).text.trim() === "") {
    endLine--;
  }
  if (endLine <= lineNumber) return null;

  return { from: line.to, to: doc.line(endLine).to };
}

/**
 * Fold service for markdown headings.
 * Folds content under a heading until the next heading at same-or-higher level.
 */
export function headingFoldService(): Extension {
  return foldService.of((state, lineStart) => {
    const line = state.doc.lineAt(lineStart);
    return computeHeadingFoldRange(state.doc, line.number);
  });
}
