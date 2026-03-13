import { useRef, useEffect } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { defaultKeymap, history, historyKeymap, redo } from "@codemirror/commands";
import { oneDark } from "@codemirror/theme-one-dark";
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { useUIStore } from "../../stores/uiStore";
import { linkNavigation } from "./cmLinkNavigation";
import { formattingKeymap } from "./cmFormatting";
import { calloutDecorations } from "./cmCalloutDecorations";

const ACCENT = "#4a9eff";
const ACCENT_DARK = "#5aaeFF";

function buildMarkdownHighlight(isDark: boolean) {
  const accent = isDark ? ACCENT_DARK : ACCENT;
  return HighlightStyle.define([
    { tag: tags.heading1, fontSize: "1.5em", fontWeight: "700", color: accent },
    { tag: tags.heading2, fontSize: "1.3em", fontWeight: "600", color: accent },
    { tag: tags.heading3, fontSize: "1.15em", fontWeight: "600", color: accent },
    { tag: tags.heading4, fontSize: "1.05em", fontWeight: "600", color: accent },
    { tag: tags.emphasis, fontStyle: "italic" },
    { tag: tags.strong, fontWeight: "700" },
  ]);
}

// Patch offsetWidth/offsetHeight on the CM DOM element so that CodeMirror's
// internal getScale() detects the CSS zoom factor. In WKWebView, both
// getBoundingClientRect and offsetWidth scale with ancestor CSS zoom, making
// getScale() return 1.0.  By dividing out the zoom from offsetWidth/Height,
// getScale() returns the zoom factor Z, and CM correctly adjusts mouse
// coordinates: (clientX - rect.left) / Z = correct CSS offset.
function patchCMScaleDetection(dom: HTMLElement, zoomRef: React.RefObject<number>) {
  Object.defineProperty(dom, "offsetWidth", {
    get() {
      const rect = HTMLElement.prototype.getBoundingClientRect.call(this);
      return rect.width / (zoomRef.current ?? 1);
    },
    configurable: true,
  });
  Object.defineProperty(dom, "offsetHeight", {
    get() {
      const rect = HTMLElement.prototype.getBoundingClientRect.call(this);
      return rect.height / (zoomRef.current ?? 1);
    },
    configurable: true,
  });
}

interface Props {
  notePath: string;
  content: string;
  onChange: (content: string) => void;
  onViewReady?: (view: EditorView | null) => void;
  restoreScrollTop?: number;
  restoreCursorPos?: number;
}

export function MarkdownEditor({ notePath, content, onChange, onViewReady, restoreScrollTop, restoreCursorPos }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const contentRef = useRef(content);
  const uiZoomRef = useRef(1);
  const effectiveTheme = useUIStore((s) => s.effectiveTheme);
  const editorFontFamily = useUIStore((s) => s.editorFontFamily);
  const editorFontSize = useUIStore((s) => s.editorFontSize);
  const uiZoom = useUIStore((s) => s.uiZoom);

  // Keep refs up-to-date
  onChangeRef.current = onChange;
  contentRef.current = content;
  uiZoomRef.current = uiZoom;

  // Create/recreate editor when note changes, theme changes, or zoom changes
  useEffect(() => {
    if (!containerRef.current) return;

    const isDark = effectiveTheme === "dark";
    const extensions = [
      markdown(),
      history(),
      keymap.of([...formattingKeymap, { key: "Mod-y", run: redo, preventDefault: true }, ...historyKeymap, ...defaultKeymap]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChangeRef.current(update.state.doc.toString());
        }
      }),
      EditorView.lineWrapping,
      syntaxHighlighting(buildMarkdownHighlight(isDark)),
      linkNavigation(notePath),
      calloutDecorations(),
    ];

    if (isDark) {
      extensions.push(oneDark);
    }

    const state = EditorState.create({
      doc: contentRef.current,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;
    onViewReady?.(view);

    // Patch scale detection so CM accounts for CSS zoom on documentElement
    if (uiZoom !== 1) {
      patchCMScaleDetection(view.dom, uiZoomRef);
    }

    // Restore scroll position and cursor from tab state
    if (restoreCursorPos && restoreCursorPos > 0 && restoreCursorPos <= view.state.doc.length) {
      view.dispatch({ selection: { anchor: restoreCursorPos } });
    }
    if (restoreScrollTop && restoreScrollTop > 0) {
      requestAnimationFrame(() => {
        view.scrollDOM.scrollTop = restoreScrollTop;
      });
    }

    return () => {
      view.destroy();
      viewRef.current = null;
      onViewReady?.(null);
    };
  }, [notePath, effectiveTheme, uiZoom, editorFontFamily, editorFontSize]);

  // Sync external content changes (e.g., after save or conflict resolution)
  // without recreating the editor
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentDoc = view.state.doc.toString();
    if (currentDoc !== content) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: content },
      });
    }
  }, [content]);

  return <div ref={containerRef} style={{ height: "100%" }} />;
}
