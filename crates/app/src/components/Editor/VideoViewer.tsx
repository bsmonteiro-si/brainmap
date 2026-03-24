import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { getAPI } from "../../api/bridge";
import { Maximize, Minimize, X } from "lucide-react";

interface Props {
  path: string;
  onClose?: () => void;
}

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
const SEEK_STEP = 5; // seconds

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function VideoViewer({ path, onClose }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sizeBytes, setSizeBytes] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setSrc(null);
      setSpeed(1);
      setIsFullscreen(false);

      try {
        const api = await getAPI();
        const meta = await api.resolveVideoPath(path);
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

  const handleSpeedChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSpeed = parseFloat(e.target.value);
    setSpeed(newSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
  }, []);

  const handleVideoLoaded = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed]);

  const handleVideoError = useCallback(() => {
    setError("This video format is not supported by the browser. Try converting to .mp4 or .webm.");
    setSrc(null);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((f) => !f);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const video = videoRef.current;
    if (!video) return;

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      video.currentTime = Math.max(0, video.currentTime - SEEK_STEP);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const end = Number.isFinite(video.duration) ? video.duration : Infinity;
      video.currentTime = Math.min(end, video.currentTime + SEEK_STEP);
    } else if (e.key === " ") {
      e.preventDefault();
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    } else if (e.key === "f") {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.key === "Escape" && isFullscreen) {
      e.preventDefault();
      e.stopPropagation();
      setIsFullscreen(false);
    }
  }, [isFullscreen, toggleFullscreen]);

  const fileName = path.split("/").pop() ?? path;

  if (loading) {
    return (
      <div className="video-viewer">
        <div className="video-viewer-placeholder">Loading video...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-viewer">
        <div className="video-viewer-placeholder video-viewer-error">
          <div>{fileName}</div>
          <div style={{ opacity: 0.6, fontSize: "0.85rem" }}>{error}</div>
        </div>
      </div>
    );
  }

  const viewerContent = (
    <div className={`video-viewer${isFullscreen ? " video-viewer--fullscreen" : ""}`}>
      <div className="video-viewer-toolbar">
        <span className="video-viewer-info">
          {fileName}
          {sizeBytes > 0 && <span className="video-viewer-dim"> — {formatSize(sizeBytes)}</span>}
        </span>
        <div className="video-viewer-controls">
          <label className="video-viewer-speed-label">
            Speed
            <select
              className="video-viewer-speed-select"
              value={speed}
              onChange={handleSpeedChange}
            >
              {SPEED_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}x
                </option>
              ))}
            </select>
          </label>
          <button
            className="video-viewer-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen (F)"}
            type="button"
          >
            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          </button>
          {isFullscreen && onClose && (
            <button
              className="video-viewer-btn"
              onClick={onClose}
              title="Close"
              type="button"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        ref={containerRef}
        className="video-viewer-content"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {src && (
          <video
            ref={videoRef}
            src={src}
            controls
            className="video-viewer-video"
            onLoadedMetadata={handleVideoLoaded}
            onError={handleVideoError}
          />
        )}
      </div>
    </div>
  );

  // Portal fullscreen to document.body so it escapes any parent overflow/stacking contexts
  if (isFullscreen) {
    return createPortal(viewerContent, document.body);
  }

  return viewerContent;
}
