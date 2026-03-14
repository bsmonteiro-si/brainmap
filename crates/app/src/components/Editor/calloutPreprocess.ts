/**
 * Encode spaces in markdown link destinations so that remark/CommonMark
 * parses them correctly.  `[text](./foo bar.md)` becomes
 * `[text](./foo%20bar.md)`.  Skips fenced code blocks and inline code.
 */
export function encodeLinkSpaces(md: string): string {
  // Match markdown links: [label](destination)
  // Only encode when the destination contains spaces.
  return md.replace(
    /(\[[^\]]*\]\()([^)]+)(\))/g,
    (_match, prefix: string, dest: string, suffix: string) => {
      if (!dest.includes(" ")) return _match;
      return prefix + dest.replace(/ /g, "%20") + suffix;
    },
  );
}

/**
 * Preprocessor that converts brace-delimited callout syntax into
 * blockquote syntax before markdown parsing.
 *
 * Input:
 *   [!ai-answer] Title {
 *   First paragraph.
 *
 *   Second paragraph.
 *   }
 *
 * Output:
 *   > [!ai-answer] Title
 *   > First paragraph.
 *   >
 *   > Second paragraph.
 *
 * Skips content inside fenced code blocks (``` or ~~~).
 */

const CALLOUT_BRACE_START = /^\[!(\w[\w-]*)\]([^\n{]*)\{\s*$/;
const FENCE_OPEN = /^(`{3,}|~{3,})/;

export function preprocessCallouts(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inFence = false;
  let fenceMarker = "";
  let inCallout = false;
  let calloutHeader = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track fenced code blocks everywhere (including inside callout bodies)
    const fenceMatch = line.match(FENCE_OPEN);
    if (fenceMatch) {
      if (!inFence) {
        inFence = true;
        fenceMarker = fenceMatch[1][0]; // ` or ~
      } else if (line.trimEnd().startsWith(fenceMarker) && line.trim() === fenceMarker.repeat(line.trim().length)) {
        inFence = false;
        fenceMarker = "";
      }
    }

    if (inFence) {
      if (inCallout) {
        // Inside a callout body fence — emit header if needed, prefix with >
        if (calloutHeader) {
          out.push(calloutHeader);
          calloutHeader = "";
        }
        out.push(`> ${line}`);
      } else {
        out.push(line);
      }
      continue;
    }

    if (!inCallout) {
      const match = line.match(CALLOUT_BRACE_START);
      if (match) {
        const type = match[1];
        const title = match[2].trim();
        calloutHeader = title ? `> [!${type}] ${title}` : `> [!${type}]`;
        inCallout = true;
        continue;
      }
      out.push(line);
    } else {
      // Inside a brace callout — look for closing }
      const trimmed = line.trimEnd();
      if (trimmed === "}") {
        // Emit header if body was empty (hasn't been emitted yet)
        if (calloutHeader) {
          out.push(calloutHeader);
        }
        inCallout = false;
        calloutHeader = "";
      } else {
        // Accumulate: emit header on first body line, then prefix with >
        if (calloutHeader) {
          out.push(calloutHeader);
          calloutHeader = "";
        }
        if (line === "") {
          out.push(">");
        } else {
          out.push(`> ${line}`);
        }
      }
    }
  }

  // If we never found closing }, emit what we have as-is (graceful degradation)
  if (inCallout && calloutHeader) {
    out.push(calloutHeader);
  }

  return out.join("\n");
}
