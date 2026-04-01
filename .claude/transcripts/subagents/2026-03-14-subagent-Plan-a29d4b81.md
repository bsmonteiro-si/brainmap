# 2026-03-14 — Subagent Transcript: Plan

**Date:** 2026-03-14 11:23:42
**Agent:** Plan
**Agent ID:** a29d4b818d46afea6
**Parent Session:** 37023488-d6c2-4fab-aa59-15ee7593e124

---

## User

Design an implementation plan for redesigning the BrainMap desktop app layout to be Obsidian-style. Here's the context:

## Current Layout
```
[Left Panel 60%: Graph/Files tabs at top]  |  [Right Panel 40%: Editor (60%) / Search (40%) vertically]
StatusBar at bottom
```

- `AppLayout.tsx` uses `react-resizable-panels` with outer horizontal group (graph 60% | right 40%) and inner vertical group (editor 60% | search 40%)
- UIStore has `treeOpen: false` (Graph default), `searchExpanded: boolean`
- Left panel has two tabs ("Graph" / "Files") rendered as `<div role="tablist">` inside the panel
- Both GraphView and FileTreePanel are kept mounted with CSS display toggle
- Search is in SearchPanel.tsx in the bottom-right
- StatusBar at the bottom with segment name, stats, settings gear, close button
- Cmd+B toggles between Graph/Files tabs
- Panel sizes persisted to `brainmap:panelSizes` localStorage

## Desired Layout (Obsidian-style)
Based on the Obsidian screenshot, the new layout should be:

```
[Icon Sidebar ~40px] | [Content Panel 30%: Files/Graph/Search] | [Editor 70%]
StatusBar at bottom
```

### Key changes:
1. **Vertical icon sidebar** on the far left (~40px wide, fixed, not resizable):
   - File explorer icon (active by default → shows Files)
   - Graph icon (shows Graph view)
   - Search icon (shows Search panel, moved from bottom-right)
   - Icons are stacked vertically, clicking one switches the content panel
   - Active icon gets visual indicator (like Obsidian's left border accent)

2. **Content panel** (left, ~30% of remaining space):
   - Shows whichever view is active: FileTreePanel, GraphView, or SearchPanel
   - Only one visible at a time (CSS display toggle to preserve Cytoscape state)
   - Collapsible (for focus mode)

3. **Editor panel** (right, ~70% of remaining space):
   - TabBar + EditorPanel (unchanged internally)
   - Gets more space than before

4. **Default state**: Files view active (not Graph), `treeOpen: true` equivalent
5. **Panel proportions**: 30-70 instead of 60-40
6. **Search moves** from bottom-right panel to left content panel (as a third sidebar option)
7. **Remove** the Graph/Files tab toggle from inside the left panel header
8. **Cmd+B** should toggle the content panel visibility (collapse/expand), not switch tabs

## Files to modify:
- `crates/app/src/components/Layout/AppLayout.tsx` - main layout restructure
- `crates/app/src/stores/uiStore.ts` - change state model (replace `treeOpen` boolean with `activeLeftTab: "files" | "graph" | "search"`)
- `crates/app/src/App.css` - new sidebar styling, layout CSS changes
- `crates/app/src/App.tsx` - update Cmd+B shortcut behavior
- `crates/app/src/components/Search/SearchPanel.tsx` - may need minor adjustments for new context

## Constraints:
- Must preserve Cytoscape state (keep GraphView mounted with CSS display toggle)
- Must preserve all existing functionality (focus mode, context menus, file tree toolbar, etc.)
- Must update panel size defaults and persistence
- Keep react-resizable-panels for the content/editor split (but sidebar is fixed width)
- Tests may need updates (Vitest unit tests reference UIStore state)

Please provide a detailed implementation plan with specific code changes needed.

---

## Assistant



I'll explore the codebase thoroughly to understand the current layout, state management, and all the pieces that need to change.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Let me read more of the CSS file and explore related components.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/.claude/projects/-Users-bsmonteiro-Desktop-Personal-brainmap/37023488-d6c2-4fab-aa59-15ee7593e124/tool-results/toolu_013cNDzwA3s4vn1uH4SPsDS2.txt","offset":1,"limit":20`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Search/SearchPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/StatusBar/StatusBar.tsx"}`

---

## Assistant

Now let me look at the CSS for left-panel-tabs, search panel, file tree, and find test files that reference the relevant state.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"left-panel-tab|\\.left-panel","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"treeOpen|toggleTree|searchExpanded|toggleSearchExpanded","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"setGraphFocus.*treeOpen","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"treeOpen|toggleTree|searchExpanded","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","glob":"*.test.*","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":50}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"Focus in Graph|focusInGraph|setGraphFocus","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

Let me check how GraphView uses `treeOpen` and how Focus in Graph works with `setGraphFocus`.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"treeOpen|setGraphFocus|graphFocusPath","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx","output_mode":"content","-C":3}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"setGraphFocus|Focus in Graph","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content","-C":5}`

---

## Assistant

Now let me look at the CSS for search-panel and the left-panel-tabs styles.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.search-panel|\\.left-panel-tab|section-toggle","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":10}`

---

## Assistant

Now I have a thorough understanding of the codebase. Let me check a few more things -- how the GraphView uses `treeOpen` for resize, and the test files.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.test.*","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.test.ts"}`

---

## Assistant

I now have a comprehensive understanding of all the pieces. Let me also check how `treeOpen` is used in GraphView's resize logic and in `setGraphFocus`.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx","offset":135,"limit":20}`

---

## Assistant

I have all the information I need. Here is the complete implementation plan.

---

## Implementation Plan: Obsidian-Style Layout Redesign

### Overview

This redesign transforms the BrainMap desktop app from a two-panel horizontal split (Graph/Files | Editor/Search) into an Obsidian-style three-column layout: a fixed-width icon sidebar, a switchable content panel, and the editor. Search moves from the bottom-right vertical split into the content panel as a third sidebar option.

### Step 1: UIStore State Model Changes

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`

**Changes:**

1. Replace `treeOpen: boolean` with `activeLeftTab: "files" | "graph" | "search"`.
   - Default value: `"files"` (Files view active by default, unlike the current Graph default).

2. Replace `searchExpanded: boolean` with leveraging `activeLeftTab === "search"`.
   - Remove `searchExpanded` from the state interface entirely.
   - Remove `toggleSearchExpanded` action.

3. Add `leftPanelCollapsed: boolean` (default `false`) to control content panel visibility (replaces the `focusMode` collapse behavior for the left panel specifically).
   - Keep `focusMode` as-is for the Escape key behavior, but have `focusMode` set `leftPanelCollapsed: true` when activated and `leftPanelCollapsed: false` when deactivated.

4. Replace `toggleTree()` with `setActiveLeftTab(tab: "files" | "graph" | "search")` and `toggleLeftPanel()`.
   - `setActiveLeftTab`: sets `activeLeftTab` to the given value and ensures `leftPanelCollapsed: false` (expands panel if collapsed).
   - `toggleLeftPanel`: toggles `leftPanelCollapsed`.

5. Update `PanelSizes` interface:
   - Remove `graph` and `search` keys (no longer separate panels).
   - Rename to `{ content?: number; editor?: number }` with defaults 30 and 70.
   - The `right` key is no longer needed either.

6. Update `setGraphFocus`:
   - Currently sets `treeOpen: false` (switches to Graph tab). Change to `activeLeftTab: "graph"`.

7. Update `resetWorkspaceState` to reset `activeLeftTab: "files"`, `leftPanelCollapsed: false`.

8. Update `toggleFocusMode` to also set `leftPanelCollapsed` accordingly.

### Step 2: Create IconSidebar Component

**New file:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/IconSidebar.tsx`

This is a new component rendering the fixed-width vertical icon sidebar.

**Structure:**
- A `<nav>` element with class `icon-sidebar`, ~40px wide, fixed (not resizable).
- Three icon buttons stacked vertically:
  - File explorer icon (Lucide `FileText` or `Files` icon) -- activates Files view
  - Graph icon (Lucide `GitFork` or `Network` icon) -- activates Graph view
  - Search icon (Lucide `Search` icon) -- activates Search view
- Each button gets an `active` class when its tab matches `activeLeftTab`.
- Active indicator: left border accent (3px solid `var(--accent)`) on active icon, similar to Obsidian.
- Clicking the already-active icon toggles `leftPanelCollapsed` (collapse/expand the content panel).
- Background: `var(--bg-secondary)` with a right border.

**Props:** None (reads directly from UIStore).

### Step 3: Restructure AppLayout

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx`

**Current structure:**
```
<Group horizontal>
  <Panel (graph/files)>
    <tablist>Graph | Files</tablist>
    <GraphView style={display: treeOpen ? none : flex} />
    <FileTreePanel style={display: treeOpen ? flex : none} />
  </Panel>
  <Separator />
  <Panel (right)>
    <Group vertical>
      <Panel (editor)><EditorPanel /></Panel>
      <Separator />
      <Panel (search)><SearchPanel /></Panel>
    </Group>
  </Panel>
</Group>
<StatusBar />
```

**New structure:**
```
<div className="app-layout-root" style={display: flex}>
  <IconSidebar />
  <Group horizontal className="app-layout">
    <Panel (content) collapsible>
      <GraphView style={display: activeLeftTab === "graph" ? flex : none} />
      <FileTreePanel style={display: activeLeftTab === "files" ? flex : none} />
      <SearchPanel style={display: activeLeftTab === "search" ? flex : none} />
    </Panel>
    <Separator />
    <Panel (editor)>
      <EditorPanel />
    </Panel>
  </Group>
</div>
<StatusBar />
```

**Specific changes:**

1. Remove the `<div role="tablist">` with Graph/Files tab buttons entirely.
2. Remove the inner vertical `<Group>` (editor/search split) -- editor is now a single full-height panel.
3. Add `<IconSidebar />` as a flex sibling before the `<Group>`.
4. The content panel shows all three components (GraphView, FileTreePanel, SearchPanel) with CSS display toggle based on `activeLeftTab`.
5. The content panel is `collapsible` and controlled by `leftPanelCollapsed`.
6. Default sizes: content 30%, editor 70%.
7. Remove `searchPanelRef` (no longer a separate collapsible panel).
8. Update `handleOuterLayout` callback -- now saves `content` and `editor` sizes instead of `graph` and `right`.
9. Remove `handleRightLayout` callback entirely.
10. Update the `focusMode` effect to collapse/expand the content panel.
11. Keep the `PANEL_IDS` constant but update values: `{ content: "content", editor: "editor" }`.

### Step 4: Update SearchPanel for Sidebar Context

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Search/SearchPanel.tsx`

**Changes:**

1. Remove the `section-toggle` button (the expand/collapse toggle) -- search is now always expanded when its tab is active.
2. Remove the `expanded` / `toggleExpanded` usage from UIStore.
3. The search panel always renders its full UI (input + filters + results) since visibility is controlled by the parent CSS display toggle.
4. Add a header matching the FileTreePanel style (e.g., "Search" with appropriate styling).

### Step 5: Update Cmd+B Shortcut

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx`

**Current behavior:** `Cmd+B` calls `toggleTree()` (switches between Graph/Files tabs).

**New behavior:** `Cmd+B` calls `toggleLeftPanel()` (collapses/expands the content panel).

Change line ~155:
```typescript
// Old: useUIStore.getState().toggleTree();
// New: useUIStore.getState().toggleLeftPanel();
```

### Step 6: Update GraphView treeOpen Reference

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx`

**Changes:**

1. Replace `treeOpen` subscription with `activeLeftTab`:
   ```typescript
   const activeLeftTab = useUIStore((s) => s.activeLeftTab);
   ```
2. Update the resize effect (lines 139-150): instead of triggering on `!treeOpen`, trigger on `activeLeftTab === "graph"`:
   ```typescript
   useEffect(() => {
     if (activeLeftTab === "graph") {
       const cy = cyRef.current;
       if (cy) {
         cy.resize();
         if (!hasBeenFittedRef.current && cy.nodes().length > 0) {
           cy.fit(undefined, 40);
           hasBeenFittedRef.current = true;
         }
       }
     }
   }, [activeLeftTab]);
   ```
3. Update the folder node click handler (line 188): `setGraphFocus` already sets `activeLeftTab: "graph"` after Step 1, so no change needed there.

### Step 7: Update FileTreePanel Focus in Graph

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`

The `handleFocusInGraph` function (line 228-234) calls `setGraphFocus()` which already atomically sets `activeLeftTab: "graph"` after Step 1 changes. No additional changes needed here since `setGraphFocus` handles the tab switch.

### Step 8: CSS Changes

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

**Add new styles:**

```css
/* ── App Layout Root ─────────────────────────────────────────── */
.app-layout-root {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* ── Icon Sidebar ────────────────────────────────────────────── */
.icon-sidebar {
  width: 40px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 8px;
  gap: 4px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
}

.icon-sidebar-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-muted);
  border-left: 3px solid transparent;
  transition: color 0.12s, background 0.12s;
}

.icon-sidebar-btn:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.icon-sidebar-btn.active {
  color: var(--accent);
  border-left-color: var(--accent);
}
```

**Remove/update existing styles:**
- Remove `.left-panel-tabs` and `.left-panel-tab` CSS rules (lines 1105-1134) -- no longer used.
- The `.search-panel` `.section-toggle` usage can remain in CSS but will no longer be rendered by SearchPanel.
- Update `.app-layout` to not assume it is the full-height root -- it now sits inside `.app-layout-root` alongside the sidebar.

### Step 9: Update Panel Size Persistence

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`

The `PanelSizes` interface changes from `{ graph?, right?, editor?, search? }` to `{ content?, editor? }`. The localStorage key `brainmap:panelSizes` remains the same, but stored values will now use the new keys.

Handle migration gracefully: when loading stored sizes, if old keys (`graph`, `right`) exist but new keys (`content`, `editor`) do not, map `graph` to `content` and `right` to `editor`. This avoids a jarring first-load experience for existing users.

### Step 10: Update Tests

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.test.ts`

No existing tests directly test `treeOpen` or `toggleTree`, so no test breakage expected there. However:

1. Add tests for the new `activeLeftTab` state:
   - Default is `"files"`
   - `setActiveLeftTab("graph")` sets it to `"graph"` and ensures `leftPanelCollapsed: false`
   - `setActiveLeftTab("search")` works correctly
   - `toggleLeftPanel()` toggles `leftPanelCollapsed`

2. Add test for `setGraphFocus` setting `activeLeftTab: "graph"` instead of `treeOpen: false`.

3. Add tests for panel collapse behavior:
   - `toggleFocusMode()` sets `leftPanelCollapsed: true` when entering focus mode
   - `toggleFocusMode()` sets `leftPanelCollapsed: false` when exiting focus mode

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphFocusFilter.test.ts`
- No changes needed -- this tests pure filtering logic, not UI state.

### Step 11: Update CLAUDE.md Documentation

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/CLAUDE.md`

Update the "Current Status" section to reflect:
- Layout redesign: Obsidian-style three-column layout (icon sidebar | content panel | editor)
- Icon sidebar with Files/Graph/Search switching
- Search moved from bottom-right split to left content panel
- Cmd+B toggles content panel visibility
- Default panel proportions 30/70

### Dependency Graph / Sequencing

1. **Step 1** (UIStore) must come first -- everything else depends on the new state model.
2. **Step 2** (IconSidebar) can be done in parallel with Steps 3-4 but is needed before integration.
3. **Step 3** (AppLayout) depends on Steps 1 and 2.
4. **Step 4** (SearchPanel) depends on Step 1.
5. **Step 5** (App.tsx shortcuts) depends on Step 1.
6. **Step 6** (GraphView) depends on Step 1.
7. **Step 7** (FileTreePanel) depends on Step 1 (but likely no code changes needed).
8. **Step 8** (CSS) can be done alongside Steps 2-3.
9. **Step 9** (Panel sizes) is part of Step 1.
10. **Step 10** (Tests) comes after all functional changes.
11. **Step 11** (Docs) comes last.

### Potential Challenges

1. **Cytoscape state preservation**: The GraphView must remain mounted with CSS `display` toggle. The current pattern already does this (display none/flex based on `treeOpen`). Changing the condition to `activeLeftTab === "graph"` preserves this behavior identically.

2. **SearchPanel state**: Currently SearchPanel maintains local state (query, results, typeFilter) that persists across expand/collapse because it stays mounted. In the new layout, SearchPanel will also stay mounted (CSS display toggle), so all local state is preserved when switching between tabs.

3. **Focus mode interaction**: Currently focus mode collapses the `graphPanelRef`. In the new layout, it should collapse the content panel ref. The `leftPanelCollapsed` state + panel ref collapse/expand keeps this clean.

4. **Panel size migration**: Old localStorage values use `graph`/`right`/`editor`/`search` keys. New layout uses `content`/`editor`. The migration logic in `loadStoredSizes` handles this gracefully.

5. **Sidebar not resizable**: The icon sidebar is a fixed-width flex element outside the `react-resizable-panels` Group. This is intentional -- Obsidian's sidebar is also fixed width.

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts` - Core state model: replace treeOpen/searchExpanded with activeLeftTab/leftPanelCollapsed, update actions and PanelSizes
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx` - Main layout restructure: remove tab header, remove inner vertical group, add IconSidebar, three-way CSS display toggle
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` - New icon sidebar styles, remove left-panel-tabs styles, update layout root
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx` - Replace treeOpen with activeLeftTab for Cytoscape resize logic
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx` - Update Cmd+B shortcut from toggleTree to toggleLeftPanel

---

