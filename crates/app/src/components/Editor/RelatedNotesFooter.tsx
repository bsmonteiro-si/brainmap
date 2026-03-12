import { useEffect, useMemo, useState } from "react";
import { useEditorStore } from "../../stores/editorStore";
import { useGraphStore } from "../../stores/graphStore";
import { getNodeColor } from "../GraphView/graphStyles";

export function RelatedNotesFooter() {
  const activeNote = useEditorStore((s) => s.activeNote);
  const edges = useGraphStore((s) => s.edges);
  const nodes = useGraphStore((s) => s.nodes);
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Reset showAll when the active note changes
  useEffect(() => {
    setShowAll(false);
  }, [activeNote?.path]);

  const related = useMemo(() => {
    if (!activeNote) return [];
    const outgoing = (activeNote.links ?? []).map((l) => ({
      dir: "out" as const,
      rel: l.rel,
      path: l.target,
      title: nodes.get(l.target)?.title ?? l.target,
      noteType: nodes.get(l.target)?.note_type ?? "reference",
    }));
    const incoming = edges
      .filter((e) => e.target === activeNote.path)
      .map((e) => ({
        dir: "in" as const,
        rel: e.rel,
        path: e.source,
        title: nodes.get(e.source)?.title ?? e.source,
        noteType: nodes.get(e.source)?.note_type ?? "reference",
      }));
    return [...outgoing, ...incoming];
  }, [activeNote, edges, nodes]);

  if (!activeNote || related.length === 0) return null;

  const visible = showAll ? related : related.slice(0, 10);

  return (
    <div className="related-notes-footer">
      <button
        className="related-notes-toggle"
        onClick={() => setExpanded((e) => !e)}
      >
        <span>{expanded ? "\u25BE" : "\u25B8"}</span>
        Related Notes ({related.length})
      </button>
      {expanded && (
        <div className="related-notes-list">
          {visible.map((item) => (
            <div
              key={`${item.dir}:${item.path}:${item.rel}`}
              className="related-note-card"
              onClick={() => {
                useGraphStore.getState().selectNode(item.path);
                useEditorStore.getState().openNote(item.path);
              }}
            >
              <span
                className="related-note-type-bar"
                style={{ backgroundColor: getNodeColor(item.noteType) }}
              />
              <span className="related-note-rel">{item.rel}</span>
              <span className="related-note-title">{item.title}</span>
            </div>
          ))}
          {!showAll && related.length > 10 && (
            <button className="related-notes-more" onClick={() => setShowAll(true)}>
              Show {related.length - 10} more…
            </button>
          )}
        </div>
      )}
    </div>
  );
}
