import { useState, useEffect, useRef, useCallback, useMemo, Component, createContext, useContext } from "react";
import type { ReactNode, ErrorInfo, MouseEvent as ReactMouseEvent } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  Panel,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  SelectionMode,
} from "@xyflow/react";
import type { OnConnect, ColorMode } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { getAPI } from "../../api/bridge";
import { useTabStore } from "../../stores/tabStore";
import { useUIStore } from "../../stores/uiStore";
import { log } from "../../utils/logger";
import { canvasToFlow, flowToCanvas } from "./canvasTranslation";
import type { JsonCanvas } from "./canvasTranslation";
import { StickyNote, FileText, FilePlus, Layers, ChevronDown, MousePointer2, Hand, Group } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { CANVAS_SHAPES } from "./canvasShapes";
import { useGraphStore } from "../../stores/graphStore";
import { CanvasFileNode, CanvasTextNode, CanvasLinkNode, CanvasGroupNode, CanvasEdge } from "./canvasNodes";

// ── Panel mode context ────────────────────────────────────────────────────────
// When true, file node clicks open notes in the editor panel (right side)
// instead of navigating away from the canvas.
export const CanvasPanelModeContext = createContext(false);
export function useCanvasPanelMode() { return useContext(CanvasPanelModeContext); }

// ── Error boundary ────────────────────────────────────────────────────────────

class CanvasErrorBoundary extends Component<{ children: ReactNode; path: string }, { error: string | null }> {
  state = { error: null as string | null };

  static getDerivedStateFromError(err: Error) {
    return { error: err.message || "Unknown error" };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    log.error("canvas", "component crashed", {
      error: err.message,
      stack: info.componentStack ?? "",
    });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="canvas-container">
          <div className="editor-placeholder" style={{ flexDirection: "column", gap: 8 }}>
            <div>Canvas editor crashed: {this.state.error}</div>
            <button
              className="editor-view-btn"
              onClick={() => {
                useTabStore.getState().closeTab(this.props.path);
                import("../../stores/editorStore").then(({ useEditorStore }) => {
                  useEditorStore.getState().openPlainFile(this.props.path);
                });
              }}
            >
              Open as Text
            </button>
            <button className="editor-view-btn" onClick={() => this.setState({ error: null })}>
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SAVE_DEBOUNCE_MS = 1500;

const NODE_TYPES = {
  canvasFile: CanvasFileNode,
  canvasText: CanvasTextNode,
  canvasLink: CanvasLinkNode,
  canvasGroup: CanvasGroupNode,
};

const EDGE_TYPES = {
  default: CanvasEdge,
};

// Module-level pending saves (same pattern as Excalidraw)
const pendingSaves = new Map<string, { nodes: unknown[]; edges: unknown[] }>();

// ── Inner component ───────────────────────────────────────────────────────────

export function CanvasEditorInner({ path }: { path: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interactionMode, setInteractionMode] = useState<"pan" | "select">("pan");

  const canvasTheme = useUIStore((s) => s.canvasTheme);
  const canvasShowDots = useUIStore((s) => s.canvasShowDots);
  const canvasDotOpacity = useUIStore((s) => s.canvasDotOpacity);
  const canvasArrowSize = useUIStore((s) => s.canvasArrowSize);
  const canvasEdgeWidth = useUIStore((s) => s.canvasEdgeWidth);
  const canvasCalloutTailSize = useUIStore((s) => s.canvasCalloutTailSize);
  const canvasStickyRotation = useUIStore((s) => s.canvasStickyRotation);
  const canvasStickyColor = useUIStore((s) => s.canvasStickyColor);
  const canvasStickyShadow = useUIStore((s) => s.canvasStickyShadow);
  const canvasStickyFoldSize = useUIStore((s) => s.canvasStickyFoldSize);
  const canvasStickyPin = useUIStore((s) => s.canvasStickyPin);
  const canvasStickyTape = useUIStore((s) => s.canvasStickyTape);
  const canvasStickyLines = useUIStore((s) => s.canvasStickyLines);
  const canvasStickyCurl = useUIStore((s) => s.canvasStickyCurl);
  const canvasStickyStripe = useUIStore((s) => s.canvasStickyStripe);
  const canvasRoundedRadius = useUIStore((s) => s.canvasRoundedRadius);
  const canvasGroupFontFamily = useUIStore((s) => s.canvasGroupFontFamily);
  const canvasGroupFontSize = useUIStore((s) => s.canvasGroupFontSize);
  const canvasSelectionColor = useUIStore((s) => s.canvasSelectionColor);
  const canvasSelectionWidth = useUIStore((s) => s.canvasSelectionWidth);
  const uiZoom = useUIStore((s) => s.uiZoom);
  const colorMode: ColorMode = canvasTheme;
  const containerClass = `canvas-container${canvasTheme === "light" ? " canvas-light" : ""}`;
  const shapeVars = {
    "--callout-tail": `${canvasCalloutTailSize}px`,
    "--callout-tail-inner": `${canvasCalloutTailSize - 1}px`,
    "--sticky-rotation": `${canvasStickyRotation}deg`,
    "--sticky-color": canvasStickyColor,
    "--sticky-shadow": `${canvasStickyShadow}px`,
    "--sticky-fold": `${canvasStickyFoldSize}px`,
    "--sticky-pin": canvasStickyPin ? "block" : "none",
    "--sticky-tape": canvasStickyTape ? "block" : "none",
    "--sticky-lines": canvasStickyLines ? "block" : "none",
    "--sticky-curl": canvasStickyCurl ? "1" : "0",
    "--sticky-stripe": canvasStickyStripe ? "1" : "0",
    "--rounded-radius": `${canvasRoundedRadius}px`,
    "--group-font-family": canvasGroupFontFamily,
    "--group-font-size": `${canvasGroupFontSize}px`,
    "--edge-width": `${canvasEdgeWidth}px`,
    "--canvas-selection-color": canvasSelectionColor,
    "--canvas-selection-width": `${canvasSelectionWidth}px`,
  } as React.CSSProperties;

  // Counter-zoom: neutralise the global document.documentElement.style.zoom so
  // React Flow's coordinate math (getBoundingClientRect vs mouse events) stays
  // consistent.  Scale width/height up so the container still fills its parent.
  const counterZoomStyle: React.CSSProperties = useMemo(
    () => uiZoom !== 1
      ? { zoom: 1 / uiZoom, width: `${uiZoom * 100}%`, height: `${uiZoom * 100}%` }
      : {},
    [uiZoom],
  );

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");
  const dirtyRef = useRef(false);
  const mountedRef = useRef(true);
  const savingRef = useRef(false);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  nodesRef.current = nodes;
  edgesRef.current = edges;

  const selectedCount = useMemo(() => nodes.filter((n) => n.selected).length, [nodes]);

  // ── Undo/Redo stacks ─────────────────────────────────────────────────────
  const MAX_CANVAS_UNDO = 30;
  const undoStackRef = useRef<{ nodes: string; edges: string }[]>([]);
  const redoStackRef = useRef<{ nodes: string; edges: string }[]>([]);
  const isUndoingRef = useRef(false);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);

  // Load file on mount
  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    getAPI()
      .then((api) => api.readPlainFile(path))
      .then((file) => {
        if (cancelled) return;
        if (file.binary) {
          setError("Binary file — cannot open as canvas");
          setLoading(false);
          return;
        }
        try {
          const parsed: JsonCanvas = JSON.parse(file.body);
          const { nodes: rfNodes, edges: rfEdges } = canvasToFlow(parsed);
          const strEdges = rfEdges.map((e) => {
            const stroke = (e.style as Record<string, unknown> | undefined)?.stroke;
            const mid = typeof stroke === "string" ? `brainmap-arrow-${stroke}` : "brainmap-arrow";
            return {
              ...e,
              markerEnd: e.markerEnd ? mid : undefined,
              markerStart: e.markerStart ? mid : undefined,
            };
          });
          setNodes(rfNodes);
          setEdges(strEdges);
          try {
            lastSavedRef.current = JSON.stringify(flowToCanvas(rfNodes, rfEdges));
          } catch {
            lastSavedRef.current = "";
          }
        } catch {
          setError("Could not parse canvas file. The file may be corrupted or not valid JSON Canvas.");
        }
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(String(e));
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [path, setNodes, setEdges]);

  // Save function
  const doSave = useCallback(async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    try {
      const canvas = flowToCanvas(nodesRef.current, edgesRef.current);
      const json = JSON.stringify(canvas, null, 2);
      const api = await getAPI();
      await api.writePlainFile(path, json);
      lastSavedRef.current = JSON.stringify(canvas);
      dirtyRef.current = false;
      pendingSaves.delete(path);
      if (mountedRef.current) {
        const tabId = useTabStore.getState().activeTabId;
        if (tabId === path) {
          useTabStore.getState().updateTabState(tabId, { isDirty: false });
        }
      }
    } catch (e) {
      pendingSaves.delete(path);
      log.error("canvas", "failed to save canvas", { path, error: String(e) });
    } finally {
      savingRef.current = false;
    }
  }, [path]);

  const doSaveRef = useRef(doSave);
  doSaveRef.current = doSave;

  // Schedule debounced save
  const scheduleSave = useCallback(() => {
    try {
      const canvas = flowToCanvas(nodesRef.current, edgesRef.current);
      const currentJson = JSON.stringify(canvas);
      if (currentJson === lastSavedRef.current) return;
    } catch {
      // Non-serializable — treat as changed
    }

    pendingSaves.set(path, { nodes: nodesRef.current, edges: edgesRef.current });

    if (!dirtyRef.current) {
      dirtyRef.current = true;
      const tabId = useTabStore.getState().activeTabId;
      if (tabId === path) {
        useTabStore.getState().updateTabState(tabId, { isDirty: true });
      }
    }

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      doSaveRef.current();
    }, SAVE_DEBOUNCE_MS);
  }, [path]);

  // Listen for canvas:save event (Cmd+S)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail && detail !== path) return;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      doSaveRef.current();
    };
    window.addEventListener("canvas:save", handler);
    return () => window.removeEventListener("canvas:save", handler);
  }, [path]);

  // Save on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      if (pendingSaves.has(path) && !savingRef.current) {
        doSaveRef.current();
      }
    };
  }, [path]);

  // ── Undo/Redo helpers ──────────────────────────────────────────────────

  const pushSnapshot = useCallback(() => {
    if (isUndoingRef.current) return;
    const snap = {
      nodes: JSON.stringify(nodesRef.current),
      edges: JSON.stringify(edgesRef.current),
    };
    const top = undoStackRef.current[undoStackRef.current.length - 1];
    if (top && top.nodes === snap.nodes && top.edges === snap.edges) return;
    undoStackRef.current.push(snap);
    if (undoStackRef.current.length > MAX_CANVAS_UNDO) undoStackRef.current.shift();
    redoStackRef.current = [];
  }, []);

  const canvasUndo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    redoStackRef.current.push({
      nodes: JSON.stringify(nodesRef.current),
      edges: JSON.stringify(edgesRef.current),
    });
    const snap = undoStackRef.current.pop()!;
    isUndoingRef.current = true;
    setNodes(JSON.parse(snap.nodes));
    setEdges(JSON.parse(snap.edges));
    requestAnimationFrame(() => {
      isUndoingRef.current = false;
      scheduleSave();
    });
  }, [setNodes, setEdges, scheduleSave]);

  const canvasRedo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;
    undoStackRef.current.push({
      nodes: JSON.stringify(nodesRef.current),
      edges: JSON.stringify(edgesRef.current),
    });
    const snap = redoStackRef.current.pop()!;
    isUndoingRef.current = true;
    setNodes(JSON.parse(snap.nodes));
    setEdges(JSON.parse(snap.edges));
    requestAnimationFrame(() => {
      isUndoingRef.current = false;
      scheduleSave();
    });
  }, [setNodes, setEdges, scheduleSave]);

  // Cmd+Z / Cmd+Y (capture phase to intercept before global handler)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      // Don't intercept when editing text inside a node
      const target = e.target as HTMLElement | null;
      if (target?.closest("textarea, input")) return;
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        canvasUndo();
      } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
        e.preventDefault();
        e.stopPropagation();
        canvasRedo();
      }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [canvasUndo, canvasRedo]);

  // Wire change handlers to trigger save + undo snapshots
  const handleNodesChange: typeof onNodesChange = useCallback(
    (changes) => {
      // Snapshot on gesture start, not every intermediate change
      let shouldSnapshot = false;
      for (const c of changes as { type: string; dragging?: boolean; resizing?: boolean }[]) {
        if (c.type === "remove" || c.type === "add") {
          shouldSnapshot = true;
        } else if (c.type === "position" && c.dragging === true && !isDraggingRef.current) {
          // Drag just started
          isDraggingRef.current = true;
          shouldSnapshot = true;
        } else if (c.type === "position" && c.dragging === false) {
          isDraggingRef.current = false;
        } else if (c.type === "dimensions" && !isResizingRef.current) {
          // Resize just started
          isResizingRef.current = true;
          shouldSnapshot = true;
        }
      }
      // Reset resize flag when no dimensions changes in this batch
      if (!changes.some((c: { type: string }) => c.type === "dimensions")) {
        isResizingRef.current = false;
      }
      if (shouldSnapshot) pushSnapshot();
      onNodesChange(changes);
      requestAnimationFrame(() => scheduleSave());
    },
    [onNodesChange, scheduleSave, pushSnapshot],
  );

  const handleEdgesChange: typeof onEdgesChange = useCallback(
    (changes) => {
      const meaningful = changes.some((c: { type: string }) =>
        c.type === "remove" || c.type === "add",
      );
      if (meaningful) pushSnapshot();
      onEdgesChange(changes);
      requestAnimationFrame(() => scheduleSave());
    },
    [onEdgesChange, scheduleSave, pushSnapshot],
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      pushSnapshot();
      setEdges((eds) =>
        addEdge(
          { ...connection, markerEnd: "brainmap-arrow", data: { isNew: true } },
          eds,
        ),
      );
      requestAnimationFrame(() => scheduleSave());
    },
    [setEdges, scheduleSave, pushSnapshot],
  );

  // ── Context menu for adding nodes ────────────────────────────────────────
  const reactFlowInstance = useReactFlow();
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; flowX: number; flowY: number } | null>(null);
  const [showNoteSelect, setShowNoteSelect] = useState(false);
  const [showCtxShapes, setShowCtxShapes] = useState(false);
  const [noteFilter, setNoteFilter] = useState("");
  const [ctxPickerTab, setCtxPickerTab] = useState<"notes" | "files">("notes");

  // Element context menu (right-click on a node or edge)
  const [elemCtxMenu, setElemCtxMenu] = useState<{ x: number; y: number; nodeId?: string; edgeId?: string } | null>(null);

  // Context menu coords: menus use position:fixed inside the counter-zoomed
  // container, so the browser divides left/top by the zoom factor — multiply
  // by uiZoom to compensate.  Must stay in sync with counterZoomStyle.
  const handleNodeContextMenu = useCallback(
    (event: ReactMouseEvent, node: { id: string }) => {
      event.preventDefault();
      setElemCtxMenu({ x: event.clientX * uiZoom, y: event.clientY * uiZoom, nodeId: node.id });
      setCtxMenu(null);
    },
    [uiZoom],
  );

  const handleEdgeContextMenu = useCallback(
    (event: ReactMouseEvent, edge: { id: string }) => {
      event.preventDefault();
      setElemCtxMenu({ x: event.clientX * uiZoom, y: event.clientY * uiZoom, edgeId: edge.id });
      setCtxMenu(null);
    },
    [uiZoom],
  );

  const handleSelectionContextMenu = useCallback(
    (event: ReactMouseEvent) => {
      event.preventDefault();
      setElemCtxMenu({ x: event.clientX * uiZoom, y: event.clientY * uiZoom });
      setCtxMenu(null);
    },
    [uiZoom],
  );

  const closeElemCtxMenu = useCallback(() => setElemCtxMenu(null), []);

  const deleteSelected = useCallback(() => {
    pushSnapshot();
    const selectedNodeIds = new Set(
      nodesRef.current.filter((n) => n.selected).map((n) => n.id),
    );
    const selectedEdgeIds = new Set(
      edgesRef.current.filter((e) => e.selected).map((e) => e.id),
    );
    // Include the right-clicked element
    if (elemCtxMenu?.nodeId) selectedNodeIds.add(elemCtxMenu.nodeId);
    if (elemCtxMenu?.edgeId) selectedEdgeIds.add(elemCtxMenu.edgeId);

    // Cascade: also delete children of deleted group nodes (fixed-point for nesting)
    let changed = true;
    while (changed) {
      changed = false;
      for (const n of nodesRef.current) {
        if (n.parentId && selectedNodeIds.has(n.parentId) && !selectedNodeIds.has(n.id)) {
          selectedNodeIds.add(n.id);
          changed = true;
        }
      }
    }
    if (selectedNodeIds.size > 0) {
      setNodes((nds) => nds.filter((n) => !selectedNodeIds.has(n.id)));
    }
    // Delete selected edges + edges connected to deleted nodes
    if (selectedNodeIds.size > 0 || selectedEdgeIds.size > 0) {
      setEdges((eds) =>
        eds.filter(
          (e) =>
            !selectedEdgeIds.has(e.id) &&
            !selectedNodeIds.has(e.source) &&
            !selectedNodeIds.has(e.target),
        ),
      );
    }
    closeElemCtxMenu();
    requestAnimationFrame(() => scheduleSave());
  }, [setNodes, setEdges, elemCtxMenu, closeElemCtxMenu, scheduleSave, pushSnapshot]);

  const duplicateSelected = useCallback(() => {
    pushSnapshot();
    const selectedNodeIds = new Set(
      nodesRef.current.filter((n) => n.selected).map((n) => n.id),
    );
    if (elemCtxMenu?.nodeId) selectedNodeIds.add(elemCtxMenu.nodeId);
    if (selectedNodeIds.size === 0) return;

    const offset = 80;
    const now = Date.now();
    const idMap = new Map<string, string>();
    const nodesToClone = nodesRef.current.filter((n) => selectedNodeIds.has(n.id));
    // Build old-to-new ID map
    nodesToClone.forEach((n, i) => {
      idMap.set(n.id, `node-${now}-${i}-${Math.random().toString(36).slice(2, 6)}`);
    });
    const newNodes = nodesToClone.map((n) => ({
      ...n,
      id: idMap.get(n.id)!,
      position: { x: n.position.x + offset, y: n.position.y + offset },
      data: { ...n.data },
      style: n.style ? { ...n.style } : undefined,
      selected: false,
      // Remap parentId if the parent was also duplicated
      ...(n.parentId && idMap.has(n.parentId) ? { parentId: idMap.get(n.parentId) } : {}),
    }));
    // Duplicate edges whose both endpoints are in the duplicated set
    const newEdges = edgesRef.current
      .filter((e) => idMap.has(e.source) && idMap.has(e.target))
      .map((e) => ({
        ...e,
        id: `edge-${now}-${Math.random().toString(36).slice(2, 6)}`,
        source: idMap.get(e.source)!,
        target: idMap.get(e.target)!,
        selected: false,
      }));
    setNodes((nds) => [...nds, ...newNodes]);
    if (newEdges.length > 0) setEdges((eds) => [...eds, ...newEdges]);
    closeElemCtxMenu();
    requestAnimationFrame(() => scheduleSave());
  }, [setNodes, setEdges, elemCtxMenu, closeElemCtxMenu, scheduleSave, pushSnapshot]);

  // Close element context menu on click elsewhere
  useEffect(() => {
    if (!elemCtxMenu) return;
    const handler = () => closeElemCtxMenu();
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [elemCtxMenu, closeElemCtxMenu]);

  // Cmd+D to duplicate selected elements
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "d") {
        e.preventDefault();
        duplicateSelected();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [duplicateSelected]);

  // V/H to switch interaction mode
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("textarea, input, [contenteditable]")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "v") setInteractionMode("select");
      else if (e.key === "h") setInteractionMode("pan");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Group selected elements
  const groupSelected = useCallback(() => {
    const selected = nodesRef.current.filter((n) => n.selected && n.type !== "canvasGroup");
    if (selected.length < 2) return;
    pushSnapshot();

    // Compute bounding box of selected nodes (using absolute positions)
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of selected) {
      const w = parseFloat(String(n.style?.width ?? "")) || n.measured?.width || 250;
      const h = parseFloat(String(n.style?.height ?? n.style?.minHeight ?? "")) || n.measured?.height || 100;
      // If node has a parent, its position is relative — convert to absolute
      const absX = n.parentId
        ? n.position.x + (nodesRef.current.find((p) => p.id === n.parentId)?.position.x ?? 0)
        : n.position.x;
      const absY = n.parentId
        ? n.position.y + (nodesRef.current.find((p) => p.id === n.parentId)?.position.y ?? 0)
        : n.position.y;
      minX = Math.min(minX, absX);
      minY = Math.min(minY, absY);
      maxX = Math.max(maxX, absX + w);
      maxY = Math.max(maxY, absY + h);
    }

    const pad = 40;
    const groupX = minX - pad;
    const groupY = minY - pad;
    const groupId = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const groupNode = {
      id: groupId,
      type: "canvasGroup",
      position: { x: groupX, y: groupY },
      data: { label: "Group" },
      style: { width: maxX - minX + pad * 2, height: maxY - minY + pad * 2 },
      zIndex: -1,
      selected: false,
    };

    const selectedIds = new Set(selected.map((n) => n.id));
    setNodes((nds) => [
      groupNode,
      ...nds.map((n) => {
        if (!selectedIds.has(n.id)) return { ...n, selected: false };
        // Convert to position relative to new group
        const absX = n.parentId
          ? n.position.x + (nds.find((p) => p.id === n.parentId)?.position.x ?? 0)
          : n.position.x;
        const absY = n.parentId
          ? n.position.y + (nds.find((p) => p.id === n.parentId)?.position.y ?? 0)
          : n.position.y;
        return {
          ...n,
          parentId: groupId,
          position: { x: absX - groupX, y: absY - groupY },
          selected: false,
        };
      }),
    ]);
    requestAnimationFrame(() => scheduleSave());
  }, [setNodes, scheduleSave, pushSnapshot]);

  // Ungroup: remove group node and restore children to absolute positions
  const ungroupSelected = useCallback(() => {
    const clickedId = elemCtxMenu?.nodeId;
    if (!clickedId) return;
    const groupNode = nodesRef.current.find((n) => n.id === clickedId);
    if (!groupNode || groupNode.type !== "canvasGroup") return;
    pushSnapshot();

    const groupX = groupNode.position.x;
    const groupY = groupNode.position.y;

    setNodes((nds) =>
      nds
        .filter((n) => n.id !== clickedId) // remove the group
        .map((n) => {
          if (n.parentId !== clickedId) return n;
          // Restore absolute position
          return {
            ...n,
            parentId: undefined,
            position: { x: n.position.x + groupX, y: n.position.y + groupY },
          };
        }),
    );
    closeElemCtxMenu();
    requestAnimationFrame(() => scheduleSave());
  }, [setNodes, elemCtxMenu, closeElemCtxMenu, scheduleSave, pushSnapshot]);

  // Pane context menu (right-click on empty canvas)
  const handlePaneContextMenu = useCallback(
    (event: ReactMouseEvent) => {
      event.preventDefault();
      const flowPos = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      setCtxMenu({ x: event.clientX * uiZoom, y: event.clientY * uiZoom, flowX: flowPos.x, flowY: flowPos.y });
      setElemCtxMenu(null);
      setShowNoteSelect(false);
      setNoteFilter("");
    },
    [reactFlowInstance, uiZoom],
  );

  const closeCtxMenu = useCallback(() => {
    setCtxMenu(null);
    setShowNoteSelect(false);
    setShowCtxShapes(false);
    setNoteFilter("");
  }, []);

  const addNodeAtMenu = useCallback(
    (type: string, data: Record<string, unknown>, width = 250, height = 100) => {
      if (!ctxMenu) return;
      pushSnapshot();
      const id = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const useFixedHeight =
        type === "canvasGroup" ||
        (type === "canvasText" && (data.shape === "circle" || data.shape === "diamond"));
      setNodes((nds) => [
        ...nds,
        {
          id,
          type,
          position: { x: ctxMenu.flowX, y: ctxMenu.flowY },
          data,
          style: useFixedHeight ? { width, height } : { width, minHeight: height },
          ...(type === "canvasGroup" ? { zIndex: -1 } : {}),
        },
      ]);
      closeCtxMenu();
      requestAnimationFrame(() => scheduleSave());
    },
    [ctxMenu, setNodes, closeCtxMenu, scheduleSave, pushSnapshot],
  );

  // Close context menu on click elsewhere
  useEffect(() => {
    if (!ctxMenu) return;
    const handler = () => closeCtxMenu();
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [ctxMenu, closeCtxMenu]);

  // ── Note list for pickers ────────────────────────────────────────────────
  const allNodes = useGraphStore((s) => s.nodes);
  const workspaceFiles = useGraphStore((s) => s.workspaceFiles);

  // ── Toolbar: add node at viewport center ────────────────────────────────
  const [toolbarPicker, setToolbarPicker] = useState(false);
  const [toolbarFilter, setToolbarFilter] = useState("");
  const [toolbarPickerTab, setToolbarPickerTab] = useState<"notes" | "files">("notes");
  const [toolbarShapePicker, setToolbarShapePicker] = useState(false);

  const addNodeAtCenter = useCallback(
    (type: string, data: Record<string, unknown>, width = 250, height = 100) => {
      pushSnapshot();
      const viewport = reactFlowInstance.getViewport();
      const container = document.querySelector(".canvas-container");
      const cw = container?.clientWidth ?? 800;
      const ch = container?.clientHeight ?? 600;
      const centerX = (-viewport.x + cw / 2) / viewport.zoom;
      const centerY = (-viewport.y + ch / 2) / viewport.zoom;
      const id = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const useFixedHeight =
        type === "canvasGroup" ||
        (type === "canvasText" && (data.shape === "circle" || data.shape === "diamond"));
      setNodes((nds) => [
        ...nds,
        {
          id,
          type,
          position: { x: centerX - width / 2, y: centerY - height / 2 },
          data,
          style: useFixedHeight ? { width, height } : { width, minHeight: height },
          ...(type === "canvasGroup" ? { zIndex: -1 } : {}),
        },
      ]);
      setToolbarPicker(false);
      setToolbarFilter("");
      requestAnimationFrame(() => scheduleSave());
    },
    [reactFlowInstance, setNodes, scheduleSave, pushSnapshot],
  );

  // Create a new note via dialog and add it as a file node
  const createNoteForCanvas = useCallback(
    (flowX?: number, flowY?: number) => {
      // Set the callback so when the dialog creates the note, we add a node
      useUIStore.setState({
        createNoteOnCreatedCallback: (createdPath: string) => {
          const viewport = reactFlowInstance.getViewport();
          const container = document.querySelector(".canvas-container");
          const cw = container?.clientWidth ?? 800;
          const ch = container?.clientHeight ?? 600;
          const x = flowX ?? ((-viewport.x + cw / 2) / viewport.zoom - 125);
          const y = flowY ?? ((-viewport.y + ch / 2) / viewport.zoom - 50);
          const id = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          setNodes((nds) => [
            ...nds,
            { id, type: "canvasFile", position: { x, y }, data: { file: createdPath }, style: { width: 250, minHeight: 100 } },
          ]);
          requestAnimationFrame(() => scheduleSave());
        },
      });
      useUIStore.getState().openCreateNoteDialog();
    },
    [reactFlowInstance, setNodes, scheduleSave, pushSnapshot],
  );

  const toolbarNotes = useMemo(() => {
    if (!toolbarPicker) return [];
    const lf = toolbarFilter.toLowerCase();
    const results: { path: string; title: string; noteType: string }[] = [];
    if (toolbarPickerTab === "notes") {
      allNodes.forEach((n) => {
        if (n.note_type === "folder") return;
        if (lf && !n.title.toLowerCase().includes(lf) && !n.path.toLowerCase().includes(lf)) return;
        results.push({ path: n.path, title: n.title, noteType: n.note_type });
      });
    } else {
      const graphPaths = new Set<string>();
      allNodes.forEach((n) => graphPaths.add(n.path));
      for (const fp of workspaceFiles) {
        if (graphPaths.has(fp)) continue;
        const name = fp.split("/").pop() ?? fp;
        if (lf && !name.toLowerCase().includes(lf) && !fp.toLowerCase().includes(lf)) continue;
        const ext = name.includes(".") ? name.split(".").pop()! : "file";
        results.push({ path: fp, title: name, noteType: ext });
      }
    }
    return results.slice(0, 30);
  }, [toolbarPicker, toolbarFilter, toolbarPickerTab, allNodes, workspaceFiles]);

  // Stable nodeTypes reference (must not change between renders)
  const nodeTypes = useMemo(() => NODE_TYPES, []);
  const edgeTypes = useMemo(() => EDGE_TYPES, []);

  // Context menu note picker
  const filteredNotes = useMemo(() => {
    if (!showNoteSelect) return [];
    const lf = noteFilter.toLowerCase();
    const results: { path: string; title: string; noteType: string }[] = [];
    if (ctxPickerTab === "notes") {
      allNodes.forEach((n) => {
        if (n.note_type === "folder") return;
        if (lf && !n.title.toLowerCase().includes(lf) && !n.path.toLowerCase().includes(lf)) return;
        results.push({ path: n.path, title: n.title, noteType: n.note_type });
      });
    } else {
      const graphPaths = new Set<string>();
      allNodes.forEach((n) => graphPaths.add(n.path));
      for (const fp of workspaceFiles) {
        if (graphPaths.has(fp)) continue;
        const name = fp.split("/").pop() ?? fp;
        if (lf && !name.toLowerCase().includes(lf) && !fp.toLowerCase().includes(lf)) continue;
        const ext = name.includes(".") ? name.split(".").pop()! : "file";
        results.push({ path: fp, title: name, noteType: ext });
      }
    }
    return results.slice(0, 30);
  }, [showNoteSelect, noteFilter, ctxPickerTab, allNodes, workspaceFiles]);

  if (loading) {
    return (
      <div className={containerClass}>
        <div className="editor-placeholder">Loading canvas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClass}>
        <div className="editor-placeholder" style={{ flexDirection: "column", gap: 8 }}>
          <div>{error}</div>
          <button
            className="editor-view-btn"
            onClick={() => {
              useTabStore.getState().closeTab(path);
              import("../../stores/editorStore").then(({ useEditorStore }) => {
                useEditorStore.getState().openPlainFile(path);
              });
            }}
          >
            Open as Text
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass} style={{ ...shapeVars, ...counterZoomStyle }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        minZoom={0.1}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onPaneContextMenu={handlePaneContextMenu}
        onNodeContextMenu={handleNodeContextMenu}
        onEdgeContextMenu={handleEdgeContextMenu}
        onSelectionContextMenu={handleSelectionContextMenu}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        colorMode={colorMode}
        panOnDrag={interactionMode === "pan"}
        selectionOnDrag={interactionMode === "select"}
        selectionMode={SelectionMode.Partial}
        deleteKeyCode={["Backspace", "Delete"]}
        elevateNodesOnSelect={false}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{ markerEnd: "brainmap-arrow" }}
      >
        {/* Custom arrow markers — one per edge color + default */}
        <svg style={{ position: "absolute", width: 0, height: 0 }}>
          <defs>
            <marker id="brainmap-arrow" viewBox="0 0 10 10" refX="10" refY="5"
              markerWidth={canvasArrowSize} markerHeight={canvasArrowSize} orient="auto-start-reverse">
              <polygon points="0,0 10,5 0,10" fill="#b1b1b7" />
            </marker>
            {Array.from(new Set(
              edges.flatMap((e) => {
                const s = (e.style as Record<string, unknown> | undefined)?.stroke;
                return typeof s === "string" ? [s] : [];
              }),
            )).map((color) => (
              <marker key={color} id={`brainmap-arrow-${color}`} viewBox="0 0 10 10" refX="10" refY="5"
                markerWidth={canvasArrowSize} markerHeight={canvasArrowSize} orient="auto-start-reverse">
                <polygon points="0,0 10,5 0,10" fill={color} />
              </marker>
            ))}
          </defs>
        </svg>
        <Controls />
        {canvasShowDots && (
          <Background
            variant={"dots" as const}
            gap={20}
            size={1.5}
            color={canvasTheme === "light"
              ? `rgba(0, 0, 0, ${canvasDotOpacity / 100})`
              : `rgba(255, 255, 255, ${canvasDotOpacity / 100})`
            }
          />
        )}
        <Panel position="bottom-center" className="canvas-toolbar">
          <button
            className={`canvas-toolbar-btn${interactionMode === "pan" ? " canvas-toolbar-btn--active" : ""}`}
            title="Pan mode (H)"
            onClick={() => setInteractionMode("pan")}
          >
            <Hand size={22} />
          </button>
          <button
            className={`canvas-toolbar-btn${interactionMode === "select" ? " canvas-toolbar-btn--active" : ""}`}
            title="Select mode (V)"
            onClick={() => setInteractionMode("select")}
          >
            <MousePointer2 size={22} />
          </button>
          <div className="canvas-toolbar-separator" />
          <div className="canvas-toolbar-split">
            <button
              className="canvas-toolbar-btn"
              title="Add text card"
              onClick={() => { addNodeAtCenter("canvasText", { text: "New text card" }); setToolbarShapePicker(false); }}
            >
              <StickyNote size={22} />
            </button>
            <button
              className="canvas-toolbar-btn canvas-toolbar-btn--caret"
              title="Choose shape"
              onClick={() => { setToolbarShapePicker(!toolbarShapePicker); setToolbarPicker(false); }}
            >
              <ChevronDown size={14} />
            </button>
          </div>
          <button
            className="canvas-toolbar-btn"
            title="Add note reference"
            onClick={() => { setToolbarPicker(!toolbarPicker); setToolbarFilter(""); }}
          >
            <FileText size={22} />
          </button>
          <button
            className="canvas-toolbar-btn"
            title="Add group"
            onClick={() => addNodeAtCenter("canvasGroup", { label: "Group" }, 400, 300)}
          >
            <Layers size={22} />
          </button>
          <div className="canvas-toolbar-separator" />
          <button
            className="canvas-toolbar-btn"
            title="Create new note"
            onClick={() => createNoteForCanvas()}
          >
            <FilePlus size={22} />
          </button>
          {selectedCount >= 2 && (
            <>
              <div className="canvas-toolbar-separator" />
              <button
                className="canvas-toolbar-btn"
                title="Group selected elements"
                onClick={groupSelected}
              >
                <Group size={22} />
              </button>
              <span className="canvas-toolbar-selection-count">{selectedCount} selected</span>
            </>
          )}
        </Panel>
      </ReactFlow>
      {toolbarShapePicker && (
        <div className="canvas-toolbar-shape-picker" onClick={(e) => e.stopPropagation()}>
          {CANVAS_SHAPES.map((s) => {
            const Icon = (LucideIcons as Record<string, React.ComponentType<{ size?: number }>>)[s.icon];
            return (
              <button
                key={s.id}
                className="canvas-toolbar-shape-btn"
                title={s.label}
                onClick={() => {
                  addNodeAtCenter("canvasText", { text: "New text card", shape: s.id }, s.defaultWidth, s.defaultHeight);
                  setToolbarShapePicker(false);
                }}
              >
                {Icon && <Icon size={18} />}
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      )}
      {toolbarPicker && (
        <div className="canvas-toolbar-picker" onClick={(e) => e.stopPropagation()}>
          <div className="canvas-picker-tabs">
            <button
              className={`canvas-picker-tab${toolbarPickerTab === "notes" ? " canvas-picker-tab--active" : ""}`}
              onClick={() => { setToolbarPickerTab("notes"); setToolbarFilter(""); }}
            >
              Notes
            </button>
            <button
              className={`canvas-picker-tab${toolbarPickerTab === "files" ? " canvas-picker-tab--active" : ""}`}
              onClick={() => { setToolbarPickerTab("files"); setToolbarFilter(""); }}
            >
              Files
            </button>
          </div>
          <input
            className="canvas-note-picker-input"
            type="text"
            placeholder={toolbarPickerTab === "notes" ? "Search notes..." : "Search files..."}
            value={toolbarFilter}
            onChange={(e) => setToolbarFilter(e.target.value)}
            autoFocus
          />
          <div className="canvas-note-picker-list">
            {toolbarNotes.map((n) => (
              <div
                key={n.path}
                className="context-menu-item"
                onClick={() => addNodeAtCenter("canvasFile", { file: n.path })}
              >
                <span className="canvas-note-picker-title">{n.title}</span>
                <span className="canvas-note-picker-type">{n.noteType}</span>
              </div>
            ))}
            {toolbarNotes.length === 0 && (
              <div className="context-menu-item context-menu-item--disabled">No notes found</div>
            )}
          </div>
        </div>
      )}
      {ctxMenu && (
        <div
          className="context-menu"
          style={{ left: ctxMenu.x, top: ctxMenu.y, minWidth: 180 }}
          onClick={(e) => e.stopPropagation()}
        >
          {!showNoteSelect && !showCtxShapes ? (
            <>
              <div
                className="context-menu-item"
                onClick={() => addNodeAtMenu("canvasText", { text: "New text card" })}
              >
                Add Text Card
              </div>
              <div
                className="context-menu-item"
                onClick={() => { setShowCtxShapes(true); setShowNoteSelect(false); }}
              >
                Add Shaped Card...
              </div>
              <div
                className="context-menu-item"
                onClick={() => setShowNoteSelect(true)}
              >
                Add Note Reference
              </div>
              <div className="context-menu-separator" />
              <div
                className="context-menu-item"
                onClick={() => addNodeAtMenu("canvasGroup", { label: "Group" }, 400, 300)}
              >
                Add Group
              </div>
              <div className="context-menu-separator" />
              <div
                className="context-menu-item"
                onClick={() => {
                  const flowX = ctxMenu?.flowX;
                  const flowY = ctxMenu?.flowY;
                  closeCtxMenu();
                  createNoteForCanvas(flowX, flowY);
                }}
              >
                Create New Note
              </div>
            </>
          ) : showCtxShapes ? (
            <div className="canvas-ctx-shape-list">
              {CANVAS_SHAPES.map((s) => {
                const Icon = (LucideIcons as Record<string, React.ComponentType<{ size?: number }>>)[s.icon];
                return (
                  <div
                    key={s.id}
                    className="context-menu-item"
                    onClick={() => addNodeAtMenu("canvasText", { text: "New text card", shape: s.id }, s.defaultWidth, s.defaultHeight)}
                  >
                    {Icon && <Icon size={14} />}
                    <span style={{ marginLeft: 8 }}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="canvas-note-picker" onClick={(e) => e.stopPropagation()}>
              <div className="canvas-picker-tabs">
                <button
                  className={`canvas-picker-tab${ctxPickerTab === "notes" ? " canvas-picker-tab--active" : ""}`}
                  onClick={() => { setCtxPickerTab("notes"); setNoteFilter(""); }}
                >
                  Notes
                </button>
                <button
                  className={`canvas-picker-tab${ctxPickerTab === "files" ? " canvas-picker-tab--active" : ""}`}
                  onClick={() => { setCtxPickerTab("files"); setNoteFilter(""); }}
                >
                  Files
                </button>
              </div>
              <input
                className="canvas-note-picker-input"
                type="text"
                placeholder={ctxPickerTab === "notes" ? "Search notes..." : "Search files..."}
                value={noteFilter}
                onChange={(e) => setNoteFilter(e.target.value)}
                autoFocus
              />
              <div className="canvas-note-picker-list">
                {filteredNotes.map((n) => (
                  <div
                    key={n.path}
                    className="context-menu-item"
                    onClick={() => addNodeAtMenu("canvasFile", { file: n.path })}
                  >
                    <span className="canvas-note-picker-title">{n.title}</span>
                    <span className="canvas-note-picker-type">{n.noteType}</span>
                  </div>
                ))}
                {filteredNotes.length === 0 && (
                  <div className="context-menu-item context-menu-item--disabled">No notes found</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {elemCtxMenu && (() => {
        const clickedNode = elemCtxMenu.nodeId ? nodesRef.current.find((n) => n.id === elemCtxMenu.nodeId) : undefined;
        const isGroup = clickedNode?.type === "canvasGroup";
        const hasChildren = isGroup && nodesRef.current.some((n) => n.parentId === clickedNode.id);
        const canGroup = selectedCount >= 2;
        return (
          <div
            className="context-menu"
            style={{ left: elemCtxMenu.x, top: elemCtxMenu.y, minWidth: 140 }}
            onClick={(e) => e.stopPropagation()}
          >
            {elemCtxMenu.nodeId && (
              <div className="context-menu-item" onClick={duplicateSelected}>
                Duplicate
              </div>
            )}
            {canGroup && (
              <div className="context-menu-item" onClick={() => { groupSelected(); closeElemCtxMenu(); }}>
                Group Selection
              </div>
            )}
            {isGroup && hasChildren && (
              <div className="context-menu-item" onClick={ungroupSelected}>
                Ungroup
              </div>
            )}
            <div className="context-menu-item context-menu-item--danger" onClick={deleteSelected}>
              Delete
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────

export function CanvasEditor({ path }: { path: string }) {
  return (
    <CanvasErrorBoundary path={path} key={path}>
      <ReactFlowProvider>
        <CanvasEditorInner path={path} />
      </ReactFlowProvider>
    </CanvasErrorBoundary>
  );
}
