// DTO types auto-generated from Rust via ts-rs.
// Re-run `cargo test export_ts_bindings` in crates/app/src-tauri/ to regenerate.
// Only BrainMapAPI, WorkspaceEvent, and SearchFilters are hand-written (no Rust equivalent).

// ── Re-exports from generated types ─────────────────────────────────

export type { NodeDto, EdgeDto, TypedLinkDto, StatsDto } from "./generated";

export type { GraphTopologyDto as GraphTopology } from "./generated";
export type { WorkspaceInfoDto as WorkspaceInfo } from "./generated";
export type { NoteDetailDto as NoteDetail } from "./generated";
export type { PlainFileDto as PlainFileDetail } from "./generated";
export type { PdfMetaDto as PdfFileMeta } from "./generated";
export type { NodeSummaryDto as NodeSummary } from "./generated";

export interface HighlightRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PdfHighlight {
  id: string;
  page: number;
  rects: HighlightRect[];
  text: string;
  color: string;
  created_at: string;
}
export type { SearchResultDto as SearchResult } from "./generated";
export type { SubgraphDto as Subgraph } from "./generated";

// ── Hand-written types (no Rust equivalent) ─────────────────────────

import type { NodeDto, EdgeDto } from "./generated";

export interface SearchFilters {
  note_type?: string;
  tag?: string;
  status?: string;
}

export type WorkspaceEvent =
  | { type: "node-created"; path: string; node: NodeDto; workspace_root?: string }
  | { type: "node-updated"; path: string; node: NodeDto; workspace_root?: string }
  | { type: "node-deleted"; path: string; workspace_root?: string }
  | { type: "edge-created"; edge: EdgeDto; workspace_root?: string }
  | { type: "edge-deleted"; edge: EdgeDto; workspace_root?: string }
  | { type: "topology-changed"; added_nodes: NodeDto[]; removed_nodes: string[]; added_edges: EdgeDto[]; removed_edges: EdgeDto[]; workspace_root?: string }
  | { type: "files-changed"; added_files: string[]; removed_files: string[]; workspace_root?: string };

// ── API Interface ──────────────────────────────────────────────────

import type {
  WorkspaceInfoDto,
  GraphTopologyDto,
  NodeSummaryDto,
  NoteDetailDto,
  SearchResultDto,
  SubgraphDto,
  StatsDto,
  PlainFileDto,
  PdfMetaDto,
} from "./generated";

export interface BrainMapAPI {
  openWorkspace(path: string): Promise<WorkspaceInfoDto>;
  switchWorkspace(root: string): Promise<WorkspaceInfoDto>;
  closeWorkspace(root: string): Promise<void>;
  refreshWorkspace(): Promise<WorkspaceInfoDto>;
  getGraphTopology(): Promise<GraphTopologyDto>;
  getNodeSummary(path: string): Promise<NodeSummaryDto>;
  readNote(path: string): Promise<NoteDetailDto>;
  listNodes(filters?: { note_type?: string; tag?: string; status?: string }): Promise<NodeSummaryDto[]>;
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
  search(query: string, filters?: SearchFilters): Promise<SearchResultDto[]>;
  getNeighbors(path: string, depth: number, direction?: string, relFilter?: string): Promise<SubgraphDto>;
  getStats(): Promise<StatsDto>;
  createFolder(path: string): Promise<void>;
  deleteFolder(path: string, force?: boolean): Promise<{ deleted_paths: string[] }>;
  listWorkspaceFiles(): Promise<string[]>;
  createPlainFile(path: string, body?: string): Promise<string>;
  deletePlainFile(path: string): Promise<void>;
  readPlainFile(path: string): Promise<PlainFileDto>;
  resolvePdfPath(path: string): Promise<PdfMetaDto>;
  loadPdfHighlights(pdfPath: string): Promise<PdfHighlight[]>;
  savePdfHighlights(pdfPath: string, highlights: PdfHighlight[]): Promise<void>;
  writePlainFile(path: string, body: string): Promise<void>;
  writeRawNote(path: string, content: string): Promise<void>;
  convertToNote(path: string, noteType?: string): Promise<string>;
  moveNote(oldPath: string, newPath: string): Promise<{ new_path: string; rewritten_paths: string[] }>;
  movePlainFile(oldPath: string, newPath: string): Promise<string>;
  moveFolder(oldFolder: string, newFolder: string): Promise<{ new_folder: string; moved_notes: [string, string][]; rewritten_paths: string[] }>;
  revealInFileManager(absolutePath: string): Promise<void>;
  openInDefaultApp(absolutePath: string): Promise<void>;
  duplicateNote(path: string): Promise<NoteDetailDto>;
  onEvent(callback: (event: WorkspaceEvent) => void): () => void;
}
