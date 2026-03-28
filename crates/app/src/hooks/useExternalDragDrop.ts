import { useEffect, useState, useRef } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { getAPI } from "../api/bridge";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { useUndoStore } from "../stores/undoStore";
import { log } from "../utils/logger";
import { open } from "@tauri-apps/plugin-dialog";

// ── Inbound drop hook (Finder → app) ───────────────────────────────
// With dragDropEnabled: true, Tauri intercepts native file drags and
// exposes them via onDragDropEvent(). Mouse events for internal drag
// are unaffected.

/** Convert Tauri PhysicalPosition to CSS pixels (accounting for DPR + zoom). */
function physicalToCss(px: number, py: number): { x: number; y: number } {
  const dpr = window.devicePixelRatio || 1;
  const zoom = parseFloat(document.documentElement.style.zoom || "1");
  return { x: (px / dpr) / zoom, y: (py / dpr) / zoom };
}

/** Resolve the folder path under a CSS-pixel position via elementFromPoint. */
function resolveDropFolder(cssX: number, cssY: number): string {
  if (typeof document.elementFromPoint !== "function") return "";
  const el = document.elementFromPoint(cssX, cssY);
  if (!el) return "";

  // Check if cursor is over a tree item
  const treeItem = el.closest("[data-tree-path]") as HTMLElement | null;
  if (treeItem) {
    // If it's a folder, target that folder
    if (treeItem.dataset.treeIsFolder === "1") {
      return treeItem.dataset.treePath!;
    }
    // If it's a file, target its parent folder
    const path = treeItem.dataset.treePath!;
    const lastSlash = path.lastIndexOf("/");
    return lastSlash === -1 ? "" : path.substring(0, lastSlash);
  }

  // If over the file tree container but not a specific item, target root
  if (el.closest(".file-tree-content")) return "";

  // Outside the file tree entirely — target root
  return "";
}

export function useExternalDragDrop() {
  const [externalDragOver, setExternalDragOver] = useState(false);
  const [dragFileCount, setDragFileCount] = useState(0);
  const [externalDropTarget, setExternalDropTarget] = useState("");
  const dropTargetRef = useRef("");

  useEffect(() => {
    let unlisten: (() => void) | null = null;
    let cancelled = false;

    getCurrentWebview()
      .onDragDropEvent((event) => {
        switch (event.payload.type) {
          case "enter": {
            const paths = (event.payload as { paths?: string[] }).paths ?? [];
            setExternalDragOver(true);
            setDragFileCount(paths.length);
            log.debug("import::drag", "drag enter", { count: paths.length });
            break;
          }
          case "over": {
            const pos = (event.payload as { position: { x: number; y: number } }).position;
            const css = physicalToCss(pos.x, pos.y);
            const folder = resolveDropFolder(css.x, css.y);
            if (folder !== dropTargetRef.current) {
              dropTargetRef.current = folder;
              setExternalDropTarget(folder);
            }
            break;
          }
          case "drop": {
            const pos = (event.payload as { position: { x: number; y: number }; paths: string[] }).position;
            const css = physicalToCss(pos.x, pos.y);
            const folder = resolveDropFolder(css.x, css.y);
            setExternalDragOver(false);
            setDragFileCount(0);
            setExternalDropTarget("");
            dropTargetRef.current = "";
            const paths = (event.payload as { paths: string[] }).paths;
            log.info("import::drag", "drop received", { count: paths.length, targetFolder: folder });
            handleExternalDrop(paths, folder);
            break;
          }
          case "leave":
            setExternalDragOver(false);
            setDragFileCount(0);
            setExternalDropTarget("");
            dropTargetRef.current = "";
            break;
        }
      })
      .then((fn) => {
        if (cancelled) {
          fn();
        } else {
          unlisten = fn;
        }
      });

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, []);

  return { externalDragOver, dragFileCount, externalDropTarget };
}

async function handleExternalDrop(paths: string[], targetDir: string) {
  const info = useWorkspaceStore.getState().info;
  if (!info) {
    log.warn("import::drag", "No workspace open, ignoring drop");
    return;
  }

  if (paths.length === 0) return;

  try {
    const api = await getAPI();
    const result = await api.importFiles(paths, targetDir);

    const imported = result.imported.length;
    const failed = result.failed.length;
    const where = targetDir || "workspace root";

    if (imported > 0 && failed === 0) {
      showToast(`Imported ${imported} file${imported === 1 ? "" : "s"} into ${where}`);
    } else if (imported > 0 && failed > 0) {
      showToast(`Imported ${imported} file${imported === 1 ? "" : "s"} into ${where}, ${failed} failed`);
    } else if (failed > 0) {
      showToast(`Import failed: ${result.failed[0].error}`);
    }

    log.info("import::drag", "drop import complete", { imported, failed, targetDir });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    showToast(`Import failed: ${msg}`);
    log.error("import::drag", "drop import error", { error: msg });
  }
}

// ── File picker import (context menu) ──────────────────────────────

/**
 * Open a native file picker and import the selected files into the workspace.
 * @param targetDir relative folder within workspace ("" for root)
 */
export async function importFilesViaDialog(targetDir = ""): Promise<void> {
  const info = useWorkspaceStore.getState().info;
  if (!info) {
    log.warn("import", "No workspace open");
    return;
  }

  const selected = await open({
    multiple: true,
    title: "Import files into workspace",
  });

  if (!selected) return;

  const paths = Array.isArray(selected) ? selected : [selected];
  if (paths.length === 0) return;

  try {
    const api = await getAPI();
    const result = await api.importFiles(paths, targetDir);

    const imported = result.imported.length;
    const failed = result.failed.length;
    const where = targetDir || "workspace root";

    if (imported > 0 && failed === 0) {
      showToast(`Imported ${imported} file${imported === 1 ? "" : "s"} into ${where}`);
    } else if (imported > 0 && failed > 0) {
      showToast(`Imported ${imported} file${imported === 1 ? "" : "s"} into ${where}, ${failed} failed`);
    } else if (failed > 0) {
      showToast(`Import failed: ${result.failed[0].error}`);
    }

    log.info("import", "import complete", { imported, failed, targetDir });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    showToast(`Import failed: ${msg}`);
    log.error("import", "import error", { error: msg });
  }
}

function showToast(message: string) {
  useUndoStore.setState((prev) => ({
    toastMessage: message,
    toastKey: prev.toastKey + 1,
  }));
}
