# 2026-03-11 — Subagent Transcript: Plan

**Date:** 2026-03-11 19:17:53
**Agent:** Plan
**Agent ID:** a46d5bed458cfea92
**Parent Session:** cac98a5e-bb31-4585-8135-4876e33d5c71

---

## User

Design an implementation plan for making the frontmatter metadata editable in a BrainMap desktop app (Tauri v2 + React + Zustand).

## Current State

**FrontmatterForm.tsx** is a read-only collapsible panel showing: Title, Type, Tags, Status, Source. All fields use `<input readOnly />`.

**Missing fields** not displayed at all: `summary`, `created`, `modified`, `extra` (type-specific fields like affiliation, field, era for person notes), and `links` (which are shown separately in RelatedNotesFooter).

**Backend is ready**: `updateNote` API already supports partial updates (all fields optional except path). `createLink`/`deleteLink` APIs exist. The editorStore already has `saveNote()` wired for body-only updates.

## Data Model Fields
Standard frontmatter: id (UUID, read-only), title, note_type, tags[], status (draft|review|final|archived), created (date, read-only), modified (date, auto-set), source?, summary?, links[], extra (HashMap)

10 note types: concept, book-note, question, reference, index, argument, evidence, experiment, person, project
15 edge types: contains, part-of, causes, supports, contradicts, extends, depends-on, exemplifies, precedes, leads-to, evolved-from, related-to, authored-by, sourced-from, mentioned-in

## What the user wants
1. Make the frontmatter metadata editable (not just displayed)
2. Show ALL related fields (currently missing: summary, created, modified, extra fields)

## Key Constraints
- The app uses Zustand stores, specifically `editorStore.ts`
- Save uses `api.updateNote()` which takes partial params
- CSS uses `.frontmatter-form`, `.frontmatter-fields` classes with CSS variables for theming
- The form is inside EditorPanel, which has Edit/Preview toggle
- Links are managed separately in RelatedNotesFooter
- `extra` fields are arbitrary key-value (type-specific)
- The existing dirty state tracking is body-only (`isDirty`, `editedBody`)

## Design Considerations
1. **UX Pattern**: Should this be inline-editing (click to edit) or always-editable inputs? Consider Obsidian's "Properties" approach — fields are always visible and editable.
2. **Dirty state**: Currently only body changes are tracked. Frontmatter changes need their own dirty tracking or integration into the existing save flow.
3. **Field types**: Title/Source/Summary = text inputs. Type = dropdown (10 options). Status = dropdown (4 options + null). Tags = tag input (add/remove individual tags). Extra = key-value pairs. Created/Modified = read-only dates.
4. **Save trigger**: Should match the body save (Cmd+S or auto-save).
5. **Validation**: Type must be one of 10 known types (or custom). Status must be valid enum.
6. **The metadata section should default to expanded** (currently collapsed) since it's now the primary editing surface for frontmatter.

Please provide a detailed implementation plan with specific file changes, component structure, and state management approach. Keep it practical and Obsidian-inspired.

---

## Assistant



I'll explore the codebase to understand the current implementation before designing the plan.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/src/**/*.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.{ts,tsx}"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts"}`

---

## Assistant

Now let me look at the CSS and the mock bridge to understand the full picture.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.css"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts"}`

---

## Assistant

Let me check the CSS for frontmatter styles and the RelatedNotesFooter for reference.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.frontmatter","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":3}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CreateNoteDialog.tsx"}`

---

## Assistant

Let me also check the workspace store for noteTypes and the full CSS for relevant styles.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/workspaceStore.ts"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.frontmatter|\\.section-toggle|\\.editor-panel|tag-input|tag-pill","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":2}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":236,"limit":30}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

Now let me check the Rust handlers to understand how `update_node` works on the backend.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

Now I have a thorough understanding of the codebase. Let me check one more thing -- the DTO to understand UpdateNoteParams.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"UpdateNoteParams","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs","output_mode":"content","-C":10}`

---

## Assistant

I now have complete understanding of the codebase. Here is the implementation plan.

---

## Implementation Plan: Editable Frontmatter Metadata

### Overview

Transform `FrontmatterForm.tsx` from a read-only collapsed panel into an always-visible, always-editable Obsidian-style "Properties" section. Extend the `editorStore` to track frontmatter dirty state alongside body dirty state, and unify them into a single save flow via `Cmd+S`.

### Architecture Decisions

**1. State management approach: Extend editorStore with `editedFrontmatter`**

The editorStore currently tracks `editedBody` separately from `activeNote`. The same pattern applies to frontmatter: add an `editedFrontmatter` partial object that accumulates field-level changes. On save, merge both `editedBody` and `editedFrontmatter` into a single `api.updateNote()` call. This avoids two separate API calls and keeps the save atomic.

The `isDirty` flag becomes `true` when either body or frontmatter has been edited. A new computed helper `isFrontmatterDirty` can be derived but is not strictly needed in the store -- `isDirty` covers both.

**2. UX pattern: Always-editable fields (Obsidian Properties style)**

No click-to-edit toggle. When the panel is expanded (which it will be by default), all fields are immediately editable. This matches Obsidian's approach and is simpler to implement than inline-edit toggling.

**3. Component decomposition: Specialized sub-components inside FrontmatterForm**

Rather than one giant form, create small focused sub-components for the complex field types (TagInput, ExtraFieldsEditor). Keep the simple fields (text inputs, dropdowns) inline in FrontmatterForm.

### Step-by-Step Implementation

#### Step 1: Extend editorStore with frontmatter editing state

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts`**

Add to `EditorState` interface:
- `editedFrontmatter: Partial<EditableFrontmatter> | null` -- where `EditableFrontmatter` is `{ title?: string; note_type?: string; tags?: string[]; status?: string | null; source?: string | null; summary?: string | null; extra?: Record<string, unknown> }`
- `updateFrontmatter: (changes: Partial<EditableFrontmatter>) => void` -- merges into `editedFrontmatter` and sets `isDirty = true`

Modify `saveNote`:
- Build the `api.updateNote()` params from both `editedBody` and `editedFrontmatter`
- After save, update `activeNote` with the merged values (title, type, tags, etc.)
- Reset both `editedBody` and `editedFrontmatter` to `null`

Modify `openNote`:
- Reset `editedFrontmatter` to `null` (already resets `editedBody`)

Modify `clear`:
- Reset `editedFrontmatter` to `null`

Modify `resolveConflict("accept-theirs")`:
- Reset `editedFrontmatter` to `null`

Define a new type (can be in the same file or in `api/types.ts`):
```ts
export interface EditableFrontmatter {
  title: string;
  note_type: string;
  tags: string[];
  status: string | null;
  source: string | null;
  summary: string | null;
  extra: Record<string, unknown>;
}
```

The `updateFrontmatter` action:
```ts
updateFrontmatter: (changes) => {
  const current = get().editedFrontmatter ?? {};
  set({ editedFrontmatter: { ...current, ...changes }, isDirty: true });
},
```

The updated `saveNote`:
```ts
saveNote: async () => {
  const { activeNote, editedBody, editedFrontmatter, isDirty } = get();
  if (!activeNote || !isDirty) return;
  if (editedBody === null && editedFrontmatter === null) return;

  const params: Record<string, unknown> = { path: activeNote.path };
  if (editedBody !== null) params.body = editedBody;
  if (editedFrontmatter) Object.assign(params, editedFrontmatter);

  const api = await getAPI();
  await api.updateNote(params as any);

  // Merge changes into activeNote
  const updated = { ...activeNote };
  if (editedBody !== null) updated.body = editedBody;
  if (editedFrontmatter) {
    if (editedFrontmatter.title !== undefined) updated.title = editedFrontmatter.title;
    if (editedFrontmatter.note_type !== undefined) updated.note_type = editedFrontmatter.note_type;
    if (editedFrontmatter.tags !== undefined) updated.tags = editedFrontmatter.tags;
    if (editedFrontmatter.status !== undefined) updated.status = editedFrontmatter.status;
    if (editedFrontmatter.source !== undefined) updated.source = editedFrontmatter.source;
    if (editedFrontmatter.summary !== undefined) updated.summary = editedFrontmatter.summary;
    if (editedFrontmatter.extra !== undefined) updated.extra = { ...updated.extra, ...editedFrontmatter.extra };
    updated.modified = new Date().toISOString().slice(0, 10);
  }

  set({ activeNote: updated, isDirty: false, editedBody: null, editedFrontmatter: null, conflictState: "none" });
},
```

#### Step 2: Create TagInput sub-component

**New file: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TagInput.tsx`**

A small component that:
- Shows each tag as a pill with an X button to remove
- Has a text input at the end for adding new tags
- On Enter or comma in the input, adds the trimmed value as a new tag (if not duplicate)
- On Backspace in an empty input, removes the last tag
- Calls `onChange(newTags: string[])` on any change

Props: `{ tags: string[]; onChange: (tags: string[]) => void }`

CSS classes: `.tag-input-wrapper`, `.tag-pill`, `.tag-pill-remove`, `.tag-input-field` -- all added to `App.css`.

#### Step 3: Create ExtraFieldsEditor sub-component

**New file: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ExtraFieldsEditor.tsx`**

A key-value editor for the `extra` HashMap. Renders each key-value pair as a row with:
- A read-only key label (keys come from the existing data)
- An editable text input for the value (stringified)
- A remove button (X)
- An "Add field" button at the bottom that shows a key input + value input + confirm button

Props: `{ extra: Record<string, unknown>; onChange: (extra: Record<string, unknown>) => void }`

For the initial version, values are treated as strings. If the existing value is not a string, it is JSON-stringified for display and parsed back on save.

CSS classes: `.extra-fields-editor`, `.extra-field-row`, `.extra-field-key`, `.extra-field-value`, `.extra-field-add` -- added to `App.css`.

#### Step 4: Rewrite FrontmatterForm as editable

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx`**

Major changes:
- Default `expanded` to `true` instead of `false`
- Import `useEditorStore` and `useWorkspaceStore`
- Read `editedFrontmatter` from store; compute effective values by merging `editedFrontmatter` over `note` props
- Call `updateFrontmatter()` on field changes
- Replace all `readOnly` inputs with editable inputs/selects

Field layout (top to bottom):

| Field | Input Type | Notes |
|-------|-----------|-------|
| Title | `<input type="text">` | Required, cannot be empty |
| Type | `<select>` | Options from `useWorkspaceStore.noteTypes` |
| Status | `<select>` | Options: `""` (none), `"draft"`, `"review"`, `"final"`, `"archived"` |
| Tags | `<TagInput>` | Custom component from Step 2 |
| Source | `<input type="text">` | Optional, show always (not conditionally) |
| Summary | `<textarea>` | 2-3 rows, resizable |
| Created | `<input readOnly>` | Display-only, formatted date |
| Modified | `<input readOnly>` | Display-only, formatted date |
| Extra | `<ExtraFieldsEditor>` | Key-value pairs from Step 3 |

Each field change calls `updateFrontmatter({ fieldName: newValue })`.

The component reads the "effective" value for each field:
```ts
const fm = useEditorStore((s) => s.editedFrontmatter);
const effectiveTitle = fm?.title ?? note.title;
const effectiveType = fm?.note_type ?? note.note_type;
// etc.
```

#### Step 5: Update EditorPanel header to reflect edited title

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx`**

The header bar shows `activeNote.title`. After this change, it should show the effective title (edited or original):
```ts
const editedFm = useEditorStore((s) => s.editedFrontmatter);
const displayTitle = editedFm?.title ?? activeNote.title;
```

Also, show a dirty indicator (small dot or asterisk) next to the title when `isDirty` is true, matching standard editor conventions.

#### Step 6: Add CSS for new components

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`**

Add styles for:

**Tag input:**
- `.tag-input-wrapper` -- flex row, wrapping, with a border matching `.frontmatter-form input`
- `.tag-pill` -- small rounded pill, background `var(--bg-tertiary)`, font-size 12px, padding 2px 8px, display inline-flex with gap
- `.tag-pill-remove` -- tiny X button inside pill, subtle hover color
- `.tag-input-field` -- border: none, background: transparent, flex-grow, min-width 60px

**Extra fields:**
- `.extra-fields-editor` -- flex column, gap 4px
- `.extra-field-row` -- flex row, gap 4px, items center
- `.extra-field-key` -- min-width 80px, font-weight 500, color `var(--text-secondary)`
- `.extra-field-value` -- flex 1, same styling as `.frontmatter-form input`

**Summary textarea:**
- `.frontmatter-form textarea` -- same border/bg/color as input, resize vertical, min-height 48px

**Read-only date fields:**
- `.frontmatter-form input[readonly]` -- opacity 0.6, cursor default (visual cue that they are not editable)

#### Step 7: Update graphStore for title/type changes

**File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts`**

After a save that changes title or note_type, the graph store's `nodes` Map needs updating so the graph view reflects the new title/type. The `node-updated` workspace event already handles this if the Tauri watcher fires, but for the MockBridge path (and for immediate local feedback), add an explicit update.

In `editorStore.saveNote()`, after a successful save that included frontmatter changes to title or note_type, call:
```ts
useGraphStore.getState().updateNodeMeta(activeNote.path, updated.title, updated.note_type);
```

This requires adding an `updateNodeMeta` action to `graphStore` if one does not already exist. Check graphStore for existing update patterns -- the `createNote` action already exists, so `updateNodeMeta` follows the same pattern: find the node in the `nodes` Map, update its title/note_type.

#### Step 8: Validation

Add lightweight validation in `FrontmatterForm`:
- Title cannot be empty -- show a red border (reuse the `inputErrorStyle` pattern from CreateNoteDialog) and prevent save (or let the backend reject it)
- Type must be from the known list -- enforced by `<select>`, no extra validation needed
- Status must be valid -- enforced by `<select>`
- Tags -- trimmed, no empty strings
- For simplicity, validation is visual only (red border, inline error text). The save still goes through; the backend will reject truly invalid data

#### Step 9: Write tests

**New file: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.test.ts`**

Test cases for the editorStore changes:
1. `updateFrontmatter` sets `isDirty` and accumulates changes
2. `updateFrontmatter` merges with existing `editedFrontmatter`
3. `saveNote` sends both body and frontmatter changes in one call
4. `saveNote` sends only frontmatter changes when body is unchanged
5. `saveNote` sends only body changes when frontmatter is unchanged
6. `saveNote` updates `activeNote` with merged frontmatter values
7. `saveNote` resets `editedFrontmatter` to null after save
8. `openNote` resets `editedFrontmatter`
9. `resolveConflict("accept-theirs")` resets `editedFrontmatter`
10. `clear` resets `editedFrontmatter`

These tests mock `getAPI()` and verify the params passed to `api.updateNote()`.

**New file: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TagInput.test.tsx`**

Test cases:
1. Renders existing tags as pills
2. Typing + Enter adds a new tag
3. Typing + comma adds a new tag
4. Backspace on empty input removes last tag
5. Clicking X on a pill removes that tag
6. Duplicate tags are not added
7. Empty/whitespace-only tags are not added

#### Step 10: Update documentation

- **CLAUDE.md**: Update "Current Status" to mention editable frontmatter
- **CLAUDE.md**: Update test counts
- **MEMORY.md**: Add entry for editable frontmatter completion

### Dependency Order

```
Step 1 (editorStore) -- no dependencies, foundation for everything
Step 2 (TagInput) -- standalone component, no store dependency
Step 3 (ExtraFieldsEditor) -- standalone component
Step 4 (FrontmatterForm rewrite) -- depends on Steps 1, 2, 3
Step 5 (EditorPanel title) -- depends on Step 1
Step 6 (CSS) -- can be done alongside Steps 2-4
Step 7 (graphStore sync) -- depends on Step 1
Step 8 (Validation) -- done within Step 4
Step 9 (Tests) -- depends on Steps 1, 2
Step 10 (Docs) -- last
```

Steps 1, 2, 3, and 6 can be done in parallel. Steps 4 and 5 follow. Step 7 can be done alongside 4/5. Step 9 can start as soon as Step 1 is done.

### Potential Challenges

1. **Title sync across UI**: Changing the title in frontmatter should reflect in the editor header bar, the file tree (if it shows titles), and the graph node label. The editor header is handled in Step 5. The graph is handled in Step 7 via events. The file tree uses `NodeDto.title` from the graph store, so Step 7 covers it transitively.

2. **Cmd+S interception**: The existing `Cmd+S` handler in `MarkdownEditor.tsx` (CodeMirror keybinding) calls `editorStore.saveNote()`. Since we are extending `saveNote()` rather than creating a new method, this works without changes to the keyboard shortcut handler. However, if the user is focused on a frontmatter input (not CodeMirror), `Cmd+S` might not be caught. Need to add a global `Cmd+S` handler in `EditorPanel` or `AppLayout` that calls `saveNote()` regardless of focus.

3. **Extra field value types**: The `extra` HashMap can contain strings, numbers, arrays, or nested objects. The initial implementation treats everything as string (JSON-stringified for display). This is acceptable for v1 but should be noted as a future enhancement area.

4. **Status null vs empty string**: The `status` field is `string | null`. The `<select>` should map the empty option to `null` (not empty string). The `updateFrontmatter` call should pass `null` for the empty option.

### Critical Files for Implementation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts` - Core state changes: add editedFrontmatter, extend saveNote to merge body+metadata
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx` - Primary UI rewrite from read-only to editable Properties panel
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx` - Wire up edited title display and dirty indicator
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` - New styles for tag pills, extra fields editor, textarea, read-only date styling
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts` - Add EditableFrontmatter type (or place in editorStore)

---

