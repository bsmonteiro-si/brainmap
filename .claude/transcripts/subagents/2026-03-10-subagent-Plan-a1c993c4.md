# 2026-03-10 — Subagent Transcript: Plan

**Date:** 2026-03-10 13:48:59
**Agent:** Plan
**Agent ID:** a1c993c4962cb1a48
**Parent Session:** 72b750a5-bf77-4d9c-9323-707b5b14b58d

---

## User

Design an implementation plan for a "Segments" feature in the BrainMap desktop app (Tauri v2 + React 18 + TypeScript + Zustand).

## Context

A **Segment** is a named workspace pointing to a folder on disk — the equivalent of Obsidian's vault concept. Currently, the app asks for a raw folder path every time it opens with no persistence.

## Requirements

1. **Home screen** ("Recently opened segments") — replaces the current `WorkspacePicker` text input. Shows a grid/list of previously opened segments with:
   - Segment name (user-defined)
   - Folder path
   - Last opened timestamp
   - Open and Remove actions
2. **Create new segment** — a form where the user provides:
   - A name (defaults to folder basename)
   - A folder path (text input, file picker is optional enhancement)
3. **Uniqueness constraint** — one folder → one segment. If the user tries to add a path that already exists, show the existing segment.
4. **Persistence** — survive app restarts. Use `localStorage` (consistent with existing `uiStore` panel-size persistence).
5. **Segment name in UI** — while a segment is open, show its user-defined name (not just the folder basename from the backend).
6. **Workspace switch** — user can close the current segment and return to the home screen from within the app.

## Current Codebase State

### Key files
- `/src/App.tsx` — root; renders `<WorkspacePicker />` when `info === null`, else `<AppLayout />`
- `/src/components/Layout/WorkspacePicker.tsx` — current landing page: text input + Open button, no persistence
- `/src/stores/workspaceStore.ts` — Zustand store with `openWorkspace(path: string)` action; calls `api.openWorkspace(path)`
- `/src/stores/uiStore.ts` — persists panel sizes to `localStorage` via manual JSON; pattern to reuse
- `/src-tauri/src/commands.rs` — `open_workspace(path)` Tauri command; no segment concept

### Existing persistence pattern (reuse this)
```ts
// uiStore.ts — loadStoredSizes / persistSizes
const stored = localStorage.getItem("brainmap:panelSizes");
localStorage.setItem("brainmap:panelSizes", JSON.stringify(sizes));
```

### WorkspaceInfo returned by backend
```ts
interface WorkspaceInfo {
  name: string;   // folder basename
  root: string;   // absolute path
  nodeCount: number;
  edgeCount: number;
}
```

## Design the plan with these sections

1. **Data model** — TypeScript `Segment` interface
2. **New store** — `segmentStore.ts` (Zustand + localStorage persistence)
3. **Updated WorkspacePicker** — rename/rewrite to `SegmentPicker.tsx`; describe layout (segment cards grid + "New Segment" button + create form)
4. **App.tsx changes** — swap component reference
5. **workspaceStore.ts changes** — `openWorkspace` updates `lastOpenedAt` in segment store; add a `closeWorkspace` action to return to home
6. **Segment name display** — where/how to show it in `AppLayout`
7. **No backend changes needed** — segments are a pure frontend concept
8. **CLAUDE.md update** — new feature note
9. **Verification** — how to test end-to-end

Be specific about exact function signatures, state shape, localStorage key, and component structure. Include edge cases: empty state, duplicate path, segment with deleted folder (open fails — show error, keep segment in list).

---

## Assistant

Let me explore the current codebase thoroughly before designing the plan.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","description":"List app src directory"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores","description":"List stores directory"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components","description":"List components directory"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/WorkspacePicker.tsx"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout","description":"List Layout components"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api","description":"List api directory"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api","description":"List api directory"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/StatusBar/StatusBar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock","description":"List mock api directory"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src","description":"List Tauri src directory"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/state.rs"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/StatusBar","description":"List StatusBar directory"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Now I have a thorough understanding of the codebase. Let me produce the implementation plan.

---

## Implementation Plan: Segments Feature

### Overview

Segments are a pure frontend concept — a named, persisted mapping from a user-defined label to a folder path on disk. The backend `open_workspace(path)` call remains unchanged. All new logic lives in `src/stores/segmentStore.ts`, `src/components/Layout/SegmentPicker.tsx`, and targeted edits to `workspaceStore.ts`, `App.tsx`, and `StatusBar.tsx`.

---

### 1. Data Model

**File: `src/stores/segmentStore.ts` (new)**

```ts
export interface Segment {
  id: string;           // crypto.randomUUID() at creation time
  name: string;         // user-defined label
  path: string;         // absolute folder path on disk (canonical, never trailing slash)
  lastOpenedAt: string; // ISO-8601 timestamp, updated on every successful open
  createdAt: string;    // ISO-8601 timestamp, immutable after creation
}
```

Key decisions:
- `id` is a stable UUID so the list can be reordered without breaking identity; path alone cannot be the key because `lastOpenedAt` updates mutate the record.
- `path` is normalized on write (strip trailing slash, use `trimEnd('/')`) so the uniqueness constraint `one folder → one segment` is reliable.
- All timestamps are `new Date().toISOString()` — client-local, not UTC-from-server.
- No `nodeCount`/`edgeCount` in the model: those come from `WorkspaceInfo` after opening and would go stale on disk changes. Show them only after a successful open, not in the home screen cards.

**localStorage key:** `"brainmap:segments"` — consistent with the existing `"brainmap:panelSizes"` namespace.

---

### 2. New Store: `src/stores/segmentStore.ts`

```ts
interface SegmentStore {
  segments: Segment[];
  activeSegmentId: string | null;

  // Reads from localStorage on module init (same pattern as loadStoredSizes)
  // Mutations persist immediately after set().

  addSegment: (name: string, path: string) => Segment;
  // Returns existing segment (without creating duplicate) if path already in list.

  removeSegment: (id: string) => void;

  touchSegment: (id: string) => void;
  // Updates lastOpenedAt to now; called after successful openWorkspace.

  setActiveSegmentId: (id: string | null) => void;

  getSegmentByPath: (path: string) => Segment | undefined;
}
```

**Persistence helper** (mirrors `uiStore.ts` pattern exactly):

```ts
const STORAGE_KEY = "brainmap:segments";

function loadStoredSegments(): Segment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Guard: must be array
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistSegments(segments: Segment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(segments));
}
```

**`addSegment` logic — uniqueness constraint:**

```ts
addSegment: (name: string, rawPath: string) => {
  const path = rawPath.replace(/\/+$/, ""); // normalize
  const { segments } = get();

  const existing = segments.find((s) => s.path === path);
  if (existing) return existing; // idempotent — returns the existing segment

  const segment: Segment = {
    id: crypto.randomUUID(),
    name,
    path,
    lastOpenedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  const next = [...segments, segment];
  persistSegments(next);
  set({ segments: next });
  return segment;
},
```

**`removeSegment` logic:**

```ts
removeSegment: (id: string) => {
  const next = get().segments.filter((s) => s.id !== id);
  persistSegments(next);
  // Also clear activeSegmentId if we removed the active one
  const activeId = get().activeSegmentId;
  set({ segments: next, activeSegmentId: activeId === id ? null : activeId });
},
```

**`touchSegment` logic:**

```ts
touchSegment: (id: string) => {
  const next = get().segments.map((s) =>
    s.id === id ? { ...s, lastOpenedAt: new Date().toISOString() } : s
  );
  persistSegments(next);
  set({ segments: next });
},
```

The store is initialized with `const storedSegments = loadStoredSegments()` at module top level (same as `const storedSizes = loadStoredSizes()` in `uiStore.ts`), passed into `create<SegmentStore>((set, get) => ({ segments: storedSegments, ... }))`.

---

### 3. Updated WorkspacePicker → `SegmentPicker.tsx`

**File: `src/components/Layout/SegmentPicker.tsx` (new file, replaces WorkspacePicker.tsx in function)**

The existing `WorkspacePicker.tsx` file is kept in place and its contents replaced so that the import in `App.tsx` does not need to change the path (see step 4 for why a rename is fine either way).

The component has two internal view states driven by local `useState`:

```
"home"   — shows the segment list / empty state
"create" — shows the new-segment form
```

**Home view layout:**

```
┌─────────────────────────────────────────┐
│  BrainMap                               │
│  ─────────────────────────────────────  │
│  Recently opened                        │
│  [SegmentCard] [SegmentCard] ...        │
│  (empty state: "No segments yet.")      │
│  ─────────────────────────────────────  │
│  [+ New Segment]                        │
└─────────────────────────────────────────┘
```

Segments are sorted by `lastOpenedAt` descending (most recent first) before rendering.

**`SegmentCard` sub-component (inline in same file):**

Props: `segment: Segment`, `onOpen: () => void`, `onRemove: () => void`, `error: string | null`

Renders:
- Segment name (bold)
- Folder path in muted color
- `lastOpenedAt` formatted as relative time (`"2 days ago"` via `Intl.RelativeTimeFormat`) with a `<time>` element and `dateTime={segment.lastOpenedAt}` for accessibility
- `[Open]` button
- `[Remove]` button (shows no confirm dialog — destructive but recoverable by re-adding; follows the minimal-friction principle)
- If `error !== null`, show inline error below the card (`color: var(--danger)`)

**Create view layout:**

```
┌─────────────────────────────────────────┐
│  ← Back                                 │
│  New Segment                            │
│  ─────────────────────────────────────  │
│  Name      [________________]           │
│  Folder    [________________]           │
│            (defaults to basename)        │
│  ─────────────────────────────────────  │
│  [Open Segment]                         │
└─────────────────────────────────────────┘
```

**Create form state:**

```ts
const [formPath, setFormPath] = useState("");
const [formName, setFormName] = useState("");
```

When `formPath` changes, if `formName` has not been manually edited, auto-populate it with the basename:

```ts
const derivedName = formPath.trim().split("/").filter(Boolean).at(-1) ?? "";
```

Use a `nameTouched` boolean flag (local state) to distinguish auto-populated vs. user-edited name.

**Duplicate path handling in create form:**

Before calling `addSegment`, check `getSegmentByPath(formPath.trim())`. If a match exists, switch back to `"home"` view and show a banner: `"This folder is already open as '${existing.name}'"`. Do not create a duplicate.

**Open flow from create form:**

1. Call `segmentStore.addSegment(formName, formPath)` — returns new or existing segment.
2. Call `workspaceStore.openWorkspace(segment.path)`.
3. On success: call `segmentStore.touchSegment(segment.id)` and `segmentStore.setActiveSegmentId(segment.id)`.
4. On failure: stay on create view, show error inline.

**Open flow from segment card:**

1. Call `workspaceStore.openWorkspace(segment.path)`.
2. On success: call `segmentStore.touchSegment(segment.id)` and `segmentStore.setActiveSegmentId(segment.id)`.
3. On failure: set per-card error state. Keep segment in the list — user might fix the folder later. Error message: `"Could not open: ${errorString}"`.

**Loading state:** While `workspaceStore.isLoading`, disable the Open button and show "Opening...". The card that triggered the open shows a spinner or disabled state. Use a local `openingId: string | null` state to track which card is in-flight.

---

### 4. App.tsx Changes

Two changes only:

1. Update the import path from `./components/Layout/WorkspacePicker` to `./components/Layout/SegmentPicker` (if file is renamed) — or keep path unchanged if contents are replaced in-place.
2. Update the component reference from `<WorkspacePicker />` to `<SegmentPicker />` (line 96).

No other changes. The `info === null` guard stays identical. The keyboard shortcut setup, event subscription, and theme logic are unaffected.

---

### 5. workspaceStore.ts Changes

Two targeted additions:

**`openWorkspace` — call `touchSegment` and `setActiveSegmentId` after successful open:**

The `openWorkspace` action in `workspaceStore.ts` should not import `segmentStore` directly (circular dependency risk and violates single-responsibility). Instead, the call site (`SegmentPicker`) calls both actions in sequence. `workspaceStore.openWorkspace` stays clean and path-only.

**Add `closeWorkspace` action:**

```ts
closeWorkspace: () => {
  // Clear workspace state
  set({ info: null, stats: null, error: null });
  // Clear editor and graph state
  useEditorStore.getState().clear();
  useGraphStore.getState state reset — see below
  // Clear active segment ID in segmentStore
  useSegmentStore.getState().setActiveSegmentId(null);
},
```

For `graphStore`, add a `reset()` action:

```ts
reset: () => set({ nodes: new Map(), edges: [], selectedNodePath: null, expandedNodes: new Set(), isLoading: false }),
```

`closeWorkspace` calls `useGraphStore.getState().reset()` and `useEditorStore.getState().clear()` (already exists) then clears `useSegmentStore.getState().setActiveSegmentId(null)`.

The cross-store calls follow the same pattern already used in `workspaceStore.ts` (`useUIStore.getState().clearHiddenEdgeTypes()`), so this is not a new pattern.

**`WorkspaceState` interface addition:**

```ts
closeWorkspace: () => void;
```

---

### 6. Segment Name Display in AppLayout

**StatusBar.tsx — replace `info.name` (folder basename) with user-defined segment name:**

Currently: `<span>{info.name}</span>` — shows `info.name` which is the folder basename from the Rust backend.

Replace with:

```ts
const activeSegmentId = useSegmentStore((s) => s.activeSegmentId);
const segments = useSegmentStore((s) => s.segments);
const segmentName = segments.find((s) => s.id === activeSegmentId)?.name ?? info.name;
// ...
<span>{segmentName}</span>
```

Fallback to `info.name` (folder basename) is correct for the case where a workspace was opened without going through the segment picker (e.g., dev mode mock bridge) or before migration.

**"Close Segment" affordance — where to put it:**

Add a "Close" button to the StatusBar at the far right:

```ts
const closeWorkspace = useWorkspaceStore((s) => s.closeWorkspace);
// ...
<button className="status-bar-close-btn" onClick={closeWorkspace} title="Close segment">✕</button>
```

This is the minimal-footprint approach. It avoids polluting `AppLayout` or adding a new toolbar. The status bar already renders per-workspace info, so workspace-scoped actions belong there.

CSS for `.status-bar-close-btn`:

```css
.status-bar-close-btn {
  margin-left: auto;
  padding: 2px 6px;
  font-size: 11px;
  border: 1px solid var(--border-color);
  border-radius: 3px;
  background: none;
  color: var(--text-muted);
  cursor: pointer;
}
.status-bar-close-btn:hover {
  color: var(--danger);
  border-color: var(--danger);
}
```

---

### 7. No Backend Changes Needed

Confirmed. The `open_workspace(path: String)` Tauri command is unchanged. `WorkspaceInfo.name` (folder basename from Rust) continues to be returned and is used as the fallback in `StatusBar`. Segments are entirely a frontend persistence layer — the backend has no knowledge of segment names, IDs, or `lastOpenedAt` timestamps.

---

### 8. Edge Cases

**Empty state (no segments yet):**
In the home view, when `segments.length === 0`, render: `"No segments yet — open a folder to get started."` followed by the `[+ New Segment]` button. This is the first-run experience. Do not show the segment grid at all.

**Duplicate path:**
On the create form, `getSegmentByPath(normalizedPath)` is called before `addSegment`. If a match is found, the form shows a non-blocking notice: `"Already exists as '${match.name}'" ` and offers `[Open it]` to directly open that segment without creating a duplicate.

**Segment with deleted folder (open fails):**
`workspaceStore.openWorkspace` throws. The error string from the Tauri backend will be something like `"No such file or directory"`. The segment card shows this error inline and the segment stays in the list. The user can remove it manually with the `[Remove]` button. This is correct behavior: the user might be on a different machine or external drive unplugged — they should not lose the segment record.

**Concurrent opens (two cards clicked):**
The `openingId` local state in `SegmentPicker` disables all Open buttons while one is in-flight. Only one `openWorkspace` call runs at a time.

**`localStorage` parse failure:**
`loadStoredSegments` wraps `JSON.parse` in `try/catch` and returns `[]` on any error. This is identical to `loadStoredSizes` behavior.

**Path normalization:**
`rawPath.replace(/\/+$/, "")` strips trailing slashes. This is applied both on `addSegment` write and on `getSegmentByPath` lookup to guarantee the uniqueness constraint holds regardless of how the user typed the path.

**`crypto.randomUUID()` availability:**
Available in all modern browsers and in Tauri's WebView (Chromium-based). No polyfill needed.

---

### 9. Implementation Order (Sequenced Steps)

1. Create `src/stores/segmentStore.ts` with `Segment` interface, `SegmentStore` interface, persistence helpers, and all actions. Write unit tests inline or as a separate `segmentStore.test.ts` with Vitest.

2. Add `reset()` action to `graphStore.ts`.

3. Add `closeWorkspace()` action to `workspaceStore.ts`.

4. Create `src/components/Layout/SegmentPicker.tsx` (new file). Do not delete `WorkspacePicker.tsx` until `App.tsx` import is switched.

5. Update `App.tsx`: change import to `SegmentPicker`, change JSX reference.

6. Update `StatusBar.tsx`: read `segmentName` from `segmentStore`, add Close button.

7. Add CSS to `App.css` for segment picker classes (`.segment-picker`, `.segment-grid`, `.segment-card`, `.segment-card-name`, `.segment-card-path`, `.segment-card-meta`, `.segment-card-actions`, `.status-bar-close-btn`).

8. Update `CLAUDE.md` (Current Status section).

---

### 10. CLAUDE.md Update

The Current Status line should be updated to reflect that Phase 1c now includes the Segments feature:

```
Segments feature: named, persisted workspaces on the home screen
(segmentStore.ts with localStorage persistence, SegmentPicker.tsx replacing WorkspacePicker,
closeWorkspace action, segment name display in StatusBar).
```

---

### 11. Verification Plan

**Manual smoke test:**

1. Launch app fresh (clear `localStorage`). Confirm empty-state home screen renders.
2. Click `[+ New Segment]`. Enter a valid path (e.g., absolute path to `seed/`). Verify name auto-populates with basename.
3. Click `[Open Segment]`. Confirm app transitions to `AppLayout`. Confirm StatusBar shows segment name (not raw basename unless they match).
4. Click `[✕ Close]` in StatusBar. Confirm return to home screen. Confirm segment card appears with correct name, path, and `lastOpenedAt`.
5. Click `[Open]` on the card. Confirm workspace reopens.
6. Click `[+ New Segment]`, enter the same path again. Confirm duplicate notice appears; no second card created.
7. Enter an invalid path. Confirm error shown on card; segment stays in list.
8. Click `[Remove]` on a segment. Confirm card disappears. Refresh the page. Confirm segment is gone.
9. Refresh page mid-session. Confirm segments list survives (localStorage round-trip).
10. Enter path with trailing slash. Confirm it is normalized before save (no duplicate if same path entered without slash).

**Vitest unit tests for `segmentStore.ts`:**

- `addSegment` creates a new segment and persists it.
- `addSegment` with existing path returns existing segment (idempotent).
- `addSegment` normalizes trailing slashes.
- `removeSegment` removes by id and clears `activeSegmentId` if it matches.
- `touchSegment` updates `lastOpenedAt` without changing other fields.
- `loadStoredSegments` returns `[]` on corrupt JSON.
- `loadStoredSegments` returns `[]` on non-array JSON.

---

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts` — localStorage persistence pattern to replicate exactly in `segmentStore.ts`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts` — where `closeWorkspace` action is added and the cross-store call pattern (`useUIStore.getState()`) already lives
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/WorkspacePicker.tsx` — existing component to replace with `SegmentPicker.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/StatusBar/StatusBar.tsx` — where segment name display and Close button are added
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx` — single import/JSX line change to swap `WorkspacePicker` for `SegmentPicker`

---

