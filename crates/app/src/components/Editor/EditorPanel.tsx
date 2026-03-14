import { useEffect, useCallback, useRef } from "react";
import { useEditorStore } from "../../stores/editorStore";
import { useUIStore } from "../../stores/uiStore";
import { useTabStore } from "../../stores/tabStore";
import { MarkdownEditor } from "./MarkdownEditor";
import { MarkdownPreview } from "./MarkdownPreview";
import { FrontmatterForm } from "./FrontmatterForm";
import { RelatedNotesFooter } from "./RelatedNotesFooter";
import { EditorToolbar } from "./EditorToolbar";
import { getNodeColor } from "../GraphView/graphStyles";
import type { EditorView } from "@codemirror/view";

export function EditorPanel() {
  const editorViewRef = useRef<EditorView | null>(null);
  const activeNote = useEditorStore((s) => s.activeNote);
  const activePlainFile = useEditorStore((s) => s.activePlainFile);
  const isUntitled = useEditorStore((s) => s.isUntitledTab);
  const isLoading = useEditorStore((s) => s.isLoading);
  const conflictState = useEditorStore((s) => s.conflictState);
  const resolveConflict = useEditorStore((s) => s.resolveConflict);
  const focusMode = useUIStore((s) => s.focusMode);
  const toggleFocusMode = useUIStore((s) => s.toggleFocusMode);
  const showLineNumbers = useUIStore((s) => s.showLineNumbers);
  const toggleLineNumbers = useUIStore((s) => s.toggleLineNumbers);
  const isDirty = useEditorStore((s) => s.isDirty);
  const editedFm = useEditorStore((s) => s.editedFrontmatter);
  const viewMode = useEditorStore((s) => s.viewMode);
  const setViewMode = useEditorStore((s) => s.setViewMode);
  const editedBody = useEditorStore((s) => s.editedBody);
  const rawContent = useEditorStore((s) => s.rawContent);
  const scrollTop = useEditorStore((s) => s.scrollTop);
  const cursorPos = useEditorStore((s) => s.cursorPos);
  const tabs = useTabStore((s) => s.tabs);
  const activeTabId = useTabStore((s) => s.activeTabId);

  const onEditorChange = useCallback((body: string) => {
    useEditorStore.getState().updateContent(body);
  }, []);

  const onRawChange = useCallback((body: string) => {
    useEditorStore.getState().updateRawContent(body);
  }, []);

  // Capture scroll/cursor from editorView before note switch
  const handleViewReady = useCallback((view: EditorView | null) => {
    editorViewRef.current = view;
  }, []);

  const activePath = activeNote?.path ?? activePlainFile?.path ?? (isUntitled ? activeTabId : undefined);

  // When activePath changes (tab switch), capture scroll/cursor from the old view
  useEffect(() => {
    return () => {
      // Cleanup: capture scroll/cursor from the current view before it switches
      if (editorViewRef.current) {
        const scrollPos = editorViewRef.current.scrollDOM.scrollTop;
        const cursor = editorViewRef.current.state.selection.main.head;
        useEditorStore.getState().setScrollCursor(scrollPos, cursor);
      }
    };
  }, [activePath]);

  if (isLoading) {
    return (
      <div className="editor-panel-container">
        <div className="editor-placeholder">Loading note...</div>
      </div>
    );
  }

  // Plain file view
  if (activePlainFile && !activeNote) {
    const fileName = activePlainFile.path.split("/").pop() ?? activePlainFile.path;

    if (activePlainFile.binary) {
      return (
        <div className="editor-panel-container">
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
        </div>
      );
    }

    const body = editedBody ?? activePlainFile.body;

    return (
      <div className="editor-panel-container">
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
          {viewMode === "edit" && <EditorToolbar editorView={editorViewRef.current} />}
          <div className="editor-body">
            <div className={`editor-view-layer${viewMode === "edit" ? " editor-view-layer--active" : ""}`}>
              <MarkdownEditor
                notePath={activePlainFile.path}
                content={body}
                onChange={onEditorChange}
                onViewReady={handleViewReady}
                restoreScrollTop={scrollTop}
                restoreCursorPos={cursorPos}
              />
            </div>
            <div className={`editor-view-layer${viewMode === "preview" ? " editor-view-layer--active" : ""}`}>
              <MarkdownPreview content={body} notePath={activePlainFile.path} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Untitled tab view — simplified editor with no metadata or related notes
  if (isUntitled && !activeNote && !activePlainFile && activeTabId) {
    const tab = useTabStore.getState().getTab(activeTabId);
    const untitledTitle = tab?.title ?? "Untitled";
    const body = editedBody ?? "";

    return (
      <div className="editor-panel-container">
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
              {untitledTitle}
              {isDirty && <span className="editor-dirty-dot" title="Unsaved changes" />}
            </h1>
          </div>
          {viewMode === "edit" && <EditorToolbar editorView={editorViewRef.current} />}
          <div className="editor-body">
            <div className={`editor-view-layer${viewMode === "edit" ? " editor-view-layer--active" : ""}`}>
              <MarkdownEditor
                notePath={activeTabId}
                content={body}
                onChange={onEditorChange}
                onViewReady={handleViewReady}
                restoreScrollTop={scrollTop}
                restoreCursorPos={cursorPos}
              />
            </div>
            <div className={`editor-view-layer${viewMode === "preview" ? " editor-view-layer--active" : ""}`}>
              <MarkdownPreview content={body} notePath={activeTabId} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!activeNote && tabs.length === 0) {
    return (
      <div className="editor-panel-container">
        <div className="editor-empty-state">
          <div className="editor-empty-icon">{"\u{1F9E0}"}</div>
          <div className="editor-empty-brand">BrainMap</div>
          <div className="editor-empty-hint">Select a note to start exploring</div>
        </div>
      </div>
    );
  }

  if (!activeNote) {
    return (
      <div className="editor-panel-container">
        <div className="editor-placeholder">Loading note...</div>
      </div>
    );
  }

  const displayTitle = editedFm?.title ?? activeNote.title;
  const displayType = editedFm?.note_type ?? activeNote.note_type;
  const displayTags = editedFm?.tags ?? activeNote.tags;
  const displayStatus = editedFm?.status !== undefined ? editedFm.status : activeNote.status;
  const displaySource = editedFm?.source !== undefined ? editedFm.source : activeNote.source;

  return (
    <div className="editor-panel-container">
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
              <button
                className={`editor-view-btn${viewMode === "raw" ? " editor-view-btn--active" : ""}`}
                onClick={() => setViewMode("raw")}
                type="button"
              >Raw</button>
            </div>
            <button
              className={`editor-line-numbers-btn${showLineNumbers ? " editor-line-numbers-btn--active" : ""}`}
              onClick={toggleLineNumbers}
              title={showLineNumbers ? "Hide line numbers" : "Show line numbers"}
            >
              #
            </button>
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
            {viewMode !== "raw" && (
              <span
                className="meta-type-pill"
                style={{ backgroundColor: getNodeColor(displayType) }}
              >
                {displayType}
              </span>
            )}
          </h1>
          {viewMode !== "raw" && (displayTags.length > 0 || displayStatus || displaySource) && (
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
        {viewMode !== "raw" && <FrontmatterForm note={activeNote} />}
        {viewMode === "edit" && <EditorToolbar editorView={editorViewRef.current} />}
        <div className="editor-body">
          <div className={`editor-view-layer${viewMode === "edit" ? " editor-view-layer--active" : ""}`}>
            <MarkdownEditor
              notePath={activeNote.path}
              content={editedBody ?? activeNote.body}
              onChange={onEditorChange}
              onViewReady={handleViewReady}
              restoreScrollTop={scrollTop}
              restoreCursorPos={cursorPos}
            />
          </div>
          <div className={`editor-view-layer${viewMode === "preview" ? " editor-view-layer--active" : ""}`}>
            <MarkdownPreview content={editedBody ?? activeNote.body} notePath={activeNote.path} />
          </div>
          <div className={`editor-view-layer${viewMode === "raw" ? " editor-view-layer--active" : ""}`}>
            {rawContent !== null ? (
              <MarkdownEditor
                key="raw"
                notePath={activeNote.path}
                content={rawContent}
                onChange={onRawChange}
              />
            ) : viewMode === "raw" ? (
              <div className="editor-placeholder">Loading raw content...</div>
            ) : null}
          </div>
        </div>
        {viewMode !== "raw" && <RelatedNotesFooter />}
      </div>
    </div>
  );
}
