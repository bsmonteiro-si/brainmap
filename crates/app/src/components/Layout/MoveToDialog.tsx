import { useState, useMemo, useRef, useEffect } from "react";
import { useUIStore } from "../../stores/uiStore";
import { useGraphStore } from "../../stores/graphStore";
import { useEditorStore } from "../../stores/editorStore";
import { useTabStore } from "../../stores/tabStore";
import { useUndoStore } from "../../stores/undoStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { getAPI } from "../../api/bridge";
import { pickFolder } from "../../api/pickFolder";
import { log } from "../../utils/logger";

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const panelStyle: React.CSSProperties = {
  background: "var(--bg-primary)",
  border: "1px solid var(--border-color)",
  borderRadius: 8,
  padding: 20,
  width: 400,
  maxHeight: "60vh",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
};

const inputStyle: React.CSSProperties = {
  padding: "6px 10px",
  border: "1px solid var(--border-color)",
  borderRadius: 4,
  background: "var(--bg-secondary)",
  color: "var(--text-primary)",
  fontSize: "var(--ui-font-size)",
  outline: "none",
};

const listStyle: React.CSSProperties = {
  maxHeight: 200,
  overflowY: "auto",
  border: "1px solid var(--border-color)",
  borderRadius: 4,
};

const itemStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: "6px 10px",
  border: "none",
  background: "none",
  color: "var(--text-primary)",
  fontSize: "var(--ui-font-sm)",
  cursor: "pointer",
  fontFamily: "var(--ui-font-family)",
};

export function MoveToDialog() {
  const target = useUIStore((s) => s.moveDialogTarget);
  const close = useUIStore((s) => s.closeMoveDialog);
  const nodes = useGraphStore((s) => s.nodes);

  const workspaceFiles = useGraphStore((s) => s.workspaceFiles);

  const [folder, setFolder] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (target) {
      setFolder("");
      setError("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [target]);

  const folderPaths = useMemo(() => {
    const dirs = new Set<string>();
    // Folders from graph nodes
    for (const [, node] of nodes) {
      if (node.note_type === "folder") dirs.add(node.path);
    }
    // Directories derived from all workspace files (including non-markdown)
    for (const file of workspaceFiles) {
      const lastSlash = file.lastIndexOf("/");
      if (lastSlash > 0) {
        // Add all parent directories
        const parts = file.split("/");
        for (let i = 1; i < parts.length; i++) {
          dirs.add(parts.slice(0, i).join("/"));
        }
      }
    }
    // Also derive directories from graph node paths
    for (const [path] of nodes) {
      const lastSlash = path.lastIndexOf("/");
      if (lastSlash > 0) {
        const parts = path.split("/");
        for (let i = 1; i < parts.length; i++) {
          dirs.add(parts.slice(0, i).join("/"));
        }
      }
    }
    return ["(root)", ...Array.from(dirs).sort()];
  }, [nodes, workspaceFiles]);

  const filtered = useMemo(() => {
    if (!folder.trim()) return folderPaths;
    const q = folder.toLowerCase();
    return folderPaths.filter((p) => p.toLowerCase().includes(q));
  }, [folderPaths, folder]);

  if (!target) return null;

  const currentName = target.path.split("/").pop() ?? target.path;
  const currentDir = target.path.includes("/")
    ? target.path.slice(0, target.path.lastIndexOf("/"))
    : "(root)";

  const handleSubmit = async (destFolder: string) => {
    const dest = destFolder === "(root)" ? "" : destFolder;
    const newPath = dest ? `${dest}/${currentName}` : currentName;

    if (newPath === target.path) { close(); return; }

    try {
      const api = await getAPI();
      if (target.isFolder) {
        await api.moveFolder(target.path, newPath);
      } else {
        const isNote = useGraphStore.getState().nodes.has(target.path);
        if (isNote) {
          const result = await api.moveNote(target.path, newPath);
          useTabStore.getState().renamePath(target.path, result.new_path);
          const activeNote = useEditorStore.getState().activeNote;
          if (activeNote?.path === target.path) {
            useEditorStore.getState().openNote(result.new_path);
          }
        } else {
          const editorState = useEditorStore.getState();
          if (editorState.activePlainFile?.path === target.path && editorState.isDirty) {
            await editorState.saveNote();
          }
          await api.movePlainFile(target.path, newPath);
          useTabStore.getState().renamePath(target.path, newPath);
          if (useEditorStore.getState().activePlainFile?.path === target.path) {
            useEditorStore.getState().openPlainFile(newPath);
          }
          useUndoStore.getState().pushAction({ kind: "move-note", oldPath: target.path, newPath, isPlainFile: true });
        }
      }
      close();
    } catch (e) {
      setError(String(e));
      log.error("files", "failed to move file", { error: String(e) });
    }
  };

  const handleBrowse = async () => {
    const wsRoot = useWorkspaceStore.getState().info?.root;
    if (!wsRoot) return;
    try {
      const absPath = await pickFolder();
      if (!absPath) return;
      const normalizedRoot = wsRoot.replace(/\/$/, "");
      if (!absPath.startsWith(normalizedRoot)) {
        setError("Selected folder is outside the workspace");
        return;
      }
      const relative = absPath.slice(normalizedRoot.length + 1) || "(root)";
      handleSubmit(relative);
    } catch {
      // cancelled
    }
  };

  return (
    <div style={overlayStyle} onClick={close}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: "1.1em", fontWeight: 600 }}>Move "{currentName}"</div>
        <div style={{ fontSize: "var(--ui-font-sm)", color: "var(--text-muted)" }}>Currently in: {currentDir}</div>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            ref={inputRef}
            style={{ ...inputStyle, flex: 1 }}
            placeholder="Search folders..."
            value={folder}
            onChange={(e) => { setFolder(e.target.value); setError(""); }}
            onKeyDown={(e) => {
              if (e.key === "Escape") close();
              if (e.key === "Enter" && filtered.length > 0) {
                e.preventDefault();
                handleSubmit(filtered[0]);
              }
            }}
          />
          <button
            style={{ ...inputStyle, cursor: "pointer", whiteSpace: "nowrap" }}
            onClick={handleBrowse}
            type="button"
          >
            Browse...
          </button>
        </div>
        {error && <div style={{ fontSize: 13, color: "var(--danger)" }}>{error}</div>}
        <div style={listStyle}>
          {filtered.map((p) => (
            <button
              key={p}
              style={{
                ...itemStyle,
                ...(p === currentDir ? { background: "var(--bg-tertiary)", fontWeight: 600 } : {}),
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "var(--accent)"; (e.target as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.background = p === currentDir ? "var(--bg-tertiary)" : "none"; (e.target as HTMLElement).style.color = "var(--text-primary)"; }}
              onClick={() => handleSubmit(p)}
            >
              {p}
            </button>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: "8px 10px", color: "var(--text-muted)", fontStyle: "italic" }}>No matching folders</div>
          )}
        </div>
      </div>
    </div>
  );
}
