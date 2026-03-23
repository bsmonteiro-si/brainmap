import { useState, useEffect, useRef, useCallback } from "react";
import { getAPI } from "../../api/bridge";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface Props {
  path: string;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;
const ZOOM_STEP = 1.2;

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImageViewer({ path }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [sizeBytes, setSizeBytes] = useState(0);
  const [panning, setPanning] = useState(false);
  const panRef = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setSrc(null);
      setZoom(1);
      setPanPos({ x: 0, y: 0 });
      panRef.current = { x: 0, y: 0 };
      setNaturalSize(null);

      try {
        const api = await getAPI();
        const meta = await api.resolveImagePath(path);
        setSizeBytes(meta.size_bytes);

        let url: string;
        if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
          const { convertFileSrc } = await import("@tauri-apps/api/core");
          url = convertFileSrc(meta.absolute_path);
        } else {
          url = meta.absolute_path;
        }

        if (!cancelled) {
          setSrc(url);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [path]);

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
  }, []);

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(z * ZOOM_STEP, MAX_ZOOM));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(z / ZOOM_STEP, MIN_ZOOM));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPanPos({ x: 0, y: 0 });
    panRef.current = { x: 0, y: 0 };
  }, []);

  // Attach wheel listener with { passive: false } so preventDefault works
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
        setZoom((z) => Math.min(Math.max(z * factor, MIN_ZOOM), MAX_ZOOM));
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, panX: panRef.current.x, panY: panRef.current.y };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!panning) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    const newPan = { x: panStart.current.panX + dx, y: panStart.current.panY + dy };
    panRef.current = newPan;
    setPanPos(newPan);
  }, [panning]);

  const handleMouseUp = useCallback(() => {
    setPanning(false);
  }, []);

  const fileName = path.split("/").pop() ?? path;

  if (loading) {
    return (
      <div className="image-viewer">
        <div className="image-viewer-placeholder">Loading image...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="image-viewer">
        <div className="image-viewer-placeholder image-viewer-error">
          <div>{fileName}</div>
          <div style={{ opacity: 0.6, fontSize: "0.85rem" }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="image-viewer">
      <div className="image-viewer-toolbar">
        <span className="image-viewer-info">
          {fileName}
          {naturalSize && <span className="image-viewer-dim"> — {naturalSize.w}×{naturalSize.h}</span>}
          {sizeBytes > 0 && <span className="image-viewer-dim"> — {formatSize(sizeBytes)}</span>}
        </span>
        <div className="image-viewer-controls">
          <button className="image-viewer-btn" onClick={zoomOut} title="Zoom out" type="button">
            <ZoomOut size={14} />
          </button>
          <span className="image-viewer-zoom-label">{Math.round(zoom * 100)}%</span>
          <button className="image-viewer-btn" onClick={zoomIn} title="Zoom in" type="button">
            <ZoomIn size={14} />
          </button>
          <button className="image-viewer-btn" onClick={resetZoom} title="Reset zoom" type="button">
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className={`image-viewer-canvas${panning ? " image-viewer-canvas--panning" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* SVG security: must render via <img> only — never <object>/<embed>/<iframe>,
            which would allow embedded scripts to execute in the WebView context. */}
        {src && (
          <img
            src={src}
            alt={fileName}
            className="image-viewer-img"
            onLoad={handleImageLoad}
            draggable={false}
            style={{
              transform: `translate(${panPos.x}px, ${panPos.y}px) scale(${zoom})`,
            }}
          />
        )}
      </div>
    </div>
  );
}
