import { Files, GitFork, Home, LayoutDashboard, Search, Settings } from "lucide-react";
import { useUIStore } from "../../stores/uiStore";
import type { LeftTab } from "../../stores/uiStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { useSegmentStore } from "../../stores/segmentStore";

const SIDEBAR_ITEMS: { tab: LeftTab; icon: typeof Files; label: string }[] = [
  { tab: "files", icon: Files, label: "Files" },
  { tab: "graph", icon: GitFork, label: "Graph" },
  { tab: "search", icon: Search, label: "Search" },
  { tab: "canvas", icon: LayoutDashboard, label: "Canvas" },
];

export function IconSidebar() {
  const activeLeftTab = useUIStore((s) => s.activeLeftTab);
  const leftPanelCollapsed = useUIStore((s) => s.leftPanelCollapsed);
  const setActiveLeftTab = useUIStore((s) => s.setActiveLeftTab);
  const toggleLeftPanel = useUIStore((s) => s.toggleLeftPanel);
  const closeSegment = useWorkspaceStore((s) => s.closeSegment);
  const activeSegmentId = useSegmentStore((s) => s.activeSegmentId);

  const handleClick = (tab: LeftTab) => {
    if (tab === activeLeftTab && !leftPanelCollapsed) {
      toggleLeftPanel();
    } else {
      setActiveLeftTab(tab);
    }
  };

  return (
    <nav className="icon-sidebar" aria-label="Sidebar">
      <button
        className="icon-sidebar-btn"
        onClick={() => activeSegmentId && closeSegment(activeSegmentId)}
        title="Close segment"
        aria-label="Close segment"
      >
        <Home size={20} />
      </button>
      {SIDEBAR_ITEMS.map(({ tab, icon: Icon, label }) => (
        <button
          key={tab}
          className={`icon-sidebar-btn ${tab === activeLeftTab && !leftPanelCollapsed ? "active" : ""}`}
          onClick={() => handleClick(tab)}
          title={label}
          aria-label={label}
        >
          <Icon size={20} />
        </button>
      ))}
      <button
        className="icon-sidebar-btn"
        onClick={() => useUIStore.getState().openSettings()}
        title="Settings (⌘,)"
        aria-label="Settings"
      >
        <Settings size={20} />
      </button>
    </nav>
  );
}
