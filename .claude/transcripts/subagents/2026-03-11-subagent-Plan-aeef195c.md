# 2026-03-11 — Subagent Transcript: Plan

**Date:** 2026-03-11 20:11:35
**Agent:** Plan
**Agent ID:** aeef195ce64ced6dd
**Parent Session:** 39b8b6f7-28e1-4e15-ac42-d06a2cbd1540

---

## User

Design an implementation plan for adding Cmd+Click to open linked notes in the BrainMap desktop app's editor view.

## Context

BrainMap is a knowledge graph tool with a Tauri v2 + React + CodeMirror 6 desktop app. Notes are markdown files with YAML frontmatter. Links between notes appear in two places:
1. **Frontmatter `links` field** — typed relationships (already navigable via RelatedNotesFooter)
2. **Inline markdown links** — standard `[label](relative/path.md)` syntax in the body

The editor has two modes:
- **Edit mode**: CodeMirror 6 editor (`MarkdownEditor.tsx`)
- **Preview mode**: react-markdown (`MarkdownPreview.tsx`)

Navigation pattern (from RelatedNotesFooter):
```typescript
useGraphStore.getState().selectNode(item.path);
useEditorStore.getState().openNote(item.path);
```

### Current Editor Setup (MarkdownEditor.tsx)
- Extensions: `markdown()`, `keymap.of(defaultKeymap)`, `EditorView.updateListener`, `EditorView.lineWrapping`, syntax highlighting
- Props: `notePath: string`, `content: string`, `onChange: (content: string) => void`
- No existing click handlers or decorations for links

### Current Preview Setup (MarkdownPreview.tsx)
- Uses `react-markdown` with `remark-gfm`
- No custom link rendering — links render as plain `<a>` tags
- No click interception

### Path Resolution
- Inline links use relative paths: `[Galton](./Francis Galton.md)`, `[Ch1](./Ch1 - The Ladder of Causation/Ch1 - The Ladder of Causation.md)`
- The note's own path is available as `notePath` prop (e.g., `People/Judea Pearl.md`)
- Frontmatter link targets are already resolved to workspace-relative paths in the DTO layer
- Inline link targets in the body are NOT resolved — they're raw relative paths

### Requirements
1. In **edit mode** (CodeMirror): Cmd+Click on a markdown link `[text](path.md)` should navigate to that note
2. In **preview mode** (react-markdown): Cmd+Click on rendered links that point to `.md` files should navigate to that note
3. Path resolution: resolve the relative link target against the current note's directory to get a workspace-relative path
4. Visual feedback: in edit mode, show the cursor as a pointer when hovering over a link while holding Cmd
5. Only intercept `.md` links — external URLs should behave normally

### Architecture Considerations
- CodeMirror extensions are the right way to handle this in edit mode
- The `notePath` prop gives us the current note's path for resolving relative links
- The `MarkdownEditor` component needs a new prop or callback for navigation (or import stores directly)
- For preview mode, react-markdown's `components` prop can override link rendering

Please design a detailed implementation plan covering:
1. A CodeMirror extension for Cmd+Click link detection and navigation
2. Preview mode link interception
3. Path resolution utility
4. Visual feedback (cursor changes, underline on Cmd+hover)
5. Test strategy

---

## Assistant



I'll explore the codebase to understand the current editor setup, navigation patterns, and path resolution before designing the plan.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/src/**/*.{rs,tsx,ts}"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.{tsx,ts}"}`

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

Let me check the graphStore for the navigation pattern and look at some seed data to understand link paths.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json && cat /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json | head -40","description":"Check package.j`

---

## Assistant

Now let me check some seed data to understand the inline link format and check vitest config.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r '\\[.*\\](.*\\.md)' /Users/bsmonteiro/Desktop/Personal/brainmap/seed/ | head -15","description":"Find inline markdown links in seed data"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/vitest.config.ts"}`

---

## Assistant

Now let me check the CSS file for existing styles and the app's CSS structure.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.css"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/test-setup.ts"}`

---

## Assistant

I now have a thorough understanding of the codebase. Here is the implementation plan.

---

## Implementation Plan: Cmd+Click to Open Linked Notes

### Overview

Add Cmd+Click (Ctrl+Click on non-Mac) navigation for markdown links in both the CodeMirror edit mode and the react-markdown preview mode. This involves four deliverables: a path resolution utility, a CodeMirror extension, preview mode link interception, and tests.

### Step 1: Path Resolution Utility

**New file:** `crates/app/src/utils/resolveNotePath.ts`

This is a pure function with no dependencies, making it easy to unit test.

```typescript
/**
 * Resolve a relative link target against the current note's directory
 * to produce a workspace-relative path.
 *
 * Examples:
 *   resolveNotePath("People/Judea Pearl.md", "./Francis Galton.md")
 *     => "People/Francis Galton.md"
 *   resolveNotePath("Questions/Why Did Statistics Resist Causation.md", "../People/Karl Pearson.md")
 *     => "People/Karl Pearson.md"
 *   resolveNotePath("The Book of Why/The Book of Why.md", "./Ch1 - The Ladder of Causation/Ch1 - The Ladder of Causation.md")
 *     => "The Book of Why/Ch1 - The Ladder of Causation/Ch1 - The Ladder of Causation.md"
 */
export function resolveNotePath(currentNotePath: string, linkTarget: string): string
```

Logic:
1. Extract the directory portion of `currentNotePath` (everything before the last `/`, or empty string if no `/`).
2. Join the directory with `linkTarget`.
3. Normalize: split on `/`, process `.` (skip) and `..` (pop parent), rejoin. Strip leading `/` if any.
4. Return the workspace-relative path.

A companion helper:

```typescript
/** Returns true if the href looks like a local .md file link (not a URL). */
export function isLocalMdLink(href: string): boolean {
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return false; // has a scheme
  return href.endsWith('.md');
}
```

### Step 2: Navigation Helper

**New file:** `crates/app/src/utils/navigateToNote.ts`

A thin wrapper encapsulating the existing navigation pattern from `RelatedNotesFooter`:

```typescript
import { useGraphStore } from "../stores/graphStore";
import { useEditorStore } from "../stores/editorStore";

export function navigateToNote(workspaceRelativePath: string): void {
  useGraphStore.getState().selectNode(workspaceRelativePath);
  useEditorStore.getState().openNote(workspaceRelativePath);
}
```

This keeps the navigation logic DRY. `RelatedNotesFooter` can also be refactored to use it (optional cleanup).

### Step 3: CodeMirror Extension for Edit Mode

**New file:** `crates/app/src/components/Editor/cmLinkNavigation.ts`

This file exports a CodeMirror `Extension` (an array of facets/plugins). It handles:

**3a. Click handler (EventHandler via `EditorView.domEventHandlers`)**

```typescript
EditorView.domEventHandlers({
  click(event: MouseEvent, view: EditorView) {
    if (!(event.metaKey || event.ctrlKey)) return false;
    
    const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
    if (pos === null) return false;
    
    const linkTarget = extractLinkAtPos(view.state, pos);
    if (!linkTarget) return false;
    
    // notePath is stored in a state facet (see below)
    const notePath = view.state.facet(notePathFacet);
    if (!notePath) return false;
    
    if (!isLocalMdLink(linkTarget)) return false;
    
    const resolved = resolveNotePath(notePath, linkTarget);
    navigateToNote(resolved);
    
    event.preventDefault();
    return true;
  }
})
```

**3b. `extractLinkAtPos` helper**

Uses the CodeMirror `syntaxTree` from `@codemirror/language` to find markdown link nodes at the cursor position. The markdown parser (`@codemirror/lang-markdown` uses `@lezer/markdown`) produces a tree with `Link` nodes containing `URL` children. Alternatively, use a regex approach on the line text:

- Get the line at `pos`.
- Find all `[...](...)` patterns on that line.
- Check if `pos` falls within any match's range.
- Extract the URL from the matching group.

The regex approach is simpler and more robust than tree walking for this use case. The regex: `/\[([^\]]*)\]\(([^)]*)\)/g` applied to the line text, checking if the character offset falls within each match.

**3c. `notePathFacet`** -- a `Facet<string, string>` to pass the current note path into the extension. When creating the extension, provide the notePath via `notePathFacet.of(notePath)`.

```typescript
import { Facet } from "@codemirror/state";

const notePathFacet = Facet.define<string, string>({
  combine: (values) => values[0] ?? "",
});
```

**3d. Cursor style on Cmd+hover (ViewPlugin with decorations)**

Use `EditorView.domEventHandlers` for `keydown`/`keyup`/`mousemove` to track whether Cmd is held and the mouse is over a link. Apply a CSS class to the editor root when active:

- On `mousemove` with `metaKey`/`ctrlKey`: check if the position under cursor is within a link. If so, add `cm-link-clickable` class to the editor DOM.
- On `keydown` of Meta/Control with mouse over a link: same check.
- On `keyup` of Meta/Control or `mouseleave`: remove the class.

Use `EditorView.baseTheme` to define the cursor style:

```typescript
EditorView.baseTheme({
  "&.cm-link-clickable .cm-link": {
    cursor: "pointer",
    textDecoration: "underline",
  }
})
```

However, CodeMirror's built-in markdown highlighting does not add a `.cm-link` class to link text by default. A simpler approach: when Cmd is held and the mouse is over a link range, set a tooltip-style decoration or just change the document cursor via `document.body.style.cursor = 'pointer'` and revert on release. This avoids needing decorations.

Even simpler: use a single `EditorView.domEventHandlers` that sets `event.target.style.cursor = 'pointer'` when appropriate, relying on the fact that CodeMirror renders text in `<span>` elements. Actually the most pragmatic approach:

- Track `cmdHeld` + `mousePos` in the plugin.
- On each update, if cmdHeld and mouse is over a link range, add a class to the editor's `dom` element: `view.dom.classList.add('cm-cmd-link-hover')`.
- Define a theme: `"&.cm-cmd-link-hover .cm-line": { cursor: "pointer" }`. This makes the entire line show a pointer, which is acceptable since the click handler checks the exact position anyway.

For a more precise experience, use `Decoration.mark` on the link range when Cmd is held, but this adds complexity. The line-level cursor approach is a reasonable v1.

**3e. Exported function**

```typescript
export function linkNavigation(notePath: string): Extension {
  return [
    notePathFacet.of(notePath),
    clickHandler,
    hoverPlugin,
    baseTheme,
  ];
}
```

### Step 4: Wire CodeMirror Extension into MarkdownEditor

**Modified file:** `crates/app/src/components/Editor/MarkdownEditor.tsx`

In the `useEffect` that creates the editor, add the extension:

```typescript
import { linkNavigation } from "./cmLinkNavigation";

// Inside the extensions array:
extensions.push(linkNavigation(notePath));
```

No new props needed -- `notePath` is already available. The extension imports `navigateToNote` directly, so no callback prop is required.

### Step 5: Preview Mode Link Interception

**Modified file:** `crates/app/src/components/Editor/MarkdownPreview.tsx`

Add `notePath` prop and use `react-markdown`'s `components` prop to override link rendering:

```typescript
interface Props {
  content: string;
  notePath: string;
}

export function MarkdownPreview({ content, notePath }: Props) {
  const linkRenderer = useMemo(() => ({
    a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children?: React.ReactNode }) => {
      if (href && isLocalMdLink(href)) {
        return (
          <a
            {...props}
            href={href}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey) {
                e.preventDefault();
                const resolved = resolveNotePath(notePath, href);
                navigateToNote(resolved);
              }
            }}
            title={`Cmd+Click to open ${href}`}
          >
            {children}
          </a>
        );
      }
      // External links: open in default browser
      return <a {...props} href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
    },
  }), [notePath]);

  return (
    <div className="md-preview">
      <ReactMarkdown remarkPlugins={remarkPlugins} components={linkRenderer}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
```

### Step 6: Update EditorPanel to pass notePath to MarkdownPreview

**Modified file:** `crates/app/src/components/Editor/EditorPanel.tsx`

Line 117 changes from:
```tsx
<MarkdownPreview content={editedBody ?? activeNote.body} />
```
to:
```tsx
<MarkdownPreview content={editedBody ?? activeNote.body} notePath={activeNote.path} />
```

### Step 7: CSS

**Modified file:** `crates/app/src/App.css`

Add styles for Cmd+hover visual feedback in CodeMirror:

```css
/* Cmd+hover link navigation cursor in CodeMirror */
.cm-editor.cm-cmd-link-hover .cm-line {
  cursor: pointer;
}
```

And optionally style `.md-preview a[href$=".md"]` to hint that local links are navigable (subtle underline, or a small icon).

### Step 8: Tests

**New file:** `crates/app/src/utils/resolveNotePath.test.ts`

Test the pure path resolution utility:

1. Simple same-directory link: `("People/Judea Pearl.md", "./Francis Galton.md")` => `"People/Francis Galton.md"`
2. Parent directory traversal: `("Questions/Q1.md", "../People/Karl Pearson.md")` => `"People/Karl Pearson.md"`
3. Nested subdirectory: `("The Book of Why/The Book of Why.md", "./Ch1/Ch1.md")` => `"The Book of Why/Ch1/Ch1.md"`
4. No leading `./`: `("A/B.md", "C.md")` => `"A/C.md"`
5. Root-level note: `("Root.md", "./Sub/Note.md")` => `"Sub/Note.md"`
6. Multiple `..` traversals: `("A/B/C.md", "../../D.md")` => `"D.md"`
7. Spaces in paths: `("People/Judea Pearl.md", "./Francis Galton.md")` => `"People/Francis Galton.md"`

**New file:** `crates/app/src/utils/resolveNotePath.test.ts` (same file, also tests `isLocalMdLink`):

8. `isLocalMdLink("./foo.md")` => `true`
9. `isLocalMdLink("https://example.com")` => `false`
10. `isLocalMdLink("./foo.txt")` => `false`
11. `isLocalMdLink("mailto:x@y.com")` => `false`

For the CodeMirror extension and preview components, testing is harder in jsdom:

- **`cmLinkNavigation` unit tests** (`crates/app/src/components/Editor/cmLinkNavigation.test.ts`): Test `extractLinkAtPos` as a standalone pure function (given a line string and offset, returns the correct URL or null). This is the core logic and can be tested without a full CodeMirror instance.
- **MarkdownPreview integration test** (`crates/app/src/components/Editor/MarkdownPreview.test.tsx`): Use `@testing-library/react` to render `MarkdownPreview` with content containing a `[link](./target.md)`, simulate a click with `metaKey: true`, and verify `navigateToNote` was called. This requires mocking the stores.

### Step 9: Documentation Updates

Update `CLAUDE.md` current status to mention Cmd+Click link navigation. No spec doc changes needed since this is a new UI feature within the existing editor.

### Dependency Ordering

1. `resolveNotePath.ts` + `isLocalMdLink` (no dependencies)
2. `navigateToNote.ts` (depends on existing stores)
3. `cmLinkNavigation.ts` (depends on 1 and 2)
4. `MarkdownPreview.tsx` changes (depends on 1 and 2)
5. `MarkdownEditor.tsx` changes (depends on 3)
6. `EditorPanel.tsx` changes (depends on 4)
7. CSS changes
8. Tests (depends on 1-6)
9. Documentation

### Potential Challenges

- **CodeMirror link detection accuracy**: The regex approach `\[...\](...\)` can be tricked by nested brackets or escaped characters. For v1, the simple regex is sufficient for the BrainMap use case (seed data uses straightforward links). If needed later, tree-based detection via `syntaxTree` can replace it.
- **Broken links**: If a user Cmd+clicks a link to a note that does not exist in the workspace, `openNote` will fail and log an error. Consider showing a brief toast or creating a "note not found" state, but this is out of scope for v1 -- the existing error handling in `editorStore.openNote` already catches and logs errors.
- **URL-encoded spaces**: Seed data uses raw spaces in filenames (`./Francis Galton.md`), not `%20`. The path resolution utility should not URL-decode. If links use `%20`, a `decodeURIComponent` call would be needed, but the existing seed data does not.
- **Platform detection for Cmd vs Ctrl**: Use `event.metaKey` for Mac, `event.ctrlKey` for Windows/Linux. The check `event.metaKey || event.ctrlKey` covers both.

### Critical Files for Implementation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx` - Primary file to modify: add the CodeMirror link navigation extension
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx` - Add notePath prop and custom link renderer with Cmd+Click handling
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx` - Wire notePath prop to MarkdownPreview, parent orchestrator
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx` - Reference for the existing navigation pattern (selectNode + openNote)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts` - Contains openNote action used by navigation, needed for understanding and mocking in tests

---

