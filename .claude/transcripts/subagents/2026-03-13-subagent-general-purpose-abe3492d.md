# 2026-03-13 — Subagent Transcript: general-purpose

**Date:** 2026-03-13 17:10:39
**Agent:** general-purpose
**Agent ID:** abe3492d37cbc21ee
**Parent Session:** 59d90c43-faad-42f0-aa81-c079b9550b2c

---

## User

You are reviewing TypeScript/React code for BrainMap's multi-tab editor feature. This is pass 2 — the first review found 12 issues, of which 2 bugs and 8 should-fix items have been addressed. Your job is to verify the fixes and find any remaining or newly introduced defects.

## Review Criteria (from code-reviewer agent definition)

You are reviewing code for BrainMap, a knowledge graph tool. Your job is to find real defects, not style nits.

### What to Review

1. **Correctness**: Logic bugs, off-by-one, missed conditions, error handling covering all failure modes, state consistency after mutations.
2. **Function Design**: Each function doing one thing, descriptive names, appropriate patterns.
3. **Test Coverage**: New public functions tested, error paths tested, behavior verification.
4. **Performance**: O(n²) loops, unnecessary clones, repeated scans.

### Output Format

Write your review as a list of findings. For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

Do NOT report: missing comments/docstrings, style preferences, TODOs unless they mask a bug.

## Files to Review

Here are the 6 changed files (post-fix). Review them for correctness, especially verifying that the original 12 findings are addressed:

### Original findings that should be fixed:
1. Race condition guard in openNote/openPlainFile (isLoading check added)
2. setScrollCursor syncs to tabStore (tabStore.updateTabState added)
3. Module-level editorViewRef → useRef (converted)
4. Duplicated close logic → shared closeTabAndNavigateNext in tabActions.ts
5. Stale activeTabId in Cmd+W (captured before async save)
7. openPlainFile pushes to navigationStore (added)
8. closeOtherTabs/closeAllTabs (documented as caller-saves contract)
9. undoFrontmatter/redoFrontmatter sync to tabStore (added)
10. resolveConflict error handling (try/catch added)
11. Active tab dirty dot reads from editorStore (fixed)

### File 1: editorStore.ts
```typescript
import { create } from "zustand";
import type { NoteDetail, PlainFileDetail } from "../api/types";
import { getAPI } from "../api/bridge";
import { useGraphStore } from "./graphStore";
import { useNavigationStore } from "./navigationStore";
import { useTabStore } from "./tabStore";
import { log } from "../utils/logger";

export type EditableFrontmatter = Pick<NoteDetail, 'title' | 'note_type' | 'tags' | 'status' | 'source' | 'summary' | 'extra'>;

type FmSnapshot = Partial<EditableFrontmatter> | null;
const MAX_FM_UNDO = 50;
const FM_GROUP_MS = 300;

interface EditorState {
  activeNote: NoteDetail | null;
  activePlainFile: PlainFileDetail | null;
  isLoading: boolean;
  isDirty: boolean;
  conflictState: "none" | "external-change";
  editedBody: string | null;
  editedFrontmatter: Partial<EditableFrontmatter> | null;
  savingInProgress: boolean;
  fmUndoStack: FmSnapshot[];
  fmRedoStack: FmSnapshot[];
  _lastFmField: string | null;
  _lastFmTime: number;
  viewMode: "edit" | "preview";
  scrollTop: number;
  cursorPos: number;

  openNote: (path: string) => Promise<void>;
  openPlainFile: (path: string) => Promise<void>;
  refreshActiveNote: () => Promise<void>;
  updateContent: (body: string) => void;
  updateFrontmatter: (changes: Partial<EditableFrontmatter>) => void;
  undoFrontmatter: () => void;
  redoFrontmatter: () => void;
  saveNote: () => Promise<void>;
  markExternalChange: () => void;
  resolveConflict: (action: "keep-mine" | "accept-theirs") => Promise<void>;
  setViewMode: (mode: "edit" | "preview") => void;
  setScrollCursor: (scrollTop: number, cursorPos: number) => void;
  clear: () => void;
}

/** Snapshot current editor state into the active tab in tabStore. */
function snapshotToActiveTab() {
  const tabStore = useTabStore.getState();
  const { activeTabId } = tabStore;
  if (!activeTabId) return;

  const editor = useEditorStore.getState();
  tabStore.updateTabState(activeTabId, {
    editedBody: editor.editedBody,
    editedFrontmatter: editor.editedFrontmatter,
    isDirty: editor.isDirty,
    conflictState: editor.conflictState,
    fmUndoStack: editor.fmUndoStack,
    fmRedoStack: editor.fmRedoStack,
    viewMode: editor.viewMode,
    scrollTop: editor.scrollTop,
    cursorPos: editor.cursorPos,
  });
}

const CLEAN_EDITOR_STATE = {
  isDirty: false,
  conflictState: "none" as const,
  editedBody: null,
  editedFrontmatter: null,
  activePlainFile: null,
  activeNote: null,
  fmUndoStack: [] as FmSnapshot[],
  fmRedoStack: [] as FmSnapshot[],
  _lastFmField: null,
  _lastFmTime: 0,
  viewMode: "edit" as const,
  scrollTop: 0,
  cursorPos: 0,
};

export const useEditorStore = create<EditorState>((set, get) => ({
  activeNote: null,
  activePlainFile: null,
  isLoading: false,
  isDirty: false,
  conflictState: "none",
  editedBody: null,
  editedFrontmatter: null,
  savingInProgress: false,
  fmUndoStack: [],
  fmRedoStack: [],
  _lastFmField: null,
  _lastFmTime: 0,
  viewMode: "edit",
  scrollTop: 0,
  cursorPos: 0,

  openNote: async (path: string) => {
    const { activeNote, isLoading } = get();
    const tabStore = useTabStore.getState();

    // Already viewing this note in this tab — no-op
    if (activeNote?.path === path && tabStore.activeTabId === path) return;

    // Guard against concurrent tab switches
    if (isLoading) return;

    // 1. Snapshot current tab state before anything changes
    snapshotToActiveTab();

    // 2. Auto-save if dirty
    const { isDirty, savingInProgress, editedFrontmatter } = get();
    if (isDirty) {
      const titleInvalid = editedFrontmatter?.title !== undefined &&
        editedFrontmatter.title.trim() === "";
      if (!savingInProgress && !titleInvalid) {
        await get().saveNote();
      }
    }

    // 3. Check if tab already exists (restore from it)
    const existingTab = tabStore.getTab(path);
    if (existingTab) {
      // Activate existing tab and restore its state
      tabStore.activateTab(path);
      set({ isLoading: true });
      try {
        const api = await getAPI();
        const note = await api.readNote(path);
        set({
          activeNote: note,
          activePlainFile: null,
          isLoading: false,
          editedBody: existingTab.editedBody,
          editedFrontmatter: existingTab.editedFrontmatter,
          isDirty: existingTab.isDirty,
          conflictState: existingTab.conflictState,
          fmUndoStack: existingTab.fmUndoStack,
          fmRedoStack: existingTab.fmRedoStack,
          _lastFmField: null,
          _lastFmTime: 0,
          viewMode: existingTab.viewMode,
          scrollTop: existingTab.scrollTop,
          cursorPos: existingTab.cursorPos,
        });
        useNavigationStore.getState().push(path);
      } catch (e) {
        log.error("stores::editor", "failed to open note", { path, error: String(e) });
        set({ isLoading: false });
      }
      return;
    }

    // 4. New tab — fetch note and create tab
    set({ ...CLEAN_EDITOR_STATE, isLoading: true, savingInProgress: get().savingInProgress });
    try {
      const api = await getAPI();
      const note = await api.readNote(path);
      tabStore.openTab(path, "note", note.title, note.note_type);
      set({ activeNote: note, isLoading: false });
      useNavigationStore.getState().push(path);
    } catch (e) {
      log.error("stores::editor", "failed to open note", { path, error: String(e) });
      set({ isLoading: false });
    }
  },

  openPlainFile: async (path: string) => {
    const { activePlainFile, isLoading } = get();
    const tabStore = useTabStore.getState();

    if (activePlainFile?.path === path && tabStore.activeTabId === path) return;

    // Guard against concurrent tab switches
    if (isLoading) return;

    // 1. Snapshot current tab state
    snapshotToActiveTab();

    // 2. Auto-save if dirty
    const { isDirty, savingInProgress } = get();
    if (isDirty && !savingInProgress) {
      await get().saveNote();
    }

    // 3. Check for existing tab
    const existingTab = tabStore.getTab(path);
    if (existingTab) {
      tabStore.activateTab(path);
      set({ isLoading: true });
      try {
        const api = await getAPI();
        const file = await api.readPlainFile(path);
        set({
          activePlainFile: file,
          activeNote: null,
          isLoading: false,
          editedBody: existingTab.editedBody,
          editedFrontmatter: null,
          isDirty: existingTab.isDirty,
          conflictState: existingTab.conflictState,
          fmUndoStack: [],
          fmRedoStack: [],
          _lastFmField: null,
          _lastFmTime: 0,
          viewMode: existingTab.viewMode,
          scrollTop: existingTab.scrollTop,
          cursorPos: existingTab.cursorPos,
        });
        useNavigationStore.getState().push(path);
      } catch (e) {
        log.error("stores::editor", "failed to open plain file", { path, error: String(e) });
        set({ isLoading: false });
      }
      return;
    }

    // 4. New tab
    set({ ...CLEAN_EDITOR_STATE, isLoading: true, savingInProgress: get().savingInProgress });
    try {
      const api = await getAPI();
      const file = await api.readPlainFile(path);
      const fileName = path.split("/").pop() ?? path;
      tabStore.openTab(path, "plain-file", fileName, null);
      set({ activePlainFile: file, isLoading: false });
      useNavigationStore.getState().push(path);
    } catch (e) {
      log.error("stores::editor", "failed to open plain file", { path, error: String(e) });
      set({ isLoading: false });
    }
  },

  refreshActiveNote: async () => {
    const { activeNote, activePlainFile } = get();
    if (activeNote) {
      try {
        const api = await getAPI();
        const note = await api.readNote(activeNote.path);
        set({ activeNote: note });
      } catch (e) {
        log.error("stores::editor", "failed to refresh note", { error: String(e) });
      }
    } else if (activePlainFile) {
      try {
        const api = await getAPI();
        const file = await api.readPlainFile(activePlainFile.path);
        set({ activePlainFile: file });
      } catch (e) {
        log.error("stores::editor", "failed to refresh plain file", { error: String(e) });
      }
    }
  },

  updateContent: (body: string) => {
    set({ editedBody: body, isDirty: true });
    const tabId = useTabStore.getState().activeTabId;
    if (tabId) useTabStore.getState().updateTabState(tabId, { isDirty: true, editedBody: body });
  },

  updateFrontmatter: (changes: Partial<EditableFrontmatter>) => {
    const { editedFrontmatter, fmUndoStack, _lastFmField, _lastFmTime } = get();
    const current = editedFrontmatter ?? {};
    const keys = Object.keys(changes);
    const fieldKey = keys.length === 1 ? keys[0] : keys.sort().join(",");
    const now = Date.now();

    const shouldGroup = fieldKey === _lastFmField && (now - _lastFmTime) < FM_GROUP_MS;

    let newStack = fmUndoStack;
    if (!shouldGroup) {
      newStack = [...fmUndoStack, editedFrontmatter];
      if (newStack.length > MAX_FM_UNDO) newStack = newStack.slice(newStack.length - MAX_FM_UNDO);
    }

    const newFm = { ...current, ...changes };
    set({
      editedFrontmatter: newFm,
      isDirty: true,
      fmUndoStack: newStack,
      fmRedoStack: [],
      _lastFmField: fieldKey,
      _lastFmTime: now,
    });
    const tabId = useTabStore.getState().activeTabId;
    if (tabId) useTabStore.getState().updateTabState(tabId, { isDirty: true, editedFrontmatter: newFm });
  },

  undoFrontmatter: () => {
    const { fmUndoStack, editedFrontmatter, fmRedoStack, editedBody } = get();
    if (fmUndoStack.length === 0) return;
    const prev = fmUndoStack[fmUndoStack.length - 1];
    const newUndoStack = fmUndoStack.slice(0, -1);
    const newRedoStack = [...fmRedoStack, editedFrontmatter];
    const isDirty = prev !== null || editedBody !== null;
    set({
      editedFrontmatter: prev,
      fmUndoStack: newUndoStack,
      fmRedoStack: newRedoStack,
      isDirty,
      _lastFmField: null,
      _lastFmTime: 0,
    });
    const tabId = useTabStore.getState().activeTabId;
    if (tabId) useTabStore.getState().updateTabState(tabId, {
      isDirty, editedFrontmatter: prev, fmUndoStack: newUndoStack, fmRedoStack: newRedoStack,
    });
  },

  redoFrontmatter: () => {
    const { fmRedoStack, editedFrontmatter, fmUndoStack, editedBody } = get();
    if (fmRedoStack.length === 0) return;
    const next = fmRedoStack[fmRedoStack.length - 1];
    const newRedoStack = fmRedoStack.slice(0, -1);
    const newUndoStack = [...fmUndoStack, editedFrontmatter];
    const isDirty = next !== null || editedBody !== null;
    set({
      editedFrontmatter: next,
      fmUndoStack: newUndoStack,
      fmRedoStack: newRedoStack,
      isDirty,
      _lastFmField: null,
      _lastFmTime: 0,
    });
    const tabId = useTabStore.getState().activeTabId;
    if (tabId) useTabStore.getState().updateTabState(tabId, {
      isDirty, editedFrontmatter: next, fmUndoStack: newUndoStack, fmRedoStack: newRedoStack,
    });
  },

  saveNote: async () => {
    const { activeNote, activePlainFile, editedBody, editedFrontmatter, isDirty } = get();
    if (!isDirty) return;

    // Plain file save path
    if (activePlainFile) {
      if (activePlainFile.binary || editedBody === null) return;
      const savingBody = editedBody;
      try {
        set({ savingInProgress: true });
        const api = await getAPI();
        await api.writePlainFile(activePlainFile.path, savingBody);

        const current = get();
        const newBody = current.editedBody === savingBody ? null : current.editedBody;
        const newIsDirty = newBody !== null;
        set({
          activePlainFile: { ...activePlainFile, body: savingBody },
          isDirty: newIsDirty,
          editedBody: newBody,
          conflictState: "none",
          savingInProgress: false,
        });
        const tabId = useTabStore.getState().activeTabId;
        if (tabId) useTabStore.getState().updateTabState(tabId, { isDirty: newIsDirty });
      } catch (e) {
        log.error("stores::editor", "failed to save plain file", { path: activePlainFile.path, error: String(e) });
        set({ savingInProgress: false });
      }
      return;
    }

    // BrainMap note save path
    if (!activeNote) return;
    if (editedBody === null && editedFrontmatter === null) return;

    if (editedFrontmatter?.title !== undefined && editedFrontmatter.title.trim() === "") return;

    const savingBody = editedBody;
    const savingFrontmatter = editedFrontmatter;

    try {
      set({ savingInProgress: true });
      const api = await getAPI();

      const params: Record<string, unknown> = { path: activeNote.path };
      if (savingBody !== null) params.body = savingBody;
      if (savingFrontmatter) {
        if (savingFrontmatter.title !== undefined) params.title = savingFrontmatter.title;
        if (savingFrontmatter.note_type !== undefined) params.note_type = savingFrontmatter.note_type;
        if (savingFrontmatter.tags !== undefined) params.tags = savingFrontmatter.tags;
        if (savingFrontmatter.status !== undefined) params.status = savingFrontmatter.status;
        if (savingFrontmatter.source !== undefined) params.source = savingFrontmatter.source;
        if (savingFrontmatter.summary !== undefined) params.summary = savingFrontmatter.summary;
        if (savingFrontmatter.extra !== undefined) params.extra = savingFrontmatter.extra;
      }

      await api.updateNote(params as Parameters<typeof api.updateNote>[0]);

      const refreshed = await api.readNote(activeNote.path);

      if (savingFrontmatter?.title !== undefined || savingFrontmatter?.note_type !== undefined) {
        useGraphStore.getState().applyEvent({
          type: "node-updated",
          path: activeNote.path,
          node: { path: refreshed.path, title: refreshed.title, note_type: refreshed.note_type },
        });
      }

      const current = get();
      const newBody = current.editedBody === savingBody ? null : current.editedBody;
      const newFm = current.editedFrontmatter === savingFrontmatter ? null : current.editedFrontmatter;
      const newIsDirty = newBody !== null || newFm !== null;

      set({
        activeNote: refreshed,
        isDirty: newIsDirty,
        editedBody: newBody,
        editedFrontmatter: newFm,
        conflictState: "none",
        savingInProgress: false,
      });

      const tabId = useTabStore.getState().activeTabId;
      if (tabId) {
        useTabStore.getState().updateTabState(tabId, {
          isDirty: newIsDirty,
          title: refreshed.title,
          noteType: refreshed.note_type,
        });
      }
    } catch (e) {
      log.error("stores::editor", "failed to save note", { path: activeNote.path, error: String(e) });
      set({ savingInProgress: false });
    }
  },

  markExternalChange: async () => {
    const { isDirty, activeNote, activePlainFile, savingInProgress } = get();
    if (savingInProgress) return;

    if (isDirty) {
      set({ conflictState: "external-change" });
    } else if (activeNote) {
      try {
        const api = await getAPI();
        const note = await api.readNote(activeNote.path);
        set({ activeNote: note, conflictState: "none" });
      } catch (e) {
        log.error("stores::editor", "failed to reload note", { error: String(e) });
      }
    } else if (activePlainFile) {
      try {
        const api = await getAPI();
        const file = await api.readPlainFile(activePlainFile.path);
        set({ activePlainFile: file, conflictState: "none" });
      } catch (e) {
        log.error("stores::editor", "failed to reload plain file", { error: String(e) });
      }
    }
  },

  resolveConflict: async (action: "keep-mine" | "accept-theirs") => {
    if (action === "accept-theirs") {
      const { activeNote, activePlainFile } = get();
      set({ isDirty: false, editedBody: null, editedFrontmatter: null, conflictState: "none", fmUndoStack: [], fmRedoStack: [], _lastFmField: null, _lastFmTime: 0 });
      try {
        const api = await getAPI();
        if (activeNote) {
          const note = await api.readNote(activeNote.path);
          set({ activeNote: note });
        } else if (activePlainFile) {
          const file = await api.readPlainFile(activePlainFile.path);
          set({ activePlainFile: file });
        }
      } catch (e) {
        log.error("stores::editor", "failed to accept external changes", { error: String(e) });
        // Re-mark as dirty since we couldn't load the external version
        set({ isDirty: true, conflictState: "external-change" });
      }
    } else {
      set({ conflictState: "none" });
    }
  },

  setViewMode: (mode: "edit" | "preview") => {
    set({ viewMode: mode });
    const tabId = useTabStore.getState().activeTabId;
    if (tabId) useTabStore.getState().updateTabState(tabId, { viewMode: mode });
  },

  setScrollCursor: (scrollTop: number, cursorPos: number) => {
    set({ scrollTop, cursorPos });
    const tabId = useTabStore.getState().activeTabId;
    if (tabId) useTabStore.getState().updateTabState(tabId, { scrollTop, cursorPos });
  },

  clear: () => {
    set({
      activeNote: null,
      activePlainFile: null,
      isLoading: false,
      isDirty: false,
      conflictState: "none",
      editedBody: null,
      editedFrontmatter: null,
      savingInProgress: false,
      fmUndoStack: [],
      fmRedoStack: [],
      _lastFmField: null,
      _lastFmTime: 0,
      viewMode: "edit",
      scrollTop: 0,
      cursorPos: 0,
    });
  },
}));
```

### File 2: EditorPanel.tsx
```tsx
import { useEffect, useCallback, useRef } from "react";
import { useEditorStore } from "../../stores/editorStore";
import { useUIStore } from "../../stores/uiStore";
import { useTabStore } from "../../stores/tabStore";
import { MarkdownEditor } from "./MarkdownEditor";
import { MarkdownPreview } from "./MarkdownPreview";
import { FrontmatterForm } from "./FrontmatterForm";
import { RelatedNotesFooter } from "./RelatedNotesFooter";
import { EditorToolbar } from "./EditorToolbar";
import { TabBar } from "./TabBar";
import { getNodeColor } from "../GraphView/graphStyles";
import type { EditorView } from "@codemirror/view";

export function EditorPanel() {
  const editorViewRef = useRef<EditorView | null>(null);
  const activeNote = useEditorStore((s) => s.activeNote);
  const activePlainFile = useEditorStore((s) => s.activePlainFile);
  const isLoading = useEditorStore((s) => s.isLoading);
  const conflictState = useEditorStore((s) => s.conflictState);
  const resolveConflict = useEditorStore((s) => s.resolveConflict);
  const focusMode = useUIStore((s) => s.focusMode);
  const toggleFocusMode = useUIStore((s) => s.toggleFocusMode);
  const isDirty = useEditorStore((s) => s.isDirty);
  const editedFm = useEditorStore((s) => s.editedFrontmatter);
  const viewMode = useEditorStore((s) => s.viewMode);
  const setViewMode = useEditorStore((s) => s.setViewMode);
  const editedBody = useEditorStore((s) => s.editedBody);
  const scrollTop = useEditorStore((s) => s.scrollTop);
  const cursorPos = useEditorStore((s) => s.cursorPos);
  const tabs = useTabStore((s) => s.tabs);

  const onEditorChange = useCallback((body: string) => {
    useEditorStore.getState().updateContent(body);
  }, []);

  // Capture scroll/cursor from editorView before note switch
  const handleViewReady = useCallback((view: EditorView | null) => {
    editorViewRef.current = view;
  }, []);

  const activePath = activeNote?.path ?? activePlainFile?.path;

  // When activePath changes (tab switch), capture scroll/cursor from the old view
  useEffect(() => {
    return () => {
      // Cleanup: capture scroll/cursor from the current view before it switches
      if (editorViewRef.current) {
        const scrollPos = editorViewRef.current.scrollDOM.scrollTop;
        const cursor = editorViewRef.current.state.selection.main.head;
        useEditorStore.getState().setScrollCursor(scrollPos, cursor);
      }
    };
  }, [activePath]);
  // ... (rest of render JSX)
}
```

### File 3: TabBar.tsx
```tsx
import { useTabStore } from "../../stores/tabStore";
import { closeTabAndNavigateNext } from "../../stores/tabActions";
import { useEditorStore } from "../../stores/editorStore";
import { useGraphStore } from "../../stores/graphStore";
import { NoteTypeIcon } from "../Layout/fileTreeIcons";

export function TabBar() {
  const tabs = useTabStore((s) => s.tabs);
  const activeTabId = useTabStore((s) => s.activeTabId);
  const editorIsDirty = useEditorStore((s) => s.isDirty);

  if (tabs.length === 0) return null;

  const handleActivate = (path: string) => {
    if (path === activeTabId) return;
    const tab = useTabStore.getState().getTab(path);
    if (!tab) return;
    if (tab.kind === "note") {
      useGraphStore.getState().selectNode(path);
      useEditorStore.getState().openNote(path);
    } else {
      useGraphStore.getState().selectNode(null);
      useEditorStore.getState().openPlainFile(path);
    }
  };

  const handleClose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const editor = useEditorStore.getState();
    const tabStore = useTabStore.getState();
    if (tabStore.activeTabId === id && editor.isDirty) {
      editor.saveNote().then(() => {
        closeTabAndNavigateNext(id);
      });
    } else {
      closeTabAndNavigateNext(id);
    }
  };

  const handleAuxClick = (e: React.MouseEvent, id: string) => {
    if (e.button === 1) {
      e.preventDefault();
      handleClose(e, id);
    }
  };

  return (
    <div className="tab-bar" role="tablist">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tab"
          aria-selected={tab.id === activeTabId}
          className={`tab-item${tab.id === activeTabId ? " tab-item--active" : ""}`}
          onClick={() => handleActivate(tab.id)}
          onAuxClick={(e) => handleAuxClick(e, tab.id)}
          title={tab.path}
        >
          <NoteTypeIcon noteType={tab.noteType ?? undefined} size={12} />
          <span className="tab-title">{tab.title}</span>
          {(tab.id === activeTabId ? editorIsDirty : tab.isDirty) && <span className="tab-dirty-dot" />}
          <button
            className="tab-close"
            onClick={(e) => handleClose(e, tab.id)}
            aria-label={`Close ${tab.title}`}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
```

### File 4: App.tsx (Cmd+W handler excerpt)
```tsx
if (isMod && e.key === "w") {
  e.preventDefault();
  const closingId = useTabStore.getState().activeTabId;
  if (closingId) {
    const editor = useEditorStore.getState();
    if (editor.isDirty) {
      editor.saveNote().then(() => {
        closeTabAndNavigateNext(closingId);
      });
    } else {
      closeTabAndNavigateNext(closingId);
    }
  }
}
```

### File 5: tabStore.ts
```typescript
import { create } from "zustand";
import type { EditableFrontmatter } from "./editorStore";

type FmSnapshot = Partial<EditableFrontmatter> | null;

export interface TabState {
  id: string;
  path: string;
  kind: "note" | "plain-file";
  title: string;
  noteType: string | null;
  editedBody: string | null;
  editedFrontmatter: FmSnapshot;
  isDirty: boolean;
  conflictState: "none" | "external-change";
  fmUndoStack: FmSnapshot[];
  fmRedoStack: FmSnapshot[];
  viewMode: "edit" | "preview";
  scrollTop: number;
  cursorPos: number;
}

// ... (store implementation with closeOtherTabs/closeAllTabs documented as caller-saves)
```

### File 6: tabActions.ts (NEW)
```typescript
import { useTabStore } from "./tabStore";
import { useEditorStore } from "./editorStore";
import { useGraphStore } from "./graphStore";

export function closeTabAndNavigateNext(id: string) {
  const tabStore = useTabStore.getState();
  const wasActive = tabStore.activeTabId === id;
  tabStore.closeTab(id);

  if (wasActive) {
    const { activeTabId } = useTabStore.getState();
    if (activeTabId) {
      const nextTab = useTabStore.getState().getTab(activeTabId);
      if (nextTab) {
        if (nextTab.kind === "note") {
          useGraphStore.getState().selectNode(activeTabId);
          useEditorStore.getState().openNote(activeTabId);
        } else {
          useGraphStore.getState().selectNode(null);
          useEditorStore.getState().openPlainFile(activeTabId);
        }
      }
    } else {
      useEditorStore.getState().clear();
      useGraphStore.getState().selectNode(null);
    }
  }
}
```

Write your review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/multi-tab-review-2.md`. Focus on whether original findings are properly fixed and any new issues introduced by the fixes.

---

## Assistant



Let me carefully review the code files provided.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ 2>/dev/null || echo \"Directory does not exist\"","description":"Check if reviews/code directory exists"}`

---

## Assistant

Let me also check the first review to understand the original findings.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/multi-tab-review-1.md"}`

---

## Assistant

Now let me check the tabStore implementation for completeness.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/tabStore.ts","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/tabActions.ts","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabActions.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

Now let me check the actual EditorPanel.tsx and TabBar.tsx files as well as App.tsx for the Cmd+W handler.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx"}`

---

## Assistant

Now let me check App.tsx for the Cmd+W handler.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"key === \"w\"","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","-C":15}`

---

## Assistant

Now I have all the information needed. Let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/multi-tab-review-2.md","content":"# Multi-Tab Editor — Code Review Pass 2\n\nReviewer: code-reviewer agent (adapted for T`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/multi-tab-review-2.md`.

**Summary of findings:**

All 10 actionable items from pass 1 (2 bugs + 8 should-fix) are properly fixed. No regressions introduced.

**New findings (pass 2):**

- **Finding 14 (should-fix):** `savingInProgress` is preserved from previous tab state when opening a new tab. Should be explicitly set to `false` since `saveNote()` is fully awaited before that point.
- **Finding 17 (should-fix):** Middle-clicking (closing) a background dirty tab discards its unsaved edits silently, since `saveNote()` only operates on the active editor content. Mitigated by auto-save on tab switch, but possible if auto-save is disabled.
- **Finding 13 (suggestion):** Empty-title guard silently skips save during tab switch with no user warning.
- **Finding 16 (suggestion):** `closeTabAndNavigateNext` causes a harmless stale snapshot write that is immediately overwritten.

No blockers. The two should-fix items are low-risk edge cases.

---

