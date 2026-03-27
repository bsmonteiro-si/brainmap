/** Extract title (first non-empty line) and body (remainder) from text. */
export function extractTitleBody(text: string): { title: string; body: string } {
  const lines = text.split("\n");
  const firstNonEmpty = lines.findIndex((l) => l.trim().length > 0);
  if (firstNonEmpty === -1) return { title: "", body: "" };
  const title = lines[firstNonEmpty].trim();
  const rest = lines.slice(firstNonEmpty + 1).join("\n").trim();
  return { title, body: rest };
}
