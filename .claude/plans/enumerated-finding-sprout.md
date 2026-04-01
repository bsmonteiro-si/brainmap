# Plan: Create & Link in LinksEditor

## Context

When editing a note's metadata in the Links section, the user can only link to **existing** notes. If the target note doesn't exist yet, they must leave the editor, create the note separately, come back, and then add the link. This breaks the workflow. The user wants a "Create & Link" option that appears when the typed target doesn't match any existing note, allowing them to create a new note and link to it in one flow — without navigating away from the current note.

## Approach

Add a "Create & Link" button in LinksEditor that replaces the "+" button when the typed text doesn't match any existing node. It opens CreateNoteDialog with the title pre-filled. After creation, CreateNoteDialog reads coordination state from UIStore to automatically create the link and refresh the active note — the user stays on the current note.

**Key design decisions (from review):**
- No function callbacks in Zustand — use serializable coordination state (`createNoteMode` + `createAndLinkSource`) instead
- Mutually exclusive buttons — show either "+" (target exists) or "Create & Link" (target doesn't exist), never both
- Overloaded `openCreateNoteDialog` signature accepts `string | opts` to avoid touching existing call sites

## Changes

### 1. UIStore — add coordination state

**File:** `crates/app/src/stores/uiStore.ts`

Add three new fields to `UIState`:
- `createNoteInitialTitle: string | null` — pre-fills the title field in CreateNoteDialog
- `createNoteMode: "default" | "create-and-link"` — signals what CreateNoteDialog should do after creation
- `createAndLinkSource: { notePath: string; rel: string } | null` — the source note and edge type for auto-linking

All serializable, no functions in state.

Update `openCreateNoteDialog` signature — overloaded to accept `string | opts`:
```ts
openCreateNoteDialog: (pathOrOpts?: string | {
  initialPath?: string;
  initialTitle?: string;
  mode?: "default" | "create-and-link";
  linkSource?: { notePath: string; rel: string };
}) => void;
```

When called with a string, behavior is unchanged (backward compat — FileTreePanel calls untouched). When called with an object, sets all the new fields.

Update `closeCreateNoteDialog` to reset all fields to defaults.

### 2. CreateNoteDialog — handle create-and-link mode

**File:** `crates/app/src/components/Editor/CreateNoteDialog.tsx`

- Read `createNoteInitialTitle`, `createNoteMode`, `createAndLinkSource` from UIStore
- If `initialTitle` is provided, pre-populate the title field and set `titleManuallyEdited = true`
- In `handleSubmit`, after creating the note and doing the graphStore optimistic update:
  - If `createNoteMode === "create-and-link"` and `createAndLinkSource` is present:
    - Call `api.createLink(createAndLinkSource.notePath, createdPath, createAndLinkSource.rel)`
    - Apply `edge-created` event to graphStore
    - Call `refreshActiveNote()` to reload the source note's links
    - Do NOT call `openNote(createdPath)` — stay on current note
  - Otherwise (default mode): call `openNote(createdPath)` as today
  - Close dialog in both cases
- Update heading to "Create & Link" when mode is `create-and-link`, and submit button text accordingly
- Error handling: if `createLink` fails after note creation, show error in the dialog (note was created but link wasn't — user can link manually later)

### 3. LinksEditor — add "Create & Link" button

**File:** `crates/app/src/components/Editor/LinksEditor.tsx`

- Import `useUIStore`
- Compute `showCreateAndLink`: true when `newTarget.trim()` is non-empty AND `resolvedTarget` is null AND not busy
- Add `handleCreateAndLink` function:
  - Calls `openCreateNoteDialog({ initialTitle: newTarget.trim(), mode: "create-and-link", linkSource: { notePath, rel: newRel } })`
  - Clears `newTarget`
- In the JSX add-row: **mutually exclusive buttons** — show "Create & Link" button when `showCreateAndLink` is true, show "+" button otherwise. Same position, no layout changes needed.

### 4. CSS — style the Create & Link button

**File:** `crates/app/src/App.css`

Add `.link-create-btn` styles — accent background, white text, compact size. Same position as the "+" button since they're mutually exclusive.

### 5. Tests

**`crates/app/src/stores/uiStore.test.ts`:**
- `openCreateNoteDialog({ initialTitle, mode, linkSource })` sets all new fields
- `openCreateNoteDialog("path/")` still works (backward compat)
- `closeCreateNoteDialog` clears all new fields
- No-arg call still works

**`crates/app/src/components/Editor/LinksEditor.test.tsx`:**
- "Create & Link" button visible when target doesn't match any node and input non-empty
- "+" button visible (not "Create & Link") when target matches an existing node
- Neither button active when input is empty
- Clicking "Create & Link" calls `openCreateNoteDialog` with correct mode, title, and linkSource

**`crates/app/src/components/Editor/CreateNoteDialog.test.tsx`** (new or extend existing):
- When `createNoteMode === "create-and-link"`: after submit, `createLink` is called, `openNote` is NOT called, `refreshActiveNote` IS called
- When `createNoteMode === "default"`: after submit, `openNote` IS called, `createLink` is NOT called
- Cancel in create-and-link mode: no link created, fields cleared
- Partial failure: `createLink` throws after successful `createNote` — error displayed

### 6. Documentation

Update `CLAUDE.md` current status to mention Create & Link in LinksEditor.

## Critical Files
- `crates/app/src/stores/uiStore.ts`
- `crates/app/src/components/Editor/CreateNoteDialog.tsx`
- `crates/app/src/components/Editor/LinksEditor.tsx`
- `crates/app/src/App.css`
- `crates/app/src/stores/uiStore.test.ts`
- `crates/app/src/components/Editor/LinksEditor.test.tsx`

## Edge Cases
- **User cancels dialog:** `closeCreateNoteDialog` clears all coordination state. No link created.
- **createLink fails after note creation:** Note exists but link doesn't. Error shown in dialog. User can manually link later.
- **Dialog is modal:** Fixed overlay prevents opening a second dialog instance — no risk of clobbering coordination state.
- **Partial typing:** Mutually exclusive buttons mean "Create & Link" shows whenever input doesn't exactly match a node title. This is acceptable — similar to "Create X" options in other apps. The datalist dropdown still provides autocomplete for partial matches.

## Verification
1. `cd crates/app && npx vitest run` — all existing + new tests pass
2. `cargo test` — Rust tests unaffected (no backend changes)
3. Manual test in Tauri app:
   - Open a note → Edit Metadata → Links
   - Type non-existent title → "Create & Link" button appears (replacing "+")
   - Click it → CreateNoteDialog opens with title pre-filled, heading says "Create & Link"
   - Fill path + type, submit → dialog closes, link appears in Links section, user stays on original note
   - Type an existing note title → "+" button appears (replacing "Create & Link")
   - Verify datalist autocomplete still works for partial matches
