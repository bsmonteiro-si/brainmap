import { EditorView } from "@codemirror/view";
import type { Extension } from "@codemirror/state";
import { resolveNotePath, isLocalMdLink } from "../../utils/resolveNotePath";
import { useGraphStore } from "../../stores/graphStore";
import { useEditorStore } from "../../stores/editorStore";

const LINK_RE = /\[([^\]]*)\]\(([^)]*)\)/g;

/**
 * Given a line of text and an offset within that line, returns the markdown
 * link target URL if the offset falls inside a `[label](url)` match, or null.
 */
export function extractLinkAtPos(
  lineText: string,
  offsetInLine: number,
): string | null {
  LINK_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = LINK_RE.exec(lineText)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    if (offsetInLine >= start && offsetInLine < end) {
      return m[2]; // the URL group
    }
  }
  return null;
}

/**
 * CodeMirror extension that enables click on markdown links to navigate
 * to the linked note.
 */
export function linkNavigation(notePath: string): Extension {
  let lastLinkAtMouse = false;

  function updateHoverClass(view: EditorView, isOverLink: boolean) {
    if (isOverLink) {
      view.dom.classList.add("cm-cmd-link-hover");
    } else {
      view.dom.classList.remove("cm-cmd-link-hover");
    }
  }

  function checkLinkAtCoords(
    view: EditorView,
    x: number,
    y: number,
  ): string | null {
    const pos = view.posAtCoords({ x, y });
    if (pos === null) return null;
    const line = view.state.doc.lineAt(pos);
    const offsetInLine = pos - line.from;
    return extractLinkAtPos(line.text, offsetInLine);
  }

  const handlers = EditorView.domEventHandlers({
    click(event: MouseEvent, view: EditorView) {
      const target = checkLinkAtCoords(view, event.clientX, event.clientY);
      if (!target || !isLocalMdLink(target)) return false;

      const resolved = resolveNotePath(notePath, target);
      useGraphStore.getState().selectNode(resolved);
      useEditorStore.getState().openNote(resolved);

      event.preventDefault();
      return true;
    },

    mousemove(_event: MouseEvent, view: EditorView) {
      const target = checkLinkAtCoords(view, _event.clientX, _event.clientY);
      lastLinkAtMouse = target !== null && isLocalMdLink(target);
      updateHoverClass(view, lastLinkAtMouse);
      return false;
    },

    mouseleave(_event: MouseEvent, view: EditorView) {
      lastLinkAtMouse = false;
      updateHoverClass(view, false);
      return false;
    },
  });

  const theme = EditorView.baseTheme({
    "&.cm-cmd-link-hover .cm-content": {
      cursor: "pointer",
    },
  });

  return [handlers, theme];
}
