# 2026-03-11 — Subagent Transcript: Plan

**Date:** 2026-03-11 19:26:24
**Agent:** Plan
**Agent ID:** aac51cb489e1d44bf
**Parent Session:** ad145178-00e1-406f-b483-a103e20c14d1

---

## User

Design an implementation plan for upgrading the editor view in a Tauri v2 + React desktop app (BrainMap). The app uses CSS custom properties for theming (light/dark), CodeMirror 6 for editing, react-markdown + remarkGfm for preview, and Zustand for state.

## Current state

The editor panel lives in `crates/app/src/components/Editor/` with these files:
- `EditorPanel.tsx` — orchestrates header bar, frontmatter, editor/preview, related notes footer
- `FrontmatterForm.tsx` — collapsible metadata table (Title, Type, Tags, Status, Source as label+input pairs)
- `MarkdownEditor.tsx` — CodeMirror 6 wrapper
- `MarkdownPreview.tsx` — react-markdown wrapper
- `RelatedNotesFooter.tsx` — collapsible list of related notes (direction arrow + rel badge + title)

All styling in `crates/app/src/App.css`. Theme uses CSS variables (--bg-primary, --bg-secondary, --bg-tertiary, --text-primary, --text-secondary, --text-muted, --accent, --border-color). Note types have dot colors already defined (.dot-concept through .dot-project).

NoteDetail type has: path, title, note_type, tags, status, created, modified, source, summary, links, extra, body.

## Selected upgrades (9 items)

**1. Metadata as styled pills/chips** — Replace the collapsible table with inline chips below the title. Type as a colored pill (reuse .dot-* color map), tags as individual rounded chips, status as colored dot + label. No more collapsible "Metadata" section — it's always visible as part of the note header.

**3. Heading accent bar** — In markdown preview, add a subtle left border accent on h2/h3 headings instead of just color. Think Notion-style colored heading indicators.

**4. Frontmatter-to-hero section** — Merge the header bar title and metadata into a "hero" header: large title, type pill beside it, tags underneath, source as small attribution. Remove the separate header bar title duplication.

**5. Better Related Notes section** — Replace the plain list with small cards. Each related note as a card with type color indicator, title, and relationship badge. Use a horizontal-scrolling or grid layout instead of a vertical list.

**6. Smooth edit/preview transition** — Add CSS fade/crossfade when switching between edit and preview modes.

**10. Empty state illustration** — When no note is selected, show a styled empty state with the BrainMap brand (text-based, no image assets needed) instead of plain text.

**11. Softer heading colors** — Use CSS variable --accent instead of hardcoded coral/red for preview headings. This makes them theme-aware.

**12. Subtle card elevation** — Add a faint box-shadow or inset border to the editor-body area so it feels like a "page" floating on the background.

**13. Blockquote styling** — Add a subtle background tint behind blockquotes, not just the left border.

## Constraints
- No new npm dependencies (use existing react-markdown, remarkGfm, CodeMirror)
- All styling via App.css with CSS variables
- Must work in both light and dark themes
- The type-to-color mapping already exists as .dot-* classes; reuse those colors
- Keep components in their current files; refactoring is fine within them
- The edit/preview transition should use CSS transitions/animations only (no animation libraries)

## Design the plan
Provide a step-by-step implementation plan covering:
1. Which files change and how
2. CSS changes (new classes, modified classes)
3. Component JSX changes
4. The type-color mapping approach (how to share .dot-* colors between file tree and editor)
5. Order of implementation (dependencies between steps)
6. How to verify each change

---

## Assistant



I'll explore the current codebase to understand the existing structure, styling patterns, and component implementations before designing the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

Now let me look at the CSS and the type-color mapping.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.dot-","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-A":1}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"--bg-primary|--bg-secondary|--bg-tertiary|--text-primary|--text-secondary|--text-muted|--accent|--border-color","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css",`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"editor-placeholder|editor-panel|editor-header|editor-body|editor-view|editor-title|editor-focus","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"`

---

## Assistant

Let me read the relevant CSS sections in detail.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":173,"limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":620,"limit":130}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":730,"limit":130}`

---

## Assistant

Now let me check the remaining related notes CSS and the NoteDetail type.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":859,"limit":60}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"NoteDetail","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"interface NoteDetail|type NoteDetail","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts","output_mode":"content","-A":20}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"note_type","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content"}`

---

## Assistant

Let me check how `getNodeColor` works to see the existing color mapping approach.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"getNodeColor","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","-A":15}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1,"limit":55}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts"}`

---

## Assistant

I notice that the colors in `NOTE_TYPE_COLORS` (graphStyles.ts) don't match the `.dot-*` CSS classes exactly. Let me verify this discrepancy since it matters for the plan.

Now let me check if there's a `NodeDto` type used in the related notes, so I understand what data is available for related note cards.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"interface NodeDto|type NodeDto","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts","output_mode":"content","-A":6}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts","limit":30}`

---

## Assistant

I now have a thorough understanding of the codebase. Let me also quickly check how many lines the CSS file is, to understand the overall size.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"wc -l /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","description":"Count lines in App.css"}`

---

## Assistant

I have all the information needed. Here is the implementation plan.

---

## Implementation Plan: Editor View Upgrades (9 Items)

### Key Discovery: Color Mapping Discrepancy

Before diving in, there is an important finding. The `.dot-*` CSS classes in `App.css` (lines 631-640) use different hex values than `NOTE_TYPE_COLORS` in `graphStyles.ts` (lines 2-13). For example:
- `book-note`: CSS `.dot-book-note` = `#f39c12`, JS `NOTE_TYPE_COLORS` = `#9b59b6`
- `question`: CSS = `#9b59b6`, JS = `#e67e22`
- `index`: CSS = `#1abc9c`, JS = `#34495e`

These two palettes are out of sync. The plan must unify them or pick one as canonical. The recommendation is to extract CSS custom properties (`--color-concept`, `--color-book-note`, etc.) defined once in `:root`, then reference them from both `.dot-*` classes and a new shared JS/CSS approach. This is addressed in Step 1 below.

### Implementation Order

The steps are ordered so that foundational changes (shared color system, layout restructuring) come first, and purely additive CSS-only changes come last.

---

### Step 1: Extract type colors into CSS custom properties

**Why first**: Steps 1, 4, and 5 all need a single source of truth for type-to-color mapping.

**Files changed**: `App.css`, `graphStyles.ts`

**CSS changes in App.css**:
- Add 10 new CSS custom properties in both `:root` / `[data-theme="light"]` and `[data-theme="dark"]` blocks (same values for now, but the structure allows future per-theme type colors):
  ```
  --color-concept: #4a9eff;
  --color-book-note: #f39c12;
  --color-question: #9b59b6;
  --color-reference: #7f8c8d;
  --color-index: #1abc9c;
  --color-argument: #e74c3c;
  --color-evidence: #27ae60;
  --color-experiment: #e67e22;
  --color-person: #e91e63;
  --color-project: #00bcd4;
  ```
  Use the `.dot-*` values as canonical (they match the file tree the user already sees).

- Rewrite `.dot-*` classes to use `background: var(--color-concept)` etc.

**JS changes in graphStyles.ts**:
- Update `NOTE_TYPE_COLORS` to match the canonical palette above. The Cytoscape graph uses JS hex values directly (not CSS vars) because Cytoscape is canvas-based, so these must be kept in sync manually. Add a comment noting this.

**Verification**: Open the app, confirm file tree dots and graph node colors still render correctly. Compare side by side.

---

### Step 2: Create a shared `typeColor` utility for React components

**Why**: Steps 4 and 5 need to apply type-specific colors as inline styles (for the hero pill and related note cards). A small helper avoids duplicating the color map.

**Files changed**: New constant in `graphStyles.ts` (already has the map) -- no new file needed. Or, create a tiny `crates/app/src/utils/typeColors.ts` if you prefer to avoid importing from GraphView into Editor.

**Approach**: Export a helper function and the map from `graphStyles.ts` (already exported as `NOTE_TYPE_COLORS` and `getNodeColor`). The Editor components will import `getNodeColor` from `../GraphView/graphStyles`. This is a cross-component import but acceptable since it is a pure utility with no side effects.

**Verification**: Importing `getNodeColor` from the Editor directory compiles without issues.

---

### Step 3: Frontmatter-to-Hero section (item 4) + Metadata as pills/chips (item 1)

These two items are merged into a single step because they fundamentally restructure the same area: the header bar and the frontmatter form become one unified "hero" region.

**Files changed**: `EditorPanel.tsx`, `FrontmatterForm.tsx`, `App.css`

**JSX changes in EditorPanel.tsx**:
- Remove `<div className="editor-header-bar">` and its children (title, view toggle, focus btn).
- Create a new `<div className="editor-hero">` that contains:
  - `<div className="editor-hero-top">` with the view toggle and focus button (right-aligned).
  - `<h1 className="editor-hero-title">` with the note title.
  - Beside the title (or on the same line): a type pill rendered inline.
  - Below the title: tags as chips, status as dot+label, source as small attribution.
- The view toggle and focus button move into the hero-top row (flex, justify-content: space-between).

**JSX changes in FrontmatterForm.tsx**:
- Rename to a "metadata chips" renderer. Remove the collapsible toggle, the `<label>/<input>` pairs, and the `expanded` state entirely.
- The component now receives `note: NoteDetail` and renders:
  - A `<span className="meta-type-pill dot-{note_type}">` with the type name, using inline `style={{ backgroundColor: getNodeColor(note.note_type) }}` for the background and white text.
  - Tag chips: `note.tags.map(t => <span className="meta-tag-chip">{t}</span>)`.
  - Status: `<span className="meta-status"><span className="meta-status-dot" /> {note.status}</span>` (only if status is non-null).
  - Source: `<span className="meta-source">{note.source}</span>` (only if source is non-null).
- Return null or empty fragment if there is nothing to show.

**CSS changes in App.css**:
- Remove `.editor-header-bar`, `.editor-title` styles.
- Remove `.frontmatter-form`, `.frontmatter-fields`, `.frontmatter-form label`, `.frontmatter-form input` styles.
- Remove `.section-toggle` if only used by frontmatter (check: also used by related notes toggle -- keep it if so). Actually `.section-toggle` is a shared class, so keep it.
- Add new classes:
  - `.editor-hero` -- padding 16px 20px, background var(--bg-primary), border-bottom 1px solid var(--border-color), flex-shrink 0.
  - `.editor-hero-top` -- flex, align-items center, justify-content flex-end, gap 8px, margin-bottom 8px.
  - `.editor-hero-title` -- font-size 1.5em, font-weight 700, color var(--text-primary), margin 0 0 8px 0, display flex, align-items center, gap 10px.
  - `.meta-type-pill` -- display inline-flex, align-items center, padding 2px 10px, border-radius 12px, font-size var(--ui-font-xs), font-weight 600, color #fff, text-transform capitalize.
  - `.meta-tags` -- display flex, flex-wrap wrap, gap 6px, margin-top 6px.
  - `.meta-tag-chip` -- padding 2px 8px, border-radius 10px, font-size var(--ui-font-xs), background var(--bg-tertiary), color var(--text-secondary).
  - `.meta-status` -- display inline-flex, align-items center, gap 4px, font-size var(--ui-font-xs), color var(--text-secondary).
  - `.meta-status-dot` -- width 6px, height 6px, border-radius 50%, background var(--success) (or map by status value: draft=warning, review=accent, done=success, etc.).
  - `.meta-source` -- font-size var(--ui-font-xs), color var(--text-muted), margin-top 4px, font-style italic.

**Verification**: Open a note with all metadata fields populated. Confirm title is large, type pill shows with correct color, tags render as individual chips, status shows dot+label, source shows as small italic text. Confirm no collapsible section remains. Check both light and dark themes.

---

### Step 4: Better Related Notes section (item 5)

**Files changed**: `RelatedNotesFooter.tsx`, `App.css`

**JSX changes in RelatedNotesFooter.tsx**:
- Keep the collapsible toggle (it is useful here since related notes can be many).
- Replace `<div className="related-note-item">` with `<div className="related-note-card">`.
- Each card contains:
  - A `<span className="related-note-type-bar">` styled with `style={{ backgroundColor: getNodeColor(targetNodeType) }}` as a left color indicator strip. To get the target node's type, look it up from `nodes.get(item.path)?.note_type` (the `nodes` map from graphStore already has `NodeDto` which includes `note_type` -- this data is already available in the `useMemo`).
  - The title.
  - The relationship badge (already `.related-note-rel`).
  - The direction arrow.
- Change `.related-notes-list` from a vertical scrollable list to a CSS grid or horizontal-scroll flex layout.

**Extend the `related` useMemo**: Add `noteType` to each item:
```ts
noteType: nodes.get(l.target)?.note_type ?? "reference",
```

**CSS changes in App.css**:
- Replace `.related-notes-list` with: `display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; padding: 8px 12px; max-height: 220px; overflow-y: auto;`.
- Replace `.related-note-item` with `.related-note-card`: `display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 6px; background: var(--bg-primary); border: 1px solid var(--border-color); cursor: pointer; transition: border-color 0.15s;`.
- `.related-note-card:hover`: `border-color: var(--accent);`.
- `.related-note-type-bar`: `width: 3px; align-self: stretch; border-radius: 2px; flex-shrink: 0;`.
- Update `.related-note-title` and `.related-note-rel` to fit the card layout.

**Verification**: Open a note with multiple links. Confirm cards render in a grid, each with a colored left bar matching the target note's type, title, and rel badge. Hover highlights the card border. Test with few (1-2) and many (10+) related notes. Confirm grid wraps properly at different panel widths.

---

### Step 5: Smooth edit/preview transition (item 6)

**Files changed**: `EditorPanel.tsx`, `App.css`

**JSX changes in EditorPanel.tsx**:
- Instead of conditionally rendering `<MarkdownEditor>` or `<MarkdownPreview>`, render both always, and control visibility with a wrapper class.
- Wrap each in `<div className="editor-view-layer editor-view-layer--edit {viewMode === 'edit' ? 'editor-view-layer--active' : ''}">` and similar for preview.
- Both layers are `position: absolute; inset: 0;` inside `.editor-body` (which becomes `position: relative`).

**CSS changes in App.css**:
- `.editor-body` -- add `position: relative;` (already has `flex: 1; min-height: 0; overflow: auto;`).
- `.editor-view-layer` -- `position: absolute; inset: 0; opacity: 0; transition: opacity 0.2s ease; pointer-events: none; overflow: auto;`.
- `.editor-view-layer--active` -- `opacity: 1; pointer-events: auto;`.

**Consideration**: Rendering both CodeMirror and the preview simultaneously could have a performance cost. CodeMirror creates a DOM-heavy editor. To mitigate: keep the conditional render for the CodeMirror component (only mount when edit mode), but keep the preview always mounted (it is lightweight). The fade-out of the departing view can be simulated by adding a brief CSS transition on the `.editor-body` children. A simpler approach:
- Use a CSS class on `.editor-body` itself: `.editor-body--transitioning`.
- When switching modes, add the class, wait for the outgoing content to fade (150ms), swap the content, then fade in.
- This requires a small `useEffect` with a timeout. Keep it minimal.

**Simpler recommended approach**: Use a `key` + CSS `@keyframes fadeIn` animation on the content wrapper. When `viewMode` changes, React remounts the child, triggering the animation.
- `.editor-body > *` -- `animation: editorFadeIn 0.2s ease;`.
- `@keyframes editorFadeIn { from { opacity: 0; } to { opacity: 1; } }`.

This is simpler, requires no extra state, and gives a fade-in effect. The outgoing content disappears instantly (acceptable since the incoming content fades in smoothly).

**Verification**: Switch between edit and preview modes. Confirm a smooth 200ms fade-in. No flicker, no layout shift. CodeMirror cursor position should be preserved when returning to edit mode (already handled by the existing `useEffect` syncing content).

---

### Step 6: Empty state illustration (item 10)

**Files changed**: `EditorPanel.tsx`, `App.css`

**JSX changes in EditorPanel.tsx**:
- Replace the plain text in the `!activeNote` block with a styled empty state:
  ```jsx
  <div className="editor-empty-state">
    <div className="editor-empty-brand">BrainMap</div>
    <div className="editor-empty-tagline">Your knowledge, connected.</div>
    <div className="editor-empty-hint">
      Select a node in the graph or search results to view its content.
    </div>
  </div>
  ```

**CSS changes in App.css**:
- `.editor-empty-state` -- display flex, flex-direction column, align-items center, justify-content center, height 100%, gap 12px.
- `.editor-empty-brand` -- font-size 2em, font-weight 800, color var(--text-muted), letter-spacing 0.05em, opacity 0.5.
- `.editor-empty-tagline` -- font-size var(--ui-font-lg), color var(--text-muted), opacity 0.4.
- `.editor-empty-hint` -- font-size var(--ui-font-sm), color var(--text-muted), opacity 0.35, margin-top 8px.

**Verification**: Close any open note (or start with none selected). Confirm the empty state shows centered "BrainMap" brand text with tagline and hint. Check both themes.

---

### Step 7: CSS-only changes (items 3, 11, 12, 13)

These four items are all pure CSS modifications with no component changes. They can be done together.

**Files changed**: `App.css` only

**7a. Heading accent bar (item 3)**:
- Modify `.md-preview h2` and `.md-preview h3` to add `border-left: 3px solid var(--accent); padding-left: 10px;`.

**7b. Softer heading colors (item 11)**:
- The headings already use `color: var(--text-primary)` (line 747). No hardcoded coral/red exists in the current CSS. This item is already satisfied. If the intent is to tint headings slightly toward the accent, add: `.md-preview h1, .md-preview h2, .md-preview h3 { color: color-mix(in srgb, var(--text-primary) 85%, var(--accent) 15%); }`. This gives a subtle accent tint that automatically adapts to theme.

**7c. Subtle card elevation (item 12)**:
- Add to `.editor-body`: `box-shadow: inset 0 1px 3px rgba(0,0,0,0.06);` for light theme.
- For dark theme, use `box-shadow: inset 0 1px 4px rgba(0,0,0,0.2);`. This can be done with a CSS variable: add `--editor-body-shadow` to both theme blocks, then apply `box-shadow: var(--editor-body-shadow);` to `.editor-body`.
- Alternatively, a simpler universal approach: `box-shadow: 0 1px 4px rgba(0,0,0,0.08);` on `.editor-body` with a `border-radius: 4px; margin: 4px;` to give the "floating page" feel.

**7d. Blockquote styling (item 13)**:
- Currently `.md-preview blockquote` has `border-left: 3px solid var(--accent); padding: 4px 0 4px 16px;`.
- Add: `background: color-mix(in srgb, var(--accent) 6%, transparent); border-radius: 0 4px 4px 0; padding: 8px 12px 8px 16px;`.
- The `color-mix` approach is already used elsewhere in this CSS file (line 591, 1329), so it is a proven pattern.

**Verification**: Open a note with h2/h3 headings, blockquotes, and body content. Confirm h2/h3 have a left accent bar. Confirm blockquotes have a subtle tinted background. Confirm the editor body area has a subtle shadow making it feel like a floating page. Switch between light and dark themes to verify everything adapts.

---

### Summary of Files Changed

| File | Changes |
|------|---------|
| `crates/app/src/App.css` | All 9 items: new CSS variables for type colors, hero section styles, pill/chip styles, related note card grid, edit/preview transition animation, empty state styles, heading accent bars, blockquote background, editor body shadow |
| `crates/app/src/components/Editor/EditorPanel.tsx` | Hero section restructure (items 1+4), edit/preview transition wrapper (item 6), empty state (item 10) |
| `crates/app/src/components/Editor/FrontmatterForm.tsx` | Complete rewrite from collapsible table to inline pills/chips (items 1+4) |
| `crates/app/src/components/Editor/RelatedNotesFooter.tsx` | Card layout with type color bars (item 5) |
| `crates/app/src/components/GraphView/graphStyles.ts` | Sync `NOTE_TYPE_COLORS` with canonical palette (item 1 prerequisite) |

### Potential Challenges

1. **Color palette unification**: The `.dot-*` CSS colors and `NOTE_TYPE_COLORS` JS object are currently out of sync. Picking one as canonical and updating the other will change either the file tree dot colors or the graph node colors. The plan chooses the CSS `.dot-*` values as canonical because they are the ones the user sees most often in the file tree. The graph colors will shift slightly for some types.

2. **CodeMirror and the fade transition**: If using the dual-render approach for crossfade, keeping CodeMirror mounted when not visible could consume memory and prevent garbage collection of editor state. The recommended `@keyframes fadeIn` approach avoids this by only mounting the active view.

3. **Related note type lookup**: The `nodes` map from `graphStore` only contains `NodeDto` (path, title, note_type). For related notes whose targets are not in the loaded graph (edge case with filtered graphs or focus mode), the type lookup will return undefined. The fallback `?? "reference"` handles this gracefully.

4. **`color-mix` browser support**: `color-mix(in srgb, ...)` is already used in the existing CSS (lines 591, 1329), confirming the Tauri WebView supports it. No concern here.

---

### Critical Files for Implementation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` - Central stylesheet where all 9 items require CSS additions or modifications (roughly 80% of the work)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx` - Orchestration component that must be restructured for hero section, transition, and empty state
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx` - Complete rewrite from collapsible metadata table to inline pills/chips
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx` - Rewrite from plain list to card grid with type color indicators
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts` - Contains `NOTE_TYPE_COLORS` map that must be synced with canonical palette and exported for reuse

---

