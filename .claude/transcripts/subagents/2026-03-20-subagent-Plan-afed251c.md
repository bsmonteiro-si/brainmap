# 2026-03-20 — Subagent Transcript: Plan

**Date:** 2026-03-20 12:15:43
**Agent:** Plan
**Agent ID:** afed251c043a3f374
**Parent Session:** cac0aae8-c235-4b83-9e42-e4dc7c9c5540

---

## User

I'm planning to add syntax highlighting to code blocks in a Tauri v2 + React + CodeMirror 6 markdown editor app (BrainMap). The app has two modes:

1. **Edit mode** - CodeMirror 6 with markdown language support. Fenced code blocks are detected in `cmMarkdownDecorations.ts` using a `scanFencedBlocks()` function that walks the syntax tree. Lines inside fenced blocks get `.cm-fenced-code` CSS class via line decorations.

2. **Preview mode** - React Markdown (`react-markdown`) renders the markdown. Code blocks render as `<pre><code class="language-xxx">`. Component is in `MarkdownPreview.tsx`.

Current state:
- No syntax highlighting library is installed
- CodeMirror uses `@codemirror/lang-markdown` for markdown parsing
- The `buildMarkdownHighlight()` function in `MarkdownEditor.tsx` only styles markdown-level tokens (headings, emphasis, etc.) via `HighlightStyle.define()`
- `package.json` is at `crates/app/package.json`

I need a plan for adding syntax highlighting. Consider:

**For Preview mode:**
- Shiki (lightweight, VS Code themes, works well with React) vs Prism vs highlight.js
- Shiki is probably best — it's tree-shakeable, uses TextMate grammars (same as VS Code), and has great theme support

**For Edit mode (CodeMirror):**
- CodeMirror has `@codemirror/language` with nested language support
- The markdown language can be configured with `codeLanguages` option to enable syntax highlighting inside fenced blocks
- This would require importing language packages for common languages

**Questions to answer:**
1. What's the best library for preview mode syntax highlighting?
2. For edit mode, can we use CodeMirror's built-in `codeLanguages` support with `@codemirror/lang-markdown`?
3. Which languages should we support? (JS/TS, Python, Rust, Go, HTML/CSS, JSON, YAML, SQL, Bash at minimum)
4. How to keep bundle size reasonable?
5. Can we share themes between edit and preview modes?

Provide a concrete implementation plan with specific packages to install and files to modify.

---

## Assistant



I'll explore the codebase to understand the current setup before designing the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/*.{ts,tsx}"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Preview/*.{ts,tsx}"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts"}`

---

## Assistant

Now let me check the `@codemirror/lang-markdown` API for `codeLanguages` and look at the CSS for code blocks.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"codeLanguages","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.css"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","limit":50}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cm-fenced-code","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":3}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"language-","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":3}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pre.*code|code.*pre","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":3}`

---

## Assistant

Now let me check the `@codemirror/lang-markdown` version and what `@lezer/markdown` exports to understand the `codeLanguages` API.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@codemirror/lang-markdown/dist/ 2>/dev/null | head -5","description":"List lang-markdown dist files"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"codeLanguages","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@codemirror/lang-markdown/dist","output_mode":"content","-C":3}`

---

## Assistant

Good. Now let me check if `@codemirror/language-data` exists (it provides `languages` array with all LanguageDescription objects for codeLanguages), and look at the vite config for bundle considerations.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@codemirror/language-data 2>/dev/null && echo \"EXISTS\" || echo \"NOT INSTALLED\"","description":"Check if language-`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/vite.config.ts"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"md-preview pre","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":10}`

---

## Assistant

Now let me check the EditorPanel to understand the edit/preview toggle mechanism.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx","limit":60}`

---

## Assistant

I have all the information needed. Here is the implementation plan.

---

## Implementation Plan: Syntax Highlighting for Code Blocks

### Answers to Your Questions

**1. Best library for preview mode?**
Shiki is the right choice. It uses TextMate grammars (VS Code-compatible), is tree-shakeable, supports async loading of grammars/themes, and integrates cleanly with React via its `codeToHtml()` API. The alternative `rehype-shiki` plugin exists but a custom `code` component gives more control (you already have a custom `code` component for mermaid blocks). Prism and highlight.js are older and use regex-based tokenizers with lower fidelity.

**2. Can we use CodeMirror's built-in `codeLanguages` support?**
Yes. The `markdown()` function from `@codemirror/lang-markdown` accepts a `codeLanguages` option that takes either a `LanguageDescription[]` array or a callback function `(info: string) => Language | LanguageDescription | null`. The `@codemirror/language-data` package exports a `languages` array containing `LanguageDescription` objects for 100+ languages, each with lazy-loading -- grammars are only fetched when a matching fenced block is encountered. This is the canonical approach and it works with the existing `syntaxHighlighting()` call. The existing `buildMarkdownHighlight()` only styles markdown-level tokens; code tokens will be styled by CodeMirror's default highlight style or a custom one you provide.

**3. Which languages to support?**
By using `@codemirror/language-data`, you get lazy-loaded support for all 100+ languages without paying upfront bundle cost. The `LanguageDescription.matchLanguageName()` method handles aliases (e.g., "js" maps to JavaScript, "ts" to TypeScript, "py" to Python, "rs" to Rust, "sh"/"bash" to Shell, etc.). No need to manually curate a list.

**4. Bundle size?**
- `@codemirror/language-data` is ~15KB gzipped (just metadata/descriptions). Individual language parsers are loaded lazily on demand via dynamic imports.
- Shiki uses WASM-based TextMate grammars. Using `createHighlighter()` with explicit language/theme lists keeps initial load small. Shiki's core is ~15KB gzipped; each grammar is loaded on demand. For preview mode, lazy-loading per-language is natural since preview rendering is already async (see the mermaid pattern).
- Total initial cost: ~30KB gzipped for both libraries' cores, with grammars loaded on demand.

**5. Shared themes?**
Partial sharing is possible but not worth the complexity. CodeMirror uses `HighlightStyle.define()` with `@lezer/highlight` tags, while Shiki uses VS Code TextMate themes. The visual alignment approach is: pick a Shiki theme that closely matches the CodeMirror highlight style, then fine-tune CSS variables so code blocks look consistent across modes. Specifically:
- Edit mode: Use `@codemirror/theme-one-dark` (already installed) plus `defaultHighlightStyle` from `@codemirror/language` for the light theme. These style code tokens inside fenced blocks.
- Preview mode: Use Shiki's `one-dark-pro` theme for dark and `github-light` for light. These produce very similar colors.

### Package Installations

```
npm install shiki @codemirror/language-data
```

That is it -- two packages. `@codemirror/language-data` brings in `@codemirror/language` (already installed) and lazy-loads individual `@codemirror/lang-*` packages on demand.

### Implementation Steps

#### Step 1: Edit Mode -- Wire `codeLanguages` into CodeMirror

**File: `crates/app/src/components/Editor/MarkdownEditor.tsx`**

Current code on line 144:
```ts
markdown({ extensions: GFM }),
```

Change to:
```ts
import { languages } from "@codemirror/language-data";
import { defaultHighlightStyle } from "@codemirror/language";

// In the extensions array:
markdown({ extensions: GFM, codeLanguages: languages }),
syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
```

The `defaultHighlightStyle` with `fallback: true` provides colors for code tokens (keywords, strings, comments, etc.) when no other highlight style matches. It works for both light and dark themes because it uses reasonable neutral colors. The existing `buildMarkdownHighlight()` call stays -- it handles markdown-level tokens (headings, emphasis). The `defaultHighlightStyle` acts as a fallback for code tokens only.

For better dark-mode code highlighting, also import `oneDarkHighlightStyle` from `@codemirror/theme-one-dark` (already installed) and conditionally use it:

```ts
import { oneDarkHighlightStyle } from "@codemirror/theme-one-dark";

// Inside the useEffect, after isDark is determined:
const codeHighlight = isDark ? oneDarkHighlightStyle : defaultHighlightStyle;
// Add to extensions:
syntaxHighlighting(codeHighlight, { fallback: true }),
```

That is the entire edit-mode change. CodeMirror handles everything else: when it encounters `` ```rust `` or `` ```python ``, it looks up the language in the `languages` array, lazy-loads the parser, and applies syntax highlighting using the active highlight style.

#### Step 2: Preview Mode -- Add Shiki highlighting

**New file: `crates/app/src/utils/shikiHighlighter.ts`**

Create a singleton lazy-initialized Shiki highlighter:

```ts
import { createHighlighter, type Highlighter } from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;
const loadedLangs = new Set<string>();

// Core languages to preload; others loaded on demand
const PRELOAD_LANGS = ["javascript", "typescript", "python", "rust", "bash", "json", "html", "css"];

export function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-light", "one-dark-pro"],
      langs: PRELOAD_LANGS,
    });
    for (const l of PRELOAD_LANGS) loadedLangs.add(l);
  }
  return highlighterPromise;
}

export async function highlightCode(code: string, lang: string, isDark: boolean): Promise<string> {
  const highlighter = await getHighlighter();
  const theme = isDark ? "one-dark-pro" : "github-light";

  // Dynamically load language if not yet loaded
  if (lang && !loadedLangs.has(lang)) {
    try {
      await highlighter.loadLanguage(lang as any);
      loadedLangs.add(lang);
    } catch {
      lang = "text"; // fallback for unknown languages
    }
  }

  return highlighter.codeToHtml(code, { lang: lang || "text", theme });
}
```

**File: `crates/app/src/components/Editor/MarkdownPreview.tsx`**

Modify the existing `code` component (lines 274-291). Currently it checks for mermaid and renders plain `<code>` otherwise. Add Shiki highlighting for non-mermaid code blocks:

Create a new component `HighlightedCodeBlock` that:
1. Takes `code`, `lang`, and `isDark` props
2. Uses `useState` + `useEffect` to call `highlightCode()` asynchronously
3. Renders `dangerouslySetInnerHTML` with the Shiki output (which is a complete `<pre><code>` block)
4. Shows the raw code as fallback while Shiki loads (no flash of unstyled content -- the code is visible immediately, just without colors)

The `code` component in the `components` useMemo becomes:

```ts
code: ({ className, children, ...props }) => {
  const match = className?.match(/language-(\w+)/);
  const lang = match?.[1];
  
  if (lang === "mermaid") {
    const source = extractTextContent(React.Children.toArray(children)).trim();
    return <MermaidPreviewBlock source={source} />;
  }
  
  // Fenced code block (has language class from react-markdown)
  if (lang) {
    const source = extractTextContent(React.Children.toArray(children)).trim();
    return <HighlightedCodeBlock code={source} lang={lang} />;
  }
  
  // Inline code or no language specified
  return <code className={className} {...props}>{children}</code>;
},
```

The `HighlightedCodeBlock` component (defined in the same file or extracted):

```ts
function HighlightedCodeBlock({ code, lang }: { code: string; lang: string }) {
  const effectiveTheme = useUIStore((s) => s.effectiveEditorTheme);
  const isDark = THEME_BASE[effectiveTheme] === "dark";
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    highlightCode(code, lang, isDark).then((result) => {
      if (!cancelled) setHtml(result);
    });
    return () => { cancelled = true; };
  }, [code, lang, isDark]);

  if (!html) {
    // Fallback: plain code while loading
    return <code className={`language-${lang}`}>{code}</code>;
  }

  return <div className="shiki-code-block" dangerouslySetInnerHTML={{ __html: html }} />;
}
```

#### Step 3: CSS Adjustments

**File: `crates/app/src/App.css`**

Add styles to ensure Shiki output integrates with existing preview styling:

```css
/* Shiki code blocks in preview */
.md-preview .shiki-code-block pre {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 14px 16px;
  overflow-x: auto;
  margin: 0 0 1em;
}

.md-preview .shiki-code-block pre code {
  font-family: ui-monospace, 'Menlo', 'Monaco', 'Consolas', monospace;
  font-size: 0.87em;
  background: none;
  border: none;
  padding: 0;
}

/* Override Shiki's inline background-color so our theme variables control it */
.md-preview .shiki-code-block pre.shiki {
  background-color: var(--bg-secondary) !important;
}
```

No changes needed for edit mode CSS -- the existing `.cm-fenced-code` background and border styles remain. CodeMirror applies syntax highlighting via inline `<span>` styles generated by the highlight style, which layer on top of the line decorations.

#### Step 4: Handle Code Blocks Without Language Specifier

For fenced blocks without a language (`` ``` `` with no info string), both modes already handle this gracefully:
- Edit mode: `codeLanguages` returns null, no syntax highlighting applied, just the `.cm-fenced-code` background
- Preview mode: `lang` will be undefined, the `code` component falls through to plain rendering

No special handling needed.

#### Step 5: Tests

**New file: `crates/app/src/utils/shikiHighlighter.test.ts`**

Test the singleton pattern and language fallback:
- `getHighlighter()` returns the same promise on multiple calls
- `highlightCode("const x = 1", "javascript", false)` returns HTML containing syntax spans
- `highlightCode("code", "nonexistent-lang", false)` falls back to "text" without throwing

**Update file: `crates/app/src/components/Editor/MarkdownPreview.test.tsx`**

Add test cases for the `HighlightedCodeBlock` component:
- Renders fallback code while loading
- Renders Shiki HTML after async load completes
- Mermaid blocks still render as `MermaidPreviewBlock` (regression check)

**No new edit-mode tests needed** -- the `codeLanguages` integration is internal to CodeMirror's markdown parser. Existing tests in `cmMarkdownDecorations.test.ts` cover fenced block detection, and CodeMirror's own tests cover `codeLanguages` parsing.

### Dependency Graph

```
Step 1 (edit mode) and Step 2 (preview mode) are independent -- can be done in parallel.
Step 3 (CSS) depends on Step 2.
Step 5 (tests) depends on Steps 1 and 2.
```

### Potential Challenges

1. **Shiki WASM loading in Tauri WebView**: Shiki uses WASM for its TextMate grammar engine. In Tauri's WKWebView, WASM should work fine since it is a standard web API. However, if CSP headers block `wasm-eval`, you would need to add `'wasm-unsafe-eval'` to the Tauri security config. Check `crates/app/src-tauri/tauri.conf.json` for CSP settings.

2. **Shiki theme background vs CSS variable conflict**: Shiki embeds background colors in its `<pre>` output. The CSS override with `!important` on `.shiki` handles this, ensuring the app's theme variables control the background.

3. **Initial load latency for preview**: The first time preview mode is shown, Shiki needs to load its WASM engine plus the requested grammar. This is why the `HighlightedCodeBlock` shows plain code immediately and swaps in highlighted code when ready -- same pattern as the existing `MermaidPreviewBlock`.

4. **Memory**: The Shiki highlighter singleton persists for the app lifetime. This is fine for a desktop app -- it avoids repeated initialization costs.

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx` - Add `codeLanguages` and code highlight style to the `markdown()` config (line 144) and extensions array
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx` - Add `HighlightedCodeBlock` component and modify the `code` component handler (lines 274-291)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` - Add Shiki output styling rules and background override near the existing `.md-preview pre` rules (around line 2717)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json` - Add `shiki` and `@codemirror/language-data` dependencies
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/shikiHighlighter.ts` - New file: singleton Shiki highlighter with lazy language loading

---

