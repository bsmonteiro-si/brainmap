import type { EdgeDto, NodeDto } from "../types";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import graphData from "./data/graph.json" with { type: "json" };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import notesData from "./data/notes.json" with { type: "json" };

// graph.json: { "success": true, "data": { "content": { "nodes": [...], "edges": [...] }, "format": "json" } }
const graphContent = (graphData as Record<string, unknown>)?.data as Record<string, unknown> | undefined;
const graphInner = (graphContent?.content ?? graphContent) as { nodes: unknown[]; edges: unknown[] };

// notes.json: { path: { path, frontmatter: { title, type, ... }, body, inline_links } }
const notesMap = notesData as Record<string, {
  path: string;
  frontmatter: {
    id: string;
    title: string;
    type: string;
    tags?: string[];
    status?: string;
    created: string;
    modified: string;
    source?: string;
    summary?: string;
    links?: { target: string; type: string; annotation?: string }[];
    [key: string]: unknown;
  };
  body: string;
  inline_links?: unknown[];
}>;

export interface MockNote {
  path: string;
  title: string;
  note_type: string;
  tags: string[];
  status: string | null;
  created: string;
  modified: string;
  source: string | null;
  summary: string | null;
  links: { target: string; rel: string; annotation?: string }[];
  extra: Record<string, unknown>;
  body: string;
}

export class MockState {
  notes: Map<string, MockNote>;
  edges: EdgeDto[];

  constructor() {
    this.notes = new Map();
    this.edges = [];
    this.reset();
  }

  reset(): void {
    this.notes = new Map();

    for (const [path, raw] of Object.entries(notesMap)) {
      const fm = raw.frontmatter;
      // Collect extra fields (anything not in the known set)
      const knownKeys = new Set(["id", "title", "type", "tags", "status", "created", "modified", "source", "summary", "links"]);
      const extra: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(fm)) {
        if (!knownKeys.has(k)) extra[k] = v;
      }

      this.notes.set(path, {
        path,
        title: fm.title,
        note_type: fm.type,
        tags: fm.tags ?? [],
        status: fm.status ?? null,
        created: fm.created,
        modified: fm.modified,
        source: fm.source ?? null,
        summary: fm.summary ?? null,
        links: (fm.links ?? []).map((l) => ({
          target: l.target,
          rel: l.type,
          annotation: l.annotation,
        })),
        extra,
        body: raw.body,
      });
    }

    // Load edges from graph export
    const rawEdges = (graphInner?.edges ?? []) as { source: string; target: string; rel: string; kind: string }[];
    this.edges = rawEdges.map((e) => ({
      source: e.source,
      target: e.target,
      rel: e.rel,
      kind: e.kind as "Explicit" | "Implicit" | "Inline",
    }));
  }

  getNodes(): NodeDto[] {
    return Array.from(this.notes.values()).map((n) => ({
      path: n.path,
      title: n.title,
      note_type: n.note_type,
      tags: n.tags.length > 0 ? n.tags : null,
    }));
  }

  /** BFS neighbors traversal */
  getNeighbors(centerPath: string, depth: number): { nodes: NodeDto[]; edges: EdgeDto[] } {
    const visited = new Set<string>([centerPath]);
    const resultEdges: EdgeDto[] = [];
    let frontier = [centerPath];

    for (let d = 0; d < depth && frontier.length > 0; d++) {
      const nextFrontier: string[] = [];
      for (const nodePath of frontier) {
        for (const edge of this.edges) {
          let neighbor: string | null = null;
          if (edge.source === nodePath && !visited.has(edge.target)) {
            neighbor = edge.target;
          } else if (edge.target === nodePath && !visited.has(edge.source)) {
            neighbor = edge.source;
          }
          if (neighbor && this.notes.has(neighbor)) {
            visited.add(neighbor);
            nextFrontier.push(neighbor);
            resultEdges.push(edge);
          }
        }
      }
      frontier = nextFrontier;
    }

    const resultNodes: NodeDto[] = Array.from(visited)
      .map((p) => this.notes.get(p))
      .filter((n): n is MockNote => n !== undefined)
      .map((n) => ({ path: n.path, title: n.title, note_type: n.note_type, tags: n.tags.length > 0 ? n.tags : null }));

    return { nodes: resultNodes, edges: resultEdges };
  }
}

export const mockState = new MockState();
