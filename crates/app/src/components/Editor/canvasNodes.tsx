import { memo, useState } from "react";
import { Handle, Position, NodeResizer, NodeToolbar } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Trash2, Palette } from "lucide-react";
import { useGraphStore } from "../../stores/graphStore";
import { useEditorStore } from "../../stores/editorStore";
import { useReactFlow } from "@xyflow/react";
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

function CanvasNodeToolbar({ id, selected }: { id: string; selected: boolean }) {
  const { setNodes, setEdges } = useReactFlow();
  const [showColors, setShowColors] = useState(false);

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
            title="Color"
            onClick={() => setShowColors(!showColors)}
          >
            <Palette size={16} />
          </button>
          {showColors && (
            <div className="canvas-color-picker">
              {CANVAS_COLORS.map((c) => (
                <button
                  key={c.id}
                  className="canvas-color-swatch"
                  style={{ backgroundColor: c.color }}
                  title={c.label}
                  onClick={() => handleColor(c.color)}
                />
              ))}
              <button
                className="canvas-color-swatch canvas-color-swatch--clear"
                title="Clear color"
                onClick={handleClearColor}
              >
                ×
              </button>
            </div>
          )}
        </div>
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
  const d = data as { file?: string; subpath?: string; color?: string };
  const filePath = d.file ?? "";
  const node = useGraphStore((s) => s.nodes.get(filePath));

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node) {
      useEditorStore.getState().openNote(filePath);
    }
  };

  const title = node?.title ?? filePath.split("/").pop() ?? filePath;
  const noteType = node?.note_type;
  const tags = node?.tags ?? [];
  const borderColor = d.color ?? (noteType ? getNodeColor(noteType) : "var(--border-color)");

  return (
    <div
      className="canvas-file-node"
      style={{ borderLeftColor: borderColor }}
      onDoubleClick={handleClick}
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
  const d = data as { text?: string; color?: string };
  const text = d.text ?? "";
  const borderColor = d.color ?? undefined;

  return (
    <div className="canvas-text-node" style={borderColor ? { borderColor } : undefined}>
      <Resizer selected={selected} />
      <CanvasNodeToolbar id={id} selected={selected} />
      <div className="canvas-text-node-body">{text}</div>
      <FourHandles />
    </div>
  );
}

export const CanvasTextNode = memo(CanvasTextNodeInner);

// ── Link Node ─────────────────────────────────────────────────────────────────

function CanvasLinkNodeInner({ id, data, selected }: NodeProps) {
  const d = data as { url?: string; color?: string };
  const url = d.url ?? "";
  let displayUrl: string;
  try {
    displayUrl = new URL(url).hostname;
  } catch {
    displayUrl = url;
  }

  return (
    <div className="canvas-link-node" style={d.color ? { borderColor: d.color } : undefined}>
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
