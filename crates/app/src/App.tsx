import { useEffect, useCallback } from "react";
import { useWorkspaceStore } from "./stores/workspaceStore";
import { useGraphStore } from "./stores/graphStore";
import { useEditorStore } from "./stores/editorStore";
import { useUIStore } from "./stores/uiStore";
import { useUndoStore } from "./stores/undoStore";
import { useNavigationStore } from "./stores/navigationStore";
import { useAutoSave } from "./hooks/useAutoSave";
import { useTabStore } from "./stores/tabStore";
import { closeTabAndNavigateNext } from "./stores/tabActions";
import { getAPI } from "./api/bridge";
import { SegmentPicker } from "./components/Layout/SegmentPicker";
import { AppLayout } from "./components/Layout/AppLayout";
import { CommandPalette } from "./components/CommandPalette/CommandPalette";
import { CreateNoteDialog } from "./components/Editor/CreateNoteDialog";
import { CreateFolderDialog } from "./components/Layout/CreateFolderDialog";
import { SettingsModal } from "./components/Settings/SettingsModal";
import { UndoToast } from "./components/Layout/UndoToast";

import "./App.css";

function App() {
  const info = useWorkspaceStore((s) => s.info);
  const loadTopology = useGraphStore((s) => s.loadTopology);
  const applyEvent = useGraphStore((s) => s.applyEvent);
  const commandPaletteOpen = useUIStore((s) => s.commandPaletteOpen);
  const createNoteDialogOpen = useUIStore((s) => s.createNoteDialogOpen);
  const createFolderDialogOpen = useUIStore((s) => s.createFolderDialogOpen);
  const settingsOpen = useUIStore((s) => s.settingsOpen);
  const effectiveTheme = useUIStore((s) => s.effectiveTheme);
  const uiFontFamily = useUIStore((s) => s.uiFontFamily);
  const uiFontSize = useUIStore((s) => s.uiFontSize);
  const editorFontFamily = useUIStore((s) => s.editorFontFamily);
  const editorFontSize = useUIStore((s) => s.editorFontSize);
  const uiZoom = useUIStore((s) => s.uiZoom); // drives zoom useEffect below

  // Subscribe to workspace events for live updates
  useEffect(() => {
    if (!info) return;

    let unsubscribe: (() => void) | undefined;
    getAPI().then((api) => {
      unsubscribe = api.onEvent((event) => {
        applyEvent(event);
        // If the event affects a note
        if (
          (event.type === "node-updated" || event.type === "topology-changed") &&
          "path" in event
        ) {
          const editorState = useEditorStore.getState();
          const tabStore = useTabStore.getState();
          const eventPath = (event as { path: string }).path;

          if (editorState.activeNote?.path === eventPath) {
            // Active tab — use existing conflict detection
            editorState.markExternalChange();
          } else {
            // Background tab — update tab state if it exists
            const bgTab = tabStore.getTab(eventPath);
            if (bgTab) {
              if (bgTab.isDirty) {
                tabStore.updateTabState(eventPath, { conflictState: "external-change" });
              } else {
                // Clean background tab — silently re-read would happen on tab switch
                // Mark as needing refresh (the note content will be re-fetched when activated)
              }
            }
          }
        }
      });
    });

    return () => unsubscribe?.();
  }, [info, applyEvent]);

  // Load graph topology after workspace opens
  useEffect(() => {
    if (info) {
      loadTopology();
    }
  }, [info, loadTopology]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key === "w") {
        e.preventDefault();
        const closingId = useTabStore.getState().activeTabId;
        if (closingId) {
          const editor = useEditorStore.getState();
          if (editor.isDirty) {
            editor.saveNote().then(() => {
              closeTabAndNavigateNext(closingId);
            });
          } else {
            closeTabAndNavigateNext(closingId);
          }
        }
      }
      if (isMod && e.key === "p") {
        e.preventDefault();
        useUIStore.getState().openCommandPalette();
      }
      if (isMod && e.key === "n") {
        e.preventDefault();
        useUIStore.getState().openCreateNoteDialog();
      }
      if (isMod && e.key === "s") {
        e.preventDefault();
        useEditorStore.getState().saveNote();
      }
      if (isMod && e.key === "b") {
        // When the CodeMirror editor has focus, let CM handle Cmd+B for bold
        const target = e.target as HTMLElement | null;
        if (!target?.closest(".cm-editor")) {
          e.preventDefault();
          useUIStore.getState().toggleTree();
        }
      }
      if (isMod && e.key === ",") {
        e.preventDefault();
        useUIStore.getState().openSettings();
      }
      if (isMod && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        useUIStore.getState().zoomIn();
      }
      if (isMod && e.key === "-") {
        e.preventDefault();
        useUIStore.getState().zoomOut();
      }
      if (isMod && e.key === "0") {
        e.preventDefault();
        useUIStore.getState().resetZoom();
      }
      // Cmd+Z: Undo (frontmatter fields → frontmatter undo, CodeMirror → CM undo, else → file-op undo)
      if (isMod && e.key === "z" && !e.shiftKey) {
        const target = e.target as HTMLElement | null;
        if (target?.closest(".frontmatter-form")) {
          e.preventDefault();
          useEditorStore.getState().undoFrontmatter();
        } else if (!target?.closest(".cm-editor")) {
          e.preventDefault();
          useUndoStore.getState().undo();
        }
      }
      // Cmd+Y or Cmd+Shift+Z: Redo (same routing as undo)
      if (isMod && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        const target = e.target as HTMLElement | null;
        if (target?.closest(".frontmatter-form")) {
          e.preventDefault();
          useEditorStore.getState().redoFrontmatter();
        } else if (!target?.closest(".cm-editor")) {
          e.preventDefault();
          useUndoStore.getState().redo();
        }
      }
      // Cmd+[: Go back in navigation history
      if (isMod && e.key === "[") {
        e.preventDefault();
        useNavigationStore.getState().goBack();
      }
      // Cmd+]: Go forward in navigation history
      if (isMod && e.key === "]") {
        e.preventDefault();
        useNavigationStore.getState().goForward();
      }
      if (e.key === "Escape") {
        const ui = useUIStore.getState();
        if (ui.settingsOpen) {
          ui.closeSettings();
        } else if (ui.focusMode) {
          ui.toggleFocusMode();
        } else if (ui.commandPaletteOpen) {
          ui.closeCommandPalette();
        }
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", effectiveTheme);
  }, [effectiveTheme]);

  // Apply font CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--ui-font-family", uiFontFamily);
    root.style.setProperty("--ui-font-size", `${uiFontSize}px`);
    root.style.setProperty("--editor-font-family", editorFontFamily);
    root.style.setProperty("--editor-font-size", `${editorFontSize}px`);
  }, [uiFontFamily, uiFontSize, editorFontFamily, editorFontSize]);

  // Apply zoom at document level so mouse event coordinates remain consistent
  // (applying zoom to a sub-element breaks Cytoscape hit-testing).
  // Also expose --ui-zoom as a CSS variable so the CodeMirror container can
  // counter-zoom itself to avoid coordinate mismatch (see MarkdownEditor.tsx).
  useEffect(() => {
    const root = document.documentElement;
    root.style.zoom = String(uiZoom);
    root.style.setProperty("--ui-zoom", String(uiZoom));
    return () => {
      root.style.zoom = "1";
      root.style.setProperty("--ui-zoom", "1");
    };
  }, [uiZoom]);

  // Auto-save: debounced save on edit, save on blur, save on note switch
  useAutoSave();

  if (!info) {
    return <SegmentPicker />;
  }

  return (
    <div className="app">
      <AppLayout />
      {commandPaletteOpen && <CommandPalette />}
      {createNoteDialogOpen && <CreateNoteDialog />}
      {createFolderDialogOpen && <CreateFolderDialog />}
      {settingsOpen && <SettingsModal />}
      <UndoToast />
    </div>
  );
}

export default App;
