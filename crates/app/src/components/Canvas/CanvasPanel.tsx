import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { LayoutDashboard, Plus, ChevronDown } from "lucide-react";
import { useUIStore } from "../../stores/uiStore";
import { useGraphStore } from "../../stores/graphStore";
import { CanvasEditorInner, CanvasPanelModeContext } from "../Editor/CanvasEditor";

export function CanvasPanel() {
  const activeCanvasPath = useUIStore((s) => s.activeCanvasPath);
  const openCanvasInPanel = useUIStore((s) => s.openCanvasInPanel);
  const canvasPanelFontFamily = useUIStore((s) => s.canvasPanelFontFamily);
  const canvasPanelFontSize = useUIStore((s) => s.canvasPanelFontSize);
  const workspaceFiles = useGraphStore((s) => s.workspaceFiles);
  const [showPicker, setShowPicker] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  // List all .canvas files in workspace
  const canvasFiles = useMemo(
    () => workspaceFiles.filter((f) => f.toLowerCase().endsWith(".canvas")).sort(),
    [workspaceFiles],
  );

  const closePicker = useCallback(() => setShowPicker(false), []);

  // Close picker on click outside header area
  useEffect(() => {
    if (!showPicker) return;
    const handler = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        closePicker();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPicker, closePicker]);

  const handleCreate = () => {
    // Generate default name
    let name = "Untitled";
    let counter = 2;
    while (workspaceFiles.includes(name + ".canvas")) {
      name = `Untitled-${counter}`;
      counter++;
    }
    useUIStore.getState().openCreateNoteDialog(name);
    useUIStore.setState({ createFileKind: "canvas" });
    setShowPicker(false);
  };

  const currentName = activeCanvasPath?.split("/").pop()?.replace(/\.canvas$/i, "") ?? null;

  return (
    <div className="canvas-panel">
      <div ref={headerRef} className="canvas-panel-header" style={{ fontFamily: canvasPanelFontFamily, fontSize: canvasPanelFontSize }}>
        <div className="canvas-panel-icon">
          <LayoutDashboard size={14} />
        </div>
        <button
          className="canvas-panel-selector"
          onClick={() => setShowPicker(!showPicker)}
          title="Switch canvas"
        >
          <span className="canvas-panel-selector-label">
            {currentName ?? "No canvas open"}
          </span>
          <span className="canvas-panel-selector-badge">.canvas</span>
          <ChevronDown size={12} className={`canvas-panel-chevron${showPicker ? " canvas-panel-chevron--open" : ""}`} />
        </button>
        <button
          className="canvas-panel-create-btn"
          onClick={handleCreate}
          title="Create new canvas"
        >
          <Plus size={14} />
        </button>
        {showPicker && (
          <div className="canvas-panel-picker" style={{ fontFamily: canvasPanelFontFamily, fontSize: canvasPanelFontSize }}>
            {canvasFiles.length === 0 ? (
              <div className="canvas-panel-picker-empty">No canvas files found</div>
            ) : (
              canvasFiles.map((f) => {
                const fileName = f.split("/").pop()?.replace(/\.canvas$/i, "") ?? f;
                const dir = f.includes("/") ? f.slice(0, f.lastIndexOf("/")) : null;
                return (
                  <div
                    key={f}
                    className={`canvas-panel-picker-item${f === activeCanvasPath ? " active" : ""}`}
                    onClick={() => {
                      openCanvasInPanel(f);
                      setShowPicker(false);
                    }}
                  >
                    <LayoutDashboard size={13} className="canvas-panel-picker-icon" />
                    <div className="canvas-panel-picker-info">
                      <span className="canvas-panel-picker-name">{fileName}</span>
                      {dir && <span className="canvas-panel-picker-dir">{dir}</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      <div className="canvas-panel-body" onMouseDownCapture={showPicker ? closePicker : undefined}>
        {activeCanvasPath ? (
          <CanvasPanelModeContext.Provider value={true}>
            <ReactFlowProvider key={activeCanvasPath}>
              <CanvasEditorInner path={activeCanvasPath} />
            </ReactFlowProvider>
          </CanvasPanelModeContext.Provider>
        ) : (
          <div className="canvas-panel-empty">
            <LayoutDashboard size={40} style={{ opacity: 0.2 }} />
            <div>Open a canvas from Files or create a new one</div>
          </div>
        )}
      </div>
    </div>
  );
}
