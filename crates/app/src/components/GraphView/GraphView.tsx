import { useRef, useEffect, useState, useMemo } from "react";
import cytoscape, { type Core } from "cytoscape";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — cytoscape-fcose ships its own types but may not resolve in all configs
import fcose from "cytoscape-fcose";
import dagre from "cytoscape-dagre";
import { useGraphStore } from "../../stores/graphStore";
import { useEditorStore } from "../../stores/editorStore";
import { useUIStore } from "../../stores/uiStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { getAPI } from "../../api/bridge";
import type { NodeSummary } from "../../api/types";
import type { GraphLayout } from "../../stores/uiStore";
import { graphStylesheet, getNodeColor, getNodeShape } from "./graphStyles";
import { getNodeIconSvg, getNodeIconSvgWhite } from "./graphIcons";

const BASE_NODE_SIZE = 18;
import { filterGraphByFocus } from "./graphFocusFilter";
import { computeHulls, drawCachedHulls, type CachedHull } from "./graphHulls";
import { startParticleAnimation } from "./graphParticles";
import { GraphToolbar } from "./GraphToolbar";
import { GraphLegend } from "./GraphLegend";

cytoscape.use(fcose);
cytoscape.use(dagre);

const DIRECTIONAL_RELS = new Set([
  "precedes",
  "leads-to",
  "causes",
  "extends",
  "depends-on",
  "evolved-from",
  "part-of",
  "contains",
]);

function applyEdgeLabelVisibility(cy: Core, show: boolean, selectedPath: string | null) {
  if (show) {
    cy.edges().addClass("labeled");
  } else {
    cy.edges().removeClass("labeled");
  }
  if (selectedPath) {
    cy.getElementById(selectedPath).connectedEdges().addClass("labeled");
  }
}

function getMostConnectedNodeId(cy: Core): string | undefined {
  let maxDeg = 0;
  let maxId: string | undefined;
  cy.nodes().forEach((n) => {
    const d = n.degree(false);
    if (d > maxDeg) { maxDeg = d; maxId = n.id(); }
  });
  return maxId;
}

function getRadialRootId(cy: Core): string | undefined {
  return useUIStore.getState().homeNotePath ?? getMostConnectedNodeId(cy);
}

function runLayout(cy: Core, layout: GraphLayout, animate = false, rootNodeId?: string | null) {
  if (layout === "hierarchical") {
    cy.elements()
      .filter((el) => el.isNode() || DIRECTIONAL_RELS.has(el.data("label") as string))
      .layout({
        name: "dagre",
        rankDir: "LR",
        nodeSep: 60,
        rankSep: 120,
        animate,
        animationDuration: 500,
        animationEasing: "ease-in-out-sine",
        fit: true,
        padding: 40,
      } as cytoscape.LayoutOptions)
      .run();
  } else if (layout === "radial") {
    const root = rootNodeId ?? getMostConnectedNodeId(cy);
    cy.layout({
      name: "breadthfirst",
      circle: true,
      roots: root ? [root] : undefined,
      spacingFactor: 1.5,
      animate,
      animationDuration: 500,
      animationEasing: "ease-in-out-sine",
      fit: true,
      padding: 60,
    } as cytoscape.LayoutOptions).run();
  } else if (layout === "concentric") {
    cy.layout({
      name: "concentric",
      concentric: (node: cytoscape.NodeSingular) => node.degree(false),
      levelWidth: () => 2,
      minNodeSpacing: 60,
      animate,
      animationDuration: 500,
      animationEasing: "ease-in-out-sine",
      fit: true,
      padding: 60,
    } as cytoscape.LayoutOptions).run();
  } else if (layout === "grouped") {
    // Partition nodes by type, assign group centers on a circle
    const typeGroups = new Map<string, string[]>();
    cy.nodes().forEach((n) => {
      const t = n.data("noteType") as string;
      if (!typeGroups.has(t)) typeGroups.set(t, []);
      typeGroups.get(t)!.push(n.id());
    });

    const groupCount = typeGroups.size;
    const radius = Math.max(200, cy.nodes().length * 8);
    let gi = 0;

    for (const [, ids] of typeGroups) {
      const angle = (2 * Math.PI * gi) / groupCount;
      const cx = radius * Math.cos(angle);
      const cy_ = radius * Math.sin(angle);
      ids.forEach((id, j) => {
        const jitterAngle = (2 * Math.PI * j) / ids.length;
        const jitterR = Math.min(80, ids.length * 10);
        cy.getElementById(id).position({
          x: cx + jitterR * Math.cos(jitterAngle),
          y: cy_ + jitterR * Math.sin(jitterAngle),
        });
      });
      gi++;
    }

    // Run fcose with pre-positioned nodes (randomize: false) and stronger gravity to keep clusters
    cy.layout({
      name: "fcose",
      animate,
      animationDuration: 500,
      animationEasing: "ease-in-out-sine",
      quality: "proof",
      idealEdgeLength: 150,
      nodeRepulsion: 30000,
      edgeElasticity: 0.20,
      gravity: 0.25,
      gravityRange: 3.0,
      numIter: 1500,
      fit: true,
      padding: 60,
      nodeDimensionsIncludeLabels: false,
      randomize: false,
    } as cytoscape.LayoutOptions).run();
  } else {
    // "force" layout (default fallback)
    cy.layout({
      name: "fcose",
      animate,
      animationDuration: 500,
      animationEasing: "ease-in-out-sine",
      quality: "proof",
      idealEdgeLength: 280,
      nodeRepulsion: 75000,
      edgeElasticity: 0.30,
      gravity: 0.04,
      gravityRange: 5.0,
      numIter: 2500,
      fit: true,
      padding: 60,
      nodeDimensionsIncludeLabels: false,
    } as cytoscape.LayoutOptions).run();
  }
}

export function GraphView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const hasBeenFittedRef = useRef(false);
  const hasEnteredRef = useRef(false);
  const { nodes, edges, selectedNodePath, isLoading } = useGraphStore();
  const showEdgeLabels = useUIStore((s) => s.showEdgeLabels);
  const showLegend = useUIStore((s) => s.showLegend);
  const graphLayout = useUIStore((s) => s.graphLayout);
  const activeLeftTab = useUIStore((s) => s.activeLeftTab);
  const hiddenEdgeTypes = useUIStore((s) => s.hiddenEdgeTypes);
  const graphFocusPath = useUIStore((s) => s.graphFocusPath);
  const graphFocusKind = useUIStore((s) => s.graphFocusKind);
  const showMinimap = useUIStore((s) => s.showMinimap);
  const showClusterHulls = useUIStore((s) => s.showClusterHulls);
  const showEdgeParticles = useUIStore((s) => s.showEdgeParticles);
  const stats = useWorkspaceStore((s) => s.stats);
  const showEdgeLabelsRef = useRef(showEdgeLabels);
  const graphLayoutRef = useRef(graphLayout);
  const selectedNodePathRef = useRef(selectedNodePath);
  const prevInvertedNodeIdRef = useRef<string | null>(null);
  const minimapContainerRef = useRef<HTMLDivElement>(null);
  const minimapCyRef = useRef<Core | null>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement>(null);
  const hullCanvasRef = useRef<HTMLCanvasElement>(null);
  const cachedHullsRef = useRef<CachedHull[]>([]);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const particleCleanupRef = useRef<(() => void) | null>(null);
  const entranceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Zustand action functions are stable references; initialise once and never update
  const selectNodeRef = useRef(useGraphStore.getState().selectNode);
  const expandNodeRef = useRef(useGraphStore.getState().expandNode);

  const { filteredNodes, filteredEdges, focalPath } = useMemo(() => {
    if (!graphFocusPath || !graphFocusKind) {
      return { filteredNodes: [...nodes.values()], filteredEdges: edges, focalPath: null };
    }
    return filterGraphByFocus(nodes, edges, graphFocusPath, graphFocusKind);
  }, [graphFocusPath, graphFocusKind, nodes, edges]);

  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    nodePath: string;
    label: string;
    noteType: string;
    color: string;
    connections: number;
    tags?: string[];
    summary?: string | null;
  } | null>(null);
  const tooltipCacheRef = useRef<Map<string, NodeSummary>>(new Map());

  // Graph node context menu state
  const [ctxMenu, setCtxMenu] = useState<{
    x: number;
    y: number;
    nodePath: string;
    noteType: string;
  } | null>(null);

  // When graph tab becomes visible after being hidden (display:none), resize
  // the Cytoscape canvas. Fit on first reveal only so subsequent tab switches
  // don't discard the user's zoom/pan. A short delay lets the panel resize
  // animation settle so Cytoscape picks up the final container dimensions.
  useEffect(() => {
    if (activeLeftTab === "graph") {
      const cy = cyRef.current;
      if (cy) {
        // Immediate resize for instant feedback
        cy.resize();
        if (!hasBeenFittedRef.current && cy.nodes().length > 0) {
          cy.fit(undefined, 40);
          hasBeenFittedRef.current = true;
        }
        // Delayed resize after panel animation settles
        const timer = setTimeout(() => {
          cy.resize();
          if (cy.nodes().length > 0) {
            cy.fit(undefined, 40);
          }
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [activeLeftTab]);

  // Sync showEdgeLabels → cy classes
  useEffect(() => {
    showEdgeLabelsRef.current = showEdgeLabels;
    const cy = cyRef.current;
    if (cy) applyEdgeLabelVisibility(cy, showEdgeLabels, selectedNodePathRef.current);
  }, [showEdgeLabels]);

  // Re-run layout when graphLayout changes (animated transition)
  useEffect(() => {
    graphLayoutRef.current = graphLayout;
    const cy = cyRef.current;
    if (cy && cy.nodes().length > 0) {
      const rootId = graphLayout === "radial" ? getRadialRootId(cy) : undefined;
      runLayout(cy, graphLayout, true, rootId);
    }
  }, [graphLayout]);

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      style: graphStylesheet,
      layout: { name: "preset" },
      minZoom: 0.1,
      maxZoom: 5,
      wheelSensitivity: 0.3,
    });

    cyRef.current = cy;

    cy.on("tap", "node", (evt) => {
      const nodePath = evt.target.id();
      const nodeData = useGraphStore.getState().nodes.get(nodePath);
      if (nodeData?.note_type === "folder") {
        // Folder nodes trigger graph focus instead of opening the editor.
        useUIStore.getState().setGraphFocus(nodePath, "folder");
      } else {
        selectNodeRef.current(nodePath);
        useEditorStore.getState().openNote(nodePath);
      }
    });

    cy.on("dbltap", "node", (evt) => {
      const nodePath = evt.target.id();
      expandNodeRef.current(nodePath);
    });

    cy.on("cxttap", "node", (evt) => {
      evt.originalEvent.preventDefault();
      const nodePath = evt.target.id();
      const nodeData = useGraphStore.getState().nodes.get(nodePath);
      const container = containerRef.current;
      const rect = container?.getBoundingClientRect();
      const rp = evt.renderedPosition;
      // Position menu to top-left of click point, clamped to viewport
      const rawX = (rect?.left ?? 0) + rp.x - 170;
      const rawY = (rect?.top ?? 0) + rp.y - 50;
      setCtxMenu({
        x: Math.max(0, rawX),
        y: Math.max(0, rawY),
        nodePath,
        noteType: nodeData?.note_type ?? "reference",
      });
    });

    cy.on("cxttap", (evt) => {
      if (evt.target === cy) setCtxMenu((prev) => prev ? null : prev);
    });

    cy.on("tap", (evt) => {
      setCtxMenu((prev) => prev ? null : prev);
      if (evt.target === cy) {
        selectNodeRef.current(null);
      }
    });

    cy.on("zoom", () => {
      setCtxMenu((prev) => prev ? null : prev);
      const autoShow = cy.zoom() >= 0.8;
      applyEdgeLabelVisibility(
        cy,
        showEdgeLabelsRef.current || autoShow,
        selectedNodePathRef.current
      );
    });

    const clearHoverState = () => {
      // Reset hover pulse to stylesheet defaults (avoid stop()/removeStyle() — broken in Cytoscape 3.33)
      cy.nodes().style({ "shadow-blur": null as never, "shadow-opacity": null as never });
      cy.elements().removeClass("hover-dim hover-bright");
      setTooltip(null);
    };

    // Clear highlights when hovering the canvas background (not a node/edge)
    cy.on("mouseover", (evt) => {
      if (evt.target === cy) clearHoverState();
    });

    cy.on("mouseover", "node", (evt) => {
      const node = evt.target;
      const nodePath = node.id();
      // Clear any previous highlight state first (defensive)
      clearHoverState();
      // Neighborhood highlight: dim everything, brighten neighbors
      const neighborhood = node.closedNeighborhood();
      cy.elements().addClass("hover-dim");
      neighborhood.removeClass("hover-dim").addClass("hover-bright");
      // Pulse effect on hovered node (direct style — animate() crashes in Cytoscape 3.33)
      node.style({ "shadow-blur": 22, "shadow-opacity": 1.0 });
      const pos = node.renderedPosition();
      const container = containerRef.current;
      const cw = container ? container.clientWidth : Infinity;
      const ch = container ? container.clientHeight : Infinity;
      // Clamp tooltip position within the container (280px max tooltip width, ~180px estimated max height)
      const tx = Math.min(pos.x + 12, cw - 290);
      const ty = Math.min(Math.max(pos.y - 8, 0), ch - 180);
      const baseTooltip = {
        x: tx,
        y: ty,
        nodePath,
        label: node.data("label") as string,
        noteType: node.data("noteType") as string,
        color: node.data("color") as string,
        connections: node.degree(false),
      };
      // Show basic tooltip immediately
      const cached = tooltipCacheRef.current.get(nodePath);
      if (cached) {
        setTooltip({ ...baseTooltip, tags: cached.tags, summary: cached.summary });
      } else {
        setTooltip(baseTooltip);
        // Lazy-load enriched data
        getAPI().then((api) =>
          api.getNodeSummary(nodePath).then((summary) => {
            tooltipCacheRef.current.set(nodePath, summary);
            // Only update if still hovering this node
            setTooltip((prev) =>
              prev && prev.nodePath === nodePath
                ? { ...prev, tags: summary.tags, summary: summary.summary }
                : prev,
            );
          }).catch(() => { /* ignore tooltip fetch errors */ }),
        );
      }
    });

    cy.on("mouseout", "node", () => {
      clearHoverState();
      // Re-apply click-based neighborhood highlight if a node is selected
      const selPath = selectedNodePathRef.current;
      if (selPath) {
        const selNode = cy.getElementById(selPath);
        if (selNode.length > 0) {
          const neighborhood = selNode.closedNeighborhood();
          cy.elements().addClass("hover-dim");
          neighborhood.removeClass("hover-dim").addClass("hover-bright");
        }
      }
    });

    return () => {
      if (entranceTimerRef.current) clearTimeout(entranceTimerRef.current);
      setTooltip(null);
      setCtxMenu(null);
      cy.destroy();
      cyRef.current = null;
    };
  }, []);

  // Sync graph data to Cytoscape
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const cyNodes = filteredNodes.map((n) => ({
      data: {
        id: n.path,
        label: n.title,
        color: getNodeColor(n.note_type),
        noteType: n.note_type,
        shape: getNodeShape(n.note_type),
        iconSvg: getNodeIconSvg(n.note_type, getNodeColor(n.note_type)),
        iconSvgWhite: getNodeIconSvgWhite(n.note_type),
        size: BASE_NODE_SIZE,
      },
    }));

    const cyEdges = filteredEdges.map((e) => {
      const srcNode = nodes.get(e.source);
      const tgtNode = nodes.get(e.target);
      return {
        data: {
          id: `${e.source}|${e.target}|${e.rel}`,
          source: e.source,
          target: e.target,
          label: e.rel,
          kind: e.kind,
          sourceColor: getNodeColor(srcNode?.note_type ?? "reference"),
          targetColor: getNodeColor(tgtNode?.note_type ?? "reference"),
        },
      };
    });

    const nodeIds = new Set(cyNodes.map((n) => n.data.id));
    const validEdges = cyEdges.filter(
      (e) =>
        nodeIds.has(e.data.source) &&
        nodeIds.has(e.data.target) &&
        !hiddenEdgeTypes.has(e.data.label)
    );

    cy.elements().remove();
    cy.add([...cyNodes, ...validEdges]);

    // Store size as data so stylesheet selectors (node:selected, node.highlighted) can override
    cy.nodes().forEach((n) => {
      n.data("size", Math.max(BASE_NODE_SIZE, BASE_NODE_SIZE + n.indegree(false) * 2));
    });

    // Apply edge gradient colors imperatively (data() mappers don't work inside gradient arrays)
    cy.edges().forEach((edge) => {
      const src = edge.data("sourceColor") as string;
      const tgt = edge.data("targetColor") as string;
      if (src && tgt) {
        edge.style({
          "line-fill": "linear-gradient",
          "line-gradient-stop-colors": [src, tgt],
          "line-gradient-stop-positions": [0, 100],
          "target-arrow-color": tgt,
        });
      }
    });

    // Mark the focal node visually distinct when focus mode is active
    if (focalPath) {
      cy.getElementById(focalPath).addClass("graph-focus-node");
    }

    // Mark the home node with a gold glow; clear if home note was deleted
    const homePath = useUIStore.getState().homeNotePath;
    if (homePath) {
      if (nodeIds.has(homePath)) {
        cy.getElementById(homePath).addClass("home-node");
      } else {
        useUIStore.getState().clearHomeNote();
      }
    }

    if (cyNodes.length > 0) {
      const currentLayout = graphLayoutRef.current;
      const rootId = currentLayout === "radial" ? getRadialRootId(cy) : undefined;
      runLayout(cy, currentLayout, false, rootId);
      applyEdgeLabelVisibility(cy, showEdgeLabelsRef.current, selectedNodePathRef.current);

      // Staggered fade-in entrance (first load only)
      // Note: cy.animate() is broken in Cytoscape 3.33 (prop.name crash), so
      // we use setTimeout-based opacity staging instead.
      if (!hasEnteredRef.current) {
        hasEnteredRef.current = true;
        const nodeCount = cy.nodes().length;
        const stagger = Math.min(8, 300 / Math.max(nodeCount, 1));
        cy.nodes().style("opacity", 0);
        cy.nodes().forEach((node, i) => {
          setTimeout(() => node.style("opacity", 1), i * stagger);
        });
        // Safety net: clear inline opacity after all stages complete
        const totalDuration = (nodeCount - 1) * stagger + 50;
        entranceTimerRef.current = setTimeout(() => {
          entranceTimerRef.current = null;
          if (cyRef.current) {
            cyRef.current.nodes().style("opacity", null as never);
          }
        }, totalDuration);
      }
    }
  }, [filteredNodes, filteredEdges, hiddenEdgeTypes, focalPath]);

  // Highlight selected node — invert icon (white icon on colored circle)
  useEffect(() => {
    selectedNodePathRef.current = selectedNodePath;

    const cy = cyRef.current;
    if (!cy) return;

    // Restore previously inverted node to stylesheet defaults
    if (prevInvertedNodeIdRef.current) {
      const prev = cy.getElementById(prevInvertedNodeIdRef.current);
      if (prev.length > 0) {
        prev.removeStyle("background-color background-image");
      }
      prevInvertedNodeIdRef.current = null;
    }

    cy.elements().removeClass("highlighted hover-dim hover-bright");
    cy.nodes().style({ "shadow-blur": null as never, "shadow-opacity": null as never });
    cy.$("node:selected").unselect();

    if (selectedNodePath) {
      const node = cy.getElementById(selectedNodePath);
      if (node.length > 0) {
        node.select();
        node.connectedEdges().addClass("highlighted");
        node.neighborhood("node").addClass("highlighted");

        // Invert: white icon on type-colored circle
        node.style({
          "background-color": node.data("color"),
          "background-image": node.data("iconSvgWhite"),
        });
        prevInvertedNodeIdRef.current = selectedNodePath;

        // Dim non-neighbors (same visual as hover)
        const neighborhood = node.closedNeighborhood();
        cy.elements().addClass("hover-dim");
        neighborhood.removeClass("hover-dim").addClass("hover-bright");
      }
    }

    applyEdgeLabelVisibility(cy, showEdgeLabelsRef.current, selectedNodePath);
  }, [selectedNodePath]);

  // ── Minimap ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!showMinimap || !minimapContainerRef.current) {
      // Destroy minimap cy when hidden
      if (minimapCyRef.current) {
        minimapCyRef.current.destroy();
        minimapCyRef.current = null;
      }
      return;
    }

    const miniCy = cytoscape({
      container: minimapContainerRef.current,
      style: [
        {
          selector: "node",
          style: {
            width: 4,
            height: 4,
            "background-color": "data(color)" as never,
            "border-width": 0,
            label: "",
          } as never,
        },
        {
          selector: "edge",
          style: {
            width: 0.5,
            "line-color": "#555",
            "target-arrow-shape": "none",
          } as never,
        },
      ],
      layout: { name: "preset" },
      userZoomingEnabled: false,
      userPanningEnabled: false,
      autoungrabify: true,
      autounselectify: true,
    });
    minimapCyRef.current = miniCy;

    return () => {
      miniCy.destroy();
      minimapCyRef.current = null;
    };
  }, [showMinimap]);

  // Sync minimap data & positions with main cy
  useEffect(() => {
    const cy = cyRef.current;
    const miniCy = minimapCyRef.current;
    if (!cy || !miniCy || !showMinimap) return;

    // Mirror elements
    miniCy.elements().remove();
    const els = cy.elements().map((el) => ({
      group: el.group() as "nodes" | "edges",
      data: { ...el.data() },
      position: el.isNode() ? { ...el.position() } : undefined,
    }));
    miniCy.add(els);
    miniCy.fit(undefined, 4);

    // Draw viewport rectangle on canvas
    function drawViewport() {
      const canvas = minimapCanvasRef.current;
      if (!canvas || !cy || !miniCy) return;
      const container = canvas.parentElement;
      if (!container) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Map main cy viewport extent into minimap coordinates
      const ext = cy.extent();
      const miniZoom = miniCy.zoom();
      const miniPan = miniCy.pan();

      const x1 = ext.x1 * miniZoom + miniPan.x;
      const y1 = ext.y1 * miniZoom + miniPan.y;
      const x2 = ext.x2 * miniZoom + miniPan.x;
      const y2 = ext.y2 * miniZoom + miniPan.y;

      ctx.strokeStyle = "rgba(74, 158, 255, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      ctx.fillStyle = "rgba(74, 158, 255, 0.08)";
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
    }

    drawViewport();

    // Redraw on viewport changes
    const onViewport = () => drawViewport();
    cy.on("viewport", onViewport);

    // Also sync positions after layout
    const onLayout = () => {
      cy.nodes().forEach((n) => {
        const miniNode = miniCy.getElementById(n.id());
        if (miniNode.length > 0) {
          miniNode.position(n.position());
        }
      });
      miniCy.fit(undefined, 4);
      drawViewport();
    };
    cy.on("layoutstop", onLayout);

    return () => {
      cy.off("viewport", onViewport);
      cy.off("layoutstop", onLayout);
    };
  }, [showMinimap, filteredNodes, filteredEdges, hiddenEdgeTypes, focalPath]);

  // ── Cluster Hulls ────────────────────────────────────────────────
  useEffect(() => {
    const cy = cyRef.current;
    const canvas = hullCanvasRef.current;
    if (!cy || !canvas || !showClusterHulls) {
      cachedHullsRef.current = [];
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    // Compute hull geometry (model coords) and cache
    const recompute = () => {
      cachedHullsRef.current = computeHulls(cy);
      drawCachedHulls(cy, canvas, cachedHullsRef.current);
    };

    // Redraw cached hulls (screen transform only, no recomputation)
    const redraw = () => drawCachedHulls(cy, canvas, cachedHullsRef.current);

    recompute();

    cy.on("render", redraw);
    cy.on("layoutstop", recompute);

    return () => {
      cy.off("render", redraw);
      cy.off("layoutstop", recompute);
      cachedHullsRef.current = [];
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [showClusterHulls, filteredNodes]);

  // ── Edge Particles ───────────────────────────────────────────────
  useEffect(() => {
    const cy = cyRef.current;
    const canvas = particleCanvasRef.current;
    if (!cy || !canvas || !showEdgeParticles) {
      if (particleCleanupRef.current) {
        particleCleanupRef.current();
        particleCleanupRef.current = null;
      }
      return;
    }

    particleCleanupRef.current = startParticleAnimation(cy, canvas);

    return () => {
      if (particleCleanupRef.current) {
        particleCleanupRef.current();
        particleCleanupRef.current = null;
      }
    };
  }, [showEdgeParticles, filteredNodes]);

  // Dismiss graph context menu on click-outside or Escape
  const ctxMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ctxMenu) return;
    const onMouseDown = (e: MouseEvent) => {
      if (ctxMenuRef.current && !ctxMenuRef.current.contains(e.target as Node)) {
        setCtxMenu(null);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCtxMenu(null);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [ctxMenu]);

  const showOverlay = isLoading || filteredNodes.length === 0;
  const overlayText = isLoading
    ? "Loading graph..."
    : graphFocusPath
    ? "No notes match this focus."
    : "No nodes to display. Create your first note.";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      <GraphToolbar />
      {showOverlay && (
        <div
          style={{
            position: "absolute",
            inset: "36px 0 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            zIndex: 1,
            background: "var(--bg-primary)",
          }}
        >
          {overlayText}
        </div>
      )}
      <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
        <div ref={containerRef} className="graph-container" onContextMenu={(e) => e.preventDefault()} />
        {showClusterHulls && (
          <canvas
            ref={hullCanvasRef}
            className="graph-canvas-overlay"
            style={{ pointerEvents: "none" }}
          />
        )}
        {showEdgeParticles && (
          <canvas
            ref={particleCanvasRef}
            className="graph-canvas-overlay"
            style={{ pointerEvents: "none" }}
          />
        )}
        {stats && (
          <div className="graph-stats">
            {stats.node_count} nodes · {stats.edge_count} edges
          </div>
        )}
        {showMinimap && (
          <div className="graph-minimap">
            <div ref={minimapContainerRef} className="graph-minimap-cy" />
            <canvas ref={minimapCanvasRef} className="graph-minimap-canvas" />
          </div>
        )}
        {ctxMenu && (
          <div
            ref={ctxMenuRef}
            className="context-menu"
            style={{ left: ctxMenu.x, top: ctxMenu.y }}
          >
            <div
              className="context-menu-item"
              onClick={() => {
                useUIStore
                  .getState()
                  .setGraphFocus(ctxMenu.nodePath, ctxMenu.noteType === "folder" ? "folder" : "note");
                setCtxMenu(null);
              }}
            >
              Focus in Graph
            </div>
            {ctxMenu.noteType !== "folder" && (
              <div
                className="context-menu-item"
                onClick={() => {
                  const ui = useUIStore.getState();
                  if (ui.homeNotePath === ctxMenu.nodePath) {
                    ui.clearHomeNote();
                  } else {
                    ui.setHomeNote(ctxMenu.nodePath);
                  }
                  setCtxMenu(null);
                }}
              >
                {useUIStore.getState().homeNotePath === ctxMenu.nodePath ? "Unset Home Note" : "Set as Home Note"}
              </div>
            )}
          </div>
        )}
        {tooltip && (
          <div
            className="graph-node-tooltip"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div className="tooltip-header">
              <span className="tooltip-type-pill" style={{ background: tooltip.color }}>{tooltip.noteType}</span>
              <span className="tooltip-connections">{tooltip.connections} links</span>
            </div>
            <span className="tooltip-title">{tooltip.label}</span>
            {tooltip.summary && <span className="tooltip-summary">{tooltip.summary}</span>}
            {tooltip.tags && tooltip.tags.length > 0 && (
              <div className="tooltip-tags">
                {tooltip.tags.slice(0, 4).map((t) => (
                  <span key={t} className="tooltip-tag">{t}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {showLegend && <GraphLegend />}
    </div>
  );
}
