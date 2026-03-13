import type { NodeDto, EdgeDto } from "../../api/types";

export interface FocusFilterResult {
  filteredNodes: NodeDto[];
  filteredEdges: EdgeDto[];
  /** Path of the focal node when focusing a single note; null for folder focus. */
  focalPath: string | null;
}

/**
 * Derive the subgraph to display when a focus is active.
 *
 * note focus  — shows the focal note + all directly connected neighbors + edges between them.
 * folder focus — shows all notes in the folder + their direct neighbors (1-hop) and all
 *               edges between any visible pair.
 */
export function filterGraphByFocus(
  nodes: Map<string, NodeDto>,
  edges: EdgeDto[],
  focusPath: string,
  focusKind: "note" | "folder"
): FocusFilterResult {
  if (focusKind === "note") {
    const connectedEdges = edges.filter(
      (e) => e.source === focusPath || e.target === focusPath
    );
    const neighborPaths = new Set(connectedEdges.flatMap((e) => [e.source, e.target]));
    // Always include the focal node itself, even if it has no edges.
    neighborPaths.add(focusPath);
    return {
      filteredNodes: [...nodes.values()].filter((n) => neighborPaths.has(n.path)),
      filteredEdges: connectedEdges,
      focalPath: focusPath,
    };
  } else {
    // folder focus: include the folder node itself + all notes in the folder + their direct neighbors
    const prefix = focusPath + "/";
    const folderNodes = [...nodes.values()].filter(
      (n) => n.path === focusPath || n.path.startsWith(prefix)
    );
    const folderPaths = new Set(folderNodes.map((n) => n.path));

    // Find all edges connected to any folder note (inbound OR outbound)
    const connectedEdges = edges.filter(
      (e) => folderPaths.has(e.source) || folderPaths.has(e.target)
    );

    // Expand visible set to include neighbor nodes
    const visiblePaths = new Set(folderPaths);
    for (const e of connectedEdges) {
      visiblePaths.add(e.source);
      visiblePaths.add(e.target);
    }

    // Derive filteredNodes from the Map so ghost paths (in visiblePaths but absent from
    // the nodes Map) are never included. Then derive filteredEdges from filteredNodes to
    // keep both sets consistent.
    const filteredNodes = [...nodes.values()].filter((n) => visiblePaths.has(n.path));
    const filteredNodePaths = new Set(filteredNodes.map((n) => n.path));
    return {
      filteredNodes,
      filteredEdges: edges.filter(
        (e) => filteredNodePaths.has(e.source) && filteredNodePaths.has(e.target)
      ),
      focalPath: null,
    };
  }
}
