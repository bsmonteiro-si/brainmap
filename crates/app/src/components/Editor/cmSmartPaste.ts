import { EditorView } from "@codemirror/view";
import type { Extension } from "@codemirror/state";

const URL_RE = /^https?:\/\/\S+$/;

export function isUrl(text: string): boolean {
  return URL_RE.test(text.trim());
}

/**
 * Smart paste: when pasting a URL while text is selected, wrap as [selected](url).
 * Falls through to default paste in all other cases.
 */
export function smartPaste(): Extension {
  return EditorView.domEventHandlers({
    paste(event, view) {
      const clipboard = event.clipboardData?.getData("text/plain");
      if (!clipboard || !isUrl(clipboard)) return false;

      const { main } = view.state.selection;
      if (main.empty) return false;

      const selected = view.state.sliceDoc(main.from, main.to);
      // If selection is itself a URL, let default paste replace it
      if (isUrl(selected)) return false;

      const url = clipboard.trim();
      const replacement = `[${selected}](${url})`;
      event.preventDefault();
      view.dispatch({
        changes: { from: main.from, to: main.to, insert: replacement },
        selection: { anchor: main.from + replacement.length },
      });
      return true;
    },
  });
}
