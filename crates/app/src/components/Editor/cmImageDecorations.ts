/**
 * CodeMirror 6 extension that renders inline image previews below
 * `![alt](url)` lines when the cursor is outside the image syntax.
 * Follows the same async cursor-aware pattern as cmMermaidDecorations.ts.
 */
import {
  EditorView,
  Decoration,
  WidgetType,
  type DecorationSet,
} from "@codemirror/view";
import {
  RangeSetBuilder,
  StateField,
  StateEffect,
  type Extension,
} from "@codemirror/state";
import type { EditorState } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import { resolveNotePath } from "../../utils/resolveNotePath";
import { getAPI } from "../../api/bridge";

// ---------------------------------------------------------------------------
// Image path resolution cache
// ---------------------------------------------------------------------------

type CacheEntry = { assetUrl: string } | { error: string };
const imageCache = new Map<string, CacheEntry>();
const pendingResolves = new Set<string>();

function cacheKey(notePath: string, relUrl: string): string {
  return notePath + "\0" + relUrl;
}

async function resolveImage(
  notePath: string,
  relUrl: string,
  view: EditorView,
): Promise<void> {
  const key = cacheKey(notePath, relUrl);
  if (imageCache.has(key) || pendingResolves.has(key)) return;
  pendingResolves.add(key);
  try {
    const wsRelPath = resolveNotePath(notePath, relUrl);
    const api = await getAPI();
    const meta = await api.resolveImagePath(wsRelPath);

    let url: string;
    if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
      const { convertFileSrc } = await import("@tauri-apps/api/core");
      url = convertFileSrc(meta.absolute_path);
    } else {
      url = meta.absolute_path;
    }
    imageCache.set(key, { assetUrl: url });
  } catch (e: unknown) {
    imageCache.set(key, { error: e instanceof Error ? e.message : String(e) });
  } finally {
    pendingResolves.delete(key);
  }
  // Evict old entries if cache grows too large
  if (imageCache.size > 50) {
    const keys = Array.from(imageCache.keys());
    for (let i = 0; i < keys.length - 40; i++) imageCache.delete(keys[i]);
  }
  // Signal the StateField to rebuild decorations with the resolved image.
  try {
    view.dispatch({ effects: imageRenderEffect.of(null) });
  } catch {
    // View was destroyed
  }
}

// ---------------------------------------------------------------------------
// HTML escaping for error messages
// ---------------------------------------------------------------------------

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Image syntax parsing
// ---------------------------------------------------------------------------

const IMAGE_RE = /!\[([^\]]*)\]\(([^)]*)\)/;

/** Extract alt text and URL from an Image node's text content. */
export function parseImageSyntax(text: string): { alt: string; url: string } | null {
  const m = text.match(IMAGE_RE);
  if (!m) return null;
  return { alt: m[1], url: m[2] };
}

// ---------------------------------------------------------------------------
// ImageWidget
// ---------------------------------------------------------------------------

class ImageWidget extends WidgetType {
  constructor(
    readonly relUrl: string,
    readonly altText: string,
    readonly cached: CacheEntry | undefined,
  ) {
    super();
  }

  eq(other: ImageWidget): boolean {
    if (this.relUrl !== other.relUrl) return false;
    if (this.altText !== other.altText) return false;
    // Must compare cache state so CM re-renders DOM when async resolve completes
    if (this.cached === other.cached) return true;
    if (!this.cached || !other.cached) return false;
    if ("assetUrl" in this.cached && "assetUrl" in other.cached) {
      return this.cached.assetUrl === other.cached.assetUrl;
    }
    if ("error" in this.cached && "error" in other.cached) {
      return this.cached.error === other.cached.error;
    }
    return false;
  }

  toDOM(): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.className = "cm-image-widget";

    if (!this.cached) {
      wrapper.innerHTML = '<div class="cm-image-loading">Loading image\u2026</div>';
    } else if ("error" in this.cached) {
      wrapper.innerHTML = `<div class="cm-image-error">${escapeHtml(this.cached.error)}</div>`;
    } else {
      // SVG security: always render via <img>, never <object>/<embed>/<iframe>
      const img = document.createElement("img");
      img.src = this.cached.assetUrl;
      img.alt = this.altText;
      img.className = "cm-image-preview";
      img.draggable = false;
      wrapper.appendChild(img);
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

const imageRenderEffect = StateEffect.define<null>();

interface ImageDecoState {
  cursorLine: number;
  decos: DecorationSet;
  notePath: string;
}

/** Pending image URLs collected during buildImageDecos, consumed by updateListener. */
let pendingSources: Array<{ notePath: string; relUrl: string }> = [];

function buildImageDecos(
  state: EditorState,
  cursorLine: number,
  notePath: string,
): DecorationSet {
  const doc = state.doc;
  const tree = syntaxTree(state);

  // Collect all image decorations first, then sort by position
  const decoEntries: Array<{ pos: number; deco: Decoration }> = [];

  tree.iterate({
    enter(node) {
      if (node.name !== "Image") return;

      const imgLine = doc.lineAt(node.from).number;
      // When cursor is on the image line, show raw markdown (no preview)
      if (imgLine === cursorLine) return;

      const text = state.sliceDoc(node.from, node.to);
      const parsed = parseImageSyntax(text);
      if (!parsed || !parsed.url) return;

      const key = cacheKey(notePath, parsed.url);
      const cached = imageCache.get(key);
      if (!cached) {
        pendingSources.push({ notePath, relUrl: parsed.url });
      }

      // Place widget at end of the image line (block widget below the syntax)
      const line = doc.lineAt(node.to);
      decoEntries.push({
        pos: line.to,
        deco: Decoration.widget({
          widget: new ImageWidget(parsed.url, parsed.alt, cached),
          block: true,
          side: 1,
        }),
      });
    },
  });

  if (decoEntries.length === 0) return Decoration.none;

  // Sort by position (RangeSetBuilder requires sorted input)
  decoEntries.sort((a, b) => a.pos - b.pos);

  const builder = new RangeSetBuilder<Decoration>();
  for (const entry of decoEntries) {
    builder.add(entry.pos, entry.pos, entry.deco);
  }
  return builder.finish();
}

function createImageField(notePath: string) {
  return StateField.define<ImageDecoState>({
    create(state) {
      const cursorLine = state.doc.lineAt(state.selection.main.head).number;
      return {
        cursorLine,
        decos: buildImageDecos(state, cursorLine, notePath),
        notePath,
      };
    },
    update(value, tr) {
      const cursorLine = tr.state.doc.lineAt(tr.state.selection.main.head).number;
      const hasRenderEffect = tr.effects.some((e) => e.is(imageRenderEffect));
      if (!tr.docChanged && cursorLine === value.cursorLine && !hasRenderEffect) {
        return value;
      }
      return {
        cursorLine,
        decos: buildImageDecos(tr.state, cursorLine, notePath),
        notePath,
      };
    },
    provide: (f) => EditorView.decorations.from(f, (v) => v.decos),
  });
}

/**
 * UpdateListener that picks up pending image sources and triggers async resolution.
 * Runs after StateField.update, so pendingSources is populated.
 */
function createImageListener() {
  return EditorView.updateListener.of((update) => {
    if (pendingSources.length === 0) return;
    const sources = pendingSources.splice(0);
    for (const { notePath, relUrl } of sources) {
      resolveImage(notePath, relUrl, update.view);
    }
  });
}

// ---------------------------------------------------------------------------
// Public extension factory
// ---------------------------------------------------------------------------

/** Clear the image cache (e.g., on note change). */
export function clearImageCache(): void {
  imageCache.clear();
}

export function imageDecorations(notePath: string): Extension {
  return [createImageField(notePath), createImageListener()];
}

// ---------------------------------------------------------------------------
// Exports for testing
// ---------------------------------------------------------------------------

export { ImageWidget, buildImageDecos, imageCache, imageRenderEffect, cacheKey };
