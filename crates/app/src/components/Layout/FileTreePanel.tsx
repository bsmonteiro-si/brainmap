import { useState, useMemo, useCallback, useLayoutEffect, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, Crosshair } from "lucide-react";
import { useGraphStore } from "../../stores/graphStore";
import { useEditorStore } from "../../stores/editorStore";
import { useUIStore } from "../../stores/uiStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { useUndoStore } from "../../stores/undoStore";
import { useTabStore } from "../../stores/tabStore";
import { getAPI } from "../../api/bridge";
import type { NodeDto } from "../../api/types";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { ChevronIcon, FolderTreeIcon, NoteTypeIcon } from "./fileTreeIcons";
import { fuzzyMatch, highlightFuzzyMatch } from "../../utils/fuzzyMatch";
import { log } from "../../utils/logger";
import { computeNewPath, isValidDrop, getParentFolder, isSameFolder, computeReorderedList, initCustomOrderFromTree, computeDropZone } from "../../utils/fileTreeDnd";
import { computeRenamePath, validateRenameNameFormat } from "../../utils/fileTreeRename";

export interface TreeNode {
  name: string;
  fullPath: string;
  title: string;
  isFolder: boolean;
  children: TreeNode[];
  note_type?: string;
  modified?: string | null;
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

export function buildTree(nodes: Map<string, NodeDto>, emptyFolders?: Set<string>, workspaceFiles?: string[], sortOrder?: string, customOrder?: Record<string, string[]>): TreeNode[] {
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
        modified: nodeData.modified,
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
          modified: nodeData.modified,
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

  function sortChildren(items: TreeNode[], sortOrder: string, parentPath: string): TreeNode[] {
    let sorted: TreeNode[];

    if (sortOrder === "custom" && customOrder && customOrder[parentPath]) {
      const order = customOrder[parentPath];
      const indexMap = new Map<string, number>();
      for (let i = 0; i < order.length; i++) indexMap.set(order[i], i);

      sorted = [...items].sort((a, b) => {
        // Folders always first
        if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
        const ai = indexMap.get(a.fullPath);
        const bi = indexMap.get(b.fullPath);
        if (ai !== undefined && bi !== undefined) return ai - bi;
        if (ai !== undefined) return -1;
        if (bi !== undefined) return 1;
        return a.name.localeCompare(b.name);
      });
    } else {
      sorted = [...items].sort((a, b) => {
        // Folders always first
        if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
        switch (sortOrder) {
          case "custom": // custom with no order for this folder — fall back to name-asc
          case "name-asc":
            return a.name.localeCompare(b.name);
          case "name-desc":
            return b.name.localeCompare(a.name);
          case "modified-desc":
            return (b.modified ?? "").localeCompare(a.modified ?? "");
          case "modified-asc":
            return (a.modified ?? "").localeCompare(b.modified ?? "");
          default:
            return a.name.localeCompare(b.name);
        }
      });
    }

    return sorted.map((n) => ({
      ...n,
      children: sortChildren(n.children, sortOrder, n.fullPath),
    }));
  }

  const sorted = sortChildren(roots, sortOrder ?? "name-asc", "");
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
  onRename,
}: {
  state: ContextMenuState;
  onClose: () => void;
  onDelete: (node: TreeNode) => void;
  onRename: (node: TreeNode) => void;
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

  const handleNewDrawingHere = () => {
    onClose();
    const prefix = state.node ? folderPrefixFor(state.node) : "";
    // Generate default name for the placeholder
    const workspaceFiles = useGraphStore.getState().workspaceFiles;
    let name = "Untitled";
    let counter = 2;
    while (workspaceFiles.includes(prefix + name + ".excalidraw")) {
      name = `Untitled-${counter}`;
      counter++;
    }
    useUIStore.getState().openCreateNoteDialog(prefix + name);
    useUIStore.setState({ createFileKind: "excalidraw" });
  };

  const handleNewCanvasHere = () => {
    onClose();
    const prefix = state.node ? folderPrefixFor(state.node) : "";
    const workspaceFiles = useGraphStore.getState().workspaceFiles;
    let name = "Untitled";
    let counter = 2;
    while (workspaceFiles.includes(prefix + name + ".canvas")) {
      name = `Untitled-${counter}`;
      counter++;
    }
    useUIStore.getState().openCreateNoteDialog(prefix + name);
    useUIStore.setState({ createFileKind: "canvas" });
  };

  const handleDelete = () => {
    if (!state.node) return;
    onClose();
    onDelete(state.node);
  };

  const handleRename = () => {
    if (!state.node) return;
    onClose();
    onRename(state.node);
  };

  const handleShowInFinder = async () => {
    if (!state.node) return;
    onClose();
    const wsRoot = useWorkspaceStore.getState().info?.root;
    if (!wsRoot) return;
    const absolutePath = `${wsRoot.replace(/\/$/, "")}/${state.node.fullPath}`;
    try {
      const api = await getAPI();
      await api.revealInFileManager(absolutePath);
    } catch (e) {
      log.error("files", "failed to reveal in file manager", { error: String(e) });
    }
  };

  const handleCopyRelativePath = () => {
    if (!state.node) return;
    onClose();
    navigator.clipboard.writeText(`"${state.node.fullPath}"`).catch(() => {});
  };

  const handleCopyAbsolutePath = () => {
    if (!state.node) return;
    onClose();
    const wsRoot = useWorkspaceStore.getState().info?.root;
    if (!wsRoot) return;
    navigator.clipboard.writeText(`"${wsRoot.replace(/\/$/, "")}/${state.node.fullPath}"`).catch(() => {});
  };

  const handleDuplicate = async () => {
    if (!state.node || state.node.isFolder) return;
    onClose();
    try {
      const api = await getAPI();
      const newNote = await api.duplicateNote(state.node.fullPath);
      useEditorStore.getState().openNote(newNote.path);
    } catch (e) {
      log.error("files", "failed to duplicate note", { error: String(e) });
    }
  };

  const handleOpenInDefaultApp = async () => {
    if (!state.node) return;
    onClose();
    const wsRoot = useWorkspaceStore.getState().info?.root;
    if (!wsRoot) return;
    const absolutePath = `${wsRoot.replace(/\/$/, "")}/${state.node.fullPath}`;
    try {
      const api = await getAPI();
      await api.openInDefaultApp(absolutePath);
    } catch (e) {
      log.error("files", "failed to open in default app", { error: String(e) });
    }
  };

  const handleConvertToNote = async () => {
    if (!state.node) return;
    onClose();
    try {
      const api = await getAPI();
      const path = state.node.fullPath;
      await api.convertToNote(path);
      // Close plain-file tab if open, reopen as a note
      useTabStore.getState().closeTab(path);
      await useEditorStore.getState().openNote(path);
      useGraphStore.getState().selectNode(path);
    } catch (e) {
      log.error("files", "failed to convert to note", { error: String(e) });
    }
  };

  const handleMoveTo = () => {
    if (!state.node) return;
    onClose();
    useUIStore.getState().openMoveDialog({ path: state.node.fullPath, isFolder: state.node.isFolder });
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
          <div className="context-menu-item" onClick={handleNewDrawingHere}>
            New Drawing at Root
          </div>
          <div className="context-menu-item" onClick={handleNewCanvasHere}>
            New Canvas at Root
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
          <div className="context-menu-item" onClick={handleNewDrawingHere}>
            New Drawing Here
          </div>
          <div className="context-menu-item" onClick={handleNewCanvasHere}>
            New Canvas Here
          </div>
          <div className="context-menu-item" onClick={handleNewFolderHere}>
            New Subfolder Here
          </div>
          <div className="context-menu-separator" />
          <div className="context-menu-item" onClick={handleFocusInGraph}>
            Focus in Graph
          </div>
          <div className="context-menu-item" onClick={handleRename}>
            Rename
          </div>
          <div className="context-menu-item" onClick={handleMoveTo}>
            Move to...
          </div>
          <div className="context-menu-separator" />
          <div className="context-menu-item" onClick={handleShowInFinder}>
            Show in Finder
          </div>
          <div className="context-menu-item" onClick={handleCopyRelativePath}>
            Copy Relative Path
          </div>
          <div className="context-menu-item" onClick={handleCopyAbsolutePath}>
            Copy Absolute Path
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
          <div
            className="context-menu-item"
            onClick={() => {
              const ui = useUIStore.getState();
              if (ui.homeNotePath === state.node!.fullPath) {
                ui.clearHomeNote();
              } else {
                ui.setHomeNote(state.node!.fullPath);
              }
              onClose();
            }}
          >
            {useUIStore.getState().homeNotePath === state.node!.fullPath ? "Unset Home Note" : "Set as Home Note"}
          </div>
          <div className="context-menu-item" onClick={handleRename}>
            Rename
          </div>
          <div className="context-menu-item" onClick={handleDuplicate}>
            Duplicate
          </div>
          <div className="context-menu-item" onClick={handleMoveTo}>
            Move to...
          </div>
          <div className="context-menu-separator" />
          <div className="context-menu-item" onClick={handleShowInFinder}>
            Show in Finder
          </div>
          <div className="context-menu-item" onClick={handleOpenInDefaultApp}>
            Open in Default App
          </div>
          <div className="context-menu-item" onClick={handleCopyRelativePath}>
            Copy Relative Path
          </div>
          <div className="context-menu-item" onClick={handleCopyAbsolutePath}>
            Copy Absolute Path
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
          {state.node!.fullPath.endsWith('.md') && (
            <div className="context-menu-item" onClick={handleConvertToNote}>
              Convert to Note
            </div>
          )}
          <div className="context-menu-item" onClick={handleRename}>
            Rename
          </div>
          <div className="context-menu-separator" />
          <div className="context-menu-item" onClick={handleMoveTo}>
            Move to...
          </div>
          <div className="context-menu-separator" />
          <div className="context-menu-item" onClick={handleShowInFinder}>
            Show in Finder
          </div>
          <div className="context-menu-item" onClick={handleOpenInDefaultApp}>
            Open in Default App
          </div>
          <div className="context-menu-item" onClick={handleCopyRelativePath}>
            Copy Relative Path
          </div>
          <div className="context-menu-item" onClick={handleCopyAbsolutePath}>
            Copy Absolute Path
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

function InlineRenameInput({
  initialName,
  onConfirm,
  onCancel,
}: {
  initialName: string;
  onConfirm: (newName: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);
  const resolvedRef = useRef(false);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      e.preventDefault();
      if (!resolvedRef.current) {
        resolvedRef.current = true;
        onConfirm(value);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (!resolvedRef.current) {
        resolvedRef.current = true;
        onCancel();
      }
    }
  };

  const handleBlur = () => {
    if (!resolvedRef.current) {
      resolvedRef.current = true;
      onConfirm(value);
    }
  };

  return (
    <input
      ref={inputRef}
      className="tree-item-rename-input"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onClick={(e) => e.stopPropagation()}
    />
  );
}

function FileTreeNode({
  node,
  depth,
  onContextMenu,
  onActionsClick,
  hasBeenExpanded,
  onExpand,
  draggedPath,
  dragOverPath,
  onDragStart,
  onDragEnd,
  onFolderDragEnter,
  onFolderDragLeave,
  onItemDragOver,
  onItemDrop,
  reorderIndicator,
  renamingPath,
  onRenameConfirm,
  onRenameCancel,
}: {
  node: TreeNode;
  depth: number;
  onContextMenu: (e: React.MouseEvent, node: TreeNode) => void;
  onActionsClick: (rect: DOMRect, node: TreeNode) => void;
  hasBeenExpanded: Set<string>;
  onExpand: (path: string) => void;
  draggedPath: string | null;
  dragOverPath: string | null;
  onDragStart: (e: React.DragEvent, node: TreeNode) => void;
  onDragEnd: () => void;
  onFolderDragEnter: (e: React.DragEvent, folderPath: string) => void;
  onFolderDragLeave: (e: React.DragEvent) => void;
  onItemDragOver: (e: React.DragEvent, node: TreeNode) => void;
  onItemDrop: (e: React.DragEvent, node: TreeNode) => void;
  reorderIndicator: { parentFolder: string; targetPath: string; position: "before" | "after" } | null;
  renamingPath: string | null;
  onRenameConfirm: (oldPath: string, newName: string, isFolder: boolean) => void;
  onRenameCancel: () => void;
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

    const isDragging = draggedPath === node.fullPath;
    const isDragOver = dragOverPath === node.fullPath;
    const isRenaming = renamingPath === node.fullPath;
    const isReorderAbove = reorderIndicator?.targetPath === node.fullPath && reorderIndicator.position === "before";
    const isReorderBelow = reorderIndicator?.targetPath === node.fullPath && reorderIndicator.position === "after";

    return (
      <div>
        <div
          role="button"
          tabIndex={0}
          className={`tree-item tree-folder${isDragging ? " dragging" : ""}${isDragOver ? " drag-over" : ""}${isReorderAbove ? " reorder-above" : ""}${isReorderBelow ? " reorder-below" : ""}`}
          style={{ paddingLeft: 8 }}
          data-tree-path={node.fullPath}
          draggable={!isRenaming}
          onClick={isRenaming ? undefined : handleToggle}
          onKeyDown={isRenaming ? undefined : (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleToggle(); } }}
          onContextMenu={isRenaming ? undefined : (e) => onContextMenu(e, node)}
          onDragStart={isRenaming ? undefined : (e) => onDragStart(e, node)}
          onDragEnd={isRenaming ? undefined : onDragEnd}
          onDragOver={isRenaming ? undefined : (e) => onItemDragOver(e, node)}
          onDragEnter={isRenaming ? undefined : (e) => onFolderDragEnter(e, node.fullPath)}
          onDragLeave={isRenaming ? undefined : onFolderDragLeave}
          onDrop={isRenaming ? undefined : (e) => onItemDrop(e, node)}
        >
          <IndentGuides depth={depth} />
          <ChevronIcon isOpen={isExpanded} />
          <FolderTreeIcon isOpen={isExpanded} />
          {isRenaming ? (
            <InlineRenameInput
              initialName={node.name}
              onConfirm={(newName) => onRenameConfirm(node.fullPath, newName, true)}
              onCancel={onRenameCancel}
            />
          ) : (
            <span className="tree-item-label">{node.name}</span>
          )}
          {!isRenaming && node.noteCount ? <span className="tree-folder-count">{node.noteCount}</span> : null}
          {!isRenaming && (
            <button
              ref={actionsRef}
              className="tree-item-actions"
              onClick={handleActionsClick}
              tabIndex={-1}
              aria-label="Actions"
            >
              <MoreHorizontal size={14} />
            </button>
          )}
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
                  draggedPath={draggedPath}
                  dragOverPath={dragOverPath}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onFolderDragEnter={onFolderDragEnter}
                  onFolderDragLeave={onFolderDragLeave}
                  onItemDragOver={onItemDragOver}
                  onItemDrop={onItemDrop}
                  reorderIndicator={reorderIndicator}
                  renamingPath={renamingPath}
                  onRenameConfirm={onRenameConfirm}
                  onRenameCancel={onRenameCancel}
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
    if (node.fullPath.toLowerCase().endsWith(".pdf")) {
      const fileName = node.fullPath.split("/").pop() ?? node.fullPath;
      useTabStore.getState().openTab(node.fullPath, "pdf", fileName, null);
      useEditorStore.getState().clearForCustomTab();
      return;
    }
    if (node.fullPath.toLowerCase().endsWith(".excalidraw")) {
      const fileName = node.fullPath.split("/").pop() ?? node.fullPath;
      useTabStore.getState().openTab(node.fullPath, "excalidraw", fileName, null);
      useEditorStore.getState().clearForCustomTab();
      return;
    }
    if (node.fullPath.toLowerCase().endsWith(".canvas")) {
      useUIStore.getState().openCanvasInPanel(node.fullPath);
      return;
    }
    if (isBrainMapNote) {
      useGraphStore.getState().selectNode(node.fullPath);
      useEditorStore.getState().openNote(node.fullPath);
    } else {
      useGraphStore.getState().selectNode(null);
      useEditorStore.getState().openPlainFile(node.fullPath);
    }
  };

  const isDragging = draggedPath === node.fullPath;
  const isRenaming = renamingPath === node.fullPath;
  const isReorderAbove = reorderIndicator?.targetPath === node.fullPath && reorderIndicator.position === "before";
  const isReorderBelow = reorderIndicator?.targetPath === node.fullPath && reorderIndicator.position === "after";

  return (
    <div
      role="button"
      tabIndex={0}
      className={`tree-item tree-file${isActive ? " active" : ""}${!isBrainMapNote ? " tree-file--plain" : ""}${isDragging ? " dragging" : ""}${isReorderAbove ? " reorder-above" : ""}${isReorderBelow ? " reorder-below" : ""}`}
      style={{ paddingLeft: 8 }}
      data-tree-path={node.fullPath}
      draggable={!isRenaming}
      onClick={isRenaming ? undefined : handleClick}
      onKeyDown={isRenaming ? undefined : (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      onContextMenu={isRenaming ? undefined : (e) => onContextMenu(e, node)}
      onDragStart={isRenaming ? undefined : (e) => onDragStart(e, node)}
      onDragEnd={isRenaming ? undefined : onDragEnd}
      onDragOver={isRenaming ? undefined : (e) => onItemDragOver(e, node)}
      onDrop={isRenaming ? undefined : (e) => onItemDrop(e, node)}
    >
      <IndentGuides depth={depth} />
      <NoteTypeIcon noteType={node.note_type} fileName={node.name} />
      {isRenaming ? (
        <InlineRenameInput
          initialName={node.name}
          onConfirm={(newName) => onRenameConfirm(node.fullPath, newName, false)}
          onCancel={onRenameCancel}
        />
      ) : (
        <span className="tree-item-label">{label}</span>
      )}
      {!isRenaming && (
        <button
          ref={actionsRef}
          className="tree-item-actions"
          onClick={handleActionsClick}
          tabIndex={-1}
          aria-label="Actions"
        >
          <MoreHorizontal size={14} />
        </button>
      )}
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

  // ── Rename state ──
  const [renamingPath, setRenamingPath] = useState<string | null>(null);

  // ── Drag-and-drop state ──
  const [draggedPath, setDraggedPath] = useState<string | null>(null);
  const [draggedIsFolder, setDraggedIsFolder] = useState(false);
  const [dragOverPath, setDragOverPath] = useState<string | null>(null);
  const [rootDragOver, setRootDragOver] = useState(false);
  const rootDragEnterCounterRef = useRef(0);
  const autoExpandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup auto-expand timer on unmount
  useEffect(() => {
    return () => {
      if (autoExpandTimerRef.current) clearTimeout(autoExpandTimerRef.current);
    };
  }, []);

  const emptyFolders = useUIStore((s) => s.emptyFolders);
  const fileSortOrder = useUIStore((s) => s.fileSortOrder);
  const customFileOrder = useUIStore((s) => s.customFileOrder);
  const autoRevealFile = useUIStore((s) => s.autoRevealFile);
  const activeNotePath = useEditorStore((s) => s.activeNote?.path);
  const activePlainFilePath = useEditorStore((s) => s.activePlainFile?.path);
  const activeFilePath = activeNotePath ?? activePlainFilePath;
  const workspaceFiles = useGraphStore((s) => s.workspaceFiles);

  // ── Reorder state ──
  const [reorderIndicator, setReorderIndicator] = useState<{
    parentFolder: string;
    targetPath: string;
    position: "before" | "after";
  } | null>(null);
  const reorderIndicatorRef = useRef(reorderIndicator);

  // Auto-reveal active file in tree
  useEffect(() => {
    if (!autoRevealFile || !activeFilePath) return;
    useUIStore.getState().expandPathToFile(activeFilePath);
    // Scroll into view after a frame to allow tree to re-render
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-tree-path="${CSS.escape(activeFilePath)}"]`);
      el?.scrollIntoView({ block: "nearest" });
    });
  }, [activeFilePath, autoRevealFile]);
  const tree = useMemo(() => buildTree(nodes, emptyFolders, workspaceFiles, fileSortOrder, customFileOrder), [nodes, emptyFolders, workspaceFiles, fileSortOrder, customFileOrder]);

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

  // ── DnD handlers ──

  const handleDragStart = useCallback((e: React.DragEvent, node: TreeNode) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/brainmap-path", node.fullPath);
    e.dataTransfer.setData("application/brainmap-is-folder", node.isFolder ? "1" : "0");
    setDraggedPath(node.fullPath);
    setDraggedIsFolder(node.isFolder);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedPath(null);
    setDraggedIsFolder(false);
    setDragOverPath(null);
    setRootDragOver(false);
    setReorderIndicator(null);
    reorderIndicatorRef.current = null;
    rootDragEnterCounterRef.current = 0;
    if (autoExpandTimerRef.current) {
      clearTimeout(autoExpandTimerRef.current);
      autoExpandTimerRef.current = null;
    }
  }, []);


  const handleFolderDragEnter = useCallback((e: React.DragEvent, folderPath: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedPath || !isValidDrop(draggedPath, draggedIsFolder, folderPath)) return;
    setDragOverPath(folderPath);

    // Auto-expand collapsed folders after 600ms hover
    if (autoExpandTimerRef.current) clearTimeout(autoExpandTimerRef.current);
    const expandedFolders = useUIStore.getState().treeExpandedFolders;
    if (!expandedFolders.has(folderPath)) {
      autoExpandTimerRef.current = setTimeout(() => {
        useUIStore.getState().toggleFolder(folderPath);
        setHasBeenExpanded((prev) => {
          if (prev.has(folderPath)) return prev;
          const next = new Set(prev);
          next.add(folderPath);
          return next;
        });
      }, 600);
    }
  }, [draggedPath, draggedIsFolder]);

  const handleFolderDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear if leaving the folder's own element (not entering a child)
    const related = e.relatedTarget as Node | null;
    if (related && (e.currentTarget as Node).contains(related)) return;
    setDragOverPath(null);
    if (autoExpandTimerRef.current) {
      clearTimeout(autoExpandTimerRef.current);
      autoExpandTimerRef.current = null;
    }
  }, []);

  // Unified drag-over handler for reorder detection (both file & folder rows)
  const handleItemDragOver = useCallback((e: React.DragEvent, node: TreeNode) => {
    if (!draggedPath || draggedPath === node.fullPath) return;

    // Disable reorder when filter is active
    if (filter.trim()) return;

    const areSiblings = isSameFolder(draggedPath, node.fullPath);

    if (areSiblings) {
      const rect = e.currentTarget.getBoundingClientRect();
      const zone = computeDropZone(rect, e.clientY, node.isFolder);

      if (zone === "into") {
        // Fall through to folder drop-into behavior
        if (node.isFolder && isValidDrop(draggedPath, draggedIsFolder, node.fullPath)) {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          setDragOverPath(node.fullPath);
          // Clear reorder indicator
          if (reorderIndicatorRef.current !== null) {
            reorderIndicatorRef.current = null;
            setReorderIndicator(null);
          }
        }
        return;
      }

      // Reorder within same folder
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const parentFolder = getParentFolder(node.fullPath);
      const next = { parentFolder, targetPath: node.fullPath, position: zone };
      const prev = reorderIndicatorRef.current;
      if (!prev || prev.targetPath !== next.targetPath || prev.position !== next.position) {
        reorderIndicatorRef.current = next;
        setReorderIndicator(next);
      }
      // Clear folder drag-over highlight when doing reorder
      if (dragOverPath) setDragOverPath(null);
      return;
    }

    // Not siblings — for folders, delegate to existing folder-drop behavior
    if (node.isFolder && isValidDrop(draggedPath, draggedIsFolder, node.fullPath)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    }
  }, [draggedPath, draggedIsFolder, filter, dragOverPath]);

  /**
   * Shared move/rename orchestration: saves dirty state, calls API,
   * reloads graph, updates tabs/editor/graph focus/home note, pushes undo.
   * Returns true on success, false on failure or abort.
   */
  const executeMoveOrRename = useCallback(async (oldPath: string, newPath: string, isFolder: boolean): Promise<boolean> => {
    const api = await getAPI();
    const editorState = useEditorStore.getState();

    try {
      if (isFolder) {
        const prefix = oldPath + "/";

        // Save the active note if it's inside the folder and dirty
        if (editorState.activeNote?.path.startsWith(prefix) && editorState.isDirty) {
          await editorState.saveNote();
        }

        // Check for other dirty tabs inside the folder (non-active)
        const otherDirtyTabs = useTabStore.getState().tabs.filter(
          (t) => t.path.startsWith(prefix) && t.isDirty && t.path !== editorState.activeNote?.path
        );
        if (otherDirtyTabs.length > 0) {
          useUndoStore.setState((prev) => ({
            toastMessage: `Cannot move: ${otherDirtyTabs.length} unsaved file(s) in folder. Save them first.`,
            toastKey: prev.toastKey + 1,
          }));
          return false;
        }

        await api.moveFolder(oldPath, newPath);
        await useGraphStore.getState().loadTopology();

        // Update tabs
        useTabStore.getState().renamePathPrefix(oldPath, newPath);

        // Update editor if active note was inside the folder
        const activeNote = useEditorStore.getState().activeNote;
        if (activeNote && activeNote.path.startsWith(prefix)) {
          const newActivePath = newPath + "/" + activeNote.path.slice(prefix.length);
          useEditorStore.getState().openNote(newActivePath);
        }

        // Update UI state
        const ui = useUIStore.getState();
        if (ui.graphFocusPath?.startsWith(prefix) || ui.graphFocusPath === oldPath) {
          ui.clearGraphFocus();
        }
        if (ui.homeNotePath?.startsWith(prefix)) {
          ui.setHomeNote(newPath + "/" + ui.homeNotePath.slice(prefix.length));
        }

        useUndoStore.getState().pushAction({ kind: "move-folder", oldFolder: oldPath, newFolder: newPath });
      } else {
        const isNote = useGraphStore.getState().nodes.has(oldPath);

        // Save dirty file before moving
        if (isNote) {
          if (editorState.activeNote?.path === oldPath && editorState.isDirty) {
            await editorState.saveNote();
          }
        } else {
          if (editorState.activePlainFile?.path === oldPath && editorState.isDirty) {
            await editorState.saveNote();
          }
        }

        if (isNote) {
          await api.moveNote(oldPath, newPath);
        } else {
          await api.movePlainFile(oldPath, newPath);
        }
        await useGraphStore.getState().loadTopology();

        // Update tab
        useTabStore.getState().renamePath(oldPath, newPath);

        // Update editor if active file was moved
        if (isNote) {
          if (useEditorStore.getState().activeNote?.path === oldPath) {
            useEditorStore.getState().openNote(newPath);
            useGraphStore.getState().selectNode(newPath);
          }
        } else if (useEditorStore.getState().activePlainFile?.path === oldPath) {
          useEditorStore.getState().openPlainFile(newPath);
        }

        // Update UI state
        const ui = useUIStore.getState();
        if (ui.graphFocusPath === oldPath) {
          ui.setGraphFocus(newPath, "note");
        }
        if (ui.homeNotePath === oldPath) {
          ui.setHomeNote(newPath);
        }

        useUndoStore.getState().pushAction({ kind: "move-note", oldPath, newPath, isPlainFile: !isNote });
      }
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      log.error("components::FileTreePanel", "move failed", { message: msg });
      useUndoStore.setState((prev) => ({
        toastMessage: `Move failed: ${msg}`,
        toastKey: prev.toastKey + 1,
      }));
      return false;
    }
  }, []);

  const executeMoveItem = useCallback(async (oldPath: string, targetFolder: string, isFolder: boolean) => {
    const newPath = computeNewPath(oldPath, targetFolder, isFolder);
    if (newPath === oldPath) return;

    let success: boolean;
    if (isFolder) {
      const folderName = oldPath.split("/").pop()!;
      const newFolder = targetFolder === "" ? folderName : `${targetFolder}/${folderName}`;
      success = await executeMoveOrRename(oldPath, newFolder, true);
    } else {
      success = await executeMoveOrRename(oldPath, newPath, false);
    }

    // Update custom file order: remove from source, append to target
    if (success) {
      const ui = useUIStore.getState();
      const sourceFolder = getParentFolder(oldPath);
      const sourceOrder = ui.customFileOrder[sourceFolder];
      if (sourceOrder) {
        ui.setCustomFileOrder(sourceFolder, sourceOrder.filter((p) => p !== oldPath));
      }
      const targetOrder = ui.customFileOrder[targetFolder];
      if (targetOrder) {
        ui.setCustomFileOrder(targetFolder, [...targetOrder, newPath]);
      }

      // For folder moves, migrate the folder's own key and descendant keys
      if (isFolder) {
        const actualNewPath = computeNewPath(oldPath, targetFolder, true);
        const oldPrefix = oldPath + "/";
        const newPrefix = actualNewPath + "/";
        const updates: Record<string, string[]> = {};
        const deletes: string[] = [];
        for (const [key, arr] of Object.entries(ui.customFileOrder)) {
          if (key === oldPath) {
            updates[actualNewPath] = arr.map((p) => p.startsWith(oldPrefix) ? newPrefix + p.slice(oldPrefix.length) : p);
            deletes.push(key);
          } else if (key.startsWith(oldPrefix)) {
            const newKey = newPrefix + key.slice(oldPrefix.length);
            updates[newKey] = arr.map((p) => p.startsWith(oldPrefix) ? newPrefix + p.slice(oldPrefix.length) : p);
            deletes.push(key);
          }
        }
        if (deletes.length > 0) {
          const next = { ...ui.customFileOrder };
          for (const k of deletes) delete next[k];
          Object.assign(next, updates);
          useUIStore.setState({ customFileOrder: next });
        }
      }
    }
  }, [executeMoveOrRename]);

  // Unified drop handler for reorder (must be after executeMoveItem)
  const handleItemDrop = useCallback((e: React.DragEvent, node: TreeNode) => {
    e.preventDefault();
    const indicator = reorderIndicatorRef.current;
    const dragged = draggedPath;

    if (indicator && indicator.targetPath === node.fullPath && dragged) {
      // This is a reorder drop
      handleDragEnd();

      const parentFolder = indicator.parentFolder;

      // Get current order from the tree (find the right children array)
      const findChildren = (items: TreeNode[], targetParent: string): TreeNode[] | null => {
        if (targetParent === "") return items;
        for (const n of items) {
          if (n.isFolder && n.fullPath === targetParent) return n.children;
          if (n.isFolder && n.children.length > 0) {
            const found = findChildren(n.children, targetParent);
            if (found) return found;
          }
        }
        return null;
      };

      const siblings = findChildren(tree, parentFolder);
      if (!siblings) return;

      const currentOrder = customFileOrder[parentFolder]
        ?? initCustomOrderFromTree(siblings);

      const newOrder = computeReorderedList(
        currentOrder,
        dragged,
        node.fullPath,
        indicator.position,
      );

      useUIStore.getState().setCustomFileOrder(parentFolder, newOrder);
      if (fileSortOrder !== "custom") {
        useUIStore.getState().setFileSortOrder("custom");
      }
      return;
    }

    // Not a reorder — delegate to folder drop
    const path = e.dataTransfer.getData("application/brainmap-path");
    const isFolderStr = e.dataTransfer.getData("application/brainmap-is-folder");
    const isFolder = isFolderStr === "1";

    handleDragEnd();

    if (node.isFolder && path && isValidDrop(path, isFolder, node.fullPath)) {
      executeMoveItem(path, node.fullPath, isFolder);
    }
  }, [handleDragEnd, tree, customFileOrder, draggedPath, fileSortOrder, executeMoveItem]);

  const executeRenameItem = useCallback(async (oldPath: string, newName: string, isFolder: boolean) => {
    const trimmed = newName.trim();

    // Validate name format only (empty, separators, dot-prefix).
    // Duplicate detection is left to the backend which checks the actual filesystem.
    const formatError = validateRenameNameFormat(trimmed);
    if (formatError) {
      useUndoStore.setState((prev) => ({
        toastMessage: `Rename failed: ${formatError}`,
        toastKey: prev.toastKey + 1,
      }));
      setRenamingPath(null);
      return;
    }

    const newPath = computeRenamePath(oldPath, trimmed, isFolder);
    if (newPath === oldPath) {
      // No change — cancel silently
      setRenamingPath(null);
      return;
    }

    const success = await executeMoveOrRename(oldPath, newPath, isFolder);

    if (success && isFolder) {
      const prefix = oldPath + "/";

      // Update treeExpandedFolders: replace oldPath and any descendants
      const expandedFolders = useUIStore.getState().treeExpandedFolders;
      const nextExpanded = new Set<string>();
      let changed = false;
      for (const f of expandedFolders) {
        if (f === oldPath) {
          nextExpanded.add(newPath);
          changed = true;
        } else if (f.startsWith(prefix)) {
          nextExpanded.add(newPath + "/" + f.slice(prefix.length));
          changed = true;
        } else {
          nextExpanded.add(f);
        }
      }
      if (changed) useUIStore.setState({ treeExpandedFolders: nextExpanded });

      // Update hasBeenExpanded: same prefix-based replacement
      setHasBeenExpanded((prev) => {
        const next = new Set<string>();
        let hbeChanged = false;
        for (const f of prev) {
          if (f === oldPath) {
            next.add(newPath);
            hbeChanged = true;
          } else if (f.startsWith(prefix)) {
            next.add(newPath + "/" + f.slice(prefix.length));
            hbeChanged = true;
          } else {
            next.add(f);
          }
        }
        return hbeChanged ? next : prev;
      });

      // Update emptyFolders: same prefix-based replacement
      const ef = useUIStore.getState().emptyFolders;
      const nextEf = new Set<string>();
      let efChanged = false;
      for (const f of ef) {
        if (f === oldPath) {
          nextEf.add(newPath);
          efChanged = true;
        } else if (f.startsWith(prefix)) {
          nextEf.add(newPath + "/" + f.slice(prefix.length));
          efChanged = true;
        } else {
          nextEf.add(f);
        }
      }
      if (efChanged) useUIStore.setState({ emptyFolders: nextEf });
    }

    // Update custom file order: replace old path with new path
    if (success) {
      const parentFolder = getParentFolder(oldPath);
      const ui = useUIStore.getState();
      const order = ui.customFileOrder[parentFolder];
      if (order) {
        const updated = order.map((p) => p === oldPath ? newPath : p);
        ui.setCustomFileOrder(parentFolder, updated);
      }

      // For folder renames, also migrate the folder's own key and descendant keys
      if (isFolder) {
        const oldPrefix = oldPath + "/";
        const newPrefix = newPath + "/";
        const updates: Record<string, string[]> = {};
        const deletes: string[] = [];
        for (const [key, arr] of Object.entries(ui.customFileOrder)) {
          if (key === oldPath) {
            updates[newPath] = arr.map((p) => p.startsWith(oldPrefix) ? newPrefix + p.slice(oldPrefix.length) : p);
            deletes.push(key);
          } else if (key.startsWith(oldPrefix)) {
            const newKey = newPrefix + key.slice(oldPrefix.length);
            updates[newKey] = arr.map((p) => p.startsWith(oldPrefix) ? newPrefix + p.slice(oldPrefix.length) : p);
            deletes.push(key);
          }
        }
        if (deletes.length > 0) {
          const next = { ...ui.customFileOrder };
          for (const k of deletes) delete next[k];
          Object.assign(next, updates);
          useUIStore.setState({ customFileOrder: next });
        }
      }
    }

    setRenamingPath(null);
  }, [executeMoveOrRename]);


  // Root drop handlers (drop to workspace root)
  const handleRootDragOver = useCallback((e: React.DragEvent) => {
    if (e.target !== e.currentTarget) return;
    if (!draggedPath) return;
    if (!isValidDrop(draggedPath, draggedIsFolder, "")) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, [draggedPath, draggedIsFolder]);

  const handleRootDragEnter = useCallback((e: React.DragEvent) => {
    if (e.target !== e.currentTarget) return;
    rootDragEnterCounterRef.current++;
    if (draggedPath && isValidDrop(draggedPath, draggedIsFolder, "")) {
      setRootDragOver(true);
    }
  }, [draggedPath, draggedIsFolder]);

  const handleRootDragLeave = useCallback((e: React.DragEvent) => {
    if (e.target !== e.currentTarget) return;
    rootDragEnterCounterRef.current--;
    if (rootDragEnterCounterRef.current <= 0) {
      rootDragEnterCounterRef.current = 0;
      setRootDragOver(false);
    }
  }, []);

  const handleRootDrop = useCallback((e: React.DragEvent) => {
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    const path = e.dataTransfer.getData("application/brainmap-path");
    const isFolderStr = e.dataTransfer.getData("application/brainmap-is-folder");
    const isFolder = isFolderStr === "1";

    handleDragEnd();

    if (path && isValidDrop(path, isFolder, "")) {
      executeMoveItem(path, "", isFolder);
    }
  }, [executeMoveItem, handleDragEnd]);

  const handleContextMenu = (e: React.MouseEvent, node: TreeNode) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  };

  const handleActionsClick = (rect: DOMRect, node: TreeNode) => {
    setContextMenu({ x: rect.right, y: rect.top, node });
  };

  const handleTreeKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "F2" && !renamingPath) {
      const selectedPath = useGraphStore.getState().selectedNodePath
        ?? useEditorStore.getState().activePlainFile?.path;
      if (selectedPath) {
        e.preventDefault();
        setRenamingPath(selectedPath);
      }
    }
  }, [renamingPath]);

  const handleContentContextMenu = (e: React.MouseEvent) => {
    // Only fire for clicks directly on the scroll container, not on tree items
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, node: null });
  };

  const handleCloseMenu = useCallback(() => setContextMenu(null), []);
  const handleRenameCancel = useCallback(() => setRenamingPath(null), []);

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

    const isBrainMapNote = !!deleteTarget.note_type;

    try {
      if (!deleteTarget.isFolder && !isBrainMapNote) {
        // Untracked file — no undo snapshot, no graph update needed
        await api.deletePlainFile(deleteTarget.fullPath);
        // files-changed event from backend updates workspaceFiles automatically

        // If the parent folder will become empty after this deletion, track it
        // so it remains visible in the tree instead of vanishing.
        const parts = deleteTarget.fullPath.split("/");
        if (parts.length > 1) {
          const parentDir = parts.slice(0, -1).join("/");
          const prefix = parentDir + "/";
          const { workspaceFiles } = useGraphStore.getState();
          const hasOtherWorkspaceFile = workspaceFiles.some(
            (f) => f !== deleteTarget.fullPath && f.startsWith(prefix) &&
                   !f.slice(prefix.length).includes("/"),
          );
          const hasGraphNode = [...nodes.entries()].some(
            ([p, n]) => n.note_type !== "folder" && p !== deleteTarget.fullPath &&
                        p.startsWith(prefix) && !p.slice(prefix.length).includes("/"),
          );
          if (!hasOtherWorkspaceFile && !hasGraphNode) {
            useUIStore.getState().addEmptyFolder(parentDir);
          }
        }
      } else if (deleteTarget.isFolder) {
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

        // 4. Delete folder — backend emits topology event for all deleted nodes
        await api.deleteFolder(deleteTarget.fullPath, force);
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
        // 7. Push undo action
        useUndoStore.getState().pushAction({ kind: "delete-folder", folderPath: deleteTarget.fullPath, snapshots: undoSnapshots });
      } else {
        // 3. Snapshot note for undo
        const undoSnapshot = await api.readNote(deleteTarget.fullPath);
        // 4. Delete note — backend emits topology event
        await api.deleteNote(deleteTarget.fullPath, force);
        // 5. Push undo action
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
            // Backend already emitted topology events for partially deleted paths
            JSON.parse(rest.slice(0, colonIdx)); // validate JSON
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
    <div className="file-tree-panel" onKeyDown={handleTreeKeyDown}>
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
        <button
          className="file-tree-toolbar-btn"
          title="Collapse All"
          onClick={() => useUIStore.getState().collapseAllFolders()}
        >
          ⌄
        </button>
        <button
          className="file-tree-toolbar-btn"
          title="Select Opened File"
          disabled={!activeFilePath}
          onClick={() => {
            const { activeNote, activePlainFile } = useEditorStore.getState();
            const path = activeNote?.path ?? activePlainFile?.path;
            if (!path) return;
            useUIStore.getState().expandPathToFile(path);
            requestAnimationFrame(() => {
              const el = document.querySelector(`[data-tree-path="${CSS.escape(path)}"]`);
              el?.scrollIntoView({ block: "nearest" });
            });
          }}
        >
          <Crosshair size={14} />
        </button>
        <select
          className="file-tree-sort-select"
          value={useUIStore.getState().fileSortOrder}
          onChange={(e) => useUIStore.getState().setFileSortOrder(e.target.value as any)}
          title="Sort order"
        >
          <option value="custom">Custom</option>
          <option value="name-asc">Name A→Z</option>
          <option value="name-desc">Name Z→A</option>
          <option value="modified-desc">Modified ↓</option>
          <option value="modified-asc">Modified ↑</option>
        </select>
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
      <div
        className={`file-tree-content${rootDragOver ? " drag-over-root" : ""}`}
        onContextMenu={handleContentContextMenu}
        onDragOver={handleRootDragOver}
        onDragEnter={handleRootDragEnter}
        onDragLeave={handleRootDragLeave}
        onDrop={handleRootDrop}
      >
        {filtered.map((n) => (
          <FileTreeNode
            key={n.fullPath}
            node={n}
            depth={0}
            onContextMenu={handleContextMenu}
            onActionsClick={handleActionsClick}
            hasBeenExpanded={hasBeenExpanded}
            onExpand={handleExpand}
            draggedPath={draggedPath}
            dragOverPath={dragOverPath}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onFolderDragEnter={handleFolderDragEnter}
            onFolderDragLeave={handleFolderDragLeave}
            onItemDragOver={handleItemDragOver}
            onItemDrop={handleItemDrop}
            reorderIndicator={reorderIndicator}
            renamingPath={renamingPath}
            onRenameConfirm={executeRenameItem}
            onRenameCancel={handleRenameCancel}
          />
        ))}
      </div>
      {contextMenu && (
        <ContextMenu
          state={contextMenu}
          onClose={handleCloseMenu}
          onDelete={(node) => setDeleteTarget(node)}
          onRename={(node) => setRenamingPath(node.fullPath)}
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
