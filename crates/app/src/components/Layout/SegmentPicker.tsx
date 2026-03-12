import { useState } from "react";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { useSegmentStore, type Segment } from "../../stores/segmentStore";
import { pickFolder } from "../../api/pickFolder";

type View = "home" | "create";

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "Unknown";
  const diff = Date.now() - date.getTime();
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const seconds = Math.round(diff / 1000);
  if (seconds < 60) return rtf.format(-seconds, "second");
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return rtf.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  const days = Math.round(hours / 24);
  if (days < 30) return rtf.format(-days, "day");
  const months = Math.round(days / 30);
  if (months < 12) return rtf.format(-months, "month");
  return rtf.format(-Math.round(months / 12), "year");
}

/** Derive a segment name from an absolute folder path. */
function nameFromPath(path: string): string {
  const basename = path.split("/").filter(Boolean).pop();
  return basename || path;
}

interface SegmentCardProps {
  segment: Segment;
  isOpening: boolean;
  onOpen: () => void;
  onRemove: () => void;
  error: string | null;
}

function SegmentCard({ segment, isOpening, onOpen, onRemove, error }: SegmentCardProps) {
  return (
    <div className={`sp-card-wrap${isOpening ? " sp-card-wrap--loading" : ""}`}>
      <button
        className="sp-card"
        onClick={!isOpening ? onOpen : undefined}
        disabled={isOpening}
        type="button"
      >
        <div className="sp-card-icon">■</div>
        <div className="sp-card-name">{isOpening ? "Opening..." : segment.name}</div>
        <div className="sp-card-path">{segment.path}</div>
        <div className="sp-card-meta">
          <time dateTime={segment.lastOpenedAt}>
            {formatRelativeTime(segment.lastOpenedAt)}
          </time>
        </div>
      </button>
      {error && <div className="sp-card-error" role="alert">{error}</div>}
      <button
        className="sp-card-remove"
        onClick={() => onRemove()}
        title="Remove"
        aria-label={`Remove segment "${segment.name}"`}
        type="button"
        disabled={isOpening}
      >✕</button>
    </div>
  );
}

export function SegmentPicker() {
  const [view, setView] = useState<View>("home");
  const [formPath, setFormPath] = useState("");
  const [formName, setFormName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [createError, setCreateError] = useState<string | null>(null);
  const [duplicateNotice, setDuplicateNotice] = useState<string | null>(null);

  const openWorkspace = useWorkspaceStore((s) => s.openWorkspace);
  const segments = useSegmentStore((s) => s.segments);
  const addSegment = useSegmentStore((s) => s.addSegment);
  const removeSegment = useSegmentStore((s) => s.removeSegment);
  const touchSegment = useSegmentStore((s) => s.touchSegment);
  const setActiveSegmentId = useSegmentStore((s) => s.setActiveSegmentId);

  const sortedSegments = [...segments].sort(
    (a, b) => new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime()
  );

  const handleOpenSegment = async (segment: Segment) => {
    setOpeningId(segment.id);
    setCardErrors((prev) => ({ ...prev, [segment.id]: "" }));
    await openWorkspace(segment.path);
    const state = useWorkspaceStore.getState();
    if (!state.info) {
      setCardErrors((prev) => ({ ...prev, [segment.id]: `Could not open: ${state.error || "Unknown error"}` }));
      setOpeningId(null);
      return;
    }
    touchSegment(segment.id);
    setActiveSegmentId(segment.id);
  };

  const handlePathChange = (value: string) => {
    setFormPath(value);
    if (!nameTouched) {
      const parts = value.trim().split("/").filter(Boolean);
      const basename = parts[parts.length - 1] ?? "";
      setFormName(basename);
    }
  };

  const handleBrowse = async () => {
    try {
      const path = await pickFolder();
      if (path) handlePathChange(path);
    } catch {
      // Dialog plugin unavailable or failed — ignore silently
    }
  };

  const handleOpenFolder = async () => {
    let path: string | null;
    try {
      path = await pickFolder();
    } catch {
      return;
    }
    if (!path) return;

    const name = nameFromPath(path);
    const { segment } = addSegment(name, path);

    setView("home");
    setOpeningId(segment.id);
    setCardErrors((prev) => ({ ...prev, [segment.id]: "" }));

    await openWorkspace(segment.path);
    const state = useWorkspaceStore.getState();
    if (!state.info) {
      setCardErrors((prev) => ({ ...prev, [segment.id]: `Could not open: ${state.error || "Unknown error"}` }));
      setOpeningId(null);
      return;
    }
    touchSegment(segment.id);
    setActiveSegmentId(segment.id);
  };

  const handleCreateSubmit = async () => {
    const trimmedPath = formPath.trim();
    const trimmedName = formName.trim();
    if (!trimmedPath || !trimmedName) return;

    setCreateError(null);
    const { segment, created } = addSegment(trimmedName, trimmedPath);

    setOpeningId(segment.id);

    if (!created) {
      await openWorkspace(segment.path);
      const state = useWorkspaceStore.getState();
      if (!state.info) {
        setView("home");
        setDuplicateNotice(`This folder is already open as "${segment.name}"`);
        setCardErrors((prev) => ({ ...prev, [segment.id]: "" }));
        setOpeningId(null);
      } else {
        touchSegment(segment.id);
        setActiveSegmentId(segment.id);
      }
      return;
    }

    await openWorkspace(segment.path);
    const state = useWorkspaceStore.getState();
    if (!state.info) {
      setCreateError(`Could not open: ${state.error || "Unknown error"}`);
      setOpeningId(null);
    } else {
      touchSegment(segment.id);
      setActiveSegmentId(segment.id);
    }
  };

  const handleBackToHome = () => {
    setView("home");
    setFormPath("");
    setFormName("");
    setNameTouched(false);
    setCreateError(null);
    setDuplicateNotice(null);
  };

  if (view === "create") {
    return (
      <div className="sp-root sp-root--create">
        <button className="sp-back" onClick={handleBackToHome}>← Back</button>
        <div className="sp-form-panel">
          <h2 className="sp-form-title">Open a Segment</h2>
          <div className="sp-field">
            <label className="sp-field-label" htmlFor="seg-name">Name</label>
            <input
              id="seg-name"
              className="sp-field-input"
              type="text"
              value={formName}
              onChange={(e) => { setFormName(e.target.value); setNameTouched(true); }}
              placeholder="My Knowledge Base"
              autoFocus
            />
          </div>
          <div className="sp-field">
            <label className="sp-field-label" htmlFor="seg-path">Folder path</label>
            <div className="sp-field-row">
              <input
                id="seg-path"
                className="sp-field-input"
                type="text"
                value={formPath}
                onChange={(e) => handlePathChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateSubmit()}
                placeholder="/Users/me/notes"
              />
              <button
                className="sp-browse-btn"
                type="button"
                onClick={handleBrowse}
                disabled={openingId !== null}
              >
                Browse…
              </button>
            </div>
          </div>
          <button
            className="sp-submit"
            onClick={handleCreateSubmit}
            disabled={!formPath.trim() || !formName.trim() || openingId !== null}
          >
            {openingId !== null ? "Opening..." : "Open Segment"}
          </button>
          {createError && <div className="sp-error" role="alert">{createError}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="sp-root">
      <div className="sp-brand">
        <div className="sp-brand-icon">⬡</div>
        <h1 className="sp-brand-name">BrainMap</h1>
        <p className="sp-brand-tagline">Your personal knowledge graph</p>
      </div>
      {duplicateNotice && (
        <div className="sp-notice" role="status" aria-live="polite">{duplicateNotice}</div>
      )}
      {sortedSegments.length === 0 ? (
        <div className="sp-empty-actions">
          <button className="sp-empty-cta" onClick={handleOpenFolder}>
            <span className="sp-empty-cta-icon">📂</span>
            <span>Open Folder…</span>
          </button>
          <button
            className="sp-empty-link"
            onClick={() => setView("create")}
          >
            or enter a path manually
          </button>
        </div>
      ) : (
        <div className="sp-section">
          <div className="sp-section-label">Recently opened</div>
          <div className="sp-grid">
            {sortedSegments.map((seg) => (
              <SegmentCard
                key={seg.id}
                segment={seg}
                isOpening={openingId === seg.id}
                onOpen={() => handleOpenSegment(seg)}
                onRemove={() => removeSegment(seg.id)}
                error={cardErrors[seg.id] || null}
              />
            ))}
            <button
              className="sp-new-card"
              onClick={handleOpenFolder}
              disabled={openingId !== null}
            >
              <span className="sp-new-card-icon">📂</span>
              <span>Open Folder…</span>
            </button>
            <button
              className="sp-new-card"
              onClick={() => { setDuplicateNotice(null); setView("create"); }}
              disabled={openingId !== null}
            >
              <span className="sp-new-card-icon">+</span>
              <span>New segment</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
