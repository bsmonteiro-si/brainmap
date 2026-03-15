import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { TextLayer } from "pdfjs-dist";
import { getAPI } from "../../api/bridge";
import { useTabStore } from "../../stores/tabStore";
import { useEditorStore } from "../../stores/editorStore";
import { log } from "../../utils/logger";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  FileOutput,
} from "lucide-react";

// Configure pdf.js worker using Vite's ?url import for static asset URL
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

interface PdfViewerProps {
  path: string;
}

export function PdfViewer({ path }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);

  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSelection, setHasSelection] = useState(false);

  const renderingRef = useRef(false);
  const pendingRenderRef = useRef<{ page: number; scale: number } | null>(null);
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

        // Use Tauri's asset protocol to load PDF directly from disk
        let url: string;
        if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
          const { convertFileSrc } = await import("@tauri-apps/api/core");
          url = convertFileSrc(meta.absolute_path);
        } else {
          // Mock/dev fallback
          url = meta.absolute_path;
        }

        const loadingTask = pdfjsLib.getDocument({ url });
        const doc = await loadingTask.promise;

        if (cancelled) {
          doc.destroy();
          return;
        }

        pdfDocRef.current = doc;
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
    };
  }, [path]);

  // Render current page
  useEffect(() => {
    if (!pdfDocRef.current || numPages === 0) return;

    // If a render is in progress, queue this one for when it finishes
    if (renderingRef.current) {
      pendingRenderRef.current = { page: currentPage, scale };
      return;
    }

    let cancelled = false;
    renderingRef.current = true;

    async function renderPage(pageNum: number, pageScale: number) {
      const doc = pdfDocRef.current;
      if (!doc || cancelled) {
        renderingRef.current = false;
        return;
      }

      try {
        const page: PDFPageProxy = await doc.getPage(pageNum);
        if (cancelled) {
          renderingRef.current = false;
          return;
        }

        const viewport = page.getViewport({ scale: pageScale });
        const canvas = canvasRef.current;
        const textDiv = textLayerRef.current;
        if (!canvas || !textDiv) {
          renderingRef.current = false;
          return;
        }

        // Render canvas
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          renderingRef.current = false;
          return;
        }
        const dpr = window.devicePixelRatio || 1;
        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        await page.render({ canvasContext: ctx, viewport }).promise;

        if (cancelled) {
          renderingRef.current = false;
          return;
        }

        // Render text layer for selection
        textDiv.replaceChildren();
        textDiv.style.width = `${viewport.width}px`;
        textDiv.style.height = `${viewport.height}px`;

        const textContent = await page.getTextContent();
        if (cancelled) {
          renderingRef.current = false;
          return;
        }

        const textLayer = new TextLayer({
          textContentSource: textContent,
          container: textDiv,
          viewport,
        });
        await textLayer.render();
      } catch (e) {
        if (!cancelled) {
          log.error("pdf-viewer", "Failed to render page", {
            page: pageNum,
            error: e instanceof Error ? e.message : String(e),
          });
        }
      }

      renderingRef.current = false;

      // Process any queued render request
      const pending = pendingRenderRef.current;
      if (pending && !cancelled) {
        pendingRenderRef.current = null;
        renderPage(pending.page, pending.scale);
      }
    }

    renderPage(currentPage, scale);

    return () => {
      cancelled = true;
    };
  }, [currentPage, scale, numPages]);

  // Track text selection within the PDF container
  const checkSelection = useCallback(() => {
    const sel = window.getSelection();
    if (
      sel &&
      sel.toString().trim().length > 0 &&
      containerRef.current?.contains(sel.anchorNode)
    ) {
      setHasSelection(true);
    } else {
      setHasSelection(false);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("mouseup", checkSelection);
    container.addEventListener("keyup", checkSelection);
    return () => {
      container.removeEventListener("mouseup", checkSelection);
      container.removeEventListener("keyup", checkSelection);
    };
  }, [checkSelection]);

  // Page navigation
  const goToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(1, Math.min(page, numPages));
      setCurrentPage(clamped);
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
  const zoomIn = useCallback(
    () => setScale((s) => Math.min(s + 0.25, 4.0)),
    [],
  );
  const zoomOut = useCallback(
    () => setScale((s) => Math.max(s - 0.25, 0.25)),
    [],
  );

  // Copy selection to new note
  const copyToNote = useCallback(async () => {
    const sel = window.getSelection();
    if (
      !sel ||
      sel.toString().trim().length === 0 ||
      !containerRef.current?.contains(sel.anchorNode)
    ) {
      return;
    }

    const selectedText = sel.toString().trim();
    const fileName = path.split("/").pop() ?? path;
    const body = `${selectedText}\n\n> Source: [${fileName}](${path})`;

    // Create untitled tab and transition editorStore to untitled mode
    await useEditorStore.getState().openUntitledTab();
    // Pre-fill the body after the tab is ready
    useEditorStore.getState().updateContent(body);

    log.info("pdf-viewer", "Copied selection to new note", {
      path,
      chars: selectedText.length,
    });
  }, [path]);

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
            {/* PDF Toolbar */}
            <div className="pdf-toolbar">
              <button
                className="pdf-toolbar-btn"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                title="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
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
              <button
                className="pdf-toolbar-btn"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= numPages}
                title="Next page"
              >
                <ChevronRight size={16} />
              </button>

              <span className="pdf-toolbar-separator" />

              <button
                className="pdf-toolbar-btn"
                onClick={zoomOut}
                disabled={scale <= 0.25}
                title="Zoom out"
              >
                <ZoomOut size={16} />
              </button>
              <span className="pdf-toolbar-zoom-label">
                {Math.round(scale * 100)}%
              </span>
              <button
                className="pdf-toolbar-btn"
                onClick={zoomIn}
                disabled={scale >= 4.0}
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
        <div className="editor-body pdf-viewer-body" ref={containerRef}>
          <div className="pdf-page-container">
            <canvas ref={canvasRef} className="pdf-canvas" />
            <div ref={textLayerRef} className="pdf-text-layer" />
          </div>
        </div>
      </div>
    </div>
  );
}
