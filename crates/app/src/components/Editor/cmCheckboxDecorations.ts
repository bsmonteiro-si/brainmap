/**
 * CodeMirror 6 extension that replaces task list checkboxes with interactive
 * `<input type="checkbox">` widgets. Cursor-aware: shows raw `[ ]`/`[x]`
 * syntax when the cursor is on the same line.
 *
 * Checkbox toggle is a normal document edit — marks dirty, triggers auto-save,
 * and is CM-undoable via history().
 */
import {
  EditorView,
  Decoration,
  WidgetType,
  type DecorationSet,
} from "@codemirror/view";
import { RangeSetBuilder, StateField, type Text, type Extension } from "@codemirror/state";

// ---------------------------------------------------------------------------
// Regex
// ---------------------------------------------------------------------------
const CHECKBOX_RE = /^(\s*(?:[-*+]|\d+[.)]) )\[([ xX]?)\]/;

// ---------------------------------------------------------------------------
// Scanner (exported for testing)
// ---------------------------------------------------------------------------
export interface CheckboxMatch {
  lineNumber: number;
  /** Character offset of the list marker (e.g. `-`) — start of the replaced range */
  markerFrom: number;
  /** Character offset of `[` in the document */
  bracketFrom: number;
  /** Character offset after `]` in the document */
  bracketTo: number;
  /** Whether the checkbox is checked */
  checked: boolean;
}

export function scanCheckboxes(doc: Text): CheckboxMatch[] {
  const results: CheckboxMatch[] = [];
  for (let i = 1; i <= doc.lines; i++) {
    const line = doc.line(i);
    const match = line.text.match(CHECKBOX_RE);
    if (match) {
      const indent = match[1].length - match[1].trimStart().length;
      const markerFrom = line.from + indent;
      const prefix = match[1];
      const bracketFrom = line.from + prefix.length;
      const bracketLen = match[2].length === 0 ? 2 : 3; // `[]` is 2, `[x]`/`[ ]` is 3
      const bracketTo = bracketFrom + bracketLen;
      results.push({
        lineNumber: i,
        markerFrom,
        bracketFrom,
        bracketTo,
        checked: match[2] === "x" || match[2] === "X",
      });
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Widget
// ---------------------------------------------------------------------------
class CheckboxWidget extends WidgetType {
  constructor(readonly checked: boolean) {
    super();
  }

  eq(other: CheckboxWidget): boolean {
    return this.checked === other.checked;
  }

  toDOM(): HTMLElement {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = this.checked;
    input.className = "cm-checkbox-widget";
    input.setAttribute("aria-label", this.checked ? "Completed task" : "Incomplete task");
    return input;
  }

  ignoreEvent(event: Event): boolean {
    // Allow click events to pass through so we can toggle
    return event.type !== "mousedown";
  }
}

// ---------------------------------------------------------------------------
// Build decorations
// ---------------------------------------------------------------------------
function buildDecorations(doc: Text, cursorLine: number): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const matches = scanCheckboxes(doc);
  for (const m of matches) {
    if (m.lineNumber === cursorLine) continue;
    builder.add(
      m.markerFrom,
      m.bracketTo,
      Decoration.replace({ widget: new CheckboxWidget(m.checked) }),
    );
  }
  return builder.finish();
}

// ---------------------------------------------------------------------------
// StateField
// ---------------------------------------------------------------------------
const checkboxField = StateField.define<{ cursorLine: number; decos: DecorationSet }>({
  create(state) {
    const cursorLine = state.doc.lineAt(state.selection.main.head).number;
    return { cursorLine, decos: buildDecorations(state.doc, cursorLine) };
  },
  update(value, tr) {
    const cursorLine = tr.state.doc.lineAt(tr.state.selection.main.head).number;
    const docChanged = tr.docChanged;
    const lineChanged = cursorLine !== value.cursorLine;
    if (!docChanged && !lineChanged) return value;
    return { cursorLine, decos: buildDecorations(tr.state.doc, cursorLine) };
  },
  provide: (f) => EditorView.decorations.from(f, (v) => v.decos),
});

// ---------------------------------------------------------------------------
// Click handler for toggling checkboxes
// ---------------------------------------------------------------------------
const checkboxClickHandler = EditorView.domEventHandlers({
  mousedown(event, view) {
    const target = event.target as HTMLElement;
    if (!(target instanceof HTMLInputElement) || target.type !== "checkbox" || !target.classList.contains("cm-checkbox-widget")) {
      return false;
    }

    event.preventDefault();

    // posAtDOM returns the start of the replace decoration (the list marker)
    const decoFrom = view.posAtDOM(target);
    const line = view.state.doc.lineAt(decoFrom);
    const match = line.text.match(CHECKBOX_RE);
    if (!match) return false;
    const bracketFrom = line.from + match[1].length;
    const bracketLen = match[2].length === 0 ? 2 : 3;
    const bracketTo = bracketFrom + bracketLen;
    const bracketContent = view.state.sliceDoc(bracketFrom, bracketTo);
    if (bracketContent[0] !== "[") return false;
    const isChecked = match[2] === "x" || match[2] === "X";
    const replacement = isChecked ? "[ ]" : "[x]";

    view.dispatch({
      changes: { from: bracketFrom, to: bracketTo, insert: replacement },
    });

    return true;
  },
});

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
export function checkboxDecorations(): Extension {
  return [checkboxField, checkboxClickHandler];
}
