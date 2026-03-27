import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type {
  BrainMapAPI,
  EdgeDto,
  GraphTopology,
  ImportResultDto,
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
} from "./types";

export class TauriBridge implements BrainMapAPI {
  async openWorkspace(path: string): Promise<WorkspaceInfo> {
    return invoke<WorkspaceInfo>("open_workspace", { path });
  }

  async switchWorkspace(root: string): Promise<WorkspaceInfo> {
    return invoke<WorkspaceInfo>("switch_workspace", { root });
  }

  async closeWorkspace(root: string): Promise<void> {
    return invoke<void>("close_workspace", { root });
  }

  async refreshWorkspace(): Promise<WorkspaceInfo> {
    return invoke<WorkspaceInfo>("refresh_workspace");
  }

  async getGraphTopology(): Promise<GraphTopology> {
    return invoke<GraphTopology>("get_graph_topology");
  }

  async getNodeSummary(path: string): Promise<NodeSummary> {
    return invoke<NodeSummary>("get_node_summary", { path });
  }

  async readNote(path: string): Promise<NoteDetail> {
    return invoke<NoteDetail>("get_node_content", { path });
  }

  async listNodes(filters?: { note_type?: string; tag?: string; status?: string }): Promise<NodeSummary[]> {
    return invoke<NodeSummary[]>("list_nodes", { params: filters ?? {} });
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
    return invoke<string>("create_node", { params });
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
    return invoke<void>("update_node", { params });
  }

  async deleteNote(path: string, force?: boolean): Promise<void> {
    return invoke<void>("delete_node", { path, force: force ?? false });
  }

  async createLink(source: string, target: string, rel: string, annotation?: string): Promise<void> {
    return invoke<void>("create_link", { params: { source, target, rel, annotation } });
  }

  async deleteLink(source: string, target: string, rel: string): Promise<void> {
    return invoke<void>("delete_link", { source, target, rel });
  }

  async listLinks(path: string, direction: "Outgoing" | "Incoming" | "Both", relFilter?: string): Promise<EdgeDto[]> {
    return invoke<EdgeDto[]>("list_links", { params: { path, direction, rel_filter: relFilter } });
  }

  async search(query: string, filters?: SearchFilters): Promise<SearchResult[]> {
    return invoke<SearchResult[]>("search_notes", {
      params: { query, note_type: filters?.note_type, tag: filters?.tag, status: filters?.status },
    });
  }

  async getNeighbors(path: string, depth: number, direction?: string, relFilter?: string): Promise<Subgraph> {
    return invoke<Subgraph>("get_neighbors", {
      params: { path, depth, direction, rel_filter: relFilter },
    });
  }

  async getStats(): Promise<StatsDto> {
    return invoke<StatsDto>("get_stats");
  }

  async createFolder(path: string): Promise<void> {
    return invoke<void>("create_folder", { path });
  }

  async deleteFolder(path: string, force?: boolean): Promise<{ deleted_paths: string[] }> {
    return invoke<{ deleted_paths: string[] }>("delete_folder", { path, force: force ?? false });
  }

  async listWorkspaceFiles(): Promise<string[]> {
    return invoke<string[]>("list_workspace_files");
  }

  async createPlainFile(path: string, body?: string): Promise<string> {
    return invoke<string>("create_plain_file", { path, body });
  }

  async deletePlainFile(path: string): Promise<void> {
    return invoke<void>("delete_plain_file", { path });
  }

  async readPlainFile(path: string): Promise<PlainFileDetail> {
    return invoke<PlainFileDetail>("read_plain_file", { path });
  }

  async resolveImagePath(path: string): Promise<PdfFileMeta> {
    return invoke<PdfFileMeta>("resolve_image_path", { path });
  }

  async resolveVideoPath(path: string): Promise<PdfFileMeta> {
    return invoke<PdfFileMeta>("resolve_video_path", { path });
  }

  async resolvePdfPath(path: string): Promise<PdfFileMeta> {
    return invoke<PdfFileMeta>("resolve_pdf_path", { path });
  }

  async loadPdfHighlights(pdfPath: string): Promise<PdfHighlight[]> {
    return invoke<PdfHighlight[]>("load_pdf_highlights", { pdfPath });
  }

  async savePdfHighlights(pdfPath: string, highlights: PdfHighlight[]): Promise<void> {
    return invoke<void>("save_pdf_highlights", { pdfPath, highlights });
  }

  async writePlainFile(path: string, body: string): Promise<void> {
    return invoke<void>("write_plain_file", { path, body });
  }

  async writeRawNote(path: string, content: string): Promise<void> {
    return invoke<void>("write_raw_note", { path, content });
  }

  async convertToNote(path: string, noteType?: string): Promise<string> {
    return invoke<string>("convert_to_note", { path, note_type: noteType });
  }

  async moveNote(oldPath: string, newPath: string): Promise<{ new_path: string; rewritten_paths: string[] }> {
    return invoke("move_note", { oldPath, newPath });
  }

  async movePlainFile(oldPath: string, newPath: string): Promise<string> {
    return invoke("move_plain_file", { oldPath, newPath });
  }

  async moveFolder(oldFolder: string, newFolder: string): Promise<{ new_folder: string; moved_notes: [string, string][]; rewritten_paths: string[] }> {
    return invoke("move_folder", { oldFolder, newFolder });
  }

  async revealInFileManager(absolutePath: string): Promise<void> {
    return invoke("reveal_in_file_manager", { path: absolutePath });
  }

  async openInDefaultApp(absolutePath: string): Promise<void> {
    return invoke("open_in_default_app", { path: absolutePath });
  }

  async duplicateNote(path: string): Promise<NoteDetail> {
    return invoke("duplicate_note", { path });
  }

  async importFiles(sourcePaths: string[], targetDir: string): Promise<ImportResultDto> {
    return invoke("import_files", { sourcePaths, targetDir });
  }

  onEvent(callback: (event: WorkspaceEvent) => void): () => void {
    let unlisten: (() => void) | null = null;
    let cancelled = false;
    listen<WorkspaceEvent>("brainmap://workspace-event", (e) => {
      callback(e.payload);
    }).then((fn) => {
      if (cancelled) {
        fn();
      } else {
        unlisten = fn;
      }
    });
    return () => {
      cancelled = true;
      unlisten?.();
    };
  }
}
