import { useEffect, useRef } from "react";
import { useEditorStore } from "../stores/editorStore";
import { useUIStore } from "../stores/uiStore";

const AUTO_SAVE_DELAY = 1500;

function trySave() {
  const { isDirty, savingInProgress, activeNote, editedFrontmatter } =
    useEditorStore.getState();
  if (!isDirty || savingInProgress || !activeNote) return;
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
    let prevPath = useEditorStore.getState().activeNote?.path ?? null;

    const unsubEditor = useEditorStore.subscribe((state) => {
      const autoSave = useUIStore.getState().autoSave;
      const currentPath = state.activeNote?.path ?? null;

      // Note switch: clear any pending debounce for the old note
      if (currentPath !== prevPath) {
        clearTimer();
        prevPath = currentPath;
        prevDirty = state.isDirty;
        return;
      }

      if (!autoSave) {
        clearTimer();
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
      if (!useUIStore.getState().autoSave) return;
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
