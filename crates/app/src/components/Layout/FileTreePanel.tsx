import { useState, useMemo, useCallback, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useGraphStore } from "../../stores/graphStore";
import { useEditorStore } from "../../stores/editorStore";
import { useUIStore } from "../../stores/uiStore";
import { getAPI } from "../../api/bridge";
import type { NodeDto } from "../../api/types";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { log } from "../../utils/logger";

interface TreeNode {
  name: string;
  fullPath: string;
  title: string;
  isFolder: boolean;
  children: TreeNode[];
  note_type?: string;
}

export function buildTree(nodes: Map<string, NodeDto>, emptyFolders?: Set<string>): TreeNode[] {
  const folderMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  function getOrCreateFolder(parts: string[], depth: number): TreeNode {
    const fullPath = parts.slice(0, depth + 1).join("/");
    if (!folderMap.has(fullPath)) {
      const node: TreeNode = {
        name: parts[depth],
        fullPath,
        title: parts[depth],
        isFolder: true,
        children: [],
      };
      folderMap.set(fullPath, node);
      if (depth === 0) {
        roots.push(node);
      } else {
        const parentPath = parts.slice(0, depth).join("/");
        const parent = folderMap.get(parentPath);
        if (parent) parent.children.push(node);
      }
    }
    return folderMap.get(fullPath)!;
  }

  for (const [path, nodeData] of nodes) {
    const parts = path.replace(/\.md$/, "").split("/");

    if (parts.length === 1) {
      roots.push({
        name: parts[0],
        fullPath: path,
        title: nodeData.title,
        isFolder: false,
        children: [],
        note_type: nodeData.note_type,
      });
    } else {
      for (let i = 0; i < parts.length - 1; i++) {
        getOrCreateFolder(parts, i);
      }
      const parentPath = parts.slice(0, parts.length - 1).join("/");
      const parent = folderMap.get(parentPath);
      if (parent) {
        parent.children.push({
          name: parts[parts.length - 1],
          fullPath: path,
          title: nodeData.title,
          isFolder: false,
          children: [],
          note_type: nodeData.note_type,
        });
      }
    }
  }

  // Merge empty folders so they appear in the tree even without notes
  if (emptyFolders) {
    for (const folderPath of emptyFolders) {
      const parts = folderPath.split("/");
      for (let i = 0; i < parts.length; i++) {
        getOrCreateFolder(parts, i);
      }
    }
  }

  function sortChildren(items: TreeNode[]): TreeNode[] {
    return [...items]
      .sort((a, b) => {
        if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .map((n) => ({ ...n, children: sortChildren(n.children) }));
  }

  return sortChildren(roots);
}

function filterTree(nodes: TreeNode[], q: string): TreeNode[] {
  return nodes.flatMap((n) => {
    if (!n.isFolder) {
      return n.title.toLowerCase().includes(q) ? [n] : [];
    }
    const filteredChildren = filterTree(n.children, q);
    return filteredChildren.length > 0 ? [{ ...n, children: filteredChildren }] : [];
  });
}

// ── Context Menu ─────────────────────────────────────────────────────────────

const MENU_WIDTH = 200;

interface ContextMenuState {
  x: number;
  y: number;
  node: TreeNode | null; // null = right-clicked on empty area (root context)
}

function ContextMenu({
  state,
  onClose,
  onNewFolderHere,
  onDelete,
}: {
  state: ContextMenuState;
  onClose: () => void;
  onNewFolderHere: (prefix: string) => void;
  onDelete: (node: TreeNode) => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [clampedPos, setClampedPos] = useState(() => ({
    x: Math.min(state.x, window.innerWidth - MENU_WIDTH - 8),
    y: Math.min(state.y, window.innerHeight - 60 - 8),
  }));

  // Re-clamp after mount using actual rendered height
  useLayoutEffect(() => {
    const menuHeight = menuRef.current?.offsetHeight ?? 60;
    const cx = Math.min(state.x, window.innerWidth - MENU_WIDTH - 8);
    const cy = Math.min(state.y, window.innerHeight - menuHeight - 8);
    setClampedPos((prev) => (prev.x === cx && prev.y === cy ? prev : { x: cx, y: cy }));
  }, [state.x, state.y]);

  const { x, y } = clampedPos;

  // Close on outside click or Escape
  useLayoutEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const handleFocusInGraph = () => {
    if (!state.node) { onClose(); return; }
    onClose();
    useUIStore
      .getState()
      .setGraphFocus(state.node.fullPath, state.node.isFolder ? "folder" : "note");
  };

  const folderPrefixFor = (node: TreeNode): string => {
    if (node.isFolder) return node.fullPath + "/";
    const parts = node.fullPath.split("/");
    // Root-level files have no parent folder — return "" so CreateNoteDialog starts empty
    return parts.length > 1 ? parts.slice(0, -1).join("/") + "/" : "";
  };

  const handleNewNoteHere = () => {
    onClose();
    const prefix = state.node ? folderPrefixFor(state.node) : "";
    useUIStore.getState().openCreateNoteDialog(prefix);
  };

  const handleNewFolderHere = () => {
    onClose();
    const prefix = state.node ? folderPrefixFor(state.node) : "";
    onNewFolderHere(prefix);
  };

  const handleDelete = () => {
    if (!state.node) return;
    onClose();
    onDelete(state.node);
  };

  // Determine label for the file-level "new note" item
  const isRootLevelFile =
    state.node !== null &&
    !state.node.isFolder &&
    state.node.fullPath.split("/").length === 1;

  return createPortal(
    <div ref={menuRef} className="context-menu" style={{ left: x, top: y, minWidth: MENU_WIDTH }}>
      {state.node === null ? (
        <>
          <div className="context-menu-item" onClick={handleNewNoteHere}>
            New Note at Root
          </div>
          <div className="context-menu-item" onClick={handleNewFolderHere}>
            New Folder at Root
          </div>
        </>
      ) : state.node.isFolder ? (
        <>
          <div className="context-menu-item" onClick={handleNewNoteHere}>
            New Note Here
          </div>
          <div className="context-menu-item" onClick={handleNewFolderHere}>
            New Subfolder Here
          </div>
          <div className="context-menu-separator" />
          <div className="context-menu-item" onClick={handleFocusInGraph}>
            Focus in Graph
          </div>
          <div className="context-menu-separator" />
          <div className="context-menu-item context-menu-item--danger" onClick={handleDelete}>
            Delete Folder
          </div>
        </>
      ) : (
        <>
          <div className="context-menu-item" onClick={handleNewNoteHere}>
            {isRootLevelFile ? "New Note at Root" : "New Note in Folder"}
          </div>
          <div className="context-menu-separator" />
          <div className="context-menu-item" onClick={handleFocusInGraph}>
            Focus in Graph
          </div>
          <div className="context-menu-separator" />
          <div className="context-menu-item context-menu-item--danger" onClick={handleDelete}>
            Delete
          </div>
        </>
      )}
    </div>,
    document.body
  );
}

// ── Tree Node ────────────────────────────────────────────────────────────────

function FileTreeNode({
  node,
  depth,
  onContextMenu,
}: {
  node: TreeNode;
  depth: number;
  onContextMenu: (e: React.MouseEvent, node: TreeNode) => void;
}) {
  const selectedNodePath = useGraphStore((s) => s.selectedNodePath);
  const treeExpandedFolders = useUIStore((s) => s.treeExpandedFolders);
  const toggleFolder = useUIStore((s) => s.toggleFolder);

  if (node.isFolder) {
    const isExpanded = treeExpandedFolders.has(node.fullPath);
    return (
      <div>
        <div
          role="button"
          tabIndex={0}
          className="tree-item tree-folder"
          style={{ paddingLeft: `${8 + depth * 12}px` }}
          onClick={() => toggleFolder(node.fullPath)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleFolder(node.fullPath); } }}
          onContextMenu={(e) => onContextMenu(e, node)}
        >
          <span className={`tree-chevron${isExpanded ? " tree-chevron--open" : ""}`} aria-hidden="true" />
          <span className="tree-item-label">{node.name}</span>
        </div>
        {isExpanded &&
          node.children.map((c) => (
            <FileTreeNode key={c.fullPath} node={c} depth={depth + 1} onContextMenu={onContextMenu} />
          ))}
      </div>
    );
  }

  const isActive = selectedNodePath === node.fullPath;
  return (
    <div
      role="button"
      tabIndex={0}
      className={`tree-item tree-file${isActive ? " active" : ""}`}
      style={{ paddingLeft: `${8 + depth * 12}px` }}
      onClick={() => {
        useGraphStore.getState().selectNode(node.fullPath);
        useEditorStore.getState().openNote(node.fullPath);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          useGraphStore.getState().selectNode(node.fullPath);
          useEditorStore.getState().openNote(node.fullPath);
        }
      }}
      onContextMenu={(e) => onContextMenu(e, node)}
    >
      <span className={`tree-type-dot${node.note_type ? ` dot-${node.note_type}` : ""}`} aria-hidden="true" />
      <span className="tree-item-label">{node.title}</span>
    </div>
  );
}

// ── Panel ────────────────────────────────────────────────────────────────────

export function FileTreePanel() {
  const nodes = useGraphStore((s) => s.nodes);
  const [filter, setFilter] = useState("");
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TreeNode | null>(null);

  // folderInputValue: null = inactive; string = active (may have a folder prefix pre-filled)
  const [folderInputValue, setFolderInputValue] = useState<string | null>(null);
  const [folderInputError, setFolderInputError] = useState<string | null>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const emptyFolders = useUIStore((s) => s.emptyFolders);
  const tree = useMemo(() => buildTree(nodes, emptyFolders), [nodes, emptyFolders]);

  const filtered = filter.trim() ? filterTree(tree, filter.toLowerCase()) : tree;

  const handleContextMenu = (e: React.MouseEvent, node: TreeNode) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  };

  const handleContentContextMenu = (e: React.MouseEvent) => {
    // Only fire for clicks directly on the scroll container, not on tree items
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, node: null });
  };

  const handleCloseMenu = useCallback(() => setContextMenu(null), []);

  // Activate the inline folder input (optionally with a pre-filled prefix)
  const activateFolderInput = useCallback((prefix = "") => {
    setFolderInputValue(prefix);
    setFolderInputError(null);
    // Focus after state update
    setTimeout(() => folderInputRef.current?.focus(), 0);
  }, []);

  const cancelFolderInput = useCallback(() => {
    setFolderInputValue(null);
    setFolderInputError(null);
  }, []);

  const commitFolderInput = useCallback(async () => {
    const val = folderInputValue?.trim();
    if (!val) {
      cancelFolderInput();
      return;
    }
    try {
      const api = await getAPI();
      await api.createFolder(val);
      setFolderInputValue(null);
      setFolderInputError(null);
      // Track the empty folder so it appears in the tree
      useUIStore.getState().addEmptyFolder(val);
    } catch (e) {
      setFolderInputError(e instanceof Error ? e.message : String(e));
    }
  }, [folderInputValue, cancelFolderInput]);

  const handleDeleteConfirm = useCallback(async (force: boolean) => {
    if (!deleteTarget) return;
    const api = await getAPI();
    const activeNotePath = useEditorStore.getState().activeNote?.path;

    // 1. Close editor if active note is in delete scope (before API call)
    if (activeNotePath) {
      const inScope = deleteTarget.isFolder
        ? activeNotePath.startsWith(deleteTarget.fullPath + "/")
        : activeNotePath === deleteTarget.fullPath;
      if (inScope) {
        useEditorStore.getState().clear();
        useGraphStore.getState().selectNode(null);
      }
    }

    // 2. Clear graph focus if it targets the deleted item
    const { graphFocusPath } = useUIStore.getState();
    if (graphFocusPath) {
      const focusInScope = deleteTarget.isFolder
        ? graphFocusPath === deleteTarget.fullPath || graphFocusPath.startsWith(deleteTarget.fullPath + "/")
        : graphFocusPath === deleteTarget.fullPath;
      if (focusInScope) {
        useUIStore.getState().clearGraphFocus();
      }
    }

    try {
      if (deleteTarget.isFolder) {
        // 3. Delete folder
        const result = await api.deleteFolder(deleteTarget.fullPath, force);
        // 4. Update graph for each deleted path
        for (const path of result.deleted_paths) {
          useGraphStore.getState().applyEvent({ type: "node-deleted", path });
        }
        // 5. Remove tracked empty folders within deleted scope (single state update)
        const { emptyFolders } = useUIStore.getState();
        const prefix = deleteTarget.fullPath + "/";
        const nextFolders = new Set<string>();
        for (const f of emptyFolders) {
          if (f !== deleteTarget.fullPath && !f.startsWith(prefix)) {
            nextFolders.add(f);
          }
        }
        if (nextFolders.size !== emptyFolders.size) {
          useUIStore.setState({ emptyFolders: nextFolders });
        }
      } else {
        // 3. Delete note
        await api.deleteNote(deleteTarget.fullPath, force);
        // 4. Update graph
        useGraphStore.getState().applyEvent({ type: "node-deleted", path: deleteTarget.fullPath });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // Handle partial folder deletion
      if (msg.startsWith("PARTIAL_DELETE:")) {
        const rest = msg.slice("PARTIAL_DELETE:".length);
        const colonIdx = rest.indexOf(":");
        if (colonIdx >= 0) {
          try {
            const deletedPaths = JSON.parse(rest.slice(0, colonIdx)) as string[];
            for (const path of deletedPaths) {
              useGraphStore.getState().applyEvent({ type: "node-deleted", path });
            }
          } catch {
            // Couldn't parse partial results
          }
        }
        log.error("components::FileTreePanel", "partial folder deletion", { message: msg });
      } else {
        log.error("components::FileTreePanel", "delete failed", { message: msg });
      }
    }

    setDeleteTarget(null);
  }, [deleteTarget]);

  const handleFolderKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitFolderInput();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelFolderInput();
    }
  };

  return (
    <div className="file-tree-panel">
      {/* Toolbar */}
      <div className="file-tree-toolbar">
        <button
          className="file-tree-toolbar-btn"
          title="New Note (⌘N)"
          onClick={() => useUIStore.getState().openCreateNoteDialog()}
        >
          +
        </button>
        <button
          className="file-tree-toolbar-btn"
          title="New Folder"
          onClick={() => activateFolderInput()}
        >
          ⊞
        </button>
      </div>

      {/* Inline folder creation input */}
      {folderInputValue !== null && (
        <div className="file-tree-folder-input-wrap">
          <input
            ref={folderInputRef}
            className="file-tree-search-input"
            placeholder="folder/path…"
            value={folderInputValue}
            onChange={(e) => { setFolderInputValue(e.target.value); setFolderInputError(null); }}
            onKeyDown={handleFolderKeyDown}
          />
          {folderInputError && (
            <span style={{ fontSize: 11, color: "var(--danger)", padding: "2px 8px", display: "block" }}>
              {folderInputError}
            </span>
          )}
        </div>
      )}

      <div className="file-tree-search">
        <span className="file-tree-search-icon" aria-hidden="true">⌕</span>
        <input
          className="file-tree-search-input"
          placeholder="Filter..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <div className="file-tree-content" onContextMenu={handleContentContextMenu}>
        {filtered.map((n) => (
          <FileTreeNode key={n.fullPath} node={n} depth={0} onContextMenu={handleContextMenu} />
        ))}
      </div>
      {contextMenu && (
        <ContextMenu
          state={contextMenu}
          onClose={handleCloseMenu}
          onNewFolderHere={(prefix) => {
            handleCloseMenu();
            activateFolderInput(prefix);
          }}
          onDelete={(node) => setDeleteTarget(node)}
        />
      )}
      {deleteTarget && (
        <ConfirmDeleteDialog
          target={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
