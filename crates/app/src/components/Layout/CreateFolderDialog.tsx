import { useState, useEffect, useRef, useCallback } from "react";
import { useUIStore } from "../../stores/uiStore";
import { useUndoStore } from "../../stores/undoStore";
import { getAPI } from "../../api/bridge";

export function CreateFolderDialog() {
  const close = useUIStore((s) => s.closeCreateFolderDialog);
  const initialPath = useUIStore((s) => s.createFolderInitialPath);

  const [path, setPath] = useState(initialPath ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const isValid = path.trim().length > 0;

  const handleSubmit = useCallback(async () => {
    const val = path.trim();
    if (!val || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const api = await getAPI();
      await api.createFolder(val);
      useUIStore.getState().addEmptyFolder(val);
      useUndoStore.getState().pushAction({ kind: "create-folder", folderPath: val });
      close();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setIsSubmitting(false);
    }
  }, [path, isSubmitting, close]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [close, handleSubmit]
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) close();
    },
    [close]
  );

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const boxStyle: React.CSSProperties = {
    background: "var(--bg-primary)",
    border: "1px solid var(--border-color)",
    borderRadius: 8,
    padding: 24,
    width: 420,
    maxWidth: "90vw",
    boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  };

  const headingStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 600,
    color: "var(--text-primary)",
    margin: 0,
  };

  const fieldGroupStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  const inputStyle: React.CSSProperties = {
    padding: "6px 10px",
    fontSize: 13,
    border: "1px solid var(--border-color)",
    borderRadius: 4,
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    width: "100%",
    boxSizing: "border-box",
  };

  const actionsStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 4,
  };

  const btnSecondaryStyle: React.CSSProperties = {
    padding: "6px 16px",
    fontSize: 13,
    border: "1px solid var(--border-color)",
    borderRadius: 4,
    background: "var(--bg-secondary)",
    color: "var(--text-primary)",
    cursor: "pointer",
  };

  const btnPrimaryStyle: React.CSSProperties = {
    padding: "6px 16px",
    fontSize: 13,
    border: "none",
    borderRadius: 4,
    background: isValid && !isSubmitting ? "var(--accent)" : "var(--bg-tertiary)",
    color: isValid && !isSubmitting ? "white" : "var(--text-muted)",
    cursor: isValid && !isSubmitting ? "pointer" : "not-allowed",
  };

  const globalErrorStyle: React.CSSProperties = {
    fontSize: 13,
    color: "var(--danger)",
    background: "rgba(231,76,60,0.1)",
    border: "1px solid var(--danger)",
    borderRadius: 4,
    padding: "6px 10px",
  };

  return (
    <div style={overlayStyle} onClick={handleOverlayClick}>
      <div style={boxStyle} onKeyDown={handleKeyDown}>
        <h2 style={headingStyle}>Create Folder</h2>

        <div style={fieldGroupStyle}>
          <label style={labelStyle} htmlFor="cf-path">Folder Path</label>
          <input
            id="cf-path"
            ref={inputRef}
            type="text"
            style={inputStyle}
            value={path}
            onChange={(e) => { setPath(e.target.value); setError(null); }}
            placeholder="folder/subfolder"
            disabled={isSubmitting}
          />
        </div>

        {error && <div style={globalErrorStyle}>{error}</div>}

        <div style={actionsStyle}>
          <button
            style={btnSecondaryStyle}
            onClick={close}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            style={btnPrimaryStyle}
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
