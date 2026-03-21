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
import { pickFolder } from "../../api/pickFolder";

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
  const fileKind = useUIStore((s) => s.createFileKind);
  const setFileKind = useCallback((kind: "note" | "file" | "canvas" | "excalidraw") => {
    useUIStore.setState({ createFileKind: kind });
  }, []);
  const linkSource = useUIStore((s) => s.createAndLinkSource);
  const saveAsBody = useUIStore((s) => s.createNoteSaveAsBody);
  const saveAsTabId = useUIStore((s) => s.createNoteSaveAsTabId);
  const noteTypes = useWorkspaceStore((s) => s.noteTypes);
  const workspaceRoot = useWorkspaceStore((s) => s.info?.root ?? null);

  const isCreateAndLink = createNoteMode === "create-and-link" && linkSource !== null;
  const isSaveAs = saveAsBody != null && saveAsTabId != null;
  const isNoteMode = fileKind === "note";
  const isCanvasMode = fileKind === "canvas";
  const isExcalidrawMode = fileKind === "excalidraw";
  const isSpecialFileMode = isCanvasMode || isExcalidrawMode;
  // Special modes always force note mode; canvas/excalidraw hide the toggle
  const showModeToggle = !isCreateAndLink && !isSaveAs && !isSpecialFileMode;

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
    if (!titleManuallyEdited && isNoteMode) {
      setTitle(titleFromPath(value));
    }
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setTitleManuallyEdited(true);
  };

  const handleBrowseFolder = useCallback(async () => {
    const absPath = await pickFolder();
    if (!absPath || !workspaceRoot) return;
    const normalizedRoot = workspaceRoot.replace(/\/$/, "");
    if (!absPath.startsWith(normalizedRoot)) return; // outside workspace
    const relative = absPath.slice(normalizedRoot.length + 1); // strip root + separator
    // Keep the current filename, change the folder prefix
    const basename = path.split("/").pop() ?? path;
    const newPath = relative ? `${relative}/${basename}` : basename;
    setPath(newPath);
    setPathDirty(true);
  }, [workspaceRoot, path]);

  // Validate inline — only show errors after the user has edited the field
  const notePathError = isNoteMode && pathDirty && path.length > 0 && path.trim().length === 0
    ? "Path must not be empty"
    : null;
  const fileBasename = path.split("/").pop() ?? path;
  const fileHasExtension = fileBasename.includes(".") && !fileBasename.endsWith(".");
  const filePathError = !isNoteMode && !isSpecialFileMode && pathDirty && path.length > 0
    ? path.endsWith(".md")
      ? "Use Note mode for .md files"
      : !fileHasExtension
        ? "Path must include a file extension"
        : null
    : null;
  const pathError = isNoteMode ? notePathError : filePathError;
  const titleError = isNoteMode && pathDirty && title.trim().length === 0 && path.length > 0
    ? "Title must not be empty"
    : null;

  const isValid = isNoteMode
    ? path.trim().length > 0 && title.trim().length > 0
    : isSpecialFileMode
      ? path.trim().length > 0
      : path.trim().length > 0 && fileHasExtension && !path.endsWith(".md");

  const handleSubmit = useCallback(async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const api = await getAPI();

      if (isNoteMode) {
        // Note creation path (also covers create-and-link and save-as, which force note mode)
        const finalPath = path.endsWith(".md") ? path : path + ".md";
        const parsedTags = tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0);

        const createdPath = await api.createNote({
          path: finalPath,
          title: title.trim(),
          note_type: noteType,
          tags: parsedTags,
          body: body || undefined,
        });

        // Backend emits topology event — no manual graph update needed
        useGraphStore.getState().selectNode(createdPath);
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
          useTabStore.getState().closeTab(saveAsTabId);
          await useEditorStore.getState().openNote(createdPath);
        } else if (isCreateAndLink && linkSource) {
          try {
            await api.createLink(linkSource.notePath, createdPath, linkSource.rel);
            // Backend emits topology event for the new edge
            await useEditorStore.getState().refreshActiveNote();
          } catch (linkErr) {
            log.warn("components::CreateNoteDialog", "note created but linking failed", { error: String(linkErr) });
            close();
            return;
          }
        } else {
          await useEditorStore.getState().openNote(createdPath);
        }
      } else if (isCanvasMode) {
        // Canvas creation
        const ext = ".canvas";
        const finalPath = path.endsWith(ext) ? path : path + ext;
        const emptyCanvas = JSON.stringify({ nodes: [], edges: [] });
        await api.writePlainFile(finalPath, emptyCanvas);
        useUIStore.getState().openCanvasInPanel(finalPath);
      } else if (isExcalidrawMode) {
        // Excalidraw creation
        const ext = ".excalidraw";
        const finalPath = path.endsWith(ext) ? path : path + ext;
        const emptyDrawing = JSON.stringify({
          type: "excalidraw", version: 2, source: "brainmap",
          elements: [], appState: {}, files: {},
        });
        await api.writePlainFile(finalPath, emptyDrawing);
        await useEditorStore.getState().clearForCustomTab();
        const fileName = finalPath.split("/").pop() ?? finalPath;
        useTabStore.getState().openTab(finalPath, "excalidraw", fileName, null);
      } else {
        // Plain file creation path — no graph update, no undo (plain files are not graph-managed)
        const createdPath = await api.createPlainFile(path, body || undefined);

        // Clean up empty folder tracking
        const parentDir = createdPath.includes("/")
          ? createdPath.slice(0, createdPath.lastIndexOf("/"))
          : null;
        if (parentDir) {
          const { emptyFolders, removeEmptyFolder } = useUIStore.getState();
          if (emptyFolders.has(parentDir)) {
            removeEmptyFolder(parentDir);
          }
        }

        await useEditorStore.getState().openPlainFile(createdPath);
      }

      // Notify canvas (or other caller) that a file was created
      const onCreated = useUIStore.getState().createNoteOnCreatedCallback;
      if (onCreated) {
        const createdFilePath = isNoteMode
          ? (path.endsWith(".md") ? path : path + ".md")
          : isCanvasMode
            ? (path.endsWith(".canvas") ? path : path + ".canvas")
            : isExcalidrawMode
              ? (path.endsWith(".excalidraw") ? path : path + ".excalidraw")
              : path;
        onCreated(createdFilePath);
      }

      close();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setIsSubmitting(false);
    }
  }, [isValid, isSubmitting, path, title, noteType, tags, body, close, isCreateAndLink, linkSource, isSaveAs, saveAsTabId, isNoteMode, isCanvasMode, isExcalidrawMode]);

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

  const segmentedStyle: React.CSSProperties = {
    display: "flex",
    borderRadius: 6,
    border: "1px solid var(--border-color)",
    overflow: "hidden",
  };

  const segBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "5px 12px",
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    border: "none",
    background: active ? "var(--accent)" : "var(--bg-secondary)",
    color: active ? "white" : "var(--text-secondary)",
    cursor: "pointer",
  });

  const headingText = isSaveAs
    ? "Save As"
    : isCreateAndLink
      ? "Create & Link"
      : isCanvasMode
        ? "Create Canvas"
        : isExcalidrawMode
          ? "Create Drawing"
          : isNoteMode
            ? "Create Note"
            : "Create File";

  return (
    <div style={overlayStyle} onClick={handleOverlayClick}>
      <div style={boxStyle} onKeyDown={handleKeyDown}>
        <h2 style={headingStyle}>{headingText}</h2>

        {showModeToggle && (
          <div style={segmentedStyle}>
            <button
              style={segBtnStyle(isNoteMode)}
              onClick={() => setFileKind("note")}
              disabled={isSubmitting}
            >
              Note
            </button>
            <button
              style={segBtnStyle(!isNoteMode)}
              onClick={() => setFileKind("file")}
              disabled={isSubmitting}
            >
              File
            </button>
          </div>
        )}

        <div style={fieldGroupStyle}>
          <label style={labelStyle} htmlFor="cn-path">Path *</label>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              id="cn-path"
              ref={pathRef}
              type="text"
              style={pathError ? { ...inputErrorStyle, flex: 1 } : { ...inputStyle, flex: 1 }}
              value={path}
              onChange={(e) => handlePathChange(e.target.value)}
              placeholder={isCanvasMode ? "My Canvas" : isExcalidrawMode ? "My Drawing" : isNoteMode ? "Concepts/My-Note" : "config.json"}
              disabled={isSubmitting}
            />
            <button
              type="button"
              style={btnSecondaryStyle}
              onClick={handleBrowseFolder}
              disabled={isSubmitting}
            >
              Browse
            </button>
          </div>
          {pathError && <span style={inlineErrorStyle}>{pathError}</span>}
          {isNoteMode && !isSaveAs && (
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>.md extension added automatically</span>
          )}
          {isCanvasMode && (
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>.canvas extension added automatically</span>
          )}
          {isExcalidrawMode && (
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>.excalidraw extension added automatically</span>
          )}
        </div>

        {isNoteMode && (
          <>
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
          </>
        )}

        {!isSaveAs && !isSpecialFileMode && (
          <div style={fieldGroupStyle}>
            <label style={labelStyle} htmlFor="cn-body">Body (optional)</label>
            <textarea
              id="cn-body"
              style={textareaStyle}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={isNoteMode ? "Initial note content..." : "File content..."}
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
