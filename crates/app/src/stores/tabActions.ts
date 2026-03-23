import { useTabStore } from "./tabStore";
import { useEditorStore } from "./editorStore";
import { useGraphStore } from "./graphStore";

/**
 * Navigate to the current active tab after a close operation, or clear if none left.
 */
function navigateToActiveTab() {
  const { activeTabId, getTab } = useTabStore.getState();
  if (activeTabId) {
    const nextTab = getTab(activeTabId);
    if (nextTab) {
      if (nextTab.kind === "untitled") {
        useGraphStore.getState().selectNode(null);
        useEditorStore.getState().activateUntitledTab(activeTabId);
      } else if (nextTab.kind === "pdf" || nextTab.kind === "excalidraw" || nextTab.kind === "canvas" || nextTab.kind === "image") {
        useGraphStore.getState().selectNode(null);
        useEditorStore.getState().clearForCustomTab();
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

/**
 * Save the active tab if it's dirty (auto-save for notes, no-op for others).
 */
async function saveActiveIfDirty() {
  const editor = useEditorStore.getState();
  if (editor.isDirty && editor.currentPath) {
    await editor.saveNote();
  }
}

/**
 * Close a tab and navigate to the next one (or clear the editor if none left).
 * Shared utility used by TabBar close button and Cmd+W handler.
 */
export function closeTabAndNavigateNext(id: string) {
  const tabStore = useTabStore.getState();
  const wasActive = tabStore.activeTabId === id;
  tabStore.closeTab(id);

  if (wasActive) {
    navigateToActiveTab();
  }
}

/**
 * Close all tabs, auto-saving the active dirty note first.
 * Non-active tabs already have their state snapshotted in TabState fields,
 * so only the active editor buffer needs saving.
 */
export async function closeAllTabsWithSave() {
  await saveActiveIfDirty();
  useTabStore.getState().closeAllTabs();
  useEditorStore.getState().clear();
  useGraphStore.getState().selectNode(null);
}

/**
 * Close tabs to the right of the given tab, auto-saving if needed.
 * Only the active tab's editor buffer needs saving — non-active tabs
 * already have their state snapshotted in TabState fields.
 */
export async function closeTabsToRightWithSave(id: string) {
  const { tabs, activeTabId } = useTabStore.getState();
  const idx = tabs.findIndex((t) => t.id === id);
  if (idx < 0) return;

  const activeIsToRight = tabs.findIndex((t) => t.id === activeTabId) > idx;
  if (activeIsToRight) {
    await saveActiveIfDirty();
  }

  useTabStore.getState().closeTabsToRight(id);

  if (activeIsToRight) {
    navigateToActiveTab();
  }
}
