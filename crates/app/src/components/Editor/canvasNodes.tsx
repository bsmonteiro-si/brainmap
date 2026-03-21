import { memo, useState, useRef, useEffect } from "react";
import {
  Handle, Position, NodeResizer, NodeToolbar,
  BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow,
} from "@xyflow/react";
import type { NodeProps, EdgeProps } from "@xyflow/react";
import { Trash2, Palette, Paintbrush, PenLine, Shapes } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { CANVAS_SHAPES, getShapeDefinition } from "./canvasShapes";
import type { CanvasShapeId } from "./canvasShapes";
import { useGraphStore } from "../../stores/graphStore";
import { useEditorStore } from "../../stores/editorStore";
import { useTabStore } from "../../stores/tabStore";
import { useCanvasPanelMode } from "./CanvasEditor";

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

// ── Color picker dropdown (shared by node + edge toolbars) ────────────────────

function ColorPickerDropdown({
  onSelect,
  onClear,
  clearLabel = "Clear",
}: {
  onSelect: (color: string) => void;
  onClear: () => void;
  clearLabel?: string;
}) {
  return (
    <div className="canvas-color-picker">
      {CANVAS_COLORS.map((c) => (
        <button
          key={c.id}
          className="canvas-color-swatch"
          style={{ backgroundColor: c.color }}
          title={c.label}
          onClick={() => onSelect(c.color)}
        />
      ))}
      <label className="canvas-color-swatch canvas-color-swatch--custom" title="Custom color">
        <input
          type="color"
          className="canvas-color-input-hidden"
          onChange={(e) => onSelect(e.target.value)}
        />
      </label>
      <button
        className="canvas-color-swatch canvas-color-swatch--clear"
        title={clearLabel}
        onClick={onClear}
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

function CanvasNodeToolbar({ id, selected, shape }: { id: string; selected: boolean; shape?: string }) {
  const { setNodes, setEdges } = useReactFlow();
  const [showColors, setShowColors] = useState(false);
  const [showBgColors, setShowBgColors] = useState(false);
  const [showShapes, setShowShapes] = useState(false);

  const handleDelete = () => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  };

  const handleColor = (color: string) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, color } } : n,
      ),
    );
    setShowColors(false);
  };

  const handleClearColor = () => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== id) return n;
        const { color: _, ...rest } = n.data as Record<string, unknown>;
        return { ...n, data: rest };
      }),
    );
    setShowColors(false);
  };

  const handleBgColor = (bgColor: string) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, bgColor } } : n,
      ),
    );
    setShowBgColors(false);
  };

  const handleClearBgColor = () => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== id) return n;
        const { bgColor: _, ...rest } = n.data as Record<string, unknown>;
        return { ...n, data: rest };
      }),
    );
    setShowBgColors(false);
  };

  return (
    <NodeToolbar isVisible={selected} position={Position.Top} offset={8}>
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
            onClick={() => { setShowColors(!showColors); setShowBgColors(false); }}
          >
            <Palette size={16} />
          </button>
          {showColors && (
            <ColorPickerDropdown onSelect={handleColor} onClear={handleClearColor} clearLabel="Clear color" />
          )}
        </div>
        <div className="canvas-node-toolbar-color-wrapper">
          <button
            className="canvas-node-toolbar-btn"
            title="Background color"
            onClick={() => { setShowBgColors(!showBgColors); setShowColors(false); }}
          >
            <Paintbrush size={16} />
          </button>
          {showBgColors && (
            <ColorPickerDropdown onSelect={handleBgColor} onClear={handleClearBgColor} clearLabel="Clear background" />
          )}
        </div>
        {shape !== undefined && (
          <div className="canvas-node-toolbar-color-wrapper">
            <button
              className="canvas-node-toolbar-btn"
              title="Shape"
              onClick={() => { setShowShapes(!showShapes); setShowColors(false); setShowBgColors(false); }}
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
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === id ? { ...n, data: { ...n.data, shape: s.id } } : n,
                          ),
                        );
                        setShowShapes(false);
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
      </div>
    </NodeToolbar>
  );
}

// ── Resizer (always rendered, visible on hover via CSS) ───────────────────────

function Resizer({ selected, minWidth = 120, minHeight = 40 }: { selected: boolean; minWidth?: number; minHeight?: number }) {
  return (
    <NodeResizer
      isVisible={selected}
      minWidth={minWidth}
      minHeight={minHeight}
      lineClassName="canvas-resize-line"
      handleClassName="canvas-resize-handle"
    />
  );
}

// ── File Node ─────────────────────────────────────────────────────────────────

function CanvasFileNodeInner({ id, data, selected }: NodeProps) {
  const d = data as { file?: string; subpath?: string; color?: string; bgColor?: string };
  const filePath = d.file ?? "";
  const node = useGraphStore((s) => s.nodes.get(filePath));
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
    } else {
      useGraphStore.getState().selectNode(null);
      useEditorStore.getState().openPlainFile(filePath);
    }
  };

  const title = node?.title ?? filePath.split("/").pop() ?? filePath;
  const noteType = node?.note_type;
  const tags = node?.tags ?? [];
  const borderColor = d.color ?? (noteType ? getNodeColor(noteType) : "var(--border-color)");

  return (
    <div
      className="canvas-file-node"
      style={{ borderLeftColor: borderColor, ...(d.bgColor ? { backgroundColor: d.bgColor } : {}) }}
      onDoubleClick={openFile}
    >
      <Resizer selected={selected} minWidth={150} minHeight={50} />
      <CanvasNodeToolbar id={id} selected={selected} />
      <div className="canvas-file-node-header">
        <span className="canvas-file-node-title">{title}</span>
        {noteType && (
          <span
            className="canvas-file-node-badge"
            style={{ backgroundColor: getNodeColor(noteType) }}
          >
            {noteType}
          </span>
        )}
      </div>
      {tags.length > 0 && (
        <div className="canvas-file-node-tags">
          {tags.slice(0, 3).map((t) => (
            <span key={t} className="canvas-file-node-tag">{t}</span>
          ))}
          {tags.length > 3 && <span className="canvas-file-node-tag">+{tags.length - 3}</span>}
        </div>
      )}
      {!node && <div className="canvas-file-node-missing">missing reference</div>}
      <FourHandles />
    </div>
  );
}

export const CanvasFileNode = memo(CanvasFileNodeInner);

// ── Text Node ─────────────────────────────────────────────────────────────────

function CanvasTextNodeInner({ id, data, selected }: NodeProps) {
  const d = data as { text?: string; color?: string; bgColor?: string; shape?: string };
  const text = d.text ?? "";
  const borderColor = d.color ?? undefined;
  const shapeDef = getShapeDefinition(d.shape);

  const { setNodes } = useReactFlow();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editing]);

  const commitEdit = () => {
    setNodes((nds) =>
      nds.map((n) => n.id === id ? { ...n, data: { ...n.data, text: editValue } } : n),
    );
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setEditValue(text);
      setEditing(false);
    }
    // Don't propagate so React Flow doesn't handle Delete/Backspace while typing
    e.stopPropagation();
  };

  return (
    <div
      className="canvas-text-node"
      data-shape={d.shape || "rectangle"}
      style={{ ...(borderColor ? { borderColor } : {}), ...(d.bgColor ? { backgroundColor: d.bgColor } : {}) }}
      onDoubleClick={() => { setEditValue(text); setEditing(true); }}
    >
      <Resizer selected={selected} />
      <CanvasNodeToolbar id={id} selected={selected} shape={d.shape ?? "rectangle"} />
      {editing ? (
        <textarea
          ref={textareaRef}
          className="canvas-text-node-edit"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitEdit}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
      ) : (
        <div className="canvas-text-node-body">{text || "\u00A0"}</div>
      )}
      <FourHandles />
    </div>
  );
}

export const CanvasTextNode = memo(CanvasTextNodeInner);

// ── Link Node ─────────────────────────────────────────────────────────────────

function CanvasLinkNodeInner({ id, data, selected }: NodeProps) {
  const d = data as { url?: string; color?: string; bgColor?: string };
  const url = d.url ?? "";

  let displayUrl: string;
  try {
    displayUrl = new URL(url).hostname;
  } catch {
    displayUrl = url;
  }

  return (
    <div className="canvas-link-node" style={{ ...(d.color ? { borderColor: d.color } : {}), ...(d.bgColor ? { backgroundColor: d.bgColor } : {}) }}>
      <Resizer selected={selected} />
      <CanvasNodeToolbar id={id} selected={selected} />
      <span className="canvas-link-node-url" title={url}>{displayUrl}</span>
      <FourHandles />
    </div>
  );
}

export const CanvasLinkNode = memo(CanvasLinkNodeInner);

// ── Group Node ────────────────────────────────────────────────────────────────

function CanvasGroupNodeInner({ id, data, selected }: NodeProps) {
  const d = data as { label?: string; color?: string };
  const bgColor = d.color ?? "var(--bg-tertiary)";

  return (
    <div className="canvas-group-node" style={{ backgroundColor: bgColor }}>
      <Resizer selected={selected} minWidth={200} minHeight={150} />
      <CanvasNodeToolbar id={id} selected={selected} />
      {d.label && <div className="canvas-group-node-label">{d.label}</div>}
      <FourHandles />
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
  const [showColors, setShowColors] = useState(false);
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

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
  });

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
      }
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEdges((eds) => eds.filter((e) => e.id !== id));
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
    setShowColors(false);
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
    setShowColors(false);
  };

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(String(label ?? ""));
    setEditing(true);
  };

  const showInput = editing || promptLabel;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} markerStart={markerStart} style={style} />
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
              className="canvas-edge-label-input"
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleLabelKeyDown}
              onBlur={() => commitLabel(editValue)}
              placeholder="Label (Enter to set, Esc to skip)"
            />
          </div>
        ) : label ? (
          <div
            className="canvas-edge-label"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
            onDoubleClick={startEditing}
          >
            {label}
          </div>
        ) : null}
        {/* Toolbar */}
        {selected && !showInput && (
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
                <ColorPickerDropdown onSelect={handleColor} onClear={handleClearColor} clearLabel="Clear color" />
              )}
            </div>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}

export const CanvasEdge = memo(CanvasEdgeInner);
