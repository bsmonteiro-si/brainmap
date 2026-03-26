import { useEffect, useCallback, useRef } from "react";
import { useWorkspaceStore } from "./stores/workspaceStore";
import { useGraphStore } from "./stores/graphStore";
import { useEditorStore } from "./stores/editorStore";
import { useUIStore } from "./stores/uiStore";
import { useUndoStore } from "./stores/undoStore";
import { useNavigationStore } from "./stores/navigationStore";
import { useSegmentStore } from "./stores/segmentStore";
import { useAutoSave } from "./hooks/useAutoSave";
import { useHomeAutoFocus } from "./hooks/useHomeAutoFocus";
import { useTabStore, isUntitledTab } from "./stores/tabStore";
import { closeTabAndNavigateNext } from "./stores/tabActions";
import { promptUnsavedChanges } from "./stores/unsavedChangesPrompt";
import { hasDirtyUntitledTabs, applyEventToSnapshot } from "./stores/segmentStateCache";
import { listen } from "@tauri-apps/api/event";
import { getAPI } from "./api/bridge";
import { pickFolder } from "./api/pickFolder";
import { openSegmentByPath, openFolderAsSegment } from "./stores/segmentActions";
import { SegmentPicker } from "./components/Layout/SegmentPicker";
import { AppLayout } from "./components/Layout/AppLayout";
import { CommandPalette } from "./components/CommandPalette/CommandPalette";
import { CreateNoteDialog } from "./components/Editor/CreateNoteDialog";
import { CreateFolderDialog } from "./components/Layout/CreateFolderDialog";
import { MoveToDialog } from "./components/Layout/MoveToDialog";
import { SettingsModal } from "./components/Settings/SettingsModal";
import { UndoToast } from "./components/Layout/UndoToast";
import { UnsavedChangesDialog } from "./components/Layout/UnsavedChangesDialog";

import "./App.css";

function App() {
  const info = useWorkspaceStore((s) => s.info);
  const loadTopology = useGraphStore((s) => s.loadTopology);
  const applyEvent = useGraphStore((s) => s.applyEvent);
  const commandPaletteOpen = useUIStore((s) => s.commandPaletteOpen);
  const createNoteDialogOpen = useUIStore((s) => s.createNoteDialogOpen);
  const createFolderDialogOpen = useUIStore((s) => s.createFolderDialogOpen);
  const settingsOpen = useUIStore((s) => s.settingsOpen);
  const unsavedChangesDialogOpen = useUIStore((s) => s.unsavedChangesDialogOpen);
  const effectiveTheme = useUIStore((s) => s.effectiveTheme);
  const uiFontFamily = useUIStore((s) => s.uiFontFamily);
  const uiFontSize = useUIStore((s) => s.uiFontSize);
  const editorFontFamily = useUIStore((s) => s.editorFontFamily);
  const editorFontSize = useUIStore((s) => s.editorFontSize);
  const tooltipFontSize = useUIStore((s) => s.tooltipFontSize);
  const tooltipPillSize = useUIStore((s) => s.tooltipPillSize);
  const tooltipConnectionsSize = useUIStore((s) => s.tooltipConnectionsSize);
  const tooltipSummarySize = useUIStore((s) => s.tooltipSummarySize);
  const tooltipTagSize = useUIStore((s) => s.tooltipTagSize);
  const uiZoom = useUIStore((s) => s.uiZoom); // drives zoom useEffect below
  const sourceStyle = useUIStore((s) => s.sourceStyle);
  const exampleStyle = useUIStore((s) => s.exampleStyle);
  const mathStyle = useUIStore((s) => s.mathStyle);
  const attentionStyle = useUIStore((s) => s.attentionStyle);
  const boldWeight = useUIStore((s) => s.boldWeight);
  const boldTint = useUIStore((s) => s.boldTint);
  const italicTint = useUIStore((s) => s.italicTint);
  const arrowColor = useUIStore((s) => s.arrowColor);

  // Subscribe to workspace events for live updates
  useEffect(() => {
    if (!info) return;

    let unsubscribe: (() => void) | undefined;
    getAPI().then((api) => {
      unsubscribe = api.onEvent((event) => {
        // Skip events during segment switch to prevent cross-segment state corruption
        if (useWorkspaceStore.getState().switchInProgress) return;

        // Route event by workspace_root
        const eventRoot = event.workspace_root;
        const activeRoot = useWorkspaceStore.getState().info?.root;

        if (eventRoot && activeRoot && eventRoot !== activeRoot) {
          // Background segment event — apply to cached snapshot
          const segStore = useSegmentStore.getState();
          const segment = segStore.getSegmentByPath(eventRoot);
          if (segment) {
            applyEventToSnapshot(segment.id, event);
          }
          return;
        }

        // Active segment event — apply normally
        applyEvent(event);

        // If the event affects a note (node-updated has a `path` field)
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

        // Handle external changes for plain files (canvas, excalidraw, etc.)
        if (event.type === "files-changed") {
          const editorState = useEditorStore.getState();
          const tabStore = useTabStore.getState();
          // Plain file editor (non-canvas/excalidraw)
          const activePlainPath = editorState.activePlainFile?.path;
          if (activePlainPath && event.added_files.includes(activePlainPath)) {
            editorState.markExternalChange();
          }
          // Canvas/excalidraw tabs (active or background) — bump reload key
          const activeCanvasPath = useUIStore.getState().activeCanvasPath;
          for (const filePath of event.added_files) {
            const tab = tabStore.getTab(filePath);
            if (tab && (tab.kind === "canvas" || tab.kind === "excalidraw")) {
              useUIStore.getState().bumpTabReloadKey(filePath);
            }
            // Also check the left-panel canvas (opened via openCanvasInPanel, not as a tab)
            if (filePath === activeCanvasPath) {
              useUIStore.getState().bumpTabReloadKey(filePath);
            }
          }
        }
      });
    });

    return () => unsubscribe?.();
  }, [info, applyEvent]);

  // Load graph topology after initial workspace open (from SegmentPicker).
  // Segment switches handle topology loading internally via switchSegment.
  const prevInfoRef = useRef<typeof info>(null);
  useEffect(() => {
    const wasNull = prevInfoRef.current === null;
    prevInfoRef.current = info;
    if (info && wasNull) {
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
        if (!closingId) return;

        // Untitled tab — prompt if has content
        if (isUntitledTab(closingId)) {
          // Capture body before async to avoid stale reads
          const body = useEditorStore.getState().editedBody ?? "";
          if (body.length > 0) {
            promptUnsavedChanges(closingId).then((action) => {
              if (action === "cancel") return;
              if (action === "save") {
                // Re-read in case content changed during dialog
                const currentBody = useEditorStore.getState().editedBody ?? "";
                useUIStore.getState().openCreateNoteDialog({
                  saveAsBody: currentBody,
                  saveAsTabId: closingId,
                });
                return;
              }
              closeTabAndNavigateNext(closingId);
            });
          } else {
            closeTabAndNavigateNext(closingId);
          }
          return;
        }

        // Custom editor tabs — unmount cleanup handles saving; just close
        const closingTab = useTabStore.getState().getTab(closingId);
        if (closingTab?.kind === "excalidraw" || closingTab?.kind === "canvas" || closingTab?.kind === "image" || closingTab?.kind === "video") {
          closeTabAndNavigateNext(closingId);
          return;
        }

        // Regular tab
        const editor = useEditorStore.getState();
        if (editor.isDirty) {
          editor.saveNote().then(() => {
            closeTabAndNavigateNext(closingId);
          });
        } else {
          closeTabAndNavigateNext(closingId);
        }
      }
      if (isMod && e.key === "p") {
        e.preventDefault();
        useUIStore.getState().openCommandPalette();
      }
      if (isMod && e.key === "n") {
        e.preventDefault();
        useEditorStore.getState().openUntitledTab();
      }
      if (isMod && e.key === "s") {
        e.preventDefault();
        const tabId = useTabStore.getState().activeTabId;
        if (tabId && isUntitledTab(tabId)) {
          const body = useEditorStore.getState().editedBody ?? "";
          useUIStore.getState().openCreateNoteDialog({
            saveAsBody: body,
            saveAsTabId: tabId,
          });
        } else {
          const tab = tabId ? useTabStore.getState().getTab(tabId) : null;
          if (tab?.kind === "image" || tab?.kind === "video") {
            // Images and videos are read-only — no-op
          } else if (tab?.kind === "excalidraw") {
            window.dispatchEvent(new CustomEvent("excalidraw:save", { detail: tab.path }));
          } else if (tab?.kind === "canvas") {
            window.dispatchEvent(new CustomEvent("canvas:save", { detail: tab.path }));
          } else {
            useEditorStore.getState().saveNote();
          }
        }
      }
      if (isMod && e.key === "b") {
        // When the CodeMirror editor has focus, let CM handle Cmd+B for bold
        const target = e.target as HTMLElement | null;
        if (!target?.closest(".cm-editor")) {
          e.preventDefault();
          useUIStore.getState().toggleLeftPanel();
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
      // Cmd+Shift+R: Refresh segment
      if (isMod && e.shiftKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        useWorkspaceStore.getState().refreshSegment();
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
        if (ui.unsavedChangesDialogOpen) {
          // Do nothing — UnsavedChangesDialog handles its own Escape
        } else if (ui.settingsOpen) {
          ui.closeSettings();
        } else if (ui.canvasFullscreen) {
          ui.toggleCanvasFullscreen();
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

  // Window close interception — warn about unsaved untitled tabs (active + cached segments)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasDirtyUntitledTabs()) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Listen for dock menu events (macOS dock right-click → segment open/switch).
  useEffect(() => {
    let cancelled = false;
    const unlisteners: (() => void)[] = [];

    listen<{ path: string }>("brainmap://dock-open-segment", (e) => {
      openSegmentByPath(e.payload.path);
    }).then((fn) => {
      if (cancelled) fn();
      else unlisteners.push(fn);
    });

    listen("brainmap://dock-open-folder", async () => {
      const path = await pickFolder();
      if (path) {
        await openFolderAsSegment(path);
      }
    }).then((fn) => {
      if (cancelled) fn();
      else unlisteners.push(fn);
    });

    return () => {
      cancelled = true;
      unlisteners.forEach((fn) => fn());
    };
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", effectiveTheme);
  }, [effectiveTheme]);

  // Apply inline citation styles
  useEffect(() => {
    document.documentElement.setAttribute("data-source-style", sourceStyle);
  }, [sourceStyle]);
  useEffect(() => {
    document.documentElement.setAttribute("data-example-style", exampleStyle);
  }, [exampleStyle]);
  useEffect(() => {
    document.documentElement.setAttribute("data-math-style", mathStyle);
  }, [mathStyle]);
  useEffect(() => {
    document.documentElement.setAttribute("data-attention-style", attentionStyle);
  }, [attentionStyle]);

  // Apply font CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--ui-font-family", uiFontFamily);
    root.style.setProperty("--ui-font-size", `${uiFontSize}px`);
    root.style.setProperty("--editor-font-family", editorFontFamily);
    root.style.setProperty("--editor-font-size", `${editorFontSize}px`);
    root.style.setProperty("--tooltip-font-size", `${tooltipFontSize}px`);
    root.style.setProperty("--tooltip-pill-size", `${tooltipPillSize}px`);
    root.style.setProperty("--tooltip-connections-size", `${tooltipConnectionsSize}px`);
    root.style.setProperty("--tooltip-summary-size", `${tooltipSummarySize}px`);
    root.style.setProperty("--tooltip-tag-size", `${tooltipTagSize}px`);
  }, [uiFontFamily, uiFontSize, editorFontFamily, editorFontSize, tooltipFontSize, tooltipPillSize, tooltipConnectionsSize, tooltipSummarySize, tooltipTagSize]);

  // Apply bold/italic CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--bold-weight", String(boldWeight));
    root.style.setProperty("--bold-color",
      boldTint > 0
        ? `color-mix(in srgb, var(--text-primary) ${100 - boldTint}%, var(--accent))`
        : "inherit"
    );
    root.style.setProperty("--italic-color",
      italicTint > 0
        ? `color-mix(in srgb, var(--text-primary) ${100 - italicTint}%, var(--accent))`
        : "inherit"
    );
    const arrowColorValue =
      arrowColor === "accent" ? "var(--accent)"
      : arrowColor === "muted" ? "var(--text-muted)"
      : "inherit";
    root.style.setProperty("--arrow-color", arrowColorValue);
  }, [boldWeight, boldTint, italicTint, arrowColor]);

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

  // Auto-focus graph on home/index note when workspace loads
  useHomeAutoFocus();

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
      {unsavedChangesDialogOpen && <UnsavedChangesDialog />}
      <MoveToDialog />
      <UndoToast />
    </div>
  );
}

export default App;
