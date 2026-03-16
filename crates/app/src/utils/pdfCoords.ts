import type { HighlightRect } from "../api/types";

/**
 * Convert a browser Selection's client rects to PDF viewport coordinates (scale=1).
 * The rects are relative to the page container and divided by the current render scale.
 */
export function selectionToHighlightRects(
  selection: Selection,
  pageContainer: HTMLElement,
  scale: number,
): HighlightRect[] {
  if (selection.rangeCount === 0) return [];

  const range = selection.getRangeAt(0);
  const clientRects = range.getClientRects();
  if (clientRects.length === 0) return [];

  const containerRect = pageContainer.getBoundingClientRect();
  const rects: HighlightRect[] = [];

  for (let i = 0; i < clientRects.length; i++) {
    const cr = clientRects[i];
    // Skip tiny rects (artifacts)
    if (cr.width < 1 || cr.height < 1) continue;

    rects.push({
      x: (cr.left - containerRect.left) / scale,
      y: (cr.top - containerRect.top) / scale,
      w: cr.width / scale,
      h: cr.height / scale,
    });
  }

  return rects;
}

/**
 * Find which page number a selection belongs to by walking up from the
 * selection's anchor node to find the nearest [data-page] container.
 */
export function getSelectionPageNum(selection: Selection): number | null {
  const node = selection.anchorNode;
  if (!node) return null;
  const el = node instanceof HTMLElement ? node : node.parentElement;
  const pageContainer = el?.closest("[data-page]");
  if (!pageContainer) return null;
  const pageNum = parseInt(pageContainer.getAttribute("data-page") ?? "", 10);
  return isNaN(pageNum) ? null : pageNum;
}
