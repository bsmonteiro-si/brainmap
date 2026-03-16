/**
 * CodeMirror 6 extension that replaces unordered list markers (`-`, `*`, `+`)
 * with a small bullet character `•`. Cursor-aware: shows raw marker when the
 * cursor is on the same line.
 */
import {
  EditorView,
  Decoration,
  WidgetType,
  type DecorationSet,
} from "@codemirror/view";
import { RangeSetBuilder, StateField, type Text, type Extension } from "@codemirror/state";

const BULLET_RE = /^(\s*)([-*+]) /;

class BulletWidget extends WidgetType {
  eq(): boolean {
    return true;
  }

  toDOM(): HTMLElement {
    const span = document.createElement("span");
    span.textContent = "•";
    span.className = "cm-bullet-widget";
    span.setAttribute("aria-hidden", "true");
    return span;
  }

  ignoreEvent(): boolean {
    return false;
  }
}

const bulletWidget = new BulletWidget();

interface BulletMatch {
  lineNumber: number;
  /** Offset of the marker character (e.g. `-`) */
  markerFrom: number;
  /** Offset after the marker (before the space) */
  markerTo: number;
}

function scanBullets(doc: Text): BulletMatch[] {
  const results: BulletMatch[] = [];
  for (let i = 1; i <= doc.lines; i++) {
    const line = doc.line(i);
    const m = line.text.match(BULLET_RE);
    if (m) {
      const indent = m[1].length;
      results.push({
        lineNumber: i,
        markerFrom: line.from + indent,
        markerTo: line.from + indent + 1, // just the `-`/`*`/`+` char
      });
    }
  }
  return results;
}

function buildDecorations(doc: Text, cursorLine: number): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  for (const m of scanBullets(doc)) {
    if (m.lineNumber === cursorLine) continue;
    builder.add(
      m.markerFrom,
      m.markerTo,
      Decoration.replace({ widget: bulletWidget }),
    );
  }
  return builder.finish();
}

const bulletField = StateField.define<{ cursorLine: number; decos: DecorationSet }>({
  create(state) {
    const cursorLine = state.doc.lineAt(state.selection.main.head).number;
    return { cursorLine, decos: buildDecorations(state.doc, cursorLine) };
  },
  update(value, tr) {
    const cursorLine = tr.state.doc.lineAt(tr.state.selection.main.head).number;
    if (!tr.docChanged && cursorLine === value.cursorLine) return value;
    return { cursorLine, decos: buildDecorations(tr.state.doc, cursorLine) };
  },
  provide: (f) => EditorView.decorations.from(f, (v) => v.decos),
});

export function bulletDecorations(): Extension {
  return bulletField;
}
