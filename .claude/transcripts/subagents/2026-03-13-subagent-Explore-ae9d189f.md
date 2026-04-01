# 2026-03-13 — Subagent Transcript: Explore

**Date:** 2026-03-13 16:25:20
**Agent:** Explore
**Agent ID:** ae9d189fbc115381b
**Parent Session:** 966e73ee-9a78-4015-a411-135de7bdb843

---

## User

I need to understand the full frontmatter editing flow in the BrainMap desktop app to design an undo/redo system for metadata fields.

Read these files completely:
1. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx` — the main form component
2. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TagInput.tsx` — tag editing component
3. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts` — where `updateFrontmatter` and `editedFrontmatter` live
4. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ExtraFieldsEditor.tsx`

For each, note:
- What fields are edited and how (onChange handlers)
- How `updateFrontmatter` is called (what shape of partial object)
- The `EditableFrontmatter` type definition
- How the current state is computed (edited vs activeNote fallback)

Also search for any existing undo/redo patterns in the frontend stores (not the file-operation undoStore, but any field-level undo pattern).

Report: all field names, their types, how each onChange works, and the EditableFrontmatter interface.

---

## Assistant

I'll read these files systematically to understand the frontmatter editing flow.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TagInput.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ExtraFieldsEditor.tsx"}`

---

## Assistant

Now let me search for any existing undo/redo patterns in the frontend stores to see if there's field-level undo already implemented.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"undo|redo|history|undoStore","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"undo|redo|history","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","glob":"**/*.ts*"}`

---

## Assistant

Let me read the existing undoStore to understand the pattern:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.test.ts"}`

---

## Assistant

Now let me check the NoteDetail type definition to understand the complete structure:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

Perfect. Now I have all the information I need. Let me compile a comprehensive report.

## Complete Frontmatter Editing Flow Analysis

### EditableFrontmatter Type Definition
Located at `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts` line 9:
```typescript
export type EditableFrontmatter = Pick<NoteDetail, 'title' | 'note_type' | 'tags' | 'status' | 'source' | 'summary' | 'extra'>;
```

**All editable fields in the frontmatter:**

| Field | Type | Notes |
|-------|------|-------|
| `title` | `string` | Required, no empty/whitespace validation |
| `note_type` | `string` | One of 10 fixed types or custom |
| `tags` | `string[]` | Array of lowercase tag strings |
| `status` | `string \| null` | One of: "", "draft", "review", "final", "archived" |
| `source` | `string \| null` | Free-text attribution |
| `summary` | `string \| null` | Free-text brief description |
| `extra` | `Record<string, unknown>` | Arbitrary key-value pairs, values can be JSON-parsed |

---

### Field-by-Field onChange Handlers

#### 1. **Title** (FrontmatterForm.tsx:54-59)
- **Current value:** Computed from `fm?.title ?? note.title`
- **onChange:** `updateFrontmatter({ title: e.target.value })`
- **Component:** `<input type="text">`
- **Validation:** Visual error class if `title.trim() === ""` (but does not block save)
- **Flow:** Direct string input → `updateFrontmatter` → shallow merge into `editedFrontmatter`

#### 2. **Note Type** (FrontmatterForm.tsx:63-73)
- **Current value:** Computed from `fm?.note_type ?? note.note_type`
- **onChange:** `updateFrontmatter({ note_type: e.target.value })`
- **Component:** `<select>` with 10 predefined options + fallback for unknown types
- **Flow:** Select dropdown → `updateFrontmatter` → triggers graph sync on save (title/type change detected at line 191 in editorStore)

#### 3. **Status** (FrontmatterForm.tsx:77-84)
- **Current value:** Computed with special handling: `fm?.status !== undefined ? (fm.status ?? "") : (note.status ?? "")`
- **onChange:** `updateFrontmatter({ status: e.target.value || null })`
- **Component:** `<select>` with 5 options: `["", "draft", "review", "final", "archived"]`
- **Flow:** Empty string `""` converted to `null` to preserve distinction between unset and explicitly empty

#### 4. **Tags** (FrontmatterForm.tsx:86-88 + TagInput.tsx)
- **Current value:** `fm?.tags ?? note.tags`
- **onChange:** `updateFrontmatter({ tags: t })`
- **Component:** `TagInput` subcomponent with:
  - Pill display of each tag with × remove button
  - Text input field with Enter/comma to add tags
  - Backspace on empty input to remove last tag
  - On blur: auto-add if input has content
  - Tag normalization: `.trim().toLowerCase()`
  - Duplicate prevention
- **Flow:** User adds/removes tags → `TagInput.onChange` → parent calls `updateFrontmatter({ tags: [...] })`

#### 5. **Source** (FrontmatterForm.tsx:91-97)
- **Current value:** Computed with special handling: `fm?.source !== undefined ? (fm.source ?? "") : (note.source ?? "")`
- **onChange:** `updateFrontmatter({ source: e.target.value || null })`
- **Component:** `<input type="text" placeholder="Source reference…">`
- **Flow:** Empty string converted to `null` (same pattern as status)

#### 6. **Summary** (FrontmatterForm.tsx:100-106)
- **Current value:** Computed with special handling: `fm?.summary !== undefined ? (fm.summary ?? "") : (note.summary ?? "")`
- **onChange:** `updateFrontmatter({ summary: e.target.value || null })`
- **Component:** `<textarea rows={3} placeholder="Brief summary…">`
- **Flow:** Empty string converted to `null`

#### 7. **Extra Fields** (FrontmatterForm.tsx:119-122 + ExtraFieldsEditor.tsx)
- **Current value:** `fm?.extra ?? note.extra`
- **onChange:** `updateFrontmatter({ extra: e })`
- **Component:** `ExtraFieldsEditor` subcomponent with:
  - Display existing fields as key-value rows (value displayed via `displayValue()`)
  - Edit existing values with JSON parse attempt (if original was non-string)
  - Remove field button
  - Add new field section with two inputs (key + value)
  - Key validation: no empty, no duplicates
  - **Field operations:**
    - `updateValue(key, value)`: Tries JSON.parse if original was non-string, falls back to string
    - `removeField(key)`: Creates shallow copy, deletes key, calls onChange
    - `addField()`: Creates shallow copy with new key-value, clears inputs
- **Flow:** User modifies fields → `ExtraFieldsEditor.onChange` → parent calls `updateFrontmatter({ extra: {...} })`

---

### updateFrontmatter Implementation (editorStore.ts:124-127)
```typescript
updateFrontmatter: (changes: Partial<EditableFrontmatter>) => {
  const current = get().editedFrontmatter ?? {};
  set({ editedFrontmatter: { ...current, ...changes }, isDirty: true });
}
```

**Behavior:**
- Takes a partial object (only fields being changed)
- Shallow merges with current `editedFrontmatter`
- If `editedFrontmatter` is null, treats as empty object
- Sets `isDirty: true` immediately
- All handlers pass a single-key or multi-key partial object

**Key pattern:** Each onChange only passes the field that changed, letting zustand shallow merge handle state accumulation.

---

### State Computation Pattern (FrontmatterForm.tsx:28-37)

The form uses a **fallback pattern** throughout:
```typescript
const fm = useEditorStore((s) => s.editedFrontmatter);
const title = fm?.title ?? note.title;
const status = fm?.status !== undefined ? (fm.status ?? "") : (note.status ?? "");
```

**Logic:**
- If `editedFrontmatter` has the field, use it (even if `null`)
- If `editedFrontmatter` doesn't have the field (undefined), use `note` value
- For nullable fields (status, source, summary), distinguish between:
  - Never edited: display `note.status ?? ""`
  - Edited to null: display empty string (because `fm.status ?? ""`  → empty)
  - Edited to value: display value

This allows the form to show fresh state until the user makes an edit.

---

### Existing Undo/Redo Pattern (NOT for fields)

**File in:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts`

**Scope:** File operations only (create-note, delete-note, create-folder, delete-folder)
- **No field-level undo** currently implemented
- Uses `UndoableAction` discriminated union with snapshots
- `MAX_UNDO_STACK = 20` items
- Concurrent-edit safe with `isProcessing` guard
- Toast notifications for feedback

**Key observation:** The undoStore is **completely separate** from editorStore. There is **zero field-level undo history** — when you edit `updateFrontmatter`, there is no state history being maintained. This is the gap to fill.

---

### Conclusion: Field Editing State Summary

**All field changes go through `updateFrontmatter(changes: Partial<EditableFrontmatter>)`:**
- `title`: string (direct)
- `note_type`: string (direct)
- `status`: string | null (with "" → null conversion in onChange)
- `source`: string | null (with "" → null conversion in onChange)
- `summary`: string | null (with "" → null conversion in onChange)
- `tags`: string[] (from TagInput)
- `extra`: Record<string, unknown> (from ExtraFieldsEditor)

**No field-level undo/redo exists.** Each call merges into `editedFrontmatter` shallow copy, replacing any previous edits to that field. Ctrl+Z/Cmd+Z only undoes file operations (create/delete), not metadata edits.

---

