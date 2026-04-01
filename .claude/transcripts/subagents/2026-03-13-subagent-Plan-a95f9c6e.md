# 2026-03-13 — Subagent Transcript: Plan

**Date:** 2026-03-13 16:30:56
**Agent:** Plan
**Agent ID:** a95f9c6e987bf4eb2
**Parent Session:** 59d90c43-faad-42f0-aa81-c079b9550b2c

---

## User

Design a multi-tab editor feature for a Tauri + React desktop knowledge graph app (BrainMap). 

## Current Architecture

**EditorStore** (`crates/app/src/stores/editorStore.ts`): Holds a single `activeNote: NoteDetail | null` and `activePlainFile: PlainFileDetail | null`. `openNote(path)` auto-saves dirty state, clears old state, fetches new note, pushes to navigation history. `isDirty`, `editedBody`, `editedFrontmatter` track unsaved changes.

**NavigationStore** (`crates/app/src/stores/navigationStore.ts`): Linear history array + cursor for back/forward (Cmd+[/]). `push(path)` called by `openNote`. `goBack()`/`goForward()` call `openNote` and `graphStore.selectNode()`. Has `_navigating` flag to prevent `push` during back/forward.

**EditorPanel** (`crates/app/src/components/Editor/EditorPanel.tsx`): Renders one note at a time. Shows hero header, frontmatter form, CodeMirror editor + preview (both mounted, toggled by CSS opacity), toolbar, related notes footer. Empty state when no note is open.

**AppLayout** (`crates/app/src/components/Layout/AppLayout.tsx`): 3-panel layout — left (Graph/Files), right (Editor + Search split). Editor panel is in the top-right panel.

**useAutoSave** (`crates/app/src/hooks/useAutoSave.ts`): Debounced 1.5s auto-save on edit, save on note switch and window blur.

**File tree** clicks: `editorStore.openNote(path)` + `graphStore.selectNode(path)`.

**Cmd+Click links**: Navigate to linked note via `editorStore.openNote(path)`.

## Requirements

1. Tab bar above editor showing all open files, with active tab highlighted
2. Opening a note always opens as new tab (never replaces), unless already open (then activates that tab)
3. Cmd+[/] back/forward navigation should work naturally — switching between tabs based on history
4. Close tabs with × button; middle-click to close; Cmd+W to close active tab
5. Dirty indicator on tabs with unsaved changes
6. Tab ordering: new tabs added to the right of the active tab
7. When closing active tab, activate the next tab (or previous if last)
8. When closing last tab, show empty state

## Design Considerations

1. **Per-tab state**: Each tab needs its own `editedBody`, `editedFrontmatter`, `isDirty`, `conflictState`, `fmUndoStack`, `fmRedoStack`, `viewMode`. When switching tabs, the editor state must be preserved.

2. **Store refactoring**: The current editorStore holds single-note state. Options:
   a. Create a new `tabStore` that manages an array of tabs, each with their own editor state, and refactor editorStore to delegate to the active tab's state
   b. Keep editorStore mostly as-is but add a tab layer that saves/restores editor state on tab switch

3. **NavigationStore interaction**: Back/forward should naturally switch tabs (activate the tab for the target note, or reopen it if the tab was closed)

4. **Auto-save**: Should continue to work — save dirty tab on switch, on blur, on debounced timer

5. **Performance**: Don't mount multiple CodeMirror instances. Only the active tab's editor should be mounted. Store editor content in tab state and restore when switching.

6. **Plain files vs BrainMap notes**: Both should work as tabs.

7. **Drag to reorder tabs** (nice to have, can be deferred).

Please provide a detailed implementation plan covering:
- New store design (tabStore or modified editorStore)
- Tab bar component
- How tab switching works (state save/restore)
- Navigation store changes
- Auto-save changes
- Integration points (file tree, link navigation, graph clicks)
- CSS/styling approach
- Test strategy
- File list with changes per file

---

## Assistant



I'll explore the current codebase to understand the existing architecture before designing the multi-tab feature.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/navigationStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/hooks/useAutoSave.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/*.tsx","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/styles/*.css","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.css","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"openNote|openPlainFile","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.test.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/navigationStore.test.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":30}`

---

## Assistant

Now let me look at how the file tree and other callers invoke `openNote` to understand all integration points.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"openNote\\(","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","glob":"*.{tsx,ts}","-n":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"openPlainFile\\(","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

Now let me check the undoStore to understand the workspace reset pattern, and look at how the app handles Cmd+W and keyboard shortcuts.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"Cmd\\+W|Mod-w|mod-w|closeWorkspace","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","-i":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"useEffect.*keydown|addEventListener.*keydown","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

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

Now I have a thorough understanding of the codebase. Let me check one more thing -- how the CSS is structured for the editor area.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.editor-panel|\\.editor-empty|\\.panel-content","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":3,"head_limit":40}`

---

## Assistant

I now have a comprehensive understanding of the architecture. Here is the detailed implementation plan.

---

## Multi-Tab Editor Implementation Plan

### 1. Architecture Overview

The core design decision is **Option (a): create a new `tabStore`** that manages an array of tabs with per-tab state, while refactoring `editorStore` to operate on the active tab's state. This is cleaner than save/restore because it avoids lossy state serialization and keeps the store API mostly unchanged for consumers.

**Key principle**: Only one CodeMirror instance is mounted at a time. Tab state (edited body, frontmatter edits, undo stacks, view mode, dirty flag) is stored in the tab object and swapped in/out of editorStore on tab switch.

### 2. New Store: `tabStore.ts`

Create `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts`.

```typescript
interface TabState {
  id: string;              // unique id (use path as id since only one tab per file)
  path: string;
  kind: "note" | "plain-file";
  // Cached display info (for tab bar rendering without needing full note data)
  title: string;
  noteType: string | null; // null for plain files
  // Per-tab editor state (swapped in/out of editorStore)
  editedBody: string | null;
  editedFrontmatter: Partial<EditableFrontmatter> | null;
  isDirty: boolean;
  conflictState: "none" | "external-change";
  fmUndoStack: FmSnapshot[];
  fmRedoStack: FmSnapshot[];
  viewMode: "edit" | "preview";
  // Scroll position for CodeMirror restoration
  scrollTop: number;
  cursorPos: number;
}

interface TabStoreState {
  tabs: TabState[];
  activeTabId: string | null;

  openTab: (path: string, kind: "note" | "plain-file") => void;
  closeTab: (id: string) => void;
  closeActiveTab: () => void;
  closeAllTabs: () => void;
  closeOtherTabs: (id: string) => void;
  activateTab: (id: string) => void;
  moveTab: (fromIndex: number, toIndex: number) => void;
  updateTabState: (id: string, partial: Partial<TabState>) => void;
  getTab: (id: string) => TabState | undefined;
  reset: () => void;
}
```

**Tab ID**: Use the file `path` as the tab ID since each file can only be open in one tab.

**Tab ordering**: New tabs are inserted at `activeTabIndex + 1`. If no active tab, append to the end.

**On close**: If closing the active tab, activate the next tab (or previous if it was the last). If no tabs remain, `activeTabId` becomes null.

### 3. EditorStore Refactoring

The editorStore keeps its existing interface but gains awareness of tabs. The key changes:

**`openNote(path)`** becomes:
1. Save current tab's editor state back to tabStore (snapshot: editedBody, editedFrontmatter, isDirty, conflictState, fmUndoStack, fmRedoStack, scrollTop, cursorPos from the CodeMirror view).
2. If auto-save enabled and current tab is dirty, save it first (existing behavior).
3. Call `tabStore.openTab(path, "note")` -- this either creates a new tab or activates an existing one.
4. If tab already existed, restore its cached state into editorStore fields.
5. If tab is new, fetch the note via API and initialize editorStore fields fresh.
6. Push to navigationStore (existing behavior).

**`openPlainFile(path)`** follows the same pattern with `kind: "plain-file"`.

A new **internal helper** `_snapshotToTab()` captures current editorStore state into the active tab's TabState. Another helper `_restoreFromTab(tab)` loads a tab's state into editorStore.

**viewMode** moves from EditorPanel local state into the tab state (so it persists across tab switches).

### 4. NavigationStore Changes

The navigationStore stays almost identical. The `goBack`/`goForward` methods currently call `editorStore.openNote(path)`, which will now handle tab activation via the refactored flow. No changes needed to the navigation history data structure.

One subtle change: when navigating back/forward to a path whose tab was closed, `openNote` will re-open it (creating a new tab). This is the natural behavior. The `_navigating` flag already prevents the push from re-entering.

### 5. Tab Bar Component

Create `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx`.

**Structure**:
```
<div class="tab-bar">
  {tabs.map(tab => (
    <div class="tab-item {active?}" 
         onClick={() => activateTab(tab.id)}
         onAuxClick={(e) => e.button === 1 && closeTab(tab.id)}>
      <NoteTypeIcon type={tab.noteType} />  // reuse fileTreeIcons
      <span class="tab-title">{tab.title}</span>
      {tab.isDirty && <span class="tab-dirty-dot" />}
      <button class="tab-close" onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}>×</button>
    </div>
  ))}
</div>
```

**Features**:
- Active tab visually highlighted (bottom border accent, brighter text)
- Dirty dot indicator (reuse existing `.editor-dirty-dot` style)
- Note type icon from `fileTreeIcons.tsx` (already has `NoteTypeIcon` component)
- Horizontal scroll when too many tabs (overflow-x: auto, no wrapping)
- Middle-click to close (onAuxClick with button === 1)
- Close button (x) on each tab, always visible on active tab, visible on hover for others

### 6. EditorPanel Changes

Modify `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx`:

- Remove local `viewMode` state (now lives in tabStore via editorStore)
- Add `viewMode` as a subscribed field from editorStore (new field)
- Add `<TabBar />` component above the editor content
- The empty state only shows when `tabs.length === 0`
- The `activePath` useEffect that resets viewMode on note switch is no longer needed (viewMode preserved per-tab)

**Layout change**: The editor panel area becomes:
```
<div class="editor-panel-container">
  <TabBar />
  <div class="editor-panel">
    {/* existing editor content */}
  </div>
</div>
```

### 7. CodeMirror State Preservation

When switching tabs, before unmounting:
1. Read `editorView.state.selection.main.head` (cursor position)
2. Read `editorView.scrollDOM.scrollTop` (scroll position)
3. Store both in the tab's state via `tabStore.updateTabState()`

When restoring a tab, after the CodeMirror instance mounts:
1. Set cursor position via `editorView.dispatch({ selection: { anchor: cursorPos } })`
2. Set scroll via `editorView.scrollDOM.scrollTop = scrollTop` (in a requestAnimationFrame)

The `MarkdownEditor` component's `notePath` key already triggers a full remount on note change, which is the desired behavior.

### 8. Auto-Save Changes

Modify `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/hooks/useAutoSave.ts`:

The auto-save hook subscribes to editorStore changes. The main change is that on tab switch (detected by `currentPath !== prevPath`), it should also trigger a save of the old tab if dirty (not just clear the timer). This is already handled by `openNote` doing auto-save before switching, so the hook's note-switch path just needs to clear the timer (existing behavior is correct).

One addition: the auto-save should also work for background tabs that were left dirty. But since we save on switch, background tabs should never be dirty unless the user hasn't switched away yet. So no change needed here.

### 9. Cmd+W Keyboard Shortcut

Add to the `handleKeyDown` in `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx`:

```typescript
if (isMod && e.key === "w") {
  e.preventDefault();
  const { activeTabId, closeTab } = useTabStore.getState();
  if (activeTabId) closeTab(activeTabId);
}
```

This needs to be placed before Escape handling. Note: Tauri's default behavior for Cmd+W closes the window. We need to prevent this by handling the event and calling `e.preventDefault()`. We may also need to configure Tauri's window settings to not close on Cmd+W (in `tauri.conf.json` or via the Rust event handler).

### 10. Integration Points (All Callers of openNote/openPlainFile)

All existing callers continue to work unchanged because `editorStore.openNote()` and `editorStore.openPlainFile()` remain the single entry point. The tab management happens internally. Callers:

| File | Call | Change needed |
|------|------|---------------|
| `FileTreePanel.tsx:428` | `openNote(node.fullPath)` | None |
| `FileTreePanel.tsx:431` | `openPlainFile(node.fullPath)` | None |
| `CommandPalette.tsx:70` | `openNote(item.path)` | None |
| `SearchPanel.tsx:78` | `openNote(result.path)` | None |
| `RelatedNotesFooter.tsx:97` | `openNote(item.path)` | None |
| `LinksEditor.tsx:155` | `openNote(link.target)` | None |
| `cmLinkNavigation.ts:66` | `openNote(resolved)` | None |
| `MarkdownPreview.tsx:109` | `openNote(resolved)` | None |
| `GraphView.tsx:191` | `openNote(nodePath)` | None |
| `CreateNoteDialog.tsx:134` | `openNote(createdPath)` | None |
| `navigationStore.ts:53,72` | `openNote(path)` | None |

### 11. External Change Handling

The existing `markExternalChange` in editorStore detects file system changes for the active note. With tabs, we also need to handle changes to background tabs. In `App.tsx`, the event handler currently checks `editorState.activeNote?.path === event.path`. With tabs:

- If the changed path matches the **active** tab: call `markExternalChange()` (existing behavior).
- If the changed path matches a **background** tab: mark that tab's conflict state in tabStore. When the user switches to it, the conflict banner will appear.

This requires a small addition to the event handler in `App.tsx`:
```typescript
const tab = useTabStore.getState().getTab(event.path);
if (tab && tab.id !== useTabStore.getState().activeTabId) {
  useTabStore.getState().updateTabState(tab.id, { conflictState: "external-change" });
}
```

### 12. Workspace Close

In `workspaceStore.closeWorkspace()`, add `useTabStore.getState().reset()` alongside the existing store resets. This clears all tabs.

### 13. Note/File Deletion

When a note or folder is deleted (via `ConfirmDeleteDialog`), any open tab for that path should be closed. Add to the deletion handler:
```typescript
useTabStore.getState().closeTab(deletedPath);
```

For folder deletion, close all tabs whose paths start with the folder path.

### 14. CSS/Styling

Add to `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`:

```css
/* ── Tab Bar ──────────────────────────────────────────────────── */
.tab-bar {
  display: flex;
  overflow-x: auto;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  min-height: 32px;
  flex-shrink: 0;
  scrollbar-width: none; /* Firefox */
}
.tab-bar::-webkit-scrollbar { display: none; }

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px 4px 10px;
  font-size: 12px;
  color: var(--text-muted);
  cursor: pointer;
  border-right: 1px solid var(--border);
  white-space: nowrap;
  max-width: 180px;
  user-select: none;
  position: relative;
}
.tab-item:hover { background: var(--bg-hover); }
.tab-item--active {
  color: var(--text);
  background: var(--bg);
  border-bottom: 2px solid var(--accent);
}

.tab-title {
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-close {
  opacity: 0;
  /* ... small close button styles */
}
.tab-item:hover .tab-close,
.tab-item--active .tab-close { opacity: 0.6; }
.tab-close:hover { opacity: 1; }

.tab-dirty-dot {
  /* reuse editor-dirty-dot pattern */
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
}
```

### 15. Implementation Sequence

**Step 1: Create tabStore** (`tabStore.ts` + `tabStore.test.ts`)
- Tab CRUD operations
- Tab ordering logic
- Active tab management
- ~15 unit tests

**Step 2: Add viewMode to editorStore**
- Move `viewMode` from EditorPanel local state to editorStore state
- Add `setViewMode` action
- Update EditorPanel to use store viewMode

**Step 3: Refactor editorStore for tab awareness**
- Add `_snapshotToTab()` and `_restoreFromTab()` internal helpers
- Modify `openNote()` to snapshot/restore via tabStore
- Modify `openPlainFile()` similarly
- Add cursor/scroll position fields
- Update existing tests, add new tab-aware tests

**Step 4: Create TabBar component**
- `TabBar.tsx` + `TabBar.test.tsx`
- Tab rendering, click to activate, close button, middle-click close, dirty indicator
- ~8 unit tests

**Step 5: Integrate TabBar into EditorPanel**
- Add TabBar above editor content
- Remove local viewMode state
- Update empty state condition

**Step 6: Add Cmd+W shortcut**
- Add to App.tsx keydown handler
- Prevent Tauri default window close behavior

**Step 7: Handle external changes for background tabs**
- Update App.tsx event handler
- Update markExternalChange flow

**Step 8: Handle deletion of open tabs**
- Update ConfirmDeleteDialog to close deleted tabs

**Step 9: Update workspaceStore.closeWorkspace**
- Add tabStore.reset()

**Step 10: CSS styling**
- Tab bar styles in App.css

**Step 11: Update tests**
- Update editorStore tests for tab-aware behavior
- Update navigationStore tests
- Add TabBar component tests

**Step 12: Update documentation**
- Update CLAUDE.md current status section
- Update MEMORY.md

### 16. Risks and Mitigations

**Risk: CodeMirror cursor/scroll restoration fidelity.** CodeMirror recreates entirely on notePath change. Cursor position restoration via `dispatch({ selection })` is reliable. Scroll restoration may need `requestAnimationFrame` timing.

**Risk: Cmd+W intercepted by Tauri before reaching JS.** Mitigation: Check Tauri's `tauri.conf.json` for window close shortcuts. May need to register the shortcut via Tauri's accelerator system or use `window.onbeforeunload`.

**Risk: Memory with many tabs.** Each tab stores editedBody (string) and frontmatter. For a knowledge base app with markdown files, this is negligible. No CodeMirror instances are mounted for inactive tabs.

**Risk: Tab title going stale after save.** When `saveNote()` refreshes the active note, also update `tabStore.updateTabState(id, { title: refreshed.title })`.

### 17. Files Changed Summary

| File | Action | Description |
|------|--------|-------------|
| `stores/tabStore.ts` | **New** | Tab state management store |
| `stores/tabStore.test.ts` | **New** | Tab store unit tests (~15) |
| `components/Editor/TabBar.tsx` | **New** | Tab bar UI component |
| `components/Editor/TabBar.test.tsx` | **New** | Tab bar component tests (~8) |
| `stores/editorStore.ts` | **Modify** | Add tab snapshot/restore, viewMode field |
| `stores/editorStore.test.ts` | **Modify** | Update tests for tab-aware openNote |
| `components/Editor/EditorPanel.tsx` | **Modify** | Add TabBar, remove local viewMode, update empty state |
| `App.tsx` | **Modify** | Add Cmd+W handler, update external change handler for background tabs |
| `App.css` | **Modify** | Add tab bar styles |
| `stores/workspaceStore.ts` | **Modify** | Add tabStore.reset() to closeWorkspace |
| `components/Layout/ConfirmDeleteDialog.tsx` | **Modify** | Close tab on note deletion |
| `hooks/useAutoSave.ts` | **Minor** | No structural change needed (works via editorStore) |

### Critical Files for Implementation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts` - Core refactoring target: must add tab snapshot/restore logic and viewMode state
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts` - New file: central tab state management (tabs array, ordering, active tab, CRUD)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx` - Must integrate TabBar, remove local viewMode, adjust empty state logic
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx` - Add Cmd+W shortcut, update external change handler for background tabs
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/navigationStore.ts` - Reference file: no changes needed but critical to verify tab activation integrates correctly with back/forward

---

