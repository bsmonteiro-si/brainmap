/**
 * CodeMirror 6 extension that decorates callout blocks in the editor.
 *
 * Four features:
 * A) Tinted background + colored left border on callout lines
 * B) Gutter icon on the callout header line
 * C) Inline header widget (cursor-aware: raw syntax when editing)
 * D) Fold markers for collapsing callout bodies
 */
import {
  EditorView,
  ViewPlugin,
  ViewUpdate,
  Decoration,
  WidgetType,
  GutterMarker,
  gutter,
  type DecorationSet,
} from "@codemirror/view";
import { RangeSetBuilder, RangeSet, type Text, type Extension } from "@codemirror/state";
import { foldService, codeFolding, foldKeymap } from "@codemirror/language";
import { keymap } from "@codemirror/view";
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
// Feature C: Widgets
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Feature B: Gutter marker
// ---------------------------------------------------------------------------
class CalloutGutterMarker extends GutterMarker {
  constructor(
    readonly type: string,
    readonly color: string,
  ) {
    super();
  }

  eq(other: CalloutGutterMarker): boolean {
    return this.type === other.type;
  }

  toDOM(): HTMLElement {
    const iconUri = getCalloutIconUri(this.type, this.color);
    const img = document.createElement("img");
    img.src = iconUri;
    img.width = 16;
    img.height = 16;
    img.style.opacity = "0.85";
    img.style.verticalAlign = "middle";
    return img;
  }
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
  // Decorations must be added in document order
  for (const r of ranges) {
    const color = getCalloutColor(r.type);
    const headerBg = `background: color-mix(in srgb, ${color} 12%, transparent); border-left: 3px solid ${color}; padding-left: 8px;`;
    const bodyBg = `background: color-mix(in srgb, ${color} 6%, transparent); border-left: 3px solid ${color}; padding-left: 8px;`;

    const headerLineNum = doc.lineAt(r.headerFrom).number;
    const closingLineNum = r.closed
      ? doc.lineAt(r.closingLineFrom).number
      : doc.lineAt(r.closingLineTo).number;

    // Header line
    if (cursorLine === headerLineNum) {
      // Cursor on header → show raw syntax with background only
      builder.add(
        r.headerFrom,
        r.headerFrom,
        Decoration.line({ attributes: { style: headerBg } }),
      );
    } else {
      // Header line background
      builder.add(
        r.headerFrom,
        r.headerFrom,
        Decoration.line({ attributes: { style: headerBg } }),
      );
      // Replace header content with widget
      if (r.headerFrom < r.headerTo) {
        builder.add(
          r.headerFrom,
          r.headerTo,
          Decoration.replace({
            widget: new CalloutHeaderWidget(r.type, r.title),
          }),
        );
      }
    }

    // Body lines
    for (let ln = headerLineNum + 1; ln < closingLineNum; ln++) {
      const line = doc.line(ln);
      builder.add(
        line.from,
        line.from,
        Decoration.line({ attributes: { style: bodyBg } }),
      );
    }

    // Closing line — tinted background always; hide `}` text unless cursor is on it
    if (r.closed) {
      builder.add(
        r.closingLineFrom,
        r.closingLineFrom,
        Decoration.line({ attributes: { style: bodyBg } }),
      );
      if (cursorLine !== closingLineNum && r.closingLineFrom < r.closingLineTo) {
        builder.add(
          r.closingLineFrom,
          r.closingLineTo,
          Decoration.replace({}),
        );
      }
    }
  }

  return builder.finish();
}

// ---------------------------------------------------------------------------
// Main ViewPlugin
// ---------------------------------------------------------------------------
class CalloutDecorationPlugin {
  decorations: DecorationSet;
  ranges: CalloutRange[];

  constructor(view: EditorView) {
    this.ranges = scanCallouts(view.state.doc);
    const cursorLine = view.state.doc.lineAt(
      view.state.selection.main.head,
    ).number;
    this.decorations = buildDecorations(this.ranges, view.state.doc, cursorLine);
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.ranges = scanCallouts(update.state.doc);
    }
    if (update.docChanged || update.selectionSet || update.viewportChanged) {
      const cursorLine = update.state.doc.lineAt(
        update.state.selection.main.head,
      ).number;
      this.decorations = buildDecorations(
        this.ranges,
        update.state.doc,
        cursorLine,
      );
    }
  }
}

const calloutViewPlugin = ViewPlugin.fromClass(CalloutDecorationPlugin, {
  decorations: (v) => v.decorations,
});

// ---------------------------------------------------------------------------
// Feature B: Gutter
// ---------------------------------------------------------------------------
const calloutGutter = gutter({
  class: "cm-callout-gutter",
  markers(view) {
    const plugin = view.plugin(calloutViewPlugin);
    if (!plugin) return RangeSet.empty;
    const builder = new RangeSetBuilder<GutterMarker>();
    for (const r of plugin.ranges) {
      const color = getCalloutColor(r.type);
      builder.add(r.headerFrom, r.headerFrom, new CalloutGutterMarker(r.type, color));
    }
    return builder.finish();
  },
});

// ---------------------------------------------------------------------------
// Feature D: Fold service
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
  ".cm-callout-gutter": {
    width: "22px",
    padding: "0 2px",
  },
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
    calloutViewPlugin,
    calloutGutter,
    calloutFoldService,
    codeFolding(),
    keymap.of(foldKeymap),
    baseTheme,
  ];
}
