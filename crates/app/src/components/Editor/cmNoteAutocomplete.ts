import type { CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import { useGraphStore } from "../../stores/graphStore";
import { useEditorStore } from "../../stores/editorStore";
import { relativePath } from "../../utils/resolveNotePath";

export interface NoteOption {
  label: string;
  detail: string;
  apply: string;
}

/**
 * Filter graph nodes by query, returning autocomplete options
 * with paths relative to the current note.
 * Exported for testing.
 */
export function filterNotes(
  nodes: Iterable<{ path: string; title: string; note_type: string }>,
  query: string,
  currentNotePath: string,
): NoteOption[] {
  const q = query.toLowerCase();
  const results: NoteOption[] = [];

  for (const n of nodes) {
    if (n.note_type === "folder") continue;
    if (n.path === currentNotePath) continue;
    if (q && !n.title.toLowerCase().includes(q) && !n.path.toLowerCase().includes(q)) continue;
    const relPath = relativePath(currentNotePath, n.path);
    results.push({ label: n.title, detail: n.path, apply: relPath });
    if (results.length >= 20) break;
  }

  return results;
}

/**
 * CompletionSource that triggers when typing inside a markdown link URL: `](`.
 * Shows note paths/titles for quick linking with relative paths.
 */
export function noteCompletionSource(context: CompletionContext): CompletionResult | null {
  const match = context.matchBefore(/\]\([^)]*$/);
  if (!match) return null;

  const urlStart = match.text.indexOf("(") + 1;
  const query = match.text.slice(urlStart);
  const nodes = useGraphStore.getState().nodes;
  const currentPath = useEditorStore.getState().activeNote?.path ?? "";
  const options = filterNotes(nodes.values(), query, currentPath);

  return { from: match.from + urlStart, options, filter: false };
}
