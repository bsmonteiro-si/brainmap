# 2026-03-20 — Subagent Transcript: Plan

**Date:** 2026-03-20 14:58:11
**Agent:** Plan
**Agent ID:** a51c34fb593247a5d
**Parent Session:** 03338391-a7ed-4136-8e14-ffc6fba3a09a

---

## User

Plan improvements to code block rendering in the BrainMap app to achieve IntelliJ-like syntax highlighting and presentation. This affects both Edit mode (CodeMirror 6) and Preview mode (React Markdown).

## Current State

### Edit Mode (CodeMirror 6)
- File: `crates/app/src/components/Editor/MarkdownEditor.tsx`
- Uses `markdown({ extensions: GFM, codeLanguages: languages })` with `@codemirror/language-data`
- Has `syntaxHighlighting(buildMarkdownHighlight(isDark))` (markdown-only: headings, emphasis, etc.)
- Has `syntaxHighlighting(isDark ? oneDarkHighlightStyle : defaultHighlightStyle, { fallback: true })` as fallback
- `cmMarkdownDecorations.ts` adds line classes (`cm-fenced-code`, `cm-fenced-code-start`, `cm-fenced-code-end`) and a `CodeLangBadgeWidget` showing language badge
- CSS in App.css gives code blocks a background, border, and border-radius
- **PROBLEM**: Despite the setup, the user's screenshot shows code block content as plain monochrome text — no syntax colors

### Preview Mode (React Markdown)
- File: `crates/app/src/components/Editor/MarkdownPreview.tsx`
- Uses `rehype-highlight` v7.0.2 with `{ ignoreMissing: true }`
- CSS has a custom hljs theme with color-mix variables for ~12 token types
- `pre` component override wraps code blocks in `.code-block-wrapper` with a `.code-lang-badge`
- **PROBLEM**: Similar lack of visible syntax highlighting in user's screenshot

### What IntelliJ Does (user's reference - second screenshot)
- Full syntax highlighting with distinct colors per token type (keywords=purple, strings=green, comments=gray-italic, etc.)
- Line numbers inside code blocks
- Clean code block container with subtle background
- Language-specific rendering

## What Needs Investigation / Fixing

1. **Edit mode syntax highlighting**: The CM6 setup with `codeLanguages: languages` SHOULD provide nested language parsing and highlighting. The `oneDarkHighlightStyle` fallback SHOULD color those tokens. Need to investigate why it's not working:
   - Is the `@codemirror/language-data` lazy loading succeeding?
   - Are the highlight styles reaching the code block tokens?
   - Could the `buildMarkdownHighlight` be intercepting/blocking the fallback for code tokens?
   - Could CSS be overriding token colors (e.g., `cm-fenced-code` background or color rules)?

2. **Preview mode syntax highlighting**: `rehype-highlight` should work. Need to verify:
   - Are the hljs classes being added to the rendered HTML?
   - Is the CSS correctly targeting them?
   - Could there be a specificity issue where `.md-preview pre code` color overrides hljs classes?

3. **Visual improvements** for both modes to be more IntelliJ-like.

## Key Constraints
- CLAUDE.md rule: NEVER add margin or padding to `.cm-line` — use block widget decorations instead
- Must work with existing dark/light theme system using CSS variables
- Must not break Mermaid diagram rendering in code blocks
- Should be consistent between Edit and Preview modes

Please provide a detailed implementation plan addressing all these issues. Focus on what specific code changes are needed in which files.

---

## Assistant



I'll investigate the codebase thoroughly to understand the current state and identify the root causes of the syntax highlighting issues.

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

Now let me look at the CSS to understand the styling situation.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cm-fenced-code|hljs|code-block-wrapper|code-lang-badge","glob":"*.css","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"@codemirror/language-data","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cm-fenced-code|hljs|code-block-wrapper|code-lang-badge|\\.ͼ|tok-","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-n":true,"context":3}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && cat package.json | grep -E \"codemirror|lezer|highlight|rehype-highlight\"","description":"Check relevant package versions"}`

---

## Assistant

Now let me check if there's a CSS color override issue and look at the full code block CSS section more carefully.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1130,"limit":80}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.cm-editor.*color|\\.cm-content.*color|\\.cm-line.*color|monospace|font-family.*mono","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content",`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pre code|pre |\\.md-preview pre|\\.md-preview code","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-n":true,"context":2}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":2724,"limit":30}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"ͼ|tok-|--cm-.*color","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-n":true}`

---

## Assistant

Now I have a clear picture of the root causes. Let me check the CSS variable definitions and look at whether there's a `color` rule on `.cm-line` within fenced code that would override syntax tokens.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"--text-primary|--bg-secondary|--bg-primary","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-n":true,"head_limit":30}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cm-fenced-code.*color|\\.ͼ","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-n":true}`

---

## Assistant

Good -- no explicit `color` on `.cm-fenced-code`. Now let me understand the CM6 highlight style mechanism more precisely. The key question is whether the `oneDarkHighlightStyle` / `defaultHighlightStyle` actually targets the right tags for nested language tokens. Let me also check if there are any CSS `!important` rules overriding token colors.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"color.*!important","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && ls node_modules/@codemirror/language-data/dist/ 2>/dev/null | head -5","description":"Check language-data dist files"}`

---

## Assistant

Let me check lines 1086-1110 more closely -- those `!important` rules on `.cm-editor` colors could be relevant.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1075,"limit":45}`

---

## Assistant

Found the smoking gun. Line 1087: `.editor-body .cm-editor { color: var(--text-primary) !important; }` -- this is overriding ALL syntax highlighting colors in the editor, including nested language tokens. The `!important` on `color` means CM6's inline styles from `syntaxHighlighting()` (which apply via `style` attributes on `<span>` elements) will be defeated because `!important` in a stylesheet beats inline styles.

Now let me verify how CM6 applies highlight styles -- it uses classes or inline styles.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && head -30 node_modules/@codemirror/language/dist/index.js 2>/dev/null; echo \"---\"; grep -n \"style\\|className\\|class \" node`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && grep -n \"HighlightStyle\\|module\\|class.*rule\\|className\" node_modules/@codemirror/language/dist/index.js 2>/dev/null | gre`

---

## Assistant

CM6 uses `StyleModule` (from `style-mod`) which generates CSS class names and a `<style>` element. It does NOT use inline styles. So the `!important` on `.editor-body .cm-editor { color: ... !important }` would cascade down to all child `<span>` elements. But the generated classes from `HighlightStyle.define()` should also have `color` rules. The question is specificity: `.editor-body .cm-editor` (2 classes) vs the generated `.ͼXX` (1 class). With `!important` on the parent, child spans inherit it. But `color` on a child element (even without `!important`) overrides an inherited `!important` -- CSS inheritance doesn't carry `!important`.

Actually, wait. The `!important` on `.cm-editor` sets the `color` property on the `.cm-editor` element itself. Child elements inherit `color` as a default, but any explicit `color` rule on a child (even without `!important`) overrides the inherited value. So the `!important` is NOT the root cause for syntax highlighting inside code blocks.

Let me think more carefully about what could go wrong. The `codeLanguages: languages` setup uses lazy loading -- the language grammar is loaded on demand. If the language grammar doesn't load (e.g., network issues in Tauri, or the dynamic import fails), the tokens won't be parsed, and there will be no highlight classes to style.

Let me check if there's an issue with how the language data loads in a Tauri context.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && grep -c \"load\\|import\\|require\" node_modules/@codemirror/language-data/dist/index.js 2>/dev/null","description":"Check lang`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && grep \"import(\" node_modules/@codemirror/language-data/dist/index.js 2>/dev/null | head -10","description":"Check how language`

---

## Assistant

These are dynamic `import()` calls. In a Vite build, these become code-split chunks. They should work fine in Tauri since the frontend is served from local files. But the key issue is that **language parsing is async** -- the grammar loads lazily, and CM6 re-highlights once the grammar is available. However, there's a subtlety: the editor is fully recreated whenever `notePath` or `effectiveTheme` changes (the `useEffect` dependency array at line 234). If the async grammar loading completes after the component already unmounted and re-created, the old editor instance gets the grammar but it's already destroyed.

Actually, that's normal CM6 behavior and should work fine. Let me look at this from a different angle -- maybe the `buildMarkdownHighlight` is catching code tokens via the `monospace` tag.

Looking at line 69: `{ tag: tags.monospace, fontFamily: "...", fontSize: "0.88em" }` -- this targets `tags.monospace`. In CM6's markdown parser, text inside fenced code blocks gets tagged with various tags depending on the nested parser. If there's no nested parser loaded yet, the content is tagged as `monospace` by the markdown parser. The `buildMarkdownHighlight` style rule for `monospace` only sets `fontFamily` and `fontSize`, NOT `color`. So that's fine.

But wait -- the `syntaxHighlighting` extension with `{ fallback: true }` on `oneDarkHighlightStyle` / `defaultHighlightStyle`. The `fallback` option means it only applies if no other `HighlightStyle` has claimed the token. Since `buildMarkdownHighlight` claims `tags.monospace` (even though it only sets font properties, not color), the fallback won't apply to `monospace` tokens. But that's about uncolored markdown code text, not nested language tokens.

For nested language tokens (e.g., `tags.keyword`, `tags.string`), the `buildMarkdownHighlight` does NOT define rules for those tags, so the fallback (`oneDarkHighlightStyle` / `defaultHighlightStyle`) SHOULD apply. This means if the language grammar loads, the tokens should get colored.

The most likely root cause is that **the language grammars are not being loaded/parsed in time or at all**. Let me check if the packages are actually installed.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && ls node_modules/@codemirror/lang-javascript/dist/ 2>/dev/null && ls node_modules/@codemirror/lang-python/dist/ 2>/dev/null && l`

---

## Assistant

The packages are installed. Let me re-examine the `syntaxHighlighting` setup. There's an important detail about how `fallback: true` works.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && grep -A 20 \"function syntaxHighlighting\" node_modules/@codemirror/language/dist/index.js 2>/dev/null","description":"Check sy`

---

## Assistant

I see something important. Look at the `syntaxHighlighting` code: when a `HighlightStyle` has a `themeType`, it's conditionally applied based on `EditorView.darkTheme`. The `oneDarkHighlightStyle` has `themeType: "dark"`. The `defaultHighlightStyle` has `themeType: "light"` (or none).

But in the current code at line 148:
```
syntaxHighlighting(isDark ? oneDarkHighlightStyle : defaultHighlightStyle, { fallback: true })
```

Since `{ fallback: true }` is passed, the `themeType` branch is NOT taken -- it goes into the `fallback` branch instead. So the themeType conditional is bypassed -- good.

But there's another subtlety: the `treeHighlighter` is pushed every time `syntaxHighlighting` is called. Line 147 calls `syntaxHighlighting(buildMarkdownHighlight(isDark))` and line 148 calls `syntaxHighlighting(isDark ? ...)`. Both push `treeHighlighter`. Let me check if that causes issues.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && grep -B2 -A30 \"treeHighlighter\" node_modules/@codemirror/language/dist/index.js 2>/dev/null | head -50","description":"Check `

---

## Assistant

The `treeHighlighter` is wrapped in `Prec.high` and is a `ViewPlugin`. Since it's the same reference (`treeHighlighter` is a module-level singleton), CM6 should deduplicate it. This should not be an issue.

Now let me look at the actual `HighlightStyle` definitions more carefully to understand what CSS classes they generate.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && grep -A 50 \"const defaultHighlightStyle\" node_modules/@codemirror/language/dist/index.js 2>/dev/null | head -60","description`

---

## Assistant

OK so `defaultHighlightStyle` defines colors for `keyword`, `string`, `comment`, etc. These should apply when the nested language parser produces those tags. 

Let me reconsider. The issue might actually be that the `buildMarkdownHighlight` HighlightStyle (line 147) is registered as a non-fallback highlighter, and `oneDarkHighlightStyle` / `defaultHighlightStyle` is registered as a fallback. The `highlightingFor` function iterates all non-fallback highlighters first, and only if none match does it check fallbacks. But `buildMarkdownHighlight` only defines rules for `heading1-4`, `emphasis`, `strong`, `strikethrough`, and `monospace`. For `tags.keyword` inside a code block, it would NOT match in `buildMarkdownHighlight`, so the fallback SHOULD kick in.

Wait -- let me re-read the `highlightingFor` logic more carefully.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && grep -B5 -A30 \"function getHighlighters\\|function highlightingFor\\|class TreeHighlighter\" node_modules/@codemirror/language`

---

## Assistant

**Found the root cause for Edit mode.**

Look at `getHighlighters`:
```javascript
function getHighlighters(state) {
    let main = state.facet(highlighterFacet);
    return main.length ? main : state.facet(fallbackHighlighter);
}
```

This is an **either/or** -- if there are ANY non-fallback highlighters, the fallback is NEVER consulted. 

In the current code:
- Line 147: `syntaxHighlighting(buildMarkdownHighlight(isDark))` -- this is registered as a **non-fallback** highlighter (no `{ fallback: true }` option, and `buildMarkdownHighlight` returns a plain `HighlightStyle` with no `themeType`). It goes into `highlighterFacet`.
- Line 148: `syntaxHighlighting(isDark ? oneDarkHighlightStyle : defaultHighlightStyle, { fallback: true })` -- this goes into `fallbackHighlighter`.

Since `highlighterFacet` has `buildMarkdownHighlight` in it (non-empty), `getHighlighters` returns ONLY `[buildMarkdownHighlight]`. The fallback `oneDarkHighlightStyle` / `defaultHighlightStyle` is NEVER used.

And `buildMarkdownHighlight` only defines styles for `heading1-4`, `emphasis`, `strong`, `strikethrough`, and `monospace`. It has NO rules for `keyword`, `string`, `comment`, `number`, `typeName`, etc. So nested language tokens in code blocks get NO color.

**This is the bug.** The fix is to either:
1. Make `buildMarkdownHighlight` NOT a fallback, but also include the code highlighting rules (merge them), or
2. Register `oneDarkHighlightStyle`/`defaultHighlightStyle` as a non-fallback too (remove `{ fallback: true }`), or  
3. Register `buildMarkdownHighlight` as a fallback too, and register the code theme as non-fallback.

The simplest fix: remove `{ fallback: true }` from line 148. Both highlighter styles would be non-fallback, and `getHighlighters` would return both. The `highlightingFor` function iterates all highlighters and unions their classes. Both would apply.

Now let me check the Preview mode issue.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":2724,"limit":80}`

---

## Assistant

**Found the Preview mode issue.**

Line 2746: `.md-preview pre code { color: var(--text-primary); }` -- this rule has specificity `(0, 3, 1)` (3 classes + 1 element). 

The hljs rules like `.hljs-keyword` have specificity `(0, 1, 0)` (1 class). The `.md-preview pre code` rule wins by specificity and sets `color: var(--text-primary)` on the `<code>` element. The hljs classes are applied to `<span>` elements inside the `<code>`, so they should actually work because `color` on a `<span>` overrides inherited `color` from the parent `<code>`.

Wait -- actually the hljs classes ARE on the `<span>` children. `.hljs-keyword` on a `<span>` directly sets `color`, which overrides the inherited color from `.md-preview pre code`. So the hljs highlighting SHOULD work in preview mode unless rehype-highlight is not adding the classes.

Let me check if rehype-highlight is actually being loaded correctly and if there's a CSS specificity issue with the `.md-preview .hljs` rule vs the `.md-preview pre code` rule.

Actually, looking more carefully: `.md-preview .hljs { background: transparent; }` -- this targets `code.hljs` (rehype-highlight adds the `hljs` class to the `<code>` element). The hljs token classes like `.hljs-keyword` are on nested `<span>` elements. They have specificity `(0,1,0)`. Since they're directly on the span, their `color` property should work.

But wait -- are the `.hljs-title\.class_` selectors valid CSS? The escaped dot `.hljs-title\.class_` -- that would match an element with class `hljs-title.class_` (the literal class name containing a dot). This is valid CSS but let me double check if hljs actually uses those class names.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && grep \"hljs-title\" node_modules/highlight.js/styles/default.css 2>/dev/null | head -5; echo \"---\"; grep \"title\\.class\" no`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && grep \"title\" node_modules/highlight.js/lib/languages/javascript.js 2>/dev/null | head -10","description":"Check hljs JS langu`

---

## Assistant

So hljs uses CSS class names like `hljs-title` with a subclass `.class_` applied as `hljs-title class_`. Let me check the actual rendered output format.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && node -e \"const hljs = require('highlight.js'); const result = hljs.highlight('function hello() {}', {language: 'javascript'});`

---

## Assistant

So the CSS class is `hljs-title function_` (two separate classes on one element). The CSS selector `.hljs-title\.function_` in App.css tries to escape a dot, but the actual class name doesn't contain a dot -- it's two separate classes: `hljs-title` and `function_`. The correct CSS selector would be `.hljs-title.function_`.

The escaped dot `\.` in `.hljs-title\.function_` matches a literal dot character in the class name, which doesn't exist. So that selector is wrong. But `.hljs-title` alone (line 2787) would still match these elements, so function names should still get color from the `.hljs-title` rule. The `.hljs-title\.class_` selector is broken but `.hljs-title` catches the base case.

In practice, the hljs highlighting in preview mode may actually work for most tokens. The user reports it doesn't work though. Let me think about what else could be wrong.

Let me check if `rehype-highlight` is correctly imported and configured. The version is 7.0.2 which uses `lowlight` under the hood.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && ls node_modules/rehype-highlight/ 2>/dev/null && ls node_modules/lowlight/ 2>/dev/null | head -5","description":"Check rehype-h`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && cat node_modules/rehype-highlight/lib/index.js 2>/dev/null | head -60","description":"Check rehype-highlight implementation"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && cat node_modules/rehype-highlight/lib/index.js 2>/dev/null | tail -60","description":"Check rehype-highlight transform logic"}`

---

## Assistant

OK, so rehype-highlight looks for `language-*` or `lang-*` classes on the `<code>` element. ReactMarkdown with remark-gfm should add those classes from fenced code blocks (e.g., ````python` -> `<code class="language-python">`). The `ignoreMissing: true` option should handle unknown languages gracefully.

The rehype-highlight setup looks correct. The hljs CSS rules are present. The most likely issue with preview mode is that there's actually a conflict with the `rehypeRaw` plugin order. Let me check the order:

```javascript
rehypePlugins={[rehypeRaw, [rehypeHighlight, { ignoreMissing: true }]]}
```

`rehypeRaw` runs first, then `rehypeHighlight`. This should be fine because `rehypeRaw` parses raw HTML into hast nodes, and then `rehypeHighlight` processes `<code>` elements. The order is correct.

Actually, I suspect the preview highlighting might actually work, and the user's screenshot might have shown a language that hljs doesn't support by default (the `common` subset). Let me check what languages are in the `common` bundle.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && node -e \"const {common} = require('lowlight'); console.log(Object.keys(common).sort().join(', '))\" 2>/dev/null","description"`

---

## Assistant

Good, the common bundle includes most popular languages. The preview highlighting should work for these languages. Let me verify the CSS specificity issue one more time by thinking through the cascade:

1. `.md-preview pre code { color: var(--text-primary); }` - specificity (0,1,2) - sets color on `<code>`
2. `.hljs-keyword { color: ... }` - specificity (0,1,0) - sets color on `<span class="hljs-keyword">`

Since the `<span>` is a child of `<code>`, and the span has its own `color` rule, the span's color wins over the inherited color from `<code>`. So the highlighting should work.

Unless... the `<span>` elements don't have the hljs classes. Let me verify rehype-highlight is actually processing the code. One possible issue: the `code` component override might be interfering.

Looking at the component override for `code` (lines 292-309):
```jsx
code: ({ className, children, ...props }) => {
    const match = className?.match(/language-(\w+)/);
    if (match?.[1] === "mermaid") {
        // mermaid handling
    }
    return <code className={className} {...props}>{children}</code>;
};
```

This re-renders the `<code>` element but preserves `className` and `children`. However, `rehype-highlight` modifies the hast tree BEFORE React rendering. The `children` prop would already contain the highlighted `<span>` elements from rehype-highlight. So the component override should not interfere.

Wait -- but when the custom `code` component returns `<code className={className} {...props}>{children}</code>`, the `children` already contains the highlighted spans from rehype-highlight. This should work.

I think the preview mode issue may actually be that the hljs CSS rules lack sufficient specificity for the dark theme override, or that the `color-mix` expressions aren't producing visible contrasts. But without seeing the actual rendered output, I'll include fixes for both modes.

Let me also check for the IntelliJ-like features: line numbers in code blocks.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"line-number|lineNumber|code.*gutter|code.*number","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

Now let me check the existing extension guides for reference and the docs/decisions directory.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides/ 2>/dev/null","description":"List extension guides"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/docs/decisions/ 2>/dev/null","description":"List ADR documents"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides/add-cm-preview-widget.md","limit":50}`

---

## Assistant

Now I have a thorough understanding of the codebase. Let me also check the `oneDarkHighlightStyle` to confirm it has code-relevant tag rules.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && grep -A 50 \"oneDarkHighlightStyle\" node_modules/@codemirror/theme-one-dark/dist/index.js 2>/dev/null | head -55","description`

---

## Assistant

Now I have the full picture. Let me also verify one more thing -- the `oneDarkHighlightStyle` has `themeType` set.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && grep -B5 \"oneDarkHighlightStyle\" node_modules/@codemirror/theme-one-dark/dist/index.js 2>/dev/null | head -10","description":`

---

## Assistant

I see `oneDarkHighlightStyle` is created with `HighlightStyle.define([...])` -- no options object with `themeType`. Let me check the `define` signature.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && grep -A 25 \"static define\" node_modules/@codemirror/language/dist/index.js 2>/dev/null | head -30","description":"Check Highl`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && grep -B2 -A 15 \"class HighlightStyle\" node_modules/@codemirror/language/dist/index.js 2>/dev/null | head -25","description":"`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app && grep \"themeType\" node_modules/@codemirror/language/dist/index.js 2>/dev/null","description":"Check themeType handling"}`

---

## Assistant

So `themeType` comes from `options.themeType`. The `oneDarkHighlightStyle` is created with `HighlightStyle.define([...])` without a second argument (no options), so `themeType` is `undefined`. The `buildMarkdownHighlight` is also created without `themeType`. Both have `themeType: undefined`.

Now let me finalize the root cause analysis:

**Edit mode root cause**: `buildMarkdownHighlight` is registered via `syntaxHighlighting()` without `{ fallback: true }`, so it goes into `highlighterFacet`. The code theme (`oneDarkHighlightStyle` or `defaultHighlightStyle`) is registered with `{ fallback: true }`, so it goes into `fallbackHighlighter`. Since `highlighterFacet` is non-empty, `getHighlighters()` returns only `[buildMarkdownHighlight]` and NEVER consults the fallback. Since `buildMarkdownHighlight` has no rules for code tokens (`keyword`, `string`, etc.), they get no color.

**Preview mode**: The setup looks correct in principle. The hljs CSS rules should work. Let me check one more potential issue -- whether the `.hljs-keyword` selectors are being overridden by a more specific rule.

Actually, there could be a subtlety: `.md-preview code { color: var(--accent); }` at line 2724-2731. This targets ALL `<code>` elements in the preview, including inline code. For block code, `.md-preview pre code { color: var(--text-primary); }` overrides it. But both set `color` on the `<code>` element. The hljs `<span>` children have their own `color` rules with specificity `(0,1,0)`. These should still win since they're directly on the element rather than inherited.

The preview highlighting should theoretically work. Let me check if there's perhaps a CSS load order issue where hljs styles are being loaded before the App.css and getting overridden. Or perhaps the rehype-highlight isn't importing any CSS stylesheet for hljs at all -- the user's custom rules in App.css are the only hljs CSS.

Looking at the import in `MarkdownPreview.tsx` -- there's no `import "highlight.js/styles/..."` statement. The only hljs CSS is the custom rules at lines 2775-2801 of App.css. These look correct but may have specificity issues in some edge cases. Let me verify once more -- the `.hljs-keyword` selector has specificity `(0,1,0)` while the color is inherited from `.md-preview pre code` with specificity `(0,1,2)`. Since the hljs rule is directly on the `<span>` while the code rule is on the parent `<code>`, the hljs color on the span wins.

I believe the preview highlighting should actually work. The user may be observing the edit mode issue and assuming it affects both. But to be safe, the plan should address both modes.

Now I have everything I need to write the comprehensive plan.

---

## Implementation Plan: IntelliJ-like Code Block Rendering

### Root Cause Analysis

#### Edit Mode (CodeMirror 6) -- CONFIRMED BUG

The syntax highlighting for nested languages inside fenced code blocks is completely broken due to a fundamental misunderstanding of CM6's highlighter resolution logic.

In `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx`, lines 147-148:

```typescript
syntaxHighlighting(buildMarkdownHighlight(isDark)),  // non-fallback -> highlighterFacet
syntaxHighlighting(isDark ? oneDarkHighlightStyle : defaultHighlightStyle, { fallback: true }),  // fallback -> fallbackHighlighter
```

CM6's `getHighlighters()` function uses an either/or strategy:
```javascript
function getHighlighters(state) {
    let main = state.facet(highlighterFacet);
    return main.length ? main : state.facet(fallbackHighlighter);
}
```

Since `buildMarkdownHighlight` is a non-fallback highlighter, `highlighterFacet` is non-empty, so the fallback (`oneDarkHighlightStyle` / `defaultHighlightStyle`) is **never consulted**. `buildMarkdownHighlight` only defines rules for `heading1-4`, `emphasis`, `strong`, `strikethrough`, and `monospace` -- it has zero rules for code tokens (`keyword`, `string`, `comment`, `number`, `typeName`, etc.). Result: all code block content is rendered as plain monochrome text.

#### Preview Mode (React Markdown)

The `rehype-highlight` setup is technically correct. The hljs CSS rules at lines 2775-2801 of `App.css` should work. However, there are two issues:
1. The CSS selectors `.hljs-title\.class_` and `.hljs-title\.function_` use escaped dots to match literal dot characters in class names, but hljs actually uses separate classes (`hljs-title class_`, `hljs-title function_`). The base `.hljs-title` rule still catches these elements, so it's a cosmetic bug affecting only subclass-specific styling.
2. The hljs color values use `color-mix` with CSS variables which produces washed-out colors that may not be distinguishable enough from `--text-primary`, especially in some themes.

### Implementation Plan

#### Step 1: Fix CM6 Code Token Highlighting (Critical Bug Fix)

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx`

**Change**: Remove `{ fallback: true }` from the code highlight style registration so both highlighter styles are non-fallback and are unioned together.

Replace line 148:
```typescript
syntaxHighlighting(isDark ? oneDarkHighlightStyle : defaultHighlightStyle, { fallback: true }),
```
With:
```typescript
syntaxHighlighting(isDark ? oneDarkHighlightStyle : defaultHighlightStyle),
```

This makes both `buildMarkdownHighlight` and `oneDarkHighlightStyle`/`defaultHighlightStyle` go into `highlighterFacet`. `getHighlighters()` returns both, and `highlightingFor()` iterates all of them, unioning the CSS classes. For code tokens like `keyword`, `buildMarkdownHighlight` returns no match, but `oneDarkHighlightStyle` does -- so the code tokens get colored.

**Risk assessment**: Low. The markdown-specific rules in `buildMarkdownHighlight` define `fontFamily`/`fontSize` for `monospace` and styles for headings/emphasis/strong. The code theme also defines rules for `emphasis`, `strong`, `heading`, and `strikethrough`. Since `highlightingFor` unions the classes, both sets of styles will apply. We need to verify there's no visual conflict for these overlapping tags (e.g., heading colors might blend two rules). If the markdown style sets `color` and the code theme also sets `color` for `tags.heading`, both CSS classes would apply, and the last one in the CSS cascade wins. Since `HighlightStyle` generates CSS rules with equal specificity, the order depends on which `StyleModule` is injected first. This needs visual testing.

To avoid any conflict, consider restricting the code theme to only apply within code blocks by using the `scope` option. However, this adds complexity. The simpler approach (removing `{ fallback: true }`) should work for all practical purposes since the overlapping tags (`emphasis`, `strong`, etc.) produce similar visual results in both styles.

#### Step 2: Fix the `!important` on `.cm-editor color`

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

**Change at line 1087**: Remove `!important` from the `color` property:
```css
.editor-body .cm-editor {
  height: 100%;
  background-color: var(--bg-primary) !important;
  color: var(--text-primary);  /* removed !important */
}
```

While CSS inheritance normally does not carry `!important` to children, removing it is a defensive measure. The `color` will still apply via normal cascade since `.editor-body .cm-editor` has high enough specificity for the container. The syntax highlight classes generated by CM6's `StyleModule` will override it on their respective `<span>` elements.

#### Step 3: Add Monospace Font for Code Lines in Edit Mode

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

Add a CSS rule that applies monospace font to code block lines. This is already partially handled by the `tags.monospace` rule in `buildMarkdownHighlight`, but that only targets tokens parsed as monospace by the markdown parser. Adding a CSS rule on `.cm-fenced-code` ensures all content lines (including the fence delimiters) use monospace:

```css
.editor-body .cm-editor .cm-fenced-code {
  background: var(--bg-secondary);
  font-family: ui-monospace, 'Menlo', 'Monaco', 'Consolas', monospace;
  font-size: 0.9em;
}
```

Note: This adds `font-family` and `font-size` to the existing `.cm-fenced-code` rule at line 1137.

#### Step 4: Add Line Numbers Inside Code Blocks (Preview Mode)

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx`

Enhance the `pre` component override to add line numbers. This requires:

1. In the `pre` component handler, extract the text content of the code block and split into lines.
2. Create a line-numbers gutter element alongside the code content.
3. Use CSS Grid or flexbox to position the gutter.

The implementation in the `pre` component override (lines 275-291):
- Extract the code text from the `<code>` child
- Count the lines
- If the block has more than 1 line, add a `.code-line-numbers` element before the `<pre>`

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

Add CSS for line numbers:
```css
.md-preview .code-block-wrapper {
  position: relative;
  display: flex;
  /* existing rules... */
}
.md-preview .code-line-numbers {
  flex-shrink: 0;
  padding: 14px 8px 14px 12px;
  text-align: right;
  color: var(--text-muted);
  font-size: 0.78em;
  font-family: ui-monospace, 'Menlo', 'Monaco', 'Consolas', monospace;
  line-height: /* match the code line-height */;
  user-select: none;
  border-right: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 6px 0 0 6px;
}
```

Note: For Edit mode, CM6 already has `lineNumbers()` which is controlled by `showLineNumbers` in uiStore. Line numbers in code blocks only is more complex in CM6 (would require a gutter extension scoped to fenced code ranges). This is a stretch goal; the global `lineNumbers()` toggle already covers the use case.

#### Step 5: Fix hljs CSS Selectors for Preview Mode

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

Fix the escaped dot selectors at lines 2788-2789:
```css
/* Before (broken): */
.hljs-title\.class_,
.hljs-title\.function_ { ... }

/* After (correct): */
.hljs-title.class_,
.hljs-title.function_ { ... }
```

#### Step 6: Strengthen hljs Color Palette

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

Replace the `color-mix` expressions with more saturated, distinct colors that match the IntelliJ aesthetic. Use theme-aware CSS variables so colors adapt to light/dark mode.

Define per-theme syntax colors in the CSS variable blocks (`:root` for light, `[data-theme="dark"]` for dark, etc.):

```css
:root {
  /* existing vars... */
  --syntax-keyword: #7B3DB4;
  --syntax-string: #2E7D32;
  --syntax-comment: #8C8C8C;
  --syntax-number: #B85C00;
  --syntax-function: #2671C8;
  --syntax-type: #B07D2B;
  --syntax-variable: #C84040;
  --syntax-meta: #8E44AD;
  --syntax-symbol: #00838F;
}
[data-theme="dark"] {
  /* existing vars... */
  --syntax-keyword: #C678DD;
  --syntax-string: #98C379;
  --syntax-comment: #7F848E;
  --syntax-number: #D19A66;
  --syntax-function: #61AFEF;
  --syntax-type: #E5C07B;
  --syntax-variable: #E06C75;
  --syntax-meta: #C678DD;
  --syntax-symbol: #56B6C2;
}
```

Then update the hljs rules to use these variables:
```css
.hljs-keyword, .hljs-selector-tag, .hljs-built_in { color: var(--syntax-keyword); }
.hljs-string, .hljs-attr, .hljs-addition { color: var(--syntax-string); }
.hljs-comment, .hljs-quote { color: var(--syntax-comment); font-style: italic; }
/* etc. */
```

This also enables the CM6 `buildMarkdownHighlight` function to use the same variables if we add code token rules there (see Step 7).

#### Step 7: (Optional) Add Code Token Colors to buildMarkdownHighlight

For complete consistency between Edit and Preview modes, consider building a custom `HighlightStyle` that uses the same `--syntax-*` CSS variables. However, CM6's `HighlightStyle.define()` accepts inline CSS properties as strings, not CSS variables. The generated `StyleModule` converts these into CSS class definitions. CSS variables CAN be used as color values in `HighlightStyle.define()` specs because they're valid CSS color values.

If the `oneDarkHighlightStyle` colors (which are hardcoded hex values) don't match the theme well in all theme variants (Dracula, Solarized, etc.), a custom highlight style using CSS variables would be better. This would replace the import of `oneDarkHighlightStyle` / `defaultHighlightStyle`.

This is a larger change and could be a follow-up. The Step 1 fix (removing `{ fallback: true }`) is sufficient to get code highlighting working.

#### Step 8: Copy Button for Code Blocks (Preview Mode)

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx`

Add a "Copy" button to code blocks in the `pre` component override:
- Position it absolute, top-right (alongside or below the language badge)
- On click, copy the code text to clipboard
- Show a brief "Copied!" feedback

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

Style the copy button to appear on hover of `.code-block-wrapper`.

### Implementation Order and Dependencies

1. **Step 1** (remove `{ fallback: true }`) -- highest priority, fixes the core bug
2. **Step 2** (remove `!important` on color) -- defensive, do alongside Step 1
3. **Step 3** (monospace font for code lines) -- cosmetic, quick CSS change
4. **Step 5** (fix hljs selectors) -- bug fix, quick CSS change
5. **Step 6** (stronger hljs colors + CSS variables) -- visual improvement, medium effort
6. **Step 4** (line numbers in preview) -- feature addition, medium effort
7. **Step 8** (copy button) -- feature addition, medium effort
8. **Step 7** (custom CM6 highlight style) -- optional, larger effort, follow-up

Steps 1-3 and 5 can be done in a single commit. Steps 4, 6, and 8 can be a second commit.

### Testing Strategy

- Visual verification: Open a note with code blocks in multiple languages (Rust, Python, JavaScript, SQL) in both Edit and Preview modes
- Verify each theme variant (light, dark, Dracula, Solarized Light/Dark, Nord, Tokyo Night, One Dark)
- Verify Mermaid diagram rendering is unaffected
- Verify inline code styling is unaffected
- Verify the existing 54+ Vitest tests still pass
- Add a simple test for the line numbers component if implementing Step 4

### Potential Challenges

1. **Overlapping highlight rules**: When both `buildMarkdownHighlight` and `oneDarkHighlightStyle` are non-fallback, tags like `emphasis`, `strong`, and `heading` are defined in both. The CM6 system unions the CSS classes, so both styles apply. Need to verify no visual artifacts.

2. **Async language loading**: CM6's `@codemirror/language-data` loads grammars lazily via dynamic `import()`. There may be a brief flash of unstyled code before the grammar loads. This is expected CM6 behavior and not something we need to fix.

3. **Theme consistency**: The `oneDarkHighlightStyle` uses fixed hex colors (violet, coral, sage, etc.) which look good on dark backgrounds but may not match all theme variants. The Step 7 follow-up (CSS variable-based highlight style) would address this fully.

4. **Line numbers in preview**: The line height of the gutter must match the code content exactly. If `font-size` or `line-height` differ between the gutter and the code, lines will drift out of alignment. Need careful CSS synchronization.

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx` - Contains the CM6 setup with the broken `{ fallback: true }` that must be removed (line 148)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` - Contains the `!important` color override (line 1087), the fenced code block styles (lines 1137-1153), the hljs theme rules with broken selectors (lines 2775-2801), and the preview code block styles (lines 2724-2747)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx` - Contains the `pre`/`code` component overrides where line numbers and copy button would be added (lines 275-309)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts` - Contains the fenced code block decoration logic and `CodeLangBadgeWidget`; may need updates if adding code-block-scoped line numbers in edit mode

---

