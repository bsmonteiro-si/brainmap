import { useTabStore, isUntitledTab } from "../../stores/tabStore";
import { closeTabAndNavigateNext } from "../../stores/tabActions";
import { useEditorStore } from "../../stores/editorStore";
import { useGraphStore } from "../../stores/graphStore";
import { useUIStore } from "../../stores/uiStore";
import { promptUnsavedChanges } from "../../stores/unsavedChangesPrompt";
import { NoteTypeIcon } from "../Layout/fileTreeIcons";

export function TabBar() {
  const tabs = useTabStore((s) => s.tabs);
  const activeTabId = useTabStore((s) => s.activeTabId);
  const editorIsDirty = useEditorStore((s) => s.isDirty);

  if (tabs.length === 0) return null;

  const handleActivate = (path: string) => {
    if (path === activeTabId) return;
    const tab = useTabStore.getState().getTab(path);
    if (!tab) return;
    if (tab.kind === "untitled") {
      useGraphStore.getState().selectNode(null);
      useEditorStore.getState().activateUntitledTab(path);
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
          className={`tab-item${tab.id === activeTabId ? " tab-item--active" : ""}`}
          onClick={() => handleActivate(tab.id)}
          onAuxClick={(e) => handleAuxClick(e, tab.id)}
          title={tab.kind === "untitled" ? tab.title : tab.path}
        >
          <NoteTypeIcon noteType={tab.kind === "untitled" ? undefined : (tab.noteType ?? undefined)} fileName={tab.kind === "untitled" ? undefined : tab.path?.split("/").pop()} size={14} />
          <span className="tab-title">{tab.title}</span>
          {(tab.id === activeTabId ? editorIsDirty : tab.isDirty) && <span className="tab-dirty-dot" />}
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
    </div>
  );
}
