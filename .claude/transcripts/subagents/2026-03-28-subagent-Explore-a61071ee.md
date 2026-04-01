# 2026-03-28 — Subagent Transcript: Explore

**Date:** 2026-03-28 12:33:19
**Agent:** Explore
**Agent ID:** a61071eef486e9a0f
**Parent Session:** 51b5ae26-5523-47aa-aa29-7a42f626f8b5

---

## User

We have a bug where dragging files in the file tree causes text selection highlighting across tree items. The tree uses mouse-based drag (mousedown/mousemove/mouseup) instead of HTML5 drag events.

CSS `user-select: none` is already applied to both `.file-tree-content` and `.tree-item`, yet the selection still appears.

I need to understand:

1. Read `crates/app/src/components/Layout/FileTreePanel.tsx` — focus on the `handleTreeItemMouseDown` and `handleMouseMoveForDrag` handlers. Specifically check:
   - When is `e.preventDefault()` called on mousedown vs mousemove?
   - Is there a `selectstart` event that should be prevented?
   - Are the mousedown events on the tree items calling `preventDefault`?

2. Read the CSS in `crates/app/src/App.css` — search for `user-select` to see all rules. Also search for `-webkit-user-select`. On macOS WKWebView, sometimes only `-webkit-user-select` works.

3. Think about WHY `user-select: none` might not work:
   - WKWebView on macOS may require `-webkit-user-select: none` (Webkit prefix)
   - The selection might be happening at the `window` or `document` level, not within the tree
   - The `mousedown` → `mousemove` pattern without `preventDefault` on mousedown allows the browser to start a selection gesture
   - The `selectstart` event fires on mousedown and must be prevented to stop selection

4. Check if there are any elements BETWEEN .file-tree-content and .tree-item that don't have user-select: none (like wrapper divs)

Report your findings thoroughly.

---

## Assistant

I'll start by examining the FileTreePanel component and CSS to understand the drag selection issue.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Let me search more strategically for the relevant sections.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"handleTreeItemMouseDown|handleMouseMoveForDrag","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"user-select|webkit-user-select","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content"}`

---

## Assistant

Good. Now let me search for the handlers and get context around the mouse event handlers:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"handleTreeItemMouseDown|handleMouseMoveForDrag|preventDefault|selectstart","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_m`

---

## Assistant

Now let me look at the actual CSS classes to see which ones have user-select applied:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.file-tree-content|\\.tree-item","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","context":3}`

---

## Assistant

Now let me check for the `selectstart` event handler and look for any wrapper elements between the container and items:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"selectstart|onSelectStart|addEventListener.*select","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"file-tree|tree-item","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content","context":2,"head_limit":40}`

---

## Assistant

Let me look at the JSX structure around the file-tree-content container to see what divs wrap the tree items:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":1800,"limit":100}`

---

## Assistant

Now let me look more closely at the handleTreeItemMouseDown function to understand what event handling is there:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":1244,"limit":70}`

---

## Assistant

Now let me check what the initial mousedown actually does - it looks like there's no `preventDefault()` call on mousedown. Let me verify:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"onMouseDown.*\\{|handleTreeItemMouseDown.*=>|onMouseDown=.*handleTreeItemMouseDown","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx",`

---

## Assistant

I see there's also an `onMouseDown` on line 258. Let me check that:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":255,"limit":30}`

---

## Assistant

That's just context menu handling. Let me check CSS more thoroughly to see if there's any webkit-specific rules and check if there are any intermediate wrapper elements without user-select:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":4640,"limit":50}`

---

## Assistant

Let me look at the area around file-tree-content and tree-item CSS to see all the rules and check if there are any global styles that override:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":2571,"limit":80}`

---

## Assistant

Perfect! Now let me look at the main container and global styles to see if there's anything that might be overriding user-select:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.file-tree\\s*\\{|body|html","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","context":3,"head_limit":50}`

---

## Assistant

Now let me search for the file-tree container itself (not file-tree-content):

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"^\\.file-tree\\s*\\{|file-tree-panel","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","context":5}`

---

## Assistant

Now let me look for any elements between the FileTreePanel and the .tree-item elements in the TSX structure. Let me also check how the tree items are structured with their child components:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":720,"limit":60}`

---

## Assistant

I see a `tree-children-anim` wrapper. Let me check if that has user-select applied:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"tree-children-anim|tree-children-anim-inner","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","context":5}`

---

## Assistant

Found it! The `tree-children-anim` and `tree-children-anim-inner` wrapper divs do NOT have `user-select: none` applied. This is a problem because these intermediate wrapper elements don't inherit the parent's user-select setting in all browsers.

Let me also check if there are any issues in how handleMouseMoveForDrag handles preventDefault:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":998,"limit":50}`

---

## Assistant

Now, let me verify the key issue: **handleTreeItemMouseDown does NOT call preventDefault() on mousedown**. Let me check that critical detail:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":1244,"limit":55}`

---

## Assistant

Perfect! Now I have all the information I need. Let me create a comprehensive report:

## Findings Report: File Tree Drag Selection Issue

Based on my thorough analysis of the FileTreePanel component and App.css, I've identified **multiple root causes** for the text selection highlighting during drag operations:

### **1. Missing `preventDefault()` on Mousedown (CRITICAL)**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx` (lines 1245-1296)

**Issue:** The `handleTreeItemMouseDown` function does NOT call `e.preventDefault()` at mousedown. This is the critical issue:

- When `mousedown` fires without `preventDefault()`, the browser initiates a text selection gesture
- The browser then fires the `selectstart` event, which is NOT being prevented anywhere
- Even though `mousemove` calls `e.preventDefault()` (line 1014), it's already too late—the selection has begun on mousedown

**Current Flow:**
```
mousedown → [no preventDefault] → selectstart event → mousemove [preventDefault called too late]
```

### **2. Missing `selectstart` Event Prevention**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`

**Issue:** There is NO `selectstart` event listener anywhere in the component. The `selectstart` event fires during the initial mousedown and must be explicitly prevented. CSS `user-select: none` alone doesn't prevent selection if the user is actively dragging with the mouse.

### **3. Missing `-webkit-user-select: none` on Intermediate Wrapper Elements**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` (lines 2764-2775)

**Critical Gap:** The `.tree-children-anim` and `.tree-children-anim-inner` wrapper divs DO NOT have `user-select: none` applied:

```css
/* Current CSS - MISSING user-select */
.tree-children-anim {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 150ms ease;
  /* ← user-select: none is missing here */
}

.tree-children-anim-inner {
  overflow: hidden;
  min-height: 0;
  /* ← user-select: none is missing here */
}
```

These intermediate wrappers are between `.file-tree-content` (which has `user-select: none`) and `.tree-item` (which also has `user-select: none`). On macOS WKWebView, these intermediate elements can break the selection-none inheritance chain.

### **4. Missing `-webkit-user-select` Prefix on File Tree Rules**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

**Issue:** The file tree CSS uses only `user-select: none` (lines 2575 and 2589), but does NOT use the `-webkit-user-select: none` prefix. On macOS WKWebView, the WebKit prefix is critical for selection prevention.

**Comparison with what DOES work in the codebase:**
```css
/* PDF textLayer - line 4642-4644 (WORKS) */
.textLayer span[role="img"] {
  -webkit-user-select: none;  /* ← WebKit prefix present */
  -moz-user-select: none;
  user-select: none;
}

/* File tree - line 2575 (BROKEN) */
.file-tree-content {
  user-select: none;  /* ← Missing WebKit prefix! */
}
```

### **5. No Wrapper Div User-Select Coverage**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

The outer `.file-tree-panel` container (line 2490) also does NOT have `user-select: none`. While not the direct cause, this creates gaps in coverage.

---

## Summary of Issues

| Issue | Location | Severity |
|-------|----------|----------|
| No `preventDefault()` on mousedown | FileTreePanel.tsx:1245 | **CRITICAL** |
| No `selectstart` event listener | FileTreePanel.tsx | **CRITICAL** |
| Missing `-webkit-user-select` on file tree classes | App.css:2575, 2589 | **HIGH** |
| Intermediate wrapper divs lack `user-select: none` | App.css:2764-2775 | **HIGH** |
| `.file-tree-panel` lacks `user-select: none` | App.css:2490 | **MEDIUM** |

The combination of missing event prevention AND missing WebKit CSS prefixes creates a perfect storm for text selection on drag in WKWebView.

---

