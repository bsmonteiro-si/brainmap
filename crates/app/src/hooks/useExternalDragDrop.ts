import { useEffect, useRef, useState } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { getAPI } from "../api/bridge";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { useUndoStore } from "../stores/undoStore";
import { log } from "../utils/logger";

const EXTERNAL_DROP_TARGET_CLASS = "external-drop-target";

/**
 * Given a physical screen position from a Tauri drag event, find the folder
 * the cursor is over by hit-testing the DOM.
 *
 * Returns the folder's relative path, or "" for workspace root.
 */
function resolveDropFolder(x: number, y: number): string {
  if (typeof document.elementFromPoint !== "function") return "";
  const el = document.elementFromPoint(x, y);
  if (!el) return "";

  // Walk up from the hit element to find a tree item with data-tree-path
  const treeItem = (el as HTMLElement).closest?.("[data-tree-path]") as HTMLElement | null;
  if (!treeItem) return "";

  const path = treeItem.getAttribute("data-tree-path") ?? "";

  // If it's a folder, use its path directly
  if (treeItem.classList.contains("tree-folder")) {
    return path;
  }

  // If it's a file, use its parent folder
  const lastSlash = path.lastIndexOf("/");
  return lastSlash >= 0 ? path.substring(0, lastSlash) : "";
}

/**
 * Apply or remove a highlight CSS class on the folder element that would
 * receive a drop.  Only one element is highlighted at a time.
 */
function highlightDropTarget(folder: string | null) {
  // Remove previous highlight
  document
    .querySelectorAll(`.${EXTERNAL_DROP_TARGET_CLASS}`)
    .forEach((el) => el.classList.remove(EXTERNAL_DROP_TARGET_CLASS));

  if (folder === null) return;

  if (folder === "") {
    // Highlight the file-tree-content root container
    document
      .querySelector(".file-tree-content")
      ?.classList.add(EXTERNAL_DROP_TARGET_CLASS);
  } else {
    // Highlight the specific folder element
    const escaped = typeof CSS !== "undefined" && CSS.escape
      ? CSS.escape(folder)
      : folder.replace(/"/g, '\\"');
    const el = document.querySelector(
      `.tree-folder[data-tree-path="${escaped}"]`,
    );
    el?.classList.add(EXTERNAL_DROP_TARGET_CLASS);
  }
}

/**
 * Listens for Tauri v2 native drag-drop events (files dragged from external
 * apps like Finder) and imports them into the resolved target folder.
 *
 * Uses `getCurrentWebview().onDragDropEvent()` which aggregates the four
 * separate Tauri events (drag-enter, drag-over, drag-drop, drag-leave)
 * into a single discriminated-union callback.
 *
 * Returns `isDraggingExternal` for rendering a drop overlay.
 */
export function useExternalDragDrop() {
  const [isDraggingExternal, setIsDraggingExternal] = useState(false);
  const targetFolderRef = useRef("");

  useEffect(() => {
    // Prevent the browser from navigating to dropped files.
    const preventDefault = (e: DragEvent) => {
      e.preventDefault();
    };
    document.addEventListener("dragover", preventDefault);
    document.addEventListener("drop", preventDefault);

    let cancelled = false;
    let unlistenFn: (() => void) | null = null;

    getCurrentWebview()
      .onDragDropEvent(async (event) => {
        if (cancelled) return;
        const payload = event.payload;

        switch (payload.type) {
          case "enter":
            if (payload.paths && payload.paths.length > 0) {
              setIsDraggingExternal(true);
              targetFolderRef.current = "";
              log.debug("drag-drop", "drag enter", {
                count: payload.paths.length,
              });
            }
            break;

          case "over": {
            const pos = payload.position;
            const folder = resolveDropFolder(pos.x, pos.y);
            targetFolderRef.current = folder;
            highlightDropTarget(folder);
            break;
          }

          case "leave":
            setIsDraggingExternal(false);
            highlightDropTarget(null);
            break;

          case "drop": {
            setIsDraggingExternal(false);
            highlightDropTarget(null);

            const paths = payload.paths;
            if (!paths || paths.length === 0) return;

            const info = useWorkspaceStore.getState().info;
            if (!info) {
              log.warn(
                "drag-drop",
                "Ignored file drop — no workspace is open",
              );
              return;
            }

            // Resolve target from drop position, falling back to the last
            // tracked position from "over" events.
            const pos = payload.position;
            const targetDir =
              resolveDropFolder(pos.x, pos.y) || targetFolderRef.current;

            log.info("drag-drop", "drop received", {
              count: paths.length,
              targetDir,
            });

            try {
              const api = await getAPI();
              const result = await api.importFiles(paths, targetDir);

              const imported = result.imported.length;
              const failed = result.failed.length;
              const where = targetDir || "workspace root";

              if (imported > 0 && failed === 0) {
                showToast(
                  `Imported ${imported} file${imported === 1 ? "" : "s"} into ${where}`,
                );
              } else if (imported > 0 && failed > 0) {
                showToast(
                  `Imported ${imported} file${imported === 1 ? "" : "s"} into ${where}, ${failed} failed`,
                );
              } else if (failed > 0) {
                showToast(`Import failed: ${result.failed[0].error}`);
              }

              log.info("drag-drop", "import complete", {
                imported,
                failed,
                targetDir,
              });
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              showToast(`Import failed: ${msg}`);
              log.error("drag-drop", "import error", { error: msg });
            }
            break;
          }
        }
      })
      .then((fn) => {
        if (cancelled) {
          fn();
        } else {
          unlistenFn = fn;
        }
      });

    return () => {
      cancelled = true;
      document.removeEventListener("dragover", preventDefault);
      document.removeEventListener("drop", preventDefault);
      highlightDropTarget(null);
      unlistenFn?.();
    };
  }, []);

  return { isDraggingExternal };
}

function showToast(message: string) {
  useUndoStore.setState((prev) => ({
    toastMessage: message,
    toastKey: prev.toastKey + 1,
  }));
}
