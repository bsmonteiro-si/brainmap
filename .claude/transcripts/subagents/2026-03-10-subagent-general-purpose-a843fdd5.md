# 2026-03-10 — Subagent Transcript: general-purpose

**Date:** 2026-03-10 14:23:12
**Agent:** general-purpose
**Agent ID:** a843fdd527f82cd68
**Parent Session:** 72b750a5-bf77-4d9c-9323-707b5b14b58d

---

## User

You are a code reviewer for the BrainMap project. Review the following changed files and return your findings. Do NOT write any files.

## Review Criteria (from code-reviewer.md)

Review for:
1. **Correctness** — logic bugs, off-by-one errors, wrong conditions
2. **Rust quality** — N/A (TypeScript only here)
3. **Function design** — single responsibility, clear naming, appropriate abstraction
4. **Test coverage** — tests for new behavior, edge cases and error paths
5. **Serialization** — localStorage round-trips, data integrity
6. **Performance** — unnecessary re-renders, expensive computations in hot paths

For each finding:
- **File**: file path + relevant line range
- **Severity**: [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

Only real findings — no filler or praise.

---

## Changed Files

### `src/stores/segmentStore.ts` (new)
```ts
import { create } from "zustand";

export interface Segment {
  id: string;
  name: string;
  path: string;
  lastOpenedAt: string;
  createdAt: string;
}

interface SegmentStore {
  segments: Segment[];
  activeSegmentId: string | null;
  addSegment: (name: string, path: string) => { segment: Segment; created: boolean };
  removeSegment: (id: string) => void;
  touchSegment: (id: string) => void;
  setActiveSegmentId: (id: string | null) => void;
  getSegmentByPath: (path: string) => Segment | undefined;
}

const STORAGE_KEY = "brainmap:segments";

function normalizePath(rawPath: string): string {
  return rawPath.replace(/\/+$/, "");
}

export function loadStoredSegments(): Segment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistSegments(segments: Segment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(segments));
}

const storedSegments = loadStoredSegments();

export const useSegmentStore = create<SegmentStore>((set, get) => ({
  segments: storedSegments,
  activeSegmentId: null,

  addSegment: (name, rawPath) => {
    const path = normalizePath(rawPath);
    const existing = get().segments.find((s) => s.path === path);
    if (existing) return { segment: existing, created: false };
    const segment: Segment = {
      id: crypto.randomUUID(),
      name,
      path,
      lastOpenedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    const next = [...get().segments, segment];
    persistSegments(next);
    set({ segments: next });
    return { segment, created: true };
  },

  removeSegment: (id) => {
    const next = get().segments.filter((s) => s.id !== id);
    persistSegments(next);
    set({
      segments: next,
      activeSegmentId: get().activeSegmentId === id ? null : get().activeSegmentId,
    });
  },

  touchSegment: (id) => {
    const next = get().segments.map((s) =>
      s.id === id ? { ...s, lastOpenedAt: new Date().toISOString() } : s
    );
    persistSegments(next);
    set({ segments: next });
  },

  setActiveSegmentId: (id) => set({ activeSegmentId: id }),

  getSegmentByPath: (rawPath) => {
    const path = normalizePath(rawPath);
    return get().segments.find((s) => s.path === path);
  },
}));
```

### `src/stores/workspaceStore.ts` (modified — added closeWorkspace)
```ts
import { create } from "zustand";
import type { StatsDto, WorkspaceInfo } from "../api/types";
import { getAPI } from "../api/bridge";
import { useUIStore } from "./uiStore";
import { useGraphStore } from "./graphStore";
import { useEditorStore } from "./editorStore";
import { useSegmentStore } from "./segmentStore";

interface WorkspaceState {
  info: WorkspaceInfo | null;
  stats: StatsDto | null;
  isLoading: boolean;
  error: string | null;
  noteTypes: string[];
  edgeTypes: string[];
  openWorkspace: (path: string) => Promise<void>;
  closeWorkspace: () => void;
  refreshStats: () => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  // ... existing fields ...

  closeWorkspace: () => {
    useEditorStore.getState().clear();
    useGraphStore.getState().reset();
    useUIStore.getState().resetWorkspaceState();
    useSegmentStore.getState().setActiveSegmentId(null);
    set({ info: null, stats: null, error: null });
  },

  refreshStats: async () => { ... },
}));
```

### `src/stores/graphStore.ts` (modified — added reset)
```ts
reset: () => set({
  nodes: new Map(),
  edges: [],
  selectedNodePath: null,
  expandedNodes: new Set(),
  isLoading: false,
}),
```

### `src/stores/uiStore.ts` (modified — added resetWorkspaceState)
```ts
resetWorkspaceState: () => set({
  hiddenEdgeTypes: new Set<string>(),
  graphFocusPath: null,
  graphFocusKind: null,
}),
```

### `src/components/Layout/SegmentPicker.tsx` (new)
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
    <div className="segment-card">
      <div className="segment-card-name">{segment.name}</div>
      <div className="segment-card-path">{segment.path}</div>
      <div className="segment-card-meta">
        <time dateTime={segment.lastOpenedAt}>
          Opened {formatRelativeTime(segment.lastOpenedAt)}
        </time>
      </div>
      {error && <div className="segment-card-error">{error}</div>}
      <div className="segment-card-actions">
        <button onClick={onOpen} disabled={isOpening}>
          {isOpening ? "Opening..." : "Open"}
        </button>
        <button onClick={onRemove} disabled={isOpening}>
          Remove
        </button>
      </div>
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

    if (!created) {
      setView("home");
      setDuplicateNotice(`This folder is already open as "${segment.name}"`);
      return;
    }

    setOpeningId(segment.id);
    try {
      await openWorkspace(segment.path);
      touchSegment(segment.id);
      setActiveSegmentId(segment.id);
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
      <div className="segment-picker">
        <div className="segment-picker-header">
          <button className="segment-back-btn" onClick={handleBackToHome}>← Back</button>
          <h2 className="segment-picker-title">New Segment</h2>
        </div>
        <div className="picker-form">
          <label>
            Name
            <input
              type="text"
              value={formName}
              onChange={(e) => { setFormName(e.target.value); setNameTouched(true); }}
              placeholder="My Knowledge Base"
              autoFocus
            />
          </label>
          <label>
            Folder
            <input
              type="text"
              value={formPath}
              onChange={(e) => handlePathChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateSubmit()}
              placeholder="/path/to/folder"
            />
          </label>
          <button
            onClick={handleCreateSubmit}
            disabled={!formPath.trim() || !formName.trim() || openingId !== null}
          >
            {openingId !== null ? "Opening..." : "Open Segment"}
          </button>
          {createError && <div className="segment-card-error">{createError}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="segment-picker">
      <h1 className="segment-picker-title">BrainMap</h1>
      {duplicateNotice && (
        <div className="segment-duplicate-notice">{duplicateNotice}</div>
      )}
      {sortedSegments.length === 0 ? (
        <div className="segment-empty">
          <p>No segments yet — open a folder to get started.</p>
        </div>
      ) : (
        <>
          <div className="segment-picker-section-label">Recently opened</div>
          <div className="segment-grid">
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
          </div>
        </>
      )}
      <button
        className="segment-new-btn"
        onClick={() => { setDuplicateNotice(null); setView("create"); }}
        disabled={openingId !== null}
      >
        + New Segment
      </button>
    </div>
  );
}
```

### `src/components/StatusBar/StatusBar.tsx` (modified)
```tsx
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
      ...
      <button className="status-bar-btn" style={{ marginLeft: "auto" }}
        onClick={() => useUIStore.getState().openSettings()} title="Settings (⌘,)">⚙</button>
      <button className="status-bar-close-btn" onClick={closeWorkspace} title="Close segment">✕</button>
    </div>
  );
}
```

Return only findings. No praise.

---

## Assistant

## Review Findings

---

**File**: `src/stores/segmentStore.ts`, lines 70–82 (`removeSegment`)
**Severity**: bug
**Finding**: `get().activeSegmentId` is called twice in the `set(...)` call. Between the two reads, `get()` reflects pre-update state, but this is fragile — more importantly, if `activeSegmentId` were `id`, the second `get().activeSegmentId` still reads the old value only by coincidence (state hasn't been committed yet). The real bug is that `segments` is computed from `get()` before `set()` is called, but `activeSegmentId` in the set object reads `get()` again, which is correct now but will silently break if set batching changes. Use a local variable.
**Fix**:
```ts
removeSegment: (id) => {
  const { segments, activeSegmentId } = get();
  const next = segments.filter((s) => s.id !== id);
  persistSegments(next);
  set({
    segments: next,
    activeSegmentId: activeSegmentId === id ? null : activeSegmentId,
  });
},
```

---

**File**: `src/stores/segmentStore.ts`, lines 43–57 (`addSegment`)
**Severity**: should-fix
**Finding**: The store is initialized at module load time via `const storedSegments = loadStoredSegments()`. If this module is imported in a non-browser context (tests, SSR) `localStorage` will throw. More practically, `loadStoredSegments` is called once at module evaluation, before any test can mock `localStorage`, making the store untestable without special setup.
**Fix**: Initialize lazily inside `create(...)`:
```ts
export const useSegmentStore = create<SegmentStore>((set, get) => ({
  segments: loadStoredSegments(),
  ...
}));
```
Remove the top-level `const storedSegments = loadStoredSegments()`.

---

**File**: `src/components/Layout/SegmentPicker.tsx`, lines 100–115 (`handleOpenSegment`)
**Severity**: bug
**Finding**: When `openWorkspace` succeeds, `setOpeningId` is never reset to `null`. The card remains in "Opening…" / disabled state permanently after a successful open, which matters if the user later closes the workspace and returns to the picker without unmounting.
**Fix**: After `setActiveSegmentId(segment.id)`, add `setOpeningId(null)`.

---

**File**: `src/components/Layout/SegmentPicker.tsx`, lines 119–132 (`handleCreateSubmit`)
**Severity**: bug
**Finding**: Same issue as above: when `openWorkspace` succeeds in `handleCreateSubmit`, `setOpeningId` is never reset to `null`.
**Fix**: After `setActiveSegmentId(segment.id)`, add `setOpeningId(null)`.

---

**File**: `src/components/Layout/SegmentPicker.tsx`, lines 138–151 (`handleCreateSubmit`)
**Severity**: should-fix
**Finding**: When `addSegment` returns `created: false` (duplicate), the segment is not touched (`touchSegment` is skipped) and its `lastOpenedAt` is stale. The user navigated to it, but the "recently opened" sort order won't reflect that.
**Fix**: Call `touchSegment(segment.id)` and `setActiveSegmentId(segment.id)` before switching to home view, then also call `openWorkspace(segment.path)` or at minimum update the timestamp.

---

**File**: `src/components/Layout/SegmentPicker.tsx`, `handlePathChange`
**Severity**: suggestion
**Finding**: The auto-name derivation splits on `/` and takes the last non-empty segment. On Windows paths (`C:\Users\foo`), this will set the name to the full raw path since no `/` is found. Not critical given Tauri's macOS/Linux focus but worth noting if cross-platform use is planned.

---

**File**: `src/stores/workspaceStore.ts`, `closeWorkspace`
**Severity**: should-fix
**Finding**: `closeWorkspace` calls `useEditorStore.getState().clear()`, `useGraphStore.getState().reset()`, etc. but there is no guard against calling this when `info` is already `null` (double-close). The individual store resets are idempotent, but downstream effects (e.g., a close button still present briefly during re-render) could trigger this twice. A guard prevents noise.
**Fix**:
```ts
closeWorkspace: () => {
  if (!get().info) return;
  ...
},
```

---

**File**: `src/components/Layout/SegmentPicker.tsx` — missing test coverage
**Severity**: should-fix
**Finding**: There are no tests for `SegmentPicker` or `segmentStore`. The store has non-trivial logic: deduplication by path, `normalizePath`, `lastOpenedAt` ordering, `localStorage` persistence round-trips. The component has conditional rendering paths (home/create), async error paths, and the duplicate-detection flow. None of this is covered by the 7 existing Vitest tests.
**Fix**: Add unit tests for `segmentStore` (add/remove/touch/dedup/normalizePath) and at minimum a render test for `SegmentPicker` covering the empty-state, card list, and create-form views.

---

**File**: `src/stores/segmentStore.ts` — `loadStoredSegments` does not validate segment shape
**Severity**: should-fix
**Finding**: `JSON.parse` result is cast to `Segment[]` without field validation. If localStorage contains stale/malformed data (missing `id`, `path`, etc.), downstream code will silently operate on incomplete objects, causing runtime errors in sort comparisons (`new Date(undefined)`) and UUID lookups.
**Fix**: Add a guard after parsing:
```ts
const isValidSegment = (s: unknown): s is Segment =>
  typeof s === "object" && s !== null &&
  typeof (s as Segment).id === "string" &&
  typeof (s as Segment).path === "string" &&
  typeof (s as Segment).lastOpenedAt === "string" &&
  typeof (s as Segment).createdAt === "string" &&
  typeof (s as Segment).name === "string";

return Array.isArray(parsed) ? parsed.filter(isValidSegment) : [];
```

---

