import { useCallback, useEffect, useRef } from "react";
import { Panel, Group, Separator, usePanelRef } from "react-resizable-panels";
import type { Layout } from "react-resizable-panels";
import { useUIStore } from "../../stores/uiStore";
import { getTabSizes } from "../../stores/uiStore";
import { GraphView } from "../GraphView/GraphView";
import { EditorPanel } from "../Editor/EditorPanel";
import { SearchPanel } from "../Search/SearchPanel";
import { StatusBar } from "../StatusBar/StatusBar";
import { FileTreePanel } from "./FileTreePanel";
import { IconSidebar } from "./IconSidebar";
import { TabBar } from "../Editor/TabBar";

const PANEL_IDS = {
  content: "content",
  editor: "editor",
} as const;

export function AppLayout() {
  const contentPanelRef = usePanelRef();
  const editorPanelRef = usePanelRef();
  const activeLeftTab = useUIStore((s) => s.activeLeftTab);
  const leftPanelCollapsed = useUIStore((s) => s.leftPanelCollapsed);
  const filesTheme = useUIStore((s) => s.filesTheme);
  const effectiveFilesTheme = useUIStore((s) => s.effectiveFilesTheme);
  const editorTheme = useUIStore((s) => s.editorTheme);
  const effectiveEditorTheme = useUIStore((s) => s.effectiveEditorTheme);
  const savePanelSizes = useUIStore((s) => s.savePanelSizes);
  const panelSizes = useUIStore((s) => s.panelSizes);
  const isFirstMount = useRef(true);

  const tabSizes = getTabSizes(panelSizes, activeLeftTab);

  // Sync leftPanelCollapsed → panel collapse/expand
  useEffect(() => {
    if (leftPanelCollapsed) {
      contentPanelRef.current?.collapse();
    } else {
      contentPanelRef.current?.expand();
    }
  }, [leftPanelCollapsed, contentPanelRef]);

  // When activeLeftTab or panelSizes change, imperatively resize panels to the
  // stored sizes for that tab. Skip the first mount (defaultSize handles that).
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (!leftPanelCollapsed) {
      contentPanelRef.current?.resize(`${tabSizes.content}%`);
      editorPanelRef.current?.resize(`${tabSizes.editor}%`);
    }
  }, [activeLeftTab, leftPanelCollapsed, tabSizes.content, tabSizes.editor, contentPanelRef, editorPanelRef]);

  const handleLayout = useCallback(
    (layout: Layout) => {
      if (useUIStore.getState().leftPanelCollapsed) return;
      const tab = useUIStore.getState().activeLeftTab;
      savePanelSizes(tab, { content: layout[PANEL_IDS.content], editor: layout[PANEL_IDS.editor] });
    },
    [savePanelSizes]
  );

  return (
    <>
      <StatusBar />
      <div className="app-layout-root">
        <IconSidebar />
        <Group
          orientation="horizontal"
          className="app-layout"
          onLayoutChanged={handleLayout}
        >
          <Panel
            panelRef={contentPanelRef}
            defaultSize={`${tabSizes.content}%`}
            minSize="10%"
            collapsible
            id={PANEL_IDS.content}
          >
            <div className="panel" style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }} {...(filesTheme !== "inherit" ? { "data-theme": effectiveFilesTheme } : {})}>
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
          <Panel
            panelRef={editorPanelRef}
            defaultSize={`${tabSizes.editor}%`}
            minSize="15%"
            id={PANEL_IDS.editor}
          >
            <div className="panel" style={{ height: "100%", display: "flex", flexDirection: "column" }} {...(editorTheme !== "inherit" ? { "data-theme": effectiveEditorTheme } : {})}>
              <TabBar />
              <div className="panel-content" style={{ flex: 1, minHeight: 0 }}>
                <EditorPanel />
              </div>
            </div>
          </Panel>
        </Group>
      </div>
    </>
  );
}
