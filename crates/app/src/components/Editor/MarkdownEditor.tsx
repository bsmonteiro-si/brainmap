import { useRef, useEffect } from "react";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { GFM } from "@lezer/markdown";
import { defaultKeymap, history, historyKeymap, redo, indentWithTab } from "@codemirror/commands";
import { syntaxHighlighting, HighlightStyle, indentUnit } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import { search, searchKeymap } from "@codemirror/search";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { tags } from "@lezer/highlight";
import { useUIStore, THEME_BASE } from "../../stores/uiStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { linkNavigation } from "./cmLinkNavigation";
import { formattingKeymap } from "./cmFormatting";
import { calloutDecorations } from "./cmCalloutDecorations";
import { editorContextMenu } from "./cmContextMenu";
import { findTableRange, formatTableInView } from "./cmMarkdownDecorations";
import { listSpacing } from "./cmListSpacing";
import { markdownDecorations } from "./cmMarkdownDecorations";
import { checkboxDecorations } from "./cmCheckboxDecorations";
import { bulletDecorations } from "./cmBulletDecorations";
import { orderedListDecorations } from "./cmOrderedListDecorations";
import { arrowDecorations } from "./cmArrowDecorations";
import { listNestingKeymap } from "./cmListNesting";
import { smartPaste } from "./cmSmartPaste";
import { createSlashAutocompletion } from "./cmSlashCommands";
import { headingFoldService } from "./cmHeadingFold";
import { mermaidDecorations, clearMermaidCache } from "./cmMermaidDecorations";
import { imageDecorations, clearImageCache } from "./cmImageDecorations";
import { buildCodeHighlight, resolveCodeTheme } from "./cmCodeHighlight";

const ACCENT = "#4a9eff";
const ACCENT_DARK = "#5aaeFF";

/** Custom dark theme that defers to CSS variables for selection colors
 *  instead of the bundled oneDark which hard-codes them. */
const darkEditorTheme = EditorView.theme({
  "&": {
    backgroundColor: "var(--bg-primary)",
    color: "var(--text-primary)",
  },
  ".cm-content": { caretColor: "var(--accent)" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--accent)" },
  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground": {
    backgroundColor: "var(--selection-bg)",
  },
  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    backgroundColor: "var(--selection-bg-focused)",
  },
  ".cm-activeLine": { backgroundColor: "color-mix(in srgb, var(--accent) 5%, transparent)" },
  ".cm-gutters": {
    backgroundColor: "var(--bg-secondary)",
    color: "var(--text-muted)",
    borderRight: "1px solid var(--border-color)",
  },
  ".cm-activeLineGutter": { backgroundColor: "var(--bg-tertiary)" },
}, { dark: true });

function buildMarkdownHighlight(isDark: boolean) {
  const accent = isDark ? ACCENT_DARK : ACCENT;
  return HighlightStyle.define([
    { tag: tags.heading1, fontSize: "1.5em", fontWeight: "700", color: accent },
    { tag: tags.heading2, fontSize: "1.3em", fontWeight: "600", color: accent },
    { tag: tags.heading3, fontSize: "1.15em", fontWeight: "600", color: accent },
    { tag: tags.heading4, fontSize: "1.05em", fontWeight: "600", color: accent },
    { tag: tags.emphasis, fontStyle: "italic", color: "var(--italic-color)" },
    { tag: tags.strong, fontWeight: "var(--bold-weight)", color: "var(--bold-color)" },
    { tag: tags.strikethrough, textDecoration: "line-through", color: isDark ? "#888" : "#999" },
    { tag: tags.monospace, fontFamily: "ui-monospace, 'Menlo', 'Monaco', 'Consolas', monospace", fontSize: "0.88em" },
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
  readOnly?: boolean;
  raw?: boolean;
}

export function MarkdownEditor({ notePath, content, onChange, onViewReady, restoreScrollTop, restoreCursorPos, readOnly, raw }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const contentRef = useRef(content);
  const uiZoomRef = useRef(1);
  const effectiveTheme = useUIStore((s) => s.effectiveEditorTheme);
  const editorFontFamily = useUIStore((s) => s.editorFontFamily);
  const editorFontSize = useUIStore((s) => s.editorFontSize);
  const uiZoom = useUIStore((s) => s.uiZoom);
  const showLineNumbers = useUIStore((s) => s.showLineNumbers);
  const lineWrapping = useUIStore((s) => s.lineWrapping);
  const spellCheck = useUIStore((s) => s.spellCheck);
  const editorIndentSize = useUIStore((s) => s.editorIndentSize);
  const bulletStyle = useUIStore((s) => s.bulletStyle);
  const arrowLigatures = useUIStore((s) => s.arrowLigatures);
  const arrowEnabledTypes = useUIStore((s) => s.arrowEnabledTypes);
  const codeTheme = useUIStore((s) => s.codeTheme);
  const wsRoot = useWorkspaceStore((s) => s.info?.root);

  // Keep refs up-to-date
  onChangeRef.current = onChange;
  contentRef.current = content;
  uiZoomRef.current = uiZoom;

  // Create/recreate editor when note changes, theme changes, or zoom changes
  useEffect(() => {
    if (!containerRef.current) return;

    const isDark = THEME_BASE[effectiveTheme] === "dark";
    const extensions = [
      ...(lineWrapping ? [EditorView.lineWrapping] : []),
      ...(showLineNumbers ? [lineNumbers()] : []),
      ...(spellCheck ? [EditorView.contentAttributes.of({ spellcheck: "true" })] : []),
      EditorView.contentAttributes.of({ autocorrect: "off", autocapitalize: "off" }),
      indentUnit.of(" ".repeat(editorIndentSize)),
    ];

    if (!raw) {
      clearMermaidCache();
      clearImageCache();
      extensions.push(
        markdown({ extensions: GFM, codeLanguages: languages }),
        // Markdown-specific styles (headings, emphasis, strong, strikethrough, monospace) — must come
        // first so they take precedence for overlapping tags. The code theme below provides colors for
        // all code tokens (keyword, string, comment, etc.). Both must be non-fallback so CM6's
        // getHighlighters() returns both; using { fallback: true } on either causes it to be ignored
        // when the other is present.
        syntaxHighlighting(buildMarkdownHighlight(isDark)),
        syntaxHighlighting(buildCodeHighlight(resolveCodeTheme(codeTheme, isDark))),
        linkNavigation(notePath),
        calloutDecorations(),
        listSpacing(),
        markdownDecorations(),
        checkboxDecorations(),
        bulletDecorations(bulletStyle),
        orderedListDecorations(),
        ...(arrowLigatures && arrowEnabledTypes.length > 0
          ? [arrowDecorations(arrowEnabledTypes)]
          : []),
        headingFoldService(),
        mermaidDecorations(isDark),
        imageDecorations(notePath),
      );
      if (wsRoot) {
        extensions.push(editorContextMenu(wsRoot.replace(/\/$/, "") + "/" + notePath, findTableRange, formatTableInView));
      }
    }

    if (readOnly) {
      extensions.push(EditorState.readOnly.of(true));
      extensions.push(EditorView.editable.of(false));
    } else {
      extensions.push(
        history(),
        keymap.of([
          ...(raw ? [] : formattingKeymap),
          { key: "Mod-y", run: redo, preventDefault: true },
          ...closeBracketsKeymap,
          ...searchKeymap,
          ...(raw ? [] : listNestingKeymap),
          indentWithTab,
          ...historyKeymap,
          ...defaultKeymap,
        ]),
        EditorState.languageData.of(() => [{ closeBrackets: { brackets: ["(", "[", "{", "`"] } }]),
        closeBrackets(),
        search(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
      );
      if (!raw) {
        extensions.push(createSlashAutocompletion(), smartPaste());
      }
    }

    if (isDark) {
      extensions.push(darkEditorTheme);
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
  }, [notePath, effectiveTheme, uiZoom, editorFontFamily, editorFontSize, readOnly, raw, wsRoot, showLineNumbers, lineWrapping, spellCheck, editorIndentSize, bulletStyle, arrowLigatures, arrowEnabledTypes, codeTheme]);

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
