import { useState, useEffect, useRef, useCallback } from "react";
import { useUIStore } from "../../stores/uiStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { getAPI } from "../../api/bridge";
import { slugify } from "../../utils/slugify";
import { log } from "../../utils/logger";

export function ConvertToNoteDialog() {
  const close = useUIStore((s) => s.closeConvertToNote);
  const initialTitle = useUIStore((s) => s.convertToNoteTitle);
  const initialBody = useUIStore((s) => s.convertToNoteBody);
  const initialType = useUIStore((s) => s.convertToNoteType);
  const initialPath = useUIStore((s) => s.convertToNotePath);
  const callback = useUIStore((s) => s.convertToNoteCallback);
  const noteTypes = useWorkspaceStore((s) => s.noteTypes);

  const [title, setTitle] = useState(initialTitle);
  const [noteType, setNoteType] = useState(initialType);
  const [folderPath, setFolderPath] = useState(initialPath);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    titleRef.current?.select();
  }, []);

  const slug = slugify(title);
  const fullPath = folderPath
    ? `${folderPath}/${slug}.md`
    : `${slug}.md`;
  const hasPathTraversal = folderPath.split("/").some((s) => s === "..");
  const pathError = hasPathTraversal ? "Path must not contain '..'" : null;
  const isValid = title.trim().length > 0 && slug.length > 0 && !hasPathTraversal;

  const handleSubmit = useCallback(async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const api = await getAPI();
      await api.createNote({
        path: fullPath,
        title: title.trim(),
        note_type: noteType,
        body: initialBody || undefined,
      });

      callback?.(fullPath);
      close();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      log.warn("canvas::convertToNote", "failed to create note", { error: msg });
      setError(msg);
      setIsSubmitting(false);
    }
  }, [isValid, isSubmitting, fullPath, title, noteType, initialBody, callback, close]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [close, handleSubmit],
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) close();
    },
    [close],
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
    width: 440,
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
        <h2 style={headingStyle}>Convert to Note</h2>

        <div style={fieldGroupStyle}>
          <label style={labelStyle} htmlFor="ctn-title">Title</label>
          <input
            id="ctn-title"
            ref={titleRef}
            type="text"
            style={inputStyle}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle} htmlFor="ctn-type">Note Type</label>
          <select
            id="ctn-type"
            style={inputStyle}
            value={noteType}
            onChange={(e) => setNoteType(e.target.value)}
            disabled={isSubmitting}
          >
            {noteTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle} htmlFor="ctn-folder">Folder</label>
          <input
            id="ctn-folder"
            type="text"
            style={inputStyle}
            value={folderPath}
            onChange={(e) => setFolderPath(e.target.value)}
            placeholder="(workspace root)"
            disabled={isSubmitting}
          />
          {pathError && (
            <span style={{ fontSize: 11, color: "var(--danger)", marginTop: 2 }}>{pathError}</span>
          )}
          {slug && !pathError && (
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
              {fullPath}
            </span>
          )}
        </div>

        {error && <div style={globalErrorStyle}>{error}</div>}

        <div style={actionsStyle}>
          <button style={btnSecondaryStyle} onClick={close} disabled={isSubmitting}>
            Cancel
          </button>
          <button style={btnPrimaryStyle} onClick={handleSubmit} disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Note"}
          </button>
        </div>
      </div>
    </div>
  );
}
