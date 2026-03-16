import React, { useMemo, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { resolveNotePath, isLocalNoteLink, ensureMdExtension } from "../../utils/resolveNotePath";
import { useGraphStore } from "../../stores/graphStore";
import { useEditorStore } from "../../stores/editorStore";
import { CALLOUT_TYPES, CALLOUT_FALLBACK, CALLOUT_RE } from "./calloutTypes";
import { remarkCalloutMerge } from "./remarkCalloutMerge";
import { remarkInlineSource } from "./remarkInlineSource";
import { preprocessCallouts, encodeLinkSpaces } from "./calloutPreprocess";

interface Props {
  content: string;
  notePath: string;
}

const remarkPlugins = [remarkGfm, remarkCalloutMerge, remarkInlineSource];

interface CalloutInfo {
  type: string;
  title: string;
  restChildren: React.ReactNode[];
}

/**
 * Inspect the React children of a <blockquote> to detect callout syntax.
 * react-markdown v10 renders `> [!type] title` as:
 *   <blockquote><p>"[!type] title"</p><p>body...</p></blockquote>
 * The first <p>'s first child must be a string matching CALLOUT_RE.
 */
export function extractCalloutFromChildren(
  children: React.ReactNode
): CalloutInfo | null {
  const arr = React.Children.toArray(children);
  if (arr.length === 0) return null;

  // Find the first <p> element (skip whitespace text nodes)
  const firstPIndex = arr.findIndex(
    (c) => React.isValidElement(c) && c.type === "p"
  );
  if (firstPIndex === -1) return null;
  const firstP = arr[firstPIndex] as React.ReactElement;

  const pChildren = React.Children.toArray(firstP.props.children);
  if (pChildren.length === 0) return null;

  // The leading text node must be a string
  const firstText = pChildren[0];
  if (typeof firstText !== "string") return null;

  const match = firstText.match(CALLOUT_RE);
  if (!match) return null;

  const type = match[1];
  const title = (match[2] || "").trim();

  // react-markdown merges consecutive blockquote lines into one <p> with \n.
  // Text after the matched [!type] line is body content.
  const afterMatch = firstText.slice(match.index! + match[0].length);
  const bodyTextFromFirstNode = afterMatch.startsWith("\n")
    ? afterMatch.slice(1)
    : afterMatch;

  const remainingPChildren = pChildren.slice(1);
  const restChildren: React.ReactNode[] = [];

  // Reconstruct body: leftover text from first node + remaining <p> children
  const firstPBody = [
    ...(bodyTextFromFirstNode ? [bodyTextFromFirstNode] : []),
    ...remainingPChildren,
  ];
  if (firstPBody.length > 0) {
    restChildren.push(
      React.createElement("p", { key: "callout-first-p" }, ...firstPBody)
    );
  }

  // Add all subsequent blockquote children (other <p>s, lists, etc.)
  // Skip whitespace-only text nodes between elements
  for (let i = firstPIndex + 1; i < arr.length; i++) {
    const child = arr[i];
    if (typeof child === "string" && child.trim() === "") continue;
    restChildren.push(child);
  }

  return { type, title, restChildren };
}

export function MarkdownPreview({ content, notePath }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const addCmd = (e: KeyboardEvent) => {
      if (e.key === "Meta" || e.key === "Control") el.classList.add("cmd-held");
    };
    const removeCmd = (e: KeyboardEvent) => {
      if (e.key === "Meta" || e.key === "Control") el.classList.remove("cmd-held");
    };
    const blurCmd = () => el.classList.remove("cmd-held");
    window.addEventListener("keydown", addCmd);
    window.addEventListener("keyup", removeCmd);
    window.addEventListener("blur", blurCmd);
    return () => {
      window.removeEventListener("keydown", addCmd);
      window.removeEventListener("keyup", removeCmd);
      window.removeEventListener("blur", blurCmd);
    };
  }, []);

  const components = useMemo(
    () => ({
      a: ({
        href,
        children,
        ...props
      }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
        children?: React.ReactNode;
      }) => {
        if (href && isLocalNoteLink(href)) {
          return (
            <a
              {...props}
              href={href}
              title="Cmd+Click to open note"
              className="md-preview-link"
              onClick={(e) => {
                e.preventDefault();
                if (!(e.metaKey || e.ctrlKey)) return;
                const resolved = ensureMdExtension(resolveNotePath(notePath, href));
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
      blockquote: ({
        children,
        node: _node,
        ...props
      }: React.BlockquoteHTMLAttributes<HTMLQuoteElement> & {
        children?: React.ReactNode;
        node?: unknown;
      }) => {
        const calloutInfo = extractCalloutFromChildren(children);
        if (!calloutInfo) {
          return <blockquote {...props}>{children}</blockquote>;
        }

        const { type, title, restChildren } = calloutInfo;
        const typeDef = CALLOUT_TYPES[type];
        const color = typeDef?.color ?? CALLOUT_FALLBACK.color;
        const typeLabel = typeDef?.label || type;
        const IconComponent = typeDef?.Icon;

        return (
          <div
            className="callout"
            style={{ "--callout-color": color } as React.CSSProperties}
          >
            <div className="callout-header" style={{ color }}>
              {IconComponent && <IconComponent size={16} />}
              <span className="callout-type-label">{typeLabel}</span>
              {title && <span className="callout-title">{title}</span>}
            </div>
            {restChildren.length > 0 && (
              <div className="callout-body">{restChildren}</div>
            )}
          </div>
        );
      },
    }),
    [notePath],
  );

  return (
    <div className="md-preview" ref={containerRef}>
      <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={[rehypeRaw]} components={components}>
        {encodeLinkSpaces(preprocessCallouts(content))}
      </ReactMarkdown>
    </div>
  );
}
