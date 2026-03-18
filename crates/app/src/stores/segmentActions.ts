import { useSegmentStore } from "./segmentStore";
import { useWorkspaceStore } from "./workspaceStore";
import { useGraphStore } from "./graphStore";

/**
 * Open or switch to a segment by its folder path.
 * Used by both the SegmentPicker and dock menu event handler.
 */
export async function openSegmentByPath(path: string): Promise<void> {
  const segStore = useSegmentStore.getState();
  const segment = segStore.getSegmentByPath(path);
  if (!segment) return;

  const wsStore = useWorkspaceStore.getState();

  if (!wsStore.info) {
    // Home screen — open fresh.
    await wsStore.openWorkspace(path);
    if (useWorkspaceStore.getState().info) {
      segStore.touchSegment(segment.id);
      segStore.addOpenSegment(segment.id);
      segStore.setActiveSegmentId(segment.id);
      // Load topology for the newly opened workspace.
      await useGraphStore.getState().loadTopology();
    }
  } else if (segStore.activeSegmentId !== segment.id) {
    // Different segment active — switch to it.
    segStore.addOpenSegment(segment.id);
    await wsStore.switchSegment(segment.id);
  }
  // Already active — no-op (macOS brings window to front automatically).
}

/**
 * Open a folder path as a new segment (or reuse existing if path matches).
 * Used by the dock menu "Open Folder..." action.
 */
export async function openFolderAsSegment(path: string): Promise<void> {
  const segStore = useSegmentStore.getState();

  // Derive a display name from the last path component.
  const name = path.split("/").filter(Boolean).pop() ?? path;

  const { segment } = segStore.addSegment(name, path);
  await openSegmentByPath(segment.path);
}
