import { useRef, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useUIStore } from "../../stores/uiStore";
import { VideoViewer } from "./VideoViewer";

const DEFAULT_WIDTH = 480;
const DEFAULT_HEIGHT = 320;
const MIN_WIDTH = 320;
const MIN_HEIGHT = 240;

export function VideoPipPanel() {
  const path = useUIStore((s) => s.videoPipPath);
  const close = useUIStore((s) => s.closeVideoPip);

  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(() => ({
    x: window.innerWidth - DEFAULT_WIDTH - 24,
    y: window.innerHeight - DEFAULT_HEIGHT - 48,
  }));
  const [size, setSize] = useState({ w: DEFAULT_WIDTH, h: DEFAULT_HEIGHT });

  // Refs for current values so drag/resize closures never go stale
  const posRef = useRef(pos);
  posRef.current = pos;
  const sizeRef = useRef(size);
  sizeRef.current = size;

  // Track active cleanup functions so we can tear them down on unmount
  const cleanupRef = useRef<(() => void) | null>(null);

  // Reset position when a new video is opened
  useEffect(() => {
    if (path) {
      setPos({
        x: window.innerWidth - DEFAULT_WIDTH - 24,
        y: window.innerHeight - DEFAULT_HEIGHT - 48,
      });
      setSize({ w: DEFAULT_WIDTH, h: DEFAULT_HEIGHT });
    }
  }, [path]);

  // Clean up any active drag/resize listeners on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  // ── Drag handlers (no clamping — allows dragging to other monitors) ──
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".video-pip-close")) return;
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = posRef.current;

    const handleMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      setPos({ x: startPos.x + dx, y: startPos.y + dy });
    };
    const handleUp = () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
      cleanupRef.current = null;
    };
    cleanupRef.current = handleUp;
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
  }, []);

  // ── Resize handlers ──
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startSize = sizeRef.current;

    const handleMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      setSize({
        w: Math.max(MIN_WIDTH, startSize.w + dx),
        h: Math.max(MIN_HEIGHT, startSize.h + dy),
      });
    };
    const handleUp = () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
      cleanupRef.current = null;
    };
    cleanupRef.current = handleUp;
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
  }, []);

  if (!path) return null;

  const fileName = path.split("/").pop() ?? path;

  return createPortal(
    <div
      ref={panelRef}
      className="video-pip-panel"
      style={{ left: pos.x, top: pos.y, width: size.w, height: size.h }}
    >
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div className="video-pip-titlebar" onMouseDown={handleDragStart}>
        <span className="video-pip-title">{fileName}</span>
        <button className="video-pip-close" onClick={close} title="Close" type="button">
          <X size={14} />
        </button>
      </div>
      <div className="video-pip-body">
        <VideoViewer path={path} onClose={close} />
      </div>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div className="video-pip-resize-handle" onMouseDown={handleResizeStart} />
    </div>,
    document.body
  );
}
