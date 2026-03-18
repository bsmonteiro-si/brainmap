import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Plus, FolderPlus, X, RefreshCw } from "lucide-react";
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
  const isLoading = useWorkspaceStore((s) => s.isLoading);
  const refreshSegment = useWorkspaceStore((s) => s.refreshSegment);
  const switchSegment = useWorkspaceStore((s) => s.switchSegment);
  const closeSegment = useWorkspaceStore((s) => s.closeSegment);
  const isDirty = useEditorStore((s) => s.isDirty);
  const activeNote = useEditorStore((s) => s.activeNote);
  const editedBody = useEditorStore((s) => s.editedBody);
  const activeSegmentId = useSegmentStore((s) => s.activeSegmentId);
  const segments = useSegmentStore((s) => s.segments);
  const openSegmentIds = useSegmentStore((s) => s.openSegmentIds);
  const addSegment = useSegmentStore((s) => s.addSegment);

  const body = editedBody ?? activeNote?.body ?? "";
  const wordCount = useMemo(() => {
    const trimmed = body.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [body]);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createPath, setCreatePath] = useState("");
  const [createNameTouched, setCreateNameTouched] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setShowCreateForm(false);
        setCreateName("");
        setCreatePath("");
        setCreateNameTouched(false);
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

  const handleCreatePathChange = (value: string) => {
    setCreatePath(value);
    if (!createNameTouched) {
      const parts = value.trim().split("/").filter(Boolean);
      setCreateName(parts[parts.length - 1] ?? "");
    }
  };

  const handleCreateBrowse = async () => {
    try {
      const path = await pickFolder();
      if (path) handleCreatePathChange(path);
    } catch {
      // ignore
    }
  };

  const handleCreateSubmit = async () => {
    const trimmedName = createName.trim();
    const trimmedPath = createPath.trim();
    if (!trimmedName || !trimmedPath) return;

    const { segment } = addSegment(trimmedName, trimmedPath);
    setDropdownOpen(false);
    setShowCreateForm(false);
    setCreateName("");
    setCreatePath("");
    setCreateNameTouched(false);
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
            <button
              className="segment-switcher-add"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <FolderPlus size={14} />
              <span>Create Folder as Segment</span>
            </button>
            {showCreateForm && (
              <div className="segment-create-form">
                <input
                  className="segment-create-input"
                  type="text"
                  placeholder="Segment name"
                  value={createName}
                  onChange={(e) => { setCreateName(e.target.value); setCreateNameTouched(true); }}
                  autoFocus
                />
                <div className="segment-create-row">
                  <input
                    className="segment-create-input"
                    type="text"
                    placeholder="/path/to/folder"
                    value={createPath}
                    onChange={(e) => handleCreatePathChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateSubmit()}
                  />
                  <button
                    className="segment-create-browse"
                    type="button"
                    onClick={handleCreateBrowse}
                  >
                    Browse…
                  </button>
                </div>
                <button
                  className="segment-create-submit"
                  onClick={handleCreateSubmit}
                  disabled={!createName.trim() || !createPath.trim()}
                >
                  Create
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <button
        className="status-bar-refresh"
        onClick={refreshSegment}
        disabled={isLoading || switchInProgress}
        title="Refresh segment (Cmd+Shift+R)"
        aria-label="Refresh segment"
      >
        <RefreshCw size={12} className={isLoading ? "spin" : ""} />
      </button>
      {activeNote && (
        <>
          <span className="separator">|</span>
          <span>
            {activeNote.path}
            {isDirty && <span className="dirty-indicator"> (unsaved)</span>}
          </span>
          <span className="separator">|</span>
          <span className="status-word-count">{wordCount} {wordCount === 1 ? "word" : "words"}</span>
        </>
      )}
    </div>
  );
}
