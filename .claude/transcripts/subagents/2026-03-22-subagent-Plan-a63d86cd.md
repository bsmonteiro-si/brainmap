# 2026-03-22 — Subagent Transcript: Plan

**Date:** 2026-03-22 14:27:15
**Agent:** Plan
**Agent ID:** a63d86cd7512f2580
**Parent Session:** 5a4e73f3-9763-4aad-a8d8-60f48fd48e7c

---

## User

Design a plan for creating Canvas-specific reference documentation that new agents can use to avoid expensive codebase exploration.

## Context

The Canvas feature is one of the largest features in BrainMap (~1300 lines in CanvasEditor.tsx, ~800 in canvasNodes.tsx, ~300 in canvasTranslation.ts, ~250 lines of CSS). It uses @xyflow/react (React Flow) with JSON Canvas spec, has 4 custom node types, edge labels, auto-save, undo/redo, viewport persistence, context menus, keyboard shortcuts, and many UI store settings.

Currently, every new agent session that touches Canvas must do extensive exploration to understand:
- The component architecture and data flow
- State management patterns (refs, module-level maps, React Flow hooks, Zustand stores)
- The translation layer between JSON Canvas spec and React Flow
- Integration points with the rest of the app (tab system, file tree, keyboard shortcuts, graph store)
- UI store settings (~30+ canvas-specific settings)
- Auto-save mechanics and race condition prevention
- Node type architecture (shared toolbar, resize, handles, shapes)

## Existing Documentation Patterns

The project uses a layered documentation approach:
1. **CLAUDE.md** — concise project-wide conventions and pointers
2. **`docs/extension-guides/`** — step-by-step checklists with file paths (e.g., `add-file-type-editor.md`)
3. **`docs/decisions/`** — lightweight ADRs (~20 lines, RFC-style)
4. **`.claude/research/`** — pre-implementation research (specs, library facts, integration points)
5. **`.claude/agents/`** — role definitions for review agents (~65 lines each)
6. **Memory files** — persistent cross-session state

The research doc `.claude/research/canvas-integration.md` exists but was written PRE-implementation and is only 131 lines — it covers the JSON Canvas spec and initial React Flow plan, not the actual implementation details.

## Requirements

Design documentation that:
- Gives new agents immediate context without exploration
- Fits naturally into existing documentation patterns
- Covers architecture, patterns, conventions, and extension points
- Is maintainable (not too granular, won't go stale quickly)
- Addresses the most common agent tasks: fixing bugs, adding features, extending node types, changing save behavior, modifying toolbar/UI

## What I need from you

A detailed plan for:
1. Which files to create/update
2. What each file should contain (section outline)
3. The right level of detail for each file type
4. How to reference these from CLAUDE.md
5. Whether any existing files should be updated or replaced

---

## Assistant



I'll explore the codebase to understand the current documentation structure, the Canvas implementation, and the existing patterns before designing the plan.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/docs/","description":"List docs directory"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides/","description":"List extension guides"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/docs/decisions/","description":"List ADRs"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/research/","description":"List research docs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides/add-file-type-editor.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/research/canvas-integration.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/decisions/000-template.md"}`

---

## Assistant

Now let me explore the actual Canvas implementation to understand its full scope.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"wc -l /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/","description":"List editor components"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":100,"limit":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","offset":80,"limit":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":300,"limit":300}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","offset":280,"limit":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":600,"limit":400}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","offset":480,"limit":350}`

---

## Assistant

Let me read the remaining portions of CanvasEditor.tsx and look at the canvas shapes and UI store settings.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":999,"limit":315}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasShapes.ts"}`

---

## Assistant

Now let me check the UI store for canvas-specific settings and the existing extension guide and a representative ADR.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"canvas[A-Z]\\w*:","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/decisions/006-folder-nodes-virtual.md"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"wc -l /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.test.tsx","description":"Count test lines"}`

---

## Assistant

Now I have a thorough understanding of the codebase. Let me check one more thing -- the existing canvas CSS to understand the scope.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.canvas-","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"count"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"wc -l /Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides/add-file-type-editor.md","description":"Count extension guide lines"}`

---

## Assistant

I now have a complete picture of the Canvas implementation and the existing documentation patterns. Here is the plan.

---

## Plan: Canvas Reference Documentation

### Problem Analysis

The Canvas feature spans ~2,400 lines of TypeScript across 4 files, plus ~144 CSS class references, 25 UI store settings, and integration points in at least 6 other files (tabStore, uiStore, App.tsx, EditorPanel.tsx, TabBar.tsx, tabActions.ts, FileTreePanel.tsx, SettingsModal.tsx). The pre-implementation research doc (`canvas-integration.md`) is 131 lines and describes what was *planned*, not what was *built*. An agent doing any Canvas work currently must read all four source files end-to-end to build context -- a 2,400-line tax on every session.

### Design Principles

1. **Fit the existing doc hierarchy.** The project already has a clear taxonomy: CLAUDE.md (pointers), extension-guides (checklists), decisions (ADRs), research (pre-implementation). Canvas reference docs should not invent a new category but should use an existing slot -- or at most a natural extension of one.

2. **Optimize for the most common tasks.** Based on the feature's complexity, the most frequent agent tasks will be: (a) fixing a bug in a specific subsystem, (b) adding a new node type or shape, (c) changing save/undo behavior, (d) modifying the toolbar or context menu, (e) adding a new UI store setting. The docs should accelerate path-finding for each of these.

3. **Avoid duplicating source code.** The docs should describe *architecture, data flow, invariants, and extension points* -- not reiterate what the code says. Code-level detail goes stale fastest. Structural descriptions and invariant lists stay accurate across refactors.

4. **One primary file, not a directory.** The Canvas is one feature. Splitting it across multiple files creates a "which file do I read?" problem -- exactly what we are trying to avoid. A single reference doc of ~250-350 lines, organized with clear section headers, is more usable than 5 files of 60 lines each.

### Files to Create/Update

#### 1. NEW: `docs/canvas-architecture.md` (~300 lines)

This is the primary deliverable. It replaces the role that `canvas-integration.md` was supposed to serve but for the *as-built* system.

**Section outline:**

```
# Canvas Architecture Reference

## Overview
- Purpose: spatial curated views of notes using .canvas files
- JSON Canvas spec version, link to jsoncanvas.org/spec/1.0
- Library: @xyflow/react (React Flow v12)
- File inventory table: 4 source files + CSS, with line counts and responsibilities

## Component Hierarchy
- CanvasEditor (public export) → CanvasErrorBoundary → ReactFlowProvider → CanvasEditorInner
- CanvasPanelModeContext (unused today, reserved for split-pane canvas+editor)
- Node types registered at module level: NODE_TYPES object → { canvasFile, canvasText, canvasLink, canvasGroup }
- Edge types: EDGE_TYPES → { default: CanvasEdge }

## Data Flow
- ASCII diagram: .canvas file → JSON.parse → canvasToFlow() → React Flow state → user edits → flowToCanvas() → JSON.stringify → writePlainFile()
- Key invariant: JSON Canvas uses absolute positions; React Flow uses parent-relative for parented nodes. canvasToFlow/flowToCanvas handle conversion.
- Parent ordering: React Flow requires parent nodes to precede children in the array. canvasToFlow sorts accordingly.
- Edge markers: React Flow string marker IDs ("brainmap-arrow", "brainmap-arrow-#color") instead of MarkerType objects after load, because custom SVG markers are used for sizing/coloring.

## Translation Layer (canvasTranslation.ts)
- Type mapping tables: CANVAS_TO_RF_TYPE, RF_TO_CANVAS_TYPE
- canvasToFlow: JSON Canvas → React Flow nodes/edges
  - Node size: groups and fixed shapes (circle, diamond) use style.height; others use style.width only (height auto-grows via minHeight)
  - Group nodes get zIndex: -1
  - Parented nodes: absolute→relative position conversion
  - Edges: sourceHandle = fromSide, targetHandle = toSide + "-target" suffix (handles have separate source/target IDs)
  - Default toEnd = "arrow" (spec default)
- flowToCanvas: React Flow → JSON Canvas
  - Reverse position conversion (relative→absolute)
  - Width/height resolution priority: n.width > style.width > measured.width > 250
  - Height takes max of measured vs explicit (to avoid saving collapsed heights)
  - Only emits optional fields when non-default (e.g., shape != "rectangle", fontSize != 13)

## State Management
- Table of all refs and their purposes (saveTimerRef, lastSavedRef, dirtyRef, mountedRef, savingRef, nodesRef, edgesRef, pendingViewportRef, hasRestoredViewportRef, undoStackRef, redoStackRef, isUndoingRef, isDraggingRef, isResizingRef)
- Module-level state: pendingSaves Map, savedViewports Map (localStorage-backed)
- React Flow hooks: useNodesState, useEdgesState, useReactFlow, useNodesInitialized
- Zustand: ~25 settings from uiStore (all prefixed canvas*)
- No editorStore usage -- canvas is fully self-contained

## Auto-Save Mechanics
- Debounce: 1500ms (SAVE_DEBOUNCE_MS)
- Change detection: JSON.stringify(flowToCanvas(current)) compared to lastSavedRef
- Race condition prevention: savingRef guard prevents concurrent saves
- Save-on-unmount: checks pendingSaves map, calls doSaveRef.current()
- Cmd+S: window event "canvas:save" with path detail; cancels pending debounce timer
- Dirty tracking: dirtyRef (internal) + tabStore.updateTabState({isDirty}) for UI dot

## Undo/Redo
- Stack-based: undoStackRef/redoStackRef, max 30 entries (MAX_CANVAS_UNDO)
- Snapshots: JSON.stringify of entire nodes + edges arrays
- Snapshot triggers: drag start, resize start, add/remove node/edge -- NOT every intermediate position change
- isUndoingRef: prevents snapshot push during undo/redo replay
- After undo/redo: requestAnimationFrame → scheduleSave()
- Keyboard: Cmd+Z/Cmd+Y captured in capture phase; skipped when focus is in textarea/input

## Viewport Persistence
- localStorage key: "brainmap:canvasViewports"
- On load: restore saved viewport, or fitView for new canvas
- pendingViewportRef + nodesInitialized: viewport restore deferred until React Flow has measured nodes
- On unmount: persist current viewport (only if hasRestoredViewportRef is true -- avoids overwriting from transient mount cycles)

## Node Type Architecture (canvasNodes.tsx)
- All 4 node types share: FourHandles (8 handles: 4 source + 4 target, directional IDs), Resizer, CanvasNodeToolbar
- Resizer: autoHeight mode converts style.minHeight→height on resize start, back on resize end (so auto-expand still works)
- CanvasNodeToolbar: single selected only (hidden when selectedCount > 1), has delete, border color, bg color; text nodes add shape picker and text format picker
- Each node is memo'd
- FileNode: reads from graphStore for title/type/tags, double-click opens note, shows "missing reference" for broken links
- TextNode: double-click → editing textarea, Escape cancels, blur commits; shape-aware via data-shape attribute
- LinkNode: extracts hostname for display
- GroupNode: double-click label to edit, zIndex -1, acts as parent for contained nodes

## Shapes (canvasShapes.ts)
- Registry: CANVAS_SHAPES array of CanvasShapeDefinition objects
- 6 shapes: rectangle, rounded, circle, sticky, callout, diamond
- Fixed-size shapes (circle, diamond): use style.height instead of minHeight
- Adding a new shape: (1) add to CANVAS_SHAPES array, (2) add CSS for data-shape selector

## Edge Architecture
- Custom CanvasEdge component replaces default edge
- Features: bezier path, inline label editing (auto-prompted on new edge via data.isNew), toolbar on selection (edit label, delete, color)
- Color changes update both style.stroke AND marker IDs (to match arrow color)
- Label commit: sets edge.label; clears data.isNew flag

## Context Menus
- Pane context menu (right-click empty area): Add Text Card, Add Shaped Card, Add Note Reference, Add Group, Create New Note
- Element context menu (right-click node/edge): Duplicate, Group Selection, Ungroup, Delete
- Selection context menu: same as element
- Note picker in context menu: tabbed Notes/Files, filtered, max 30 results
- Counter-zoom compensation: menu positions multiplied by uiZoom

## Bottom Toolbar
- Pan/Select mode toggle (H/V keyboard shortcuts)
- Add text card (with shape dropdown caret)
- Add note reference (with picker popup)
- Add group
- Create new note (opens CreateNoteDialog, callback adds file node)

## Selection Toolbar
- Appears above selected nodes (>= 2 selected, not during drag)
- Group, Duplicate, Delete buttons + count badge
- Position: computed from bounding box of selected nodes, viewport-adjusted

## Keyboard Shortcuts
- H: pan mode, V: select mode
- Cmd+Z: undo, Cmd+Y / Cmd+Shift+Z: redo
- Cmd+D: duplicate selected
- Cmd+S: save (via custom event)
- Backspace/Delete: delete selected (React Flow built-in deleteKeyCode)

## Counter-Zoom Pattern
- Problem: global document.documentElement.style.zoom breaks React Flow's coordinate math (getBoundingClientRect vs mouse events)
- Solution: canvas container applies zoom: 1/uiZoom with scaled width/height
- Context menu positions: multiply clientX/clientY by uiZoom to compensate

## UI Store Settings Reference
- Table listing all 25 canvas* settings: name, type, default, description, CSS variable (if applicable)

## Integration Points
- Tab system: kind "canvas" in tabStore, routed in EditorPanel.tsx, TabBar.tsx, tabActions.ts
- App.tsx: Cmd+S dispatches "canvas:save" event, Cmd+W closes
- FileTreePanel.tsx: .canvas extension detection, "New Canvas" context menu item (if implemented)
- graphStore: FileNode reads node data for title/type/tags display
- SettingsModal.tsx: canvas theme and all canvas* settings
- CreateNoteDialog: createNoteOnCreatedCallback in uiStore for "Create New Note" flow

## Common Tasks Quick Reference
- Fix a node rendering bug: canvasNodes.tsx, find the *NodeInner component
- Fix save/auto-save issue: CanvasEditor.tsx, search for doSave/scheduleSave
- Fix translation/serialization bug: canvasTranslation.ts
- Add a new shape: canvasShapes.ts + App.css (see shape registry comment)
- Add a new UI setting: uiStore.ts (StoredPrefs + UIState + setter), SettingsModal.tsx, CanvasEditor.tsx (useUIStore selector + CSS variable or prop)
- Add toolbar button: CanvasEditor.tsx, search for "canvas-toolbar"
- Add context menu item: CanvasEditor.tsx, search for "ctxMenu" or "elemCtxMenu"
- Modify node toolbar: canvasNodes.tsx, CanvasNodeToolbar component
- Add a new node type: canvasTranslation.ts (type maps) + canvasNodes.tsx (component) + CanvasEditor.tsx (NODE_TYPES) + App.css
```

#### 2. UPDATE: `.claude/research/canvas-integration.md`

Add a deprecation header at the top:

```
> **Note:** This file was written pre-implementation (planning phase). For the actual as-built architecture, see `docs/canvas-architecture.md`.
```

No other changes -- keep it for historical context.

#### 3. UPDATE: `CLAUDE.md`

Add one line to the Architecture section, after the existing Canvas mention:

```
Canvas architecture: `docs/canvas-architecture.md` (component hierarchy, data flow, translation layer, state management, extension points).
```

#### 4. NEW (optional): `docs/extension-guides/add-canvas-node-type.md` (~80 lines)

A focused checklist specifically for adding a 5th node type to the canvas. This follows the existing extension-guide pattern (like `add-file-type-editor.md`) and is justified because adding a node type touches 4 files in a specific order with non-obvious requirements.

**Section outline:**

```
# How to Add a Canvas Node Type

## Reference implementations
- CanvasTextNode — editable, shape-aware, most complex
- CanvasFileNode — reads from graphStore, simplest data flow
- CanvasLinkNode — minimal (good starting template)

## Checklist

### 1. Extend JSON Canvas types (canvasTranslation.ts)
- Add interface (JsonCanvasYourNode extends JsonCanvasNodeBase)
- Add to JsonCanvasNode union
- Add to CANVAS_TO_RF_TYPE and RF_TO_CANVAS_TYPE maps
- Add case to canvasToFlow switch
- Add case to flowToCanvas switch

### 2. Create the node component (canvasNodes.tsx)
- Inner component with NodeProps, destructure data
- Include Resizer, CanvasNodeToolbar, FourHandles
- Wrap with memo() for export
- Add nodrag class to any interactive elements (inputs, textareas)

### 3. Register the node type (CanvasEditor.tsx)
- Import component
- Add to NODE_TYPES object (must be module-level constant)

### 4. Add CSS (App.css)
- Node container class
- Match existing patterns for border-left accent color

### 5. (Optional) Add creation UI
- Context menu item in handlePaneContextMenu section
- Toolbar button if it's a primary creation action

### 6. Update tests
- canvasTranslation.test.ts: round-trip test
- CanvasEditor.test.tsx: ensure node type renders

### 7. Update documentation
- docs/canvas-architecture.md: node type table
- docs/CHANGELOG.md
```

### Level of Detail Rationale

- **`docs/canvas-architecture.md` (~300 lines):** This is deliberately comprehensive because the Canvas is the largest single feature in the frontend. The target reader is an agent that has never seen the codebase. Every section answers a "where is X?" or "how does X work?" question that would otherwise require reading 2,400 lines of source. The ASCII diagram and tables are dense but scannable. At 300 lines, it is comparable to `add-file-type-editor.md` (278 lines) and smaller than the feature it documents.

- **`add-canvas-node-type.md` (~80 lines):** Short and checklist-focused, matching the established extension guide pattern. This is optional -- the architecture doc's "Common Tasks Quick Reference" section partially covers this -- but a dedicated checklist prevents agents from missing the non-obvious steps (type maps in canvasTranslation.ts, parent ordering, handle ID conventions).

- **CLAUDE.md update (1 line):** Minimal. CLAUDE.md is already a dense pointer file. One line is enough to tell an agent "there is a Canvas reference doc, go read it."

### What NOT to Document

- CSS class names and their exact styles -- too granular, changes frequently, easily grep'd.
- Individual UI store setter implementations -- they all follow the same `set(...)` + `savePrefs()` pattern.
- The full CanvasEditor.test.tsx contents -- tests are their own documentation.
- React Flow API details -- agents can reference the library docs. The reference doc only covers BrainMap-specific usage patterns.

### Maintenance Strategy

The architecture doc should be updated when:
- A new node type is added (add to node type table)
- A new UI store setting is added (add to settings table)
- The save mechanics change (update auto-save section)
- A new keyboard shortcut is added (update shortcuts section)

The "Common Tasks Quick Reference" section at the bottom serves as a self-test: if an agent can find the right file and function for each listed task, the doc is still accurate. If any entry is wrong, it signals the doc needs an update.

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx` - Primary source to document (1313 lines, component hierarchy + state + save + UI)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx` - Second primary source (823 lines, all 4 node types + edge + shared components)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.ts` - Translation layer with type maps and position math (292 lines)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides/add-file-type-editor.md` - Pattern to follow for structure and tone (278 lines, established format)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/CLAUDE.md` - Needs one-line pointer update to reference new doc

---

