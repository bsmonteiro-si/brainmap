/**
 * Pure utility functions for file tree drag-and-drop.
 * No React or store dependencies.
 */

/**
 * Compute the new path when dragging an item to a target folder.
 * @param draggedPath - The full relative path of the dragged item (e.g. "A/Note.md" or "A/Sub")
 * @param targetFolder - The target folder path (e.g. "B") or "" for root
 * @param isFolder - Whether the dragged item is a folder
 * @returns The new relative path after the move
 */
export function computeNewPath(
  draggedPath: string,
  targetFolder: string,
  isFolder: boolean,
): string {
  // Get the basename (filename or folder name)
  const parts = draggedPath.split("/");
  const baseName = parts[parts.length - 1];

  if (targetFolder === "") {
    // Moving to root
    return baseName;
  }

  return `${targetFolder}/${baseName}`;
}

/**
 * Check whether a drop is valid.
 * @returns true if the drop should be allowed
 */
export function isValidDrop(
  draggedPath: string,
  draggedIsFolder: boolean,
  targetFolder: string,
): boolean {
  const newPath = computeNewPath(draggedPath, targetFolder, draggedIsFolder);

  // Same location — no-op
  if (newPath === draggedPath) return false;

  if (draggedIsFolder) {
    // Cannot drop a folder into itself
    if (targetFolder === draggedPath) return false;
    // Cannot drop a folder into one of its descendants
    if (targetFolder.startsWith(draggedPath + "/")) return false;
  }

  return true;
}

/**
 * Get the parent folder path from a full path.
 * Returns "" for root-level items (no parent folder).
 */
export function getParentFolder(fullPath: string): string {
  const idx = fullPath.lastIndexOf("/");
  return idx === -1 ? "" : fullPath.substring(0, idx);
}

/**
 * Check whether two paths share the same parent folder.
 */
export function isSameFolder(pathA: string, pathB: string): boolean {
  return getParentFolder(pathA) === getParentFolder(pathB);
}

/**
 * Compute a new ordered list after moving draggedPath before/after targetPath.
 */
export function computeReorderedList(
  currentOrder: string[],
  draggedPath: string,
  targetPath: string,
  position: "before" | "after",
): string[] {
  const without = currentOrder.filter((p) => p !== draggedPath);
  const targetIdx = without.indexOf(targetPath);
  if (targetIdx === -1) return currentOrder;
  const insertIdx = position === "before" ? targetIdx : targetIdx + 1;
  without.splice(insertIdx, 0, draggedPath);
  return without;
}

/**
 * Snapshot the current visible order of children as fullPath[].
 */
export function initCustomOrderFromTree(
  children: { fullPath: string }[],
): string[] {
  return children.map((c) => c.fullPath);
}

/**
 * Determine the drop zone for a drag-over event.
 * Folders use 25/50/25 split (before/into/after).
 * Files use 50/50 split (before/after).
 */
export function computeDropZone(
  rect: { top: number; height: number },
  clientY: number,
  isFolder: boolean,
): "before" | "after" | "into" {
  const ratio = (clientY - rect.top) / rect.height;
  if (isFolder) {
    if (ratio < 0.25) return "before";
    if (ratio > 0.75) return "after";
    return "into";
  }
  return ratio < 0.5 ? "before" : "after";
}
