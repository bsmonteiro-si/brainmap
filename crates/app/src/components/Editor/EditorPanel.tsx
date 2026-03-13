import { useState, useEffect, useCallback } from "react";
import { useEditorStore } from "../../stores/editorStore";
import { useUIStore } from "../../stores/uiStore";
import { MarkdownEditor } from "./MarkdownEditor";
import { MarkdownPreview } from "./MarkdownPreview";
import { FrontmatterForm } from "./FrontmatterForm";
import { RelatedNotesFooter } from "./RelatedNotesFooter";
import { EditorToolbar } from "./EditorToolbar";
import { getNodeColor } from "../GraphView/graphStyles";
import type { EditorView } from "@codemirror/view";

export function EditorPanel() {
  const activeNote = useEditorStore((s) => s.activeNote);
  const activePlainFile = useEditorStore((s) => s.activePlainFile);
  const isLoading = useEditorStore((s) => s.isLoading);
  const conflictState = useEditorStore((s) => s.conflictState);
  const resolveConflict = useEditorStore((s) => s.resolveConflict);
  const focusMode = useUIStore((s) => s.focusMode);
  const toggleFocusMode = useUIStore((s) => s.toggleFocusMode);
  const isDirty = useEditorStore((s) => s.isDirty);
  const editedFm = useEditorStore((s) => s.editedFrontmatter);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const editedBody = useEditorStore((s) => s.editedBody);
  const onEditorChange = useCallback((body: string) => {
    useEditorStore.getState().updateContent(body);
  }, []);

  const activePath = activeNote?.path ?? activePlainFile?.path;

  useEffect(() => {
    setViewMode("edit");
    setEditorView(null);
  }, [activePath]);

  if (isLoading) {
    return <div className="editor-placeholder">Loading note...</div>;
  }

  // Plain file view
  if (activePlainFile && !activeNote) {
    const fileName = activePlainFile.path.split("/").pop() ?? activePlainFile.path;

    if (activePlainFile.binary) {
      return (
        <div className="editor-panel">
          <div className="editor-hero">
            <h1 className="editor-hero-title">{fileName}</h1>
            <div className="meta-row">
              <span className="meta-source">{activePlainFile.path}</span>
            </div>
          </div>
          <div className="editor-body" style={{ display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.5 }}>
            Binary file — cannot be displayed
          </div>
        </div>
      );
    }

    const body = editedBody ?? activePlainFile.body;

    return (
      <div className="editor-panel">
        <div className="editor-hero">
          <div className="editor-hero-top">
            <div className="editor-view-toggle">
              <button
                className={`editor-view-btn${viewMode === "edit" ? " editor-view-btn--active" : ""}`}
                onClick={() => setViewMode("edit")}
                type="button"
              >Edit</button>
              <button
                className={`editor-view-btn${viewMode === "preview" ? " editor-view-btn--active" : ""}`}
                onClick={() => setViewMode("preview")}
                type="button"
              >Preview</button>
            </div>
            <button
              className="editor-focus-btn"
              onClick={toggleFocusMode}
              title={focusMode ? "Exit focus mode" : "Focus mode"}
            >
              {focusMode ? "\u2921" : "\u2922"}
            </button>
          </div>
          <h1 className="editor-hero-title">
            {fileName}
            {isDirty && <span className="editor-dirty-dot" title="Unsaved changes" />}
          </h1>
          <div className="meta-row">
            <span className="meta-source">{activePlainFile.path}</span>
          </div>
        </div>
        {conflictState === "external-change" && (
          <div className="conflict-banner">
            <span>File changed externally.</span>
            <button onClick={() => resolveConflict("keep-mine")}>Keep Mine</button>
            <button onClick={() => resolveConflict("accept-theirs")}>Accept Theirs</button>
          </div>
        )}
        {viewMode === "edit" && <EditorToolbar editorView={editorView} />}
        <div className="editor-body">
          <div className={`editor-view-layer${viewMode === "edit" ? " editor-view-layer--active" : ""}`}>
            <MarkdownEditor
              notePath={activePlainFile.path}
              content={body}
              onChange={onEditorChange}
              onViewReady={setEditorView}
            />
          </div>
          <div className={`editor-view-layer${viewMode === "preview" ? " editor-view-layer--active" : ""}`}>
            <MarkdownPreview content={body} notePath={activePlainFile.path} />
          </div>
        </div>
      </div>
    );
  }

  if (!activeNote) {
    return (
      <div className="editor-empty-state">
        <div className="editor-empty-icon">{"\u{1F9E0}"}</div>
        <div className="editor-empty-brand">BrainMap</div>
        <div className="editor-empty-hint">Select a note to start exploring</div>
      </div>
    );
  }

  const displayTitle = editedFm?.title ?? activeNote.title;
  const displayType = editedFm?.note_type ?? activeNote.note_type;
  const displayTags = editedFm?.tags ?? activeNote.tags;
  const displayStatus = editedFm?.status !== undefined ? editedFm.status : activeNote.status;
  const displaySource = editedFm?.source !== undefined ? editedFm.source : activeNote.source;

  return (
    <div className="editor-panel">
      <div className="editor-hero">
        <div className="editor-hero-top">
          <div className="editor-view-toggle">
            <button
              className={`editor-view-btn${viewMode === "edit" ? " editor-view-btn--active" : ""}`}
              onClick={() => setViewMode("edit")}
              type="button"
            >Edit</button>
            <button
              className={`editor-view-btn${viewMode === "preview" ? " editor-view-btn--active" : ""}`}
              onClick={() => setViewMode("preview")}
              type="button"
            >Preview</button>
          </div>
          <button
            className="editor-focus-btn"
            onClick={toggleFocusMode}
            title={focusMode ? "Exit focus mode" : "Focus mode"}
          >
            {focusMode ? "\u2921" : "\u2922"}
          </button>
        </div>
        <h1 className="editor-hero-title">
          {displayTitle}
          {isDirty && <span className="editor-dirty-dot" title="Unsaved changes" />}
          <span
            className="meta-type-pill"
            style={{ backgroundColor: getNodeColor(displayType) }}
          >
            {displayType}
          </span>
        </h1>
        {(displayTags.length > 0 || displayStatus || displaySource) && (
          <div className="meta-row">
            {displayTags.map((t) => (
              <span key={t} className="meta-tag-chip">{t}</span>
            ))}
            {displayStatus && (
              <span className="meta-status">
                <span className="meta-status-dot" data-status={displayStatus} />
                {displayStatus}
              </span>
            )}
            {displaySource && (
              <span className="meta-source">{displaySource}</span>
            )}
          </div>
        )}
      </div>
      {conflictState === "external-change" && (
        <div className="conflict-banner">
          <span>File changed externally.</span>
          <button onClick={() => resolveConflict("keep-mine")}>Keep Mine</button>
          <button onClick={() => resolveConflict("accept-theirs")}>Accept Theirs</button>
        </div>
      )}
      <FrontmatterForm note={activeNote} />
      {viewMode === "edit" && <EditorToolbar editorView={editorView} />}
      <div className="editor-body">
        <div className={`editor-view-layer${viewMode === "edit" ? " editor-view-layer--active" : ""}`}>
          <MarkdownEditor
            notePath={activeNote.path}
            content={editedBody ?? activeNote.body}
            onChange={onEditorChange}
            onViewReady={setEditorView}
          />
        </div>
        <div className={`editor-view-layer${viewMode === "preview" ? " editor-view-layer--active" : ""}`}>
          <MarkdownPreview content={editedBody ?? activeNote.body} notePath={activeNote.path} />
        </div>
      </div>
      <RelatedNotesFooter />
    </div>
  );
}
