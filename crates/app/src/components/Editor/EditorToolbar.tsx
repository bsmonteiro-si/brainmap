import { useState, useRef, useEffect } from "react";
import type { EditorView } from "@codemirror/view";
import {
  toggleWrap,
  toggleLinePrefix,
  toggleOrderedList,
  setHeading,
  insertLink,
  insertAtCursor,
  insertCallout,
  insertTable,
} from "./cmFormatting";
import { CALLOUT_TYPE_ENTRIES } from "./calloutTypes";

interface Props {
  editorView: EditorView | null;
}

interface ToolbarButton {
  label: string;
  title: string;
  action: (view: EditorView) => void;
}

const BUTTONS: (ToolbarButton | "sep")[] = [
  { label: "B", title: "Bold (Cmd+B)", action: (v) => toggleWrap(v, "**") },
  { label: "I", title: "Italic (Cmd+I)", action: (v) => toggleWrap(v, "*") },
  { label: "S", title: "Strikethrough (Cmd+Shift+X)", action: (v) => toggleWrap(v, "~~") },
  { label: "<>", title: "Inline Code (Cmd+E)", action: (v) => toggleWrap(v, "`") },
  "sep",
  { label: "H1", title: "Heading 1 (Cmd+Shift+1)", action: (v) => setHeading(v, 1) },
  { label: "H2", title: "Heading 2 (Cmd+Shift+2)", action: (v) => setHeading(v, 2) },
  { label: "H3", title: "Heading 3 (Cmd+Shift+3)", action: (v) => setHeading(v, 3) },
  "sep",
  { label: "\u2014", title: "Bulleted List", action: (v) => toggleLinePrefix(v, "- ") },
  { label: "1.", title: "Numbered List", action: (v) => toggleOrderedList(v) },
  { label: "\u275D", title: "Blockquote", action: (v) => toggleLinePrefix(v, "> ") },
  "sep",
  { label: "\uD83D\uDD17", title: "Link (Cmd+K)", action: (v) => insertLink(v) },
  { label: "\u2015", title: "Horizontal Rule", action: (v) => insertAtCursor(v, "\n---\n") },
  { label: "\u2637", title: "Insert Table", action: (v) => insertTable(v) },
];

export function EditorToolbar({ editorView }: Props) {
  const [calloutOpen, setCalloutOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!calloutOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setCalloutOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [calloutOpen]);

  return (
    <div className="editor-toolbar">
      {BUTTONS.map((btn, i) => {
        if (btn === "sep") {
          return <span key={`sep-${i}`} className="editor-toolbar-sep" />;
        }
        return (
          <button
            key={btn.title}
            className={`editor-toolbar-btn${btn.label === "B" ? " editor-toolbar-btn--bold" : ""}${btn.label === "I" ? " editor-toolbar-btn--italic" : ""}`}
            title={btn.title}
            disabled={!editorView}
            onMouseDown={(e) => {
              e.preventDefault();
              if (editorView) btn.action(editorView);
            }}
            type="button"
          >
            {btn.label}
          </button>
        );
      })}
      <span className="editor-toolbar-sep" />
      <div className="callout-picker-wrapper">
        <button
          ref={triggerRef}
          className="editor-toolbar-btn"
          title="Insert Callout"
          disabled={!editorView}
          onMouseDown={(e) => {
            e.preventDefault();
            setCalloutOpen((v) => !v);
          }}
          type="button"
        >
          ☰
        </button>
        {calloutOpen && (
          <div ref={popoverRef} className="callout-picker-popover">
            {CALLOUT_TYPE_ENTRIES.map(([type, { label, Icon, color }]) => (
              <button
                key={type}
                className="callout-picker-item"
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (editorView) {
                    insertCallout(editorView, type);
                    setCalloutOpen(false);
                  }
                }}
                type="button"
              >
                <Icon size={14} color={color} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
