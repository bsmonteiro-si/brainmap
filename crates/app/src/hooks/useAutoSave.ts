import { useEffect, useRef } from "react";
import { useEditorStore } from "../stores/editorStore";
import { useTabStore, isUntitledTab } from "../stores/tabStore";

const AUTO_SAVE_DELAY = 1500;

function trySave() {
  const { isDirty, savingInProgress, activeNote, activePlainFile, editedFrontmatter } =
    useEditorStore.getState();
  if (!isDirty || savingInProgress || (!activeNote && !activePlainFile)) return;
  // Skip auto-save for untitled tabs — they have no backing file
  const activeTabId = useTabStore.getState().activeTabId;
  if (activeTabId && isUntitledTab(activeTabId)) return;
  if (
    editedFrontmatter?.title !== undefined &&
    editedFrontmatter.title.trim() === ""
  )
    return;
  useEditorStore.getState().saveNote();
}

export function useAutoSave() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    let prevDirty = useEditorStore.getState().isDirty;
    let prevPath = useEditorStore.getState().activeNote?.path ?? useEditorStore.getState().activePlainFile?.path ?? useTabStore.getState().activeTabId ?? null;

    const unsubEditor = useEditorStore.subscribe((state) => {
      // Use activeTabId for untitled tabs (where path is null) to detect tab switches
      const tabId = useTabStore.getState().activeTabId;
      const currentPath = state.activeNote?.path ?? state.activePlainFile?.path ?? tabId ?? null;

      // Tab/note switch: clear any pending debounce for the old tab
      if (currentPath !== prevPath) {
        clearTimer();
        prevPath = currentPath;
        prevDirty = state.isDirty;
        return;
      }

      // isDirty is true — reset debounce on every edit
      if (state.isDirty) {
        clearTimer();
        timerRef.current = setTimeout(trySave, AUTO_SAVE_DELAY);
      }

      // isDirty became false (manual save or other) — clear timer
      if (!state.isDirty && prevDirty) {
        clearTimer();
      }

      prevDirty = state.isDirty;
    });

    // Window blur: save immediately when user leaves the app
    const handleBlur = () => {
      clearTimer();
      trySave();
    };
    window.addEventListener("blur", handleBlur);

    return () => {
      clearTimer();
      unsubEditor();
      window.removeEventListener("blur", handleBlur);
    };
  }, []);
}
