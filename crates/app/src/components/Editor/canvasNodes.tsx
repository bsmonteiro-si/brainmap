import { memo, useState, useRef, useEffect, useCallback } from "react";
import { flushSync } from "react-dom";
import {
  Handle, Position, NodeResizer, NodeToolbar,
  BaseEdge, EdgeLabelRenderer, getBezierPath, getStraightPath, getSmoothStepPath, useReactFlow, useStore,
} from "@xyflow/react";
import type { NodeProps, EdgeProps, ReactFlowState } from "@xyflow/react";
import { Trash2, Palette, Paintbrush, PenLine, Shapes, Type, AlignLeft, AlignCenter, AlignRight, AlignJustify, AlignStartVertical, AlignCenterVertical, AlignEndVertical, Spline, Minus, CornerDownRight, ChevronDown, ChevronRight, FileText, FileImage, FileVideo, FileAudio, FileSpreadsheet, FileArchive, Presentation, LayoutDashboard, PenTool, ALargeSmall } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { CANVAS_SHAPES, getShapeDefinition } from "./canvasShapes";
import type { CanvasShapeId } from "./canvasShapes";
import { useGraphStore } from "../../stores/graphStore";
import { useEditorStore } from "../../stores/editorStore";
import { useTabStore } from "../../stores/tabStore";
import { useUIStore } from "../../stores/uiStore";
import { useCanvasPanelMode, useCanvasSave, useCanvasSnapshot } from "./CanvasEditor";

import { getNodeColor } from "../GraphView/graphStyles";

// JSON Canvas preset colors
const CANVAS_COLORS = [
  { id: "1", color: "#e74c3c", label: "Red" },
  { id: "2", color: "#f39c12", label: "Orange" },
  { id: "3", color: "#f1c40f", label: "Yellow" },
  { id: "4", color: "#27ae60", label: "Green" },
  { id: "5", color: "#3498db", label: "Cyan" },
  { id: "6", color: "#9b59b6", label: "Purple" },
];

const FONT_SIZES = [11, 13, 16, 20, 24];
const FONT_FAMILIES = [
  { id: "sans-serif", label: "Sans" },
  { id: "serif", label: "Serif" },
  { id: "monospace", label: "Mono" },
  { id: "'Chalkboard SE', cursive", label: "Sketch" },
];
const TEXT_ALIGNMENTS = [
  { id: "left", icon: AlignLeft, label: "Left" },
  { id: "center", icon: AlignCenter, label: "Center" },
  { id: "right", icon: AlignRight, label: "Right" },
  { id: "justify", icon: AlignJustify, label: "Justify" },
] as const;
const VERTICAL_ALIGNMENTS = [
  { id: "top", icon: AlignStartVertical, label: "Top" },
  { id: "center", icon: AlignCenterVertical, label: "Center" },
  { id: "bottom", icon: AlignEndVertical, label: "Bottom" },
] as const;

// ── Card kind metadata (typed text card subtypes) ────────────────────────────

export const CARD_KIND_META: { id: string; label: string; icon: string; color: string }[] = [
  { id: "summary",    label: "Summary",    icon: "ClipboardList",  color: "#3b82f6" },
  { id: "question",   label: "Question",   icon: "HelpCircle",     color: "#f59e0b" },
  { id: "transition", label: "Transition", icon: "ArrowRightLeft", color: "#10b981" },
];

// ── Color picker dropdown (shared by node + edge toolbars) ────────────────────

function ColorPickerDropdown({
  onSelect,
  onClear,
  onClose,
  clearLabel = "Clear",
}: {
  onSelect: (color: string) => void;
  onClear: () => void;
  onClose: () => void;
  clearLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [onClose]);

  return (
    <div className="canvas-color-picker" ref={ref}>
      {CANVAS_COLORS.map((c) => (
        <button
          key={c.id}
          className="canvas-color-swatch"
          style={{ backgroundColor: c.color }}
          title={c.label}
          onClick={() => onSelect(c.color)}
        />
      ))}
      <label className="canvas-color-swatch canvas-color-swatch--custom" title="Custom color"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="color"
          className="canvas-color-input-hidden"
          onInput={(e) => onSelect((e.target as HTMLInputElement).value)}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        />
      </label>
      <button
        className="canvas-color-swatch canvas-color-swatch--clear"
        title={clearLabel}
        onClick={() => { onClear(); onClose(); }}
      >
        ×
      </button>
    </div>
  );
}

// ── Shared handles ────────────────────────────────────────────────────────────

function FourHandles() {
  return (
    <>
      <Handle type="target" position={Position.Top} id="top-target" className="canvas-handle" />
      <Handle type="source" position={Position.Top} id="top" className="canvas-handle" />
      <Handle type="target" position={Position.Right} id="right-target" className="canvas-handle" />
      <Handle type="source" position={Position.Right} id="right" className="canvas-handle" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="canvas-handle" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="canvas-handle" />
      <Handle type="target" position={Position.Left} id="left-target" className="canvas-handle" />
      <Handle type="source" position={Position.Left} id="left" className="canvas-handle" />
    </>
  );
}

// ── Node toolbar (delete + color) ─────────────────────────────────────────────

const selectSelectedCount = (s: ReactFlowState) =>
  Array.from(s.nodeLookup.values()).filter((n) => n.selected).length;

const selectTotalSelectedCount = (s: ReactFlowState) =>
  Array.from(s.nodeLookup.values()).filter((n) => n.selected).length +
  Array.from(s.edgeLookup.values()).filter((e) => e.selected).length;

function CanvasNodeToolbar({ id, selected, shape, fontSize, fontFamily, textAlign, textVAlign, titleVAlign }: {
  id: string; selected: boolean; shape?: string;
  fontSize?: number; fontFamily?: string; textAlign?: string; textVAlign?: string; titleVAlign?: string;
}) {
  const { setNodes, setEdges } = useReactFlow();
  const scheduleSave = useCanvasSave();
  const selectedCount = useStore(selectSelectedCount);
  const [showColors, setShowColors] = useState(false);
  const [showBgColors, setShowBgColors] = useState(false);
  const [showShapes, setShowShapes] = useState(false);
  const [showTextFormat, setShowTextFormat] = useState(false);

  const closeAllDropdowns = () => { setShowColors(false); setShowBgColors(false); setShowShapes(false); setShowTextFormat(false); };
  const setNodeData = (patch: Record<string, unknown>) => {
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, ...patch } } : n));
    scheduleSave();
  };

  const handleDelete = () => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    scheduleSave();
  };

  const handleColor = (color: string) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, color } } : n,
      ),
    );
    scheduleSave();
  };

  const handleClearColor = () => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== id) return n;
        const { color: _, ...rest } = n.data as Record<string, unknown>;
        return { ...n, data: rest };
      }),
    );
    scheduleSave();
  };

  const handleBgColor = (bgColor: string) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, bgColor } } : n,
      ),
    );
    scheduleSave();
  };

  const handleClearBgColor = () => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== id) return n;
        const { bgColor: _, ...rest } = n.data as Record<string, unknown>;
        return { ...n, data: rest };
      }),
    );
    scheduleSave();
  };

  return (
    <NodeToolbar isVisible={selected && selectedCount <= 1} position={Position.Top} offset={8}>
      <div className="canvas-node-toolbar">
        <button
          className="canvas-node-toolbar-btn"
          title="Delete"
          onClick={handleDelete}
        >
          <Trash2 size={16} />
        </button>
        <div className="canvas-node-toolbar-color-wrapper">
          <button
            className="canvas-node-toolbar-btn"
            title="Border color"
            onClick={() => { const next = !showColors; closeAllDropdowns(); setShowColors(next); }}
          >
            <Palette size={16} />
          </button>
          {showColors && (
            <ColorPickerDropdown onSelect={handleColor} onClear={handleClearColor} onClose={() => setShowColors(false)} clearLabel="Clear color" />
          )}
        </div>
        <div className="canvas-node-toolbar-color-wrapper">
          <button
            className="canvas-node-toolbar-btn"
            title="Background color"
            onClick={() => { const next = !showBgColors; closeAllDropdowns(); setShowBgColors(next); }}
          >
            <Paintbrush size={16} />
          </button>
          {showBgColors && (
            <ColorPickerDropdown onSelect={handleBgColor} onClear={handleClearBgColor} onClose={() => setShowBgColors(false)} clearLabel="Clear background" />
          )}
        </div>
        {shape !== undefined && (
          <div className="canvas-node-toolbar-color-wrapper">
            <button
              className="canvas-node-toolbar-btn"
              title="Shape"
              onClick={() => { const next = !showShapes; closeAllDropdowns(); setShowShapes(next); }}
            >
              <Shapes size={16} />
            </button>
            {showShapes && (
              <div className="canvas-shape-picker">
                {CANVAS_SHAPES.map((s) => {
                  const Icon = (LucideIcons as Record<string, React.ComponentType<{ size?: number }>>)[s.icon];
                  const active = (shape || "rectangle") === s.id;
                  return (
                    <button
                      key={s.id}
                      className={`canvas-shape-picker-btn${active ? " canvas-shape-picker-btn--active" : ""}`}
                      title={s.label}
                      onClick={() => {
                        const isFixed = s.id === "circle" || s.id === "diamond";
                        setNodes((nds) => nds.map((n) => {
                          if (n.id !== id) return n;
                          const st = (n.style ?? {}) as Record<string, unknown>;
                          const newData = { ...n.data, shape: s.id };
                          if (isFixed && typeof st.minHeight === "number") {
                            const { minHeight: mh, ...rest } = st;
                            return { ...n, data: newData, style: { ...rest, height: mh } };
                          }
                          if (!isFixed && typeof st.height === "number") {
                            const { height: h, ...rest } = st;
                            return { ...n, data: newData, style: { ...rest, minHeight: h } };
                          }
                          return { ...n, data: newData };
                        }));
                        setShowShapes(false);
                        scheduleSave();
                      }}
                    >
                      {Icon && <Icon size={16} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
        <div className="canvas-node-toolbar-color-wrapper">
          <button
            className="canvas-node-toolbar-btn"
            title="Text formatting"
            onClick={() => { const next = !showTextFormat; closeAllDropdowns(); setShowTextFormat(next); }}
          >
            <Type size={16} />
          </button>
          {showTextFormat && (
            <div className="canvas-text-format-picker">
              <div className="canvas-text-format-section">
                <span className="canvas-text-format-section-label">Size</span>
                <div className="canvas-text-format-row">
                  {FONT_SIZES.map((s) => (
                    <button
                      key={s}
                      className={`canvas-text-format-btn${(fontSize ?? 13) === s ? " canvas-text-format-btn--active" : ""}`}
                      onClick={() => { setNodeData({ fontSize: s }); }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="canvas-text-format-section">
                <span className="canvas-text-format-section-label">Font</span>
                <div className="canvas-text-format-row">
                  {FONT_FAMILIES.map((f) => (
                    <button
                      key={f.id}
                      className={`canvas-text-format-btn${(fontFamily ?? "") === f.id ? " canvas-text-format-btn--active" : ""}`}
                      style={{ fontFamily: f.id }}
                      onClick={() => { setNodeData({ fontFamily: fontFamily === f.id ? undefined : f.id }); }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              {shape !== undefined && (
                <>
                  <div className="canvas-text-format-section">
                    <span className="canvas-text-format-section-label">Align</span>
                    <div className="canvas-text-format-row">
                      {TEXT_ALIGNMENTS.map((a) => (
                        <button
                          key={a.id}
                          className={`canvas-text-format-btn${(textAlign ?? "center") === a.id ? " canvas-text-format-btn--active" : ""}`}
                          title={a.label}
                          onClick={() => { setNodeData({ textAlign: a.id }); }}
                        >
                          <a.icon size={14} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="canvas-text-format-section">
                    <span className="canvas-text-format-section-label">Vertical</span>
                    <div className="canvas-text-format-row">
                      {VERTICAL_ALIGNMENTS.map((a) => (
                        <button
                          key={a.id}
                          className={`canvas-text-format-btn${(textVAlign ?? "center") === a.id ? " canvas-text-format-btn--active" : ""}`}
                          title={a.label}
                          onClick={() => { setNodeData({ textVAlign: a.id }); }}
                        >
                          <a.icon size={14} />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        {titleVAlign !== undefined && (
          <div className="canvas-node-toolbar-color-wrapper">
            <button
              className="canvas-node-toolbar-btn"
              title="Title position"
              onClick={() => {
                const order = ["top", "center", "bottom"];
                const idx = order.indexOf(titleVAlign || "top");
                setNodeData({ titleVAlign: order[(idx + 1) % 3] });
              }}
            >
              {(titleVAlign || "top") === "top" && <AlignStartVertical size={16} />}
              {titleVAlign === "center" && <AlignCenterVertical size={16} />}
              {titleVAlign === "bottom" && <AlignEndVertical size={16} />}
            </button>
          </div>
        )}
      </div>
    </NodeToolbar>
  );
}

// ── Resizer (always rendered, visible on hover via CSS) ───────────────────────

function Resizer({ id, selected, minWidth = 120, minHeight = 40, autoHeight = false }: {
  id: string; selected: boolean; minWidth?: number; minHeight?: number; autoHeight?: boolean;
}) {
  const { setNodes } = useReactFlow();
  const scheduleSave = useCanvasSave();

  // Capture the content height before resize starts so we can compare on end
  const preResizeHeightRef = useRef<number>(0);

  // On resize start, drop CSS min-height to the component floor so the user can
  // freely shrink the node, and set an explicit height to preserve the visual start.
  // On resize end, convert back to minHeight so the node can still auto-expand.
  // flushSync ensures the DOM has the lowered min-height before the first
  // drag frame fires — without it, CSS min-height from the previous render
  // prevents visual shrinking on the first pointer-move.
  const handleResizeStart = useCallback(() => {
    if (!autoHeight) return;
    flushSync(() => {
      setNodes((nds) => nds.map((n) => {
        if (n.id !== id) return n;
        const style = (n.style ?? {}) as Record<string, unknown>;
        if (typeof style.minHeight !== "number") return n;
        const mh = style.minHeight as number;
        const actualH = n.measured?.height ?? mh;
        preResizeHeightRef.current = actualH;
        return { ...n, style: { ...style, minHeight: minHeight, height: actualH } };
      }));
    });
  }, [id, autoHeight, minHeight, setNodes]);

  const handleResizeEnd = useCallback(() => {
    if (!autoHeight) return;
    setNodes((nds) => nds.map((n) => {
      if (n.id !== id) return n;
      const style = (n.style ?? {}) as Record<string, unknown>;
      if (typeof style.height !== "number") return n;
      const h = style.height as number;
      const { height, ...rest } = style;
      if (h < preResizeHeightRef.current) {
        // User shrunk below original content height: keep explicit height
        return { ...n, style: { ...rest, height: h } };
      }
      // User kept or grew: restore minHeight for auto-expand
      return { ...n, style: { ...rest, minHeight: h } };
    }));
    scheduleSave();
  }, [id, autoHeight, setNodes, scheduleSave]);

  return (
    <NodeResizer
      isVisible={selected}
      minWidth={minWidth}
      minHeight={minHeight}
      lineClassName="canvas-resize-line"
      handleClassName="canvas-resize-handle"
      onResizeStart={autoHeight ? handleResizeStart : undefined}
      onResizeEnd={autoHeight ? handleResizeEnd : undefined}
    />
  );
}

// ── File type visual identification ──────────────────────────────────────────

function getFileTypeInfo(filePath: string): { icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>; label: string; color: string } | null {
  const ext = filePath.split(".").pop()?.toLowerCase();
  if (!ext) return null;
  switch (ext) {
    case "pdf": return { icon: FileText, label: "PDF", color: "#e74c3c" };
    case "png": case "jpg": case "jpeg": case "gif": case "svg": case "webp": case "bmp": case "ico":
      return { icon: FileImage, label: ext.toUpperCase(), color: "#9b59b6" };
    case "mp4": case "mov": case "avi": case "mkv": case "webm":
      return { icon: FileVideo, label: ext.toUpperCase(), color: "#e67e22" };
    case "mp3": case "wav": case "ogg": case "flac": case "m4a": case "aac":
      return { icon: FileAudio, label: ext.toUpperCase(), color: "#1abc9c" };
    case "pptx": case "ppt": return { icon: Presentation, label: ext.toUpperCase(), color: "#e74c3c" };
    case "xlsx": case "xls": case "csv": return { icon: FileSpreadsheet, label: ext.toUpperCase(), color: "#27ae60" };
    case "docx": case "doc": return { icon: FileText, label: ext.toUpperCase(), color: "#3498db" };
    case "zip": case "tar": case "gz": case "rar": case "7z":
      return { icon: FileArchive, label: ext.toUpperCase(), color: "#95a5a6" };
    case "canvas": return { icon: LayoutDashboard, label: "CANVAS", color: "#8e44ad" };
    case "excalidraw": return { icon: PenTool, label: "DRAW", color: "#f39c12" };
    default: return null;
  }
}

// ── File Node ─────────────────────────────────────────────────────────────────

function CanvasFileNodeInner({ id, data, selected }: NodeProps) {
  const d = data as { file?: string; subpath?: string; color?: string; bgColor?: string; titleVAlign?: string; fontSize?: number; fontFamily?: string };
  const filePath = d.file ?? "";
  const node = useGraphStore((s) => s.nodes.get(filePath));
  const fileExists = useGraphStore((s) => s.workspaceFiles.includes(filePath));
  const panelMode = useCanvasPanelMode();


  const openFile = () => {
    const lp = filePath.toLowerCase();
    if (node) {
      useGraphStore.getState().selectNode(filePath);
      useEditorStore.getState().openNote(filePath);
    } else if (lp.endsWith(".pdf")) {
      const fileName = filePath.split("/").pop() ?? filePath;
      useTabStore.getState().openTab(filePath, "pdf", fileName, null);
      useEditorStore.getState().clearForCustomTab();
    } else if (lp.endsWith(".canvas")) {
      const fileName = filePath.split("/").pop() ?? filePath;
      useTabStore.getState().openTab(filePath, "canvas", fileName, null);
      useEditorStore.getState().clearForCustomTab();
    } else if (lp.endsWith(".excalidraw")) {
      const fileName = filePath.split("/").pop() ?? filePath;
      useTabStore.getState().openTab(filePath, "excalidraw", fileName, null);
      useEditorStore.getState().clearForCustomTab();
    } else {
      useGraphStore.getState().selectNode(null);
      useEditorStore.getState().openPlainFile(filePath);
    }
  };

  const title = node?.title ?? filePath.split("/").pop() ?? filePath;
  const noteType = node?.note_type;
  const tags = node?.tags ?? [];
  const summary = node?.summary;
  const fileTypeInfo = getFileTypeInfo(filePath);
  const borderColor = d.color ?? (noteType ? getNodeColor(noteType) : fileTypeInfo?.color ?? "var(--border-color)");

  return (
    <div
      className="canvas-file-node"
      data-title-valign={d.titleVAlign || "center"}
      style={{ borderLeftColor: borderColor, ...(d.bgColor ? { backgroundColor: d.bgColor } : {}) }}
      onDoubleClick={openFile}
    >
      <Resizer id={id} selected={selected} minWidth={150} minHeight={50} autoHeight />
      <CanvasNodeToolbar id={id} selected={selected} fontSize={d.fontSize} fontFamily={d.fontFamily} titleVAlign={d.titleVAlign ?? "center"} />
      {noteType && (
        <span
          className="canvas-file-node-badge"
          style={{ backgroundColor: getNodeColor(noteType) }}
        >
          {noteType}
        </span>
      )}
      {!noteType && fileTypeInfo && (
        <span
          className="canvas-file-node-badge"
          style={{ backgroundColor: fileTypeInfo.color }}
        >
          <fileTypeInfo.icon size={10} /> {fileTypeInfo.label}
        </span>
      )}
      <div className="canvas-file-node-header">
        {!noteType && fileTypeInfo && (
          <fileTypeInfo.icon size={16} className="canvas-file-node-icon" style={{ color: fileTypeInfo.color }} />
        )}
        <span className="canvas-file-node-title" style={{ ...(d.fontSize ? { fontSize: d.fontSize } : {}), ...(d.fontFamily ? { fontFamily: d.fontFamily } : {}) }}>{title}</span>
      </div>
      {summary && (
        <div className="canvas-file-node-summary">{summary}</div>
      )}
      {tags.length > 0 && (
        <div className="canvas-file-node-tags">
          {tags.slice(0, 3).map((t) => (
            <span key={t} className="canvas-file-node-tag">{t}</span>
          ))}
          {tags.length > 3 && <span className="canvas-file-node-tag">+{tags.length - 3}</span>}
        </div>
      )}
      {!node && !fileExists && <div className="canvas-file-node-missing">missing reference</div>}
      <FourHandles />
    </div>
  );
}

export const CanvasFileNode = memo(CanvasFileNodeInner);

// ── Text Node ─────────────────────────────────────────────────────────────────

function CanvasTextNodeInner({ id, data, selected }: NodeProps) {
  const d = data as { text?: string; color?: string; bgColor?: string; shape?: string; fontSize?: number; fontFamily?: string; textAlign?: string; textVAlign?: string; cardKind?: string };
  const text = d.text ?? "";
  const borderColor = d.color ?? undefined;
  const shapeDef = getShapeDefinition(d.shape);

  const textStyles: React.CSSProperties = {
    ...(d.fontSize ? { fontSize: d.fontSize } : {}),
    ...(d.fontFamily ? { fontFamily: d.fontFamily } : {}),
    ...(d.textAlign ? { textAlign: d.textAlign as React.CSSProperties["textAlign"] } : {}),
  };

  const vAlignMap: Record<string, string> = { top: "flex-start", center: "center", bottom: "flex-end" };
  const bodyStyle: React.CSSProperties = {
    alignItems: vAlignMap[d.textVAlign ?? "center"] ?? "center",
  };

  const { setNodes } = useReactFlow();
  const scheduleSave = useCanvasSave();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      const ta = textareaRef.current;
      ta.style.height = "0";
      ta.style.height = ta.scrollHeight + "px";
    }
  }, [editing, editValue]);

  const commitEdit = () => {
    setNodes((nds) =>
      nds.map((n) => n.id === id ? { ...n, data: { ...n.data, text: editValue } } : n),
    );
    setEditing(false);
    scheduleSave();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setEditValue(text);
      setEditing(false);
    }
    // Don't propagate so React Flow doesn't handle Delete/Backspace while typing
    e.stopPropagation();
  };

  const isSticky = (d.shape || "rectangle") === "sticky";
  const isFixedShape = (d.shape || "rectangle") === "circle" || (d.shape || "rectangle") === "diamond";
  const stickyPin = useUIStore((s) => s.canvasStickyPin);
  const stickyTape = useUIStore((s) => s.canvasStickyTape);

  const cardKindMeta = d.cardKind ? CARD_KIND_META.find((m) => m.id === d.cardKind) : undefined;
  const kindColor = cardKindMeta?.color;
  // User color overrides kind color for border
  const effectiveBorderColor = borderColor ?? undefined;

  return (
    <div
      className="canvas-text-node"
      data-shape={d.shape || "rectangle"}
      data-card-kind={d.cardKind || undefined}
      {...(isSticky ? {
        "data-sticky-pin": stickyPin ? "true" : undefined,
        "data-sticky-tape": stickyTape ? "true" : undefined,
      } : {})}
      style={{
        ...(effectiveBorderColor ? { borderColor: effectiveBorderColor } : {}),
        ...(d.bgColor ? { backgroundColor: d.bgColor } : {}),
        ...(kindColor ? {
          borderLeft: `3px solid ${kindColor}`,
          boxShadow: `0 0 12px color-mix(in srgb, ${kindColor} 20%, transparent), 0 2px 8px rgba(0,0,0,0.3)`,
          background: `linear-gradient(180deg, color-mix(in srgb, ${kindColor} 10%, var(--bg-primary)) 0%, var(--bg-primary) 60%)`,
        } : {}),
      }}
      onDoubleClick={() => { setEditValue(text); setEditing(true); }}
    >
      <Resizer id={id} selected={selected} autoHeight={!isFixedShape} />
      <CanvasNodeToolbar id={id} selected={selected} shape={d.shape ?? "rectangle"} fontSize={d.fontSize} fontFamily={d.fontFamily} textAlign={d.textAlign} textVAlign={d.textVAlign} />
      {cardKindMeta && (() => {
        const headerFontSize = Math.round((d.fontSize ?? 13) * 0.75);
        const BadgeIcon = (LucideIcons as Record<string, React.ComponentType<{ size?: number }>>)[cardKindMeta.icon];
        return (
          <div className="canvas-card-kind-header" style={{ color: kindColor, fontSize: headerFontSize }}>
            {BadgeIcon && <BadgeIcon size={headerFontSize} />}
            <span>{cardKindMeta.label}</span>
          </div>
        );
      })()}
      {editing ? (
        <div className="canvas-text-node-body" style={bodyStyle}>
          <textarea
            ref={textareaRef}
            className="canvas-text-node-edit nodrag"
            style={textStyles}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commitEdit}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
      ) : (
        <div className="canvas-text-node-body" style={{ ...textStyles, ...bodyStyle }}>{text || "\u00A0"}</div>
      )}
      <FourHandles />
    </div>
  );
}

export const CanvasTextNode = memo(CanvasTextNodeInner);

// ── Link Node ─────────────────────────────────────────────────────────────────

function CanvasLinkNodeInner({ id, data, selected }: NodeProps) {
  const d = data as { url?: string; title?: string; color?: string; bgColor?: string; fontSize?: number; fontFamily?: string };
  const url = d.url ?? "";

  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    hostname = url;
  }

  const faviconUrl = url ? `https://www.google.com/s2/favicons?domain=${hostname}&sz=32` : undefined;

  const openInBrowser = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!url) return;
    import("@tauri-apps/plugin-shell").then((mod) => mod.open(url)).catch(() => {
      window.open(url, "_blank", "noopener,noreferrer");
    });
  };

  return (
    <div className="canvas-link-node" style={{ ...(d.color ? { borderColor: d.color } : {}), ...(d.bgColor ? { backgroundColor: d.bgColor } : {}) }}>
      <Resizer id={id} selected={selected} autoHeight />
      <CanvasNodeToolbar id={id} selected={selected} fontSize={d.fontSize} fontFamily={d.fontFamily} />
      <div className="canvas-link-node-content">
        {faviconUrl && <img src={faviconUrl} alt="" className="canvas-link-node-favicon" />}
        <div className="canvas-link-node-info" style={{ ...(d.fontSize ? { fontSize: d.fontSize } : {}), ...(d.fontFamily ? { fontFamily: d.fontFamily } : {}) }}>
          {d.title && <span className="canvas-link-node-title">{d.title}</span>}
          <span className="canvas-link-node-url" title={url}>{hostname}</span>
        </div>
        <button className="canvas-link-node-open nodrag" title="Open in browser" onClick={openInBrowser}>
          ↗
        </button>
      </div>
      <FourHandles />
    </div>
  );
}

export const CanvasLinkNode = memo(CanvasLinkNodeInner);

// ── Group Node ────────────────────────────────────────────────────────────────

function CanvasGroupNodeInner({ id, data, selected }: NodeProps) {
  const d = data as { label?: string; color?: string; collapsed?: boolean; expandedWidth?: number; expandedHeight?: number; fontSize?: number; fontFamily?: string };
  const groupBorderOpacity = useUIStore((s) => s.canvasGroupBorderOpacity);
  const groupBorderStyle = useUIStore((s) => s.canvasGroupBorderStyle);
  const groupFillOpacity = useUIStore((s) => s.canvasGroupFillOpacity);
  const bgColor = d.color ?? "var(--bg-tertiary)";
  const label = d.label ?? "";
  const collapsed = d.collapsed === true;

  const { setNodes } = useReactFlow();
  const scheduleSave = useCanvasSave();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commitEdit = () => {
    if (cancelledRef.current) { cancelledRef.current = false; return; }
    const trimmed = editValue.trim();
    setNodes((nds) =>
      nds.map((n) => n.id === id ? { ...n, data: { ...n.data, label: trimmed || undefined } } : n),
    );
    setEditing(false);
    scheduleSave();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      cancelledRef.current = true;
      setEditValue(label);
      setEditing(false);
    } else if (e.key === "Enter") {
      commitEdit();
    }
    e.stopPropagation();
  };

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    cancelledRef.current = false;
    setEditValue(label);
    setEditing(true);
  };

  const toggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nds) => {
      if (collapsed) {
        // Expand: restore children visibility and original dimensions
        return nds.map((n) => {
          if (n.id === id) {
            const nd = n.data as Record<string, unknown>;
            const ew = nd.expandedWidth as number | undefined;
            const eh = nd.expandedHeight as number | undefined;
            const { collapsed: _, expandedWidth: _ew, expandedHeight: _eh, ...restData } = nd;
            return {
              ...n,
              data: restData,
              style: { ...n.style, width: ew ?? (n.style?.width as number ?? 400), height: eh ?? (n.style?.height as number ?? 300) },
            };
          }
          if (n.parentId === id) {
            return { ...n, hidden: false };
          }
          return n;
        });
      } else {
        // Collapse: save dimensions, shrink, hide children
        const currentW = (nds.find((n) => n.id === id)?.style?.width as number) ?? 400;
        const currentH = (nds.find((n) => n.id === id)?.style?.height as number) ?? 300;
        return nds.map((n) => {
          if (n.id === id) {
            return {
              ...n,
              data: { ...n.data, collapsed: true, expandedWidth: currentW, expandedHeight: currentH },
              style: { ...n.style, width: currentW, height: 8 },
            };
          }
          if (n.parentId === id) {
            return { ...n, hidden: true };
          }
          return n;
        });
      }
    });
    scheduleSave();
  };

  return (
    <div
      className={`canvas-group-node${collapsed ? " canvas-group-node--collapsed" : ""}`}
      style={{
        backgroundColor: `color-mix(in srgb, ${bgColor} ${groupFillOpacity}%, transparent)`,
        borderColor: `color-mix(in srgb, var(--text-muted) ${groupBorderOpacity}%, transparent)`,
        borderStyle: groupBorderStyle as React.CSSProperties["borderStyle"],
      }}
    >
      {!collapsed && <Resizer id={id} selected={selected} minWidth={200} minHeight={150} />}
      <CanvasNodeToolbar id={id} selected={selected} fontSize={d.fontSize} fontFamily={d.fontFamily} />
      <div className="canvas-group-node-label" style={{ ...(d.color ? { color: d.color } : {}), ...(d.fontSize ? { fontSize: d.fontSize } : {}), ...(d.fontFamily ? { fontFamily: d.fontFamily } : {}) }} onDoubleClick={startEditing}>
        <button className="canvas-group-collapse-btn nodrag" onClick={toggleCollapse} title={collapsed ? "Expand group" : "Collapse group"}>
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>
        {editing ? (
          <input
            ref={inputRef}
            className="canvas-group-node-label-edit nodrag"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commitEdit}
            placeholder="Group"
            style={d.color ? { color: d.color } : undefined}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
        ) : (
          <span>{label || "Group"}</span>
        )}
      </div>
      {!collapsed && <FourHandles />}
    </div>
  );
}

export const CanvasGroupNode = memo(CanvasGroupNodeInner);

// ── Custom Edge with toolbar ──────────────────────────────────────────────────

function CanvasEdgeInner({
  id,
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  selected,
  label,
  markerEnd,
  markerStart,
  style,
  data,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const scheduleSave = useCanvasSave();
  const pushSnapshot = useCanvasSnapshot();
  const totalSelectedCount = useStore(selectTotalSelectedCount);
  const [showColors, setShowColors] = useState(false);
  const [showLabelFormat, setShowLabelFormat] = useState(false);
  const labelFormatRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(label ?? ""));
  const inputRef = useRef<HTMLInputElement>(null);

  // Also check if this is a newly created edge that should prompt for label
  const isNew = (data as Record<string, unknown> | undefined)?.isNew === true;
  const [promptLabel, setPromptLabel] = useState(isNew);

  useEffect(() => {
    if ((editing || promptLabel) && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing, promptLabel]);

  useEffect(() => {
    if (!showLabelFormat) return;
    const handler = (e: PointerEvent) => {
      if (labelFormatRef.current && !labelFormatRef.current.contains(e.target as Node)) {
        setShowLabelFormat(false);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [showLabelFormat]);

  const edgeType = (data as Record<string, unknown> | undefined)?.edgeType as string | undefined;
  const canvasDefaultEdgeType = useUIStore((s) => s.canvasDefaultEdgeType);
  const effectiveType = edgeType ?? canvasDefaultEdgeType ?? "bezier";

  const [edgePath, labelX, labelY] = effectiveType === "straight"
    ? getStraightPath({ sourceX, sourceY, targetX, targetY })
    : effectiveType === "step"
      ? getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition })
      : getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });

  const commitLabel = (value: string) => {
    const trimmed = value.trim();
    setEdges((eds) =>
      eds.map((ed) => {
        if (ed.id !== id) return ed;
        const { isNew: _, ...restData } = (ed.data ?? {}) as Record<string, unknown>;
        return {
          ...ed,
          label: trimmed || undefined,
          data: Object.keys(restData).length > 0 ? restData : undefined,
        };
      }),
    );
    setEditing(false);
    setPromptLabel(false);
    scheduleSave();
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitLabel(editValue);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditing(false);
      setPromptLabel(false);
      // For new edges, just clear the isNew flag
      if (isNew) {
        setEdges((eds) =>
          eds.map((ed) => {
            if (ed.id !== id) return ed;
            const { isNew: _, ...restData } = (ed.data ?? {}) as Record<string, unknown>;
            return { ...ed, data: Object.keys(restData).length > 0 ? restData : undefined };
          }),
        );
        scheduleSave();
      }
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEdges((eds) => eds.filter((e) => e.id !== id));
    scheduleSave();
  };

  const handleColor = (color: string) => {
    const markerId = `brainmap-arrow-${color}`;
    setEdges((eds) =>
      eds.map((ed) => {
        if (ed.id !== id) return ed;
        return {
          ...ed,
          style: { ...ed.style, stroke: color },
          ...(ed.markerEnd ? { markerEnd: markerId } : {}),
          ...(ed.markerStart ? { markerStart: markerId } : {}),
        };
      }),
    );
    scheduleSave();
  };

  const handleClearColor = () => {
    setEdges((eds) =>
      eds.map((ed) => {
        if (ed.id !== id) return ed;
        const { stroke: _, ...rest } = (ed.style ?? {}) as Record<string, unknown>;
        return {
          ...ed,
          style: Object.keys(rest).length > 0 ? rest : undefined,
          ...(ed.markerEnd ? { markerEnd: "brainmap-arrow" } : {}),
          ...(ed.markerStart ? { markerStart: "brainmap-arrow" } : {}),
        };
      }),
    );
    scheduleSave();
  };

  const handleLabelFont = (patch: { labelFontSize?: number; labelFontFamily?: string }) => {
    pushSnapshot();
    setEdges((eds) =>
      eds.map((ed) =>
        ed.id !== id ? ed : { ...ed, data: { ...(ed.data as object ?? {}), ...patch } },
      ),
    );
    scheduleSave();
  };

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(String(label ?? ""));
    setEditing(true);
  };

  const showInput = editing || promptLabel;
  const edgeData = data as Record<string, unknown> | undefined;
  const labelFontSize = (edgeData?.labelFontSize as number | undefined) ?? 11;
  const labelFontFamily = (edgeData?.labelFontFamily as string | undefined) ?? undefined;
  const labelStyle: React.CSSProperties = {
    fontSize: labelFontSize,
    ...(labelFontFamily ? { fontFamily: labelFontFamily } : {}),
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} markerStart={markerStart} style={style} interactionWidth={20} />
      <EdgeLabelRenderer>
        {/* Label display or input */}
        {showInput ? (
          <div
            className="canvas-edge-label-input-wrapper"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              className="canvas-edge-label-input nodrag"
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleLabelKeyDown}
              onBlur={() => commitLabel(editValue)}
              placeholder="Label (Enter to set, Esc to skip)"
              style={labelStyle}
            />
          </div>
        ) : label ? (
          <div
            className="canvas-edge-label"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`, ...labelStyle }}
            onDoubleClick={startEditing}
          >
            {label}
          </div>
        ) : null}
        {/* Toolbar — hide when multiple elements are selected */}
        {selected && !showInput && totalSelectedCount <= 1 && (
          <div
            className="canvas-edge-toolbar"
            style={{ transform: `translate(-50%, -100%) translate(${labelX}px,${labelY - 16}px)` }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="canvas-node-toolbar-btn" title="Edit label" onClick={startEditing}>
              <PenLine size={16} />
            </button>
            <button className="canvas-node-toolbar-btn" title="Delete" onClick={handleDelete}>
              <Trash2 size={16} />
            </button>
            <div className="canvas-node-toolbar-color-wrapper">
              <button
                className="canvas-node-toolbar-btn"
                title="Color"
                onClick={(e) => { e.stopPropagation(); setShowColors(!showColors); }}
              >
                <Palette size={16} />
              </button>
              {showColors && (
                <ColorPickerDropdown onSelect={handleColor} onClear={handleClearColor} onClose={() => setShowColors(false)} clearLabel="Clear color" />
              )}
            </div>
            <div className="canvas-edge-type-picker">
              <button
                className={`canvas-node-toolbar-btn${effectiveType === "bezier" ? " canvas-node-toolbar-btn--active" : ""}`}
                title="Bezier"
                onClick={() => { setEdges((eds) => eds.map((ed) => ed.id !== id ? ed : { ...ed, data: { ...(ed.data as object), edgeType: "bezier" } })); scheduleSave(); }}
              >
                <Spline size={14} />
              </button>
              <button
                className={`canvas-node-toolbar-btn${effectiveType === "straight" ? " canvas-node-toolbar-btn--active" : ""}`}
                title="Straight"
                onClick={() => { setEdges((eds) => eds.map((ed) => ed.id !== id ? ed : { ...ed, data: { ...(ed.data as object), edgeType: "straight" } })); scheduleSave(); }}
              >
                <Minus size={14} />
              </button>
              <button
                className={`canvas-node-toolbar-btn${effectiveType === "step" ? " canvas-node-toolbar-btn--active" : ""}`}
                title="Step"
                onClick={() => { setEdges((eds) => eds.map((ed) => ed.id !== id ? ed : { ...ed, data: { ...(ed.data as object), edgeType: "step" } })); scheduleSave(); }}
              >
                <CornerDownRight size={14} />
              </button>
            </div>
            <div ref={labelFormatRef} style={{ position: "relative" }}>
              <button
                className={`canvas-node-toolbar-btn${showLabelFormat ? " canvas-node-toolbar-btn--active" : ""}`}
                title="Label format"
                onClick={(e) => { e.stopPropagation(); setShowColors(false); setShowLabelFormat(!showLabelFormat); }}
              >
                <ALargeSmall size={14} />
              </button>
              {showLabelFormat && (
                <div className="canvas-edge-label-format-picker nodrag nopan">
                  <div className="canvas-text-format-section">
                    <div className="canvas-text-format-section-label">Size</div>
                    <div className="canvas-text-format-row">
                      {FONT_SIZES.map((size) => (
                        <button
                          key={size}
                          className={`canvas-text-format-btn${labelFontSize === size ? " canvas-text-format-btn--active" : ""}`}
                          onClick={() => handleLabelFont({ labelFontSize: size })}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="canvas-text-format-section">
                    <div className="canvas-text-format-section-label">Font</div>
                    <div className="canvas-text-format-row">
                      {FONT_FAMILIES.map((f) => (
                        <button
                          key={f.id}
                          className={`canvas-text-format-btn${labelFontFamily === f.id ? " canvas-text-format-btn--active" : ""}`}
                          style={{ fontFamily: f.id }}
                          onClick={() => handleLabelFont({ labelFontFamily: f.id })}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}

export const CanvasEdge = memo(CanvasEdgeInner);
