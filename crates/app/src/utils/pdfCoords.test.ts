import { describe, it, expect } from "vitest";
import { selectionToHighlightRects, getSelectionPageNum } from "./pdfCoords";

describe("selectionToHighlightRects", () => {
  it("returns empty array for selection with no ranges", () => {
    const sel = { rangeCount: 0 } as unknown as Selection;
    const container = document.createElement("div");
    expect(selectionToHighlightRects(sel, container, 1.5)).toEqual([]);
  });

  it("converts client rects to viewport coords by dividing by scale", () => {
    const containerDiv = document.createElement("div");
    // Mock getBoundingClientRect on container
    containerDiv.getBoundingClientRect = () => ({
      left: 100, top: 200, right: 500, bottom: 800,
      width: 400, height: 600, x: 100, y: 200, toJSON: () => ({}),
    });

    const mockRange = {
      getClientRects: () => [
        { left: 150, top: 250, width: 200, height: 20, right: 350, bottom: 270, x: 150, y: 250, toJSON: () => ({}) },
      ] as unknown as DOMRectList,
    };

    const sel = {
      rangeCount: 1,
      getRangeAt: () => mockRange,
    } as unknown as Selection;

    const scale = 2.0;
    const result = selectionToHighlightRects(sel, containerDiv, scale);

    expect(result).toHaveLength(1);
    expect(result[0].x).toBeCloseTo(25);   // (150-100)/2
    expect(result[0].y).toBeCloseTo(25);   // (250-200)/2
    expect(result[0].w).toBeCloseTo(100);  // 200/2
    expect(result[0].h).toBeCloseTo(10);   // 20/2
  });

  it("skips tiny rects (artifacts)", () => {
    const containerDiv = document.createElement("div");
    containerDiv.getBoundingClientRect = () => ({
      left: 0, top: 0, right: 500, bottom: 500,
      width: 500, height: 500, x: 0, y: 0, toJSON: () => ({}),
    });

    const mockRange = {
      getClientRects: () => [
        { left: 10, top: 10, width: 0.5, height: 0.5, right: 10.5, bottom: 10.5, x: 10, y: 10, toJSON: () => ({}) },
        { left: 20, top: 20, width: 100, height: 15, right: 120, bottom: 35, x: 20, y: 20, toJSON: () => ({}) },
      ] as unknown as DOMRectList,
    };

    const sel = {
      rangeCount: 1,
      getRangeAt: () => mockRange,
    } as unknown as Selection;

    const result = selectionToHighlightRects(sel, containerDiv, 1.0);
    expect(result).toHaveLength(1); // tiny rect skipped
  });
});

describe("getSelectionPageNum", () => {
  it("returns null for selection with no anchor node", () => {
    const sel = { anchorNode: null } as unknown as Selection;
    expect(getSelectionPageNum(sel)).toBeNull();
  });

  it("extracts page number from data-page attribute", () => {
    const pageDiv = document.createElement("div");
    pageDiv.setAttribute("data-page", "3");
    const textSpan = document.createElement("span");
    pageDiv.appendChild(textSpan);
    const textNode = document.createTextNode("hello");
    textSpan.appendChild(textNode);

    const sel = { anchorNode: textNode } as unknown as Selection;
    expect(getSelectionPageNum(sel)).toBe(3);
  });

  it("returns null when no data-page ancestor exists", () => {
    const div = document.createElement("div");
    const textNode = document.createTextNode("hello");
    div.appendChild(textNode);

    const sel = { anchorNode: textNode } as unknown as Selection;
    expect(getSelectionPageNum(sel)).toBeNull();
  });
});
