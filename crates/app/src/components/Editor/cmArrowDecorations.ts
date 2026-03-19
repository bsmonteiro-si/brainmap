/**
 * CodeMirror 6 extension that replaces ASCII arrow sequences with Unicode
 * arrow characters. Cursor-aware: shows raw text when editing that line.
 *
 *   <-> → ↔   (bidirectional, matched first)
 *   ->  → →   (right arrow)
 *   <-  → ←   (left arrow)
 *   =>  → ⇒   (double right arrow)
 *   <=  → ⇐   (double left arrow — only when not followed by >)
 *   <=> → ⇔   (double bidirectional)
 */
import {
  EditorView,
  Decoration,
  WidgetType,
  type DecorationSet,
} from "@codemirror/view";
import { RangeSetBuilder, StateField, type Text, type Extension } from "@codemirror/state";

class ArrowWidget extends WidgetType {
  constructor(readonly char: string) { super(); }

  eq(other: ArrowWidget): boolean {
    return this.char === other.char;
  }

  toDOM(): HTMLElement {
    const span = document.createElement("span");
    span.textContent = this.char;
    span.className = "cm-arrow-widget";
    span.setAttribute("aria-hidden", "true");
    return span;
  }

  ignoreEvent(): boolean {
    return false;
  }
}

const widgetCache = new Map<string, ArrowWidget>();
function getWidget(char: string): ArrowWidget {
  let w = widgetCache.get(char);
  if (!w) { w = new ArrowWidget(char); widgetCache.set(char, w); }
  return w;
}

interface ArrowMatch {
  lineNumber: number;
  from: number;
  to: number;
  char: string;
}

const ARROW_PATTERNS: [RegExp, string][] = [
  [/<=>/g, "⇔"],
  [/<->/g, "↔"],
  [/=>/g,  "⇒"],
  [/->/g,  "→"],
  [/<-/g,  "←"],
  // <= is intentionally omitted — too ambiguous with "less than or equal"
];

export function scanArrows(doc: Text): ArrowMatch[] {
  const results: ArrowMatch[] = [];
  for (let i = 1; i <= doc.lines; i++) {
    const line = doc.line(i);
    const text = line.text;
    // Track which character positions have already been matched to avoid overlaps
    const matched = new Set<number>();

    for (const [re, char] of ARROW_PATTERNS) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        const start = m.index;
        const end = start + m[0].length;
        // Skip if any position in this match is already claimed
        let overlap = false;
        for (let p = start; p < end; p++) {
          if (matched.has(p)) { overlap = true; break; }
        }
        if (overlap) continue;
        // Mark positions as claimed
        for (let p = start; p < end; p++) matched.add(p);
        results.push({
          lineNumber: i,
          from: line.from + start,
          to: line.from + end,
          char,
        });
      }
    }
  }
  // Sort by document position for RangeSetBuilder
  results.sort((a, b) => a.from - b.from);
  return results;
}

export function buildArrowDecorations(doc: Text, cursorLine: number): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  for (const m of scanArrows(doc)) {
    if (m.lineNumber === cursorLine) continue;
    builder.add(
      m.from,
      m.to,
      Decoration.replace({ widget: getWidget(m.char) }),
    );
  }
  return builder.finish();
}

export function arrowDecorations(): Extension {
  return StateField.define<{ cursorLine: number; decos: DecorationSet }>({
    create(state) {
      const cursorLine = state.doc.lineAt(state.selection.main.head).number;
      return { cursorLine, decos: buildArrowDecorations(state.doc, cursorLine) };
    },
    update(value, tr) {
      const cursorLine = tr.state.doc.lineAt(tr.state.selection.main.head).number;
      if (!tr.docChanged && cursorLine === value.cursorLine) return value;
      return { cursorLine, decos: buildArrowDecorations(tr.state.doc, cursorLine) };
    },
    provide: (f) => EditorView.decorations.from(f, (v) => v.decos),
  });
}
