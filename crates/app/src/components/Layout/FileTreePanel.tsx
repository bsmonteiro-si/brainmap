import { useState, useMemo, useCallback, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";
import { useGraphStore } from "../../stores/graphStore";
import { useEditorStore } from "../../stores/editorStore";
import { useUIStore } from "../../stores/uiStore";
import { useUndoStore } from "../../stores/undoStore";
import { useTabStore } from "../../stores/tabStore";
import { getAPI } from "../../api/bridge";
import type { NodeDto } from "../../api/types";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { ChevronIcon, FolderTreeIcon, NoteTypeIcon } from "./fileTreeIcons";
import { fuzzyMatch, highlightFuzzyMatch } from "../../utils/fuzzyMatch";
import { log } from "../../utils/logger";

interface TreeNode {
  name: string;
  fullPath: string;
  title: string;
  isFolder: boolean;
  children: TreeNode[];
  note_type?: string;
  noteCount?: number;
  matchIndices?: number[];
}

// ── Tree Building ─────────────────────────────────────────────────────────────

function computeNoteCounts(nodes: TreeNode[]): void {
  for (const node of nodes) {
    if (node.isFolder) {
      computeNoteCounts(node.children);
      node.noteCount = node.children.reduce(
        (sum, c) => sum + (c.isFolder ? (c.noteCount ?? 0) : 1),
        0,
      );
    }
  }
}

export function buildTree(nodes: Map<string, NodeDto>, emptyFolders?: Set<string>, workspaceFiles?: string[]): TreeNode[] {
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
    // Skip virtual folder nodes — the tree already constructs folders from path segments.
    if (nodeData.note_type === "folder") continue;
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

  // Merge workspace files that aren't already in the graph (non-BrainMap files)
  if (workspaceFiles) {
    for (const filePath of workspaceFiles) {
      if (nodes.has(filePath)) continue;
      const parts = filePath.split("/");
      const fileName = parts[parts.length - 1];

      if (parts.length === 1) {
        // Check we haven't already added a root node with this path
        if (!roots.some((r) => r.fullPath === filePath)) {
          roots.push({
            name: fileName,
            fullPath: filePath,
            title: fileName,
            isFolder: false,
            children: [],
          });
        }
      } else {
        for (let i = 0; i < parts.length - 1; i++) {
          getOrCreateFolder(parts, i);
        }
        const parentPath = parts.slice(0, parts.length - 1).join("/");
        const parent = folderMap.get(parentPath);
        if (parent && !parent.children.some((c) => c.fullPath === filePath)) {
          parent.children.push({
            name: fileName,
            fullPath: filePath,
            title: fileName,
            isFolder: false,
            children: [],
          });
        }
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

  const sorted = sortChildren(roots);
  computeNoteCounts(sorted);
  return sorted;
}

// ── Fuzzy Filter ──────────────────────────────────────────────────────────────

export function fuzzyFilterTree(nodes: TreeNode[], query: string): TreeNode[] {
  const q = query.toLowerCase();
  return nodes.flatMap((n) => {
    if (!n.isFolder) {
      const indices = fuzzyMatch(q, n.title);
      return indices !== null ? [{ ...n, matchIndices: indices }] : [];
    }
    const filteredChildren = fuzzyFilterTree(n.children, query);
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
  onDelete,
}: {
  state: ContextMenuState;
  onClose: () => void;
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
    useUIStore.getState().openCreateFolderDialog(prefix);
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
  const isBrainMapNote = state.node !== null && !state.node.isFolder && !!state.node.note_type;

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
      ) : isBrainMapNote ? (
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
      ) : (
        <>
          <div className="context-menu-item" onClick={handleNewNoteHere}>
            {isRootLevelFile ? "New Note at Root" : "New Note in Folder"}
          </div>
        </>
      )}
    </div>,
    document.body
  );
}

// ── Tree Node ────────────────────────────────────────────────────────────────

function IndentGuides({ depth }: { depth: number }) {
  if (depth === 0) return null;
  return (
    <>
      {Array.from({ length: depth }, (_, i) => (
        <span key={i} className="indent-guide" aria-hidden="true" />
      ))}
    </>
  );
}

function FileTreeNode({
  node,
  depth,
  onContextMenu,
  onActionsClick,
  hasBeenExpanded,
  onExpand,
}: {
  node: TreeNode;
  depth: number;
  onContextMenu: (e: React.MouseEvent, node: TreeNode) => void;
  onActionsClick: (rect: DOMRect, node: TreeNode) => void;
  hasBeenExpanded: Set<string>;
  onExpand: (path: string) => void;
}) {
  const selectedNodePath = useGraphStore((s) => s.selectedNodePath);
  const treeExpandedFolders = useUIStore((s) => s.treeExpandedFolders);
  const toggleFolder = useUIStore((s) => s.toggleFolder);
  const actionsRef = useRef<HTMLButtonElement>(null);

  const handleActionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (actionsRef.current) {
      onActionsClick(actionsRef.current.getBoundingClientRect(), node);
    }
  };

  if (node.isFolder) {
    const isExpanded = treeExpandedFolders.has(node.fullPath);
    const shouldRenderChildren = hasBeenExpanded.has(node.fullPath) || isExpanded;

    const handleToggle = () => {
      if (!hasBeenExpanded.has(node.fullPath)) {
        onExpand(node.fullPath);
      }
      toggleFolder(node.fullPath);
    };

    return (
      <div>
        <div
          role="button"
          tabIndex={0}
          className="tree-item tree-folder"
          style={{ paddingLeft: 8 }}
          onClick={handleToggle}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleToggle(); } }}
          onContextMenu={(e) => onContextMenu(e, node)}
        >
          <IndentGuides depth={depth} />
          <ChevronIcon isOpen={isExpanded} />
          <FolderTreeIcon isOpen={isExpanded} />
          <span className="tree-item-label">{node.name}</span>
          {node.noteCount ? <span className="tree-folder-count">{node.noteCount}</span> : null}
          <button
            ref={actionsRef}
            className="tree-item-actions"
            onClick={handleActionsClick}
            tabIndex={-1}
            aria-label="Actions"
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
        <div className={`tree-children-anim${isExpanded ? " tree-children-anim--open" : ""}`}>
          <div className="tree-children-anim-inner">
            {shouldRenderChildren &&
              node.children.map((c) => (
                <FileTreeNode
                  key={c.fullPath}
                  node={c}
                  depth={depth + 1}
                  onContextMenu={onContextMenu}
                  onActionsClick={onActionsClick}
                  hasBeenExpanded={hasBeenExpanded}
                  onExpand={onExpand}
                />
              ))}
          </div>
        </div>
      </div>
    );
  }

  const activePlainFilePath = useEditorStore((s) => s.activePlainFile?.path ?? null);
  const isActive = selectedNodePath === node.fullPath || activePlainFilePath === node.fullPath;
  const isBrainMapNote = !!node.note_type;
  const label = node.matchIndices && node.matchIndices.length > 0
    ? highlightFuzzyMatch(node.title, node.matchIndices)
    : node.title;

  const handleClick = () => {
    if (isBrainMapNote) {
      useGraphStore.getState().selectNode(node.fullPath);
      useEditorStore.getState().openNote(node.fullPath);
    } else {
      useGraphStore.getState().selectNode(null);
      useEditorStore.getState().openPlainFile(node.fullPath);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`tree-item tree-file${isActive ? " active" : ""}${!isBrainMapNote ? " tree-file--plain" : ""}`}
      style={{ paddingLeft: 8 }}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      onContextMenu={(e) => onContextMenu(e, node)}
    >
      <IndentGuides depth={depth} />
      <NoteTypeIcon noteType={node.note_type} />
      <span className="tree-item-label">{label}</span>
      <button
        ref={actionsRef}
        className="tree-item-actions"
        onClick={handleActionsClick}
        tabIndex={-1}
        aria-label="Actions"
      >
        <MoreHorizontal size={14} />
      </button>
    </div>
  );
}

// ── Panel ────────────────────────────────────────────────────────────────────

export function FileTreePanel() {
  const nodes = useGraphStore((s) => s.nodes);
  const [filter, setFilter] = useState("");
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TreeNode | null>(null);
  const [hasBeenExpanded, setHasBeenExpanded] = useState<Set<string>>(() => new Set());

  const emptyFolders = useUIStore((s) => s.emptyFolders);
  const workspaceFiles = useGraphStore((s) => s.workspaceFiles);
  const tree = useMemo(() => buildTree(nodes, emptyFolders, workspaceFiles), [nodes, emptyFolders, workspaceFiles]);

  const filtered = useMemo(
    () => (filter.trim() ? fuzzyFilterTree(tree, filter.trim()) : tree),
    [tree, filter],
  );

  const handleExpand = useCallback((path: string) => {
    setHasBeenExpanded((prev) => {
      if (prev.has(path)) return prev;
      const next = new Set(prev);
      next.add(path);
      return next;
    });
  }, []);

  const handleContextMenu = (e: React.MouseEvent, node: TreeNode) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  };

  const handleActionsClick = (rect: DOMRect, node: TreeNode) => {
    setContextMenu({ x: rect.right, y: rect.top, node });
  };

  const handleContentContextMenu = (e: React.MouseEvent) => {
    // Only fire for clicks directly on the scroll container, not on tree items
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, node: null });
  };

  const handleCloseMenu = useCallback(() => setContextMenu(null), []);

  const handleDeleteConfirm = useCallback(async (force: boolean) => {
    if (!deleteTarget) return;
    const api = await getAPI();
    const activeNotePath = useEditorStore.getState().activeNote?.path;

    // 1. Close tabs for deleted notes/folders (before API call)
    const tabStore = useTabStore.getState();
    if (deleteTarget.isFolder) {
      const prefix = deleteTarget.fullPath + "/";
      const tabsToClose = tabStore.tabs
        .filter((t) => t.path.startsWith(prefix))
        .map((t) => t.id);
      for (const id of tabsToClose) {
        tabStore.closeTab(id);
      }
    } else {
      tabStore.closeTab(deleteTarget.fullPath);
    }
    // If active tab was closed, open the next tab or clear editor
    const { activeTabId } = useTabStore.getState();
    if (!activeTabId) {
      useEditorStore.getState().clear();
      useGraphStore.getState().selectNode(null);
    } else if (activeNotePath && (
      deleteTarget.isFolder
        ? activeNotePath.startsWith(deleteTarget.fullPath + "/")
        : activeNotePath === deleteTarget.fullPath
    )) {
      // Active note was deleted, but another tab is now active
      const nextTab = useTabStore.getState().getTab(activeTabId);
      if (nextTab?.kind === "note") {
        useEditorStore.getState().openNote(activeTabId);
        useGraphStore.getState().selectNode(activeTabId);
      } else if (nextTab) {
        useEditorStore.getState().openPlainFile(activeTabId);
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
        // 3. Snapshot all notes in folder for undo
        const folderNotePaths = [...nodes.entries()]
          .filter(([p]) => p.startsWith(deleteTarget.fullPath + "/"))
          .map(([p]) => p);
        const settled = await Promise.allSettled(folderNotePaths.map((p) => api.readNote(p)));
        const failedCount = settled.filter((r) => r.status === "rejected").length;
        if (failedCount > 0) {
          log.warn("components::FileTreePanel", `${failedCount} note(s) could not be snapshotted for undo`, { folder: deleteTarget.fullPath });
        }
        const undoSnapshots = settled
          .filter((r): r is PromiseFulfilledResult<import("../../api/types").NoteDetail> => r.status === "fulfilled")
          .map((r) => r.value);

        // 4. Delete folder
        const result = await api.deleteFolder(deleteTarget.fullPath, force);
        // 5. Update graph for each deleted path
        for (const path of result.deleted_paths) {
          useGraphStore.getState().applyEvent({ type: "node-deleted", path });
        }
        // 6. Remove tracked empty folders within deleted scope (single state update)
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
        // 7. Push undo action
        useUndoStore.getState().pushAction({ kind: "delete-folder", folderPath: deleteTarget.fullPath, snapshots: undoSnapshots });
      } else {
        // 3. Snapshot note for undo
        const undoSnapshot = await api.readNote(deleteTarget.fullPath);
        // 4. Delete note
        await api.deleteNote(deleteTarget.fullPath, force);
        // 5. Update graph
        useGraphStore.getState().applyEvent({ type: "node-deleted", path: deleteTarget.fullPath });
        // 6. Push undo action
        useUndoStore.getState().pushAction({ kind: "delete-note", path: deleteTarget.fullPath, snapshot: undoSnapshot });
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
  }, [deleteTarget, nodes]);

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
          onClick={() => useUIStore.getState().openCreateFolderDialog()}
        >
          ⊞
        </button>
      </div>

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
          <FileTreeNode
            key={n.fullPath}
            node={n}
            depth={0}
            onContextMenu={handleContextMenu}
            onActionsClick={handleActionsClick}
            hasBeenExpanded={hasBeenExpanded}
            onExpand={handleExpand}
          />
        ))}
      </div>
      {contextMenu && (
        <ContextMenu
          state={contextMenu}
          onClose={handleCloseMenu}
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
