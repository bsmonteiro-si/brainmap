import { useState, useEffect, useRef, useCallback } from "react";
import { getAPI } from "../../api/bridge";

interface Props {
  path: string;
}

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

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
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setSrc(null);
      setSpeed(1);

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

  return (
    <div className="video-viewer">
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
        </div>
      </div>
      <div className="video-viewer-content">
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
}
