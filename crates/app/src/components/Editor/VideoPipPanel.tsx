import { useRef, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Maximize, Minimize } from "lucide-react";
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
  const [isMaximized, setIsMaximized] = useState(false);

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
      setIsMaximized(false);
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

  const toggleMaximize = useCallback(() => {
    setIsMaximized((m) => !m);
  }, []);

  // ── Drag handlers ──
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".video-pip-close, .video-pip-maximize")) return;
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = posRef.current;

    const handleMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      setPos({
        x: Math.max(-sizeRef.current.w + 100, Math.min(window.innerWidth - 100, startPos.x + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 40, startPos.y + dy)),
      });
      // Un-maximize on drag
      setIsMaximized(false);
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
      className={`video-pip-panel${isMaximized ? " video-pip-panel--maximized" : ""}`}
      style={isMaximized ? undefined : { left: pos.x, top: pos.y, width: size.w, height: size.h }}
    >
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div className="video-pip-titlebar" onMouseDown={isMaximized ? undefined : handleDragStart}>
        <span className="video-pip-title">{fileName}</span>
        <div className="video-pip-titlebar-buttons">
          <button className="video-pip-maximize" onClick={toggleMaximize} title={isMaximized ? "Restore" : "Maximize"} type="button">
            {isMaximized ? <Minimize size={14} /> : <Maximize size={14} />}
          </button>
          <button className="video-pip-close" onClick={close} title="Close" type="button">
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="video-pip-body">
        <VideoViewer path={path} onClose={close} />
      </div>
      {!isMaximized && (
        /* eslint-disable-next-line jsx-a11y/no-static-element-interactions */
        <div className="video-pip-resize-handle" onMouseDown={handleResizeStart} />
      )}
    </div>,
    document.body
  );
}
