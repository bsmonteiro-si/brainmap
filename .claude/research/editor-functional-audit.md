# Editor Functional Audit

> Date: 2026-03-24
> Scope: All editor types — note, canvas, excalidraw, video, image, pdf, plain-file

## Critical Issues

### 1. Canvas Auto-Save Error Suppression

**Location**: `CanvasEditor.tsx` ~lines 341-346

Canvas save failures log silently without user feedback. When `writePlainFile()` fails during auto-save, the error is only logged — the user receives no dirty indicator update and no notification that the save failed. The dirty dot remains, but the state is inconsistent.

**Impact**: Users may believe changes are saved when they're not. Canvas corruption scenarios could arise if errors are transient.

```typescript
} catch (e) {
  pendingSaves.delete(path);
  log.error("canvas", "failed to save canvas", { path, error: String(e) });
}
```

### 2. Canvas Undo/Redo After Viewport Restore

**Location**: `CanvasEditor.tsx` viewport persistence (~lines 565-572) combined with undo/redo stacks

When a canvas is first loaded, the viewport is restored asynchronously. However, the undo/redo stacks are never initialized with the loaded state. If the user immediately undoes after loading, they'll undo to an empty canvas (or the wrong state) because the initial load state is never pushed to the undo stack.

**Impact**: Undo on newly-opened canvases will jump to an unexpected state.

**Fix Needed**: Push initial loaded state to undo stack after viewport restore completes.

### 3. Video/Image Viewers: Load Failures Not Reported

**Location**: `VideoViewer.tsx` ~lines 51-55, `ImageViewer.tsx` ~lines 61-65

When `resolveVideoPath` or `resolveImagePath` fails (e.g., permissions, missing file), the error is caught but the file is left in a "loading" state forever. The UI shows "Loading..." indefinitely.

**Impact**: User sees stuck loading spinner with no fallback option to dismiss or retry.

### 4. Conflict Resolution for Background Tabs Not Implemented

**Location**: `EditorPanel.tsx` ~lines 191-196 and `App.tsx` ~lines 95-109

The conflict banner ("File changed externally") only appears for the active tab. Background tabs that detect external changes set `conflictState: "external-change"` in `tabStore` but have NO UI to resolve the conflict. When the user switches to that tab, the conflict state persists but there's no visual indication or resolution UI.

**Impact**: Users can silently lose changes from external modifications if they switch to a background tab and make new edits without noticing the conflict state.

### 5. Custom Tab Dirty Indicator UX Confusion

**Location**: `TabBar.tsx` ~line 253

Canvas auto-saves and clears `tab.isDirty` **while the user is still editing**, so the dirty dot disappears even though the user hasn't explicitly saved — it was auto-saved. This is technically correct but confusing because users don't see feedback that the save happened.

---

## Inconsistencies Across Editor Types

### Save Error Handling

| Editor Type | Error Handling |
|---|---|
| Canvas/Excalidraw | Errors logged silently; no user notification |
| Plain files/Notes | Errors logged but no user toast/notification |
| PDF/Image/Video | Read-only; N/A |

**Gap**: No consistent error toast pattern across editors.

### Dirty State Tracking

| Editor Type | Mechanism |
|---|---|
| Canvas | `tab.isDirty` synced via `updateTabState()` on scheduler; auto-save debounced |
| Excalidraw | `tab.isDirty` synced immediately on data change |
| Plain files/Notes | `editorStore.isDirty` for active tab; synced to `tab.isDirty` on save |
| PDF/Image/Video | Never dirty (read-only) |

**Gap**: No unified pattern. A plain file marked dirty shows the dot immediately; a canvas shows it after the first scheduled change.

### External File Change Detection

| Editor Type | Behavior on External Change |
|---|---|
| Active note/plain-file | `markExternalChange()` called; conflict banner shown |
| Background canvas/excalidraw | File change event received but no reload; conflict state set silently |
| Background image/video/PDF | File change event not handled; reads only on tab switch |

**Gap**: Custom file types may have stale content if the file changes externally.

### Undo/Redo

| Editor Type | Undo/Redo Support |
|---|---|
| Canvas | Full, 30-entry stack with gesture coalescing |
| Excalidraw | Relies on Excalidraw's internal undo (no explicit wiring) |
| Notes (frontmatter) | 50-entry stack in editorStore |
| Notes (body) | CodeMirror's built-in undo |
| PDF | Highlight undo only |
| Video/Image | N/A (read-only) |

**Gap**: Inconsistent undo depth and scope.

### Copy/Paste

| Editor Type | Support |
|---|---|
| Canvas | Full Cmd+C/V; copies nodes + edges; pastes at viewport center |
| Excalidraw | Built-in copy/paste |
| Markdown | CodeMirror text only; no smart reference linking |
| PDF/Video/Image | Read-only; no copy |

---

## Missing Behaviors

### 1. Canvas Drag-and-Drop from File Browser Incomplete

**Location**: `CanvasEditor.tsx` ~lines 142-151

The canvas file browser sets `onDragStart` with `application/brainmap-canvas-file`, but there is **no `onDrop` handler** in the canvas itself. Users can drag files from the panel but nothing happens when they drop.

### 2. No "Open as Text" Fallback for Corrupted Canvas/Excalidraw

Both provide an "Open as Text" button on crash, but it only closes the tab and opens as plain file — no in-place JSON editor for incremental fixes.

### 3. No Back-Navigation from Canvas File Nodes

Canvas file nodes double-click to open a note. But there's no way to see which canvases reference a note or navigate back. One-way linking only.

### 4. External File Watcher Not Connected to Custom Tabs

**Location**: `App.tsx` ~lines 86-110

The workspace event listener marks external changes but only updates the active tab's state. Background canvas/excalidraw tabs get stale silently.

### 5. No Search/Find Within Visual Editors

- Canvas: No search for node text, file references, or labels
- Excalidraw: No search for text elements
- PDF: No in-viewer text search

### 6. Canvas Group Collapse vs. Undo Conflict

Collapsing a group and then undoing re-expands the group (because undo restores pre-collapse state). Technically correct but breaks expectations — collapse state should be stored separately from undo.

---

## Edge Cases and Error Handling Gaps

### 1. Race Condition: Tab Close During Canvas Save

If user closes canvas tab while auto-save is in-flight, `savingRef` is true but `mountedRef` is false. Cleanup effect checks `pendingSaves.has(path)` but by that time the component is unmounted. Low severity (only affects logs) but fragile.

### 2. ExternalChange Conflict Not Handled for Frontmatter

The conflict banner has "Keep Mine" / "Accept Theirs" buttons. If user accepts "Theirs" while having edited frontmatter, the frontmatter changes are discarded with no merge logic.

### 3. Large PDF Rendering Can Block UI

PDF `page.render()` is awaited without cancellation. Rapid zoom/scroll queues up render operations that block the UI thread. Generation counter exists for text layer but not canvas rendering.

### 4. Canvas Paste Doesn't Validate Clipboard

Invalid JSON in clipboard causes silent `JSON.parse()` failure. Paste appears to do nothing with no error feedback.

### 5. Excalidraw Module Load Failure Unhandled

If `import("@excalidraw/excalidraw")` fails (network issue, corrupted module), the promise rejects and the component shows a blank screen. No error boundary catches this.

### 6. Segment Switch Leaves Stale Custom Tabs

When switching segments, active note/plain-file tabs are snapshot/restored via `segmentStateCache`. But custom tabs (canvas, excalidraw, pdf, image, video) may remain open with stale file paths pointing to the old segment.

### 7. No JSON Canvas Schema Validation

Canvas JSON is parsed with `JSON.parse()` but not validated against the JSON Canvas schema. Invalid `edgeType`, missing node IDs, or malformed color values silently cause React Flow rendering issues.

---

## UX Improvement Opportunities

1. **Auto-save feedback** — Subtle toast or status bar indicator when canvas/excalidraw auto-saves
2. **Binary file detection** — "Binary file — cannot be displayed" should suggest "Try opening as Image/Video/PDF instead"
3. **Video playback speed persistence** — Speed resets to 1x on every video open; should persist in uiStore
4. **Canvas keyboard shortcuts discoverability** — No persistent keyboard map or in-UI hints
5. **Canvas drag feedback** — No visual feedback (opacity, ghost) on drag start until node actually moves

---

## Severity Summary

| Severity | Count | Key Issues |
|---|---|---|
| Critical | 2 | Canvas auto-save errors silent; Canvas undo missing initial state |
| High | 3 | Background tab conflicts; Video/image load stuck; Segment switch stale tabs |
| Medium | 8 | Dirty tracking inconsistent; External change gaps; Canvas drag-drop; No schema validation |
| Low | 12+ | UX feedback missing; Edge cases in viewport restore and paste |
