/**
 * Remark plugin that merges consecutive blockquotes into one when
 * the first starts with callout syntax [!type]. This allows users
 * to write paragraph breaks (blank lines) inside callouts without
 * the blockquote splitting into separate elements.
 *
 * Input:
 *   > [!ai-answer] Title
 *   > First paragraph
 *
 *   > Second paragraph     ← normally a separate blockquote
 *
 * Output AST: single blockquote with both paragraphs.
 *
 * Note: consecutive blockquotes after a callout are always merged
 * (matches Obsidian behavior). To end a callout, insert any
 * non-blockquote content (even an empty paragraph) between them.
 */

import type { Root, Blockquote, RootContent } from "mdast";

const CALLOUT_START = /^\[!\w[\w-]*\]/;

function isBlockquote(node: RootContent): node is Blockquote {
  return node.type === "blockquote";
}

function blockquoteStartsWithCallout(bq: Blockquote): boolean {
  const first = bq.children[0];
  if (!first || first.type !== "paragraph") return false;
  const textChild = first.children[0];
  if (!textChild || textChild.type !== "text") return false;
  return CALLOUT_START.test(textChild.value);
}

export function remarkCalloutMerge() {
  return (tree: Root) => {
    const newChildren: RootContent[] = [];
    let currentCallout: Blockquote | null = null;

    for (const node of tree.children) {
      if (isBlockquote(node)) {
        if (blockquoteStartsWithCallout(node)) {
          // Start a new callout accumulator
          if (currentCallout) {
            newChildren.push(currentCallout);
          }
          currentCallout = node;
        } else if (currentCallout) {
          // Continuation blockquote — merge children into current callout
          currentCallout.children.push(...node.children);
        } else {
          // Regular blockquote, not after a callout
          newChildren.push(node);
        }
      } else {
        // Non-blockquote node ends the current callout
        if (currentCallout) {
          newChildren.push(currentCallout);
          currentCallout = null;
        }
        newChildren.push(node);
      }
    }

    // Flush any remaining callout
    if (currentCallout) {
      newChildren.push(currentCallout);
    }

    tree.children = newChildren;
  };
}
