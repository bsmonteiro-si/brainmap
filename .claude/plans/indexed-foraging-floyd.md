# Plan: Add "Raw" View Mode to Editor

## Context

The editor currently has two view modes: **Edit** (CodeMirror body editor + FrontmatterForm) and **Preview** (rendered markdown). The user wants a third **Raw** option that shows the complete `.md` file content including YAML frontmatter — the file as it exists on disk. In Raw mode, the Edit Metadata panel is hidden. Switching back to Edit/Preview restores it.

## Design Decisions

1. **Read-only**: Raw mode uses a read-only CodeMirror. Editing raw YAML frontmatter could corrupt the data model; users edit frontmatter via the structured form.
2. **Reuse `readPlainFile`**: The existing `read_plain_file` Tauri command reads any file as raw UTF-8 — works on `.md` notes and returns full content including YAML frontmatter. No new Rust code needed.
3. **Fetch on switch**: Raw content is fetched each time the user switches to Raw mode, guaranteeing it reflects the on-disk state. Stored in a transient `rawContent` field (not persisted in tabs).
4. **Notes only**: Plain files and untitled tabs already show raw content — no Raw button for them.

## Steps

### Step 1: Widen `viewMode` type

**Files**: `editorStore.ts`, `tabStore.ts`

- Change `"edit" | "preview"` to `"edit" | "preview" | "raw"` in:
  - `EditorState.viewMode` (editorStore.ts:29)
  - `EditorState.setViewMode` signature (editorStore.ts:45)
  - `TabState.viewMode` (tabStore.ts:26)
  - `CLEAN_EDITOR_STATE.viewMode` (editorStore.ts:82) — default stays `"edit"`
  - `createFreshTab` (tabStore.ts:61) — default stays `"edit"`
  - `setViewMode` implementation (editorStore.ts:551-554)

### Step 2: Add `rawContent` state field

**File**: `editorStore.ts`

- Add `rawContent: string | null` to `EditorState` interface and initial state (default `null`).
- Add to `CLEAN_EDITOR_STATE`: `rawContent: null`.
- Add to `clear()`.

### Step 3: Update `setViewMode` to fetch raw content

**File**: `editorStore.ts`

- When switching to `"raw"` and `activeNote` exists:
  1. Set `viewMode: "raw"` and `rawContent: null` immediately (shows loading state).
  2. Fetch raw content via `api.readPlainFile(activeNote.path)`.
  3. On success: set `rawContent` to result body.
  4. On error: log error, fall back to `viewMode: "edit"`.
- When switching away from `"raw"`: set `rawContent: null`.
- The method signature stays `void` but does async work internally. The `rawContent === null && viewMode === "raw"` combination signals "loading" to the UI (EditorPanel shows a placeholder).

### Step 4: Handle raw mode on tab restore

**File**: `editorStore.ts`

- In `openNote` (existing tab path, ~line 131-160): after restoring `viewMode` from tab, if `viewMode === "raw"`, fetch raw content via `readPlainFile` (same async pattern as Step 3 — set rawContent:null first, then fetch).
- In `markExternalChange`: if `viewMode === "raw"`, re-fetch `rawContent` **in addition to** the existing `activeNote` reload (both on-disk views need updating).

### Step 5: Add `readOnly` prop to `MarkdownEditor`

**File**: `MarkdownEditor.tsx`

- Add `readOnly?: boolean` to Props.
- When `readOnly` is true:
  - Add `EditorState.readOnly.of(true)` and `EditorView.editable.of(false)` to extensions.
  - Exclude `history()`, `formattingKeymap`, and `updateListener` (editing-related extensions).
  - Keep `linkNavigation` — Cmd+Click navigation is still useful in read-only Raw view.
- Keep syntax highlighting and theme.

### Step 6: Update `EditorPanel.tsx` — notes path (lines 238-318)

- Add Raw button to view toggle (after Preview):
  ```tsx
  <button className={`editor-view-btn${viewMode === "raw" ? " editor-view-btn--active" : ""}`}
    onClick={() => setViewMode("raw")} type="button">Raw</button>
  ```
- Add `rawContent` selector from editorStore.
- Conditionally hide in raw mode:
  - Hero metadata (type pill, tags, status, source — lines 267-289): `{viewMode !== "raw" && (...)}`
  - `FrontmatterForm` (line 298): `{viewMode !== "raw" && <FrontmatterForm />}`
  - `RelatedNotesFooter` (line 315): `{viewMode !== "raw" && <RelatedNotesFooter />}`
  - `EditorToolbar` already hidden (guarded by `viewMode === "edit"`)
- Add third view layer for raw content:
  ```tsx
  <div className={`editor-view-layer${viewMode === "raw" ? " editor-view-layer--active" : ""}`}>
    {rawContent !== null ? (
      <MarkdownEditor key="raw" notePath={activeNote.path} content={rawContent}
        onChange={() => {}} readOnly={true} />
    ) : viewMode === "raw" ? (
      <div className="editor-placeholder">Loading raw content...</div>
    ) : null}
  </div>
  ```
- Keep title visible in all modes (just the `<h1>` with title text and dirty dot).

### Step 7: Tests

- **editorStore tests**: `setViewMode("raw")` populates rawContent; switching away clears it; rawContent is null in clean state; tab-switch round-trip (switch away from raw tab, switch back — verify rawContent re-fetched).
- **MarkdownEditor tests**: `readOnly={true}` creates non-editable editor (if feasible with JSDOM).
- **Update existing tests**: any assertion on `viewMode` type needs `"raw"` added.

### Step 8: Documentation

- Update `CLAUDE.md` current status to mention Raw view mode.

## Files to Modify

| File | Change |
|------|--------|
| `crates/app/src/stores/editorStore.ts` | Widen viewMode type, add rawContent, update setViewMode/openNote/markExternalChange/clear |
| `crates/app/src/stores/tabStore.ts` | Widen viewMode type in TabState and createFreshTab |
| `crates/app/src/components/Editor/EditorPanel.tsx` | Add Raw button, third view layer, conditionally hide metadata/form/footer |
| `crates/app/src/components/Editor/MarkdownEditor.tsx` | Add readOnly prop |

No Rust changes. No new API methods. No CSS changes (existing `.editor-view-layer` pattern handles 3 layers).

## Verification

1. Open a BrainMap note — see Edit/Preview/Raw toggle
2. Click Raw — see full file with `---` YAML frontmatter, no Edit Metadata panel, no formatting toolbar, no related notes footer
3. Click Edit — Edit Metadata panel and toolbar reappear
4. Click Preview — rendered markdown, Edit Metadata panel visible
5. Switch tabs while in Raw mode, switch back — Raw view re-fetches and displays correctly
6. Make edits in Edit mode, switch to Raw — Raw shows on-disk version (not unsaved edits)
7. Plain files and untitled tabs — no Raw button shown
8. Run `cd crates/app && npx vitest run` — all tests pass
