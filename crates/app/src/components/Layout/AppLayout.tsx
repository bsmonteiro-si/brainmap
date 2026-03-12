import { useCallback, useEffect } from "react";
import { Panel, Group, Separator, usePanelRef } from "react-resizable-panels";
import type { Layout } from "react-resizable-panels";
import { useUIStore } from "../../stores/uiStore";
import { GraphView } from "../GraphView/GraphView";
import { EditorPanel } from "../Editor/EditorPanel";
import { SearchPanel } from "../Search/SearchPanel";
import { StatusBar } from "../StatusBar/StatusBar";
import { FileTreePanel } from "./FileTreePanel";
const PANEL_IDS = {
  graph: "graph",
  right: "right",
  editor: "editor",
  search: "search",
} as const;

export function AppLayout() {
  const graphPanelRef = usePanelRef();
  const searchPanelRef = usePanelRef();
  const focusMode = useUIStore((s) => s.focusMode);
  const searchExpanded = useUIStore((s) => s.searchExpanded);
  const treeOpen = useUIStore((s) => s.treeOpen);
  const toggleTree = useUIStore((s) => s.toggleTree);
  const graphFocusPath = useUIStore((s) => s.graphFocusPath);
  const clearGraphFocus = useUIStore((s) => s.clearGraphFocus);
  const savePanelSizes = useUIStore((s) => s.savePanelSizes);
  const panelSizes = useUIStore((s) => s.panelSizes);

  // Sync focusMode → panel collapse/expand
  useEffect(() => {
    if (focusMode) {
      graphPanelRef.current?.collapse();
    } else {
      graphPanelRef.current?.expand();
    }
  }, [focusMode, graphPanelRef]);

  // Sync searchExpanded → panel collapse/expand
  useEffect(() => {
    if (searchExpanded) {
      searchPanelRef.current?.expand();
    } else {
      searchPanelRef.current?.collapse();
    }
  }, [searchExpanded, searchPanelRef]);

  // Expand left panel when tab is toggled (Cmd+B or tab click) so the
  // shortcut is not a no-op when the panel happens to be collapsed
  useEffect(() => {
    if (!focusMode) {
      graphPanelRef.current?.expand();
    }
  }, [treeOpen, focusMode, graphPanelRef]);

  const handleOuterLayout = useCallback(
    (layout: Layout) => {
      // Layout is a positional number[] ordered by panel declaration (graph=0, right=1)
      savePanelSizes({ graph: layout[0], right: layout[1] });
    },
    [savePanelSizes]
  );

  const handleRightLayout = useCallback(
    (layout: Layout) => {
      // Positional: editor=0, search=1
      savePanelSizes({ editor: layout[0], search: layout[1] });
    },
    [savePanelSizes]
  );

  return (
    <>
      <Group
        orientation="horizontal"
        className="app-layout"
        onLayoutChanged={handleOuterLayout}
      >
        <Panel
          panelRef={graphPanelRef}
          defaultSize={`${panelSizes.graph ?? 60}%`}
          minSize="10%"
          collapsible
          id={PANEL_IDS.graph}
        >
          <div className="panel" style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div role="tablist" aria-label="Left panel view" className="left-panel-tabs">
              <button
                role="tab"
                aria-selected={!treeOpen}
                aria-controls="left-graph-panel"
                id="left-graph-tab"
                className={`left-panel-tab ${!treeOpen ? "active" : ""}`}
                onClick={() => {
                  if (!treeOpen && graphFocusPath) {
                    // Already on Graph tab: clear focus to return to full graph
                    clearGraphFocus();
                  } else if (treeOpen) {
                    toggleTree();
                  }
                }}
              >
                Graph
              </button>
              <button
                role="tab"
                aria-selected={treeOpen}
                aria-controls="left-files-panel"
                id="left-files-tab"
                className={`left-panel-tab ${treeOpen ? "active" : ""}`}
                onClick={() => !treeOpen && toggleTree()}
              >
                Files
              </button>
            </div>
            <div
              role="tabpanel"
              id="left-graph-panel"
              aria-labelledby="left-graph-tab"
              style={{ flex: 1, overflow: "hidden", display: treeOpen ? "none" : "flex", flexDirection: "column" }}
            >
              <GraphView />
            </div>
            <div
              role="tabpanel"
              id="left-files-panel"
              aria-labelledby="left-files-tab"
              style={{ flex: 1, overflow: "hidden", display: treeOpen ? "flex" : "none", flexDirection: "column" }}
            >
              <FileTreePanel />
            </div>
          </div>
        </Panel>
        <Separator className="resize-handle-h" />
        <Panel defaultSize={`${panelSizes.right ?? 40}%`} minSize="10%" id={PANEL_IDS.right}>
          <Group
            orientation="vertical"
            onLayoutChanged={handleRightLayout}
          >
            <Panel defaultSize={`${panelSizes.editor ?? 60}%`} minSize="15%" id={PANEL_IDS.editor}>
              <div className="panel" style={{ height: "100%" }}>
                <div className="panel-content">
                  <EditorPanel />
                </div>
              </div>
            </Panel>
            <Separator className="resize-handle-v" />
            <Panel
              panelRef={searchPanelRef}
              defaultSize={`${panelSizes.search ?? 40}%`}
              minSize="8%"
              collapsible
              collapsedSize="28px"
              id={PANEL_IDS.search}
            >
              <div className="panel" style={{ height: "100%" }}>
                <div className="panel-content">
                  <SearchPanel />
                </div>
              </div>
            </Panel>
          </Group>
        </Panel>
      </Group>
      <StatusBar />
    </>
  );
}
