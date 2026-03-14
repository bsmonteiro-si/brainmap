import { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, X } from "lucide-react";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { useEditorStore } from "../../stores/editorStore";
import { useSegmentStore } from "../../stores/segmentStore";
import { pickFolder } from "../../api/pickFolder";

function nameFromPath(path: string): string {
  const basename = path.split("/").filter(Boolean).pop();
  return basename || path;
}

export function StatusBar() {
  const info = useWorkspaceStore((s) => s.info);
  const switchInProgress = useWorkspaceStore((s) => s.switchInProgress);
  const switchSegment = useWorkspaceStore((s) => s.switchSegment);
  const closeSegment = useWorkspaceStore((s) => s.closeSegment);
  const isDirty = useEditorStore((s) => s.isDirty);
  const activeNote = useEditorStore((s) => s.activeNote);
  const activeSegmentId = useSegmentStore((s) => s.activeSegmentId);
  const segments = useSegmentStore((s) => s.segments);
  const openSegmentIds = useSegmentStore((s) => s.openSegmentIds);
  const addSegment = useSegmentStore((s) => s.addSegment);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  if (!info) return null;

  const activeSegment = segments.find((s) => s.id === activeSegmentId);
  const segmentName = activeSegment?.name ?? info.name;

  const openSegments = openSegmentIds
    .map((id) => segments.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => s !== undefined);

  const handleSwitch = async (segmentId: string) => {
    setDropdownOpen(false);
    if (segmentId === activeSegmentId) return;
    await switchSegment(segmentId);
  };

  const handleClose = async (e: React.MouseEvent, segmentId: string) => {
    e.stopPropagation();
    setDropdownOpen(false);
    await closeSegment(segmentId);
  };

  const handleAddSegment = async () => {
    setDropdownOpen(false);
    let path: string | null;
    try {
      path = await pickFolder();
    } catch {
      return;
    }
    if (!path) return;

    const name = nameFromPath(path);
    const { segment } = addSegment(name, path);

    // Switch to the new segment via the proper switchSegment flow
    await switchSegment(segment.id);
  };

  return (
    <div className="status-bar">
      <div className="segment-switcher" ref={dropdownRef}>
        <button
          className="segment-switcher-btn"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          disabled={switchInProgress}
          title="Switch segment"
        >
          <span className="segment-switcher-name">{segmentName}</span>
          <ChevronDown size={12} />
        </button>
        {dropdownOpen && (
          <div className="segment-switcher-dropdown">
            {openSegments.map((seg) => (
              <div
                key={seg.id}
                className={`segment-switcher-item${seg.id === activeSegmentId ? " active" : ""}`}
                onClick={() => handleSwitch(seg.id)}
              >
                <span className="segment-switcher-item-name">{seg.name}</span>
                <span className="segment-switcher-item-path">{seg.path}</span>
                {openSegments.length > 1 && (
                  <button
                    className="segment-switcher-item-close"
                    onClick={(e) => handleClose(e, seg.id)}
                    title={`Close "${seg.name}"`}
                    aria-label={`Close segment "${seg.name}"`}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
            <div className="segment-switcher-divider" />
            <button
              className="segment-switcher-add"
              onClick={handleAddSegment}
            >
              <Plus size={14} />
              <span>Open Folder as Segment</span>
            </button>
          </div>
        )}
      </div>
      {activeNote && (
        <>
          <span className="separator">|</span>
          <span>
            {activeNote.path}
            {isDirty && <span className="dirty-indicator"> (unsaved)</span>}
          </span>
        </>
      )}
    </div>
  );
}
