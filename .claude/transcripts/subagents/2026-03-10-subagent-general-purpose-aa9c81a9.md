# 2026-03-10 — Subagent Transcript: general-purpose

**Date:** 2026-03-10 14:37:33
**Agent:** general-purpose
**Agent ID:** aa9c81a971fc5c662
**Parent Session:** e8d4a0b2-f57f-4371-952d-fee7d4f7948f

---

## User

You are reviewing a frontend UI redesign for BrainMap. Review the changed files below for correctness, accessibility, and any issues.

## Changed Files

### `crates/app/src/components/Layout/SegmentPicker.tsx` (full content)

```tsx
import { useState } from "react";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { useSegmentStore, type Segment } from "../../stores/segmentStore";

type View = "home" | "create";

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
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

interface SegmentCardProps {
  segment: Segment;
  isOpening: boolean;
  onOpen: () => void;
  onRemove: () => void;
  error: string | null;
}

function SegmentCard({ segment, isOpening, onOpen, onRemove, error }: SegmentCardProps) {
  return (
    <div
      className={`sp-card${isOpening ? " sp-card--loading" : ""}`}
      onClick={!isOpening ? onOpen : undefined}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && !isOpening && onOpen()}
    >
      <div className="sp-card-header">
        <div className="sp-card-icon">■</div>
        <button
          className="sp-card-remove"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          title="Remove"
          aria-label="Remove segment"
        >✕</button>
      </div>
      <div className="sp-card-name">{isOpening ? "Opening..." : segment.name}</div>
      <div className="sp-card-path">{segment.path}</div>
      <div className="sp-card-meta">
        <time dateTime={segment.lastOpenedAt}>
          {formatRelativeTime(segment.lastOpenedAt)}
        </time>
      </div>
      {error && <div className="sp-card-error">{error}</div>}
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
    try {
      await openWorkspace(segment.path);
      touchSegment(segment.id);
      setActiveSegmentId(segment.id);
      setOpeningId(null);
    } catch (e) {
      setCardErrors((prev) => ({ ...prev, [segment.id]: `Could not open: ${String(e)}` }));
      setOpeningId(null);
    }
  };

  const handlePathChange = (value: string) => {
    setFormPath(value);
    if (!nameTouched) {
      const parts = value.trim().split("/").filter(Boolean);
      const basename = parts[parts.length - 1] ?? "";
      setFormName(basename);
    }
  };

  const handleCreateSubmit = async () => {
    const trimmedPath = formPath.trim();
    const trimmedName = formName.trim();
    if (!trimmedPath || !trimmedName) return;

    setCreateError(null);
    const { segment, created } = addSegment(trimmedName, trimmedPath);

    setOpeningId(segment.id);

    if (!created) {
      try {
        await openWorkspace(segment.path);
        touchSegment(segment.id);
        setActiveSegmentId(segment.id);
        setOpeningId(null);
      } catch (e) {
        setView("home");
        setDuplicateNotice(`This folder is already open as "${segment.name}"`);
        setOpeningId(null);
      }
      return;
    }

    try {
      await openWorkspace(segment.path);
      touchSegment(segment.id);
      setActiveSegmentId(segment.id);
      setOpeningId(null);
    } catch (e) {
      setCreateError(`Could not open: ${String(e)}`);
      setOpeningId(null);
    }
  };

  const handleBackToHome = () => {
    setView("home");
    setFormPath("");
    setFormName("");
    setNameTouched(false);
    setCreateError(null);
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
            <input
              id="seg-path"
              className="sp-field-input"
              type="text"
              value={formPath}
              onChange={(e) => handlePathChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateSubmit()}
              placeholder="/Users/me/notes"
            />
          </div>
          <button
            className="sp-submit"
            onClick={handleCreateSubmit}
            disabled={!formPath.trim() || !formName.trim() || openingId !== null}
          >
            {openingId !== null ? "Opening..." : "Open Segment"}
          </button>
          {createError && <div className="sp-error">{createError}</div>}
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
      {duplicateNotice && <div className="sp-notice">{duplicateNotice}</div>}
      {sortedSegments.length === 0 ? (
        <button className="sp-empty-cta" onClick={() => setView("create")}>
          <span className="sp-empty-cta-icon">+</span>
          <span>Open a segment to get started</span>
        </button>
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
```

## Review Criteria

The code-reviewer agent spec says to find real defects, not style nits. For this frontend change focus on:

1. **Correctness** — Logic bugs, missed conditions, event handler issues
2. **Accessibility** — The card uses `role="button"` with `tabIndex={0}` but is a `<div>`. Does it handle Space key? Is the remove button inside a `role="button"` div causing nested interactive element issues?
3. **React correctness** — State management, async issues (e.g. state updates after unmount edge cases)
4. **CSS completeness** — Are there any class names used in TSX that are missing from the CSS plan?

## Output Format

Write your review as a list of findings. For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

Write to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/segment-picker-redesign-review-1.md`

---

## Assistant

I'll review the SegmentPicker component and write the findings to the specified file.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ 2>/dev/null || mkdir -p /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/","description":"Ensure review`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/segment-picker-redesign-review-1.md","content":"# Code Review: SegmentPicker Redesign\n\n**File reviewed:** `crates/app/s`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/segment-picker-redesign-review-1.md`.

Here is a summary of findings:

**Bug (1)**

- **Finding 4** — In `handleCreateSubmit`, the `!created` duplicate-path catch block never clears the stale `cardErrors[segment.id]` entry from a prior failed attempt. After `setView("home")`, the home grid can show a ghost error on the card. Fix: add `setCardErrors((prev) => ({ ...prev, [segment.id]: "" }))` in that catch block.

**Should-fix (4)**

- **Finding 1** — `SegmentCard` handles `Enter` but not `Space` in its `onKeyDown`. ARIA spec requires `role="button"` elements to respond to both. Missing `Space` also lets the browser scroll the page.

- **Finding 2** — A `<button>` (the remove control) is nested inside a `<div role="button">` (the card). The ARIA spec forbids interactive descendants inside a `role="button"` element. Refactor so the remove button is a sibling of the card button, not a child, using CSS absolute positioning to overlay it visually.

- **Finding 3** — Both `handleOpenSegment` and `handleCreateSubmit` call local state setters (`setOpeningId(null)`, etc.) after `await openWorkspace(...)` succeeds. Since `openWorkspace` transitions the app to the main view and unmounts `SegmentPicker`, those setters run on an unmounted component. On the success path, stop after calling `touchSegment`/`setActiveSegmentId` and do not touch local state.

- **Finding 5** — The `duplicateNotice` and `createError` elements appear dynamically but have no `aria-live` attribute or `role="alert"`/`role="status"`. Screen reader users will not hear these messages. Add `role="alert"` on errors and `role="status"` on informational notices.

**Suggestions (2)**

- **Finding 6** — `openingId` doubles as both the card-loading state and the form-submission guard. A dedicated `isSubmitting` boolean would make the create-form path clearer.
- **Finding 7** — `formatRelativeTime` passes `NaN` to `Intl.RelativeTimeFormat` if `isoString` is empty or malformed, producing "NaN years ago". Add an `isNaN` guard and return a fallback like `"Unknown"`.

---

