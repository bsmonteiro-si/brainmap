/** Convert text to a kebab-case filename-safe slug. */
export function slugify(text: string): string {
  return text
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
