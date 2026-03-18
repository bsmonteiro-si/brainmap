import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAPI } from "../../api/bridge";
import type { NodeSummary } from "../../api/types";
import { useEditorStore } from "../../stores/editorStore";
import { useGraphStore } from "../../stores/graphStore";
import { useUIStore } from "../../stores/uiStore";
import { getNodeColor } from "../GraphView/graphStyles";

export function RelatedNotesFooter() {
  const activeNote = useEditorStore((s) => s.activeNote);
  const edges = useGraphStore((s) => s.edges);
  const nodes = useGraphStore((s) => s.nodes);
  const expanded = useUIStore((s) => s.relatedNotesExpanded);
  const toggleRelatedNotes = useUIStore((s) => s.toggleRelatedNotes);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [tooltip, setTooltip] = useState<{
    x: number; y: number; path: string;
    title: string; noteType: string; color: string;
    rel: string; dir: "in" | "out";
    tags?: string[]; summary?: string | null; status?: string | null;
  } | null>(null);
  const tooltipCacheRef = useRef<Map<string, NodeSummary>>(new Map());
  const footerRef = useRef<HTMLDivElement>(null);

  // Resizable height for expanded content area
  const STORAGE_KEY = "brainmap:relatedNotesHeight";
  const DEFAULT_HEIGHT = 180;
  const MIN_HEIGHT = 80;
  const MAX_HEIGHT = 500;
  const [contentHeight, setContentHeight] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, Number(stored))) : DEFAULT_HEIGHT;
  });
  const dragRef = useRef<{ startY: number; startH: number } | null>(null);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startY: e.clientY, startH: contentHeight };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = dragRef.current.startY - ev.clientY; // drag up = grow
      const next = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, dragRef.current.startH + delta));
      setContentHeight(next);
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      if (dragRef.current) {
        const delta = dragRef.current.startY - 0; // just save current
        localStorage.setItem(STORAGE_KEY, String(contentHeight));
      }
      dragRef.current = null;
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [contentHeight]);

  // Persist height after drag ends (contentHeight changes during drag)
  const persistTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    clearTimeout(persistTimeoutRef.current);
    persistTimeoutRef.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, String(contentHeight));
    }, 300);
  }, [contentHeight]);

  // Invalidate tooltip cache when graph data changes (e.g. after frontmatter edit)
  useEffect(() => {
    tooltipCacheRef.current.clear();
  }, [nodes]);

  // Reset per-group expansion when the active note changes
  useEffect(() => {
    setExpandedGroups(new Set());
  }, [activeNote?.path]);

  const related = useMemo(() => {
    if (!activeNote) return [];
    const outgoing = edges
      .filter((e) => e.source === activeNote.path)
      .map((e) => ({
        dir: "out" as const,
        rel: e.rel,
        path: e.target,
        title: nodes.get(e.target)?.title ?? e.target,
        noteType: nodes.get(e.target)?.note_type ?? "reference",
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

  const outgoing = related.filter((r) => r.dir === "out");
  const incoming = related.filter((r) => r.dir === "in");

  const handleCardMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    item: (typeof related)[number],
  ) => {
    const card = e.currentTarget;
    const footer = footerRef.current;
    if (!footer) return;
    const cardRect = card.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();
    const x = cardRect.left - footerRect.left;
    const y = cardRect.top - footerRect.top - 4; // above card
    const color = getNodeColor(item.noteType);
    const base = {
      x, y, path: item.path,
      title: item.title, noteType: item.noteType, color,
      rel: item.rel, dir: item.dir,
    };
    const cached = tooltipCacheRef.current.get(item.path);
    if (cached) {
      setTooltip({ ...base, tags: cached.tags, summary: cached.summary, status: cached.status });
    } else {
      setTooltip(base);
      getAPI().then((api) =>
        api.getNodeSummary(item.path).then((summary) => {
          tooltipCacheRef.current.set(item.path, summary);
          setTooltip((prev) =>
            prev && prev.path === item.path
              ? { ...prev, tags: summary.tags, summary: summary.summary, status: summary.status }
              : prev,
          );
        }).catch(() => {}),
      );
    }
  };

  const renderCard = (item: (typeof related)[number]) => (
    <div
      key={`${item.dir}:${item.path}:${item.rel}`}
      className="related-note-card"
      onClick={() => {
        useGraphStore.getState().selectNode(item.path);
        useEditorStore.getState().openNote(item.path);
      }}
      onMouseEnter={(e) => handleCardMouseEnter(e, item)}
      onMouseLeave={() => setTooltip(null)}
    >
      <span
        className="related-note-type-bar"
        style={{ backgroundColor: getNodeColor(item.noteType) }}
      />
      <span className="related-note-dir">{item.dir === "out" ? "→" : "←"}</span>
      <span className="related-note-rel">{item.rel}</span>
      <span className="related-note-title">{item.title}</span>
    </div>
  );

  const renderGroup = (
    label: string,
    items: typeof related,
  ) => {
    if (items.length === 0) return null;
    const groupExpanded = expandedGroups.has(label);
    const visible = groupExpanded ? items : items.slice(0, 10);
    return (
      <div className="related-notes-group">
        <div className="related-notes-group-label">
          {label} ({items.length})
        </div>
        <div className="related-notes-list">
          {visible.map(renderCard)}
        </div>
        {!groupExpanded && items.length > 10 && (
          <button
            className="related-notes-more"
            onClick={() =>
              setExpandedGroups((prev) => {
                const next = new Set(prev);
                next.add(label);
                return next;
              })
            }
          >
            Show {items.length - 10} more…
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="related-notes-footer" ref={footerRef}>
      {expanded && (
        <div className="related-notes-resize-handle" onMouseDown={onDragStart} />
      )}
      <button
        className="related-notes-toggle"
        onClick={toggleRelatedNotes}
      >
        <span>{expanded ? "\u25BE" : "\u25B8"}</span>
        Related Notes ({related.length})
      </button>
      {expanded && (
        <div className="related-notes-groups" style={{ height: contentHeight, overflow: "auto" }}>
          {renderGroup("Outgoing", outgoing)}
          {renderGroup("Incoming", incoming)}
        </div>
      )}
      {expanded && tooltip && (
        <div
          className="related-note-tooltip"
          style={{ left: tooltip.x, bottom: footerRef.current ? footerRef.current.getBoundingClientRect().height - (tooltip.y) : 0 }}
        >
          <div className="tooltip-header">
            <span className="tooltip-type-pill" style={{ background: tooltip.color }}>{tooltip.noteType}</span>
            <span className="tooltip-rel-pill">{tooltip.dir === "out" ? "→" : "←"} {tooltip.rel}</span>
          </div>
          <span className="tooltip-title">{tooltip.title}</span>
          {tooltip.status && <span className="tooltip-status">{tooltip.status}</span>}
          {tooltip.summary && <span className="tooltip-summary">{tooltip.summary}</span>}
          {tooltip.tags && tooltip.tags.length > 0 && (
            <div className="tooltip-tags">
              {tooltip.tags.slice(0, 4).map((t) => (
                <span key={t} className="tooltip-tag">{t}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
