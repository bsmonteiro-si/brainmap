/**
 * CodeMirror 6 extension that adds extra vertical spacing to list item lines.
 *
 * Detects lines starting with `- `, `* `, `+ `, or `N. ` (with optional
 * leading whitespace for nested lists) and applies a `cm-list-line` CSS class
 * via line decorations.  The actual spacing is defined in App.css.
 */
import {
  EditorView,
  ViewPlugin,
  ViewUpdate,
  Decoration,
  type DecorationSet,
} from "@codemirror/view";
import { RangeSetBuilder, type Extension } from "@codemirror/state";

const LIST_LINE_RE = /^\s*(?:[-*+]|\d+[.)]) /;

const listLineDeco = Decoration.line({ class: "cm-list-line" });

function buildDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  for (const { from, to } of view.visibleRanges) {
    for (let pos = from; pos <= to; ) {
      const line = view.state.doc.lineAt(pos);
      if (LIST_LINE_RE.test(line.text)) {
        builder.add(line.from, line.from, listLineDeco);
      }
      pos = line.to + 1;
    }
  }
  return builder.finish();
}

class ListSpacingPlugin {
  decorations: DecorationSet;
  constructor(view: EditorView) {
    this.decorations = buildDecorations(view);
  }
  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = buildDecorations(update.view);
    }
  }
}

const listSpacingViewPlugin = ViewPlugin.fromClass(ListSpacingPlugin, {
  decorations: (v) => v.decorations,
});

export function listSpacing(): Extension {
  return listSpacingViewPlugin;
}
