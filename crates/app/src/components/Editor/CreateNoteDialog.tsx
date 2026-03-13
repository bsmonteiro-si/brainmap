import { useState, useEffect, useRef, useCallback } from "react";
import { useUIStore } from "../../stores/uiStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { useGraphStore } from "../../stores/graphStore";
import { useEditorStore } from "../../stores/editorStore";
import { useTabStore } from "../../stores/tabStore";
import { closeTabAndNavigateNext } from "../../stores/tabActions";
import { getAPI } from "../../api/bridge";
import { useUndoStore } from "../../stores/undoStore";
import { log } from "../../utils/logger";

/** Derive a human-readable title from a file path like "Concepts/My-Note.md" */
function titleFromPath(path: string): string {
  const base = path.split("/").pop() ?? path;
  const noExt = base.endsWith(".md") ? base.slice(0, -3) : base;
  return noExt.replace(/[-_]+/g, " ").trim();
}

export function CreateNoteDialog() {
  const close = useUIStore((s) => s.closeCreateNoteDialog);
  const initialPath = useUIStore((s) => s.createNoteInitialPath);
  const initialTitle = useUIStore((s) => s.createNoteInitialTitle);
  const createNoteMode = useUIStore((s) => s.createNoteMode);
  const linkSource = useUIStore((s) => s.createAndLinkSource);
  const saveAsBody = useUIStore((s) => s.createNoteSaveAsBody);
  const saveAsTabId = useUIStore((s) => s.createNoteSaveAsTabId);
  const noteTypes = useWorkspaceStore((s) => s.noteTypes);

  const isCreateAndLink = createNoteMode === "create-and-link" && linkSource !== null;
  const isSaveAs = saveAsBody != null && saveAsTabId != null;

  const [path, setPath] = useState(initialPath ?? "");
  // Auto-populate title from initialTitle (create-and-link) or from path
  const [title, setTitle] = useState(
    initialTitle
      ? initialTitle
      : initialPath && !initialPath.endsWith("/")
        ? titleFromPath(initialPath)
        : ""
  );
  const [titleManuallyEdited, setTitleManuallyEdited] = useState(!!initialTitle);
  // Only show path/title errors after the user has touched the field
  const [pathDirty, setPathDirty] = useState(false);
  const [noteType, setNoteType] = useState(noteTypes[0] ?? "concept");
  const [tags, setTags] = useState("");
  const [body, setBody] = useState(saveAsBody ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pathRef = useRef<HTMLInputElement>(null);

  // Focus path field on mount
  useEffect(() => {
    pathRef.current?.focus();
  }, []);

  // Auto-populate title from path only when user has not manually edited the title
  const handlePathChange = (value: string) => {
    setPath(value);
    setPathDirty(true);
    if (!titleManuallyEdited) {
      setTitle(titleFromPath(value));
    }
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setTitleManuallyEdited(true);
  };

  // Validate inline — only show errors after the user has edited the field
  const pathError = pathDirty && path.length > 0 && !path.endsWith(".md")
    ? "Path must end with .md"
    : null;
  const titleError = pathDirty && title.trim().length === 0 && path.length > 0
    ? "Title must not be empty"
    : null;

  const isValid = path.endsWith(".md") && title.trim().length > 0;

  const handleSubmit = useCallback(async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      const api = await getAPI();
      const createdPath = await api.createNote({
        path,
        title: title.trim(),
        note_type: noteType,
        tags: parsedTags,
        body: body || undefined,
      });

      // Optimistic update: add to graph store
      useGraphStore.getState().createNote(createdPath, title.trim(), noteType);
      useUndoStore.getState().pushAction({ kind: "create-note", path: createdPath });

      // Clean up empty folder tracking — the folder is no longer empty
      const parentDir = createdPath.includes("/")
        ? createdPath.slice(0, createdPath.lastIndexOf("/"))
        : null;
      if (parentDir) {
        const { emptyFolders, removeEmptyFolder } = useUIStore.getState();
        if (emptyFolders.has(parentDir)) {
          removeEmptyFolder(parentDir);
        }
      }

      if (isSaveAs && saveAsTabId) {
        // Save-as mode: close the untitled tab, then open the real note
        useTabStore.getState().closeTab(saveAsTabId);
        await useEditorStore.getState().openNote(createdPath);
      } else if (isCreateAndLink && linkSource) {
        // Create the link from source note to the newly created note
        try {
          await api.createLink(linkSource.notePath, createdPath, linkSource.rel);
          useGraphStore.getState().applyEvent({
            type: "edge-created",
            edge: {
              source: linkSource.notePath,
              target: createdPath,
              rel: linkSource.rel,
              kind: "Explicit",
            },
          });
          await useEditorStore.getState().refreshActiveNote();
        } catch (linkErr) {
          // Note was created but link failed — close dialog, the new note now
          // exists in the graph so the user can link to it manually from LinksEditor
          log.warn("components::CreateNoteDialog", "note created but linking failed", { error: String(linkErr) });
          close();
          return;
        }
      } else {
        // Default mode: open the new note in editor
        await useEditorStore.getState().openNote(createdPath);
      }

      close();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setIsSubmitting(false);
    }
  }, [isValid, isSubmitting, path, title, noteType, tags, body, close, isCreateAndLink, linkSource, isSaveAs, saveAsTabId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey || e.target === pathRef.current)) {
        // Cmd+Enter anywhere, or Enter in the path field
        e.preventDefault();
        handleSubmit();
      }
    },
    [close, handleSubmit]
  );

  // Global Escape listener for backdrop click also closes
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        close();
      }
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
    width: 480,
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

  const inputErrorStyle: React.CSSProperties = {
    ...inputStyle,
    borderColor: "var(--danger)",
  };

  const inlineErrorStyle: React.CSSProperties = {
    fontSize: 11,
    color: "var(--danger)",
    marginTop: 2,
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    height: 80,
    resize: "vertical",
    fontFamily: "inherit",
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
        <h2 style={headingStyle}>{isSaveAs ? "Save As" : isCreateAndLink ? "Create & Link" : "Create Note"}</h2>

        <div style={fieldGroupStyle}>
          <label style={labelStyle} htmlFor="cn-path">Path *</label>
          <input
            id="cn-path"
            ref={pathRef}
            type="text"
            style={pathError ? inputErrorStyle : inputStyle}
            value={path}
            onChange={(e) => handlePathChange(e.target.value)}
            placeholder="Concepts/My-Note.md"
            disabled={isSubmitting}
          />
          {pathError && <span style={inlineErrorStyle}>{pathError}</span>}
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle} htmlFor="cn-title">Title *</label>
          <input
            id="cn-title"
            type="text"
            style={titleError ? inputErrorStyle : inputStyle}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="My Note"
            disabled={isSubmitting}
          />
          {titleError && <span style={inlineErrorStyle}>{titleError}</span>}
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle} htmlFor="cn-type">Type *</label>
          <select
            id="cn-type"
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
          <label style={labelStyle} htmlFor="cn-tags">Tags (comma-separated)</label>
          <input
            id="cn-tags"
            type="text"
            style={inputStyle}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="causality, statistics"
            disabled={isSubmitting}
          />
        </div>

        {!isSaveAs && (
          <div style={fieldGroupStyle}>
            <label style={labelStyle} htmlFor="cn-body">Body (optional)</label>
            <textarea
              id="cn-body"
              style={textareaStyle}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Initial note content..."
              disabled={isSubmitting}
            />
          </div>
        )}

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
            {isSubmitting ? "Saving..." : isSaveAs ? "Save" : isCreateAndLink ? "Create & Link" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
