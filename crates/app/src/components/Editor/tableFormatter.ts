/**
 * Pure functions for formatting markdown tables with aligned columns.
 *
 * Formatting rules:
 * - Each column padded to the width of its widest cell
 * - Single space padding inside pipes: `| cell |`
 * - Delimiter row dashes match column width (preserving alignment colons)
 * - Escaped pipes (`\|`) handled correctly
 */

// ---------------------------------------------------------------------------
// Cell parsing (canonical location — also used by cmMarkdownDecorations.ts)
// ---------------------------------------------------------------------------
export function parseCells(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let escaped = false;
  for (const ch of line) {
    if (escaped) { current += ch; escaped = false; continue; }
    if (ch === "\\") { current += "\\"; escaped = true; continue; }
    if (ch === "|") { cells.push(current.trim()); current = ""; continue; }
    current += ch;
  }
  cells.push(current.trim());
  if (cells.length > 0 && cells[0] === "") cells.shift();
  if (cells.length > 0 && cells[cells.length - 1] === "") cells.pop();
  return cells;
}

export type Alignment = "left" | "center" | "right";

export function parseAlignment(cell: string): Alignment {
  const trimmed = cell.trim().replace(/\s/g, "");
  const left = trimmed.startsWith(":");
  const right = trimmed.endsWith(":");
  if (left && right) return "center";
  if (right) return "right";
  return "left";
}

export const DELIM_CELL_RE = /^:?-+:?$/;

/**
 * Format a single markdown table (array of lines) with aligned columns.
 * Returns the formatted lines, or the original lines if parsing fails.
 */
export function formatTable(lines: string[]): string[] {
  if (lines.length < 2) return lines;

  const headerCells = parseCells(lines[0]);
  if (headerCells.length === 0) return lines;

  const delimCells = parseCells(lines[1]);
  if (!delimCells.every((cell) => DELIM_CELL_RE.test(cell.trim()))) return lines;

  const alignments: Alignment[] = delimCells.map(parseAlignment);
  while (alignments.length < headerCells.length) alignments.push("left");

  // Parse all data rows
  const dataRows: string[][] = [];
  for (let i = 2; i < lines.length; i++) {
    const cells = parseCells(lines[i]);
    while (cells.length < headerCells.length) cells.push("");
    if (cells.length > headerCells.length) cells.length = headerCells.length;
    dataRows.push(cells);
  }

  // Compute max width per column (minimum 3 for delimiter dashes)
  const colCount = headerCells.length;
  const colWidths: number[] = [];
  for (let c = 0; c < colCount; c++) {
    let max = Math.max(3, headerCells[c].length);
    for (const row of dataRows) {
      max = Math.max(max, row[c].length);
    }
    colWidths.push(max);
  }

  // Build formatted lines
  const result: string[] = [];

  // Header
  result.push("| " + headerCells.map((cell, i) => cell.padEnd(colWidths[i])).join(" | ") + " |");

  // Delimiter
  const delimParts = colWidths.map((w, i) => {
    const align = alignments[i];
    if (align === "center") return ":" + "-".repeat(w - 2) + ":";
    if (align === "right") return "-".repeat(w - 1) + ":";
    return "-".repeat(w);
  });
  result.push("| " + delimParts.join(" | ") + " |");

  // Data rows
  for (const row of dataRows) {
    result.push("| " + row.map((cell, i) => {
      const align = alignments[i];
      if (align === "right") return cell.padStart(colWidths[i]);
      if (align === "center") {
        const totalPad = colWidths[i] - cell.length;
        const leftPad = Math.floor(totalPad / 2);
        const rightPad = totalPad - leftPad;
        return " ".repeat(leftPad) + cell + " ".repeat(rightPad);
      }
      return cell.padEnd(colWidths[i]);
    }).join(" | ") + " |");
  }

  return result;
}

/**
 * Check if a table (given as lines) is already properly formatted.
 */
export function isTableFormatted(lines: string[]): boolean {
  const formatted = formatTable(lines);
  if (formatted.length !== lines.length) return false;
  for (let i = 0; i < lines.length; i++) {
    if (formatted[i] !== lines[i]) return false;
  }
  return true;
}

const FENCE_OPEN_RE = /^(`{3,}|~{3,})/;

/**
 * Format all markdown tables in a document string.
 * Skips tables inside fenced code blocks.
 * Returns the document with all tables formatted.
 */
export function formatMarkdownTables(text: string): string {
  const lines = text.split("\n");
  const result: string[] = [];
  let i = 0;
  let inFence = false;
  let fenceChar = "";
  let fenceLen = 0;

  while (i < lines.length) {
    // Track fenced code blocks
    const fenceMatch = lines[i].match(FENCE_OPEN_RE);
    if (fenceMatch) {
      if (!inFence) {
        inFence = true;
        fenceChar = fenceMatch[1][0];
        fenceLen = fenceMatch[1].length;
      } else {
        const trimmed = lines[i].trimEnd();
        if (trimmed[0] === fenceChar && trimmed.length >= fenceLen && trimmed === fenceChar.repeat(trimmed.length)) {
          inFence = false;
          fenceChar = "";
          fenceLen = 0;
        }
      }
    }

    // Skip lines inside fenced code blocks
    if (inFence) {
      result.push(lines[i]);
      i++;
      continue;
    }

    // Detect table start: line that starts with | (after optional whitespace)
    if (lines[i].trimStart().startsWith("|")) {
      // Collect consecutive table lines
      const tableStart = i;
      while (i < lines.length && lines[i].trimStart().startsWith("|")) {
        i++;
      }
      const tableLines = lines.slice(tableStart, i);

      // Only format if it's a valid table (at least header + delimiter)
      if (tableLines.length >= 2) {
        const delimCells = parseCells(tableLines[1]);
        if (delimCells.every((cell) => DELIM_CELL_RE.test(cell.trim()))) {
          const formatted = formatTable(tableLines);
          result.push(...formatted);
          continue;
        }
      }
      // Not a valid table, keep as-is
      result.push(...tableLines);
    } else {
      result.push(lines[i]);
      i++;
    }
  }

  return result.join("\n");
}
