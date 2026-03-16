import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { TextLayer } from "pdfjs-dist";
import { getAPI } from "../../api/bridge";
import type { PdfHighlight, HighlightRect } from "../../api/types";
import { useEditorStore } from "../../stores/editorStore";
import { log } from "../../utils/logger";
import {
  selectionToHighlightRects,
  getSelectionPageNum,
} from "../../utils/pdfCoords";
import { ZoomIn, ZoomOut, FileOutput, Highlighter, X } from "lucide-react";

// Configure pdf.js worker using Vite's ?url import for static asset URL
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const CONTAINER_PADDING = 24;
const RENDER_BUFFER = 2;

const HIGHLIGHT_COLORS = [
  { name: "Yellow", hex: "#FBBF24" },
  { name: "Green", hex: "#34D399" },
  { name: "Blue", hex: "#60A5FA" },
  { name: "Pink", hex: "#F472B6" },
  { name: "Red", hex: "#F87171" },
];

interface SelectionSnapshot {
  text: string;
  pageNum: number;
  rects: HighlightRect[];
}

interface PdfViewerProps {
  path: string;
}

interface PageInfo {
  pageNum: number;
  rendered: boolean;
}

export function PdfViewer({ path }: PdfViewerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefsMap = useRef<Map<number, HTMLDivElement>>(new Map());
  const canvasRefsMap = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const textLayerRefsMap = useRef<Map<number, HTMLDivElement>>(new Map());
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const renderingPages = useRef<Set<number>>(new Set());
  const renderedPages = useRef<Set<number>>(new Set());
  const textLayerMutex = useRef<Promise<void>>(Promise.resolve());
  const renderGeneration = useRef(0);
  const naturalWidthRef = useRef(0);
  const [fitScale, setFitScale] = useState(1.0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [userZoom, setUserZoom] = useState(1.0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSelection, setHasSelection] = useState(false);
  const [pages, setPages] = useState<PageInfo[]>([]);

  // Highlight state
  const [highlights, setHighlights] = useState<PdfHighlight[]>([]);
  const [activeColor, setActiveColor] = useState(HIGHLIGHT_COLORS[0].hex);
  const [hoveredHighlightId, setHoveredHighlightId] = useState<string | null>(
    null,
  );

  const selectionSnapshotRef = useRef<SelectionSnapshot | null>(null);
  const selectionRafId = useRef(0);
  const pageInputRef = useRef<HTMLInputElement>(null);
  const scale = fitScale * userZoom;

  // Load PDF on mount
  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      setLoading(true);
      setError(null);

      try {
        const api = await getAPI();
        const meta = await api.resolvePdfPath(path);

        let url: string;
        if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
          const { convertFileSrc } = await import("@tauri-apps/api/core");
          url = convertFileSrc(meta.absolute_path);
        } else {
          url = meta.absolute_path;
        }

        const loadingTask = pdfjsLib.getDocument({ url });
        const doc = await loadingTask.promise;

        if (cancelled) {
          doc.destroy();
          return;
        }

        pdfDocRef.current = doc;

        const firstPage = await doc.getPage(1);
        const naturalViewport = firstPage.getViewport({ scale: 1.0 });
        naturalWidthRef.current = naturalViewport.width;

        const pageList: PageInfo[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          pageList.push({ pageNum: i, rendered: false });
        }

        // Load existing highlights
        const saved = await api.loadPdfHighlights(path);
        if (!cancelled) {
          setHighlights(saved);
        }

        setPages(pageList);
        setNumPages(doc.numPages);
        setCurrentPage(1);
        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : String(e);
          log.error("pdf-viewer", "Failed to load PDF", { path, error: msg });
          setError(msg);
          setLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
        pdfDocRef.current = null;
      }
      renderedPages.current.clear();
      renderingPages.current.clear();
    };
  }, [path]);

  // Render a single page
  const renderPage = useCallback(
    async (pageNum: number) => {
      const doc = pdfDocRef.current;
      if (!doc) return;
      if (renderingPages.current.has(pageNum)) return;
      if (renderedPages.current.has(pageNum)) return;

      renderingPages.current.add(pageNum);

      try {
        const page: PDFPageProxy = await doc.getPage(pageNum);
        const renderScale = fitScale * userZoom;
        const viewport = page.getViewport({ scale: renderScale });

        const canvas = canvasRefsMap.current.get(pageNum);
        const textDiv = textLayerRefsMap.current.get(pageNum);
        if (!canvas || !textDiv) {
          renderingPages.current.delete(pageNum);
          return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          renderingPages.current.delete(pageNum);
          return;
        }

        const dpr = window.devicePixelRatio || 1;
        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        await page.render({ canvasContext: ctx, viewport }).promise;

        // Set --scale-factor CSS variable BEFORE rendering the text layer.
        // pdf.js uses this for all span font-size and positioning calculations.
        textDiv.style.setProperty("--scale-factor", String(renderScale));

        // Serialize text layer rendering to prevent measureText race conditions
        // when multiple pages render concurrently (they share an internal canvas).
        // The .catch() ensures a failed render doesn't permanently block the chain.
        // Generation counter skips stale callbacks after zoom changes.
        const capturedPageNum = pageNum;
        const gen = renderGeneration.current;
        textLayerMutex.current = textLayerMutex.current.then(async () => {
          if (gen !== renderGeneration.current) return;
          const div = textLayerRefsMap.current.get(capturedPageNum);
          if (!div || !div.isConnected) return;
          div.replaceChildren();
          const textContent = await page.getTextContent();
          const tl = new TextLayer({
            textContentSource: textContent,
            container: div,
            viewport,
          });
          await tl.render();
        }).catch((err) => {
          log.error("pdf-viewer", "Text layer render failed", {
            page: capturedPageNum,
            error: err instanceof Error ? err.message : String(err),
          });
        });
        await textLayerMutex.current;

        renderedPages.current.add(pageNum);
      } catch (e) {
        log.error("pdf-viewer", "Failed to render page", {
          page: pageNum,
          error: e instanceof Error ? e.message : String(e),
        });
      }

      renderingPages.current.delete(pageNum);
    },
    [userZoom, fitScale],
  );

  const renderVisiblePages = useCallback(() => {
    const current = currentPage;
    const start = Math.max(1, current - RENDER_BUFFER);
    const end = Math.min(numPages, current + RENDER_BUFFER);
    for (let i = start; i <= end; i++) {
      renderPage(i);
    }
  }, [currentPage, numPages, renderPage]);

  // Set up placeholder sizes and render initial pages
  useEffect(() => {
    if (numPages === 0 || !pdfDocRef.current) return;

    let cancelled = false;

    async function setupPages() {
      const doc = pdfDocRef.current;
      if (!doc || cancelled) return;

      if (naturalWidthRef.current > 0 && scrollContainerRef.current) {
        const availableWidth =
          scrollContainerRef.current.clientWidth - CONTAINER_PADDING * 2;
        const newFit = availableWidth / naturalWidthRef.current;
        if (Math.abs(newFit - fitScale) > 0.001) {
          setFitScale(newFit);
          return;
        }
      }

      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        if (cancelled) return;
        const s = fitScale * userZoom;
        const viewport = page.getViewport({ scale: s });
        const container = pageRefsMap.current.get(i);
        if (container) {
          container.style.width = `${viewport.width}px`;
          container.style.height = `${viewport.height}px`;
        }
      }

      if (!cancelled) {
        renderVisiblePages();
      }
    }

    setupPages();

    return () => {
      cancelled = true;
    };
  }, [numPages, userZoom, fitScale, renderVisiblePages]);

  // Re-render all when zoom changes
  useEffect(() => {
    if (numPages === 0) return;
    renderGeneration.current += 1;
    renderedPages.current.clear();
    renderVisiblePages();
  }, [userZoom, numPages, renderVisiblePages]);

  // IntersectionObserver
  useEffect(() => {
    if (numPages === 0) return;

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        let mostVisible: { pageNum: number; ratio: number } | null = null;
        for (const entry of entries) {
          const pageNum = parseInt(
            (entry.target as HTMLElement).dataset.page ?? "0",
            10,
          );
          if (
            pageNum > 0 &&
            (!mostVisible || entry.intersectionRatio > mostVisible.ratio)
          ) {
            mostVisible = { pageNum, ratio: entry.intersectionRatio };
          }
        }
        if (mostVisible) {
          setCurrentPage(mostVisible.pageNum);
        }
      },
      {
        root: scrollContainer,
        threshold: [0, 0.25, 0.5, 0.75, 1.0],
      },
    );

    for (const [, el] of pageRefsMap.current) {
      observerRef.current.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [numPages, pages]);

  // Render pages as user scrolls
  useEffect(() => {
    if (numPages === 0) return;
    renderVisiblePages();
  }, [currentPage, numPages, renderVisiblePages]);

  // ResizeObserver
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || numPages === 0 || !pdfDocRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (naturalWidthRef.current <= 0) return;
      const availableWidth = container.clientWidth - CONTAINER_PADDING * 2;
      const newFitScale = availableWidth / naturalWidthRef.current;
      if (Math.abs(newFitScale - fitScale) > 0.01) {
        renderGeneration.current += 1;
        renderedPages.current.clear();
        setFitScale(newFitScale);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [numPages, fitScale]);

  // Track text selection — snapshot rects eagerly so they survive button clicks
  const checkSelection = useCallback(() => {
    const sel = window.getSelection();
    if (
      sel &&
      sel.toString().trim().length > 0 &&
      scrollContainerRef.current?.contains(sel.anchorNode)
    ) {
      const pageNum = getSelectionPageNum(sel);
      if (pageNum) {
        const pageContainer = pageRefsMap.current.get(pageNum);
        if (pageContainer) {
          const rects = selectionToHighlightRects(sel, pageContainer, scale);
          if (rects.length > 0) {
            selectionSnapshotRef.current = {
              text: sel.toString().trim(),
              pageNum,
              rects,
            };
            setHasSelection(true);
            return;
          }
        }
      }
    }
    selectionSnapshotRef.current = null;
    setHasSelection(false);
  }, [scale]);

  useEffect(() => {
    const throttled = () => {
      cancelAnimationFrame(selectionRafId.current);
      selectionRafId.current = requestAnimationFrame(checkSelection);
    };
    document.addEventListener("selectionchange", throttled);
    return () => {
      document.removeEventListener("selectionchange", throttled);
      cancelAnimationFrame(selectionRafId.current);
    };
  }, [checkSelection]);

  // Jump to page
  const goToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(1, Math.min(page, numPages));
      const el = pageRefsMap.current.get(clamped);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [numPages],
  );

  const handlePageInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const val = parseInt(pageInputRef.current?.value ?? "", 10);
        if (!isNaN(val)) goToPage(val);
      }
    },
    [goToPage],
  );

  // Zoom
  const zoomIn = useCallback(() => {
    setUserZoom((z) => Math.min(z + 0.25, 4.0));
    renderedPages.current.clear();
  }, []);

  const zoomOut = useCallback(() => {
    setUserZoom((z) => Math.max(z - 0.25, 0.25));
    renderedPages.current.clear();
  }, []);

  // Copy selection to new note (uses snapshot for resilience)
  const copyToNote = useCallback(async () => {
    const snap = selectionSnapshotRef.current;
    if (!snap) return;

    const fileName = path.split("/").pop() ?? path;
    const body = `${snap.text}\n\n> Source: [${fileName}](${path})`;

    await useEditorStore.getState().openUntitledTab();
    useEditorStore.getState().updateContent(body);

    log.info("pdf-viewer", "Copied selection to new note", {
      path,
      chars: snap.text.length,
    });
  }, [path]);

  // Create highlight from the eagerly-captured selection snapshot
  const createHighlight = useCallback(async () => {
    const snap = selectionSnapshotRef.current;
    if (!snap) return;

    const highlight: PdfHighlight = {
      id: crypto.randomUUID(),
      page: snap.pageNum,
      rects: snap.rects,
      text: snap.text,
      color: activeColor,
      created_at: new Date().toISOString(),
    };

    let updated: PdfHighlight[] = [];
    setHighlights((prev) => {
      updated = [...prev, highlight];
      return updated;
    });

    // Persist
    try {
      const api = await getAPI();
      await api.savePdfHighlights(path, updated);
    } catch (e) {
      log.error("pdf-viewer", "Failed to save highlight", {
        error: e instanceof Error ? e.message : String(e),
      });
    }

    // Clear selection and snapshot
    window.getSelection()?.removeAllRanges();
    selectionSnapshotRef.current = null;
    setHasSelection(false);

    log.info("pdf-viewer", "Created highlight", {
      path,
      page: snap.pageNum,
      color: activeColor,
      chars: snap.text.length,
    });
  }, [path, activeColor]);

  // Delete highlight
  const deleteHighlight = useCallback(
    async (id: string) => {
      let updated: PdfHighlight[] = [];
      setHighlights((prev) => {
        updated = prev.filter((h) => h.id !== id);
        return updated;
      });
      setHoveredHighlightId(null);

      try {
        const api = await getAPI();
        await api.savePdfHighlights(path, updated);
      } catch (e) {
        log.error("pdf-viewer", "Failed to save highlights after delete", {
          error: e instanceof Error ? e.message : String(e),
        });
      }
    },
    [path],
  );

  // Ref callbacks
  const setPageRef = useCallback(
    (pageNum: number) => (el: HTMLDivElement | null) => {
      if (el) pageRefsMap.current.set(pageNum, el);
      else pageRefsMap.current.delete(pageNum);
    },
    [],
  );

  const setCanvasRef = useCallback(
    (pageNum: number) => (el: HTMLCanvasElement | null) => {
      if (el) canvasRefsMap.current.set(pageNum, el);
      else canvasRefsMap.current.delete(pageNum);
    },
    [],
  );

  const setTextLayerRef = useCallback(
    (pageNum: number) => (el: HTMLDivElement | null) => {
      if (el) textLayerRefsMap.current.set(pageNum, el);
      else textLayerRefsMap.current.delete(pageNum);
    },
    [],
  );

  const fileName = path.split("/").pop() ?? path;

  if (loading) {
    return (
      <div className="editor-panel-container">
        <div className="editor-panel">
          <div className="editor-hero">
            <h1 className="editor-hero-title">{fileName}</h1>
            <div className="meta-row">
              <span className="meta-source">{path}</span>
            </div>
          </div>
          <div
            className="editor-body"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.5,
            }}
          >
            Loading PDF...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="editor-panel-container">
        <div className="editor-panel">
          <div className="editor-hero">
            <h1 className="editor-hero-title">{fileName}</h1>
            <div className="meta-row">
              <span className="meta-source">{path}</span>
            </div>
          </div>
          <div
            className="editor-body"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.6,
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <span>Failed to load PDF</span>
            <span style={{ fontSize: "0.85em", color: "var(--text-tertiary)" }}>
              {error}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-panel-container">
      <div className="editor-panel">
        <div className="editor-hero">
          <div className="editor-hero-top">
            <div className="pdf-toolbar">
              {/* Page indicator */}
              <span className="pdf-toolbar-page-info">
                <input
                  ref={pageInputRef}
                  className="pdf-toolbar-page-input"
                  type="number"
                  defaultValue={currentPage}
                  key={currentPage}
                  min={1}
                  max={numPages}
                  onKeyDown={handlePageInputKeyDown}
                  onBlur={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) goToPage(val);
                  }}
                />
                <span className="pdf-toolbar-page-total">/ {numPages}</span>
              </span>

              <span className="pdf-toolbar-separator" />

              {/* Zoom */}
              <button
                className="pdf-toolbar-btn"
                onClick={zoomOut}
                disabled={userZoom <= 0.25}
                title="Zoom out"
              >
                <ZoomOut size={16} />
              </button>
              <span className="pdf-toolbar-zoom-label">
                {Math.round(userZoom * 100)}%
              </span>
              <button
                className="pdf-toolbar-btn"
                onClick={zoomIn}
                disabled={userZoom >= 4.0}
                title="Zoom in"
              >
                <ZoomIn size={16} />
              </button>

              <span className="pdf-toolbar-separator" />

              {/* Highlight color swatches */}
              <div className="pdf-color-swatches">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    className={`pdf-color-swatch${activeColor === c.hex ? " pdf-color-swatch--active" : ""}`}
                    style={{ backgroundColor: c.hex }}
                    onClick={() => setActiveColor(c.hex)}
                    onMouseDown={(e) => e.preventDefault()}
                    title={c.name}
                  />
                ))}
              </div>

              {/* Highlight button */}
              <button
                className="pdf-toolbar-btn pdf-toolbar-btn--accent"
                onClick={createHighlight}
                onMouseDown={(e) => e.preventDefault()}
                disabled={!hasSelection}
                title={
                  hasSelection
                    ? "Highlight selected text"
                    : "Select text in the PDF first"
                }
              >
                <Highlighter size={16} />
                <span>Highlight</span>
              </button>

              <span className="pdf-toolbar-separator" />

              {/* Copy to Note */}
              <button
                className="pdf-toolbar-btn"
                onClick={copyToNote}
                onMouseDown={(e) => e.preventDefault()}
                disabled={!hasSelection}
                title={
                  hasSelection
                    ? "Copy selected text to a new note"
                    : "Select text in the PDF first"
                }
              >
                <FileOutput size={16} />
                <span>Copy to Note</span>
              </button>
            </div>
          </div>
          <h1 className="editor-hero-title">{fileName}</h1>
          <div className="meta-row">
            <span className="meta-source">{path}</span>
          </div>
        </div>
        <div className="editor-body pdf-viewer-body" ref={scrollContainerRef}>
          {pages.map((p) => {
            const pageHighlights = highlights.filter(
              (h) => h.page === p.pageNum,
            );
            return (
              <div
                key={p.pageNum}
                ref={setPageRef(p.pageNum)}
                className="pdf-page-container"
                data-page={p.pageNum}
              >
                <canvas
                  ref={setCanvasRef(p.pageNum)}
                  className="pdf-canvas"
                />
                {/* Highlight overlay — between canvas and text layer */}
                {pageHighlights.length > 0 && (
                  <div className="pdf-highlight-layer">
                    {pageHighlights.map((h) =>
                      h.rects.map((r, i) => (
                        <div
                          key={`${h.id}-${i}`}
                          className={`pdf-highlight-rect${hoveredHighlightId === h.id ? " pdf-highlight-rect--hovered" : ""}`}
                          style={{
                            left: r.x * scale,
                            top: r.y * scale,
                            width: r.w * scale,
                            height: r.h * scale,
                            backgroundColor: h.color,
                          }}
                          data-highlight-id={h.id}
                          onMouseEnter={() => setHoveredHighlightId(h.id)}
                          onMouseLeave={() => setHoveredHighlightId(null)}
                        >
                          {/* Show delete button on the first rect of hovered highlight */}
                          {i === 0 && hoveredHighlightId === h.id && (
                            <button
                              className="pdf-highlight-delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteHighlight(h.id);
                              }}
                              title="Remove highlight"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      )),
                    )}
                  </div>
                )}
                <div
                  ref={setTextLayerRef(p.pageNum)}
                  className="textLayer"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
