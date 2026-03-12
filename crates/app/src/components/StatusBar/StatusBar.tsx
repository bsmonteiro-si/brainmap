import { useWorkspaceStore } from "../../stores/workspaceStore";
import { useEditorStore } from "../../stores/editorStore";
import { useUIStore } from "../../stores/uiStore";
import { useSegmentStore } from "../../stores/segmentStore";

export function StatusBar() {
  const info = useWorkspaceStore((s) => s.info);
  const stats = useWorkspaceStore((s) => s.stats);
  const closeWorkspace = useWorkspaceStore((s) => s.closeWorkspace);
  const isDirty = useEditorStore((s) => s.isDirty);
  const activeNote = useEditorStore((s) => s.activeNote);
  const activeSegmentId = useSegmentStore((s) => s.activeSegmentId);
  const segments = useSegmentStore((s) => s.segments);

  if (!info) return null;

  const segmentName = segments.find((s) => s.id === activeSegmentId)?.name ?? info.name;

  return (
    <div className="status-bar">
      <span>{segmentName}</span>
      <span className="separator">|</span>
      <span>
        {stats ? `${stats.node_count} nodes · ${stats.edge_count} edges` : "Loading..."}
      </span>
      {activeNote && (
        <>
          <span className="separator">|</span>
          <span>
            {activeNote.path}
            {isDirty && <span className="dirty-indicator"> (unsaved)</span>}
          </span>
        </>
      )}
      <button
        className="status-bar-btn"
        style={{ marginLeft: "auto" }}
        onClick={() => useUIStore.getState().openSettings()}
        title="Settings (⌘,)"
      >
        ⚙
      </button>
      <button
        className="status-bar-close-btn"
        onClick={closeWorkspace}
        title="Close segment"
      >
        ✕
      </button>
    </div>
  );
}
