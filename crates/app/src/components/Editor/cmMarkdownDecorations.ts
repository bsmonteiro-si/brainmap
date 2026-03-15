/**
 * CodeMirror 6 extension that decorates markdown elements in the editor:
 * - Horizontal rules (cursor-aware)
 * - Blockquotes (left border + tint)
 * - Fenced code blocks (background + border)
 * - Inline code (background pill via tree walk)
 * - Image URL dimming (cursor-aware)
 * - Link markup dimming (cursor-aware)
 */
import {
  EditorView,
  Decoration,
  WidgetType,
  type DecorationSet,
} from "@codemirror/view";
import { RangeSetBuilder, StateField, type Text, type Extension } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import type { EditorState } from "@codemirror/state";

// ---------------------------------------------------------------------------
// Shared utility: scan fenced code blocks
// ---------------------------------------------------------------------------
export interface FencedBlock {
  /** Line number of opening fence */
  startLine: number;
  /** Line number of closing fence (or last doc line if unclosed) */
  endLine: number;
}

const FENCE_OPEN_RE = /^(`{3,}|~{3,})/;

/**
 * Scan document for fenced code block ranges.
 * Returns array of { startLine, endLine } (1-based line numbers).
 */
export function scanFencedBlocks(doc: Text): FencedBlock[] {
  const blocks: FencedBlock[] = [];
  let inFence = false;
  let fenceChar = "";
  let fenceLen = 0;
  let startLine = 0;

  for (let i = 1; i <= doc.lines; i++) {
    const text = doc.line(i).text;
    const fenceMatch = text.match(FENCE_OPEN_RE);

    if (fenceMatch) {
      if (!inFence) {
        inFence = true;
        fenceChar = fenceMatch[1][0];
        fenceLen = fenceMatch[1].length;
        startLine = i;
      } else {
        // Closing fence must use same char and at least same length
        const trimmed = text.trimEnd();
        if (
          trimmed[0] === fenceChar &&
          trimmed.length >= fenceLen &&
          trimmed === fenceChar.repeat(trimmed.length)
        ) {
          blocks.push({ startLine, endLine: i });
          inFence = false;
          fenceChar = "";
          fenceLen = 0;
        }
      }
    }
  }

  // Unclosed fence extends to document end
  if (inFence) {
    blocks.push({ startLine, endLine: doc.lines });
  }

  return blocks;
}

/**
 * Build a Set of line numbers that fall inside fenced code blocks.
 */
function fencedLineSet(blocks: FencedBlock[]): Set<number> {
  const set = new Set<number>();
  for (const b of blocks) {
    for (let ln = b.startLine; ln <= b.endLine; ln++) {
      set.add(ln);
    }
  }
  return set;
}

// ---------------------------------------------------------------------------
// Line classifiers
// ---------------------------------------------------------------------------
const HR_RE = /^(\*{3,}|-{3,}|_{3,})\s*$/;
const BLOCKQUOTE_RE = /^(\s*>)+/;

export interface LineClassification {
  hr: number[];               // line numbers that are HRs
  blockquote: number[];       // line numbers that are blockquotes
  fencedBlocks: FencedBlock[]; // fenced code block ranges
}

/**
 * Classify document lines (exported for testing).
 */
export function classifyLines(doc: Text): LineClassification {
  const fencedBlocks = scanFencedBlocks(doc);
  const fencedLines = fencedLineSet(fencedBlocks);
  const hr: number[] = [];
  const blockquote: number[] = [];

  for (let i = 1; i <= doc.lines; i++) {
    if (fencedLines.has(i)) continue;
    const text = doc.line(i).text;
    if (HR_RE.test(text)) {
      hr.push(i);
    } else if (BLOCKQUOTE_RE.test(text)) {
      blockquote.push(i);
    }
  }

  return { hr, blockquote, fencedBlocks };
}

// ---------------------------------------------------------------------------
// Table parsing
// ---------------------------------------------------------------------------
export type TableAlignment = "left" | "center" | "right";

export interface TableData {
  headerCells: string[];
  alignments: TableAlignment[];
  rows: string[][];
  sourceText: string;
}

function parseCells(line: string): string[] {
  // Split by unescaped |, handling \| as literal pipe
  const cells: string[] = [];
  let current = "";
  let escaped = false;
  for (const ch of line) {
    if (escaped) { current += ch; escaped = false; continue; }
    if (ch === "\\") { escaped = true; continue; }
    if (ch === "|") { cells.push(current.trim()); current = ""; continue; }
    current += ch;
  }
  cells.push(current.trim());
  // Remove empty first/last entries from leading/trailing pipes
  if (cells.length > 0 && cells[0] === "") cells.shift();
  if (cells.length > 0 && cells[cells.length - 1] === "") cells.pop();
  return cells;
}

function parseAlignment(cell: string): TableAlignment {
  const trimmed = cell.trim().replace(/\s/g, "");
  const left = trimmed.startsWith(":");
  const right = trimmed.endsWith(":");
  if (left && right) return "center";
  if (right) return "right";
  return "left";
}

export function parseMarkdownTable(lines: string[]): TableData | null {
  if (lines.length < 2) return null;
  const headerCells = parseCells(lines[0]);
  if (headerCells.length === 0) return null;

  // Parse and validate delimiter row
  const delimCells = parseCells(lines[1]);
  const DELIM_CELL_RE = /^:?-+:?$/;
  if (!delimCells.every((cell) => DELIM_CELL_RE.test(cell.trim()))) return null;
  const alignments: TableAlignment[] = delimCells.map(parseAlignment);
  // Pad alignments to match header column count
  while (alignments.length < headerCells.length) alignments.push("left");

  // Parse data rows
  const rows: string[][] = [];
  for (let i = 2; i < lines.length; i++) {
    const cells = parseCells(lines[i]);
    // Pad or trim to match column count
    while (cells.length < headerCells.length) cells.push("");
    if (cells.length > headerCells.length) cells.length = headerCells.length;
    rows.push(cells);
  }

  return { headerCells, alignments, rows, sourceText: lines.join("\n") };
}

// ---------------------------------------------------------------------------
// Table widget
// ---------------------------------------------------------------------------
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Render simple inline markdown (bold, italic, code) to HTML, with HTML escaping */
export function renderInlineMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

class TableWidget extends WidgetType {
  constructor(readonly data: TableData) {
    super();
  }

  eq(other: TableWidget): boolean {
    return this.data.sourceText === other.data.sourceText;
  }

  toDOM(): HTMLElement {
    const table = document.createElement("table");
    table.className = "cm-table-widget";

    // Header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    for (let i = 0; i < this.data.headerCells.length; i++) {
      const th = document.createElement("th");
      th.style.textAlign = this.data.alignments[i] || "left";
      th.innerHTML = renderInlineMarkdown(this.data.headerCells[i]);
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    if (this.data.rows.length > 0) {
      const tbody = document.createElement("tbody");
      for (const row of this.data.rows) {
        const tr = document.createElement("tr");
        for (let i = 0; i < row.length; i++) {
          const td = document.createElement("td");
          td.style.textAlign = this.data.alignments[i] || "left";
          td.innerHTML = renderInlineMarkdown(row[i]);
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
    }

    return table;
  }

  get estimatedHeight(): number {
    return (this.data.rows.length + 1) * 32;
  }

  ignoreEvent(): boolean {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Decoration builders
// ---------------------------------------------------------------------------
const hrLineDeco = Decoration.line({ class: "cm-hr-line" });
const bqLineDeco = Decoration.line({ class: "cm-blockquote-line" });
const fencedStartDeco = Decoration.line({ class: "cm-fenced-code cm-fenced-code-start" });
const fencedEndDeco = Decoration.line({ class: "cm-fenced-code cm-fenced-code-end" });
const fencedBodyDeco = Decoration.line({ class: "cm-fenced-code" });
const inlineCodeMark = Decoration.mark({ class: "cm-inline-code" });
const imageUrlMark = Decoration.mark({ class: "cm-image-url" });
const linkDimMark = Decoration.mark({ class: "cm-link-dim" });
const tableHeaderDeco = Decoration.line({ class: "cm-table-line cm-table-header" });
const tableDelimDeco = Decoration.line({ class: "cm-table-line cm-table-delimiter" });
const tableRowDeco = Decoration.line({ class: "cm-table-line cm-table-row" });
const tableRowEvenDeco = Decoration.line({ class: "cm-table-line cm-table-row cm-table-row-even" });

function buildDecorations(state: EditorState, cls: LineClassification, cursorLine: number): DecorationSet {
  const doc = state.doc;
  const builder = new RangeSetBuilder<Decoration>();

  // We need to collect all decorations and sort by position since
  // line decos, mark decos from tree walk must be in document order.
  const decos: { from: number; to: number; deco: Decoration }[] = [];

  // Horizontal rules (cursor-aware)
  for (const ln of cls.hr) {
    if (ln === cursorLine) continue;
    const line = doc.line(ln);
    decos.push({ from: line.from, to: line.from, deco: hrLineDeco });
  }

  // Blockquotes (not cursor-aware)
  for (const ln of cls.blockquote) {
    const line = doc.line(ln);
    decos.push({ from: line.from, to: line.from, deco: bqLineDeco });
  }

  // Fenced code blocks (not cursor-aware)
  for (const block of cls.fencedBlocks) {
    for (let ln = block.startLine; ln <= block.endLine; ln++) {
      const line = doc.line(ln);
      if (ln === block.startLine) {
        decos.push({ from: line.from, to: line.from, deco: fencedStartDeco });
      } else if (ln === block.endLine) {
        decos.push({ from: line.from, to: line.from, deco: fencedEndDeco });
      } else {
        decos.push({ from: line.from, to: line.from, deco: fencedBodyDeco });
      }
    }
  }

  // Tree walk for inline elements
  const tree = syntaxTree(state);
  tree.iterate({
    enter(node) {
      // Inline code — background pill
      if (node.name === "InlineCode") {
        decos.push({ from: node.from, to: node.to, deco: inlineCodeMark });
        return false; // don't descend
      }

      // Image — dim URL portion (cursor-aware)
      if (node.name === "Image") {
        const imgLine = doc.lineAt(node.from).number;
        if (imgLine !== cursorLine) {
          // Find the URL part: everything from the `(` after `]` to closing `)`
          const text = state.sliceDoc(node.from, node.to);
          const parenStart = text.indexOf("](");
          if (parenStart >= 0) {
            const urlFrom = node.from + parenStart + 1; // the `(`
            decos.push({ from: urlFrom, to: node.to, deco: imageUrlMark });
          }
        }
        return false;
      }

      // Table — rendered widget when cursor outside, line decos when inside
      if (node.name === "Table") {
        const tableStartLine = doc.lineAt(node.from).number;
        const tableEndLine = doc.lineAt(node.to).number;
        const cursorInTable = cursorLine >= tableStartLine && cursorLine <= tableEndLine;

        if (cursorInTable) {
          // Cursor inside table: show raw markdown with line decorations
          let rowIndex = 0;
          const tableNode = node.node;
          for (let child = tableNode.firstChild; child; child = child.nextSibling) {
            const line = doc.lineAt(child.from);
            if (child.name === "TableHeader") {
              decos.push({ from: line.from, to: line.from, deco: tableHeaderDeco });
            } else if (child.name === "TableDelimiter") {
              decos.push({ from: line.from, to: line.from, deco: tableDelimDeco });
            } else if (child.name === "TableRow") {
              decos.push({ from: line.from, to: line.from, deco: rowIndex % 2 === 1 ? tableRowEvenDeco : tableRowDeco });
              rowIndex++;
            }
          }
        } else {
          // Cursor outside table: replace with rendered HTML table widget
          const lines: string[] = [];
          for (let ln = tableStartLine; ln <= tableEndLine; ln++) {
            lines.push(doc.line(ln).text);
          }
          const tableData = parseMarkdownTable(lines);
          if (tableData) {
            decos.push({
              from: doc.line(tableStartLine).from,
              to: doc.line(tableEndLine).to,
              deco: Decoration.replace({ widget: new TableWidget(tableData), block: true }),
            });
          }
        }
        return false;
      }

      // Link — dim brackets and URL (cursor-aware)
      if (node.name === "Link") {
        const linkLine = doc.lineAt(node.from).number;
        if (linkLine !== cursorLine) {
          const text = state.sliceDoc(node.from, node.to);
          // Dim opening [
          decos.push({ from: node.from, to: node.from + 1, deco: linkDimMark });
          // Find ]( boundary
          const closeBracket = text.indexOf("](");
          if (closeBracket >= 0) {
            // Dim from ] to end )
            const dimFrom = node.from + closeBracket;
            decos.push({ from: dimFrom, to: node.to, deco: linkDimMark });
          }
        }
        return false;
      }
    },
  });

  // Sort by from position, then by to (line decos first since to === from)
  decos.sort((a, b) => a.from - b.from || a.to - b.to);

  for (const d of decos) {
    builder.add(d.from, d.to, d.deco);
  }

  return builder.finish();
}

// ---------------------------------------------------------------------------
// StateField
// ---------------------------------------------------------------------------
const markdownDecoField = StateField.define<{ cursorLine: number; cls: LineClassification; decos: DecorationSet }>({
  create(state) {
    const cursorLine = state.doc.lineAt(state.selection.main.head).number;
    const cls = classifyLines(state.doc);
    return { cursorLine, cls, decos: buildDecorations(state, cls, cursorLine) };
  },
  update(value, tr) {
    const cursorLine = tr.state.doc.lineAt(tr.state.selection.main.head).number;
    const docChanged = tr.docChanged;
    const lineChanged = cursorLine !== value.cursorLine;
    if (!docChanged && !lineChanged) return value;
    const cls = docChanged ? classifyLines(tr.state.doc) : value.cls;
    return { cursorLine, cls, decos: buildDecorations(tr.state, cls, cursorLine) };
  },
  provide: (f) => EditorView.decorations.from(f, (v) => v.decos),
});

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
export function markdownDecorations(): Extension {
  return markdownDecoField;
}
