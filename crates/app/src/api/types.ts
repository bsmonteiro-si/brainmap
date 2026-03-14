// TypeScript interfaces matching the Rust DTOs in src-tauri/src/dto.rs.
// Hand-written for reliability — kept in sync manually.

export interface WorkspaceInfo {
  name: string;
  root: string;
  node_count: number;
  edge_count: number;
}

export interface NodeDto {
  path: string;
  title: string;
  note_type: string;
}

export interface EdgeDto {
  source: string;
  target: string;
  rel: string;
  kind: "Explicit" | "Implicit" | "Inline";
}

export interface GraphTopology {
  nodes: NodeDto[];
  edges: EdgeDto[];
}

export interface TypedLinkDto {
  target: string;
  rel: string;
  annotation?: string;
}

export interface NoteDetail {
  path: string;
  title: string;
  note_type: string;
  tags: string[];
  status: string | null;
  created: string;
  modified: string;
  source: string | null;
  summary: string | null;
  links: TypedLinkDto[];
  extra: Record<string, unknown>;
  body: string;
}

export interface PlainFileDetail {
  path: string;
  body: string;
  binary: boolean;
}

export interface NodeSummary {
  path: string;
  title: string;
  note_type: string;
  tags: string[];
  status: string | null;
  summary: string | null;
}

export interface SearchResult {
  path: string;
  title: string;
  note_type: string;
  snippet: string;
  rank: number;
}

export interface SearchFilters {
  note_type?: string;
  tag?: string;
  status?: string;
}

export interface Subgraph {
  nodes: NodeDto[];
  edges: EdgeDto[];
}

export interface StatsDto {
  node_count: number;
  edge_count: number;
  nodes_by_type: Record<string, number>;
  edges_by_rel: Record<string, number>;
  edges_by_kind: Record<string, number>;
  orphan_count: number;
}

export type WorkspaceEvent =
  | { type: "node-created"; path: string; node: NodeDto; workspace_root?: string }
  | { type: "node-updated"; path: string; node: NodeDto; workspace_root?: string }
  | { type: "node-deleted"; path: string; workspace_root?: string }
  | { type: "edge-created"; edge: EdgeDto; workspace_root?: string }
  | { type: "edge-deleted"; edge: EdgeDto; workspace_root?: string }
  | { type: "topology-changed"; added_nodes: NodeDto[]; removed_nodes: string[]; added_edges: EdgeDto[]; removed_edges: EdgeDto[]; workspace_root?: string };

// ── API Interface ──────────────────────────────────────────────────

export interface BrainMapAPI {
  openWorkspace(path: string): Promise<WorkspaceInfo>;
  switchWorkspace(root: string): Promise<WorkspaceInfo>;
  closeWorkspace(root: string): Promise<void>;
  getGraphTopology(): Promise<GraphTopology>;
  getNodeSummary(path: string): Promise<NodeSummary>;
  readNote(path: string): Promise<NoteDetail>;
  listNodes(filters?: { note_type?: string; tag?: string; status?: string }): Promise<NodeSummary[]>;
  createNote(params: {
    path: string;
    title: string;
    note_type: string;
    tags?: string[];
    status?: string;
    source?: string;
    summary?: string;
    extra?: Record<string, unknown>;
    body?: string;
  }): Promise<string>;
  updateNote(params: {
    path: string;
    title?: string;
    note_type?: string;
    tags?: string[];
    status?: string;
    source?: string;
    summary?: string;
    extra?: Record<string, unknown>;
    body?: string;
  }): Promise<void>;
  deleteNote(path: string, force?: boolean): Promise<void>;
  createLink(source: string, target: string, rel: string, annotation?: string): Promise<void>;
  deleteLink(source: string, target: string, rel: string): Promise<void>;
  listLinks(path: string, direction: "Outgoing" | "Incoming" | "Both", relFilter?: string): Promise<EdgeDto[]>;
  search(query: string, filters?: SearchFilters): Promise<SearchResult[]>;
  getNeighbors(path: string, depth: number, direction?: string, relFilter?: string): Promise<Subgraph>;
  getStats(): Promise<StatsDto>;
  createFolder(path: string): Promise<void>;
  deleteFolder(path: string, force?: boolean): Promise<{ deleted_paths: string[] }>;
  listWorkspaceFiles(): Promise<string[]>;
  readPlainFile(path: string): Promise<PlainFileDetail>;
  writePlainFile(path: string, body: string): Promise<void>;
  writeRawNote(path: string, content: string): Promise<void>;
  onEvent(callback: (event: WorkspaceEvent) => void): () => void;
}
