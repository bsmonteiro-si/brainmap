# 2026-03-16 — Subagent Transcript: general-purpose

**Date:** 2026-03-16 17:00:04
**Agent:** general-purpose
**Agent ID:** a2d6d38bd06db3f8d
**Parent Session:** f677a8ff-6516-4865-b3c8-dfc9f49743e0

---

## User

You are reviewing TypeScript/CSS code for BrainMap. Here is the full code reviewer agent definition you must follow:

---
# Code Reviewer Agent

You are reviewing code for BrainMap, a knowledge graph tool. Your job is to find real defects, not style nits.

## What to Review

### 1. Correctness
- Are there logic bugs? Off-by-one errors? Missed conditions?
- Does error handling cover all failure modes?
- Are there edge cases that could cause issues?

### 2. Function Design
- Is each function doing one thing?
- Are names descriptive?

### 3. Test Coverage
- Is every new public function tested?
- Are error paths tested?
- Do tests verify behavior (end state)?

### 4. Performance
- Are there O(n^2) loops or repeated scans that could be O(n)?

## Output Format

Write your review as a list of findings. For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

If the code is solid, say so briefly.
---

## Changed files:

### 1. `crates/app/src/components/Editor/cmMarkdownDecorations.ts`

Added inline source citation decorations. Here are the changed sections:

```typescript
// New marks (added near line 257):
const sourceTagMark = Decoration.mark({ class: "cm-source-tag" });
const sourceContentMark = Decoration.mark({ class: "cm-source-content" });
const sourceBracketMark = Decoration.mark({ class: "cm-source-bracket" });

// New regex pass added in buildDecorations after tree walk (near line 385):
  // Inline source citations [!source ...] — regex pass over non-fenced lines
  const fencedLines = fencedLineSet(cls.fencedBlocks);
  const inlineSourceRe = /\[!source\s+([^\]]+)\]/g;
  // Collect InlineCode and Link ranges from the tree to skip overlaps
  const skipRanges: { from: number; to: number }[] = [];
  tree.iterate({
    enter(node) {
      if (node.name === "InlineCode" || node.name === "Link") {
        skipRanges.push({ from: node.from, to: node.to });
        return false;
      }
    },
  });

  for (let ln = 1; ln <= doc.lines; ln++) {
    if (fencedLines.has(ln)) continue;
    const line = doc.line(ln);
    let m: RegExpExecArray | null;
    inlineSourceRe.lastIndex = 0;
    while ((m = inlineSourceRe.exec(line.text)) !== null) {
      if (!m[1].trim()) continue; // skip whitespace-only
      const matchFrom = line.from + m.index;
      const matchTo = matchFrom + m[0].length;
      // Skip if overlapping with InlineCode or Link
      if (skipRanges.some((r) => matchFrom < r.to && matchTo > r.from)) continue;
      // [!source  = tag (opening bracket + !source)
      const tagEnd = matchFrom + m[0].indexOf(m[1]); // start of content
      decos.push({ from: matchFrom, to: tagEnd, deco: sourceTagMark });
      // content
      decos.push({ from: tagEnd, to: matchTo - 1, deco: sourceContentMark });
      // closing ]
      decos.push({ from: matchTo - 1, to: matchTo, deco: sourceBracketMark });
    }
  }
```

### 2. `crates/app/src/components/Editor/remarkInlineSource.ts` (new file)

```typescript
import type { Root, PhrasingContent, Parent } from "mdast";

const INLINE_SOURCE_RE = /\[!source\s+([^\]]+)\]/g;

const PHRASING_PARENTS = new Set([
  "paragraph", "heading", "emphasis", "strong", "delete",
  "link", "linkReference", "tableCell",
]);

export function remarkInlineSource() {
  return (tree: Root) => {
    walkBlock(tree);
  };
}

function walkBlock(parent: { children: unknown[] }) {
  for (const child of parent.children as Array<{ type: string; children?: unknown[] }>) {
    if (!child.children) continue;
    if (child.type === "code") continue;
    if (PHRASING_PARENTS.has(child.type)) {
      transformPhrasing(child as Parent & { children: PhrasingContent[] });
    } else {
      walkBlock(child as { children: unknown[] });
    }
  }
}

function transformPhrasing(parent: Parent & { children: PhrasingContent[] }) {
  const newChildren: PhrasingContent[] = [];
  let changed = false;

  for (const child of parent.children) {
    if (child.type === "inlineCode") {
      newChildren.push(child);
      continue;
    }
    if ("children" in child && PHRASING_PARENTS.has(child.type)) {
      transformPhrasing(child as unknown as Parent & { children: PhrasingContent[] });
      newChildren.push(child);
      continue;
    }
    if (child.type !== "text") {
      newChildren.push(child);
      continue;
    }

    const value = child.value;
    INLINE_SOURCE_RE.lastIndex = 0;
    if (!INLINE_SOURCE_RE.test(value)) {
      newChildren.push(child);
      continue;
    }

    changed = true;
    let lastIndex = 0;
    INLINE_SOURCE_RE.lastIndex = 0;
    let m: RegExpExecArray | null;

    while ((m = INLINE_SOURCE_RE.exec(value)) !== null) {
      const content = m[1];
      if (!content.trim()) continue;
      if (m.index > lastIndex) {
        newChildren.push({ type: "text", value: value.slice(lastIndex, m.index) });
      }
      newChildren.push({
        type: "html",
        value: `<span class="inline-source"><span class="inline-source-tag">source</span>${escapeHtml(content)}</span>`,
      });
      lastIndex = m.index + m[0].length;
    }

    if (lastIndex < value.length) {
      newChildren.push({ type: "text", value: value.slice(lastIndex) });
    }
  }

  if (changed) {
    parent.children = newChildren;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
```

### 3. `crates/app/src/components/Editor/MarkdownPreview.tsx`

Added import and wired the plugin:
```typescript
import { remarkInlineSource } from "./remarkInlineSource";
const remarkPlugins = [remarkGfm, remarkCalloutMerge, remarkInlineSource];
```

### 4. CSS additions in `crates/app/src/App.css`:
```css
/* Inline source citations [!source ...] */
.editor-body .cm-editor .cm-source-tag {
  color: var(--accent);
  opacity: 0.45;
  font-size: 0.85em;
}
.editor-body .cm-editor .cm-source-content {
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  border-bottom: 1.5px solid var(--accent);
  color: var(--text-secondary);
  font-style: italic;
}
.editor-body .cm-editor .cm-source-bracket {
  opacity: 0.3;
}
.inline-source {
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  border-bottom: 1.5px solid var(--accent);
  font-style: italic;
  color: var(--text-secondary);
}
.inline-source-tag {
  color: var(--accent);
  font-size: 0.8em;
  font-weight: 600;
  font-style: normal;
  margin-right: 4px;
  text-transform: uppercase;
  opacity: 0.7;
}
```

**IMPORTANT**: Write your review findings to the file `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/inline-source-review-1.md`. This is a research-only task — do NOT edit any source code files.

---

## Assistant



I'll review the changed files carefully, starting by reading the full source files for complete context.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkInlineSource.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx"}`

---

## Assistant

Now let me check if there are any tests for the new code.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"remarkInlineSource|inlineSource|inline-source|cm-source-tag","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkInlineSource.test.ts"}`

---

## Assistant

Now I have a thorough understanding of the code. Let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/inline-source-review-1.md","content":"# Code Review: Inline Source Citations\n\n**Files reviewed:**\n- `crates/app/src/co`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/inline-source-review-1.md`.

**Summary of findings:**

- **0 bugs** found. Initial suspicion about stale global regex state was retracted on closer inspection (lastIndex is properly reset before each use).
- **2 should-fix items:**
  1. `walkBlock` in `remarkInlineSource.ts` relies on implicit fallthrough for `listItem` nodes -- works but is fragile and deserves a clarifying comment.
  2. Missing test for inline source citations inside list items (`remarkInlineSource.test.ts`).
- **3 suggestions:**
  1. Duplicate tree iteration in `cmMarkdownDecorations.ts` -- the skip-ranges for inline source could be collected during the existing first tree walk.
  2. O(n*m) overlap check via `skipRanges.some()` -- fine for typical docs but could use binary search if perf becomes a concern.
  3. No unit tests for the CodeMirror decoration pass (separate logic from the remark plugin).

The code is solid overall -- clean separation between the remark plugin and CM decorations, proper HTML escaping, and good test coverage for the remark side.

---

