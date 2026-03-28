# BrainMap User Interaction Coverage for Visual Testing

## Status: Cataloged, Patterns Needed

**Date**: 2026-03-27
**Purpose**: Complete list of every user action in BrainMap, organized by area. Each action needs a corresponding pattern in the `tauri-mcp-navigate` skill so agents can automate it.

**Legend**:
- Covered = pattern exists in `.claude/skills/tauri-mcp-navigate/SKILL.md`
- Needs pattern = action is possible but no documented pattern yet
- Needs research = unclear if automatable via current tools

---

## 1. Global Keyboard Shortcuts

| Action | Shortcut | Covered? |
|--------|----------|----------|
| Close active tab | Cmd+W | Needs pattern |
| New untitled tab | Cmd+N | Needs pattern |
| Save current tab | Cmd+S | Needs pattern |
| Open command palette | Cmd+P | Needs pattern |
| Toggle left panel | Cmd+B | Needs pattern |
| Open settings | Cmd+, | Covered (sidebar click) |
| Navigate back | Cmd+[ | Needs pattern |
| Navigate forward | Cmd+] | Needs pattern |
| Zoom in | Cmd+= | Needs pattern |
| Zoom out | Cmd+- | Needs pattern |
| Reset zoom | Cmd+0 | Needs pattern |
| Undo | Cmd+Z | Needs pattern |
| Redo | Cmd+Shift+Z | Needs pattern |
| Refresh segment | Cmd+Shift+R | Needs pattern |
| Close dialogs | Escape | Needs pattern |

**Approach**: All keyboard shortcuts can be sent via `execute_js` dispatching `KeyboardEvent` on `document`, or by directly calling the store action that the shortcut triggers. Store actions are more reliable.

---

## 2. Sidebar Navigation

| Action | Covered? |
|--------|----------|
| Click Files tab | Covered |
| Click Graph tab | Covered (same pattern) |
| Click Search tab | Covered (same pattern) |
| Click Canvas tab | Covered (same pattern) |
| Click Settings | Covered (same pattern) |
| Click Close segment | Covered (same pattern) |

---

## 3. File Tree

| Action | Covered? |
|--------|----------|
| Expand folder | Covered |
| Collapse folder | Covered (same toggle) |
| Open file (note) | Covered |
| Open file (canvas) | Covered |
| Open file (excalidraw) | Covered (same pattern) |
| Open file (PDF) | Covered (same pattern) |
| Open file (image) | Covered (same pattern) |
| Open file (video) | Covered (same pattern) |
| List visible items | Covered |
| Find by path | Covered |
| Click "+" (new note) | Needs pattern |
| Click folder icon (new folder) | Needs pattern |
| Click collapse all | Needs pattern |
| Click refresh | Needs pattern |
| Filter/search in tree | Needs pattern |
| Right-click context menu | Needs pattern |
| Context: New Note Here | Needs pattern |
| Context: New Drawing Here | Needs pattern |
| Context: New Canvas Here | Needs pattern |
| Context: New Folder Here | Needs pattern |
| Context: Import Files Here | Needs pattern |
| Context: Focus in Graph | Needs pattern |
| Context: Rename | Needs pattern |
| Context: Move To | Needs pattern |
| Context: Show in Finder | Needs pattern |
| Context: Copy Relative Path | Needs pattern |
| Context: Copy Absolute Path | Needs pattern |
| Context: Delete | Needs pattern |
| Drag file to folder (reorder) | Needs research |
| Drag external files into tree | Needs research |
| Rename inline (double-click) | Needs pattern |

---

## 4. Editor (CodeMirror)

| Action | Covered? |
|--------|----------|
| Read editor content | Covered |
| Type text into editor | Needs pattern |
| Select text range | Needs pattern |
| Bold (Cmd+B in editor) | Needs pattern |
| Italic (Cmd+I) | Needs pattern |
| Strikethrough (Cmd+Shift+X) | Needs pattern |
| Inline code (Cmd+E) | Needs pattern |
| Insert link (Cmd+K) | Needs pattern |
| Heading 1 (Cmd+Shift+1) | Needs pattern |
| Heading 2 (Cmd+Shift+2) | Needs pattern |
| Heading 3 (Cmd+Shift+3) | Needs pattern |
| Slash command (type /) | Needs pattern |
| Wiki link autocomplete ([[) | Needs pattern |
| Tab/Shift+Tab list indent | Needs pattern |
| Undo/Redo in editor | Needs pattern |

**Approach**: CodeMirror has its own event handling. Best approach is `execute_js` accessing the CM view instance: `document.querySelector('.cm-content').__view` or via the CM EditorView API.

---

## 5. Editor Toolbar

| Action | Covered? |
|--------|----------|
| Click Bold button | Needs pattern |
| Click Italic button | Needs pattern |
| Click Strikethrough button | Needs pattern |
| Click Code button | Needs pattern |
| Click H1/H2/H3 buttons | Needs pattern |
| Click Bullet list button | Needs pattern |
| Click Numbered list button | Needs pattern |
| Click Blockquote button | Needs pattern |
| Click Link button | Needs pattern |
| Click HR button | Needs pattern |
| Click Table button | Needs pattern |
| Click Callout picker | Needs pattern |
| Switch Edit/Preview/Raw tabs | Needs pattern |
| Toggle line numbers | Needs pattern |
| Toggle focus mode | Needs pattern |

---

## 6. Tab Bar

| Action | Covered? |
|--------|----------|
| Click tab to switch | Needs pattern |
| Click close (x) on tab | Needs pattern |
| Click + to open new tab | Needs pattern |
| Right-click tab context menu | Needs pattern |
| Context: Close Tab | Needs pattern |
| Context: Close Tabs to Right | Needs pattern |
| Context: Close All Tabs | Needs pattern |
| Drag tab to reorder | Needs research |
| Check active tab | Covered |

---

## 7. Frontmatter / Metadata

| Action | Covered? |
|--------|----------|
| Edit title | Needs pattern |
| Change note type (dropdown) | Needs pattern |
| Change status (dropdown) | Needs pattern |
| Add tag | Needs pattern |
| Remove tag | Needs pattern |
| Edit source field | Needs pattern |
| Edit summary field | Needs pattern |
| Add extra field | Needs pattern |
| Edit extra field | Needs pattern |
| Remove extra field | Needs pattern |
| Undo/redo frontmatter | Needs pattern |

---

## 8. Links Editor

| Action | Covered? |
|--------|----------|
| Click linked note (navigate) | Needs pattern |
| Remove link (click x) | Needs pattern |
| Add link (type + autocomplete) | Needs pattern |
| Select relationship type | Needs pattern |
| Confirm link (Enter/Add) | Needs pattern |

---

## 9. Canvas Editor (React Flow)

| Action | Covered? |
|--------|----------|
| Pan viewport | Covered (d3-zoom) |
| Zoom in | Covered (d3-zoom + controls) |
| Zoom out | Covered (d3-zoom + controls) |
| Fit view | Covered |
| Get viewport state | Covered |
| List all nodes | Covered |
| Click a node by text | Covered |
| Click toolbar buttons | Covered |
| Switch to Pan mode | Covered (toolbar) |
| Switch to Select mode | Covered (toolbar) |
| Add text card | Covered (toolbar) |
| Add note reference | Needs pattern |
| Add link node | Needs pattern |
| Add group node | Needs pattern |
| Add shape (via picker) | Needs pattern |
| Select a node | Needs pattern |
| Multi-select nodes | Needs research |
| Move/drag a node | Needs research |
| Resize a node | Needs research |
| Delete selected node | Needs pattern |
| Duplicate node | Needs pattern |
| Edit node text inline | Needs pattern |
| Right-click context menu on node | Needs pattern |
| Right-click context menu on canvas | Needs pattern |
| Change node color | Needs pattern |
| Edit edge label | Needs pattern |
| Delete edge | Needs pattern |
| Group selected nodes | Needs pattern |
| Ungroup nodes | Needs pattern |
| Canvas fullscreen toggle | Covered (toolbar) |
| Show keyboard shortcuts | Covered (toolbar) |
| Toggle file browser in canvas | Needs pattern |

---

## 10. Search Panel

| Action | Covered? |
|--------|----------|
| Type search query | Needs pattern |
| Filter by type | Needs pattern |
| Click search result | Needs pattern |
| Clear search | Needs pattern |

---

## 11. Graph View

| Action | Covered? |
|--------|----------|
| Click node (select + open) | Needs pattern |
| Pan graph | Needs research |
| Zoom graph | Needs research |
| Change layout (dropdown) | Needs pattern |
| Toggle edge labels | Needs pattern |
| Toggle legend | Needs pattern |
| Filter edge types | Needs pattern |
| Toggle minimap | Needs pattern |
| Toggle cluster hulls | Needs pattern |
| Toggle edge particles | Needs pattern |
| Exit focus mode | Needs pattern |
| Go to home note | Needs pattern |

**Note**: Graph uses Cytoscape.js, not React Flow. Interaction patterns will differ from canvas.

---

## 12. Settings Modal

| Action | Covered? |
|--------|----------|
| Open settings | Covered (sidebar) |
| Close settings (x / Escape) | Needs pattern |
| Change theme | Needs pattern |
| Change fonts | Needs pattern |
| Change font sizes | Needs pattern |
| Toggle editor options | Needs pattern |
| Adjust canvas settings | Needs pattern |
| Reset to defaults | Needs pattern |

---

## 13. Dialogs

| Action | Covered? |
|--------|----------|
| Create Note dialog: fill + submit | Needs pattern |
| Create Folder dialog: fill + submit | Needs pattern |
| Move To dialog: select + confirm | Needs pattern |
| Convert to Note dialog: fill + submit | Needs pattern |
| Unsaved Changes dialog: Save/Discard/Cancel | Needs pattern |
| Confirm Delete dialog: Delete/Cancel | Needs pattern |
| Undo toast: click Undo | Needs pattern |

---

## 14. Command Palette

| Action | Covered? |
|--------|----------|
| Open palette (Cmd+P) | Needs pattern |
| Type to filter | Needs pattern |
| Arrow navigate results | Needs pattern |
| Select result (Enter/click) | Needs pattern |
| Close palette (Escape) | Needs pattern |

---

## 15. Segment Picker

| Action | Covered? |
|--------|----------|
| Click segment to open | Needs pattern |
| Add new segment (open folder) | Needs research |
| Rename segment | Needs pattern |
| Remove segment | Needs pattern |

---

## 16. Image Viewer

| Action | Covered? |
|--------|----------|
| Zoom in/out | Needs pattern |
| Reset zoom | Needs pattern |
| Pan (drag when zoomed) | Needs research |

---

## 17. PDF Viewer

| Action | Covered? |
|--------|----------|
| Navigate pages | Needs pattern |
| Jump to page | Needs pattern |
| Zoom in/out | Needs pattern |
| Create highlight | Needs research |
| Change highlight color | Needs pattern |
| Remove highlight | Needs pattern |
| Search PDF | Needs pattern |

---

## 18. Video Viewer

| Action | Covered? |
|--------|----------|
| Play/pause | Needs pattern |
| Scrub timeline | Needs research |
| Change playback speed | Needs pattern |
| Volume control | Needs pattern |
| Toggle fullscreen | Needs pattern |

---

## 19. Excalidraw Editor

| Action | Covered? |
|--------|----------|
| Select drawing tool | Needs pattern |
| Draw shapes | Needs research |
| Select/move shapes | Needs research |
| Delete shapes | Needs pattern |
| Undo/redo | Needs pattern |
| Change colors/styles | Needs pattern |

**Note**: Excalidraw has its own complex internal state. May need to access `window.EXCALIDRAW_API` or similar.

---

## 20. Drag & Drop

| Action | Covered? |
|--------|----------|
| Drag file in tree to folder | Needs research |
| Drag external files into app | Needs research |
| Drag tab to reorder | Needs research |
| Drag canvas node | Needs research |
| Drag to resize canvas node | Needs research |
| Drag panel splitter to resize | Needs research |

**Note**: All drag operations require real pointer events with `setPointerCapture`. Synthetic events don't work. The `mouse_action(drag)` tool may work for some but failed for React Flow. Each needs individual testing.

---

## Summary

| Area | Total Actions | Covered | Needs Pattern | Needs Research |
|------|--------------|---------|---------------|----------------|
| Global shortcuts | 15 | 1 | 14 | 0 |
| Sidebar | 6 | 6 | 0 | 0 |
| File tree | 31 | 7 | 21 | 3 |
| Editor (CM) | 16 | 1 | 15 | 0 |
| Editor toolbar | 15 | 0 | 15 | 0 |
| Tab bar | 10 | 1 | 8 | 1 |
| Frontmatter | 11 | 0 | 11 | 0 |
| Links editor | 5 | 0 | 5 | 0 |
| Canvas | 32 | 12 | 16 | 4 |
| Search | 4 | 0 | 4 | 0 |
| Graph | 12 | 0 | 10 | 2 |
| Settings | 8 | 1 | 7 | 0 |
| Dialogs | 7 | 0 | 7 | 0 |
| Command palette | 5 | 0 | 5 | 0 |
| Segment picker | 4 | 0 | 3 | 1 |
| Image viewer | 3 | 0 | 2 | 1 |
| PDF viewer | 7 | 0 | 5 | 2 |
| Video viewer | 5 | 0 | 4 | 1 |
| Excalidraw | 6 | 0 | 3 | 3 |
| Drag & drop | 6 | 0 | 0 | 6 |
| **TOTAL** | **208** | **29** | **155** | **24** |

---

## Priority Order for Adding Patterns

### Tier 1: Core Navigation (most useful for feature testing)
1. File tree: context menus, new note/folder, rename, delete
2. Tab bar: switch, close, new tab
3. Editor: type text, read content (already covered)
4. Canvas: add nodes, delete nodes, edit node text
5. Keyboard shortcuts via store actions
6. Dialogs: create note, confirm delete

### Tier 2: Feature Verification
7. Frontmatter editing
8. Links editor
9. Search panel
10. Graph view interactions
11. Settings modal
12. Command palette

### Tier 3: Specialized Editors
13. PDF viewer
14. Image viewer
15. Video viewer
16. Excalidraw editor

### Tier 4: Complex Interactions (may need tool improvements)
17. All drag & drop operations
18. Canvas node drag/resize
19. Panel resizing
20. Tab reordering
