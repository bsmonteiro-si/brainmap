/**
 * CodeMirror 6 extension that styles ordered list markers (`1.`, `a.`, `iii.`)
 * with accent coloring.
 *
 * Regex restricts alpha to single chars and roman to max 4 chars to avoid
 * false positives on prose (e.g. `e.g.`, `etc.`).
 */
import {
  EditorView,
  Decoration,
  WidgetType,
  type DecorationSet,
} from "@codemirror/view";
import { RangeSetBuilder, StateField, type Text, type Extension } from "@codemirror/state";
import { scanFencedBlocks } from "./cmMarkdownDecorations";

/**
 * Matches ordered list markers:
 * - Digits: 1. 2. 10. 999.
 * - Single alpha: a. b. z.
 * - Valid roman numerals up to 39 (xxxix): i. ii. iv. ix. xi. xxxix.
 *   Pattern avoids false positives on common words like dim. mix. vim. mid.
 */
const ROMAN_PAT = "(?:x{1,3}(?:ix|iv|v?i{0,3})?|ix|iv|v(?:i{1,3})?|i{1,3})";
const ORDERED_RE = new RegExp(`^(\\s*)(\\d+|[a-z]|${ROMAN_PAT})\\. `);

class OrderedMarkerWidget extends WidgetType {
  constructor(readonly text: string) { super(); }

  eq(other: OrderedMarkerWidget): boolean {
    return this.text === other.text;
  }

  toDOM(): HTMLElement {
    const span = document.createElement("span");
    span.textContent = this.text;
    span.className = "cm-ordered-marker-widget";
    span.setAttribute("aria-hidden", "true");
    return span;
  }

  ignoreEvent(): boolean {
    return false;
  }
}

const widgetCache = new Map<string, OrderedMarkerWidget>();
function getWidget(text: string): OrderedMarkerWidget {
  let w = widgetCache.get(text);
  if (!w) { w = new OrderedMarkerWidget(text); widgetCache.set(text, w); }
  return w;
}

export interface OrderedMatch {
  lineNumber: number;
  /** Offset of the first character of the marker (e.g. `1` in `1. `) */
  markerFrom: number;
  /** Offset after the `.` (before the space) */
  markerTo: number;
  /** The marker text including the dot, e.g. "1." */
  markerText: string;
}

export function scanOrderedMarkers(doc: Text): OrderedMatch[] {
  const fenced = new Set<number>();
  for (const b of scanFencedBlocks(doc)) {
    for (let ln = b.startLine; ln <= b.endLine; ln++) fenced.add(ln);
  }
  const results: OrderedMatch[] = [];
  for (let i = 1; i <= doc.lines; i++) {
    if (fenced.has(i)) continue;
    const line = doc.line(i);
    const m = line.text.match(ORDERED_RE);
    if (m) {
      const indent = m[1].length;
      const marker = m[2];
      results.push({
        lineNumber: i,
        markerFrom: line.from + indent,
        markerTo: line.from + indent + marker.length + 1, // marker + "."
        markerText: marker + ".",
      });
    }
  }
  return results;
}

export function buildOrderedDecorations(doc: Text): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  for (const m of scanOrderedMarkers(doc)) {
    builder.add(
      m.markerFrom,
      m.markerTo,
      Decoration.replace({ widget: getWidget(m.markerText) }),
    );
  }
  return builder.finish();
}

export function orderedListDecorations(): Extension {
  return StateField.define<DecorationSet>({
    create(state) {
      return buildOrderedDecorations(state.doc);
    },
    update(value, tr) {
      if (!tr.docChanged) return value;
      return buildOrderedDecorations(tr.state.doc);
    },
    provide: (f) => EditorView.decorations.from(f),
  });
}
