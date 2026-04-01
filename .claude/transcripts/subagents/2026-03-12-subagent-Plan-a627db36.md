# 2026-03-12 — Subagent Transcript: Plan

**Date:** 2026-03-12 14:00:57
**Agent:** Plan
**Agent ID:** a627db36b82cf6dfd
**Parent Session:** dfabc312-94bd-48b1-95d0-282298fb65ab

---

## User

Design an implementation plan for modernizing the Files view (left panel file tree) in a Tauri v2 + React 18 app. The app uses vanilla CSS with CSS variables for theming, Zustand for state, and no external UI component library for the tree.

## Current State

The file tree is in `crates/app/src/components/Layout/FileTreePanel.tsx` (489 lines). Styling is in `crates/app/src/App.css` (lines 994-1174). Tests are in `FileTreePanel.test.ts`. The tree is pure React — recursive `FileTreeNode` components with depth-based padding (`8 + depth * 12px`). Folders have CSS-drawn chevrons, files have 7px colored dots by note type. No external tree library.

Current dependencies (from package.json): React 18, Zustand, Cytoscape, CodeMirror, react-resizable-panels, react-markdown. No icon library installed.

## 6 Features to Implement (in priority order)

### 1. File/Folder Icons (Lucide React)
- Install `lucide-react` (tree-shakeable, ~3KB per icon)
- Replace the CSS-drawn chevron triangle with `<ChevronRight>` icon (rotates on expand)
- Replace the 7px colored dots with type-specific icons: `Lightbulb` (concept), `BookOpen` (book-note), `HelpCircle` (question), `FileText` (reference), `List` (index), `MessageSquare` (argument), `FlaskConical` (evidence), `TestTube` (experiment), `User` (person), `FolderKanban` (project)
- Folder icons: `Folder`/`FolderOpen` based on expanded state
- Icons keep the existing type colors, just bigger (14-16px instead of 7px dots)

### 2. Indent Guides (Vertical Lines)
- Add thin vertical lines at each indent level connecting parent-child
- Implementation: use `::before` pseudo-elements on `.tree-item` or a dedicated guide element
- Lines are `1px solid var(--border-color)` at each depth, positioned at the indent column
- Active item's ancestor guide lines highlight in `var(--accent)` (optional, can skip for simplicity)

### 3. Note Count Badges on Folders
- Show `(N)` count next to folder names where N = total descendant notes (not folders)
- Compute count in `buildTree()` by adding a `noteCount` field to `TreeNode`
- Display as a small muted span after the folder name
- Counts update automatically since tree is rebuilt via `useMemo`

### 4. Hover Actions Button ("...")
- On hover, show a small `...` (or ellipsis icon) button at the right edge of each tree item
- Clicking it opens the context menu at that position (reuses existing context menu)
- This provides discoverability — users don't have to right-click
- Use `opacity: 0` by default, `opacity: 1` on `.tree-item:hover`

### 5. Expand/Collapse Animation
- Animate folder children appearing/disappearing with a height transition
- Wrap children in a container with `max-height` transition or use CSS `grid-template-rows: 0fr → 1fr` trick
- Keep it short (150ms) so it doesn't feel sluggish
- Alternative: simple opacity+translateY fade-in if height animation is complex

### 6. Fuzzy Filter + Match Highlighting
- Replace `String.includes()` with a simple fuzzy match (characters in order, not necessarily adjacent)
- Highlight matched characters in the tree item label with `<mark>` or a styled `<span>`
- Keep the algorithm simple — no need for fuse.js, just a custom function (~20 lines)
- Filter results should still preserve folder structure (show parent folders for matching children)

## Constraints
- All styling is in a single `App.css` with CSS variables. No CSS modules, no Tailwind.
- Tree items are 22px tall. Keep them compact.
- Dark/light theme support via CSS variables.
- ~200 Vitest tests exist; new features need tests for pure logic (buildTree, fuzzy match, count computation).
- The tree is already ~490 lines — consider extracting icons/fuzzy into small utility files to keep it manageable.

## Questions to Answer in Your Plan
1. Should icons be extracted to a `fileTreeIcons.tsx` mapping file?
2. For indent guides, is `::before` per-item better or a separate guide component?
3. For the expand animation, which CSS technique works best with the current recursive rendering?
4. Should fuzzy matching be its own utility file with tests?

Please provide a detailed step-by-step implementation plan with file paths, code approach for each feature, and test strategy.

---

## Assistant



I'll explore the codebase to understand the current implementation before designing the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Layout/FileTreePanel.test.ts*"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.test.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":994,"limit":200}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"--accent|--border-color|--bg-secondary|--text-muted","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","head_limit":30}`

---

## Assistant

Now let me check existing utility file patterns and the import used by `useUndoStore` (missing from imports).

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/utils/*.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Layout/*.tsx"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"useUndoStore","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content"}`

---

## Assistant

I notice `useUndoStore` is used but not in the imports at the top of FileTreePanel.tsx -- it must be a module-level import that I missed or it's accessed differently. Let me check a couple more things.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"import.*useUndoStore","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"import.*useUndoStore","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","head_limit":5}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1,"limit":50}`

---

## Assistant

Good -- `useUndoStore` is used in FileTreePanel but not imported (likely a bug that works because it's hoisted from somewhere, or it's a missing import that hasn't caused runtime issues because it's only used inside `handleDeleteConfirm` which accesses it at call time). Now let me check the graphStyles for the type-color mapping used in the graph to ensure consistency.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"dot-concept|typeColorMap|TYPE_COLORS|noteTypeColor","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"wc -l /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","description":"Count total lines in App.css"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"typeColorMap|TYPE_COLOR|noteTypeColor|color.*concept|#4a9eff.*concept","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts","output_mode"`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts","limit":25}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphLegend.tsx","limit":30}`

---

## Assistant

Now I have a thorough understanding of the codebase. Let me check the vitest config for test setup patterns.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/vitest.config.ts"}`

---

## Assistant

I now have a complete picture. Here is the implementation plan.

---

## Implementation Plan: Modernizing the Files View (File Tree Panel)

### Answers to Design Questions

**1. Should icons be extracted to a `fileTreeIcons.tsx` mapping file?**

Yes. The icon-to-type mapping, the icon imports, and a single `NoteTypeIcon` component should live in `crates/app/src/components/Layout/fileTreeIcons.tsx`. This keeps FileTreePanel.tsx from growing with 10+ Lucide imports and provides a clean lookup function (`getIconForType(noteType: string)`) that can be reused by other parts of the app (e.g., the legend, related notes cards). The file will also export `FolderIcon` and `FolderOpenIcon` wrappers.

**2. For indent guides, is `::before` per-item better or a separate guide component?**

`::before` per-item is better. Each `.tree-item` already has `position: relative`, and the guide lines are purely visual -- no interactivity needed. A separate component would add React elements to the tree for no functional benefit. The approach: each tree item at depth > 0 gets one `::before` pseudo-element per ancestor level. However, since CSS pseudo-elements cannot multiply, the cleaner approach is to use a single `::before` that renders as a left-border guide at the item's own depth column, and then add a thin `<span>` element per ancestor depth inside each tree item. Actually the simplest approach: wrap the children block in a `<div className="tree-children">` with a `border-left` at the correct offset. This gives one guide per nesting level with zero extra elements per child.

**3. For the expand animation, which CSS technique works best with the current recursive rendering?**

The `CSS grid` trick (`grid-template-rows: 0fr` to `1fr` with `overflow: hidden` on the child) is the best fit. The current rendering conditionally renders children (`{isExpanded && node.children.map(...)}`). This needs to change to always rendering children but wrapping them in a collapsible container. The container uses `display: grid; grid-template-rows: 0fr; transition: grid-template-rows 150ms ease;` when collapsed, and `grid-template-rows: 1fr` when expanded. The inner div gets `overflow: hidden; min-height: 0`. This animates height from 0 to auto without JavaScript measurement.

**4. Should fuzzy matching be its own utility file with tests?**

Yes. Create `crates/app/src/utils/fuzzyMatch.ts` with two exports: `fuzzyMatch(query: string, text: string): number[] | null` (returns array of matched character indices or null on no match), and `fuzzyFilterTree(tree: TreeNode[], query: string): TreeNode[]`. Tests go in `crates/app/src/utils/fuzzyMatch.test.ts`. This keeps the algorithm testable in isolation and the tree component clean.

---

### Step-by-Step Implementation

#### Step 0: Install `lucide-react`

Run `npm install lucide-react` in `crates/app/`. Lucide React is tree-shakeable (each icon is ~300 bytes gzipped), so importing 12-14 icons adds roughly 4KB to the bundle. No other dependencies are needed for any of the 6 features.

#### Step 1: Create `fileTreeIcons.tsx`

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/fileTreeIcons.tsx`

This file exports:
- `NOTE_TYPE_ICONS`: A `Record<string, LucideIcon>` mapping each of the 10 note types to their Lucide icon component.
- `NoteTypeIcon({ noteType, size?, className? })`: Renders the appropriate icon with the type's color from the existing `NOTE_TYPE_COLORS` map in `graphStyles.ts` (import it to stay DRY, removing the need for CSS `.dot-*` classes).
- `FolderIcon({ isOpen, size? })`: Renders `Folder` or `FolderOpen`.
- `ChevronIcon({ isOpen })`: Renders `ChevronRight` with a CSS rotation class.

The icon mapping:
```
concept     -> Lightbulb
book-note   -> BookOpen
question    -> HelpCircle
reference   -> FileText
index       -> List
argument    -> MessageSquare
evidence    -> FlaskConical
experiment  -> TestTube
person      -> User
project     -> FolderKanban
```

Icon size: 14px for note type icons, 14px for folder icons, 12px for chevron. Colors applied via inline `style={{ color: NOTE_TYPE_COLORS[noteType] }}` so they work in both themes without CSS class changes.

#### Step 2: Create `fuzzyMatch.ts` utility

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/fuzzyMatch.ts`

Exports:
- `fuzzyMatch(query: string, text: string): number[] | null` -- Case-insensitive. Returns array of character indices in `text` that match sequential characters in `query`, or `null` if no match. Simple greedy left-to-right scan (~15 lines).
- `highlightFuzzyMatch(text: string, indices: number[]): React.ReactNode[]` -- Splits text into alternating plain `<span>` and highlighted `<mark>` segments based on the indices array.

**Test file:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/fuzzyMatch.test.ts`

Test cases:
- Exact substring match returns consecutive indices
- Non-adjacent character match (e.g., "cb" matches "causality-book" at positions [0, 10])
- Case insensitivity
- No match returns null
- Empty query matches everything (returns `[]`)
- Query longer than text returns null
- `highlightFuzzyMatch` produces correct segments

#### Step 3: Add `noteCount` to `TreeNode` and `buildTree()`

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`

Changes to the `TreeNode` interface:
- Add `noteCount?: number` field (only meaningful for folders).

Changes to `buildTree()`:
- After sorting, do a post-order traversal to compute `noteCount` for each folder node. For a folder, `noteCount` = count of non-folder children + sum of children's `noteCount`. This is a simple recursive function (~10 lines) applied to `roots` before return.

**Test file:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.test.ts`

Additional test cases:
- Folder with 3 direct notes has `noteCount: 3`
- Nested folders accumulate counts (parent gets sum of all descendants)
- Empty folder has `noteCount: 0`
- Root-level files have `noteCount` undefined

#### Step 4: Update `filterTree` to use fuzzy matching

**File:** `FileTreePanel.tsx`

Replace the current `filterTree` function:
- Import `fuzzyMatch` from `../../utils/fuzzyMatch`
- Change `n.title.toLowerCase().includes(q)` to `fuzzyMatch(q, n.title) !== null`
- Store match indices on a transient basis -- add an optional `matchIndices?: number[]` field to `TreeNode` (set during filtering, used for rendering highlights)
- `filterTree` becomes `fuzzyFilterTree` which clones matching nodes with their `matchIndices` populated

#### Step 5: Update `FileTreeNode` rendering

**File:** `FileTreePanel.tsx`

Replace the folder rendering:
- Replace `<span className="tree-chevron ...">` with `<ChevronIcon isOpen={isExpanded} />` from `fileTreeIcons.tsx`
- Add `<FolderIcon isOpen={isExpanded} />` after the chevron
- After the folder name label, add `<span className="tree-folder-count">(N)</span>` using `node.noteCount` (only if > 0)

Replace the file rendering:
- Replace `<span className="tree-type-dot ...">` with `<NoteTypeIcon noteType={node.note_type} />`
- If `node.matchIndices` is set, use `highlightFuzzyMatch(node.title, node.matchIndices)` instead of plain `node.title`

Always-render children for animation:
- Change `{isExpanded && node.children.map(...)}` to always render children wrapped in the animation container:
```tsx
<div className={`tree-children-wrapper${isExpanded ? " tree-children-wrapper--open" : ""}`}>
  <div className="tree-children-inner">
    {node.children.map((c) => (
      <FileTreeNode key={c.fullPath} node={c} depth={depth + 1} onContextMenu={onContextMenu} />
    ))}
  </div>
</div>
```

Add hover actions button:
- Add a `<button className="tree-item-actions" onClick={...} title="Actions">` containing `<MoreHorizontal size={14} />` (from Lucide) at the end of each `.tree-item`
- onClick handler: call `onContextMenu` with the button's bounding rect to position the context menu

Add indent guides:
- Wrap children in `<div className="tree-children" style={{ marginLeft: ... }}>` with a left border. The margin positions the border at the parent's icon column. This naturally gives one vertical line per depth level.

#### Step 6: CSS changes in App.css

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

New/modified rules (added near line 1066, in the file tree section):

```css
/* Indent guides via tree-children border */
.tree-children {
  border-left: 1px solid var(--border-color);
  margin-left: 19px; /* aligns with parent's icon center */
}

/* Expand/collapse animation */
.tree-children-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 150ms ease;
}
.tree-children-wrapper--open {
  grid-template-rows: 1fr;
}
.tree-children-inner {
  overflow: hidden;
  min-height: 0;
}

/* Folder note count badge */
.tree-folder-count {
  color: var(--text-muted);
  font-size: var(--ui-font-xs);
  font-weight: 400;
  margin-left: 4px;
  flex-shrink: 0;
}

/* Hover actions button */
.tree-item-actions {
  opacity: 0;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0 2px;
  margin-left: auto;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  border-radius: 3px;
  transition: opacity 0.1s;
}
.tree-item:hover .tree-item-actions {
  opacity: 1;
}
.tree-item-actions:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Fuzzy match highlight */
.tree-match-highlight {
  background: color-mix(in srgb, var(--accent) 30%, transparent);
  border-radius: 2px;
  color: inherit;
}

/* Chevron icon rotation */
.tree-chevron-icon {
  flex-shrink: 0;
  transition: transform 0.15s ease;
  color: var(--text-muted);
}
.tree-chevron-icon--open {
  transform: rotate(90deg);
}
```

Remove the old `.tree-chevron`, `.tree-chevron::before`, `.tree-chevron--open::before` rules (lines 1100-1123).

Remove the `.tree-type-dot` and `.dot-*` rules (lines 1124-1141) since icons now handle colors via inline styles from `NOTE_TYPE_COLORS`.

Update `.tree-item` gap from `5px` to `4px` to keep compact spacing with the slightly larger icons.

#### Step 7: Update the depth-based padding

With indent guides handled by `tree-children` border-left + margin-left, the tree items no longer need depth-based `paddingLeft`. Instead:
- Root-level items get `paddingLeft: 8px`
- Nested items inherit their position from the parent's `tree-children` container
- The `depth` prop to `FileTreeNode` is still needed for the `style` prop but the calculation changes to just `paddingLeft: 8px` for all items (the nesting is structural via DOM hierarchy + margin-left on `tree-children`)

Actually, reconsidering: the current flat approach (depth-based padding) is simpler and the indent guide can be done with absolute-positioned pseudo-elements rather than structural nesting. Let me revise:

Keep depth-based padding as-is. For indent guides, add a `::before` pseudo-element on `.tree-item` at depth > 0 that draws vertical lines. Pass depth via a CSS custom property: `style={{ paddingLeft: \`${8 + depth * 12}px\`, '--depth': depth } as React.CSSProperties }`. Then in CSS:

```css
.tree-item::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  /* Draw guide at each depth level */
}
```

But a single pseudo-element cannot draw multiple guide lines at each ancestor level. The cleanest approach: add a small `IndentGuides` component that renders `depth` number of thin vertical `<span>` elements, each positioned at the corresponding depth column. These are lightweight inline-block spans with no text content.

Actually, the simplest pragmatic approach: render `depth` thin `<span className="indent-guide" />` elements before the chevron/icon in each tree item. Each span is `width: 12px` (matching the indent step), `height: 100%`, with a `border-right: 1px solid var(--border-color)` centered. This gives visual guides at every depth level with minimal complexity.

```tsx
{Array.from({ length: depth }, (_, i) => (
  <span key={i} className="indent-guide" aria-hidden="true" />
))}
```

CSS:
```css
.indent-guide {
  display: inline-block;
  width: 12px;
  height: 100%;
  position: relative;
  flex-shrink: 0;
}
.indent-guide::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--border-color);
}
```

With this approach, remove the depth-based `paddingLeft` calculation and instead use a fixed `paddingLeft: 8px` since the indent guides provide the visual offset.

#### Step 8: Tests

**New test file:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/fuzzyMatch.test.ts`
- ~10 test cases for `fuzzyMatch` and `highlightFuzzyMatch`

**Updated test file:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.test.ts`
- Add ~5 test cases for `noteCount` computation in `buildTree`
- Import and test the new `fuzzyFilterTree` or verify that `filterTree` with fuzzy matching works correctly

Estimated new test count: ~15 new tests.

#### Step 9: Documentation Updates

Update `CLAUDE.md` Current Status section to mention:
- File tree modernization: Lucide icons, indent guides, note count badges, hover actions, expand/collapse animation, fuzzy filter with match highlighting

---

### Implementation Sequence

1. **Step 0** -- Install lucide-react (npm dependency)
2. **Step 1** -- Create `fileTreeIcons.tsx` (no existing code changes, purely additive)
3. **Step 2** -- Create `fuzzyMatch.ts` + tests (purely additive)
4. **Step 3** -- Add `noteCount` to `buildTree` + tests (small change to existing function)
5. **Steps 4-7** -- Update `FileTreeNode` rendering + CSS (the main integration step, touches FileTreePanel.tsx and App.css)
6. **Step 8** -- Verify all tests pass
7. **Step 9** -- Update documentation

Steps 1-3 are independent and can be done in parallel. Steps 4-7 depend on 1-3 and should be done together as one cohesive change.

### Potential Challenges

1. **Expand/collapse animation with conditional rendering**: The current code uses `{isExpanded && ...}` which unmounts children. The CSS grid animation requires children to always be mounted. This means more DOM nodes exist at once. For a tree with ~200 notes this is fine, but if performance becomes an issue, a `lazy` flag could skip rendering children until a folder is expanded for the first time, then keep them mounted thereafter.

2. **Indent guide alignment**: The guide lines must visually align with the parent's icon. The `12px` indent step and `50%` centering within each guide span should line up correctly, but may need 1-2px tweaking after visual inspection.

3. **Missing `useUndoStore` import**: The current FileTreePanel.tsx uses `useUndoStore` on lines 402 and 411 without importing it. This should be fixed as part of this work (add `import { useUndoStore } from "../../stores/undoStore";`).

4. **CSS specificity**: The old `.tree-type-dot` and `.dot-*` rules must be fully removed to avoid conflicts with the new icon-based rendering. The `.tree-chevron` rules should also be removed since the Lucide `ChevronRight` icon replaces the CSS triangle.

5. **Theme compatibility**: All new colors use existing CSS variables (`--border-color`, `--text-muted`, `--accent`, `--bg-tertiary`). The icon colors come from `NOTE_TYPE_COLORS` which are hex values that work in both themes (they are already theme-independent, identical in light and dark mode per the CSS variable definitions).

---

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx` - Core file to modify: rendering, tree data model, filtering, all 6 features integrate here
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` - All styling changes: indent guides, animation, hover actions, match highlights, removal of old dot/chevron CSS (lines 1066-1141)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts` - Import source for `NOTE_TYPE_COLORS` to keep type colors DRY between graph and file tree icons
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.test.ts` - Existing tests to extend with noteCount and fuzzy filter tests
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json` - Add `lucide-react` dependency

---

