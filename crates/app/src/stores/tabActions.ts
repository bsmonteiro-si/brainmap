import { useTabStore } from "./tabStore";
import { useEditorStore } from "./editorStore";
import { useGraphStore } from "./graphStore";

/**
 * Close a tab and navigate to the next one (or clear the editor if none left).
 * Shared utility used by TabBar close button and Cmd+W handler.
 */
export function closeTabAndNavigateNext(id: string) {
  const tabStore = useTabStore.getState();
  const wasActive = tabStore.activeTabId === id;
  tabStore.closeTab(id);

  if (wasActive) {
    const { activeTabId } = useTabStore.getState();
    if (activeTabId) {
      const nextTab = useTabStore.getState().getTab(activeTabId);
      if (nextTab) {
        if (nextTab.kind === "untitled") {
          useGraphStore.getState().selectNode(null);
          useEditorStore.getState().activateUntitledTab(activeTabId);
        } else if (nextTab.kind === "note") {
          useGraphStore.getState().selectNode(activeTabId);
          useEditorStore.getState().openNote(activeTabId);
        } else {
          useGraphStore.getState().selectNode(null);
          useEditorStore.getState().openPlainFile(activeTabId);
        }
      }
    } else {
      useEditorStore.getState().clear();
      useGraphStore.getState().selectNode(null);
    }
  }
}
