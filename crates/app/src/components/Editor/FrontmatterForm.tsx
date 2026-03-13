import { useState } from "react";
import type { NoteDetail } from "../../api/types";
import { useEditorStore } from "../../stores/editorStore";
import { TagInput } from "./TagInput";
import { ExtraFieldsEditor } from "./ExtraFieldsEditor";
import { LinksEditor } from "./LinksEditor";

const NOTE_TYPES = [
  "concept", "book-note", "question", "reference", "index",
  "argument", "evidence", "experiment", "person", "project",
];

const STATUS_OPTIONS = [
  { value: "", label: "—" },
  { value: "draft", label: "draft" },
  { value: "review", label: "review" },
  { value: "final", label: "final" },
  { value: "archived", label: "archived" },
];

interface Props {
  note: NoteDetail;
}

export function FrontmatterForm({ note }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [extraExpanded, setExtraExpanded] = useState(false);
  const fm = useEditorStore((s) => s.editedFrontmatter);
  const updateFrontmatter = useEditorStore((s) => s.updateFrontmatter);

  const title = fm?.title ?? note.title;
  const noteType = fm?.note_type ?? note.note_type;
  const status = fm?.status !== undefined ? (fm.status ?? "") : (note.status ?? "");
  const tags = fm?.tags ?? note.tags;
  const source = fm?.source !== undefined ? (fm.source ?? "") : (note.source ?? "");
  const summary = fm?.summary !== undefined ? (fm.summary ?? "") : (note.summary ?? "");
  const extra = fm?.extra ?? note.extra;

  return (
    <div className="frontmatter-form">
      <button
        className="section-toggle"
        aria-expanded={expanded}
        aria-controls="frontmatter-fields"
        onClick={() => setExpanded((e) => !e)}
      >
        <span>{expanded ? "▾" : "▸"}</span>
        Edit Metadata
      </button>
      {expanded && (
        <div className="frontmatter-fields" id="frontmatter-fields">
          <label>
            <span>Title</span>
            <input
              type="text"
              value={title}
              className={title.trim() === "" ? "frontmatter-input-error" : ""}
              onChange={(e) => updateFrontmatter({ title: e.target.value })}
            />
          </label>
          <label>
            <span>Type</span>
            <select
              value={noteType}
              onChange={(e) => updateFrontmatter({ note_type: e.target.value })}
            >
              {NOTE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
              {!NOTE_TYPES.includes(noteType) && (
                <option value={noteType}>{noteType}</option>
              )}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select
              value={status}
              onChange={(e) => updateFrontmatter({ status: e.target.value || null })}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className="frontmatter-tags-label">
            <span>Tags</span>
            <TagInput tags={tags} onChange={(t) => updateFrontmatter({ tags: t })} />
          </label>
          <label>
            <span>Source</span>
            <input
              type="text"
              value={source}
              placeholder="Source reference…"
              onChange={(e) => updateFrontmatter({ source: e.target.value || null })}
            />
          </label>
          <label className="frontmatter-summary-label">
            <span>Summary</span>
            <textarea
              rows={3}
              value={summary}
              placeholder="Brief summary…"
              onChange={(e) => updateFrontmatter({ summary: e.target.value || null })}
            />
          </label>
          <div className="frontmatter-extra-header">Links</div>
          <LinksEditor notePath={note.path} links={note.links} />
          <button
            className="frontmatter-extra-toggle"
            onClick={() => setExtraExpanded((e) => !e)}
            aria-expanded={extraExpanded}
          >
            <span>{extraExpanded ? "▾" : "▸"}</span>
            Extra Fields
          </button>
          {extraExpanded && (
            <ExtraFieldsEditor
              extra={extra}
              onChange={(e) => updateFrontmatter({ extra: e })}
            />
          )}
        </div>
      )}
    </div>
  );
}
