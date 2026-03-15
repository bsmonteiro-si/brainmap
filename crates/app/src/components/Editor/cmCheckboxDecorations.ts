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
const CHECKBOX_RE = /^(\s*(?:[-*+]|\d+[.)]) )\[([ xX])\]/;

// ---------------------------------------------------------------------------
// Scanner (exported for testing)
// ---------------------------------------------------------------------------
export interface CheckboxMatch {
  lineNumber: number;
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
      const prefix = match[1];
      const bracketFrom = line.from + prefix.length;
      const bracketTo = bracketFrom + 3; // `[x]` is 3 chars
      results.push({
        lineNumber: i,
        bracketFrom,
        bracketTo,
        checked: match[2] !== " ",
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
      m.bracketFrom,
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

    // posAtDOM returns the start of the replace decoration (the `[` of `[ ]`/`[x]`)
    const bracketFrom = view.posAtDOM(target);
    const bracketTo = bracketFrom + 3;
    const bracketContent = view.state.sliceDoc(bracketFrom, bracketTo);
    // Verify we're actually looking at a checkbox bracket
    if (bracketContent[0] !== "[" || bracketContent[2] !== "]") return false;
    const isChecked = bracketContent[1] !== " ";
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
