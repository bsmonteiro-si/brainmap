import type { ReactNode } from "react";
import { createElement } from "react";

/**
 * Greedy left-to-right fuzzy match. Returns matched character indices in
 * `text` or null if `query` cannot be matched.
 */
export function fuzzyMatch(query: string, text: string): number[] | null {
  if (query.length === 0) return [];
  if (query.length > text.length) return null;

  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();
  const indices: number[] = [];
  let qi = 0;

  for (let ti = 0; ti < lowerText.length && qi < lowerQuery.length; ti++) {
    if (lowerText[ti] === lowerQuery[qi]) {
      indices.push(ti);
      qi++;
    }
  }

  return qi === lowerQuery.length ? indices : null;
}

/**
 * Splits `text` into alternating plain spans and highlighted marks based on
 * matched character indices from `fuzzyMatch`.
 */
export function highlightFuzzyMatch(
  text: string,
  indices: number[],
): ReactNode[] {
  if (indices.length === 0) {
    return [createElement("span", { key: "t" }, text)];
  }

  const result: ReactNode[] = [];
  let last = 0;

  for (let i = 0; i < indices.length; i++) {
    const idx = indices[i];
    // Plain text before this match
    if (idx > last) {
      result.push(createElement("span", { key: `p${last}` }, text.slice(last, idx)));
    }
    // Collect consecutive matched indices into one <mark>
    let end = idx;
    while (i + 1 < indices.length && indices[i + 1] === end + 1) {
      end++;
      i++;
    }
    result.push(
      createElement(
        "mark",
        { key: `m${idx}`, className: "tree-match-highlight" },
        text.slice(idx, end + 1),
      ),
    );
    last = end + 1;
  }

  // Trailing plain text
  if (last < text.length) {
    result.push(createElement("span", { key: `p${last}` }, text.slice(last)));
  }

  return result;
}
