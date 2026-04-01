# 2026-03-13 — Subagent Transcript: Explore

**Date:** 2026-03-13 16:17:16
**Agent:** Explore
**Agent ID:** a03f19e857387fec0
**Parent Session:** f01e497c-3ccb-42c9-90d5-5d4812fa9236

---

## User

Explore the BrainMap desktop app (crates/app/) to understand:

1. How notes are opened/navigated — find `openNote`, `setActiveNote`, or similar functions in the stores (likely editorStore, uiStore, graphStore). Show their full implementations.
2. How the graph highlights the currently active note — search for `activeNote`, `activePath`, `selectedNode`, or similar in graph-related files.
3. How keyboard shortcuts are currently registered — search for `useEffect` with `keydown`, `Cmd+`, `mod+`, or any keybinding system.
4. Check if there's already any history/navigation stack mechanism.

Be thorough — show the relevant code snippets with file paths and line numbers.

---

## Assistant

I'll explore the BrainMap desktop app to understand note navigation, graph highlighting, keyboard shortcuts, and any existing history mechanisms. Let me start by examining the key store files and related functionality.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -type f -name \"*.ts\" -o -name \"*.tsx\" | head -30"}`

---

## Assistant

Let me focus on the source files, not node_modules.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f \\( -name \"*.ts\" -o -name \"*.tsx\" \\) | sort"}`

---

## Assistant

Perfect. Now let me search for key navigation and store functions:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"openNote|setActiveNote","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"activeNote|activePath|selectedNode","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores","output_mode":"content"}`

---

## Assistant

Good start! Now let me get the full implementations:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

Now let me search for keyboard shortcuts and history/navigation mechanisms:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"keydown|keypress|keyboard|shortcut|useEffect.*key","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"history|navigation|stack|back|forward|Cmd\\+|mod\\+","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

Now let me examine the key files for keyboard shortcuts:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

Good! Now let me check the App.tsx and CommandPalette for global keyboard shortcuts:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/CommandPalette/CommandPalette.tsx"}`

---

## Assistant

Now let me check the graph view for graph highlighting and explore if there's any nav history:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx","limit":150}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"history|previous|next|back|forward|stack","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"files_with_matches"}`

---

## Assistant

Let me continue reading GraphView to see the node selection highlighting:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx","offset":150,"limit":250}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts"}`

---

## Assistant

Let me get the rest of the GraphView highlighting section:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx","offset":390,"limit":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts"}`

---

## Assistant

Now let me check the cmFormatting and cmLinkNavigation files to understand all keyboard shortcuts:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmLinkNavigation.ts","limit":80}`

---

## Assistant

Perfect! I now have a comprehensive understanding. Let me provide a detailed summary of my findings.

## Comprehensive Exploration Report: BrainMap Desktop App Navigation & Highlighting

### 1. **Note Opening and Navigation**

**Primary Function: `openNote` in EditorStore**
- **File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts` (lines 41-68)
- **Implementation**:
  - Checks if the target note is already active; returns early if so
  - Auto-saves dirty content if auto-save is enabled
  - Clears edit state and sets `isLoading: true`
  - Calls `api.readNote(path)` and stores result in `activeNote`
  - Returns any load errors via log (not throwing)

**Secondary Function: `openPlainFile`**
- **File**: Same file (lines 70-95)
- Similar pattern for opening non-markdown files

**Graph Node Selection**
- **File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts` (lines 51-52)
- Function: `selectNode(path: string | null)` — stores path in `selectedNodePath` state
- Used by graph tap handler (line 190 in GraphView) and command palette (line 69 in CommandPalette)

### 2. **Graph Highlighting of Active Note**

**Node Visual Inversion**
- **File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx` (lines 393-435)
- **Mechanism**:
  - When `selectedNodePath` changes, the effect clears all previous highlighting
  - Finds the node by ID in Cytoscape: `cy.getElementById(selectedNodePath)`
  - Applies visual inversion:
    - Sets `background-color` to the node's type color (`node.data("color")`)
    - Sets `background-image` to white icon (`node.data("iconSvgWhite")`)
  - Connected edges are marked with class `highlighted`
  - Neighborhood nodes marked with class `highlighted`
  - All non-neighbors dimmed (opacity 0.25) via `hover-dim` class
  - Stores previous node ID in `prevInvertedNodeIdRef` to restore it on next selection

**CSS Styles for Selection**
- **File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts` (lines 80-87, 156-198)
- `node:selected` selector: larger size (28px), enhanced shadow
- `node.highlighted` class: medium size (22px), shadow opacity 0.85
- `node.hover-dim` class: opacity 0.25 for non-neighbors
- `node.hover-bright` class: shadow opacity 0.95 for neighbors

**Neighborhood Highlight on Hover**
- **File**: GraphView.tsx (lines 227-287)
- On mouse-over a node:
  - Dims all elements with `hover-dim` class
  - Brightens neighborhood with `hover-bright` class
  - Shows rich tooltip with node info (lazy-loaded tags/summary)
  - Creates pulse effect via shadow-blur/shadow-opacity styling
- On mouse-out: clears hover state, but preserves click-based neighborhood highlight if a node is selected

### 3. **Keyboard Shortcuts Registration**

**Global Shortcuts Handler**
- **File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx` (lines 66-138)
- Registered via `window.addEventListener("keydown", handleKeyDown)` in useEffect
- **All Shortcuts**:
  - `Cmd+P` / `Ctrl+P`: Open command palette
  - `Cmd+N` / `Ctrl+N`: Open create note dialog
  - `Cmd+S` / `Ctrl+S`: Save active note
  - `Cmd+B` / `Ctrl+B`: Toggle file tree (skipped if CodeMirror has focus)
  - `Cmd+,` / `Ctrl+,`: Open settings modal
  - `Cmd++` / `Cmd+=`: Zoom in
  - `Cmd+-`: Zoom out
  - `Cmd+0`: Reset zoom to 1.0
  - `Cmd+Z`: Undo (skipped if CodeMirror has focus; delegates to undoStore)
  - `Cmd+Y` or `Cmd+Shift+Z`: Redo (skipped if CodeMirror has focus)
  - `Escape`: Close settings, exit focus mode, or close command palette (priority-based)

**Editor-Specific Keybindings**
- **File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts`
- Defined in `formattingKeymap` array, merged into CodeMirror keymap in MarkdownEditor.tsx (line 83):
  - `Cmd+B`: Bold (toggles `**` wrapper)
  - `Cmd+I`: Italic (toggles `*` wrapper)
  - `Cmd+Shift+X`: Strikethrough (toggles `~~` wrapper)
  - `Cmd+E`: Inline code (toggles `` ` `` wrapper)
  - `Cmd+K`: Insert link syntax
  - `Cmd+Shift+1/2/3`: H1/H2/H3 headings
  - Plus ordered/unordered list toggles

**Command Palette Keybindings**
- **File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/CommandPalette/CommandPalette.tsx` (lines 80-95)
- Arrow Up/Down: Navigate items
- Enter: Select highlighted item
- Escape: Close palette

**Link Navigation**
- **File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmLinkNavigation.ts` (lines 33-95)
- `Cmd+Click` / `Ctrl+Click` on markdown links `[label](path.md)` in editor
- Resolves relative paths, updates graph selection, opens note
- Mouse hover shows pointer cursor when Cmd/Ctrl held over links

### 4. **History & Navigation Stack Mechanism**

**No Traditional Browser-Style History**
- The app does NOT implement back/forward navigation like browsers do
- No navigation stack tracking which notes you've visited in order

**What Exists Instead**:

**Undo/Redo for File Operations** (Not Note Visits)
- **File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/undoStore.ts`
- Tracks file creation, deletion, and folder operations only
- **Actions supported**:
  - `create-note`: Can undo if not modified since creation
  - `delete-note`: Restores full snapshot
  - `create-folder`: Can undo if empty
  - `delete-folder`: Restores all notes with links
- Stack size: MAX 20 items (lines 8, 124)
- UI: `Cmd+Z` / `Cmd+Y` trigger undo/redo (with toast notifications)
- **NOT tracked**: which notes you opened/read

**Graph Focus (Subgraph Navigation)**
- **File**: uiStore.ts (lines 92-93, 129-130, 282-283)
- `graphFocusPath` and `graphFocusKind` state
- Right-click "Focus in Graph" on a note/folder filters graph to show only that node + direct neighbors
- `clearGraphFocus()` returns to full graph view
- This is spatial/structural navigation, not temporal

**Related Notes Sidebar**
- **File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx`
- Shows incoming/outgoing links from current note
- Clicking a related note calls `openNote()` directly
- Not history-based; content-based relationship navigation

**No "Previous/Next" or "Back" Button**
- Navigation is non-linear; you select a note via:
  - Command palette search
  - File tree click
  - Graph click
  - Link click in editor
  - Programmatic navigation after undo/redo

### Summary

The architecture prioritizes **direct, graph-based navigation** over sequential history. The graph node highlighting uses a combination of:
1. Cytoscape class-based styling (`highlighted`, `hover-dim`, `hover-bright`)
2. Imperative icon inversion (white icon on type-colored background)
3. Shadow/blur effects for emphasis

There is **no browser-like back/forward stack**, only **undo/redo for file mutations** and **graph focus for subgraph exploration**.

---

