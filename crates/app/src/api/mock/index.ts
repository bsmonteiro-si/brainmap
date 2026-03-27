import type {
  BrainMapAPI,
  EdgeDto,
  GraphTopology,
  NodeSummary,
  NoteDetail,
  PdfFileMeta,
  PdfHighlight,
  PlainFileDetail,
  SearchFilters,
  SearchResult,
  StatsDto,
  Subgraph,
  WorkspaceEvent,
  WorkspaceInfo,
} from "../types";
import { mockDelay } from "./delay";
import { eventBus } from "./events";
import { mockState } from "./state";

export class MockBridge implements BrainMapAPI {
  async openWorkspace(_path: string): Promise<WorkspaceInfo> {
    await mockDelay("openWorkspace");
    return {
      name: "The Book of Why",
      root: "/mock/seed",
      node_count: mockState.notes.size,
      edge_count: mockState.edges.length,
    };
  }

  async switchWorkspace(_root: string): Promise<WorkspaceInfo> {
    await mockDelay("openWorkspace");
    return {
      name: "The Book of Why",
      root: "/mock/seed",
      node_count: mockState.notes.size,
      edge_count: mockState.edges.length,
    };
  }

  async closeWorkspace(_root: string): Promise<void> {
    // no-op in mock
  }

  async refreshWorkspace(): Promise<WorkspaceInfo> {
    await mockDelay("openWorkspace");
    return {
      name: "The Book of Why",
      root: "/mock/seed",
      node_count: mockState.notes.size,
      edge_count: mockState.edges.length,
    };
  }

  async getGraphTopology(): Promise<GraphTopology> {
    await mockDelay("getGraphTopology");
    return {
      nodes: mockState.getNodes(),
      edges: [...mockState.edges],
    };
  }

  async getNodeSummary(path: string): Promise<NodeSummary> {
    await mockDelay("default");
    const note = mockState.notes.get(path);
    if (!note) throw new Error(`Note not found: ${path}`);
    return {
      path: note.path,
      title: note.title,
      note_type: note.note_type,
      tags: note.tags,
      status: note.status,
      summary: note.summary,
    };
  }

  async readNote(path: string): Promise<NoteDetail> {
    await mockDelay("readNote");
    const note = mockState.notes.get(path);
    if (!note) throw new Error(`Note not found: ${path}`);
    return {
      path: note.path,
      title: note.title,
      note_type: note.note_type,
      tags: note.tags,
      status: note.status,
      created: note.created,
      modified: note.modified,
      source: note.source,
      summary: note.summary,
      links: note.links.map((l) => ({
        target: l.target,
        rel: l.rel,
        annotation: l.annotation ?? null,
      })),
      extra: note.extra,
      body: note.body,
    };
  }

  async listNodes(filters?: { note_type?: string; tag?: string; status?: string }): Promise<NodeSummary[]> {
    await mockDelay("default");
    let notes = Array.from(mockState.notes.values());
    if (filters?.note_type) {
      notes = notes.filter((n) => n.note_type === filters.note_type);
    }
    if (filters?.tag) {
      notes = notes.filter((n) => n.tags.includes(filters.tag!));
    }
    if (filters?.status) {
      notes = notes.filter((n) => n.status === filters.status);
    }
    return notes.map((n) => ({
      path: n.path,
      title: n.title,
      note_type: n.note_type,
      tags: n.tags,
      status: n.status,
      summary: n.summary,
    }));
  }

  async createNote(params: {
    path: string;
    title: string;
    note_type: string;
    tags?: string[];
    status?: string;
    source?: string;
    summary?: string;
    extra?: Record<string, unknown>;
    body?: string;
  }): Promise<string> {
    await mockDelay("createNote");
    const note = {
      path: params.path,
      title: params.title,
      note_type: params.note_type,
      tags: params.tags ?? [],
      status: params.status ?? null,
      created: new Date().toISOString().slice(0, 10),
      modified: new Date().toISOString().slice(0, 10),
      source: params.source ?? null,
      summary: params.summary ?? null,
      links: [],
      extra: params.extra ?? {},
      body: params.body ?? "",
    };
    mockState.notes.set(params.path, note);
    eventBus.emit({
      type: "node-created",
      path: params.path,
      node: { path: params.path, title: params.title, note_type: params.note_type, tags: params.tags ?? null, modified: null },
    });
    return params.path;
  }

  async updateNote(params: {
    path: string;
    title?: string;
    note_type?: string;
    tags?: string[];
    status?: string;
    source?: string;
    summary?: string;
    extra?: Record<string, unknown>;
    body?: string;
  }): Promise<void> {
    await mockDelay("updateNote");
    const note = mockState.notes.get(params.path);
    if (!note) throw new Error(`Note not found: ${params.path}`);
    if (params.title !== undefined) note.title = params.title;
    if (params.note_type !== undefined) note.note_type = params.note_type;
    if (params.tags !== undefined) note.tags = params.tags;
    if (params.status !== undefined) note.status = params.status;
    if (params.source !== undefined) note.source = params.source;
    if (params.summary !== undefined) note.summary = params.summary;
    if (params.extra !== undefined) note.extra = params.extra;
    if (params.body !== undefined) note.body = params.body;
    note.modified = new Date().toISOString().slice(0, 10);
    eventBus.emit({
      type: "node-updated",
      path: params.path,
      node: { path: note.path, title: note.title, note_type: note.note_type, tags: note.tags.length > 0 ? note.tags : null, modified: note.modified },
    });
  }

  async deleteNote(path: string): Promise<void> {
    await mockDelay("deleteNote");
    mockState.notes.delete(path);
    mockState.edges = mockState.edges.filter((e) => e.source !== path && e.target !== path);
    eventBus.emit({ type: "node-deleted", path });
  }

  async createLink(source: string, target: string, rel: string, annotation?: string): Promise<void> {
    await mockDelay("default");
    const edge: EdgeDto = { source, target, rel, kind: "Explicit" };
    mockState.edges.push(edge);
    const note = mockState.notes.get(source);
    if (note) {
      note.links.push({ target, rel, annotation });
    }
    eventBus.emit({ type: "edge-created", edge });
  }

  async deleteLink(source: string, target: string, rel: string): Promise<void> {
    await mockDelay("default");
    const edge = mockState.edges.find((e) => e.source === source && e.target === target && e.rel === rel);
    mockState.edges = mockState.edges.filter((e) => !(e.source === source && e.target === target && e.rel === rel));
    const note = mockState.notes.get(source);
    if (note) {
      note.links = note.links.filter((l) => !(l.target === target && l.rel === rel));
    }
    if (edge) {
      eventBus.emit({ type: "edge-deleted", edge });
    }
  }

  async listLinks(path: string, direction: "Outgoing" | "Incoming" | "Both", relFilter?: string): Promise<EdgeDto[]> {
    await mockDelay("default");
    return mockState.edges.filter((e) => {
      let match = false;
      if (direction === "Outgoing") match = e.source === path;
      else if (direction === "Incoming") match = e.target === path;
      else match = e.source === path || e.target === path;
      if (match && relFilter) match = e.rel === relFilter;
      return match;
    });
  }

  async search(query: string, filters?: SearchFilters): Promise<SearchResult[]> {
    await mockDelay("search");
    const q = query.toLowerCase();
    let results = Array.from(mockState.notes.values())
      .filter((n) => {
        const text = `${n.title} ${n.body} ${n.tags.join(" ")} ${n.summary ?? ""}`.toLowerCase();
        return text.includes(q);
      })
      .map((n, i) => ({
        path: n.path,
        title: n.title,
        note_type: n.note_type,
        snippet: extractSnippet(n.body, q),
        rank: i,
      }));

    if (filters?.note_type) {
      results = results.filter((r) => r.note_type === filters.note_type);
    }
    if (filters?.tag) {
      const tag = filters.tag;
      results = results.filter((r) => {
        const note = mockState.notes.get(r.path);
        return note?.tags.includes(tag);
      });
    }
    if (filters?.status) {
      const status = filters.status;
      results = results.filter((r) => {
        const note = mockState.notes.get(r.path);
        return note?.status === status;
      });
    }

    return results.slice(0, 50);
  }

  async getNeighbors(path: string, depth: number): Promise<Subgraph> {
    await mockDelay("getNeighbors");
    return mockState.getNeighbors(path, depth);
  }

  async getStats(): Promise<StatsDto> {
    await mockDelay("getStats");
    const nodesByType: Record<string, number> = {};
    const edgesByRel: Record<string, number> = {};
    const edgesByKind: Record<string, number> = {};

    for (const note of mockState.notes.values()) {
      nodesByType[note.note_type] = (nodesByType[note.note_type] ?? 0) + 1;
    }
    for (const edge of mockState.edges) {
      edgesByRel[edge.rel] = (edgesByRel[edge.rel] ?? 0) + 1;
      edgesByKind[edge.kind] = (edgesByKind[edge.kind] ?? 0) + 1;
    }

    return {
      node_count: mockState.notes.size,
      edge_count: mockState.edges.length,
      nodes_by_type: nodesByType,
      edges_by_rel: edgesByRel,
      edges_by_kind: edgesByKind,
      orphan_count: 0,
    };
  }

  async createFolder(_path: string): Promise<void> {
    // No-op in mock: no real filesystem
  }

  async listWorkspaceFiles(): Promise<string[]> {
    return Array.from(mockState.notes.keys());
  }

  async createPlainFile(path: string, _body?: string): Promise<string> {
    return path;
  }

  async deletePlainFile(_path: string): Promise<void> {
    // No-op in mock
  }

  async readPlainFile(path: string): Promise<PlainFileDetail> {
    return { path, body: `(mock plain file: ${path})`, binary: false };
  }

  async resolveImagePath(path: string): Promise<PdfFileMeta> {
    return { path, absolute_path: `/mock/seed/${path}`, size_bytes: 0 };
  }

  async resolveVideoPath(path: string): Promise<PdfFileMeta> {
    return { path, absolute_path: `/mock/seed/${path}`, size_bytes: 0 };
  }

  async resolvePdfPath(path: string): Promise<PdfFileMeta> {
    return { path, absolute_path: `/mock/seed/${path}`, size_bytes: 0 };
  }

  async loadPdfHighlights(_pdfPath: string): Promise<PdfHighlight[]> {
    return [];
  }

  async savePdfHighlights(_pdfPath: string, _highlights: PdfHighlight[]): Promise<void> {
    // No-op in mock
  }

  async writePlainFile(_path: string, _body: string): Promise<void> {
    // No-op in mock
  }

  async writeRawNote(_path: string, _content: string): Promise<void> {
    // No-op in mock
  }

  async deleteFolder(path: string, _force?: boolean): Promise<{ deleted_paths: string[] }> {
    await mockDelay("deleteNote");
    const prefix = path.endsWith("/") ? path : path + "/";
    const deleted_paths: string[] = [];
    for (const [notePath] of mockState.notes) {
      if (notePath.startsWith(prefix)) {
        deleted_paths.push(notePath);
      }
    }
    for (const p of deleted_paths) {
      mockState.notes.delete(p);
      mockState.edges = mockState.edges.filter((e) => e.source !== p && e.target !== p);
      eventBus.emit({ type: "node-deleted", path: p });
    }
    return { deleted_paths };
  }

  async moveNote(oldPath: string, newPath: string): Promise<{ new_path: string; rewritten_paths: string[] }> {
    await mockDelay("default");
    const note = mockState.notes.get(oldPath);
    if (!note) throw new Error(`Note not found: ${oldPath}`);
    mockState.notes.delete(oldPath);
    note.path = newPath;
    mockState.notes.set(newPath, note);
    return { new_path: newPath, rewritten_paths: [] };
  }

  async movePlainFile(_oldPath: string, newPath: string): Promise<string> {
    await mockDelay("default");
    return newPath;
  }

  async moveFolder(oldFolder: string, newFolder: string): Promise<{ new_folder: string; moved_notes: [string, string][]; rewritten_paths: string[] }> {
    await mockDelay("default");
    return { new_folder: newFolder, moved_notes: [], rewritten_paths: [] };
  }

  async revealInFileManager(_absolutePath: string): Promise<void> {
    // No-op in mock
  }

  async openInDefaultApp(_absolutePath: string): Promise<void> {
    // No-op in mock
  }

  async duplicateNote(path: string): Promise<NoteDetail> {
    await mockDelay("default");
    const note = mockState.notes.get(path);
    if (!note) throw new Error(`Note not found: ${path}`);
    const copyPath = path.replace(".md", " (copy).md");
    const copy = { ...note, path: copyPath };
    mockState.notes.set(copyPath, copy);
    return copy;
  }

  async importFiles(_sourcePaths: string[], _targetDir: string): Promise<{ imported: string[]; failed: { path: string; error: string }[] }> {
    return { imported: [], failed: [] };
  }

  onEvent(callback: (event: WorkspaceEvent) => void): () => void {
    return eventBus.subscribe(callback);
  }
}

function extractSnippet(body: string, query: string): string {
  const idx = body.toLowerCase().indexOf(query);
  if (idx === -1) return body.slice(0, 100) + "...";
  const start = Math.max(0, idx - 40);
  const end = Math.min(body.length, idx + query.length + 40);
  return (start > 0 ? "..." : "") + body.slice(start, end) + (end < body.length ? "..." : "");
}
