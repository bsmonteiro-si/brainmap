# 2026-03-12 — Subagent Transcript: Plan

**Date:** 2026-03-12 14:26:54
**Agent:** Plan
**Agent ID:** a7f3dc371997c9b29
**Parent Session:** c0c02209-41a8-48d2-8781-21883d346727

---

## User

Design an implementation plan for adding auto-save to the BrainMap desktop app. Here's what I know:

## Current State

**Save mechanism**: Manual only via Cmd+S. The `saveNote()` function in `editorStore.ts` handles saving with concurrent edit detection, title validation, graph sync, and conflict resolution.

**Dirty tracking**: `isDirty` boolean + `editedBody`/`editedFrontmatter` in editorStore. Set to true by `updateContent()` and `updateFrontmatter()`.

**Note switching**: `openNote()` discards unsaved changes with a log warning when `isDirty` is true.

**Preferences system**: `PersistedPrefs` in uiStore, persisted to `brainmap:uiPrefs` localStorage. SettingsModal has sections for Appearance, Editor Font, Interface Font.

**Key files**:
- `crates/app/src/stores/editorStore.ts` - save logic, dirty state
- `crates/app/src/stores/uiStore.ts` - preferences, PersistedPrefs interface
- `crates/app/src/App.tsx` - keyboard shortcuts, useEffects
- `crates/app/src/components/Settings/SettingsModal.tsx` - settings UI

## Requirements

Enable auto-save for all files and folders. This means:
1. A new `autoSave` boolean preference (default: true, persisted)
2. A toggle in the Settings modal
3. Debounced auto-save: after user stops editing for ~1.5 seconds, save automatically
4. Auto-save on note switch: when `openNote` is called and `isDirty`, save instead of discarding
5. Auto-save on window blur (user switches away from app)

## Design Considerations

- The debounce timer should reset on each edit
- Must not auto-save if title validation fails (empty title)
- Must not interfere with `savingInProgress` guard
- Must work with the existing conflict detection system
- The dirty indicator (blue dot + "(unsaved)") should still show briefly during the debounce window
- Auto-save should be cancelable (if user switches it off, no more auto-saves)
- Need to clean up timers on unmount and note switch

## Approach

1. **uiStore changes**: Add `autoSave: boolean` to PersistedPrefs and UIState, `setAutoSave(v: boolean)` action, default to `true`
2. **SettingsModal changes**: Add "Auto-save" toggle in the Appearance section (or a new "Editor" section)
3. **useAutoSave hook**: A custom hook in `hooks/useAutoSave.ts` that:
   - Subscribes to editorStore `isDirty` changes
   - Uses `setTimeout` with ~1500ms debounce
   - Calls `saveNote()` when timer fires
   - Clears timer on each new edit (via subscription to editorStore changes)
   - Clears timer when auto-save is disabled
   - Also saves on window blur event
4. **editorStore openNote change**: When auto-save is enabled and isDirty, call `saveNote()` before switching (fire-and-forget, don't block the switch)
5. **Tests**: Unit tests for the hook behavior, integration test for openNote auto-save

Please provide a detailed plan with file-by-file changes.

---

## Assistant



I'll explore the key files to understand the current implementation before designing the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

Now let me check existing hooks and test patterns.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/hooks/**/*.ts*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/stores/*.test.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.test.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.test.ts"}`

---

## Assistant

Now let me check the test setup and see if there's a pattern for testing hooks with React.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/test-setup.ts"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/","description":"List utils directory"}`

---

## Assistant

I now have a thorough understanding of the codebase. Here is the detailed implementation plan.

---

## Auto-Save Implementation Plan

### Overview

Add debounced auto-save to the BrainMap desktop app. When enabled (default: true), notes auto-save after 1.5 seconds of inactivity, on note switch, and on window blur. The feature is toggled via a new setting in the Settings modal and persisted to localStorage.

### Step 1: Add `autoSave` preference to `uiStore.ts`

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`

Changes:
1. Add `autoSave?: boolean` to the `PersistedPrefs` interface (line 47-54).
2. Add `autoSave: boolean` to the `UIState` interface (after `uiZoom` at line 101).
3. Add `setAutoSave: (v: boolean) => void` to the `UIState` interface (after `resetZoom` at line 137).
4. Initialize `autoSave` from `storedPrefs.autoSave ?? true` in the store creation (after `uiZoom` initialization at line 205).
5. Implement `setAutoSave` action -- sets state and calls `savePrefs` (include `autoSave` in the prefs object). Follow the same pattern as `setUIFontFamily` etc.
6. Update all existing `savePrefs(...)` calls to include the `autoSave` field, so toggling other prefs does not accidentally drop the auto-save setting. This is necessary because the `savePrefs` function writes the entire `PersistedPrefs` object. There are approximately 10 call sites (each setter: `setTheme`, `setUIFontFamily`, `setUIFontSize`, `setEditorFontFamily`, `setEditorFontSize`, `resetFontPrefs`, `zoomIn`, `zoomOut`, `resetZoom`, and the new `setAutoSave`).

**Alternative approach** (recommended): Refactor `savePrefs` calls to use a helper that always snapshots the full current state, instead of manually listing each field. This would be a small internal refactoring that prevents future bugs when adding more persisted prefs. For example:

```typescript
function saveCurrentPrefs(get: () => UIState) {
  const s = get();
  savePrefs({
    theme: s.theme,
    uiFontFamily: s.uiFontFamily,
    uiFontSize: s.uiFontSize,
    editorFontFamily: s.editorFontFamily,
    editorFontSize: s.editorFontSize,
    uiZoom: s.uiZoom,
    autoSave: s.autoSave,
  });
}
```

Then each setter just calls `saveCurrentPrefs(get)` instead of manually constructing the prefs object. This is optional but strongly recommended to prevent the current pattern from getting worse.

### Step 2: Add toggle to Settings modal

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx`

Changes:
1. Subscribe to `autoSave` and `setAutoSave` from `useUIStore`.
2. Add a new settings section or a row within the existing "Appearance" section. A row right after Theme makes sense since auto-save is a general behavior preference.
3. Render a toggle/checkbox control:

```tsx
<div className="settings-row">
  <span className="settings-label">Auto-save</span>
  <div className="settings-control">
    <label className="settings-toggle">
      <input
        type="checkbox"
        checked={autoSave}
        onChange={(e) => setAutoSave(e.target.checked)}
      />
      <span>Save notes automatically after editing</span>
    </label>
  </div>
</div>
```

4. Add minimal CSS for `settings-toggle` in `App.css` if needed (a simple flex row with gap between checkbox and label text).

### Step 3: Create `useAutoSave` hook

**New file**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/hooks/useAutoSave.ts`

This is the core of the feature. The hook:
- Runs inside `App.tsx` (or `AppLayout`) so it is always active when a workspace is open.
- Subscribes to editorStore state changes via Zustand's `subscribe`.
- Manages a single `setTimeout` reference for debounce.

Pseudocode:

```typescript
import { useEffect, useRef } from "react";
import { useEditorStore } from "../stores/editorStore";
import { useUIStore } from "../stores/uiStore";

const AUTO_SAVE_DELAY = 1500; // ms

export function useAutoSave() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending timer
  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Attempt to save if conditions are met
  const trySave = () => {
    const { isDirty, savingInProgress, activeNote, editedFrontmatter } =
      useEditorStore.getState();
    if (!isDirty || savingInProgress || !activeNote) return;
    // Don't auto-save if title validation would fail
    if (
      editedFrontmatter?.title !== undefined &&
      editedFrontmatter.title.trim() === ""
    )
      return;
    useEditorStore.getState().saveNote();
  };

  useEffect(() => {
    // Subscribe to editorStore: whenever isDirty becomes true (or editedBody/editedFrontmatter change),
    // reset the debounce timer.
    const unsubEditor = useEditorStore.subscribe((state, prevState) => {
      const autoSave = useUIStore.getState().autoSave;
      if (!autoSave) {
        clearTimer();
        return;
      }

      // If dirty state just appeared or content changed, reset timer
      if (state.isDirty && (state.editedBody !== prevState.editedBody ||
          state.editedFrontmatter !== prevState.editedFrontmatter)) {
        clearTimer();
        timerRef.current = setTimeout(trySave, AUTO_SAVE_DELAY);
      }

      // If isDirty became false (e.g., manual save), clear timer
      if (!state.isDirty && prevState.isDirty) {
        clearTimer();
      }
    });

    // Subscribe to autoSave pref: if toggled off, clear pending timer
    const unsubUI = useUIStore.subscribe(
      (state) => state.autoSave,
      (autoSave) => {
        if (!autoSave) clearTimer();
      }
    );

    // Window blur handler: save immediately when user leaves the app
    const handleBlur = () => {
      const autoSave = useUIStore.getState().autoSave;
      if (!autoSave) return;
      clearTimer();
      trySave();
    };
    window.addEventListener("blur", handleBlur);

    return () => {
      clearTimer();
      unsubEditor();
      unsubUI();
      window.removeEventListener("blur", handleBlur);
    };
  }, []);
}
```

Key design decisions:
- **Zustand `subscribe` (not React re-renders)**: The hook uses Zustand's external `subscribe` API rather than `useEffect` with selector dependencies. This avoids unnecessary React render cycles and gives direct access to prev/next state for comparison.
- **`useUIStore.subscribe` with selector**: Zustand v4 supports `subscribe(selector, listener)` for granular subscriptions. This watches only `autoSave` changes.
- **Title validation check in `trySave`**: Mirrors the same guard in `saveNote()` (line 84 of editorStore). This prevents the auto-save from firing repeatedly when the title is empty, which would be a no-op but wasteful.
- **Fire-and-forget `saveNote()`**: The `trySave` function does not await `saveNote()`. The `savingInProgress` guard inside `saveNote` prevents overlapping saves.

### Step 4: Modify `openNote` to auto-save before switching

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts`

Change the `openNote` method (lines 37-55). When `isDirty` is true, instead of just logging a warning, check if auto-save is enabled and attempt to save:

```typescript
openNote: async (path: string) => {
  const { activeNote, isDirty } = get();
  if (activeNote?.path === path) return;

  if (isDirty) {
    const autoSave = useUIStore.getState().autoSave;
    if (autoSave) {
      // Fire-and-forget save of the current note before switching
      const { savingInProgress, editedFrontmatter } = get();
      const titleInvalid = editedFrontmatter?.title !== undefined &&
        editedFrontmatter.title.trim() === "";
      if (!savingInProgress && !titleInvalid) {
        // Don't await -- we don't want to block navigation
        get().saveNote();
      }
    } else {
      log.warn("stores::editor", "discarding unsaved changes", { path: activeNote?.path });
    }
  }

  set({ isLoading: true, isDirty: false, conflictState: "none", editedBody: null, editedFrontmatter: null });
  // ... rest unchanged
},
```

This requires importing `useUIStore` in `editorStore.ts`. Since both are Zustand stores accessed via `getState()` (not React hooks), there is no circular dependency concern -- this is the same pattern already used for `useGraphStore` in the `saveNote` method (line 113).

**Important nuance**: The save is fire-and-forget (`get().saveNote()` without `await`). The state is immediately reset for the new note on the next line. This means the save of the old note runs concurrently with loading the new note. This is safe because:
- `saveNote` snapshots `activeNote`, `editedBody`, `editedFrontmatter` at the start (lines 79, 87-88).
- The API call uses the snapshotted path, not the (now-changed) `activeNote`.
- The post-save state update (lines 121-132) checks if `editedBody === savingBody` -- since state was already cleared, the equality check will be stale, but the set will harmlessly write `null` values that are already `null`.

Actually, there is a subtle issue: after the fire-and-forget `saveNote` completes, it calls `set({ activeNote: refreshed, ... })` at line 125, which would overwrite the newly loaded note with the old note's refreshed data. This is a real bug.

**Revised approach**: Use `await` but only for the API calls, not the full `saveNote()`. Better yet, extract a `saveCurrentNote()` that saves but does NOT re-read or update `activeNote`:

Actually the simplest correct approach: **await the save before clearing state**:

```typescript
openNote: async (path: string) => {
  const { activeNote, isDirty } = get();
  if (activeNote?.path === path) return;

  if (isDirty) {
    const autoSave = useUIStore.getState().autoSave;
    if (autoSave) {
      const { savingInProgress, editedFrontmatter } = get();
      const titleInvalid = editedFrontmatter?.title !== undefined &&
        editedFrontmatter.title.trim() === "";
      if (!savingInProgress && !titleInvalid) {
        await get().saveNote(); // await ensures it completes before we clear state
      }
    } else {
      log.warn("stores::editor", "discarding unsaved changes", { path: activeNote?.path });
    }
  }

  set({ isLoading: true, isDirty: false, conflictState: "none", editedBody: null, editedFrontmatter: null });
  // ... rest unchanged
},
```

Awaiting is safe here. The user clicked a different note -- a brief pause while the save completes (typically <100ms for a local file write) is acceptable. The `saveNote` method already handles its own error catching, so this won't throw.

### Step 5: Mount the hook in `App.tsx`

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx`

Changes:
1. Import `useAutoSave` from `./hooks/useAutoSave`.
2. Call `useAutoSave()` inside the `App` component, after the existing `useEffect` hooks (around line 165, before the `if (!info)` check). The hook internally checks for `activeNote` existence, so it is safe to call even when no workspace is open.

```typescript
// Auto-save: debounced save on edit, save on blur, save on note switch
useAutoSave();
```

### Step 6: Add CSS for settings toggle (minor)

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

Add a small rule for the checkbox toggle in the settings modal:

```css
.settings-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.settings-toggle input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}
```

### Step 7: Tests

#### 7a. `uiStore.test.ts` additions

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.test.ts`

Add a new `describe("autoSave")` block:

1. `autoSave defaults to true` -- check initial state.
2. `setAutoSave(false) persists to localStorage` -- call action, verify localStorage contains `autoSave: false`.
3. `setAutoSave(true) persists to localStorage` -- round-trip test.

#### 7b. `editorStore.test.ts` additions

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.test.ts`

Need to update the `vi.mock` for `uiStore` to expose `autoSave`. Add to the existing mock or create one:

```typescript
vi.mock("./uiStore", () => ({
  useUIStore: {
    getState: () => ({ autoSave: true }),
  },
}));
```

Add tests in the `openNote` describe block:

1. `auto-saves before switching when autoSave is enabled` -- set dirty state, call openNote with a different path, assert `updateNote` was called for the old note.
2. `discards changes when autoSave is disabled` -- mock `autoSave: false`, set dirty state, call openNote, assert `updateNote` was NOT called.
3. `does not auto-save on switch when title is empty` -- set `editedFrontmatter: { title: "" }`, verify no save.

#### 7c. `useAutoSave.test.ts` (new file)

**New file**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/hooks/useAutoSave.test.ts`

Since this hook uses Zustand subscriptions (not React rendering), it can be tested by:
1. Mocking `useEditorStore` and `useUIStore` with controllable `subscribe` functions.
2. Calling the subscription callbacks directly to simulate state changes.
3. Using `vi.useFakeTimers()` to control `setTimeout`.

Tests:
1. `schedules save after 1500ms when content changes and autoSave is on`
2. `resets timer on subsequent edits (debounce behavior)`
3. `does not schedule save when autoSave is off`
4. `clears timer when autoSave is toggled off`
5. `saves immediately on window blur`
6. `does not save on blur when autoSave is off`
7. `does not save when savingInProgress is true`
8. `does not save when title is empty`
9. `clears timer on cleanup (unmount)`

### Step 8: Update documentation

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/CLAUDE.md`

Update the "Current Status" section to mention auto-save:
- "Auto-save: debounced 1.5s auto-save on edit, save on note switch and window blur; `autoSave` boolean in PersistedPrefs (default: true); toggle in Settings modal; `useAutoSave` hook with Zustand subscriptions."

Update the test count.

---

### Edge Cases and Risks

1. **Race condition on note switch**: Addressed by awaiting `saveNote()` in `openNote` before clearing state. The save uses snapshotted values and re-reads the note, but the subsequent `set({ isLoading: true, ... })` immediately overwrites `activeNote` with the loading state.

2. **Multiple rapid note switches**: If user clicks note A -> B -> C quickly, the first `openNote(B)` awaits save of A, then `openNote(C)` awaits save of B (which is clean since user just arrived). The `savingInProgress` guard prevents overlapping saves.

3. **Conflict state interaction**: If `conflictState` is `"external-change"`, the note has been modified externally. `saveNote()` will proceed and overwrite -- this is the existing behavior for manual save and is acceptable. The user would have seen the conflict banner and can still choose "accept-theirs."

4. **Window close (quit)**: This plan handles `blur` (switching away from the app window). For actual quit/close events, Tauri's `before_exit` could be used in a future enhancement. The `blur` handler covers the most common case (Cmd+Tab away).

5. **Debounce timer leak**: The `useEffect` cleanup in the hook clears the timer and unsubscribes. The hook is mounted at the App level and only unmounts on full app teardown.

### Dependency Order

Steps 1 -> 2 can proceed in parallel. Step 3 depends on step 1. Step 4 depends on step 1. Step 5 depends on step 3. Steps 6 and 7 can proceed after their dependencies. Step 8 is last.

Recommended implementation order: 1 -> 4 -> 3 -> 5 -> 2 -> 6 -> 7 -> 8.

---

### Critical Files for Implementation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts` - Add `autoSave` to PersistedPrefs, UIState, and persistence logic
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts` - Modify `openNote` to auto-save before switching notes
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/hooks/useAutoSave.ts` - New file: core debounce hook with Zustand subscriptions and window blur handler
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx` - Add auto-save toggle to settings UI
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx` - Mount `useAutoSave` hook

---

