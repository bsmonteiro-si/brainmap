import type { NodeDto } from "../api/types";

/**
 * Scan nodes for an index-type note to use as the graph home/entrypoint.
 * Returns the note's path or null if no index note exists.
 * If multiple index notes exist, picks the first alphabetically (deterministic).
 */
export function autoDetectHomeNote(nodes: Map<string, NodeDto>): string | null {
  const indexNotes: string[] = [];
  for (const [path, node] of nodes) {
    if (node.note_type === "index") indexNotes.push(path);
  }
  if (indexNotes.length === 0) return null;
  if (indexNotes.length === 1) return indexNotes[0];
  return indexNotes.sort()[0];
}
