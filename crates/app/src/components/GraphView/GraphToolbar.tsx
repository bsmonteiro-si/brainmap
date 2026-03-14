import { useRef, useState, useEffect } from "react";
import { Home } from "lucide-react";
import { useUIStore, type GraphLayout } from "../../stores/uiStore";
import { useGraphStore } from "../../stores/graphStore";

export function GraphToolbar() {
  const showEdgeLabels = useUIStore((s) => s.showEdgeLabels);
  const toggleEdgeLabels = useUIStore((s) => s.toggleEdgeLabels);
  const showLegend = useUIStore((s) => s.showLegend);
  const toggleLegend = useUIStore((s) => s.toggleLegend);
  const graphLayout = useUIStore((s) => s.graphLayout);
  const setGraphLayout = useUIStore((s) => s.setGraphLayout);
  const hiddenEdgeTypes = useUIStore((s) => s.hiddenEdgeTypes);
  const toggleEdgeType = useUIStore((s) => s.toggleEdgeType);
  const graphFocusPath = useUIStore((s) => s.graphFocusPath);
  const clearGraphFocus = useUIStore((s) => s.clearGraphFocus);
  const homeNotePath = useUIStore((s) => s.homeNotePath);
  const setGraphFocus = useUIStore((s) => s.setGraphFocus);
  const showMinimap = useUIStore((s) => s.showMinimap);
  const toggleMinimap = useUIStore((s) => s.toggleMinimap);
  const showClusterHulls = useUIStore((s) => s.showClusterHulls);
  const toggleClusterHulls = useUIStore((s) => s.toggleClusterHulls);
  const showEdgeParticles = useUIStore((s) => s.showEdgeParticles);
  const toggleEdgeParticles = useUIStore((s) => s.toggleEdgeParticles);
  const edges = useGraphStore((s) => s.edges);

  const [edgeFilterOpen, setEdgeFilterOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const edgeTypes = Array.from(new Set(edges.map((e) => e.rel))).sort();

  useEffect(() => {
    if (!edgeFilterOpen) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setEdgeFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [edgeFilterOpen]);

  return (
    <div className="graph-toolbar">
      <button
        className={showEdgeLabels ? "active" : ""}
        onClick={toggleEdgeLabels}
        title="Toggle edge labels"
      >
        Labels
      </button>
      <button
        className={showLegend ? "active" : ""}
        onClick={toggleLegend}
        title="Toggle color legend"
      >
        Legend
      </button>
      <select
        value={graphLayout}
        onChange={(e) => setGraphLayout(e.target.value as GraphLayout)}
      >
        <option value="force">Force Layout</option>
        <option value="hierarchical">Hierarchical (LR)</option>
        <option value="radial">Radial</option>
        <option value="concentric">Concentric</option>
        <option value="grouped">Grouped by Type</option>
      </select>
      {homeNotePath && (
        <button
          onClick={() => {
            setGraphFocus(homeNotePath, "note");
            setGraphLayout("radial");
          }}
          title="Go to home note (radial view)"
        >
          <Home size={14} /> Home
        </button>
      )}
      <div ref={popoverRef} style={{ position: "relative" }}>
        <button
          className={edgeTypes.some((r) => hiddenEdgeTypes.has(r)) ? "active" : ""}
          onClick={() => setEdgeFilterOpen((o) => !o)}
          title="Filter edge types"
        >
          {edgeTypes.some((r) => hiddenEdgeTypes.has(r))
            ? `Edges (${edgeTypes.filter((r) => !hiddenEdgeTypes.has(r)).length}/${edgeTypes.length})`
            : "Edges"}
        </button>
        {edgeFilterOpen && (
          <div className="edge-filter-popover">
            {edgeTypes.map((rel) => (
              <label key={rel} className="edge-filter-item">
                <input
                  type="checkbox"
                  checked={!hiddenEdgeTypes.has(rel)}
                  onChange={() => toggleEdgeType(rel)}
                />
                {rel}
              </label>
            ))}
          </div>
        )}
      </div>
      <button
        className={showMinimap ? "active" : ""}
        onClick={toggleMinimap}
        title="Toggle minimap"
      >
        Minimap
      </button>
      <button
        className={showClusterHulls ? "active" : ""}
        onClick={toggleClusterHulls}
        title="Toggle cluster hulls"
      >
        Hulls
      </button>
      <button
        className={showEdgeParticles ? "active" : ""}
        onClick={toggleEdgeParticles}
        title="Toggle edge particles"
      >
        Particles
      </button>
      {graphFocusPath && (
        <button
          className="active"
          onClick={clearGraphFocus}
          title="Exit focus view — return to full graph"
          style={{ borderColor: "var(--warning, #e67e22)", background: "var(--warning, #e67e22)", color: "#1a1a1a" }}
        >
          Focus ×
        </button>
      )}
    </div>
  );
}
