import { useTabStore } from "../../stores/tabStore";
import { closeTabAndNavigateNext } from "../../stores/tabActions";
import { useEditorStore } from "../../stores/editorStore";
import { useGraphStore } from "../../stores/graphStore";
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
    // Capture scroll/cursor from current editor before switching
    if (tab.kind === "note") {
      useGraphStore.getState().selectNode(path);
      useEditorStore.getState().openNote(path);
    } else {
      useGraphStore.getState().selectNode(null);
      useEditorStore.getState().openPlainFile(path);
    }
  };

  const handleClose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Save current tab before closing if it's the one being closed
    const editor = useEditorStore.getState();
    const tabStore = useTabStore.getState();
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
          title={tab.path}
        >
          <NoteTypeIcon noteType={tab.noteType ?? undefined} size={12} />
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
    </div>
  );
}

