import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { resolveNotePath, isLocalMdLink } from "../../utils/resolveNotePath";
import { useGraphStore } from "../../stores/graphStore";
import { useEditorStore } from "../../stores/editorStore";

interface Props {
  content: string;
  notePath: string;
}

const remarkPlugins = [remarkGfm];

export function MarkdownPreview({ content, notePath }: Props) {
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
              title="Click to open note"
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.preventDefault();
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
    }),
    [notePath],
  );

  return (
    <div className="md-preview">
      <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
