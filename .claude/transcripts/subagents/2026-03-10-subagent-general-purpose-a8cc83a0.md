# 2026-03-10 — Subagent Transcript: general-purpose

**Date:** 2026-03-10 13:50:24
**Agent:** general-purpose
**Agent ID:** a8cc83a035e385731
**Parent Session:** 72b750a5-bf77-4d9c-9323-707b5b14b58d

---

## User

You are reviewing an implementation plan for BrainMap. Return your findings as a structured list — do NOT write any files.

## Review Criteria (from plan-reviewer.md)

Review across these categories:
1. **Architectural Alignment** — respects module boundaries, mutations through Workspace, consistent with existing patterns
2. **Scope and Complexity** — no scope creep, no premature abstractions, no dead code
3. **Edge Cases and Risks** — unhandled failure modes, ordering dependencies, interrupted implementation
4. **Test Strategy** — tests for each new behavior, edge cases and error paths, verify end state
5. **Data Model Impact** — serialization compatibility, backward-compatible changes

For each finding:
- **Category**: [architecture, scope, edge-case, testing, data-model, performance, clarity]
- **Severity**: [blocker, should-fix, suggestion]
- **Finding**: what the problem is
- **Recommendation**: what to do instead

Skip categories with no issues. Only real findings — no filler.

---

## The Plan: Segments Feature

### Overview
Segments are a pure frontend concept — a named, persisted mapping from a user-defined label to a folder path on disk. The backend `open_workspace(path)` call remains unchanged. All new logic lives in `segmentStore.ts`, `SegmentPicker.tsx`, and targeted edits to `workspaceStore.ts`, `App.tsx`, and `StatusBar.tsx`.

### Data Model
```ts
export interface Segment {
  id: string;           // crypto.randomUUID()
  name: string;         // user-defined label
  path: string;         // absolute folder path (canonical, no trailing slash)
  lastOpenedAt: string; // ISO-8601 timestamp
  createdAt: string;    // ISO-8601 timestamp
}
```
localStorage key: `"brainmap:segments"`

### New Store: segmentStore.ts
```ts
interface SegmentStore {
  segments: Segment[];
  activeSegmentId: string | null;
  addSegment: (name: string, path: string) => Segment;  // idempotent by path
  removeSegment: (id: string) => void;
  touchSegment: (id: string) => void;   // updates lastOpenedAt
  setActiveSegmentId: (id: string | null) => void;
  getSegmentByPath: (path: string) => Segment | undefined;
}
```
Persistence: same pattern as `uiStore.ts` (manual JSON in localStorage).
Normalization: `rawPath.replace(/\/+$/, "")` strips trailing slashes.

### SegmentPicker.tsx (replaces WorkspacePicker.tsx)
- Home view: segment cards grid sorted by `lastOpenedAt` desc + "New Segment" button
- Create view: name input (auto-populated from path basename) + path input
- Duplicate path detection: shows existing segment, no duplicate created
- Open failure: per-card error shown inline, segment kept in list
- `openingId` local state to prevent concurrent opens

### App.tsx
- Swap `<WorkspacePicker />` for `<SegmentPicker />`
- Everything else unchanged

### workspaceStore.ts
- Add `closeWorkspace()` action:
  - Sets `info/stats/error` to null
  - Calls `useEditorStore.getState().clear()`
  - Calls `useGraphStore.getState().reset()`
  - Calls `useSegmentStore.getState().setActiveSegmentId(null)`
- graphStore gets a new `reset()` action

### StatusBar.tsx
- Read segment name from segmentStore (fallback to `info.name`)
- Add "✕ Close" button at far right that calls `workspaceStore.closeWorkspace()`

### CSS (App.css additions)
`.segment-picker`, `.segment-grid`, `.segment-card`, `.segment-card-name`, `.segment-card-path`, `.segment-card-meta`, `.segment-card-actions`, `.status-bar-close-btn`

### No backend changes

---

## Existing Code Patterns for Context

**workspaceStore.ts cross-store call (already exists):**
```ts
useUIStore.getState().clearHiddenEdgeTypes();
```

**uiStore.ts persistence pattern:**
```ts
function loadStoredSizes() {
  try {
    const raw = localStorage.getItem("brainmap:panelSizes");
    if (!raw) return DEFAULT_SIZES;
    return JSON.parse(raw);
  } catch { return DEFAULT_SIZES; }
}
localStorage.setItem("brainmap:panelSizes", JSON.stringify(sizes));
```

**StatusBar.tsx (current):**
```tsx
<div className="status-bar">
  <span>{info.name}</span>
  <span className="separator">|</span>
  <span>{stats ? `${stats.node_count} nodes · ${stats.edge_count} edges` : "Loading..."}</span>
  {activeNote && <span>{activeNote.path}{isDirty && " (unsaved)"}</span>}
</div>
```

**App.tsx current navigation:**
```tsx
if (!info) return <WorkspacePicker />;
return <AppLayout />;
```

---

Return only your findings list. No summary, no praise.

---

## Assistant

**Finding 1**
- **Category**: edge-case
- **Severity**: should-fix
- **Finding**: `closeWorkspace()` does not reset `uiStore` state (hidden edge types, panel sizes, focus filter, graph focus path). If a user closes one segment and opens another, stale UI state from the previous workspace will bleed through — especially `graphFocusPath`/`graphFocusKind` and `hiddenEdgeTypes`.
- **Recommendation**: Call `useUIStore.getState().reset()` (or individual clear methods) inside `closeWorkspace()`. If `uiStore` lacks a `reset()` action, add one that restores all fields to defaults without touching persisted panel sizes.

---

**Finding 2**
- **Category**: edge-case
- **Severity**: should-fix
- **Finding**: `addSegment` is described as "idempotent by path" but the plan does not specify the return value when a duplicate is detected. The caller (SegmentPicker create-view) needs to know whether a new segment was created or an existing one was returned so it can show the right UI (the "existing segment" view). If `addSegment` silently returns the existing segment with no signal, the create-view has no reliable way to distinguish the two cases without calling `getSegmentByPath` first — creating a TOCTOU window.
- **Recommendation**: Either return `{ segment: Segment, created: boolean }` from `addSegment`, or split into `findOrCreateSegment` that makes the semantics explicit. This eliminates the TOCTOU window and removes ambiguity at the call site.

---

**Finding 3**
- **Category**: edge-case
- **Severity**: should-fix
- **Finding**: `activeSegmentId` is stored only in memory (Zustand state), not in localStorage. If the user reloads the page while a workspace is open, the app will show `WorkspacePicker`/`SegmentPicker` again rather than reopening the last segment. The existing `workspaceStore` presumably also does not auto-reopen, but this is a regression in perceived UX relative to what users might expect from a "segments" feature that tracks `lastOpenedAt`.
- **Recommendation**: Persist `activeSegmentId` in localStorage alongside the segments list, and on store hydration, if `activeSegmentId` is set, automatically call `openWorkspace` for that segment's path (with a failure fallback that clears `activeSegmentId`). If auto-reopen is explicitly out of scope, document that decision in the plan.

---

**Finding 4**
- **Category**: edge-case
- **Severity**: should-fix
- **Finding**: `removeSegment` has no guard against removing the currently active segment. If a user deletes the active segment from the picker while a workspace is open (e.g., via a future management UI or if the picker is reachable while open), `activeSegmentId` becomes a dangling reference pointing to a deleted segment.
- **Recommendation**: Inside `removeSegment`, if `id === activeSegmentId`, also call `closeWorkspace()` or at minimum `setActiveSegmentId(null)`.

---

**Finding 5**
- **Category**: architecture
- **Severity**: should-fix
- **Finding**: `graphStore.reset()` is a new action added specifically to serve `closeWorkspace()`. The plan does not describe what `reset()` clears. If it resets layout/filter state that should survive segment switches (e.g., preferred layout algorithm), it over-resets. If it doesn't clear ephemeral node positions or focus state, it under-resets. The scope of `reset()` is unspecified.
- **Recommendation**: Enumerate exactly which `graphStore` fields `reset()` clears. Separate ephemeral state (positions, focus, selected node) from user preferences (layout algorithm, zoom level) and only reset ephemeral state on close.

---

**Finding 6**
- **Category**: testing
- **Severity**: should-fix
- **Finding**: The plan includes no test strategy. The `segmentStore` has meaningful logic (idempotency, normalization, sort order, localStorage round-trip) that is easily unit-testable with Vitest, consistent with the existing 7 Vitest unit tests for `graphFocusFilter.ts`. None of this is called out.
- **Recommendation**: Add Vitest unit tests for: (1) `addSegment` idempotency by path, (2) path normalization (trailing slash stripping), (3) `touchSegment` updates `lastOpenedAt` and resort order, (4) localStorage round-trip (serialize → hydrate → same segments), (5) `removeSegment` with active-segment guard.

---

**Finding 7**
- **Category**: scope
- **Severity**: suggestion
- **Finding**: The plan renames/replaces `WorkspacePicker.tsx` with `SegmentPicker.tsx` but does not mention deleting the old file. If `WorkspacePicker.tsx` is left in the codebase unused, it becomes dead code.
- **Recommendation**: Explicitly include deletion of `WorkspacePicker.tsx` as a step in the implementation plan.

---

**Finding 8**
- **Category**: edge-case
- **Severity**: suggestion
- **Finding**: Path normalization only strips trailing slashes (`rawPath.replace(/\/+$/, "")`). On macOS, paths can have symlinks, `~` expansion, or double slashes mid-path. Two paths pointing to the same directory could pass the duplicate check and create separate segments.
- **Recommendation**: Consider using Tauri's `path.resolve` (or equivalent) to canonicalize paths before storing and before duplicate checking. This is lower priority since the path comes from a file dialog (which typically returns canonical paths), but it should be noted as a known limitation.

---

