import { useState, useRef, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTabStore, isUntitledTab } from "../../stores/tabStore";
import { closeTabAndNavigateNext, closeAllTabsWithSave, closeTabsToRightWithSave } from "../../stores/tabActions";
import { useEditorStore } from "../../stores/editorStore";
import { useGraphStore } from "../../stores/graphStore";
import { useUIStore } from "../../stores/uiStore";
import { promptUnsavedChanges } from "../../stores/unsavedChangesPrompt";
import { NoteTypeIcon } from "../Layout/fileTreeIcons";

const MENU_WIDTH = 200;

interface TabContextMenuState {
  x: number;
  y: number;
  tabId: string;
}

function TabContextMenu({
  state,
  onClose,
  onCloseTab,
}: {
  state: TabContextMenuState;
  onClose: () => void;
  onCloseTab: (e: React.MouseEvent, id: string) => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const tabs = useTabStore((s) => s.tabs);

  const tabIdx = tabs.findIndex((t) => t.id === state.tabId);
  const isLast = tabIdx === tabs.length - 1;

  const [clampedPos, setClampedPos] = useState(() => ({
    x: Math.min(state.x, window.innerWidth - MENU_WIDTH - 8),
    y: Math.min(state.y, window.innerHeight - 60 - 8),
  }));

  useLayoutEffect(() => {
    const menuHeight = menuRef.current?.offsetHeight ?? 60;
    const cx = Math.min(state.x, window.innerWidth - MENU_WIDTH - 8);
    const cy = Math.min(state.y, window.innerHeight - menuHeight - 8);
    setClampedPos((prev) => (prev.x === cx && prev.y === cy ? prev : { x: cx, y: cy }));
  }, [state.x, state.y]);

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

  const handleCloseThis = (e: React.MouseEvent) => {
    onClose();
    onCloseTab(e, state.tabId);
  };

  const handleCloseAll = () => {
    onClose();
    closeAllTabsWithSave();
  };

  const handleCloseToRight = () => {
    if (isLast) return;
    onClose();
    closeTabsToRightWithSave(state.tabId);
  };

  return createPortal(
    <div
      ref={menuRef}
      className="context-menu"
      style={{ left: clampedPos.x, top: clampedPos.y, width: MENU_WIDTH }}
    >
      <div className="context-menu-item" onClick={handleCloseThis}>Close This Tab</div>
      <div
        className={`context-menu-item${isLast ? " context-menu-item--disabled" : ""}`}
        onClick={handleCloseToRight}
      >
        Close Tabs to the Right
      </div>
      <div className="context-menu-separator" />
      <div className="context-menu-item" onClick={handleCloseAll}>Close All Tabs</div>
    </div>,
    document.body
  );
}

export function TabBar() {
  const tabs = useTabStore((s) => s.tabs);
  const activeTabId = useTabStore((s) => s.activeTabId);
  const editorIsDirty = useEditorStore((s) => s.isDirty);

  const [ctxMenu, setCtxMenu] = useState<TabContextMenuState | null>(null);
  const closeCtxMenu = useCallback(() => setCtxMenu(null), []);
  const [dragTabId, setDragTabId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  if (tabs.length === 0) return null;

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY, tabId });
  };

  const handleActivate = (path: string) => {
    if (path === activeTabId) return;
    const tab = useTabStore.getState().getTab(path);
    if (!tab) return;
    if (tab.kind === "untitled") {
      useGraphStore.getState().selectNode(null);
      useEditorStore.getState().activateUntitledTab(path);
    } else if (tab.kind === "pdf" || tab.kind === "excalidraw" || tab.kind === "canvas") {
      useGraphStore.getState().selectNode(null);
      useTabStore.getState().activateTab(path);
      useEditorStore.getState().clearForCustomTab();
    } else if (tab.kind === "note") {
      useGraphStore.getState().selectNode(path);
      useEditorStore.getState().openNote(path);
    } else {
      useGraphStore.getState().selectNode(null);
      useEditorStore.getState().openPlainFile(path);
    }
  };

  const handleClose = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const tabStore = useTabStore.getState();
    const tab = tabStore.getTab(id);

    // Untitled tab with content — prompt to save
    if (tab && tab.kind === "untitled") {
      // Capture body before any async operation to avoid stale reads
      const body = tab.id === activeTabId
        ? (useEditorStore.getState().editedBody ?? "")
        : (tab.editedBody ?? "");

      if (body.length > 0) {
        const action = await promptUnsavedChanges(id);
        if (action === "cancel") return;
        if (action === "save") {
          // Open Save-As dialog — if user cancels Save-As, the tab stays open (intentional)
          useUIStore.getState().openCreateNoteDialog({
            saveAsBody: body,
            saveAsTabId: id,
          });
          return;
        }
        // action === "discard" — fall through to close
      }
      closeTabAndNavigateNext(id);
      return;
    }

    // PDF tabs are never dirty — just close
    // Excalidraw tabs save via unmount cleanup in ExcalidrawEditor
    if (tab && (tab.kind === "pdf" || tab.kind === "excalidraw" || tab.kind === "canvas")) {
      closeTabAndNavigateNext(id);
      return;
    }

    // Regular tab — save if active and dirty, then close
    const editor = useEditorStore.getState();
    if (tabStore.activeTabId === id && editor.isDirty) {
      editor.saveNote().then(() => {
        closeTabAndNavigateNext(id);
      });
    } else {
      closeTabAndNavigateNext(id);
    }
  };

  const handleAuxClick = (e: React.MouseEvent, id: string) => {
    if (e.button === 1) {
      e.preventDefault();
      handleClose(e, id);
    }
  };

  const handleDragStart = (e: React.DragEvent, tabId: string) => {
    setDragTabId(tabId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", tabId);
  };

  const handleDragOver = (e: React.DragEvent, tabId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragTabId && tabId !== dragTabId) {
      setDropTargetId(tabId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!(e.currentTarget as Node).contains(e.relatedTarget as Node)) {
      setDropTargetId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, tabId: string) => {
    e.preventDefault();
    if (dragTabId && dragTabId !== tabId) {
      useTabStore.getState().reorderTab(dragTabId, tabId);
    }
    setDragTabId(null);
    setDropTargetId(null);
  };

  const handleDragEnd = () => {
    setDragTabId(null);
    setDropTargetId(null);
  };

  const handleNewTab = () => {
    useEditorStore.getState().openUntitledTab();
  };

  return (
    <div className="tab-bar" role="tablist">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tab"
          aria-selected={tab.id === activeTabId}
          className={`tab-item${tab.id === activeTabId ? " tab-item--active" : ""}${dragTabId === tab.id ? " tab-item--dragging" : ""}${dropTargetId === tab.id ? " tab-item--drop-target" : ""}`}
          draggable
          onClick={() => handleActivate(tab.id)}
          onAuxClick={(e) => handleAuxClick(e, tab.id)}
          onContextMenu={(e) => handleContextMenu(e, tab.id)}
          onDragStart={(e) => handleDragStart(e, tab.id)}
          onDragOver={(e) => handleDragOver(e, tab.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, tab.id)}
          onDragEnd={handleDragEnd}
          title={tab.kind === "untitled" ? tab.title : tab.path}
        >
          <NoteTypeIcon noteType={tab.kind === "untitled" ? undefined : (tab.noteType ?? undefined)} fileName={tab.kind === "untitled" ? undefined : tab.path?.split("/").pop()} size={14} />
          <span className="tab-title">{tab.title}</span>
          {(tab.id === activeTabId && tab.kind !== "excalidraw" && tab.kind !== "pdf" && tab.kind !== "canvas" ? editorIsDirty : tab.isDirty) && <span className="tab-dirty-dot" />}
          <button
            className="tab-close"
            onClick={(e) => handleClose(e, tab.id)}
            aria-label={`Close ${tab.title}`}
          >
            ×
          </button>
        </div>
      ))}
      <button
        className="tab-new-btn"
        onClick={handleNewTab}
        title="New untitled file"
        aria-label="New untitled file"
      >
        +
      </button>
      {ctxMenu && (
        <TabContextMenu
          state={ctxMenu}
          onClose={closeCtxMenu}
          onCloseTab={handleClose}
        />
      )}
    </div>
  );
}
