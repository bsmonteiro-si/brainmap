import { EditorView, ViewPlugin } from "@codemirror/view";
import type { Extension } from "@codemirror/state";
import { buildReference } from "./cmCopyReference";
import { toggleWrap } from "./cmFormatting";

/**
 * Determine context menu items based on editor state.
 * Exported for testing.
 */
export interface MenuItem {
  label: string;
  action: (view: EditorView) => void;
  separator?: boolean;
}

export function getContextMenuItems(
  view: EditorView,
  absolutePath: string | null,
  findTableRange: ((doc: any, lineNum: number) => { start: number; end: number } | null) | null,
  formatTableInView: ((view: EditorView, range: { start: number; end: number }) => void) | null,
  clickLineNum: number | null,
): MenuItem[] {
  const items: MenuItem[] = [];
  const sel = view.state.selection.main;
  const hasSelection = sel.from !== sel.to;

  // Cut / Copy / Paste
  items.push({ label: "Cut", action: (v) => { document.execCommand("cut"); v.focus(); } });
  items.push({ label: "Copy", action: (v) => { document.execCommand("copy"); v.focus(); } });
  items.push({ label: "Paste", action: (v) => { document.execCommand("paste"); v.focus(); } });

  // Formatting (when text selected)
  if (hasSelection) {
    items.push({ label: "", action: () => {}, separator: true });
    items.push({ label: "Bold", action: (v) => toggleWrap(v, "**") });
    items.push({ label: "Italic", action: (v) => toggleWrap(v, "*") });
    items.push({ label: "Code", action: (v) => toggleWrap(v, "`") });
    items.push({ label: "Strikethrough", action: (v) => toggleWrap(v, "~~") });
  }

  // Copy File Reference (when text selected + file path available)
  if (hasSelection && absolutePath) {
    items.push({ label: "", action: () => {}, separator: true });
    items.push({
      label: "Copy File Reference",
      action: (v) => {
        const ref = buildReference(absolutePath, sel.from, sel.to, (pos) => v.state.doc.lineAt(pos));
        navigator.clipboard.writeText(ref).catch(() => {});
      },
    });
  }

  // Format Table (when cursor is in a table)
  if (!hasSelection && clickLineNum !== null && findTableRange && formatTableInView) {
    const range = findTableRange(view.state.doc, clickLineNum);
    if (range) {
      items.push({ label: "", action: () => {}, separator: true });
      items.push({ label: "Format Table", action: (v) => formatTableInView(v, range) });
    }
  }

  return items;
}

/**
 * Unified editor context menu extension.
 * Consolidates Copy File Reference and Format Table into a single menu
 * with Cut/Copy/Paste and formatting options.
 */
export function editorContextMenu(
  absolutePath: string,
  findTableRange: (doc: any, lineNum: number) => { start: number; end: number } | null,
  formatTableInView: (view: EditorView, range: { start: number; end: number }) => void,
): Extension {
  let menuEl: HTMLDivElement | null = null;
  let dismissFn: (() => void) | null = null;

  function removeMenu() {
    if (dismissFn) { dismissFn(); dismissFn = null; }
    else if (menuEl) { menuEl.remove(); menuEl = null; }
  }

  function showMenu(view: EditorView, x: number, y: number, items: MenuItem[]) {
    removeMenu();

    const menu = document.createElement("div");
    menu.className = "context-menu";
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    for (const item of items) {
      if (item.separator) {
        const sep = document.createElement("div");
        sep.className = "context-menu-separator";
        menu.appendChild(sep);
        continue;
      }

      const el = document.createElement("div");
      el.className = "context-menu-item";
      el.textContent = item.label;
      el.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        item.action(view);
        dismiss();
      });
      menu.appendChild(el);
    }

    document.body.appendChild(menu);
    menuEl = menu;

    // Clamp to viewport
    requestAnimationFrame(() => {
      if (!menuEl) return;
      const rect = menuEl.getBoundingClientRect();
      if (rect.right > window.innerWidth) menuEl.style.left = `${window.innerWidth - rect.width - 4}px`;
      if (rect.bottom > window.innerHeight) menuEl.style.top = `${window.innerHeight - rect.height - 4}px`;
    });

    const dismiss = () => {
      if (menuEl) { menuEl.remove(); menuEl = null; }
      dismissFn = null;
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onEsc);
      view.scrollDOM.removeEventListener("scroll", dismiss);
    };
    dismissFn = dismiss;

    const onOutside = (e: MouseEvent) => { if (menuEl && !menuEl.contains(e.target as Node)) dismiss(); };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") dismiss(); };

    requestAnimationFrame(() => {
      document.addEventListener("mousedown", onOutside);
      document.addEventListener("keydown", onEsc);
      view.scrollDOM.addEventListener("scroll", dismiss, { once: true });
    });
  }

  const handlers = EditorView.domEventHandlers({
    contextmenu(event: MouseEvent, view: EditorView) {
      event.preventDefault();

      const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
      const clickLineNum = pos !== null ? view.state.doc.lineAt(pos).number : null;

      const items = getContextMenuItems(view, absolutePath, findTableRange, formatTableInView, clickLineNum);
      showMenu(view, event.clientX, event.clientY, items);
      return true;
    },
  });

  const cleanup = ViewPlugin.define(() => ({ destroy() { removeMenu(); } }));

  return [handlers, cleanup];
}
