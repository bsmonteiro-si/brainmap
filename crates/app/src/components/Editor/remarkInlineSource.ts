/**
 * Remark plugin that transforms inline source citations [!source ...]
 * into structured MDAST nodes for rendering as styled <span> elements.
 *
 * Walks text nodes in paragraphs/list-items, splits on the citation regex,
 * and inserts HTML nodes. Code blocks are safe — only phrasing-content
 * parents (paragraph, heading, emphasis, etc.) are visited.
 */

import type { Root, PhrasingContent, Parent } from "mdast";

const INLINE_SOURCE_RE = /\[!source\s+([^\]]+)\]/g;

/** Node types whose children are phrasing (inline) content. */
const PHRASING_PARENTS = new Set([
  "paragraph", "heading", "emphasis", "strong", "delete",
  "link", "linkReference", "tableCell",
]);

export function remarkInlineSource() {
  return (tree: Root) => {
    walkBlock(tree);
  };
}

/** Walk block-level children recursively. */
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

/** Replace text nodes containing [!source ...] with split children. */
function transformPhrasing(parent: Parent & { children: PhrasingContent[] }) {
  const newChildren: PhrasingContent[] = [];
  let changed = false;

  for (const child of parent.children) {
    if (child.type === "inlineCode") {
      newChildren.push(child);
      continue;
    }
    // Recurse into nested phrasing parents (emphasis, strong, etc.)
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

    // Split the text around citation matches
    changed = true;
    let lastIndex = 0;
    INLINE_SOURCE_RE.lastIndex = 0;
    let m: RegExpExecArray | null;

    while ((m = INLINE_SOURCE_RE.exec(value)) !== null) {
      const content = m[1];
      if (!content.trim()) continue; // skip whitespace-only
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
