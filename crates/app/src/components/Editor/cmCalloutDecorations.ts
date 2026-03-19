/**
 * CodeMirror 6 extension that decorates callout blocks in the editor.
 *
 * Three features:
 * A) Tinted background + colored left border on callout lines
 * B) Inline header widget (cursor-aware: raw syntax when editing)
 * C) Fold markers for collapsing callout bodies
 */
import {
  EditorView,
  Decoration,
  WidgetType,
  type DecorationSet,
} from "@codemirror/view";
import { RangeSetBuilder, StateField, type Text, type Extension } from "@codemirror/state";
import { foldService, codeFolding, foldKeymap } from "@codemirror/language";
import { keymap } from "@codemirror/view";
import katex from "katex";
import "katex/dist/katex.min.css";
import { CALLOUT_TYPES, CALLOUT_FALLBACK } from "./calloutTypes";

// ---------------------------------------------------------------------------
// Regexes (same as calloutPreprocess.ts)
// ---------------------------------------------------------------------------
const CALLOUT_BRACE_START = /^\[!(\w[\w-]*)\]([^\n{]*)\{\s*$/;
const FENCE_OPEN = /^(`{3,}|~{3,})/;

// ---------------------------------------------------------------------------
// SVG icon helpers (pattern from graphIcons.ts)
// ---------------------------------------------------------------------------
type SvgElement = [string, Record<string, string>];

const CALLOUT_ICON_PATHS: Record<string, SvgElement[]> = {
  "ai-answer": [
    // Bot
    ["path", { d: "M12 8V4H8" }],
    ["rect", { width: "16", height: "12", x: "4", y: "8", rx: "2" }],
    ["path", { d: "M2 14h2" }],
    ["path", { d: "M20 14h2" }],
    ["path", { d: "M15 13v2" }],
    ["path", { d: "M9 13v2" }],
  ],
  source: [
    // BookOpen
    ["path", { d: "M12 7v14" }],
    [
      "path",
      {
        d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
      },
    ],
  ],
  question: [
    // HelpCircle
    ["circle", { cx: "12", cy: "12", r: "10" }],
    ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" }],
    ["path", { d: "M12 17h.01" }],
  ],
  "key-insight": [
    // Lightbulb
    [
      "path",
      {
        d: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
      },
    ],
    ["path", { d: "M9 18h6" }],
    ["path", { d: "M10 22h4" }],
  ],
  example: [
    // FlaskConical
    ["path", { d: "M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2" }],
    ["path", { d: "M6.453 15h11.094" }],
    ["path", { d: "M8.5 2h7" }],
  ],
  definition: [
    // BookA
    ["path", { d: "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" }],
    ["path", { d: "m8 13 4-7 4 7" }],
    ["path", { d: "M9.1 11h5.7" }],
  ],
  math: [
    // Sigma
    ["path", { d: "M18 7V5a1 1 0 0 0-1-1H6.5a.5.5 0 0 0-.4.8l4.5 6a2 2 0 0 1 0 2.4l-4.5 6a.5.5 0 0 0 .4.8H17a1 1 0 0 0 1-1v-2" }],
  ],
  attention: [
    // TriangleAlert
    ["path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }],
    ["path", { d: "M12 9v4" }],
    ["path", { d: "M12 17h.01" }],
  ],
};

// Fallback: Info circle
const FALLBACK_ICON_PATHS: SvgElement[] = [
  ["circle", { cx: "12", cy: "12", r: "10" }],
  ["path", { d: "M12 16v-4" }],
  ["path", { d: "M12 8h.01" }],
];

function renderSvgElement(el: SvgElement): string {
  const [tag, attrs] = el;
  const attrStr = Object.entries(attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");
  return `<${tag} ${attrStr}/>`;
}

function buildSvgDataUri(paths: SvgElement[], strokeColor: string): string {
  const children = paths.map(renderSvgElement).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${children}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const iconCache = new Map<string, string>();

function getCalloutIconUri(type: string, color: string): string {
  const key = `${type}|${color}`;
  if (iconCache.has(key)) return iconCache.get(key)!;
  const paths = CALLOUT_ICON_PATHS[type] ?? FALLBACK_ICON_PATHS;
  const uri = buildSvgDataUri(paths, color);
  iconCache.set(key, uri);
  return uri;
}

function getCalloutColor(type: string): string {
  return CALLOUT_TYPES[type]?.color ?? CALLOUT_FALLBACK.color;
}

function getCalloutLabel(type: string): string {
  return CALLOUT_TYPES[type]?.label || type;
}

// ---------------------------------------------------------------------------
// Scanner: find callout blocks in the document
// ---------------------------------------------------------------------------
export interface CalloutRange {
  type: string;
  title: string;
  headerFrom: number;
  headerTo: number;
  closingLineFrom: number;
  closingLineTo: number;
  bodyLineCount: number;
  closed: boolean;
}

export function scanCallouts(doc: Text): CalloutRange[] {
  const results: CalloutRange[] = [];
  let inFence = false;
  let fenceChar = "";
  let inCallout = false;
  let current: Partial<CalloutRange> = {};
  let bodyLines = 0;

  for (let i = 1; i <= doc.lines; i++) {
    const line = doc.line(i);
    const text = line.text;

    // Track fenced code blocks everywhere (including inside callout bodies)
    const fenceMatch = text.match(FENCE_OPEN);
    if (fenceMatch) {
      if (!inFence) {
        inFence = true;
        fenceChar = fenceMatch[1][0];
      } else if (
        text.trimEnd().startsWith(fenceChar) &&
        text.trim() === fenceChar.repeat(text.trim().length)
      ) {
        inFence = false;
        fenceChar = "";
      }
    }

    if (inFence) {
      // Still count body lines inside fences
      if (inCallout) bodyLines++;
      continue;
    }

    if (!inCallout) {
      const match = text.match(CALLOUT_BRACE_START);
      if (match) {
        inCallout = true;
        bodyLines = 0;
        current = {
          type: match[1],
          title: match[2].trim(),
          headerFrom: line.from,
          headerTo: line.to,
        };
      }
    } else {
      const trimmed = text.trimEnd();
      if (trimmed === "}") {
        results.push({
          type: current.type!,
          title: current.title!,
          headerFrom: current.headerFrom!,
          headerTo: current.headerTo!,
          closingLineFrom: line.from,
          closingLineTo: line.to,
          bodyLineCount: bodyLines,
          closed: true,
        });
        inCallout = false;
        current = {};
      } else {
        bodyLines++;
      }
    }
  }

  // Unclosed callout: extend to document end
  if (inCallout) {
    const lastLine = doc.line(doc.lines);
    results.push({
      type: current.type!,
      title: current.title!,
      headerFrom: current.headerFrom!,
      headerTo: current.headerTo!,
      closingLineFrom: lastLine.from,
      closingLineTo: lastLine.to,
      bodyLineCount: bodyLines,
      closed: false,
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Feature B: Widgets
// ---------------------------------------------------------------------------
class ZeroHeightWidget extends WidgetType {
  toDOM() {
    const el = document.createElement("span");
    el.style.height = "0";
    el.style.overflow = "hidden";
    el.style.display = "block";
    return el;
  }
  get estimatedHeight() {
    return 0;
  }
  ignoreEvent() {
    return false;
  }
}

class CalloutSpacerWidget extends WidgetType {
  toDOM() {
    const el = document.createElement("div");
    el.style.height = "6px";
    return el;
  }
  get estimatedHeight() {
    return 6;
  }
  ignoreEvent() {
    return false;
  }
}

class CalloutHeaderWidget extends WidgetType {
  constructor(
    readonly type: string,
    readonly title: string,
  ) {
    super();
  }

  eq(other: CalloutHeaderWidget): boolean {
    return this.type === other.type && this.title === other.title;
  }

  toDOM(): HTMLElement {
    const color = getCalloutColor(this.type);
    const label = getCalloutLabel(this.type);
    const iconUri = getCalloutIconUri(this.type, color);

    const wrapper = document.createElement("span");
    wrapper.className = "cm-callout-widget-header";
    wrapper.style.verticalAlign = "middle";
    wrapper.style.setProperty("--callout-color", color);

    const img = document.createElement("img");
    img.src = iconUri;
    img.width = 14;
    img.height = 14;
    img.style.verticalAlign = "middle";
    wrapper.appendChild(img);

    const labelSpan = document.createElement("span");
    labelSpan.className = "cm-callout-widget-label";
    labelSpan.style.color = color;
    labelSpan.textContent = label;
    wrapper.appendChild(labelSpan);

    if (this.title) {
      const titleSpan = document.createElement("span");
      titleSpan.className = "cm-callout-widget-title";
      titleSpan.textContent = this.title;
      wrapper.appendChild(titleSpan);
    }

    return wrapper;
  }

  ignoreEvent(): boolean {
    return false;
  }
}

class MathPreviewWidget extends WidgetType {
  constructor(readonly latex: string) {
    super();
  }

  eq(other: MathPreviewWidget): boolean {
    return this.latex === other.latex;
  }

  toDOM(): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.className = "cm-math-preview";
    try {
      katex.render(this.latex, wrapper, {
        displayMode: true,
        throwOnError: false,
      });
    } catch {
      wrapper.textContent = this.latex;
    }
    return wrapper;
  }

  get estimatedHeight() {
    return 40;
  }

  ignoreEvent(): boolean {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Compute CSS classes for a given line within a callout
// ---------------------------------------------------------------------------
export function computeLineClasses(
  lineNum: number,
  headerLineNum: number,
  closingLineNum: number,
  bodyLineCount: number,
  closed: boolean,
  cursorOnClosing: boolean,
): string {
  const base = "cm-callout-line";

  if (lineNum === headerLineNum) {
    // Header is also last visible line when: no body AND (brace hidden or unclosed)
    const headerIsLast =
      bodyLineCount === 0 && (!closed || !cursorOnClosing);
    return headerIsLast
      ? `${base} cm-callout-header cm-callout-last`
      : `${base} cm-callout-header`;
  }

  if (closed && lineNum === closingLineNum) {
    // Closing brace line (only visible when cursor is on it)
    return `${base} cm-callout-body cm-callout-last`;
  }

  // Body line — determine if it's the last visible body line
  // For closed callouts, last body is the line before the closing brace.
  // For unclosed callouts, closingLineNum itself is the last body line.
  const lastBodyLineNum = closed ? closingLineNum - 1 : closingLineNum;
  const isLastBody = lineNum === lastBodyLineNum;

  if (!isLastBody) {
    return `${base} cm-callout-body`;
  }

  // Last body line: gets cm-callout-last only when closing brace is hidden (or unclosed)
  if (!closed || !cursorOnClosing) {
    return `${base} cm-callout-body cm-callout-last`;
  }
  return `${base} cm-callout-body`;
}

// ---------------------------------------------------------------------------
// Build decorations from scan results
// ---------------------------------------------------------------------------
function buildDecorations(
  ranges: CalloutRange[],
  doc: Text,
  cursorLine: number,
): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();

  const lineDeco = (classes: string, color: string) =>
    Decoration.line({
      attributes: { class: classes, style: `--callout-color: ${color};` },
    });

  // Decorations must be added in document order
  for (const r of ranges) {
    const color = getCalloutColor(r.type);

    const headerLineNum = doc.lineAt(r.headerFrom).number;
    const closingLineNum = r.closed
      ? doc.lineAt(r.closingLineFrom).number
      : doc.lineAt(r.closingLineTo).number;
    const cursorOnClosing = r.closed && cursorLine === closingLineNum;

    // Spacer above callout
    builder.add(r.headerFrom, r.headerFrom, Decoration.widget({
      widget: new CalloutSpacerWidget(),
      block: true,
      side: -1,
    }));

    // Header line
    const headerClasses = computeLineClasses(
      headerLineNum, headerLineNum, closingLineNum,
      r.bodyLineCount, r.closed, cursorOnClosing,
    );
    builder.add(r.headerFrom, r.headerFrom, lineDeco(headerClasses, color));

    if (cursorLine !== headerLineNum && r.headerFrom < r.headerTo) {
      // Replace header content with widget when cursor is elsewhere
      builder.add(
        r.headerFrom,
        r.headerTo,
        Decoration.replace({
          widget: new CalloutHeaderWidget(r.type, r.title),
        }),
      );
    }

    // Body lines (include closingLineNum for unclosed callouts since it's the last body line)
    const bodyEnd = r.closed ? closingLineNum : closingLineNum + 1;
    const cursorInCallout =
      cursorLine >= headerLineNum && cursorLine <= closingLineNum;
    const isMathHidden =
      r.type === "math" && r.closed && r.bodyLineCount > 0 && !cursorInCallout;

    for (let ln = headerLineNum + 1; ln < bodyEnd; ln++) {
      const line = doc.line(ln);
      if (isMathHidden) {
        // Hide body line — the MathPreviewWidget shows rendered math instead
        builder.add(line.from, line.to, Decoration.replace({
          widget: new ZeroHeightWidget(),
          block: true,
        }));
      } else {
        const classes = computeLineClasses(
          ln, headerLineNum, closingLineNum,
          r.bodyLineCount, r.closed, cursorOnClosing,
        );
        builder.add(line.from, line.from, lineDeco(classes, color));
      }
    }

    // Closing line
    if (r.closed) {
      if (!cursorOnClosing) {
        // Replace with zero-height block widget so CodeMirror's height map stays accurate
        builder.add(
          r.closingLineFrom,
          r.closingLineTo,
          Decoration.replace({
            widget: new ZeroHeightWidget(),
            block: true,
          }),
        );
      } else {
        // Cursor on closing line: show raw } with styling
        const classes = computeLineClasses(
          closingLineNum, headerLineNum, closingLineNum,
          r.bodyLineCount, r.closed, cursorOnClosing,
        );
        builder.add(r.closingLineFrom, r.closingLineFrom, lineDeco(classes, color));
      }
    }

    // Math preview widget: render KaTeX below closing brace when cursor is outside
    if (isMathHidden) {
      // Extract body text from lines between header and closing brace
      let bodyText = "";
      for (let ln = headerLineNum + 1; ln < closingLineNum; ln++) {
        bodyText += doc.line(ln).text + "\n";
      }
      bodyText = bodyText.trim();
      if (bodyText) {
        builder.add(r.closingLineTo, r.closingLineTo, Decoration.widget({
          widget: new MathPreviewWidget(bodyText),
          block: true,
          side: 1,
        }));
      }
    }

    // Spacer below callout
    const endPos = r.closed ? r.closingLineTo : r.closingLineTo;
    builder.add(endPos, endPos, Decoration.widget({
      widget: new CalloutSpacerWidget(),
      block: true,
      side: 1,
    }));
  }

  return builder.finish();
}

// ---------------------------------------------------------------------------
// StateField (decorations participate in initial render for accurate height map)
// ---------------------------------------------------------------------------
const calloutField = StateField.define<{ ranges: CalloutRange[]; cursorLine: number; decos: DecorationSet }>({
  create(state) {
    const ranges = scanCallouts(state.doc);
    const cursorLine = state.doc.lineAt(state.selection.main.head).number;
    return { ranges, cursorLine, decos: buildDecorations(ranges, state.doc, cursorLine) };
  },
  update(value, tr) {
    const cursorLine = tr.state.doc.lineAt(tr.state.selection.main.head).number;
    const docChanged = tr.docChanged;
    const lineChanged = cursorLine !== value.cursorLine;
    if (!docChanged && !lineChanged) return value;
    const ranges = docChanged ? scanCallouts(tr.state.doc) : value.ranges;
    return { ranges, cursorLine, decos: buildDecorations(ranges, tr.state.doc, cursorLine) };
  },
  provide: (f) => EditorView.decorations.from(f, (v) => v.decos),
});

// ---------------------------------------------------------------------------
// Feature C: Fold service
// ---------------------------------------------------------------------------
const calloutFoldService = foldService.of((state, lineStart) => {
  const line = state.doc.lineAt(lineStart);
  const match = line.text.match(CALLOUT_BRACE_START);
  if (!match) return null;

  // Scan forward for closing }
  let inFence = false;
  let fenceChar = "";
  for (let i = line.number + 1; i <= state.doc.lines; i++) {
    const l = state.doc.line(i);
    const text = l.text;

    const fenceMatch = text.match(FENCE_OPEN);
    if (fenceMatch) {
      if (!inFence) {
        inFence = true;
        fenceChar = fenceMatch[1][0];
      } else if (
        text.trimEnd().startsWith(fenceChar) &&
        text.trim() === fenceChar.repeat(text.trim().length)
      ) {
        inFence = false;
        fenceChar = "";
      }
    }

    if (inFence) continue;

    if (l.text.trimEnd() === "}") {
      // Fold from end of header line to end of closing line
      return { from: line.to, to: l.to };
    }
  }

  return null;
});

// ---------------------------------------------------------------------------
// Base theme
// ---------------------------------------------------------------------------
const baseTheme = EditorView.baseTheme({
  // Card-like callout line styling
  ".cm-callout-line": {
    borderLeft: "3px solid var(--callout-color)",
    borderRight: "1px solid color-mix(in srgb, var(--callout-color) 15%, transparent)",
    paddingLeft: "14px",
    background: "color-mix(in srgb, var(--callout-color) 5%, transparent)",
    color: "var(--text-secondary)",
  },
  ".cm-callout-header": {
    background: "color-mix(in srgb, var(--callout-color) 8%, transparent)",
    borderTop: "1px solid color-mix(in srgb, var(--callout-color) 15%, transparent)",
    borderRadius: "0 6px 0 0",
    paddingTop: "6px",
  },
  ".cm-callout-last": {
    borderBottom: "1px solid color-mix(in srgb, var(--callout-color) 15%, transparent)",
    borderRadius: "0 0 6px 0",
    paddingBottom: "8px",
  },
  "&.cm-editor .cm-callout-header.cm-callout-last": {
    borderRadius: "0 6px 6px 0",
  },
  // Widget styling
  ".cm-callout-widget-header": {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "0.9em",
    background: "color-mix(in srgb, var(--callout-color) 12%, transparent)",
  },
  ".cm-callout-widget-label": {
    fontWeight: "600",
    textTransform: "uppercase",
    fontSize: "0.85em",
    letterSpacing: "0.03em",
  },
  ".cm-callout-widget-title": {
    fontWeight: "400",
    opacity: "0.85",
  },
  ".cm-callout-widget-title::before": {
    content: '"—"',
    margin: "0 4px",
    opacity: "0.4",
  },
});

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
export function calloutDecorations(): Extension {
  return [
    calloutField,
    calloutFoldService,
    codeFolding(),
    keymap.of(foldKeymap),
    baseTheme,
  ];
}
