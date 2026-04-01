# 2026-03-10 — Subagent Transcript: Explore

**Date:** 2026-03-10 15:39:47
**Agent:** Explore
**Agent ID:** aba627a60ac0c809b
**Parent Session:** 5ee4c9d5-92e1-4662-83cb-0ee187b89703

---

## User

In the BrainMap app at `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src`, I need to understand exactly how the editor panel is laid out and how focus mode works. The symptom: the MarkdownPreview content gets cropped (no scroll) when the editor is expanded or in focus mode.

Please read ALL of these files fully:
1. `src/components/Layout/AppLayout.tsx` (or wherever the main layout lives — check `src/App.tsx` and `src/components/Layout/` directory)
2. `src/stores/uiStore.ts` — how focusMode works
3. `src/App.css` — ALL CSS rules for: `.app-layout`, `.app-container`, `.main-content`, `.right-panel`, `.editor-panel`, `.editor-body`, `.center-panel`, any Panel/PanelGroup wrappers, and focus mode rules (search for "focus")

I need to understand:
- The complete ancestor chain from `body` → down to `.editor-body`
- Which elements have explicit height/overflow constraints
- How focus mode changes the layout (CSS class toggles? conditional rendering?)
- Whether `react-resizable-panels` Panel components add any height constraints
- Any `overflow: hidden` on ancestors that might be clipping content differently

Report every relevant CSS rule with line numbers and describe the complete layout tree.

---

## Assistant

I'll help you understand the editor panel layout and focus mode behavior. Let me read all the relevant files.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"*.tsx\" -o -name \"*.ts\" -o -name \"*.css\" | head -30"}`

---

## Assistant

Now let me read the key files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Now let me read the EditorPanel and MarkdownPreview files to understand the full structure:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx"}`

---

## Assistant

Now let me check the main.tsx and how the app mounts to understand the full DOM tree:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/main.tsx"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri -name \"index.html\" -o -name \"*.html\" | head -5"}`

---

## Assistant

Perfect! Now I have all the information I need. Let me compile a comprehensive layout analysis report.

## Complete Editor Panel Layout Analysis

### DOM Tree: Ancestor Chain from body → .editor-body

```
<html data-theme="light" | "dark">
  └─ <body>
       └─ <div id="root" className="app">
            └─ <div className="app-layout"> (Group, orientation="horizontal")
                 ├─ <Panel id="graph">
                 │    └─ <div className="panel">
                 │         ├─ <div className="left-panel-tabs">
                 │         ├─ <div id="left-graph-panel" | "left-files-panel">
                 │         │    └─ GraphView or FileTreePanel
                 │         └─ </div>
                 │    └─ </div>
                 ├─ <Separator className="resize-handle-h">
                 └─ <Panel id="right">
                      └─ <Group orientation="vertical">
                           ├─ <Panel id="editor">
                           │    └─ <div className="panel">
                           │         └─ <div className="panel-content">
                           │              └─ <EditorPanel>
                           │                   └─ <div className="editor-panel">
                           │                        ├─ <div className="editor-header-bar">
                           │                        ├─ <FrontmatterForm>
                           │                        ├─ <div className="editor-body">
                           │                        │    ├─ <MarkdownEditor> (CodeMirror 6)
                           │                        │    └─ <MarkdownPreview>
                           │                        │         └─ <div className="md-preview">
                           │                        └─ <RelatedNotesFooter>
                           │         └─ </div>
                           │    └─ </div>
                           ├─ <Separator className="resize-handle-v">
                           └─ <Panel id="search" collapsible>
                                └─ <div className="panel">
                                     └─ <div className="panel-content">
                                          └─ <SearchPanel>
            └─ <StatusBar />
```

---

### Critical Height/Overflow Constraints in the Layout

#### 1. **Top Level: `.app` (line 54-59)**
```css
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;              /* Full viewport height */
  overflow: hidden;           /* CRITICAL: Hides overflow */
}
```
**Impact:** Establishes the 100vh container. `.app-layout` is a child flex item.

#### 2. **Main Layout Container: `.app-layout` (line 62-64)**
```css
.app-layout {
  height: 100%;               /* 100% of .app (which is 100vh) */
}
```
**Impact:** The Group from react-resizable-panels fills 100% of remaining height after StatusBar subtraction.

#### 3. **Panel Base Styles: `.panel` (line 66-75)**
```css
.panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;           /* CRITICAL: Overflow clipped */
  border-right: 1px solid var(--border-color);
}
```
**Impact:** Every panel wrapping (both left and right) has `overflow: hidden`. This is the culprit for the editor preview cropping.

#### 4. **Panel Content: `.panel-content` (line 89-92)**
```css
.panel-content {
  flex: 1;                    /* Grows to fill available space */
  overflow: auto;             /* Allows scrolling inside */
}
```
**Impact:** `.panel-content` is the scrollable container inside `.panel`.

#### 5. **Editor Panel Container: `.editor-panel` (line 172-176)**
```css
.editor-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}
```
**Impact:** Flex column taking 100% of its parent (which is `.panel-content`).

#### 6. **Editor Body: `.editor-body` (line 250-254)**
```css
.editor-body {
  flex: 1;                    /* Grows to fill remaining space */
  min-height: 0;              /* CRITICAL: Allows flex child to shrink below content */
  overflow: auto;             /* Allows internal scrolling */
}
```
**Impact:** This should allow scroll, but it's constrained by ancestors.

---

### How Focus Mode Works (uiStore.ts)

**Focus Mode State (line 52, 135, 170):**
```typescript
focusMode: boolean;                          // Initially false
toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode }))
```

**Effect in AppLayout.tsx (lines 30-36):**
```typescript
useEffect(() => {
  if (focusMode) {
    graphPanelRef.current?.collapse();       // Collapses left graph panel
  } else {
    graphPanelRef.current?.expand();         // Expands left graph panel
  }
}, [focusMode, graphPanelRef]);
```

**CSS Impact:** NO direct CSS class toggle for focus mode. The only layout change is:
- `focusMode: true` → Left panel collapses via `graphPanelRef.current?.collapse()`
- This increases available width for the right editor panel
- No additional height constraints are applied

---

### React-Resizable-Panels (Panel/Group/Separator)

**Key Behaviors:**
- `<Panel>` is a flex child that gets a flex size based on `defaultSize`
- `<Group>` orientation controls flex-direction (horizontal = row, vertical = column)
- `<Separator>` is a flex-shrink: 0 divider for resizing
- Panels can `collapse()` or `expand()` programmatically

**In AppLayout.tsx:**
- **Outer Group** (horizontal): graph panel | separator | right panel
  - Right panel gets `defaultSize="40%"` (line 134)
  - Graph panel gets `defaultSize="60%"` (line 80)
  
- **Inner Group** (vertical, inside right panel): editor | separator | search
  - Editor panel gets `defaultSize="60%"` (line 139)
  - Search panel gets `defaultSize="40%"` (line 149)

**Panel Wrapper Divs (AppLayout.tsx lines 85, 140, 155):**
```tsx
<Panel id="editor">
  <div className="panel" style={{ height: "100%" }}>
    <div className="panel-content">
      <EditorPanel />
    </div>
  </div>
</Panel>
```
**Issue:** The inline style `height: "100%"` on `.panel` locks the panel height, but `.panel` has `overflow: hidden` (CSS).

---

## The Root Cause: Layout Bottleneck Chain

When MarkdownPreview content gets cropped with no scroll:

1. **`.app-layout`** → height: 100% (of 100vh container)
2. **Right `<Panel>`** → Gets flex width from Group
3. **`.panel`** wrapper → height: 100%, **overflow: hidden** ← CONSTRAINT
4. **`.panel-content`** → flex: 1, overflow: auto
5. **`.editor-panel`** → height: 100%, flex column
6. **`.editor-header-bar`** → flex-shrink: 0 (doesn't compress)
7. **`.frontmatter-form`** (FrontmatterForm) → flex-shrink: 0 (doesn't compress)
8. **`.editor-body`** → flex: 1, min-height: 0, **overflow: auto**
9. **`.md-preview`** → padding: 16px 20px (no height constraint)

### Why Preview Gets Cropped:

When **editor is expanded** (e.g., after dragging the resize handle up):
- The `.editor-body` flex: 1 tries to grow
- But its parent `.editor-panel` is locked to height: 100% of `.panel-content`
- And `.panel-content` is inside `.panel` which has `overflow: hidden`
- The `.md-preview` content overflows `.editor-body`, and because `.panel` clips it, **no scrollbar appears**

**The chain of responsibility:**
- `.panel` (overflow: hidden) clips children
- `.panel-content` (overflow: auto) should scroll, but its overflow is masked by parent
- `.editor-body` (overflow: auto) should scroll, but content is clipped before reaching it

---

### CSS Rules Summary with Line Numbers

| Rule | Line | Constraint | Impact |
|------|------|-----------|--------|
| `.app` | 54-59 | `height: 100vh; overflow: hidden` | Root container |
| `.app-layout` | 62-64 | `height: 100%` | Takes full app height |
| `.panel` | 66-75 | `overflow: hidden` | **CLIPS OVERFLOW** |
| `.panel-content` | 89-92 | `flex: 1; overflow: auto` | Scrollable region (masked) |
| `.editor-panel` | 172-176 | `height: 100%` | Flex column in `.panel-content` |
| `.editor-body` | 250-254 | `flex: 1; min-height: 0; overflow: auto` | Should scroll (clipped) |
| `.md-preview` | 695-702 | `padding: 16px 20px` | Content container (no height limit) |

---

## What Changes on Focus Mode vs Normal

**Layout-wise:** Focus mode only collapses the left graph panel. It does NOT:
- Add any CSS classes that change editor overflow behavior
- Add height constraints or remove them
- Change the scroll behavior of `.editor-body` or `.md-preview`

The **cropping symptom persists equally in both modes** because the bottleneck is in `.panel` having `overflow: hidden`, not in focus mode specifically.

---

## Summary

The MarkdownPreview content is cropped because:

1. **`.panel` has `overflow: hidden`** — This clips any content that exceeds its bounds
2. **Ancestor height constraints lock the space** — `.panel` is sized by react-resizable-panels flex logic, and when the editor is expanded vertically, the fixed header sizes (`.editor-header-bar`, `.frontmatter-form`) consume space that should be available to `.editor-body`
3. **`.editor-body` overflow: auto is ineffective** — The scroll works internally, but the content is already clipped at the `.panel` level, so no scrollbar appears
4. **Focus mode doesn't help** — It only collapses the left panel (horizontal space), not the vertical constraints

The fix would involve either:
- Removing `overflow: hidden` from `.panel` (but this breaks the layout container model)
- Ensuring `.panel-content` truly captures the overflow instead of `.panel` (restructure)
- Making header elements shrinkable in edit/preview modes
- Explicitly allowing overflow to bubble up through the panel hierarchy when in preview mode

---

