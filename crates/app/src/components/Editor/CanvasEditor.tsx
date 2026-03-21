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
} from "@xyflow/react";
import type { OnConnect, ColorMode } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { getAPI } from "../../api/bridge";
import { useTabStore } from "../../stores/tabStore";
import { useUIStore } from "../../stores/uiStore";
import { log } from "../../utils/logger";
import { canvasToFlow, flowToCanvas } from "./canvasTranslation";
import type { JsonCanvas } from "./canvasTranslation";
import { StickyNote, FileText, Layers } from "lucide-react";
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

  const canvasTheme = useUIStore((s) => s.canvasTheme);
  const canvasShowDots = useUIStore((s) => s.canvasShowDots);
  const canvasDotOpacity = useUIStore((s) => s.canvasDotOpacity);
  const canvasArrowSize = useUIStore((s) => s.canvasArrowSize);
  const colorMode: ColorMode = canvasTheme;
  const containerClass = `canvas-container${canvasTheme === "light" ? " canvas-light" : ""}`;

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");
  const dirtyRef = useRef(false);
  const mountedRef = useRef(true);
  const savingRef = useRef(false);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  nodesRef.current = nodes;
  edgesRef.current = edges;

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

  // Wire change handlers to trigger save
  const handleNodesChange: typeof onNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      // Schedule save after React processes the state update
      requestAnimationFrame(() => scheduleSave());
    },
    [onNodesChange, scheduleSave],
  );

  const handleEdgesChange: typeof onEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      requestAnimationFrame(() => scheduleSave());
    },
    [onEdgesChange, scheduleSave],
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      setEdges((eds) =>
        addEdge(
          { ...connection, markerEnd: "brainmap-arrow", data: { isNew: true } },
          eds,
        ),
      );
      requestAnimationFrame(() => scheduleSave());
    },
    [setEdges, scheduleSave],
  );

  // ── Context menu for adding nodes ────────────────────────────────────────
  const reactFlowInstance = useReactFlow();
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; flowX: number; flowY: number } | null>(null);
  const [showNoteSelect, setShowNoteSelect] = useState(false);
  const [noteFilter, setNoteFilter] = useState("");

  // Element context menu (right-click on a node or edge)
  const [elemCtxMenu, setElemCtxMenu] = useState<{ x: number; y: number; nodeId?: string; edgeId?: string } | null>(null);

  const handleNodeContextMenu = useCallback(
    (event: ReactMouseEvent, node: { id: string }) => {
      event.preventDefault();
      setElemCtxMenu({ x: event.clientX, y: event.clientY, nodeId: node.id });
      setCtxMenu(null);
    },
    [],
  );

  const handleEdgeContextMenu = useCallback(
    (event: ReactMouseEvent, edge: { id: string }) => {
      event.preventDefault();
      setElemCtxMenu({ x: event.clientX, y: event.clientY, edgeId: edge.id });
      setCtxMenu(null);
    },
    [],
  );

  const closeElemCtxMenu = useCallback(() => setElemCtxMenu(null), []);

  const deleteSelected = useCallback(() => {
    const selectedNodeIds = new Set(
      nodesRef.current.filter((n) => n.selected).map((n) => n.id),
    );
    const selectedEdgeIds = new Set(
      edgesRef.current.filter((e) => e.selected).map((e) => e.id),
    );
    // Include the right-clicked element
    if (elemCtxMenu?.nodeId) selectedNodeIds.add(elemCtxMenu.nodeId);
    if (elemCtxMenu?.edgeId) selectedEdgeIds.add(elemCtxMenu.edgeId);

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
  }, [setNodes, setEdges, elemCtxMenu, closeElemCtxMenu, scheduleSave]);

  // Close element context menu on click elsewhere
  useEffect(() => {
    if (!elemCtxMenu) return;
    const handler = () => closeElemCtxMenu();
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [elemCtxMenu, closeElemCtxMenu]);

  // Pane context menu (right-click on empty canvas)
  const handlePaneContextMenu = useCallback(
    (event: ReactMouseEvent) => {
      event.preventDefault();
      const flowPos = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      setCtxMenu({ x: event.clientX, y: event.clientY, flowX: flowPos.x, flowY: flowPos.y });
      setElemCtxMenu(null);
      setShowNoteSelect(false);
      setNoteFilter("");
    },
    [reactFlowInstance],
  );

  const closeCtxMenu = useCallback(() => {
    setCtxMenu(null);
    setShowNoteSelect(false);
    setNoteFilter("");
  }, []);

  const addNodeAtMenu = useCallback(
    (type: string, data: Record<string, unknown>, width = 250, height = 100) => {
      if (!ctxMenu) return;
      const id = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setNodes((nds) => [
        ...nds,
        {
          id,
          type,
          position: { x: ctxMenu.flowX, y: ctxMenu.flowY },
          data,
          style: { width, height },
          ...(type === "canvasGroup" ? { zIndex: -1 } : {}),
        },
      ]);
      closeCtxMenu();
      requestAnimationFrame(() => scheduleSave());
    },
    [ctxMenu, setNodes, closeCtxMenu, scheduleSave],
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

  // ── Toolbar: add node at viewport center ────────────────────────────────
  const [toolbarPicker, setToolbarPicker] = useState(false);
  const [toolbarFilter, setToolbarFilter] = useState("");

  const addNodeAtCenter = useCallback(
    (type: string, data: Record<string, unknown>, width = 250, height = 100) => {
      const viewport = reactFlowInstance.getViewport();
      const container = document.querySelector(".canvas-container");
      const cw = container?.clientWidth ?? 800;
      const ch = container?.clientHeight ?? 600;
      const centerX = (-viewport.x + cw / 2) / viewport.zoom;
      const centerY = (-viewport.y + ch / 2) / viewport.zoom;
      const id = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setNodes((nds) => [
        ...nds,
        {
          id,
          type,
          position: { x: centerX - width / 2, y: centerY - height / 2 },
          data,
          style: { width, height },
          ...(type === "canvasGroup" ? { zIndex: -1 } : {}),
        },
      ]);
      setToolbarPicker(false);
      setToolbarFilter("");
      requestAnimationFrame(() => scheduleSave());
    },
    [reactFlowInstance, setNodes, scheduleSave],
  );

  const toolbarNotes = useMemo(() => {
    if (!toolbarPicker) return [];
    const lf = toolbarFilter.toLowerCase();
    const results: { path: string; title: string; noteType: string }[] = [];
    allNodes.forEach((n) => {
      if (n.note_type === "folder") return;
      if (lf && !n.title.toLowerCase().includes(lf) && !n.path.toLowerCase().includes(lf)) return;
      results.push({ path: n.path, title: n.title, noteType: n.note_type });
    });
    return results.slice(0, 20);
  }, [toolbarPicker, toolbarFilter, allNodes]);

  // Stable nodeTypes reference (must not change between renders)
  const nodeTypes = useMemo(() => NODE_TYPES, []);
  const edgeTypes = useMemo(() => EDGE_TYPES, []);

  // Context menu note picker
  const filteredNotes = useMemo(() => {
    if (!showNoteSelect) return [];
    const lf = noteFilter.toLowerCase();
    const results: { path: string; title: string; noteType: string }[] = [];
    allNodes.forEach((n) => {
      if (n.note_type === "folder") return;
      if (lf && !n.title.toLowerCase().includes(lf) && !n.path.toLowerCase().includes(lf)) return;
      results.push({ path: n.path, title: n.title, noteType: n.note_type });
    });
    return results.slice(0, 20);
  }, [showNoteSelect, noteFilter, allNodes]);

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
    <div className={containerClass}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onPaneContextMenu={handlePaneContextMenu}
        onNodeContextMenu={handleNodeContextMenu}
        onEdgeContextMenu={handleEdgeContextMenu}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        colorMode={colorMode}
        deleteKeyCode={["Backspace", "Delete"]}
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
            className="canvas-toolbar-btn"
            title="Add text card"
            onClick={() => addNodeAtCenter("canvasText", { text: "New text card" })}
          >
            <StickyNote size={22} />
          </button>
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
        </Panel>
      </ReactFlow>
      {toolbarPicker && (
        <div className="canvas-toolbar-picker" onClick={(e) => e.stopPropagation()}>
          <input
            className="canvas-note-picker-input"
            type="text"
            placeholder="Search notes..."
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
          {!showNoteSelect ? (
            <>
              <div
                className="context-menu-item"
                onClick={() => addNodeAtMenu("canvasText", { text: "New text card" })}
              >
                Add Text Card
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
            </>
          ) : (
            <div className="canvas-note-picker" onClick={(e) => e.stopPropagation()}>
              <input
                className="canvas-note-picker-input"
                type="text"
                placeholder="Search notes..."
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
      {elemCtxMenu && (
        <div
          className="context-menu"
          style={{ left: elemCtxMenu.x, top: elemCtxMenu.y, minWidth: 140 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="context-menu-item context-menu-item--danger" onClick={deleteSelected}>
            Delete
          </div>
        </div>
      )}
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
