# How to Add a CodeMirror Preview Widget (Cursor-Aware)

A "preview widget" replaces fenced code block source with a rendered preview (e.g., SVG, HTML) when the cursor is outside the block, and shows raw source when the cursor is inside. This is the pattern used by the TableWidget (tables) and MermaidWidget (mermaid diagrams).

## Reference implementation

`cmMermaidDecorations.ts` — follow this as the canonical example. The table widget in `cmMarkdownDecorations.ts` is another reference but is inline (not a separate file).

## Checklist

### 1. Identify the rendering library

- [ ] Choose the library that renders your language (e.g., `mermaid` for diagrams, `katex` for math)
- [ ] Add it to `crates/app/package.json` dependencies
- [ ] Run `npm install --cache /tmp/npm-cache` in `crates/app/`
- [ ] Consider **dynamic import** (`import("library")`) if the library is large (>500KB) to avoid bloating the initial bundle

### 2. Ensure `scanFencedBlocks` detects your language

- [ ] `scanFencedBlocks()` in `cmMarkdownDecorations.ts` returns `FencedBlock[]` with a `lang` field extracted from the opening fence (e.g., `` ```mermaid `` → `lang: "mermaid"`)
- [ ] The regex `FENCE_OPEN_RE` supports up to 3 spaces of indentation per CommonMark spec
- [ ] The closing fence detection uses `text.trim()` to handle indented closing fences
- [ ] **No changes needed** unless you need a language not captured by the existing scanner

### 3. Create the decoration extension file

- [ ] Create `crates/app/src/components/Editor/cm<Name>Decorations.ts`
- [ ] Follow the per-feature file convention (like `cmCalloutDecorations.ts`, `cmCheckboxDecorations.ts`, `cmMermaidDecorations.ts`)

### 4. Implement lazy loading + initialization

```typescript
type Module = { default: { initialize: (config: object) => void; render: (...) => Promise<...> } };
let mod: Module["default"] | null = null;
let loading: Promise<void> | null = null;

async function ensureLib(options: object): Promise<Module["default"]> {
  if (mod) return mod;
  if (!loading) {
    loading = import("library").then((m) => {
      mod = m.default;
      mod.initialize(options);
    });
  }
  await loading;
  return mod!;
}
```

Key points:
- Singleton pattern prevents multiple imports
- `initialize()` is called once with config (theme, security settings)
- To reset on theme change, set `mod = null; loading = null;` in `clearCache()`

### 5. Implement the render cache

```typescript
type CacheEntry = { html: string } | { error: string };
const cache = new Map<string, CacheEntry>();
const pending = new Set<string>();
```

- Key by **source text** — automatic invalidation when content changes
- Evict old entries if `cache.size > 50` to prevent memory leaks
- Use a `StateEffect` to signal decoration rebuild after async render completes

### 6. Implement the async render function

```typescript
async function renderSource(source: string, view: EditorView, ...): Promise<void> {
  if (cache.has(source) || pending.has(source)) return;
  pending.add(source);
  try {
    const lib = await ensureLib(...);
    const result = await lib.render(uniqueId, source);
    cache.set(source, { html: result });
  } catch (e) {
    cache.set(source, { error: e instanceof Error ? e.message : String(e) });
  } finally {
    pending.delete(source);
  }
  // Signal StateField to rebuild decorations
  try {
    view.dispatch({ effects: renderEffect.of(null) });
  } catch {
    // View may have been destroyed
  }
}
```

**Critical**: The `view.dispatch()` must be wrapped in try/catch because the view may be destroyed by the time the async render completes (user switched notes, theme changed).

### 7. Implement the WidgetType

```typescript
class MyWidget extends WidgetType {
  constructor(readonly source: string, readonly cached: CacheEntry | undefined) { super(); }

  eq(other: MyWidget): boolean {
    if (this.source !== other.source) return false;
    // MUST compare cache state — otherwise CM reuses DOM and loading state never updates
    if (this.cached === other.cached) return true;
    if (!this.cached || !other.cached) return false;
    // Compare by content type and value
    ...
  }

  toDOM(): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.className = "cm-my-widget";
    if (!this.cached) { /* loading placeholder */ }
    else if ("error" in this.cached) { /* error display with escapeHtml() */ }
    else { /* render the cached HTML/SVG */ }
    return wrapper;
  }

  get estimatedHeight(): number { return 200; }
  ignoreEvent(): boolean { return false; }
}
```

**Critical `eq()` rule**: Compare BOTH `source` and `cached` state. If you only compare `source`, CM6 sees widgets as equal and skips `toDOM()` — the loading placeholder is never replaced with the rendered content.

### 8. Implement the StateField

The StateField tracks cursor position and rebuilds decorations when needed.

```typescript
const renderEffect = StateEffect.define<null>();

function buildDecos(state: EditorState, cursorLine: number): DecorationSet {
  const blocks = scanFencedBlocks(state.doc).filter(b => b.lang === "mylang");
  if (blocks.length === 0) return Decoration.none;
  const builder = new RangeSetBuilder<Decoration>();
  for (const block of blocks) {
    if (cursorLine >= block.startLine && cursorLine <= block.endLine) continue; // cursor inside → raw
    const source = /* extract lines between fences */;
    const cached = cache.get(source);
    if (!cached) pendingSources.push(source); // queue for async render
    builder.add(from, to, Decoration.replace({ widget: new MyWidget(source, cached), block: true }));
  }
  return builder.finish();
}
```

**Critical**: `StateField.update` receives a `Transaction`, which does NOT have a `view` property. You cannot call `renderSource(source, tr.view, ...)` from the StateField — `tr.view` is `undefined`. Use the pending sources pattern below instead.

### 9. Trigger async renders via EditorView.updateListener

Since the StateField cannot access the view, collect pending sources in a module-level array and consume them in an `updateListener`:

```typescript
let pendingSources: string[] = [];

const listener = EditorView.updateListener.of((update) => {
  if (pendingSources.length === 0) return;
  const sources = pendingSources.splice(0);
  for (const source of sources) {
    renderSource(source, update.view, ...);
  }
});
```

### 10. (Optional) Add a ViewPlugin for live settings

If your widget has configurable settings (e.g., max height), use a ViewPlugin to subscribe to the store and update existing DOM elements:

```typescript
const settingsPlugin = ViewPlugin.define((view) => {
  const unsub = useUIStore.subscribe(
    (s) => s.mySetting,
    (value) => {
      view.dom.querySelectorAll<HTMLElement>(".cm-my-widget ...").forEach((el) => {
        el.style.someProperty = `${value}px`;
      });
    },
  );
  return { destroy: unsub };
});
```

### 11. Export the extension factory

```typescript
export function myDecorations(isDark: boolean): Extension {
  return [stateField, updateListener, settingsPlugin];
}

export function clearMyCache(): void {
  cache.clear();
  mod = null;
  loading = null;
}
```

### 12. Register in MarkdownEditor.tsx

- [ ] Import `myDecorations` and `clearMyCache`
- [ ] Call `clearMyCache()` before building extensions (handles theme changes)
- [ ] Add `myDecorations(isDark)` inside the `if (!raw)` block, after `markdownDecorations()`

### 13. (Optional) Add a slash command

- [ ] Add an icon to `ICON_PATHS` in `cmSlashCommands.ts`
- [ ] Add a command entry to `SLASH_COMMANDS` in the "Blocks" section
- [ ] Template should insert a minimal valid example so the user sees output immediately
- [ ] Update `STATIC_COMMAND_COUNT` in `cmSlashCommands.test.ts`

### 14. (Optional) Render in MarkdownPreview

- [ ] Add a `code` component override in `MarkdownPreview.tsx`'s `components` useMemo
- [ ] Detect `className="language-mylang"` and render via a dedicated component
- [ ] Use `extractTextContent()` (already exists) to get raw text from React children
- [ ] Lazy-load the rendering library in a `useEffect`

### 15. Add CSS styles

- [ ] Add styles in `crates/app/src/App.css`
- [ ] Widget container: `.editor-body .cm-editor .cm-my-widget`
- [ ] Loading state: `.cm-my-loading` (muted italic)
- [ ] Error state: `.cm-my-error` (red monospace with tinted background)
- [ ] **NEVER add margin or padding to `.cm-line` elements** — breaks CM6 mouse hit-testing

### 16. (Optional) Add a configurable setting

- [ ] Add to `PersistedPrefs` interface in `uiStore.ts`
- [ ] Add default constant (e.g., `export const DEFAULT_MY_SETTING = ...`)
- [ ] Add to `UIState` interface (property + setter)
- [ ] Initialize from `storedPrefs` in store creation
- [ ] Implement setter with `set()` + `savePrefs()`
- [ ] Add UI controls in `SettingsModal.tsx`
- [ ] Do NOT add to MarkdownEditor's `useEffect` deps if it only affects styling — read from store in the widget or use a ViewPlugin to avoid editor recreation

### 17. Write tests

- [ ] Create `cm<Name>Decorations.test.ts` with tests for:
  - `scanFencedBlocks` returns correct `lang` for your language
  - Widget `eq()` correctness (same source+cache → true, different → false, loading vs rendered → false)
  - Widget `toDOM()` renders loading, error, and success states
  - Widget `estimatedHeight` returns expected value
- [ ] Update `cmSlashCommands.test.ts` if a slash command was added
- [ ] Run `npx vitest run` from `crates/app/`

## Pitfalls learned from the mermaid implementation

| Pitfall | Explanation |
|---------|-------------|
| `Transaction` has no `view` | `StateField.update` receives a `Transaction`, not a `ViewUpdate`. Use `EditorView.updateListener` to access the view for async operations. |
| `Widget.eq()` must compare cache | If `eq()` only compares `source`, CM6 reuses the old DOM and the loading state is never replaced with the rendered content. |
| `view.dispatch()` after `await` | The view may be destroyed. Always wrap in try/catch. |
| Indented fences | `scanFencedBlocks` regex must allow up to 3 spaces of leading indentation (CommonMark spec). Closing fences must be trimmed on both ends. |
| Mermaid SVG hardcodes width | `mermaid.render()` sets a `width` attribute on the SVG. Remove it with `svg.removeAttribute("width")` so CSS constraints apply. |
| Settings in `useEffect` deps | Adding a styling-only setting to the editor's `useEffect` dependency array causes full editor recreation (losing scroll/cursor). Read from store in the widget instead, or use a ViewPlugin for live updates. |
| Dynamic import for large libs | Libraries like mermaid (~2MB) should be loaded via `import("mermaid")` at first use, not statically imported. |
| `securityLevel: "strict"` | Always use strict security for libraries that parse user content to prevent XSS. |

## File summary

| File | Role |
|------|------|
| `cm<Name>Decorations.ts` | StateField + Widget + async render + cache + ViewPlugin |
| `cmMarkdownDecorations.ts` | `scanFencedBlocks()` with `lang` field (shared) |
| `cmSlashCommands.ts` | `/command` to insert template |
| `MarkdownEditor.tsx` | Register extension |
| `MarkdownPreview.tsx` | Render in read-only preview |
| `App.css` | Widget + preview styles |
| `uiStore.ts` | Configurable settings |
| `SettingsModal.tsx` | Settings UI |
| `cm<Name>Decorations.test.ts` | Unit tests |
