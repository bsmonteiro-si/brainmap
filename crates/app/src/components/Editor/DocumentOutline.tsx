import { useState, useRef, useEffect, useMemo } from "react";
import { EditorView } from "@codemirror/view";
import { useEditorStore } from "../../stores/editorStore";

export interface HeadingEntry {
  level: number;
  text: string;
  from: number;
}

/**
 * Extract markdown headings from text. Exported for testing.
 */
export function extractHeadings(text: string): HeadingEntry[] {
  const result: HeadingEntry[] = [];
  let pos = 0;
  let inFencedBlock = false;

  for (const line of text.split("\n")) {
    if (/^```/.test(line)) {
      inFencedBlock = !inFencedBlock;
    } else if (!inFencedBlock) {
      const m = line.match(/^(#{1,6})\s+(.+)/);
      if (m) {
        result.push({ level: m[1].length, text: m[2].trim(), from: pos });
      }
    }
    pos += line.length + 1;
  }

  return result;
}

interface Props {
  editorView: EditorView | null;
}

export function DocumentOutline({ editorView }: Props) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const editedBody = useEditorStore((s) => s.editedBody);
  const noteBody = useEditorStore((s) => s.activeNote?.body);
  const content = editedBody ?? noteBody ?? "";

  const headings = useMemo(() => extractHeadings(content), [content]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const scrollToHeading = (heading: HeadingEntry) => {
    if (!editorView) return;
    const pos = Math.min(heading.from, editorView.state.doc.length);
    editorView.dispatch({
      selection: { anchor: pos },
      effects: EditorView.scrollIntoView(pos, { y: "start" }),
    });
    editorView.focus();
    setOpen(false);
  };

  return (
    <div className="outline-container" ref={dropdownRef}>
      <button
        className={`editor-line-numbers-btn${open ? " editor-line-numbers-btn--active" : ""}`}
        onClick={() => setOpen(!open)}
        title={`Document outline${headings.length > 0 ? ` (${headings.length})` : ""}`}
        type="button"
      >
        ≡
      </button>
      {open && (
        <div className="outline-dropdown">
          {headings.length === 0 ? (
            <div className="outline-empty">No headings found</div>
          ) : (
            headings.map((h, i) => (
              <button
                key={i}
                className="outline-item"
                style={{ paddingLeft: `${(h.level - 1) * 12 + 8}px` }}
                onClick={() => scrollToHeading(h)}
              >
                {h.text}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
