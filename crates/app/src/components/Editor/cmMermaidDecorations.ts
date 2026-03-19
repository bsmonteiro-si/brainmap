/**
 * CodeMirror 6 extension that renders mermaid fenced code blocks as SVG
 * diagrams when the cursor is outside the block, and shows raw source
 * when the cursor is inside (same cursor-aware pattern as TableWidget).
 */
import {
  EditorView,
  Decoration,
  WidgetType,
  ViewPlugin,
  type DecorationSet,
} from "@codemirror/view";
import {
  RangeSetBuilder,
  StateField,
  StateEffect,
  type Extension,
} from "@codemirror/state";
import type { EditorState } from "@codemirror/state";
import { scanFencedBlocks } from "./cmMarkdownDecorations";
import { scanCallouts } from "./cmCalloutDecorations";
import { CALLOUT_TYPES, CALLOUT_FALLBACK } from "./calloutTypes";
import { useUIStore } from "../../stores/uiStore";

// ---------------------------------------------------------------------------
// Lazy mermaid loading + initialization
// ---------------------------------------------------------------------------

type MermaidModule = { default: { initialize: (config: object) => void; render: (id: string, source: string) => Promise<{ svg: string }> } };

let mermaidMod: MermaidModule["default"] | null = null;
let mermaidLoading: Promise<void> | null = null;

async function ensureMermaid(isDark: boolean): Promise<MermaidModule["default"]> {
  if (mermaidMod) return mermaidMod;
  if (!mermaidLoading) {
    mermaidLoading = import("mermaid").then((mod) => {
      mermaidMod = mod.default;
      mermaidMod.initialize({
        startOnLoad: false,
        theme: isDark ? "dark" : "default",
        securityLevel: "strict",
      });
    });
  }
  await mermaidLoading;
  return mermaidMod!;
}

// ---------------------------------------------------------------------------
// SVG render cache
// ---------------------------------------------------------------------------

type CacheEntry = { svg: string } | { error: string };
const svgCache = new Map<string, CacheEntry>();
const pendingRenders = new Set<string>();

let renderCounter = 0;

async function renderMermaid(source: string, view: EditorView, isDark: boolean): Promise<void> {
  if (svgCache.has(source) || pendingRenders.has(source)) return;
  pendingRenders.add(source);
  try {
    const mm = await ensureMermaid(isDark);
    const id = `mermaid-${++renderCounter}`;
    const { svg } = await mm.render(id, source);
    svgCache.set(source, { svg });
  } catch (e: unknown) {
    svgCache.set(source, { error: e instanceof Error ? e.message : String(e) });
  } finally {
    pendingRenders.delete(source);
  }
  // Evict old entries if cache grows too large
  if (svgCache.size > 50) {
    const keys = Array.from(svgCache.keys());
    for (let i = 0; i < keys.length - 40; i++) svgCache.delete(keys[i]);
  }
  // Signal the StateField to rebuild decorations with the now-cached SVG.
  // Guard against destroyed views (user switched notes or theme changed).
  try {
    view.dispatch({ effects: mermaidRenderEffect.of(null) });
  } catch {
    // View was destroyed — ignore
  }
}

// ---------------------------------------------------------------------------
// HTML escaping for error messages
// ---------------------------------------------------------------------------

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// MermaidWidget
// ---------------------------------------------------------------------------

class MermaidWidget extends WidgetType {
  constructor(
    readonly source: string,
    readonly cached: CacheEntry | undefined,
    readonly calloutColor: string | null,
  ) {
    super();
  }

  eq(other: MermaidWidget): boolean {
    if (this.source !== other.source) return false;
    if (this.calloutColor !== other.calloutColor) return false;
    // Must also compare cache state so CM re-renders DOM when async render completes
    if (this.cached === other.cached) return true;
    if (!this.cached || !other.cached) return false;
    if ("svg" in this.cached && "svg" in other.cached) return this.cached.svg === other.cached.svg;
    if ("error" in this.cached && "error" in other.cached) return this.cached.error === other.cached.error;
    return false;
  }

  toDOM(): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.className = "cm-mermaid-widget";

    // Apply callout border/background when inside a callout
    if (this.calloutColor) {
      wrapper.style.borderLeft = `3px solid ${this.calloutColor}`;
      wrapper.style.borderRight = `1px solid color-mix(in srgb, ${this.calloutColor} 15%, transparent)`;
      wrapper.style.background = `color-mix(in srgb, ${this.calloutColor} 5%, transparent)`;
      wrapper.style.paddingLeft = "14px";
    }

    if (!this.cached) {
      wrapper.innerHTML = '<div class="cm-mermaid-loading">Rendering diagram\u2026</div>';
    } else if ("error" in this.cached) {
      wrapper.innerHTML = `<div class="cm-mermaid-error">Mermaid error: ${escapeHtml(this.cached.error)}</div>`;
    } else {
      wrapper.innerHTML = this.cached.svg;
      const svg = wrapper.querySelector("svg");
      if (svg) {
        // Remove mermaid's hardcoded width/height so CSS constraints apply
        svg.removeAttribute("width");
        svg.style.maxWidth = "100%";
        svg.style.maxHeight = `${useUIStore.getState().mermaidMaxHeight}px`;
        svg.style.height = "auto";
      }
    }

    return wrapper;
  }

  get estimatedHeight(): number {
    return 200;
  }

  ignoreEvent(): boolean {
    return false;
  }
}

// ---------------------------------------------------------------------------
// StateField
// ---------------------------------------------------------------------------

const mermaidRenderEffect = StateEffect.define<null>();

interface MermaidDecoState {
  cursorLine: number;
  decos: DecorationSet;
  isDark: boolean;
}

/** Sources that need async rendering — collected during buildMermaidDecos, consumed by updateListener. */
let pendingSources: string[] = [];

function buildMermaidDecos(state: EditorState, cursorLine: number): DecorationSet {
  const doc = state.doc;
  const fencedBlocks = scanFencedBlocks(doc);
  const mermaidBlocks = fencedBlocks.filter((b) => b.lang === "mermaid");

  if (mermaidBlocks.length === 0) return Decoration.none;

  // Scan callouts to detect if mermaid blocks are inside one
  const callouts = scanCallouts(doc);

  const builder = new RangeSetBuilder<Decoration>();

  for (const block of mermaidBlocks) {
    const cursorInBlock = cursorLine >= block.startLine && cursorLine <= block.endLine;

    if (cursorInBlock) {
      // Show raw source — fenced code line decorations are applied by cmMarkdownDecorations
      continue;
    }

    // Extract mermaid source (lines between opening and closing fences)
    const sourceLines: string[] = [];
    for (let ln = block.startLine + 1; ln < block.endLine; ln++) {
      sourceLines.push(doc.line(ln).text);
    }
    const source = sourceLines.join("\n").trim();
    if (!source) continue;

    // Check cache; if not cached, queue for async render
    const cached = svgCache.get(source);
    if (!cached) {
      pendingSources.push(source);
    }

    // Detect enclosing callout for border continuity
    const blockFrom = doc.line(block.startLine).from;
    const blockTo = doc.line(block.endLine).to;
    const enclosing = callouts.find(
      (c) => blockFrom >= c.headerTo && blockTo <= c.closingLineFrom,
    );
    const calloutColor = enclosing
      ? (CALLOUT_TYPES[enclosing.type]?.color ?? CALLOUT_FALLBACK.color)
      : null;

    builder.add(
      blockFrom,
      blockTo,
      Decoration.replace({
        widget: new MermaidWidget(source, cached, calloutColor),
        block: true,
      }),
    );
  }

  return builder.finish();
}

function createMermaidField() {
  return StateField.define<MermaidDecoState>({
    create(state) {
      const cursorLine = state.doc.lineAt(state.selection.main.head).number;
      return {
        cursorLine,
        decos: buildMermaidDecos(state, cursorLine),
        isDark: false,
      };
    },
    update(value, tr) {
      const cursorLine = tr.state.doc.lineAt(tr.state.selection.main.head).number;
      const hasRenderEffect = tr.effects.some((e) => e.is(mermaidRenderEffect));
      if (!tr.docChanged && cursorLine === value.cursorLine && !hasRenderEffect) {
        return value;
      }
      return {
        cursorLine,
        decos: buildMermaidDecos(tr.state, cursorLine),
        isDark: value.isDark,
      };
    },
    provide: (f) => EditorView.decorations.from(f, (v) => v.decos),
  });
}

/**
 * UpdateListener that picks up pending mermaid sources and triggers async rendering.
 * This runs after StateField.update, so pendingSources is populated.
 */
function createMermaidListener(isDark: boolean) {
  return EditorView.updateListener.of((update) => {
    if (pendingSources.length === 0) return;
    const sources = pendingSources.splice(0);
    for (const source of sources) {
      renderMermaid(source, update.view, isDark);
    }
  });
}

// ---------------------------------------------------------------------------
// Public extension factory
// ---------------------------------------------------------------------------

/** Clear the SVG cache (e.g., on theme change). */
export function clearMermaidCache(): void {
  svgCache.clear();
  // Reset mermaid module so it re-initializes with new theme
  mermaidMod = null;
  mermaidLoading = null;
}

/**
 * ViewPlugin that watches mermaidMaxHeight and directly updates all rendered
 * mermaid SVG elements in the editor DOM when the setting changes.
 */
const mermaidSettingsPlugin = ViewPlugin.define((view) => {
  const unsub = useUIStore.subscribe(
    (s) => s.mermaidMaxHeight,
    (maxHeight) => {
      view.dom.querySelectorAll<SVGElement>(".cm-mermaid-widget svg").forEach((svg) => {
        svg.style.maxHeight = `${maxHeight}px`;
      });
    },
  );
  return { destroy: unsub };
});

export function mermaidDecorations(isDark: boolean): Extension {
  return [createMermaidField(), createMermaidListener(isDark), mermaidSettingsPlugin];
}

// ---------------------------------------------------------------------------
// Exports for testing
// ---------------------------------------------------------------------------

export { MermaidWidget, buildMermaidDecos, svgCache, mermaidRenderEffect };
