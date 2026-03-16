import { useState, useEffect, useCallback } from "react";
import { getAPI } from "../../api/bridge";
import { useEditorStore } from "../../stores/editorStore";
import { useGraphStore } from "../../stores/graphStore";
import type { EdgeDto } from "../../api/types";

interface DeleteTarget {
  name: string;
  fullPath: string;
  isFolder: boolean;
  note_type?: string;
}

interface ExternalBacklink {
  source_path: string;
  target_path: string;
  rel: string;
}

interface Props {
  target: DeleteTarget;
  onConfirm: (force: boolean) => void;
  onCancel: () => void;
}

export function ConfirmDeleteDialog({ target, onConfirm, onCancel }: Props) {
  const [backlinks, setBacklinks] = useState<EdgeDto[]>([]);
  const [folderExternalBacklinks, setFolderExternalBacklinks] = useState<ExternalBacklink[]>([]);
  const [folderNoteCount, setFolderNoteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBrainMapNote = !target.isFolder && !!target.note_type;

  const activeNote = useEditorStore((s) => s.activeNote);
  const isDirty = useEditorStore((s) => s.isDirty);

  // Check if active note is in the delete scope
  const activeNoteInScope = activeNote
    ? target.isFolder
      ? activeNote.path.startsWith(target.fullPath + "/")
      : activeNote.path === target.fullPath
    : false;
  const hasUnsavedChanges = activeNoteInScope && isDirty;

  // Load backlink info on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Untracked (non-BrainMap) single files have no backlinks to check
      if (!target.isFolder && !target.note_type) {
        if (!cancelled) setIsLoading(false);
        return;
      }
      try {
        const api = await getAPI();
        if (target.isFolder) {
          // Count notes in folder from graph store and collect their paths
          const nodes = useGraphStore.getState().nodes;
          const prefix = target.fullPath + "/";
          const folderNotePaths: string[] = [];
          for (const [path] of nodes) {
            if (path.startsWith(prefix)) folderNotePaths.push(path);
          }
          if (!cancelled) setFolderNoteCount(folderNotePaths.length);

          // Check backlinks for each note, excluding intra-folder links
          const folderNoteSet = new Set(folderNotePaths);
          const extBacklinks: ExternalBacklink[] = [];
          for (const notePath of folderNotePaths) {
            try {
              const incoming = await api.listLinks(notePath, "Incoming");
              for (const edge of incoming) {
                if (!folderNoteSet.has(edge.source)) {
                  extBacklinks.push({
                    source_path: edge.source,
                    target_path: notePath,
                    rel: edge.rel,
                  });
                }
              }
            } catch {
              // Non-critical — skip this note's backlink check
            }
          }
          if (!cancelled && extBacklinks.length > 0) {
            setFolderExternalBacklinks(extBacklinks);
          }
        } else {
          // For single notes, check incoming links
          const incoming = await api.listLinks(target.fullPath, "Incoming");
          if (!cancelled) setBacklinks(incoming);
        }
      } catch {
        // Non-critical — we can still show the dialog without backlink info
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [target]);

  const hasBacklinks = target.isFolder
    ? folderExternalBacklinks.length > 0
    : backlinks.length > 0;

  const handleConfirm = useCallback(async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm(hasBacklinks);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setIsDeleting(false);
    }
  }, [onConfirm, hasBacklinks]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter" && !isLoading && !isDeleting) handleConfirm();
    },
    [onCancel, isLoading, isDeleting, handleConfirm]
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onCancel();
    },
    [onCancel]
  );

  // ── Styles (matching CreateNoteDialog pattern) ──────────────────

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

  const warningStyle: React.CSSProperties = {
    fontSize: 13,
    color: "var(--danger, #e53935)",
    background: "color-mix(in srgb, var(--danger, #e53935) 8%, transparent)",
    borderRadius: 6,
    padding: "8px 12px",
  };

  const backlinkListStyle: React.CSSProperties = {
    margin: "6px 0 0 0",
    padding: "0 0 0 18px",
    fontSize: 12,
    maxHeight: 120,
    overflowY: "auto",
  };

  const actionsStyle: React.CSSProperties = {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
  };

  const btnBase: React.CSSProperties = {
    padding: "6px 16px",
    borderRadius: 4,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    border: "1px solid var(--border-color)",
  };

  const btnCancel: React.CSSProperties = {
    ...btnBase,
    background: "var(--bg-secondary)",
    color: "var(--text-primary)",
  };

  const btnDanger: React.CSSProperties = {
    ...btnBase,
    background: "var(--danger, #e53935)",
    color: "white",
    border: "none",
    opacity: isLoading || isDeleting ? 0.6 : 1,
  };

  return (
    <div style={overlayStyle} onClick={handleOverlayClick}>
      <div style={boxStyle} onKeyDown={handleKeyDown} tabIndex={-1} ref={(el) => el?.focus()}>
        <h2 style={headingStyle}>
          Delete {target.isFolder ? "folder" : ""} "{target.name}"?
        </h2>

        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          {target.isFolder ? (
            (() => {
              const { workspaceFiles } = useGraphStore.getState();
              const nodes = useGraphStore.getState().nodes;
              const prefix = target.fullPath + "/";
              const untrackedCount = workspaceFiles.filter(
                (f) => f.startsWith(prefix) && !nodes.has(f)
              ).length;
              const totalItems = folderNoteCount + untrackedCount;
              if (totalItems === 0) return <>This empty folder will be removed.</>;
              return (
                <>
                  This folder contains{" "}
                  {folderNoteCount > 0 && <><strong>{folderNoteCount}</strong> note{folderNoteCount !== 1 ? "s" : ""}</>}
                  {folderNoteCount > 0 && untrackedCount > 0 && " and "}
                  {untrackedCount > 0 && <><strong>{untrackedCount}</strong> other file{untrackedCount !== 1 ? "s" : ""}</>}
                  . All will be permanently deleted.
                  {untrackedCount > 0 && " Non-note files cannot be restored after deletion."}
                </>
              );
            })()
          ) : isBrainMapNote ? (
            <>This note will be permanently deleted.</>
          ) : (
            <>This file will be permanently deleted. This action cannot be undone.</>
          )}
        </div>

        {hasUnsavedChanges && (
          <div style={warningStyle}>
            This note has unsaved changes that will be lost.
          </div>
        )}

        {!isLoading && hasBacklinks && (
          <div style={warningStyle}>
            {target.isFolder ? (
              <>
                Notes in this folder have <strong>{folderExternalBacklinks.length}</strong> incoming link{folderExternalBacklinks.length !== 1 ? "s" : ""} from notes outside the folder. Deleting will break those links.
                <ul style={backlinkListStyle}>
                  {folderExternalBacklinks.slice(0, 10).map((bl, i) => (
                    <li key={i}>{bl.source_path} → {bl.target_path} ({bl.rel})</li>
                  ))}
                  {folderExternalBacklinks.length > 10 && (
                    <li>...and {folderExternalBacklinks.length - 10} more</li>
                  )}
                </ul>
              </>
            ) : (
              <>
                This note has <strong>{backlinks.length}</strong> incoming link{backlinks.length !== 1 ? "s" : ""} from other notes. Deleting it will break those links.
                <ul style={backlinkListStyle}>
                  {backlinks.slice(0, 10).map((bl, i) => (
                    <li key={i}>{bl.source} ({bl.rel})</li>
                  ))}
                  {backlinks.length > 10 && (
                    <li>...and {backlinks.length - 10} more</li>
                  )}
                </ul>
              </>
            )}
          </div>
        )}

        {error && (
          <div style={{ ...warningStyle, background: "color-mix(in srgb, var(--danger, #e53935) 12%, transparent)" }}>
            {error}
          </div>
        )}

        <div style={actionsStyle}>
          <button style={btnCancel} onClick={onCancel} disabled={isDeleting}>
            Cancel
          </button>
          <button
            style={btnDanger}
            onClick={handleConfirm}
            disabled={isLoading || isDeleting}
          >
            {isDeleting ? "Deleting..." : hasBacklinks ? "Delete Anyway" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
