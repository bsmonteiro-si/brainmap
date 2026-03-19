/**
 * CodeMirror 6 extension that replaces unordered list markers (`-`, `*`, `+`)
 * with depth-aware bullet characters. Cursor-aware: shows raw marker when the
 * cursor is on the same line. Bullet shape is configurable via BulletStyle.
 */
import {
  EditorView,
  Decoration,
  WidgetType,
  type DecorationSet,
} from "@codemirror/view";
import { RangeSetBuilder, StateField, type Text, type Extension } from "@codemirror/state";
import { BULLET_PRESETS, type BulletStyle } from "../../stores/uiStore";

const BULLET_RE = /^(\s*)([-*+]) /;

/** Hardcoded to match cmListNesting.ts INDENT = "    " (4 spaces). */
const INDENT_SIZE = 4;

class BulletWidget extends WidgetType {
  constructor(readonly char: string) { super(); }

  eq(other: BulletWidget): boolean {
    return this.char === other.char;
  }

  toDOM(): HTMLElement {
    const span = document.createElement("span");
    span.textContent = this.char;
    span.className = "cm-bullet-widget";
    span.setAttribute("aria-hidden", "true");
    return span;
  }

  ignoreEvent(): boolean {
    return false;
  }
}

const widgetCache = new Map<string, BulletWidget>();
function getWidget(char: string): BulletWidget {
  let w = widgetCache.get(char);
  if (!w) { w = new BulletWidget(char); widgetCache.set(char, w); }
  return w;
}

export interface BulletMatch {
  lineNumber: number;
  /** Offset of the marker character (e.g. `-`) */
  markerFrom: number;
  /** Offset after the marker (before the space) */
  markerTo: number;
  /** Nesting depth (0-based) */
  depth: number;
}

export function scanBullets(doc: Text): BulletMatch[] {
  const results: BulletMatch[] = [];
  for (let i = 1; i <= doc.lines; i++) {
    const line = doc.line(i);
    const m = line.text.match(BULLET_RE);
    if (m) {
      const indent = m[1].length;
      results.push({
        lineNumber: i,
        markerFrom: line.from + indent,
        markerTo: line.from + indent + 1,
        depth: Math.floor(indent / INDENT_SIZE),
      });
    }
  }
  return results;
}

export function buildBulletDecorations(doc: Text, cursorLine: number, preset: [string, string, string]): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  for (const m of scanBullets(doc)) {
    if (m.lineNumber === cursorLine) continue;
    const char = preset[m.depth % 3];
    builder.add(
      m.markerFrom,
      m.markerTo,
      Decoration.replace({ widget: getWidget(char) }),
    );
  }
  return builder.finish();
}

export function bulletDecorations(style: BulletStyle): Extension {
  const preset = BULLET_PRESETS[style];

  return StateField.define<{ cursorLine: number; decos: DecorationSet }>({
    create(state) {
      const cursorLine = state.doc.lineAt(state.selection.main.head).number;
      return { cursorLine, decos: buildBulletDecorations(state.doc, cursorLine, preset) };
    },
    update(value, tr) {
      const cursorLine = tr.state.doc.lineAt(tr.state.selection.main.head).number;
      if (!tr.docChanged && cursorLine === value.cursorLine) return value;
      return { cursorLine, decos: buildBulletDecorations(tr.state.doc, cursorLine, preset) };
    },
    provide: (f) => EditorView.decorations.from(f, (v) => v.decos),
  });
}
