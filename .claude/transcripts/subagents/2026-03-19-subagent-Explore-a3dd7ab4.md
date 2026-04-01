# 2026-03-19 — Subagent Transcript: Explore

**Date:** 2026-03-19 11:33:45
**Agent:** Explore
**Agent ID:** a3dd7ab4413978c21
**Parent Session:** b8fc4e28-f342-4358-9cfd-bc292315089a

---

## User

Explore the tab header/tab bar implementation in this React/TypeScript Tauri app. I need to understand:

1. The TabHeader/TabBar component - find the exact file and understand its structure
2. How tabs are stored in state (Zustand store) - the tab order, active tab, etc.
3. Any existing drag-and-drop libraries already in package.json (like dnd-kit, react-beautiful-dnd, etc.)
4. The CSS/styling for tabs

Focus on `crates/app/src/` and `crates/app/src-tauri/`. Be thorough - read the full tab component and relevant store.

---

## Assistant

I'll help you explore the tab header/tab bar implementation. Let me start by searching for tab-related files in the codebase.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*[Tt]ab*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/**/*[Tt]ab*"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/package.json"}`

---

## Assistant

Let me find the package.json file first:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -name \"package.json\" -type f | grep -v node_modules | grep -v target"}`

---

## Assistant

Now let me read the key files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabActions.ts"}`

---

## Assistant

Now let me look for CSS styling and any other related files:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*tab*\" -o -name \"*Tab*\" | grep -v node_modules"}`

---

## Assistant

Now let me look for CSS related to tabs:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*.css\" -type f | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","limit":300}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","limit":600,"offset":300}`

---

## Assistant

Now let me check the tabStore test to understand the tab state better:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.test.ts","limit":100}`

---

## Assistant

Perfect! Now let me search for any drag-and-drop libraries or implementations:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"dnd-kit\\|react-beautiful-dnd\\|react-dnd\\|sortable\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app --include=\"package.json\" --include=\"*.tsx\" --include=\"*.ts\" 2>`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"drag\\|drop\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.tsx\" --include=\"*.ts\" 2>/dev/null | head -10"}`

---

## Assistant

Great! There's a file tree dnd file. Let me also check if there's anything in the file tree component:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*FileTree*\" -o -name \"*fileTree*\" | grep -v test"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/fileTreeDnd.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","limit":100}`

---

## Assistant

Perfect! Now I have enough information. Let me compile a comprehensive exploration report:

## Exploration Report: Tab Header/Tab Bar Implementation

### 1. TabBar Component Location & Structure

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx`

The TabBar is a React component that displays open tabs with the following features:
- **Renders tabs** from `useTabStore` state (lines 100-101)
- **Four main sections:**
  1. **Context Menu**: Right-click menu with "Close This Tab", "Close Tabs to the Right", "Close All Tabs" (lines 19-97)
  2. **Tab Items**: Flex container displaying each tab (lines 193-215)
  3. **New Tab Button**: Plus button to create untitled tabs (lines 216-223)
  4. **Event Handlers**: 
     - Left-click to activate tabs
     - Middle-click (aux click) to close tabs
     - Right-click to show context menu
     - Close button (×) with event delegation

**Key Component Properties:**
- **Tab display**: Shows icon, title, dirty indicator dot, close button
- **Active Tab**: Uses `aria-selected` and CSS class `.tab-item--active`
- **Dirty State**: Shows blue dot when tab has unsaved changes
- **Mouse Events**: Full support for activation, closing, and context menus

### 2. Tab State Management (Zustand Store)

**Files:** 
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts` (main store)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabActions.ts` (utility functions)

**TabState Interface (lines 13-29 of tabStore.ts):**
```typescript
interface TabState {
  id: string;                          // file path or synthetic ID for untitled
  path: string;
  kind: "note" | "plain-file" | "untitled" | "pdf";
  title: string;
  noteType: string | null;             // null for plain files, untitled, PDFs
  editedBody: string | null;
  editedFrontmatter: FmSnapshot;
  isDirty: boolean;
  conflictState: "none" | "external-change";
  fmUndoStack: FmSnapshot[];
  fmRedoStack: FmSnapshot[];
  viewMode: "edit" | "preview" | "raw";
  scrollTop: number;
  cursorPos: number;
}
```

**Tab Order Storage:**
- **Array-based**: `tabs: TabState[]` (line 32)
- **Order Preservation**: Tabs maintain insertion order in the array
- **Active Tab Tracking**: `activeTabId: string | null` (line 33)

**Tab Store Methods (lines 36-48):**
- `openTab()`: Create or activate tab, insert after active tab
- `createUntitledTab()`: Create new untitled with counter
- `closeTab()`: Remove tab and navigate to next
- `closeActiveTab()`, `closeOtherTabs()`, `closeTabsToRight()`, `closeAllTabs()`: Batch operations
- `activateTab()`: Switch active tab
- `updateTabState()`: Partial updates (per-tab editor state)
- `getTab()`: Lookup by ID
- `renamePath()`: Update when file renamed
- `renamePathPrefix()`: Bulk rename for folder moves
- `reset()`: Clear all tabs

**Key Behavior (tabStore.ts lines 75-90):**
New tabs insert **after the currently active tab**, not at the end:
```typescript
openTab: (path, kind, title, noteType) => {
  const activeIndex = tabs.findIndex((t) => t.id === activeTabId);
  const insertAt = activeIndex >= 0 ? activeIndex + 1 : tabs.length;
  next.splice(insertAt, 0, newTab);
  set({ tabs: next, activeTabId: path });
}
```

### 3. Drag-and-Drop Libraries in package.json

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json`

**Result:** **NO third-party drag-and-drop library is installed**

Current dependencies (lines 14-40):
- `@codemirror/*` (editor)
- `@tauri-apps/*` (desktop integration)
- `cytoscape` (graph)
- `react`, `react-dom`
- `react-resizable-panels` (panel resizing)
- `zustand` (state)
- `katex`, `mermaid` (rendering)
- `lucide-react` (icons)
- `pdfjs-dist` (PDF viewing)

**Note:** The file tree panel DOES have custom drag-and-drop logic (see section 4 below).

### 4. CSS/Styling for Tabs

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` (lines 386-493)

**Tab Bar Container (.tab-bar):**
```css
.tab-bar {
  display: flex;
  overflow-x: auto;           /* Horizontal scroll */
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  min-height: 40px;
  max-height: 40px;           /* Fixed height, prevents overflow */
  flex-shrink: 0;
  scrollbar-width: none;      /* Hide scrollbar */
}
.tab-bar::-webkit-scrollbar { display: none; }
```

**Individual Tab Item (.tab-item):**
```css
.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  border-right: 1px solid var(--border-color);
  white-space: nowrap;
  max-width: 220px;           /* Max width with truncation */
  min-width: 0;
  user-select: none;
  position: relative;
  flex-shrink: 0;             /* Prevent shrinking */
}
.tab-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}
```

**Active Tab Styling (.tab-item--active):**
```css
.tab-item--active {
  color: var(--text-primary);
  font-weight: 500;
  background: var(--bg-primary);
  box-shadow: inset 0 -3px 0 var(--accent);  /* Blue underline indicator */
}
```

**Tab Title (.tab-title):**
```css
.tab-title {
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;              /* Critical for flex wrapping */
}
```

**Dirty Indicator (.tab-dirty-dot):**
```css
.tab-dirty-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);  /* Blue dot */
  flex-shrink: 0;
}
```

**Close Button (.tab-close):**
```css
.tab-close {
  width: 18px;
  height: 18px;
  opacity: 0;                 /* Hidden by default */
  flex-shrink: 0;
}
.tab-item:hover .tab-close,
.tab-item--active .tab-close {
  opacity: 0.6;              /* Show on hover/active */
}
.tab-close:hover {
  opacity: 1 !important;
  background: var(--bg-tertiary);
}
```

**New Tab Button (.tab-new-btn):**
```css
.tab-new-btn {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  margin: 3px 4px;
  border-radius: 4px;
  background: transparent;
  opacity: 0.6;
}
.tab-new-btn:hover {
  opacity: 1;
  background: var(--bg-tertiary);
  color: var(--text-primary);
}
```

### 5. File Tree Drag-and-Drop Implementation (Related Context)

While not for tabs specifically, the codebase has custom DnD utilities in `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/fileTreeDnd.ts`:

- **`computeNewPath()`**: Calculate destination path
- **`isValidDrop()`**: Validate drop targets (prevent self-drops, cyclic drops)
- **`computeReorderedList()`**: Reorder array by drag position
- **`computeDropZone()`**: Determine before/into/after based on Y-coordinate (25/50/25 split for folders, 50/50 for files)
- **`initCustomOrderFromTree()`**: Snapshot visible order

This is pure utility code with no library dependencies — all drag/drop is implemented with native HTML5 DnD events.

### Summary Table

| Aspect | Details |
|--------|---------|
| **Component File** | `/crates/app/src/components/Editor/TabBar.tsx` |
| **Store File** | `/crates/app/src/stores/tabStore.ts` |
| **Store Type** | Zustand (create hook) |
| **Tab Order Storage** | Array (`tabs: TabState[]`) |
| **Active Tab Tracking** | `activeTabId: string \| null` |
| **DnD Library** | None (pure HTML5 events in file tree) |
| **CSS File** | `/crates/app/src/App.css` (lines 386-493) |
| **Tab Height** | 40px fixed |
| **Max Tab Width** | 220px |
| **Scroll Behavior** | Horizontal overflow with hidden scrollbar |
| **Active Indicator** | Blue inset box-shadow at bottom |
| **Dirty Indicator** | 6px blue dot |
| **Close Button** | Hidden by default, shows on hover/active |

---

