import { useState, useMemo, useCallback, useLayoutEffect, useRef, useEffect } from "react";
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
import { computeNewPath, isValidDrop } from "../../utils/fileTreeDnd";
import { computeRenamePath, validateRenameName } from "../../utils/fileTreeRename";

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
          <div className="context-menu-item" onClick={handleRename}>
            Rename
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
          <div className="context-menu-item" onClick={handleRename}>
            Rename
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
  onFolderDragOver,
  onFolderDragEnter,
  onFolderDragLeave,
  onFolderDrop,
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
  onFolderDragOver: (e: React.DragEvent, folderPath: string) => void;
  onFolderDragEnter: (e: React.DragEvent, folderPath: string) => void;
  onFolderDragLeave: (e: React.DragEvent) => void;
  onFolderDrop: (e: React.DragEvent, folderPath: string) => void;
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

    return (
      <div>
        <div
          role="button"
          tabIndex={0}
          className={`tree-item tree-folder${isDragging ? " dragging" : ""}${isDragOver ? " drag-over" : ""}`}
          style={{ paddingLeft: 8 }}
          draggable={!isRenaming}
          onClick={isRenaming ? undefined : handleToggle}
          onKeyDown={isRenaming ? undefined : (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleToggle(); } }}
          onContextMenu={isRenaming ? undefined : (e) => onContextMenu(e, node)}
          onDragStart={isRenaming ? undefined : (e) => onDragStart(e, node)}
          onDragEnd={isRenaming ? undefined : onDragEnd}
          onDragOver={isRenaming ? undefined : (e) => onFolderDragOver(e, node.fullPath)}
          onDragEnter={isRenaming ? undefined : (e) => onFolderDragEnter(e, node.fullPath)}
          onDragLeave={isRenaming ? undefined : onFolderDragLeave}
          onDrop={isRenaming ? undefined : (e) => onFolderDrop(e, node.fullPath)}
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
                  onFolderDragOver={onFolderDragOver}
                  onFolderDragEnter={onFolderDragEnter}
                  onFolderDragLeave={onFolderDragLeave}
                  onFolderDrop={onFolderDrop}
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

  return (
    <div
      role="button"
      tabIndex={0}
      className={`tree-item tree-file${isActive ? " active" : ""}${!isBrainMapNote ? " tree-file--plain" : ""}${isDragging ? " dragging" : ""}`}
      style={{ paddingLeft: 8 }}
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
    rootDragEnterCounterRef.current = 0;
    if (autoExpandTimerRef.current) {
      clearTimeout(autoExpandTimerRef.current);
      autoExpandTimerRef.current = null;
    }
  }, []);

  const handleFolderDragOver = useCallback((e: React.DragEvent, folderPath: string) => {
    if (!draggedPath) return;
    if (!isValidDrop(draggedPath, draggedIsFolder, folderPath)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, [draggedPath, draggedIsFolder]);

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
        // Save dirty note before moving
        if (editorState.activeNote?.path === oldPath && editorState.isDirty) {
          await editorState.saveNote();
        }

        await api.moveNote(oldPath, newPath);
        await useGraphStore.getState().loadTopology();

        // Update tab
        useTabStore.getState().renamePath(oldPath, newPath);

        // Update editor if active note was moved
        if (useEditorStore.getState().activeNote?.path === oldPath) {
          useEditorStore.getState().openNote(newPath);
          useGraphStore.getState().selectNode(newPath);
        }

        // Update UI state
        const ui = useUIStore.getState();
        if (ui.graphFocusPath === oldPath) {
          ui.setGraphFocus(newPath, "note");
        }
        if (ui.homeNotePath === oldPath) {
          ui.setHomeNote(newPath);
        }

        useUndoStore.getState().pushAction({ kind: "move-note", oldPath, newPath });
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

    if (isFolder) {
      const folderName = oldPath.split("/").pop()!;
      const newFolder = targetFolder === "" ? folderName : `${targetFolder}/${folderName}`;
      await executeMoveOrRename(oldPath, newFolder, true);
    } else {
      await executeMoveOrRename(oldPath, newPath, false);
    }
  }, [executeMoveOrRename]);

  const executeRenameItem = useCallback(async (oldPath: string, newName: string, isFolder: boolean) => {
    const trimmed = newName.trim();

    // Build set of existing paths for duplicate checking
    const existingPaths = new Set<string>();
    for (const [p] of nodes) existingPaths.add(p);
    for (const f of emptyFolders) existingPaths.add(f);

    const error = validateRenameName(trimmed, oldPath, isFolder, existingPaths);
    const newPath = computeRenamePath(oldPath, trimmed, isFolder);

    if (newPath === oldPath) {
      // No change — cancel silently
      setRenamingPath(null);
      return;
    }

    if (error) {
      useUndoStore.setState((prev) => ({
        toastMessage: `Rename failed: ${error}`,
        toastKey: prev.toastKey + 1,
      }));
      setRenamingPath(null);
      return;
    }

    const success = await executeMoveOrRename(oldPath, newPath, isFolder);

    if (success && isFolder) {
      // Update treeExpandedFolders: replace oldPath and any descendants
      const expandedFolders = useUIStore.getState().treeExpandedFolders;
      const prefix = oldPath + "/";
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

    setRenamingPath(null);
  }, [nodes, emptyFolders, executeMoveOrRename]);

  const handleFolderDrop = useCallback((e: React.DragEvent, folderPath: string) => {
    e.preventDefault();
    const path = e.dataTransfer.getData("application/brainmap-path");
    const isFolderStr = e.dataTransfer.getData("application/brainmap-is-folder");
    const isFolder = isFolderStr === "1";

    handleDragEnd();

    if (path && isValidDrop(path, isFolder, folderPath)) {
      executeMoveItem(path, folderPath, isFolder);
    }
  }, [executeMoveItem, handleDragEnd]);

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
            onFolderDragOver={handleFolderDragOver}
            onFolderDragEnter={handleFolderDragEnter}
            onFolderDragLeave={handleFolderDragLeave}
            onFolderDrop={handleFolderDrop}
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
