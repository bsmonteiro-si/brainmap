# Drag-and-Drop Investigation Report

## What Works (Current State)

1. **Internal drag-and-drop** (reorder/move files within the file tree) — Pre-existing HTML5 drag system using `application/brainmap-path` custom MIME types. Works correctly because `dragDropEnabled: false`.

2. **"Import Files..." context menu** — Added to both folder and root context menus. Opens native file picker via `@tauri-apps/plugin-dialog`, calls `import_files` backend command. This is a workaround, not native drag-drop.

3. **`import_files` backend command** — Rust command that copies external files into the workspace with deduplication, symlink skipping, `.brainmap/` protection. File watcher handles graph integration. 13 Rust tests + 7 Vitest tests. Works correctly when invoked via the file picker dialog.

## What Does NOT Work (Current State)

All native drag-and-drop between the app and external apps is broken:

### Problem A: Dragging files FROM the app TO Finder
Users cannot drag a file from the BrainMap file tree to Finder (or any external app) to copy/move it.

### Problem B: Dragging files FROM Finder INTO the app (native drop)
When a user drags a file from Finder and drops it on the app window, WKWebView navigates to the file (opens the image/PDF directly), replacing the entire app UI. The user must force-close the app.

### Important: These two problems have NEVER been solved simultaneously
When `dragDropEnabled: true`, inbound drag from Finder worked but internal drag broke. When `dragDropEnabled: false` (current), internal drag works but inbound drag causes the app to navigate away. At no point did both work at the same time.

## What Does NOT Work

### Problem A: Dragging files FROM the app TO Finder
Users cannot drag a file from the BrainMap file tree to Finder (or any external app) to copy/move it.

### Problem B: Dragging files FROM Finder INTO the app (native drop)
When a user drags a file from Finder and drops it on the app window, WKWebView navigates to the file (opens the image/PDF directly), replacing the entire app UI. The user must force-close the app.

## The Core Conflict

These two problems share a root cause: **Tauri's `dragDropEnabled` config creates a mutually exclusive choice between internal and external drag-and-drop on macOS WKWebView.**

- `dragDropEnabled: true` — Tauri intercepts ALL drag events at the native level. External file drops work (Tauri fires `tauri://drag-drop` events). But internal HTML5 `dragover`/`drop` events **never reach DOM elements**, breaking the file tree's reorder/move functionality entirely. Verified via logs: `handleItemDragOver` never fires, only `dragStart` and `dragEnd`.

- `dragDropEnabled: false` — HTML5 drag events work normally for internal operations. But external file drops are handled by WKWebView's native layer **before JavaScript runs**. WKWebView navigates to the dropped file (e.g., opens a PNG as an image). JavaScript `document.addEventListener("dragover"/"drop", preventDefault)` never fires because the events never reach JS.

## Failed Attempts (Chronological)

### Attempt 1: Listen to `tauri://drag-drop` single event with discriminated union
**What I did:** Created a `useExternalDragDrop` hook that listened to `listen("tauri://drag-drop", callback)` expecting a payload with `{ type: "enter" | "over" | "drop" | "leave" }`.

**Why it failed:** In Tauri v2, each drag phase is a **separate event** (`tauri://drag-enter`, `tauri://drag-over`, `tauri://drag-drop`, `tauri://drag-leave`). The raw payload has no `type` field — that's added by the `onDragDropEvent()` wrapper. I was listening to only one event and checking a field that didn't exist.

**Root cause of my error:** I assumed the API shape from documentation without verifying against the actual `@tauri-apps/api` source code. Should have read `node_modules/@tauri-apps/api/event.js` first.

### Attempt 2: Switch to `getCurrentWebview().onDragDropEvent()`
**What I did:** Used the proper aggregated API that listens to all four events.

**Result:** This fixed the inbound drag-drop from Finder (with `dragDropEnabled: true`). Files were successfully imported.

### Attempt 3: Folder-targeted drop resolution
**What I did:** On `over` events, used `document.elementFromPoint(x, y)` to find the folder under the cursor. Highlighted it. On `drop`, used the resolved folder as the target directory.

**Result:** Worked correctly.

### Attempt 4: `startDrag()` inside `onDragStart` for outbound drag to Finder
**What I did:** Installed `@crabnebula/tauri-plugin-drag` (v2.1.0). Called `startDrag({ item: [absolutePath], icon: ... })` inside the HTML5 `onDragStart` handler alongside the existing HTML5 drag data.

**Why it failed:** `startDrag` resolved immediately but the callback returned `"Cancel"`. The browser had already initiated its own drag session via `onDragStart`. The native drag initiated by `startDrag()` conflicted with the browser's existing drag — macOS treats the drag session as owned by WKWebView and the native drag gets cancelled.

**Root cause of my error:** I assumed `startDrag` could run in parallel with HTML5 drag. It can't — it needs exclusive control of the mouse/drag session.

### Attempt 5: Option/Alt + mousedown for native drag-out
**What I did:** Added `onMouseDown` handler that detects Alt+mousedown+movement (before the browser fires `dragstart`), then calls `startDrag()`. Without Alt, normal HTML5 drag proceeds.

**Why it partially failed:** The `onMouseDown` prop was added to the type definition but NOT to the destructuring of the `FileTreeNode` component. This caused `onMouseDown` to be `undefined` at runtime, and calling `undefined(e, node)` threw an error, causing the app to go blank (React crash). After fixing the destructuring, this approach should work for outbound drag but was never fully tested because other issues took priority.

### Attempt 6: Global `document.addEventListener("dragover"/"drop", preventDefault)`
**What I did:** Added a global handler to prevent the browser from navigating to dropped files. First version was unconditional.

**Why it failed:** The unconditional `preventDefault` on `dragover` blocked ALL drag-over events, including internal HTML5 drags. Without `dragover` being handled on drop targets, the browser considers everything a non-drop-zone and never fires `drop`. This completely broke internal file tree drag-and-drop.

**Root cause of my error:** I didn't understand that `preventDefault` on `dragover` is what **enables** dropping in HTML5 drag-and-drop. Preventing it at the document level prevents all drops everywhere.

### Attempt 7: Conditional global preventDefault (check `dataTransfer.types`)
**What I did:** Modified the global handler to check `e.dataTransfer.types.includes("application/brainmap-path")` — skip `preventDefault` for internal drags, apply it for external drags.

**Why it failed:** With `dragDropEnabled: false`, WKWebView handles external file drops at the **native level before JavaScript runs**. The HTML5 `dragover`/`drop` events are never dispatched to JavaScript for files dragged from Finder. The guard function literally never executes for external drops — verified by adding logging that never appeared.

**Root cause of my error:** I assumed WKWebView dispatches HTML5 drag events for native file drags. It doesn't when `dragDropEnabled: false`. The WebView handles the file drop internally (navigating to it) without involving JavaScript.

### Attempt 8: Set `dragDropEnabled: true` and fix internal drag differently
**Analysis only, not fully attempted.** The idea was to keep `dragDropEnabled: true` (so Tauri intercepts external drops) and rework internal drag to also use the native system. But internal HTML5 drags don't trigger Tauri native events, so this would require completely rewriting the internal drag-and-drop system — a massive refactor.

### Attempt 9: Programmatic window creation with `on_navigation`
**What I did:** Removed the window from `tauri.conf.json` (set `windows: []`) and created it programmatically in `setup()` using `WebviewWindowBuilder::new().on_navigation(|url| url.scheme() != "file")` to block `file://` navigations at the Rust/native level.

**Result:** Compiled successfully but was reverted by user request before testing.

## Why I Failed Repeatedly

1. **Solving without understanding.** I repeatedly jumped to solutions before fully understanding the problem. I should have first mapped out exactly how WKWebView, Tauri, and HTML5 drag interact at each layer, then designed a solution. Instead I tried thing after thing.

2. **Not reading the actual source code.** Multiple failures (Attempt 1, Attempt 4) came from assuming API behavior instead of reading the implementation in `node_modules/` or the Tauri Rust source.

3. **Not testing incrementally.** I made large changes and tested the whole thing, rather than adding one small log to verify my assumptions at each step. For example, I should have verified whether `dragover` events fire for external drops BEFORE writing the guard logic.

4. **Treating symptoms not causes.** The blank screen bugs (Attempts 5, 6) were symptoms of me introducing regressions without understanding the interaction between my changes and the existing system.

5. **Not recognizing the fundamental constraint early.** The `dragDropEnabled` true/false tradeoff is an architectural constraint of Tauri v2 on macOS. I should have identified this after Attempt 2 and designed around it, rather than trying workaround after workaround.

## Best Guess: What Should Work

### For blocking file:// navigation (Problem B)
**Attempt 9 (`on_navigation`)** is likely the correct approach. It operates at the native Tauri layer, before WKWebView processes the navigation. It was compiling and architecturally sound — it just needs to be tested. The concern is whether removing the declarative window config and creating it programmatically introduces side effects (window label mismatch, capability scope, etc.).

### For outbound drag to Finder (Problem A)
**`tauri-plugin-drag` (`startDrag`)** is the right tool, but it must be called BEFORE the browser initiates its own drag session. The Alt+mousedown approach (Attempt 5) was on the right track — it just had a bug in prop passing. After fixing the destructuring, it should work. The question is whether `startDrag` truly gets exclusive mouse control when called from a `mousemove` handler during a mousedown hold.

An alternative: don't use modifier keys. Instead, disable `draggable` on the tree items entirely and handle ALL drag (internal + external) via `mousedown` + `startDrag`. Internal drops would need to be detected by checking whether the drop coordinates land inside the app window. This is a larger refactor but avoids the HTML5/native conflict entirely.

## Current State of the Code

- `dragDropEnabled: false` in `tauri.conf.json`
- `tauri-plugin-drag` installed (Rust + npm) and registered in `lib.rs`
- `drag:default` capability added
- `import_files` Tauri command works (tested with file picker)
- `importFilesViaDialog()` wired to context menus ("Import Files...")
- `startDrag` imported in FileTreePanel with Alt+mousedown handler (has the destructuring fix)
- `useExternalDragDrop.ts` has a module-level `blockExternalFileDrop` guard (ineffective due to WKWebView behavior)
- `App.tsx` imports the module for the side effect
- Internal drag-and-drop works normally
- External file drop from Finder navigates the webview (unresolved)
- Outbound drag to Finder not working (unresolved)

## Files Involved

| File | Role |
|------|------|
| `crates/app/src-tauri/tauri.conf.json` | `dragDropEnabled: false` |
| `crates/app/src-tauri/src/lib.rs` | Plugin registration, setup |
| `crates/app/src-tauri/src/handlers.rs` | `handle_import_files`, `deduplicate_name`, `copy_dir_recursive` |
| `crates/app/src-tauri/src/commands.rs` | `import_files` command |
| `crates/app/src-tauri/src/dto.rs` | `ImportResultDto`, `ImportFailureDto` |
| `crates/app/src-tauri/capabilities/default.json` | `drag:default` permission |
| `crates/app/src/hooks/useExternalDragDrop.ts` | `importFilesViaDialog()` + ineffective global guard |
| `crates/app/src/components/Layout/FileTreePanel.tsx` | Internal drag handlers, `startDrag` import, context menus |
| `crates/app/src/components/Layout/AppLayout.tsx` | Overlay removed |
| `crates/app/src/App.tsx` | Side-effect import of guard module |
