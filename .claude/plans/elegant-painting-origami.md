# Plan: Link Editor UI in Frontmatter Metadata

## Context

The metadata panel shows all frontmatter fields except `links`. Users must manually edit YAML to add/remove relationships between notes. The backend is fully ready — `createLink`/`deleteLink` APIs exist end-to-end. Only the React UI is missing.

**Key constraint:** After `createLink`/`deleteLink`, the file watcher consumes the "expected write" and does NOT emit events (watcher.rs:92-94). The frontend must manually update graph store and refresh the active note.

## Implementation

### Step 1: Add `refreshActiveNote` to editorStore

**Modified file:** `crates/app/src/stores/editorStore.ts`

Add a new action that updates `activeNote` without clearing `editedFrontmatter` or `editedBody`, preserving dirty state:

```typescript
refreshActiveNote: async () => {
  const { activeNote } = get();
  if (!activeNote) return;
  const api = await getAPI();
  const note = await api.readNote(activeNote.path);
  set({ activeNote: note }); // does NOT touch isDirty, editedBody, editedFrontmatter
}
```

This prevents the blocker where re-reading the note after a link operation would conflict with pending unsaved edits.

### Step 2: LinksEditor Component

**New file:** `crates/app/src/components/Editor/LinksEditor.tsx`

Props: `notePath: string`, `links: TypedLinkDto[]`

**Existing link rows:** Each shows:
- Relationship type label
- Target note title (from `graphStore.nodes` map, fallback to raw path)
- × remove button

**Add link row:**
- Target input with `<datalist>` for browser-native autocomplete (populated from `graphStore.nodes`, excluding self). Display titles, store paths.
- Type `<select>` with 12 user-selectable edge types (excluding `contains`, `part-of`, `mentioned-in` — these are auto-generated implicit/inline types)
- `+` add button, disabled when target doesn't resolve to a valid node path or link already exists

**Operation flow (create/delete):**
1. Set `busy = true` (disables all add/remove buttons — prevents race conditions)
2. Call `api.createLink(...)` or `api.deleteLink(...)`
3. Call `graphStore.applyEvent({ type: "edge-created"|"edge-deleted", edge: { source, target, rel, kind: "Explicit" } })`
4. Call `editorStore.refreshActiveNote()` (preserves dirty state)
5. Set `busy = false`
6. On error: log to console, reset busy, show inline error message

**Edge type constants:**
```typescript
const LINK_TYPES = [
  "causes", "supports", "contradicts", "extends", "depends-on",
  "exemplifies", "precedes", "leads-to", "evolved-from",
  "related-to", "authored-by", "sourced-from",
];
// Excluded: contains, part-of (implicit/directory), mentioned-in (inline/body)
```

### Step 3: Wire into FrontmatterForm

**Modified file:** `crates/app/src/components/Editor/FrontmatterForm.tsx`

Add between Modified field and Extra Fields:

```tsx
<div className="frontmatter-extra-header">Links</div>
<LinksEditor notePath={note.path} links={note.links} />
```

### Step 4: CSS

**Modified file:** `crates/app/src/App.css`

Style following the `extra-field-*` pattern:
- `.links-editor` container
- `.link-row` — flex row per existing link
- `.link-rel` — relationship badge
- `.link-target` — title text
- `.link-remove` — × button (reuse `.extra-field-remove` style)
- `.link-add-row` — add row
- `.link-add-target` — target input
- `.link-add-type` — type select
- `.link-error` — inline error message

### Step 5: Tests

**New file:** `crates/app/src/components/Editor/LinksEditor.test.tsx`

- Renders existing links with titles and rel labels
- Remove button calls `deleteLink` with correct source/target/rel
- Add button calls `createLink` with correct params
- Add button disabled when target is empty or invalid
- Add button disabled when duplicate link exists
- After add/remove: `applyEvent` called with `kind: "Explicit"`, `refreshActiveNote` called
- Buttons disabled while operation in progress (busy guard)
- API failure: error shown, buttons re-enabled, links unchanged

### Step 6: Documentation

Update `CLAUDE.md` current status.

## Files Summary

| Action | File |
|--------|------|
| Create | `crates/app/src/components/Editor/LinksEditor.tsx` |
| Create | `crates/app/src/components/Editor/LinksEditor.test.tsx` |
| Modify | `crates/app/src/stores/editorStore.ts` |
| Modify | `crates/app/src/components/Editor/FrontmatterForm.tsx` |
| Modify | `crates/app/src/App.css` |
| Modify | `CLAUDE.md` |

## Existing code to reuse

- `getAPI()` from `api/bridge.ts` — `createLink`, `deleteLink`, `readNote`
- `useGraphStore.nodes` — title lookup + autocomplete source
- `useGraphStore.applyEvent()` — manual edge updates
- `ExtraFieldsEditor` — row layout pattern, CSS class naming convention
- `getNodeColor()` from `graphStyles.ts` — optional color for note type in rows

## Verification

1. `cd crates/app && npx vitest run` — all tests pass
2. Manual: open Karl Pearson, expand Edit Metadata, see "Links" section with 2 existing links (evolved-from Francis Galton, contradicts Causal Inference)
3. Manual: click × on a link → removed, Related Notes footer updates
4. Manual: type note title in add row, select from autocomplete, pick edge type, click + → link added, footer updates
5. Manual: verify `.md` file on disk reflects the change
6. Manual: make unsaved title edit, then add a link → title edit preserved (dirty state not lost)
