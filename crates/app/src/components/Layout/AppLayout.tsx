import { useCallback, useEffect, useRef } from "react";
import { Panel, Group, Separator, usePanelRef } from "react-resizable-panels";
import type { Layout } from "react-resizable-panels";
import { useUIStore, getTabSizes } from "../../stores/uiStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { useSegmentStore } from "../../stores/segmentStore";
import { GraphView } from "../GraphView/GraphView";
import { EditorPanel } from "../Editor/EditorPanel";
import { SearchPanel } from "../Search/SearchPanel";
import { StatusBar, SegmentSwitcher } from "../StatusBar/StatusBar";
import { FileTreePanel } from "./FileTreePanel";
import { IconSidebar } from "./IconSidebar";
import { CanvasPanel } from "../Canvas/CanvasPanel";
import { VideoPipPanel } from "../Editor/VideoPipPanel";
import { TabBar } from "../Editor/TabBar";
import { CanvasEditor } from "../Editor/CanvasEditor";

const PANEL_IDS = {
  content: "content",
  editor: "editor",
} as const;

export function AppLayout() {
  const contentPanelRef = usePanelRef();
  const editorPanelRef = usePanelRef();
  const activeLeftTab = useUIStore((s) => s.activeLeftTab);
  const leftPanelCollapsed = useUIStore((s) => s.leftPanelCollapsed);
  const canvasFullscreen = useUIStore((s) => s.canvasFullscreen);
  const filesTheme = useUIStore((s) => s.filesTheme);
  const effectiveFilesTheme = useUIStore((s) => s.effectiveFilesTheme);
  const editorTheme = useUIStore((s) => s.editorTheme);
  const effectiveEditorTheme = useUIStore((s) => s.effectiveEditorTheme);
  const savePanelSizes = useUIStore((s) => s.savePanelSizes);
  const panelSizes = useUIStore((s) => s.panelSizes);
  const headerLayout = useUIStore((s) => s.headerLayout);
  const info = useWorkspaceStore((s) => s.info);
  const activeSegment = useSegmentStore((s) => s.segments.find((seg) => seg.id === s.activeSegmentId));
  const segmentName = activeSegment?.name ?? info?.name ?? "";
  const isFirstMount = useRef(true);

  const tabSizes = getTabSizes(panelSizes, activeLeftTab);

  // Sync leftPanelCollapsed → panel collapse/expand (only when not fullscreen)
  useEffect(() => {
    if (canvasFullscreen) return;
    if (leftPanelCollapsed) {
      contentPanelRef.current?.collapse();
    } else {
      contentPanelRef.current?.expand();
    }
  }, [leftPanelCollapsed, contentPanelRef, canvasFullscreen]);

  // When activeLeftTab or panelSizes change, imperatively resize panels to the
  // stored sizes for that tab. Skip the first mount (defaultSize handles that).
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (!leftPanelCollapsed && !canvasFullscreen) {
      contentPanelRef.current?.resize(`${tabSizes.content}%`);
      editorPanelRef.current?.resize(`${tabSizes.editor}%`);
    }
  }, [activeLeftTab, leftPanelCollapsed, canvasFullscreen, tabSizes.content, tabSizes.editor, contentPanelRef, editorPanelRef]);

  const handleLayout = useCallback(
    (layout: Layout) => {
      if (useUIStore.getState().leftPanelCollapsed) return;
      if (useUIStore.getState().canvasFullscreen) return;
      const tab = useUIStore.getState().activeLeftTab;
      savePanelSizes(tab, { content: layout[PANEL_IDS.content], editor: layout[PANEL_IDS.editor] });
    },
    [savePanelSizes]
  );

  // Fullscreen mode: render only the canvas, no chrome
  if (canvasFullscreen) {
    return (
      <>
        <div className="app-layout-root" style={{ width: "100%", height: "100vh" }}>
          <CanvasEditor path={canvasFullscreen} />
        </div>
        <VideoPipPanel />
      </>
    );
  }

  return (
    <>
      {headerLayout === "elevated" && <StatusBar />}
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
              {headerLayout === "sidebar" && (
                <div className="segment-header">
                  <span className="segment-header-monogram">{segmentName.charAt(0).toUpperCase()}</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 1, flex: 1, minWidth: 0 }}>
                    <SegmentSwitcher />
                    {info && <span className="status-bar-note-count" style={{ paddingLeft: 2 }}>{info.node_count} notes</span>}
                  </div>
                </div>
              )}
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
              <div
                style={{ flex: 1, overflow: "hidden", display: activeLeftTab === "canvas" ? "flex" : "none", flexDirection: "column" }}
              >
                <CanvasPanel />
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
              {headerLayout === "merged" ? (
                <div className="tab-bar-with-segment">
                  <SegmentSwitcher compact />
                  <TabBar />
                </div>
              ) : (
                <TabBar />
              )}
              <div className="panel-content" style={{ flex: 1, minHeight: 0 }}>
                <EditorPanel />
              </div>
            </div>
          </Panel>
        </Group>
      </div>
      <VideoPipPanel />
    </>
  );
}
