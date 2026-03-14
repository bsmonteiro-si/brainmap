import { EditorView, ViewPlugin } from "@codemirror/view";
import type { Extension } from "@codemirror/state";

/**
 * Build a file reference string from a CodeMirror selection.
 * Exported for testing.
 */
export function buildReference(
  absolutePath: string,
  fromPos: number,
  toPos: number,
  lineAt: (pos: number) => { number: number },
): string {
  const startLine = lineAt(fromPos).number;
  const endLine = lineAt(toPos).number;
  if (startLine === endLine) {
    return `${absolutePath}#L${startLine}`;
  }
  return `${absolutePath}#L${startLine}-${endLine}`;
}

/**
 * CodeMirror extension that adds a "Copy File Reference" item to a custom
 * right-click context menu when text is selected. Copies an absolute path
 * with line numbers, e.g. `/path/to/note.md:12-18`.
 */
export function copyReferenceMenu(absolutePath: string): Extension {
  let menuEl: HTMLDivElement | null = null;
  let activeDismiss: (() => void) | null = null;

  function removeMenu() {
    if (activeDismiss) {
      activeDismiss();
      activeDismiss = null;
    } else if (menuEl) {
      menuEl.remove();
      menuEl = null;
    }
  }

  function showMenu(view: EditorView, x: number, y: number) {
    removeMenu();

    const menu = document.createElement("div");
    menu.className = "context-menu";
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    const item = document.createElement("div");
    item.className = "context-menu-item";
    item.textContent = "Copy File Reference";
    item.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const sel = view.state.selection.main;
      const ref = buildReference(
        absolutePath,
        sel.from,
        sel.to,
        (pos) => view.state.doc.lineAt(pos),
      );
      navigator.clipboard.writeText(ref).catch(() => {});
      dismiss();
    });

    menu.appendChild(item);
    document.body.appendChild(menu);
    menuEl = menu;

    // Clamp to viewport
    requestAnimationFrame(() => {
      if (!menuEl) return;
      const rect = menuEl.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        menuEl.style.left = `${window.innerWidth - rect.width - 4}px`;
      }
      if (rect.bottom > window.innerHeight) {
        menuEl.style.top = `${window.innerHeight - rect.height - 4}px`;
      }
    });

    // Dismiss handlers
    const dismiss = () => {
      if (menuEl) {
        menuEl.remove();
        menuEl = null;
      }
      activeDismiss = null;
      document.removeEventListener("mousedown", onOutsideClick);
      document.removeEventListener("keydown", onEscape);
      view.scrollDOM.removeEventListener("scroll", dismiss);
    };

    activeDismiss = dismiss;

    const onOutsideClick = (e: MouseEvent) => {
      if (menuEl && !menuEl.contains(e.target as Node)) {
        dismiss();
      }
    };

    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };

    // Delay to avoid the current contextmenu event from immediately dismissing
    requestAnimationFrame(() => {
      document.addEventListener("mousedown", onOutsideClick);
      document.addEventListener("keydown", onEscape);
      view.scrollDOM.addEventListener("scroll", dismiss, { once: true });
    });
  }

  const handlers = EditorView.domEventHandlers({
    contextmenu(event: MouseEvent, view: EditorView) {
      const sel = view.state.selection.main;
      if (sel.from === sel.to) {
        removeMenu();
        return false;
      }

      event.preventDefault();
      showMenu(view, event.clientX, event.clientY);
      return true;
    },
  });

  // Clean up menu and listeners when the EditorView is destroyed
  const cleanup = ViewPlugin.define(() => ({
    destroy() {
      removeMenu();
    },
  }));

  return [handlers, cleanup];
}
