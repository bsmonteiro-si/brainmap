import { useCallback, useEffect } from "react";
import { Panel, Group, Separator, usePanelRef } from "react-resizable-panels";
import type { Layout } from "react-resizable-panels";
import { useUIStore } from "../../stores/uiStore";
import { GraphView } from "../GraphView/GraphView";
import { EditorPanel } from "../Editor/EditorPanel";
import { SearchPanel } from "../Search/SearchPanel";
import { StatusBar } from "../StatusBar/StatusBar";
import { FileTreePanel } from "./FileTreePanel";
import { IconSidebar } from "./IconSidebar";

const PANEL_IDS = {
  content: "content",
  editor: "editor",
} as const;

export function AppLayout() {
  const contentPanelRef = usePanelRef();
  const focusMode = useUIStore((s) => s.focusMode);
  const activeLeftTab = useUIStore((s) => s.activeLeftTab);
  const leftPanelCollapsed = useUIStore((s) => s.leftPanelCollapsed);
  const graphFocusPath = useUIStore((s) => s.graphFocusPath);
  const clearGraphFocus = useUIStore((s) => s.clearGraphFocus);
  const savePanelSizes = useUIStore((s) => s.savePanelSizes);
  const panelSizes = useUIStore((s) => s.panelSizes);

  // Sync leftPanelCollapsed → panel collapse/expand
  useEffect(() => {
    if (leftPanelCollapsed) {
      contentPanelRef.current?.collapse();
    } else {
      contentPanelRef.current?.expand();
    }
  }, [leftPanelCollapsed, contentPanelRef]);

  const handleLayout = useCallback(
    (layout: Layout) => {
      savePanelSizes({ content: layout[0], editor: layout[1] });
    },
    [savePanelSizes]
  );

  return (
    <>
      <div className="app-layout-root">
        <IconSidebar />
        <Group
          orientation="horizontal"
          className="app-layout"
          onLayoutChanged={handleLayout}
        >
          <Panel
            panelRef={contentPanelRef}
            defaultSize={`${panelSizes.content ?? 30}%`}
            minSize="10%"
            collapsible
            id={PANEL_IDS.content}
          >
            <div className="panel" style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div
                style={{ flex: 1, overflow: "hidden", display: activeLeftTab === "graph" ? "flex" : "none", flexDirection: "column" }}
              >
                <GraphView />
              </div>
              <div
                style={{ flex: 1, overflow: "hidden", display: activeLeftTab === "files" ? "flex" : "none", flexDirection: "column" }}
              >
                <FileTreePanel />
              </div>
              <div
                style={{ flex: 1, overflow: "hidden", display: activeLeftTab === "search" ? "flex" : "none", flexDirection: "column" }}
              >
                <SearchPanel />
              </div>
            </div>
          </Panel>
          <Separator className="resize-handle-h" />
          <Panel defaultSize={`${panelSizes.editor ?? 70}%`} minSize="15%" id={PANEL_IDS.editor}>
            <div className="panel" style={{ height: "100%" }}>
              <div className="panel-content">
                <EditorPanel />
              </div>
            </div>
          </Panel>
        </Group>
      </div>
      <StatusBar />
    </>
  );
}
