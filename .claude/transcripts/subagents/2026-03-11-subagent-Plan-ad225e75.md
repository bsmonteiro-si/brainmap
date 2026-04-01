# 2026-03-11 — Subagent Transcript: Plan

**Date:** 2026-03-11 19:29:44
**Agent:** Plan
**Agent ID:** ad225e75c4a42a4ed
**Parent Session:** ab521ffa-ea04-401c-b5d0-261820dca943

---

## User

Design an implementation plan for adding native file/folder browse dialogs to the BrainMap desktop app.

## Context

BrainMap is a Tauri v2 + React desktop app. The `@tauri-apps/plugin-dialog` (v2.2.0) is already installed in package.json, `tauri-plugin-dialog` v2 is in Cargo.toml, the plugin is initialized in lib.rs, and capabilities are configured with `dialog:allow-open` and `dialog:allow-save`. It's just not imported or used in any React code yet.

## Current UI

### SegmentPicker (`crates/app/src/components/Layout/SegmentPicker.tsx`)
- Home view: grid of recently opened segments (workspaces)
- "Create" view: form with Name and Folder Path text inputs
- User manually types an absolute folder path like `/Users/me/notes`
- Opening calls `openWorkspace(segment.path)` via workspace store

### CreateNoteDialog (`crates/app/src/components/Editor/CreateNoteDialog.tsx`)
- Modal with a Path input field (relative path like `Concepts/My-Note.md`)
- Auto-populates title from filename
- Path is relative to workspace root

### FileTreePanel (`crates/app/src/components/Layout/FileTreePanel.tsx`)
- Toolbar with `+` (New Note) and `⊞` (New Folder) buttons
- Right-click context menu for "New Note Here"/"New Subfolder Here"
- Inline folder name input for folder creation
- Folder creation calls `api.createFolder(relativePath)` - relative paths only

## Requirements

The user wants "a file browse button with a view to the file system, like usual IDEs or text editors have" for:
1. Opening or creating a segment (workspace)
2. Opening/creating notes/folders

## Design Considerations

- For **segments**, a native folder picker makes perfect sense — users browse the filesystem to pick a workspace folder
- For **notes/folders within a workspace**, paths are relative to workspace root. Options:
  a. Use native dialog constrained to workspace root, then compute relative path
  b. Keep current inline approach (already IDE-like with FileTreePanel)
- The `open()` function from `@tauri-apps/plugin-dialog` can be called directly from React (no Tauri command wrapper needed)
- `open({ directory: true })` returns a folder path string
- `open({ directory: false, filters: [...] })` returns a file path string

## Questions to Answer
1. Where exactly should Browse buttons be placed?
2. For notes/folders, should we use native dialog or keep current inline approach?
3. Should there be an "Open Folder" quick action on the SegmentPicker home view?

Please provide a detailed implementation plan with specific component changes, the dialog API usage, and UI layout details.

---

## Assistant



I'll explore the codebase to understand the current state of the components mentioned and the dialog plugin setup.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/SegmentPicker.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CreateNoteDialog.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

Now let me check the dialog plugin setup and the app's package.json/Cargo.toml.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/capabilities/**/*","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/capabilities/default.json"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStore.ts"}`

---

## Assistant

Now let me check the CSS file for existing styles.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.css","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.sp-field|\\.sp-submit|\\.sp-form","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1542,"limit":50}`

---

## Assistant

Good. I now have a complete picture. Let me also quickly check if there's an "Open Folder" button on the home view already.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"sp-empty-cta|sp-brand","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-n":true,"-A":5}`

---

## Assistant

I have all the information needed to produce the plan. Here is the full implementation plan.

---

## Implementation Plan: Native File/Folder Browse Dialogs

### Answers to Design Questions

**1. Where should Browse buttons be placed?**

Three locations in the SegmentPicker:
- **Create view** -- a "Browse..." button next to the Folder Path input field
- **Home view (empty state)** -- the existing CTA becomes two buttons: "Open a segment to get started" (which goes to the create form) and a new "Open Folder..." button that launches the native dialog directly
- **Home view (with segments)** -- add an "Open Folder..." button alongside the existing "+ New segment" card

**2. For notes/folders within a workspace, native dialog or keep inline?**

Keep the current inline approach. The CreateNoteDialog and FileTreePanel operate on workspace-relative paths. Launching a native OS folder picker would be confusing here because (a) the user would see the full filesystem when they only care about paths relative to their workspace root, (b) the FileTreePanel already provides the IDE-like tree browsing experience the user expects, and (c) computing a relative path from an absolute dialog selection is error-prone when users could navigate outside the workspace. The existing UX is already the correct pattern for in-workspace file creation.

**3. Should there be an "Open Folder" quick action on the home view?**

Yes. This is the highest-value addition. It lets users skip the create form entirely: click "Open Folder...", pick a directory from the native dialog, and the app opens it immediately (auto-deriving the segment name from the folder basename). This mirrors VS Code's "Open Folder" flow.

---

### Step-by-step Implementation

#### Step 1: Create a shared dialog helper module

Create a new file `crates/app/src/utils/openFolderDialog.ts` (and `crates/app/src/utils/index.ts` barrel if one does not exist).

This module encapsulates the `@tauri-apps/plugin-dialog` import so it is easy to mock in tests:

```ts
import { open } from "@tauri-apps/plugin-dialog";

/**
 * Opens a native folder picker dialog.
 * Returns the selected absolute path, or null if cancelled.
 */
export async function pickFolder(): Promise<string | null> {
  const selected = await open({
    directory: true,
    multiple: false,
    title: "Choose a folder",
  });
  // open() returns string | string[] | null depending on options
  if (typeof selected === "string") return selected;
  if (Array.isArray(selected) && selected.length > 0) return selected[0];
  return null;
}
```

This keeps the dialog API call in one place. All three call sites (create form browse, empty-state CTA, segment-grid quick action) use this same function.

#### Step 2: Modify SegmentPicker -- Create View (Browse button)

In `crates/app/src/components/Layout/SegmentPicker.tsx`, in the "create" view:

- Import `pickFolder` from the new utility module.
- Add an `async handleBrowse()` function that calls `pickFolder()`, and if a path is returned, calls `handlePathChange(path)` to populate both the path field and auto-derive the name.
- Add a "Browse..." button immediately after the Folder Path input. Layout: wrap the input and button in a flex row container.

The markup change in the create view's folder-path field:

```tsx
<div className="sp-field">
  <label className="sp-field-label" htmlFor="seg-path">Folder path</label>
  <div className="sp-field-row">
    <input
      id="seg-path"
      className="sp-field-input"
      type="text"
      value={formPath}
      onChange={(e) => handlePathChange(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleCreateSubmit()}
      placeholder="/Users/me/notes"
    />
    <button
      className="sp-browse-btn"
      type="button"
      onClick={handleBrowse}
      disabled={openingId !== null}
    >
      Browse...
    </button>
  </div>
</div>
```

#### Step 3: Modify SegmentPicker -- Home View (Open Folder quick action)

Add a new `handleOpenFolder()` async function to SegmentPicker that:
1. Calls `pickFolder()`.
2. If a path is returned, derives a name from the folder basename (`path.split("/").filter(Boolean).pop()`).
3. Calls `addSegment(name, path)` then `handleOpenSegment(segment)` on the result.

**Empty state** (when `sortedSegments.length === 0`): Replace the single CTA button with two buttons in a flex column:
- "Open Folder..." -- calls `handleOpenFolder()` directly (primary action)
- "Create segment manually" -- goes to the create form as before (secondary action)

**With segments** (the grid): Add a second card-like button alongside the existing "+ New segment" button:
- Existing: `+ New segment` (navigates to create form)
- New: `Open Folder...` (calls `handleOpenFolder()` directly)

Both buttons use the existing `sp-new-card` class with minor style variation for the "Open Folder..." one.

#### Step 4: Add CSS styles

In `crates/app/src/App.css`, add:

- `.sp-field-row` -- a flex row with `gap: 8px` and `align-items: stretch` to hold the input + browse button side by side.
- `.sp-browse-btn` -- styled to match the existing form aesthetic: `padding: 10px 16px`, `font-size: 14px`, `background: var(--bg-secondary)`, `border: 1px solid var(--border-color)`, `border-radius: 6px`, `color: var(--text-primary)`, `cursor: pointer`, `white-space: nowrap`. On hover: `border-color: var(--accent)`.
- `.sp-actions-row` -- flex row for the empty-state double-button layout.

#### Step 5: Handle edge cases

- **User cancels the dialog**: `pickFolder()` returns `null`, do nothing (already handled by the null check).
- **Selected folder does not contain any .md files**: The `openWorkspace` call handles this gracefully -- it opens an empty workspace with zero notes. No special handling needed.
- **Duplicate path**: The `addSegment` function already handles idempotency by path. The `handleOpenFolder` logic handles the `created: false` case the same way `handleCreateSubmit` does today.
- **Dialog on non-Tauri environment (dev/test)**: The `@tauri-apps/plugin-dialog` import will throw at runtime if not in a Tauri webview. The `pickFolder` helper should catch this and return `null` (or the calling code wraps in try/catch). Since this is a desktop app, it will only ever run in Tauri, but a try/catch in `pickFolder` is defensive best practice.

#### Step 6: Update tests

- Add a unit test for `pickFolder` utility (mock `@tauri-apps/plugin-dialog`'s `open` function).
- The SegmentPicker component tests (if any exist) should verify the browse button renders and that clicking it calls the dialog. Since the component uses inline state and the dialog is async, the test would mock `pickFolder` to return a path and verify `formPath` is populated.

#### Step 7: Update documentation

- Update `CLAUDE.md` current status to mention native folder browse dialogs in SegmentPicker.
- No spec file changes needed since this is a UX enhancement within the existing desktop app feature set.

---

### What This Plan Does NOT Do (and Why)

- **No native dialog for CreateNoteDialog or FileTreePanel**: These operate on workspace-relative paths. The FileTreePanel already provides the IDE-like tree navigation. Adding a native OS dialog here would be disorienting (full filesystem when users only care about workspace-internal paths).
- **No "Save As" dialog**: Not requested and the current save model (auto-save to workspace) is correct for a knowledge base tool.
- **No new Tauri commands**: The `@tauri-apps/plugin-dialog` works entirely on the frontend via the JS plugin API. No Rust-side changes needed.
- **No new capabilities**: `dialog:allow-open` is already configured in `capabilities/default.json`.

---

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/SegmentPicker.tsx` - Primary component to modify: add Browse buttons to create form and home view, add handleOpenFolder/handleBrowse functions
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` - Add CSS classes for sp-field-row, sp-browse-btn, sp-actions-row layout
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/openFolderDialog.ts` - New file: shared pickFolder() helper wrapping @tauri-apps/plugin-dialog open()
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/segmentStore.ts` - Reference: addSegment idempotency and segment model (no changes needed, but callers depend on its API)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/capabilities/default.json` - Reference: already has dialog:allow-open permission (no changes needed)

---

