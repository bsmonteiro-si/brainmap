/**
 * Resolve a relative link target against the current note's directory
 * to produce a workspace-relative path.
 *
 * Examples:
 *   resolveNotePath("People/Judea Pearl.md", "./Francis Galton.md")
 *     => "People/Francis Galton.md"
 *   resolveNotePath("Questions/Q1.md", "../People/Karl Pearson.md")
 *     => "People/Karl Pearson.md"
 */
export function resolveNotePath(
  currentNotePath: string,
  linkTarget: string,
): string {
  // Decode URL-encoded characters (e.g., %20 → space)
  let decoded: string;
  try {
    decoded = decodeURIComponent(linkTarget);
  } catch {
    decoded = linkTarget;
  }

  // Extract the directory of the current note
  const slashIdx = currentNotePath.lastIndexOf("/");
  const dir = slashIdx >= 0 ? currentNotePath.slice(0, slashIdx) : "";

  // Join directory with the link target
  const joined = dir ? `${dir}/${decoded}` : decoded;

  // Normalize: resolve . and .. segments
  const parts = joined.split("/");
  const resolved: string[] = [];
  for (const part of parts) {
    if (part === "." || part === "") continue;
    if (part === "..") {
      resolved.pop();
    } else {
      resolved.push(part);
    }
  }
  return resolved.join("/");
}

/** Returns true if the href looks like a local note link (not a URL). */
export function isLocalNoteLink(href: string): boolean {
  // Fragment-only links (e.g., #section) are not note links
  if (href.startsWith("#")) return false;
  // Has a scheme (http:, https:, mailto:, etc.) → not local
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return false;
  if (href.endsWith(".md")) return true;
  // No file extension → assume note reference (wiki-style link)
  const lastSegment = href.split("/").pop() ?? "";
  return !lastSegment.includes(".");
}

/** Append .md if the path doesn't already have it. */
export function ensureMdExtension(path: string): string {
  return path.endsWith(".md") ? path : `${path}.md`;
}
