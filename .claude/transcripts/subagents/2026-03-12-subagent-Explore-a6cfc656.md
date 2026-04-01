# 2026-03-12 — Subagent Transcript: Explore

**Date:** 2026-03-12 14:24:15
**Agent:** Explore
**Agent ID:** a6cfc6560bfaf72af
**Parent Session:** c0c02209-41a8-48d2-8781-21883d346727

---

## User

Explore the BrainMap desktop app codebase to understand:

1. How saving currently works - find the Cmd+S save handler, the `saveNote` function, and any save-related logic in the editor store and Tauri commands
2. Whether there's any existing auto-save mechanism or debounce logic
3. How the editor tracks dirty state (unsaved changes)
4. How the settings/preferences system works (uiPrefs in localStorage, SettingsModal)
5. Find all places where save is triggered or dirty state is checked

Focus on these directories:
- crates/app/src/stores/ (especially editorStore)
- crates/app/src/components/Editor/
- crates/app/src/components/Settings/
- crates/app/src-tauri/src/ (Tauri commands for saving)

Be thorough - look at the actual save flow from keypress to disk write.

---

## Assistant

I'll conduct a thorough exploration of the BrainMap desktop app codebase to understand the save flow, dirty state tracking, and settings system.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -type f \\( -name \"*.ts\" -o -name \"*.tsx\" \\) | grep -E \"(store|editor|save)\" | head -20"}`

---

## Assistant

Let me search for key files across the app structure:

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

- **Glob**: `{"pattern":"crates/app/src/components/Editor/**/*.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Settings/**/*.tsx"}`

---

## Assistant

Now let me look at the Editor panel and where Cmd+S is handled:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/src/**/*.rs"}`

---

## Assistant

Let me check the Tauri commands and where Cmd+S is handled:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

Now let me search for where Cmd+S is actually handled:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"Cmd\\+S|cmd\\+s|save|keybinding|KeyboardEvent","glob":"crates/app/src/**/*.tsx","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"saveNote|isDirty","glob":"crates/app/src/**/*.tsx","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

Now let me check the API bridge to see how updateNote is called and look at auto-save related code:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/api/**/*.ts"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"debounce|auto.*save|autosave|interval|timeout","glob":"crates/app/src/**/*.ts","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts","offset":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts"}`

---

## Assistant

Let me check the StatusBar to see how dirty state is displayed and look for any additional save-related logic:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/StatusBar/StatusBar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx","limit":150}`

---

## Assistant

Perfect! Now let me check the undoStore and any related tests to understand the complete picture:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts","limit":150}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"savingInProgress","glob":"crates/app/src/**/*.tsx","output_mode":"files_with_matches"}`

---

## Assistant

Let me check for any CSS or visual indicators related to saving:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"dirty-dot|dirty-indicator|unsaved","glob":"crates/app/src/**/*.css","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*.test.ts\" | grep -i editor"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.test.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.dirty-dot|\\.dirty-indicator","glob":"crates/app/src/**/*.css","output_mode":"content","context":3}`

---

## Assistant

Now let me get a comprehensive view of the App.css file to see all save-related styling:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"dirty\\|unsaved\\|saving\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":660,"limit":20}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":785,"limit":10}`

---

## Assistant

Perfect! Now let me create a comprehensive summary document by reading a few more key files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs","limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts","limit":50}`

---

## Assistant

Excellent! Now I have a comprehensive understanding of the save flow. Let me compile my findings:

## BrainMap Desktop App Save Flow - Comprehensive Exploration Report

### 1. Save Flow Overview

**Entry Point: Cmd+S Keyboard Handler** (`crates/app/src/App.tsx`, lines 76-79)
- Global keyboard listener in `App.tsx` detects `Cmd+S` (Cmd or Ctrl + S key)
- Calls `useEditorStore.getState().saveNote()` directly (no debounce, immediate execution)

**Save Function**: `editorStore.saveNote()` (`crates/app/src/stores/editorStore.ts`, lines 78-137)
- Located in the **editorStore** Zustand store
- **Preconditions**:
  - Requires `activeNote` to exist
  - Requires `isDirty === true` (unsaved changes flag)
  - Early returns if body and frontmatter are both `null`
  - **Title validation**: Blocks saves if title is empty/whitespace-only
- **Parameters captured for concurrent edit detection**:
  - `savingBody` snapshot of `editedBody`
  - `savingFrontmatter` snapshot of `editedFrontmatter`
- **API Call**: Calls `api.updateNote(params)` with only changed fields:
  - Path (always included)
  - Body (if `editedBody !== null`)
  - Frontmatter fields (title, note_type, tags, status, source, summary, extra) — only those explicitly defined
- **Post-save**:
  - Re-reads the note via `api.readNote()` to get server-set timestamp
  - Syncs graph store if title or type changed (via `applyEvent` with "node-updated" event)
  - Clears only the fields that were saved, preserving concurrent edits
  - Sets `isDirty = false` if no concurrent edits occurred
  - Clears `conflictState` to "none"
  - Sets `savingInProgress = false`
- **Error Handling**: Logs error and sets `savingInProgress = false` on failure

### 2. Dirty State Tracking

**State Fields** (`editorStore.ts`):
- `isDirty: boolean` — set to `true` whenever content/frontmatter changes
- `savingInProgress: boolean` — set to `true` during API call, `false` after completion
- `editedBody: string | null` — stores uncommitted body text (null = no changes)
- `editedFrontmatter: Partial<EditableFrontmatter> | null` — stores uncommitted metadata

**Change Detection**:
- `updateContent(body)` (line 69-71): Sets `editedBody = body, isDirty = true`
- `updateFrontmatter(changes)` (line 73-76): Merges changes into `editedFrontmatter`, sets `isDirty = true`

**Visual Indicators**:
1. **Editor hero section** (EditorPanel.tsx, line 79): Blue dot (⏺) next to title when `isDirty === true`
2. **Status bar** (StatusBar.tsx, lines 31): Shows "(unsaved)" text next to file path when `isDirty === true`

**CSS Styling**:
- `.editor-dirty-dot`: Blue 6px circle, margin-left 6px, inline-block
- `.dirty-indicator`: Warning color text, 10px font, margin-left 4px

### 3. Auto-Save Mechanism

**No Auto-Save Currently Implemented**
- Grep search for "debounce", "autosave", "interval", "timeout" found no results
- Save is **manual only** via Cmd+S
- No timed save, no debounced save on input, no periodic save interval

### 4. API Bridge Pattern

**TauriBridge** (`crates/app/src/api/tauri.ts`):
- `updateNote(params)` (lines 52-64): Calls Tauri `invoke<void>("update_node", { params })`
- Maps to Tauri command `update_node` (commands.rs, lines 58-65)

**Tauri Command Handler** (`commands.rs` lines 58-65):
- Registers expected write path: `state.register_expected_write(abs_path)`
- Calls handler: `handlers::handle_update_note(ws, params)`
- Delegates to Rust core: `ws.update_note()` with all fields

**Handler** (`handlers.rs`, lines 82-107):
- Parses status enum
- Converts extra JSON to YAML
- Calls core's `update_note()` method
- Returns void

### 5. Settings & Preferences System

**Storage**: `localStorage` via Zustand store (`uiStore.ts`)
- Key: `"brainmap:uiPrefs"`
- Key: `"brainmap:panelSizes"`

**PersistedPrefs Interface** (`uiStore.ts`, lines 47-54):
- `theme?: "light" | "dark" | "system"`
- `uiFontFamily?: string`
- `uiFontSize?: number`
- `editorFontFamily?: string`
- `editorFontSize?: number`
- `uiZoom?: number`

**Load on Init** (`uiStore.ts`, lines 159-172):
- `loadStoredPrefs()` reads from localStorage
- `loadStoredSizes()` reads panel sizes separately
- Fallback to defaults if parsing fails

**Save on Change** (`uiStore.ts`, multiple locations):
- Every setter method calls `savePrefs(prefs)` after updating state
- `savePrefs()` calls `localStorage.setItem("brainmap:uiPrefs", JSON.stringify(prefs))`
- Examples: `setTheme`, `setUIFontFamily`, `setUIFontSize`, `setEditorFontFamily`, `setEditorFontSize`, `zoomIn`, `zoomOut`, `resetZoom`

**SettingsModal** (`components/Settings/SettingsModal.tsx`):
- Opens via Cmd+, or gear icon (⚙) in StatusBar
- Organized in sections:
  - **Appearance**: Theme selector (system/light/dark)
  - **Editor Font**: Family (select with custom input) + Size (range 10-28px)
  - **Interface Font**: Family (select with custom input) + Size (range 10-20px)
  - Reset button to restore font defaults
- All changes persist to localStorage immediately on selection

### 6. Conflict Resolution

**External File Change Detection** (`editorStore.ts`, lines 139-156):
- Triggered by file watcher or external events
- If `isDirty === true`: Shows conflict banner, sets `conflictState = "external-change"`
- If `isDirty === false`: Auto-reloads the note silently
- Suppresses detection during own save operations via `savingInProgress` check

**Banner UI** (EditorPanel.tsx, lines 104-110):
- Shows: "File changed externally. [Keep Mine] [Accept Theirs]"
- Keep Mine: Dismisses banner, preserves user's edits
- Accept Theirs: Discards edits, reloads file from disk

### 7. Concurrent Edit Handling

**Mechanism** (`editorStore.ts`, lines 86-130):
- Snapshots editing state before save: `savingBody`, `savingFrontmatter`
- After save, compares current state with snapshots
- Only clears fields that match the saved snapshot (line 122-123)
- Preserves any edits made during the save operation
- Example: User edits body → saves → user edits frontmatter during save → both are preserved

### 8. Editor Integration

**MarkdownEditor** (`components/Editor/MarkdownEditor.tsx`):
- CodeMirror 6 editor instance
- `onChange` callback calls `useEditorStore.getState().updateContent(body)`
- Syncs external content changes without recreating editor (lines 124-134)
- Patches CodeMirror scale detection for CSS zoom support

**EditorPanel** (`components/Editor/EditorPanel.tsx`):
- Renders title with dirty indicator dot (line 79)
- Displays both edit/preview views simultaneously (CSS opacity toggle, lines 114-124)
- Both preserve CodeMirror state during switching

### 9. Test Coverage

**editorStore.test.ts** (28 unit tests):
- Tests `updateFrontmatter`, `updateContent` set `isDirty = true`
- Tests save sends both body and frontmatter
- Tests concurrent edit preservation
- Tests external change detection
- Tests conflict resolution
- Tests early returns (no active note, not dirty, empty title)

### 10. File Paths Summary

**Key Implementation Files**:
- `/crates/app/src/stores/editorStore.ts` — Save logic, dirty state, conflict handling
- `/crates/app/src/stores/uiStore.ts` — Settings, preferences, localStorage persistence
- `/crates/app/src/App.tsx` — Cmd+S keyboard handler (line 76-79)
- `/crates/app/src/api/tauri.ts` — API bridge to Tauri command
- `/crates/app/src-tauri/src/commands.rs` — Tauri command registration
- `/crates/app/src-tauri/src/handlers.rs` — Tauri command handler
- `/crates/app/src/components/Editor/EditorPanel.tsx` — Dirty indicator UI
- `/crates/app/src/components/StatusBar/StatusBar.tsx` — Dirty indicator in status bar
- `/crates/app/src/components/Settings/SettingsModal.tsx` — Settings UI
- `/crates/app/src/App.css` — Styling for dirty indicators

**Test Files**:
- `/crates/app/src/stores/editorStore.test.ts`
- `/crates/app/src/stores/uiStore.test.ts`

This completes the thorough exploration of the BrainMap desktop app's save flow, dirty state tracking, and settings system!

---

