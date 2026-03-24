import { useState, useEffect, useRef, useCallback } from "react";
import { getAPI } from "../../api/bridge";
import { Maximize, Minimize } from "lucide-react";

interface Props {
  path: string;
}

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
const SEEK_STEP = 5; // seconds
const STATUS_BAR_TIMEOUT = 5000; // ms

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function VideoViewer({ path }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sizeBytes, setSizeBytes] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [statusVisible, setStatusVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setSrc(null);
      setSpeed(1);
      setIsFullscreen(false);
      setStatusVisible(false);
      setCurrentTime(0);
      setDuration(0);

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

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  const showStatusBar = useCallback(() => {
    setStatusVisible(true);
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    statusTimerRef.current = setTimeout(() => {
      setStatusVisible(false);
      statusTimerRef.current = null;
    }, STATUS_BAR_TIMEOUT);
  }, []);

  const syncTime = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      if (Number.isFinite(video.duration)) setDuration(video.duration);
    }
  }, []);

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
      if (Number.isFinite(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
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
      syncTime();
      showStatusBar();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const end = Number.isFinite(video.duration) ? video.duration : Infinity;
      video.currentTime = Math.min(end, video.currentTime + SEEK_STEP);
      syncTime();
      showStatusBar();
    } else if (e.key === " ") {
      e.preventDefault();
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
      syncTime();
      showStatusBar();
    } else if (e.key === "f") {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.key === "Escape" && isFullscreen) {
      e.preventDefault();
      e.stopPropagation();
      setIsFullscreen(false);
    }
  }, [isFullscreen, syncTime, showStatusBar, toggleFullscreen]);

  const fileName = path.split("/").pop() ?? path;
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

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

  return (
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
        {statusVisible && (
          <div className="video-status-bar">
            <div className="video-status-bar-progress">
              <div
                className="video-status-bar-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="video-status-bar-time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
