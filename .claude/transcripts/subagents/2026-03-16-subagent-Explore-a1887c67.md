# 2026-03-16 — Subagent Transcript: Explore

**Date:** 2026-03-16 15:11:17
**Agent:** Explore
**Agent ID:** a1887c67e7218451c
**Parent Session:** a2488be2-2d1d-4e93-a8e6-4f75d19305c4

---

## User

In the BrainMap desktop app (crates/app/), explore how markdown preview/rendering handles link clicks. The user reports that clicking markdown links like `[Intervention](./Level 2 - Intervention)` in preview mode opens localhost instead of navigating to the correct note.

I need to understand:
1. How markdown is rendered in preview mode (what library, what component)
2. How link clicks are intercepted/handled in preview mode
3. How relative file links (like `./Level 2 - Intervention`) are resolved
4. Any existing link click handlers or navigation logic

Search thoroughly - check components related to: preview, markdown rendering, editor, link handling, note navigation. Look at package.json for markdown rendering libraries used.

---

## Assistant

I'll help you explore how markdown preview/rendering handles link clicks in the BrainMap desktop app. Let me start by examining the project structure and identifying the relevant code.

---

## Assistant

### Tool Calls

- **bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap && find crates/app -type f -name \"package.json\" | head -5"}`

---

## Assistant

Let me use the appropriate tools for this read-only exploration.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/**/package.json"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*preview* -o crates/app/src/**/*markdown* -o crates/app/src/**/*editor*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.tsx"}`

---

## Assistant

Great! I can see `MarkdownPreview.tsx` and `MarkdownEditor.tsx`. Let me examine these and related files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

Perfect! Now let me examine the utility files that handle link resolution:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/resolveNotePath.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmLinkNavigation.ts"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"linkNavigation|cmLinkNavigation","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

Now let me check the editor store and related components to understand how the preview and editor relate:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"MarkdownPreview|preview","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components","type":"tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.test.tsx"}`

---

## Assistant

Let me check the stores and see if there's any issue with how URLs are being handled:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"openNote|selectNode","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores","type":"ts"}`

---

## Assistant

Let me check the full editorStore.openNote implementation and also look at the calloutPreprocess:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","limit":200,"offset":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutPreprocess.ts"}`

---

## Assistant

Now let me check the graphStore to see how selectNode works:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts","limit":150}`

---

## Assistant

Perfect! Now let me look for any CSS or styling that might affect how links are rendered, and check if there's any issue with how href is being set in the preview:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"md-preview|md-preview-link","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.css"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","limit":150}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.md-preview|\\.md-preview-link","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"md-preview-link","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":400,"limit":200}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"md-preview\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1750,"limit":100}`

---

## Assistant

Perfect! Now let me check one more thing - look at how react-markdown renders links and if there's any issue with how the `href` attribute is being applied:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"href|localhost","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"preventDefault|preventDefault","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx"}`

---

## Assistant

Now let me create a comprehensive analysis document:

## Summary

I've completed a thorough exploration of the BrainMap desktop app's markdown preview/rendering system and link click handling. Here's what I found:

### 1. Markdown Rendering Library
- **Library**: `react-markdown` v10.1.0 with `remark-gfm` v4.0.1
- **Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx`
- The component uses `ReactMarkdown` with two remark plugins: `remarkGfm` and `remarkCalloutMerge`

### 2. Link Click Interception in Preview Mode
The `MarkdownPreview` component customizes the `<a>` tag rendering via the `components` prop (lines 111-182):

```typescript
const components = useMemo(
  () => ({
    a: ({
      href,
      children,
      ...props
    }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
      children?: React.ReactNode;
    }) => {
      if (href && isLocalMdLink(href)) {
        return (
          <a
            {...props}
            href={href}
            title="Cmd+Click to open note"
            className="md-preview-link"
            onClick={(e) => {
              e.preventDefault();
              if (!(e.metaKey || e.ctrlKey)) return;
              const resolved = resolveNotePath(notePath, href);
              useGraphStore.getState().selectNode(resolved);
              useEditorStore.getState().openNote(resolved);
            }}
          >
            {children}
          </a>
        );
      }
      return (
        <a {...props} href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
    // ... blockquote component for callouts
  }),
  [notePath],
);
```

**Key behavior:**
- Local markdown links (ending in `.md`) require Cmd+Click (or Ctrl+Click) to navigate
- The `onClick` handler calls `e.preventDefault()` immediately, then checks for modifier keys
- If the modifier key is present, it resolves the link path and opens the note
- External links (with schemes like `http://`) open in a new tab with `target="_blank"`

### 3. Relative File Link Resolution
**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/resolveNotePath.ts`

The `resolveNotePath()` function (lines 11-42) handles relative link resolution:

```typescript
export function resolveNotePath(
  currentNotePath: string,
  linkTarget: string,
): string {
  // Decode URL-encoded characters (e.g., %20 → space)
  let decoded: string;
  try {
    decoded = decodeURIComponent(linkTarget);
  } catch {
    decoded = linkTarget;
  }

  // Extract the directory of the current note
  const slashIdx = currentNotePath.lastIndexOf("/");
  const dir = slashIdx >= 0 ? currentNotePath.slice(0, slashIdx) : "";

  // Join directory with the link target
  const joined = dir ? `${dir}/${decoded}` : decoded;

  // Normalize: resolve . and .. segments
  const parts = joined.split("/");
  const resolved: string[] = [];
  for (const part of parts) {
    if (part === "." || part === "") continue;
    if (part === "..") {
      resolved.pop();
    } else {
      resolved.push(part);
    }
  }
  return resolved.join("/");
}
```

**How it works:**
- Takes the current note's directory path
- Resolves relative paths (`.`, `..`) against that directory
- Returns the workspace-relative path (e.g., `"Level 2 - Intervention.md"`)
- Decodes URL-encoded characters like `%20` → space

### 4. Link Detection Helper
**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/resolveNotePath.ts` (lines 44-49)

```typescript
export function isLocalMdLink(href: string): boolean {
  // Has a scheme (http:, https:, mailto:, etc.) → not local
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return false;
  return href.endsWith(".md");
}
```

**Detection logic:**
- Returns `false` if the href contains a URI scheme (matches `http:`, `https:`, etc.)
- Returns `true` only if the href ends with `.md` (indicating a local markdown note)

### 5. Preprocessing & Space Encoding
**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutPreprocess.ts`

The preview content is preprocessed with `encodeLinkSpaces()` (lines 6-16):

```typescript
export function encodeLinkSpaces(md: string): string {
  return md.replace(
    /(\[[^\]]*\]\()([^)]+)(\))/g,
    (_match, prefix: string, dest: string, suffix: string) => {
      if (!dest.includes(" ")) return _match;
      return prefix + dest.replace(/ /g, "%20") + suffix;
    },
  );
}
```

**Purpose:**
- Converts spaces in markdown link destinations to `%20` so the markdown parser processes them correctly
- Example: `[Intervention](./Level 2 - Intervention)` → `[Intervention](./Level%20 2%20 -%20 Intervention)`
- This is decoded again in `resolveNotePath()` via `decodeURIComponent()`

### 6. Editor Mode Link Navigation
The edit mode (CodeMirror) has similar Cmd+Click support in `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmLinkNavigation.ts`:
- Uses regex to extract markdown links from text at mouse position
- Checks for Cmd/Ctrl modifiers before navigating
- Same resolution logic via `resolveNotePath()` and store actions

### 7. CSS Styling for Link Feedback
**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` (lines 1785-1799):

```css
.md-preview a {
  color: var(--accent);
  text-decoration: none;
}
.md-preview a:hover {
  text-decoration: underline;
}
/* Cmd+hover cursor feedback for local note links (matches edit mode) */
.md-preview-link {
  cursor: default;
}
.md-preview.cmd-held .md-preview-link:hover {
  cursor: pointer;
  text-decoration: underline;
}
```

### Potential Issues

Based on the report that "clicking markdown links opens localhost instead of navigating to the correct note," here are the likely culprits:

1. **Missing `.md` extension in the link**: The `isLocalMdLink()` function requires links to end in `.md`. If a link is `[text](./Level 2 - Intervention)` without the `.md`, it will be treated as an external link and open in a new tab.

2. **Link requires Cmd+Click**: The preview link handler only navigates on Cmd/Ctrl+Click. A plain click will be prevented but won't navigate anywhere (the `onClick` returns early on line 129 if modifier keys aren't held).

3. **Spaces in link paths**: While spaces are handled via `%20` encoding, if the markdown source has unencoded spaces AND they're not being properly decoded/resolved, path resolution might fail, causing the link to be treated as a URL.

4. **External link detection**: Any link with a URL scheme (like `http://localhost:...`) will be opened with `target="_blank"`, which is the "localhost" behavior mentioned. This suggests the link might be getting misparsed as a URL scheme.

### Key Files to Reference
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/resolveNotePath.ts`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutPreprocess.ts`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmLinkNavigation.ts`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` (styling lines 1785-1799)

---

