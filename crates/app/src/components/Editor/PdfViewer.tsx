import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { TextLayer } from "pdfjs-dist";
import { getAPI } from "../../api/bridge";
import { useTabStore } from "../../stores/tabStore";
import { useEditorStore } from "../../stores/editorStore";
import { log } from "../../utils/logger";
import { ZoomIn, ZoomOut, FileOutput } from "lucide-react";

// Configure pdf.js worker using Vite's ?url import for static asset URL
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const PAGE_GAP = 12;
const CONTAINER_PADDING = 24;
const RENDER_BUFFER = 2; // render pages within this many pages of the viewport

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

  const pageInputRef = useRef<HTMLInputElement>(null);

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

        // Store natural page width — fitScale computed after pages mount
        const firstPage = await doc.getPage(1);
        const naturalViewport = firstPage.getViewport({ scale: 1.0 });
        naturalWidthRef.current = naturalViewport.width;

        const pageList: PageInfo[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          pageList.push({ pageNum: i, rendered: false });
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
        const scale = fitScale * userZoom;
        const viewport = page.getViewport({ scale });

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

        // Render text layer
        textDiv.replaceChildren();
        textDiv.style.width = `${viewport.width}px`;
        textDiv.style.height = `${viewport.height}px`;

        const textContent = await page.getTextContent();
        const textLayer = new TextLayer({
          textContentSource: textContent,
          container: textDiv,
          viewport,
        });
        await textLayer.render();

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

  // Render pages near the viewport
  const renderVisiblePages = useCallback(() => {
    const current = currentPage;
    const start = Math.max(1, current - RENDER_BUFFER);
    const end = Math.min(numPages, current + RENDER_BUFFER);
    for (let i = start; i <= end; i++) {
      renderPage(i);
    }
  }, [currentPage, numPages, renderPage]);

  // Set up placeholder sizes and render initial pages after load
  useEffect(() => {
    if (numPages === 0 || !pdfDocRef.current) return;

    let cancelled = false;

    async function setupPages() {
      const doc = pdfDocRef.current;
      if (!doc || cancelled) return;

      // Compute fit-to-width from actual container width (scrollbar present)
      if (naturalWidthRef.current > 0 && scrollContainerRef.current) {
        const availableWidth =
          scrollContainerRef.current.clientWidth - CONTAINER_PADDING * 2;
        const newFit = availableWidth / naturalWidthRef.current;
        if (Math.abs(newFit - fitScale) > 0.001) {
          setFitScale(newFit);
          return; // will re-run with updated fitScale
        }
      }

      // Set placeholder dimensions for all pages using the fit scale
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        if (cancelled) return;
        const scale = fitScale * userZoom;
        const viewport = page.getViewport({ scale });
        const container = pageRefsMap.current.get(i);
        if (container) {
          container.style.width = `${viewport.width}px`;
          container.style.height = `${viewport.height}px`;
        }
      }

      // Render the first few pages
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
    // Clear rendered state so pages re-render at new scale
    renderedPages.current.clear();
    renderVisiblePages();
  }, [userZoom, numPages, renderVisiblePages]);

  // IntersectionObserver to track current page during scroll
  useEffect(() => {
    if (numPages === 0) return;

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the most visible page
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

    // Observe all page containers
    for (const [, el] of pageRefsMap.current) {
      observerRef.current.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [numPages, pages]);

  // Render pages as user scrolls to them
  useEffect(() => {
    if (numPages === 0) return;
    renderVisiblePages();
  }, [currentPage, numPages, renderVisiblePages]);

  // ResizeObserver to recalculate fit-to-width on container resize
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || numPages === 0 || !pdfDocRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (naturalWidthRef.current <= 0) return;

      const availableWidth = container.clientWidth - CONTAINER_PADDING * 2;
      const newFitScale = availableWidth / naturalWidthRef.current;

      if (Math.abs(newFitScale - fitScale) > 0.01) {
        renderedPages.current.clear();
        setFitScale(newFitScale);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [numPages, fitScale]);

  // Track text selection within the scroll container
  const checkSelection = useCallback(() => {
    const sel = window.getSelection();
    if (
      sel &&
      sel.toString().trim().length > 0 &&
      scrollContainerRef.current?.contains(sel.anchorNode)
    ) {
      setHasSelection(true);
    } else {
      setHasSelection(false);
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("mouseup", checkSelection);
    container.addEventListener("keyup", checkSelection);
    return () => {
      container.removeEventListener("mouseup", checkSelection);
      container.removeEventListener("keyup", checkSelection);
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

  // Copy selection to new note
  const copyToNote = useCallback(async () => {
    const sel = window.getSelection();
    if (
      !sel ||
      sel.toString().trim().length === 0 ||
      !scrollContainerRef.current?.contains(sel.anchorNode)
    ) {
      return;
    }

    const selectedText = sel.toString().trim();
    const fileName = path.split("/").pop() ?? path;
    const body = `${selectedText}\n\n> Source: [${fileName}](${path})`;

    await useEditorStore.getState().openUntitledTab();
    useEditorStore.getState().updateContent(body);

    log.info("pdf-viewer", "Copied selection to new note", {
      path,
      chars: selectedText.length,
    });
  }, [path]);

  // Ref callback for page containers
  const setPageRef = useCallback(
    (pageNum: number) => (el: HTMLDivElement | null) => {
      if (el) {
        pageRefsMap.current.set(pageNum, el);
      } else {
        pageRefsMap.current.delete(pageNum);
      }
    },
    [],
  );

  const setCanvasRef = useCallback(
    (pageNum: number) => (el: HTMLCanvasElement | null) => {
      if (el) {
        canvasRefsMap.current.set(pageNum, el);
      } else {
        canvasRefsMap.current.delete(pageNum);
      }
    },
    [],
  );

  const setTextLayerRef = useCallback(
    (pageNum: number) => (el: HTMLDivElement | null) => {
      if (el) {
        textLayerRefsMap.current.set(pageNum, el);
      } else {
        textLayerRefsMap.current.delete(pageNum);
      }
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

              <button
                className="pdf-toolbar-btn pdf-toolbar-btn--accent"
                onClick={copyToNote}
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
          {pages.map((p) => (
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
              <div
                ref={setTextLayerRef(p.pageNum)}
                className="pdf-text-layer"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
