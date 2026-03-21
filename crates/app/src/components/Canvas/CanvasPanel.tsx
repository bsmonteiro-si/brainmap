import { useState, useMemo } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { LayoutDashboard, FolderOpen, Plus } from "lucide-react";
import { useUIStore } from "../../stores/uiStore";
import { useGraphStore } from "../../stores/graphStore";
import { CanvasEditorInner, CanvasPanelModeContext } from "../Editor/CanvasEditor";

export function CanvasPanel() {
  const activeCanvasPath = useUIStore((s) => s.activeCanvasPath);
  const openCanvasInPanel = useUIStore((s) => s.openCanvasInPanel);
  const workspaceFiles = useGraphStore((s) => s.workspaceFiles);
  const [showPicker, setShowPicker] = useState(false);

  // List all .canvas files in workspace
  const canvasFiles = useMemo(
    () => workspaceFiles.filter((f) => f.toLowerCase().endsWith(".canvas")).sort(),
    [workspaceFiles],
  );

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

  const currentName = activeCanvasPath?.split("/").pop() ?? null;

  return (
    <div className="canvas-panel">
      <div className="canvas-panel-header">
        <LayoutDashboard size={14} style={{ flexShrink: 0, color: "var(--text-muted)" }} />
        <button
          className="canvas-panel-selector"
          onClick={() => setShowPicker(!showPicker)}
          title="Switch canvas"
        >
          <span className="canvas-panel-selector-label">
            {currentName ?? "No canvas open"}
          </span>
          <FolderOpen size={12} />
        </button>
        <button
          className="canvas-panel-create-btn"
          onClick={handleCreate}
          title="Create new canvas"
        >
          <Plus size={14} />
        </button>
      </div>
      {showPicker && (
        <div className="canvas-panel-picker">
          {canvasFiles.length === 0 ? (
            <div className="canvas-panel-picker-empty">No canvas files found</div>
          ) : (
            canvasFiles.map((f) => (
              <div
                key={f}
                className={`canvas-panel-picker-item${f === activeCanvasPath ? " active" : ""}`}
                onClick={() => {
                  openCanvasInPanel(f);
                  setShowPicker(false);
                }}
              >
                {f}
              </div>
            ))
          )}
        </div>
      )}
      <div className="canvas-panel-body">
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
