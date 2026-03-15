/**
 * Pure utility functions for file tree rename.
 * No React or store dependencies.
 */

/**
 * Compute the new path when renaming a file or folder.
 * - Folders: no extension appended
 * - BrainMap notes (.md): appends .md, strips if user already typed it
 * - Plain files: preserves original extension from oldPath
 */
export function computeRenamePath(
  oldPath: string,
  newName: string,
  isFolder: boolean,
): string {
  const parts = oldPath.split("/");

  if (isFolder) {
    parts[parts.length - 1] = newName;
  } else if (oldPath.endsWith(".md")) {
    // BrainMap note — ensure .md extension, strip double .md
    const stem = newName.endsWith(".md") ? newName.slice(0, -3) : newName;
    parts[parts.length - 1] = stem + ".md";
  } else {
    // Plain file — preserve original extension
    const oldName = parts[parts.length - 1];
    const dotIdx = oldName.lastIndexOf(".");
    const ext = dotIdx >= 0 ? oldName.slice(dotIdx) : "";
    parts[parts.length - 1] = newName + ext;
  }

  return parts.join("/");
}

/**
 * Validate a rename name. Returns error message or null if valid.
 * Returns null for no-op (same name) — caller should treat as cancel.
 */
export function validateRenameName(
  name: string,
  oldPath: string,
  isFolder: boolean,
  existingPaths: Set<string>,
): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Name cannot be empty";
  if (trimmed.includes("/") || trimmed.includes("\\"))
    return "Name cannot contain path separators";
  if (trimmed.startsWith(".")) return "Name cannot start with a dot";

  const newPath = computeRenamePath(oldPath, trimmed, isFolder);
  if (newPath === oldPath) return null; // no-op
  if (existingPaths.has(newPath)) return "A file with this name already exists";

  return null;
}
