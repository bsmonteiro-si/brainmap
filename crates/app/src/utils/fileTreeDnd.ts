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
